import { NextRequest, NextResponse } from 'next/server'

const mockContacts = [
  { id: '1', name: 'John Smith', email: 'john@acme.com', company: 'Acme Corp', status: 'active', value: 15000 },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@techstart.io', company: 'TechStart', status: 'lead', value: 8000 },
  { id: '3', name: 'Mike Brown', email: 'mike@greenco.com', company: 'GreenCo', status: 'prospect', value: 12000 },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      contacts: mockContacts,
      stats: {
        totalContacts: 156,
        activeDeals: 23,
        pipelineValue: 245000,
        wonThisMonth: 45000
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body } })
}
