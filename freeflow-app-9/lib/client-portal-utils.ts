/**
 * Client Portal Utilities
 * Helper functions and mock data for client management
 */

import {
  Client,
  ClientStatus,
  ClientTier,
  ClientProject,
  ProjectStatus,
  Communication,
  ClientFile,
  Contract,
  ClientActivity,
  ClientInvoice,
  ClientStats,
  CommunicationType,
  FileCategory
} from './client-portal-types'

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    companyName: 'TechCorp Inc',
    contactPerson: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    website: 'https://techcorp.com',
    status: 'active',
    tier: 'enterprise',
    industry: 'Technology',
    companySize: '500-1000',
    assignedTo: ['user-1', 'user-2'],
    tags: ['high-priority', 'tech', 'recurring'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-07-10'),
    lastContactedAt: new Date('2024-07-05'),
    metadata: {
      totalProjects: 12,
      activeProjects: 3,
      completedProjects: 9,
      totalRevenue: 450000,
      lifetimeValue: 450000,
      averageProjectValue: 37500,
      satisfactionScore: 95,
      onboardingProgress: 100,
      riskScore: 10,
      healthScore: 95
    },
    portalAccess: {
      enabled: true,
      accessLevel: 'full',
      lastLogin: new Date('2024-07-15'),
      loginCount: 47,
      users: [
        {
          id: 'portal-user-1',
          name: 'John Smith',
          email: 'john.smith@techcorp.com',
          role: 'Admin',
          accessLevel: 'full',
          lastLogin: new Date('2024-07-15'),
          invitedAt: new Date('2023-01-15'),
          acceptedAt: new Date('2023-01-16'),
          status: 'active'
        }
      ],
      customBranding: true,
      features: [
        { id: 'projects', name: 'Projects', enabled: true, permissions: ['view', 'comment'] },
        { id: 'files', name: 'Files', enabled: true, permissions: ['view', 'download', 'upload'] },
        { id: 'invoices', name: 'Invoices', enabled: true, permissions: ['view', 'download'] }
      ]
    }
  },
  {
    id: 'client-2',
    companyName: 'Creative Studios',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@creativestudios.com',
    phone: '+1 (555) 234-5678',
    website: 'https://creativestudios.com',
    status: 'active',
    tier: 'premium',
    industry: 'Marketing',
    companySize: '50-100',
    assignedTo: ['user-1'],
    tags: ['creative', 'design'],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-07-12'),
    lastContactedAt: new Date('2024-07-10'),
    metadata: {
      totalProjects: 8,
      activeProjects: 2,
      completedProjects: 6,
      totalRevenue: 185000,
      lifetimeValue: 185000,
      averageProjectValue: 23125,
      satisfactionScore: 88,
      onboardingProgress: 100,
      riskScore: 15,
      healthScore: 85
    },
    portalAccess: {
      enabled: true,
      accessLevel: 'full',
      lastLogin: new Date('2024-07-12'),
      loginCount: 32,
      users: [
        {
          id: 'portal-user-2',
          name: 'Sarah Johnson',
          email: 'sarah@creativestudios.com',
          role: 'Owner',
          accessLevel: 'full',
          lastLogin: new Date('2024-07-12'),
          invitedAt: new Date('2023-06-01'),
          acceptedAt: new Date('2023-06-01'),
          status: 'active'
        }
      ],
      customBranding: false,
      features: [
        { id: 'projects', name: 'Projects', enabled: true, permissions: ['view'] },
        { id: 'files', name: 'Files', enabled: true, permissions: ['view', 'download'] }
      ]
    }
  },
  {
    id: 'client-3',
    companyName: 'StartupXYZ',
    contactPerson: 'Mike Chen',
    email: 'mike@startupxyz.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    tier: 'standard',
    industry: 'SaaS',
    companySize: '10-50',
    assignedTo: ['user-2'],
    tags: ['startup', 'saas'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-07-14'),
    lastContactedAt: new Date('2024-07-14'),
    metadata: {
      totalProjects: 3,
      activeProjects: 2,
      completedProjects: 1,
      totalRevenue: 75000,
      lifetimeValue: 75000,
      averageProjectValue: 25000,
      satisfactionScore: 92,
      onboardingProgress: 75,
      riskScore: 20,
      healthScore: 80
    },
    portalAccess: {
      enabled: true,
      accessLevel: 'limited',
      lastLogin: new Date('2024-07-14'),
      loginCount: 18,
      users: [
        {
          id: 'portal-user-3',
          name: 'Mike Chen',
          email: 'mike@startupxyz.com',
          role: 'Founder',
          accessLevel: 'limited',
          lastLogin: new Date('2024-07-14'),
          invitedAt: new Date('2024-03-01'),
          acceptedAt: new Date('2024-03-02'),
          status: 'active'
        }
      ],
      customBranding: false,
      features: [
        { id: 'projects', name: 'Projects', enabled: true, permissions: ['view'] }
      ]
    }
  },
  {
    id: 'client-4',
    companyName: 'Global Marketing Co',
    contactPerson: 'Emily Davis',
    email: 'emily@globalmarketing.com',
    status: 'onboarding',
    tier: 'premium',
    industry: 'Marketing',
    companySize: '100-500',
    assignedTo: ['user-1'],
    tags: ['onboarding', 'marketing'],
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-15'),
    lastContactedAt: new Date('2024-07-15'),
    metadata: {
      totalProjects: 1,
      activeProjects: 1,
      completedProjects: 0,
      totalRevenue: 0,
      lifetimeValue: 50000,
      averageProjectValue: 50000,
      satisfactionScore: 0,
      onboardingProgress: 45,
      riskScore: 25,
      healthScore: 75
    },
    portalAccess: {
      enabled: false,
      accessLevel: 'view-only',
      loginCount: 0,
      users: [],
      customBranding: false,
      features: []
    }
  }
]

