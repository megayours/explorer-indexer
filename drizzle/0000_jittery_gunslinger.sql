CREATE TABLE "blockchain" (
	"id" serial PRIMARY KEY NOT NULL,
	"chain_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL CHECK ("type" IN ('evm', 'megayours')),
	CONSTRAINT "blockchain_type_chain_id_unique" UNIQUE("type", "chain_id")
);
--> statement-breakpoint
CREATE TABLE "rpc_node" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"blockchain_id" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rpc_node" ADD CONSTRAINT "rpc_node_blockchain_id_blockchain_id_fk" FOREIGN KEY ("blockchain_id") REFERENCES "public"."blockchain"("blockchain_id") ON DELETE no action ON UPDATE no action;

CREATE TABLE "megayours_block" (
	"id" serial PRIMARY KEY NOT NULL,
	"blockchain_id" integer NOT NULL,
	-- blockchain_id is foreign key to blockchain table
	CONSTRAINT "megayours_block_blockchain_id_fk" FOREIGN KEY ("blockchain_id") REFERENCES "blockchain"("id"),
	-- blockchain_id must be of type megayours
	CONSTRAINT "megayours_block_blockchain_type_check" CHECK (
		EXISTS (
			SELECT 1 FROM blockchain b 
			WHERE b.id = blockchain_id 
			AND b.type = 'megayours'
		)
	)
	"rid" bytea NOT NULL,
	"prev_block_rid" bytea NOT NULL,
	"header" bytea NOT NULL,
	"height" bigint NOT NULL,
	"witness" bytea NOT NULL,
	"witnesses": bytea NOT NULL, -- this is an array of witnesses
	"witness_signature": bytea NOT NULL, -- this might be deprecated
	"timestamp" bigint NOT NULL,
);

-- Create an index for better query performance
CREATE INDEX "idx_megayours_block_blockchain_id" ON "megayours_block"("blockchain_id");