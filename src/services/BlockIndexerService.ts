import { EventEmitter } from 'events';
import { db } from '../db';
import { blockchain } from '../db/schema';
import { BlockchainService } from './BlockchainService';
import { ethers } from 'ethers';
import { BlockchainFactory } from './blockchain/BlockchainFactory';

class BlockIndexerService {
  private isRunning: boolean = false;
  private indexingInterval: NodeJS.Timeout | null = null;
  private eventEmitter: EventEmitter;
  private intervalMs: number = 3000; // Default: 3 seconds

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Start the block indexing process
   */
  public start(): void {
    if (this.isRunning) {
      console.log('Block indexer is already running');
      return;
    }

    console.log('Starting block indexer service...');
    this.isRunning = true;
    
    // Run immediately on start
    this.processBlockchains();
    
    // Then schedule regular runs
    this.indexingInterval = setInterval(() => {
      this.processBlockchains();
    }, this.intervalMs);
    
    console.log(`Block indexer started. Running every ${this.intervalMs / 1000} seconds`);
  }

  /**
   * Stop the block indexing process
   */
  public stop(): void {
    if (!this.isRunning) {
      console.log('Block indexer is not running');
      return;
    }

    if (this.indexingInterval) {
      clearInterval(this.indexingInterval);
      this.indexingInterval = null;
    }
    
    this.isRunning = false;
    console.log('Block indexer stopped');
  }

  /**
   * Process all blockchains
   */
  private async processBlockchains(): Promise<void> {
    try {
      // Get all blockchains from the database
      const blockchains = await db.select().from(blockchain);
      
      console.log(`Processing ${blockchains.length} blockchains for new blocks...`);
      
      // Process each blockchain in parallel
      const indexingPromises = blockchains.map(chain => {
        // for now only do chains with type evm and chain_id 56
        if (chain.type === 'megayours') { // TODO remove
          return this.indexBlockchain(chain.chain_id, chain.type, chain.id);
        }
      });
      
      await Promise.all(indexingPromises);
      
      console.log('Finished processing blockchains');
    } catch (error) {
      console.error('Error processing blockchains:', error);
    }
  }

  /**
   * Index blocks for a specific blockchain
   */
  private async indexBlockchain(chainId: string, blockchainType: string, rowId: number): Promise<void> {
    try {
      console.log(`Indexing blocks for blockchain ${chainId} (${blockchainType})`);
      
      // Get RPC nodes
      const rpcNodes = await BlockchainService.getRPCs(blockchainType, chainId, 10);
      if (rpcNodes.length === 0) {
        throw new Error('No RPC nodes available');
      }

      // Create blockchain adapter using first RPC node (you might want to implement RPC node selection strategy)
      const blockchain = BlockchainFactory.create(blockchainType, rpcNodes.map(r => r.url), chainId, rowId);
      const currentHeight = await blockchain.getChainHeight();

      // Get heights
      const lastSynced = await blockchain.getLastSyncedHeight();

      // Sync new blocks
      if (currentHeight > lastSynced) {
        await blockchain.syncBlocks(lastSynced + 1, currentHeight);
      }

      // this.eventEmitter.emit('blocksIndexed', {
      //   chainId,
      //   blockchainType,
      //   latestBlock,
      //   lastSynced,
      //   timestamp: new Date()
      // });
    } catch (error) {
      console.error(`Error indexing blockchain ${blockchainType}, ${chainId}:`, error);
    }
  }

  /**
   * Set the indexing interval
   */
  public setIndexingInterval(ms: number): void {
    this.intervalMs = ms;
    
    // Restart the indexer if it's running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Subscribe to indexing events
   */
  public onBlocksIndexed(callback: (data: any) => void): void {
    this.eventEmitter.on('blocksIndexed', callback);
  }
}

export default BlockIndexerService; 