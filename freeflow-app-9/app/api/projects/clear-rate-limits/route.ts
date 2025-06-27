import { NextRequest, NextResponse } from 'next/server
import { clearAllRateLimits, rateLimitStore } from '@/app/lib/rate-limit-store

export async function POST(request: NextRequest) {
  // Only allow clearing rate limits with admin key
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey !== 'test-admin-key') {
    console.log('Unauthorized attempt to clear rate limits')
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Log current state
  console.log('Rate limit store before clearing:', rateLimitStore)

  // Clear all rate limits
  clearAllRateLimits()

  // Log cleared state
  console.log('Rate limit store after clearing:', rateLimitStore)

  return NextResponse.json({ success: true, message: 'Rate limits cleared' })
} 