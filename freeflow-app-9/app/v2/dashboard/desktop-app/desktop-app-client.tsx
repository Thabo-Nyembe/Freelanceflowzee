'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'
import {
  Monitor,
  Download,
  Users,
  RefreshCw,
  Settings,
  Package,
  CheckCircle,
  Play,
  Apple,
  Shield,
  Key,
  Upload,
  GitBranch,
  Terminal,
  Activity,
  Bug,
  Archive,
  Globe,
  Lock,
  Eye,
  XCircle,
  TrendingUp,
  BarChart3,
  Search,
  ExternalLink
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
type Platform = 'windows' | 'macos' | 'linux' | 'all'
type BuildStatus = 'queued' | 'building' | 'signing' | 'notarizing' | 'uploading' | 'completed' | 'failed' | 'cancelled'
type ReleaseChannel = 'stable' | 'beta' | 'alpha' | 'nightly'
type Architecture = 'x64' | 'arm64' | 'universal' | 'ia32'

interface Build {
  id: string
  version: string
  buildNumber: number
  platform: Platform
  architecture: Architecture
  channel: ReleaseChannel
  status: BuildStatus
  progress: number
  startedAt: string
  completedAt?: string
  duration?: number
  size?: number
  downloadUrl?: string
  checksumSha256?: string
  signedBy?: string
  notarized?: boolean
  releaseNotes: string
  commits: number
  triggeredBy: string
  artifacts: Artifact[]
  logs: BuildLog[]
}

interface Artifact {
  id: string
  name: string
  type: 'installer' | 'portable' | 'update' | 'debug' | 'symbols'
  platform: Platform
  size: number
  downloadUrl: string
  downloads: number
}

interface BuildLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  step?: string
}

interface Release {
  id: string
  version: string
  channel: ReleaseChannel
  publishedAt: string
  releaseNotes: string
  highlights: string[]
  platforms: {
    platform: Platform
    architecture: Architecture
    downloadUrl: string
    size: number
    downloads: number
    checksum: string
  }[]
  totalDownloads: number
  isLatest: boolean
  isCritical: boolean
  minVersion?: string
}

interface CrashReport {
  id: string
  version: string
  platform: Platform
  architecture: Architecture
  errorType: string
  errorMessage: string
  stackTrace: string
  occurrences: number
  affectedUsers: number
  firstSeen: string
  lastSeen: string
  status: 'new' | 'investigating' | 'fixing' | 'resolved' | 'wontfix'
  assignee?: string
  linkedIssue?: string
}

interface Analytics {
  dailyActiveUsers: number
  monthlyActiveUsers: number
  totalInstalls: number
  updateAdoptionRate: number
  averageSessionDuration: number
  crashFreeRate: number
  platformDistribution: { platform: Platform; users: number; percentage: number }[]
  versionDistribution: { version: string; users: number; percentage: number }[]
  countryDistribution: { country: string; users: number; percentage: number }[]
}

interface Certificate {
  id: string
  name: string
  type: 'codesign' | 'installer' | 'notarization'
  platform: Platform
  issuer: string
  expiresAt: string
  status: 'valid' | 'expiring' | 'expired' | 'revoked'
  fingerprint: string
}

