import { Injectable } from '@nestjs/common';
import { CreateUserHandler } from '../../core/application/commands/create-user/create-user.handler';
import { CreateUserDto } from '../../core/application/commands/create-user/create-user.dto';

@Injectable()
export class UserService {
  constructor(private createUserHandler: CreateUserHandler) {}

  async createUser(dto: CreateUserDto) {
    return this.createUserHandler.execute(dto);
  }
}
