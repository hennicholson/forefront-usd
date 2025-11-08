import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { folders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET - Fetch user's folders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const userFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId))

    return NextResponse.json({
      folders: userFolders.map(f => f.name)
    })

  } catch (error: any) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new folder
export async function POST(request: NextRequest) {
  try {
    const { userId, folderName } = await request.json()

    if (!userId || !folderName) {
      return NextResponse.json(
        { error: 'userId and folderName are required' },
        { status: 400 }
      )
    }

    // Check if folder already exists
    const existing = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.userId, userId),
          eq(folders.name, folderName)
        )
      )

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        folder: folderName,
        message: 'Folder already exists'
      })
    }

    // Create new folder
    const [created] = await db
      .insert(folders)
      .values({
        userId,
        name: folderName
      })
      .returning()

    return NextResponse.json({
      success: true,
      folder: created
    })

  } catch (error: any) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a folder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const folderName = searchParams.get('folderName')

    if (!userId || !folderName) {
      return NextResponse.json(
        { error: 'userId and folderName are required' },
        { status: 400 }
      )
    }

    await db
      .delete(folders)
      .where(
        and(
          eq(folders.userId, userId),
          eq(folders.name, folderName)
        )
      )

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'Failed to delete folder', details: error.message },
      { status: 500 }
    )
  }
}
