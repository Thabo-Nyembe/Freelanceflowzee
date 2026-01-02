import { NextRequest, NextResponse } from 'next/server'

const mockProjects = [
  { id: '1', name: 'Website Redesign', status: 'active', progress: 75, client: 'Acme Corp', dueDate: '2024-02-15' },
  { id: '2', name: 'Mobile App', status: 'pending', progress: 30, client: 'TechStart', dueDate: '2024-03-01' },
  { id: '3', name: 'Brand Identity', status: 'completed', progress: 100, client: 'GreenCo', dueDate: '2024-01-20' },
]

export async function GET() {
  return NextResponse.json({ success: true, data: mockProjects })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body } })
}
