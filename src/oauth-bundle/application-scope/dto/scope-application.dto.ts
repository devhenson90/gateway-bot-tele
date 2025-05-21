import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { ApplicationDTO } from 'src/oauth-bundle/application/dto/application.dto';
import { ScopeMasterDTO } from 'src/oauth-bundle/scope-master/dto/scope-master.dto';

export class ScopeApplicationDTO extends ScopeMasterDTO {
  @IsArray()
  @ApiProperty({
    description: 'application in scope master',
    type: [],
    example: [],
  })
  applications: ApplicationDTO[];
}
