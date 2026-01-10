'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Book,
  Code,
  Search,
  Package,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Download,
  Terminal,
  Plus,
  ChevronRight,
  ChevronDown,
  Folder,
  Hash,
  Copy,
  Check,
  Clock,
  Star,
  GitBranch,
  Edit,
  Trash2,
  Users,
  Globe,
  Bookmark,
  History,
  Settings,
  Zap,
  PlayCircle,
  Layers,
  ArrowRight,
  Sparkles,
  Shield,
  Bell,
  Key,
  Webhook,
  Database,
  Lock,
  Mail,
  RefreshCw,
  AlertOctagon,
  Palette,
  Type,
  Archive,
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
type DocCategory = 'guides' | 'api' | 'sdk' | 'tutorials' | 'reference' | 'examples' | 'changelog'
type DocStatus = 'published' | 'draft' | 'review' | 'archived' | 'deprecated'
type ContentBlock = 'text' | 'code' | 'callout' | 'image' | 'video' | 'api-reference' | 'table'

interface Author {
  id: string
  name: string
  avatar: string
  role: string
}

interface DocSection {
  id: string
  title: string
  slug: string
  order: number
  children?: DocSection[]
}

interface CodeExample {
  language: string
  code: string
  title?: string
}

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  responseExample?: string
}

interface DocVersion {
  version: string
  date: string
  isLatest: boolean
  isCurrent: boolean
}

interface DocFeedback {
  helpful: number
  notHelpful: number
  comments: { userId: string; userName: string; comment: string; date: string }[]
}

