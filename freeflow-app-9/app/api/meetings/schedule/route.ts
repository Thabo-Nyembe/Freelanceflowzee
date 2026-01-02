import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      id: Date.now().toString(),
      title: body.title || 'New Meeting',
      date: body.date || new Date().toISOString(),
      duration: body.duration || 30,
      attendees: body.attendees || [],
      meetingUrl: `https://meet.example.com/${Date.now()}`,
      status: 'scheduled'
    }
  })
}
