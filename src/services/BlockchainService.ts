import { db } from '../db';
import { blockchain, rpcNode, blockchainTypes } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class BlockchainService {
  static async getRPCs(type: string, chain_id: string, limit: number = 10) {
    if (!blockchainTypes.includes(type as typeof blockchainTypes[number])) {
      throw new Error(`Invalid blockchain type: '${type}'`);
    }

    const rpcs = await db.select()
      .from(rpcNode)
      .innerJoin(blockchain, eq(rpcNode.blockchainId, blockchain.id))
      .where(
        and(
          eq(blockchain.chain_id, chain_id),
          eq(blockchain.type, type as typeof blockchainTypes[number])
        )
      )
      .limit(limit);

    return rpcs.map(row => ({
      name: row.rpc_node.name,
      url: row.rpc_node.url,
      blockchain: {
        name: row.blockchain.name,
        type: row.blockchain.type,
        chain_id: row.blockchain.chain_id
      }
    }));
  }

  static async addRPC(type: string, chain_id: string, url: string, name?: string) {
    const selectedBlockchain = await db.query.blockchain.findFirst({
      where: and(
        eq(blockchain.chain_id, chain_id),
        eq(blockchain.type, type as typeof blockchainTypes[number])
      )
    });

    if (!selectedBlockchain) {
      throw Error(`Blockchain not found for type ${type} and ID ${chain_id}`);
    }

    if (!url || typeof url !== 'string') {
      throw Error('URL is required and must be a string');
    }

    await db.insert(rpcNode).values({
      blockchainId: selectedBlockchain.id,
      name: name || url.split('/').pop() || 'rpc-node',
      url
    });
  }
} 