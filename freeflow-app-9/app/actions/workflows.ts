'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// =====================================================
// WORKFLOWS SERVER ACTIONS
// =====================================================

export async function createWorkflow(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const type = formData.get('type') as string || 'approval'
  const priority = formData.get('priority') as string || 'medium'
  const stepsConfig = JSON.parse(formData.get('steps_config') as string || '[]')
  const assignedTo = JSON.parse(formData.get('assigned_to') as string || '[]')
  const dependencies = JSON.parse(formData.get('dependencies') as string || '[]')
  const estimatedCompletion = formData.get('estimated_completion') as string | null
  const tags = JSON.parse(formData.get('tags') as string || '[]')

  const { data, error } = await supabase
    .from('workflows')
    .insert({
      user_id: user.id,
      name,
      description,
      type,
      priority,
      steps_config: stepsConfig,
      assigned_to: assignedTo,
      dependencies,
      estimated_completion: estimatedCompletion,
      tags,
      total_steps: stepsConfig.length,
      approvals_required: stepsConfig.filter((s: any) => s.requires_approval).length
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function updateWorkflow(id: string, formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const updates: Record<string, any> = {}

  const name = formData.get('name')
  if (name) updates.name = name

  const description = formData.get('description')
  if (description !== null) updates.description = description

  const type = formData.get('type')
  if (type) updates.type = type

  const status = formData.get('status')
  if (status) updates.status = status

  const priority = formData.get('priority')
  if (priority) updates.priority = priority

  const stepsConfig = formData.get('steps_config')
  if (stepsConfig) {
    const config = JSON.parse(stepsConfig as string)
    updates.steps_config = config
    updates.total_steps = config.length
    updates.approvals_required = config.filter((s: any) => s.requires_approval).length
  }

  const assignedTo = formData.get('assigned_to')
  if (assignedTo) updates.assigned_to = JSON.parse(assignedTo as string)

  const dependencies = formData.get('dependencies')
  if (dependencies) updates.dependencies = JSON.parse(dependencies as string)

  const estimatedCompletion = formData.get('estimated_completion')
  if (estimatedCompletion) updates.estimated_completion = estimatedCompletion

  const tags = formData.get('tags')
  if (tags) updates.tags = JSON.parse(tags as string)

  const { data, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function deleteWorkflow(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('workflows')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true }
}

export async function startWorkflow(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('workflows')
    .update({
      status: 'active',
      started_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function pauseWorkflow(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('workflows')
    .update({ status: 'paused' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function resumeWorkflow(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('workflows')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function archiveWorkflow(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('workflows')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

// =====================================================
// WORKFLOW STEPS SERVER ACTIONS
// =====================================================

export async function addWorkflowStep(workflowId: string, formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const stepOrder = parseInt(formData.get('step_order') as string || '1')
  const actionType = formData.get('action_type') as string | null
  const actionConfig = JSON.parse(formData.get('action_config') as string || '{}')
  const assignedTo = JSON.parse(formData.get('assigned_to') as string || '[]')
  const dueDate = formData.get('due_date') as string | null
  const requiresApproval = formData.get('requires_approval') === 'true'

  const { data, error } = await supabase
    .from('workflow_steps')
    .insert({
      workflow_id: workflowId,
      name,
      description,
      step_order: stepOrder,
      action_type: actionType,
      action_config: actionConfig,
      assigned_to: assignedTo,
      due_date: dueDate,
      requires_approval: requiresApproval
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function updateWorkflowStep(id: string, formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const updates: Record<string, any> = {}

  const name = formData.get('name')
  if (name) updates.name = name

  const description = formData.get('description')
  if (description !== null) updates.description = description

  const stepOrder = formData.get('step_order')
  if (stepOrder) updates.step_order = parseInt(stepOrder as string)

  const status = formData.get('status')
  if (status) updates.status = status

  const actionType = formData.get('action_type')
  if (actionType) updates.action_type = actionType

  const actionConfig = formData.get('action_config')
  if (actionConfig) updates.action_config = JSON.parse(actionConfig as string)

  const assignedTo = formData.get('assigned_to')
  if (assignedTo) updates.assigned_to = JSON.parse(assignedTo as string)

  const dueDate = formData.get('due_date')
  if (dueDate) updates.due_date = dueDate

  const requiresApproval = formData.get('requires_approval')
  if (requiresApproval !== null) updates.requires_approval = requiresApproval === 'true'

  const { data, error } = await supabase
    .from('workflow_steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function deleteWorkflowStep(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('workflow_steps')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true }
}

export async function startStep(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('workflow_steps')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function completeStep(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('workflow_steps')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: user.id
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function approveStep(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('workflow_steps')
    .update({
      approved_at: new Date().toISOString(),
      approved_by: user.id
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}

export async function skipStep(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('workflow_steps')
    .update({ status: 'skipped' })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/workflows-v2')
  return { success: true, data }
}
