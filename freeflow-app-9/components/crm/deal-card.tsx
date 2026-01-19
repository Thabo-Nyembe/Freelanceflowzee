'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  Building2,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  FileText,
  Flag,
  History,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pause,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Star,
  Tag,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export type DealStatus = 'open' | 'won' | 'lost' | 'on_hold' | 'abandoned'
export type DealPriority = 'low' | 'medium' | 'high' | 'urgent'
export type DealType = 'new_business' | 'existing_business' | 'renewal' | 'upsell' | 'cross_sell'

export interface DealStage {
  id: string
  name: string
  probability: number
  color: string
  is_won?: boolean
  is_lost?: boolean
}

export interface DealCompany {
  id: string
  name: string
  domain?: string
  logo_url?: string
  industry?: string
}

export interface DealContact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  title?: string
  avatar_url?: string
}

export interface DealOwner {
  id: string
  name: string
  email: string
  avatar_url?: string
}

export interface DealActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  description: string
  created_at: string
  user?: {
    name: string
    avatar_url?: string
  }
}

export interface DealProduct {
  id: string
  name: string
  quantity: number
  price: number
  discount?: number
}

export interface Deal {
  id: string
  name: string
  value: number
  probability: number
  status: DealStatus
  priority?: DealPriority
  type?: DealType
  stage_id: string
  stage?: DealStage
  expected_close_date: string | null
  actual_close_date?: string | null
  owner_id: string | null
  owner?: DealOwner
  company_id: string | null
  company?: DealCompany
  contact_id: string | null
  contact?: DealContact
  contacts?: DealContact[]
  source?: string
  description?: string
  loss_reason?: string
  competitor?: string
  tags?: string[]
  products?: DealProduct[]
  custom_fields?: Record<string, any>
  created_at: string
  updated_at: string
  last_activity_at?: string
  next_activity_at?: string
  activities?: DealActivity[]
  attachments_count?: number
  notes_count?: number
}

