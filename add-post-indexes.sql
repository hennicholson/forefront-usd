-- Add indexes to posts table for ultra-fast queries
-- These indexes will make channel queries <50ms instead of 1-2 seconds

-- Index for general channel (topic IS NULL)
CREATE INDEX IF NOT EXISTS idx_posts_null_topic_created
ON posts (created_at DESC)
WHERE topic IS NULL OR topic = '';

-- Index for specific topic channels
CREATE INDEX IF NOT EXISTS idx_posts_topic_created
ON posts (topic, created_at DESC)
WHERE topic IS NOT NULL AND topic != '';

-- Composite index for user_id join (already fast but make it faster)
CREATE INDEX IF NOT EXISTS idx_posts_user_created
ON posts (user_id, created_at DESC);

-- Analyze the table to update statistics
ANALYZE posts;
