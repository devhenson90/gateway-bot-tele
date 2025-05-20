import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { AssociationBaseService } from './association.service';
import { SearchDTO } from 'src/common/dto/search.dto';

// @UseInterceptors(SchemaInterceptor)
export class AssociationController {
  constructor(
    private readonly associationService: AssociationBaseService,
  ) {}

  @Post('/relation')
  @UseInterceptors(new ErrorInterceptor())
  async createRelation(
    @Body() relationDTO: RequestDTO<any>,
  ): Promise<ResponseDTO<any>> {
    const result = await this.associationService
      .createRelation(relationDTO.data);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }
  
  @Post('/:view')
  @UseInterceptors(new ErrorInterceptor())
  async create(
    @Param('view') view: string,
    @Body() requestDTO: RequestDTO<any>,
  ): Promise<ResponseDTO<any>> {
    const result = await this.associationService.create(view, requestDTO.data);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }

  @Get('/:view')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async search(
    @Param('view') view: string,
    @Query() searchDTO: SearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    const result = await this.associationService.search(view, searchDTO);
    return result;
  }

  @Get('/:view/:id')
  @UseInterceptors(new ErrorInterceptor())
  async get(
    @Param('view') view: string,
    @Param('id') id: string,
  ): Promise<ResponseDTO<any>> {
    const result = await this.associationService.read(view, id);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }

  @Put('/:view')
  @UseInterceptors(new ErrorInterceptor())
  async update(
    @Param('view') view: string,
    @Body() updateDTO: RequestDTO<any>,
  ): Promise<ResponseDTO<any>> {
    const result = await this.associationService.update(view, updateDTO.data);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }
  
  @Delete('/:relationId')
  @UseInterceptors(new ErrorInterceptor())
  async delete(
    @Param('relationId') relationId: string,
  ): Promise<ResponseDTO<any>> {
    const result = await this.associationService.delete(relationId);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }
}
