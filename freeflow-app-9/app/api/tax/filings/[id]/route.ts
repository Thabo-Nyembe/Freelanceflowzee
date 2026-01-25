import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('tax-filings')

/**
 * GET /api/tax/filings/[id]
 * Get a specific tax filing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: filing, error } = await supabase
      .from('tax_filings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !filing) {
      return NextResponse.json({ error: 'Filing not found' }, { status: 404 })
    }

    return NextResponse.json({ data: filing })
  } catch (error) {
    logger.error('Tax filing GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/tax/filings/[id]
 * Update a tax filing
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Update filing
    const { data: filing, error } = await supabase
      .from('tax_filings')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating tax filing', { error })
      return NextResponse.json({ error: 'Failed to update filing' }, { status: 500 })
    }

    return NextResponse.json({
      data: filing,
      message: 'Filing updated successfully'
    })
  } catch (error) {
    logger.error('Tax filing PATCH error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/tax/filings/[id]
 * Delete a tax filing
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from('tax_filings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Error deleting tax filing', { error })
      return NextResponse.json({ error: 'Failed to delete filing' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Filing deleted successfully'
    })
  } catch (error) {
    logger.error('Tax filing DELETE error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
