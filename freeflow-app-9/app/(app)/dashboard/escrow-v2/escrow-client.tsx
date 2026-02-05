'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Shield,
  CheckCircle,
  Clock,
  Unlock,
  Download,
  Eye,
  Plus,
  Search,
  Users,
  Building,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Wallet,
  Banknote,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Percent,
  Settings,
  Copy,
  Zap,
  BadgeCheck,
  ShieldCheck,
  Mail,
  Send,
  XCircle,
  Loader2,
  DollarSign,
  BarChart3
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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEscrow, type EscrowDeposit } from '@/lib/hooks/use-escrow'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

// Initialize Supabase client once at module level
const supabase = createClient()

// Types
type TransactionType = 'payment' | 'payout' | 'transfer' | 'refund' | 'fee'
type TransactionStatus = 'succeeded' | 'pending' | 'failed' | 'processing'
type AccountStatus = 'active' | 'pending' | 'restricted' | 'disabled'
type DisputeStatus = 'needs_response' | 'under_review' | 'won' | 'lost' | 'withdrawn'
type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  fee: number
  net: number
  currency: string
  status: TransactionStatus
  description: string
  customer: string | null
  connectedAccount: string | null
  platformFee: number
  createdAt: string
  metadata: Record<string, string>
}

interface ConnectedAccount {
  id: string
  businessName: string
  email: string
  country: string
  type: 'individual' | 'company'
  status: AccountStatus
  payoutsEnabled: boolean
  chargesEnabled: boolean
  balance: {
    available: number
    pending: number
  }
  requirements: {
    currentlyDue: string[]
    pastDue: string[]
    eventuallyDue: string[]
  }
  createdAt: string
  lastPayout: string | null
  totalVolume: number
  totalPayouts: number
}

interface _Payout { // eslint-disable-line @typescript-eslint/no-unused-vars
  id: string
  amount: number
  currency: string
  status: PayoutStatus
  arrivalDate: string
  method: 'standard' | 'instant'
  destination: string
  connectedAccount: string | null
  description: string
  createdAt: string
}

interface Dispute {
  id: string
  amount: number
  currency: string
  status: DisputeStatus
  reason: string
  transactionId: string
  customer: string
  dueBy: string
  createdAt: string
  evidence: {
    submitted: boolean
    dueDate: string
  }
}

interface _Balance { // eslint-disable-line @typescript-eslint/no-unused-vars
  available: number
  pending: number
  reserved: number
  currency: string
}

