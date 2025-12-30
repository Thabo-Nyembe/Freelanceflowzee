import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ message: 'Test login disabled in production' }, { status: 403 })
}