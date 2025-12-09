'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Users, DollarSign, TrendingUp, Target, Phone, Mail, Calendar,
  Plus, Search, Filter, MoreVertical, Building2, MapPin, Star,
  Activity, Clock, CheckCircle, XCircle, AlertCircle, Zap,
  ArrowRight, Eye, Edit, Trash2, Send, FileText, BarChart3,
  PieChart, LineChart, Award, Briefcase, Download, Upload
} from 'lucide-react'

import {
  getContactTypeColor,
  getLeadStatusColor,
  getDealStageColor,
  getPriorityColor,
  formatCurrency,
  getLeadTemperature,
  formatDaysUntilClose,
  filterContacts,
  sortContacts,
  filterDeals,
  sortDeals,
  getActivityIcon,
  calculatePipelineMetrics
} from '@/lib/crm-utils'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('CRMPage')

// AI FEATURES
import { LeadScoringWidget } from '@/components/ai/lead-scoring-widget'
import { useCurrentUser, useLeadsData } from '@/hooks/use-ai-data'

type ViewMode = 'overview' | 'contacts' | 'deals' | 'pipeline' | 'activities'

export default function CRMPage() {
  // REAL USER AUTH & AI DATA
  const { userId, loading: userLoading } = useCurrentUser()
  const { leads, scores, loading: leadsLoading } = useLeadsData(userId || undefined)

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [showAIWidget, setShowAIWidget] = useState(true)
  const [contactSearch, setContactSearch] = useState('')
  const [dealSearch, setDealSearch] = useState('')
  const [contactSort, setContactSort] = useState('name')
  const [dealSort, setDealSort] = useState('value')

  // Contact Form Modal State
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    type: 'lead' as string,
    status: 'new' as string,
    notes: ''
  })

  // DATABASE STATE
  const [contacts, setContacts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  // View Contact/Deal dialog states
  const [viewingContact, setViewingContact] = useState<any | null>(null)
  const [viewingDeal, setViewingDeal] = useState<any | null>(null)

  // A+++ LOAD CRM DATA
  useEffect(() => {
    const loadCRMData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        logger.info('Loading CRM data', { userId })

        // Dynamic import for code splitting
        const { getCRMContacts, getCRMDeals, getCRMActivities } = await import('@/lib/crm-queries')

        // Load all CRM data in parallel
        const [contactsData, dealsData, activitiesData] = await Promise.all([
          getCRMContacts(userId),
          getCRMDeals(userId),
          getCRMActivities(userId)
        ])

        logger.info('CRM data loaded', {
          contacts: contactsData?.length || 0,
          deals: dealsData?.length || 0,
          activities: activitiesData?.length || 0
        })

        // Update state with database data
        setContacts(contactsData || [])
        setDeals(dealsData || [])
        setActivities(activitiesData || [])

        // Calculate stats from real data
        const totalRevenue = dealsData?.reduce((sum: number, deal: any) => {
          return sum + (deal.stage === 'closed-won' ? deal.value : 0)
        }, 0) || 0

        const pipelineValue = dealsData?.reduce((sum: number, deal: any) => {
          return sum + (deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' ? deal.value : 0)
        }, 0) || 0

        setStats({
          totalContacts: contactsData?.length || 0,
          totalDeals: dealsData?.length || 0,
          totalRevenue,
          pipelineValue,
          activeLeads: contactsData?.filter((c: any) => c.type === 'lead' && c.lead_status === 'new').length || 0,
          closedDeals: dealsData?.filter((d: any) => d.stage === 'closed-won').length || 0
        })

        setIsLoading(false)
        announce('CRM data loaded successfully', 'polite')
        logger.info('CRM data loading complete')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load CRM data'
        logger.error('CRM data loading failed', { error: errorMessage })
        setError(errorMessage)
        toast.error('Failed to load CRM data', {
          description: errorMessage
        })
        setIsLoading(false)
        announce('Error loading CRM data', 'assertive')
      }
    }

    loadCRMData()
  }, [userId, announce])

  // ============================================================================
  // CRM HANDLERS
  // ============================================================================

  const handleCreateContact = () => {
    if (!userId) {
      toast.error('Please log in to create contacts')
      logger.warn('Contact creation attempted without authentication')
      return
    }

    logger.info('Opening contact form', { userId })
    setContactForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      type: 'lead',
      status: 'new',
      notes: ''
    })
    setIsContactFormOpen(true)
    announce('Opening contact creation form', 'polite')
  }

  const handleSubmitContact = useCallback(async () => {
    if (!userId) {
      toast.error('Please log in to create contacts')
      return
    }

    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    setIsSaving(true)
    announce('Creating contact', 'polite')

    try {
      const { createContact } = await import('@/lib/crm-queries')

      const newContact = {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || null,
        company: contactForm.company || null,
        position: contactForm.position || null,
        type: contactForm.type,
        status: contactForm.status,
        notes: contactForm.notes || null
      }

      const { data, error } = await createContact(userId, newContact)

      if (error) throw error

      setContacts(prev => [data, ...prev])
      toast.success('Contact created', {
        description: `${contactForm.name} added to your CRM`
      })
      announce('Contact created successfully', 'polite')
      setIsContactFormOpen(false)
    } catch (err: any) {
      logger.error('Contact creation failed', { error: err })
      toast.error('Failed to create contact')
      announce('Failed to create contact', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }, [userId, contactForm, announce])

  const handleViewContact = (contact: any) => {
    logger.info('Viewing contact', { contactId: contact.id, contactName: contact.name })
    announce(`Viewing contact ${contact.name}`, 'polite')
    setViewingContact(contact)
  }

  const handleEmailContact = async (contact: any) => {
    try {
      logger.info('Opening email to contact', {
        contactId: contact.id,
        email: contact.email
      })

      // Open default email client
      window.location.href = `mailto:${contact.email}?subject=Follow up`

      toast.success('Email client opened', {
        description: `To ${contact.email}`
      })

      announce(`Email opened for ${contact.name}`, 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open email'
      logger.error('Email contact error', { error: errorMessage })
      toast.error('Failed to open email', { description: errorMessage })
    }
  }

  const handleViewDeal = (deal: any) => {
    logger.info('Viewing deal', { dealId: deal.id, dealName: deal.name })
    announce(`Viewing deal ${deal.name}`, 'polite')
    setViewingDeal(deal)
  }

  const handleUpdateDealStage = async (deal: any, newStage: string) => {
    if (!userId) {
      toast.error('Please log in to update deals')
      logger.warn('Deal update attempted without authentication')
      return
    }

    try {
      logger.info('Updating deal stage', {
        userId,
        dealId: deal.id,
        dealName: deal.name,
        oldStage: deal.stage,
        newStage
      })

      toast.info('Updating deal...', {
        description: `Moving ${deal.name} to ${newStage}`
      })

      const { updateCRMDeal } = await import('@/lib/crm-queries')
      const updatedDeal = await updateCRMDeal(deal.id, {
        stage: newStage as any
      })

      logger.info('Deal stage updated', { dealId: deal.id, newStage })

      toast.success('Deal updated', {
        description: `${deal.name} moved to ${newStage}`
      })

      // Update local state
      setDeals(prev => prev.map(d =>
        d.id === deal.id
          ? { ...d, stage: newStage }
          : d
      ))

      announce(`Deal ${deal.name} moved to ${newStage}`, 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update deal'
      logger.error('Update deal error', { error: errorMessage })
      toast.error('Failed to update deal', { description: errorMessage })
    }
  }

  // Calculate pipeline from real deals data
  const pipeline = {
    id: 'pipeline-1',
    name: 'Sales Pipeline',
    description: 'Main sales pipeline',
    stages: [
      {
        id: 'stage-1',
        name: 'Discovery',
        order: 1,
        probability: 10,
        color: '#3b82f6',
        dealCount: deals.filter(d => d.stage === 'discovery').length,
        totalValue: deals.filter(d => d.stage === 'discovery').reduce((sum, d) => sum + d.value, 0)
      },
      {
        id: 'stage-2',
        name: 'Qualification',
        order: 2,
        probability: 25,
        color: '#8b5cf6',
        dealCount: deals.filter(d => d.stage === 'qualification').length,
        totalValue: deals.filter(d => d.stage === 'qualification').reduce((sum, d) => sum + d.value, 0)
      },
      {
        id: 'stage-3',
        name: 'Proposal',
        order: 3,
        probability: 50,
        color: '#ec4899',
        dealCount: deals.filter(d => d.stage === 'proposal').length,
        totalValue: deals.filter(d => d.stage === 'proposal').reduce((sum, d) => sum + d.value, 0)
      },
      {
        id: 'stage-4',
        name: 'Negotiation',
        order: 4,
        probability: 75,
        color: '#f59e0b',
        dealCount: deals.filter(d => d.stage === 'negotiation').length,
        totalValue: deals.filter(d => d.stage === 'negotiation').reduce((sum, d) => sum + d.value, 0)
      },
      {
        id: 'stage-5',
        name: 'Closed Won',
        order: 5,
        probability: 100,
        color: '#10b981',
        dealCount: deals.filter(d => d.stage === 'closed-won').length,
        totalValue: deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + d.value, 0)
      }
    ]
  }

  const pipelineMetrics = calculatePipelineMetrics(pipeline)

  const filteredContacts = sortContacts(
    filterContacts(contacts, { search: contactSearch }),
    contactSort
  )

  const filteredDeals = sortDeals(
    filterDeals(deals, { search: dealSearch }),
    dealSort
  )

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardSkeleton />
            </div>
            <CardSkeleton />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
        </div>
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <ScrollReveal>
        <div className="mb-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full mb-4">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">CRM & Sales</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <TextShimmer>Customer Relationship Management</TextShimmer>
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage contacts, track deals, and close more sales
              </p>
            </div>
            <Button className="gap-2" onClick={handleCreateContact}>
              <Plus className="w-4 h-4" />
              New Contact
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-emerald-500" />
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                +12%
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalContacts}</div>
            <div className="text-sm text-muted-foreground">Total Contacts</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-500" />
              <Badge variant="secondary">{stats.totalLeads} leads</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalDeals}</div>
            <div className="text-sm text-muted-foreground">Active Deals</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-500" />
              <Badge variant="secondary">{stats.conversionRate}% rate</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-8 h-8 text-purple-500" />
              <Badge variant="secondary">{formatCurrency(stats.averageDealSize)}</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(stats.pipelineValue)}</div>
            <div className="text-sm text-muted-foreground">Pipeline Value</div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'contacts', label: 'Contacts', icon: Users },
          { id: 'deals', label: 'Deals', icon: Briefcase },
          { id: 'pipeline', label: 'Pipeline', icon: Target },
          { id: 'activities', label: 'Activities', icon: Activity }
        ].map((mode) => {
          const Icon = mode.icon
          return (
            <Button
              key={mode.id}
              variant={viewMode === mode.id ? 'default' : 'outline'}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </Button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview */}
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* AI LEAD SCORING WIDGET */}
            {showAIWidget && userId && leads.length > 0 && (
              <LeadScoringWidget
                userId={userId}
                leads={leads}
                compact={false}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-emerald-500" />
                    Revenue Trend
                  </h3>
                  <div className="space-y-4">
                    {stats.revenueByMonth.map((month) => (
                      <div key={month.month}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{month.month}</span>
                          <span className="text-sm text-muted-foreground">{formatCurrency(month.revenue)}</span>
                        </div>
                        <Progress value={(month.revenue / 150000) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-emerald-500" />
                    Lead Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.leadsByStatus).slice(0, 5).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" />
                    This Month
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Won Deals</span>
                      </div>
                      <span className="font-semibold">{stats.wonDealsThisMonth}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Lost Deals</span>
                      </div>
                      <span className="font-semibold">{stats.lostDealsThisMonth}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Activities</span>
                      </div>
                      <span className="font-semibold">{stats.activitiesThisWeek}</span>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
            </div>
          </motion.div>
        )}

        {/* Contacts View */}
        {viewMode === 'contacts' && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters */}
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search contacts..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={contactSort} onValueChange={setContactSort}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Sort by Name</SelectItem>
                      <SelectItem value="score">Sort by Score</SelectItem>
                      <SelectItem value="recent">Sort by Recent</SelectItem>
                      <SelectItem value="value">Sort by Value</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Contacts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.map((contact) => (
                <LiquidGlassCard key={contact.id}>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{contact.displayName}</h4>
                          <p className="text-sm text-muted-foreground">{contact.jobTitle}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getContactTypeColor(contact.type)}>{contact.type}</Badge>
                      {contact.leadStatus && (
                        <Badge className={getLeadStatusColor(contact.leadStatus)}>
                          {contact.leadStatus}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        {contact.company}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Lead Score</span>
                        <Badge variant="secondary">{contact.leadScore}</Badge>
                      </div>
                      <Progress value={contact.leadScore} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewContact(contact)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEmailContact(contact)}>
                        <Send className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Deals View */}
        {viewMode === 'deals' && (
          <motion.div
            key="deals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters */}
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search deals..."
                        value={dealSearch}
                        onChange={(e) => setDealSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={dealSort} onValueChange={setDealSort}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="value">Sort by Value</SelectItem>
                      <SelectItem value="probability">Sort by Probability</SelectItem>
                      <SelectItem value="closeDate">Sort by Close Date</SelectItem>
                      <SelectItem value="recent">Sort by Recent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Deals List */}
            <LiquidGlassCard>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredDeals.map((deal) => (
                    <Card key={deal.id} className="p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold">{deal.name}</h4>
                            <Badge className={getDealStageColor(deal.stage)}>
                              {deal.stage.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(deal.priority)}>
                              {deal.priority}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {deal.companyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Close: {formatDaysUntilClose(deal.expectedCloseDate)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Deal Value</div>
                              <div className="font-semibold text-lg">{formatCurrency(deal.value)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Probability</div>
                              <div className="flex items-center gap-2">
                                <Progress value={deal.probability} className="h-2" />
                                <span className="text-sm font-medium">{deal.probability}%</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Expected</div>
                              <div className="font-semibold">{formatCurrency(deal.value * deal.probability / 100)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDeal(deal)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Pipeline View */}
        {viewMode === 'pipeline' && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">{pipeline.name}</h3>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Value: </span>
                      <span className="font-semibold">{formatCurrency(pipelineMetrics.totalValue)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weighted: </span>
                      <span className="font-semibold">{formatCurrency(pipelineMetrics.weightedValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {pipeline.stages.map((stage) => (
                    <Card key={stage.id} className="p-4" style={{ borderColor: stage.color }}>
                      <div className="text-center space-y-2">
                        <div className="font-semibold text-sm">{stage.name}</div>
                        <div className="text-2xl font-bold">{stage.dealCount}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(stage.totalValue)}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {stage.probability}% prob
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Activities View */}
        {viewMode === 'activities' && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <LiquidGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Upcoming Activities</h3>

                <div className="space-y-4">
                  {activities.slice(0, 10).map((activity) => (
                    <Card key={activity.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{activity.subject}</h4>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {activity.dueDate ? formatDaysUntilClose(activity.dueDate) : 'No date'}
                              </span>
                              {activity.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {activity.duration}m
                                </span>
                              )}
                              <Badge variant="outline" className={getPriorityColor(activity.priority)}>
                                {activity.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Form Dialog */}
      <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create New Contact
            </DialogTitle>
            <DialogDescription>
              Add a new contact to your CRM. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name & Email Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="John Doe"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="john@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Phone & Company Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-company">Company</Label>
                <Input
                  id="contact-company"
                  placeholder="Acme Inc."
                  value={contactForm.company}
                  onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="contact-position">Position / Title</Label>
              <Input
                id="contact-position"
                placeholder="CEO, Marketing Manager, etc."
                value={contactForm.position}
                onChange={(e) => setContactForm(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>

            {/* Type & Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Type</Label>
                <Select
                  value={contactForm.type}
                  onValueChange={(value) => setContactForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={contactForm.status}
                  onValueChange={(value) => setContactForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal Sent</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="contact-notes">Notes</Label>
              <Textarea
                id="contact-notes"
                placeholder="Add any relevant notes about this contact..."
                value={contactForm.notes}
                onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsContactFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitContact}
              disabled={isSaving || !contactForm.name.trim() || !contactForm.email.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isSaving ? 'Creating...' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Contact Dialog */}
      <Dialog open={!!viewingContact} onOpenChange={() => setViewingContact(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contact Details
            </DialogTitle>
          </DialogHeader>
          {viewingContact && (
            <div className="space-y-4 py-4">
              {/* Contact Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl bg-blue-100 text-blue-600">
                    {viewingContact.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{viewingContact.name}</h3>
                  <p className="text-sm text-gray-500">{viewingContact.position || 'No position'}</p>
                  <Badge className={getContactTypeColor(viewingContact.type || 'lead')}>
                    {viewingContact.type || 'Lead'}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{viewingContact.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{viewingContact.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium">{viewingContact.company || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge className={getLeadStatusColor(viewingContact.status || 'new')}>
                      {viewingContact.status || 'New'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingContact.notes && (
                <div>
                  <p className="text-sm font-semibold mb-1">Notes</p>
                  <p className="text-sm text-gray-600">{viewingContact.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingContact(null)}>
              Close
            </Button>
            <Button onClick={() => viewingContact && handleEmailContact(viewingContact)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Deal Dialog */}
      <Dialog open={!!viewingDeal} onOpenChange={() => setViewingDeal(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Deal Details
            </DialogTitle>
          </DialogHeader>
          {viewingDeal && (
            <div className="space-y-4 py-4">
              {/* Deal Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{viewingDeal.name}</h3>
                  <p className="text-sm text-gray-500">{viewingDeal.company || 'No company'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(viewingDeal.value || 0)}</p>
                  <Badge className={getDealStageColor(viewingDeal.stage || 'lead')}>
                    {viewingDeal.stage || 'Lead'}
                  </Badge>
                </div>
              </div>

              {/* Deal Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p className="text-sm font-medium">{viewingDeal.contact || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expected Close</p>
                  <p className="text-sm font-medium">{viewingDeal.expected_close || viewingDeal.expectedClose || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Probability</p>
                  <p className="text-sm font-medium">{viewingDeal.probability || 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority</p>
                  <Badge className={getPriorityColor(viewingDeal.priority || 'medium')}>
                    {viewingDeal.priority || 'Medium'}
                  </Badge>
                </div>
              </div>

              {/* Probability Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Deal Probability</span>
                  <span>{viewingDeal.probability || 0}%</span>
                </div>
                <Progress value={viewingDeal.probability || 0} className="h-2" />
              </div>

              {/* Description */}
              {viewingDeal.description && (
                <div>
                  <p className="text-sm font-semibold mb-1">Description</p>
                  <p className="text-sm text-gray-600">{viewingDeal.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingDeal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
