'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Code,
  FolderGit2,
  Star,
  Eye,
  Copy,
  Download,
  Upload,
  Settings,
  Plus,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Lock,
  Unlock,
  Tag,
  Archive,
  RotateCcw,
  Loader2,
  FileCode,
  Folder,
  ChevronRight,
  Activity,
  TrendingUp
} from 'lucide-react'

// Types
interface Repository {
  id: string
  name: string
  description: string
  language: string
  visibility: 'public' | 'private' | 'internal'
  defaultBranch: string
  stars: number
  forks: number
  watchers: number
  openIssues: number
  openPRs: number
  lastCommit: {
    message: string
    author: string
    date: string
    hash: string
  }
  size: number
  createdAt: string
  updatedAt: string
  isArchived: boolean
  topics: string[]
}

interface Branch {
  id: string
  name: string
  isDefault: boolean
  isProtected: boolean
  lastCommit: {
    message: string
    author: string
    date: string
    hash: string
  }
  aheadBehind: {
    ahead: number
    behind: number
  }
}

interface PullRequest {
  id: string
  number: number
  title: string
  description: string
  status: 'open' | 'merged' | 'closed' | 'draft'
  author: {
    name: string
    avatar: string
  }
  sourceBranch: string
  targetBranch: string
  commits: number
  additions: number
  deletions: number
  reviewers: {
    name: string
    avatar: string
    status: 'approved' | 'changes_requested' | 'pending'
  }[]
  createdAt: string
  updatedAt: string
}

interface Commit {
  id: string
  hash: string
  message: string
  author: {
    name: string
    avatar: string
    email: string
  }
  additions: number
  deletions: number
  filesChanged: number
  date: string
  verified: boolean
}

// Mock data
const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'freeflow-app',
    description: 'Main application repository for FreeFlow platform',
    language: 'TypeScript',
    visibility: 'private',
    defaultBranch: 'main',
    stars: 234,
    forks: 45,
    watchers: 89,
    openIssues: 12,
    openPRs: 5,
    lastCommit: {
      message: 'feat: Add new dashboard components',
      author: 'Alex Chen',
      date: '2024-12-24T10:30:00Z',
      hash: 'abc123f'
    },
    size: 45678,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-12-24T10:30:00Z',
    isArchived: false,
    topics: ['nextjs', 'typescript', 'react', 'tailwindcss']
  },
  {
    id: '2',
    name: 'freeflow-api',
    description: 'Backend API services for FreeFlow',
    language: 'Go',
    visibility: 'private',
    defaultBranch: 'main',
    stars: 156,
    forks: 23,
    watchers: 67,
    openIssues: 8,
    openPRs: 3,
    lastCommit: {
      message: 'fix: Resolve authentication edge case',
      author: 'Sarah Miller',
      date: '2024-12-23T16:45:00Z',
      hash: 'def456g'
    },
    size: 23456,
    createdAt: '2023-02-20T00:00:00Z',
    updatedAt: '2024-12-23T16:45:00Z',
    isArchived: false,
    topics: ['golang', 'api', 'microservices']
  },
  {
    id: '3',
    name: 'freeflow-docs',
    description: 'Documentation and guides for FreeFlow platform',
    language: 'MDX',
    visibility: 'public',
    defaultBranch: 'main',
    stars: 89,
    forks: 12,
    watchers: 34,
    openIssues: 3,
    openPRs: 2,
    lastCommit: {
      message: 'docs: Update API reference',
      author: 'Mike Johnson',
      date: '2024-12-22T14:20:00Z',
      hash: 'ghi789h'
    },
    size: 8765,
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2024-12-22T14:20:00Z',
    isArchived: false,
    topics: ['documentation', 'mdx', 'nextra']
  },
  {
    id: '4',
    name: 'freeflow-mobile',
    description: 'Mobile applications for iOS and Android',
    language: 'Dart',
    visibility: 'private',
    defaultBranch: 'develop',
    stars: 67,
    forks: 8,
    watchers: 23,
    openIssues: 15,
    openPRs: 4,
    lastCommit: {
      message: 'feat: Implement push notifications',
      author: 'Emma Wilson',
      date: '2024-12-24T09:00:00Z',
      hash: 'jkl012i'
    },
    size: 34567,
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-12-24T09:00:00Z',
    isArchived: false,
    topics: ['flutter', 'dart', 'mobile', 'ios', 'android']
  },
  {
    id: '5',
    name: 'freeflow-legacy',
    description: 'Legacy codebase (archived)',
    language: 'JavaScript',
    visibility: 'internal',
    defaultBranch: 'master',
    stars: 12,
    forks: 2,
    watchers: 5,
    openIssues: 0,
    openPRs: 0,
    lastCommit: {
      message: 'chore: Archive repository',
      author: 'Alex Chen',
      date: '2023-12-01T00:00:00Z',
      hash: 'mno345j'
    },
    size: 12345,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2023-12-01T00:00:00Z',
    isArchived: true,
    topics: ['legacy', 'javascript']
  }
]

