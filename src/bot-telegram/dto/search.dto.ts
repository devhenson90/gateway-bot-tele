import { IsOptional, IsString } from 'class-validator';
import { SearchDTO } from 'src/common/dto/search.dto';

export class SearchMappingOrderIdsDTO extends SearchDTO {
  @IsString()
  @IsOptional()
  sourceOrderId?: string;

  @IsString()
  @IsOptional()
  requestOrderId?: string;

  @IsString()
  @IsOptional()
  troubleshoot?: string;
}
