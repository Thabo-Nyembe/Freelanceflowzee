"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Map,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  Star,
  Zap,
  Flag,
  Award,
  BarChart3,
  Plus,
  Eye,
  Layers,
  GitBranch,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  Package,
  Rocket,
  Settings,
  GanttChart,
  LayoutGrid,
  List,
  CalendarDays,
  Play,
  Pause,
  AlertTriangle,
  Link2,
  ExternalLink,
  Tag,
  Sparkles,
  Brain,
  TrendingDown,
  CircleDot,
  Timer,
  Building2,
  FileText,
  Send,
  Heart,
  Share2,
  Download,
  Upload
} from 'lucide-react'

// Types
type InitiativeStatus = 'backlog' | 'planned' | 'in_progress' | 'review' | 'released' | 'archived'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type ImpactLevel = 'transformational' | 'significant' | 'moderate' | 'minor'
type EffortLevel = 'xl' | 'large' | 'medium' | 'small'
type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
type ViewMode = 'timeline' | 'kanban' | 'list' | 'swimlane'
type ReleaseStatus = 'planning' | 'development' | 'testing' | 'staged' | 'released'

interface Feature {
  id: string
  title: string
  description: string
  status: InitiativeStatus
  priority: Priority
  impact: ImpactLevel
  effort: EffortLevel
  impactScore: number
  effortScore: number
  riceScore: number
  progress: number
  quarter: Quarter
  year: number
  releaseId?: string
  theme: string
  team: string
  owner: {
    id: string
    name: string
    avatar: string
  }
  votes: number
  comments: number
  dependencies: string[]
  tags: string[]
  customerRequests: number
  createdAt: Date
  updatedAt: Date
  targetDate?: Date
}

interface Release {
  id: string
  name: string
  version: string
  status: ReleaseStatus
  targetDate: Date
  features: string[]
  progress: number
  description: string
}

interface CustomerInsight {
  id: string
  title: string
  source: string
  customer: string
  votes: number
  status: 'new' | 'reviewing' | 'planned' | 'declined'
  linkedFeatures: string[]
  createdAt: Date
}

interface Idea {
  id: string
  title: string
  description: string
  submittedBy: string
  votes: number
  status: 'new' | 'under_review' | 'accepted' | 'rejected'
  category: string
  createdAt: Date
}

interface Objective {
  id: string
  title: string
  description: string
  keyResults: string[]
  progress: number
  quarter: Quarter
  year: number
  features: string[]
}

