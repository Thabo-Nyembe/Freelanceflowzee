'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface ThirdPartyIntegrationInput {
  name: string
  description?: string
  provider?: string
  logo?: string
  category?: 'saas' | 'database' | 'cloud' | 'messaging' | 'ecommerce' | 'collaboration' | 'monitoring' | 'deployment'
  auth_method?: 'api-key' | 'oauth2' | 'basic-auth' | 'jwt' | 'custom'
  status?: 'active' | 'pending' | 'inactive' | 'error' | 'testing'
  version?: string
  endpoints_count?: number
  rate_limit?: string
  documentation_url?: string
  features?: string[]
  tags?: string[]
  config?: Record<string, any>
}

export async function createThirdPartyIntegration(input: ThirdPartyIntegrationInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('third_party_integrations')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/third-party-integrations-v2')
  return { data }
}

export async function updateThirdPartyIntegration(id: string, input: Partial<ThirdPartyIntegrationInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('third_party_integrations')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/third-party-integrations-v2')
  return { data }
}

export async function deleteThirdPartyIntegration(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('third_party_integrations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/third-party-integrations-v2')
  return { success: true }
}

export async function activateIntegration(id: string) {
  return updateThirdPartyIntegration(id, { status: 'active' })
}

export async function deactivateIntegration(id: string) {
  return updateThirdPartyIntegration(id, { status: 'inactive' })
}

export async function syncIntegration(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: integration } = await supabase
    .from('third_party_integrations')
    .select('api_calls_count')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('third_party_integrations')
    .update({
      last_sync_at: new Date().toISOString(),
      api_calls_count: (integration?.api_calls_count || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/third-party-integrations-v2')
  return { data }
}

export async function testIntegration(id: string) {
  return updateThirdPartyIntegration(id, { status: 'testing' })
}

export async function getThirdPartyIntegrations() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('third_party_integrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
