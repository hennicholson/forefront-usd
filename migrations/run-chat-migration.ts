import { Pool } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables')
    process.exit(1)
  }

  console.log('🚀 Starting chat tables migration...')

  const pool = new Pool({ connectionString: databaseUrl })

  try {
    // Read the SQL migration file
    const migrationPath = join(__dirname, 'create-chat-tables.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    // Execute the entire migration as a single query using Pool
    console.log(`📝 Executing migration SQL...\n`)

    try {
      await pool.query(migrationSQL)
      console.log(`✅ Migration executed successfully!\n`)
    } catch (error: any) {
      // Check if tables already exist
      if (error.message?.includes('already exists')) {
        console.log(`⚠️  Tables already exist, skipping creation\n`)
      } else {
        throw error
      }
    }

    console.log('✨ Migration completed successfully!')
    console.log('\n📊 Created tables:')
    console.log('  - chat_sessions')
    console.log('  - chat_messages')
    console.log('\n🔍 Created indexes:')
    console.log('  - idx_chat_sessions_user_id')
    console.log('  - idx_chat_sessions_last_message_at')
    console.log('  - idx_chat_messages_session_id')
    console.log('  - idx_chat_messages_created_at')

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\nFull error:', error)
    await pool.end()
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
