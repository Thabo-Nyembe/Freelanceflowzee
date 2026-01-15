import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService } from '@/lib/tax/tax-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.transactionId || !body.transactionType || !body.subtotal || !body.destinationCountry) {
      return NextResponse.json(
        { error: 'Missing required fields: transactionId, transactionType, subtotal, destinationCountry' },
        { status: 400 }
      )
    }

    // Calculate tax
    const result = await taxService.calculateTax({
      userId: user.id,
      transactionId: body.transactionId,
      transactionType: body.transactionType,
      transactionDate: body.transactionDate ? new Date(body.transactionDate) : new Date(),
      subtotal: parseFloat(body.subtotal),
      shippingAmount: body.shippingAmount ? parseFloat(body.shippingAmount) : 0,
      discountAmount: body.discountAmount ? parseFloat(body.discountAmount) : 0,

      originCountry: body.originCountry,
      originState: body.originState,
      originCity: body.originCity,
      originPostalCode: body.originPostalCode,

      destinationCountry: body.destinationCountry,
      destinationState: body.destinationState,
      destinationCity: body.destinationCity,
      destinationPostalCode: body.destinationPostalCode,

      lineItems: body.lineItems,
      manualTaxRate: body.manualTaxRate,
      exemptionCertificateId: body.exemptionCertificateId
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Tax calculation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate tax' },
      { status: 500 }
    )
  }
}
