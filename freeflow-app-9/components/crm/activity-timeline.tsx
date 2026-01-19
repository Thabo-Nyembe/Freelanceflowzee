'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Calendar,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  FileText,
  Filter,
  Flag,
  Inbox,
  Linkedin,
  Mail,
  MailOpen,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Play,
  Plus,
  RefreshCw,
  Reply,
  Search,
  Send,
  Star,
  Tag,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Video,
  X,
  XCircle,
  Zap,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export type ActivityType =
  | 'email'
  | 'email_sent'
  | 'email_received'
  | 'email_opened'
  | 'email_clicked'
  | 'email_replied'
  | 'email_bounced'
  | 'call'
  | 'call_outgoing'
  | 'call_incoming'
  | 'call_missed'
  | 'meeting'
  | 'meeting_scheduled'
  | 'meeting_completed'
  | 'meeting_cancelled'
  | 'note'
  | 'task'
  | 'task_created'
  | 'task_completed'
  | 'task_overdue'
  | 'sms'
  | 'linkedin'
  | 'deal_created'
  | 'deal_won'
  | 'deal_lost'
  | 'deal_stage_changed'
  | 'contact_created'
  | 'contact_updated'
  | 'company_created'
  | 'form_submitted'
  | 'page_viewed'
  | 'document_viewed'
  | 'sequence_enrolled'
  | 'sequence_completed'
  | 'sequence_replied'
  | 'custom'
  | 'system'

export type ActivityPriority = 'low' | 'normal' | 'high' | 'urgent'

export type ActivityOutcome =
  | 'positive'
  | 'negative'
  | 'neutral'
  | 'no_answer'
  | 'left_voicemail'
  | 'busy'
  | 'wrong_number'
  | 'interested'
  | 'not_interested'
  | 'follow_up'

export interface ActivityUser {
  id: string
  name: string
  email: string
  avatar_url?: string
}

export interface ActivityAssociation {
  type: 'contact' | 'company' | 'deal'
  id: string
  name: string
}

export interface ActivityAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface MeetingAttendee {
  id: string
  name: string
  email: string
  avatar_url?: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
}

export interface CallDetails {
  direction: 'inbound' | 'outbound'
  duration_seconds: number
  recording_url?: string
  from_number?: string
  to_number?: string
  outcome?: ActivityOutcome
}

export interface EmailDetails {
  subject: string
  body_preview?: string
  from: string
  to: string[]
  cc?: string[]
  thread_id?: string
  is_reply?: boolean
  tracking: {
    opens: number
    clicks: number
    first_opened_at?: string
    last_opened_at?: string
  }
}

export interface MeetingDetails {
  title: string
  location?: string
  start_time: string
  end_time: string
  attendees: MeetingAttendee[]
  meeting_link?: string
  notes?: string
  outcome?: ActivityOutcome
}

export interface TaskDetails {
  title: string
  description?: string
  due_date: string
  priority: ActivityPriority
  status: 'pending' | 'completed' | 'overdue'
  assigned_to?: ActivityUser
}

export interface DealDetails {
  name: string
  value: number
  stage?: string
  previous_stage?: string
  probability?: number
}

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  body?: string
  outcome?: ActivityOutcome
  priority?: ActivityPriority
  is_pinned?: boolean
  created_at: string
  updated_at?: string
  completed_at?: string
  scheduled_at?: string
  user: ActivityUser
  associations?: ActivityAssociation[]
  attachments?: ActivityAttachment[]
  metadata?: Record<string, any>
  // Type-specific details
  call_details?: CallDetails
  email_details?: EmailDetails
  meeting_details?: MeetingDetails
  task_details?: TaskDetails
  deal_details?: DealDetails
}

export interface ActivityGroup {
  date: string
  label: string
  activities: Activity[]
}

