// Clients V2 - Salesforce Level CRM Platform
// Comprehensive client relationship management with pipeline, deals, and activities
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClients } from '@/lib/hooks/use-clients'
import { useDeals } from '@/lib/hooks/use-deals'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'
import { downloadAsCsv } from '@/lib/button-handlers'
import {
  Users,
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
const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'TechCorp International',
    company: 'TechCorp International',
    industry: 'Technology',
    website: 'https://techcorp.com',
    status: 'customer',
    contacts: [
      { id: 'ct1', name: 'Sarah Chen', email: 'sarah@techcorp.com', phone: '+1 555 0123', title: 'VP of Engineering', isPrimary: true, linkedin: 'linkedin.com/in/sarahchen' }
    ],
    primaryContact: { id: 'ct1', name: 'Sarah Chen', email: 'sarah@techcorp.com', phone: '+1 555 0123', title: 'VP of Engineering', isPrimary: true },
    revenue: 450000,
    lifetime_value: 1250000,
    projects: 12,
    health_score: 92,
    nps: 9,
    createdAt: '2023-01-15T10:00:00Z',
    lastActivity: '2024-12-22T14:30:00Z',
    tags: ['enterprise', 'technology', 'strategic'],
    address: { city: 'San Francisco', state: 'CA', country: 'USA' },
    owner: 'John Smith',
    team: ['John Smith', 'Emily Davis'],
    source: 'Inbound',
    deals: [
      { id: 'd1', name: 'Platform Expansion Q1', value: 150000, stage: 'negotiation', probability: 75, expectedClose: '2025-01-31', createdAt: '2024-11-01', owner: 'John Smith', products: ['Enterprise Suite', 'API Access'] }
    ],
    tier: 'platinum'
  },
  {
    id: 'c2',
    name: 'Global Innovations Ltd',
    company: 'Global Innovations Ltd',
    industry: 'Manufacturing',
    website: 'https://globalinnovations.com',
    status: 'customer',
    contacts: [
      { id: 'ct2', name: 'Mike Johnson', email: 'mike@globalinnovations.com', phone: '+1 555 0456', title: 'CTO', isPrimary: true }
    ],
    primaryContact: { id: 'ct2', name: 'Mike Johnson', email: 'mike@globalinnovations.com', phone: '+1 555 0456', title: 'CTO', isPrimary: true },
    revenue: 285000,
    lifetime_value: 780000,
    projects: 8,
    health_score: 78,
    nps: 7,
    createdAt: '2023-03-20T11:00:00Z',
    lastActivity: '2024-12-20T09:00:00Z',
    tags: ['manufacturing', 'mid-market'],
    address: { city: 'Chicago', state: 'IL', country: 'USA' },
    owner: 'Emily Davis',
    team: ['Emily Davis'],
    source: 'Referral',
    deals: [
      { id: 'd2', name: 'Annual Renewal 2025', value: 95000, stage: 'proposal', probability: 90, expectedClose: '2025-02-28', createdAt: '2024-12-01', owner: 'Emily Davis', products: ['Core Platform'] }
    ],
    tier: 'gold'
  },
  {
    id: 'c3',
    name: 'Startup Ventures',
    company: 'Startup Ventures',
    industry: 'Venture Capital',
    website: 'https://startupventures.io',
    status: 'opportunity',
    contacts: [
      { id: 'ct3', name: 'James Wilson', email: 'james@startupventures.io', phone: '+1 555 0789', title: 'Partner', isPrimary: true }
    ],
    primaryContact: { id: 'ct3', name: 'James Wilson', email: 'james@startupventures.io', phone: '+1 555 0789', title: 'Partner', isPrimary: true },
    revenue: 0,
    lifetime_value: 0,
    projects: 0,
    health_score: 65,
    createdAt: '2024-10-15T14:00:00Z',
    lastActivity: '2024-12-21T16:00:00Z',
    tags: ['finance', 'startup'],
    address: { city: 'New York', state: 'NY', country: 'USA' },
    owner: 'John Smith',
    team: ['John Smith'],
    source: 'Conference',
    deals: [
      { id: 'd3', name: 'Initial Contract', value: 75000, stage: 'discovery', probability: 40, expectedClose: '2025-03-15', createdAt: '2024-11-15', owner: 'John Smith', products: ['Starter Pack'] }
    ],
    tier: 'silver'
  },
  {
    id: 'c4',
    name: 'Healthcare Plus',
    company: 'Healthcare Plus',
    industry: 'Healthcare',
    status: 'lead',
    contacts: [
      { id: 'ct4', name: 'Dr. Emily Carter', email: 'emily@healthcareplus.org', title: 'Director of IT', isPrimary: true }
    ],
    primaryContact: { id: 'ct4', name: 'Dr. Emily Carter', email: 'emily@healthcareplus.org', title: 'Director of IT', isPrimary: true },
    revenue: 0,
    lifetime_value: 0,
    projects: 0,
    health_score: 0,
    createdAt: '2024-12-10T10:00:00Z',
    lastActivity: '2024-12-18T11:00:00Z',
    tags: ['healthcare', 'enterprise'],
    address: { city: 'Boston', state: 'MA', country: 'USA' },
    owner: 'Emily Davis',
    team: ['Emily Davis'],
    source: 'Webinar',
    deals: [],
    tier: 'bronze'
  },
  {
    id: 'c5',
    name: 'Retail Empire',
    company: 'Retail Empire',
    industry: 'Retail',
    website: 'https://retailempire.com',
    status: 'churned',
    contacts: [
      { id: 'ct5', name: 'Alex Thompson', email: 'alex@retailempire.com', title: 'Operations Manager', isPrimary: true }
    ],
    primaryContact: { id: 'ct5', name: 'Alex Thompson', email: 'alex@retailempire.com', title: 'Operations Manager', isPrimary: true },
    revenue: 125000,
    lifetime_value: 125000,
    projects: 3,
    health_score: 25,
    nps: 4,
    createdAt: '2022-06-01T09:00:00Z',
    lastActivity: '2024-09-15T10:00:00Z',
    tags: ['retail', 'at-risk'],
    address: { city: 'Los Angeles', state: 'CA', country: 'USA' },
    owner: 'John Smith',
    team: ['John Smith'],
    source: 'Partner',
    deals: [],
    tier: 'silver'
  },
]

