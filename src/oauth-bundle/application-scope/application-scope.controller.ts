import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { ApplicationScopeService } from './application-scope.service';
import { ApplicationScopeBLL } from './bll/application-scope.bll';
import { ApplicationScopeRelationDTO } from './dto/application-scope-relation.dto';
import { ApplicationScopeSearchDTO } from './dto/application-scope-search.dto';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/application-scope')
export class ApplicationScopeController {
  constructor(
    private readonly applicationScopeService: ApplicationScopeService,
    private readonly applicationScopeBLL: ApplicationScopeBLL,
  ) { }

  @Post('/relation')
  createApplicationScopeRelation(
    @Body()
    applicationScopeRelationDTO: RequestDTO<ApplicationScopeRelationDTO>,
  ): Promise<ResponseDTO<ApplicationScopeRelationDTO>> {
    return this.applicationScopeService
      .createApplicationScopeRelation(applicationScopeRelationDTO.data)
      .then((result) => {
        const response = new ResponseDTO<ApplicationScopeRelationDTO>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, ApplicationScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Post('/:view')
  create(
    @Param('view') view: string,
    @Body() applicationScopeDTO: RequestDTO<any>,
  ): Promise<ResponseDTO<any>> {
    return this.applicationScopeService
      .create(view, applicationScopeDTO.data)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, ApplicationScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Get('/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  search(
    @Param('view') view: string,
    @Query() applicationScopeSearchDTO: ApplicationScopeSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    return this.applicationScopeService
      .search(view, applicationScopeSearchDTO)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Logger.error(err, err.stack, ApplicationScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Get('/:view/:id')
  get(
    @Param('view') view: string,
    @Param('id') id: string,
  ): Promise<ResponseDTO<any>> {
    return this.applicationScopeService
      .read(view, id)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, ApplicationScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Put('/:view')
  update(
    @Param('view') view: string,
    @Body() applicationScopeUpdateDTO: RequestDTO<any>,
  ): Promise<ResponseDTO<any>> {
    return this.applicationScopeService
      .update(view, applicationScopeUpdateDTO.data)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, ApplicationScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Delete('/:applicationId/:scopeId')
  delete(
    @Param('applicationId') applicationId: string,
    @Param('scopeId') scopeId: string,
  ): Promise<ResponseDTO<any>> {
    return this.applicationScopeService
      .delete(applicationId, scopeId)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, ApplicationScopeService.name);
        throw new BadRequestException(err.message);
      });
  }
}
