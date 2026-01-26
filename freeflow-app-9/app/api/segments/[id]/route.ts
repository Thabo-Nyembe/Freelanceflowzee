/**
 * Segment by ID API
 * CRUD operations for individual segments
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('segments')

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/segments/[id] - Get a specific segment
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const { data, error } = await supabase
      .from('audience_segments')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Segment not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ segment: data })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch segment'
    logger.error('Segment GET error', { error })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/segments/[id] - Update a segment
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, rules, is_active } = body

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name.trim()
    if (description !== undefined) updates.description = description?.trim() || null
    if (rules !== undefined) updates.rules = rules
    if (is_active !== undefined) updates.is_active = is_active

    const { data, error } = await supabase
      .from('audience_segments')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Segment not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ segment: data, message: 'Segment updated successfully' })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update segment'
    logger.error('Segment PATCH error', { error })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/segments/[id] - Soft delete a segment
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const { error } = await supabase
      .from('audience_segments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Segment deleted successfully' })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete segment'
    logger.error('Segment DELETE error', { error })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
