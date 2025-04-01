import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
    cors: {
      origin: '*', 
    },
  })
 
export class CryptoGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {  
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('CryptoGateway');
    private clientSubscriptions = new Map<string, Set<string>>();

    afterInit() {
        this.logger.log('WebSocket Gateway initialized');
      }
    
      handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        this.clientSubscriptions.set(client.id, new Set());
    
        client.on('subscribe', (symbol: string) => {
          const subscriptions = this.clientSubscriptions.get(client.id);
          if (subscriptions) {
            subscriptions.add(symbol.toUpperCase());
            this.logger.log(`Client ${client.id} subscribed to ${symbol}`);
          }
        });

        client.on('unsubscribe', (symbol: string) => {
            const subscriptions = this.clientSubscriptions.get(client.id);
            if (subscriptions) {
              subscriptions.delete(symbol.toUpperCase());
              this.logger.log(`Client ${client.id} unsubscribed from ${symbol}`);
            }
          });
        }
      
        handleDisconnect(client: Socket) {
          this.logger.log(`Client disconnected: ${client.id}`);
          this.clientSubscriptions.delete(client.id);
        }
      
        @OnEvent('crypto.priceChange')
        handlePriceChange(payload: any) {
          this.logger.log(`Price change detected for ${payload.symbol}: ${payload.newPrice}`);
          
          this.clientSubscriptions.forEach((subscriptions, clientId) => {
            if (subscriptions.has(payload.symbol)) {
              this.server.to(clientId).emit('priceUpdate', payload);
            }
          });
        }
}