import { Controller, UseGuards } from '@nestjs/common';
import { BaseController } from 'artifacts/api/controller';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { ApplicationService } from './application.service';
import { ApplicationDTO } from './dto/application.dto';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/application')
export class ApplicationController extends BaseController<ApplicationDTO> {
  constructor(private readonly applicationService: ApplicationService) {
    super(applicationService);
  }
}
