import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import * as passwordValidator from 'password-validator'
import { nanoid } from 'nanoid'
import { AESCryptoService } from 'artifacts/crypto/aes-crypto.service';

@Injectable()
export class UserBLL {
  private readonly schema: passwordValidator;
  private saltRounds = 10;

  constructor(
    private readonly aesCryptoService: AESCryptoService,
  ) {
    this.schema = new passwordValidator();
    this.schema
      .is().min(8)                                   
      .has().uppercase()                             
      .has().lowercase()                             
      .has().symbols()                             
      .has().digits()                               
      .has().not().spaces();                          
  }

  validatePassword(password: string): string {
    const lists = this.schema.validate(password, { details: true });
    const errorString: string =  _.get(lists, '[0].message');
    if (typeof errorString === 'string') {
      return errorString.replace(/string/g, 'password');
    }
    return errorString;
  }

  encryptPassword(password: string): string {
    return bcrypt.hash(password, this.saltRounds);
  }

  compare(password: string, dbPassword: string): boolean {
    return bcrypt.compare(password, dbPassword);
  }

  generateAccessKeyId(): string {
    return uuidv4().replace(/-/g, '');
  }

  generateSecretAccessKeyId(): string {
    return nanoid(32);
  }

  encryptAES(text: string): string {
    return this.aesCryptoService.encrypt(text);
  }

  decryptAES(text: string): string {
    return this.aesCryptoService.tryDecrypt(text);
  }
}
