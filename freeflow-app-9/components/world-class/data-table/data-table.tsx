"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  GlobalFilterFn,
  FilterFn,
  Row,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { FileX, Database, RefreshCw, AlertCircle } from "lucide-react"

import {
  DataTablePagination,
} from "./data-table-pagination"
import {
  DataTableToolbar,
  DataTableFilterConfig,
} from "./data-table-toolbar"
import { DataTableColumnHeader } from "./data-table-column-header"
import {
  DataTableRowActions,
  DataTableRowAction,
  DataTableRowActionGroup,
} from "./data-table-row-actions"

// Fuzzy filter function for column search
const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
  const cellValue = row.getValue(columnId)
  if (cellValue === null || cellValue === undefined) return false
  const search = String(value).toLowerCase()
  return String(cellValue).toLowerCase().includes(search)
}

// Global fuzzy filter function
const globalFuzzyFilter: GlobalFilterFn<any> = (row, columnId, filterValue) => {
  const search = filterValue.toLowerCase()

  // Search across all columns
  const values = row.getAllCells().map((cell) => {
    const value = cell.getValue()
    if (value === null || value === undefined) return ""
    return String(value).toLowerCase()
  })

  return values.some((value) => value.includes(search))
}

// Array filter for multi-select column filters
const arrayFilter: FilterFn<any> = (row, columnId, filterValues: string[]) => {
  if (!filterValues || filterValues.length === 0) return true
  const value = row.getValue(columnId)
  return filterValues.includes(String(value))
}

// Empty state component
interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

