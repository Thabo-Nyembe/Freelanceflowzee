/**
 * Escrow & Secure Payment Utilities
 *
 * Comprehensive utilities for secure escrow payments, milestone tracking, and fund management.
 * Production-ready with real mock data and full TypeScript support.
 *
 * Features:
 * - Secure escrow deposit management
 * - Milestone-based payment releases
 * - Password-protected fund releases
 * - Dispute resolution system
 * - Multi-currency support
 * - Payment method integration
 * - Fee calculations
 * - Transaction history
 * - Contract management
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('EscrowUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EscrowStatus = 'pending' | 'active' | 'completed' | 'disputed' | 'released' | 'refunded' | 'cancelled'
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'disputed' | 'approved' | 'rejected'
export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer' | 'crypto' | 'wire_transfer' | 'credit_card'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF'
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'escalated' | 'closed'
export type TransactionType = 'deposit' | 'release' | 'refund' | 'fee' | 'chargeback' | 'adjustment'

export interface EscrowDeposit {
  id: string
  userId: string
  projectTitle: string
  projectDescription?: string
  clientName: string
  clientEmail: string
  clientId?: string
  amount: number
  currency: Currency
  status: EscrowStatus
  createdAt: Date
  updatedAt: Date
  releasedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  completionPassword: string
  progressPercentage: number
  milestones: EscrowMilestone[]
  contractUrl?: string
  contractSignedAt?: Date
  clientAvatar?: string
  fees: EscrowFees
  paymentMethod: PaymentMethod
  paymentId?: string
  disputeReason?: string
  disputeStatus?: DisputeStatus
  notes?: string
  metadata?: EscrowMetadata
}

export interface EscrowMilestone {
  id: string
  depositId: string
  title: string
  description: string
  amount: number
  percentage: number
  status: MilestoneStatus
  completedAt?: Date
  approvedAt?: Date
  rejectedAt?: Date
  dueDate?: Date
  startDate?: Date
  dependencies?: string[]
  deliverables: string[]
  attachments: MilestoneAttachment[]
  approvalNotes?: string
  rejectionReason?: string
}

export interface MilestoneAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
}

export interface EscrowFees {
  platform: number
  platformPercentage: number
  payment: number
  paymentPercentage: number
  withdrawal: number
  total: number
  currency: Currency
}

export interface EscrowMetadata {
  estimatedDuration?: number // in days
  actualDuration?: number
  totalEdits?: number
  totalDisputes?: number
  totalReleases?: number
  averageMilestoneTime?: number
  clientRating?: number
  freelancerRating?: number
  tags?: string[]
  category?: string
}

export interface EscrowDispute {
  id: string
  depositId: string
  milestoneId?: string
  raisedBy: 'client' | 'freelancer'
  raisedById: string
  raisedAt: Date
  status: DisputeStatus
  reason: string
  description: string
  evidence: DisputeEvidence[]
  resolution?: string
  resolvedAt?: Date
  resolvedBy?: string
  escalatedAt?: Date
  escalatedTo?: string
}

export interface DisputeEvidence {
  id: string
  type: 'file' | 'screenshot' | 'message' | 'contract' | 'other'
  url: string
  description: string
  uploadedAt: Date
}

export interface EscrowTransaction {
  id: string
  depositId: string
  type: TransactionType
  amount: number
  currency: Currency
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  createdAt: Date
  completedAt?: Date
  paymentMethod: PaymentMethod
  paymentId?: string
  description: string
  fromUserId?: string
  toUserId?: string
  fees: number
  netAmount: number
  metadata?: TransactionMetadata
}

export interface TransactionMetadata {
  processingTime?: number
  failureReason?: string
  retryCount?: number
  merchantId?: string
  merchantName?: string
  ipAddress?: string
  userAgent?: string
}

export interface EscrowContract {
  id: string
  depositId: string
  title: string
  content: string
  fileUrl?: string
  signedByClient: boolean
  signedByFreelancer: boolean
  clientSignedAt?: Date
  freelancerSignedAt?: Date
  createdAt: Date
  updatedAt: Date
  version: number
  terms: ContractTerm[]
}

export interface ContractTerm {
  id: string
  section: string
  title: string
  content: string
  required: boolean
  agreedByClient: boolean
  agreedByFreelancer: boolean
}

export interface ReleaseRequest {
  id: string
  depositId: string
  milestoneId?: string
  requestedBy: string
  requestedAt: Date
  approvedBy?: string
  approvedAt?: Date
  rejectedBy?: string
  rejectedAt?: Date
  rejectionReason?: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
}

export interface EscrowStatistics {
  totalDeposits: number
  totalValue: number
  totalReleased: number
  totalFees: number
  activeDeposits: number
  completedDeposits: number
  disputedDeposits: number
  averageProjectValue: number
  averageCompletionTime: number
  successRate: number
  disputeRate: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_ESCROW_DEPOSITS: EscrowDeposit[] = []

const MOCK_ESCROW_DEPOSITS_OLD = [
  {
    id: 'ESC-001',
    userId: 'USR-001',
    projectTitle: 'E-commerce Website Redesign',
    projectDescription: 'Complete redesign of e-commerce platform with modern UI/UX and improved checkout flow',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@techcorp.com',
    clientId: 'CLI-001',
    amount: 12000,
    currency: 'USD',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
    completionPassword: 'demo-password-2024',
    progressPercentage: 75,
    clientAvatar: '/avatars/sarah.jpg',
    paymentMethod: 'stripe',
    paymentId: 'pay_1234567890',
    contractUrl: '/contracts/esc-001.pdf',
    contractSignedAt: new Date('2024-01-15'),
    notes: 'Priority project for Q1 launch. Client prefers weekly updates.',
    fees: {
      platform: 360,
      platformPercentage: 3,
      payment: 240,
      paymentPercentage: 2,
      withdrawal: 50,
      total: 650,
      currency: 'USD'
    },
    milestones: [
      {
        id: 'MS-001',
        depositId: 'ESC-001',
        title: 'Design System & Wireframes',
        description: 'Create comprehensive design system, wireframes, and component library',
        amount: 3000,
        percentage: 25,
        status: 'completed',
        completedAt: new Date('2024-01-20'),
        approvedAt: new Date('2024-01-21'),
        dueDate: new Date('2024-01-25'),
        startDate: new Date('2024-01-16'),
        deliverables: [
          'Design system documentation',
          'Component library in Figma',
          'Wireframes for all pages',
          'Style guide PDF'
        ],
        attachments: [
          {
            id: 'ATT-001',
            name: 'design-system.pdf',
            url: '/attachments/design-system.pdf',
            size: 2456789,
            type: 'application/pdf',
            uploadedAt: new Date('2024-01-20')
          },
          {
            id: 'ATT-002',
            name: 'wireframes.fig',
            url: '/attachments/wireframes.fig',
            size: 5234567,
            type: 'application/figma',
            uploadedAt: new Date('2024-01-20')
          }
        ],
        approvalNotes: 'Excellent work! Design system is comprehensive and well-documented.'
      },
      {
        id: 'MS-002',
        depositId: 'ESC-001',
        title: 'Frontend Development',
        description: 'Build responsive frontend with React, Next.js, and Tailwind CSS',
        amount: 4500,
        percentage: 37.5,
        status: 'completed',
        completedAt: new Date('2024-02-01'),
        approvedAt: new Date('2024-02-02'),
        dueDate: new Date('2024-02-05'),
        startDate: new Date('2024-01-22'),
        dependencies: ['MS-001'],
        deliverables: [
          'All pages implemented',
          'Responsive design',
          'Component tests',
          'Performance optimization'
        ],
        attachments: [
          {
            id: 'ATT-003',
            name: 'frontend-code.zip',
            url: '/attachments/frontend-code.zip',
            size: 15234567,
            type: 'application/zip',
            uploadedAt: new Date('2024-02-01')
          }
        ],
        approvalNotes: 'Frontend looks great and performs well. Minor fixes applied.'
      },
      {
        id: 'MS-003',
        depositId: 'ESC-001',
        title: 'Backend Integration',
        description: 'API integration, database setup, and payment gateway integration',
        amount: 3000,
        percentage: 25,
        status: 'completed',
        completedAt: new Date('2024-02-10'),
        dueDate: new Date('2024-02-12'),
        startDate: new Date('2024-02-03'),
        dependencies: ['MS-002'],
        deliverables: [
          'REST API endpoints',
          'Database schema',
          'Stripe integration',
          'Admin dashboard'
        ],
        attachments: [],
        approvalNotes: 'Backend integration is solid. Payment processing works perfectly.'
      },
      {
        id: 'MS-004',
        depositId: 'ESC-001',
        title: 'Testing & Deployment',
        description: 'QA testing, bug fixes, and production deployment',
        amount: 1500,
        percentage: 12.5,
        status: 'pending',
        dueDate: new Date('2024-02-20'),
        startDate: new Date('2024-02-11'),
        dependencies: ['MS-003'],
        deliverables: [
          'Test coverage report',
          'Bug fixes',
          'Production deployment',
          'Documentation'
        ],
        attachments: []
      }
    ],
    metadata: {
      estimatedDuration: 45,
      totalEdits: 3,
      totalDisputes: 0,
      totalReleases: 3,
      averageMilestoneTime: 8,
      clientRating: 5,
      tags: ['e-commerce', 'web-development', 'react'],
      category: 'Web Development'
    }
  },
  {
    id: 'ESC-002',
    userId: 'USR-001',
    projectTitle: 'Mobile App UI/UX Design',
    projectDescription: 'iOS and Android app design with modern, minimalist approach',
    clientName: 'Tech Innovations Ltd',
    clientEmail: 'projects@techinnovations.com',
    clientId: 'CLI-002',
    amount: 8500,
    currency: 'USD',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-18'),
    completionPassword: 'APP2024!',
    progressPercentage: 60,
    clientAvatar: '/avatars/tech-innovations.jpg',
    paymentMethod: 'paypal',
    paymentId: 'PAYPAL-1234567890',
    contractUrl: '/contracts/esc-002.pdf',
    notes: 'iOS and Android app design. Client wants modern, minimalist approach.',
    fees: {
      platform: 255,
      platformPercentage: 3,
      payment: 170,
      paymentPercentage: 2,
      withdrawal: 50,
      total: 475,
      currency: 'USD'
    },
    milestones: [
      {
        id: 'MS-005',
        depositId: 'ESC-002',
        title: 'User Research & Analysis',
        description: 'Conduct user interviews, surveys, and competitive analysis',
        amount: 2000,
        percentage: 23.5,
        status: 'completed',
        completedAt: new Date('2024-02-05'),
        approvedAt: new Date('2024-02-06'),
        dueDate: new Date('2024-02-08'),
        deliverables: [
          'User research report',
          'Competitive analysis',
          'User personas',
          'Journey maps'
        ],
        attachments: [
          {
            id: 'ATT-004',
            name: 'user-research.pdf',
            url: '/attachments/user-research.pdf',
            size: 3456789,
            type: 'application/pdf',
            uploadedAt: new Date('2024-02-05')
          }
        ]
      },
      {
        id: 'MS-006',
        depositId: 'ESC-002',
        title: 'Wireframes & User Flow',
        description: 'Create detailed wireframes and user journey maps',
        amount: 2500,
        percentage: 29.4,
        status: 'completed',
        completedAt: new Date('2024-02-12'),
        approvedAt: new Date('2024-02-13'),
        dueDate: new Date('2024-02-15'),
        dependencies: ['MS-005'],
        deliverables: [
          'Low-fidelity wireframes',
          'User flow diagrams',
          'Information architecture',
          'Navigation structure'
        ],
        attachments: []
      },
      {
        id: 'MS-007',
        depositId: 'ESC-002',
        title: 'High-Fidelity Designs',
        description: 'Design pixel-perfect UI screens for iOS and Android',
        amount: 3000,
        percentage: 35.3,
        status: 'completed',
        completedAt: new Date('2024-02-18'),
        dueDate: new Date('2024-02-22'),
        dependencies: ['MS-006'],
        deliverables: [
          'iOS designs',
          'Android designs',
          'Icon set',
          'Design system'
        ],
        attachments: []
      },
      {
        id: 'MS-008',
        depositId: 'ESC-002',
        title: 'Interactive Prototype',
        description: 'Build clickable prototype for user testing',
        amount: 1000,
        percentage: 11.8,
        status: 'pending',
        dueDate: new Date('2024-02-28'),
        dependencies: ['MS-007'],
        deliverables: [
          'Interactive prototype',
          'Animation specs',
          'Handoff documentation',
          'Developer assets'
        ],
        attachments: []
      }
    ],
    metadata: {
      estimatedDuration: 30,
      totalEdits: 2,
      totalDisputes: 0,
      totalReleases: 3,
      averageMilestoneTime: 6,
      tags: ['mobile-app', 'ui-ux', 'ios', 'android'],
      category: 'UI/UX Design'
    }
  },
  {
    id: 'ESC-003',
    userId: 'USR-001',
    projectTitle: 'Brand Identity Package',
    projectDescription: 'Complete brand identity including logo, guidelines, and marketing materials',
    clientName: 'StartupXYZ',
    clientEmail: 'hello@startupxyz.com',
    clientId: 'CLI-003',
    amount: 5000,
    currency: 'USD',
    status: 'released',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-30'),
    releasedAt: new Date('2024-01-30'),
    completedAt: new Date('2024-01-30'),
    completionPassword: 'brand-2024',
    progressPercentage: 100,
    clientAvatar: '/avatars/startupxyz.jpg',
    paymentMethod: 'bank_transfer',
    paymentId: 'BANK-1234567890',
    contractUrl: '/contracts/esc-003.pdf',
    contractSignedAt: new Date('2024-01-01'),
    notes: 'Complete brand identity including logo, guidelines, and marketing materials.',
    fees: {
      platform: 150,
      platformPercentage: 3,
      payment: 50,
      paymentPercentage: 1,
      withdrawal: 50,
      total: 250,
      currency: 'USD'
    },
    milestones: [
      {
        id: 'MS-009',
        depositId: 'ESC-003',
        title: 'Logo Design',
        description: 'Create primary logo and variations',
        amount: 2000,
        percentage: 40,
        status: 'completed',
        completedAt: new Date('2024-01-10'),
        approvedAt: new Date('2024-01-11'),
        dueDate: new Date('2024-01-12'),
        deliverables: [
          'Primary logo',
          'Logo variations',
          'Color palette',
          'Typography'
        ],
        attachments: []
      },
      {
        id: 'MS-010',
        depositId: 'ESC-003',
        title: 'Brand Guidelines',
        description: 'Develop comprehensive brand style guide',
        amount: 1500,
        percentage: 30,
        status: 'completed',
        completedAt: new Date('2024-01-20'),
        approvedAt: new Date('2024-01-21'),
        dueDate: new Date('2024-01-22'),
        dependencies: ['MS-009'],
        deliverables: [
          'Brand guidelines PDF',
          'Usage examples',
          'Don\'ts and do\'s',
          'Asset library'
        ],
        attachments: []
      },
      {
        id: 'MS-011',
        depositId: 'ESC-003',
        title: 'Marketing Materials',
        description: 'Design business cards, letterhead, and templates',
        amount: 1500,
        percentage: 30,
        status: 'completed',
        completedAt: new Date('2024-01-28'),
        approvedAt: new Date('2024-01-29'),
        dueDate: new Date('2024-01-30'),
        dependencies: ['MS-010'],
        deliverables: [
          'Business cards',
          'Letterhead',
          'Email signature',
          'Social media templates'
        ],
        attachments: []
      }
    ],
    metadata: {
      estimatedDuration: 30,
      actualDuration: 29,
      totalEdits: 2,
      totalDisputes: 0,
      totalReleases: 3,
      averageMilestoneTime: 9,
      clientRating: 5,
      freelancerRating: 5,
      tags: ['branding', 'logo-design', 'marketing'],
      category: 'Branding'
    }
  },
  {
    id: 'ESC-004',
    userId: 'USR-001',
    projectTitle: 'Video Production Campaign',
    projectDescription: 'Multi-video campaign for social media marketing',
    clientName: 'Marketing Pro Agency',
    clientEmail: 'production@marketingpro.com',
    clientId: 'CLI-004',
    amount: 15000,
    currency: 'USD',
    status: 'disputed',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-12'),
    completionPassword: 'VIDEO2024!',
    progressPercentage: 85,
    clientAvatar: '/avatars/marketing-pro.jpg',
    paymentMethod: 'stripe',
    paymentId: 'pay_9876543210',
    contractUrl: '/contracts/esc-004.pdf',
    disputeReason: 'Client disputes final video quality standards',
    disputeStatus: 'under_review',
    notes: 'Multi-video campaign for social media. Dispute over final deliverables.',
    fees: {
      platform: 450,
      platformPercentage: 3,
      payment: 300,
      paymentPercentage: 2,
      withdrawal: 50,
      total: 800,
      currency: 'USD'
    },
    milestones: [
      {
        id: 'MS-012',
        depositId: 'ESC-004',
        title: 'Pre-Production',
        description: 'Scripting, storyboarding, and planning',
        amount: 3000,
        percentage: 20,
        status: 'completed',
        completedAt: new Date('2024-01-15'),
        approvedAt: new Date('2024-01-16'),
        dueDate: new Date('2024-01-18'),
        deliverables: [
          'Scripts',
          'Storyboards',
          'Shot list',
          'Production schedule'
        ],
        attachments: []
      },
      {
        id: 'MS-013',
        depositId: 'ESC-004',
        title: 'Video Production',
        description: 'Filming and recording sessions',
        amount: 6000,
        percentage: 40,
        status: 'completed',
        completedAt: new Date('2024-01-25'),
        approvedAt: new Date('2024-01-26'),
        dueDate: new Date('2024-01-28'),
        dependencies: ['MS-012'],
        deliverables: [
          'Raw footage',
          'Behind-the-scenes',
          'Interviews',
          'B-roll'
        ],
        attachments: []
      },
      {
        id: 'MS-014',
        depositId: 'ESC-004',
        title: 'Post-Production',
        description: 'Editing, color grading, and sound design',
        amount: 4500,
        percentage: 30,
        status: 'completed',
        completedAt: new Date('2024-02-05'),
        approvedAt: new Date('2024-02-06'),
        dueDate: new Date('2024-02-08'),
        dependencies: ['MS-013'],
        deliverables: [
          'Edited videos',
          'Color graded',
          'Sound mixing',
          'Motion graphics'
        ],
        attachments: []
      },
      {
        id: 'MS-015',
        depositId: 'ESC-004',
        title: 'Final Delivery',
        description: 'Final video files in multiple formats',
        amount: 1500,
        percentage: 10,
        status: 'disputed',
        dueDate: new Date('2024-02-12'),
        dependencies: ['MS-014'],
        deliverables: [
          'MP4 files',
          'Social media formats',
          'Raw exports',
          'Project files'
        ],
        rejectionReason: 'Video quality does not meet agreed standards. Requires color correction and audio mixing improvements.',
        attachments: []
      }
    ],
    metadata: {
      estimatedDuration: 35,
      totalEdits: 4,
      totalDisputes: 1,
      totalReleases: 3,
      averageMilestoneTime: 10,
      tags: ['video-production', 'marketing', 'social-media'],
      category: 'Video Production'
    }
  },
  {
    id: 'ESC-005',
    userId: 'USR-001',
    projectTitle: 'SaaS Platform Development',
    projectDescription: 'Full-stack SaaS application with subscription management',
    clientName: 'CloudTech Solutions',
    clientEmail: 'dev@cloudtech.com',
    clientId: 'CLI-005',
    amount: 25000,
    currency: 'USD',
    status: 'active',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
    completionPassword: 'SAAS2024!',
    progressPercentage: 0,
    paymentMethod: 'wire_transfer',
    contractUrl: '/contracts/esc-005.pdf',
    notes: 'Full-stack SaaS platform with user management, subscriptions, and analytics',
    fees: {
      platform: 750,
      platformPercentage: 3,
      payment: 500,
      paymentPercentage: 2,
      withdrawal: 50,
      total: 1300,
      currency: 'USD'
    },
    milestones: [
      {
        id: 'MS-016',
        depositId: 'ESC-005',
        title: 'Backend Architecture',
        description: 'Database design, API development, authentication',
        amount: 8000,
        percentage: 32,
        status: 'pending',
        dueDate: new Date('2024-03-15'),
        deliverables: [
          'Database schema',
          'REST API',
          'Authentication system',
          'Admin panel'
        ],
        attachments: []
      },
      {
        id: 'MS-017',
        depositId: 'ESC-005',
        title: 'Frontend Development',
        description: 'React dashboard, user interface, responsive design',
        amount: 10000,
        percentage: 40,
        status: 'pending',
        dueDate: new Date('2024-04-15'),
        dependencies: ['MS-016'],
        deliverables: [
          'User dashboard',
          'Admin dashboard',
          'Responsive design',
          'Component library'
        ],
        attachments: []
      },
      {
        id: 'MS-018',
        depositId: 'ESC-005',
        title: 'Payment Integration',
        description: 'Stripe integration, subscription management, billing',
        amount: 5000,
        percentage: 20,
        status: 'pending',
        dueDate: new Date('2024-05-01'),
        dependencies: ['MS-016', 'MS-017'],
        deliverables: [
          'Stripe integration',
          'Subscription plans',
          'Billing system',
          'Invoice generation'
        ],
        attachments: []
      },
      {
        id: 'MS-019',
        depositId: 'ESC-005',
        title: 'Testing & Launch',
        description: 'QA testing, bug fixes, deployment',
        amount: 2000,
        percentage: 8,
        status: 'pending',
        dueDate: new Date('2024-05-15'),
        dependencies: ['MS-018'],
        deliverables: [
          'Test coverage',
          'Bug fixes',
          'Production deployment',
          'Launch checklist'
        ],
        attachments: []
      }
    ],
    metadata: {
      estimatedDuration: 90,
      tags: ['saas', 'full-stack', 'subscription'],
      category: 'Web Development'
    }
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get escrow deposits with optional filtering
 */
