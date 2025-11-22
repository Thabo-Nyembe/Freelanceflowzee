'use client'

/**
 * A++++ AI ENHANCED PAGE - WORLD-CLASS IMPLEMENTATION
 * Enterprise-grade AI tools management with complete CRUD operations
 * Pattern: useReducer + Modals + Console Logging + Premium UI
 */

import { useState, useReducer, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Palette, MessageSquare, Clock, Target, TrendingUp,
  Zap, Star, Rocket, Users, BarChart3, CheckCircle, Sparkles,
  Plus, X, Search, Trash2, Edit, MoreVertical, Play, Settings,
  Download, Filter, Eye, Code, Cpu, Database, Globe, Lock,
  Wand2, Mic, Image, FileText, Video, Music, Tool, PenTool
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { NumberFlow } from '@/components/ui/number-flow'
import { toast } from 'sonner'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

console.log('🚀 AI ENHANCED: Component module loaded')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type AIToolType = 'text' | 'image' | 'audio' | 'video' | 'code' | 'data' | 'assistant' | 'automation'
type AIToolCategory = 'content' | 'design' | 'development' | 'analytics' | 'productivity' | 'creative'
type AIToolStatus = 'active' | 'inactive' | 'training' | 'maintenance'
type PricingTier = 'free' | 'basic' | 'pro' | 'enterprise'
type PerformanceLevel = 'excellent' | 'good' | 'fair' | 'poor'

interface AITool {
  id: string
  name: string
  type: AIToolType
  category: AIToolCategory
  description: string
  model: string
  provider: string
  status: AIToolStatus
  pricingTier: PricingTier
  performance: PerformanceLevel
  usageCount: number
  successRate: number
  avgResponseTime: number
  createdAt: string
  lastUsed: string
  features: string[]
  tags: string[]
  isPopular: boolean
  isFavorite: boolean
  version: string
}

interface AIEnhancedState {
  tools: AITool[]
  selectedTool: AITool | null
  searchTerm: string
  filterType: AIToolType | 'all'
  filterCategory: AIToolCategory | 'all'
  filterStatus: AIToolStatus | 'all'
  sortBy: 'name' | 'usage' | 'performance' | 'date' | 'successRate'
  viewMode: 'tools' | 'analytics' | 'usage' | 'settings'
  selectedTools: string[]
}

type AIEnhancedAction =
  | { type: 'SET_TOOLS'; tools: AITool[] }
  | { type: 'ADD_TOOL'; tool: AITool }
  | { type: 'UPDATE_TOOL'; tool: AITool }
  | { type: 'DELETE_TOOL'; toolId: string }
  | { type: 'SELECT_TOOL'; tool: AITool | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_TYPE'; filterType: AIToolType | 'all' }
  | { type: 'SET_FILTER_CATEGORY'; filterCategory: AIToolCategory | 'all' }
  | { type: 'SET_FILTER_STATUS'; filterStatus: AIToolStatus | 'all' }
  | { type: 'SET_SORT'; sortBy: 'name' | 'usage' | 'performance' | 'date' | 'successRate' }
  | { type: 'SET_VIEW_MODE'; viewMode: 'tools' | 'analytics' | 'usage' | 'settings' }
  | { type: 'TOGGLE_SELECT_TOOL'; toolId: string }
  | { type: 'CLEAR_SELECTED_TOOLS' }
  | { type: 'TOGGLE_FAVORITE'; toolId: string }

// ============================================================================
// REDUCER
// ============================================================================

function aiEnhancedReducer(state: AIEnhancedState, action: AIEnhancedAction): AIEnhancedState {
  console.log('🔄 AI ENHANCED REDUCER: Action:', action.type)

  switch (action.type) {
    case 'SET_TOOLS':
      console.log('📊 AI ENHANCED REDUCER: Setting tools - Count:', action.tools.length)
      return { ...state, tools: action.tools }

    case 'ADD_TOOL':
      console.log('➕ AI ENHANCED REDUCER: Adding tool - ID:', action.tool.id)
      return { ...state, tools: [action.tool, ...state.tools] }

    case 'UPDATE_TOOL':
      console.log('✏️ AI ENHANCED REDUCER: Updating tool - ID:', action.tool.id)
      return {
        ...state,
        tools: state.tools.map(t => t.id === action.tool.id ? action.tool : t),
        selectedTool: state.selectedTool?.id === action.tool.id ? action.tool : state.selectedTool
      }

    case 'DELETE_TOOL':
      console.log('🗑️ AI ENHANCED REDUCER: Deleting tool - ID:', action.toolId)
      return {
        ...state,
        tools: state.tools.filter(t => t.id !== action.toolId),
        selectedTool: state.selectedTool?.id === action.toolId ? null : state.selectedTool,
        selectedTools: state.selectedTools.filter(id => id !== action.toolId)
      }

    case 'SELECT_TOOL':
      console.log('👁️ AI ENHANCED REDUCER: Selecting tool - ID:', action.tool?.id)
      return { ...state, selectedTool: action.tool }

    case 'SET_SEARCH':
      console.log('🔍 AI ENHANCED REDUCER: Search term:', action.searchTerm)
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_TYPE':
      console.log('🏷️ AI ENHANCED REDUCER: Filter type:', action.filterType)
      return { ...state, filterType: action.filterType }

    case 'SET_FILTER_CATEGORY':
      console.log('📁 AI ENHANCED REDUCER: Filter category:', action.filterCategory)
      return { ...state, filterCategory: action.filterCategory }

    case 'SET_FILTER_STATUS':
      console.log('⚡ AI ENHANCED REDUCER: Filter status:', action.filterStatus)
      return { ...state, filterStatus: action.filterStatus }

    case 'SET_SORT':
      console.log('🔀 AI ENHANCED REDUCER: Sort by:', action.sortBy)
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      console.log('👀 AI ENHANCED REDUCER: View mode:', action.viewMode)
      return { ...state, viewMode: action.viewMode }

    case 'TOGGLE_SELECT_TOOL':
      console.log('☑️ AI ENHANCED REDUCER: Toggle select - ID:', action.toolId)
      const isSelected = state.selectedTools.includes(action.toolId)
      return {
        ...state,
        selectedTools: isSelected
          ? state.selectedTools.filter(id => id !== action.toolId)
          : [...state.selectedTools, action.toolId]
      }

    case 'CLEAR_SELECTED_TOOLS':
      console.log('🔲 AI ENHANCED REDUCER: Clearing selection')
      return { ...state, selectedTools: [] }

    case 'TOGGLE_FAVORITE':
      console.log('⭐ AI ENHANCED REDUCER: Toggle favorite - ID:', action.toolId)
      return {
        ...state,
        tools: state.tools.map(t =>
          t.id === action.toolId ? { ...t, isFavorite: !t.isFavorite } : t
        )
      }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

function generateMockAITools(): AITool[] {
  console.log('📦 AI ENHANCED: Generating mock data...')

  const types: AIToolType[] = ['text', 'image', 'audio', 'video', 'code', 'data', 'assistant', 'automation']
  const categories: AIToolCategory[] = ['content', 'design', 'development', 'analytics', 'productivity', 'creative']
  const statuses: AIToolStatus[] = ['active', 'active', 'active', 'inactive', 'training']
  const pricingTiers: PricingTier[] = ['free', 'basic', 'pro', 'enterprise']
  const performanceLevels: PerformanceLevel[] = ['excellent', 'good', 'fair']

  const toolTemplates = [
    { name: 'Content Writer Pro', type: 'text', category: 'content', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Image Generator Ultra', type: 'image', category: 'design', model: 'DALL-E 3', provider: 'OpenAI' },
    { name: 'Code Assistant', type: 'code', category: 'development', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Data Analyzer', type: 'data', category: 'analytics', model: 'Claude 3.5', provider: 'Anthropic' },
    { name: 'Voice Synthesizer', type: 'audio', category: 'creative', model: 'ElevenLabs', provider: 'ElevenLabs' },
    { name: 'Video Editor AI', type: 'video', category: 'creative', model: 'Runway Gen-2', provider: 'Runway' },
    { name: 'Smart Assistant', type: 'assistant', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Workflow Automator', type: 'automation', category: 'productivity', model: 'Custom', provider: 'Internal' },
    { name: 'SEO Optimizer', type: 'text', category: 'content', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Brand Designer', type: 'image', category: 'design', model: 'Midjourney', provider: 'Midjourney' },
    { name: 'Bug Detector', type: 'code', category: 'development', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Sentiment Analyzer', type: 'data', category: 'analytics', model: 'BERT', provider: 'Google' },
    { name: 'Podcast Creator', type: 'audio', category: 'creative', model: 'Whisper', provider: 'OpenAI' },
    { name: 'Subtitle Generator', type: 'video', category: 'content', model: 'Whisper', provider: 'OpenAI' },
    { name: 'Meeting Summarizer', type: 'assistant', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Email Responder', type: 'automation', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Blog Post Writer', type: 'text', category: 'content', model: 'Claude 3.5', provider: 'Anthropic' },
    { name: 'Logo Creator', type: 'image', category: 'design', model: 'Stable Diffusion', provider: 'Stability AI' },
    { name: 'API Generator', type: 'code', category: 'development', model: 'Codex', provider: 'OpenAI' },
    { name: 'Trend Forecaster', type: 'data', category: 'analytics', model: 'Prophet', provider: 'Facebook' },
    { name: 'Music Composer', type: 'audio', category: 'creative', model: 'Jukebox', provider: 'OpenAI' },
    { name: 'Animation Studio', type: 'video', category: 'creative', model: 'Stable Diffusion Video', provider: 'Stability AI' },
    { name: 'Research Assistant', type: 'assistant', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Task Scheduler', type: 'automation', category: 'productivity', model: 'Custom', provider: 'Internal' },
    { name: 'Social Media Manager', type: 'text', category: 'content', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Photo Enhancer', type: 'image', category: 'design', model: 'Topaz Labs', provider: 'Topaz' },
    { name: 'Code Reviewer', type: 'code', category: 'development', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Customer Insights', type: 'data', category: 'analytics', model: 'Custom ML', provider: 'Internal' },
    { name: 'Voiceover Generator', type: 'audio', category: 'creative', model: 'Play.ht', provider: 'Play.ht' },
    { name: 'Video Summarizer', type: 'video', category: 'content', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Project Planner', type: 'assistant', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Report Generator', type: 'automation', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Copywriter AI', type: 'text', category: 'content', model: 'Jasper', provider: 'Jasper' },
    { name: 'UI Designer', type: 'image', category: 'design', model: 'Uizard', provider: 'Uizard' },
    { name: 'Test Generator', type: 'code', category: 'development', model: 'GitHub Copilot', provider: 'GitHub' },
    { name: 'Performance Monitor', type: 'data', category: 'analytics', model: 'Custom', provider: 'Internal' },
    { name: 'Sound Effects Creator', type: 'audio', category: 'creative', model: 'AudioCraft', provider: 'Meta' },
    { name: 'Thumbnail Maker', type: 'video', category: 'design', model: 'DALL-E 3', provider: 'OpenAI' },
    { name: 'Brainstorm Partner', type: 'assistant', category: 'productivity', model: 'Claude 3.5', provider: 'Anthropic' },
    { name: 'Invoice Processor', type: 'automation', category: 'productivity', model: 'Custom OCR', provider: 'Internal' }
  ]

  const tools: AITool[] = toolTemplates.map((template, index) => {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomPricing = pricingTiers[Math.floor(Math.random() * pricingTiers.length)]
    const randomPerformance = performanceLevels[Math.floor(Math.random() * performanceLevels.length)]

    return {
      id: `AI-${String(index + 1).padStart(3, '0')}`,
      name: template.name,
      type: template.type as AIToolType,
      category: template.category as AIToolCategory,
      description: `Advanced AI-powered ${template.type} tool for ${template.category} tasks using ${template.model}`,
      model: template.model,
      provider: template.provider,
      status: randomStatus,
      pricingTier: randomPricing,
      performance: randomPerformance,
      usageCount: Math.floor(Math.random() * 10000) + 100,
      successRate: 0.85 + Math.random() * 0.14,
      avgResponseTime: Math.random() * 3 + 0.5,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      features: [
        'Real-time processing',
        'Batch operations',
        'API integration',
        'Custom templates',
        'Version control'
      ].slice(0, Math.floor(Math.random() * 3) + 2),
      tags: ['AI', 'ML', 'Automated', 'Enterprise', 'Cloud'].slice(0, Math.floor(Math.random() * 3) + 1),
      isPopular: Math.random() > 0.7,
      isFavorite: Math.random() > 0.8,
      version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
    }
  })

  console.log('✅ AI ENHANCED: Generated', tools.length, 'AI tools')
  return tools
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getToolIcon(type: AIToolType) {
  const icons: Record<AIToolType, any> = {
    text: FileText,
    image: Image,
    audio: Music,
    video: Video,
    code: Code,
    data: Database,
    assistant: Brain,
    automation: Zap
  }
  return icons[type] || Wand2
}

function getStatusColor(status: AIToolStatus): string {
  const colors: Record<AIToolStatus, string> = {
    active: 'green',
    inactive: 'gray',
    training: 'yellow',
    maintenance: 'orange'
  }
  return colors[status] || 'gray'
}

function getPerformanceColor(performance: PerformanceLevel): string {
  const colors: Record<PerformanceLevel, string> = {
    excellent: 'green',
    good: 'blue',
    fair: 'yellow',
    poor: 'red'
  }
  return colors[performance] || 'gray'
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatTime(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`
  return `${seconds.toFixed(2)}s`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AIEnhancedPage() {
  console.log('🚀 AI ENHANCED: Component mounting...')

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // REDUCER STATE
  const [state, dispatch] = useReducer(aiEnhancedReducer, {
    tools: [],
    selectedTool: null,
    searchTerm: '',
    filterType: 'all',
    filterCategory: 'all',
    filterStatus: 'all',
    sortBy: 'usage',
    viewMode: 'tools',
    selectedTools: []
  })

  // MODAL STATES
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // FORM STATES
  const [toolName, setToolName] = useState('')
  const [toolType, setToolType] = useState<AIToolType>('text')
  const [toolCategory, setToolCategory] = useState<AIToolCategory>('content')
  const [toolDescription, setToolDescription] = useState('')
  const [toolModel, setToolModel] = useState('')
  const [toolProvider, setToolProvider] = useState('')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json')

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    console.log('🔄 AI ENHANCED: Loading data...')
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockTools = generateMockAITools()
        dispatch({ type: 'SET_TOOLS', tools: mockTools })

        setIsLoading(false)
        announce('AI tools loaded successfully', 'polite')
        console.log('✅ AI ENHANCED: Data loaded successfully')
      } catch (err) {
        console.error('❌ AI ENHANCED: Load error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load AI tools')
        setIsLoading(false)
        announce('Error loading AI tools', 'assertive')
      }
    }

    loadData()
  }, [announce])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    console.log('📊 AI ENHANCED: Computing stats...')
    const total = state.tools.length
    const active = state.tools.filter(t => t.status === 'active').length
    const popular = state.tools.filter(t => t.isPopular).length
    const favorites = state.tools.filter(t => t.isFavorite).length
    const totalUsage = state.tools.reduce((sum, t) => sum + t.usageCount, 0)
    const avgSuccessRate = state.tools.reduce((sum, t) => sum + t.successRate, 0) / total

    const result = {
      total,
      active,
      popular,
      favorites,
      totalUsage,
      avgSuccessRate: (avgSuccessRate * 100).toFixed(1)
    }

    console.log('📊 AI ENHANCED: Stats -', JSON.stringify(result))
    return result
  }, [state.tools])

  const filteredAndSortedTools = useMemo(() => {
    console.log('🔍 AI ENHANCED: Filtering and sorting...')
    console.log('🔍 AI ENHANCED: Search term:', state.searchTerm)
    console.log('🔍 AI ENHANCED: Filter type:', state.filterType)
    console.log('🔍 AI ENHANCED: Filter category:', state.filterCategory)
    console.log('🔍 AI ENHANCED: Filter status:', state.filterStatus)
    console.log('🔀 AI ENHANCED: Sort by:', state.sortBy)

    let filtered = state.tools

    // Search
    if (state.searchTerm) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        tool.model.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()))
      )
      console.log('🔍 AI ENHANCED: Search filtered to', filtered.length, 'tools')
    }

    // Filter by type
    if (state.filterType !== 'all') {
      filtered = filtered.filter(tool => tool.type === state.filterType)
      console.log('🏷️ AI ENHANCED: Type filtered to', filtered.length, 'tools')
    }

    // Filter by category
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === state.filterCategory)
      console.log('📁 AI ENHANCED: Category filtered to', filtered.length, 'tools')
    }

    // Filter by status
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(tool => tool.status === state.filterStatus)
      console.log('⚡ AI ENHANCED: Status filtered to', filtered.length, 'tools')
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'usage':
          return b.usageCount - a.usageCount
        case 'performance':
          const performanceOrder = { excellent: 4, good: 3, fair: 2, poor: 1 }
          return performanceOrder[b.performance] - performanceOrder[a.performance]
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'successRate':
          return b.successRate - a.successRate
        default:
          return 0
      }
    })

    console.log('✅ AI ENHANCED: Final result:', sorted.length, 'tools')
    return sorted
  }, [state.tools, state.searchTerm, state.filterType, state.filterCategory, state.filterStatus, state.sortBy])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateTool = async () => {
    console.log('➕ AI ENHANCED: Creating tool...')
    console.log('📝 AI ENHANCED: Name:', toolName)
    console.log('📝 AI ENHANCED: Type:', toolType)
    console.log('📝 AI ENHANCED: Category:', toolCategory)

    if (!toolName || !toolDescription || !toolModel || !toolProvider) {
      console.warn('⚠️ AI ENHANCED: Missing required fields')
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)

      await new Promise(resolve => setTimeout(resolve, 1000))

      const newTool: AITool = {
        id: `AI-${String(state.tools.length + 1).padStart(3, '0')}`,
        name: toolName,
        type: toolType,
        category: toolCategory,
        description: toolDescription,
        model: toolModel,
        provider: toolProvider,
        status: 'active',
        pricingTier: 'free',
        performance: 'good',
        usageCount: 0,
        successRate: 0.92,
        avgResponseTime: 1.5,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        features: ['Real-time processing', 'API integration', 'Custom templates'],
        tags: ['AI', 'Custom'],
        isPopular: false,
        isFavorite: false,
        version: '1.0.0'
      }

      dispatch({ type: 'ADD_TOOL', tool: newTool })

      toast.success('AI tool created successfully')
      console.log('✅ AI ENHANCED: Tool created - ID:', newTool.id)

      setShowCreateModal(false)
      setToolName('')
      setToolDescription('')
      setToolModel('')
      setToolProvider('')
    } catch (error) {
      console.error('❌ AI ENHANCED: Create error:', error)
      toast.error('Failed to create AI tool')
    } finally {
      setIsSaving(false)
    }
  }

  const handleViewTool = (tool: AITool) => {
    console.log('👁️ AI ENHANCED: Opening tool view - ID:', tool.id, 'Name:', tool.name)
    dispatch({ type: 'SELECT_TOOL', tool })
    setShowViewModal(true)
  }

  const handleDeleteTool = async (toolId: string) => {
    console.log('🗑️ AI ENHANCED: Deleting tool - ID:', toolId)

    try {
      setIsSaving(true)

      await new Promise(resolve => setTimeout(resolve, 500))

      dispatch({ type: 'DELETE_TOOL', toolId })

      toast.success('AI tool deleted successfully')
      console.log('✅ AI ENHANCED: Tool deleted')

      setShowDeleteModal(false)
      setShowViewModal(false)
    } catch (error) {
      console.error('❌ AI ENHANCED: Delete error:', error)
      toast.error('Failed to delete AI tool')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkDelete = async () => {
    console.log('🗑️ AI ENHANCED: Bulk delete - Count:', state.selectedTools.length)
    console.log('🗑️ AI ENHANCED: IDs:', state.selectedTools)

    try {
      setIsSaving(true)

      await new Promise(resolve => setTimeout(resolve, 1000))

      state.selectedTools.forEach(id => {
        dispatch({ type: 'DELETE_TOOL', toolId: id })
      })

      toast.success(`Deleted ${state.selectedTools.length} tool(s)`)
      console.log('✅ AI ENHANCED: Bulk delete complete')

      dispatch({ type: 'CLEAR_SELECTED_TOOLS' })
    } catch (error) {
      console.error('❌ AI ENHANCED: Bulk delete error:', error)
      toast.error('Failed to delete tools')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleFavorite = (toolId: string) => {
    console.log('⭐ AI ENHANCED: Toggling favorite - ID:', toolId)
    dispatch({ type: 'TOGGLE_FAVORITE', toolId })
    toast.success('Favorite updated')
  }

  const handleRunTool = async (toolId: string) => {
    console.log('▶️ AI ENHANCED: Running tool - ID:', toolId)
    const tool = state.tools.find(t => t.id === toolId)

    if (tool) {
      toast.info(`Running ${tool.name}...`)
      console.log('🚀 AI ENHANCED: Tool execution started')

      await new Promise(resolve => setTimeout(resolve, 2000))

      const updatedTool = {
        ...tool,
        usageCount: tool.usageCount + 1,
        lastUsed: new Date().toISOString()
      }

      dispatch({ type: 'UPDATE_TOOL', tool: updatedTool })
      toast.success(`${tool.name} completed successfully`)
      console.log('✅ AI ENHANCED: Tool execution complete')
    }
  }

  const handleExport = async () => {
    console.log('📤 AI ENHANCED: Exporting data...')
    console.log('📄 AI ENHANCED: Format:', exportFormat)
    console.log('📊 AI ENHANCED: Count:', filteredAndSortedTools.length, 'tools')

    try {
      setIsSaving(true)

      await new Promise(resolve => setTimeout(resolve, 1500))

      const dataStr = JSON.stringify(filteredAndSortedTools, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-tools-${new Date().toISOString().split('T')[0]}.${exportFormat}`
      link.click()

      toast.success(`Exported ${filteredAndSortedTools.length} tools as ${exportFormat.toUpperCase()}`)
      console.log('✅ AI ENHANCED: Export complete')

      setShowExportModal(false)
    } catch (error) {
      console.error('❌ AI ENHANCED: Export error:', error)
      toast.error('Failed to export tools')
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    console.log('⏳ AI ENHANCED: Rendering loading state')
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              <CardSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
              <ListSkeleton items={5} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    console.log('❌ AI ENHANCED: Rendering error state')
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="container mx-auto px-4 py-12 relative z-10">
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

  console.log('🎨 AI ENHANCED: Rendering main view')

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-sm font-medium mb-6 border border-blue-500/30"
              >
                <Sparkles className="w-4 h-4" />
                AI Enhanced
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Wand2 className="w-3 h-3 mr-1" />
                  Powered by AI
                </Badge>
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                AI Enhanced Tools
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Next-generation AI tools for content creation, design, development, and automation
              </p>
            </div>
          </ScrollReveal>

          {/* Stats Cards */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <Wand2 className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Total Tools</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  <NumberFlow value={stats.total} />
                </p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">Active</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  <NumberFlow value={stats.active} />
                </p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <Rocket className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Popular</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  <NumberFlow value={stats.popular} />
                </p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-400">Favorites</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  <NumberFlow value={stats.favorites} />
                </p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-gray-400">Total Usage</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.totalUsage)}</p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-gray-400">Success Rate</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.avgSuccessRate}%</p>
              </LiquidGlassCard>
            </div>
          </ScrollReveal>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search AI tools..."
                  value={state.searchTerm}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                  className="pl-10 bg-slate-900/50 border-gray-700"
                />
              </div>
            </div>

            {/* Filters */}
            <Select value={state.filterType} onValueChange={(value: any) => dispatch({ type: 'SET_FILTER_TYPE', filterType: value })}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-gray-700">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={state.filterCategory} onValueChange={(value: any) => dispatch({ type: 'SET_FILTER_CATEGORY', filterCategory: value })}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-gray-700">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>

            <Select value={state.sortBy} onValueChange={(value: any) => dispatch({ type: 'SET_SORT', sortBy: value })}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="successRate">Success Rate</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Tool
            </Button>

            <Button variant="outline" onClick={() => setShowExportModal(true)} className="border-gray-700 hover:bg-slate-800">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Bulk Actions */}
          {state.selectedTools.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={state.selectedTools.length === filteredAndSortedTools.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      filteredAndSortedTools.forEach(tool => {
                        if (!state.selectedTools.includes(tool.id)) {
                          dispatch({ type: 'TOGGLE_SELECT_TOOL', toolId: tool.id })
                        }
                      })
                    } else {
                      dispatch({ type: 'CLEAR_SELECTED_TOOLS' })
                    }
                  }}
                />
                <span className="text-sm text-white">
                  {state.selectedTools.length} tool{state.selectedTools.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isSaving}
                  className="border-gray-700 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'CLEAR_SELECTED_TOOLS' })}
                  className="border-gray-700 hover:bg-slate-800"
                >
                  Clear Selection
                </Button>
              </div>
            </motion.div>
          )}

          {/* Tools Grid */}
          {filteredAndSortedTools.length === 0 ? (
            <NoDataEmptyState
              title="No AI tools found"
              description="Try adjusting your filters or create a new AI tool"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedTools.map((tool, index) => {
                const Icon = getToolIcon(tool.type)
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <LiquidGlassCard className="p-6 hover:border-blue-500/50 transition-colors">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={state.selectedTools.includes(tool.id)}
                              onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECT_TOOL', toolId: tool.id })}
                            />
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0`}>
                              <Icon className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white line-clamp-1">{tool.name}</h3>
                                {tool.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                                {tool.isPopular && <TrendingUp className="w-4 h-4 text-green-400" />}
                              </div>
                              <p className="text-sm text-gray-400 line-clamp-2">{tool.description}</p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-gray-700">
                              <DropdownMenuItem onClick={() => handleRunTool(tool.id)}>
                                <Play className="w-4 h-4 mr-2" />
                                Run Tool
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewTool(tool)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFavorite(tool.id)}>
                                <Star className="w-4 h-4 mr-2" />
                                {tool.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  dispatch({ type: 'SELECT_TOOL', tool })
                                  setShowDeleteModal(true)
                                }}
                                className="text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`bg-${getStatusColor(tool.status)}-500/20 text-${getStatusColor(tool.status)}-300 border-${getStatusColor(tool.status)}-500/30 text-xs`}>
                            {tool.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {tool.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-gray-700">
                            {tool.category}
                          </Badge>
                          <Badge className={`bg-${getPerformanceColor(tool.performance)}-500/20 text-${getPerformanceColor(tool.performance)}-300 border-${getPerformanceColor(tool.performance)}-500/30 text-xs`}>
                            {tool.performance}
                          </Badge>
                        </div>

                        {/* Model Info */}
                        <div className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                            <Cpu className="w-3 h-3" />
                            <span>{tool.model}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Globe className="w-3 h-3" />
                            <span>{tool.provider}</span>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-700">
                          <div>
                            <p className="text-xs text-gray-400">Usage</p>
                            <p className="text-sm font-semibold text-white">{formatNumber(tool.usageCount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Success</p>
                            <p className="text-sm font-semibold text-white">{(tool.successRate * 100).toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Speed</p>
                            <p className="text-sm font-semibold text-white">{formatTime(tool.avgResponseTime)}</p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex items-center gap-1">
                          {tool.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-gray-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="max-w-2xl bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Plus className="w-5 h-5 text-blue-400" />
                  Create New AI Tool
                </DialogTitle>
                <DialogDescription>
                  Add a new AI-powered tool to your toolkit
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name" className="text-white">Tool Name *</Label>
                  <Input
                    id="name"
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    placeholder="Tool name..."
                    className="bg-slate-800 border-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-white">Type *</Label>
                    <Select value={toolType} onValueChange={(value: AIToolType) => setToolType(value)}>
                      <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                        <SelectItem value="data">Data</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="automation">Automation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white">Category *</Label>
                    <Select value={toolCategory} onValueChange={(value: AIToolCategory) => setToolCategory(value)}>
                      <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Description *</Label>
                  <Textarea
                    id="description"
                    value={toolDescription}
                    onChange={(e) => setToolDescription(e.target.value)}
                    placeholder="Describe what this tool does..."
                    rows={4}
                    className="bg-slate-800 border-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="model" className="text-white">AI Model *</Label>
                    <Input
                      id="model"
                      value={toolModel}
                      onChange={(e) => setToolModel(e.target.value)}
                      placeholder="e.g., GPT-4o"
                      className="bg-slate-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="provider" className="text-white">Provider *</Label>
                    <Input
                      id="provider"
                      value={toolProvider}
                      onChange={(e) => setToolProvider(e.target.value)}
                      placeholder="e.g., OpenAI"
                      className="bg-slate-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="border-gray-700">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTool}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSaving ? 'Creating...' : 'Create Tool'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {showViewModal && state.selectedTool && (
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  {(() => {
                    const Icon = getToolIcon(state.selectedTool.type)
                    return <Icon className="w-5 h-5 text-blue-400" />
                  })()}
                  {state.selectedTool.name}
                </DialogTitle>
                <DialogDescription>
                  AI tool details #{state.selectedTool.id}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                    <p className="text-white">{state.selectedTool.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Type</h4>
                      <Badge>{state.selectedTool.type}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Category</h4>
                      <Badge variant="outline">{state.selectedTool.category}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <p className="text-sm text-gray-400">AI Model</p>
                      <p className="text-white font-semibold">{state.selectedTool.model}</p>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <p className="text-sm text-gray-400">Provider</p>
                      <p className="text-white font-semibold">{state.selectedTool.provider}</p>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <p className="text-sm text-gray-400">Version</p>
                      <p className="text-white font-semibold">{state.selectedTool.version}</p>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <p className="text-sm text-gray-400">Pricing</p>
                      <p className="text-white font-semibold capitalize">{state.selectedTool.pricingTier}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {state.selectedTool.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <p className="text-sm text-gray-400">Total Usage</p>
                      <p className="text-2xl font-bold text-white">{formatNumber(state.selectedTool.usageCount)}</p>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <p className="text-sm text-gray-400">Success Rate</p>
                      <p className="text-2xl font-bold text-white">{(state.selectedTool.successRate * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <p className="text-sm text-gray-400">Avg Response Time</p>
                      <p className="text-2xl font-bold text-white">{formatTime(state.selectedTool.avgResponseTime)}</p>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <p className="text-sm text-gray-400">Performance</p>
                      <Badge className={`bg-${getPerformanceColor(state.selectedTool.performance)}-500/20 text-${getPerformanceColor(state.selectedTool.performance)}-300 capitalize`}>
                        {state.selectedTool.performance}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Last Used</h4>
                    <p className="text-white">{new Date(state.selectedTool.lastUsed).toLocaleString()}</p>
                  </div>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="space-y-4 pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Available Features</h4>
                    <div className="space-y-3">
                      {state.selectedTool.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <p className="text-white">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false)
                    setShowDeleteModal(true)
                  }}
                  className="border-gray-700 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  onClick={() => {
                    handleRunTool(state.selectedTool!.id)
                    setShowViewModal(false)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Tool
                </Button>
                <Button variant="outline" onClick={() => setShowViewModal(false)} className="border-gray-700">
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* EXPORT MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
            <DialogContent className="bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Download className="w-5 h-5 text-blue-400" />
                  Export AI Tools
                </DialogTitle>
                <DialogDescription>
                  Download {filteredAndSortedTools.length} tool(s) in your preferred format
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="format" className="text-white">Export Format</Label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-sm text-gray-400">Export will include:</p>
                  <ul className="mt-2 space-y-1 text-sm text-white">
                    <li>• {filteredAndSortedTools.length} AI tools</li>
                    <li>• All metadata and metrics</li>
                    <li>• Performance data</li>
                    <li>• Usage statistics</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExportModal(false)} className="border-gray-700">
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSaving ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {showDeleteModal && state.selectedTool && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Delete AI Tool
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this tool? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-white font-medium">{state.selectedTool.name}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: {state.selectedTool.id}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-gray-700">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteTool(state.selectedTool!.id)}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSaving ? 'Deleting...' : 'Delete Tool'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