export interface ActivityTimelineProps {
  activities: Activity[]
  onActivityClick?: (activity: Activity) => void
  onActivityEdit?: (activity: Activity) => void
  onActivityDelete?: (activityId: string) => void
  onActivityPin?: (activityId: string, isPinned: boolean) => void
  onLogActivity?: (type: ActivityType) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  showFilters?: boolean
  showSearch?: boolean
  showGrouping?: boolean
  defaultGroupBy?: 'day' | 'week' | 'month' | 'type'
  filterTypes?: ActivityType[]
  emptyMessage?: string
  className?: string
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getDateGroupKey(dateString: string, groupBy: 'day' | 'week' | 'month'): string {
  const date = new Date(dateString)
  switch (groupBy) {
    case 'day':
      return date.toISOString().split('T')[0]
    case 'week': {
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      return startOfWeek.toISOString().split('T')[0]
    }
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    default:
      return date.toISOString().split('T')[0]
  }
}

function getDateGroupLabel(key: string, groupBy: 'day' | 'week' | 'month'): string {
  const today = new Date()
  const todayKey = getDateGroupKey(today.toISOString(), groupBy)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayKey = getDateGroupKey(yesterday.toISOString(), groupBy)

  if (key === todayKey) return 'Today'
  if (key === yesterdayKey) return 'Yesterday'

  const date = new Date(key)
  switch (groupBy) {
    case 'day':
      return formatDate(key)
    case 'week':
      const endOfWeek = new Date(date)
      endOfWeek.setDate(date.getDate() + 6)
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    default:
      return formatDate(key)
  }
}

function getActivityTypeConfig(type: ActivityType): {
  icon: React.ElementType
  label: string
  color: string
  bgColor: string
  category: string
} {
  const configs: Record<string, { icon: React.ElementType; label: string; color: string; bgColor: string; category: string }> = {
    // Email activities
    email: { icon: Mail, label: 'Email', color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'communication' },
    email_sent: { icon: Send, label: 'Email Sent', color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'communication' },
    email_received: { icon: Inbox, label: 'Email Received', color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'communication' },
    email_opened: { icon: MailOpen, label: 'Email Opened', color: 'text-green-600', bgColor: 'bg-green-100', category: 'engagement' },
    email_clicked: { icon: ArrowUpRight, label: 'Link Clicked', color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'engagement' },
    email_replied: { icon: Reply, label: 'Email Replied', color: 'text-green-600', bgColor: 'bg-green-100', category: 'communication' },
    email_bounced: { icon: AlertCircle, label: 'Email Bounced', color: 'text-red-600', bgColor: 'bg-red-100', category: 'system' },
    // Call activities
    call: { icon: Phone, label: 'Call', color: 'text-orange-600', bgColor: 'bg-orange-100', category: 'communication' },
    call_outgoing: { icon: PhoneOutgoing, label: 'Outgoing Call', color: 'text-orange-600', bgColor: 'bg-orange-100', category: 'communication' },
    call_incoming: { icon: PhoneIncoming, label: 'Incoming Call', color: 'text-orange-600', bgColor: 'bg-orange-100', category: 'communication' },
    call_missed: { icon: PhoneMissed, label: 'Missed Call', color: 'text-red-600', bgColor: 'bg-red-100', category: 'communication' },
    // Meeting activities
    meeting: { icon: Video, label: 'Meeting', color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'communication' },
    meeting_scheduled: { icon: CalendarPlus, label: 'Meeting Scheduled', color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'planning' },
    meeting_completed: { icon: CheckCircle2, label: 'Meeting Completed', color: 'text-green-600', bgColor: 'bg-green-100', category: 'communication' },
    meeting_cancelled: { icon: XCircle, label: 'Meeting Cancelled', color: 'text-red-600', bgColor: 'bg-red-100', category: 'system' },
    // Task activities
    note: { icon: FileText, label: 'Note', color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'internal' },
    task: { icon: CheckCircle2, label: 'Task', color: 'text-yellow-600', bgColor: 'bg-yellow-100', category: 'planning' },
    task_created: { icon: Plus, label: 'Task Created', color: 'text-yellow-600', bgColor: 'bg-yellow-100', category: 'planning' },
    task_completed: { icon: Check, label: 'Task Completed', color: 'text-green-600', bgColor: 'bg-green-100', category: 'planning' },
    task_overdue: { icon: AlertCircle, label: 'Task Overdue', color: 'text-red-600', bgColor: 'bg-red-100', category: 'system' },
    // Other communication
    sms: { icon: MessageSquare, label: 'SMS', color: 'text-teal-600', bgColor: 'bg-teal-100', category: 'communication' },
    linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'text-blue-700', bgColor: 'bg-blue-100', category: 'communication' },
    // Deal activities
    deal_created: { icon: DollarSign, label: 'Deal Created', color: 'text-green-600', bgColor: 'bg-green-100', category: 'deal' },
    deal_won: { icon: ThumbsUp, label: 'Deal Won', color: 'text-green-600', bgColor: 'bg-green-100', category: 'deal' },
    deal_lost: { icon: ThumbsDown, label: 'Deal Lost', color: 'text-red-600', bgColor: 'bg-red-100', category: 'deal' },
    deal_stage_changed: { icon: ArrowRight, label: 'Stage Changed', color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'deal' },
    // Contact activities
    contact_created: { icon: UserPlus, label: 'Contact Created', color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'system' },
    contact_updated: { icon: Edit, label: 'Contact Updated', color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'system' },
    company_created: { icon: Plus, label: 'Company Created', color: 'text-blue-600', bgColor: 'bg-blue-100', category: 'system' },
    // Engagement activities
    form_submitted: { icon: FileText, label: 'Form Submitted', color: 'text-green-600', bgColor: 'bg-green-100', category: 'engagement' },
    page_viewed: { icon: ExternalLink, label: 'Page Viewed', color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'engagement' },
    document_viewed: { icon: FileText, label: 'Document Viewed', color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'engagement' },
    // Sequence activities
    sequence_enrolled: { icon: Play, label: 'Enrolled in Sequence', color: 'text-purple-600', bgColor: 'bg-purple-100', category: 'automation' },
    sequence_completed: { icon: CheckCircle2, label: 'Sequence Completed', color: 'text-green-600', bgColor: 'bg-green-100', category: 'automation' },
    sequence_replied: { icon: Reply, label: 'Sequence Reply', color: 'text-green-600', bgColor: 'bg-green-100', category: 'automation' },
    // Other
    custom: { icon: Zap, label: 'Custom', color: 'text-gray-600', bgColor: 'bg-gray-100', category: 'other' },
    system: { icon: Zap, label: 'System', color: 'text-gray-500', bgColor: 'bg-gray-100', category: 'system' },
  }

