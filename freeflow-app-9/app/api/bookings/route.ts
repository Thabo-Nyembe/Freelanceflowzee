import { NextRequest, NextResponse } from 'next/server'

const mockServices = [
  {
    id: 'service-1',
    title: 'Strategy Session',
    description: 'Comprehensive planning and strategy consultation',
    duration: 90,
    price: 15000
  }
];

export async function GET() {
  return NextResponse.json({ success: true, services: mockServices })
}

export async function POST() {
  return NextResponse.json({ success: true, message: 'Booking created' })
}