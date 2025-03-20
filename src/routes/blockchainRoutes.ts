import { Router } from 'express';
import { createExpressEndpoints } from '@ts-rest/express';
import { blockchainContract } from '../api-contracts/blockchain';
import { blockchainRouter } from '../controllers/BlockchainController';

const router = Router();
createExpressEndpoints(blockchainContract, blockchainRouter, router);

export default router; 