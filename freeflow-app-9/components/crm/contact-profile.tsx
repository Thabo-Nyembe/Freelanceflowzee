'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  Archive,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  Edit,
  ExternalLink,
  Facebook,
  FileText,
  Flag,
  Globe,
  Linkedin,
  Mail,
  MailOpen,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Star,
  StarOff,
  Tag,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Twitter,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Video,
  XCircle,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export type LifecycleStage =
  | 'subscriber'
  | 'lead'
  | 'marketing_qualified_lead'
  | 'sales_qualified_lead'
  | 'opportunity'
  | 'customer'
  | 'evangelist'
  | 'other'

export type ContactStatus = 'active' | 'inactive' | 'bounced' | 'unsubscribed' | 'archived'

export interface ContactCompany {
  id: string
  name: string
  domain?: string
  logo_url?: string
  industry?: string
  size?: string
  website?: string
}

export interface ContactDeal {
  id: string
  name: string
  value: number
  probability: number
  status: 'open' | 'won' | 'lost'
  stage?: string
  expected_close_date?: string
}

export interface ContactActivity {
  id: string
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'sms' | 'linkedin'
  title: string
  description?: string
  outcome?: string
  created_at: string
  user?: {
    id: string
    name: string
    avatar_url?: string
  }
  metadata?: Record<string, any>
}

export interface ContactTask {
  id: string
  title: string
  description?: string
  due_date: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed' | 'overdue'
  assigned_to?: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface ContactEmail {
  id: string
  subject: string
  preview: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'replied'
  sent_at: string
  opened_at?: string
  clicked_at?: string
  sequence?: {
    id: string
    name: string
  }
}

export interface ContactNote {
  id: string
  content: string
  created_at: string
  updated_at: string
  user: {
    id: string
    name: string
    avatar_url?: string
  }
  is_pinned?: boolean
}

export interface ContactTag {
  id: string
  name: string
  color: string
}

export interface LeadScore {
  total: number
  demographic: number
  behavioral: number
  engagement: number
  fit: number
  trend: 'up' | 'down' | 'stable'
  last_updated: string
}

export interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  mobile?: string
  title?: string
  department?: string
  avatar_url?: string
  status: ContactStatus
  lifecycle_stage: LifecycleStage
  lead_score?: LeadScore
  source?: string
  company_id?: string
  company?: ContactCompany
  owner_id?: string
  owner?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postal_code?: string
  }
  social_profiles?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  communication_preferences?: {
    email_opt_in: boolean
    sms_opt_in: boolean
    phone_opt_in: boolean
    preferred_method: 'email' | 'phone' | 'sms'
  }
  deals?: ContactDeal[]
  activities?: ContactActivity[]
  tasks?: ContactTask[]
  emails?: ContactEmail[]
  notes?: ContactNote[]
  tags?: ContactTag[]
  custom_fields?: Record<string, any>
  engagement_score?: number
  last_contacted_at?: string
  last_activity_at?: string
  created_at: string
  updated_at: string
}

export interface ContactProfileProps {
  contact: Contact
  onEdit?: (contact: Contact) => void
  onDelete?: (contactId: string) => void
  onArchive?: (contactId: string) => void
  onUnsubscribe?: (contactId: string) => void
  onAddToDeal?: (contactId: string) => void
  onSendEmail?: (contact: Contact) => void
  onScheduleCall?: (contact: Contact) => void
  onScheduleMeeting?: (contact: Contact) => void
  onAddNote?: (contactId: string, content: string) => void
  onAddTask?: (contactId: string, task: Partial<ContactTask>) => void
  onActivityCreate?: (contactId: string) => void
  onStageChange?: (contactId: string, stage: LifecycleStage) => void
  onOwnerChange?: (contactId: string, ownerId: string) => void
  onTagAdd?: (contactId: string, tag: string) => void
  onTagRemove?: (contactId: string, tagId: string) => void
  onDealClick?: (deal: ContactDeal) => void
  isLoading?: boolean
  variant?: 'full' | 'sidebar' | 'compact'
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
}

