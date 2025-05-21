import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AssociationController } from 'artifacts/api/association.controller';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { ClsService } from 'nestjs-cls';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { AdminConsoleId } from 'src/common/helpers/admin.helper';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { ApplicationAssoService } from './application-asso.service';
import { ApplicationAssoBLL } from './bll/bll';
import { ApplicationAssoSearchDTO } from './dto/application-asso-search.dto';
import { ApplicationAssoDTO } from './dto/application-asso.dto';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/application-asso')
export class ApplicationAssoController extends AssociationController {
  constructor(
    private readonly applicationAssoService: ApplicationAssoService,
    private readonly bll: ApplicationAssoBLL,
    private readonly cls: ClsService,
  ) {
    super(applicationAssoService);
  }

  @Get('/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async search(
    @Param('view') view: string,
    @Query() searchDTO: ApplicationAssoSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    searchDTO.adminConsoleId = adminConsoleId;
    const result = await this.applicationAssoService.search(view, searchDTO);
    return result;
  }

  @Get('/:view/:id')
  @UseInterceptors(new ErrorInterceptor())
  async get(
    @Param('view') view: string,
    @Param('id') id: string,
  ): Promise<ResponseDTO<any>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    const result = await this.applicationAssoService.readView(view, id, adminConsoleId);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }

  @Post('/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async create(
    @Param('view') view: string,
    @Body() requestDTO: RequestDTO<ApplicationAssoDTO>,
  ): Promise<ResponseDTO<any>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    requestDTO.data.application.adminConsoleId = adminConsoleId;
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
    @Body() updateDTO: RequestDTO<ApplicationAssoDTO>,
  ): Promise<ResponseDTO<any>> {
    const result = await this.bll.update(view, updateDTO.data);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }
}
