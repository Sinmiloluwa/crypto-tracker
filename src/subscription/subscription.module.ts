import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { DatabaseModule } from '../database/database.module';
import { SubscriptionController } from './subscription.controller';
import { CryptoModule } from '../crypto/crypto.module';
import { CryptoService } from '../crypto/crypto.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  providers: [SubscriptionService, CryptoService],
  imports: [DatabaseModule, HttpModule],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
