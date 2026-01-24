'use client'

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useReducer, useMemo } from 'react'
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { NumberFlow } from '@/components/ui/number-flow'
import { motion, AnimatePresence } from 'framer-motion'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('A-Plus-Showcase')

// ============================================================================
// A+++ UTILITIES
// ============================================================================
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  Box,
  Code,
  Copy,
  Eye,
  MoreVertical,
  Search,
  FileCode,
  Layout,
  Zap,
  Database,
  Bell,
  Menu,
  Grid,
  List,
  Download,
  Share2,
  Heart,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
  Settings,
  Component
} from 'lucide-react'

// ============================================================================
// A++++ TYPES
// ============================================================================

type ComponentCategory = 'ui' | 'layout' | 'animation' | 'data-display' | 'navigation' | 'feedback' | 'forms' | 'utilities'
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type ViewMode = 'grid' | 'list' | 'code'
type CodeLanguage = 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'css' | 'html'

interface ComponentShowcase {
  id: string
  name: string
  description: string
  category: ComponentCategory
  difficulty: DifficultyLevel
  code: string
  preview: string
  language: CodeLanguage
  tags: string[]
  popularity: number
  examples: number
  downloads: number
  isFavorite: boolean
  isPremium: boolean
  createdAt: string
  updatedAt: string
  author: string
  version: string
  dependencies: string[]
}

interface ShowcaseState {
  components: ComponentShowcase[]
  selectedComponent: ComponentShowcase | null
  searchTerm: string
  filterCategory: 'all' | ComponentCategory
  filterDifficulty: 'all' | DifficultyLevel
  sortBy: 'name' | 'popularity' | 'recent' | 'downloads' | 'examples'
  viewMode: ViewMode
  selectedComponents: string[]
  showFavoritesOnly: boolean
}

