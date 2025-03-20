import { BlockchainAdapter } from '../interfaces/BlockchainAdapter';
import { EVMBlockchain } from './EVMBlockchain';
import { MegaYoursBlockchain } from './MegaYoursBlockchain';

export class BlockchainFactory {
  static create(type: string, rpcUrls: string[]): BlockchainAdapter {
    switch (type) {
      case 'evm':
        return new EVMBlockchain(rpcUrls);
      case 'megayours':
        return new MegaYoursBlockchain(rpcUrls);
      default:
        throw new Error(`Unsupported blockchain type: ${type}`);
    }
  }
} 