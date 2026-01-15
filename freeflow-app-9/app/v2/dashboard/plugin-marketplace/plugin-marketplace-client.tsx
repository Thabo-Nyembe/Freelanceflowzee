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
import { PageHeader } from '@/components/ui/page-header'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { NumberFlow } from '@/components/ui/number-flow'
import { motion, AnimatePresence } from 'framer-motion'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Plugin-Marketplace')

// ============================================================================
// A+++ UTILITIES
// ============================================================================
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  Package,
  Download,
  Star,
  Search,
  Grid,
  List,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Share2,
  CheckCircle,
  DollarSign,
  Settings,
  Eye,
  BarChart3,
  Sparkles,
  MessageSquare,
  X,
  Palette,
  Rocket
} from 'lucide-react'

// ============================================================================
// A++++ TYPES
// ============================================================================

type PluginCategory = 'productivity' | 'creative' | 'analytics' | 'communication' | 'integration' | 'automation' | 'ai' | 'security' | 'finance' | 'marketing'
type PricingType = 'free' | 'one-time' | 'subscription' | 'freemium'
type PluginStatus = 'published' | 'beta' | 'coming-soon' | 'deprecated'
type ViewMode = 'grid' | 'list'

interface PluginAuthor {
  id: string
  name: string
  avatar: string
  verified: boolean
}

interface Plugin {
  id: string
  name: string
  description: string
  longDescription: string
  category: PluginCategory
  icon: string
  author: PluginAuthor
  version: string
  rating: number
  reviewCount: number
  installCount: number
  price: number
  pricingType: PricingType
  status: PluginStatus
  fileSize: number // in bytes
  lastUpdated: string
  createdAt: string
  isVerified: boolean
  isFeatured: boolean
  isTrending: boolean
  isPopular: boolean
  tags: string[]
  screenshots: string[]
  compatibility: string[]
  requirements: string[]
  changelog: string[]
}

interface InstalledPlugin {
  pluginId: string
  installedAt: string
  installedVersion: string
  isActive: boolean
  settings: Record<string, any>
}

interface PluginState {
  plugins: Plugin[]
  selectedPlugin: Plugin | null
  installedPlugins: InstalledPlugin[]
  searchTerm: string
  filterCategory: 'all' | PluginCategory
  filterPricing: 'all' | PricingType
  sortBy: 'popular' | 'recent' | 'rating' | 'name' | 'price'
  viewMode: ViewMode
  selectedPlugins: string[]
  showInstalledOnly: boolean
}

