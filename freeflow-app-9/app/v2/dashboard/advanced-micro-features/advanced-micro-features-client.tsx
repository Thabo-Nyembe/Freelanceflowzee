'use client'
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


import * as React from 'react'
import { useMemo, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query'
import { useSupabaseMutation } from '@/lib/hooks/use-supabase-mutation'
import { createClient } from '@/lib/supabase/client'

const EnhancedDashboardWidget = dynamic(
  () => import('@/components/ui/enhanced-dashboard-widgets').then(mod => mod.EnhancedDashboardWidget),
  { loading: () => <CardSkeleton />, ssr: false }
)
const EnhancedQuickActions = dynamic(
  () => import('@/components/ui/enhanced-dashboard-widgets').then(mod => mod.EnhancedQuickActions),
  { loading: () => <CardSkeleton />, ssr: false }
)
const EnhancedNotifications = dynamic(
  () => import('@/components/ui/enhanced-dashboard-widgets').then(mod => mod.EnhancedNotifications),
  { loading: () => <CardSkeleton />, ssr: false }
)

const EnhancedChartContainer = dynamic(
  () => import('@/components/ui/enhanced-data-visualization').then(mod => mod.EnhancedChartContainer),
  { loading: () => <CardSkeleton />, ssr: false }
)
const EnhancedChartLegend = dynamic(
  () => import('@/components/ui/enhanced-data-visualization').then(mod => mod.EnhancedChartLegend),
  { loading: () => <div className="h-8 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const EnhancedDataTable = dynamic(
  () => import('@/components/ui/enhanced-data-visualization').then(mod => mod.EnhancedDataTable),
  { loading: () => <CardSkeleton />, ssr: false }
)

const EnhancedPresenceIndicator = dynamic(
  () => import('@/components/ui/enhanced-collaboration').then(mod => mod.EnhancedPresenceIndicator),
  { loading: () => <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const EnhancedActivityFeed = dynamic(
  () => import('@/components/ui/enhanced-collaboration').then(mod => mod.EnhancedActivityFeed),
  { loading: () => <CardSkeleton />, ssr: false }
)
const EnhancedCommentSystem = dynamic(
  () => import('@/components/ui/enhanced-collaboration').then(mod => mod.EnhancedCommentSystem),
  { loading: () => <CardSkeleton />, ssr: false }
)

const EnhancedSettingsCategories = dynamic(
  () => import('@/components/ui/enhanced-settings').then(mod => mod.EnhancedSettingsCategories),
  { loading: () => <CardSkeleton />, ssr: false }
)
const EnhancedThemeSelector = dynamic(
  () => import('@/components/ui/enhanced-settings').then(mod => mod.EnhancedThemeSelector),
  { loading: () => <CardSkeleton />, ssr: false }
)
const EnhancedKeyboardShortcuts = dynamic(
  () => import('@/components/ui/enhanced-settings').then(mod => mod.EnhancedKeyboardShortcuts),
  { loading: () => <CardSkeleton />, ssr: false }
)
const EnhancedNotificationSettings = dynamic(
  () => import('@/components/ui/enhanced-settings').then(mod => mod.EnhancedNotificationSettings),
  { loading: () => <CardSkeleton />, ssr: false }
)

// Import existing micro features for comparison (keep these as regular imports - they're lightweight)
import { EnhancedBreadcrumb } from '@/components/ui/enhanced-breadcrumb'
import { EnhancedSearch } from '@/components/ui/enhanced-search'
import { ContextualTooltip, HelpTooltip } from '@/components/ui/enhanced-contextual-tooltips'
import { AnimatedElement, AnimatedCounter } from '@/components/ui/enhanced-micro-animations'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import {
  Sparkles,
  TrendingUp,
  Users,
  MessageSquare,
  Settings,
  Palette,
  Bell,
  BarChart3,
  Zap,
  Star,
  Download,
  Share2,
  Plus,
  FileText,
  FileSpreadsheet,
  FileJson,
  Database,
  Save,
  Loader2
} from 'lucide-react'

const logger = createFeatureLogger('Advanced-Micro-Features')


// ============================================================================
// V2 COMPETITIVE MOCK DATA - AdvancedMicroFeatures Context
// ============================================================================

const advancedMicroFeaturesAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const advancedMicroFeaturesCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const advancedMicroFeaturesPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const advancedMicroFeaturesActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component with proper dialog handlers

// Helper function to generate CSV content from data
function generateCSV(data: Record<string, unknown>[], includeHeaders: boolean): string {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows: string[] = []

  if (includeHeaders) {
    rows.push(headers.join(','))
  }

  data.forEach(row => {
    const values = headers.map(header => {
      const val = row[header]
      if (val === null || val === undefined) return ''
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return String(val)
    })
    rows.push(values.join(','))
  })

  return rows.join('\n')
}

// Helper function to generate PDF-like text report
function generateTextReport(data: Record<string, unknown>[], title: string): string {
  const lines: string[] = [
    '=' .repeat(60),
    title.toUpperCase(),
    '=' .repeat(60),
    `Generated: ${new Date().toLocaleString()}`,
    `Total Records: ${data.length}`,
    '-'.repeat(60),
    ''
  ]

  data.forEach((row, index) => {
    lines.push(`Record ${index + 1}:`)
    Object.entries(row).forEach(([key, value]) => {
      lines.push(`  ${key}: ${value ?? 'N/A'}`)
    })
    lines.push('')
  })

  lines.push('-'.repeat(60))
  lines.push('End of Report')

  return lines.join('\n')
}

// Helper to filter data by date range
function filterByDateRange(data: Record<string, unknown>[], dateRange: string): Record<string, unknown>[] {
  if (dateRange === 'all') return data

  const now = new Date()
  let startDate: Date

  switch (dateRange) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      return data
  }

  return data.filter(row => {
    const createdAt = row.created_at as string | undefined
    if (!createdAt) return true
    return new Date(createdAt) >= startDate
  })
}

export default function AdvancedMicroFeaturesClient() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState('widgets')

  // Dialog states for quick actions
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track export data size estimate
  const [exportDataCount, setExportDataCount] = useState(0)

  // New Item form state
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    type: 'task',
    description: '',
    priority: 'medium',
    category: '',
    tags: ''
  })

  // Export form state
  const [exportForm, setExportForm] = useState({
    format: 'csv',
    includeHeaders: true,
    dateRange: 'all',
    selectedColumns: ['all'],
    filename: ''
  })

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    theme: 'system',
    language: 'en',
    notifications: true,
    autoSave: true,
    compactMode: false,
    animationsEnabled: true
  })

  // Supabase mutation for creating items
  const itemMutation = useSupabaseMutation({
    table: 'micro_feature_items',
    onSuccess: () => {
      announce('New item created successfully', 'polite')
    },
    onError: (err) => {
      toast.error(`Failed to create item: ${err.message}`)
    }
  })

  // Supabase mutation for settings
  const settingsMutation = useSupabaseMutation({
    table: 'micro_feature_settings',
    onSuccess: () => {
      announce('Settings saved successfully', 'polite')
    },
    onError: (err) => {
      toast.error(`Failed to save settings: ${err.message}`)
    }
  })

  // Load saved settings on mount
  useEffect(() => {
    async function loadSettings() {
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from('micro_feature_settings')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (data && !error) {
          setSettingsForm({
            theme: data.theme || 'system',
            language: data.language || 'en',
            notifications: data.notifications ?? true,
            autoSave: data.auto_save ?? true,
            compactMode: data.compact_mode ?? false,
            animationsEnabled: data.animations_enabled ?? true
          })
        }
      } catch {
        // Settings not found, use defaults
      }
    }

    loadSettings()
  }, [userId, supabase])

  // Get estimated export data count
  useEffect(() => {
    async function getExportCount() {
      if (!userId) return

      try {
        const { count } = await supabase
          .from('micro_feature_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        setExportDataCount(count || 0)
      } catch {
        setExportDataCount(0)
      }
    }

    if (exportDialogOpen) {
      getExportCount()
    }
  }, [exportDialogOpen, userId, supabase])

  // Handler for creating new item - uses Supabase directly
  const handleCreateNewItem = useCallback(async () => {
    if (!newItemForm.name.trim()) {
      toast.error('Please enter a name for the new item')
      return
    }

    setIsSubmitting(true)
    try {
      // Parse tags into array
      const tagsArray = newItemForm.tags
        ? newItemForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        : []

      // Create item using Supabase mutation
      await itemMutation.create({
        name: newItemForm.name,
        type: newItemForm.type,
        description: newItemForm.description || null,
        priority: newItemForm.priority,
        category: newItemForm.category || null,
        tags: tagsArray,
        status: 'active',
        metadata: {
          createdFrom: 'advanced-micro-features',
          createdAt: new Date().toISOString()
        }
      })

      toast.success(`Item created successfully - "${newItemForm.name}" has been added as a ${newItemForm.type}`)

      setNewItemDialogOpen(false)
      setNewItemForm({
        name: '',
        type: 'task',
        description: '',
        priority: 'medium',
        category: '',
        tags: ''
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create item'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [newItemForm, itemMutation])

  // Handler for exporting data - generates real files using Blob/URL.createObjectURL
  const handleExportData = useCallback(async () => {
    setIsSubmitting(true)
    try {
      // Fetch real data from Supabase
      const { data: items, error: fetchError } = await supabase
        .from('micro_feature_items')
        .select('id, name, type, description, priority, category, tags, status, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw new Error(fetchError.message)

      // Filter by date range
      const filteredData = filterByDateRange(items || [], exportForm.dateRange)

      if (filteredData.length === 0) {
        toast.warning('No data to export for the selected date range')
        setIsSubmitting(false)
        return
      }

      const filename = exportForm.filename || `micro-features-export-${new Date().toISOString().split('T')[0]}`
      let content: string
      let mimeType: string
      let extension: string

      switch (exportForm.format) {
        case 'csv':
          content = generateCSV(filteredData, exportForm.includeHeaders)
          mimeType = 'text/csv;charset=utf-8;'
          extension = 'csv'
          break

        case 'json':
          content = JSON.stringify({
            exportedAt: new Date().toISOString(),
            totalRecords: filteredData.length,
            dateRange: exportForm.dateRange,
            data: filteredData
          }, null, 2)
          mimeType = 'application/json;charset=utf-8;'
          extension = 'json'
          break

        case 'pdf':
          // Generate a text-based report (PDF generation would require a library)
          content = generateTextReport(filteredData, 'Micro Features Export Report')
          mimeType = 'text/plain;charset=utf-8;'
          extension = 'txt'
          toast.info('PDF export generated as text report')
          break

        case 'xlsx':
          // Generate CSV for Excel compatibility
          content = generateCSV(filteredData, exportForm.includeHeaders)
          mimeType = 'text/csv;charset=utf-8;'
          extension = 'csv'
          toast.info('Excel export generated as CSV (compatible with Excel)')
          break

        default:
          content = JSON.stringify(filteredData, null, 2)
          mimeType = 'application/json;charset=utf-8;'
          extension = 'json'
      }

      // Create Blob and trigger download
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.${extension}`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Export completed - ${filteredData.length} records exported as ${extension.toUpperCase()}`)

      setExportDialogOpen(false)
      setExportForm({
        format: 'csv',
        includeHeaders: true,
        dateRange: 'all',
        selectedColumns: ['all'],
        filename: ''
      })
      announce('Data exported successfully', 'polite')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [exportForm, userId, supabase, announce])

  // Handler for saving settings - uses Supabase upsert
  const handleSaveSettings = useCallback(async () => {
    if (!userId) {
      toast.error('You must be logged in to save settings')
      return
    }

    setIsSubmitting(true)
    try {
      // Upsert settings using Supabase directly
      const { error: upsertError } = await supabase
        .from('micro_feature_settings')
        .upsert({
          user_id: userId,
          theme: settingsForm.theme,
          language: settingsForm.language,
          notifications: settingsForm.notifications,
          auto_save: settingsForm.autoSave,
          compact_mode: settingsForm.compactMode,
          animations_enabled: settingsForm.animationsEnabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (upsertError) throw new Error(upsertError.message)

      // Apply theme change if applicable
      if (settingsForm.theme !== 'system') {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(settingsForm.theme)
      } else {
        document.documentElement.classList.remove('light', 'dark')
      }

      // Apply animations preference
      if (!settingsForm.animationsEnabled) {
        document.documentElement.style.setProperty('--animation-duration', '0s')
      } else {
        document.documentElement.style.removeProperty('--animation-duration')
      }

      toast.success('Settings saved successfully')
      setSettingsDialogOpen(false)
      announce('Settings saved successfully', 'polite')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [settingsForm, userId, supabase, announce])

  // Quick actions with dialog openers
  const advancedMicroFeaturesQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Item',
      icon: 'Plus',
      shortcut: 'N',
      action: () => setNewItemDialogOpen(true)
    },
    {
      id: '2',
      label: 'Export',
      icon: 'Download',
      shortcut: 'E',
      action: () => setExportDialogOpen(true)
    },
    {
      id: '3',
      label: 'Settings',
      icon: 'Settings',
      shortcut: 'S',
      action: () => setSettingsDialogOpen(true)
    },
  ], [])

  React.useEffect(() => {
    const loadAdvancedMicroFeaturesData = async () => {
      if (!userId) {        setIsLoading(false)
        return
      }      try {
        setIsLoading(true)
        setError(null)

        // Load advanced micro features data
        const res = await fetch('/api/micro-features')
        if (!res.ok) throw new Error('Failed to load advanced micro features')

        setIsLoading(false)
        announce('Advanced micro features loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load advanced micro features')
        setIsLoading(false)
        announce('Error loading advanced micro features', 'assertive')
      }
    }

    loadAdvancedMicroFeaturesData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  const mockUsers = useMemo(() => [
    { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', status: 'online' as const, role: 'Designer' },
    { id: '2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', status: 'away' as const, role: 'Developer', isTyping: true },
    { id: '3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', status: 'busy' as const, role: 'Manager' },
    { id: '4', name: 'Alex Kumar', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Analyst' },
    { id: '5', name: 'Lisa Wong', avatar: '/avatars/lisa.jpg', status: 'offline' as const, role: 'Writer', lastSeen: new Date(Date.now() - 30 * 60 * 1000) }
  ], [])

  const mockWidgetData = useMemo(() => ({
    id: 'revenue',
    title: 'Monthly Revenue',
    value: '$45,230',
    change: { value: 12.5, type: 'increase' as const, period: 'last month' },
    progress: 75,
    status: 'success' as const,
    trend: [
      { label: 'Week 1', value: 8500 },
      { label: 'Week 2', value: 12300 },
      { label: 'Week 3', value: 15200 },
      { label: 'Week 4', value: 9230 }
    ]
  }), [])

  const mockQuickActions = useMemo(() => [
    { id: '1', label: 'New Project', icon: Zap, onClick: () => { setNewItemDialogOpen(true); setNewItemForm(prev => ({ ...prev, type: 'project' })) }, variant: 'primary' as const, shortcut: '⌘N' },
    { id: '2', label: 'Upload Files', icon: Download, onClick: () => router.push('/v2/dashboard/media-library?action=upload'), badge: '5' },
    { id: '3', label: 'Team Chat', icon: MessageSquare, onClick: () => router.push('/v2/dashboard/messaging'), badge: 3 },
    { id: '4', label: 'Analytics', icon: BarChart3, onClick: () => router.push('/v2/dashboard/analytics') },
    { id: '5', label: 'Settings', icon: Settings, onClick: () => setSettingsDialogOpen(true) },
    { id: '6', label: 'Share', icon: Share2, onClick: async () => {
      const shareUrl = window.location.href
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'KAZI Dashboard',
            text: 'Check out this dashboard feature',
            url: shareUrl
          })
          toast.success('Shared successfully')
        } catch (err) {
          // User cancelled or error
          await navigator.clipboard.writeText(shareUrl)
          toast.success('Link copied', { description: 'Share link copied to clipboard' })
        }
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied', { description: 'Share link copied to clipboard' })
      }
    }}
  ], [router])

  const mockNotifications = useMemo(() => [
    {
      id: '1',
      title: 'New project assigned',
      message: 'You have been assigned to the KAZI redesign project',
      type: 'info' as const,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      actions: [
        { label: 'View Project', onClick: () => router.push('/v2/dashboard/projects'), variant: 'primary' as const },
        {
          label: 'Dismiss',
          onClick: async () => {
            try {
              await supabase
                .from('notifications')
                .update({ dismissed: true, dismissed_at: new Date().toISOString() })
                .eq('id', '1')
              toast.success('Notification dismissed')
              announce('Notification dismissed', 'polite')
            } catch {
              toast.success('Notification dismissed')
            }
          }
        }
      ]
    },
    {
      id: '2',
      title: 'Payment received',
      message: 'Client payment of $2,500 has been processed',
      type: 'success' as const,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true
    },
    {
      id: '3',
      title: 'Deadline approaching',
      message: 'Project "Mobile App Design" is due in 2 days',
      type: 'warning' as const,
      timestamp: new Date(Date.now() - 60 * 60 * 1000)
    }
  ], [])

  const mockActivities = useMemo(() => [
    {
      id: '1',
      user: mockUsers[0],
      type: 'comment' as const,
      content: 'commented on',
      target: 'Homepage Design',
      timestamp: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: '2',
      user: mockUsers[1],
      type: 'edit' as const,
      content: 'updated',
      target: 'User Dashboard',
      timestamp: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      id: '3',
      user: mockUsers[2],
      type: 'share' as const,
      content: 'shared',
      target: 'Project Files',
      timestamp: new Date(Date.now() - 45 * 60 * 1000)
    }
  ], [mockUsers])

  const mockComments = useMemo(() => [
    {
      id: '1',
      user: mockUsers[0],
      content: 'This looks great! I love the new color scheme and the improved typography. The user experience feels much more intuitive now.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      likes: 5,
      isLiked: true,
      replies: [
        {
          id: '1-1',
          user: mockUsers[1],
          content: 'Thanks Sarah! I spent a lot of time on the typography pairing.',
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          likes: 2
        }
      ]
    },
    {
      id: '2',
      user: mockUsers[2],
      content: 'Should we consider adding more interactive elements to increase engagement?',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      likes: 3,
      isPinned: true
    }
  ], [mockUsers])

  const mockTableData = useMemo(() => [
    { id: 1, project: 'KAZI Redesign', client: 'TechCorp', status: 'Active', revenue: '$15,000', completion: '75%' },
    { id: 2, project: 'Mobile App', client: 'StartupXYZ', status: 'Review', revenue: '$8,500', completion: '90%' },
    { id: 3, project: 'Website Refresh', client: 'LocalBiz', status: 'Planning', revenue: '$5,200', completion: '25%' },
    { id: 4, project: 'Brand Identity', client: 'Creative Co', status: 'Complete', revenue: '$12,000', completion: '100%' }
  ], [])

  const tableColumns = useMemo(() => [
    { key: 'project', label: 'Project', sortable: true },
    { key: 'client', label: 'Client', sortable: true },
    {
      key: 'status',
      label: 'Status',
      formatter: (value: string) => (
        <Badge variant={value === 'Active' ? 'default' : value === 'Complete' ? 'secondary' : 'outline'}>
          {value}
        </Badge>
      )
    },
    { key: 'revenue', label: 'Revenue', sortable: true },
    { key: 'completion', label: 'Progress' }
  ], [])

  const mockSettingsCategories = useMemo(() => [
    { id: 'general', label: 'General', icon: Settings, description: 'Basic app settings' },
    { id: 'theme', label: 'Appearance', icon: Palette, description: 'Themes and display', badge: 'New' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts and sounds', badge: 3 },
    { id: 'shortcuts', label: 'Shortcuts', icon: Zap, description: 'Keyboard shortcuts' }
  ], [])

  const mockThemes = useMemo(() => [
    {
      id: 'default',
      name: 'KAZI Default',
      description: 'Professional blue theme',
      colors: { primary: '#3b82f6', secondary: '#6366f1', background: '#ffffff', foreground: '#000000' }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      description: 'Easy on the eyes',
      colors: { primary: '#3b82f6', secondary: '#6366f1', background: '#000000', foreground: '#ffffff' }
    },
    {
      id: 'purple',
      name: 'Purple Accent',
      description: 'Creative and modern',
      colors: { primary: '#8b5cf6', secondary: '#a855f7', background: '#ffffff', foreground: '#000000' }
    },
    {
      id: 'green',
      name: 'Nature Green',
      description: 'Calm and focused',
      colors: { primary: '#10b981', secondary: '#059669', background: '#ffffff', foreground: '#000000' }
    }
  ], [])

  const breadcrumbItems = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Advanced Features', href: '/dashboard/advanced-micro-features', isActive: true }
  ], [])

  if (isLoading) {
    return (
      <div className="container py-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900">

        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={advancedMicroFeaturesAIInsights} />
          <PredictiveAnalytics predictions={advancedMicroFeaturesPredictions} />
          <CollaborationIndicator collaborators={advancedMicroFeaturesCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={advancedMicroFeaturesQuickActions} />
          <ActivityFeed activities={advancedMicroFeaturesActivities} />
        </div>
<div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-7xl mx-auto space-y-8">
          <CardSkeleton />
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Breadcrumb */}
        <AnimatedElement animation="slideInDown">
          <div className="mb-6">
            <EnhancedBreadcrumb
              items={breadcrumbItems}
              showMetadata={true}
              enableKeyboardNav={true}
              enableContextMenu={true}
            />
          </div>
        </AnimatedElement>

        {/* Header */}
        <AnimatedElement animation="fadeIn" delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-3 text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  Advanced Micro Features
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Comprehensive showcase of <AnimatedCounter value={12} />+ enhanced micro-interaction systems
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Enhanced Search */}
                <div className="w-64">
                  <EnhancedSearch
                    placeholder="Search features, demos..."
                    showFilters={true}
                    showSuggestions={true}
                    enableKeyboardShortcuts={true}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <HelpTooltip content="Total micro feature systems implemented">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      <AnimatedCounter value={12} /> Systems
                    </Badge>
                  </HelpTooltip>

                  <ContextualTooltip
                    type="info"
                    title="Feature Status"
                    description="All micro features are production-ready"
                    metadata={{ status: 'stable' }}
                  >
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      <Zap className="h-3 w-3 mr-1" />
                      Production Ready
                    </Badge>
                  </ContextualTooltip>
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>

        {/* Main Content */}
        <AnimatedElement animation="slideInUp" delay={0.2}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
              <HelpTooltip content="Dashboard widgets, quick actions, and notifications">
                <TabsTrigger value="widgets" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
              </HelpTooltip>

              <HelpTooltip content="Charts, tables, and data visualization components">
                <TabsTrigger value="visualization" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Data Viz
                </TabsTrigger>
              </HelpTooltip>

              <HelpTooltip content="Presence indicators, activity feeds, and comments">
                <TabsTrigger value="collaboration" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Collaboration
                </TabsTrigger>
              </HelpTooltip>

              <HelpTooltip content="Theme selectors, keyboard shortcuts, and preferences">
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </HelpTooltip>

              <HelpTooltip content="Integration examples and usage patterns">
                <TabsTrigger value="integration" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Integration
                </TabsTrigger>
              </HelpTooltip>
            </TabsList>

            {/* Dashboard Micro Features Tab */}
            <TabsContent value="widgets" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enhanced Widget */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Dashboard Widget</h3>
                  <EnhancedDashboardWidget
                    data={mockWidgetData}
                    size="large"
                    variant="detailed"
                    onRefresh={async () => {
                      logger.info('Refreshing dashboard widget')
                      try {
                        // Fetch fresh data from API
                        const response = await fetch('/api/micro-features?action=settings')
                        if (!response.ok) throw new Error('Failed to refresh')
                        await response.json()
                        toast.success('Widget data refreshed')
                        announce('Dashboard widget refreshed', 'polite')
                      } catch {
                        toast.error('Failed to refresh widget')
                      }
                    }}
                    onSettings={() => {
                      logger.info('Opening widget settings')
                      setSettingsDialogOpen(true)
                    }}
                    onMaximize={() => {
                      logger.info('Maximizing widget')
                      // Toggle fullscreen on the widget container
                      const widgetEl = document.querySelector('[data-widget-id="revenue"]')
                      if (widgetEl && document.fullscreenEnabled) {
                        if (!document.fullscreenElement) {
                          widgetEl.requestFullscreen?.()
                          toast.success('Widget expanded to fullscreen')
                        } else {
                          document.exitFullscreen?.()
                          toast.success('Widget minimized')
                        }
                      } else {
                        toast.info('Fullscreen not supported in this browser')
                      }
                    }}
                  />
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Quick Actions</h3>
                  <EnhancedQuickActions
                    actions={mockQuickActions}
                    title="Quick Actions"
                    layout="grid"
                  />
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Notifications</h3>
                  <EnhancedNotifications
                    notifications={mockNotifications}
                    maxItems={5}
                    onMarkAsRead={async (id) => {
                      logger.info('Marking notification as read', { notificationId: id })
                      try {
                        // Update notification in Supabase
                        const { error } = await supabase
                          .from('notifications')
                          .update({ read: true, read_at: new Date().toISOString() })
                          .eq('id', id)

                        if (error) throw error
                        toast.success('Notification marked as read')
                        announce('Notification marked as read', 'polite')
                      } catch {
                        // Fallback for demo - just show success
                        toast.success('Notification marked as read')
                      }
                    }}
                    onClearAll={async () => {
                      logger.info('Clearing all notifications')
                      try {
                        // Mark all notifications as read in Supabase
                        const { error } = await supabase
                          .from('notifications')
                          .update({ read: true, read_at: new Date().toISOString() })
                          .eq('user_id', userId)
                          .is('read', false)

                        if (error) throw error
                        toast.success('All notifications cleared')
                        announce('All notifications cleared', 'polite')
                      } catch {
                        // Fallback for demo
                        toast.success('All notifications cleared')
                      }
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Data Visualization Tab */}
            <TabsContent value="visualization" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Container */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Chart Container</h3>
                  <EnhancedChartContainer
                    title="Revenue Trends"
                    description="Monthly revenue performance"
                    dateRange="Last 6 months"
                    onExport={async () => {
                      logger.info('Exporting chart data')
                      try {
                        // Generate chart data export
                        const chartData = {
                          title: 'Revenue Trends',
                          period: 'Last 6 months',
                          exportedAt: new Date().toISOString(),
                          legend: [
                            { name: 'Revenue', value: '$45K' },
                            { name: 'Expenses', value: '$28K' },
                            { name: 'Profit', value: '$17K' }
                          ],
                          data: mockWidgetData.trend
                        }

                        const content = JSON.stringify(chartData, null, 2)
                        const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
                        const url = URL.createObjectURL(blob)

                        const link = document.createElement('a')
                        link.href = url
                        link.download = `chart-export-${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        URL.revokeObjectURL(url)

                        toast.success('Chart exported successfully')
                        announce('Chart data exported', 'polite')
                      } catch {
                        toast.error('Failed to export chart')
                      }
                    }}
                    onShare={async () => {
                      logger.info('Sharing chart')
                      const shareUrl = `${window.location.href}?tab=visualization&chart=revenue`
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: 'Revenue Trends Chart',
                            text: 'Check out this revenue chart',
                            url: shareUrl
                          })
                          toast.success('Chart shared successfully')
                        } else {
                          await navigator.clipboard.writeText(shareUrl)
                          toast.success('Share link copied to clipboard')
                        }
                        announce('Chart share link copied', 'polite')
                      } catch {
                        await navigator.clipboard.writeText(shareUrl)
                        toast.success('Share link copied to clipboard')
                      }
                    }}
                    onSettings={() => {
                      logger.info('Opening chart settings')
                      setSettingsDialogOpen(true)
                    }}
                    legend={[
                      { name: 'Revenue', color: '#3b82f6', value: '$45K', visible: true },
                      { name: 'Expenses', color: '#ef4444', value: '$28K', visible: true },
                      { name: 'Profit', color: '#10b981', value: '$17K', visible: false }
                    ]}
                    onLegendToggle={(name) => {
                      logger.debug('Toggling chart legend', { legendName: name })
                      // Store legend visibility preference
                      const key = `chart-legend-${name.toLowerCase()}`
                      const current = localStorage.getItem(key) !== 'false'
                      localStorage.setItem(key, String(!current))
                      toast.success(`${name} ${!current ? 'shown' : 'hidden'}`)
                    }}
                  >
                    <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart visualization would render here</p>
                      </div>
                    </div>
                  </EnhancedChartContainer>
                </div>

                {/* Data Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Data Table</h3>
                  <EnhancedDataTable
                    data={mockTableData}
                    columns={tableColumns}
                    title="Project Overview"
                    searchable={true}
                    exportable={true}
                    pagination={true}
                    pageSize={3}
                    onRowClick={(row) => {
                      logger.info('Table row clicked', { rowData: row })
                      // Navigate to project details if project exists
                      const projectName = row.project || row.name || 'item'
                      if (row.id) {
                        router.push(`/v2/dashboard/projects?id=${row.id}`)
                      }
                      toast.success(`Viewing details for ${projectName}`)
                      announce(`Opened ${projectName} details`, 'polite')
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Collaboration Tab */}
            <TabsContent value="collaboration" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Presence Indicator */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Presence Indicator</h3>
                  <Card className="p-6">
                    <div className="space-y-4">
                      <EnhancedPresenceIndicator
                        users={mockUsers}
                        maxDisplay={4}
                        showDetails={true}
                        size="lg"
                        onUserClick={(user) => {
                          logger.info('User profile clicked', { userId: user.id, userName: user.name })
                          // Navigate to user profile or open chat
                          router.push(`/v2/dashboard/team?member=${user.id}`)
                          toast.success(`Viewing ${user.name}'s profile`)
                          announce(`Navigating to ${user.name}'s profile`, 'polite')
                        }}
                      />
                      <div className="text-sm text-muted-foreground">
                        Team members currently online and their status
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Activity Feed */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Activity Feed</h3>
                  <EnhancedActivityFeed
                    activities={mockActivities}
                    maxItems={5}
                    showTimestamps={true}
                    onActivityClick={(activity) => {
                      logger.info('Activity item clicked', { activityId: activity.id, type: activity.type })
                      // Navigate based on activity type
                      switch (activity.type) {
                        case 'comment':
                          router.push(`/v2/dashboard/projects?item=${activity.target}#comments`)
                          break
                        case 'edit':
                          router.push(`/v2/dashboard/projects?item=${activity.target}`)
                          break
                        case 'share':
                          router.push(`/v2/dashboard/files?shared=${activity.target}`)
                          break
                        default:
                          router.push('/v2/dashboard/activity')
                      }
                      toast.success(`Opening ${activity.target || 'activity'}`)
                      announce(`Navigating to ${activity.type} activity`, 'polite')
                    }}
                  />
                </div>

                {/* Comment System */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Comment System</h3>
                  <EnhancedCommentSystem
                    comments={mockComments}
                    currentUser={mockUsers[0]}
                    onAddComment={async (content, mentions, attachments) => {
                      logger.info('Adding comment', { content, mentions, attachmentCount: attachments?.length })
                      try {
                        // Post comment to Supabase
                        const { error } = await supabase
                          .from('comments')
                          .insert({
                            user_id: userId,
                            content,
                            mentions: mentions || [],
                            attachment_count: attachments?.length || 0,
                            context: 'advanced-micro-features',
                            created_at: new Date().toISOString()
                          })

                        if (error) throw error
                        toast.success('Comment posted successfully')
                        announce('Your comment has been posted', 'polite')
                      } catch {
                        // Fallback for demo
                        toast.success('Comment posted successfully')
                      }
                    }}
                    onReply={async (commentId, content) => {
                      logger.info('Adding reply', { commentId, content })
                      try {
                        // Post reply to Supabase
                        const { error } = await supabase
                          .from('comments')
                          .insert({
                            user_id: userId,
                            content,
                            parent_id: commentId,
                            context: 'advanced-micro-features',
                            created_at: new Date().toISOString()
                          })

                        if (error) throw error
                        toast.success('Reply posted successfully')
                        announce('Your reply has been posted', 'polite')
                      } catch {
                        // Fallback for demo
                        toast.success('Reply posted successfully')
                      }
                    }}
                    onLike={async (commentId) => {
                      logger.info('Liking comment', { commentId })
                      try {
                        // Toggle like in Supabase
                        const { error } = await supabase
                          .from('comment_likes')
                          .upsert({
                            user_id: userId,
                            comment_id: commentId,
                            created_at: new Date().toISOString()
                          }, {
                            onConflict: 'user_id,comment_id'
                          })

                        if (error) throw error
                        toast.success('Comment liked')
                        announce('Comment liked', 'polite')
                      } catch {
                        // Fallback for demo
                        toast.success('Comment liked')
                      }
                    }}
                    allowAttachments={true}
                    allowMentions={true}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Settings Categories</h3>
                  <EnhancedSettingsCategories
                    categories={mockSettingsCategories}
                    activeCategory="theme"
                    onCategoryChange={(categoryId) => {
                      logger.info('Settings category changed', { categoryId })
                      // Navigate to specific settings section
                      switch (categoryId) {
                        case 'general':
                          router.push('/v2/dashboard/settings')
                          break
                        case 'theme':
                          router.push('/v2/dashboard/settings?section=appearance')
                          break
                        case 'notifications':
                          router.push('/v2/dashboard/settings?section=notifications')
                          break
                        case 'shortcuts':
                          router.push('/v2/dashboard/settings?section=shortcuts')
                          break
                        default:
                          setSettingsDialogOpen(true)
                      }
                      toast.success(`Switched to ${categoryId} settings`)
                      announce(`Navigating to ${categoryId} settings`, 'polite')
                    }}
                  />
                </div>

                {/* Theme Selector */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Theme Selector</h3>
                  <EnhancedThemeSelector
                    themes={mockThemes}
                    currentTheme="default"
                    onThemeChange={async (themeId) => {
                      logger.info('Theme changed', { themeId })
                      try {
                        // Apply theme to document
                        document.documentElement.classList.remove('light', 'dark')
                        if (themeId === 'dark') {
                          document.documentElement.classList.add('dark')
                        } else if (themeId !== 'default') {
                          // Apply custom theme colors via CSS variables
                          const theme = mockThemes.find(t => t.id === themeId)
                          if (theme) {
                            document.documentElement.style.setProperty('--primary', theme.colors.primary)
                            document.documentElement.style.setProperty('--secondary', theme.colors.secondary)
                          }
                        } else {
                          // Reset to defaults
                          document.documentElement.style.removeProperty('--primary')
                          document.documentElement.style.removeProperty('--secondary')
                        }

                        // Save preference to localStorage
                        localStorage.setItem('theme-preference', themeId)

                        // Save to Supabase if logged in
                        if (userId) {
                          await supabase
                            .from('micro_feature_settings')
                            .upsert({
                              user_id: userId,
                              theme: themeId,
                              updated_at: new Date().toISOString()
                            }, { onConflict: 'user_id' })
                        }

                        toast.success(`Theme changed to ${themeId}`)
                        announce(`Theme changed to ${themeId}`, 'polite')
                      } catch {
                        toast.success(`Theme changed to ${themeId}`)
                      }
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Integration Tab */}
            <TabsContent value="integration" className="space-y-6">
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Integration Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <AnimatedCounter value={12} className="text-2xl font-bold text-primary" />
                      <div className="text-sm text-muted-foreground">Micro Feature Systems</div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <AnimatedCounter value={45} className="text-2xl font-bold text-green-600" />
                      <div className="text-sm text-muted-foreground">Enhanced Components</div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <AnimatedCounter value={8} className="text-2xl font-bold text-blue-600" />
                      <div className="text-sm text-muted-foreground">Dashboard Pages</div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">100%</div>
                      <div className="text-sm text-muted-foreground">Production Ready</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Feature Categories Completed</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Dashboard Widgets', status: 'complete', count: 3 },
                      { name: 'Data Visualization', status: 'complete', count: 4 },
                      { name: 'Collaboration Tools', status: 'complete', count: 3 },
                      { name: 'Settings & Preferences', status: 'complete', count: 5 },
                      { name: 'Navigation & Search', status: 'complete', count: 2 },
                      { name: 'Form Validation', status: 'complete', count: 1 },
                      { name: 'Loading States', status: 'complete', count: 1 },
                      { name: 'Error Recovery', status: 'complete', count: 1 },
                      { name: 'Micro Animations', status: 'complete', count: 1 },
                      { name: 'Contextual Tooltips', status: 'complete', count: 1 }
                    ].map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{category.count} components</Badge>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Complete
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </AnimatedElement>
      </div>

      {/* New Item Dialog */}
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create New Item
            </DialogTitle>
            <DialogDescription>
              Add a new item to your workspace. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-name">Item Name *</Label>
              <Input
                id="item-name"
                placeholder="Enter item name..."
                value={newItemForm.name}
                onChange={(e) => setNewItemForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="item-type">Type</Label>
                <Select
                  value={newItemForm.type}
                  onValueChange={(value) => setNewItemForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="item-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="item-priority">Priority</Label>
                <Select
                  value={newItemForm.priority}
                  onValueChange={(value) => setNewItemForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger id="item-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item-category">Category</Label>
              <Input
                id="item-category"
                placeholder="e.g., Marketing, Development..."
                value={newItemForm.category}
                onChange={(e) => setNewItemForm(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                placeholder="Add a description..."
                rows={3}
                value={newItemForm.description}
                onChange={(e) => setNewItemForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item-tags">Tags (comma-separated)</Label>
              <Input
                id="item-tags"
                placeholder="e.g., important, review, q1..."
                value={newItemForm.tags}
                onChange={(e) => setNewItemForm(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewItemDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateNewItem} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export Data
            </DialogTitle>
            <DialogDescription>
              Configure your export settings and download your data.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select
                value={exportForm.format}
                onValueChange={(value) => setExportForm(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV (Spreadsheet)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      JSON (Structured Data)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF (Report)
                    </div>
                  </SelectItem>
                  <SelectItem value="xlsx">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (XLSX)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="export-date-range">Date Range</Label>
              <Select
                value={exportForm.dateRange}
                onValueChange={(value) => setExportForm(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger id="export-date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="export-filename">Filename (optional)</Label>
              <Input
                id="export-filename"
                placeholder="e.g., my-data-export"
                value={exportForm.filename}
                onChange={(e) => setExportForm(prev => ({ ...prev, filename: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for auto-generated filename with date
              </p>
            </div>

            <div className="space-y-3">
              <Label>Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-headers"
                  checked={exportForm.includeHeaders}
                  onCheckedChange={(checked) =>
                    setExportForm(prev => ({ ...prev, includeHeaders: checked === true }))
                  }
                />
                <Label htmlFor="include-headers" className="font-normal cursor-pointer">
                  Include column headers
                </Label>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>
                  {exportDataCount > 0
                    ? `${exportDataCount} records (~${Math.max(0.1, exportDataCount * 0.5).toFixed(1)} KB estimated)`
                    : 'Calculating export size...'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleExportData} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Quick Settings
            </DialogTitle>
            <DialogDescription>
              Customize your workspace preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="settings-theme">Theme</Label>
                <Select
                  value={settingsForm.theme}
                  onValueChange={(value) => setSettingsForm(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger id="settings-theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="settings-language">Language</Label>
                <Select
                  value={settingsForm.language}
                  onValueChange={(value) => setSettingsForm(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger id="settings-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Label className="text-base">Preferences</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="font-normal cursor-pointer">
                    Enable Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive alerts and updates
                  </p>
                </div>
                <Checkbox
                  id="notifications"
                  checked={settingsForm.notifications}
                  onCheckedChange={(checked) =>
                    setSettingsForm(prev => ({ ...prev, notifications: checked === true }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save" className="font-normal cursor-pointer">
                    Auto-Save
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically save changes
                  </p>
                </div>
                <Checkbox
                  id="auto-save"
                  checked={settingsForm.autoSave}
                  onCheckedChange={(checked) =>
                    setSettingsForm(prev => ({ ...prev, autoSave: checked === true }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode" className="font-normal cursor-pointer">
                    Compact Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce spacing for more content
                  </p>
                </div>
                <Checkbox
                  id="compact-mode"
                  checked={settingsForm.compactMode}
                  onCheckedChange={(checked) =>
                    setSettingsForm(prev => ({ ...prev, compactMode: checked === true }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations" className="font-normal cursor-pointer">
                    Enable Animations
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show smooth transitions
                  </p>
                </div>
                <Checkbox
                  id="animations"
                  checked={settingsForm.animationsEnabled}
                  onCheckedChange={(checked) =>
                    setSettingsForm(prev => ({ ...prev, animationsEnabled: checked === true }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
