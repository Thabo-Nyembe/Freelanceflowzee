'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('user-profile-actions')

export interface ExperienceItem {
  id: string
  company: string
  role: string
  description: string
  start_date: string
  end_date: string | null
  is_current: boolean
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  field: string
  start_date: string
  end_date: string | null
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  date: string
  url: string | null
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  image_url: string
  project_url: string | null
  tags: string[]
}

export interface UserProfileInput {
  name?: string
  title?: string
  company?: string
  bio?: string
  avatar_url?: string
  email?: string
  phone?: string
  website?: string
  location?: string
  hourly_rate?: number
  currency?: string
  availability?: 'available' | 'busy' | 'away' | 'offline'
  skills?: string[]
  experience?: ExperienceItem[]
  education?: EducationItem[]
  certifications?: CertificationItem[]
  portfolio_items?: PortfolioItem[]
  social_links?: Record<string, string>
  metadata?: Record<string, any>
}

export async function getUserProfile(): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      logger.error('Failed to get user profile', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('User profile retrieved', { userId: user.id })
    return actionSuccess(data, 'User profile retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error in getUserProfile', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createUserProfile(input: UserProfileInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return actionError('Profile already exists', 'VALIDATION_ERROR')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        ...input,
        user_id: user.id,
        email: input.email || user.email,
        skills: input.skills || [],
        experience: input.experience || [],
        education: input.education || [],
        certifications: input.certifications || [],
        portfolio_items: input.portfolio_items || [],
        social_links: input.social_links || {},
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create user profile', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/profile-v2')
    logger.info('User profile created', { userId: user.id })
    return actionSuccess(data, 'User profile created successfully')
  } catch (error: any) {
    logger.error('Unexpected error in createUserProfile', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateUserProfile(input: Partial<UserProfileInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update user profile', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/profile-v2')
    logger.info('User profile updated', { userId: user.id })
    return actionSuccess(data, 'User profile updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in updateUserProfile', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function upsertUserProfile(input: UserProfileInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        ...input,
        user_id: user.id,
        email: input.email || user.email,
        skills: input.skills || [],
        experience: input.experience || [],
        education: input.education || [],
        certifications: input.certifications || [],
        portfolio_items: input.portfolio_items || [],
        social_links: input.social_links || {},
        metadata: input.metadata || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to upsert user profile', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/profile-v2')
    logger.info('User profile upserted', { userId: user.id })
    return actionSuccess(data, 'User profile saved successfully')
  } catch (error: any) {
    logger.error('Unexpected error in upsertUserProfile', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addSkill(skill: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('skills')
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch profile for adding skill', { error: fetchError, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const skills = [...(profile?.skills || []), skill]

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        skills,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to add skill', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/profile-v2')
    logger.info('Skill added to profile', { userId: user.id, skill })
    return actionSuccess(data, 'Skill added successfully')
  } catch (error: any) {
    logger.error('Unexpected error in addSkill', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function removeSkill(skill: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles').select('skills').eq('user_id', user.id).single()

    if (fetchError) {
      logger.error('Failed to fetch profile for removing skill', { error: fetchError, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const skills = (profile?.skills || []).filter((s: string) => s !== skill)

    const { data, error } = await supabase.from('user_profiles')
      .update({ skills, updated_at: new Date().toISOString() }).eq('user_id', user.id).select().single()

    if (error) {
      logger.error('Failed to remove skill', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/profile-v2')
    logger.info('Skill removed from profile', { userId: user.id, skill })
    return actionSuccess(data, 'Skill removed successfully')
  } catch (error: any) {
    logger.error('Unexpected error in removeSkill', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addExperience(experience: Omit<ExperienceItem, 'id'>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles').select('experience').eq('user_id', user.id).single()

    if (fetchError) {
      logger.error('Failed to fetch profile for adding experience', { error: fetchError, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const newExperience = { ...experience, id: crypto.randomUUID() }
    const experienceList = [...(profile?.experience || []), newExperience]

    const { data, error } = await supabase.from('user_profiles')
      .update({ experience: experienceList, updated_at: new Date().toISOString() }).eq('user_id', user.id).select().single()

    if (error) {
      logger.error('Failed to add experience', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/profile-v2')
    logger.info('Experience added to profile', { userId: user.id })
    return actionSuccess(data, 'Experience added successfully')
  } catch (error: any) {
    logger.error('Unexpected error in addExperience', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function removeExperience(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles').select('experience').eq('user_id', user.id).single()

    if (fetchError) {
      logger.error('Failed to fetch profile for removing experience', { error: fetchError, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const experienceList = (profile?.experience || []).filter((e: ExperienceItem) => e.id !== id)

    const { data, error } = await supabase.from('user_profiles')
      .update({ experience: experienceList, updated_at: new Date().toISOString() }).eq('user_id', user.id).select().single()

    if (error) {
      logger.error('Failed to remove experience', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/profile-v2')
    logger.info('Experience removed from profile', { userId: user.id })
    return actionSuccess(data, 'Experience removed successfully')
  } catch (error: any) {
    logger.error('Unexpected error in removeExperience', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addPortfolioItem(item: Omit<PortfolioItem, 'id'>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles').select('portfolio_items').eq('user_id', user.id).single()

    if (fetchError) {
      logger.error('Failed to fetch profile for adding portfolio item', { error: fetchError, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const newItem = { ...item, id: crypto.randomUUID() }
    const portfolioItems = [...(profile?.portfolio_items || []), newItem]

    const { data, error } = await supabase.from('user_profiles')
      .update({ portfolio_items: portfolioItems, updated_at: new Date().toISOString() }).eq('user_id', user.id).select().single()

    if (error) {
      logger.error('Failed to add portfolio item', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/profile-v2')
    logger.info('Portfolio item added to profile', { userId: user.id })
    return actionSuccess(data, 'Portfolio item added successfully')
  } catch (error: any) {
    logger.error('Unexpected error in addPortfolioItem', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function removePortfolioItem(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles').select('portfolio_items').eq('user_id', user.id).single()

    if (fetchError) {
      logger.error('Failed to fetch profile for removing portfolio item', { error: fetchError, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const portfolioItems = (profile?.portfolio_items || []).filter((p: PortfolioItem) => p.id !== id)

    const { data, error } = await supabase.from('user_profiles')
      .update({ portfolio_items: portfolioItems, updated_at: new Date().toISOString() }).eq('user_id', user.id).select().single()

    if (error) {
      logger.error('Failed to remove portfolio item', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/profile-v2')
    logger.info('Portfolio item removed from profile', { userId: user.id })
    return actionSuccess(data, 'Portfolio item removed successfully')
  } catch (error: any) {
    logger.error('Unexpected error in removePortfolioItem', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSocialLinks(links: Record<string, string>): Promise<ActionResult<any>> {
  return updateUserProfile({ social_links: links })
}

export async function setAvailability(availability: 'available' | 'busy' | 'away' | 'offline'): Promise<ActionResult<any>> {
  return updateUserProfile({ availability })
}

export async function getProfileStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: profile, error } = await supabase
      .from('user_profiles').select('*').eq('user_id', user.id).single()

    if (error && error.code !== 'PGRST116') {
      logger.error('Failed to get profile stats', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const fields = [
      profile?.name, profile?.title, profile?.bio, profile?.avatar_url,
      profile?.email, profile?.location, profile?.skills?.length > 0,
      profile?.experience?.length > 0
    ]
    const completed = fields.filter(Boolean).length
    const profileCompleteness = Math.round((completed / fields.length) * 100)

    const stats = {
      profileCompleteness,
      totalViews: profile?.views_count || 0,
      totalFollowers: profile?.followers_count || 0,
      projectsCompleted: profile?.projects_completed || 0,
      avgRating: profile?.rating || 0
    }

    logger.info('Profile stats retrieved', { userId: user.id })
    return actionSuccess(stats, 'Profile stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error in getProfileStats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
