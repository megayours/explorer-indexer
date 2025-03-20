import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  rpcUrl: process.env.RPC_URL,
  scanInterval: 5000, // 5 seconds
}; 