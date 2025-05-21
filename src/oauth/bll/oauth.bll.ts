import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MicroserviceCommand,
  MicroservicePayloadDTO,
} from 'artifacts/microservices/common/dto/microservice-payload.dto';
import { TCP_SERVICE } from 'artifacts/microservices/tcp/tcp.constants';
import * as CryptoJS from 'crypto-js';
import { lastValueFrom } from 'rxjs';
import { ApplicationScopeDTO } from 'src/oauth-bundle/application-scope/dto/application-scope.dto';
import { VIEW } from 'src/oauth-bundle/application-scope/repositories/application-scope.repository';
import { ApplicationDTO } from 'src/oauth-bundle/application/dto/application.dto';
import { ScopeMasterDTO } from 'src/oauth-bundle/scope-master/dto/scope-master.dto';
import { TEMP_AUTH_CODE_STATUS, TMPAuthCodeDTO } from 'src/oauth-bundle/tmp-auth-code/dto/tmp-auth-code.dto';
import * as uniqid from 'uniqid';
import { AuthorizationDTO } from '../dto/authorization.dto';
import { OAuthService } from '../oauth.service';

@Injectable()
export class OAuthBLL {
  constructor(
    @Inject(TCP_SERVICE) private readonly client: ClientProxy,
    @Inject(forwardRef(() => OAuthService))
    private readonly oAuthService: OAuthService,
  ) { }

  async getApplication(clientId: string): Promise<ApplicationDTO> {
    const pattern = { cmd: 'event' };

    const command = new MicroserviceCommand();
    command.partialParams = ['clientId'];

    const payload = new MicroservicePayloadDTO();
    payload.service = 'applicationservice';
    payload.event = 'readByClientId';
    payload.command = command;
    payload.data = {
      clientId: clientId,
    };

    const applicationDTO = await lastValueFrom(
      this.client.send<ApplicationDTO>(pattern, payload),
    );

    return applicationDTO;
  }

  async getApplicationScope(
    authorizationDTO: AuthorizationDTO,
  ): Promise<ApplicationScopeDTO> {
    const pattern = { cmd: 'event' };

    const command = new MicroserviceCommand();
    command.partialParams = ['view', 'clientId'];

    const payload = new MicroservicePayloadDTO();
    payload.service = 'applicationscopeservice';
    payload.event = 'readByClientId';
    payload.command = command;
    payload.data = {
      view: VIEW.APPLICATION_SCOPE,
      clientId: authorizationDTO.clientId,
    };

    const applicationScopeDTO = await lastValueFrom(
      this.client.send<ApplicationScopeDTO>(pattern, payload),
    );
    return applicationScopeDTO;
  }

  async getApplicationScopeWithSecret(
    clientId: string,
    clientSecret: string,
  ): Promise<ApplicationScopeDTO> {
    const pattern = { cmd: 'event' };

    const command = new MicroserviceCommand();
    command.partialParams = ['view', 'clientId', 'clientSecret'];

    const payload = new MicroservicePayloadDTO();
    payload.service = 'applicationscopeservice';
    payload.event = 'readByClientIdSecret';
    payload.command = command;
    payload.data = {
      view: VIEW.APPLICATION_SCOPE,
      clientId: clientId,
      clientSecret: clientSecret,
    };

    const applicationScopeDTO = await lastValueFrom(
      this.client.send<ApplicationScopeDTO>(pattern, payload),
    );

    return applicationScopeDTO;
  }

