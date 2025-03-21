CREATE TABLE "blockchain" (
    "id" serial PRIMARY KEY NOT NULL,
    "chain_id" varchar(255) NOT NULL,
    "name" varchar(255) NOT NULL,
    "type" varchar(50) NOT NULL CHECK ("type" IN ('evm', 'megayours')),
    CONSTRAINT "blockchain_type_chain_id_unique" UNIQUE("type", "chain_id")
);

CREATE TABLE "rpc_node" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "url" varchar(255) NOT NULL,
    "blockchain_id" integer NOT NULL,
    CONSTRAINT "rpc_node_blockchain_id_blockchain_id_fk" FOREIGN KEY ("blockchain_id") REFERENCES "blockchain"("id")
);

CREATE TABLE "megayours_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "blockchain_id" integer NOT NULL,
    "rid" bytea NOT NULL UNIQUE,
    "prev_block_rid" bytea NOT NULL,
    "header" bytea NOT NULL UNIQUE,
    "height" integer NOT NULL,
    "witness" bytea NOT NULL,
    "timestamp" bigint NOT NULL,
    CONSTRAINT "megayours_block_blockchain_id_fk" FOREIGN KEY ("blockchain_id") REFERENCES "blockchain"("id")
);

CREATE TABLE "witnesses" (
    "id" serial PRIMARY KEY NOT NULL,
    "block_id" integer NOT NULL,
    "witness_pubkey" bytea NOT NULL,
    "signature" bytea NOT NULL,
    CONSTRAINT "witnesses_block_id_fk" FOREIGN KEY ("block_id") REFERENCES "megayours_block"("id")
);

CREATE TABLE "transactions" (
    "id" serial PRIMARY KEY NOT NULL,
    "block_id" integer NOT NULL,
    "rid" bytea NOT NULL,
    "hash" bytea NOT NULL,
    CONSTRAINT "transactions_block_id_fk" FOREIGN KEY ("block_id") REFERENCES "megayours_block"("id")
);

-- Create an index for better query performance
CREATE INDEX "idx_megayours_block_blockchain_id" ON "megayours_block"("blockchain_id"); 