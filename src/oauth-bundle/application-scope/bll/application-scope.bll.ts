import { Injectable } from '@nestjs/common';
import { ApplicationScopeService } from '../application-scope.service';

@Injectable()
export class ApplicationScopeBLL {
  constructor(
    private readonly applicationScopeService: ApplicationScopeService,
  ) {}
}
