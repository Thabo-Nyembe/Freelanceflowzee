/**
 * CV PORTFOLIO QUERIES
 *
 * Comprehensive database queries for CV/Portfolio management
 * Covers: Projects, Skills, Experience, Education, Certifications, Settings
 */

import { createClient } from '@/lib/supabase/client'
import { DatabaseError, toDbError } from '@/lib/types/database'

// ==================== TYPES ====================

export interface PortfolioProject {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  image_url?: string
  project_url?: string
  github_url?: string
  technologies: string[]
  start_date: string
  end_date?: string
  is_featured: boolean
  order_index: number
  views: number
  likes: number
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  user_id: string
  name: string
  category: 'technical' | 'soft' | 'language' | 'tool' | 'other'
  proficiency: number // 1-100
  years_experience?: number
  order_index: number
  created_at: string
}

export interface Experience {
  id: string
  user_id: string
  company: string
  position: string
  description: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  achievements: string[]
  technologies: string[]
  order_index: number
  created_at: string
}

export interface Education {
  id: string
  user_id: string
  institution: string
  degree: string
  field_of_study: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  grade?: string
  description?: string
  achievements: string[]
  order_index: number
  created_at: string
}

export interface Certification {
  id: string
  user_id: string
  name: string
  issuing_organization: string
  issue_date: string
  expiry_date?: string
  credential_id?: string
  credential_url?: string
  description?: string
  order_index: number
  created_at: string
}

export interface PortfolioSettings {
  id: string
  user_id: string
  is_public: boolean
  public_url_slug?: string
  theme: 'light' | 'dark' | 'auto'
  show_contact: boolean
  show_analytics: boolean
  custom_domain?: string
  meta_title?: string
  meta_description?: string
  updated_at: string
}

export interface PortfolioAnalytics {
  user_id: string
  total_views: number
  total_project_views: number
  unique_visitors: number
  top_projects: Array<{ project_id: string; views: number }>
  visitor_countries: Array<{ country: string; count: number }>
  updated_at: string
}

export interface PublicPortfolioData {
  settings: {
    user_id: string
    is_public: boolean
    theme: string
    show_contact: boolean
  }
  projects: PortfolioProject[] | null
  skills: Skill[] | null
  experience: Experience[] | null
  education: Education[] | null
  certifications: Certification[] | null
}

export interface CompletePortfolioData {
  projects: PortfolioProject[]
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  certifications: Certification[]
  settings: PortfolioSettings | null
  analytics: PortfolioAnalytics | null
}

// ==================== PROJECTS ====================

