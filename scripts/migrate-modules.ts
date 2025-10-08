import * as dotenv from 'dotenv'
import { db } from '../lib/db'
import { modules as modulesTable } from '../lib/db/schema'
import { modules as staticModules } from '../lib/data/modules'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function migrateModules() {
  console.log('Starting module migration...')
  console.log(`Found ${staticModules.length} modules to migrate`)

  for (const staticModule of staticModules) {
    try {
      // Transform static module format to database format
      const dbModule = {
        moduleId: `module-${staticModule.id}-${Date.now()}`,
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
        slides: staticModule.slides.map((slide, index) => ({
          id: index + 1,
          title: slide.title,
          content: slide.content
        })),
        keyTakeaways: staticModule.keyTakeaways
      }

      const [result] = await db.insert(modulesTable).values(dbModule).returning()
      console.log(`✓ Migrated: ${result.title}`)
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