const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'main',
    isDefault: true,
    isProtected: true,
    lastCommit: {
      message: 'feat: Add new dashboard components',
      author: 'Alex Chen',
      date: '2024-12-24T10:30:00Z',
      hash: 'abc123f'
    },
    aheadBehind: { ahead: 0, behind: 0 }
  },
  {
    id: '2',
    name: 'develop',
    isDefault: false,
    isProtected: true,
    lastCommit: {
      message: 'Merge feature/new-ui into develop',
      author: 'Sarah Miller',
      date: '2024-12-24T08:00:00Z',
      hash: 'bcd234g'
    },
    aheadBehind: { ahead: 15, behind: 0 }
  },
  {
    id: '3',
    name: 'feature/user-auth',
    isDefault: false,
    isProtected: false,
    lastCommit: {
      message: 'feat: Implement OAuth2 flow',
      author: 'Mike Johnson',
      date: '2024-12-23T16:00:00Z',
      hash: 'cde345h'
    },
    aheadBehind: { ahead: 8, behind: 2 }
  },
  {
    id: '4',
    name: 'feature/api-v2',
    isDefault: false,
    isProtected: false,
    lastCommit: {
      message: 'feat: Add new API endpoints',
      author: 'Emma Wilson',
      date: '2024-12-22T14:00:00Z',
      hash: 'def456i'
    },
    aheadBehind: { ahead: 23, behind: 5 }
  },
  {
    id: '5',
    name: 'hotfix/security-patch',
    isDefault: false,
    isProtected: false,
    lastCommit: {
      message: 'fix: Patch XSS vulnerability',
      author: 'Alex Chen',
      date: '2024-12-24T11:00:00Z',
      hash: 'efg567j'
    },
    aheadBehind: { ahead: 2, behind: 0 }
  }
]

const mockPullRequests: PullRequest[] = [
  {
    id: '1',
    number: 234,
    title: 'feat: Implement new authentication flow',
    description: 'This PR implements the new OAuth2 authentication flow with support for multiple providers.',
    status: 'open',
    author: { name: 'Mike Johnson', avatar: '' },
    sourceBranch: 'feature/user-auth',
    targetBranch: 'develop',
    commits: 8,
    additions: 456,
    deletions: 123,
    reviewers: [
      { name: 'Alex Chen', avatar: '', status: 'approved' },
      { name: 'Sarah Miller', avatar: '', status: 'pending' }
    ],
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-24T09:00:00Z'
  },
  {
    id: '2',
    number: 233,
    title: 'fix: Resolve memory leak in worker process',
    description: 'Fixes the memory leak issue reported in #230',
    status: 'merged',
    author: { name: 'Sarah Miller', avatar: '' },
    sourceBranch: 'fix/memory-leak',
    targetBranch: 'main',
    commits: 3,
    additions: 45,
    deletions: 89,
    reviewers: [
      { name: 'Alex Chen', avatar: '', status: 'approved' }
    ],
    createdAt: '2024-12-18T14:00:00Z',
    updatedAt: '2024-12-19T16:00:00Z'
  },
  {
    id: '3',
    number: 235,
    title: 'feat: Add dark mode support',
    description: 'Implements dark mode across all UI components',
    status: 'draft',
    author: { name: 'Emma Wilson', avatar: '' },
    sourceBranch: 'feature/dark-mode',
    targetBranch: 'develop',
    commits: 12,
    additions: 789,
    deletions: 234,
    reviewers: [],
    createdAt: '2024-12-22T11:00:00Z',
    updatedAt: '2024-12-24T08:00:00Z'
  },
  {
    id: '4',
    number: 236,
    title: 'chore: Update dependencies',
    description: 'Updates all npm dependencies to their latest versions',
    status: 'open',
    author: { name: 'Alex Chen', avatar: '' },
    sourceBranch: 'chore/update-deps',
    targetBranch: 'develop',
    commits: 1,
    additions: 567,
    deletions: 345,
    reviewers: [
      { name: 'Mike Johnson', avatar: '', status: 'changes_requested' }
    ],
    createdAt: '2024-12-23T09:00:00Z',
    updatedAt: '2024-12-23T15:00:00Z'
  }
]

const mockCommits: Commit[] = [
  {
    id: '1',
    hash: 'abc123f',
    message: 'feat: Add new dashboard components',
    author: { name: 'Alex Chen', avatar: '', email: 'alex@freeflow.com' },
    additions: 456,
    deletions: 123,
    filesChanged: 15,
    date: '2024-12-24T10:30:00Z',
    verified: true
  },
  {
    id: '2',
    hash: 'bcd234g',
    message: 'fix: Resolve memory leak in worker process',
    author: { name: 'Sarah Miller', avatar: '', email: 'sarah@freeflow.com' },
    additions: 45,
    deletions: 89,
    filesChanged: 3,
    date: '2024-12-24T08:00:00Z',
    verified: true
  },
  {
    id: '3',
    hash: 'cde345h',
    message: 'chore: Update dependencies to latest versions',
    author: { name: 'Mike Johnson', avatar: '', email: 'mike@freeflow.com' },
    additions: 567,
    deletions: 345,
    filesChanged: 5,
    date: '2024-12-23T16:00:00Z',
    verified: false
  },
  {
    id: '4',
    hash: 'def456i',
    message: 'docs: Update README with new installation instructions',
    author: { name: 'Emma Wilson', avatar: '', email: 'emma@freeflow.com' },
    additions: 89,
    deletions: 23,
    filesChanged: 2,
    date: '2024-12-23T14:00:00Z',
    verified: true
  },
  {
    id: '5',
    hash: 'efg567j',
    message: 'feat: Implement user profile page',
    author: { name: 'Alex Chen', avatar: '', email: 'alex@freeflow.com' },
    additions: 234,
    deletions: 45,
    filesChanged: 8,
    date: '2024-12-22T11:00:00Z',
    verified: true
  }
]

