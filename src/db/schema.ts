import { pgTable, serial, text, integer, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const blockchainTypes = ['evm', 'megayours'] as const;

export const blockchain = pgTable('blockchain', {
  id: serial('id').primaryKey(),
  chain_id: varchar('chain_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).$type<'evm' | 'megayours'>().notNull()
});

export const rpcNode = pgTable('rpc_node', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  blockchainId: integer('blockchain_id').references(() => blockchain.id).notNull()
}); 