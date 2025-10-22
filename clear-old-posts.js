import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function clearOldPosts() {
  console.log('🗑️  Clearing old posts and related data...\n')
  
  try {
    // Delete reactions first
    const reactions = await sql`
      DELETE FROM reactions
      WHERE post_id NOT IN (
        SELECT id FROM posts
        ORDER BY created_at DESC
        LIMIT 10
      )
    `
    console.log(`✅ Deleted ${reactions.length} old reactions`)
    
    // Delete comments
    const comments = await sql`
      DELETE FROM comments
      WHERE post_id NOT IN (
        SELECT id FROM posts
        ORDER BY created_at DESC
        LIMIT 10
      )
    `
    console.log(`✅ Deleted ${comments.length} old comments`)
    
    // Now delete old posts
    const posts = await sql`
      DELETE FROM posts
      WHERE id NOT IN (
        SELECT id FROM posts
        ORDER BY created_at DESC
        LIMIT 10
      )
    `
    
    console.log(`✅ Deleted ${posts.length} old posts`)
    console.log('✅ Kept 10 most recent posts\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

clearOldPosts()
