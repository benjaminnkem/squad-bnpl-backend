import { Module } from '@nestjs/common';
import { AppService } from './app/services/app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/controllers/app.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
