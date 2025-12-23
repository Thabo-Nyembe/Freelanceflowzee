'use client'
import { useState, useMemo } from 'react'
import { useCrmContacts, type CrmContact, type ContactType, type ContactStatus, type DealStage } from '@/lib/hooks/use-crm-contacts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users, Plus, Mail, Phone, DollarSign, TrendingUp, MessageSquare, UserPlus,
  Building2, Target, Search, Filter, MoreVertical, Star, Calendar, Clock,
  ArrowRight, ChevronRight, Settings, Download, RefreshCw, Tag, Briefcase,
  Activity, BarChart3, PieChart, Zap, Send, CheckCircle2, XCircle, Pause,
  FileText, Link2, Globe, MapPin, Linkedin, Twitter, Award, History
} from 'lucide-react'

// View types
type ViewType = 'pipeline' | 'contacts' | 'companies' | 'deals' | 'activities'

// Pipeline stages configuration
const PIPELINE_STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'prospecting', label: 'Prospecting', color: 'sky' },
  { id: 'qualification', label: 'Qualification', color: 'indigo' },
  { id: 'proposal', label: 'Proposal', color: 'amber' },
  { id: 'negotiation', label: 'Negotiation', color: 'orange' },
  { id: 'closed_won', label: 'Closed Won', color: 'emerald' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'red' }
]

// Activity types
type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task'

interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  contactId: string
  contactName: string
  timestamp: Date
  completed: boolean
}

// Company type
interface Company {
  id: string
  name: string
  industry: string
  size: string
  revenue: number
  contactCount: number
  dealValue: number
}

