import { NextRequest, NextResponse } from 'next/server'

const mockInvoices = [
  { id: 'INV-001', client: 'Acme Corp', amount: 5000, status: 'paid', dueDate: '2024-01-15', paidDate: '2024-01-14' },
  { id: 'INV-002', client: 'TechStart', amount: 3500, status: 'pending', dueDate: '2024-01-25', paidDate: null },
  { id: 'INV-003', client: 'GreenCo', amount: 7500, status: 'overdue', dueDate: '2024-01-10', paidDate: null },
  { id: 'INV-004', client: 'StartupXYZ', amount: 2000, status: 'draft', dueDate: null, paidDate: null },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      invoices: mockInvoices,
      stats: {
        totalOutstanding: 11000,
        paidThisMonth: 45000,
        overdueAmount: 7500,
        averagePaymentTime: 14,
        totalInvoices: 156
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      id: `INV-${Date.now()}`,
      ...body,
      status: 'draft',
      createdAt: new Date().toISOString()
    }
  })
}
