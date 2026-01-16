'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Store,
  Search,
  Download,
  Star,
  TrendingUp,
  Package,
  Settings,
  Grid3X3,
  List,
  Filter,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Trash2,
  ExternalLink,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Code,
  BarChart3,
  DollarSign,
  Users,
  Zap,
  Award,
  ChevronRight,
  Sparkles,
  Crown,
  Gift,
  Tag,
  Building2,
  MoreHorizontal,
  Layers,
  Sliders,
  Terminal,
  Webhook,
  Bell,
  Network
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

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CardDescription } from '@/components/ui/card'
import { updateFilesViewMode } from '@/lib/storage/preferences-queries'

// ============================================================================
// TYPE DEFINITIONS - App Store Connect Level
// ============================================================================

type AppStatus = 'installed' | 'available' | 'updating' | 'trial' | 'suspended' | 'pending'
type AppCategory = 'business' | 'productivity' | 'creative' | 'finance' | 'education' | 'utilities' | 'developer' | 'social' | 'communication' | 'analytics'
type AppPricing = 'free' | 'freemium' | 'paid' | 'subscription' | 'enterprise'
type Platform = 'web' | 'desktop' | 'mobile' | 'api'

interface App {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  developer: Developer
  category: AppCategory
  subcategory?: string
  pricing: AppPricing
  price: number
  billingCycle?: 'monthly' | 'yearly' | 'one_time'
  status: AppStatus
  version: string
  releaseDate: string
  lastUpdated: string
  size: number
  platforms: Platform[]
  screenshots: string[]
  icon: string
  rating: number
  reviewCount: number
  downloadCount: number
  activeUsers: number
  features: string[]
  requirements: string[]
  permissions: string[]
  languages: string[]
  trialDays: number
  trialActive: boolean
  trialEndsAt?: string
  installedAt?: string
  featured: boolean
  editorChoice: boolean
  trending: boolean
  inAppPurchases: boolean
  tags: string[]
}

interface Developer {
  id: string
  name: string
  website: string
  email: string
  verified: boolean
  appCount: number
  totalDownloads: number
  avgRating: number
}

interface Review {
  id: string
  appId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  helpful: number
  notHelpful: number
  version: string
  createdAt: string
  developerResponse?: {
    content: string
    respondedAt: string
  }
}

interface AppCollection {
  id: string
  name: string
  description: string
  icon: string
  apps: string[]
  featured: boolean
}

interface AppUpdate {
  id: string
  appId: string
  appName: string
  currentVersion: string
  newVersion: string
  releaseNotes: string
  size: number
  availableAt: string
  autoUpdate: boolean
}

