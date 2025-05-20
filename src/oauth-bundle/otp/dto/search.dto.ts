

import { IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { SearchDTO } from 'src/common/dto/search.dto';

export class OtpSearchDTO extends SearchDTO {
  @IsString()
  @Type(() => String)
  status = '';
}
