"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Icons
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  User,
  Tag,
  SortAsc,
  SortDesc,
  RotateCcw,
  Save,
  Bookmark,
  Star,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  FileText,
  Image,
  Video,
  Mic,
  ChevronDown,
  ChevronUp
} from "lucide-react"

// Types
import { Comment, CommentStatus, CommentPriority, CommentType } from "./universal-pinpoint-feedback-system-enhanced"

export interface FilterCriteria {
  searchQuery: string
  status: CommentStatus[]
  priority: CommentPriority[]
  type: CommentType[]
  authors: string[]
  assignees: string[]
  tags: string[]
  dateRange: {
    from: Date | null
    to: Date | null
    preset?: string
  }
  attachmentTypes: string[]
  hasAttachments: boolean | null
  hasVoiceNote: boolean | null
  hasReplies: boolean | null
  replyCountRange: [number, number]
  sentimentFilter: string[]
  aiConfidenceRange: [number, number]
  customFields: Record<string, any>
}

export interface SavedFilter {
  id: string
  name: string
  description?: string
  criteria: FilterCriteria
  isDefault: boolean
  createdAt: string
  lastUsed: string
  useCount: number
}

export interface SortOption {
  field: string
  direction: "asc" | "desc"
  label: string
}

interface AdvancedCommentFiltersProps {
  comments: Comment[]
  onFiltersChange: (criteria: FilterCriteria) => void
  onSortChange: (sort: SortOption) => void
  className?: string
  initialFilters?: Partial<FilterCriteria>
  availableUsers?: Array<{ id: string; name: string; avatar?: string }>
  availableTags?: string[]
  savedFilters?: SavedFilter[]
  onSaveFilter?: (filter: Omit<SavedFilter, "id" | "createdAt" | "lastUsed" | "useCount">) => void
  onLoadFilter?: (filter: SavedFilter) => void
  onDeleteFilter?: (filterId: string) => void
}

const defaultFilters: FilterCriteria = {
  searchQuery: "",
  status: [],
  priority: [],
  type: [],
  authors: [],
  assignees: [],
  tags: [],
  dateRange: { from: null, to: null },
  attachmentTypes: [],
  hasAttachments: null,
  hasVoiceNote: null,
  hasReplies: null,
  replyCountRange: [0, 100],
  sentimentFilter: [],
  aiConfidenceRange: [0, 100],
  customFields: {}
}

const sortOptions: SortOption[] = [
  { field: "createdAt", direction: "desc", label: "Newest First" },
  { field: "createdAt", direction: "asc", label: "Oldest First" },
  { field: "updatedAt", direction: "desc", label: "Recently Updated" },
  { field: "priority", direction: "desc", label: "Priority (High to Low)" },
  { field: "priority", direction: "asc", label: "Priority (Low to High)" },
  { field: "status", direction: "asc", label: "Status" },
  { field: "author", direction: "asc", label: "Author (A-Z)" },
  { field: "replies", direction: "desc", label: "Most Replies" },
  { field: "relevance", direction: "desc", label: "Relevance" }
]

const datePresets = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "thisWeek" },
  { label: "Last Week", value: "lastWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Last 30 Days", value: "last30" },
  { label: "Last 90 Days", value: "last90" },
  { label: "This Year", value: "thisYear" }
]

