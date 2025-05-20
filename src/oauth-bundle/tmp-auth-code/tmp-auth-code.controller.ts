import { Controller, UseGuards } from '@nestjs/common';
import { BaseController } from 'artifacts/api/controller';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { TMPAuthCodeDTO } from './dto/tmp-auth-code.dto';
import { TMPAuthCodeService } from './tmp-auth-code.service';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/tmp-auth-code')
export class TMPAuthCodeController extends BaseController<TMPAuthCodeDTO> {
  constructor(private readonly tmpAuthCodeService: TMPAuthCodeService) {
    super(tmpAuthCodeService);
  }
}
