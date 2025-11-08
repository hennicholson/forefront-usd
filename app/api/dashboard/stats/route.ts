import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { progress, generationHistory, knowledgeCheckResponses, modules } from '@/lib/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'

// GET - Fetch comprehensive dashboard statistics for a user
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

    // Fetch all user progress
    const userProgress = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId))

    // Fetch all modules for total count
    const allModules = await db.select().from(modules)

    // Calculate module statistics
    const modulesInProgress = userProgress.filter(p => !p.completed).length
    const modulesCompleted = userProgress.filter(p => p.completed).length
    const totalModules = allModules.length
    const completionRate = totalModules > 0 ? (modulesCompleted / totalModules) * 100 : 0

    // Fetch generation history statistics
    const generations = await db
      .select()
      .from(generationHistory)
      .where(eq(generationHistory.userId, userId))

    const totalGenerations = generations.length
    const savedGenerations = generations.filter(g => g.saved).length
    const textGenerations = generations.filter(g => g.type === 'text').length
    const imageGenerations = generations.filter(g => g.type === 'image').length
    const videoGenerations = generations.filter(g => g.type === 'video').length

    // Calculate generation stats by model
    const generationsByModel: { [key: string]: number } = {}
    generations.forEach(g => {
      generationsByModel[g.model] = (generationsByModel[g.model] || 0) + 1
    })

    // Calculate average rating for saved generations
    const ratedGenerations = generations.filter(g => g.rating !== null)
    const avgRating = ratedGenerations.length > 0
      ? ratedGenerations.reduce((sum, g) => sum + (g.rating || 0), 0) / ratedGenerations.length
      : 0

    // Fetch knowledge check responses
    const quizResponses = await db
      .select()
      .from(knowledgeCheckResponses)
      .where(eq(knowledgeCheckResponses.userId, userId))

    const totalQuizAttempts = quizResponses.length
    const correctAnswers = quizResponses.filter(r => r.isCorrect).length
    const quizAccuracy = totalQuizAttempts > 0 ? (correctAnswers / totalQuizAttempts) * 100 : 0

    // Calculate average time to answer (in seconds)
    const responsesWithTime = quizResponses.filter(r => r.timeToAnswer !== null)
    const avgTimeToAnswer = responsesWithTime.length > 0
      ? responsesWithTime.reduce((sum, r) => sum + (r.timeToAnswer || 0), 0) / responsesWithTime.length / 1000
      : 0

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentGenerations = generations.filter(
      g => new Date(g.createdAt!) >= sevenDaysAgo
    ).length

    const recentQuizzes = quizResponses.filter(
      q => new Date(q.createdAt!) >= sevenDaysAgo
    ).length

    // Get most recent activity
    const lastActivity = Math.max(
      ...[
        ...generations.map(g => new Date(g.createdAt!).getTime()),
        ...quizResponses.map(q => new Date(q.createdAt!).getTime()),
        ...userProgress.map(p => new Date(p.updatedAt!).getTime())
      ]
    )

    return NextResponse.json({
      modules: {
        total: totalModules,
        completed: modulesCompleted,
        inProgress: modulesInProgress,
        notStarted: totalModules - modulesInProgress - modulesCompleted,
        completionRate: Math.round(completionRate)
      },
      generations: {
        total: totalGenerations,
        saved: savedGenerations,
        byType: {
          text: textGenerations,
          image: imageGenerations,
          video: videoGenerations
        },
        byModel: generationsByModel,
        averageRating: Math.round(avgRating * 10) / 10,
        totalRated: ratedGenerations.length
      },
      quizzes: {
        totalAttempts: totalQuizAttempts,
        correctAnswers,
        accuracy: Math.round(quizAccuracy),
        averageTimeSeconds: Math.round(avgTimeToAnswer)
      },
      activity: {
        last7Days: {
          generations: recentGenerations,
          quizzes: recentQuizzes
        },
        lastActivityDate: lastActivity > 0 ? new Date(lastActivity).toISOString() : null
      }
    })

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    )
  }
}
