import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function dropDatabase() {
  // Connect to postgres database to be able to drop other databases
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Drop the database if it exists
    await client.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} dropped successfully`);
  } catch (error) {
    console.error('Error dropping database:', error);
  } finally {
    await client.end();
  }
}

dropDatabase().catch(console.error); 