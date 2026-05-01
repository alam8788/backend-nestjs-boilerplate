import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  constructor(private readonly configService: ConfigService) {}

  async hashPasword(password: string) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hashPassword: string) {
    return await bcrypt.compare(password, hashPassword);
  }
}
