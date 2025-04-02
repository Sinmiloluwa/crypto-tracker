import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  // async getFirstRole() {
  //   const existingUserRole = await this.db.query.user_role.findFirst({});
  //   return existingUserRole;
  // }
  async create(createAuthDto: CreateAuthDto) {
    const user = await this.db.query.users.findFirst({
      where: (users) => eq(users.email, createAuthDto.email),
    });

    if(user) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 12);

    const newUser = await this.db.insert(users).values({
      email: createAuthDto.email,
      password: hashedPassword,
    });

    return {message: "User Created"};
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
