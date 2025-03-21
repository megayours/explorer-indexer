import { Block } from '../../types/blockchain';
import { encryption } from 'postchain-client';

export class MegaYoursBlock implements Block {
    public rid: Buffer;
    public prevBlockRID: Buffer;
    public header: Buffer;
    public height: number;
    public witness: Buffer;
    public witnesses: Buffer[];
    public transactions: { rid: Buffer; hash: Buffer; }[];
    public timestamp: number;

    constructor(data: Block) {
        this.rid = data.rid;
        this.prevBlockRID = data.prevBlockRID;
        this.header = data.header;
        this.height = data.height;
        this.witness = data.witness;
        this.witnesses = data.witnesses;
        this.transactions = data.transactions || [];
        this.timestamp = data.timestamp;
    }

    /**
     * Parse the witness data to extract signatures and corresponding public keys
     */
    public parseWitnessData(): Array<{pubKey: Buffer, signature: Buffer}> | null {
        if (!this.witness || !this.witnesses || !this.witnesses.length) {
            console.log("Block has no witness or witnesses");
            return null;
        }

        try {
            const signatures: Array<{pubKey: Buffer, signature: Buffer}> = [];
            
            // First 4 bytes is the signature count
            const signatureCount = this.witness.readUInt32BE(0);
            console.log(`Block contains ${signatureCount} signatures`);
            
            // Parse witness buffer to extract signatures
            let offset = 4; // Start after signature count
            
            for (let i = 0; i < signatureCount; i++) {
                // Read subject ID (public key) size
                const pubKeySize = this.witness.readUInt32BE(offset);
                offset += 4;
                
                // Read subject ID (public key)
                const pubKeyData = this.witness.slice(offset, offset + pubKeySize);
                offset += pubKeySize;
                
                // Read signature size
                const signatureSize = this.witness.readUInt32BE(offset);
                offset += 4;
                
                // Read signature data
                const signatureData = this.witness.slice(offset, offset + signatureSize);
                offset += signatureSize;
                
                // Find matching public key from witnesses array
                const matchingPubKey = this.witnesses.find(w => w.equals(pubKeyData));
                
                if (matchingPubKey) {
                    signatures.push({
                        pubKey: matchingPubKey,
                        signature: signatureData
                    });
                } else {
                    console.log(`Warning: Signature ${i+1} has no matching public key in witnesses array`);
                }
            }
            
            return signatures;
            
        } catch (error) {
            console.error("Error parsing witness data:", error);
            return null;
        }
    }

    /**
     * Verify all signatures in the block
     */
    public verifySignatures(): boolean {
        const signatures = this.parseWitnessData();
        
        if (!signatures || signatures.length === 0) {
            console.log("No valid signatures to verify");
            return false;
        }
        
        console.log(`Verifying ${signatures.length} signatures...`);
        let validCount = 0;
        
        // Verify each signature
        for (let i = 0; i < signatures.length; i++) {
            const { pubKey, signature } = signatures[i];
            
            try {
                const isValid = encryption.checkDigestSignature(
                    this.rid,
                    pubKey,
                    signature
                );
                
                if (isValid) {
                    console.log(`✓ Signature ${i+1} is valid`);
                    validCount++;
                } else {
                    console.log(`✗ Signature ${i+1} is invalid`);
                    return false; // If any signature is invalid, the entire block is invalid
                }
            } catch (error: any) {
                console.log(`✗ Signature ${i+1} validation error: ${error.message}`);
                return false;
            }
        }
        
        // All signatures must be valid
        const allValid = validCount === signatures.length;
        
        if (allValid) {
            console.log(`✓ All ${validCount} signatures are valid`);
        } else {
            console.log(`✗ Only ${validCount} of ${signatures.length} signatures are valid`);
        }
        
        return allValid;
    }
    
    static fromRawData(rawBlock: any): MegaYoursBlock {
        return new MegaYoursBlock({
            rid: Buffer.from(rawBlock.rid, 'hex'),
            prevBlockRID: Buffer.from(rawBlock.prevBlockRID || '', 'hex'),
            header: Buffer.from(rawBlock.header || '', 'hex'),
            height: rawBlock.height,
            witness: Buffer.from(rawBlock.witness || '', 'hex'),
            witnesses: (rawBlock.witnesses || []).map((w: string) => Buffer.from(w, 'hex')),
            transactions: rawBlock.transactions?.map((tx: any) => ({
                rid: Buffer.from(tx.rid, 'hex'),
                hash: Buffer.from(tx.hash, 'hex')
            })),
            timestamp: rawBlock.timestamp
        });
    }
}