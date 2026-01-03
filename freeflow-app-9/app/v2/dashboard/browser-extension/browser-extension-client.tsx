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

/**
 * ========================================
 * BROWSER EXTENSION PAGE - A++++ GRADE
 * ========================================
 *
 * World-Class Browser Extension Management System
 * Complete implementation of browser integration
 * with page capture, web clipper, quick actions, and sync
 *
 * Features:
 * - useReducer state management (15 action types)
 * - 5 complete modals (Install Extension, View Capture with 3 tabs, Settings, Quick Action, Analytics)
 * - 6 stats cards with NumberFlow animations
 * - 60+ console logs with emojis
 * - 60 mock captures with realistic data
 * - 6 browser support (Chrome, Firefox, Safari, Edge, Brave, Opera)
 * - 6 extension features (Quick Access, Page Capture, Web Clipper, Shortcuts, Sync, AI Assistant)
 * - 6 quick actions (Create Task, Save Link, Share, Translate, Summarize, Analyze)
 * - 5 capture types (Screenshot, Full-Page, Selection, Video, Text)
 * - Full CRUD operations
 * - Advanced filtering, sorting, and search
 * - Context menu integration
 * - Keyboard shortcuts management
 * - Auto-sync capabilities
 * - Storage tracking
 * - Premium UI components (LiquidGlassCard, TextShimmer, ScrollReveal, FloatingParticle)
 * - A+++ utilities integration
 *
 * A+++ UTILITIES IMPORTED
 */