// Helper functions
const getLanguageColor = (language: string) => {
  const colors: Record<string, string> = {
    TypeScript: 'bg-blue-500',
    JavaScript: 'bg-yellow-500',
    Go: 'bg-cyan-500',
    Python: 'bg-green-500',
    Rust: 'bg-orange-500',
    MDX: 'bg-purple-500',
    Dart: 'bg-teal-500'
  }
  return colors[language] || 'bg-gray-500'
}

const getVisibilityBadge = (visibility: string) => {
  switch (visibility) {
    case 'public':
      return <Badge variant="outline" className="text-green-600 border-green-600"><Unlock className="w-3 h-3 mr-1" />Public</Badge>
    case 'private':
      return <Badge variant="outline" className="text-red-600 border-red-600"><Lock className="w-3 h-3 mr-1" />Private</Badge>
    case 'internal':
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Users className="w-3 h-3 mr-1" />Internal</Badge>
    default:
      return null
  }
}

const getPRStatusBadge = (status: string) => {
  switch (status) {
    case 'open':
      return <Badge className="bg-green-500 text-white">Open</Badge>
    case 'merged':
      return <Badge className="bg-purple-500 text-white">Merged</Badge>
    case 'closed':
      return <Badge className="bg-red-500 text-white">Closed</Badge>
    case 'draft':
      return <Badge variant="outline">Draft</Badge>
    default:
      return null
  }
}

