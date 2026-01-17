"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import {
  X,
  Search,
  SlidersHorizontal,
  Download,
  RefreshCw,
  Plus,
  Columns,
  Filter,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Filter option type for column filters
export interface DataTableFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface DataTableFilterConfig {
  columnId: string
  title: string
  options: DataTableFilterOption[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  searchColumn?: string
  filterConfigs?: DataTableFilterConfig[]
  onExport?: () => void
  onRefresh?: () => void
  onAdd?: () => void
  addButtonLabel?: string
  showColumnToggle?: boolean
  showExport?: boolean
  showRefresh?: boolean
  showAdd?: boolean
  customActions?: React.ReactNode
  className?: string
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  searchColumn,
  filterConfigs = [],
  onExport,
  onRefresh,
  onAdd,
  addButtonLabel = "Add New",
  showColumnToggle = true,
  showExport = true,
  showRefresh = false,
  showAdd = false,
  customActions,
  className,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Handle global search
  const handleSearch = React.useCallback(
    (value: string) => {
      setGlobalFilter(value)
      if (searchColumn) {
        table.getColumn(searchColumn)?.setFilterValue(value)
      } else {
        table.setGlobalFilter(value)
      }
    },
    [table, searchColumn]
  )

  // Debounced search handler
  const debouncedSearch = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return (value: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => handleSearch(value), 300)
    }
  }, [handleSearch])

  // Reset all filters
  const resetFilters = React.useCallback(() => {
    table.resetColumnFilters()
    setGlobalFilter("")
    table.setGlobalFilter("")
  }, [table])

  // Get active filter count
  const activeFilterCount = table.getState().columnFilters.length

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main toolbar row */}
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search and filters */}
        <div className="flex flex-1 items-center gap-2">
          {/* Search input */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value)
                debouncedSearch(e.target.value)
              }}
              className="h-9 w-full pl-9 pr-9"
            />
            {globalFilter && (
              <button
                onClick={() => {
                  setGlobalFilter("")
                  handleSearch("")
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Column-specific filters */}
          {filterConfigs.map((config) => {
            const column = table.getColumn(config.columnId)
            if (!column) return null

            const selectedValues = new Set(
              (column.getFilterValue() as string[]) || []
            )

            return (
              <DropdownMenu key={config.columnId}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 border-dashed">
                    <Filter className="mr-2 h-4 w-4" />
                    {config.title}
                    {selectedValues.size > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 rounded-sm px-1 font-normal"
                      >
                        {selectedValues.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>{config.title}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {config.options.map((option) => {
                    const isSelected = selectedValues.has(option.value)
                    return (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const newValues = new Set(selectedValues)
                          if (checked) {
                            newValues.add(option.value)
                          } else {
                            newValues.delete(option.value)
                          }
                          const filterValues = Array.from(newValues)
                          column.setFilterValue(
                            filterValues.length > 0 ? filterValues : undefined
                          )
                        }}
                      >
                        {option.icon && (
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                  {selectedValues.size > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => column.setFilterValue(undefined)}
                      >
                        Clear filter
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}

          {/* Reset filters button */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="h-9 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Custom actions */}
          {customActions}

          {/* Add button */}
          {showAdd && onAdd && (
            <Button onClick={onAdd} size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}

          {/* Refresh button */}
          {showRefresh && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}

          {/* Export button */}
          {showExport && onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-9"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}

          {/* Column visibility toggle */}
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Columns className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id.replace(/_/g, " ")}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
