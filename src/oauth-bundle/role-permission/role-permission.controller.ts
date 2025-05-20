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
import { RolePermissionBLL } from './bll/role-permission.bll';
import { RolePermissionRelationDTO } from './dto/role-permission-relation.dto';
import { RolePermissionSearchDTO } from './dto/role-permission-search.dto';
import { RolePermissionService } from './role-permission.service';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/role-permission')
export class RolePermissionController {
  constructor(
    private readonly rolePermissionService: RolePermissionService,
    private readonly rolePermissionBLL: RolePermissionBLL,
  ) { }

  @Post('/relation')
  createRolePermissionRelation(
    @Body() rolePermissionDTO: RequestDTO<RolePermissionRelationDTO>,
  ): Promise<ResponseDTO<RolePermissionRelationDTO>> {
    return this.rolePermissionService
      .createRolePermissionRelation(rolePermissionDTO.data)
      .then((result) => {
        const response = new ResponseDTO<RolePermissionRelationDTO>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, RolePermissionService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Post('/:view')
  create(
    @Param('view') view: string,
    @Body() rolePermissionDTO: RequestDTO<any>,
  ): Promise<ResponseDTO<any>> {
    return this.rolePermissionService
      .create(view, rolePermissionDTO.data)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, RolePermissionService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Get('/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  search(
    @Param('view') view: string,
    @Query() rolePermissionSearchDTO: RolePermissionSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    return this.rolePermissionService
      .search(view, rolePermissionSearchDTO)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Logger.error(err, err.stack, RolePermissionService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Get('/:view/:id')
  get(
    @Param('view') view: string,
    @Param('id') id: string,
  ): Promise<ResponseDTO<any>> {
    return this.rolePermissionService
      .read(view, id)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, RolePermissionService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Put('/:view')
  update(
    @Param('view') view: string,
    @Body() rolePermissionUpdateDTO: RequestDTO<any>,
  ): Promise<ResponseDTO<any>> {
    return this.rolePermissionService
      .update(view, rolePermissionUpdateDTO.data)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, RolePermissionService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Delete('/:roleId/:permissionId')
  delete(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<ResponseDTO<any>> {
    return this.rolePermissionService
      .delete(roleId, permissionId)
      .then((result) => {
        const response = new ResponseDTO<any>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, RolePermissionService.name);
        throw new BadRequestException(err.message);
      });
  }
}