// Database Types
interface DbProject {
  id: string
  user_id: string
  project_name: string
  display_name: string
  description: string | null
  target_os: 'windows' | 'macos' | 'linux' | 'cross_platform'
  framework: string
  framework_version: string | null
  app_id: string
  version: string
  total_builds: number
  last_build_at: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

interface DbBuild {
  id: string
  user_id: string
  project_id: string
  build_number: string
  build_type: 'development' | 'production' | 'beta' | 'alpha' | 'release_candidate'
  version: string
  target_os: 'windows' | 'macos' | 'linux' | 'cross_platform'
  architecture: string
  status: string
  is_signed: boolean
  started_at: string | null
  completed_at: string | null
  duration_seconds: number | null
  download_count: number
  created_at: string
}

interface ProjectFormState {
  project_name: string
  display_name: string
  description: string
  target_os: 'windows' | 'macos' | 'linux' | 'cross_platform'
  framework: string
  app_id: string
  version: string
}

const initialProjectForm: ProjectFormState = {
  project_name: '',
  display_name: '',
  description: '',
  target_os: 'cross_platform',
  framework: 'electron',
  app_id: 'com.myapp.desktop',
  version: '1.0.0',
}

// Mock Data
const mockBuilds: Build[] = [
  {
    id: '1',
    version: '2.5.0',
    buildNumber: 1250,
    platform: 'macos',
    architecture: 'universal',
    channel: 'stable',
    status: 'completed',
    progress: 100,
    startedAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-15T10:35:00Z',
    duration: 2100,
    size: 125000000,
    downloadUrl: 'https://releases.example.com/v2.5.0/app-macos.dmg',
    checksumSha256: 'a1b2c3d4e5f6...',
    signedBy: 'Developer ID Application: Example Inc',
    notarized: true,
    releaseNotes: 'Major performance improvements and new features',
    commits: 47,
    triggeredBy: 'john.doe',
    artifacts: [
      { id: 'a1', name: 'App-2.5.0-universal.dmg', type: 'installer', platform: 'macos', size: 125000000, downloadUrl: '#', downloads: 15420 },
      { id: 'a2', name: 'App-2.5.0-universal.zip', type: 'portable', platform: 'macos', size: 118000000, downloadUrl: '#', downloads: 3240 }
    ],
    logs: [
      { timestamp: '2024-01-15T10:00:00Z', level: 'info', message: 'Build started', step: 'init' },
      { timestamp: '2024-01-15T10:05:00Z', level: 'info', message: 'Dependencies installed', step: 'deps' },
      { timestamp: '2024-01-15T10:20:00Z', level: 'info', message: 'Code compiled successfully', step: 'compile' },
      { timestamp: '2024-01-15T10:30:00Z', level: 'info', message: 'Code signing completed', step: 'sign' },
      { timestamp: '2024-01-15T10:35:00Z', level: 'info', message: 'Build completed successfully', step: 'done' }
    ]
  },
  {
    id: '2',
    version: '2.5.0',
    buildNumber: 1250,
    platform: 'windows',
    architecture: 'x64',
    channel: 'stable',
    status: 'completed',
    progress: 100,
    startedAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-15T10:28:00Z',
    duration: 1680,
    size: 98000000,
    downloadUrl: 'https://releases.example.com/v2.5.0/app-win-x64.exe',
    checksumSha256: 'f1e2d3c4b5a6...',
    signedBy: 'Example Inc (EV Certificate)',
    releaseNotes: 'Major performance improvements and new features',
    commits: 47,
    triggeredBy: 'john.doe',
    artifacts: [
      { id: 'a3', name: 'App-2.5.0-Setup.exe', type: 'installer', platform: 'windows', size: 98000000, downloadUrl: '#', downloads: 42150 },
      { id: 'a4', name: 'App-2.5.0-Portable.exe', type: 'portable', platform: 'windows', size: 92000000, downloadUrl: '#', downloads: 8430 }
    ],
    logs: []
  },
  {
    id: '3',
    version: '2.6.0-beta.1',
    buildNumber: 1260,
    platform: 'linux',
    architecture: 'x64',
    channel: 'beta',
    status: 'building',
    progress: 65,
    startedAt: '2024-01-15T14:00:00Z',
    releaseNotes: 'New UI framework and experimental features',
    commits: 23,
    triggeredBy: 'ci-bot',
    artifacts: [],
    logs: [
      { timestamp: '2024-01-15T14:00:00Z', level: 'info', message: 'Build started', step: 'init' },
      { timestamp: '2024-01-15T14:02:00Z', level: 'info', message: 'Fetching dependencies...', step: 'deps' },
      { timestamp: '2024-01-15T14:08:00Z', level: 'warn', message: 'Deprecated API usage detected', step: 'compile' }
    ]
  },
  {
    id: '4',
    version: '2.6.0-nightly.45',
    buildNumber: 1261,
    platform: 'windows',
    architecture: 'arm64',
    channel: 'nightly',
    status: 'failed',
    progress: 42,
    startedAt: '2024-01-15T02:00:00Z',
    completedAt: '2024-01-15T02:15:00Z',
    releaseNotes: 'Nightly build with latest changes',
    commits: 5,
    triggeredBy: 'scheduled',
    artifacts: [],
    logs: [
      { timestamp: '2024-01-15T02:00:00Z', level: 'info', message: 'Build started', step: 'init' },
      { timestamp: '2024-01-15T02:10:00Z', level: 'error', message: 'Compilation failed: undefined reference to symbol', step: 'compile' },
      { timestamp: '2024-01-15T02:15:00Z', level: 'error', message: 'Build failed', step: 'done' }
    ]
  }
]

const mockReleases: Release[] = [
  {
    id: 'r1',
    version: '2.5.0',
    channel: 'stable',
    publishedAt: '2024-01-15T12:00:00Z',
    releaseNotes: 'Major performance improvements and new features',
    highlights: ['50% faster startup', 'New plugin system', 'Dark mode improvements', 'Memory usage reduced by 30%'],
    platforms: [
      { platform: 'windows', architecture: 'x64', downloadUrl: '#', size: 98000000, downloads: 42150, checksum: 'abc123' },
      { platform: 'macos', architecture: 'universal', downloadUrl: '#', size: 125000000, downloads: 15420, checksum: 'def456' },
      { platform: 'linux', architecture: 'x64', downloadUrl: '#', size: 85000000, downloads: 8230, checksum: 'ghi789' }
    ],
    totalDownloads: 65800,
    isLatest: true,
    isCritical: false
  },
  {
    id: 'r2',
    version: '2.4.2',
    channel: 'stable',
    publishedAt: '2024-01-08T12:00:00Z',
    releaseNotes: 'Bug fixes and security updates',
    highlights: ['Fixed memory leak', 'Security patch for CVE-2024-1234', 'Improved stability'],
    platforms: [
      { platform: 'windows', architecture: 'x64', downloadUrl: '#', size: 96000000, downloads: 125000, checksum: 'jkl012' },
      { platform: 'macos', architecture: 'universal', downloadUrl: '#', size: 122000000, downloads: 48000, checksum: 'mno345' },
      { platform: 'linux', architecture: 'x64', downloadUrl: '#', size: 83000000, downloads: 22000, checksum: 'pqr678' }
    ],
    totalDownloads: 195000,
    isLatest: false,
    isCritical: true,
    minVersion: '2.3.0'
  }
]

const mockCrashReports: CrashReport[] = [
  {
    id: 'c1',
    version: '2.5.0',
    platform: 'windows',
    architecture: 'x64',
    errorType: 'SIGSEGV',
    errorMessage: 'Segmentation fault in render thread',
    stackTrace: 'at RenderThread::ProcessFrame (render.cpp:1234)\nat MainLoop::Tick (main.cpp:567)',
    occurrences: 234,
    affectedUsers: 156,
    firstSeen: '2024-01-15T13:00:00Z',
    lastSeen: '2024-01-15T18:30:00Z',
    status: 'investigating',
    assignee: 'jane.smith'
  },
  {
    id: 'c2',
    version: '2.4.2',
    platform: 'macos',
    architecture: 'arm64',
    errorType: 'EXC_BAD_ACCESS',
    errorMessage: 'Invalid memory access in plugin loader',
    stackTrace: 'at PluginLoader::LoadNative (plugin.mm:89)\nat PluginManager::Init (manager.cpp:234)',
    occurrences: 89,
    affectedUsers: 67,
    firstSeen: '2024-01-10T09:00:00Z',
    lastSeen: '2024-01-14T22:00:00Z',
    status: 'fixing',
    assignee: 'mike.dev',
    linkedIssue: 'GH-4521'
  },
  {
    id: 'c3',
    version: '2.5.0',
    platform: 'linux',
    architecture: 'x64',
    errorType: 'SIGABRT',
    errorMessage: 'Assertion failed in database module',
    stackTrace: 'at Database::Query (db.cpp:456)\nat DataManager::Fetch (data.cpp:123)',
    occurrences: 12,
    affectedUsers: 8,
    firstSeen: '2024-01-15T16:00:00Z',
    lastSeen: '2024-01-15T17:00:00Z',
    status: 'new'
  }
]

const mockAnalytics: Analytics = {
  dailyActiveUsers: 28450,
  monthlyActiveUsers: 156000,
  totalInstalls: 842000,
  updateAdoptionRate: 78.5,
  averageSessionDuration: 45.2,
  crashFreeRate: 99.2,
  platformDistribution: [
    { platform: 'windows', users: 98500, percentage: 63.2 },
    { platform: 'macos', users: 42000, percentage: 26.9 },
    { platform: 'linux', users: 15500, percentage: 9.9 }
  ],
  versionDistribution: [
    { version: '2.5.0', users: 122500, percentage: 78.5 },
    { version: '2.4.2', users: 28000, percentage: 17.9 },
    { version: '2.4.1', users: 3500, percentage: 2.2 },
    { version: 'Other', users: 2000, percentage: 1.4 }
  ],
  countryDistribution: [
    { country: 'United States', users: 48500, percentage: 31.1 },
    { country: 'Germany', users: 18200, percentage: 11.7 },
    { country: 'United Kingdom', users: 15600, percentage: 10.0 },
    { country: 'France', users: 12400, percentage: 7.9 },
    { country: 'Other', users: 61300, percentage: 39.3 }
  ]
}

const mockCertificates: Certificate[] = [
  {
    id: 'cert1',
    name: 'Developer ID Application',
    type: 'codesign',
    platform: 'macos',
    issuer: 'Apple Worldwide Developer Relations',
    expiresAt: '2025-06-15T00:00:00Z',
    status: 'valid',
    fingerprint: 'A1:B2:C3:D4:E5:F6...'
  },
  {
    id: 'cert2',
    name: 'EV Code Signing Certificate',
    type: 'codesign',
    platform: 'windows',
    issuer: 'DigiCert',
    expiresAt: '2024-03-01T00:00:00Z',
    status: 'expiring',
    fingerprint: 'G7:H8:I9:J0:K1:L2...'
  },
  {
    id: 'cert3',
    name: 'App Store Connect API Key',
    type: 'notarization',
    platform: 'macos',
    issuer: 'Apple Inc.',
    expiresAt: '2024-12-31T00:00:00Z',
    status: 'valid',
    fingerprint: 'M3:N4:O5:P6:Q7:R8...'
  }
]

// Enhanced Competitive Upgrade Mock Data
const mockDesktopAppAIInsights = [
  { id: '1', type: 'success' as const, title: 'Build Optimization', description: 'Latest builds 23% faster with new bundler. All platforms benefiting.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'info' as const, title: 'Auto-Update Stats', description: '94% of users on latest version. Update adoption excellent.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Updates' },
  { id: '3', type: 'warning' as const, title: 'macOS Notarization', description: 'Apple notarization times increasing. Consider pre-submission queue.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Platform' },
]

const mockDesktopAppCollaborators = [
  { id: '1', name: 'Build Engineer', avatar: '/avatars/build.jpg', status: 'online' as const, role: 'Engineer' },
  { id: '2', name: 'Release Manager', avatar: '/avatars/release.jpg', status: 'online' as const, role: 'Manager' },
  { id: '3', name: 'QA Lead', avatar: '/avatars/qa.jpg', status: 'busy' as const, role: 'QA' },
]

const mockDesktopAppPredictions = [
  { id: '1', title: 'Next Release', prediction: 'v2.5.0 ready for stable release', confidence: 92, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Download Growth', prediction: '+15% downloads projected next month', confidence: 78, trend: 'up' as const, impact: 'medium' as const },
]

const mockDesktopAppActivities = [
  { id: '1', user: 'Build System', action: 'Build completed', target: 'v2.4.8 Windows x64', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Auto-Updater', action: 'Update pushed', target: '45,000 users', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Release Bot', action: 'Published to', target: 'Beta Channel', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockDesktopAppQuickActions = [
  { id: '1', label: 'New Build', icon: 'play', action: () => toast.success('Build started successfully'), variant: 'default' as const },
  { id: '2', label: 'Deploy Update', icon: 'upload', action: () => toast.success('Update deployed successfully'), variant: 'default' as const },
  { id: '3', label: 'View Analytics', icon: 'chart', action: () => toast.success('Analytics loaded'), variant: 'outline' as const },
]

export default function DesktopAppClient() {
  const supabase = createClient()

  // Core UI state
  const [activeTab, setActiveTab] = useState('builds')
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<Platform>('all')
  const [channelFilter, setChannelFilter] = useState<ReleaseChannel | 'all'>('all')
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
  const [selectedCrash, setSelectedCrash] = useState<CrashReport | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase state
  const [dbProjects, setDbProjects] = useState<DbProject[]>([])
  const [dbBuilds, setDbBuilds] = useState<DbBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formState, setFormState] = useState<ProjectFormState>(initialProjectForm)

  // Fetch projects and builds from Supabase
  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [projectsRes, buildsRes] = await Promise.all([
        supabase
          .from('desktop_projects')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('desktop_builds')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
      ])

      if (projectsRes.error) throw projectsRes.error
      if (buildsRes.error) throw buildsRes.error

      setDbProjects(projectsRes.data || [])
      setDbBuilds(buildsRes.data || [])
    } catch (error) {
      console.error('Error fetching desktop data:', error)
      toast.error('Failed to load desktop projects')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredBuilds = useMemo(() => {
    return mockBuilds.filter(build => {
      const matchesPlatform = platformFilter === 'all' || build.platform === platformFilter
      const matchesChannel = channelFilter === 'all' || build.channel === channelFilter
      const matchesSearch = build.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           build.triggeredBy.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesPlatform && matchesChannel && matchesSearch
    })
  }, [platformFilter, channelFilter, searchQuery])

  const getStatusColor = (status: BuildStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'building': case 'signing': case 'notarizing': case 'uploading':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'queued': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'cancelled': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getChannelColor = (channel: ReleaseChannel) => {
    switch (channel) {
      case 'stable': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'beta': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'alpha': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'nightly': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'windows': return <Monitor className="w-4 h-4" />
      case 'macos': return <Apple className="w-4 h-4" />
      case 'linux': return <Terminal className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getCertStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'expiring': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'expired': case 'revoked': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getCrashStatusColor = (status: CrashReport['status']) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'investigating': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'fixing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'wontfix': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)} GB`
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`
    return `${bytes} B`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Stats calculations (mock + db data)
  const stats = useMemo(() => {
    const dbBuildCount = dbBuilds.length
    const dbSuccessful = dbBuilds.filter(b => b.status === 'success').length
    const dbFailed = dbBuilds.filter(b => b.status === 'failed').length
    const dbInProgress = dbBuilds.filter(b => ['pending', 'building'].includes(b.status)).length

    return {
      totalBuilds: mockBuilds.length + dbBuildCount,
      successfulBuilds: mockBuilds.filter(b => b.status === 'completed').length + dbSuccessful,
      failedBuilds: mockBuilds.filter(b => b.status === 'failed').length + dbFailed,
      inProgress: mockBuilds.filter(b => ['building', 'signing', 'notarizing', 'uploading', 'queued'].includes(b.status)).length + dbInProgress,
      projectCount: dbProjects.length
    }
  }, [dbBuilds, dbProjects])

  // Create new project
  const handleCreateProject = async () => {
    if (!formState.project_name.trim() || !formState.display_name.trim()) {
      toast.error('Project name and display name are required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create projects')
        return
      }

      const { error } = await supabase.from('desktop_projects').insert({
        user_id: user.id,
        project_name: formState.project_name,
        display_name: formState.display_name,
        description: formState.description || null,
        target_os: formState.target_os,
        framework: formState.framework,
        app_id: formState.app_id,
        version: formState.version,
      })

      if (error) throw error

      toast.success('Project created successfully')
      setShowCreateDialog(false)
      setFormState(initialProjectForm)
      fetchData()
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Start a new build
  const handleStartBuild = async (projectId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to start builds')
        return
      }

      // Use first project if none specified
      const project = projectId
        ? dbProjects.find(p => p.id === projectId)
        : dbProjects[0]

      if (!project) {
        toast.info('No project found', { description: 'Create a project first' })
        return
      }

      const buildNumber = `${Date.now()}`
      const { error } = await supabase.from('desktop_builds').insert({
        user_id: user.id,
        project_id: project.id,
        build_number: buildNumber,
        build_type: 'development',
        version: project.version,
        target_os: project.target_os,
        architecture: 'x64',
        status: 'pending',
        started_at: new Date().toISOString(),
      })

      if (error) throw error

      toast.success('Build started', { description: `Build #${buildNumber} initiated` })
      fetchData()
    } catch (error) {
      console.error('Error starting build:', error)
      toast.error('Failed to start build')
    }
  }

  // Cancel a build
  const handleCancelBuild = async (buildId: string) => {
    try {
      const { error } = await supabase
        .from('desktop_builds')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', buildId)

      if (error) throw error

      toast.info('Build cancelled')
      fetchData()
    } catch (error) {
      console.error('Error cancelling build:', error)
      toast.error('Failed to cancel build')
    }
  }

  // Retry a failed build
  const handleRetryBuild = async (buildId: string) => {
    try {
      const build = dbBuilds.find(b => b.id === buildId)
      if (!build) return

      const { error } = await supabase
        .from('desktop_builds')
        .update({
          status: 'pending',
          started_at: new Date().toISOString(),
          completed_at: null,
          duration_seconds: null
        })
        .eq('id', buildId)

      if (error) throw error

      toast.info('Retrying build', { description: `Build ${build.build_number} restarted` })
      fetchData()
    } catch (error) {
      console.error('Error retrying build:', error)
      toast.error('Failed to retry build')
    }
  }

  // Delete a build
  const handleDeleteBuild = async (buildId: string) => {
    try {
      const { error } = await supabase
        .from('desktop_builds')
        .delete()
        .eq('id', buildId)

      if (error) throw error

      toast.success('Build deleted')
      fetchData()
    } catch (error) {
      console.error('Error deleting build:', error)
      toast.error('Failed to delete build')
    }
  }

  // Archive a project
  const handleArchiveProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('desktop_projects')
        .update({ is_archived: true })
        .eq('id', projectId)

      if (error) throw error

      toast.success('Project archived')
      fetchData()
    } catch (error) {
      console.error('Error archiving project:', error)
      toast.error('Failed to archive project')
    }
  }

  // Download build (mock with toast for actual file download)
  const handleDownloadBuild = (buildVersion: string, platform: string) => {
    toast.success('Downloading build', {
      description: `${buildVersion} for ${platform} download starting...`
    })
  }

  // Publish release (update build status)
  const handlePublishRelease = async (buildId: string, buildVersion: string) => {
    try {
      const { error } = await supabase
        .from('desktop_builds')
        .update({
          status: 'success',
          build_type: 'production',
          completed_at: new Date().toISOString()
        })
        .eq('id', buildId)

      if (error) throw error

      toast.success('Release published', { description: `${buildVersion} is now live` })
      fetchData()
    } catch (error) {
      console.error('Error publishing release:', error)
      toast.error('Failed to publish release')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-700 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Monitor className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Desktop App Builder</h1>
                <p className="text-white/80">Cross-platform builds, releases & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                className="bg-white text-gray-800 hover:bg-white/90"
                onClick={() => handleStartBuild()}
                disabled={loading || dbProjects.length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                New Build
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm">Total Builds</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalBuilds}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Successful</span>
              </div>
              <p className="text-2xl font-bold text-green-300">{stats.successfulBuilds}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-300">{stats.failedBuilds}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-blue-300">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="builds" className="rounded-lg">
              <Package className="w-4 h-4 mr-2" />
              Builds
            </TabsTrigger>
            <TabsTrigger value="releases" className="rounded-lg">
              <Upload className="w-4 h-4 mr-2" />
              Releases
            </TabsTrigger>
            <TabsTrigger value="crashes" className="rounded-lg">
              <Bug className="w-4 h-4 mr-2" />
              Crash Reports
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="signing" className="rounded-lg">
              <Shield className="w-4 h-4 mr-2" />
              Code Signing
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Builds Tab */}
          <TabsContent value="builds" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search builds..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Platform:</span>
                    {(['all', 'windows', 'macos', 'linux'] as const).map(platform => (
                      <Button
                        key={platform}
                        variant={platformFilter === platform ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPlatformFilter(platform)}
                      >
                        {platform === 'all' ? 'All' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Channel:</span>
                    {(['all', 'stable', 'beta', 'nightly'] as const).map(channel => (
                      <Button
                        key={channel}
                        variant={channelFilter === channel ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChannelFilter(channel)}
                      >
                        {channel.charAt(0).toUpperCase() + channel.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Build List */}
            <div className="space-y-3">
              {filteredBuilds.map(build => (
                <Card key={build.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          {getPlatformIcon(build.platform)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{build.version}</span>
                            <Badge className={getChannelColor(build.channel)}>{build.channel}</Badge>
                            <Badge className={getStatusColor(build.status)}>{build.status}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>Build #{build.buildNumber}</span>
                            <span>•</span>
                            <span>{build.architecture}</span>
                            <span>•</span>
                            <span>{build.commits} commits</span>
                            <span>•</span>
                            <span>by {build.triggeredBy}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {build.status === 'building' && (
                          <div className="w-32">
                            <Progress value={build.progress} className="h-2" />
                            <span className="text-xs text-muted-foreground">{build.progress}%</span>
                          </div>
                        )}
                        {build.duration && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatDuration(build.duration)}</p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                        )}
                        {build.size && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatBytes(build.size)}</p>
                            <p className="text-xs text-muted-foreground">Size</p>
                          </div>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedBuild(build)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Build Details - {build.version}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                  <p className="text-sm text-muted-foreground">Platform</p>
                                  <p className="font-medium flex items-center gap-2">
                                    {getPlatformIcon(build.platform)}
                                    {build.platform}
                                  </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                  <p className="text-sm text-muted-foreground">Architecture</p>
                                  <p className="font-medium">{build.architecture}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                  <p className="text-sm text-muted-foreground">Channel</p>
                                  <Badge className={getChannelColor(build.channel)}>{build.channel}</Badge>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <Badge className={getStatusColor(build.status)}>{build.status}</Badge>
                                </div>
                              </div>

                              {build.signedBy && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <Shield className="w-5 h-5 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Code Signed</p>
                                    <p className="text-xs text-green-600">{build.signedBy}</p>
                                  </div>
                                  {build.notarized && (
                                    <Badge className="ml-auto bg-green-100 text-green-700">Notarized</Badge>
                                  )}
                                </div>
                              )}

                              {build.artifacts.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3">Artifacts</h4>
                                  <div className="space-y-2">
                                    {build.artifacts.map(artifact => (
                                      <div key={artifact.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <Archive className="w-4 h-4 text-gray-500" />
                                          <div>
                                            <p className="font-medium text-sm">{artifact.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatBytes(artifact.size)} • {artifact.downloads.toLocaleString()} downloads</p>
                                          </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                          <Download className="w-4 h-4 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {build.logs.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3">Build Logs</h4>
                                  <ScrollArea className="h-48 bg-gray-900 rounded-lg p-4">
                                    <div className="font-mono text-xs space-y-1">
                                      {build.logs.map((log, idx) => (
                                        <div key={idx} className={`${
                                          log.level === 'error' ? 'text-red-400' :
                                          log.level === 'warn' ? 'text-yellow-400' :
                                          'text-gray-300'
                                        }`}>
                                          <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                          {' '}
                                          <span className="text-gray-400">[{log.step}]</span>
                                          {' '}
                                          {log.message}
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Releases Tab */}
          <TabsContent value="releases" className="space-y-4">
            {mockReleases.map(release => (
              <Card key={release.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{release.version}</h3>
                        <Badge className={getChannelColor(release.channel)}>{release.channel}</Badge>
                        {release.isLatest && <Badge className="bg-blue-100 text-blue-700">Latest</Badge>}
                        {release.isCritical && <Badge className="bg-red-100 text-red-700">Critical Update</Badge>}
                      </div>
                      <p className="text-muted-foreground">{release.releaseNotes}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{release.totalDownloads.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Downloads</p>
                    </div>
                  </div>

                  {release.highlights.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Highlights</h4>
                      <div className="flex flex-wrap gap-2">
                        {release.highlights.map((highlight, idx) => (
                          <Badge key={idx} variant="outline">{highlight}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {release.platforms.map((platform, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(platform.platform)}
                            <span className="font-medium capitalize">{platform.platform}</span>
                            <span className="text-xs text-muted-foreground">({platform.architecture})</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Size</span>
                            <span>{formatBytes(platform.size)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Downloads</span>
                            <span>{platform.downloads.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-3" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Crash Reports Tab */}
          <TabsContent value="crashes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  Crash Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCrashReports.map(crash => (
                    <div key={crash.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-medium">{crash.errorType}</span>
                            <Badge className={getCrashStatusColor(crash.status)}>{crash.status}</Badge>
                            {crash.linkedIssue && (
                              <Badge variant="outline" className="font-mono text-xs">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {crash.linkedIssue}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{crash.errorMessage}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(crash.platform)}
                          <span className="text-sm">{crash.version}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Occurrences</p>
                          <p className="font-semibold text-red-600">{crash.occurrences}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Affected Users</p>
                          <p className="font-semibold">{crash.affectedUsers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">First Seen</p>
                          <p className="font-medium">{new Date(crash.firstSeen).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Assignee</p>
                          <p className="font-medium">{crash.assignee || 'Unassigned'}</p>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded p-3">
                        <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">{crash.stackTrace}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Daily Active Users</span>
                  </div>
                  <p className="text-2xl font-bold">{mockAnalytics.dailyActiveUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12.5%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Monthly Active Users</span>
                  </div>
                  <p className="text-2xl font-bold">{mockAnalytics.monthlyActiveUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    <span>+8.3%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Total Installs</span>
                  </div>
                  <p className="text-2xl font-bold">{mockAnalytics.totalInstalls.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    <span>+15.2%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Crash-Free Rate</span>
                  </div>
                  <p className="text-2xl font-bold">{mockAnalytics.crashFreeRate}%</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    <span>+0.3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.platformDistribution.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(item.platform)}
                            <span className="capitalize">{item.platform}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.users.toLocaleString()} ({item.percentage}%)</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Version Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.versionDistribution.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span>{item.version}</span>
                          <span className="text-sm text-muted-foreground">{item.users.toLocaleString()} ({item.percentage}%)</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {mockAnalytics.countryDistribution.map((item, idx) => (
                    <div key={idx} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold">{item.percentage}%</p>
                      <p className="text-sm text-muted-foreground">{item.country}</p>
                      <p className="text-xs text-muted-foreground">{item.users.toLocaleString()} users</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Signing Tab */}
          <TabsContent value="signing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Code Signing Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCertificates.map(cert => (
                    <div key={cert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            {cert.type === 'codesign' ? <Key className="w-5 h-5" /> :
                             cert.type === 'notarization' ? <Shield className="w-5 h-5" /> :
                             <Lock className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{cert.name}</span>
                              <Badge className={getCertStatusColor(cert.status)}>{cert.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Issued by {cert.issuer}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {getPlatformIcon(cert.platform)}
                                <span className="capitalize">{cert.platform}</span>
                              </span>
                              <span>Expires: {new Date(cert.expiresAt).toLocaleDateString()}</span>
                              <span className="font-mono">{cert.fingerprint}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Renew
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-4">Add New Certificate</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Apple className="w-8 h-8 text-gray-400" />
                      <span>Apple Developer ID</span>
                      <span className="text-xs text-muted-foreground">For macOS code signing</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Monitor className="w-8 h-8 text-blue-400" />
                      <span>Windows EV Certificate</span>
                      <span className="text-xs text-muted-foreground">For Windows code signing</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Key className="w-8 h-8 text-orange-400" />
                      <span>GPG Key</span>
                      <span className="text-xs text-muted-foreground">For Linux package signing</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Build Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">macOS Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">Hardened Runtime</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">Notarization</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">Universal Binary</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Windows Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">EV Code Signing</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">NSIS Installer</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">ARM64 Support</span>
                        <Badge className="bg-yellow-100 text-yellow-700">Beta</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Electron Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-1">
                <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Settings</h3>
                {[
                  { id: 'general', label: 'General', icon: Settings },
                  { id: 'build', label: 'Build', icon: Package },
                  { id: 'updates', label: 'Auto Update', icon: RefreshCw },
                  { id: 'security', label: 'Security', icon: Shield },
                  { id: 'platforms', label: 'Platforms', icon: Monitor },
                  { id: 'advanced', label: 'Advanced', icon: Terminal },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                      settingsTab === item.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Application Configuration</CardTitle>
                        <CardDescription>General app settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Application Name</Label>
                            <Input defaultValue="MyApp Desktop" className="mt-1" />
                          </div>
                          <div>
                            <Label>Application ID</Label>
                            <Input defaultValue="com.myapp.desktop" className="mt-1 font-mono" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Current Version</Label>
                            <Input defaultValue="2.4.0" className="mt-1" />
                          </div>
                          <div>
                            <Label>Electron Version</Label>
                            <Select defaultValue="28">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="28">Electron 28 (Latest)</SelectItem>
                                <SelectItem value="27">Electron 27</SelectItem>
                                <SelectItem value="26">Electron 26 LTS</SelectItem>
                                <SelectItem value="25">Electron 25</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Total Downloads</p>
                            <p className="text-2xl font-bold">234.5K</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Active Users</p>
                            <p className="text-2xl font-bold">45.2K</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Crash Rate</p>
                            <p className="text-2xl font-bold text-green-600">0.2%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Window Configuration</CardTitle>
                        <CardDescription>Default window settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Default Width</Label>
                            <Input type="number" defaultValue="1280" className="mt-1" />
                          </div>
                          <div>
                            <Label>Default Height</Label>
                            <Input type="number" defaultValue="800" className="mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Frameless Window</p>
                            <p className="text-sm text-gray-500">Use custom title bar</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Remember Window State</p>
                            <p className="text-sm text-gray-500">Save position and size</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Always On Top</p>
                            <p className="text-sm text-gray-500">Keep window above others</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>System Tray</CardTitle>
                        <CardDescription>Tray icon behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Tray Icon</p>
                            <p className="text-sm text-gray-500">Display in system tray</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Minimize to Tray</p>
                            <p className="text-sm text-gray-500">Hide window to tray</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Start Minimized</p>
                            <p className="text-sm text-gray-500">Start in tray on login</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Build Settings */}
                {settingsTab === 'build' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Build Configuration</CardTitle>
                        <CardDescription>Electron Forge / Builder settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Build Tool</Label>
                          <Select defaultValue="forge">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="forge">Electron Forge (Recommended)</SelectItem>
                              <SelectItem value="builder">Electron Builder</SelectItem>
                              <SelectItem value="packager">Electron Packager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Output Directory</Label>
                          <Input defaultValue="./out" className="mt-1 font-mono" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">ASAR Packaging</p>
                            <p className="text-sm text-gray-500">Bundle app into archive</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Source Map Support</p>
                            <p className="text-sm text-gray-500">Include source maps for debugging</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Native Modules</CardTitle>
                        <CardDescription>Rebuild native dependencies</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto Rebuild</p>
                            <p className="text-sm text-gray-500">Rebuild on Electron version change</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Native Modules</p>
                          {['better-sqlite3', 'node-pty', 'keytar', 'sharp'].map((mod) => (
                            <div key={mod} className="flex items-center justify-between p-2 border rounded-lg">
                              <span className="font-mono text-sm">{mod}</span>
                              <Badge className="bg-green-100 text-green-700">Compiled</Badge>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Rebuild All Native Modules
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>CI/CD Integration</CardTitle>
                        <CardDescription>Automated build pipelines</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['GitHub Actions', 'GitLab CI', 'Azure Pipelines'].map((ci, i) => (
                          <div key={ci} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <GitBranch className="w-4 h-4" />
                              <span className="font-medium">{ci}</span>
                            </div>
                            <Badge className={i === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {i === 0 ? 'Connected' : 'Available'}
                            </Badge>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          Configure CI/CD
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Auto Update Settings */}
                {settingsTab === 'updates' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Auto Update Configuration</CardTitle>
                        <CardDescription>electron-updater settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Auto Updates</p>
                            <p className="text-sm text-gray-500">Check for updates automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Update Server URL</Label>
                          <Input defaultValue="https://releases.myapp.com" className="mt-1 font-mono" />
                        </div>
                        <div>
                          <Label>Check Interval</Label>
                          <Select defaultValue="hour">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="startup">On Startup Only</SelectItem>
                              <SelectItem value="hour">Every Hour</SelectItem>
                              <SelectItem value="day">Once a Day</SelectItem>
                              <SelectItem value="week">Once a Week</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Download Automatically</p>
                            <p className="text-sm text-gray-500">Download updates in background</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Update Channels</CardTitle>
                        <CardDescription>Release channel configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Stable', desc: 'Production releases', users: '42.3K' },
                          { name: 'Beta', desc: 'Pre-release testing', users: '2.1K' },
                          { name: 'Alpha', desc: 'Early access', users: '356' },
                          { name: 'Canary', desc: 'Bleeding edge', users: '89' },
                        ].map((channel, i) => (
                          <div key={channel.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : i === 2 ? 'bg-orange-500' : 'bg-red-500'}`} />
                              <div>
                                <p className="font-medium">{channel.name}</p>
                                <p className="text-xs text-gray-500">{channel.desc}</p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{channel.users} users</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Delta Updates</CardTitle>
                        <CardDescription>Incremental update support</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Delta Updates</p>
                            <p className="text-sm text-gray-500">Download only changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Avg Full Update</p>
                            <p className="text-xl font-bold">85 MB</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Avg Delta Update</p>
                            <p className="text-xl font-bold text-blue-600">12 MB</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Keep Previous Versions</p>
                            <p className="text-sm text-gray-500">For delta generation</p>
                          </div>
                          <Select defaultValue="5">
                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">Last 3</SelectItem>
                              <SelectItem value="5">Last 5</SelectItem>
                              <SelectItem value="10">Last 10</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Code Signing Certificates</CardTitle>
                        <CardDescription>Manage signing certificates</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Apple className="w-5 h-5" />
                              <span className="font-medium">Apple Developer ID</span>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Valid</Badge>
                          </div>
                          <p className="text-sm text-gray-500">Expires: Dec 15, 2025</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-5 h-5" />
                              <span className="font-medium">Windows EV Certificate</span>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Valid</Badge>
                          </div>
                          <p className="text-sm text-gray-500">Expires: Mar 22, 2025</p>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Key className="w-4 h-4 mr-2" />
                          Manage Certificates
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Content Security Policy</CardTitle>
                        <CardDescription>CSP configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable CSP</p>
                            <p className="text-sm text-gray-500">Content Security Policy</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Disable Node Integration</p>
                            <p className="text-sm text-gray-500">In renderer process</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Context Isolation</p>
                            <p className="text-sm text-gray-500">Isolate preload scripts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Sandbox Mode</p>
                            <p className="text-sm text-gray-500">Run renderers in sandbox</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Hardened Runtime</CardTitle>
                        <CardDescription>macOS security settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Hardened Runtime</p>
                            <p className="text-sm text-gray-500">Required for notarization</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Entitlements</p>
                          {[
                            { name: 'Allow JIT', enabled: true },
                            { name: 'Allow Unsigned Memory', enabled: true },
                            { name: 'Allow DYLD Variables', enabled: false },
                            { name: 'Camera Access', enabled: false },
                            { name: 'Microphone Access', enabled: false },
                          ].map((ent) => (
                            <div key={ent.name} className="flex items-center justify-between p-2 border rounded-lg">
                              <span className="text-sm">{ent.name}</span>
                              <Switch defaultChecked={ent.enabled} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Platform Settings */}
                {settingsTab === 'platforms' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>macOS Configuration</CardTitle>
                        <CardDescription>Apple platform settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Bundle ID</Label>
                            <Input defaultValue="com.myapp.desktop" className="mt-1 font-mono" />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <Select defaultValue="productivity">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="productivity">Productivity</SelectItem>
                                <SelectItem value="developer">Developer Tools</SelectItem>
                                <SelectItem value="utilities">Utilities</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Universal Binary</p>
                            <p className="text-sm text-gray-500">Support Intel + Apple Silicon</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">DMG Installer</p>
                            <p className="text-sm text-gray-500">Create DMG disk image</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Mac App Store</p>
                            <p className="text-sm text-gray-500">Build for MAS</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Windows Configuration</CardTitle>
                        <CardDescription>Microsoft platform settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Installer Type</Label>
                          <Select defaultValue="nsis">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nsis">NSIS (Recommended)</SelectItem>
                              <SelectItem value="msi">MSI</SelectItem>
                              <SelectItem value="squirrel">Squirrel</SelectItem>
                              <SelectItem value="portable">Portable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Per-Machine Install</p>
                            <p className="text-sm text-gray-500">Install for all users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">ARM64 Support</p>
                            <p className="text-sm text-gray-500">Windows on ARM</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Microsoft Store</p>
                            <p className="text-sm text-gray-500">Build for Store</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Linux Configuration</CardTitle>
                        <CardDescription>Linux platform settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <p className="font-medium text-sm">Package Formats</p>
                          {['DEB (Debian/Ubuntu)', 'RPM (Fedora/RHEL)', 'AppImage', 'Snap', 'Flatpak'].map((format, i) => (
                            <div key={format} className="flex items-center justify-between p-2 border rounded-lg">
                              <span className="text-sm">{format}</span>
                              <Switch defaultChecked={i < 3} />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Desktop Entry</p>
                            <p className="text-sm text-gray-500">Create .desktop file</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>IPC Configuration</CardTitle>
                        <CardDescription>Inter-process communication</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable IPC Logging</p>
                            <p className="text-sm text-gray-500">Log all IPC messages</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Message Size Limit</Label>
                          <Select defaultValue="10mb">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1mb">1 MB</SelectItem>
                              <SelectItem value="10mb">10 MB</SelectItem>
                              <SelectItem value="50mb">50 MB</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Validate IPC Schema</p>
                            <p className="text-sm text-gray-500">Type-check IPC messages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Performance</CardTitle>
                        <CardDescription>Optimization settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Hardware Acceleration</p>
                            <p className="text-sm text-gray-500">Use GPU rendering</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">V8 Snapshots</p>
                            <p className="text-sm text-gray-500">Faster startup</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Background Throttling</p>
                            <p className="text-sm text-gray-500">Reduce CPU when hidden</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Renderer Process Limit</Label>
                          <Select defaultValue="4">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 processes</SelectItem>
                              <SelectItem value="4">4 processes</SelectItem>
                              <SelectItem value="8">8 processes</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Crash Reporting</CardTitle>
                        <CardDescription>Error tracking configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Crash Reports</p>
                            <p className="text-sm text-gray-500">Collect crash dumps</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Crash Server URL</Label>
                          <Input defaultValue="https://crashes.myapp.com/submit" className="mt-1 font-mono" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include Source Maps</p>
                            <p className="text-sm text-gray-500">Better stack traces</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Last 24h Crashes</p>
                            <p className="text-xl font-bold text-red-600">12</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Crash Rate</p>
                            <p className="text-xl font-bold text-green-600">0.2%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Clear Build Cache</p>
                              <p className="text-sm text-red-600">Remove cached builds</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              Clear
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Revoke All Update Keys</p>
                              <p className="text-sm text-red-600">Force full re-download</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              Revoke
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete All Crash Reports</p>
                              <p className="text-sm text-red-600">Remove crash history</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              Delete
                            </Button>
                          </div>
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
              insights={mockDesktopAppAIInsights}
              title="Desktop App Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockDesktopAppCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockDesktopAppPredictions}
              title="App Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockDesktopAppActivities}
            title="Build Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockDesktopAppQuickActions}
            variant="grid"
          />
        </div>
      </div>
    </div>
  )
}
