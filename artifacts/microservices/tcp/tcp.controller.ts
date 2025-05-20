import { Controller, Injectable, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { MicroservicePayloadDTO } from '../common/dto/microservice-payload.dto';
import { EVENT_PATTERN, MESSAGE_PATTERN } from './tcp.constants';
import { TCPService } from './tcp.service';
import { UseClsContext } from 'artifacts/cls/cls.client';

@Injectable()
@Controller()
export class TCPController {
  private readonly logger = new Logger(TCPController.name);

  constructor(private readonly tcpService: TCPService) {}

  @UseClsContext()
  @MessagePattern(MESSAGE_PATTERN)
  messageHandler(payload: MicroservicePayloadDTO) {
    this.logger.log('messageHandler', payload);
    return Promise.resolve(this.tcpService.onTCPMessageHandler(payload));
  }

  @UseClsContext()
  @EventPattern(EVENT_PATTERN)
  eventHandler1(payload: MicroservicePayloadDTO) {
    this.logger.log('eventHandler1', payload);
    return Promise.resolve(this.tcpService.onTCPMessageHandler(payload));
  }

  @UseClsContext()
  @EventPattern(EVENT_PATTERN)
  eventHandler2(payload: MicroservicePayloadDTO) {
    this.logger.log('eventHandler2', payload);
    return Promise.resolve(this.tcpService.onTCPMessageHandler(payload));
  }
}
