import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Event tracked successfully',
    eventId: Math.random().toString(36).substr(2, 9)
  })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    events: [
      { id: '1', type: 'page_view', timestamp: new Date().toISOString() },
      { id: '2', type: 'button_click', timestamp: new Date().toISOString() }
    ]
  })
} 