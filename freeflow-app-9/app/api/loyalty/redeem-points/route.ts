import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      pointsRedeemed: body.points || 100,
      remainingPoints: 2400,
      creditApplied: (body.points || 100) * 0.01,
      transactionId: `TXN-${Date.now()}`
    }
  })
}
