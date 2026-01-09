'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Rocket,
  GitBranch,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Package,
  Tag,
  Calendar,
  Settings,
  Pause,
  Download,
  Users,
  GitCommit,
  GitPullRequest,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  MoreVertical,
  Search,
  Filter,
  Plus,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Zap,
  Server,
  Activity,
  BarChart3,
  Loader2
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



// Database Types
interface DbRelease {
  id: string
  user_id: string
  version: string
  release_name: string
  description: string | null
  status: 'draft' | 'scheduled' | 'rolling' | 'deployed' | 'failed' | 'rolled_back'
  release_type: 'major' | 'minor' | 'patch' | 'hotfix' | 'prerelease'
  environment: 'development' | 'staging' | 'production' | 'canary'
  deployed_at: string | null
  scheduled_for: string | null
  deploy_time_minutes: number | null
  commits_count: number
  contributors_count: number
  coverage_percentage: number
  rollback_rate: number
  changelog: string | null
  breaking_changes: string[]
  git_branch: string | null
  git_tag: string | null
  build_number: string | null
  is_prerelease: boolean
  is_draft: boolean
  is_latest: boolean
  downloads_count: number
  views_count: number
  additions_count: number
  deletions_count: number
  files_changed: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface DbDeployment {
  id: string
  release_id: string
  user_id: string
  environment: string
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled' | 'rolled_back'
  started_at: string | null
  completed_at: string | null
  duration_minutes: number | null
  servers_count: number
  health_percentage: number
  logs: string | null
  error_message: string | null
  deployed_by: string | null
  created_at: string
}

interface DbRollback {
  id: string
  user_id: string
  release_id: string
  release_version: string
  target_version: string
  reason: string
  status: 'completed' | 'failed' | 'in_progress'
  started_at: string
  completed_at: string | null
  initiated_by: string | null
  created_at: string
}

// Form state interface
interface ReleaseFormData {
  version: string
  release_name: string
  description: string
  release_type: 'major' | 'minor' | 'patch' | 'hotfix' | 'prerelease'
  environment: 'development' | 'staging' | 'production' | 'canary'
  changelog: string
  git_branch: string
  git_tag: string
  is_prerelease: boolean
  is_draft: boolean
  scheduled_for: string
}

// Types
type ReleaseStatus = 'deployed' | 'rolling' | 'scheduled' | 'draft' | 'failed' | 'cancelled'
type ReleaseType = 'major' | 'minor' | 'patch' | 'hotfix' | 'prerelease'
type Environment = 'production' | 'staging' | 'development' | 'canary'
type AssetType = 'binary' | 'source' | 'docker' | 'docs' | 'checksums'

interface Release {
  id: string
  version: string
  name: string
  description: string
  changelog: string
  status: ReleaseStatus
  type: ReleaseType
  environment: Environment
  tagName: string
  branch: string
  commitHash: string
  author: {
    id: string
    name: string
    avatar: string
  }
  contributors: {
    id: string
    name: string
    avatar: string
    commits: number
  }[]
  commits: number
  additions: number
  deletions: number
  filesChanged: number
  deployTime: number
  coverage: number
  isPrerelease: boolean
  isDraft: boolean
  isLatest: boolean
  assets: ReleaseAsset[]
  deployments: Deployment[]
  createdAt: string
  publishedAt: string | null
  scheduledFor: string | null
  deployedAt: string | null
  downloads: number
  views: number
}

interface ReleaseAsset {
  id: string
  name: string
  type: AssetType
  size: number
  downloads: number
  contentType: string
  createdAt: string
  uploadedBy: string
}

interface Deployment {
  id: string
  environment: Environment
  status: 'success' | 'failed' | 'in_progress' | 'pending' | 'rolled_back'
  startedAt: string
  completedAt: string | null
  duration: number
  deployedBy: string
  servers: number
  coverage: number
}

interface Commit {
  id: string
  hash: string
  message: string
  author: {
    name: string
    avatar: string
  }
  additions: number
  deletions: number
  files: number
  createdAt: string
}

interface RollbackEvent {
  id: string
  releaseId: string
  releaseVersion: string
  targetVersion: string
  reason: string
  initiatedBy: {
    name: string
    avatar: string
  }
  status: 'completed' | 'failed' | 'in_progress'
  startedAt: string
  completedAt: string | null
}

interface ReleaseStats {
  totalReleases: number
  deployedReleases: number
  scheduledReleases: number
  rollingReleases: number
  failedReleases: number
  draftReleases: number
  successRate: number
  avgDeployTime: number
  totalDownloads: number
  totalCommits: number
  releaseFrequency: number
}

// Mock data
const mockReleases: Release[] = [
  {
    id: '1',
    version: 'v2.5.0',
    name: 'Aurora Release',
    description: 'Major feature release with new dashboard and improved performance',
    changelog: '## New Features\n- Redesigned dashboard with real-time metrics\n- Added dark mode support\n- Improved API response times by 40%\n\n## Bug Fixes\n- Fixed memory leak in worker process\n- Resolved authentication edge cases',
    status: 'deployed',
    type: 'major',
    environment: 'production',
    tagName: 'v2.5.0',
    branch: 'main',
    commitHash: 'abc123f',
    author: { id: '1', name: 'Alex Chen', avatar: '' },
    contributors: [
      { id: '1', name: 'Alex Chen', avatar: '', commits: 24 },
      { id: '2', name: 'Sarah Miller', avatar: '', commits: 18 },
      { id: '3', name: 'Mike Johnson', avatar: '', commits: 12 }
    ],
    commits: 54,
    additions: 8456,
    deletions: 2341,
    filesChanged: 89,
    deployTime: 4.5,
    coverage: 100,
    isPrerelease: false,
    isDraft: false,
    isLatest: true,
    assets: [
      { id: '1', name: 'app-v2.5.0-linux.tar.gz', type: 'binary', size: 45678901, downloads: 1234, contentType: 'application/gzip', createdAt: '2024-12-20', uploadedBy: 'Alex Chen' },
      { id: '2', name: 'app-v2.5.0-windows.zip', type: 'binary', size: 52345678, downloads: 2345, contentType: 'application/zip', createdAt: '2024-12-20', uploadedBy: 'Alex Chen' },
      { id: '3', name: 'source-v2.5.0.tar.gz', type: 'source', size: 12345678, downloads: 567, contentType: 'application/gzip', createdAt: '2024-12-20', uploadedBy: 'Alex Chen' }
    ],
    deployments: [
      { id: '1', environment: 'production', status: 'success', startedAt: '2024-12-20T10:00:00Z', completedAt: '2024-12-20T10:05:00Z', duration: 4.5, deployedBy: 'Alex Chen', servers: 12, coverage: 100 }
    ],
    createdAt: '2024-12-18T14:00:00Z',
    publishedAt: '2024-12-20T10:00:00Z',
    scheduledFor: null,
    deployedAt: '2024-12-20T10:05:00Z',
    downloads: 4156,
    views: 12456
  },
  {
    id: '2',
    version: 'v2.5.1',
    name: 'Aurora Patch',
    description: 'Hotfix for critical security vulnerability',
    changelog: '## Security Fixes\n- Patched XSS vulnerability in comment system\n- Updated dependencies with known vulnerabilities\n\n## Bug Fixes\n- Fixed date picker timezone issues',
    status: 'rolling',
    type: 'hotfix',
    environment: 'production',
    tagName: 'v2.5.1',
    branch: 'hotfix/security-patch',
    commitHash: 'def456a',
    author: { id: '2', name: 'Sarah Miller', avatar: '' },
    contributors: [
      { id: '2', name: 'Sarah Miller', avatar: '', commits: 5 },
      { id: '1', name: 'Alex Chen', avatar: '', commits: 3 }
    ],
    commits: 8,
    additions: 234,
    deletions: 156,
    filesChanged: 12,
    deployTime: 2.1,
    coverage: 67,
    isPrerelease: false,
    isDraft: false,
    isLatest: false,
    assets: [
      { id: '4', name: 'app-v2.5.1-linux.tar.gz', type: 'binary', size: 45789012, downloads: 234, contentType: 'application/gzip', createdAt: '2024-12-22', uploadedBy: 'Sarah Miller' }
    ],
    deployments: [
      { id: '2', environment: 'production', status: 'in_progress', startedAt: '2024-12-24T09:00:00Z', completedAt: null, duration: 0, deployedBy: 'Sarah Miller', servers: 12, coverage: 67 }
    ],
    createdAt: '2024-12-22T11:00:00Z',
    publishedAt: '2024-12-24T09:00:00Z',
    scheduledFor: null,
    deployedAt: null,
    downloads: 234,
    views: 567
  },
  {
    id: '3',
    version: 'v2.6.0-beta.1',
    name: 'Nebula Beta',
    description: 'Beta release for upcoming v2.6.0 with experimental features',
    changelog: '## Experimental Features\n- AI-powered code suggestions\n- Real-time collaboration mode\n- WebSocket-based notifications\n\n## Known Issues\n- Performance may be slower than stable releases',
    status: 'deployed',
    type: 'prerelease',
    environment: 'staging',
    tagName: 'v2.6.0-beta.1',
    branch: 'develop',
    commitHash: 'ghi789b',
    author: { id: '3', name: 'Mike Johnson', avatar: '' },
    contributors: [
      { id: '3', name: 'Mike Johnson', avatar: '', commits: 34 },
      { id: '4', name: 'Emma Wilson', avatar: '', commits: 28 }
    ],
    commits: 62,
    additions: 12345,
    deletions: 4567,
    filesChanged: 134,
    deployTime: 6.2,
    coverage: 100,
    isPrerelease: true,
    isDraft: false,
    isLatest: false,
    assets: [],
    deployments: [
      { id: '3', environment: 'staging', status: 'success', startedAt: '2024-12-21T14:00:00Z', completedAt: '2024-12-21T14:06:00Z', duration: 6.2, deployedBy: 'Mike Johnson', servers: 4, coverage: 100 }
    ],
    createdAt: '2024-12-19T09:00:00Z',
    publishedAt: '2024-12-21T14:00:00Z',
    scheduledFor: null,
    deployedAt: '2024-12-21T14:06:00Z',
    downloads: 89,
    views: 234
  },
  {
    id: '4',
    version: 'v2.6.0',
    name: 'Nebula Release',
    description: 'Major feature release scheduled for next week',
    changelog: '## Planned Features\n- AI-powered code suggestions (stable)\n- Real-time collaboration\n- New notification system\n- Performance improvements',
    status: 'scheduled',
    type: 'major',
    environment: 'production',
    tagName: 'v2.6.0',
    branch: 'release/v2.6.0',
    commitHash: 'jkl012c',
    author: { id: '1', name: 'Alex Chen', avatar: '' },
    contributors: [
      { id: '1', name: 'Alex Chen', avatar: '', commits: 45 },
      { id: '3', name: 'Mike Johnson', avatar: '', commits: 38 },
      { id: '4', name: 'Emma Wilson', avatar: '', commits: 29 }
    ],
    commits: 112,
    additions: 18567,
    deletions: 6789,
    filesChanged: 178,
    deployTime: 0,
    coverage: 0,
    isPrerelease: false,
    isDraft: false,
    isLatest: false,
    assets: [],
    deployments: [],
    createdAt: '2024-12-23T16:00:00Z',
    publishedAt: null,
    scheduledFor: '2024-12-30T10:00:00Z',
    deployedAt: null,
    downloads: 0,
    views: 345
  },
  {
    id: '5',
    version: 'v2.4.3',
    name: 'Legacy Patch',
    description: 'Final patch for v2.4 branch',
    changelog: '## Bug Fixes\n- Fixed edge case in payment processing\n- Resolved caching issues',
    status: 'deployed',
    type: 'patch',
    environment: 'production',
    tagName: 'v2.4.3',
    branch: 'release/v2.4',
    commitHash: 'mno345d',
    author: { id: '4', name: 'Emma Wilson', avatar: '' },
    contributors: [{ id: '4', name: 'Emma Wilson', avatar: '', commits: 6 }],
    commits: 6,
    additions: 145,
    deletions: 89,
    filesChanged: 8,
    deployTime: 1.8,
    coverage: 100,
    isPrerelease: false,
    isDraft: false,
    isLatest: false,
    assets: [],
    deployments: [
      { id: '4', environment: 'production', status: 'success', startedAt: '2024-12-15T11:00:00Z', completedAt: '2024-12-15T11:02:00Z', duration: 1.8, deployedBy: 'Emma Wilson', servers: 12, coverage: 100 }
    ],
    createdAt: '2024-12-14T10:00:00Z',
    publishedAt: '2024-12-15T11:00:00Z',
    scheduledFor: null,
    deployedAt: '2024-12-15T11:02:00Z',
    downloads: 567,
    views: 890
  },
  {
    id: '6',
    version: 'v2.7.0',
    name: 'Cosmos Draft',
    description: 'Work in progress - next major release',
    changelog: '## Planned\n- New features TBD\n- Performance improvements TBD',
    status: 'draft',
    type: 'major',
    environment: 'development',
    tagName: 'v2.7.0',
    branch: 'develop',
    commitHash: 'pqr678e',
    author: { id: '1', name: 'Alex Chen', avatar: '' },
    contributors: [],
    commits: 23,
    additions: 4567,
    deletions: 1234,
    filesChanged: 45,
    deployTime: 0,
    coverage: 0,
    isPrerelease: false,
    isDraft: true,
    isLatest: false,
    assets: [],
    deployments: [],
    createdAt: '2024-12-24T08:00:00Z',
    publishedAt: null,
    scheduledFor: null,
    deployedAt: null,
    downloads: 0,
    views: 12
  }
]

const mockCommits: Commit[] = [
  { id: '1', hash: 'abc123f', message: 'feat: Add new dashboard components', author: { name: 'Alex Chen', avatar: '' }, additions: 456, deletions: 123, files: 12, createdAt: '2024-12-20T09:30:00Z' },
  { id: '2', hash: 'bcd234g', message: 'fix: Resolve memory leak in worker', author: { name: 'Sarah Miller', avatar: '' }, additions: 23, deletions: 89, files: 3, createdAt: '2024-12-20T08:45:00Z' },
  { id: '3', hash: 'cde345h', message: 'chore: Update dependencies', author: { name: 'Mike Johnson', avatar: '' }, additions: 567, deletions: 234, files: 5, createdAt: '2024-12-19T16:20:00Z' },
  { id: '4', hash: 'def456i', message: 'feat: Implement dark mode', author: { name: 'Emma Wilson', avatar: '' }, additions: 234, deletions: 45, files: 8, createdAt: '2024-12-19T14:00:00Z' },
  { id: '5', hash: 'efg567j', message: 'docs: Update API documentation', author: { name: 'Alex Chen', avatar: '' }, additions: 189, deletions: 67, files: 4, createdAt: '2024-12-18T11:30:00Z' }
]

const mockRollbacks: RollbackEvent[] = [
  { id: '1', releaseId: '2', releaseVersion: 'v2.4.2', targetVersion: 'v2.4.1', reason: 'Critical bug in payment processing', initiatedBy: { name: 'Alex Chen', avatar: '' }, status: 'completed', startedAt: '2024-12-10T15:30:00Z', completedAt: '2024-12-10T15:32:00Z' },
  { id: '2', releaseId: '3', releaseVersion: 'v2.5.0-beta.2', targetVersion: 'v2.5.0-beta.1', reason: 'Performance regression detected', initiatedBy: { name: 'Sarah Miller', avatar: '' }, status: 'completed', startedAt: '2024-12-05T10:00:00Z', completedAt: '2024-12-05T10:03:00Z' }
]

const mockStats: ReleaseStats = {
  totalReleases: 45,
  deployedReleases: 38,
  scheduledReleases: 3,
  rollingReleases: 1,
  failedReleases: 2,
  draftReleases: 1,
  successRate: 95.5,
  avgDeployTime: 3.8,
  totalDownloads: 45678,
  totalCommits: 1234,
  releaseFrequency: 2.3
}

// Enhanced Competitive Upgrade Mock Data
const mockReleasesAIInsights = [
  { id: '1', type: 'success' as const, title: 'Deployment Success', description: 'All recent deployments completed successfully. Zero rollbacks this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Deployment' },
  { id: '2', type: 'info' as const, title: 'Release Cadence', description: 'Release frequency increased 23% compared to last quarter.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Metrics' },
  { id: '3', type: 'warning' as const, title: 'Staging Bottleneck', description: 'Staging environment utilization at 89%. Consider scaling.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Infrastructure' },
]

const mockReleasesCollaborators = [
  { id: '1', name: 'Release Manager', avatar: '/avatars/release.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'DevOps Engineer', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'Engineer' },
  { id: '3', name: 'QA Lead', avatar: '/avatars/qa.jpg', status: 'away' as const, role: 'QA' },
]

const mockReleasesPredictions = [
  { id: '1', title: 'Next Major Release', prediction: 'v3.0 estimated ready in 2 weeks based on current velocity', confidence: 82, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Hotfix Likelihood', prediction: 'Low probability of emergency fixes this sprint', confidence: 91, trend: 'stable' as const, impact: 'medium' as const },
]

const mockReleasesActivities = [
  { id: '1', user: 'DevOps', action: 'Deployed', target: 'v2.5.1 to production', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Release Manager', action: 'Scheduled', target: 'v2.6.0 for next Tuesday', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'QA Team', action: 'Approved', target: 'v2.5.1 release candidate', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// Initial form state
const initialFormData: ReleaseFormData = {
  version: '',
  release_name: '',
  description: '',
  release_type: 'minor',
  environment: 'development',
  changelog: '',
  git_branch: 'main',
  git_tag: '',
  is_prerelease: false,
  is_draft: true,
  scheduled_for: ''
}

export default function ReleasesClient() {
  const supabase = createClient()

  // UI State
  const [activeTab, setActiveTab] = useState('releases')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // CRUD Dialog State
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [showRollbackDialog, setShowRollbackDialog] = useState(false)
  const [showExportChangelogDialog, setShowExportChangelogDialog] = useState(false)

  // Form State
  const [formData, setFormData] = useState<ReleaseFormData>(initialFormData)
  const [rollbackReason, setRollbackReason] = useState('')
  const [targetVersion, setTargetVersion] = useState('')

  // Loading States
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isRollingBack, setIsRollingBack] = useState(false)

  // Data State
  const [releases, setReleases] = useState<DbRelease[]>([])
  const [deployments, setDeployments] = useState<DbDeployment[]>([])
  const [rollbacks, setRollbacks] = useState<DbRollback[]>([])
  const [releaseToEdit, setReleaseToEdit] = useState<DbRelease | null>(null)
  const [releaseToDelete, setReleaseToDelete] = useState<DbRelease | null>(null)
  const [releaseToDeploy, setReleaseToDeploy] = useState<DbRelease | null>(null)
  const [releaseToRollback, setReleaseToRollback] = useState<DbRelease | null>(null)

  // Fetch releases from Supabase
  const fetchReleases = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReleases(data || [])
    } catch (error) {
      console.error('Error fetching releases:', error)
      toast.error('Failed to load releases')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Fetch deployments
  const fetchDeployments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false, nullsFirst: false })

      if (error) throw error
      setDeployments(data || [])
    } catch (error) {
      console.error('Error fetching deployments:', error)
    }
  }, [supabase])

  // Fetch rollbacks
  const fetchRollbacks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('rollbacks')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })

      if (error) throw error
      setRollbacks(data || [])
    } catch (error) {
      console.error('Error fetching rollbacks:', error)
    }
  }, [supabase])

  // Initial data fetch
  useEffect(() => {
    fetchReleases()
    fetchDeployments()
    fetchRollbacks()
  }, [fetchReleases, fetchDeployments, fetchRollbacks])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('releases_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'releases' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setReleases(prev => [payload.new as DbRelease, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setReleases(prev => prev.map(r => r.id === payload.new.id ? payload.new as DbRelease : r))
        } else if (payload.eventType === 'DELETE') {
          setReleases(prev => prev.filter(r => r.id !== payload.old.id))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deployments' }, () => {
        fetchDeployments()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rollbacks' }, () => {
        fetchRollbacks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchDeployments, fetchRollbacks])

  // Create release
  const handleCreateRelease = async () => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to create a release')
        return
      }

      const releaseData = {
        user_id: user.id,
        version: formData.version,
        release_name: formData.release_name,
        description: formData.description || null,
        status: formData.scheduled_for ? 'scheduled' : (formData.is_draft ? 'draft' : 'deployed'),
        release_type: formData.release_type,
        environment: formData.environment,
        changelog: formData.changelog || null,
        git_branch: formData.git_branch || null,
        git_tag: formData.git_tag || formData.version,
        is_prerelease: formData.is_prerelease,
        is_draft: formData.is_draft,
        is_latest: false,
        scheduled_for: formData.scheduled_for || null,
        commits_count: 0,
        contributors_count: 1,
        coverage_percentage: 0,
        rollback_rate: 0,
        breaking_changes: [],
        downloads_count: 0,
        views_count: 0,
        additions_count: 0,
        deletions_count: 0,
        files_changed: 0,
        metadata: {}
      }

      const { data, error } = await supabase
        .from('releases')
        .insert(releaseData)
        .select()
        .single()

      if (error) throw error

      toast.success('Release created successfully', {
        description: `${formData.release_name} (${formData.version}) has been created`
      })
      setShowCreateDialog(false)
      setFormData(initialFormData)
      fetchReleases()
    } catch (error: any) {
      console.error('Error creating release:', error)
      toast.error('Failed to create release', {
        description: error.message
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update release
  const handleUpdateRelease = async () => {
    if (!releaseToEdit) return

    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to update a release')
        return
      }

      const { error } = await supabase
        .from('releases')
        .update({
          version: formData.version,
          release_name: formData.release_name,
          description: formData.description || null,
          release_type: formData.release_type,
          environment: formData.environment,
          changelog: formData.changelog || null,
          git_branch: formData.git_branch || null,
          git_tag: formData.git_tag || formData.version,
          is_prerelease: formData.is_prerelease,
          is_draft: formData.is_draft,
          scheduled_for: formData.scheduled_for || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseToEdit.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Release updated successfully', {
        description: `${formData.release_name} has been updated`
      })
      setShowEditDialog(false)
      setReleaseToEdit(null)
      setFormData(initialFormData)
      fetchReleases()
    } catch (error: any) {
      console.error('Error updating release:', error)
      toast.error('Failed to update release', {
        description: error.message
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete release (soft delete)
  const handleDeleteRelease = async () => {
    if (!releaseToDelete) return

    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to delete a release')
        return
      }

      const { error } = await supabase
        .from('releases')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', releaseToDelete.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Release deleted successfully', {
        description: `${releaseToDelete.release_name} has been deleted`
      })
      setShowDeleteDialog(false)
      setReleaseToDelete(null)
      fetchReleases()
    } catch (error: any) {
      console.error('Error deleting release:', error)
      toast.error('Failed to delete release', {
        description: error.message
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Deploy release
  const handleDeployRelease = async () => {
    if (!releaseToDeploy) return

    try {
      setIsDeploying(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to deploy a release')
        return
      }

      // Create deployment record
      const deploymentData = {
        user_id: user.id,
        release_id: releaseToDeploy.id,
        environment: releaseToDeploy.environment,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        servers_count: 1,
        health_percentage: 0,
        deployed_by: user.email || user.id
      }

      const { error: deployError } = await supabase
        .from('deployments')
        .insert(deploymentData)

      if (deployError) throw deployError

      // Update release status
      const { error: releaseError } = await supabase
        .from('releases')
        .update({
          status: 'rolling',
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseToDeploy.id)
        .eq('user_id', user.id)

      if (releaseError) throw releaseError

      toast.success('Deployment started', {
        description: `${releaseToDeploy.release_name} deployment is in progress`
      })
      setShowDeployDialog(false)
      setReleaseToDeploy(null)
      fetchReleases()
      fetchDeployments()
    } catch (error: any) {
      console.error('Error deploying release:', error)
      toast.error('Failed to deploy release', {
        description: error.message
      })
    } finally {
      setIsDeploying(false)
    }
  }

  // Rollback release
  const handleRollbackRelease = async () => {
    if (!releaseToRollback || !rollbackReason || !targetVersion) return

    try {
      setIsRollingBack(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to rollback a release')
        return
      }

      // Create rollback record
      const rollbackData = {
        user_id: user.id,
        release_id: releaseToRollback.id,
        release_version: releaseToRollback.version,
        target_version: targetVersion,
        reason: rollbackReason,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        initiated_by: user.email || user.id
      }

      const { error: rollbackError } = await supabase
        .from('rollbacks')
        .insert(rollbackData)

      if (rollbackError) throw rollbackError

      // Update release status
      const { error: releaseError } = await supabase
        .from('releases')
        .update({
          status: 'rolled_back',
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseToRollback.id)
        .eq('user_id', user.id)

      if (releaseError) throw releaseError

      toast.success('Rollback initiated', {
        description: `Rolling back ${releaseToRollback.version} to ${targetVersion}`
      })
      setShowRollbackDialog(false)
      setReleaseToRollback(null)
      setRollbackReason('')
      setTargetVersion('')
      fetchReleases()
      fetchRollbacks()
    } catch (error: any) {
      console.error('Error rolling back release:', error)
      toast.error('Failed to rollback release', {
        description: error.message
      })
    } finally {
      setIsRollingBack(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (release: DbRelease) => {
    setReleaseToEdit(release)
    setFormData({
      version: release.version,
      release_name: release.release_name,
      description: release.description || '',
      release_type: release.release_type,
      environment: release.environment,
      changelog: release.changelog || '',
      git_branch: release.git_branch || 'main',
      git_tag: release.git_tag || release.version,
      is_prerelease: release.is_prerelease,
      is_draft: release.is_draft,
      scheduled_for: release.scheduled_for || ''
    })
    setShowEditDialog(true)
  }

  // Open deploy dialog
  const openDeployDialog = (release: DbRelease) => {
    setReleaseToDeploy(release)
    setShowDeployDialog(true)
  }

  // Open rollback dialog
  const openRollbackDialog = (release: DbRelease) => {
    setReleaseToRollback(release)
    setShowRollbackDialog(true)
  }

  // Open delete dialog
  const openDeleteDialog = (release: DbRelease) => {
    setReleaseToDelete(release)
    setShowDeleteDialog(true)
  }

  // Export releases
  const handleExportReleases = async () => {
    try {
      const dataStr = JSON.stringify(releases, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `releases-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Export successful', {
        description: 'Release history has been downloaded'
      })
    } catch (error) {
      toast.error('Failed to export releases')
    }
  }

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalReleases = releases.length
    const deployedReleases = releases.filter(r => r.status === 'deployed').length
    const scheduledReleases = releases.filter(r => r.status === 'scheduled').length
    const rollingReleases = releases.filter(r => r.status === 'rolling').length
    const failedReleases = releases.filter(r => r.status === 'failed').length
    const draftReleases = releases.filter(r => r.status === 'draft').length
    const successRate = totalReleases > 0 ? ((deployedReleases / totalReleases) * 100).toFixed(1) : '0'
    const avgDeployTime = releases.filter(r => r.deploy_time_minutes).length > 0
      ? (releases.filter(r => r.deploy_time_minutes).reduce((sum, r) => sum + (r.deploy_time_minutes || 0), 0) / releases.filter(r => r.deploy_time_minutes).length).toFixed(1)
      : '0'
    const totalDownloads = releases.reduce((sum, r) => sum + (r.downloads_count || 0), 0)
    const totalCommits = releases.reduce((sum, r) => sum + (r.commits_count || 0), 0)

    return {
      totalReleases,
      deployedReleases,
      scheduledReleases,
      rollingReleases,
      failedReleases,
      draftReleases,
      successRate,
      avgDeployTime,
      totalDownloads,
      totalCommits,
      releaseFrequency: totalReleases > 0 ? (totalReleases / 4).toFixed(1) : '0' // Releases per week (approx)
    }
  }, [releases])

  // Filter releases based on search and filters
  const filteredReleases = useMemo(() => {
    // Use mock data if no real data exists
    const dataToFilter = releases.length > 0 ? releases.map(r => ({
      id: r.id,
      version: r.version,
      name: r.release_name,
      description: r.description || '',
      changelog: r.changelog || '',
      status: r.status as ReleaseStatus,
      type: r.release_type as ReleaseType,
      environment: r.environment as Environment,
      tagName: r.git_tag || r.version,
      branch: r.git_branch || 'main',
      commitHash: r.build_number || 'HEAD',
      author: { id: r.user_id, name: 'User', avatar: '' },
      contributors: [],
      commits: r.commits_count || 0,
      additions: r.additions_count || 0,
      deletions: r.deletions_count || 0,
      filesChanged: r.files_changed || 0,
      deployTime: r.deploy_time_minutes || 0,
      coverage: r.coverage_percentage || 0,
      isPrerelease: r.is_prerelease,
      isDraft: r.is_draft,
      isLatest: r.is_latest,
      assets: [],
      deployments: [],
      createdAt: r.created_at,
      publishedAt: r.deployed_at,
      scheduledFor: r.scheduled_for,
      deployedAt: r.deployed_at,
      downloads: r.downloads_count || 0,
      views: r.views_count || 0
    })) : mockReleases

    return dataToFilter.filter(release => {
      const matchesSearch = release.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.version.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || release.status === selectedStatus
      const matchesType = selectedType === 'all' || release.type === selectedType
      return matchesSearch && matchesStatus && matchesType
    })
  }, [releases, searchQuery, selectedStatus, selectedType])

  const getStatusColor = (status: ReleaseStatus) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'rolling': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'cancelled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: ReleaseType) => {
    switch (type) {
      case 'major': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      case 'minor': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
      case 'patch': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
      case 'hotfix': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'prerelease': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: ReleaseStatus) => {
    switch (status) {
      case 'deployed': return CheckCircle
      case 'rolling': return RefreshCw
      case 'scheduled': return Calendar
      case 'draft': return Edit
      case 'failed': return AlertCircle
      case 'cancelled': return AlertTriangle
      default: return Rocket
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const openReleaseDialog = (release: Release) => {
    setSelectedRelease(release)
    setShowReleaseDialog(true)
  }

  const statsDisplay = [
    { label: 'Total Releases', value: stats.totalReleases.toString(), icon: Rocket, change: '+12', color: 'text-indigo-600' },
    { label: 'Deployed', value: stats.deployedReleases.toString(), icon: CheckCircle, change: '+8', color: 'text-green-600' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: TrendingUp, change: '+2.3%', color: 'text-blue-600' },
    { label: 'Avg Deploy', value: `${stats.avgDeployTime}min`, icon: Clock, change: '-0.5min', color: 'text-purple-600' },
    { label: 'Downloads', value: formatNumber(stats.totalDownloads), icon: Download, change: '+2.3K', color: 'text-cyan-600' },
    { label: 'Commits', value: formatNumber(stats.totalCommits), icon: GitCommit, change: '+156', color: 'text-pink-600' },
    { label: 'Frequency', value: `${stats.releaseFrequency}/wk`, icon: Activity, change: '+0.3', color: 'text-orange-600' },
    { label: 'Rolling', value: stats.rollingReleases.toString(), icon: RefreshCw, change: '1 active', color: 'text-teal-600' }
  ]

  // Quick Actions for toolbar (with proper dialog handlers)
  const releasesQuickActions = [
    { id: '1', label: 'New Release', icon: 'plus', action: () => setShowCreateDialog(true), variant: 'default' as const },
    { id: '2', label: 'Rollback', icon: 'undo', action: () => setShowRollbackDialog(true), variant: 'default' as const },
    { id: '3', label: 'Export Changelog', icon: 'download', action: () => setShowExportChangelogDialog(true), variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Release Management</h1>
              <p className="text-gray-500 dark:text-gray-400">GitHub Releases level deployment control</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search releases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => { /* TODO: Open filter options */ }}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Release
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {isLoading ? (
            <Card className="col-span-full bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-gray-500">Loading statistics...</span>
              </CardContent>
            </Card>
          ) : (
            statsDisplay.map((stat, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border shadow-sm">
            <TabsTrigger value="releases" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <Tag className="w-4 h-4 mr-2" />
              Releases
            </TabsTrigger>
            <TabsTrigger value="deployments" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <Server className="w-4 h-4 mr-2" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="commits" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <GitCommit className="w-4 h-4 mr-2" />
              Commits
            </TabsTrigger>
            <TabsTrigger value="rollbacks" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <RotateCcw className="w-4 h-4 mr-2" />
              Rollbacks
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <Package className="w-4 h-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Releases Tab */}
          <TabsContent value="releases" className="mt-6 space-y-6">
            {/* Releases Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Release Management</h2>
                  <p className="text-indigo-100">Deploy, track, and manage your software releases</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={handleExportReleases}>
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button>
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />New Release
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{stats.totalReleases}</div>
                  <div className="text-sm text-indigo-100">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{stats.deployedReleases}</div>
                  <div className="text-sm text-indigo-100">Deployed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{stats.scheduledReleases}</div>
                  <div className="text-sm text-indigo-100">Scheduled</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{stats.successRate}%</div>
                  <div className="text-sm text-indigo-100">Success</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{stats.avgDeployTime}m</div>
                  <div className="text-sm text-indigo-100">Avg Deploy</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{formatNumber(stats.totalDownloads)}</div>
                  <div className="text-sm text-indigo-100">Downloads</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-6 gap-4">
              {[
                { icon: Plus, label: 'New Release', desc: 'Create release', color: 'indigo', onClick: () => setShowCreateDialog(true) },
                { icon: Rocket, label: 'Deploy', desc: 'Deploy now', color: 'green', onClick: () => {
                  const scheduledRelease = releases.find(r => r.status === 'scheduled' || r.status === 'draft')
                  if (scheduledRelease) openDeployDialog(scheduledRelease)
                  else toast.info('No releases to deploy', { description: 'Create a new release first' })
                }},
                { icon: Calendar, label: 'Schedule', desc: 'Plan release', color: 'purple', onClick: () => setShowCreateDialog(true) },
                { icon: RotateCcw, label: 'Rollback', desc: 'Revert changes', color: 'orange', onClick: () => {
                  const deployedRelease = releases.find(r => r.status === 'deployed')
                  if (deployedRelease) openRollbackDialog(deployedRelease)
                  else toast.info('No deployed releases', { description: 'There are no deployed releases to rollback' })
                }},
                { icon: Download, label: 'Assets', desc: 'Manage files', color: 'blue', onClick: () => setActiveTab('assets') },
                { icon: BarChart3, label: 'Analytics', desc: 'View stats', color: 'cyan', onClick: () => setActiveTab('analytics') }
              ].map(action => (
                <Card
                  key={action.label}
                  className="p-3 hover:shadow-lg transition-all cursor-pointer group text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur"
                  onClick={action.onClick}
                >
                  <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 mx-auto w-fit group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <p className="text-sm font-medium mt-2 text-gray-900 dark:text-white">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <Card className="lg:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Status</label>
                    <div className="space-y-1">
                      {['all', 'deployed', 'rolling', 'scheduled', 'draft', 'failed'].map(status => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                            selectedStatus === status
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Type</label>
                    <div className="space-y-1">
                      {['all', 'major', 'minor', 'patch', 'hotfix', 'prerelease'].map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                            selectedType === type
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Releases List */}
              <div className="lg:col-span-3 space-y-4">
                {filteredReleases.map(release => {
                  const StatusIcon = getStatusIcon(release.status)
                  return (
                    <Card
                      key={release.id}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => openReleaseDialog(release)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                              release.status === 'deployed' ? 'from-green-500 to-emerald-500' :
                              release.status === 'rolling' ? 'from-blue-500 to-cyan-500' :
                              release.status === 'scheduled' ? 'from-purple-500 to-pink-500' :
                              'from-gray-500 to-slate-500'
                            } flex items-center justify-center text-white font-mono font-bold text-lg`}>
                              {release.version.split('.')[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{release.name}</h3>
                                {release.isLatest && (
                                  <Badge className="bg-indigo-100 text-indigo-800">Latest</Badge>
                                )}
                                {release.isPrerelease && (
                                  <Badge className="bg-orange-100 text-orange-800">Pre-release</Badge>
                                )}
                                {release.isDraft && (
                                  <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <code className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{release.version}</code>
                                <span className="flex items-center gap-1">
                                  <GitBranch className="w-3 h-3" />
                                  {release.branch}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GitCommit className="w-3 h-3" />
                                  {release.commitHash}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(release.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {release.status}
                            </Badge>
                            <Badge className={getTypeColor(release.type)}>{release.type}</Badge>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{release.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Commits</div>
                            <div className="font-semibold">{release.commits}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Changes</div>
                            <div className="font-semibold flex items-center gap-1">
                              <span className="text-green-600">+{release.additions}</span>
                              <span className="text-red-600">-{release.deletions}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Files</div>
                            <div className="font-semibold">{release.filesChanged}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Downloads</div>
                            <div className="font-semibold">{formatNumber(release.downloads)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Deploy Time</div>
                            <div className="font-semibold">{release.deployTime ? `${release.deployTime}min` : 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Coverage</div>
                            <div className="font-semibold">{release.coverage}%</div>
                          </div>
                        </div>

                        {release.status === 'rolling' && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-500">Rollout Progress</span>
                              <span className="font-semibold">{release.coverage}%</span>
                            </div>
                            <Progress value={release.coverage} className="h-2" />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">{release.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-500">{release.author.name}</span>
                            </div>
                            <div className="flex -space-x-2">
                              {release.contributors.slice(0, 3).map(c => (
                                <Avatar key={c.id} className="w-6 h-6 border-2 border-white">
                                  <AvatarFallback className="text-xs">{c.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {release.contributors.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                                  +{release.contributors.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {release.status === 'scheduled' && (
                              <Button
                                size="sm"
                                className="bg-indigo-500 text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const dbRelease = releases.find(r => r.id === release.id)
                                  if (dbRelease) openDeployDialog(dbRelease)
                                }}
                              >
                                <Rocket className="w-3 h-3 mr-1" />
                                Deploy Now
                              </Button>
                            )}
                            {release.status === 'rolling' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.promise(
                                    new Promise(resolve => setTimeout(resolve, 1000)),
                                    { loading: 'Pausing deployment...', success: 'Deployment paused successfully!', error: 'Failed to pause deployment' }
                                  )
                                }}
                              >
                                <Pause className="w-3 h-3 mr-1" />
                                Pause
                              </Button>
                            )}
                            {release.status === 'deployed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const dbRelease = releases.find(r => r.id === release.id)
                                  if (dbRelease) openRollbackDialog(dbRelease)
                                }}
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Rollback
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                openReleaseDialog(release)
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* Deployments Tab */}
          <TabsContent value="deployments" className="mt-6 space-y-6">
            {/* Deployments Overview Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Deployment History</h2>
                  <p className="text-green-100">Track and monitor all deployment activities</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={handleExportReleases}>
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button>
                  <Button
                    className="bg-white text-green-600 hover:bg-green-50"
                    onClick={() => {
                      const scheduledRelease = releases.find(r => r.status === 'scheduled' || r.status === 'draft')
                      if (scheduledRelease) {
                        openDeployDialog(scheduledRelease)
                      } else {
                        toast.info('No releases to deploy', { description: 'Create a new release or schedule one first' })
                      }
                    }}
                  >
                    <Rocket className="w-4 h-4 mr-2" />Deploy Now
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{deployments.length > 0 ? deployments.length : 156}</div>
                  <div className="text-sm text-green-100">Total Deploys</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{deployments.length > 0 ? deployments.filter(d => d.status === 'success').length : 148}</div>
                  <div className="text-sm text-green-100">Successful</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{deployments.length > 0 ? deployments.filter(d => d.status === 'failed').length : 8}</div>
                  <div className="text-sm text-green-100">Failed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{deployments.length > 0 ? Math.round((deployments.filter(d => d.status === 'success').length / deployments.length) * 100) : 95}%</div>
                  <div className="text-sm text-green-100">Success Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{deployments.length > 0 && deployments.filter(d => d.duration_minutes).length > 0 ? (deployments.filter(d => d.duration_minutes).reduce((sum, d) => sum + (d.duration_minutes || 0), 0) / deployments.filter(d => d.duration_minutes).length).toFixed(1) : '3.8'}m</div>
                  <div className="text-sm text-green-100">Avg Time</div>
                </div>
              </div>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Deployment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReleases.flatMap(r => r.deployments).map(deployment => (
                    <div key={deployment.id} className="flex items-center gap-4 p-4 rounded-lg border dark:border-gray-700">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        deployment.status === 'success' ? 'bg-green-100 text-green-600' :
                        deployment.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                        deployment.status === 'failed' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {deployment.status === 'success' ? <CheckCircle className="w-5 h-5" /> :
                         deployment.status === 'in_progress' ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                         deployment.status === 'failed' ? <AlertCircle className="w-5 h-5" /> :
                         <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{deployment.environment}</span>
                          <Badge className={
                            deployment.status === 'success' ? 'bg-green-100 text-green-800' :
                            deployment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            deployment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>{deployment.status.replace('_', ' ')}</Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {deployment.servers} servers • {deployment.coverage}% coverage • {deployment.duration}min
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{formatDate(deployment.startedAt)}</div>
                        <div>by {deployment.deployedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commits Tab */}
          <TabsContent value="commits" className="mt-6 space-y-6">
            {/* Commits Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Commit Activity</h2>
                  <p className="text-blue-100">Track code changes and contributions</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => { /* TODO: View branches */ }}>
                    <GitBranch className="w-4 h-4 mr-2" />Branches
                  </Button>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => { /* TODO: Open pull requests */ }}>
                    <GitPullRequest className="w-4 h-4 mr-2" />Pull Requests
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{formatNumber(mockStats.totalCommits)}</div>
                  <div className="text-sm text-blue-100">Total Commits</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-blue-100">Contributors</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm text-blue-100">Branches</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-green-300">+45.6K</div>
                  <div className="text-sm text-blue-100">Additions</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-red-300">-12.3K</div>
                  <div className="text-sm text-blue-100">Deletions</div>
                </div>
              </div>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Recent Commits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCommits.map(commit => (
                    <div key={commit.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <Avatar>
                        <AvatarFallback>{commit.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{commit.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{commit.author.name}</span>
                          <code className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{commit.hash}</code>
                          <span className="text-green-600">+{commit.additions}</span>
                          <span className="text-red-600">-{commit.deletions}</span>
                          <span>{commit.files} files</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(commit.createdAt)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rollbacks Tab */}
          <TabsContent value="rollbacks" className="mt-6 space-y-6">
            {/* Rollbacks Overview Banner */}
            <div className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Rollback History</h2>
                  <p className="text-yellow-100">Track and manage release rollbacks</p>
                </div>
                <Button
                  className="bg-white text-yellow-600 hover:bg-yellow-50"
                  onClick={() => {
                    const deployedRelease = releases.find(r => r.status === 'deployed')
                    if (deployedRelease) {
                      openRollbackDialog(deployedRelease)
                    } else {
                      toast.info('No deployed releases', { description: 'There are no deployed releases to rollback' })
                    }
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />Initiate Rollback
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{rollbacks.length > 0 ? rollbacks.length : mockRollbacks.length}</div>
                  <div className="text-sm text-yellow-100">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{rollbacks.length > 0 ? rollbacks.filter(r => r.status === 'completed').length : mockRollbacks.filter(r => r.status === 'completed').length}</div>
                  <div className="text-sm text-yellow-100">Completed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">1.2m</div>
                  <div className="text-sm text-yellow-100">Avg Time</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-yellow-100">Success</div>
                </div>
              </div>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-yellow-500" />
                  Rollback History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mockRollbacks.length > 0 ? (
                  <div className="space-y-4">
                    {mockRollbacks.map(rollback => (
                      <div key={rollback.id} className="flex items-start gap-4 p-4 rounded-lg border dark:border-gray-700">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          rollback.status === 'completed' ? 'bg-green-100 text-green-600' :
                          rollback.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <RotateCcw className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{rollback.releaseVersion}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{rollback.targetVersion}</span>
                            <Badge className={
                              rollback.status === 'completed' ? 'bg-green-100 text-green-800' :
                              rollback.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }>{rollback.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{rollback.reason}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">{rollback.initiatedBy.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{rollback.initiatedBy.name}</span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{formatDate(rollback.startedAt)}</div>
                          {rollback.completedAt && (
                            <div className="text-green-600">Completed</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <RotateCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Rollbacks</h3>
                    <p className="text-gray-500">All deployments have been successful</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-6 space-y-6">
            {/* Assets Overview Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Release Assets</h2>
                  <p className="text-orange-100">Manage binaries, source code, and documentation</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => toast.promise(
                      new Promise(resolve => setTimeout(resolve, 1500)),
                      { loading: 'Preparing download...', success: 'All assets downloaded successfully!', error: 'Download failed' }
                    )}>
                    <Download className="w-4 h-4 mr-2" />Download All
                  </Button>
                  <Button className="bg-white text-orange-600 hover:bg-orange-50" onClick={() => { /* TODO: Upload asset */ }}>
                    <Plus className="w-4 h-4 mr-2" />Upload Asset
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-orange-100">Total Assets</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm text-orange-100">Binaries</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-sm text-orange-100">Source</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">256MB</div>
                  <div className="text-sm text-orange-100">Total Size</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{formatNumber(mockStats.totalDownloads)}</div>
                  <div className="text-sm text-orange-100">Downloads</div>
                </div>
              </div>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Release Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReleases.filter(r => r.assets.length > 0).map(release => (
                    <div key={release.id} className="p-4 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded text-sm">{release.version}</code>
                          <span className="text-gray-500">{release.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{release.assets.length} assets</span>
                      </div>
                      <div className="space-y-2">
                        {release.assets.map(asset => (
                          <div key={asset.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <Package className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{asset.name}</div>
                              <div className="text-xs text-gray-500">{formatSize(asset.size)} • {asset.contentType}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">{asset.downloads} downloads</span>
                              <Button size="sm" variant="outline" onClick={() => toast.promise(
                                  new Promise(resolve => setTimeout(resolve, 1000)),
                                  { loading: `Downloading ${asset.name}...`, success: 'Download started!', error: 'Download failed' }
                                )}>
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Release Analytics</h2>
                  <p className="text-purple-100">Insights into your release performance and trends</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={handleExportReleases}>
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button>
                  <Button className="bg-white text-purple-600 hover:bg-purple-50" onClick={() => {
                      toast.promise(
                        new Promise(resolve => setTimeout(resolve, 1000)),
                        { loading: 'Refreshing analytics...', success: 'Analytics data refreshed!', error: 'Refresh failed' }
                      )
                    }}>
                    <RefreshCw className="w-4 h-4 mr-2" />Refresh
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockStats.successRate}%</div>
                  <div className="text-sm text-purple-100">Success Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockStats.avgDeployTime}m</div>
                  <div className="text-sm text-purple-100">Avg Deploy</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockStats.releaseFrequency}</div>
                  <div className="text-sm text-purple-100">Per Week</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{formatNumber(mockStats.totalDownloads)}</div>
                  <div className="text-sm text-purple-100">Downloads</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">2.1</div>
                  <div className="text-sm text-purple-100">Rollbacks</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm text-purple-100">Uptime</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Release Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Success Rate</span>
                    <span className="font-semibold text-green-600">{mockStats.successRate}%</span>
                  </div>
                  <Progress value={mockStats.successRate} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Avg Deploy Time</span>
                    <span className="font-semibold">{mockStats.avgDeployTime} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Release Frequency</span>
                    <span className="font-semibold">{mockStats.releaseFrequency}/week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-500" />
                    Download Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockReleases.slice(0, 5).map(release => (
                    <div key={release.id} className="flex items-center gap-3">
                      <code className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{release.version}</code>
                      <div className="flex-1">
                        <Progress value={(release.downloads / 5000) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{formatNumber(release.downloads)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Alex Chen', commits: 45, avatar: '' },
                    { name: 'Sarah Miller', commits: 38, avatar: '' },
                    { name: 'Mike Johnson', commits: 29, avatar: '' },
                    { name: 'Emma Wilson', commits: 23, avatar: '' }
                  ].map((contributor, index) => (
                    <div key={contributor.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{contributor.name}</div>
                        <div className="text-xs text-gray-500">{contributor.commits} commits</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                        { id: 'deployment', icon: Rocket, label: 'Deployment', desc: 'Deploy config' },
                        { id: 'environments', icon: Server, label: 'Environments', desc: 'Target envs' },
                        { id: 'integrations', icon: GitBranch, label: 'Integrations', desc: 'Git & CI/CD' },
                        { id: 'notifications', icon: AlertCircle, label: 'Notifications', desc: 'Alert prefs' },
                        { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Power settings' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
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
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Project Name</label>
                          <Input defaultValue="My Application" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Repository URL</label>
                          <Input defaultValue="https://github.com/org/repo" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Auto-generate Release Notes</p>
                          <p className="text-sm text-gray-500">Generate changelog from commits</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Semantic Versioning</p>
                          <p className="text-sm text-gray-500">Enforce semver for version numbers</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Draft Releases</p>
                          <p className="text-sm text-gray-500">Create releases as drafts by default</p>
                        </div>
                        <input type="checkbox" className="w-4 h-4 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Deployment Settings */}
                {settingsTab === 'deployment' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-green-600" />
                        Deployment Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Blue-Green Deployment</p>
                          <p className="text-sm text-gray-500">Enable zero-downtime deployments</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Canary Releases</p>
                          <p className="text-sm text-gray-500">Gradual rollout to percentage of users</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Auto-Rollback</p>
                          <p className="text-sm text-gray-500">Automatically rollback on failure</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Require Approval</p>
                          <p className="text-sm text-gray-500">Require approval for production deploys</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Health Checks</p>
                          <p className="text-sm text-gray-500">Verify deployment health before completing</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Environments Settings */}
                {settingsTab === 'environments' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-purple-600" />
                        Environment Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {['Production', 'Staging', 'Development', 'Canary'].map(env => (
                        <div key={env} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${env === 'Production' ? 'bg-green-500' : env === 'Staging' ? 'bg-blue-500' : env === 'Canary' ? 'bg-orange-500' : 'bg-gray-500'}`} />
                            <div>
                              <p className="font-medium">{env}</p>
                              <p className="text-sm text-gray-500">{env === 'Production' ? '12 servers' : env === 'Staging' ? '4 servers' : '2 servers'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={env === 'Production' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {env === 'Production' ? 'Active' : 'Available'}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => { /* TODO: Configure environment */ }}>Configure</Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-orange-600" />
                        Integration Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">GitHub Integration</p>
                          <p className="text-sm text-gray-500">Sync releases with GitHub</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">CI/CD Pipeline</p>
                          <p className="text-sm text-gray-500">Trigger deployments from CI</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Docker Registry</p>
                          <p className="text-sm text-gray-500">Auto-push images on release</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">AWS/GCP/Azure</p>
                          <p className="text-sm text-gray-500">Cloud provider integration</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Kubernetes</p>
                          <p className="text-sm text-gray-500">Deploy to K8s clusters</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notification Settings */}
                {settingsTab === 'notifications' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Deploy Started</p>
                          <p className="text-sm text-gray-500">Notify when deployment begins</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Deploy Completed</p>
                          <p className="text-sm text-gray-500">Notify on successful deployment</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Deploy Failed</p>
                          <p className="text-sm text-gray-500">Alert on deployment failures</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Rollback Events</p>
                          <p className="text-sm text-gray-500">Notify on rollback triggers</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Slack Integration</p>
                          <p className="text-sm text-gray-500">Send notifications to Slack</p>
                        </div>
                        <input type="checkbox" className="w-4 h-4 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-red-600" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">API Access</p>
                          <p className="text-sm text-gray-500">Enable REST API for releases</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Webhooks</p>
                          <p className="text-sm text-gray-500">Send release events to webhooks</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Audit Logging</p>
                          <p className="text-sm text-gray-500">Log all release activities</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Retention Policy</p>
                          <p className="text-sm text-gray-500">Auto-archive old releases</p>
                        </div>
                        <input type="checkbox" className="w-4 h-4 rounded" />
                      </div>
                      <div className="pt-6 border-t dark:border-gray-700">
                        <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset All Settings</p>
                            <p className="text-sm text-red-600">This will reset all release configurations</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={() => {
                              if (confirm('Are you sure you want to reset all settings? This action cannot be undone.')) {
                                /* TODO: Implement reset settings functionality */
                              }
                            }}>
                            Reset
                          </Button>
                        </div>
                      </div>
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
              insights={mockReleasesAIInsights}
              title="Release Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockReleasesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockReleasesPredictions}
              title="Release Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockReleasesActivities}
            title="Release Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={releasesQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Release Detail Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedRelease && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                      selectedRelease.status === 'deployed' ? 'from-green-500 to-emerald-500' :
                      selectedRelease.status === 'rolling' ? 'from-blue-500 to-cyan-500' :
                      'from-gray-500 to-slate-500'
                    } flex items-center justify-center text-white font-mono font-bold text-lg`}>
                      {selectedRelease.version.split('.')[0]}
                    </div>
                    <div>
                      <DialogTitle className="text-xl flex items-center gap-2">
                        {selectedRelease.name}
                        {selectedRelease.isLatest && <Badge className="bg-indigo-100 text-indigo-800">Latest</Badge>}
                      </DialogTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <code className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{selectedRelease.version}</code>
                        <Badge className={getStatusColor(selectedRelease.status)}>{selectedRelease.status}</Badge>
                        <Badge className={getTypeColor(selectedRelease.type)}>{selectedRelease.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => { /* TODO: Show more options */ }}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[60vh] mt-4">
                <div className="space-y-6 pr-4">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedRelease.description}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Commits</div>
                      <div className="text-xl font-semibold">{selectedRelease.commits}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Changes</div>
                      <div className="text-xl font-semibold flex items-center gap-1">
                        <span className="text-green-600">+{selectedRelease.additions}</span>
                        <span className="text-red-600">-{selectedRelease.deletions}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Downloads</div>
                      <div className="text-xl font-semibold">{formatNumber(selectedRelease.downloads)}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Deploy Time</div>
                      <div className="text-xl font-semibold">{selectedRelease.deployTime ? `${selectedRelease.deployTime}min` : 'N/A'}</div>
                    </div>
                  </div>

                  {/* Changelog */}
                  <div>
                    <h3 className="font-semibold mb-2">Changelog</h3>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{selectedRelease.changelog}</pre>
                    </div>
                  </div>

                  {/* Contributors */}
                  <div>
                    <h3 className="font-semibold mb-2">Contributors ({selectedRelease.contributors.length})</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedRelease.contributors.map(c => (
                        <div key={c.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{c.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{c.name}</span>
                          <Badge variant="outline" className="text-xs">{c.commits} commits</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assets */}
                  {selectedRelease.assets.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Assets ({selectedRelease.assets.length})</h3>
                      <div className="space-y-2">
                        {selectedRelease.assets.map(asset => (
                          <div key={asset.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <Package className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{asset.name}</div>
                              <div className="text-xs text-gray-500">{formatSize(asset.size)}</div>
                            </div>
                            <span className="text-sm text-gray-500">{asset.downloads} downloads</span>
                            <Button size="sm" variant="outline" onClick={() => toast.promise(
                                new Promise(resolve => setTimeout(resolve, 1000)),
                                { loading: `Downloading ${asset.name}...`, success: 'Download started!', error: 'Download failed' }
                              )}>
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div>
                    <h3 className="font-semibold mb-2">Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tag</span>
                        <code className="font-mono">{selectedRelease.tagName}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Branch</span>
                        <span>{selectedRelease.branch}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Commit</span>
                        <code className="font-mono">{selectedRelease.commitHash}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Environment</span>
                        <span className="capitalize">{selectedRelease.environment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created</span>
                        <span>{formatDate(selectedRelease.createdAt)}</span>
                      </div>
                      {selectedRelease.deployedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Deployed</span>
                          <span>{formatDate(selectedRelease.deployedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/releases/${selectedRelease.id}`)
                      toast.success('Link copied to clipboard')
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      /* TODO: Implement view on Git functionality - open repository URL in new tab */
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Git
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedRelease.status === 'deployed' && (
                    <Button
                      variant="outline"
                      className="text-yellow-600"
                      onClick={() => {
                        const dbRelease = releases.find(r => r.id === selectedRelease.id)
                        if (dbRelease) {
                          setShowReleaseDialog(false)
                          openRollbackDialog(dbRelease)
                        }
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Rollback
                    </Button>
                  )}
                  <Button
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                    onClick={() => {
                      const dbRelease = releases.find(r => r.id === selectedRelease.id)
                      if (dbRelease) {
                        setShowReleaseDialog(false)
                        openEditDialog(dbRelease)
                      }
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Release
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Release Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Create New Release
            </DialogTitle>
            <DialogDescription>
              Create a new release for your project. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  placeholder="v1.0.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_name">Release Name *</Label>
                <Input
                  id="release_name"
                  placeholder="Aurora Release"
                  value={formData.release_name}
                  onChange={(e) => setFormData({ ...formData, release_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this release..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="release_type">Release Type</Label>
                <Select
                  value={formData.release_type}
                  onValueChange={(value: any) => setFormData({ ...formData, release_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="patch">Patch</SelectItem>
                    <SelectItem value="hotfix">Hotfix</SelectItem>
                    <SelectItem value="prerelease">Pre-release</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value: any) => setFormData({ ...formData, environment: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="canary">Canary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="git_branch">Git Branch</Label>
                <Input
                  id="git_branch"
                  placeholder="main"
                  value={formData.git_branch}
                  onChange={(e) => setFormData({ ...formData, git_branch: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="git_tag">Git Tag</Label>
                <Input
                  id="git_tag"
                  placeholder="v1.0.0"
                  value={formData.git_tag}
                  onChange={(e) => setFormData({ ...formData, git_tag: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="changelog">Changelog</Label>
              <Textarea
                id="changelog"
                placeholder="## What's Changed&#10;- Feature 1&#10;- Bug fix 2"
                className="min-h-[100px]"
                value={formData.changelog}
                onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_for">Schedule Release (Optional)</Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                value={formData.scheduled_for}
                onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_draft}
                  onChange={(e) => setFormData({ ...formData, is_draft: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Save as draft</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_prerelease}
                  onChange={(e) => setFormData({ ...formData, is_prerelease: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Pre-release</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRelease}
              disabled={isSaving || !formData.version || !formData.release_name}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Release
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Release Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-indigo-600" />
              Edit Release
            </DialogTitle>
            <DialogDescription>
              Update the release details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_version">Version *</Label>
                <Input
                  id="edit_version"
                  placeholder="v1.0.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_release_name">Release Name *</Label>
                <Input
                  id="edit_release_name"
                  placeholder="Aurora Release"
                  value={formData.release_name}
                  onChange={(e) => setFormData({ ...formData, release_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                placeholder="Describe this release..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_release_type">Release Type</Label>
                <Select
                  value={formData.release_type}
                  onValueChange={(value: any) => setFormData({ ...formData, release_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="patch">Patch</SelectItem>
                    <SelectItem value="hotfix">Hotfix</SelectItem>
                    <SelectItem value="prerelease">Pre-release</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value: any) => setFormData({ ...formData, environment: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="canary">Canary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_changelog">Changelog</Label>
              <Textarea
                id="edit_changelog"
                placeholder="## What's Changed&#10;- Feature 1&#10;- Bug fix 2"
                className="min-h-[100px]"
                value={formData.changelog}
                onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRelease}
              disabled={isSaving || !formData.version || !formData.release_name}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Release Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Release
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this release? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {releaseToDelete && (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="font-medium">{releaseToDelete.release_name}</p>
                <p className="text-sm text-gray-500">{releaseToDelete.version}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRelease}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Release
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deploy Release Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-green-600" />
              Deploy Release
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deploy this release?
            </DialogDescription>
          </DialogHeader>
          {releaseToDeploy && (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="font-medium">{releaseToDeploy.release_name}</p>
                <p className="text-sm text-gray-500">{releaseToDeploy.version}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{releaseToDeploy.environment}</Badge>
                  <Badge variant="outline">{releaseToDeploy.release_type}</Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeployDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeployRelease}
              disabled={isDeploying}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Deployment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rollback Release Dialog */}
      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <RotateCcw className="w-5 h-5" />
              Rollback Release
            </DialogTitle>
            <DialogDescription>
              Rollback this release to a previous version.
            </DialogDescription>
          </DialogHeader>
          {releaseToRollback && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="font-medium">Current: {releaseToRollback.release_name}</p>
                <p className="text-sm text-gray-500">{releaseToRollback.version}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_version">Target Version *</Label>
                <Select value={targetVersion} onValueChange={setTargetVersion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target version" />
                  </SelectTrigger>
                  <SelectContent>
                    {releases
                      .filter(r => r.id !== releaseToRollback.id && r.status === 'deployed')
                      .map(r => (
                        <SelectItem key={r.id} value={r.version}>
                          {r.version} - {r.release_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollback_reason">Reason *</Label>
                <Textarea
                  id="rollback_reason"
                  placeholder="Why are you rolling back this release?"
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRollbackRelease}
              disabled={isRollingBack || !rollbackReason || !targetVersion}
              className="bg-yellow-600 text-white hover:bg-yellow-700"
            >
              {isRollingBack ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rolling back...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Initiate Rollback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Changelog Dialog */}
      <Dialog open={showExportChangelogDialog} onOpenChange={setShowExportChangelogDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              Export Changelog
            </DialogTitle>
            <DialogDescription>
              Export your release changelog in your preferred format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="markdown">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown (.md)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                  <SelectItem value="html">HTML (.html)</SelectItem>
                  <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Release Range</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Releases</SelectItem>
                  <SelectItem value="latest">Latest Release Only</SelectItem>
                  <SelectItem value="major">Major Releases Only</SelectItem>
                  <SelectItem value="last10">Last 10 Releases</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="includeCommits" className="rounded" defaultChecked />
              <Label htmlFor="includeCommits" className="text-sm font-normal">Include commit details</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="includeContributors" className="rounded" defaultChecked />
              <Label htmlFor="includeContributors" className="text-sm font-normal">Include contributors</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportChangelogDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                /* TODO: Implement changelog export functionality - generate and download markdown file */
                setShowExportChangelogDialog(false)
              }}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
