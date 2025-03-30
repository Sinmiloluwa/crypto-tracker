import { Resolver, Query, Args, Subscription } from '@nestjs/graphql';
import { CryptoService } from './crypto.service';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver('Crypto')
export class CryptoResolver {
    constructor(private readonly cryptoService: CryptoService) {}

    @Query(() => String)
    async getCryptoPrice(@Args('symbol') symbol: string) {
        const price = await this.cryptoService.getCryptoPrice(symbol);
        return price[symbol].usd;
    }

    @Subscription(() => String)
    priceChange() {
        return (pubSub as any).asyncIterator(['priceChanged']);
    }

    async monitorPrice(symbol: string) {
        setInterval(async () => {
            const newPrice = await this.cryptoService.getCryptoPrice(symbol);
            pubSub.publish('priceChanged', { priceChange: newPrice[symbol].usd });
        }, 5000);
    }
}