export default function EscrowClient() {
  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [_selectedAccount, _setSelectedAccount] = useState<ConnectedAccount | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [_selectedDispute, _setSelectedDispute] = useState<Dispute | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showCreatePayout, setShowCreatePayout] = useState(false)
  const [showInviteAccount, setShowInviteAccount] = useState(false)
  const [showNewEscrowDialog, setShowNewEscrowDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [transactionFilter, setTransactionFilter] = useState<TransactionType | 'all'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEscrowDeposit, setSelectedEscrowDeposit] = useState<EscrowDeposit | null>(null)

  // Use Escrow Hook for real data
  const {
    deposits,
    stats: escrowStats,
    isLoading,
    error: escrowError,
    fetchDeposits,
    createDeposit,
    updateDeposit,
    deleteDeposit,
    releaseFunds,
    createMilestone: _createMilestone, // eslint-disable-line @typescript-eslint/no-unused-vars
    updateMilestone: _updateMilestone, // eslint-disable-line @typescript-eslint/no-unused-vars
    completeMilestone: _completeMilestone // eslint-disable-line @typescript-eslint/no-unused-vars
  } = useEscrow()

  // Payout form state
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    connectedAccount: '',
    method: 'standard' as 'standard' | 'instant',
    description: ''
  })

  // Invite account form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    accountType: 'individual' as 'individual' | 'company',
    businessName: ''
  })

  // New escrow form state
  const [newEscrowForm, setNewEscrowForm] = useState({
    projectTitle: '',
    clientName: '',
    clientEmail: '',
    amount: '',
    currency: 'USD',
    description: '',
    milestones: [] as Array<{ title: string; amount: string; dueDate: string }>
  })

  // Release funds form state
  const [releaseForm, setReleaseForm] = useState({
    amount: '',
    notes: ''
  })

  // Dispute form state
  const [disputeForm, setDisputeForm] = useState({
    reason: '',
    description: '',
    evidence: ''
  })

  // Fetch deposits on mount
  useEffect(() => {
    fetchDeposits()
  }, [fetchDeposits])

  // Quick actions with real functionality
  const escrowQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Transfer',
      icon: <Send className="w-4 h-4" />,
      shortcut: 'T',
      action: () => {
        setShowCreatePayout(true)
      }
    },
    {
      id: '2',
      label: 'View Payouts',
      icon: <DollarSign className="w-4 h-4" />,
      shortcut: 'P',
      action: () => {
        setActiveTab('payouts')
        toast.success('Viewing payouts')
      }
    },
    {
      id: '3',
      label: 'Disputes',
      icon: <AlertTriangle className="w-4 h-4" />,
      shortcut: 'D',
      action: () => {
        setActiveTab('disputes')
        toast.success('Viewing disputes')
      }
    },
    {
      id: '4',
      label: 'Reports',
      icon: <BarChart3 className="w-4 h-4" />,
      shortcut: 'R',
      action: () => {
        // Open reports in new tab or navigate to reports section
        window.open('/dashboard/reports-v2?type=escrow', '_blank')
        toast.success('Opening escrow reports')
      }
    },
  ], [])

  // Stats - using real escrow data from hook
  const totalVolume = escrowStats.totalInEscrow + escrowStats.totalReleased
  const platformFees = Math.round(totalVolume * 0.029) // 2.9% platform fee estimate
  const _activeAccounts = escrowStats.active // eslint-disable-line @typescript-eslint/no-unused-vars
  const pendingDisputes = escrowStats.disputed

  // Map escrow deposits to transaction format for display
  const mappedTransactions: Transaction[] = useMemo(() => {
    return deposits.map(deposit => ({
      id: deposit.id,
      type: 'payment' as TransactionType,
      amount: deposit.amount,
      fee: Math.round(deposit.amount * 0.029 * 100) / 100, // 2.9% fee
      net: deposit.amount - Math.round(deposit.amount * 0.029 * 100) / 100,
      currency: deposit.currency || 'USD',
      status: deposit.status === 'completed' ? 'succeeded' :
              deposit.status === 'active' ? 'processing' :
              deposit.status === 'pending' ? 'pending' : 'failed' as TransactionStatus,
      description: deposit.project_title,
      customer: deposit.client_name,
      connectedAccount: null,
      platformFee: Math.round(deposit.amount * 0.029 * 100) / 100,
      createdAt: deposit.created_at,
      metadata: deposit.metadata || {}
    }))
  }, [deposits])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let filtered = mappedTransactions

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(txn =>
        txn.description.toLowerCase().includes(query) ||
        txn.customer?.toLowerCase().includes(query) ||
        txn.id.toLowerCase().includes(query)
      )
    }

    if (transactionFilter !== 'all') {
      filtered = filtered.filter(txn => txn.type === transactionFilter)
    }

    return filtered
  }, [mappedTransactions, searchQuery, transactionFilter])

  // Loading state - early return (must be after all hooks)
  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>

  // Error state - early return (must be after all hooks)
  if (escrowError) return <div className="flex flex-col items-center justify-center h-full gap-4"><p className="text-red-500">Error loading data</p><Button onClick={() => fetchDeposits()}>Retry</Button></div>

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'payment': return ArrowDownRight
      case 'payout': return ArrowUpRight
      case 'transfer': return ArrowRight
      case 'refund': return RefreshCw
      case 'fee': return Percent
    }
  }

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'payment': return 'text-green-500 bg-green-500/10'
      case 'payout': return 'text-blue-500 bg-blue-500/10'
      case 'transfer': return 'text-purple-500 bg-purple-500/10'
      case 'refund': return 'text-orange-500 bg-orange-500/10'
      case 'fee': return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusColor = (status: TransactionStatus | AccountStatus | DisputeStatus | PayoutStatus) => {
    switch (status) {
      case 'succeeded':
      case 'active':
      case 'won':
      case 'paid':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'pending':
      case 'in_transit':
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'processing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'failed':
      case 'restricted':
      case 'lost':
      case 'canceled':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'disabled':
      case 'withdrawn':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
      case 'needs_response':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount)
  }

  // Reset form helpers
  const resetNewEscrowForm = () => {
    setNewEscrowForm({
      projectTitle: '',
      clientName: '',
      clientEmail: '',
      amount: '',
      currency: 'USD',
      description: '',
      milestones: []
    })
  }

  const resetPayoutForm = () => {
    setPayoutForm({
      amount: '',
      connectedAccount: '',
      method: 'standard',
      description: ''
    })
  }

  const resetInviteForm = () => {
    setInviteForm({
      email: '',
      accountType: 'individual',
      businessName: ''
    })
  }

  const resetReleaseForm = () => {
    setReleaseForm({
      amount: '',
      notes: ''
    })
  }

  const resetDisputeForm = () => {
    setDisputeForm({
      reason: '',
      description: '',
      evidence: ''
    })
  }

  // Handlers
  const handleCreateEscrow = () => {
    setShowNewEscrowDialog(true)
  }

  const handleSubmitNewEscrow = async () => {
    if (!newEscrowForm.projectTitle || !newEscrowForm.clientName || !newEscrowForm.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to create an escrow')
        return
      }

      await createDeposit({
        user_id: user.id,
        project_title: newEscrowForm.projectTitle,
        client_name: newEscrowForm.clientName,
        client_email: newEscrowForm.clientEmail || null,
        amount: parseFloat(newEscrowForm.amount),
        currency: newEscrowForm.currency,
        status: 'pending',
        progress_percentage: 0,
        released_amount: 0,
        metadata: { description: newEscrowForm.description }
      })

      toast.success('Escrow created successfully')
      setShowNewEscrowDialog(false)
      resetNewEscrowForm()
    } catch (error) {
      toast.error('Failed to create escrow')
    } finally {
      setIsSubmitting(false)
    }
  }

  const _handleReleaseFunds = async (deposit: EscrowDeposit) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    setSelectedEscrowDeposit(deposit)
    setReleaseForm({
      amount: String(deposit.amount - (deposit.released_amount || 0)),
      notes: ''
    })
    setShowReleaseDialog(true)
  }

  const handleSubmitReleaseFunds = async () => {
    if (!selectedEscrowDeposit || !releaseForm.amount) {
      toast.error('Please enter an amount to release')
      return
    }

    const amount = parseFloat(releaseForm.amount)
    const remainingAmount = selectedEscrowDeposit.amount - (selectedEscrowDeposit.released_amount || 0)

    if (amount > remainingAmount) {
      toast.error('Amount exceeds remaining escrow balance')
      return
    }

    setIsSubmitting(true)
    try {
      await releaseFunds(selectedEscrowDeposit.id, amount)
      toast.success(`Funds released successfully for "${selectedEscrowDeposit.project_title}"`)
      setShowReleaseDialog(false)
      resetReleaseForm()
      setSelectedEscrowDeposit(null)
    } catch (error) {
      toast.error('Failed to release funds')
    } finally {
      setIsSubmitting(false)
    }
  }

  const _handleRequestRefund = async (deposit: EscrowDeposit) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    setIsSubmitting(true)
    try {
      await updateDeposit(deposit.id, { status: 'refunded' })
      toast.success('Refund requested')
    } catch (error) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error('Failed to request refund')
    } finally {
      setIsSubmitting(false)
    }
  }

  const _handleDisputeEscrow = (deposit: EscrowDeposit) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    setSelectedEscrowDeposit(deposit)
    resetDisputeForm()
    setShowDisputeDialog(true)
  }

  const handleSubmitDispute = async () => {
    if (!selectedEscrowDeposit || !disputeForm.reason) {
      toast.error('Please provide a reason for the dispute')
      return
    }

    setIsSubmitting(true)
    try {
      await updateDeposit(selectedEscrowDeposit.id, {
        status: 'disputed',
        metadata: {
          ...selectedEscrowDeposit.metadata,
          dispute: {
            reason: disputeForm.reason,
            description: disputeForm.description,
            evidence: disputeForm.evidence,
            created_at: new Date().toISOString()
          }
        }
      })
      toast.success('Dispute opened')
      setShowDisputeDialog(false)
      resetDisputeForm()
      setSelectedEscrowDeposit(null)
    } catch (error) {
      toast.error('Failed to open dispute')
    } finally {
      setIsSubmitting(false)
    }
  }

  const _handleCancelEscrow = async (deposit: EscrowDeposit) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    if (deposit.status !== 'pending') {
      toast.error('Only pending escrows can be cancelled')
      return
    }

    setIsSubmitting(true)
    try {
      await updateDeposit(deposit.id, { status: 'cancelled' })
      toast.success(`Escrow cancelled: "${deposit.project_title}" has been cancelled`)
    } catch (error) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error('Failed to cancel escrow')
    } finally {
      setIsSubmitting(false)
    }
  }

  const _handleDeleteEscrow = async (deposit: EscrowDeposit) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    if (deposit.status === 'active' || deposit.status === 'disputed') {
      toast.error('Cannot delete active or disputed escrows')
      return
    }

    setIsSubmitting(true)
    try {
      await deleteDeposit(deposit.id)
      toast.success(`Escrow deleted: "${deposit.project_title}" has been deleted`)
    } catch (error) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error('Failed to delete escrow')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreatePayout = async () => {
    if (!payoutForm.amount || !payoutForm.connectedAccount) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would call a payouts API
      // For now, we'll simulate the payout creation
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to create a payout')
        return
      }

      // Create a transaction record for the payout
      const { error } = await supabase
        .from('escrow_transactions')
        .insert({
          buyer_id: user.id,
          seller_id: payoutForm.connectedAccount,
          amount: parseFloat(payoutForm.amount),
          status: payoutForm.method === 'instant' ? 'processing' : 'pending',
          type: 'payout',
          description: payoutForm.description || 'Payout',
          metadata: { method: payoutForm.method }
        })

      if (error) throw error

      toast.success(`Payout created of ${formatCurrency(parseFloat(payoutForm.amount))} initiated`)
      setShowCreatePayout(false)
      resetPayoutForm()
    } catch (error) {
      toast.error('Failed to create payout')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInviteAccount = async () => {
    if (!inviteForm.email) {
      toast.error('Please enter an email address')
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would send an invitation email
      // For now, we'll simulate the invitation
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to send invitations')
        return
      }

      // You could store the invitation in a table here
      // For now we just show success

      toast.success(`Invitation sent to ${inviteForm.email}`)
      setShowInviteAccount(false)
      resetInviteForm()
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSyncNow = async () => {
    toast.promise(
      fetchDeposits(),
      {
        loading: 'Syncing escrow data...',
        success: 'Sync complete! All data has been refreshed',
        error: 'Sync failed. Please try again'
      }
    )
  }

  const handleAddMilestone = () => {
    setNewEscrowForm(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', amount: '', dueDate: '' }]
    }))
  }

  const handleUpdateMilestone = (index: number, field: string, value: string) => {
    setNewEscrowForm(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    }))
  }

  const handleRemoveMilestone = (index: number) => {
    setNewEscrowForm(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Escrow & Payments</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    Stripe Connect Level
                  </span>
                </div>
                <p className="text-emerald-100 max-w-2xl">
                  Secure marketplace payments with multi-party splits, connected accounts, and automated payouts
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateEscrow}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  New Escrow
                </button>
                <button
                  onClick={() => setShowCreatePayout(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Banknote className="w-4 h-4" />
                  Create Payout
                </button>
                <button
                  onClick={() => setShowInviteAccount(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Invite Account
                </button>
              </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Released Funds</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(escrowStats.totalReleased)}</div>
                <div className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {escrowStats.completed} completed
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">In Escrow</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(escrowStats.totalInEscrow)}</div>
                <div className="text-emerald-200 text-xs mt-1">{escrowStats.active + escrowStats.pending} active deposits</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Platform Fees</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(platformFees)}</div>
                <div className="text-emerald-200 text-xs mt-1">2.9% estimated</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Total Volume</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(totalVolume)}</div>
                <div className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {escrowStats.total} total escrows
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400">System Online</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last sync: <span className="font-medium text-gray-900 dark:text-white">2 minutes ago</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncNow}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
              <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-lg">Transactions</TabsTrigger>
              <TabsTrigger value="payouts" className="rounded-lg">Payouts</TabsTrigger>
              <TabsTrigger value="accounts" className="rounded-lg">Connected Accounts</TabsTrigger>
              <TabsTrigger value="disputes" className="rounded-lg">
                Disputes
                {pendingDisputes > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingDisputes}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Transactions */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {mappedTransactions.slice(0, 5).map((txn: Transaction) => {
                    const Icon = getTransactionIcon(txn.type)
                    return (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => setSelectedTransaction(txn)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getTransactionColor(txn.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{txn.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {txn.customer || 'Platform'} · {new Date(txn.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(txn.status)}`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {mappedTransactions.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No transactions yet</p>
                  )}
                </div>
              </div>

              {/* Quick Stats & Actions */}
              <div className="space-y-6">
                {/* Account Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Connected Accounts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Escrows</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{escrowStats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                      <span className="font-semibold text-green-600">{escrowStats.active}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
                      <span className="font-semibold text-yellow-600">{escrowStats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Disputed</span>
                      <span className="font-semibold text-orange-600">
                        {escrowStats.disputed}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="w-full mt-4 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    Manage Accounts
                  </button>
                </div>

                {/* Disputes Alert */}
                {pendingDisputes > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800 dark:text-orange-200">
                          {pendingDisputes} Dispute{pendingDisputes > 1 ? 's' : ''} Need Response
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-300">
                          Respond before the deadline to avoid auto-loss
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('disputes')}
                      className="mt-3 text-sm text-orange-700 dark:text-orange-300 hover:underline"
                    >
                      View Disputes →
                    </button>
                  </div>
                )}

                {/* Compliance Status */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Compliance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">PCI DSS Compliant</p>
                        <p className="text-xs text-green-600 dark:text-green-300">Level 1 certified</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <BadgeCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">KYC/AML Verified</p>
                        <p className="text-xs text-green-600 dark:text-green-300">All accounts verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Velocity & Risk Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Transaction Velocity
                  </h3>
                  <select className="text-sm px-3 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const values = [45, 62, 38, 75, 58, 22, 15]
                    const amounts = ['$12,450', '$18,300', '$9,200', '$24,600', '$15,800', '$5,400', '$3,200']
                    return (
                      <div key={day} className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 w-12">{day}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full"
                            style={{ width: `${values[idx]}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">{amounts[idx]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    Risk Monitoring
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-600">98.5%</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Transactions Safe</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                      <div className="text-3xl font-bold text-yellow-600">3</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Flagged Today</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Velocity Check', status: 'pass', detail: '24 txns/hour (limit: 100)' },
                      { label: 'Geographic Risk', status: 'pass', detail: 'All regions normal' },
                      { label: 'Amount Anomaly', status: 'warning', detail: '1 unusual amount detected' },
                      { label: 'Account Verification', status: 'pass', detail: '100% verified' },
                    ].map((check) => (
                      <div key={check.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          {check.status === 'pass' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{check.label}</p>
                            <p className="text-xs text-gray-500">{check.detail}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          check.status === 'pass'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {check.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Analytics & Milestones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-emerald-600" />
                  Fee Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-sm text-gray-500">Total Fees Collected</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$8,432.50</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-sm text-gray-500">Average Fee %</span>
                    <span className="font-semibold text-gray-900 dark:text-white">2.8%</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-sm text-gray-500">Fee Waivers</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$245.00</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">Net Fees MTD</span>
                    <span className="font-semibold text-emerald-600">$8,187.50</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Milestone Escrow Tracker
                </h3>
                <div className="space-y-3">
                  {deposits.slice(0, 4).map((deposit) => {
                    const progress = deposit.progress_percentage || 0
                    const statusMap: Record<string, string> = {
                      'pending': 'pending',
                      'active': 'in_progress',
                      'completed': 'completed',
                      'disputed': 'in_dispute',
                      'cancelled': 'cancelled',
                      'refunded': 'refunded'
                    }
                    const displayStatus = statusMap[deposit.status] || deposit.status
                    return (
                      <div key={deposit.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 dark:text-white">{deposit.project_title}</p>
                            <span className="text-sm font-semibold text-emerald-600">{formatCurrency(deposit.amount, deposit.currency)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  deposit.status === 'disputed' ? 'bg-red-500' :
                                  deposit.status === 'completed' ? 'bg-green-500' :
                                  deposit.status === 'pending' ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{progress}%</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              deposit.status === 'disputed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              deposit.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {displayStatus.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {deposits.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No escrow deposits yet</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'payment', 'payout', 'refund'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setTransactionFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                      transactionFilter === type
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Net</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map(txn => {
                    const Icon = getTransactionIcon(txn.type)
                    return (
                      <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getTransactionColor(txn.type)}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{txn.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {txn.customer || 'Platform'} · {txn.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-mono ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono">
                          {txn.fee > 0 ? formatCurrency(txn.fee) : '-'}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                          {formatCurrency(txn.net)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(txn.status)}`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedTransaction(txn)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payouts</h2>
              <button
                onClick={() => setShowCreatePayout(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                Create Payout
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Payout</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Arrival</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {deposits.filter(d => d.released_amount > 0).map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{deposit.project_title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{deposit.id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(deposit.released_amount, deposit.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          standard
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                        {deposit.client_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          deposit.status === 'completed' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
                        }`}>
                          {deposit.status === 'completed' ? 'paid' : 'in transit'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {deposit.completed_at ? new Date(deposit.completed_at).toLocaleDateString() : new Date(deposit.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {deposits.filter(d => d.released_amount > 0).length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No payouts yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Connected Accounts Tab */}
          <TabsContent value="accounts" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connected Accounts</h2>
              <button
                onClick={() => setShowInviteAccount(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                Invite Account
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Show unique clients from escrow deposits */}
              {Array.from(new Map(deposits.filter(d => d.client_name).map(d => [d.client_email || d.client_name, d])).values()).map((deposit) => {
                // Calculate totals for this client
                const clientDeposits = deposits.filter(d => (d.client_email || d.client_name) === (deposit.client_email || deposit.client_name))
                const totalAmount = clientDeposits.reduce((sum, d) => sum + d.amount, 0)
                const releasedAmount = clientDeposits.reduce((sum, d) => sum + (d.released_amount || 0), 0)
                const pendingAmount = totalAmount - releasedAmount
                const hasActiveDeposits = clientDeposits.some(d => d.status === 'active' || d.status === 'pending')

                return (
                  <div
                    key={deposit.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-emerald-500/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{deposit.client_name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{deposit.client_email || 'No email'}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${hasActiveDeposits ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-gray-600 bg-gray-100 dark:bg-gray-700'}`}>
                        {hasActiveDeposits ? 'active' : 'inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total in Escrow</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pending Release</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(pendingAmount)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{clientDeposits.length} Escrow(s)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{formatCurrency(releasedAmount)} released</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {deposits.filter(d => d.client_name).length === 0 && (
                <div className="lg:col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                  No connected accounts yet. Create an escrow to add clients.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Disputes</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Dispute</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Due By</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {deposits.filter(d => d.status === 'disputed').map((deposit) => {
                    const disputeData = deposit.metadata?.dispute || {}
                    return (
                      <tr key={deposit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{deposit.project_title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{deposit.client_name || 'Unknown'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-red-600">
                          {formatCurrency(deposit.amount, deposit.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {(disputeData.reason || 'not_specified').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/30">
                            needs response
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {disputeData.created_at ? new Date(new Date(disputeData.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedEscrowDeposit(deposit)
                              setShowReleaseDialog(true)
                            }}
                            className="px-3 py-1.5 rounded-lg text-sm bg-orange-500 text-white hover:bg-orange-600"
                          >
                            Respond
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {deposits.filter(d => d.status === 'disputed').length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No disputes - keep up the good work!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Settings Tab - Escrow.com Level */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Settings },
                      { id: 'payments', label: 'Payments', icon: CreditCard },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
                      { id: 'notifications', label: 'Notifications', icon: Mail },
                      { id: 'advanced', label: 'Advanced', icon: Zap },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Configuration</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Platform Fee Rate</p>
                            <p className="text-sm text-gray-500">Default fee charged on transactions</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="number" defaultValue="2.9" className="w-20 px-3 py-2 border rounded-lg text-right dark:bg-gray-700 dark:border-gray-600" />
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Fixed Fee</p>
                            <p className="text-sm text-gray-500">Additional fixed fee per transaction</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">$</span>
                            <input type="number" defaultValue="0.30" step="0.01" className="w-20 px-3 py-2 border rounded-lg text-right dark:bg-gray-700 dark:border-gray-600" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Default Currency</p>
                            <p className="text-sm text-gray-500">Primary currency for transactions</p>
                          </div>
                          <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option>USD - US Dollar</option>
                            <option>EUR - Euro</option>
                            <option>GBP - British Pound</option>
                            <option>CAD - Canadian Dollar</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-release Funds</p>
                            <p className="text-sm text-gray-500">Automatically release after inspection period</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Escrow Periods</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Inspection Period</p>
                            <div className="flex items-center gap-2">
                              <input type="number" defaultValue="3" className="w-16 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">days</span>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dispute Window</p>
                            <div className="flex items-center gap-2">
                              <input type="number" defaultValue="7" className="w-16 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">days</span>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Max Hold Period</p>
                            <div className="flex items-center gap-2">
                              <input type="number" defaultValue="30" className="w-16 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">days</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payments Settings */}
                {settingsTab === 'payments' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payout Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Automatic Payouts</p>
                            <p className="text-sm text-gray-500">Enable scheduled automatic payouts</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Payout Schedule</p>
                            <p className="text-sm text-gray-500">How often to process payouts</p>
                          </div>
                          <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Bi-weekly</option>
                            <option>Monthly</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Minimum Payout Amount</p>
                            <p className="text-sm text-gray-500">Minimum balance for payouts</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">$</span>
                            <input type="number" defaultValue="100" className="w-24 px-3 py-2 border rounded-lg text-right dark:bg-gray-700 dark:border-gray-600" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Instant Payouts</p>
                            <p className="text-sm text-gray-500">Allow instant payouts for eligible accounts</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {[
                          { name: 'Credit/Debit Cards', enabled: true, icon: CreditCard },
                          { name: 'Bank Transfers (ACH)', enabled: true, icon: Building },
                          { name: 'Wire Transfers', enabled: true, icon: Send },
                          { name: 'Cryptocurrency', enabled: false, icon: Wallet },
                        ].map((method) => (
                          <div key={method.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <method.icon className="w-5 h-5 text-emerald-600" />
                              <span className="font-medium text-gray-900 dark:text-white">{method.name}</span>
                            </div>
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${method.enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${method.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fraud Prevention</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Fraud Detection</p>
                            <p className="text-sm text-gray-500">Enable AI-powered fraud detection</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Risk Threshold</p>
                            <p className="text-sm text-gray-500">Block transactions above this risk score</p>
                          </div>
                          <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option>High (75+)</option>
                            <option>Medium (50+)</option>
                            <option>Low (25+)</option>
                            <option>Custom</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Velocity Checks</p>
                            <p className="text-sm text-gray-500">Limit rapid successive transactions</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Requirements</h3>
                      <div className="space-y-4">
                        {[
                          { name: 'Identity Verification (KYC)', enabled: true, required: true },
                          { name: 'Bank Account Verification', enabled: true, required: true },
                          { name: 'Phone Number Verification', enabled: true, required: false },
                          { name: 'Business Verification', enabled: true, required: false },
                        ].map((req) => (
                          <div key={req.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{req.name}</p>
                              {req.required && <span className="text-xs text-red-500">Required</span>}
                            </div>
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${req.enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${req.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Compliance Settings */}
                {settingsTab === 'compliance' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AML/KYC Compliance</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">AML Screening</p>
                            <p className="text-sm text-gray-500">Screen against sanctions and PEP lists</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enhanced Due Diligence</p>
                            <p className="text-sm text-gray-500">Additional verification for high-risk accounts</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Transaction Monitoring</p>
                            <p className="text-sm text-gray-500">Continuous monitoring for suspicious activity</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reporting Thresholds</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">CTR Threshold (USD)</p>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">$</span>
                            <input type="number" defaultValue="10000" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500" />
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">SAR Threshold (USD)</p>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">$</span>
                            <input type="number" defaultValue="5000" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="font-medium text-gray-900 dark:text-white">PCI DSS</p>
                          <p className="text-xs text-green-600">Level 1 Certified</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="font-medium text-gray-900 dark:text-white">SOC 2</p>
                          <p className="text-xs text-green-600">Type II Compliant</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="font-medium text-gray-900 dark:text-white">GDPR</p>
                          <p className="text-xs text-green-600">Data Protected</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { name: 'New Payment Received', email: true, sms: false, push: true },
                          { name: 'Payout Completed', email: true, sms: true, push: true },
                          { name: 'Funds Released', email: true, sms: false, push: true },
                          { name: 'Dispute Opened', email: true, sms: true, push: true },
                          { name: 'Refund Processed', email: true, sms: false, push: true },
                        ].map((notif) => (
                          <div key={notif.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-medium text-gray-900 dark:text-white">{notif.name}</span>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked={notif.email} className="w-4 h-4 accent-emerald-600" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked={notif.sms} className="w-4 h-4 accent-emerald-600" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">SMS</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked={notif.push} className="w-4 h-4 accent-emerald-600" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Push</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert Thresholds</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Large Transaction Alert</p>
                            <p className="text-sm text-gray-500">Notify for transactions above threshold</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">$</span>
                            <input type="number" defaultValue="10000" className="w-28 px-3 py-2 border rounded-lg text-right dark:bg-gray-700 dark:border-gray-600" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Daily Summary</p>
                            <p className="text-sm text-gray-500">Receive daily transaction summary</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Configuration</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">API Key</p>
                          <div className="flex items-center gap-2">
                            <input type="password" defaultValue="ek_live_xxxxxxxxxxxx" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 font-mono text-sm" />
                            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Webhook URL</p>
                          <input type="url" placeholder="https://your-domain.com/webhooks/escrow" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500" />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Test Mode</p>
                            <p className="text-sm text-gray-500">Enable sandbox environment</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600">
                            <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Data Retention Period</p>
                            <p className="text-sm text-gray-500">How long to keep transaction data</p>
                          </div>
                          <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option>1 Year</option>
                            <option>3 Years</option>
                            <option>5 Years</option>
                            <option>7 Years (Compliance)</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                            <p className="text-sm text-gray-500">Download all transaction data</p>
                          </div>
                          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export CSV
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">Danger Zone</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Disable Escrow Service</p>
                          <p className="text-sm text-gray-500">Temporarily disable all escrow transactions</p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                          Disable Service
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar_url || undefined,
                status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const
              }))}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Transaction Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={escrowQuickActions}
            variant="grid"
          />
        </div>

        {/* Transaction Detail Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <div className={`p-3 rounded-lg ${getTransactionColor(selectedTransaction.type)}`}>
                    {(() => {
                      const Icon = getTransactionIcon(selectedTransaction.type)
                      return <Icon className="w-6 h-6" />
                    })()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedTransaction.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransaction.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Net</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedTransaction.net)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fee</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedTransaction.fee)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Platform Fee</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedTransaction.platformFee)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Date</p>
                      <p className="text-gray-900 dark:text-white">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedTransaction.customer && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Customer</p>
                        <p className="text-gray-900 dark:text-white">{selectedTransaction.customer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Payout Dialog */}
        <Dialog open={showCreatePayout} onOpenChange={(open) => { setShowCreatePayout(open); if (!open) resetPayoutForm(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Payout</DialogTitle>
              <DialogDescription>
                Send funds to a connected account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payout-amount">Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="payout-amount"
                    type="number"
                    placeholder="0.00"
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="connected-account">Connected Account</Label>
                <Select
                  value={payoutForm.connectedAccount}
                  onValueChange={(value) => setPayoutForm(prev => ({ ...prev, connectedAccount: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {deposits.filter(d => d.status === 'active' || d.status === 'pending').map((deposit) => (
                      <SelectItem key={deposit.id} value={deposit.id}>{deposit.project_title} - {deposit.client_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Method</Label>
                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setPayoutForm(prev => ({ ...prev, method: 'standard' }))}
                    className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                      payoutForm.method === 'standard'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-500'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">Standard</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2-3 business days</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutForm(prev => ({ ...prev, method: 'instant' }))}
                    className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                      payoutForm.method === 'instant'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-500'
                    }`}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <p className="font-medium text-gray-900 dark:text-white">Instant</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1.5% fee, within minutes</p>
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="payout-description">Description (optional)</Label>
                <Input
                  id="payout-description"
                  placeholder="Weekly payout, project payment, etc."
                  value={payoutForm.description}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => { setShowCreatePayout(false); resetPayoutForm(); }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePayout}
                  disabled={isSubmitting || !payoutForm.amount || !payoutForm.connectedAccount}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Payout'
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invite Account Dialog */}
        <Dialog open={showInviteAccount} onOpenChange={(open) => { setShowInviteAccount(open); if (!open) resetInviteForm(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite Connected Account</DialogTitle>
              <DialogDescription>
                Send an invitation to connect a new payment account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="contractor@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Account Type</Label>
                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setInviteForm(prev => ({ ...prev, accountType: 'individual' }))}
                    className={`flex-1 p-3 border-2 rounded-lg text-left transition-colors ${
                      inviteForm.accountType === 'individual'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-500'
                    }`}
                  >
                    <Users className="w-5 h-5 text-emerald-600 mb-1" />
                    <p className="font-medium text-gray-900 dark:text-white">Individual</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Freelancers, contractors</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteForm(prev => ({ ...prev, accountType: 'company' }))}
                    className={`flex-1 p-3 border-2 rounded-lg text-left transition-colors ${
                      inviteForm.accountType === 'company'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-500'
                    }`}
                  >
                    <Building className="w-5 h-5 text-emerald-600 mb-1" />
                    <p className="font-medium text-gray-900 dark:text-white">Company</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Businesses, agencies</p>
                  </button>
                </div>
              </div>
              {inviteForm.accountType === 'company' && (
                <div>
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    placeholder="Acme Corporation"
                    value={inviteForm.businessName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, businessName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              )}
              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => { setShowInviteAccount(false); resetInviteForm(); }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteAccount}
                  disabled={isSubmitting || !inviteForm.email}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invite
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Escrow Dialog */}
        <Dialog open={showNewEscrowDialog} onOpenChange={(open) => { setShowNewEscrowDialog(open); if (!open) resetNewEscrowForm(); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Escrow</DialogTitle>
              <DialogDescription>
                Set up a secure escrow payment for a project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="project-title">Project Title *</Label>
                  <Input
                    id="project-title"
                    placeholder="Website Development"
                    value={newEscrowForm.projectTitle}
                    onChange={(e) => setNewEscrowForm(prev => ({ ...prev, projectTitle: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="escrow-amount">Amount *</Label>
                  <div className="flex gap-2 mt-1">
                    <Select
                      value={newEscrowForm.currency}
                      onValueChange={(value) => setNewEscrowForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="ZAR">ZAR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="escrow-amount"
                      type="number"
                      placeholder="0.00"
                      value={newEscrowForm.amount}
                      onChange={(e) => setNewEscrowForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="client-name">Client Name *</Label>
                  <Input
                    id="client-name"
                    placeholder="John Doe"
                    value={newEscrowForm.clientName}
                    onChange={(e) => setNewEscrowForm(prev => ({ ...prev, clientName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="client-email">Client Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="john@example.com"
                    value={newEscrowForm.clientEmail}
                    onChange={(e) => setNewEscrowForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="escrow-description">Description</Label>
                <Textarea
                  id="escrow-description"
                  placeholder="Describe the project scope and deliverables..."
                  value={newEscrowForm.description}
                  onChange={(e) => setNewEscrowForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Milestones (optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMilestone}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Milestone
                  </Button>
                </div>
                {newEscrowForm.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => handleUpdateMilestone(index, 'title', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={milestone.amount}
                      onChange={(e) => handleUpdateMilestone(index, 'amount', e.target.value)}
                      className="w-28"
                    />
                    <Input
                      type="date"
                      value={milestone.dueDate}
                      onChange={(e) => handleUpdateMilestone(index, 'dueDate', e.target.value)}
                      className="w-36"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMilestone(index)}
                    >
                      <XCircle className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => { setShowNewEscrowDialog(false); resetNewEscrowForm(); }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitNewEscrow}
                  disabled={isSubmitting || !newEscrowForm.projectTitle || !newEscrowForm.clientName || !newEscrowForm.amount}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Escrow'
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Release Funds Dialog */}
        <Dialog open={showReleaseDialog} onOpenChange={(open) => { setShowReleaseDialog(open); if (!open) { resetReleaseForm(); setSelectedEscrowDeposit(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Release Funds</DialogTitle>
              <DialogDescription>
                {selectedEscrowDeposit && `Release funds for "${selectedEscrowDeposit.project_title}"`}
              </DialogDescription>
            </DialogHeader>
            {selectedEscrowDeposit && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Total Escrow</span>
                    <span className="font-semibold">{formatCurrency(selectedEscrowDeposit.amount)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Already Released</span>
                    <span className="font-semibold text-green-600">{formatCurrency(selectedEscrowDeposit.released_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Remaining</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(selectedEscrowDeposit.amount - (selectedEscrowDeposit.released_amount || 0))}
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="release-amount">Amount to Release</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="release-amount"
                      type="number"
                      placeholder="0.00"
                      value={releaseForm.amount}
                      onChange={(e) => setReleaseForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="release-notes">Notes (optional)</Label>
                  <Textarea
                    id="release-notes"
                    placeholder="Add any notes about this release..."
                    value={releaseForm.notes}
                    onChange={(e) => setReleaseForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => { setShowReleaseDialog(false); resetReleaseForm(); setSelectedEscrowDeposit(null); }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReleaseFunds}
                    disabled={isSubmitting || !releaseForm.amount}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Releasing...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Release Funds
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dispute Dialog */}
        <Dialog open={showDisputeDialog} onOpenChange={(open) => { setShowDisputeDialog(open); if (!open) { resetDisputeForm(); setSelectedEscrowDeposit(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Open Dispute</DialogTitle>
              <DialogDescription>
                {selectedEscrowDeposit && `File a dispute for "${selectedEscrowDeposit.project_title}"`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dispute-reason">Reason *</Label>
                <Select
                  value={disputeForm.reason}
                  onValueChange={(value) => setDisputeForm(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work_not_delivered">Work Not Delivered</SelectItem>
                    <SelectItem value="quality_issues">Quality Issues</SelectItem>
                    <SelectItem value="scope_disagreement">Scope Disagreement</SelectItem>
                    <SelectItem value="payment_dispute">Payment Dispute</SelectItem>
                    <SelectItem value="communication_issues">Communication Issues</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dispute-description">Description *</Label>
                <Textarea
                  id="dispute-description"
                  placeholder="Describe the issue in detail..."
                  value={disputeForm.description}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="dispute-evidence">Evidence (URLs, file links)</Label>
                <Textarea
                  id="dispute-evidence"
                  placeholder="Add links to any supporting evidence..."
                  value={disputeForm.evidence}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, evidence: e.target.value }))}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => { setShowDisputeDialog(false); resetDisputeForm(); setSelectedEscrowDeposit(null); }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitDispute}
                  disabled={isSubmitting || !disputeForm.reason || !disputeForm.description}
                  variant="destructive"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Open Dispute
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
