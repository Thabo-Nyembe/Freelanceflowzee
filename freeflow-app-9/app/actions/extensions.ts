'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface ExtensionInput {
  name: string
  description?: string
  version?: string
  developer?: string
  category?: 'browser' | 'desktop' | 'mobile' | 'api' | 'workflow' | 'integration' | 'utility' | 'enhancement'
  extension_type?: 'official' | 'verified' | 'third-party' | 'experimental' | 'legacy'
  status?: 'enabled' | 'disabled' | 'installing' | 'updating' | 'error'
  size?: string
  platform?: string
  permissions?: string[]
  features?: string[]
  compatibility?: string[]
  tags?: string[]
  icon_url?: string
  download_url?: string
  documentation_url?: string
  release_date?: string
  metadata?: Record<string, any>
}

export async function createExtension(input: ExtensionInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('extensions')
    .insert([{
      ...input,
      user_id: user.id
    }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/extensions-v2')
  return { data }
}

export async function updateExtension(id: string, input: Partial<ExtensionInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('extensions')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/extensions-v2')
  return { data }
}

export async function deleteExtension(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('extensions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/extensions-v2')
  return { success: true }
}

export async function enableExtension(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('extensions')
    .update({
      status: 'enabled',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/extensions-v2')
  return { data }
}

export async function disableExtension(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('extensions')
    .update({
      status: 'disabled',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/extensions-v2')
  return { data }
}

export async function installExtension(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // First set to installing
  await supabase
    .from('extensions')
    .update({
      status: 'installing',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)

  // Then complete installation (in real app, this would be async)
  const { data, error } = await supabase
    .from('extensions')
    .update({
      status: 'enabled',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/extensions-v2')
  return { data }
}

export async function updateExtensionVersion(id: string, newVersion: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // First set to updating
  await supabase
    .from('extensions')
    .update({
      status: 'updating',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)

  // Then complete update
  const { data, error } = await supabase
    .from('extensions')
    .update({
      version: newVersion,
      status: 'enabled',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/extensions-v2')
  return { data }
}

export async function incrementExtensionDownloads(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: extension } = await supabase
    .from('extensions')
    .select('downloads_count')
    .eq('id', id)
    .single()

  if (!extension) {
    return { error: 'Extension not found' }
  }

  const { data, error } = await supabase
    .from('extensions')
    .update({
      downloads_count: (extension.downloads_count || 0) + 1
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function rateExtension(id: string, rating: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: extension } = await supabase
    .from('extensions')
    .select('rating, total_reviews')
    .eq('id', id)
    .single()

  if (!extension) {
    return { error: 'Extension not found' }
  }

  const newTotalReviews = (extension.total_reviews || 0) + 1
  const currentTotal = (extension.rating || 0) * (extension.total_reviews || 0)
  const newRating = (currentTotal + rating) / newTotalReviews

  const { data, error } = await supabase
    .from('extensions')
    .update({
      rating: Math.round(newRating * 100) / 100,
      total_reviews: newTotalReviews,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/extensions-v2')
  return { data }
}

export async function getExtensions() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('extensions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
