import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BaseController } from 'artifacts/api/controller';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { ClsService } from 'nestjs-cls';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { AdminConsoleId } from 'src/common/helpers/admin.helper';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { ScopeMasterSearchDTO } from './dto/scope-master-search.dto';
import { ScopeMasterDTO } from './dto/scope-master.dto';
import { ScopeMasterService } from './scope-master.service';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/scope-master')
export class ScopeMasterController extends BaseController<ScopeMasterDTO> {
  constructor(
    private readonly scopeMasterService: ScopeMasterService,
    private readonly cls: ClsService,
  ) {
    super(scopeMasterService);
  }

  @Get('')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async search(
    @Query() searchDTO: ScopeMasterSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    searchDTO.adminConsoleId = adminConsoleId;
    const result = await this.scopeMasterService.searchScopeMaster(searchDTO);
    return result;
  }

  @Post('')
  @UseInterceptors(new ErrorInterceptor())
  async create(@Body() requestDTO: RequestDTO<ScopeMasterDTO>): Promise<ResponseDTO<ScopeMasterDTO>> {
    const adminConsoleId = AdminConsoleId(this.cls);
    requestDTO.data.adminConsoleId = adminConsoleId;
    const result = await this.scopeMasterService.create(requestDTO.data);
    const response = new ResponseDTO<ScopeMasterDTO>();
    response.data = result;
    return response;
  }
}
