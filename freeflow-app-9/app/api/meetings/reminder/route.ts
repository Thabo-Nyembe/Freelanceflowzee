import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      meetingId: body.meetingId || 'meeting-123',
      reminderSent: true,
      reminderType: body.type || 'email',
      scheduledFor: body.scheduledFor || new Date().toISOString()
    }
  })
}
