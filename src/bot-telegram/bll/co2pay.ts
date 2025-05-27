import { Injectable } from '@nestjs/common';
import { HTTPService } from 'artifacts/microservices/http/http.service';


@Injectable()
export class ThirdPartyService {
    private URI: string = 'https://api.co2pay.asia/v1/3rd/ptt/inquiry/';
    private X_API_KEY: string = 'vQLBxhZbz3DbCSp5JSFJ0G0W';

    constructor(private readonly http: HTTPService,) { }

    async inquiryTransaction(requestOrderId: string) {
        let responseObserver: any = await this.http.get(
            this.URI + requestOrderId,
            {
                'Content-Type': 'application/json',
                'x-api-key': this.X_API_KEY,
            },
        );
        if (responseObserver) {
            return responseObserver
        } else {
            return null;
        }
    }

    async callbackTransaction(requestOrderId: string, callbackData: any, extendUrl: string) {
        try {
            let responseObserver: any = await this.http.post(
                'https://api.co2pay.asia/v1/callback/p2k' + extendUrl,
                callbackData,
                {
                    'Content-Type': 'application/json'
                },
            );
            if (responseObserver) {
                return responseObserver
            } else {
                return null;
            }
        } catch (error) {
            console.log("error", error);
        }
    }



}