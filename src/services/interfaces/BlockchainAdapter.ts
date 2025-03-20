export interface BlockchainAdapter {
  getLatestBlock(): Promise<number>;
  getChainHeight(): Promise<number>;
  getLastSyncedHeight(): Promise<number>;
  syncBlocks(fromBlock: number, toBlock: number): Promise<void>;
} 