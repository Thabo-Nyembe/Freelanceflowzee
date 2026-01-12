'use client'
import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { useChangelog, type Changelog, type ChangeType, type ReleaseStatus, type ImpactLevel } from '@/lib/hooks/use-changelog'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Tag, GitBranch, GitCommit, Download, FileArchive,
  Users, MessageSquare, TrendingUp, Webhook, Settings, Calendar, CheckCircle, AlertCircle, AlertTriangle,
  Package, Shield, RefreshCw, Code, FileCode, Copy, Bell, Slack, Search, Plus, ArrowUpRight, Lock, Loader2
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

// Import mock data from centralized adapters



// GitHub Releases level interfaces
type ReleaseType = 'stable' | 'prerelease' | 'draft' | 'rc' | 'beta' | 'alpha'
type AssetType = 'binary' | 'source' | 'checksum' | 'signature' | 'documentation' | 'other'
type ChangeCategory = 'feature' | 'enhancement' | 'bugfix' | 'security' | 'performance' | 'breaking' | 'deprecated' | 'docs'
type WebhookEvent = 'release.created' | 'release.published' | 'release.edited' | 'release.deleted'

interface ReleaseAsset {
  id: string
  name: string
  type: AssetType
  size: number
  downloadCount: number
  uploadedAt: string
  contentType: string
  browserDownloadUrl: string
  checksumSha256?: string
}

interface Contributor {
  id: string
  username: string
  avatarUrl: string
  name: string
  contributions: number
  commits: number
  additions: number
  deletions: number
  role: 'maintainer' | 'contributor' | 'first-time'
  profileUrl: string
}

interface CommitInfo {
  sha: string
  message: string
  author: { name: string; avatar: string; date: string }
  additions: number
  deletions: number
  files: number
}

interface Release {
  id: string
  tagName: string
  name: string
  body: string
  isDraft: boolean
  isPrerelease: boolean
  releaseType: ReleaseType
  createdAt: string
  publishedAt?: string
  author: { name: string; avatar: string; username: string }
  assets: ReleaseAsset[]
  targetCommitish: string
  compareUrl: string
  contributors: Contributor[]
  commits: CommitInfo[]
  totalDownloads: number
  reactions: { type: string; count: number }[]
  discussionUrl?: string
  isLatest: boolean
  isVerified: boolean
  signatureUrl?: string
}

interface ChangelogEntry {
  id: string
  category: ChangeCategory
  title: string
  description: string
  prNumber?: number
  prUrl?: string
  issueNumbers?: number[]
  contributors: string[]
  isBreaking: boolean
  migrationGuide?: string
}

interface Discussion {
  id: string
  title: string
  body: string
  author: { name: string; avatar: string }
  createdAt: string
  replies: number
  upvotes: number
  isPinned: boolean
  isAnswered: boolean
  category: 'announcements' | 'feedback' | 'questions' | 'ideas'
}

interface WebhookConfig {
  id: string
  name: string
  url: string
  secret?: string
  events: WebhookEvent[]
  isActive: boolean
  lastTriggered?: string
  lastStatus?: 'success' | 'failure'
}

interface ReleaseStats {
  totalReleases: number
  stableReleases: number
  prereleases: number
  totalDownloads: number
  avgDownloadsPerRelease: number
  totalContributors: number
  releasesThisMonth: number
  downloadsTrend: number
}

// Mock data
const mockContributors: Contributor[] = [
  { id: 'c1', username: 'sarahchen', avatarUrl: '', name: 'Sarah Chen', contributions: 156, commits: 89, additions: 12450, deletions: 3200, role: 'maintainer', profileUrl: '#' },
  { id: 'c2', username: 'davidkim', avatarUrl: '', name: 'David Kim', contributions: 98, commits: 67, additions: 8900, deletions: 2100, role: 'maintainer', profileUrl: '#' },
  { id: 'c3', username: 'emilyrodriguez', avatarUrl: '', name: 'Emily Rodriguez', contributions: 67, commits: 45, additions: 5600, deletions: 1800, role: 'contributor', profileUrl: '#' },
  { id: 'c4', username: 'marcusjohnson', avatarUrl: '', name: 'Marcus Johnson', contributions: 45, commits: 32, additions: 3400, deletions: 890, role: 'contributor', profileUrl: '#' },
  { id: 'c5', username: 'lisathompson', avatarUrl: '', name: 'Lisa Thompson', contributions: 34, commits: 28, additions: 2800, deletions: 650, role: 'contributor', profileUrl: '#' },
  { id: 'c6', username: 'newcontributor', avatarUrl: '', name: 'Alex Rivera', contributions: 3, commits: 3, additions: 120, deletions: 45, role: 'first-time', profileUrl: '#' },
]

const mockAssets: ReleaseAsset[] = [
  { id: 'a1', name: 'freeflow-2.5.0-linux-amd64.tar.gz', type: 'binary', size: 45678900, downloadCount: 12450, uploadedAt: '2024-12-20T10:00:00Z', contentType: 'application/gzip', browserDownloadUrl: '#', checksumSha256: 'abc123...' },
  { id: 'a2', name: 'freeflow-2.5.0-darwin-arm64.tar.gz', type: 'binary', size: 43567800, downloadCount: 8900, uploadedAt: '2024-12-20T10:00:00Z', contentType: 'application/gzip', browserDownloadUrl: '#', checksumSha256: 'def456...' },
  { id: 'a3', name: 'freeflow-2.5.0-windows-amd64.zip', type: 'binary', size: 48900000, downloadCount: 15600, uploadedAt: '2024-12-20T10:00:00Z', contentType: 'application/zip', browserDownloadUrl: '#', checksumSha256: 'ghi789...' },
  { id: 'a4', name: 'Source code (zip)', type: 'source', size: 12345000, downloadCount: 2340, uploadedAt: '2024-12-20T10:00:00Z', contentType: 'application/zip', browserDownloadUrl: '#' },
  { id: 'a5', name: 'Source code (tar.gz)', type: 'source', size: 10234000, downloadCount: 1890, uploadedAt: '2024-12-20T10:00:00Z', contentType: 'application/gzip', browserDownloadUrl: '#' },
  { id: 'a6', name: 'SHA256SUMS.txt', type: 'checksum', size: 1024, downloadCount: 890, uploadedAt: '2024-12-20T10:00:00Z', contentType: 'text/plain', browserDownloadUrl: '#' },
]

const mockCommits: CommitInfo[] = [
  { sha: 'abc1234', message: 'feat: Add AI-powered workflow suggestions', author: { name: 'Sarah Chen', avatar: 'SC', date: '2024-12-19' }, additions: 450, deletions: 120, files: 12 },
  { sha: 'def5678', message: 'feat: Implement smart task prioritization', author: { name: 'David Kim', avatar: 'DK', date: '2024-12-18' }, additions: 380, deletions: 85, files: 8 },
  { sha: 'ghi9012', message: 'perf: Optimize dashboard load times by 40%', author: { name: 'Emily Rodriguez', avatar: 'ER', date: '2024-12-17' }, additions: 120, deletions: 280, files: 6 },
  { sha: 'jkl3456', message: 'fix: Resolve calendar sync duplication issue', author: { name: 'Marcus Johnson', avatar: 'MJ', date: '2024-12-16' }, additions: 45, deletions: 23, files: 3 },
]

