import { NextResponse } from 'next/server'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


export async function POST() {
  return NextResponse.json({ message: 'Test login disabled in production' }, { status: 403 })
}