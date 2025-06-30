import { NextRequest, NextResponse } from 'next/server'
import { track } from '@vercel/analytics'

export async function POST(request: NextRequest) {
  try {
    const { event_type, event_name, event_data } = await request.json()

    if (!event_type || !event_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: event_type, event_name'
        },
        { status: 400 }
      )
    }

    // Simulate analytics tracking for demo
    const analyticsEvent = {
      id: `demo_${Date.now()}`,
      event_type,
      event_name,
      event_data: event_data || {},
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || 'demo
    }

    return NextResponse.json({
      success: true,
      event: analyticsEvent,
      message: 'Demo event tracked successfully'
    })

  } catch (error) {
    console.error('Demo analytics error: ', error)'
    return NextResponse.json(
      { success: false, error: 'Failed to track demo event' },
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