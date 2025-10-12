import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { modules } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const moduleId = searchParams.get('moduleId')

    // If specific module requested by id or moduleId
    if (id) {
      const result = await db.select().from(modules).where(eq(modules.id, parseInt(id)))
      return NextResponse.json(result)
    }

    if (moduleId) {
      const result = await db.select().from(modules).where(eq(modules.moduleId, moduleId))
      return NextResponse.json(result)
    }

    // Otherwise return all modules sorted by displayOrder
    const allModules = await db.select().from(modules).orderBy(asc(modules.displayOrder))
    return NextResponse.json(allModules)
  } catch (error: any) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const moduleData = await request.json()

    console.log('📥 Received module data:', JSON.stringify(moduleData, null, 2))

    // Generate a unique moduleId if not provided
    if (!moduleData.moduleId) {
      moduleData.moduleId = `module-${Date.now()}`
    }

    console.log('💾 Inserting into database...')
    const [newModule] = await db.insert(modules).values(moduleData).returning()

    console.log('✅ Module created successfully:', newModule)
    return NextResponse.json(newModule)
  } catch (error: any) {
    console.error('❌ Error creating module:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      {
        error: 'Failed to create module',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const moduleData = await request.json()

    const [updatedModule] = await db
      .update(modules)
      .set({
        title: moduleData.title,
        description: moduleData.description,
        duration: moduleData.duration,
        skillLevel: moduleData.skillLevel,
        instructor: moduleData.instructor,
        slides: moduleData.slides,
        learningObjectives: moduleData.learningObjectives,
        keyTakeaways: moduleData.keyTakeaways,
        introVideo: moduleData.introVideo,
        slug: moduleData.slug,
        updatedAt: new Date()
      })
      .where(eq(modules.id, moduleData.id))
      .returning()

    return NextResponse.json(updatedModule)
  } catch (error: any) {
    console.error('Error updating module:', error)
    return NextResponse.json(
      { error: 'Failed to update module', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    // Check if this is a reorder request
    if (body.action === 'reorder' && body.modules) {
      // Update display order for multiple modules
      for (const mod of body.modules) {
        await db
          .update(modules)
          .set({ displayOrder: mod.displayOrder })
          .where(eq(modules.id, mod.id))
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error updating modules:', error)
    return NextResponse.json(
      { error: 'Failed to update modules', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { moduleId } = await request.json()

    await db.delete(modules).where(eq(modules.moduleId, moduleId))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { error: 'Failed to delete module', details: error.message },
      { status: 500 }
    )
  }
}
