import { Msg } from 'nats.ws';
export interface NatsListener {
  natsCallback(m: Msg, err?: any);
}