export default function CrmClient({ initialContacts }: { initialContacts: CrmContact[] }) {
  const [contactTypeFilter, setContactTypeFilter] = useState<ContactType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const [view, setView] = useState<ViewType>('pipeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null)
  const [showNewContact, setShowNewContact] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [draggedCard, setDraggedCard] = useState<string | null>(null)

  const { contacts, loading, error } = useCrmContacts({ contactType: contactTypeFilter, status: statusFilter })
  const displayContacts = contacts.length > 0 ? contacts : initialContacts

  // Comprehensive stats
  const stats = useMemo(() => {
    const total = displayContacts.length
    const leads = displayContacts.filter(c => c.contact_type === 'lead').length
    const customers = displayContacts.filter(c => c.contact_type === 'customer').length
    const vip = displayContacts.filter(c => c.status === 'vip').length
    const pipelineValue = displayContacts.reduce((sum, c) => sum + c.deal_value, 0)
    const closedWon = displayContacts.filter(c => c.deal_stage === 'closed_won')
    const closedLost = displayContacts.filter(c => c.deal_stage === 'closed_lost')
    const wonValue = closedWon.reduce((sum, c) => sum + c.deal_value, 0)
    const winRate = closedWon.length + closedLost.length > 0
      ? ((closedWon.length / (closedWon.length + closedLost.length)) * 100).toFixed(1)
      : '0'
    const avgDealSize = displayContacts.length > 0
      ? pipelineValue / displayContacts.length
      : 0
    const avgLeadScore = displayContacts.length > 0
      ? displayContacts.reduce((sum, c) => sum + c.lead_score, 0) / displayContacts.length
      : 0

    return {
      total,
      leads,
      customers,
      vip,
      pipelineValue,
      wonValue,
      winRate,
      avgDealSize,
      avgLeadScore,
      activeDeals: displayContacts.filter(c => c.deal_stage && !['closed_won', 'closed_lost'].includes(c.deal_stage)).length
    }
  }, [displayContacts])

  // Group contacts by pipeline stage
  const pipelineData = useMemo(() => {
    const grouped: Record<DealStage, CrmContact[]> = {
      prospecting: [],
      qualification: [],
      proposal: [],
      negotiation: [],
      closed_won: [],
      closed_lost: []
    }

    displayContacts.forEach(contact => {
      if (contact.deal_stage && grouped[contact.deal_stage]) {
        grouped[contact.deal_stage].push(contact)
      }
    })

    return grouped
  }, [displayContacts])

  // Sample activities
  const recentActivities: Activity[] = [
    { id: '1', type: 'email', title: 'Sent proposal', description: 'Q1 2024 project proposal', contactId: '1', contactName: 'John Smith', timestamp: new Date(Date.now() - 1000 * 60 * 30), completed: true },
    { id: '2', type: 'call', title: 'Discovery call', description: 'Initial needs assessment', contactId: '2', contactName: 'Sarah Johnson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), completed: true },
    { id: '3', type: 'meeting', title: 'Demo scheduled', description: 'Product demonstration', contactId: '3', contactName: 'Mike Wilson', timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24), completed: false },
    { id: '4', type: 'task', title: 'Follow up', description: 'Send pricing update', contactId: '4', contactName: 'Emily Davis', timestamp: new Date(Date.now() + 1000 * 60 * 60 * 2), completed: false }
  ]

  // Sample companies
  const companies: Company[] = [
    { id: '1', name: 'Acme Corporation', industry: 'Technology', size: 'Enterprise', revenue: 50000000, contactCount: 12, dealValue: 250000 },
    { id: '2', name: 'TechStart Inc', industry: 'Software', size: 'Startup', revenue: 2000000, contactCount: 4, dealValue: 45000 },
    { id: '3', name: 'Global Services Ltd', industry: 'Consulting', size: 'Mid-Market', revenue: 15000000, contactCount: 8, dealValue: 125000 }
  ]

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    return displayContacts.filter(c => {
      const matchesSearch = !searchQuery ||
        c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = contactTypeFilter === 'all' || c.contact_type === contactTypeFilter
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [displayContacts, searchQuery, contactTypeFilter, statusFilter])

  const getStatusColor = (status: ContactStatus) => {
    const colors: Record<ContactStatus, string> = {
      active: 'bg-green-100 text-green-700',
      vip: 'bg-purple-100 text-purple-700',
      new: 'bg-blue-100 text-blue-700',
      qualified: 'bg-cyan-100 text-cyan-700',
      inactive: 'bg-gray-100 text-gray-700',
      churned: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getActivityIcon = (type: ActivityType) => {
    const icons = {
      email: <Mail className="h-4 w-4" />,
      call: <Phone className="h-4 w-4" />,
      meeting: <Calendar className="h-4 w-4" />,
      note: <FileText className="h-4 w-4" />,
      task: <CheckCircle2 className="h-4 w-4" />
    }
    return icons[type]
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8" />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    CRM Pro
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                    HubSpot-Level
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Customer Relationship Management</h1>
                <p className="text-white/80">
                  Pipeline management • Lead scoring • Activity tracking • Deal intelligence
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={showNewContact} onOpenChange={setShowNewContact}>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Contact
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Contact</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="contact" className="mt-4">
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="contact">Contact</TabsTrigger>
                        <TabsTrigger value="company">Company</TabsTrigger>
                        <TabsTrigger value="deal">Deal</TabsTrigger>
                      </TabsList>
                      <TabsContent value="contact" className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="John" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Doe" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input type="email" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="john@company.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input type="tel" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="+1 (555) 000-0000" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Company</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Acme Inc" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Contact Type</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option value="lead">Lead</option>
                              <option value="prospect">Prospect</option>
                              <option value="customer">Customer</option>
                              <option value="partner">Partner</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Lead Source</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option value="website">Website</option>
                              <option value="referral">Referral</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="cold_outreach">Cold Outreach</option>
                              <option value="event">Event</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button onClick={() => setShowNewContact(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Contact</button>
                        </div>
                      </TabsContent>
                      <TabsContent value="company" className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Company Name</label>
                          <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Acme Corporation" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Industry</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option>Technology</option>
                              <option>Healthcare</option>
                              <option>Finance</option>
                              <option>Manufacturing</option>
                              <option>Retail</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Company Size</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option>1-10</option>
                              <option>11-50</option>
                              <option>51-200</option>
                              <option>201-1000</option>
                              <option>1000+</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Website</label>
                          <input type="url" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="https://company.com" />
                        </div>
                      </TabsContent>
                      <TabsContent value="deal" className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Deal Name</label>
                          <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Q1 Enterprise Deal" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Deal Value</label>
                            <input type="number" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="50000" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Stage</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              {PIPELINE_STAGES.map(stage => (
                                <option key={stage.id} value={stage.id}>{stage.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Close Date</label>
                          <input type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-gray-500">Contacts</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-sky-600" />
              <span className="text-sm text-gray-500">Leads</span>
            </div>
            <div className="text-2xl font-bold text-sky-600">{stats.leads}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-500">Pipeline</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">${(stats.pipelineValue / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-500">Win Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.winRate}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-gray-500">VIP</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">{stats.vip}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-pink-600" />
              <span className="text-sm text-gray-500">Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-pink-600">{stats.avgLeadScore.toFixed(0)}</div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border">
            {(['pipeline', 'contacts', 'companies', 'deals', 'activities'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  view === v
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
            </select>
          </div>
        </div>

        {/* Pipeline View */}
        {view === 'pipeline' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {PIPELINE_STAGES.filter(s => s.id !== 'closed_lost').map((stage) => {
                const stageContacts = pipelineData[stage.id] || []
                const stageValue = stageContacts.reduce((sum, c) => sum + c.deal_value, 0)

                return (
                  <div
                    key={stage.id}
                    className="w-[320px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full bg-${stage.color}-500`}></div>
                        <h3 className="font-semibold">{stage.label}</h3>
                        <span className="text-sm text-gray-500">({stageContacts.length})</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">${(stageValue / 1000).toFixed(0)}K</span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                      {stageContacts.map(contact => (
                        <div
                          key={contact.id}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border hover:shadow-md transition-all cursor-pointer group"
                          draggable
                          onDragStart={() => setDraggedCard(contact.id)}
                          onDragEnd={() => setDraggedCard(null)}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                {contact.contact_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{contact.contact_name}</p>
                                {contact.company_name && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {contact.company_name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-emerald-600">
                              ${contact.deal_value.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Target className="h-3 w-3" />
                              {contact.probability_percentage}%
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(contact.status)}`}>
                              {contact.status}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(contact.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.call_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {contact.meeting_count}
                            </span>
                          </div>
                        </div>
                      ))}

                      {stageContacts.length === 0 && (
                        <div className="py-8 text-center">
                          <p className="text-sm text-gray-400">No deals in this stage</p>
                        </div>
                      )}

                      <button className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 hover:border-indigo-300 hover:text-indigo-500 text-sm flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Deal
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Contacts View */}
        {view === 'contacts' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Deal Value</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Lead Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Last Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map(contact => (
                    <tr key={contact.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                            {contact.contact_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{contact.contact_name}</p>
                            <p className="text-sm text-gray-500">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{contact.company_name || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-emerald-600">${contact.deal_value.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${contact.lead_score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{contact.lead_score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {contact.last_contact_date ? new Date(contact.last_contact_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Companies View */}
        {view === 'companies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(company => (
              <div key={company.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.industry}</p>
                    </div>
                  </div>
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Contacts</p>
                    <p className="text-lg font-bold">{company.contactCount}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Deal Value</p>
                    <p className="text-lg font-bold text-emerald-600">${(company.dealValue / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                  <span className="text-sm text-gray-500">{company.size}</span>
                  <span className="text-sm text-gray-500">${(company.revenue / 1000000).toFixed(1)}M Revenue</span>
                </div>
              </div>
            ))}

            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-300 hover:text-indigo-500 cursor-pointer">
              <Building2 className="h-8 w-8 mb-2" />
              <p className="font-medium">Add Company</p>
            </div>
          </div>
        )}

        {/* Activities View */}
        {view === 'activities' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Upcoming Activities</h3>
                <div className="space-y-3">
                  {recentActivities.filter(a => !a.completed).map(activity => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'call' ? 'bg-green-100 text-green-600' :
                        activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {activity.contactName}
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          {activity.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivities.filter(a => a.completed).map(activity => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border-l-2 border-green-500 bg-gray-50 dark:bg-gray-700 rounded-r-lg">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'call' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {activity.contactName}
                          <span className="mx-1">•</span>
                          {activity.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full py-2 px-4 bg-indigo-50 text-indigo-600 rounded-lg flex items-center gap-2 hover:bg-indigo-100 transition-all">
                    <Mail className="h-4 w-4" />
                    Log Email
                  </button>
                  <button className="w-full py-2 px-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2 hover:bg-green-100 transition-all">
                    <Phone className="h-4 w-4" />
                    Log Call
                  </button>
                  <button className="w-full py-2 px-4 bg-purple-50 text-purple-600 rounded-lg flex items-center gap-2 hover:bg-purple-100 transition-all">
                    <Calendar className="h-4 w-4" />
                    Schedule Meeting
                  </button>
                  <button className="w-full py-2 px-4 bg-amber-50 text-amber-600 rounded-lg flex items-center gap-2 hover:bg-amber-100 transition-all">
                    <FileText className="h-4 w-4" />
                    Add Note
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Activity Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Emails sent</span>
                    <span className="font-bold">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Calls made</span>
                    <span className="font-bold">48</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Meetings held</span>
                    <span className="font-bold">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Tasks completed</span>
                    <span className="font-bold">89</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deals View */}
        {view === 'deals' && (
          <div className="space-y-4">
            {filteredContacts.filter(c => c.deal_stage).map(contact => (
              <div key={contact.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedContact(contact)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                      {contact.contact_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{contact.contact_name}</h3>
                      <p className="text-sm text-gray-500">{contact.company_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">${contact.deal_value.toLocaleString()}</div>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-sm text-gray-500">{contact.probability_percentage}% probability</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    PIPELINE_STAGES.find(s => s.id === contact.deal_stage)?.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                    PIPELINE_STAGES.find(s => s.id === contact.deal_stage)?.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {contact.deal_stage?.replace('_', ' ')}
                  </span>
                  {contact.expected_close_date && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Close: {new Date(contact.expected_close_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Detail Modal */}
        {selectedContact && (
          <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedContact.contact_name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedContact.contact_name}</DialogTitle>
                    {selectedContact.company_name && (
                      <p className="text-gray-500 flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {selectedContact.company_name}
                      </p>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="deals">Deals</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <p className="font-medium">{selectedContact.email || '-'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Phone className="h-4 w-4" />
                        Phone
                      </div>
                      <p className="font-medium">{selectedContact.phone || '-'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <DollarSign className="h-4 w-4" />
                        Deal Value
                      </div>
                      <p className="font-medium text-emerald-600">${selectedContact.deal_value.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Target className="h-4 w-4" />
                        Lead Score
                      </div>
                      <p className="font-medium">{selectedContact.lead_score}/100</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-3">Engagement Stats</h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">{selectedContact.email_count}</div>
                        <p className="text-xs text-gray-500">Emails</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{selectedContact.call_count}</div>
                        <p className="text-xs text-gray-500">Calls</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{selectedContact.meeting_count}</div>
                        <p className="text-xs text-gray-500">Meetings</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-amber-600">{selectedContact.probability_percentage}%</div>
                        <p className="text-xs text-gray-500">Win Prob.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="mt-4">
                  <div className="space-y-3">
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.timestamp.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="deals" className="mt-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Current Deal</h4>
                      <span className={`px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700`}>
                        {selectedContact.deal_stage?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-600">${selectedContact.deal_value.toLocaleString()}</div>
                    {selectedContact.expected_close_date && (
                      <p className="text-sm text-gray-500 mt-2">
                        Expected close: {new Date(selectedContact.expected_close_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="notes" className="mt-4">
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No notes yet</p>
                    <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
                      Add Note
                    </button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
