import { generateOpenApi } from '@ts-rest/open-api';
import { blockchainContract } from './api-contracts/blockchain';

export const openApiDocument = generateOpenApi(blockchainContract, {
  info: {
    title: 'Blockchain RPC API',
    version: '1.0.0',
    description: 'API for managing blockchain RPC nodes'
  },
  servers: [
    {
      url: '/api/blockchains',
      description: 'Blockchain API'
    }
  ]
}); 