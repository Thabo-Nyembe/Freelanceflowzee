'use client'

/**
 * Extended Profiles Hooks
 * Tables: profiles, profile_settings, profile_links, profile_skills, profile_experience, profile_education, profile_certifications, profile_views
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProfile(profileId?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profiles').select('*, profile_settings(*), profile_links(*), profile_skills(*), profile_experience(*), profile_education(*), profile_certifications(*)').eq('id', profileId).single(); setProfile(data) } finally { setIsLoading(false) }
  }, [profileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { profile, isLoading, refresh: fetch }
}

export function useProfileByUsername(username?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!username) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profiles').select('*, profile_settings(*), profile_links(*), profile_skills(*), profile_experience(*), profile_education(*), profile_certifications(*)').eq('username', username).single(); setProfile(data) } finally { setIsLoading(false) }
  }, [username, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { profile, isLoading, refresh: fetch }
}

export function useProfileByUserId(userId?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profiles').select('*, profile_settings(*), profile_links(*), profile_skills(*)').eq('user_id', userId).single(); setProfile(data) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { profile, isLoading, refresh: fetch }
}

export function useProfiles(options?: { is_public?: boolean; is_verified?: boolean; search?: string; limit?: number }) {
  const [profiles, setProfiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('profiles').select('*, profile_skills(*)')
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.is_verified !== undefined) query = query.eq('is_verified', options.is_verified)
      if (options?.search) query = query.or(`username.ilike.%${options.search}%,display_name.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setProfiles(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_public, options?.is_verified, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { profiles, isLoading, refresh: fetch }
}

export function useProfileSettings(profileId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profile_settings').select('*').eq('profile_id', profileId).single(); setSettings(data || { show_email: false, show_location: true, allow_messages: true }) } finally { setIsLoading(false) }
  }, [profileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useProfileLinks(profileId?: string) {
  const [links, setLinks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profile_links').select('*').eq('profile_id', profileId).order('order', { ascending: true }); setLinks(data || []) } finally { setIsLoading(false) }
  }, [profileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { links, isLoading, refresh: fetch }
}

export function useProfileSkills(profileId?: string) {
  const [skills, setSkills] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profile_skills').select('*').eq('profile_id', profileId).order('endorsement_count', { ascending: false }); setSkills(data || []) } finally { setIsLoading(false) }
  }, [profileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { skills, isLoading, refresh: fetch }
}

export function useProfileExperience(profileId?: string) {
  const [experience, setExperience] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profile_experience').select('*').eq('profile_id', profileId).order('start_date', { ascending: false }); setExperience(data || []) } finally { setIsLoading(false) }
  }, [profileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { experience, isLoading, refresh: fetch }
}

export function useProfileEducation(profileId?: string) {
  const [education, setEducation] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profile_education').select('*').eq('profile_id', profileId).order('start_year', { ascending: false }); setEducation(data || []) } finally { setIsLoading(false) }
  }, [profileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { education, isLoading, refresh: fetch }
}

export function useProfileCertifications(profileId?: string) {
  const [certifications, setCertifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profile_certifications').select('*').eq('profile_id', profileId).order('issue_date', { ascending: false }); setCertifications(data || []) } finally { setIsLoading(false) }
  }, [profileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { certifications, isLoading, refresh: fetch }
}

export function useProfileViews(profileId?: string, options?: { from_date?: string; to_date?: string }) {
  const [views, setViews] = useState<any[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('profile_views').select('*').eq('profile_id', profileId)
      if (options?.from_date) query = query.gte('viewed_at', options.from_date)
      if (options?.to_date) query = query.lte('viewed_at', options.to_date)
      const { data } = await query.order('viewed_at', { ascending: false })
      setViews(data || [])
      setTotalViews(data?.length || 0)
    } finally { setIsLoading(false) }
  }, [profileId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { views, totalViews, isLoading, refresh: fetch }
}

export function useUsernameAvailability(username?: string) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!username || username.length < 3) { setIsAvailable(null); return }
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('profiles').select('id').eq('username', username).single()
      if (error && error.code === 'PGRST116') { setIsAvailable(true) } else { setIsAvailable(false) }
    } finally { setIsLoading(false) }
  }, [username, supabase])
  useEffect(() => { const timer = setTimeout(check, 500); return () => clearTimeout(timer) }, [check])
  return { isAvailable, isLoading }
}

export function useVerifiedProfiles(options?: { limit?: number }) {
  const [profiles, setProfiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('profiles').select('*, profile_skills(*)').eq('is_public', true).eq('is_verified', true).order('view_count', { ascending: false }).limit(options?.limit || 20); setProfiles(data || []) } finally { setIsLoading(false) }
  }, [options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { profiles, isLoading, refresh: fetch }
}

export function useProfileSearch(searchTerm?: string, options?: { limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('profiles').select('*, profile_skills(*)').eq('is_public', true).or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%,headline.ilike.%${searchTerm}%`).limit(options?.limit || 20); setResults(data || []) } finally { setIsLoading(false) }
  }, [searchTerm, options?.limit, supabase])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}
