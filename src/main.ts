import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import cookieParser from 'cookie-parser';
import { winstonConfig } from './common/logger/winston.config';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { GlobalExceptionFilter } from './common/errors/global-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Fix BigInt JSON serialization
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const configService = app.get(ConfigService);

  // Security middleware
  // app.use(helmet());

  app.enableCors({
    origin: true, //in production replace with your frontend url
    credentials: true,
  });

  app.use(cookieParser());

  // ✅ Global ValidationPipe (keep only ONE)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //strip unknown properties
      forbidNonWhitelisted: true, // throw error if extra fields are passed
      transform: true, // transform payload to DTP instance
      transformOptions: {
        enableImplicitConversion: true, // "33" -> 33, "true" -> true
      },
    }),
  );

  // global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new GlobalExceptionFilter(),
    new ValidationExceptionFilter(),
  );

  // Global Prefix
  app.setGlobalPrefix('spendwise/api/v1');

  const config = new DocumentBuilder()
    .setTitle('SpendWise API')
    .setDescription(
      `API documentation for SpendWise Backend. This documentation provides detailed information about all available endpoints, authentication methods, and data models used in the SpendWise system.`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-doc', app, document, {
    explorer: true,
    swaggerOptions: {
      showRequestDuration: true,
      persistAuthorization: true,
      defaultModelRendering: 'model',
      defaultModelsExpandDepth: 3,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  // Root endpoint
  app.getHttpAdapter().get('/', (req, res) => {
    res.send('SpendWise Server');
  });

  //enable shutdown hooks
  app.enableShutdownHooks();

  // start server
  const port = configService.get<number>('PORT', 8888);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  // console.log(
  //   `#xdcc1; Static files served at: http://localhost:${port}/ips/api/v1/uploads`,
  // );
  console.log(`Swagger UI: http://localhost:${port}/api-doc`);
}

(async () => {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
})();
