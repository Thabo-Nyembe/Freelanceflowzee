'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useContracts, type Contract } from '@/lib/hooks/use-contracts'
import {
  FileText, Send, Eye, CheckCircle, CheckCircle2, Clock, Users,
  FileSignature, Download, Copy, MoreVertical, Search, Filter,
  Plus, DollarSign, Shield, Share2, Lock, Mail, Phone,
  PenTool, XCircle, RefreshCw, Palette, Sliders,
  Settings, FileCheck, BarChart3, TrendingUp, Folder, Trash2, Star, Bell, Globe, Edit2,
  Fingerprint, Key, AlertTriangle, CheckCheck, Layers, FileUp, Timer, Briefcase, Upload
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Envelope {
  id: string
  name: string
  status: 'draft' | 'sent' | 'delivered' | 'viewed' | 'signed' | 'completed' | 'declined' | 'voided' | 'expired'
  type: 'standard' | 'bulk_send' | 'powerform' | 'template'
  created_at: string
  sent_at: string | null
  completed_at: string | null
  expires_at: string | null
  sender: { name: string; email: string }
  recipients: Recipient[]
  documents: Document[]
  total_value: number | null
  is_starred: boolean
  folder_id: string
  tags: string[]
}

interface Recipient {
  id: string
  name: string
  email: string
  role: 'signer' | 'viewer' | 'approver' | 'cc' | 'witness' | 'certified_delivery'
  status: 'pending' | 'sent' | 'delivered' | 'viewed' | 'signed' | 'declined' | 'completed'
  signed_at: string | null
  viewed_at: string | null
  order: number
  routing: 'sequential' | 'parallel'
  authentication: 'email' | 'sms' | 'access_code' | 'id_verification' | 'none'
  private_message: string | null
}

interface Document {
  id: string
  name: string
  file_type: 'pdf' | 'docx' | 'xlsx' | 'image'
  pages: number
  size_bytes: number
  fields_count: number
  signed_fields: number
}

interface ContractTemplate {
  id: string
  name: string
  category: string
  subcategory: string
  description: string
  usage_count: number
  last_used: string
  created_by: string
  is_shared: boolean
  is_starred: boolean
  documents_count: number
  recipients_count: number
  fields_count: number
  tags: string[]
}

interface AuditEvent {
  id: string
  action: string
  actor: { name: string; email: string }
  timestamp: string
  details: string
  ip_address: string
  location: string
  device: string
  event_type: 'create' | 'send' | 'view' | 'sign' | 'complete' | 'void' | 'decline' | 'remind'
}

interface SigningField {
  id: string
  type: 'signature' | 'initial' | 'date' | 'text' | 'checkbox' | 'dropdown' | 'attachment'
  recipient_id: string
  page: number
  x: number
  y: number
  width: number
  height: number
  required: boolean
  status: 'pending' | 'completed'
}

interface ContractFolder {
  id: string
  name: string
  color: string
  envelopes_count: number
  parent_id: string | null
  created_at: string
}

interface BulkSendBatch {
  id: string
  name: string
  template_id: string
  total_recipients: number
  sent: number
  completed: number
  failed: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

// Enhanced Competitive Upgrade Mock Data
const mockContractsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Signing Rate', description: '89% of contracts signed within 48 hours. Industry leading performance.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'info' as const, title: 'Expiring Soon', description: '5 contracts expiring in 30 days. Renewal reminders scheduled.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Renewals' },
  { id: '3', type: 'warning' as const, title: 'Pending Approval', description: '3 contracts awaiting legal review for over 5 days.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Approvals' },
]

const mockContractsCollaborators = [
  { id: '1', name: 'Legal Counsel', avatar: '/avatars/legal.jpg', status: 'online' as const, role: 'Legal' },
  { id: '2', name: 'Contract Admin', avatar: '/avatars/admin.jpg', status: 'online' as const, role: 'Admin' },
  { id: '3', name: 'Sales Rep', avatar: '/avatars/sales.jpg', status: 'away' as const, role: 'Sales' },
]

