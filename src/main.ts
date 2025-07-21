import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Squad BNPL API')
    .addServer('http://localhost:9000', 'Local Server')
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
  app.disable('x-powered-by');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const PORT = process.env.PORT || 9000;

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
