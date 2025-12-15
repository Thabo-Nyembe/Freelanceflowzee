'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function getUserProfile() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createUserProfile(input: UserProfileInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { error: 'Profile already exists', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/profile-v2')
  return { data, error: null }
}

export async function updateUserProfile(input: Partial<UserProfileInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/profile-v2')
  return { data, error: null }
}

export async function upsertUserProfile(input: UserProfileInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/profile-v2')
  return { data, error: null }
}

export async function addSkill(skill: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('skills')
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return { error: fetchError.message, data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/profile-v2')
  return { data, error: null }
}

export async function removeSkill(skill: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('skills')
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return { error: fetchError.message, data: null }
  }

  const skills = (profile?.skills || []).filter((s: string) => s !== skill)

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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/profile-v2')
  return { data, error: null }
}

export async function addExperience(experience: Omit<ExperienceItem, 'id'>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('experience')
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return { error: fetchError.message, data: null }
  }

  const newExperience = {
    ...experience,
    id: crypto.randomUUID()
  }

  const experienceList = [...(profile?.experience || []), newExperience]

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      experience: experienceList,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/profile-v2')
  return { data, error: null }
}

export async function removeExperience(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('experience')
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return { error: fetchError.message, data: null }
  }

  const experienceList = (profile?.experience || []).filter((e: ExperienceItem) => e.id !== id)

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      experience: experienceList,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/profile-v2')
  return { data, error: null }
}

export async function addPortfolioItem(item: Omit<PortfolioItem, 'id'>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('portfolio_items')
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return { error: fetchError.message, data: null }
  }

  const newItem = {
    ...item,
    id: crypto.randomUUID()
  }

  const portfolioItems = [...(profile?.portfolio_items || []), newItem]

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      portfolio_items: portfolioItems,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/profile-v2')
  return { data, error: null }
}

export async function removePortfolioItem(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('portfolio_items')
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return { error: fetchError.message, data: null }
  }

  const portfolioItems = (profile?.portfolio_items || []).filter((p: PortfolioItem) => p.id !== id)

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      portfolio_items: portfolioItems,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/profile-v2')
  return { data, error: null }
}

export async function updateSocialLinks(links: Record<string, string>) {
  return updateUserProfile({ social_links: links })
}

export async function setAvailability(availability: 'available' | 'busy' | 'away' | 'offline') {
  return updateUserProfile({ availability })
}

export async function getProfileStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { error: error.message, data: null }
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

  return { data: stats, error: null }
}
