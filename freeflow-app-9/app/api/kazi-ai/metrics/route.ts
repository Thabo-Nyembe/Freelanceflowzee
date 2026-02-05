/**
 * AI METRICS API
 * Provides AI usage metrics and cost tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { kaziAI } from '@/lib/ai/kazi-ai-router'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('AIMetrics-API')

export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching AI metrics')

    const metrics = kaziAI.getMetrics()

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Metrics fetch error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Failed to fetch metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Reset metrics (admin only in production)
    logger.warn('Resetting AI metrics')

    kaziAI.resetMetrics()

    return NextResponse.json({
      success: true,
      message: 'Metrics reset successfully'
    })

  } catch (error) {
    logger.error('Metrics reset error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Failed to reset metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
