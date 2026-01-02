import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@freeflow.io',
      avatar: '/avatars/default.png',
      role: 'admin',
      tier: 'pro',
      preferences: {
        theme: 'system',
        notifications: true,
        language: 'en'
      },
      stats: {
        projectsCompleted: 45,
        totalEarnings: 125000,
        activeProjects: 5
      }
    }
  })
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { ...body, updatedAt: new Date().toISOString() } })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { ...body, updatedAt: new Date().toISOString() } })
}
