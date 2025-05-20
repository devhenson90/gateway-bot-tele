import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { SearchDTO } from 'src/common/dto/search.dto';

export class UserAssoSearchDTO extends SearchDTO {
  @IsString()
  @Type(() => String)
  status = '';

  @IsString()
  @Type(() => String)
  orderBy = '';

  @IsString()
  @Type(() => String)
  orderType = '';

  @IsString()
  @Type(() => String)
  between = '';

  @IsString()
  @Type(() => String)
  betweenDate = '';

  @IsString()
  @Type(() => String)
  roles = '';

  @IsString()
  @Type(() => String)
  type = '';

  @IsString()
  @Type(() => String)
  scope = '';

  getStartDate() {
    return this.betweenDate.split(',')[0];
  }

  getEndDate() {
    return this.betweenDate.split(',')[1];
  }

  @IsNumber()
  @Type(() => Number)
  adminConsoleId = 0;
}
