'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, type ActionResult, ErrorCode } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'
import { uuidSchema } from '@/lib/validations'

const logger = createSimpleLogger('templates-actions')

export interface CreateTemplateInput {
  name: string
  description?: string
  category?: string
  access_level?: string
  creator_name?: string
  department?: string
  content?: string
  template_data?: Record<string, unknown>
  tags?: string[]
}

export interface UpdateTemplateInput {
  name?: string
  description?: string
  category?: string
  status?: string
  access_level?: string
  version?: string
  content?: string
  template_data?: Record<string, unknown>
  tags?: string[]
}

export interface Template {
  id: string
  user_id: string
  template_code: string
  name: string
  description?: string
  category: string
  status: string
  access_level: string
  creator_name?: string
  department?: string
  content?: string
  template_data?: Record<string, unknown>
  tags?: string[]
  version: string
  usage_count?: number
  downloads?: number
  last_used?: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

/**
 * Creates a new template
 */
export async function createTemplate(input: CreateTemplateInput): Promise<ActionResult<Template>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized template creation attempt')
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const templateCode = `TPL-${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        template_code: templateCode,
        name: input.name,
        description: input.description,
        category: input.category || 'document',
        status: 'draft',
        access_level: input.access_level || 'private',
        creator_name: input.creator_name,
        department: input.department,
        content: input.content,
        template_data: input.template_data || {},
        tags: input.tags || [],
        version: '1.0'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create template', { error, userId: user.id })
      return actionError('Failed to create template', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/templates-v2')
    logger.info('Template created successfully', { templateId: data.id, userId: user.id })
    return actionSuccess(data as Template, 'Template created successfully')
  } catch (error) {
    logger.error('Unexpected error in createTemplate', { error })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Updates an existing template
 */
export async function updateTemplate(id: string, input: UpdateTemplateInput): Promise<ActionResult<Template>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid template ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized template update attempt', { templateId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data, error } = await supabase
      .from('templates')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update template', { error, templateId: id, userId: user.id })
      return actionError('Failed to update template', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/templates-v2')
    logger.info('Template updated successfully', { templateId: id, userId: user.id })
    return actionSuccess(data as Template, 'Template updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateTemplate', { error, templateId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Publishes a template (sets status to active)
 */
export async function publishTemplate(id: string): Promise<ActionResult<Template>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid template ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized template publish attempt', { templateId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data, error } = await supabase
      .from('templates')
      .update({ status: 'active' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish template', { error, templateId: id, userId: user.id })
      return actionError('Failed to publish template', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/templates-v2')
    logger.info('Template published successfully', { templateId: id, userId: user.id })
    return actionSuccess(data as Template, 'Template published successfully')
  } catch (error) {
    logger.error('Unexpected error in publishTemplate', { error, templateId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Archives a template (sets status to archived)
 */
export async function archiveTemplate(id: string): Promise<ActionResult<Template>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid template ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized template archive attempt', { templateId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data, error } = await supabase
      .from('templates')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive template', { error, templateId: id, userId: user.id })
      return actionError('Failed to archive template', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/templates-v2')
    logger.info('Template archived successfully', { templateId: id, userId: user.id })
    return actionSuccess(data as Template, 'Template archived successfully')
  } catch (error) {
    logger.error('Unexpected error in archiveTemplate', { error, templateId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Soft deletes a template
 */
export async function deleteTemplate(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid template ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized template deletion attempt', { templateId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { error } = await supabase
      .from('templates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete template', { error, templateId: id, userId: user.id })
      return actionError('Failed to delete template', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/templates-v2')
    logger.info('Template deleted successfully', { templateId: id, userId: user.id })
    return actionSuccess({ success: true }, 'Template deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteTemplate', { error, templateId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Records template usage and updates usage statistics
 */
export async function useTemplate(
  templateId: string,
  userName?: string,
  department?: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(templateId)
    if (!idValidation.success) {
      return actionError('Invalid template ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized template usage attempt', { templateId })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    // Record usage
    const { error: usageError } = await supabase
      .from('template_usage')
      .insert({
        user_id: user.id,
        template_id: templateId,
        user_name: userName,
        department,
        action: 'used'
      })

    if (usageError) {
      logger.error('Failed to record template usage', { error: usageError, templateId, userId: user.id })
    }

    // Update usage count and last_used
    const { data: template } = await supabase
      .from('templates')
      .select('usage_count')
      .eq('id', templateId)
      .single()

    if (template) {
      const { error: updateError } = await supabase
        .from('templates')
        .update({
          usage_count: (template.usage_count || 0) + 1,
          last_used: new Date().toISOString()
        })
        .eq('id', templateId)

      if (updateError) {
        logger.error('Failed to update template usage count', { error: updateError, templateId })
      }
    }

    revalidatePath('/dashboard/templates-v2')
    logger.info('Template used successfully', { templateId, userId: user.id })
    return actionSuccess({ success: true }, 'Template used successfully')
  } catch (error) {
    logger.error('Unexpected error in useTemplate', { error, templateId })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Records template download and updates download statistics
 */
export async function downloadTemplate(templateId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(templateId)
    if (!idValidation.success) {
      return actionError('Invalid template ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized template download attempt', { templateId })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    // Record download
    const { error: usageError } = await supabase
      .from('template_usage')
      .insert({
        user_id: user.id,
        template_id: templateId,
        action: 'downloaded'
      })

    if (usageError) {
      logger.error('Failed to record template download', { error: usageError, templateId, userId: user.id })
    }

    // Update download count
    const { data: template } = await supabase
      .from('templates')
      .select('downloads')
      .eq('id', templateId)
      .single()

    if (template) {
      const { error: updateError } = await supabase
        .from('templates')
        .update({
          downloads: (template.downloads || 0) + 1
        })
        .eq('id', templateId)

      if (updateError) {
        logger.error('Failed to update template download count', { error: updateError, templateId })
      }
    }

    revalidatePath('/dashboard/templates-v2')
    logger.info('Template downloaded successfully', { templateId, userId: user.id })
    return actionSuccess({ success: true }, 'Template downloaded successfully')
  } catch (error) {
    logger.error('Unexpected error in downloadTemplate', { error, templateId })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Gets templates with optional filtering
 */
export async function getTemplates(filters?: {
  status?: string
  category?: string
  accessLevel?: string
}): Promise<ActionResult<Template[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized templates list attempt')
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    let query = supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.accessLevel) {
      query = query.eq('access_level', filters.accessLevel)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      logger.error('Failed to fetch templates', { error, userId: user.id })
      return actionError('Failed to fetch templates', ErrorCode.DATABASE_ERROR)
    }

    logger.info('Templates fetched successfully', { count: data?.length || 0, userId: user.id })
    return actionSuccess(data as Template[], 'Templates fetched successfully')
  } catch (error) {
    logger.error('Unexpected error in getTemplates', { error })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}
