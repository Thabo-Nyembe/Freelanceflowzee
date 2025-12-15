'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface IntegrationInput {
  name: string
  provider: string
  description?: string
  icon?: string
  category?: string
  is_connected?: boolean
  status?: 'connected' | 'disconnected' | 'error' | 'pending'
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  config?: Record<string, any>
  permissions?: string[]
  metadata?: Record<string, any>
}

export async function getIntegrations() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function getIntegration(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createIntegration(input: IntegrationInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('integrations')
    .insert({
      ...input,
      user_id: user.id,
      config: input.config || {},
      permissions: input.permissions || [],
      metadata: input.metadata || {}
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/integrations-v2')
  return { data, error: null }
}

export async function updateIntegration(id: string, input: Partial<IntegrationInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('integrations')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/integrations-v2')
  return { data, error: null }
}

export async function deleteIntegration(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/integrations-v2')
  return { success: true, error: null }
}

export async function connectIntegration(id: string, accessToken?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('integrations')
    .update({
      is_connected: true,
      status: 'connected',
      access_token: accessToken,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/integrations-v2')
  return { data, error: null }
}

export async function disconnectIntegration(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('integrations')
    .update({
      is_connected: false,
      status: 'disconnected',
      access_token: null,
      refresh_token: null,
      connected_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/integrations-v2')
  return { data, error: null }
}

export async function syncIntegration(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get current integration
  const { data: integration, error: fetchError } = await supabase
    .from('integrations')
    .select('data_synced_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return { error: fetchError.message, data: null }
  }

  // Update sync stats
  const { data, error } = await supabase
    .from('integrations')
    .update({
      last_sync_at: new Date().toISOString(),
      data_synced_count: (integration?.data_synced_count || 0) + Math.floor(Math.random() * 100) + 10,
      api_calls_count: Math.floor(Math.random() * 50) + 5,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/integrations-v2')
  return { data, error: null }
}

export async function getIntegrationStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('is_connected, api_calls_count, data_synced_count')
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, data: null }
  }

  const stats = {
    total: integrations?.length || 0,
    connected: integrations?.filter(i => i.is_connected).length || 0,
    disconnected: integrations?.filter(i => !i.is_connected).length || 0,
    totalApiCalls: integrations?.reduce((sum, i) => sum + (i.api_calls_count || 0), 0) || 0,
    totalDataSynced: integrations?.reduce((sum, i) => sum + (i.data_synced_count || 0), 0) || 0
  }

  return { data: stats, error: null }
}
