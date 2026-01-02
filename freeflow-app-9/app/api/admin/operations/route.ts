import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      tasks: [
        { id: '1', title: 'Review proposals', priority: 'high', dueDate: '2024-01-20', assignee: 'John' },
        { id: '2', title: 'Update pricing', priority: 'medium', dueDate: '2024-01-22', assignee: 'Sarah' },
      ],
      resources: [
        { id: '1', name: 'Design Team', utilization: 85, available: 2 },
        { id: '2', name: 'Dev Team', utilization: 92, available: 1 },
      ],
      stats: {
        tasksCompleted: 45,
        tasksInProgress: 12,
        teamUtilization: 88,
        projectsOnTrack: 8
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: body })
}
