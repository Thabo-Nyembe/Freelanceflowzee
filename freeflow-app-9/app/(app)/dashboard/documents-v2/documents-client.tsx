'use client'

import { useState, useCallback, useMemo } from 'react'
import { useDocuments, type Document, type DocumentType, type DocumentStatus } from '@/lib/hooks/use-documents'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI } from '@/components/ui/results-display'
import { GradientButton, PillButton, ModernButton } from '@/components/ui/modern-buttons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FileText, Upload, Download, Eye, Share2, CheckCircle, Clock, XCircle,
  Plus, Search, Filter, MoreHorizontal, Folder, FolderOpen, File,
  Star, StarOff, Lock, Users, Globe, History, MessageSquare, Link2,
  Copy, Trash2, Edit3, ChevronRight, ChevronDown, Grid3X3, List, LayoutGrid,
  Calendar, Table, Kanban, Image as ImageIcon, Code, Type, Hash, ListTodo,
  Quote, Minus, ArrowUpRight, Settings, Bookmark, Archive, Tag, Layers,
  Home, ChevronLeft, Sparkles, Wand2, BookOpen, FileCode, Presentation
} from 'lucide-react'

// Notion-style interfaces
interface Page {
  id: string
  title: string
  icon?: string
  cover?: string
  parentId?: string
  type: 'page' | 'database'
  properties?: Record<string, any>
  content?: Block[]
  createdAt: string
  updatedAt: string
  createdBy: string
  shared: boolean
  starred: boolean
  archived: boolean
}

interface Block {
  id: string
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bulletList' | 'numberedList' | 'todo' | 'toggle' | 'code' | 'quote' | 'divider' | 'image' | 'callout' | 'table'
  content: string
  checked?: boolean
  children?: Block[]
  language?: string
}

interface Template {
  id: string
  name: string
  description: string
  icon: string
  category: string
  blocks: Block[]
}

interface Collaborator {
  id: string
  name: string
  email: string
  avatar: string
  role: 'owner' | 'editor' | 'viewer' | 'commenter'
  addedAt: string
}

interface Comment {
  id: string
  user: string
  avatar: string
  content: string
  resolved: boolean
  createdAt: string
  replies?: Comment[]
}

interface VersionHistory {
  id: string
  version: number
  user: string
  avatar: string
  changes: string
  createdAt: string
}

// Mock data
const mockPages: Page[] = [
  { id: '1', title: 'Product Roadmap 2024', icon: '🗺️', type: 'page', createdAt: '2024-03-01', updatedAt: '2024-03-15', createdBy: 'John', shared: true, starred: true, archived: false },
  { id: '2', title: 'Team Wiki', icon: '📚', type: 'page', createdAt: '2024-02-15', updatedAt: '2024-03-14', createdBy: 'Sarah', shared: true, starred: false, archived: false },
  { id: '3', title: 'Project Tracker', icon: '📊', type: 'database', createdAt: '2024-01-20', updatedAt: '2024-03-13', createdBy: 'Mike', shared: true, starred: true, archived: false },
  { id: '4', title: 'Meeting Notes', icon: '📝', type: 'page', parentId: '2', createdAt: '2024-03-10', updatedAt: '2024-03-12', createdBy: 'Emily', shared: false, starred: false, archived: false },
  { id: '5', title: 'Design System', icon: '🎨', type: 'page', createdAt: '2024-02-01', updatedAt: '2024-03-11', createdBy: 'Alex', shared: true, starred: false, archived: false },
  { id: '6', title: 'Q1 OKRs', icon: '🎯', type: 'database', createdAt: '2024-01-01', updatedAt: '2024-03-10', createdBy: 'John', shared: true, starred: true, archived: false },
]

const mockTemplates: Template[] = [
  { id: '1', name: 'Meeting Notes', description: 'Capture discussion points, decisions, and action items', icon: '📝', category: 'Meetings', blocks: [] },
  { id: '2', name: 'Project Brief', description: 'Define project scope, goals, and timeline', icon: '📋', category: 'Projects', blocks: [] },
  { id: '3', name: 'Weekly Review', description: 'Reflect on accomplishments and plan ahead', icon: '📅', category: 'Planning', blocks: [] },
  { id: '4', name: 'Product Spec', description: 'Document product requirements and features', icon: '📦', category: 'Product', blocks: [] },
  { id: '5', name: 'Bug Report', description: 'Track and document software issues', icon: '🐛', category: 'Engineering', blocks: [] },
  { id: '6', name: 'Design Doc', description: 'Outline design decisions and rationale', icon: '🎨', category: 'Design', blocks: [] },
]

