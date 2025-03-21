import { BlockchainAdapter } from '../interfaces/BlockchainAdapter';
import { EVMBlockchain } from './EVMBlockchain';
import { MegaYoursBlockchain } from './MegaYoursBlockchain';

export class BlockchainFactory {
  static create(type: string, rpcUrls: string[], chainId: string): BlockchainAdapter {
    switch (type) {
      case 'evm':
        return new EVMBlockchain(rpcUrls, chainId);
      case 'megayours':
        return new MegaYoursBlockchain(rpcUrls, chainId);
      default:
        throw new Error(`Unsupported blockchain type: ${type}`);
    }
  }
} 