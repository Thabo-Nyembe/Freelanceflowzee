/* ------------------------------------------------------------------
 * Clients – Enterprise CRM Management System (A++++ Implementation)
 * ------------------------------------------------------------------ */
'use client'

import { useState, useEffect, useReducer, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Users, UserPlus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin,
  Star, Briefcase, DollarSign, Edit2, Trash2, Eye, MessageSquare, Calendar,
  FileText, TrendingUp, Award, Building, Globe, Clock, CheckCircle, X,
  Download, Upload, Settings, Tag, Activity, BarChart3, PieChart, Target,
  UserCheck, UserX, Zap, Heart, Share2, Send, Plus, AlertCircle, Info, Brain
} from 'lucide-react'

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { NumberFlow } from '@/components/ui/number-flow'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { GlowEffect } from '@/components/ui/glow-effect'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

// AI FEATURES
import { LeadScoringWidget } from '@/components/ai/lead-scoring-widget'
import { useCurrentUser, useLeadsData } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('Clients')

// ============================================================================
// FRAMER MOTION ANIMATION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'blue' }: { delay?: number; color?: string }) => {
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
// TYPES & INTERFACES
// ============================================================================

interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  location: string
  country: string
  timezone: string
  projects: number
  totalSpend: number
  rating: number
  status: 'vip' | 'active' | 'lead' | 'inactive' | 'prospect'
  industry?: string
  website?: string
  notes?: string
  tags?: string[]
  lastContact?: string
  nextFollowUp?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  status: 'active' | 'completed' | 'pending' | 'cancelled'
  value: number
  startDate: string
  endDate?: string
}

interface ClientsState {
  clients: Client[]
  selectedClient: Client | null
  searchTerm: string
  filterStatus: 'all' | 'vip' | 'active' | 'lead' | 'inactive' | 'prospect'
  sortBy: 'name' | 'company' | 'projects' | 'spend' | 'rating' | 'recent'
  selectedClients: string[]
  viewMode: 'grid' | 'list' | 'table'
}

