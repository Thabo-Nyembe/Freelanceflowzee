/**
 * Engagement Tracking API
 *
 * Tracks user activities, sessions, and behavior for the engagement algorithm
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('engagement')

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const userId = (session.user as any).authId || session.user.id
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'log-activity': {
        // Log a user activity
        const { data: activity, error } = await supabase
          .from('user_activity_log')
          .insert({
            user_id: userId,
            action_type: data.type,
            action_name: data.name,
            entity_type: data.entityType,
            entity_id: data.entityId,
            page_path: data.pagePath,
            metadata: data.metadata || {},
            duration: data.duration,
            session_id: data.sessionId
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          action: 'log-activity',
          activityId: activity.id
        })
      }

      case 'start-session': {
        // Start a new user session
        const { data: sessionData, error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: userId,
            device_type: data.deviceType,
            browser: data.browser,
            os: data.os,
            screen_size: data.screenSize
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          action: 'start-session',
          sessionId: sessionData.id
        })
      }

      case 'end-session': {
        // End a user session
        const { data: existingSession } = await supabase
          .from('user_sessions')
          .select('started_at')
          .eq('id', data.sessionId)
          .eq('user_id', userId)
          .single()

        if (existingSession) {
          const duration = Math.floor(
            (Date.now() - new Date(existingSession.started_at).getTime()) / 1000
          )

          await supabase
            .from('user_sessions')
            .update({
              ended_at: new Date().toISOString(),
              duration,
              pages_viewed: data.pagesViewed || 0,
              actions_taken: data.actionsCount || 0,
              features_used: data.featuresUsed || []
            })
            .eq('id', data.sessionId)

          // Update user analytics
          await updateUserAnalytics(supabase, userId, duration)
        }

        return NextResponse.json({
          success: true,
          action: 'end-session'
        })
      }

      case 'update-analytics': {
        // Manually trigger analytics update
        await updateUserAnalytics(supabase, userId)

        return NextResponse.json({
          success: true,
          action: 'update-analytics'
        })
      }

      case 'log-milestone': {
        // Log a user milestone
        const { data: milestone, error } = await supabase
          .from('user_milestones')
          .insert({
            user_id: userId,
            milestone_type: data.milestoneType,
            milestone_name: data.milestoneName,
            description: data.description,
            metadata: data.metadata || {}
          })
          .select()
          .single()

        if (error && error.code !== '23505') { // Ignore duplicate key
          throw error
        }

        return NextResponse.json({
          success: true,
          action: 'log-milestone',
          milestoneId: milestone?.id
        })
      }

      case 'get-recommendations': {
        // Get personalized recommendations
        const recommendations = await generateRecommendations(supabase, userId)

        return NextResponse.json({
          success: true,
          action: 'get-recommendations',
          recommendations
        })
      }

      case 'dismiss-recommendation': {
        // Dismiss a recommendation
        await supabase
          .from('engagement_recommendations')
          .update({
            status: 'dismissed',
            dismissed_at: new Date().toISOString()
          })
          .eq('id', data.recommendationId)
          .eq('user_id', userId)

        return NextResponse.json({
          success: true,
          action: 'dismiss-recommendation'
        })
      }

      case 'click-recommendation': {
        // Track recommendation click
        await supabase
          .from('engagement_recommendations')
          .update({
            status: 'clicked',
            clicked_at: new Date().toISOString()
          })
          .eq('id', data.recommendationId)
          .eq('user_id', userId)

        return NextResponse.json({
          success: true,
          action: 'click-recommendation'
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Engagement tracking error', { error })
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint for fetching user engagement data
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const userId = (session.user as any).authId || session.user.id
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') || 'analytics'

    switch (dataType) {
      case 'analytics': {
        const { data: analytics } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', userId)
          .single()

        return NextResponse.json({
          success: true,
          analytics: analytics || {
            engagement_score: 50,
            retention_score: 50,
            user_tier: 'new'
          }
        })
      }

      case 'preferences': {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single()

        return NextResponse.json({
          success: true,
          preferences: preferences || {}
        })
      }

      case 'recommendations': {
        const { data: recommendations } = await supabase
          .from('engagement_recommendations')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .order('priority', { ascending: false })
          .limit(5)

        return NextResponse.json({
          success: true,
          recommendations: recommendations || []
        })
      }

      case 'milestones': {
        const { data: milestones } = await supabase
          .from('user_milestones')
          .select('*')
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false })

        return NextResponse.json({
          success: true,
          milestones: milestones || []
        })
      }

      case 'activity': {
        const limit = parseInt(searchParams.get('limit') || '50')
        const { data: activities } = await supabase
          .from('user_activity_log')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(limit)

        return NextResponse.json({
          success: true,
          activities: activities || []
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown data type: ${dataType}` },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Engagement fetch error', { error })
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Helper function to update user analytics
async function updateUserAnalytics(
  supabase: any,
  userId: string,
  sessionDuration?: number
): Promise<void> {
  // Get current analytics
  const { data: current } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('user_id', userId)
    .single()

  const totalSessions = (current?.total_sessions || 0) + 1
  const totalTime = (current?.total_time_spent || 0) + (sessionDuration || 0)
  const avgDuration = totalTime / totalSessions

  // Calculate engagement score (simplified)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: recentActivities } = await supabase
    .from('user_activity_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('timestamp', thirtyDaysAgo.toISOString())

  const engagementScore = Math.min(100, Math.round(
    (totalSessions * 3) +
    (avgDuration / 60) +
    ((recentActivities || 0) / 10)
  ))

  // Determine user tier
  let userTier = 'new'
  if (engagementScore >= 80) userTier = 'champion'
  else if (engagementScore >= 60) userTier = 'power'
  else if (engagementScore >= 40) userTier = 'active'
  else if (engagementScore >= 20) userTier = 'casual'

  await supabase
    .from('user_analytics')
    .upsert({
      user_id: userId,
      total_sessions: totalSessions,
      total_time_spent: totalTime,
      last_session_at: new Date().toISOString(),
      avg_session_duration: Math.round(avgDuration),
      engagement_score: engagementScore,
      user_tier: userTier,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
}

// Helper function to generate recommendations
async function generateRecommendations(
  supabase: any,
  userId: string
): Promise<any[]> {
  // Get user's feature usage
  const { data: activities } = await supabase
    .from('user_activity_log')
    .select('action_name')
    .eq('user_id', userId)

  const usedFeatures = new Set(
    activities?.map((a: any) => a.action_name.split('_')[0]) || []
  )

  const allFeatures = [
    'projects', 'tasks', 'invoices', 'clients', 'files',
    'analytics', 'ai-assistant', 'workflows', 'reports'
  ]

  const unusedFeatures = allFeatures.filter(f => !usedFeatures.has(f))
  const recommendations = []

  // Recommend unused features
  for (const feature of unusedFeatures.slice(0, 3)) {
    recommendations.push({
      type: 'feature',
      title: `Try ${feature.charAt(0).toUpperCase() + feature.slice(1)}`,
      description: `Discover how ${feature} can boost your productivity`,
      action_url: `/dashboard/${feature}-v2`,
      priority: 70,
      relevance_score: 80
    })
  }

  return recommendations
}
