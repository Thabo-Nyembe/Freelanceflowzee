'use client'

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useReducer, useMemo } from 'react'
import {
  Users,
  Building2,
  FolderKanban,
  MessageSquare,
  Plus,
  Search,
  Eye,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Client-Portal')

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'

// Premium Components
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ClientStatus = 'active' | 'onboarding' | 'inactive' | 'churned'
type ClientTier = 'basic' | 'standard' | 'premium' | 'enterprise'
type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
type CommunicationType = 'email' | 'call' | 'meeting' | 'message' | 'note'
type ViewMode = 'overview' | 'clients' | 'projects' | 'communications' | 'files'

interface Client {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  status: ClientStatus
  tier: ClientTier
  activeProjects: number
  totalRevenue: number
  healthScore: number
  lastContact: string
  nextFollowUp: string
  tags: string[]
  createdAt: string
}

interface Project {
  id: string
  clientId: string
  name: string
  description: string
  status: ProjectStatus
  budget: number
  spent: number
  progress: number
  startDate: string
  endDate: string
  team: string[]
}

interface Communication {
  id: string
  clientId: string
  type: CommunicationType
  subject: string
  content: string
  createdAt: string
  createdBy: string
}

interface PortalFile {
  id: string
  clientId: string
  name: string
  category: 'contract' | 'invoice' | 'proposal' | 'report' | 'other'
  size: number
  uploadedAt: string
  uploadedBy: string
  version: number
}

interface PortalState {
  clients: Client[]
  projects: Project[]
  communications: Communication[]
  files: PortalFile[]
  selectedClient: Client | null
  selectedProject: Project | null
  viewMode: ViewMode
  searchTerm: string
  filterStatus: ClientStatus | 'all'
  filterTier: ClientTier | 'all'
  sortBy: 'name' | 'revenue' | 'health' | 'recent'
}

type PortalAction =
  | { type: 'SET_CLIENTS'; clients: Client[] }
  | { type: 'SET_PROJECTS'; projects: Project[] }
  | { type: 'SET_COMMUNICATIONS'; communications: Communication[] }
  | { type: 'SET_FILES'; files: PortalFile[] }
  | { type: 'ADD_CLIENT'; client: Client }
  | { type: 'UPDATE_CLIENT'; client: Client }
  | { type: 'DELETE_CLIENT'; clientId: string }
  | { type: 'ADD_PROJECT'; project: Project }
  | { type: 'ADD_COMMUNICATION'; communication: Communication }
  | { type: 'SELECT_CLIENT'; client: Client | null }
  | { type: 'SELECT_PROJECT'; project: Project | null }
  | { type: 'SET_VIEW_MODE'; viewMode: ViewMode }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_STATUS'; filterStatus: PortalState['filterStatus'] }
  | { type: 'SET_FILTER_TIER'; filterTier: PortalState['filterTier'] }
  | { type: 'SET_SORT'; sortBy: PortalState['sortBy'] }

// ============================================================================
// REDUCER
// ============================================================================

function portalReducer(state: PortalState, action: PortalAction): PortalState {
  logger.debug('Reducer action', { type: action.type })

  switch (action.type) {
    case 'SET_CLIENTS':
      logger.info('Setting clients', { count: action.clients.length })
      return { ...state, clients: action.clients }

    case 'SET_PROJECTS':
      logger.info('Setting projects', { count: action.projects.length })
      return { ...state, projects: action.projects }

    case 'SET_COMMUNICATIONS':
      logger.info('Setting communications', { count: action.communications.length })
      return { ...state, communications: action.communications }

    case 'SET_FILES':
      logger.info('Setting files', { count: action.files.length })
      return { ...state, files: action.files }

    case 'ADD_CLIENT':
      logger.info('Client added', { clientId: action.client.id, companyName: action.client.companyName })
      return { ...state, clients: [action.client, ...state.clients] }

    case 'UPDATE_CLIENT':
      logger.info('Client updated', { clientId: action.client.id })
      return {
        ...state,
        clients: state.clients.map(c => c.id === action.client.id ? action.client : c)
      }

    case 'DELETE_CLIENT':
      logger.info('Client deleted', { clientId: action.clientId })
      return {
        ...state,
        clients: state.clients.filter(c => c.id !== action.clientId)
      }

    case 'ADD_PROJECT':
      logger.info('Project added', { projectId: action.project.id, name: action.project.name })
      return { ...state, projects: [action.project, ...state.projects] }

    case 'ADD_COMMUNICATION':
      logger.info('Communication added', { communicationId: action.communication.id })
      return { ...state, communications: [action.communication, ...state.communications] }

    case 'SELECT_CLIENT':
      logger.info('Client selected', { companyName: action.client ? action.client.companyName : null })
      return { ...state, selectedClient: action.client }

    case 'SELECT_PROJECT':
      logger.info('Project selected', { name: action.project ? action.project.name : null })
      return { ...state, selectedProject: action.project }

    case 'SET_VIEW_MODE':
      logger.debug('View mode changed', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'SET_SEARCH':
      logger.debug('Search term changed', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_STATUS':
      logger.debug('Filter status changed', { filterStatus: action.filterStatus })
      return { ...state, filterStatus: action.filterStatus }

    case 'SET_FILTER_TIER':
      logger.debug('Filter tier changed', { filterTier: action.filterTier })
      return { ...state, filterTier: action.filterTier }

    case 'SET_SORT':
      logger.debug('Sort changed', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockClients = (): Client[] => {
  logger.debug('Generating mock clients')

  const companies = [
    'TechCorp Solutions', 'Digital Innovators', 'Cloud Systems Inc', 'Data Dynamics',
    'Smart Solutions Ltd', 'Future Technologies', 'Alpha Enterprises', 'Beta Industries',
    'Gamma Corporation', 'Delta Group', 'Epsilon Systems', 'Zeta Innovations',
    'Eta Digital', 'Theta Tech', 'Iota Solutions', 'Kappa Corporation',
    'Lambda Industries', 'Mu Systems', 'Nu Enterprises', 'Xi Technologies'
  ]

  const contacts = [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
    'David Wilson', 'Jennifer Martinez', 'Robert Anderson', 'Lisa Taylor',
    'James Thomas', 'Mary Jackson', 'Christopher White', 'Patricia Harris'
  ]

  const statuses: ClientStatus[] = ['active', 'onboarding', 'inactive', 'churned']
  const tiers: ClientTier[] = ['basic', 'standard', 'premium', 'enterprise']

  const clients: Client[] = companies.map((company, index) => ({
    id: `CL-${String(index + 1).padStart(3, '0')}`,
    companyName: company,
    contactPerson: contacts[index % contacts.length],
    email: `contact@${company.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    tier: tiers[Math.floor(Math.random() * tiers.length)],
    activeProjects: Math.floor(Math.random() * 5) + 1,
    totalRevenue: Math.floor(Math.random() * 500000) + 50000,
    healthScore: Math.floor(Math.random() * 30) + 70,
    lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextFollowUp: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['priority', 'enterprise', 'growth'].slice(0, Math.floor(Math.random() * 3) + 1),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  }))

  logger.info('Generated mock clients', { count: clients.length })
  return clients
}

const generateMockProjects = (clients: Client[]): Project[] => {
  logger.debug('Generating mock projects')

  const projectNames = [
    'Website Redesign', 'Mobile App Development', 'Cloud Migration', 'API Integration',
    'Data Analytics Platform', 'CRM Implementation', 'E-commerce Solution', 'Brand Identity',
    'Marketing Campaign', 'Security Audit', 'Performance Optimization', 'DevOps Setup'
  ]

  const statuses: ProjectStatus[] = ['planning', 'active', 'on-hold', 'completed', 'cancelled']

  const projects: Project[] = projectNames.map((name, index) => {
    const client = clients[index % clients.length]
    const budget = Math.floor(Math.random() * 200000) + 50000
    const spent = Math.floor(budget * (Math.random() * 0.8))

    return {
      id: `PR-${String(index + 1).padStart(3, '0')}`,
      clientId: client.id,
      name,
      description: `${name} project for ${client.companyName}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      budget,
      spent,
      progress: Math.floor(Math.random() * 100),
      startDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      team: ['John Doe', 'Jane Smith', 'Bob Johnson'].slice(0, Math.floor(Math.random() * 3) + 1)
    }
  })

  logger.info('Generated mock projects', { count: projects.length })
  return projects
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClientPortalPage() {
  logger.debug('Component mounting')

  // A+++ UTILITIES
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // STATE
  const [state, dispatch] = useReducer(portalReducer, {
    clients: [],
    projects: [],
    communications: [],
    files: [],
    selectedClient: null,
    selectedProject: null,
    viewMode: 'overview',
    searchTerm: '',
    filterStatus: 'all',
    filterTier: 'all',
    sortBy: 'recent'
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // MODALS
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
  const [isViewClientModalOpen, setIsViewClientModalOpen] = useState(false)
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false)
  const [isAddCommunicationModalOpen, setIsAddCommunicationModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // FORM STATES
  const [clientForm, setClientForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    tier: 'basic' as ClientTier
  })

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    budget: '',
    clientId: ''
  })

  const [communicationForm, setCommunicationForm] = useState({
    type: 'email' as CommunicationType,
    subject: '',
    content: ''
  })

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    logger.info('Loading portal data from API')

    const loadData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list' })
        })

        const result = await response.json()

        if (result.success) {
          // Use mock data for richer visualization
          const clients = generateMockClients()
          const projects = generateMockProjects(clients)

          dispatch({ type: 'SET_CLIENTS', clients })
          dispatch({ type: 'SET_PROJECTS', projects })

          logger.info('Data loaded from API', {
            clientsCount: result.clients?.length || 0,
            projectsCount: result.projects?.length || 0
          })
          announce('Client portal loaded', 'polite')
        } else {
          throw new Error(result.error || 'Failed to load clients')
        }
      } catch (error) {
        logger.error('Portal data load error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorObject: error
        })
        toast.error('Failed to load client portal data', {
          description: error.message || 'Please try again later'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    const totalClients = state.clients.length
    const activeClients = state.clients.filter(c => c.status === 'active').length
    const totalRevenue = state.clients.reduce((sum, c) => sum + c.totalRevenue, 0)
    const avgHealthScore = state.clients.reduce((sum, c) => sum + c.healthScore, 0) / totalClients || 0
    const totalProjects = state.projects.length
    const activeProjects = state.projects.filter(p => p.status === 'active').length

    const result = {
      totalClients,
      activeClients,
      totalRevenue,
      avgHealthScore,
      totalProjects,
      activeProjects
    }

    logger.debug('Stats calculated', result)
    return result
  }, [state.clients, state.projects])

  const filteredAndSortedClients = useMemo(() => {
    logger.debug('Filtering and sorting clients', {
      searchTerm: state.searchTerm,
      filterStatus: state.filterStatus,
      filterTier: state.filterTier,
      sortBy: state.sortBy,
      totalClients: state.clients.length
    })

    let filtered = [...state.clients]

    // Search
    if (state.searchTerm) {
      filtered = filtered.filter(c =>
        c.companyName.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(state.searchTerm.toLowerCase())
      )
      logger.debug('Search filter applied', { resultCount: filtered.length })
    }

    // Filter by status
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === state.filterStatus)
      logger.debug('Status filter applied', { status: state.filterStatus, resultCount: filtered.length })
    }

    // Filter by tier
    if (state.filterTier !== 'all') {
      filtered = filtered.filter(c => c.tier === state.filterTier)
      logger.debug('Tier filter applied', { tier: state.filterTier, resultCount: filtered.length })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.companyName.localeCompare(b.companyName)
        case 'revenue':
          return b.totalRevenue - a.totalRevenue
        case 'health':
          return b.healthScore - a.healthScore
        case 'recent':
          return new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()
        default:
          return 0
      }
    })

    logger.debug('Filtering and sorting complete', { finalCount: filtered.length })
    return filtered
  }, [state.clients, state.searchTerm, state.filterStatus, state.filterTier, state.sortBy])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddClient = async () => {
    if (!clientForm.companyName || !clientForm.contactPerson || !clientForm.email) {
      logger.warn('Client creation failed', { reason: 'Missing required fields' })
      toast.error('Please fill in all required fields')
      return
    }

    logger.info('Adding new client via API', {
      companyName: clientForm.companyName,
      contactPerson: clientForm.contactPerson,
      tier: clientForm.tier
    })

    try {
      setIsSaving(true)

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            name: clientForm.contactPerson,
            company: clientForm.companyName,
            email: clientForm.email,
            phone: clientForm.phone,
            status: 'active',
            tags: []
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        const newClient: Client = {
          id: result.client.id,
          companyName: clientForm.companyName,
          contactPerson: clientForm.contactPerson,
          email: clientForm.email,
          phone: clientForm.phone,
          status: 'onboarding',
          tier: clientForm.tier,
          activeProjects: 0,
          totalRevenue: 0,
          healthScore: 85,
          lastContact: new Date().toISOString(),
          nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          tags: [],
          createdAt: new Date().toISOString()
        }

        dispatch({ type: 'ADD_CLIENT', client: newClient })

        logger.info('Client added successfully', {
          clientId: result.client.id,
          companyName: clientForm.companyName
        })

        const followUpDate = new Date(newClient.nextFollowUp).toLocaleDateString()

        toast.success('Client added successfully', {
          description: `${clientForm.companyName} - ${clientForm.tier} tier - ${clientForm.contactPerson} - Health: 85% - Follow-up: ${followUpDate}`
        })
        setIsAddClientModalOpen(false)
        setClientForm({ companyName: '', contactPerson: '', email: '', phone: '', tier: 'basic' })
      } else {
        throw new Error(result.error || 'Failed to add client')
      }
    } catch (error) {
      logger.error('Client creation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error,
        companyName: clientForm.companyName
      })
      toast.error('Failed to add client', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    const client = state.clients.find(c => c.id === clientId)

    logger.info('Deleting client via API', {
      clientId,
      companyName: client?.companyName,
      activeProjects: client?.activeProjects
    })

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

        logger.info('Client deleted successfully', { clientId })

        const revenueLost = client?.totalRevenue || 0

        toast.success('Client deleted successfully', {
          description: `${client?.companyName || 'Client'} - ${client?.tier || 'basic'} tier - ${client?.activeProjects || 0} projects - $${revenueLost.toLocaleString()} total revenue`
        })
        setIsDeleteModalOpen(false)
      } else {
        throw new Error(result.error || 'Failed to delete client')
      }
    } catch (error) {
      logger.error('Client deletion error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error,
        clientId
      })
      toast.error('Failed to delete client', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleAddProject = async () => {
    if (!projectForm.name || !projectForm.clientId) {
      logger.warn('Project creation failed', { reason: 'Missing required fields' })
      toast.error('Please fill in all required fields')
      return
    }

    if (!userId) {
      toast.error('Please log in to add projects')
      return
    }

    const client = state.clients.find(c => c.id === projectForm.clientId)

    logger.info('Adding new project', {
      projectName: projectForm.name,
      clientId: projectForm.clientId,
      companyName: client?.companyName,
      userId
    })

    try {
      setIsSaving(true)

      // Dynamic import for code splitting
      const { createProject } = await import('@/lib/client-portal-queries')

      const budget = parseInt(projectForm.budget) || 50000
      const startDate = new Date().toISOString()
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

      const createdProject = await createProject({
        client_id: projectForm.clientId,
        name: projectForm.name,
        description: projectForm.description,
        budget,
        start_date: startDate,
        end_date: endDate,
        deadline: endDate
      })

      const newProject: Project = {
        id: createdProject.id,
        clientId: projectForm.clientId,
        name: projectForm.name,
        description: projectForm.description,
        status: 'planning',
        budget,
        spent: 0,
        progress: 0,
        startDate,
        endDate,
        team: []
      }

      dispatch({ type: 'ADD_PROJECT', project: newProject })

      logger.info('Project added to database', {
        projectId: newProject.id,
        name: newProject.name,
        userId
      })

      const endDateFormatted = new Date(newProject.endDate).toLocaleDateString()

      toast.success('Project added successfully', {
        description: `${projectForm.name} - ${client?.companyName} - Planning stage - Budget: $${budget.toLocaleString()} - Due: ${endDateFormatted}`
      })
      announce('Project added successfully', 'polite')
      setIsAddProjectModalOpen(false)
      setProjectForm({ name: '', description: '', budget: '', clientId: '' })
    } catch (error) {
      logger.error('Project creation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error,
        projectName: projectForm.name,
        userId
      })
      toast.error('Failed to add project', {
        description: error.message || 'Please try again later'
      })
      announce('Error adding project', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCommunication = async () => {
    if (!communicationForm.subject || !state.selectedClient) {
      logger.warn('Communication creation failed', { reason: 'Missing required fields' })
      toast.error('Please fill in all required fields')
      return
    }

    logger.info('Adding communication', {
      clientId: state.selectedClient.id,
      companyName: state.selectedClient.companyName,
      type: communicationForm.type,
      subject: communicationForm.subject
    })

    try {
      setIsSaving(true)

      let commId = `CM-${String(state.communications.length + 1).padStart(3, '0')}`

      // Create communication in database
      if (userId) {
        const { createCommunication } = await import('@/lib/client-portal-queries')
        const createdComm = await createCommunication({
          client_id: state.selectedClient.id,
          type: communicationForm.type,
          subject: communicationForm.subject,
          content: communicationForm.content,
          created_by: userId
        })
        if (createdComm?.id) {
          commId = createdComm.id
        }
        logger.info('Communication created in database', { commId, clientId: state.selectedClient.id })
      }

      const newComm: Communication = {
        id: commId,
        clientId: state.selectedClient.id,
        type: communicationForm.type,
        subject: communicationForm.subject,
        content: communicationForm.content,
        createdAt: new Date().toISOString(),
        createdBy: userId || 'Current User'
      }

      dispatch({ type: 'ADD_COMMUNICATION', communication: newComm })

      logger.info('Communication added successfully', { communicationId: newComm.id, type: newComm.type })

      const timestamp = new Date(newComm.createdAt).toLocaleString()

      toast.success('Communication logged successfully', {
        description: `${state.selectedClient.companyName} - ${communicationForm.type} - ${communicationForm.subject} - ${timestamp}`
      })
      setIsAddCommunicationModalOpen(false)
      setCommunicationForm({ type: 'email', subject: '', content: '' })
    } catch (error) {
      logger.error('Communication creation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error,
        subject: communicationForm.subject
      })
      toast.error('Failed to log communication', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500'
      case 'onboarding': return 'bg-blue-500/10 text-blue-500'
      case 'inactive': return 'bg-gray-500/10 text-gray-500'
      case 'churned': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getTierColor = (tier: ClientTier) => {
    switch (tier) {
      case 'basic': return 'bg-gray-500/10 text-gray-500'
      case 'standard': return 'bg-blue-500/10 text-blue-500'
      case 'premium': return 'bg-purple-500/10 text-purple-500'
      case 'enterprise': return 'bg-orange-500/10 text-orange-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getProjectStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'planning': return 'bg-yellow-500/10 text-yellow-500'
      case 'active': return 'bg-green-500/10 text-green-500'
      case 'on-hold': return 'bg-orange-500/10 text-orange-500'
      case 'completed': return 'bg-blue-500/10 text-blue-500'
      case 'cancelled': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
        <div className="container mx-auto px-4 space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
                  <TextShimmer>Client Portal</TextShimmer>
                </h1>
                <p className="text-muted-foreground text-sm">
                  Comprehensive client management and collaboration
                </p>
              </div>
            </div>
            <Button onClick={() => setIsAddClientModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </ScrollReveal>

        {/* View Mode Tabs */}
        <ScrollReveal>
          <LiquidGlassCard className="p-2">
            <div className="flex items-center gap-2">
              <Button
                variant={state.viewMode === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'overview' })}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={state.viewMode === 'clients' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'clients' })}
              >
                <Users className="h-4 w-4 mr-2" />
                Clients
              </Button>
              <Button
                variant={state.viewMode === 'projects' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'projects' })}
              >
                <FolderKanban className="h-4 w-4 mr-2" />
                Projects
              </Button>
              <Button
                variant={state.viewMode === 'communications' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', viewMode: 'communications' })}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Communications
              </Button>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Overview View */}
        {state.viewMode === 'overview' && (
          <>
            {/* Stats Dashboard */}
            <ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LiquidGlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Clients</p>
                      <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                        <NumberFlow value={stats.totalClients} />
                      </p>
                    </div>
                    <div className="relative">
                      
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Clients</p>
                      <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                        <NumberFlow value={stats.activeClients} />
                      </p>
                    </div>
                    <div className="relative">
                      
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                        {formatCurrency(stats.totalRevenue)}
                      </p>
                    </div>
                    <div className="relative">
                      
                      <DollarSign className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Health Score</p>
                      <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                        {stats.avgHealthScore.toFixed(0)}%
                      </p>
                    </div>
                    <div className="relative">
                      
                      <Award className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </LiquidGlassCard>
              </div>
            </ScrollReveal>

            {/* Top Clients */}
            <ScrollReveal>
              <LiquidGlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Clients by Revenue</h3>
                <div className="space-y-3">
                  {filteredAndSortedClients.slice(0, 5).map((client, index) => (
                    <div key={client.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{client.companyName}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(client.totalRevenue)}</p>
                      </div>
                      <Badge className={getTierColor(client.tier)}>{client.tier}</Badge>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>
            </ScrollReveal>
          </>
        )}

        {/* Clients View */}
        {state.viewMode === 'clients' && (
          <>
            {/* Filters */}
            <ScrollReveal>
              <LiquidGlassCard className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients..."
                      value={state.searchTerm}
                      onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                      className="pl-9"
                    />
                  </div>

                  <Select
                    value={state.filterStatus}
                    onValueChange={(value) => dispatch({ type: 'SET_FILTER_STATUS', filterStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={state.filterTier}
                    onValueChange={(value) => dispatch({ type: 'SET_FILTER_TIER', filterTier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={state.sortBy}
                    onValueChange={(value) => dispatch({ type: 'SET_SORT', sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="health">Health Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>

            {/* Clients Grid */}
            {filteredAndSortedClients.length === 0 ? (
              <ScrollReveal>
                <NoDataEmptyState
                  title="No clients found"
                  message="Add clients or adjust your filters"
                  action={{
                    label: 'Add Client',
                    onClick: () => setIsAddClientModalOpen(true)
                  }}
                />
              </ScrollReveal>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedClients.map((client, index) => (
                  <ScrollReveal key={client.id} delay={index * 0.05}>
                    <LiquidGlassCard className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                              {client.companyName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{client.companyName}</h3>
                              <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                dispatch({ type: 'SELECT_CLIENT', client })
                                setIsViewClientModalOpen(true)
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                dispatch({ type: 'SELECT_CLIENT', client })
                                setIsAddCommunicationModalOpen(true)
                              }}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Communication
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  dispatch({ type: 'SELECT_CLIENT', client })
                                  setIsDeleteModalOpen(true)
                                }}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(client.status)}>
                            {client.status}
                          </Badge>
                          <Badge className={getTierColor(client.tier)}>
                            {client.tier}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 text-center">
                          <div>
                            <p className="text-xl font-bold text-blue-500">{client.activeProjects}</p>
                            <p className="text-xs text-muted-foreground">Projects</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-green-500">
                              {formatCurrency(client.totalRevenue).replace(/\.\d+$/, '')}
                            </p>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                          </div>
                          <div>
                            <p className={`text-xl font-bold ${getHealthScoreColor(client.healthScore)}`}>
                              {client.healthScore}%
                            </p>
                            <p className="text-xs text-muted-foreground">Health</p>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone}</span>
                          </div>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </>
        )}

        {/* Projects View */}
        {state.viewMode === 'projects' && (
          <>
            <ScrollReveal>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Projects</h2>
                <Button onClick={() => setIsAddProjectModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {state.projects.map((project, index) => {
                const client = state.clients.find(c => c.id === project.clientId)
                const budgetUsed = (project.spent / project.budget) * 100

                return (
                  <ScrollReveal key={project.id} delay={index * 0.05}>
                    <LiquidGlassCard className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {client?.companyName} • {project.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm mb-4">
                            <Badge className={getProjectStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <span className="text-muted-foreground">
                              Budget: {formatCurrency(project.budget)}
                            </span>
                            <span className={budgetUsed > 90 ? 'text-red-500' : budgetUsed > 70 ? 'text-yellow-500' : 'text-green-500'}>
                              Spent: {formatCurrency(project.spent)} ({budgetUsed.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <p className="text-3xl font-bold text-blue-500">{project.progress}%</p>
                          <p className="text-sm text-muted-foreground">Complete</p>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </ScrollReveal>
                )
              })}
            </div>
          </>
        )}

        {/* Communications View */}
        {state.viewMode === 'communications' && (
          <>
            <ScrollReveal>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Communications</h2>
              </div>
            </ScrollReveal>

            {state.communications.length === 0 ? (
              <NoDataEmptyState
                title="No communications"
                message="Communication logs will appear here"
              />
            ) : (
              <div className="space-y-4">
                {state.communications.map((comm, index) => {
                  const client = state.clients.find(c => c.id === comm.clientId)

                  return (
                    <ScrollReveal key={comm.id} delay={index * 0.05}>
                      <LiquidGlassCard className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{comm.subject}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {client?.companyName} • {formatDate(comm.createdAt)} • {comm.type}
                            </p>
                            <p className="text-sm">{comm.content}</p>
                          </div>
                        </div>
                      </LiquidGlassCard>
                    </ScrollReveal>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Add Client Modal */}
        <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Add a new client to your portal
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={clientForm.companyName}
                  onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                  placeholder="Acme Corporation"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Contact Person *</Label>
                <Input
                  value={clientForm.contactPerson}
                  onChange={(e) => setClientForm({ ...clientForm, contactPerson: e.target.value })}
                  placeholder="John Smith"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="john@acme.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Tier</Label>
                <Select value={clientForm.tier} onValueChange={(v) => setClientForm({ ...clientForm, tier: v as ClientTier })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddClientModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClient} disabled={isSaving}>
                {isSaving ? 'Adding...' : 'Add Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Client Modal */}
        <Dialog open={isViewClientModalOpen} onOpenChange={setIsViewClientModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
            </DialogHeader>

            {state.selectedClient && (
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <Label className="text-xs text-muted-foreground">Company</Label>
                      <p className="text-sm font-medium mt-1">{state.selectedClient.companyName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Contact</Label>
                      <p className="text-sm font-medium mt-1">{state.selectedClient.contactPerson}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm font-medium mt-1">{state.selectedClient.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="text-sm font-medium mt-1">{state.selectedClient.phone}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Badge className={`${getStatusColor(state.selectedClient.status)} mt-1`}>
                        {state.selectedClient.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Tier</Label>
                      <Badge className={`${getTierColor(state.selectedClient.tier)} mt-1`}>
                        {state.selectedClient.tier}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Active Projects</Label>
                      <p className="text-sm font-medium mt-1">{state.selectedClient.activeProjects}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Revenue</Label>
                      <p className="text-sm font-medium mt-1">{formatCurrency(state.selectedClient.totalRevenue)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Health Score</Label>
                      <p className={`text-sm font-medium mt-1 ${getHealthScoreColor(state.selectedClient.healthScore)}`}>
                        {state.selectedClient.healthScore}%
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Last Contact</Label>
                      <p className="text-sm font-medium mt-1">{formatDate(state.selectedClient.lastContact)}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="space-y-3">
                  {state.projects
                    .filter(p => p.clientId === state.selectedClient?.id)
                    .map(project => (
                      <div key={project.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>
                          <Badge className={getProjectStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="activity" className="space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted rounded">
                      <Calendar className="h-4 w-4 mt-1 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Client created</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(state.selectedClient.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted rounded">
                      <MessageSquare className="h-4 w-4 mt-1 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Last contact</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(state.selectedClient.lastContact)}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Project Modal */}
        <Dialog open={isAddProjectModalOpen} onOpenChange={setIsAddProjectModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Create a new project for a client
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Client *</Label>
                <Select value={projectForm.clientId} onValueChange={(v) => setProjectForm({ ...projectForm, clientId: v })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Project Name *</Label>
                <Input
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="Website Redesign"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Project description..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Budget</Label>
                <Input
                  type="number"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  placeholder="50000"
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddProjectModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProject} disabled={isSaving}>
                {isSaving ? 'Adding...' : 'Add Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Communication Modal */}
        <Dialog open={isAddCommunicationModalOpen} onOpenChange={setIsAddCommunicationModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Communication</DialogTitle>
              <DialogDescription>
                Record communication with {state.selectedClient?.companyName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={communicationForm.type}
                  onValueChange={(v) => setCommunicationForm({ ...communicationForm, type: v as CommunicationType })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subject *</Label>
                <Input
                  value={communicationForm.subject}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, subject: e.target.value })}
                  placeholder="Follow-up call"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  value={communicationForm.content}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, content: e.target.value })}
                  placeholder="Details of the communication..."
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCommunicationModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCommunication} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Log Communication'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Client</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {state.selectedClient?.companyName}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => state.selectedClient && handleDeleteClient(state.selectedClient.id)}
              >
                Delete Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