export function getEscrowDeposits(
  userId?: string,
  filters?: {
    status?: EscrowStatus
    minAmount?: number
    maxAmount?: number
    currency?: Currency
    paymentMethod?: PaymentMethod
  }
): EscrowDeposit[] {
  logger.debug('Getting escrow deposits', { userId, filters })

  let deposits = [...MOCK_ESCROW_DEPOSITS]

  if (userId) {
    deposits = deposits.filter(d => d.userId === userId)
  }

  if (filters?.status) {
    deposits = deposits.filter(d => d.status === filters.status)
  }

  if (filters?.minAmount) {
    deposits = deposits.filter(d => d.amount >= filters.minAmount!)
  }

  if (filters?.maxAmount) {
    deposits = deposits.filter(d => d.amount <= filters.maxAmount!)
  }

  if (filters?.currency) {
    deposits = deposits.filter(d => d.currency === filters.currency)
  }

  if (filters?.paymentMethod) {
    deposits = deposits.filter(d => d.paymentMethod === filters.paymentMethod)
  }

  logger.debug('Escrow deposits filtered', { count: deposits.length })
  return deposits
}

/**
 * Get escrow deposit by ID
 */
export function getEscrowDepositById(depositId: string): EscrowDeposit | undefined {
  logger.debug('Getting escrow deposit by ID', { depositId })
  const deposit = MOCK_ESCROW_DEPOSITS.find(d => d.id === depositId)

  if (deposit) {
    logger.debug('Escrow deposit found', { projectTitle: deposit.projectTitle })
  } else {
    logger.warn('Escrow deposit not found', { depositId })
  }

  return deposit
}

