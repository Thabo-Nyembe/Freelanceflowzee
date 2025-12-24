'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  FileText, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Star,
  Clock, Users, BookOpen, FolderOpen, ChevronRight, ChevronDown, Home, File,
  Link2, MessageSquare, History, Share2, Settings, Lock, Globe, Archive,
  Tag, Bookmark, ThumbsUp, ThumbsDown, Copy, ExternalLink, Layers, Grid,
  List, SortAsc, Calendar, User, AlertCircle, CheckCircle2, ArrowLeft
} from 'lucide-react'

// Confluence-level interfaces
interface Space {
  id: string
  key: string
  name: string
  description: string
  icon: string
  type: 'team' | 'personal' | 'global'
  permissions: 'public' | 'restricted' | 'private'
  owner: string
  members: number
  pagesCount: number
  lastUpdated: string
}

interface Page {
  id: string
  spaceKey: string
  title: string
  content: string
  excerpt: string
  status: 'current' | 'draft' | 'archived' | 'trashed'
  author: {
    name: string
    avatar: string
  }
  contributors: { name: string; avatar: string }[]
  createdAt: string
  updatedAt: string
  version: number
  parentId?: string
  children: string[]
  labels: string[]
  likes: number
  comments: number
  views: number
  isBookmarked: boolean
  isWatching: boolean
  restrictions?: 'view' | 'edit'
}

interface Comment {
  id: string
  pageId: string
  author: {
    name: string
    avatar: string
  }
  content: string
  createdAt: string
  isResolved: boolean
  replies: Comment[]
}

interface PageVersion {
  version: number
  author: string
  changedAt: string
  changeMessage: string
  isMinor: boolean
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: string
  usageCount: number
}

// Mock spaces
const mockSpaces: Space[] = [
  {
    id: 'space1',
    key: 'ENG',
    name: 'Engineering',
    description: 'Technical documentation and architecture decisions',
    icon: '🔧',
    type: 'team',
    permissions: 'restricted',
    owner: 'Sarah Chen',
    members: 24,
    pagesCount: 156,
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: 'space2',
    key: 'PROD',
    name: 'Product',
    description: 'Product requirements, specs, and roadmaps',
    icon: '📦',
    type: 'team',
    permissions: 'restricted',
    owner: 'Mike Johnson',
    members: 18,
    pagesCount: 89,
    lastUpdated: '2024-01-15T09:45:00Z'
  },
  {
    id: 'space3',
    key: 'DESIGN',
    name: 'Design System',
    description: 'UI components, patterns, and guidelines',
    icon: '🎨',
    type: 'global',
    permissions: 'public',
    owner: 'Emma Davis',
    members: 45,
    pagesCount: 234,
    lastUpdated: '2024-01-15T11:00:00Z'
  },
  {
    id: 'space4',
    key: 'HR',
    name: 'HR & People',
    description: 'Policies, onboarding, and culture',
    icon: '👥',
    type: 'team',
    permissions: 'restricted',
    owner: 'Alex Kim',
    members: 12,
    pagesCount: 67,
    lastUpdated: '2024-01-14T16:30:00Z'
  },
  {
    id: 'space5',
    key: 'ALEX',
    name: "Alex's Notes",
    description: 'Personal workspace',
    icon: '📝',
    type: 'personal',
    permissions: 'private',
    owner: 'Alex Kim',
    members: 1,
    pagesCount: 23,
    lastUpdated: '2024-01-15T08:00:00Z'
  }
]