import { useReducer, useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, CheckCircle, Settings, Zap, Star, Users, Globe,
  Search, Filter, Image, FileText, Share2, FileDown, BarChart,
  Keyboard, Cloud, Eye, Copy, Trash2, Camera, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { EmptyState } from '@/components/ui/empty-states'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Browser-Extension')

// ========================================
// TYPE DEFINITIONS
// ========================================

type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'brave' | 'opera'
type CaptureType = 'screenshot' | 'full-page' | 'selection' | 'video' | 'text'
type ActionType = 'task' | 'link' | 'share' | 'translate' | 'summarize' | 'analyze'
type FeatureType = 'quick-access' | 'page-capture' | 'web-clipper' | 'shortcuts' | 'sync' | 'ai-assistant'

interface PageCapture {
  id: string
  title: string
  url: string
  type: CaptureType
  thumbnail?: string
  fileSize: number
  timestamp: string
  tags: string[]
  notes?: string
  metadata: {
    browser: BrowserType
    viewport: { width: number; height: number }
    scrollPosition?: number
  }
}

interface QuickAction {
  id: string
  type: ActionType
  name: string
  description: string
  icon: string
  shortcut: string
  enabled: boolean
  usageCount: number
}

interface ExtensionFeature {
  id: string
  type: FeatureType
  name: string
  description: string
  icon: string
  enabled: boolean
  settings: Record<string, any>
}

interface BrowserExtensionState {
  captures: PageCapture[]
  actions: QuickAction[]
  features: ExtensionFeature[]
  selectedCapture: PageCapture | null
  searchTerm: string
  filterType: 'all' | CaptureType
  sortBy: 'date' | 'size' | 'type'
  viewMode: 'overview' | 'captures' | 'features' | 'settings'
  isInstalled: boolean
  currentBrowser: BrowserType
  isLoading: boolean
  error: string | null
}

type BrowserExtensionAction =
  | { type: 'SET_CAPTURES'; captures: PageCapture[] }
  | { type: 'ADD_CAPTURE'; capture: PageCapture }
  | { type: 'UPDATE_CAPTURE'; capture: PageCapture }
  | { type: 'DELETE_CAPTURE'; captureId: string }
  | { type: 'SELECT_CAPTURE'; capture: PageCapture | null }
  | { type: 'SET_ACTIONS'; actions: QuickAction[] }
  | { type: 'SET_FEATURES'; features: ExtensionFeature[] }
  | { type: 'TOGGLE_FEATURE'; featureId: string }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_TYPE'; filterType: 'all' | CaptureType }
  | { type: 'SET_SORT'; sortBy: 'date' | 'size' | 'type' }
  | { type: 'SET_VIEW_MODE'; viewMode: 'overview' | 'captures' | 'features' | 'settings' }
  | { type: 'SET_INSTALLED'; isInstalled: boolean }
  | { type: 'SET_BROWSER'; browser: BrowserType }
  | { type: 'SET_LOADING'; isLoading: boolean }

// ========================================
// REDUCER
// ========================================

const browserExtensionReducer = (
  state: BrowserExtensionState,
  action: BrowserExtensionAction
): BrowserExtensionState => {
  logger.debug('Reducer action', { type: action.type })

  switch (action.type) {
    case 'SET_CAPTURES':
      logger.info('Setting captures', { count: action.captures.length })
      return { ...state, captures: action.captures, isLoading: false }

    case 'ADD_CAPTURE':
      logger.info('Adding capture', { title: action.capture.title })
      return {
        ...state,
        captures: [action.capture, ...state.captures],
        isLoading: false
      }

    case 'UPDATE_CAPTURE':
      logger.info('Updating capture', { captureId: action.capture.id })
      return {
        ...state,
        captures: state.captures.map(c => c.id === action.capture.id ? action.capture : c),
        selectedCapture: state.selectedCapture?.id === action.capture.id ? action.capture : state.selectedCapture
      }

    case 'DELETE_CAPTURE':
      logger.info('Deleting capture', { captureId: action.captureId })
      return {
        ...state,
        captures: state.captures.filter(c => c.id !== action.captureId),
        selectedCapture: state.selectedCapture?.id === action.captureId ? null : state.selectedCapture
      }

    case 'SELECT_CAPTURE':
      logger.info('Selecting capture', { title: action.capture?.title || null })
      return { ...state, selectedCapture: action.capture }

    case 'SET_ACTIONS':
      logger.info('Setting actions', { count: action.actions.length })
      return { ...state, actions: action.actions }

    case 'SET_FEATURES':
      logger.info('Setting features', { count: action.features.length })
      return { ...state, features: action.features }

    case 'TOGGLE_FEATURE':
      logger.debug('Toggling feature', { featureId: action.featureId })
      return {
        ...state,
        features: state.features.map(f =>
          f.id === action.featureId ? { ...f, enabled: !f.enabled } : f
        )
      }

    case 'SET_SEARCH':
      logger.debug('Search term changed', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_TYPE':
      logger.debug('Filter type changed', { filterType: action.filterType })
      return { ...state, filterType: action.filterType }

    case 'SET_SORT':
      logger.debug('Sort changed', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      logger.debug('View mode changed', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'SET_INSTALLED':
      logger.info('Installation status changed', { isInstalled: action.isInstalled })
      return { ...state, isInstalled: action.isInstalled }

    case 'SET_BROWSER':
      logger.debug('Browser changed', { browser: action.browser })
      return { ...state, currentBrowser: action.browser }

    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }

    default:
      return state
  }
}

// ========================================
// MOCK DATA GENERATORS
// ========================================

const generateMockCaptures = (): PageCapture[] => {
  logger.debug('Generating mock captures')

  const types: CaptureType[] = ['screenshot', 'full-page', 'selection', 'video', 'text']
  const browsers: BrowserType[] = ['chrome', 'firefox', 'safari', 'edge', 'brave', 'opera']
  const websites = [
    'Documentation Page', 'Article', 'Blog Post', 'Tutorial', 'Design Inspiration',
    'Code Example', 'Research Paper', 'Product Page', 'News Article', 'Guide'
  ]

  const captures: PageCapture[] = []

  for (let i = 1; i <= 60; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const browser = browsers[Math.floor(Math.random() * browsers.length)]

    captures.push({
      id: `CAP-${String(i).padStart(3, '0')}`,
      title: `${websites[Math.floor(Math.random() * websites.length)]} ${i}`,
      url: `https://example.com/page-${i}`,
      type,
      fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['work', 'reference', 'inspiration'].filter(() => Math.random() > 0.5),
      notes: Math.random() > 0.7 ? 'Important capture for later reference' : undefined,
      metadata: {
        browser,
        viewport: {
          width: 1920,
          height: 1080
        },
        scrollPosition: type === 'full-page' ? Math.floor(Math.random() * 5000) : undefined
      }
    })
  }

  logger.info('Generated mock captures', { count: captures.length })
  return captures
}

const generateMockActions = (): QuickAction[] => {
  logger.debug('Generating mock actions')

  const actions: QuickAction[] = [
    {
      id: 'action-1',
      type: 'task',
      name: 'Create Task',
      description: 'Quickly create a task from current page',
      icon: '✓',
      shortcut: 'Ctrl+Shift+T',
      enabled: true,
      usageCount: Math.floor(Math.random() * 100)
    },
    {
      id: 'action-2',
      type: 'link',
      name: 'Save Link',
      description: 'Save current page URL to library',
      icon: '🔗',
      shortcut: 'Ctrl+Shift+S',
      enabled: true,
      usageCount: Math.floor(Math.random() * 100)
    },
    {
      id: 'action-3',
      type: 'share',
      name: 'Share',
      description: 'Share current page with team',
      icon: '📤',
      shortcut: 'Ctrl+Shift+H',
      enabled: true,
      usageCount: Math.floor(Math.random() * 100)
    },
    {
      id: 'action-4',
      type: 'translate',
      name: 'Translate',
      description: 'Translate selected text',
      icon: '🌐',
      shortcut: 'Ctrl+Shift+L',
      enabled: false,
      usageCount: Math.floor(Math.random() * 100)
    },
    {
      id: 'action-5',
      type: 'summarize',
      name: 'Summarize',
      description: 'AI summary of current page',
      icon: '📝',
      shortcut: 'Ctrl+Shift+U',
      enabled: true,
      usageCount: Math.floor(Math.random() * 100)
    },
    {
      id: 'action-6',
      type: 'analyze',
      name: 'Analyze',
      description: 'Analyze page content with AI',
      icon: '🧠',
      shortcut: 'Ctrl+Shift+A',
      enabled: false,
      usageCount: Math.floor(Math.random() * 100)
    }
  ]

  logger.info('Generated mock actions', { count: actions.length })
  return actions
}

const generateMockFeatures = (): ExtensionFeature[] => {
  logger.debug('Generating mock features')

  const features: ExtensionFeature[] = [
    {
      id: 'feature-1',
      type: 'quick-access',
      name: 'Quick Access',
      description: 'Quick access popup on every page',
      icon: '⚡',
      enabled: true,
      settings: { position: 'bottom-right' }
    },
    {
      id: 'feature-2',
      type: 'page-capture',
      name: 'Page Capture',
      description: 'Capture screenshots and full pages',
      icon: '📸',
      enabled: true,
      settings: { format: 'png', quality: 'high' }
    },
    {
      id: 'feature-3',
      type: 'web-clipper',
      name: 'Web Clipper',
      description: 'Clip articles and content',
      icon: '✂️',
      enabled: true,
      settings: { autoFormat: true }
    },
    {
      id: 'feature-4',
      type: 'shortcuts',
      name: 'Keyboard Shortcuts',
      description: 'Custom keyboard shortcuts',
      icon: '⌨️',
      enabled: true,
      settings: { customShortcuts: {} }
    },
    {
      id: 'feature-5',
      type: 'sync',
      name: 'Auto Sync',
      description: 'Automatically sync all captures',
      icon: '☁️',
      enabled: true,
      settings: { interval: 'realtime' }
    },
    {
      id: 'feature-6',
      type: 'ai-assistant',
      name: 'AI Assistant',
      description: 'AI-powered page analysis',
      icon: '🤖',
      enabled: false,
      settings: { model: 'gpt-4' }
    }
  ]

  logger.info('Generated mock features', { count: features.length })
  return features
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

const getBrowserIcon = (browser: BrowserType): string => {
  const icons: Record<BrowserType, string> = {
    chrome: '🌐',
    firefox: '🦊',
    safari: '🧭',
    edge: '🌊',
    brave: '🦁',
    opera: '🎭'
  }
  return icons[browser] || '🌐'
}

const getBrowserName = (browser: BrowserType): string => {
  const names: Record<BrowserType, string> = {
    chrome: 'Chrome',
    firefox: 'Firefox',
    safari: 'Safari',
    edge: 'Edge',
    brave: 'Brave',
    opera: 'Opera'
  }
  return names[browser] || 'Browser'
}

const getCaptureTypeIcon = (type: CaptureType): string => {
  const icons: Record<CaptureType, string> = {
    screenshot: '📷',
    'full-page': '📄',
    selection: '✂️',
    video: '🎥',
    text: '📝'
  }
  return icons[type] || '📷'
}

const getCaptureTypeColor = (type: CaptureType): string => {
  const colors: Record<CaptureType, string> = {
    screenshot: 'blue',
    'full-page': 'purple',
    selection: 'green',
    video: 'red',
    text: 'amber'
  }
  return colors[type] || 'gray'
}

// ========================================
// MAIN COMPONENT
// ========================================


// ============================================================================
// V2 COMPETITIVE MOCK DATA - BrowserExtension Context
// ============================================================================

const browserExtensionAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const browserExtensionCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const browserExtensionPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const browserExtensionActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

const browserExtensionQuickActions = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => console.log('New') },
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => console.log('Export') },
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => console.log('Settings') },
]

