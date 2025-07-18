import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, feedback: [] })
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'Feedback received (stub).' }), { headers: { 'Content-Type': 'application/json' } });
}