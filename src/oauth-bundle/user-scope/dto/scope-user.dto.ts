import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { ScopeMasterDTO } from 'src/oauth-bundle/scope-master/dto/scope-master.dto';
import { UserDTO } from 'src/oauth-bundle/user/dto/user.dto';

export class ScopeUserDTO extends ScopeMasterDTO {
  @IsArray()
  @ApiProperty({
    description: 'user in scope master',
    type: [],
    example: [],
  })
  userss: UserDTO[];
}
