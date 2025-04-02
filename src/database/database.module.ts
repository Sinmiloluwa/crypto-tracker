import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database-connection';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';

@Module({
    providers: [
        {
            provide: DATABASE_CONNECTION,
            useFactory: (configService: ConfigService) => {
                const pool = new Pool({
                    connectionString: configService.get<string>('DATABASE_URL'),
                    ssl: false
                });

                pool.on('error', (err) => {
                    console.error('Unexpected error on idle client', err);
                });

                return drizzle(pool, {
                    schema: schema
                })
            },
            inject: [ConfigService]
        }
    ],
    exports: [DATABASE_CONNECTION]
})
export class DatabaseModule {}
