// PROJECTS HUB - SHARED UTILITIES, TYPES, AND MOCK DATA
// This file contains all shared functionality for the Projects Hub feature

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Project {
  id: string
  title: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'draft'
  progress: number
  client_name: string
  budget: number
  spent: number
  start_date: string
  end_date: string
  team_members: { id: string; name: string; avatar: string }[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  comments_count: number
  attachments: string[]
  category: string
  tags: string[]
}

export interface ProjectStats {
  total: number
  active: number
  completed: number
  revenue: number
  efficiency: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Website Redesign',
    description: 'Complete redesign of online store with modern UI/UX, mobile optimization, and enhanced checkout flow.',
    status: 'active',
    progress: 75,
    client_name: 'TechCorp Inc.',
    budget: 12000,
    spent: 9000,
    start_date: '2024-01-15T00:00:00.000Z',
    end_date: '2024-02-28T00:00:00.000Z',
    team_members: [
      { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
      { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
    ],
    priority: 'high',
    comments_count: 12,
    attachments: ['wireframes.pdf', 'brand-guidelines.pdf'],
    category: 'Web Development',
    tags: ['React', 'E-commerce', 'UI/UX']
  },
  {
    id: '2',
    title: 'Brand Identity Package',
    description: 'Complete brand identity design including logo, color palette, typography, and brand guidelines.',
    status: 'completed',
    progress: 100,
    client_name: 'Startup Ventures',
    budget: 5000,
    spent: 4800,
    start_date: '2023-12-01T00:00:00.000Z',
    end_date: '2024-01-10T00:00:00.000Z',
    team_members: [
      { id: '3', name: 'Mike Johnson', avatar: '/avatars/mike.jpg' },
      { id: '4', name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg' }
    ],
    priority: 'medium',
    comments_count: 8,
    attachments: ['logo-variations.ai', 'brand-book.pdf'],
    category: 'Branding',
    tags: ['Logo Design', 'Branding', 'Identity']
  },
  {
    id: '3',
    title: 'Mobile App Development',
    description: 'iOS and Android mobile application for fitness tracking with social features.',
    status: 'active',
    progress: 45,
    client_name: 'FitLife Solutions',
    budget: 25000,
    spent: 11250,
    start_date: '2024-01-20T00:00:00.000Z',
    end_date: '2024-04-15T00:00:00.000Z',
    team_members: [
      { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
      { id: '5', name: 'Alex Chen', avatar: '/avatars/alex.jpg' }
    ],
    priority: 'urgent',
    comments_count: 24,
    attachments: ['wireframes.sketch', 'api-docs.pdf', 'user-stories.docx'],
    category: 'Mobile Development',
    tags: ['React Native', 'iOS', 'Android', 'Fitness']
  },
  {
    id: '4',
    title: 'Video Marketing Campaign',
    description: 'Series of promotional videos for social media marketing campaign.',
    status: 'paused',
    progress: 30,
    client_name: 'Marketing Pro',
    budget: 8000,
    spent: 2400,
    start_date: '2024-02-01T00:00:00.000Z',
    end_date: '2024-03-15T00:00:00.000Z',
    team_members: [
      { id: '6', name: 'Emma Thompson', avatar: '/avatars/emma.jpg' }
    ],
    priority: 'low',
    comments_count: 5,
    attachments: ['storyboard.pdf', 'script.docx'],
    category: 'Video Production',
    tags: ['Video Editing', 'Social Media', 'Marketing']
  },
  {
    id: '5',
    title: 'WordPress Website',
    description: 'Custom WordPress theme development for law firm website.',
    status: 'draft',
    progress: 10,
    client_name: 'Legal Associates',
    budget: 6000,
    spent: 600,
    start_date: '2024-02-10T00:00:00.000Z',
    end_date: '2024-03-20T00:00:00.000Z',
    team_members: [
      { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
    ],
    priority: 'medium',
    comments_count: 2,
    attachments: ['requirements.pdf'],
    category: 'Web Development',
    tags: ['WordPress', 'PHP', 'Legal']
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500'
    case 'high': return 'bg-orange-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

export const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-blue-500'
  if (progress >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

export const calculateStats = (projects: Project[]): ProjectStats => {
  return {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    revenue: projects.reduce((sum, p) => sum + p.spent, 0),
    efficiency: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  }
}

export const filterProjects = (
  projects: Project[],
  searchTerm: string,
  statusFilter: string,
  priorityFilter: string
): Project[] => {
  return projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })
}
