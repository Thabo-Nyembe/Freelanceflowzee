// Server Actions for Forms Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
export async function createForm(data: CreateFormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: form, error } = await supabase
    .from('forms')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/forms-v2')
  return form
}

// Update existing form
export async function updateForm({ id, ...data }: UpdateFormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: form, error } = await supabase
    .from('forms')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/forms-v2')
  return form
}

// Delete form (soft delete)
export async function deleteForm(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('forms')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/forms-v2')
}

// Publish form (activate)
export async function publishForm(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

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

  if (error) throw error

  revalidatePath('/dashboard/forms-v2')
  return form
}

// Pause form
export async function pauseForm(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: form, error } = await supabase
    .from('forms')
    .update({ status: 'paused' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/forms-v2')
  return form
}

// Close form
export async function closeForm(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

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

  if (error) throw error

  revalidatePath('/dashboard/forms-v2')
  return form
}

// Duplicate form
export async function duplicateForm(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get original form
  const { data: originalForm, error: fetchError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError) throw fetchError

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

  if (duplicateError) throw duplicateError

  revalidatePath('/dashboard/forms-v2')
  return duplicatedForm
}

// Increment form views
export async function incrementFormViews(id: string) {
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
      await supabase
        .from('forms')
        .update({ total_views: (form.total_views || 0) + 1 })
        .eq('id', id)
    }
  }

  revalidatePath('/dashboard/forms-v2')
}

// Get form statistics
export async function getFormStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: forms, error } = await supabase
    .from('forms')
    .select('status, form_type, total_submissions, total_views, completion_rate')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) throw error

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

  return stats
}
