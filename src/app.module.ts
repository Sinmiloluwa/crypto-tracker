import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoModule } from './crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CryptoModule, 
    ConfigModule.forRoot({
    isGlobal: true
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    DatabaseModule,
    UsersModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
