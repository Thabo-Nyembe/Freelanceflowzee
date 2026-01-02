import { NextRequest, NextResponse } from 'next/server'

const mockTeam = [
  { id: '1', name: 'John Smith', email: 'john@freeflow.io', role: 'Designer', avatar: '/avatars/john.png', status: 'online' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@freeflow.io', role: 'Developer', avatar: '/avatars/sarah.png', status: 'online' },
  { id: '3', name: 'Mike Brown', email: 'mike@freeflow.io', role: 'Project Manager', avatar: '/avatars/mike.png', status: 'away' },
  { id: '4', name: 'Lisa Chen', email: 'lisa@freeflow.io', role: 'Developer', avatar: '/avatars/lisa.png', status: 'offline' },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      members: mockTeam,
      stats: {
        totalMembers: 12,
        onlineNow: 8,
        activeProjects: 15
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body } })
}
