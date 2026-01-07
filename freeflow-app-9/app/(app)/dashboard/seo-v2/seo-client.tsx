'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Globe,
  Award,
  BarChart3,
  Link,
  Link2Off,
  FileText,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Lightbulb,
  RefreshCw,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  DollarSign,
  Layers,
  FileSearch,
  ShieldCheck,
  Download,
  Settings,
  MoreHorizontal,
  Star,
  Flag,
  Copy,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  LineChart,
  Bell,
  MessageSquare
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Types
type KeywordDifficulty = 'easy' | 'medium' | 'hard' | 'very_hard'
type KeywordTrend = 'up' | 'down' | 'stable' | 'new'
type BacklinkStatus = 'active' | 'lost' | 'new' | 'broken'
type BacklinkType = 'dofollow' | 'nofollow' | 'ugc' | 'sponsored'
type IssuesSeverity = 'critical' | 'warning' | 'notice' | 'passed'
type ContentStatus = 'performing' | 'declining' | 'opportunity' | 'underperforming'

interface Keyword {
  id: string
  keyword: string
  currentPosition: number | null
  previousPosition: number | null
  bestPosition: number
  searchVolume: number
  difficulty: number
  difficultyLabel: KeywordDifficulty
  cpc: number
  trend: KeywordTrend
  traffic: number
  trafficValue: number
  url: string
  serpFeatures: string[]
  lastUpdated: string
  isTracked: boolean
}

interface Backlink {
  id: string
  sourceDomain: string
  sourceUrl: string
  targetUrl: string
  anchorText: string
  domainRating: number
  pageRating: number
  traffic: number
  type: BacklinkType
  status: BacklinkStatus
  firstSeen: string
  lastChecked: string
  isNew: boolean
}

interface Competitor {
  id: string
  domain: string
  organicTraffic: number
  organicKeywords: number
  paidTraffic: number
  paidKeywords: number
  domainRating: number
  commonKeywords: number
  keywordGap: number
  backlinks: number
  trafficTrend: number
}

interface ContentPage {
  id: string
  url: string
  title: string
  traffic: number
  keywords: number
  position: number
  backlinks: number
  wordCount: number
  lastUpdated: string
  status: ContentStatus
  score: number
  opportunities: string[]
}

interface AuditIssue {
  id: string
  category: string
  issue: string
  severity: IssuesSeverity
  affectedPages: number
  description: string
  howToFix: string
  priority: number
}

interface SerpFeature {
  name: string
  icon: string
  keywords: number
  winning: number
}

// Helper functions
const getDifficultyColor = (difficulty: KeywordDifficulty): string => {
  const colors: Record<KeywordDifficulty, string> = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    very_hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[difficulty]
}

const getPositionColor = (position: number | null): string => {
  if (!position) return 'text-gray-400'
  if (position <= 3) return 'text-green-600 font-bold'
  if (position <= 10) return 'text-blue-600'
  if (position <= 20) return 'text-yellow-600'
  if (position <= 50) return 'text-orange-600'
  return 'text-gray-500'
}

const getBacklinkStatusColor = (status: BacklinkStatus): string => {
  const colors: Record<BacklinkStatus, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    broken: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  }
  return colors[status]
}

