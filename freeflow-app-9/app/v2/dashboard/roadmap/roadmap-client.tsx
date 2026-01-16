"use client"

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Map,
  Target,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Plus,
  Eye,
  Layers,
  GitBranch,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  Search,
  Package,
  Rocket,
  Settings,
  GanttChart,
  LayoutGrid,
  List,
  Play,
  Link2,
  Brain,
  CircleDot,
  Share2,
  Download,
  Upload,
  Shield,
  Sliders,
  Bell,
  Webhook,
  Trash2,
  Globe,
  Terminal,
  RefreshCw,
  Copy,
  X,
  Check,
  Zap,
  AlertTriangle
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

// Competitive Upgrade Mock Data - Productboard/Aha!-level Roadmap Intelligence
const mockRoadmapAIInsights = [
  { id: '1', type: 'success' as const, title: 'On Track', description: '85% of Q1 initiatives are on schedule!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Progress' },
  { id: '2', type: 'warning' as const, title: 'Scope Creep', description: 'Mobile App v2 has grown 40% beyond original scope.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Risk' },
  { id: '3', type: 'info' as const, title: 'AI Priority', description: 'Customer requests suggest API improvements should move up.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockRoadmapCollaborators = [
  { id: '1', name: 'Product Lead', avatar: '/avatars/product.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'PM', avatar: '/avatars/pm.jpg', status: 'online' as const, role: 'PM' },
  { id: '3', name: 'Engineering', avatar: '/avatars/eng.jpg', status: 'away' as const, role: 'Engineering' },
]

const mockRoadmapPredictions = [
  { id: '1', title: 'Q1 Delivery', prediction: '4 of 5 major features will ship on time', confidence: 86, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Resource Needs', prediction: 'Mobile initiative will require 2 additional engineers', confidence: 79, trend: 'up' as const, impact: 'medium' as const },
]

const mockRoadmapActivities = [
  { id: '1', user: 'Product Lead', action: 'Prioritized', target: 'Q2 feature backlog', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'PM', action: 'Updated', target: 'API v3 timeline', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Engineering', action: 'Completed', target: 'infrastructure milestone', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be initialized with dialog handlers in component

export default function RoadmapClient({ initialInitiatives, initialMilestones }: RoadmapClientProps) {
  const [activeTab, setActiveTab] = useState('roadmap')
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | 'all'>('all')
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for real workflows
  const [isNewFeatureDialogOpen, setIsNewFeatureDialogOpen] = useState(false)
  const [isNewReleaseDialogOpen, setIsNewReleaseDialogOpen] = useState(false)
  const [isSubmitIdeaDialogOpen, setIsSubmitIdeaDialogOpen] = useState(false)
  const [isSetOKRDialogOpen, setIsSetOKRDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isSyncJiraDialogOpen, setIsSyncJiraDialogOpen] = useState(false)
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false)
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false)
  const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<string>('')
  const [selectedInsight, setSelectedInsight] = useState<any>(null)

  // Form states
  const [newFeatureForm, setNewFeatureForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    quarter: 'Q1' as Quarter,
    theme: '',
    team: '',
    impact: 'moderate' as ImpactLevel,
    effort: 'medium' as EffortLevel
  })
  const [newReleaseForm, setNewReleaseForm] = useState({
    name: '',
    version: '',
    description: '',
    targetDate: ''
  })
  const [newIdeaForm, setNewIdeaForm] = useState({
    title: '',
    description: '',
    category: ''
  })
  const [newOKRForm, setNewOKRForm] = useState({
    title: '',
    description: '',
    keyResults: ['', '', ''],
    quarter: 'Q1' as Quarter
  })
  const [commentText, setCommentText] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [exportFormat, setExportFormat] = useState('csv')

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

  // Dialog-based Handlers
  const handleShareRoadmap = () => {
    setShareUrl(`https://roadmap.yourcompany.com/public/${Date.now().toString(36)}`)
    setIsShareDialogOpen(true)
  }

  const handleNewFeature = () => {
    setNewFeatureForm({
      title: '',
      description: '',
      priority: 'medium',
      quarter: 'Q1',
      theme: '',
      team: '',
      impact: 'moderate',
      effort: 'medium'
    })
    setIsNewFeatureDialogOpen(true)
  }

  const handleVote = () => {
    if (!selectedFeature) return
    setIsVoteDialogOpen(true)
  }

  const handleComment = () => {
    if (!selectedFeature) return
    setCommentText('')
    setIsCommentDialogOpen(true)
  }

  const handleShareFeature = () => {
    if (!selectedFeature) return
    setShareUrl(`https://roadmap.yourcompany.com/feature/${selectedFeature.id}`)
    setIsShareDialogOpen(true)
  }

  const handleExportRoadmap = () => {
    setExportFormat('csv')
    setIsExportDialogOpen(true)
  }

  const handleNewRelease = () => {
    setNewReleaseForm({
      name: '',
      version: '',
      description: '',
      targetDate: ''
    })
    setIsNewReleaseDialogOpen(true)
  }

  const handleSubmitIdea = () => {
    setNewIdeaForm({
      title: '',
      description: '',
      category: ''
    })
    setIsSubmitIdeaDialogOpen(true)
  }

  const handleSetOKR = () => {
    setNewOKRForm({
      title: '',
      description: '',
      keyResults: ['', '', ''],
      quarter: 'Q1'
    })
    setIsSetOKRDialogOpen(true)
  }

  const handleSyncJira = () => {
    setIsSyncJiraDialogOpen(true)
  }

  const handleViewAnalytics = () => {
    setIsAnalyticsDialogOpen(true)
  }

  const handleRecalculateScores = () => {
    // Simulate score recalculation
    toast.success('RICE Scores Updated')
  }

  const handleAddFeature = () => {
    setNewFeatureForm({
      title: '',
      description: '',
      priority: 'medium',
      quarter: 'Q1',
      theme: '',
      team: '',
      impact: 'moderate',
      effort: 'medium'
    })
    setIsNewFeatureDialogOpen(true)
  }

  const handleCopyPublicUrl = () => {
    navigator.clipboard.writeText('https://roadmap.yourcompany.com/public')
    toast.success('URL Copied')
  }

  const handleManageIntegration = (integrationName: string) => {
    setSelectedIntegration(integrationName)
    setIsIntegrationDialogOpen(true)
  }

  const handleConnectIntegration = (integrationName: string) => {
    setSelectedIntegration(integrationName)
    setIsIntegrationDialogOpen(true)
  }

  const handleImportFeatures = () => {
    setIsImportDialogOpen(true)
  }

  const handleArchiveCompleted = () => {
    setIsArchiveDialogOpen(true)
  }

  const handleDeleteRoadmap = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleOpenTimeline = () => {
    setIsTimelineDialogOpen(true)
  }

  const handleInsightAction = (insight: any) => {
    setSelectedInsight(insight)
    setIsInsightDialogOpen(true)
  }

  // Submit handlers for dialogs
  const submitNewFeature = () => {
    if (!newFeatureForm.title.trim()) {
      toast.error('Validation Error')
      return
    }
    toast.success('Feature Created'" has been added to the roadmap` })
    setIsNewFeatureDialogOpen(false)
  }

  const submitNewRelease = () => {
    if (!newReleaseForm.name.trim() || !newReleaseForm.version.trim()) {
      toast.error('Validation Error')
      return
    }
    toast.success('Release Created' "${newReleaseForm.name}" has been scheduled` })
    setIsNewReleaseDialogOpen(false)
  }

  const submitIdea = () => {
    if (!newIdeaForm.title.trim()) {
      toast.error('Validation Error')
      return
    }
    toast.success('Idea Submitted'" has been submitted for review` })
    setIsSubmitIdeaDialogOpen(false)
  }

  const submitOKR = () => {
    if (!newOKRForm.title.trim()) {
      toast.error('Validation Error')
      return
    }
    toast.success('OKR Created'" has been set for ${newOKRForm.quarter}` })
    setIsSetOKRDialogOpen(false)
  }

  const submitComment = () => {
    if (!commentText.trim()) {
      toast.error('Validation Error')
      return
    }
    toast.success('Comment Posted'" has been posted` })
    setIsCommentDialogOpen(false)
    setCommentText('')
  }

  const submitVote = () => {
    toast.success('Vote Recorded'"` })
    setIsVoteDialogOpen(false)
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link Copied')
  }

  const exportRoadmap = () => {
    toast.success('Export Started'` })
    setIsExportDialogOpen(false)
  }

  const syncWithJira = () => {
    toast.success('Jira Sync Started')
    setIsSyncJiraDialogOpen(false)
  }

  const confirmArchive = () => {
    toast.success('Features Archived')
    setIsArchiveDialogOpen(false)
  }

  const confirmDelete = () => {
    toast.success('Roadmap Deleted')
    setIsDeleteDialogOpen(false)
  }

  const handleImportFile = () => {
    toast.success('Import Started')
    setIsImportDialogOpen(false)
  }

  // Quick actions with dialog handlers
  const roadmapQuickActions = [
    { id: '1', label: 'New Initiative', icon: 'plus', action: handleNewFeature, variant: 'default' as const },
    { id: '2', label: 'Timeline', icon: 'calendar', action: handleOpenTimeline, variant: 'default' as const },
    { id: '3', label: 'Share', icon: 'share', action: handleShareRoadmap, variant: 'outline' as const },
  ]

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
            <Button variant="outline" size="sm" onClick={handleShareRoadmap}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={handleNewFeature}>
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
          <TabsContent value="roadmap" className="mt-6 space-y-6">
            {/* Roadmap Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Map className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Product Roadmap</h2>
                    <p className="text-white/80">Strategic feature planning and prioritization</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Features</p>
                    <p className="text-2xl font-bold">{stats.totalFeatures}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">In Progress</p>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Released</p>
                    <p className="text-2xl font-bold">{stats.released}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Avg Progress</p>
                    <p className="text-2xl font-bold">{stats.avgProgress.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Plus, label: 'New Feature', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600', handler: handleNewFeature },
                { icon: Package, label: 'New Release', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', handler: handleNewRelease },
                { icon: Lightbulb, label: 'Submit Idea', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', handler: handleSubmitIdea },
                { icon: Target, label: 'Set OKR', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', handler: handleSetOKR },
                { icon: Share2, label: 'Share', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600', handler: handleShareRoadmap },
                { icon: Download, label: 'Export', color: 'bg-green-100 dark:bg-green-900/30 text-green-600', handler: handleExportRoadmap },
                { icon: GitBranch, label: 'Sync Jira', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600', handler: handleSyncJira },
                { icon: BarChart3, label: 'Analytics', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600', handler: handleViewAnalytics },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.handler}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
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
          <TabsContent value="features" className="mt-6 space-y-6">
            {/* Features Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Feature Prioritization</h2>
                    <p className="text-white/80">RICE scoring and impact analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <button onClick={handleRecalculateScores} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors">
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Recalculate
                  </button>
                  <button onClick={handleAddFeature} className="px-4 py-2 bg-white text-violet-600 rounded-lg hover:bg-white/90 transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Feature
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-center">
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
          <TabsContent value="releases" className="mt-6 space-y-6">
            {/* Releases Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Release Management</h2>
                    <p className="text-white/80">Plan and track your product releases</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Releases</p>
                    <p className="text-2xl font-bold">{releases.length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">In Development</p>
                    <p className="text-2xl font-bold">{releases.filter(r => r.status === 'development').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Released</p>
                    <p className="text-2xl font-bold">{releases.filter(r => r.status === 'released').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Upcoming</p>
                    <p className="text-2xl font-bold">{stats.upcomingReleases}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

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
                    {insights.map((insight: AIInsight) => (
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
          <TabsContent value="ideas" className="mt-6 space-y-6">
            {/* Ideas Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Idea Portal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stats.totalIdeas} ideas submitted • Accept feature requests from users</p>
                </div>
              </div>
              <Button onClick={handleSubmitIdea} className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Submit Idea
              </Button>
            </div>

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
              <Card onClick={handleSubmitIdea} className="border-dashed cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all flex items-center justify-center min-h-[200px]">
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
          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Sliders },
                      { id: 'visibility', label: 'Visibility', icon: Globe },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'integrations', label: 'Integrations', icon: Webhook },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'advanced', label: 'Advanced', icon: Terminal },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Roadmap Preferences</CardTitle>
                        <CardDescription>Configure default roadmap behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label htmlFor="defaultView">Default View</Label>
                            <select id="defaultView" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                              <option>Timeline</option>
                              <option>Kanban</option>
                              <option>List</option>
                              <option>Swimlane</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="defaultQuarter">Default Quarter</Label>
                            <select id="defaultQuarter" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                              <option>Current Quarter</option>
                              <option>All Quarters</option>
                              <option>Next Quarter</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-prioritization</p>
                            <p className="text-sm text-gray-500">Calculate RICE scores automatically</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Archived Features</p>
                            <p className="text-sm text-gray-500">Include archived items in views</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Scoring Configuration</CardTitle>
                        <CardDescription>Customize RICE scoring weights</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label htmlFor="reachWeight">Reach Weight</Label>
                            <Input id="reachWeight" type="number" className="mt-1" defaultValue="1.0" />
                          </div>
                          <div>
                            <Label htmlFor="impactWeight">Impact Weight</Label>
                            <Input id="impactWeight" type="number" className="mt-1" defaultValue="2.0" />
                          </div>
                          <div>
                            <Label htmlFor="confidenceWeight">Confidence Weight</Label>
                            <Input id="confidenceWeight" type="number" className="mt-1" defaultValue="1.0" />
                          </div>
                          <div>
                            <Label htmlFor="effortWeight">Effort Weight</Label>
                            <Input id="effortWeight" type="number" className="mt-1" defaultValue="1.5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'visibility' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Public Roadmap</CardTitle>
                        <CardDescription>Control external access to your roadmap</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Public Roadmap</p>
                            <p className="text-sm text-gray-500">Allow anyone to view the roadmap</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Voting</p>
                            <p className="text-sm text-gray-500">Let users vote on features</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Progress</p>
                            <p className="text-sm text-gray-500">Display feature progress publicly</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label htmlFor="publicUrl">Public URL</Label>
                          <div className="mt-1 flex gap-2">
                            <Input id="publicUrl" type="text" className="flex-1" defaultValue="roadmap.yourcompany.com" readOnly />
                            <Button variant="outline" onClick={handleCopyPublicUrl}>Copy</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Idea Portal</CardTitle>
                        <CardDescription>Accept feature requests from users</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Idea Portal</p>
                            <p className="text-sm text-gray-500">Accept feature suggestions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require Email</p>
                            <p className="text-sm text-gray-500">Collect submitter email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure notification preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'New Feature Added', desc: 'When a new feature is created', enabled: true },
                          { name: 'Status Changes', desc: 'When feature status updates', enabled: true },
                          { name: 'New Votes', desc: 'When features receive votes', enabled: false },
                          { name: 'New Ideas', desc: 'When users submit ideas', enabled: true },
                          { name: 'Release Updates', desc: 'When releases are published', enabled: true },
                        ].map((notification) => (
                          <div key={notification.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notification.name}</p>
                              <p className="text-sm text-gray-500">{notification.desc}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Sync with your existing tools</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Jira', desc: 'Sync features with Jira issues', status: 'connected', icon: '📋' },
                          { name: 'Slack', desc: 'Post updates to channels', status: 'connected', icon: '💬' },
                          { name: 'GitHub', desc: 'Link to repositories', status: 'disconnected', icon: '🐙' },
                          { name: 'Intercom', desc: 'Connect customer feedback', status: 'disconnected', icon: '💭' },
                          { name: 'Segment', desc: 'Product analytics', status: 'disconnected', icon: '📊' },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <Button
                              variant={integration.status === 'connected' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => integration.status === 'connected' ? handleManageIntegration(integration.name) : handleConnectIntegration(integration.name)}
                            >
                              {integration.status === 'connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage who can access the roadmap</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">SSO Required</p>
                            <p className="text-sm text-gray-500">Require single sign-on</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Auth</p>
                            <p className="text-sm text-gray-500">Require 2FA for team members</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                            <p className="text-sm text-gray-500">Track all changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Export and manage roadmap data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Export Roadmap</p>
                            <p className="text-sm text-gray-500">Download all features and releases</p>
                          </div>
                          <Button onClick={handleExportRoadmap}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Import Features</p>
                            <p className="text-sm text-gray-500">Bulk import from CSV</p>
                          </div>
                          <Button variant="outline" onClick={handleImportFeatures}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/50">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Archive All Completed</p>
                            <p className="text-sm text-gray-500">Move all released features to archive</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleArchiveCompleted}>
                            Archive
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Delete Roadmap</p>
                            <p className="text-sm text-gray-500">Permanently delete all data</p>
                          </div>
                          <Button variant="destructive" onClick={handleDeleteRoadmap}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockRoadmapAIInsights}
              title="Roadmap Intelligence"
              onInsightAction={handleInsightAction}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockRoadmapCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockRoadmapPredictions}
              title="Delivery Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockRoadmapActivities}
            title="Roadmap Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={roadmapQuickActions}
            variant="grid"
          />
        </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      <Button className="flex-1" onClick={handleVote}>
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Vote
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleComment}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                      </Button>
                      <Button variant="outline" onClick={handleShareFeature}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* New Feature Dialog */}
        <Dialog open={isNewFeatureDialogOpen} onOpenChange={setIsNewFeatureDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-500" />
                Create New Feature
              </DialogTitle>
              <DialogDescription>
                Add a new feature to your product roadmap
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="col-span-2">
                  <Label htmlFor="featureTitle">Feature Title</Label>
                  <Input
                    id="featureTitle"
                    placeholder="Enter feature title"
                    value={newFeatureForm.title}
                    onChange={(e) => setNewFeatureForm({...newFeatureForm, title: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="featureDescription">Description</Label>
                  <Textarea
                    id="featureDescription"
                    placeholder="Describe the feature"
                    value={newFeatureForm.description}
                    onChange={(e) => setNewFeatureForm({...newFeatureForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="featurePriority">Priority</Label>
                  <Select
                    value={newFeatureForm.priority}
                    onValueChange={(value: Priority) => setNewFeatureForm({...newFeatureForm, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="featureQuarter">Target Quarter</Label>
                  <Select
                    value={newFeatureForm.quarter}
                    onValueChange={(value: Quarter) => setNewFeatureForm({...newFeatureForm, quarter: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1 2025</SelectItem>
                      <SelectItem value="Q2">Q2 2025</SelectItem>
                      <SelectItem value="Q3">Q3 2025</SelectItem>
                      <SelectItem value="Q4">Q4 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="featureTheme">Theme</Label>
                  <Input
                    id="featureTheme"
                    placeholder="e.g., AI & Intelligence"
                    value={newFeatureForm.theme}
                    onChange={(e) => setNewFeatureForm({...newFeatureForm, theme: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="featureTeam">Team</Label>
                  <Input
                    id="featureTeam"
                    placeholder="e.g., Platform"
                    value={newFeatureForm.team}
                    onChange={(e) => setNewFeatureForm({...newFeatureForm, team: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="featureImpact">Impact Level</Label>
                  <Select
                    value={newFeatureForm.impact}
                    onValueChange={(value: ImpactLevel) => setNewFeatureForm({...newFeatureForm, impact: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transformational">Transformational</SelectItem>
                      <SelectItem value="significant">Significant</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="minor">Minor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="featureEffort">Effort Level</Label>
                  <Select
                    value={newFeatureForm.effort}
                    onValueChange={(value: EffortLevel) => setNewFeatureForm({...newFeatureForm, effort: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select effort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xl">XL (3+ months)</SelectItem>
                      <SelectItem value="large">Large (1-3 months)</SelectItem>
                      <SelectItem value="medium">Medium (2-4 weeks)</SelectItem>
                      <SelectItem value="small">Small (1 week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewFeatureDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitNewFeature} className="bg-gradient-to-r from-teal-500 to-cyan-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Feature
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Release Dialog */}
        <Dialog open={isNewReleaseDialogOpen} onOpenChange={setIsNewReleaseDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Create New Release
              </DialogTitle>
              <DialogDescription>
                Schedule a new product release
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="releaseName">Release Name</Label>
                <Input
                  id="releaseName"
                  placeholder="e.g., Spring Release"
                  value={newReleaseForm.name}
                  onChange={(e) => setNewReleaseForm({...newReleaseForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="releaseVersion">Version</Label>
                <Input
                  id="releaseVersion"
                  placeholder="e.g., 2.5.0"
                  value={newReleaseForm.version}
                  onChange={(e) => setNewReleaseForm({...newReleaseForm, version: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="releaseDescription">Description</Label>
                <Textarea
                  id="releaseDescription"
                  placeholder="Describe the release"
                  value={newReleaseForm.description}
                  onChange={(e) => setNewReleaseForm({...newReleaseForm, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="releaseDate">Target Date</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={newReleaseForm.targetDate}
                  onChange={(e) => setNewReleaseForm({...newReleaseForm, targetDate: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewReleaseDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitNewRelease} className="bg-gradient-to-r from-green-500 to-emerald-600">
                <Package className="w-4 h-4 mr-2" />
                Create Release
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Submit Idea Dialog */}
        <Dialog open={isSubmitIdeaDialogOpen} onOpenChange={setIsSubmitIdeaDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Submit New Idea
              </DialogTitle>
              <DialogDescription>
                Share your product idea with the team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="ideaTitle">Idea Title</Label>
                <Input
                  id="ideaTitle"
                  placeholder="Enter your idea title"
                  value={newIdeaForm.title}
                  onChange={(e) => setNewIdeaForm({...newIdeaForm, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="ideaDescription">Description</Label>
                <Textarea
                  id="ideaDescription"
                  placeholder="Describe your idea in detail"
                  value={newIdeaForm.description}
                  onChange={(e) => setNewIdeaForm({...newIdeaForm, description: e.target.value})}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="ideaCategory">Category</Label>
                <Select
                  value={newIdeaForm.category}
                  onValueChange={(value) => setNewIdeaForm({...newIdeaForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UI/UX">UI/UX</SelectItem>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="Integration">Integration</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Export">Export/Import</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitIdeaDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitIdea} className="bg-gradient-to-r from-yellow-500 to-amber-600">
                <Lightbulb className="w-4 h-4 mr-2" />
                Submit Idea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Set OKR Dialog */}
        <Dialog open={isSetOKRDialogOpen} onOpenChange={setIsSetOKRDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Set Objective & Key Results
              </DialogTitle>
              <DialogDescription>
                Define objectives and measurable key results
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="okrTitle">Objective</Label>
                <Input
                  id="okrTitle"
                  placeholder="What do you want to achieve?"
                  value={newOKRForm.title}
                  onChange={(e) => setNewOKRForm({...newOKRForm, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="okrDescription">Description</Label>
                <Textarea
                  id="okrDescription"
                  placeholder="Describe the objective"
                  value={newOKRForm.description}
                  onChange={(e) => setNewOKRForm({...newOKRForm, description: e.target.value})}
                />
              </div>
              <div>
                <Label>Key Results</Label>
                <div className="space-y-2 mt-2">
                  {newOKRForm.keyResults.map((kr, idx) => (
                    <Input
                      key={idx}
                      placeholder={`Key Result ${idx + 1}`}
                      value={kr}
                      onChange={(e) => {
                        const updated = [...newOKRForm.keyResults]
                        updated[idx] = e.target.value
                        setNewOKRForm({...newOKRForm, keyResults: updated})
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="okrQuarter">Quarter</Label>
                <Select
                  value={newOKRForm.quarter}
                  onValueChange={(value: Quarter) => setNewOKRForm({...newOKRForm, quarter: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1 2025</SelectItem>
                    <SelectItem value="Q2">Q2 2025</SelectItem>
                    <SelectItem value="Q3">Q3 2025</SelectItem>
                    <SelectItem value="Q4">Q4 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSetOKRDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitOKR} className="bg-gradient-to-r from-purple-500 to-violet-600">
                <Target className="w-4 h-4 mr-2" />
                Set OKR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-pink-500" />
                Share Roadmap
              </DialogTitle>
              <DialogDescription>
                Share your roadmap with team members or stakeholders
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Share Link</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button onClick={copyShareUrl} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Allow commenting</p>
                  <p className="text-sm text-muted-foreground">Viewers can leave comments</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Allow voting</p>
                  <p className="text-sm text-muted-foreground">Viewers can vote on features</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Close</Button>
              <Button onClick={copyShareUrl} className="bg-gradient-to-r from-pink-500 to-rose-600">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-500" />
                Export Roadmap
              </DialogTitle>
              <DialogDescription>
                Download your roadmap data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                    <SelectItem value="json">JSON (Data)</SelectItem>
                    <SelectItem value="pdf">PDF (Document)</SelectItem>
                    <SelectItem value="png">PNG (Image)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Export includes:</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>- All features ({features.length} items)</li>
                  <li>- All releases ({releases.length} items)</li>
                  <li>- Feature metadata and progress</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
              <Button onClick={exportRoadmap} className="bg-gradient-to-r from-green-500 to-emerald-600">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sync Jira Dialog */}
        <Dialog open={isSyncJiraDialogOpen} onOpenChange={setIsSyncJiraDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-orange-500" />
                Sync with Jira
              </DialogTitle>
              <DialogDescription>
                Synchronize features with your Jira project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <p className="font-medium text-sm">Jira Connected</p>
                </div>
                <p className="text-sm text-muted-foreground">Project: ROADMAP-2025</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Sync features to Jira</p>
                    <p className="text-xs text-muted-foreground">Create/update Jira issues</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Sync status changes</p>
                    <p className="text-xs text-muted-foreground">Update status in both systems</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Two-way sync</p>
                    <p className="text-xs text-muted-foreground">Pull changes from Jira</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSyncJiraDialogOpen(false)}>Cancel</Button>
              <Button onClick={syncWithJira} className="bg-gradient-to-r from-orange-500 to-amber-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-500" />
                Roadmap Analytics
              </DialogTitle>
              <DialogDescription>
                Insights and metrics for your product roadmap
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-teal-600">{stats.totalFeatures}</p>
                  <p className="text-sm text-muted-foreground">Total Features</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.released}</p>
                  <p className="text-sm text-muted-foreground">Released</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.avgProgress.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Feature Distribution by Status</h4>
                <div className="space-y-2">
                  {['backlog', 'planned', 'in_progress', 'review', 'released'].map((status) => {
                    const count = features.filter(f => f.status === status).length
                    const percentage = (count / features.length) * 100
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status.replace('_', ' ')}</span>
                          <span>{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Top Voted Features</h4>
                <div className="space-y-2">
                  {features.sort((a, b) => b.votes - a.votes).slice(0, 3).map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">{feature.title}</span>
                      <Badge variant="secondary">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {feature.votes}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAnalyticsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Add Comment
              </DialogTitle>
              <DialogDescription>
                Comment on {selectedFeature?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Write your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitComment} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <MessageSquare className="w-4 h-4 mr-2" />
                Post Comment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Vote Dialog */}
        <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-amber-500" />
                Vote for Feature
              </DialogTitle>
              <DialogDescription>
                Your vote helps prioritize this feature
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedFeature?.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedFeature?.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="secondary">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {selectedFeature?.votes} votes
                  </Badge>
                  <Badge variant="outline">{selectedFeature?.status.replace('_', ' ')}</Badge>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Click confirm to add your vote to this feature
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVoteDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitVote} className="bg-gradient-to-r from-amber-500 to-orange-600">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Confirm Vote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Import Features
              </DialogTitle>
              <DialogDescription>
                Bulk import features from a CSV file
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Drop your CSV file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                <input type="file" className="hidden" accept=".csv" />
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Required columns:</strong> title, description, priority, quarter, theme, team
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleImportFile} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Confirmation Dialog */}
        <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                Archive Completed Features
              </DialogTitle>
              <DialogDescription>
                This will archive all released features
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">
                You are about to archive <strong>{features.filter(f => f.status === 'released').length}</strong> released features.
                Archived features can be viewed in the archive section but will no longer appear in the main roadmap.
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This action can be reversed from the archive section.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmArchive} className="bg-amber-600 hover:bg-amber-700">
                Archive Features
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Roadmap
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">
                You are about to permanently delete this roadmap including all features, releases, and associated data.
              </p>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  Warning: This action is irreversible. All data will be permanently lost.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmDelete} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integration Dialog */}
        <Dialog open={isIntegrationDialogOpen} onOpenChange={setIsIntegrationDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-purple-500" />
                {selectedIntegration} Integration
              </DialogTitle>
              <DialogDescription>
                Configure your {selectedIntegration} integration settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Connection Status</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Check className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm">Auto-sync enabled</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Notify on changes</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700" aria-label="Close">
                  <X className="w-4 h-4 mr-2" />
                Disconnect Integration
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIntegrationDialogOpen(false)}>Close</Button>
              <Button className="bg-gradient-to-r from-purple-500 to-violet-600">
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Timeline Dialog */}
        <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GanttChart className="w-5 h-5 text-teal-500" />
                Roadmap Timeline
              </DialogTitle>
              <DialogDescription>
                Visual timeline of all planned features and releases
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6 py-4">
                {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map((quarter) => {
                  const quarterFeatures = features.filter(f => f.quarter === quarter)
                  return (
                    <div key={quarter} className="relative pl-8 pb-6 border-l-2 border-teal-200 dark:border-teal-800">
                      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                        {quarter[1]}
                      </div>
                      <div className="mb-4">
                        <h4 className="font-semibold text-lg">{quarter} 2025</h4>
                        <p className="text-sm text-muted-foreground">{quarterFeatures.length} features planned</p>
                      </div>
                      <div className="space-y-2">
                        {quarterFeatures.map((feature) => (
                          <div key={feature.id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(feature.status)} variant="secondary">
                                {feature.status.replace('_', ' ')}
                              </Badge>
                              <span className="font-medium">{feature.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={feature.progress} className="w-20 h-2" />
                              <span className="text-sm text-muted-foreground">{feature.progress}%</span>
                            </div>
                          </div>
                        ))}
                        {quarterFeatures.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">No features planned for this quarter</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTimelineDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Insight Action Dialog */}
        <Dialog open={isInsightDialogOpen} onOpenChange={setIsInsightDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Take Action on Insight
              </DialogTitle>
              <DialogDescription>
                Process this AI-generated insight
              </DialogDescription>
            </DialogHeader>
            {selectedInsight && (
              <div className="space-y-4 py-4">
                <div className={`p-4 rounded-lg ${
                  selectedInsight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' :
                  selectedInsight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-200'
                } border`}>
                  <h4 className="font-semibold">{selectedInsight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedInsight.description}</p>
                  <Badge variant="outline" className="mt-2">{selectedInsight.category}</Badge>
                </div>
                <div>
                  <Label>Action to take</Label>
                  <Select defaultValue="acknowledge">
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acknowledge">Acknowledge</SelectItem>
                      <SelectItem value="investigate">Investigate further</SelectItem>
                      <SelectItem value="create_task">Create task</SelectItem>
                      <SelectItem value="dismiss">Dismiss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea placeholder="Add any notes about this insight..." className="mt-2" />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInsightDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  toast.success('Action Completed'" has been processed` })
                  setIsInsightDialogOpen(false)
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
