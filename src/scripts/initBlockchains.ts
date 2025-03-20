import { db } from '../db';
import { blockchain, blockchainTypes } from '../db/schema';

// Define the BlockchainType type based on the blockchainTypes array
type BlockchainType = typeof blockchainTypes[number];

async function main() {
  const blockchains = [
    {
      blockchain_id: '1',
      name: 'Ethereum Mainnet',
      type: 'evm' as BlockchainType,
    },
    {
      blockchain_id: '56',
      name: 'BNB Smart Chain',
      type: 'evm' as BlockchainType,
    },
    {
      blockchain_id: 'DB90CD3F2D3B725286C8B79C50498AEF8B9521A85E263EC90B0B0BA291ECD4D7',
      name: 'MegaCode',
      type: 'chromia' as BlockchainType,
    },
  ];

  console.log('Initializing blockchains...');
  
  for (const chain of blockchains) {
    await db.insert(blockchain)
      .values(chain)
      .onConflictDoUpdate({
        target: blockchain.blockchain_id,
        set: {
          name: chain.name,
          type: chain.type
        }
      }); 
    
    console.log(`Blockchain ${chain.name} initialized`);
  }

  console.log('Blockchains initialized successfully');
}

main()
  .catch((e) => {
    console.error('Failed to initialize blockchains:', e);
    process.exit(1);
  });