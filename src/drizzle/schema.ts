import { text, pgTable, uuid, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique(),
  password: text('password'),
  status: boolean('status').default(true),
});

export const userSubscriptions = pgTable('user_subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id), 
    symbol: text('symbol'), 
    clientId: text('client_id'),
    active: boolean('active').default(true),
  });
