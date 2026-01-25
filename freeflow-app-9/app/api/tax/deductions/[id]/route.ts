import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('tax-deductions')

/**
 * GET /api/tax/deductions/[id]
 * Get a specific tax deduction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch deduction
    const { data: deduction, error } = await supabase
      .from('tax_deductions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this deduction
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Deduction not found or access denied' },
          { status: 404 }
        )
      }
      logger.error('Tax deduction fetch error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch tax deduction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deduction
    })
  } catch (error) {
    logger.error('Tax deduction GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tax/deductions/[id]
 * Update a tax deduction (approve, reject, edit)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    // Allow updating these fields
    if (body.status !== undefined) updateData.status = body.status
    if (body.is_approved !== undefined) updateData.is_approved = body.is_approved
    if (body.category !== undefined) updateData.category = body.category
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory
    if (body.description !== undefined) updateData.description = body.description
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.receipt_url !== undefined) updateData.receipt_url = body.receipt_url

    // Recalculate deductible amount if expense amount or percentage changed
    if (body.expense_amount !== undefined || body.deduction_percentage !== undefined) {
      const expenseAmount = body.expense_amount
      const deductionPercentage = body.deduction_percentage || 100

      if (expenseAmount !== undefined) updateData.expense_amount = expenseAmount
      if (deductionPercentage !== undefined) updateData.deduction_percentage = deductionPercentage

      if (expenseAmount !== undefined) {
        updateData.deductible_amount = (parseFloat(expenseAmount) * deductionPercentage) / 100
      }
    }

    // Update deduction
    const { data: deduction, error } = await supabase
      .from('tax_deductions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this deduction
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Deduction not found or access denied' },
          { status: 404 }
        )
      }
      logger.error('Tax deduction update error', { error })
      return NextResponse.json(
        { error: 'Failed to update tax deduction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deduction
    })
  } catch (error) {
    logger.error('Tax deduction PUT error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tax/deductions/[id]
 * Delete a tax deduction
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete deduction
    const { error } = await supabase
      .from('tax_deductions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this deduction

    if (error) {
      logger.error('Tax deduction delete error', { error })
      return NextResponse.json(
        { error: 'Failed to delete tax deduction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Deduction deleted successfully'
    })
  } catch (error) {
    logger.error('Tax deduction DELETE error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