  async storeTMPAuthCode(
    applicationScopeDTO: ApplicationScopeDTO,
  ): Promise<TMPAuthCodeDTO> {
    const tmpAuthCodeDTO = new TMPAuthCodeDTO();
    tmpAuthCodeDTO.appId = applicationScopeDTO.id;
    tmpAuthCodeDTO.userId = applicationScopeDTO.userId;
    tmpAuthCodeDTO.code = uniqid();
    tmpAuthCodeDTO.status = TEMP_AUTH_CODE_STATUS.INCOMPLETE;

    const sha256 = CryptoJS.HmacSHA256(applicationScopeDTO.clientId + '###' + tmpAuthCodeDTO.code,
      applicationScopeDTO.clientSecret,
    );
    const signature = CryptoJS.enc.Hex.stringify(sha256);

    tmpAuthCodeDTO.encryptedAuthData = signature
    tmpAuthCodeDTO.authToken = {};
    tmpAuthCodeDTO.authToken.scopes = [];

    for (let i = 0; i < applicationScopeDTO.scopes.length; i++) {
      const scope = {
        scope: applicationScopeDTO.scopes[i].scope,
        hostName: applicationScopeDTO.scopes[i].hostName,
        urlPath: applicationScopeDTO.scopes[i].urlPath,
      };
      tmpAuthCodeDTO.authToken.scopes.push(scope);
      if (applicationScopeDTO.scopes[i].type !== 'auth') {
        continue;
      }
      tmpAuthCodeDTO.authToken.jwtTokenSecret = applicationScopeDTO.scopes[i].jwtTokenSecret;
      tmpAuthCodeDTO.authToken.jwtRefreshTokenSecret =
        applicationScopeDTO.scopes[i].jwtRefreshTokenSecret;
    }

    // update expired date in next 30 mins
    tmpAuthCodeDTO.expiredAt = new Date(Date.now() + 30 * 60 * 1000);

    const pattern = { cmd: 'event' };

    const command = new MicroserviceCommand();
    command.partialParams = ['tmpAuthCodeDTO'];

    const payload = new MicroservicePayloadDTO();
    payload.service = 'tmpauthcodeservice';
    payload.event = 'create';
    payload.command = command;
    payload.data = {
      tmpAuthCodeDTO: tmpAuthCodeDTO,
    };

    const tmpAuthCodeInsertedDTO = await lastValueFrom(
      this.client.send<TMPAuthCodeDTO>(pattern, payload),
    );

    return tmpAuthCodeInsertedDTO;
  }

  async getTMPAuthCodeByUserId(
    appId: number,
    userId: string,
  ): Promise<TMPAuthCodeDTO> {
    const pattern = { cmd: 'event' };

    const command = new MicroserviceCommand();
    command.partialParams = ['appId', 'userId'];

    const payload = new MicroservicePayloadDTO();
    payload.service = 'tmpauthcodeservice';
    payload.event = 'readByAppIdAndUserId';
    payload.command = command;
    payload.data = {
      appId: appId,
      userId: userId,
    };

    const tmpAuthCodeDTO = await lastValueFrom(
      this.client.send<TMPAuthCodeDTO>(pattern, payload),
    );

    return tmpAuthCodeDTO;
  }

  async getTMPAuthCodeByCode(
    appId: number,
    code: string,
  ): Promise<TMPAuthCodeDTO> {
    const pattern = { cmd: 'event' };

    const command = new MicroserviceCommand();
    command.partialParams = ['appId', 'code'];

    const payload = new MicroservicePayloadDTO();
    payload.service = 'tmpauthcodeservice';
    payload.event = 'readByAppIdAndCode';
    payload.command = command;
    payload.data = {
      appId: appId,
      code: code,
    };

    const tmpAuthCodeDTO = await lastValueFrom(
      this.client.send<TMPAuthCodeDTO>(pattern, payload),
    );

    return tmpAuthCodeDTO;
  }

  async updateTMPAuthcode(
    tmpAuthCodeDTO: TMPAuthCodeDTO,
  ): Promise<TMPAuthCodeDTO> {
    const pattern = { cmd: 'event' };

    const command = new MicroserviceCommand();
    command.partialParams = ['updateDTO'];

    const payload = new MicroservicePayloadDTO();
    payload.service = 'tmpauthcodeservice';
    payload.event = 'update';
    payload.command = command;
    payload.data = {
      updateDTO: tmpAuthCodeDTO,
    };

    const tmpAuthCodeUpdatedDTO = await lastValueFrom(
      this.client.send<TMPAuthCodeDTO>(pattern, payload),
    );

    return tmpAuthCodeUpdatedDTO;
  }

  async deleteTMPAuthcode(id: number,): Promise<number> {
    const pattern = { cmd: 'event' };

    const command = new MicroserviceCommand();
    command.partialParams = ['id'];

    const payload = new MicroservicePayloadDTO();
    payload.service = 'tmpauthcodeservice';
    payload.event = 'delete';
    payload.command = command;
    payload.data = { id: id };

    const tmpAuthCodeDeleteCount = await lastValueFrom(
      this.client.send<number>(pattern, payload),
    );

    return tmpAuthCodeDeleteCount;
  }

  async getScopeMaster(scope: string): Promise<ScopeMasterDTO> {
    const pattern = { cmd: 'event' };

    const command = new MicroserviceCommand();
    command.partialParams = ['scope'];

    const payload = new MicroservicePayloadDTO();
    payload.service = 'scopemasterservice';
    payload.event = 'readByScope';
    payload.command = command;
    payload.data = {
      scope: scope,
    };

    const scopeMasterDTO = await lastValueFrom(
      this.client.send<ScopeMasterDTO>(pattern, payload),
    );

    return scopeMasterDTO;
  }
}
