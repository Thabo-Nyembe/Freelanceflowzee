'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export interface UserProfile {
  id: string
  user_id: string
  name: string | null
  title: string | null
  company: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  phone: string | null
  website: string | null
  location: string | null
  hourly_rate: number | null
  currency: string
  availability: 'available' | 'busy' | 'away' | 'offline'
  projects_completed: number
  rating: number
  reviews_count: number
  followers_count: number
  views_count: number
  is_verified: boolean
  verified_at: string | null
  skills: string[]
  experience: ExperienceItem[]
  education: EducationItem[]
  certifications: CertificationItem[]
  portfolio_items: PortfolioItem[]
  social_links: Record<string, string>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

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

export interface ProfileStats {
  profileCompleteness: number
  totalViews: number
  totalFollowers: number
  projectsCompleted: number
  avgRating: number
}

export function useUserProfile(initialProfile: UserProfile | null = null, initialStats?: ProfileStats) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [stats, setStats] = useState<ProfileStats>(initialStats || {
    profileCompleteness: 0,
    totalViews: 0,
    totalFollowers: 0,
    projectsCompleted: 0,
    avgRating: 0
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const calculateCompleteness = useCallback((p: UserProfile | null): number => {
    if (!p) return 0
    const fields = [
      p.name, p.title, p.bio, p.avatar_url, p.email,
      p.location, p.skills?.length > 0, p.experience?.length > 0
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }, [])

  const calculateStats = useCallback((p: UserProfile | null): ProfileStats => {
    return {
      profileCompleteness: calculateCompleteness(p),
      totalViews: p?.views_count || 0,
      totalFollowers: p?.followers_count || 0,
      projectsCompleted: p?.projects_completed || 0,
      avgRating: p?.rating || 0
    }
  }, [calculateCompleteness])

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      setProfile(data)
      setStats(calculateStats(data))
      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch profile',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, calculateStats])

  const createProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          ...profileData,
          user_id: user.id,
          skills: profileData.skills || [],
          experience: profileData.experience || [],
          education: profileData.education || [],
          certifications: profileData.certifications || [],
          portfolio_items: profileData.portfolio_items || [],
          social_links: profileData.social_links || {},
          metadata: profileData.metadata || {}
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setStats(calculateStats(data))

      toast({
        title: 'Success',
        description: 'Profile created successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, calculateStats])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return null

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setStats(calculateStats(data))

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, profile, calculateStats])

  const addSkill = useCallback(async (skill: string) => {
    if (!profile) return null
    const skills = [...(profile.skills || []), skill]
    return updateProfile({ skills })
  }, [profile, updateProfile])

  const removeSkill = useCallback(async (skill: string) => {
    if (!profile) return null
    const skills = (profile.skills || []).filter(s => s !== skill)
    return updateProfile({ skills })
  }, [profile, updateProfile])

  const addExperience = useCallback(async (exp: ExperienceItem) => {
    if (!profile) return null
    const experience = [...(profile.experience || []), { ...exp, id: crypto.randomUUID() }]
    return updateProfile({ experience })
  }, [profile, updateProfile])

  const updateExperience = useCallback(async (id: string, updates: Partial<ExperienceItem>) => {
    if (!profile) return null
    const experience = (profile.experience || []).map(e =>
      e.id === id ? { ...e, ...updates } : e
    )
    return updateProfile({ experience })
  }, [profile, updateProfile])

  const removeExperience = useCallback(async (id: string) => {
    if (!profile) return null
    const experience = (profile.experience || []).filter(e => e.id !== id)
    return updateProfile({ experience })
  }, [profile, updateProfile])

  const addPortfolioItem = useCallback(async (item: Omit<PortfolioItem, 'id'>) => {
    if (!profile) return null
    const portfolio_items = [...(profile.portfolio_items || []), { ...item, id: crypto.randomUUID() }]
    return updateProfile({ portfolio_items })
  }, [profile, updateProfile])

  const removePortfolioItem = useCallback(async (id: string) => {
    if (!profile) return null
    const portfolio_items = (profile.portfolio_items || []).filter(p => p.id !== id)
    return updateProfile({ portfolio_items })
  }, [profile, updateProfile])

  const updateSocialLinks = useCallback(async (links: Record<string, string>) => {
    return updateProfile({ social_links: links })
  }, [updateProfile])

  const setAvailability = useCallback(async (availability: UserProfile['availability']) => {
    return updateProfile({ availability })
  }, [updateProfile])

  // Real-time subscription
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel(`user_profile_${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${profile.id}`
        },
        (payload) => {
          setProfile(payload.new as UserProfile)
          setStats(calculateStats(payload.new as UserProfile))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, profile?.id, calculateStats])

  return {
    profile,
    stats,
    loading,
    fetchProfile,
    createProfile,
    updateProfile,
    addSkill,
    removeSkill,
    addExperience,
    updateExperience,
    removeExperience,
    addPortfolioItem,
    removePortfolioItem,
    updateSocialLinks,
    setAvailability
  }
}