const mockActivities: Activity[] = [
  { id: 'a1', clientId: 'c1', type: 'meeting', title: 'Q1 Planning Meeting', description: 'Discussed expansion plans', createdAt: '2024-12-22T14:30:00Z', createdBy: 'John Smith', completed: true, outcome: 'Positive - moving forward with proposal' },
  { id: 'a2', clientId: 'c1', type: 'email', title: 'Follow-up on proposal', description: 'Sent updated pricing', createdAt: '2024-12-21T10:00:00Z', createdBy: 'John Smith', completed: true },
  { id: 'a3', clientId: 'c2', type: 'call', title: 'Renewal discussion', description: 'Discussed annual renewal terms', createdAt: '2024-12-20T09:00:00Z', createdBy: 'Emily Davis', completed: true },
  { id: 'a4', clientId: 'c3', type: 'meeting', title: 'Discovery call', description: 'Initial needs assessment', createdAt: '2024-12-21T16:00:00Z', createdBy: 'John Smith', completed: true },
  { id: 'a5', clientId: 'c1', type: 'task', title: 'Send contract amendment', description: 'Update for new pricing', createdAt: '2024-12-23T09:00:00Z', createdBy: 'John Smith', completed: false, dueDate: '2024-12-26', priority: 'high' },
]

const mockTasks: Task[] = [
  { id: 't1', clientId: 'c1', title: 'Send updated proposal', description: 'Include new pricing tier', dueDate: '2024-12-26', priority: 'high', assignee: 'John Smith', completed: false, createdAt: '2024-12-22' },
  { id: 't2', clientId: 'c2', title: 'Schedule renewal call', description: 'Discuss 2025 contract', dueDate: '2024-12-28', priority: 'medium', assignee: 'Emily Davis', completed: false, createdAt: '2024-12-20' },
  { id: 't3', clientId: 'c3', title: 'Send case studies', description: 'VC-focused success stories', dueDate: '2024-12-27', priority: 'medium', assignee: 'John Smith', completed: false, createdAt: '2024-12-21' },
  { id: 't4', clientId: 'c4', title: 'Follow up on demo request', dueDate: '2024-12-24', priority: 'urgent', assignee: 'Emily Davis', completed: false, createdAt: '2024-12-18' },
]

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
const mockClientsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Client Retention', description: '96% client retention rate this quarter. Up 4% from last quarter.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Retention' },
  { id: '2', type: 'info' as const, title: 'Revenue Opportunity', description: '12 clients ready for upsell based on usage patterns.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Revenue' },
  { id: '3', type: 'warning' as const, title: 'At-Risk Client', description: 'Acme Corp showing decreased engagement. Schedule check-in.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Risk' },
]

const mockClientsCollaborators = [
  { id: '1', name: 'Account Manager', avatar: '/avatars/am.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Success Lead', avatar: '/avatars/cs.jpg', status: 'online' as const, role: 'Lead' },
  { id: '3', name: 'Support Rep', avatar: '/avatars/support.jpg', status: 'away' as const, role: 'Support' },
]

const mockClientsPredictions = [
  { id: '1', title: 'Q1 Revenue', prediction: '$2.4M projected from client base', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'New Clients', prediction: '8 new enterprise clients expected', confidence: 72, trend: 'up' as const, impact: 'medium' as const },
]

