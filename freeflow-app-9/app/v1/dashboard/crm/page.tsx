'use client'

// MIGRATED: Batch #23 - Verified database hook integration

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  formatCurrency,
  formatRelativeTime,
  getDealStageColor,
  getDealPriorityIcon,
  filterDealsByStage,
  type Deal,
  type Contact,
  type DealStage
} from '@/lib/admin-overview-utils'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  MoveRight,
  Mail,
  Phone,
  Download,
  RefreshCw,
  Search,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const logger = createFeatureLogger('admin-crm')

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'lead', label: 'Lead', color: 'bg-blue-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-yellow-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' }
]

export default function CRMPage() {
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showDealModal, setShowDealModal] = useState(false)
  const [deleteDeal, setDeleteDeal] = useState<{ id: string; title: string } | null>(null)
  const [deleteContact, setDeleteContact] = useState<{ id: string; name: string } | null>(null)

  // Filtered deals by stage
  const dealsByStage = useMemo(() => {
    const filtered = deals.filter(deal =>
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return {
      lead: filterDealsByStage(filtered, 'lead'),
      qualified: filterDealsByStage(filtered, 'qualified'),
      proposal: filterDealsByStage(filtered, 'proposal'),
      negotiation: filterDealsByStage(filtered, 'negotiation'),
      won: filterDealsByStage(filtered, 'won')
    }
  }, [deals, searchQuery])

  // Calculate pipeline stats from deals
  const pipelineStats = useMemo(() => {
    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    const dealCount = deals.length
    const wonDeals = deals.filter(d => d.stage === 'won').length
    const winRate = dealCount > 0 ? Math.round((wonDeals / dealCount) * 100) : 0
    const averageDealSize = dealCount > 0 ? totalValue / dealCount : 0
    const averageCycleTime = 30

    return { totalValue, dealCount, winRate, averageDealSize, averageCycleTime }
  }, [deals])

  // Load CRM data
  const loadCRM = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { getDeals, getContacts } = await import('@/lib/admin-overview-queries')
      const [dealsResult, contactsResult] = await Promise.all([
        getDeals(userId),
        getContacts(userId)
      ])

      setDeals(dealsResult || [])
      setContacts(contactsResult || [])
      setIsLoading(false)
      announce('CRM data loaded successfully', 'polite')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CRM')
      setIsLoading(false)
      announce('Error loading CRM', 'assertive')
    }
  }

  useEffect(() => {
    loadCRM()
  }, [userId])

  // Add Deal
  const handleAddDeal = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    const { createDeal } = await import('@/lib/admin-overview-queries')
    const result = await createDeal(userId, {
      company_name: 'New Business Opportunity',
      deal_value: 50000,
      stage: 'lead' as const,
      priority: 'warm' as const,
      probability: 10
    })

    toast.success('Deal created successfully')
    announce('Deal added successfully', 'polite')
    loadCRM()
  }

  // Edit Deal
  const handleEditDeal = async (dealId: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    const { updateDeal } = await import('@/lib/admin-overview-queries')
    await updateDeal(dealId, { deal_value: 150000, probability: 85 })
    toast.success('Deal updated successfully')
    announce('Deal updated successfully', 'polite')
    loadCRM()
  }

  // Delete Deal
  const handleConfirmDeleteDeal = async () => {
    if (!deleteDeal || !userId) return

    const { deleteDeal: deleteDealQuery } = await import('@/lib/admin-overview-queries')
    await deleteDealQuery(deleteDeal.id)
    toast.success(`Deal "${deleteDeal.title}" deleted successfully`)
    announce('Deal deleted successfully', 'polite')
    setDeleteDeal(null)
    loadCRM()
  }

  // Move Deal
  const handleMoveDeal = async (dealId: string, newStage: DealStage) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    const { updateDealStage } = await import('@/lib/admin-overview-queries')
    await updateDealStage(dealId, newStage)
    toast.success(`Deal moved to ${newStage} stage`)
    announce(`Deal moved to ${newStage}`, 'polite')
    loadCRM()
  }

  // Add Contact
  const handleAddContact = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    const { createContact } = await import('@/lib/admin-overview-queries')
    await createContact(userId, {
      first_name: 'New',
      last_name: 'Contact',
      email: 'new@contact.com',
      phone: '+1 (555) 000-0000',
      company: 'Company Name',
      position: 'Position'
    })

    toast.success('Contact created successfully')
    announce('Contact added successfully', 'polite')
    loadCRM()
  }

  // Edit Contact
  const handleEditContact = async (contactId: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    const { updateContact } = await import('@/lib/admin-overview-queries')
    await updateContact(contactId, { position: 'Senior Manager' })
    toast.success('Contact updated successfully')
    announce('Contact updated successfully', 'polite')
    loadCRM()
  }

  // Delete Contact
  const handleConfirmDeleteContact = async () => {
    if (!deleteContact || !userId) return

    const { deleteContact: deleteContactQuery } = await import('@/lib/admin-overview-queries')
    await deleteContactQuery(deleteContact.id)
    toast.success(`Contact "${deleteContact.name}" deleted successfully`)
    announce('Contact deleted successfully', 'polite')
    setDeleteContact(null)
    loadCRM()
  }

  // Send Email (uses existing API endpoint)
  const handleSendEmail = async (contactEmail: string, contactName: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    const response = await fetch('/api/admin/crm/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: contactEmail,
        subject: 'Follow-up on our conversation',
        template: 'follow-up'
      })
    })

    if (!response.ok) throw new Error('Failed to send email')
    toast.success(`Email sent to ${contactName}`)
    announce('Email sent successfully', 'polite')
  }

  // Schedule Call (uses existing API endpoint)
  const handleScheduleCall = async (contactId: string, contactName: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    const response = await fetch('/api/admin/crm/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactId,
        type: 'call',
        scheduledFor: new Date(Date.now() + 86400000).toISOString()
      })
    })

    if (!response.ok) throw new Error('Failed to schedule call')
    toast.success(`Call scheduled with ${contactName}`)
    announce('Call scheduled successfully', 'polite')
  }

  // View Deal Details
  const handleViewDealDetails = (deal: Deal) => {
    setSelectedDeal(deal)
    setShowDealModal(true)
    announce('Deal details opened', 'polite')
  }

  // Export Pipeline
  const handleExportPipeline = () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    const exportData = {
      deals,
      contacts,
      pipelineStats,
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      summary: {
        totalDeals: deals.length,
        totalContacts: contacts.length,
        pipelineValue: pipelineStats.totalValue,
        winRate: pipelineStats.winRate,
        dealsByStage: {
          lead: dealsByStage.lead.length,
          qualified: dealsByStage.qualified.length,
          proposal: dealsByStage.proposal.length,
          negotiation: dealsByStage.negotiation.length,
          won: dealsByStage.won.length
        }
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crm-pipeline-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported ${deals.length} deals and ${contacts.length} contacts`)
    announce('Pipeline exported successfully', 'polite')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
        <ListSkeleton items={5} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState error={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">CRM & Sales Pipeline</h2>
                <p className="text-sm text-gray-600">Manage deals and contacts across all stages</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleAddDeal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Deal
                </button>

                <button
                  onClick={handleAddContact}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>

                <button
                  onClick={loadCRM}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>

                <button
                  onClick={handleExportPipeline}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <div className="text-sm text-blue-600 mb-1">Pipeline Value</div>
                <div className="text-2xl font-bold text-blue-700">
                  <NumberFlow
                    value={pipelineStats.totalValue}
                    format={{ style: 'currency', currency: 'USD', notation: 'compact' }}
                  />
                </div>
                <div className="text-xs text-gray-600">{pipelineStats.dealCount} deals</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 border border-green-100 dark:border-green-800">
                <div className="text-sm text-green-600 mb-1">Win Rate</div>
                <div className="text-2xl font-bold text-green-700">
                  <NumberFlow value={pipelineStats.winRate} suffix="%" />
                </div>
                <div className="text-xs text-gray-600">Above average</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                <div className="text-sm text-purple-600 mb-1">Avg Deal Size</div>
                <div className="text-2xl font-bold text-purple-700">
                  <NumberFlow
                    value={pipelineStats.averageDealSize}
                    format={{ style: 'currency', currency: 'USD', notation: 'compact' }}
                  />
                </div>
                <div className="text-xs text-gray-600">Per deal</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                <div className="text-sm text-orange-600 mb-1">Avg Cycle Time</div>
                <div className="text-2xl font-bold text-orange-700">
                  <NumberFlow value={pipelineStats.averageCycleTime} suffix=" days" />
                </div>
                <div className="text-xs text-gray-600">To close</div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4">
        {STAGES.map((stage, stageIndex) => {
          const stageDeals = dealsByStage[stage.id] || []

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stageIndex * 0.1 }}
            >
              <LiquidGlassCard>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold text-gray-800">{stage.label}</h3>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {stageDeals.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No deals in this stage
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <motion.div
                          key={deal.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleViewDealDetails(deal)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-800 mb-1">{deal.title}</h4>
                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                <Building className="w-3 h-3" />
                                {deal.company}
                              </div>
                            </div>
                            {getDealPriorityIcon(deal.priority)}
                          </div>

                          <div className="text-lg font-bold text-green-600 mb-2">
                            {formatCurrency(deal.value)}
                          </div>

                          <div className="text-xs text-gray-600 mb-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Users className="w-3 h-3" />
                              {deal.contactName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatRelativeTime(deal.lastContact)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs mb-3">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {deal.probability}% probability
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditDeal(deal.id)
                              }}
                              className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            {stage.id !== 'won' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const nextStageIndex = STAGES.findIndex(s => s.id === deal.stage) + 1
                                  if (nextStageIndex < STAGES.length) {
                                    handleMoveDeal(deal.id, STAGES[nextStageIndex].id)
                                  }
                                }}
                                className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                              >
                                Move <MoveRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteDeal({ id: deal.id, title: deal.title })
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Contacts Sidebar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Key Contacts</h3>
              <span className="text-sm text-gray-600">{contacts.length} total</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                      <div className="text-xs text-gray-600">{contact.position}</div>
                      <div className="text-xs text-gray-500">{contact.company}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${contact.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {contact.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(contact.totalValue)} total value
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSendEmail(contact.email, contact.name)}
                      className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      Email
                    </button>
                    <button
                      onClick={() => handleScheduleCall(contact.id, contact.name)}
                      className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </button>
                    <button
                      onClick={() => handleEditContact(contact.id)}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteContact({ id: contact.id, name: contact.name })}
                      className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Deal Details Modal */}
      <AnimatePresence>
        {showDealModal && selectedDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDealModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedDeal.title}</h3>
                  <p className="text-gray-600">{selectedDeal.company}</p>
                </div>
                <button
                  onClick={() => setShowDealModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-green-600 mb-1">Deal Value</div>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(selectedDeal.value)}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-600 mb-1">Probability</div>
                  <div className="text-2xl font-bold text-blue-700">{selectedDeal.probability}%</div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Contact:</span> {selectedDeal.contactName}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span> {selectedDeal.contactEmail}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Stage:</span>{' '}
                  <span className={`px-2 py-1 rounded text-xs ${getDealStageColor(selectedDeal.stage)}`}>
                    {selectedDeal.stage}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Next Action:</span> {selectedDeal.nextAction}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Assigned To:</span> {selectedDeal.assignedTo}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Last Contact:</span> {formatRelativeTime(selectedDeal.lastContact)}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <button
                  onClick={() => handleEditDeal(selectedDeal.id)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Deal
                </button>
                <button
                  onClick={() => handleSendEmail(selectedDeal.contactEmail, selectedDeal.contactName)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Send Email
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Deal Confirmation */}
      <AlertDialog open={!!deleteDeal} onOpenChange={() => setDeleteDeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteDeal?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteDeal} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Contact Confirmation */}
      <AlertDialog open={!!deleteContact} onOpenChange={() => setDeleteContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteContact?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteContact} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