const getSeverityColor = (severity: IssuesSeverity): string => {
  const colors: Record<IssuesSeverity, string> = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    notice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
  return colors[severity]
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Mock data
const mockKeywords: Keyword[] = [
  {
    id: 'k1',
    keyword: 'project management software',
    currentPosition: 3,
    previousPosition: 5,
    bestPosition: 2,
    searchVolume: 74000,
    difficulty: 67,
    difficultyLabel: 'hard',
    cpc: 15.50,
    trend: 'up',
    traffic: 12500,
    trafficValue: 193750,
    url: '/project-management',
    serpFeatures: ['featured_snippet', 'people_also_ask', 'sitelinks'],
    lastUpdated: '2024-01-15',
    isTracked: true
  },
  {
    id: 'k2',
    keyword: 'team collaboration tools',
    currentPosition: 7,
    previousPosition: 7,
    bestPosition: 5,
    searchVolume: 33100,
    difficulty: 54,
    difficultyLabel: 'medium',
    cpc: 12.30,
    trend: 'stable',
    traffic: 4200,
    trafficValue: 51660,
    url: '/collaboration',
    serpFeatures: ['people_also_ask', 'reviews'],
    lastUpdated: '2024-01-15',
    isTracked: true
  },
  {
    id: 'k3',
    keyword: 'free project tracking',
    currentPosition: 12,
    previousPosition: 18,
    bestPosition: 10,
    searchVolume: 14800,
    difficulty: 35,
    difficultyLabel: 'easy',
    cpc: 8.20,
    trend: 'up',
    traffic: 890,
    trafficValue: 7298,
    url: '/free-tracking',
    serpFeatures: ['people_also_ask'],
    lastUpdated: '2024-01-15',
    isTracked: true
  },
  {
    id: 'k4',
    keyword: 'agile project management',
    currentPosition: 15,
    previousPosition: 12,
    bestPosition: 8,
    searchVolume: 27100,
    difficulty: 72,
    difficultyLabel: 'hard',
    cpc: 18.90,
    trend: 'down',
    traffic: 1200,
    trafficValue: 22680,
    url: '/agile',
    serpFeatures: ['featured_snippet', 'knowledge_panel'],
    lastUpdated: '2024-01-15',
    isTracked: true
  },
  {
    id: 'k5',
    keyword: 'kanban board online',
    currentPosition: 5,
    previousPosition: 8,
    bestPosition: 4,
    searchVolume: 22200,
    difficulty: 48,
    difficultyLabel: 'medium',
    cpc: 10.40,
    trend: 'up',
    traffic: 3800,
    trafficValue: 39520,
    url: '/kanban',
    serpFeatures: ['sitelinks', 'image_pack'],
    lastUpdated: '2024-01-15',
    isTracked: true
  },
  {
    id: 'k6',
    keyword: 'task management app',
    currentPosition: 9,
    previousPosition: 11,
    bestPosition: 6,
    searchVolume: 49500,
    difficulty: 61,
    difficultyLabel: 'hard',
    cpc: 14.80,
    trend: 'up',
    traffic: 5500,
    trafficValue: 81400,
    url: '/task-management',
    serpFeatures: ['app_pack', 'people_also_ask'],
    lastUpdated: '2024-01-15',
    isTracked: true
  },
  {
    id: 'k7',
    keyword: 'work management platform',
    currentPosition: 21,
    previousPosition: 25,
    bestPosition: 18,
    searchVolume: 8100,
    difficulty: 55,
    difficultyLabel: 'medium',
    cpc: 16.20,
    trend: 'up',
    traffic: 320,
    trafficValue: 5184,
    url: '/work-management',
    serpFeatures: [],
    lastUpdated: '2024-01-15',
    isTracked: true
  },
  {
    id: 'k8',
    keyword: 'remote team software',
    currentPosition: null,
    previousPosition: 48,
    bestPosition: 35,
    searchVolume: 5400,
    difficulty: 42,
    difficultyLabel: 'medium',
    cpc: 11.50,
    trend: 'new',
    traffic: 0,
    trafficValue: 0,
    url: '/remote-teams',
    serpFeatures: [],
    lastUpdated: '2024-01-15',
    isTracked: true
  }
]

const mockBacklinks: Backlink[] = [
  { id: 'b1', sourceDomain: 'techcrunch.com', sourceUrl: 'https://techcrunch.com/best-pm-tools', targetUrl: '/project-management', anchorText: 'top project management software', domainRating: 93, pageRating: 45, traffic: 125000, type: 'dofollow', status: 'active', firstSeen: '2023-08-15', lastChecked: '2024-01-15', isNew: false },
  { id: 'b2', sourceDomain: 'forbes.com', sourceUrl: 'https://forbes.com/business-tools', targetUrl: '/', anchorText: 'leading collaboration platform', domainRating: 95, pageRating: 52, traffic: 89000, type: 'dofollow', status: 'active', firstSeen: '2023-09-22', lastChecked: '2024-01-15', isNew: false },
  { id: 'b3', sourceDomain: 'g2.com', sourceUrl: 'https://g2.com/categories/pm-software', targetUrl: '/reviews', anchorText: 'read reviews', domainRating: 91, pageRating: 61, traffic: 45000, type: 'dofollow', status: 'active', firstSeen: '2023-06-10', lastChecked: '2024-01-15', isNew: false },
  { id: 'b4', sourceDomain: 'capterra.com', sourceUrl: 'https://capterra.com/project-management', targetUrl: '/', anchorText: 'project management', domainRating: 88, pageRating: 55, traffic: 38000, type: 'dofollow', status: 'active', firstSeen: '2023-07-05', lastChecked: '2024-01-15', isNew: false },
  { id: 'b5', sourceDomain: 'producthunt.com', sourceUrl: 'https://producthunt.com/posts/app', targetUrl: '/', anchorText: 'check it out', domainRating: 90, pageRating: 42, traffic: 28000, type: 'nofollow', status: 'active', firstSeen: '2024-01-10', lastChecked: '2024-01-15', isNew: true },
  { id: 'b6', sourceDomain: 'medium.com', sourceUrl: 'https://medium.com/@author/pm-guide', targetUrl: '/blog/guide', anchorText: 'comprehensive guide', domainRating: 85, pageRating: 32, traffic: 5200, type: 'dofollow', status: 'new', firstSeen: '2024-01-12', lastChecked: '2024-01-15', isNew: true },
  { id: 'b7', sourceDomain: 'entrepreneur.com', sourceUrl: 'https://entrepreneur.com/tools', targetUrl: '/', anchorText: 'startup tools', domainRating: 92, pageRating: 48, traffic: 62000, type: 'dofollow', status: 'lost', firstSeen: '2023-05-20', lastChecked: '2024-01-15', isNew: false },
  { id: 'b8', sourceDomain: 'hackernews.com', sourceUrl: 'https://news.ycombinator.com/item', targetUrl: '/', anchorText: 'link', domainRating: 91, pageRating: 28, traffic: 3500, type: 'nofollow', status: 'broken', firstSeen: '2023-11-08', lastChecked: '2024-01-15', isNew: false }
]

const mockCompetitors: Competitor[] = [
  { id: 'c1', domain: 'asana.com', organicTraffic: 2450000, organicKeywords: 145000, paidTraffic: 89000, paidKeywords: 2100, domainRating: 91, commonKeywords: 8500, keywordGap: 42000, backlinks: 1250000, trafficTrend: 12.5 },
  { id: 'c2', domain: 'monday.com', organicTraffic: 1890000, organicKeywords: 98000, paidTraffic: 125000, paidKeywords: 3200, domainRating: 89, commonKeywords: 7200, keywordGap: 35000, backlinks: 890000, trafficTrend: 18.2 },
  { id: 'c3', domain: 'trello.com', organicTraffic: 3200000, organicKeywords: 187000, paidTraffic: 45000, paidKeywords: 890, domainRating: 92, commonKeywords: 12000, keywordGap: 58000, backlinks: 2100000, trafficTrend: -5.3 },
  { id: 'c4', domain: 'notion.so', organicTraffic: 4100000, organicKeywords: 225000, paidTraffic: 32000, paidKeywords: 650, domainRating: 90, commonKeywords: 9800, keywordGap: 72000, backlinks: 1850000, trafficTrend: 25.8 },
  { id: 'c5', domain: 'clickup.com', organicTraffic: 980000, organicKeywords: 65000, paidTraffic: 156000, paidKeywords: 4500, domainRating: 85, commonKeywords: 5400, keywordGap: 28000, backlinks: 520000, trafficTrend: 32.1 }
]

const mockContent: ContentPage[] = [
  { id: 'p1', url: '/project-management', title: 'Project Management Software', traffic: 45000, keywords: 850, position: 3, backlinks: 245, wordCount: 3500, lastUpdated: '2024-01-10', status: 'performing', score: 92, opportunities: ['Add FAQ section', 'Update screenshots'] },
  { id: 'p2', url: '/kanban', title: 'Online Kanban Board', traffic: 28000, keywords: 420, position: 5, backlinks: 156, wordCount: 2800, lastUpdated: '2024-01-08', status: 'performing', score: 88, opportunities: ['Add video tutorial'] },
  { id: 'p3', url: '/collaboration', title: 'Team Collaboration Tools', traffic: 15000, keywords: 310, position: 7, backlinks: 98, wordCount: 2200, lastUpdated: '2023-12-15', status: 'declining', score: 72, opportunities: ['Update content', 'Add internal links', 'Improve meta description'] },
  { id: 'p4', url: '/agile', title: 'Agile Project Management', traffic: 8500, keywords: 180, position: 15, backlinks: 67, wordCount: 1800, lastUpdated: '2023-11-20', status: 'underperforming', score: 58, opportunities: ['Expand content', 'Add case studies', 'Target featured snippet'] },
  { id: 'p5', url: '/blog/guide', title: 'Complete PM Guide', traffic: 12000, keywords: 250, position: 8, backlinks: 89, wordCount: 5200, lastUpdated: '2024-01-05', status: 'performing', score: 85, opportunities: ['Add infographics'] },
  { id: 'p6', url: '/pricing', title: 'Pricing Plans', traffic: 35000, keywords: 45, position: 2, backlinks: 34, wordCount: 1200, lastUpdated: '2024-01-12', status: 'performing', score: 90, opportunities: [] }
]

const mockAuditIssues: AuditIssue[] = [
  { id: 'a1', category: 'Performance', issue: 'Slow page load time', severity: 'critical', affectedPages: 12, description: 'Pages taking more than 4 seconds to load', howToFix: 'Optimize images, enable compression, use CDN', priority: 1 },
  { id: 'a2', category: 'SEO', issue: 'Missing meta descriptions', severity: 'warning', affectedPages: 45, description: 'Pages without meta descriptions', howToFix: 'Add unique meta descriptions to all pages', priority: 2 },
  { id: 'a3', category: 'SEO', issue: 'Duplicate title tags', severity: 'warning', affectedPages: 8, description: 'Multiple pages with identical titles', howToFix: 'Create unique titles for each page', priority: 3 },
  { id: 'a4', category: 'Links', issue: 'Broken internal links', severity: 'critical', affectedPages: 23, description: 'Internal links pointing to 404 pages', howToFix: 'Fix or remove broken links', priority: 1 },
  { id: 'a5', category: 'Images', issue: 'Missing alt text', severity: 'warning', affectedPages: 67, description: 'Images without alt attributes', howToFix: 'Add descriptive alt text to all images', priority: 4 },
  { id: 'a6', category: 'Mobile', issue: 'Viewport not set', severity: 'notice', affectedPages: 3, description: 'Pages missing viewport meta tag', howToFix: 'Add viewport meta tag', priority: 5 },
  { id: 'a7', category: 'Security', issue: 'HTTPS enabled', severity: 'passed', affectedPages: 0, description: 'All pages served over HTTPS', howToFix: '', priority: 0 },
  { id: 'a8', category: 'Structured Data', issue: 'Schema markup errors', severity: 'notice', affectedPages: 5, description: 'Invalid structured data on some pages', howToFix: 'Fix schema markup validation errors', priority: 6 }
]

interface SEOClientProps {
  initialKeywords?: Keyword[]
  initialBacklinks?: Backlink[]
}

// Enhanced Competitive Upgrade Mock Data
const mockSEOAIInsights = [
  { id: '1', type: 'success' as const, title: 'Rankings Up', description: '15 keywords moved to page 1 this month. Organic traffic +32%.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Rankings' },
  { id: '2', type: 'info' as const, title: 'Content Gap', description: '8 high-value keywords identified. Competitors ranking, you are not.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Opportunity' },
  { id: '3', type: 'warning' as const, title: 'Lost Backlinks', description: '5 high-DA backlinks lost this week. Outreach recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Backlinks' },
]

const mockSEOCollaborators = [
  { id: '1', name: 'SEO Lead', avatar: '/avatars/seo.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Content Writer', avatar: '/avatars/content.jpg', status: 'online' as const, role: 'Writer' },
  { id: '3', name: 'Link Builder', avatar: '/avatars/links.jpg', status: 'busy' as const, role: 'Outreach' },
]

const mockSEOPredictions = [
  { id: '1', title: 'Traffic Growth', prediction: '+45% organic traffic by Q2', confidence: 72, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Domain Authority', prediction: 'DA 55 achievable in 6 months', confidence: 68, trend: 'up' as const, impact: 'medium' as const },
]

const mockSEOActivities = [
  { id: '1', user: 'Rank Tracker', action: 'Keyword ranked #1', target: '"best project management"', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Backlink Monitor', action: 'New backlink from', target: 'TechCrunch (DA 94)', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Content Team', action: 'Published article', target: '15 Best Tools Guide', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockSEOQuickActions = [
  { id: '1', label: 'Add Keyword', icon: 'plus', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening keyword form...', success: 'Enter keywords to track rankings', error: 'Failed to open' }), variant: 'default' as const },
  { id: '2', label: 'Site Audit', icon: 'search', action: () => toast.promise(new Promise(r => setTimeout(r, 3000)), { loading: 'Running site audit...', success: '85/100 SEO score - 12 issues found', error: 'Audit failed' }), variant: 'default' as const },
  { id: '3', label: 'Competitor Analysis', icon: 'users', action: () => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Analyzing competitors...', success: 'Competitor analysis complete - view gaps report', error: 'Analysis failed' }), variant: 'outline' as const },
]

export default function SEOClient({ initialKeywords, initialBacklinks }: SEOClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords)
  const [backlinks] = useState<Backlink[]>(mockBacklinks)
  const [competitors] = useState<Competitor[]>(mockCompetitors)
  const [content] = useState<ContentPage[]>(mockContent)
  const [auditIssues] = useState<AuditIssue[]>(mockAuditIssues)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null)
  const [showKeywordDialog, setShowKeywordDialog] = useState(false)
  const [selectedBacklinks, setSelectedBacklinks] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'position' | 'volume' | 'traffic'>('position')
  const [settingsTab, setSettingsTab] = useState('general')

  // Computed values
  const totalTraffic = useMemo(() => keywords.reduce((sum, k) => sum + k.traffic, 0), [keywords])
  const totalTrafficValue = useMemo(() => keywords.reduce((sum, k) => sum + k.trafficValue, 0), [keywords])
  const top10Keywords = useMemo(() => keywords.filter(k => k.currentPosition && k.currentPosition <= 10).length, [keywords])
  const avgPosition = useMemo(() => {
    const positioned = keywords.filter(k => k.currentPosition)
    return positioned.length ? positioned.reduce((sum, k) => sum + (k.currentPosition || 0), 0) / positioned.length : 0
  }, [keywords])

  const activeBacklinks = useMemo(() => backlinks.filter(b => b.status === 'active').length, [backlinks])
  const newBacklinks = useMemo(() => backlinks.filter(b => b.isNew).length, [backlinks])
  const lostBacklinks = useMemo(() => backlinks.filter(b => b.status === 'lost').length, [backlinks])

  const criticalIssues = useMemo(() => auditIssues.filter(i => i.severity === 'critical').length, [auditIssues])
  const warnings = useMemo(() => auditIssues.filter(i => i.severity === 'warning').length, [auditIssues])
  const healthScore = useMemo(() => {
    const passed = auditIssues.filter(i => i.severity === 'passed').length
    return Math.round((passed / auditIssues.length) * 100)
  }, [auditIssues])

  const filteredKeywords = useMemo(() => {
    let result = keywords
    if (searchQuery) {
      result = result.filter(k => k.keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return result.sort((a, b) => {
      if (sortBy === 'position') return (a.currentPosition || 100) - (b.currentPosition || 100)
      if (sortBy === 'volume') return b.searchVolume - a.searchVolume
      return b.traffic - a.traffic
    })
  }, [keywords, searchQuery, sortBy])

  const openKeywordDetail = (keyword: Keyword) => {
    setSelectedKeyword(keyword)
    setShowKeywordDialog(true)
  }

  const toggleBacklinkSelection = (id: string) => {
    const newSet = new Set(selectedBacklinks)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedBacklinks(newSet)
  }

  // Stat cards
  const statCards = [
    { label: 'Organic Traffic', value: formatNumber(totalTraffic), icon: Eye, color: 'from-blue-500 to-indigo-600', change: '+18.5%' },
    { label: 'Traffic Value', value: `$${formatNumber(totalTrafficValue)}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', change: '+24.2%' },
    { label: 'Keywords', value: keywords.length.toString(), icon: Search, color: 'from-purple-500 to-violet-600', change: '+12' },
    { label: 'Top 10', value: top10Keywords.toString(), icon: Award, color: 'from-yellow-500 to-orange-600', change: '+3' },
    { label: 'Avg Position', value: avgPosition.toFixed(1), icon: TrendingUp, color: 'from-pink-500 to-rose-600', change: '-2.3' },
    { label: 'Backlinks', value: activeBacklinks.toString(), icon: Link, color: 'from-cyan-500 to-blue-600', change: `+${newBacklinks}` },
    { label: 'Domain Rating', value: '76', icon: Globe, color: 'from-teal-500 to-cyan-600', change: '+2' },
    { label: 'Health Score', value: `${healthScore}%`, icon: ShieldCheck, color: 'from-emerald-500 to-green-600', change: '+5%' }
  ]

  // Handlers
  const handleRunAnalysis = () => toast.promise(new Promise(r => setTimeout(r, 2500)), { loading: 'Analyzing SEO...', success: 'SEO analysis complete', error: 'Analysis failed' })
  const handleOptimize = (n: string) => toast.promise(new Promise(r => setTimeout(r, 1800)), { loading: `Optimizing "${n}"...`, success: `"${n}" optimized successfully`, error: 'Optimization failed' })
  const handleGenerateSitemap = () => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Generating sitemap...', success: 'Sitemap updated successfully', error: 'Sitemap generation failed' })
  const handleExportReport = () => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Exporting report...', success: 'Report downloaded successfully', error: 'Export failed' })

  // Toast handlers for unconnected buttons
  const handleOptimizePage = (pageName: string) => {
    toast.promise(new Promise(r => setTimeout(r, 1800)), { loading: `Optimizing "${pageName}"...`, success: `"${pageName}" optimized successfully`, error: 'Optimization failed' })
  }
  const handleAddKeywords = () => {
    toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Opening keyword research tool...', success: 'Keyword research tool ready', error: 'Failed to open tool' })
  }
  const handleUpdateRankings = () => {
    toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Fetching latest keyword positions...', success: 'Rankings updated successfully', error: 'Failed to update rankings' })
  }
  const handleFindProspects = () => {
    toast.promise(new Promise(r => setTimeout(r, 2200)), { loading: 'Searching for backlink opportunities...', success: 'Found 15 backlink prospects', error: 'Search failed' })
  }
  const handleAddCompetitor = () => {
    toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Opening competitor form...', success: 'Enter competitor domain to analyze', error: 'Failed to open form' })
  }
  const handleAnalyzeCompetitor = (domain: string) => {
    toast.promise(new Promise(r => setTimeout(r, 2500)), { loading: `Analyzing ${domain}...`, success: `${domain} analysis complete`, error: 'Analysis failed' })
  }
  const handleCreateContent = () => {
    toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Opening content editor...', success: 'Content editor ready', error: 'Failed to open editor' })
  }
  const handleRunAudit = () => {
    toast.promise(new Promise(r => setTimeout(r, 3000)), { loading: 'Starting site crawl and analysis...', success: 'Site audit complete - 12 issues found', error: 'Audit failed' })
  }
  const handleSaveSettings = (section: string) => {
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: `Saving ${section} settings...`, success: `${section} settings saved successfully`, error: 'Failed to save settings' })
  }
  const handleExportData = (type: string) => {
    toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: `Exporting ${type}...`, success: `${type} export downloaded successfully`, error: 'Export failed' })
  }
  const handleRecrawlSite = () => {
    toast.promise(new Promise(r => setTimeout(r, 3500)), { loading: 'Starting fresh site crawl...', success: 'Site crawl complete - 1,247 pages analyzed', error: 'Crawl failed' })
  }
  const handleClearData = () => {
    toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Clearing SEO data...', success: 'All SEO data cleared', error: 'Failed to clear data' })
  }
  const handleResetSettings = () => {
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Resetting settings...', success: 'Settings reset to defaults', error: 'Failed to reset settings' })
  }
  const handleViewHistory = () => {
    toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Loading keyword ranking history...', success: 'History loaded', error: 'Failed to load history' })
  }
  const handleViewCompetitors = () => {
    toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Loading competitor analysis...', success: 'Competitor data loaded', error: 'Failed to load competitors' })
  }
  const handleCopyKeyword = () => {
    toast.promise(new Promise(r => setTimeout(r, 300)), { loading: 'Copying...', success: 'Keyword copied to clipboard', error: 'Failed to copy' })
  }
  const handleViewSerp = () => {
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Opening search results page...', success: 'SERP view opened', error: 'Failed to open SERP' })
  }
  const handleImplementInsight = (title: string) => {
    toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: `Starting implementation for "${title}"...`, success: `"${title}" implementation started`, error: 'Implementation failed' })
  }
  const handleConnectIntegration = (name: string) => {
    toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: `Connecting to ${name}...`, success: `${name} connected successfully`, error: 'Connection failed' })
  }
  const handleConfigureIntegration = (name: string) => {
    toast.promise(new Promise(r => setTimeout(r, 600)), { loading: `Opening ${name} configuration...`, success: `${name} configuration ready`, error: 'Failed to open configuration' })
  }
  const handleKeywordOptions = (keyword: Keyword) => {
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: `Loading options for "${keyword.keyword}"...`, success: `Options: Track, Export, Analyze, Remove`, error: 'Failed to load options' })
  }
  const handleBacklinkOptions = (backlink: Backlink) => {
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: `Loading options for "${backlink.sourceDomain}"...`, success: `Options: Check status, Export, Disavow, Remove`, error: 'Failed to load options' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Search className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SEO Dashboard</h1>
              <p className="text-muted-foreground">Search engine optimization analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={handleExportReport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleUpdateRankings}>
              <RefreshCw className="w-4 h-4" />
              Update
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2" onClick={handleAddKeywords}>
              <Plus className="w-4 h-4" />
              Add Keywords
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-xs font-medium ${stat.change.startsWith('+') || stat.change.startsWith('-') && !stat.change.includes('-') ? 'text-green-500' : stat.change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* SEO Overview Banner */}
        <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">SEMrush-Level SEO Analytics</h2>
                  <p className="text-blue-100 mt-1">Track rankings, analyze backlinks, audit your site, and outperform competitors</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">{keywords.length}</div>
                  <div className="text-sm text-blue-100">Tracked Keywords</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{top10Keywords}</div>
                  <div className="text-sm text-blue-100">Top 10 Rankings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{activeBacklinks}</div>
                  <div className="text-sm text-blue-100">Active Backlinks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{healthScore}%</div>
                  <div className="text-sm text-blue-100">Site Health</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { icon: Search, label: 'Keyword Research', desc: 'Find opportunities', color: 'from-blue-500 to-indigo-600' },
            { icon: Link, label: 'Link Building', desc: 'Acquire backlinks', color: 'from-green-500 to-emerald-600' },
            { icon: Target, label: 'Rank Tracking', desc: 'Monitor positions', color: 'from-purple-500 to-violet-600' },
            { icon: Users, label: 'Competitor Spy', desc: 'Analyze rivals', color: 'from-orange-500 to-red-600' },
            { icon: FileText, label: 'Content Optimizer', desc: 'Improve content', color: 'from-pink-500 to-rose-600' },
            { icon: ShieldCheck, label: 'Site Audit', desc: 'Fix issues', color: 'from-cyan-500 to-blue-600' },
            { icon: TrendingUp, label: 'SERP Analysis', desc: 'Search results', color: 'from-teal-500 to-cyan-600' },
            { icon: BarChart3, label: 'SEO Reports', desc: 'Generate reports', color: 'from-amber-500 to-orange-600' }
          ].map((action, idx) => (
            <Card key={idx} className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="keywords" className="gap-2">
              <Target className="w-4 h-4" />
              Keywords
              <Badge variant="secondary" className="ml-1">{keywords.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="backlinks" className="gap-2">
              <Link className="w-4 h-4" />
              Backlinks
              <Badge variant="secondary" className="ml-1">{backlinks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-2">
              <Users className="w-4 h-4" />
              Competitors
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              Site Audit
              {criticalIssues > 0 && <Badge variant="destructive" className="ml-1">{criticalIssues}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Position Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Position Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Top 3', count: keywords.filter(k => k.currentPosition && k.currentPosition <= 3).length, color: 'bg-green-500' },
                      { label: 'Top 10', count: keywords.filter(k => k.currentPosition && k.currentPosition <= 10 && k.currentPosition > 3).length, color: 'bg-blue-500' },
                      { label: 'Top 20', count: keywords.filter(k => k.currentPosition && k.currentPosition <= 20 && k.currentPosition > 10).length, color: 'bg-yellow-500' },
                      { label: 'Top 50', count: keywords.filter(k => k.currentPosition && k.currentPosition <= 50 && k.currentPosition > 20).length, color: 'bg-orange-500' },
                      { label: '50+', count: keywords.filter(k => k.currentPosition && k.currentPosition > 50).length, color: 'bg-gray-500' }
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm flex-1">{item.label}</span>
                        <span className="font-bold">{item.count}</span>
                        <Progress value={(item.count / keywords.length) * 100} className="w-24" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {keywords.filter(k => k.currentPosition).sort((a, b) => (a.currentPosition || 100) - (b.currentPosition || 100)).slice(0, 5).map(keyword => (
                      <div key={keyword.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => openKeywordDetail(keyword)}>
                        <span className={`text-lg font-bold w-8 ${getPositionColor(keyword.currentPosition)}`}>
                          #{keyword.currentPosition}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{keyword.keyword}</p>
                          <p className="text-xs text-muted-foreground">{formatNumber(keyword.searchVolume)} vol</p>
                        </div>
                        {keyword.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
                        {keyword.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
                        {keyword.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Backlinks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Backlinks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backlinks.filter(b => b.isNew || b.status === 'new').slice(0, 5).map(backlink => (
                      <div key={backlink.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{backlink.sourceDomain}</p>
                          <p className="text-xs text-muted-foreground">DR {backlink.domainRating}</p>
                        </div>
                        <Badge className={getBacklinkStatusColor(backlink.status)}>{backlink.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SERP Features */}
            <Card>
              <CardHeader>
                <CardTitle>SERP Features Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { name: 'Featured Snippet', keywords: 45, winning: 12, icon: Star },
                    { name: 'People Also Ask', keywords: 128, winning: 34, icon: FileSearch },
                    { name: 'Sitelinks', keywords: 23, winning: 18, icon: Link },
                    { name: 'Image Pack', keywords: 67, winning: 8, icon: Layers },
                    { name: 'Video', keywords: 34, winning: 5, icon: Activity },
                    { name: 'Local Pack', keywords: 12, winning: 3, icon: Globe }
                  ].map(feature => (
                    <div key={feature.name} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <feature.icon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{feature.name}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{feature.winning}</p>
                          <p className="text-xs text-muted-foreground">winning</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{feature.keywords}</p>
                          <p className="text-xs text-muted-foreground">opportunities</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO Insights & Recommendations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    SEO Insights & Recommendations
                  </CardTitle>
                  <Badge variant="secondary">{6} new insights</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Content Opportunity', description: 'Your competitors rank for 234 keywords you are not targeting. Consider expanding your content strategy.', priority: 'high', impact: '+45% potential traffic' },
                    { title: 'Quick Win Keywords', description: '18 keywords are ranking on page 2 (positions 11-20). Small optimizations could push them to page 1.', priority: 'high', impact: '+2,400 monthly visitors' },
                    { title: 'Featured Snippet Opportunities', description: '12 keywords have featured snippet potential. Restructure content with clear answers and lists.', priority: 'medium', impact: '+35% CTR' },
                    { title: 'Mobile Optimization', description: 'Page speed on mobile is affecting 8 important landing pages. Consider lazy loading images.', priority: 'medium', impact: '+15% rankings' },
                    { title: 'Internal Linking', description: '23 pages have fewer than 3 internal links. Improve internal linking to distribute page authority.', priority: 'low', impact: '+8% crawl efficiency' },
                    { title: 'Schema Markup', description: 'Add FAQ schema to 15 blog posts to improve SERP visibility and CTR.', priority: 'low', impact: '+12% CTR' }
                  ].map((insight, idx) => (
                    <div key={idx} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{insight.title}</span>
                            <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium text-green-600">{insight.impact}</div>
                          <Button size="sm" variant="outline" className="mt-2" onClick={() => handleImplementInsight(insight.title)}>Implement</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ranking Trends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Ranking Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { week: 'This Week', improved: 24, declined: 8, unchanged: 68 },
                      { week: 'Last Week', improved: 18, declined: 12, unchanged: 70 },
                      { week: '2 Weeks Ago', improved: 31, declined: 5, unchanged: 64 },
                      { week: '3 Weeks Ago', improved: 15, declined: 20, unchanged: 65 }
                    ].map((week, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-sm w-24">{week.week}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-xs text-green-600 w-12 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />{week.improved}
                          </span>
                          <span className="text-xs text-red-600 w-12 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />{week.declined}
                          </span>
                          <span className="text-xs text-gray-500 w-12">={week.unchanged}</span>
                          <Progress value={(week.improved / (week.improved + week.declined + week.unchanged)) * 100} className="flex-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Movers This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { keyword: 'project management software', change: +12, from: 25, to: 13 },
                      { keyword: 'team collaboration tools', change: +8, from: 18, to: 10 },
                      { keyword: 'freelance invoicing', change: +6, from: 14, to: 8 },
                      { keyword: 'client portal solution', change: -4, from: 7, to: 11 },
                      { keyword: 'time tracking app', change: +15, from: 32, to: 17 }
                    ].map((mover, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{mover.keyword}</p>
                          <p className="text-xs text-muted-foreground">#{mover.from} → #{mover.to}</p>
                        </div>
                        <Badge className={mover.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {mover.change > 0 ? '+' : ''}{mover.change}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-4">
            {/* Keywords Banner */}
            <Card className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Keyword Research & Tracking</h3>
                      <p className="text-purple-100 text-sm">Track {keywords.length} keywords across {keywords.filter(k => k.currentPosition && k.currentPosition <= 10).length} top 10 positions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatNumber(totalTraffic)}</div>
                      <div className="text-xs text-purple-100">Monthly Traffic</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">${formatNumber(totalTrafficValue)}</div>
                      <div className="text-xs text-purple-100">Traffic Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{avgPosition.toFixed(1)}</div>
                      <div className="text-xs text-purple-100">Avg Position</div>
                    </div>
                    <Button className="bg-white text-purple-600 hover:bg-purple-50 gap-2" onClick={handleAddKeywords}>
                      <Plus className="w-4 h-4" />
                      Add Keywords
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Keyword Rankings</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant={sortBy === 'position' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('position')}>Position</Button>
                    <Button variant={sortBy === 'volume' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('volume')}>Volume</Button>
                    <Button variant={sortBy === 'traffic' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('traffic')}>Traffic</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="p-3">Keyword</th>
                        <th className="p-3 text-center">Position</th>
                        <th className="p-3 text-center">Change</th>
                        <th className="p-3 text-right">Volume</th>
                        <th className="p-3 text-center">KD</th>
                        <th className="p-3 text-right">Traffic</th>
                        <th className="p-3 text-right">CPC</th>
                        <th className="p-3">URL</th>
                        <th className="p-3">Features</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKeywords.map(keyword => {
                        const posChange = keyword.previousPosition && keyword.currentPosition
                          ? keyword.previousPosition - keyword.currentPosition
                          : null
                        return (
                          <tr key={keyword.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => openKeywordDetail(keyword)}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{keyword.keyword}</span>
                                {keyword.isTracked && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-lg font-bold ${getPositionColor(keyword.currentPosition)}`}>
                                {keyword.currentPosition || '-'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {posChange !== null && (
                                <span className={`flex items-center justify-center gap-1 ${posChange > 0 ? 'text-green-500' : posChange < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                  {posChange > 0 && <ArrowUp className="w-3 h-3" />}
                                  {posChange < 0 && <ArrowDown className="w-3 h-3" />}
                                  {posChange === 0 && <Minus className="w-3 h-3" />}
                                  {Math.abs(posChange)}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right font-medium">{formatNumber(keyword.searchVolume)}</td>
                            <td className="p-3 text-center">
                              <Badge className={getDifficultyColor(keyword.difficultyLabel)}>
                                {keyword.difficulty}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-medium">{formatNumber(keyword.traffic)}</td>
                            <td className="p-3 text-right">${keyword.cpc.toFixed(2)}</td>
                            <td className="p-3">
                              <span className="text-xs text-blue-600 hover:underline">{keyword.url}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                {keyword.serpFeatures.slice(0, 2).map(f => (
                                  <Badge key={f} variant="outline" className="text-xs">{f.split('_')[0]}</Badge>
                                ))}
                                {keyword.serpFeatures.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{keyword.serpFeatures.length - 2}</Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleKeywordOptions(keyword) }}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backlinks Tab */}
          <TabsContent value="backlinks" className="space-y-4">
            {/* Backlinks Banner */}
            <Card className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Link className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Backlink Profile Analysis</h3>
                      <p className="text-green-100 text-sm">Monitor {activeBacklinks} active backlinks from {new Set(backlinks.map(b => b.sourceDomain)).size} referring domains</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">76</div>
                      <div className="text-xs text-green-100">Domain Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">+{newBacklinks}</div>
                      <div className="text-xs text-green-100">New (30 days)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-200">-{lostBacklinks}</div>
                      <div className="text-xs text-green-100">Lost</div>
                    </div>
                    <Button className="bg-white text-green-600 hover:bg-green-50 gap-2" onClick={handleFindProspects}>
                      <Plus className="w-4 h-4" />
                      Find Prospects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Link className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeBacklinks}</p>
                    <p className="text-xs text-muted-foreground">Active Backlinks</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">+{newBacklinks}</p>
                    <p className="text-xs text-muted-foreground">New (30 days)</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Link2Off className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">-{lostBacklinks}</p>
                    <p className="text-xs text-muted-foreground">Lost (30 days)</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{new Set(backlinks.map(b => b.sourceDomain)).size}</p>
                    <p className="text-xs text-muted-foreground">Referring Domains</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800">
                        <th className="p-3 w-8">
                          <Checkbox />
                        </th>
                        <th className="p-3">Source</th>
                        <th className="p-3 text-center">DR</th>
                        <th className="p-3 text-center">Traffic</th>
                        <th className="p-3">Anchor</th>
                        <th className="p-3">Target</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">First Seen</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {backlinks.map(backlink => (
                        <tr key={backlink.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-3">
                            <Checkbox
                              checked={selectedBacklinks.has(backlink.id)}
                              onCheckedChange={() => toggleBacklinkSelection(backlink.id)}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-blue-500" />
                              <div>
                                <p className="font-medium">{backlink.sourceDomain}</p>
                                <a href={backlink.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                  View page <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${backlink.domainRating >= 70 ? 'text-green-600' : backlink.domainRating >= 40 ? 'text-yellow-600' : 'text-gray-600'}`}>
                              {backlink.domainRating}
                            </span>
                          </td>
                          <td className="p-3 text-center">{formatNumber(backlink.traffic)}</td>
                          <td className="p-3">
                            <span className="text-sm">{backlink.anchorText}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-blue-600">{backlink.targetUrl}</span>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{backlink.type}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={getBacklinkStatusColor(backlink.status)}>{backlink.status}</Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{backlink.firstSeen}</td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleBacklinkOptions(backlink)}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-4">
            {/* Competitors Banner */}
            <Card className="bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Competitor Intelligence</h3>
                      <p className="text-orange-100 text-sm">Analyze {competitors.length} competitors and discover keyword gaps</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{competitors.reduce((sum, c) => sum + c.keywordGap, 0)}</div>
                      <div className="text-xs text-orange-100">Keyword Gaps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{competitors.reduce((sum, c) => sum + c.commonKeywords, 0)}</div>
                      <div className="text-xs text-orange-100">Common Keywords</div>
                    </div>
                    <Button className="bg-white text-orange-600 hover:bg-orange-50 gap-2" onClick={handleAddCompetitor}>
                      <Plus className="w-4 h-4" />
                      Add Competitor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>Compare your domain with competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="p-3">Domain</th>
                        <th className="p-3 text-right">Organic Traffic</th>
                        <th className="p-3 text-right">Keywords</th>
                        <th className="p-3 text-center">DR</th>
                        <th className="p-3 text-right">Common Keywords</th>
                        <th className="p-3 text-right">Keyword Gap</th>
                        <th className="p-3 text-right">Backlinks</th>
                        <th className="p-3 text-center">Trend</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitors.map(comp => (
                        <tr key={comp.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{comp.domain}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-medium">{formatNumber(comp.organicTraffic)}</td>
                          <td className="p-3 text-right">{formatNumber(comp.organicKeywords)}</td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-green-600">{comp.domainRating}</span>
                          </td>
                          <td className="p-3 text-right text-blue-600">{formatNumber(comp.commonKeywords)}</td>
                          <td className="p-3 text-right text-orange-600">{formatNumber(comp.keywordGap)}</td>
                          <td className="p-3 text-right">{formatNumber(comp.backlinks)}</td>
                          <td className="p-3 text-center">
                            <span className={`flex items-center justify-center gap-1 ${comp.trafficTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {comp.trafficTrend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              {Math.abs(comp.trafficTrend)}%
                            </span>
                          </td>
                          <td className="p-3">
                            <Button variant="outline" size="sm" onClick={() => handleAnalyzeCompetitor(comp.domain)}>Analyze</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {/* Content Banner */}
            <Card className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Content Optimization</h3>
                      <p className="text-pink-100 text-sm">Optimize {content.length} pages for better rankings and engagement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{content.filter(c => c.status === 'performing').length}</div>
                      <div className="text-xs text-pink-100">Performing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-200">{content.filter(c => c.status === 'declining').length}</div>
                      <div className="text-xs text-pink-100">Declining</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{content.filter(c => c.status === 'opportunity').length}</div>
                      <div className="text-xs text-pink-100">Opportunities</div>
                    </div>
                    <Button className="bg-white text-pink-600 hover:bg-pink-50 gap-2" onClick={handleCreateContent}>
                      <Plus className="w-4 h-4" />
                      Create Content
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Analyze and optimize your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.map(page => (
                    <div key={page.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{page.title}</h4>
                            <Badge className={
                              page.status === 'performing' ? 'bg-green-100 text-green-700' :
                              page.status === 'declining' ? 'bg-yellow-100 text-yellow-700' :
                              page.status === 'opportunity' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {page.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-600">{page.url}</p>
                        </div>
                        <div className="flex items-center gap-6 text-center">
                          <div>
                            <p className="text-lg font-bold">{formatNumber(page.traffic)}</p>
                            <p className="text-xs text-muted-foreground">Traffic</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{page.keywords}</p>
                            <p className="text-xs text-muted-foreground">Keywords</p>
                          </div>
                          <div>
                            <p className={`text-lg font-bold ${getPositionColor(page.position)}`}>#{page.position}</p>
                            <p className="text-xs text-muted-foreground">Position</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{page.score}</p>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                        </div>
                      </div>
                      {page.opportunities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {page.opportunities.map((opp, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              {opp}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-4">
            {/* Site Audit Banner */}
            <Card className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Technical SEO Audit</h3>
                      <p className="text-cyan-100 text-sm">Crawled 1,247 pages and analyzed {auditIssues.length} issues</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{healthScore}%</div>
                      <div className="text-xs text-cyan-100">Health Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-200">{criticalIssues}</div>
                      <div className="text-xs text-cyan-100">Critical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-200">{warnings}</div>
                      <div className="text-xs text-cyan-100">Warnings</div>
                    </div>
                    <Button className="bg-white text-cyan-600 hover:bg-cyan-50 gap-2" onClick={handleRunAudit}>
                      <RefreshCw className="w-4 h-4" />
                      Run Audit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">{healthScore}%</p>
                  <p className="text-sm text-green-700">Health Score</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{criticalIssues}</p>
                    <p className="text-xs text-muted-foreground">Critical Issues</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{warnings}</p>
                    <p className="text-xs text-muted-foreground">Warnings</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{auditIssues.filter(i => i.severity === 'passed').length}</p>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Site Audit Issues</CardTitle>
                <CardDescription>Fix issues to improve your SEO health score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditIssues.sort((a, b) => a.priority - b.priority).map(issue => (
                    <div key={issue.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {issue.severity === 'critical' && <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                          {issue.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                          {issue.severity === 'notice' && <Flag className="w-5 h-5 text-blue-500 mt-0.5" />}
                          {issue.severity === 'passed' && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{issue.issue}</h4>
                              <Badge variant="outline">{issue.category}</Badge>
                              <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                            {issue.howToFix && (
                              <p className="text-sm text-blue-600 mt-2">
                                <strong>Fix:</strong> {issue.howToFix}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{issue.affectedPages}</p>
                          <p className="text-xs text-muted-foreground">pages</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Crawl Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crawl Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Pages Crawled', value: '1,247', progress: 100 },
                      { label: 'Pages Indexed', value: '1,156', progress: 93 },
                      { label: 'Pages with Issues', value: '234', progress: 19 },
                      { label: 'Pages Blocked', value: '42', progress: 3 },
                      { label: 'Orphan Pages', value: '18', progress: 1 }
                    ].map((stat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{stat.label}</span>
                          <span className="font-medium">{stat.value}</span>
                        </div>
                        <Progress value={stat.progress} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Core Web Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'LCP (Largest Contentful Paint)', value: '2.1s', status: 'good', target: '< 2.5s' },
                      { label: 'FID (First Input Delay)', value: '45ms', status: 'good', target: '< 100ms' },
                      { label: 'CLS (Cumulative Layout Shift)', value: '0.08', status: 'needs-improvement', target: '< 0.1' },
                      { label: 'TTFB (Time to First Byte)', value: '0.8s', status: 'good', target: '< 0.8s' },
                      { label: 'FCP (First Contentful Paint)', value: '1.4s', status: 'good', target: '< 1.8s' }
                    ].map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{metric.label}</p>
                          <p className="text-xs text-muted-foreground">Target: {metric.target}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{metric.value}</span>
                          <Badge className={metric.status === 'good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {metric.status === 'good' ? 'Good' : 'Needs Work'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <Card className="col-span-3 h-fit">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'crawling', icon: Globe, label: 'Crawling' },
                      { id: 'tracking', icon: Target, label: 'Tracking' },
                      { id: 'integrations', icon: Link, label: 'Integrations' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'advanced', icon: Layers, label: 'Advanced' },
                    ].map(item => (
                      <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${settingsTab === item.id ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <item.icon className="h-4 w-4" /><span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card>
                    <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Configure SEO tracking preferences</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Primary Domain</label><Input defaultValue="example.com" className="mt-1" /></div>
                        <div><label className="text-sm font-medium">Default Location</label><Input defaultValue="United States" className="mt-1" /></div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Daily rank tracking</p><p className="text-sm text-gray-500">Track keyword positions daily</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Auto-discover keywords</p><p className="text-sm text-gray-500">Find new ranking opportunities</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Competitor monitoring</p><p className="text-sm text-gray-500">Track competitor rankings</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Backlink monitoring</p><p className="text-sm text-gray-500">Monitor new and lost backlinks</p></div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveSettings('General')}>Save General Settings</Button>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'crawling' && (
                  <Card>
                    <CardHeader><CardTitle>Crawling Settings</CardTitle><CardDescription>Configure site audit and crawling behavior</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Crawl Frequency</label><Input defaultValue="Weekly" className="mt-1" /></div>
                        <div><label className="text-sm font-medium">Max Pages per Crawl</label><Input type="number" defaultValue="10000" className="mt-1" /></div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Follow robots.txt</p><p className="text-sm text-gray-500">Respect robots.txt directives</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">JavaScript rendering</p><p className="text-sm text-gray-500">Render JavaScript for SPA sites</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Check external links</p><p className="text-sm text-gray-500">Validate outbound links</p></div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveSettings('Crawling')}>Save Crawling Settings</Button>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'tracking' && (
                  <Card>
                    <CardHeader><CardTitle>Tracking Settings</CardTitle><CardDescription>Configure rank tracking and keyword monitoring</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { name: 'Desktop', desc: 'Google Desktop', enabled: true },
                          { name: 'Mobile', desc: 'Google Mobile', enabled: true },
                          { name: 'Local', desc: 'Local Pack', enabled: false },
                        ].map((device, i) => (
                          <Card key={i} className="border"><CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{device.name}</h4>
                              <Switch defaultChecked={device.enabled} />
                            </div>
                            <p className="text-sm text-gray-500">{device.desc}</p>
                          </CardContent></Card>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Track featured snippets</p><p className="text-sm text-gray-500">Monitor SERP features</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Track local pack</p><p className="text-sm text-gray-500">Monitor local search results</p></div>
                          <Switch />
                        </div>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveSettings('Tracking')}>Save Tracking Settings</Button>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'integrations' && (
                  <Card>
                    <CardHeader><CardTitle>Integrations</CardTitle><CardDescription>Connect with SEO tools and services</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: 'Google Search Console', status: 'connected', icon: '🔍' },
                          { name: 'Google Analytics', status: 'connected', icon: '📊' },
                          { name: 'Ahrefs', status: 'available', icon: '🔗' },
                          { name: 'SEMrush', status: 'available', icon: '📈' },
                        ].map((integration, i) => (
                          <Card key={i} className={`border ${integration.status === 'connected' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{integration.icon}</span>
                                  <h4 className="font-medium">{integration.name}</h4>
                                </div>
                                <Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{integration.status}</Badge>
                              </div>
                              <Button variant={integration.status === 'connected' ? 'outline' : 'default'} className="w-full" size="sm" onClick={() => integration.status === 'connected' ? handleConfigureIntegration(integration.name) : handleConnectIntegration(integration.name)}>
                                {integration.status === 'connected' ? 'Configure' : 'Connect'}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
                  <Card>
                    <CardHeader><CardTitle>Notification Settings</CardTitle><CardDescription>Configure SEO alerts and reports</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="border"><CardContent className="p-4 text-center">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <p className="font-medium">Email Alerts</p><p className="text-sm text-gray-500">Enabled</p>
                        </CardContent></Card>
                        <Card className="border"><CardContent className="p-4 text-center">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <p className="font-medium">Slack</p><p className="text-sm text-gray-500">Connected</p>
                        </CardContent></Card>
                        <Card className="border"><CardContent className="p-4 text-center">
                          <Globe className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <p className="font-medium">Weekly Reports</p><p className="text-sm text-gray-500">Enabled</p>
                        </CardContent></Card>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Ranking changes</p><p className="text-sm text-gray-500">Alert on significant position changes</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">New backlinks</p><p className="text-sm text-gray-500">Alert on new backlinks discovered</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Lost backlinks</p><p className="text-sm text-gray-500">Alert when backlinks are lost</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Site audit issues</p><p className="text-sm text-gray-500">Alert on critical SEO issues</p></div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveSettings('Notification')}>Save Notification Settings</Button>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card>
                    <CardHeader><CardTitle>Advanced Settings</CardTitle><CardDescription>Advanced configuration and data management</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">API Rate Limit</label><Input type="number" defaultValue="1000" className="mt-1" /></div>
                        <div><label className="text-sm font-medium">Data Retention (days)</label><Input type="number" defaultValue="365" className="mt-1" /></div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">Debug mode</p><p className="text-sm text-gray-500">Enable detailed logging</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div><p className="font-medium">API access</p><p className="text-sm text-gray-500">Enable REST API endpoints</p></div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Data Management</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" className="justify-start" onClick={() => handleExportData('Keywords')}><Download className="w-4 h-4 mr-2" />Export Keywords</Button>
                          <Button variant="outline" className="justify-start" onClick={() => handleExportData('Backlinks')}><Download className="w-4 h-4 mr-2" />Export Backlinks</Button>
                          <Button variant="outline" className="justify-start" onClick={() => handleExportData('Audit Report')}><Download className="w-4 h-4 mr-2" />Export Audit Report</Button>
                          <Button variant="outline" className="justify-start" onClick={handleRecrawlSite}><RefreshCw className="w-4 h-4 mr-2" />Re-crawl Site</Button>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h4>
                        <p className="text-sm text-red-600 dark:text-red-300 mb-3">These actions are irreversible.</p>
                        <div className="flex gap-3">
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleClearData}>Clear All Data</Button>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleResetSettings}>Reset Settings</Button>
                        </div>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveSettings('Advanced')}>Save Advanced Settings</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockSEOAIInsights}
              title="SEO Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockSEOCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockSEOPredictions}
              title="SEO Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockSEOActivities}
            title="SEO Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockSEOQuickActions}
            variant="grid"
          />
        </div>

        {/* Keyword Detail Dialog */}
        <Dialog open={showKeywordDialog} onOpenChange={setShowKeywordDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedKeyword?.keyword}</DialogTitle>
              <DialogDescription>Keyword performance details</DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Position History */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className={`text-3xl font-bold ${getPositionColor(selectedKeyword?.currentPosition ?? null)}`}>
                      {selectedKeyword?.currentPosition || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Current</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-3xl font-bold text-gray-600">{selectedKeyword?.previousPosition || '-'}</p>
                    <p className="text-xs text-muted-foreground">Previous</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{selectedKeyword?.bestPosition || '-'}</p>
                    <p className="text-xs text-muted-foreground">Best</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-3xl font-bold">{formatNumber(selectedKeyword?.traffic || 0)}</p>
                    <p className="text-xs text-muted-foreground">Traffic</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Search Volume</span>
                      <span className="font-bold">{formatNumber(selectedKeyword?.searchVolume || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Difficulty</span>
                      <Badge className={getDifficultyColor(selectedKeyword?.difficultyLabel || 'medium')}>
                        {selectedKeyword?.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CPC</span>
                      <span className="font-bold">${selectedKeyword?.cpc.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Traffic Value</span>
                      <span className="font-bold">${formatNumber(selectedKeyword?.trafficValue || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">URL</span>
                      <span className="text-xs text-blue-600">{selectedKeyword?.url}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm">{selectedKeyword?.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                {/* SERP Features */}
                {selectedKeyword?.serpFeatures && selectedKeyword.serpFeatures.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">SERP Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedKeyword.serpFeatures.map(feature => (
                        <Badge key={feature} variant="outline">
                          {feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={handleViewHistory}>
                  <LineChart className="w-4 h-4" /> View History
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleViewCompetitors}>
                  <Users className="w-4 h-4" /> Competitors
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={handleCopyKeyword}>
                  <Copy className="w-4 h-4" /> Copy
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleViewSerp}>
                  <ExternalLink className="w-4 h-4" /> View SERP
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
