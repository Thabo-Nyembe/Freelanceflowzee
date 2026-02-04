import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

/**
 * Demo Content API
 *
 * Provides demo/sample content for onboarding, marketing pages, and testing.
 * Returns realistic demo data for various platform features.
 */

interface DemoProject {
  id: string
  name: string
  description: string
  status: string
  progress: number
  budget: number
  deadline: string
  client: string
  tags: string[]
  thumbnail: string
}

interface DemoInvoice {
  id: string
  number: string
  client: string
  amount: number
  status: string
  dueDate: string
  items: { description: string; quantity: number; rate: number }[]
}

interface DemoUser {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  skills: string[]
}

// Demo data collections
const demoProjects: DemoProject[] = [
  {
    id: 'proj-001',
    name: 'Brand Identity Redesign',
    description: 'Complete brand overhaul including logo, colors, and guidelines',
    status: 'in_progress',
    progress: 75,
    budget: 15000,
    deadline: '2026-03-15',
    client: 'TechStart Inc',
    tags: ['branding', 'design', 'identity'],
    thumbnail: '/demo/project-1.jpg',
  },
  {
    id: 'proj-002',
    name: 'E-commerce Website',
    description: 'Full-stack e-commerce platform with payment integration',
    status: 'in_progress',
    progress: 45,
    budget: 25000,
    deadline: '2026-04-01',
    client: 'RetailPro Co',
    tags: ['web', 'ecommerce', 'development'],
    thumbnail: '/demo/project-2.jpg',
  },
  {
    id: 'proj-003',
    name: 'Mobile App MVP',
    description: 'React Native app for fitness tracking',
    status: 'review',
    progress: 90,
    budget: 18000,
    deadline: '2026-02-28',
    client: 'FitLife App',
    tags: ['mobile', 'react-native', 'fitness'],
    thumbnail: '/demo/project-3.jpg',
  },
  {
    id: 'proj-004',
    name: 'Marketing Video Series',
    description: 'Create 6 promotional videos for product launch',
    status: 'pending',
    progress: 10,
    budget: 12000,
    deadline: '2026-05-15',
    client: 'LaunchPad Marketing',
    tags: ['video', 'marketing', 'production'],
    thumbnail: '/demo/project-4.jpg',
  },
]

const demoInvoices: DemoInvoice[] = [
  {
    id: 'inv-001',
    number: 'INV-2026-001',
    client: 'TechStart Inc',
    amount: 5000,
    status: 'paid',
    dueDate: '2026-02-01',
    items: [
      { description: 'Logo Design', quantity: 1, rate: 2500 },
      { description: 'Brand Guidelines', quantity: 1, rate: 2500 },
    ],
  },
  {
    id: 'inv-002',
    number: 'INV-2026-002',
    client: 'RetailPro Co',
    amount: 12500,
    status: 'pending',
    dueDate: '2026-02-15',
    items: [
      { description: 'Website Development - Phase 1', quantity: 1, rate: 12500 },
    ],
  },
  {
    id: 'inv-003',
    number: 'INV-2026-003',
    client: 'FitLife App',
    amount: 9000,
    status: 'overdue',
    dueDate: '2026-01-15',
    items: [
      { description: 'App Development', quantity: 1, rate: 7500 },
      { description: 'UI/UX Design', quantity: 1, rate: 1500 },
    ],
  },
]

const demoUsers: DemoUser[] = [
  {
    id: 'user-001',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'Designer',
    avatar: '/avatars/alex.jpg',
    skills: ['UI Design', 'Branding', 'Illustration'],
  },
  {
    id: 'user-002',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'Developer',
    avatar: '/avatars/sarah.jpg',
    skills: ['React', 'Node.js', 'TypeScript'],
  },
  {
    id: 'user-003',
    name: 'Mike Williams',
    email: 'mike@example.com',
    role: 'Project Manager',
    avatar: '/avatars/mike.jpg',
    skills: ['Agile', 'Communication', 'Planning'],
  },
]

const demoStats = {
  totalRevenue: 156750,
  activeProjects: 12,
  completedProjects: 47,
  pendingInvoices: 8,
  clientCount: 23,
  averageProjectValue: 8500,
  monthlyGrowth: 12.5,
  satisfactionRate: 98,
}

const demoMessages = [
  {
    id: 'msg-001',
    from: 'Sarah Chen',
    subject: 'Project Update',
    preview: 'The latest milestone has been completed...',
    timestamp: '2026-01-29T10:30:00Z',
    read: false,
  },
  {
    id: 'msg-002',
    from: 'TechStart Inc',
    subject: 'Feedback on Logo Concepts',
    preview: 'We love option B! Can we proceed with...',
    timestamp: '2026-01-28T15:45:00Z',
    read: true,
  },
  {
    id: 'msg-003',
    from: 'RetailPro Co',
    subject: 'Timeline Discussion',
    preview: 'Can we schedule a call to discuss...',
    timestamp: '2026-01-27T09:00:00Z',
    read: true,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const limit = parseInt(searchParams.get('limit') || '10')

  const response: Record<string, unknown> = {
    success: true,
    demo: true,
  }

  switch (type) {
    case 'projects':
      response.data = demoProjects.slice(0, limit)
      break

    case 'invoices':
      response.data = demoInvoices.slice(0, limit)
      break

    case 'users':
    case 'team':
      response.data = demoUsers.slice(0, limit)
      break

    case 'stats':
    case 'analytics':
      response.data = demoStats
      break

    case 'messages':
      response.data = demoMessages.slice(0, limit)
      break

    case 'dashboard':
      response.data = {
        stats: demoStats,
        recentProjects: demoProjects.slice(0, 3),
        recentInvoices: demoInvoices.slice(0, 3),
        recentMessages: demoMessages.slice(0, 3),
      }
      break

    case 'all':
    default:
      response.data = {
        projects: demoProjects,
        invoices: demoInvoices,
        users: demoUsers,
        stats: demoStats,
        messages: demoMessages,
      }
      break
  }

  return NextResponse.json(response)
}

export async function POST(request: NextRequest) {
  // Demo mode - simulate creation
  const body = await request.json()
  const { type, data } = body

  return NextResponse.json({
    success: true,
    demo: true,
    message: `Demo ${type || 'item'} created successfully`,
    data: {
      id: `demo-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    },
  })
}

export async function PATCH(request: NextRequest) {
  // Demo mode - simulate update
  const body = await request.json()
  const { type, id, data } = body

  return NextResponse.json({
    success: true,
    demo: true,
    message: `Demo ${type || 'item'} #${id} updated successfully`,
    data: {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    },
  })
}

export async function DELETE(request: NextRequest) {
  // Demo mode - simulate deletion
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  return NextResponse.json({
    success: true,
    demo: true,
    message: `Demo ${type || 'item'} #${id} deleted successfully`,
  })
}
