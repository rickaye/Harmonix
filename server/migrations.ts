import { pool, db } from './db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Creates all the database tables if they don't exist
 */
export async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created or already exists');

    // Create projects table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        bpm INTEGER NOT NULL DEFAULT 120,
        time_signature TEXT NOT NULL DEFAULT '4/4',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Projects table created or already exists');

    // Create tracks table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tracks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        color TEXT NOT NULL,
        muted BOOLEAN NOT NULL DEFAULT false,
        solo BOOLEAN NOT NULL DEFAULT false,
        volume INTEGER NOT NULL DEFAULT 75,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tracks table created or already exists');

    // Create audio_clips table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audio_clips (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        track_id INTEGER NOT NULL REFERENCES tracks(id),
        start_time INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        is_ai_generated BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Audio clips table created or already exists');

    // Create effects table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS effects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        track_id INTEGER NOT NULL REFERENCES tracks(id),
        settings JSONB NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Effects table created or already exists');

    // Create stem_separation_jobs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS stem_separation_jobs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        original_path TEXT NOT NULL,
        output_paths JSONB,
        status TEXT NOT NULL,
        error TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Stem separation jobs table created or already exists');

    // Create voice_cloning_jobs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS voice_cloning_jobs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        sample_path TEXT NOT NULL,
        text TEXT NOT NULL,
        output_path TEXT,
        status TEXT NOT NULL,
        error TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Voice cloning jobs table created or already exists');

    // Create music_generation_jobs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS music_generation_jobs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        prompt TEXT NOT NULL,
        output_path TEXT,
        status TEXT NOT NULL,
        error TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Music generation jobs table created or already exists');

    console.log('✅ All migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    return false;
  }
}