interface Doc {
  id: string
  title: string
  slug: string
  description: string
  category: DocCategory
  status: DocStatus
  content: string
  sections: DocSection[]
  author: Author
  contributors: Author[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  version: string
  versions: DocVersion[]
  codeExamples: CodeExample[]
  apiEndpoint?: ApiEndpoint
  readTime: number
  views: number
  feedback: DocFeedback
  tags: string[]
  relatedDocs: string[]
  isBookmarked: boolean
  isFeatured: boolean
  seoTitle?: string
  seoDescription?: string
}

interface DocSpace {
  id: string
  name: string
  description: string
  icon: string
  docsCount: number
  lastUpdated: string
}

// Mock Data
const mockAuthors: Author[] = [
  { id: '1', name: 'Alex Chen', avatar: '/avatars/alex.jpg', role: 'Technical Writer' },
  { id: '2', name: 'Sarah Kim', avatar: '/avatars/sarah.jpg', role: 'Developer Advocate' },
  { id: '3', name: 'Mike Ross', avatar: '/avatars/mike.jpg', role: 'API Engineer' },
]

const mockSpaces: DocSpace[] = [
  { id: '1', name: 'Getting Started', description: 'Quick start guides and tutorials', icon: 'Zap', docsCount: 12, lastUpdated: '2024-03-20' },
  { id: '2', name: 'API Reference', description: 'Complete API documentation', icon: 'Code', docsCount: 45, lastUpdated: '2024-03-19' },
  { id: '3', name: 'SDKs & Libraries', description: 'Official SDKs and client libraries', icon: 'Package', docsCount: 18, lastUpdated: '2024-03-18' },
  { id: '4', name: 'Tutorials', description: 'Step-by-step tutorials', icon: 'Book', docsCount: 24, lastUpdated: '2024-03-17' },
]

const mockDocs: Doc[] = [
  {
    id: '1',
    title: 'Quick Start Guide',
    slug: 'quick-start',
    description: 'Get up and running with our platform in under 5 minutes',
    category: 'guides',
    status: 'published',
    content: '# Quick Start\n\nWelcome to our platform...',
    sections: [
      { id: '1', title: 'Installation', slug: 'installation', order: 1 },
      { id: '2', title: 'Configuration', slug: 'configuration', order: 2 },
      { id: '3', title: 'First API Call', slug: 'first-api-call', order: 3 }
    ],
    author: mockAuthors[0],
    contributors: [mockAuthors[1]],
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20',
    publishedAt: '2024-01-20',
    version: '2.1.0',
    versions: [
      { version: '2.1.0', date: '2024-03-20', isLatest: true, isCurrent: true },
      { version: '2.0.0', date: '2024-02-15', isLatest: false, isCurrent: false },
      { version: '1.0.0', date: '2024-01-20', isLatest: false, isCurrent: false }
    ],
    codeExamples: [
      { language: 'bash', code: 'npm install @company/sdk', title: 'Installation' },
      { language: 'javascript', code: 'import { Client } from "@company/sdk";\n\nconst client = new Client({ apiKey: "YOUR_KEY" });', title: 'Initialize' }
    ],
    readTime: 5,
    views: 45230,
    feedback: { helpful: 892, notHelpful: 23, comments: [] },
    tags: ['getting-started', 'quickstart', 'installation'],
    relatedDocs: ['2', '3'],
    isBookmarked: false,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Authentication',
    slug: 'authentication',
    description: 'Learn how to authenticate API requests using API keys and OAuth',
    category: 'api',
    status: 'published',
    content: '# Authentication\n\nSecure your API calls...',
    sections: [
      { id: '1', title: 'API Keys', slug: 'api-keys', order: 1 },
      { id: '2', title: 'OAuth 2.0', slug: 'oauth', order: 2 },
      { id: '3', title: 'JWT Tokens', slug: 'jwt', order: 3 }
    ],
    author: mockAuthors[2],
    contributors: [mockAuthors[0], mockAuthors[1]],
    createdAt: '2024-02-01',
    updatedAt: '2024-03-18',
    publishedAt: '2024-02-05',
    version: '1.5.0',
    versions: [
      { version: '1.5.0', date: '2024-03-18', isLatest: true, isCurrent: true }
    ],
    codeExamples: [
      { language: 'javascript', code: 'const headers = {\n  "Authorization": "Bearer YOUR_TOKEN"\n};', title: 'Bearer Token' }
    ],
    apiEndpoint: {
      method: 'POST',
      path: '/auth/token',
      description: 'Generate an access token',
      parameters: [
        { name: 'grant_type', type: 'string', required: true, description: 'OAuth grant type' },
        { name: 'client_id', type: 'string', required: true, description: 'Your client ID' }
      ],
      responseExample: '{\n  "access_token": "eyJ...",\n  "expires_in": 3600\n}'
    },
    readTime: 8,
    views: 38450,
    feedback: { helpful: 756, notHelpful: 12, comments: [] },
    tags: ['auth', 'security', 'api-keys', 'oauth'],
    relatedDocs: ['1', '3'],
    isBookmarked: true,
    isFeatured: true
  },
  {
    id: '3',
    title: 'JavaScript SDK',
    slug: 'javascript-sdk',
    description: 'Complete reference for the official JavaScript/TypeScript SDK',
    category: 'sdk',
    status: 'published',
    content: '# JavaScript SDK\n\nThe official SDK...',
    sections: [
      { id: '1', title: 'Installation', slug: 'installation', order: 1 },
      { id: '2', title: 'Client Setup', slug: 'client-setup', order: 2 },
      { id: '3', title: 'Methods', slug: 'methods', order: 3 },
      { id: '4', title: 'Error Handling', slug: 'errors', order: 4 }
    ],
    author: mockAuthors[1],
    contributors: [mockAuthors[2]],
    createdAt: '2024-01-20',
    updatedAt: '2024-03-15',
    publishedAt: '2024-01-25',
    version: '3.2.1',
    versions: [
      { version: '3.2.1', date: '2024-03-15', isLatest: true, isCurrent: true },
      { version: '3.2.0', date: '2024-03-01', isLatest: false, isCurrent: false }
    ],
    codeExamples: [
      { language: 'typescript', code: 'import { Client, User } from "@company/sdk";\n\nasync function getUser(id: string): Promise<User> {\n  const client = new Client();\n  return await client.users.get(id);\n}', title: 'Get User' }
    ],
    readTime: 15,
    views: 28900,
    feedback: { helpful: 542, notHelpful: 18, comments: [] },
    tags: ['javascript', 'typescript', 'sdk', 'npm'],
    relatedDocs: ['1', '4'],
    isBookmarked: false,
    isFeatured: false
  },
  {
    id: '4',
    title: 'Webhooks Guide',
    slug: 'webhooks',
    description: 'Configure and handle webhook events for real-time updates',
    category: 'guides',
    status: 'published',
    content: '# Webhooks\n\nReceive real-time notifications...',
    sections: [
      { id: '1', title: 'Setup', slug: 'setup', order: 1 },
      { id: '2', title: 'Event Types', slug: 'events', order: 2 },
      { id: '3', title: 'Verification', slug: 'verification', order: 3 }
    ],
    author: mockAuthors[2],
    contributors: [],
    createdAt: '2024-02-15',
    updatedAt: '2024-03-10',
    publishedAt: '2024-02-20',
    version: '1.2.0',
    versions: [
      { version: '1.2.0', date: '2024-03-10', isLatest: true, isCurrent: true }
    ],
    codeExamples: [
      { language: 'javascript', code: 'app.post("/webhook", (req, res) => {\n  const event = req.body;\n  // Handle event\n  res.sendStatus(200);\n});', title: 'Express Handler' }
    ],
    readTime: 10,
    views: 15670,
    feedback: { helpful: 328, notHelpful: 8, comments: [] },
    tags: ['webhooks', 'events', 'real-time'],
    relatedDocs: ['2'],
    isBookmarked: false,
    isFeatured: false
  },
  {
    id: '5',
    title: 'REST API Reference',
    slug: 'api-reference',
    description: 'Complete REST API documentation with all endpoints',
    category: 'reference',
    status: 'published',
    content: '# API Reference\n\nFull API documentation...',
    sections: [
      { id: '1', title: 'Users', slug: 'users', order: 1, children: [
        { id: '1a', title: 'List Users', slug: 'list-users', order: 1 },
        { id: '1b', title: 'Get User', slug: 'get-user', order: 2 },
        { id: '1c', title: 'Create User', slug: 'create-user', order: 3 }
      ]},
      { id: '2', title: 'Projects', slug: 'projects', order: 2 },
      { id: '3', title: 'Teams', slug: 'teams', order: 3 }
    ],
    author: mockAuthors[2],
    contributors: [mockAuthors[0], mockAuthors[1]],
    createdAt: '2024-01-01',
    updatedAt: '2024-03-20',
    publishedAt: '2024-01-05',
    version: '4.0.0',
    versions: [
      { version: '4.0.0', date: '2024-03-20', isLatest: true, isCurrent: true }
    ],
    codeExamples: [],
    apiEndpoint: {
      method: 'GET',
      path: '/users',
      description: 'List all users',
      parameters: [
        { name: 'page', type: 'integer', required: false, description: 'Page number' },
        { name: 'limit', type: 'integer', required: false, description: 'Items per page' }
      ]
    },
    readTime: 30,
    views: 52340,
    feedback: { helpful: 1024, notHelpful: 45, comments: [] },
    tags: ['api', 'rest', 'reference', 'endpoints'],
    relatedDocs: ['2', '3'],
    isBookmarked: true,
    isFeatured: true
  }
]

const languages = ['All', 'JavaScript', 'Python', 'Ruby', 'Go', 'cURL']

// Mock data for AI-powered competitive upgrade components
const mockDocsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Popular Content', description: 'Quick Start guide has 10K views this month!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '2', type: 'warning' as const, title: 'Broken Links', description: '5 external links returning 404 errors.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Quality' },
  { id: '3', type: 'info' as const, title: 'Search Insights', description: '"webhooks" is trending - consider expanding coverage.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Search' },
]

