require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

async function clearMessages() {
  const sql = neon(process.env.DATABASE_URL)

  try {
    console.log('🗑️  Clearing all messages from database...\n')

    // Clear comments first (foreign key constraint)
    const commentsResult = await sql`DELETE FROM comments`
    console.log(`✅ Deleted ${commentsResult.count || 0} comments`)

    // Clear reactions
    const reactionsResult = await sql`DELETE FROM reactions`
    console.log(`✅ Deleted ${reactionsResult.count || 0} reactions`)

    // Clear direct messages
    const messagesResult = await sql`DELETE FROM messages`
    console.log(`✅ Deleted ${messagesResult.count || 0} direct messages`)

    // Clear posts (channel messages)
    const postsResult = await sql`DELETE FROM posts`
    console.log(`✅ Deleted ${postsResult.count || 0} posts`)

    // Clear notifications related to messages
    const notificationsResult = await sql`DELETE FROM notifications WHERE type IN ('message', 'mention', 'comment', 'reaction')`
    console.log(`✅ Deleted ${notificationsResult.count || 0} message-related notifications`)

    console.log('\n✨ Database cleared successfully!')
    console.log('📡 All new messages will now use Ably for real-time delivery.')
    console.log('🔄 Refresh your browser to see the clean state.')
  } catch (error) {
    console.error('\n❌ Error clearing messages:', error.message)
    process.exit(1)
  }
}

clearMessages()
