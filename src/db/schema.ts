import { pgTable, serial, text, integer, uniqueIndex, varchar, jsonb, bigint } from 'drizzle-orm/pg-core';

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

export const megayoursBlock = pgTable('megayours_block', {
  id: serial('id').primaryKey(),
  blockchainId: integer('blockchain_id')
    .references(() => blockchain.id)
    .notNull(),
  blockNumber: bigint('block_number', { mode: 'number' }).notNull(),
  blockHash: varchar('block_hash', { length: 255 }).notNull(),
  blockTimestamp: bigint('block_timestamp', { mode: 'number' }).notNull(),
  blockTransactions: jsonb('block_transactions').notNull()
}); 