interface Analytics {
  totalApps: number
  installedApps: number
  trialApps: number
  pendingUpdates: number
  totalSpend: number
  monthlySpend: number
  storageUsed: number
  apiCalls: number
  topCategories: { category: AppCategory; count: number }[]
  recentActivity: { action: string; appName: string; time: string }[]
  downloadsTrend: { date: string; downloads: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockDevelopers: Developer[] = [
  { id: 'dev-1', name: 'Productivity Labs', website: 'productivitylabs.io', email: 'support@productivitylabs.io', verified: true, appCount: 12, totalDownloads: 2500000, avgRating: 4.7 },
  { id: 'dev-2', name: 'Creative Suite Co', website: 'creativesuite.co', email: 'hello@creativesuite.co', verified: true, appCount: 8, totalDownloads: 1800000, avgRating: 4.5 },
  { id: 'dev-3', name: 'DataFlow Inc', website: 'dataflow.io', email: 'support@dataflow.io', verified: true, appCount: 5, totalDownloads: 950000, avgRating: 4.8 },
  { id: 'dev-4', name: 'CommTools', website: 'commtools.app', email: 'team@commtools.app', verified: false, appCount: 3, totalDownloads: 340000, avgRating: 4.3 }
]

const mockApps: App[] = [
  {
    id: 'app-1',
    name: 'TaskFlow Pro',
    slug: 'taskflow-pro',
    tagline: 'The ultimate project management solution',
    description: 'TaskFlow Pro helps teams organize, track, and manage their work in one place. Features include Kanban boards, Gantt charts, time tracking, and real-time collaboration.',
    developer: mockDevelopers[0],
    category: 'productivity',
    subcategory: 'Project Management',
    pricing: 'subscription',
    price: 12.99,
    billingCycle: 'monthly',
    status: 'installed',
    version: '5.2.1',
    releaseDate: '2023-01-15',
    lastUpdated: '2024-12-20',
    size: 45000000,
    platforms: ['web', 'desktop', 'mobile'],
    screenshots: ['/screenshots/taskflow-1.png', '/screenshots/taskflow-2.png'],
    icon: '/icons/taskflow.png',
    rating: 4.8,
    reviewCount: 12450,
    downloadCount: 890000,
    activeUsers: 245000,
    features: ['Kanban Boards', 'Gantt Charts', 'Time Tracking', 'Team Collaboration', 'Custom Workflows', 'API Access'],
    requirements: ['Modern browser', '2GB RAM minimum'],
    permissions: ['Calendar access', 'Notifications', 'File storage'],
    languages: ['English', 'Spanish', 'French', 'German', 'Japanese'],
    trialDays: 14,
    trialActive: false,
    installedAt: '2024-06-15T10:00:00Z',
    featured: true,
    editorChoice: true,
    trending: true,
    inAppPurchases: true,
    tags: ['productivity', 'project-management', 'team', 'collaboration']
  },
  {
    id: 'app-2',
    name: 'DesignStudio Max',
    slug: 'designstudio-max',
    tagline: 'Professional design tools for everyone',
    description: 'DesignStudio Max provides professional-grade design tools including vector graphics, photo editing, prototyping, and collaborative design features.',
    developer: mockDevelopers[1],
    category: 'creative',
    subcategory: 'Design Tools',
    pricing: 'subscription',
    price: 24.99,
    billingCycle: 'monthly',
    status: 'trial',
    version: '3.8.0',
    releaseDate: '2022-08-20',
    lastUpdated: '2024-12-18',
    size: 120000000,
    platforms: ['web', 'desktop'],
    screenshots: ['/screenshots/designstudio-1.png'],
    icon: '/icons/designstudio.png',
    rating: 4.6,
    reviewCount: 8920,
    downloadCount: 567000,
    activeUsers: 123000,
    features: ['Vector Graphics', 'Photo Editing', 'Prototyping', 'Collaborative Design', 'Asset Library', 'Export to Multiple Formats'],
    requirements: ['8GB RAM recommended', 'GPU acceleration supported'],
    permissions: ['File access', 'Cloud storage sync'],
    languages: ['English', 'Spanish', 'Portuguese', 'Chinese'],
    trialDays: 14,
    trialActive: true,
    trialEndsAt: '2025-01-05T00:00:00Z',
    featured: true,
    editorChoice: false,
    trending: true,
    inAppPurchases: true,
    tags: ['design', 'creative', 'graphics', 'prototyping']
  },
  {
    id: 'app-3',
    name: 'DataViz Analytics',
    slug: 'dataviz-analytics',
    tagline: 'Transform data into insights',
    description: 'DataViz Analytics provides powerful data visualization and business intelligence tools. Connect to any data source and create stunning dashboards in minutes.',
    developer: mockDevelopers[2],
    category: 'analytics',
    subcategory: 'Business Intelligence',
    pricing: 'enterprise',
    price: 99.99,
    billingCycle: 'monthly',
    status: 'available',
    version: '2.5.0',
    releaseDate: '2023-06-10',
    lastUpdated: '2024-12-15',
    size: 85000000,
    platforms: ['web', 'api'],
    screenshots: [],
    icon: '/icons/dataviz.png',
    rating: 4.9,
    reviewCount: 3240,
    downloadCount: 234000,
    activeUsers: 89000,
    features: ['50+ Data Connectors', 'Real-time Dashboards', 'AI-Powered Insights', 'Custom Visualizations', 'Scheduled Reports', 'Team Workspaces'],
    requirements: ['Enterprise SSO compatible', 'API rate limits apply'],
    permissions: ['Data source access', 'Export permissions'],
    languages: ['English', 'German', 'French'],
    trialDays: 30,
    trialActive: false,
    featured: true,
    editorChoice: true,
    trending: false,
    inAppPurchases: false,
    tags: ['analytics', 'data', 'business-intelligence', 'dashboards']
  },
  {
    id: 'app-4',
    name: 'TeamChat',
    slug: 'teamchat',
    tagline: 'Real-time team communication',
    description: 'TeamChat brings your team together with instant messaging, video calls, screen sharing, and integrations with your favorite tools.',
    developer: mockDevelopers[3],
    category: 'communication',
    pricing: 'freemium',
    price: 0,
    status: 'installed',
    version: '4.1.2',
    releaseDate: '2022-03-01',
    lastUpdated: '2024-12-22',
    size: 35000000,
    platforms: ['web', 'desktop', 'mobile'],
    screenshots: [],
    icon: '/icons/teamchat.png',
    rating: 4.4,
    reviewCount: 45670,
    downloadCount: 2340000,
    activeUsers: 890000,
    features: ['Instant Messaging', 'Video Calls', 'Screen Sharing', 'File Sharing', 'Channels', 'Integrations'],
    requirements: ['Stable internet connection'],
    permissions: ['Camera', 'Microphone', 'Notifications'],
    languages: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese'],
    trialDays: 0,
    trialActive: false,
    installedAt: '2024-01-10T09:00:00Z',
    featured: false,
    editorChoice: false,
    trending: true,
    inAppPurchases: true,
    tags: ['communication', 'team', 'messaging', 'video']
  },
  {
    id: 'app-5',
    name: 'FinanceHub',
    slug: 'financehub',
    tagline: 'Complete financial management',
    description: 'FinanceHub provides comprehensive financial management including invoicing, expense tracking, budgeting, and financial reporting.',
    developer: mockDevelopers[2],
    category: 'finance',
    subcategory: 'Accounting',
    pricing: 'subscription',
    price: 19.99,
    billingCycle: 'monthly',
    status: 'installed',
    version: '6.0.3',
    releaseDate: '2021-11-15',
    lastUpdated: '2024-12-19',
    size: 55000000,
    platforms: ['web', 'mobile'],
    screenshots: [],
    icon: '/icons/financehub.png',
    rating: 4.7,
    reviewCount: 7890,
    downloadCount: 445000,
    activeUsers: 156000,
    features: ['Invoicing', 'Expense Tracking', 'Budgeting', 'Financial Reports', 'Tax Preparation', 'Multi-Currency'],
    requirements: ['Bank-level encryption'],
    permissions: ['Financial data access', 'Bank connections'],
    languages: ['English', 'Spanish', 'French', 'German'],
    trialDays: 14,
    trialActive: false,
    installedAt: '2024-03-20T14:00:00Z',
    featured: false,
    editorChoice: true,
    trending: false,
    inAppPurchases: false,
    tags: ['finance', 'accounting', 'invoicing', 'budgeting']
  },
  {
    id: 'app-6',
    name: 'CodeEditor Pro',
    slug: 'codeeditor-pro',
    tagline: 'The developers choice IDE',
    description: 'CodeEditor Pro is a powerful integrated development environment with syntax highlighting, debugging, Git integration, and AI-powered code completion.',
    developer: mockDevelopers[0],
    category: 'developer',
    subcategory: 'IDE',
    pricing: 'freemium',
    price: 0,
    status: 'available',
    version: '8.2.1',
    releaseDate: '2020-06-01',
    lastUpdated: '2024-12-21',
    size: 180000000,
    platforms: ['desktop'],
    screenshots: [],
    icon: '/icons/codeeditor.png',
    rating: 4.8,
    reviewCount: 23450,
    downloadCount: 1890000,
    activeUsers: 567000,
    features: ['Syntax Highlighting', 'Debugging', 'Git Integration', 'AI Code Completion', 'Extensions Marketplace', 'Remote Development'],
    requirements: ['4GB RAM minimum', '64-bit OS'],
    permissions: ['File system access', 'Terminal access'],
    languages: ['English'],
    trialDays: 0,
    trialActive: false,
    featured: true,
    editorChoice: true,
    trending: true,
    inAppPurchases: true,
    tags: ['developer', 'ide', 'coding', 'programming']
  }
]

const mockReviews: Review[] = [
  {
    id: 'rev-1',
    appId: 'app-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    rating: 5,
    title: 'Best project management tool ever!',
    content: 'TaskFlow Pro has completely transformed how our team works. The Kanban boards and time tracking features are incredibly intuitive.',
    helpful: 234,
    notHelpful: 12,
    version: '5.2.0',
    createdAt: '2024-12-18T10:00:00Z',
    developerResponse: {
      content: 'Thank you for your wonderful review! We\'re thrilled to hear TaskFlow Pro is helping your team succeed.',
      respondedAt: '2024-12-19T09:00:00Z'
    }
  },
  {
    id: 'rev-2',
    appId: 'app-1',
    userId: 'user-2',
    userName: 'Mike Chen',
    rating: 4,
    title: 'Great app, minor improvements needed',
    content: 'Overall excellent experience. Would love to see better mobile app performance and more customization options for Gantt charts.',
    helpful: 89,
    notHelpful: 5,
    version: '5.1.8',
    createdAt: '2024-12-15T14:00:00Z'
  }
]

const mockCollections: AppCollection[] = [
  { id: 'col-1', name: 'Essential Productivity', description: 'Must-have apps for getting things done', icon: '⚡', apps: ['app-1', 'app-4'], featured: true },
  { id: 'col-2', name: 'Creative Suite', description: 'Tools for designers and creators', icon: '🎨', apps: ['app-2'], featured: true },
  { id: 'col-3', name: 'Developer Tools', description: 'Build amazing software', icon: '💻', apps: ['app-6'], featured: false },
  { id: 'col-4', name: 'Business Essentials', description: 'Run your business efficiently', icon: '📊', apps: ['app-3', 'app-5'], featured: true }
]

const mockUpdates: AppUpdate[] = [
  { id: 'upd-1', appId: 'app-1', appName: 'TaskFlow Pro', currentVersion: '5.2.0', newVersion: '5.2.1', releaseNotes: 'Bug fixes and performance improvements', size: 12000000, availableAt: '2024-12-20T08:00:00Z', autoUpdate: true },
  { id: 'upd-2', appId: 'app-4', appName: 'TeamChat', currentVersion: '4.1.1', newVersion: '4.1.2', releaseNotes: 'New emoji reactions, improved video quality', size: 8000000, availableAt: '2024-12-22T10:00:00Z', autoUpdate: false }
]

const mockAnalytics: Analytics = {
  totalApps: 156,
  installedApps: 12,
  trialApps: 2,
  pendingUpdates: 3,
  totalSpend: 2450.00,
  monthlySpend: 287.00,
  storageUsed: 2.4,
  apiCalls: 45670,
  topCategories: [
    { category: 'productivity', count: 5 },
    { category: 'communication', count: 3 },
    { category: 'developer', count: 2 },
    { category: 'creative', count: 1 },
    { category: 'finance', count: 1 }
  ],
  recentActivity: [
    { action: 'Updated', appName: 'TaskFlow Pro', time: '2 hours ago' },
    { action: 'Installed', appName: 'SmartNotes', time: '1 day ago' },
    { action: 'Started trial', appName: 'DesignStudio Max', time: '3 days ago' },
    { action: 'Renewed subscription', appName: 'FinanceHub', time: '1 week ago' }
  ],
  downloadsTrend: [
    { date: '2024-12-17', downloads: 12 },
    { date: '2024-12-18', downloads: 8 },
    { date: '2024-12-19', downloads: 15 },
    { date: '2024-12-20', downloads: 23 },
    { date: '2024-12-21', downloads: 11 },
    { date: '2024-12-22', downloads: 18 },
    { date: '2024-12-23', downloads: 14 }
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusBadge = (status: AppStatus) => {
  switch (status) {
    case 'installed':
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Installed</Badge>
    case 'available':
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><Download className="w-3 h-3 mr-1" />Available</Badge>
    case 'updating':
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Updating</Badge>
    case 'trial':
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"><Clock className="w-3 h-3 mr-1" />Trial</Badge>
    case 'suspended':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>
    case 'pending':
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
  }
}

const getCategoryBadge = (category: AppCategory) => {
  const colors: Record<AppCategory, string> = {
    business: 'bg-blue-100 text-blue-700',
    productivity: 'bg-green-100 text-green-700',
    creative: 'bg-purple-100 text-purple-700',
    finance: 'bg-emerald-100 text-emerald-700',
    education: 'bg-yellow-100 text-yellow-700',
    utilities: 'bg-gray-100 text-gray-700',
    developer: 'bg-orange-100 text-orange-700',
    social: 'bg-pink-100 text-pink-700',
    communication: 'bg-cyan-100 text-cyan-700',
    analytics: 'bg-indigo-100 text-indigo-700'
  }
  return <Badge className={colors[category]}>{category}</Badge>
}

const getPricingBadge = (pricing: AppPricing, price: number) => {
  switch (pricing) {
    case 'free':
      return <Badge className="bg-green-100 text-green-700">Free</Badge>
    case 'freemium':
      return <Badge className="bg-blue-100 text-blue-700">Freemium</Badge>
    case 'paid':
      return <Badge className="bg-purple-100 text-purple-700">${price}</Badge>
    case 'subscription':
      return <Badge className="bg-indigo-100 text-indigo-700">${price}/mo</Badge>
    case 'enterprise':
      return <Badge className="bg-orange-100 text-orange-700">Enterprise</Badge>
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatBytes = (bytes: number) => {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - App Store Connect Level
// ============================================================================

const mockAppStoreAIInsights = [
  { id: '1', type: 'success' as const, title: 'Top Performer', description: 'Analytics Pro has 98% positive reviews and 50K+ downloads this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Update Available', description: '12 installed apps have pending updates with security patches.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '3', type: 'info' as const, title: 'New Arrivals', description: '8 new productivity apps added to the marketplace this week.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Discovery' },
]

const mockAppStoreCollaborators = [
  { id: '1', name: 'App Curator', avatar: '/avatars/curator.jpg', status: 'online' as const, role: 'Curator' },
  { id: '2', name: 'Developer Lead', avatar: '/avatars/dev.jpg', status: 'online' as const, role: 'Developer' },
  { id: '3', name: 'Security Team', avatar: '/avatars/security.jpg', status: 'away' as const, role: 'Security' },
]

const mockAppStorePredictions = [
  { id: '1', title: 'Usage Forecast', prediction: 'App adoption expected to increase 35% next quarter', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Cost Savings', prediction: 'Bundled apps could save $5K/month vs individual licenses', confidence: 92, trend: 'up' as const, impact: 'medium' as const },
]

const mockAppStoreActivities = [
  { id: '1', user: 'System', action: 'Auto-updated', target: 'Slack integration to v4.2', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Admin', action: 'Approved', target: 'Notion integration for all teams', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'success' as const },
  { id: '3', user: 'Security', action: 'Flagged', target: 'Unknown app for review', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning' as const },
]

// Quick actions are defined inside the component to have access to state setters
const getAppStoreQuickActions = (setActiveTab: (tab: string) => void, setSearchQuery: (query: string) => void) => [
  { id: '1', label: 'Browse Apps', icon: 'search', action: () => { setActiveTab('discover'); setSearchQuery(''); toast.success('Browsing all available apps') }, variant: 'default' as const },
  { id: '2', label: 'Install App', icon: 'plus', action: () => { setActiveTab('discover'); toast.info('Select an app to install from the catalog') }, variant: 'default' as const },
  { id: '3', label: 'Manage Apps', icon: 'settings', action: () => { setActiveTab('installed'); toast.success('App management panel opened') }, variant: 'outline' as const },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AppStoreClient() {

  const router = useRouter()
  const [activeTab, setActiveTab] = useState('discover')
  const [apps, setApps] = useState<App[]>(mockApps)
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [collections, setCollections] = useState<AppCollection[]>(mockCollections)
  const [updates, setUpdates] = useState<AppUpdate[]>(mockUpdates)
  const [analytics, setAnalytics] = useState<Analytics>(mockAnalytics)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | 'all'>('all')
  const [pricingFilter, setPricingFilter] = useState<AppPricing | 'all'>('all')
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewContent, setReviewContent] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [settingsTab, setSettingsTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Fetch user on mount
  useEffect(() => {
    const getUser = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [supabase.auth])

  // Fetch apps from database
  const fetchApps = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      // Fetch plugins from database
      const { data: plugins, error } = await supabase
        .from('plugins')
        .select(`
          *,
          plugin_authors (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch installed plugins for current user
      const { data: installedPlugins } = await supabase
        .from('installed_plugins')
        .select('plugin_id, installed_version, installed_at, is_active')
        .eq('user_id', userId)

      const installedMap = new Map(installedPlugins?.map(p => [p.plugin_id, p]) || [])

      if (plugins && plugins.length > 0) {
        const mappedApps: App[] = plugins.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          tagline: p.description?.substring(0, 100) || '',
          description: p.long_description || p.description || '',
          developer: {
            id: p.plugin_authors?.id || 'unknown',
            name: p.plugin_authors?.name || 'Unknown Developer',
            website: p.plugin_authors?.website || '',
            email: p.plugin_authors?.email || '',
            verified: p.plugin_authors?.verified || false,
            appCount: p.plugin_authors?.total_plugins || 0,
            totalDownloads: p.plugin_authors?.total_installs || 0,
            avgRating: 4.5
          },
          category: p.category || 'productivity',
          pricing: p.pricing_type || 'free',
          price: Number(p.price) || 0,
          status: installedMap.has(p.id) ? 'installed' : 'available',
          version: p.version || '1.0.0',
          releaseDate: p.created_at,
          lastUpdated: p.updated_at,
          size: p.file_size || 0,
          platforms: ['web'],
          screenshots: p.screenshots || [],
          icon: p.icon || '',
          rating: Number(p.rating) || 0,
          reviewCount: p.review_count || 0,
          downloadCount: p.install_count || 0,
          activeUsers: p.active_installs || 0,
          features: p.tags || [],
          requirements: p.requirements || [],
          permissions: [],
          languages: ['English'],
          trialDays: 14,
          trialActive: false,
          installedAt: installedMap.get(p.id)?.installed_at,
          featured: p.is_featured || false,
          editorChoice: p.is_verified || false,
          trending: p.is_trending || false,
          inAppPurchases: false,
          tags: p.tags || []
        }))
        setApps(mappedApps.length > 0 ? mappedApps : mockApps)
      }
    } catch (error: any) {
      console.error('Error fetching apps:', error)
      // Keep mock data if database fetch fails
    } finally {
      setLoading(false)
    }
  }, [ userId])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  // Filtered apps
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = !searchQuery ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter
      const matchesPricing = pricingFilter === 'all' || app.pricing === pricingFilter
      return matchesSearch && matchesStatus && matchesCategory && matchesPricing
    })
  }, [apps, searchQuery, statusFilter, categoryFilter, pricingFilter])

  // Stats
  const stats = useMemo(() => ({
    total: apps.length,
    installed: apps.filter(a => a.status === 'installed').length,
    trials: apps.filter(a => a.status === 'trial').length,
    updates: updates.length,
    totalDownloads: apps.reduce((sum, a) => sum + a.downloadCount, 0),
    avgRating: apps.reduce((sum, a) => sum + a.rating, 0) / apps.length,
    monthlySpend: analytics.monthlySpend,
    featured: apps.filter(a => a.featured).length
  }), [apps, updates, analytics])

  const handleViewApp = (app: App) => {
    setSelectedApp(app)
    setShowAppDialog(true)
  }

  const featuredApps = apps.filter(a => a.featured)
  const trendingApps = apps.filter(a => a.trending)
  const editorChoiceApps = apps.filter(a => a.editorChoice)

  // Real handler: Open app in new tab or navigate to app page
  const handleOpenApp = (app: App, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const appUrl = app.developer.website ? `https://${app.developer.website}` : `/dashboard/apps/${app.slug}`
    window.open(appUrl, '_blank')
    toast.success(`Opening ${app.name}`)
  }

  // Real handler: Open app settings
  const handleOpenSettings = (app: App) => {
    router.push(`/dashboard/app-store-v2/settings/${app.slug}`)
    toast.success(`Opening settings for ${app.name}`)
  }

  // Real handler: Submit review
  const handleSubmitReview = async () => {
    if (!selectedApp || !userId) {
      toast.error('Please sign in to submit a review')
      return
    }
    if (!reviewTitle.trim() || !reviewContent.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('plugin_reviews')
        .upsert({
          plugin_id: selectedApp.id,
          user_id: userId,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewContent,
          verified: true
        }, { onConflict: 'plugin_id,user_id' })

      if (error) throw error

      toast.success('Review submitted successfully!')
      setShowReviewDialog(false)
      setReviewTitle('')
      setReviewContent('')
      setReviewRating(5)
      await fetchApps()
    } catch (error: any) {
      toast.error('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  // Real handler: Navigate to checkout for purchase
  const handlePurchase = (app: App, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (app.pricing === 'enterprise') {
      // For enterprise, navigate to contact sales
      router.push(`/dashboard/billing?app=${app.slug}&type=enterprise`)
      toast.info('Redirecting to enterprise sales...')
    } else {
      // For paid apps, navigate to checkout
      router.push(`/dashboard/billing/checkout?app=${app.slug}&price=${app.price}`)
      toast.info('Redirecting to checkout...')
    }
  }

  // Handlers - Real Supabase CRUD operations
  const handleInstallApp = async (app: App) => {
    if (!userId) {
      toast.error('Please sign in to install apps')
      return
    }
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('installed_plugins')
        .insert({
          plugin_id: app.id,
          user_id: userId,
          installed_version: app.version,
          is_active: true,
          settings: {}
        })

      if (error) throw error

      // Update install count
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase
        .from('plugins')
        .update({ install_count: app.downloadCount + 1 })
        .eq('id', app.id)

      // Record download
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase
        .from('plugin_downloads')
        .insert({
          plugin_id: app.id,
          user_id: userId,
          version: app.version
        })

      toast.success('App installed successfully'" has been installed`
      })
      await fetchApps()
    } catch (error: any) {
      toast.error('Failed to install app')
    } finally {
      setLoading(false)
    }
  }

  const handleUninstallApp = async (app: App) => {
    if (!userId) {
      toast.error('Please sign in')
      return
    }

    // Confirm before uninstalling
    if (!confirm(`Are you sure you want to uninstall "${app.name}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('installed_plugins')
        .delete()
        .eq('plugin_id', app.id)
        .eq('user_id', userId)

      if (error) throw error

      toast.success('App uninstalled'" has been removed`
      })
      await fetchApps()
    } catch (error: any) {
      toast.error('Failed to uninstall')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateApp = async (update: AppUpdate) => {
    if (!userId) {
      toast.error('Please sign in')
      return
    }
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('installed_plugins')
        .update({ installed_version: update.newVersion, updated_at: new Date().toISOString() })
        .eq('plugin_id', update.appId)
        .eq('user_id', userId)

      if (error) throw error

      toast.success('App updated'" updated to v${update.newVersion}`
      })
      setUpdates(prev => prev.filter(u => u.id !== update.id))
      await fetchApps()
    } catch (error: any) {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRateApp = async (app: App, rating: number, title: string, comment: string) => {
    if (!userId) {
      toast.error('Please sign in to rate apps')
      return
    }
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('plugin_reviews')
        .upsert({
          plugin_id: app.id,
          user_id: userId,
          rating,
          title,
          comment,
          verified: true
        }, { onConflict: 'plugin_id,user_id' })

      if (error) throw error

      toast.success('Rating submitted'"`
      })
      await fetchApps()
    } catch (error: any) {
      toast.error('Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTrial = async (app: App) => {
    if (!userId) {
      toast.error('Please sign in to start a trial')
      return
    }
    setLoading(true)
    try {
      const trialEnds = new Date()
      trialEnds.setDate(trialEnds.getDate() + app.trialDays)

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('installed_plugins')
        .insert({
          plugin_id: app.id,
          user_id: userId,
          installed_version: app.version,
          is_active: true,
          settings: { trial: true, trial_ends_at: trialEnds.toISOString() }
        })

      if (error) throw error

      toast.success('Trial started'-day trial for "${app.name}" has begun`
      })
      await fetchApps()
    } catch (error: any) {
      toast.error('Failed to start trial')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWishlist = async (app: App) => {
    if (!userId) {
      toast.error('Please sign in')
      return
    }
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('plugin_wishlists')
        .insert({
          plugin_id: app.id,
          user_id: userId
        })

      if (error) throw error

      toast.success('Added to wishlist'" added to your wishlist`
      })
    } catch (error: any) {
      toast.error('Failed to add to wishlist')
    }
  }

  const handleUpdateAll = async () => {
    if (!userId || updates.length === 0) return
    setLoading(true)
    try {
      for (const update of updates) {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        await supabase
          .from('installed_plugins')
          .update({ installed_version: update.newVersion, updated_at: new Date().toISOString() })
          .eq('plugin_id', update.appId)
          .eq('user_id', userId)
      }
      toast.success('All apps updated' apps have been updated`
      })
      setUpdates([])
      await fetchApps()
    } catch (error: any) {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle view mode change with persistence
  const handleViewModeChange = async (mode: 'grid' | 'list') => {
    setViewMode(mode)
    if (userId) {
      const success = await updateFilesViewMode(userId, mode)
      if (success) {
        toast.success(`${mode === 'grid' ? 'Grid' : 'List'} view set as default`)
      } else {
        toast.success(`${mode === 'grid' ? 'Grid' : 'List'} view selected`)
      }
    } else {
      toast.success(`${mode === 'grid' ? 'Grid' : 'List'} view selected`)
    }
  }

  // Handle AI insight action
  const handleInsightAction = (insight: { id?: string; title?: string; description?: string; type?: string }) => {
    // Navigate based on insight type or show details
    if (insight.type === 'recommendation') {
      setActiveTab('discover')
      toast.info(insight.title || 'Recommendation')
    } else if (insight.type === 'alert') {
      setActiveTab('installed')
      toast.warning(insight.title || 'Alert')
    } else if (insight.type === 'update') {
      setActiveTab('updates')
      toast.info(insight.title || 'Updates Available')
    } else {
      // Default: show insight details in a toast with action
      toast.info(insight.title || 'AI Insight'
      })
    }
  }

  // Generate quick actions with current state
  const mockAppStoreQuickActions = getAppStoreQuickActions(setActiveTab, setSearchQuery)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">App Store</h1>
                <p className="text-indigo-100">Discover and install powerful applications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                <Package className="w-4 h-4 mr-2" />
                My Apps
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm">Total Apps</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Installed</span>
              </div>
              <p className="text-2xl font-bold">{stats.installed}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Trials</span>
              </div>
              <p className="text-2xl font-bold">{stats.trials}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Updates</span>
              </div>
              <p className="text-2xl font-bold">{stats.updates}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Download className="w-4 h-4" />
                <span className="text-sm">Downloads</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalDownloads)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-sm">Avg Rating</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Monthly</span>
              </div>
              <p className="text-2xl font-bold">${stats.monthlySpend}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Featured</span>
              </div>
              <p className="text-2xl font-bold">{stats.featured}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="installed" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Installed
              </TabsTrigger>
              <TabsTrigger value="updates" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Updates
                {updates.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{updates.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Collections
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center border rounded-lg p-1 bg-white dark:bg-gray-800">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('grid')
                    toast.success('Grid view enabled')
                  }}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('list')
                    toast.success('List view enabled')
                  }}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-8">
            {/* Featured Banner */}
            <Card className="overflow-hidden dark:bg-gray-800/50">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="text-sm font-medium">FEATURED</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">{featuredApps[0]?.name}</h2>
                <p className="text-indigo-100 mb-4">{featuredApps[0]?.tagline}</p>
                <div className="flex items-center gap-4">
                  <Button
                    className="bg-white text-indigo-600 hover:bg-indigo-50"
                    onClick={() => featuredApps[0] && handleInstallApp(featuredApps[0])}
                    disabled={loading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Get App
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => featuredApps[0] && handleViewApp(featuredApps[0])}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>

            {/* Discover Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Sparkles, label: 'For You', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: TrendingUp, label: 'Trending', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Award, label: 'Top Charts', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { icon: Zap, label: 'New Apps', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Gift, label: 'Free Today', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Tag, label: 'On Sale', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Users, label: 'Team Picks', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Heart, label: 'Wishlist', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Editor's Choice */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Editor's Choice
                </h3>
                <Button variant="ghost" size="sm">
                  See All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editorChoiceApps.slice(0, 3).map((app) => (
                  <Card
                    key={app.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50"
                    onClick={() => handleViewApp(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {app.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{app.name}</h4>
                            <Award className="w-4 h-4 text-yellow-500" />
                          </div>
                          <p className="text-sm text-muted-foreground">{app.developer.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{app.tagline}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{app.rating.toFixed(1)}</span>
                        </div>
                        {getPricingBadge(app.pricing, app.price)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trending Now */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Trending Now
                </h3>
                <Button variant="ghost" size="sm">
                  See All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingApps.map((app) => (
                  <Card
                    key={app.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50"
                    onClick={() => handleViewApp(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                          {app.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{app.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{app.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{app.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">{formatNumber(app.downloadCount)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Collections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  Featured Collections
                </h3>
                <Button variant="ghost" size="sm">
                  See All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {collections.filter(c => c.featured).map((collection) => (
                  <Card key={collection.id} className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{collection.icon}</div>
                      <h4 className="font-semibold mb-1">{collection.name}</h4>
                      <p className="text-sm text-muted-foreground">{collection.apps.length} apps</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as AppStatus | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="installed">Installed</option>
                    <option value="available">Available</option>
                    <option value="trial">Trial</option>
                    <option value="updating">Updating</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as AppCategory | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="productivity">Productivity</option>
                    <option value="creative">Creative</option>
                    <option value="developer">Developer</option>
                    <option value="communication">Communication</option>
                    <option value="finance">Finance</option>
                    <option value="analytics">Analytics</option>
                  </select>
                  <select
                    value={pricingFilter}
                    onChange={(e) => setPricingFilter(e.target.value as AppPricing | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Pricing</option>
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="subscription">Subscription</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <div className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {filteredApps.length} apps
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Apps Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
              {filteredApps.map((app) => (
                <Card
                  key={app.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50"
                  onClick={() => handleViewApp(app)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {app.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold truncate">{app.name}</h4>
                          {app.editorChoice && <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{app.developer.name}</p>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{app.tagline}</p>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {getCategoryBadge(app.category)}
                      {getPricingBadge(app.pricing, app.price)}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{app.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({formatNumber(app.reviewCount)})</span>
                      </div>
                      <span className="text-muted-foreground">{formatNumber(app.downloadCount)}</span>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      {app.status === 'installed' ? (
                        <>
                          <Button size="sm" className="flex-1" onClick={(e) => handleOpenApp(app, e)}>
                            <Play className="w-4 h-4 mr-1" />
                            Open
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleUninstallApp(app) }} disabled={loading}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </>
                      ) : app.status === 'trial' ? (
                        <>
                          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={(e) => handlePurchase(app, e)} disabled={loading}>
                            Purchase
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => handleOpenApp(app, e)}>
                            <Play className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleInstallApp(app) }} disabled={loading}>
                            <Download className="w-4 h-4 mr-1" />
                            Get
                          </Button>
                          {app.trialDays > 0 && (
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleStartTrial(app) }} disabled={loading}>
                              Try Free
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Installed Apps ({apps.filter(a => a.status === 'installed' || a.status === 'trial').length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {apps.filter(a => a.status === 'installed' || a.status === 'trial').map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center gap-4 p-4 rounded-lg border dark:border-gray-700 hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleViewApp(app)}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {app.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{app.name}</h4>
                              {getStatusBadge(app.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">v{app.version} • {formatBytes(app.size)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={(e) => handleOpenApp(app, e)}>
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenSettings(app) }}>
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={(e) => { e.stopPropagation(); handleUninstallApp(app) }} disabled={loading}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Storage Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold">{analytics.storageUsed} GB</p>
                      <p className="text-sm text-muted-foreground">of 10 GB used</p>
                    </div>
                    <Progress value={(analytics.storageUsed / 10) * 100} className="h-2" />
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Monthly Spending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold">${analytics.monthlySpend}</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <Card className="dark:bg-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Available Updates ({updates.length})</CardTitle>
                <Button onClick={handleUpdateAll} disabled={loading || updates.length === 0}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Update All
                </Button>
              </CardHeader>
              <CardContent>
                {updates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>All apps are up to date!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {updates.map((update) => (
                      <div key={update.id} className="flex items-center gap-4 p-4 rounded-lg border dark:border-gray-700">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {update.appName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{update.appName}</h4>
                          <p className="text-sm text-muted-foreground">
                            v{update.currentVersion} {'->'} v{update.newVersion} - {formatBytes(update.size)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{update.releaseNotes}</p>
                        </div>
                        <Button onClick={() => handleUpdateApp(update)} disabled={loading}>
                          <Download className="w-4 h-4 mr-2" />
                          Update
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-4">{collection.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                    <p className="text-muted-foreground mb-4">{collection.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{collection.apps.length} apps</Badge>
                      {collection.featured && (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">App Analytics</h2>
                  <p className="text-emerald-100">Track usage, performance, and spending</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center"><p className="text-3xl font-bold">{analytics.installedApps}</p><p className="text-emerald-200 text-sm">Apps</p></div>
                  <div className="text-center"><p className="text-3xl font-bold">${analytics.totalSpend}</p><p className="text-emerald-200 text-sm">Spent</p></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Spend</span>
                    <DollarSign className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">${analytics.totalSpend}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">API Calls</span>
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(analytics.apiCalls)}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Storage</span>
                    <Package className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.storageUsed} GB</p>
                  <p className="text-xs text-muted-foreground">of 10 GB</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Active Apps</span>
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.installedApps}</p>
                  <p className="text-xs text-muted-foreground">Running now</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Download Trend */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Activity Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {analytics.downloadsTrend.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg"
                          style={{ height: `${(day.downloads / 25) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Apps by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topCategories.map((cat, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm capitalize">{cat.category}</span>
                          <span className="font-semibold">{cat.count} apps</span>
                        </div>
                        <Progress value={(cat.count / analytics.installedApps) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        {activity.action === 'Updated' && <RefreshCw className="w-5 h-5 text-indigo-600" />}
                        {activity.action === 'Installed' && <Download className="w-5 h-5 text-green-600" />}
                        {activity.action === 'Started trial' && <Clock className="w-5 h-5 text-purple-600" />}
                        {activity.action === 'Renewed subscription' && <DollarSign className="w-5 h-5 text-emerald-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}: {activity.appName}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - App Store Connect Level Configuration */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">App Store Settings</h2>
                  <p className="text-slate-200">App Store Connect-level configuration and preferences</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-slate-200 text-sm">Setting Groups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">32+</p>
                    <p className="text-slate-200 text-sm">Options</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Settings, label: 'General', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
                { icon: Download, label: 'Downloads', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Bell, label: 'Notifications', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Network, label: 'Integrations', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Shield, label: 'Security', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Terminal, label: 'Advanced', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: DollarSign, label: 'Billing', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: RefreshCw, label: 'Reset', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'downloads', label: 'Downloads', icon: Download },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Display Preferences</CardTitle>
                        <CardDescription>Customize how apps are displayed in the store</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Default View Mode</Label><p className="text-sm text-gray-500">Grid or list view</p></div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewModeChange('grid')}><Grid3X3 className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleViewModeChange('list')}><List className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Apps Per Page</Label><p className="text-sm text-gray-500">Number of apps to display</p></div>
                          <Input type="number" defaultValue="24" className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Show Ratings</Label><p className="text-sm text-gray-500">Display star ratings</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Show Prices</Label><p className="text-sm text-gray-500">Display pricing info</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Region & Language</CardTitle>
                        <CardDescription>Set your store region and language preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Store Region</Label><p className="text-sm text-gray-500">Your geographic region</p></div>
                          <Input defaultValue="United States" className="w-48" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Language</Label><p className="text-sm text-gray-500">Display language</p></div>
                          <Input defaultValue="English" className="w-48" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Currency</Label><p className="text-sm text-gray-500">Price display currency</p></div>
                          <Input defaultValue="USD" className="w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'downloads' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Download Preferences</CardTitle>
                        <CardDescription>Configure how apps are downloaded and installed</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Auto-Install Updates</Label><p className="text-sm text-gray-500">Install updates automatically</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Download Over WiFi Only</Label><p className="text-sm text-gray-500">Save mobile data</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Parallel Downloads</Label><p className="text-sm text-gray-500">Max concurrent downloads</p></div>
                          <Input type="number" defaultValue="3" className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Download Location</Label><p className="text-sm text-gray-500">Default install path</p></div>
                          <Input defaultValue="/Applications" className="w-48" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Control what notifications you receive</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Update Notifications</Label><p className="text-sm text-gray-500">App update alerts</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">New App Recommendations</Label><p className="text-sm text-gray-500">Personalized suggestions</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Price Drop Alerts</Label><p className="text-sm text-gray-500">Wishlist price changes</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Trial Expiration Reminders</Label><p className="text-sm text-gray-500">Before trial ends</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Email Notifications</Label><p className="text-sm text-gray-500">Receive via email</p></div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Manage app store integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Apple App Store', connected: true, icon: '🍎' },
                          { name: 'Google Play', connected: true, icon: '🤖' },
                          { name: 'Microsoft Store', connected: false, icon: '🪟' },
                          { name: 'Slack', connected: true, icon: '💬' },
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.connected ? 'Connected' : 'Not connected'}</p>
                              </div>
                            </div>
                            <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                              {integration.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Protect your app store account</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Require Password for Purchases</Label><p className="text-sm text-gray-500">Additional verification</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Biometric Authentication</Label><p className="text-sm text-gray-500">Face ID or Touch ID</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">App Permissions Review</Label><p className="text-sm text-gray-500">Review before install</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Malware Scanning</Label><p className="text-sm text-gray-500">Scan before install</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Developer Options</CardTitle>
                        <CardDescription>Advanced settings for developers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Developer Mode</Label><p className="text-sm text-gray-500">Enable developer features</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Beta Apps</Label><p className="text-sm text-gray-500">Show beta versions</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Debug Logging</Label><p className="text-sm text-gray-500">Enable verbose logs</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">API Access</Label><p className="text-sm text-gray-500">Enable API endpoints</p></div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Cache & Storage</CardTitle>
                        <CardDescription>Manage app store data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">App Cache</p><p className="text-sm text-gray-500">1.2 GB used</p></div>
                          <Button variant="outline" size="sm">Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">Download History</p><p className="text-sm text-gray-500">256 MB used</p></div>
                          <Button variant="outline" size="sm">Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">Search History</p><p className="text-sm text-gray-500">12 MB used</p></div>
                          <Button variant="outline" size="sm">Clear</Button>
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
              insights={mockAppStoreAIInsights}
              title="App Store Intelligence"
              onInsightAction={handleInsightAction}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAppStoreCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAppStorePredictions}
              title="App Store Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAppStoreActivities}
            title="App Store Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockAppStoreQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* App Detail Dialog */}
      <Dialog open={showAppDialog} onOpenChange={setShowAppDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedApp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DialogTitle className="text-2xl">{selectedApp.name}</DialogTitle>
                      {selectedApp.editorChoice && <Award className="w-5 h-5 text-yellow-500" />}
                      {selectedApp.developer.verified && <Shield className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-muted-foreground">{selectedApp.developer.name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {getStatusBadge(selectedApp.status)}
                      {getCategoryBadge(selectedApp.category)}
                      {getPricingBadge(selectedApp.pricing, selectedApp.price)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">{selectedApp.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatNumber(selectedApp.reviewCount)} reviews</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{formatNumber(selectedApp.downloadCount)}</p>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{formatBytes(selectedApp.size)}</p>
                    <p className="text-sm text-muted-foreground">Size</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">v{selectedApp.version}</p>
                    <p className="text-sm text-muted-foreground">Version</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-muted-foreground">{selectedApp.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Platforms */}
                <div>
                  <h4 className="font-semibold mb-2">Available On</h4>
                  <div className="flex gap-2">
                    {selectedApp.platforms.includes('web') && (
                      <Badge variant="outline"><Globe className="w-3 h-3 mr-1" />Web</Badge>
                    )}
                    {selectedApp.platforms.includes('desktop') && (
                      <Badge variant="outline"><Monitor className="w-3 h-3 mr-1" />Desktop</Badge>
                    )}
                    {selectedApp.platforms.includes('mobile') && (
                      <Badge variant="outline"><Smartphone className="w-3 h-3 mr-1" />Mobile</Badge>
                    )}
                    {selectedApp.platforms.includes('api') && (
                      <Badge variant="outline"><Code className="w-3 h-3 mr-1" />API</Badge>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-semibold mb-2">Languages</h4>
                  <p className="text-sm text-muted-foreground">{selectedApp.languages.join(', ')}</p>
                </div>

                {/* Developer Info */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Developer</h4>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedApp.developer.name}</p>
                        {selectedApp.developer.verified && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <Shield className="w-3 h-3 mr-1" />Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedApp.developer.appCount} apps • {formatNumber(selectedApp.developer.totalDownloads)} total downloads</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      const url = selectedApp.developer.website ? `https://${selectedApp.developer.website}` : '#'
                      window.open(url, '_blank')
                    }}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Website
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  {selectedApp.status === 'installed' ? (
                    <>
                      <Button className="flex-1" onClick={() => handleOpenApp(selectedApp)}>
                        <Play className="w-4 h-4 mr-2" />
                        Open App
                      </Button>
                      <Button variant="outline" onClick={() => handleOpenSettings(selectedApp)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      <Button variant="outline" className="text-red-600" onClick={() => { handleUninstallApp(selectedApp); setShowAppDialog(false) }} disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Uninstall
                      </Button>
                    </>
                  ) : selectedApp.status === 'trial' ? (
                    <>
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => handlePurchase(selectedApp)} disabled={loading}>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Purchase Now
                      </Button>
                      <Button variant="outline" onClick={() => handleOpenApp(selectedApp)}>
                        <Play className="w-4 h-4 mr-2" />
                        Continue Trial
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="flex-1" onClick={() => { handleInstallApp(selectedApp); setShowAppDialog(false) }} disabled={loading}>
                        <Download className="w-4 h-4 mr-2" />
                        Install
                      </Button>
                      {selectedApp.trialDays > 0 && (
                        <Button variant="outline" onClick={() => { handleStartTrial(selectedApp); setShowAppDialog(false) }} disabled={loading}>
                          <Clock className="w-4 h-4 mr-2" />
                          Try {selectedApp.trialDays} Days Free
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => handleAddToWishlist(selectedApp)}>
                        <Heart className="w-4 h-4 mr-2" />
                        Wishlist
                      </Button>
                    </>
                  )}
                </div>

                {/* Rate/Review Section */}
                {(selectedApp.status === 'installed' || selectedApp.status === 'trial') && (
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => setShowReviewDialog(true)}>
                      <Star className="w-4 h-4 mr-2" />
                      Rate & Review This App
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate & Review {selectedApp?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-title">Title</Label>
              <Input
                id="review-title"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="review-content">Review</Label>
              <Textarea
                id="review-content"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Tell others what you think about this app..."
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmitReview} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
