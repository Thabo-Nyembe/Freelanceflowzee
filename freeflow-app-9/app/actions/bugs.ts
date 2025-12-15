'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createBug(input: CreateBugInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/bugs-v2')
  return { data }
}

export async function updateBug(id: string, input: UpdateBugInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/bugs-v2')
  return { data }
}

export async function deleteBug(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('bugs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/bugs-v2')
  return { success: true }
}

export async function resolveBug(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/bugs-v2')
  return { data }
}

export async function reopenBug(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/bugs-v2')
  return { data }
}

export async function addBugComment(bugId: string, input: {
  commenter_name: string
  commenter_email?: string
  comment_text: string
  is_internal?: boolean
  attachments?: unknown[]
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/bugs-v2')
  return { data }
}

export async function voteBug(id: string, increment: boolean = true) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // First get current votes
  const { data: bug, error: fetchError } = await supabase
    .from('bugs')
    .select('votes')
    .eq('id', id)
    .single()

  if (fetchError) {
    return { error: fetchError.message }
  }

  const newVotes = Math.max(0, (bug.votes || 0) + (increment ? 1 : -1))

  const { data, error } = await supabase
    .from('bugs')
    .update({ votes: newVotes, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/bugs-v2')
  return { data }
}

export async function watchBug(id: string, watch: boolean = true) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // First get current watchers
  const { data: bug, error: fetchError } = await supabase
    .from('bugs')
    .select('watchers')
    .eq('id', id)
    .single()

  if (fetchError) {
    return { error: fetchError.message }
  }

  const newWatchers = Math.max(0, (bug.watchers || 0) + (watch ? 1 : -1))

  const { data, error } = await supabase
    .from('bugs')
    .update({ watchers: newWatchers, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/bugs-v2')
  return { data }
}

export async function getBugs(filters?: {
  status?: string
  severity?: string
  priority?: string
  category?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  return { data }
}

export async function getBugComments(bugId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('bug_comments')
    .select('*')
    .eq('bug_id', bugId)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}