/**
 * Create new escrow deposit
 */
export function createEscrowDeposit(data: Partial<EscrowDeposit>): EscrowDeposit {
  logger.info('Creating escrow deposit', {
    projectTitle: data.projectTitle,
    amount: data.amount,
    clientName: data.clientName
  })

  const depositId = `ESC-${String(MOCK_ESCROW_DEPOSITS.length + 1).padStart(3, '0')}`

  const deposit: EscrowDeposit = {
    id: depositId,
    userId: data.userId || 'USR-001',
    projectTitle: data.projectTitle || 'Untitled Project',
    projectDescription: data.projectDescription,
    clientName: data.clientName || 'Unknown Client',
    clientEmail: data.clientEmail || '',
    clientId: data.clientId,
    amount: data.amount || 0,
    currency: data.currency || 'USD',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    completionPassword: generateCompletionPassword(),
    progressPercentage: 0,
    clientAvatar: data.clientAvatar,
    paymentMethod: data.paymentMethod || 'stripe',
    paymentId: data.paymentId,
    contractUrl: data.contractUrl,
    notes: data.notes,
    fees: calculateEscrowFees(data.amount || 0, data.currency || 'USD', data.paymentMethod || 'stripe'),
    milestones: data.milestones || [],
    metadata: {
      estimatedDuration: data.metadata?.estimatedDuration,
      tags: data.metadata?.tags || [],
      category: data.metadata?.category
    }
  }

  logger.info('Escrow deposit created', {
    id: deposit.id,
    projectTitle: deposit.projectTitle,
    amount: deposit.amount
  })

  return deposit
}

