/**
 * Admin Dashboard Utilities
 * Helper functions and mock data for unified admin overview
 */

import {
  AdminModule,
  ModuleStatus,
  Activity,
  QuickAction,
  SystemAlert,
  DashboardStats,
  PerformanceIndicator,
  RecentMetrics,
  TopPerformer,
  AlertLevel,
  MetricTrend
} from './admin-dashboard-types'

export const ADMIN_MODULES: AdminModule[] = [
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📊',
    description: 'Business intelligence & insights',
    path: '/dashboard/analytics-advanced',
    status: 'active',
    metrics: [
      {
        id: 'total-revenue',
        label: 'Total Revenue',
        value: 284500,
        previousValue: 245000,
        change: 39500,
        changePercent: 16.1,
        trend: 'up',
        format: 'currency',
        icon: '💰',
        color: '#10b981'
      },
      {
        id: 'conversion-rate',
        label: 'Conversion Rate',
        value: 3.8,
        previousValue: 3.2,
        change: 0.6,
        changePercent: 18.75,
        trend: 'up',
        format: 'percentage',
        icon: '📈',
        color: '#8b5cf6'
      }
    ],
    recentActivity: [
      {
        id: 'act-1',
        moduleId: 'analytics',
        type: 'insight-generated',
        title: 'Revenue Milestone Reached',
        description: 'Total revenue exceeded $280K',
        timestamp: new Date(Date.now() - 7200000)
      }
    ],
    quickActions: [
      {
        id: 'qa-1',
        label: 'View Reports',
        description: 'Access detailed analytics',
        icon: '📑',
        category: 'analyze',
        path: '/dashboard/analytics-advanced'
      },
      {
        id: 'qa-2',
        label: 'Export Data',
        description: 'Download analytics data',
        icon: '📥',
        category: 'manage'
      }
    ]
  },
  {
    id: 'crm',
    name: 'CRM & Sales',
    icon: '🤝',
    description: 'Customer relationships & pipeline',
    path: '/dashboard/crm',
    status: 'active',
    metrics: [
      {
        id: 'pipeline-value',
        label: 'Pipeline Value',
        value: 615000,
        format: 'currency',
        icon: '💎',
        color: '#3b82f6'
      },
      {
        id: 'deals-won',
        label: 'Deals Won',
        value: 8,
        trend: 'up',
        format: 'number',
        icon: '🎯',
        color: '#10b981'
      }
    ],
    recentActivity: [
      {
        id: 'act-2',
        moduleId: 'crm',
        type: 'deal-won',
        title: 'Deal Closed',
        description: 'Enterprise Solutions Ltd - $50K',
        timestamp: new Date(Date.now() - 3600000)
      }
    ],
    quickActions: [
      {
        id: 'qa-3',
        label: 'Add Deal',
        description: 'Create new deal',
        icon: '➕',
        category: 'create',
        path: '/dashboard/crm'
      },
      {
        id: 'qa-4',
        label: 'View Pipeline',
        description: 'Manage sales pipeline',
        icon: '📊',
        category: 'manage',
        path: '/dashboard/crm'
      }
    ]
  },
  {
    id: 'invoicing',
    name: 'Invoicing',
    icon: '🧾',
    description: 'Billing & payment management',
    path: '/dashboard/invoicing',
    status: 'warning',
    metrics: [
      {
        id: 'pending-amount',
        label: 'Pending',
        value: 3465,
        format: 'currency',
        icon: '⏳',
        color: '#f59e0b'
      },
      {
        id: 'overdue-invoices',
        label: 'Overdue',
        value: 1,
        format: 'number',
        icon: '🚨',
        color: '#ef4444'
      }
    ],
    recentActivity: [
      {
        id: 'act-3',
        moduleId: 'invoicing',
        type: 'invoice-paid',
        title: 'Payment Received',
        description: 'INV-2024-001 - $7,150',
        timestamp: new Date(Date.now() - 1800000)
      }
    ],
    quickActions: [
      {
        id: 'qa-5',
        label: 'Create Invoice',
        description: 'New invoice',
        icon: '➕',
        category: 'create',
        path: '/dashboard/invoicing'
      },
      {
        id: 'qa-6',
        label: 'Send Reminders',
        description: 'Overdue invoices',
        icon: '📧',
        category: 'manage',
        badge: 1
      }
    ]
  },
  {
    id: 'clients',
    name: 'Client Portal',
    icon: '👥',
    description: 'Client management & collaboration',
    path: '/dashboard/client-portal',
    status: 'active',
    metrics: [
      {
        id: 'total-clients',
        label: 'Total Clients',
        value: 45,
        trend: 'up',
        format: 'number',
        icon: '👥',
        color: '#3b82f6'
      },
      {
        id: 'client-satisfaction',
        label: 'Satisfaction',
        value: 91.5,
        format: 'percentage',
        icon: '⭐',
        color: '#f59e0b'
      }
    ],
    recentActivity: [
      {
        id: 'act-4',
        moduleId: 'clients',
        type: 'client-added',
        title: 'New Client',
        description: 'Global Marketing Co onboarded',
        timestamp: new Date(Date.now() - 5400000)
      }
    ],
    quickActions: [
      {
        id: 'qa-7',
        label: 'Add Client',
        description: 'Onboard new client',
        icon: '➕',
        category: 'create',
        path: '/dashboard/client-portal'
      },
      {
        id: 'qa-8',
        label: 'View Projects',
        description: 'Client projects',
        icon: '📁',
        category: 'manage',
        path: '/dashboard/client-portal'
      }
    ]
  },
  {
    id: 'leads',
    name: 'Lead Generation',
    icon: '🎯',
    description: 'Lead capture & conversion',
    path: '/dashboard/lead-generation',
    status: 'active',
    metrics: [
      {
        id: 'total-leads',
        label: 'Total Leads',
        value: 1245,
        trend: 'up',
        format: 'number',
        icon: '👥',
        color: '#8b5cf6'
      },
      {
        id: 'hot-leads',
        label: 'Hot Leads',
        value: 145,
        format: 'number',
        icon: '🔥',
        color: '#ef4444'
      }
    ],
    recentActivity: [
      {
        id: 'act-5',
        moduleId: 'leads',
        type: 'lead-qualified',
        title: 'Lead Qualified',
        description: 'Sarah Johnson - TechCorp Inc',
        timestamp: new Date(Date.now() - 900000)
      }
    ],
    quickActions: [
      {
        id: 'qa-9',
        label: 'Create Form',
        description: 'New lead form',
        icon: '📝',
        category: 'create',
        path: '/dashboard/lead-generation'
      },
      {
        id: 'qa-10',
        label: 'View Campaigns',
        description: 'Lead campaigns',
        icon: '🚀',
        category: 'manage',
        path: '/dashboard/lead-generation'
      }
    ]
  },
  {
    id: 'email',
    name: 'Email Marketing',
    icon: '📧',
    description: 'Campaigns & automation',
    path: '/dashboard/email-marketing',
    status: 'active',
    metrics: [
      {
        id: 'subscribers',
        label: 'Subscribers',
        value: 24580,
        trend: 'up',
        format: 'number',
        icon: '👥',
        color: '#3b82f6'
      },
      {
        id: 'open-rate',
        label: 'Open Rate',
        value: 42.5,
        format: 'percentage',
        icon: '📬',
        color: '#10b981'
      }
    ],
    recentActivity: [
      {
        id: 'act-6',
        moduleId: 'email',
        type: 'campaign-sent',
        title: 'Campaign Sent',
        description: 'Summer Sale Newsletter - 5,420 recipients',
        timestamp: new Date(Date.now() - 10800000)
      }
    ],
    quickActions: [
      {
        id: 'qa-11',
        label: 'New Campaign',
        description: 'Create email campaign',
        icon: '➕',
        category: 'create',
        path: '/dashboard/email-marketing'
      },
      {
        id: 'qa-12',
        label: 'View Analytics',
        description: 'Campaign performance',
        icon: '📊',
        category: 'analyze',
        path: '/dashboard/email-marketing'
      }
    ]
  },
  {
    id: 'users',
    name: 'User Management',
    icon: '👤',
    description: 'Team & permissions',
    path: '/dashboard/user-management',
    status: 'active',
    metrics: [
      {
        id: 'team-members',
        label: 'Team Members',
        value: 24,
        format: 'number',
        icon: '👥',
        color: '#8b5cf6'
      },
      {
        id: 'active-users',
        label: 'Active Today',
        value: 18,
        format: 'number',
        icon: '✅',
        color: '#10b981'
      }
    ],
    recentActivity: [
      {
        id: 'act-7',
        moduleId: 'users',
        type: 'user-invited',
        title: 'User Invited',
        description: 'john.doe@company.com invited as Manager',
        timestamp: new Date(Date.now() - 14400000)
      }
    ],
    quickActions: [
      {
        id: 'qa-13',
        label: 'Invite User',
        description: 'Add team member',
        icon: '➕',
        category: 'create',
        path: '/dashboard/user-management'
      },
      {
        id: 'qa-14',
        label: 'Manage Roles',
        description: 'Permissions & access',
        icon: '🔐',
        category: 'manage',
        path: '/dashboard/user-management'
      }
    ]
  }
]

