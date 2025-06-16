import { NextRequest, NextResponse } from 'next/server'
import { track } from '@vercel/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, event_name, properties = {} } = body

    // Validate required fields
    if (!event_type || !event_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: event_type, event_name' 
        },
        { status: 400 }
      )
    }

    // Track with Vercel Analytics
    track(event_name, {
      event_type,
      ...properties,
      timestamp: new Date().toISOString(),
      source: 'custom_api'
    })

    // Generate mock analytics data for demo
    const mockData = {
      event_id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tracked_with: 'vercel_analytics',
      timestamp: new Date().toISOString(),
      status: 'recorded'
    }

    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Event tracked with Vercel Analytics',
      note: 'This is a demo endpoint. Data will appear in Vercel Analytics dashboard.'
    })

  } catch (error) {
    console.error('Analytics demo API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return mock analytics data for demo
  const mockAnalytics = {
    success: true,
    data: {
      summary: {
        totalEvents: 45,
        pageViews: 23,
        userActions: 15,
        errors: 0,
        avgLoadTime: 1200,
        uniqueSessions: 8
      },
      recentEvents: [
        {
          id: 'demo_1',
          event_type: 'page_view',
          event_name: 'dashboard_view',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          properties: { page: '/dashboard' }
        },
        {
          id: 'demo_2',
          event_type: 'user_action',
          event_name: 'button_click',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          properties: { button: 'create_project' }
        },
        {
          id: 'demo_3',
          event_type: 'performance',
          event_name: 'page_load',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          properties: { load_time: 890 }
        }
      ],
      chartData: {
        hourlyEvents: [
          { hour: '09:00', events: 12 },
          { hour: '10:00', events: 18 },
          { hour: '11:00', events: 15 },
          { hour: '12:00', events: 8 },
          { hour: '13:00', events: 22 },
          { hour: '14:00', events: 19 }
        ],
        topPages: [
          { page: '/dashboard', views: 89 },
          { page: '/projects', views: 67 },
          { page: '/analytics', views: 45 },
          { page: '/settings', views: 23 }
        ]
      }
    },
    message: 'Demo analytics data - Vercel Analytics is tracking real data',
    note: 'Real analytics available in Vercel dashboard after deployment'
  }

  return NextResponse.json(mockAnalytics)
} 