/**
 * Calculate escrow fees
 */
export function calculateEscrowFees(
  amount: number,
  currency: Currency,
  paymentMethod: PaymentMethod
): EscrowFees {
  logger.debug('Calculating escrow fees', { amount, currency, paymentMethod })

  const platformPercentage = 3 // 3% platform fee
  const platform = (amount * platformPercentage) / 100

  // Payment processor fees vary by method
  let paymentPercentage = 0
  switch (paymentMethod) {
    case 'stripe':
    case 'credit_card':
      paymentPercentage = 2.9 // 2.9% + $0.30
      break
    case 'paypal':
      paymentPercentage = 3.49 // 3.49%
      break
    case 'bank_transfer':
    case 'wire_transfer':
      paymentPercentage = 1 // 1% flat
      break
    case 'crypto':
      paymentPercentage = 1.5 // 1.5%
      break
  }

  const payment = (amount * paymentPercentage) / 100

  // Fixed withdrawal fee
  const withdrawal = 50

  const total = platform + payment + withdrawal

  const fees: EscrowFees = {
    platform,
    platformPercentage,
    payment,
    paymentPercentage,
    withdrawal,
    total,
    currency
  }

  logger.debug('Escrow fees calculated', fees)
  return fees
}

/**
 * Generate secure completion password
 */
