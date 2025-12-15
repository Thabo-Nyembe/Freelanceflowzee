'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface MobileAppFeatureInput {
  title: string
  description?: string
  feature_type?: 'core' | 'standard' | 'premium' | 'beta' | 'experimental'
  status?: 'active' | 'inactive' | 'beta' | 'deprecated' | 'coming-soon'
  platform?: 'all' | 'ios' | 'android'
  version?: string
  icon_color?: string
  tags?: string[]
  config?: Record<string, any>
}

export interface MobileAppVersionInput {
  version: string
  platform?: 'all' | 'ios' | 'android'
  status?: 'stable' | 'beta' | 'deprecated' | 'archived'
  release_notes?: string
  features?: string[]
  min_os_version?: string
  size_mb?: number
}

export async function createMobileFeature(input: MobileAppFeatureInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('mobile_app_features')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/mobile-app-v2')
  return { data }
}

export async function updateMobileFeature(id: string, input: Partial<MobileAppFeatureInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('mobile_app_features')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/mobile-app-v2')
  return { data }
}

export async function deleteMobileFeature(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('mobile_app_features')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/mobile-app-v2')
  return { success: true }
}

export async function activateFeature(id: string) {
  return updateMobileFeature(id, { status: 'active' })
}

export async function deactivateFeature(id: string) {
  return updateMobileFeature(id, { status: 'inactive' })
}

export async function createMobileVersion(input: MobileAppVersionInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('mobile_app_versions')
    .insert([{
      ...input,
      user_id: user.id,
      release_date: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/mobile-app-v2')
  return { data }
}

export async function updateMobileVersion(id: string, input: Partial<MobileAppVersionInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('mobile_app_versions')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/mobile-app-v2')
  return { data }
}

export async function deprecateVersion(id: string) {
  return updateMobileVersion(id, { status: 'deprecated' })
}

export async function getMobileAppData() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', features: [], versions: [] }
  }

  const [featuresResult, versionsResult] = await Promise.all([
    supabase
      .from('mobile_app_features')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('mobile_app_versions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  ])

  return {
    features: featuresResult.data || [],
    versions: versionsResult.data || []
  }
}
