import { db } from '../../db';
import { BaseBlockchain } from './BaseBlockchain';
import { encryption, RawGtv, gtv } from 'postchain-client';
import { blockchain, megayours_block, witnesses, transactions } from '../../db/schema';
import { MegaYoursBlock } from './MegaYoursBlock';
import { Block } from '../../types/blockchain';

export class MegaYoursBlockchain extends BaseBlockchain {
  constructor(rpcUrls: string[], chainId: string, id: number) {
    super(rpcUrls, chainId, id);
  }

  async getLatestBlock(): Promise<Block> {
    return this.withRetry(async (url) => {
      const response = await fetch(`${url}/blocks/${this.chainId}?limit=1&before-height=2147483647`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawBlocks = await response.json() as any[];
      return MegaYoursBlock.fromRawData(rawBlocks[0]);
    });
  }

  async getBlockByHeight(height: number): Promise<MegaYoursBlock> {
    return this.withRetry(async (url) => {
      const response = await fetch(`${url}/blocks/${this.chainId}/height/${height}`);
      const rawBlock = await response.json();
      return MegaYoursBlock.fromRawData(rawBlock);
    });
  }

  async getChainHeight(): Promise<number> {
    const blockRaw = await this.getLatestBlock();
    return blockRaw.height;
  }

  async getLastSyncedHeight(): Promise<number> {
    const result = await db.query.megayours_block.findMany({
      orderBy: (megayours_block, { desc }) => [desc(megayours_block.height)],
      limit: 1
    });

    if(result.length === 0) {
      return 0;
    }

    return result[0].height;
  }

  async syncBlocks(fromBlock: number, toBlock: number): Promise<void> {
    for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
        try {
            await this.withRetry(async (url) => {
                const block = await this.getBlockByHeight(blockNumber);
                console.log(`Processing block ${blockNumber}...`);

                try {
                    // verify signatures
                    const blockWitness = await block.verifySignatures();
                    if (!blockWitness) {
                        throw new Error('Block signature verification failed');
                    }

                    // Insert block and get ID
                    console.log("id ", this.id);
                    const [{ inserted: blockId }] = await db.insert(megayours_block).values({
                        blockchainId: 17,
                        rid: block.rid,
                        prevBlockRID: Buffer.from(block.prevBlockRID),
                        header: Buffer.from(block.header),
                        height: block.height,
                        witness: Buffer.from(block.witness),
                        timestamp: block.timestamp
                    }).returning({ inserted: megayours_block.id });

                    // Insert witnesses
                    if (block.witnesses && block.witnesses.length > 0) {
                        await db.insert(witnesses).values(
                            block.witnesses.map(witness => ({
                                blockId: blockId,
                                witness_pubkey: Buffer.from(witness),
                                signature: Buffer.from(witness)
                            }))
                        );
                    }

                    // Insert transactions
                    if (block.transactions && block.transactions.length > 0) {
                        await db.insert(transactions).values(
                            block.transactions.map(tx => ({
                                blockId: blockId,
                                rid: Buffer.from(tx.rid),
                                hash: Buffer.from(tx.hash)
                            }))
                        );
                    }

                    console.log(`Successfully synced block ${blockNumber}`);
                } catch (dbError) {
                    console.error(`Database error for block ${blockNumber}:`, dbError);
                    throw dbError;
                }
            });
        } catch (error) {
            console.error(`Failed to sync block ${blockNumber} after all retries:`, error);
            throw error;
        }
    }
  }
} 