'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type SEOScore = 'poor' | 'fair' | 'good' | 'excellent'
export type IssueType = 'error' | 'warning' | 'info' | 'success'
export type IssuePriority = 'critical' | 'high' | 'medium' | 'low'

export interface SEOAnalysis {
  id: string
  url: string
  title: string
  score: number
  scoreLabel: SEOScore
  issues: SEOIssue[]
  metrics: SEOMetrics
  keywords: KeywordAnalysis[]
  competitors?: CompetitorAnalysis[]
  lastAnalyzedAt: string
  createdAt: string
}

export interface SEOIssue {
  id: string
  type: IssueType
  priority: IssuePriority
  category: string
  title: string
  description: string
  recommendation: string
  affectedElement?: string
  isFixed: boolean
}

export interface SEOMetrics {
  pageSpeed: number
  mobileScore: number
  accessibility: number
  bestPractices: number
  contentLength: number
  headingsCount: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  internalLinks: number
  externalLinks: number
  brokenLinks: number
  metaTitle: string
  metaTitleLength: number
  metaDescription: string
  metaDescriptionLength: number
  hasCanonical: boolean
  hasRobots: boolean
  hasSitemap: boolean
  hasSSL: boolean
  structuredData: string[]
}

export interface KeywordAnalysis {
  keyword: string
  volume: number
  difficulty: number
  position?: number
  positionChange?: number
  url?: string
  impressions: number
  clicks: number
  ctr: number
}

export interface CompetitorAnalysis {
  domain: string
  score: number
  keywords: number
  backlinks: number
  traffic: number
}

export interface BacklinkData {
  id: string
  sourceUrl: string
  sourceDomain: string
  targetUrl: string
  anchorText: string
  doFollow: boolean
  authority: number
  firstSeenAt: string
  lastSeenAt: string
}

export interface RankingHistory {
  keyword: string
  data: { date: string; position: number }[]
}

