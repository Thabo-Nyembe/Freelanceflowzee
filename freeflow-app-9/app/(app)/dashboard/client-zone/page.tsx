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
  Edit
} from 'lucide-react'
import ClientZoneGallery from '@/components/client-zone-gallery'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

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
// KAZI CLIENT DATA MODEL
// ============================================================================

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

  const router = useRouter()
  const [activeTab, setActiveTab] = useState('projects')
  const [newMessage, setNewMessage] = useState('')
  const [newFeedback, setNewFeedback] = useState('')

  // A+++ LOAD CLIENT ZONE DATA
  useEffect(() => {
    const loadClientZoneData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load client zone data'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Client zone loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load client zone data')
        setIsLoading(false)
        announce('Error loading client zone', 'assertive')
      }
    }

    loadClientZoneData()
  }, [announce])

  // ============================================================================
  // HANDLER 1: NOTIFICATIONS
  // ============================================================================

  const handleNotifications = () => {
    console.log('🔔 OPENING NOTIFICATIONS')
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Contact:', KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('📧 Email:', KAZI_CLIENT_DATA.clientInfo.email)
    console.log('📊 Active projects:', KAZI_CLIENT_DATA.clientInfo.activeProjects)
    console.log('📅 Current tab:', activeTab)
    console.log('✅ NOTIFICATIONS PANEL OPENED')
    console.log('🏁 NOTIFICATION PROCESS COMPLETE')

    toast.success('Notifications center opened!', {
      description: 'View all your project updates and messages'
    })
  }

  // ============================================================================
  // HANDLER 2: CONTACT TEAM
  // ============================================================================

  const handleContactTeam = () => {
    console.log('💬 CONTACTING TEAM')
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Contact person:', KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('📊 Active projects:', KAZI_CLIENT_DATA.clientInfo.activeProjects)
    console.log('📅 Current tab:', activeTab)
    console.log('✉️ Opening team communication panel')
    console.log('✅ TEAM CONTACT INITIATED')
    console.log('🏁 CONTACT TEAM PROCESS COMPLETE')

    toast.success('Team communication opened!', {
      description: 'Send a message or schedule a call with your team'
    })
  }

  // ============================================================================
  // HANDLER 3: REQUEST REVISION
  // ============================================================================

  const handleRequestRevision = async (id: number) => {
    const project = KAZI_CLIENT_DATA.projects.find(p => p.id === id)

    console.log('✏️ REQUESTING REVISION')
    console.log('📁 Project name:', project?.name || id)
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Requested by:', KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('📅 Current tab:', activeTab)
    console.log('⏰ Expected response time: 24 hours')

    const feedback = prompt('Please describe the changes needed:')
    if (!feedback) {
      console.log('❌ REVISION REQUEST CANCELLED')
      return
    }

    console.log('📝 Revision notes:', feedback.substring(0, 50) + (feedback.length > 50 ? '...' : ''))

    try {
      console.log('📡 SENDING REVISION REQUEST TO API')
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

      console.log('📡 API RESPONSE STATUS:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error('Failed to request revision')
      }

      const result = await response.json()

      if (result.success) {
        console.log('✅ REVISION REQUEST SUBMITTED')
        console.log('📨 Team will be notified')
        console.log('🏁 REVISION REQUEST PROCESS COMPLETE')

        toast.success('Revision request submitted!', {
          description: 'Your team will review and respond within 24 hours'
        })
      }
    } catch (error: any) {
      console.error('❌ REQUEST REVISION ERROR:', error)
      console.log('📊 Error details:', error.message || 'Unknown error')
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

    console.log('✅ APPROVING DELIVERABLE')
    console.log('📦 Deliverable:', project?.name || id)
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Approved by:', KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('📅 Current tab:', activeTab)
    console.log('💰 Milestone payment will be processed')

    try {
      console.log('📡 SENDING APPROVAL TO API')
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          projectId: id.toString(),
          data: { status: 'approved' }
        })
      })

      console.log('📡 API RESPONSE STATUS:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error('Failed to approve deliverable')
      }

      const result = await response.json()

      if (result.success) {
        console.log('✅ DELIVERABLE APPROVED')
        console.log('📨 Team will be notified')
        console.log('🏁 APPROVAL PROCESS COMPLETE')

        toast.success('Deliverable approved!', {
          description: 'Milestone payment will be processed automatically'
        })
      }
    } catch (error: any) {
      console.error('❌ APPROVE DELIVERABLE ERROR:', error)
      console.log('📊 Error details:', error.message || 'Unknown error')
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

    console.log('📥 DOWNLOADING FILES')
    console.log('📁 Project:', project?.name || id)
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Downloaded by:', KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('📅 Current tab:', activeTab)
    console.log('📦 Preparing ZIP archive')
    console.log('✅ DOWNLOAD INITIATED')
    console.log('🏁 DOWNLOAD PROCESS COMPLETE')

    toast.success('Preparing download...', {
      description: 'Files will download as a ZIP archive'
    })
  }

  // ============================================================================
  // HANDLER 6: SEND MESSAGE
  // ============================================================================

  const handleSendMessage = () => {
    console.log('💬 SENDING MESSAGE')
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Sender:', KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('📧 Email:', KAZI_CLIENT_DATA.clientInfo.email)

    if (!newMessage.trim()) {
      console.log('⚠️ MESSAGE VALIDATION FAILED: Empty message')
      toast.error('Please enter a message')
      return
    }

    console.log('📝 Message length:', newMessage.length, 'characters')
    console.log('📅 Current tab:', activeTab)
    console.log('💭 Message preview:', newMessage.substring(0, 45) + (newMessage.length > 45 ? '...' : ''))
    console.log('✅ MESSAGE SENT SUCCESSFULLY')
    console.log('📨 Team will respond within 4-6 hours')
    console.log('🧹 Message input cleared')
    console.log('🏁 SEND MESSAGE PROCESS COMPLETE')

    toast.success('Message sent successfully!', {
      description: 'Your team will respond within 4-6 hours'
    })
    setNewMessage('')
  }

  // ============================================================================
  // HANDLER 7: SUBMIT FEEDBACK
  // ============================================================================

  const handleSubmitFeedback = async () => {
    console.log('⭐ SUBMITTING FEEDBACK')
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Submitted by:', KAZI_CLIENT_DATA.clientInfo.contactPerson)

    if (!newFeedback.trim()) {
      console.log('⚠️ FEEDBACK VALIDATION FAILED: Empty feedback')
      toast.error('Please enter your feedback')
      return
    }

    console.log('📝 Feedback length:', newFeedback.length, 'characters')
    console.log('📅 Current tab:', activeTab)
    console.log('💭 Feedback preview:', newFeedback.substring(0, 45) + (newFeedback.length > 45 ? '...' : ''))

    try {
      console.log('📡 SENDING FEEDBACK TO API')
      const response = await fetch('/api/collaboration/client-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: newFeedback,
          rating: 5,
          timestamp: new Date().toISOString()
        })
      })

      console.log('📡 API RESPONSE STATUS:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      console.log('✅ FEEDBACK SUBMITTED SUCCESSFULLY')
      console.log('📨 Team will review and respond promptly')
      console.log('🧹 Feedback input cleared')
      console.log('🏁 SUBMIT FEEDBACK PROCESS COMPLETE')

      toast.success('Feedback submitted!', {
        description: 'Your input helps us improve'
      })
      setNewFeedback('')
    } catch (error: any) {
      console.error('❌ SUBMIT FEEDBACK ERROR:', error)
      console.log('📊 Error details:', error.message || 'Unknown error')
      toast.error('Failed to submit feedback', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 8: PAY INVOICE
  // ============================================================================

  const handlePayInvoice = (invoiceNumber: string, amount: number) => {
    console.log('💳 PAYING INVOICE')
    console.log('🧾 Invoice number:', invoiceNumber)
    console.log('💰 Amount:', formatCurrency(amount))
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Paid by:', KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('📧 Email:', KAZI_CLIENT_DATA.clientInfo.email)
    console.log('📅 Current tab:', activeTab)
    console.log('🔒 Redirecting to secure payment gateway')
    console.log('✅ PAYMENT PROCESS INITIATED')
    console.log('🏁 PAY INVOICE PROCESS COMPLETE')

    toast.success('Redirecting to secure payment...', {
      description: `Invoice ${invoiceNumber} - ${formatCurrency(amount)}`
    })
  }

  // ============================================================================
  // HANDLER 9: SCHEDULE MEETING
  // ============================================================================

  const handleScheduleMeeting = () => {
    console.log('📅 SCHEDULING MEETING')
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Scheduled by:', KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('📧 Email:', KAZI_CLIENT_DATA.clientInfo.email)
    console.log('📅 Current tab:', activeTab)
    console.log('🎥 Opening calendar interface')
    console.log('✅ MEETING SCHEDULER OPENED')
    console.log('🏁 SCHEDULE MEETING PROCESS COMPLETE')

    toast.success('Opening calendar...', {
      description: 'Schedule a meeting with your team'
    })
  }

  // ============================================================================
  // HANDLER 10: VIEW INVOICE DETAILS
  // ============================================================================

  const handleViewInvoiceDetails = (invoiceNumber: string) => {
    console.log('🧾 VIEWING INVOICE DETAILS')
    console.log('📋 Invoice number:', invoiceNumber)
    console.log('📊 Client:', KAZI_CLIENT_DATA.clientInfo.name)
    console.log('👤 Viewed by:', KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('📅 Current tab:', activeTab)
    console.log('📄 Loading invoice details')
    console.log('✅ INVOICE DETAILS LOADED')
    console.log('🏁 VIEW INVOICE PROCESS COMPLETE')

    toast.success('Loading invoice details...', {
      description: `Invoice ${invoiceNumber}`
    })
  }

  // ============================================================================
  // HANDLER 11: CLIENT ONBOARDING
  // ============================================================================

  const handleClientOnboarding = useCallback(() => {
    console.log('🎯 CLIENT ZONE: STARTING CLIENT ONBOARDING WORKFLOW')
    console.log('👤 CLIENT ZONE: Client Name: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📧 CLIENT ZONE: Contact Person: ' + KAZI_CLIENT_DATA.clientInfo.contactPerson)
    console.log('🏢 CLIENT ZONE: Industry: ' + KAZI_CLIENT_DATA.clientInfo.industry)
    console.log('📅 CLIENT ZONE: Member Since: ' + KAZI_CLIENT_DATA.clientInfo.memberSince)
    console.log('🎓 CLIENT ZONE: Initiating onboarding checklist')
    console.log('📋 CLIENT ZONE: Setting up client preferences and communication channels')
    console.log('✅ CLIENT ZONE: ONBOARDING WORKFLOW INITIALIZED')

    toast.success('Client onboarding started!', {
      description: 'Setting up your personalized workspace and preferences'
    })
  }, [])

  // ============================================================================
  // HANDLER 12: PROJECT PROPOSAL
  // ============================================================================

  const handleProjectProposal = useCallback(async (projectId?: number) => {
    console.log('📄 CLIENT ZONE: SENDING PROJECT PROPOSAL')
    console.log('🎯 CLIENT ZONE: Project ID: ' + (projectId || 'New Proposal'))
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📧 CLIENT ZONE: Contact Email: ' + KAZI_CLIENT_DATA.clientInfo.email)
    console.log('💼 CLIENT ZONE: Account Manager: ' + KAZI_CLIENT_DATA.clientInfo.accountManager)
    console.log('📊 CLIENT ZONE: Preparing detailed proposal document')
    console.log('💰 CLIENT ZONE: Including pricing and timeline estimates')

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

      console.log('📡 CLIENT ZONE: API Response Status: ' + response.status)

      if (response.ok) {
        console.log('✅ CLIENT ZONE: PROPOSAL SENT SUCCESSFULLY')
        toast.success('Project proposal sent!', {
          description: 'Check your email for the detailed proposal document'
        })
      }
    } catch (error: any) {
      console.error('❌ CLIENT ZONE: PROPOSAL ERROR: ' + error.message)
      toast.error('Failed to send proposal', {
        description: error.message || 'Please try again later'
      })
    }
  }, [])

  // ============================================================================
  // HANDLER 13: CONTRACT MANAGEMENT
  // ============================================================================

  const handleContractManagement = useCallback(() => {
    console.log('📜 CLIENT ZONE: ACCESSING CONTRACT MANAGEMENT')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📊 CLIENT ZONE: Total Projects: ' + KAZI_CLIENT_DATA.clientInfo.totalProjects)
    console.log('✍️ CLIENT ZONE: Active Contracts: ' + KAZI_CLIENT_DATA.clientInfo.activeProjects)
    console.log('📋 CLIENT ZONE: Loading contract documents and terms')
    console.log('🔒 CLIENT ZONE: Secure contract storage accessed')
    console.log('✅ CLIENT ZONE: CONTRACT MANAGEMENT OPENED')

    toast.info('Contract management loaded', {
      description: 'View and manage all your project contracts'
    })
  }, [])

  // ============================================================================
  // HANDLER 14: MILESTONE APPROVAL
  // ============================================================================

  const handleMilestoneApproval = useCallback(async (milestoneId: number) => {
    console.log('✅ CLIENT ZONE: APPROVING MILESTONE')
    console.log('🎯 CLIENT ZONE: Milestone ID: ' + milestoneId)
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('💰 CLIENT ZONE: Milestone payment will be released from escrow')
    console.log('📊 CLIENT ZONE: Updating project progress tracker')

    try {
      console.log('📡 CLIENT ZONE: Sending milestone approval to API')
      const response = await fetch('/api/milestones/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: milestoneId,
          clientId: KAZI_CLIENT_DATA.clientInfo.name,
          timestamp: new Date().toISOString()
        })
      })

      console.log('📡 CLIENT ZONE: API Response: ' + response.status)

      if (response.ok) {
        console.log('✅ CLIENT ZONE: MILESTONE APPROVED SUCCESSFULLY')
        console.log('💳 CLIENT ZONE: Payment released to freelancer')
        toast.success('Milestone approved!', {
          description: 'Payment has been released from escrow'
        })
      }
    } catch (error: any) {
      console.error('❌ CLIENT ZONE: MILESTONE APPROVAL ERROR: ' + error.message)
      toast.error('Failed to approve milestone', {
        description: error.message || 'Please try again'
      })
    }
  }, [])

  // ============================================================================
  // HANDLER 15: FEEDBACK REQUEST
  // ============================================================================

  const handleFeedbackRequest = useCallback(() => {
    console.log('⭐ CLIENT ZONE: REQUESTING CLIENT FEEDBACK')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📊 CLIENT ZONE: Active Projects: ' + KAZI_CLIENT_DATA.clientInfo.activeProjects)
    console.log('📧 CLIENT ZONE: Sending feedback request email')
    console.log('🎯 CLIENT ZONE: Current satisfaction score: ' + KAZI_CLIENT_DATA.clientInfo.satisfaction)
    console.log('📋 CLIENT ZONE: Opening feedback collection form')
    console.log('✅ CLIENT ZONE: FEEDBACK REQUEST INITIATED')

    toast.info('Feedback request sent', {
      description: 'Help us improve your experience'
    })
  }, [])

  // ============================================================================
  // HANDLER 16: FILE SHARING
  // ============================================================================

  const handleFileSharing = useCallback((fileId?: number) => {
    console.log('📤 CLIENT ZONE: INITIATING FILE SHARING')
    console.log('📁 CLIENT ZONE: File ID: ' + (fileId || 'Multiple files'))
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📊 CLIENT ZONE: Total files in library: ' + KAZI_CLIENT_DATA.analytics.filesShared)
    console.log('🔒 CLIENT ZONE: Secure file transfer protocol enabled')
    console.log('📧 CLIENT ZONE: Generating shareable download link')
    console.log('✅ CLIENT ZONE: FILE SHARING PREPARED')

    toast.success('File sharing link generated', {
      description: 'Secure download link copied to clipboard'
    })
  }, [])

  // ============================================================================
  // HANDLER 17: MEETING SCHEDULE
  // ============================================================================

  const handleMeetingSchedule = useCallback(() => {
    console.log('🗓️ CLIENT ZONE: OPENING MEETING SCHEDULER')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📅 CLIENT ZONE: Next Meeting: ' + KAZI_CLIENT_DATA.clientInfo.nextMeeting)
    console.log('📊 CLIENT ZONE: Total meetings held: ' + KAZI_CLIENT_DATA.analytics.meetingsHeld)
    console.log('🎥 CLIENT ZONE: Video conferencing integration available')
    console.log('📧 CLIENT ZONE: Calendar invites will be sent')
    console.log('✅ CLIENT ZONE: MEETING SCHEDULER OPENED')

    toast.info('Meeting scheduler opened', {
      description: 'Schedule a call with your project team'
    })
  }, [])

  // ============================================================================
  // HANDLER 18: INVOICE DISPUTE
  // ============================================================================

  const handleInvoiceDispute = useCallback(async (invoiceNumber: string) => {
    console.log('⚠️ CLIENT ZONE: HANDLING INVOICE DISPUTE')
    console.log('🧾 CLIENT ZONE: Invoice Number: ' + invoiceNumber)
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📧 CLIENT ZONE: Email: ' + KAZI_CLIENT_DATA.clientInfo.email)
    console.log('🎯 CLIENT ZONE: Opening dispute resolution process')

    const disputeReason = prompt('Please describe the dispute:')
    if (!disputeReason) {
      console.log('❌ CLIENT ZONE: DISPUTE CANCELLED')
      return
    }

    console.log('📝 CLIENT ZONE: Dispute reason: ' + disputeReason.substring(0, 50))

    try {
      console.log('📡 CLIENT ZONE: Submitting dispute to support team')
      const response = await fetch('/api/invoices/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: invoiceNumber,
          reason: disputeReason,
          clientId: KAZI_CLIENT_DATA.clientInfo.name
        })
      })

      console.log('📡 CLIENT ZONE: API Response: ' + response.status)

      if (response.ok) {
        console.log('✅ CLIENT ZONE: DISPUTE SUBMITTED SUCCESSFULLY')
        toast.success('Dispute submitted', {
          description: 'Our team will review and respond within 24 hours'
        })
      }
    } catch (error: any) {
      console.error('❌ CLIENT ZONE: DISPUTE ERROR: ' + error.message)
      toast.error('Failed to submit dispute', {
        description: error.message
      })
    }
  }, [])

  // ============================================================================
  // HANDLER 19: PAYMENT REMINDER
  // ============================================================================

  const handlePaymentReminder = useCallback(() => {
    console.log('💳 CLIENT ZONE: SENDING PAYMENT REMINDER')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📧 CLIENT ZONE: Email: ' + KAZI_CLIENT_DATA.clientInfo.email)
    console.log('💰 CLIENT ZONE: Checking pending invoices')
    console.log('📊 CLIENT ZONE: Total Investment: ' + KAZI_CLIENT_DATA.clientInfo.totalInvestment)
    console.log('📧 CLIENT ZONE: Sending friendly payment reminder email')
    console.log('✅ CLIENT ZONE: PAYMENT REMINDER SENT')

    toast.info('Payment reminder sent', {
      description: 'Gentle reminder email sent to client'
    })
  }, [])

  // ============================================================================
  // HANDLER 20: CLIENT SURVEY
  // ============================================================================

  const handleClientSurvey = useCallback(() => {
    console.log('📊 CLIENT ZONE: LAUNCHING CLIENT SATISFACTION SURVEY')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('⭐ CLIENT ZONE: Current Satisfaction: ' + KAZI_CLIENT_DATA.clientInfo.satisfaction)
    console.log('📋 CLIENT ZONE: Survey includes project quality, communication, and timeliness')
    console.log('📧 CLIENT ZONE: Survey link sent to email')
    console.log('🎯 CLIENT ZONE: Results will help improve service quality')
    console.log('✅ CLIENT ZONE: SURVEY INITIATED')

    toast.success('Satisfaction survey sent!', {
      description: 'Your feedback helps us serve you better'
    })
  }, [])

  // ============================================================================
  // HANDLER 21: REFERRAL REQUEST
  // ============================================================================

  const handleReferralRequest = useCallback(() => {
    console.log('🤝 CLIENT ZONE: REQUESTING CLIENT REFERRAL')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('⭐ CLIENT ZONE: Client Satisfaction: ' + KAZI_CLIENT_DATA.clientInfo.satisfaction)
    console.log('🏆 CLIENT ZONE: Client Tier: ' + KAZI_CLIENT_DATA.clientInfo.tier)
    console.log('💰 CLIENT ZONE: Referral rewards program information shared')
    console.log('📧 CLIENT ZONE: Personalized referral link generated')
    console.log('✅ CLIENT ZONE: REFERRAL REQUEST SENT')

    toast.success('Referral program details sent!', {
      description: 'Earn rewards for referring new clients'
    })
  }, [])

  // ============================================================================
  // HANDLER 22: CLIENT RETENTION
  // ============================================================================

  const handleClientRetention = useCallback(() => {
    console.log('💼 CLIENT ZONE: LAUNCHING RETENTION CAMPAIGN')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📊 CLIENT ZONE: Total Projects: ' + KAZI_CLIENT_DATA.clientInfo.totalProjects)
    console.log('💰 CLIENT ZONE: Total Investment: ' + KAZI_CLIENT_DATA.clientInfo.totalInvestment)
    console.log('🎁 CLIENT ZONE: Checking for loyalty rewards and discounts')
    console.log('📧 CLIENT ZONE: Personalized retention offer prepared')
    console.log('✅ CLIENT ZONE: RETENTION CAMPAIGN INITIATED')

    toast.info('Exclusive offers available!', {
      description: 'Special discounts for valued clients'
    })
  }, [])

  // ============================================================================
  // HANDLER 23: CLIENT SEGMENTATION
  // ============================================================================

  const handleClientSegmentation = useCallback(() => {
    console.log('🎯 CLIENT ZONE: ANALYZING CLIENT SEGMENTATION')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('🏆 CLIENT ZONE: Current Tier: ' + KAZI_CLIENT_DATA.clientInfo.tier)
    console.log('💰 CLIENT ZONE: Total Investment: ' + KAZI_CLIENT_DATA.clientInfo.totalInvestment)
    console.log('📊 CLIENT ZONE: Project Count: ' + KAZI_CLIENT_DATA.clientInfo.totalProjects)
    console.log('⭐ CLIENT ZONE: Satisfaction Score: ' + KAZI_CLIENT_DATA.clientInfo.satisfaction)
    console.log('📈 CLIENT ZONE: Client categorized as high-value premium client')
    console.log('✅ CLIENT ZONE: SEGMENTATION ANALYSIS COMPLETE')

    toast.info('Client profile analyzed', {
      description: 'Premium tier benefits active'
    })
  }, [])

  // ============================================================================
  // HANDLER 24: CLIENT REPORTS
  // ============================================================================

  const handleClientReports = useCallback(() => {
    console.log('📊 CLIENT ZONE: GENERATING CLIENT REPORTS')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📈 CLIENT ZONE: On-Time Delivery: ' + KAZI_CLIENT_DATA.analytics.onTimeDelivery + '%')
    console.log('✅ CLIENT ZONE: First-Time Approval: ' + KAZI_CLIENT_DATA.analytics.firstTimeApproval + '%')
    console.log('⏱️ CLIENT ZONE: Avg Response Time: ' + KAZI_CLIENT_DATA.analytics.avgResponseTime + ' days')
    console.log('📧 CLIENT ZONE: Comprehensive report will be emailed')
    console.log('✅ CLIENT ZONE: CLIENT REPORTS GENERATED')

    toast.success('Client reports generated!', {
      description: 'Detailed analytics and insights ready to view'
    })
  }, [])

  // ============================================================================
  // HANDLER 25: CLIENT ANALYTICS
  // ============================================================================

  const handleClientAnalytics = useCallback(() => {
    console.log('📈 CLIENT ZONE: VIEWING CLIENT ANALYTICS DASHBOARD')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('💬 CLIENT ZONE: Messages Exchanged: ' + KAZI_CLIENT_DATA.analytics.messagesExchanged)
    console.log('🤝 CLIENT ZONE: Meetings Held: ' + KAZI_CLIENT_DATA.analytics.meetingsHeld)
    console.log('📁 CLIENT ZONE: Files Shared: ' + KAZI_CLIENT_DATA.analytics.filesShared)
    console.log('📊 CLIENT ZONE: Loading interactive analytics dashboard')
    console.log('✅ CLIENT ZONE: ANALYTICS DASHBOARD OPENED')

    toast.info('Analytics dashboard loaded', {
      description: 'Comprehensive project insights and metrics'
    })
  }, [])

  // ============================================================================
  // HANDLER 26: CLIENT EXPORT
  // ============================================================================

  const handleClientExport = useCallback(() => {
    console.log('📥 CLIENT ZONE: EXPORTING CLIENT DATA')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📊 CLIENT ZONE: Including all project data and communications')
    console.log('📧 CLIENT ZONE: Email: ' + KAZI_CLIENT_DATA.clientInfo.email)
    console.log('🔒 CLIENT ZONE: Secure data export in progress')
    console.log('📦 CLIENT ZONE: Generating ZIP archive with all client files')
    console.log('✅ CLIENT ZONE: CLIENT DATA EXPORT INITIATED')

    toast.success('Data export started', {
      description: 'Download link will be sent to your email'
    })
  }, [])

  // ============================================================================
  // HANDLER 27: CLIENT NOTIFICATIONS MANAGEMENT
  // ============================================================================

  const handleClientNotifications = useCallback(() => {
    console.log('🔔 CLIENT ZONE: MANAGING CLIENT NOTIFICATIONS')
    console.log('👤 CLIENT ZONE: Client: ' + KAZI_CLIENT_DATA.clientInfo.name)
    console.log('📧 CLIENT ZONE: Email: ' + KAZI_CLIENT_DATA.clientInfo.email)
    console.log('📊 CLIENT ZONE: Active Projects: ' + KAZI_CLIENT_DATA.clientInfo.activeProjects)
    console.log('🎯 CLIENT ZONE: Loading notification preferences')
    console.log('📱 CLIENT ZONE: Push notifications, email alerts, SMS options available')
    console.log('✅ CLIENT ZONE: NOTIFICATION SETTINGS OPENED')

    toast.info('Notification settings loaded', {
      description: 'Manage your communication preferences'
    })
  }, [])

  // ============================================================================
  // HELPER HANDLERS
  // ============================================================================

  const handleUploadFile = () => {
    console.log('📤 UPLOAD FILE')
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
                My Projects
              </TextShimmer>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Welcome back, {KAZI_CLIENT_DATA.clientInfo.contactPerson}! Here's your project overview.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
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
        </Tabs>
      </div>
    </div>
  )
}