function getLifecycleStageConfig(stage: LifecycleStage): {
  label: string
  color: string
  bgColor: string
  order: number
} {
  const stages: Record<LifecycleStage, { label: string; color: string; bgColor: string; order: number }> = {
    subscriber: { label: 'Subscriber', color: 'text-gray-600', bgColor: 'bg-gray-100', order: 1 },
    lead: { label: 'Lead', color: 'text-blue-600', bgColor: 'bg-blue-100', order: 2 },
    marketing_qualified_lead: { label: 'MQL', color: 'text-purple-600', bgColor: 'bg-purple-100', order: 3 },
    sales_qualified_lead: { label: 'SQL', color: 'text-indigo-600', bgColor: 'bg-indigo-100', order: 4 },
    opportunity: { label: 'Opportunity', color: 'text-orange-600', bgColor: 'bg-orange-100', order: 5 },
    customer: { label: 'Customer', color: 'text-green-600', bgColor: 'bg-green-100', order: 6 },
    evangelist: { label: 'Evangelist', color: 'text-pink-600', bgColor: 'bg-pink-100', order: 7 },
    other: { label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-100', order: 8 },
  }
  return stages[stage] || stages.other
}

function getStatusConfig(status: ContactStatus): {
  label: string
  color: string
  icon: React.ElementType
} {
  const statuses: Record<ContactStatus, { label: string; color: string; icon: React.ElementType }> = {
    active: { label: 'Active', color: 'text-green-600', icon: CheckCircle2 },
    inactive: { label: 'Inactive', color: 'text-gray-600', icon: Clock },
    bounced: { label: 'Bounced', color: 'text-red-600', icon: AlertCircle },
    unsubscribed: { label: 'Unsubscribed', color: 'text-yellow-600', icon: UserMinus },
    archived: { label: 'Archived', color: 'text-gray-500', icon: Archive },
  }
  return statuses[status] || statuses.active
}

function getLeadScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ContactAvatar({
  contact,
  size = 'default',
}: {
  contact: Contact
  size?: 'sm' | 'default' | 'lg' | 'xl'
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  }

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={contact.avatar_url} />
      <AvatarFallback className={size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-xl' : ''}>
        {getInitials(contact.first_name, contact.last_name)}
      </AvatarFallback>
    </Avatar>
  )
}

function ContactActions({
  contact,
  onSendEmail,
  onScheduleCall,
  onScheduleMeeting,
}: {
  contact: Contact
  onSendEmail?: (contact: Contact) => void
  onScheduleCall?: (contact: Contact) => void
  onScheduleMeeting?: (contact: Contact) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onSendEmail?.(contact)}>
              <Mail className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send Email</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {contact.phone && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => onScheduleCall?.(contact)}>
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Schedule Call</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onScheduleMeeting?.(contact)}>
              <Video className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Schedule Meeting</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function LeadScoreCard({ score }: { score: LeadScore }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Lead Score
          <span className={cn('text-2xl font-bold', getLeadScoreColor(score.total))}>
            {score.total}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Demographic</span>
            <span className="font-medium">{score.demographic}</span>
          </div>
          <Progress value={score.demographic} className="h-1.5" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Behavioral</span>
            <span className="font-medium">{score.behavioral}</span>
          </div>
          <Progress value={score.behavioral} className="h-1.5" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Engagement</span>
            <span className="font-medium">{score.engagement}</span>
          </div>
          <Progress value={score.engagement} className="h-1.5" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Fit</span>
            <span className="font-medium">{score.fit}</span>
          </div>
          <Progress value={score.fit} className="h-1.5" />
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 pt-2">
          {score.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
          {score.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
          Updated {formatRelativeTime(score.last_updated)}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: ContactActivity }) {
  const getActivityIcon = (type: ContactActivity['type']) => {
    switch (type) {
      case 'email': return Mail
      case 'call': return Phone
      case 'meeting': return Video
      case 'note': return FileText
      case 'task': return CheckCircle2
      case 'sms': return MessageSquare
      case 'linkedin': return Linkedin
      default: return Clock
    }
  }

  const Icon = getActivityIcon(activity.type)

  return (
    <div className="flex gap-3 py-3">
      <div className="flex-shrink-0">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <p className="font-medium text-sm">{activity.title}</p>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {formatRelativeTime(activity.created_at)}
          </span>
        </div>
        {activity.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
        )}
        {activity.user && (
          <div className="flex items-center gap-1 mt-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={activity.user.avatar_url} />
              <AvatarFallback className="text-xs">
                {activity.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">{activity.user.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function DealItem({ deal, onClick }: { deal: ContactDeal; onClick?: () => void }) {
  const statusColors = {
    open: 'bg-blue-100 text-blue-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  }

  return (
    <div
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{deal.name}</p>
        {deal.stage && (
          <p className="text-xs text-gray-500 mt-0.5">{deal.stage}</p>
        )}
      </div>
      <div className="text-right ml-3">
        <p className="font-semibold text-green-600">{formatCurrency(deal.value)}</p>
        <Badge className={cn('text-xs', statusColors[deal.status])}>
          {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
        </Badge>
      </div>
    </div>
  )
}

function TaskItem({ task }: { task: ContactTask }) {
  const priorityColors = {
    low: 'text-gray-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
  }

  const isOverdue = new Date(task.due_date) < new Date() && task.status === 'pending'

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className={cn(
        'p-1 rounded',
        task.status === 'completed' ? 'bg-green-100' : isOverdue ? 'bg-red-100' : 'bg-gray-200'
      )}>
        {task.status === 'completed' ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Clock className={cn('h-4 w-4', isOverdue ? 'text-red-600' : 'text-gray-600')} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-sm',
          task.status === 'completed' && 'line-through text-gray-500'
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('text-xs', priorityColors[task.priority])}>
            <Flag className="h-3 w-3 inline mr-1" />
            {task.priority}
          </span>
          <span className={cn(
            'text-xs',
            isOverdue ? 'text-red-500' : 'text-gray-500'
          )}>
            Due {formatDate(task.due_date)}
          </span>
        </div>
      </div>
    </div>
  )
}

function EmailItem({ email }: { email: ContactEmail }) {
  const statusIcons: Record<ContactEmail['status'], React.ElementType> = {
    sent: Send,
    delivered: Check,
    opened: MailOpen,
    clicked: ArrowUpRight,
    bounced: AlertCircle,
    replied: MessageSquare,
  }

  const statusColors: Record<ContactEmail['status'], string> = {
    sent: 'text-gray-500',
    delivered: 'text-blue-500',
    opened: 'text-green-500',
    clicked: 'text-purple-500',
    bounced: 'text-red-500',
    replied: 'text-green-600',
  }

  const Icon = statusIcons[email.status]

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className={cn('p-2 rounded-full bg-white dark:bg-gray-700', statusColors[email.status])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{email.subject}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{email.preview}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>{formatRelativeTime(email.sent_at)}</span>
          {email.sequence && (
            <>
              <span>|</span>
              <span className="text-purple-500">{email.sequence.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function NoteItem({ note, onEdit }: { note: ContactNote; onEdit?: () => void }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={note.user.avatar_url} />
            <AvatarFallback className="text-xs">
              {note.user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{note.user.name}</span>
          <span className="text-xs text-gray-500">{formatRelativeTime(note.created_at)}</span>
        </div>
        {note.is_pinned && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
      </div>
      <p className="text-sm mt-2 whitespace-pre-wrap">{note.content}</p>
    </div>
  )
}

// =============================================================================
// ADD NOTE DIALOG
// =============================================================================

function AddNoteDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (content: string) => void
}) {
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content)
      setContent('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a note about this contact for your team.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Write your note here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// MAIN CONTACT PROFILE COMPONENT
// =============================================================================

export function ContactProfile({
  contact,
  onEdit,
  onDelete,
  onArchive,
  onUnsubscribe,
  onAddToDeal,
  onSendEmail,
  onScheduleCall,
  onScheduleMeeting,
  onAddNote,
  onAddTask,
  onActivityCreate,
  onStageChange,
  onOwnerChange,
  onTagAdd,
  onTagRemove,
  onDealClick,
  isLoading = false,
  variant = 'full',
  className,
}: ContactProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const stageConfig = getLifecycleStageConfig(contact.lifecycle_stage)
  const statusConfig = getStatusConfig(contact.status)
  const StatusIcon = statusConfig.icon

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const totalDealValue = contact.deals?.reduce((sum, deal) => sum + deal.value, 0) || 0
  const openDeals = contact.deals?.filter(d => d.status === 'open').length || 0
  const wonDeals = contact.deals?.filter(d => d.status === 'won').length || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Compact variant for lists/cards
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-4 p-4', className)}>
        <ContactAvatar contact={contact} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">
              {contact.first_name} {contact.last_name}
            </h3>
            <Badge className={cn(stageConfig.bgColor, stageConfig.color, 'border-0')}>
              {stageConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate">{contact.email}</p>
          {contact.company && (
            <p className="text-sm text-gray-400 truncate">{contact.company.name}</p>
          )}
        </div>
        {contact.lead_score && (
          <div className={cn('text-xl font-bold', getLeadScoreColor(contact.lead_score.total))}>
            {contact.lead_score.total}
          </div>
        )}
        <ContactActions
          contact={contact}
          onSendEmail={onSendEmail}
          onScheduleCall={onScheduleCall}
          onScheduleMeeting={onScheduleMeeting}
        />
      </div>
    )
  }

  // Sidebar variant (narrower)
  if (variant === 'sidebar') {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-start gap-3">
            <ContactAvatar contact={contact} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">
                {contact.first_name} {contact.last_name}
              </h2>
              {contact.title && (
                <p className="text-sm text-gray-500">{contact.title}</p>
              )}
              {contact.company && (
                <p className="text-sm text-gray-400">{contact.company.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge className={cn(stageConfig.bgColor, stageConfig.color, 'border-0')}>
              {stageConfig.label}
            </Badge>
            {contact.lead_score && (
              <Badge variant="outline" className={getLeadScoreColor(contact.lead_score.total)}>
                Score: {contact.lead_score.total}
              </Badge>
            )}
          </div>
          <ContactActions
            contact={contact}
            onSendEmail={onSendEmail}
            onScheduleCall={onScheduleCall}
            onScheduleMeeting={onScheduleMeeting}
          />
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="truncate">{contact.email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(contact.email, 'email')}
                >
                  {copiedField === 'email' ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span>{contact.company.name}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Recent Activity */}
            {contact.activities && contact.activities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {contact.activities.slice(0, 3).map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            )}

            {/* Open Deals */}
            {contact.deals && contact.deals.filter(d => d.status === 'open').length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Open Deals</h4>
                <div className="space-y-2">
                  {contact.deals.filter(d => d.status === 'open').map(deal => (
                    <DealItem key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }

  // Full variant (default)
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-6 border-b bg-white dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <ContactAvatar contact={contact} size="xl" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {contact.first_name} {contact.last_name}
                </h1>
                <Badge className={cn(stageConfig.bgColor, stageConfig.color, 'border-0')}>
                  {stageConfig.label}
                </Badge>
                <div className={cn('flex items-center gap-1', statusConfig.color)}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-sm">{statusConfig.label}</span>
                </div>
              </div>
              {contact.title && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  {contact.title}
                  {contact.department && ` | ${contact.department}`}
                </p>
              )}
              {contact.company && (
                <div className="flex items-center gap-2 mt-2">
                  {contact.company.logo_url ? (
                    <img src={contact.company.logo_url} alt="" className="h-5 w-5 rounded" />
                  ) : (
                    <Building2 className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    {contact.company.name}
                  </span>
                  {contact.company.website && (
                    <a
                      href={contact.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {contact.tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={{ borderColor: tag.color, color: tag.color }}
                      className="cursor-pointer"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                      <button
                        onClick={() => onTagRemove?.(contact.id, tag.id)}
                        className="ml-1 hover:text-red-500"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ContactActions
              contact={contact}
              onSendEmail={onSendEmail}
              onScheduleCall={onScheduleCall}
              onScheduleMeeting={onScheduleMeeting}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(contact)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddToDeal?.(contact.id)}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add to Deal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchive?.(contact.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUnsubscribe?.(contact.id)}>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Unsubscribe
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(contact.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Total Deal Value</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(totalDealValue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Open Deals</div>
              <div className="text-xl font-bold">{openDeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Won Deals</div>
              <div className="text-xl font-bold text-green-600">{wonDeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Last Activity</div>
              <div className="text-xl font-bold">
                {contact.last_activity_at
                  ? formatRelativeTime(contact.last_activity_at)
                  : 'Never'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="border-b px-6">
          <TabsList className="h-12">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-6">
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-3 gap-6">
              {/* Contact Details */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{contact.email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(contact.email, 'email')}
                      >
                        {copiedField === 'email' ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {contact.phone && (
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Phone</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  )}
                  {contact.mobile && (
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Mobile</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{contact.mobile}</span>
                      </div>
                    </div>
                  )}
                  {contact.address && (
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Location</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {[contact.address.city, contact.address.state, contact.address.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    </div>
                  )}
                  {contact.social_profiles && (
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Social</label>
                      <div className="flex items-center gap-2">
                        {contact.social_profiles.linkedin && (
                          <a
                            href={contact.social_profiles.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {contact.social_profiles.twitter && (
                          <a
                            href={contact.social_profiles.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-500"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                        {contact.social_profiles.facebook && (
                          <a
                            href={contact.social_profiles.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-800 hover:text-blue-900"
                          >
                            <Facebook className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {contact.owner && (
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Owner</label>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={contact.owner.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {contact.owner.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{contact.owner.name}</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">Source</label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span>{contact.source || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">Created</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(contact.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Score */}
              {contact.lead_score && <LeadScoreCard score={contact.lead_score} />}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Activity Timeline</CardTitle>
                <Button onClick={() => onActivityCreate?.(contact.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Activity
                </Button>
              </CardHeader>
              <CardContent>
                {contact.activities && contact.activities.length > 0 ? (
                  <div className="divide-y">
                    {contact.activities.map(activity => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activities yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => onActivityCreate?.(contact.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Log First Activity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Associated Deals</CardTitle>
                <Button onClick={() => onAddToDeal?.(contact.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Deal
                </Button>
              </CardHeader>
              <CardContent>
                {contact.deals && contact.deals.length > 0 ? (
                  <div className="space-y-3">
                    {contact.deals.map(deal => (
                      <DealItem key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No deals associated</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => onAddToDeal?.(contact.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Deal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Email History</CardTitle>
                <Button onClick={() => onSendEmail?.(contact)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </CardHeader>
              <CardContent>
                {contact.emails && contact.emails.length > 0 ? (
                  <div className="space-y-3">
                    {contact.emails.map(email => (
                      <EmailItem key={email.id} email={email} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No emails sent yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => onSendEmail?.(contact)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send First Email
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Button onClick={() => onAddTask?.(contact.id, {})}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                {contact.tasks && contact.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {contact.tasks.map(task => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => onAddTask?.(contact.id, {})}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notes</CardTitle>
                <Button onClick={() => setNoteDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardHeader>
              <CardContent>
                {contact.notes && contact.notes.length > 0 ? (
                  <div className="space-y-3">
                    {contact.notes.map(note => (
                      <NoteItem key={note.id} note={note} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notes yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setNoteDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Add Note Dialog */}
      <AddNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        onSubmit={content => onAddNote?.(contact.id, content)}
      />
    </div>
  )
}

export default ContactProfile
