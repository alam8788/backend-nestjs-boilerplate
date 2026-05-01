import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { CommonForAllModule } from './modules/common-for-all/common-for-all.module';
import { MailModule } from './modules/mail/mail.module';
import { SecurityModule } from './core/security/security.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: `.env`,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Reset counter after 60 seconds
        limit: 100, // Allow 100 requests per IP in 60s
      },
    ]),

    // Static files serving (for file upload)
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'uploads'),
    //   serveRoot: '/uploads',
    //   exclude: ['/api*'],
    //   serveStaticOptions: {
    //     index: false, // Disable directory index
    //     fallthrough: false, // Return 404 for missing files
    //   }
    // }),

    LoggerModule,
    HealthModule,
    PrismaModule,
    CommonForAllModule,
    SecurityModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
