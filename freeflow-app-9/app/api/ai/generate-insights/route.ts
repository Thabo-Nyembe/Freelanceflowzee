import { NextResponse } from 'next/server'
import { ContentInsightsService } from '@/lib/ai/content-insights-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-GenerateInsights')

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json()

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: 'Valid transcript array is required' },
        { status: 400 }
      )
    }

    const insightsService = new ContentInsightsService()
    const insights = await insightsService.generateInsights(transcript)

    return NextResponse.json(insights)
  } catch (error) {
    logger.error('Failed to generate insights', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
} 