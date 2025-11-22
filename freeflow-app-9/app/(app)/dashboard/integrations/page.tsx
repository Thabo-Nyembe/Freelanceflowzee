'use client'

import { useState, useEffect, useReducer, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Plug, Zap, Check, X, Settings, Play, Pause, RefreshCw,
  Search, Filter, AlertCircle, CheckCircle, Clock, Shield,
  Database, Cloud, Mail, MessageSquare, CreditCard, BarChart,
  Folder, Code, Users, Lock, Unlock, Eye, Trash2, Edit,
  Plus, Download, Upload, Share2, Link, ExternalLink, Star
} from 'lucide-react'
import { NumberFlow } from '@/components/ui/number-flow'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// ============================================================================
// FRAMER MOTION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'green' }: { delay?: number; color?: string }) => {
  console.log('🎨 INTEGRATIONS: FloatingParticle rendered with color:', color, 'delay:', delay)
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

const PulsingDot = ({ color = 'green' }: { color?: string }) => {
  return (
    <motion.div
      className={`w-2 h-2 bg-${color}-500 rounded-full`}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

type IntegrationCategory = 'payment' | 'communication' | 'productivity' | 'analytics' | 'storage' | 'marketing' | 'crm' | 'development'
type IntegrationStatus = 'available' | 'connected' | 'disconnected' | 'error'

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  category: IntegrationCategory
  status: IntegrationStatus
  isPremium: boolean
  isPopular: boolean
  authType: 'oauth' | 'api-key' | 'basic'
  connectedAt?: string
  lastSync?: string
  totalSyncs: number
  successRate: number
  dataTransferred: number
  features: string[]
  setupDifficulty: 'easy' | 'medium' | 'hard'
  documentation: string
}

interface IntegrationsState {
  integrations: Integration[]
  selectedIntegration: Integration | null
  searchTerm: string
  filterCategory: IntegrationCategory | 'all'
  filterStatus: IntegrationStatus | 'all'
  sortBy: 'name' | 'popularity' | 'category' | 'status'
  selectedIntegrations: string[]
  viewMode: 'overview' | 'browse' | 'connected' | 'templates'
}

type IntegrationsAction =
  | { type: 'SET_INTEGRATIONS'; integrations: Integration[] }
  | { type: 'UPDATE_INTEGRATION'; integration: Integration }
  | { type: 'SELECT_INTEGRATION'; integration: Integration | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_CATEGORY'; filterCategory: IntegrationsState['filterCategory'] }
  | { type: 'SET_FILTER_STATUS'; filterStatus: IntegrationsState['filterStatus'] }
  | { type: 'SET_SORT'; sortBy: IntegrationsState['sortBy'] }
  | { type: 'TOGGLE_SELECT_INTEGRATION'; integrationId: string }
  | { type: 'CLEAR_SELECTED_INTEGRATIONS' }
  | { type: 'SET_VIEW_MODE'; viewMode: IntegrationsState['viewMode'] }
  | { type: 'CONNECT_INTEGRATION'; integrationId: string }
  | { type: 'DISCONNECT_INTEGRATION'; integrationId: string }

// ============================================================================
// REDUCER
// ============================================================================

function integrationsReducer(state: IntegrationsState, action: IntegrationsAction): IntegrationsState {
  console.log('🔄 INTEGRATIONS REDUCER: Action:', action.type)

  switch (action.type) {
    case 'SET_INTEGRATIONS':
      console.log('✅ INTEGRATIONS: Set integrations -', action.integrations.length, 'integrations loaded')
      return { ...state, integrations: action.integrations }

    case 'UPDATE_INTEGRATION':
      console.log('✅ INTEGRATIONS: Update integration - ID:', action.integration.id)
      return {
        ...state,
        integrations: state.integrations.map(i => i.id === action.integration.id ? action.integration : i)
      }

    case 'SELECT_INTEGRATION':
      console.log('👁️ INTEGRATIONS: Select integration -', action.integration?.name || 'None')
      return { ...state, selectedIntegration: action.integration }

    case 'SET_SEARCH':
      console.log('🔍 INTEGRATIONS: Search term changed:', action.searchTerm)
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_CATEGORY':
      console.log('🔎 INTEGRATIONS: Filter category changed:', action.filterCategory)
      return { ...state, filterCategory: action.filterCategory }

    case 'SET_FILTER_STATUS':
      console.log('🔎 INTEGRATIONS: Filter status changed:', action.filterStatus)
      return { ...state, filterStatus: action.filterStatus }

    case 'SET_SORT':
      console.log('🔀 INTEGRATIONS: Sort changed:', action.sortBy)
      return { ...state, sortBy: action.sortBy }

    case 'TOGGLE_SELECT_INTEGRATION':
      const isSelected = state.selectedIntegrations.includes(action.integrationId)
      console.log(isSelected ? '❌ INTEGRATIONS: Deselect' : '✅ INTEGRATIONS: Select', '- ID:', action.integrationId)
      return {
        ...state,
        selectedIntegrations: isSelected
          ? state.selectedIntegrations.filter(id => id !== action.integrationId)
          : [...state.selectedIntegrations, action.integrationId]
      }

    case 'CLEAR_SELECTED_INTEGRATIONS':
      console.log('🔄 INTEGRATIONS: Clear all selected')
      return { ...state, selectedIntegrations: [] }

    case 'SET_VIEW_MODE':
      console.log('👁️ INTEGRATIONS: View mode changed:', action.viewMode)
      return { ...state, viewMode: action.viewMode }

    case 'CONNECT_INTEGRATION':
      console.log('🔗 INTEGRATIONS: Connecting integration - ID:', action.integrationId)
      return {
        ...state,
        integrations: state.integrations.map(i =>
          i.id === action.integrationId
            ? { ...i, status: 'connected' as IntegrationStatus, connectedAt: new Date().toISOString() }
            : i
        )
      }

    case 'DISCONNECT_INTEGRATION':
      console.log('🔌 INTEGRATIONS: Disconnecting integration - ID:', action.integrationId)
      return {
        ...state,
        integrations: state.integrations.map(i =>
          i.id === action.integrationId
            ? { ...i, status: 'available' as IntegrationStatus, connectedAt: undefined }
            : i
        )
      }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockIntegrations = (): Integration[] => {
  console.log('🔌 INTEGRATIONS: Generating mock integration data...')

  const categories: IntegrationCategory[] = ['payment', 'communication', 'productivity', 'analytics', 'storage', 'marketing', 'crm', 'development']
  const authTypes: Array<Integration['authType']> = ['oauth', 'api-key', 'basic']
  const difficulties: Array<Integration['setupDifficulty']> = ['easy', 'medium', 'hard']

  const integrationNames = {
    payment: ['Stripe', 'PayPal', 'Square', 'Braintree', 'Adyen', 'Razorpay', 'Mollie', 'Paddle'],
    communication: ['Slack', 'Discord', 'Telegram', 'WhatsApp', 'Twilio', 'SendGrid', 'Mailchimp', 'Zoom'],
    productivity: ['Notion', 'Trello', 'Asana', 'Monday.com', 'ClickUp', 'Airtable', 'Todoist', 'Evernote'],
    analytics: ['Google Analytics', 'Mixpanel', 'Amplitude', 'Segment', 'Hotjar', 'Heap', 'PostHog', 'Plausible'],
    storage: ['Dropbox', 'Google Drive', 'OneDrive', 'Box', 'AWS S3', 'Backblaze', 'pCloud', 'Sync.com'],
    marketing: ['HubSpot', 'Salesforce', 'ActiveCampaign', 'Marketo', 'Intercom', 'Drift', 'Pardot', 'Mailjet'],
    crm: ['Salesforce CRM', 'HubSpot CRM', 'Pipedrive', 'Zoho CRM', 'Copper', 'Freshsales', 'Insightly', 'Nimble'],
    development: ['GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Linear', 'Sentry', 'Vercel', 'Netlify']
  }

  const icons = {
    payment: '💳',
    communication: '💬',
    productivity: '📋',
    analytics: '📊',
    storage: '☁️',
    marketing: '📢',
    crm: '👥',
    development: '💻'
  }

  const integrations: Integration[] = []
  let id = 1

  categories.forEach(category => {
    integrationNames[category].forEach(name => {
      const isConnected = Math.random() > 0.7
      integrations.push({
        id: `INT-${String(id++).padStart(3, '0')}`,
        name,
        description: `Connect ${name} to sync data and automate workflows`,
        icon: icons[category],
        category,
        status: isConnected ? 'connected' : 'available',
        isPremium: Math.random() > 0.7,
        isPopular: Math.random() > 0.6,
        authType: authTypes[Math.floor(Math.random() * authTypes.length)],
        connectedAt: isConnected ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        lastSync: isConnected ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
        totalSyncs: isConnected ? Math.floor(Math.random() * 1000) + 10 : 0,
        successRate: isConnected ? 90 + Math.random() * 10 : 0,
        dataTransferred: isConnected ? Math.floor(Math.random() * 1000000000) : 0,
        features: ['Real-time sync', 'Webhooks', 'API access', 'Custom fields'],
        setupDifficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        documentation: `https://docs.${name.toLowerCase().replace(/\s+/g, '')}.com`
      })
    })
  })

  console.log('✅ INTEGRATIONS: Generated', integrations.length, 'mock integrations')
  return integrations
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function IntegrationsPage() {
  console.log('🚀 INTEGRATIONS: Component mounting...')

  // A+++ ANNOUNCER
  const { announce } = useAnnouncer()

  // REDUCER STATE
  const [state, dispatch] = useReducer(integrationsReducer, {
    integrations: [],
    selectedIntegration: null,
    searchTerm: '',
    filterCategory: 'all',
    filterStatus: 'all',
    sortBy: 'name',
    selectedIntegrations: [],
    viewMode: 'overview'
  })

  // LOCAL STATE
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // MODAL STATES
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false)

  // FORM DATA
  const [apiKey, setApiKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [configNotes, setConfigNotes] = useState('')

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    const loadIntegrationsData = async () => {
      console.log('🔄 INTEGRATIONS: Loading integrations data...')
      try {
        setIsLoading(true)
        setError(null)

        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.98) {
              reject(new Error('Failed to load integrations'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        const mockIntegrations = generateMockIntegrations()
        dispatch({ type: 'SET_INTEGRATIONS', integrations: mockIntegrations })

        setIsLoading(false)
        announce('Integrations loaded successfully', 'polite')
        console.log('✅ INTEGRATIONS: Data loaded successfully')
      } catch (err) {
        console.error('❌ INTEGRATIONS: Load error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load integrations')
        setIsLoading(false)
        announce('Error loading integrations', 'assertive')
      }
    }

    loadIntegrationsData()
  }, [announce])

  // ============================================================================
  // COMPUTED STATS
  // ============================================================================

  const stats = useMemo(() => {
    const s = {
      total: state.integrations.length,
      connected: state.integrations.filter(i => i.status === 'connected').length,
      available: state.integrations.filter(i => i.status === 'available').length,
      totalSyncs: state.integrations.reduce((sum, i) => sum + i.totalSyncs, 0),
      avgSuccessRate: state.integrations.filter(i => i.status === 'connected').length > 0
        ? state.integrations.filter(i => i.status === 'connected').reduce((sum, i) => sum + i.successRate, 0) / state.integrations.filter(i => i.status === 'connected').length
        : 0,
      totalDataTransferred: state.integrations.reduce((sum, i) => sum + i.dataTransferred, 0)
    }
    console.log('📊 INTEGRATIONS: Stats calculated -', JSON.stringify(s))
    return s
  }, [state.integrations])

  // ============================================================================
  // FILTERING AND SORTING
  // ============================================================================

  const filteredAndSortedIntegrations = useMemo(() => {
    console.log('🔍 INTEGRATIONS: Filtering and sorting...')
    console.log('📋 INTEGRATIONS: Search term:', state.searchTerm)
    console.log('🔎 INTEGRATIONS: Filter category:', state.filterCategory)
    console.log('🔎 INTEGRATIONS: Filter status:', state.filterStatus)
    console.log('🔀 INTEGRATIONS: Sort by:', state.sortBy)

    let filtered = state.integrations

    // Filter by search
    if (state.searchTerm) {
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(state.searchTerm.toLowerCase())
      )
      console.log('🔍 INTEGRATIONS: Search filtered to', filtered.length, 'integrations')
    }

    // Filter by category
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(i => i.category === state.filterCategory)
      console.log('🔎 INTEGRATIONS: Category filtered to', filtered.length, 'integrations')
    }

    // Filter by status
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(i => i.status === state.filterStatus)
      console.log('🔎 INTEGRATIONS: Status filtered to', filtered.length, 'integrations')
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'popularity':
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    console.log('✅ INTEGRATIONS: Filtered and sorted to', sorted.length, 'integrations')
    return sorted
  }, [state.integrations, state.searchTerm, state.filterCategory, state.filterStatus, state.sortBy])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleConnectIntegration = async () => {
    if (!state.selectedIntegration) {
      console.log('⚠️ INTEGRATIONS: No integration selected for connection')
      return
    }

    if (!apiKey) {
      console.log('⚠️ INTEGRATIONS: API key required')
      toast.error('API key required')
      return
    }

    console.log('🔗 INTEGRATIONS: Connecting integration:', state.selectedIntegration.name)
    console.log('🔑 INTEGRATIONS: API key:', apiKey.substring(0, 5) + '...')

    try {
      setIsSaving(true)

      await new Promise(resolve => setTimeout(resolve, 1500))

      dispatch({ type: 'CONNECT_INTEGRATION', integrationId: state.selectedIntegration.id })
      setIsConnectModalOpen(false)
      setApiKey('')
      console.log('✅ INTEGRATIONS: Integration connected successfully')

      toast.success(`${state.selectedIntegration.name} connected`, {
        description: 'Integration is now active and syncing'
      })
    } catch (error) {
      console.error('❌ INTEGRATIONS: Connection error:', error)
      toast.error('Failed to connect integration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisconnectIntegration = async () => {
    if (!state.selectedIntegration) {
      console.log('⚠️ INTEGRATIONS: No integration selected for disconnection')
      return
    }

    console.log('🔌 INTEGRATIONS: Disconnecting integration:', state.selectedIntegration.name)

    try {
      setIsSaving(true)

      await new Promise(resolve => setTimeout(resolve, 1000))

      dispatch({ type: 'DISCONNECT_INTEGRATION', integrationId: state.selectedIntegration.id })
      setIsDisconnectModalOpen(false)
      console.log('✅ INTEGRATIONS: Integration disconnected successfully')

      toast.success(`${state.selectedIntegration.name} disconnected`)
    } catch (error) {
      console.error('❌ INTEGRATIONS: Disconnection error:', error)
      toast.error('Failed to disconnect integration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!state.selectedIntegration) return

    console.log('🧪 INTEGRATIONS: Testing connection for:', state.selectedIntegration.name)

    try {
      setIsSaving(true)

      await new Promise(resolve => setTimeout(resolve, 2000))

      const success = Math.random() > 0.2
      console.log(success ? '✅ INTEGRATIONS: Connection test successful' : '❌ INTEGRATIONS: Connection test failed')

      toast[success ? 'success' : 'error'](
        success ? 'Connection test successful' : 'Connection test failed',
        { description: success ? 'Integration is working correctly' : 'Please check your configuration' }
      )
    } catch (error) {
      console.error('❌ INTEGRATIONS: Test error:', error)
      toast.error('Failed to test connection')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDataSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoryIcon = (category: IntegrationCategory) => {
    const icons = {
      payment: CreditCard,
      communication: MessageSquare,
      productivity: CheckCircle,
      analytics: BarChart,
      storage: Database,
      marketing: BarChart,
      crm: Users,
      development: Code
    }
    return icons[category]
  }

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return 'text-green-500'
      case 'available': return 'text-gray-500'
      case 'disconnected': return 'text-orange-500'
      case 'error': return 'text-red-500'
    }
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    console.log('⏳ INTEGRATIONS: Rendering loading state...')
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-[1800px] mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardSkeleton />
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
    console.log('❌ INTEGRATIONS: Rendering error state...')
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

  console.log('🎨 INTEGRATIONS: Rendering main UI...')
  console.log('📊 INTEGRATIONS: Total integrations:', state.integrations.length)
  console.log('📋 INTEGRATIONS: Filtered integrations:', filteredAndSortedIntegrations.length)
  console.log('👁️ INTEGRATIONS: View mode:', state.viewMode)

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                <TextShimmer>Integrations</TextShimmer>
              </h1>
              <p className="text-muted-foreground mt-2">
                Connect KAZI with your favorite tools and services
              </p>
            </div>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Plus className="h-4 w-4 mr-2" />
              Request Integration
            </Button>
          </div>
        </ScrollReveal>

        {/* View Tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(['overview', 'browse', 'connected', 'templates'] as const).map((view) => (
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
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-3xl font-bold mt-1">
                    <NumberFlow value={stats.total} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">integrations</p>
                </div>
                <Plug className="h-8 w-8 text-green-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <LiquidGlassCard className="p-6 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connected</p>
                  <p className="text-3xl font-bold mt-1">
                    <NumberFlow value={stats.connected} />
                  </p>
                  <p className="text-xs text-green-500 mt-1">active connections</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <LiquidGlassCard className="p-6 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Syncs</p>
                  <p className="text-3xl font-bold mt-1">
                    <NumberFlow value={stats.totalSyncs} />
                  </p>
                  <p className="text-xs text-purple-500 mt-1">{stats.avgSuccessRate.toFixed(1)}% success</p>
                </div>
                <RefreshCw className="h-8 w-8 text-purple-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.5}>
            <LiquidGlassCard className="p-6 relative overflow-hidden">
              
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Data Transferred</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatDataSize(stats.totalDataTransferred)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">this month</p>
                </div>
                <Database className="h-8 w-8 text-orange-500" />
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        </div>

        {/* Filters */}
        {state.viewMode === 'browse' && (
          <ScrollReveal>
            <LiquidGlassCard className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search integrations..."
                      value={state.searchTerm}
                      onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <Select value={state.filterCategory} onValueChange={(value: any) => dispatch({ type: 'SET_FILTER_CATEGORY', filterCategory: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={state.filterStatus} onValueChange={(value: any) => dispatch({ type: 'SET_FILTER_STATUS', filterStatus: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={state.sortBy} onValueChange={(value: any) => dispatch({ type: 'SET_SORT', sortBy: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Integrations Grid */}
        {state.viewMode === 'browse' && (
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LiquidGlassCard className="p-6 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{integration.icon}</div>
                      <div className="flex flex-col gap-1">
                        {integration.isPremium && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">Pro</Badge>
                        )}
                        {integration.isPopular && (
                          <Badge className="bg-green-500 text-white text-xs">Popular</Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 min-h-[40px] line-clamp-2">
                      {integration.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium capitalize">{integration.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`font-medium ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                      </div>
                    </div>

                    {integration.status === 'connected' ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            dispatch({ type: 'SELECT_INTEGRATION', integration })
                            setIsConfigureModalOpen(true)
                          }}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            dispatch({ type: 'SELECT_INTEGRATION', integration })
                            setIsDisconnectModalOpen(true)
                          }}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        size="sm"
                        onClick={() => {
                          dispatch({ type: 'SELECT_INTEGRATION', integration })
                          setIsConnectModalOpen(true)
                        }}
                      >
                        Connect
                      </Button>
                    )}
                  </LiquidGlassCard>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Connected View */}
        {state.viewMode === 'connected' && (
          <ScrollReveal>
            <div className="space-y-6">
              {state.integrations.filter(i => i.status === 'connected').map((integration) => (
                <LiquidGlassCard key={integration.id} className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{integration.icon}</div>
                      <div>
                        <h3 className="text-2xl font-bold">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Connected: {integration.connectedAt && new Date(integration.connectedAt).toLocaleDateString()}</span>
                          <span>Last Sync: {integration.lastSync && new Date(integration.lastSync).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          dispatch({ type: 'SELECT_INTEGRATION', integration })
                          setIsTestModalOpen(true)
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          dispatch({ type: 'SELECT_INTEGRATION', integration })
                          setIsConfigureModalOpen(true)
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          dispatch({ type: 'SELECT_INTEGRATION', integration })
                          setIsDisconnectModalOpen(true)
                        }}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Total Syncs</p>
                      <p className="text-2xl font-bold text-blue-500">
                        <NumberFlow value={integration.totalSyncs} />
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                      <p className="text-2xl font-bold text-green-500">{integration.successRate.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Data Transferred</p>
                      <p className="text-xl font-bold text-purple-500">
                        {formatDataSize(integration.dataTransferred)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Setup</p>
                      <Badge variant={integration.setupDifficulty === 'easy' ? 'default' : integration.setupDifficulty === 'medium' ? 'secondary' : 'destructive'}>
                        {integration.setupDifficulty}
                      </Badge>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}

              {state.integrations.filter(i => i.status === 'connected').length === 0 && (
                <NoDataEmptyState
                  entityName="connected integrations"
                  description="No integrations connected yet. Browse available integrations to get started."
                  action={{
                    label: 'Browse Integrations',
                    onClick: () => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'browse' })
                  }}
                />
              )}
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* MODALS */}

      {/* Connect Modal */}
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {state.selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect this integration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Webhook URL (optional)</Label>
              <Input
                type="url"
                placeholder="https://your-webhook-url.com"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              <a href={state.selectedIntegration?.documentation} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">
                View documentation →
              </a>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnectIntegration} disabled={isSaving}>
              {isSaving ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Modal */}
      <Dialog open={isConfigureModalOpen} onOpenChange={setIsConfigureModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {state.selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Manage integration settings and configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Sync Frequency</Label>
              <Select defaultValue="hourly">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Configuration Notes</Label>
              <Textarea
                placeholder="Add any configuration notes..."
                value={configNotes}
                onChange={(e) => setConfigNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigureModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Configuration saved')
              setIsConfigureModalOpen(false)
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Connection Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test {state.selectedIntegration?.name} Connection</DialogTitle>
            <DialogDescription>
              Verify that your integration is working correctly
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium mb-2">Ready to Test</p>
            <p className="text-sm text-muted-foreground">
              Click the button below to run a connection test
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestConnection} disabled={isSaving}>
              {isSaving ? 'Testing...' : 'Run Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Modal */}
      <Dialog open={isDisconnectModalOpen} onOpenChange={setIsDisconnectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect {state.selectedIntegration?.name}?</DialogTitle>
            <DialogDescription>
              This will stop all data syncing and remove the connection
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="text-sm">
                <p className="font-medium text-red-900 dark:text-red-200 mb-1">Warning</p>
                <p className="text-red-700 dark:text-red-300">
                  This action cannot be undone. You'll need to reconnect and reconfigure the integration.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisconnectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnectIntegration} disabled={isSaving}>
              {isSaving ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
