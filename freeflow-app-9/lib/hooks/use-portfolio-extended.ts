'use client'

/**
 * Extended Portfolio Hooks - Covers all 18 Portfolio-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePortfolio(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioAnalytics(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_analytics').select('*').eq('portfolio_id', portfolioId).order('date', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioCertifications(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_certifications').select('*').eq('portfolio_id', portfolioId).order('issue_date', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioContacts(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_contacts').select('*').eq('portfolio_id', portfolioId); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioEducation(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_education').select('*').eq('portfolio_id', portfolioId).order('start_date', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioExperience(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_experience').select('*').eq('portfolio_id', portfolioId).order('start_date', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioPages(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_pages').select('*').eq('portfolio_id', portfolioId).order('order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioProjectImages(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_project_images').select('*').eq('project_id', projectId).order('order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioProjects(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_projects').select('*').eq('portfolio_id', portfolioId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioSections(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_sections').select('*').eq('portfolio_id', portfolioId).order('order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioShares(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_shares').select('*').eq('portfolio_id', portfolioId); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioSkills(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_skills').select('*').eq('portfolio_id', portfolioId); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioSocialLinks(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_social_links').select('*').eq('portfolio_id', portfolioId); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioTestimonials(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_testimonials').select('*').eq('portfolio_id', portfolioId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioThemes() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_themes').select('*').order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioVideoAnalytics(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_video_analytics').select('*').eq('portfolio_id', portfolioId); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioVideos(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_videos').select('*').eq('portfolio_id', portfolioId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolioViewEvents(portfolioId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolio_view_events').select('*').eq('portfolio_id', portfolioId).order('viewed_at', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [portfolioId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortfolios(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portfolios').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