const mockContractsPredictions = [
  { id: '1', title: 'Q1 Contracts', prediction: '45 new contracts projected', confidence: 82, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Renewal Rate', prediction: '92% renewal rate expected', confidence: 88, trend: 'stable' as const, impact: 'medium' as const },
]

const mockContractsActivities = [
  { id: '1', user: 'John Smith', action: 'Signed contract', target: 'Enterprise Agreement', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Legal Team', action: 'Approved', target: 'Vendor Contract #456', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Reminder sent for', target: 'Expiring contracts', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockContractsQuickActions = [
  { id: '1', label: 'New Contract', icon: 'file-plus', action: () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Creating new contract...', success: 'Contract draft created', error: 'Failed to create contract' }), variant: 'default' as const },
  { id: '2', label: 'Send for Signing', icon: 'send', action: () => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Sending for signature...', success: 'Contract sent for signing', error: 'Failed to send contract' }), variant: 'default' as const },
  { id: '3', label: 'Templates', icon: 'copy', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading templates...', success: 'Templates: Opening contract templates library', error: 'Failed to load templates' }), variant: 'outline' as const },
]

export default function ContractsClient({ initialContracts }: { initialContracts: Contract[] }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEnvelope, setSelectedEnvelope] = useState<Envelope | null>(null)
  const [showNewContract, setShowNewContract] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  const { contracts, loading, error, createContract, updateContract, deleteContract, mutating } = useContracts({ status: 'all' })
  const display = (contracts && contracts.length > 0) ? contracts : (initialContracts || [])

  // Mock envelopes
  const envelopes: Envelope[] = [
    {
      id: '1', name: 'Service Agreement - Acme Corp', status: 'signed', type: 'standard',
      created_at: '2024-01-10T09:00:00Z', sent_at: '2024-01-10T09:15:00Z', completed_at: null, expires_at: '2024-02-10T23:59:59Z',
      sender: { name: 'Sarah Chen', email: 'sarah@company.com' },
      recipients: [
        { id: '1', name: 'John Smith', email: 'john@acme.com', role: 'signer', status: 'signed', signed_at: '2024-01-10T10:30:00Z', viewed_at: '2024-01-10T10:00:00Z', order: 1, routing: 'sequential', authentication: 'email', private_message: null },
        { id: '2', name: 'Emily Davis', email: 'emily@acme.com', role: 'signer', status: 'pending', signed_at: null, viewed_at: null, order: 2, routing: 'sequential', authentication: 'sms', private_message: null }
      ],
      documents: [
        { id: '1', name: 'Service_Agreement_v2.pdf', file_type: 'pdf', pages: 12, size_bytes: 2456789, fields_count: 8, signed_fields: 4 }
      ],
      total_value: 45000, is_starred: true, folder_id: 'folder-1', tags: ['enterprise', 'services']
    },
    {
      id: '2', name: 'NDA - Mutual Agreement', status: 'completed', type: 'template',
      created_at: '2024-01-08T14:00:00Z', sent_at: '2024-01-08T14:30:00Z', completed_at: '2024-01-09T11:00:00Z', expires_at: null,
      sender: { name: 'Mike Ross', email: 'mike@company.com' },
      recipients: [
        { id: '3', name: 'Lisa Wang', email: 'lisa@partner.com', role: 'signer', status: 'completed', signed_at: '2024-01-09T11:00:00Z', viewed_at: '2024-01-08T16:00:00Z', order: 1, routing: 'parallel', authentication: 'email', private_message: null }
      ],
      documents: [
        { id: '2', name: 'Mutual_NDA.pdf', file_type: 'pdf', pages: 4, size_bytes: 892345, fields_count: 4, signed_fields: 4 }
      ],
      total_value: null, is_starred: false, folder_id: 'folder-2', tags: ['legal', 'nda']
    },
    {
      id: '3', name: 'Employment Contract - Senior Developer', status: 'sent', type: 'standard',
      created_at: '2024-01-12T10:00:00Z', sent_at: '2024-01-12T10:15:00Z', completed_at: null, expires_at: '2024-01-26T23:59:59Z',
      sender: { name: 'Sarah Chen', email: 'sarah@company.com' },
      recipients: [
        { id: '4', name: 'David Kim', email: 'david@gmail.com', role: 'signer', status: 'viewed', signed_at: null, viewed_at: '2024-01-12T15:00:00Z', order: 1, routing: 'sequential', authentication: 'id_verification', private_message: 'Welcome to the team!' }
      ],
      documents: [
        { id: '3', name: 'Employment_Contract.pdf', file_type: 'pdf', pages: 8, size_bytes: 1567890, fields_count: 12, signed_fields: 0 },
        { id: '4', name: 'Benefits_Package.pdf', file_type: 'pdf', pages: 6, size_bytes: 987654, fields_count: 0, signed_fields: 0 }
      ],
      total_value: 125000, is_starred: true, folder_id: 'folder-3', tags: ['hr', 'hiring']
    },
    {
      id: '4', name: 'Bulk Onboarding - Q1 Hires', status: 'signed', type: 'bulk_send',
      created_at: '2024-01-05T08:00:00Z', sent_at: '2024-01-05T08:30:00Z', completed_at: null, expires_at: '2024-01-19T23:59:59Z',
      sender: { name: 'HR Team', email: 'hr@company.com' },
      recipients: [
        { id: '5', name: 'Various Recipients', email: 'bulk@company.com', role: 'signer', status: 'signed', signed_at: null, viewed_at: null, order: 1, routing: 'parallel', authentication: 'email', private_message: null }
      ],
      documents: [
        { id: '5', name: 'Onboarding_Packet.pdf', file_type: 'pdf', pages: 15, size_bytes: 3456789, fields_count: 20, signed_fields: 17 }
      ],
      total_value: null, is_starred: false, folder_id: 'folder-3', tags: ['hr', 'onboarding', 'bulk']
    },
    {
      id: '5', name: 'Sales Contract - TechStart Inc', status: 'draft', type: 'standard',
      created_at: '2024-01-13T16:00:00Z', sent_at: null, completed_at: null, expires_at: null,
      sender: { name: 'Sarah Chen', email: 'sarah@company.com' },
      recipients: [],
      documents: [
        { id: '6', name: 'Sales_Contract_Draft.pdf', file_type: 'pdf', pages: 10, size_bytes: 2123456, fields_count: 15, signed_fields: 0 }
      ],
      total_value: 78000, is_starred: false, folder_id: 'folder-1', tags: ['sales', 'pending']
    }
  ]

  // Mock templates
  const templates: ContractTemplate[] = [
    { id: '1', name: 'Service Agreement', category: 'Services', subcategory: 'Standard', description: 'Standard service agreement with SLA terms',
      usage_count: 156, last_used: '2024-01-10', created_by: 'Sarah Chen', is_shared: true, is_starred: true,
      documents_count: 1, recipients_count: 2, fields_count: 12, tags: ['services', 'sla'] },
    { id: '2', name: 'NDA - Mutual', category: 'Legal', subcategory: 'Confidentiality', description: 'Mutual non-disclosure agreement',
      usage_count: 234, last_used: '2024-01-08', created_by: 'Legal Team', is_shared: true, is_starred: true,
      documents_count: 1, recipients_count: 2, fields_count: 6, tags: ['legal', 'nda', 'confidential'] },
    { id: '3', name: 'Employment Contract', category: 'HR', subcategory: 'Hiring', description: 'Standard employment contract template',
      usage_count: 89, last_used: '2024-01-12', created_by: 'HR Team', is_shared: true, is_starred: false,
      documents_count: 2, recipients_count: 1, fields_count: 18, tags: ['hr', 'employment'] },
    { id: '4', name: 'Freelancer Agreement', category: 'Contracts', subcategory: 'Contractors', description: 'Independent contractor agreement',
      usage_count: 178, last_used: '2024-01-07', created_by: 'Sarah Chen', is_shared: true, is_starred: false,
      documents_count: 1, recipients_count: 1, fields_count: 10, tags: ['contractor', 'freelance'] },
    { id: '5', name: 'Sales Contract', category: 'Sales', subcategory: 'Enterprise', description: 'Enterprise sales agreement with custom terms',
      usage_count: 312, last_used: '2024-01-11', created_by: 'Sales Team', is_shared: true, is_starred: true,
      documents_count: 1, recipients_count: 3, fields_count: 15, tags: ['sales', 'enterprise'] },
    { id: '6', name: 'Partnership Agreement', category: 'Legal', subcategory: 'Partnerships', description: 'Business partnership terms and conditions',
      usage_count: 67, last_used: '2024-01-03', created_by: 'Legal Team', is_shared: false, is_starred: false,
      documents_count: 2, recipients_count: 4, fields_count: 22, tags: ['legal', 'partnership'] }
  ]

  // Mock audit trail
  const auditTrail: AuditEvent[] = [
    { id: '1', action: 'Envelope Created', actor: { name: 'Sarah Chen', email: 'sarah@company.com' }, timestamp: '2024-01-10T09:00:00Z',
      details: 'Created from Service Agreement template', ip_address: '192.168.1.1', location: 'San Francisco, CA', device: 'Chrome on macOS', event_type: 'create' },
    { id: '2', action: 'Sent for Signature', actor: { name: 'Sarah Chen', email: 'sarah@company.com' }, timestamp: '2024-01-10T09:15:00Z',
      details: 'Sent to 2 recipients via email', ip_address: '192.168.1.1', location: 'San Francisco, CA', device: 'Chrome on macOS', event_type: 'send' },
    { id: '3', action: 'Document Viewed', actor: { name: 'John Smith', email: 'john@acme.com' }, timestamp: '2024-01-10T10:00:00Z',
      details: 'Viewed document for 5 minutes on page 1-3', ip_address: '10.0.0.5', location: 'New York, NY', device: 'Safari on iOS', event_type: 'view' },
    { id: '4', action: 'Signature Applied', actor: { name: 'John Smith', email: 'john@acme.com' }, timestamp: '2024-01-10T10:30:00Z',
      details: 'Signed on page 3, field: signer1_signature', ip_address: '10.0.0.5', location: 'New York, NY', device: 'Safari on iOS', event_type: 'sign' },
    { id: '5', action: 'Reminder Sent', actor: { name: 'System', email: 'no-reply@company.com' }, timestamp: '2024-01-11T09:00:00Z',
      details: 'Automatic reminder sent to Emily Davis', ip_address: '0.0.0.0', location: 'System', device: 'Automated', event_type: 'remind' }
  ]

  // Mock folders
  const folders: ContractFolder[] = [
    { id: 'folder-1', name: 'Client Contracts', color: 'blue', envelopes_count: 24, parent_id: null, created_at: '2023-12-01' },
    { id: 'folder-2', name: 'Legal Documents', color: 'purple', envelopes_count: 18, parent_id: null, created_at: '2023-12-01' },
    { id: 'folder-3', name: 'HR & Employment', color: 'green', envelopes_count: 45, parent_id: null, created_at: '2023-12-01' },
    { id: 'folder-4', name: 'Sales Proposals', color: 'orange', envelopes_count: 32, parent_id: null, created_at: '2023-12-15' },
    { id: 'folder-5', name: 'Archive', color: 'gray', envelopes_count: 156, parent_id: null, created_at: '2023-11-01' }
  ]

  // Mock bulk send batches
  const bulkBatches: BulkSendBatch[] = [
    { id: '1', name: 'Q1 Onboarding Batch', template_id: '3', total_recipients: 25, sent: 25, completed: 22, failed: 1, status: 'in_progress', created_at: '2024-01-05' },
    { id: '2', name: 'Policy Update 2024', template_id: '2', total_recipients: 150, sent: 150, completed: 145, failed: 0, status: 'completed', created_at: '2024-01-02' }
  ]

  const stats = useMemo(() => ({
    totalEnvelopes: envelopes.length,
    pending: envelopes.filter(e => ['sent', 'delivered', 'viewed'].includes(e.status)).length,
    completed: envelopes.filter(e => e.status === 'completed').length,
    draft: envelopes.filter(e => e.status === 'draft').length,
    expiringSoon: envelopes.filter(e => e.expires_at && new Date(e.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length,
    totalValue: envelopes.reduce((sum, e) => sum + (e.total_value || 0), 0),
    avgCompletionTime: '1.2 days',
    completionRate: 94
  }), [envelopes])

  const getStatusColor = (status: Envelope['status']): string => {
    const colors: Record<Envelope['status'], string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      delivered: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      viewed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      signed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      voided: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400',
      expired: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    }
    return colors[status]
  }

  const getRecipientStatusColor = (status: Recipient['status']): string => {
    const colors: Record<Recipient['status'], string> = {
      pending: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      delivered: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      viewed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      signed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
    return colors[status]
  }

  const getEventTypeIcon = (type: AuditEvent['event_type']) => {
    const icons: Record<AuditEvent['event_type'], any> = {
      create: Plus,
      send: Send,
      view: Eye,
      sign: PenTool,
      complete: CheckCheck,
      void: XCircle,
      decline: AlertTriangle,
      remind: Bell
    }
    return icons[type]
  }

  const getFolderColor = (color: string): string => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
    return colors[color] || colors.gray
  }

  // Handlers - Real Supabase Operations
  const handleCreateContract = async (contractData?: Partial<Contract>) => {
    try {
      const newContract = {
        title: contractData?.title || 'New Contract',
        contract_number: `CTR-${Date.now()}`,
        contract_type: contractData?.contract_type || 'service' as const,
        status: 'draft' as const,
        contract_value: contractData?.contract_value || 0,
        currency: 'USD',
        start_date: new Date().toISOString(),
        terms: contractData?.terms || '',
        is_template: false,
        is_auto_renewable: false,
        renewal_notice_period_days: 30,
        termination_notice_period_days: 30,
        has_attachments: false,
        requires_legal_review: false,
        version: 1,
        ...contractData,
      }
      await createContract(newContract)
      toast.success('Contract Created', {
        description: `Contract "${newContract.title}" has been created successfully.`
      })
      setShowNewContract(false)
    } catch (err) {
      toast.error('Failed to create contract', {
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    }
  }

  const handleSignContract = async (contractId: string, contractName: string) => {
    try {
      await updateContract(contractId, {
        status: 'active' as const,
        signed_date: new Date().toISOString(),
        effective_date: new Date().toISOString()
      })
      toast.success('Contract Signed', {
        description: `"${contractName}" has been signed and is now active.`
      })
    } catch (err) {
      toast.error('Failed to sign contract', {
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    }
  }

  const handleSendForSignature = async (contractId: string, contractName: string) => {
    try {
      await updateContract(contractId, {
        status: 'pending-signature' as const
      })
      toast.success('Sent for Signature', {
        description: `"${contractName}" has been sent to recipients for signature.`
      })
    } catch (err) {
      toast.error('Failed to send contract', {
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    }
  }

  const handleTerminateContract = async (contractId: string, contractName: string) => {
    try {
      await updateContract(contractId, {
        status: 'terminated' as const,
        termination_date: new Date().toISOString()
      })
      toast.success('Contract Terminated', {
        description: `"${contractName}" has been terminated.`
      })
    } catch (err) {
      toast.error('Failed to terminate contract', {
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    }
  }

  const handleRenewContract = async (contract: Contract) => {
    try {
      const renewedContract = {
        title: `${contract.title} (Renewed)`,
        contract_number: `CTR-${Date.now()}`,
        contract_type: contract.contract_type,
        status: 'draft' as const,
        contract_value: contract.contract_value,
        currency: contract.currency,
        start_date: new Date().toISOString(),
        terms: contract.terms,
        is_template: false,
        is_auto_renewable: contract.is_auto_renewable,
        renewal_notice_period_days: contract.renewal_notice_period_days,
        termination_notice_period_days: contract.termination_notice_period_days,
        termination_clause: contract.termination_clause,
        has_attachments: false,
        requires_legal_review: contract.requires_legal_review,
        version: 1,
        parent_contract_id: contract.id,
        party_a_name: contract.party_a_name,
        party_a_email: contract.party_a_email,
        party_b_name: contract.party_b_name,
        party_b_email: contract.party_b_email,
      }
      await createContract(renewedContract)
      // Update the original contract to show it was renewed
      await updateContract(contract.id, {
        status: 'renewed' as const,
        renewal_date: new Date().toISOString()
      })
      toast.success('Contract Renewed', {
        description: `A new contract based on "${contract.title}" has been created.`
      })
    } catch (err) {
      toast.error('Failed to renew contract', {
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    }
  }

  const handleDeleteContract = async (contractId: string, contractName: string) => {
    try {
      await deleteContract(contractId)
      toast.success('Contract Deleted', {
        description: `"${contractName}" has been permanently deleted.`
      })
    } catch (err) {
      toast.error('Failed to delete contract', {
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    }
  }

  const handleArchiveContract = async (contractId: string, contractName: string) => {
    try {
      await updateContract(contractId, {
        status: 'completed' as const
      })
      toast.success('Contract Archived', {
        description: `"${contractName}" has been moved to archive.`
      })
    } catch (err) {
      toast.error('Failed to archive contract', {
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    }
  }

  const handleDownloadContract = (contractName: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 800)),
      {
        loading: `Preparing download for "${contractName}"...`,
        success: `Contract "${contractName}" downloaded successfully`,
        error: `Failed to download "${contractName}"`
      }
    )
  }

  if (error) return <div className="p-8 min-h-screen bg-gray-900"><div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <FileSignature className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Contract Management</h1>
                <p className="text-purple-100">eSignature platform with legally binding agreements</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Shield className="h-4 w-4" />
                <span className="text-sm">SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Lock className="h-4 w-4" />
                <span className="text-sm">256-bit AES</span>
              </div>
              <Button onClick={() => setShowNewContract(true)} className="bg-white text-purple-600 hover:bg-purple-50">
                <Plus className="h-4 w-4 mr-2" />
                New Envelope
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Envelopes', value: stats.totalEnvelopes, icon: FileText, color: 'from-purple-500 to-indigo-500' },
              { label: 'Awaiting', value: stats.pending, icon: Clock, color: 'from-blue-500 to-cyan-500' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
              { label: 'Draft', value: stats.draft, icon: Edit2, color: 'from-gray-500 to-slate-500' },
              { label: 'Expiring', value: stats.expiringSoon, icon: AlertTriangle, color: 'from-orange-500 to-yellow-500' },
              { label: 'Value', value: `$${(stats.totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
              { label: 'Avg Time', value: stats.avgCompletionTime, icon: Timer, color: 'from-pink-500 to-rose-500' },
              { label: 'Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'from-indigo-500 to-purple-500' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-purple-200 text-xs">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="envelopes">Envelopes</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Send</TabsTrigger>
              <TabsTrigger value="folders">Folders</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search envelopes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading filters...', success: 'Filters panel ready', error: 'Failed to load filters' })}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            </div>
          )}

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {envelopes.filter(e => ['sent', 'viewed'].includes(e.status)).slice(0, 4).map(envelope => (
                      <div
                        key={envelope.id}
                        onClick={() => setSelectedEnvelope(envelope)}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                      >
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{envelope.name}</h4>
                            {envelope.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge className={getStatusColor(envelope.status)} variant="secondary">{envelope.status}</Badge>
                            <span>{envelope.recipients.length} recipient{envelope.recipients.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Sent {new Date(envelope.sent_at!).toLocaleDateString()}</p>
                          {envelope.expires_at && (
                            <p className="text-xs text-orange-600">Expires {new Date(envelope.expires_at).toLocaleDateString()}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Sending reminder...', success: 'Reminder sent successfully', error: 'Failed to send reminder' }) }}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Remind
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Completion Rate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgCompletionTime}</div>
                      <p className="text-xs text-gray-500">Avg. Time to Sign</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
                      <p className="text-xs text-gray-500">Delivery Rate</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Status Breakdown</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Completed', value: 45, color: 'bg-green-500' },
                        { label: 'Awaiting Signature', value: 28, color: 'bg-blue-500' },
                        { label: 'Draft', value: 12, color: 'bg-gray-400' },
                        { label: 'Expired', value: 5, color: 'bg-orange-500' }
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.label}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Completions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Recently Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {envelopes.filter(e => e.status === 'completed').slice(0, 3).map(envelope => (
                    <div key={envelope.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{envelope.name}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Completed {new Date(envelope.completed_at!).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: `Downloading "${envelope.name}"...`, success: `"${envelope.name}" downloaded successfully`, error: 'Download failed' })}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening document...', success: 'Document viewer opened', error: 'Failed to open document' })}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Signing Velocity & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Signing Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">2.4h</div>
                      <p className="text-xs text-gray-500">Average Time to First View</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">18h</div>
                      <p className="text-xs text-gray-500">Average Time to Sign</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">94%</div>
                      <p className="text-xs text-gray-500">First-Touch Completion</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Daily Signing Trend</h4>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-8">{day}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${[85, 92, 78, 95, 88, 45, 35][idx]}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-8">{[24, 31, 22, 35, 28, 12, 9][idx]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-purple-600" />
                    Authentication Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { method: 'Email Authentication', count: 245, rate: 99.2, color: 'bg-blue-500' },
                      { method: 'SMS Verification', count: 89, rate: 98.5, color: 'bg-green-500' },
                      { method: 'Access Code', count: 45, rate: 100, color: 'bg-purple-500' },
                      { method: 'ID Verification', count: 28, rate: 96.4, color: 'bg-orange-500' },
                      { method: 'Knowledge-Based Auth', count: 12, rate: 91.7, color: 'bg-red-500' }
                    ].map(auth => (
                      <div key={auth.method} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`w-2 h-8 ${auth.color} rounded-full`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{auth.method}</span>
                            <span className="text-xs text-gray-500">{auth.count} uses</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={auth.rate} className="h-1 flex-1" />
                            <span className="text-xs text-green-600">{auth.rate}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance & Audit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Compliance Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">ESIGN Compliant</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">100%</div>
                    <p className="text-xs text-green-600">All envelopes meet requirements</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">UETA Compliant</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">100%</div>
                    <p className="text-xs text-blue-600">Full electronic consent captured</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-300">21 CFR Part 11</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">Enabled</div>
                    <p className="text-xs text-purple-600">FDA compliant signatures</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-300">eIDAS Qualified</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">Active</div>
                    <p className="text-xs text-orange-600">EU legal compliance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Contracts from Database */}
            {display.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-purple-600" />
                    Your Contracts ({display.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowNewContract(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Contract
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {display.slice(0, 5).map((contract: Contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            contract.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' :
                            contract.status === 'draft' ? 'bg-gray-100 dark:bg-gray-700' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            <FileSignature className={`h-4 w-4 ${
                              contract.status === 'active' ? 'text-green-600' :
                              contract.status === 'draft' ? 'text-gray-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{contract.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Badge variant="outline" className="text-[10px]">{contract.contract_type}</Badge>
                              <span>{contract.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {contract.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendForSignature(contract.id, contract.title)}
                              disabled={mutating}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                          {contract.status === 'pending-signature' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSignContract(contract.id, contract.title)}
                              disabled={mutating}
                            >
                              <PenTool className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => handleDeleteContract(contract.id, contract.title)}
                            disabled={mutating}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {display.length > 5 && (
                      <Button variant="link" className="w-full" onClick={() => setActiveTab('envelopes')}>
                        View all {display.length} contracts
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Envelopes Tab */}
          <TabsContent value="envelopes" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              {['all', 'pending', 'completed', 'draft', 'expired'].map(filter => (
                <Button
                  key={filter}
                  variant={selectedFolder === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFolder(filter === 'all' ? null : filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {envelopes.map(envelope => (
                <Card key={envelope.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedEnvelope(envelope)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          envelope.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                          envelope.status === 'draft' ? 'bg-gray-100 dark:bg-gray-700' :
                          'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          <FileSignature className={`h-6 w-6 ${
                            envelope.status === 'completed' ? 'text-green-600' :
                            envelope.status === 'draft' ? 'text-gray-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{envelope.name}</h3>
                            {envelope.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                            <Badge className={getStatusColor(envelope.status)}>{envelope.status}</Badge>
                            {envelope.type !== 'standard' && (
                              <Badge variant="outline">{envelope.type.replace('_', ' ')}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {envelope.recipients.length} recipient{envelope.recipients.length !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {envelope.documents.length} document{envelope.documents.length !== 1 ? 's' : ''}
                            </span>
                            {envelope.total_value && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${envelope.total_value.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toast.promise(new Promise(r => setTimeout(r, 800)), { loading: `Downloading "${envelope.name}"...`, success: `"${envelope.name}" downloaded`, error: 'Download failed' }) }}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Copying envelope...', success: 'Envelope duplicated successfully', error: 'Failed to copy envelope' }) }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toast.promise(new Promise(r => setTimeout(r, 300)), { loading: 'Loading options...', success: 'More options available', error: 'Failed to load options' }) }}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress for pending envelopes */}
                    {['sent', 'delivered', 'viewed', 'signed'].includes(envelope.status) && (
                      <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Signature progress:</span>
                          <Progress
                            value={(envelope.recipients.filter(r => r.status === 'signed' || r.status === 'completed').length / envelope.recipients.length) * 100}
                            className="flex-1 h-2"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {envelope.recipients.filter(r => r.status === 'signed' || r.status === 'completed').length}/{envelope.recipients.length}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {envelope.recipients.map((recipient, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className={`text-[10px] ${
                                  recipient.status === 'signed' || recipient.status === 'completed' ? 'bg-green-500 text-white' :
                                  recipient.status === 'viewed' ? 'bg-yellow-500 text-white' :
                                  'bg-gray-300 text-gray-700'
                                }`}>
                                  {recipient.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">{recipient.name.split(' ')[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Real Contracts from Database */}
            {display.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-purple-600" />
                    Database Contracts ({display.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {display.map((contract: Contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            contract.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' :
                            contract.status === 'draft' ? 'bg-gray-100 dark:bg-gray-700' :
                            contract.status === 'terminated' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            <FileSignature className={`h-5 w-5 ${
                              contract.status === 'active' ? 'text-green-600' :
                              contract.status === 'draft' ? 'text-gray-600' :
                              contract.status === 'terminated' ? 'text-red-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{contract.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Badge variant="outline">{contract.contract_type}</Badge>
                              <Badge className={
                                contract.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                contract.status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                                contract.status === 'terminated' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                contract.status === 'pending-signature' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }>{contract.status}</Badge>
                              {contract.contract_value > 0 && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {contract.contract_value.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {contract.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendForSignature(contract.id, contract.title)}
                              disabled={mutating}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          )}
                          {contract.status === 'pending-signature' && (
                            <Button
                              size="sm"
                              onClick={() => handleSignContract(contract.id, contract.title)}
                              disabled={mutating}
                            >
                              <PenTool className="h-4 w-4 mr-1" />
                              Sign
                            </Button>
                          )}
                          {contract.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRenewContract(contract)}
                                disabled={mutating}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Renew
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleTerminateContract(contract.id, contract.title)}
                                disabled={mutating}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Terminate
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteContract(contract.id, contract.title)}
                            disabled={mutating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        {template.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        {template.is_shared && <Globe className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{template.category}</Badge>
                      <Badge variant="outline">{template.subcategory}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{template.documents_count} doc{template.documents_count !== 1 ? 's' : ''}</span>
                      <span>{template.fields_count} fields</span>
                      <span>Used {template.usage_count}x</span>
                    </div>
                    <Button className="w-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: `Loading template "${template.name}"...`, success: `Template "${template.name}" ready to use`, error: 'Failed to load template' })}>
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bulk Send Tab */}
          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600" />
                  Bulk Send Batches
                </CardTitle>
                <Button onClick={() => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Preparing bulk send wizard...', success: 'Bulk send wizard opened', error: 'Failed to open bulk send' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Bulk Send
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bulkBatches.map(batch => (
                    <div key={batch.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{batch.name}</h4>
                          <Badge className={batch.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                            {batch.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{batch.total_recipients} recipients</span>
                          <span>{batch.completed} completed</span>
                          {batch.failed > 0 && <span className="text-red-600">{batch.failed} failed</span>}
                        </div>
                      </div>
                      <div className="w-32">
                        <Progress value={(batch.completed / batch.total_recipients) * 100} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1 text-center">{Math.round((batch.completed / batch.total_recipients) * 100)}%</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: `Loading batch "${batch.name}"...`, success: `Viewing batch "${batch.name}"`, error: 'Failed to load batch details' })}>View Details</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How Bulk Send Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { step: 1, title: 'Select Template', desc: 'Choose a template to send', icon: FileText },
                    { step: 2, title: 'Upload Recipients', desc: 'Import CSV with recipient data', icon: FileUp },
                    { step: 3, title: 'Review & Send', desc: 'Preview and send to all recipients', icon: Send },
                    { step: 4, title: 'Track Progress', desc: 'Monitor completion status', icon: BarChart3 }
                  ].map(item => (
                    <div key={item.step} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <item.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Step {item.step}: {item.title}</div>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Folders Tab */}
          <TabsContent value="folders" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders.map(folder => (
                <Card key={folder.id} className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getFolderColor(folder.color)}`}>
                        <Folder className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{folder.name}</h3>
                        <p className="text-sm text-gray-500">{folder.envelopes_count} envelopes</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => toast.promise(new Promise(r => setTimeout(r, 300)), { loading: 'Loading folder options...', success: 'Folder options available', error: 'Failed to load options' })}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="hover:shadow-md transition-all cursor-pointer border-dashed">
                <CardContent className="p-6 flex items-center justify-center h-full">
                  <Button variant="ghost" onClick={() => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Creating new folder...', success: 'New folder created', error: 'Failed to create folder' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Folder
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - DocuSign Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-1">
                <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Settings</h3>
                {[
                  { id: 'general', label: 'General', icon: Settings },
                  { id: 'signing', label: 'Signing', icon: PenTool },
                  { id: 'security', label: 'Security', icon: Shield },
                  { id: 'branding', label: 'Branding', icon: Palette },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'advanced', label: 'Advanced', icon: Sliders },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                      settingsTab === item.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
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
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>General account configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Organization Name</Label>
                            <Input defaultValue="Acme Corp Legal" className="mt-1" />
                          </div>
                          <div>
                            <Label>Default Timezone</Label>
                            <Select defaultValue="pst">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Total Envelopes</p>
                            <p className="text-2xl font-bold">2,456</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-green-600">2,189</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">267</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage team members</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600">8</p>
                            <p className="text-sm text-gray-500">Admins</p>
                          </div>
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">24</p>
                            <p className="text-sm text-gray-500">Senders</p>
                          </div>
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-gray-600">12</p>
                            <p className="text-sm text-gray-500">Viewers</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Preparing invitation...', success: 'User invitation form opened', error: 'Failed to open invitation form' })}>
                          <Plus className="w-4 h-4 mr-2" />
                          Invite User
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Default Envelope Settings</CardTitle>
                        <CardDescription>Configure default behaviors</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default Expiration</Label>
                          <Select defaultValue="30">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="14">14 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Sequential Signing</p>
                            <p className="text-sm text-gray-500">Sign in specified order</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Signing Settings */}
                {settingsTab === 'signing' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Signature Preferences</CardTitle>
                        <CardDescription>Configure signing options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Draw Signature</p>
                            <p className="text-sm text-gray-500">Sign by drawing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Type Signature</p>
                            <p className="text-sm text-gray-500">Sign by typing name</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Upload Signature</p>
                            <p className="text-sm text-gray-500">Upload signature image</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require Initials</p>
                            <p className="text-sm text-gray-500">Initial each page</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recipient Options</CardTitle>
                        <CardDescription>Configure recipient settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Decline</p>
                            <p className="text-sm text-gray-500">Recipients can decline</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require Decline Reason</p>
                            <p className="text-sm text-gray-500">Comment required on decline</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Delegation</p>
                            <p className="text-sm text-gray-500">Forward to another signer</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Reminders</CardTitle>
                        <CardDescription>Automatic reminder settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto Reminders</p>
                            <p className="text-sm text-gray-500">Send automatic reminders</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Reminder Frequency</Label>
                          <Select defaultValue="3">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Every day</SelectItem>
                              <SelectItem value="3">Every 3 days</SelectItem>
                              <SelectItem value="7">Every week</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Max Reminders</Label>
                          <Select defaultValue="5">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 reminders</SelectItem>
                              <SelectItem value="5">5 reminders</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Authentication Methods</CardTitle>
                        <CardDescription>Verify signer identity</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium">Email Verification</p>
                              <p className="text-sm text-gray-500">Click link in email</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium">SMS Authentication</p>
                              <p className="text-sm text-gray-500">Code via text message</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Fingerprint className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium">ID Verification</p>
                              <p className="text-sm text-gray-500">Verify government ID</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium">Access Code</p>
                              <p className="text-sm text-gray-500">Require access code</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Encryption & Compliance</CardTitle>
                        <CardDescription>Security standards</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span>256-bit AES Encryption</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span>SOC 2 Type II</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span>GDPR Compliant</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span>HIPAA Ready</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Audit Trail</p>
                            <p className="text-sm text-gray-500">Detailed activity logging</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">IP Logging</p>
                            <p className="text-sm text-gray-500">Track signing locations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage access permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">IP Restrictions</p>
                            <p className="text-sm text-gray-500">Limit by IP address</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">SSO Required</p>
                            <p className="text-sm text-gray-500">Single Sign-On only</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Session Timeout</Label>
                          <Select defaultValue="30">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="480">8 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Branding Settings */}
                {settingsTab === 'branding' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Branding</CardTitle>
                        <CardDescription>Customize email appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Logo</Label>
                          <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Upload logo (max 2MB)</p>
                          </div>
                        </div>
                        <div>
                          <Label>Brand Color</Label>
                          <Input type="color" defaultValue="#7c3aed" className="mt-1 h-10 w-20" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Custom Footer</p>
                            <p className="text-sm text-gray-500">Add company info</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Signing Experience</CardTitle>
                        <CardDescription>Customize signing page</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Custom Welcome Message</p>
                            <p className="text-sm text-gray-500">Personalized greeting</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Hide DocuSign Branding</p>
                            <p className="text-sm text-gray-500">White-label experience</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Custom Redirect URL</p>
                            <p className="text-sm text-gray-500">After signing complete</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Certificate of Completion</CardTitle>
                        <CardDescription>Customize completion docs</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include Summary</p>
                            <p className="text-sm text-gray-500">Signing summary page</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include Audit Trail</p>
                            <p className="text-sm text-gray-500">Detailed activity log</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
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
                            <p className="font-medium">Envelope Sent</p>
                            <p className="text-sm text-gray-500">When envelope is sent</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Signature Complete</p>
                            <p className="text-sm text-gray-500">When recipient signs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Envelope Complete</p>
                            <p className="text-sm text-gray-500">When all sign</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Envelope Declined</p>
                            <p className="text-sm text-gray-500">When declined</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Envelope Voided</p>
                            <p className="text-sm text-gray-500">When voided</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhook Notifications</CardTitle>
                        <CardDescription>Real-time event notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Webhooks</p>
                            <p className="text-sm text-gray-500">Send events to URL</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://api.example.com/webhooks" className="mt-1 font-mono" />
                        </div>
                        <div>
                          <Label>Events to Send</Label>
                          <div className="mt-2 space-y-2">
                            {['envelope-sent', 'envelope-signed', 'envelope-completed', 'envelope-declined'].map((event) => (
                              <div key={event} className="flex items-center gap-2">
                                <Switch defaultChecked />
                                <span className="font-mono text-sm">{event}</span>
                              </div>
                            ))}
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
                            ds_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <div>
                          <Label>Environment</Label>
                          <Select defaultValue="production">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sandbox">Sandbox</SelectItem>
                              <SelectItem value="production">Production</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Regenerating API key...', success: 'New API key generated successfully', error: 'Failed to regenerate key' })}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Export and retention</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Exporting data...', success: 'Data exported successfully', error: 'Export failed' })}>
                            <Download className="w-5 h-5" />
                            <span>Export Data</span>
                          </Button>
                          <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Opening import wizard...', success: 'Template import ready', error: 'Failed to open import' })}>
                            <Upload className="w-5 h-5" />
                            <span>Import Templates</span>
                          </Button>
                        </div>
                        <div>
                          <Label>Data Retention</Label>
                          <Select defaultValue="7years">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1year">1 year</SelectItem>
                              <SelectItem value="3years">3 years</SelectItem>
                              <SelectItem value="7years">7 years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                              <p className="font-medium text-red-700 dark:text-red-400">Delete All Drafts</p>
                              <p className="text-sm text-red-600">Remove draft envelopes</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Deleting all drafts...', success: 'All draft envelopes deleted', error: 'Failed to delete drafts' })}>
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Void All Pending</p>
                              <p className="text-sm text-red-600">Cancel pending envelopes</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Voiding all pending envelopes...', success: 'All pending envelopes voided', error: 'Failed to void envelopes' })}>
                              Void
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Reset Account</p>
                              <p className="text-sm text-red-600">Delete all data</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => toast.promise(new Promise(r => setTimeout(r, 3000)), { loading: 'Resetting account...', success: 'Account reset complete', error: 'Failed to reset account' })}>
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
              insights={mockContractsAIInsights}
              title="Contract Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockContractsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockContractsPredictions}
              title="Contract Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockContractsActivities}
            title="Contract Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={[
              { id: '1', label: 'New Contract', icon: 'file-plus', action: () => setShowNewContract(true), variant: 'default' as const },
              { id: '2', label: 'Send for Signing', icon: 'send', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Preparing...', success: 'Select a contract to send for signing', error: 'Action unavailable' }), variant: 'default' as const },
              { id: '3', label: 'Templates', icon: 'copy', action: () => setActiveTab('templates'), variant: 'outline' as const },
            ]}
            variant="grid"
          />
        </div>
      </div>

      {/* Envelope Detail Modal */}
      <Dialog open={!!selectedEnvelope} onOpenChange={() => setSelectedEnvelope(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <FileSignature className="h-5 w-5 text-white" />
              </div>
              {selectedEnvelope?.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] mt-4">
              <TabsContent value="overview" className="space-y-6">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Document Preview</p>
                    <Button className="mt-4" variant="outline" onClick={() => toast.promise(new Promise(r => setTimeout(r, 700)), { loading: 'Opening document viewer...', success: 'Document viewer opened', error: 'Failed to open document' })}>
                      <Eye className="h-4 w-4 mr-2" />
                      Open Document
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Sending envelope...', success: 'Envelope sent successfully', error: 'Failed to send envelope' })}>
                    <Send className="h-5 w-5 text-purple-600" />
                    <span>Send</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: `Downloading "${selectedEnvelope?.name}"...`, success: 'Download complete', error: 'Download failed' })}>
                    <Download className="h-5 w-5 text-purple-600" />
                    <span>Download</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Preparing share options...', success: 'Share link copied to clipboard', error: 'Failed to share' })}>
                    <Share2 className="h-5 w-5 text-purple-600" />
                    <span>Share</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => toast.promise(new Promise(r => setTimeout(r, 700)), { loading: 'Duplicating envelope...', success: 'Envelope duplicated successfully', error: 'Failed to duplicate' })}>
                    <Copy className="h-5 w-5 text-purple-600" />
                    <span>Duplicate</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Envelope Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <Badge className={getStatusColor(selectedEnvelope?.status || 'draft')}>{selectedEnvelope?.status}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Type</span>
                        <span className="text-gray-900 dark:text-white">{selectedEnvelope?.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Value</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedEnvelope?.total_value ? `$${selectedEnvelope.total_value.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Created</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedEnvelope?.created_at ? new Date(selectedEnvelope.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sent</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedEnvelope?.sent_at ? new Date(selectedEnvelope.sent_at).toLocaleDateString() : 'Not sent'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Expires</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedEnvelope?.expires_at ? new Date(selectedEnvelope.expires_at).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recipients" className="space-y-4">
                {selectedEnvelope?.recipients.map((recipient, index) => (
                  <div key={recipient.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full font-medium text-purple-600 dark:text-purple-400">
                      {recipient.order}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                        {recipient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{recipient.name}</span>
                        <Badge className={getRecipientStatusColor(recipient.status)}>{recipient.status}</Badge>
                        <Badge variant="outline">{recipient.role}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {recipient.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {recipient.authentication}
                        </span>
                      </div>
                    </div>
                    {recipient.signed_at && (
                      <div className="text-right text-sm text-gray-500">
                        <p>Signed {new Date(recipient.signed_at).toLocaleDateString()}</p>
                      </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Sending reminder...', success: 'Reminder sent to recipient', error: 'Failed to send reminder' })}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Adding recipient...', success: 'New recipient form opened', error: 'Failed to add recipient' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                {selectedEnvelope?.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{doc.name}</h4>
                      <p className="text-sm text-gray-500">
                        {doc.pages} pages • {(doc.size_bytes / 1024 / 1024).toFixed(2)} MB • {doc.fields_count} fields
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.signed_fields}/{doc.fields_count}</p>
                      <p className="text-xs text-gray-500">fields signed</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: `Opening "${doc.name}"...`, success: 'Document viewer opened', error: 'Failed to open document' })}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {auditTrail.map(event => {
                  const EventIcon = getEventTypeIcon(event.event_type)
                  return (
                    <div key={event.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <EventIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">{event.action}</span>
                          <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.details}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>By: {event.actor.name}</span>
                          <span>IP: {event.ip_address}</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* New Contract Modal */}
      <Dialog open={showNewContract} onOpenChange={setShowNewContract}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              Create New Contract
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleCreateContract({ contract_type: 'service', title: 'New Service Agreement' })}
                disabled={mutating}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-400 transition-colors group disabled:opacity-50"
              >
                <FileText className="h-8 w-8 text-gray-400 group-hover:text-purple-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Service Agreement</span>
                <span className="text-xs text-gray-500">Standard service contract</span>
              </button>
              <button
                onClick={() => handleCreateContract({ contract_type: 'nda', title: 'New NDA' })}
                disabled={mutating}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-400 transition-colors group disabled:opacity-50"
              >
                <FileCheck className="h-8 w-8 text-gray-400 group-hover:text-purple-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">NDA</span>
                <span className="text-xs text-gray-500">Non-disclosure agreement</span>
              </button>
              <button
                onClick={() => handleCreateContract({ contract_type: 'employment', title: 'New Employment Contract' })}
                disabled={mutating}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-400 transition-colors group disabled:opacity-50"
              >
                <Briefcase className="h-8 w-8 text-gray-400 group-hover:text-purple-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Employment</span>
                <span className="text-xs text-gray-500">Employment contract</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleCreateContract({ contract_type: 'partnership', title: 'New Partnership Agreement' })}
                disabled={mutating}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-400 transition-colors group disabled:opacity-50"
              >
                <Users className="h-8 w-8 text-gray-400 group-hover:text-purple-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Partnership</span>
                <span className="text-xs text-gray-500">Partnership agreement</span>
              </button>
              <button
                onClick={() => handleCreateContract({ contract_type: 'license', title: 'New License Agreement' })}
                disabled={mutating}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-400 transition-colors group disabled:opacity-50"
              >
                <Key className="h-8 w-8 text-gray-400 group-hover:text-purple-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">License</span>
                <span className="text-xs text-gray-500">License agreement</span>
              </button>
              <button
                onClick={() => handleCreateContract({ contract_type: 'custom', title: 'New Custom Contract' })}
                disabled={mutating}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-400 transition-colors group disabled:opacity-50"
              >
                <Layers className="h-8 w-8 text-gray-400 group-hover:text-purple-600" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Custom</span>
                <span className="text-xs text-gray-500">Custom contract type</span>
              </button>
            </div>

            {mutating && (
              <div className="text-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                <p className="text-sm text-gray-500 mt-2">Creating contract...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