const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'John Developer', email: 'john@freeflow.io', avatar: 'john', role: 'owner', addedAt: '2024-01-01' },
  { id: '2', name: 'Sarah Designer', email: 'sarah@freeflow.io', avatar: 'sarah', role: 'editor', addedAt: '2024-01-15' },
  { id: '3', name: 'Mike Engineer', email: 'mike@freeflow.io', avatar: 'mike', role: 'editor', addedAt: '2024-02-01' },
  { id: '4', name: 'Emily PM', email: 'emily@freeflow.io', avatar: 'emily', role: 'commenter', addedAt: '2024-02-15' },
]

const mockComments: Comment[] = [
  { id: '1', user: 'Sarah Designer', avatar: 'sarah', content: 'Can we add more details about the timeline?', resolved: false, createdAt: '2024-03-14T10:00:00Z' },
  { id: '2', user: 'Mike Engineer', avatar: 'mike', content: 'Good point! I\'ll update this section.', resolved: true, createdAt: '2024-03-13T14:30:00Z' },
  { id: '3', user: 'Emily PM', avatar: 'emily', content: 'This looks great, let\'s schedule a review meeting.', resolved: false, createdAt: '2024-03-12T09:15:00Z' },
]

const mockVersionHistory: VersionHistory[] = [
  { id: '1', version: 5, user: 'John Developer', avatar: 'john', changes: 'Updated roadmap timeline', createdAt: '2024-03-15T10:00:00Z' },
  { id: '2', version: 4, user: 'Sarah Designer', avatar: 'sarah', changes: 'Added design section', createdAt: '2024-03-14T15:30:00Z' },
  { id: '3', version: 3, user: 'Mike Engineer', avatar: 'mike', changes: 'Fixed formatting issues', createdAt: '2024-03-13T11:00:00Z' },
  { id: '4', version: 2, user: 'Emily PM', avatar: 'emily', changes: 'Added project milestones', createdAt: '2024-03-12T09:00:00Z' },
  { id: '5', version: 1, user: 'John Developer', avatar: 'john', changes: 'Initial creation', createdAt: '2024-03-01T10:00:00Z' },
]

// Sample page content blocks
const sampleBlocks: Block[] = [
  { id: '1', type: 'heading1', content: 'Welcome to our Product Roadmap' },
  { id: '2', type: 'paragraph', content: 'This document outlines our product strategy and planned features for 2024.' },
  { id: '3', type: 'heading2', content: 'Q1 Goals' },
  { id: '4', type: 'todo', content: 'Launch new dashboard', checked: true },
  { id: '5', type: 'todo', content: 'Implement real-time collaboration', checked: true },
  { id: '6', type: 'todo', content: 'Add analytics module', checked: false },
  { id: '7', type: 'heading2', content: 'Key Features' },
  { id: '8', type: 'bulletList', content: 'Block-based editor with rich formatting' },
  { id: '9', type: 'bulletList', content: 'Real-time collaboration and comments' },
  { id: '10', type: 'bulletList', content: 'Templates and quick actions' },
  { id: '11', type: 'callout', content: '💡 Tip: Use / to access quick commands and create different block types.' },
  { id: '12', type: 'divider', content: '' },
  { id: '13', type: 'quote', content: 'Great products are built by great teams working together.' },
]

