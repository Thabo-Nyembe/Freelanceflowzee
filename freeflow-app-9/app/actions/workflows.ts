'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('workflows')

// ============================================
// TYPE DEFINITIONS
// ============================================

interface StepConfig {
  name: string
  description?: string
  requires_approval?: boolean
  [key: string]: unknown
}

interface Workflow {
  id: string
  user_id: string
  name: string
  description?: string
  type: string
  status: string
  priority: string
  steps_config: StepConfig[]
  assigned_to: string[]
  dependencies: string[]
  estimated_completion?: string
  tags: string[]
  total_steps: number
  approvals_required: number
  started_at?: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

interface WorkflowStep {
  id: string
  workflow_id: string
  name: string
  description?: string
  step_order: number
  status: string
  action_type?: string
  action_config: Record<string, unknown>
  assigned_to: string[]
  due_date?: string
  requires_approval: boolean
  started_at?: string
  completed_at?: string
  completed_by?: string
  approved_at?: string
  approved_by?: string
  created_at: string
  updated_at: string
}

// ============================================
// WORKFLOWS SERVER ACTIONS
// ============================================

export async function createWorkflow(formData: FormData): Promise<ActionResult<Workflow>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const type = formData.get('type') as string || 'approval'
    const priority = formData.get('priority') as string || 'medium'

    let stepsConfig: StepConfig[] = []
    let assignedTo: string[] = []
    let dependencies: string[] = []
    let tags: string[] = []

    try {
      stepsConfig = JSON.parse(formData.get('steps_config') as string || '[]')
      assignedTo = JSON.parse(formData.get('assigned_to') as string || '[]')
      dependencies = JSON.parse(formData.get('dependencies') as string || '[]')
      tags = JSON.parse(formData.get('tags') as string || '[]')
    } catch (parseError) {
      logger.error('Failed to parse workflow form data', { error: parseError, userId: user.id })
      return actionError('Invalid form data format', 'VALIDATION_ERROR')
    }

