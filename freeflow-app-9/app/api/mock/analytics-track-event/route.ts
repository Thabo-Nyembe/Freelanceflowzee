import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Event tracked successfully',
    analytics: {
      processed: true,
      timestamp: new Date().toISOString(),
      eventId: Math.random().toString(36).substr(2, 9)
    }
  })
} 