export function generateCompletionPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''

  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  logger.debug('Completion password generated')
  return password
}

/**
 * Verify completion password
 */
export function verifyCompletionPassword(
  depositId: string,
  password: string
): boolean {
  logger.debug('Verifying completion password', { depositId })

  const deposit = getEscrowDepositById(depositId)

  if (!deposit) {
    logger.warn('Deposit not found for password verification', { depositId })
    return false
  }

  const isValid = deposit.completionPassword === password

  if (isValid) {
    logger.info('Completion password verified', { depositId })
  } else {
    logger.warn('Invalid completion password', { depositId })
  }

  return isValid
}

/**
 * Complete milestone
 */
export function completeMilestone(
  depositId: string,
  milestoneId: string
): { success: boolean; milestone?: EscrowMilestone; error?: string } {
  logger.info('Completing milestone', { depositId, milestoneId })

  const deposit = getEscrowDepositById(depositId)

  if (!deposit) {
    logger.error('Deposit not found', { depositId })
    return { success: false, error: 'Deposit not found' }
  }

  const milestoneIndex = deposit.milestones.findIndex(m => m.id === milestoneId)

  if (milestoneIndex === -1) {
    logger.error('Milestone not found', { depositId, milestoneId })
    return { success: false, error: 'Milestone not found' }
  }

  const milestone = deposit.milestones[milestoneIndex]

  // Check dependencies
  if (milestone.dependencies && milestone.dependencies.length > 0) {
    const incompleteDeps = milestone.dependencies.filter(depId => {
      const dep = deposit.milestones.find(m => m.id === depId)
      return dep && dep.status !== 'completed'
    })

    if (incompleteDeps.length > 0) {
      logger.warn('Milestone has incomplete dependencies', {
        depositId,
        milestoneId,
        incompleteDeps
      })
      return {
        success: false,
        error: `Cannot complete milestone. Pending dependencies: ${incompleteDeps.join(', ')}`
      }
    }
  }

  // Update milestone
  milestone.status = 'completed'
  milestone.completedAt = new Date()

  // Calculate progress
  const completedMilestones = deposit.milestones.filter(m => m.status === 'completed').length
  const totalMilestones = deposit.milestones.length
  deposit.progressPercentage = Math.round((completedMilestones / totalMilestones) * 100)

  logger.info('Milestone completed', {
    depositId,
    milestoneId,
    progress: deposit.progressPercentage
  })

  return { success: true, milestone }
}

