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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  Plus,
  MessageSquare,
  FileText,
  Video,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Share2,
  Edit,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Star,
  StarOff,
  MoreHorizontal,
  Search,
  Filter,
  Grid,
  List,
  Layers,
  Layout,
  Image,
  Square,
  Circle,
  Type,
  Pencil,
  MousePointer,
  Hand,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Download,
  Upload,
  Settings,
  Palette,
  Shapes,
  StickyNote,
  ArrowRight,
  Link2,
  GitBranch,
  History,
  MessageCircle,
  AtSign,
  Play,
  Pause,
  Timer,
  Presentation,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  FolderOpen,
  Home,
  ChevronRight,
  LayoutTemplate,
  Sparkles,
  Wand2,
  Crown
} from 'lucide-react'

// Types
type BoardType = 'whiteboard' | 'flowchart' | 'mindmap' | 'wireframe' | 'kanban' | 'brainstorm' | 'retrospective'
type BoardStatus = 'active' | 'archived' | 'template'
type AccessLevel = 'view' | 'comment' | 'edit' | 'admin'
type ElementType = 'shape' | 'sticky' | 'text' | 'image' | 'frame' | 'connector' | 'drawing'

interface BoardMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: AccessLevel
  isOnline: boolean
  cursorColor: string
  lastActive: string
}

interface Board {
  id: string
  name: string
  description?: string
  type: BoardType
  status: BoardStatus
  thumbnail?: string
  createdAt: string
  updatedAt: string
  createdBy: BoardMember
  members: BoardMember[]
  isStarred: boolean
  isLocked: boolean
  isPublic: boolean
  viewCount: number
  commentCount: number
  elementCount: number
  version: number
  tags: string[]
  teamId?: string
  teamName?: string
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  type: BoardType
  thumbnail: string
  usageCount: number
  rating: number
  isPremium: boolean
  author: string
}

interface Team {
  id: string
  name: string
  avatar?: string
  memberCount: number
  boardCount: number
  plan: 'free' | 'starter' | 'business' | 'enterprise'
  role: 'owner' | 'admin' | 'member' | 'guest'
}

interface Comment {
  id: string
  boardId: string
  author: BoardMember
  content: string
  createdAt: string
  resolved: boolean
  replies: Comment[]
  position: { x: number; y: number }
  elementId?: string
}

interface Activity {
  id: string
  boardId: string
  user: BoardMember
  action: 'created' | 'edited' | 'commented' | 'shared' | 'archived' | 'restored' | 'deleted'
  description: string
  timestamp: string
}

// Mock Data
const mockMembers: BoardMember[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', avatar: '', role: 'admin', isOnline: true, cursorColor: '#3B82F6', lastActive: '2024-01-15T14:30:00Z' },
  { id: '2', name: 'Mike Johnson', email: 'mike@example.com', avatar: '', role: 'edit', isOnline: true, cursorColor: '#10B981', lastActive: '2024-01-15T14:28:00Z' },
  { id: '3', name: 'Emily Davis', email: 'emily@example.com', avatar: '', role: 'edit', isOnline: false, cursorColor: '#F59E0B', lastActive: '2024-01-15T12:00:00Z' },
  { id: '4', name: 'Alex Kim', email: 'alex@example.com', avatar: '', role: 'comment', isOnline: true, cursorColor: '#EF4444', lastActive: '2024-01-15T14:25:00Z' }
]

