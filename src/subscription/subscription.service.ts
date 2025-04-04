import { Injectable, Inject, Param, BadRequestException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { users, userSubscriptions } from '../drizzle/schema';
import { CryptoService } from '../crypto/crypto.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SubscriptionService {
    constructor(
            @Inject(DATABASE_CONNECTION)
            private db: NodePgDatabase<typeof schema>,
            private cryptoService: CryptoService,
            private mailer: MailerService
          ) {}
          
          async subscribeToUpdate(params: { symbol: string; user: any }) {
            const { symbol, user } = params;
            const dto = new CreateSubscriptionDto();
            dto.symbol = symbol;
            dto.userId = user.id;
            dto.email = user.email;
            const result = await this.cryptoService.subscribeToRealTimeUpdates(dto);
           
            if (!result) {
                throw new Error('Subscription failed');
            }

            const existing_record = await this.db
            .select()
            .from(userSubscriptions)
            .where(
                and(
                eq(userSubscriptions.userId, user.id),
                eq(userSubscriptions.symbol, symbol.toUpperCase())
                )
            );

            if (existing_record.length > 0) {
                throw new BadRequestException('Already subscribed to this symbol');
            }
            
            await this.db.insert(userSubscriptions).values({
                userId: user.id,
                symbol: symbol.toUpperCase(),
              });

              const email = user.email;

            return result;
        } 
}
