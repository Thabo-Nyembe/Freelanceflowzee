'use client'

import { useState, useMemo } from 'react'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { toast } from 'sonner'
import { useCompliance, type Compliance as HookCompliance } from '@/lib/hooks/use-compliance'
import { useApiKeys } from '@/lib/hooks/use-api-keys'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ShieldCheck, FileCheck, AlertTriangle, CheckCircle2, XCircle, Clock, Plus,
  Search, Filter, Eye, Upload, Download, Calendar, Users,
  FileText, Target,
  Settings, History, Lock, BarChart3,
  ClipboardCheck, ClipboardList, Scale, Building, Globe,
  Shield, Zap, RefreshCw,
  Key, Webhook, Mail, Database, AlertOctagon, Trash2, Copy, Bell,
  GitBranch, FileCode, Cpu, CheckCircle, Send, Loader2
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

// ServiceNow GRC level interfaces
interface ComplianceFramework {
  id: string
  name: string
  shortName: string
  description: string
  version: string
  totalControls: number
  passedControls: number
  failedControls: number
  pendingControls: number
  complianceScore: number
  status: 'compliant' | 'non_compliant' | 'partial' | 'under_review'
  lastAssessment: string
  nextAssessment: string
  icon: string
}

interface Control {
  id: string
  controlId: string
  name: string
  description: string
  framework: string
  category: string
  status: 'passed' | 'failed' | 'pending' | 'not_applicable'
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  owner: string
  ownerAvatar: string
  lastTested: string
  evidence: Evidence[]
  findings: number
  remediation?: string
}

interface Evidence {
  id: string
  name: string
  type: 'document' | 'screenshot' | 'log' | 'certificate' | 'report'
  uploadedAt: string
  uploadedBy: string
  status: 'approved' | 'pending' | 'rejected'
  fileSize: string
}

interface Risk {
  id: string
  name: string
  description: string
  category: 'operational' | 'security' | 'financial' | 'compliance' | 'strategic'
  inherentRisk: number
  residualRisk: number
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain'
  impact: 'minimal' | 'minor' | 'moderate' | 'major' | 'severe'
  status: 'open' | 'mitigated' | 'accepted' | 'transferred'
  owner: string
  controls: string[]
  lastReview: string
}

interface Audit {
  id: string
  name: string
  type: 'internal' | 'external' | 'regulatory'
  framework: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  auditor: string
  findings: number
  criticalFindings: number
  progress: number
}

interface Policy {
  id: string
  name: string
  version: string
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  category: string
  owner: string
  lastUpdated: string
  nextReview: string
  acknowledgements: number
  totalEmployees: number
}

// MIGRATED: Batch #7 - Main compliance data now comes from Supabase via useCompliance hook
// Quick actions config for toolbar
const complianceQuickActionsBase = [
  { id: 'new-control', icon: <Plus className="h-4 w-4" />, label: 'New Control', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'assess', icon: <ClipboardCheck className="h-4 w-4" />, label: 'Assess', color: 'bg-blue-100 text-blue-600' },
  { id: 'report', icon: <FileText className="h-4 w-4" />, label: 'Report', color: 'bg-purple-100 text-purple-600' },
]
// Placeholder arrays for competitive upgrade components (empty until AI/collaboration features are implemented)
const complianceAIInsights: any[] = []
const complianceCollaborators: any[] = []
const compliancePredictions: any[] = []
const complianceActivities: any[] = []

// Helper function to generate compliance report (accepts data from hook)
const generateComplianceReport = (data: any[]) => ({
  generatedAt: new Date().toISOString(),
  compliance: data,
  summary: {
    totalItems: data.length,
    compliant: data.filter(c => c.status === 'compliant').length,
    nonCompliant: data.filter(c => c.status === 'non_compliant').length,
    pending: data.filter(c => c.status === 'pending').length,
    totalRequirements: data.reduce((sum, c) => sum + (c.totalRequirements || 0), 0),
    metRequirements: data.reduce((sum, c) => sum + (c.metRequirements || 0), 0),
    avgScore: data.length > 0 ? data.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / data.length : 0,
  }
})

// Helper function to download data as JSON
const downloadAsJson = (data: unknown, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Helper function to download data as CSV
const downloadAsCsv = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  ].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Helper function to copy text to clipboard
const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text)
}

