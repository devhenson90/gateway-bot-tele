import { Global, Module } from '@nestjs/common';
import { DayJsModule } from 'artifacts/day-js/day-js.module';
import { RDSModule } from 'artifacts/rds/rds.module';
import { ApplicationModule } from 'src/oauth-bundle/application/application.module';
import { RDSHelperService } from './rds-helper.service';

@Global()
@Module({
  imports: [DayJsModule, RDSModule, ApplicationModule],
  controllers: [],
  providers: [RDSHelperService],
  exports: [DayJsModule, RDSHelperService, ApplicationModule],
})
export class GlobalModule { }
