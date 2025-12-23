'use client'
import { useState, useMemo } from 'react'
import { useContracts, type Contract, type ContractStatus } from '@/lib/hooks/use-contracts'
import {
  FileText, Send, Eye, CheckCircle2, Clock, AlertCircle, Users,
  FileSignature, Download, Copy, MoreVertical, Search, Filter,
  Plus, Calendar, DollarSign, Shield, History, MessageSquare,
  Pen, Share2, Lock, Unlock, Building2, User, Mail, Phone,
  PenTool, Stamp, ChevronRight, ArrowUpRight, XCircle, RefreshCw,
  Settings, Zap, FileCheck, BarChart3, TrendingUp
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

type ViewMode = 'all' | 'drafts' | 'pending' | 'signed' | 'templates'

interface Recipient {
  id: string
  name: string
  email: string
  role: 'signer' | 'viewer' | 'approver' | 'cc'
  status: 'pending' | 'viewed' | 'signed' | 'declined'
  signedAt?: string
  order: number
}

interface ContractTemplate {
  id: string
  name: string
  category: string
  usageCount: number
  description: string
}

interface AuditEvent {
  id: string
  action: string
  actor: string
  timestamp: string
  details: string
  ip?: string
}

export default function ContractsClient({ initialContracts }: { initialContracts: Contract[] }) {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showNewContract, setShowNewContract] = useState(false)
  const { contracts, loading, error } = useContracts({ status: statusFilter })
  const display = (contracts && contracts.length > 0) ? contracts : (initialContracts || [])

  // Mock recipients for selected contract
  const mockRecipients: Recipient[] = [
    { id: '1', name: 'John Smith', email: 'john@company.com', role: 'signer', status: 'signed', signedAt: '2024-01-15T10:30:00Z', order: 1 },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@client.com', role: 'signer', status: 'pending', order: 2 },
    { id: '3', name: 'Mike Wilson', email: 'mike@legal.com', role: 'approver', status: 'viewed', order: 3 },
    { id: '4', name: 'Legal Team', email: 'legal@company.com', role: 'cc', status: 'pending', order: 4 }
  ]

  // Mock templates
  const templates: ContractTemplate[] = [
    { id: '1', name: 'Service Agreement', category: 'Services', usageCount: 156, description: 'Standard service agreement with SLA terms' },
    { id: '2', name: 'NDA - Mutual', category: 'Legal', usageCount: 234, description: 'Mutual non-disclosure agreement' },
    { id: '3', name: 'Employment Contract', category: 'HR', usageCount: 89, description: 'Standard employment contract template' },
    { id: '4', name: 'Freelancer Agreement', category: 'Freelance', usageCount: 178, description: 'Independent contractor agreement' },
    { id: '5', name: 'Sales Contract', category: 'Sales', usageCount: 312, description: 'Product/service sales agreement' },
    { id: '6', name: 'Partnership Agreement', category: 'Legal', usageCount: 67, description: 'Business partnership terms' }
  ]

  // Mock audit trail
  const auditTrail: AuditEvent[] = [
    { id: '1', action: 'Contract Created', actor: 'You', timestamp: '2024-01-10T09:00:00Z', details: 'Created from Service Agreement template', ip: '192.168.1.1' },
    { id: '2', action: 'Sent for Signature', actor: 'You', timestamp: '2024-01-10T09:15:00Z', details: 'Sent to 3 recipients', ip: '192.168.1.1' },
    { id: '3', action: 'Document Viewed', actor: 'John Smith', timestamp: '2024-01-10T10:00:00Z', details: 'Viewed document for 5 minutes', ip: '10.0.0.5' },
    { id: '4', action: 'Signature Applied', actor: 'John Smith', timestamp: '2024-01-10T10:30:00Z', details: 'Signed on page 3', ip: '10.0.0.5' },
    { id: '5', action: 'Document Viewed', actor: 'Sarah Johnson', timestamp: '2024-01-11T14:00:00Z', details: 'Viewed document for 12 minutes', ip: '172.16.0.10' }
  ]

  const stats = useMemo(() => ({
    total: display.length,
    drafts: display.filter(c => c.status === 'draft').length,
    pending: display.filter(c => c.status === 'pending' || c.status === 'sent').length,
    signed: display.filter(c => c.status === 'completed' || c.status === 'active').length,
    expired: display.filter(c => c.status === 'expired').length,
    avgSignTime: '1.2 days',
    completionRate: '94%'
  }), [display])

  const filteredContracts = useMemo(() => {
    let filtered = display
    if (viewMode === 'drafts') filtered = filtered.filter(c => c.status === 'draft')
    else if (viewMode === 'pending') filtered = filtered.filter(c => c.status === 'pending' || c.status === 'sent')
    else if (viewMode === 'signed') filtered = filtered.filter(c => c.status === 'completed' || c.status === 'active')

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contract_number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }, [display, viewMode, searchQuery])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4 text-gray-500" />
      case 'sent':
      case 'pending': return <Send className="h-4 w-4 text-blue-500" />
      case 'viewed': return <Eye className="h-4 w-4 text-yellow-500" />
      case 'completed':
      case 'active': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'expired': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getRecipientStatusBadge = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'viewed': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'declined': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (error) return <div className="p-8 min-h-screen bg-gray-900"><div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileSignature className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Contract Management</h1>
              </div>
              <p className="text-purple-100">Create, send, and track contracts with legally binding eSignatures</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Shield className="h-4 w-4" />
                <span className="text-sm">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Lock className="h-4 w-4" />
                <span className="text-sm">256-bit Encryption</span>
              </div>
              <button
                onClick={() => setShowNewContract(true)}
                className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Contract
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Total</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Pen className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Drafts</span>
              </div>
              <div className="text-2xl font-bold">{stats.drafts}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Send className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Pending</span>
              </div>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Signed</span>
              </div>
              <div className="text-2xl font-bold">{stats.signed}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Expired</span>
              </div>
              <div className="text-2xl font-bold">{stats.expired}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Avg Sign Time</span>
              </div>
              <div className="text-2xl font-bold">{stats.avgSignTime}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Completion</span>
              </div>
              <div className="text-2xl font-bold">{stats.completionRate}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* View Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {(['all', 'drafts', 'pending', 'signed', 'templates'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
              />
            </div>
            <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Templates View */}
        {viewMode === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-500">Used {template.usageCount} times</span>
                  <button className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Use Template <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contracts List */}
        {viewMode !== 'templates' && (
          <>
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              </div>
            )}

            {!loading && filteredContracts.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No contracts found</p>
                <button
                  onClick={() => setShowNewContract(true)}
                  className="mt-4 inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Create your first contract
                </button>
              </div>
            )}

            <div className="space-y-4">
              {filteredContracts.map(contract => (
                <div
                  key={contract.id}
                  onClick={() => setSelectedContract(contract)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        contract.status === 'active' || contract.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : contract.status === 'draft'
                            ? 'bg-gray-100 dark:bg-gray-700'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {getStatusIcon(contract.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{contract.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            contract.status === 'active' || contract.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : contract.status === 'draft'
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {contract.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          #{contract.contract_number} • {contract.contract_type}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            3 recipients
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created Jan 10, 2024
                          </span>
                          {contract.total_value && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${contract.total_value.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Send reminder">
                        <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Download">
                        <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Copy link">
                        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Progress indicator for pending contracts */}
                  {(contract.status === 'pending' || contract.status === 'sent') && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Signature progress:</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: '33%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">1/3 signed</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contract Detail Modal */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FileSignature className="h-6 w-6 text-purple-600" />
              {selectedContract?.title}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Contract Preview */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Document Preview</p>
                    <button className="mt-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium mx-auto">
                      <Eye className="h-4 w-4" />
                      Open Full Document
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <Send className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Send</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <Download className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Download</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <Share2 className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Share</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <Copy className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Duplicate</span>
                  </button>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Contract Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Contract Number</span>
                        <span className="text-gray-900 dark:text-white">{selectedContract?.contract_number}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Type</span>
                        <span className="text-gray-900 dark:text-white">{selectedContract?.contract_type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <span className="text-gray-900 dark:text-white">{selectedContract?.status}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Value</span>
                        <span className="text-gray-900 dark:text-white">${selectedContract?.total_value?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Created</span>
                        <span className="text-gray-900 dark:text-white">Jan 10, 2024</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sent</span>
                        <span className="text-gray-900 dark:text-white">Jan 10, 2024</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Expires</span>
                        <span className="text-gray-900 dark:text-white">Feb 10, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recipients" className="mt-0 space-y-4">
                {mockRecipients.map((recipient, index) => (
                  <div key={recipient.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm font-medium text-purple-600 dark:text-purple-400">
                      {recipient.order}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{recipient.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getRecipientStatusBadge(recipient.status)}`}>
                          {recipient.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {recipient.email}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                          {recipient.role}
                        </span>
                      </div>
                    </div>
                    {recipient.signedAt && (
                      <div className="text-right text-sm text-gray-500 dark:text-gray-500">
                        Signed {new Date(recipient.signedAt).toLocaleDateString()}
                      </div>
                    )}
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                      <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ))}

                <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Recipient
                </button>
              </TabsContent>

              <TabsContent value="audit" className="mt-0 space-y-3">
                {auditTrail.map(event => (
                  <div key={event.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{event.action}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>By: {event.actor}</span>
                        {event.ip && <span>IP: {event.ip}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="settings" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Signature Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Sequential Signing</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recipients sign in order</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Require Authentication</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Verify signer identity</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Auto Reminders</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send reminder every 3 days</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Payment Collection</h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Collect Payment on Signature</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Integrated with Stripe</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                      Configure
                    </button>
                  </div>
                </div>
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
              <Plus className="h-6 w-6 text-purple-600" />
              Create New Contract
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 transition-colors group">
                <FileText className="h-8 w-8 text-gray-400 group-hover:text-purple-600 transition-colors" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Blank Document</span>
                <span className="text-xs text-gray-500">Start from scratch</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 transition-colors group">
                <FileCheck className="h-8 w-8 text-gray-400 group-hover:text-purple-600 transition-colors" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Use Template</span>
                <span className="text-xs text-gray-500">Choose from library</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or upload</span>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
              <Download className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Drag & drop a PDF, Word, or image file</p>
              <p className="text-sm text-gray-500 mt-1">or <span className="text-purple-600 cursor-pointer hover:underline">browse</span> to upload</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
