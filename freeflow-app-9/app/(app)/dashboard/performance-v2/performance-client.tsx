'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthUserId } from '@/lib/hooks/use-auth-user-id'
import {
  Gauge,
  Zap,
  Shield,
  Search,
  Globe,
  Smartphone,
  Monitor,
  Play,
  RefreshCw,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronRight,
  Download,
  Plus,
  Settings,
  Calendar,
  BarChart3,
  Target,
  Layers,
  Server,
  ArrowUp,
  ArrowDown,
  Loader2,
  Copy,
  Check,
  FileText,
  Accessibility,
  Bell,
  Webhook,
  Key,
  HardDrive,
  AlertOctagon,
  CreditCard,
  Sliders,
  Mail
} from 'lucide-react'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types
type DeviceType = 'mobile' | 'desktop'
type AuditCategory = 'performance' | 'accessibility' | 'best-practices' | 'seo' | 'pwa'
type AuditSeverity = 'pass' | 'warning' | 'fail' | 'info'

interface PerformanceScore {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa: number
}

interface CoreWebVital {
  name: string
  value: number
  unit: string
  rating: 'good' | 'needs-improvement' | 'poor'
  target: { good: number; needsImprovement: number }
}

interface Audit {
  id: string
  title: string
  description: string
  category: AuditCategory
  severity: AuditSeverity
  score: number
  displayValue?: string
  details?: string
  savings?: { time?: number; bytes?: number }
}

interface PageTest {
  id: string
  url: string
  device: DeviceType
  scores: PerformanceScore
  vitals: CoreWebVital[]
  audits: Audit[]
  timestamp: Date
  duration: number
  screenshot?: string
}

interface PerformanceBudget {
  id: string
  name: string
  metric: string
  target: number
  current: number
  unit: string
  status: 'pass' | 'warning' | 'fail'
}

interface HistoricalData {
  date: string
  performance: number
  accessibility: number
  lcp: number
  fid: number
  cls: number
}

// Mock Data
const mockPageTests: PageTest[] = [
  {
    id: '1',
    url: 'https://example.com',
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
    timestamp: new Date('2024-12-23T10:30:00'),
    duration: 25.4
  },
  {
    id: '2',
    url: 'https://example.com',
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
    timestamp: new Date('2024-12-23T10:32:00'),
    duration: 18.2
  },
  {
    id: '3',
    url: 'https://example.com/products',
    device: 'mobile',
    scores: { performance: 65, accessibility: 88, bestPractices: 85, seo: 90, pwa: 55 },
    vitals: [
      { name: 'Largest Contentful Paint', value: 3.8, unit: 's', rating: 'needs-improvement', target: { good: 2.5, needsImprovement: 4 } },
      { name: 'First Input Delay', value: 250, unit: 'ms', rating: 'needs-improvement', target: { good: 100, needsImprovement: 300 } },
      { name: 'Cumulative Layout Shift', value: 0.18, unit: '', rating: 'needs-improvement', target: { good: 0.1, needsImprovement: 0.25 } },
      { name: 'Time to First Byte', value: 1.2, unit: 's', rating: 'needs-improvement', target: { good: 0.8, needsImprovement: 1.8 } },
      { name: 'Interaction to Next Paint', value: 320, unit: 'ms', rating: 'needs-improvement', target: { good: 200, needsImprovement: 500 } }
    ],
    audits: [],
    timestamp: new Date('2024-12-22T15:20:00'),
    duration: 32.8
  }
]

const mockAudits: Audit[] = [
  {
    id: '1',
    title: 'Serve images in next-gen formats',
    description: 'Image formats like WebP and AVIF often provide better compression than PNG or JPEG.',
    category: 'performance',
    severity: 'warning',
    score: 0.4,
    displayValue: 'Potential savings of 245 KiB',
    savings: { bytes: 250880 }
  },
  {
    id: '2',
    title: 'Eliminate render-blocking resources',
    description: 'Resources are blocking the first paint of your page.',
    category: 'performance',
    severity: 'fail',
    score: 0,
    displayValue: 'Potential savings of 1,250 ms',
    savings: { time: 1250 }
  },
  {
    id: '3',
    title: 'Properly size images',
    description: 'Serve images that are appropriately-sized to save cellular data and improve load time.',
    category: 'performance',
    severity: 'warning',
    score: 0.6,
    displayValue: 'Potential savings of 156 KiB',
    savings: { bytes: 159744 }
  },
  {
    id: '4',
    title: 'Enable text compression',
    description: 'Text-based resources should be served with compression (gzip, deflate or brotli).',
    category: 'performance',
    severity: 'pass',
    score: 1
  },
  {
    id: '5',
    title: 'Image elements have [alt] attributes',
    description: 'Informative elements should aim for short, descriptive alternate text.',
    category: 'accessibility',
    severity: 'warning',
    score: 0.7,
    displayValue: '3 images missing alt attributes'
  },
  {
    id: '6',
    title: 'Background and foreground colors have sufficient contrast ratio',
    description: 'Low-contrast text is difficult or impossible for many users to read.',
    category: 'accessibility',
    severity: 'fail',
    score: 0,
    displayValue: '5 elements with low contrast'
  },
  {
    id: '7',
    title: 'Links have descriptive text',
    description: 'Descriptive link text helps search engines understand your content.',
    category: 'seo',
    severity: 'pass',
    score: 1
  },
  {
    id: '8',
    title: 'Document has a meta description',
    description: 'Meta descriptions may be included in search results.',
    category: 'seo',
    severity: 'pass',
    score: 1
  },
  {
    id: '9',
    title: 'Uses HTTPS',
    description: 'All sites should be protected with HTTPS.',
    category: 'best-practices',
    severity: 'pass',
    score: 1
  },
  {
    id: '10',
    title: 'No browser errors logged to the console',
    description: 'Errors logged to the console indicate unresolved problems.',
    category: 'best-practices',
    severity: 'warning',
    score: 0.5,
    displayValue: '2 errors logged'
  },
  {
    id: '11',
    title: 'Registers a service worker',
    description: 'The service worker is the technology that enables PWA features.',
    category: 'pwa',
    severity: 'fail',
    score: 0
  },
  {
    id: '12',
    title: 'Web app manifest meets installability requirements',
    description: 'Browsers can proactively prompt users to add your app to their homescreen.',
    category: 'pwa',
    severity: 'warning',
    score: 0.5,
    displayValue: 'Missing icons'
  }
]

