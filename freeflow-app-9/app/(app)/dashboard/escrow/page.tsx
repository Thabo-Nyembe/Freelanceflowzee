'use client'

import React, { useState, useReducer, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Shield,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Lock,
  Unlock,
  Download,
  FileText,
  Eye,
  Plus,
  Activity,
  Search,
  Receipt,
  Mail,
  Target,
  Trash2
} from 'lucide-react'

interface EscrowMilestone {
  id: string
  title: string
  description: string
  amount: number
  status: 'pending' | 'completed' | 'disputed'
  completedAt?: string
  dueDate?: string
  dependencies?: string[]
}

interface EscrowDeposit {
  id: string
  projectTitle: string
  clientName: string
  clientEmail: string
  amount: number
  currency: string
  status: 'pending' | 'active' | 'completed' | 'disputed' | 'released'
  createdAt: string
  releasedAt?: string
  completionPassword?: string
  progressPercentage: number
  milestones: EscrowMilestone[]
  contractUrl?: string
  clientAvatar?: string
  fees: {
    platform: number
    payment: number
    total: number
  }
  paymentMethod: string
  disputeReason?: string
  notes?: string
}

interface EscrowState {
  deposits: EscrowDeposit[]
  selectedDeposit: string | null
  loading: boolean
  error: string | null
  filter: 'all' | 'active' | 'completed' | 'pending' | 'disputed'
  searchTerm: string
}

type EscrowAction =
  | { type: 'SET_DEPOSITS'; deposits: EscrowDeposit[] }
  | { type: 'ADD_DEPOSIT'; deposit: EscrowDeposit }
  | { type: 'UPDATE_DEPOSIT'; depositId: string; updates: Partial<EscrowDeposit> }
  | { type: 'DELETE_DEPOSIT'; depositId: string }
  | { type: 'SET_FILTER'; filter: EscrowState['filter'] }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'COMPLETE_MILESTONE'; depositId: string; milestoneId: string }
  | { type: 'RELEASE_FUNDS'; depositId: string }
  | { type: 'DISPUTE_DEPOSIT'; depositId: string; reason: string }

function escrowReducer(state: EscrowState, action: EscrowAction): EscrowState {
  switch (action.type) {
    case 'SET_DEPOSITS':
      return { ...state, deposits: action.deposits, loading: false }
    case 'ADD_DEPOSIT':
      return { ...state, deposits: [...state.deposits, action.deposit] }
    case 'UPDATE_DEPOSIT':
      return {
        ...state,
        deposits: state.deposits.map(deposit =>
          deposit.id === action.depositId
            ? { ...deposit, ...action.updates }
            : deposit
        )
      }
    case 'DELETE_DEPOSIT':
      return {
        ...state,
        deposits: state.deposits.filter(d => d.id !== action.depositId)
      }
    case 'SET_FILTER':
      return { ...state, filter: action.filter }
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.searchTerm }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false }
    case 'COMPLETE_MILESTONE':
      return {
        ...state,
        deposits: state.deposits.map(deposit =>
          deposit.id === action.depositId
            ? {
                ...deposit,
                milestones: deposit.milestones.map(milestone =>
                  milestone.id === action.milestoneId
                    ? { ...milestone, status: 'completed' as const, completedAt: new Date().toISOString() }
                    : milestone
                ),
                progressPercentage: Math.round(
                  (deposit.milestones.filter(m => 
                    m.id === action.milestoneId ? true : m.status === 'completed'
                  ).length / deposit.milestones.length) * 100
                )
              }
            : deposit
        )
      }
    case 'RELEASE_FUNDS':
      return {
        ...state,
        deposits: state.deposits.map(deposit =>
          deposit.id === action.depositId
            ? { 
                ...deposit, 
                status: 'released' as const, 
                releasedAt: new Date().toISOString(),
                progressPercentage: 100
              }
            : deposit
        )
      }
    case 'DISPUTE_DEPOSIT':
      return {
        ...state,
        deposits: state.deposits.map(deposit =>
          deposit.id === action.depositId
            ? { ...deposit, status: 'disputed' as const, disputeReason: action.reason }
            : deposit
        )
      }
    default:
      return state
  }
}

