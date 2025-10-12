import * as dotenv from 'dotenv'
import { db } from '../lib/db'
import { modules as modulesTable } from '../lib/db/schema'
import { modules as staticModules } from '../lib/data/modules'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function migrateModules() {
  console.log('Starting module migration...')
  console.log(`Found ${staticModules.length} modules to migrate`)

  // First, clear existing modules to avoid duplicates
  console.log('Clearing existing modules...')
  await db.delete(modulesTable)

  for (const staticModule of staticModules) {
    try {
      // Transform static module format to database format with new block structure
      const dbModule = {
        moduleId: `module-${staticModule.id}`,
        title: staticModule.title,
        slug: staticModule.slug,
        description: staticModule.description,
        instructor: {
          name: staticModule.instructor.name,
          title: `${staticModule.instructor.year} - ${staticModule.instructor.major}`,
          bio: `Student at USD studying ${staticModule.instructor.major}`
        },
        duration: staticModule.duration,
        skillLevel: staticModule.skillLevel.toLowerCase(),
        introVideo: staticModule.introVideo,
        learningObjectives: staticModule.learningObjectives,
        slides: staticModule.slides.map((slide) => ({
          id: slide.id,
          title: slide.title,
          description: slide.description || '',
          blocks: slide.blocks || []
        })),
        keyTakeaways: staticModule.keyTakeaways
      }

      const [result] = await db.insert(modulesTable).values(dbModule).returning()
      const slidesArray = Array.isArray(result.slides) ? result.slides : []
      console.log(`✓ Migrated: ${result.title} (${slidesArray.length} slides)`)
    } catch (error: any) {
      console.error(`✗ Failed to migrate ${staticModule.title}:`, error.message)
    }
  }

  console.log('Migration complete!')
}

migrateModules()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