/**
 * Release escrow funds
 */
export function releaseFunds(
  depositId: string,
  password: string
): { success: boolean; transaction?: EscrowTransaction; error?: string } {
  logger.info('Releasing escrow funds', { depositId })

  // Verify password
  if (!verifyCompletionPassword(depositId, password)) {
    logger.error('Invalid password for fund release', { depositId })
    return { success: false, error: 'Invalid completion password' }
  }

  const deposit = getEscrowDepositById(depositId)

  if (!deposit) {
    logger.error('Deposit not found', { depositId })
    return { success: false, error: 'Deposit not found' }
  }

  if (deposit.status !== 'active') {
    logger.error('Cannot release funds - invalid status', {
      depositId,
      status: deposit.status
    })
    return { success: false, error: 'Cannot release funds - deposit is not active' }
  }

  if (deposit.progressPercentage < 100) {
    logger.error('Cannot release funds - incomplete milestones', {
      depositId,
      progress: deposit.progressPercentage
    })
    return { success: false, error: 'Cannot release funds - not all milestones completed' }
  }

  // Update deposit status
  deposit.status = 'released'
  deposit.releasedAt = new Date()
  deposit.completedAt = new Date()

  // Calculate net amount after fees
  const netAmount = deposit.amount - deposit.fees.total

  // Create transaction
  const transaction: EscrowTransaction = {
    id: `TXN-${Date.now()}`,
    depositId,
    type: 'release',
    amount: deposit.amount,
    currency: deposit.currency,
    status: 'completed',
    createdAt: new Date(),
    completedAt: new Date(),
    paymentMethod: deposit.paymentMethod,
    paymentId: deposit.paymentId,
    description: `Funds released for: ${deposit.projectTitle}`,
    toUserId: deposit.userId,
    fees: deposit.fees.total,
    netAmount
  }

  logger.info('Funds released successfully', {
    depositId,
    amount: deposit.amount,
    netAmount
  })

  return { success: true, transaction }
}

