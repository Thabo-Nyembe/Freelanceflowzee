'use client'

// ComplianceStatus - Phase 8: Enterprise Security & Compliance
// Comprehensive compliance monitoring and reporting component

import React, { useState, useMemo } from 'react'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Info,
  Filter,
  Search,
  MoreVertical,
  Eye,
  FileCheck,
  FileClock,
  FileWarning,
  FileX,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Award,
  Building,
  Globe,
  Users,
  Lock,
  Database,
  Server,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ============================================================================
// Types
// ============================================================================

export type ComplianceFramework =
  | 'soc2'
  | 'gdpr'
  | 'hipaa'
  | 'pci_dss'
  | 'iso27001'
  | 'ccpa'
  | 'nist'
  | 'fedramp'
  | 'custom'

export type RequirementStatus =
  | 'compliant'
  | 'non_compliant'
  | 'partial'
  | 'not_applicable'
  | 'pending_review'
  | 'in_progress'

export type EvidenceType =
  | 'policy'
  | 'procedure'
  | 'screenshot'
  | 'log'
  | 'certificate'
  | 'audit_report'
  | 'attestation'
  | 'configuration'
  | 'other'

export type AssessmentType =
  | 'self_assessment'
  | 'internal_audit'
  | 'external_audit'
  | 'continuous_monitoring'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface ComplianceFrameworkConfig {
  id: ComplianceFramework
  name: string
  description: string
  icon: React.ElementType
  color: string
  version?: string
  authority?: string
  website?: string
}

export interface ComplianceRequirement {
  id: string
  framework: ComplianceFramework
  requirement_id: string
  title: string
  description: string
  category: string
  subcategory?: string
  status: RequirementStatus
  risk_level: RiskLevel
  owner?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  due_date?: string
  last_assessed: string
  next_assessment?: string
  evidence: ComplianceEvidence[]
  controls: string[]
  notes?: string
  remediation_plan?: string
  exceptions?: ComplianceException[]
}

export interface ComplianceEvidence {
  id: string
  type: EvidenceType
  name: string
  description?: string
  url?: string
  uploaded_at: string
  uploaded_by?: string
  valid_until?: string
  is_current: boolean
}

export interface ComplianceException {
  id: string
  reason: string
  approved_by: string
  approved_at: string
  expires_at?: string
  is_active: boolean
}

export interface ComplianceAssessment {
  id: string
  framework: ComplianceFramework
  type: AssessmentType
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_date: string
  completed_date?: string
  assessor?: string
  findings_count?: number
  score?: number
  report_url?: string
}

export interface ComplianceMetrics {
  overall_score: number
  by_framework: Record<ComplianceFramework, {
    score: number
    compliant: number
    non_compliant: number
    partial: number
    pending: number
    total: number
  }>
  trend: {
    date: string
    score: number
  }[]
  risk_distribution: Record<RiskLevel, number>
  upcoming_deadlines: {
    requirement_id: string
    title: string
    framework: ComplianceFramework
    due_date: string
  }[]
}

// ============================================================================
// Props
// ============================================================================

export interface ComplianceStatusProps {
  requirements: ComplianceRequirement[]
  assessments?: ComplianceAssessment[]
  metrics?: ComplianceMetrics
  enabledFrameworks?: ComplianceFramework[]

  // Configuration
  variant?: 'full' | 'compact' | 'overview'
  showMetrics?: boolean
  showAssessments?: boolean
  showEvidence?: boolean

  // Callbacks
  onRefresh?: () => Promise<void>
  onExport?: (format: 'csv' | 'json' | 'pdf', framework?: ComplianceFramework) => Promise<void>
  onRequirementClick?: (requirement: ComplianceRequirement) => void
  onUploadEvidence?: (requirementId: string, file: File) => Promise<void>
  onUpdateStatus?: (requirementId: string, status: RequirementStatus) => Promise<void>
  onScheduleAssessment?: (framework: ComplianceFramework, date: string) => Promise<void>

