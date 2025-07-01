import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, feedback: [] })
}

export async function POST() {
  return NextResponse.json({ success: true, message: 'Feedback received' })
}