  return configs[type] || configs.custom
}

function getOutcomeConfig(outcome: ActivityOutcome): {
  label: string
  color: string
  icon: React.ElementType
} {
  const configs: Record<ActivityOutcome, { label: string; color: string; icon: React.ElementType }> = {
    positive: { label: 'Positive', color: 'text-green-600', icon: ThumbsUp },
    negative: { label: 'Negative', color: 'text-red-600', icon: ThumbsDown },
    neutral: { label: 'Neutral', color: 'text-gray-600', icon: ArrowRight },
    no_answer: { label: 'No Answer', color: 'text-yellow-600', icon: PhoneMissed },
    left_voicemail: { label: 'Left Voicemail', color: 'text-blue-600', icon: MessageSquare },
    busy: { label: 'Busy', color: 'text-orange-600', icon: Clock },
    wrong_number: { label: 'Wrong Number', color: 'text-red-600', icon: XCircle },
    interested: { label: 'Interested', color: 'text-green-600', icon: Star },
    not_interested: { label: 'Not Interested', color: 'text-red-600', icon: X },
    follow_up: { label: 'Follow Up', color: 'text-blue-600', icon: Calendar },
  }

  return configs[outcome]
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ActivityIcon({ type, className }: { type: ActivityType; className?: string }) {
  const config = getActivityTypeConfig(type)
  const Icon = config.icon

  return (
    <div className={cn('p-2 rounded-full', config.bgColor, className)}>
      <Icon className={cn('h-4 w-4', config.color)} />
    </div>
  )
}

function ActivityOutcomeBadge({ outcome }: { outcome: ActivityOutcome }) {
  const config = getOutcomeConfig(outcome)
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('gap-1', config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function ActivityAssociations({ associations }: { associations: ActivityAssociation[] }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {associations.map(assoc => (
        <Badge key={`${assoc.type}-${assoc.id}`} variant="secondary" className="text-xs">
          {assoc.type === 'contact' && <User className="h-3 w-3 mr-1" />}
          {assoc.type === 'company' && <Users className="h-3 w-3 mr-1" />}
          {assoc.type === 'deal' && <DollarSign className="h-3 w-3 mr-1" />}
          {assoc.name}
        </Badge>
      ))}
    </div>
  )
}

function ActivityAttachments({ attachments }: { attachments: ActivityAttachment[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map(attachment => (
        <a
          key={attachment.id}
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Paperclip className="h-3 w-3" />
          <span className="truncate max-w-[100px]">{attachment.name}</span>
          <span className="text-gray-500">({formatFileSize(attachment.size)})</span>
        </a>
      ))}
    </div>
  )
}

function CallActivityDetails({ details }: { details: CallDetails }) {
  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {details.direction === 'outbound' ? (
            <PhoneOutgoing className="h-4 w-4 text-green-500" />
          ) : (
            <PhoneIncoming className="h-4 w-4 text-blue-500" />
          )}
          <span className="capitalize">{details.direction} Call</span>
        </div>
        <span className="font-medium">{formatDuration(details.duration_seconds)}</span>
      </div>
      {details.outcome && <ActivityOutcomeBadge outcome={details.outcome} />}
      {details.recording_url && (
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href={details.recording_url} target="_blank" rel="noopener noreferrer">
            <Play className="h-4 w-4 mr-2" />
            Listen to Recording
          </a>
        </Button>
      )}
    </div>
  )
}

function EmailActivityDetails({ details }: { details: EmailDetails }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
      <div className="font-medium">{details.subject}</div>
      <div className="text-xs text-gray-500">
        From: {details.from} | To: {details.to.join(', ')}
      </div>
      {details.body_preview && (
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {details.body_preview}
          </p>
          {details.body_preview.length > 100 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mt-1">
                {expanded ? 'Show less' : 'Show more'}
                {expanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </CollapsibleTrigger>
          )}
          <CollapsibleContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {details.body_preview}
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MailOpen className="h-3 w-3" />
          {details.tracking.opens} opens
        </span>
        <span className="flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3" />
          {details.tracking.clicks} clicks
        </span>
      </div>
    </div>
  )
}

function MeetingActivityDetails({ details }: { details: MeetingDetails }) {
  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
      <div className="font-medium">{details.title}</div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="h-4 w-4" />
        {new Date(details.start_time).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
        {' '}
        {formatTime(details.start_time)} - {formatTime(details.end_time)}
      </div>
      {details.location && (
        <div className="text-sm text-gray-500">{details.location}</div>
      )}
      {details.attendees.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Attendees:</span>
          <div className="flex -space-x-2">
            {details.attendees.slice(0, 5).map(attendee => (
              <TooltipProvider key={attendee.id}>
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-800">
                      <AvatarImage src={attendee.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(attendee.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    {attendee.name} ({attendee.status})
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {details.attendees.length > 5 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                +{details.attendees.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
      {details.meeting_link && (
        <Button variant="outline" size="sm" asChild>
          <a href={details.meeting_link} target="_blank" rel="noopener noreferrer">
            <Video className="h-4 w-4 mr-2" />
            Join Meeting
          </a>
        </Button>
      )}
    </div>
  )
}

function DealActivityDetails({ details }: { details: DealDetails }) {
  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{details.name}</div>
          {details.previous_stage && details.stage && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <span>{details.previous_stage}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="font-medium text-blue-600">{details.stage}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="font-bold text-green-600">
            ${details.value.toLocaleString()}
          </div>
          {details.probability && (
            <div className="text-xs text-gray-500">{details.probability}% probability</div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// ACTIVITY ITEM COMPONENT
// =============================================================================

function ActivityItem({
  activity,
  onClick,
  onEdit,
  onDelete,
  onPin,
}: {
  activity: Activity
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPin?: (isPinned: boolean) => void
}) {
  const config = getActivityTypeConfig(activity.type)

  return (
    <div className="flex gap-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 -mx-4 rounded-lg transition-colors group">
      {/* Timeline line & icon */}
      <div className="relative flex flex-col items-center">
        <ActivityIcon type={activity.type} />
        <div className="absolute top-12 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onClick}
                className="font-medium text-sm hover:text-blue-600 dark:hover:text-blue-400 text-left"
              >
                {activity.title}
              </button>
              {activity.is_pinned && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
              {activity.outcome && <ActivityOutcomeBadge outcome={activity.outcome} />}
              {activity.priority === 'high' || activity.priority === 'urgent' ? (
                <Badge variant="destructive" className="text-xs">
                  <Flag className="h-3 w-3 mr-1" />
                  {activity.priority}
                </Badge>
              ) : null}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <Avatar className="h-5 w-5">
                <AvatarImage src={activity.user.avatar_url} />
                <AvatarFallback className="text-xs">
                  {getInitials(activity.user.name)}
                </AvatarFallback>
              </Avatar>
              <span>{activity.user.name}</span>
              <span>|</span>
              <span>{formatRelativeTime(activity.created_at)}</span>
              <span>|</span>
              <span className={config.color}>{config.label}</span>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPin?.(!activity.is_pinned)}>
                {activity.is_pinned ? (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description/Body */}
        {(activity.description || activity.body) && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
            {activity.description || activity.body}
          </p>
        )}

        {/* Type-specific details */}
        {activity.call_details && <CallActivityDetails details={activity.call_details} />}
        {activity.email_details && <EmailActivityDetails details={activity.email_details} />}
        {activity.meeting_details && <MeetingActivityDetails details={activity.meeting_details} />}
        {activity.deal_details && <DealActivityDetails details={activity.deal_details} />}

        {/* Associations */}
        {activity.associations && activity.associations.length > 0 && (
          <ActivityAssociations associations={activity.associations} />
        )}

        {/* Attachments */}
        {activity.attachments && activity.attachments.length > 0 && (
          <ActivityAttachments attachments={activity.attachments} />
        )}
      </div>
    </div>
  )
}

// =============================================================================
// LOG ACTIVITY DIALOG
// =============================================================================

function LogActivityDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultType,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (type: ActivityType) => void
  defaultType?: ActivityType
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>
            Choose an activity type to log
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {[
            { type: 'call' as const, icon: Phone, label: 'Log Call' },
            { type: 'email' as const, icon: Mail, label: 'Log Email' },
            { type: 'meeting' as const, icon: Video, label: 'Log Meeting' },
            { type: 'note' as const, icon: FileText, label: 'Add Note' },
            { type: 'task' as const, icon: CheckCircle2, label: 'Create Task' },
            { type: 'linkedin' as const, icon: Linkedin, label: 'Log LinkedIn' },
          ].map(item => {
            const config = getActivityTypeConfig(item.type)
            return (
              <Button
                key={item.type}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  onSubmit(item.type)
                  onOpenChange(false)
                }}
              >
                <div className={cn('p-2 rounded-full', config.bgColor)}>
                  <item.icon className={cn('h-5 w-5', config.color)} />
                </div>
                <span className="text-sm">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// MAIN ACTIVITY TIMELINE COMPONENT
// =============================================================================

export function ActivityTimeline({
  activities,
  onActivityClick,
  onActivityEdit,
  onActivityDelete,
  onActivityPin,
  onLogActivity,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  showFilters = true,
  showSearch = true,
  showGrouping = true,
  defaultGroupBy = 'day',
  filterTypes,
  emptyMessage = 'No activities yet',
  className,
}: ActivityTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month' | 'type'>(defaultGroupBy)
  const [selectedTypes, setSelectedTypes] = useState<Set<ActivityType>>(new Set())
  const [showSystemActivities, setShowSystemActivities] = useState(false)
  const [logDialogOpen, setLogDialogOpen] = useState(false)

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = activity.title.toLowerCase().includes(query)
        const matchesDescription = activity.description?.toLowerCase().includes(query)
        const matchesUser = activity.user.name.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription && !matchesUser) return false
      }

      // Type filter
      if (selectedTypes.size > 0 && !selectedTypes.has(activity.type)) {
        return false
      }

      // System activities filter
      if (!showSystemActivities) {
        const config = getActivityTypeConfig(activity.type)
        if (config.category === 'system') return false
      }

      // Custom filter types
      if (filterTypes && !filterTypes.includes(activity.type)) {
        return false
      }

      return true
    })
  }, [activities, searchQuery, selectedTypes, showSystemActivities, filterTypes])

  // Group activities
  const groupedActivities = useMemo(() => {
    if (groupBy === 'type') {
      const groups = new Map<string, Activity[]>()
      filteredActivities.forEach(activity => {
        const config = getActivityTypeConfig(activity.type)
        const key = config.category
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(activity)
      })

      return Array.from(groups.entries()).map(([key, items]) => ({
        date: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        activities: items.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      }))
    }

    const groups = new Map<string, Activity[]>()
    filteredActivities.forEach(activity => {
      const key = getDateGroupKey(activity.created_at, groupBy as 'day' | 'week' | 'month')
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(activity)
    })

    return Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, items]) => ({
        date: key,
        label: getDateGroupLabel(key, groupBy as 'day' | 'week' | 'month'),
        activities: items.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      }))
  }, [filteredActivities, groupBy])

  // Pinned activities
  const pinnedActivities = filteredActivities.filter(a => a.is_pinned)

  // Activity type options for filter
  const activityTypeOptions: { type: ActivityType; label: string }[] = [
    { type: 'email', label: 'Emails' },
    { type: 'call', label: 'Calls' },
    { type: 'meeting', label: 'Meetings' },
    { type: 'note', label: 'Notes' },
    { type: 'task', label: 'Tasks' },
    { type: 'deal_created', label: 'Deal Activities' },
    { type: 'linkedin', label: 'LinkedIn' },
  ]

  const toggleTypeFilter = (type: ActivityType) => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    setSelectedTypes(newTypes)
  }

  if (isLoading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
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
                  {selectedTypes.size > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {selectedTypes.size}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                {activityTypeOptions.map(option => (
                  <DropdownMenuCheckboxItem
                    key={option.type}
                    checked={selectedTypes.has(option.type)}
                    onCheckedChange={() => toggleTypeFilter(option.type)}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={showSystemActivities}
                  onCheckedChange={setShowSystemActivities}
                >
                  Show System Activities
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedTypes(new Set())}>
                  Clear Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showGrouping && (
            <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">By Day</SelectItem>
                <SelectItem value="week">By Week</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="type">By Type</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <Button onClick={() => setLogDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Pinned Activities */}
          {pinnedActivities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Pinned
              </h3>
              <div className="space-y-1 divide-y">
                {pinnedActivities.map(activity => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => onActivityClick?.(activity)}
                    onEdit={() => onActivityEdit?.(activity)}
                    onDelete={() => onActivityDelete?.(activity.id)}
                    onPin={isPinned => onActivityPin?.(activity.id, isPinned)}
                  />
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          )}

          {/* Grouped Activities */}
          {groupedActivities.length > 0 ? (
            <div className="space-y-6">
              {groupedActivities.map(group => (
                <div key={group.date}>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 sticky top-0 bg-white dark:bg-gray-900 py-2">
                    {group.label}
                    <Badge variant="secondary" className="ml-2">
                      {group.activities.length}
                    </Badge>
                  </h3>
                  <div className="divide-y">
                    {group.activities.map(activity => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        onClick={() => onActivityClick?.(activity)}
                        onEdit={() => onActivityEdit?.(activity)}
                        onDelete={() => onActivityDelete?.(activity.id)}
                        onPin={isPinned => onActivityPin?.(activity.id, isPinned)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{emptyMessage}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setLogDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Log First Activity
              </Button>
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center py-4">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                Load More
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Log Activity Dialog */}
      <LogActivityDialog
        open={logDialogOpen}
        onOpenChange={setLogDialogOpen}
        onSubmit={type => onLogActivity?.(type)}
      />
    </div>
  )
}

export default ActivityTimeline
