'use client'

import { useState, useEffect, useReducer, useMemo } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { NumberFlow } from '@/components/ui/number-flow'
import { motion, AnimatePresence } from 'framer-motion'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Plugin-Marketplace')

// ============================================================================
// A+++ UTILITIES
// ============================================================================
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  Package,
  Download,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Share2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Settings,
  Eye,
  Users,
  Clock,
  BarChart3,
  Play,
  RefreshCw,
  Info,
  Sparkles,
  Heart,
  MessageSquare,
  ChevronDown,
  Plus,
  Book,
  Code,
  Globe,
  Lock,
  Check,
  X,
  MoreVertical,
  FileCode,
  Palette,
  Database,
  Bell,
  Briefcase,
  Target,
  Rocket,
  Monitor
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

export default function PluginMarketplacePage() {
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

  // Confirmation Dialog State
  const [uninstallPlugin, setUninstallPlugin] = useState<{ id: string; name: string; category: string; version: string; fileSize: number; installedAt?: string } | null>(null)

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

    // Note: Using local state - in production, this would POST to /api/plugins/install
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

  const handleConfirmUninstallPlugin = () => {
    if (!uninstallPlugin) return

    logger.info('User confirmed uninstallation', { pluginId: uninstallPlugin.id, name: uninstallPlugin.name })
    dispatch({ type: 'UNINSTALL_PLUGIN', pluginId: uninstallPlugin.id })

    const fileSizeMB = (uninstallPlugin.fileSize / (1024 * 1024)).toFixed(1)
    const installedDate = uninstallPlugin.installedAt ? new Date(uninstallPlugin.installedAt).toLocaleDateString() : 'Unknown'

    toast.success(`${uninstallPlugin.name} uninstalled`, {
      description: `${uninstallPlugin.category} plugin - ${uninstallPlugin.version} - ${fileSizeMB} MB freed - Installed since ${installedDate}`
    })
    announce('Plugin uninstalled', 'polite')
    setUninstallPlugin(null)
  }

  const handleTogglePluginActive = (pluginId: string) => {
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
  // A++++ LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 min-h-screen relative">
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
                <div className="grid grid-cols-3 gap-2">
                  {state.selectedPlugin.screenshots.map((screenshot, i) => (
                    <img
                      key={i}
                      src={screenshot}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>

                <div>
                  <Label className="text-gray-400">Description</Label>
                  <p className="text-white mt-2">{state.selectedPlugin.longDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
    </div>
  )
}