export interface DealCardProps {
  deal: Deal
  stages?: DealStage[]
  variant?: 'default' | 'compact' | 'expanded' | 'list'
  showActions?: boolean
  showStage?: boolean
  showOwner?: boolean
  showCompany?: boolean
  showContact?: boolean
  showActivities?: boolean
  showProducts?: boolean
  showProgress?: boolean
  onView?: (deal: Deal) => void
  onEdit?: (deal: Deal) => void
  onDelete?: (dealId: string) => void
  onStageChange?: (dealId: string, stageId: string) => void
  onStatusChange?: (dealId: string, status: DealStatus, reason?: string) => void
  onOwnerChange?: (dealId: string, ownerId: string) => void
  onAddActivity?: (dealId: string) => void
  onScheduleCall?: (deal: Deal) => void
  onSendEmail?: (deal: Deal) => void
  className?: string
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
  if (!dateString) return 'Not set'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return 'No date set'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`
  if (diffDays === -1) return 'Yesterday'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `In ${diffDays} days`
  if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`
  return formatDate(dateString)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getStatusConfig(status: DealStatus): {
  label: string
  color: string
  icon: React.ElementType
  bgColor: string
} {
  switch (status) {
    case 'won':
      return { label: 'Won', color: 'text-green-600', icon: CheckCircle2, bgColor: 'bg-green-100' }
    case 'lost':
      return { label: 'Lost', color: 'text-red-600', icon: XCircle, bgColor: 'bg-red-100' }
    case 'on_hold':
      return { label: 'On Hold', color: 'text-yellow-600', icon: Pause, bgColor: 'bg-yellow-100' }
    case 'abandoned':
      return { label: 'Abandoned', color: 'text-gray-600', icon: Archive, bgColor: 'bg-gray-100' }
    default:
      return { label: 'Open', color: 'text-blue-600', icon: Play, bgColor: 'bg-blue-100' }
  }
}

function getPriorityConfig(priority: DealPriority | undefined): {
  label: string
  color: string
  bgColor: string
} {
  switch (priority) {
    case 'urgent':
      return { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' }
    case 'high':
      return { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    case 'medium':
      return { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    case 'low':
      return { label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' }
    default:
      return { label: 'Normal', color: 'text-gray-600', bgColor: 'bg-gray-100' }
  }
}

function getDealAge(createdAt: string): string {
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day'
  if (diffDays < 30) return `${diffDays} days`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
  return `${Math.floor(diffDays / 365)} years`
}

function isOverdue(expectedCloseDate: string | null): boolean {
  if (!expectedCloseDate) return false
  return new Date(expectedCloseDate) < new Date()
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function StatusBadge({ status }: { status: DealStatus }) {
  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge className={cn(config.bgColor, config.color, 'border-0')}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: DealPriority | undefined }) {
  const config = getPriorityConfig(priority)

  return (
    <Badge variant="outline" className={cn(config.color, 'border-current')}>
      <Flag className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

function DealMetric({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className="h-4 w-4 text-gray-400" />
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}

// =============================================================================
// CLOSE DEAL DIALOG
// =============================================================================

function CloseDealDialog({
  open,
  onOpenChange,
  dealId,
  closeType,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  dealId: string
  closeType: 'won' | 'lost'
  onConfirm: (dealId: string, status: DealStatus, reason?: string) => void
}) {
  const [reason, setReason] = useState('')
  const [competitor, setCompetitor] = useState('')

  const handleConfirm = () => {
    onConfirm(dealId, closeType, closeType === 'lost' ? reason : undefined)
    onOpenChange(false)
    setReason('')
    setCompetitor('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {closeType === 'won' ? 'Mark Deal as Won' : 'Mark Deal as Lost'}
          </DialogTitle>
          <DialogDescription>
            {closeType === 'won'
              ? 'Congratulations on winning this deal!'
              : 'Please provide a reason for losing this deal to improve future outcomes.'}
          </DialogDescription>
        </DialogHeader>

        {closeType === 'lost' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="loss-reason">Loss Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price too high</SelectItem>
                  <SelectItem value="competitor">Lost to competitor</SelectItem>
                  <SelectItem value="timing">Bad timing</SelectItem>
                  <SelectItem value="budget">No budget</SelectItem>
                  <SelectItem value="features">Missing features</SelectItem>
                  <SelectItem value="no_decision">No decision made</SelectItem>
                  <SelectItem value="champion_left">Champion left company</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reason === 'competitor' && (
              <div className="space-y-2">
                <Label htmlFor="competitor">Competitor</Label>
                <Select value={competitor} onValueChange={setCompetitor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select competitor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="competitor_a">Competitor A</SelectItem>
                    <SelectItem value="competitor_b">Competitor B</SelectItem>
                    <SelectItem value="competitor_c">Competitor C</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details about why we lost this deal..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}

        {closeType === 'won' && (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Deal Won!</span>
              </div>
              <p className="text-sm text-green-600/80 mt-1">
                This deal will be marked as closed-won and removed from the pipeline.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={closeType === 'won' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {closeType === 'won' ? 'Mark as Won' : 'Mark as Lost'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// MAIN DEAL CARD COMPONENT
// =============================================================================

export function DealCard({
  deal,
  stages = [],
  variant = 'default',
  showActions = true,
  showStage = true,
  showOwner = true,
  showCompany = true,
  showContact = true,
  showActivities = false,
  showProducts = false,
  showProgress = true,
  onView,
  onEdit,
  onDelete,
  onStageChange,
  onStatusChange,
  onOwnerChange,
  onAddActivity,
  onScheduleCall,
  onSendEmail,
  className,
}: DealCardProps) {
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [closeType, setCloseType] = useState<'won' | 'lost'>('won')

  const statusConfig = getStatusConfig(deal.status)
  const priorityConfig = getPriorityConfig(deal.priority)
  const dealOverdue = isOverdue(deal.expected_close_date) && deal.status === 'open'
  const weightedValue = deal.value * (deal.probability / 100)

  const handleCloseAsWon = () => {
    setCloseType('won')
    setCloseDialogOpen(true)
  }

  const handleCloseAsLost = () => {
    setCloseType('lost')
    setCloseDialogOpen(true)
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer transition-colors',
          className
        )}
        onClick={() => onView?.(deal)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{deal.name}</span>
            <StatusBadge status={deal.status} />
          </div>
          {deal.company && (
            <span className="text-xs text-gray-500 truncate">{deal.company.name}</span>
          )}
        </div>
        <div className="text-right">
          <div className="font-semibold text-green-600">{formatCurrency(deal.value)}</div>
          <div className="text-xs text-gray-500">{deal.probability}%</div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    )
  }

  // List variant
  if (variant === 'list') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer',
          className
        )}
        onClick={() => onView?.(deal)}
      >
        {/* Deal Name & Company */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{deal.name}</div>
          {deal.company && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{deal.company.name}</span>
            </div>
          )}
        </div>

        {/* Stage */}
        {showStage && deal.stage && (
          <div className="w-32">
            <Badge
              variant="outline"
              style={{ borderColor: deal.stage.color, color: deal.stage.color }}
            >
              {deal.stage.name}
            </Badge>
          </div>
        )}

        {/* Value */}
        <div className="w-28 text-right">
          <div className="font-semibold">{formatCurrency(deal.value)}</div>
          <div className="text-xs text-gray-500">{deal.probability}%</div>
        </div>

        {/* Close Date */}
        <div className={cn('w-32 text-sm', dealOverdue && 'text-red-500')}>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatRelativeDate(deal.expected_close_date)}
          </div>
        </div>

        {/* Owner */}
        {showOwner && deal.owner && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={deal.owner.avatar_url} />
                  <AvatarFallback>{getInitials(deal.owner.name)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{deal.owner.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Status */}
        <StatusBadge status={deal.status} />

        {/* Actions */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(deal)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete?.(deal.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

  // Expanded variant
  if (variant === 'expanded') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{deal.name}</h3>
                <StatusBadge status={deal.status} />
                {deal.priority && <PriorityBadge priority={deal.priority} />}
              </div>
              {deal.company && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {deal.company.logo_url ? (
                    <img src={deal.company.logo_url} alt="" className="h-5 w-5 rounded" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  <span>{deal.company.name}</span>
                  {deal.company.industry && (
                    <Badge variant="secondary" className="text-xs">
                      {deal.company.industry}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(deal)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(deal)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Deal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Move to Stage
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {stages.map(stage => (
                        <DropdownMenuItem
                          key={stage.id}
                          onClick={() => onStageChange?.(deal.id, stage.id)}
                          disabled={stage.id === deal.stage_id}
                        >
                          <div
                            className="h-2 w-2 rounded-full mr-2"
                            style={{ backgroundColor: stage.color }}
                          />
                          {stage.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCloseAsWon} className="text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Won
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCloseAsLost} className="text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark as Lost
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(deal.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Deal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Value & Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-gray-500">Deal Value</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(deal.value)}
                </span>
                <span className="text-sm text-gray-500">
                  ({formatCurrency(weightedValue)} weighted)
                </span>
              </div>
            </div>
            {showStage && deal.stage && (
              <div className="space-y-1">
                <span className="text-sm text-gray-500">Current Stage</span>
                <div className="flex items-center gap-2">
                  <Badge
                    className="text-sm"
                    style={{ backgroundColor: deal.stage.color, color: 'white' }}
                  >
                    {deal.stage.name}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {deal.stage.probability}% probability
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar for probability */}
          {showProgress && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Win Probability</span>
                <span className="font-medium">{deal.probability}%</span>
              </div>
              <Progress value={deal.probability} className="h-2" />
            </div>
          )}

          <Separator />

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DealMetric
              icon={Calendar}
              label="Expected Close"
              value={formatRelativeDate(deal.expected_close_date)}
              className={dealOverdue ? 'text-red-500' : ''}
            />
            <DealMetric
              icon={Clock}
              label="Deal Age"
              value={getDealAge(deal.created_at)}
            />
            <DealMetric
              icon={History}
              label="Last Activity"
              value={deal.last_activity_at ? formatRelativeDate(deal.last_activity_at) : 'Never'}
            />
            <DealMetric
              icon={Target}
              label="Next Activity"
              value={deal.next_activity_at ? formatRelativeDate(deal.next_activity_at) : 'None'}
            />
          </div>

          {/* Contact Information */}
          {showContact && deal.contact && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Primary Contact</span>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={deal.contact.avatar_url} />
                    <AvatarFallback>
                      {getInitials(`${deal.contact.first_name} ${deal.contact.last_name}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {deal.contact.first_name} {deal.contact.last_name}
                    </div>
                    {deal.contact.title && (
                      <div className="text-sm text-gray-500">{deal.contact.title}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onSendEmail?.(deal)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send Email</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {deal.contact.phone && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onScheduleCall?.(deal)}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Schedule Call</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Products */}
          {showProducts && deal.products && deal.products.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Products</span>
                <div className="space-y-2">
                  {deal.products.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-gray-500 ml-2">x{product.quantity}</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(product.price * product.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Recent Activities */}
          {showActivities && deal.activities && deal.activities.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recent Activities</span>
                  <Button variant="ghost" size="sm" onClick={() => onAddActivity?.(deal.id)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {deal.activities.slice(0, 3).map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div className="p-1.5 bg-white dark:bg-gray-700 rounded-full">
                        {activity.type === 'call' && <Phone className="h-3 w-3" />}
                        {activity.type === 'email' && <Mail className="h-3 w-3" />}
                        {activity.type === 'meeting' && <Users className="h-3 w-3" />}
                        {activity.type === 'note' && <FileText className="h-3 w-3" />}
                        {activity.type === 'task' && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.user?.name} - {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {deal.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          {/* Owner */}
          {showOwner && deal.owner && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={deal.owner.avatar_url} />
                <AvatarFallback>{getInitials(deal.owner.name)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{deal.owner.name}</p>
                <p className="text-gray-500 text-xs">Owner</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onAddActivity?.(deal.id)}>
              <CalendarPlus className="h-4 w-4 mr-1" />
              Log Activity
            </Button>
            <Button size="sm" onClick={() => onView?.(deal)}>
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>

        {/* Close Deal Dialog */}
        <CloseDealDialog
          open={closeDialogOpen}
          onOpenChange={setCloseDialogOpen}
          dealId={deal.id}
          closeType={closeType}
          onConfirm={(id, status, reason) => onStatusChange?.(id, status, reason)}
        />
      </Card>
    )
  }

  // Default variant
  return (
    <Card
      className={cn(
        'group overflow-hidden hover:shadow-md transition-shadow cursor-pointer',
        dealOverdue && 'border-l-4 border-l-red-500',
        className
      )}
      onClick={() => onView?.(deal)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{deal.name}</h4>
            {deal.company && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{deal.company.name}</span>
              </div>
            )}
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit?.(deal) }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleCloseAsWon() }} className="text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Won
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleCloseAsLost() }} className="text-red-600">
                  <XCircle className="h-4 w-4 mr-2" />
                  Lost
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={e => { e.stopPropagation(); onDelete?.(deal.id) }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Value & Probability */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(deal.value)}
          </span>
          <Badge variant="secondary">{deal.probability}%</Badge>
        </div>

        {/* Stage */}
        {showStage && deal.stage && (
          <Badge
            className="mb-3"
            style={{ backgroundColor: deal.stage.color, color: 'white' }}
          >
            {deal.stage.name}
          </Badge>
        )}

        {/* Close Date */}
        <div
          className={cn(
            'flex items-center gap-1.5 text-sm',
            dealOverdue ? 'text-red-500' : 'text-gray-500'
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>{formatRelativeDate(deal.expected_close_date)}</span>
          {dealOverdue && <AlertTriangle className="h-4 w-4" />}
        </div>

        {/* Owner */}
        {showOwner && deal.owner && (
          <div className="flex items-center justify-end mt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={deal.owner.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {getInitials(deal.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{deal.owner.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardContent>

      {/* Close Deal Dialog */}
      <CloseDealDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        dealId={deal.id}
        closeType={closeType}
        onConfirm={(id, status, reason) => onStatusChange?.(id, status, reason)}
      />
    </Card>
  )
}

export default DealCard
