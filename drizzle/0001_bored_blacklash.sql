ALTER TABLE "blockchain" RENAME COLUMN "blockchain_id" TO "chain_id";--> statement-breakpoint
ALTER TABLE "blockchain" DROP CONSTRAINT "blockchain_blockchain_id_unique";--> statement-breakpoint
ALTER TABLE "blockchain" ADD CONSTRAINT "blockchain_chain_id_unique" UNIQUE("chain_id");