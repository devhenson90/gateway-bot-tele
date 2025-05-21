import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { BaseController } from 'artifacts/api/controller';
import { Public } from 'artifacts/auth/metadata/public.metadata';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { AdminConsoleService } from './admin-console.service';
import { AdminConsoleDTO } from './dto/admin-console.dto';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/admin-console')
export class AdminConsoleController extends BaseController<AdminConsoleDTO> {
  constructor(private readonly adminConsoleService: AdminConsoleService) {
    super(adminConsoleService);
  }

  @Public()
  @Post('')
  @UseInterceptors(new ErrorInterceptor())
  async create(@Body() requestDTO: RequestDTO<AdminConsoleDTO>): Promise<ResponseDTO<AdminConsoleDTO>> {
    const result = await this.adminConsoleService.create(requestDTO.data);
    const response = new ResponseDTO<AdminConsoleDTO>();
    response.data = result;
    return response;
  }
}
