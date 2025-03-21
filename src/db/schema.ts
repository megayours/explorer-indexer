import { pgTable, serial, text, integer, uniqueIndex, varchar, jsonb, bigint, boolean, timestamp, index, customType } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
});

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

// Schema for MegaYours blocks
export const megayours_block = pgTable('megayours_block', {
  id: serial('id').primaryKey(),
  blockchainId: integer('blockchain_id').references(() => blockchain.id).notNull(),
  rid: bytea('rid').notNull().unique(),
  prevBlockRID: bytea('prev_block_rid').notNull(),
  header: bytea('header').notNull().unique(),
  height: integer('height').notNull(),
  witness: bytea('witness').notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull()
});

// Schema for block witnesses (signatures)
export const witnesses = pgTable('witnesses', {
  id: serial('id').primaryKey(),
  blockId: integer('block_id').references(() => megayours_block.id).notNull(),
  witness_pubkey: bytea('witness_pubkey').notNull(),
  signature: bytea('signature').notNull()
});


export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  blockId: integer('block_id').references(() => megayours_block.id).notNull(),
  rid: bytea('rid').notNull(),
  hash: bytea('hash').notNull()
});
