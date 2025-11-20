/**
 * Reporting & Export Types
 * Advanced reporting system with customizable templates and exports
 */

export type ReportType = 'financial' | 'sales' | 'marketing' | 'operations' | 'analytics' | 'custom'
export type ReportStatus = 'draft' | 'scheduled' | 'generated' | 'shared' | 'archived'
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html'
export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'heatmap' | 'table'
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type DataSourceType = 'analytics' | 'crm' | 'invoices' | 'leads' | 'campaigns' | 'projects' | 'custom'

export interface Report {
  id: string
  name: string
  description: string
  type: ReportType
  status: ReportStatus
  template: ReportTemplate
  sections: ReportSection[]
  schedule?: ReportSchedule
  recipients: string[]
  lastGenerated?: Date
  createdAt: Date
  createdBy: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: ReportType
  icon: string
  defaultSections: string[]
  dataSources: DataSourceType[]
  previewImage?: string
  isCustom: boolean
}

export interface ReportSection {
  id: string
  type: 'metric' | 'chart' | 'table' | 'text' | 'image' | 'divider'
  title: string
  description?: string
  position: number
  config: SectionConfig
  dataSource?: DataSourceType
  visible: boolean
}

export interface SectionConfig {
  chartType?: ChartType
  metrics?: string[]
  columns?: TableColumn[]
  filters?: DataFilter[]
  groupBy?: string
  sortBy?: string
  limit?: number
  customQuery?: string
}

export interface TableColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'status'
  width?: string
  sortable?: boolean
  filterable?: boolean
}

export interface DataFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in'
  value: any
}

export interface ReportSchedule {
  frequency: ScheduleFrequency
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
  timezone: string
  enabled: boolean
  nextRun?: Date
}

export interface ExportConfig {
  format: ExportFormat
  includeCharts: boolean
  includeRawData: boolean
  pageSize?: 'A4' | 'Letter' | 'Legal'
  orientation?: 'portrait' | 'landscape'
  compression?: boolean
}

export interface ReportMetrics {
  totalReports: number
  scheduledReports: number
  reportsGenerated: number
  averageGenerationTime: number
  mostUsedTemplate: string
  totalExports: number
  exportsByFormat: Record<ExportFormat, number>
}

export interface SharedReport {
  id: string
  reportId: string
  sharedWith: string[]
  permissions: SharePermission[]
  expiresAt?: Date
  accessCount: number
  shareLink: string
}

export interface SharePermission {
  userId: string
  canView: boolean
  canEdit: boolean
  canExport: boolean
  canShare: boolean
}
