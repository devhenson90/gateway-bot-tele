import { ResponseDTO } from '../../common/dto/response.dto';

export class SCBResponseDTO extends ResponseDTO {
  constructor(paymentResult: any) {
    super();
    Object.assign(this, paymentResult);
  }
}
