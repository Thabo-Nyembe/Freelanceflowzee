'use client'

/**
 * Extended Skills Hooks
 * Tables: skills, skill_categories, skill_levels, skill_assessments, skill_endorsements, skill_requirements
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSkill(skillId?: string) {
  const [skill, setSkill] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!skillId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('skills').select('*, skill_categories(*), skill_levels(*)').eq('id', skillId).single(); setSkill(data) } finally { setIsLoading(false) }
  }, [skillId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { skill, isLoading, refresh: fetch }
}

export function useSkills(options?: { category_id?: string; type?: string; is_technical?: boolean; is_active?: boolean; search?: string; limit?: number }) {
  const [skills, setSkills] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('skills').select('*, skill_categories(*), skill_levels(count)')
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_technical !== undefined) query = query.eq('is_technical', options.is_technical)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setSkills(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.type, options?.is_technical, options?.is_active, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { skills, isLoading, refresh: fetch }
}

export function useUserSkills(userId?: string, options?: { category_id?: string; min_level?: number }) {
  const [skills, setSkills] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('user_skills').select('*, skills(*, skill_categories(*))').eq('user_id', userId)
      if (options?.min_level) query = query.gte('level', options.min_level)
      const { data } = await query.order('level', { ascending: false })
      let skills = data || []
      if (options?.category_id) {
        skills = skills.filter(s => s.skills?.category_id === options.category_id)
      }
      setSkills(skills)
    } finally { setIsLoading(false) }
  }, [userId, options?.category_id, options?.min_level, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { skills, isLoading, refresh: fetch }
}

export function useSkillCategories(options?: { parent_id?: string | null; is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('skill_categories').select('*, skills(count)')
      if (options?.parent_id !== undefined) {
        if (options.parent_id === null) query = query.is('parent_id', null)
        else query = query.eq('parent_id', options.parent_id)
      }
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.parent_id, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useSkillLevels() {
  const [levels, setLevels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('skill_levels').select('*').order('level', { ascending: true }); setLevels(data || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { levels, isLoading, refresh: fetch }
}

export function useSkillAssessments(userId?: string, skillId?: string, options?: { limit?: number }) {
  const [assessments, setAssessments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('skill_assessments').select('*, skills(*), users(*)').eq('user_id', userId)
      if (skillId) query = query.eq('skill_id', skillId)
      const { data } = await query.order('assessed_at', { ascending: false }).limit(options?.limit || 20)
      setAssessments(data || [])
    } finally { setIsLoading(false) }
  }, [userId, skillId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { assessments, isLoading, refresh: fetch }
}

export function useSkillEndorsements(userId?: string, skillId?: string) {
  const [endorsements, setEndorsements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('skill_endorsements').select('*, skills(*), endorser:endorser_id(*)').eq('user_id', userId)
      if (skillId) query = query.eq('skill_id', skillId)
      const { data } = await query.order('endorsed_at', { ascending: false })
      setEndorsements(data || [])
    } finally { setIsLoading(false) }
  }, [userId, skillId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { endorsements, isLoading, refresh: fetch }
}

export function useSkillRequirements(entityType?: string, entityId?: string) {
  const [requirements, setRequirements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('skill_requirements').select('*, skills(*)').eq('entity_type', entityType).eq('entity_id', entityId); setRequirements(data || []) } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { requirements, isLoading, refresh: fetch }
}

export function useSkillMatch(userId?: string, entityType?: string, entityId?: string) {
  const [match, setMatch] = useState<{ requirements: any[]; userSkills: any[]; matchPercentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId || !entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [requirements, userSkills] = await Promise.all([
        supabase.from('skill_requirements').select('*, skills(*)').eq('entity_type', entityType).eq('entity_id', entityId),
        supabase.from('user_skills').select('skill_id, level').eq('user_id', userId)
      ])
      const reqs = requirements.data || []
      const skills = userSkills.data || []
      const skillMap = new Map(skills.map(s => [s.skill_id, s.level]))
      let matched = 0
      reqs.forEach(r => {
        const userLevel = skillMap.get(r.skill_id) || 0
        if (userLevel >= (r.min_level || 1)) matched++
      })
      const matchPercentage = reqs.length > 0 ? Math.round((matched / reqs.length) * 100) : 100
      setMatch({ requirements: reqs, userSkills: skills, matchPercentage })
    } finally { setIsLoading(false) }
  }, [userId, entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { match, isLoading, refresh: fetch }
}

export function useSkillStats() {
  const [stats, setStats] = useState<{ total: number; categories: number; usersWithSkills: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const [total, categories, userSkills] = await Promise.all([
        supabase.from('skills').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('skill_categories').select('*', { count: 'exact', head: true }),
        supabase.from('user_skills').select('user_id')
      ])
      const uniqueUsers = new Set((userSkills.data || []).map(u => u.user_id)).size
      setStats({ total: total.count || 0, categories: categories.count || 0, usersWithSkills: uniqueUsers })
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useTopSkills(options?: { limit?: number }) {
  const [skills, setSkills] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('user_skills').select('skill_id, skills(*)').eq('skills.is_active', true)
      const skillCounts: { [key: string]: { skill: any; count: number } } = {}
      ;(data || []).forEach(s => {
        if (s.skills) {
          if (!skillCounts[s.skill_id]) skillCounts[s.skill_id] = { skill: s.skills, count: 0 }
          skillCounts[s.skill_id].count++
        }
      })
      const sorted = Object.values(skillCounts).sort((a, b) => b.count - a.count).slice(0, options?.limit || 10)
      setSkills(sorted)
    } finally { setIsLoading(false) }
  }, [options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { skills, isLoading, refresh: fetch }
}

