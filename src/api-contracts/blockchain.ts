import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

const BlockchainSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(['evm', 'megayours']),
  chain_id: z.string()
});

const RPCNodeSchema = z.object({
  name: z.string(),
  url: z.string(),
  blockchain: z.object({
    name: z.string(),
    type: z.string(),
    chain_id: z.string()
  })
});

export const blockchainContract = c.router({
  getAllBlockchains: {
    method: 'GET',
    path: '/',
    responses: {
      200: z.object({
        success: z.boolean(),
        data: z.array(BlockchainSchema)
      })
    }
  },
  getRPCs: {
    method: 'GET',
    path: '/:type/bid/:chain_id/rpcs',
    pathParams: z.object({
      type: z.enum(['evm', 'megayours']),
      chain_id: z.string()
    }),
    query: z.object({
      limit: z.string().transform((val) => parseInt(val)).optional()
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
        data: z.array(RPCNodeSchema)
      })
    }
  },
  addRPC: {
    method: 'POST',
    path: '/:type/bid/:chain_id/rpcs',
    pathParams: z.object({
      type: z.enum(['evm', 'megayours']),
      chain_id: z.string()
    }),
    body: z.object({
      url: z.string(),
      name: z.string().optional()
    }),
    responses: {
      201: z.object({
        success: z.boolean(),
        message: z.string()
      })
    }
  }
}); 