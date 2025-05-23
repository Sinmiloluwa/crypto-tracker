import { Controller, Get, Param, Post} from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Controller('crypto')
export class CryptoController {
    constructor(private cryptoService: CryptoService) {}

    @Get('price/:symbol')
    async getPrice(@Param('symbol') symbol: string) {
        return await this.cryptoService.getCryptoPrice(symbol);
    }

    @Get('latest-listings')
    async latestListings() {
        return await this.cryptoService.latestListings();
    }
}
