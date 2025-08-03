import { Module } from '@nestjs/common';
import { AppService } from './app/services/app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/controllers/app.controller';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './_lib/config/data-source.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { config } from './_lib/config/enviroment.config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    MailerModule.forRoot({
      transport: {
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.secure,
        auth: {
          user: config.mail.user,
          pass: config.mail.pass,
        },
      },
      defaults: {
        from: '"Squad BNPL Team" <noreply@squadbnpl.com>',
      },
      template: {
        dir: join(process.cwd(), 'src', '_lib', 'templates'),
        adapter: new EjsAdapter(),
        // options: {
        //   strict: true,
        // },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
