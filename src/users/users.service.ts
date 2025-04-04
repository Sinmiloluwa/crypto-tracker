import { Injectable, Inject, Request, BadRequestException, Param, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './entities/user.entity';


@Injectable()
export class UsersService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private db: NodePgDatabase<typeof schema>,
      ) {}

      @UseInterceptors(ClassSerializerInterceptor)
      async getProfile(@Param() userId: string) {
        const user = await this.db.query.users.findFirst({
            where: (users) => eq(users.id, userId),
        })

        if (!user) {
           throw new BadRequestException('User not found');
        }

        return user;
      }
}
