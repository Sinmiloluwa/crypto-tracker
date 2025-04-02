import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService){}

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Request() req): Promise<UserEntity> {
        const userId = req.user.sub;
        const user = await this.userService.getProfile(userId);
        return new UserEntity({
            id: user.id,
            email: user.email,
        });
    }
}
