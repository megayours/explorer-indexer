import { BaseBlockchain } from './BaseBlockchain';
import { encryption, RawGtv, gtv } from 'postchain-client';

interface BlockRaw {
    rid: Buffer;
    prevBlockRID: Buffer;
    header: Buffer;
    height: number;
    transactions?: [{
        rid: Buffer;
        hash: Buffer;
    }];
    witness: Buffer;
    witnesses: Buffer[];
    // witness_signature: Buffer[];
    timestamp: number;
}

export class MegaYoursBlockchain extends BaseBlockchain {
  constructor(rpcUrls: string[], chainId: string) {
    super(rpcUrls, chainId);
  }

  async getLatestBlock(): Promise<BlockRaw> {
    return this.withRetry(async (url) => {
      const response = await fetch(`${url}/blocks/${this.chainId}?limit=1&before-height=2147483647`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the raw data from the response
      const blockDataArray = await response.json();
      const blockData = blockDataArray[0]; // Get the first block
      
      // Convert JSON strings to Buffer objects
      const block: BlockRaw = {
        ...blockData,
        rid: Buffer.from(blockData.rid, 'hex'),
        prevBlockRID: Buffer.from(blockData.prevBlockRID || '', 'hex'),
        header: Buffer.from(blockData.header || '', 'hex'),
        witness: Buffer.from(blockData.witness || '', 'hex'),
        witnesses: (blockData.witnesses || []).map((w: string) => Buffer.from(w, 'hex'))
      };

      console.log("SIGNERS", block.witnesses.map((w: Buffer) => w.toString('hex')));
      
      // Log basic block info
      console.log(`Block height: ${block.height}, timestamp: ${block.timestamp}`);
      
      // Simple signature validation with first public key
      if (block.witness && block.witnesses && block.witnesses.length > 0) {
        try {
          const witness = block.witness;
          
          // First 4 bytes is the signature count
          const signatureCount = witness.readUInt32BE(0);
          console.log(`Witness contains ${signatureCount} signatures`);
          
          // Parse witness buffer to extract signatures
          let offset = 4; // Start after signature count
          let foundValidSignature = false;
          
          for (let i = 0; i < signatureCount; i++) {
            // Read subject ID (public key) size
            const subjectIdSize = witness.readUInt32BE(offset);
            offset += 4;
            
            // Read subject ID (public key)
            const subjectId = witness.slice(offset, offset + subjectIdSize);
            offset += subjectIdSize;
            
            // Read signature size
            const signatureSize = witness.readUInt32BE(offset);
            offset += 4;
            
            // Read signature data
            const signature = witness.slice(offset, offset + signatureSize);
            offset += signatureSize;
            
            console.log(`Signature ${i+1}:`);
            console.log(`- Public key (${subjectIdSize} bytes): ${subjectId.toString('hex')}`);
            console.log(`- Signature (${signatureSize} bytes): ${signature.toString('hex')}`);
            
            // Find matching public key from witnesses array
            const matchingPubKey = block.witnesses.find(w => w.equals(subjectId));
            
            if (matchingPubKey) {
              console.log("- Found matching public key in witnesses array");
              
              try {
                const isValid = encryption.checkDigestSignature(
                  block.rid,
                  matchingPubKey,
                  signature
                );
                console.log(`- Validation result: ${isValid}`);
                
                if (isValid) {
                  foundValidSignature = true;
                  console.log("✓ Found valid signature!");
                }
              } catch (sigError: any) {
                console.log(`- Validation error: ${sigError.message}`);
              }
            } else {
              console.log("- No matching public key found in witnesses array");
            }
          }
          
          if (!foundValidSignature) {
            console.log("❌ No valid signatures found");
          }
          
        } catch (error) {
          console.error("Error parsing witness buffer:", error);
        }
      }

      return block;
    });
  }

  async getChainHeight(): Promise<number> {
    const blockRaw = await this.getLatestBlock();
    return blockRaw.height;
  }

  async getLastSyncedHeight(): Promise<number> {
    return 0; // TODO: Implement
  }

  async syncBlocks(fromBlock: number, toBlock: number): Promise<void> {
    for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
      await this.withRetry(async (url) => {
        // Implement block syncing
        console.log(`Synced MegaYours block ${blockNumber} using RPC ${url}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      });
    }
  }
} 