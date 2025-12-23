'use client'

import { useState, useMemo } from 'react'
import {
  Gauge,
  Zap,
  Eye,
  Shield,
  Search,
  Globe,
  Smartphone,
  Monitor,
  Play,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
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
  LineChart,
  Target,
  Layers,
  Image as ImageIcon,
  FileCode,
  Server,
  Database,
  Wifi,
  ArrowUp,
  ArrowDown,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Filter,
  MoreVertical,
  Palette,
  Type,
  Link,
  Code,
  Box,
  FileText,
  Lock,
  Accessibility,
  Sparkles
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

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

export default function PerformanceClient() {
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

  // Run test simulation
  const handleRunTest = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setShowRunDialog(false)
    }, 3000)
  }

  // Copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(testUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const currentTest = selectedTest || mockPageTests[0]

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
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
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
    </div>
  )
}