    const estimatedCompletion = formData.get('estimated_completion') as string | null

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
        approvals_required: stepsConfig.filter(s => s.requires_approval).length
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create workflow', { error, userId: user.id })
      return actionError('Failed to create workflow', 'DATABASE_ERROR')
    }

    logger.info('Workflow created successfully', {
      workflowId: data.id,
      name,
      userId: user.id,
      totalSteps: stepsConfig.length
    })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow created successfully')
  } catch (error) {
    logger.error('Unexpected error creating workflow', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateWorkflow(
  id: string,
  formData: FormData
): Promise<ActionResult<Workflow>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow update attempt', { workflowId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const updates: Record<string, unknown> = {}

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
      try {
        const config = JSON.parse(stepsConfig as string)
        updates.steps_config = config
        updates.total_steps = config.length
        updates.approvals_required = config.filter((s: StepConfig) => s.requires_approval).length
      } catch (parseError) {
        logger.error('Failed to parse steps config', {
          error: parseError,
          workflowId: id,
          userId: user.id
        })
        return actionError('Invalid steps config format', 'VALIDATION_ERROR')
      }
    }

    const assignedTo = formData.get('assigned_to')
    if (assignedTo) {
      try {
        updates.assigned_to = JSON.parse(assignedTo as string)
      } catch (parseError) {
        return actionError('Invalid assigned_to format', 'VALIDATION_ERROR')
      }
    }

    const dependencies = formData.get('dependencies')
    if (dependencies) {
      try {
        updates.dependencies = JSON.parse(dependencies as string)
      } catch (parseError) {
        return actionError('Invalid dependencies format', 'VALIDATION_ERROR')
      }
    }

    const estimatedCompletion = formData.get('estimated_completion')
    if (estimatedCompletion) updates.estimated_completion = estimatedCompletion

    const tags = formData.get('tags')
    if (tags) {
      try {
        updates.tags = JSON.parse(tags as string)
      } catch (parseError) {
        return actionError('Invalid tags format', 'VALIDATION_ERROR')
      }
    }

    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update workflow', { error, workflowId: id, userId: user.id })
      return actionError('Failed to update workflow', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow not found for update', { workflowId: id, userId: user.id })
      return actionError('Workflow not found', 'NOT_FOUND')
    }

    logger.info('Workflow updated successfully', { workflowId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating workflow', { error, workflowId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteWorkflow(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow deletion attempt', { workflowId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('workflows')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete workflow', { error, workflowId: id, userId: user.id })
      return actionError('Failed to delete workflow', 'DATABASE_ERROR')
    }

    logger.info('Workflow deleted successfully', { workflowId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess({ success: true }, 'Workflow deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting workflow', { error, workflowId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startWorkflow(id: string): Promise<ActionResult<Workflow>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow start attempt', { workflowId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to start workflow', { error, workflowId: id, userId: user.id })
      return actionError('Failed to start workflow', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow not found for start', { workflowId: id, userId: user.id })
      return actionError('Workflow not found', 'NOT_FOUND')
    }

    logger.info('Workflow started successfully', { workflowId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow started successfully')
  } catch (error) {
    logger.error('Unexpected error starting workflow', { error, workflowId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function pauseWorkflow(id: string): Promise<ActionResult<Workflow>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow pause attempt', { workflowId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('workflows')
      .update({ status: 'paused' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pause workflow', { error, workflowId: id, userId: user.id })
      return actionError('Failed to pause workflow', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow not found for pause', { workflowId: id, userId: user.id })
      return actionError('Workflow not found', 'NOT_FOUND')
    }

    logger.info('Workflow paused successfully', { workflowId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow paused successfully')
  } catch (error) {
    logger.error('Unexpected error pausing workflow', { error, workflowId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resumeWorkflow(id: string): Promise<ActionResult<Workflow>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow resume attempt', { workflowId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('workflows')
      .update({ status: 'active' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resume workflow', { error, workflowId: id, userId: user.id })
      return actionError('Failed to resume workflow', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow not found for resume', { workflowId: id, userId: user.id })
      return actionError('Workflow not found', 'NOT_FOUND')
    }

    logger.info('Workflow resumed successfully', { workflowId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow resumed successfully')
  } catch (error) {
    logger.error('Unexpected error resuming workflow', { error, workflowId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function archiveWorkflow(id: string): Promise<ActionResult<Workflow>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow archive attempt', { workflowId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('workflows')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive workflow', { error, workflowId: id, userId: user.id })
      return actionError('Failed to archive workflow', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow not found for archive', { workflowId: id, userId: user.id })
      return actionError('Workflow not found', 'NOT_FOUND')
    }

    logger.info('Workflow archived successfully', { workflowId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow archived successfully')
  } catch (error) {
    logger.error('Unexpected error archiving workflow', { error, workflowId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// WORKFLOW STEPS SERVER ACTIONS
// ============================================

export async function addWorkflowStep(
  workflowId: string,
  formData: FormData
): Promise<ActionResult<WorkflowStep>> {
  try {
    const idValidation = uuidSchema.safeParse(workflowId)
    if (!idValidation.success) {
      return actionError('Invalid workflow ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow step addition attempt', { workflowId })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const stepOrder = parseInt(formData.get('step_order') as string || '1')
    const actionType = formData.get('action_type') as string | null
    const dueDate = formData.get('due_date') as string | null
    const requiresApproval = formData.get('requires_approval') === 'true'

    let actionConfig: Record<string, unknown> = {}
    let assignedTo: string[] = []

    try {
      actionConfig = JSON.parse(formData.get('action_config') as string || '{}')
      assignedTo = JSON.parse(formData.get('assigned_to') as string || '[]')
    } catch (parseError) {
      logger.error('Failed to parse workflow step form data', {
        error: parseError,
        workflowId,
        userId: user.id
      })
      return actionError('Invalid form data format', 'VALIDATION_ERROR')
    }

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

    if (error) {
      logger.error('Failed to add workflow step', { error, workflowId, userId: user.id })
      return actionError('Failed to add workflow step', 'DATABASE_ERROR')
    }

    logger.info('Workflow step added successfully', {
      stepId: data.id,
      workflowId,
      userId: user.id
    })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow step added successfully')
  } catch (error) {
    logger.error('Unexpected error adding workflow step', { error, workflowId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateWorkflowStep(
  id: string,
  formData: FormData
): Promise<ActionResult<WorkflowStep>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow step ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow step update attempt', { stepId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const updates: Record<string, unknown> = {}

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
    if (actionConfig) {
      try {
        updates.action_config = JSON.parse(actionConfig as string)
      } catch (parseError) {
        return actionError('Invalid action config format', 'VALIDATION_ERROR')
      }
    }

    const assignedTo = formData.get('assigned_to')
    if (assignedTo) {
      try {
        updates.assigned_to = JSON.parse(assignedTo as string)
      } catch (parseError) {
        return actionError('Invalid assigned_to format', 'VALIDATION_ERROR')
      }
    }

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

    if (error) {
      logger.error('Failed to update workflow step', { error, stepId: id, userId: user.id })
      return actionError('Failed to update workflow step', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow step not found for update', { stepId: id, userId: user.id })
      return actionError('Workflow step not found', 'NOT_FOUND')
    }

    logger.info('Workflow step updated successfully', { stepId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow step updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating workflow step', { error, stepId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteWorkflowStep(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow step ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow step deletion attempt', { stepId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('workflow_steps')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Failed to delete workflow step', { error, stepId: id, userId: user.id })
      return actionError('Failed to delete workflow step', 'DATABASE_ERROR')
    }

    logger.info('Workflow step deleted successfully', { stepId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess({ success: true }, 'Workflow step deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting workflow step', { error, stepId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startStep(id: string): Promise<ActionResult<WorkflowStep>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow step ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow step start attempt', { stepId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('workflow_steps')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start workflow step', { error, stepId: id, userId: user.id })
      return actionError('Failed to start workflow step', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow step not found for start', { stepId: id, userId: user.id })
      return actionError('Workflow step not found', 'NOT_FOUND')
    }

    logger.info('Workflow step started successfully', { stepId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow step started successfully')
  } catch (error) {
    logger.error('Unexpected error starting workflow step', { error, stepId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeStep(id: string): Promise<ActionResult<WorkflowStep>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow step ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow step completion attempt', { stepId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to complete workflow step', { error, stepId: id, userId: user.id })
      return actionError('Failed to complete workflow step', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow step not found for completion', { stepId: id, userId: user.id })
      return actionError('Workflow step not found', 'NOT_FOUND')
    }

    logger.info('Workflow step completed successfully', { stepId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow step completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing workflow step', { error, stepId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function approveStep(id: string): Promise<ActionResult<WorkflowStep>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow step ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow step approval attempt', { stepId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('workflow_steps')
      .update({
        approved_at: new Date().toISOString(),
        approved_by: user.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to approve workflow step', { error, stepId: id, userId: user.id })
      return actionError('Failed to approve workflow step', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow step not found for approval', { stepId: id, userId: user.id })
      return actionError('Workflow step not found', 'NOT_FOUND')
    }

    logger.info('Workflow step approved successfully', { stepId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow step approved successfully')
  } catch (error) {
    logger.error('Unexpected error approving workflow step', { error, stepId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function skipStep(id: string): Promise<ActionResult<WorkflowStep>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid workflow step ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized workflow step skip attempt', { stepId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('workflow_steps')
      .update({ status: 'skipped' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to skip workflow step', { error, stepId: id, userId: user.id })
      return actionError('Failed to skip workflow step', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Workflow step not found for skip', { stepId: id, userId: user.id })
      return actionError('Workflow step not found', 'NOT_FOUND')
    }

    logger.info('Workflow step skipped successfully', { stepId: id, userId: user.id })

    revalidatePath('/dashboard/workflows-v2')
    return actionSuccess(data, 'Workflow step skipped successfully')
  } catch (error) {
    logger.error('Unexpected error skipping workflow step', { error, stepId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
