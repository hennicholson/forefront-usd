const { neon } = require('@neondatabase/serverless')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function checkModules() {
  console.log('Checking existing modules in database...\n')

  try {
    const modules = await sql`
      SELECT module_id, title, slug
      FROM modules
      ORDER BY display_order
    `

    console.log(`Found ${modules.length} modules:\n`)
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`)
      console.log(`   Slug: ${module.slug}`)
      console.log(`   ID: ${module.module_id}\n`)
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

checkModules()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
