import express from 'express';
import cors from 'cors';
import blockchainRoutes from './routes/blockchainRoutes';
import BlockIndexerService from './services/BlockIndexerService';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize block indexer
const blockIndexer = new BlockIndexerService();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',  // Be more permissive with CORS for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Enhanced CORS settings

// Routes
app.use('/api/blockchains', blockchainRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api/blockchains`);
  
  // Start the block indexer
  blockIndexer.start();
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  blockIndexer.stop();
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  blockIndexer.stop();
  await pool.end();
  process.exit(0);
});

export default app; 