export interface SEOStats {
  averageScore: number
  pagesAnalyzed: number
  issuesFound: number
  issuesFixed: number
  keywordsTracked: number
  avgPosition: number
  totalImpressions: number
  totalClicks: number
  avgCTR: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAnalyses: SEOAnalysis[] = [
  { id: 'seo-1', url: 'https://example.com/', title: 'Homepage', score: 85, scoreLabel: 'good', issues: [
    { id: 'i1', type: 'warning', priority: 'medium', category: 'Meta', title: 'Meta description too short', description: 'Your meta description is only 80 characters', recommendation: 'Increase to 150-160 characters for better CTR', isFixed: false },
    { id: 'i2', type: 'info', priority: 'low', category: 'Images', title: '2 images missing alt text', description: 'Some images lack alt attributes', recommendation: 'Add descriptive alt text to all images', affectedElement: 'img.hero-image', isFixed: false },
    { id: 'i3', type: 'success', priority: 'low', category: 'SSL', title: 'SSL certificate valid', description: 'Your site has a valid SSL certificate', recommendation: '', isFixed: true }
  ], metrics: { pageSpeed: 78, mobileScore: 85, accessibility: 92, bestPractices: 88, contentLength: 1250, headingsCount: 8, imagesWithAlt: 12, imagesWithoutAlt: 2, internalLinks: 25, externalLinks: 5, brokenLinks: 0, metaTitle: 'Example Company - Best Solutions', metaTitleLength: 32, metaDescription: 'We provide the best solutions for your business needs.', metaDescriptionLength: 55, hasCanonical: true, hasRobots: true, hasSitemap: true, hasSSL: true, structuredData: ['Organization', 'WebSite'] }, keywords: [
    { keyword: 'best solutions', volume: 2400, difficulty: 45, position: 8, positionChange: 2, impressions: 5200, clicks: 320, ctr: 6.2 },
    { keyword: 'business software', volume: 8100, difficulty: 68, position: 15, positionChange: -1, impressions: 12000, clicks: 480, ctr: 4.0 }
  ], lastAnalyzedAt: '2024-03-20T10:00:00Z', createdAt: '2024-01-15' },
  { id: 'seo-2', url: 'https://example.com/products', title: 'Products Page', score: 72, scoreLabel: 'fair', issues: [
    { id: 'i4', type: 'error', priority: 'critical', category: 'Performance', title: 'Page load time too slow', description: 'Page takes 4.5 seconds to load', recommendation: 'Optimize images and enable caching', isFixed: false }
  ], metrics: { pageSpeed: 45, mobileScore: 68, accessibility: 85, bestPractices: 75, contentLength: 800, headingsCount: 5, imagesWithAlt: 8, imagesWithoutAlt: 5, internalLinks: 15, externalLinks: 2, brokenLinks: 1, metaTitle: 'Our Products', metaTitleLength: 12, metaDescription: '', metaDescriptionLength: 0, hasCanonical: true, hasRobots: true, hasSitemap: true, hasSSL: true, structuredData: ['Product'] }, keywords: [
    { keyword: 'product solutions', volume: 1200, difficulty: 38, position: 22, impressions: 2800, clicks: 85, ctr: 3.0 }
  ], lastAnalyzedAt: '2024-03-19T14:00:00Z', createdAt: '2024-02-01' }
]

const mockBacklinks: BacklinkData[] = [
  { id: 'bl-1', sourceUrl: 'https://techblog.com/best-tools-2024', sourceDomain: 'techblog.com', targetUrl: 'https://example.com/', anchorText: 'best business solutions', doFollow: true, authority: 65, firstSeenAt: '2024-02-15', lastSeenAt: '2024-03-20' },
  { id: 'bl-2', sourceUrl: 'https://review-site.com/reviews/example', sourceDomain: 'review-site.com', targetUrl: 'https://example.com/products', anchorText: 'Example Products', doFollow: true, authority: 58, firstSeenAt: '2024-03-01', lastSeenAt: '2024-03-20' }
]

const mockStats: SEOStats = {
  averageScore: 78,
  pagesAnalyzed: 25,
  issuesFound: 42,
  issuesFixed: 28,
  keywordsTracked: 50,
  avgPosition: 15.5,
  totalImpressions: 125000,
  totalClicks: 4800,
  avgCTR: 3.84
}

// ============================================================================
// HOOK
// ============================================================================

interface UseSEOOptions {
  
}

export function useSEO(options: UseSEOOptions = {}) {
  const {  } = options

  const [analyses, setAnalyses] = useState<SEOAnalysis[]>([])
  const [backlinks, setBacklinks] = useState<BacklinkData[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<SEOAnalysis | null>(null)
  const [stats, setStats] = useState<SEOStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSEOData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/seo')
      const result = await response.json()
      if (result.success) {
        setAnalyses(Array.isArray(result.analyses) ? result.analyses : [])
        setBacklinks(Array.isArray(result.backlinks) ? result.backlinks : [])
        setStats(result.stats || null)
        return result.analyses
      }
      setAnalyses([])
      return []
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch SEO data'))
      setAnalyses([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const analyzeUrl = useCallback(async (url: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/seo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const result = await response.json()
      if (result.success && result.analysis) {
        setAnalyses(prev => [result.analysis, ...prev])
        return result.analysis
      }
      return null
    } catch (err) {
      console.error('Error analyzing URL:', err)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const reanalyzeUrl = useCallback(async (analysisId: string) => {
    const analysis = analyses.find(a => a.id === analysisId)
    if (analysis) {
      return analyzeUrl(analysis.url)
    }
    return null
  }, [analyses, analyzeUrl])

  const deleteAnalysis = useCallback(async (analysisId: string) => {
    setAnalyses(prev => prev.filter(a => a.id !== analysisId))
    return { success: true }
  }, [])

  const markIssueFixed = useCallback(async (analysisId: string, issueId: string) => {
    setAnalyses(prev => prev.map(a => a.id === analysisId ? {
      ...a,
      issues: a.issues.map(i => i.id === issueId ? { ...i, isFixed: true } : i)
    } : a))
    return { success: true }
  }, [])

  const addKeyword = useCallback(async (keyword: string) => {
    const newKeyword: KeywordAnalysis = {
      keyword,
      volume: 0,
      difficulty: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0
    }
    // Would typically add to a keywords list
    return { success: true, keyword: newKeyword }
  }, [])

  const removeKeyword = useCallback(async (keyword: string) => {
    // Would remove from keywords list
    return { success: true }
  }, [])

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 90) return '#22c55e'
    if (score >= 70) return '#f59e0b'
    if (score >= 50) return '#f97316'
    return '#ef4444'
  }, [])

  const getScoreLabel = useCallback((score: number): SEOScore => {
    if (score >= 90) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
  }, [])

  const getIssueIcon = useCallback((type: IssueType): string => {
    switch (type) {
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      case 'success': return '✅'
    }
  }, [])

  const generateReport = useCallback(async (analysisId: string, format: 'pdf' | 'html' = 'pdf') => {
    const analysis = analyses.find(a => a.id === analysisId)
    if (!analysis) return { success: false, error: 'Analysis not found' }

    // Mock report generation
    return { success: true, reportUrl: `/reports/seo-${analysisId}.${format}` }
  }, [analyses])

  const fetchBacklinks = useCallback(async (domain?: string) => {
    try {
      const params = domain ? `?domain=${domain}` : ''
      const response = await fetch(`/api/seo/backlinks${params}`)
      const result = await response.json()
      if (result.success) {
        setBacklinks(result.backlinks || [])
        return result.backlinks
      }
      return []
    } catch (err) {
      return []
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchSEOData()
  }, [fetchSEOData])

  useEffect(() => { refresh() }, [refresh])

  const issuesByPriority = useMemo(() => {
    const allIssues = analyses.flatMap(a => a.issues)
    return {
      critical: allIssues.filter(i => i.priority === 'critical' && !i.isFixed),
      high: allIssues.filter(i => i.priority === 'high' && !i.isFixed),
      medium: allIssues.filter(i => i.priority === 'medium' && !i.isFixed),
      low: allIssues.filter(i => i.priority === 'low' && !i.isFixed)
    }
  }, [analyses])

  const topKeywords = useMemo(() => {
    const allKeywords = analyses.flatMap(a => a.keywords)
    return [...allKeywords].sort((a, b) => (a.position || 100) - (b.position || 100)).slice(0, 10)
  }, [analyses])

  const doFollowBacklinks = useMemo(() => backlinks.filter(b => b.doFollow), [backlinks])
  const noFollowBacklinks = useMemo(() => backlinks.filter(b => !b.doFollow), [backlinks])
  const backlinksbyDomain = useMemo(() => {
    const grouped: Record<string, BacklinkData[]> = {}
    backlinks.forEach(b => {
      if (!grouped[b.sourceDomain]) grouped[b.sourceDomain] = []
      grouped[b.sourceDomain].push(b)
    })
    return grouped
  }, [backlinks])

  return {
    analyses, backlinks, currentAnalysis, stats, issuesByPriority, topKeywords,
    doFollowBacklinks, noFollowBacklinks, backlinksbyDomain,
    isLoading, isAnalyzing, error,
    refresh, analyzeUrl, reanalyzeUrl, deleteAnalysis, markIssueFixed,
    addKeyword, removeKeyword, getScoreColor, getScoreLabel, getIssueIcon,
    generateReport, fetchBacklinks,
    setCurrentAnalysis
  }
}

export default useSEO
