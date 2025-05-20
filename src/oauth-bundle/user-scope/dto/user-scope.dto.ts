import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { UserDTO } from 'src/oauth-bundle/user/dto/user.dto';
import { ScopeMasterDTO } from 'src/oauth-bundle/scope-master/dto/scope-master.dto';

export class UserScopeDTO extends UserDTO {
  @IsArray()
  @ApiProperty({
    description: 'scope master in user',
    type: [],
    example: [],
  })
  scopes: ScopeMasterDTO[];
}