export function AdvancedCommentFilters({
  comments,
  onFiltersChange,
  onSortChange,
  className,
  initialFilters = {},
  availableUsers = [],
  availableTags = [],
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter
}: AdvancedCommentFiltersProps) {
  const [filters, setFilters] = useState<FilterCriteria>({ ...defaultFilters, ...initialFilters })
  const [currentSort, setCurrentSort] = useState<SortOption>(sortOptions[0])
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [filterDescription, setFilterDescription] = useState("")

  // Calculate active filter count
  useEffect(() => {
    let count = 0
    if (filters.searchQuery) count++
    if (filters.status.length > 0) count++
    if (filters.priority.length > 0) count++
    if (filters.type.length > 0) count++
    if (filters.authors.length > 0) count++
    if (filters.assignees.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.attachmentTypes.length > 0) count++
    if (filters.hasAttachments !== null) count++
    if (filters.hasVoiceNote !== null) count++
    if (filters.hasReplies !== null) count++
    if (filters.sentimentFilter.length > 0) count++

    setActiveFilterCount(count)
  }, [filters])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.searchQuery.length > 2) {
        performAdvancedSearch(filters.searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters.searchQuery])

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  // Advanced search function
  const performAdvancedSearch = useCallback(async (query: string) => {
    setIsSearching(true)
    try {
      // Simulate advanced search with fuzzy matching, semantic search, etc.
      const results = comments.filter(comment => {
        const searchableText = [
          comment.content,
          comment.author.name,
          comment.author.email,
          ...(comment.labels || []),
          ...(comment.mentionedUsers || []),
          ...comment.replies.map(r => r.content),
          ...comment.replies.map(r => r.author.name)
        ].join(" ").toLowerCase()

        // Simple fuzzy search simulation
        const queryWords = query.toLowerCase().split(/\s+/)
        return queryWords.some(word => searchableText.includes(word))
      })

      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }, [comments])

  // Update specific filter
  const updateFilter = useCallback(<K extends keyof FilterCriteria>(
    key: K,
    value: FilterCriteria[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Toggle array filter
  const toggleArrayFilter = useCallback(<K extends keyof FilterCriteria>(
    key: K,
    value: any
  ) => {
    setFilters(prev => {
      const currentArray = prev[key] as unknown[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
    setCurrentSort(sortOptions[0])
  }, [])

  // Apply date preset
  const applyDatePreset = useCallback((preset: string) => {
    const now = new Date()
    let from: Date | null = null
    let to: Date | null = null

    switch (preset) {
      case "today":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case "yesterday":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59)
        break
      case "thisWeek":
        from = startOfWeek(now)
        to = endOfWeek(now)
        break
      case "lastWeek":
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        from = startOfWeek(lastWeek)
        to = endOfWeek(lastWeek)
        break
      case "thisMonth":
        from = startOfMonth(now)
        to = endOfMonth(now)
        break
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        from = startOfMonth(lastMonth)
        to = endOfMonth(lastMonth)
        break
      case "last30":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        to = now
        break
      case "last90":
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        to = now
        break
      case "thisYear":
        from = new Date(now.getFullYear(), 0, 1)
        to = now
        break
    }

    updateFilter("dateRange", { from, to, preset })
  }, [updateFilter])

  // Save current filter
  const saveCurrentFilter = useCallback(() => {
    if (!onSaveFilter || !filterName.trim()) return

    const newFilter: Omit<SavedFilter, "id" | "createdAt" | "lastUsed" | "useCount"> = {
      name: filterName.trim(),
      description: filterDescription.trim() || undefined,
      criteria: filters,
      isDefault: false
    }

    onSaveFilter(newFilter)
    setShowSaveDialog(false)
    setFilterName("")
    setFilterDescription("")
  }, [onSaveFilter, filterName, filterDescription, filters])

  // Load saved filter
  const loadSavedFilter = useCallback((filter: SavedFilter) => {
    setFilters(filter.criteria)
    if (onLoadFilter) {
      onLoadFilter(filter)
    }
  }, [onLoadFilter])

  // Extracted components for better organization
  const QuickFilters = () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={filters.status.includes("open") ? "default" : "outline"}
        size="sm"
        onClick={() => toggleArrayFilter("status", "open")}
      >
        <AlertTriangle className="w-3 h-3 mr-1" />
        Open
      </Button>
      <Button
        variant={filters.status.includes("resolved") ? "default" : "outline"}
        size="sm"
        onClick={() => toggleArrayFilter("status", "resolved")}
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        Resolved
      </Button>
      <Button
        variant={filters.priority.includes("high") ? "default" : "outline"}
        size="sm"
        onClick={() => toggleArrayFilter("priority", "high")}
      >
        <Star className="w-3 h-3 mr-1" />
        High Priority
      </Button>
      <Button
        variant={filters.hasVoiceNote === true ? "default" : "outline"}
        size="sm"
        onClick={() => updateFilter("hasVoiceNote", filters.hasVoiceNote === true ? null : true)}
      >
        <Mic className="w-3 h-3 mr-1" />
        Voice Notes
      </Button>
      <Button
        variant={filters.hasAttachments === true ? "default" : "outline"}
        size="sm"
        onClick={() => updateFilter("hasAttachments", filters.hasAttachments === true ? null : true)}
      >
        <FileText className="w-3 h-3 mr-1" />
        Attachments
      </Button>
    </div>
  )

  const AdvancedFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex flex-wrap gap-1">
          {(["open", "in_progress", "resolved", "wont_fix"] as CommentStatus[]).map(status => (
            <Button
              key={status}
              variant={filters.status.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter("status", status)}
            >
              {status.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <Label>Priority</Label>
        <div className="flex flex-wrap gap-1">
          {(["low", "medium", "high", "critical"] as CommentPriority[]).map(priority => (
            <Button
              key={priority}
              variant={filters.priority.includes(priority) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter("priority", priority)}
              className={cn(
                priority === "critical" && "border-red-500 text-red-500",
                priority === "high" && "border-orange-500 text-orange-500",
                priority === "medium" && "border-yellow-500 text-yellow-500",
                priority === "low" && "border-green-500 text-green-500"
              )}
            >
              {priority}
            </Button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div className="space-y-2">
        <Label>Comment Type</Label>
        <div className="flex flex-wrap gap-1">
          {(["text", "voice", "screen", "drawing"] as CommentType[]).map(type => (
            <Button
              key={type}
              variant={filters.type.includes(type) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter("type", type)}
            >
              {type === "voice" && <Mic className="w-3 h-3 mr-1" />}
              {type === "screen" && <Video className="w-3 h-3 mr-1" />}
              {type === "drawing" && <Image className="w-3 h-3 mr-1"  loading="lazy"/>}
              {type === "text" && <MessageCircle className="w-3 h-3 mr-1" />}
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Authors Filter */}
      <div className="space-y-2">
        <Label>Authors</Label>
        <Command>
          <CommandInput placeholder="Search authors..." />
          <CommandList className="max-h-32">
            <CommandEmpty>No authors found.</CommandEmpty>
            <CommandGroup>
              {availableUsers.map(user => (
                <CommandItem
                  key={user.id}
                  onSelect={() => toggleArrayFilter("authors", user.id)}
                >
                  <Checkbox
                    checked={filters.authors.includes(user.id)}
                    className="mr-2"
                  />
                  <User className="w-3 h-3 mr-2" />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="space-y-2">
          <Select value={filters.dateRange.preset || ""} onValueChange={applyDatePreset}>
            <SelectTrigger>
              <SelectValue placeholder="Select preset..." />
            </SelectTrigger>
            <SelectContent>
              {datePresets.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from || undefined}
                selected={{
                  from: filters.dateRange.from || undefined,
                  to: filters.dateRange.to || undefined
                }}
                onSelect={(range) => updateFilter("dateRange", {
                  from: range?.from || null,
                  to: range?.to || null,
                  preset: undefined
                })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
          {availableTags.map(tag => (
            <Button
              key={tag}
              variant={filters.tags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter("tags", tag)}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <Card className={cn("space-y-4", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search comments, authors, content..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => updateFilter("searchQuery", "")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          {isSearching && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label>Sort by:</Label>
            <Select
              value={`${currentSort.field}-${currentSort.direction}`}
              onValueChange={(value) => {
                const [field, direction] = value.split("-")
                const newSort = sortOptions.find(s => s.field === field && s.direction === direction)
                if (newSort) {
                  setCurrentSort(newSort)
                  onSortChange(newSort)
                }
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={`${option.field}-${option.direction}`} value={`${option.field}-${option.direction}`}>
                    <div className="flex items-center">
                      {option.direction === "asc" ? <SortAsc className="w-3 h-3 mr-2" /> : <SortDesc className="w-3 h-3 mr-2" />}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Saved Filters */}
          <div className="flex items-center space-x-2">
            {savedFilters.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-3 h-3 mr-1" />
                    Saved
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Saved Filters</h4>
                    <ScrollArea className="max-h-48">
                      {savedFilters.map(filter => (
                        <div key={filter.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                          <div className="flex-1 cursor-pointer" onClick={() => loadSavedFilter(filter)}>
                            <div className="font-medium text-sm">{filter.name}</div>
                            {filter.description && (
                              <div className="text-xs text-muted-foreground">{filter.description}</div>
                            )}
                          </div>
                          {onDeleteFilter && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteFilter(filter.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {onSaveFilter && (
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <Label className="text-sm mb-2 block">Quick Filters</Label>
          <QuickFilters />
        </div>

        {/* Advanced Filters (Expandable) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <Separator />
              <AdvancedFilters />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Active Filters ({activeFilterCount})</Label>
            <div className="flex flex-wrap gap-1">
              {filters.searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{filters.searchQuery}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 ml-1"
                    onClick={() => updateFilter("searchQuery", "")}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </Badge>
              )}
              {filters.status.map(status => (
                <Badge key={status} variant="secondary" className="text-xs">
                  Status: {status}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 ml-1"
                    onClick={() => toggleArrayFilter("status", status)}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </Badge>
              ))}
              {/* Add more active filter badges as needed */}
            </div>
          </div>
        )}
      </CardContent>

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Save Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Filter Name</Label>
                <Input
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="e.g., High Priority Open Issues"
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Input
                  value={filterDescription}
                  onChange={(e) => setFilterDescription(e.target.value)}
                  placeholder="Brief description of this filter"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCurrentFilter} disabled={!filterName.trim()}>
                  Save Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}