const mockBoards: Board[] = [
  {
    id: '1',
    name: 'Product Roadmap 2024',
    description: 'Strategic planning and feature prioritization for Q1-Q4',
    type: 'kanban',
    status: 'active',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    createdBy: mockMembers[0],
    members: mockMembers,
    isStarred: true,
    isLocked: false,
    isPublic: false,
    viewCount: 245,
    commentCount: 32,
    elementCount: 156,
    version: 47,
    tags: ['roadmap', 'planning', 'product'],
    teamId: 't1',
    teamName: 'Product Team'
  },
  {
    id: '2',
    name: 'User Flow Diagrams',
    description: 'Main user journeys and interaction flows',
    type: 'flowchart',
    status: 'active',
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    createdBy: mockMembers[1],
    members: [mockMembers[0], mockMembers[1], mockMembers[2]],
    isStarred: true,
    isLocked: false,
    isPublic: true,
    viewCount: 189,
    commentCount: 18,
    elementCount: 89,
    version: 23,
    tags: ['ux', 'flows', 'design'],
    teamId: 't2',
    teamName: 'Design Team'
  },
  {
    id: '3',
    name: 'Sprint Retrospective',
    description: 'Team reflection on Sprint 24',
    type: 'retrospective',
    status: 'active',
    createdAt: '2024-01-14T15:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: mockMembers[2],
    members: mockMembers,
    isStarred: false,
    isLocked: false,
    isPublic: false,
    viewCount: 56,
    commentCount: 45,
    elementCount: 67,
    version: 12,
    tags: ['agile', 'retro', 'team'],
    teamId: 't1',
    teamName: 'Product Team'
  },
  {
    id: '4',
    name: 'Brainstorm: New Features',
    description: 'Ideation session for Q2 feature set',
    type: 'brainstorm',
    status: 'active',
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    createdBy: mockMembers[0],
    members: [mockMembers[0], mockMembers[1]],
    isStarred: false,
    isLocked: false,
    isPublic: false,
    viewCount: 78,
    commentCount: 23,
    elementCount: 134,
    version: 18,
    tags: ['ideation', 'features', 'brainstorm'],
    teamId: 't1',
    teamName: 'Product Team'
  },
  {
    id: '5',
    name: 'System Architecture',
    description: 'Technical architecture and infrastructure diagrams',
    type: 'flowchart',
    status: 'archived',
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-01-05T16:00:00Z',
    createdBy: mockMembers[3],
    members: [mockMembers[2], mockMembers[3]],
    isStarred: false,
    isLocked: true,
    isPublic: false,
    viewCount: 312,
    commentCount: 56,
    elementCount: 198,
    version: 89,
    tags: ['architecture', 'technical', 'infrastructure'],
    teamId: 't3',
    teamName: 'Engineering'
  }
]

const mockTemplates: Template[] = [
  { id: 't1', name: 'Product Roadmap', description: 'Timeline-based product planning', category: 'Strategy', type: 'kanban', thumbnail: '', usageCount: 12500, rating: 4.8, isPremium: false, author: 'Miro' },
  { id: 't2', name: 'User Story Map', description: 'Map user journeys and stories', category: 'Agile', type: 'whiteboard', thumbnail: '', usageCount: 8900, rating: 4.7, isPremium: false, author: 'Miro' },
  { id: 't3', name: 'Sprint Retrospective', description: '4Ls retrospective format', category: 'Agile', type: 'retrospective', thumbnail: '', usageCount: 15200, rating: 4.9, isPremium: false, author: 'Miro' },
  { id: 't4', name: 'Mind Map', description: 'Organize ideas visually', category: 'Brainstorming', type: 'mindmap', thumbnail: '', usageCount: 22100, rating: 4.6, isPremium: false, author: 'Miro' },
  { id: 't5', name: 'Customer Journey Map', description: 'End-to-end customer experience', category: 'UX Research', type: 'flowchart', thumbnail: '', usageCount: 9800, rating: 4.8, isPremium: true, author: 'Miro' },
  { id: 't6', name: 'Wireframe Kit', description: 'Low-fidelity UI components', category: 'Design', type: 'wireframe', thumbnail: '', usageCount: 18400, rating: 4.7, isPremium: true, author: 'Miro' }
]

const mockTeams: Team[] = [
  { id: 't1', name: 'Product Team', memberCount: 12, boardCount: 24, plan: 'business', role: 'admin' },
  { id: 't2', name: 'Design Team', memberCount: 8, boardCount: 18, plan: 'business', role: 'member' },
  { id: 't3', name: 'Engineering', memberCount: 25, boardCount: 42, plan: 'enterprise', role: 'member' }
]

const mockActivities: Activity[] = [
  { id: 'a1', boardId: '1', user: mockMembers[0], action: 'edited', description: 'Updated roadmap timeline', timestamp: '2024-01-15T14:30:00Z' },
  { id: 'a2', boardId: '1', user: mockMembers[1], action: 'commented', description: 'Added feedback on Q2 priorities', timestamp: '2024-01-15T14:25:00Z' },
  { id: 'a3', boardId: '2', user: mockMembers[2], action: 'shared', description: 'Shared with external stakeholders', timestamp: '2024-01-15T11:20:00Z' },
  { id: 'a4', boardId: '3', user: mockMembers[0], action: 'created', description: 'Created new retrospective board', timestamp: '2024-01-14T15:00:00Z' },
  { id: 'a5', boardId: '4', user: mockMembers[1], action: 'edited', description: 'Added new feature ideas', timestamp: '2024-01-15T09:30:00Z' }
]

