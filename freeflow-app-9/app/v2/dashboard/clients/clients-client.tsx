// Clients V2 - Salesforce Level CRM Platform
// Comprehensive client relationship management with pipeline, deals, and activities
'use client'

import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClients } from '@/lib/hooks/use-clients'
import { useDeals } from '@/lib/hooks/use-deals'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'
import {
  Users,
  Sparkles,
  Plus,
  Search,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Settings,
  Building2,
  UserPlus,
  Trash2,
  Edit,
  Calendar,
  Clock,
  CheckCircle2,
  MoreVertical,
  MapPin,
  Globe,
  FileText,
  Briefcase,
  Target,
  Activity,
  BarChart3,
  Zap,
  Handshake,
  LayoutGrid,
  List,
  AlertCircle,
  PhoneCall,
  Video,
  CalendarClock,
  UserCheck,
  Building,
  Link2,
  Bell,
  Download,
  Upload,
  RefreshCw,
  Loader2
} from 'lucide-react'

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

// Import mock data from centralized adapters



// Types
type ClientStatus = 'lead' | 'prospect' | 'opportunity' | 'customer' | 'churned' | 'inactive'
type DealStage = 'qualification' | 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  title: string
  department?: string
  isPrimary: boolean
  avatar?: string
  linkedin?: string
  lastContact?: string
}

interface Client {
  id: string
  name: string
  company: string
  industry: string
  website?: string
  status: ClientStatus
  contacts: Contact[]
  primaryContact: Contact
  revenue: number
  lifetime_value: number
  projects: number
  health_score: number
  nps?: number
  createdAt: string
  lastActivity: string
  tags: string[]
  address: {
    city: string
    state: string
    country: string
  }
  owner: string
  team: string[]
  source: string
  deals: Deal[]
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface Deal {
  id: string
  name: string
  value: number
  stage: DealStage
  probability: number
  expectedClose: string
  createdAt: string
  owner: string
  products: string[]
  notes?: string
}

interface Activity {
  id: string
  clientId: string
  type: ActivityType
  title: string
  description: string
  createdAt: string
  createdBy: string
  completed: boolean
  dueDate?: string
  priority?: Priority
  outcome?: string
}

interface Task {
  id: string
  clientId: string
  title: string
  description?: string
  dueDate: string
  priority: Priority
  assignee: string
  completed: boolean
  createdAt: string
}

// Mock data
// Mock data removed
const mockClients: Client[] = []
const mockActivities: Activity[] = []
const mockTasks: Task[] = []

// Mock data removed - using real data from hooks

// Helper functions
const getStatusColor = (status: ClientStatus): string => {
  const colors: Record<ClientStatus, string> = {
    lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    prospect: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    opportunity: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    customer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    churned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return colors[status]
}

const getStageColor = (stage: DealStage): string => {
  const colors: Record<DealStage, string> = {
    qualification: 'bg-blue-100 text-blue-700',
    discovery: 'bg-purple-100 text-purple-700',
    proposal: 'bg-amber-100 text-amber-700',
    negotiation: 'bg-orange-100 text-orange-700',
    closed_won: 'bg-green-100 text-green-700',
    closed_lost: 'bg-red-100 text-red-700'
  }
  return colors[stage]
}

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  }
  return colors[priority]
}

const getTierColor = (tier: Client['tier']): string => {
  const colors = {
    bronze: 'bg-amber-700 text-white',
    silver: 'bg-gray-400 text-white',
    gold: 'bg-yellow-500 text-white',
    platinum: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
  }
  return colors[tier]
}

const getHealthColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

interface ClientsClientProps {
  initialClients?: any[]
  initialStats?: any
}

// Enhanced Competitive Upgrade Mock Data
// Enhanced Competitive Upgrade Components - Placeholders if needed, or remove completely if unused.
// Leaving empty arrays for now to avoid breaking imports if they are used elsewhere in this file.
const mockClientsAIInsights: any[] = []
const mockClientsCollaborators: any[] = []
const mockClientsPredictions: any[] = []
const mockClientsActivities: any[] = []

// Quick actions will be defined inside the component to access state setters

