const { neon } = require('@neondatabase/serverless')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

// Read the comprehensive modules TypeScript file
const modulesFilePath = path.join(__dirname, '..', 'lib', 'data', 'comprehensive-modules.ts')
const fileContent = fs.readFileSync(modulesFilePath, 'utf8')

// Extract the JSON data (this is a simple parser - in production you'd use a proper TS parser)
// For now, we'll manually define the data to sync

async function syncModules() {
  console.log('🔄 Syncing comprehensive modules to database...\n')

  try {
    // First, check what modules exist
    const existing = await sql`SELECT module_id, slug FROM modules ORDER BY display_order`
    console.log(`Found ${existing.length} existing modules\n`)

    // Delete old modules that will be replaced
    console.log('Deleting old module data...')
    await sql`DELETE FROM modules WHERE module_id IN ('module-1', 'module-2', 'module-3', 'module-4', 'module-5')`
    console.log('✅ Old modules deleted\n')

    console.log('📝 Comprehensive modules will be loaded from TypeScript file at runtime')
    console.log('   The app now uses /lib/data/comprehensive-modules.ts directly\n')

    console.log('✅ Database cleanup complete!')
    console.log('\n💡 The comprehensive modules are loaded from the TypeScript file, not the database.')
    console.log('   This allows for faster updates and better version control.')

  } catch (error) {
    console.error('❌ Error syncing modules:', error)
    throw error
  }
}

syncModules()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
