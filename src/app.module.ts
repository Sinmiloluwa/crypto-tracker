import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoModule } from './crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    CryptoModule, 
    ConfigModule.forRoot({
    isGlobal: true
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    DatabaseModule,
    UsersModule,
    SubscriptionModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
    }),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
