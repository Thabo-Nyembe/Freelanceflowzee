import { NextRequest, NextResponse } from 'next/server'

/**
 * Performance Analytics API
 * Tracks Core Web Vitals and performance metrics
 */

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()

    // Validate metric data
    if (!metric || !metric.name) {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // Log performance metrics
    console.log('[Performance Metric]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
      timestamp: new Date().toISOString()
    })

    // In production, you would save this to your database
    // Example with Supabase:
    /*
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    await supabase
      .from('performance_metrics')
      .insert({
        metric_name: metric.name,
        metric_value: metric.value,
        rating: metric.rating,
        navigation_type: metric.navigationType,
        user_agent: request.headers.get('user-agent'),
        created_at: new Date().toISOString()
      })
    */

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Performance tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track performance metric' },
      { status: 500 }
    )
  }
}
