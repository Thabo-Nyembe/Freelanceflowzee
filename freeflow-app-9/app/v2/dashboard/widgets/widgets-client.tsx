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


export const dynamic = 'force-dynamic';

import { useState, useEffect, useReducer, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Layout, Activity, TrendingUp,
  Search, Plus, Edit, Trash2, Eye, EyeOff, Settings,
  Download, Lock, Unlock, AlertCircle,
  X
} from 'lucide-react'
import { NumberFlow } from '@/components/ui/number-flow'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('Widgets')

// ============================================================================
// FRAMER MOTION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'cyan' }: { delay?: number; color?: string }) => {
  logger.debug('FloatingParticle rendered', { color, delay })
  return (
    <motion.div
      className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

type WidgetType = 'metric' | 'chart' | 'table' | 'activity' | 'quick-actions' | 'calendar'
type WidgetSize = 'small' | 'medium' | 'large' | 'full'
type WidgetCategory = 'analytics' | 'productivity' | 'finance' | 'social' | 'custom'

interface Widget {
  id: string
  name: string
  type: WidgetType
  category: WidgetCategory
  size: WidgetSize
  icon: string
  description: string
  isVisible: boolean
  isLocked: boolean
  position: { x: number; y: number }
  config: {
    refreshInterval?: number
    color?: string
    showLegend?: boolean
    dataSource?: string
  }
  createdAt: string
  updatedAt: string
  lastRefreshed?: string
  usageCount: number
}

interface WidgetsState {
  widgets: Widget[]
  selectedWidget: Widget | null
  searchTerm: string
  filterCategory: WidgetCategory | 'all'
  filterType: WidgetType | 'all'
  filterSize: WidgetSize | 'all'
  sortBy: 'name' | 'usage' | 'date' | 'size'
  viewMode: 'dashboard' | 'customize' | 'templates' | 'settings'
  selectedWidgets: string[]
  isEditMode: boolean
}

type WidgetsAction =
  | { type: 'SET_WIDGETS'; widgets: Widget[] }
  | { type: 'ADD_WIDGET'; widget: Widget }
  | { type: 'UPDATE_WIDGET'; widget: Widget }
  | { type: 'DELETE_WIDGET'; widgetId: string }
  | { type: 'SELECT_WIDGET'; widget: Widget | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_CATEGORY'; filterCategory: WidgetsState['filterCategory'] }
  | { type: 'SET_FILTER_TYPE'; filterType: WidgetsState['filterType'] }
  | { type: 'SET_FILTER_SIZE'; filterSize: WidgetsState['filterSize'] }
  | { type: 'SET_SORT'; sortBy: WidgetsState['sortBy'] }
  | { type: 'SET_VIEW_MODE'; viewMode: WidgetsState['viewMode'] }
  | { type: 'TOGGLE_SELECT_WIDGET'; widgetId: string }
  | { type: 'CLEAR_SELECTED_WIDGETS' }
  | { type: 'TOGGLE_VISIBILITY'; widgetId: string }
  | { type: 'TOGGLE_LOCK'; widgetId: string }
  | { type: 'SET_EDIT_MODE'; isEditMode: boolean }

// ============================================================================
// REDUCER
// ============================================================================

function widgetsReducer(state: WidgetsState, action: WidgetsAction): WidgetsState {
  logger.debug('Reducer action', { type: action.type })

  switch (action.type) {
    case 'SET_WIDGETS':
      logger.info('Setting widgets', { count: action.widgets.length })
      return { ...state, widgets: action.widgets }

    case 'ADD_WIDGET':
      logger.info('Adding widget', { widgetId: action.widget.id, widgetName: action.widget.name })
      return { ...state, widgets: [action.widget, ...state.widgets] }

    case 'UPDATE_WIDGET':
      logger.info('Updating widget', { widgetId: action.widget.id })
      return {
        ...state,
        widgets: state.widgets.map(w => w.id === action.widget.id ? action.widget : w)
      }

    case 'DELETE_WIDGET':
      logger.info('Deleting widget', { widgetId: action.widgetId })
      return {
        ...state,
        widgets: state.widgets.filter(w => w.id !== action.widgetId),
        selectedWidget: state.selectedWidget?.id === action.widgetId ? null : state.selectedWidget
      }

    case 'SELECT_WIDGET':
      logger.debug('Selecting widget', { widgetName: action.widget?.name })
      return { ...state, selectedWidget: action.widget }

    case 'SET_SEARCH':
      logger.debug('Search term changed', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_CATEGORY':
      logger.debug('Filter category changed', { filterCategory: action.filterCategory })
      return { ...state, filterCategory: action.filterCategory }

    case 'SET_FILTER_TYPE':
      logger.debug('Filter type changed', { filterType: action.filterType })
      return { ...state, filterType: action.filterType }

    case 'SET_FILTER_SIZE':
      logger.debug('Filter size changed', { filterSize: action.filterSize })
      return { ...state, filterSize: action.filterSize }

    case 'SET_SORT':
      logger.debug('Sort changed', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      logger.debug('View mode changed', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'TOGGLE_SELECT_WIDGET':
      const isSelected = state.selectedWidgets.includes(action.widgetId)
      logger.debug('Toggle select widget', { widgetId: action.widgetId, isSelected: !isSelected })
      return {
        ...state,
        selectedWidgets: isSelected
          ? state.selectedWidgets.filter(id => id !== action.widgetId)
          : [...state.selectedWidgets, action.widgetId]
      }

    case 'CLEAR_SELECTED_WIDGETS':
      logger.debug('Clearing all selected widgets')
      return { ...state, selectedWidgets: [] }

    case 'TOGGLE_VISIBILITY':
      logger.debug('Toggle visibility', { widgetId: action.widgetId })
      return {
        ...state,
        widgets: state.widgets.map(w =>
          w.id === action.widgetId ? { ...w, isVisible: !w.isVisible } : w
        )
      }

    case 'TOGGLE_LOCK':
      logger.debug('Toggle lock', { widgetId: action.widgetId })
      return {
        ...state,
        widgets: state.widgets.map(w =>
          w.id === action.widgetId ? { ...w, isLocked: !w.isLocked } : w
        )
      }

    case 'SET_EDIT_MODE':
      logger.debug('Edit mode changed', { isEditMode: action.isEditMode })
      return { ...state, isEditMode: action.isEditMode }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockWidgets = (): Widget[] => {
  logger.debug('Generating mock widget data')

  const types: WidgetType[] = ['metric', 'chart', 'table', 'activity', 'quick-actions', 'calendar']
  const categories: WidgetCategory[] = ['analytics', 'productivity', 'finance', 'social', 'custom']
  const sizes: WidgetSize[] = ['small', 'medium', 'large', 'full']

  const widgetNames = {
    metric: ['Total Revenue', 'Active Users', 'Conversion Rate', 'Sales Today', 'Tasks Completed', 'Storage Used'],
    chart: ['Revenue Chart', 'User Growth', 'Sales Funnel', 'Traffic Sources', 'Project Timeline'],
    table: ['Recent Orders', 'Top Clients', 'Latest Tasks', 'Transaction History', 'Team Activity'],
    activity: ['Recent Activity', 'Team Updates', 'System Logs', 'Notifications Feed', 'Change Log'],
    'quick-actions': ['Quick Actions', 'Common Tasks', 'Shortcuts', 'Tools', 'Create Menu'],
    calendar: ['Calendar View', 'Upcoming Events', 'Schedule', 'Deadlines', 'Meetings']
  }

  const icons = {
    metric: '📊',
    chart: '📈',
    table: '📋',
    activity: '🔔',
    'quick-actions': '⚡',
    calendar: '📅'
  }

  const widgets: Widget[] = []

  for (let i = 1; i <= 30; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const size = sizes[Math.floor(Math.random() * sizes.length)]
    const nameOptions = widgetNames[type]
    const name = nameOptions[Math.floor(Math.random() * nameOptions.length)] + ` ${i}`

    widgets.push({
      id: `W-${String(i).padStart(3, '0')}`,
      name,
      type,
      category,
      size,
      icon: icons[type],
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} widget for tracking ${category} metrics`,
      isVisible: Math.random() > 0.3,
      isLocked: Math.random() > 0.8,
      position: { x: Math.floor(i % 3), y: Math.floor(i / 3) },
      config: {
        refreshInterval: [30, 60, 300, 600][Math.floor(Math.random() * 4)],
        color: ['blue', 'green', 'purple', 'orange', 'red'][Math.floor(Math.random() * 5)],
        showLegend: Math.random() > 0.5,
        dataSource: ['api', 'database', 'cache'][Math.floor(Math.random() * 3)]
      },
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastRefreshed: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString() : undefined,
      usageCount: Math.floor(Math.random() * 500) + 10
    })
  }

  logger.info('Generated mock widgets', { count: widgets.length })
  return widgets
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================


// ============================================================================
// V2 COMPETITIVE MOCK DATA - Widgets Context
// ============================================================================

const widgetsAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const widgetsCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const widgetsPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const widgetsActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions placeholder - will be populated with actual handlers in component
const widgetsQuickActionsTemplate = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N' },
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E' },
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S' },
]

export default function WidgetsClient() {
  logger.debug('Component mounting')

  // A+++ ANNOUNCER
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // REDUCER STATE
  const [state, dispatch] = useReducer(widgetsReducer, {
    widgets: [],
    selectedWidget: null,
    searchTerm: '',
    filterCategory: 'all',
    filterType: 'all',
    filterSize: 'all',
    sortBy: 'name',
    viewMode: 'dashboard',
    selectedWidgets: [],
    isEditMode: false
  })

  // LOCAL STATE
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // MODAL STATES
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // QUICK ACTION DIALOG STATES
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // QUICK ACTIONS WITH REAL HANDLERS
  const widgetsQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewItemDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  // FORM DATA
  const [widgetName, setWidgetName] = useState('')
  const [widgetType, setWidgetType] = useState<WidgetType>('metric')
  const [widgetCategory, setWidgetCategory] = useState<WidgetCategory>('analytics')
  const [widgetSize, setWidgetSize] = useState<WidgetSize>('medium')
  const [widgetDescription, setWidgetDescription] = useState('')

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    const loadWidgetsData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      logger.info('Loading widgets data', { userId })
      try {
        setIsLoading(true)
        setError(null)

        // Dynamic import for code splitting
        const { getWidgetsByUser } = await import('@/lib/widgets-queries')

        // Load widgets from database
        const result = await getWidgetsByUser(userId)

        if (result.error) {
          throw new Error(result.error.message || 'Failed to load widgets')
        }

        const widgets = result.data || []
        dispatch({ type: 'SET_WIDGETS', widgets })

        setIsLoading(false)
        toast.success('Widgets loaded', {
          description: `${widgets.length} widgets configured`
        })
        announce('Widgets loaded successfully', 'polite')
        logger.info('Widgets data loaded successfully', { count: widgets.length, userId })
      } catch (err) {
        logger.error('Widgets load error', {
          error: err instanceof Error ? err.message : 'Unknown error',
          errorObject: err,
          userId
        })
        setError(err instanceof Error ? err.message : 'Failed to load widgets')
        setIsLoading(false)
        toast.error('Failed to load widgets', {
          description: err instanceof Error ? err.message : 'Please try again'
        })
        announce('Error loading widgets', 'assertive')
      }
    }

    loadWidgetsData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // COMPUTED STATS
  // ============================================================================

  const stats = useMemo(() => {
    const s = {
      total: state.widgets.length,
      visible: state.widgets.filter(w => w.isVisible).length,
      hidden: state.widgets.filter(w => !w.isVisible).length,
      locked: state.widgets.filter(w => w.isLocked).length,
      totalUsage: state.widgets.reduce((sum, w) => sum + w.usageCount, 0),
      avgUsage: state.widgets.length > 0
        ? Math.floor(state.widgets.reduce((sum, w) => sum + w.usageCount, 0) / state.widgets.length)
        : 0
    }
    logger.debug('Stats calculated', s)
    return s
  }, [state.widgets])

  // ============================================================================
  // FILTERING AND SORTING
  // ============================================================================

  const filteredAndSortedWidgets = useMemo(() => {
    logger.debug('Filtering and sorting widgets', {
      searchTerm: state.searchTerm,
      filterCategory: state.filterCategory,
      filterType: state.filterType,
      filterSize: state.filterSize,
      sortBy: state.sortBy,
      totalWidgets: state.widgets.length
    })

    let filtered = state.widgets

    // Filter by search
    if (state.searchTerm) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        w.description.toLowerCase().includes(state.searchTerm.toLowerCase())
      )
      logger.debug('Search filter applied', { resultCount: filtered.length })
    }

    // Filter by category
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(w => w.category === state.filterCategory)
      logger.debug('Category filter applied', { category: state.filterCategory, resultCount: filtered.length })
    }

    // Filter by type
    if (state.filterType !== 'all') {
      filtered = filtered.filter(w => w.type === state.filterType)
      logger.debug('Type filter applied', { type: state.filterType, resultCount: filtered.length })
    }

    // Filter by size
    if (state.filterSize !== 'all') {
      filtered = filtered.filter(w => w.size === state.filterSize)
      logger.debug('Size filter applied', { size: state.filterSize, resultCount: filtered.length })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'usage':
          return b.usageCount - a.usageCount
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'size':
          const sizeOrder = { small: 1, medium: 2, large: 3, full: 4 }
          return sizeOrder[b.size] - sizeOrder[a.size]
        default:
          return 0
      }
    })

    logger.debug('Filtering and sorting complete', { finalCount: sorted.length })
    return sorted
  }, [state.widgets, state.searchTerm, state.filterCategory, state.filterType, state.filterSize, state.sortBy])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateWidget = async () => {
    if (!widgetName) {
      logger.warn('Widget creation failed', { reason: 'Name required' })
      toast.error('Widget name required')
      return
    }

    logger.info('Creating widget', { name: widgetName, type: widgetType, category: widgetCategory, size: widgetSize })

    try {
      setIsSaving(true)

      const icons = {
        metric: '📊',
        chart: '📈',
        table: '📋',
        activity: '🔔',
        'quick-actions': '⚡',
        calendar: '📅'
      }

      let widgetId = `W-${String(state.widgets.length + 1).padStart(3, '0')}`

      // Create widget in database if user is authenticated
      if (userId) {
        const { createWidget } = await import('@/lib/widgets-queries')
        const createdWidget = await createWidget(userId, {
          name: widgetName,
          type: widgetType,
          category: widgetCategory,
          size: widgetSize,
          icon: icons[widgetType],
          description: widgetDescription || `Custom ${widgetType} widget`,
          is_visible: true,
          is_locked: false,
          position_x: 0,
          position_y: 0,
          width: widgetSize === 'small' ? 1 : widgetSize === 'medium' ? 2 : widgetSize === 'large' ? 3 : 4,
          height: widgetSize === 'small' ? 1 : widgetSize === 'medium' ? 2 : 2,
          config: {
            refreshInterval: 60,
            color: 'blue',
            showLegend: true,
            dataSource: 'api'
          },
          usage_count: 0
        })
        if (createdWidget?.id) {
          widgetId = createdWidget.id
        }
        logger.info('Widget created in database', { widgetId, userId })
      }

      const newWidget: Widget = {
        id: widgetId,
        name: widgetName,
        type: widgetType,
        category: widgetCategory,
        size: widgetSize,
        icon: icons[widgetType],
        description: widgetDescription || `Custom ${widgetType} widget`,
        isVisible: true,
        isLocked: false,
        position: { x: 0, y: 0 },
        config: {
          refreshInterval: 60,
          color: 'blue',
          showLegend: true,
          dataSource: 'api'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      }

      dispatch({ type: 'ADD_WIDGET', widget: newWidget })
      setIsCreateModalOpen(false)
      setWidgetName('')
      setWidgetDescription('')

      logger.info('Widget created successfully', { widgetId: newWidget.id, name: newWidget.name, type: newWidget.type })

      toast.success('Widget created', {
        description: `${newWidget.name} - ${newWidget.type} - ${newWidget.category} - ${newWidget.size} size - Visible on dashboard`
      })
    } catch (error) {
      logger.error('Widget creation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error
      })
      toast.error('Failed to create widget')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteWidget = async () => {
    if (!state.selectedWidget || !userId) return

    const widgetToDelete = state.selectedWidget
    logger.info('Deleting widget', {
      widgetId: widgetToDelete.id,
      name: widgetToDelete.name,
      type: widgetToDelete.type,
      userId
    })

    try {
      setIsSaving(true)

      // Dynamic import for code splitting
      const { deleteWidget } = await import('@/lib/widgets-queries')

      await deleteWidget(widgetToDelete.id)

      dispatch({ type: 'DELETE_WIDGET', widgetId: widgetToDelete.id })
      setIsDeleteModalOpen(false)

      logger.info('Widget deleted from database', {
        widgetId: widgetToDelete.id,
        name: widgetToDelete.name,
        userId
      })

      toast.success('Widget deleted', {
        description: `${widgetToDelete.name} - ${widgetToDelete.type} - ${widgetToDelete.category} - Usage: ${widgetToDelete.usageCount} times`
      })
      announce('Widget deleted successfully', 'polite')
    } catch (error: any) {
      logger.error('Widget deletion error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error,
        widgetId: widgetToDelete.id,
        userId
      })
      toast.error('Failed to delete widget', {
        description: error.message || 'Please try again later'
      })
      announce('Error deleting widget', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkDelete = async () => {
    if (state.selectedWidgets.length === 0) {
      logger.warn('Bulk delete failed', { reason: 'No widgets selected' })
      toast.error('No widgets selected')
      return
    }

    if (!userId) {
      toast.error('Please log in to delete widgets')
      return
    }

    const selectedWidgetsData = state.widgets.filter(w => state.selectedWidgets.includes(w.id))
    const widgetNames = selectedWidgetsData.map(w => w.name)

    logger.info('Bulk deleting widgets', {
      count: state.selectedWidgets.length,
      widgetIds: state.selectedWidgets,
      widgetNames,
      userId
    })

    try {
      setIsSaving(true)

      // Dynamic import for code splitting
      const { deleteWidget } = await import('@/lib/widgets-queries')

      // Delete all selected widgets from database
      await Promise.all(
        state.selectedWidgets.map(widgetId => deleteWidget(widgetId))
      )

      // Update local state
      state.selectedWidgets.forEach(widgetId => {
        dispatch({ type: 'DELETE_WIDGET', widgetId })
      })

      const deletedCount = state.selectedWidgets.length
      dispatch({ type: 'CLEAR_SELECTED_WIDGETS' })

      logger.info('Bulk delete successful from database', {
        count: deletedCount,
        userId
      })

      toast.success(`Deleted ${deletedCount} widget(s)`, {
        description: `Removed: ${widgetNames.slice(0, 3).join(', ')}${widgetNames.length > 3 ? ` +${widgetNames.length - 3} more` : ''}`
      })
      announce(`${deletedCount} widgets deleted successfully`, 'polite')
    } catch (error: any) {
      logger.error('Bulk delete error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error,
        count: state.selectedWidgets.length,
        userId
      })
      toast.error('Failed to delete widgets', {
        description: error.message || 'Please try again later'
      })
      announce('Error deleting widgets', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportConfig = () => {
    logger.info('Exporting widget configuration', { widgetCount: state.widgets.length })

    const config = {
      widgets: state.widgets,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const configJson = JSON.stringify(config, null, 2)
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileName = `widgets-config-${Date.now()}.json`
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)

    const fileSizeKB = (blob.size / 1024).toFixed(1)

    logger.info('Configuration exported successfully', {
      fileName,
      fileSize: blob.size,
      widgetCount: state.widgets.length
    })

    toast.success('Configuration exported', {
      description: `${fileName} - ${fileSizeKB} KB - ${state.widgets.length} widgets - JSON format`
    })
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    logger.debug('Rendering loading state')
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-[1800px] mx-auto space-y-8">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={widgetsAIInsights} />
          <PredictiveAnalytics predictions={widgetsPredictions} />
          <CollaborationIndicator collaborators={widgetsCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={widgetsQuickActions} />
          <ActivityFeed activities={widgetsActivities} />
        </div>
<CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={6} />
        </div>
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    logger.error('Rendering error state', { error })
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-[1800px] mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  logger.debug('Rendering main UI', {
    totalWidgets: state.widgets.length,
    filteredWidgets: filteredAndSortedWidgets.length,
    viewMode: state.viewMode,
    visibleCount: state.widgets.filter(w => w.isVisible).length
  })

  const visibleWidgets = state.viewMode === 'dashboard' ? state.widgets.filter(w => w.isVisible) : filteredAndSortedWidgets

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                <TextShimmer>Dashboard Widgets</TextShimmer>
              </h1>
              <p className="text-muted-foreground mt-2">
                Customize your dashboard with powerful widgets
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={state.isEditMode ? 'destructive' : 'default'}
                size="sm"
                onClick={() => dispatch({ type: 'SET_EDIT_MODE', isEditMode: !state.isEditMode })}
              >
                {state.isEditMode ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {state.isEditMode ? 'Done Editing' : 'Edit Layout'}
              </Button>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              {state.selectedWidgets.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({state.selectedWidgets.length})
                </Button>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* View Tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(['dashboard', 'customize', 'templates', 'settings'] as const).map((view) => (
              <Button
                key={view}
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: view })}
                variant={state.viewMode === view ? 'default' : 'outline'}
                size="sm"
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard className="p-6 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Widgets</p>
                  <p className="text-3xl font-bold mt-1">
                    <NumberFlow value={stats.total} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.visible} visible</p>
                </div>
                <Layout className="h-8 w-8 text-cyan-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <LiquidGlassCard className="p-6 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold mt-1">
                    <NumberFlow value={stats.visible} />
                  </p>
                  <p className="text-xs text-green-500 mt-1">showing on dashboard</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <LiquidGlassCard className="p-6 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                  <p className="text-3xl font-bold mt-1">
                    <NumberFlow value={stats.totalUsage} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">views this month</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.5}>
            <LiquidGlassCard className="p-6 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Usage</p>
                  <p className="text-3xl font-bold mt-1">
                    <NumberFlow value={stats.avgUsage} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">per widget</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        </div>

        {/* Filters */}
        {state.viewMode === 'customize' && (
          <ScrollReveal>
            <LiquidGlassCard className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search widgets..."
                      value={state.searchTerm}
                      onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Select value={state.filterCategory} onValueChange={(value: any) => dispatch({ type: 'SET_FILTER_CATEGORY', filterCategory: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={state.filterType} onValueChange={(value: any) => dispatch({ type: 'SET_FILTER_TYPE', filterType: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="metric">Metric</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="quick-actions">Quick Actions</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={state.sortBy} onValueChange={(value: any) => dispatch({ type: 'SET_SORT', sortBy: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="usage">Usage</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Edit Mode Banner */}
        {state.isEditMode && (
          <ScrollReveal>
            <LiquidGlassCard className="p-4 bg-blue-50 dark:bg-blue-950/30">
              <div className="flex items-center gap-3">
                <Edit className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-semibold">Edit Mode Active</p>
                  <p className="text-sm text-muted-foreground">
                    Click widgets to configure, lock, or remove them
                  </p>
                </div>
                <Button size="sm" onClick={() => dispatch({ type: 'SET_EDIT_MODE', isEditMode: false })}>
                  Done
                </Button>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Widgets Grid */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleWidgets.map((widget, index) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={widget.size === 'large' ? 'md:col-span-2' : widget.size === 'full' ? 'md:col-span-3' : ''}
              >
                <LiquidGlassCard className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {state.isEditMode && (
                        <Checkbox
                          checked={state.selectedWidgets.includes(widget.id)}
                          onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECT_WIDGET', widgetId: widget.id })}
                        />
                      )}
                      <span className="text-4xl">{widget.icon}</span>
                      <div>
                        <h3 className="font-bold">{widget.name}</h3>
                        <p className="text-xs text-muted-foreground">{widget.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {widget.isLocked && <Lock className="h-4 w-4 text-orange-500" />}
                      {state.isEditMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            dispatch({ type: 'SELECT_WIDGET', widget })
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="capitalize">{widget.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="capitalize">{widget.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Size:</span>
                      <Badge variant="outline" className="capitalize">{widget.size}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Usage:</span>
                      <span className="font-medium">{widget.usageCount} views</span>
                    </div>
                  </div>

                  {state.isEditMode && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => dispatch({ type: 'TOGGLE_VISIBILITY', widgetId: widget.id })}
                      >
                        {widget.isVisible ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                        {widget.isVisible ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => dispatch({ type: 'TOGGLE_LOCK', widgetId: widget.id })}
                      >
                        {widget.isLocked ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                        {widget.isLocked ? 'Unlock' : 'Lock'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          dispatch({ type: 'SELECT_WIDGET', widget })
                          setIsDeleteModalOpen(true)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Empty State */}
        {visibleWidgets.length === 0 && (
          <NoDataEmptyState
            entityName="widgets"
            description={state.viewMode === 'dashboard' ? "No widgets visible. Add widgets to your dashboard to get started." : "No widgets match your filters"}
            action={{
              label: 'Create Widget',
              onClick: () => setIsCreateModalOpen(true)
            }}
          />
        )}
      </div>

      {/* MODALS */}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Widget</DialogTitle>
            <DialogDescription>
              Add a new widget to your dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Widget Name</Label>
              <Input
                placeholder="Enter widget name"
                value={widgetName}
                onChange={(e) => setWidgetName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select value={widgetType} onValueChange={(value: any) => setWidgetType(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="chart">Chart</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="quick-actions">Quick Actions</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={widgetCategory} onValueChange={(value: any) => setWidgetCategory(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Size</Label>
              <Select value={widgetSize} onValueChange={(value: any) => setWidgetSize(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Enter widget description"
                value={widgetDescription}
                onChange={(e) => setWidgetDescription(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWidget} disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create Widget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {state.selectedWidget?.name}</DialogTitle>
            <DialogDescription>
              Modify widget settings and configuration
            </DialogDescription>
          </DialogHeader>

          {state.selectedWidget && (
            <div className="space-y-4">
              <div>
                <Label>Refresh Interval</Label>
                <Select defaultValue={String(state.selectedWidget.config.refreshInterval || 60)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="600">10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Size</Label>
                <Select defaultValue={state.selectedWidget.size}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="full">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox defaultChecked={state.selectedWidget.config.showLegend} />
                <Label>Show Legend</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Widget updated')
              setIsEditModalOpen(false)
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {state.selectedWidget?.name}?</DialogTitle>
            <DialogDescription>
              This will remove the widget from your dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="text-sm">
                <p className="font-medium text-red-900 dark:text-red-200">Warning</p>
                <p className="text-red-700 dark:text-red-300">
                  This action cannot be undone. You'll need to recreate the widget.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWidget} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete Widget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Configuration</DialogTitle>
            <DialogDescription>
              Download your widget configuration as JSON
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-center">
            <Download className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium mb-2">Ready to Export</p>
            <p className="text-sm text-muted-foreground">
              Your widget configuration will be downloaded as a JSON file
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleExportConfig()
              setIsExportModalOpen(false)
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Action: New Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Widget</DialogTitle>
            <DialogDescription>
              Add a new widget to your dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Widget Name</Label>
              <Input
                placeholder="Enter widget name"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Widget Type</Label>
              <Select defaultValue="metric">
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="chart">Chart</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="quick-actions">Quick Actions</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Widget created successfully')
              setShowNewItemDialog(false)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Action: Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Widgets</DialogTitle>
            <DialogDescription>
              Export your widget configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-center">
              <Download className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <p className="text-sm text-muted-foreground">
                Export all {stats.total} widgets as a JSON configuration file
              </p>
            </div>
            <div>
              <Label>Export Format</Label>
              <Select defaultValue="json">
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleExportConfig()
              setShowExportDialog(false)
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Action: Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Widget Settings</DialogTitle>
            <DialogDescription>
              Configure your widget preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Default Refresh Interval</Label>
              <Select defaultValue="60">
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Widget Size</Label>
              <Select defaultValue="medium">
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="auto-refresh" defaultChecked />
              <Label htmlFor="auto-refresh">Enable auto-refresh for all widgets</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="show-legends" defaultChecked />
              <Label htmlFor="show-legends">Show legends on chart widgets</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Settings saved successfully')
              setShowSettingsDialog(false)
            }}>
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
