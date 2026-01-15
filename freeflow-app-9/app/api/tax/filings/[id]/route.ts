import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/tax/filings/[id]
 * Get a specific tax filing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: filing, error } = await supabase
      .from('tax_filings')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !filing) {
      return NextResponse.json({ error: 'Filing not found' }, { status: 404 })
    }

    return NextResponse.json({ data: filing })
  } catch (error) {
    console.error('Tax filing GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/tax/filings/[id]
 * Update a tax filing
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Update filing
    const { data: filing, error } = await supabase
      .from('tax_filings')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tax filing:', error)
      return NextResponse.json({ error: 'Failed to update filing' }, { status: 500 })
    }

    return NextResponse.json({
      data: filing,
      message: 'Filing updated successfully'
    })
  } catch (error) {
    console.error('Tax filing PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/tax/filings/[id]
 * Delete a tax filing
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('tax_filings')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting tax filing:', error)
      return NextResponse.json({ error: 'Failed to delete filing' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Filing deleted successfully'
    })
  } catch (error) {
    console.error('Tax filing DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
