#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

// Read the SQL file
const sql = fs.readFileSync('./migrations/network_performance_indexes.sql', 'utf8');

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}
const url = new URL(dbUrl);

// Extract connection details
const [username, password] = url.username && url.password
  ? [url.username, decodeURIComponent(url.password)]
  : ['', ''];
const host = url.hostname;
const port = url.port || 5432;
const database = url.pathname.slice(1);

// Neon uses HTTP API for serverless
const executeSQL = async (query) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: host.replace('-pooler', ''),
      port: 443,
      path: '/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${username}:${password}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

// Split SQL into individual statements and remove comments
const statements = sql
  .split(';')
  .map(s => {
    // Remove comment lines
    return s.split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .trim();
  })
  .filter(s => s.length > 0);

console.log(`Applying ${statements.length} SQL statements...`);

(async () => {
  try {
    // Import the @neondatabase/serverless package
    let neonServerless;
    try {
      neonServerless = require('@neondatabase/serverless');
    } catch (e) {
      console.log('Installing @neondatabase/serverless...');
      require('child_process').execSync('npm install --no-save @neondatabase/serverless', { stdio: 'inherit' });
      neonServerless = require('@neondatabase/serverless');
    }

    const { neon } = neonServerless;
    const sqlClient = neon(dbUrl);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] Executing...`);
      console.log(stmt.substring(0, 100) + (stmt.length > 100 ? '...' : ''));

      // Use sql.query for raw SQL strings
      const result = await sqlClient.query(stmt);
      console.log('✓ Success');

      if (Array.isArray(result.rows) && result.rows.length > 0) {
        console.log(`  Rows returned: ${result.rows.length}`);
      }
    }

    console.log('\n✅ All indexes applied successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
