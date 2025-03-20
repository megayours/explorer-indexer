import { EventEmitter } from 'events';
import { db } from '../db';
import { blockchain } from '../db/schema';

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
      const indexingPromises = blockchains.map(chain => 
        this.indexBlockchain(chain.id, chain.type)
      );
      
      await Promise.all(indexingPromises);
      
      console.log('Finished processing blockchains');
    } catch (error) {
      console.error('Error processing blockchains:', error);
    }
  }

  /**
   * Index blocks for a specific blockchain
   * This is where the actual indexing logic would be implemented
   */
  private async indexBlockchain(blockchainId: number, blockchainType: string): Promise<void> {
    try {
      console.log(`Indexing blocks for blockchain ${blockchainId} (${blockchainType})`);
      
      // TODO: Implement blockchain-specific indexing logic
      
      // For now, just log that we would be indexing
      console.log(`Would index new blocks for blockchain ${blockchainId}`);
      
      // Emit an event that can be listened to elsewhere in the application
      this.eventEmitter.emit('blocksIndexed', {
        blockchainId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error indexing blockchain ${blockchainId}:`, error);
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