import { Request, Response } from 'express';
import { db } from '../db';
import { blockchain } from '../db/schema';

export class BlockchainController {
  /**
   * Get all blockchains
   * @param req Express request object
   * @param res Express response object
   */
  public static async getAllBlockchains(req: Request, res: Response): Promise<void> {
    try {
      const blockchains = await db.select().from(blockchain);
      res.status(200).json({ 
        success: true, 
        data: blockchains 
      });
    } catch (error) {
      console.error('Error fetching blockchains:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch blockchains', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
} 