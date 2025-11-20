/**
 * Admin Navigation Configuration
 * Centralized navigation structure for all admin features
 */

export type NavigationCategory = 'overview' | 'business' | 'marketing' | 'operations' | 'settings'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: string
  description: string
  category: NavigationCategory
  badge?: string | number
  isNew?: boolean
  isPremium?: boolean
  keywords?: string[]
  children?: NavigationItem[]
}

export interface NavigationGroup {
  id: string
  label: string
  icon: string
  category: NavigationCategory
  items: NavigationItem[]
  order: number
}

export interface Breadcrumb {
  label: string
  href?: string
}

// Main Admin Navigation Structure
export const ADMIN_NAVIGATION: NavigationGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '🏠',
    category: 'overview',
    order: 1,
    items: [
      {
        id: 'admin-overview',
        label: 'Admin Dashboard',
        href: '/dashboard/admin-overview',
        icon: '📊',
        description: 'Unified overview of all business operations',
        category: 'overview',
        keywords: ['dashboard', 'overview', 'admin', 'stats', 'metrics']
      },
      {
        id: 'dashboard',
        label: 'My Dashboard',
        href: '/dashboard',
        icon: '🎯',
        description: 'Personal workspace and quick access',
        category: 'overview',
        keywords: ['dashboard', 'home', 'workspace']
      }
    ]
  },
  {
    id: 'business-management',
    label: 'Business Management',
    icon: '💼',
    category: 'business',
    order: 2,
    items: [
      {
        id: 'analytics-advanced',
        label: 'Analytics',
        href: '/dashboard/analytics-advanced',
        icon: '📊',
        description: 'Business intelligence & insights',
        category: 'business',
        keywords: ['analytics', 'metrics', 'insights', 'reports', 'data', 'bi', 'business intelligence']
      },
      {
        id: 'crm',
        label: 'CRM & Sales',
        href: '/dashboard/crm',
        icon: '🤝',
        description: 'Customer relationships & sales pipeline',
        category: 'business',
        keywords: ['crm', 'sales', 'pipeline', 'deals', 'contacts', 'leads', 'customers']
      },
      {
        id: 'invoicing',
        label: 'Invoicing',
        href: '/dashboard/invoicing',
        icon: '🧾',
        description: 'Billing & payment management',
        category: 'business',
        badge: '1',
        keywords: ['invoices', 'billing', 'payments', 'finance', 'accounting']
      },
      {
        id: 'client-portal',
        label: 'Client Portal',
        href: '/dashboard/client-portal',
        icon: '👥',
        description: 'Client management & collaboration',
        category: 'business',
        keywords: ['clients', 'portal', 'projects', 'collaboration']
      },
      {
        id: 'financial',
        label: 'Financial Hub',
        href: '/dashboard/financial',
        icon: '💰',
        description: 'Comprehensive financial management',
        category: 'business',
        keywords: ['finance', 'money', 'revenue', 'expenses', 'profit']
      }
    ]
  },
  {
    id: 'marketing-sales',
    label: 'Marketing & Sales',
    icon: '📈',
    category: 'marketing',
    order: 3,
    items: [
      {
        id: 'lead-generation',
        label: 'Lead Generation',
        href: '/dashboard/lead-generation',
        icon: '🎯',
        description: 'Lead capture & conversion',
        category: 'marketing',
        keywords: ['leads', 'generation', 'capture', 'forms', 'landing pages', 'campaigns']
      },
      {
        id: 'email-marketing',
        label: 'Email Marketing',
        href: '/dashboard/email-marketing',
        icon: '📧',
        description: 'Campaigns & automation',
        category: 'marketing',
        keywords: ['email', 'marketing', 'campaigns', 'newsletters', 'automation', 'subscribers']
      },
      {
        id: 'custom-reports',
        label: 'Custom Reports',
        href: '/dashboard/custom-reports',
        icon: '📄',
        description: 'Build custom analytics reports',
        category: 'marketing',
        keywords: ['reports', 'custom', 'analytics', 'data']
      },
      {
        id: 'ml-insights',
        label: 'ML Insights',
        href: '/dashboard/ml-insights',
        icon: '🤖',
        description: 'AI-powered business insights',
        category: 'marketing',
        isNew: true,
        keywords: ['ai', 'ml', 'machine learning', 'insights', 'predictions']
      }
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: '⚙️',
    category: 'operations',
    order: 4,
    items: [
      {
        id: 'user-management',
        label: 'User Management',
        href: '/dashboard/user-management',
        icon: '👤',
        description: 'Team & permissions',
        category: 'operations',
        keywords: ['users', 'team', 'permissions', 'roles', 'access']
      },
      {
        id: 'projects-hub',
        label: 'Projects Hub',
        href: '/dashboard/projects-hub',
        icon: '📁',
        description: 'Project management & tracking',
        category: 'operations',
        keywords: ['projects', 'tasks', 'management', 'workflow']
      },
      {
        id: 'team-hub',
        label: 'Team Hub',
        href: '/dashboard/team-hub',
        icon: '👥',
        description: 'Team collaboration & communication',
        category: 'operations',
        keywords: ['team', 'collaboration', 'communication']
      },
      {
        id: 'files-hub',
        label: 'Files Hub',
        href: '/dashboard/files-hub',
        icon: '📂',
        description: 'File management & storage',
        category: 'operations',
        keywords: ['files', 'storage', 'documents', 'uploads']
      },
      {
        id: 'calendar',
        label: 'Calendar',
        href: '/dashboard/calendar',
        icon: '📅',
        description: 'Schedule & events management',
        category: 'operations',
        keywords: ['calendar', 'schedule', 'events', 'appointments']
      },
      {
        id: 'bookings',
        label: 'Bookings',
        href: '/dashboard/bookings',
        icon: '📆',
        description: 'Appointment scheduling',
        category: 'operations',
        keywords: ['bookings', 'appointments', 'scheduling']
      }
    ]
  },
  {
    id: 'tools-features',
    label: 'Tools & Features',
    icon: '🛠️',
    category: 'operations',
    order: 5,
    items: [
      {
        id: 'ai-create',
        label: 'AI Create',
        href: '/dashboard/ai-create',
        icon: '✨',
        description: 'AI-powered content creation',
        category: 'operations',
        isPremium: true,
        keywords: ['ai', 'create', 'generate', 'content', 'automation']
      },
      {
        id: 'video-studio',
        label: 'Video Studio',
        href: '/dashboard/video-studio',
        icon: '🎬',
        description: 'Professional video editing',
        category: 'operations',
        isPremium: true,
        keywords: ['video', 'editing', 'studio', 'media']
      },
      {
        id: 'ai-design',
        label: 'AI Design',
        href: '/dashboard/ai-design',
        icon: '🎨',
        description: 'AI-powered design tools',
        category: 'operations',
        isPremium: true,
        keywords: ['design', 'ai', 'graphics', 'creative']
      },
      {
        id: 'canvas-collaboration',
        label: 'Canvas Collaboration',
        href: '/dashboard/canvas-collaboration',
        icon: '🖼️',
        description: 'Real-time collaborative canvas',
        category: 'operations',
        keywords: ['canvas', 'whiteboard', 'collaboration', 'drawing']
      }
    ]
  },
  {
    id: 'settings-config',
    label: 'Settings & Configuration',
    icon: '⚙️',
    category: 'settings',
    order: 6,
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/dashboard/settings',
        icon: '⚙️',
        description: 'Account & preferences',
        category: 'settings',
        keywords: ['settings', 'preferences', 'account', 'configuration']
      },
      {
        id: 'white-label',
        label: 'White Label',
        href: '/dashboard/white-label',
        icon: '🏷️',
        description: 'Branding & customization',
        category: 'settings',
        isPremium: true,
        keywords: ['white label', 'branding', 'custom', 'theme']
      },
      {
        id: 'notifications',
        label: 'Notifications',
        href: '/dashboard/notifications',
        icon: '🔔',
        description: 'Alerts & notifications',
        category: 'settings',
        keywords: ['notifications', 'alerts', 'messages']
      }
    ]
  }
]

