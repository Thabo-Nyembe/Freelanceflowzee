import { NextRequest, NextResponse } from 'next/server'

const mockMeetings = [
  { id: '1', title: 'Project Kickoff', date: '2024-01-20T10:00:00', duration: 60, attendees: ['John', 'Sarah'], status: 'scheduled' },
  { id: '2', title: 'Design Review', date: '2024-01-21T14:00:00', duration: 45, attendees: ['Mike', 'Lisa'], status: 'scheduled' },
  { id: '3', title: 'Weekly Standup', date: '2024-01-22T09:00:00', duration: 30, attendees: ['Team'], status: 'recurring' },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      meetings: mockMeetings,
      stats: {
        totalMeetings: 15,
        upcomingThisWeek: 5,
        totalHours: 12,
        averageDuration: 45
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body } })
}