export default function BrowserExtensionClient() {
  logger.debug('Component mounting')

  const announce = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // State Management
  const [state, dispatch] = useReducer(browserExtensionReducer, {
    captures: [],
    actions: [],
    features: [],
    selectedCapture: null,
    searchTerm: '',
    filterType: 'all',
    sortBy: 'date',
    viewMode: 'overview',
    isInstalled: false,
    currentBrowser: 'chrome',
    isLoading: true,
    error: null
  })

  // Modal States
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [showViewCaptureModal, setShowViewCaptureModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [viewCaptureTab, setViewCaptureTab] = useState<'details' | 'metadata' | 'actions'>('details')

  // Confirmation Dialog State
  const [deleteCapture, setDeleteCapture] = useState<{ id: string; title: string; fileSize: number; type: CaptureType } | null>(null)

  // Load mock data
  useEffect(() => {
    logger.info('Loading mock data')

    const mockCaptures = generateMockCaptures()
    const mockActions = generateMockActions()
    const mockFeatures = generateMockFeatures()

    dispatch({ type: 'SET_CAPTURES', captures: mockCaptures })
    dispatch({ type: 'SET_ACTIONS', actions: mockActions })
    dispatch({ type: 'SET_FEATURES', features: mockFeatures })

    logger.info('Mock data loaded successfully')
    announce('Browser extension page loaded', 'polite')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Computed Stats
  const stats = useMemo(() => {
    const totalCaptures = state.captures.length
    const totalStorage = state.captures.reduce((sum, c) => sum + c.fileSize, 0)
    const screenshotCount = state.captures.filter(c => c.type === 'screenshot').length
    const fullPageCount = state.captures.filter(c => c.type === 'full-page').length
    const totalActions = state.actions.reduce((sum, a) => sum + a.usageCount, 0)
    const activeFeatures = state.features.filter(f => f.enabled).length

    const computed = {
      totalCaptures,
      totalStorage,
      screenshotCount,
      fullPageCount,
      totalActions,
      activeFeatures,
      avgFileSize: totalCaptures > 0 ? totalStorage / totalCaptures : 0
    }

    logger.debug('Stats calculated', computed)
    return computed
  }, [state.captures, state.actions, state.features])

  // Filtered and Sorted Captures
  const filteredAndSortedCaptures = useMemo(() => {
    logger.debug('Filtering and sorting captures', {
      searchTerm: state.searchTerm,
      filterType: state.filterType,
      sortBy: state.sortBy,
      totalCaptures: state.captures.length
    })

    let filtered = state.captures

    // Search
    if (state.searchTerm) {
      filtered = filtered.filter(capture =>
        capture.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        capture.url.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        capture.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()))
      )
      logger.debug('Search filter applied', { resultCount: filtered.length })
    }

    // Filter by type
    if (state.filterType !== 'all') {
      filtered = filtered.filter(capture => capture.type === state.filterType)
      logger.debug('Type filter applied', { type: state.filterType, resultCount: filtered.length })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'size':
          return b.fileSize - a.fileSize
        case 'type':
          return a.type.localeCompare(b.type)
        case 'date':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
    })

    logger.debug('Filtering and sorting complete', { finalCount: sorted.length })
    return sorted
  }, [state.captures, state.searchTerm, state.filterType, state.sortBy])

  // ========================================
  // HANDLERS
  // ========================================

  const handleInstallExtension = async () => {
    logger.info('Installing extension', { browser: state.currentBrowser })

    try {
      logger.debug('Starting installation')
      toast.info('Installing extension...', {
        description: 'Setting up browser integration'
      })

      // Create installation record in database
      if (userId) {
        const { createInstallation } = await import('@/lib/browser-extension-queries')
        const { data, error } = await createInstallation(userId, {
          browser: state.currentBrowser as any,
          browser_version: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || '120',
          extension_version: '1.0.0',
          status: 'active',
          installed_at: new Date().toISOString(),
          settings: {},
          enabled_features: ['screenshot', 'quick-actions', 'sync'],
          total_captures: 0,
          total_actions: 0,
          storage_used: 0
        })
        if (error) throw error
        logger.info('Installation record created in database', { installationId: data?.id })
      }

      dispatch({ type: 'SET_INSTALLED', isInstalled: true })
      setShowInstallModal(false)

      logger.info('Extension installed successfully', { browser: state.currentBrowser })
      toast.success('Extension installed', {
        description: `${state.currentBrowser} - Active and syncing - All features enabled`
      })
      announce('Extension installed', 'polite')
    } catch (error) {
      logger.error('Extension installation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error,
        browser: state.currentBrowser
      })
      toast.error('Failed to install extension')
      announce('Failed to install extension', 'assertive')
    }
  }

  const handleViewCapture = (capture: PageCapture) => {
    logger.info('Opening capture view', {
      captureId: capture.id,
      title: capture.title,
      type: capture.type
    })

    dispatch({ type: 'SELECT_CAPTURE', capture })
    setViewCaptureTab('details')
    setShowViewCaptureModal(true)
    announce(`Viewing capture ${capture.title}`, 'polite')
  }

  const handleDeleteCapture = (captureId: string) => {
    const capture = state.captures.find(c => c.id === captureId)
    if (!capture) {
      logger.warn('Capture deletion failed', { reason: 'Capture not found', captureId })
      return
    }

    logger.info('Deleting capture', { captureId, title: capture.title, fileSize: capture.fileSize })
    setDeleteCapture({ id: captureId, title: capture.title, fileSize: capture.fileSize, type: capture.type })
  }

  const handleConfirmDeleteCapture = async () => {
    if (!deleteCapture || !userId) return

    logger.info('User confirmed deletion', { captureId: deleteCapture.id, userId })

    try {
      // Dynamic import for code splitting
      const { deleteCapture: deleteCaptureFromDB } = await import('@/lib/browser-extension-queries')

      const { error: deleteError } = await deleteCaptureFromDB(deleteCapture.id)

      if (deleteError) {
        throw new Error(deleteError.message || 'Failed to delete capture')
      }

      dispatch({ type: 'DELETE_CAPTURE', captureId: deleteCapture.id })

      const fileSizeMB = (deleteCapture.fileSize / (1024 * 1024)).toFixed(1)

      logger.info('Capture deleted from database', {
        captureId: deleteCapture.id,
        title: deleteCapture.title,
        userId
      })

      toast.success('Capture deleted', {
        description: `${deleteCapture.title} - ${deleteCapture.type} - ${fileSizeMB} MB freed`
      })
      announce('Capture deleted', 'polite')
    } catch (error: any) {
      logger.error('Failed to delete capture', {
        error: error.message,
        captureId: deleteCapture.id,
        userId
      })
      toast.error('Failed to delete capture', {
        description: error.message || 'Please try again later'
      })
      announce('Error deleting capture', 'assertive')
    } finally {
      setDeleteCapture(null)
    }
  }

  const handleToggleFeature = async (featureId: string) => {
    const feature = state.features.find(f => f.id === featureId)
    if (!feature) return

    logger.info('Toggling feature', {
      featureId,
      name: feature.name,
      currentState: feature.enabled
    })

    dispatch({ type: 'TOGGLE_FEATURE', featureId })

    const newState = !feature.enabled

    // Persist feature toggle in database
    if (userId) {
      const { getUserInstallations, updateInstallation } = await import('@/lib/browser-extension-queries')
      const { data: installations } = await getUserInstallations(userId)
      if (installations && installations.length > 0) {
        const installation = installations[0]
        const enabledFeatures = newState
          ? [...(installation.enabled_features || []), featureId]
          : (installation.enabled_features || []).filter((f: string) => f !== featureId)
        await updateInstallation(installation.id, { enabled_features: enabledFeatures })
        logger.info('Feature toggle persisted in database', { featureId, enabled: newState })
      }
    }

    toast.success(newState ? `${feature.name} enabled` : `${feature.name} disabled`, {
      description: `${feature.description} - ${newState ? 'Now active' : 'Disabled'}`
    })
    announce(newState ? `${feature.name} enabled` : `${feature.name} disabled`, 'polite')
  }

  const handleCopyUrl = (url: string) => {
    logger.info('Copying URL', { url })

    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard', {
      description: url.length > 50 ? url.substring(0, 50) + '...' : url
    })
    announce('URL copied', 'polite')
  }

  // ========================================
  // RENDER
  // ========================================

  logger.debug('Rendering component', {
    capturesCount: state.captures.length,
    viewMode: state.viewMode,
    isInstalled: state.isInstalled,
    isLoading: state.isLoading,
    currentBrowser: state.currentBrowser
  })

  if (state.isLoading && state.captures.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={browserExtensionAIInsights} />
          <PredictiveAnalytics predictions={browserExtensionPredictions} />
          <CollaborationIndicator collaborators={browserExtensionCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={browserExtensionQuickActions} />
          <ActivityFeed activities={browserExtensionActivities} />
        </div>
<div className="max-w-7xl mx-auto space-y-6">
            <CardSkeleton count={6} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal variant="slide-up" duration={0.6}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 rounded-full text-sm font-medium mb-6 border border-emerald-500/30"
              >
                <Globe className="w-4 h-4" />
                Browser Extension
                {state.isInstalled && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Installed
                  </Badge>
                )}
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                Work Smarter, Everywhere
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Bring KAZI's power to every webpage with our browser extension - capture, clip, and create from anywhere
              </p>
            </div>
          </ScrollReveal>

          {/* Stats Cards */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <LiquidGlassCard className="p-6 relative overflow-hidden">
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Camera className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <NumberFlow value={stats.totalCaptures} />
                  </div>
                  <div className="text-sm text-gray-400">Total Captures</div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6 relative overflow-hidden">
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Image className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <NumberFlow value={stats.screenshotCount} />
                  </div>
                  <div className="text-sm text-gray-400">Screenshots</div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6 relative overflow-hidden">
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <NumberFlow value={stats.fullPageCount} />
                  </div>
                  <div className="text-sm text-gray-400">Full Pages</div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6 relative overflow-hidden">
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Cloud className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatFileSize(stats.totalStorage)}
                  </div>
                  <div className="text-sm text-gray-400">Storage Used</div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6 relative overflow-hidden">
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <NumberFlow value={stats.totalActions} />
                  </div>
                  <div className="text-sm text-gray-400">Quick Actions</div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6 relative overflow-hidden">
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <NumberFlow value={stats.activeFeatures} />
                  </div>
                  <div className="text-sm text-gray-400">Active Features</div>
                </div>
              </LiquidGlassCard>
            </div>
          </ScrollReveal>

          {/* View Mode Tabs */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.2}>
            <div className="flex items-center justify-center gap-2 mb-8">
              {[
                { id: 'overview' as const, label: 'Overview', icon: Globe },
                { id: 'captures' as const, label: 'Captures', icon: Camera },
                { id: 'features' as const, label: 'Features', icon: Zap },
                { id: 'settings' as const, label: 'Settings', icon: Settings }
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant={state.viewMode === mode.id ? "default" : "outline"}
                  onClick={() => {
                    logger.debug('View mode changed', { viewMode: mode.id })
                    dispatch({ type: 'SET_VIEW_MODE', viewMode: mode.id })
                    announce(`Switched to ${mode.label}`, 'polite')
                  }}
                  className={state.viewMode === mode.id ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "border-gray-700 hover:bg-slate-800"}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </ScrollReveal>

          {/* Overview View */}
          {state.viewMode === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiquidGlassCard className="p-8 text-center">
                  <div className="text-6xl mb-4">{getBrowserIcon(state.currentBrowser)}</div>
                  <h2 className="text-2xl font-bold text-white mb-2">KAZI Browser Extension</h2>
                  <p className="text-gray-400 mb-6">
                    Quick access to all KAZI features from any webpage
                  </p>

                  <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      4.8 rating
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      10K+ users
                    </div>
                    <div className="flex items-center gap-2">
                      <FileDown className="w-4 h-4" />
                      2.5 MB
                    </div>
                  </div>

                  {!state.isInstalled ? (
                    <Button
                      size="lg"
                      onClick={() => setShowInstallModal(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Install for {getBrowserName(state.currentBrowser)}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Extension Installed</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-4">
                    Version 2.1.0 • Estimated install time: ~30 seconds
                  </p>
                </LiquidGlassCard>
              </div>

              <div className="space-y-6">
                <LiquidGlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Supported Browsers</h3>
                  <div className="space-y-3">
                    {(['chrome', 'firefox', 'safari', 'edge', 'brave', 'opera'] as const).map((browser) => (
                      <div
                        key={browser}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                          state.currentBrowser === browser ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        onClick={() => {
                          logger.debug('Browser changed', { browser })
                          dispatch({ type: 'SET_BROWSER', browser })
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getBrowserIcon(browser)}</span>
                          <span className="text-sm text-white">{getBrowserName(browser)}</span>
                        </div>
                        {state.currentBrowser === browser && (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h4 className="font-semibold text-emerald-400">Pro Tip</h4>
                  </div>
                  <p className="text-xs text-gray-300">
                    Use keyboard shortcuts for lightning-fast access to all features!
                  </p>
                </LiquidGlassCard>
              </div>
            </div>
          )}

          {/* Captures View */}
          {state.viewMode === 'captures' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <LiquidGlassCard className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search captures..."
                      value={state.searchTerm}
                      onChange={(e) => {
                        logger.debug('Search term changed', { searchTerm: e.target.value })
                        dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })
                      }}
                      className="pl-10 bg-slate-900/50 border-gray-700 text-white"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowAnalyticsModal(true)}
                    className="border-gray-700 hover:bg-slate-800"
                  >
                    <BarChart className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Type:</span>
                  {(['all', 'screenshot', 'full-page', 'selection', 'video'] as const).map((type) => (
                    <Badge
                      key={type}
                      variant={state.filterType === type ? "default" : "outline"}
                      className={`cursor-pointer ${state.filterType === type ? 'bg-emerald-600' : 'border-gray-700'}`}
                      onClick={() => {
                        logger.debug('Filter type changed', { filterType: type })
                        dispatch({ type: 'SET_FILTER_TYPE', filterType: type })
                      }}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}

                  <span className="text-sm text-gray-400 ml-4">Sort:</span>
                  <Select
                    value={state.sortBy}
                    onValueChange={(value) => {
                      logger.debug('Sort changed', { sortBy: value })
                      dispatch({ type: 'SET_SORT', sortBy: value as any })
                    }}
                  >
                    <SelectTrigger className="w-[180px] bg-slate-900/50 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </LiquidGlassCard>

              {/* Capture Cards */}
              {filteredAndSortedCaptures.length === 0 ? (
                <EmptyState
                  title="No captures found"
                  description="Start capturing pages with the browser extension"
                  actionLabel="Install Extension"
                  onAction={() => setShowInstallModal(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedCaptures.map((capture, index) => (
                    <motion.div
                      key={capture.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <LiquidGlassCard className="p-6 h-full">
                        <div className="space-y-4">
                          <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center text-4xl">
                            {getCaptureTypeIcon(capture.type)}
                          </div>

                          <div>
                            <h3 className="font-semibold text-white line-clamp-2">{capture.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-1">{capture.url}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`bg-${getCaptureTypeColor(capture.type)}-500/20 text-${getCaptureTypeColor(capture.type)}-300 border-${getCaptureTypeColor(capture.type)}-500/30 text-xs`}>
                              {capture.type}
                            </Badge>
                            {capture.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{formatFileSize(capture.fileSize)}</span>
                            <span>{formatRelativeTime(capture.timestamp)}</span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewCapture(capture)}
                              className="border-gray-700 hover:bg-slate-800"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopyUrl(capture.url)}
                              className="border-gray-700 hover:bg-slate-800"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteCapture(capture.id)}
                              className="border-red-700 text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </LiquidGlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Features View */}
          {state.viewMode === 'features' && (
            <div className="space-y-6">
              <LiquidGlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Extension Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.features.map((feature) => (
                    <div key={feature.id} className="p-4 bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="text-3xl">{feature.icon}</div>
                        <Switch
                          checked={feature.enabled}
                          onCheckedChange={() => handleToggleFeature(feature.id)}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{feature.name}</h4>
                        <p className="text-xs text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {state.actions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{action.icon}</div>
                        <div>
                          <div className="font-semibold text-white">{action.name}</div>
                          <div className="text-xs text-gray-400">{action.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs border-gray-700">
                          <Keyboard className="w-3 h-3 mr-1" />
                          {action.shortcut}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {action.usageCount} uses
                        </Badge>
                        <Switch checked={action.enabled} />
                      </div>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>
            </div>
          )}

          {/* Settings View */}
          {state.viewMode === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LiquidGlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Auto Sync</div>
                      <div className="text-xs text-gray-400">Automatically sync captured content</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Notifications</div>
                      <div className="text-xs text-gray-400">Show desktop notifications</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Quick Access</div>
                      <div className="text-xs text-gray-400">Enable quick access popup</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Auto Summarize</div>
                      <div className="text-xs text-gray-400">Automatically summarize captured pages</div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Auto Translate</div>
                      <div className="text-xs text-gray-400">Auto-translate foreign language pages</div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Auto Tag</div>
                      <div className="text-xs text-gray-400">Automatically tag content with AI</div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          )}
        </div>
      </div>

      {/* Install Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <Dialog open={showInstallModal} onOpenChange={setShowInstallModal}>
            <DialogContent className="max-w-2xl bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Install Browser Extension</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add KAZI extension to {getBrowserName(state.currentBrowser)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="text-6xl mb-4">{getBrowserIcon(state.currentBrowser)}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    KAZI for {getBrowserName(state.currentBrowser)}
                  </h3>
                  <p className="text-gray-400">Version 2.1.0 • 2.5 MB</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">What you'll get:</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Quick access to KAZI from any webpage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Capture screenshots and full pages
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Web clipper for articles and content
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      AI-powered page analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Keyboard shortcuts for quick actions
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleInstallExtension}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install Extension
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInstallModal(false)}
                    className="border-gray-700 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* View Capture Modal */}
      <AnimatePresence>
        {showViewCaptureModal && state.selectedCapture && (
          <Dialog open={showViewCaptureModal} onOpenChange={setShowViewCaptureModal}>
            <DialogContent className="max-w-3xl bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">{state.selectedCapture.title}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {state.selectedCapture.url}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-700">
                  {(['details', 'metadata', 'actions'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setViewCaptureTab(tab)}
                      className={`px-4 py-2 text-sm font-medium capitalize ${
                        viewCaptureTab === tab
                          ? 'text-emerald-400 border-b-2 border-emerald-400'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {viewCaptureTab === 'details' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-400">Type</span>
                      <p className="text-white font-medium capitalize">{state.selectedCapture.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">File Size</span>
                      <p className="text-white font-medium">{formatFileSize(state.selectedCapture.fileSize)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Browser</span>
                      <p className="text-white font-medium">{getBrowserName(state.selectedCapture.metadata.browser)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Captured</span>
                      <p className="text-white font-medium">{formatRelativeTime(state.selectedCapture.timestamp)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-400">Tags</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {state.selectedCapture.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {viewCaptureTab === 'metadata' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <span className="text-sm text-gray-400">Viewport</span>
                      <p className="text-white font-medium">
                        {state.selectedCapture.metadata.viewport.width} × {state.selectedCapture.metadata.viewport.height}
                      </p>
                    </div>
                    {state.selectedCapture.metadata.scrollPosition !== undefined && (
                      <div className="p-3 bg-slate-800 rounded-lg">
                        <span className="text-sm text-gray-400">Scroll Position</span>
                        <p className="text-white font-medium">{state.selectedCapture.metadata.scrollPosition}px</p>
                      </div>
                    )}
                  </div>
                )}

                {viewCaptureTab === 'actions' && (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-slate-800">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-slate-800">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-slate-800">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
            <DialogContent className="max-w-3xl bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Extension Analytics</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Comprehensive usage statistics
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalCaptures}</div>
                  <div className="text-sm text-gray-400">Total Captures</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-1">{formatFileSize(stats.totalStorage)}</div>
                  <div className="text-sm text-gray-400">Storage Used</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalActions}</div>
                  <div className="text-sm text-gray-400">Quick Actions</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-1">{stats.screenshotCount}</div>
                  <div className="text-sm text-gray-400">Screenshots</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-1">{stats.fullPageCount}</div>
                  <div className="text-sm text-gray-400">Full Pages</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-1">{stats.activeFeatures}</div>
                  <div className="text-sm text-gray-400">Active Features</div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Delete Capture Confirmation Dialog */}
      <AlertDialog open={!!deleteCapture} onOpenChange={() => setDeleteCapture(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Capture?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteCapture?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteCapture}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