export const SYSTEM_ALERTS: SystemAlert[] = [
  {
    id: 'alert-1',
    level: 'warning',
    title: 'Overdue Invoice',
    message: 'INV-2024-003 is 15 days overdue ($13,200)',
    moduleId: 'invoicing',
    timestamp: new Date(Date.now() - 3600000),
    isRead: false,
    actionLabel: 'Send Reminder',
    actionPath: '/dashboard/invoicing'
  },
  {
    id: 'alert-2',
    level: 'success',
    title: 'Revenue Milestone',
    message: 'Monthly revenue exceeded $280K target',
    moduleId: 'analytics',
    timestamp: new Date(Date.now() - 7200000),
    isRead: false,
    actionLabel: 'View Analytics',
    actionPath: '/dashboard/analytics-advanced'
  },
  {
    id: 'alert-3',
    level: 'info',
    title: 'Campaign Scheduled',
    message: 'Weekly Newsletter #45 scheduled for tomorrow 9 AM',
    moduleId: 'email',
    timestamp: new Date(Date.now() - 10800000),
    isRead: true,
    actionLabel: 'View Campaign',
    actionPath: '/dashboard/email-marketing'
  }
]

export const DASHBOARD_STATS: DashboardStats = {
  totalRevenue: 284500,
  revenueGrowth: 16.1,
  totalClients: 45,
  activeClients: 38,
  totalLeads: 1245,
  hotLeads: 145,
  totalInvoices: 5,
  overdueInvoices: 1,
  emailCampaigns: 156,
  emailOpenRate: 42.5,
  totalProjects: 87,
  activeProjects: 34,
  teamMembers: 24,
  activeUsers: 18
}