export async function getPortfolioProjects(userId: string): Promise<{ data: PortfolioProject[] | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return { data: data as PortfolioProject[], error: null }
  } catch (error: unknown) {
    console.error('Error fetching portfolio projects:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function getFeaturedProjects(userId: string): Promise<{ data: PortfolioProject[] | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('user_id', userId)
      .eq('is_featured', true)
      .order('order_index', { ascending: true })

    if (error) throw error
    return { data: data as PortfolioProject[], error: null }
  } catch (error: unknown) {
    console.error('Error fetching featured projects:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function addProject(userId: string, project: Partial<PortfolioProject>): Promise<{ data: PortfolioProject | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    // Get current max order_index
    const { data: maxData } = await supabase
      .from('portfolio_projects')
      .select('order_index')
      .eq('user_id', userId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (maxData?.order_index ?? -1) + 1

    const { data, error } = await supabase
      .from('portfolio_projects')
      .insert({
        ...project,
        user_id: userId,
        order_index: nextOrderIndex,
        views: 0,
        likes: 0
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as PortfolioProject, error: null }
  } catch (error: unknown) {
    console.error('Error adding project:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function updateProject(projectId: string, updates: Partial<PortfolioProject>): Promise<{ data: PortfolioProject | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error
    return { data: data as PortfolioProject, error: null }
  } catch (error: unknown) {
    console.error('Error updating project:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function deleteProject(projectId: string): Promise<{ data: boolean; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('portfolio_projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error
    return { data: true, error: null }
  } catch (error: unknown) {
    console.error('Error deleting project:', error)
    return { data: false, error: toDbError(error) }
  }
}

export async function reorderProjects(userId: string, projectIds: string[]): Promise<{ data: boolean; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    // Update order_index for each project
    const updates = projectIds.map((id, index) =>
      supabase
        .from('portfolio_projects')
        .update({ order_index: index })
        .eq('id', id)
        .eq('user_id', userId)
    )

    await Promise.all(updates)
    return { data: true, error: null }
  } catch (error: unknown) {
    console.error('Error reordering projects:', error)
    return { data: false, error: toDbError(error) }
  }
}

export async function toggleProjectFeatured(projectId: string, isFeatured: boolean): Promise<{ data: PortfolioProject | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error} = await supabase
      .from('portfolio_projects')
      .update({ is_featured: isFeatured })
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error
    return { data: data as PortfolioProject, error: null }
  } catch (error: unknown) {
    console.error('Error toggling project featured status:', error)
    return { data: null, error: toDbError(error) }
  }
}

// ==================== SKILLS ====================

export async function getSkills(userId: string): Promise<{ data: Skill[] | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_skills')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true })
      .order('order_index', { ascending: true })

    if (error) throw error
    return { data: data as Skill[], error: null }
  } catch (error: unknown) {
    console.error('Error fetching skills:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function addSkill(userId: string, skill: Partial<Skill>): Promise<{ data: Skill | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data: maxData } = await supabase
      .from('portfolio_skills')
      .select('order_index')
      .eq('user_id', userId)
      .eq('category', skill.category || 'other')
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (maxData?.order_index ?? -1) + 1

    const { data, error } = await supabase
      .from('portfolio_skills')
      .insert({
        ...skill,
        user_id: userId,
        order_index: nextOrderIndex
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as Skill, error: null }
  } catch (error: unknown) {
    console.error('Error adding skill:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function updateSkill(skillId: string, updates: Partial<Skill>): Promise<{ data: Skill | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_skills')
      .update(updates)
      .eq('id', skillId)
      .select()
      .single()

    if (error) throw error
    return { data: data as Skill, error: null }
  } catch (error: unknown) {
    console.error('Error updating skill:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function deleteSkill(skillId: string): Promise<{ data: boolean; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('portfolio_skills')
      .delete()
      .eq('id', skillId)

    if (error) throw error
    return { data: true, error: null }
  } catch (error: unknown) {
    console.error('Error deleting skill:', error)
    return { data: false, error: toDbError(error) }
  }
}

// ==================== EXPERIENCE ====================

export async function getExperience(userId: string): Promise<{ data: Experience[] | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_experience')
      .select('*')
      .eq('user_id', userId)
      .order('is_current', { ascending: false })
      .order('start_date', { ascending: false })

    if (error) throw error
    return { data: data as Experience[], error: null }
  } catch (error: unknown) {
    console.error('Error fetching experience:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function addExperience(userId: string, experience: Partial<Experience>): Promise<{ data: Experience | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data: maxData } = await supabase
      .from('portfolio_experience')
      .select('order_index')
      .eq('user_id', userId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (maxData?.order_index ?? -1) + 1

    const { data, error } = await supabase
      .from('portfolio_experience')
      .insert({
        ...experience,
        user_id: userId,
        order_index: nextOrderIndex
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as Experience, error: null }
  } catch (error: unknown) {
    console.error('Error adding experience:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function updateExperience(experienceId: string, updates: Partial<Experience>): Promise<{ data: Experience | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_experience')
      .update(updates)
      .eq('id', experienceId)
      .select()
      .single()

    if (error) throw error
    return { data: data as Experience, error: null }
  } catch (error: unknown) {
    console.error('Error updating experience:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function deleteExperience(experienceId: string): Promise<{ data: boolean; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('portfolio_experience')
      .delete()
      .eq('id', experienceId)

    if (error) throw error
    return { data: true, error: null }
  } catch (error: unknown) {
    console.error('Error deleting experience:', error)
    return { data: false, error: toDbError(error) }
  }
}

// ==================== EDUCATION ====================

export async function getEducation(userId: string): Promise<{ data: Education[] | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_education')
      .select('*')
      .eq('user_id', userId)
      .order('is_current', { ascending: false })
      .order('start_date', { ascending: false })

    if (error) throw error
    return { data: data as Education[], error: null }
  } catch (error: unknown) {
    console.error('Error fetching education:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function addEducation(userId: string, education: Partial<Education>): Promise<{ data: Education | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data: maxData } = await supabase
      .from('portfolio_education')
      .select('order_index')
      .eq('user_id', userId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (maxData?.order_index ?? -1) + 1

    const { data, error } = await supabase
      .from('portfolio_education')
      .insert({
        ...education,
        user_id: userId,
        order_index: nextOrderIndex
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as Education, error: null }
  } catch (error: unknown) {
    console.error('Error adding education:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function updateEducation(educationId: string, updates: Partial<Education>): Promise<{ data: Education | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_education')
      .update(updates)
      .eq('id', educationId)
      .select()
      .single()

    if (error) throw error
    return { data: data as Education, error: null }
  } catch (error: unknown) {
    console.error('Error updating education:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function deleteEducation(educationId: string): Promise<{ data: boolean; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('portfolio_education')
      .delete()
      .eq('id', educationId)

    if (error) throw error
    return { data: true, error: null }
  } catch (error: unknown) {
    console.error('Error deleting education:', error)
    return { data: false, error: toDbError(error) }
  }
}

// ==================== CERTIFICATIONS ====================

export async function getCertifications(userId: string): Promise<{ data: Certification[] | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_certifications')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false })

    if (error) throw error
    return { data: data as Certification[], error: null }
  } catch (error: unknown) {
    console.error('Error fetching certifications:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function addCertification(userId: string, certification: Partial<Certification>): Promise<{ data: Certification | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data: maxData } = await supabase
      .from('portfolio_certifications')
      .select('order_index')
      .eq('user_id', userId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (maxData?.order_index ?? -1) + 1

    const { data, error } = await supabase
      .from('portfolio_certifications')
      .insert({
        ...certification,
        user_id: userId,
        order_index: nextOrderIndex
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as Certification, error: null }
  } catch (error: unknown) {
    console.error('Error adding certification:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function updateCertification(certificationId: string, updates: Partial<Certification>): Promise<{ data: Certification | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_certifications')
      .update(updates)
      .eq('id', certificationId)
      .select()
      .single()

    if (error) throw error
    return { data: data as Certification, error: null }
  } catch (error: unknown) {
    console.error('Error updating certification:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function deleteCertification(certificationId: string): Promise<{ data: boolean; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('portfolio_certifications')
      .delete()
      .eq('id', certificationId)

    if (error) throw error
    return { data: true, error: null }
  } catch (error: unknown) {
    console.error('Error deleting certification:', error)
    return { data: false, error: toDbError(error) }
  }
}

// ==================== SETTINGS ====================

export async function getPortfolioSettings(userId: string): Promise<{ data: PortfolioSettings | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no settings exist, create default
      if (error.code === 'PGRST116') {
        return createDefaultPortfolioSettings(userId)
      }
      throw error
    }

    return { data: data as PortfolioSettings, error: null }
  } catch (error: unknown) {
    console.error('Error fetching portfolio settings:', error)
    return { data: null, error: toDbError(error) }
  }
}

async function createDefaultPortfolioSettings(userId: string): Promise<{ data: PortfolioSettings | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_settings')
      .insert({
        user_id: userId,
        is_public: false,
        theme: 'light',
        show_contact: true,
        show_analytics: false
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as PortfolioSettings, error: null }
  } catch (error: unknown) {
    console.error('Error creating default settings:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function updatePortfolioSettings(userId: string, updates: Partial<PortfolioSettings>): Promise<{ data: PortfolioSettings | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { data: data as PortfolioSettings, error: null }
  } catch (error: unknown) {
    console.error('Error updating portfolio settings:', error)
    return { data: null, error: toDbError(error) }
  }
}

// ==================== ANALYTICS ====================

export async function getPortfolioAnalytics(userId: string): Promise<{ data: PortfolioAnalytics | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_analytics')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return { data: data as PortfolioAnalytics, error: null }
  } catch (error: unknown) {
    console.error('Error fetching portfolio analytics:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function incrementProjectViews(projectId: string): Promise<{ data: boolean; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('increment_project_views', { project_id: projectId })

    if (error) throw error
    return { data: true, error: null }
  } catch (error: unknown) {
    console.error('Error incrementing project views:', error)
    return { data: false, error: toDbError(error) }
  }
}

// ==================== PUBLIC PORTFOLIO ====================

export async function getPublicPortfolio(urlSlug: string): Promise<{ data: PublicPortfolioData | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    // Get user_id from settings
    const { data: settings, error: settingsError } = await supabase
      .from('portfolio_settings')
      .select('user_id, is_public, theme, show_contact')
      .eq('public_url_slug', urlSlug)
      .single()

    if (settingsError) throw settingsError
    if (!settings.is_public) throw new Error('Portfolio is private')

    const userId = settings.user_id

    // Fetch all portfolio data in parallel
    const [
      { data: projects },
      { data: skills },
      { data: experience },
      { data: education },
      { data: certifications }
    ] = await Promise.all([
      getPortfolioProjects(userId),
      getSkills(userId),
      getExperience(userId),
      getEducation(userId),
      getCertifications(userId)
    ])

    return {
      data: {
        settings,
        projects,
        skills,
        experience,
        education,
        certifications
      },
      error: null
    }
  } catch (error: unknown) {
    console.error('Error fetching public portfolio:', error)
    return { data: null, error: toDbError(error) }
  }
}

// ==================== COMPLETE PORTFOLIO DATA ====================

export async function getCompletePortfolioData(userId: string): Promise<{ data: CompletePortfolioData | null; error: DatabaseError | null }> {
  try {
    // Fetch all data in parallel
    const [
      { data: projects },
      { data: skills },
      { data: experience },
      { data: education },
      { data: certifications },
      { data: settings },
      { data: analytics }
    ] = await Promise.all([
      getPortfolioProjects(userId),
      getSkills(userId),
      getExperience(userId),
      getEducation(userId),
      getCertifications(userId),
      getPortfolioSettings(userId),
      getPortfolioAnalytics(userId)
    ])

    return {
      data: {
        projects: projects || [],
        skills: skills || [],
        experience: experience || [],
        education: education || [],
        certifications: certifications || [],
        settings,
        analytics
      },
      error: null
    }
  } catch (error: unknown) {
    console.error('Error fetching complete portfolio data:', error)
    return { data: null, error: toDbError(error) }
  }
}

// ============================================================================
// PORTFOLIO SHARE LINKS
// ============================================================================

export interface PortfolioShareLink {
  id: string
  user_id: string
  share_id: string
  share_url: string
  created_at: string
  expires_at: string
  is_active: boolean
  view_count: number
}

/**
 * Create a portfolio share link
 */
export async function createShareLink(
  userId: string,
  shareId: string,
  shareUrl: string,
  expiresAt: string
): Promise<{ data: PortfolioShareLink | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_share_links')
      .insert({
        user_id: userId,
        share_id: shareId,
        share_url: shareUrl,
        expires_at: expiresAt,
        is_active: true,
        view_count: 0
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Get all share links for a user
 */
export async function getShareLinks(
  userId: string
): Promise<{ data: PortfolioShareLink[]; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_share_links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Deactivate a share link
 */
export async function deactivateShareLink(
  shareId: string
): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('portfolio_share_links')
      .update({ is_active: false })
      .eq('share_id', shareId)

    if (error) throw error
    return { error: null }
  } catch (error: unknown) {
    return { error: toDbError(error) }
  }
}

/**
 * Increment view count for a share link
 */
export async function incrementShareViewCount(
  shareId: string
): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .rpc('increment_share_view_count', { p_share_id: shareId })

    if (error) throw error
    return { error: null }
  } catch (error: unknown) {
    return { error: toDbError(error) }
  }
}

// ==================== FILE UPLOAD ====================

export async function uploadPortfolioImage(
  userId: string,
  file: File,
  type: 'project' | 'avatar' | 'cover' = 'project'
): Promise<{ data: { url: string } | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${type}/${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(fileName)

    return { data: { url: urlData.publicUrl }, error: null }
  } catch (error: unknown) {
    console.error('Error uploading portfolio image:', error)
    return { data: null, error: toDbError(error) }
  }
}

export async function deletePortfolioImage(
  imageUrl: string
): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    // Extract path from URL
    const urlParts = imageUrl.split('/portfolio-images/')
    if (urlParts.length < 2) {
      return { error: { message: 'Invalid image URL' } }
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('portfolio-images')
      .remove([filePath])

    if (error) throw error
    return { error: null }
  } catch (error: unknown) {
    console.error('Error deleting portfolio image:', error)
    return { error: toDbError(error) }
  }
}
