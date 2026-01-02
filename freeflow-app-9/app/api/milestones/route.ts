import { NextRequest, NextResponse } from 'next/server'

const mockMilestones = [
  { id: '1', title: 'Design Phase Complete', projectId: 'p1', dueDate: '2024-01-20', status: 'completed', amount: 5000 },
  { id: '2', title: 'Development Sprint 1', projectId: 'p1', dueDate: '2024-02-01', status: 'in_progress', amount: 10000 },
  { id: '3', title: 'Beta Launch', projectId: 'p1', dueDate: '2024-02-15', status: 'pending', amount: 8000 },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      milestones: mockMilestones,
      stats: {
        totalMilestones: 45,
        completedMilestones: 32,
        upcomingThisWeek: 3,
        totalValue: 125000
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body, status: 'pending' } })
}
