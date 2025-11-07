import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { modules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find module by slug
    const [module] = await db
      .select()
      .from(modules)
      .where(eq(modules.slug, slug))
      .limit(1)

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(module)
  } catch (error: any) {
    console.error('Error fetching module:', error)
    return NextResponse.json(
      { error: 'Failed to fetch module', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const moduleData = await request.json()

    // Remove fields that shouldn't be updated directly
    const { id, createdAt, updatedAt, ...updateData } = moduleData

    // Update module by slug
    const [updatedModule] = await db
      .update(modules)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(modules.slug, slug))
      .returning()

    if (!updatedModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedModule)
  } catch (error: any) {
    console.error('Error updating module:', error)
    return NextResponse.json(
      { error: 'Failed to update module', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Delete module by slug
    const [deletedModule] = await db
      .delete(modules)
      .where(eq(modules.slug, slug))
      .returning()

    if (!deletedModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, deleted: deletedModule })
  } catch (error: any) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { error: 'Failed to delete module', details: error.message },
      { status: 500 }
    )
  }
}