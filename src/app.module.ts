import { Module } from '@nestjs/common';
import { AppService } from './app/services/app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/controllers/app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