export default function DocumentsClient({ initialDocuments }: { initialDocuments: Document[] }) {
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid')
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['1', '2'])

  const { documents, loading } = useDocuments({ status: statusFilter, type: typeFilter })
  const displayDocuments = (documents && documents.length > 0) ? documents : (initialDocuments || [])

  const filteredPages = useMemo(() => {
    if (!searchQuery) return mockPages.filter(p => !p.archived)
    return mockPages.filter(p =>
      !p.archived && p.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const starredPages = useMemo(() => filteredPages.filter(p => p.starred), [filteredPages])
  const recentPages = useMemo(() =>
    [...filteredPages].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [filteredPages]
  )

  const stats = useMemo(() => [
    {
      label: 'Total Pages',
      value: filteredPages.length.toString(),
      change: 15.2,
      icon: <FileText className="w-5 h-5" />
    },
    {
      label: 'Shared',
      value: filteredPages.filter(p => p.shared).length.toString(),
      change: 8.3,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Templates',
      value: mockTemplates.length.toString(),
      change: 22.7,
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      label: 'Collaborators',
      value: mockCollaborators.length.toString(),
      change: 12.4,
      icon: <Users className="w-5 h-5" />
    }
  ], [filteredPages])

  const getBlockIcon = (type: Block['type']) => {
    switch (type) {
      case 'heading1': return <Type className="w-4 h-4" />
      case 'heading2': return <Type className="w-4 h-4" />
      case 'heading3': return <Type className="w-4 h-4" />
      case 'paragraph': return <Type className="w-4 h-4" />
      case 'bulletList': return <List className="w-4 h-4" />
      case 'numberedList': return <Hash className="w-4 h-4" />
      case 'todo': return <ListTodo className="w-4 h-4" />
      case 'code': return <Code className="w-4 h-4" />
      case 'quote': return <Quote className="w-4 h-4" />
      case 'divider': return <Minus className="w-4 h-4" />
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'callout': return <Sparkles className="w-4 h-4" />
      case 'table': return <Table className="w-4 h-4" />
      default: return <Type className="w-4 h-4" />
    }
  }

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'heading1':
        return <h1 className="text-3xl font-bold mt-8 mb-4">{block.content}</h1>
      case 'heading2':
        return <h2 className="text-2xl font-semibold mt-6 mb-3">{block.content}</h2>
      case 'heading3':
        return <h3 className="text-xl font-medium mt-4 mb-2">{block.content}</h3>
      case 'paragraph':
        return <p className="text-muted-foreground mb-3">{block.content}</p>
      case 'bulletList':
        return (
          <div className="flex items-start gap-2 mb-1 ml-4">
            <span className="mt-2">•</span>
            <span>{block.content}</span>
          </div>
        )
      case 'todo':
        return (
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              checked={block.checked}
              className="w-4 h-4 rounded border-gray-300"
              readOnly
            />
            <span className={block.checked ? 'line-through text-muted-foreground' : ''}>
              {block.content}
            </span>
          </div>
        )
      case 'quote':
        return (
          <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 my-4 italic text-muted-foreground">
            {block.content}
          </blockquote>
        )
      case 'callout':
        return (
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 my-4">
            {block.content}
          </div>
        )
      case 'divider':
        return <hr className="my-6 border-gray-200 dark:border-gray-700" />
      case 'code':
        return (
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto font-mono text-sm">
            <code>{block.content}</code>
          </pre>
        )
      default:
        return <p className="mb-2">{block.content}</p>
    }
  }

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r bg-white dark:bg-gray-800 flex flex-col transition-all`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              Documents
            </h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Quick Actions */}
              <div className="space-y-1">
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Page
                </button>
                <button
                  onClick={() => setShowTemplatesDialog(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  <Wand2 className="w-4 h-4" />
                  Templates
                </button>
              </div>

              {/* Starred */}
              {starredPages.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Starred</h3>
                  <div className="space-y-1">
                    {starredPages.map(page => (
                      <button
                        key={page.id}
                        onClick={() => setSelectedPage(page)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          selectedPage?.id === page.id
                            ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>{page.icon}</span>
                        <span className="truncate">{page.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Pages */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Private</h3>
                <div className="space-y-1">
                  {filteredPages.filter(p => !p.parentId && !p.shared).map(page => (
                    <div key={page.id}>
                      <button
                        onClick={() => setSelectedPage(page)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          selectedPage?.id === page.id
                            ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page.type === 'database' ? (
                          <button onClick={(e) => { e.stopPropagation(); toggleFolder(page.id) }}>
                            {expandedFolders.includes(page.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        ) : null}
                        <span>{page.icon}</span>
                        <span className="truncate">{page.title}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Shared</h3>
                <div className="space-y-1">
                  {filteredPages.filter(p => !p.parentId && p.shared).map(page => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPage(page)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        selectedPage?.id === page.id
                          ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{page.icon}</span>
                      <span className="truncate">{page.title}</span>
                      <Users className="w-3 h-3 ml-auto text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="p-4 border-b bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedPage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
                <span>{selectedPage.icon} {selectedPage.title}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedPage && (
              <>
                <button
                  onClick={() => setShowShareDialog(true)}
                  className="px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-lg text-sm flex items-center gap-1"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => setShowHistoryDialog(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <History className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {selectedPage ? (
            /* Page View */
            <div className="max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                {selectedPage.cover && (
                  <div className="h-48 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg mb-6" />
                )}
                <div className="flex items-start gap-4">
                  <button className="text-6xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2">
                    {selectedPage.icon || '📄'}
                  </button>
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2">{selectedPage.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={`https://avatar.vercel.sh/${selectedPage.createdBy}`} />
                          <AvatarFallback>{selectedPage.createdBy.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {selectedPage.createdBy}
                      </span>
                      <span>Updated {new Date(selectedPage.updatedAt).toLocaleDateString()}</span>
                      {selectedPage.shared && (
                        <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                          <Users className="w-3 h-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Content */}
              <div className="prose dark:prose-invert max-w-none">
                {sampleBlocks.map(block => (
                  <div key={block.id} className="group relative">
                    <div className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        {getBlockIcon(block.type)}
                      </button>
                    </div>
                    {renderBlock(block)}
                  </div>
                ))}
              </div>

              {/* Comments Section */}
              <div className="mt-12 pt-8 border-t">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({mockComments.length})
                </h3>
                <div className="space-y-4">
                  {mockComments.map(comment => (
                    <div key={comment.id} className={`flex gap-3 p-4 rounded-lg ${comment.resolved ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${comment.avatar}`} />
                        <AvatarFallback>{comment.user.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.user}</span>
                          {comment.resolved && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Resolved</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Dashboard View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    Documents
                  </h1>
                  <p className="text-muted-foreground">Notion-style document management and collaboration</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                  </div>
                  <GradientButton from="cyan" to="blue" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    New Page
                  </GradientButton>
                </div>
              </div>

              <StatGrid columns={4} stats={stats} />

              {/* Recent Pages */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Recently Updated</h2>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
                  {recentPages.map(page => (
                    <Card
                      key={page.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedPage(page)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{page.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{page.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
                              {page.shared && <Users className="w-3 h-3" />}
                              {page.starred && <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Templates</h2>
                  <button
                    onClick={() => setShowTemplatesDialog(true)}
                    className="text-sm text-cyan-600 hover:text-cyan-700"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {mockTemplates.map(template => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <span className="text-3xl block mb-2">{template.icon}</span>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{template.category}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>Choose a type or start from scratch</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {[
              { icon: <FileText className="w-6 h-6" />, label: 'Empty Page', desc: 'Start fresh' },
              { icon: <Table className="w-6 h-6" />, label: 'Database', desc: 'Track anything' },
              { icon: <Kanban className="w-6 h-6" />, label: 'Board', desc: 'Kanban view' },
              { icon: <Calendar className="w-6 h-6" />, label: 'Calendar', desc: 'Schedule view' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setShowCreateDialog(false)}
                className="p-4 border rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors text-left"
              >
                <div className="text-cyan-600 mb-2">{item.icon}</div>
                <h4 className="font-medium">{item.label}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Page</DialogTitle>
            <DialogDescription>Invite people to collaborate on this page</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Email address or name" className="flex-1" />
              <ModernButton variant="primary">Invite</ModernButton>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">People with access</h4>
              {mockCollaborators.map(collab => (
                <div key={collab.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${collab.avatar}`} />
                    <AvatarFallback>{collab.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{collab.name}</p>
                    <p className="text-xs text-muted-foreground">{collab.email}</p>
                  </div>
                  <Badge variant="secondary">{collab.role}</Badge>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <span className="text-sm">Copy link</span>
              </div>
              <button className="text-cyan-600 text-sm">Copy</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>View and restore previous versions</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {mockVersionHistory.map((version, i) => (
                <div
                  key={version.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${i === 0 ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${version.avatar}`} />
                    <AvatarFallback>{version.user.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{version.user}</span>
                      {i === 0 && <Badge className="bg-cyan-100 text-cyan-700 text-xs">Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{version.changes}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(version.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {i > 0 && (
                    <button className="text-xs text-cyan-600 hover:text-cyan-700">Restore</button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
            <DialogDescription>Start with a pre-built template</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {mockTemplates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Badge variant="secondary" className="mt-2">{template.category}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
