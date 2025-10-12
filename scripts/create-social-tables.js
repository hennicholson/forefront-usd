const { neon } = require('@neondatabase/serverless')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function createTables() {
  console.log('Creating social network tables...')

  try {
    // Create messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id TEXT NOT NULL REFERENCES users(id),
        receiver_id TEXT REFERENCES users(id),
        room_id TEXT,
        content TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ Created messages table')

    // Create connections table
    await sql`
      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        follower_id TEXT NOT NULL REFERENCES users(id),
        following_id TEXT NOT NULL REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ Created connections table')

    // Create posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ Created posts table')

    // Create comments table
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ Created comments table')

    // Create reactions table
    await sql`
      CREATE TABLE IF NOT EXISTS reactions (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id),
        comment_id INTEGER REFERENCES comments(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ Created reactions table')

    // Create study_groups table
    await sql`
      CREATE TABLE IF NOT EXISTS study_groups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        topic TEXT NOT NULL,
        created_by TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ Created study_groups table')

    // Create group_members table
    await sql`
      CREATE TABLE IF NOT EXISTS group_members (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES study_groups(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        role TEXT NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ Created group_members table')

    // Create notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ Created notifications table')

    console.log('\n✅ All tables created successfully!')
  } catch (error) {
    console.error('Error creating tables:', error)
    throw error
  }
}

createTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
