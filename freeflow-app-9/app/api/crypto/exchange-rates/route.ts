import { NextResponse } from 'next/server'
import { fetchExchangeRates } from '@/lib/crypto-payment-utils'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-CryptoExchangeRates')

export async function GET() {
  try {
    const rates = await fetchExchangeRates()
    return NextResponse.json(rates, { status: 200 })
  } catch (error) {
    logger.error('Error fetching exchange rates', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    )
  }
}

// Enable caching for 30 seconds
export const revalidate = 30