// Quick Actions for Global Search
export const QUICK_ACTIONS = [
  {
    id: 'create-invoice',
    label: 'Create Invoice',
    description: 'Generate new invoice',
    icon: '➕',
    keywords: ['create', 'new', 'invoice', 'bill'],
    action: '/dashboard/invoicing?action=create'
  },
  {
    id: 'add-client',
    label: 'Add Client',
    description: 'Onboard new client',
    icon: '➕',
    keywords: ['add', 'new', 'client', 'customer'],
    action: '/dashboard/client-portal?action=create'
  },
  {
    id: 'create-campaign',
    label: 'Create Campaign',
    description: 'New email campaign',
    icon: '➕',
    keywords: ['create', 'new', 'campaign', 'email'],
    action: '/dashboard/email-marketing?action=create'
  },
  {
    id: 'add-lead',
    label: 'Add Lead',
    description: 'Create new lead',
    icon: '➕',
    keywords: ['add', 'new', 'lead', 'prospect'],
    action: '/dashboard/lead-generation?action=create'
  },
  {
    id: 'invite-user',
    label: 'Invite User',
    description: 'Add team member',
    icon: '➕',
    keywords: ['invite', 'add', 'user', 'team'],
    action: '/dashboard/user-management?action=invite'
  },
  {
    id: 'export-analytics',
    label: 'Export Analytics',
    description: 'Download data',
    icon: '📥',
    keywords: ['export', 'download', 'analytics', 'data'],
    action: '/dashboard/analytics-advanced?action=export'
  }
]

