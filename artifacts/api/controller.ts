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
import { BaseService } from './service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { SearchDTO } from 'src/common/dto/search.dto';

// @UseInterceptors(SchemaInterceptor)
export class BaseController<T> {
  constructor(private readonly baseService: BaseService<T>) {}

  @Get('')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new ErrorInterceptor())
  async search(
    @Query() searchDTO: SearchDTO,
  ): Promise<ResponseDTO<T[]>> {
    const result = await this.baseService.search(searchDTO);
    return result;
  }

  @Get('/:id')
  @UseInterceptors(new ErrorInterceptor())
  async get(@Param('id') id: string): Promise<ResponseDTO<T>> {
    const result = await this.baseService.read(id);
    const response = new ResponseDTO<T>();
    response.data = result;
    return response;
  }

  @Post('')
  @UseInterceptors(new ErrorInterceptor())
  async create(@Body() requestDTO: RequestDTO<T>): Promise<ResponseDTO<T>> {
    const result = await this.baseService.create(requestDTO.data);
    const response = new ResponseDTO<T>();
    response.data = result;
    return response;
  }

  @Put('')
  @UseInterceptors(new ErrorInterceptor())
  async update(
    @Body() updateDTO: RequestDTO<T>,
  ): Promise<ResponseDTO<T>> {
    const result = await this.baseService.update(updateDTO.data);
    const response = new ResponseDTO<T>();
    response.data = result;
    return response;
  }

  @Delete('/:id')
  @UseInterceptors(new ErrorInterceptor())
  async delete(@Param('id') id: string): Promise<ResponseDTO<any>> {
    const result = await this.baseService.delete(id);
    const response = new ResponseDTO<any>();
    response.data = result;
    return response;
  }
}