export const MOCK_PROJECTS: ClientProject[] = [
  {
    id: 'project-1',
    clientId: 'client-1',
    name: 'Website Redesign',
    description: 'Complete website redesign with modern UI/UX',
    status: 'in-progress',
    priority: 'high',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-09-30'),
    budget: 50000,
    spent: 32500,
    progress: 65,
    milestones: [
      {
        id: 'milestone-1',
        name: 'Design Phase',
        dueDate: new Date('2024-07-01'),
        completedDate: new Date('2024-06-28'),
        status: 'completed',
        deliverables: ['Wireframes', 'Design Mockups', 'Style Guide']
      },
      {
        id: 'milestone-2',
        name: 'Development Phase',
        dueDate: new Date('2024-08-15'),
        status: 'in-progress',
        deliverables: ['Frontend Development', 'Backend Integration', 'Testing']
      }
    ],
    team: [
      { userId: 'user-1', name: 'Alex Designer', role: 'Lead Designer', responsibilities: ['UI/UX Design'] },
      { userId: 'user-2', name: 'Sam Developer', role: 'Frontend Developer', responsibilities: ['Development'] }
    ],
    tags: ['website', 'design', 'development'],
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-07-15')
  },
  {
    id: 'project-2',
    clientId: 'client-2',
    name: 'Brand Identity Design',
    description: 'Complete brand identity package including logo, colors, and guidelines',
    status: 'completed',
    priority: 'medium',
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-06-30'),
    completionDate: new Date('2024-06-25'),
    budget: 15000,
    spent: 14500,
    progress: 100,
    milestones: [
      {
        id: 'milestone-3',
        name: 'Logo Design',
        dueDate: new Date('2024-05-15'),
        completedDate: new Date('2024-05-12'),
        status: 'completed',
        deliverables: ['Logo Concepts', 'Final Logo Files']
      },
      {
        id: 'milestone-4',
        name: 'Brand Guidelines',
        dueDate: new Date('2024-06-30'),
        completedDate: new Date('2024-06-25'),
        status: 'completed',
        deliverables: ['Brand Guidelines Document', 'Asset Library']
      }
    ],
    team: [
      { userId: 'user-1', name: 'Alex Designer', role: 'Brand Designer', responsibilities: ['Brand Strategy', 'Design'] }
    ],
    tags: ['branding', 'design'],
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-06-25')
  }
]

