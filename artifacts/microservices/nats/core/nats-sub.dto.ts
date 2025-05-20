export class NatsSubDTO {
  subject: string;
  queue?: string;
  callback?: (t: any) => void;
}
