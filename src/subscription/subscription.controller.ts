import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('subscription')
export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService){}

    @UseGuards(AuthGuard)
    @Post('subscribe/:symbol')
    async subscribe(@Param('symbol') symbol:string, @Req() req) {
        const user = req.user;
        try {
            await this.subscriptionService.subscribeToUpdate({symbol, user});
            return { message: `Your subscription to ${symbol} was successful` };
        } catch (error) {
            return { message: error.message };
        }
    }
}