  isLoading?: boolean
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const FRAMEWORK_CONFIG: Record<ComplianceFramework, ComplianceFrameworkConfig> = {
  soc2: {
    id: 'soc2',
    name: 'SOC 2',
    description: 'Service Organization Control 2',
    icon: ShieldCheck,
    color: 'bg-blue-500',
    authority: 'AICPA',
    website: 'https://www.aicpa.org/soc',
  },
  gdpr: {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    icon: Globe,
    color: 'bg-purple-500',
    authority: 'European Union',
    website: 'https://gdpr.eu/',
  },
  hipaa: {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    icon: Building,
    color: 'bg-green-500',
    authority: 'HHS',
    website: 'https://www.hhs.gov/hipaa',
  },
  pci_dss: {
    id: 'pci_dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    icon: Lock,
    color: 'bg-yellow-500',
    authority: 'PCI SSC',
    version: '4.0',
    website: 'https://www.pcisecuritystandards.org/',
  },
  iso27001: {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Information Security Management',
    icon: Award,
    color: 'bg-indigo-500',
    authority: 'ISO',
    version: '2022',
    website: 'https://www.iso.org/standard/27001',
  },
  ccpa: {
    id: 'ccpa',
    name: 'CCPA',
    description: 'California Consumer Privacy Act',
    icon: Users,
    color: 'bg-orange-500',
    authority: 'California',
    website: 'https://oag.ca.gov/privacy/ccpa',
  },
  nist: {
    id: 'nist',
    name: 'NIST CSF',
    description: 'NIST Cybersecurity Framework',
    icon: Target,
    color: 'bg-cyan-500',
    authority: 'NIST',
    version: '2.0',
    website: 'https://www.nist.gov/cyberframework',
  },
  fedramp: {
    id: 'fedramp',
    name: 'FedRAMP',
    description: 'Federal Risk and Authorization Management Program',
    icon: Server,
    color: 'bg-red-500',
    authority: 'US Government',
    website: 'https://www.fedramp.gov/',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    description: 'Custom Compliance Framework',
    icon: FileText,
    color: 'bg-gray-500',
  },
}

const STATUS_CONFIG: Record<RequirementStatus, { label: string; color: string; icon: React.ElementType }> = {
  compliant: {
    label: 'Compliant',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2,
  },
  non_compliant: {
    label: 'Non-Compliant',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
  },
  partial: {
    label: 'Partial',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: AlertTriangle,
  },
  not_applicable: {
    label: 'N/A',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    icon: Info,
  },
  pending_review: {
    label: 'Pending Review',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    icon: Activity,
  },
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-green-600' },
  medium: { label: 'Medium', color: 'text-yellow-600' },
  high: { label: 'High', color: 'text-orange-600' },
  critical: { label: 'Critical', color: 'text-red-600' },
}

const EVIDENCE_ICONS: Record<EvidenceType, React.ElementType> = {
  policy: FileText,
  procedure: FileText,
  screenshot: Eye,
  log: Database,
  certificate: Award,
  audit_report: FileCheck,
  attestation: FileCheck,
  configuration: Server,
  other: FileText,
}

// ============================================================================
// Helper Components
// ============================================================================

function StatusBadge({ status }: { status: RequirementStatus }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge className={cn('gap-1 font-medium', config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const config = RISK_CONFIG[level]

  return (
    <span className={cn('text-xs font-medium', config.color)}>
      {config.label} Risk
    </span>
  )
}

function FrameworkBadge({ framework }: { framework: ComplianceFramework }) {
  const config = FRAMEWORK_CONFIG[framework]
  const Icon = config.icon

  return (
    <Badge variant="outline" className="gap-1">
      <div className={cn('w-2 h-2 rounded-full', config.color)} />
      {config.name}
    </Badge>
  )
}

function ComplianceGauge({
  score,
  size = 'default',
  showLabel = true
}: {
  score: number
  size?: 'small' | 'default' | 'large'
  showLabel?: boolean
}) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-500'
    if (s >= 70) return 'text-yellow-500'
    if (s >= 50) return 'text-orange-500'
    return 'text-red-500'
  }

  const getLabel = (s: number) => {
    if (s >= 90) return 'Excellent'
    if (s >= 70) return 'Good'
    if (s >= 50) return 'Needs Work'
    return 'Critical'
  }

  const sizeConfig = {
    small: { container: 'w-16 h-16', text: 'text-lg', label: 'text-[10px]' },
    default: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' },
    large: { container: 'w-36 h-36', text: 'text-4xl', label: 'text-sm' },
  }

  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn('relative', config.container)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn('transition-all duration-500', getColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', config.text)}>
          {score}%
        </span>
        {showLabel && (
          <span className={cn('text-muted-foreground', config.label)}>
            {getLabel(score)}
          </span>
        )}
      </div>
    </div>
  )
}

function FrameworkCard({
  framework,
  stats,
  onClick
}: {
  framework: ComplianceFramework
  stats: {
    score: number
    compliant: number
    non_compliant: number
    partial: number
    pending: number
    total: number
  }
  onClick?: () => void
}) {
  const config = FRAMEWORK_CONFIG[framework]
  const Icon = config.icon

  return (
    <Card
      className={cn('cursor-pointer transition-all hover:shadow-md', onClick && 'hover:border-primary')}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white', config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{config.name}</CardTitle>
              <CardDescription className="text-xs">{config.description}</CardDescription>
            </div>
          </div>
          <ComplianceGauge score={stats.score} size="small" showLabel={false} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Compliance</span>
            <span className="font-medium">{stats.score}%</span>
          </div>
          <Progress value={stats.score} className="h-2" />
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <p className="font-medium text-green-600">{stats.compliant}</p>
              <p className="text-muted-foreground">Pass</p>
            </div>
            <div>
              <p className="font-medium text-red-600">{stats.non_compliant}</p>
              <p className="text-muted-foreground">Fail</p>
            </div>
            <div>
              <p className="font-medium text-yellow-600">{stats.partial}</p>
              <p className="text-muted-foreground">Partial</p>
            </div>
            <div>
              <p className="font-medium text-blue-600">{stats.pending}</p>
              <p className="text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RequirementRow({
  requirement,
  onClick,
  showEvidence = false
}: {
  requirement: ComplianceRequirement
  onClick?: () => void
  showEvidence?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const statusConfig = STATUS_CONFIG[requirement.status]
  const StatusIcon = statusConfig.icon

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div
        className={cn(
          'flex items-start gap-4 p-4 rounded-lg transition-colors',
          'hover:bg-muted/50 cursor-pointer',
          isExpanded && 'bg-muted/50'
        )}
        onClick={() => onClick?.()}
      >
        {/* Status Icon */}
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
          requirement.status === 'compliant' && 'bg-green-100 dark:bg-green-900/30',
          requirement.status === 'non_compliant' && 'bg-red-100 dark:bg-red-900/30',
          requirement.status === 'partial' && 'bg-yellow-100 dark:bg-yellow-900/30',
          requirement.status === 'pending_review' && 'bg-blue-100 dark:bg-blue-900/30',
          requirement.status === 'in_progress' && 'bg-purple-100 dark:bg-purple-900/30',
          requirement.status === 'not_applicable' && 'bg-gray-100 dark:bg-gray-800'
        )}>
          <StatusIcon className={cn('h-4 w-4', statusConfig.color.split(' ')[1])} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">
              {requirement.requirement_id}
            </span>
            <FrameworkBadge framework={requirement.framework} />
            <RiskBadge level={requirement.risk_level} />
          </div>
          <h4 className="font-medium mt-1">{requirement.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {requirement.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{requirement.evidence.length} evidence</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Assessed: {format(parseISO(requirement.last_assessed), 'MMM d, yyyy')}</span>
            </div>
            {requirement.due_date && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Due: {format(parseISO(requirement.due_date), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <StatusBadge status={requirement.status} />
          <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className="ml-12 pl-4 py-4 border-l-2 border-muted space-y-4">
          {/* Controls */}
          {requirement.controls.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Controls</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {requirement.controls.map((control) => (
                  <Badge key={control} variant="secondary" className="text-xs">
                    {control}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {showEvidence && requirement.evidence.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Evidence</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {requirement.evidence.slice(0, 4).map((evidence) => {
                  const EvidenceIcon = EVIDENCE_ICONS[evidence.type]
                  return (
                    <div
                      key={evidence.id}
                      className="flex items-center gap-2 p-2 rounded border text-sm"
                    >
                      <EvidenceIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{evidence.name}</span>
                      {evidence.url && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" asChild>
                          <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
              {requirement.evidence.length > 4 && (
                <Button variant="link" size="sm" className="mt-1 h-auto p-0">
                  +{requirement.evidence.length - 4} more
                </Button>
              )}
            </div>
          )}

          {/* Notes / Remediation */}
          {requirement.notes && (
            <div>
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <p className="text-sm mt-1">{requirement.notes}</p>
            </div>
          )}

          {requirement.remediation_plan && requirement.status !== 'compliant' && (
            <div>
              <Label className="text-xs text-muted-foreground">Remediation Plan</Label>
              <p className="text-sm mt-1">{requirement.remediation_plan}</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function UpcomingDeadlines({
  deadlines
}: {
  deadlines: {
    requirement_id: string
    title: string
    framework: ComplianceFramework
    due_date: string
  }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming deadlines
          </p>
        ) : (
          <div className="space-y-3">
            {deadlines.slice(0, 5).map((deadline) => {
              const daysUntil = Math.ceil(
                (parseISO(deadline.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
              const isUrgent = daysUntil <= 7
              const isOverdue = daysUntil < 0

              return (
                <div key={deadline.requirement_id} className="flex items-start gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2',
                    isOverdue ? 'bg-red-500' : isUrgent ? 'bg-yellow-500' : 'bg-blue-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FrameworkBadge framework={deadline.framework} />
                      <span className="text-xs text-muted-foreground">
                        {deadline.requirement_id}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{deadline.title}</p>
                    <p className={cn(
                      'text-xs',
                      isOverdue ? 'text-red-600' : isUrgent ? 'text-yellow-600' : 'text-muted-foreground'
                    )}>
                      {isOverdue
                        ? `${Math.abs(daysUntil)} days overdue`
                        : `Due in ${daysUntil} days`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function ComplianceStatus({
  requirements,
  assessments = [],
  metrics,
  enabledFrameworks = ['soc2', 'gdpr', 'hipaa', 'pci_dss', 'iso27001'],
  variant = 'full',
  showMetrics = true,
  showAssessments = true,
  showEvidence = true,
  onRefresh,
  onExport,
  onRequirementClick,
  onUploadEvidence,
  onUpdateStatus,
  onScheduleAssessment,
  isLoading = false,
  className,
}: ComplianceStatusProps) {
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filter requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      if (selectedFramework !== 'all' && req.framework !== selectedFramework) return false
      if (statusFilter !== 'all' && req.status !== statusFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          req.title.toLowerCase().includes(query) ||
          req.description.toLowerCase().includes(query) ||
          req.requirement_id.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [requirements, selectedFramework, statusFilter, searchQuery])

  // Calculate stats by framework
  const frameworkStats = useMemo(() => {
    const stats: Record<ComplianceFramework, {
      score: number
      compliant: number
      non_compliant: number
      partial: number
      pending: number
      total: number
    }> = {} as Record<ComplianceFramework, {
      score: number
      compliant: number
      non_compliant: number
      partial: number
      pending: number
      total: number
    }>

    enabledFrameworks.forEach((fw) => {
      const fwReqs = requirements.filter((r) => r.framework === fw)
      const compliant = fwReqs.filter((r) => r.status === 'compliant').length
      const total = fwReqs.filter((r) => r.status !== 'not_applicable').length

      stats[fw] = {
        score: total > 0 ? Math.round((compliant / total) * 100) : 0,
        compliant,
        non_compliant: fwReqs.filter((r) => r.status === 'non_compliant').length,
        partial: fwReqs.filter((r) => r.status === 'partial').length,
        pending: fwReqs.filter((r) => r.status === 'pending_review' || r.status === 'in_progress').length,
        total: fwReqs.length,
      }
    })

    return stats
  }, [requirements, enabledFrameworks])

  // Overall stats
  const overallStats = useMemo(() => {
    const applicableReqs = requirements.filter((r) => r.status !== 'not_applicable')
    const compliant = requirements.filter((r) => r.status === 'compliant').length

    return {
      score: applicableReqs.length > 0 ? Math.round((compliant / applicableReqs.length) * 100) : 0,
      compliant,
      non_compliant: requirements.filter((r) => r.status === 'non_compliant').length,
      partial: requirements.filter((r) => r.status === 'partial').length,
      pending: requirements.filter((r) => r.status === 'pending_review' || r.status === 'in_progress').length,
      total: requirements.length,
    }
  }, [requirements])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Overview variant
  if (variant === 'overview') {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Compliance Overview</CardTitle>
          <ComplianceGauge score={overallStats.score} size="small" showLabel={false} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{overallStats.compliant}</p>
                <p className="text-xs text-muted-foreground">Compliant</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{overallStats.non_compliant}</p>
                <p className="text-xs text-muted-foreground">Non-Compliant</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{overallStats.partial}</p>
                <p className="text-xs text-muted-foreground">Partial</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{overallStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              {enabledFrameworks.slice(0, 4).map((fw) => {
                const stats = frameworkStats[fw]
                const config = FRAMEWORK_CONFIG[fw]
                return (
                  <div key={fw} className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', config.color)} />
                    <span className="text-sm flex-1">{config.name}</span>
                    <span className="text-sm font-medium">{stats.score}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full variant
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance Status</h2>
          <p className="text-muted-foreground">
            Monitor compliance across {enabledFrameworks.length} frameworks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          )}

          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('pdf')}>
                  Export Report (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  Export Data (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  Export Data (JSON)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-12 gap-6">
          {/* Overall Score */}
          <Card className="col-span-12 md:col-span-4">
            <CardHeader>
              <CardTitle className="text-base">Overall Compliance</CardTitle>
              <CardDescription>Across all frameworks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ComplianceGauge score={overallStats.score} size="large" />
              <div className="grid grid-cols-4 gap-4 w-full mt-6 text-center">
                <div>
                  <p className="text-lg font-bold text-green-600">{overallStats.compliant}</p>
                  <p className="text-xs text-muted-foreground">Compliant</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-600">{overallStats.non_compliant}</p>
                  <p className="text-xs text-muted-foreground">Non-Compliant</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-600">{overallStats.partial}</p>
                  <p className="text-xs text-muted-foreground">Partial</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{overallStats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Framework Cards */}
          <div className="col-span-12 md:col-span-8 grid grid-cols-2 gap-4">
            {enabledFrameworks.slice(0, 4).map((fw) => (
              <FrameworkCard
                key={fw}
                framework={fw}
                stats={frameworkStats[fw]}
                onClick={() => setSelectedFramework(fw)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Deadlines */}
      {metrics?.upcoming_deadlines && metrics.upcoming_deadlines.length > 0 && (
        <UpcomingDeadlines deadlines={metrics.upcoming_deadlines} />
      )}

      {/* Requirements List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Requirements</CardTitle>
              <CardDescription>
                {filteredRequirements.length} of {requirements.length} requirements
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>

              {/* Framework Filter */}
              <Select value={selectedFramework} onValueChange={(v) => setSelectedFramework(v as ComplianceFramework | 'all')}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  {enabledFrameworks.map((fw) => (
                    <SelectItem key={fw} value={fw}>
                      {FRAMEWORK_CONFIG[fw].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequirementStatus | 'all')}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No requirements found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredRequirements.map((req) => (
                  <RequirementRow
                    key={req.id}
                    requirement={req}
                    onClick={() => onRequirementClick?.(req)}
                    showEvidence={showEvidence}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Assessments */}
      {showAssessments && assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessments.slice(0, 5).map((assessment) => {
                const config = FRAMEWORK_CONFIG[assessment.framework]
                return (
                  <div key={assessment.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white', config.color)}>
                      {React.createElement(config.icon, { className: 'h-5 w-5' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.name}</span>
                        <Badge variant="outline" className="capitalize">
                          {assessment.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {assessment.status === 'completed'
                          ? `Completed ${format(parseISO(assessment.completed_date!), 'MMM d, yyyy')}`
                          : `Scheduled for ${format(parseISO(assessment.scheduled_date), 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    {assessment.score !== undefined && (
                      <div className="text-right">
                        <p className="text-2xl font-bold">{assessment.score}%</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    )}
                    {assessment.report_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={assessment.report_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-1" />
                          Report
                        </a>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ComplianceStatus
