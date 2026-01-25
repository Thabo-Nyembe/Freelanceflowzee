import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService } from '@/lib/tax/tax-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('tax-deductions')

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.description || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: description, amount' },
        { status: 400 }
      )
    }

    // Get AI-powered deduction suggestion
    const suggestion = await taxService.categorizeExpenseForDeduction({
      description: body.description,
      amount: parseFloat(body.amount),
      category: body.category,
      merchant: body.merchant,
      date: body.date ? new Date(body.date) : new Date()
    })

    return NextResponse.json({
      success: true,
      data: suggestion
    })

  } catch (error) {
    logger.error('Deduction suggestion error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
}
