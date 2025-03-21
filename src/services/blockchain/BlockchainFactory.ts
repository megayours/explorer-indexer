import { BlockchainAdapter } from '../interfaces/BlockchainAdapter';
import { EVMBlockchain } from './EVMBlockchain';
import { MegaYoursBlockchain } from './MegaYoursBlockchain';

export class BlockchainFactory {
  static create(type: string, rpcUrls: string[], chainId: string, id: number): BlockchainAdapter {
    switch (type) {
      case 'evm':
        return new EVMBlockchain(rpcUrls, chainId, id);
      case 'megayours':
        return new MegaYoursBlockchain(rpcUrls, chainId, id);
      default:
        throw new Error(`Unsupported blockchain type: ${type}`);
    }
  }
} 