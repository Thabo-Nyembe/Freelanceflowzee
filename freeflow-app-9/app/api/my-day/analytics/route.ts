import { NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'
import {
  WorkPatternAnalyzer,
  generateMockTaskHistory,
  type ScheduleOptimization
} from '@/lib/ai/work-pattern-analyzer'

const logger = createFeatureLogger('API-MyDayAnalytics')

/**
 * GET /api/my-day/analytics
 *
 * Returns work pattern analysis and productivity insights
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const includeSchedule = searchParams.get('includeSchedule') === 'true'

    logger.info('Fetching work pattern analytics', {
      days,
      includeSchedule
    })

    // In production, fetch from database
    // For now, generate mock data
    const taskHistory = generateMockTaskHistory(days)

    // Initialize analyzer
    const analyzer = new WorkPatternAnalyzer(taskHistory)

    // Analyze patterns
    const pattern = analyzer.analyzePattern()
    const insights = analyzer.getProductivityInsights()

    let schedule: ScheduleOptimization | undefined

    if (includeSchedule) {
      schedule = analyzer.optimizeSchedule({
        workStartHour: 8,
        workEndHour: 18,
        lunchBreakHour: 12
      })
    }

    logger.info('Work pattern analytics generated', {
      taskCount: taskHistory.length,
      peakHours: pattern.peakHours.slice(0, 3).map(h => h.hour),
      completionRate: insights.completionRate,
      hasSchedule: !!schedule
    })

    return NextResponse.json({
      success: true,
      data: {
        pattern,
        insights,
        schedule,
        metadata: {
          analyzedTasks: taskHistory.length,
          dateRange: {
            from: taskHistory[0]?.completedAt,
            to: taskHistory[taskHistory.length - 1]?.completedAt
          },
          analyzedDays: days
        }
      }
    })

  } catch (error: any) {
    logger.error('Failed to generate work pattern analytics', {
      error: error.message,
      stack: error.stack
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate analytics'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/my-day/analytics/track
 *
 * Track task completion for pattern analysis
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { taskId, completedAt, actualTime, qualityScore, interrupted } = body

    logger.info('Tracking task completion', {
      taskId,
      actualTime,
      qualityScore,
      interrupted
    })

    // In production, save to database
    // For now, just acknowledge

    return NextResponse.json({
      success: true,
      message: 'Task completion tracked',
      taskId
    })

  } catch (error: any) {
    logger.error('Failed to track task completion', {
      error: error.message
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to track task'
      },
      { status: 500 }
    )
  }
}
