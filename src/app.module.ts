import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoModule } from './crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    CryptoModule, 
    ConfigModule.forRoot({
    isGlobal: true
    }),
    EventEmitterModule.forRoot()
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
