import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      id: body.meetingId || 'meeting-123',
      cancelled: true,
      refundIssued: body.refund || false,
      notificationsSent: true
    }
  })
}
