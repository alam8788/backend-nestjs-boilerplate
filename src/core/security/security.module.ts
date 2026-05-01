import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
