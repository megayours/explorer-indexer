import { ethers } from 'ethers';
import { BaseBlockchain } from './BaseBlockchain';

export class EVMBlockchain extends BaseBlockchain {
  private providers: ethers.JsonRpcProvider[];

  constructor(rpcUrls: string[]) {
    super(rpcUrls);
    this.providers = rpcUrls.map(url => new ethers.JsonRpcProvider(url));
  }

  private getNextProvider(): ethers.JsonRpcProvider {
    return this.providers[this.currentProviderIndex];
  }

  async getLatestBlock(): Promise<number> {
    return await this.getNextProvider().getBlockNumber();
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
      const provider = this.getNextProvider();
      const currentUrl = this.getNextRpcUrl(); // Rotate URL for logging
      
      // Get block with transactions
      const block = await provider.getBlock(blockNumber, true);
      if (!block || !block.transactions.length) continue;

      // Get first transaction details
      const txHash = block.transactions[0];
      const tx = await provider.getTransaction(txHash);
      if (!tx) continue;

      // Get receipt
      const receipt = await provider.getTransactionReceipt(tx.hash);

      // print summary of the block
      console.log(`Synced EVM block ${blockNumber} using RPC ${currentUrl}`);
      console.log(`  - Transactions: ${block.transactions.length}`);
      for (const hash of block.transactions) {
        console.log(`    - Transaction: ${hash}`);
        const tx = await provider.getTransaction(hash);
        console.log(`      - Transaction:`, tx);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
} 