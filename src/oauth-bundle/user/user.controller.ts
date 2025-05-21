import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from 'artifacts/api/controller';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { SetPasswordDTO, UserChangePasswordDTO, UserDTO } from './dto/user.dto';
import { UserService } from './user.service';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/user')
export class UserController extends BaseController<UserDTO> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Patch('/change-password/:id')
  changePassword(
    @Param('id') id: string,
    @Body() body: RequestDTO<UserChangePasswordDTO>,
  ): Promise<ResponseDTO<UserDTO>> {
    return this.userService
      .changePassword(parseInt(id), body.data)
      .then((result) => {
        const response = new ResponseDTO<UserDTO>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, UserService.name);
        throw new BadRequestException(err);
      });
  }

  @Patch('/set-password/:id')
  setPassword(
    @Param('id') id: string,
    @Body() body: RequestDTO<SetPasswordDTO>,
  ): Promise<ResponseDTO<UserDTO>> {
    return this.userService
      .setPassword(parseInt(id), body.data)
      .then((result) => {
        const response = new ResponseDTO<UserDTO>();
        response.data = result;

        return response;
      })
      .catch((err) => {
        Logger.error(err, err.stack, UserService.name);
        throw new BadRequestException(err);
      });
  }
}
