import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('tax-insights-dismiss')

/**
 * POST /api/tax/insights/[id]/dismiss
 * Mark an insight as read/dismissed
 */
export async function POST(
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

    // Update insight to mark as read
    const { data: insight, error } = await supabase
      .from('tax_insights')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this insight
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Insight not found or access denied' },
          { status: 404 }
        )
      }
      logger.error('Tax insight dismiss error', { error })
      return NextResponse.json(
        { error: 'Failed to dismiss tax insight' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: insight
    })
  } catch (error) {
    logger.error('Tax insight dismiss error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
