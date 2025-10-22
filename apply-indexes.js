import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const conversationIndexes = `
-- Additional indexes for conversation performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_lookup
  ON messages(sender_id, receiver_id, created_at DESC)
  WHERE receiver_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_participants
  ON messages(LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC)
  WHERE receiver_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(receiver_id, sender_id)
  WHERE receiver_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reactions_user_post
  ON reactions(user_id, post_id, type);
`;

const networkIndexes = `
-- Network Performance Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver_time
  ON messages(sender_id, receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender_time
  ON messages(receiver_id, sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_time
  ON messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_time
  ON messages(receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_topic_time
  ON posts(topic, created_at DESC)
  WHERE topic IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_null_topic_time
  ON posts(created_at DESC)
  WHERE topic IS NULL;

CREATE INDEX IF NOT EXISTS idx_reactions_post_id
  ON reactions(post_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id
  ON comments(post_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_time
  ON notifications(user_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_name_lower
  ON users(LOWER(name));
`;

async function applyIndexes() {
  try {
    console.log('Applying conversation indexes...');
    const convStatements = conversationIndexes.split(';').filter(s => s.trim());
    for (const statement of convStatements) {
      await sql.query(statement + ';');
    }
    console.log('✓ Conversation indexes applied');

    console.log('\nApplying network performance indexes...');
    const netStatements = networkIndexes.split(';').filter(s => s.trim());
    for (const statement of netStatements) {
      await sql.query(statement + ';');
    }
    console.log('✓ Network performance indexes applied');

    console.log('\nVerifying indexes...');
    const indexes = await sql`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `;

    console.log(`\n✓ Total indexes created: ${indexes.length}`);
    indexes.forEach(idx => {
      console.log(`  - ${idx.tablename}.${idx.indexname}`);
    });

    console.log('\n✅ All performance indexes applied successfully!');
  } catch (error) {
    console.error('Error applying indexes:', error);
    process.exit(1);
  }
}

applyIndexes();