// Mock pages
const mockPages: Page[] = [
  {
    id: 'page1',
    spaceKey: 'ENG',
    title: 'API Architecture Overview',
    content: '# API Architecture\n\nOur API follows RESTful principles...',
    excerpt: 'Comprehensive overview of our API architecture and design decisions',
    status: 'current',
    author: { name: 'Sarah Chen', avatar: '' },
    contributors: [
      { name: 'Mike Johnson', avatar: '' },
      { name: 'Emma Davis', avatar: '' }
    ],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    version: 12,
    children: ['page2', 'page3'],
    labels: ['architecture', 'api', 'documentation'],
    likes: 24,
    comments: 8,
    views: 1250,
    isBookmarked: true,
    isWatching: true
  },
  {
    id: 'page2',
    spaceKey: 'ENG',
    title: 'Authentication Endpoints',
    content: '# Authentication\n\nOAuth 2.0 implementation details...',
    excerpt: 'Guide to authentication endpoints and OAuth flow',
    status: 'current',
    author: { name: 'Mike Johnson', avatar: '' },
    contributors: [],
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
    version: 5,
    parentId: 'page1',
    children: [],
    labels: ['auth', 'security', 'oauth'],
    likes: 18,
    comments: 3,
    views: 890,
    isBookmarked: false,
    isWatching: false
  },
  {
    id: 'page3',
    spaceKey: 'ENG',
    title: 'Database Schema',
    content: '# Database Schema\n\nPostgreSQL schema design...',
    excerpt: 'Database schema documentation and ER diagrams',
    status: 'draft',
    author: { name: 'Emma Davis', avatar: '' },
    contributors: [{ name: 'Sarah Chen', avatar: '' }],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    version: 3,
    parentId: 'page1',
    children: [],
    labels: ['database', 'postgresql', 'schema'],
    likes: 5,
    comments: 12,
    views: 340,
    isBookmarked: true,
    isWatching: true,
    restrictions: 'edit'
  },
  {
    id: 'page4',
    spaceKey: 'PROD',
    title: 'Q1 2024 Roadmap',
    content: '# Q1 Roadmap\n\nKey initiatives for Q1...',
    excerpt: 'Product roadmap and milestones for Q1 2024',
    status: 'current',
    author: { name: 'Mike Johnson', avatar: '' },
    contributors: [],
    createdAt: '2023-12-20T10:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
    version: 8,
    children: [],
    labels: ['roadmap', 'planning', 'q1'],
    likes: 45,
    comments: 15,
    views: 2100,
    isBookmarked: false,
    isWatching: true
  }
]

// Mock templates
const mockTemplates: Template[] = [
  { id: 't1', name: 'Meeting Notes', description: 'Standard meeting notes template', category: 'Meetings', icon: '📋', usageCount: 234 },
  { id: 't2', name: 'Technical Design Doc', description: 'RFC-style design document', category: 'Engineering', icon: '📐', usageCount: 156 },
  { id: 't3', name: 'How-To Guide', description: 'Step-by-step tutorial', category: 'Documentation', icon: '📖', usageCount: 189 },
  { id: 't4', name: 'Decision Log', description: 'Track decisions and rationale', category: 'Project', icon: '🎯', usageCount: 78 },
  { id: 't5', name: 'Retrospective', description: 'Sprint retrospective template', category: 'Agile', icon: '🔄', usageCount: 145 },
  { id: 't6', name: 'Product Requirements', description: 'PRD template', category: 'Product', icon: '📦', usageCount: 112 }
]

// Mock versions
const mockVersions: PageVersion[] = [
  { version: 12, author: 'Sarah Chen', changedAt: '2024-01-15T10:30:00Z', changeMessage: 'Updated API versioning section', isMinor: false },
  { version: 11, author: 'Mike Johnson', changedAt: '2024-01-14T15:00:00Z', changeMessage: 'Fixed typos', isMinor: true },
  { version: 10, author: 'Sarah Chen', changedAt: '2024-01-12T11:00:00Z', changeMessage: 'Added rate limiting docs', isMinor: false },
  { version: 9, author: 'Emma Davis', changedAt: '2024-01-10T09:00:00Z', changeMessage: 'Updated diagrams', isMinor: false }
]

