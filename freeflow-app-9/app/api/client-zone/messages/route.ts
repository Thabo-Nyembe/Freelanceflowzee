import { NextRequest, NextResponse } from 'next/server'

const mockMessages = [
  { id: '1', content: 'Great progress on the project!', sender: 'client', timestamp: '2024-01-15T10:30:00Z', read: true },
  { id: '2', content: 'Here are the updated designs', sender: 'user', timestamp: '2024-01-15T11:00:00Z', read: true },
  { id: '3', content: 'Can we schedule a call?', sender: 'client', timestamp: '2024-01-15T14:00:00Z', read: false },
]

export async function GET() {
  return NextResponse.json({ success: true, data: mockMessages })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body, timestamp: new Date().toISOString() } })
}
