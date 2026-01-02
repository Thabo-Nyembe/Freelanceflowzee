import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      meetingId: body.meetingId || 'meeting-123',
      joinUrl: `https://meet.example.com/${body.meetingId || 'meeting-123'}`,
      accessToken: 'mock-access-token',
      joined: true
    }
  })
}
