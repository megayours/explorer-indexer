import { ethers } from 'ethers';
import { BaseBlockchain } from './BaseBlockchain';

export class EVMBlockchain extends BaseBlockchain {
  private providers: ethers.JsonRpcProvider[];

  constructor(rpcUrls: string[], chainId: string, id: number) {
    super(rpcUrls, chainId, id);
    this.providers = rpcUrls.map(url => new ethers.JsonRpcProvider(url));
  }

  private getNextProvider(): ethers.JsonRpcProvider {
    return this.providers[this.currentProviderIndex];
  }

  async getLatestBlock(): Promise<number> {
    return this.withRetry(async (url) => {
      const provider = new ethers.JsonRpcProvider(url);
      return await provider.getBlockNumber();
    });
  }

  async getChainHeight(): Promise<number> {
    return await this.getNextProvider().getBlockNumber();
  }

  async getLastSyncedHeight(): Promise<number> {
    // TODO: Implement getting last synced block from database
    return 0;
  }

  async syncBlocks(fromBlock: number, toBlock: number): Promise<void> {
    for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
      await this.withRetry(async (url) => {
        const provider = new ethers.JsonRpcProvider(url);
        
        const block = await provider.getBlock(blockNumber, true);
        if (!block || !block.transactions.length) return;

        console.log(`Synced EVM block ${blockNumber} using RPC ${url}`);
        console.log(`  - Transactions: ${block.transactions.length}`);
        
        for (const hash of block.transactions) {
          const tx = await provider.getTransaction(hash);
          console.log(`    - Transaction: ${hash}`);
          console.log(`      - Transaction:`, tx);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      });
    }
  }
} 