type PluginAction =
  | { type: 'SET_PLUGINS'; plugins: Plugin[] }
  | { type: 'ADD_PLUGIN'; plugin: Plugin }
  | { type: 'UPDATE_PLUGIN'; plugin: Plugin }
  | { type: 'DELETE_PLUGIN'; pluginId: string }
  | { type: 'SELECT_PLUGIN'; plugin: Plugin | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_CATEGORY'; filterCategory: 'all' | PluginCategory }
  | { type: 'SET_FILTER_PRICING'; filterPricing: 'all' | PricingType }
  | { type: 'SET_SORT'; sortBy: PluginState['sortBy'] }
  | { type: 'SET_VIEW_MODE'; viewMode: ViewMode }
  | { type: 'TOGGLE_SELECT_PLUGIN'; pluginId: string }
  | { type: 'CLEAR_SELECTED_PLUGINS' }
  | { type: 'INSTALL_PLUGIN'; plugin: Plugin }
  | { type: 'UNINSTALL_PLUGIN'; pluginId: string }
  | { type: 'TOGGLE_PLUGIN_ACTIVE'; pluginId: string }
  | { type: 'TOGGLE_INSTALLED_ONLY' }

// ============================================================================
// A++++ REDUCER
// ============================================================================

function pluginReducer(state: PluginState, action: PluginAction): PluginState {
  logger.debug('Reducer action', { type: action.type })

  switch (action.type) {
    case 'SET_PLUGINS':
      logger.info('Setting plugins', { count: action.plugins.length })
      return { ...state, plugins: action.plugins }

    case 'ADD_PLUGIN':
      logger.info('Adding plugin', { pluginId: action.plugin.id, name: action.plugin.name })
      return { ...state, plugins: [action.plugin, ...state.plugins] }

    case 'UPDATE_PLUGIN':
      logger.info('Updating plugin', { pluginId: action.plugin.id, name: action.plugin.name })
      return {
        ...state,
        plugins: state.plugins.map(p => p.id === action.plugin.id ? action.plugin : p),
        selectedPlugin: state.selectedPlugin?.id === action.plugin.id ? action.plugin : state.selectedPlugin
      }

    case 'DELETE_PLUGIN':
      logger.info('Deleting plugin', { pluginId: action.pluginId })
      return {
        ...state,
        plugins: state.plugins.filter(p => p.id !== action.pluginId),
        selectedPlugin: state.selectedPlugin?.id === action.pluginId ? null : state.selectedPlugin
      }

    case 'SELECT_PLUGIN':
      logger.info('Selecting plugin', { pluginId: action.plugin?.id })
      return { ...state, selectedPlugin: action.plugin }

    case 'SET_SEARCH':
      logger.debug('Search term updated', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_CATEGORY':
      logger.debug('Filter category updated', { category: action.filterCategory })
      return { ...state, filterCategory: action.filterCategory }

    case 'SET_FILTER_PRICING':
      logger.debug('Filter pricing updated', { pricing: action.filterPricing })
      return { ...state, filterPricing: action.filterPricing }

    case 'SET_SORT':
      logger.debug('Sort updated', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      logger.debug('View mode updated', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'TOGGLE_SELECT_PLUGIN':
      logger.debug('Toggle select plugin', { pluginId: action.pluginId })
      return {
        ...state,
        selectedPlugins: state.selectedPlugins.includes(action.pluginId)
          ? state.selectedPlugins.filter(id => id !== action.pluginId)
          : [...state.selectedPlugins, action.pluginId]
      }

    case 'CLEAR_SELECTED_PLUGINS':
      logger.debug('Clearing selected plugins')
      return { ...state, selectedPlugins: [] }

    case 'INSTALL_PLUGIN':
      logger.info('Installing plugin via reducer', { pluginId: action.plugin.id, name: action.plugin.name })
      const newInstallation: InstalledPlugin = {
        pluginId: action.plugin.id,
        installedAt: new Date().toISOString(),
        installedVersion: action.plugin.version,
        isActive: true,
        settings: {}
      }
      return {
        ...state,
        installedPlugins: [...state.installedPlugins, newInstallation],
        plugins: state.plugins.map(p =>
          p.id === action.plugin.id ? { ...p, installCount: p.installCount + 1 } : p
        )
      }

    case 'UNINSTALL_PLUGIN':
      logger.info('Uninstalling plugin via reducer', { pluginId: action.pluginId })
      return {
        ...state,
        installedPlugins: state.installedPlugins.filter(p => p.pluginId !== action.pluginId)
      }

    case 'TOGGLE_PLUGIN_ACTIVE':
      logger.info('Toggling plugin active state', { pluginId: action.pluginId })
      return {
        ...state,
        installedPlugins: state.installedPlugins.map(p =>
          p.pluginId === action.pluginId ? { ...p, isActive: !p.isActive } : p
        )
      }

    case 'TOGGLE_INSTALLED_ONLY':
      logger.debug('Toggle installed only filter', { currentState: state.showInstalledOnly })
      return { ...state, showInstalledOnly: !state.showInstalledOnly }

    default:
      return state
  }
}

// ============================================================================
// A++++ MOCK DATA
// ============================================================================

function generateMockPlugins(): Plugin[] {
  logger.debug('Generating mock plugins')

  const categories: PluginCategory[] = ['productivity', 'creative', 'analytics', 'communication', 'integration', 'automation', 'ai', 'security', 'finance', 'marketing']
  const pricingTypes: PricingType[] = ['free', 'one-time', 'subscription', 'freemium']
  const statuses: PluginStatus[] = ['published', 'beta', 'coming-soon']

  const pluginNames = [
    'Slack Integration', 'Google Drive Sync', 'Advanced Analytics', 'AI Assistant Pro',
    'Email Automation', 'PDF Generator', 'Video Conferencing', 'Time Tracker Plus',
    'CRM Connect', 'Social Media Manager', 'Task Automator', 'Code Snippets',
    'Design Tools', 'Invoice Generator', 'SEO Optimizer', 'Content Calendar',
    'Live Chat Widget', 'Form Builder Pro', 'Database Manager', 'API Gateway',
    'Webhook Handler', 'Payment Gateway', 'Email Templates', 'Backup Manager',
    'Security Scanner', 'Performance Monitor', 'A/B Testing', 'User Feedback',
    'Translation Tool', 'Image Optimizer', 'Video Editor', 'Audio Processor',
    'Chart Builder', 'Data Exporter', 'Report Generator', 'Calendar Sync',
    'Notification Center', 'File Uploader', 'QR Generator', 'Barcode Scanner',
    'Weather Widget', 'Map Integration', 'Search Engine', 'Text Editor',
    'Color Picker', 'Icon Library', 'Font Manager', 'Theme Switcher',
    'Dark Mode Pro', 'Responsive Helper', 'Grid System', 'Animation Studio',
    'Drag and Drop', 'Keyboard Shortcuts', 'Screen Recorder', 'Screenshot Tool',
    'Version Control', 'Team Collaboration', 'Project Templates', 'Workflow Builder'
  ]

  const authors = [
    { id: 'AU-001', name: 'TechCorp', avatar: '🏢', verified: true },
    { id: 'AU-002', name: 'DevTools Inc', avatar: '👨‍💻', verified: true },
    { id: 'AU-003', name: 'CreativeStudio', avatar: '🎨', verified: false },
    { id: 'AU-004', name: 'AutomationPro', avatar: '🤖', verified: true },
    { id: 'AU-005', name: 'DataViz Labs', avatar: '📊', verified: false }
  ]

  const plugins: Plugin[] = pluginNames.map((name, index) => {
    const category = categories[index % categories.length]
    const pricingType = pricingTypes[index % pricingTypes.length]
    const status = statuses[index % statuses.length]
    const author = authors[index % authors.length]

    return {
      id: `PLG-${String(index + 1).padStart(3, '0')}`,
      name,
      description: `Professional ${name} plugin with advanced features and seamless integration`,
      longDescription: `${name} is a powerful plugin that helps you ${name.toLowerCase()} with ease. Features include automated workflows, real-time sync, advanced analytics, and comprehensive reporting. Perfect for teams of all sizes.`,
      category,
      icon: ['🔌', '⚡', '🚀', '🎯', '💡', '🔥'][index % 6],
      author,
      version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
      reviewCount: Math.floor(Math.random() * 500) + 50,
      installCount: Math.floor(Math.random() * 100000) + 1000,
      price: pricingType === 'free' ? 0 : Math.floor(Math.random() * 100) + 10,
      pricingType,
      status,
      fileSize: Math.floor(Math.random() * 10000000) + 100000, // 100KB - 10MB
      lastUpdated: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      isVerified: author.verified,
      isFeatured: Math.random() > 0.8,
      isTrending: Math.random() > 0.7,
      isPopular: Math.random() > 0.6,
      tags: [
        category,
        pricingType,
        ['integration', 'automation', 'productivity', 'analytics'][Math.floor(Math.random() * 4)]
      ],
      screenshots: Array.from({ length: 3 }, (_, i) => `https://picsum.photos/seed/${index + i}/800/600`),
      compatibility: ['v1.0+', 'Chrome', 'Firefox', 'Safari'],
      requirements: ['Min 2GB RAM', 'Storage: 100MB', 'Internet connection'],
      changelog: [
        'v2.0.0: Major redesign and performance improvements',
        'v1.5.0: Added new features and bug fixes',
        'v1.0.0: Initial release'
      ]
    }
  })

  logger.info('Mock plugins generated', { count: plugins.length })
  return plugins
}

// ============================================================================
// A++++ CATEGORIES
// ============================================================================

interface CategoryOption {
  id: PluginCategory
  name: string
  icon: any
  color: string
}

const categoryOptions: CategoryOption[] = [
  { id: 'productivity', name: 'Productivity', icon: Zap, color: 'blue' },
  { id: 'creative', name: 'Creative', icon: Palette, color: 'purple' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'green' },
  { id: 'communication', name: 'Communication', icon: MessageSquare, color: 'cyan' },
  { id: 'integration', name: 'Integration', icon: Share2, color: 'orange' },
  { id: 'automation', name: 'Automation', icon: Rocket, color: 'pink' },
  { id: 'ai', name: 'AI & ML', icon: Sparkles, color: 'violet' },
  { id: 'security', name: 'Security', icon: Shield, color: 'red' },
  { id: 'finance', name: 'Finance', icon: DollarSign, color: 'emerald' },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp, color: 'amber' }
]

// ============================================================================
// A++++ FLOATING PARTICLE COMPONENT
// ============================================================================

const FloatingParticle: React.FC<{
  children: React.ReactNode
  color?: 'emerald' | 'green' | 'cyan' | 'amber' | 'blue' | 'purple'
  size?: 'sm' | 'md' | 'lg'
}> = ({ children, color = 'emerald', size = 'md' }) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, 0, -5, 0]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// A++++ MAIN COMPONENT
// ============================================================================


// ============================================================================
// V2 COMPETITIVE MOCK DATA - PluginMarketplace Context
// ============================================================================

const pluginMarketplaceAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const pluginMarketplaceCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const pluginMarketplacePredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const pluginMarketplaceActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component to access state setters

export default function PluginMarketplaceClient() {
  logger.debug('Plugin marketplace component mounting')

  // ============================================================================
  // A++++ STATE MANAGEMENT
  // ============================================================================
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [state, dispatch] = useReducer(pluginReducer, {
    plugins: [],
    selectedPlugin: null,
    installedPlugins: [],
    searchTerm: '',
    filterCategory: 'all',
    filterPricing: 'all',
    sortBy: 'popular',
    viewMode: 'grid',
    selectedPlugins: [],
    showInstalledOnly: false
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)

  // Quick Action Dialog States
  const [showCreatePluginDialog, setShowCreatePluginDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Create Plugin Form State
  const [newPluginData, setNewPluginData] = useState({
    name: '',
    description: '',
    category: 'productivity' as PluginCategory,
    pricingType: 'free' as PricingType,
    price: 0,
    version: '1.0.0'
  })

  // Export Options State
  const [exportOptions, setExportOptions] = useState({
    format: 'json' as 'json' | 'csv' | 'xml',
    includeInstalled: true,
    includeSettings: true,
    includeStats: true
  })

  // Settings State
  const [marketplaceSettings, setMarketplaceSettings] = useState({
    autoUpdate: true,
    notifyNewPlugins: true,
    showBetaPlugins: false,
    defaultView: 'grid' as ViewMode,
    defaultSort: 'popular' as PluginState['sortBy']
  })

  // Confirmation Dialog State
  const [uninstallPlugin, setUninstallPlugin] = useState<{ id: string; name: string; category: string; version: string; fileSize: number; installedAt?: string } | null>(null)

  // Quick Actions with dialog triggers
  const pluginMarketplaceQuickActions = useMemo(() => [
    { id: '1', label: 'New Plugin', icon: 'Plus', shortcut: 'N', action: () => setShowCreatePluginDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ], [])

  // ============================================================================
  // A++++ LOAD DATA
  // ============================================================================
  useEffect(() => {
    const loadPlugins = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      logger.info('Loading plugins from database', { userId })
      try {
        setIsLoading(true)
        setError(null)

        // Dynamic import for code splitting
        const { getAllPlugins } = await import('@/lib/plugin-marketplace-queries')

        const { data: plugins, error: pluginsError } = await getAllPlugins()

        if (pluginsError) throw pluginsError

        // If no plugins in database, use mock data
        const pluginsToUse = (plugins && plugins.length > 0) ? plugins : generateMockPlugins()
        dispatch({ type: 'SET_PLUGINS', plugins: pluginsToUse as Plugin[] })

        // Pre-install some plugins for demo (first 5)
        const preInstalled = pluginsToUse.slice(0, 5).map(plugin => ({
          pluginId: plugin.id,
          installedAt: new Date().toISOString(),
          installedVersion: plugin.version,
          isActive: true,
          settings: {}
        }))

        preInstalled.forEach(install => {
          const plugin = pluginsToUse.find(p => p.id === install.pluginId)!
          dispatch({ type: 'INSTALL_PLUGIN', plugin: plugin as Plugin })
        })

        logger.info('Plugins loaded successfully', {
          userId,
          count: pluginsToUse.length,
          source: (plugins && plugins.length > 0) ? 'database' : 'mock'
        })
        setIsLoading(false)
        announce(`${pluginsToUse.length} plugins loaded successfully`, 'polite')
      } catch (err) {
        logger.error('Failed to load plugins', {
          error: err instanceof Error ? err.message : String(err),
          userId
        })
        setError(err instanceof Error ? err.message : 'Failed to load plugins')
        setIsLoading(false)
        announce('Error loading plugins', 'assertive')
      }
    }

    loadPlugins()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // A++++ COMPUTED VALUES
  // ============================================================================
  const stats = useMemo(() => {
    logger.debug('Computing plugin stats')
    const total = state.plugins.length
    const installed = state.installedPlugins.length
    const active = state.installedPlugins.filter(p => p.isActive).length
    const totalInstalls = state.plugins.reduce((sum, p) => sum + p.installCount, 0)
    const avgRating = state.plugins.reduce((sum, p) => sum + p.rating, 0) / Math.max(state.plugins.length, 1)
    const verified = state.plugins.filter(p => p.isVerified).length
    const featured = state.plugins.filter(p => p.isFeatured).length
    const trending = state.plugins.filter(p => p.isTrending).length

    const computedStats = {
      total,
      installed,
      active,
      totalInstalls,
      avgRating,
      verified,
      featured,
      trending
    }

    logger.debug('Plugin stats computed', computedStats)
    return computedStats
  }, [state.plugins, state.installedPlugins])

  const filteredAndSortedPlugins = useMemo(() => {
    logger.debug('Filtering and sorting plugins', { searchTerm: state.searchTerm, category: state.filterCategory, pricing: state.filterPricing, sortBy: state.sortBy })
    let filtered = state.plugins

    // Search
    if (state.searchTerm) {
      filtered = filtered.filter(plugin =>
        plugin.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        plugin.description.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()))
      )
      logger.debug('Search filter applied', { count: filtered.length, searchTerm: state.searchTerm })
    }

    // Filter by category
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(plugin => plugin.category === state.filterCategory)
      logger.debug('Category filter applied', { count: filtered.length, category: state.filterCategory })
    }

    // Filter by pricing
    if (state.filterPricing !== 'all') {
      filtered = filtered.filter(plugin => plugin.pricingType === state.filterPricing)
      logger.debug('Pricing filter applied', { count: filtered.length, pricing: state.filterPricing })
    }

    // Filter installed only
    if (state.showInstalledOnly) {
      filtered = filtered.filter(plugin =>
        state.installedPlugins.some(ip => ip.pluginId === plugin.id)
      )
      logger.debug('Installed-only filter applied', { count: filtered.length })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'popular':
          return b.installCount - a.installCount
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case 'rating':
          return b.rating - a.rating
        case 'price':
          return a.price - b.price
        default:
          return 0
      }
    })

    logger.debug('Plugins sorted', { sortBy: state.sortBy, finalCount: sorted.length })
    return sorted
  }, [state.plugins, state.searchTerm, state.filterCategory, state.filterPricing, state.sortBy, state.showInstalledOnly, state.installedPlugins])

  // ============================================================================
  // A++++ HANDLERS
  // ============================================================================

  const handleViewPlugin = (plugin: Plugin) => {
    logger.info('Opening plugin view', {
      pluginId: plugin.id,
      name: plugin.name,
      category: plugin.category,
      installs: plugin.installCount,
      rating: plugin.rating,
      price: plugin.price,
      pricingType: plugin.pricingType
    })

    dispatch({ type: 'SELECT_PLUGIN', plugin })
    setShowViewModal(true)
  }

  const handleInstallPlugin = async (plugin: Plugin) => {
    logger.info('Installing plugin', {
      pluginId: plugin.id,
      name: plugin.name,
      category: plugin.category,
      version: plugin.version,
      fileSize: plugin.fileSize,
      pricingType: plugin.pricingType
    })

    const isInstalled = state.installedPlugins.some(p => p.pluginId === plugin.id)

    if (isInstalled) {
      logger.warn('Plugin installation failed', { reason: 'Already installed', pluginId: plugin.id })
      toast.error('Plugin is already installed', {
        description: `${plugin.name} is already active in your workspace`
      })
      return
    }

    const fileSizeMB = (plugin.fileSize / (1024 * 1024)).toFixed(1)
    const price = formatPrice(plugin)

    toast.info(`Installing ${plugin.name}...`, {
      description: `${plugin.category} plugin - ${plugin.version} - ${fileSizeMB} MB - Setting up dependencies`
    })

    try {
      if (userId) {
        const { createInstallation, incrementPluginInstalls } = await import('@/lib/plugin-marketplace-queries')
        const { error: installError } = await createInstallation(userId, {
          plugin_id: plugin.id,
          status: 'active',
          settings: {}
        })
        if (installError) throw new Error(installError.message || 'Failed to install plugin')

        // Increment plugin install count
        await incrementPluginInstalls(plugin.id)
      }

      dispatch({ type: 'INSTALL_PLUGIN', plugin })

      const installsK = (plugin.installCount / 1000).toFixed(1)

      logger.info('Plugin installed successfully', {
        pluginId: plugin.id,
        name: plugin.name,
        version: plugin.version,
        installedAt: new Date().toISOString()
      })

      toast.success(`${plugin.name} installed`, {
        description: `${plugin.category} - ${plugin.version} - ${price} - ${plugin.rating}⭐ (${installsK}k installs) - Active and ready to use`
      })
      announce(`${plugin.name} installed`, 'polite')
    } catch (error: any) {
      logger.error('Failed to install plugin', { error: error.message, pluginId: plugin.id })
      toast.error('Failed to install plugin', {
        description: error.message || 'Please try again'
      })
    }
  }

  const handleUninstallPlugin = (pluginId: string) => {
    logger.info('Uninstalling plugin', { pluginId })
    const plugin = state.plugins.find(p => p.id === pluginId)
    const installedPlugin = state.installedPlugins.find(p => p.pluginId === pluginId)

    if (!plugin) {
      logger.warn('Plugin uninstallation failed', { reason: 'Plugin not found', pluginId })
      return
    }

    setUninstallPlugin({
      id: pluginId,
      name: plugin.name,
      category: plugin.category,
      version: plugin.version,
      fileSize: plugin.fileSize,
      installedAt: installedPlugin?.installedAt
    })
  }

  const handleConfirmUninstallPlugin = async () => {
    if (!uninstallPlugin) return

    logger.info('User confirmed uninstallation', { pluginId: uninstallPlugin.id, name: uninstallPlugin.name })

    try {
      if (userId) {
        const { deleteInstallationByPluginId } = await import('@/lib/plugin-marketplace-queries')
        const { error: deleteError } = await deleteInstallationByPluginId(userId, uninstallPlugin.id)
        if (deleteError) throw new Error(deleteError.message || 'Failed to uninstall plugin')
      }

      dispatch({ type: 'UNINSTALL_PLUGIN', pluginId: uninstallPlugin.id })

      const fileSizeMB = (uninstallPlugin.fileSize / (1024 * 1024)).toFixed(1)
      const installedDate = uninstallPlugin.installedAt ? new Date(uninstallPlugin.installedAt).toLocaleDateString() : 'Unknown'

      toast.success(`${uninstallPlugin.name} uninstalled`, {
        description: `${uninstallPlugin.category} plugin - ${uninstallPlugin.version} - ${fileSizeMB} MB freed - Installed since ${installedDate}`
      })
      announce('Plugin uninstalled', 'polite')
    } catch (error: any) {
      logger.error('Failed to uninstall plugin', { error: error.message, pluginId: uninstallPlugin.id })
      toast.error('Failed to uninstall plugin', {
        description: error.message || 'Please try again'
      })
    } finally {
      setUninstallPlugin(null)
    }
  }

  const handleTogglePluginActive = async (pluginId: string) => {
    const installed = state.installedPlugins.find(p => p.pluginId === pluginId)
    const plugin = state.plugins.find(p => p.id === pluginId)

    if (installed && plugin) {
      const newState = !installed.isActive

      logger.info('Toggling plugin active state', {
        pluginId,
        name: plugin.name,
        currentState: installed.isActive,
        newState
      })

      // Persist active state to database
      if (userId && installed.id) {
        try {
          const { updateInstallation } = await import('@/lib/plugin-marketplace-queries')
          await updateInstallation(installed.id, { is_active: newState })
          logger.info('Plugin active state persisted to database', { pluginId, isActive: newState })
        } catch (error: any) {
          logger.error('Failed to persist plugin active state', { error: error.message })
        }
      }

      dispatch({ type: 'TOGGLE_PLUGIN_ACTIVE', pluginId })

      toast.success(`${plugin.name} ${installed.isActive ? 'deactivated' : 'activated'}`, {
        description: `${plugin.category} plugin - ${plugin.version} - ${newState ? 'Now running' : 'Stopped'} - ${plugin.rating}⭐`
      })
    }
  }

  function formatPrice(plugin: Plugin): string {
    if (plugin.pricingType === 'free') return 'Free'
    if (plugin.pricingType === 'freemium') return 'Freemium'
    if (plugin.pricingType === 'one-time') return `$${plugin.price}`
    if (plugin.pricingType === 'subscription') return `$${plugin.price}/mo`
    return `$${plugin.price}`
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function isInstalled(pluginId: string): boolean {
    return state.installedPlugins.some(p => p.pluginId === pluginId)
  }

  function getCategoryIcon(category: PluginCategory) {
    const option = categoryOptions.find(c => c.id === category)
    return option?.icon || Package
  }

  // ============================================================================
  // A++++ QUICK ACTION HANDLERS
  // ============================================================================

  const handleCreatePlugin = async () => {
    if (!newPluginData.name.trim()) {
      toast.error('Plugin name is required')
      return
    }

    logger.info('Creating new plugin', { name: newPluginData.name, category: newPluginData.category })

    const newPlugin: Plugin = {
      id: `PLG-${Date.now()}`,
      name: newPluginData.name,
      description: newPluginData.description || `A new ${newPluginData.category} plugin`,
      longDescription: `${newPluginData.name} is a custom plugin created to enhance your workflow with specialized features.`,
      category: newPluginData.category,
      icon: ['🔌', '⚡', '🚀', '🎯', '💡', '🔥'][Math.floor(Math.random() * 6)],
      author: {
        id: userId || 'user-001',
        name: 'You',
        avatar: '👤',
        verified: false
      },
      version: newPluginData.version,
      rating: 0,
      reviewCount: 0,
      installCount: 0,
      price: newPluginData.price,
      pricingType: newPluginData.pricingType,
      status: 'published',
      fileSize: Math.floor(Math.random() * 5000000) + 100000,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isVerified: false,
      isFeatured: false,
      isTrending: false,
      isPopular: false,
      tags: [newPluginData.category],
      screenshots: [],
      compatibility: ['v1.0+'],
      requirements: ['Min 1GB RAM'],
      changelog: [`v${newPluginData.version}: Initial release`]
    }

    try {
      if (userId) {
        const { createPlugin } = await import('@/lib/plugin-marketplace-queries')
        const { error: createError } = await createPlugin({
          name: newPlugin.name,
          description: newPlugin.description,
          category: newPlugin.category,
          pricing_type: newPlugin.pricingType,
          price: newPlugin.price,
          version: newPlugin.version,
          author_id: userId
        })
        if (createError) throw new Error(createError.message || 'Failed to create plugin')
      }

      dispatch({ type: 'ADD_PLUGIN', plugin: newPlugin })

      toast.success('Plugin Created Successfully', {
        description: `${newPlugin.name} (${newPlugin.category}) - v${newPlugin.version} - Ready for installation`
      })

      setShowCreatePluginDialog(false)
      setNewPluginData({
        name: '',
        description: '',
        category: 'productivity',
        pricingType: 'free',
        price: 0,
        version: '1.0.0'
      })
      announce('New plugin created', 'polite')
    } catch (error: any) {
      logger.error('Failed to create plugin', { error: error.message })
      toast.error('Failed to create plugin', { description: error.message })
    }
  }

  const handleExportPluginData = () => {
    logger.info('Exporting plugin data', { format: exportOptions.format, options: exportOptions })

    const dataToExport: any = {
      exportDate: new Date().toISOString(),
      totalPlugins: state.plugins.length
    }

    if (exportOptions.includeInstalled) {
      dataToExport.installedPlugins = state.installedPlugins.map(ip => {
        const plugin = state.plugins.find(p => p.id === ip.pluginId)
        return {
          ...ip,
          pluginName: plugin?.name,
          pluginCategory: plugin?.category
        }
      })
    }

    if (exportOptions.includeStats) {
      dataToExport.stats = stats
    }

    if (exportOptions.includeSettings) {
      dataToExport.settings = marketplaceSettings
    }

    let content: string
    let filename: string
    let mimeType: string

    switch (exportOptions.format) {
      case 'csv':
        const headers = ['Plugin ID', 'Name', 'Category', 'Status', 'Installed At']
        const rows = state.installedPlugins.map(ip => {
          const plugin = state.plugins.find(p => p.id === ip.pluginId)
          return [ip.pluginId, plugin?.name || '', plugin?.category || '', ip.isActive ? 'Active' : 'Inactive', ip.installedAt]
        })
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        filename = `plugin-marketplace-export-${Date.now()}.csv`
        mimeType = 'text/csv'
        break
      case 'xml':
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<pluginExport>\n  <exportDate>${dataToExport.exportDate}</exportDate>\n  <totalPlugins>${dataToExport.totalPlugins}</totalPlugins>\n</pluginExport>`
        filename = `plugin-marketplace-export-${Date.now()}.xml`
        mimeType = 'application/xml'
        break
      default:
        content = JSON.stringify(dataToExport, null, 2)
        filename = `plugin-marketplace-export-${Date.now()}.json`
        mimeType = 'application/json'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Data Exported Successfully', {
      description: `Exported ${state.installedPlugins.length} plugins to ${exportOptions.format.toUpperCase()} format`
    })
    setShowExportDialog(false)
    announce('Plugin data exported', 'polite')
  }

  const handleSaveSettings = () => {
    logger.info('Saving marketplace settings', { settings: marketplaceSettings })

    // Apply default view and sort settings
    dispatch({ type: 'SET_VIEW_MODE', viewMode: marketplaceSettings.defaultView })
    dispatch({ type: 'SET_SORT', sortBy: marketplaceSettings.defaultSort })

    // Store settings in localStorage for persistence
    try {
      localStorage.setItem('pluginMarketplaceSettings', JSON.stringify(marketplaceSettings))
    } catch (e) {
      logger.warn('Failed to save settings to localStorage')
    }

    toast.success('Settings Saved', {
      description: `Auto-update: ${marketplaceSettings.autoUpdate ? 'On' : 'Off'} | Notifications: ${marketplaceSettings.notifyNewPlugins ? 'On' : 'Off'} | Beta plugins: ${marketplaceSettings.showBetaPlugins ? 'Visible' : 'Hidden'}`
    })
    setShowSettingsDialog(false)
    announce('Settings saved successfully', 'polite')
  }

  // ============================================================================
  // A++++ LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 min-h-screen relative">
        
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={pluginMarketplaceAIInsights} />
          <PredictiveAnalytics predictions={pluginMarketplacePredictions} />
          <CollaborationIndicator collaborators={pluginMarketplaceCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={pluginMarketplaceQuickActions} />
          <ActivityFeed activities={pluginMarketplaceActivities} />
        </div>
<div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
        <div className="max-w-[1920px] mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // A++++ ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <div className="p-6 space-y-6 min-h-screen relative">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
        <div className="max-w-[1920px] mx-auto">
          <ErrorEmptyState
            error={error}
            action={{
              label: 'Retry',
              onClick: () => window.location.reload()
            }}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // A++++ MAIN RENDER
  // ============================================================================
  return (
    <div className="p-6 space-y-6 min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>

      <PageHeader
        title="Plugin Marketplace"
        description="Discover and install powerful plugins to extend your platform capabilities"
        icon={Package}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Plugin Marketplace' }
        ]}
      />

      {/* Stats Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Total Plugins</p>
                  <NumberFlow value={stats.total} className="text-2xl font-bold text-white" />
                </div>
                <FloatingParticle color="emerald" size="sm">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Package className="h-6 w-6 text-emerald-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Installed</p>
                  <NumberFlow value={stats.installed} className="text-2xl font-bold text-white" />
                </div>
                <FloatingParticle color="green" size="sm">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Total Installs</p>
                  <div className="text-2xl font-bold text-white">
                    {(stats.totalInstalls / 1000000).toFixed(1)}M
                  </div>
                </div>
                <FloatingParticle color="cyan" size="sm">
                  <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <Download className="h-6 w-6 text-cyan-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Avg Rating</p>
                  <div className="text-2xl font-bold text-white">
                    {stats.avgRating.toFixed(1)} ⭐
                  </div>
                </div>
                <FloatingParticle color="amber" size="sm">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Star className="h-6 w-6 text-amber-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Verified</p>
                  <NumberFlow value={stats.verified} className="text-2xl font-bold text-white" />
                </div>
                <FloatingParticle color="blue" size="sm">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Shield className="h-6 w-6 text-blue-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Featured</p>
                  <NumberFlow value={stats.featured} className="text-2xl font-bold text-white" />
                </div>
                <FloatingParticle color="purple" size="sm">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Award className="h-6 w-6 text-purple-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </div>
      </ScrollReveal>

      {/* Category Pills */}
      <ScrollReveal delay={0.1}>
        <LiquidGlassCard>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => dispatch({ type: 'SET_FILTER_CATEGORY', filterCategory: 'all' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  state.filterCategory === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                All Plugins
              </button>
              {categoryOptions.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => dispatch({ type: 'SET_FILTER_CATEGORY', filterCategory: category.id })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      state.filterCategory === category.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </LiquidGlassCard>
      </ScrollReveal>

      {/* Actions Bar */}
      <ScrollReveal delay={0.2}>
        <LiquidGlassCard>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search plugins..."
                    value={state.searchTerm}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                    className="pl-10 bg-slate-900/50 border-slate-700"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select
                  value={state.filterPricing}
                  onValueChange={(value) => dispatch({ type: 'SET_FILTER_PRICING', filterPricing: value as any })}
                >
                  <SelectTrigger className="w-[140px] bg-slate-900/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pricing</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={state.sortBy}
                  onValueChange={(value) => dispatch({ type: 'SET_SORT', sortBy: value as any })}
                >
                  <SelectTrigger className="w-[140px] bg-slate-900/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={state.showInstalledOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'TOGGLE_INSTALLED_ONLY' })}
                  className={state.showInstalledOnly ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : ''}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Installed
                </Button>

                <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'grid' })}
                    className={state.viewMode === 'grid' ? 'bg-slate-700' : ''}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'list' })}
                    className={state.viewMode === 'list' ? 'bg-slate-700' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </LiquidGlassCard>
      </ScrollReveal>

      {/* Plugins Grid */}
      <ScrollReveal delay={0.3}>
        <div className={`grid gap-4 ${
          state.viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
        }`}>
          <AnimatePresence mode="popLayout">
            {filteredAndSortedPlugins.map((plugin, index) => {
              const Icon = getCategoryIcon(plugin.category)
              const installed = isInstalled(plugin.id)
              const installedPlugin = state.installedPlugins.find(p => p.pluginId === plugin.id)

              return (
                <motion.div
                  key={plugin.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <LiquidGlassCard className="group cursor-pointer hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-0">
                      {state.viewMode === 'grid' && (
                        <div className="p-4 space-y-3">
                          {/* Header */}
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{plugin.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-white truncate">{plugin.name}</h3>
                                {plugin.isVerified && (
                                  <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400">{plugin.author.name}</p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-400 line-clamp-2">{plugin.description}</p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1">
                            {plugin.isFeatured && (
                              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {plugin.isTrending && (
                              <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            {installed && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Installed
                              </Badge>
                            )}
                          </div>

                          {/* Rating & Stats */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-white font-medium">{plugin.rating}</span>
                              <span className="text-gray-500">({plugin.reviewCount})</span>
                            </div>
                            <div className="text-gray-400">
                              {(plugin.installCount / 1000).toFixed(1)}k installs
                            </div>
                          </div>

                          {/* Price & Actions */}
                          <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
                            <div className="text-lg font-bold text-white">
                              {formatPrice(plugin)}
                            </div>
                            <div className="flex gap-1">
                              {installed ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-8">
                                      <Settings className="h-3 w-3 mr-1" />
                                      Manage
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleTogglePluginActive(plugin.id)}>
                                      {installedPlugin?.isActive ? 'Deactivate' : 'Activate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewPlugin(plugin)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleUninstallPlugin(plugin.id)}
                                      className="text-red-400"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Uninstall
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleInstallPlugin(plugin)}
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-8"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Install
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewPlugin(plugin)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {state.viewMode === 'list' && (
                        <div className="p-4 flex items-center gap-4">
                          <div className="text-3xl">{plugin.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-white">{plugin.name}</h3>
                                  {plugin.isVerified && (
                                    <Shield className="h-4 w-4 text-emerald-400" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-400">{plugin.description}</p>
                              </div>
                              <div className="text-lg font-bold text-white whitespace-nowrap">
                                {formatPrice(plugin)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {plugin.rating}
                                </div>
                                <div>{(plugin.installCount / 1000).toFixed(1)}k installs</div>
                                <Badge variant="outline" className="text-xs">
                                  {plugin.category}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                {installed ? (
                                  <Button size="sm" variant="outline">
                                    <Settings className="h-3 w-3 mr-1" />
                                    Manage
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleInstallPlugin(plugin)}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Install
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => handleViewPlugin(plugin)}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </LiquidGlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {filteredAndSortedPlugins.length === 0 && (
          <NoDataEmptyState message="No plugins found" />
        )}
      </ScrollReveal>

      {/* View Plugin Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{state.selectedPlugin?.icon}</span>
              {state.selectedPlugin?.name}
              {state.selectedPlugin?.isVerified && (
                <Shield className="h-5 w-5 text-emerald-400" />
              )}
            </DialogTitle>
            <DialogDescription>
              by {state.selectedPlugin?.author.name}
            </DialogDescription>
          </DialogHeader>

          {state.selectedPlugin && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="changelog">Changelog</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Screenshots */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                  {state.selectedPlugin.screenshots.map((screenshot, i) => (
                    <img key={i}
                      src={screenshot}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    loading="lazy" />
                  ))}
                </div>

                <div>
                  <Label className="text-gray-400">Description</Label>
                  <p className="text-white mt-2">{state.selectedPlugin.longDescription}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label className="text-gray-400">Category</Label>
                    <p className="text-white capitalize">{state.selectedPlugin.category}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Version</Label>
                    <p className="text-white">{state.selectedPlugin.version}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">File Size</Label>
                    <p className="text-white">{formatFileSize(state.selectedPlugin.fileSize)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Installs</Label>
                    <p className="text-white">{(state.selectedPlugin.installCount / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Rating</Label>
                    <p className="text-white">{state.selectedPlugin.rating} ⭐ ({state.selectedPlugin.reviewCount} reviews)</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Pricing</Label>
                    <p className="text-white">{formatPrice(state.selectedPlugin)}</p>
                  </div>
                </div>

                {state.selectedPlugin.tags.length > 0 && (
                  <div>
                    <Label className="text-gray-400">Tags</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {state.selectedPlugin.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {/* Review Summary */}
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{state.selectedPlugin.rating.toFixed(1)}</div>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(state.selectedPlugin.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{state.selectedPlugin.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-3">{stars}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${stars === 5 ? 65 : stars === 4 ? 20 : stars === 3 ? 10 : stars === 2 ? 3 : 2}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Reviews */}
                <div className="space-y-3">
                  {[
                    { name: 'Alex M.', rating: 5, date: '2 days ago', comment: 'Excellent plugin! Works flawlessly with my workflow. Highly recommended.' },
                    { name: 'Sarah K.', rating: 4, date: '1 week ago', comment: 'Great features, easy to set up. Minor UI improvements needed but overall solid.' },
                    { name: 'James R.', rating: 5, date: '2 weeks ago', comment: 'This plugin saved me hours of work. The automation features are incredible.' }
                  ].map((review, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium text-sm">
                            {review.name.charAt(0)}
                          </div>
                          <span className="font-medium text-white text-sm">{review.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full border-slate-600 text-gray-300 hover:bg-slate-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              </TabsContent>

              <TabsContent value="changelog" className="space-y-4">
                <div className="space-y-3">
                  {state.selectedPlugin.changelog.map((entry, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-white text-sm">{entry}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            {state.selectedPlugin && isInstalled(state.selectedPlugin.id) ? (
              <Button
                variant="outline"
                onClick={() => handleUninstallPlugin(state.selectedPlugin!.id)}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <X className="h-4 w-4 mr-2" />
                Uninstall
              </Button>
            ) : (
              <Button
                onClick={() => state.selectedPlugin && handleInstallPlugin(state.selectedPlugin)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Plugin
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Uninstall Plugin Confirmation Dialog */}
      <AlertDialog open={!!uninstallPlugin} onOpenChange={() => setUninstallPlugin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uninstall Plugin?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{uninstallPlugin?.name}&quot; and all its data and settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUninstallPlugin}
              className="bg-red-500 hover:bg-red-600"
            >
              Uninstall
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Plugin Dialog */}
      <Dialog open={showCreatePluginDialog} onOpenChange={setShowCreatePluginDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-400" />
              Create New Plugin
            </DialogTitle>
            <DialogDescription>
              Create a custom plugin to extend your marketplace
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plugin-name">Plugin Name *</Label>
              <Input
                id="plugin-name"
                placeholder="My Awesome Plugin"
                value={newPluginData.name}
                onChange={(e) => setNewPluginData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plugin-description">Description</Label>
              <Input
                id="plugin-description"
                placeholder="A brief description of what your plugin does"
                value={newPluginData.description}
                onChange={(e) => setNewPluginData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="plugin-category">Category</Label>
                <Select
                  value={newPluginData.category}
                  onValueChange={(value) => setNewPluginData(prev => ({ ...prev, category: value as PluginCategory }))}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plugin-pricing">Pricing Type</Label>
                <Select
                  value={newPluginData.pricingType}
                  onValueChange={(value) => setNewPluginData(prev => ({ ...prev, pricingType: value as PricingType }))}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="one-time">One-time Purchase</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newPluginData.pricingType !== 'free' && (
              <div className="space-y-2">
                <Label htmlFor="plugin-price">Price ($)</Label>
                <Input
                  id="plugin-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="9.99"
                  value={newPluginData.price || ''}
                  onChange={(e) => setNewPluginData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="plugin-version">Version</Label>
              <Input
                id="plugin-version"
                placeholder="1.0.0"
                value={newPluginData.version}
                onChange={(e) => setNewPluginData(prev => ({ ...prev, version: e.target.value }))}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePluginDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlugin}
              className="bg-gradient-to-r from-emerald-500 to-teal-600"
              disabled={!newPluginData.name.trim()}
            >
              <Package className="h-4 w-4 mr-2" />
              Create Plugin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-cyan-400" />
              Export Plugin Data
            </DialogTitle>
            <DialogDescription>
              Export your plugin marketplace data in your preferred format
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as 'json' | 'csv' | 'xml' }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (Full Data)</SelectItem>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="xml">XML (Structured)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Include in Export</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeInstalled}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeInstalled: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-300">Installed Plugins ({state.installedPlugins.length})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeStats}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-300">Marketplace Statistics</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSettings}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeSettings: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-300">Current Settings</span>
                </label>
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-gray-400">
                Total plugins in marketplace: <span className="text-white font-medium">{state.plugins.length}</span>
              </p>
              <p className="text-xs text-gray-400">
                Installed plugins: <span className="text-white font-medium">{state.installedPlugins.length}</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExportPluginData}
              className="bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-400" />
              Marketplace Settings
            </DialogTitle>
            <DialogDescription>
              Customize your plugin marketplace experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Plugin Updates</Label>
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">Auto-update installed plugins</span>
                  <input
                    type="checkbox"
                    checked={marketplaceSettings.autoUpdate}
                    onChange={(e) => setMarketplaceSettings(prev => ({ ...prev, autoUpdate: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">Notify about new plugins</span>
                  <input
                    type="checkbox"
                    checked={marketplaceSettings.notifyNewPlugins}
                    onChange={(e) => setMarketplaceSettings(prev => ({ ...prev, notifyNewPlugins: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">Show beta plugins</span>
                  <input
                    type="checkbox"
                    checked={marketplaceSettings.showBetaPlugins}
                    onChange={(e) => setMarketplaceSettings(prev => ({ ...prev, showBetaPlugins: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default View</Label>
              <Select
                value={marketplaceSettings.defaultView}
                onValueChange={(value) => setMarketplaceSettings(prev => ({ ...prev, defaultView: value as ViewMode }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default Sort</Label>
              <Select
                value={marketplaceSettings.defaultSort}
                onValueChange={(value) => setMarketplaceSettings(prev => ({ ...prev, defaultSort: value as PluginState['sortBy'] }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg space-y-1">
              <p className="text-xs text-gray-400">
                Active plugins: <span className="text-emerald-400 font-medium">{state.installedPlugins.filter(p => p.isActive).length}</span>
              </p>
              <p className="text-xs text-gray-400">
                Inactive plugins: <span className="text-amber-400 font-medium">{state.installedPlugins.filter(p => !p.isActive).length}</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