const mockBudgets: PerformanceBudget[] = [
  { id: '1', name: 'JavaScript Bundle Size', metric: 'script', target: 300, current: 285, unit: 'KB', status: 'pass' },
  { id: '2', name: 'CSS Bundle Size', metric: 'stylesheet', target: 50, current: 42, unit: 'KB', status: 'pass' },
  { id: '3', name: 'Image Total Size', metric: 'image', target: 500, current: 620, unit: 'KB', status: 'fail' },
  { id: '4', name: 'Total Page Weight', metric: 'total', target: 1500, current: 1380, unit: 'KB', status: 'pass' },
  { id: '5', name: 'First Contentful Paint', metric: 'fcp', target: 1.8, current: 2.1, unit: 's', status: 'warning' },
  { id: '6', name: 'Time to Interactive', metric: 'tti', target: 3.8, current: 3.2, unit: 's', status: 'pass' },
  { id: '7', name: 'Third-party Requests', metric: '3p-requests', target: 10, current: 14, unit: '', status: 'fail' },
  { id: '8', name: 'Font File Size', metric: 'font', target: 100, current: 85, unit: 'KB', status: 'pass' }
]

const mockHistoricalData: HistoricalData[] = [
  { date: '2024-12-17', performance: 72, accessibility: 88, lcp: 2.8, fid: 120, cls: 0.12 },
  { date: '2024-12-18', performance: 74, accessibility: 89, lcp: 2.6, fid: 110, cls: 0.10 },
  { date: '2024-12-19', performance: 73, accessibility: 90, lcp: 2.7, fid: 105, cls: 0.09 },
  { date: '2024-12-20', performance: 76, accessibility: 91, lcp: 2.5, fid: 95, cls: 0.08 },
  { date: '2024-12-21', performance: 75, accessibility: 91, lcp: 2.6, fid: 90, cls: 0.09 },
  { date: '2024-12-22', performance: 78, accessibility: 92, lcp: 2.4, fid: 85, cls: 0.08 },
  { date: '2024-12-23', performance: 78, accessibility: 92, lcp: 2.4, fid: 85, cls: 0.08 }
]

// Helper Functions
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600'
  if (score >= 50) return 'text-orange-500'
  return 'text-red-500'
}

const getScoreBg = (score: number): string => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

const getScoreRingColor = (score: number): string => {
  if (score >= 90) return 'stroke-green-500'
  if (score >= 50) return 'stroke-orange-500'
  return 'stroke-red-500'
}

const getVitalColor = (rating: string): string => {
  if (rating === 'good') return 'text-green-600 bg-green-100 dark:bg-green-900/30'
  if (rating === 'needs-improvement') return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
  return 'text-red-600 bg-red-100 dark:bg-red-900/30'
}

const getSeverityIcon = (severity: AuditSeverity): React.ReactNode => {
  switch (severity) {
    case 'pass': return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />
    case 'fail': return <XCircle className="h-5 w-5 text-red-500" />
    default: return <Info className="h-5 w-5 text-blue-500" />
  }
}

