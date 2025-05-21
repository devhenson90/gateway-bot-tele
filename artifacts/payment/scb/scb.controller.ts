import { Controller, Put, Body, Logger, BadRequestException, Query, Get, Param, Post, Delete, UseGuards } from '@nestjs/common';
import { ScbService } from './scb.service';
import { ApiTags } from '@nestjs/swagger';
import { ResponseDTO } from '../common/dto/response.dto';
import { CreateQrRequestDTO } from './dto/req.create-qr.dto';
import { RequestDTO } from '../common/dto/request.dto';
import { SlipVerificationRequestDTO } from './dto/req.slip-verification.dto';
import { TransactionInquiryRequestDTO } from './dto/req.transaction-inquiry.dto';
/**
 * Class of Atome Controller for Omise integration
 */
@ApiTags('scb')
@Controller('scb')
export class ScbController {
  constructor(private readonly shopeePayService: ScbService) { }

  @Post('/create/qr')
  createPayment(@Body() req: RequestDTO<CreateQrRequestDTO>): Promise<ResponseDTO> {
    return this.shopeePayService
      .createQrCode(req.data)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        Logger.error(err, err.stack, ScbService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Get('/slip-verification/:transRef')
  slipVerification(@Param('transRef') transRef: string, @Query() slipVerificationRequestDTO: SlipVerificationRequestDTO,): Promise<ResponseDTO> {
    return this.shopeePayService
      .slipVerification(transRef, slipVerificationRequestDTO)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Logger.error(err, err.stack, ScbService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Get('/transaction-inquiry')
  transactionInquiry(@Query() transactionInquiryRequestDTO: TransactionInquiryRequestDTO,): Promise<ResponseDTO> {
    return this.shopeePayService
      .transactionInquiry(transactionInquiryRequestDTO)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Logger.error(err, err.stack, ScbService.name);
        throw new BadRequestException(err.message);
      });
  }
}
