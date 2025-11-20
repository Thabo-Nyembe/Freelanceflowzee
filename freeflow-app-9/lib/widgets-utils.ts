import type {
  Widget,
  WidgetTemplate,
  DashboardLayout,
  WidgetMetrics,
  WidgetType,
  WidgetSize
} from './widgets-types'

// Widget Templates
export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'revenue-card',
    type: 'metric-card',
    name: 'Revenue Metric',
    description: 'Display total revenue with trend',
    icon: '💰',
    defaultSize: 'small',
    category: 'analytics',
    isPremium: false,
    defaultConfig: {
      metric: {
        value: 0,
        label: 'Total Revenue',
        trend: 'neutral',
        color: '#10b981'
      }
    }
  },
  {
    id: 'sales-chart',
    type: 'chart',
    name: 'Sales Chart',
    description: 'Visualize sales trends over time',
    icon: '📈',
    defaultSize: 'medium',
    category: 'analytics',
    isPremium: false,
    defaultConfig: {
      chart: {
        type: 'line',
        data: [],
        xAxis: 'Date',
        yAxis: 'Sales',
        colors: ['#3b82f6']
      }
    }
  },
  {
    id: 'activity-feed',
    type: 'activity-feed',
    name: 'Activity Feed',
    description: 'Recent activity and updates',
    icon: '📋',
    defaultSize: 'medium',
    category: 'communication',
    isPremium: false,
    defaultConfig: {
      activityFeed: {
        maxItems: 10,
        showTimestamps: true
      }
    }
  },
  {
    id: 'quick-actions',
    type: 'quick-actions',
    name: 'Quick Actions',
    description: 'Shortcuts to common tasks',
    icon: '⚡',
    defaultSize: 'small',
    category: 'productivity',
    isPremium: false,
    defaultConfig: {
      quickActions: {
        actions: [
          { id: '1', label: 'Create Invoice', icon: '📄', action: '/dashboard/invoicing?action=create', color: '#3b82f6' },
          { id: '2', label: 'Add Client', icon: '👤', action: '/dashboard/clients?action=add', color: '#10b981' },
          { id: '3', label: 'New Project', icon: '📁', action: '/dashboard/projects-hub?action=create', color: '#f59e0b' },
          { id: '4', label: 'Send Email', icon: '📧', action: '/dashboard/email-marketing?action=compose', color: '#8b5cf6' }
        ]
      }
    }
  },
  {
    id: 'tasks-widget',
    type: 'tasks',
    name: 'Task List',
    description: 'Your upcoming tasks',
    icon: '✅',
    defaultSize: 'medium',
    category: 'productivity',
    isPremium: false,
    defaultConfig: {
      tasks: {
        maxItems: 5,
        showCompleted: false,
        sortBy: 'priority'
      }
    }
  },
  {
    id: 'notifications',
    type: 'notifications',
    name: 'Notifications',
    description: 'Recent notifications',
    icon: '🔔',
    defaultSize: 'small',
    category: 'communication',
    isPremium: false,
    defaultConfig: {
      notifications: {
        maxItems: 5,
        types: ['all']
      }
    }
  },
  {
    id: 'calendar-widget',
    type: 'calendar',
    name: 'Calendar',
    description: 'Upcoming events',
    icon: '📅',
    defaultSize: 'large',
    category: 'productivity',
    isPremium: true,
    defaultConfig: {
      calendar: {
        events: [],
        defaultView: 'week'
      }
    }
  },
  {
    id: 'notes-widget',
    type: 'notes',
    name: 'Quick Notes',
    description: 'Jot down quick notes',
    icon: '📝',
    defaultSize: 'medium',
    category: 'productivity',
    isPremium: false,
    defaultConfig: {
      customSettings: {
        defaultText: 'Start typing...'
      }
    }
  }
]

