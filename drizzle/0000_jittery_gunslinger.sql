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