const mockDocsCollaborators = [
  { id: '1', name: 'Docs Lead', avatar: '/avatars/docs.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'API Writer', avatar: '/avatars/api-writer.jpg', status: 'online' as const, role: 'Writer' },
  { id: '3', name: 'Developer Advocate', avatar: '/avatars/devrel.jpg', status: 'away' as const, role: 'DevRel' },
]

const mockDocsPredictions = [
  { id: '1', title: 'Traffic Growth', prediction: 'Docs traffic will double after v3 API launch', confidence: 86, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Content Needs', prediction: 'SDK pages need 30% more examples based on feedback', confidence: 79, trend: 'up' as const, impact: 'medium' as const },
]

const mockDocsActivities = [
  { id: '1', user: 'API Writer', action: 'Published', target: 'v3 API migration guide', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Docs Lead', action: 'Reviewed', target: 'SDK documentation updates', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Developer Advocate', action: 'Added', target: 'video tutorial embed', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockDocsQuickActions = [
  { id: '1', label: 'New Doc', icon: 'plus', action: async () => {
    toast.loading('Creating document...')
    try {
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Document', content: '', status: 'draft' })
      })
      toast.dismiss()
      if (response.ok) {
        toast.success('Document created! Start writing')
      } else {
        toast.error('Failed to create document')
      }
    } catch {
      toast.dismiss()
      toast.error('Failed to create document')
    }
  }, variant: 'default' as const },
  { id: '2', label: 'Preview', icon: 'eye', action: () => {
    // Open preview in new window
    const previewUrl = `${window.location.origin}/docs/preview`
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
    toast.success('Preview opened in new tab')
  }, variant: 'default' as const },
  { id: '3', label: 'Publish', icon: 'send', action: async () => {
    toast.loading('Publishing documentation...')
    try {
      const response = await fetch('/api/docs/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published', publishedAt: new Date().toISOString() })
      })
      toast.dismiss()
      if (response.ok) {
        toast.success('Documentation published to production!')
      } else {
        toast.error('Publish failed')
      }
    } catch {
      toast.dismiss()
      toast.error('Publish failed')
    }
  }, variant: 'outline' as const },
]

