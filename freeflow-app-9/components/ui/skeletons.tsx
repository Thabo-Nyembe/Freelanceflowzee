"use client"

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Reusable Skeleton Components for Dashboard Pages
 * Consistent loading states across all V2 dashboard pages
 */

// ============================================================================
// TABLE SKELETON
// ============================================================================

interface TableSkeletonProps {
  rows?: number
  cols?: number
  showHeader?: boolean
  className?: string
}

export function TableSkeleton({
  rows = 5,
  cols = 5,
  showHeader = true,
  className
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Table Header */}
      {showHeader && (
        <div className="flex items-center gap-4 px-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton
              key={`header-${i}`}
              className={cn(
                "h-10",
                i === 0 ? "w-12" : "flex-1" // First column narrower (checkbox)
              )}
            />
          ))}
        </div>
      )}
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 px-4 py-2 border border-border rounded-lg"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={`row-${rowIndex}-col-${colIndex}`}
              className={cn(
                "h-8",
                colIndex === 0 ? "w-12" : "flex-1"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// CARD GRID SKELETON
// ============================================================================

interface CardGridSkeletonProps {
  count?: number
  columns?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  cardHeight?: string
  className?: string
}

export function CardGridSkeleton({
  count = 6,
  columns = { default: 1, md: 2, lg: 3 },
  cardHeight = "h-48",
  className
}: CardGridSkeletonProps) {
  const gridCols = cn(
    columns.default && `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`
  )

  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <Skeleton className={cn(cardHeight, "w-full rounded-lg")} />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// STATS CARDS SKELETON
// ============================================================================

interface StatsCardsSkeletonProps {
  count?: number
  columns?: number
  className?: string
}

export function StatsCardsSkeleton({
  count = 4,
  columns = 4,
  className
}: StatsCardsSkeletonProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
      columns === 4 && "grid-cols-2 md:grid-cols-4",
      columns === 5 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
      columns === 6 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// CHART SKELETON
// ============================================================================

interface ChartSkeletonProps {
  height?: string
  showLegend?: boolean
  showTitle?: boolean
  className?: string
}

export function ChartSkeleton({
  height = "h-80",
  showLegend = true,
  showTitle = true,
  className
}: ChartSkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-6 space-y-4", className)}>
      {/* Chart Title */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      )}

      {/* Chart Area */}
      <Skeleton className={cn(height, "w-full rounded-lg")} />

      {/* Legend */}
      {showLegend && (
        <div className="flex items-center justify-center gap-6 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// LIST SKELETON
// ============================================================================

interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  showAction?: boolean
  className?: string
}

export function ListSkeleton({
  items = 5,
  showAvatar = true,
  showAction = true,
  className
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-lg border border-border"
        >
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showAction && (
            <Skeleton className="h-8 w-20 rounded-md shrink-0" />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// FORM SKELETON
// ============================================================================

interface FormSkeletonProps {
  fields?: number
  showButtons?: boolean
  className?: string
}

export function FormSkeleton({
  fields = 4,
  showButtons = true,
  className
}: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      {showButtons && (
        <div className="flex items-center gap-4 pt-4">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// DASHBOARD PAGE SKELETON
// ============================================================================

interface DashboardSkeletonProps {
  showStats?: boolean
  showChart?: boolean
  showTable?: boolean
  showSidebar?: boolean
  className?: string
}

export function DashboardSkeleton({
  showStats = true,
  showChart = true,
  showTable = true,
  showSidebar = false,
  className
}: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && <StatsCardsSkeleton />}

      {/* Main Content Area */}
      <div className={cn(
        "grid gap-6",
        showSidebar ? "lg:grid-cols-3" : "grid-cols-1"
      )}>
        <div className={cn(showSidebar && "lg:col-span-2", "space-y-6")}>
          {/* Chart */}
          {showChart && <ChartSkeleton />}

          {/* Table */}
          {showTable && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-32 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <TableSkeleton rows={5} cols={5} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <ListSkeleton items={4} showAction={false} />
            </div>
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// DETAIL PAGE SKELETON
// ============================================================================

interface DetailPageSkeletonProps {
  showBreadcrumb?: boolean
  showTabs?: boolean
  className?: string
}

export function DetailPageSkeleton({
  showBreadcrumb = true,
  showTabs = true,
  className
}: DetailPageSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Tabs */}
      {showTabs && (
        <div className="border-b border-border">
          <div className="flex gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-20" />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </div>
          <ChartSkeleton height="h-64" />
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            <ListSkeleton items={3} showAction={false} />
          </div>
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-28" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL/DIALOG SKELETON
// ============================================================================

interface ModalSkeletonProps {
  className?: string
}

export function ModalSkeleton({ className }: ModalSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Modal Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Modal Body */}
      <FormSkeleton fields={3} showButtons={false} />

      {/* Modal Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  )
}

// ============================================================================
// KANBAN/BOARD SKELETON
// ============================================================================

interface KanbanSkeletonProps {
  columns?: number
  cardsPerColumn?: number
  className?: string
}

export function KanbanSkeleton({
  columns = 4,
  cardsPerColumn = 3,
  className
}: KanbanSkeletonProps) {
  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div
          key={colIndex}
          className="flex-shrink-0 w-72 bg-muted/50 rounded-lg p-4 space-y-3"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <Skeleton className="h-6 w-6 rounded" />
          </div>

          {/* Cards */}
          {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
            <div
              key={cardIndex}
              className="bg-card rounded-lg border border-border p-3 space-y-3"
            >
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2">
                  <Skeleton className="h-6 w-6 rounded-full border-2 border-card" />
                  <Skeleton className="h-6 w-6 rounded-full border-2 border-card" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}

          {/* Add Card Button */}
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// CALENDAR SKELETON
// ============================================================================

interface CalendarSkeletonProps {
  className?: string
}

export function CalendarSkeleton({ className }: CalendarSkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-6 space-y-4", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square p-1">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// TIMELINE SKELETON
// ============================================================================

interface TimelineSkeletonProps {
  items?: number
  className?: string
}

export function TimelineSkeleton({
  items = 5,
  className
}: TimelineSkeletonProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {/* Timeline Marker */}
          <div className="flex flex-col items-center">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            {i < items - 1 && (
              <Skeleton className="w-0.5 flex-1 min-h-[40px] my-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-8 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MEDIA GRID SKELETON
// ============================================================================

interface MediaGridSkeletonProps {
  items?: number
  aspectRatio?: "square" | "video" | "portrait"
  className?: string
}

export function MediaGridSkeleton({
  items = 9,
  aspectRatio = "square",
  className
}: MediaGridSkeletonProps) {
  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]"
  }

  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
      className
    )}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="group relative">
          <Skeleton className={cn(aspectClass[aspectRatio], "w-full rounded-lg")} />
          <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// SEARCH RESULTS SKELETON
// ============================================================================

interface SearchResultsSkeletonProps {
  results?: number
  className?: string
}

export function SearchResultsSkeleton({
  results = 5,
  className
}: SearchResultsSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Results */}
      {Array.from({ length: results }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-lg border border-border space-y-2"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex items-center gap-4 pt-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// PRICING CARDS SKELETON
// ============================================================================

interface PricingSkeletonProps {
  cards?: number
  className?: string
}

export function PricingSkeleton({
  cards = 3,
  className
}: PricingSkeletonProps) {
  return (
    <div className={cn(
      "grid gap-6",
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl border border-border bg-card p-6 space-y-6",
            i === 1 && "ring-2 ring-primary"
          )}
        >
          {/* Plan Name */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Features */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// EMPTY STATE SKELETON
// ============================================================================

interface EmptyStateSkeletonProps {
  className?: string
}

export function EmptyStateSkeleton({ className }: EmptyStateSkeletonProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 space-y-4", className)}>
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  )
}

// ============================================================================
// NOTIFICATION LIST SKELETON
// ============================================================================

interface NotificationSkeletonProps {
  items?: number
  className?: string
}

export function NotificationSkeleton({
  items = 5,
  className
}: NotificationSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50"
        >
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-2 w-2 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// SIDEBAR/NAVIGATION SKELETON
// ============================================================================

interface SidebarSkeletonProps {
  items?: number
  showHeader?: boolean
  className?: string
}

export function SidebarSkeleton({
  items = 8,
  showHeader = true,
  className
}: SidebarSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header/Logo */}
      {showHeader && (
        <div className="flex items-center gap-3 px-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-24" />
        </div>
      )}

      {/* Navigation Items */}
      <div className="space-y-1">
        {Array.from({ length: items }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
          >
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-full max-w-[140px]" />
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