export const MOCK_COMMUNICATIONS: Communication[] = [
  {
    id: 'comm-1',
    clientId: 'client-1',
    type: 'meeting',
    subject: 'Project Kickoff Meeting',
    content: 'Discussed project scope, timeline, and deliverables',
    participants: ['john.smith@techcorp.com', 'user-1'],
    createdBy: 'user-1',
    createdAt: new Date('2024-06-01'),
    isImportant: true,
    tags: ['kickoff', 'project-1']
  },
  {
    id: 'comm-2',
    clientId: 'client-1',
    type: 'email',
    subject: 'Design Approval Request',
    content: 'Please review and approve the design mockups',
    participants: ['john.smith@techcorp.com', 'user-1'],
    createdBy: 'user-1',
    createdAt: new Date('2024-06-25'),
    isImportant: false,
    tags: ['design', 'approval']
  }
]

export const MOCK_FILES: ClientFile[] = [
  {
    id: 'file-1',
    clientId: 'client-1',
    projectId: 'project-1',
    name: 'Website_Mockups_v2.fig',
    category: 'deliverable',
    url: '/files/mockups.fig',
    size: 15728640,
    mimeType: 'application/figma',
    uploadedBy: 'user-1',
    uploadedAt: new Date('2024-06-28'),
    lastModified: new Date('2024-06-28'),
    isShared: true,
    sharedWith: ['client-1'],
    tags: ['design', 'mockups'],
    version: 2,
    previousVersions: [
      {
        id: 'file-1-v1',
        version: 1,
        url: '/files/mockups_v1.fig',
        uploadedBy: 'user-1',
        uploadedAt: new Date('2024-06-15'),
        changeDescription: 'Initial mockups'
      }
    ]
  },
  {
    id: 'file-2',
    clientId: 'client-1',
    projectId: 'project-1',
    name: 'Service_Agreement_2024.pdf',
    category: 'contract',
    url: '/files/agreement.pdf',
    size: 524288,
    mimeType: 'application/pdf',
    uploadedBy: 'user-1',
    uploadedAt: new Date('2024-05-20'),
    lastModified: new Date('2024-05-20'),
    isShared: true,
    sharedWith: ['client-1'],
    tags: ['legal', 'contract'],
    version: 1
  }
]

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'contract-1',
    clientId: 'client-1',
    projectId: 'project-1',
    title: 'Website Development Service Agreement',
    type: 'service-agreement',
    status: 'signed',
    value: 50000,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-12-31'),
    signedDate: new Date('2024-05-25'),
    terms: 'Standard terms and conditions apply',
    fileUrl: '/contracts/service-agreement.pdf',
    signatories: [
      {
        id: 'sig-1',
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        role: 'Client',
        signedAt: new Date('2024-05-25')
      },
      {
        id: 'sig-2',
        name: 'Agency Owner',
        email: 'owner@agency.com',
        role: 'Service Provider',
        signedAt: new Date('2024-05-24')
      }
    ],
    autoRenew: false
  }
]

export const MOCK_ACTIVITIES: ClientActivity[] = [
  {
    id: 'activity-1',
    clientId: 'client-1',
    type: 'project-update',
    title: 'Project milestone completed',
    description: 'Design Phase milestone marked as complete',
    userId: 'user-1',
    userName: 'Alex Designer',
    timestamp: new Date('2024-06-28')
  },
  {
    id: 'activity-2',
    clientId: 'client-1',
    type: 'file-upload',
    title: 'New file uploaded',
    description: 'Website_Mockups_v2.fig uploaded',
    userId: 'user-1',
    userName: 'Alex Designer',
    timestamp: new Date('2024-06-28')
  },
  {
    id: 'activity-3',
    clientId: 'client-1',
    type: 'portal-login',
    title: 'Client portal access',
    description: 'John Smith logged into client portal',
    timestamp: new Date('2024-07-15')
  }
]

export const MOCK_CLIENT_INVOICES: ClientInvoice[] = [
  {
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    projectId: 'project-1',
    projectName: 'Website Redesign',
    amount: 25000,
    status: 'paid',
    issueDate: new Date('2024-06-15'),
    dueDate: new Date('2024-07-15'),
    paidDate: new Date('2024-07-10')
  },
  {
    invoiceId: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    projectId: 'project-1',
    projectName: 'Website Redesign',
    amount: 25000,
    status: 'sent',
    issueDate: new Date('2024-07-15'),
    dueDate: new Date('2024-08-15')
  }
]