// Helper Functions
export function getAllNavigationItems(): NavigationItem[] {
  const items: NavigationItem[] = []
  ADMIN_NAVIGATION.forEach(group => {
    items.push(...group.items)
  })
  return items
}

export function searchNavigation(query: string): NavigationItem[] {
  const searchTerm = query.toLowerCase().trim()
  if (!searchTerm) return []

  const allItems = getAllNavigationItems()
  return allItems.filter(item => {
    const matchesLabel = item.label.toLowerCase().includes(searchTerm)
    const matchesDescription = item.description.toLowerCase().includes(searchTerm)
    const matchesKeywords = item.keywords?.some(kw => kw.toLowerCase().includes(searchTerm))
    return matchesLabel || matchesDescription || matchesKeywords
  })
}

export function getNavigationByCategory(category: NavigationCategory): NavigationGroup[] {
  return ADMIN_NAVIGATION.filter(group => group.category === category)
}

export function findNavigationItem(id: string): NavigationItem | undefined {
  for (const group of ADMIN_NAVIGATION) {
    const item = group.items.find(i => i.id === id)
    if (item) return item
  }
  return undefined
}

export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Home', href: '/dashboard' }
  ]

  const allItems = getAllNavigationItems()
  const currentItem = allItems.find(item => item.href === pathname)

  if (currentItem) {
    // Find parent group
    const parentGroup = ADMIN_NAVIGATION.find(group =>
      group.items.some(item => item.id === currentItem.id)
    )

    if (parentGroup && parentGroup.id !== 'overview') {
      breadcrumbs.push({ label: parentGroup.label })
    }

    breadcrumbs.push({ label: currentItem.label, href: currentItem.href })
  }

  return breadcrumbs
}

export function getRecentlyVisited(limit: number = 5): NavigationItem[] {
  // In a real app, this would read from localStorage or user preferences
  // For now, return a subset of items
  return getAllNavigationItems().slice(0, limit)
}

export function getFavorites(): NavigationItem[] {
  // In a real app, this would read from user preferences
  // For now, return admin overview and most used features
  return [
    findNavigationItem('admin-overview'),
    findNavigationItem('analytics-advanced'),
    findNavigationItem('crm'),
    findNavigationItem('invoicing'),
    findNavigationItem('email-marketing')
  ].filter((item): item is NavigationItem => item !== undefined)
}
