import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScbController } from './scb.controller';
import { ScbService } from './scb.service';

@Module({
  imports: [ConfigModule],
  controllers: [ScbController],
  providers: [ScbService],
  exports: [ScbService],
})
export class ScbModule { }