export const MOCK_CLIENT_STATS: ClientStats = {
  totalClients: 45,
  activeClients: 38,
  newClientsThisMonth: 5,
  churnedClients: 2,
  totalRevenue: 1250000,
  averageClientValue: 27777,
  clientSatisfaction: 91.5,
  clientsByTier: {
    basic: 15,
    standard: 18,
    premium: 9,
    enterprise: 3
  },
  clientsByStatus: {
    active: 38,
    inactive: 3,
    onboarding: 2,
    churned: 2,
    prospect: 0
  },
  clientsByIndustry: [
    { industry: 'Technology', count: 15 },
    { industry: 'Marketing', count: 12 },
    { industry: 'SaaS', count: 8 },
    { industry: 'E-commerce', count: 6 },
    { industry: 'Other', count: 4 }
  ],
  topClients: [
    { clientId: 'client-1', clientName: 'TechCorp Inc', revenue: 450000 },
    { clientId: 'client-2', clientName: 'Creative Studios', revenue: 185000 },
    { clientId: 'client-3', clientName: 'StartupXYZ', revenue: 75000 }
  ]
}

// Helper Functions
export function getClientStatusColor(status: ClientStatus): string {
  const colors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    onboarding: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    churned: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    prospect: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  }
  return colors[status]
}

export function getClientTierColor(tier: ClientTier): string {
  const colors = {
    basic: 'bg-gray-100 text-gray-700',
    standard: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  }
  return colors[tier]
}

export function getProjectStatusColor(status: ProjectStatus): string {
  const colors = {
    'not-started': 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'on-hold': 'bg-yellow-100 text-yellow-700',
    'completed': 'bg-green-100 text-green-700',
    'cancelled': 'bg-red-100 text-red-700'
  }
  return colors[status]
}

export function getCommunicationIcon(type: CommunicationType): string {
  const icons = {
    email: '📧',
    call: '📞',
    meeting: '🤝',
    chat: '💬',
    note: '📝'
  }
  return icons[type]
}

export function getFileCategoryIcon(category: FileCategory): string {
  const icons = {
    contract: '📄',
    invoice: '🧾',
    deliverable: '📦',
    asset: '🎨',
    document: '📋',
    other: '📁'
  }
  return icons[category]
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function calculateHealthScore(client: Client): number {
  const {
    satisfactionScore,
    riskScore,
    onboardingProgress
  } = client.metadata

  // Health score calculation (0-100)
  const health = (
    (satisfactionScore * 0.4) +
    ((100 - riskScore) * 0.3) +
    (onboardingProgress * 0.3)
  )

  return Math.round(health)
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-yellow-500'
  return 'text-red-500'
}

export function getActiveProjects(clientId: string): ClientProject[] {
  return MOCK_PROJECTS.filter(
    p => p.clientId === clientId && p.status === 'in-progress'
  )
}

export function getClientInvoices(clientId: string): ClientInvoice[] {
  return MOCK_CLIENT_INVOICES.filter(
    inv => MOCK_PROJECTS.find(p => p.id === inv.projectId)?.clientId === clientId
  )
}

export function getClientFiles(clientId: string): ClientFile[] {
  return MOCK_FILES.filter(f => f.clientId === clientId)
}

export function getClientActivities(clientId: string, limit?: number): ClientActivity[] {
  const activities = MOCK_ACTIVITIES
    .filter(a => a.clientId === clientId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return limit ? activities.slice(0, limit) : activities
}

export function calculateProjectProgress(project: ClientProject): number {
  const completedMilestones = project.milestones.filter(m => m.status === 'completed').length
  const totalMilestones = project.milestones.length
  return totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
}

export function isProjectOverdue(project: ClientProject): boolean {
  if (!project.endDate || project.status === 'completed' || project.status === 'cancelled') {
    return false
  }
  return new Date() > new Date(project.endDate)
}

export function getProjectBudgetStatus(project: ClientProject): 'good' | 'warning' | 'over' {
  const percentageUsed = (project.spent / project.budget) * 100
  if (percentageUsed > 100) return 'over'
  if (percentageUsed > 80) return 'warning'
  return 'good'
}

export function sortClientsByRevenue(clients: Client[]): Client[] {
  return [...clients].sort((a, b) => b.metadata.totalRevenue - a.metadata.totalRevenue)
}

export function filterClientsByStatus(clients: Client[], statuses: ClientStatus[]): Client[] {
  return clients.filter(c => statuses.includes(c.status))
}

export function filterClientsByTier(clients: Client[], tiers: ClientTier[]): Client[] {
  return clients.filter(c => tiers.includes(c.tier))
}