export default function CollaborationClient() {
  const [activeTab, setActiveTab] = useState('boards')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<BoardStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<BoardType | 'all'>('all')
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const filteredBoards = useMemo(() => {
    return mockBoards.filter(board => {
      const matchesSearch = board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           board.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           board.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || board.status === statusFilter
      const matchesType = typeFilter === 'all' || board.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  const starredBoards = filteredBoards.filter(b => b.isStarred)
  const recentBoards = filteredBoards.slice(0, 4)

  const getBoardTypeIcon = (type: BoardType) => {
    switch (type) {
      case 'whiteboard': return <Square className="w-4 h-4" />
      case 'flowchart': return <GitBranch className="w-4 h-4" />
      case 'mindmap': return <Sparkles className="w-4 h-4" />
      case 'wireframe': return <Layout className="w-4 h-4" />
      case 'kanban': return <Layers className="w-4 h-4" />
      case 'brainstorm': return <Wand2 className="w-4 h-4" />
      case 'retrospective': return <MessageCircle className="w-4 h-4" />
      default: return <Square className="w-4 h-4" />
    }
  }

  const getBoardTypeColor = (type: BoardType) => {
    switch (type) {
      case 'whiteboard': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'flowchart': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'mindmap': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'wireframe': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'kanban': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'brainstorm': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'retrospective': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: BoardStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'archived': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'template': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return then.toLocaleDateString()
  }

  const stats = {
    totalBoards: mockBoards.length,
    activeBoards: mockBoards.filter(b => b.status === 'active').length,
    totalMembers: new Set(mockBoards.flatMap(b => b.members.map(m => m.id))).size,
    onlineNow: mockMembers.filter(m => m.isOnline).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Collaboration Hub</h1>
                <p className="text-white/80">Visual collaboration for teams</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button className="bg-white text-indigo-700 hover:bg-white/90">
                <Plus className="w-4 h-4 mr-2" />
                New Board
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Layout className="w-4 h-4" />
                <span className="text-sm">Total Boards</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalBoards}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-300">{stats.activeBoards}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Team Members</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm">Online Now</span>
              </div>
              <p className="text-2xl font-bold text-green-300">{stats.onlineNow}</p>
            </div>
          </div>
        </div>

        {/* Online Members */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Online now:</span>
                <div className="flex -space-x-2">
                  {mockMembers.filter(m => m.isOnline).map(member => (
                    <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
                      <AvatarFallback style={{ backgroundColor: member.cursorColor }} className="text-white text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {mockMembers.filter(m => m.isOnline).length} collaborating
                </span>
              </div>
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4 mr-2" />
                Start Video Call
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="boards" className="rounded-lg">
              <Layout className="w-4 h-4 mr-2" />
              Boards
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg">
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="teams" className="rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg">
              <History className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Boards Tab */}
          <TabsContent value="boards" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search boards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <select
                      className="text-sm border rounded-md px-2 py-1 bg-background"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as BoardType | 'all')}
                    >
                      <option value="all">All Types</option>
                      <option value="whiteboard">Whiteboard</option>
                      <option value="flowchart">Flowchart</option>
                      <option value="mindmap">Mind Map</option>
                      <option value="wireframe">Wireframe</option>
                      <option value="kanban">Kanban</option>
                      <option value="brainstorm">Brainstorm</option>
                      <option value="retrospective">Retrospective</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {(['all', 'active', 'archived'] as const).map(status => (
                      <Button
                        key={status}
                        variant={statusFilter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Starred Boards */}
            {starredBoards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Starred Boards
                </h3>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-3'}>
                  {starredBoards.map(board => (
                    <BoardCard key={board.id} board={board} viewMode={viewMode} onSelect={setSelectedBoard} formatTimeAgo={formatTimeAgo} getBoardTypeIcon={getBoardTypeIcon} getBoardTypeColor={getBoardTypeColor} />
                  ))}
                </div>
              </div>
            )}

            {/* All Boards */}
            <div>
              <h3 className="text-lg font-semibold mb-3">All Boards</h3>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-3'}>
                {filteredBoards.map(board => (
                  <BoardCard key={board.id} board={board} viewMode={viewMode} onSelect={setSelectedBoard} formatTimeAgo={formatTimeAgo} getBoardTypeIcon={getBoardTypeIcon} getBoardTypeColor={getBoardTypeColor} />
                ))}
              </div>

              {filteredBoards.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                  <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No boards found</h3>
                  <p className="text-muted-foreground mb-4">Create your first collaboration board</p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Board
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Templates Gallery</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <select className="text-sm border rounded-md px-2 py-1 bg-background">
                  <option>All Categories</option>
                  <option>Strategy</option>
                  <option>Agile</option>
                  <option>Brainstorming</option>
                  <option>UX Research</option>
                  <option>Design</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-lg flex items-center justify-center relative">
                      {getBoardTypeIcon(template.type)}
                      {template.isPremium && (
                        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.category}</p>
                        </div>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {template.usageCount.toLocaleString()} uses
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          {template.rating}
                        </span>
                      </div>
                      <Button className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Teams</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTeams.map(team => (
                <Card key={team.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {team.name.split(' ').map(w => w[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{team.name}</h4>
                        <Badge variant="outline" className="text-xs capitalize">{team.role}</Badge>
                      </div>
                      <Badge className={
                        team.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                        team.plan === 'business' ? 'bg-blue-100 text-blue-700' :
                        team.plan === 'starter' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {team.plan}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">{team.memberCount}</p>
                        <p className="text-muted-foreground">Members</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">{team.boardCount}</p>
                        <p className="text-muted-foreground">Boards</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <FolderOpen className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {mockActivities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback style={{ backgroundColor: activity.user.cursorColor }} className="text-white text-xs">
                            {activity.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{activity.user.name}</span>
                            <span className="text-muted-foreground">
                              {activity.action === 'created' && 'created'}
                              {activity.action === 'edited' && 'edited'}
                              {activity.action === 'commented' && 'commented on'}
                              {activity.action === 'shared' && 'shared'}
                              {activity.action === 'archived' && 'archived'}
                              {activity.action === 'restored' && 'restored'}
                              {activity.action === 'deleted' && 'deleted'}
                            </span>
                            <span className="font-medium text-blue-600">
                              {mockBoards.find(b => b.id === activity.boardId)?.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Board Card Component
function BoardCard({
  board,
  viewMode,
  onSelect,
  formatTimeAgo,
  getBoardTypeIcon,
  getBoardTypeColor
}: {
  board: Board
  viewMode: 'grid' | 'list'
  onSelect: (board: Board) => void
  formatTimeAgo: (date: string) => string
  getBoardTypeIcon: (type: BoardType) => JSX.Element
  getBoardTypeColor: (type: BoardType) => string
}) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
              {getBoardTypeIcon(board.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {board.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                <h4 className="font-semibold">{board.name}</h4>
                <Badge className={getBoardTypeColor(board.type)}>{board.type}</Badge>
                {board.isLocked && <Lock className="w-3 h-3 text-gray-400" />}
                {board.isPublic && <Eye className="w-3 h-3 text-gray-400" />}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{board.description}</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {board.members.slice(0, 3).map(member => (
                  <Avatar key={member.id} className="w-6 h-6 border-2 border-white">
                    <AvatarFallback style={{ backgroundColor: member.cursorColor }} className="text-white text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {board.members.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                    +{board.members.length - 3}
                  </div>
                )}
              </div>
              <span>{formatTimeAgo(board.updatedAt)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onSelect(board)}>
              Open
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onSelect(board)}>
      <CardContent className="p-0">
        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-lg flex items-center justify-center relative">
          {getBoardTypeIcon(board.type)}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {board.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
            {board.isLocked && <Lock className="w-3 h-3 text-gray-400" />}
          </div>
          {board.members.some(m => m.isOnline) && (
            <div className="absolute bottom-2 left-2 flex -space-x-1">
              {board.members.filter(m => m.isOnline).slice(0, 3).map(member => (
                <div key={member.id} className="w-2 h-2 rounded-full border border-white" style={{ backgroundColor: member.cursorColor }} />
              ))}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold line-clamp-1">{board.name}</h4>
              <Badge className={`text-xs ${getBoardTypeColor(board.type)}`}>{board.type}</Badge>
            </div>
          </div>
          {board.teamName && (
            <p className="text-xs text-muted-foreground mb-2">{board.teamName}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {board.members.length}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {board.commentCount}
              </span>
            </div>
            <span>{formatTimeAgo(board.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