export default function DocsClient() {
  const [docs] = useState<Doc[]>(mockDocs)
  const [spaces] = useState<DocSpace[]>(mockSpaces)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | 'all'>('all')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [activeTab, setActiveTab] = useState('browse')
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Filtered docs
  const filteredDocs = useMemo(() => {
    let result = docs.filter(d => d.status === 'published')

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(d =>
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    if (selectedCategory !== 'all') {
      result = result.filter(d => d.category === selectedCategory)
    }

    return result.sort((a, b) => b.views - a.views)
  }, [docs, searchQuery, selectedCategory])

  // Stats
  const stats = useMemo(() => ({
    totalDocs: docs.filter(d => d.status === 'published').length,
    totalViews: docs.reduce((sum, d) => sum + d.views, 0),
    avgRating: docs.reduce((sum, d) => sum + (d.feedback.helpful / (d.feedback.helpful + d.feedback.notHelpful) * 100), 0) / docs.length,
    apiEndpoints: docs.filter(d => d.apiEndpoint).length
  }), [docs])

  const getCategoryIcon = (category: DocCategory) => {
    const icons: Record<DocCategory, React.ReactNode> = {
      guides: <Book className="h-4 w-4" />,
      api: <Code className="h-4 w-4" />,
      sdk: <Package className="h-4 w-4" />,
      tutorials: <PlayCircle className="h-4 w-4" />,
      reference: <FileText className="h-4 w-4" />,
      examples: <Terminal className="h-4 w-4" />,
      changelog: <History className="h-4 w-4" />
    }
    return icons[category]
  }

  const getCategoryColor = (category: DocCategory) => {
    const colors: Record<DocCategory, string> = {
      guides: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      api: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      sdk: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      tutorials: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      reference: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      examples: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      changelog: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
    return colors[category]
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-green-100 text-green-700',
      POST: 'bg-blue-100 text-blue-700',
      PUT: 'bg-amber-100 text-amber-700',
      DELETE: 'bg-red-100 text-red-700',
      PATCH: 'bg-purple-100 text-purple-700'
    }
    return colors[method] || 'bg-gray-100 text-gray-700'
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  // Handlers
  const handleCreateDoc = () => {
    toast.info('Create Document', {
      description: 'Opening document editor...'
    })
  }

  const handlePublishDoc = (docId: string) => {
    toast.success('Document published', {
      description: 'Documentation is now live'
    })
  }

  const handleExportDocs = () => {
    toast.success('Exporting documentation', {
      description: 'Docs will be downloaded'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 via-gray-700 to-zinc-700 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Book className="h-8 w-8" />
                Documentation
              </h1>
              <p className="mt-2 text-white/80">
                API references, guides, and developer resources
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 w-64"
                />
              </div>
              <Button className="bg-white text-slate-700 hover:bg-white/90">
                <Plus className="h-4 w-4 mr-2" />
                New Doc
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.totalDocs}</div>
              <div className="text-sm text-white/70">Published Docs</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{formatViews(stats.totalViews)}</div>
              <div className="text-sm text-white/70">Total Views</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.avgRating.toFixed(0)}%</div>
              <div className="text-sm text-white/70">Helpful Rating</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.apiEndpoints}</div>
              <div className="text-sm text-white/70">API Endpoints</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800">
            <TabsTrigger value="browse" className="gap-2">
              <Layers className="h-4 w-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="spaces" className="gap-2">
              <Folder className="h-4 w-4" />
              Spaces
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Code className="h-4 w-4" />
              API Reference
            </TabsTrigger>
            <TabsTrigger value="changelog" className="gap-2">
              <History className="h-4 w-4" />
              Changelog
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Browse Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Documentation</h2>
                  <p className="text-blue-100">GitBook-level developer documentation</p>
                  <p className="text-blue-200 text-xs mt-1">Search - Categories - Version control</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredDocs.length}</p>
                    <p className="text-blue-200 text-sm">Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSpaces.length}</p>
                    <p className="text-blue-200 text-sm">Spaces</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'guides', 'api', 'sdk', 'tutorials', 'reference', 'examples'] as const).map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="gap-2"
                >
                  {cat !== 'all' && getCategoryIcon(cat as DocCategory)}
                  {cat === 'all' ? 'All Docs' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>

            {/* Doc Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {filteredDocs.map(doc => (
                  <Card
                    key={doc.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getCategoryIcon(doc.category)}
                            <h3 className="font-semibold text-lg">{doc.title}</h3>
                            {doc.isFeatured && (
                              <Badge className="bg-amber-100 text-amber-700">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
                        </div>
                        <Badge className={getCategoryColor(doc.category)}>{doc.category}</Badge>
                      </div>

                      {doc.apiEndpoint && (
                        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm flex items-center gap-2">
                          <Badge className={getMethodColor(doc.apiEndpoint.method)}>
                            {doc.apiEndpoint.method}
                          </Badge>
                          <code>{doc.apiEndpoint.path}</code>
                        </div>
                      )}

                      {doc.codeExamples.length > 0 && (
                        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                          <Terminal className="h-4 w-4" />
                          <span>Includes code examples in {doc.codeExamples.map(e => e.language).join(', ')}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatViews(doc.views)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {doc.readTime} min
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {doc.feedback.helpful}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{doc.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-500">{doc.author.name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { icon: <Zap className="h-4 w-4" />, label: 'Quick Start', href: '#' },
                      { icon: <Code className="h-4 w-4" />, label: 'API Reference', href: '#' },
                      { icon: <Package className="h-4 w-4" />, label: 'SDKs', href: '#' },
                      { icon: <PlayCircle className="h-4 w-4" />, label: 'Tutorials', href: '#' }
                    ].map((link, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {link.icon}
                          <span>{link.label}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Docs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {docs
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 5)
                      .map((doc, i) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{doc.title}</div>
                            <div className="text-xs text-gray-500">{formatViews(doc.views)} views</div>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Updates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {docs
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .slice(0, 4)
                      .map(doc => (
                        <div key={doc.id} className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            {getCategoryIcon(doc.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{doc.title}</div>
                            <div className="text-xs text-gray-500">
                              Updated {new Date(doc.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spaces" className="space-y-6">
            {/* Spaces Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Documentation Spaces</h2>
                  <p className="text-emerald-100">Confluence-level team spaces</p>
                  <p className="text-emerald-200 text-xs mt-1">Team access - Collections - Permissions</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{spaces.length}</p>
                    <p className="text-emerald-200 text-sm">Spaces</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {spaces.map(space => (
                <Card key={space.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit mb-4">
                      {space.icon === 'Zap' && <Zap className="h-6 w-6 text-slate-600" />}
                      {space.icon === 'Code' && <Code className="h-6 w-6 text-slate-600" />}
                      {space.icon === 'Package' && <Package className="h-6 w-6 text-slate-600" />}
                      {space.icon === 'Book' && <Book className="h-6 w-6 text-slate-600" />}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{space.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{space.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{space.docsCount} docs</span>
                      <span>Updated {new Date(space.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            {/* API Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Reference</h2>
                  <p className="text-orange-100">Stripe-level API documentation</p>
                  <p className="text-orange-200 text-xs mt-1">Interactive - Code samples - Try it live</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDocs.filter(d => d.apiEndpoint).length}</p>
                    <p className="text-orange-200 text-sm">Endpoints</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">API Endpoints</h2>
              <div className="flex items-center gap-2">
                {languages.map(lang => (
                  <Button
                    key={lang}
                    variant={selectedLanguage === lang ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {docs.filter(d => d.apiEndpoint).map(doc => (
                    <div
                      key={doc.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="flex items-center gap-4">
                        <Badge className={`${getMethodColor(doc.apiEndpoint!.method)} font-mono`}>
                          {doc.apiEndpoint!.method}
                        </Badge>
                        <code className="flex-1 font-mono text-sm">{doc.apiEndpoint!.path}</code>
                        <span className="text-sm text-gray-500">{doc.apiEndpoint!.description}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="changelog" className="space-y-6">
            {/* Changelog Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Version History</h2>
                  <p className="text-purple-100">GitHub Releases-level changelog</p>
                  <p className="text-purple-200 text-xs mt-1">Version tracking - Release notes - Diffs</p>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Documentation Changelog</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {docs
                    .flatMap(doc => doc.versions.map(v => ({ ...v, doc })))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((item, i) => (
                      <div key={`${item.doc.id}-${item.version}`} className="flex gap-4">
                        <div className="w-24 text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{item.doc.title}</span>
                            <Badge variant="outline">v{item.version}</Badge>
                            {item.isLatest && (
                              <Badge className="bg-green-100 text-green-700">Latest</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Updated by {item.doc.author.name}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Confluence Level with 6 Sub-tabs */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Documentation Settings</h2>
                  <p className="text-slate-100">ReadMe-level configuration options</p>
                  <p className="text-slate-200 text-xs mt-1">Appearance - Permissions - Integrations</p>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              {/* Settings Sidebar */}
              <div className="w-64 shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 px-3">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'appearance', icon: Palette, label: 'Appearance' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'permissions', icon: Shield, label: 'Permissions' },
                      { id: 'integrations', icon: Zap, label: 'Integrations' },
                      { id: 'advanced', icon: Lock, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          settingsTab === item.id
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle>Documentation Settings</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure your documentation preferences</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Default Space</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default space for new documents</p>
                          </div>
                          <Select defaultValue="getting-started">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="getting-started">Getting Started</SelectItem>
                              <SelectItem value="api-docs">API Documentation</SelectItem>
                              <SelectItem value="sdk-guides">SDK Guides</SelectItem>
                              <SelectItem value="tutorials">Tutorials</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-Save Drafts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically save document drafts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Version History</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Keep track of document versions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Spell Check</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable spell checking in editor</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <CardTitle>Code Blocks</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure code block preferences</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Default Language</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default syntax highlighting</p>
                          </div>
                          <Select defaultValue="typescript">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="typescript">TypeScript</SelectItem>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="go">Go</SelectItem>
                              <SelectItem value="rust">Rust</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Line Numbers</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Show line numbers in code blocks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Copy Button</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Show copy button on code blocks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Appearance Settings */}
                {settingsTab === 'appearance' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                            <Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                          </div>
                          <div>
                            <CardTitle>Theme & Styling</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customize documentation appearance</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Color Scheme</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Primary color for documentation</p>
                          </div>
                          <Select defaultValue="blue">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="orange">Orange</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Dark Mode Default</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default to dark mode for readers</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Sidebar Always Visible</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Keep navigation sidebar expanded</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Type className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <CardTitle>Typography</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure font and text settings</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Body Font</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Font for document content</p>
                          </div>
                          <Select defaultValue="inter">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inter">Inter</SelectItem>
                              <SelectItem value="roboto">Roboto</SelectItem>
                              <SelectItem value="opensans">Open Sans</SelectItem>
                              <SelectItem value="lato">Lato</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Code Font</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Font for code blocks</p>
                          </div>
                          <Select defaultValue="firacode">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="firacode">Fira Code</SelectItem>
                              <SelectItem value="jetbrains">JetBrains Mono</SelectItem>
                              <SelectItem value="source">Source Code Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Base Font Size</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default text size</p>
                          </div>
                          <Select defaultValue="16">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="14">14px</SelectItem>
                              <SelectItem value="16">16px</SelectItem>
                              <SelectItem value="18">18px</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle>Email Notifications</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure email alert preferences</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Document Updates</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when watched docs change</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Comment Mentions</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when mentioned in comments</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Weekly Digest</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly summary of doc changes</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Deprecation Notices</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert when docs are deprecated</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Webhook className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <CardTitle>Webhook Notifications</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send updates to external services</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Slack Integration</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Post doc updates to Slack</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Discord Webhook</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send updates to Discord</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Label className="text-gray-900 dark:text-white font-medium mb-2 block">Custom Webhook URL</Label>
                          <div className="flex gap-2">
                            <Input placeholder="https://your-webhook-url.com/endpoint" className="flex-1" />
                            <Button variant="outline">Test</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Permissions Settings */}
                {settingsTab === 'permissions' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <CardTitle>Access Control</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage who can view and edit docs</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Default Visibility</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default visibility for new docs</p>
                          </div>
                          <Select defaultValue="public">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="team">Team Only</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Allow Guest Access</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Let non-users view public docs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Require Login to Comment</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Users must be logged in to comment</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Edit className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <CardTitle>Editor Permissions</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Control editing capabilities</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Who Can Edit</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default editing permissions</p>
                          </div>
                          <Select defaultValue="team">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner Only</SelectItem>
                              <SelectItem value="admin">Admins</SelectItem>
                              <SelectItem value="team">Team Members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Require Approval</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Edits need admin approval</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Lock Published Docs</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Prevent edits to published docs</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <GitBranch className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <CardTitle>Source Control</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sync docs with repositories</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { name: 'GitHub', connected: true },
                            { name: 'GitLab', connected: false },
                            { name: 'Bitbucket', connected: false },
                            { name: 'Azure DevOps', connected: false }
                          ].map(provider => (
                            <div key={provider.name} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg">
                              <div className="flex items-center gap-3">
                                <GitBranch className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-white">{provider.name}</span>
                              </div>
                              <Button variant={provider.connected ? 'outline' : 'default'} size="sm">
                                {provider.connected ? 'Manage' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <CardTitle>API Access</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage API tokens and access</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-gray-900 dark:text-white font-medium">API Token</Label>
                            <Button variant="outline" size="sm" onClick={async () => {
                              await navigator.clipboard.writeText('docs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
                              toast.success('API token copied to clipboard')
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded block font-mono">
                            docs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <Button variant="outline" className="w-full" onClick={async () => {
                          toast.loading('Regenerating API token...')
                          try {
                            const response = await fetch('/api/tokens/regenerate', { method: 'POST' })
                            toast.dismiss()
                            if (response.ok) {
                              toast.success('API token regenerated successfully')
                            } else {
                              toast.error('Failed to regenerate token')
                            }
                          } catch {
                            toast.dismiss()
                            toast.error('Failed to regenerate token')
                          }
                        }}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate API Token
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <CardTitle>Third-Party Services</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Connect external services</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <Label className="text-gray-900 dark:text-white font-medium">Algolia Search</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Powered search indexing</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <Label className="text-gray-900 dark:text-white font-medium">Custom Domain</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Use your own domain</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <CardTitle>Data & Storage</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage documentation data</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Version Retention</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How long to keep old versions</p>
                          </div>
                          <Select defaultValue="forever">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-Archive Drafts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Archive drafts after inactivity</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => {
                            // Export all docs as JSON
                            const docsData = JSON.stringify(mockDocs, null, 2)
                            const blob = new Blob([docsData], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'documentation-export.json'
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                            toast.success('Documentation exported successfully')
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Export All Docs
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={async () => {
                            toast.loading('Creating backup...')
                            try {
                              const response = await fetch('/api/docs/backup', { method: 'POST' })
                              toast.dismiss()
                              if (response.ok) {
                                toast.success('Backup created successfully')
                              } else {
                                toast.error('Backup failed')
                              }
                            } catch {
                              toast.dismiss()
                              toast.error('Backup failed')
                            }
                          }}>
                            <Archive className="h-4 w-4 mr-2" />
                            Backup Docs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div>
                            <CardTitle>AI Features</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered documentation tools</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">AI Writing Assistant</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get AI help while writing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-Generate Summaries</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Create doc summaries with AI</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Smart Search</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">AI-enhanced search results</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                          <p className="text-sm text-red-600/70 dark:text-red-400/70">Destructive actions</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Clear Search Index</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rebuild documentation search index</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={async () => {
                            if (!confirm('Are you sure you want to rebuild the search index? This may take a few minutes.')) return
                            toast.loading('Rebuilding search index...')
                            try {
                              const response = await fetch('/api/docs/rebuild-index', { method: 'POST' })
                              toast.dismiss()
                              if (response.ok) {
                                toast.success('Search index rebuilt successfully')
                              } else {
                                toast.error('Failed to rebuild index')
                              }
                            } catch {
                              toast.dismiss()
                              toast.error('Failed to rebuild index')
                            }
                          }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Rebuild
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Delete All Drafts</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently remove all draft documents</p>
                          </div>
                          <Button variant="destructive" onClick={async () => {
                            if (!confirm('Are you sure you want to delete all drafts? This action cannot be undone.')) return
                            toast.loading('Deleting all drafts...')
                            try {
                              const response = await fetch('/api/docs/drafts', { method: 'DELETE' })
                              toast.dismiss()
                              if (response.ok) {
                                toast.success('All drafts deleted successfully')
                              } else {
                                toast.error('Failed to delete drafts')
                              }
                            } catch {
                              toast.dismiss()
                              toast.error('Failed to delete drafts')
                            }
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Drafts
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockDocsAIInsights}
              title="Documentation Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockDocsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockDocsPredictions}
              title="Content Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockDocsActivities}
            title="Docs Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockDocsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Doc Detail Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedDoc && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(selectedDoc.category)}>
                        {getCategoryIcon(selectedDoc.category)}
                        <span className="ml-1">{selectedDoc.category}</span>
                      </Badge>
                      <Badge variant="outline">v{selectedDoc.version}</Badge>
                    </div>
                    <DialogTitle className="text-2xl">{selectedDoc.title}</DialogTitle>
                    <p className="text-gray-500 mt-1">{selectedDoc.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={async () => {
                      toast.loading('Saving bookmark...')
                      try {
                        const response = await fetch('/api/bookmarks', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ docId: selectedDoc.id, type: 'doc' })
                        })
                        toast.dismiss()
                        if (response.ok) {
                          toast.success('Document bookmarked')
                        } else {
                          toast.error('Failed to bookmark')
                        }
                      } catch {
                        toast.dismiss()
                        toast.error('Failed to bookmark')
                      }
                    }}>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Bookmark
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      window.location.href = `/docs/edit/${selectedDoc.id}`
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex gap-6 flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r pr-4">
                  <ScrollArea className="h-full">
                    <h4 className="font-medium mb-3 text-sm text-gray-500">ON THIS PAGE</h4>
                    <div className="space-y-1">
                      {selectedDoc.sections.map(section => (
                        <div key={section.id}>
                          <button
                            className="w-full flex items-center justify-between p-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => toggleSection(section.id)}
                          >
                            <span>{section.title}</span>
                            {section.children && (
                              expandedSections.includes(section.id)
                                ? <ChevronDown className="h-4 w-4" />
                                : <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          {section.children && expandedSections.includes(section.id) && (
                            <div className="ml-4 space-y-1">
                              {section.children.map(child => (
                                <button
                                  key={child.id}
                                  className="w-full text-left p-2 text-sm text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                                >
                                  {child.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                  <div className="pr-4 space-y-6">
                    {/* Meta */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{selectedDoc.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{selectedDoc.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedDoc.readTime} min read
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {formatViews(selectedDoc.views)} views
                      </div>
                      <div>
                        Updated {new Date(selectedDoc.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* API Endpoint */}
                    {selectedDoc.apiEndpoint && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Badge className={`${getMethodColor(selectedDoc.apiEndpoint.method)} font-mono`}>
                              {selectedDoc.apiEndpoint.method}
                            </Badge>
                            <code className="font-mono">{selectedDoc.apiEndpoint.path}</code>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{selectedDoc.apiEndpoint.description}</p>

                          {selectedDoc.apiEndpoint.parameters && (
                            <div className="mb-4">
                              <h5 className="font-medium mb-2">Parameters</h5>
                              <div className="space-y-2">
                                {selectedDoc.apiEndpoint.parameters.map(param => (
                                  <div key={param.name} className="flex items-start gap-3 text-sm">
                                    <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                      {param.name}
                                    </code>
                                    <Badge variant="outline">{param.type}</Badge>
                                    {param.required && <Badge className="bg-red-100 text-red-700">Required</Badge>}
                                    <span className="text-gray-500">{param.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedDoc.apiEndpoint.responseExample && (
                            <div>
                              <h5 className="font-medium mb-2">Response Example</h5>
                              <div className="relative">
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                  <code>{selectedDoc.apiEndpoint.responseExample}</code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                  onClick={() => copyCode(selectedDoc.apiEndpoint!.responseExample!, 'response')}
                                >
                                  {copiedCode === 'response' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Code Examples */}
                    {selectedDoc.codeExamples.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Code Examples</h4>
                        <div className="space-y-4">
                          {selectedDoc.codeExamples.map((example, i) => (
                            <div key={i}>
                              {example.title && (
                                <div className="text-sm font-medium mb-2">{example.title}</div>
                              )}
                              <div className="relative">
                                <div className="absolute top-2 right-2 flex items-center gap-2">
                                  <Badge variant="secondary">{example.language}</Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-white"
                                    onClick={() => copyCode(example.code, `code-${i}`)}
                                  >
                                    {copiedCode === `code-${i}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  </Button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                  <code>{example.code}</code>
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Was this helpful?</h4>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="gap-2" onClick={async () => {
                            try {
                              const response = await fetch(`/api/docs/${selectedDoc.id}/feedback`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ helpful: true })
                              })
                              if (response.ok) {
                                toast.success('Thanks for your feedback!')
                              }
                            } catch {
                              toast.error('Failed to submit feedback')
                            }
                          }}>
                            <ThumbsUp className="h-4 w-4" />
                            Yes ({selectedDoc.feedback.helpful})
                          </Button>
                          <Button variant="outline" className="gap-2" onClick={async () => {
                            try {
                              const response = await fetch(`/api/docs/${selectedDoc.id}/feedback`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ helpful: false })
                              })
                              if (response.ok) {
                                toast.success('Thanks for your feedback!')
                              }
                            } catch {
                              toast.error('Failed to submit feedback')
                            }
                          }}>
                            <ThumbsDown className="h-4 w-4" />
                            No ({selectedDoc.feedback.notHelpful})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Related Docs */}
                    {selectedDoc.relatedDocs.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Related Documentation</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedDoc.relatedDocs.map(relId => {
                            const relDoc = docs.find(d => d.id === relId)
                            if (!relDoc) return null
                            return (
                              <Card
                                key={relId}
                                className="cursor-pointer hover:shadow-md"
                                onClick={() => setSelectedDoc(relDoc)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getCategoryIcon(relDoc.category)}
                                    <span className="font-medium">{relDoc.title}</span>
                                  </div>
                                  <p className="text-sm text-gray-500 line-clamp-1">{relDoc.description}</p>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          <Hash className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
