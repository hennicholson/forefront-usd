import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { modules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allModules = await db.select().from(modules)
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

    // Generate a unique moduleId if not provided
    if (!moduleData.moduleId) {
      moduleData.moduleId = `module-${Date.now()}`
    }

    const [newModule] = await db.insert(modules).values(moduleData).returning()

    return NextResponse.json(newModule)
  } catch (error: any) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Failed to create module', details: error.message },
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
