import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as express from 'express';
import { TransformResponseInterceptor } from './_lib/interceptors/response.interceptor';
import { AllExceptionsFilter } from './_lib/filters/exception.filter';
import { config } from './_lib/config/enviroment.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Squad BNPL API')
    .addServer('http://localhost:9000/api/v1', 'Local Server')
    .setDescription('API documentation for Squad BNPL')
    .setVersion('1.0')
    .build();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // transport: Transport.REDIS,
    // options: {
    //   host: 'localhost',
    //   port: 6379,
    // },
  });

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1/docs', app, document);

  app.use(helmet());
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: false, limit: '50mb' }));
  app.disable('x-powered-by');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  const PORT = config.port || 9000;

  await app
    .listen(PORT)
    .then(() => {
      logger.log(`Server is running on port ${PORT}`);
      logger.log(
        `Swagger docs available at http://localhost:${PORT}/api/v1/docs`,
      );
    })
    .catch((error) => {
      logger.error('Error starting the server:', error);
    });
}
bootstrap();
