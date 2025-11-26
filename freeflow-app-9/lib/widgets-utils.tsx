// ============================================================================
// WIDGETS UTILITIES - PRODUCTION
// ============================================================================
// Comprehensive widget management system with dashboard customization,
// templates, analytics, and real-time data visualization
// ============================================================================

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('WidgetsUtils')

// ============================================================================
// TYPESCRIPT TYPES & INTERFACES
// ============================================================================

export type WidgetType = 'metric' | 'chart' | 'table' | 'activity' | 'quick-actions' | 'calendar'
export type WidgetSize = 'small' | 'medium' | 'large' | 'full'
export type WidgetCategory = 'analytics' | 'productivity' | 'finance' | 'social' | 'custom'
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter'
export type RefreshInterval = 5 | 10 | 30 | 60 | 300 | 900 // seconds
export type WidgetStatus = 'active' | 'inactive' | 'error' | 'loading'

export interface WidgetConfig {
  refreshInterval?: RefreshInterval
  color?: string
  showLegend?: boolean
  dataSource?: string
  chartType?: ChartType
  maxItems?: number
  showHeader?: boolean
  showFooter?: boolean
  enableInteraction?: boolean
  customSettings?: Record<string, any>
}

export interface Widget {
  id: string
  userId: string
  name: string
  type: WidgetType
  category: WidgetCategory
  size: WidgetSize
  icon: string
  description: string
  isVisible: boolean
  isLocked: boolean
  position: { x: number; y: number }
  config: WidgetConfig
  status: WidgetStatus
  data?: any
  createdAt: string
  updatedAt: string
  lastRefreshed?: string
  usageCount: number
  errorMessage?: string
}

export interface WidgetTemplate {
  id: string
  name: string
  description: string
  type: WidgetType
  category: WidgetCategory
  size: WidgetSize
  icon: string
  thumbnail: string
  config: WidgetConfig
  isPremium: boolean
  downloads: number
  rating: number
  tags: string[]
}

export interface Dashboard {
  id: string
  userId: string
  name: string
  description: string
  layout: string // JSON stringified layout config
  widgets: string[] // Widget IDs
  isDefault: boolean
  isShared: boolean
  shareToken?: string
  theme?: string
  createdAt: string
  updatedAt: string
}

export interface WidgetData {
  widgetId: string
  timestamp: string
  data: any
  status: WidgetStatus
  errorMessage?: string
}

export interface WidgetsStats {
  totalWidgets: number
  activeWidgets: number
  byCategory: Record<WidgetCategory, number>
  byType: Record<WidgetType, number>
  bySize: Record<WidgetSize, number>
  byStatus: Record<WidgetStatus, number>
  totalUsage: number
  averageRefreshRate: number
  mostUsedWidget?: { name: string; usageCount: number }
  lastUpdated: string
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const widgetIcons = [
  'BarChart3', 'PieChart', 'Activity', 'TrendingUp', 'DollarSign',
  'Users', 'ShoppingCart', 'FileText', 'Calendar', 'Zap',
  'Layout', 'Grid', 'Layers', 'Star', 'CheckCircle'
]

const widgetNames = [
  'Revenue Overview', 'User Activity', 'Sales Pipeline', 'Task Progress',
  'Team Performance', 'Project Timeline', 'Budget Tracker', 'Analytics Dashboard',
  'Social Media Stats', 'Customer Feedback', 'Traffic Sources', 'Conversion Funnel',
  'Email Campaigns', 'Support Tickets', 'Inventory Status', 'Server Metrics',
  'Quick Actions', 'Recent Activity', 'Top Products', 'Monthly Goals',
  'Engagement Rate', 'ROI Calculator', 'Time Tracker', 'Resource Allocation',
  'Performance Metrics', 'KPI Dashboard', 'Profit Margins', 'Customer Lifetime Value',
  'Retention Rate', 'Churn Analysis', 'Market Share', 'Competitive Analysis',
  'Brand Sentiment', 'Content Performance', 'Lead Generation', 'Sales Forecast',
  'Cash Flow', 'Expense Breakdown', 'Invoice Status', 'Payment Tracking'
]

const categories: WidgetCategory[] = ['analytics', 'productivity', 'finance', 'social', 'custom']
const types: WidgetType[] = ['metric', 'chart', 'table', 'activity', 'quick-actions', 'calendar']
const sizes: WidgetSize[] = ['small', 'medium', 'large', 'full']
const statuses: WidgetStatus[] = ['active', 'inactive', 'error', 'loading']

export function generateMockWidgets(count: number = 40, userId: string = 'user-1'): Widget[] {
  logger.info('Generating mock widgets', { count, userId })

  const widgets: Widget[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length]
    const category = categories[i % categories.length]
    const size = sizes[i % sizes.length]
    const status = i < 35 ? 'active' : statuses[i % statuses.length]
    const name = widgetNames[i % widgetNames.length]
    const createdAt = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000)

