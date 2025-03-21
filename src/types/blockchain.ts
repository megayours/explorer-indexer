export interface Block {
    rid: Buffer;
    prevBlockRID: Buffer;
    header: Buffer;
    height: number;
    transactions?: { rid: Buffer; hash: Buffer; }[];
    witness: Buffer;
    witnesses: Buffer[];
    timestamp: number;
} 