/**
 * Create dispute
 */
export function createDispute(
  depositId: string,
  milestoneId: string | undefined,
  reason: string,
  description: string,
  raisedBy: 'client' | 'freelancer',
  raisedById: string
): EscrowDispute {
  logger.info('Creating escrow dispute', {
    depositId,
    milestoneId,
    reason,
    raisedBy
  })

  const dispute: EscrowDispute = {
    id: `DSP-${Date.now()}`,
    depositId,
    milestoneId,
    raisedBy,
    raisedById,
    raisedAt: new Date(),
    status: 'open',
    reason,
    description,
    evidence: []
  }

  // Update deposit status
  const deposit = getEscrowDepositById(depositId)
  if (deposit) {
    deposit.status = 'disputed'
    deposit.disputeReason = reason
    deposit.disputeStatus = 'open'
  }

  logger.info('Dispute created', { disputeId: dispute.id, depositId })
  return dispute
}

/**
 * Calculate escrow statistics
 */
export function calculateEscrowStatistics(
  deposits: EscrowDeposit[]
): EscrowStatistics {
  logger.debug('Calculating escrow statistics', { depositsCount: deposits.length })

  const totalDeposits = deposits.length
  const totalValue = deposits.reduce((sum, d) => sum + d.amount, 0)
  const totalReleased = deposits
    .filter(d => d.status === 'released')
    .reduce((sum, d) => sum + d.amount, 0)
  const totalFees = deposits.reduce((sum, d) => sum + d.fees.total, 0)

  const activeDeposits = deposits.filter(d => d.status === 'active').length
  const completedDeposits = deposits.filter(d => d.status === 'released').length
  const disputedDeposits = deposits.filter(d => d.status === 'disputed').length

  const averageProjectValue = totalDeposits > 0 ? totalValue / totalDeposits : 0

  const completedWithDuration = deposits.filter(
    d => d.metadata?.actualDuration !== undefined
  )
  const averageCompletionTime =
    completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, d) => sum + (d.metadata?.actualDuration || 0), 0) /
        completedWithDuration.length
      : 0

  const successRate =
    totalDeposits > 0 ? (completedDeposits / totalDeposits) * 100 : 0
  const disputeRate =
    totalDeposits > 0 ? (disputedDeposits / totalDeposits) * 100 : 0

  const stats: EscrowStatistics = {
    totalDeposits,
    totalValue,
    totalReleased,
    totalFees,
    activeDeposits,
    completedDeposits,
    disputedDeposits,
    averageProjectValue,
    averageCompletionTime,
    successRate,
    disputeRate
  }

  logger.debug('Escrow statistics calculated', stats)
  return stats
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Get milestone progress
 */
