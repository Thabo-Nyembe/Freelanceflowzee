'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('bugs-actions')

export interface CreateBugInput {
  title: string
  description?: string
  severity?: string
  priority?: string
  assignee_name?: string
  assignee_email?: string
  reporter_name?: string
  reporter_email?: string
  due_date?: string
  affected_version?: string
  target_version?: string
  category?: string
  is_reproducible?: boolean
  steps_to_reproduce?: string
  expected_behavior?: string
  actual_behavior?: string
  environment_details?: Record<string, unknown>
}

export interface UpdateBugInput {
  title?: string
  description?: string
  severity?: string
  status?: string
  priority?: string
  assignee_name?: string
  assignee_email?: string
  due_date?: string
  resolved_date?: string
  affected_version?: string
  target_version?: string
  category?: string
  is_reproducible?: boolean
  votes?: number
  watchers?: number
  steps_to_reproduce?: string
  expected_behavior?: string
  actual_behavior?: string
  environment_details?: Record<string, unknown>
  attachments?: unknown[]
  related_bugs?: unknown[]
}

export async function createBug(input: CreateBugInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const bugCode = `BUG-${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabase
      .from('bugs')
      .insert({
        user_id: user.id,
        bug_code: bugCode,
        title: input.title,
        description: input.description,
        severity: input.severity || 'medium',
        status: 'open',
        priority: input.priority || 'P2',
        assignee_name: input.assignee_name,
        assignee_email: input.assignee_email,
        reporter_name: input.reporter_name,
        reporter_email: input.reporter_email,
        due_date: input.due_date,
        affected_version: input.affected_version,
        target_version: input.target_version,
        category: input.category,
        is_reproducible: input.is_reproducible ?? true,
        steps_to_reproduce: input.steps_to_reproduce,
        expected_behavior: input.expected_behavior,
        actual_behavior: input.actual_behavior,
        environment_details: input.environment_details || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create bug', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/bugs-v2')
    logger.info('Bug created successfully', { bugId: data.id, bugCode })
    return actionSuccess(data, 'Bug created successfully')
  } catch (error) {
    logger.error('Unexpected error creating bug', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateBug(id: string, input: UpdateBugInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const updateData: Record<string, unknown> = {
      ...input,
      last_updated: new Date().toISOString()
    }

    // If resolving, set resolved_date
    if (input.status === 'resolved' && !input.resolved_date) {
      updateData.resolved_date = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('bugs')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update bug', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/bugs-v2')
    logger.info('Bug updated successfully', { bugId: id })
    return actionSuccess(data, 'Bug updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating bug', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteBug(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('bugs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete bug', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/bugs-v2')
    logger.info('Bug deleted successfully', { bugId: id })
    return actionSuccess({ success: true }, 'Bug deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting bug', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resolveBug(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('bugs')
      .update({
        status: 'resolved',
        resolved_date: new Date().toISOString(),
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resolve bug', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/bugs-v2')
    logger.info('Bug resolved successfully', { bugId: id })
    return actionSuccess(data, 'Bug resolved successfully')
  } catch (error) {
    logger.error('Unexpected error resolving bug', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function reopenBug(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('bugs')
      .update({
        status: 'open',
        resolved_date: null,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to reopen bug', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/bugs-v2')
    logger.info('Bug reopened successfully', { bugId: id })
    return actionSuccess(data, 'Bug reopened successfully')
  } catch (error) {
    logger.error('Unexpected error reopening bug', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addBugComment(bugId: string, input: {
  commenter_name: string
  commenter_email?: string
  comment_text: string
  is_internal?: boolean
  attachments?: unknown[]
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('bug_comments')
      .insert({
        user_id: user.id,
        bug_id: bugId,
        commenter_name: input.commenter_name,
        commenter_email: input.commenter_email,
        comment_text: input.comment_text,
        is_internal: input.is_internal ?? false,
        attachments: input.attachments || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add bug comment', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/bugs-v2')
    logger.info('Bug comment added successfully', { bugId, commentId: data.id })
    return actionSuccess(data, 'Comment added successfully')
  } catch (error) {
    logger.error('Unexpected error adding bug comment', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function voteBug(id: string, increment: boolean = true): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // First get current votes
    const { data: bug, error: fetchError } = await supabase
      .from('bugs')
      .select('votes')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch bug votes', fetchError)
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const newVotes = Math.max(0, (bug.votes || 0) + (increment ? 1 : -1))

    const { data, error } = await supabase
      .from('bugs')
      .update({ votes: newVotes, last_updated: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update bug votes', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/bugs-v2')
    logger.info('Bug vote updated successfully', { bugId: id, newVotes })
    return actionSuccess(data, 'Vote updated successfully')
  } catch (error) {
    logger.error('Unexpected error voting bug', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function watchBug(id: string, watch: boolean = true): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // First get current watchers
    const { data: bug, error: fetchError } = await supabase
      .from('bugs')
      .select('watchers')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch bug watchers', fetchError)
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const newWatchers = Math.max(0, (bug.watchers || 0) + (watch ? 1 : -1))

    const { data, error } = await supabase
      .from('bugs')
      .update({ watchers: newWatchers, last_updated: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update bug watchers', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/bugs-v2')
    logger.info('Bug watch status updated successfully', { bugId: id, newWatchers })
    return actionSuccess(data, 'Watch status updated successfully')
  } catch (error) {
    logger.error('Unexpected error watching bug', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getBugs(filters?: {
  status?: string
  severity?: string
  priority?: string
  category?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    let query = supabase
      .from('bugs')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_date', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      logger.error('Failed to get bugs', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Bugs retrieved successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Bugs retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting bugs', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getBugComments(bugId: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('bug_comments')
      .select('*')
      .eq('bug_id', bugId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to get bug comments', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Bug comments retrieved successfully', { bugId, count: data?.length || 0 })
    return actionSuccess(data || [], 'Comments retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting bug comments', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
