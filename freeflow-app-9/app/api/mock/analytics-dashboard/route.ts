import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      totalViews: 1234,
      totalUsers: 456,
      averageWatchTime: 180,
      bounceRate: 25.5,
      topPages: [
        { path: '/', views: 500 },
        { path: '/dashboard', views: 300 },
        { path: '/features', views: 200 }
      ],
      chartData: [
        { date: '2024-01-01', views: 100 },
        { date: '2024-01-02', views: 150 },
        { date: '2024-01-03', views: 200 }
      ]
    }
  })
} 