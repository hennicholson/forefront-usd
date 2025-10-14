import dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

async function createWorkflowsTable() {
  try {
    console.log('Creating workflows table...')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workflows (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        is_public BOOLEAN NOT NULL DEFAULT true,
        likes_count INTEGER NOT NULL DEFAULT 0,
        views_count INTEGER NOT NULL DEFAULT 0,
        forks_count INTEGER NOT NULL DEFAULT 0,
        forked_from INTEGER REFERENCES workflows(id),
        nodes JSONB NOT NULL DEFAULT '[]',
        connections JSONB NOT NULL DEFAULT '[]',
        canvas_settings JSONB,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Workflows table created successfully!')
  } catch (error) {
    console.error('Error creating workflows table:', error)
  } finally {
    process.exit()
  }
}

createWorkflowsTable()