export const PERFORMANCE_INDICATORS: PerformanceIndicator[] = [
  {
    id: 'pi-1',
    name: 'Revenue Growth',
    value: 16.1,
    target: 15,
    status: 'excellent',
    trend: 'up'
  },
  {
    id: 'pi-2',
    name: 'Client Retention',
    value: 87.5,
    target: 85,
    status: 'excellent',
    trend: 'up'
  },
  {
    id: 'pi-3',
    name: 'Lead Conversion',
    value: 18.5,
    target: 20,
    status: 'good',
    trend: 'stable'
  },
  {
    id: 'pi-4',
    name: 'Email Engagement',
    value: 42.5,
    target: 35,
    status: 'excellent',
    trend: 'up'
  }
]

export const RECENT_METRICS: RecentMetrics[] = [
  { date: 'Mon', revenue: 38500, leads: 45, clients: 2, emails: 1200 },
  { date: 'Tue', revenue: 42000, leads: 52, clients: 3, emails: 1500 },
  { date: 'Wed', revenue: 39800, leads: 48, clients: 1, emails: 1350 },
  { date: 'Thu', revenue: 45200, leads: 61, clients: 4, emails: 1800 },
  { date: 'Fri', revenue: 51000, leads: 58, clients: 3, emails: 1650 },
  { date: 'Sat', revenue: 28000, leads: 32, clients: 1, emails: 800 },
  { date: 'Sun', revenue: 40000, leads: 41, clients: 2, emails: 950 }
]

export const TOP_PERFORMERS: TopPerformer[] = [
  {
    id: 'tp-1',
    name: 'TechCorp Inc',
    category: 'client',
    metric: 'Revenue',
    value: 450000,
    icon: '🏆'
  },
  {
    id: 'tp-2',
    name: 'Summer Sale Newsletter',
    category: 'campaign',
    metric: 'Open Rate',
    value: 40.0,
    icon: '📧'
  },
  {
    id: 'tp-3',
    name: 'Website Redesign',
    category: 'project',
    metric: 'Progress',
    value: 65,
    icon: '📁'
  },
  {
    id: 'tp-4',
    name: 'Sarah Johnson',
    category: 'user',
    metric: 'Tasks Completed',
    value: 287,
    icon: '👤'
  }
]

// Helper Functions
export function getModuleStatusColor(status: ModuleStatus): string {
  const colors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[status]
}

export function getAlertLevelColor(level: AlertLevel): string {
  const colors = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800',
    success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800'
  }
  return colors[level]
}

export function getPerformanceStatusColor(status: PerformanceIndicator['status']): string {
  const colors = {
    excellent: 'text-green-500',
    good: 'text-blue-500',
    fair: 'text-yellow-500',
    poor: 'text-red-500'
  }
  return colors[status]
}

export function getTrendIcon(trend: MetricTrend): string {
  const icons = {
    up: '↗',
    down: '↘',
    stable: '→'
  }
  return icons[trend]
}

export function formatMetricValue(value: number | string, format: 'number' | 'currency' | 'percentage' | 'text'): string {
  if (typeof value === 'string') return value

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
      return new Intl.NumberFormat('en-US').format(value)
    default:
      return value.toString()
  }
}

export function getUnreadAlerts(alerts: SystemAlert[]): SystemAlert[] {
  return alerts.filter(a => !a.isRead)
}

export function getRecentActivity(modules: AdminModule[], limit: number = 10): Activity[] {
  const allActivity: Activity[] = []

  modules.forEach(module => {
    allActivity.push(...module.recentActivity)
  })

  return allActivity
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}

export function getModuleByStatus(modules: AdminModule[], status: ModuleStatus): AdminModule[] {
  return modules.filter(m => m.status === status)
}