export default function ComplianceClient() {
  // Demo mode detection for investor demos
  const { userId: currentUserId, userEmail, userName, isDemo, loading: sessionLoading } = useCurrentUser()
  const sessionStatus = sessionLoading ? "loading" : "authenticated"
  const isDemoAccount = userEmail === 'alex@freeflow.io' ||
                        userEmail === 'sarah@freeflow.io' ||
                        userEmail === 'mike@freeflow.io'
  const isSessionLoading = sessionStatus === 'loading'

  // Use the compliance hook for Supabase data
  const {
    compliance: hookCompliance,
    loading: hookLoading,
    error: hookError,
    createCompliance,
    updateCompliance,
    deleteCompliance,
    refetch
  } = useCompliance()

  // Demo compliance data for investor demos
  const demoCompliance: HookCompliance[] = useMemo(() => [
    {
      id: 'demo-comp-1',
      requirement: 'SOC 2 Type II Certification',
      status: 'compliant' as const,
      framework: 'SOC 2',
      category: 'Security',
      priority: 'high' as const,
      owner: 'Alex Johnson',
      due_date: '2026-03-15',
      notes: 'Annual certification renewal',
      evidence_links: ['https://example.com/soc2-cert.pdf'],
      last_audit_date: '2025-12-15',
      next_audit_date: '2026-03-15',
      audit_count: 3,
      risk_score: 15,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'demo-comp-2',
      requirement: 'GDPR Data Protection',
      status: 'compliant' as const,
      framework: 'GDPR',
      category: 'Privacy',
      priority: 'critical' as const,
      owner: 'Sarah Chen',
      due_date: '2026-05-25',
      notes: 'EU data processing compliance',
      evidence_links: ['https://example.com/gdpr-assessment.pdf'],
      last_audit_date: '2025-11-20',
      next_audit_date: '2026-05-25',
      audit_count: 2,
      risk_score: 20,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z'
    },
    {
      id: 'demo-comp-3',
      requirement: 'ISO 27001 Information Security',
      status: 'in_progress' as const,
      framework: 'ISO 27001',
      category: 'Security',
      priority: 'high' as const,
      owner: 'Mike Rodriguez',
      due_date: '2026-06-30',
      notes: 'Working towards certification',
      evidence_links: [],
      last_audit_date: '2025-09-01',
      next_audit_date: '2026-06-30',
      audit_count: 1,
      risk_score: 35,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2026-01-20T00:00:00Z'
    },
    {
      id: 'demo-comp-4',
      requirement: 'PCI DSS Payment Security',
      status: 'compliant' as const,
      framework: 'PCI DSS',
      category: 'Payment',
      priority: 'critical' as const,
      owner: 'Alex Johnson',
      due_date: '2026-04-01',
      notes: 'Level 1 merchant compliance',
      evidence_links: ['https://example.com/pci-cert.pdf'],
      last_audit_date: '2025-10-15',
      next_audit_date: '2026-04-01',
      audit_count: 4,
      risk_score: 10,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2026-01-05T00:00:00Z'
    },
    {
      id: 'demo-comp-5',
      requirement: 'HIPAA Healthcare Data',
      status: 'not_started' as const,
      framework: 'HIPAA',
      category: 'Healthcare',
      priority: 'medium' as const,
      owner: 'Sarah Chen',
      due_date: '2026-09-01',
      notes: 'Planned for Q3 2026',
      evidence_links: [],
      last_audit_date: null,
      next_audit_date: '2026-09-01',
      audit_count: 0,
      risk_score: 50,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    }
  ], [])

  // Use demo data for demo accounts
  const dbCompliance = isDemoAccount ? demoCompliance : (hookCompliance || [])
  const isLoading = isSessionLoading || (isDemoAccount ? false : hookLoading)
  const error = !isSessionLoading && !isDemoAccount && hookError

  // Use the API keys hook for token management
  const { createKey: createApiKey, deleteKey: deleteApiKey, keys: apiKeys } = useApiKeys()

  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  const [activeTab, setActiveTab] = useState('frameworks')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null)
  const [selectedControl, setSelectedControl] = useState<Control | null>(null)
  const [showControlDialog, setShowControlDialog] = useState(false)
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false)
  const [showFrameworkDialog, setShowFrameworkDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states handlers
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showPolicyDialog, setShowPolicyDialog] = useState(false)
  const [showEvidenceUploadDialog, setShowEvidenceUploadDialog] = useState(false)
  const [showTrainingDialog, setShowTrainingDialog] = useState(false)

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states for dialogs
  const [importFile, setImportFile] = useState<File | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    framework: 'SOC 2',
    type: 'internal' as 'internal' | 'external' | 'regulatory',
    startDate: '',
    endDate: '',
    auditor: ''
  })
  const [assignForm, setAssignForm] = useState({
    selectedAudit: '',
    selectedMember: '',
    role: 'auditor'
  })

  // Policy form state
  const [policyForm, setPolicyForm] = useState({
    name: '',
    version: '1.0',
    category: 'security',
    description: '',
    status: 'draft' as 'draft' | 'review' | 'approved' | 'published' | 'archived'
  })

  // Evidence form state
  const [evidenceForm, setEvidenceForm] = useState({
    name: '',
    type: 'document' as 'document' | 'screenshot' | 'log' | 'certificate' | 'report',
    controlId: '',
    file: null as File | null
  })

  // Training form state
  const [trainingForm, setTrainingForm] = useState({
    name: '',
    description: '',
    dueDate: '',
    assignedTo: [] as string[],
    status: 'pending' as 'pending' | 'in_progress' | 'completed'
  })

  // Selected items for editing
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)

  // State for controls and risks to enable real updates
  const [controls, setControls] = useState([])
  const [risks, setRisks] = useState([])
  const [audits, setAudits] = useState([])
  const [policies, setPolicies] = useState([])
  const [frameworks, setFrameworks] = useState([])

  // Map DB compliance data to UI format using useMemo
  const complianceData = useMemo(() => {
    if (!dbCompliance) return []
    return dbCompliance.map((item: HookCompliance) => ({
      id: item.id,
      name: item.compliance_name,
      description: item.description || '',
      type: item.compliance_type,
      framework: item.framework || '',
      status: item.status,
      isCompliant: item.is_compliant,
      complianceScore: item.compliance_score || 0,
      totalRequirements: item.total_requirements,
      metRequirements: item.met_requirements,
      pendingRequirements: item.pending_requirements,
      failedRequirements: item.failed_requirements,
      riskLevel: item.risk_level,
      lastAuditDate: item.last_audit_date,
      nextAuditDate: item.next_audit_date,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  }, [dbCompliance])

  const getFrameworkStatusColor = (status: ComplianceFramework['status']) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'non_compliant': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'partial': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'under_review': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const getControlStatusColor = (status: Control['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'not_applicable': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getRiskLevelColor = (level: Control['riskLevel']) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const stats = useMemo(() => {
    const compliance = complianceData || []
    const avgScore = compliance.length > 0
      ? compliance.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / compliance.length
      : 0
    const totalControls = compliance.reduce((sum, c) => sum + (c.totalRequirements || 0), 0)
    const passedControls = compliance.reduce((sum, c) => sum + (c.metRequirements || 0), 0)
    const failedControls = compliance.reduce((sum, c) => sum + (c.failedRequirements || 0), 0)
    const openRisks = compliance.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length
    const activeAudits = compliance.filter(c => c.status === 'in_progress' || c.status === 'under_review').length

    return {
      overallCompliance: avgScore,
      totalControls,
      passedControls,
      failedControls,
      openRisks,
      activeAudits
    }
  }, [complianceData])

  // Loading state - after all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state - after all hooks
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Error loading compliance data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  // Handlers with real functionality
  const handleRunAudit = async () => {
    try {
      toast.loading('Running compliance audit...', { id: 'audit' })

      // Update all compliance items to mark them as audited
      const auditDate = new Date().toISOString()
      const updatePromises = (dbCompliance || []).map(item =>
        updateCompliance({
          id: item.id,
          last_audit_date: auditDate,
          audit_count: (item.audit_count || 0) + 1,
          updated_at: auditDate
        })
      )

      await Promise.all(updatePromises)

      // Update local controls state
      setControls(prev => prev.map(c => ({
        ...c,
        lastTested: auditDate.split('T')[0]
      })))

      // Refresh compliance data from database
      await refetch()

      toast.success('Audit completed successfully! Controls updated.', { id: 'audit' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Audit failed', { id: 'audit' })
    }
  }

  const handleGenerateReport = async () => {
    try {
      toast.loading('Generating report...', { id: 'report' })

      // Generate comprehensive compliance report from current data
      const report = generateComplianceReport(complianceData)

      // Add additional metadata to report
      const fullReport = {
        ...report,
        metadata: {
          generatedBy: 'FreeFlow Compliance Module',
          version: '1.0',
          format: 'JSON',
          includesFrameworks: true,
          includesControls: true,
          includesRisks: true
        },
        frameworks: frameworks,
        controls: controls,
        risks: risks,
        audits: audits,
        policies: policies
      }

      // Download the report
      downloadAsJson(fullReport, `compliance-report-${new Date().toISOString().split('T')[0]}.json`)

      toast.success('Report generated and downloaded!', { id: 'report' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate report', { id: 'report' })
    }
  }

  const handleResolveIssue = (id: string) => {
    toast.success('Resolving issue...')
    fetch('/api/compliance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve_issue', issueId: id })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to resolve')
        return res.json()
      })
      .then(() => {
        setRisks(prev => prev.map(r => r.id === id ? { ...r, status: 'mitigated' as const } : r))
        toast.success(`Issue #${id} resolved and status updated`)
      })
      .catch(err => toast.error(err.message || 'Failed to resolve'))
  }

  const handleExport = async () => {
    try {
      toast.loading('Exporting data...', { id: 'export' })

      // Prepare comprehensive export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0',
        compliance: complianceData,
        frameworks: frameworks,
        controls: controls,
        risks: risks,
        audits: audits,
        policies: policies,
        summary: {
          totalCompliance: complianceData.length,
          totalFrameworks: frameworks.length,
          totalControls: controls.length,
          totalRisks: risks.length,
          totalAudits: audits.length,
          totalPolicies: policies.length,
          overallComplianceScore: stats.overallCompliance
        }
      }

      // Export as JSON
      downloadAsJson(exportData, `compliance-export-${new Date().toISOString().split('T')[0]}.json`)

      // Also create CSV export for compliance data if available
      if (complianceData.length > 0) {
        const csvData = complianceData.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          framework: item.framework,
          status: item.status,
          complianceScore: item.complianceScore,
          totalRequirements: item.totalRequirements,
          metRequirements: item.metRequirements,
          riskLevel: item.riskLevel,
          lastAuditDate: item.lastAuditDate,
          nextAuditDate: item.nextAuditDate
        }))
        downloadAsCsv(csvData, `compliance-data-${new Date().toISOString().split('T')[0]}.csv`)
      }

      toast.success('Export downloaded!', { id: 'export' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed', { id: 'export' })
    }
  }

  const handleCopyApiToken = () => {
    const apiToken = 'grc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    toast.promise(
      copyToClipboard(apiToken),
      { loading: 'Copying to clipboard...', success: 'API token copied to clipboard', error: 'Failed to copy token' }
    )
  }

  const handleRegenerateToken = async () => {
    try {
      toast.loading('Regenerating API token...', { id: 'token' })

      // Delete existing Compliance API Token if it exists
      const existingKey = apiKeys?.find(k => k.name === 'Compliance API Token')
      if (existingKey) {
        await deleteApiKey(existingKey.id)
      }

      // Create new API key using the useApiKeys hook
      const result = await createApiKey({
        name: 'Compliance API Token',
        description: 'Auto-generated token for compliance module access',
        key_type: 'api',
        permission: 'write',
        scopes: ['compliance:read', 'compliance:write', 'audit:read', 'audit:write'],
        environment: 'production',
        rate_limit_per_hour: 1000,
        tags: ['compliance', 'auto-generated']
      })

      // Copy the new token to clipboard if available
      if (result && result.key_value) {
        await copyToClipboard(result.key_value)
        toast.success('New API token generated and copied to clipboard!', { id: 'token', description: `New token: ${result.key_prefix}` })
      } else {
        toast.success('New API token generated successfully!', { id: 'token' })
      }
    } catch (err) {
      toast.error('Failed to regenerate token', { id: 'token' })
    }
  }

  const handleTestWebhook = (url?: string) => {
    if (!url) {
      toast.error('No webhook URL provided')
      return
    }
    toast.success('Testing webhook connection...')
    fetch('/api/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test_webhook', webhookUrl: url })
    })
      .then(res => {
        if (!res.ok) throw new Error('Webhook test failed')
        return res.json()
      })
      .then(() => toast.success('Webhook test successful!'))
      .catch(err => toast.error(err.message || 'Webhook test failed'))
  }

  const handleResetControls = async () => {
    try {
      // Confirm before reset
      if (!confirm('Are you sure you want to reset all controls? This will clear local state and refresh from the database.')) {
        return
      }

      toast.loading('Resetting all controls...', { id: 'reset' })

      // Reset local state
      setControls([])
      setRisks([])
      setAudits([])
      setPolicies([])
      setFrameworks([])

      // Reset selected items
      setSelectedFramework(null)
      setSelectedControl(null)

      // Reset form states
      setScheduleForm({
        name: '',
        framework: 'SOC 2',
        type: 'internal',
        startDate: '',
        endDate: '',
        auditor: ''
      })
      setAssignForm({
        selectedAudit: '',
        selectedMember: '',
        role: 'auditor'
      })

      // Refetch compliance data from database to get fresh state
      await refetch()

      toast.success('Controls reset successfully', { id: 'reset' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed', { id: 'reset' })
    }
  }

  const handleDeleteEvidence = () => {
    if (!confirm('Are you sure you want to delete all evidence? This action cannot be undone.')) {
      return
    }
    toast.success('Deleting all evidence...')
    fetch('/api/compliance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_evidence' })
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed')
        return res.json()
      })
      .then(() => {
        setControls(prev => prev.map(c => ({ ...c, evidence: [] })))
        toast.success('Evidence deleted')
      })
      .catch(err => toast.error(err.message || 'Delete failed'))
  }

  const handleConnectService = (serviceName: string, connected: boolean) => {
    toast.success(`${connected ? 'Configuring' : 'Connecting'} ${serviceName}...`)
    fetch('/api/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'connect_service', serviceName, connected })
    })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to ${connected ? 'configure' : 'connect'}`)
        return res.json()
      })
      .then(() => toast.success(`${serviceName} ${connected ? 'configured' : 'connected'}!`))
      .catch(err => toast.error(err.message || `Failed to ${connected ? 'configure' : 'connect'}`))
  }

  // Quick actions with real handlers for the QuickActionsToolbar
  const complianceQuickActions = complianceQuickActionsBase.map(action => ({
    ...action,
    action: action.label === 'New Control'
      ? () => {
          toast.success('Creating compliance control...')
          fetch('/api/compliance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create_control' })
          })
            .then(res => {
              if (!res.ok) throw new Error('Failed to create control')
              return res.json()
            })
            .then(() => {
              setControls(prev => [...prev, {
                id: `ctrl${prev.length + 1}`,
                controlId: `NEW.${prev.length + 1}`,
                name: 'New Control',
                description: 'New control added - configure requirements',
                framework: 'Custom',
                category: 'General',
                status: 'pending' as const,
                riskLevel: 'medium' as const,
                owner: 'Current User',
                ownerAvatar: '',
                lastTested: new Date().toISOString().split('T')[0],
                evidence: [],
                findings: 0
              }])
              toast.success('New control created! Configure requirements and evidence')
            })
            .catch(err => toast.error(err.message || 'Failed to create control'))
        }
      : action.label === 'Assess'
      ? () => handleRunAudit()
      : () => handleGenerateReport()
  }))

  // Handler for quick action buttons in tabs
  const handleQuickAction = (actionLabel: string) => {
    switch (actionLabel) {
      case 'Add Framework':
      case 'Add Control':
      case 'Add Risk':
      case 'New Audit':
      case 'New Policy':
        toast.success(`Creating ${actionLabel.replace('Add ', '').replace('New ', '')}...`)
        fetch('/api/compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_item', itemType: actionLabel })
        })
          .then(res => {
            if (!res.ok) throw new Error('Action failed')
            return res.json()
          })
          .then(() => toast.success(`${actionLabel.replace('Add ', '').replace('New ', '')} created successfully`))
          .catch(err => toast.error(err.message || 'Action failed'))
        break
      case 'Audit':
      case 'Test All':
      case 'Assess':
        handleRunAudit()
        break
      case 'Reports':
        handleGenerateReport()
        break
      case 'Export':
        handleExport()
        break
      case 'Sync':
      case 'Refresh':
        toast.success('Syncing data...')
        refetch()
          .then(() => {
            toast.success('Data synced successfully')
          })
          .catch((err: Error) => toast.error(err.message || 'Sync failed'))
        break
      case 'Settings':
        setActiveTab('settings')
        toast.success('Navigated to settings')
        break
      case 'Controls':
      case 'Evidence':
        setActiveTab(actionLabel.toLowerCase())
        toast.success(`Viewing ${actionLabel}`)
        break
      case 'Gaps':
      case 'Failures':
      case 'Critical':
        toast.success(`Finding ${actionLabel.toLowerCase()}...`)
        fetch('/api/compliance?action=find_issues&type=' + actionLabel.toLowerCase())
          .then(res => {
            if (!res.ok) throw new Error('Action failed')
            return res.json()
          })
          .then(() => {
            const failedControls = controls.filter(c => c.status === 'failed')
            if (failedControls.length > 0) {
              downloadAsJson(failedControls, `${actionLabel.toLowerCase()}-report.json`)
            }
            toast.success(`Found ${failedControls.length} items - report downloaded`)
          })
          .catch(err => toast.error(err.message || 'Action failed'))
        break
      case 'Import':
        setShowImportDialog(true)
        break
      case 'Matrix':
        toast.success('Generating risk matrix...')
        fetch('/api/compliance?action=generate_matrix')
          .then(res => {
            if (!res.ok) throw new Error('Failed to generate matrix')
            return res.json()
          })
          .then(() => {
            const matrix = risks.map(r => ({
              name: r.name,
              likelihood: r.likelihood,
              impact: r.impact,
              inherentRisk: r.inherentRisk,
              residualRisk: r.residualRisk
            }))
            downloadAsJson(matrix, 'risk-matrix.json')
            toast.success('Risk matrix downloaded')
          })
          .catch(err => toast.error(err.message || 'Failed to generate matrix'))
        break
      case 'Mitigate':
        toast.success('Mitigating open risks...')
        fetch('/api/compliance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mitigate_risks' })
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to mitigate')
            return res.json()
          })
          .then(() => {
            setRisks(prev => prev.map(r => r.status === 'open' ? { ...r, status: 'mitigated' as const } : r))
            toast.success('All open risks marked as mitigated')
          })
          .catch(err => toast.error(err.message || 'Failed to mitigate'))
        break
      case 'Schedule':
        setShowScheduleDialog(true)
        break
      case 'Findings':
        toast.success('Compiling findings...')
        fetch('/api/compliance?action=compile_findings')
          .then(res => {
            if (!res.ok) throw new Error('Failed to compile findings')
            return res.json()
          })
          .then(() => {
            const findings = audits.flatMap(a => ({ audit: a.name, findings: a.findings, critical: a.criticalFindings }))
            downloadAsJson(findings, 'audit-findings.json')
            toast.success('Findings report downloaded')
          })
          .catch(err => toast.error(err.message || 'Failed to compile findings'))
        break
      case 'Assign':
        setShowAssignDialog(true)
        break
      case 'Templates':
        toast.info('Opening policy templates library browser')
        break
      case 'Approve':
        toast.success('Approving policies...')
        fetch('/api/compliance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve_policies' })
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to approve')
            return res.json()
          })
          .then(() => {
            setPolicies(prev => prev.map(p => p.status === 'review' ? { ...p, status: 'approved' as const } : p))
            toast.success('All policies in review approved')
          })
          .catch(err => toast.error(err.message || 'Failed to approve'))
        break
      case 'Versions':
        toast.info('Opening version history viewer')
        break
      case 'Attestation':
        toast.info('Opening attestation tracking dashboard')
        break
      case 'Distribute':
        toast.success('Distributing policies...')
        fetch('/api/compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'distribute_policies' })
        })
          .then(res => {
            if (!res.ok) throw new Error('Distribution failed')
            return res.json()
          })
          .then(() => {
            const distributed = policies.filter(p => p.status === 'published').length
            toast.success(`${distributed} policies distributed to employees`)
          })
          .catch(err => toast.error(err.message || 'Distribution failed'))
        break
      default:
        toast.info(`${actionLabel} action initiated`)
        break
    }
  }

  // ===== Policy Handlers =====
  const handleCreatePolicy = async () => {
    if (!policyForm.name.trim()) {
      toast.error('Policy name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'policy',
          name: policyForm.name,
          version: policyForm.version,
          category: policyForm.category,
          description: policyForm.description,
          status: policyForm.status
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create policy')
      }

      const { data } = await response.json()

      // Update local state
      setPolicies(prev => [...prev, {
        id: data.id,
        name: data.name,
        version: data.version || '1.0',
        status: data.status || 'draft',
        category: data.category || 'General',
        owner: 'Current User',
        lastUpdated: new Date().toISOString().split('T')[0],
        nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        acknowledgements: 0,
        totalEmployees: 250
      }])

      // Reset form and close dialog
      setPolicyForm({
        name: '',
        version: '1.0',
        category: 'security',
        description: '',
        status: 'draft'
      })
      setShowPolicyDialog(false)
      toast.success('Policy created successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create policy')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePolicy = async (policyId: string, updates: Partial<Policy>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: policyId,
          type: 'policy',
          ...updates,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update policy')
      }

      // Update local state
      setPolicies(prev => prev.map(p =>
        p.id === policyId ? { ...p, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : p
      ))

      toast.success('Policy updated successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update policy')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/compliance?id=${policyId}&type=policy`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete policy')
      }

      // Update local state
      setPolicies(prev => prev.filter(p => p.id !== policyId))
      toast.success('Policy deleted successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete policy')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== Audit Handlers =====
  const handleCreateAudit = async () => {
    if (!scheduleForm.name.trim()) {
      toast.error('Audit name is required')
      return
    }
    if (!scheduleForm.startDate || !scheduleForm.endDate) {
      toast.error('Start and end dates are required')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'audit',
          name: scheduleForm.name,
          audit_type: scheduleForm.type,
          framework: scheduleForm.framework,
          audit_date: scheduleForm.startDate,
          end_date: scheduleForm.endDate,
          auditor: scheduleForm.auditor || 'Internal Audit Team',
          status: 'scheduled'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create audit')
      }

      const { data } = await response.json()

      // Update local state
      const newAudit: Audit = {
        id: data.id,
        name: data.name || scheduleForm.name,
        type: scheduleForm.type,
        framework: scheduleForm.framework,
        status: 'planned',
        startDate: scheduleForm.startDate,
        endDate: scheduleForm.endDate,
        auditor: scheduleForm.auditor || 'Internal Audit Team',
        findings: 0,
        criticalFindings: 0,
        progress: 0
      }
      setAudits(prev => [...prev, newAudit])

      // Reset form and close dialog
      setScheduleForm({
        name: '',
        framework: 'SOC 2',
        type: 'internal',
        startDate: '',
        endDate: '',
        auditor: ''
      })
      setShowScheduleDialog(false)
      toast.success(`Audit "${newAudit.name}" scheduled for ${new Date(newAudit.startDate).toLocaleDateString()}`)
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create audit')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteAudit = async (auditId: string, findings?: { total: number; critical: number }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: auditId,
          type: 'audit',
          status: 'completed',
          findings: findings?.total || 0,
          critical_findings: findings?.critical || 0,
          completed_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete audit')
      }

      // Update local state
      setAudits(prev => prev.map(a =>
        a.id === auditId
          ? {
              ...a,
              status: 'completed' as const,
              progress: 100,
              findings: findings?.total || a.findings,
              criticalFindings: findings?.critical || a.criticalFindings
            }
          : a
      ))

      toast.success('Audit marked as completed')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete audit')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAudit = async (auditId: string) => {
    if (!confirm('Are you sure you want to delete this audit? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/compliance?id=${auditId}&type=audit`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete audit')
      }

      // Update local state
      setAudits(prev => prev.filter(a => a.id !== auditId))
      toast.success('Audit deleted successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete audit')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== Evidence Handlers =====
  const handleAddEvidence = async (controlId: string) => {
    if (!evidenceForm.name.trim()) {
      toast.error('Evidence name is required')
      return
    }

    setIsSubmitting(true)
    try {
      // For file uploads, we'd typically use FormData
      const formData = new FormData()
      formData.append('type', 'item')
      formData.append('name', evidenceForm.name)
      formData.append('evidence_type', evidenceForm.type)
      formData.append('control_id', controlId)
      formData.append('status', 'pending')
      if (evidenceForm.file) {
        formData.append('file', evidenceForm.file)
      }

      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          name: evidenceForm.name,
          compliance_type: 'evidence',
          evidence_type: evidenceForm.type,
          control_id: controlId,
          status: 'pending'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add evidence')
      }

      const { data } = await response.json()

      // Update local controls state with new evidence
      setControls(prev => prev.map(c => {
        if (c.id === controlId) {
          return {
            ...c,
            evidence: [...c.evidence, {
              id: data.id,
              name: evidenceForm.name,
              type: evidenceForm.type,
              uploadedAt: new Date().toISOString(),
              uploadedBy: 'Current User',
              status: 'pending' as const,
              fileSize: evidenceForm.file ? `${(evidenceForm.file.size / 1024).toFixed(1)} KB` : '0 KB'
            }]
          }
        }
        return c
      }))

      // Reset form and close dialog
      setEvidenceForm({
        name: '',
        type: 'document',
        controlId: '',
        file: null
      })
      setShowEvidenceUploadDialog(false)
      toast.success('Evidence added successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add evidence')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveEvidence = async (evidenceId: string, controlId: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: evidenceId,
          type: 'item',
          status: 'approved'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve evidence')
      }

      // Update local state
      setControls(prev => prev.map(c => {
        if (c.id === controlId) {
          return {
            ...c,
            evidence: c.evidence.map(e =>
              e.id === evidenceId ? { ...e, status: 'approved' as const } : e
            )
          }
        }
        return c
      }))

      toast.success('Evidence approved')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve evidence')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectEvidence = async (evidenceId: string, controlId: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: evidenceId,
          type: 'item',
          status: 'rejected'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reject evidence')
      }

      // Update local state
      setControls(prev => prev.map(c => {
        if (c.id === controlId) {
          return {
            ...c,
            evidence: c.evidence.map(e =>
              e.id === evidenceId ? { ...e, status: 'rejected' as const } : e
            )
          }
        }
        return c
      }))

      toast.success('Evidence rejected')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject evidence')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== Training & Certification Handlers =====
  const handleCreateTraining = async () => {
    if (!trainingForm.name.trim()) {
      toast.error('Training name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          name: trainingForm.name,
          description: trainingForm.description,
          compliance_type: 'training',
          due_date: trainingForm.dueDate,
          assigned_to: trainingForm.assignedTo,
          status: trainingForm.status
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create training')
      }

      // Reset form and close dialog
      setTrainingForm({
        name: '',
        description: '',
        dueDate: '',
        assignedTo: [],
        status: 'pending'
      })
      setShowTrainingDialog(false)
      toast.success('Training created successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create training')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteTraining = async (trainingId: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trainingId,
          type: 'item',
          status: 'completed',
          completed_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete training')
      }

      toast.success('Training marked as completed')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete training')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCertification = async (certificationData: {
    name: string
    certificationNumber?: string
    certifiedBy: string
    certificationDate: string
    expiryDate: string
  }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          name: certificationData.name,
          compliance_type: 'certification',
          certification_number: certificationData.certificationNumber,
          certified_by: certificationData.certifiedBy,
          certification_date: certificationData.certificationDate,
          expiry_date: certificationData.expiryDate,
          status: 'compliant'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create certification')
      }

      toast.success('Certification created successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create certification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRenewCertification = async (certificationId: string, newExpiryDate: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: certificationId,
          type: 'item',
          expiry_date: newExpiryDate,
          certification_date: new Date().toISOString(),
          status: 'compliant'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to renew certification')
      }

      toast.success('Certification renewed successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to renew certification')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== Control Handlers =====
  const handleCreateControl = async (controlData: Partial<Control>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          name: controlData.name,
          description: controlData.description,
          compliance_type: 'control',
          framework: controlData.framework,
          category: controlData.category,
          risk_level: controlData.riskLevel,
          status: 'pending'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create control')
      }

      const { data } = await response.json()

      // Update local state
      setControls(prev => [...prev, {
        id: data.id,
        controlId: `CTRL-${Date.now().toString(36).toUpperCase()}`,
        name: controlData.name || 'New Control',
        description: controlData.description || '',
        framework: controlData.framework || 'Custom',
        category: controlData.category || 'General',
        status: 'pending' as const,
        riskLevel: (controlData.riskLevel as Control['riskLevel']) || 'medium',
        owner: 'Current User',
        ownerAvatar: '',
        lastTested: new Date().toISOString().split('T')[0],
        evidence: [],
        findings: 0
      }])

      toast.success('Control created successfully')
      setShowControlDialog(false)
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create control')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateControl = async (controlId: string, updates: Partial<Control>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: controlId,
          type: 'item',
          name: updates.name,
          description: updates.description,
          status: updates.status,
          risk_level: updates.riskLevel
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update control')
      }

      // Update local state
      setControls(prev => prev.map(c =>
        c.id === controlId ? { ...c, ...updates } : c
      ))

      toast.success('Control updated successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update control')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteControl = async (controlId: string) => {
    if (!confirm('Are you sure you want to delete this control? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/compliance?id=${controlId}&type=item`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete control')
      }

      // Update local state
      setControls(prev => prev.filter(c => c.id !== controlId))
      toast.success('Control deleted successfully')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete control')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">GRC Platform</h1>
                <p className="text-green-100">ServiceNow-level Governance, Risk & Compliance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={handleExport} aria-label="Export data">
                  <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-white text-green-600 hover:bg-green-50" onClick={handleRunAudit}>
                <Plus className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Overall Compliance</p>
                  <p className="text-2xl font-bold">{stats.overallCompliance.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Controls Passed</p>
                  <p className="text-2xl font-bold">{stats.passedControls}/{stats.totalControls}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Failed Controls</p>
                  <p className="text-2xl font-bold">{stats.failedControls}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Open Risks</p>
                  <p className="text-2xl font-bold">{stats.openRisks}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Active Audits</p>
                  <p className="text-2xl font-bold">{stats.activeAudits}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Frameworks</p>
                  <p className="text-2xl font-bold">{complianceData.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="frameworks" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Register
            </TabsTrigger>
            <TabsTrigger value="audits" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Audits
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="evidence" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Evidence
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Frameworks Tab */}
          <TabsContent value="frameworks" className="space-y-4">
            {/* Frameworks Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Compliance Frameworks</h2>
                  <p className="text-blue-100">Vanta-level compliance automation and tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.length}</p>
                    <p className="text-blue-200 text-sm">Frameworks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.filter(c => c.status === 'compliant').length}</p>
                    <p className="text-blue-200 text-sm">Compliant</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.length > 0 ? (complianceData.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / complianceData.length).toFixed(0) : 0}%</p>
                    <p className="text-blue-200 text-sm">Avg Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Frameworks Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Framework', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: FileCheck, label: 'Audit', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Shield, label: 'Controls', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: FileText, label: 'Reports', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: AlertTriangle, label: 'Gaps', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: Download, label: 'Export', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: RefreshCw, label: 'Sync', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={() => handleQuickAction(action.label)}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              {frameworks.map(framework => (
                <Card key={framework.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedFramework(framework)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{framework.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{framework.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{framework.description}</p>
                      </div>
                    </div>
                    <Badge className={getFrameworkStatusColor(framework.status)}>
                      {framework.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Compliance Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Compliance Score</span>
                      <span className={`text-2xl font-bold ${framework.complianceScore >= 90 ? 'text-green-600' : framework.complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {framework.complianceScore}%
                      </span>
                    </div>
                    <Progress value={framework.complianceScore} className="h-2" />
                  </div>

                  {/* Control Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{framework.passedControls}</p>
                      <p className="text-xs text-gray-500">Passed</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-lg font-bold text-red-600">{framework.failedControls}</p>
                      <p className="text-xs text-gray-500">Failed</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-lg font-bold text-yellow-600">{framework.pendingControls}</p>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                  </div>

                  {/* Assessment Info */}
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Last Assessment</span>
                      <span>{new Date(framework.lastAssessment).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Next Assessment</span>
                      <span>{new Date(framework.nextAssessment).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4" onClick={(e) => { e.stopPropagation(); setActiveTab('controls'); toast.success(`Viewing ${framework.name} controls`); }}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Controls
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-4">
            {/* Controls Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Security Controls</h2>
                  <p className="text-emerald-100">Drata-level control monitoring and testing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalControls}</p>
                    <p className="text-emerald-200 text-sm">Controls</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.passedControls}</p>
                    <p className="text-emerald-200 text-sm">Passing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.failedControls}</p>
                    <p className="text-emerald-200 text-sm">Failing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Control', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: CheckCircle, label: 'Test All', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Shield, label: 'Evidence', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: AlertTriangle, label: 'Failures', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: FileText, label: 'Reports', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Upload, label: 'Import', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Download, label: 'Export', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={() => handleQuickAction(action.label)}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search controls..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  toast.info('Filter options: Framework, Status, Risk Level, Owner')
                }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" onClick={() => setShowControlDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Control
                </Button>
              </div>
            </div>

            <Card>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-500">
                  <div>Control ID</div>
                  <div className="col-span-2">Name</div>
                  <div>Framework</div>
                  <div>Status</div>
                  <div>Risk Level</div>
                  <div>Owner</div>
                  <div>Actions</div>
                </div>
              </div>
              <ScrollArea className="h-[500px]">
                {controls.map(control => (
                  <div key={control.id} className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => { setSelectedControl(control); setShowControlDialog(true); }}>
                    <div className="grid grid-cols-8 gap-4 items-center">
                      <div>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {control.controlId}
                        </code>
                      </div>
                      <div className="col-span-2">
                        <p className="font-medium">{control.name}</p>
                        <p className="text-xs text-gray-500 truncate">{control.description}</p>
                      </div>
                      <div>
                        <Badge variant="outline">{control.framework}</Badge>
                      </div>
                      <div>
                        <Badge className={getControlStatusColor(control.status)}>
                          {control.status}
                        </Badge>
                      </div>
                      <div>
                        <Badge className={getRiskLevelColor(control.riskLevel)}>
                          {control.riskLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{control.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{control.owner.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowEvidenceDialog(true); toast.info(`Upload evidence for ${control.name}`); }}>
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedControl(control); setShowControlDialog(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-4">
            {/* Risks Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Risk Management</h2>
                  <p className="text-rose-100">LogicGate-level risk assessment and tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.openRisks}</p>
                    <p className="text-rose-200 text-sm">Total Risks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.filter(c => c.riskLevel === 'critical').length}</p>
                    <p className="text-rose-200 text-sm">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.filter(c => c.status === 'compliant').length}</p>
                    <p className="text-rose-200 text-sm">Mitigated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risks Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Risk', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Target, label: 'Assess', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Shield, label: 'Mitigate', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: BarChart3, label: 'Matrix', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: AlertTriangle, label: 'Critical', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { icon: FileText, label: 'Reports', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                { icon: Download, label: 'Export', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={() => handleQuickAction(action.label)}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Risk Register</h2>
              <Button onClick={() => {
                toast.success('Creating risk...')
                fetch('/api/compliance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'create_risk' })
                })
                  .then(res => {
                    if (!res.ok) throw new Error('Failed to create')
                    return res.json()
                  })
                  .then(() => {
                    setRisks(prev => [...prev, {
                      id: `risk${prev.length + 1}`,
                      name: 'New Risk',
                      description: 'New risk - configure details',
                      category: 'operational' as const,
                      inherentRisk: 50,
                      residualRisk: 50,
                      likelihood: 'possible' as const,
                      impact: 'moderate' as const,
                      status: 'open' as const,
                      owner: 'Current User',
                      controls: [],
                      lastReview: new Date().toISOString().split('T')[0]
                    }])
                    toast.success('Risk created - configure details')
                  })
                  .catch(err => toast.error(err.message || 'Failed to create'))
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Risk
              </Button>
            </div>

            <div className="grid gap-4">
              {risks.map(risk => (
                <Card key={risk.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{risk.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{risk.description}</p>
                    </div>
                    <Badge className={risk.status === 'open' ? 'bg-red-100 text-red-700' : risk.status === 'mitigated' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {risk.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium capitalize">{risk.category}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Inherent Risk</p>
                      <p className={`font-bold text-xl ${getRiskScoreColor(risk.inherentRisk)}`}>{risk.inherentRisk}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Residual Risk</p>
                      <p className={`font-bold text-xl ${getRiskScoreColor(risk.residualRisk)}`}>{risk.residualRisk}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Likelihood</p>
                      <p className="font-medium capitalize">{risk.likelihood.replace('_', ' ')}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Impact</p>
                      <p className="font-medium capitalize">{risk.impact}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{risk.owner}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{risk.controls.length} controls</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleResolveIssue(risk.id)}>
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Audits Tab */}
          <TabsContent value="audits" className="space-y-4">
            {/* Audits Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-lime-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Audit Management</h2>
                  <p className="text-amber-100">AuditBoard-level audit lifecycle management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.activeAudits}</p>
                    <p className="text-amber-200 text-sm">Audits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.filter(c => c.status === 'in_progress').length}</p>
                    <p className="text-amber-200 text-sm">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.filter(c => c.status === 'compliant').length}</p>
                    <p className="text-amber-200 text-sm">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audits Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Audit', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Calendar, label: 'Schedule', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { icon: ClipboardCheck, label: 'Findings', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                { icon: Users, label: 'Assign', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: FileText, label: 'Reports', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Upload, label: 'Evidence', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Download, label: 'Export', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={() => handleQuickAction(action.label)}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Audit Management</h2>
              <Button onClick={() => setShowScheduleDialog(true)} disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Audit
              </Button>
            </div>

            <div className="grid gap-4">
              {audits.map(audit => (
                <Card key={audit.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${audit.type === 'external' ? 'bg-blue-100 dark:bg-blue-900/30' : audit.type === 'regulatory' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <ClipboardList className={`w-6 h-6 ${audit.type === 'external' ? 'text-blue-600' : audit.type === 'regulatory' ? 'text-purple-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{audit.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{audit.framework}</Badge>
                          <Badge variant="outline" className="capitalize">{audit.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <Badge className={audit.status === 'completed' ? 'bg-green-100 text-green-700' : audit.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : audit.status === 'planned' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}>
                      {audit.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {audit.status === 'in_progress' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-medium">{audit.progress}%</span>
                      </div>
                      <Progress value={audit.progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Auditor</p>
                      <p className="font-medium">{audit.auditor}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{new Date(audit.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">{new Date(audit.endDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Findings</p>
                      <p className="font-medium">
                        {audit.findings} ({audit.criticalFindings} critical)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => {
                      downloadAsJson(audit, `audit-${audit.id}-details.json`)
                      toast.success(`Viewing ${audit.name} - details downloaded`)
                    }} disabled={isSubmitting}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      const findingsReport = {
                        audit: audit.name,
                        findings: audit.findings,
                        criticalFindings: audit.criticalFindings,
                        status: audit.status,
                        generatedAt: new Date().toISOString()
                      }
                      downloadAsJson(findingsReport, `audit-${audit.id}-findings.json`)
                      toast.success('Findings report downloaded')
                    }} disabled={isSubmitting}>
                      <FileText className="w-4 h-4 mr-2" />
                      Findings
                    </Button>
                    {audit.status !== 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => handleCompleteAudit(audit.id)} disabled={isSubmitting}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAudit(audit.id)} disabled={isSubmitting}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            {/* Policies Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Policy Management</h2>
                  <p className="text-violet-100">PowerDMS-level policy lifecycle management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.length}</p>
                    <p className="text-violet-200 text-sm">Policies</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.filter(c => c.status === 'compliant').length}</p>
                    <p className="text-violet-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.filter(c => c.status === 'under_review' || c.status === 'pending').length}</p>
                    <p className="text-violet-200 text-sm">Review</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Policy', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: FileText, label: 'Templates', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: CheckCircle, label: 'Approve', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: History, label: 'Versions', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Users, label: 'Attestation', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Send, label: 'Distribute', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Download, label: 'Export', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={() => handleQuickAction(action.label)}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Policy Management</h2>
              <Button onClick={() => setShowPolicyDialog(true)} disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                Create Policy
              </Button>
            </div>

            <Card>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-500">
                  <div className="col-span-2">Policy Name</div>
                  <div>Version</div>
                  <div>Status</div>
                  <div>Category</div>
                  <div>Acknowledgements</div>
                  <div>Actions</div>
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                {policies.map(policy => (
                  <div key={policy.id} className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="grid grid-cols-7 gap-4 items-center">
                      <div className="col-span-2">
                        <p className="font-medium">{policy.name}</p>
                        <p className="text-xs text-gray-500">Owner: {policy.owner}</p>
                      </div>
                      <div>
                        <Badge variant="outline">v{policy.version}</Badge>
                      </div>
                      <div>
                        <Badge className={policy.status === 'published' ? 'bg-green-100 text-green-700' : policy.status === 'review' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}>
                          {policy.status}
                        </Badge>
                      </div>
                      <div className="text-sm">{policy.category}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Progress value={(policy.acknowledgements / policy.totalEmployees) * 100} className="h-2 flex-1" />
                          <span className="text-sm">{policy.acknowledgements}/{policy.totalEmployees}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedPolicy(policy)
                          setPolicyForm({
                            name: policy.name,
                            version: policy.version,
                            category: policy.category,
                            description: '',
                            status: policy.status
                          })
                          setShowPolicyDialog(true)
                        }} disabled={isSubmitting}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (policy.status === 'draft' || policy.status === 'review') {
                            handleUpdatePolicy(policy.id, { status: 'approved' })
                          } else {
                            handleUpdatePolicy(policy.id, { status: 'published' })
                          }
                        }} disabled={isSubmitting}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePolicy(policy.id)} disabled={isSubmitting}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-4">
            {/* Evidence Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Evidence Repository</h2>
                  <p className="text-cyan-100">Box-level evidence collection and storage</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.filter(c => c.metRequirements > 0).length}</p>
                    <p className="text-cyan-200 text-sm">Evidence</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceData.filter(c => c.status === 'compliant').length}</p>
                    <p className="text-cyan-200 text-sm">Approved</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Evidence Repository</h2>
              <Button onClick={() => setShowEvidenceDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Evidence
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Approved Evidence</p>
                    <p className="text-2xl font-bold">127</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Review</p>
                    <p className="text-2xl font-bold">14</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 border-dashed border-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500">Supports PDF, DOC, XLS, PNG, JPG up to 50MB</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-6">
              {complianceData.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No evidence uploaded yet</p>
                  <p className="text-sm">Upload evidence to track compliance</p>
                </div>
              ) : (
                complianceData.slice(0, 8).map(item => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.framework || item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={item.status === 'compliant' ? 'bg-green-100 text-green-700' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                        {item.status}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={handleExport} aria-label="Export data">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab - Vanta/Drata Level with 6 Sub-tabs */}
          <TabsContent value="settings">
            <div className="flex gap-6">
              {/* Settings Sidebar */}
              <div className="w-64 shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 px-3">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'frameworks', icon: ShieldCheck, label: 'Frameworks' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'integrations', icon: Zap, label: 'Integrations' },
                      { id: 'automation', icon: Cpu, label: 'Automation' },
                      { id: 'advanced', icon: Lock, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          settingsTab === item.id
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                          <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Organization Settings</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Basic compliance configuration</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Organization Name</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">FreeFlow Inc.</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            toast.success('Opening editor...')
                            fetch('/api/compliance', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'edit_organization' })
                            })
                              .then(res => {
                                if (!res.ok) throw new Error('Failed to open editor')
                                return res.json()
                              })
                              .then(() => toast.success('Organization name editor opened'))
                              .catch(err => toast.error(err.message || 'Failed to open editor'))
                          }}>Edit</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Industry</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Software & Technology</p>
                          </div>
                          <Select defaultValue="tech">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tech">Software & Technology</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Fiscal Year Start</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">When your fiscal year begins</p>
                          </div>
                          <Select defaultValue="january">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="january">January</SelectItem>
                              <SelectItem value="april">April</SelectItem>
                              <SelectItem value="july">July</SelectItem>
                              <SelectItem value="october">October</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assessment Schedule</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Configure assessment frequency</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Default Assessment Frequency</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How often to run assessments</p>
                          </div>
                          <Select defaultValue="quarterly">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="biannual">Bi-Annual</SelectItem>
                              <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-Schedule Assessments</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically create assessment tasks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Frameworks Settings */}
                {settingsTab === 'frameworks' && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Frameworks</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Manage compliance frameworks</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {[
                          { name: 'SOC 2 Type II', enabled: true },
                          { name: 'ISO 27001', enabled: true },
                          { name: 'GDPR', enabled: true },
                          { name: 'HIPAA', enabled: false },
                          { name: 'PCI DSS', enabled: false },
                        ].map(framework => (
                          <div key={framework.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <Label className="text-gray-900 dark:text-white font-medium">{framework.name}</Label>
                            </div>
                            <Switch defaultChecked={framework.enabled} />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowFrameworkDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Framework
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Thresholds</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Configure risk level definitions</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Critical Threshold</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Score above this is critical</p>
                          </div>
                          <Input type="number" defaultValue="90" className="w-24" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">High Threshold</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Score above this is high risk</p>
                          </div>
                          <Input type="number" defaultValue="70" className="w-24" />
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Configure email alerts</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Control Failures</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert when controls fail</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Evidence Expiring</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify before evidence expires</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Audit Reminders</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming audit notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Weekly Digest</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly compliance summary</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Webhook className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook Notifications</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Send alerts to external services</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Slack Integration</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Post compliance alerts to Slack</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">PagerDuty</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Critical failures trigger incidents</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Label className="text-gray-900 dark:text-white font-medium mb-2 block">Custom Webhook</Label>
                          <div className="flex gap-2">
                            <Input placeholder="https://your-webhook-url.com" className="flex-1" />
                            <Button variant="outline" onClick={() => handleTestWebhook('https://your-webhook-url.com')}>Test</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <GitBranch className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connected Services</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Integrate with your tools</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {[
                          { name: 'AWS', connected: true },
                          { name: 'Azure', connected: true },
                          { name: 'GCP', connected: false },
                          { name: 'GitHub', connected: true },
                          { name: 'Jira', connected: true },
                          { name: 'Okta', connected: false }
                        ].map(service => (
                          <div key={service.name} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg">
                            <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                            <Button variant={service.connected ? 'outline' : 'default'} size="sm" onClick={() => handleConnectService(service.name, service.connected)}>
                              {service.connected ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Access</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Manage API tokens</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-gray-900 dark:text-white font-medium">API Token</Label>
                            <Button variant="outline" size="sm" onClick={handleCopyApiToken}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded block font-mono">
                            grc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleRegenerateToken}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate Token
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Automation Settings */}
                {settingsTab === 'automation' && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Automated Controls</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Auto-verify control compliance</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Enable Automation</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically verify controls</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Check Frequency</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How often to run checks</p>
                          </div>
                          <Select defaultValue="daily">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-collect Evidence</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically gather evidence</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                          <FileCode className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Policy Automation</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Automatic policy management</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-update Policies</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Update when frameworks change</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Policy Review Reminders</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remind to review policies</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Management</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Manage compliance data</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Evidence Retention</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How long to keep evidence</p>
                          </div>
                          <Select defaultValue="7years">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3years">3 years</SelectItem>
                              <SelectItem value="5years">5 years</SelectItem>
                              <SelectItem value="7years">7 years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={handleExport} aria-label="Export data">
                  <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={handleGenerateReport}>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Danger Zone */}
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                          <p className="text-sm text-red-600/70 dark:text-red-400/70">Destructive actions</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Reset All Controls</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Reset all control statuses</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={handleResetControls}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Delete All Evidence</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently remove all evidence</p>
                          </div>
                          <Button variant="destructive" onClick={handleDeleteEvidence}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            /* AIInsightsPanel removed - use header button */
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar_url || undefined,
                status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const
              }))}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={compliancePredictions}
              title="Compliance Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          /* ActivityFeed removed - use header button */
          <QuickActionsToolbar
            actions={complianceQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Control Detail Dialog */}
      <Dialog open={showControlDialog} onOpenChange={setShowControlDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Control Details</DialogTitle>
          </DialogHeader>
          {selectedControl && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{selectedControl.controlId}</code>
                  <h3 className="font-semibold text-lg mt-2">{selectedControl.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getControlStatusColor(selectedControl.status)}>{selectedControl.status}</Badge>
                  <Badge className={getRiskLevelColor(selectedControl.riskLevel)}>{selectedControl.riskLevel}</Badge>
                </div>
              </div>
              <p className="text-gray-600">{selectedControl.description}</p>

              {selectedControl.remediation && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-semibold text-yellow-700 mb-2">Remediation Required</h4>
                  <p className="text-sm text-yellow-600">{selectedControl.remediation}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Evidence ({selectedControl.evidence.length})</h4>
                <div className="space-y-2">
                  {selectedControl.evidence.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{e.name}</span>
                      </div>
                      <Badge className={e.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{e.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Compliance Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-6 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <input
                type="file"
                id="import-file"
                accept=".json,.csv,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImportFile(file)
                  }
                }}
              />
              <label htmlFor="import-file" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {importFile ? importFile.name : 'Click to select a file'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Supports JSON, CSV, or XLSX files
                  </p>
                </div>
              </label>
            </div>

            {importFile && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">{importFile.name}</p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setImportFile(null)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-medium">Import Options</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Switch id="merge-data" defaultChecked />
                <Label htmlFor="merge-data" className="text-sm cursor-pointer">Merge with existing data</Label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Switch id="validate-data" defaultChecked />
                <Label htmlFor="validate-data" className="text-sm cursor-pointer">Validate data before import</Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowImportDialog(false)
                setImportFile(null)
              }}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!importFile}
                onClick={() => {
                  if (importFile) {
                    toast.success(`Importing ${importFile.name}...`)
                    const formData = new FormData()
                    formData.append('file', importFile)
                    formData.append('action', 'import_data')

                    fetch('/api/compliance', {
                      method: 'POST',
                      body: formData
                    })
                      .then(res => {
                        if (!res.ok) throw new Error('Failed to import file')
                        return res.json()
                      })
                      .then(() => {
                        const reader = new FileReader()
                        reader.onload = () => {
                          try {
                            if (importFile.name.endsWith('.json')) {
                              const data = JSON.parse(reader.result as string)
                              if (data.controls) {
                                setControls(prev => [...prev, ...data.controls.slice(0, 3)])
                              }
                              if (data.risks) {
                                setRisks(prev => [...prev, ...data.risks.slice(0, 2)])
                              }
                            }
                          } catch {
                            // If parsing fails, continue
                          }
                        }
                        reader.readAsText(importFile)
                        setShowImportDialog(false)
                        setImportFile(null)
                        toast.success(`Successfully imported data from ${importFile.name}`)
                      })
                      .catch(err => toast.error(err.message || 'Failed to import file'))
                  }
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Audit Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule New Audit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audit-name">Audit Name</Label>
              <Input
                id="audit-name"
                placeholder="e.g., Q1 2024 Security Audit"
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Framework</Label>
                <Select
                  value={scheduleForm.framework}
                  onValueChange={(value) => setScheduleForm(prev => ({ ...prev, framework: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOC 2">SOC 2</SelectItem>
                    <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                    <SelectItem value="GDPR">GDPR</SelectItem>
                    <SelectItem value="HIPAA">HIPAA</SelectItem>
                    <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Audit Type</Label>
                <Select
                  value={scheduleForm.type}
                  onValueChange={(value) => setScheduleForm(prev => ({ ...prev, type: value as 'internal' | 'external' | 'regulatory' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={scheduleForm.startDate}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={scheduleForm.endDate}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditor">Auditor / Audit Firm</Label>
              <Input
                id="auditor"
                placeholder="e.g., Internal Audit Team or Deloitte"
                value={scheduleForm.auditor}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, auditor: e.target.value }))}
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">Audit Scheduling</p>
                  <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                    Once scheduled, team members will be notified and a calendar event will be created.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowScheduleDialog(false)
                setScheduleForm({
                  name: '',
                  framework: 'SOC 2',
                  type: 'internal',
                  startDate: '',
                  endDate: '',
                  auditor: ''
                })
              }}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!scheduleForm.name || !scheduleForm.startDate || !scheduleForm.endDate || isSubmitting}
                onClick={handleCreateAudit}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                Schedule Audit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Team Member Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Audit</Label>
              <Select
                value={assignForm.selectedAudit}
                onValueChange={(value) => setAssignForm(prev => ({ ...prev, selectedAudit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an audit" />
                </SelectTrigger>
                <SelectContent>
                  {audits.map(audit => (
                    <SelectItem key={audit.id} value={audit.id}>
                      <div className="flex items-center gap-2">
                        <span>{audit.name}</span>
                        <Badge variant="outline" className="text-xs">{audit.status.replace('_', ' ')}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Team Member</Label>
              <Select
                value={assignForm.selectedMember}
                onValueChange={(value) => setAssignForm(prev => ({ ...prev, selectedMember: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                        <Badge variant="outline" className="text-xs">{member.role || 'Team Member'}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="sarah">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">SC</AvatarFallback>
                      </Avatar>
                      <span>Sarah Chen</span>
                      <Badge variant="outline" className="text-xs">Security Lead</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="mike">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">MJ</AvatarFallback>
                      </Avatar>
                      <span>Mike Johnson</span>
                      <Badge variant="outline" className="text-xs">IT Manager</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="emma">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">ED</AvatarFallback>
                      </Avatar>
                      <span>Emma Davis</span>
                      <Badge variant="outline" className="text-xs">Privacy Officer</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role in Audit</Label>
              <Select
                value={assignForm.role}
                onValueChange={(value) => setAssignForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                  <SelectItem value="evidence-collector">Evidence Collector</SelectItem>
                  <SelectItem value="approver">Approver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">Team Assignment</p>
                  <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                    The assigned member will receive a notification and have access to audit materials.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowAssignDialog(false)
                setAssignForm({
                  selectedAudit: '',
                  selectedMember: '',
                  role: 'auditor'
                })
              }}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!assignForm.selectedAudit || !assignForm.selectedMember}
                onClick={() => {
                  const selectedAuditData = audits.find(a => a.id === assignForm.selectedAudit)
                  const memberNames: Record<string, string> = {
                    '1': 'Compliance Officer',
                    '2': 'Legal Counsel',
                    '3': 'Risk Manager',
                    'sarah': 'Sarah Chen',
                    'mike': 'Mike Johnson',
                    'emma': 'Emma Davis'
                  }
                  const memberName = memberNames[assignForm.selectedMember] || 'Team Member'

                  toast.success('Assigning team member...')
                  fetch('/api/compliance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'assign_member',
                      auditId: assignForm.selectedAudit,
                      memberId: assignForm.selectedMember,
                      role: assignForm.role
                    })
                  })
                    .then(res => {
                      if (!res.ok) throw new Error('Failed to assign team member')
                      return res.json()
                    })
                    .then(() => {
                      setShowAssignDialog(false)
                      setAssignForm({
                        selectedAudit: '',
                        selectedMember: '',
                        role: 'auditor'
                      })
                      toast.success(`${memberName} assigned as ${assignForm.role} to "${selectedAuditData?.name}"`)
                    })
                    .catch(err => toast.error(err.message || 'Failed to assign team member'))
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                Assign Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Policy Dialog */}
      <Dialog open={showPolicyDialog} onOpenChange={(open) => {
        setShowPolicyDialog(open)
        if (!open) {
          setSelectedPolicy(null)
          setPolicyForm({
            name: '',
            version: '1.0',
            category: 'security',
            description: '',
            status: 'draft'
          })
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPolicy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="policy-name">Policy Name</Label>
              <Input
                id="policy-name"
                placeholder="e.g., Information Security Policy"
                value={policyForm.name}
                onChange={(e) => setPolicyForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Version</Label>
                <Input
                  value={policyForm.version}
                  onChange={(e) => setPolicyForm(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={policyForm.category}
                  onValueChange={(value) => setPolicyForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="privacy">Privacy</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="it">IT Operations</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-description">Description</Label>
              <Input
                id="policy-description"
                placeholder="Brief description of the policy..."
                value={policyForm.description}
                onChange={(e) => setPolicyForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={policyForm.status}
                onValueChange={(value) => setPolicyForm(prev => ({ ...prev, status: value as typeof policyForm.status }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowPolicyDialog(false)
                setSelectedPolicy(null)
                setPolicyForm({
                  name: '',
                  version: '1.0',
                  category: 'security',
                  description: '',
                  status: 'draft'
                })
              }}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!policyForm.name.trim() || isSubmitting}
                onClick={() => {
                  if (selectedPolicy) {
                    handleUpdatePolicy(selectedPolicy.id, {
                      name: policyForm.name,
                      version: policyForm.version,
                      category: policyForm.category,
                      status: policyForm.status
                    })
                    setShowPolicyDialog(false)
                    setSelectedPolicy(null)
                  } else {
                    handleCreatePolicy()
                  }
                }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                {selectedPolicy ? 'Update Policy' : 'Create Policy'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Evidence Upload Dialog */}
      <Dialog open={showEvidenceUploadDialog} onOpenChange={(open) => {
        setShowEvidenceUploadDialog(open)
        if (!open) {
          setEvidenceForm({
            name: '',
            type: 'document',
            controlId: '',
            file: null
          })
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evidence-name">Evidence Name</Label>
              <Input
                id="evidence-name"
                placeholder="e.g., Security Audit Report Q1 2024"
                value={evidenceForm.name}
                onChange={(e) => setEvidenceForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Evidence Type</Label>
              <Select
                value={evidenceForm.type}
                onValueChange={(value) => setEvidenceForm(prev => ({ ...prev, type: value as typeof evidenceForm.type }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="screenshot">Screenshot</SelectItem>
                  <SelectItem value="log">Log File</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Associated Control</Label>
              <Select
                value={evidenceForm.controlId}
                onValueChange={(value) => setEvidenceForm(prev => ({ ...prev, controlId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select control" />
                </SelectTrigger>
                <SelectContent>
                  {controls.map(control => (
                    <SelectItem key={control.id} value={control.id}>
                      {control.controlId} - {control.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-6 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <input
                type="file"
                id="evidence-file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setEvidenceForm(prev => ({ ...prev, file, name: prev.name || file.name }))
                  }
                }}
              />
              <label htmlFor="evidence-file" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-full">
                  <Upload className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {evidenceForm.file ? evidenceForm.file.name : 'Click to select a file'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Supports PDF, DOC, XLS, PNG, JPG up to 50MB
                  </p>
                </div>
              </label>
            </div>

            {evidenceForm.file && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">{evidenceForm.file.name}</p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      {(evidenceForm.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEvidenceForm(prev => ({ ...prev, file: null }))}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowEvidenceUploadDialog(false)
                setEvidenceForm({
                  name: '',
                  type: 'document',
                  controlId: '',
                  file: null
                })
              }}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!evidenceForm.name.trim() || !evidenceForm.controlId || isSubmitting}
                onClick={() => handleAddEvidence(evidenceForm.controlId)}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Evidence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Training Dialog */}
      <Dialog open={showTrainingDialog} onOpenChange={(open) => {
        setShowTrainingDialog(open)
        if (!open) {
          setTrainingForm({
            name: '',
            description: '',
            dueDate: '',
            assignedTo: [],
            status: 'pending'
          })
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Training Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="training-name">Training Name</Label>
              <Input
                id="training-name"
                placeholder="e.g., Annual Security Awareness Training"
                value={trainingForm.name}
                onChange={(e) => setTrainingForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training-description">Description</Label>
              <Input
                id="training-description"
                placeholder="Brief description of the training..."
                value={trainingForm.description}
                onChange={(e) => setTrainingForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training-due-date">Due Date</Label>
              <Input
                id="training-due-date"
                type="date"
                value={trainingForm.dueDate}
                onChange={(e) => setTrainingForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select
                onValueChange={(value) => {
                  if (!trainingForm.assignedTo.includes(value)) {
                    setTrainingForm(prev => ({ ...prev, assignedTo: [...prev.assignedTo, value] }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="engineering">Engineering Team</SelectItem>
                  <SelectItem value="sales">Sales Team</SelectItem>
                  <SelectItem value="support">Support Team</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
              {trainingForm.assignedTo.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {trainingForm.assignedTo.map(group => (
                    <Badge key={group} variant="secondary" className="cursor-pointer" onClick={() => {
                      setTrainingForm(prev => ({ ...prev, assignedTo: prev.assignedTo.filter(g => g !== group) }))
                    }}>
                      {group} <XCircle className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">Training Assignment</p>
                  <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                    Assigned members will receive email notifications and have the training added to their dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowTrainingDialog(false)
                setTrainingForm({
                  name: '',
                  description: '',
                  dueDate: '',
                  assignedTo: [],
                  status: 'pending'
                })
              }}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!trainingForm.name.trim() || isSubmitting}
                onClick={handleCreateTraining}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Training
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
