'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createTemplate(input: CreateTemplateInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/templates-v2')
  return { data }
}

export async function updateTemplate(id: string, input: UpdateTemplateInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('templates')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/templates-v2')
  return { data }
}

export async function publishTemplate(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('templates')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/templates-v2')
  return { data }
}

export async function archiveTemplate(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('templates')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/templates-v2')
  return { data }
}

export async function deleteTemplate(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('templates')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/templates-v2')
  return { success: true }
}

export async function useTemplate(templateId: string, userName?: string, department?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Record usage
  await supabase
    .from('template_usage')
    .insert({
      user_id: user.id,
      template_id: templateId,
      user_name: userName,
      department,
      action: 'used'
    })

  // Update usage count and last_used
  const { data: template } = await supabase
    .from('templates')
    .select('usage_count')
    .eq('id', templateId)
    .single()

  if (template) {
    await supabase
      .from('templates')
      .update({
        usage_count: (template.usage_count || 0) + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', templateId)
  }

  revalidatePath('/dashboard/templates-v2')
  return { success: true }
}

export async function downloadTemplate(templateId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Record download
  await supabase
    .from('template_usage')
    .insert({
      user_id: user.id,
      template_id: templateId,
      action: 'downloaded'
    })

  // Update download count
  const { data: template } = await supabase
    .from('templates')
    .select('downloads')
    .eq('id', templateId)
    .single()

  if (template) {
    await supabase
      .from('templates')
      .update({
        downloads: (template.downloads || 0) + 1
      })
      .eq('id', templateId)
  }

  revalidatePath('/dashboard/templates-v2')
  return { success: true }
}

export async function getTemplates(filters?: {
  status?: string
  category?: string
  accessLevel?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  return { data }
}
