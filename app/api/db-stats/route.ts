import { NextResponse } from 'next/server'
import { getDatabaseStats, estimateMonthlyCost, getArchivableData, getInactiveUsers } from '@/lib/db/monitoring'

/**
 * GET /api/db-stats
 *
 * Returns comprehensive database statistics and cost estimates
 * Useful for admin dashboards and monitoring
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeArchivable = searchParams.get('includeArchivable') === 'true'
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Get basic stats and cost estimates
    const [stats, costs] = await Promise.all([
      getDatabaseStats(),
      estimateMonthlyCost()
    ])

    const response: any = {
      stats,
      costs,
      timestamp: new Date().toISOString()
    }

    // Optionally include archivable data analysis
    if (includeArchivable) {
      response.archivable = await getArchivableData(365)
    }

    // Optionally include inactive users
    if (includeInactive) {
      const inactiveData = await getInactiveUsers(180)
      response.inactive = {
        count: inactiveData.count,
        estimatedStorageSavingsMB: inactiveData.estimatedStorageSavingsMB
        // Don't include user details in API response for privacy
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching database stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database statistics' },
      { status: 500 }
    )
  }
}
