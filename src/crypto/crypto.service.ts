import { Injectable, OnModuleInit} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, interval } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { CreateSubscriptionDto } from '../subscription/dto/create-subscription.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class CryptoService implements OnModuleInit{

    private cryptoCache = new Map();
    private readonly UPDATE_INTERVAL = 5000;
    private logger: Logger = new Logger('CryptoGateway');
    constructor(
        private readonly httpService: HttpService,
        private eventEmitter: EventEmitter2,
        private mailer: MailerService
    ) {}

    onModuleInit() {
        this.startPriceUpdatePolling();
    }

    private startPriceUpdatePolling() {
        interval(this.UPDATE_INTERVAL).subscribe(async () => {
            const symbols = Array.from(this.cryptoCache.keys());
            if (symbols.length > 0) {
                await this.updatePricesForSymbols(symbols);
            }
        });
    }

    async getCryptoPrice(symbol: string): Promise<any> {
        symbol = symbol.toUpperCase();
        
        try {
            if (!this.cryptoCache.has(symbol)) {
            
                const response = await firstValueFrom(
                    this.httpService.get(
                        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest`, {
                            params: {
                                symbol: symbol
                            },
                            headers: {
                                'X-CMC_PRO_API_KEY': process.env.API_KEY
                            }
                        }
                    )
                );
                
                if (response.data?.data?.[symbol] && response.data.data[symbol].length > 0) {
                    const cryptoData = this.formatCryptoData(response.data.data[symbol][0]);
                    this.cryptoCache.set(symbol, cryptoData);
                    return cryptoData;
                }
                
                return { error: 'Cryptocurrency not found' };
            }
            
            return this.cryptoCache.get(symbol);
        } catch (error) {
            console.log(error);
            return { 
                error: 'Failed to fetch cryptocurrency data',
                details: error.message 
            };
        }
    }

    private async updatePricesForSymbols(symbols: string[]) {
        try {
            const symbolsParam = symbols.join(',');
            const response = await firstValueFrom(
                this.httpService.get(
                    `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest`, {
                        params: {
                            symbol: symbolsParam
                        },
                        headers: {
                            'X-CMC_PRO_API_KEY': process.env.API_KEY
                        }
                    }
                )
            );

            for (const symbol of symbols) {
                if (response.data?.data?.[symbol] && response.data.data[symbol].length > 0) {
                    const newData = this.formatCryptoData(response.data.data[symbol][0]);
                    const oldData = this.cryptoCache.get(symbol);
                    
                    if (!oldData || oldData.price !== newData.price) {
                        this.cryptoCache.set(symbol, newData);
                        this.eventEmitter.emit('crypto.priceChange', {
                            symbol,
                            oldPrice: oldData?.price,
                            newPrice: newData.price,
                            percentChange: ((newData.price - (oldData?.price || newData.price)) / (oldData?.price || newData.price) * 100).toFixed(2)
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to update crypto prices:', error.message);
        }
    }

    private formatCryptoData(data) {
        return {
            name: data.name,
            symbol: data.symbol,
            price: data.quote.USD.price,
            market_cap: data.quote.USD.market_cap,
            percent_change_24h: data.quote.USD.percent_change_24h,
            last_updated: data.quote.USD.last_updated
        };
    }

    public async subscribeToRealTimeUpdates(dto: CreateSubscriptionDto) {
        const { symbol, email } = dto;
        const normalizedSymbol = symbol.toUpperCase();
      
        if (!this.cryptoCache.has(normalizedSymbol)) {
          const message = await this.getCryptoPrice(normalizedSymbol);
        }

        console.log(email);

        this.sendMail({ email: email, message: `You have successfully subscribed to ${normalizedSymbol} price updates` });
      
        return { success: true, symbol: normalizedSymbol };
      }

      async sendMail(params: { email: string, message: string }) {
    
        this.mailer.sendMail({
            from: 'Crypto Tracker <blvcksimons@gmail.com>',
            to: params.email,
            subject: `New Price Update`,
            text: params.message,
        });
    }

    async latestListings()
    {
        try{
            const response = await firstValueFrom(
                this.httpService.get(
                    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest`, {
                        headers: {
                            'X-CMC_PRO_API_KEY': process.env.API_KEY
                        }
                    }
                )
            )

            if (response.data?.data && response.data.data.length > 0) {
               return response.data;
            }
        } catch (error) {
            console.log(error);
            return { 
                error: 'Failed to fetch cryptocurrency data',
                details: error.message 
            };
        }
    }
}