// Mock Data
const mockFeatures: Feature[] = [
  {
    id: 'f1',
    title: 'AI-Powered Search',
    description: 'Implement semantic search with natural language processing',
    status: 'in_progress',
    priority: 'critical',
    impact: 'transformational',
    effort: 'large',
    impactScore: 9,
    effortScore: 7,
    riceScore: 85,
    progress: 65,
    quarter: 'Q1',
    year: 2025,
    releaseId: 'r1',
    theme: 'AI & Intelligence',
    team: 'Platform',
    owner: { id: '1', name: 'Sarah Chen', avatar: '' },
    votes: 234,
    comments: 45,
    dependencies: ['f3'],
    tags: ['ai', 'search', 'ux'],
    customerRequests: 156,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-12-20'),
    targetDate: new Date('2025-02-15')
  },
  {
    id: 'f2',
    title: 'Real-time Collaboration',
    description: 'Enable multiple users to work on documents simultaneously',
    status: 'planned',
    priority: 'high',
    impact: 'significant',
    effort: 'xl',
    impactScore: 8,
    effortScore: 9,
    riceScore: 72,
    progress: 0,
    quarter: 'Q2',
    year: 2025,
    releaseId: 'r2',
    theme: 'Collaboration',
    team: 'Core',
    owner: { id: '2', name: 'Mike Johnson', avatar: '' },
    votes: 189,
    comments: 32,
    dependencies: [],
    tags: ['collaboration', 'realtime', 'multiplayer'],
    customerRequests: 98,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-18'),
    targetDate: new Date('2025-05-30')
  },
  {
    id: 'f3',
    title: 'API Gateway Redesign',
    description: 'Rebuild API infrastructure for better scalability',
    status: 'in_progress',
    priority: 'high',
    impact: 'significant',
    effort: 'large',
    impactScore: 7,
    effortScore: 8,
    riceScore: 68,
    progress: 40,
    quarter: 'Q1',
    year: 2025,
    releaseId: 'r1',
    theme: 'Infrastructure',
    team: 'Platform',
    owner: { id: '3', name: 'Alex Rivera', avatar: '' },
    votes: 67,
    comments: 23,
    dependencies: [],
    tags: ['api', 'infrastructure', 'scalability'],
    customerRequests: 34,
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-12-15'),
    targetDate: new Date('2025-01-31')
  },
  {
    id: 'f4',
    title: 'Mobile App Redesign',
    description: 'Complete redesign of mobile experience with new UI',
    status: 'review',
    priority: 'high',
    impact: 'significant',
    effort: 'large',
    impactScore: 8,
    effortScore: 7,
    riceScore: 76,
    progress: 90,
    quarter: 'Q1',
    year: 2025,
    releaseId: 'r1',
    theme: 'Mobile',
    team: 'Mobile',
    owner: { id: '4', name: 'Emma Wilson', avatar: '' },
    votes: 312,
    comments: 67,
    dependencies: ['f3'],
    tags: ['mobile', 'ui', 'redesign'],
    customerRequests: 245,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-12-22'),
    targetDate: new Date('2025-01-15')
  },
  {
    id: 'f5',
    title: 'Advanced Analytics Dashboard',
    description: 'Comprehensive analytics with custom report builder',
    status: 'backlog',
    priority: 'medium',
    impact: 'moderate',
    effort: 'medium',
    impactScore: 6,
    effortScore: 5,
    riceScore: 58,
    progress: 0,
    quarter: 'Q2',
    year: 2025,
    theme: 'Analytics',
    team: 'Data',
    owner: { id: '5', name: 'James Park', avatar: '' },
    votes: 145,
    comments: 28,
    dependencies: [],
    tags: ['analytics', 'reporting', 'dashboard'],
    customerRequests: 89,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-10')
  },
  {
    id: 'f6',
    title: 'SSO Integration',
    description: 'Enterprise single sign-on with SAML and OIDC support',
    status: 'released',
    priority: 'high',
    impact: 'significant',
    effort: 'medium',
    impactScore: 8,
    effortScore: 5,
    riceScore: 82,
    progress: 100,
    quarter: 'Q4',
    year: 2024,
    releaseId: 'r0',
    theme: 'Enterprise',
    team: 'Security',
    owner: { id: '6', name: 'Olivia Brown', avatar: '' },
    votes: 278,
    comments: 41,
    dependencies: [],
    tags: ['enterprise', 'security', 'sso'],
    customerRequests: 187,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-12-01')
  }
]

const mockReleases: Release[] = [
  {
    id: 'r0',
    name: 'Winter Release',
    version: '2.4.0',
    status: 'released',
    targetDate: new Date('2024-12-01'),
    features: ['f6'],
    progress: 100,
    description: 'Enterprise features and security improvements'
  },
  {
    id: 'r1',
    name: 'Spring Release',
    version: '2.5.0',
    status: 'development',
    targetDate: new Date('2025-02-15'),
    features: ['f1', 'f3', 'f4'],
    progress: 65,
    description: 'AI features and mobile redesign'
  },
  {
    id: 'r2',
    name: 'Summer Release',
    version: '2.6.0',
    status: 'planning',
    targetDate: new Date('2025-05-30'),
    features: ['f2', 'f5'],
    progress: 10,
    description: 'Collaboration and analytics'
  }
]

