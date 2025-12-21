// Server Actions for Forms Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('forms-actions')

interface CreateFormData {
  title: string
  description?: string
  form_type: string
  status?: string
  fields: any
  field_count?: number
  sections?: any
  allow_multiple_submissions?: boolean
  require_authentication?: boolean
  allow_save_draft?: boolean
  show_progress_bar?: boolean
  validation_rules?: any
  required_fields?: any
  max_submissions?: number
  submission_deadline?: string
  starts_at?: string
  ends_at?: string
  confirmation_message?: string
  redirect_url?: string
  send_confirmation_email?: boolean
  email_template_id?: string
  notification_emails?: any
  is_public?: boolean
  password_protected?: boolean
  access_code?: string
  allowed_domains?: any
  theme?: string
  custom_css?: string
  logo_url?: string
  background_image_url?: string
  primary_color?: string
  webhook_url?: string
  webhook_events?: any
  integration_settings?: any
  analytics_enabled?: boolean
  track_source?: boolean
  track_location?: boolean
  tags?: any
  metadata?: any
}

interface UpdateFormData extends Partial<CreateFormData> {
  id: string
}

// Create new form
export async function createForm(data: CreateFormData): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: form, error } = await supabase
      .from('forms')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create form', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/forms-v2')
    logger.info('Form created successfully', { formId: form.id })
    return actionSuccess(form, 'Form created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating form', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update existing form
export async function updateForm({ id, ...data }: UpdateFormData): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: form, error } = await supabase
      .from('forms')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update form', { error, formId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/forms-v2')
    logger.info('Form updated successfully', { formId: id })
    return actionSuccess(form, 'Form updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating form', { error, formId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete form (soft delete)
export async function deleteForm(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('forms')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete form', { error, formId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/forms-v2')
    logger.info('Form deleted successfully', { formId: id })
    return actionSuccess(undefined, 'Form deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting form', { error, formId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Publish form (activate)
export async function publishForm(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: form, error } = await supabase
      .from('forms')
      .update({
        status: 'active',
        starts_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish form', { error, formId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/forms-v2')
    logger.info('Form published successfully', { formId: id })
    return actionSuccess(form, 'Form published successfully')
  } catch (error: any) {
    logger.error('Unexpected error publishing form', { error, formId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Pause form
export async function pauseForm(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: form, error } = await supabase
      .from('forms')
      .update({ status: 'paused' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pause form', { error, formId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/forms-v2')
    logger.info('Form paused successfully', { formId: id })
    return actionSuccess(form, 'Form paused successfully')
  } catch (error: any) {
    logger.error('Unexpected error pausing form', { error, formId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Close form
export async function closeForm(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: form, error } = await supabase
      .from('forms')
      .update({
        status: 'closed',
        ends_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to close form', { error, formId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/forms-v2')
    logger.info('Form closed successfully', { formId: id })
    return actionSuccess(form, 'Form closed successfully')
  } catch (error: any) {
    logger.error('Unexpected error closing form', { error, formId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Duplicate form
export async function duplicateForm(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get original form
    const { data: originalForm, error: fetchError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch form for duplication', { error: fetchError, formId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    // Create duplicate
    const { id: _, created_at, updated_at, deleted_at, ...formData } = originalForm
    const { data: duplicatedForm, error: duplicateError } = await supabase
      .from('forms')
      .insert({
        ...formData,
        title: `${formData.title} (Copy)`,
        status: 'draft',
        total_submissions: 0,
        total_views: 0,
        total_started: 0,
        total_completed: 0,
        completion_rate: 0,
        average_completion_time: 0
      })
      .select()
      .single()

    if (duplicateError) {
      logger.error('Failed to duplicate form', { error: duplicateError, formId: id })
      return actionError(duplicateError.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/forms-v2')
    logger.info('Form duplicated successfully', { originalId: id, duplicateId: duplicatedForm.id })
    return actionSuccess(duplicatedForm, 'Form duplicated successfully')
  } catch (error: any) {
    logger.error('Unexpected error duplicating form', { error, formId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Increment form views
export async function incrementFormViews(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { error } = await supabase.rpc('increment_form_views', { form_id: id })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: form } = await supabase
        .from('forms')
        .select('total_views')
        .eq('id', id)
        .single()

      if (form) {
        const { error: updateError } = await supabase
          .from('forms')
          .update({ total_views: (form.total_views || 0) + 1 })
          .eq('id', id)

        if (updateError) {
          logger.error('Failed to increment form views (fallback)', { error: updateError, formId: id })
          return actionError(updateError.message, 'DATABASE_ERROR')
        }
      }
    }

    revalidatePath('/dashboard/forms-v2')
    logger.info('Form views incremented successfully', { formId: id })
    return actionSuccess(undefined, 'Form views incremented successfully')
  } catch (error: any) {
    logger.error('Unexpected error incrementing form views', { error, formId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Get form statistics
export async function getFormStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: forms, error } = await supabase
      .from('forms')
      .select('status, form_type, total_submissions, total_views, completion_rate')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get form stats', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats = {
      total: forms?.length || 0,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      totalSubmissions: 0,
      totalViews: 0,
      averageCompletionRate: 0
    }

    let totalCompletionRate = 0
    let formsWithSubmissions = 0

    forms?.forEach(form => {
      stats.byStatus[form.status] = (stats.byStatus[form.status] || 0) + 1
      stats.byType[form.form_type] = (stats.byType[form.form_type] || 0) + 1
      stats.totalSubmissions += form.total_submissions || 0
      stats.totalViews += form.total_views || 0
      if (form.completion_rate > 0) {
        totalCompletionRate += form.completion_rate
        formsWithSubmissions++
      }
    })

    stats.averageCompletionRate = formsWithSubmissions > 0
      ? totalCompletionRate / formsWithSubmissions
      : 0

    logger.info('Form stats retrieved successfully', { total: stats.total })
    return actionSuccess(stats, 'Form stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting form stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
