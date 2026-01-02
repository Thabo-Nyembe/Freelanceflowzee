import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      visitors: { total: 15420, change: 8.2 },
      conversions: { total: 342, rate: 2.2 },
      revenue: { total: 45000, change: 15.3 },
      engagement: { avgTime: '4:32', bounceRate: 35.2 },
      topPages: [
        { path: '/dashboard', views: 5420 },
        { path: '/projects', views: 3210 },
        { path: '/invoices', views: 2100 },
      ],
      chartData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [120, 150, 180, 140, 200, 90, 110]
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, exported: true, ...body })
}
