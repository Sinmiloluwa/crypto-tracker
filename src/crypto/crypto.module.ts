import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CryptoController } from './crypto.controller';
import configuration from '../config/configuration'
import { CryptoGateway } from './crypto.gateway';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      load: [configuration]
    })
  ],
  providers: [CryptoService, CryptoGateway],
  controllers: [CryptoController]
})
export class CryptoModule {}
