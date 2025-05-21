import { Body, Controller, Get, Headers, Param, Post, Put, Query, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AssociationController } from 'artifacts/api/association.controller';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { ClsService } from 'nestjs-cls';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { AdminConsoleId } from 'src/common/helpers/admin.helper';
import { UserId } from 'src/common/helpers/user.helper';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { UserAssoBLL } from './bll/bll';
import { UserAssoSearchDTO } from './dto/user-asso-search.dto';
import { UserAssoDTO } from './dto/user-asso.dto';
import { UserAssoService } from './user-asso.service';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/user-asso')
export class UserAssoController extends AssociationController {
  constructor(
    private readonly userAssoService: UserAssoService,
    private readonly bll: UserAssoBLL,
    private readonly cls: ClsService,
  ) {
    super(userAssoService);
  }

  @Get('/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async searchAll(
    @Headers() headers: Record<string, string>,
    @Param('view') view: string,
    @Query() searchDTO: UserAssoSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    const userId = UserId(this.cls, headers);
    let result: any;

    if (adminConsoleId) {
      searchDTO.adminConsoleId = adminConsoleId;
      result = await this.userAssoService.search(view, searchDTO);
    } else {
      searchDTO.adminConsoleId = userId;
      searchDTO.orderBy = '"user"."id"';
      result = await this.userAssoService.searchAllUsers(view, searchDTO);
    }

    return result;
  }

  @Get('/:view/all-users')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async searchAllUsers(
    @Headers() headers: Record<string, string>,
    @Param('view') view: string,
    @Query() searchDTO: UserAssoSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    const userId = UserId(this.cls, headers);
    searchDTO.adminConsoleId = userId;
    const result = await this.userAssoService.searchAllUsers(view, searchDTO);
    return result;
  }

  @Get('/with-roles/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async searchWithRoles(
    @Param('view') view: string,
    @Query() searchDTO: UserAssoSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    searchDTO.adminConsoleId = adminConsoleId;
    const result = await this.userAssoService.searchWithRoles(view, searchDTO);
    return result;
  }

  @Get('/with-roles/:view/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async searchWithRolesUserId(
    @Param('view') view: string,
    @Param('id') id: string,
    @Query() searchDTO: UserAssoSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    searchDTO.adminConsoleId = adminConsoleId;
    const result = await this.userAssoService.searchWithRolesUserId(view, searchDTO, id);
    return result;
  }

  @Get('/by-roles/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async searchByRoles(
    @Param('view') view: string,
    @Query() searchDTO: UserAssoSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    const result = await this.userAssoService.searchByRoles(view, searchDTO);
    return result;
  }

  @Get('/:view/:id')
  @UseInterceptors(new ErrorInterceptor())
  async getView(
    @Headers() headers: Record<string, string>,
    @Param('view') view: string,
    @Param('id') id: string,
  ): Promise<ResponseDTO<any>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    const result = await this.userAssoService.readView(view, id, adminConsoleId);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }

  @Get('/profile/:view/:id')
  @UseInterceptors(new ErrorInterceptor())
  async getViewProfile(
    @Headers() headers: Record<string, string>,
    @Param('view') view: string,
    @Param('id') id: string,
  ): Promise<ResponseDTO<any>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    const userId = UserId(this.cls, headers);
    id = userId.toString();
    const result = await this.userAssoService.readView(view, id, adminConsoleId);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }

  @Post('/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async create(
    @Param('view') view: string,
    @Body() requestDTO: RequestDTO<UserAssoDTO>,
  ): Promise<ResponseDTO<any>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    requestDTO.data.user.adminConsoleId = adminConsoleId;
    const result = await this.bll.create(view, requestDTO.data);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }

  @Put('/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async update(
    @Param('view') view: string,
    @Body() updateDTO: RequestDTO<UserAssoDTO>,
  ): Promise<ResponseDTO<any>> {
    const result = await this.bll.update(view, updateDTO.data);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }

  @Get('/user-authority/:view/:id')
  @UseInterceptors(new ErrorInterceptor())
  async getRolePermission(
    @Param('view') view: string,
    @Param('id') id: string,
  ): Promise<ResponseDTO<any>> {
    const result = await this.userAssoService.readRolePermission(view, id);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }
}
