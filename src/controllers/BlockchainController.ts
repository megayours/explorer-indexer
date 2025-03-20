import { db } from '../db';
import { blockchain } from '../db/schema';
import { initServer } from '@ts-rest/express';
import { blockchainContract } from '../api-contracts/blockchain';
import { BlockchainService } from '../services/BlockchainService';

const s = initServer();

export const blockchainRouter = s.router(blockchainContract, {
  getAllBlockchains: async () => {
    const blockchains = await db.select().from(blockchain);
    return {
      status: 200,
      body: { success: true, data: blockchains }
    };
  },
  getRPCs: async ({ params: { type, chain_id }, query: { limit } }) => {
    try {
      const rpcs = await BlockchainService.getRPCs(type, chain_id, limit);
      return {
        status: 200,
        body: { success: true, data: rpcs }
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          status: error.message.includes('Invalid') ? 400 : 500,
          body: { 
            success: false, 
            message: 'Failed to fetch RPCs',
            error: error.message
          }
        };
      }
      return {
        status: 500,
        body: {
          success: false,
          message: 'Internal server error',
          error: 'An unexpected error occurred'
        }
      };
    }
  },
  addRPC: async ({ params: { type, chain_id }, body: { url, name } }) => {
    try {
      await BlockchainService.addRPC(type, chain_id, url, name);
      return {
        status: 201,
        body: { success: true, message: 'RPC node added successfully' }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        status: errorMessage.includes('not found') ? 404 : 500,
        body: { 
          success: false, 
          message: 'Failed to add RPC node',
          error: errorMessage
        }
      };
    }
  }
});

export class BlockchainController {
  public static getApiDocs(): Record<string, any> {
    return {
      name: 'Blockchain RPC API',
      version: '1.0.0',
      endpoints: {
        '/api/blockchains': {
          GET: {
            description: 'Get all blockchains',
            response: {
              success: true,
              data: '[{ id, name, type, chain_id }]'
            }
          }
        },
        '/api/blockchains/:type/bid/:blockchain_id/rpcs': {
          GET: {
            description: 'Get RPC nodes for a specific blockchain',
            params: {
              type: 'string (evm|megayours)',
              blockchain_id: 'string',
              limit: 'number (optional, default: 10)'
            },
            response: {
              success: true,
              data: '[{ name, url, blockchain: { name, type, chain_id } }]'
            }
          },
          POST: {
            description: 'Add a new RPC node',
            body: {
              url: 'string (required)',
              name: 'string (optional)'
            },
            response: {
              success: true,
              message: 'RPC node added successfully'
            }
          }
        }
      }
    };
  }
} 