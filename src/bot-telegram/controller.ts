import { Controller } from '@nestjs/common';
import { BaseController } from 'artifacts/api/controller';
import { BotTeleService } from './service';

@Controller('/v1/bot')
export class BotTeleController {
  constructor(private readonly service: BotTeleService) {

  }
}
