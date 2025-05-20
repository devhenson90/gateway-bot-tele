import { Controller, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
@Controller()
export class HTTPController {
  constructor(private readonly httpService: HttpService) {}
}