const mockReleases: Release[] = [
  {
    id: 'rel-1',
    tagName: 'v2.5.0',
    name: 'AI-Powered Workflow Automation',
    body: '## What\'s Changed\n\n### New Features\n- AI Workflow Suggestions - Get intelligent recommendations based on your work patterns\n- Smart Task Prioritization - AI automatically prioritizes tasks\n- Enhanced Dashboard Performance - 40% faster load times\n\n### Bug Fixes\n- Fixed calendar sync duplication issue\n- Resolved session timeout problems\n\n### Contributors\nThanks to all contributors who made this release possible!',
    isDraft: false,
    isPrerelease: false,
    releaseType: 'stable',
    createdAt: '2024-12-20T08:00:00Z',
    publishedAt: '2024-12-20T10:00:00Z',
    author: { name: 'Sarah Chen', avatar: 'SC', username: 'sarahchen' },
    assets: mockAssets,
    targetCommitish: 'main',
    compareUrl: '#',
    contributors: mockContributors.slice(0, 4),
    commits: mockCommits,
    totalDownloads: 42180,
    reactions: [{ type: '🎉', count: 89 }, { type: '❤️', count: 54 }, { type: '🚀', count: 32 }],
    discussionUrl: '#',
    isLatest: true,
    isVerified: true,
    signatureUrl: '#'
  },
  {
    id: 'rel-2',
    tagName: 'v2.5.0-rc.2',
    name: 'v2.5.0 Release Candidate 2',
    body: '## Pre-release Notes\n\nThis is the second release candidate for v2.5.0. Please test and report any issues.',
    isDraft: false,
    isPrerelease: true,
    releaseType: 'rc',
    createdAt: '2024-12-18T14:00:00Z',
    publishedAt: '2024-12-18T14:30:00Z',
    author: { name: 'David Kim', avatar: 'DK', username: 'davidkim' },
    assets: mockAssets.slice(0, 3),
    targetCommitish: 'release/2.5.0',
    compareUrl: '#',
    contributors: mockContributors.slice(0, 2),
    commits: mockCommits.slice(0, 2),
    totalDownloads: 1250,
    reactions: [{ type: '👀', count: 12 }, { type: '🔥', count: 8 }],
    isLatest: false,
    isVerified: true
  },
  {
    id: 'rel-3',
    tagName: 'v2.4.2',
    name: 'Security Enhancements & Bug Fixes',
    body: '## Security Updates\n\n- Added FIDO2/WebAuthn support for hardware security keys\n- Enhanced session management\n\n## Bug Fixes\n\n- Fixed session timeout issues\n- Improved database query performance',
    isDraft: false,
    isPrerelease: false,
    releaseType: 'stable',
    createdAt: '2024-12-15T12:00:00Z',
    publishedAt: '2024-12-15T14:30:00Z',
    author: { name: 'David Kim', avatar: 'DK', username: 'davidkim' },
    assets: mockAssets.slice(0, 5),
    targetCommitish: 'main',
    compareUrl: '#',
    contributors: mockContributors.slice(1, 4),
    commits: mockCommits.slice(1, 4),
    totalDownloads: 28900,
    reactions: [{ type: '🔒', count: 45 }, { type: '👏', count: 23 }],
    isLatest: false,
    isVerified: true
  },
  {
    id: 'rel-4',
    tagName: 'v2.6.0-beta.1',
    name: 'Advanced Reporting Suite (Beta)',
    body: '## Beta Release\n\nEarly access to our new reporting features. Not recommended for production.',
    isDraft: false,
    isPrerelease: true,
    releaseType: 'beta',
    createdAt: '2024-12-22T10:00:00Z',
    publishedAt: '2024-12-22T11:00:00Z',
    author: { name: 'Marcus Johnson', avatar: 'MJ', username: 'marcusjohnson' },
    assets: mockAssets.slice(0, 2),
    targetCommitish: 'develop',
    compareUrl: '#',
    contributors: mockContributors.slice(3, 6),
    commits: mockCommits.slice(0, 2),
    totalDownloads: 450,
    reactions: [{ type: '🧪', count: 8 }],
    isLatest: false,
    isVerified: false
  },
  {
    id: 'rel-5',
    tagName: 'v2.4.1',
    name: 'Team Collaboration Improvements',
    body: '## New Features\n\n- Real-time presence indicators\n- Comment threading\n- @mentions in comments',
    isDraft: false,
    isPrerelease: false,
    releaseType: 'stable',
    createdAt: '2024-12-10T08:00:00Z',
    publishedAt: '2024-12-10T09:00:00Z',
    author: { name: 'Emily Rodriguez', avatar: 'ER', username: 'emilyrodriguez' },
    assets: mockAssets.slice(0, 5),
    targetCommitish: 'main',
    compareUrl: '#',
    contributors: mockContributors.slice(2, 5),
    commits: mockCommits,
    totalDownloads: 35600,
    reactions: [{ type: '👥', count: 56 }, { type: '💬', count: 34 }],
    isLatest: false,
    isVerified: true
  }
]

const mockDiscussions: Discussion[] = [
  { id: 'd1', title: 'v2.5.0 Release Announcement', body: 'We are excited to announce the release of v2.5.0 with AI-powered features!', author: { name: 'Sarah Chen', avatar: 'SC' }, createdAt: '2024-12-20T10:00:00Z', replies: 45, upvotes: 89, isPinned: true, isAnswered: false, category: 'announcements' },
  { id: 'd2', title: 'Feedback on new AI features', body: 'Share your experience with the new AI workflow suggestions.', author: { name: 'Community Manager', avatar: 'CM' }, createdAt: '2024-12-20T12:00:00Z', replies: 28, upvotes: 34, isPinned: false, isAnswered: false, category: 'feedback' },
  { id: 'd3', title: 'How to migrate from v2.4 to v2.5?', body: 'Looking for migration guide and best practices.', author: { name: 'Alex Johnson', avatar: 'AJ' }, createdAt: '2024-12-21T08:00:00Z', replies: 12, upvotes: 23, isPinned: false, isAnswered: true, category: 'questions' },
  { id: 'd4', title: 'Feature request: Dark mode for widgets', body: 'Would love to see dark mode support for embedded widgets.', author: { name: 'Maria Garcia', avatar: 'MG' }, createdAt: '2024-12-19T14:00:00Z', replies: 8, upvotes: 56, isPinned: false, isAnswered: false, category: 'ideas' },
]

const mockWebhooks: WebhookConfig[] = [
  { id: 'w1', name: 'Slack Notifications', url: 'https://hooks.slack.com/...', events: ['release.published'], isActive: true, lastTriggered: '2024-12-20T10:00:00Z', lastStatus: 'success' },
  { id: 'w2', name: 'Discord Bot', url: 'https://discord.com/api/webhooks/...', events: ['release.published', 'release.created'], isActive: true, lastTriggered: '2024-12-20T10:00:00Z', lastStatus: 'success' },
  { id: 'w3', name: 'CI/CD Pipeline', url: 'https://ci.example.com/webhook', events: ['release.created', 'release.published'], isActive: false, lastTriggered: '2024-12-15T14:00:00Z', lastStatus: 'failure' },
]