function EmptyState({
  title = "No results found",
  description = "Try adjusting your search or filter to find what you're looking for.",
  icon = <FileX className="h-12 w-12 text-muted-foreground" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      {icon}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Loading skeleton component
interface LoadingSkeletonProps {
  columns: number
  rows?: number
}

function LoadingSkeleton({ columns, rows = 5 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

// Error state component
interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading the data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  )
}

// Main DataTable props
export interface DataTableProps<TData, TValue> {
  // Data and columns
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // Loading and error states
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void

  // Empty state customization
  emptyState?: EmptyStateProps

  // Row selection
  enableRowSelection?: boolean
  onRowSelectionChange?: (selectedRows: TData[]) => void

  // Sorting
  enableSorting?: boolean
  defaultSorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void

  // Filtering
  enableFiltering?: boolean
  enableGlobalFilter?: boolean
  searchPlaceholder?: string
  searchColumn?: string
  filterConfigs?: DataTableFilterConfig[]

  // Pagination
  enablePagination?: boolean
  defaultPageSize?: number
  pageSizeOptions?: number[]

  // Column visibility
  enableColumnVisibility?: boolean
  defaultColumnVisibility?: VisibilityState

  // Actions
  onExport?: () => void
  onRefresh?: () => void
  onAdd?: () => void
  addButtonLabel?: string
  showExport?: boolean
  showRefresh?: boolean
  showAdd?: boolean
  customToolbarActions?: React.ReactNode

  // Row actions
  rowActions?: DataTableRowAction<TData>[]
  rowActionGroups?: DataTableRowActionGroup<TData>[]
  onRowView?: (row: TData) => void
  onRowEdit?: (row: TData) => void
  onRowDelete?: (row: TData) => void
  onRowCopy?: (row: TData) => void

  // Styling
  className?: string
  tableClassName?: string

  // Row click handler
  onRowClick?: (row: TData) => void

  // Custom row key
  getRowId?: (row: TData) => string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyState,
  enableRowSelection = false,
  onRowSelectionChange,
  enableSorting = true,
  defaultSorting = [],
  onSortingChange,
  enableFiltering = true,
  enableGlobalFilter = true,
  searchPlaceholder = "Search...",
  searchColumn,
  filterConfigs = [],
  enablePagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  enableColumnVisibility = true,
  defaultColumnVisibility = {},
  onExport,
  onRefresh,
  onAdd,
  addButtonLabel = "Add New",
  showExport = true,
  showRefresh = false,
  showAdd = false,
  customToolbarActions,
  rowActions,
  rowActionGroups,
  onRowView,
  onRowEdit,
  onRowDelete,
  onRowCopy,
  className,
  tableClassName,
  onRowClick,
  getRowId,
}: DataTableProps<TData, TValue>) {
  // State
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(defaultColumnVisibility)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Build selection column if row selection is enabled
  const selectionColumn: ColumnDef<TData, any> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }

  // Build actions column if row actions are provided
  const hasRowActions =
    rowActions?.length ||
    rowActionGroups?.length ||
    onRowView ||
    onRowEdit ||
    onRowDelete ||
    onRowCopy

  const actionsColumn: ColumnDef<TData, any> = {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        actions={rowActions}
        actionGroups={rowActionGroups}
        onView={onRowView}
        onEdit={onRowEdit}
        onDelete={onRowDelete}
        onCopy={onRowCopy}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }

  // Build final columns array
  const finalColumns = React.useMemo(() => {
    const cols: ColumnDef<TData, any>[] = []

    if (enableRowSelection) {
      cols.push(selectionColumn)
    }

    cols.push(...columns)

    if (hasRowActions) {
      cols.push(actionsColumn)
    }

    return cols
  }, [columns, enableRowSelection, hasRowActions])

  // Create table instance
  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater
      setSorting(newSorting)
      onSortingChange?.(newSorting)
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    globalFilterFn: globalFuzzyFilter,
    filterFns: {
      fuzzy: fuzzyFilter,
      array: arrayFilter,
    },
    getRowId,
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
  })

  // Notify parent of row selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original)
      onRowSelectionChange(selectedRows)
    }
  }, [rowSelection, onRowSelectionChange, table])

  // Export handler - generates CSV
  const handleExport = React.useCallback(() => {
    if (onExport) {
      onExport()
      return
    }

    // Default CSV export
    const visibleColumns = table.getVisibleFlatColumns().filter(
      (col) => col.id !== "select" && col.id !== "actions"
    )

    const headers = visibleColumns.map((col) => col.id).join(",")

    const rows = table.getFilteredRowModel().rows.map((row) => {
      return visibleColumns
        .map((col) => {
          const value = row.getValue(col.id)
          // Escape values with commas or quotes
          const stringValue = String(value ?? "")
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        .join(",")
    })

    const csv = [headers, ...rows].join("\n")

    // Download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [onExport, table])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      {(enableFiltering || enableColumnVisibility || showExport || showRefresh || showAdd) && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          searchColumn={searchColumn}
          filterConfigs={filterConfigs}
          onExport={handleExport}
          onRefresh={onRefresh}
          onAdd={onAdd}
          addButtonLabel={addButtonLabel}
          showColumnToggle={enableColumnVisibility}
          showExport={showExport}
          showRefresh={showRefresh}
          showAdd={showAdd}
          customActions={customToolbarActions}
        />
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table className={tableClassName}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* Loading state */}
            {isLoading && (
              <LoadingSkeleton
                columns={finalColumns.length}
                rows={defaultPageSize}
              />
            )}

            {/* Error state */}
            {!isLoading && isError && (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length}
                  className="h-24 text-center"
                >
                  <ErrorState
                    description={errorMessage}
                    onRetry={onRetry}
                  />
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading && !isError && table.getRowModel().rows?.length > 0 && (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}

            {/* Empty state */}
            {!isLoading && !isError && table.getRowModel().rows?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length}
                  className="h-24 text-center"
                >
                  <EmptyState
                    title={emptyState?.title}
                    description={emptyState?.description}
                    icon={emptyState?.icon}
                    action={emptyState?.action}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && !isLoading && !isError && data.length > 0 && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          showRowsSelected={enableRowSelection}
        />
      )}
    </div>
  )
}

// Re-export helper components for custom column definitions
export { DataTableColumnHeader } from "./data-table-column-header"
export { DataTableRowActions } from "./data-table-row-actions"
export type { DataTableRowAction, DataTableRowActionGroup } from "./data-table-row-actions"
export type { DataTableFilterConfig, DataTableFilterOption } from "./data-table-toolbar"
