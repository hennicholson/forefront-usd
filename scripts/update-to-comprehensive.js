const { neon } = require('@neondatabase/serverless')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function updateModules() {
  console.log('🔄 Updating modules with comprehensive content...\n')

  try {
    // First, let's fetch the comprehensive modules from the TypeScript file
    // Since we can't directly import TypeScript, we'll manually port the essential data

    const updates = [
      {
        oldModuleId: 'module-1',
        newModuleId: 'module-vibe-coding-2025',
        slug: 'vibe-coding-ai',
        title: 'Vibe Coding with AI - Build Apps 10x Faster',
        description: 'Master Cursor, Bolt, v0, Replit, and Windsurf to build production apps at lightning speed in 2025'
      },
      {
        oldModuleId: 'module-2',
        newModuleId: 'module-marketing-ai-2025',
        slug: 'marketing-with-ai',
        title: 'Marketing with AI - Strategies That Convert',
        description: 'Master ChatGPT, Claude, automated email sequences, and AI-powered marketing strategies that drive real results in 2025'
      },
      {
        oldModuleId: 'module-3',
        newModuleId: 'module-content-creation-2025',
        slug: 'content-creation-ai',
        title: 'Content Creation with AI - Create in Minutes',
        description: 'Master Google Veo 3, Midjourney, HeyGen, and Descript to create professional content at scale in 2025'
      },
      {
        oldModuleId: 'module-4',
        newModuleId: 'module-music-production-2025',
        slug: 'music-production-ai',
        title: 'Music Production with AI - Compose with AI Tools',
        description: 'Master Suno Studio, Udio, AIVA, and LANDR to create professional music productions in 2025'
      },
      {
        oldModuleId: 'module-5',
        newModuleId: 'module-ai-automation-2025',
        slug: 'ai-automation',
        title: 'AI Automation - Automate Anything',
        description: 'Master n8n, Zapier AI, Make, and LangChain to automate complex workflows and build AI agents in 2025'
      }
    ]

    for (const update of updates) {
      console.log(`Updating: ${update.title}`)

      // Update the module_id, title, and description
      await sql`
        UPDATE modules
        SET
          module_id = ${update.newModuleId},
          title = ${update.title},
          description = ${update.description},
          updated_at = NOW()
        WHERE module_id = ${update.oldModuleId}
      `

      console.log(`  ✅ Updated successfully!\n`)
    }

    console.log('🎉 All modules updated! Now your app will load the comprehensive modules from the TypeScript file.')
    console.log('\n💡 Note: The comprehensive slide content is in /lib/data/comprehensive-modules.ts')
    console.log('   The app should use that data instead of querying the database for slides.')
  } catch (error) {
    console.error('❌ Error updating modules:', error)
    throw error
  }
}

updateModules()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
