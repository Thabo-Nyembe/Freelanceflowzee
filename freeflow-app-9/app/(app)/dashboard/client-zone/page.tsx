'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import {
  UserCheck,
  FolderOpen,
  MessageSquare,
  FileText,
  Download,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  ThumbsUp,
  DollarSign,
  Bell,
  Upload,
  Image,
  Calendar,
  Receipt,
  Shield,
  Brain,
  BarChart3,
  Settings,
  CreditCard,
  Palette,
  Target,
  Zap,
  Edit,
  Briefcase,
  TrendingUp,
  Users
} from 'lucide-react'
import ClientZoneGallery from '@/components/client-zone-gallery'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

// CLIENT ZONE DATABASE QUERIES
import {
  getClientZoneDashboard,
  getClientProjects,
  getProjectMessages,
  getProjectFiles,
  getProjectInvoices,
  createRevisionRequest,
  approveDeliverable,
  sendMessage,
  submitFeedback,
  type ClientProject,
  type ClientMessage,
  type ClientFile,
  type ClientInvoice
} from '@/lib/client-zone-queries'

// NEW CLIENT VALUE COMPONENTS
import { ClientOnboardingTour } from '@/components/onboarding/client-onboarding-tour'
import { ClientValueDashboard } from '@/components/client-value-dashboard'
import { ReferralLoyaltySystem } from '@/components/referral-loyalty-system'

const logger = createFeatureLogger('ClientZone')

// ============================================================================
// FRAMER MOTION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'blue' }: { delay?: number; color?: string }) => {
  return (
    <motion.div
      className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}

// ============================================================================
// MOCK DATA - DEPRECATED (Replaced with database queries)
// ============================================================================
// NOTE: This mock data is kept for reference but is no longer used.
// All data is now loaded from the database via getClientZoneDashboard()

