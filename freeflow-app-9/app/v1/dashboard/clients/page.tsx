/* ------------------------------------------------------------------
 * Clients – Enterprise CRM Management System (A++++ Implementation)
 * ------------------------------------------------------------------ */
'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, useReducer, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Users, UserPlus, Search, MoreHorizontal, Mail, Phone, MapPin,
  Star, Briefcase, DollarSign, Edit2, Trash2, Eye, MessageSquare, Calendar, Award, Clock, CheckCircle, X,
  Download, Upload, Tag, BarChart3, Target, Zap, Brain,
  AlertTriangle, FileCheck, Loader2
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
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

// MIGRATED: Batch #22 - Verified database hook integration

const mockClients: Client[] = []

const mockProjects: Record<string, Project[]> = {}

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

  // ROUTER
  const router = useRouter()

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

  // Delete Dialog States
  const [showDeleteClientDialog, setShowDeleteClientDialog] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form States
  const [formData, setFormData] = useState<Partial<Client>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Import States
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)

  // AI Panel State
  const [showAIPanel, setShowAIPanel] = useState(true)

  // Notes Dialog State
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

  // History Dialog State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [clientHistory, setClientHistory] = useState<Array<{
    id: string
    action: string
    description: string
    timestamp: string
    user: string
  }>>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Email Dialog State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Filtered and Sorted Clients
  const filteredAndSortedClients = useMemo(() => {
    const filtered = state.clients.filter(client => {
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
    const loadClients = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        logger.info('Loading clients from Supabase', { userId })
        setIsLoading(true)
        setError(null)

        // Import clients queries utility
        const { getClients } = await import('@/lib/clients-queries')

        // Fetch clients from Supabase
        const { data: clientsData, error: clientsError, count } = await getClients(userId)

        if (clientsError) {
          throw new Error(clientsError.message || 'Failed to load clients')
        }

        // Transform database clients to UI format
        const transformedClients = (clientsData || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          company: c.company || '',
          position: c.position || '',
          status: c.status || 'lead',
          avatar: c.avatar || '',
          totalRevenue: c.total_revenue || 0,
          projectCount: c.projects_count || 0,
          lastContact: c.last_contact || new Date().toISOString(),
          tags: c.tags || [],
          notes: c.notes || '',
          industry: c.industry || '',
          location: c.city || '',
          healthScore: c.health_score || 50,
          priority: c.priority || 'medium',
          source: 'database',
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }))

        logger.info('Clients loaded from Supabase', {
          count: transformedClients.length,
          total: count
        })

        dispatch({ type: 'SET_CLIENTS', clients: transformedClients })
        setIsLoading(false)
        announce(`${transformedClients.length} clients loaded successfully`, 'polite')
        toast.success('Clients loaded', {
          description: `${transformedClients.length} clients from database`
        })
      } catch (err) {
        logger.error('Failed to load clients', { error: err, userId })
        setError(err instanceof Error ? err.message : 'Failed to load clients')
        setIsLoading(false)
        announce('Error loading clients', 'assertive')
        toast.error('Failed to load clients', {
          description: err instanceof Error ? err.message : 'Please try again'
        })
      }
    }

    loadClients()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddClient = async () => {
    if (!userId) {
      toast.error('Please log in')
      return
    }

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

    logger.info('Adding new client to Supabase', {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      userId
    })

    try {
      setIsSaving(true)

      // Import clients queries utility
      const { addClient } = await import('@/lib/clients-queries')

      // Create client in Supabase
      const { data: createdClient, error: createError } = await addClient(userId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        status: formData.status || 'lead',
        notes: formData.notes
      })

      if (createError || !createdClient) {
        throw new Error(createError?.message || 'Failed to create client')
      }

      // Transform to UI format
      const uiClient = {
        id: createdClient.id,
        name: createdClient.name,
        email: createdClient.email,
        phone: createdClient.phone || '',
        company: createdClient.company || '',
        position: createdClient.position || '',
        status: createdClient.status,
        avatar: '',
        totalRevenue: 0,
        projectCount: 0,
        lastContact: new Date().toISOString(),
        tags: [],
        notes: createdClient.notes || '',
        industry: '',
        location: '',
        healthScore: 50,
        priority: 'medium',
        source: 'database',
        createdAt: createdClient.created_at,
        updatedAt: createdClient.updated_at
      }

      logger.info('Client created successfully in Supabase', {
        clientId: createdClient.id,
        name: createdClient.name
      })

      dispatch({ type: 'ADD_CLIENT', client: uiClient })
      setIsAddClientModalOpen(false)
      setFormData({})

      toast.success('✅ Client added', {
        description: `${createdClient.name} has been added to your client list`
      })
      announce(`Client ${createdClient.name} added successfully`, 'polite')
    } catch (error) {
      logger.error('Failed to add client', { error, name: formData.name, userId })
      toast.error('Failed to add client', {
        description: error.message || 'Please try again later'
      })
      announce('Error adding client', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateClient = async () => {
    if (!userId) {
      toast.error('Please log in')
      return
    }

    if (!state.selectedClient || !formData.name || !formData.email) {
      logger.warn('Update validation failed', {
        hasClient: !!state.selectedClient,
        hasName: !!formData.name,
        hasEmail: !!formData.email
      })
      toast.error('Required fields missing', {
        description: 'Name and email are required'
      })
      return
    }

    logger.info('Updating client in Supabase', {
      clientId: state.selectedClient.id,
      name: formData.name,
      userId
    })

    try {
      setIsSaving(true)

      // Import clients queries utility
      const { updateClient } = await import('@/lib/clients-queries')

      // Update client in Supabase
      const { data: updatedClient, error: updateError } = await updateClient(
        userId,
        state.selectedClient.id,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          position: formData.position,
          status: formData.status,
          notes: formData.notes
        }
      )

      if (updateError || !updatedClient) {
        throw new Error(updateError?.message || 'Failed to update client')
      }

      // Transform to UI format
      const uiClient = {
        id: updatedClient.id,
        name: updatedClient.name,
        email: updatedClient.email,
        phone: updatedClient.phone || '',
        company: updatedClient.company || '',
        position: updatedClient.position || '',
        status: updatedClient.status,
        avatar: state.selectedClient.avatar || '',
        totalRevenue: state.selectedClient.totalRevenue || 0,
        projectCount: state.selectedClient.projectCount || 0,
        lastContact: state.selectedClient.lastContact,
        tags: state.selectedClient.tags || [],
        notes: updatedClient.notes || '',
        industry: state.selectedClient.industry || '',
        location: state.selectedClient.location || '',
        healthScore: state.selectedClient.healthScore || 50,
        priority: state.selectedClient.priority || 'medium',
        source: 'database',
        createdAt: updatedClient.created_at,
        updatedAt: updatedClient.updated_at
      }

      logger.info('Client updated successfully in Supabase', {
        clientId: updatedClient.id,
        name: updatedClient.name
      })

      dispatch({ type: 'UPDATE_CLIENT', client: uiClient })
      setIsEditClientModalOpen(false)
      setFormData({})

      toast.success('✅ Client updated', {
        description: `${updatedClient.name}'s information has been updated`
      })
      announce(`Client ${updatedClient.name} updated successfully`, 'polite')
    } catch (error) {
      logger.error('Failed to update client', {
        error,
        clientId: state.selectedClient.id,
        userId
      })
      toast.error('Failed to update client', {
        description: error.message || 'Please try again later'
      })
      announce('Error updating client', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!userId) {
      toast.error('Please log in')
      return
    }

    const client = state.clients.find(c => c.id === clientId)
    logger.info('Delete client requested', { clientId, name: client?.name, userId })

    setClientToDelete(clientId)
    setShowDeleteClientDialog(true)
  }

  const confirmDeleteClient = async () => {
    if (!clientToDelete || !userId) return

    const client = state.clients.find(c => c.id === clientToDelete)
    logger.info('Delete client confirmed', { clientId: clientToDelete })

    try {
      setIsDeleting(true)

      // Import clients queries utility
      const { deleteClient } = await import('@/lib/clients-queries')

      // Delete client from Supabase
      const { success, error: deleteError } = await deleteClient(userId, clientToDelete)

      if (deleteError || !success) {
        throw new Error(deleteError?.message || 'Failed to delete client')
      }

      dispatch({ type: 'DELETE_CLIENT', clientId: clientToDelete })
      logger.info('Client deleted successfully from Supabase', {
        clientId: clientToDelete,
        name: client?.name,
        userId
      })

      toast.success('🗑️ Client deleted', {
        description: `${client?.name} has been removed from your client list`
      })
      announce(`Client ${client?.name} deleted successfully`, 'polite')
    } catch (error) {
      logger.error('Failed to delete client', {
        error,
        clientId: clientToDelete,
        userId
      })
      toast.error('Failed to delete client', {
        description: error.message || 'Please try again later'
      })
      announce('Error deleting client', 'assertive')
    } finally {
      setIsDeleting(false)
      setShowDeleteClientDialog(false)
      setClientToDelete(null)
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

    // Navigate to messages page with client pre-selected
    router.push(`/dashboard/messages?client=${encodeURIComponent(client.name)}&email=${encodeURIComponent(client.email)}`)

    toast.success(`Message composer ready for ${client.name}`)
  }

  const handleSendEmail = (client: Client) => {
    logger.info('Send email to client', { clientId: client.id, email: client.email })
    window.location.href = `mailto:${client.email}`
    toast.success('Email client opened')
  }

  const handleCallClient = (client: Client) => {
    logger.info('Call client', { clientId: client.id, phone: client.phone })

    if (client.phone) {
      // Use tel: protocol to initiate call
      window.location.href = `tel:${client.phone}`

      toast.success(`Calling ${client.name} at ${client.phone}`)
    } else {
      toast.error('No phone number available', {
        description: `${client.name} doesn't have a phone number on file`
      })
    }
  }

  const handleScheduleMeeting = (client: Client) => {
    logger.info('Schedule meeting with client', { clientId: client.id, name: client.name })

    // Navigate to bookings/calendar with client pre-filled
    router.push(`/dashboard/bookings?client=${encodeURIComponent(client.name)}&clientId=${client.id}`)

    toast.success(`Calendar ready for scheduling with ${client.name}`)
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
      toast.success(`${state.clients.length} clients exported successfully`)

      setIsExportModalOpen(false)
    } catch (error) {
      logger.error('Failed to export clients', { error, count: state.clients.length })
      toast.error('Export failed')
    }
  }

  // Import Handlers
  const handleFileSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.csv'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setImportFile(file)
        logger.info('Import file selected', { name: file.name, size: file.size, type: file.type })
      }
    }
    input.click()
  }

  const handleImport = async () => {
    if (!importFile || !userId) {
      toast.error('Please select a file to import')
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    logger.info('Import started', { fileName: importFile.name, size: importFile.size })

    try {
      const text = await importFile.text()
      let clientsData: any[] = []

      // Parse based on file type
      if (importFile.name.endsWith('.json')) {
        const parsed = JSON.parse(text)
        clientsData = Array.isArray(parsed) ? parsed : parsed.clients || [parsed]
      } else if (importFile.name.endsWith('.csv')) {
        // Simple CSV parsing
        const lines = text.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          const clientObj: Record<string, string> = {}
          headers.forEach((header, idx) => {
            clientObj[header] = values[idx] || ''
          })
          clientsData.push(clientObj)
        }
      }

      if (clientsData.length === 0) {
        toast.error('No valid client data found in file')
        setIsImporting(false)
        return
      }

      // Import clients
      let importedCount = 0
      let errorCount = 0

      // Import addClient function
      const { addClient } = await import('@/lib/clients-queries')

      for (let i = 0; i < clientsData.length; i++) {
        const clientData = clientsData[i]
        setImportProgress(Math.round((i / clientsData.length) * 100))

        try {
          const { data: created, error } = await addClient(userId, {
            name: clientData.name || clientData.client_name || 'Unnamed Client',
            email: clientData.email || clientData.client_email || '',
            phone: clientData.phone || clientData.client_phone,
            company: clientData.company || clientData.company_name || '',
            status: clientData.status || 'active',
            type: clientData.type || 'individual',
            priority: clientData.priority || 'medium',
            tags: clientData.tags ? (Array.isArray(clientData.tags) ? clientData.tags : clientData.tags.split(',')) : [],
            notes: clientData.notes || ''
          })

          if (error) {
            errorCount++
            logger.warn('Failed to import client', { clientName: clientData.name, error })
          } else if (created) {
            importedCount++
            // Map database client to UI client format
            const uiClient = {
              id: created.id,
              name: created.name,
              email: created.email,
              phone: created.phone || '',
              company: created.company || '',
              status: created.status,
              priority: created.priority,
              projectCount: 0,
              totalRevenue: 0,
              healthScore: 100,
              tags: created.tags || [],
              lastContact: created.last_contact || new Date().toISOString(),
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(created.name)}&background=random`,
              notes: created.notes || '',
              type: created.type
            }
            dispatch({ type: 'ADD_CLIENT', client: uiClient })
          }
        } catch (err) {
          errorCount++
          logger.error('Exception importing client', { clientName: clientData.name, error: err })
        }
      }

      setImportProgress(100)
      logger.info('Import completed', { importedCount, errorCount, total: clientsData.length })

      if (errorCount > 0) {
        toast.warning(`Import completed with issues`, {
          description: `${importedCount} imported, ${errorCount} failed`
        })
      } else {
        toast.success('Import successful!', {
          description: `${importedCount} clients imported`
        })
      }

      setIsImportModalOpen(false)
      setImportFile(null)
      setImportProgress(0)
    } catch (error) {
      logger.error('Import failed', { error, fileName: importFile.name })
      toast.error('Import failed', {
        description: 'Invalid file format or corrupted data'
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (state.selectedClients.length === 0) {
      logger.warn('Bulk delete attempted with no selection')
      return
    }

    if (!userId) {
      toast.error('Please log in to delete clients')
      return
    }

    logger.info('Bulk delete clients requested', { count: state.selectedClients.length })
    setShowBulkDeleteDialog(true)
  }

  const confirmBulkDelete = async () => {
    if (!userId) return

    logger.info('Bulk delete confirmed', { count: state.selectedClients.length })

    try {
      setIsDeleting(true)
      const { deleteClient } = await import('@/lib/clients-queries')

      let deletedCount = 0
      const failedDeletes: string[] = []

      for (const clientId of state.selectedClients) {
        const { success, error } = await deleteClient(userId, clientId)

        if (success) {
          dispatch({ type: 'DELETE_CLIENT', clientId })
          deletedCount++
        } else {
          failedDeletes.push(clientId)
          logger.warn('Failed to delete client in bulk operation', { clientId, error })
        }
      }

      dispatch({ type: 'CLEAR_SELECTED_CLIENTS' })

      logger.info('Bulk delete completed', { deletedCount, failedCount: failedDeletes.length })

      if (deletedCount > 0) {
        toast.success(`🗑️ ${deletedCount} client${deletedCount > 1 ? 's' : ''} deleted`)
        announce(`${deletedCount} clients deleted successfully`, 'polite')
      }

      if (failedDeletes.length > 0) {
        toast.error(`Failed to delete ${failedDeletes.length} client${failedDeletes.length > 1 ? 's' : ''}`)
      }
    } catch (error) {
      logger.error('Failed to bulk delete clients', {
        error,
        count: state.selectedClients.length
      })
      toast.error('Failed to delete clients', {
        description: error.message || 'Please try again later'
      })
      announce('Error deleting clients', 'assertive')
    } finally {
      setIsDeleting(false)
      setShowBulkDeleteDialog(false)
    }
  }

  const handleStatusChange = async (clientId: string, newStatus: Client['status']) => {
    const client = state.clients.find(c => c.id === clientId)
    if (!client) return

    if (!userId) {
      toast.error('Please log in to update status')
      return
    }

    logger.info('Status change initiated', { clientId, oldStatus: client.status, newStatus })

    try {
      const { updateClientStatus } = await import('@/lib/clients-queries')

      const { data, error } = await updateClientStatus(userId, clientId, newStatus)

      if (!error && data) {
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
        throw new Error(error || 'Failed to update status')
      }
    } catch (error) {
      logger.error('Failed to update status', { error, clientId, newStatus })
      toast.error('Failed to update status', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handler: Add Note to Client
  const handleAddNote = (client: Client) => {
    logger.info('Add note to client', { clientId: client.id, name: client.name })
    dispatch({ type: 'SELECT_CLIENT', client })
    setNoteText(client.notes || '')
    setIsAddNoteModalOpen(true)
  }

  const saveClientNote = async () => {
    if (!state.selectedClient || !userId) {
      toast.error('Please select a client')
      return
    }

    logger.info('Saving client note', { clientId: state.selectedClient.id })

    try {
      setIsSavingNote(true)

      const { updateClient } = await import('@/lib/clients-queries')

      const { data, error } = await updateClient(userId, state.selectedClient.id, {
        notes: noteText,
        internal_notes: `Note updated on ${new Date().toLocaleString()}`
      })

      if (error || !data) {
        throw new Error(error?.message || 'Failed to save note')
      }

      // Update local state
      const updatedClient = {
        ...state.selectedClient,
        notes: noteText,
        updatedAt: new Date().toISOString()
      }

      dispatch({ type: 'UPDATE_CLIENT', client: updatedClient })
      setIsAddNoteModalOpen(false)
      setNoteText('')

      toast.success('Note saved', {
        description: `Note updated for ${state.selectedClient.name}`
      })
      announce('Note saved successfully', 'polite')
    } catch (error) {
      logger.error('Failed to save note', { error, clientId: state.selectedClient.id })
      toast.error('Failed to save note', {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsSavingNote(false)
    }
  }

  // Handler: View Client History
  const handleViewHistory = async (client: Client) => {
    logger.info('View client history', { clientId: client.id, name: client.name })
    dispatch({ type: 'SELECT_CLIENT', client })
    setIsHistoryModalOpen(true)
    setIsLoadingHistory(true)

    try {
      // Fetch client interactions from API
      const response = await fetch(`/api/clients?id=${client.id}&include_interactions=true`)

      if (!response.ok) {
        throw new Error('Failed to fetch client history')
      }

      const data = await response.json()

      // Transform API interactions to history format
      const apiHistory = (data.client?.recent_interactions || []).map((interaction: any) => ({
        id: interaction.id,
        action: interaction.type === 'call' ? 'Phone Call' :
                interaction.type === 'email' ? 'Email Sent' :
                interaction.type === 'meeting' ? 'Meeting' :
                interaction.type === 'note' ? 'Note Added' :
                interaction.type === 'task' ? 'Task Completed' : 'Activity',
        description: interaction.subject || interaction.description || 'No description',
        timestamp: interaction.completed_at || interaction.created_at,
        user: interaction.user?.name || 'Team Member'
      }))

      // Add base history entries from client data
      const baseHistory = [
        {
          id: `hist-${Date.now()}-1`,
          action: 'Client Created',
          description: `Client profile created for ${client.name}`,
          timestamp: client.createdAt,
          user: 'System'
        },
        ...(client.lastContact ? [{
          id: `hist-${Date.now()}-2`,
          action: 'Last Contact',
          description: `Last contacted via email or phone`,
          timestamp: client.lastContact,
          user: client.assignedTo || 'Team Member'
        }] : []),
        {
          id: `hist-${Date.now()}-3`,
          action: 'Profile Updated',
          description: `Client information was last updated`,
          timestamp: client.updatedAt,
          user: 'System'
        },
        ...(client.status === 'vip' ? [{
          id: `hist-${Date.now()}-4`,
          action: 'Status Changed',
          description: `Client upgraded to VIP status`,
          timestamp: client.updatedAt,
          user: 'Account Manager'
        }] : []),
        ...(client.projects > 0 ? [{
          id: `hist-${Date.now()}-5`,
          action: 'Projects Completed',
          description: `${client.projects} project(s) associated with this client`,
          timestamp: client.updatedAt,
          user: 'Project Team'
        }] : [])
      ]

      // Combine and sort all history entries
      const combinedHistory = [...apiHistory, ...baseHistory]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setClientHistory(combinedHistory)
      toast.success('History loaded')
    } catch (error) {
      logger.error('Failed to fetch client history', { error, clientId: client.id })

      // Fallback to local history data on error
      const fallbackHistory = [
        {
          id: `hist-${Date.now()}-1`,
          action: 'Client Created',
          description: `Client profile created for ${client.name}`,
          timestamp: client.createdAt,
          user: 'System'
        },
        ...(client.lastContact ? [{
          id: `hist-${Date.now()}-2`,
          action: 'Last Contact',
          description: `Last contacted via email or phone`,
          timestamp: client.lastContact,
          user: client.assignedTo || 'Team Member'
        }] : []),
        {
          id: `hist-${Date.now()}-3`,
          action: 'Profile Updated',
          description: `Client information was last updated`,
          timestamp: client.updatedAt,
          user: 'System'
        }
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setClientHistory(fallbackHistory)
      toast.error('Failed to load full history', {
        description: 'Showing basic history instead'
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Handler: Send Email with Dialog
  const handleComposeEmail = (client: Client) => {
    logger.info('Compose email to client', { clientId: client.id, email: client.email })
    dispatch({ type: 'SELECT_CLIENT', client })
    setEmailSubject('')
    setEmailBody('')
    setIsEmailModalOpen(true)
  }

  const sendEmail = async () => {
    if (!state.selectedClient) {
      toast.error('Please select a client')
      return
    }

    if (!emailSubject.trim()) {
      toast.error('Please enter a subject')
      return
    }

    logger.info('Sending email', { clientId: state.selectedClient.id, email: state.selectedClient.email })

    try {
      setIsSendingEmail(true)

      // Open mailto with pre-filled content
      const mailtoUrl = `mailto:${state.selectedClient.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
      window.location.href = mailtoUrl

      // Update last contact
      if (userId) {
        const { updateClient } = await import('@/lib/clients-queries')
        await updateClient(userId, state.selectedClient.id, {
          last_contact: new Date().toISOString()
        })

        const updatedClient = {
          ...state.selectedClient,
          lastContact: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        dispatch({ type: 'UPDATE_CLIENT', client: updatedClient })
      }

      setIsEmailModalOpen(false)
      setEmailSubject('')
      setEmailBody('')

      toast.success('Email client opened', {
        description: `Composing email to ${state.selectedClient.name}`
      })
    } catch (error) {
      logger.error('Failed to compose email', { error })
      toast.error('Failed to open email client')
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Handler: Export as CSV
  const handleExportCSV = async () => {
    logger.info('Export clients as CSV initiated', { count: state.clients.length })

    try {
      // Define CSV headers
      const headers = [
        'ID', 'Name', 'Company', 'Email', 'Phone', 'Location',
        'Status', 'Industry', 'Projects', 'Total Spend', 'Rating',
        'Last Contact', 'Created At', 'Tags'
      ]

      // Convert clients to CSV rows
      const rows = state.clients.map(client => [
        client.id,
        `"${client.name.replace(/"/g, '""')}"`,
        `"${(client.company || '').replace(/"/g, '""')}"`,
        client.email,
        client.phone || '',
        `"${(client.location || '').replace(/"/g, '""')}"`,
        client.status,
        client.industry || '',
        client.projects,
        client.totalSpend,
        client.rating,
        client.lastContact || '',
        client.createdAt,
        `"${(client.tags || []).join(', ')}"`
      ])

      // Build CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)

      logger.info('Clients exported as CSV successfully', { count: state.clients.length })
      toast.success(`${state.clients.length} clients exported as CSV`)
      setIsExportModalOpen(false)
    } catch (error) {
      logger.error('Failed to export clients as CSV', { error })
      toast.error('CSV export failed')
    }
  }

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                              <DropdownMenuItem onClick={() => handleComposeEmail(client)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCallClient(client)}>
                                <Phone className="h-4 w-4 mr-2" />
                                Call Client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAddNote(client)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewHistory(client)}>
                                <Clock className="h-4 w-4 mr-2" />
                                View History
                              </DropdownMenuItem>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-4">
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
              Download your client database in your preferred format
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Export {state.clients.length} clients from your CRM.
            </p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span>Total Clients:</span>
                <span className="font-medium">
                  <NumberFlow value={state.clients.length} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Revenue:</span>
                <span className="font-medium">
                  ${stats.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={handleExportCSV}
              >
                <Download className="h-6 w-6" />
                <span>Export as CSV</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={handleExport}
               aria-label="Export data">
                  <Download className="h-6 w-6" />
                <span>Export as JSON</span>
              </Button>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={(open) => {
        setIsImportModalOpen(open)
        if (!open) {
          setImportFile(null)
          setImportProgress(0)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Clients</DialogTitle>
            <DialogDescription>
              Upload a JSON or CSV file to import clients
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={handleFileSelect}
            >
              {importFile ? (
                <>
                  <FileCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-sm font-medium mb-1">{importFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(importFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                </>
              )}
              <Button variant="outline" size="sm" className="mt-2" onClick={(e) => {
                e.stopPropagation()
                handleFileSelect()
              }}>
                {importFile ? 'Choose Different File' : 'Choose File'}
              </Button>
            </div>
            {isImporting && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Importing...</span>
                  <span>{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                logger.debug('Import canceled')
                setIsImportModalOpen(false)
                setImportFile(null)
              }}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importFile || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {importFile ? `(${importFile.name.endsWith('.csv') ? 'CSV' : 'JSON'})` : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Client Confirmation Dialog */}
      <AlertDialog open={showDeleteClientDialog} onOpenChange={setShowDeleteClientDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Client?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-medium text-red-700">
                This action cannot be undone.
              </p>
              <p>
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {state.clients.find(c => c.id === clientToDelete)?.name}
                </span>
                ? All associated data will be permanently removed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClient}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete {state.selectedClients.length} Client{state.selectedClients.length > 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-medium text-red-700">
                This action cannot be undone.
              </p>
              <p>
                You are about to permanently delete{' '}
                <span className="font-semibold">{state.selectedClients.length}</span>{' '}
                selected client{state.selectedClients.length > 1 ? 's' : ''} and all their associated data.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>All client profiles will be removed</li>
                <li>Project associations will be deleted</li>
                <li>Contact history will be lost</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : `Delete ${state.selectedClients.length} Client${state.selectedClients.length > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Note Modal */}
      <Dialog open={isAddNoteModalOpen} onOpenChange={setIsAddNoteModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Add Note
            </DialogTitle>
            <DialogDescription>
              Add or update notes for {state.selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="client-note">Note</Label>
              <Textarea
                id="client-note"
                placeholder="Enter notes about this client..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {noteText.length} characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddNoteModalOpen(false)
                setNoteText('')
              }}
              disabled={isSavingNote}
            >
              Cancel
            </Button>
            <Button onClick={saveClientNote} disabled={isSavingNote}>
              {isSavingNote ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Note'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Client History
            </DialogTitle>
            <DialogDescription>
              Activity timeline for {state.selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : clientHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No history available for this client</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientHistory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {item.action.includes('Created') && <UserPlus className="h-5 w-5 text-green-500" />}
                        {item.action.includes('Updated') && <Edit2 className="h-5 w-5 text-blue-500" />}
                        {item.action.includes('Contact') && <Phone className="h-5 w-5 text-purple-500" />}
                        {item.action.includes('Status') && <Award className="h-5 w-5 text-yellow-500" />}
                        {item.action.includes('Projects') && <Briefcase className="h-5 w-5 text-indigo-500" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.action}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">By: {item.user}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Compose Email
            </DialogTitle>
            <DialogDescription>
              Send an email to {state.selectedClient?.name} ({state.selectedClient?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                value={state.selectedClient?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject *</Label>
              <Input
                id="email-subject"
                placeholder="Enter email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                placeholder="Type your message here..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEmailModalOpen(false)
                setEmailSubject('')
                setEmailBody('')
              }}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button onClick={sendEmail} disabled={isSendingEmail || !emailSubject.trim()}>
              {isSendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
