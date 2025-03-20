import { db } from '../db';
import { blockchain, rpcNode } from '../db/schema';

async function resetDb() {
  try {
    console.log('Resetting database...');
    
    // Delete all records from tables in correct order (respect foreign keys)
    await db.delete(rpcNode);
    await db.delete(blockchain);
    
    console.log('Database reset complete');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

resetDb(); 