const mockInsights: CustomerInsight[] = [
  {
    id: 'i1',
    title: 'Need better search functionality',
    source: 'Support Ticket',
    customer: 'Acme Corp',
    votes: 45,
    status: 'planned',
    linkedFeatures: ['f1'],
    createdAt: new Date('2024-11-15')
  },
  {
    id: 'i2',
    title: 'Mobile app crashes frequently',
    source: 'App Store Review',
    customer: 'Multiple',
    votes: 89,
    status: 'planned',
    linkedFeatures: ['f4'],
    createdAt: new Date('2024-10-20')
  },
  {
    id: 'i3',
    title: 'Need real-time editing like Google Docs',
    source: 'Customer Interview',
    customer: 'TechStart Inc',
    votes: 67,
    status: 'reviewing',
    linkedFeatures: ['f2'],
    createdAt: new Date('2024-12-01')
  }
]

const mockIdeas: Idea[] = [
  {
    id: 'id1',
    title: 'Dark mode for all pages',
    description: 'Implement system-wide dark mode support',
    submittedBy: 'John Smith',
    votes: 234,
    status: 'accepted',
    category: 'UI/UX',
    createdAt: new Date('2024-11-01')
  },
  {
    id: 'id2',
    title: 'Keyboard shortcuts',
    description: 'Add comprehensive keyboard shortcuts for power users',
    submittedBy: 'Lisa Chen',
    votes: 156,
    status: 'under_review',
    category: 'Productivity',
    createdAt: new Date('2024-11-20')
  },
  {
    id: 'id3',
    title: 'Export to PDF',
    description: 'Allow exporting reports and documents to PDF',
    submittedBy: 'Mike Wilson',
    votes: 189,
    status: 'new',
    category: 'Export',
    createdAt: new Date('2024-12-10')
  }
]

const mockObjectives: Objective[] = [
  {
    id: 'o1',
    title: 'Become the AI-first platform in our category',
    description: 'Lead the market with AI-powered features',
    keyResults: ['Launch AI search', 'Achieve 50% AI feature adoption', 'Reduce task time by 40%'],
    progress: 45,
    quarter: 'Q1',
    year: 2025,
    features: ['f1']
  },
  {
    id: 'o2',
    title: 'Improve user collaboration',
    description: 'Enable seamless team collaboration',
    keyResults: ['Launch real-time editing', 'Increase team workspace usage by 60%', 'Reduce email attachments by 50%'],
    progress: 20,
    quarter: 'Q2',
    year: 2025,
    features: ['f2']
  }
]

// Helper Functions
const getStatusColor = (status: InitiativeStatus): string => {
  const colors: Record<InitiativeStatus, string> = {
    backlog: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    released: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
  }
  return colors[status] || colors.backlog
}

const getStatusIcon = (status: InitiativeStatus) => {
  const icons: Record<InitiativeStatus, React.ReactNode> = {
    backlog: <CircleDot className="w-3 h-3" />,
    planned: <Calendar className="w-3 h-3" />,
    in_progress: <Play className="w-3 h-3" />,
    review: <Eye className="w-3 h-3" />,
    released: <Rocket className="w-3 h-3" />,
    archived: <Package className="w-3 h-3" />
  }
  return icons[status] || icons.backlog
}

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[priority] || colors.medium
}

const getImpactColor = (impact: ImpactLevel): string => {
  const colors: Record<ImpactLevel, string> = {
    transformational: 'text-purple-600 dark:text-purple-400',
    significant: 'text-blue-600 dark:text-blue-400',
    moderate: 'text-green-600 dark:text-green-400',
    minor: 'text-gray-600 dark:text-gray-400'
  }
  return colors[impact] || colors.moderate
}

