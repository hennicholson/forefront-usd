-- Network Performance Optimization Indexes
-- Run these via Neon CLI/MCP to optimize database queries

-- 1. Messages table indexes for DM queries
-- Optimize conversation lookups and message fetching
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver_time
  ON messages(sender_id, receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender_time
  ON messages(receiver_id, sender_id, created_at DESC);

-- Optimize conversation list queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_time
  ON messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_time
  ON messages(receiver_id, created_at DESC);

-- 2. Posts table indexes for channel queries
-- Optimize topic-based filtering
CREATE INDEX IF NOT EXISTS idx_posts_topic_time
  ON posts(topic, created_at DESC)
  WHERE topic IS NOT NULL;

-- Optimize general channel (null topic)
CREATE INDEX IF NOT EXISTS idx_posts_null_topic_time
  ON posts(created_at DESC)
  WHERE topic IS NULL;

-- 3. Reactions table index for batch counting
CREATE INDEX IF NOT EXISTS idx_reactions_post_id
  ON reactions(post_id);

-- 4. Comments table index for batch counting
CREATE INDEX IF NOT EXISTS idx_comments_post_id
  ON comments(post_id);

-- 5. Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_time
  ON notifications(user_id, read, created_at DESC);

-- 6. Users table index for name lookups (mentions)
CREATE INDEX IF NOT EXISTS idx_users_name_lower
  ON users(LOWER(name));

-- Verify indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('messages', 'posts', 'reactions', 'comments', 'notifications', 'users')
ORDER BY tablename, indexname;
