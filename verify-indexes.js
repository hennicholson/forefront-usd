import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function verifyIndexes() {
  try {
    console.log('Checking database indexes...\n');

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

    console.log(`✓ Total custom indexes: ${indexes.length}\n`);

    const byTable = {};
    indexes.forEach(idx => {
      if (!byTable[idx.tablename]) byTable[idx.tablename] = [];
      byTable[idx.tablename].push(idx.indexname);
    });

    console.log('Indexes by table:');
    Object.entries(byTable).forEach(([table, idxs]) => {
      console.log(`\n  ${table} (${idxs.length} indexes):`);
      idxs.forEach(idx => console.log(`    - ${idx}`));
    });

    // Check for critical missing indexes
    const criticalIndexes = [
      'idx_posts_topic_time',
      'idx_posts_null_topic_time',
      'idx_reactions_post_id',
      'idx_comments_post_id',
      'idx_messages_sender_receiver_time',
      'idx_messages_receiver_sender_time'
    ];

    console.log('\n\nCritical indexes status:');
    const foundIndexes = indexes.map(i => i.indexname);
    criticalIndexes.forEach(idx => {
      const found = foundIndexes.includes(idx);
      console.log(`  ${found ? '✓' : '✗'} ${idx}`);
    });

    const missing = criticalIndexes.filter(idx => !foundIndexes.includes(idx));
    if (missing.length > 0) {
      console.log(`\n⚠️  Missing ${missing.length} critical indexes for performance!`);
      console.log('These indexes are essential for the optimizations to work.');
    } else {
      console.log('\n✅ All critical indexes are present!');
    }

    // Test query performance on posts
    console.log('\n\nTesting query performance...');
    const start = Date.now();
    const posts = await sql`
      SELECT id, user_id, content, topic, created_at
      FROM posts
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const postsTime = Date.now() - start;
    console.log(`  Posts query (50 records): ${postsTime}ms`);

    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);

      const start2 = Date.now();
      const reactions = await sql`
        SELECT post_id, COUNT(*) as count
        FROM reactions
        WHERE post_id = ANY(${postIds})
        GROUP BY post_id
      `;
      const reactionsTime = Date.now() - start2;
      console.log(`  Reactions batch query: ${reactionsTime}ms`);

      const start3 = Date.now();
      const comments = await sql`
        SELECT post_id, COUNT(*) as count
        FROM comments
        WHERE post_id = ANY(${postIds})
        GROUP BY post_id
      `;
      const commentsTime = Date.now() - start3;
      console.log(`  Comments batch query: ${commentsTime}ms`);

      const total = postsTime + reactionsTime + commentsTime;
      console.log(`\n  Total query time: ${total}ms`);

      if (total < 500) {
        console.log('  ✅ Performance is EXCELLENT! (<500ms)');
      } else if (total < 1000) {
        console.log('  ✓ Performance is good (<1s)');
      } else if (total < 2000) {
        console.log('  ⚠️  Performance is acceptable but could be better');
      } else {
        console.log('  ⚠️  Performance is SLOW - indexes may not be optimally used');
      }
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyIndexes();
