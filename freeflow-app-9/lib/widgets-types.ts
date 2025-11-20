/**
 * Dashboard Widgets System Types
 * Customizable dashboard with draggable widgets
 */

export type WidgetType =
  | 'metric-card'
  | 'chart'
  | 'table'
  | 'activity-feed'
  | 'quick-actions'
  | 'calendar'
  | 'notifications'
  | 'tasks'
  | 'weather'
  | 'notes'

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'
export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area'

export interface Widget {
  id: string
  type: WidgetType
  title: string
  description: string
  icon: string
  size: WidgetSize
  position: {
    x: number
    y: number
  }
  config: WidgetConfig
  isVisible: boolean
  refreshInterval?: number
  lastUpdated?: Date
}

export interface WidgetConfig {
  // Metric Card
  metric?: {
    value: number | string
    label: string
    trend?: 'up' | 'down' | 'neutral'
    changePercent?: number
    color: string
  }

  // Chart
  chart?: {
    type: ChartType
    data: ChartData[]
    xAxis?: string
    yAxis?: string
    colors?: string[]
  }

  // Table
  table?: {
    columns: TableColumn[]
    rows: TableRow[]
    pageSize: number
  }

  // Activity Feed
  activityFeed?: {
    maxItems: number
    showTimestamps: boolean
    filterTypes?: string[]
  }

  // Quick Actions
  quickActions?: {
    actions: QuickAction[]
  }

  // Calendar
  calendar?: {
    events: CalendarEvent[]
    defaultView: 'day' | 'week' | 'month'
  }

  // Notifications
  notifications?: {
    maxItems: number
    types: string[]
  }

  // Tasks
  tasks?: {
    maxItems: number
    showCompleted: boolean
    sortBy: 'priority' | 'dueDate' | 'created'
  }

  // Custom settings
  customSettings?: Record<string, any>
}

export interface ChartData {
  label: string
  value: number
  color?: string
}

export interface TableColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'status' | 'badge'
  width?: string
}

export interface TableRow {
  [key: string]: any
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
  color: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
}

export interface DashboardLayout {
  id: string
  name: string
  description: string
  widgets: Widget[]
  columns: number
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WidgetTemplate {
  id: string
  type: WidgetType
  name: string
  description: string
  icon: string
  defaultSize: WidgetSize
  defaultConfig: WidgetConfig
  category: 'analytics' | 'productivity' | 'communication' | 'management'
  isPremium: boolean
}

export interface WidgetMetrics {
  totalWidgets: number
  activeWidgets: number
  favoriteWidget: string
  averageWidgetsPerDashboard: number
  mostUsedCategory: string
}