    widgets.push({
      id: `widget-${i + 1}`,
      userId,
      name: `${name} ${Math.floor(i / widgetNames.length) > 0 ? Math.floor(i / widgetNames.length) + 1 : ''}`.trim(),
      type,
      category,
      size,
      icon: widgetIcons[i % widgetIcons.length],
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} widget for ${category} tracking and visualization`,
      isVisible: Math.random() > 0.2,
      isLocked: Math.random() > 0.85,
      position: {
        x: (i % 4) * 250,
        y: Math.floor(i / 4) * 200
      },
      config: {
        refreshInterval: [5, 10, 30, 60, 300][Math.floor(Math.random() * 5)] as RefreshInterval,
        color: ['blue', 'green', 'purple', 'orange', 'red'][i % 5],
        showLegend: Math.random() > 0.3,
        dataSource: `api/data/${category}/${type}`,
        chartType: type === 'chart' ? (['line', 'bar', 'pie', 'area'] as ChartType[])[i % 4] : undefined,
        maxItems: [5, 10, 20, 50][Math.floor(Math.random() * 4)],
        showHeader: Math.random() > 0.2,
        showFooter: Math.random() > 0.4,
        enableInteraction: Math.random() > 0.3
      },
      status,
      data: status === 'active' ? generateWidgetData(type, category) : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastRefreshed: status === 'active' ? new Date(now.getTime() - Math.random() * 60 * 60 * 1000).toISOString() : undefined,
      usageCount: Math.floor(Math.random() * 1000),
      errorMessage: status === 'error' ? 'Failed to load widget data' : undefined
    })
  }

  logger.info('Mock widgets generated successfully', {
    total: widgets.length,
    active: widgets.filter(w => w.status === 'active').length,
    visible: widgets.filter(w => w.isVisible).length
  })

  return widgets
}

function generateWidgetData(type: WidgetType, category: WidgetCategory): any {
  switch (type) {
    case 'metric':
      return {
        value: Math.floor(Math.random() * 10000),
        change: Math.random() * 40 - 20,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }

    case 'chart':
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: category,
          data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 1000))
        }]
      }

    case 'table':
      return {
        headers: ['Name', 'Value', 'Status', 'Date'],
        rows: Array.from({ length: 5 }, (_, i) => [
          `Item ${i + 1}`,
          `$${Math.floor(Math.random() * 1000)}`,
          Math.random() > 0.5 ? 'Active' : 'Pending',
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        ])
      }

    case 'activity':
      return {
        items: Array.from({ length: 8 }, (_, i) => ({
          id: `activity-${i + 1}`,
          message: `Activity item ${i + 1}`,
          timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          type: ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)]
        }))
      }

    case 'quick-actions':
      return {
        actions: Array.from({ length: 4 }, (_, i) => ({
          id: `action-${i + 1}`,
          label: `Action ${i + 1}`,
          icon: widgetIcons[i],
          count: Math.floor(Math.random() * 100)
        }))
      }

    case 'calendar':
      return {
        events: Array.from({ length: 5 }, (_, i) => ({
          id: `event-${i + 1}`,
          title: `Event ${i + 1}`,
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
          type: ['meeting', 'deadline', 'reminder'][Math.floor(Math.random() * 3)]
        }))
      }

    default:
      return {}
  }
}

export function generateMockTemplates(count: number = 20): WidgetTemplate[] {
  logger.info('Generating mock widget templates', { count })

  const templates: WidgetTemplate[] = []

  const templateNames = [
    'Sales Dashboard', 'Analytics Pro', 'Finance Tracker', 'Team Performance',
    'Project Overview', 'Customer Insights', 'Marketing Metrics', 'Revenue Chart',
    'User Engagement', 'Conversion Funnel', 'Traffic Analytics', 'Social Media',
    'Support Dashboard', 'Inventory Monitor', 'Budget Planner', 'Time Tracking',
    'KPI Dashboard', 'Performance Metrics', 'Growth Analytics', 'ROI Calculator'
  ]

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length]
    const category = categories[i % categories.length]

    templates.push({
      id: `template-${i + 1}`,
      name: templateNames[i],
      description: `Professional ${type} widget template for ${category} tracking`,
      type,
      category,
      size: sizes[i % sizes.length],
      icon: widgetIcons[i % widgetIcons.length],
      thumbnail: `/templates/widget-${i + 1}.png`,
      config: {
        refreshInterval: [30, 60, 300] as RefreshInterval[],
        showLegend: true,
        showHeader: true,
        enableInteraction: true
      } as WidgetConfig,
      isPremium: Math.random() > 0.7,
      downloads: Math.floor(Math.random() * 10000),
      rating: 3.5 + Math.random() * 1.5,
      tags: [category, type, sizes[i % sizes.length], 'professional']
    })
  }

  logger.info('Mock templates generated successfully', {
    total: templates.length,
    premium: templates.filter(t => t.isPremium).length
  })

  return templates
}

export function generateMockDashboards(count: number = 5, userId: string = 'user-1'): Dashboard[] {
  logger.info('Generating mock dashboards', { count, userId })

  const dashboards: Dashboard[] = []
  const now = new Date()

  const dashboardNames = [
    'Main Dashboard',
    'Analytics View',
    'Financial Overview',
    'Team Performance',
    'Marketing Insights'
  ]

  for (let i = 0; i < count; i++) {
    const widgetCount = 8 + Math.floor(Math.random() * 8)
    const widgets = Array.from({ length: widgetCount }, (_, j) => `widget-${j + 1}`)

    dashboards.push({
      id: `dashboard-${i + 1}`,
      userId,
      name: dashboardNames[i] || `Custom Dashboard ${i + 1}`,
      description: `Customized dashboard for ${dashboardNames[i]?.toLowerCase() || 'various metrics'}`,
      layout: JSON.stringify({
        columns: 4,
        rowHeight: 200,
        widgets: widgets.map((id, idx) => ({
          id,
          x: idx % 4,
          y: Math.floor(idx / 4),
          w: 1,
          h: 1
        }))
      }),
      widgets,
      isDefault: i === 0,
      isShared: Math.random() > 0.7,
      shareToken: Math.random() > 0.7 ? `share-${Math.random().toString(36).substring(7)}` : undefined,
      theme: ['light', 'dark', 'auto'][i % 3],
      createdAt: new Date(now.getTime() - (count - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.info('Mock dashboards generated successfully', {
    total: dashboards.length,
    shared: dashboards.filter(d => d.isShared).length
  })

  return dashboards
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function searchWidgets(widgets: Widget[], searchTerm: string): Widget[] {
  if (!searchTerm.trim()) return widgets

  const term = searchTerm.toLowerCase()
  logger.debug('Searching widgets', { searchTerm: term, totalWidgets: widgets.length })

  const results = widgets.filter(widget =>
    widget.name.toLowerCase().includes(term) ||
    widget.description.toLowerCase().includes(term) ||
    widget.type.toLowerCase().includes(term) ||
    widget.category.toLowerCase().includes(term)
  )

  logger.debug('Search completed', { resultsCount: results.length })
  return results
}

export function filterByCategory(widgets: Widget[], category: WidgetCategory | 'all'): Widget[] {
  if (category === 'all') return widgets

  logger.debug('Filtering by category', { category })
  return widgets.filter(w => w.category === category)
}

export function filterByType(widgets: Widget[], type: WidgetType | 'all'): Widget[] {
  if (type === 'all') return widgets

  logger.debug('Filtering by type', { type })
  return widgets.filter(w => w.type === type)
}

export function filterBySize(widgets: Widget[], size: WidgetSize | 'all'): Widget[] {
  if (size === 'all') return widgets

  logger.debug('Filtering by size', { size })
  return widgets.filter(w => w.size === size)
}

export function filterByStatus(widgets: Widget[], status: WidgetStatus | 'all'): Widget[] {
  if (status === 'all') return widgets

  logger.debug('Filtering by status', { status })
  return widgets.filter(w => w.status === status)
}

export function sortWidgets(widgets: Widget[], sortBy: 'name' | 'usage' | 'date' | 'size'): Widget[] {
  logger.debug('Sorting widgets', { sortBy, count: widgets.length })

  const sorted = [...widgets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)

      case 'usage':
        return b.usageCount - a.usageCount

      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

      case 'size':
        const sizeOrder: Record<WidgetSize, number> = { small: 1, medium: 2, large: 3, full: 4 }
        return sizeOrder[a.size] - sizeOrder[b.size]

      default:
        return 0
    }
  })

  return sorted
}

export function calculateWidgetsStats(widgets: Widget[]): WidgetsStats {
  logger.debug('Calculating widgets statistics', { totalWidgets: widgets.length })

  const byCategory: Record<WidgetCategory, number> = {
    analytics: 0,
    productivity: 0,
    finance: 0,
    social: 0,
    custom: 0
  }

  const byType: Record<WidgetType, number> = {
    metric: 0,
    chart: 0,
    table: 0,
    activity: 0,
    'quick-actions': 0,
    calendar: 0
  }

  const bySize: Record<WidgetSize, number> = {
    small: 0,
    medium: 0,
    large: 0,
    full: 0
  }

  const byStatus: Record<WidgetStatus, number> = {
    active: 0,
    inactive: 0,
    error: 0,
    loading: 0
  }

  let totalUsage = 0
  let totalRefreshRate = 0
  let refreshRateCount = 0
  let mostUsedWidget: { name: string; usageCount: number } | undefined

  widgets.forEach(widget => {
    byCategory[widget.category]++
    byType[widget.type]++
    bySize[widget.size]++
    byStatus[widget.status]++
    totalUsage += widget.usageCount

    if (widget.config.refreshInterval) {
      totalRefreshRate += widget.config.refreshInterval
      refreshRateCount++
    }

    if (!mostUsedWidget || widget.usageCount > mostUsedWidget.usageCount) {
      mostUsedWidget = { name: widget.name, usageCount: widget.usageCount }
    }
  })

  const stats: WidgetsStats = {
    totalWidgets: widgets.length,
    activeWidgets: byStatus.active,
    byCategory,
    byType,
    bySize,
    byStatus,
    totalUsage,
    averageRefreshRate: refreshRateCount > 0 ? totalRefreshRate / refreshRateCount : 0,
    mostUsedWidget,
    lastUpdated: new Date().toISOString()
  }

  logger.info('Statistics calculated', {
    totalWidgets: stats.totalWidgets,
    activeWidgets: stats.activeWidgets,
    mostUsed: stats.mostUsedWidget?.name
  })

  return stats
}

export function refreshWidget(widget: Widget): Widget {
  logger.info('Refreshing widget', { widgetId: widget.id, widgetName: widget.name })

  return {
    ...widget,
    lastRefreshed: new Date().toISOString(),
    usageCount: widget.usageCount + 1,
    status: 'active',
    data: generateWidgetData(widget.type, widget.category),
    errorMessage: undefined
  }
}

export function duplicateWidget(widget: Widget, userId: string): Widget {
  logger.info('Duplicating widget', { originalId: widget.id, widgetName: widget.name })

  const now = new Date().toISOString()

  return {
    ...widget,
    id: `widget-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    userId,
    name: `${widget.name} (Copy)`,
    position: {
      x: widget.position.x + 50,
      y: widget.position.y + 50
    },
    isLocked: false,
    createdAt: now,
    updatedAt: now,
    lastRefreshed: undefined,
    usageCount: 0
  }
}

