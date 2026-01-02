import { NextRequest, NextResponse } from 'next/server'

const mockAutomations = [
  { id: '1', name: 'New Client Welcome', trigger: 'client_created', status: 'active', runsToday: 5 },
  { id: '2', name: 'Invoice Reminder', trigger: 'invoice_overdue', status: 'active', runsToday: 12 },
  { id: '3', name: 'Project Complete Notify', trigger: 'project_completed', status: 'paused', runsToday: 0 },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      automations: mockAutomations,
      stats: {
        totalAutomations: 15,
        activeAutomations: 12,
        totalRuns: 1245,
        successRate: 98.5
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body } })
}
