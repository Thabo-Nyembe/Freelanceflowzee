import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Clock,
  Eye,
  AlertCircle
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User role type for dual perspective functionality
 */
export type UserRole = 'freelancer' | 'client' | 'both'

/**
 * Project status type
 */
export type ProjectStatus = 'completed' | 'in-progress' | 'review' | 'pending'

/**
 * Invoice status type
 */
export type InvoiceStatus = 'paid' | 'pending'

/**
 * Deliverable status type
 */
export type DeliverableStatus = 'completed' | 'in-progress' | 'review' | 'pending'

/**
 * File type enum
 */
export type FileType = 'document' | 'archive' | 'image' | 'video'

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

/**
 * Client information interface
 */
export interface ClientInfo {
  name: string
  contactPerson: string
  email: string
  avatar: string
  phone: string
  company: string
  industry: string
  memberSince: string
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalInvestment: number
  satisfaction: number
  tier: string
  nextMeeting: string
  accountManager: string
}

/**
 * Project deliverable interface
 */
export interface Deliverable {
  name: string
  status: DeliverableStatus
  dueDate: string
}

/**
 * Project interface
 */
export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  progress: number
  dueDate: string
  budget: number
  spent: number
  team: string[]
  phase: string
  deliverables: Deliverable[]
  lastUpdate: string
}

/**
 * Message interface
 */
export interface Message {
  id: number
  sender: string
  role: string
  message: string
  timestamp: string
  avatar: string
  unread: boolean
}

/**
 * File interface
 */
export interface File {
  id: number
  name: string
  size: string
  uploadedBy: string
  uploadDate: string
  project: string
  type: FileType
}

/**
 * Invoice interface
 */
export interface Invoice {
  id: number
  number: string
  project: string
  amount: number
  dueDate?: string
  paidDate?: string
  status: InvoiceStatus
  items: string[]
}

/**
 * Analytics interface
 */
export interface Analytics {
  onTimeDelivery: number
  firstTimeApproval: number
  avgResponseTime: number
  messagesExchanged: number
  meetingsHeld: number
  filesShared: number
}

/**
 * Complete client data interface
 */
export interface ClientData {
  clientInfo: ClientInfo
  projects: Project[]
  messages: Message[]
  recentFiles: File[]
  invoices: Invoice[]
  analytics: Analytics
}

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * KAZI Client Data - Complete mock data for client zone functionality
 */
export const KAZI_CLIENT_DATA: ClientData = {
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

/**
 * Formats a number as currency in USD
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

/**
 * Returns the appropriate CSS classes for status badges based on status type
 * @param status - The status string (completed, in-progress, review, pending, paid)
 * @returns CSS class string for the status badge
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800'
    case 'review':
      return 'bg-yellow-100 text-yellow-800'
    case 'pending':
      return 'bg-gray-100 text-gray-800'
    case 'paid':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Returns the appropriate icon component for a given status
 * @param status - The status string (completed, in-progress, review, pending)
 * @returns React icon component for the status
 */
export const getStatusIcon = (status: string): ReactNode => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'in-progress':
      return <Clock className="h-4 w-4 text-blue-600" />
    case 'review':
      return <Eye className="h-4 w-4 text-yellow-600" />
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-gray-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

// ============================================================================
// FLOATING PARTICLE COMPONENT
// ============================================================================

/**
 * Props for FloatingParticle component
 */
export interface FloatingParticleProps {
  delay?: number
  color?: string
}

/**
 * FloatingParticle - Animated particle component for visual effects
 * @param delay - Animation delay in seconds (default: 0)
 * @param color - Particle color (default: 'blue')
 * @returns Animated particle component
 */
export const FloatingParticle = ({
  delay = 0,
  color = 'blue'
}: FloatingParticleProps) => {
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