type ClientsAction =
  | { type: 'SET_CLIENTS'; clients: Client[] }
  | { type: 'ADD_CLIENT'; client: Client }
  | { type: 'UPDATE_CLIENT'; client: Client }
  | { type: 'DELETE_CLIENT'; clientId: string }
  | { type: 'SELECT_CLIENT'; client: Client | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER'; filterStatus: ClientsState['filterStatus'] }
  | { type: 'SET_SORT'; sortBy: ClientsState['sortBy'] }
  | { type: 'TOGGLE_SELECT_CLIENT'; clientId: string }
  | { type: 'CLEAR_SELECTED_CLIENTS' }
  | { type: 'SET_VIEW_MODE'; viewMode: ClientsState['viewMode'] }

// ============================================================================
// MOCK DATA
// ============================================================================

const mockClients: Client[] = [
  {
    id: 'CL-001',
    name: 'Alex Johnson',
    company: 'Johnson Media',
    email: 'alex@jm.com',
    phone: '+1 555-1234',
    location: 'New York, USA',
    country: 'United States',
    timezone: 'EST',
    projects: 6,
    totalSpend: 12800,
    rating: 5,
    status: 'vip',
    industry: 'Media & Entertainment',
    website: 'https://johnsonmedia.com',
    tags: ['vip', 'high-value', 'enterprise'],
    lastContact: '2025-11-20',
    nextFollowUp: '2025-11-25',
    assignedTo: 'Sarah K.',
    createdAt: '2024-01-15',
    updatedAt: '2025-11-20'
  },
  {
    id: 'CL-002',
    name: 'Maria Garcia',
    company: 'Garcia Studios',
    email: 'maria@garciastudios.es',
    phone: '+34 600-98-765',
    location: 'Madrid, ES',
    country: 'Spain',
    timezone: 'CET',
    projects: 3,
    totalSpend: 5600,
    rating: 4,
    status: 'active',
    industry: 'Design',
    website: 'https://garciastudios.es',
    tags: ['international', 'design'],
    lastContact: '2025-11-18',
    nextFollowUp: '2025-11-28',
    assignedTo: 'John D.',
    createdAt: '2024-03-22',
    updatedAt: '2025-11-18'
  },
  {
    id: 'CL-003',
    name: 'David Lee',
    company: 'Lee & Co.',
    email: 'david@lee.co',
    phone: '+27 82-555-4321',
    location: 'Cape Town, ZA',
    country: 'South Africa',
    timezone: 'SAST',
    projects: 1,
    totalSpend: 1500,
    rating: 4,
    status: 'lead',
    industry: 'Consulting',
    tags: ['new-client', 'potential'],
    lastContact: '2025-11-15',
    nextFollowUp: '2025-12-01',
    assignedTo: 'Sarah K.',
    createdAt: '2025-10-10',
    updatedAt: '2025-11-15'
  },
  {
    id: 'CL-004',
    name: 'Emma Wilson',
    company: 'Wilson Enterprises',
    email: 'emma@wilson.io',
    phone: '+44 20-7946-0958',
    location: 'London, UK',
    country: 'United Kingdom',
    timezone: 'GMT',
    projects: 8,
    totalSpend: 18900,
    rating: 5,
    status: 'vip',
    industry: 'Technology',
    website: 'https://wilson.io',
    tags: ['vip', 'tech', 'long-term'],
    lastContact: '2025-11-21',
    nextFollowUp: '2025-11-26',
    assignedTo: 'Michael B.',
    createdAt: '2023-11-05',
    updatedAt: '2025-11-21'
  },
  {
    id: 'CL-005',
    name: 'Chen Wei',
    company: 'Wei Innovations',
    email: 'chen@weiinnovations.cn',
    phone: '+86 138-0013-8000',
    location: 'Shanghai, CN',
    country: 'China',
    timezone: 'CST',
    projects: 2,
    totalSpend: 3200,
    rating: 3,
    status: 'prospect',
    industry: 'Manufacturing',
    tags: ['asia-pacific', 'prospect'],
    lastContact: '2025-11-10',
    nextFollowUp: '2025-12-05',
    assignedTo: 'Lisa M.',
    createdAt: '2025-09-20',
    updatedAt: '2025-11-10'
  },
  {
    id: 'CL-006',
    name: 'Sofia Rodriguez',
    company: 'Rodriguez Digital',
    email: 'sofia@rodriguezdigital.mx',
    phone: '+52 55-5555-1234',
    location: 'Mexico City, MX',
    country: 'Mexico',
    timezone: 'CST',
    projects: 4,
    totalSpend: 7200,
    rating: 4,
    status: 'active',
    industry: 'Digital Marketing',
    website: 'https://rodriguezdigital.mx',
    tags: ['marketing', 'active'],
    lastContact: '2025-11-19',
    nextFollowUp: '2025-11-27',
    assignedTo: 'John D.',
    createdAt: '2024-06-12',
    updatedAt: '2025-11-19'
  }
]

const mockProjects: Record<string, Project[]> = {
  'CL-001': [
    { id: 'P-001', name: 'Brand Redesign', status: 'completed', value: 5000, startDate: '2024-01-15', endDate: '2024-03-30' },
    { id: 'P-002', name: 'Website Development', status: 'active', value: 8000, startDate: '2025-10-01' },
  ],
  'CL-002': [
    { id: 'P-003', name: 'Logo Design', status: 'completed', value: 2500, startDate: '2024-04-01', endDate: '2024-05-15' },
    { id: 'P-004', name: 'Marketing Campaign', status: 'active', value: 3500, startDate: '2025-09-15' },
  ]
}

// ============================================================================
// REDUCER
// ============================================================================

function clientsReducer(state: ClientsState, action: ClientsAction): ClientsState {
  logger.debug('Reducer action', { action: action.type })

  switch (action.type) {
    case 'SET_CLIENTS':
      logger.info('Clients loaded', { count: action.clients.length })
      return { ...state, clients: action.clients }

    case 'ADD_CLIENT':
      logger.info('Client added', { clientId: action.client.id, name: action.client.name })
      return { ...state, clients: [action.client, ...state.clients] }

    case 'UPDATE_CLIENT':
      logger.info('Client updated', { clientId: action.client.id })
      return {
        ...state,
        clients: state.clients.map(c =>
          c.id === action.client.id ? action.client : c
        )
      }

    case 'DELETE_CLIENT':
      logger.info('Client deleted', { clientId: action.clientId })
      return {
        ...state,
        clients: state.clients.filter(c => c.id !== action.clientId),
        selectedClient: state.selectedClient?.id === action.clientId ? null : state.selectedClient
      }

    case 'SELECT_CLIENT':
      logger.debug('Client selected', {
        clientId: action.client?.id,
        name: action.client?.name
      })
      return { ...state, selectedClient: action.client }

    case 'SET_SEARCH':
      logger.debug('Search updated', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER':
      logger.debug('Filter updated', { filterStatus: action.filterStatus })
      return { ...state, filterStatus: action.filterStatus }

    case 'SET_SORT':
      logger.debug('Sort updated', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    case 'TOGGLE_SELECT_CLIENT':
      logger.debug('Toggle client selection', { clientId: action.clientId })
      return {
        ...state,
        selectedClients: state.selectedClients.includes(action.clientId)
          ? state.selectedClients.filter(id => id !== action.clientId)
          : [...state.selectedClients, action.clientId]
      }

    case 'CLEAR_SELECTED_CLIENTS':
      logger.debug('Cleared selected clients')
      return { ...state, selectedClients: [] }

    case 'SET_VIEW_MODE':
      logger.debug('View mode changed', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    default:
      return state
  }
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const statusConfig: Record<Client['status'], { color: string; icon: any; label: string }> = {
  vip: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Award, label: 'VIP' },
  active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Active' },
  lead: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Target, label: 'Lead' },
  inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: Clock, label: 'Inactive' },
  prospect: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: Zap, label: 'Prospect' }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClientsPage() {
  logger.debug('Clients page mounted')

  // REAL USER AUTH & LEADS DATA
  const { userId, loading: userLoading } = useCurrentUser()
  const { leads: realLeads, scores: leadScores, loading: leadsLoading } = useLeadsData(userId || undefined)

  // A+++ Loading & Error State
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // State Management with Reducer
  const [state, dispatch] = useReducer(clientsReducer, {
    clients: [],
    selectedClient: null,
    searchTerm: '',
    filterStatus: 'all',
    sortBy: 'recent',
    selectedClients: [],
    viewMode: 'grid'
  })

  // Modal States
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false)
  const [isViewClientModalOpen, setIsViewClientModalOpen] = useState(false)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Form States
  const [formData, setFormData] = useState<Partial<Client>>({})
  const [isSaving, setIsSaving] = useState(false)

  // AI Panel State
  const [showAIPanel, setShowAIPanel] = useState(true)

  // Filtered and Sorted Clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = state.clients.filter(client => {
      const matchesSearch =
        client.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(state.searchTerm.toLowerCase())

      const matchesFilter =
        state.filterStatus === 'all' || client.status === state.filterStatus

      return matchesSearch && matchesFilter
    })

    // Sort
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'company':
          return a.company.localeCompare(b.company)
        case 'projects':
          return b.projects - a.projects
        case 'spend':
          return b.totalSpend - a.totalSpend
        case 'rating':
          return b.rating - a.rating
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return 0
      }
    })

    logger.debug('Clients filtered and sorted', {
      count: filtered.length,
      searchTerm: state.searchTerm,
      filterStatus: state.filterStatus,
      sortBy: state.sortBy
    })
    return filtered
  }, [state.clients, state.searchTerm, state.filterStatus, state.sortBy])

  // Stats
  const stats = useMemo(() => {
    const s = {
      total: state.clients.length,
      vip: state.clients.filter(c => c.status === 'vip').length,
      active: state.clients.filter(c => c.status === 'active').length,
      leads: state.clients.filter(c => c.status === 'lead').length,
      prospects: state.clients.filter(c => c.status === 'prospect').length,
      inactive: state.clients.filter(c => c.status === 'inactive').length,
      totalRevenue: state.clients.reduce((sum, c) => sum + c.totalSpend, 0),
      avgSpend: state.clients.length > 0
        ? state.clients.reduce((sum, c) => sum + c.totalSpend, 0) / state.clients.length
        : 0,
      totalProjects: state.clients.reduce((sum, c) => sum + c.projects, 0),
      avgRating: state.clients.length > 0
        ? state.clients.reduce((sum, c) => sum + c.rating, 0) / state.clients.length
        : 0
    }
    logger.debug('Stats calculated', s)
    return s
  }, [state.clients])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    logger.info('Loading clients')
    const loadClients = async () => {
      try {
        setIsLoading(true)
        setError(null)

        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.98) {
              reject(new Error('Failed to load clients'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        dispatch({ type: 'SET_CLIENTS', clients: mockClients })
        setIsLoading(false)
        logger.info('Clients loaded successfully', { count: mockClients.length })
        announce(`${mockClients.length} clients loaded successfully`, 'polite')
      } catch (err) {
        logger.error('Failed to load clients', { error: err })
        setError(err instanceof Error ? err.message : 'Failed to load clients')
        setIsLoading(false)
        announce('Error loading clients', 'assertive')
      }
    }

    loadClients()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddClient = async () => {
    if (!formData.name || !formData.email) {
      logger.warn('Validation failed for add client', {
        hasName: !!formData.name,
        hasEmail: !!formData.email
      })
      toast.error('Required fields missing', {
        description: 'Please fill in name and email'
      })
      return
    }

    logger.info('Adding new client', {
      name: formData.name,
      email: formData.email,
      company: formData.company
    })

    try {
      setIsSaving(true)

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: formData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create client')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Client created successfully', {
          clientId: result.client.id,
          name: result.client.name
        })
        dispatch({ type: 'ADD_CLIENT', client: result.client })

        setIsAddClientModalOpen(false)
        setFormData({})

        toast.success('✅ Client added', {
          description: `${result.client.name} has been added to your client list`
        })
      } else {
        throw new Error(result.error || 'Failed to create client')
      }
    } catch (error: any) {
      logger.error('Failed to add client', { error, name: formData.name })
      toast.error('Failed to add client', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateClient = async () => {
    if (!state.selectedClient || !formData.name || !formData.email) {
      logger.warn('Update validation failed', {
        hasClient: !!state.selectedClient,
        hasName: !!formData.name,
        hasEmail: !!formData.email
      })
      toast.error('Required fields missing')
      return
    }

    logger.info('Updating client', {
      clientId: state.selectedClient.id,
      name: formData.name
    })

    try {
      setIsSaving(true)

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          clientId: state.selectedClient.id,
          data: formData
        })
      })

      const result = await response.json()

      if (result.success) {
        const updatedClient: Client = {
          ...state.selectedClient,
          ...formData,
          updatedAt: new Date().toISOString()
        } as Client

        logger.info('Client updated successfully', {
          clientId: updatedClient.id,
          name: updatedClient.name
        })
        dispatch({ type: 'UPDATE_CLIENT', client: updatedClient })

        setIsEditClientModalOpen(false)
        setFormData({})

        toast.success('✅ Client updated', {
          description: `${updatedClient.name}'s information has been updated`
        })
      } else {
        throw new Error(result.error || 'Failed to update client')
      }
    } catch (error: any) {
      logger.error('Failed to update client', {
        error,
        clientId: state.selectedClient.id
      })
      toast.error('Failed to update client', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    const client = state.clients.find(c => c.id === clientId)
    logger.info('Delete client requested', { clientId, name: client?.name })

    if (confirm(`⚠️ Delete client ${client?.name}? This action cannot be undone.`)) {
      logger.info('Delete client confirmed', { clientId })

      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            clientId
          })
        })

        const result = await response.json()

        if (result.success) {
          dispatch({ type: 'DELETE_CLIENT', clientId })
          logger.info('Client deleted successfully', { clientId, name: client?.name })

          toast.success('🗑️ Client deleted', {
            description: `${client?.name} has been removed`
          })
        } else {
          throw new Error(result.error || 'Failed to delete client')
        }
      } catch (error: any) {
        logger.error('Failed to delete client', { error, clientId })
        toast.error('Failed to delete client', {
          description: error.message || 'Please try again later'
        })
      }
    } else {
      logger.debug('Delete client canceled', { clientId })
    }
  }

  const handleViewClient = (client: Client) => {
    logger.info('View client', { clientId: client.id, name: client.name })
    dispatch({ type: 'SELECT_CLIENT', client })
    setIsViewClientModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    logger.info('Edit client', { clientId: client.id, name: client.name })
    dispatch({ type: 'SELECT_CLIENT', client })
    setFormData(client)
    setIsEditClientModalOpen(true)
  }

  const handleSendMessage = (client: Client) => {
    logger.info('Send message to client', { clientId: client.id, name: client.name })
    toast.info('💬 Opening message composer', {
      description: `Starting conversation with ${client.name}`
    })
  }

  const handleSendEmail = (client: Client) => {
    logger.info('Send email to client', { clientId: client.id, email: client.email })
    window.location.href = `mailto:${client.email}`
    toast.success('📧 Email client opened')
  }

  const handleCallClient = (client: Client) => {
    logger.info('Call client', { clientId: client.id, phone: client.phone })
    toast.info('📞 Initiating call', {
      description: `Calling ${client.name} at ${client.phone}`
    })
  }

  const handleScheduleMeeting = (client: Client) => {
    logger.info('Schedule meeting with client', { clientId: client.id, name: client.name })
    toast.info('📅 Opening calendar', {
      description: `Scheduling meeting with ${client.name}`
    })
  }

  const handleViewAnalytics = (client: Client) => {
    logger.info('View analytics for client', { clientId: client.id, name: client.name })
    dispatch({ type: 'SELECT_CLIENT', client })
    setIsAnalyticsModalOpen(true)
  }

  const handleExport = async () => {
    logger.info('Export clients initiated', { count: state.clients.length })

    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalClients: state.clients.length,
        clients: state.clients
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clients-export-${Date.now()}.json`
      a.click()

      logger.info('Clients exported successfully', { count: state.clients.length })
      toast.success('💾 Export complete', {
        description: `${state.clients.length} clients exported`
      })

      setIsExportModalOpen(false)
    } catch (error) {
      logger.error('Failed to export clients', { error, count: state.clients.length })
      toast.error('Export failed')
    }
  }

  const handleBulkDelete = async () => {
    if (state.selectedClients.length === 0) {
      logger.warn('Bulk delete attempted with no selection')
      return
    }

    logger.info('Bulk delete clients requested', { count: state.selectedClients.length })

    if (confirm(`⚠️ Delete ${state.selectedClients.length} clients? This action cannot be undone.`)) {
      logger.info('Bulk delete confirmed', { count: state.selectedClients.length })

      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'bulk-delete',
            clientIds: state.selectedClients
          })
        })

        const result = await response.json()

        if (result.success) {
          state.selectedClients.forEach(id => {
            dispatch({ type: 'DELETE_CLIENT', clientId: id })
          })
          dispatch({ type: 'CLEAR_SELECTED_CLIENTS' })
          logger.info('Bulk delete completed', { deletedCount: result.deletedCount })
          toast.success(`🗑️ ${result.deletedCount} clients deleted`)
        } else {
          throw new Error(result.error || 'Failed to delete clients')
        }
      } catch (error: any) {
        logger.error('Failed to bulk delete clients', {
          error,
          count: state.selectedClients.length
        })
        toast.error('Failed to delete clients', {
          description: error.message || 'Please try again later'
        })
      }
    } else {
      logger.debug('Bulk delete canceled')
    }
  }

  const handleStatusChange = async (clientId: string, newStatus: Client['status']) => {
    const client = state.clients.find(c => c.id === clientId)
    if (!client) return

    logger.info('Status change initiated', { clientId, oldStatus: client.status, newStatus })

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          clientId,
          data: { status: newStatus }
        })
      })

      const result = await response.json()

      if (result.success) {
        const updatedClient = {
          ...client,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }

        dispatch({ type: 'UPDATE_CLIENT', client: updatedClient })
        logger.info('Status updated successfully', {
          clientId,
          name: client.name,
          newStatus
        })

        toast.success('✅ Status updated', {
          description: `${client.name} is now ${newStatus}`
        })
      } else {
        throw new Error(result.error || 'Failed to update status')
      }
    } catch (error: any) {
      logger.error('Failed to update status', { error, clientId, newStatus })
      toast.error('Failed to update status', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ListSkeleton items={8} />
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorEmptyState
            error={error}
            action={{
              label: 'Retry',
              onClick: () => {
                logger.info('User clicked retry')
                window.location.reload()
              }
            }}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: EMPTY STATE
  // ============================================================================

  if (filteredAndSortedClients.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
        <div className="max-w-7xl mx-auto">
          <NoDataEmptyState
            entityName="clients"
            description={
              state.searchTerm
                ? "No clients match your search criteria. Try adjusting your filters."
                : "Get started by adding your first client to the CRM system."
            }
            action={{
              label: state.searchTerm ? 'Clear Search' : 'Add Client',
              onClick: state.searchTerm
                ? () => {
                    logger.debug('Clearing search from empty state')
                    dispatch({ type: 'SET_SEARCH', searchTerm: '' })
                  }
                : () => {
                    logger.info('Opening add client modal from empty state')
                    setIsAddClientModalOpen(true)
                  }
            }}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: MAIN CONTENT
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <TextShimmer className="text-3xl font-bold">
                  Clients
                </TextShimmer>
                <p className="text-muted-foreground text-sm">
                  Enterprise CRM & Relationship Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAIPanel(!showAIPanel)}
              >
                <Brain className="h-4 w-4 mr-2" />
                {showAIPanel ? 'Hide' : 'Show'} AI Leads
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  logger.info('Import button clicked')
                  setIsImportModalOpen(true)
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  logger.info('Export button clicked')
                  setIsExportModalOpen(true)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                      Create a new client profile in your CRM system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          placeholder="Acme Inc."
                          value={formData.company || ''}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          placeholder="+1 555-1234"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="New York, USA"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status || 'lead'}
                          onValueChange={(value) => setFormData({ ...formData, status: value as Client['status'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="Technology, Media, etc."
                        value={formData.industry || ''}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://example.com"
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional information about this client..."
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        logger.debug('Add client canceled')
                        setIsAddClientModalOpen(false)
                        setFormData({})
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddClient} disabled={isSaving}>
                      {isSaving ? 'Adding...' : 'Add Client'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats Overview */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Clients', value: stats.total, icon: Users, color: 'blue' },
              { label: 'VIP', value: stats.vip, icon: Award, color: 'yellow' },
              { label: 'Active', value: stats.active, icon: CheckCircle, color: 'green' },
              { label: 'Leads', value: stats.leads, icon: Target, color: 'blue' },
              { label: 'Total Revenue', value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'green' },
              { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, color: 'yellow' }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <LiquidGlassCard key={index} className="relative overflow-hidden">
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-4 w-4 text-${stat.color}-500`} />
                      <GlowEffect color={stat.color} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        {typeof stat.value === 'number' ? (
                          <NumberFlow value={stat.value} />
                        ) : (
                          stat.value
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </LiquidGlassCard>
              )
            })}
          </div>
        </ScrollReveal>

        {/* AI LEAD SCORING PANEL */}
        {showAIPanel && userId && (
          <ScrollReveal delay={0.15}>
            <LeadScoringWidget
              userId={userId}
              leads={realLeads.length > 0 ? realLeads : state.clients.filter(c => c.status === 'lead').map(c => ({
                id: c.id,
                name: c.name,
                company: c.company,
                industry: c.tags?.[0] || 'business',
                email: c.email,
                source: 'inbound' as const,
                budget: c.lifetime_value || 5000,
                projectDescription: c.notes || 'Potential client',
                decisionMaker: true,
                painPoints: []
              }))}
              compact={false}
            />
          </ScrollReveal>
        )}

        {/* Filters & Controls */}
        <ScrollReveal delay={0.2}>
          <LiquidGlassCard>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={state.searchTerm}
                    onChange={(e) => {
                      dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })
                    }}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={state.filterStatus}
                  onValueChange={(value) => {
                    dispatch({ type: 'SET_FILTER', filterStatus: value as ClientsState['filterStatus'] })
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="vip">VIP Only</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="lead">Leads</SelectItem>
                    <SelectItem value="prospect">Prospects</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={state.sortBy}
                  onValueChange={(value) => {
                    dispatch({ type: 'SET_SORT', sortBy: value as ClientsState['sortBy'] })
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Updated</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="company">Company (A-Z)</SelectItem>
                    <SelectItem value="projects">Most Projects</SelectItem>
                    <SelectItem value="spend">Highest Spend</SelectItem>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Bulk Actions */}
        {state.selectedClients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <LiquidGlassCard className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-4 flex items-center justify-between">
                <p className="text-sm">
                  <NumberFlow value={state.selectedClients.length} /> client(s) selected
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      dispatch({ type: 'CLEAR_SELECTED_CLIENTS' })
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Clients Grid */}
        <ScrollReveal delay={0.3}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredAndSortedClients.map((client, index) => {
                const StatusIcon = statusConfig[client.status].icon
                const isSelected = state.selectedClients.includes(client.id)

                return (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <LiquidGlassCard
                      className={`group hover:shadow-xl transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              dispatch({ type: 'TOGGLE_SELECT_CLIENT', clientId: client.id })
                            }}
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div
                            className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-semibold text-white text-lg shadow-lg relative"
                          >
                            {client.name.charAt(0).toUpperCase()}
                            {client.status === 'vip' && (
                              <div className="absolute -top-1 -right-1">
                                <Award className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{client.name}</CardTitle>
                            <CardDescription className="text-xs truncate">
                              {client.company}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewClient(client)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClient(client)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleSendMessage(client)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendEmail(client)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCallClient(client)}>
                                <Phone className="h-4 w-4 mr-2" />
                                Call Client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewAnalytics(client)}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleScheduleMeeting(client)}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Meeting
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClient(client.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3" onClick={() => handleViewClient(client)}>
                        {/* Contact Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{client.location}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <NumberFlow value={client.projects} /> projects
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${client.totalSpend.toLocaleString()}
                          </div>
                        </div>

                        {/* Rating & Status */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < client.rating
                                    ? 'fill-yellow-400 stroke-yellow-400'
                                    : 'stroke-gray-300 dark:stroke-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge className={statusConfig[client.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[client.status].label}
                          </Badge>
                        </div>

                        {/* Tags */}
                        {client.tags && client.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2 border-t">
                            {client.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="pt-3 border-t">
                        <div className="flex items-center gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendMessage(client)
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendEmail(client)
                            }}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                        </div>
                      </CardFooter>
                    </LiquidGlassCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>

      {/* View Client Modal */}
      <Dialog open={isViewClientModalOpen} onOpenChange={setIsViewClientModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Profile</DialogTitle>
            <DialogDescription>
              Complete information for {state.selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          {state.selectedClient && (
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{state.selectedClient.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Company</Label>
                    <p className="font-medium">{state.selectedClient.company}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium">{state.selectedClient.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="font-medium">{state.selectedClient.phone}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <p className="font-medium">{state.selectedClient.location}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <p>
                      <Badge className={statusConfig[state.selectedClient.status].color}>
                        {statusConfig[state.selectedClient.status].label}
                      </Badge>
                    </p>
                  </div>
                  {state.selectedClient.industry && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Industry</Label>
                      <p className="font-medium">{state.selectedClient.industry}</p>
                    </div>
                  )}
                  {state.selectedClient.website && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Website</Label>
                      <a
                        href={state.selectedClient.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {state.selectedClient.website}
                      </a>
                    </div>
                  )}
                </div>
                {state.selectedClient.notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <p className="text-sm mt-1">{state.selectedClient.notes}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="projects" className="mt-4">
                <div className="space-y-4">
                  {mockProjects[state.selectedClient.id]?.map((project) => (
                    <Card key={project.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${project.value.toLocaleString()}
                            </p>
                          </div>
                          <Badge>{project.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )) || <p className="text-sm text-muted-foreground text-center py-8">No projects yet</p>}
                </div>
              </TabsContent>
              <TabsContent value="activity" className="mt-4">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Last Contact: {state.selectedClient.lastContact}</p>
                    <p>Next Follow-up: {state.selectedClient.nextFollowUp}</p>
                    <p>Assigned To: {state.selectedClient.assignedTo}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={isEditClientModalOpen} onOpenChange={setIsEditClientModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update information for {state.selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Client['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                logger.debug('Edit client canceled')
                setIsEditClientModalOpen(false)
                setFormData({})
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateClient} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Client Analytics</DialogTitle>
            <DialogDescription>
              Performance metrics for {state.selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          {state.selectedClient && (
            <div className="grid grid-cols-3 gap-4 py-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">
                    <NumberFlow value={state.selectedClient.projects} />
                  </p>
                  <p className="text-xs text-muted-foreground">Total Projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">
                    ${state.selectedClient.totalSpend.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{state.selectedClient.rating}.0</p>
                  <p className="text-xs text-muted-foreground">Client Rating</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Clients</DialogTitle>
            <DialogDescription>
              Download your client database
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              This will export {state.clients.length} clients as a JSON file.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-medium">JSON</span>
              </div>
              <div className="flex justify-between">
                <span>Clients:</span>
                <span className="font-medium">
                  <NumberFlow value={state.clients.length} />
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                logger.debug('Export canceled')
                setIsExportModalOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Clients</DialogTitle>
            <DialogDescription>
              Upload a JSON or CSV file to import clients
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                logger.debug('Import canceled')
                setIsImportModalOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
