import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService
  ) {}

  // async getFirstRole() {
  //   const existingUserRole = await this.db.query.user_role.findFirst({});
  //   return existingUserRole;
  // }
  async create(createAuthDto: CreateAuthDto) {
    const user = await this.validateUser({ email: createAuthDto.email });

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

  async login({ email, password }: { email: string; password: string })
  {
    const user = await this.validateUser({ email: email });

    if(!user) {
      throw new BadRequestException('Invalid Credentialss');
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if(!checkPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { sub: user.id, user: user };

    const access_token = await this.jwtService.signAsync(payload);

    const { password: _, ...userWithoutPassword } = user;

    return { ...userWithoutPassword, access_token };
  }

  async validateUser({email}: {email: string}) {
    const user = await this.db.query.users.findFirst({
      where: (users) => eq(users.email, email),
    });

    return user;
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
