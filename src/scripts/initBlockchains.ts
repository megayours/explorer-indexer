import { db } from '../db';
import { blockchain, rpcNode } from '../db/schema';

const INITIAL_BLOCKCHAINS = [
  {
    name: 'Ethereum',
    type: 'evm',
    chain_id: '1',
    rpcs: [
      'https://eth-mainnet.g.alchemy.com/v2/Qia5gQ6aYsMpkmAkEFfNye0zGRHGn609',
      'https://alpha-orbital-dew.quiknode.pro/bb3a8e9a5f9a804f48d0382a7b47c8b55f3b0828/',
    ]
  },
  {
    name: 'bnb',
    type: 'evm',
    chain_id: '56',
    rpcs: [
      'https://bsc-dataseed.binance.org/',
      'https://bsc-dataseed1.defibit.io/',
    ]
  },
  {
    name: 'MegaYours',
    type: 'megayours',
    chain_id: 'DB90CD3F2D3B725286C8B79C50498AEF8B9521A85E263EC90B0B0BA291ECD4D7',
    rpcs: [
      'https://node0.testnet.chromia.com:7740',
      'https://node1.testnet.chromia.com:7740'
    ]
  }
] as const;

async function initBlockchains() {
  try {
    for (const chainData of INITIAL_BLOCKCHAINS) {
      // Insert blockchain
      const [insertedChain] = await db.insert(blockchain)
        .values({
          name: chainData.name,
          type: chainData.type,
          chain_id: chainData.chain_id
        })
        .returning();

      // Insert RPCs
      await db.insert(rpcNode)
        .values(
          chainData.rpcs.map(url => ({
            name: url.split('/').pop() || 'rpc-node',
            url,
            blockchainId: insertedChain.id
          }))
        );

      console.log(`Initialized ${chainData.name} with ${chainData.rpcs.length} RPCs`);
    }
  } catch (error) {
    console.error('Error initializing blockchains:', error);
  }
}

initBlockchains();