export function exportWidgetData(widget: Widget, format: 'json' | 'csv'): Blob {
  logger.info('Exporting widget data', { widgetId: widget.id, format })

  if (format === 'json') {
    const data = JSON.stringify(widget, null, 2)
    return new Blob([data], { type: 'application/json' })
  }

  // CSV export
  let csv = 'Field,Value\n'
  csv += `Name,${widget.name}\n`
  csv += `Type,${widget.type}\n`
  csv += `Category,${widget.category}\n`
  csv += `Size,${widget.size}\n`
  csv += `Status,${widget.status}\n`
  csv += `Usage Count,${widget.usageCount}\n`
  csv += `Created At,${widget.createdAt}\n`
  csv += `Last Refreshed,${widget.lastRefreshed || 'Never'}\n`

  return new Blob([csv], { type: 'text/csv' })
}

export function exportDashboard(dashboard: Dashboard, widgets: Widget[]): Blob {
  logger.info('Exporting dashboard', { dashboardId: dashboard.id, dashboardName: dashboard.name })

  const dashboardWidgets = widgets.filter(w => dashboard.widgets.includes(w.id))

  const exportData = {
    dashboard: {
      name: dashboard.name,
      description: dashboard.description,
      layout: JSON.parse(dashboard.layout),
      theme: dashboard.theme,
      createdAt: dashboard.createdAt
    },
    widgets: dashboardWidgets.map(w => ({
      name: w.name,
      type: w.type,
      category: w.category,
      size: w.size,
      config: w.config,
      position: w.position
    })),
    exportedAt: new Date().toISOString()
  }

  const data = JSON.stringify(exportData, null, 2)
  return new Blob([data], { type: 'application/json' })
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  logger as widgetsLogger
}
