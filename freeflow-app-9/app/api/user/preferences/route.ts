import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD'
    }
  })
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { ...body, updatedAt: new Date().toISOString() } })
}
