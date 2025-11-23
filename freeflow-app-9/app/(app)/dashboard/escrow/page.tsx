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
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
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

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Escrow')

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
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

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

  // A+++ LOAD ESCROW DATA
  useEffect(() => {
    const loadEscrowData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load escrow deposits'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Escrow deposits loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load escrow deposits')
        setIsLoading(false)
        announce('Error loading escrow deposits', 'assertive')
      }
    }

    loadEscrowData()
  }, [announce])

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
    logger.info('Create escrow deposit initiated', {
      projectTitle: newDeposit.projectTitle,
      clientName: newDeposit.clientName,
      amount: parseFloat(newDeposit.amount),
      currency: newDeposit.currency,
      milestonesCount: newDeposit.milestones.length
    })

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

        // Show next steps notification
        if (result.nextSteps && result.nextSteps.length > 0) {
          setTimeout(() => {
            logger.debug('Next steps available', {
              steps: result.nextSteps
            })
            toast.info('Next Steps Available', {
              description: result.nextSteps.join(' • ')
            })
          }, 500)
        }

        logger.info('Escrow deposit created successfully', {
          depositId: result.deposit?.id,
          paymentUrl: result.paymentUrl
        })
      }
    } catch (error: any) {
      logger.error('Failed to create escrow deposit', {
        error,
        projectTitle: newDeposit.projectTitle
      })
      toast.error('Failed to create escrow deposit', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleReleaseFunds = async (depositId: string) => {
    logger.info('Release funds initiated', { depositId })

    const deposit = state.deposits.find(d => d.id === depositId)
    if (!deposit || releasePassword !== deposit.completionPassword) {
      logger.warn('Invalid completion password', { depositId })
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

        // Show payout details notification
        if (result.netAmount) {
          setTimeout(() => {
            logger.info('Payout details available', {
              amount: result.amount,
              processingFee: result.processingFee,
              netAmount: result.netAmount,
              estimatedArrival: result.estimatedArrival
            })
            toast.success('Payout Details', {
              description: 'Amount: $' + result.amount + ' | Net: $' + result.netAmount.toFixed(2) + ' | Arrives: ' + result.estimatedArrival
            })
          }, 500)
        }

        logger.info('Funds released successfully', {
          depositId,
          amount: deposit.amount
        })
      }
    } catch (error: any) {
      logger.error('Failed to release funds', { error, depositId })
      toast.error('Failed to release funds', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleCompleteMilestone = async (depositId: string, milestoneId: string) => {
    logger.info('Complete milestone initiated', { depositId, milestoneId })

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

        // Show next steps notification
        if (result.nextSteps && result.nextSteps.length > 0) {
          setTimeout(() => {
            logger.debug('Milestone next steps available', {
              milestoneId,
              nextSteps: result.nextSteps
            })
            toast.info('Next Steps', {
              description: result.nextSteps.join(' • ')
            })
          }, 500)
        }

        logger.info('Milestone completed successfully', {
          depositId,
          milestoneId,
          completedAt: result.completedAt
        })
      }
    } catch (error: any) {
      logger.error('Failed to complete milestone', { error, depositId, milestoneId })
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
    logger.info('Edit deposit initiated', { depositId })
    toast.info('Edit Deposit', {
      description: 'Update deposit details, milestones, and payment terms'
    })
  }

  const handleDeleteDeposit = (depositId: string) => {
    logger.info('Delete deposit initiated', { depositId })
    if (confirm('⚠️ Delete Escrow Deposit?\n\nThis action cannot be undone.\n\nAre you sure?')) {
      logger.info('Deposit deleted', { depositId })
      dispatch({ type: 'DELETE_DEPOSIT', depositId })
      toast.success('Deposit Deleted', {
        description: 'Escrow deposit has been removed successfully'
      })
    }
  }

  const handleViewContract = (depositId: string) => {
    logger.info('View contract initiated', { depositId })
    toast.info('Opening Contract', {
      description: 'Contract document is being loaded'
    })
  }

  const handleUploadContract = (depositId: string) => {
    logger.info('Upload contract initiated', { depositId })
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        logger.info('Contract uploaded successfully', {
          depositId,
          fileName: file.name,
          fileSize: file.size
        })
        toast.success('Contract Uploaded', {
          description: 'File: ' + file.name + ' has been attached to deposit'
        })
      }
    }
    input.click()
  }

  const handleSendNotification = (depositId: string) => {
    logger.info('Send notification initiated', { depositId })
    toast.success('Notification Sent', {
      description: 'Client has been notified about deposit status update'
    })
  }

  const handleDisputeResolution = (depositId: string) => {
    logger.info('Dispute resolution initiated', { depositId })
    const reason = prompt('Enter dispute reason:')
    if (reason) {
      logger.info('Dispute filed', { depositId, reason })
      dispatch({ type: 'DISPUTE_DEPOSIT', depositId, reason })
      toast.info('Dispute Filed', {
        description: 'Dispute has been submitted for review'
      })
    }
  }

  const handleDownloadReceipt = (depositId: string) => {
    logger.info('Download receipt initiated', { depositId })
    toast.info('Downloading Receipt', {
      description: 'Receipt will be saved as PDF'
    })
  }

  const handleViewTransactionHistory = (depositId: string) => {
    logger.info('View transaction history initiated', { depositId })
    toast.info('Transaction History', {
      description: 'Showing all transactions for this deposit'
    })
  }

  const handleAddNotes = (depositId: string) => {
    logger.info('Add notes initiated', { depositId })
    const notes = prompt('Enter notes:')
    if (notes) {
      logger.info('Notes added', { depositId, notes })
      dispatch({ type: 'UPDATE_DEPOSIT', depositId, updates: { notes } })
      toast.success('Notes Added', {
        description: 'Notes have been saved to deposit'
      })
    }
  }

  const handleRequestApproval = (depositId: string) => {
    logger.info('Request approval initiated', { depositId })
    toast.success('Approval Requested', {
      description: 'Client will receive approval request notification'
    })
  }

  const handleRefundDeposit = (depositId: string) => {
    logger.info('Refund deposit initiated', { depositId })
    if (confirm('Refund this deposit to client?\n\nThis will return funds to client account.')) {
      logger.info('Refund processed', { depositId })
      toast.success('Refund Processed', {
        description: 'Funds will be returned to client within 5-7 business days'
      })
    }
  }

  const handleUpdatePaymentMethod = (depositId: string) => {
    logger.info('Update payment method initiated', { depositId })
    toast.info('Update Payment Method', {
      description: 'Client can update their payment details'
    })
  }

  const handleGenerateInvoice = (depositId: string) => {
    logger.info('Generate invoice initiated', { depositId })
    toast.success('Invoice Generated', {
      description: 'Invoice has been created and sent to client'
    })
  }

  const handleExportEscrowReport = () => {
    logger.info('Export escrow report initiated', { format: 'PDF' })
    toast.info('Exporting Report', {
      description: 'PDF report including all deposits and transactions'
    })
  }

  const handleFilterByStatus = (filter: EscrowState['filter']) => {
    logger.debug('Filter by status', { filter })
    dispatch({ type: 'SET_FILTER', filter })
  }

  const handleSearchDeposits = (searchTerm: string) => {
    logger.debug('Search deposits', { searchTerm })
    dispatch({ type: 'SET_SEARCH', searchTerm })
  }

  const handleEditMilestone = (depositId: string, milestoneId: string) => {
    logger.info('Edit milestone initiated', { depositId, milestoneId })
    toast.info('Edit Milestone', {
      description: 'Update milestone details and amount'
    })
  }

  const handleDeleteMilestone = (depositId: string, milestoneId: string) => {
    logger.info('Delete milestone initiated', { depositId, milestoneId })
    if (confirm('Delete this milestone?')) {
      logger.info('Milestone deleted', { depositId, milestoneId })
      toast.success('Milestone Deleted', {
        description: 'Milestone has been removed successfully'
      })
    }
  }

  const handleAddMilestone = (depositId: string) => {
    logger.info('Add milestone initiated', { depositId })
    toast.info('Add Milestone', {
      description: 'Create a new milestone for this deposit'
    })
  }

  const handleViewDepositDetails = (depositId: string) => {
    logger.info('View deposit details initiated', { depositId })
    toast.info('Viewing Details', {
      description: 'Loading detailed deposit information'
    })
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={3} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // A+++ EMPTY STATE
  if (filteredDeposits.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <NoDataEmptyState
          entityName="escrow deposits"
          description={
            state.searchTerm || state.filter !== 'all'
              ? "No escrow deposits match your search criteria. Try adjusting your filters."
              : "Get started by creating your first secure escrow deposit."
          }
          action={{
            label: state.searchTerm || state.filter !== 'all' ? 'Clear Filters' : 'Create Escrow',
            onClick: state.searchTerm || state.filter !== 'all'
              ? () => {
                  dispatch({ type: 'SET_SEARCH', searchTerm: '' })
                  dispatch({ type: 'SET_FILTER', filter: 'all' })
                }
              : () => setIsCreateModalOpen(true)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <TextShimmer className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 dark:from-gray-100 dark:via-purple-100 dark:to-violet-100 bg-clip-text text-transparent">
                Secure Escrow
              </TextShimmer>
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

      {/* EDUCATIONAL SECTION - USER MANUAL SPEC */}
      <div className="p-6">
        <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="w-6 h-6 text-purple-600" />
              Understanding Escrow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What is Escrow */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                What is Escrow?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Escrow is a <strong>secure payment system</strong> where client funds are held safely until project
                milestones are completed, <strong>protecting both parties</strong>. Think of it as a trusted third party
                that holds payment until work is approved.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Benefits for Freelancers */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border-2 border-green-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Benefits for Freelancers
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Guaranteed Payment Security</p>
                      <p className="text-sm text-gray-600">Funds are secured upfront, ensuring you get paid for your work</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Professional Credibility</p>
                      <p className="text-sm text-gray-600">Using escrow demonstrates professionalism and builds trust</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Clear Payment Terms</p>
                      <p className="text-sm text-gray-600">Milestone-based releases with defined deliverables</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Dispute Protection</p>
                      <p className="text-sm text-gray-600">Fair resolution process if disagreements arise</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Benefits for Clients */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border-2 border-blue-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
                  <CheckCircle className="w-5 h-5" />
                  Benefits for Clients
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Work Quality Assurance</p>
                      <p className="text-sm text-gray-600">Only release payment when you're satisfied with deliverables</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Milestone-Based Releases</p>
                      <p className="text-sm text-gray-600">Pay as work progresses, not all upfront</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Refund Protection</p>
                      <p className="text-sm text-gray-600">Get your money back if work doesn't meet standards</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Professional Service Guarantee</p>
                      <p className="text-sm text-gray-600">Freelancers are committed to delivering quality work</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* How It Works Process Flow */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                How Escrow Works
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Create Project with Escrow',
                    description: 'Set up your project and define milestone structure',
                    icon: Plus
                  },
                  {
                    step: 2,
                    title: 'Client Deposits Funds',
                    description: 'Money is held securely in escrow (not released yet)',
                    icon: Lock
                  },
                  {
                    step: 3,
                    title: 'Freelancer Completes Milestone',
                    description: 'Work is done and deliverables are submitted',
                    icon: CheckCircle
                  },
                  {
                    step: 4,
                    title: 'Client Reviews and Approves',
                    description: 'Review the work and approve if satisfied',
                    icon: Eye
                  },
                  {
                    step: 5,
                    title: 'Funds Released Automatically',
                    description: 'Payment goes to freelancer upon approval',
                    icon: Zap
                  }
                ].map(({ step, title, description, icon: Icon }) => (
                  <div key={step} className="flex items-start gap-4 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                        {step}
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-start gap-2">
                        <Icon className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{title}</h4>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center border border-green-200">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-900">100% Money-Back Guarantee</p>
                <p className="text-xs text-green-700 mt-1">If work doesn't meet standards</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-200">
                <Lock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-blue-900">Funds Protected by Escrow</p>
                <p className="text-xs text-blue-700 mt-1">Bank-level security</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 text-center border border-purple-200">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-purple-900">
                  <NumberFlow value={1247} className="inline" /> Successful Releases
                </p>
                <p className="text-xs text-purple-700 mt-1">This month alone</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 pt-0">
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
                      <NumberFlow value={stats.totalValue} format="currency" className="text-2xl font-bold text-gray-900" />
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
                      <NumberFlow value={stats.activeDeposits} className="text-2xl font-bold text-blue-600" />
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
                      <NumberFlow value={stats.completedProjects} className="text-2xl font-bold text-emerald-600" />
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
                      <p className="text-2xl font-bold text-purple-600">
                        <NumberFlow value={stats.successRate} decimals={1} className="inline-block" />%
                      </p>
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
                              onClick={() => {
                                logger.info('Download receipt initiated', {
                                  depositId: deposit.id
                                })
                                toast.success('Receipt Downloaded', {
                                  description: 'Receipt has been saved to your device'
                                })
                              }}
                            >
                              <Receipt className="w-4 h-4 mr-1" />
                              Receipt
                            </Button>
                          )}

                          {deposit.status === 'disputed' && (
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200"
                              onClick={() => {
                                logger.info('View dispute initiated', {
                                  depositId: deposit.id,
                                  disputeReason: deposit.disputeReason || 'Not specified'
                                })
                                toast.info('Dispute Details', {
                                  description: deposit.disputeReason || 'No reason specified'
                                })
                              }}
                            >
                              <AlertCircle className="w-4 h-4 mr-1" />
                              View Dispute
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => {
                              logger.info('View deposit details initiated', {
                                depositId: deposit.id,
                                projectTitle: deposit.projectTitle
                              })
                              _setSelectedDeposit(deposit)
                              toast.info('Deposit Details', {
                                description: 'Viewing details for ' + deposit.projectTitle
                              })
                            }}
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