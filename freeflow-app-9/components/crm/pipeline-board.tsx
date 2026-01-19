'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Building2,
  Calendar,
  ChevronDown,
  DollarSign,
  Filter,
  GripVertical,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pause,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Mail,
  Archive,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export interface PipelineStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
  is_won: boolean
  is_lost: boolean
  rotting_days: number | null
}

export interface Deal {
  id: string
  name: string
  value: number
  probability: number
  stage_id: string
  status: 'open' | 'won' | 'lost' | 'on_hold'
  expected_close_date: string | null
  owner_id: string | null
  company_id: string | null
  contact_id: string | null
  created_at: string
  updated_at: string
  company?: {
    id: string
    name: string
    logo_url?: string
  }
  contact?: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
  owner?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  tags?: string[]
  custom_fields?: Record<string, any>
  last_activity_at?: string
  next_activity_at?: string
}

export interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
  settings?: {
    require_close_reason?: boolean
    auto_assign_owner?: boolean
  }
}

export interface PipelineBoardProps {
  pipeline: Pipeline
  deals: Deal[]
  onDealMove?: (dealId: string, fromStageId: string, toStageId: string) => Promise<void>
  onDealClick?: (deal: Deal) => void
  onDealCreate?: (stageId: string) => void
  onDealEdit?: (deal: Deal) => void
  onDealDelete?: (dealId: string) => void
  onStageSettingsClick?: (stage: PipelineStage) => void
  isLoading?: boolean
  showFilters?: boolean
  showSearch?: boolean
  showStageStats?: boolean
  compactMode?: boolean
  className?: string
}

interface StageColumnProps {
  stage: PipelineStage
  deals: Deal[]
  onDealClick?: (deal: Deal) => void
  onDealCreate?: () => void
  onDealEdit?: (deal: Deal) => void
  onDealDelete?: (dealId: string) => void
  onSettingsClick?: () => void
  showStats?: boolean
  compactMode?: boolean
  isOver?: boolean
}