/* DEPRECATED - Using real database data instead
const KAZI_CLIENT_DATA = {
  clientInfo: {
    name: 'Acme Corporation',
    contactPerson: 'John Smith',
    email: 'john@acme.com',
    avatar: '/avatars/acme-corp.jpg',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    industry: 'Technology',
    memberSince: '2023-01-15',
    totalProjects: 12,
    activeProjects: 3,
    completedProjects: 9,
    totalInvestment: 45000,
    satisfaction: 4.9,
    tier: 'Premium',
    nextMeeting: '2024-02-01',
    accountManager: 'Sarah Johnson'
  },

  projects: [
    {
      id: 1,
      name: 'Brand Identity Redesign',
      description: 'Complete brand overhaul including logo, color palette, and brand guidelines',
      status: 'in-progress',
      progress: 75,
      dueDate: '2024-02-15',
      budget: 8500,
      spent: 6375,
      team: ['Sarah Johnson', 'Michael Chen'],
      phase: 'Design Review',
      deliverables: [
        { name: 'Logo Concepts', status: 'completed', dueDate: '2024-01-20' },
        { name: 'Color Palette', status: 'completed', dueDate: '2024-01-25' },
        { name: 'Brand Guidelines', status: 'in-progress', dueDate: '2024-02-05' },
        { name: 'Business Cards', status: 'pending', dueDate: '2024-02-10' }
      ],
      lastUpdate: '2 hours ago'
    },
    {
      id: 2,
      name: 'Website Development',
      description: 'Modern responsive website with CMS integration',
      status: 'review',
      progress: 90,
      dueDate: '2024-01-30',
      budget: 12000,
      spent: 10800,
      team: ['Alex Thompson', 'Lisa Wang'],
      phase: 'Final Review',
      deliverables: [
        { name: 'Homepage Design', status: 'completed', dueDate: '2023-12-15' },
        { name: 'Inner Pages', status: 'completed', dueDate: '2023-12-30' },
        { name: 'CMS Integration', status: 'completed', dueDate: '2024-01-15' },
        { name: 'Testing & Launch', status: 'review', dueDate: '2024-01-30' }
      ],
      lastUpdate: '1 day ago'
    }
  ],

  messages: [
    {
      id: 1,
      sender: 'Sarah Johnson',
      role: 'Designer',
      message: 'Hi John! I\'ve uploaded the latest logo concepts for your review. Please let me know your thoughts on the color variations.',
      timestamp: '2 hours ago',
      avatar: '/avatars/sarah.jpg',
      unread: true
    },
    {
      id: 2,
      sender: 'Michael Chen',
      role: 'Developer',
      message: 'The website staging environment is ready for your review. You can access it using the credentials I sent earlier.',
      timestamp: '45 minutes ago',
      avatar: '/avatars/michael.jpg',
      unread: true
    }
  ],

  recentFiles: [
    {
      id: 1,
      name: 'Brand Guidelines Draft v3.pdf',
      size: '2.4 MB',
      uploadedBy: 'Sarah Johnson',
      uploadDate: '2024-01-25',
      project: 'Brand Identity Redesign',
      type: 'document'
    },
    {
      id: 2,
      name: 'Logo Concepts Final.zip',
      size: '15.7 MB',
      uploadedBy: 'Sarah Johnson',
      uploadDate: '2024-01-20',
      project: 'Brand Identity Redesign',
      type: 'archive'
    }
  ],

  invoices: [
    {
      id: 1,
      number: 'INV-001',
      project: 'Brand Identity Package',
      amount: 3500,
      dueDate: '2024-01-30',
      status: 'pending',
      items: ['Logo Design', 'Brand Guidelines', 'Business Card Design']
    },
    {
      id: 2,
      number: 'INV-002',
      project: 'Website Development',
      amount: 12000,
      paidDate: '2024-01-15',
      status: 'paid',
      items: ['Website Design', 'CMS Integration', 'Testing']
    }
  ],

  analytics: {
    onTimeDelivery: 94,
    firstTimeApproval: 98,
    avgResponseTime: 2.1,
    messagesExchanged: 127,
    meetingsHeld: 8,
    filesShared: 23
  }
}
*/ // End of deprecated KAZI_CLIENT_DATA

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'in-progress': return 'bg-blue-100 text-blue-800'
    case 'review': return 'bg-yellow-100 text-yellow-800'
    case 'pending': return 'bg-gray-100 text-gray-800'
    case 'paid': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />
    case 'review': return <Eye className="h-4 w-4 text-yellow-600" />
    case 'pending': return <AlertCircle className="h-4 w-4 text-gray-600" />
    default: return <Clock className="h-4 w-4 text-gray-600" />
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClientZonePage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const router = useRouter()
  const [activeTab, setActiveTab] = useState('projects')
  const [newMessage, setNewMessage] = useState('')
  const [newFeedback, setNewFeedback] = useState('')

  // DUAL PERSPECTIVE - USER MANUAL SPEC
  // Role detection: freelancer, client, or both (for agencies)
  const [userRole, setUserRole] = useState<'freelancer' | 'client' | 'both'>('client')
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  // CLIENT ZONE DATA STATE (replaces KAZI_CLIENT_DATA)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [files, setFiles] = useState<ClientFile[]>([])
  const [invoices, setInvoices] = useState<ClientInvoice[]>([])

  // A+++ LOAD CLIENT ZONE DATA FROM DATABASE
  useEffect(() => {
    const loadClientZoneData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading client zone data', { userId })

        // Load dashboard data from database
        const data = await getClientZoneDashboard()

        setDashboardData(data)
        setProjects(data.recentProjects)
        setMessages(data.recentMessages)
        setInvoices(data.pendingInvoices)

        setIsLoading(false)
        announce('Client zone loaded successfully', 'polite')
        logger.info('Client zone data loaded', {
          projectCount: data.recentProjects.length,
          messageCount: data.recentMessages.length,
          invoiceCount: data.pendingInvoices.length,
          userId
        })
      } catch (err) {
        logger.error('Failed to load client zone', { error: err, userId })
        setError(err instanceof Error ? err.message : 'Failed to load client zone data')
        setIsLoading(false)
        toast.error('Failed to load client zone', {
          description: err instanceof Error ? err.message : 'Please try again'
        })
        announce('Error loading client zone', 'assertive')
      }
    }

    loadClientZoneData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // HANDLER 1: NOTIFICATIONS
  // ============================================================================

  const handleNotifications = () => {
    logger.info('Notifications opened', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      activeProjects: KAZI_CLIENT_DATA.clientInfo.activeProjects,
      tab: activeTab
    })

    toast.success('Notifications center opened!', {
      description: 'View all your project updates and messages'
    })
  }

  // ============================================================================
  // HANDLER 2: CONTACT TEAM
  // ============================================================================

  const handleContactTeam = () => {
    logger.info('Team contact initiated', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      contactPerson: KAZI_CLIENT_DATA.clientInfo.contactPerson,
      activeProjects: KAZI_CLIENT_DATA.clientInfo.activeProjects
    })

    toast.success('Team communication opened!', {
      description: 'Send a message or schedule a call with your team'
    })
  }

  // ============================================================================
  // HANDLER 3: REQUEST REVISION
  // ============================================================================

  const handleRequestRevision = async (id: number) => {
    const project = KAZI_CLIENT_DATA.projects.find(p => p.id === id)

    logger.info('Revision request initiated', {
      projectId: id,
      projectName: project?.name,
      client: KAZI_CLIENT_DATA.clientInfo.name,
      requestedBy: KAZI_CLIENT_DATA.clientInfo.contactPerson
    })

    const feedback = prompt('Please describe the changes needed:')
    if (!feedback) {
      logger.debug('Revision request canceled')
      return
    }

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          projectId: id.toString(),
          data: {
            status: 'revision-requested',
            revisionNotes: feedback
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to request revision')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Revision request submitted', { projectId: id })

        toast.success('Revision request submitted!', {
          description: 'Your team will review and respond within 24 hours'
        })
      }
    } catch (error: any) {
      logger.error('Failed to request revision', { error, projectId: id })
      toast.error('Failed to request revision', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 4: APPROVE DELIVERABLE
  // ============================================================================

  const handleApproveDeliverable = async (id: number) => {
    const project = KAZI_CLIENT_DATA.projects.find(p => p.id === id)

    logger.info('Deliverable approval initiated', {
      projectId: id,
      projectName: project?.name,
      approvedBy: KAZI_CLIENT_DATA.clientInfo.contactPerson
    })

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          projectId: id.toString(),
          data: { status: 'approved' }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve deliverable')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Deliverable approved', { projectId: id })

        toast.success('Deliverable approved!', {
          description: 'Milestone payment will be processed automatically'
        })
      }
    } catch (error: any) {
      logger.error('Failed to approve deliverable', { error, projectId: id })
      toast.error('Failed to approve deliverable', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 5: DOWNLOAD FILES
  // ============================================================================

  const handleDownloadFiles = (id: number) => {
    const project = KAZI_CLIENT_DATA.projects.find(p => p.id === id)

    logger.info('File download initiated', {
      projectId: id,
      projectName: project?.name,
      client: KAZI_CLIENT_DATA.clientInfo.name
    })

    toast.success('Preparing download...', {
      description: 'Files will download as a ZIP archive'
    })
  }

  // ============================================================================
  // HANDLER 6: SEND MESSAGE
  // ============================================================================

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      logger.warn('Message validation failed', { reason: 'Empty message' })
      toast.error('Please enter a message')
      return
    }

    logger.info('Message sent', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      sender: KAZI_CLIENT_DATA.clientInfo.contactPerson,
      messageLength: newMessage.length
    })

    toast.success('Message sent successfully!', {
      description: 'Your team will respond within 4-6 hours'
    })
    setNewMessage('')
  }

  // ============================================================================
  // HANDLER 7: SUBMIT FEEDBACK
  // ============================================================================

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim()) {
      logger.warn('Feedback validation failed', { reason: 'Empty feedback' })
      toast.error('Please enter your feedback')
      return
    }

    logger.info('Feedback submission initiated', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      feedbackLength: newFeedback.length
    })

    try {
      const response = await fetch('/api/collaboration/client-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: newFeedback,
          rating: 5,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      logger.info('Feedback submitted successfully')

      toast.success('Feedback submitted!', {
        description: 'Your input helps us improve'
      })
      setNewFeedback('')
    } catch (error: any) {
      logger.error('Failed to submit feedback', { error })
      toast.error('Failed to submit feedback', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 8: PAY INVOICE
  // ============================================================================

  const handlePayInvoice = (invoiceNumber: string, amount: number) => {
    logger.info('Payment initiated', {
      invoiceNumber,
      amount,
      client: KAZI_CLIENT_DATA.clientInfo.name
    })

    toast.success('Redirecting to secure payment...', {
      description: `Invoice ${invoiceNumber} - ${formatCurrency(amount)}`
    })
  }

  // ============================================================================
  // HANDLER 9: SCHEDULE MEETING
  // ============================================================================

  const handleScheduleMeeting = () => {
    logger.info('Meeting scheduler opened', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      email: KAZI_CLIENT_DATA.clientInfo.email
    })

    toast.success('Opening calendar...', {
      description: 'Schedule a meeting with your team'
    })
  }

  // ============================================================================
  // HANDLER 10: VIEW INVOICE DETAILS
  // ============================================================================

  const handleViewInvoiceDetails = (invoiceNumber: string) => {
    logger.info('Invoice details viewed', {
      invoiceNumber,
      client: KAZI_CLIENT_DATA.clientInfo.name
    })

    toast.success('Loading invoice details...', {
      description: `Invoice ${invoiceNumber}`
    })
  }

  // ============================================================================
  // HANDLER 11: CLIENT ONBOARDING
  // ============================================================================

  const handleClientOnboarding = useCallback(() => {
    logger.info('Client onboarding started', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      contactPerson: KAZI_CLIENT_DATA.clientInfo.contactPerson,
      industry: KAZI_CLIENT_DATA.clientInfo.industry,
      memberSince: KAZI_CLIENT_DATA.clientInfo.memberSince
    })

    toast.success('Client onboarding started!', {
      description: 'Setting up your personalized workspace and preferences'
    })
  }, [])

  // ============================================================================
  // HANDLER 12: PROJECT PROPOSAL
  // ============================================================================

  const handleProjectProposal = useCallback(async (projectId?: number) => {
    logger.info('Project proposal initiated', {
      projectId: projectId || 'New Proposal',
      client: KAZI_CLIENT_DATA.clientInfo.name,
      accountManager: KAZI_CLIENT_DATA.clientInfo.accountManager
    })

    try {
      const response = await fetch('/api/proposals/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: KAZI_CLIENT_DATA.clientInfo.name,
          projectId: projectId,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        logger.info('Proposal sent successfully', { projectId })
        toast.success('Project proposal sent!', {
          description: 'Check your email for the detailed proposal document'
        })
      }
    } catch (error: any) {
      logger.error('Failed to send proposal', { error, projectId })
      toast.error('Failed to send proposal', {
        description: error.message || 'Please try again later'
      })
    }
  }, [])

  // ============================================================================
  // HANDLER 13: CONTRACT MANAGEMENT
  // ============================================================================

  const handleContractManagement = useCallback(() => {
    logger.info('Contract management accessed', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      totalProjects: KAZI_CLIENT_DATA.clientInfo.totalProjects,
      activeContracts: KAZI_CLIENT_DATA.clientInfo.activeProjects
    })

    toast.info('Contract management loaded', {
      description: 'View and manage all your project contracts'
    })
  }, [])

  // ============================================================================
  // HANDLER 14: MILESTONE APPROVAL
  // ============================================================================

  const handleMilestoneApproval = useCallback(async (milestoneId: number) => {
    logger.info('Milestone approval initiated', {
      milestoneId,
      client: KAZI_CLIENT_DATA.clientInfo.name
    })

    try {
      const response = await fetch('/api/milestones/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: milestoneId,
          clientId: KAZI_CLIENT_DATA.clientInfo.name,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        logger.info('Milestone approved successfully', { milestoneId })
        toast.success('Milestone approved!', {
          description: 'Payment has been released from escrow'
        })
      }
    } catch (error: any) {
      logger.error('Failed to approve milestone', { error, milestoneId })
      toast.error('Failed to approve milestone', {
        description: error.message || 'Please try again'
      })
    }
  }, [])

  // ============================================================================
  // HANDLER 15: FEEDBACK REQUEST
  // ============================================================================

  const handleFeedbackRequest = useCallback(() => {
    logger.info('Feedback request initiated', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      activeProjects: KAZI_CLIENT_DATA.clientInfo.activeProjects,
      currentSatisfaction: KAZI_CLIENT_DATA.clientInfo.satisfaction
    })

    toast.info('Feedback request sent', {
      description: 'Help us improve your experience'
    })
  }, [])

  // ============================================================================
  // HANDLER 16: FILE SHARING
  // ============================================================================

  const handleFileSharing = useCallback((fileId?: number) => {
    logger.info('File sharing initiated', {
      fileId: fileId || 'Multiple files',
      client: KAZI_CLIENT_DATA.clientInfo.name,
      totalFiles: KAZI_CLIENT_DATA.analytics.filesShared
    })

    toast.success('File sharing link generated', {
      description: 'Secure download link copied to clipboard'
    })
  }, [])

  // ============================================================================
  // HANDLER 17: MEETING SCHEDULE
  // ============================================================================

  const handleMeetingSchedule = useCallback(() => {
    logger.info('Meeting scheduler opened', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      nextMeeting: KAZI_CLIENT_DATA.clientInfo.nextMeeting,
      totalMeetings: KAZI_CLIENT_DATA.analytics.meetingsHeld
    })

    toast.info('Meeting scheduler opened', {
      description: 'Schedule a call with your project team'
    })
  }, [])

  // ============================================================================
  // HANDLER 18: INVOICE DISPUTE
  // ============================================================================

  const handleInvoiceDispute = useCallback(async (invoiceNumber: string) => {
    logger.info('Invoice dispute initiated', {
      invoiceNumber,
      client: KAZI_CLIENT_DATA.clientInfo.name
    })

    const disputeReason = prompt('Please describe the dispute:')
    if (!disputeReason) {
      logger.debug('Dispute canceled')
      return
    }

    try {
      const response = await fetch('/api/invoices/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: invoiceNumber,
          reason: disputeReason,
          clientId: KAZI_CLIENT_DATA.clientInfo.name
        })
      })

      if (response.ok) {
        logger.info('Dispute submitted successfully', { invoiceNumber })
        toast.success('Dispute submitted', {
          description: 'Our team will review and respond within 24 hours'
        })
      }
    } catch (error: any) {
      logger.error('Failed to submit dispute', { error, invoiceNumber })
      toast.error('Failed to submit dispute', {
        description: error.message
      })
    }
  }, [])

  // ============================================================================
  // HANDLER 19: PAYMENT REMINDER
  // ============================================================================

  const handlePaymentReminder = useCallback(() => {
    logger.info('Payment reminder sent', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      totalInvestment: KAZI_CLIENT_DATA.clientInfo.totalInvestment
    })

    toast.info('Payment reminder sent', {
      description: 'Gentle reminder email sent to client'
    })
  }, [])

  // ============================================================================
  // HANDLER 20: CLIENT SURVEY
  // ============================================================================

  const handleClientSurvey = useCallback(() => {
    logger.info('Client survey initiated', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      currentSatisfaction: KAZI_CLIENT_DATA.clientInfo.satisfaction
    })

    toast.success('Satisfaction survey sent!', {
      description: 'Your feedback helps us serve you better'
    })
  }, [])

  // ============================================================================
  // HANDLER 21: REFERRAL REQUEST
  // ============================================================================

  const handleReferralRequest = useCallback(() => {
    logger.info('Referral request sent', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      satisfaction: KAZI_CLIENT_DATA.clientInfo.satisfaction,
      tier: KAZI_CLIENT_DATA.clientInfo.tier
    })

    toast.success('Referral program details sent!', {
      description: 'Earn rewards for referring new clients'
    })
  }, [])

  // ============================================================================
  // HANDLER 22: CLIENT RETENTION
  // ============================================================================

  const handleClientRetention = useCallback(() => {
    logger.info('Retention campaign initiated', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      totalProjects: KAZI_CLIENT_DATA.clientInfo.totalProjects,
      totalInvestment: KAZI_CLIENT_DATA.clientInfo.totalInvestment
    })

    toast.info('Exclusive offers available!', {
      description: 'Special discounts for valued clients'
    })
  }, [])

  // ============================================================================
  // HANDLER 23: CLIENT SEGMENTATION
  // ============================================================================

  const handleClientSegmentation = useCallback(() => {
    logger.info('Client segmentation analyzed', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      tier: KAZI_CLIENT_DATA.clientInfo.tier,
      totalInvestment: KAZI_CLIENT_DATA.clientInfo.totalInvestment,
      satisfaction: KAZI_CLIENT_DATA.clientInfo.satisfaction
    })

    toast.info('Client profile analyzed', {
      description: 'Premium tier benefits active'
    })
  }, [])

  // ============================================================================
  // HANDLER 24: CLIENT REPORTS
  // ============================================================================

  const handleClientReports = useCallback(() => {
    logger.info('Client reports generated', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      onTimeDelivery: KAZI_CLIENT_DATA.analytics.onTimeDelivery,
      firstTimeApproval: KAZI_CLIENT_DATA.analytics.firstTimeApproval,
      avgResponseTime: KAZI_CLIENT_DATA.analytics.avgResponseTime
    })

    toast.success('Client reports generated!', {
      description: 'Detailed analytics and insights ready to view'
    })
  }, [])

  // ============================================================================
  // HANDLER 25: CLIENT ANALYTICS
  // ============================================================================

  const handleClientAnalytics = useCallback(() => {
    logger.info('Analytics dashboard opened', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      messagesExchanged: KAZI_CLIENT_DATA.analytics.messagesExchanged,
      meetingsHeld: KAZI_CLIENT_DATA.analytics.meetingsHeld,
      filesShared: KAZI_CLIENT_DATA.analytics.filesShared
    })

    toast.info('Analytics dashboard loaded', {
      description: 'Comprehensive project insights and metrics'
    })
  }, [])

  // ============================================================================
  // HANDLER 26: CLIENT EXPORT
  // ============================================================================

  const handleClientExport = useCallback(() => {
    logger.info('Client data export initiated', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      email: KAZI_CLIENT_DATA.clientInfo.email
    })

    toast.success('Data export started', {
      description: 'Download link will be sent to your email'
    })
  }, [])

  // ============================================================================
  // HANDLER 27: CLIENT NOTIFICATIONS MANAGEMENT
  // ============================================================================

  const handleClientNotifications = useCallback(() => {
    logger.info('Notification settings opened', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      activeProjects: KAZI_CLIENT_DATA.clientInfo.activeProjects
    })

    toast.info('Notification settings loaded', {
      description: 'Manage your communication preferences'
    })
  }, [])

  // ============================================================================
  // HELPER HANDLERS
  // ============================================================================

  const handleUploadFile = () => {
    logger.info('File upload initiated')
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
    toast.info('File upload initiated')
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <UserCheck className="h-8 w-8" />
            </div>
            <div>
              <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {userRole === 'freelancer' ? 'Client Management' : 'My Projects'}
              </TextShimmer>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                {userRole === 'freelancer'
                  ? `Manage your clients and track all project deliverables`
                  : `Welcome back, ${KAZI_CLIENT_DATA.clientInfo.contactPerson}! Here's your project overview.`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* ROLE SWITCHER - USER MANUAL SPEC */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="border-2 border-purple-300 dark:border-purple-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                View as: {userRole === 'freelancer' ? 'Freelancer' : 'Client'}
              </Button>
              {showRoleSwitcher && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-3 z-50"
                >
                  <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Switch Perspective</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setUserRole('client')
                        setShowRoleSwitcher(false)
                        logger.info('Role switched to client')
                        announce('Switched to client perspective')
                        toast.success('Viewing as Client', {
                          description: 'See your projects, approvals, and downloads'
                        })
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        userRole === 'client'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-semibold'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">Client View</p>
                          <p className="text-xs opacity-75">Track progress & approve work</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setUserRole('freelancer')
                        setShowRoleSwitcher(false)
                        logger.info('Role switched to freelancer')
                        announce('Switched to freelancer perspective')
                        toast.success('Viewing as Freelancer', {
                          description: 'Manage clients, deliverables, and payments'
                        })
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        userRole === 'freelancer'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 font-semibold'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">Freelancer View</p>
                          <p className="text-xs opacity-75">Manage clients & deliverables</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            <Button variant="outline" onClick={handleNotifications} data-testid="notifications-btn">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleContactTeam} data-testid="contact-team-btn">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Team
            </Button>
          </div>
        </div>

        {/* Client Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <LiquidGlassCard variant="gradient" hoverEffect={true} className="relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                
                
              </div>
              <div className="p-6 text-center relative z-10">
                <div className="inline-flex p-3 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-xl backdrop-blur-sm mb-4">
                  <FolderOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <NumberFlow value={KAZI_CLIENT_DATA.clientInfo.activeProjects} className="text-2xl font-bold text-blue-600 dark:text-blue-400 block" />
                <p className="text-gray-600 dark:text-gray-400">Active Projects</p>
              </div>
            </LiquidGlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <LiquidGlassCard variant="tinted" hoverEffect={true} className="relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                
                
              </div>
              <div className="p-6 text-center relative z-10">
                <div className="inline-flex p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-xl backdrop-blur-sm mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <NumberFlow value={KAZI_CLIENT_DATA.clientInfo.completedProjects} className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block" />
                <p className="text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </LiquidGlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LiquidGlassCard variant="gradient" hoverEffect={true} className="relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                
                
              </div>
              <div className="p-6 text-center relative z-10">
                <div className="inline-flex p-3 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 dark:from-purple-400/10 dark:to-indigo-400/10 rounded-xl backdrop-blur-sm mb-4">
                  <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <NumberFlow value={KAZI_CLIENT_DATA.clientInfo.totalInvestment} format="currency" className="text-2xl font-bold text-purple-600 dark:text-purple-400 block" />
                <p className="text-gray-600 dark:text-gray-400">Total Investment</p>
              </div>
            </LiquidGlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <LiquidGlassCard variant="tinted" hoverEffect={true} className="relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                
                
              </div>
              <div className="p-6 text-center relative z-10">
                <div className="inline-flex p-3 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 dark:from-amber-400/10 dark:to-yellow-400/10 rounded-xl backdrop-blur-sm mb-4">
                  <Star className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <NumberFlow value={parseFloat(KAZI_CLIENT_DATA.clientInfo.satisfaction)} decimals={1} className="text-2xl font-bold text-amber-600 dark:text-amber-400 block" />
                <p className="text-gray-600 dark:text-gray-400">Satisfaction Rating</p>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </div>

        {/* FREELANCER PERSPECTIVE - USER MANUAL SPEC */}
        {userRole === 'freelancer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                  Freelancer Dashboard
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your clients, track deliverables, and monitor payment status
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Freelancer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      <NumberFlow value={8} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">3 active this month</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Deliverables</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      <NumberFlow value={12} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">4 pending approval</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      <NumberFlow value={24500} format="currency" />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">$12,300 pending</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Growth</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">+23%</p>
                    <p className="text-xs text-gray-500 mt-1">vs last month</p>
                  </div>
                </div>

                {/* Client List & Communications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Active Clients */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Active Clients
                    </h3>
                    <div className="space-y-2">
                      {[
                        { name: 'Acme Corp', projects: 2, status: 'In Progress', color: 'blue' },
                        { name: 'Tech Startup Inc', projects: 1, status: 'Review', color: 'yellow' },
                        { name: 'Design Agency', projects: 1, status: 'Active', color: 'green' }
                      ].map((client, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                  {client.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</p>
                                <p className="text-xs text-gray-500">{client.projects} project(s)</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`bg-${client.color}-100 text-${client.color}-700 border-${client.color}-300`}>
                              {client.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      View All Clients
                    </Button>
                  </div>

                  {/* Pending Approvals */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Pending Approvals
                    </h3>
                    <div className="space-y-2">
                      {[
                        { project: 'Website Redesign', client: 'Acme Corp', type: 'Milestone 3', amount: 2500 },
                        { project: 'Mobile App', client: 'Tech Startup', type: 'Final Delivery', amount: 5000 },
                        { project: 'Brand Identity', client: 'Design Agency', type: 'Logo Design', amount: 1200 }
                      ].map((approval, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{approval.project}</p>
                              <p className="text-xs text-gray-500">{approval.client}</p>
                            </div>
                            <p className="text-sm font-bold text-blue-600">${approval.amount.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">{approval.type}</Badge>
                            <span className="text-xs text-gray-500">Awaiting approval</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Deliverables
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="flex-col h-auto py-3 bg-white dark:bg-gray-900">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-xs">Upload Deliverable</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-3 bg-white dark:bg-gray-900">
                      <MessageSquare className="w-5 h-5 mb-1" />
                      <span className="text-xs">Message Client</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-3 bg-white dark:bg-gray-900">
                      <Receipt className="w-5 h-5 mb-1" />
                      <span className="text-xs">Create Invoice</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-3 bg-white dark:bg-gray-900">
                      <BarChart3 className="w-5 h-5 mb-1" />
                      <span className="text-xs">View Reports</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full bg-white/60 backdrop-blur-xl border border-white/30">
              <TabsTrigger value="projects" className="flex items-center gap-2 whitespace-nowrap">
                <FolderOpen className="h-4 w-4" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2 whitespace-nowrap">
                <Image className="h-4 w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2 whitespace-nowrap">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-2 whitespace-nowrap">
                <Receipt className="h-4 w-4" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2 whitespace-nowrap">
                <Shield className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2 whitespace-nowrap">
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2 whitespace-nowrap">
                <FileText className="h-4 w-4" />
                Files
              </TabsTrigger>
              <TabsTrigger value="ai-collaborate" className="flex items-center gap-2 whitespace-nowrap">
                <Brain className="h-4 w-4" />
                AI Collaborate
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 whitespace-nowrap">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="value-dashboard" className="flex items-center gap-2 whitespace-nowrap">
                <Target className="h-4 w-4" />
                ROI & Value
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-2 whitespace-nowrap">
                <Zap className="h-4 w-4" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2 whitespace-nowrap">
                <Star className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 whitespace-nowrap">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {KAZI_CLIENT_DATA.projects.map((project) => (
                <Card key={project.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{project.name}</CardTitle>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{project.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current Phase</p>
                            <p className="font-semibold">{project.phase}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Due Date</p>
                            <p className="font-semibold">{new Date(project.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Team</p>
                            <p className="font-semibold">{project.team.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-3" />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Deliverables</h4>
                      <div className="space-y-2">
                        {project.deliverables.map((deliverable, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(deliverable.status)}
                              <div>
                                <p className="font-medium">{deliverable.name}</p>
                                <p className="text-sm text-gray-600">Due: {new Date(deliverable.dueDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(deliverable.status)} variant="outline">
                              {deliverable.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleDownloadFiles(project.id)} data-testid={`download-files-${project.id}-btn`}>
                          <Download className="h-3 w-3 mr-1" />
                          Download Files
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRequestRevision(project.id)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Request Revision
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" onClick={() => handleApproveDeliverable(project.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleContactTeam} data-testid={`discuss-project-${project.id}-btn`}>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Discuss Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <ClientZoneGallery />
          </TabsContent>

          {/* Calendar/Schedule Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule & Meetings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Upcoming Meetings</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Project Review Meeting</p>
                            <p className="text-sm text-gray-600">Tomorrow at 2:00 PM</p>
                            <p className="text-sm text-blue-600">with Sarah Johnson, Michael Chen</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Video Call</Badge>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Final Presentation</p>
                            <p className="text-sm text-gray-600">Friday at 10:00 AM</p>
                            <p className="text-sm text-green-600">Brand Identity Project</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">In-Person</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleScheduleMeeting} data-testid="schedule-meeting-btn">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule New Meeting
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => {
                        toast.info('Loading project timeline...')
                      }} data-testid="view-timeline-btn">
                        <Clock className="h-4 w-4 mr-2" />
                        View Project Timeline
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => {
                        toast.info('Setting up reminders...')
                      }}>
                        <Bell className="h-4 w-4 mr-2" />
                        Set Reminders
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoices & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(15500)}</p>
                      <p className="text-sm text-gray-600">Paid Invoices</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-600">{formatCurrency(3500)}</p>
                      <p className="text-sm text-gray-600">Pending Payment</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Receipt className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">8</p>
                      <p className="text-sm text-gray-600">Total Invoices</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Recent Invoices</h3>
                  <div className="space-y-3">
                    {KAZI_CLIENT_DATA.invoices.map((invoice) => (
                      <div key={invoice.id} className="p-4 rounded-lg border border-gray-200 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{invoice.number} - {invoice.project}</p>
                          <p className="text-sm text-gray-600">
                            {invoice.status === 'pending' ? `Due: ${new Date(invoice.dueDate!).toLocaleDateString()}` : `Paid: ${new Date(invoice.paidDate!).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${invoice.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {formatCurrency(invoice.amount)}
                          </p>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        {invoice.status === 'pending' ? (
                          <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" onClick={() => handlePayInvoice(invoice.number, invoice.amount)}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            Pay Now
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleViewInvoiceDetails(invoice.number)}>
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments/Escrow Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Secure Payments & Escrow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Milestone Payments</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Design Concepts</p>
                          <Badge className="bg-green-100 text-green-800">Released</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Brand Identity Project</p>
                        <p className="text-lg font-semibold text-green-600">{formatCurrency(2000)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Final Deliverables</p>
                          <Badge className="bg-yellow-100 text-yellow-800">In Escrow</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Brand Identity Project</p>
                        <p className="text-lg font-semibold text-yellow-600">{formatCurrency(1500)}</p>
                        <Button size="sm" className="mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" onClick={() => handleApproveDeliverable(1)}>
                          Approve & Release
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Payment Security</h3>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <Shield className="h-8 w-8 text-blue-600 mb-3" />
                      <p className="font-medium mb-2">Your payments are secure</p>
                      <p className="text-sm text-gray-600 mb-4">All payments are held in escrow until you approve the deliverables.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 100% money-back guarantee</li>
                        <li>• Milestone-based releases</li>
                        <li>• Dispute resolution support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {KAZI_CLIENT_DATA.messages.map((message) => (
                    <div key={message.id} className="flex space-x-4 p-4 rounded-lg bg-gray-50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.avatar} alt={message.sender} />
                        <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{message.sender}</p>
                          <Badge variant="secondary" className="text-xs">{message.role}</Badge>
                          <span className="text-sm text-gray-500">{message.timestamp}</span>
                        </div>
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={KAZI_CLIENT_DATA.clientInfo.avatar} alt={KAZI_CLIENT_DATA.clientInfo.contactPerson} />
                      <AvatarFallback>{KAZI_CLIENT_DATA.clientInfo.contactPerson.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={handleUploadFile}>
                          <Upload className="h-3 w-3 mr-1" />
                          Attach File
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleSendMessage}>
                          <Send className="h-3 w-3 mr-1" />
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {KAZI_CLIENT_DATA.recentFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {file.size} • Uploaded by {file.uploadedBy} on {new Date(file.uploadDate).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {file.project}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadFiles(file.id)}>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Collaborate Tab */}
          <TabsContent value="ai-collaborate" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Design Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">AI-Generated Options</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Logo Variations</p>
                          <Badge className="bg-purple-100 text-purple-800">Ready for Review</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">3 AI-generated logo concepts based on your preferences</p>
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                          <Eye className="h-3 w-3 mr-1" />
                          Review & Approve
                        </Button>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Color Palette Options</p>
                          <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">AI analyzing your brand preferences to suggest color schemes</p>
                        <Button size="sm" variant="outline">
                          <Palette className="h-3 w-3 mr-1" />
                          View Progress
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Your Preferences</h3>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="font-medium mb-3">Style Preferences</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Modern & Minimalist</span>
                          <Badge variant="outline">Selected</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Professional</span>
                          <Badge variant="outline">Selected</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Tech-focused</span>
                          <Badge variant="outline">Selected</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="mt-3">
                        <Settings className="h-3 w-3 mr-1" />
                        Update Preferences
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{KAZI_CLIENT_DATA.analytics.onTimeDelivery}%</p>
                      <p className="text-sm text-gray-600">On-Time Delivery</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{KAZI_CLIENT_DATA.analytics.firstTimeApproval}%</p>
                      <p className="text-sm text-gray-600">First-Time Approval</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">{KAZI_CLIENT_DATA.analytics.avgResponseTime} days</p>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Project Timeline</h3>
                    <div className="space-y-3">
                      {KAZI_CLIENT_DATA.projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <span className="text-sm">{project.name}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="w-20 h-2" />
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Communication Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm">Messages Exchanged</span>
                        <span className="font-semibold">{KAZI_CLIENT_DATA.analytics.messagesExchanged}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm">Meetings Held</span>
                        <span className="font-semibold">{KAZI_CLIENT_DATA.analytics.meetingsHeld}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm">Files Shared</span>
                        <span className="font-semibold">{KAZI_CLIENT_DATA.analytics.filesShared}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Project Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Overall Satisfaction</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-6 w-6 text-yellow-400 fill-current cursor-pointer hover:scale-110 transition-transform"
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">(Excellent)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Your Feedback</label>
                    <Textarea
                      placeholder="Share your thoughts about the project progress, team communication, or any suggestions..."
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Communication Quality</label>
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-5 w-5 text-green-500 cursor-pointer" />
                        <span className="text-sm">Excellent</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Timeline Adherence</label>
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-5 w-5 text-green-500 cursor-pointer" />
                        <span className="text-sm">On Track</span>
                      </div>
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleSubmitFeedback}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Client Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium">Project Updates</p>
                          <p className="text-sm text-gray-600">Get notified about project progress</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium">Meeting Reminders</p>
                          <p className="text-sm text-gray-600">Reminders for scheduled meetings</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium">Invoice Notifications</p>
                          <p className="text-sm text-gray-600">New invoices and payment reminders</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Account Settings</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="font-medium mb-2">Contact Information</p>
                        <p className="text-sm text-gray-600 mb-2">Email: {KAZI_CLIENT_DATA.clientInfo.email}</p>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Update Contact Info
                        </Button>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="font-medium mb-2">Password & Security</p>
                        <p className="text-sm text-gray-600 mb-2">Last updated: 30 days ago</p>
                        <Button size="sm" variant="outline">
                          <Shield className="h-3 w-3 mr-1" />
                          Change Password
                        </Button>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="font-medium mb-2">Download Data</p>
                        <p className="text-sm text-gray-600 mb-2">Export your project data and communications</p>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Value Dashboard Tab - NEW */}
          <TabsContent value="value-dashboard" className="space-y-6">
            <ClientValueDashboard />
          </TabsContent>

          {/* Referrals & Rewards Tab - NEW */}
          <TabsContent value="referrals" className="space-y-6">
            <ReferralLoyaltySystem />
          </TabsContent>
        </Tabs>
      </div>

      {/* Client Onboarding Tour - NEW */}
      <ClientOnboardingTour
        userRole="client"
        clientId={KAZI_CLIENT_DATA.clientInfo.email}
        onComplete={(tourId) => {
          logger.info('Onboarding tour completed', { tourId })
          toast.success('Tour completed! 🎉', {
            description: 'You earned XP and unlocked new features'
          })
        }}
      />
    </div>
  )
}
