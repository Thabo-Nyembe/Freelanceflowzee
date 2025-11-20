import { NextResponse } from 'next/server'
import { fetchExchangeRates } from '@/lib/crypto-payment-utils'

export async function GET() {
  try {
    const rates = await fetchExchangeRates()
    return NextResponse.json(rates, { status: 200 })
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    )
  }
}

// Enable caching for 30 seconds
export const revalidate = 30
