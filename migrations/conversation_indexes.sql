-- Additional indexes for conversation performance
-- These work together with the existing message indexes

-- Composite index for faster conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_lookup
  ON messages(sender_id, receiver_id, created_at DESC)
  WHERE receiver_id IS NOT NULL;

-- Users table already has primary key on id, no additional index needed for joins
-- The primary key index will be used automatically

-- Index for optimizing GROUP BY queries on conversations
CREATE INDEX IF NOT EXISTS idx_messages_participants
  ON messages(LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC)
  WHERE receiver_id IS NOT NULL;

-- Partial index for unread messages (significantly faster for read status)
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(receiver_id, sender_id)
  WHERE receiver_id IS NOT NULL;

-- Index for reactions with post_id and user_id (for checking if user liked)
CREATE INDEX IF NOT EXISTS idx_reactions_user_post
  ON reactions(user_id, post_id, type);

-- Verify new indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
  AND tablename IN ('messages', 'users', 'reactions')
ORDER BY tablename, indexname;
