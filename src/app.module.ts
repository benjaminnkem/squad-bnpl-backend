import { Module } from '@nestjs/common';
import { AppService } from './app/services/app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/controllers/app.controller';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './_lib/config/data-source.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
