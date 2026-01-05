'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  company?: string
  position?: string
  avatar?: string
  avatarUrl?: string
  timezone: string
  language: string
  profileVisibility: 'public' | 'private' | 'contacts'
  showEmail: boolean
  showPhone: boolean
  socialLinks?: SocialLinks
  skills?: string[]
  createdAt: string
  updatedAt: string
}

export interface SocialLinks {
  twitter?: string
  linkedin?: string
  github?: string
  instagram?: string
  facebook?: string
  youtube?: string
  dribbble?: string
  behance?: string
}

export interface ProfileStats {
  projectsCompleted: number
  clientsServed: number
  totalRevenue: number
  avgRating: number
  totalReviews: number
  memberSince: string
  lastActive: string
}

export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  company?: string
  position?: string
  timezone?: string
  language?: string
  profileVisibility?: 'public' | 'private' | 'contacts'
  showEmail?: boolean
  showPhone?: boolean
  socialLinks?: SocialLinks
  skills?: string[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockProfile: UserProfile = {
  id: 'profile-1',
  userId: 'user-1',
  firstName: 'Alexandra',
  lastName: 'Chen',
  email: 'alexandra.chen@kazi.app',
  phone: '+1 (555) 789-0123',
  bio: 'Creative Director with 10+ years of experience in visual storytelling and brand development. Passionate about creating meaningful experiences that connect brands with their audiences.',
  location: 'San Francisco, CA',
  website: 'https://alexandrachen.design',
  company: 'KAZI Studios',
  position: 'Chief Creative Officer',
  avatarUrl: '/avatars/alexandra.jpg',
  timezone: 'America/Los_Angeles',
  language: 'en',
  profileVisibility: 'public',
  showEmail: true,
  showPhone: false,
  socialLinks: {
    twitter: 'alexandrachen',
    linkedin: 'alexandrachen',
    dribbble: 'alexandrachen',
    behance: 'alexandrachen'
  },
  skills: ['Brand Strategy', 'UI/UX Design', 'Motion Graphics', 'Creative Direction', 'Team Leadership'],
  createdAt: '2023-01-15T08:00:00Z',
  updatedAt: new Date().toISOString()
}

const mockStats: ProfileStats = {
  projectsCompleted: 156,
  clientsServed: 42,
  totalRevenue: 1250000,
  avgRating: 4.9,
  totalReviews: 87,
  memberSince: '2023-01-15',
  lastActive: new Date().toISOString()
}

// ============================================================================
// HOOK
// ============================================================================

interface UseProfileOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useProfile(options: UseProfileOptions = {}) {
  const {
    
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Transform API response to profile format
  const transformProfile = (data: any): UserProfile => ({
    id: data.id || 'profile-1',
    userId: data.user_id || data.userId || 'user-1',
    firstName: data.first_name || data.firstName || '',
    lastName: data.last_name || data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    bio: data.bio || '',
    location: data.location || '',
    website: data.website || '',
    company: data.company || '',
    position: data.position || '',
    avatar: data.avatar,
    avatarUrl: data.avatar_url || data.avatarUrl,
    timezone: data.timezone || 'UTC',
    language: data.language || 'en',
    profileVisibility: data.profile_visibility || data.profileVisibility || 'public',
    showEmail: data.show_email ?? data.showEmail ?? false,
    showPhone: data.show_phone ?? data.showPhone ?? false,
    socialLinks: data.social_links || data.socialLinks,
    skills: data.skills || [],
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString()
  })

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/profile?category=profile')
      const result = await response.json()

      if (result.success && result.data) {
        const transformed = transformProfile(result.data)
        setProfile(transformed)
        return transformed
      } else {
        // Fallback to mock data
        setProfile(mockProfile)
        return []
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setProfile(mockProfile)
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch profile stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/profile/stats')
      const result = await response.json()

      if (result.success && result.stats) {
        setStats(result.stats)
        return result.stats
      } else {
        setStats(null)
        return []
      }
    } catch (err) {
      console.error('Error fetching profile stats:', err)
      setStats(null)
      return []
    }
  }, [])

  // Update profile
  const updateProfile = useCallback(async (updates: ProfileUpdateData) => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'profile',
          action: 'update',
          data: updates
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setProfile(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null)
        setLastSaved(new Date())
        return { success: true }
      }

      return { success: false, error: result.error || 'Failed to update profile' }
    } catch (err) {
      console.error('Error updating profile:', err)
      return { success: false, error: 'Failed to update profile' }
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File) => {
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setProfile(prev => prev ? {
          ...prev,
          avatarUrl: result.url,
          updatedAt: new Date().toISOString()
        } : null)
        setLastSaved(new Date())
        return { success: true, url: result.url }
      }

      return { success: false, error: result.error || 'Failed to upload avatar' }
    } catch (err) {
      console.error('Error uploading avatar:', err)
      return { success: false, error: 'Failed to upload avatar' }
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Remove avatar
  const removeAvatar = useCallback(async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'profile',
          action: 'update',
          data: { avatar: null, avatarUrl: null }
        })
      })

      const result = await response.json()

      if (result.success) {
        setProfile(prev => prev ? {
          ...prev,
          avatar: undefined,
          avatarUrl: undefined,
          updatedAt: new Date().toISOString()
        } : null)
        return { success: true }
      }

      return { success: false, error: result.error || 'Failed to remove avatar' }
    } catch (err) {
      console.error('Error removing avatar:', err)
      return { success: false, error: 'Failed to remove avatar' }
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Update social links
  const updateSocialLinks = useCallback(async (links: SocialLinks) => {
    return updateProfile({ socialLinks: links })
  }, [updateProfile])

  // Update skills
  const updateSkills = useCallback(async (skills: string[]) => {
    return updateProfile({ skills })
  }, [updateProfile])

  // Update privacy settings
  const updatePrivacy = useCallback(async (privacy: {
    profileVisibility?: 'public' | 'private' | 'contacts'
    showEmail?: boolean
    showPhone?: boolean
  }) => {
    return updateProfile(privacy)
  }, [updateProfile])

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([fetchProfile(), fetchStats()])
  }, [fetchProfile, fetchStats])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchProfile()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchProfile])

  // Computed values
  const fullName = useMemo(() => {
    if (!profile) return ''
    return `${profile.firstName} ${profile.lastName}`.trim()
  }, [profile])

  const initials = useMemo(() => {
    if (!profile) return ''
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
  }, [profile])

  const isComplete = useMemo(() => {
    if (!profile) return false
    return !!(
      profile.firstName &&
      profile.lastName &&
      profile.email &&
      profile.bio &&
      profile.location
    )
  }, [profile])

  const completionPercentage = useMemo(() => {
    if (!profile) return 0
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phone,
      profile.bio,
      profile.location,
      profile.company,
      profile.position,
      profile.avatarUrl,
      profile.website
    ]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }, [profile])

  return {
    // Data
    profile,
    stats,
    fullName,
    initials,

    // State
    isLoading,
    isSaving,
    error,
    lastSaved,
    isComplete,
    completionPercentage,

    // Actions
    refresh,
    fetchProfile,
    fetchStats,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    updateSocialLinks,
    updateSkills,
    updatePrivacy,
  }
}

export default useProfile