export function getMilestoneProgress(deposit: EscrowDeposit): {
  completed: number
  total: number
  percentage: number
} {
  const completed = deposit.milestones.filter(m => m.status === 'completed').length
  const total = deposit.milestones.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return { completed, total, percentage }
}

/**
 * Get estimated completion date
 */
export function getEstimatedCompletionDate(deposit: EscrowDeposit): Date | null {
  const pendingMilestones = deposit.milestones.filter(m => m.status === 'pending')

  if (pendingMilestones.length === 0) return null

  const latestDueDate = pendingMilestones.reduce((latest, m) => {
    if (!m.dueDate) return latest
    const dueDate = new Date(m.dueDate)
    return !latest || dueDate > latest ? dueDate : latest
  }, null as Date | null)

  return latestDueDate
}

/**
 * Search escrow deposits
 */
export function searchEscrowDeposits(
  query: string,
  deposits: EscrowDeposit[] = MOCK_ESCROW_DEPOSITS
): EscrowDeposit[] {
  logger.debug('Searching escrow deposits', { query })

  const lowerQuery = query.toLowerCase()

  const results = deposits.filter(
    deposit =>
      deposit.projectTitle.toLowerCase().includes(lowerQuery) ||
      deposit.clientName.toLowerCase().includes(lowerQuery) ||
      deposit.clientEmail.toLowerCase().includes(lowerQuery) ||
      (deposit.projectDescription?.toLowerCase().includes(lowerQuery) || false) ||
      (deposit.notes?.toLowerCase().includes(lowerQuery) || false)
  )

  logger.debug('Search completed', { query, resultsCount: results.length })
  return results
}

/**
 * Sort escrow deposits
 */
export function sortEscrowDeposits(
  deposits: EscrowDeposit[],
  sortBy: 'amount' | 'date' | 'status' | 'progress' | 'client',
  order: 'asc' | 'desc' = 'desc'
): EscrowDeposit[] {
  logger.debug('Sorting escrow deposits', { sortBy, order })

  const sorted = [...deposits].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'amount':
        comparison = a.amount - b.amount
        break
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'progress':
        comparison = a.progressPercentage - b.progressPercentage
        break
      case 'client':
        comparison = a.clientName.localeCompare(b.clientName)
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  logger.debug('Escrow deposits sorted', { count: sorted.length })
  return sorted
}

logger.info('Escrow utilities initialized', {
  mockDeposits: MOCK_ESCROW_DEPOSITS.length
})
