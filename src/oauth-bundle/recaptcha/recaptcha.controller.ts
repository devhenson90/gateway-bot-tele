import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { Public } from 'artifacts/auth/metadata/public.metadata';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { TextEnum } from 'src/common/enum/text.enum';
import { ErrorInterceptor } from 'src/common/interceptor/error.interceptor';
import { VerifyReCaptchaDTO } from './dto/recaptcha.dto';
import { RecaptchaService } from './recaptcha.service';

@Public()
@Controller('/v1/recaptcha')
export class RecaptchaController {
  constructor(private readonly recaptchaService: RecaptchaService) { }

  @Post('/verify-recaptcha')
  @ApiOperation({ summary: 'Verify reCaptcha' })
  @ApiExtraModels(VerifyReCaptchaDTO)
  @ApiBody({
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(VerifyReCaptchaDTO)
        },
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: VerifyReCaptchaDTO,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new ErrorInterceptor())
  verifyreCaptcha(@Body() reCaptcha: RequestDTO<VerifyReCaptchaDTO>): Promise<ResponseDTO<VerifyReCaptchaDTO>> {
    return this.recaptchaService.verifyreCaptcha(reCaptcha.data).then((result) => {
      const response = new ResponseDTO<VerifyReCaptchaDTO>();
      if (result.success) {
        response.message = TextEnum.success;
      } else {
        response.message = TextEnum.error;
      }
      response.data = result;
      return response;
    })
  }
}
