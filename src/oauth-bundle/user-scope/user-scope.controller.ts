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
import { UserScopeBLL } from './bll/user-scope.bll';
import { UserScopeRelationDTO } from './dto/user-scope-relation.dto';
import { UserScopeSearchDTO } from './dto/user-scope-search.dto';
import { UserScopeService } from './user-scope.service';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/user-scope')
export class UserScopeController {
  constructor(
    private readonly userScopeService: UserScopeService,
    private readonly userScopeBLL: UserScopeBLL,
  ) { }

  @Post('/:view')
  create(
    @Param('view') view: string,
    @Body() userScopeDTO: RequestDTO<any>,
  ): Promise<ResponseDTO<any>> {
    return this.userScopeService
      .create(view, userScopeDTO.data)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, UserScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Get('/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  search(
    @Param('view') view: string,
    @Query() userScopeSearchDTO: UserScopeSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    return this.userScopeService
      .search(view, userScopeSearchDTO)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Logger.error(err, err.stack, UserScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Post('/relation')
  createUserScopeRelation(
    @Body()
    userScopeRelationDTO: RequestDTO<UserScopeRelationDTO>,
  ): Promise<ResponseDTO<UserScopeRelationDTO>> {
    return this.userScopeService
      .createUserScopeRelation(userScopeRelationDTO.data)
      .then((result) => {
        const response = new ResponseDTO<UserScopeRelationDTO>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, UserScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Get('/:view/:id')
  get(
    @Param('view') view: string,
    @Param('id') id: string,
  ): Promise<ResponseDTO<any>> {
    return this.userScopeService
      .read(view, id)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, UserScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Put('/:view')
  update(
    @Param('view') view: string,
    @Body() userScopeUpdateDTO: RequestDTO<any>,
  ): Promise<ResponseDTO<any>> {
    return this.userScopeService
      .update(view, userScopeUpdateDTO.data)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, UserScopeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Delete('/:userId/:scopeId')
  delete(
    @Param('userId') userId: string,
    @Param('scopeId') scopeId: string,
  ): Promise<ResponseDTO<any>> {
    return this.userScopeService
      .delete(userId, scopeId)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, UserScopeService.name);
        throw new BadRequestException(err.message);
      });
  }
}
