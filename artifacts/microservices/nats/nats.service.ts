import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JSONCodec, StringCodec } from 'nats.ws';
import { NatsSubDTO } from './core/nats-sub.dto';
import { NATSClient } from './core/nats.client';
import { NatsListener } from './core/nats.listener';

@Injectable()
export class NatsService implements OnModuleInit {
  private natsClient: NATSClient;
  private natsSubDTOs: NatsSubDTO[];

  constructor(private configService: ConfigService) {
    this.natsClient = new NATSClient(this.getConfiguration());
    this.natsSubDTOs = [];
    this.subscribe("pc.user.testuser")
  }

  setNatsListener(subject: string, listener: NatsListener) {
    this.natsClient.setNatsListener(subject, listener);
  }

  private getConfiguration(): [] {
    return this.configService.get('NATS_SERVER');
  }

  getMobilePublicKey() {
    const aesKey = 'exampleKey32exampleKey32exampleK';
    const iv = 'exampleIV16examp';
    return this.natsClient.mobilePublickey(aesKey, iv);
  }

  getPublicKey() {
    return this.natsClient.publicKey();
  }

  decryptPublicKey(publicKey: string) {
    return this.natsClient.decryptPublicKey(publicKey);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.natsClient.connect();

      this.natsSubDTOs.forEach((natsSubDTO) => {
        this.natsClient.subscribe(
          natsSubDTO.subject,
          natsSubDTO.queue,
          natsSubDTO.callback,
        );
      });
      this.natsClient.eventLog();
      Logger.log('Connected to NATS server successfully', NatsService.name);
    } catch (err) {
      Logger.error(err, err.stack, NatsService.name);
    }
  }

  subscribe(subject: string, queue?: string, callback?: (t: any) => void) {
    console.log(subject);

    const natsSubDTO = new NatsSubDTO();
    natsSubDTO.subject = subject;
    natsSubDTO.queue = queue;
    natsSubDTO.callback = callback;

    this.natsSubDTOs.push(natsSubDTO);
  }

  request(subject: string, message: any, callback?: (t: any, e?: any) => void,) {
    this.natsClient.request(subject, message, callback);
  }

  publish(subject: string, message: any) {
    this.natsClient.publish(subject, message);
  }

  encodeCodec(message: any): any {
    let codec;
    if (message instanceof String) {
      codec = StringCodec();
    } else {
      codec = JSONCodec();
    }
    return codec.encode(message);
  }

  decodeStringCodec(message: any): any {
    return StringCodec().decode(message);
  }

  decodeJSONCodec(message: any): any {
    return JSONCodec().decode(message);
  }

  drain(subject: string) {
    this.natsClient.drain(subject);
  }

  unsubscribe(subject: string) {
    this.natsClient.unsubscribe(subject);
  }

  shutdown(subject: string) {
    this.natsClient.drain(subject);
    this.natsClient.unsubscribe(subject);
  }

  getNATSClient(): NATSClient {
    return this.natsClient;
  }
}