export default function DocumentationClient() {
  const [activeTab, setActiveTab] = useState('spaces')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [expandedPages, setExpandedPages] = useState<string[]>(['page1'])

  const getSpaceTypeColor = (type: Space['type']) => {
    switch (type) {
      case 'team': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'personal': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'global': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
  }

  const getStatusColor = (status: Page['status']) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'archived': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'trashed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  const togglePageExpand = (pageId: string) => {
    setExpandedPages(prev =>
      prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
    )
  }

  const recentPages = mockPages.slice(0, 5)
  const starredPages = mockPages.filter(p => p.isBookmarked)

  const stats = useMemo(() => ({
    totalSpaces: mockSpaces.length,
    totalPages: mockPages.length,
    totalViews: mockPages.reduce((sum, p) => sum + p.views, 0),
    recentUpdates: mockPages.filter(p => new Date(p.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  }), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Documentation</h1>
                <p className="text-purple-100">Confluence-level Knowledge Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  placeholder="Search docs..."
                  className="w-80 bg-white/10 border-white/20 text-white placeholder:text-white/60 pl-10"
                />
              </div>
              <Button className="bg-white text-purple-600 hover:bg-purple-50">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-purple-200" />
                <div>
                  <p className="text-sm text-purple-200">Spaces</p>
                  <p className="text-2xl font-bold">{stats.totalSpaces}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-200" />
                <div>
                  <p className="text-sm text-purple-200">Pages</p>
                  <p className="text-2xl font-bold">{stats.totalPages}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-purple-200" />
                <div>
                  <p className="text-sm text-purple-200">Total Views</p>
                  <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-200" />
                <div>
                  <p className="text-sm text-purple-200">Updated This Week</p>
                  <p className="text-2xl font-bold">{stats.recentUpdates}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Quick Access
              </h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Recent
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Starred
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Drafts
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Archive className="w-4 h-4 mr-2" />
                  Archived
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Spaces
              </h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {mockSpaces.map(space => (
                    <Button
                      key={space.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedSpace(space)}
                    >
                      <span className="mr-2">{space.icon}</span>
                      <span className="flex-1 text-left truncate">{space.name}</span>
                      <span className="text-xs text-gray-500">{space.pagesCount}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
              <Button variant="outline" className="w-full mt-3">
                <Plus className="w-4 h-4 mr-2" />
                Create Space
              </Button>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Starred Pages
              </h3>
              <div className="space-y-2">
                {starredPages.map(page => (
                  <div key={page.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm truncate flex-1">{page.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="spaces">Spaces</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="search">Search</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-gray-100' : ''}>
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-gray-100' : ''}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Spaces Tab */}
              <TabsContent value="spaces" className="space-y-4">
                <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
                  {mockSpaces.map(space => (
                    <Card key={space.id} className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                      <div className={viewMode === 'list' ? 'flex items-center gap-4 flex-1' : ''}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{space.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{space.name}</h3>
                              <Badge variant="outline" className="text-xs">{space.key}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">{space.description}</p>
                          </div>
                        </div>

                        <div className={`flex items-center gap-4 text-sm ${viewMode === 'list' ? '' : 'mb-4'}`}>
                          <Badge className={getSpaceTypeColor(space.type)}>{space.type}</Badge>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Users className="w-4 h-4" />
                            {space.members}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <FileText className="w-4 h-4" />
                            {space.pagesCount}
                          </div>
                          {space.permissions === 'private' && <Lock className="w-4 h-4 text-gray-400" />}
                          {space.permissions === 'public' && <Globe className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>

                      {viewMode === 'grid' && (
                        <div className="pt-4 border-t flex items-center justify-between text-sm">
                          <span className="text-gray-500">Updated {new Date(space.lastUpdated).toLocaleDateString()}</span>
                          <Button variant="outline" size="sm">Open</Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Recent Tab */}
              <TabsContent value="recent" className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Recently Updated</h2>
                <div className="space-y-3">
                  {mockPages.map(page => (
                    <Card key={page.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{page.title}</h3>
                              <Badge className={getStatusColor(page.status)}>{page.status}</Badge>
                              {page.restrictions && <Lock className="w-4 h-4 text-gray-400" />}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{page.excerpt}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-[8px]">{page.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {page.author.name}
                              </span>
                              <span>v{page.version}</span>
                              <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {page.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {page.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {page.comments}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedPage(page); setShowVersionHistory(true); }}>
                            <History className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {page.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 ml-12">
                          {page.labels.map(label => (
                            <Badge key={label} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Page Templates</h2>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {mockTemplates.map(template => (
                    <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-xs text-gray-500">{template.category}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Used {template.usageCount} times</span>
                        <Button variant="outline" size="sm">Use</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Search Tab */}
              <TabsContent value="search" className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input placeholder="Search all documentation..." className="pl-12 h-12 text-lg" />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="outline" size="sm">Pages</Button>
                  <Button variant="outline" size="sm">Spaces</Button>
                  <Button variant="outline" size="sm">Attachments</Button>
                  <Button variant="outline" size="sm">Comments</Button>
                </div>

                <Card className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Search Documentation</h3>
                  <p className="text-gray-500">Enter a search term to find pages, spaces, and more</p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          {selectedPage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">{selectedPage.title}</h3>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockVersions.map((version, index) => (
                    <div key={version.version} className={`p-4 rounded-lg border ${index === 0 ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={index === 0 ? 'default' : 'outline'}>v{version.version}</Badge>
                          {version.isMinor && <Badge variant="outline" className="text-xs">Minor edit</Badge>}
                          {index === 0 && <Badge className="bg-green-100 text-green-700">Current</Badge>}
                        </div>
                        <span className="text-sm text-gray-500">{new Date(version.changedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm mb-2">{version.changeMessage}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">by {version.author}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">View</Button>
                          {index > 0 && <Button variant="ghost" size="sm">Restore</Button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
