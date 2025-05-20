/* eslint-disable @typescript-eslint/ban-types */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import { stringify } from 'querystring';
import { v4 as uuidv4 } from 'uuid';
import { ResponseDTO } from '../common/dto/scb/response.dto';
import { CreateQrRequestDTO } from './dto/req.create-qr.dto';
import { SlipVerificationRequestDTO } from './dto/req.slip-verification.dto';
import { TransactionInquiryRequestDTO } from './dto/req.transaction-inquiry.dto';
import { SCBTokenResponseDataDTO, SCBTokenResponseDTO } from './dto/res.access-token.dto';
import { SCBResponseDTO } from './dto/res.scb.dto';

@Injectable()
export class ScbService {
  private httpService;
  private endpoint;
  private apiKey;
  private secretKey;
  private merchantId;
  private terminalId;
  private billerId;

  constructor(private configService: ConfigService) {
    // get an environment variable
    const config = this.configService.get<any>('SCB_API_CONFIG');
    const { endpoint, apiKey, secretKey, merchantId, terminalId, billerId } = config;
    this.endpoint = endpoint || '';
    this.apiKey = apiKey || '';
    this.secretKey = secretKey || '';
    this.merchantId = merchantId || '';
    this.terminalId = terminalId || '';
    this.billerId = config.billerId ? config.billerId.split(',') : [];
    this.httpService = new HttpService();
  }

  async generateToken(): Promise<SCBTokenResponseDataDTO> {
    try {
      const uuid: string = uuidv4();
      const apiUrl = `${this.endpoint}/oauth/token`;
      const header = {
        headers: {
          'Content-Type': 'application/json',
          'resourceOwnerId': this.apiKey,
          'requestUId': uuid,
          'accept-language': 'EN',
        },
      };
      const bodyData = {
        applicationKey: this.apiKey,
        applicationSecret: this.secretKey,
      }
      let result: ResponseDTO<SCBTokenResponseDTO> = new ResponseDTO<SCBTokenResponseDTO>();
      result = await this.httpService.post(apiUrl, bodyData, header).toPromise();
      const response = result?.data;
      return response.data;
    } catch (err) {
      console.log(err.response);
      throw err.response?.data;
    }
  }

  async callApi(service: string, method = 'get', bodyData?: object): Promise<SCBResponseDTO> {
    try {
      const apiUrl = `${this.endpoint}/${service}`;
      const token = await this.generateToken();
      const uuid: string = uuidv4();
      const header = {
        headers: {
          'Content-Type': 'application/json',
          'resourceOwnerId': this.apiKey,
          'authorization': `Bearer ${token.accessToken}`,
          'requestUId': uuid,
          'accept-language': 'EN',
        },
      };
      let result: ResponseDTO<SCBResponseDTO> = new ResponseDTO<SCBResponseDTO>();
      if (method === 'post') {
        result = await this.httpService.post(apiUrl, bodyData, header).toPromise();
      } else if (method === 'put') {
        result = await this.httpService.put(apiUrl, bodyData, header).toPromise();
      } else {
        result = await this.httpService.get(apiUrl, header).toPromise();
      }
      const response = result?.data;
      return new SCBResponseDTO(response);
    } catch (err) {
      console.log(err.response);
      throw err.response?.data;
    }
  }

  async createQrCode(createQrRequestDTO: CreateQrRequestDTO): Promise<SCBResponseDTO> {
    try {
      // createQrRequestDTO.ppId = this.billerId;
      const response = await this.callApi('payment/qrcode/create', 'post', createQrRequestDTO);
      return new SCBResponseDTO(response);
    } catch (err) {
      throw err;
    }
  }

  async slipVerification(transRef: String, slipVerificationRequestDTO: SlipVerificationRequestDTO): Promise<SCBResponseDTO> {
    try {
      const params = {
        ...slipVerificationRequestDTO,
      };
      let queryString = stringify(params);
      const response = await this.callApi(`payment/billpayment/transactions/${transRef}?${queryString}`, 'get');
      return new SCBResponseDTO(response);
    } catch (err) {
      throw err;
    }
  }

  async transactionInquiry(transactionInquiryRequestDTO: TransactionInquiryRequestDTO): Promise<SCBResponseDTO> {
    try {
      transactionInquiryRequestDTO.billerId = this.billerId;
      const params = {
        ...transactionInquiryRequestDTO,
      };
      let queryString = stringify(params);
      const response = await this.callApi(`payment/billpayment/inquiry?${queryString}`, 'get');
      return new SCBResponseDTO(response);
    } catch (err) {
      throw err;
    }
  }

  getRandomBillerId(): string | undefined {
    return _.sample(this.billerId);
  }
}
