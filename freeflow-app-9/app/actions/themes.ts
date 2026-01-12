'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, type ActionResult, ErrorCode } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('themes-actions')

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

export interface Theme {
  id: string
  user_id: string
  name: string
  description?: string
  designer?: string
  category: string
  pricing: string
  status: string
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
  rating?: number
  reviews_count?: number
  created_at: string
  updated_at: string
}

/**
 * Creates a new theme
 */
export async function createTheme(input: ThemeInput): Promise<ActionResult<Theme>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized theme creation attempt')
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data, error } = await supabase
      .from('themes')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create theme', { error, userId: user.id })
      return actionError('Failed to create theme', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/theme-store-v2')
    logger.info('Theme created successfully', { themeId: data.id, userId: user.id })
    return actionSuccess(data as Theme, 'Theme created successfully')
  } catch (error) {
    logger.error('Unexpected error in createTheme', { error })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Updates an existing theme
 */
export async function updateTheme(id: string, input: Partial<ThemeInput>): Promise<ActionResult<Theme>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid theme ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized theme update attempt', { themeId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data, error } = await supabase
      .from('themes')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update theme', { error, themeId: id, userId: user.id })
      return actionError('Failed to update theme', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/theme-store-v2')
    logger.info('Theme updated successfully', { themeId: id, userId: user.id })
    return actionSuccess(data as Theme, 'Theme updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateTheme', { error, themeId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Deletes a theme
 */
export async function deleteTheme(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid theme ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized theme deletion attempt', { themeId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete theme', { error, themeId: id, userId: user.id })
      return actionError('Failed to delete theme', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/theme-store-v2')
    logger.info('Theme deleted successfully', { themeId: id, userId: user.id })
    return actionSuccess({ success: true }, 'Theme deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteTheme', { error, themeId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Activates a theme (deactivates all others)
 */
export async function activateTheme(id: string): Promise<ActionResult<Theme>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid theme ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized theme activation attempt', { themeId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    // First deactivate all other themes
    const { error: deactivateError } = await supabase
      .from('themes')
      .update({ status: 'installed' })
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (deactivateError) {
      logger.error('Failed to deactivate other themes', { error: deactivateError, userId: user.id })
      return actionError('Failed to deactivate other themes', ErrorCode.DATABASE_ERROR)
    }

    // Then activate this one
    const { data, error } = await supabase
      .from('themes')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to activate theme', { error, themeId: id, userId: user.id })
      return actionError('Failed to activate theme', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/theme-store-v2')
    logger.info('Theme activated successfully', { themeId: id, userId: user.id })
    return actionSuccess(data as Theme, 'Theme activated successfully')
  } catch (error) {
    logger.error('Unexpected error in activateTheme', { error, themeId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Installs a theme
 */
export async function installTheme(id: string): Promise<ActionResult<Theme>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid theme ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized theme installation attempt', { themeId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data, error } = await supabase
      .from('themes')
      .update({ status: 'installed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to install theme', { error, themeId: id, userId: user.id })
      return actionError('Failed to install theme', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/theme-store-v2')
    logger.info('Theme installed successfully', { themeId: id, userId: user.id })
    return actionSuccess(data as Theme, 'Theme installed successfully')
  } catch (error) {
    logger.error('Unexpected error in installTheme', { error, themeId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Uninstalls a theme
 */
export async function uninstallTheme(id: string): Promise<ActionResult<Theme>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid theme ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized theme uninstallation attempt', { themeId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data, error } = await supabase
      .from('themes')
      .update({ status: 'available', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to uninstall theme', { error, themeId: id, userId: user.id })
      return actionError('Failed to uninstall theme', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/theme-store-v2')
    logger.info('Theme uninstalled successfully', { themeId: id, userId: user.id })
    return actionSuccess(data as Theme, 'Theme uninstalled successfully')
  } catch (error) {
    logger.error('Unexpected error in uninstallTheme', { error, themeId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Deactivates a theme
 */
export async function deactivateTheme(id: string): Promise<ActionResult<Theme>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid theme ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized theme deactivation attempt', { themeId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data, error } = await supabase
      .from('themes')
      .update({ status: 'installed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to deactivate theme', { error, themeId: id, userId: user.id })
      return actionError('Failed to deactivate theme', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/theme-store-v2')
    logger.info('Theme deactivated successfully', { themeId: id, userId: user.id })
    return actionSuccess(data as Theme, 'Theme deactivated successfully')
  } catch (error) {
    logger.error('Unexpected error in deactivateTheme', { error, themeId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Rates a theme
 */
export async function rateTheme(id: string, rating: number): Promise<ActionResult<Theme>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid theme ID format', ErrorCode.VALIDATION_ERROR)
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return actionError('Rating must be an integer between 1 and 5', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized theme rating attempt', { themeId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data: theme } = await supabase
      .from('themes')
      .select('rating, reviews_count')
      .eq('id', id)
      .single()

    if (!theme) {
      logger.warn('Theme not found for rating', { themeId: id, userId: user.id })
      return actionError('Theme not found', ErrorCode.NOT_FOUND)
    }

    const newReviewsCount = (theme.reviews_count || 0) + 1
    const currentTotal = (theme.rating || 0) * (theme.reviews_count || 0)
    const newRating = (currentTotal + rating) / newReviewsCount

    const { data, error } = await supabase
      .from('themes')
      .update({
        rating: Math.round(newRating * 100) / 100,
        reviews_count: newReviewsCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rate theme', { error, themeId: id, userId: user.id })
      return actionError('Failed to rate theme', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/theme-store-v2')
    logger.info('Theme rated successfully', { themeId: id, rating, userId: user.id })
    return actionSuccess(data as Theme, 'Theme rated successfully')
  } catch (error) {
    logger.error('Unexpected error in rateTheme', { error, themeId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}
