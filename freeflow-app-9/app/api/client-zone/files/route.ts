import { NextRequest, NextResponse } from 'next/server'

const mockFiles = [
  { id: '1', name: 'design-mockup.fig', type: 'design', size: 2500000, uploadedAt: '2024-01-15', status: 'approved' },
  { id: '2', name: 'brand-guide.pdf', type: 'document', size: 1200000, uploadedAt: '2024-01-14', status: 'pending' },
  { id: '3', name: 'logo-final.png', type: 'image', size: 450000, uploadedAt: '2024-01-13', status: 'approved' },
]

export async function GET() {
  return NextResponse.json({ success: true, data: mockFiles })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body } })
}

export async function DELETE() {
  return NextResponse.json({ success: true, message: 'File deleted' })
}
