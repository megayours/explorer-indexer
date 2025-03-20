import { pgTable, serial, text, integer, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const blockchainTypes = ['evm', 'chromia', 'solana'] as const;

export const blockchain = pgTable('blockchain', {
  id: serial('id').primaryKey(),
  blockchain_id: varchar('blockchain_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).$type<typeof blockchainTypes[number]>().notNull()
});

export const rpcNode = pgTable('rpc_node', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  blockchainId: integer('blockchain_id').references(() => blockchain.id).notNull()
}); 