export default function ClientsClient({ initialClients, initialStats }: ClientsClientProps) {
  const [activeTab, setActiveTab] = useState('clients')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [showScheduleCallDialog, setShowScheduleCallDialog] = useState(false)
  const [showSendReportDialog, setShowSendReportDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLogActivityDialog, setShowLogActivityDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showAddCustomFieldDialog, setShowAddCustomFieldDialog] = useState(false)
  const [showEditStageDialog, setShowEditStageDialog] = useState(false)
  const [showAddStageDialog, setShowAddStageDialog] = useState(false)
  const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [showCreateSequenceDialog, setShowCreateSequenceDialog] = useState(false)
  const [showAppMarketplaceDialog, setShowAppMarketplaceDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showImportDataDialog, setShowImportDataDialog] = useState(false)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [showAuditLogDialog, setShowAuditLogDialog] = useState(false)
  const [showDeleteActivitiesDialog, setShowDeleteActivitiesDialog] = useState(false)
  const [showMergeDuplicatesDialog, setShowMergeDuplicatesDialog] = useState(false)
  const [showResetCrmDialog, setShowResetCrmDialog] = useState(false)
  const [showClientActionsMenu, setShowClientActionsMenu] = useState<string | null>(null)
  const [selectedStageForEdit, setSelectedStageForEdit] = useState<string | null>(null)

  // Database integration - use real clients hook
  const { clients: dbClients, fetchClients, createClient, updateClient, deleteClient, archiveClient, isLoading: clientsLoading } = useClients()

  // Deals module integration
  const { createDeal, deals: dbDeals, loading: dealsLoading } = useDeals()

  // State for deal creation dialog
  const [showDealDialog, setShowDealDialog] = useState(false)
  const [dealForm, setDealForm] = useState({
    title: '',
    value: '',
    stage: 'lead' as 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost',
    probability: 25,
    expectedCloseDate: '',
    description: ''
  })

  // State for meeting scheduling dialog
  const [showMeetingDialog, setShowMeetingDialog] = useState(false)
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    location: 'Video Call',
    notes: ''
  })

  // Form state for new client
  const [newClientForm, setNewClientForm] = useState({
    company: '',
    industry: 'Technology',
    website: '',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    status: 'prospect' as 'active' | 'inactive' | 'prospect' | 'archived'
  })

  // Form state for editing client
  const [editClientForm, setEditClientForm] = useState({
    id: '',
    company: '',
    industry: 'Technology',
    website: '',
    contactName: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'prospect' | 'archived'
  })

  // Fetch clients on mount
  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // Handle creating a new client
  const handleCreateClient = async () => {
    if (!newClientForm.company || !newClientForm.contactName || !newClientForm.email) {
      toast.error('Please fill in company name, contact name, and email')
      return
    }
    setIsSubmitting(true)
    try {
      await createClient({
        name: newClientForm.contactName,
        email: newClientForm.email,
        phone: newClientForm.phone || null,
        company: newClientForm.company,
        website: newClientForm.website || null,
        industry: newClientForm.industry,
        status: newClientForm.status
      } as any)
      setShowAddDialog(false)
      setNewClientForm({
        company: '',
        industry: 'Technology',
        website: '',
        contactName: '',
        contactTitle: '',
        email: '',
        phone: '',
        status: 'prospect'
      })
    } catch (error) {
      console.error('Failed to create client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle editing a client
  const handleEditClient = async () => {
    if (!editClientForm.id || !editClientForm.company || !editClientForm.contactName || !editClientForm.email) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsSubmitting(true)
    try {
      await updateClient(editClientForm.id, {
        name: editClientForm.contactName,
        email: editClientForm.email,
        phone: editClientForm.phone || null,
        company: editClientForm.company,
        website: editClientForm.website || null,
        industry: editClientForm.industry,
        status: editClientForm.status
      } as any)
      setShowEditDialog(false)
      setSelectedClient(null)
      setEditClientForm({
        id: '',
        company: '',
        industry: 'Technology',
        website: '',
        contactName: '',
        email: '',
        phone: '',
        status: 'active'
      })
    } catch (error) {
      console.error('Failed to update client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit dialog with client data
  const openEditDialog = (client: any) => {
    // Handle both mock and database client format
    const dbClient = dbClients.find(c => c.id === client.id)
    if (dbClient) {
      setEditClientForm({
        id: dbClient.id,
        company: dbClient.company || '',
        industry: dbClient.industry || 'Technology',
        website: dbClient.website || '',
        contactName: dbClient.name || '',
        email: dbClient.email || '',
        phone: dbClient.phone || '',
        status: dbClient.status === 'lead' || dbClient.status === 'prospect' || dbClient.status === 'churned' || dbClient.status === 'inactive' ? dbClient.status as any : 'active'
      })
      setShowEditDialog(true)
    }
    setShowEditDialog(true)
  }

  // Handle deleting a client
  const handleDeleteClient = async () => {
    if (!clientToDelete) return
    setIsSubmitting(true)
    try {
      await deleteClient(clientToDelete)
      setShowDeleteConfirm(false)
      setClientToDelete(null)
      setSelectedClient(null)
    } catch (error) {
      console.error('Failed to delete client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle archiving a client
  const handleArchiveClient = async (clientId: string) => {
    setIsSubmitting(true)
    try {
      await archiveClient(clientId)
      setSelectedClient(null)
    } catch (error) {
      console.error('Failed to archive client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete dialog
  const confirmDeleteClient = (clientId: string) => {
    setClientToDelete(clientId)
    setShowDeleteConfirm(true)
  }

  // Filter clients - combine mock and database clients
  const filteredClients = useMemo(() => {
    // Transform database clients to display format
    const dbClientsTransformed = dbClients.map(c => ({
      id: c.id,
      name: c.name,
      company: c.company || c.name,
      industry: c.industry || 'Other',
      website: c.website,
      status: c.status === 'active' ? 'customer' as ClientStatus : (c.status as ClientStatus) || 'prospect',
      contacts: [{
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || undefined,
        title: 'Primary Contact',
        isPrimary: true
      }],
      primaryContact: {
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || undefined,
        title: 'Primary Contact',
        isPrimary: true
      },
      revenue: c.total_revenue || 0,
      lifetime_value: c.lifetime_value || 0,
      projects: c.projects_count || 0,
      health_score: c.health_score || 50,
      nps: c.satisfaction_score || 0,
      createdAt: c.created_at,
      lastActivity: c.last_activity_at || c.updated_at,
      tags: c.tags || [],
      address: {
        city: c.city || '',
        state: c.state || '',
        country: c.country || ''
      },
      owner: 'You',
      team: [],
      source: 'Direct',
      deals: [],
      tier: (c.total_revenue || 0) >= 100000 ? 'platinum' as const :
        (c.total_revenue || 0) >= 50000 ? 'gold' as const :
          (c.total_revenue || 0) >= 10000 ? 'silver' as const : 'bronze' as const,
      isFromDatabase: true
    }))

    // Use only database clients. Mock data removed for production.
    let result = [...dbClientsTransformed]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query) ||
        client.primaryContact.email.toLowerCase().includes(query) ||
        client.industry.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(client => client.status === statusFilter)
    }

    return result
  }, [searchQuery, statusFilter, dbClients])

  // Calculate stats including database clients
  const stats = useMemo(() => {
    const allClients = [...filteredClients]
    const customers = allClients.filter(c => c.status === 'customer')
    // Use combined filteredClients data for all stats
    const allDealsFromClients = allClients.flatMap(c => c.deals || [])
    const openDealsList = allDealsFromClients.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
    return {
      totalClients: allClients.length,
      totalCustomers: customers.length,
      totalRevenue: allClients.reduce((sum, c) => sum + (c.revenue || 0), 0),
      totalLTV: allClients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0),
      avgHealthScore: customers.length > 0 ? customers.reduce((sum, c) => sum + (c.health_score || 0), 0) / customers.length : 0,
      pipelineValue: openDealsList.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0),
      openDeals: openDealsList.length,
      // Use only real deals from clients that have them
      pendingTasks: 0 // TODO: Wire up real tasks
    }
  }, [filteredClients])

  // Pipeline stages for kanban
  const pipelineStages: { stage: DealStage; label: string; color: string }[] = [
    { stage: 'qualification', label: 'Qualification', color: 'blue' },
    { stage: 'discovery', label: 'Discovery', color: 'purple' },
    { stage: 'proposal', label: 'Proposal', color: 'amber' },
    { stage: 'negotiation', label: 'Negotiation', color: 'orange' },
    { stage: 'closed_won', label: 'Won', color: 'green' },
  ]

  // Use filteredClients (combined db + mock) for deals aggregation
  const allDeals = useMemo(() =>
    filteredClients.flatMap(c => (c.deals || []).map(d => ({ ...d, clientName: c.name, clientId: c.id })))
    , [filteredClients])

  // Handlers
  const handleExportClients = () => {
    // Export clients to CSV
    const exportData = filteredClients.map(c => ({
      Company: c.company,
      Contact: c.primaryContact.name,
      Email: c.primaryContact.email,
      Phone: c.primaryContact.phone || '',
      Industry: c.industry,
      Status: c.status,
      Revenue: c.revenue,
      Projects: c.projects
    }))
    const csv = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export completed - clients exported to CSV')
  }

  const handleCreateDeal = (client: Client) => {
    setSelectedClient(client)
    setDealForm({
      title: `Deal with ${client.company}`,
      value: '',
      stage: 'lead',
      probability: 25,
      expectedCloseDate: '',
      description: ''
    })
    setShowDealDialog(true)
  }

  // Submit deal creation - integrated with useDeals hook
  const handleSubmitDeal = async () => {
    if (!dealForm.title || !dealForm.value || !selectedClient) {
      toast.error('Please fill in deal title and value')
      return
    }
    try {
      await toast.promise(
        createDeal({
          client_id: selectedClient.id,
          title: dealForm.title,
          value: parseFloat(dealForm.value),
          stage: dealForm.stage,
          probability: dealForm.probability,
          expected_close_date: dealForm.expectedCloseDate || null,
          description: dealForm.description || null
        }),
        {
          loading: `Creating deal for ${selectedClient.company}...`,
          success: `Deal "${dealForm.title}" created successfully`,
          error: 'Failed to create deal'
        }
      )
      setShowDealDialog(false)
      setDealForm({ title: '', value: '', stage: 'lead', probability: 25, expectedCloseDate: '', description: '' })
    } catch (error) {
      console.error('Failed to create deal:', error)
    }
  }

  const handleSendMessage = (client: Client) => {
    // Open email client with pre-filled recipient
    if (client.primaryContact.email) {
      window.open(`mailto:${client.primaryContact.email}?subject=Hello from FreeFlow`)
      toast.success('Opening email client')
    } else {
      toast.error('No email available')
    }
  }

  const handleScheduleMeeting = (client: Client) => {
    setSelectedClient(client)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setMeetingForm({
      title: `Meeting with ${client.company}`,
      date: tomorrow.toISOString().split('T')[0],
      time: '10:00',
      duration: '30',
      location: 'Video Call',
      notes: ''
    })
    setShowMeetingDialog(true)
  }

  // Submit meeting scheduling - integrated with Calendar API
  const handleSubmitMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time || !selectedClient) {
      toast.error('Please fill in meeting title, date, and time')
      return
    }
    try {
      const startDate = new Date(`${meetingForm.date}T${meetingForm.time}`)
      const endDate = new Date(startDate.getTime() + parseInt(meetingForm.duration) * 60000)

      await toast.promise(
        fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-event',
            title: meetingForm.title,
            description: meetingForm.notes || `Meeting with ${selectedClient.company}`,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            location: meetingForm.location,
            locationType: meetingForm.location.toLowerCase().includes('video') ? 'video' : 'in-person',
            clientId: selectedClient.id,
            attendees: selectedClient.primaryContact?.email ? [{
              email: selectedClient.primaryContact.email,
              name: selectedClient.primaryContact.name,
              status: 'pending'
            }] : []
          })
        }).then(async (res) => {
          if (!res.ok) throw new Error('Failed to create event')
          return res.json()
        }),
        {
          loading: `Scheduling meeting with ${selectedClient.company}...`,
          success: `Meeting "${meetingForm.title}" scheduled for ${meetingForm.date} at ${meetingForm.time}`,
          error: 'Failed to schedule meeting'
        }
      )
      setShowMeetingDialog(false)
      setMeetingForm({ title: '', date: '', time: '', duration: '30', location: 'Video Call', notes: '' })
    } catch (error) {
      console.error('Failed to schedule meeting:', error)
    }
  }

  const handleCallClient = (client: Client) => {
    if (client.primaryContact.phone) {
      window.open(`tel:${client.primaryContact.phone}`)
      toast.success('Initiating call')
    } else {
      toast.error('No phone number available')
    }
  }

  // Quick actions defined inside the component to access state setters
  const clientsQuickActions = [
    { id: '1', label: 'Add Client', icon: 'plus', action: () => setShowAddDialog(true), variant: 'default' as const },
    { id: '2', label: 'Schedule Call', icon: 'phone', action: () => setShowScheduleCallDialog(true), variant: 'default' as const },
    { id: '3', label: 'Send Report', icon: 'mail', action: () => setShowSendReportDialog(true), variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client CRM</h1>
              <p className="text-gray-600 dark:text-gray-400">Salesforce-level relationship management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExportClients}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
            <Button
              variant={showInsights ? 'secondary' : 'outline'}
              onClick={() => setShowInsights(!showInsights)}
              className="gap-2"
            >
              <Sparkles className={`w-4 h-4 ${showInsights ? 'text-primary' : 'text-muted-foreground'}`} />
              {showInsights ? 'Hide Insights' : 'Smart Insights'}
            </Button>
          </div>
        </div>

        {/* AI Insights & Predictive Analytics */}
        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <AIInsightsPanel
                  insights={[
                    // Generate insights from client health scores
                    ...filteredClients
                      .filter(c => c.health_score < 50)
                      .slice(0, 3)
                      .map((client, i) => ({
                        id: `health-${i}`,
                        type: 'warning' as const,
                        title: 'At-Risk Client',
                        description: `${client.company} has a low health score of ${client.health_score}%. Consider reaching out.`,
                        priority: client.health_score < 30 ? 'high' as const : 'medium' as const,
                        timestamp: new Date().toISOString(),
                        category: 'Client Health'
                      })),
                    // Generate insights from high-value clients
                    ...filteredClients
                      .filter(c => c.status === 'customer' && c.revenue > 100000)
                      .slice(0, 2)
                      .map((client, i) => ({
                        id: `upsell-${i}`,
                        type: 'success' as const,
                        title: 'Upsell Opportunity',
                        description: `${client.company} is a high-value client. Consider offering premium services.`,
                        priority: 'medium' as const,
                        timestamp: new Date().toISOString(),
                        category: 'Upsell'
                      })),
                    // Generate insights from inactive clients
                    ...filteredClients
                      .filter(c => {
                        const lastActivity = new Date(c.lastActivity)
                        const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
                        return daysSinceActivity > 30
                      })
                      .slice(0, 2)
                      .map((client, i) => ({
                        id: `inactive-${i}`,
                        type: 'info' as const,
                        title: 'Inactive Client',
                        description: `${client.company} hasn't had activity in over 30 days. Re-engage them.`,
                        priority: 'low' as const,
                        timestamp: new Date().toISOString(),
                        category: 'Engagement'
                      }))
                  ]}
                  title="Client Intelligence"
                  onInsightAction={(insight) => {
                    if (insight.type === 'warning') {
                      toast.warning(`Action needed: ${insight.title}`)
                    } else if (insight.type === 'success') {
                      toast.success(insight.title)
                    } else {
                      toast.info(insight.title)
                    }
                  }}
                />
                <PredictiveAnalytics
                  predictions={[
                    {
                      id: '1',
                      title: 'Revenue Forecast',
                      prediction: `Projected MRR: ${formatCurrency(stats.totalRevenue * 1.15)}`,
                      confidence: 85,
                      trend: 'up',
                      impact: 'high'
                    },
                    {
                      id: '2',
                      title: 'Pipeline Health',
                      prediction: `${stats.openDeals} deals worth ${formatCurrency(stats.pipelineValue)} in pipeline`,
                      confidence: 78,
                      trend: stats.openDeals > 5 ? 'up' : 'stable',
                      impact: 'medium'
                    },
                    {
                      id: '3',
                      title: 'Client Growth',
                      prediction: `${stats.totalCustomers} active customers with ${Math.round(stats.avgHealthScore)}% avg health`,
                      confidence: 92,
                      trend: stats.avgHealthScore > 70 ? 'up' : 'down',
                      impact: stats.avgHealthScore > 70 ? 'high' : 'medium'
                    }
                  ]}
                  title="Client Forecasts"
                />
                <CollaborationIndicator
                  collaborators={filteredClients.slice(0, 6).map(client => ({
                    id: client.id,
                    name: client.primaryContact?.name || client.company,
                    avatar: '',
                    status: client.status === 'customer' ? 'online' as const : 'offline' as const
                  }))}
                  maxVisible={4}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-gray-500">Total Clients</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Customers</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">LTV</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalLTV)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Health Avg</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgHealthScore.toFixed(0)}%</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-gray-500">Pipeline</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.pipelineValue)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Handshake className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Open Deals</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openDeals}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-500">Tasks Due</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="clients" className="gap-2">
              <Users className="w-4 h-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <Target className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            {/* Search and Filters */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'all')}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="customer">Customer</option>
                    <option value="churned">Churned</option>
                  </select>
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          {client.company.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{client.company}</h3>
                          <Badge className={getTierColor(client.tier)}>{client.tier}</Badge>
                          <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{client.industry}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(client.revenue)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {client.projects} projects
                          </span>
                          {client.health_score > 0 && (
                            <span className={`flex items-center gap-1 ${getHealthColor(client.health_score)}`}>
                              <Activity className="w-3 h-3" />
                              {client.health_score}%
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{client.primaryContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">{client.primaryContact.name}</span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-500">{client.primaryContact.title}</span>
                        </div>

                        {client.deals.length > 0 && (
                          <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-amber-800 dark:text-amber-400">{client.deals[0].name}</span>
                              <span className="font-medium text-amber-900 dark:text-amber-300">{formatCurrency(client.deals[0].value)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStageColor(client.deals[0].stage)}>{client.deals[0].stage.replace('_', ' ')}</Badge>
                              <span className="text-xs text-gray-500">{client.deals[0].probability}% probability</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowClientActionsMenu(showClientActionsMenu === client.id ? null : client.id)
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        {showClientActionsMenu === client.id && (
                          <div className="absolute right-4 top-12 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-2 min-w-[150px]">
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSendMessage(client)
                                setShowClientActionsMenu(null)
                              }}
                            >
                              <Mail className="w-4 h-4" /> Send Email
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCallClient(client)
                                setShowClientActionsMenu(null)
                              }}
                            >
                              <Phone className="w-4 h-4" /> Call
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditDialog(client)
                                setShowClientActionsMenu(null)
                              }}
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCreateDeal(client)
                                setShowClientActionsMenu(null)
                              }}
                            >
                              <Handshake className="w-4 h-4" /> Create Deal
                            </button>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">{formatRelativeTime(client.lastActivity)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {pipelineStages.map(({ stage, label, color }) => {
                const stageDeals = allDeals.filter(d => d.stage === stage)
                const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
                return (
                  <div key={stage} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
                      </div>
                      <Badge variant="secondary">{stageDeals.length}</Badge>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">{formatCurrency(stageValue)}</div>

                    <div className="space-y-2">
                      {stageDeals.map(deal => (
                        <Card key={deal.id} className="bg-white dark:bg-gray-800 shadow-sm">
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm mb-1">{deal.name}</h4>
                            <p className="text-xs text-gray-500 mb-2">{deal.clientName}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">{formatCurrency(deal.value)}</span>
                              <span className="text-xs text-gray-500">{deal.probability}%</span>
                            </div>
                            <div className="mt-2">
                              <Progress value={deal.probability} className="h-1" />
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(deal.expectedClose)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Activities</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowLogActivityDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {mockActivities.map(activity => {
                      const client = filteredClients.find(c => c.id === activity.clientId)
                      return (
                        <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'call' ? 'bg-green-100 text-green-600' :
                            activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {activity.type === 'call' && <PhoneCall className="w-5 h-5" />}
                            {activity.type === 'email' && <Mail className="w-5 h-5" />}
                            {activity.type === 'meeting' && <Video className="w-5 h-5" />}
                            {activity.type === 'note' && <FileText className="w-5 h-5" />}
                            {activity.type === 'task' && <CheckCircle2 className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{activity.title}</span>
                              {activity.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {client?.company}
                              </span>
                              <span>{activity.createdBy}</span>
                              <span>{formatRelativeTime(activity.createdAt)}</span>
                            </div>
                            {activity.outcome && (
                              <p className="text-sm text-green-600 mt-2 italic">{activity.outcome}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Tasks</h3>
              <Button variant="outline" size="sm" onClick={() => setShowAddTaskDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTasks.filter(t => !t.completed).map(task => {
                const client = filteredClients.find(c => c.id === task.clientId)
                const isOverdue = new Date(task.dueDate) < new Date()
                return (
                  <Card key={task.id} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${task.priority === 'urgent' ? 'border-red-500' :
                          task.priority === 'high' ? 'border-orange-500' :
                            'border-gray-300'
                          }`}>
                          {task.completed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {client?.company}
                            </span>
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                              <CalendarClock className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                              {isOverdue && ' (Overdue)'}
                            </span>
                            <Badge className={`${getPriorityColor(task.priority)} bg-opacity-10`}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{task.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Revenue by Client Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['platinum', 'gold', 'silver', 'bronze'].map(tier => {
                      const tierClients = filteredClients.filter(c => c.tier === tier as any)
                      const tierRevenue = tierClients.reduce((sum, c) => sum + c.revenue, 0)
                      return (
                        <div key={tier} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{tier}</span>
                            <span>{formatCurrency(tierRevenue)}</span>
                          </div>
                          <Progress value={(tierRevenue / stats.totalRevenue) * 100} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Client Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(['customer', 'opportunity', 'prospect', 'lead', 'churned'] as const).map(status => {
                      const count = filteredClients.filter(c => c.status === status).length
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(status)}>{status}</Badge>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Top Industries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(new Set(filteredClients.map(c => c.industry))).map(industry => {
                      const count = filteredClients.filter(c => c.industry === industry).length
                      const revenue = filteredClients.filter(c => c.industry === industry).reduce((sum, c) => sum + c.revenue, 0)
                      return (
                        <div key={industry} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">{industry}</div>
                            <div className="text-xs text-gray-500">{count} clients</div>
                          </div>
                          <span className="font-semibold">{formatCurrency(revenue)}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - Salesforce Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-1">
                <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Settings</h3>
                {[
                  { id: 'general', label: 'General', icon: Settings },
                  { id: 'pipeline', label: 'Pipeline', icon: Target },
                  { id: 'automation', label: 'Automation', icon: Zap },
                  { id: 'integrations', label: 'Integrations', icon: Link2 },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'advanced', label: 'Advanced', icon: Building2 },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${settingsTab === item.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>CRM Configuration</CardTitle>
                        <CardDescription>General CRM settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Organization Name</Label>
                            <Input defaultValue="Acme Corp" className="mt-1" />
                          </div>
                          <div>
                            <Label>Default Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                                <SelectItem value="jpy">JPY (¥)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Total Clients</p>
                            <p className="text-2xl font-bold">1,234</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Open Deals</p>
                            <p className="text-2xl font-bold">$2.4M</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Win Rate</p>
                            <p className="text-2xl font-bold text-green-600">42%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Client Fields</CardTitle>
                        <CardDescription>Customize client record fields</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['Company Name', 'Industry', 'Revenue', 'Employee Count', 'Website'].map((field, i) => (
                          <div key={field} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{field}</span>
                              {i < 2 && <Badge className="bg-red-100 text-red-700">Required</Badge>}
                            </div>
                            <Switch defaultChecked />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddCustomFieldDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Custom Field
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Team Settings</CardTitle>
                        <CardDescription>Sales team configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-indigo-600">12</p>
                            <p className="text-sm text-gray-500">Sales Reps</p>
                          </div>
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600">4</p>
                            <p className="text-sm text-gray-500">Teams</p>
                          </div>
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">3</p>
                            <p className="text-sm text-gray-500">Managers</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Territory Management</p>
                            <p className="text-sm text-gray-500">Auto-assign by region</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Round Robin Assignment</p>
                            <p className="text-sm text-gray-500">Equal lead distribution</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Pipeline Settings */}
                {settingsTab === 'pipeline' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Pipeline Stages</CardTitle>
                        <CardDescription>Configure deal stages</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Lead', prob: 10, color: 'bg-gray-500' },
                          { name: 'Qualified', prob: 25, color: 'bg-blue-500' },
                          { name: 'Proposal', prob: 50, color: 'bg-yellow-500' },
                          { name: 'Negotiation', prob: 75, color: 'bg-orange-500' },
                          { name: 'Closed Won', prob: 100, color: 'bg-green-500' },
                          { name: 'Closed Lost', prob: 0, color: 'bg-red-500' },
                        ].map((stage) => (
                          <div key={stage.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                              <span className="font-medium">{stage.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-500">{stage.prob}% probability</span>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedStageForEdit(stage.name)
                                setShowEditStageDialog(true)
                              }}>Edit</Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddStageDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Stage
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Deal Settings</CardTitle>
                        <CardDescription>Configure deal behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default Deal Owner</Label>
                          <Select defaultValue="creator">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="creator">Deal Creator</SelectItem>
                              <SelectItem value="account">Account Owner</SelectItem>
                              <SelectItem value="roundrobin">Round Robin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-close Stale Deals</p>
                            <p className="text-sm text-gray-500">Close after 90 days inactive</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require Close Reason</p>
                            <p className="text-sm text-gray-500">On won/lost deals</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Deal Scoring</p>
                            <p className="text-sm text-gray-500">AI-powered deal scoring</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Forecasting</CardTitle>
                        <CardDescription>Revenue forecasting settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Forecast Period</Label>
                          <Select defaultValue="quarter">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="month">Monthly</SelectItem>
                              <SelectItem value="quarter">Quarterly</SelectItem>
                              <SelectItem value="year">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable AI Forecasting</p>
                            <p className="text-sm text-gray-500">Predictive analytics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Q4 Forecast</p>
                            <p className="text-xl font-bold text-indigo-600">$1.2M</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Confidence</p>
                            <p className="text-xl font-bold text-green-600">78%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Automation Settings */}
                {settingsTab === 'automation' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Workflow Automation</CardTitle>
                        <CardDescription>Automate repetitive tasks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Lead Assignment</p>
                            <p className="text-sm text-gray-500">Auto-assign new leads</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Follow-up Reminders</p>
                            <p className="text-sm text-gray-500">Auto-schedule reminders</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Deal Stage Updates</p>
                            <p className="text-sm text-gray-500">Trigger on activity</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Win/Loss Analysis</p>
                            <p className="text-sm text-gray-500">Auto-generate reports</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowCreateWorkflowDialog(true)}>
                          Create Custom Workflow
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Email Sequences</CardTitle>
                        <CardDescription>Automated email campaigns</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'New Lead Welcome', emails: 5, active: true },
                          { name: 'Re-engagement', emails: 3, active: true },
                          { name: 'Post-Demo Follow-up', emails: 4, active: false },
                        ].map((seq) => (
                          <div key={seq.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{seq.name}</p>
                              <p className="text-xs text-gray-500">{seq.emails} emails</p>
                            </div>
                            <Switch defaultChecked={seq.active} />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowCreateSequenceDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Sequence
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>AI Assistant</CardTitle>
                        <CardDescription>AI-powered sales assistant</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Email Suggestions</p>
                            <p className="text-sm text-gray-500">AI-written email drafts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Meeting Prep</p>
                            <p className="text-sm text-gray-500">Auto-generate briefs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Deal Insights</p>
                            <p className="text-sm text-gray-500">Risk analysis & suggestions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Integrations</CardTitle>
                        <CardDescription>Connect email providers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Gmail', icon: Mail, connected: true },
                          { name: 'Outlook', icon: Mail, connected: true },
                          { name: 'Exchange', icon: Mail, connected: false },
                        ].map((int) => (
                          <div key={int.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <int.icon className="w-5 h-5" />
                              <span className="font-medium">{int.name}</span>
                            </div>
                            <Badge className={int.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {int.connected ? 'Connected' : 'Connect'}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Calendar Integrations</CardTitle>
                        <CardDescription>Sync meetings and events</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['Google Calendar', 'Outlook Calendar', 'Calendly'].map((cal, i) => (
                          <div key={cal} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5" />
                              <span className="font-medium">{cal}</span>
                            </div>
                            <Badge className={i === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {i === 0 ? 'Connected' : 'Connect'}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Third-Party Apps</CardTitle>
                        <CardDescription>Connect external services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Slack', status: 'connected' },
                          { name: 'Zoom', status: 'connected' },
                          { name: 'HubSpot', status: 'available' },
                          { name: 'Mailchimp', status: 'available' },
                        ].map((app) => (
                          <div key={app.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="font-medium">{app.name}</span>
                            <Badge className={app.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {app.status === 'connected' ? 'Connected' : 'Connect'}
                            </Badge>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAppMarketplaceDialog(true)}>
                          Browse App Marketplace
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure email alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">New Lead Assigned</p>
                            <p className="text-sm text-gray-500">When a lead is assigned to you</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Deal Stage Change</p>
                            <p className="text-sm text-gray-500">When a deal moves stages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Deal Won/Lost</p>
                            <p className="text-sm text-gray-500">When deals close</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Task Due</p>
                            <p className="text-sm text-gray-500">Reminder before due date</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>In-App Notifications</CardTitle>
                        <CardDescription>Configure app alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Real-time Updates</p>
                            <p className="text-sm text-gray-500">Show live notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Sound Alerts</p>
                            <p className="text-sm text-gray-500">Play notification sounds</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Desktop Notifications</p>
                            <p className="text-sm text-gray-500">Browser push notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Mobile Push</CardTitle>
                        <CardDescription>Mobile notification settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Push</p>
                            <p className="text-sm text-gray-500">Receive on mobile</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Quiet Hours</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-2">
                            <div>
                              <Label className="text-xs text-gray-500">From</Label>
                              <Select defaultValue="22">
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}:00</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">To</Label>
                              <Select defaultValue="8">
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}:00</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Import and export data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setShowExportDataDialog(true)}>
                            <Download className="w-5 h-5" />
                            <span>Export Data</span>
                          </Button>
                          <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setShowImportDataDialog(true)}>
                            <Upload className="w-5 h-5" />
                            <span>Import Data</span>
                          </Button>
                        </div>
                        <div>
                          <Label>Export Format</Label>
                          <Select defaultValue="csv">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="xlsx">Excel</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Scheduled Exports</p>
                            <p className="text-sm text-gray-500">Weekly backup exports</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Developer API settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">API Key</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <code className="block w-full p-3 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
                            crm_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <div>
                          <Label>Rate Limit</Label>
                          <Select defaultValue="1000">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 req/min</SelectItem>
                              <SelectItem value="1000">1,000 req/min</SelectItem>
                              <SelectItem value="10000">10,000 req/min</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowRegenerateApiKeyDialog(true)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Audit Log</CardTitle>
                        <CardDescription>Track all changes</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Audit Log</p>
                            <p className="text-sm text-gray-500">Track all CRM changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Log Retention</Label>
                          <Select defaultValue="1year">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="90days">90 days</SelectItem>
                              <SelectItem value="1year">1 year</SelectItem>
                              <SelectItem value="3years">3 years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowAuditLogDialog(true)}>
                          View Audit Log
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete All Activities</p>
                              <p className="text-sm text-red-600">Remove activity history</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowDeleteActivitiesDialog(true)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Merge Duplicate Clients</p>
                              <p className="text-sm text-red-600">Find and merge duplicates</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowMergeDuplicatesDialog(true)}>
                              Merge
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Reset CRM Data</p>
                              <p className="text-sm text-red-600">Delete all client data</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowResetCrmDialog(true)}>
                              Reset
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={[
                // Generate insights from client health scores
                ...filteredClients
                  .filter(c => c.health_score < 50)
                  .slice(0, 3)
                  .map((client, i) => ({
                    id: `health-${i}`,
                    type: 'warning' as const,
                    title: 'At-Risk Client',
                    description: `${client.company} has a low health score of ${client.health_score}%. Consider reaching out.`,
                    priority: client.health_score < 30 ? 'high' as const : 'medium' as const,
                    timestamp: new Date().toISOString(),
                    category: 'Client Health'
                  })),
                // Generate insights from high-value clients
                ...filteredClients
                  .filter(c => c.status === 'customer' && c.revenue > 100000)
                  .slice(0, 2)
                  .map((client, i) => ({
                    id: `upsell-${i}`,
                    type: 'success' as const,
                    title: 'Upsell Opportunity',
                    description: `${client.company} is a high-value client. Consider offering premium services.`,
                    priority: 'medium' as const,
                    timestamp: new Date().toISOString(),
                    category: 'Upsell'
                  })),
                // Generate insights from inactive clients
                ...filteredClients
                  .filter(c => {
                    const lastActivity = new Date(c.lastActivity)
                    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
                    return daysSinceActivity > 30
                  })
                  .slice(0, 2)
                  .map((client, i) => ({
                    id: `inactive-${i}`,
                    type: 'info' as const,
                    title: 'Inactive Client',
                    description: `${client.company} hasn't had activity in over 30 days. Re-engage them.`,
                    priority: 'low' as const,
                    timestamp: new Date().toISOString(),
                    category: 'Engagement'
                  }))
              ]}
              title="Client Intelligence"
              onInsightAction={(insight) => {
                if (insight.type === 'warning') {
                  toast.warning(`Action needed: ${insight.title}`)
                } else if (insight.type === 'success') {
                  toast.success(insight.title)
                } else {
                  toast.info(insight.title)
                }
              }}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={filteredClients.slice(0, 6).map(client => ({
                id: client.id,
                name: client.primaryContact?.name || client.company,
                avatar: '',
                status: client.status === 'customer' ? 'online' as const : 'offline' as const
              }))}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[
                {
                  id: '1',
                  title: 'Revenue Forecast',
                  prediction: `Projected MRR: ${formatCurrency(stats.totalRevenue * 1.15)}`,
                  confidence: 85,
                  trend: 'up',
                  impact: 'high'
                },
                {
                  id: '2',
                  title: 'Pipeline Health',
                  prediction: `${stats.openDeals} deals worth ${formatCurrency(stats.pipelineValue)} in pipeline`,
                  confidence: 78,
                  trend: stats.openDeals > 5 ? 'up' : 'stable',
                  impact: 'medium'
                },
                {
                  id: '3',
                  title: 'Client Growth',
                  prediction: `${stats.totalCustomers} active customers with ${Math.round(stats.avgHealthScore)}% avg health`,
                  confidence: 92,
                  trend: stats.avgHealthScore > 70 ? 'up' : 'down',
                  impact: stats.avgHealthScore > 70 ? 'high' : 'medium'
                }
              ]}
              title="Client Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={filteredClients.slice(0, 5).map((client, i) => ({
              id: `activity-${client.id}-${i}`,
              type: client.status === 'customer' ? 'create' as const : client.status === 'prospect' ? 'update' as const : 'comment' as const,
              message: `${client.company}: ${client.status === 'customer' ? 'Active customer' : client.status === 'prospect' ? 'Prospect engaged' : 'Lead tracked'} - ${formatCurrency(client.revenue)} revenue`,
              timestamp: client.lastActivity,
              user: { name: client.primaryContact?.name || 'System', avatar: '' }
            }))}
            title="Client Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={clientsQuickActions}
            variant="grid"
          />
        </div>

        {/* Client Detail Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedClient && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl">
                        {selectedClient.company.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-xl">{selectedClient.company}</DialogTitle>
                        <Badge className={getTierColor(selectedClient.tier)}>{selectedClient.tier}</Badge>
                        <Badge className={getStatusColor(selectedClient.status)}>{selectedClient.status}</Badge>
                      </div>
                      <p className="text-gray-600">{selectedClient.industry}</p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500">Revenue</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedClient.revenue)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500">Lifetime Value</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedClient.lifetime_value)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500">Health Score</div>
                    <div className={`text-2xl font-bold ${getHealthColor(selectedClient.health_score)}`}>{selectedClient.health_score}%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500">Projects</div>
                    <div className="text-2xl font-bold">{selectedClient.projects}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Primary Contact</h3>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarFallback>{selectedClient.primaryContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedClient.primaryContact.name}</div>
                          <div className="text-sm text-gray-500">{selectedClient.primaryContact.title}</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {selectedClient.primaryContact.email}
                        </div>
                        {selectedClient.primaryContact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {selectedClient.primaryContact.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Company Details</h3>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {selectedClient.address.city}, {selectedClient.address.state}, {selectedClient.address.country}
                      </div>
                      {selectedClient.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          {selectedClient.website}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        Source: {selectedClient.source}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedClient.deals.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Active Deals</h3>
                    <div className="space-y-3">
                      {selectedClient.deals.map(deal => (
                        <div key={deal.id} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{deal.name}</span>
                            <Badge className={getStageColor(deal.stage)}>{deal.stage.replace('_', ' ')}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                            <span>{deal.probability}% probability</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Close: {formatDate(deal.expectedClose)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-6">
                  {selectedClient.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button className="flex-1" onClick={() => handleSendMessage(selectedClient)}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" onClick={() => handleCallClient(selectedClient)}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" onClick={() => handleScheduleMeeting(selectedClient)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Meeting
                  </Button>
                  <Button variant="outline" onClick={() => openEditDialog(selectedClient)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  {(selectedClient as any).isFromDatabase && (
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => confirmDeleteClient(selectedClient.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Client Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  placeholder="Enter company name"
                  className="mt-1"
                  value={newClientForm.company}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm font-medium">Industry</label>
                  <select
                    className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                    value={newClientForm.industry}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                    value={newClientForm.status}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="active">Active</option>
                    <option value="prospect">Prospect</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  placeholder="https://company.com"
                  className="mt-1"
                  value={newClientForm.website}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">Primary Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="Contact name"
                      className="mt-1"
                      value={newClientForm.contactName}
                      onChange={(e) => setNewClientForm(prev => ({ ...prev, contactName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Job title"
                      className="mt-1"
                      value={newClientForm.contactTitle}
                      onChange={(e) => setNewClientForm(prev => ({ ...prev, contactTitle: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      className="mt-1"
                      value={newClientForm.email}
                      onChange={(e) => setNewClientForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      placeholder="+1 555 000 0000"
                      className="mt-1"
                      value={newClientForm.phone}
                      onChange={(e) => setNewClientForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">Cancel</Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  onClick={handleCreateClient}
                  disabled={isSubmitting || !newClientForm.company || !newClientForm.contactName || !newClientForm.email}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? 'Adding...' : 'Add Client'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  placeholder="Enter company name"
                  className="mt-1"
                  value={editClientForm.company}
                  onChange={(e) => setEditClientForm(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm font-medium">Industry</label>
                  <select
                    className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                    value={editClientForm.industry}
                    onChange={(e) => setEditClientForm(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                    value={editClientForm.status}
                    onChange={(e) => setEditClientForm(prev => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="active">Active</option>
                    <option value="prospect">Prospect</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  placeholder="https://company.com"
                  className="mt-1"
                  value={editClientForm.website}
                  onChange={(e) => setEditClientForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Contact Name *</label>
                    <Input
                      placeholder="Contact name"
                      className="mt-1"
                      value={editClientForm.contactName}
                      onChange={(e) => setEditClientForm(prev => ({ ...prev, contactName: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="text-sm font-medium">Email *</label>
                      <Input
                        type="email"
                        placeholder="email@company.com"
                        className="mt-1"
                        value={editClientForm.email}
                        onChange={(e) => setEditClientForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        placeholder="+1 555 000 0000"
                        className="mt-1"
                        value={editClientForm.phone}
                        onChange={(e) => setEditClientForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">Cancel</Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  onClick={handleEditClient}
                  disabled={isSubmitting || !editClientForm.company || !editClientForm.contactName || !editClientForm.email}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Confirm Delete
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this client? This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setClientToDelete(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClient}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Deleting...' : 'Delete Client'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Call Dialog */}
        <Dialog open={showScheduleCallDialog} onOpenChange={setShowScheduleCallDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-indigo-600" />
                Schedule Call
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Select Client</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Call Date</label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Call Time</label>
                <Input type="time" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input placeholder="Add notes for this call..." className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowScheduleCallDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Call scheduled successfully')
                  setShowScheduleCallDialog(false)
                }}
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                Schedule Call
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Report Dialog */}
        <Dialog open={showSendReportDialog} onOpenChange={setShowSendReportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Send Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Select Client</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Account Summary</SelectItem>
                    <SelectItem value="activity">Activity Report</SelectItem>
                    <SelectItem value="revenue">Revenue Report</SelectItem>
                    <SelectItem value="health">Health Score Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Email Recipients</label>
                <Input placeholder="Enter email addresses..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Additional Message</label>
                <Input placeholder="Add a message to include with the report..." className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSendReportDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Report sent successfully')
                  setShowSendReportDialog(false)
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Log Activity Dialog */}
        <Dialog open={showLogActivityDialog} onOpenChange={setShowLogActivityDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Log Activity
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Select Client</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Activity Type</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Activity title..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Describe the activity..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Outcome</label>
                <Input placeholder="Result or next steps..." className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowLogActivityDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Activity logged successfully')
                  setShowLogActivityDialog(false)
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
        <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                Add Task
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Select Client</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Task Title</label>
                <Input placeholder="Enter task title..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Task description..." className="mt-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Assignee</label>
                <Input placeholder="Assign to..." className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddTaskDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Task created successfully')
                  setShowAddTaskDialog(false)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Custom Field Dialog */}
        <Dialog open={showAddCustomFieldDialog} onOpenChange={setShowAddCustomFieldDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Add Custom Field
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Field Name</label>
                <Input placeholder="Enter field name..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Field Type</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Required Field</p>
                  <p className="text-sm text-gray-500">Make this field mandatory</p>
                </div>
                <Switch />
              </div>
              <div>
                <label className="text-sm font-medium">Default Value (Optional)</label>
                <Input placeholder="Enter default value..." className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddCustomFieldDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Custom field added successfully')
                  setShowAddCustomFieldDialog(false)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Stage Dialog */}
        <Dialog open={showEditStageDialog} onOpenChange={setShowEditStageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-600" />
                Edit Pipeline Stage
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Stage Name</label>
                <Input placeholder="Enter stage name..." className="mt-1" defaultValue={selectedStageForEdit || ''} />
              </div>
              <div>
                <label className="text-sm font-medium">Win Probability (%)</label>
                <Input type="number" min="0" max="100" placeholder="Enter probability..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Stage Color</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Active Stage</p>
                  <p className="text-sm text-gray-500">Stage is visible in pipeline</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditStageDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Stage updated successfully')
                  setShowEditStageDialog(false)
                  setSelectedStageForEdit(null)
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Stage Dialog */}
        <Dialog open={showAddStageDialog} onOpenChange={setShowAddStageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Add Pipeline Stage
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Stage Name</label>
                <Input placeholder="Enter stage name..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Win Probability (%)</label>
                <Input type="number" min="0" max="100" placeholder="Enter probability..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Stage Color</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Position</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First</SelectItem>
                    <SelectItem value="last">Last</SelectItem>
                    <SelectItem value="after_lead">After Lead</SelectItem>
                    <SelectItem value="after_qualified">After Qualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddStageDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Stage added successfully')
                  setShowAddStageDialog(false)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stage
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Custom Workflow Dialog */}
        <Dialog open={showCreateWorkflowDialog} onOpenChange={setShowCreateWorkflowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Create Custom Workflow
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Workflow Name</label>
                <Input placeholder="Enter workflow name..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Trigger</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_lead">New Lead Created</SelectItem>
                    <SelectItem value="deal_stage">Deal Stage Changed</SelectItem>
                    <SelectItem value="deal_won">Deal Won</SelectItem>
                    <SelectItem value="deal_lost">Deal Lost</SelectItem>
                    <SelectItem value="no_activity">No Activity for X Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Action</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_email">Send Email</SelectItem>
                    <SelectItem value="create_task">Create Task</SelectItem>
                    <SelectItem value="update_field">Update Field</SelectItem>
                    <SelectItem value="notify_user">Notify User</SelectItem>
                    <SelectItem value="assign_owner">Assign Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Describe this workflow..." className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreateWorkflowDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Workflow created successfully')
                  setShowCreateWorkflowDialog(false)
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Email Sequence Dialog */}
        <Dialog open={showCreateSequenceDialog} onOpenChange={setShowCreateSequenceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Create Email Sequence
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Sequence Name</label>
                <Input placeholder="Enter sequence name..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_leads">New Leads</SelectItem>
                    <SelectItem value="prospects">Prospects</SelectItem>
                    <SelectItem value="opportunities">Opportunities</SelectItem>
                    <SelectItem value="churned">Churned Clients</SelectItem>
                    <SelectItem value="all">All Contacts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Number of Emails</label>
                <Input type="number" min="1" max="10" placeholder="Enter number..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Delay Between Emails (days)</label>
                <Input type="number" min="1" placeholder="Enter days..." className="mt-1" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Activate Immediately</p>
                  <p className="text-sm text-gray-500">Start sending when created</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreateSequenceDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Email sequence created successfully')
                  setShowCreateSequenceDialog(false)
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Create Sequence
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* App Marketplace Dialog */}
        <Dialog open={showAppMarketplaceDialog} onOpenChange={setShowAppMarketplaceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                App Marketplace
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search apps..." className="pl-9" />
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {[
                  { name: 'Stripe', category: 'Payments', description: 'Accept payments and manage subscriptions' },
                  { name: 'QuickBooks', category: 'Accounting', description: 'Sync invoices and financials' },
                  { name: 'Zapier', category: 'Automation', description: 'Connect with 5000+ apps' },
                  { name: 'DocuSign', category: 'Documents', description: 'Electronic signatures and contracts' },
                  { name: 'Intercom', category: 'Support', description: 'Customer messaging platform' },
                  { name: 'Twilio', category: 'Communication', description: 'SMS and voice integration' },
                ].map(app => (
                  <div key={app.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-xs text-gray-500">{app.category} - {app.description}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      toast.success(`${app.name} connected successfully`)
                    }}>
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAppMarketplaceDialog(false)} className="flex-1">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                Export Data
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Data to Export</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clients">All Clients</SelectItem>
                    <SelectItem value="deals">All Deals</SelectItem>
                    <SelectItem value="activities">All Activities</SelectItem>
                    <SelectItem value="tasks">All Tasks</SelectItem>
                    <SelectItem value="everything">Everything</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Export Format</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date Range (Optional)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-1">
                  <Input type="date" placeholder="From" />
                  <Input type="date" placeholder="To" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowExportDataDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  handleExportClients()
                  setShowExportDataDialog(false)
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Data Dialog */}
        <Dialog open={showImportDataDialog} onOpenChange={setShowImportDataDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Import Data
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Import Type</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clients">Clients</SelectItem>
                    <SelectItem value="contacts">Contacts</SelectItem>
                    <SelectItem value="deals">Deals</SelectItem>
                    <SelectItem value="activities">Activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports CSV, XLSX, and JSON files
                </p>
                <Input type="file" className="mt-3" accept=".csv,.xlsx,.json" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Skip Duplicates</p>
                  <p className="text-sm text-gray-500">Ignore records that already exist</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowImportDataDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => {
                  toast.success('Data imported successfully')
                  setShowImportDataDialog(false)
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                Regenerate API Key
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to regenerate your API key? This will invalidate your current key immediately.
              </p>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  <strong>Warning:</strong> Any applications using the current API key will stop working until you update them with the new key.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowRegenerateApiKeyDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  toast.success('API key regenerated successfully')
                  setShowRegenerateApiKeyDialog(false)
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Audit Log Dialog */}
        <Dialog open={showAuditLogDialog} onOpenChange={setShowAuditLogDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Audit Log
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input placeholder="Search logs..." className="flex-1" />
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="create">Created</SelectItem>
                    <SelectItem value="update">Updated</SelectItem>
                    <SelectItem value="delete">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {[
                  { action: 'Created', target: 'TechCorp client', user: 'John Smith', time: '2 hours ago' },
                  { action: 'Updated', target: 'Global deal value', user: 'Emily Davis', time: '4 hours ago' },
                  { action: 'Deleted', target: 'Archived contact', user: 'John Smith', time: '1 day ago' },
                  { action: 'Created', target: 'New task', user: 'Emily Davis', time: '2 days ago' },
                  { action: 'Updated', target: 'Pipeline stage settings', user: 'Admin', time: '3 days ago' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={
                        log.action === 'Created' ? 'bg-green-100 text-green-700' :
                          log.action === 'Updated' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                      }>
                        {log.action}
                      </Badge>
                      <span className="text-sm">{log.target}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.user} - {log.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAuditLogDialog(false)} className="flex-1">
                Close
              </Button>
              <Button variant="outline" onClick={() => {
                toast.success('Audit log exported')
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Activities Confirmation Dialog */}
        <Dialog open={showDeleteActivitiesDialog} onOpenChange={setShowDeleteActivitiesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Delete All Activities
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete all activity history? This action cannot be undone.
              </p>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400">
                  <strong>Warning:</strong> This will permanently remove all calls, emails, meetings, notes, and tasks from the system.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeleteActivitiesDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast.success('All activities deleted')
                  setShowDeleteActivitiesDialog(false)
                }}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Merge Duplicates Dialog */}
        <Dialog open={showMergeDuplicatesDialog} onOpenChange={setShowMergeDuplicatesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <Users className="w-5 h-5" />
                Merge Duplicate Clients
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This will scan your client database for potential duplicates and allow you to merge them.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Match by Email</p>
                    <p className="text-sm text-gray-500">Find clients with same email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Match by Company Name</p>
                    <p className="text-sm text-gray-500">Find similar company names</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Match by Phone</p>
                    <p className="text-sm text-gray-500">Find clients with same phone</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowMergeDuplicatesDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  toast.success('Scanning for duplicates...')
                  setShowMergeDuplicatesDialog(false)
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Find Duplicates
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Deal Dialog */}
        <Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-blue-500" />
                Create New Deal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Deal Title</Label>
                <Input
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  placeholder="Enter deal title"
                />
              </div>
              <div>
                <Label>Value ($)</Label>
                <Input
                  type="number"
                  value={dealForm.value}
                  onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })}
                  placeholder="Enter deal value"
                />
              </div>
              <div>
                <Label>Stage</Label>
                <Select value={dealForm.stage} onValueChange={(value: any) => setDealForm({ ...dealForm, stage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={dealForm.probability}
                  onChange={(e) => setDealForm({ ...dealForm, probability: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Expected Close Date</Label>
                <Input
                  type="date"
                  value={dealForm.expectedCloseDate}
                  onChange={(e) => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={dealForm.description}
                  onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDealDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitDeal}>Create Deal</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Meeting Dialog */}
        <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Schedule Meeting
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Meeting Title</Label>
                <Input
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="Enter meeting title"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Duration</Label>
                <Select value={meetingForm.duration} onValueChange={(value) => setMeetingForm({ ...meetingForm, duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Select value={meetingForm.location} onValueChange={(value) => setMeetingForm({ ...meetingForm, location: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video Call">Video Call</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="In Person">In Person</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                  placeholder="Optional meeting notes"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMeetingDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitMeeting}>Schedule Meeting</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset CRM Confirmation Dialog */}
        <Dialog open={showResetCrmDialog} onOpenChange={setShowResetCrmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Reset CRM Data
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you absolutely sure you want to reset all CRM data? This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                <li>All clients and contacts</li>
                <li>All deals and pipeline data</li>
                <li>All activities and tasks</li>
                <li>All custom fields and settings</li>
              </ul>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400">
                  <strong>This action cannot be undone!</strong> Please export your data first if you need a backup.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowResetCrmDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast.success('CRM data reset complete')
                  setShowResetCrmDialog(false)
                }}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
