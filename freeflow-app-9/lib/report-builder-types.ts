/**
 * Custom Report Builder Types
 * World-class type definitions for report building and analytics
 */

export type ReportType =
  | 'financial'
  | 'project-performance'
  | 'client-activity'
  | 'time-tracking'
  | 'resource-utilization'
  | 'sales-pipeline'
  | 'team-productivity'
  | 'custom'

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'radar'
  | 'funnel'
  | 'gauge'
  | 'heatmap'

export type DateRange =
  | 'today'
  | 'yesterday'
  | 'last-7-days'
  | 'last-30-days'
  | 'last-90-days'
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-year'
  | 'last-year'
  | 'custom'

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'png' | 'svg'

export type AggregationType = 'sum' | 'average' | 'count' | 'min' | 'max' | 'median'

export type FilterOperator =
  | 'equals'
  | 'not-equals'
  | 'greater-than'
  | 'less-than'
  | 'contains'
  | 'starts-with'
  | 'ends-with'
  | 'in'
  | 'not-in'
  | 'between'

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: ReportType
  icon: string
  category: string
  thumbnail: string
  premium: boolean
  widgets: Widget[]
  filters: Filter[]
  tags: string[]
  popularity: number
  createdAt: Date
  updatedAt: Date
}

export interface Widget {
  id: string
  type: 'chart' | 'table' | 'metric' | 'text' | 'image'
  title: string
  description?: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  data: WidgetData
  settings: WidgetSettings
  filters?: Filter[]
}

export interface WidgetData {
  source: string
  query?: string
  fields: string[]
  aggregation?: AggregationType
  groupBy?: string[]
  orderBy?: { field: string; direction: 'asc' | 'desc' }[]
  limit?: number
}

export interface WidgetSettings {
  chartType?: ChartType
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  showLabels?: boolean
  showTooltip?: boolean
  animate?: boolean
  responsive?: boolean
  fontSize?: number
  fontFamily?: string
  decimals?: number
  prefix?: string
  suffix?: string
  formatType?: 'number' | 'currency' | 'percentage' | 'date'
}

export interface Filter {
  id: string
  field: string
  operator: FilterOperator
  value: any
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'multi-select' | 'boolean'
  options?: Array<{ label: string; value: any }>
}

export interface Report {
  id: string
  name: string
  description: string
  type: ReportType
  templateId?: string
  widgets: Widget[]
  filters: Filter[]
  dateRange: {
    type: DateRange
    from?: Date
    to?: Date
  }
  settings: ReportSettings
  metadata: {
    createdBy: string
    createdAt: Date
    updatedAt: Date
    lastRun?: Date
    runCount: number
    isFavorite: boolean
    isShared: boolean
    sharedWith?: string[]
    tags: string[]
  }
}

export interface ReportSettings {
  refreshInterval?: number // in minutes
  autoRefresh: boolean
  showFilters: boolean
  showTitle: boolean
  showDescription: boolean
  showDate: boolean
  layout: 'grid' | 'list' | 'masonry'
  theme: 'light' | 'dark' | 'auto'
  pageSize?: 'A4' | 'letter' | 'custom'
  orientation?: 'portrait' | 'landscape'
}

export interface ReportSchedule {
  id: string
  reportId: string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  time: string // HH:mm
  timezone: string
  recipients: string[]
  format: ExportFormat
  enabled: boolean
  lastRun?: Date
  nextRun: Date
}

export interface DataSource {
  id: string
  name: string
  type: 'database' | 'api' | 'file' | 'integration'
  connection: {
    host?: string
    port?: number
    database?: string
    username?: string
    apiKey?: string
    endpoint?: string
  }
  schema: DataSchema
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: Date
}

export interface DataSchema {
  tables: Array<{
    name: string
    fields: Array<{
      name: string
      type: 'string' | 'number' | 'boolean' | 'date' | 'json'
      label: string
      description?: string
    }>
  }>
}

export interface ReportExport {
  id: string
  reportId: string
  format: ExportFormat
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  url?: string
  fileSize?: number
  createdAt: Date
  completedAt?: Date
  expiresAt?: Date
  error?: string
}

export interface MetricCard {
  id: string
  label: string
  value: number | string
  change?: number
  changeLabel?: string
  trend: 'up' | 'down' | 'neutral'
  icon?: string
  color?: string
  prefix?: string
  suffix?: string
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }>
}

export interface TableData {
  columns: Array<{
    id: string
    label: string
    type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'link'
    sortable?: boolean
    width?: number
  }>
  rows: Array<Record<string, any>>
  totalRows?: number
  currentPage?: number
  pageSize?: number
}
