import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from "@shared/schema";

// Configure neon to work with WebSockets
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a pool of connections to the database
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a drizzle client using the pool and schema
export const db = drizzle(pool, { schema });

// Function to run database migration/setup
export async function setupDatabase() {
  console.log('Setting up database connection...');
  
  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}