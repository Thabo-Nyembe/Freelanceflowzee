import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      campaigns: [
        { id: '1', name: 'Summer Sale', status: 'active', reach: 15000, conversions: 234 },
        { id: '2', name: 'New Product Launch', status: 'scheduled', reach: 0, conversions: 0 },
      ],
      leads: [
        { id: '1', name: 'New Lead', email: 'lead@example.com', source: 'website', score: 85 },
        { id: '2', name: 'Referral Lead', email: 'ref@example.com', source: 'referral', score: 92 },
      ],
      stats: {
        totalLeads: 156,
        qualifiedLeads: 45,
        conversionRate: 12.5,
        emailOpenRate: 28.3
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: body })
}