interface DealCardProps {
  deal: Deal
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isDragging?: boolean
  compactMode?: boolean
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'No date set'
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `In ${diffDays} days`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getDealHealthStatus(deal: Deal, rotting_days: number | null): 'healthy' | 'warning' | 'critical' {
  if (!rotting_days) return 'healthy'

  const daysSinceUpdate = (Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)

  if (daysSinceUpdate > rotting_days) return 'critical'
  if (daysSinceUpdate > rotting_days * 0.7) return 'warning'
  return 'healthy'
}

// =============================================================================
// SORTABLE DEAL CARD
// =============================================================================

function SortableDealCard({
  deal,
  onClick,
  onEdit,
  onDelete,
  compactMode,
  rotting_days,
}: DealCardProps & { rotting_days: number | null }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const health = getDealHealthStatus(deal, rotting_days)
  const isOverdue = deal.expected_close_date && new Date(deal.expected_close_date) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-lg border shadow-sm transition-all',
        'hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-blue-500',
        health === 'critical' && 'border-l-4 border-l-red-500',
        health === 'warning' && 'border-l-4 border-l-yellow-500',
        compactMode ? 'p-2' : 'p-3'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {/* Card Content */}
      <div className="pl-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <button
            onClick={onClick}
            className="text-left flex-1 font-medium text-sm hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
          >
            {deal.name}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Deal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Company & Contact */}
        {!compactMode && (deal.company || deal.contact) && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
            {deal.company && (
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{deal.company.name}</span>
              </div>
            )}
            {deal.contact && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[80px]">
                  {deal.contact.first_name} {deal.contact.last_name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Value & Probability */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(deal.value)}
          </span>
          <Badge variant="secondary" className="text-xs">
            {deal.probability}%
          </Badge>
        </div>

        {/* Close Date */}
        <div className={cn(
          'flex items-center gap-1 text-xs',
          isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
        )}>
          <Calendar className="h-3 w-3" />
          <span>{formatDate(deal.expected_close_date)}</span>
          {isOverdue && <AlertTriangle className="h-3 w-3" />}
        </div>

        {/* Owner Avatar */}
        {deal.owner && !compactMode && (
          <div className="flex items-center justify-end mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={deal.owner.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {getInitials(deal.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{deal.owner.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && !compactMode && (
          <div className="flex flex-wrap gap-1 mt-2">
            {deal.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs py-0">
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 2 && (
              <Badge variant="outline" className="text-xs py-0">
                +{deal.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Health Indicator */}
        {health !== 'healthy' && (
          <div className={cn(
            'absolute top-2 right-2 h-2 w-2 rounded-full',
            health === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
          )} />
        )}
      </div>
    </div>
  )
}

// =============================================================================
// STAGE COLUMN COMPONENT
// =============================================================================

function StageColumn({
  stage,
  deals,
  onDealClick,
  onDealCreate,
  onDealEdit,
  onDealDelete,
  onSettingsClick,
  showStats = true,
  compactMode = false,
  isOver = false,
}: StageColumnProps) {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
  const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * (deal.probability / 100)), 0)
  const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0

  return (
    <div
      className={cn(
        'flex flex-col bg-gray-50 dark:bg-gray-900 rounded-lg min-w-[280px] max-w-[320px]',
        isOver && 'ring-2 ring-blue-500 ring-opacity-50'
      )}
    >
      {/* Stage Header */}
      <div
        className="flex items-center justify-between p-3 border-b dark:border-gray-700"
        style={{ borderTopColor: stage.color, borderTopWidth: 3 }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{stage.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {deals.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDealCreate}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="h-4 w-4 mr-2" />
                Stage Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive Deals
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stage Stats */}
      {showStats && (
        <div className="p-2 border-b dark:border-gray-700 bg-white dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total: {formatCurrency(totalValue)}</span>
            <span>Weighted: {formatCurrency(weightedValue)}</span>
          </div>
          <div className="mt-1">
            <Progress value={stage.probability} className="h-1" />
          </div>
        </div>
      )}

      {/* Deals List */}
      <ScrollArea className="flex-1 p-2" style={{ height: 'calc(100vh - 300px)' }}>
        <SortableContext
          items={deals.map(d => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {deals.map(deal => (
              <SortableDealCard
                key={deal.id}
                deal={deal}
                onClick={() => onDealClick?.(deal)}
                onEdit={() => onDealEdit?.(deal)}
                onDelete={() => onDealDelete?.(deal.id)}
                compactMode={compactMode}
                rotting_days={stage.rotting_days}
              />
            ))}
          </div>
        </SortableContext>

        {deals.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No deals in this stage</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={onDealCreate}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Deal
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// =============================================================================
// MAIN PIPELINE BOARD COMPONENT
// =============================================================================

export function PipelineBoard({
  pipeline,
  deals,
  onDealMove,
  onDealClick,
  onDealCreate,
  onDealEdit,
  onDealDelete,
  onStageSettingsClick,
  isLoading = false,
  showFilters = true,
  showSearch = true,
  showStageStats = true,
  compactMode = false,
  className,
}: PipelineBoardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [filterOwner, setFilterOwner] = useState<string | null>(null)
  const [filterValue, setFilterValue] = useState<{ min: number; max: number } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const filtered = deals.filter(deal => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = deal.name.toLowerCase().includes(query)
        const matchesCompany = deal.company?.name.toLowerCase().includes(query)
        const matchesContact = deal.contact
          ? `${deal.contact.first_name} ${deal.contact.last_name}`.toLowerCase().includes(query)
          : false
        if (!matchesName && !matchesCompany && !matchesContact) return false
      }

      // Owner filter
      if (filterOwner && deal.owner_id !== filterOwner) return false

      // Value filter
      if (filterValue) {
        if (deal.value < filterValue.min || deal.value > filterValue.max) return false
      }

      return true
    })

    const grouped: Record<string, Deal[]> = {}
    pipeline.stages.forEach(stage => {
      grouped[stage.id] = filtered.filter(deal => deal.stage_id === stage.id)
    })
    return grouped
  }, [deals, pipeline.stages, searchQuery, filterOwner, filterValue])

  // Get active deal for drag overlay
  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null

  // Calculate totals
  const totalDeals = deals.filter(d => d.status === 'open').length
  const totalValue = deals.filter(d => d.status === 'open').reduce((sum, d) => sum + d.value, 0)
  const totalWeighted = deals
    .filter(d => d.status === 'open')
    .reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0)

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string || null)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setOverId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find current stage of active deal
    const activeDeal = deals.find(d => d.id === activeId)
    if (!activeDeal) return

    // Determine target stage (could be a deal id or stage id)
    let targetStageId: string | null = null

    // Check if dropped on a stage
    const targetStage = pipeline.stages.find(s => s.id === overId)
    if (targetStage) {
      targetStageId = targetStage.id
    } else {
      // Dropped on another deal - find that deal's stage
      const targetDeal = deals.find(d => d.id === overId)
      if (targetDeal) {
        targetStageId = targetDeal.stage_id
      }
    }

    if (targetStageId && targetStageId !== activeDeal.stage_id) {
      await onDealMove?.(activeId, activeDeal.stage_id, targetStageId)
    }
  }, [deals, pipeline.stages, onDealMove])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{pipeline.name}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{totalDeals} deals</span>
            <span>|</span>
            <span>{formatCurrency(totalValue)} total</span>
            <span>|</span>
            <span>{formatCurrency(totalWeighted)} weighted</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
          )}

          {showFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {(filterOwner || filterValue) && (
                    <Badge className="ml-2" variant="secondary">
                      {[filterOwner, filterValue].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setFilterOwner(null)}>
                  All Owners
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterValue(null)}>
                  All Values
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterValue({ min: 0, max: 10000 })}>
                  Under $10K
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterValue({ min: 10000, max: 50000 })}>
                  $10K - $50K
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterValue({ min: 50000, max: 100000 })}>
                  $50K - $100K
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterValue({ min: 100000, max: Infinity })}>
                  Over $100K
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="flex-1 p-4">
          <div className="flex gap-4">
            {pipeline.stages
              .sort((a, b) => a.order - b.order)
              .map(stage => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  deals={dealsByStage[stage.id] || []}
                  onDealClick={onDealClick}
                  onDealCreate={() => onDealCreate?.(stage.id)}
                  onDealEdit={onDealEdit}
                  onDealDelete={onDealDelete}
                  onSettingsClick={() => onStageSettingsClick?.(stage)}
                  showStats={showStageStats}
                  compactMode={compactMode}
                  isOver={overId === stage.id}
                />
              ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay>
          {activeDeal ? (
            <div className="opacity-80">
              <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-lg p-3 min-w-[260px]">
                <div className="font-medium text-sm mb-2">{activeDeal.name}</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-600">
                    {formatCurrency(activeDeal.value)}
                  </span>
                  <Badge variant="secondary">{activeDeal.probability}%</Badge>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Bottom Stats Bar */}
      <div className="flex items-center justify-between p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span>At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Stale</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Drag deals to move between stages</span>
        </div>
      </div>
    </div>
  )
}

export default PipelineBoard
