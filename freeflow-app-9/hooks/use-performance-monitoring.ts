'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface PerformanceScore {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa: number
}

export interface CoreWebVital {
  name: string
  value: number
  unit: string
  rating: 'good' | 'needs-improvement' | 'poor'
  target: { good: number; needsImprovement: number }
}

export interface Audit {
  id: string
  title: string
  description: string
  category: string
  severity: 'pass' | 'warning' | 'fail' | 'info'
  score: number
  displayValue?: string
  savings?: { time?: number; bytes?: number }
}

export interface PageTest {
  id: string
  url: string
  device: 'mobile' | 'desktop'
  scores: PerformanceScore
  vitals: CoreWebVital[]
  audits: Audit[]
  timestamp: string
  duration: number
}

export interface PerformanceBudget {
  id: string
  name: string
  metric: string
  target: number
  current: number
  unit: string
  status: 'pass' | 'warning' | 'fail'
}

export interface HistoricalData {
  date: string
  performance: number
  accessibility: number
  lcp: number
  fid: number
  cls: number
}

export interface PerformanceSummary {
  averagePerformance: number
  averageAccessibility: number
  coreWebVitalsPass: boolean
  testsRun: number
  issuesFound: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface PerformanceAlert {
  id: string
  metric: string
  threshold: number
  condition: string
  notifyEmail?: string
  isActive: boolean
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPageTests: PageTest[] = [
  {
    id: 'test-1',
    url: 'https://app.kazi.io',
    device: 'mobile',
    scores: { performance: 78, accessibility: 92, bestPractices: 88, seo: 95, pwa: 60 },
    vitals: [
      { name: 'Largest Contentful Paint', value: 2.4, unit: 's', rating: 'needs-improvement', target: { good: 2.5, needsImprovement: 4 } },
      { name: 'First Input Delay', value: 85, unit: 'ms', rating: 'good', target: { good: 100, needsImprovement: 300 } },
      { name: 'Cumulative Layout Shift', value: 0.08, unit: '', rating: 'good', target: { good: 0.1, needsImprovement: 0.25 } },
      { name: 'Time to First Byte', value: 0.6, unit: 's', rating: 'good', target: { good: 0.8, needsImprovement: 1.8 } },
      { name: 'Interaction to Next Paint', value: 180, unit: 'ms', rating: 'good', target: { good: 200, needsImprovement: 500 } }
    ],
    audits: [],
    timestamp: new Date().toISOString(),
    duration: 25.4
  },
  {
    id: 'test-2',
    url: 'https://app.kazi.io',
    device: 'desktop',
    scores: { performance: 92, accessibility: 94, bestPractices: 92, seo: 98, pwa: 70 },
    vitals: [
      { name: 'Largest Contentful Paint', value: 1.2, unit: 's', rating: 'good', target: { good: 2.5, needsImprovement: 4 } },
      { name: 'First Input Delay', value: 12, unit: 'ms', rating: 'good', target: { good: 100, needsImprovement: 300 } },
      { name: 'Cumulative Layout Shift', value: 0.02, unit: '', rating: 'good', target: { good: 0.1, needsImprovement: 0.25 } },
      { name: 'Time to First Byte', value: 0.3, unit: 's', rating: 'good', target: { good: 0.8, needsImprovement: 1.8 } },
      { name: 'Interaction to Next Paint', value: 95, unit: 'ms', rating: 'good', target: { good: 200, needsImprovement: 500 } }
    ],
    audits: [],
    timestamp: new Date().toISOString(),
    duration: 18.2
  }
]

const mockAudits: Audit[] = [
  {
    id: 'audit-1',
    title: 'Serve images in next-gen formats',
    description: 'Image formats like WebP and AVIF often provide better compression than PNG or JPEG.',
    category: 'performance',
    severity: 'warning',
    score: 0.4,
    displayValue: 'Potential savings of 245 KiB',
    savings: { bytes: 250880 }
  },
  {
    id: 'audit-2',
    title: 'Eliminate render-blocking resources',
    description: 'Resources are blocking the first paint of your page.',
    category: 'performance',
    severity: 'fail',
    score: 0,
    displayValue: 'Potential savings of 1,250 ms',
    savings: { time: 1250 }
  },
  {
    id: 'audit-3',
    title: 'Enable text compression',
    description: 'Text-based resources should be served with compression (gzip, deflate or brotli).',
    category: 'performance',
    severity: 'pass',
    score: 1
  }
]

const mockBudgets: PerformanceBudget[] = [
  { id: 'budget-1', name: 'Page Size', metric: 'total-byte-weight', target: 1500, current: 1245, unit: 'KB', status: 'pass' },
  { id: 'budget-2', name: 'JavaScript', metric: 'script', target: 500, current: 620, unit: 'KB', status: 'warning' },
  { id: 'budget-3', name: 'LCP', metric: 'largest-contentful-paint', target: 2500, current: 2400, unit: 'ms', status: 'pass' }
]

const mockHistorical: HistoricalData[] = [
  { date: '2025-12-18', performance: 72, accessibility: 88, lcp: 2.8, fid: 95, cls: 0.12 },
  { date: '2025-12-19', performance: 74, accessibility: 89, lcp: 2.6, fid: 90, cls: 0.11 },
  { date: '2025-12-20', performance: 76, accessibility: 91, lcp: 2.5, fid: 85, cls: 0.09 },
  { date: '2025-12-21', performance: 78, accessibility: 92, lcp: 2.4, fid: 85, cls: 0.08 }
]

const mockSummary: PerformanceSummary = {
  averagePerformance: 78,
  averageAccessibility: 92,
  coreWebVitalsPass: true,
  testsRun: 24,
  issuesFound: 8,
  trend: 'improving'
}

// ============================================================================
// HOOK
// ============================================================================

interface UsePerformanceMonitoringOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
}

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const {
    
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  // State
  const [tests, setTests] = useState<PageTest[]>([])
  const [audits, setAudits] = useState<Audit[]>([])
  const [budgets, setBudgets] = useState<PerformanceBudget[]>([])
  const [historical, setHistorical] = useState<HistoricalData[]>([])
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/performance')
      const result = await response.json()
      if (result.success) {
        setTests(Array.isArray(result.tests) ? result.tests : [])
        setAudits(Array.isArray(result.audits) ? result.audits : [])
        setBudgets(Array.isArray(result.budgets) ? result.budgets : [])
        setHistorical(Array.isArray(result.historical) ? result.historical : [])
        setSummary(result.summary || null)
        setAlerts(Array.isArray(result.alerts) ? result.alerts : [])
        setLastRefresh(new Date())
        return result
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch performance data'))
      console.error('Error fetching performance data:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchAudits = useCallback(async (url?: string) => {
    try {
      const params = new URLSearchParams({ action: 'audits' })
      if (url) params.set('url', url)

      const response = await fetch(`/api/performance?${params}`)
      const result = await response.json()
      if (result.success) {
        setAudits(result.audits)
      }
      return result.audits
    } catch (err) {
      console.error('Error fetching audits:', err)
      return []
    }
  }, [])

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch('/api/performance?action=budgets')
      const result = await response.json()
      if (result.success) {
        setBudgets(result.budgets)
      }
      return result.budgets
    } catch (err) {
      console.error('Error fetching budgets:', err)
      return []
    }
  }, [])

  const fetchHistorical = useCallback(async (url?: string, days: number = 7) => {
    try {
      const params = new URLSearchParams({ action: 'historical', days: days.toString() })
      if (url) params.set('url', url)

      const response = await fetch(`/api/performance?${params}`)
      const result = await response.json()
      if (result.success) {
        setHistorical(result.historical)
      }
      return result.historical
    } catch (err) {
      console.error('Error fetching historical:', err)
      return []
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/performance?action=alerts')
      const result = await response.json()
      if (result.success) {
        setAlerts(result.alerts)
      }
      return result.alerts
    } catch (err) {
      console.error('Error fetching alerts:', err)
      return []
    }
  }, [])

  // Actions
  const runTest = useCallback(async (url: string, device: 'mobile' | 'desktop' = 'mobile') => {
    setIsRunningTest(true)
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-test', url, device }),
      })

      const result = await response.json()
      if (result.success) {
        // Add new test to the list
        setTests(prev => [result.test, ...prev])
        await fetchAll()
      }
      return result
    } catch (err) {
      console.error('Error running test:', err)
      return { success: false, error: 'Failed to run test' }
    } finally {
      setIsRunningTest(false)
    }
  }, [fetchAll])

  const createBudget = useCallback(async (options: {
    name: string
    metric: string
    target: number
    unit: string
  }) => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-budget', ...options }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchBudgets()
      }
      return result
    } catch (err) {
      console.error('Error creating budget:', err)
      return { success: false, error: 'Failed to create budget' }
    }
  }, [fetchBudgets])

  const updateBudget = useCallback(async (id: string, target: number) => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-budget', id, target }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchBudgets()
      }
      return result
    } catch (err) {
      console.error('Error updating budget:', err)
      return { success: false, error: 'Failed to update budget' }
    }
  }, [fetchBudgets])

  const deleteBudget = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-budget', id }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchBudgets()
      }
      return result
    } catch (err) {
      console.error('Error deleting budget:', err)
      return { success: false, error: 'Failed to delete budget' }
    }
  }, [fetchBudgets])

  const createAlert = useCallback(async (options: {
    metric: string
    threshold: number
    condition: string
    notifyEmail?: string
  }) => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-alert', ...options }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchAlerts()
      }
      return result
    } catch (err) {
      console.error('Error creating alert:', err)
      return { success: false, error: 'Failed to create alert' }
    }
  }, [fetchAlerts])

  const scheduleTest = useCallback(async (options: {
    url: string
    device: 'mobile' | 'desktop'
    frequency: 'hourly' | 'daily' | 'weekly'
    notifyOnRegression?: boolean
  }) => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule-test', ...options }),
      })

      return await response.json()
    } catch (err) {
      console.error('Error scheduling test:', err)
      return { success: false, error: 'Failed to schedule test' }
    }
  }, [])

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await fetchAll()
  }, [fetchAll])

  // Initial load
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchAll()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchAll])

  // Computed values
  const hasData = useMemo(() => tests.length > 0 || audits.length > 0, [tests, audits])

  const latestTest = useMemo(() => tests[0] || null, [tests])

  const failingBudgets = useMemo(() =>
    budgets.filter(b => b.status === 'fail'),
  [budgets])

  const warningBudgets = useMemo(() =>
    budgets.filter(b => b.status === 'warning'),
  [budgets])

  const auditsByCategory = useMemo(() => {
    const grouped: Record<string, Audit[]> = {}
    audits.forEach(audit => {
      if (!grouped[audit.category]) {
        grouped[audit.category] = []
      }
      grouped[audit.category].push(audit)
    })
    return grouped
  }, [audits])

  const auditsBySeverity = useMemo(() => {
    const grouped: Record<string, Audit[]> = {
      fail: [],
      warning: [],
      pass: [],
      info: []
    }
    audits.forEach(audit => {
      grouped[audit.severity].push(audit)
    })
    return grouped
  }, [audits])

  return {
    // Data
    tests,
    audits,
    budgets,
    historical,
    summary,
    alerts,
    latestTest,
    failingBudgets,
    warningBudgets,
    auditsByCategory,
    auditsBySeverity,

    // State
    isLoading,
    isRunningTest,
    error,
    lastRefresh,
    hasData,

    // Fetch methods
    refresh,
    fetchAudits,
    fetchBudgets,
    fetchHistorical,
    fetchAlerts,

    // Actions
    runTest,
    createBudget,
    updateBudget,
    deleteBudget,
    createAlert,
    scheduleTest,
  }
}

export default usePerformanceMonitoring
