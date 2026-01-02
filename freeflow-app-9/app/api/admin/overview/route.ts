import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalRevenue: 125000,
      activeProjects: 12,
      pendingInvoices: 5,
      clientSatisfaction: 94,
      monthlyGrowth: 12.5,
      recentActivity: [
        { id: '1', type: 'project', action: 'completed', timestamp: new Date().toISOString() },
        { id: '2', type: 'invoice', action: 'paid', timestamp: new Date().toISOString() },
      ]
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: body })
}
