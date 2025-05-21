import { Module } from '@nestjs/common';
import { AESCryptoService } from './aes-crypto.service';

@Module({
    imports: [],
    controllers: [],
    providers: [AESCryptoService],
    exports: [AESCryptoService]
})
export class CryptoModule {}