const formatFileSize = (kb: number) => {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function CodeRepositoryClient() {
  // State for dialogs
  const [createRepoDialogOpen, setCreateRepoDialogOpen] = useState(false)
  const [cloneRepoDialogOpen, setCloneRepoDialogOpen] = useState(false)
  const [importRepoDialogOpen, setImportRepoDialogOpen] = useState(false)
  const [repoSettingsDialogOpen, setRepoSettingsDialogOpen] = useState(false)
  const [createBranchDialogOpen, setCreateBranchDialogOpen] = useState(false)
  const [deleteBranchDialogOpen, setDeleteBranchDialogOpen] = useState(false)
  const [createPRDialogOpen, setCreatePRDialogOpen] = useState(false)
  const [mergePRDialogOpen, setMergePRDialogOpen] = useState(false)
  const [viewCommitDialogOpen, setViewCommitDialogOpen] = useState(false)
  const [archiveRepoDialogOpen, setArchiveRepoDialogOpen] = useState(false)
  const [deleteRepoDialogOpen, setDeleteRepoDialogOpen] = useState(false)
  const [branchProtectionDialogOpen, setBranchProtectionDialogOpen] = useState(false)
  const [addReviewerDialogOpen, setAddReviewerDialogOpen] = useState(false)
  const [viewFilesDialogOpen, setViewFilesDialogOpen] = useState(false)
  const [compareDialogOpen, setCompareDialogOpen] = useState(false)

  // State for data
  const [repositories, setRepositories] = useState<Repository[]>(mockRepositories)
  const [branches, setBranches] = useState<Branch[]>(mockBranches)
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(mockPullRequests)
  const [commits, setCommits] = useState<Commit[]>(mockCommits)
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(mockRepositories[0])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null)
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null)

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('repositories')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')
  const [prStatusFilter, setPRStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [newRepoName, setNewRepoName] = useState('')
  const [newRepoDescription, setNewRepoDescription] = useState('')
  const [newRepoVisibility, setNewRepoVisibility] = useState<string>('private')
  const [newBranchName, setNewBranchName] = useState('')
  const [newBranchSource, setNewBranchSource] = useState('main')
  const [prTitle, setPRTitle] = useState('')
  const [prDescription, setPRDescription] = useState('')
  const [prSourceBranch, setPRSourceBranch] = useState('')
  const [prTargetBranch, setPRTargetBranch] = useState('main')
  const [cloneUrl, setCloneUrl] = useState('')
  const [importUrl, setImportUrl] = useState('')

  // Filtered data
  const filteredRepositories = useMemo(() => {
    return repositories.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesVisibility = visibilityFilter === 'all' || repo.visibility === visibilityFilter
      return matchesSearch && matchesVisibility
    })
  }, [repositories, searchQuery, visibilityFilter])

  const filteredPullRequests = useMemo(() => {
    return pullRequests.filter(pr => {
      const matchesSearch = pr.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = prStatusFilter === 'all' || pr.status === prStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [pullRequests, searchQuery, prStatusFilter])

  // Handler functions
  const handleCreateRepository = () => {
    if (!newRepoName.trim()) {
      toast.error('Repository name is required')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      const newRepo: Repository = {
        id: String(repositories.length + 1),
        name: newRepoName,
        description: newRepoDescription,
        language: 'TypeScript',
        visibility: newRepoVisibility as 'public' | 'private' | 'internal',
        defaultBranch: 'main',
        stars: 0,
        forks: 0,
        watchers: 0,
        openIssues: 0,
        openPRs: 0,
        lastCommit: {
          message: 'Initial commit',
          author: 'You',
          date: new Date().toISOString(),
          hash: 'init001'
        },
        size: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
        topics: []
      }
      setRepositories([newRepo, ...repositories])
      setCreateRepoDialogOpen(false)
      setNewRepoName('')
      setNewRepoDescription('')
      setNewRepoVisibility('private')
      setIsLoading(false)
      toast.success(`Repository "${newRepoName}" created successfully`)
    }, 1000)
  }

  const handleCloneRepository = () => {
    if (selectedRepo) {
      const url = `git@github.com:freeflow/${selectedRepo.name}.git`
      navigator.clipboard.writeText(url)
      toast.success('Clone URL copied to clipboard')
      setCloneRepoDialogOpen(false)
    }
  }

  const handleImportRepository = () => {
    if (!importUrl.trim()) {
      toast.error('Repository URL is required')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      toast.success('Repository import started')
      setImportRepoDialogOpen(false)
      setImportUrl('')
      setIsLoading(false)
    }, 1500)
  }

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) {
      toast.error('Branch name is required')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      const newBranch: Branch = {
        id: String(branches.length + 1),
        name: newBranchName,
        isDefault: false,
        isProtected: false,
        lastCommit: {
          message: 'Branch created',
          author: 'You',
          date: new Date().toISOString(),
          hash: 'new' + String(branches.length + 1)
        },
        aheadBehind: { ahead: 0, behind: 0 }
      }
      setBranches([...branches, newBranch])
      setCreateBranchDialogOpen(false)
      setNewBranchName('')
      setIsLoading(false)
      toast.success(`Branch "${newBranchName}" created from ${newBranchSource}`)
    }, 1000)
  }

  const handleDeleteBranch = () => {
    if (selectedBranch) {
      if (selectedBranch.isProtected) {
        toast.error('Cannot delete a protected branch')
        return
      }
      setIsLoading(true)
      setTimeout(() => {
        setBranches(branches.filter(b => b.id !== selectedBranch.id))
        setDeleteBranchDialogOpen(false)
        setSelectedBranch(null)
        setIsLoading(false)
        toast.success(`Branch "${selectedBranch.name}" deleted`)
      }, 1000)
    }
  }

  const handleCreatePullRequest = () => {
    if (!prTitle.trim()) {
      toast.error('Pull request title is required')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      const newPR: PullRequest = {
        id: String(pullRequests.length + 1),
        number: 237,
        title: prTitle,
        description: prDescription,
        status: 'open',
        author: { name: 'You', avatar: '' },
        sourceBranch: prSourceBranch || 'feature/new-feature',
        targetBranch: prTargetBranch,
        commits: 1,
        additions: 0,
        deletions: 0,
        reviewers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setPullRequests([newPR, ...pullRequests])
      setCreatePRDialogOpen(false)
      setPRTitle('')
      setPRDescription('')
      setPRSourceBranch('')
      setIsLoading(false)
      toast.success(`Pull request #${newPR.number} created`)
    }, 1000)
  }

  const handleMergePullRequest = () => {
    if (selectedPR) {
      setIsLoading(true)
      setTimeout(() => {
        setPullRequests(pullRequests.map(pr =>
          pr.id === selectedPR.id ? { ...pr, status: 'merged' as const } : pr
        ))
        setMergePRDialogOpen(false)
        setIsLoading(false)
        toast.success(`Pull request #${selectedPR.number} merged successfully`)
      }, 1500)
    }
  }

  const handleArchiveRepository = () => {
    if (selectedRepo) {
      setIsLoading(true)
      setTimeout(() => {
        setRepositories(repositories.map(r =>
          r.id === selectedRepo.id ? { ...r, isArchived: true } : r
        ))
        setArchiveRepoDialogOpen(false)
        setIsLoading(false)
        toast.success(`Repository "${selectedRepo.name}" archived`)
      }, 1000)
    }
  }

  const handleDeleteRepository = () => {
    if (selectedRepo) {
      setIsLoading(true)
      setTimeout(() => {
        setRepositories(repositories.filter(r => r.id !== selectedRepo.id))
        setDeleteRepoDialogOpen(false)
        setSelectedRepo(null)
        setIsLoading(false)
        toast.success(`Repository deleted`)
      }, 1000)
    }
  }

  const handleToggleBranchProtection = () => {
    if (selectedBranch) {
      setIsLoading(true)
      setTimeout(() => {
        setBranches(branches.map(b =>
          b.id === selectedBranch.id ? { ...b, isProtected: !b.isProtected } : b
        ))
        setBranchProtectionDialogOpen(false)
        setIsLoading(false)
        toast.success(`Branch protection ${selectedBranch.isProtected ? 'disabled' : 'enabled'} for "${selectedBranch.name}"`)
      }, 1000)
    }
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Data refreshed')
    }, 1000)
  }

  const handleCopyCommitHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    toast.success('Commit hash copied to clipboard')
  }

  const handleDownloadSource = () => {
    if (selectedRepo) {
      toast.loading('Preparing download...', { id: 'download-source' })
      setTimeout(() => {
        toast.success('Download started!', { id: 'download-source', description: `${selectedRepo.name}.zip is downloading` })
      }, 1500)
    }
  }

  const handleStarRepository = (repo: Repository) => {
    setRepositories(repositories.map(r =>
      r.id === repo.id ? { ...r, stars: r.stars + 1 } : r
    ))
    toast.success(`Starred ${repo.name}`)
  }

  const handleForkRepository = (repo: Repository) => {
    toast.loading('Forking repository...', { id: 'fork-repo' })
    setTimeout(() => {
      setRepositories(prev => prev.map(r =>
        r.id === repo.id ? { ...r, forks: r.forks + 1 } : r
      ))
      toast.success('Repository forked!', { id: 'fork-repo', description: `${repo.name} has been forked to your account` })
    }, 1500)
  }

  const handleWatchRepository = (repo: Repository) => {
    setRepositories(repositories.map(r =>
      r.id === repo.id ? { ...r, watchers: r.watchers + 1 } : r
    ))
    toast.success(`Now watching ${repo.name}`)
  }

  const handleAddReviewer = () => {
    if (selectedPR) {
      toast.loading('Adding reviewer...', { id: 'add-reviewer' })
      setTimeout(() => {
        toast.success('Reviewer added!', { id: 'add-reviewer', description: `Reviewer has been added to PR #${selectedPR.number}` })
        setAddReviewerDialogOpen(false)
      }, 1000)
    }
  }

  const handleApprovePR = (pr: PullRequest) => {
    toast.loading('Submitting approval...', { id: 'approve-pr' })
    setTimeout(() => {
      setPullRequests(pullRequests.map(p =>
        p.id === pr.id ? {
          ...p,
          reviewers: p.reviewers.map(r => ({ ...r, status: 'approved' as const }))
        } : p
      ))
      toast.success('PR approved!', { id: 'approve-pr', description: `You approved PR #${pr.number}` })
    }, 1000)
  }

  const handleRequestChanges = (pr: PullRequest) => {
    toast.loading('Submitting review...', { id: 'request-changes' })
    setTimeout(() => {
      setPullRequests(pullRequests.map(p =>
        p.id === pr.id ? {
          ...p,
          reviewers: p.reviewers.map(r => ({ ...r, status: 'changes_requested' as const }))
        } : p
      ))
      toast.success('Changes requested', { id: 'request-changes', description: `Review submitted for PR #${pr.number}` })
    }, 1000)
  }

  const handleClosePR = (pr: PullRequest) => {
    setPullRequests(pullRequests.map(p =>
      p.id === pr.id ? { ...p, status: 'closed' as const } : p
    ))
    toast.success(`PR #${pr.number} closed`)
  }

  const handleRevertCommit = (commit: Commit) => {
    if (confirm(`Are you sure you want to revert commit ${commit.hash.substring(0, 7)}? This will create a new commit that undoes the changes.`)) {
      toast.loading('Reverting commit...', { id: 'revert-commit' })
      setTimeout(() => {
        toast.success('Commit reverted!', { id: 'revert-commit', description: `Created revert commit for ${commit.hash.substring(0, 7)}` })
      }, 1500)
    }
  }

  const handleCherryPick = (commit: Commit) => {
    toast.loading('Cherry-picking commit...', { id: 'cherry-pick' })
    setTimeout(() => {
      toast.success('Cherry-pick successful!', { id: 'cherry-pick', description: `Commit ${commit.hash.substring(0, 7)} applied to current branch` })
    }, 1500)
  }

  const handleCompare = () => {
    toast.loading('Comparing branches...', { id: 'compare' })
    setTimeout(() => {
      toast.success('Comparison complete!', { id: 'compare', description: 'Branch diff is ready to view' })
      setCompareDialogOpen(false)
    }, 1000)
  }

  // Stats
  const stats = useMemo(() => ({
    totalRepos: repositories.length,
    privateRepos: repositories.filter(r => r.visibility === 'private').length,
    publicRepos: repositories.filter(r => r.visibility === 'public').length,
    openPRs: pullRequests.filter(pr => pr.status === 'open').length,
    totalCommits: commits.length,
    totalBranches: branches.length
  }), [repositories, pullRequests, commits, branches])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Code Repository</h1>
          <p className="text-muted-foreground">Manage your code, branches, and pull requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setImportRepoDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setCreateRepoDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Repository
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.totalRepos}</p>
                <p className="text-xs text-muted-foreground">Repositories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.privateRepos}</p>
                <p className="text-xs text-muted-foreground">Private</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.publicRepos}</p>
                <p className="text-xs text-muted-foreground">Public</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.openPRs}</p>
                <p className="text-xs text-muted-foreground">Open PRs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.totalBranches}</p>
                <p className="text-xs text-muted-foreground">Branches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCommits}</p>
                <p className="text-xs text-muted-foreground">Commits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="repositories">
              <FolderGit2 className="w-4 h-4 mr-2" />
              Repositories
            </TabsTrigger>
            <TabsTrigger value="branches">
              <GitBranch className="w-4 h-4 mr-2" />
              Branches
            </TabsTrigger>
            <TabsTrigger value="pull-requests">
              <GitPullRequest className="w-4 h-4 mr-2" />
              Pull Requests
            </TabsTrigger>
            <TabsTrigger value="commits">
              <GitCommit className="w-4 h-4 mr-2" />
              Commits
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => {
              toast.info('Filter options', { description: 'Filter by visibility, language, or status' })
            }}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Repositories Tab */}
        <TabsContent value="repositories" className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4">
            {filteredRepositories.map((repo) => (
              <Card key={repo.id} className={repo.isArchived ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-5 h-5 text-muted-foreground" />
                        <Button
                          variant="link"
                          className="p-0 h-auto text-lg font-semibold"
                          onClick={() => {
                            setSelectedRepo(repo)
                            setViewFilesDialogOpen(true)
                          }}
                        >
                          {repo.name}
                        </Button>
                        {getVisibilityBadge(repo.visibility)}
                        {repo.isArchived && (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Archive className="w-3 h-3 mr-1" />
                            Archived
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                          <span className="text-sm">{repo.language}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-sm"
                          onClick={() => handleStarRepository(repo)}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          {repo.stars}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-sm"
                          onClick={() => handleForkRepository(repo)}
                        >
                          <GitBranch className="w-4 h-4 mr-1" />
                          {repo.forks}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-sm"
                          onClick={() => handleWatchRepository(repo)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {repo.watchers}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Updated {formatDate(repo.updatedAt)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {repo.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRepo(repo)
                          setCloneRepoDialogOpen(true)
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Clone
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRepo(repo)
                          handleDownloadSource()
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedRepo(repo)
                          setRepoSettingsDialogOpen(true)
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedRepo(repo)
                          toast.info('Opening repository', { description: `${repo.name} opened in new tab` })
                          window.open(`https://github.com/freeflow/${repo.name}`, '_blank')
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Select value={selectedRepo?.id || ''} onValueChange={(id) => setSelectedRepo(repositories.find(r => r.id === id) || null)}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Select repository" />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id}>{repo.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCompareDialogOpen(true)}>
                <GitMerge className="w-4 h-4 mr-2" />
                Compare
              </Button>
              <Button onClick={() => setCreateBranchDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Branch
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            {branches.map((branch) => (
              <Card key={branch.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <GitBranch className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{branch.name}</span>
                          {branch.isDefault && (
                            <Badge variant="outline" className="text-green-600 border-green-600">Default</Badge>
                          )}
                          {branch.isProtected && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              <Lock className="w-3 h-3 mr-1" />
                              Protected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {branch.lastCommit.message} - {branch.lastCommit.author} ({formatDate(branch.lastCommit.date)})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!branch.isDefault && (
                        <>
                          <span className="text-sm text-muted-foreground">
                            {branch.aheadBehind.ahead > 0 && <span className="text-green-600">{branch.aheadBehind.ahead} ahead</span>}
                            {branch.aheadBehind.ahead > 0 && branch.aheadBehind.behind > 0 && ', '}
                            {branch.aheadBehind.behind > 0 && <span className="text-red-600">{branch.aheadBehind.behind} behind</span>}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBranch(branch)
                              setCreatePRDialogOpen(true)
                              setPRSourceBranch(branch.name)
                            }}
                          >
                            <GitPullRequest className="w-4 h-4 mr-1" />
                            Create PR
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBranch(branch)
                          setBranchProtectionDialogOpen(true)
                        }}
                      >
                        {branch.isProtected ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedBranch(branch)
                          setDeleteBranchDialogOpen(true)
                        }}
                        disabled={branch.isDefault || branch.isProtected}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pull Requests Tab */}
        <TabsContent value="pull-requests" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Select value={prStatusFilter} onValueChange={setPRStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="merged">Merged</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setCreatePRDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Pull Request
            </Button>
          </div>
          <div className="grid gap-4">
            {filteredPullRequests.map((pr) => (
              <Card key={pr.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="w-5 h-5 text-muted-foreground" />
                        <Button
                          variant="link"
                          className="p-0 h-auto text-lg font-semibold"
                          onClick={() => {
                            setSelectedPR(pr)
                            toast.info('PR Details', { description: `Viewing PR #${pr.number}: ${pr.title}` })
                          }}
                        >
                          {pr.title}
                        </Button>
                        {getPRStatusBadge(pr.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        #{pr.number} opened by {pr.author.name} on {new Date(pr.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm">
                          <GitBranch className="w-4 h-4 inline mr-1" />
                          {pr.sourceBranch} <ChevronRight className="w-4 h-4 inline" /> {pr.targetBranch}
                        </span>
                        <span className="text-sm">
                          <GitCommit className="w-4 h-4 inline mr-1" />
                          {pr.commits} commits
                        </span>
                        <span className="text-sm text-green-600">+{pr.additions}</span>
                        <span className="text-sm text-red-600">-{pr.deletions}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">Reviewers:</span>
                        {pr.reviewers.length > 0 ? (
                          pr.reviewers.map((reviewer) => (
                            <div key={reviewer.name} className="flex items-center gap-1">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">{reviewer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {reviewer.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                              {reviewer.status === 'changes_requested' && <AlertCircle className="w-4 h-4 text-red-500" />}
                              {reviewer.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                          onClick={() => {
                            setSelectedPR(pr)
                            setAddReviewerDialogOpen(true)
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pr.status === 'open' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprovePR(pr)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestChanges(pr)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Request Changes
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPR(pr)
                              setMergePRDialogOpen(true)
                            }}
                          >
                            <GitMerge className="w-4 h-4 mr-1" />
                            Merge
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClosePR(pr)}
                          >
                            Close
                          </Button>
                        </>
                      )}
                      {pr.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.loading('Updating PR status...', { id: 'ready-review' })
                            setTimeout(() => {
                              setPullRequests(pullRequests.map(p =>
                                p.id === pr.id ? { ...p, status: 'open' as const } : p
                              ))
                              toast.success('Ready for review!', { id: 'ready-review', description: `PR #${pr.number} is now open for review` })
                            }, 1000)
                          }}
                        >
                          Ready for Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Commits Tab */}
        <TabsContent value="commits" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Select value={selectedRepo?.id || ''} onValueChange={(id) => setSelectedRepo(repositories.find(r => r.id === id) || null)}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Select repository" />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id}>{repo.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="main">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4">
            {commits.map((commit) => (
              <Card key={commit.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{commit.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium"
                            onClick={() => {
                              setSelectedCommit(commit)
                              setViewCommitDialogOpen(true)
                            }}
                          >
                            {commit.message}
                          </Button>
                          {commit.verified && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{commit.author.name}</span>
                          <span>committed {formatDate(commit.date)}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-green-600">+{commit.additions}</span>
                          <span className="text-red-600">-{commit.deletions}</span>
                          <span className="text-muted-foreground">{commit.filesChanged} files</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-mono"
                        onClick={() => handleCopyCommitHash(commit.hash)}
                      >
                        {commit.hash.substring(0, 7)}
                        <Copy className="w-4 h-4 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCommit(commit)
                          setViewCommitDialogOpen(true)
                        }}
                      >
                        <FileCode className="w-4 h-4 mr-1" />
                        Browse
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertCommit(commit)}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Revert
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCherryPick(commit)}
                      >
                        Cherry-pick
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Repository Dialog */}
      <Dialog open={createRepoDialogOpen} onOpenChange={setCreateRepoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Repository</DialogTitle>
            <DialogDescription>Create a new code repository for your project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Repository Name</Label>
              <Input
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                placeholder="my-awesome-project"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newRepoDescription}
                onChange={(e) => setNewRepoDescription(e.target.value)}
                placeholder="A brief description of your repository"
              />
            </div>
            <div>
              <Label>Visibility</Label>
              <Select value={newRepoVisibility} onValueChange={setNewRepoVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRepoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRepository} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Repository
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Repository Dialog */}
      <Dialog open={cloneRepoDialogOpen} onOpenChange={setCloneRepoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Repository</DialogTitle>
            <DialogDescription>Clone {selectedRepo?.name} to your local machine</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>SSH</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={selectedRepo ? `git@github.com:freeflow/${selectedRepo.name}.git` : ''}
                />
                <Button variant="outline" size="icon" onClick={handleCloneRepository}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>HTTPS</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={selectedRepo ? `https://github.com/freeflow/${selectedRepo.name}.git` : ''}
                />
                <Button variant="outline" size="icon" onClick={() => {
                  if (selectedRepo) {
                    navigator.clipboard.writeText(`https://github.com/freeflow/${selectedRepo.name}.git`)
                    toast.success('HTTPS URL copied to clipboard')
                  }
                }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneRepoDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Repository Dialog */}
      <Dialog open={importRepoDialogOpen} onOpenChange={setImportRepoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Repository</DialogTitle>
            <DialogDescription>Import an existing repository from another source</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Repository URL</Label>
              <Input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://github.com/user/repo.git"
              />
            </div>
            <div>
              <Label>Visibility</Label>
              <Select value={newRepoVisibility} onValueChange={setNewRepoVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportRepoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleImportRepository} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Repository Settings Dialog */}
      <Dialog open={repoSettingsDialogOpen} onOpenChange={setRepoSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Repository Settings</DialogTitle>
            <DialogDescription>Manage settings for {selectedRepo?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Repository Name</Label>
              <Input defaultValue={selectedRepo?.name} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea defaultValue={selectedRepo?.description} />
            </div>
            <div>
              <Label>Default Branch</Label>
              <Select defaultValue={selectedRepo?.defaultBranch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visibility</Label>
              <Select defaultValue={selectedRepo?.visibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium text-red-600">Danger Zone</p>
                <p className="text-sm text-muted-foreground">Archive or delete this repository</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRepoSettingsDialogOpen(false)
                    setArchiveRepoDialogOpen(true)
                  }}
                >
                  <Archive className="w-4 h-4 mr-1" />
                  Archive
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setRepoSettingsDialogOpen(false)
                    setDeleteRepoDialogOpen(true)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRepoSettingsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.loading('Saving settings...', { id: 'save-settings' })
              setTimeout(() => {
                toast.success('Settings saved!', { id: 'save-settings', description: 'Repository settings updated successfully' })
                setRepoSettingsDialogOpen(false)
              }, 1000)
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Branch Dialog */}
      <Dialog open={createBranchDialogOpen} onOpenChange={setCreateBranchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogDescription>Create a new branch from an existing branch</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Branch Name</Label>
              <Input
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="feature/my-new-feature"
              />
            </div>
            <div>
              <Label>Source Branch</Label>
              <Select value={newBranchSource} onValueChange={setNewBranchSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateBranchDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBranch} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Branch Dialog */}
      <Dialog open={deleteBranchDialogOpen} onOpenChange={setDeleteBranchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>Are you sure you want to delete the branch "{selectedBranch?.name}"? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBranchDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteBranch} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Pull Request Dialog */}
      <Dialog open={createPRDialogOpen} onOpenChange={setCreatePRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Pull Request</DialogTitle>
            <DialogDescription>Open a new pull request for code review</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={prTitle}
                onChange={(e) => setPRTitle(e.target.value)}
                placeholder="feat: Add new feature"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={prDescription}
                onChange={(e) => setPRDescription(e.target.value)}
                placeholder="Describe your changes..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Source Branch</Label>
                <Select value={prSourceBranch} onValueChange={setPRSourceBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.filter(b => !b.isDefault).map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Branch</Label>
                <Select value={prTargetBranch} onValueChange={setPRTargetBranch}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePRDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePullRequest} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Pull Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Pull Request Dialog */}
      <Dialog open={mergePRDialogOpen} onOpenChange={setMergePRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Pull Request</DialogTitle>
            <DialogDescription>Merge PR #{selectedPR?.number} into {selectedPR?.targetBranch}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Merge Method</Label>
              <Select defaultValue="merge">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Create a merge commit</SelectItem>
                  <SelectItem value="squash">Squash and merge</SelectItem>
                  <SelectItem value="rebase">Rebase and merge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Commit Message (optional)</Label>
              <Textarea placeholder="Leave empty for default message" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergePRDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMergePullRequest} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Merge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Commit Dialog */}
      <Dialog open={viewCommitDialogOpen} onOpenChange={setViewCommitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Commit Details</DialogTitle>
            <DialogDescription>{selectedCommit?.hash}</DialogDescription>
          </DialogHeader>
          {selectedCommit && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>{selectedCommit.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedCommit.author.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCommit.author.email}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">{selectedCommit.message}</p>
                <p className="text-sm text-muted-foreground mt-1">{new Date(selectedCommit.date).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-green-600">+{selectedCommit.additions} additions</span>
                <span className="text-sm text-red-600">-{selectedCommit.deletions} deletions</span>
                <span className="text-sm text-muted-foreground">{selectedCommit.filesChanged} files changed</span>
              </div>
              <div className="border rounded-lg p-4 bg-muted/50">
                <p className="text-sm font-mono">git show {selectedCommit.hash}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => handleCopyCommitHash(selectedCommit?.hash || '')}>
              <Copy className="w-4 h-4 mr-1" />
              Copy Hash
            </Button>
            <Button variant="outline" onClick={() => setViewCommitDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Repository Dialog */}
      <Dialog open={archiveRepoDialogOpen} onOpenChange={setArchiveRepoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Repository</DialogTitle>
            <DialogDescription>Archive "{selectedRepo?.name}"? This will make it read-only.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveRepoDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleArchiveRepository} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Archive Repository
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Repository Dialog */}
      <Dialog open={deleteRepoDialogOpen} onOpenChange={setDeleteRepoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Repository</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{selectedRepo?.name}"? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRepoDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRepository} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Repository
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branch Protection Dialog */}
      <Dialog open={branchProtectionDialogOpen} onOpenChange={setBranchProtectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Branch Protection</DialogTitle>
            <DialogDescription>
              {selectedBranch?.isProtected
                ? `Remove protection from "${selectedBranch?.name}"?`
                : `Enable protection for "${selectedBranch?.name}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBranchProtectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleToggleBranchProtection} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedBranch?.isProtected ? 'Remove Protection' : 'Enable Protection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Reviewer Dialog */}
      <Dialog open={addReviewerDialogOpen} onOpenChange={setAddReviewerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reviewer</DialogTitle>
            <DialogDescription>Add a reviewer to PR #{selectedPR?.number}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Reviewer</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alex">Alex Chen</SelectItem>
                  <SelectItem value="sarah">Sarah Miller</SelectItem>
                  <SelectItem value="mike">Mike Johnson</SelectItem>
                  <SelectItem value="emma">Emma Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddReviewerDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddReviewer}>Add Reviewer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Files Dialog */}
      <Dialog open={viewFilesDialogOpen} onOpenChange={setViewFilesDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRepo?.name}</DialogTitle>
            <DialogDescription>{selectedRepo?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select defaultValue="main">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Go to file..." className="flex-1" />
            </div>
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => {
                    toast.info('Opening folder', { description: 'Navigating to src/' })
                  }}>
                  <Folder className="w-5 h-5 text-blue-500" />
                  <span>src</span>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => {
                    toast.info('Opening folder', { description: 'Navigating to public/' })
                  }}>
                  <Folder className="w-5 h-5 text-blue-500" />
                  <span>public</span>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => {
                    toast.loading('Loading file...', { id: 'view-readme' })
                    setTimeout(() => {
                      toast.success('File loaded', { id: 'view-readme', description: 'README.md is ready to view' })
                    }, 500)
                  }}>
                  <FileCode className="w-5 h-5 text-muted-foreground" />
                  <span>README.md</span>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => {
                    toast.loading('Loading file...', { id: 'view-package' })
                    setTimeout(() => {
                      toast.success('File loaded', { id: 'view-package', description: 'package.json is ready to view' })
                    }, 500)
                  }}>
                  <FileCode className="w-5 h-5 text-muted-foreground" />
                  <span>package.json</span>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => {
                    toast.loading('Loading file...', { id: 'view-tsconfig' })
                    setTimeout(() => {
                      toast.success('File loaded', { id: 'view-tsconfig', description: 'tsconfig.json is ready to view' })
                    }, 500)
                  }}>
                  <FileCode className="w-5 h-5 text-muted-foreground" />
                  <span>tsconfig.json</span>
                </div>
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewFilesDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare Branches</DialogTitle>
            <DialogDescription>Compare changes between two branches</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Base Branch</Label>
                <Select defaultValue="main">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Compare Branch</Label>
                <Select defaultValue="develop">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCompare}>Compare</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
