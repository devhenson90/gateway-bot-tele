import { Logger } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import {
  connect,
  DebugEvents,
  Events,
  JSONCodec,
  NatsConnection,
  StringCodec,
  Subscription,
} from 'nats.ws';
import { NatsListener } from './nats.listener';

export class NATSClient {
  private readonly logger = new Logger(NATSClient.name);

  private servers = [
    // { servers: 'localhost:4222' },
    // { servers: ['demo.nats.io:4442', 'demo.nats.io:4222'] },
    // { servers: 'demo.nats.io:4443' },
    // { port: 4222 },
    // { servers: 'localhost' },
  ];

  private nc: NatsConnection;
  private subscriptions: Map<string, Subscription>;
  private listeners: Map<string, NatsListener>;

  constructor(servers: []) {
    this.servers = servers;
    this.subscriptions = new Map<string, Subscription>();
    this.listeners = new Map<string, NatsListener>();
  }

  // testPublicKey() {
  //   const pk = this.publicKey();
  //   const firstDecrypted = CryptoJS.DES.decrypt(
  //     pk || '',
  //     '',
  //   ).toString(CryptoJS.enc.Utf8);
  //   const lastDecrypted = CryptoJS.RC4Drop.decrypt(firstDecrypted, '').toString(
  //     CryptoJS.enc.Utf8,
  //   );
  //   return JSON.parse(lastDecrypted);
  // }

  mobilePublickey(aesKey, aesIV) {
    const server = this.servers[0];
    const auth = {
      user: server.user,
      pass: server.pass,
    }
    const toEncrypted = JSON.stringify(auth);
    const encrypted = CryptoJS.AES.encrypt(toEncrypted, CryptoJS.enc.Utf8.parse(aesKey), { iv: CryptoJS.enc.Utf8.parse(aesIV) })
    return encrypted.toString(CryptoJS.format.OpenSSL);
  }

  publicKey() {
    const server = this.servers[0];
    const auth = {
      user: server.user,
      pass: server.pass,
    }
    const toEncrypted = JSON.stringify(auth);
    const firstEncrypt = CryptoJS.RC4Drop.encrypt(toEncrypted, '').toString(CryptoJS.format.OpenSSL);
    const secondEncrypt = CryptoJS.DES.encrypt(firstEncrypt, '').toString(CryptoJS.format.OpenSSL);
    return secondEncrypt;
  }

  decryptPublicKey(pk: string) {
    const firstDecrypted = CryptoJS.DES.decrypt(pk, '').toString(
      CryptoJS.enc.Utf8,
    );
    const lastDecrypted = CryptoJS.RC4Drop.decrypt(firstDecrypted, '').toString(
      CryptoJS.enc.Utf8,
    );
    return JSON.parse(lastDecrypted);
  }

  getNatsListener(key: string): NatsListener {
    return this.listeners.get(key);
  }

  setNatsListener(key: string, listener: NatsListener) {
    this.listeners.set(key, listener);
  }

  clearNatsListener() {
    this.listeners.clear();
  }

  /**
   * Connect to NATS server
   */
  async connect() {
    for (let i = 0; i < this.servers.length; i++) {
      this.logger.log(`Connecting to NATS [User: ${this.servers[i].user}, Host: ${this.servers[i].servers}]`);
      this.nc = await connect(this.servers[i]);
      this.nc.closed().then((err) => {
        let m = `connection to ${this.nc.getServer()} closed`;
        if (err) {
          m = `${m} with an error: ${err.message}`;
        }
        this.logger.log(m);
      });
    }
  }

  async eventLog() {
    if (!this.nc) {
      return;
    }

    for await (const s of this.nc.status()) {
      switch (s.type) {
        case Events.Disconnect:
          this.logger.log(`client disconnected - ${s.data}`);
          break;
        case Events.LDM:
          this.logger.log('client has been requested to reconnect');
          break;
        case Events.Update:
          this.logger.log(`client received a cluster update - ${s.data}`);
          break;
        case Events.Reconnect:
          this.logger.log(`client reconnected - ${s.data}`);
          break;
        case Events.Error:
          this.logger.log('client got a permissions error');
          break;
        case DebugEvents.Reconnecting:
          this.logger.log('client is attempting to reconnect');
          break;
        case DebugEvents.StaleConnection:
          this.logger.log('client has a stale connection');
          break;
        default:
          this.logger.log(`got an unknown status ${s.type}`);
      }
    }
  }

  subscribe(subject: string, queue?: string, callback?: (t: any) => void) {
    let sub: Subscription;
    if (queue) {
      sub = this.nc.subscribe(subject, { queue: queue });
    } else {
      sub = this.nc.subscribe(subject);
    }
    this.subscriptions.set(subject, sub);

    // this.nc.subscribe(subject, {
    //   callback: (err, msg) => {
    //     this.logger.log(`[${sub.getProcessed()}]: ${msg.data}`, msg);
    //     // this.logger.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
    //     // this.logger.log('xxx', JSONCodec().decode(m.data)['message']);
    //   },
    // });
    (async () => {
      for await (const m of sub) {
        // this.logger.log(`[${sub.getProcessed()}]: ${sub.getSubject()}`);
        // this.logger.log(`[${sub.getProcessed()}]: ${m.data}`);
        // this.getNATSCallback(sub.getSubject())(StringCodec().decode(m.data));
        this.getNatsListener(sub.getSubject())?.natsCallback(m);
        if (callback) {
          callback(m);
        }
        // this.logger.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
        // this.logger.log('xxx', JSONCodec().decode(m.data)['message']);
      }
      this.logger.log('subscription closed');
    })();
  }

  async drain(subject: string) {
    await this.subscriptions.get(subject).drain();
  }

  async unsubscribe(subject: string) {
    this.subscriptions.get(subject).unsubscribe();
  }

  async publish(subject: string, message: any) {
    let codec;
    if (message instanceof String) {
      codec = StringCodec();
    } else {
      codec = JSONCodec();
    }
    this.nc.publish(subject, codec.encode(message));
  }

  async request(
    subject: string,
    message: any,
    callback?: (t: any, e?: any) => void,
  ) {
    let codec;
    if (message instanceof String) {
      codec = StringCodec();
    } else {
      codec = JSONCodec();
    }
    await this.nc
      .request(subject, codec.encode(message), { timeout: 5000 })
      .then((m) => {
        const data = codec.decode(m.data);
        // this.logger.log(`got response:`, data);
        if (callback) {
          callback(data);
        }
      })
      .catch((err) => {
        // this.logger.log(`problem with request: ${err.message}`);
        if (callback) {
          callback(null, err);
        }
      });
  }
}
