'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Monitor,
  Download,
  Users,
  Zap,
  RefreshCw,
  Settings,
  Package,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  Apple,
  Shield,
  Key,
  Upload,
  GitBranch,
  Terminal,
  HardDrive,
  Cpu,
  Activity,
  Bug,
  FileCode,
  Archive,
  Globe,
  Lock,
  Unlock,
  Eye,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  ChevronRight,
  Server,
  Layers
} from 'lucide-react'

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

export default function DesktopAppClient() {
  const [activeTab, setActiveTab] = useState('builds')
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<Platform>('all')
  const [channelFilter, setChannelFilter] = useState<ReleaseChannel | 'all'>('all')
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
  const [selectedCrash, setSelectedCrash] = useState<CrashReport | null>(null)

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

  // Stats calculations
  const stats = {
    totalBuilds: mockBuilds.length,
    successfulBuilds: mockBuilds.filter(b => b.status === 'completed').length,
    failedBuilds: mockBuilds.filter(b => b.status === 'failed').length,
    inProgress: mockBuilds.filter(b => ['building', 'signing', 'notarizing', 'uploading', 'queued'].includes(b.status)).length
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
              <Button className="bg-white text-gray-800 hover:bg-white/90">
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
        </Tabs>
      </div>
    </div>
  )
}
