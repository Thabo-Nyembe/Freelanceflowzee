import { NextResponse } from 'next/server'

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  delta: number
  navigationType: string
  timestamp: number
  url: string
  userAgent: string
}

export async function POST(request: Request) {
  try {
    const metric: WebVitalMetric = await request.json()

    // Log metrics for monitoring
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: metric.url,
      timestamp: new Date(metric.timestamp).toISOString(),
    })

    // In production, you could:
    // 1. Store in database for analysis
    // 2. Send to external analytics service (Google Analytics, Datadog, etc.)
    // 3. Aggregate and alert on performance degradation

    // Example: Store in Supabase (uncomment when ready)
    // const supabase = createServerClient()
    // await supabase.from('web_vitals').insert({
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   rating: metric.rating,
    //   metric_id: metric.id,
    //   delta: metric.delta,
    //   navigation_type: metric.navigationType,
    //   page_url: metric.url,
    //   user_agent: metric.userAgent,
    //   recorded_at: new Date(metric.timestamp).toISOString(),
    // })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Web Vitals] Error processing metric:', error)
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 400 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