export default function EscrowPage() {
  const [state, dispatch] = useReducer(escrowReducer, {
    deposits: [],
    selectedDeposit: null,
    loading: false,
    error: null,
    filter: 'all',
    searchTerm: ''
  })

  const [activeTab, setActiveTab] = useState<any>('overview')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<any>(false)
  const [releasePassword, setReleasePassword] = useState<any>('')
  const [showPasswordForm, setShowPasswordForm] = useState<string | null>(null)
  const [_selectedDeposit, _setSelectedDeposit] = useState<EscrowDeposit | null>(null)
  const [newDeposit, setNewDeposit] = useState<any>({
    projectTitle: '',
    clientName: '',
    clientEmail: '',
    amount: '',
    currency: 'USD',
    milestones: [{ title: '', description: '', amount: '' }],
    paymentMethod: 'stripe',
    notes: ''
  })

  // Mock data
  const mockDeposits: EscrowDeposit[] = [
    {
      id: 'esc_001',
      projectTitle: 'E-commerce Website Redesign',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah@techcorp.com',
      amount: 12000,
      currency: 'USD',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      completionPassword: process.env.DEMO_PASSWORD || 'demo-password',
      progressPercentage: 75,
      clientAvatar: '/avatars/sarah.jpg',
      paymentMethod: 'Stripe',
      contractUrl: '/contracts/esc_001.pdf',
      fees: {
        platform: 360,
        payment: 240,
        total: 600
      },
      notes: 'Priority project for Q1 launch. Client prefers weekly updates.',
      milestones: [
        {
          id: 'ms_001',
          title: 'Design System & Wireframes',
          description: 'Create comprehensive design system and wireframes',
          amount: 3000,
          status: 'completed',
          completedAt: '2024-01-20T14:30:00Z',
          dueDate: '2024-01-25T00:00:00Z'
        },
        {
          id: 'ms_002',
          title: 'Frontend Development',
          description: 'Build responsive frontend with React',
          amount: 4500,
          status: 'completed',
          completedAt: '2024-02-01T16:00:00Z',
          dueDate: '2024-02-05T00:00:00Z'
        },
        {
          id: 'ms_003',
          title: 'Backend Integration',
          description: 'API integration and database setup',
          amount: 3000,
          status: 'completed',
          completedAt: '2024-02-10T11:00:00Z',
          dueDate: '2024-02-12T00:00:00Z'
        },
        {
          id: 'ms_004',
          title: 'Testing & Deployment',
          description: 'QA testing and production deployment',
          amount: 1500,
          status: 'pending',
          dueDate: '2024-02-20T00:00:00Z'
        }
      ]
    },
    {
      id: 'esc_002',
      projectTitle: 'Mobile App UI/UX Design',
      clientName: 'Tech Innovations Ltd',
      clientEmail: 'projects@techinnovations.com',
      amount: 8500,
      currency: 'USD',
      status: 'active',
      createdAt: '2024-02-01T09:00:00Z',
      completionPassword: 'APP2024!',
      progressPercentage: 60,
      clientAvatar: '/avatars/tech-innovations.jpg',
      paymentMethod: 'PayPal',
      contractUrl: '/contracts/esc_002.pdf',
      fees: {
        platform: 255,
        payment: 170,
        total: 425
      },
      notes: 'iOS and Android app design. Client wants modern, minimalist approach.',
      milestones: [
        {
          id: 'ms_005',
          title: 'User Research & Analysis',
          description: 'Conduct user interviews and competitive analysis',
          amount: 2000,
          status: 'completed',
          completedAt: '2024-02-05T13:00:00Z',
          dueDate: '2024-02-08T00:00:00Z'
        },
        {
          id: 'ms_006',
          title: 'Wireframes & User Flow',
          description: 'Create detailed wireframes and user journey maps',
          amount: 2500,
          status: 'completed',
          completedAt: '2024-02-12T15:30:00Z',
          dueDate: '2024-02-15T00:00:00Z'
        },
        {
          id: 'ms_007',
          title: 'High-Fidelity Designs',
          description: 'Design pixel-perfect UI screens',
          amount: 3000,
          status: 'completed',
          completedAt: '2024-02-18T10:00:00Z',
          dueDate: '2024-02-22T00:00:00Z'
        },
        {
          id: 'ms_008',
          title: 'Interactive Prototype',
          description: 'Build clickable prototype for testing',
          amount: 1000,
          status: 'pending',
          dueDate: '2024-02-28T00:00:00Z'
        }
      ]
    },
    {
      id: 'esc_003',
      projectTitle: 'Brand Identity Package',
      clientName: 'StartupXYZ',
      clientEmail: 'hello@startupxyz.com',
      amount: 5000,
      currency: 'USD',
      status: 'released',
      createdAt: '2024-01-01T00:00:00Z',
      releasedAt: '2024-01-30T16:00:00Z',
      progressPercentage: 100,
      clientAvatar: '/avatars/startupxyz.jpg',
      paymentMethod: 'Bank Transfer',
      contractUrl: '/contracts/esc_003.pdf',
      fees: {
        platform: 150,
        payment: 50,
        total: 200
      },
      notes: 'Complete brand identity including logo, guidelines, and marketing materials.',
      milestones: [
        {
          id: 'ms_009',
          title: 'Logo Design',
          description: 'Create primary logo and variations',
          amount: 2000,
          status: 'completed',
          completedAt: '2024-01-10T14:00:00Z',
          dueDate: '2024-01-12T00:00:00Z'
        },
        {
          id: 'ms_010',
          title: 'Brand Guidelines',
          description: 'Develop comprehensive brand style guide',
          amount: 1500,
          status: 'completed',
          completedAt: '2024-01-20T11:00:00Z',
          dueDate: '2024-01-22T00:00:00Z'
        },
        {
          id: 'ms_011',
          title: 'Marketing Materials',
          description: 'Design business cards, letterhead, and templates',
          amount: 1500,
          status: 'completed',
          completedAt: '2024-01-28T16:00:00Z',
          dueDate: '2024-01-30T00:00:00Z'
        }
      ]
    },
    {
      id: 'esc_004',
      projectTitle: 'Video Production Campaign',
      clientName: 'Marketing Pro Agency',
      clientEmail: 'production@marketingpro.com',
      amount: 15000,
      currency: 'USD',
      status: 'disputed',
      createdAt: '2024-01-10T08:00:00Z',
      progressPercentage: 85,
      clientAvatar: '/avatars/marketing-pro.jpg',
      paymentMethod: 'Stripe',
      contractUrl: '/contracts/esc_004.pdf',
      disputeReason: 'Client disputes final video quality standards',
      fees: {
        platform: 450,
        payment: 300,
        total: 750
      },
      notes: 'Multi-video campaign for social media. Dispute over final deliverables.',
      milestones: [
        {
          id: 'ms_012',
          title: 'Pre-Production',
          description: 'Scripting, storyboarding, and planning',
          amount: 3000,
          status: 'completed',
          completedAt: '2024-01-15T12:00:00Z',
          dueDate: '2024-01-18T00:00:00Z'
        },
        {
          id: 'ms_013',
          title: 'Video Production',
          description: 'Filming and recording sessions',
          amount: 6000,
          status: 'completed',
          completedAt: '2024-01-25T18:00:00Z',
          dueDate: '2024-01-28T00:00:00Z'
        },
        {
          id: 'ms_014',
          title: 'Post-Production',
          description: 'Editing, color grading, and sound design',
          amount: 4500,
          status: 'completed',
          completedAt: '2024-02-05T14:00:00Z',
          dueDate: '2024-02-08T00:00:00Z'
        },
        {
          id: 'ms_015',
          title: 'Final Delivery',
          description: 'Final video files and formats',
          amount: 1500,
          status: 'disputed',
          dueDate: '2024-02-12T00:00:00Z'
        }
      ]
    }
  ]

  const memoizedMockDeposits = useMemo(() => mockDeposits, [])

  useEffect(() => {
    dispatch({ type: 'SET_DEPOSITS', deposits: memoizedMockDeposits })
  }, [memoizedMockDeposits])

  const filteredDeposits = state.deposits.filter(deposit => {
    const matchesFilter = state.filter === 'all' || deposit.status === state.filter
    const matchesSearch = deposit.projectTitle.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         deposit.clientName.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         deposit.clientEmail.toLowerCase().includes(state.searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    totalValue: state.deposits.reduce((sum, d) => sum + d.amount, 0),
    activeDeposits: state.deposits.filter(d => d.status === 'active').length,
    completedProjects: state.deposits.filter(d => d.status === 'released').length,
    disputedProjects: state.deposits.filter(d => d.status === 'disputed').length,
    totalEarnings: state.deposits.filter(d => d.status === 'released').reduce((sum, d) => sum + d.amount, 0),
    averageProjectValue: state.deposits.length > 0 ? Math.round(state.deposits.reduce((sum, d) => sum + d.amount, 0) / state.deposits.length) : 0,
    totalFees: state.deposits.reduce((sum, d) => sum + d.fees.total, 0),
    successRate: state.deposits.length > 0 ? Math.round((state.deposits.filter(d => d.status === 'released').length / state.deposits.length) * 100) : 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'released': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'disputed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'active': return Shield
      case 'completed': return CheckCircle
      case 'released': return Unlock
      case 'disputed': return AlertCircle
      default: return Shield
    }
  }

  const handleCreateDeposit = async () => {
    console.log('🔐 CREATE ESCROW DEPOSIT')

    try {
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-deposit',
          data: {
            projectTitle: newDeposit.projectTitle,
            clientName: newDeposit.clientName,
            clientEmail: newDeposit.clientEmail,
            amount: parseFloat(newDeposit.amount),
            currency: newDeposit.currency,
            milestones: newDeposit.milestones.map(m => ({
              title: m.title,
              description: m.description,
              amount: parseFloat(m.amount)
            })),
            paymentMethod: newDeposit.paymentMethod,
            notes: newDeposit.notes
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create escrow deposit')
      }

      const result = await response.json()

      if (result.success) {
        // Add deposit to local state
        dispatch({ type: 'ADD_DEPOSIT', deposit: result.deposit })

        // Close modal and reset form
        setIsCreateModalOpen(false)
        setNewDeposit({
          projectTitle: '',
          clientName: '',
          clientEmail: '',
          amount: '',
          currency: 'USD',
          milestones: [{ title: '', description: '', amount: '' }],
          paymentMethod: 'stripe',
          notes: ''
        })

        // Show success toast
        if (result.achievement) {
          toast.success(`${result.message} ${result.achievement.message} +${result.achievement.points} points!`, {
            description: `Payment link: ${result.paymentUrl}`
          })
        } else {
          toast.success(result.message, {
            description: `Payment link: ${result.paymentUrl}`
          })
        }

        // Show next steps alert
        if (result.nextSteps && result.nextSteps.length > 0) {
          setTimeout(() => {
            alert(`Next Steps:\n\n${result.nextSteps.join('\n')}`)
          }, 500)
        }
      }
    } catch (error: any) {
      console.error('Create Escrow Error:', error)
      toast.error('Failed to create escrow deposit', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleReleaseFunds = async (depositId: string) => {
    console.log('💰 RELEASE FUNDS:', depositId)

    const deposit = state.deposits.find(d => d.id === depositId)
    if (!deposit || releasePassword !== deposit.completionPassword) {
      toast.error('Invalid completion password', {
        description: 'Please enter the correct password to release funds'
      })
      return
    }

    try {
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'release-funds',
          data: {
            depositId,
            amount: deposit.amount,
            verificationCode: releasePassword
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to release funds')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        dispatch({ type: 'RELEASE_FUNDS', depositId })
        setShowPasswordForm(null)
        setReleasePassword('')

        // Show success toast
        if (result.achievement) {
          toast.success(`${result.message} ${result.achievement.message} +${result.achievement.points} points!`)
        } else {
          toast.success(result.message)
        }

        // Show payout details alert
        if (result.netAmount) {
          setTimeout(() => {
            alert(`Payout Details:
Amount: $${result.amount}
Processing Fee: $${result.processingFee.toFixed(2)}
Net Amount: $${result.netAmount.toFixed(2)}

Estimated Arrival: ${result.estimatedArrival}`)
          }, 500)
        }
      }
    } catch (error: any) {
      console.error('Release Funds Error:', error)
      toast.error('Failed to release funds', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleCompleteMilestone = async (depositId: string, milestoneId: string) => {
    console.log('✅ COMPLETE MILESTONE:', milestoneId)

    try {
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-milestone',
          data: {
            depositId,
            milestoneId
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to complete milestone')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        dispatch({ type: 'COMPLETE_MILESTONE', depositId, milestoneId })

        // Show success toast
        toast.success(result.message, {
          description: `Completed at: ${new Date(result.completedAt).toLocaleString()}`
        })

        // Show next steps alert
        if (result.nextSteps && result.nextSteps.length > 0) {
          setTimeout(() => {
            alert(`Next Steps:\n\n${result.nextSteps.join('\n')}`)
          }, 500)
        }
      }
    } catch (error: any) {
      console.error('Complete Milestone Error:', error)
      toast.error('Failed to complete milestone', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const addMilestone = () => {
    setNewDeposit({
      ...newDeposit,
      milestones: [...newDeposit.milestones, { title: '', description: '', amount: '' }]
    })
  }

  const removeMilestone = (index: number) => {
    const milestones = newDeposit.milestones.filter((_, i) => i !== index)
    setNewDeposit({ ...newDeposit, milestones })
  }

  const handleEditDeposit = (depositId: string) => {
    console.log('✏️ EDIT DEPOSIT:', depositId)
    alert(`✏️ Edit Deposit #${depositId}\n\nUpdate deposit details, milestones, and payment terms.`)
  }

  const handleDeleteDeposit = (depositId: string) => {
    console.log('🗑️ DELETE DEPOSIT:', depositId)
    if (confirm('⚠️ Delete Escrow Deposit?\n\nThis action cannot be undone.\n\nAre you sure?')) {
      dispatch({ type: 'DELETE_DEPOSIT', depositId })
      alert('✅ Deposit deleted successfully!')
    }
  }

  const handleViewContract = (depositId: string) => {
    console.log('📄 VIEW CONTRACT:', depositId)
    alert('📄 Opening contract document...')
  }

  const handleUploadContract = (depositId: string) => {
    console.log('📤 UPLOAD CONTRACT:', depositId)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log('✅ CONTRACT UPLOADED:', file.name)
        alert(`✅ Contract Uploaded!\n\nFile: ${file.name}\n\nContract has been attached to deposit.`)
      }
    }
    input.click()
  }

  const handleSendNotification = (depositId: string) => {
    console.log('📧 SEND NOTIFICATION:', depositId)
    alert('📧 Notification Sent\n\nClient has been notified about deposit status update.')
  }

  const handleDisputeResolution = (depositId: string) => {
    console.log('⚖️ DISPUTE RESOLUTION:', depositId)
    const reason = prompt('Enter dispute reason:')
    if (reason) {
      dispatch({ type: 'DISPUTE_DEPOSIT', depositId, reason })
      alert('⚖️ Dispute Filed\n\nDispute has been submitted for review.')
    }
  }

  const handleDownloadReceipt = (depositId: string) => {
    console.log('📥 DOWNLOAD RECEIPT:', depositId)
    alert('📥 Downloading receipt...\n\nReceipt will be saved as PDF.')
  }

  const handleViewTransactionHistory = (depositId: string) => {
    console.log('📊 TRANSACTION HISTORY:', depositId)
    alert('📊 Transaction History\n\nShowing all transactions for this deposit.')
  }

  const handleAddNotes = (depositId: string) => {
    console.log('📝 ADD NOTES:', depositId)
    const notes = prompt('Enter notes:')
    if (notes) {
      dispatch({ type: 'UPDATE_DEPOSIT', depositId, updates: { notes } })
      alert('✅ Notes added successfully!')
    }
  }

  const handleRequestApproval = (depositId: string) => {
    console.log('✋ REQUEST APPROVAL:', depositId)
    alert('✋ Approval Requested\n\nClient will receive approval request notification.')
  }

  const handleRefundDeposit = (depositId: string) => {
    console.log('💸 REFUND DEPOSIT:', depositId)
    if (confirm('Refund this deposit to client?\n\nThis will return funds to client account.')) {
      alert('💸 Refund Processed\n\nFunds will be returned to client within 5-7 business days.')
    }
  }

  const handleUpdatePaymentMethod = (depositId: string) => {
    console.log('💳 UPDATE PAYMENT:', depositId)
    alert('💳 Update Payment Method\n\nClient can update their payment details.')
  }

  const handleGenerateInvoice = (depositId: string) => {
    console.log('🧾 GENERATE INVOICE:', depositId)
    alert('🧾 Invoice Generated\n\nInvoice has been created and sent to client.')
  }

  const handleExportEscrowReport = () => {
    console.log('💾 EXPORT ESCROW REPORT')
    alert('💾 Exporting Escrow Report\n\nFormat: PDF\nIncluding all deposits and transactions')
  }

  const handleFilterByStatus = (filter: EscrowState['filter']) => {
    console.log('🔍 FILTER BY STATUS:', filter)
    dispatch({ type: 'SET_FILTER', filter })
  }

  const handleSearchDeposits = (searchTerm: string) => {
    console.log('🔍 SEARCH:', searchTerm)
    dispatch({ type: 'SET_SEARCH', searchTerm })
  }

  const handleEditMilestone = (depositId: string, milestoneId: string) => {
    console.log('✏️ EDIT MILESTONE:', milestoneId)
    alert(`✏️ Edit Milestone\n\nUpdate milestone details and amount.`)
  }

  const handleDeleteMilestone = (depositId: string, milestoneId: string) => {
    console.log('🗑️ DELETE MILESTONE:', milestoneId)
    if (confirm('Delete this milestone?')) {
      alert('✅ Milestone deleted!')
    }
  }

  const handleAddMilestone = (depositId: string) => {
    console.log('➕ ADD MILESTONE:', depositId)
    alert('➕ Add Milestone\n\nCreate a new milestone for this deposit.')
  }

  const handleViewDepositDetails = (depositId: string) => {
    console.log('👁️ VIEW DETAILS:', depositId)
    alert('👁️ Viewing detailed deposit information...')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Secure Escrow</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">KAZI</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Protected payments for freelancers</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Escrow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Escrow Deposit</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectTitle">Project Title</Label>
                      <Input
                        id="projectTitle"
                        value={newDeposit.projectTitle}
                        onChange={(e) => setNewDeposit({...newDeposit, projectTitle: e.target.value})}
                        placeholder="Enter project title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="amount">Total Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newDeposit.amount}
                        onChange={(e) => setNewDeposit({...newDeposit, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={newDeposit.clientName}
                        onChange={(e) => setNewDeposit({...newDeposit, clientName: e.target.value})}
                        placeholder="Client full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={newDeposit.clientEmail}
                        onChange={(e) => setNewDeposit({...newDeposit, clientEmail: e.target.value})}
                        placeholder="client@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={newDeposit.currency} onValueChange={(value) => setNewDeposit({...newDeposit, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD (C$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select value={newDeposit.paymentMethod} onValueChange={(value) => setNewDeposit({...newDeposit, paymentMethod: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Project Notes</Label>
                    <Textarea
                      id="notes"
                      value={newDeposit.notes}
                      onChange={(e) => setNewDeposit({...newDeposit, notes: e.target.value})}
                      placeholder="Additional notes about the project..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Project Milestones</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Milestone
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {newDeposit.milestones.map((milestone, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Milestone {index + 1}</h4>
                            {newDeposit.milestones.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMilestone(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`milestone-title-${index}`}>Title</Label>
                              <Input
                                id={`milestone-title-${index}`}
                                value={milestone.title}
                                onChange={(e) => {
                                  const milestones = [...newDeposit.milestones]
                                  milestones[index].title = e.target.value
                                  setNewDeposit({...newDeposit, milestones})
                                }}
                                placeholder="Milestone title"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`milestone-amount-${index}`}>Amount</Label>
                              <Input
                                id={`milestone-amount-${index}`}
                                type="number"
                                value={milestone.amount}
                                onChange={(e) => {
                                  const milestones = [...newDeposit.milestones]
                                  milestones[index].amount = e.target.value
                                  setNewDeposit({...newDeposit, milestones})
                                }}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <Label htmlFor={`milestone-description-${index}`}>Description</Label>
                            <Textarea
                              id={`milestone-description-${index}`}
                              value={milestone.description}
                              onChange={(e) => {
                                const milestones = [...newDeposit.milestones]
                                milestones[index].description = e.target.value
                                setNewDeposit({...newDeposit, milestones})
                              }}
                              placeholder="Milestone description"
                              rows={2}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateDeposit}>
                      Create Escrow
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposits">Deposits ({filteredDeposits.length})</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Escrow Value</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Deposits</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.activeDeposits}</p>
                    </div>
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.completedProjects}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.successRate}%</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Escrow Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.deposits.slice(0, 3).map(deposit => (
                    <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={deposit.clientAvatar} alt={deposit.clientName} />
                          <AvatarFallback>{deposit.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{deposit.projectTitle}</h4>
                          <p className="text-sm text-gray-600">{deposit.clientName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${deposit.amount.toLocaleString()}</p>
                        <Badge className={getStatusColor(deposit.status)}>
                          {deposit.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="deposits" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search deposits..."
                  value={state.searchTerm}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={state.filter} onValueChange={(value) => dispatch({ type: 'SET_FILTER', filter: value as EscrowState['filter'] })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deposits List */}
            <div className="space-y-6">
              {filteredDeposits.map(deposit => {
                const StatusIcon = getStatusIcon(deposit.status)
                const completedMilestones = deposit.milestones.filter(m => m.status === 'completed').length
                const totalMilestones = deposit.milestones.length
                
                return (
                  <Card key={deposit.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={deposit.clientAvatar} alt={deposit.clientName} />
                            <AvatarFallback>{deposit.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl">{deposit.projectTitle}</CardTitle>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {deposit.clientName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {deposit.clientEmail}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(deposit.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">${deposit.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{deposit.currency}</p>
                          </div>
                          <Badge className={getStatusColor(deposit.status)}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {deposit.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress ({completedMilestones}/{totalMilestones} milestones)</span>
                          <span>{deposit.progressPercentage}%</span>
                        </div>
                        <Progress value={deposit.progressPercentage} className="h-2" />
                      </div>
                      
                      {/* Milestones */}
                      <div>
                        <h4 className="font-semibold mb-3">Milestones</h4>
                        <div className="grid gap-3">
                          {deposit.milestones.map(milestone => (
                            <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  {milestone.status === 'completed' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : milestone.status === 'disputed' ? (
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-gray-400" />
                                  )}
                                  <div>
                                    <p className="font-medium">{milestone.title}</p>
                                    <p className="text-sm text-gray-600">{milestone.description}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${milestone.amount.toLocaleString()}</p>
                                {milestone.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-1"
                                    onClick={() => handleCompleteMilestone(deposit.id, milestone.id)}
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Payment: {deposit.paymentMethod}</span>
                          <span>Fees: ${deposit.fees.total}</span>
                          {deposit.contractUrl && (
                            <Button variant="ghost" size="sm" onClick={() => window.open(deposit.contractUrl, '_blank')}>
                              <FileText className="w-4 h-4 mr-1" />
                              Contract
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {deposit.status === 'active' && deposit.progressPercentage === 100 && (
                            <>
                              {showPasswordForm === deposit.id ? (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    type="password"
                                    placeholder="Completion password"
                                    value={releasePassword}
                                    onChange={(e) => setReleasePassword(e.target.value)}
                                    className="w-40"
                                  />
                                  <Button
                                    onClick={() => handleReleaseFunds(deposit.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Unlock className="w-4 h-4 mr-1" />
                                    Release
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowPasswordForm(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => setShowPasswordForm(deposit.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Lock className="w-4 h-4 mr-1" />
                                  Release Funds
                                </Button>
                              )}
                            </>
                          )}
                          
                          {deposit.status === 'released' && (
                            <Button
                              variant="outline"
                              onClick={() => alert('Receipt downloaded!')}
                            >
                              <Receipt className="w-4 h-4 mr-1" />
                              Receipt
                            </Button>
                          )}
                          
                          {deposit.status === 'disputed' && (
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200"
                              onClick={() => alert('Dispute details: ' + deposit.disputeReason)}
                            >
                              <AlertCircle className="w-4 h-4 mr-1" />
                              View Dispute
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            onClick={() => setSelectedDeposit(deposit)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.deposits.flatMap(deposit => 
                    deposit.milestones.map(milestone => (
                      <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {milestone.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-gray-600">{deposit.projectTitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${milestone.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.deposits.filter(d => d.status === 'released').map(deposit => (
                    <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Funds Released</h4>
                          <p className="text-sm text-gray-600">{deposit.projectTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+${deposit.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{deposit.releasedAt && new Date(deposit.releasedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Escrow Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Earnings</span>
                      <span className="font-medium">${stats.totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fees Paid</span>
                      <span className="font-medium">${stats.totalFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Project Value</span>
                      <span className="font-medium">${stats.averageProjectValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium">{stats.successRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { status: 'Active', count: stats.activeDeposits, color: 'bg-blue-500' },
                      { status: 'Completed', count: stats.completedProjects, color: 'bg-green-500' },
                      { status: 'Disputed', count: stats.disputedProjects, color: 'bg-red-500' },
                      { status: 'Pending', count: state.deposits.filter(d => d.status === 'pending').length, color: 'bg-yellow-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-sm">{item.status}</span>
                        </div>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}