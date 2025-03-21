import { BlockchainAdapter } from '../interfaces/BlockchainAdapter';

export abstract class BaseBlockchain implements BlockchainAdapter {
  protected currentProviderIndex: number = 0;
  protected failedUrls: Set<string> = new Set();

  constructor(protected readonly rpcUrls: string[], protected readonly chainId: string, protected readonly id: number) {
    if (!rpcUrls.length) {
      throw new Error('No RPC URLs provided');
    }
    if (!chainId) {
      throw new Error('Chain ID is required');
    }
  }

  protected getNextRpcUrl(): string {
    // If all URLs have failed, reset failed list
    if (this.failedUrls.size === this.rpcUrls.length) {
      this.failedUrls.clear();
    }

    // Find next working URL
    let attempts = 0;
    while (attempts < this.rpcUrls.length) {
      const url = this.rpcUrls[this.currentProviderIndex];
      this.currentProviderIndex = (this.currentProviderIndex + 1) % this.rpcUrls.length;
      
      if (!this.failedUrls.has(url)) {
        return url;
      }
      attempts++;
    }

    throw new Error('All RPC URLs are failing');
  }

  protected markUrlAsFailed(url: string): void {
    this.failedUrls.add(url);
    console.warn(`Marked RPC URL as failed: ${url}`);
  }

  protected async withRetry<T>(operation: (url: string) => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.rpcUrls.length; attempt++) {
      try {
        const url = this.getNextRpcUrl();
        return await operation(url);
      } catch (error) {
        lastError = error as Error; 
        this.markUrlAsFailed(this.rpcUrls[this.currentProviderIndex]);
        console.error(`RPC call failed, trying next URL. Error:`, error);
      }
    }

    throw lastError || new Error('All RPC attempts failed');
  }

  // abstract getLatestBlock(): Promise<number>;
  abstract getChainHeight(): Promise<number>;
  abstract getLastSyncedHeight(): Promise<number>;
  abstract syncBlocks(fromBlock: number, toBlock: number): Promise<void>;
} 