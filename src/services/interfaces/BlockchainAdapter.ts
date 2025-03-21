export interface BlockchainAdapter {
  getChainHeight(): Promise<number>;
  getLastSyncedHeight(): Promise<number>;
  syncBlocks(fromBlock: number, toBlock: number): Promise<void>;
} 