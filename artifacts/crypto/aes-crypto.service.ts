import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class AESCryptoService {

  private readonly aesKey: CryptoJS.lib.WordArray;
  private readonly aesIV: CryptoJS.lib.WordArray;

  constructor(private readonly configService: ConfigService) {
    this.aesKey = CryptoJS.enc.Utf8.parse(this.configService.get('AES_KEY'));
    this.aesIV = CryptoJS.enc.Utf8.parse(this.configService.get('AES_IV'));
  }

  encrypt(plainText: string): string {
    const encrypted =  CryptoJS.AES.encrypt(plainText, this.aesKey, { iv: this.aesIV })
    return encrypted.toString(CryptoJS.format.OpenSSL);
  }

  decrypt(encryptString: string): string {
    return CryptoJS.AES.decrypt(encryptString, this.aesKey, { iv: this.aesIV }).toString(CryptoJS.enc.Utf8);
  }

  tryDecrypt(encryptString: string): string {
    try {
      return this.decrypt(encryptString);
    } catch (error) {
      return encryptString;
    }
  }

}
