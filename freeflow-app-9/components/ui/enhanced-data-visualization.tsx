'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Download,
  Share2,
  Maximize2,
  Settings,
  Filter,
  Info,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced Chart Tooltip Component
interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  position?: { x: number; y: number }
  formatter?: (value: any, name: string, props: any) => React.ReactNode
}

export function EnhancedChartTooltip({
  active,
  payload,
  label,
  position,
  formatter
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div 
      className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm max-w-xs z-50"
      style={{
        position: 'absolute',
        left: position?.x || 0,
        top: position?.y || 0,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {label && (
        <div className="font-medium text-foreground mb-2 pb-2 border-b border-border">
          {label}
        </div>
      )}
      
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="font-medium text-foreground">
              {formatter ? formatter(entry.value, entry.name, entry) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Enhanced Chart Legend Component
interface LegendItem {
  name: string
  color: string
  value?: string | number
  visible?: boolean
}

interface EnhancedChartLegendProps {
  items: LegendItem[]
  position?: 'top' | 'bottom' | 'left' | 'right'
  onToggle?: (name: string) => void
  className?: string
}

export function EnhancedChartLegend({
  items,
  position = 'bottom',
  onToggle,
  className
}: EnhancedChartLegendProps) {
  const positionClasses = {
    top: 'flex-row flex-wrap justify-center mb-4',
    bottom: 'flex-row flex-wrap justify-center mt-4',
    left: 'flex-col mr-4',
    right: 'flex-col ml-4'
  }

  return (
    <div className={cn('flex gap-4', positionClasses[position], className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-2 text-sm transition-opacity cursor-pointer hover:opacity-80',
            item.visible === false && 'opacity-50'
          )}
          onClick={() => onToggle?.(item.name)}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            {onToggle && (
              <button className="ml-1 opacity-50 hover:opacity-100">
                {item.visible !== false ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
          {item.value && (
            <Badge variant="outline" className="text-xs h-5 px-1.5">
              {item.value}
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}

// Enhanced Chart Container
interface EnhancedChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  onExport?: () => void
  onShare?: () => void
  onSettings?: () => void
  onMaximize?: () => void
  isLoading?: boolean
  error?: string
  legend?: LegendItem[]
  onLegendToggle?: (name: string) => void
  filters?: React.ReactNode
  dateRange?: string
}

export function EnhancedChartContainer({
  title,
  description,
  children,
  className,
  onExport,
  onShare,
  onSettings,
  onMaximize,
  isLoading = false,
  error,
  legend,
  onLegendToggle,
  filters,
  dateRange
}: EnhancedChartContainerProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Card 
      className={cn('transition-all duration-300 hover:shadow-lg', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Chart Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {title}
              {dateRange && (
                <Badge variant="outline" className="text-xs font-normal">
                  {dateRange}
                </Badge>
              )}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          {/* Chart Actions */}
          <div className={cn(
            'flex items-center gap-1 opacity-0 transition-opacity duration-200',
            isHovered && 'opacity-100'
          )}>
            {filters}
            {onSettings && (
              <Button variant="ghost" size="sm" onClick={onSettings}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button variant="ghost" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onShare && (
              <Button variant="ghost" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            {onMaximize && (
              <Button variant="ghost" size="sm" onClick={onMaximize}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Chart Content */}
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-destructive mb-2">
              <Info className="h-8 w-8" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-3">
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Legend (top position) */}
            {legend && (
              <EnhancedChartLegend
                items={legend}
                position="top"
                onToggle={onLegendToggle}
              />
            )}
            
            {/* Chart */}
            <div className="relative">
              {children}
            </div>
            
            {/* Legend (bottom position) */}
            {legend && (
              <EnhancedChartLegend
                items={legend}
                position="bottom"
                onToggle={onLegendToggle}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Data Table with Export
interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  formatter?: (value: any) => React.ReactNode
  width?: string
}

interface EnhancedDataTableProps {
  data: Record<string, any>[]
  columns: DataTableColumn[]
  title?: string
  searchable?: boolean
  exportable?: boolean
  pagination?: boolean
  pageSize?: number
  className?: string
  onRowClick?: (row: Record<string, any>) => void
}

export function EnhancedDataTable({
  data,
  columns,
  title,
  searchable = true,
  exportable = true,
  pagination = true,
  pageSize = 10,
  className,
  onRowClick
}: EnhancedDataTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data
    
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData
    
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const exportToCSV = () => {
    const headers = columns.map(col => col.label).join(',')
    const rows = sortedData.map(row =>
      columns.map(col => {
        const value = row[col.key]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(',')
    ).join('\n')
    
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'data'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={cn('', className)}>
      {/* Table Header */}
      {(title || searchable || exportable) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            {title && <CardTitle>{title}</CardTitle>}
            
            <div className="flex items-center gap-2">
              {searchable && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1 text-sm border rounded-md bg-background"
                  />
                  <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              {exportable && (
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      {/* Table */}
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'text-left py-3 px-4 font-medium text-muted-foreground text-sm',
                      column.sortable && 'cursor-pointer hover:text-foreground',
                      column.width && `w-${column.width}`
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        sortDirection === 'asc' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    'border-b hover:bg-muted/50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="py-3 px-4 text-sm">
                      {column.formatter
                        ? column.formatter(row[column.key])
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



