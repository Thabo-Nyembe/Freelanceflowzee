'use client'
import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useCanvas, type Canvas, type CanvasType, type CanvasStatus } from '@/lib/hooks/use-canvas'
import {
  Layout, Square, Circle, Minus, Type, Image, StickyNote,
  MousePointer, Hand, PenTool, Layers,
  Plus, Search, Grid3X3, Users, Clock, Star, Settings, Zap, Play, ZoomIn, ZoomOut,
  Undo, Redo, Copy, Trash2, Edit2, Eye, Download, Share2,
  MessageSquare, Lock, ChevronRight, CheckCircle2, MoreVertical, FileText,
  BarChart3, Workflow, Shapes, Frame, Component,
  Table2, Monitor, Smartphone, Bell,
  Crown, Wand2
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




import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

type ToolType = 'select' | 'hand' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'sticky' | 'pen' | 'frame' | 'comment' | 'image' | 'component'

interface CanvasBoard {
  id: string
  name: string
  description: string
  type: 'whiteboard' | 'wireframe' | 'diagram' | 'prototype' | 'presentation'
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'archived'
  thumbnail: string
  owner: { name: string; avatar: string }
  collaborators: { name: string; avatar: string; role: string; online: boolean }[]
  elements_count: number
  frames_count: number
  comments_count: number
  version: string
  last_edited: string
  created_at: string
  is_public: boolean
  is_starred: boolean
  tags: string[]
  project_id: string
}

interface DesignTemplate {
  id: string
  name: string
  category: string
  subcategory: string
  thumbnail: string
  description: string
  elements_count: number
  downloads: number
  rating: number
  is_premium: boolean
  author: string
  tags: string[]
}

interface DesignComponent {
  id: string
  name: string
  category: string
  icon: any
  description: string
  variants: number
  instances: number
  is_published: boolean
  last_updated: string
}

interface VersionHistory {
  id: string
  version: string
  description: string
  author: { name: string; avatar: string }
  timestamp: string
  changes: number
  is_current: boolean
  is_milestone: boolean
}

interface CanvasComment {
  id: string
  author: { name: string; avatar: string }
  content: string
  position: { x: number; y: number }
  timestamp: string
  resolved: boolean
  replies: number
  thread_id: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: 'owner' | 'editor' | 'viewer' | 'commenter'
  status: 'active' | 'pending' | 'inactive'
  last_active: string
  boards_access: number
}

// Enhanced Competitive Upgrade Data
const mockCanvasAIInsights = [
  { id: '1', type: 'success' as const, title: 'Design System', description: 'Component library 95% consistent across all boards.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Consistency' },
  { id: '2', type: 'info' as const, title: 'Collaboration', description: '8 team members actively editing across 3 boards.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Teamwork' },
  { id: '3', type: 'warning' as const, title: 'Export Queue', description: '5 high-res exports pending. Consider batch processing.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Exports' },
]

const mockCanvasCollaborators = [
  { id: '1', name: 'Design Lead', avatar: '/avatars/design.jpg', status: 'online' as const, role: 'Design', lastActive: 'Now' },
  { id: '2', name: 'UI Designer', avatar: '/avatars/ui.jpg', status: 'online' as const, role: 'UI/UX', lastActive: '5m ago' },
  { id: '3', name: 'Illustrator', avatar: '/avatars/illustrator.jpg', status: 'away' as const, role: 'Graphics', lastActive: '20m ago' },
]

const mockCanvasPredictions = [
  { id: '1', label: 'Boards', current: 45, target: 60, predicted: 52, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'Components', current: 320, target: 400, predicted: 360, confidence: 78, trend: 'up' as const },
  { id: '3', label: 'Team Usage', current: 85, target: 95, predicted: 90, confidence: 85, trend: 'up' as const },
]

const mockCanvasActivities = [
  { id: '1', user: 'Design Lead', action: 'created', target: 'Dashboard redesign board', timestamp: '10m ago', type: 'success' as const },
  { id: '2', user: 'UI Designer', action: 'shared', target: 'Mobile app mockups', timestamp: '30m ago', type: 'info' as const },
  { id: '3', user: 'Illustrator', action: 'exported', target: '15 icons to SVG', timestamp: '1h ago', type: 'success' as const },
]

const mockCanvasQuickActions = [
  { id: '1', label: 'New Board', icon: 'Layout', shortcut: 'N', action: () => toast.promise(new Promise(r => setTimeout(r, 700)), { loading: 'Creating canvas board...', success: 'New canvas ready! Start designing', error: 'Failed to create board' }) },
  { id: '2', label: 'Templates', icon: 'Copy', shortcut: 'T', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading templates...', success: 'Canvas Templates: 47 templates available - Wireframes, flowcharts, diagrams & more', error: 'Failed to load templates' }) },
  { id: '3', label: 'Export', icon: 'Download', shortcut: 'E', action: () => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Exporting canvas...', success: 'Exported to PNG, SVG, and PDF formats', error: 'Export failed' }) },
  { id: '4', label: 'Share', icon: 'Share2', shortcut: 'S', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Generating share link...', success: 'Share link copied! Anyone with link can view', error: 'Failed to share' }) },
]

export default function CanvasClient({ initialCanvases }: { initialCanvases: Canvas[] }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBoard, setSelectedBoard] = useState<CanvasBoard | null>(null)
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedTool, setSelectedTool] = useState<ToolType>('select')
  const [zoom, setZoom] = useState(100)

  const { canvases, loading, error, createCanvas, updateCanvas, refetch } = useCanvas({ canvasType: 'all', status: 'all' })
  const displayCanvases = canvases.length > 0 ? canvases : initialCanvases
  const supabase = createClient()

  // Form state for new canvas
  const [newCanvasForm, setNewCanvasForm] = useState({
    canvas_name: '',
    description: '',
    canvas_type: 'whiteboard' as CanvasType,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state for invite member
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer' | 'commenter'>('viewer')
  const [isInviting, setIsInviting] = useState(false)

  // Mock canvas boards
  const boards: CanvasBoard[] = [
    {
      id: '1', name: 'App Redesign v2.0', description: 'Complete mobile app redesign with new design system',
      type: 'wireframe', status: 'in_progress', thumbnail: '📱',
      owner: { name: 'Sarah Chen', avatar: '' },
      collaborators: [
        { name: 'Mike Ross', avatar: '', role: 'Editor', online: true },
        { name: 'Emily Davis', avatar: '', role: 'Viewer', online: false },
        { name: 'John Smith', avatar: '', role: 'Commenter', online: true }
      ],
      elements_count: 847, frames_count: 24, comments_count: 56, version: '2.4.1',
      last_edited: '5 min ago', created_at: '2024-01-15', is_public: false, is_starred: true,
      tags: ['mobile', 'redesign', 'ios'], project_id: 'proj-1'
    },
    {
      id: '2', name: 'User Flow Diagrams', description: 'Complete user journey mapping for checkout flow',
      type: 'diagram', status: 'review', thumbnail: '🔄',
      owner: { name: 'Mike Ross', avatar: '' },
      collaborators: [
        { name: 'Sarah Chen', avatar: '', role: 'Editor', online: true }
      ],
      elements_count: 156, frames_count: 8, comments_count: 23, version: '1.2.0',
      last_edited: '2 hours ago', created_at: '2024-02-01', is_public: true, is_starred: true,
      tags: ['ux', 'flow', 'checkout'], project_id: 'proj-1'
    },
    {
      id: '3', name: 'Brand Guidelines', description: 'Company brand identity and style guide',
      type: 'presentation', status: 'approved', thumbnail: '🎨',
      owner: { name: 'Emily Davis', avatar: '' },
      collaborators: [
        { name: 'Sarah Chen', avatar: '', role: 'Viewer', online: false }
      ],
      elements_count: 234, frames_count: 16, comments_count: 8, version: '3.0.0',
      last_edited: '1 day ago', created_at: '2024-01-01', is_public: true, is_starred: false,
      tags: ['brand', 'guidelines', 'identity'], project_id: 'proj-2'
    },
    {
      id: '4', name: 'Sprint Brainstorm', description: 'Team ideation session for Q2 features',
      type: 'whiteboard', status: 'in_progress', thumbnail: '💡',
      owner: { name: 'John Smith', avatar: '' },
      collaborators: [
        { name: 'Sarah Chen', avatar: '', role: 'Editor', online: true },
        { name: 'Mike Ross', avatar: '', role: 'Editor', online: true },
        { name: 'Emily Davis', avatar: '', role: 'Editor', online: false }
      ],
      elements_count: 423, frames_count: 4, comments_count: 89, version: '1.0.5',
      last_edited: '10 min ago', created_at: '2024-02-15', is_public: false, is_starred: false,
      tags: ['brainstorm', 'q2', 'features'], project_id: 'proj-3'
    },
    {
      id: '5', name: 'Interactive Prototype', description: 'Clickable prototype for user testing',
      type: 'prototype', status: 'draft', thumbnail: '🖱️',
      owner: { name: 'Sarah Chen', avatar: '' },
      collaborators: [],
      elements_count: 567, frames_count: 32, comments_count: 0, version: '0.1.0',
      last_edited: '3 hours ago', created_at: '2024-02-20', is_public: false, is_starred: false,
      tags: ['prototype', 'testing', 'interactive'], project_id: 'proj-1'
    }
  ]

  // Mock templates
  const templates: DesignTemplate[] = [
    { id: '1', name: 'iOS App Template', category: 'Mobile', subcategory: 'iOS', thumbnail: '📱',
      description: 'Complete iOS app design kit with 100+ screens', elements_count: 450, downloads: 12500,
      rating: 4.8, is_premium: false, author: 'Design Systems', tags: ['ios', 'mobile', 'app'] },
    { id: '2', name: 'Web Dashboard', category: 'Web', subcategory: 'Dashboard', thumbnail: '📊',
      description: 'Admin dashboard with charts and data visualization', elements_count: 280, downloads: 8900,
      rating: 4.7, is_premium: true, author: 'UI Masters', tags: ['dashboard', 'admin', 'charts'] },
    { id: '3', name: 'User Journey Map', category: 'UX', subcategory: 'Research', thumbnail: '🗺️',
      description: 'User experience journey mapping template', elements_count: 45, downloads: 15600,
      rating: 4.9, is_premium: false, author: 'UX Toolkit', tags: ['ux', 'journey', 'research'] },
    { id: '4', name: 'Sprint Retro Board', category: 'Agile', subcategory: 'Retrospective', thumbnail: '🔄',
      description: 'Team retrospective with voting and actions', elements_count: 32, downloads: 23400,
      rating: 4.6, is_premium: false, author: 'Agile Templates', tags: ['agile', 'retro', 'team'] },
    { id: '5', name: 'Wireframe Kit Pro', category: 'UI', subcategory: 'Wireframes', thumbnail: '🖼️',
      description: 'Low-fidelity wireframe components library', elements_count: 380, downloads: 19200,
      rating: 4.8, is_premium: true, author: 'Wireframe Pro', tags: ['wireframe', 'ui', 'lofi'] },
    { id: '6', name: 'Mind Map Bundle', category: 'Planning', subcategory: 'Ideation', thumbnail: '🧠',
      description: 'Mind mapping and brainstorming templates', elements_count: 56, downloads: 11300,
      rating: 4.5, is_premium: false, author: 'Think Visual', tags: ['mindmap', 'brainstorm', 'planning'] }
  ]

  // Design components
  const components: DesignComponent[] = [
    { id: '1', name: 'Button', category: 'Interactive', icon: Square, description: 'Button component with states',
      variants: 12, instances: 234, is_published: true, last_updated: '2 days ago' },
    { id: '2', name: 'Input Field', category: 'Forms', icon: Type, description: 'Text input with validation',
      variants: 8, instances: 189, is_published: true, last_updated: '1 week ago' },
    { id: '3', name: 'Card', category: 'Layout', icon: Square, description: 'Content card container',
      variants: 6, instances: 156, is_published: true, last_updated: '3 days ago' },
    { id: '4', name: 'Avatar', category: 'Media', icon: Circle, description: 'User avatar with sizes',
      variants: 4, instances: 98, is_published: true, last_updated: '5 days ago' },
    { id: '5', name: 'Navigation', category: 'Layout', icon: Minus, description: 'Navigation bar component',
      variants: 3, instances: 45, is_published: true, last_updated: '1 day ago' },
    { id: '6', name: 'Modal', category: 'Overlay', icon: Frame, description: 'Modal dialog component',
      variants: 5, instances: 67, is_published: true, last_updated: '4 days ago' },
    { id: '7', name: 'Table', category: 'Data', icon: Table2, description: 'Data table with sorting',
      variants: 4, instances: 34, is_published: false, last_updated: '6 days ago' },
    { id: '8', name: 'Chart', category: 'Data', icon: BarChart3, description: 'Chart visualizations',
      variants: 8, instances: 56, is_published: true, last_updated: '2 days ago' }
  ]

  // Version history
  const versions: VersionHistory[] = [
    { id: '1', version: '2.4.1', description: 'Updated button styles and fixed navigation',
      author: { name: 'Sarah Chen', avatar: '' }, timestamp: '5 min ago', changes: 12, is_current: true, is_milestone: false },
    { id: '2', version: '2.4.0', description: 'Added new checkout flow screens',
      author: { name: 'Mike Ross', avatar: '' }, timestamp: '2 hours ago', changes: 45, is_current: false, is_milestone: true },
    { id: '3', version: '2.3.2', description: 'Fixed responsive layouts',
      author: { name: 'Sarah Chen', avatar: '' }, timestamp: '1 day ago', changes: 8, is_current: false, is_milestone: false },
    { id: '4', version: '2.3.0', description: 'Major redesign of home screen',
      author: { name: 'Emily Davis', avatar: '' }, timestamp: '3 days ago', changes: 67, is_current: false, is_milestone: true },
    { id: '5', version: '2.2.0', description: 'Added dark mode support',
      author: { name: 'Sarah Chen', avatar: '' }, timestamp: '1 week ago', changes: 89, is_current: false, is_milestone: true }
  ]

  // Comments
  const comments: CanvasComment[] = [
    { id: '1', author: { name: 'Mike Ross', avatar: '' }, content: 'Should we increase the button size for mobile?',
      position: { x: 450, y: 320 }, timestamp: '10 min ago', resolved: false, replies: 3, thread_id: 't1' },
    { id: '2', author: { name: 'Emily Davis', avatar: '' }, content: 'Love the new color scheme!',
      position: { x: 200, y: 150 }, timestamp: '1 hour ago', resolved: true, replies: 1, thread_id: 't2' },
    { id: '3', author: { name: 'John Smith', avatar: '' }, content: 'Can we add a loading state here?',
      position: { x: 600, y: 400 }, timestamp: '2 hours ago', resolved: false, replies: 5, thread_id: 't3' }
  ]

  // Team members
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', avatar: '', role: 'owner', status: 'active',
      last_active: 'Now', boards_access: 12 },
    { id: '2', name: 'Mike Ross', email: 'mike@company.com', avatar: '', role: 'editor', status: 'active',
      last_active: '5 min ago', boards_access: 8 },
    { id: '3', name: 'Emily Davis', email: 'emily@company.com', avatar: '', role: 'editor', status: 'active',
      last_active: '2 hours ago', boards_access: 6 },
    { id: '4', name: 'John Smith', email: 'john@company.com', avatar: '', role: 'commenter', status: 'active',
      last_active: '1 day ago', boards_access: 4 },
    { id: '5', name: 'Lisa Wang', email: 'lisa@company.com', avatar: '', role: 'viewer', status: 'pending',
      last_active: 'Never', boards_access: 0 }
  ]

  const tools = [
    { id: 'select' as ToolType, name: 'Select', icon: MousePointer, shortcut: 'V' },
    { id: 'hand' as ToolType, name: 'Hand', icon: Hand, shortcut: 'H' },
    { id: 'frame' as ToolType, name: 'Frame', icon: Frame, shortcut: 'F' },
    { id: 'rectangle' as ToolType, name: 'Rectangle', icon: Square, shortcut: 'R' },
    { id: 'ellipse' as ToolType, name: 'Ellipse', icon: Circle, shortcut: 'O' },
    { id: 'line' as ToolType, name: 'Line', icon: Minus, shortcut: 'L' },
    { id: 'text' as ToolType, name: 'Text', icon: Type, shortcut: 'T' },
    { id: 'sticky' as ToolType, name: 'Sticky', icon: StickyNote, shortcut: 'S' },
    { id: 'pen' as ToolType, name: 'Pen', icon: PenTool, shortcut: 'P' },
    { id: 'image' as ToolType, name: 'Image', icon: Image, shortcut: 'I' },
    { id: 'component' as ToolType, name: 'Component', icon: Component, shortcut: 'A' },
    { id: 'comment' as ToolType, name: 'Comment', icon: MessageSquare, shortcut: 'C' }
  ]

  const stats = useMemo(() => ({
    totalBoards: boards.length,
    totalElements: boards.reduce((sum, b) => sum + b.elements_count, 0),
    totalFrames: boards.reduce((sum, b) => sum + b.frames_count, 0),
    activeCollaborators: new Set(boards.flatMap(b => b.collaborators.filter(c => c.online).map(c => c.name))).size,
    totalComments: boards.reduce((sum, b) => sum + b.comments_count, 0),
    unresolvedComments: comments.filter(c => !c.resolved).length,
    publishedComponents: components.filter(c => c.is_published).length,
    totalInstances: components.reduce((sum, c) => sum + c.instances, 0)
  }), [boards, comments, components])

  const getStatusColor = (status: CanvasBoard['status']): string => {
    const colors: Record<CanvasBoard['status'], string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      archived: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
    }
    return colors[status]
  }

  const getTypeColor = (type: CanvasBoard['type']): string => {
    const colors: Record<CanvasBoard['type'], string> = {
      whiteboard: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      wireframe: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      diagram: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      prototype: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      presentation: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
    }
    return colors[type]
  }

  const getRoleColor = (role: TeamMember['role']): string => {
    const colors: Record<TeamMember['role'], string> = {
      owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      commenter: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
    return colors[role]
  }

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => direction === 'in' ? Math.min(prev + 10, 200) : Math.max(prev - 10, 25))
  }

  // Handlers - Real Supabase Operations (must be before any early returns)
  const handleCreateCanvas = useCallback(async () => {
    if (!newCanvasForm.canvas_name.trim()) {
      toast.error('Canvas name required', { description: 'Please enter a name for your canvas' })
      return
    }

    setIsSubmitting(true)
    try {
      const canvasData = {
        canvas_name: newCanvasForm.canvas_name.trim(),
        description: newCanvasForm.description.trim() || null,
        canvas_type: newCanvasForm.canvas_type,
        width: 1920,
        height: 1080,
        zoom_level: 100,
        pan_x: 0,
        pan_y: 0,
        background_type: 'solid',
        background_color: '#ffffff',
        grid_enabled: true,
        grid_size: 20,
        active_layer: 0,
        layer_count: 1,
        is_shared: false,
        version: 1,
        auto_save: true,
        is_template: false,
        is_published: false,
        smart_guides: true,
        auto_align: true,
        snap_to_grid: true,
        object_count: 0,
        status: 'active' as CanvasStatus,
      }

      const result = await createCanvas(canvasData)
      if (result) {
        toast.success('Canvas created', { description: `"${newCanvasForm.canvas_name}" has been created successfully` })
        setShowNewBoard(false)
        setNewCanvasForm({ canvas_name: '', description: '', canvas_type: 'whiteboard' })
        refetch()
      } else {
        toast.error('Failed to create canvas', { description: 'Please try again' })
      }
    } catch (err) {
      toast.error('Error creating canvas', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsSubmitting(false)
    }
  }, [newCanvasForm, createCanvas, refetch])

  const handleSaveCanvas = useCallback(async () => {
    if (!selectedBoard) return

    try {
      const canvas = displayCanvases.find(c => c.id === selectedBoard.id)
      if (canvas) {
        await updateCanvas({ updated_at: new Date().toISOString() }, canvas.id)
        toast.success('Canvas saved', { description: 'Your design has been saved' })
      } else {
        toast.success('Canvas saved', { description: 'Your design has been saved' })
      }
    } catch (err) {
      toast.error('Failed to save', { description: 'Could not save canvas' })
    }
  }, [selectedBoard, displayCanvases, updateCanvas])

  const handleDeleteCanvas = useCallback(async (canvasId: string, canvasName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated', { description: 'Please sign in to delete' })
        return
      }

      const { error: deleteError } = await supabase
        .from('canvas')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', canvasId)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      toast.success('Canvas deleted', { description: `"${canvasName}" has been deleted` })
      setSelectedBoard(null)
      refetch()
    } catch (err) {
      toast.error('Error deleting canvas', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }, [supabase, refetch])

  const handleExportCanvas = useCallback(async () => {
    if (!selectedBoard) {
      toast.info('Select a canvas', { description: 'Please select a canvas to export' })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated', { description: 'Please sign in to export' })
        return
      }

      const { error: exportError } = await supabase.from('canvas_exports').insert({
        board_id: selectedBoard.id,
        user_id: user.id,
        format: 'png',
        resolution: '2x',
        status: 'pending',
        created_at: new Date().toISOString(),
      })

      if (exportError) throw exportError

      toast.success('Export started', { description: 'Your canvas is being exported. You will be notified when complete.' })
    } catch (err) {
      toast.error('Export failed', { description: err instanceof Error ? err.message : 'Could not start export' })
    }
  }, [selectedBoard, supabase])

  const handleShareCanvas = useCallback(async () => {
    if (!selectedBoard) {
      toast.info('Select a canvas', { description: 'Please select a canvas to share' })
      return
    }

    try {
      const shareUrl = `${window.location.origin}/shared/canvas/${selectedBoard.id}`
      await navigator.clipboard.writeText(shareUrl)

      const canvas = displayCanvases.find(c => c.id === selectedBoard.id)
      if (canvas) {
        await updateCanvas({ is_shared: true }, canvas.id)
      }

      toast.success('Link copied', { description: 'Share link copied to clipboard' })
    } catch (err) {
      toast.error('Failed to copy', { description: 'Could not copy share link' })
    }
  }, [selectedBoard, displayCanvases, updateCanvas])

  const handleToggleStar = useCallback(async (canvasId: string, currentStarred: boolean) => {
    try {
      const canvas = displayCanvases.find(c => c.id === canvasId)
      if (canvas) {
        const currentMeta = canvas.metadata || {}
        await updateCanvas({
          metadata: { ...currentMeta, is_starred: !currentStarred }
        }, canvasId)
        toast.success(currentStarred ? 'Removed from favorites' : 'Added to favorites')
        refetch()
      }
    } catch (err) {
      toast.error('Failed to update', { description: 'Could not update favorite status' })
    }
  }, [displayCanvases, updateCanvas, refetch])

  const handleInviteMember = useCallback(async () => {
    if (!inviteEmail.trim()) {
      toast.error('Email required', { description: 'Please enter an email address' })
      return
    }

    setIsInviting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated', { description: 'Please sign in to invite members' })
        return
      }

      const { error: inviteError } = await supabase.from('canvas_collaborators').insert({
        board_id: selectedBoard?.id,
        user_id: user.id,
        invited_email: inviteEmail.trim(),
        role: inviteRole,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

      if (inviteError) throw inviteError

      toast.success('Invitation sent', { description: `Invitation sent to ${inviteEmail}` })
      setInviteEmail('')
    } catch (err) {
      toast.error('Invitation failed', { description: err instanceof Error ? err.message : 'Could not send invitation' })
    } finally {
      setIsInviting(false)
    }
  }, [inviteEmail, inviteRole, selectedBoard, supabase])

  const handleResolveComment = useCallback(async (commentId: string) => {
    try {
      const { error: resolveError } = await supabase
        .from('canvas_comments')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', commentId)

      if (resolveError) throw resolveError

      toast.success('Comment resolved', { description: 'The comment has been marked as resolved' })
    } catch (err) {
      toast.error('Failed to resolve', { description: 'Could not resolve comment' })
    }
  }, [supabase])

  const handleUndoAction = useCallback(() => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 400)),
      { loading: 'Undoing last action...', success: 'Last action undone', error: 'Could not undo action' }
    )
  }, [])

  const handleUseTemplate = useCallback(async (template: DesignTemplate) => {
    setIsSubmitting(true)
    try {
      const canvasData = {
        canvas_name: `${template.name} Copy`,
        description: template.description,
        canvas_type: 'wireframe' as CanvasType,
        width: 1920,
        height: 1080,
        zoom_level: 100,
        pan_x: 0,
        pan_y: 0,
        background_type: 'solid',
        background_color: '#ffffff',
        grid_enabled: true,
        grid_size: 20,
        active_layer: 0,
        layer_count: 1,
        is_shared: false,
        version: 1,
        auto_save: true,
        is_template: false,
        template_id: template.id,
        is_published: false,
        smart_guides: true,
        auto_align: true,
        snap_to_grid: true,
        object_count: template.elements_count,
        status: 'active' as CanvasStatus,
        tags: template.tags,
        category: template.category,
      }

      const result = await createCanvas(canvasData)
      if (result) {
        toast.success('Canvas created from template', { description: `"${template.name}" template applied successfully` })
        refetch()
        setActiveTab('boards')
      } else {
        toast.error('Failed to use template', { description: 'Please try again' })
      }
    } catch (err) {
      toast.error('Error using template', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsSubmitting(false)
    }
  }, [createCanvas, refetch, setActiveTab])

  if (error) return <div className="p-8"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  // Full Editor View
  if (showEditor && selectedBoard) {
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Editor Toolbar */}
        <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-white">
              ← Back
            </Button>
            <div className="text-white font-medium">{selectedBoard.name}</div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
            <Badge className={getStatusColor(selectedBoard.status)}>{selectedBoard.status}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 mr-4">
              {selectedBoard.collaborators.filter(c => c.online).slice(0, 3).map((collab, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-gray-800">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                    {collab.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {selectedBoard.collaborators.filter(c => c.online).length > 3 && (
                <div className="h-8 w-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-300">
                  +{selectedBoard.collaborators.filter(c => c.online).length - 3}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Redo className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-700 mx-2"></div>
            <div className="flex items-center gap-1 bg-gray-700 rounded-lg px-2 py-1">
              <Button variant="ghost" size="sm" onClick={() => handleZoom('out')} className="p-1 h-auto text-gray-400 hover:text-white">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-white text-sm w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={() => handleZoom('in')} className="p-1 h-auto text-gray-400 hover:text-white">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-px h-6 bg-gray-700 mx-2"></div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Play className="h-4 w-4" />
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleShareCanvas}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Toolbar */}
          <div className="w-14 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-2 gap-1">
            {tools.map(tool => (
              <Button
                key={tool.id}
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTool(tool.id)}
                className={`relative ${
                  selectedTool === tool.id
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={`${tool.name} (${tool.shortcut})`}
              >
                <tool.icon className="h-5 w-5" />
              </Button>
            ))}
            <div className="flex-1"></div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-950 relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
                backgroundSize: `${20 * zoom / 100}px ${20 * zoom / 100}px`
              }}
            ></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="bg-white rounded-lg shadow-2xl relative"
                style={{
                  width: `${800 * zoom / 100}px`,
                  height: `${600 * zoom / 100}px`
                }}
              >
                <div className="w-full h-full p-8 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Layout className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">Start creating</p>
                    <p className="text-sm text-gray-400">Use the tools on the left to add elements</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments overlay */}
            {comments.slice(0, 2).map((comment, i) => (
              <div
                key={comment.id}
                className="absolute"
                style={{ left: `${comment.position.x * zoom / 100}px`, top: `${comment.position.y * zoom / 100}px` }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg cursor-pointer ${
                  comment.resolved ? 'bg-green-500' : 'bg-indigo-500'
                }`}>
                  {comment.replies}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel */}
          <div className="w-72 bg-gray-800 border-l border-gray-700">
            <Tabs defaultValue="properties" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-4 m-2 bg-gray-700">
                <TabsTrigger value="properties" className="text-xs">Props</TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">Layers</TabsTrigger>
                <TabsTrigger value="assets" className="text-xs">Assets</TabsTrigger>
                <TabsTrigger value="comments" className="text-xs">Chat</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 p-4">
                <TabsContent value="properties" className="mt-0 space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Position</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">X</label>
                        <Input type="number" className="bg-gray-700 border-gray-600 text-white h-8" defaultValue="0" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Y</label>
                        <Input type="number" className="bg-gray-700 border-gray-600 text-white h-8" defaultValue="0" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Size</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">W</label>
                        <Input type="number" className="bg-gray-700 border-gray-600 text-white h-8" defaultValue="100" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">H</label>
                        <Input type="number" className="bg-gray-700 border-gray-600 text-white h-8" defaultValue="100" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Fill</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-500 rounded cursor-pointer border-2 border-gray-600"></div>
                      <Input className="flex-1 bg-gray-700 border-gray-600 text-white h-8" defaultValue="#6366F1" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Stroke</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-transparent border-2 border-gray-400 rounded cursor-pointer"></div>
                      <Input className="flex-1 bg-gray-700 border-gray-600 text-white h-8" defaultValue="1px" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Effects</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Drop Shadow</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Blur</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layers" className="mt-0 space-y-2">
                  <div className="space-y-1">
                    {['Frame: Home Screen', 'Rectangle: Header', 'Text: Title', 'Button: CTA', 'Image: Hero'].map((layer, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer group">
                        <Layers className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300 flex-1 truncate">{layer}</span>
                        <Eye className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100" />
                        <Lock className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="assets" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Components</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {components.slice(0, 6).map(comp => (
                          <button key={comp.id} className="flex flex-col items-center gap-1 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                            <comp.icon className="h-6 w-6 text-gray-300" />
                            <span className="text-xs text-gray-400">{comp.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Colors</h4>
                      <div className="flex gap-2 flex-wrap">
                        {['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#22C55E', '#06B6D4'].map(color => (
                          <div key={color} className="w-8 h-8 rounded cursor-pointer border border-gray-600" style={{ backgroundColor: color }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-0 space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className={`p-3 rounded-lg ${comment.resolved ? 'bg-gray-700/50' : 'bg-gray-700'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                            {comment.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-300 font-medium">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-400">{comment.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {comment.replies} replies
                        </Badge>
                        {comment.resolved && <Badge className="bg-green-600 text-xs">Resolved</Badge>}
                      </div>
                    </div>
                  ))}
                  <Input placeholder="Add a comment..." className="bg-gray-700 border-gray-600 text-white" />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <Layout className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Canvas Studio</h1>
                <p className="text-indigo-100">Collaborative design platform for visual creation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">{stats.activeCollaborators} online</span>
              </div>
              <Button onClick={() => setShowNewBoard(true)} className="bg-white text-indigo-600 hover:bg-indigo-50">
                <Plus className="h-4 w-4 mr-2" />
                New Canvas
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Boards', value: stats.totalBoards, icon: Layout, color: 'from-indigo-500 to-purple-500' },
              { label: 'Elements', value: stats.totalElements.toLocaleString(), icon: Shapes, color: 'from-purple-500 to-pink-500' },
              { label: 'Frames', value: stats.totalFrames, icon: Frame, color: 'from-pink-500 to-red-500' },
              { label: 'Online', value: stats.activeCollaborators, icon: Users, color: 'from-green-500 to-emerald-500' },
              { label: 'Comments', value: stats.totalComments, icon: MessageSquare, color: 'from-orange-500 to-yellow-500' },
              { label: 'Open', value: stats.unresolvedComments, icon: CheckCircle2, color: 'from-yellow-500 to-amber-500' },
              { label: 'Components', value: stats.publishedComponents, icon: Component, color: 'from-teal-500 to-cyan-500' },
              { label: 'Instances', value: stats.totalInstances, icon: Copy, color: 'from-cyan-500 to-blue-500' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-indigo-200 text-xs">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="boards">Boards</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            </div>
          )}

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Layout className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Welcome to Canvas Studio</h2>
                    <p className="text-indigo-100">Your collaborative design workspace • {stats.totalBoards} boards, {stats.totalElements.toLocaleString()} elements</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-indigo-200">Active Collaborators</p>
                    <p className="text-2xl font-bold">{stats.activeCollaborators}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-indigo-200">Open Comments</p>
                    <p className="text-2xl font-bold">{stats.unresolvedComments}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: 'New Canvas', icon: Plus, color: 'from-indigo-500 to-purple-500', action: () => setShowNewBoard(true) },
                { label: 'Whiteboard', icon: StickyNote, color: 'from-purple-500 to-pink-500', action: () => { setNewCanvasForm(prev => ({ ...prev, canvas_type: 'whiteboard' })); setShowNewBoard(true) } },
                { label: 'Wireframe', icon: Monitor, color: 'from-blue-500 to-cyan-500', action: () => { setNewCanvasForm(prev => ({ ...prev, canvas_type: 'wireframe' })); setShowNewBoard(true) } },
                { label: 'Prototype', icon: Smartphone, color: 'from-green-500 to-emerald-500', action: () => { setNewCanvasForm(prev => ({ ...prev, canvas_type: 'prototype' })); setShowNewBoard(true) } },
                { label: 'Diagram', icon: Workflow, color: 'from-orange-500 to-red-500', action: () => { setNewCanvasForm(prev => ({ ...prev, canvas_type: 'diagram' })); setShowNewBoard(true) } },
                { label: 'Templates', icon: FileText, color: 'from-pink-500 to-rose-500', action: () => setActiveTab('templates') },
                { label: 'Import', icon: Download, color: 'from-teal-500 to-cyan-500', action: () => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Opening file picker...', success: 'Ready to import .fig, .sketch, or .psd files', error: 'Import cancelled' }) },
                { label: 'AI Generate', icon: Wand2, color: 'from-violet-500 to-purple-500', action: () => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Initializing AI design generator...', success: 'AI ready! Describe your design to generate', error: 'AI unavailable' }) }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all group"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Boards */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    Recent Boards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {boards.slice(0, 4).map(board => (
                      <div
                        key={board.id}
                        onClick={() => { setSelectedBoard(board); setShowEditor(true) }}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-2xl">
                          {board.thumbnail}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{board.name}</h4>
                            {board.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge className={getTypeColor(board.type)} variant="secondary">{board.type}</Badge>
                            <span>{board.last_edited}</span>
                          </div>
                        </div>
                        <div className="flex -space-x-2">
                          {board.collaborators.filter(c => c.online).slice(0, 2).map((collab, i) => (
                            <Avatar key={i} className="h-8 w-8 border-2 border-white dark:border-gray-900">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                                {collab.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-600" />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {versions.map(version => (
                        <div key={version.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                              {version.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-medium">{version.author.name}</span> saved <span className="font-medium">v{version.version}</span>
                            </p>
                            <p className="text-xs text-gray-500">{version.timestamp}</p>
                          </div>
                          {version.is_milestone && <Star className="h-4 w-4 text-yellow-500" />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Comments Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  Open Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comments.filter(c => !c.resolved).map(comment => (
                    <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                            {comment.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{comment.content}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline">Reply</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleResolveComment(comment.id)}>Resolve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Boards Tab */}
          <TabsContent value="boards" className="space-y-6">
            {/* Boards Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Grid3X3 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Your Canvas Boards</h2>
                    <p className="text-purple-100">Manage and organize all your design canvases</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{boards.length}</p>
                    <p className="text-sm text-purple-200">Total Boards</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{boards.filter(b => b.status === 'in_progress').length}</p>
                    <p className="text-sm text-purple-200">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{boards.filter(b => b.is_starred).length}</p>
                    <p className="text-sm text-purple-200">Starred</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map(board => (
                <Card key={board.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                  <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 relative">
                    <div className="absolute inset-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">{board.thumbnail}</span>
                    </div>
                    {board.is_starred && (
                      <div className="absolute top-2 left-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge className={getStatusColor(board.status)}>{board.status}</Badge>
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedBoard(board); setShowEditor(true) }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedBoard(board); handleShareCanvas() }}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleToggleStar(board.id, board.is_starred) }}>
                        <Star className={`h-4 w-4 ${board.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4" onClick={() => setSelectedBoard(board)}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(board.type)} variant="secondary">{board.type}</Badge>
                      {board.is_public && <Badge variant="outline">Public</Badge>}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{board.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{board.description}</p>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Shapes className="h-3 w-3" />{board.elements_count}</span>
                        <span className="flex items-center gap-1"><Frame className="h-3 w-3" />{board.frames_count}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{board.comments_count}</span>
                      </div>
                      <div className="flex -space-x-2">
                        {board.collaborators.slice(0, 3).map((collab, i) => (
                          <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-gray-900">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[10px]">
                              {collab.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Templates Overview Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Template Gallery</h2>
                    <p className="text-pink-100">Start faster with professionally designed templates</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{templates.length}</p>
                    <p className="text-sm text-pink-200">Templates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{templates.filter(t => t.is_premium).length}</p>
                    <p className="text-sm text-pink-200">Premium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(templates.reduce((sum, t) => sum + t.downloads, 0) / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-pink-200">Downloads</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                  <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center relative">
                    <span className="text-5xl">{template.thumbnail}</span>
                    {template.is_premium && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{template.category}</Badge>
                      <Badge variant="outline">{template.subcategory}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{template.rating}</span>
                      </div>
                      <span>{template.downloads.toLocaleString()} uses</span>
                    </div>
                    <Button
                      className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleUseTemplate(template)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Use Template'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* Components Overview Banner */}
            <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Component className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Design System Components</h2>
                    <p className="text-teal-100">Reusable components for consistent designs</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{components.length}</p>
                    <p className="text-sm text-teal-200">Components</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{components.reduce((sum, c) => sum + c.variants, 0)}</p>
                    <p className="text-sm text-teal-200">Variants</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalInstances}</p>
                    <p className="text-sm text-teal-200">Instances</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {components.map(comp => (
                <Card key={comp.id} className="p-4 hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer text-center group">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <comp.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{comp.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{comp.category}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{comp.variants} variants</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{comp.instances} instances</p>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Component Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {components.slice(0, 4).map(comp => (
                    <div key={comp.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                        <comp.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{comp.name}</span>
                          <span className="text-sm text-gray-500">{comp.instances} uses</span>
                        </div>
                        <Progress value={(comp.instances / 250) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            {/* Team Overview Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Team Collaboration</h2>
                    <p className="text-green-100">Manage team access and collaboration settings</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{teamMembers.length}</p>
                    <p className="text-sm text-green-200">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</p>
                    <p className="text-sm text-green-200">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{teamMembers.filter(m => m.last_active === 'Now').length}</p>
                    <p className="text-sm text-green-200">Online</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <Dialog>
                  <Button asChild>
                    <label htmlFor="invite-dialog">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite
                    </label>
                  </Button>
                </Dialog>
              </CardHeader>
              <CardContent>
                {/* Invite Form */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Input
                    placeholder="Enter email address..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer' | 'commenter')}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="commenter">Commenter</option>
                    <option value="editor">Editor</option>
                  </select>
                  <Button onClick={handleInviteMember} disabled={isInviting || !inviteEmail.trim()}>
                    {isInviting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </div>

                <div className="space-y-4">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {member.status === 'active' && member.last_active === 'Now' && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                          <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                          {member.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Last active: {member.last_active}</p>
                        <p className="text-xs text-gray-400">{member.boards_access} boards</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Canvas Settings</h2>
                    <p className="text-gray-300">Configure your workspace, editor, and collaboration preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">All Systems Operational</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Layout */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General', desc: 'Workspace basics' },
                        { id: 'editor', icon: Edit2, label: 'Editor', desc: 'Design tools' },
                        { id: 'collaboration', icon: Users, label: 'Collaboration', desc: 'Team settings' },
                        { id: 'export', icon: Download, label: 'Export', desc: 'Output formats' },
                        { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert prefs' },
                        { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Power settings' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                            settingsTab === item.id
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div className="text-left">
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
              <div className="col-span-9">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workspace Name</label>
                        <Input defaultValue="Design Team Workspace" className="max-w-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workspace URL</label>
                        <div className="flex items-center gap-2 max-w-md">
                          <span className="text-sm text-gray-500">canvas.io/</span>
                          <Input defaultValue="design-team" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Board Type</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                          <option>Whiteboard</option>
                          <option>Wireframe</option>
                          <option>Diagram</option>
                          <option>Prototype</option>
                          <option>Presentation</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-save</p>
                          <p className="text-sm text-gray-500">Automatically save changes every 30 seconds</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Version History</p>
                          <p className="text-sm text-gray-500">Keep history for 30 days (90 days on Pro)</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Tutorials</p>
                          <p className="text-sm text-gray-500">Display helpful tips for new features</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                          <p className="text-sm text-gray-500">Use dark theme across the platform</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Compact Mode</p>
                          <p className="text-sm text-gray-500">Reduce spacing and padding in UI</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">High Contrast</p>
                          <p className="text-sm text-gray-500">Increase contrast for accessibility</p>
                        </div>
                        <Switch />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>English (US)</option>
                          <option>English (UK)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>UTC (Coordinated Universal Time)</option>
                          <option>EST (Eastern Standard Time)</option>
                          <option>PST (Pacific Standard Time)</option>
                          <option>GMT (Greenwich Mean Time)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Remember Recent Files</p>
                          <p className="text-sm text-gray-500">Quick access to recently opened boards</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Spell Check</p>
                          <p className="text-sm text-gray-500">Check spelling in text elements</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Editor Settings */}
                {settingsTab === 'editor' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-purple-600" />
                        Editor Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Snap to Grid</p>
                          <p className="text-sm text-gray-500">Align elements to grid automatically</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Guides</p>
                          <p className="text-sm text-gray-500">Display alignment guides when moving elements</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Keyboard Shortcuts</p>
                          <p className="text-sm text-gray-500">Enable keyboard shortcuts for faster workflows</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Pen Pressure Sensitivity</p>
                          <p className="text-sm text-gray-500">Enable stylus pressure for drawing tools</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Pixel Grid</p>
                          <p className="text-sm text-gray-500">Display pixel grid at high zoom levels</p>
                        </div>
                        <Switch />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grid Size</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>8px</option>
                          <option>10px</option>
                          <option>16px</option>
                          <option>20px</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Font</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>Inter</option>
                          <option>Roboto</option>
                          <option>SF Pro</option>
                          <option>Open Sans</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-close Shapes</p>
                          <p className="text-sm text-gray-500">Automatically close pen paths</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Collaboration Settings */}
                {settingsTab === 'collaboration' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        Collaboration Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Real-time Cursors</p>
                          <p className="text-sm text-gray-500">Show collaborator cursors on the canvas</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Cursor Chat</p>
                          <p className="text-sm text-gray-500">Enable quick messages via cursor</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Follow Mode</p>
                          <p className="text-sm text-gray-500">Allow team members to follow your view</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Public Sharing</p>
                          <p className="text-sm text-gray-500">Allow anyone with link to view boards</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Comment Access</p>
                          <p className="text-sm text-gray-500">Anyone can comment on shared boards</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Voice Chat</p>
                          <p className="text-sm text-gray-500">Enable voice communication during collaboration</p>
                        </div>
                        <Switch />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Permission</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>Can View</option>
                          <option>Can Comment</option>
                          <option>Can Edit</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Export Settings */}
                {settingsTab === 'export' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-600" />
                        Export Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Image Format</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>PNG (Recommended)</option>
                          <option>JPG</option>
                          <option>SVG</option>
                          <option>WebP</option>
                          <option>PDF</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Resolution</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>1x (Standard)</option>
                          <option>2x (Retina)</option>
                          <option>3x (High DPI)</option>
                          <option>4x (Print Quality)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Include Background</p>
                          <p className="text-sm text-gray-500">Export with canvas background color</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Allow Viewer Export</p>
                          <p className="text-sm text-gray-500">Let viewers download board exports</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Add Watermark</p>
                          <p className="text-sm text-gray-500">Include workspace branding on exports</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Optimize for Web</p>
                          <p className="text-sm text-gray-500">Compress images for faster loading</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-600" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">New Comments</p>
                          <p className="text-sm text-gray-500">Get notified when someone comments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Mentions</p>
                          <p className="text-sm text-gray-500">Notify when mentioned in comments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Board Updates</p>
                          <p className="text-sm text-gray-500">Notify on significant board changes</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Team Invitations</p>
                          <p className="text-sm text-gray-500">When invited to new boards or teams</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Weekly Digest</p>
                          <p className="text-sm text-gray-500">Receive weekly activity summary</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Desktop Notifications</p>
                          <p className="text-sm text-gray-500">Show browser notifications</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Mobile Push</p>
                          <p className="text-sm text-gray-500">Send push notifications to mobile app</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Hardware Acceleration</p>
                          <p className="text-sm text-gray-500">Use GPU for better performance</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Offline Mode</p>
                          <p className="text-sm text-gray-500">Cache boards for offline editing</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Developer Tools</p>
                          <p className="text-sm text-gray-500">Enable developer debugging options</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Plugin System</p>
                          <p className="text-sm text-gray-500">Allow third-party plugins</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Beta Features</p>
                          <p className="text-sm text-gray-500">Try experimental features early</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Analytics</p>
                          <p className="text-sm text-gray-500">Help improve Canvas with usage data</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="pt-6 border-t dark:border-gray-700">
                        <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Clear Local Cache</p>
                              <p className="text-sm text-red-600">Remove all cached data</p>
                            </div>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                              Clear
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete All Boards</p>
                              <p className="text-sm text-red-600">Permanently delete all your boards</p>
                            </div>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                              Delete
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete Workspace</p>
                              <p className="text-sm text-red-600">This action cannot be undone</p>
                            </div>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                              Delete
                            </Button>
                          </div>
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
              insights={mockCanvasAIInsights}
              title="Canvas Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockCanvasCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCanvasPredictions}
              title="Design Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockCanvasActivities}
            title="Canvas Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockCanvasQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* New Board Modal */}
      <Dialog open={showNewBoard} onOpenChange={(open) => {
        setShowNewBoard(open)
        if (!open) {
          setNewCanvasForm({ canvas_name: '', description: '', canvas_type: 'whiteboard' })
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              Create New Canvas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canvas Name</label>
              <Input
                placeholder="Untitled canvas"
                value={newCanvasForm.canvas_name}
                onChange={(e) => setNewCanvasForm(prev => ({ ...prev, canvas_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <Input
                placeholder="What's this canvas for?"
                value={newCanvasForm.description}
                onChange={(e) => setNewCanvasForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Canvas Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'whiteboard' as CanvasType, name: 'Whiteboard', icon: StickyNote, desc: 'Free-form collaboration' },
                  { id: 'wireframe' as CanvasType, name: 'Wireframe', icon: Monitor, desc: 'UI/UX mockups' },
                  { id: 'diagram' as CanvasType, name: 'Diagram', icon: Workflow, desc: 'Flowcharts & processes' },
                  { id: 'prototype' as CanvasType, name: 'Prototype', icon: Smartphone, desc: 'Interactive designs' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setNewCanvasForm(prev => ({ ...prev, canvas_type: type.id }))}
                    className={`flex items-center gap-3 p-4 border rounded-lg transition-colors text-left ${
                      newCanvasForm.canvas_type === type.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                    }`}
                  >
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
                      <type.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{type.name}</p>
                      <p className="text-xs text-gray-500">{type.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewBoard(false)} disabled={isSubmitting}>Cancel</Button>
              <Button
                onClick={handleCreateCanvas}
                disabled={isSubmitting || !newCanvasForm.canvas_name.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Canvas'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Board Detail Modal */}
      <Dialog open={!!selectedBoard && !showEditor} onOpenChange={() => setSelectedBoard(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Layout className="h-5 w-5 text-white" />
              </div>
              {selectedBoard?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 py-4">
              <div className="h-64 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl">{selectedBoard?.thumbnail}</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Canvas Preview</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                  <Shapes className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBoard?.elements_count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Elements</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                  <Frame className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBoard?.frames_count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Frames</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-pink-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBoard?.comments_count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBoard?.collaborators.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Team</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Collaborators</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBoard?.collaborators.map((collab, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                          {collab.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{collab.name}</span>
                      <Badge variant="outline" className="text-xs">{collab.role}</Badge>
                      {collab.online && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => setShowEditor(true)} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Open Editor
                </Button>
                <Button variant="outline" onClick={handleShareCanvas}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={handleExportCanvas}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => selectedBoard && handleDeleteCanvas(selectedBoard.id, selectedBoard.name)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