const getCategoryIcon = (category: AuditCategory): React.ReactNode => {
  switch (category) {
    case 'performance': return <Zap className="h-4 w-4" />
    case 'accessibility': return <Accessibility className="h-4 w-4" />
    case 'best-practices': return <Shield className="h-4 w-4" />
    case 'seo': return <Search className="h-4 w-4" />
    case 'pwa': return <Smartphone className="h-4 w-4" />
  }
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

// Score Circle Component
const ScoreCircle = ({ score, size = 'lg', label }: { score: number; size?: 'sm' | 'md' | 'lg'; label?: string }) => {
  const dimensions = { sm: 60, md: 80, lg: 120 }
  const dim = dimensions[size]
  const strokeWidth = size === 'lg' ? 8 : 6
  const radius = (dim - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={dim} height={dim} className="transform -rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-1000 ${getScoreRingColor(score)}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-lg'} ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
      {label && (
        <span className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      )}
    </div>
  )
}

// Competitive Upgrade Mock Data
const mockPerfAIInsights = [
  { id: '1', query: "What's causing slow load times?", insight: "Largest Contentful Paint is 3.2s due to unoptimized hero image (2.4MB). Compress to WebP format for 70% size reduction.", confidence: 0.94, category: 'engagement' as const, timestamp: new Date().toISOString() },
  { id: '2', query: "Which pages need optimization?", insight: "/products page has 4.8s TTI due to 23 render-blocking scripts. Code splitting could improve by 60%.", confidence: 0.89, category: 'conversion' as const, timestamp: new Date().toISOString() },
  { id: '3', query: "Mobile vs desktop performance?", insight: "Mobile scores 12 points lower. Focus on reducing JavaScript bundle size and implementing lazy loading.", confidence: 0.86, category: 'revenue' as const, timestamp: new Date().toISOString() },
]

const mockPerfCollaborators = [
  { id: '1', name: 'DevOps Team', avatar: '/avatars/devops.jpg', status: 'active' as const, lastActive: 'Just now', role: 'Performance' },
  { id: '2', name: 'Frontend Lead', avatar: '/avatars/frontend.jpg', status: 'active' as const, lastActive: '5m ago', role: 'Engineering' },
  { id: '3', name: 'SEO Analyst', avatar: '/avatars/seo.jpg', status: 'idle' as const, lastActive: '20m ago', role: 'Marketing' },
]

const mockPerfPredictions = [
  { id: '1', metric: 'Performance Score', currentValue: 72, predictedValue: 85, confidence: 0.82, trend: 'up' as const, timeframe: 'After optimizations', factors: ['Image compression', 'Code splitting', 'CDN'] },
  { id: '2', metric: 'LCP (seconds)', currentValue: 3.2, predictedValue: 1.8, confidence: 0.78, trend: 'down' as const, timeframe: 'Next release', factors: ['Lazy loading', 'Preloading critical assets'] },
  { id: '3', metric: 'SEO Score', currentValue: 89, predictedValue: 95, confidence: 0.85, trend: 'up' as const, timeframe: 'Next 30 days', factors: ['Core Web Vitals improvements'] },
]

const mockPerfActivities = [
  { id: '1', type: 'update' as const, title: 'Performance test completed', description: 'Mobile audit score improved to 72', user: { name: 'System', avatar: '' }, timestamp: new Date().toISOString(), metadata: {} },
  { id: '2', type: 'create' as const, title: 'New optimization deployed', description: 'Image lazy loading enabled on /products', user: { name: 'Frontend Lead', avatar: '/avatars/frontend.jpg' }, timestamp: new Date(Date.now() - 3600000).toISOString(), metadata: {} },
  { id: '3', type: 'milestone' as const, title: 'Core Web Vitals passed', description: 'Homepage now passes all CWV metrics', user: { name: 'DevOps Team', avatar: '/avatars/devops.jpg' }, timestamp: new Date(Date.now() - 86400000).toISOString(), metadata: {} },
]

const mockPerfQuickActions = [
  { id: '1', label: 'Run Audit', icon: 'Play', shortcut: '⌘R', action: () => toast.promise(new Promise(r => setTimeout(r, 3000)), { loading: 'Running performance audit...', success: 'Audit completed successfully!', error: 'Audit failed' }) },
  { id: '2', label: 'View Report', icon: 'FileText', shortcut: '⌘V', action: () => toast.success('Performance Report', { description: 'Opening performance report...' }) },
  { id: '3', label: 'Compare Tests', icon: 'GitBranch', shortcut: '⌘C', action: () => toast.success('Compare Tests', { description: 'Opening test comparison tool...' }) },
  { id: '4', label: 'Export Data', icon: 'Download', shortcut: '⌘E', action: () => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Exporting data...', success: 'Data exported successfully!', error: 'Export failed' }) },
]

export default function PerformanceClient() {
  // Supabase client and auth
  const supabase = createClient()
  const { getUserId } = useAuthUserId()

  // UI State
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('mobile')
  const [testUrl, setTestUrl] = useState('https://example.com')
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTest, setSelectedTest] = useState<PageTest | null>(mockPageTests[0])
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | 'all'>('all')
  const [showRunDialog, setShowRunDialog] = useState(false)
  const [showAuditDetail, setShowAuditDetail] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [showAddBudgetDialog, setShowAddBudgetDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Data State
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([])
  const [performanceBenchmarks, setPerformanceBenchmarks] = useState<any[]>([])
  const [performanceAlerts, setPerformanceAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Form State for Add Budget Dialog
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    metric: 'script',
    target: 300,
    unit: 'KB',
    category: 'performance' as const
  })

  // Fetch performance data from Supabase
  const fetchPerformanceData = useCallback(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return

      setIsLoading(true)

      // Fetch performance metrics
      const { data: metrics } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('metric_date', { ascending: false })
        .limit(30)

      // Fetch performance benchmarks (used as budgets)
      const { data: benchmarks } = await supabase
        .from('performance_benchmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Fetch performance alerts
      const { data: alerts } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(10)

      setPerformanceMetrics(metrics || [])
      setPerformanceBenchmarks(benchmarks || [])
      setPerformanceAlerts(alerts || [])
    } catch (err) {
      console.error('Failed to fetch performance data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, getUserId])

  // Initial data fetch
  useEffect(() => {
    fetchPerformanceData()
  }, [fetchPerformanceData])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('performance_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'performance_metrics' },
        () => fetchPerformanceData()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'performance_benchmarks' },
        () => fetchPerformanceData()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'performance_alerts' },
        () => fetchPerformanceData()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchPerformanceData])

  // Filter audits
  const filteredAudits = useMemo(() => {
    return mockAudits.filter(a =>
      categoryFilter === 'all' || a.category === categoryFilter
    )
  }, [categoryFilter])

  // Calculate summary stats
  const passedAudits = mockAudits.filter(a => a.severity === 'pass').length
  const warningAudits = mockAudits.filter(a => a.severity === 'warning').length
  const failedAudits = mockAudits.filter(a => a.severity === 'fail').length

  // Calculate average scores from mock data for settings display
  const averageScores = useMemo(() => {
    const tests = mockPageTests
    return {
      performance: Math.round(tests.reduce((sum, t) => sum + t.scores.performance, 0) / tests.length),
      accessibility: Math.round(tests.reduce((sum, t) => sum + t.scores.accessibility, 0) / tests.length),
      bestPractices: Math.round(tests.reduce((sum, t) => sum + t.scores.bestPractices, 0) / tests.length),
      seo: Math.round(tests.reduce((sum, t) => sum + t.scores.seo, 0) / tests.length),
      pwa: Math.round(tests.reduce((sum, t) => sum + t.scores.pwa, 0) / tests.length)
    }
  }, [])

  // Mock data for settings display
  const mockWebVitals = [
    { name: 'LCP', value: 2400 },
    { name: 'FID', value: 85 },
    { name: 'CLS', value: 0.08 }
  ]

  const mockHistoricalTests = mockPageTests

  // Run performance audit - stores result in Supabase
  const handleRunTest = async () => {
    if (!testUrl.trim()) {
      toast.error('Please enter a URL to audit')
      return
    }

    try {
      const userId = await getUserId()
      if (!userId) {
        toast.error('You must be logged in to run audits')
        return
      }

      setIsRunning(true)
      toast.info('Running performance audit...', {
        description: `Analyzing ${testUrl}`
      })

      // Simulate audit (in production, this would call a real Lighthouse API)
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Store performance metric in Supabase
      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          user_id: userId,
          metric_date: new Date().toISOString().split('T')[0],
          period: 'daily',
          category: 'productivity',
          completion_rate: Math.random() * 20 + 70, // Mock score 70-90
          efficiency_score: Math.random() * 20 + 75,
          trend: 'up',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setShowRunDialog(false)
      toast.success('Performance audit completed!', {
        description: 'Results have been saved'
      })

      fetchPerformanceData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to run performance audit')
    } finally {
      setIsRunning(false)
    }
  }

  // Copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(testUrl)
    setCopiedUrl(true)
    toast.success('URL copied to clipboard!')
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const currentTest = selectedTest || mockPageTests[0]

  // Export performance report
  const handleExportReport = async () => {
    try {
      setIsExporting(true)
      toast.info('Generating report...', {
        description: 'Please wait while we compile your data'
      })

      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create exportable data
      const exportData = {
        exportedAt: new Date().toISOString(),
        url: currentTest.url,
        device: selectedDevice,
        scores: currentTest.scores,
        vitals: currentTest.vitals,
        audits: mockAudits,
        budgets: mockBudgets,
        metrics: performanceMetrics
      }

      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Report exported successfully!', {
        description: 'Check your downloads folder'
      })
    } catch (err: any) {
      toast.error(err.message || 'Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  // Schedule performance test
  const handleScheduleTest = async () => {
    try {
      const userId = await getUserId()
      if (!userId) {
        toast.error('You must be logged in to schedule tests')
        return
      }

      // In production, this would create a scheduled job
      toast.success('Test scheduled successfully!', {
        description: 'You will receive notifications when tests complete'
      })
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule test')
    }
  }

  // Compare test results
  const handleCompareResults = () => {
    if (mockPageTests.length < 2) {
      toast.error('Need at least 2 tests to compare')
      return
    }

    toast.info('Opening comparison view', {
      description: 'Comparing latest test results'
    })
  }

  // Add performance budget
  const handleAddBudget = async () => {
    try {
      const userId = await getUserId()
      if (!userId) {
        toast.error('You must be logged in to add budgets')
        return
      }

      if (!budgetForm.name.trim()) {
        toast.error('Please enter a budget name')
        return
      }

      const { error } = await supabase
        .from('performance_benchmarks')
        .insert({
          user_id: userId,
          category: 'productivity',
          metric_name: budgetForm.name,
          target_value: budgetForm.target,
          current_value: 0,
          benchmark_level: 'average',
          period: 'monthly',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setShowAddBudgetDialog(false)
      setBudgetForm({ name: '', metric: 'script', target: 300, unit: 'KB', category: 'performance' })
      toast.success('Performance budget added!', {
        description: `${budgetForm.name} budget has been created`
      })

      fetchPerformanceData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add budget')
    }
  }

  // Delete performance budget
  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase
        .from('performance_benchmarks')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', budgetId)

      if (error) throw error

      toast.success('Budget removed')
      fetchPerformanceData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove budget')
    }
  }

  // Resolve performance alert
  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('performance_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error

      toast.success('Alert resolved')
      fetchPerformanceData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve alert')
    }
  }

  // Delete all history
  const handleDeleteHistory = async () => {
    try {
      const userId = await getUserId()
      if (!userId) {
        toast.error('You must be logged in')
        return
      }

      const { error } = await supabase
        .from('performance_metrics')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      toast.success('History deleted', {
        description: 'All performance test history has been removed'
      })
      fetchPerformanceData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete history')
    }
  }

  // Reset all budgets
  const handleResetBudgets = async () => {
    try {
      const userId = await getUserId()
      if (!userId) {
        toast.error('You must be logged in')
        return
      }

      const { error } = await supabase
        .from('performance_benchmarks')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (error) throw error

      toast.success('Budgets reset', {
        description: 'All performance budgets have been cleared'
      })
      fetchPerformanceData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset budgets')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Gauge className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">Performance Auditor</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    Lighthouse Level
                  </span>
                </div>
                <p className="text-emerald-100 mt-1">
                  Web performance auditing and Core Web Vitals monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportReport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white rounded-xl hover:bg-white/30 font-medium transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                Export
              </button>
              <button
                onClick={() => setShowRunDialog(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 font-medium transition-colors"
              >
                <Play className="h-5 w-5" />
                Run Audit
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                <CheckCircle className="h-4 w-4" />
                Passed
              </div>
              <p className="text-2xl font-bold">{passedAudits}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                <AlertTriangle className="h-4 w-4" />
                Warnings
              </div>
              <p className="text-2xl font-bold">{warningAudits}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                <XCircle className="h-4 w-4" />
                Failed
              </div>
              <p className="text-2xl font-bold">{failedAudits}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Last Run
              </div>
              <p className="text-2xl font-bold">2m ago</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                <Target className="h-4 w-4" />
                Budget Met
              </div>
              <p className="text-2xl font-bold">{mockBudgets.filter(b => b.status === 'pass').length}/{mockBudgets.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-200 text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Score Trend
              </div>
              <p className="text-2xl font-bold">+6 pts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="vitals" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Core Web Vitals
              </TabsTrigger>
              <TabsTrigger value="audits" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Audits
              </TabsTrigger>
              <TabsTrigger value="budgets" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Budgets
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              {/* Device Toggle */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedDevice('mobile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    selectedDevice === 'mobile'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </button>
                <button
                  onClick={() => setSelectedDevice('desktop')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    selectedDevice === 'desktop'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  Desktop
                </button>
              </div>

              {/* URL Display */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                  {currentTest.url}
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {copiedUrl ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* Score Cards */}
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { key: 'performance', label: 'Performance', icon: <Zap className="h-5 w-5" />, score: currentTest.scores.performance },
                { key: 'accessibility', label: 'Accessibility', icon: <Accessibility className="h-5 w-5" />, score: currentTest.scores.accessibility },
                { key: 'bestPractices', label: 'Best Practices', icon: <Shield className="h-5 w-5" />, score: currentTest.scores.bestPractices },
                { key: 'seo', label: 'SEO', icon: <Search className="h-5 w-5" />, score: currentTest.scores.seo },
                { key: 'pwa', label: 'PWA', icon: <Smartphone className="h-5 w-5" />, score: currentTest.scores.pwa }
              ].map(item => (
                <div key={item.key} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <ScoreCircle score={item.score} size="lg" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Core Web Vitals Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Core Web Vitals</h3>
                  <p className="text-sm text-gray-500">Real-world user experience metrics</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentTest.vitals.every(v => v.rating === 'good')
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                  {currentTest.vitals.filter(v => v.rating === 'good').length}/{currentTest.vitals.length} Passed
                </span>
              </div>

              <div className="grid md:grid-cols-5 gap-4">
                {currentTest.vitals.map((vital, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">{vital.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {vital.value}{vital.unit}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${getVitalColor(vital.rating)}`}>
                      {vital.rating.replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Wins */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Opportunities
                </h3>
                <div className="space-y-3">
                  {mockAudits.filter(a => a.severity === 'fail' || a.severity === 'warning').slice(0, 4).map(audit => (
                    <div
                      key={audit.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => { setSelectedAudit(audit); setShowAuditDetail(true); }}
                    >
                      {getSeverityIcon(audit.severity)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{audit.title}</p>
                        {audit.displayValue && (
                          <p className="text-sm text-gray-500">{audit.displayValue}</p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Test Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">URL</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{currentTest.url}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {selectedDevice === 'mobile' ? <Smartphone className="h-5 w-5 text-gray-400" /> : <Monitor className="h-5 w-5 text-gray-400" />}
                      <span className="text-sm text-gray-600 dark:text-gray-400">Device</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{selectedDevice}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{currentTest.duration}s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Timestamp</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentTest.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Core Web Vitals Tab */}
          <TabsContent value="vitals" className="mt-0 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Core Web Vitals Assessment</h3>
                <p className="text-sm text-gray-500 mt-1">Metrics that directly impact user experience</p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentTest.vitals.map((vital, i) => (
                  <div key={i} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{vital.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Target: Good &lt; {vital.target.good}{vital.unit}, Needs improvement &lt; {vital.target.needsImprovement}{vital.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          vital.rating === 'good' ? 'text-green-600' :
                          vital.rating === 'needs-improvement' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {vital.value}{vital.unit}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getVitalColor(vital.rating)}`}>
                          {vital.rating.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                          vital.rating === 'good' ? 'bg-green-500' :
                          vital.rating === 'needs-improvement' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((vital.value / vital.target.needsImprovement) * 100, 100)}%` }}
                      />
                      {/* Threshold markers */}
                      <div
                        className="absolute top-0 h-full w-0.5 bg-green-700"
                        style={{ left: `${(vital.target.good / vital.target.needsImprovement) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>0</span>
                      <span>Good: {vital.target.good}{vital.unit}</span>
                      <span>NI: {vital.target.needsImprovement}{vital.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Audits Tab */}
          <TabsContent value="audits" className="mt-0 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(['all', 'performance', 'accessibility', 'best-practices', 'seo', 'pwa'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      categoryFilter === cat
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat.replace('-', ' ')}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {filteredAudits.length} audits
              </span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAudits.map(audit => (
                  <div
                    key={audit.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => { setSelectedAudit(audit); setShowAuditDetail(true); }}
                  >
                    <div className="flex items-start gap-4">
                      {getSeverityIcon(audit.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{audit.title}</h4>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            {getCategoryIcon(audit.category)}
                            {audit.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{audit.description}</p>
                        {audit.displayValue && (
                          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{audit.displayValue}</p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="mt-0 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Budgets</h2>
                <p className="text-gray-500">Set and track resource budgets for optimal performance</p>
              </div>
              <button
                onClick={() => setShowAddBudgetDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Budget
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockBudgets.map(budget => (
                <div
                  key={budget.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 ${
                    budget.status === 'pass' ? 'border-green-200 dark:border-green-800' :
                    budget.status === 'warning' ? 'border-orange-200 dark:border-orange-800' :
                    'border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{budget.name}</h4>
                    {budget.status === 'pass' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {budget.status === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    {budget.status === 'fail' && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {budget.current}
                        <span className="text-sm font-normal text-gray-500 ml-1">{budget.unit}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Target: {budget.target} {budget.unit}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${
                      budget.current <= budget.target ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {budget.current <= budget.target ? (
                        <span className="flex items-center gap-1">
                          <ArrowDown className="h-4 w-4" />
                          {((budget.target - budget.current) / budget.target * 100).toFixed(0)}% under
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ArrowUp className="h-4 w-4" />
                          {((budget.current - budget.target) / budget.target * 100).toFixed(0)}% over
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budget.status === 'pass' ? 'bg-green-500' :
                        budget.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((budget.current / budget.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Score Trend</h3>
              <div className="h-64 flex items-end justify-between gap-4">
                {mockHistoricalData.map((day, i) => {
                  const maxScore = 100
                  const height = (day.performance / maxScore) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative" style={{ height: '200px' }}>
                        <div
                          className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                            day.performance >= 90 ? 'bg-gradient-to-t from-green-600 to-green-400' :
                            day.performance >= 50 ? 'bg-gradient-to-t from-orange-600 to-orange-400' :
                            'bg-gradient-to-t from-red-600 to-red-400'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {day.performance}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Audits</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="pb-4">URL</th>
                      <th className="pb-4">Device</th>
                      <th className="pb-4">Performance</th>
                      <th className="pb-4">LCP</th>
                      <th className="pb-4">FID</th>
                      <th className="pb-4">CLS</th>
                      <th className="pb-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockPageTests.map(test => (
                      <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-4">
                          <span className="font-medium text-gray-900 dark:text-white">{test.url}</span>
                        </td>
                        <td className="py-4">
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            {test.device === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                            {test.device}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`font-semibold ${getScoreColor(test.scores.performance)}`}>
                            {test.scores.performance}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={test.vitals[0].rating === 'good' ? 'text-green-600' : 'text-orange-600'}>
                            {test.vitals[0].value}s
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={test.vitals[1].rating === 'good' ? 'text-green-600' : 'text-orange-600'}>
                            {test.vitals[1].value}ms
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={test.vitals[2].rating === 'good' ? 'text-green-600' : 'text-orange-600'}>
                            {test.vitals[2].value}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-500">
                          {test.timestamp.toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab - DataDog Level */}
          <TabsContent value="settings" className="mt-0 space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'monitoring', label: 'Monitoring', icon: Gauge },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'thresholds', label: 'Thresholds', icon: Target },
                    { id: 'integrations', label: 'Integrations', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Sliders }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        settingsTab === item.id
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* Performance Stats */}
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Performance Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Avg Score</span>
                      <Badge variant="secondary">{averageScores.performance}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">LCP</span>
                      <span className="text-sm font-medium text-emerald-600">
                        {mockWebVitals.find(v => v.name === 'LCP')?.value}ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Tests Run</span>
                      <span className="text-sm font-medium">{mockHistoricalTests.length}</span>
                    </div>
                    <Progress value={averageScores.performance} className="h-2 mt-2" />
                    <p className="text-xs text-gray-500 mt-1">Overall performance score</p>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-emerald-600" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure performance monitoring settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default URL</Label>
                            <Input defaultValue="https://yoursite.com" />
                            <p className="text-xs text-gray-500">Primary URL to monitor</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Time Zone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="cet">Central European</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Device</Label>
                            <Select defaultValue="mobile">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mobile">Mobile</SelectItem>
                                <SelectItem value="desktop">Desktop</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Network Throttling</Label>
                            <Select defaultValue="4g">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Throttling</SelectItem>
                                <SelectItem value="4g">4G</SelectItem>
                                <SelectItem value="3g">3G</SelectItem>
                                <SelectItem value="slow">Slow 3G</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Lighthouse CI</p>
                            <p className="text-sm text-gray-500">Run audits in CI/CD pipeline</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-retry Failed Tests</p>
                            <p className="text-sm text-gray-500">Automatically retry on failure</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Test Locations
                        </CardTitle>
                        <CardDescription>Configure test regions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['US East (Virginia)', 'US West (Oregon)', 'EU West (Ireland)', 'Asia Pacific (Tokyo)'].map((location, idx) => (
                          <div key={location} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-gray-400" />
                              <span className="font-medium">{location}</span>
                            </div>
                            <Switch defaultChecked={idx < 2} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Monitoring Settings */}
                {settingsTab === 'monitoring' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gauge className="w-5 h-5 text-emerald-600" />
                          Audit Configuration
                        </CardTitle>
                        <CardDescription>Configure what to measure</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Performance</p>
                            <p className="text-sm text-gray-500">Core Web Vitals and loading metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Accessibility</p>
                            <p className="text-sm text-gray-500">WCAG compliance checks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Best Practices</p>
                            <p className="text-sm text-gray-500">Security and coding standards</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">SEO</p>
                            <p className="text-sm text-gray-500">Search engine optimization</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">PWA</p>
                            <p className="text-sm text-gray-500">Progressive Web App standards</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-600" />
                          Schedule
                        </CardTitle>
                        <CardDescription>Automated monitoring schedule</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Test Frequency</Label>
                          <Select defaultValue="hourly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15min">Every 15 minutes</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Schedule Active</p>
                            <p className="text-sm text-gray-500">Run tests on schedule</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Comparison Tests</p>
                            <p className="text-sm text-gray-500">Run against competitors</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-amber-500" />
                          Alert Notifications
                        </CardTitle>
                        <CardDescription>Configure when to get notified</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Score Drops</p>
                            <p className="text-sm text-gray-500">Alert when performance score drops</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Threshold Breaches</p>
                            <p className="text-sm text-gray-500">Alert on budget violations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Report</p>
                            <p className="text-sm text-gray-500">Weekly performance summary</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">CWV Degradation</p>
                            <p className="text-sm text-gray-500">Alert on Core Web Vitals issues</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2 pt-4">
                          <Label>Notification Email</Label>
                          <Input type="email" placeholder="team@company.com" />
                          <p className="text-xs text-gray-500">Where to send alerts</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          Delivery Channels
                        </CardTitle>
                        <CardDescription>How to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-gray-500">Send alerts via email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Slack</p>
                            <p className="text-sm text-gray-500">Post to Slack channel</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">PagerDuty</p>
                            <p className="text-sm text-gray-500">Trigger PagerDuty incidents</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="space-y-2">
                          <Label>Slack Webhook</Label>
                          <Input placeholder="https://hooks.slack.com/..." />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Thresholds Settings */}
                {settingsTab === 'thresholds' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-emerald-600" />
                          Performance Budgets
                        </CardTitle>
                        <CardDescription>Set performance thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>LCP Target (ms)</Label>
                            <Input type="number" defaultValue="2500" />
                            <p className="text-xs text-gray-500">Largest Contentful Paint</p>
                          </div>
                          <div className="space-y-2">
                            <Label>FID Target (ms)</Label>
                            <Input type="number" defaultValue="100" />
                            <p className="text-xs text-gray-500">First Input Delay</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>CLS Target</Label>
                            <Input type="number" step="0.01" defaultValue="0.1" />
                            <p className="text-xs text-gray-500">Cumulative Layout Shift</p>
                          </div>
                          <div className="space-y-2">
                            <Label>TTFB Target (ms)</Label>
                            <Input type="number" defaultValue="800" />
                            <p className="text-xs text-gray-500">Time to First Byte</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Total Blocking Time (ms)</Label>
                            <Input type="number" defaultValue="200" />
                          </div>
                          <div className="space-y-2">
                            <Label>Speed Index (ms)</Label>
                            <Input type="number" defaultValue="3400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="w-5 h-5 text-blue-600" />
                          Resource Budgets
                        </CardTitle>
                        <CardDescription>Limit resource sizes</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Total Page Size (KB)</Label>
                            <Input type="number" defaultValue="1500" />
                          </div>
                          <div className="space-y-2">
                            <Label>JavaScript (KB)</Label>
                            <Input type="number" defaultValue="300" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>CSS (KB)</Label>
                            <Input type="number" defaultValue="100" />
                          </div>
                          <div className="space-y-2">
                            <Label>Images (KB)</Label>
                            <Input type="number" defaultValue="500" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Fonts (KB)</Label>
                            <Input type="number" defaultValue="100" />
                          </div>
                          <div className="space-y-2">
                            <Label>Third-party (KB)</Label>
                            <Input type="number" defaultValue="200" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-orange-600" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Send results to external services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://your-service.com/webhook" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch id="wh-complete" defaultChecked />
                            <Label htmlFor="wh-complete">Test Complete</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="wh-fail" defaultChecked />
                            <Label htmlFor="wh-fail">Budget Exceeded</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="wh-improve" />
                            <Label htmlFor="wh-improve">Score Improved</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="wh-degrade" defaultChecked />
                            <Label htmlFor="wh-degrade">Score Degraded</Label>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-violet-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Programmatic access to performance data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="perf_xxxxxxxxxxxxxxxxxxxxx" readOnly />
                            <Button variant="outline">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">API Access</p>
                            <p className="text-sm text-gray-500">Enable API access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-blue-600" />
                          CI/CD Integration
                        </CardTitle>
                        <CardDescription>Connect with your CI pipeline</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">GitHub Actions</p>
                            <p className="text-sm text-gray-500">Run on PR and merge</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Block on Failure</p>
                            <p className="text-sm text-gray-500">Fail builds when budgets exceeded</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">PR Comments</p>
                            <p className="text-sm text-gray-500">Post results as PR comments</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Access and security configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Private Results</p>
                            <p className="text-sm text-gray-500">Results only visible to team</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auth Required</p>
                            <p className="text-sm text-gray-500">Require authentication for tested pages</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Audit Logging</p>
                            <p className="text-sm text-gray-500">Log all configuration changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-blue-600" />
                          Data Management
                        </CardTitle>
                        <CardDescription>Test data and retention</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Data Retention</Label>
                          <Select defaultValue="90">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button variant="outline" className="w-full" onClick={handleExportReport} disabled={isExporting}>
                          {isExporting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Export All Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-indigo-600" />
                          Subscription
                        </CardTitle>
                        <CardDescription>Plan and usage information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                          <div>
                            <p className="font-medium text-emerald-800 dark:text-emerald-400">Pro Plan</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-500">Unlimited tests • 10 URLs</p>
                          </div>
                          <Badge className="bg-emerald-600">Active</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-emerald-600">{mockHistoricalTests.length}</p>
                            <p className="text-xs text-gray-500">Tests Run</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">5</p>
                            <p className="text-xs text-gray-500">URLs Monitored</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600">87%</p>
                            <p className="text-xs text-gray-500">Quota Used</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            Manage Subscription
                          </Button>
                          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            Upgrade Plan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All History</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove all test history</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleDeleteHistory}>Delete</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset Budgets</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Clear all performance budgets</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleResetBudgets}>Reset</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete Project</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently delete this project</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => toast.warning('This action cannot be undone. Contact support to delete project.')}>Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Run Audit Dialog */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-emerald-600" />
              Run Performance Audit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL to audit
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  value={testUrl}
                  onChange={e => setTestUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Device
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDevice('mobile')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                    selectedDevice === 'mobile'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Smartphone className="h-5 w-5" />
                  Mobile
                </button>
                <button
                  onClick={() => setSelectedDevice('desktop')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                    selectedDevice === 'desktop'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Monitor className="h-5 w-5" />
                  Desktop
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRunDialog(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRunTest}
                disabled={isRunning || !testUrl}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Run Audit
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit Detail Dialog */}
      <Dialog open={showAuditDetail} onOpenChange={setShowAuditDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAudit && getSeverityIcon(selectedAudit.severity)}
              {selectedAudit?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedAudit && (
            <div className="space-y-4 py-4">
              <p className="text-gray-600 dark:text-gray-400">{selectedAudit.description}</p>
              {selectedAudit.displayValue && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <p className="font-medium text-orange-800 dark:text-orange-200">{selectedAudit.displayValue}</p>
                </div>
              )}
              {selectedAudit.savings && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Estimated Savings</p>
                  <div className="flex items-center gap-4 mt-2">
                    {selectedAudit.savings.time && (
                      <span className="text-green-700 dark:text-green-300">
                        {selectedAudit.savings.time}ms faster load
                      </span>
                    )}
                    {selectedAudit.savings.bytes && (
                      <span className="text-green-700 dark:text-green-300">
                        {formatBytes(selectedAudit.savings.bytes)} smaller
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded flex items-center gap-1">
                  {getCategoryIcon(selectedAudit.category)}
                  {selectedAudit.category}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Budget Dialog */}
      <Dialog open={showAddBudgetDialog} onOpenChange={setShowAddBudgetDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Add Performance Budget
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Name
              </Label>
              <Input
                value={budgetForm.name}
                onChange={e => setBudgetForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., JavaScript Bundle Size"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Metric Type
                </Label>
                <Select
                  value={budgetForm.metric}
                  onValueChange={(value) => setBudgetForm(prev => ({ ...prev, metric: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="script">JavaScript</SelectItem>
                    <SelectItem value="stylesheet">CSS</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="font">Fonts</SelectItem>
                    <SelectItem value="total">Total Page</SelectItem>
                    <SelectItem value="fcp">First Contentful Paint</SelectItem>
                    <SelectItem value="lcp">Largest Contentful Paint</SelectItem>
                    <SelectItem value="tti">Time to Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit
                </Label>
                <Select
                  value={budgetForm.unit}
                  onValueChange={(value) => setBudgetForm(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KB">KB</SelectItem>
                    <SelectItem value="MB">MB</SelectItem>
                    <SelectItem value="s">Seconds</SelectItem>
                    <SelectItem value="ms">Milliseconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Value
              </Label>
              <Input
                type="number"
                value={budgetForm.target}
                onChange={e => setBudgetForm(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                placeholder="300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Performance budget threshold in {budgetForm.unit}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddBudgetDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBudget}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Budget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI-Powered Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <AIInsightsPanel
          insights={mockPerfAIInsights}
          onAskQuestion={(q) => console.log('Performance Question:', q)}
        />
        <PredictiveAnalytics predictions={mockPerfPredictions} />
      </div>

      {/* Activity Feed */}
      <div className="mt-6">
        <ActivityFeed
          activities={mockPerfActivities}
          maxItems={5}
          showFilters={true}
        />
      </div>

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar actions={mockPerfQuickActions} />
    </div>
  )
}