const getReleaseStatusColor = (status: ReleaseStatus): string => {
  const colors: Record<ReleaseStatus, string> = {
    planning: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    development: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    testing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    staged: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    released: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  return colors[status] || colors.planning
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

interface RoadmapClientProps {
  initialInitiatives?: any[]
  initialMilestones?: any[]
}

export default function RoadmapClient({ initialInitiatives, initialMilestones }: RoadmapClientProps) {
  const [activeTab, setActiveTab] = useState('roadmap')
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | 'all'>('all')
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false)

  const features = mockFeatures
  const releases = mockReleases
  const insights = mockInsights
  const ideas = mockIdeas
  const objectives = mockObjectives

  // Computed Statistics
  const stats = useMemo(() => {
    const totalFeatures = features.length
    const inProgress = features.filter(f => f.status === 'in_progress').length
    const released = features.filter(f => f.status === 'released').length
    const avgProgress = features.reduce((sum, f) => sum + f.progress, 0) / totalFeatures
    const totalVotes = features.reduce((sum, f) => sum + f.votes, 0)
    const totalCustomerRequests = features.reduce((sum, f) => sum + f.customerRequests, 0)
    const upcomingReleases = releases.filter(r => r.status !== 'released').length

    return {
      totalFeatures,
      inProgress,
      released,
      avgProgress,
      totalVotes,
      totalCustomerRequests,
      upcomingReleases,
      totalIdeas: ideas.length
    }
  }, [features, releases, ideas])

  // Filtered Features
  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesQuarter = selectedQuarter === 'all' || feature.quarter === selectedQuarter
      return matchesSearch && matchesQuarter
    })
  }, [features, searchQuery, selectedQuarter])

  const openFeatureDetail = (feature: Feature) => {
    setSelectedFeature(feature)
    setIsFeatureDialogOpen(true)
  }

  // Group features by status for Kanban view
  const featuresByStatus = useMemo(() => {
    const grouped: Record<InitiativeStatus, Feature[]> = {
      backlog: [],
      planned: [],
      in_progress: [],
      review: [],
      released: [],
      archived: []
    }
    filteredFeatures.forEach(feature => {
      grouped[feature.status].push(feature)
    })
    return grouped
  }, [filteredFeatures])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Map className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Product Roadmap</h1>
              <p className="text-muted-foreground">ProductBoard-level feature planning and prioritization</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Feature
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalFeatures}</p>
                  <p className="text-xs text-muted-foreground">Features</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.released}</p>
                  <p className="text-xs text-muted-foreground">Released</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgProgress.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalVotes}</p>
                  <p className="text-xs text-muted-foreground">Total Votes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCustomerRequests}</p>
                  <p className="text-xs text-muted-foreground">Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.upcomingReleases}</p>
                  <p className="text-xs text-muted-foreground">Releases</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalIdeas}</p>
                  <p className="text-xs text-muted-foreground">Ideas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="roadmap" className="gap-2">
              <Map className="w-4 h-4" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Layers className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="releases" className="gap-2">
              <Package className="w-4 h-4" />
              Releases
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideas
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search features..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                        <Button
                          key={q}
                          variant={selectedQuarter === q ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => setSelectedQuarter(q)}
                        >
                          {q === 'all' ? 'All' : `${q} 2025`}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('timeline')}
                    >
                      <GanttChart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('kanban')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'kanban' ? (
                  <div className="grid grid-cols-5 gap-4">
                    {(['backlog', 'planned', 'in_progress', 'review', 'released'] as InitiativeStatus[]).map((status) => (
                      <div key={status} className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className="font-semibold capitalize">{status.replace('_', ' ')}</span>
                          </div>
                          <Badge variant="secondary">{featuresByStatus[status].length}</Badge>
                        </div>
                        <div className="space-y-2">
                          {featuresByStatus[status].map((feature) => (
                            <Card
                              key={feature.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => openFeatureDetail(feature)}
                            >
                              <CardContent className="p-3">
                                <p className="font-medium text-sm mb-2">{feature.title}</p>
                                <div className="flex items-center gap-1 mb-2 flex-wrap">
                                  <Badge className={getPriorityColor(feature.priority)} variant="secondary">
                                    {feature.priority}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">{feature.quarter}</Badge>
                                </div>
                                <Progress value={feature.progress} className="h-1.5 mb-2" />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3" />
                                    {feature.votes}
                                  </span>
                                  <span>{feature.progress}%</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="space-y-2">
                    {filteredFeatures.map((feature) => (
                      <div
                        key={feature.id}
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-4"
                        onClick={() => openFeatureDetail(feature)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{feature.title}</h4>
                            <Badge className={getStatusColor(feature.status)}>
                              {getStatusIcon(feature.status)}
                              <span className="ml-1 capitalize">{feature.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge className={getPriorityColor(feature.priority)}>{feature.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {feature.quarter} {feature.year}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {feature.team}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {feature.votes}
                            </span>
                          </div>
                        </div>
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-sm font-medium">{feature.progress}%</span>
                          </div>
                          <Progress value={feature.progress} className="h-2" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-teal-600">{feature.riceScore}</p>
                          <p className="text-xs text-muted-foreground">RICE</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Timeline view
                  <div className="space-y-6">
                    {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map((quarter) => {
                      const quarterFeatures = filteredFeatures.filter(f => f.quarter === quarter)
                      if (quarterFeatures.length === 0 && selectedQuarter !== 'all') return null
                      return (
                        <div key={quarter}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                              {quarter}
                            </div>
                            <div>
                              <h3 className="font-semibold">{quarter} 2025</h3>
                              <p className="text-sm text-muted-foreground">{quarterFeatures.length} features</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-14">
                            {quarterFeatures.map((feature) => (
                              <Card
                                key={feature.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => openFeatureDetail(feature)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                                      <div className="flex items-center gap-1">
                                        <Badge className={getStatusColor(feature.status)}>
                                          {feature.status.replace('_', ' ')}
                                        </Badge>
                                        <Badge className={getPriorityColor(feature.priority)}>
                                          {feature.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-teal-600">{feature.riceScore}</p>
                                      <p className="text-xs text-muted-foreground">RICE</p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{feature.description}</p>
                                  <Progress value={feature.progress} className="h-2 mb-3" />
                                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      {feature.team}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <ThumbsUp className="w-4 h-4" />
                                      {feature.votes}
                                    </span>
                                    <span>{feature.progress}%</span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Prioritization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {features.sort((a, b) => b.riceScore - a.riceScore).map((feature, index) => (
                        <div
                          key={feature.id}
                          className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                          onClick={() => openFeatureDetail(feature)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{feature.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getStatusColor(feature.status)}>{feature.status.replace('_', ' ')}</Badge>
                                <span className="text-sm text-muted-foreground">{feature.theme}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-center">
                              <div>
                                <p className="text-lg font-bold">{feature.impactScore}</p>
                                <p className="text-xs text-muted-foreground">Impact</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold">{feature.effortScore}</p>
                                <p className="text-xs text-muted-foreground">Effort</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold">{feature.customerRequests}</p>
                                <p className="text-xs text-muted-foreground">Requests</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-teal-600">{feature.riceScore}</p>
                                <p className="text-xs text-muted-foreground">RICE</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Objectives</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {objectives.map((objective) => (
                      <div key={objective.id} className="p-4 rounded-lg border">
                        <h4 className="font-semibold mb-2">{objective.title}</h4>
                        <Progress value={objective.progress} className="h-2 mb-2" />
                        <p className="text-sm text-muted-foreground">{objective.progress}% complete</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>By Theme</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.from(new Set(features.map(f => f.theme))).map((theme, i) => {
                      const count = features.filter(f => f.theme === theme).length
                      return (
                        <div key={theme} className="flex items-center justify-between">
                          <span className="text-sm">{theme}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Releases Tab */}
          <TabsContent value="releases" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {releases.map((release) => (
                <Card key={release.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-teal-500" />
                          {release.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">v{release.version}</p>
                      </div>
                      <Badge className={getReleaseStatusColor(release.status)}>
                        {release.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{release.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="font-medium">{release.progress}%</span>
                    </div>
                    <Progress value={release.progress} className="h-2 mb-4" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(release.targetDate)}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Layers className="w-4 h-4" />
                        {release.features.length} features
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-pink-500" />
                    Customer Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map((insight) => (
                      <div key={insight.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground">{insight.source} • {insight.customer}</p>
                          </div>
                          <Badge variant="outline">{insight.votes} votes</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={insight.status === 'planned' ? 'default' : 'secondary'}>
                            {insight.status}
                          </Badge>
                          {insight.linkedFeatures.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              {insight.linkedFeatures.length} linked
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Request Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {features.sort((a, b) => b.customerRequests - a.customerRequests).slice(0, 5).map((feature, i) => (
                      <div key={feature.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{feature.title}</span>
                          <span className="text-sm">{feature.customerRequests}</span>
                        </div>
                        <Progress value={(feature.customerRequests / stats.totalCustomerRequests) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ideas Tab */}
          <TabsContent value="ideas" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{idea.category}</Badge>
                      <Badge variant={idea.status === 'accepted' ? 'default' : 'secondary'}>
                        {idea.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-2">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{idea.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">by {idea.submittedBy}</span>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{idea.votes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all flex items-center justify-center min-h-[200px]">
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h4 className="font-medium mb-1">Submit Idea</h4>
                  <p className="text-sm text-muted-foreground">Share your product ideas</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Roadmap Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: 'Public Roadmap', description: 'Allow external access to roadmap', enabled: true },
                    { title: 'Voting Enabled', description: 'Let users vote on features', enabled: true },
                    { title: 'Idea Portal', description: 'Accept feature requests', enabled: true },
                    { title: 'Auto-prioritization', description: 'Calculate RICE scores automatically', enabled: false }
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{setting.title}</p>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow mt-1 transition-transform ${setting.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Jira', description: 'Sync features with Jira issues', connected: true },
                    { name: 'Slack', description: 'Post updates to Slack', connected: true },
                    { name: 'Intercom', description: 'Link customer conversations', connected: false },
                    { name: 'GitHub', description: 'Connect to repositories', connected: false }
                  ].map((integration, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                      <Button variant={integration.connected ? "secondary" : "outline"} size="sm">
                        {integration.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Feature Detail Dialog */}
        <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedFeature && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
                      <Layers className="w-5 h-5" />
                    </div>
                    {selectedFeature.title}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)]">
                  <div className="space-y-6 p-1">
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(selectedFeature.status)}>
                        {getStatusIcon(selectedFeature.status)}
                        <span className="ml-1 capitalize">{selectedFeature.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge className={getPriorityColor(selectedFeature.priority)}>
                        {selectedFeature.priority} priority
                      </Badge>
                      <Badge variant="outline">{selectedFeature.quarter} {selectedFeature.year}</Badge>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedFeature.description}</p>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Progress</h4>
                        <span className="text-sm font-medium">{selectedFeature.progress}%</span>
                      </div>
                      <Progress value={selectedFeature.progress} className="h-2" />
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Impact Score</p>
                        <p className="text-2xl font-bold">{selectedFeature.impactScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Effort Score</p>
                        <p className="text-2xl font-bold">{selectedFeature.effortScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">RICE Score</p>
                        <p className="text-2xl font-bold text-teal-600">{selectedFeature.riceScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Customer Requests</p>
                        <p className="text-2xl font-bold">{selectedFeature.customerRequests}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Theme</p>
                        <p className="font-medium">{selectedFeature.theme}</p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Team</p>
                        <p className="font-medium">{selectedFeature.team}</p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Impact</p>
                        <p className={`font-medium capitalize ${getImpactColor(selectedFeature.impact)}`}>
                          {selectedFeature.impact}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Effort</p>
                        <p className="font-medium uppercase">{selectedFeature.effort}</p>
                      </div>
                    </div>

                    {/* Owner */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Owner</h4>
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <Avatar>
                          <AvatarFallback>{selectedFeature.owner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedFeature.owner.name}</p>
                          <p className="text-sm text-muted-foreground">Feature Owner</p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFeature.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center gap-6 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{selectedFeature.votes} votes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{selectedFeature.comments} comments</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button className="flex-1">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Vote
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                      </Button>
                      <Button variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
