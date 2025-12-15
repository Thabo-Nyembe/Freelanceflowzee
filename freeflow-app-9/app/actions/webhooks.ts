'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// =====================================================
// WEBHOOKS SERVER ACTIONS
// =====================================================

export async function createWebhook(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const description = formData.get('description') as string | null
  const secret = formData.get('secret') as string | null
  const events = JSON.parse(formData.get('events') as string || '[]')
  const retryCount = parseInt(formData.get('retry_count') as string || '3')
  const timeoutMs = parseInt(formData.get('timeout_ms') as string || '30000')
  const verifySsl = formData.get('verify_ssl') !== 'false'

  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      user_id: user.id,
      name,
      url,
      description,
      secret,
      events,
      retry_count: retryCount,
      timeout_ms: timeoutMs,
      verify_ssl: verifySsl
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/webhooks-v2')
  return { success: true, data }
}

export async function updateWebhook(id: string, formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const updates: Record<string, any> = {}

  const name = formData.get('name')
  if (name) updates.name = name

  const url = formData.get('url')
  if (url) updates.url = url

  const description = formData.get('description')
  if (description !== null) updates.description = description

  const secret = formData.get('secret')
  if (secret !== null) updates.secret = secret

  const events = formData.get('events')
  if (events) updates.events = JSON.parse(events as string)

  const status = formData.get('status')
  if (status) updates.status = status

  const retryCount = formData.get('retry_count')
  if (retryCount) updates.retry_count = parseInt(retryCount as string)

  const timeoutMs = formData.get('timeout_ms')
  if (timeoutMs) updates.timeout_ms = parseInt(timeoutMs as string)

  const verifySsl = formData.get('verify_ssl')
  if (verifySsl !== null) updates.verify_ssl = verifySsl !== 'false'

  const customHeaders = formData.get('custom_headers')
  if (customHeaders) updates.custom_headers = JSON.parse(customHeaders as string)

  const { data, error } = await supabase
    .from('webhooks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/webhooks-v2')
  return { success: true, data }
}

export async function deleteWebhook(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('webhooks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/webhooks-v2')
  return { success: true }
}

export async function toggleWebhookStatus(id: string, status: 'active' | 'paused' | 'disabled') {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('webhooks')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/webhooks-v2')
  return { success: true, data }
}

export async function testWebhook(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Create a test delivery
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .insert({
      webhook_id: id,
      event_type: 'test',
      event_id: `test-${Date.now()}`,
      payload: {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook delivery'
      },
      status: 'pending'
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/webhooks-v2')
  return { success: true, data }
}

export async function retryDelivery(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('webhook_deliveries')
    .update({
      status: 'retrying',
      next_retry_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/webhooks-v2')
  return { success: true, data }
}

// =====================================================
// WEBHOOK EVENT TYPES SERVER ACTIONS
// =====================================================

export async function createEventType(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const category = formData.get('category') as string | null

  const { data, error } = await supabase
    .from('webhook_event_types')
    .insert({
      user_id: user.id,
      name,
      description,
      category
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/webhooks-v2')
  return { success: true, data }
}

export async function toggleEventType(id: string, isActive: boolean) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('webhook_event_types')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/webhooks-v2')
  return { success: true, data }
}
