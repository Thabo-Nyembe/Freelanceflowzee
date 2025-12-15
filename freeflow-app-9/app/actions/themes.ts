'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface ThemeInput {
  name: string
  description?: string
  designer?: string
  category?: 'minimal' | 'professional' | 'creative' | 'dark' | 'light' | 'colorful' | 'modern' | 'classic'
  pricing?: 'free' | 'premium' | 'bundle' | 'enterprise'
  status?: 'active' | 'available' | 'installed' | 'preview' | 'deprecated'
  price?: string
  version?: string
  file_size?: string
  colors_count?: number
  layouts_count?: number
  components_count?: number
  dark_mode?: boolean
  responsive?: boolean
  customizable?: boolean
  preview_url?: string
  tags?: string[]
}

export async function createTheme(input: ThemeInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('themes')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/theme-store-v2')
  return { data }
}

export async function updateTheme(id: string, input: Partial<ThemeInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('themes')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/theme-store-v2')
  return { data }
}

export async function deleteTheme(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/theme-store-v2')
  return { success: true }
}

export async function activateTheme(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // First deactivate all other themes
  await supabase
    .from('themes')
    .update({ status: 'installed' })
    .eq('user_id', user.id)
    .eq('status', 'active')

  // Then activate this one
  return updateTheme(id, { status: 'active' })
}

export async function installTheme(id: string) {
  return updateTheme(id, { status: 'installed' })
}

export async function uninstallTheme(id: string) {
  return updateTheme(id, { status: 'available' })
}

export async function deactivateTheme(id: string) {
  return updateTheme(id, { status: 'installed' })
}

export async function rateTheme(id: string, rating: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: theme } = await supabase
    .from('themes')
    .select('rating, reviews_count')
    .eq('id', id)
    .single()

  if (!theme) {
    return { error: 'Theme not found' }
  }

  const newReviewsCount = (theme.reviews_count || 0) + 1
  const currentTotal = (theme.rating || 0) * (theme.reviews_count || 0)
  const newRating = (currentTotal + rating) / newReviewsCount

  const { data, error } = await supabase
    .from('themes')
    .update({
      rating: Math.round(newRating * 100) / 100,
      reviews_count: newReviewsCount
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/theme-store-v2')
  return { data }
}
