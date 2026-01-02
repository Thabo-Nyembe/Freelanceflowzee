import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      points: 2500,
      tier: 'Gold',
      rewards: [
        { id: '1', name: '10% Discount', points: 500, available: true },
        { id: '2', name: 'Free Consultation', points: 1000, available: true },
        { id: '3', name: 'Premium Support', points: 2000, available: true },
      ],
      history: [
        { id: '1', action: 'Project Completion', points: 500, date: '2024-01-15' },
        { id: '2', action: 'Referral Bonus', points: 200, date: '2024-01-10' },
      ]
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: body })
}
