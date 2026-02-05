/**
 * Segments API
 * Manage audience segments for targeted announcements
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('segments')

interface SegmentRule {
  attribute: string
  operator: string
  value: string
}

/**
 * GET /api/segments - List all segments
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const segmentId = searchParams.get('id')

    if (segmentId) {
      // Get specific segment
      const { data, error } = await supabase
        .from('audience_segments')
        .select('*')
        .eq('id', segmentId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return NextResponse.json({ segment: data })
    }

    // List all segments
    const { data, error } = await supabase
      .from('audience_segments')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate user counts for each segment
    const segmentsWithCounts = await Promise.all(
      (data || []).map(async (segment) => {
        const userCount = await calculateSegmentUserCount(supabase, segment.rules || [])
        return { ...segment, user_count: userCount }
      })
    )

    return NextResponse.json({ segments: segmentsWithCounts })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch segments'
    logger.error('Segments GET error', { error })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * POST /api/segments - Create a new segment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, rules } = body as {
      name: string
      description?: string
      rules?: SegmentRule[]
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Segment name is required' },
        { status: 400 }
      )
    }

    // Calculate initial user count
    const userCount = await calculateSegmentUserCount(supabase, rules || [])

    const { data, error } = await supabase
      .from('audience_segments')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        rules: rules || [],
        user_count: userCount,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { segment: data, message: 'Segment created successfully' },
      { status: 201 }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create segment'
    logger.error('Segments POST error', { error })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * Helper function to calculate user count based on segment rules
 */
async function calculateSegmentUserCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rules: SegmentRule[]
): Promise<number> {
  if (!rules || rules.length === 0) {
    // Return total user count if no rules
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    return count || 0
  }

  // Build query based on rules
  let query = supabase.from('profiles').select('*', { count: 'exact', head: true })

  for (const rule of rules) {
    if (!rule.attribute || !rule.value) continue

    switch (rule.operator) {
      case '=':
      case 'equals':
        query = query.eq(rule.attribute, rule.value)
        break
      case '!=':
      case 'not_equals':
        query = query.neq(rule.attribute, rule.value)
        break
      case 'contains':
        query = query.ilike(rule.attribute, `%${rule.value}%`)
        break
      case 'starts_with':
        query = query.ilike(rule.attribute, `${rule.value}%`)
        break
      case 'ends_with':
        query = query.ilike(rule.attribute, `%${rule.value}`)
        break
      case '>':
      case 'gt':
        query = query.gt(rule.attribute, rule.value)
        break
      case '>=':
      case 'gte':
        query = query.gte(rule.attribute, rule.value)
        break
      case '<':
      case 'lt':
        query = query.lt(rule.attribute, rule.value)
        break
      case '<=':
      case 'lte':
        query = query.lte(rule.attribute, rule.value)
        break
    }
  }

  const { count } = await query
  return count || 0
}