// Default Widgets
export const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'widget-1',
    type: 'metric-card',
    title: 'Total Revenue',
    description: 'Monthly revenue',
    icon: '💰',
    size: 'small',
    position: { x: 0, y: 0 },
    isVisible: true,
    config: {
      metric: {
        value: 284500,
        label: 'Total Revenue',
        trend: 'up',
        changePercent: 12.5,
        color: '#10b981'
      }
    }
  },
  {
    id: 'widget-2',
    type: 'metric-card',
    title: 'Active Clients',
    description: 'Current active clients',
    icon: '👥',
    size: 'small',
    position: { x: 1, y: 0 },
    isVisible: true,
    config: {
      metric: {
        value: 48,
        label: 'Active Clients',
        trend: 'up',
        changePercent: 8.3,
        color: '#3b82f6'
      }
    }
  },
  {
    id: 'widget-3',
    type: 'metric-card',
    title: 'Hot Leads',
    description: 'High-priority leads',
    icon: '🔥',
    size: 'small',
    position: { x: 2, y: 0 },
    isVisible: true,
    config: {
      metric: {
        value: 23,
        label: 'Hot Leads',
        trend: 'neutral',
        changePercent: 0,
        color: '#f59e0b'
      }
    }
  },
  {
    id: 'widget-4',
    type: 'chart',
    title: 'Revenue Trend',
    description: 'Last 7 days',
    icon: '📈',
    size: 'medium',
    position: { x: 0, y: 1 },
    isVisible: true,
    config: {
      chart: {
        type: 'line',
        data: [
          { label: 'Mon', value: 42000 },
          { label: 'Tue', value: 38000 },
          { label: 'Wed', value: 45000 },
          { label: 'Thu', value: 41000 },
          { label: 'Fri', value: 48000 },
          { label: 'Sat', value: 35000 },
          { label: 'Sun', value: 35500 }
        ],
        colors: ['#10b981']
      }
    }
  },
  {
    id: 'widget-5',
    type: 'quick-actions',
    title: 'Quick Actions',
    description: 'Common tasks',
    icon: '⚡',
    size: 'small',
    position: { x: 2, y: 1 },
    isVisible: true,
    config: {
      quickActions: {
        actions: [
          { id: '1', label: 'Create Invoice', icon: '📄', action: '/dashboard/invoicing?action=create', color: '#3b82f6' },
          { id: '2', label: 'Add Client', icon: '👤', action: '/dashboard/clients?action=add', color: '#10b981' },
          { id: '3', label: 'New Project', icon: '📁', action: '/dashboard/projects-hub?action=create', color: '#f59e0b' },
          { id: '4', label: 'Send Email', icon: '📧', action: '/dashboard/email-marketing?action=compose', color: '#8b5cf6' }
        ]
      }
    }
  },
  {
    id: 'widget-6',
    type: 'activity-feed',
    title: 'Recent Activity',
    description: 'Latest updates',
    icon: '📋',
    size: 'medium',
    position: { x: 0, y: 2 },
    isVisible: true,
    config: {
      activityFeed: {
        maxItems: 5,
        showTimestamps: true
      }
    }
  }
]

// Default Dashboard Layout
export const DEFAULT_LAYOUT: DashboardLayout = {
  id: 'default',
  name: 'Default Dashboard',
  description: 'Standard dashboard layout',
  widgets: DEFAULT_WIDGETS,
  columns: 3,
  isDefault: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date()
}

// Widget Metrics
export const WIDGET_METRICS: WidgetMetrics = {
  totalWidgets: 8,
  activeWidgets: 6,
  favoriteWidget: 'Quick Actions',
  averageWidgetsPerDashboard: 5.2,
  mostUsedCategory: 'analytics'
}

// Helper Functions
export function getWidgetTemplate(type: WidgetType): WidgetTemplate | undefined {
  return WIDGET_TEMPLATES.find(t => t.type === type)
}

export function getWidgetsByCategory(category: string): WidgetTemplate[] {
  return WIDGET_TEMPLATES.filter(t => t.category === category)
}

export function getSizeClass(size: WidgetSize): string {
  const sizes: Record<WidgetSize, string> = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-3',
    full: 'col-span-full'
  }
  return sizes[size]
}

export function getSizeLabel(size: WidgetSize): string {
  const labels: Record<WidgetSize, string> = {
    small: 'Small (1 column)',
    medium: 'Medium (2 columns)',
    large: 'Large (3 columns)',
    full: 'Full Width'
  }
  return labels[size]
}

export function getWidgetIcon(type: WidgetType): string {
  const icons: Record<WidgetType, string> = {
    'metric-card': '📊',
    'chart': '📈',
    'table': '📋',
    'activity-feed': '📰',
    'quick-actions': '⚡',
    'calendar': '📅',
    'notifications': '🔔',
    'tasks': '✅',
    'weather': '🌤️',
    'notes': '📝'
  }
  return icons[type]
}

export function createWidget(template: WidgetTemplate, position: { x: number; y: number }): Widget {
  return {
    id: `widget-${Date.now()}`,
    type: template.type,
    title: template.name,
    description: template.description,
    icon: template.icon,
    size: template.defaultSize,
    position,
    isVisible: true,
    config: template.defaultConfig
  }
}

export function exportLayout(layout: DashboardLayout): string {
  return JSON.stringify(layout, null, 2)
}

export function importLayout(json: string): DashboardLayout | null {
  try {
    return JSON.parse(json) as DashboardLayout
  } catch {
    return null
  }
}

export function duplicateWidget(widget: Widget): Widget {
  return {
    ...widget,
    id: `widget-${Date.now()}`,
    position: { x: widget.position.x + 1, y: widget.position.y }
  }
}

export function resetToDefaultLayout(): DashboardLayout {
  return { ...DEFAULT_LAYOUT, updatedAt: new Date() }
}
