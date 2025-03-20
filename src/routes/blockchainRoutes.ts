import { Router } from 'express';
import { BlockchainController } from '../controllers/BlockchainController';

const router = Router();

// GET endpoint to fetch all blockchains
router.get('/', BlockchainController.getAllBlockchains);

export default router; 