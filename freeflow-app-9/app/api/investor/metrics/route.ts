/**
 * Investor Metrics API
 *
 * Provides aggregated platform metrics for investor dashboards
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('investor-metrics')

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can access investor metrics
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const days = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get user metrics
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    // Get active users (users with sessions in period)
    const { data: activeSessions } = await supabase
      .from('user_sessions')
      .select('user_id')
      .gte('started_at', startDate.toISOString())

    const uniqueActiveUsers = new Set(activeSessions?.map(s => s.user_id)).size

    // Get session metrics
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration, user_id')
      .gte('started_at', startDate.toISOString())

    const totalSessions = sessions?.length || 0
    const avgSessionDuration = sessions?.length
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
      : 0

    // Get business metrics
    const { count: projectsCreated } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, status')
      .gte('created_at', startDate.toISOString())

    const totalRevenue = invoices?.reduce((sum, i) => sum + (i.total || 0), 0) || 0
    const paidRevenue = invoices
      ?.filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0) || 0

    // Get engagement metrics from user_analytics
    const { data: analytics } = await supabase
      .from('user_analytics')
      .select('engagement_score, retention_score, user_tier')

    const avgEngagement = analytics?.length
      ? analytics.reduce((sum, a) => sum + (a.engagement_score || 0), 0) / analytics.length
      : 0

    const tierDistribution = analytics?.reduce((acc, a) => {
      acc[a.user_tier || 'new'] = (acc[a.user_tier || 'new'] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Get feature usage
    const { data: activities } = await supabase
      .from('user_activity_log')
      .select('action_name, action_type')
      .gte('timestamp', startDate.toISOString())

    const featureUsage: Record<string, number> = {}
    activities?.forEach(a => {
      const feature = a.action_name.split('_')[0]
      featureUsage[feature] = (featureUsage[feature] || 0) + 1
    })

    const topFeatures = Object.entries(featureUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // Calculate growth rates
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)

    const { count: previousUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', startDate.toISOString())

    const userGrowth = previousUsers
      ? (((totalUsers || 0) - previousUsers) / previousUsers) * 100
      : 0

    // Daily trends
    const trends: { date: string; users: number; sessions: number; revenue: number }[] = []

    for (let i = 0; i < days; i++) {
      const dayStart = new Date()
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const { count: dayUsers } = await supabase
        .from('user_sessions')
        .select('user_id', { count: 'exact', head: true })
        .gte('started_at', dayStart.toISOString())
        .lte('started_at', dayEnd.toISOString())

      const { data: dayInvoices } = await supabase
        .from('invoices')
        .select('total')
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString())
        .eq('status', 'paid')

      trends.push({
        date: dayStart.toISOString().split('T')[0],
        users: dayUsers || 0,
        sessions: dayUsers || 0, // Simplified
        revenue: dayInvoices?.reduce((sum, i) => sum + (i.total || 0), 0) || 0
      })
    }

    return NextResponse.json({
      success: true,
      period: `${days} days`,
      metrics: {
        users: {
          total: totalUsers || 0,
          new: newUsers || 0,
          active: uniqueActiveUsers,
          growth: Math.round(userGrowth * 10) / 10
        },
        engagement: {
          totalSessions,
          avgSessionDuration: Math.round(avgSessionDuration),
          avgSessionsPerUser: uniqueActiveUsers > 0 ? Math.round((totalSessions / uniqueActiveUsers) * 10) / 10 : 0,
          avgEngagementScore: Math.round(avgEngagement)
        },
        revenue: {
          total: totalRevenue,
          paid: paidRevenue,
          pending: totalRevenue - paidRevenue,
          avgPerUser: uniqueActiveUsers > 0 ? Math.round(totalRevenue / uniqueActiveUsers) : 0
        },
        projects: {
          created: projectsCreated || 0
        },
        invoices: {
          sent: invoices?.length || 0
        },
        userTiers: tierDistribution,
        topFeatures
      },
      trends: trends.reverse()
    })
  } catch (error) {
    logger.error('Investor metrics error', { error })
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'generate-report') {
      // Generate comprehensive investor report
      // This would compile all metrics into a downloadable format
      return NextResponse.json({
        success: true,
        message: 'Report generation initiated',
        reportId: `report-${Date.now()}`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
