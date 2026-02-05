/**
 * Tax Calculation API
 *
 * Calculate tax for transactions using TaxJar/Avalara
 *
 * POST /api/tax/calculate - Calculate tax for a transaction
 * GET /api/tax/calculate - Get tax rate for a location
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService, type TaxCalculationParams, type TaxLineItem } from '@/lib/tax/tax-service'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('tax-api')

/**
 * Calculate tax for a transaction
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      transactionId,
      transactionType,
      transactionDate,
      subtotal,
      shippingAmount,
      discountAmount,
      originCountry,
      originState,
      originCity,
      originPostalCode,
      destinationCountry,
      destinationState,
      destinationCity,
      destinationPostalCode,
      lineItems,
      manualTaxRate,
      exemptionCertificateId,
      customerId
    } = body

    // Validate required fields
    if (!transactionId || !transactionType || !subtotal || !destinationCountry) {
      return NextResponse.json(
        { error: 'transactionId, transactionType, subtotal, and destinationCountry are required' },
        { status: 400 }
      )
    }

    // Validate transaction type
    const validTypes = ['invoice', 'expense', 'payment', 'refund']
    if (!validTypes.includes(transactionType)) {
      return NextResponse.json(
        { error: `Invalid transactionType. Use: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Build calculation params
    const params: TaxCalculationParams = {
      userId: user.id,
      transactionId,
      transactionType,
      transactionDate: new Date(transactionDate || Date.now()),
      subtotal: Math.round(subtotal), // Ensure integer cents
      shippingAmount: shippingAmount ? Math.round(shippingAmount) : undefined,
      discountAmount: discountAmount ? Math.round(discountAmount) : undefined,
      originCountry,
      originState,
      originCity,
      originPostalCode,
      destinationCountry,
      destinationState,
      destinationCity,
      destinationPostalCode,
      lineItems: lineItems?.map((item: TaxLineItem) => ({
        ...item,
        unitPrice: Math.round(item.unitPrice),
        discount: item.discount ? Math.round(item.discount) : undefined
      })),
      manualTaxRate,
      exemptionCertificateId,
      customerId
    }

    // Calculate tax
    const result = await taxService.calculateTax(params)

    return NextResponse.json({
      success: true,
      calculation: {
        transactionId,
        subtotal: params.subtotal,
        taxAmount: result.taxAmount,
        taxRate: result.taxRate,
        totalAmount: result.totalAmount,
        breakdown: result.breakdown,
        jurisdictions: result.jurisdictions,
        lineItemTaxes: result.lineItemTaxes,
        hasNexus: result.hasNexus,
        isTaxable: result.isTaxable,
        provider: result.provider,
        calculationMethod: result.calculationMethod
      }
    })
  } catch (error) {
    logger.error('Tax calculation error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate tax' },
      { status: 500 }
    )
  }
}

/**
 * Get tax rate for a location
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const postalCode = searchParams.get('postalCode')
    const country = searchParams.get('country')
    const state = searchParams.get('state')
    const city = searchParams.get('city')

    if (!postalCode || !country) {
      return NextResponse.json(
        { error: 'postalCode and country are required' },
        { status: 400 }
      )
    }

    const rate = await taxService.getTaxRate({
      postalCode,
      country,
      state: state || undefined,
      city: city || undefined
    })

    return NextResponse.json({
      success: true,
      rate: {
        postalCode,
        country,
        state,
        city,
        ...rate
      }
    })
  } catch (error) {
    logger.error('Tax rate lookup error', { error })
    return NextResponse.json(
      { error: 'Failed to get tax rate' },
      { status: 500 }
    )
  }
}
