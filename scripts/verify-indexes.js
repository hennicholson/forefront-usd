#!/usr/bin/env node

const fs = require('fs');

// Load environment variables
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

const dbUrl = process.env.DATABASE_URL;

(async () => {
  try {
    let neonServerless;
    try {
      neonServerless = require('@neondatabase/serverless');
    } catch (e) {
      console.error('❌ @neondatabase/serverless not installed');
      process.exit(1);
    }

    const { neon } = neonServerless;
    const sql = neon(dbUrl);

    const verifySQL = `
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('messages', 'posts', 'reactions', 'comments', 'notifications', 'users')
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `;

    const rows = await sql.query(verifySQL);
    const result = rows.rows || rows;

    console.log('\n📊 Database Indexes Created:\n');
    console.log('═'.repeat(80));

    const byTable = {};
    result.forEach(row => {
      if (!byTable[row.tablename]) {
        byTable[row.tablename] = [];
      }
      byTable[row.tablename].push(row);
    });

    Object.keys(byTable).sort().forEach(table => {
      console.log(`\n📁 ${table} (${byTable[table].length} indexes)`);
      byTable[table].forEach(idx => {
        console.log(`  ✓ ${idx.indexname}`);
      });
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Total: ${result.length} indexes created successfully!`);
    console.log('\nExpected indexes:');
    console.log('  • messages: 4 indexes');
    console.log('  • posts: 2 indexes');
    console.log('  • reactions: 1 index');
    console.log('  • comments: 1 index');
    console.log('  • notifications: 1 index');
    console.log('  • users: 1 index');
    console.log('  ─────────────────');
    console.log('  • Total: 10 indexes');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
