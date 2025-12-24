'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
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
  RefreshCw,
  Trash2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  DollarSign,
  Layers,
  FileSearch,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  Filter,
  Download,
  Settings,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Star,
  Flag,
  Copy,
  Share2,
  Bookmark,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react'

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
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Update
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2">
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
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-4">
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
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                            <Button variant="outline" size="sm">Analyze</Button>
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
          </TabsContent>
        </Tabs>

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
                <Button variant="outline" size="sm" className="gap-1">
                  <LineChart className="w-4 h-4" /> View History
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Users className="w-4 h-4" /> Competitors
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Copy className="w-4 h-4" /> Copy
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
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
