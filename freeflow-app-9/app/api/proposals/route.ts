import { NextRequest, NextResponse } from 'next/server'

const mockProposals = [
  { id: '1', title: 'Website Redesign Proposal', client: 'Acme Corp', value: 15000, status: 'pending', sentDate: '2024-01-15' },
  { id: '2', title: 'Mobile App Development', client: 'TechStart', value: 45000, status: 'accepted', sentDate: '2024-01-10' },
  { id: '3', title: 'Brand Identity Package', client: 'GreenCo', value: 8000, status: 'draft', sentDate: null },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      proposals: mockProposals,
      stats: {
        totalProposals: 25,
        pendingProposals: 8,
        acceptedThisMonth: 5,
        totalValue: 125000,
        conversionRate: 45
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body, status: 'draft' } })
}
