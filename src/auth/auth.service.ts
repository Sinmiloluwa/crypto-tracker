import { Injectable, Inject } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';

@Injectable()
export class AuthService {
  // constructor(
  //   @Inject(DrizzleAsyncProvider)
  //   private db: NodePgDatabase<typeof schema>,
  // ) {}

  // async getFirstRole() {
  //   const existingUserRole = await this.db.query.user_role.findFirst({});
  //   return existingUserRole;
  // }
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