const mockStats: ReleaseStats = {
  totalReleases: 45,
  stableReleases: 38,
  prereleases: 7,
  totalDownloads: 1250000,
  avgDownloadsPerRelease: 27778,
  totalContributors: 86,
  releasesThisMonth: 4,
  downloadsTrend: 24.5
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const getAssetIcon = (type: AssetType) => {
  const icons: Record<AssetType, typeof FileArchive> = {
    binary: Package,
    source: Code,
    checksum: Shield,
    signature: Lock,
    documentation: FileCode,
    other: FileArchive
  }
  return icons[type]
}

const getCategoryColor = (category: ChangeCategory): string => {
  const colors: Record<ChangeCategory, string> = {
    feature: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    enhancement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    bugfix: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    security: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    performance: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    breaking: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
    deprecated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    docs: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  return colors[category]
}

const getReleaseTypeColor = (type: ReleaseType): string => {
  const colors: Record<ReleaseType, string> = {
    stable: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    prerelease: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    rc: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    beta: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    alpha: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
  }
  return colors[type]
}

// Enhanced Changelog Mock Data
const mockChangelogAIInsights = [
  { id: '1', type: 'success' as const, title: 'Release Cadence', description: 'Shipping 2x faster than last quarter. Great velocity!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Velocity' },
  { id: '2', type: 'info' as const, title: 'Breaking Changes', description: 'v3.0 has 5 breaking changes. Prepare migration guide.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Planning' },
  { id: '3', type: 'warning' as const, title: 'Documentation', description: '3 releases missing detailed documentation. Update needed.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Docs' },
]

const mockChangelogCollaborators = [
  { id: '1', name: 'Release Manager', avatar: '/avatars/release.jpg', status: 'online' as const, role: 'Releases', lastActive: 'Now' },
  { id: '2', name: 'Developer', avatar: '/avatars/dev.jpg', status: 'online' as const, role: 'Engineering', lastActive: '5m ago' },
  { id: '3', name: 'Tech Writer', avatar: '/avatars/writer.jpg', status: 'away' as const, role: 'Documentation', lastActive: '1h ago' },
]

const mockChangelogPredictions = [
  { id: '1', label: 'Releases/Month', current: 8, target: 10, predicted: 9, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'Adoption Rate', current: 78, target: 90, predicted: 85, confidence: 78, trend: 'up' as const },
  { id: '3', label: 'Bug Fixes', current: 24, target: 30, predicted: 28, confidence: 82, trend: 'up' as const },
]

const mockChangelogActivities = [
  { id: '1', user: 'Release Manager', action: 'published', target: 'v2.8.0 stable release', timestamp: '1h ago', type: 'success' as const },
  { id: '2', user: 'Developer', action: 'tagged', target: 'v2.9.0-beta.1', timestamp: '3h ago', type: 'info' as const },
  { id: '3', user: 'Tech Writer', action: 'updated', target: 'migration guide for v3.0', timestamp: '5h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component to access state setters

// Default form state for new changelog entry
const defaultChangelogForm: Partial<Changelog> = {
  title: '',
  description: '',
  version: '',
  change_type: 'feature',
  release_status: 'draft',
  impact_level: 'minor',
  breaking_change: false,
  requires_migration: false,
  requires_downtime: false,
  is_public: true,
  is_featured: false,
  show_in_changelog: true,
  visibility: 'public',
  notify_users: false,
  rollout_percentage: 100,
}

export default function ChangelogClient({ initialChangelog }: { initialChangelog: Changelog[] }) {
  const [activeTab, setActiveTab] = useState('releases')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [releaseTypeFilter, setReleaseTypeFilter] = useState<string>('all')
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
  const [showDrafts, setShowDrafts] = useState(false)

  // Form state for create/edit dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [changelogForm, setChangelogForm] = useState<Partial<Changelog>>(defaultChangelogForm)
  const [editingChangelog, setEditingChangelog] = useState<Changelog | null>(null)
  const [deletingChangelog, setDeletingChangelog] = useState<Changelog | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Webhook form state
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false)
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '', events: [] as string[] })

  // Discussion form state
  const [isDiscussionDialogOpen, setIsDiscussionDialogOpen] = useState(false)
  const [discussionForm, setDiscussionForm] = useState({ title: '', body: '', category: 'feedback' })

  // Quick Action Dialog states
  const [showCompareDialog, setShowCompareDialog] = useState(false)
  const [showNotifyDialog, setShowNotifyDialog] = useState(false)
  const [compareForm, setCompareForm] = useState({ baseVersion: '', targetVersion: '' })
  const [notifyForm, setNotifyForm] = useState({ message: '', notifyAll: false, selectedUsers: [] as string[] })

  // Additional dialog states for buttons without onClick
  const [showResetTemplateDialog, setShowResetTemplateDialog] = useState(false)
  const [showAddWebhookSettingsDialog, setShowAddWebhookSettingsDialog] = useState(false)
  const [showCIConfigDialog, setShowCIConfigDialog] = useState(false)
  const [selectedCIProvider, setSelectedCIProvider] = useState<string>('')
  const [showRegenerateTokenDialog, setShowRegenerateTokenDialog] = useState(false)
  const [showDeleteDraftsDialog, setShowDeleteDraftsDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showAddEnvironmentDialog, setShowAddEnvironmentDialog] = useState(false)
  const [showAuditLogDialog, setShowAuditLogDialog] = useState(false)
  const [showExportAnalyticsDialog, setShowExportAnalyticsDialog] = useState(false)
  const [discussionCategoryFilter, setDiscussionCategoryFilter] = useState('all')
  const [newEnvironmentForm, setNewEnvironmentForm] = useState({ name: '', url: '', type: 'development' })
  const [exportFormat, setExportFormat] = useState('csv')

  const { changelog, loading, error, createChange, updateChange, deleteChange, refetch } = useChangelog()

  // Filter releases
  const filteredReleases = useMemo(() => {
    return mockReleases.filter(release => {
      if (!showDrafts && release.isDraft) return false
      if (releaseTypeFilter !== 'all' && release.releaseType !== releaseTypeFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return release.name.toLowerCase().includes(query) ||
               release.tagName.toLowerCase().includes(query) ||
               release.body.toLowerCase().includes(query)
      }
      return true
    })
  }, [releaseTypeFilter, searchQuery, showDrafts])

  // Calculate stats
  const stats = useMemo(() => {
    const stable = mockReleases.filter(r => r.releaseType === 'stable' && !r.isDraft)
    const prerelease = mockReleases.filter(r => r.isPrerelease)
    const totalDownloads = mockReleases.reduce((sum, r) => sum + r.totalDownloads, 0)
    return {
      total: mockReleases.length,
      stable: stable.length,
      prerelease: prerelease.length,
      downloads: totalDownloads,
      contributors: mockContributors.length,
      latestVersion: mockReleases.find(r => r.isLatest)?.tagName || 'v0.0.0',
      verified: mockReleases.filter(r => r.isVerified).length,
      avgDownloads: Math.round(totalDownloads / mockReleases.length)
    }
  }, [])

  // Quick Actions with proper dialog handlers
  const quickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Release',
      icon: 'Tag',
      shortcut: 'N',
      action: () => {
        setChangelogForm(defaultChangelogForm)
        setIsCreateDialogOpen(true)
      }
    },
    {
      id: '2',
      label: 'Draft',
      icon: 'Edit',
      shortcut: 'D',
      action: () => {
        setChangelogForm({ ...defaultChangelogForm, release_status: 'draft' })
        setIsCreateDialogOpen(true)
      }
    },
    {
      id: '3',
      label: 'Compare',
      icon: 'GitBranch',
      shortcut: 'C',
      action: () => setShowCompareDialog(true)
    },
    {
      id: '4',
      label: 'Notify',
      icon: 'Bell',
      shortcut: 'T',
      action: () => setShowNotifyDialog(true)
    },
  ], [])

  // CRUD Handlers for Changelog/Release entries
  const handleCreateRelease = useCallback(async () => {
    if (!changelogForm.title || !changelogForm.version) {
      toast.error('Validation Error', {
        description: 'Title and version are required'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createChange({
        ...changelogForm,
        release_date: new Date().toISOString(),
      })
      if (result) {
        toast.success('Release Created', {
          description: `Version ${changelogForm.version} has been created successfully`
        })
        setIsCreateDialogOpen(false)
        setChangelogForm(defaultChangelogForm)
        refetch()
      }
    } catch (err) {
      toast.error('Error Creating Release', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [changelogForm, createChange, refetch])

  const handleUpdateRelease = useCallback(async () => {
    if (!editingChangelog?.id) return

    setIsSubmitting(true)
    try {
      const result = await updateChange(changelogForm, editingChangelog.id)
      if (result) {
        toast.success('Release Updated', {
          description: `Version ${changelogForm.version || editingChangelog.version} has been updated`
        })
        setIsEditDialogOpen(false)
        setEditingChangelog(null)
        setChangelogForm(defaultChangelogForm)
        refetch()
      }
    } catch (err) {
      toast.error('Error Updating Release', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [editingChangelog, changelogForm, updateChange, refetch])

  const handleDeleteRelease = useCallback(async () => {
    if (!deletingChangelog?.id) return

    setIsSubmitting(true)
    try {
      const result = await deleteChange(deletingChangelog.id)
      if (result) {
        toast.success('Release Deleted', {
          description: `Version ${deletingChangelog.version} has been removed`
        })
        setIsDeleteDialogOpen(false)
        setDeletingChangelog(null)
        refetch()
      }
    } catch (err) {
      toast.error('Error Deleting Release', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [deletingChangelog, deleteChange, refetch])

  const handlePublishRelease = useCallback(async (entry: Changelog) => {
    setIsSubmitting(true)
    try {
      const result = await updateChange({
        release_status: 'released',
        published_at: new Date().toISOString(),
        last_published_at: new Date().toISOString(),
      }, entry.id)
      if (result) {
        toast.success('Release Published', {
          description: `Version ${entry.version} is now live`
        })
        refetch()
      }
    } catch (err) {
      toast.error('Error Publishing Release', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [updateChange, refetch])

  const handleScheduleRelease = useCallback(async (entry: Changelog, scheduledDate: string) => {
    setIsSubmitting(true)
    try {
      const result = await updateChange({
        release_status: 'scheduled',
        scheduled_for: scheduledDate,
      }, entry.id)
      if (result) {
        toast.success('Release Scheduled', {
          description: `Version ${entry.version} scheduled for ${new Date(scheduledDate).toLocaleDateString()}`
        })
        refetch()
      }
    } catch (err) {
      toast.error('Error Scheduling Release', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [updateChange, refetch])

  const handleArchiveRelease = useCallback(async (entry: Changelog) => {
    setIsSubmitting(true)
    try {
      const result = await updateChange({
        release_status: 'archived',
      }, entry.id)
      if (result) {
        toast.success('Release Archived', {
          description: `Version ${entry.version} has been archived`
        })
        refetch()
      }
    } catch (err) {
      toast.error('Error Archiving Release', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [updateChange, refetch])

  const openEditDialog = useCallback((entry: Changelog) => {
    setEditingChangelog(entry)
    setChangelogForm({
      title: entry.title,
      description: entry.description,
      version: entry.version,
      change_type: entry.change_type,
      release_status: entry.release_status,
      impact_level: entry.impact_level,
      breaking_change: entry.breaking_change,
      requires_migration: entry.requires_migration,
      requires_downtime: entry.requires_downtime,
      summary: entry.summary,
      details: entry.details,
      technical_details: entry.technical_details,
      migration_notes: entry.migration_notes,
      is_public: entry.is_public,
      is_featured: entry.is_featured,
      show_in_changelog: entry.show_in_changelog,
      notify_users: entry.notify_users,
    })
    setIsEditDialogOpen(true)
  }, [])

  const openDeleteDialog = useCallback((entry: Changelog) => {
    setDeletingChangelog(entry)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleDownloadRelease = useCallback((version: string) => {
    toast.success('Downloading release', {
      description: `${version} download starting...`
    })
  }, [])

  const handleCompareVersions = useCallback(() => {
    toast.info('Compare Versions', {
      description: 'Opening version comparison tool...'
    })
  }, [])

  const handleSubscribeUpdates = useCallback(async () => {
    toast.success('Subscribed to updates', {
      description: 'You will receive notifications for new releases'
    })
  }, [])

  const handleViewReleaseNotes = useCallback((version: string) => {
    toast.info('Loading release notes', {
      description: `Opening notes for ${version}...`
    })
  }, [])

  // Form field update helper
  const updateFormField = useCallback((field: keyof Changelog, value: any) => {
    setChangelogForm(prev => ({ ...prev, [field]: value }))
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          Error loading changelog: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">GitHub Releases Level</Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Semantic Versioning</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">Releases</h1>
              <p className="text-gray-400">Manage releases, assets, and changelogs</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800" onClick={handleSubscribeUpdates}>
                <Bell className="h-4 w-4 mr-2" />
                Watch
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Draft Release
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Release</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="version">Version *</Label>
                        <Input
                          id="version"
                          placeholder="v1.0.0"
                          value={changelogForm.version || ''}
                          onChange={(e) => updateFormField('version', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="change_type">Change Type</Label>
                        <Select
                          value={changelogForm.change_type}
                          onValueChange={(value) => updateFormField('change_type', value as ChangeType)}
                        >
                          <SelectTrigger id="change_type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="feature">Feature</SelectItem>
                            <SelectItem value="improvement">Improvement</SelectItem>
                            <SelectItem value="bug_fix">Bug Fix</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="breaking_change">Breaking Change</SelectItem>
                            <SelectItem value="deprecated">Deprecated</SelectItem>
                            <SelectItem value="removed">Removed</SelectItem>
                            <SelectItem value="documentation">Documentation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Release title"
                        value={changelogForm.title || ''}
                        onChange={(e) => updateFormField('title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the changes in this release..."
                        rows={4}
                        value={changelogForm.description || ''}
                        onChange={(e) => updateFormField('description', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="release_status">Status</Label>
                        <Select
                          value={changelogForm.release_status}
                          onValueChange={(value) => updateFormField('release_status', value as ReleaseStatus)}
                        >
                          <SelectTrigger id="release_status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="released">Released</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="impact_level">Impact Level</Label>
                        <Select
                          value={changelogForm.impact_level}
                          onValueChange={(value) => updateFormField('impact_level', value as ImpactLevel)}
                        >
                          <SelectTrigger id="impact_level">
                            <SelectValue placeholder="Select impact" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="patch">Patch</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Breaking Change</Label>
                          <p className="text-sm text-gray-500">This release contains breaking changes</p>
                        </div>
                        <Switch
                          checked={changelogForm.breaking_change || false}
                          onCheckedChange={(checked) => updateFormField('breaking_change', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Requires Migration</Label>
                          <p className="text-sm text-gray-500">Users need to follow migration steps</p>
                        </div>
                        <Switch
                          checked={changelogForm.requires_migration || false}
                          onCheckedChange={(checked) => updateFormField('requires_migration', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Public Release</Label>
                          <p className="text-sm text-gray-500">Visible to all users</p>
                        </div>
                        <Switch
                          checked={changelogForm.is_public || false}
                          onCheckedChange={(checked) => updateFormField('is_public', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notify Users</Label>
                          <p className="text-sm text-gray-500">Send notification on publish</p>
                        </div>
                        <Switch
                          checked={changelogForm.notify_users || false}
                          onCheckedChange={(checked) => updateFormField('notify_users', checked)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRelease} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Release
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Tag className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Releases</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.stable}</div>
              <div className="text-xs text-gray-400">Stable</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.prerelease}</div>
              <div className="text-xs text-gray-400">Pre-releases</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <Download className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats.downloads)}</div>
              <div className="text-xs text-gray-400">Downloads</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.contributors}</div>
              <div className="text-xs text-gray-400">Contributors</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
                  <GitBranch className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.latestVersion}</div>
              <div className="text-xs text-gray-400">Latest</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.verified}</div>
              <div className="text-xs text-gray-400">Verified</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats.avgDownloads)}</div>
              <div className="text-xs text-gray-400">Avg Downloads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="releases" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-gray-700">
                <Tag className="h-4 w-4 mr-2" />Releases
              </TabsTrigger>
              <TabsTrigger value="changelog" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-gray-700">
                <GitCommit className="h-4 w-4 mr-2" />Changelog
              </TabsTrigger>
              <TabsTrigger value="contributors" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-gray-700">
                <Users className="h-4 w-4 mr-2" />Contributors
              </TabsTrigger>
              <TabsTrigger value="discussions" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-gray-700">
                <MessageSquare className="h-4 w-4 mr-2" />Discussions
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-gray-700">
                <TrendingUp className="h-4 w-4 mr-2" />Analytics
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-gray-700">
                <Webhook className="h-4 w-4 mr-2" />Webhooks
              </TabsTrigger>
              <TabsTrigger value="assets" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-gray-700">
                <Package className="h-4 w-4 mr-2" />Assets
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-gray-700">
                <Settings className="h-4 w-4 mr-2" />Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search releases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={releaseTypeFilter} onValueChange={setReleaseTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="rc">Release Candidate</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="alpha">Alpha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Releases Tab */}
          <TabsContent value="releases" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Switch checked={showDrafts} onCheckedChange={setShowDrafts} />
                <Label className="text-sm text-gray-600 dark:text-gray-400">Show drafts</Label>
              </div>
            </div>

            <div className="space-y-4">
              {filteredReleases.map(release => (
                <Dialog key={release.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-all border-gray-200 dark:border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant="outline" className="font-mono text-sm">{release.tagName}</Badge>
                              <Badge className={getReleaseTypeColor(release.releaseType)}>{release.releaseType}</Badge>
                              {release.isLatest && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Latest</Badge>}
                              {release.isVerified && (
                                <Badge variant="outline" className="border-green-300 text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />Verified
                                </Badge>
                              )}
                              {release.isDraft && <Badge variant="secondary">Draft</Badge>}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{release.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{release.body.split('\n')[0]}</p>

                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center text-white text-xs">
                                  {release.author.avatar}
                                </div>
                                <span>{release.author.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(release.publishedAt || release.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <GitCommit className="h-4 w-4" />
                                <span>{release.commits.length} commits</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="h-4 w-4" />
                                <span>{formatNumber(release.totalDownloads)} downloads</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {release.reactions.slice(0, 3).map((reaction, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                                {reaction.type} {reaction.count}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Assets preview */}
                        {release.assets.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <Package className="h-4 w-4" />
                              <span>{release.assets.length} assets</span>
                              <span className="mx-2">•</span>
                              {release.assets.slice(0, 3).map((asset, idx) => (
                                <span key={asset.id} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {asset.name.length > 20 ? asset.name.slice(0, 20) + '...' : asset.name}
                                </span>
                              ))}
                              {release.assets.length > 3 && (
                                <span className="text-xs">+{release.assets.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[85vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">{release.tagName}</Badge>
                        {release.name}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh]">
                      <div className="space-y-6 p-4">
                        {/* Release info */}
                        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center text-white">
                              {release.author.avatar}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{release.author.name}</div>
                              <div className="text-xs text-gray-500">@{release.author.username}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            Released on {new Date(release.publishedAt || release.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <Badge className={getReleaseTypeColor(release.releaseType)}>{release.releaseType}</Badge>
                            {release.isVerified && (
                              <Badge variant="outline" className="border-green-300 text-green-600">
                                <Shield className="h-3 w-3 mr-1" />Signed
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Release body */}
                        <div className="prose dark:prose-invert max-w-none">
                          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{release.body}</div>
                        </div>

                        {/* Assets */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Assets ({release.assets.length})
                          </h4>
                          <div className="space-y-2">
                            {release.assets.map(asset => {
                              const AssetIcon = getAssetIcon(asset.type)
                              return (
                                <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <AssetIcon className="h-5 w-5 text-gray-500" />
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white">{asset.name}</div>
                                      <div className="text-xs text-gray-500">{formatBytes(asset.size)}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500">{formatNumber(asset.downloadCount)} downloads</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        toast.success('Download Started', {
                                          description: `Downloading ${asset.name}...`
                                        })
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-1" />Download
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Commits */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <GitCommit className="h-5 w-5" />
                            Commits ({release.commits.length})
                          </h4>
                          <div className="space-y-2">
                            {release.commits.map(commit => (
                              <div key={commit.sha} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs">
                                  {commit.author.avatar}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">{commit.message}</div>
                                  <div className="text-xs text-gray-500">{commit.author.name} • {commit.author.date}</div>
                                </div>
                                <div className="text-xs text-gray-500 font-mono">{commit.sha.slice(0, 7)}</div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-green-600">+{commit.additions}</span>
                                  <span className="text-red-600">-{commit.deletions}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contributors */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Contributors ({release.contributors.length})
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {release.contributors.map(contributor => (
                              <div key={contributor.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-full">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center text-white text-xs">
                                  {contributor.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{contributor.name}</span>
                                {contributor.role === 'first-time' && (
                                  <Badge variant="outline" className="text-xs">First contribution 🎉</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Reactions */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            {release.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              >
                                <span className="text-lg mr-2">{reaction.type}</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{reaction.count}</span>
                              </button>
                            ))}
                            <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Changelog Tab */}
          <TabsContent value="changelog" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Generated Changelog</CardTitle>
                <CardDescription>Changes automatically organized by category from commit messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {mockReleases.filter(r => !r.isDraft && !r.isPrerelease).slice(0, 3).map(release => (
                    <div key={release.id} className="border-l-4 border-slate-300 dark:border-slate-700 pl-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline" className="font-mono">{release.tagName}</Badge>
                        <span className="text-sm text-gray-500">{new Date(release.publishedAt || release.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{release.name}</h3>

                      <div className="space-y-4">
                        {/* Group by category */}
                        {['feature', 'enhancement', 'bugfix', 'security', 'performance'].map(category => {
                          const items = release.commits.filter(c => c.message.startsWith(category.slice(0, 4)))
                          if (items.length === 0 && category !== 'feature') return null
                          return (
                            <div key={category}>
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Badge className={getCategoryColor(category as ChangeCategory)}>{category}</Badge>
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {release.commits.slice(0, 2).map(commit => (
                                  <li key={commit.sha} className="flex items-center gap-2">
                                    <span className="text-gray-400">•</span>
                                    {commit.message}
                                    <span className="font-mono text-xs text-gray-400">({commit.sha.slice(0, 7)})</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contributors Tab */}
          <TabsContent value="contributors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockContributors.map(contributor => (
                <Card key={contributor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center text-white font-medium">
                        {contributor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{contributor.name}</h3>
                          {contributor.role === 'maintainer' && (
                            <Badge variant="outline" className="text-xs">Maintainer</Badge>
                          )}
                          {contributor.role === 'first-time' && (
                            <Badge className="bg-green-100 text-green-700 text-xs">New</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">@{contributor.username}</div>

                        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{contributor.commits}</div>
                            <div className="text-xs text-gray-500">Commits</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{contributor.contributions}</div>
                            <div className="text-xs text-gray-500">Contributions</div>
                          </div>
                          <div>
                            <div className="font-semibold text-green-600">+{formatNumber(contributor.additions)}</div>
                            <div className="text-xs text-gray-500">Additions</div>
                          </div>
                          <div>
                            <div className="font-semibold text-red-600">-{formatNumber(contributor.deletions)}</div>
                            <div className="text-xs text-gray-500">Deletions</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {['all', 'announcements', 'feedback', 'questions', 'ideas'].map(cat => (
                  <Button
                    key={cat}
                    variant={discussionCategoryFilter === cat ? 'default' : 'outline'}
                    size="sm"
                    className="capitalize"
                    onClick={() => {
                      setDiscussionCategoryFilter(cat)
                      toast.info('Filter Applied', {
                        description: cat === 'all' ? 'Showing all discussions' : `Showing ${cat} discussions`
                      })
                    }}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <Dialog open={isDiscussionDialogOpen} onOpenChange={setIsDiscussionDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />New Discussion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Start New Discussion</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="discussion-title">Title</Label>
                      <Input
                        id="discussion-title"
                        placeholder="What would you like to discuss?"
                        value={discussionForm.title}
                        onChange={(e) => setDiscussionForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discussion-category">Category</Label>
                      <Select
                        value={discussionForm.category}
                        onValueChange={(value) => setDiscussionForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger id="discussion-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="announcements">Announcements</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="questions">Questions</SelectItem>
                          <SelectItem value="ideas">Ideas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discussion-body">Description</Label>
                      <Textarea
                        id="discussion-body"
                        placeholder="Share your thoughts..."
                        rows={5}
                        value={discussionForm.body}
                        onChange={(e) => setDiscussionForm(prev => ({ ...prev, body: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsDiscussionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        toast.success('Discussion Created', {
                          description: 'Your discussion has been posted'
                        })
                        setIsDiscussionDialogOpen(false)
                        setDiscussionForm({ title: '', body: '', category: 'feedback' })
                      }}>
                        Post Discussion
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {mockDiscussions.map(discussion => (
                <Card key={discussion.id} className={`${discussion.isPinned ? 'border-amber-300 dark:border-amber-700' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center text-white">
                        {discussion.author.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {discussion.isPinned && <Badge variant="outline" className="text-amber-600 border-amber-300">📌 Pinned</Badge>}
                          <Badge variant="outline" className="capitalize">{discussion.category}</Badge>
                          {discussion.isAnswered && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">✓ Answered</Badge>}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{discussion.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{discussion.body}</p>

                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>{discussion.author.name}</span>
                          <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{discussion.replies}</span>
                          <span className="flex items-center gap-1"><ArrowUpRight className="h-4 w-4" />{discussion.upvotes}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-slate-600">{formatNumber(mockStats.totalDownloads)}</div>
                  <div className="text-sm text-gray-500">Total Downloads</div>
                  <div className="text-xs text-green-600 mt-1">↑ {mockStats.downloadsTrend}% vs last month</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-600">{mockStats.releasesThisMonth}</div>
                  <div className="text-sm text-gray-500">Releases This Month</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-purple-600">{mockStats.totalContributors}</div>
                  <div className="text-sm text-gray-500">Total Contributors</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-amber-600">{formatNumber(mockStats.avgDownloadsPerRelease)}</div>
                  <div className="text-sm text-gray-500">Avg Downloads/Release</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Download Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReleases.filter(r => !r.isDraft).slice(0, 5).map(release => (
                    <div key={release.id} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-mono text-gray-500">{release.tagName}</div>
                      <div className="flex-1">
                        <Progress value={(release.totalDownloads / 50000) * 100} className="h-3" />
                      </div>
                      <div className="w-20 text-right text-sm font-medium">{formatNumber(release.totalDownloads)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook Integrations</h3>
                <p className="text-sm text-gray-500">Get notified when releases are created or published</p>
              </div>
              <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />Add Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Webhook</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-name">Name</Label>
                      <Input
                        id="webhook-name"
                        placeholder="My Webhook"
                        value={webhookForm.name}
                        onChange={(e) => setWebhookForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Payload URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://example.com/webhook"
                        value={webhookForm.url}
                        onChange={(e) => setWebhookForm(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Events</Label>
                      <div className="space-y-2">
                        {['release.created', 'release.published', 'release.edited', 'release.deleted'].map(event => (
                          <div key={event} className="flex items-center gap-2">
                            <Switch
                              checked={webhookForm.events.includes(event)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setWebhookForm(prev => ({ ...prev, events: [...prev.events, event] }))
                                } else {
                                  setWebhookForm(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }))
                                }
                              }}
                            />
                            <Label className="font-normal">{event}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsWebhookDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        if (!webhookForm.name || !webhookForm.url) {
                          toast.error('Validation Error', { description: 'Name and URL are required' })
                          return
                        }
                        toast.success('Webhook Created', {
                          description: `${webhookForm.name} has been configured`
                        })
                        setIsWebhookDialogOpen(false)
                        setWebhookForm({ name: '', url: '', events: [] })
                      }}>
                        Create Webhook
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {mockWebhooks.map(webhook => (
                <Card key={webhook.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          webhook.name.includes('Slack') ? 'bg-purple-100 text-purple-600' :
                          webhook.name.includes('Discord') ? 'bg-indigo-100 text-indigo-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {webhook.name.includes('Slack') ? <Slack className="h-5 w-5" /> :
                           webhook.name.includes('Discord') ? <MessageSquare className="h-5 w-5" /> :
                           <Webhook className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{webhook.name}</h4>
                          <div className="text-sm text-gray-500 font-mono">{webhook.url.slice(0, 40)}...</div>
                          <div className="flex gap-2 mt-2">
                            {webhook.events.map(event => (
                              <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {webhook.lastTriggered && (
                          <div className="text-right text-sm">
                            <div className={`flex items-center gap-1 ${webhook.lastStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                              {webhook.lastStatus === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                              Last {webhook.lastStatus}
                            </div>
                            <div className="text-gray-500">{new Date(webhook.lastTriggered).toLocaleDateString()}</div>
                          </div>
                        )}
                        <Switch checked={webhook.isActive} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Release Assets Overview</CardTitle>
                <CardDescription>All downloadable assets across releases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAssets.map(asset => {
                    const AssetIcon = getAssetIcon(asset.type)
                    return (
                      <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                            <AssetIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{asset.name}</div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>{formatBytes(asset.size)}</span>
                              <span>•</span>
                              <span>{asset.type}</span>
                              <span>•</span>
                              <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-white">{formatNumber(asset.downloadCount)}</div>
                            <div className="text-xs text-gray-500">downloads</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast.success('Download Started', {
                                description: `Downloading ${asset.name}...`
                              })
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />Download
                          </Button>
                          {asset.checksumSha256 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(asset.checksumSha256 || '')
                                toast.success('Copied to Clipboard', {
                                  description: 'SHA256 checksum copied successfully'
                                })
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - LaunchDarkly Level with 6 Sub-tabs */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="sticky top-8">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <nav className="space-y-1 px-3 pb-4">
                      {[
                        { id: 'general', label: 'General', icon: Settings, desc: 'Basic preferences' },
                        { id: 'releases', label: 'Releases', icon: Tag, desc: 'Release settings' },
                        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & emails' },
                        { id: 'integrations', label: 'Integrations', icon: Webhook, desc: 'External services' },
                        { id: 'security', label: 'Security', icon: Shield, desc: 'Access control' },
                        { id: 'advanced', label: 'Advanced', icon: Code, desc: 'Power features' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Repository Settings</CardTitle>
                        <CardDescription>Configure changelog repository</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Default Branch</Label>
                            <Select defaultValue="main">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="main">main</SelectItem>
                                <SelectItem value="master">master</SelectItem>
                                <SelectItem value="develop">develop</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Version Format</Label>
                            <Select defaultValue="semver">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="semver">Semantic (v1.2.3)</SelectItem>
                                <SelectItem value="calver">CalVer (2024.01.15)</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-increment Version</p>
                            <p className="text-sm text-gray-500">Automatically increment version on release</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Display Preferences</CardTitle>
                        <CardDescription>Customize changelog appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Release Dates</p>
                            <p className="text-sm text-gray-500">Display publication dates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Download Stats</p>
                            <p className="text-sm text-gray-500">Display download counts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Contributors</p>
                            <p className="text-sm text-gray-500">List contributors per release</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Releases per Page</Label>
                          <Select defaultValue="10">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 releases</SelectItem>
                              <SelectItem value="10">10 releases</SelectItem>
                              <SelectItem value="25">25 releases</SelectItem>
                              <SelectItem value="50">50 releases</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Releases Settings */}
                {settingsTab === 'releases' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Release Notes Generation</CardTitle>
                        <CardDescription>Configure automatic release notes</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <RefreshCw className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Auto-generate Release Notes</p>
                              <p className="text-sm text-gray-500">Generate from commit messages</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include PR Links</p>
                            <p className="text-sm text-gray-500">Link to pull requests in notes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include Issue References</p>
                            <p className="text-sm text-gray-500">Link to closed issues</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Categorize Changes</p>
                            <p className="text-sm text-gray-500">Group by feature, fix, etc.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Release Template</CardTitle>
                        <CardDescription>Default template for new releases</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <textarea
                          className="w-full h-48 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
                          defaultValue={`## What's Changed

### 🚀 Features
-

### 🐛 Bug Fixes
-

### 🔧 Improvements
-

### 📚 Documentation
-

### 🙏 Contributors
Thanks to all contributors!`}
                        />
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowResetTemplateDialog(true)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset to Default
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Asset Management</CardTitle>
                        <CardDescription>Configure release assets</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-upload Binaries</p>
                            <p className="text-sm text-gray-500">Upload build artifacts automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Generate Checksums</p>
                            <p className="text-sm text-gray-500">SHA256 checksums for assets</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Max Asset Size</Label>
                          <Select defaultValue="100">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="50">50 MB</SelectItem>
                              <SelectItem value="100">100 MB</SelectItem>
                              <SelectItem value="250">250 MB</SelectItem>
                              <SelectItem value="500">500 MB</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure email alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'New Release Published', desc: 'When a new version is released', enabled: true },
                          { label: 'Pre-release Created', desc: 'Beta and RC versions', enabled: true },
                          { label: 'Release Edited', desc: 'When release notes change', enabled: false },
                          { label: 'Release Deleted', desc: 'When a release is removed', enabled: true },
                          { label: 'Download Milestone', desc: 'When downloads hit thresholds', enabled: false },
                        ].map((notif, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{notif.label}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <Switch defaultChecked={notif.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Slack Integration</CardTitle>
                        <CardDescription>Post releases to Slack</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <Slack className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Slack</p>
                              <p className="text-sm text-gray-500">#releases channel</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Post New Releases</p>
                            <p className="text-sm text-gray-500">Announce in channel</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include Release Notes</p>
                            <p className="text-sm text-gray-500">Full notes in message</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>HTTP callbacks for events</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-slate-600">https://api.example.com/releases</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <p className="text-xs text-gray-500">Events: release.created, release.published</p>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowAddWebhookSettingsDialog(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>CI/CD Integration</CardTitle>
                        <CardDescription>Automated release pipelines</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'GitHub Actions', connected: true },
                          { name: 'GitLab CI', connected: false },
                          { name: 'CircleCI', connected: false },
                          { name: 'Jenkins', connected: false },
                        ].map((ci, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <span className="font-medium">{ci.name}</span>
                            <Button
                              variant={ci.connected ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => {
                                setSelectedCIProvider(ci.name)
                                setShowCIConfigDialog(true)
                              }}
                            >
                              {ci.connected ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Package Registries</CardTitle>
                        <CardDescription>Auto-publish to registries</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'npm', connected: true },
                          { name: 'PyPI', connected: false },
                          { name: 'Docker Hub', connected: true },
                          { name: 'Maven Central', connected: false },
                        ].map((reg, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <Package className="h-5 w-5 text-gray-500" />
                              <span className="font-medium">{reg.name}</span>
                            </div>
                            <Badge className={reg.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {reg.connected ? 'Connected' : 'Not connected'}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Release Signing</CardTitle>
                        <CardDescription>Cryptographic signatures</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <Shield className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">GPG Signing</p>
                              <p className="text-sm text-gray-500">Sign releases with GPG</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require Signed Commits</p>
                            <p className="text-sm text-gray-500">Only include verified commits</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">GPG Key</span>
                            <Badge variant="outline">Configured</Badge>
                          </div>
                          <code className="text-sm text-gray-600 font-mono">pub rsa4096 2024-01-01 [SC]</code>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Who can create releases</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Required Approvals</Label>
                          <Select defaultValue="1">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No approval required</SelectItem>
                              <SelectItem value="1">1 approval</SelectItem>
                              <SelectItem value="2">2 approvals</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Branch Protection</p>
                            <p className="text-sm text-gray-500">Only release from protected branches</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require CI Passing</p>
                            <p className="text-sm text-gray-500">All checks must pass</p>
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
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Release automation API</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">API Token</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <code className="block w-full p-3 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
                            ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-800 dark:text-amber-200">Keep your token secret</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowRegenerateTokenDialog(true)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Token
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Retention Policy</CardTitle>
                        <CardDescription>Manage old releases</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-delete Pre-releases</p>
                            <p className="text-sm text-gray-500">Remove old beta/RC versions</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Keep Pre-releases For</Label>
                          <Select defaultValue="90">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Archive Old Assets</p>
                            <p className="text-sm text-gray-500">Move to cold storage</p>
                          </div>
                          <Switch defaultChecked />
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
                              <p className="font-medium text-red-700 dark:text-red-400">Delete All Drafts</p>
                              <p className="text-sm text-red-600">Remove all draft releases</p>
                            </div>
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => setShowDeleteDraftsDialog(true)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Reset Settings</p>
                              <p className="text-sm text-red-600">Reset to defaults</p>
                            </div>
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => setShowResetSettingsDialog(true)}
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Feature Flags</CardTitle>
                        <CardDescription>Control feature rollouts with flags</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Feature Flags</p>
                            <p className="text-sm text-gray-500">Link releases to feature flags</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="font-medium">Production Flags</span>
                            </div>
                            <p className="text-2xl font-bold">24</p>
                            <p className="text-sm text-gray-500">Active flags</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              <span className="font-medium">Staging Flags</span>
                            </div>
                            <p className="text-2xl font-bold">18</p>
                            <p className="text-sm text-gray-500">In testing</p>
                          </div>
                        </div>
                        <div>
                          <Label>Default Flag State</Label>
                          <Select defaultValue="off">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="off">Off by default</SelectItem>
                              <SelectItem value="on">On by default</SelectItem>
                              <SelectItem value="percentage">Percentage rollout</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Environment Configuration</CardTitle>
                        <CardDescription>Configure release environments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['Production', 'Staging', 'Development', 'QA'].map((env, i) => (
                          <div key={env} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : i === 2 ? 'bg-blue-500' : 'bg-purple-500'}`} />
                              <div>
                                <p className="font-medium">{env}</p>
                                <p className="text-xs text-gray-500">{i === 0 ? 'app.example.com' : i === 1 ? 'staging.example.com' : i === 2 ? 'dev.example.com' : 'qa.example.com'}</p>
                              </div>
                            </div>
                            <Badge className={i === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {i === 0 ? 'Active' : 'Configured'}
                            </Badge>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowAddEnvironmentDialog(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Environment
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Audit Logs</CardTitle>
                        <CardDescription>Track release activities</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Audit Logging</p>
                            <p className="text-sm text-gray-500">Log all release activities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Log Retention</Label>
                          <Select defaultValue="1year">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30days">30 days</SelectItem>
                              <SelectItem value="90days">90 days</SelectItem>
                              <SelectItem value="1year">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Recent Activity</p>
                          {[
                            { action: 'Release v2.4.0 published', user: 'John', time: '2 hours ago' },
                            { action: 'Draft v2.4.1 created', user: 'Sarah', time: '5 hours ago' },
                            { action: 'Settings updated', user: 'Admin', time: '1 day ago' },
                          ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-2 border-b last:border-0">
                              <span>{log.action}</span>
                              <span className="text-gray-500">{log.user} • {log.time}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowAuditLogDialog(true)}
                        >
                          View Full Audit Log
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Rollback Configuration</CardTitle>
                        <CardDescription>Automatic rollback settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-Rollback</p>
                            <p className="text-sm text-gray-500">Automatically rollback on errors</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Error Threshold</Label>
                          <Select defaultValue="5">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1% error rate</SelectItem>
                              <SelectItem value="5">5% error rate</SelectItem>
                              <SelectItem value="10">10% error rate</SelectItem>
                              <SelectItem value="custom">Custom threshold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Keep Rollback History</p>
                            <p className="text-sm text-gray-500">Maintain rollback points</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">12</p>
                            <p className="text-sm text-gray-500">Available rollback points</p>
                          </div>
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">v2.3.2</p>
                            <p className="text-sm text-gray-500">Last stable version</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Release Analytics</CardTitle>
                        <CardDescription>Track release performance metrics</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Analytics</p>
                            <p className="text-sm text-gray-500">Track adoption and impact</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-xl font-bold">98.5%</p>
                            <p className="text-xs text-gray-500">Adoption Rate</p>
                          </div>
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-xl font-bold">2.3h</p>
                            <p className="text-xs text-gray-500">Avg Deploy Time</p>
                          </div>
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-xl font-bold">0</p>
                            <p className="text-xs text-gray-500">Incidents</p>
                          </div>
                        </div>
                        <div>
                          <Label>Export Format</Label>
                          <Select
                            defaultValue="csv"
                            onValueChange={(value) => setExportFormat(value)}
                          >
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="xlsx">Excel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowExportAnalyticsDialog(true)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Analytics
                        </Button>
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
              insights={mockChangelogAIInsights}
              title="Changelog Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockChangelogCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockChangelogPredictions}
              title="Release Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockChangelogActivities}
            title="Changelog Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
            variant="grid"
          />
        </div>

        {/* Edit Release Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Release {editingChangelog?.version}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-version">Version</Label>
                  <Input
                    id="edit-version"
                    placeholder="v1.0.0"
                    value={changelogForm.version || ''}
                    onChange={(e) => updateFormField('version', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-change_type">Change Type</Label>
                  <Select
                    value={changelogForm.change_type}
                    onValueChange={(value) => updateFormField('change_type', value as ChangeType)}
                  >
                    <SelectTrigger id="edit-change_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="bug_fix">Bug Fix</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="breaking_change">Breaking Change</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                      <SelectItem value="removed">Removed</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Release title"
                  value={changelogForm.title || ''}
                  onChange={(e) => updateFormField('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe the changes..."
                  rows={4}
                  value={changelogForm.description || ''}
                  onChange={(e) => updateFormField('description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-release_status">Status</Label>
                  <Select
                    value={changelogForm.release_status}
                    onValueChange={(value) => updateFormField('release_status', value as ReleaseStatus)}
                  >
                    <SelectTrigger id="edit-release_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="released">Released</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-impact_level">Impact Level</Label>
                  <Select
                    value={changelogForm.impact_level}
                    onValueChange={(value) => updateFormField('impact_level', value as ImpactLevel)}
                  >
                    <SelectTrigger id="edit-impact_level">
                      <SelectValue placeholder="Select impact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="patch">Patch</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Breaking Change</Label>
                    <p className="text-sm text-gray-500">This release contains breaking changes</p>
                  </div>
                  <Switch
                    checked={changelogForm.breaking_change || false}
                    onCheckedChange={(checked) => updateFormField('breaking_change', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requires Migration</Label>
                    <p className="text-sm text-gray-500">Users need to follow migration steps</p>
                  </div>
                  <Switch
                    checked={changelogForm.requires_migration || false}
                    onCheckedChange={(checked) => updateFormField('requires_migration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify Users</Label>
                    <p className="text-sm text-gray-500">Send notification on publish</p>
                  </div>
                  <Switch
                    checked={changelogForm.notify_users || false}
                    onCheckedChange={(checked) => updateFormField('notify_users', checked)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingChangelog(null)
                  setChangelogForm(defaultChangelogForm)
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRelease} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Release</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete version <span className="font-semibold">{deletingChangelog?.version}</span>?
                This action cannot be undone.
              </p>
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Warning</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  All associated assets and metadata will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingChangelog(null)
              }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteRelease} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete Release
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Compare Versions Dialog */}
        <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Compare Versions
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select two versions to compare their changes, commits, and contributors.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base-version">Base Version</Label>
                  <Select
                    value={compareForm.baseVersion}
                    onValueChange={(value) => setCompareForm(prev => ({ ...prev, baseVersion: value }))}
                  >
                    <SelectTrigger id="base-version">
                      <SelectValue placeholder="Select base" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockReleases.map((release) => (
                        <SelectItem key={release.id} value={release.tagName}>
                          {release.tagName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-version">Target Version</Label>
                  <Select
                    value={compareForm.targetVersion}
                    onValueChange={(value) => setCompareForm(prev => ({ ...prev, targetVersion: value }))}
                  >
                    <SelectTrigger id="target-version">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockReleases.map((release) => (
                        <SelectItem key={release.id} value={release.tagName}>
                          {release.tagName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {compareForm.baseVersion && compareForm.targetVersion && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium">
                    Comparing {compareForm.baseVersion} ... {compareForm.targetVersion}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    View all changes between these versions
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowCompareDialog(false)
                  setCompareForm({ baseVersion: '', targetVersion: '' })
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Comparison Ready', {
                      description: `Comparing ${compareForm.baseVersion} to ${compareForm.targetVersion}`
                    })
                    setShowCompareDialog(false)
                    setCompareForm({ baseVersion: '', targetVersion: '' })
                  }}
                  disabled={!compareForm.baseVersion || !compareForm.targetVersion}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notify Users Dialog */}
        <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Send Notification
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notify users about new releases, updates, or important changes.
              </p>
              <div className="space-y-2">
                <Label htmlFor="notify-release">Select Release</Label>
                <Select>
                  <SelectTrigger id="notify-release">
                    <SelectValue placeholder="Select a release" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockReleases.filter(r => !r.isDraft).map((release) => (
                      <SelectItem key={release.id} value={release.tagName}>
                        {release.tagName} - {release.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notify-message">Custom Message (Optional)</Label>
                <Textarea
                  id="notify-message"
                  placeholder="Add a custom message to the notification..."
                  rows={3}
                  value={notifyForm.message}
                  onChange={(e) => setNotifyForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label>Notify All Users</Label>
                  <p className="text-xs text-gray-500">Send to all subscribed users</p>
                </div>
                <Switch
                  checked={notifyForm.notifyAll}
                  onCheckedChange={(checked) => setNotifyForm(prev => ({ ...prev, notifyAll: checked }))}
                />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {notifyForm.notifyAll ? 'All 2,450 users' : '0 users'} will be notified
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowNotifyDialog(false)
                  setNotifyForm({ message: '', notifyAll: false, selectedUsers: [] })
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Notifications Sent', {
                      description: `Notified ${notifyForm.notifyAll ? 'all users' : 'selected users'} successfully`
                    })
                    setShowNotifyDialog(false)
                    setNotifyForm({ message: '', notifyAll: false, selectedUsers: [] })
                  }}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Notifications
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Template Dialog */}
        <Dialog open={showResetTemplateDialog} onOpenChange={setShowResetTemplateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Reset Template
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to reset the release template to the default?
                This will overwrite any custom template you have created.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResetTemplateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success('Template Reset', {
                    description: 'Release template has been reset to default'
                  })
                  setShowResetTemplateDialog(false)
                }}
              >
                Reset Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Webhook Settings Dialog */}
        <Dialog open={showAddWebhookSettingsDialog} onOpenChange={setShowAddWebhookSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Add Webhook
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="settings-webhook-name">Webhook Name</Label>
                <Input
                  id="settings-webhook-name"
                  placeholder="My Webhook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-webhook-url">Payload URL</Label>
                <Input
                  id="settings-webhook-url"
                  placeholder="https://example.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-webhook-secret">Secret (Optional)</Label>
                <Input
                  id="settings-webhook-secret"
                  type="password"
                  placeholder="Webhook secret for verification"
                />
              </div>
              <div className="space-y-2">
                <Label>Events to Trigger</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['release.created', 'release.published', 'release.edited', 'release.deleted'].map((event) => (
                    <div key={event} className="flex items-center gap-2 p-2 border rounded">
                      <Switch id={`event-${event}`} />
                      <Label htmlFor={`event-${event}`} className="text-sm font-normal">{event}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddWebhookSettingsDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success('Webhook Added', {
                    description: 'Webhook has been configured successfully'
                  })
                  setShowAddWebhookSettingsDialog(false)
                }}
              >
                Add Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* CI/CD Configuration Dialog */}
        <Dialog open={showCIConfigDialog} onOpenChange={setShowCIConfigDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {selectedCIProvider} Configuration
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure {selectedCIProvider} to automatically create releases from your CI/CD pipeline.
              </p>
              <div className="space-y-2">
                <Label htmlFor="ci-repo">Repository</Label>
                <Input
                  id="ci-repo"
                  placeholder="owner/repository"
                  defaultValue="freeflow/app"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ci-branch">Release Branch</Label>
                <Select defaultValue="main">
                  <SelectTrigger id="ci-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="master">master</SelectItem>
                    <SelectItem value="release">release</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label>Auto-create Releases</Label>
                  <p className="text-xs text-gray-500">Create releases on successful builds</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label>Include Build Artifacts</Label>
                  <p className="text-xs text-gray-500">Attach build artifacts to releases</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCIConfigDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success('CI/CD Configured', {
                    description: `${selectedCIProvider} has been configured successfully`
                  })
                  setShowCIConfigDialog(false)
                }}
              >
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate Token Dialog */}
        <Dialog open={showRegenerateTokenDialog} onOpenChange={setShowRegenerateTokenDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Regenerate API Token
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Warning</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Regenerating the token will invalidate the current token. Any applications
                  using the old token will need to be updated.
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to regenerate your API token?
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRegenerateTokenDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast.success('Token Regenerated', {
                    description: 'Your new API token has been generated. Please copy it now.'
                  })
                  setShowRegenerateTokenDialog(false)
                }}
              >
                Regenerate Token
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete All Drafts Dialog */}
        <Dialog open={showDeleteDraftsDialog} onOpenChange={setShowDeleteDraftsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete All Drafts
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete all draft releases? This action cannot be undone.
              </p>
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  This will permanently remove all draft releases and their associated data.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDraftsDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast.success('Drafts Deleted', {
                    description: 'All draft releases have been removed'
                  })
                  setShowDeleteDraftsDialog(false)
                }}
              >
                Delete All Drafts
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Reset Settings
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to reset all changelog settings to their default values?
              </p>
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This will reset all your customizations including templates, notifications, and integrations.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast.success('Settings Reset', {
                    description: 'All settings have been reset to defaults'
                  })
                  setShowResetSettingsDialog(false)
                }}
              >
                Reset Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Environment Dialog */}
        <Dialog open={showAddEnvironmentDialog} onOpenChange={setShowAddEnvironmentDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Environment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new deployment environment for your releases.
              </p>
              <div className="space-y-2">
                <Label htmlFor="env-name">Environment Name</Label>
                <Input
                  id="env-name"
                  placeholder="e.g., Canary, Preview"
                  value={newEnvironmentForm.name}
                  onChange={(e) => setNewEnvironmentForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="env-url">Environment URL</Label>
                <Input
                  id="env-url"
                  placeholder="https://canary.example.com"
                  value={newEnvironmentForm.url}
                  onChange={(e) => setNewEnvironmentForm(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="env-type">Environment Type</Label>
                <Select
                  value={newEnvironmentForm.type}
                  onValueChange={(value) => setNewEnvironmentForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="env-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="preview">Preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label>Auto-Deploy</Label>
                  <p className="text-xs text-gray-500">Automatically deploy releases to this environment</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowAddEnvironmentDialog(false)
                setNewEnvironmentForm({ name: '', url: '', type: 'development' })
              }}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!newEnvironmentForm.name || !newEnvironmentForm.url) {
                    toast.error('Validation Error', {
                      description: 'Name and URL are required'
                    })
                    return
                  }
                  toast.success('Environment Added', {
                    description: `${newEnvironmentForm.name} environment has been configured`
                  })
                  setShowAddEnvironmentDialog(false)
                  setNewEnvironmentForm({ name: '', url: '', type: 'development' })
                }}
              >
                Add Environment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Audit Log Dialog */}
        <Dialog open={showAuditLogDialog} onOpenChange={setShowAuditLogDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Full Audit Log
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-2 py-4">
                {[
                  { action: 'Release v2.5.0 published', user: 'Sarah Chen', time: '2024-12-20 10:30 AM', type: 'success' },
                  { action: 'Release v2.5.0 draft created', user: 'Sarah Chen', time: '2024-12-20 09:15 AM', type: 'info' },
                  { action: 'Webhook notification sent', user: 'System', time: '2024-12-20 10:31 AM', type: 'info' },
                  { action: 'Release v2.4.2 published', user: 'David Kim', time: '2024-12-15 02:30 PM', type: 'success' },
                  { action: 'Settings updated', user: 'Admin', time: '2024-12-14 11:00 AM', type: 'info' },
                  { action: 'API token regenerated', user: 'Admin', time: '2024-12-13 04:45 PM', type: 'warning' },
                  { action: 'New webhook added', user: 'Sarah Chen', time: '2024-12-12 09:00 AM', type: 'info' },
                  { action: 'Release v2.4.1 published', user: 'Emily Rodriguez', time: '2024-12-10 09:00 AM', type: 'success' },
                  { action: 'Draft release deleted', user: 'Marcus Johnson', time: '2024-12-09 03:20 PM', type: 'warning' },
                  { action: 'Release template updated', user: 'Sarah Chen', time: '2024-12-08 10:15 AM', type: 'info' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.type === 'success' ? 'bg-green-500' :
                        log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-gray-500">by {log.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-500">Showing 10 of 156 entries</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info('Loading previous page...')
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info('Loading next page...')
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Analytics Dialog */}
        <Dialog open={showExportAnalyticsDialog} onOpenChange={setShowExportAnalyticsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Analytics
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export release analytics data in your preferred format.
              </p>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select defaultValue="30days">
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['CSV', 'JSON', 'Excel'].map((format) => (
                    <Button
                      key={format}
                      variant={exportFormat.toLowerCase() === format.toLowerCase() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExportFormat(format.toLowerCase())}
                    >
                      {format}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Include Data</Label>
                <div className="space-y-2">
                  {['Downloads', 'Contributors', 'Release Notes', 'Adoption Metrics'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Switch id={`export-${item}`} defaultChecked />
                      <Label htmlFor={`export-${item}`} className="font-normal">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportAnalyticsDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success('Export Started', {
                    description: `Analytics data is being exported as ${exportFormat.toUpperCase()}`
                  })
                  setShowExportAnalyticsDialog(false)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {loading && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading releases...</span>
          </div>
        )}
      </div>
    </div>
  )
}
