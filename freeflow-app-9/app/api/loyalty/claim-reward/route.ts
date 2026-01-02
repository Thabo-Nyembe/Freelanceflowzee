import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      rewardId: body.rewardId || 'reward-1',
      claimed: true,
      pointsDeducted: body.points || 500,
      remainingPoints: 2000,
      redemptionCode: `REWARD-${Date.now()}`
    }
  })
}
