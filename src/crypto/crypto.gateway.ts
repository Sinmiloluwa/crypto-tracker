import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { userSubscriptions } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@WebSocketGateway({
    cors: {
      origin: '*', 
    },
  })
 
export class CryptoGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {  
    constructor(
      @Inject(DATABASE_CONNECTION)
      private db: NodePgDatabase<typeof schema>,
      private jwtService: JwtService,
      private mailer: MailerService,
    ){}
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('CryptoGateway');
    private clientSubscriptions = new Map<string, Set<string>>();
  

    afterInit() {
        this.logger.log('WebSocket Gateway initialized');
      }
    
      async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        await this.db.delete(userSubscriptions).where(eq(userSubscriptions.clientId, client.id));

        // this.clientSubscriptions.set(client.id, new Set());
    
        client.on('subscribe', async (symbol: string) => {
          const upperSymbol = symbol.toUpperCase();

          const existing = this.db.query.userSubscriptions.findFirst({
            where: (s) => eq(s.clientId, client.id) && eq(s.symbol, upperSymbol),
          });

          if (!existing) {
            await this.db.insert(userSubscriptions).values({
              clientId: client.id,
              symbol: upperSymbol,
            });
    
            this.logger.log(`Client ${client.id} subscribed to ${upperSymbol}`);
          }
        });

        client.on('unsubscribe', async (symbol: string) => {
          const upperSymbol = symbol.toUpperCase();

          await this.db.delete(userSubscriptions).where(
            and(
              eq(userSubscriptions.clientId, client.id),
              eq(userSubscriptions.symbol, upperSymbol)
            )
          );
    
          this.logger.log(`Client ${client.id} unsubscribed from ${upperSymbol}`);
        });
        }
      
        handleDisconnect(client: Socket) {
          this.logger.log(`Client disconnected: ${client.id}`);
          this.clientSubscriptions.delete(client.id);
        }
      
        @OnEvent('crypto.priceChange')
        async handlePriceChange(payload: { symbol: string; newPrice: number }) {
          this.logger.log(`Price change detected for ${payload.symbol}: ${payload.newPrice}`);
        
          const normalizedSymbol = payload.symbol.toUpperCase();
        
    
          const activeSubscriptions = await this.db
            .select()
            .from(userSubscriptions)
            .leftJoin(schema.users, eq(userSubscriptions.userId, schema.users.id))
            .where(eq(userSubscriptions.symbol, normalizedSymbol));
        
            const userIds = activeSubscriptions.map((sub) => sub.users?.id); 
          console.log(activeSubscriptions);
        
    
          activeSubscriptions.forEach((subscription) => {
          
            if (subscription.user_subscriptions.symbol === payload.symbol) {
              this.logger.log(`Notifying client ${subscription.user_subscriptions.clientId} of ${payload.symbol} price update`);
              this.server.to(subscription.user_subscriptions.clientId).emit('priceUpdate', payload);
              this.sendEmail(subscription.users?.email, payload.symbol, payload.newPrice);
            }
          });
        }

        async sendEmail(email: string, symbol: string, newPrice: number) {
          this.mailer.sendMail({
            to: email,
            from: 'blvcksimons@gmail.com',
            subject: 'Crypto Price Update',
            text: `The price of ${symbol} you subscribed to has changed.`,
            html: `<b>The price of ${symbol} you subscribed to has changed. New price is ${newPrice}</b>`,
          })
        }
}