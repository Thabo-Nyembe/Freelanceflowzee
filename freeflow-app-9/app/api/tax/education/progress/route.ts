import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('tax-education-progress')

/**
 * GET /api/tax/education/progress
 * Get user's education progress
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: progress, error } = await supabase
      .from('tax_education_progress')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Error fetching education progress', { error })
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }

    return NextResponse.json({ data: progress || [] })
  } catch (error) {
    logger.error('Tax education progress GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/tax/education/progress
 * Update user's lesson progress
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      lesson_id,
      section_id,
      completed_sections,
      quiz_score,
      time_spent,
      is_completed
    } = body

    // Upsert progress
    const { data: progress, error } = await supabase
      .from('tax_education_progress')
      .upsert({
        user_id: user.id,
        lesson_id,
        section_id,
        completed_sections: completed_sections || [],
        quiz_score,
        time_spent: time_spent || 0,
        is_completed: is_completed || false,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id'
      })
      .select()
      .single()

    if (error) {
      logger.error('Error updating education progress', { error })
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }

    return NextResponse.json({
      data: progress,
      message: 'Progress updated successfully'
    })
  } catch (error) {
    logger.error('Tax education progress POST error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
