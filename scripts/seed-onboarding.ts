import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') })

import { db } from '../lib/db'
import { modules } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import onboardingData from '../lib/modules/onboarding-module.json'

async function seedOnboardingModule() {
  try {
    console.log('🌱 Seeding onboarding module...')

    // Check if onboarding module already exists
    const existing = await db
      .select()
      .from(modules)
      .where(eq(modules.slug, 'getting-started'))

    if (existing.length > 0) {
      console.log('⚠️  Onboarding module already exists. Updating...')

      const [updated] = await db
        .update(modules)
        .set({
          title: onboardingData.title,
          description: onboardingData.description,
          duration: onboardingData.duration,
          skillLevel: onboardingData.skillLevel,
          instructor: onboardingData.instructor,
          slides: onboardingData.slides,
          learningObjectives: onboardingData.learningObjectives,
          keyTakeaways: onboardingData.keyTakeaways,
          introVideo: onboardingData.introVideo,
          displayOrder: onboardingData.displayOrder,
          updatedAt: new Date()
        })
        .where(eq(modules.slug, 'getting-started'))
        .returning()

      console.log('✅ Onboarding module updated successfully!')
      console.log('   ID:', updated.id)
      console.log('   Title:', updated.title)
      console.log('   Slides:', (updated.slides as any[]).length)
    } else {
      // Insert new onboarding module
      const [inserted] = await db
        .insert(modules)
        .values({
          moduleId: onboardingData.moduleId,
          slug: onboardingData.slug,
          title: onboardingData.title,
          description: onboardingData.description,
          instructor: onboardingData.instructor,
          duration: onboardingData.duration,
          skillLevel: onboardingData.skillLevel,
          introVideo: onboardingData.introVideo,
          learningObjectives: onboardingData.learningObjectives,
          slides: onboardingData.slides,
          keyTakeaways: onboardingData.keyTakeaways,
          displayOrder: onboardingData.displayOrder
        })
        .returning()

      console.log('✅ Onboarding module created successfully!')
      console.log('   ID:', inserted.id)
      console.log('   Title:', inserted.title)
      console.log('   Slides:', (inserted.slides as any[]).length)
    }

    console.log('\n🎉 Seeding complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding onboarding module:', error)
    process.exit(1)
  }
}

seedOnboardingModule()