const mockClientsActivities = [
  { id: '1', user: 'Sarah Chen', action: 'Closed deal with', target: 'TechCorp ($50K)', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Mike Johnson', action: 'Scheduled call with', target: 'Innovate Inc', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Lisa Park', action: 'Updated status for', target: 'GlobalTech', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialog states for TODO handlers
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showCustomFieldDialog, setShowCustomFieldDialog] = useState(false)
  const [showStageEditorDialog, setShowStageEditorDialog] = useState(false)
  const [showAddStageDialog, setShowAddStageDialog] = useState(false)
  const [showWorkflowBuilderDialog, setShowWorkflowBuilderDialog] = useState(false)
  const [showSequenceDialog, setShowSequenceDialog] = useState(false)
  const [showMarketplaceDialog, setShowMarketplaceDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showApiKeyConfirmDialog, setShowApiKeyConfirmDialog] = useState(false)
  const [showAuditLogDialog, setShowAuditLogDialog] = useState(false)
  const [showMergeDuplicatesDialog, setShowMergeDuplicatesDialog] = useState(false)
  const [showCreateDealDialog, setShowCreateDealDialog] = useState(false)
  const [showScheduleMeetingDialog, setShowScheduleMeetingDialog] = useState(false)
  const [showEmailComposeDialog, setShowEmailComposeDialog] = useState(false)
  const [showClientHistoryDialog, setShowClientHistoryDialog] = useState(false)
  const [selectedClientForAction, setSelectedClientForAction] = useState<Client | null>(null)

  // Form states for dialogs
  const [activityForm, setActivityForm] = useState({
    type: 'call' as 'call' | 'email' | 'meeting' | 'note',
    title: '',
    description: '',
    clientId: ''
  })
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as Priority,
    assignee: '',
    clientId: ''
  })
  const [customFieldForm, setCustomFieldForm] = useState({
    name: '',
    type: 'text' as 'text' | 'number' | 'date' | 'select',
    required: false
  })
  const [stageForm, setStageForm] = useState({
    name: '',
    probability: 50,
    color: 'blue'
  })
  const [editingStage, setEditingStage] = useState<{ name: string; prob: number; color: string } | null>(null)
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    trigger: 'lead_created',
    action: 'send_email'
  })
  const [sequenceForm, setSequenceForm] = useState({
    name: '',
    emailCount: 3,
    delay: 2
  })
  const [importFile, setImportFile] = useState<File | null>(null)

  // Form states for new dialogs
  const [dealForm, setDealForm] = useState({
    name: '',
    value: '',
    stage: 'qualification' as DealStage,
    probability: 25,
    expectedClose: '',
    products: '',
    notes: ''
  })
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    location: '',
    notes: '',
    attendees: ''
  })
  const [emailForm, setEmailForm] = useState({
    subject: '',
    body: '',
    cc: '',
    bcc: ''
  })

  // Database integration - use real clients hook
  const { clients: dbClients, fetchClients, createClient, updateClient, deleteClient, archiveClient, isLoading: clientsLoading } = useClients()

  // Deals module integration
  const { createDeal, updateDeal, deals: dbDeals, loading: dealsLoading } = useDeals()

  // Form state for new client
  const [newClientForm, setNewClientForm] = useState({
    company: '',
    industry: 'Technology',
    website: '',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    status: 'prospect' as 'active' | 'inactive' | 'prospect' | 'lead' | 'churned'
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
    status: 'active' as 'active' | 'inactive' | 'prospect' | 'lead' | 'churned'
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
        status: dbClient.status || 'active'
      })
    } else {
      // Mock client format
      setEditClientForm({
        id: client.id,
        company: client.company || '',
        industry: client.industry || 'Technology',
        website: client.website || '',
        contactName: client.primaryContact?.name || client.name || '',
        email: client.primaryContact?.email || client.email || '',
        phone: client.primaryContact?.phone || client.phone || '',
        status: client.status === 'customer' ? 'active' : (client.status as any) || 'active'
      })
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
      lifetime_value: c.total_revenue || 0,
      projects: c.total_projects || 0,
      health_score: c.rating ? c.rating * 20 : 50,
      nps: c.rating,
      createdAt: c.created_at,
      lastActivity: c.last_contact_at || c.updated_at,
      tags: c.tags || [],
      address: {
        city: c.city || '',
        state: '',
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

    // Combine database and mock clients, database clients first
    let result = [...dbClientsTransformed, ...mockClients]

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
    const dbClientCount = dbClients.length
    return {
      totalClients: mockClients.length + dbClientCount,
      totalCustomers: customers.length,
      totalRevenue: allClients.reduce((sum, c) => sum + (c.revenue || 0), 0),
      totalLTV: allClients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0),
      avgHealthScore: customers.length > 0 ? customers.reduce((sum, c) => sum + (c.health_score || 0), 0) / customers.length : 0,
      pipelineValue: mockClients.flatMap(c => c.deals).filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').reduce((sum, d) => sum + (d.value * d.probability / 100), 0),
      openDeals: mockClients.flatMap(c => c.deals).filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length,
      pendingTasks: mockTasks.filter(t => !t.completed).length
    }
  }, [filteredClients, dbClients])

  // Pipeline stages for kanban
  const pipelineStages: { stage: DealStage; label: string; color: string }[] = [
    { stage: 'qualification', label: 'Qualification', color: 'blue' },
    { stage: 'discovery', label: 'Discovery', color: 'purple' },
    { stage: 'proposal', label: 'Proposal', color: 'amber' },
    { stage: 'negotiation', label: 'Negotiation', color: 'orange' },
    { stage: 'closed_won', label: 'Won', color: 'green' },
  ]

  const allDeals = mockClients.flatMap(c => c.deals.map(d => ({ ...d, clientName: c.name, clientId: c.id })))

  // Handlers
  const handleExportClients = () => {
    // Export clients to CSV using real function
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
    downloadAsCsv(exportData, `clients-export-${new Date().toISOString().split('T')[0]}`)
  }

  const handleCreateDeal = (client: typeof mockClients[0]) => {
    // Open deal creation dialog with client pre-selected
    setSelectedClientForAction(client as Client)
    setDealForm({
      name: '',
      value: '',
      stage: 'qualification',
      probability: 25,
      expectedClose: '',
      products: '',
      notes: ''
    })
    setShowCreateDealDialog(true)
  }

  // Submit deal creation - integrated with useDeals hook
  const handleSubmitDeal = async () => {
    if (!dealForm.name || !dealForm.value || !selectedClientForAction) {
      toast.error('Please fill in deal name and value')
      return
    }
    setIsSubmitting(true)
    try {
      // Map form stage to deal stage
      const stageMap: Record<string, 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'> = {
        'qualification': 'lead',
        'discovery': 'qualified',
        'proposal': 'proposal',
        'negotiation': 'negotiation',
        'closed_won': 'closed_won',
        'closed_lost': 'closed_lost'
      }

      await toast.promise(
        createDeal({
          client_id: selectedClientForAction.id,
          title: dealForm.name,
          value: parseFloat(dealForm.value),
          stage: stageMap[dealForm.stage] || 'lead',
          probability: dealForm.probability,
          expected_close_date: dealForm.expectedClose || null,
          description: dealForm.notes || null,
          tags: dealForm.products ? dealForm.products.split(',').map(p => p.trim()) : []
        }),
        {
          loading: `Creating deal for ${selectedClientForAction.company}...`,
          success: `Deal "${dealForm.name}" created successfully with value ${formatCurrency(parseFloat(dealForm.value))}`,
          error: 'Failed to create deal'
        }
      )
      setShowCreateDealDialog(false)
      setSelectedClientForAction(null)
      setDealForm({
        name: '',
        value: '',
        stage: 'qualification',
        probability: 25,
        expectedClose: '',
        products: '',
        notes: ''
      })
      setActiveTab('pipeline')
    } catch (error) {
      console.error('Failed to create deal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendMessage = (client: typeof mockClients[0]) => {
    // Open email compose dialog
    if (client.primaryContact.email) {
      setSelectedClientForAction(client as Client)
      setEmailForm({
        subject: `Hello from FreeFlow - ${client.company}`,
        body: `Dear ${client.primaryContact.name},\n\n`,
        cc: '',
        bcc: ''
      })
      setShowEmailComposeDialog(true)
    } else {
      toast.error('No email available', {
        description: 'This client does not have an email address'
      })
    }
  }

  // Submit email
  const handleSubmitEmail = async () => {
    if (!emailForm.subject || !emailForm.body || !selectedClientForAction) {
      toast.error('Please fill in subject and message')
      return
    }
    setIsSubmitting(true)
    try {
      await toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: `Sending email to ${selectedClientForAction.primaryContact.name}...`,
          success: `Email sent successfully to ${selectedClientForAction.primaryContact.email}`,
          error: 'Failed to send email'
        }
      )
      setShowEmailComposeDialog(false)
      setSelectedClientForAction(null)
      setEmailForm({ subject: '', body: '', cc: '', bcc: '' })
    } catch (error) {
      console.error('Failed to send email:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open in native email client
  const handleOpenInEmailClient = () => {
    if (!selectedClientForAction) return
    const mailtoUrl = `mailto:${selectedClientForAction.primaryContact.email}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.body)}${emailForm.cc ? `&cc=${encodeURIComponent(emailForm.cc)}` : ''}${emailForm.bcc ? `&bcc=${encodeURIComponent(emailForm.bcc)}` : ''}`
    window.location.href = mailtoUrl
    toast.success('Opening email client')
    setShowEmailComposeDialog(false)
  }

  const handleScheduleMeeting = (client: typeof mockClients[0]) => {
    // Open meeting scheduling dialog
    setSelectedClientForAction(client as Client)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setMeetingForm({
      title: `Meeting with ${client.company}`,
      date: tomorrow.toISOString().split('T')[0],
      time: '10:00',
      duration: '30',
      location: 'Video Call',
      notes: '',
      attendees: client.primaryContact.email
    })
    setShowScheduleMeetingDialog(true)
  }

  // Submit meeting scheduling - integrated with Calendar API
  const handleSubmitMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time || !selectedClientForAction) {
      toast.error('Please fill in meeting title, date, and time')
      return
    }
    setIsSubmitting(true)
    try {
      // Calculate start and end times
      const startDate = new Date(`${meetingForm.date}T${meetingForm.time}`)
      const endDate = new Date(startDate.getTime() + parseInt(meetingForm.duration) * 60000)

      await toast.promise(
        fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-event',
            title: meetingForm.title,
            description: meetingForm.notes || `Meeting with ${selectedClientForAction.company}`,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            location: meetingForm.location || 'Video Call',
            locationType: meetingForm.location?.toLowerCase().includes('video') ? 'video' : 'in-person',
            clientId: selectedClientForAction.id,
            attendees: meetingForm.attendees ? meetingForm.attendees.split(',').map(e => ({
              email: e.trim(),
              name: e.trim().split('@')[0],
              status: 'pending'
            })) : []
          })
        }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Failed to create event')
          }
          return res.json()
        }),
        {
          loading: `Scheduling meeting with ${selectedClientForAction.company}...`,
          success: `Meeting "${meetingForm.title}" scheduled for ${meetingForm.date} at ${meetingForm.time}`,
          error: 'Failed to schedule meeting'
        }
      )
      setShowScheduleMeetingDialog(false)
      setSelectedClientForAction(null)
      setMeetingForm({ title: '', date: '', time: '', duration: '30', location: '', notes: '', attendees: '' })
    } catch (error) {
      console.error('Failed to schedule meeting:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open in Google Calendar
  const handleOpenInGoogleCalendar = () => {
    if (!selectedClientForAction) return
    const startDate = new Date(`${meetingForm.date}T${meetingForm.time}`)
    const endDate = new Date(startDate.getTime() + parseInt(meetingForm.duration) * 60000)
    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '')
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meetingForm.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(meetingForm.notes)}&location=${encodeURIComponent(meetingForm.location)}&add=${encodeURIComponent(meetingForm.attendees)}`
    window.open(calUrl, '_blank')
    toast.success('Opening Google Calendar')
  }

  // View client history
  const handleViewClientHistory = (client: typeof mockClients[0]) => {
    setSelectedClientForAction(client as Client)
    setShowClientHistoryDialog(true)
  }

  const handleCallClient = (client: typeof mockClients[0]) => {
    if (client.primaryContact.phone) {
      window.location.href = `tel:${client.primaryContact.phone}`
      toast.success('Initiating call', {
        description: `Calling ${client.primaryContact.name}`
      })
    } else {
      toast.error('No phone number available', {
        description: 'This client does not have a phone number'
      })
    }
  }

  // Quick actions with real functionality - defined inside component to access state
  const mockClientsQuickActions = [
    {
      id: '1',
      label: 'Add Client',
      icon: 'plus',
      action: () => setShowAddDialog(true),
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Export Clients',
      icon: 'download',
      action: handleExportClients,
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Refresh Data',
      icon: 'refresh-cw',
      action: () => {
        fetchClients()
        toast.success('Client data refreshed')
      },
      variant: 'outline' as const
    },
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
          </div>
        </div>

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
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
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
                  <Button variant="outline" size="sm" onClick={() => setShowActivityDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {mockActivities.map(activity => {
                      const client = mockClients.find(c => c.id === activity.clientId)
                      return (
                        <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'call' ? 'bg-green-100 text-green-600' :
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
              <Button variant="outline" size="sm" onClick={() => setShowTaskDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTasks.filter(t => !t.completed).map(task => {
                const client = mockClients.find(c => c.id === task.clientId)
                const isOverdue = new Date(task.dueDate) < new Date()
                return (
                  <Card key={task.id} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                          task.priority === 'urgent' ? 'border-red-500' :
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
                      const tierClients = mockClients.filter(c => c.tier === tier as any)
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
                      const count = mockClients.filter(c => c.status === status).length
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
                    {Array.from(new Set(mockClients.map(c => c.industry))).map(industry => {
                      const count = mockClients.filter(c => c.industry === industry).length
                      const revenue = mockClients.filter(c => c.industry === industry).reduce((sum, c) => sum + c.revenue, 0)
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
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                      settingsTab === item.id
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
                        <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                        <Button variant="outline" className="w-full" onClick={() => setShowCustomFieldDialog(true)}>
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
                        <div className="grid grid-cols-3 gap-4">
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
                              <Button variant="ghost" size="sm" onClick={() => { setEditingStage(stage); setShowStageEditorDialog(true); }}>Edit</Button>
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
                        <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
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
                        <Button variant="outline" className="w-full" onClick={() => setShowWorkflowBuilderDialog(true)}>
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
                        <Button variant="outline" className="w-full" onClick={() => setShowSequenceDialog(true)}>
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
                        <Button variant="outline" className="w-full" onClick={() => setShowMarketplaceDialog(true)}>
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
                          <div className="grid grid-cols-2 gap-4 mt-2">
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
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={handleExportClients}>
                            <Download className="w-5 h-5" />
                            <span>Export Data</span>
                          </Button>
                          <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setShowImportDialog(true)}>
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
                        <Button variant="outline" className="w-full" onClick={() => setShowApiKeyConfirmDialog(true)}>
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
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete all activities? This cannot be undone.')) {
                                  toast.success('Activities deleted')
                                }
                              }}
                            >
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
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => setShowMergeDuplicatesDialog(true)}
                            >
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
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => {
                                if (confirm('Are you sure you want to reset all CRM data? This cannot be undone.')) {
                                  toast.error('CRM data reset - This would delete all data in production')
                                }
                              }}
                            >
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
              insights={mockClientsAIInsights}
              title="Client Intelligence"
              onInsightAction={(insight) => {
                // Handle insight actions based on type
                if (insight.type === 'warning') {
                  toast.warning(`Action needed: ${insight.title}`, {
                    description: insight.description,
                    action: {
                      label: 'View Details',
                      onClick: () => setActiveTab('clients')
                    }
                  })
                } else if (insight.type === 'success') {
                  toast.success(insight.title, {
                    description: insight.description
                  })
                } else {
                  toast.info(insight.title, {
                    description: insight.description,
                    action: {
                      label: 'Explore',
                      onClick: () => setActiveTab('reports')
                    }
                  })
                }
              }}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockClientsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockClientsPredictions}
              title="Client Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockClientsActivities}
            title="Client Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockClientsQuickActions}
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

                <div className="flex flex-wrap gap-2 mt-6">
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
                  <Button variant="outline" onClick={() => handleCreateDeal(selectedClient)}>
                    <Handshake className="w-4 h-4 mr-2" />
                    New Deal
                  </Button>
                  <Button variant="outline" onClick={() => handleViewClientHistory(selectedClient)}>
                    <Activity className="w-4 h-4 mr-2" />
                    History
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setActivityForm({ type: 'note', title: '', description: '', clientId: selectedClient.id })
                    setShowActivityDialog(true)
                  }}>
                    <FileText className="w-4 h-4 mr-2" />
                    Add Note
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
              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4 mt-4">
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
              <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-4">
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

        {/* Log Activity Dialog */}
        <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Activity</DialogTitle>
              <DialogDescription>Record a new activity for client tracking</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Activity Type</Label>
                <Select value={activityForm.type} onValueChange={(value) => setActivityForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Client</Label>
                <Select value={activityForm.clientId} onValueChange={(value) => setActivityForm(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {mockClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="Activity title"
                  className="mt-1"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the activity..."
                  className="mt-1"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowActivityDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!activityForm.title || !activityForm.clientId) {
                    toast.error('Please fill in required fields')
                    return
                  }
                  const loadingId = toast.loading('Logging activity...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success(`Activity "${activityForm.title}" logged successfully`)
                    setShowActivityDialog(false)
                    setActivityForm({ type: 'call', title: '', description: '', clientId: '' })
                  }, 1000)
                }}
                disabled={!activityForm.title || !activityForm.clientId}
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Add a new task for a client</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Task Title *</Label>
                <Input
                  placeholder="Enter task title"
                  className="mt-1"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Client</Label>
                <Select value={taskForm.clientId} onValueChange={(value) => setTaskForm(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {mockClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value as Priority }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                <Label>Description</Label>
                <Textarea
                  placeholder="Task description..."
                  className="mt-1"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label>Assignee</Label>
                <Input
                  placeholder="Assign to..."
                  className="mt-1"
                  value={taskForm.assignee}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, assignee: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!taskForm.title) {
                    toast.error('Please enter a task title')
                    return
                  }
                  const loadingId = toast.loading('Creating task...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success(`Task "${taskForm.title}" created successfully`)
                    setShowTaskDialog(false)
                    setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', assignee: '', clientId: '' })
                  }, 1000)
                }}
                disabled={!taskForm.title}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Custom Field Dialog */}
        <Dialog open={showCustomFieldDialog} onOpenChange={setShowCustomFieldDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Custom Field</DialogTitle>
              <DialogDescription>Create a new custom field for client records</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Field Name *</Label>
                <Input
                  placeholder="e.g., Contract Value"
                  className="mt-1"
                  value={customFieldForm.name}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Field Type</Label>
                <Select value={customFieldForm.type} onValueChange={(value) => setCustomFieldForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Required Field</p>
                  <p className="text-sm text-gray-500">Make this field mandatory</p>
                </div>
                <Switch
                  checked={customFieldForm.required}
                  onCheckedChange={(checked) => setCustomFieldForm(prev => ({ ...prev, required: checked }))}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowCustomFieldDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!customFieldForm.name) {
                    toast.error('Please enter a field name')
                    return
                  }
                  const loadingId = toast.loading('Creating custom field...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success(`Custom field "${customFieldForm.name}" created`)
                    setShowCustomFieldDialog(false)
                    setCustomFieldForm({ name: '', type: 'text', required: false })
                  }, 1000)
                }}
                disabled={!customFieldForm.name}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Stage Dialog */}
        <Dialog open={showStageEditorDialog} onOpenChange={(open) => { setShowStageEditorDialog(open); if (!open) setEditingStage(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Pipeline Stage</DialogTitle>
              <DialogDescription>Modify the stage settings</DialogDescription>
            </DialogHeader>
            {editingStage && (
              <div className="space-y-4">
                <div>
                  <Label>Stage Name</Label>
                  <Input
                    className="mt-1"
                    defaultValue={editingStage.name}
                  />
                </div>
                <div>
                  <Label>Win Probability (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="mt-1"
                    defaultValue={editingStage.prob}
                  />
                </div>
                <div>
                  <Label>Stage Color</Label>
                  <Select defaultValue={editingStage.color.replace('bg-', '').replace('-500', '')}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gray">Gray</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowStageEditorDialog(false); setEditingStage(null); }}>Cancel</Button>
              <Button
                onClick={() => {
                  const loadingId = toast.loading('Updating stage...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success(`Stage "${editingStage?.name}" updated successfully`)
                    setShowStageEditorDialog(false)
                    setEditingStage(null)
                  }, 1000)
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Stage Dialog */}
        <Dialog open={showAddStageDialog} onOpenChange={setShowAddStageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Pipeline Stage</DialogTitle>
              <DialogDescription>Create a new stage in your sales pipeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Stage Name *</Label>
                <Input
                  placeholder="e.g., Demo Scheduled"
                  className="mt-1"
                  value={stageForm.name}
                  onChange={(e) => setStageForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Win Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  className="mt-1"
                  value={stageForm.probability}
                  onChange={(e) => setStageForm(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Stage Color</Label>
                <Select value={stageForm.color} onValueChange={(value) => setStageForm(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowAddStageDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!stageForm.name) {
                    toast.error('Please enter a stage name')
                    return
                  }
                  const loadingId = toast.loading('Creating stage...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success(`Stage "${stageForm.name}" created successfully`)
                    setShowAddStageDialog(false)
                    setStageForm({ name: '', probability: 50, color: 'blue' })
                  }, 1000)
                }}
                disabled={!stageForm.name}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Workflow Builder Dialog */}
        <Dialog open={showWorkflowBuilderDialog} onOpenChange={setShowWorkflowBuilderDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Custom Workflow</DialogTitle>
              <DialogDescription>Automate your sales process with custom workflows</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Workflow Name *</Label>
                <Input
                  placeholder="e.g., New Lead Follow-up"
                  className="mt-1"
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Trigger Event</Label>
                <Select value={workflowForm.trigger} onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, trigger: value }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_created">New Lead Created</SelectItem>
                    <SelectItem value="deal_stage_change">Deal Stage Changed</SelectItem>
                    <SelectItem value="client_inactive">Client Inactive 30+ Days</SelectItem>
                    <SelectItem value="deal_won">Deal Won</SelectItem>
                    <SelectItem value="deal_lost">Deal Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action</Label>
                <Select value={workflowForm.action} onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, action: value }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_email">Send Email</SelectItem>
                    <SelectItem value="create_task">Create Task</SelectItem>
                    <SelectItem value="notify_team">Notify Team Member</SelectItem>
                    <SelectItem value="update_field">Update Field</SelectItem>
                    <SelectItem value="add_tag">Add Tag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Preview:</strong> When {workflowForm.trigger.replace(/_/g, ' ')}, automatically {workflowForm.action.replace(/_/g, ' ')}.
                </p>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowWorkflowBuilderDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!workflowForm.name) {
                    toast.error('Please enter a workflow name')
                    return
                  }
                  const loadingId = toast.loading('Creating workflow...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success(`Workflow "${workflowForm.name}" created and activated`)
                    setShowWorkflowBuilderDialog(false)
                    setWorkflowForm({ name: '', trigger: 'lead_created', action: 'send_email' })
                  }, 1500)
                }}
                disabled={!workflowForm.name}
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Sequence Dialog */}
        <Dialog open={showSequenceDialog} onOpenChange={setShowSequenceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Email Sequence</DialogTitle>
              <DialogDescription>Set up an automated email campaign</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Sequence Name *</Label>
                <Input
                  placeholder="e.g., Onboarding Sequence"
                  className="mt-1"
                  value={sequenceForm.name}
                  onChange={(e) => setSequenceForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Emails</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    className="mt-1"
                    value={sequenceForm.emailCount}
                    onChange={(e) => setSequenceForm(prev => ({ ...prev, emailCount: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label>Days Between Emails</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    className="mt-1"
                    value={sequenceForm.delay}
                    onChange={(e) => setSequenceForm(prev => ({ ...prev, delay: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <p className="font-medium text-sm">Sequence Preview</p>
                {Array.from({ length: Math.min(sequenceForm.emailCount, 5) }, (_, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>Email {i + 1}</span>
                    <span className="text-gray-400">- Day {i * sequenceForm.delay + 1}</span>
                  </div>
                ))}
                {sequenceForm.emailCount > 5 && (
                  <p className="text-sm text-gray-500">+ {sequenceForm.emailCount - 5} more emails...</p>
                )}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowSequenceDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!sequenceForm.name) {
                    toast.error('Please enter a sequence name')
                    return
                  }
                  const loadingId = toast.loading('Creating sequence...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success(`Email sequence "${sequenceForm.name}" created with ${sequenceForm.emailCount} emails`)
                    setShowSequenceDialog(false)
                    setSequenceForm({ name: '', emailCount: 3, delay: 2 })
                  }, 1500)
                }}
                disabled={!sequenceForm.name}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Sequence
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* App Marketplace Dialog */}
        <Dialog open={showMarketplaceDialog} onOpenChange={setShowMarketplaceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>App Marketplace</DialogTitle>
              <DialogDescription>Connect third-party apps to extend your CRM</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Search apps..." className="w-full" />
              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {[
                  { name: 'Salesforce', description: 'Sync data with Salesforce', category: 'CRM', installed: false },
                  { name: 'Mailchimp', description: 'Email marketing automation', category: 'Marketing', installed: false },
                  { name: 'Stripe', description: 'Payment processing', category: 'Finance', installed: true },
                  { name: 'Zapier', description: 'Connect 5000+ apps', category: 'Automation', installed: false },
                  { name: 'QuickBooks', description: 'Accounting software', category: 'Finance', installed: false },
                  { name: 'Intercom', description: 'Customer messaging', category: 'Support', installed: true },
                  { name: 'DocuSign', description: 'E-signatures', category: 'Documents', installed: false },
                  { name: 'Calendly', description: 'Scheduling automation', category: 'Calendar', installed: true },
                ].map((app) => (
                  <div key={app.name} className="p-4 border rounded-lg hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{app.name}</span>
                      <Badge className={app.installed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {app.installed ? 'Installed' : 'Available'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{app.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{app.category}</Badge>
                      <Button
                        size="sm"
                        variant={app.installed ? 'outline' : 'default'}
                        onClick={() => {
                          if (app.installed) {
                            toast.success(`${app.name} settings opened`)
                          } else {
                            const loadingId = toast.loading(`Installing ${app.name}...`)
                            setTimeout(() => {
                              toast.dismiss(loadingId)
                              toast.success(`${app.name} installed successfully`)
                            }, 1500)
                          }
                        }}
                      >
                        {app.installed ? 'Configure' : 'Install'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowMarketplaceDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Data Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Import Data</DialogTitle>
              <DialogDescription>Import clients from CSV or Excel file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">Drag and drop your file here, or</p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImportFile(file)
                        toast.success(`File "${file.name}" selected`)
                      }
                    }}
                  />
                  <Button variant="outline" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
                {importFile && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">Selected: {importFile.name}</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-sm mb-2">Supported Formats</p>
                <div className="flex gap-2">
                  <Badge variant="secondary">CSV</Badge>
                  <Badge variant="secondary">XLSX</Badge>
                  <Badge variant="secondary">XLS</Badge>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-1">Required columns:</p>
                <p>Company Name, Contact Name, Email</p>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowImportDialog(false); setImportFile(null); }}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!importFile) {
                    toast.error('Please select a file to import')
                    return
                  }
                  const loadingId = toast.loading('Importing data...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success(`Successfully imported data from ${importFile.name}`)
                    setShowImportDialog(false)
                    setImportFile(null)
                  }, 2000)
                }}
                disabled={!importFile}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Confirmation Dialog */}
        <Dialog open={showApiKeyConfirmDialog} onOpenChange={setShowApiKeyConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                Regenerate API Key
              </DialogTitle>
              <DialogDescription>This action will invalidate your current API key</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Warning:</strong> All existing integrations using the current API key will stop working. You will need to update your integrations with the new key.
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Are you sure you want to regenerate your API key?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApiKeyConfirmDialog(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const loadingId = toast.loading('Generating new API key...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success('New API key generated successfully. Please update your integrations.')
                    setShowApiKeyConfirmDialog(false)
                  }, 1500)
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Audit Log Dialog */}
        <Dialog open={showAuditLogDialog} onOpenChange={setShowAuditLogDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Audit Log</DialogTitle>
              <DialogDescription>Track all changes made in your CRM</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input placeholder="Search logs..." className="flex-1" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Created</SelectItem>
                    <SelectItem value="update">Updated</SelectItem>
                    <SelectItem value="delete">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {[
                    { action: 'Updated', entity: 'Client: TechCorp International', user: 'John Smith', time: '2 minutes ago', type: 'update' },
                    { action: 'Created', entity: 'Deal: Enterprise License Q1', user: 'Sarah Chen', time: '15 minutes ago', type: 'create' },
                    { action: 'Deleted', entity: 'Task: Follow-up call', user: 'Mike Johnson', time: '1 hour ago', type: 'delete' },
                    { action: 'Updated', entity: 'Client: Global Innovations', user: 'Emily Davis', time: '2 hours ago', type: 'update' },
                    { action: 'Created', entity: 'Activity: Meeting scheduled', user: 'John Smith', time: '3 hours ago', type: 'create' },
                    { action: 'Updated', entity: 'Deal: Platform Expansion', user: 'Sarah Chen', time: '5 hours ago', type: 'update' },
                    { action: 'Created', entity: 'Client: New Horizons LLC', user: 'Mike Johnson', time: 'Yesterday', type: 'create' },
                    { action: 'Deleted', entity: 'Note: Old meeting notes', user: 'Emily Davis', time: 'Yesterday', type: 'delete' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          log.type === 'create' ? 'bg-green-100 text-green-700' :
                          log.type === 'update' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {log.action}
                        </Badge>
                        <span className="font-medium">{log.entity}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{log.user}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowAuditLogDialog(false)}>Close</Button>
              <Button
                variant="outline"
                onClick={() => {
                  const loadingId = toast.loading('Exporting audit log...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success('Audit log exported to audit_log.csv')
                  }, 1500)
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Log
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Merge Duplicates Dialog */}
        <Dialog open={showMergeDuplicatesDialog} onOpenChange={setShowMergeDuplicatesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Merge Duplicate Clients
              </DialogTitle>
              <DialogDescription>Review and merge potential duplicate client records</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  We found 3 potential duplicate groups. Review each group and select which record to keep.
                </p>
              </div>
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {[
                    { primary: 'TechCorp International', duplicates: ['Tech Corp Inc', 'TechCorp'] },
                    { primary: 'Global Innovations Ltd', duplicates: ['Global Innovations'] },
                    { primary: 'StartUp Hub Inc', duplicates: ['Startup Hub', 'Start Up Hub'] },
                  ].map((group, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Duplicate Group {i + 1}</span>
                        <Badge>{group.duplicates.length + 1} records</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border-2 border-green-300">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>{group.primary}</span>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Primary</Badge>
                        </div>
                        {group.duplicates.map((dup, j) => (
                          <div key={j} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-gray-600">{dup}</span>
                            <Button size="sm" variant="ghost" className="text-red-600">
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowMergeDuplicatesDialog(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const loadingId = toast.loading('Merging duplicate records...')
                  setTimeout(() => {
                    toast.dismiss(loadingId)
                    toast.success('5 duplicate records merged successfully')
                    setShowMergeDuplicatesDialog(false)
                  }, 2000)
                }}
              >
                <Handshake className="w-4 h-4 mr-2" />
                Merge All Duplicates
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Deal Dialog */}
        <Dialog open={showCreateDealDialog} onOpenChange={setShowCreateDealDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
              <DialogDescription>
                {selectedClientForAction ? `Creating deal for ${selectedClientForAction.company}` : 'Create a new sales opportunity'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Deal Name *</Label>
                <Input
                  placeholder="e.g., Enterprise License Q1"
                  className="mt-1"
                  value={dealForm.name}
                  onChange={(e) => setDealForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Deal Value *</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="50000"
                      className="pl-9"
                      value={dealForm.value}
                      onChange={(e) => setDealForm(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Stage</Label>
                  <Select value={dealForm.stage} onValueChange={(value) => setDealForm(prev => ({ ...prev, stage: value as DealStage }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualification">Qualification</SelectItem>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Win Probability (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="mt-1"
                    value={dealForm.probability}
                    onChange={(e) => setDealForm(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Expected Close Date</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={dealForm.expectedClose}
                    onChange={(e) => setDealForm(prev => ({ ...prev, expectedClose: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Products/Services</Label>
                <Input
                  placeholder="e.g., Enterprise Suite, API Access"
                  className="mt-1"
                  value={dealForm.products}
                  onChange={(e) => setDealForm(prev => ({ ...prev, products: e.target.value }))}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional details about the deal..."
                  className="mt-1"
                  value={dealForm.notes}
                  onChange={(e) => setDealForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              {dealForm.value && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weighted Value:</span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(parseFloat(dealForm.value) * dealForm.probability / 100)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowCreateDealDialog(false); setSelectedClientForAction(null); }}>Cancel</Button>
              <Button
                onClick={handleSubmitDeal}
                disabled={isSubmitting || !dealForm.name || !dealForm.value}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Handshake className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Creating...' : 'Create Deal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Meeting Dialog */}
        <Dialog open={showScheduleMeetingDialog} onOpenChange={setShowScheduleMeetingDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Meeting</DialogTitle>
              <DialogDescription>
                {selectedClientForAction ? `Schedule a meeting with ${selectedClientForAction.company}` : 'Create a new meeting'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Meeting Title *</Label>
                <Input
                  placeholder="e.g., Discovery Call"
                  className="mt-1"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    className="mt-1"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Select value={meetingForm.duration} onValueChange={(value) => setMeetingForm(prev => ({ ...prev, duration: value }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                  <Select value={meetingForm.location} onValueChange={(value) => setMeetingForm(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video Call">Video Call</SelectItem>
                      <SelectItem value="Phone Call">Phone Call</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Client Site">Client Site</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Attendees</Label>
                <Input
                  placeholder="email@company.com, another@company.com"
                  className="mt-1"
                  value={meetingForm.attendees}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, attendees: e.target.value }))}
                />
              </div>
              <div>
                <Label>Notes/Agenda</Label>
                <Textarea
                  placeholder="Meeting agenda and notes..."
                  className="mt-1"
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => { setShowScheduleMeetingDialog(false); setSelectedClientForAction(null); }}>Cancel</Button>
              <Button variant="outline" onClick={handleOpenInGoogleCalendar}>
                <Calendar className="w-4 h-4 mr-2" />
                Open in Google Calendar
              </Button>
              <Button
                onClick={handleSubmitMeeting}
                disabled={isSubmitting || !meetingForm.title || !meetingForm.date || !meetingForm.time}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CalendarClock className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Compose Dialog */}
        <Dialog open={showEmailComposeDialog} onOpenChange={setShowEmailComposeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
              <DialogDescription>
                {selectedClientForAction ? `Sending to ${selectedClientForAction.primaryContact.name} (${selectedClientForAction.primaryContact.email})` : 'Compose a new email'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>To</Label>
                <Input
                  className="mt-1 bg-gray-50"
                  value={selectedClientForAction?.primaryContact.email || ''}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CC</Label>
                  <Input
                    placeholder="cc@company.com"
                    className="mt-1"
                    value={emailForm.cc}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, cc: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>BCC</Label>
                  <Input
                    placeholder="bcc@company.com"
                    className="mt-1"
                    value={emailForm.bcc}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, bcc: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Subject *</Label>
                <Input
                  placeholder="Email subject"
                  className="mt-1"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <Label>Message *</Label>
                <Textarea
                  placeholder="Write your message..."
                  className="mt-1 min-h-[200px]"
                  value={emailForm.body}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 text-sm text-gray-500">
                <Button variant="ghost" size="sm" onClick={() => setEmailForm(prev => ({ ...prev, body: prev.body + '\n\nBest regards,\n[Your Name]' }))}>
                  Add Signature
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEmailForm(prev => ({ ...prev, body: prev.body + '\n\nPlease find attached...' }))}>
                  Add Attachment Reference
                </Button>
              </div>
            </div>
            <DialogFooter className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => { setShowEmailComposeDialog(false); setSelectedClientForAction(null); }}>Cancel</Button>
              <Button variant="outline" onClick={handleOpenInEmailClient}>
                <Mail className="w-4 h-4 mr-2" />
                Open in Email Client
              </Button>
              <Button
                onClick={handleSubmitEmail}
                disabled={isSubmitting || !emailForm.subject || !emailForm.body}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Client History Dialog */}
        <Dialog open={showClientHistoryDialog} onOpenChange={setShowClientHistoryDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Client History</DialogTitle>
              <DialogDescription>
                {selectedClientForAction ? `Activity history for ${selectedClientForAction.company}` : 'View client history'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Tabs defaultValue="activities" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="deals">Deals</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="emails">Emails</TabsTrigger>
                </TabsList>
                <TabsContent value="activities" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {mockActivities
                        .filter(a => !selectedClientForAction || a.clientId === selectedClientForAction.id || selectedClientForAction.id.startsWith('c'))
                        .map(activity => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.type === 'call' ? 'bg-green-100 text-green-600' :
                              activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {activity.type === 'call' && <PhoneCall className="w-4 h-4" />}
                              {activity.type === 'email' && <Mail className="w-4 h-4" />}
                              {activity.type === 'meeting' && <Video className="w-4 h-4" />}
                              {activity.type === 'note' && <FileText className="w-4 h-4" />}
                              {activity.type === 'task' && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{activity.title}</span>
                                <Badge variant="secondary" className="text-xs">{activity.type}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>{activity.createdBy}</span>
                                <span>-</span>
                                <span>{formatRelativeTime(activity.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="deals" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {selectedClientForAction?.deals.map(deal => (
                        <div key={deal.id} className="p-4 border rounded-lg">
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
                      )) || (
                        <p className="text-center text-gray-500 py-8">No deals found for this client</p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="notes" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium">Meeting Notes</span>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-sm text-gray-600">Discussed expansion plans for Q1. Client interested in premium tier upgrade.</p>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium">Follow-up Required</span>
                          <span className="text-xs text-gray-500">1 week ago</span>
                        </div>
                        <p className="text-sm text-gray-600">Send updated proposal with new pricing structure.</p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="emails" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Re: Proposal Review</span>
                          <Badge variant="secondary">Sent</Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">Thank you for reviewing our proposal. I wanted to follow up on...</p>
                        <span className="text-xs text-gray-500">Yesterday at 2:30 PM</span>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Initial Proposal</span>
                          <Badge variant="secondary">Sent</Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">Please find attached our proposal for the enterprise solution...</p>
                        <span className="text-xs text-gray-500">3 days ago</span>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowClientHistoryDialog(false); setSelectedClientForAction(null); }}>Close</Button>
              <Button onClick={() => {
                setShowClientHistoryDialog(false)
                if (selectedClientForAction) {
                  setSelectedClient(selectedClientForAction)
                }
                setSelectedClientForAction(null)
              }}>
                <Users className="w-4 h-4 mr-2" />
                View Full Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
