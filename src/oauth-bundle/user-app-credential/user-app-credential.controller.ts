import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { ResponseException } from 'src/common/exception/response.exception';
import { UserAppCredentialDTO, UserAppCredentialUnassignmentDTO } from './dto/user-app-credential.dto';
import { UserAppCredentialService } from './user-app-credential.service';

@ApiBearerAuth()
@ApiTags('User App Credential')
@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/user-app-credential')
export class UserAppCredentialController {
  constructor(private readonly userAppCredentialService: UserAppCredentialService) { }

  @Get('/:userId/:appId')
  @ApiExcludeEndpoint()
  get(@Param('userId') userId: string, @Param('appId') appId: string): Promise<ResponseDTO<UserAppCredentialDTO>> {
    return this.userAppCredentialService
      .getUserCredential(parseInt(userId), parseInt(appId))
      .then((result) => {
        if (!result) {
          throw new ResponseException('User not found');
        }
        const response = new ResponseDTO<UserAppCredentialDTO>();
        response.data = result;

        return response;
      });
  }

  @Put('/unassignment')
  removeUserAppCredential(
    @Body() dto: RequestDTO<UserAppCredentialUnassignmentDTO>,
  ): Promise<ResponseDTO<any>> {
    return this.userAppCredentialService
      .removeUserAppCredential(dto.data)
      .then((result) => {
        const response = new ResponseDTO<any>();
        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, UserAppCredentialService.name);
        throw new BadRequestException(err.message);
      });
  }


}
