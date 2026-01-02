import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      id: body.meetingId || 'meeting-123',
      newDate: body.newDate || new Date().toISOString(),
      rescheduled: true,
      notificationsSent: true
    }
  })
}
