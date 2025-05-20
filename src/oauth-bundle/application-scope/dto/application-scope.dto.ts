import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { ApplicationDTO } from 'src/oauth-bundle/application/dto/application.dto';
import { ScopeMasterDTO } from 'src/oauth-bundle/scope-master/dto/scope-master.dto';

export class ApplicationScopeDTO extends ApplicationDTO {
  @IsArray()
  @ApiProperty({
    description: 'scope master in application',
    type: [],
    example: [],
  })
  scopes: ScopeMasterDTO[];
}