type ShowcaseAction =
  | { type: 'SET_COMPONENTS'; components: ComponentShowcase[] }
  | { type: 'ADD_COMPONENT'; component: ComponentShowcase }
  | { type: 'UPDATE_COMPONENT'; component: ComponentShowcase }
  | { type: 'DELETE_COMPONENT'; componentId: string }
  | { type: 'SELECT_COMPONENT'; component: ComponentShowcase | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_CATEGORY'; filterCategory: 'all' | ComponentCategory }
  | { type: 'SET_FILTER_DIFFICULTY'; filterDifficulty: 'all' | DifficultyLevel }
  | { type: 'SET_SORT'; sortBy: ShowcaseState['sortBy'] }
  | { type: 'SET_VIEW_MODE'; viewMode: ViewMode }
  | { type: 'TOGGLE_SELECT_COMPONENT'; componentId: string }
  | { type: 'CLEAR_SELECTED_COMPONENTS' }
  | { type: 'TOGGLE_FAVORITE'; componentId: string }
  | { type: 'TOGGLE_FAVORITES_ONLY' }

// ============================================================================
// A++++ REDUCER
// ============================================================================

function showcaseReducer(state: ShowcaseState, action: ShowcaseAction): ShowcaseState {
  logger.debug('Reducer action', { type: action.type })

  switch (action.type) {
    case 'SET_COMPONENTS':
      logger.info('Setting components', { count: action.components.length })
      return { ...state, components: action.components }

    case 'ADD_COMPONENT':
      logger.info('Adding component', { componentId: action.component.id, name: action.component.name })
      return { ...state, components: [action.component, ...state.components] }

    case 'UPDATE_COMPONENT':
      logger.info('Updating component', { componentId: action.component.id, name: action.component.name })
      return {
        ...state,
        components: state.components.map(c => c.id === action.component.id ? action.component : c),
        selectedComponent: state.selectedComponent?.id === action.component.id ? action.component : state.selectedComponent
      }

    case 'DELETE_COMPONENT':
      logger.info('Deleting component', { componentId: action.componentId })
      return {
        ...state,
        components: state.components.filter(c => c.id !== action.componentId),
        selectedComponent: state.selectedComponent?.id === action.componentId ? null : state.selectedComponent
      }

    case 'SELECT_COMPONENT':
      logger.info('Selecting component', { componentId: action.component?.id })
      return { ...state, selectedComponent: action.component }

    case 'SET_SEARCH':
      logger.debug('Search term updated', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_CATEGORY':
      logger.debug('Filter category updated', { category: action.filterCategory })
      return { ...state, filterCategory: action.filterCategory }

    case 'SET_FILTER_DIFFICULTY':
      logger.debug('Filter difficulty updated', { difficulty: action.filterDifficulty })
      return { ...state, filterDifficulty: action.filterDifficulty }

    case 'SET_SORT':
      logger.debug('Sort updated', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      logger.debug('View mode updated', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'TOGGLE_SELECT_COMPONENT':
      logger.debug('Toggle select component', { componentId: action.componentId })
      return {
        ...state,
        selectedComponents: state.selectedComponents.includes(action.componentId)
          ? state.selectedComponents.filter(id => id !== action.componentId)
          : [...state.selectedComponents, action.componentId]
      }

    case 'CLEAR_SELECTED_COMPONENTS':
      logger.debug('Clearing selected components')
      return { ...state, selectedComponents: [] }

    case 'TOGGLE_FAVORITE':
      logger.info('Toggling favorite', { componentId: action.componentId })
      return {
        ...state,
        components: state.components.map(c =>
          c.id === action.componentId ? { ...c, isFavorite: !c.isFavorite } : c
        )
      }

    case 'TOGGLE_FAVORITES_ONLY':
      logger.debug('Toggle favorites only filter', { currentState: state.showFavoritesOnly })
      return { ...state, showFavoritesOnly: !state.showFavoritesOnly }

    default:
      return state
  }
}


// ============================================================================
// A++++ CATEGORIES
// ============================================================================

interface CategoryOption {
  id: ComponentCategory
  name: string
  icon: any
  color: string
}

const categoryOptions: CategoryOption[] = [
  { id: 'ui', name: 'UI Components', icon: Box, color: 'blue' },
  { id: 'layout', name: 'Layout', icon: Layout, color: 'green' },
  { id: 'animation', name: 'Animations', icon: Zap, color: 'purple' },
  { id: 'data-display', name: 'Data Display', icon: Database, color: 'cyan' },
  { id: 'navigation', name: 'Navigation', icon: Menu, color: 'orange' },
  { id: 'feedback', name: 'Feedback', icon: Bell, color: 'pink' },
  { id: 'forms', name: 'Forms', icon: FileCode, color: 'yellow' },
  { id: 'utilities', name: 'Utilities', icon: Settings, color: 'gray' }
]

// ============================================================================
// A++++ FLOATING PARTICLE COMPONENT
// ============================================================================

const FloatingParticle: React.FC<{
  children: React.ReactNode
  color?: 'purple' | 'blue' | 'green' | 'cyan' | 'amber' | 'emerald'
  size?: 'sm' | 'md' | 'lg'
}> = ({ children, color: _color = 'purple', size: _size = 'md' }) => {
  void _color
  void _size
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

export default function APlusShowcasePage() {
  logger.debug('A+ showcase component mounting')

  // ============================================================================
  // A++++ STATE MANAGEMENT
  // ============================================================================
  const { userId } = useCurrentUser()
  const { announce } = useAnnouncer()
  void announce

  const [state, dispatch] = useReducer(showcaseReducer, {
    components: [],
    selectedComponent: null,
    searchTerm: '',
    filterCategory: 'all',
    filterDifficulty: 'all',
    sortBy: 'popularity',
    viewMode: 'grid',
    selectedComponents: [],
    showFavoritesOnly: false
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [, _setShowCreateModal] = useState(false)
  const [, _setShowDetailsModal] = useState(false)
  void _setShowCreateModal
  void _setShowDetailsModal

  // Form states - available for future form implementations
  const [, _setComponentName] = useState('')
  const [, _setComponentDescription] = useState('')
  const [, _setSelectedCategory] = useState<ComponentCategory>('ui')
  const [, _setSelectedDifficulty] = useState<DifficultyLevel>('beginner')
  void _setComponentName
  void _setComponentDescription
  void _setSelectedCategory
  void _setSelectedDifficulty

  // ============================================================================
  // A++++ LOAD DATA
  // ============================================================================
  useEffect(() => {
    const loadComponents = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      logger.info('Loading components', { userId })
      try {
        setIsLoading(true)
        setError(null)

        // TODO: In production, fetch from /api/components
        const components: ComponentShowcase[] = []
        dispatch({ type: 'SET_COMPONENTS', components })

        logger.info('Components loaded successfully', { count: components.length, userId })
        setIsLoading(false)
        announce('Components loaded successfully', 'polite')
      } catch (err) {
        logger.error('Failed to load components', {
          error: err instanceof Error ? err.message : String(err),
          userId
        })
        setError(err instanceof Error ? err.message : 'Failed to load components')
        setIsLoading(false)
        announce('Error loading components', 'assertive')
      }
    }

    loadComponents()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // A++++ COMPUTED VALUES
  // ============================================================================
  const stats = useMemo(() => {
    logger.debug('Computing component stats')
    const total = state.components.length
    const categories = new Set(state.components.map(c => c.category)).size
    const totalExamples = state.components.reduce((sum, c) => sum + c.examples, 0)
    const totalDownloads = state.components.reduce((sum, c) => sum + c.downloads, 0)
    const favorites = state.components.filter(c => c.isFavorite).length
    const premium = state.components.filter(c => c.isPremium).length
    const mostPopular = state.components.reduce((max, c) => c.popularity > max ? c.popularity : max, 0)

    const computedStats = {
      total,
      categories,
      totalExamples,
      totalDownloads,
      favorites,
      premium,
      mostPopular
    }

    logger.debug('Component stats computed', computedStats)
    return computedStats
  }, [state.components])

  const filteredAndSortedComponents = useMemo(() => {
    logger.debug('Filtering and sorting components', { searchTerm: state.searchTerm, category: state.filterCategory, difficulty: state.filterDifficulty, sortBy: state.sortBy })
    let filtered = state.components

    // Search
    if (state.searchTerm) {
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        component.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()))
      )
      logger.debug('Search filter applied', { count: filtered.length, searchTerm: state.searchTerm })
    }

    // Filter by category
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(component => component.category === state.filterCategory)
      logger.debug('Category filter applied', { count: filtered.length, category: state.filterCategory })
    }

    // Filter by difficulty
    if (state.filterDifficulty !== 'all') {
      filtered = filtered.filter(component => component.difficulty === state.filterDifficulty)
      logger.debug('Difficulty filter applied', { count: filtered.length, difficulty: state.filterDifficulty })
    }

    // Filter favorites only
    if (state.showFavoritesOnly) {
      filtered = filtered.filter(component => component.isFavorite)
      logger.debug('Favorites filter applied', { count: filtered.length })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'popularity':
          return b.popularity - a.popularity
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'downloads':
          return b.downloads - a.downloads
        case 'examples':
          return b.examples - a.examples
        default:
          return 0
      }
    })

    logger.debug('Components sorted', { sortBy: state.sortBy, finalCount: sorted.length })
    return sorted
  }, [state.components, state.searchTerm, state.filterCategory, state.filterDifficulty, state.sortBy, state.showFavoritesOnly])

  // ============================================================================
  // A++++ HANDLERS
  // ============================================================================

  const handleViewComponent = (component: ComponentShowcase) => {
    logger.info('Opening component view', {
      componentId: component.id,
      name: component.name,
      category: component.category,
      difficulty: component.difficulty,
      popularity: component.popularity,
      downloads: component.downloads
    })

    dispatch({ type: 'SELECT_COMPONENT', component })
    setShowViewModal(true)
  }

  const handleCopyCode = async (code: string, componentName: string) => {
    logger.info('Copying code to clipboard', { componentName, codeLength: code.length })

    try {
      await navigator.clipboard.writeText(code)
      const lines = code.split('\n').length
      const chars = code.length

      logger.info('Code copied successfully', { componentName, lines, chars })

      toast.success('Code copied to clipboard', {
        description: `${componentName} - ${lines} lines - ${chars} characters - Ready to paste`
      })
      announce('Code copied to clipboard', 'polite')
    } catch (err) {
      logger.error('Failed to copy code', { componentName, error: err instanceof Error ? err.message : String(err) })
      toast.error('Failed to copy code')
    }
  }

  const handleDownloadComponent = (component: ComponentShowcase) => {
    logger.info('Downloading component', {
      componentId: component.id,
      name: component.name,
      category: component.category,
      version: component.version,
      language: component.language
    })

    // Generate real file download
    const fileName = `${component.name.replace(/\s+/g, '-').toLowerCase()}-${component.version}.${component.language === 'typescript' || component.language === 'tsx' ? 'tsx' : 'jsx'}`
    const blob = new Blob([component.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)

    const updatedComponent = {
      ...component,
      downloads: component.downloads + 1
    }

    dispatch({ type: 'UPDATE_COMPONENT', component: updatedComponent })

    const fileSizeKB = (blob.size / 1024).toFixed(1)
    const newDownloadCount = (updatedComponent.downloads / 1000).toFixed(1)

    logger.info('Component downloaded successfully', {
      componentId: component.id,
      fileName,
      fileSize: blob.size,
      totalDownloads: updatedComponent.downloads
    })

    toast.success(`${component.name} downloaded`, {
      description: `${fileName} - ${fileSizeKB} KB - ${component.category} - ${component.difficulty} - ${newDownloadCount}k total downloads`
    })
    announce(`Downloaded ${component.name}`, 'polite')
  }

  const handleToggleFavorite = (componentId: string) => {
    const component = state.components.find(c => c.id === componentId)

    if (component) {
      const newState = !component.isFavorite

      logger.info('Toggling favorite', {
        componentId,
        name: component.name,
        currentState: component.isFavorite,
        newState
      })

      dispatch({ type: 'TOGGLE_FAVORITE', componentId })

      const popularityK = (component.popularity / 1000).toFixed(1)

      toast.success(component.isFavorite ? 'Removed from favorites' : 'Added to favorites', {
        description: `${component.name} - ${component.category} - ${component.difficulty} - ${popularityK}k popularity`
      })
    }
  }

  const handleShareComponent = async (component: ComponentShowcase) => {
    logger.info('Sharing component', {
      componentId: component.id,
      name: component.name,
      category: component.category
    })

    const shareUrl = `https://kazi.com/components/${component.id}`

    try {
      await navigator.clipboard.writeText(shareUrl)

      logger.info('Share link copied successfully', { componentId: component.id, shareUrl })

      const downloadsK = (component.downloads / 1000).toFixed(1)

      toast.success('Share link copied to clipboard', {
        description: `${component.name} - ${component.category} - ${component.difficulty} - ${downloadsK}k downloads - Share with your team`
      })
      announce('Share link copied', 'polite')
    } catch (err) {
      logger.error('Failed to copy share link', {
        componentId: component.id,
        error: err instanceof Error ? err.message : String(err)
      })
      toast.error('Failed to copy share link')
    }
  }

  function _getCategoryIcon(category: ComponentCategory) {
    const option = categoryOptions.find(c => c.id === category)
    return option?.icon || Box
  }
  void _getCategoryIcon

  function getDifficultyColor(difficulty: DifficultyLevel) {
    const colors = {
      beginner: 'green',
      intermediate: 'blue',
      advanced: 'orange',
      expert: 'red'
    }
    return colors[difficulty] || 'gray'
  }

  // ============================================================================
  // A++++ LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 min-h-screen relative">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
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
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
        <div className="max-w-[1920px] mx-auto">
          <ErrorEmptyState error={error} />
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
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>

      <PageHeader
        title="Component Showcase"
        description="Professional component library with 60+ ready-to-use React components"
        icon={Component}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Component Showcase' }
        ]}
      />

      {/* Stats Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Total Components</p>
                  <NumberFlow value={stats.total} className="text-2xl font-bold text-white" />
                </div>
                <FloatingParticle color="purple" size="sm">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Component className="h-6 w-6 text-purple-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Categories</p>
                  <NumberFlow value={stats.categories} className="text-2xl font-bold text-white" />
                </div>
                <FloatingParticle color="blue" size="sm">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Grid className="h-6 w-6 text-blue-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Code Snippets</p>
                  <NumberFlow value={stats.total} className="text-2xl font-bold text-white" />
                </div>
                <FloatingParticle color="green" size="sm">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Code className="h-6 w-6 text-green-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Total Examples</p>
                  <NumberFlow value={stats.totalExamples} className="text-2xl font-bold text-white" />
                </div>
                <FloatingParticle color="amber" size="sm">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <BookOpen className="h-6 w-6 text-amber-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Most Popular</p>
                  <div className="text-2xl font-bold text-white">
                    {(stats.mostPopular / 1000).toFixed(1)}k
                  </div>
                </div>
                <FloatingParticle color="purple" size="sm">
                  <div className="p-3 bg-pink-500/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-pink-400" />
                  </div>
                </FloatingParticle>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Your Favorites</p>
                  <NumberFlow value={stats.favorites} className="text-2xl font-bold text-white" />
                </div>
                <FloatingParticle color="amber" size="sm">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <Heart className="h-6 w-6 text-red-400" />
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
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                All Components
              </button>
              {categoryOptions.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => dispatch({ type: 'SET_FILTER_CATEGORY', filterCategory: category.id })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      state.filterCategory === category.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
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
                    placeholder="Search components..."
                    value={state.searchTerm}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                    className="pl-10 bg-slate-900/50 border-slate-700"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select
                  value={state.filterDifficulty}
                  onValueChange={(value) => dispatch({ type: 'SET_FILTER_DIFFICULTY', filterDifficulty: value as any })}
                >
                  <SelectTrigger className="w-[140px] bg-slate-900/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
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
                    <SelectItem value="popularity">Popular</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="downloads">Downloads</SelectItem>
                    <SelectItem value="examples">Examples</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={state.showFavoritesOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'TOGGLE_FAVORITES_ONLY' })}
                  className={state.showFavoritesOnly ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                >
                  <Heart className={`h-4 w-4 mr-2 ${state.showFavoritesOnly ? 'fill-current' : ''}`} />
                  Favorites
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'code' })}
                    className={state.viewMode === 'code' ? 'bg-slate-700' : ''}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </LiquidGlassCard>
      </ScrollReveal>

      {/* Components Grid */}
      <ScrollReveal delay={0.3}>
        <div className={`grid gap-4 ${
          state.viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
          state.viewMode === 'list' ? 'grid-cols-1' :
          'grid-cols-1'
        }`}>
          <AnimatePresence mode="popLayout">
            {filteredAndSortedComponents.map((component, index) => (
              <motion.div
                key={component.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.02 }}
              >
                <LiquidGlassCard className="group cursor-pointer hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    {state.viewMode === 'grid' && (
                      <>
                        {/* Preview */}
                        <div
                          className="relative h-40 bg-slate-800 rounded-t-xl overflow-hidden"
                          onClick={() => handleViewComponent(component)}
                        >
                          <img src={component.preview}
                            alt={component.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy" />
                          <div className="absolute top-2 left-2 flex gap-1">
                            {component.isPremium && (
                              <Badge className="bg-amber-500/90 text-white">
                                <Award className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleFavorite(component.id)
                              }}
                              className="p-2 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
                            >
                              <Heart className={`h-4 w-4 ${component.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">{component.name}</h3>
                              <p className="text-xs text-gray-400 line-clamp-2">{component.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {(component.popularity / 1000).toFixed(1)}k
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {(component.downloads / 1000).toFixed(1)}k
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {component.examples}
                            </div>
                          </div>

                          <div className="flex gap-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-xs bg-${getDifficultyColor(component.difficulty)}-500/10 border-${getDifficultyColor(component.difficulty)}-500/30`}
                            >
                              {component.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {component.language}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewComponent(component)}
                              className="flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyCode(component.code, component.name)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownloadComponent(component)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShareComponent(component)}>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </>
                    )}

                    {state.viewMode === 'list' && (
                      <div className="p-4 flex items-center gap-4">
                        <img src={component.preview}
                          alt={component.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-semibold text-white">{component.name}</h3>
                              <p className="text-xs text-gray-400">{component.description}</p>
                            </div>
                            <button
                              onClick={() => handleToggleFavorite(component.id)}
                              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                              <Heart className={`h-4 w-4 ${component.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {(component.popularity / 1000).toFixed(1)}k
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {(component.downloads / 1000).toFixed(1)}k
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {component.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => handleViewComponent(component)}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyCode(component.code, component.name)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {state.viewMode === 'code' && (
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-white">{component.name}</h3>
                            <p className="text-xs text-gray-400">{component.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyCode(component.code, component.name)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <pre className="p-3 bg-slate-900 rounded-lg overflow-x-auto text-xs">
                          <code className="text-gray-300">{component.code}</code>
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAndSortedComponents.length === 0 && (
          <NoDataEmptyState entityName="components" />
        )}
      </ScrollReveal>

      {/* View Component Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{state.selectedComponent?.name}</DialogTitle>
            <DialogDescription>
              {state.selectedComponent?.description}
            </DialogDescription>
          </DialogHeader>

          {state.selectedComponent && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="rounded-lg overflow-hidden">
                  <img src={state.selectedComponent.preview}
                    alt={state.selectedComponent.name}
                    className="w-full h-auto"
                  loading="lazy" />
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (state.selectedComponent) {
                        handleCopyCode(state.selectedComponent.code, state.selectedComponent.name)
                      }
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
                <pre className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
                  <code className="text-gray-300">{state.selectedComponent?.code}</code>
                </pre>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label className="text-gray-400">Category</Label>
                    <p className="text-white capitalize">{state.selectedComponent.category.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Difficulty</Label>
                    <p className="text-white capitalize">{state.selectedComponent.difficulty}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Language</Label>
                    <p className="text-white uppercase">{state.selectedComponent.language}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Version</Label>
                    <p className="text-white">v{state.selectedComponent.version}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Popularity</Label>
                    <p className="text-white">{(state.selectedComponent.popularity / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Downloads</Label>
                    <p className="text-white">{(state.selectedComponent.downloads / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Examples</Label>
                    <p className="text-white">{state.selectedComponent.examples}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Author</Label>
                    <p className="text-white">{state.selectedComponent.author}</p>
                  </div>
                </div>

                {state.selectedComponent.tags.length > 0 && (
                  <div>
                    <Label className="text-gray-400">Tags</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {state.selectedComponent.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {state.selectedComponent.dependencies.length > 0 && (
                  <div>
                    <Label className="text-gray-400">Dependencies</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {state.selectedComponent.dependencies.map((dep, i) => (
                        <Badge key={i} variant="outline">{dep}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => state.selectedComponent && handleDownloadComponent(state.selectedComponent)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={() => state.selectedComponent && handleShareComponent(state.selectedComponent)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
