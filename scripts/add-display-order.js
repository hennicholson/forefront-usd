const { neon } = require('@neondatabase/serverless')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function addDisplayOrder() {
  console.log('Adding display_order column to modules table...')

  try {
    // Check if column already exists
    const checkColumn = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'modules'
      AND column_name = 'display_order'
    `

    if (checkColumn.length > 0) {
      console.log('✓ display_order column already exists')
    } else {
      // Add the column
      await sql`
        ALTER TABLE modules
        ADD COLUMN display_order INTEGER DEFAULT 0
      `
      console.log('✓ Added display_order column')
    }

    // Update existing modules with sequential order based on creation date
    await sql`
      WITH ordered_modules AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_order
        FROM modules
      )
      UPDATE modules
      SET display_order = ordered_modules.new_order
      FROM ordered_modules
      WHERE modules.id = ordered_modules.id
    `
    console.log('✓ Updated existing modules with display order')

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('Error running migration:', error)
    throw error
  }
}

addDisplayOrder()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
