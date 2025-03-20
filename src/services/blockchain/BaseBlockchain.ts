import { BlockchainAdapter } from '../interfaces/BlockchainAdapter';

export abstract class BaseBlockchain implements BlockchainAdapter {
  protected currentProviderIndex: number = 0;

  constructor(protected readonly rpcUrls: string[]) {
    if (!rpcUrls.length) {
      throw new Error('No RPC URLs provided');
    }
  }

  protected getNextRpcUrl(): string {
    const url = this.rpcUrls[this.currentProviderIndex];
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.rpcUrls.length;
    return url;
  }

  abstract getLatestBlock(): Promise<number>;
  abstract getChainHeight(): Promise<number>;
  abstract getLastSyncedHeight(): Promise<number>;
  abstract syncBlocks(fromBlock: number, toBlock: number): Promise<void>;
} 