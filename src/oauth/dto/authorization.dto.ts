import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AuthorizationDTO {
  @IsString()
  @Type(() => String)
  responseType = '';

  @IsString()
  @Type(() => String)
  grantType = '';

  @IsString()
  @Type(() => String)
  clientId = '';

  @IsString()
  @Type(() => String)
  clientSecret = '';

  @IsString()
  @Type(() => String)
  redirectUri = '';

  @IsString()
  @Type(() => String)
  scope = '';

  @IsString()
  @Type(() => String)
  state = ''; // CSRF token
}
