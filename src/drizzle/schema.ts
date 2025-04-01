import { text, pgTable, uuid, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique(),
  password: text('password'),
  status: boolean('status').default(true),
});
