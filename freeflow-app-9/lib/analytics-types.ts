/**
 * Advanced Analytics Types
 * Complete type system for business intelligence and analytics
 */

export type MetricType = 'revenue' | 'users' | 'engagement' | 'conversion' | 'retention' | 'performance'
export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut' | 'radar' | 'scatter' | 'heatmap'
export type ComparisonPeriod = 'previous-period' | 'previous-year' | 'custom'

export interface Metric {
  id: string
  name: string
  type: MetricType
  value: number
  previousValue: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  unit: 'currency' | 'number' | 'percentage' | 'time'
  icon: string
  color: string
}

export interface ChartData {
  id: string
  name: string
  type: ChartType
  data: DataPoint[]
  config: ChartConfig
}

export interface DataPoint {
  label: string
  value: number
  date?: Date
  category?: string
  metadata?: Record<string, any>
}

export interface ChartConfig {
  showLegend: boolean
  showGrid: boolean
  showTooltip: boolean
  colors: string[]
  height?: number
  stacked?: boolean
  smooth?: boolean
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  layout: DashboardLayout[]
  filters: DashboardFilter[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  isDefault: boolean
  isPublic: boolean
}

export interface DashboardLayout {
  id: string
  widgetId: string
  x: number
  y: number
  width: number
  height: number
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'text' | 'custom'
  title: string
  description?: string
  config: WidgetConfig
  dataSource: string
  refreshInterval?: number
}

export interface WidgetConfig {
  metric?: Metric
  chart?: ChartData
  table?: TableData
  customConfig?: Record<string, any>
}

export interface TableData {
  id: string
  columns: TableColumn[]
  rows: TableRow[]
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
  sorting?: {
    column: string
    direction: 'asc' | 'desc'
  }
}

export interface TableColumn {
  id: string
  name: string
  type: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'progress'
  width?: number
  sortable?: boolean
  filterable?: boolean
}

export interface TableRow {
  id: string
  data: Record<string, any>
}

export interface DashboardFilter {
  id: string
  name: string
  type: 'date-range' | 'select' | 'multi-select' | 'text' | 'number-range'
  value: any
  options?: FilterOption[]
}

export interface FilterOption {
  value: string
  label: string
}

export interface AnalyticsReport {
  id: string
  name: string
  description?: string
  type: 'revenue' | 'sales' | 'marketing' | 'operations' | 'custom'
  schedule?: ReportSchedule
  format: 'pdf' | 'excel' | 'csv' | 'json'
  recipients: string[]
  sections: ReportSection[]
  createdBy: string
  createdAt: Date
  lastGenerated?: Date
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  enabled: boolean
}

export interface ReportSection {
  id: string
  title: string
  type: 'metrics' | 'chart' | 'table' | 'text'
  content: any
  order: number
}

export interface Insight {
  id: string
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning' | 'achievement'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  metric?: string
  value?: number
  recommendation?: string
  createdAt: Date
  isRead: boolean
}

export interface Goal {
  id: string
  name: string
  description?: string
  metric: string
  target: number
  current: number
  progress: number
  startDate: Date
  endDate: Date
  status: 'on-track' | 'at-risk' | 'completed' | 'missed'
  assignedTo?: string
}

export interface FunnelStage {
  id: string
  name: string
  count: number
  percentage: number
  conversionRate?: number
  dropoffRate?: number
}

export interface Cohort {
  id: string
  name: string
  startDate: Date
  endDate: Date
  size: number
  retentionData: CohortRetention[]
}

export interface CohortRetention {
  period: number
  count: number
  percentage: number
}

export interface Segment {
  id: string
  name: string
  description?: string
  criteria: SegmentCriteria[]
  size: number
  createdAt: Date
  updatedAt: Date
}

export interface SegmentCriteria {
  field: string
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than' | 'in' | 'not-in'
  value: any
}

export interface AnalyticsStats {
  totalRevenue: number
  totalUsers: number
  activeUsers: number
  conversionRate: number
  averageOrderValue: number
  customerLifetimeValue: number
  churnRate: number
  retentionRate: number
  monthlyRecurringRevenue: number
  annualRecurringRevenue: number
  revenueGrowth: number
  userGrowth: number
  topMetrics: Metric[]
  insights: Insight[]
  goals: Goal[]
}
