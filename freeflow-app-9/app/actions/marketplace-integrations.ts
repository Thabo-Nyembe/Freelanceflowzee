'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface MarketplaceIntegrationInput {
  name: string
  description?: string
  provider?: string
  logo?: string
  category?: 'crm' | 'marketing' | 'productivity' | 'communication' | 'analytics' | 'payment' | 'storage' | 'social'
  integration_type?: 'native' | 'api' | 'webhook' | 'oauth' | 'zapier'
  status?: 'connected' | 'available' | 'disconnected' | 'configuring' | 'error'
  version?: string
  pricing?: string
  sync_frequency?: string
  data_direction?: string
  setup_time?: string
  features?: string[]
  tags?: string[]
  config?: Record<string, any>
}

export async function createMarketplaceIntegration(input: MarketplaceIntegrationInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('marketplace_integrations')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/integrations-marketplace-v2')
  return { data }
}

export async function updateMarketplaceIntegration(id: string, input: Partial<MarketplaceIntegrationInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('marketplace_integrations')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/integrations-marketplace-v2')
  return { data }
}

export async function deleteMarketplaceIntegration(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('marketplace_integrations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/integrations-marketplace-v2')
  return { success: true }
}

export async function connectIntegration(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // First set to configuring
  await supabase
    .from('marketplace_integrations')
    .update({ status: 'configuring' })
    .eq('id', id)
    .eq('user_id', user.id)

  // Then complete connection
  const { data, error } = await supabase
    .from('marketplace_integrations')
    .update({
      status: 'connected',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/integrations-marketplace-v2')
  return { data }
}

export async function disconnectIntegration(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('marketplace_integrations')
    .update({
      status: 'disconnected',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/integrations-marketplace-v2')
  return { data }
}

export async function rateIntegration(id: string, rating: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: integration } = await supabase
    .from('marketplace_integrations')
    .select('rating, reviews_count')
    .eq('id', id)
    .single()

  if (!integration) {
    return { error: 'Integration not found' }
  }

  const newReviewsCount = (integration.reviews_count || 0) + 1
  const currentTotal = (integration.rating || 0) * (integration.reviews_count || 0)
  const newRating = (currentTotal + rating) / newReviewsCount

  const { data, error } = await supabase
    .from('marketplace_integrations')
    .update({
      rating: Math.round(newRating * 100) / 100,
      reviews_count: newReviewsCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/integrations-marketplace-v2')
  return { data }
}

export async function getMarketplaceIntegrations() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('marketplace_integrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
