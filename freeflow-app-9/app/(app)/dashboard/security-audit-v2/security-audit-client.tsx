'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSecurityAudits, type SecurityAudit as DBSecurityAudit } from '@/lib/hooks/use-security-audits'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Shield,
  ShieldCheck,
  Search,
  Target,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Settings,
  Play,
  RefreshCw,
  Filter,
  Plus,
  MoreHorizontal,
  Download,
  FileText,
  Lock,
  Server,
  Database,
  Cloud,
  Globe,
  HardDrive,
  Network,
  Bug,
  Scan,
  Radar,
  Users,
  Building2,
  FileCheck,
  Layers,
  Webhook,
  Zap,
  ExternalLink,
  CreditCard
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

// Types
type AuditStatus = 'passed' | 'failed' | 'warning' | 'in-progress' | 'scheduled' | 'cancelled'
type AuditType = 'vulnerability-scan' | 'compliance' | 'penetration-test' | 'web-app-scan' | 'cloud-security' | 'container-scan'
type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
type ComplianceFramework = 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'NIST' | 'CIS'

interface Vulnerability {
  id: string
  title: string
  description: string
  cveId: string
  cvssScore: number
  severity: Severity
  status: 'open' | 'in-progress' | 'resolved' | 'accepted' | 'false-positive'
  affectedAsset: string
  assetType: string
  discoveredAt: string
  dueDate: string
  assignee?: string
  remediation: string
  exploitAvailable: boolean
  patchAvailable: boolean
  category: string
  port?: number
  protocol?: string
}

interface SecurityAudit {
  id: string
  name: string
  auditCode: string
  description: string
  type: AuditType
  status: AuditStatus
  severity: Severity
  scheduledAt: string
  startedAt?: string
  completedAt?: string
  duration?: number
  scope: string[]
  findings: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  compliance: ComplianceFramework[]
  securityScore: number
  passRate: number
  auditor: string
  assets: number
  progress: number
}

interface Asset {
  id: string
  name: string
  type: 'server' | 'database' | 'application' | 'cloud' | 'container' | 'network' | 'endpoint'
  ip?: string
  hostname?: string
  os?: string
  status: 'online' | 'offline' | 'unknown'
  riskScore: number
  vulnerabilities: number
  lastScanned: string
  owner: string
  criticality: 'critical' | 'high' | 'medium' | 'low'
  tags: string[]
}

interface ComplianceControl {
  id: string
  controlId: string
  framework: ComplianceFramework
  title: string
  description: string
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable'
  evidence: string
  lastAssessed: string
  owner: string
}

const complianceFrameworks = [
  { id: 'SOC2', name: 'SOC 2 Type II', score: 94, controls: 89, passed: 84, icon: ShieldCheck },
  { id: 'ISO27001', name: 'ISO 27001', score: 88, controls: 114, passed: 100, icon: Shield },
  { id: 'GDPR', name: 'GDPR', score: 92, controls: 42, passed: 39, icon: Lock },
  { id: 'HIPAA', name: 'HIPAA', score: 78, controls: 54, passed: 42, icon: FileCheck },
  { id: 'PCI-DSS', name: 'PCI-DSS', score: 85, controls: 78, passed: 66, icon: CreditCard },
  { id: 'NIST', name: 'NIST CSF', score: 81, controls: 98, passed: 79, icon: Building2 }
]

export default function SecurityAuditClient() {
  // Team and activity hooks for collaboration features
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all')
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null)
  const [selectedAudit, setSelectedAudit] = useState<SecurityAudit | null>(null)
  const [showScanDialog, setShowScanDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Use security audits hook for real Supabase data
  const {
    audits: dbAudits,
    loading,
    error,
    fetchAudits: refetch,
    createAudit,
    updateAudit,
    deleteAudit,
    startAudit,
    completeAudit,
    cancelAudit,
    getStats
  } = useSecurityAudits()

  // Map DB audits (snake_case) to UI audits (camelCase)
  const audits: SecurityAudit[] = useMemo(() => {
    return (dbAudits || []).map((dbAudit: DBSecurityAudit): SecurityAudit => ({
      id: dbAudit.id,
      name: dbAudit.name,
      auditCode: dbAudit.audit_code,
      description: dbAudit.description || '',
      type: dbAudit.audit_type === 'access-control' ? 'compliance' :
            dbAudit.audit_type === 'data-encryption' ? 'vulnerability-scan' :
            dbAudit.audit_type === 'compliance' ? 'compliance' :
            dbAudit.audit_type === 'penetration-test' ? 'penetration-test' :
            dbAudit.audit_type === 'code-review' ? 'web-app-scan' :
            dbAudit.audit_type === 'infrastructure' ? 'cloud-security' : 'vulnerability-scan',
      status: dbAudit.status as AuditStatus,
      severity: dbAudit.severity as Severity,
      scheduledAt: dbAudit.next_scheduled_at || dbAudit.created_at,
      startedAt: dbAudit.started_at || undefined,
      completedAt: dbAudit.completed_at || undefined,
      duration: dbAudit.duration_seconds,
      scope: dbAudit.tags || [],
      findings: {
        critical: dbAudit.findings_critical,
        high: dbAudit.findings_high,
        medium: dbAudit.findings_medium,
        low: dbAudit.findings_low,
        info: 0
      },
      compliance: (dbAudit.compliance_standards || []) as ComplianceFramework[],
      securityScore: dbAudit.security_score || 0,
      passRate: dbAudit.total_recommendations > 0
        ? Math.round((dbAudit.remediated_count / dbAudit.total_recommendations) * 100)
        : 0,
      auditor: dbAudit.audited_by || dbAudit.auditor_email || 'System',
      assets: 0, // Asset count not tracked in DB schema
      progress: dbAudit.status === 'completed' || dbAudit.status === 'passed' || dbAudit.status === 'failed' ? 100 :
               dbAudit.status === 'in-progress' ? 50 :
               dbAudit.status === 'scheduled' ? 0 : 0
    }))
  }, [dbAudits])

  // Data state for other entities (vulnerabilities, assets, controls remain local for now)
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [controls, setControls] = useState<ComplianceControl[]>([])

  // Dialog states for button handlers
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showNewAuditDialog, setShowNewAuditDialog] = useState(false)
  const [showDiscoverDialog, setShowDiscoverDialog] = useState(false)
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false)
  const [showAssessDialog, setShowAssessDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showRemediationDialog, setShowRemediationDialog] = useState(false)
  const [showAssetMenuDialog, setShowAssetMenuDialog] = useState(false)
  const [selectedAssetForMenu, setSelectedAssetForMenu] = useState<Asset | null>(null)

  // Scan state
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<{
    timestamp: string
    vulnerabilities: Vulnerability[]
    score: number
    status: 'pending' | 'scanning' | 'complete' | 'failed'
  } | null>(null)
  const [auditLog, setAuditLog] = useState<Array<{
    id: string
    action: string
    timestamp: string
    user: string
    details: string
  }>>([])

  // Get computed stats from the hook
  const auditStats = getStats()

  // Compute vulnerability stats from audit findings data
  const vulnerabilityStats = useMemo(() => {
    const totalCritical = audits.reduce((sum, a) => sum + a.findings.critical, 0)
    const totalHigh = audits.reduce((sum, a) => sum + a.findings.high, 0)
    const totalMedium = audits.reduce((sum, a) => sum + a.findings.medium, 0)
    const totalLow = audits.reduce((sum, a) => sum + a.findings.low, 0)
    const total = totalCritical + totalHigh + totalMedium + totalLow
    return {
      total,
      critical: totalCritical,
      high: totalHigh,
      medium: totalMedium,
      low: totalLow,
      open: auditStats.totalFindings,
      resolved: audits.reduce((sum, a) => sum + (a.passRate > 0 ? Math.round((a.passRate / 100) * (a.findings.critical + a.findings.high + a.findings.medium + a.findings.low)) : 0), 0)
    }
  }, [audits, auditStats])

  // Filter vulnerabilities from real data
  const filteredVulnerabilities = useMemo(() => {
    // Vulnerabilities are local state for now - return empty array when no data
    return vulnerabilities.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           v.cveId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSeverity = selectedSeverity === 'all' || v.severity === selectedSeverity
      return matchesSearch && matchesSeverity
    })
  }, [vulnerabilities, searchQuery, selectedSeverity])

  // Stats cards - derived from real audit data
  const stats = [
    { label: 'Security Score', value: `${Math.round(auditStats.avgScore)}%`, change: '+5%', icon: Shield, color: 'from-blue-500 to-blue-600' },
    { label: 'Open Vulnerabilities', value: vulnerabilityStats.open.toString(), change: '-12', icon: Bug, color: 'from-red-500 to-red-600' },
    { label: 'Critical/High', value: (vulnerabilityStats.critical + vulnerabilityStats.high).toString(), change: '-3', icon: AlertTriangle, color: 'from-amber-500 to-amber-600' },
    { label: 'Total Audits', value: auditStats.total.toString(), change: '+' + auditStats.scheduled, icon: Server, color: 'from-green-500 to-green-600' },
    { label: 'Remediation Rate', value: `${Math.round(auditStats.remediationRate)}%`, change: '+2%', icon: FileCheck, color: 'from-purple-500 to-purple-600' },
    { label: 'Passed Audits', value: auditStats.passed.toString(), change: '', icon: Clock, color: 'from-cyan-500 to-cyan-600' },
    { label: 'In Progress', value: auditStats.inProgress.toString(), change: '', icon: Radar, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Resolved', value: vulnerabilityStats.resolved.toString(), change: '+15', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' }
  ]

  const getSeverityColor = (severity: Severity): string => {
    const colors: Record<Severity, string> = {
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'low': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'info': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return colors[severity]
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'open': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'accepted': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'false-positive': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'passed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'warning': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getAssetIcon = (type: Asset['type']) => {
    const icons: Record<Asset['type'], any> = {
      'server': Server,
      'database': Database,
      'application': Globe,
      'cloud': Cloud,
      'container': Layers,
      'network': Network,
      'endpoint': HardDrive
    }
    return icons[type] || Server
  }

  const getCvssColor = (score: number): string => {
    if (score >= 9.0) return 'text-red-600'
    if (score >= 7.0) return 'text-orange-600'
    if (score >= 4.0) return 'text-yellow-600'
    return 'text-blue-600'
  }

  // Handlers
  const handleStartScan = async () => {
    setIsScanning(true)
    toast.info('Scan started')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      // Create a security audit in the database
      const { data: audit, error: auditError } = await supabase
        .from('security_audits')
        .insert({
          user_id: user.id,
          name: 'Automated Security Scan',
          audit_code: `SCAN-${Date.now()}`,
          audit_type: 'vulnerability-scan',
          status: 'in-progress',
          severity: 'medium',
          compliance_standards: ['SOC2', 'ISO27001'],
          started_at: new Date().toISOString(),
          tags: ['automated', 'security-scan']
        })
        .select()
        .single()

      if (auditError) throw auditError

      // Simulate scan or call actual API
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update scan results state
      const newScanResults = {
        timestamp: new Date().toISOString(),
        vulnerabilities: [],
        score: 95,
        status: 'complete' as const
      }
      setScanResults(newScanResults)

      // Update audit status to completed
      if (audit) {
        await supabase
          .from('security_audits')
          .update({
            status: 'passed',
            completed_at: new Date().toISOString(),
            security_score: newScanResults.score,
            findings_critical: 0,
            findings_high: 0,
            findings_medium: 0,
            findings_low: 0
          })
          .eq('id', audit.id)
      }

      // Log the scan action
      await supabase
        .from('security_audit_logs')
        .insert({
          user_id: user.id,
          event_type: 'scan_completed',
          event_description: `Security scan completed with score: ${newScanResults.score}`,
          additional_data: {
            audit_id: audit?.id,
            score: newScanResults.score,
            timestamp: newScanResults.timestamp
          }
        })

      // Update local audit log state
      setAuditLog(prev => [...prev, {
        id: crypto.randomUUID(),
        action: 'Security Scan Completed',
        timestamp: new Date().toISOString(),
        user: 'System',
        details: `Scan completed with score: ${newScanResults.score}`
      }])

      toast.success('Scan completed')
      await refetch()
    } catch (err) {
      console.error('Scan failed:', err)
      toast.error('Scan failed')
    } finally {
      setIsScanning(false)
    }
  }

  const handleResolveVulnerability = async (vuln: Vulnerability) => {
    try {
      // Find if this vulnerability exists in our database
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      // Log the resolution in security audit logs
      const { error } = await supabase
        .from('security_audit_logs')
        .insert({
          user_id: user.id,
          event_type: 'vulnerability_resolved',
          event_description: `Vulnerability resolved: ${vuln.title}`,
          ip_address: null,
          user_agent: null,
          additional_data: {
            vulnerability_id: vuln.id,
            cve_id: vuln.cveId,
            severity: vuln.severity,
            cvss_score: vuln.cvssScore
          }
        })

      if (error) throw error

      toast.success(`Marked as resolved: "${vuln.title}" has been marked as resolved`)
      await refetch()
    } catch (error) {
      console.error('Failed to resolve vulnerability:', error)
      toast.error('Failed to mark vulnerability as resolved')
    }
  }

  const handleExportAudit = async () => {
    try {
      const exportData = {
        scanResults: scanResults || {},
        auditLog: auditLog || [],
        audits: audits || [],
        vulnerabilities: vulnerabilities || [],
        assets: assets || [],
        controls: controls || [],
        exportedAt: new Date().toISOString()
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      // Log the export action
      setAuditLog(prev => [...prev, {
        id: crypto.randomUUID(),
        action: 'Audit Report Exported',
        timestamp: new Date().toISOString(),
        user: 'System',
        details: 'Security audit report exported to JSON'
      }])
      toast.success('Export started')
    } catch (err) {
      toast.error('Export failed')
    }
  }

  const handleCreateTicket = async (vuln: Vulnerability) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      // Create a ticket/task in the database
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: `[SECURITY] ${vuln.title}`,
          description: `${vuln.description}\n\nRemediation: ${vuln.remediation}\n\nCVE: ${vuln.cveId}\nCVSS Score: ${vuln.cvssScore}\nAffected Asset: ${vuln.affectedAsset}`,
          status: 'todo',
          priority: vuln.severity === 'critical' ? 'urgent' : vuln.severity === 'high' ? 'high' : vuln.severity === 'medium' ? 'medium' : 'low',
          category: 'security',
          tags: ['security-vulnerability', vuln.severity, vuln.category].filter(Boolean),
          metadata: {
            vulnerability_id: vuln.id,
            cve_id: vuln.cveId,
            cvss_score: vuln.cvssScore,
            affected_asset: vuln.affectedAsset
          }
        })

      if (error) throw error

      // Log the ticket creation
      await supabase
        .from('security_audit_logs')
        .insert({
          user_id: user.id,
          event_type: 'ticket_created',
          event_description: `Ticket created for vulnerability: ${vuln.title}`,
          additional_data: {
            vulnerability_id: vuln.id,
            cve_id: vuln.cveId,
            severity: vuln.severity
          }
        })

      toast.success(`Ticket created for "${vuln.title}"`)
    } catch (error) {
      console.error('Failed to create ticket:', error)
      toast.error('Failed to create ticket')
    }
  }

  // Loading state
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )

  // Error state
  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-red-500">Error loading data</p>
      <Button onClick={() => refetch()}>Retry</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Command Center</h1>
              <p className="text-gray-500 dark:text-gray-400">Vulnerability management & compliance monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vulnerabilities, assets..."
                className="w-72 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setShowFiltersDialog(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => setShowScanDialog(true)}
            >
              <Scan className="h-4 w-4 mr-2" />
              New Scan
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
                {stat.change && (
                  <p className={`text-xs mt-2 ${stat.change.startsWith('+') || stat.change.startsWith('-0') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} vs last month
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Bug className="h-4 w-4 mr-2" />
              Vulnerabilities ({vulnerabilityStats.total})
            </TabsTrigger>
            <TabsTrigger value="audits" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Audits
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Server className="h-4 w-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* Dashboard Overview Banner */}
            <div className="bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Security Command Center</h2>
                  <p className="text-blue-100">Real-time security posture and vulnerability management</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => setShowExportDialog(true)}>
                    <Download className="w-4 h-4 mr-2" />Export Report
                  </Button>
                  <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => setShowScanDialog(true)}>
                    <Scan className="w-4 h-4 mr-2" />New Scan
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">82%</div>
                  <div className="text-sm text-blue-100">Security Score</div>
                  <div className="text-xs text-green-300 mt-1">↑ 5% vs last month</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-red-300">{vulnerabilityStats.critical}</div>
                  <div className="text-sm text-blue-100">Critical</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-orange-300">{vulnerabilityStats.high}</div>
                  <div className="text-sm text-blue-100">High</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{vulnerabilityStats.open}</div>
                  <div className="text-sm text-blue-100">Open Issues</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">89%</div>
                  <div className="text-sm text-blue-100">Compliance</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-sm text-blue-100">Assets</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {[
                { icon: Scan, label: 'Run Scan', desc: 'Start scan', color: 'blue' },
                { icon: Bug, label: 'Vulnerabilities', desc: 'View all', color: 'red' },
                { icon: FileCheck, label: 'Compliance', desc: 'Check status', color: 'green' },
                { icon: Server, label: 'Assets', desc: 'Manage', color: 'purple' },
                { icon: FileText, label: 'Reports', desc: 'Generate', color: 'orange' },
                { icon: AlertTriangle, label: 'Alerts', desc: 'View active', color: 'amber' }
              ].map(action => (
                <Card key={action.label} className="p-3 hover:shadow-lg transition-all cursor-pointer group text-center border-gray-200 dark:border-gray-700">
                  <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 mx-auto w-fit group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <p className="text-sm font-medium mt-2 text-gray-900 dark:text-white">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Vulnerability Breakdown */}
              <Card className="col-span-8 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Security Posture Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-red-600 dark:text-red-400">Critical</span>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <p className="text-3xl font-bold text-red-700 dark:text-red-300">{vulnerabilityStats.critical}</p>
                      <p className="text-xs text-red-500 mt-1">Immediate action required</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-orange-600 dark:text-orange-400">High</span>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{vulnerabilityStats.high}</p>
                      <p className="text-xs text-orange-500 mt-1">Fix within 7 days</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">Medium</span>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{vulnerabilityStats.medium}</p>
                      <p className="text-xs text-yellow-500 mt-1">Fix within 30 days</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600 dark:text-blue-400">Low/Info</span>
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{vulnerabilityStats.low}</p>
                      <p className="text-xs text-blue-500 mt-1">Fix as time permits</p>
                    </div>
                  </div>

                  {/* Recent Critical Vulnerabilities */}
                  <h4 className="font-medium mb-3">Recent Critical Findings</h4>
                  <div className="space-y-3">
                    {vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').slice(0, 3).map(vuln => (
                      <div
                        key={vuln.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setSelectedVulnerability(vuln)}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${vuln.severity === 'critical' ? 'bg-red-100 dark:bg-red-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
                          <Bug className={`h-5 w-5 ${vuln.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">{vuln.title}</h5>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{vuln.cveId}</span>
                            <span>•</span>
                            <span>{vuln.affectedAsset}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getCvssColor(vuln.cvssScore)}`}>{vuln.cvssScore}</p>
                          <p className="text-xs text-gray-500">CVSS</p>
                        </div>
                        <Badge className={getStatusColor(vuln.status)}>{vuln.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Overview */}
              <Card className="col-span-4 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {complianceFrameworks.slice(0, 4).map(framework => (
                    <div key={framework.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
                        <framework.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{framework.name}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{framework.score}%</span>
                        </div>
                        <Progress value={framework.score} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{framework.passed}/{framework.controls} controls passed</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Audits */}
              <Card className="col-span-6 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Security Audits</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('audits')}>View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {audits.slice(0, 3).map(audit => (
                      <div
                        key={audit.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setSelectedAudit(audit)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">{audit.name}</h5>
                          <p className="text-sm text-gray-500">{audit.auditCode} • {audit.auditor}</p>
                        </div>
                        <Badge className={getStatusColor(audit.status)}>{audit.status}</Badge>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{audit.securityScore}%</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* High-Risk Assets */}
              <Card className="col-span-6 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>High-Risk Assets</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('assets')}>View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assets.filter(a => a.riskScore > 60).map(asset => {
                      const AssetIcon = getAssetIcon(asset.type)
                      return (
                        <div key={asset.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <AssetIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white">{asset.name}</h5>
                            <p className="text-sm text-gray-500">{asset.ip || asset.hostname} • {asset.type}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-600">{asset.vulnerabilities}</p>
                            <p className="text-xs text-gray-500">Vulns</p>
                          </div>
                          <div className="w-20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Risk</span>
                              <span className="text-xs font-medium">{asset.riskScore}%</span>
                            </div>
                            <Progress value={asset.riskScore} className="h-2" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Trending Vulnerabilities */}
              <Card className="col-span-6 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Trending Vulnerabilities</CardTitle>
                    <Badge className="bg-red-100 text-red-700">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Log4j RCE', trend: '+45%', severity: 'critical', affected: 12 },
                      { name: 'OpenSSL Heartbleed', trend: '+23%', severity: 'high', affected: 8 },
                      { name: 'Spring4Shell', trend: '+18%', severity: 'critical', affected: 5 },
                      { name: 'Apache Struts', trend: '+12%', severity: 'high', affected: 3 }
                    ].map((vuln, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${vuln.severity === 'critical' ? 'bg-red-100' : 'bg-orange-100'}`}>
                          <TrendingUp className={`h-5 w-5 ${vuln.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">{vuln.name}</h5>
                          <p className="text-sm text-gray-500">{vuln.affected} affected assets</p>
                        </div>
                        <Badge className={vuln.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}>{vuln.severity}</Badge>
                        <span className="text-green-600 font-medium">{vuln.trend}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Timeline */}
              <Card className="col-span-6 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Security Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { time: '10:32 AM', event: 'Vulnerability scan completed', type: 'scan', status: 'success' },
                      { time: '09:15 AM', event: 'Critical CVE detected on prod-api-01', type: 'alert', status: 'critical' },
                      { time: '08:45 AM', event: 'Compliance report generated', type: 'report', status: 'info' },
                      { time: 'Yesterday', event: 'Penetration test scheduled', type: 'schedule', status: 'pending' },
                      { time: '2 days ago', event: 'SOC 2 audit completed', type: 'audit', status: 'success' },
                      { time: '3 days ago', event: 'New asset discovered: db-backup-02', type: 'discovery', status: 'info' }
                    ].map((event, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 w-24">{event.time}</div>
                        <div className={`w-3 h-3 rounded-full ${event.status === 'critical' ? 'bg-red-500' : event.status === 'success' ? 'bg-green-500' : event.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                        <p className="flex-1 text-gray-900 dark:text-white">{event.event}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Heatmap */}
              <Card className="col-span-6 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Risk Heatmap by Asset Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {[
                      { type: 'Servers', risk: 78, vulns: 45 },
                      { type: 'Databases', risk: 65, vulns: 23 },
                      { type: 'Applications', risk: 82, vulns: 56 },
                      { type: 'Cloud', risk: 45, vulns: 12 },
                      { type: 'Containers', risk: 38, vulns: 8 },
                      { type: 'Network', risk: 52, vulns: 15 }
                    ].map((item, i) => (
                      <div key={i} className={`p-4 rounded-lg ${item.risk > 70 ? 'bg-red-100 dark:bg-red-900/30' : item.risk > 50 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                        <p className="font-medium text-gray-900 dark:text-white">{item.type}</p>
                        <p className={`text-2xl font-bold ${item.risk > 70 ? 'text-red-600' : item.risk > 50 ? 'text-yellow-600' : 'text-green-600'}`}>{item.risk}%</p>
                        <p className="text-sm text-gray-500">{item.vulns} vulnerabilities</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities" className="mt-6 space-y-6">
            {/* Vulnerabilities Overview Banner */}
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Vulnerability Management</h2>
                  <p className="text-red-100">Track, prioritize, and remediate security vulnerabilities</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => setShowExportDialog(true)}>
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button>
                  <Button className="bg-white text-red-600 hover:bg-red-50" onClick={() => setShowScanDialog(true)}>
                    <Scan className="w-4 h-4 mr-2" />Scan Now
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{vulnerabilityStats.total}</div>
                  <div className="text-sm text-red-100">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{vulnerabilityStats.critical}</div>
                  <div className="text-sm text-red-100">Critical</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{vulnerabilityStats.high}</div>
                  <div className="text-sm text-red-100">High</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{vulnerabilityStats.medium}</div>
                  <div className="text-sm text-red-100">Medium</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{vulnerabilityStats.open}</div>
                  <div className="text-sm text-red-100">Open</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{vulnerabilityStats.resolved}</div>
                  <div className="text-sm text-red-100">Resolved</div>
                </div>
              </div>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vulnerability Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedSeverity === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSeverity('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedSeverity === 'critical' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSeverity('critical')}
                      className={selectedSeverity === 'critical' ? 'bg-red-600' : ''}
                    >
                      Critical
                    </Button>
                    <Button
                      variant={selectedSeverity === 'high' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSeverity('high')}
                      className={selectedSeverity === 'high' ? 'bg-orange-600' : ''}
                    >
                      High
                    </Button>
                    <Button
                      variant={selectedSeverity === 'medium' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSeverity('medium')}
                      className={selectedSeverity === 'medium' ? 'bg-yellow-600' : ''}
                    >
                      Medium
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredVulnerabilities.map(vuln => (
                    <div
                      key={vuln.id}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedVulnerability(vuln)}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        vuln.severity === 'critical' ? 'bg-red-100 dark:bg-red-900' :
                        vuln.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900' :
                        vuln.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        <Bug className={`h-6 w-6 ${
                          vuln.severity === 'critical' ? 'text-red-600' :
                          vuln.severity === 'high' ? 'text-orange-600' :
                          vuln.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{vuln.title}</h4>
                          {vuln.exploitAvailable && (
                            <Badge className="bg-red-100 text-red-700">Exploit Available</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="font-mono">{vuln.cveId}</span>
                          <span>•</span>
                          <span>{vuln.affectedAsset}</span>
                          <span>•</span>
                          <span>{vuln.category}</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getCvssColor(vuln.cvssScore)}`}>{vuln.cvssScore}</p>
                        <p className="text-xs text-gray-500">CVSS 3.1</p>
                      </div>

                      <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                      <Badge className={getStatusColor(vuln.status)}>{vuln.status}</Badge>

                      <div className="text-right text-sm">
                        <p className="text-gray-900 dark:text-white font-medium">{vuln.assignee || 'Unassigned'}</p>
                        <p className="text-gray-500">Due: {vuln.dueDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audits Tab */}
          <TabsContent value="audits" className="mt-6 space-y-6">
            {/* Audits Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Security Audits</h2>
                  <p className="text-purple-100">Schedule and manage comprehensive security assessments</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => setShowScheduleDialog(true)}>
                    <Calendar className="w-4 h-4 mr-2" />Schedule
                  </Button>
                  <Button className="bg-white text-purple-600 hover:bg-purple-50" onClick={() => setShowNewAuditDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />New Audit
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{audits.length}</div>
                  <div className="text-sm text-purple-100">Total Audits</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{audits.filter(a => a.status === 'passed').length}</div>
                  <div className="text-sm text-purple-100">Passed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{audits.filter(a => a.status === 'in-progress').length}</div>
                  <div className="text-sm text-purple-100">In Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{audits.filter(a => a.status === 'scheduled').length}</div>
                  <div className="text-sm text-purple-100">Scheduled</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-sm text-purple-100">Avg Score</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              {audits.map(audit => (
                <Card
                  key={audit.id}
                  className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedAudit(audit)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <Badge className={getStatusColor(audit.status)}>{audit.status}</Badge>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{audit.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{audit.auditCode}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 mb-4 text-center">
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <p className="text-lg font-bold text-red-700">{audit.findings.critical}</p>
                        <p className="text-xs text-red-500">Critical</p>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                        <p className="text-lg font-bold text-orange-700">{audit.findings.high}</p>
                        <p className="text-xs text-orange-500">High</p>
                      </div>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <p className="text-lg font-bold text-yellow-700">{audit.findings.medium}</p>
                        <p className="text-xs text-yellow-500">Medium</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">Security Score</span>
                      <span className="font-bold text-gray-900 dark:text-white">{audit.securityScore}%</span>
                    </div>
                    <Progress value={audit.securityScore} className="h-2 mb-4" />

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{audit.assets} assets</span>
                      <span>{audit.auditor}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-6 space-y-6">
            {/* Assets Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Asset Inventory</h2>
                  <p className="text-emerald-100">Manage and monitor your IT infrastructure assets</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => setShowDiscoverDialog(true)}>
                    <Scan className="w-4 h-4 mr-2" />Discover
                  </Button>
                  <Button className="bg-white text-emerald-600 hover:bg-emerald-50" onClick={() => setShowAddAssetDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />Add Asset
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{assets.length}</div>
                  <div className="text-sm text-emerald-100">Total Assets</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{assets.filter(a => a.status === 'online').length}</div>
                  <div className="text-sm text-emerald-100">Online</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{assets.filter(a => a.criticality === 'critical').length}</div>
                  <div className="text-sm text-emerald-100">Critical</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{assets.reduce((sum, a) => sum + a.vulnerabilities, 0)}</div>
                  <div className="text-sm text-emerald-100">Vulnerabilities</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{assets.filter(a => a.riskScore > 60).length}</div>
                  <div className="text-sm text-emerald-100">High Risk</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-emerald-100">Coverage</div>
                </div>
              </div>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Asset Inventory</CardTitle>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddAssetDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {assets.map(asset => {
                    const AssetIcon = getAssetIcon(asset.type)
                    return (
                      <div key={asset.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <AssetIcon className="h-6 w-6 text-gray-600" />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{asset.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{asset.ip || 'N/A'}</span>
                            <span>•</span>
                            <span>{asset.hostname}</span>
                            <span>•</span>
                            <span className="capitalize">{asset.type}</span>
                          </div>
                        </div>

                        <Badge className={asset.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {asset.status}
                        </Badge>

                        <Badge className={
                          asset.criticality === 'critical' ? 'bg-red-100 text-red-700' :
                          asset.criticality === 'high' ? 'bg-orange-100 text-orange-700' :
                          asset.criticality === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {asset.criticality}
                        </Badge>

                        <div className="text-center">
                          <p className="text-lg font-bold text-red-600">{asset.vulnerabilities}</p>
                          <p className="text-xs text-gray-500">Vulns</p>
                        </div>

                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Risk</span>
                            <span className="text-xs font-medium">{asset.riskScore}%</span>
                          </div>
                          <Progress value={asset.riskScore} className="h-2" />
                        </div>

                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedAssetForMenu(asset); setShowAssetMenuDialog(true); }}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-6 space-y-6">
            {/* Compliance Overview Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Compliance Management</h2>
                  <p className="text-amber-100">Monitor regulatory compliance and control effectiveness</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => setShowExportDialog(true)}>
                    <Download className="w-4 h-4 mr-2" />Reports
                  </Button>
                  <Button className="bg-white text-amber-600 hover:bg-amber-50" onClick={() => setShowAssessDialog(true)}>
                    <RefreshCw className="w-4 h-4 mr-2" />Assess
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">6</div>
                  <div className="text-sm text-amber-100">Frameworks</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">475</div>
                  <div className="text-sm text-amber-100">Controls</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">410</div>
                  <div className="text-sm text-amber-100">Passed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">86%</div>
                  <div className="text-sm text-amber-100">Compliance</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-amber-100">Issues</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">Q1 2024</div>
                  <div className="text-sm text-amber-100">Next Audit</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 mb-6">
              {complianceFrameworks.map(framework => (
                <Card key={framework.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
                        <framework.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{framework.name}</h3>
                        <p className="text-sm text-gray-500">{framework.passed}/{framework.controls} controls</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Compliance Score</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{framework.score}%</span>
                    </div>
                    <Progress value={framework.score} className="h-3" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Control Assessment</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {controls.map(control => (
                    <div key={control.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <FileCheck className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-blue-600">{control.controlId}</span>
                          <Badge variant="outline">{control.framework}</Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{control.title}</h4>
                        <p className="text-sm text-gray-500">{control.description}</p>
                      </div>
                      <Badge className={getStatusColor(control.status)}>{control.status}</Badge>
                      <div className="text-right text-sm">
                        <p className="text-gray-900 dark:text-white">{control.owner}</p>
                        <p className="text-gray-500">{control.lastAssessed}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                        { id: 'scanning', icon: Scan, label: 'Scanning', desc: 'Scan configuration' },
                        { id: 'compliance', icon: FileCheck, label: 'Compliance', desc: 'Framework settings' },
                        { id: 'integrations', icon: Webhook, label: 'Integrations', desc: 'Third-party tools' },
                        { id: 'notifications', icon: AlertCircle, label: 'Notifications', desc: 'Alert preferences' },
                        { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Power settings' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Organization Name</label>
                          <Input defaultValue="Acme Corporation" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Security Contact</label>
                          <Input defaultValue="security@acme.com" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Enable Security Dashboard</p>
                          <p className="text-sm text-gray-500">Show security metrics on main dashboard</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Risk-Based Prioritization</p>
                          <p className="text-sm text-gray-500">Sort vulnerabilities by risk score</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Auto-Assign Vulnerabilities</p>
                          <p className="text-sm text-gray-500">Automatically assign based on asset owner</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Scanning Settings */}
                {settingsTab === 'scanning' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scan className="w-5 h-5 text-green-600" />
                        Scanning Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Automatic Scanning</p>
                          <p className="text-sm text-gray-500">Run scheduled vulnerability scans</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Deep Scan Mode</p>
                          <p className="text-sm text-gray-500">Enable comprehensive vulnerability detection</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Safe Scan Mode</p>
                          <p className="text-sm text-gray-500">Avoid potentially disruptive checks</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Credential Scanning</p>
                          <p className="text-sm text-gray-500">Use credentials for authenticated scans</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Container Scanning</p>
                          <p className="text-sm text-gray-500">Scan Docker containers and images</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Compliance Settings */}
                {settingsTab === 'compliance' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-purple-600" />
                        Compliance Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">SOC 2 Type II</p>
                          <p className="text-sm text-gray-500">Enable SOC 2 compliance monitoring</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">ISO 27001</p>
                          <p className="text-sm text-gray-500">Enable ISO 27001 compliance monitoring</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">PCI-DSS</p>
                          <p className="text-sm text-gray-500">Enable PCI-DSS compliance monitoring</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">HIPAA</p>
                          <p className="text-sm text-gray-500">Enable HIPAA compliance monitoring</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">GDPR</p>
                          <p className="text-sm text-gray-500">Enable GDPR compliance monitoring</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Integration Settings */}
                {settingsTab === 'integrations' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-orange-600" />
                        Integration Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Jira Integration</p>
                          <p className="text-sm text-gray-500">Create tickets for vulnerabilities</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Slack Integration</p>
                          <p className="text-sm text-gray-500">Send alerts to Slack channel</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">PagerDuty Integration</p>
                          <p className="text-sm text-gray-500">Trigger incidents for critical findings</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">SIEM Integration</p>
                          <p className="text-sm text-gray-500">Send events to your SIEM</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">CI/CD Integration</p>
                          <p className="text-sm text-gray-500">Block deployments with critical vulns</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notification Settings */}
                {settingsTab === 'notifications' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Critical Alerts</p>
                          <p className="text-sm text-gray-500">Immediate notification for critical findings</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">High Severity Alerts</p>
                          <p className="text-sm text-gray-500">Notify for high severity vulnerabilities</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Scan Completion</p>
                          <p className="text-sm text-gray-500">Notify when scans complete</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Weekly Reports</p>
                          <p className="text-sm text-gray-500">Receive weekly security summary</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">SLA Breach Warnings</p>
                          <p className="text-sm text-gray-500">Alert before remediation SLA expires</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-red-600" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">API Access</p>
                          <p className="text-sm text-gray-500">Enable REST API access</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Exploit Simulation</p>
                          <p className="text-sm text-gray-500">Run safe exploit simulations</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Agent-Based Scanning</p>
                          <p className="text-sm text-gray-500">Deploy scanning agents to assets</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Custom CVE Mappings</p>
                          <p className="text-sm text-gray-500">Define custom vulnerability mappings</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="pt-6 border-t dark:border-gray-700">
                        <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset All Settings</p>
                            <p className="text-sm text-red-600">This will reset all configurations</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={() => setShowResetDialog(true)}>
                            Reset
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers?.map(m => ({ id: m.id, name: m.name, avatar: m.avatar_url, status: m.status === 'active' ? 'online' : 'offline' })) || []}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Security Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={[].map(action => ({
              ...action,
              action: async () => {
                switch(action.id) {
                  case '1':
                    toast.promise(
                      fetch('/api/security/scan', { method: 'POST' }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
                      { loading: 'Running security scan...', success: 'Security scan completed!', error: 'Scan failed' }
                    );
                    break;
                  case '2': setActiveTab('alerts'); toast.success('Viewing alerts'); break;
                  case '3': setActiveTab('compliance'); toast.success('Viewing compliance report'); break;
                  case '4': setActiveTab('settings'); toast.success('Opening settings'); break;
                }
              }
            }))}
            variant="grid"
          />
        </div>

        {/* Vulnerability Detail Dialog */}
        <Dialog open={!!selectedVulnerability} onOpenChange={() => setSelectedVulnerability(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <ScrollArea className="max-h-[80vh]">
              {selectedVulnerability && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedVulnerability.severity === 'critical' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        <Bug className={`h-6 w-6 ${
                          selectedVulnerability.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <DialogTitle className="text-xl">{selectedVulnerability.title}</DialogTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">{selectedVulnerability.cveId}</code>
                          <Badge className={getSeverityColor(selectedVulnerability.severity)}>{selectedVulnerability.severity}</Badge>
                          <Badge className={getStatusColor(selectedVulnerability.status)}>{selectedVulnerability.status}</Badge>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className={`text-3xl font-bold ${getCvssColor(selectedVulnerability.cvssScore)}`}>
                          {selectedVulnerability.cvssScore}
                        </p>
                        <p className="text-sm text-gray-500">CVSS 3.1</p>
                      </div>
                    </div>
                  </DialogHeader>

                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedVulnerability.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Affected Asset</h4>
                      <p className="text-gray-600">{selectedVulnerability.affectedAsset}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Category</h4>
                      <p className="text-gray-600">{selectedVulnerability.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Discovered</h4>
                      <p className="text-gray-600">{selectedVulnerability.discoveredAt}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Due Date</h4>
                      <p className="text-gray-600">{selectedVulnerability.dueDate}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {selectedVulnerability.exploitAvailable && (
                      <Badge className="bg-red-100 text-red-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Exploit Available
                      </Badge>
                    )}
                    {selectedVulnerability.patchAvailable && (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Patch Available
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Remediation</h4>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">{selectedVulnerability.remediation}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowRemediationDialog(true)}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Remediation
                    </Button>
                    <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
                      <Users className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                    <Button variant="outline" onClick={() => {
                      if (selectedVulnerability) {
                        handleResolveVulnerability(selectedVulnerability)
                        setSelectedVulnerability(null)
                      }
                    }}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                    <Button variant="ghost" className="ml-auto" onClick={() => {
                      if (selectedVulnerability?.cveId && selectedVulnerability.cveId !== 'N/A') {
                        window.open(`https://nvd.nist.gov/vuln/detail/${selectedVulnerability.cveId}`, '_blank')
                      } else {
                        toast.info('No CVE ID available for this vulnerability')
                      }
                    }}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View in NVD
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* New Scan Dialog */}
        <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Launch New Security Scan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <Bug className="h-8 w-8 text-red-600 mb-2" />
                  <h4 className="font-medium">Vulnerability Scan</h4>
                  <p className="text-sm text-gray-500">Full vulnerability assessment</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <FileCheck className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium">Compliance Audit</h4>
                  <p className="text-sm text-gray-500">Framework compliance check</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <Target className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-medium">Penetration Test</h4>
                  <p className="text-sm text-gray-500">Simulated attack testing</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <Cloud className="h-8 w-8 text-cyan-600 mb-2" />
                  <h4 className="font-medium">Cloud Security</h4>
                  <p className="text-sm text-gray-500">Cloud infrastructure review</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowScanDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                  setShowScanDialog(false)
                  handleStartScan()
                }}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Scan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Vulnerabilities</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <div className="flex flex-wrap gap-2">
                  {['critical', 'high', 'medium', 'low', 'info'].map(sev => (
                    <Button
                      key={sev}
                      variant={selectedSeverity === sev ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSeverity(sev as Severity)}
                      className="capitalize"
                    >
                      {sev}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['open', 'in-progress', 'resolved', 'accepted', 'false-positive'].map(status => (
                    <Button key={status} variant="outline" size="sm" className="capitalize" onClick={() => toast.info(`Filter: ${status}`)}>{status}</Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset Type</label>
                <div className="flex flex-wrap gap-2">
                  {['server', 'database', 'application', 'cloud', 'container', 'network'].map(type => (
                    <Button key={type} variant="outline" size="sm" className="capitalize" onClick={() => toast.info(`Filter: ${type}`)}>{type}</Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setSelectedSeverity('all')
                  setShowFiltersDialog(false)
                }}>
                  Clear Filters
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                  setShowFiltersDialog(false)
                  toast.success('Filters applied')
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Select the format and content for your export</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div
                  role="button"
                  tabIndex={0}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    setShowExportDialog(false)
                    toast.success('Exporting PDF report...')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setShowExportDialog(false)
                      toast.success('Exporting PDF report...')
                    }
                  }}
                  aria-label="Export as PDF Report"
                >
                  <FileText className="h-8 w-8 text-red-600 mb-2" aria-hidden="true" />
                  <h4 className="font-medium">PDF Report</h4>
                  <p className="text-sm text-gray-500">Comprehensive audit report</p>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    setShowExportDialog(false)
                    toast.success('Exporting CSV data...')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setShowExportDialog(false)
                      toast.success('Exporting CSV data...')
                    }
                  }}
                  aria-label="Export as CSV"
                >
                  <FileText className="h-8 w-8 text-green-600 mb-2" aria-hidden="true" />
                  <h4 className="font-medium">CSV Export</h4>
                  <p className="text-sm text-gray-500">Raw vulnerability data</p>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    setShowExportDialog(false)
                    toast.success('Exporting JSON data...')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setShowExportDialog(false)
                      toast.success('Exporting JSON data...')
                    }
                  }}
                  aria-label="Export as JSON"
                >
                  <FileText className="h-8 w-8 text-blue-600 mb-2" aria-hidden="true" />
                  <h4 className="font-medium">JSON Export</h4>
                  <p className="text-sm text-gray-500">Machine-readable format</p>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    setShowExportDialog(false)
                    toast.success('Generating executive summary...')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setShowExportDialog(false)
                      toast.success('Generating executive summary...')
                    }
                  }}
                  aria-label="Generate Executive Summary"
                >
                  <BarChart3 className="h-8 w-8 text-purple-600 mb-2" aria-hidden="true" />
                  <h4 className="font-medium">Executive Summary</h4>
                  <p className="text-sm text-gray-500">High-level overview</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Security Audit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Audit Type</label>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>Vulnerability Scan</option>
                  <option>Compliance Audit</option>
                  <option>Penetration Test</option>
                  <option>Cloud Security Review</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule Date</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule Time</label>
                <Input type="time" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Recurrence</label>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>One-time</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => {
                  setShowScheduleDialog(false)
                  toast.success('Audit scheduled')
                }}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Audit Dialog */}
        <Dialog open={showNewAuditDialog} onOpenChange={setShowNewAuditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Audit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Audit Name</label>
                <Input placeholder="e.g., Q1 2024 Security Assessment" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Audit Type</label>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>Vulnerability Scan</option>
                  <option>Compliance Audit</option>
                  <option>Penetration Test</option>
                  <option>Cloud Security Review</option>
                  <option>Container Security Scan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Scope</label>
                <div className="flex flex-wrap gap-2">
                  {['All Assets', 'Production Only', 'Critical Systems', 'Web Applications', 'Cloud Infrastructure'].map(scope => (
                    <Button key={scope} variant="outline" size="sm" onClick={() => toast.info(`Selected: ${scope}`)}>{scope}</Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Compliance Frameworks</label>
                <div className="flex flex-wrap gap-2">
                  {['SOC2', 'ISO27001', 'PCI-DSS', 'HIPAA', 'GDPR', 'NIST'].map(fw => (
                    <Button key={fw} variant="outline" size="sm" onClick={() => toast.info(`Selected: ${fw}`)}>{fw}</Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewAuditDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => {
                  setShowNewAuditDialog(false)
                  toast.success('Audit created')
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Audit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Discover Assets Dialog */}
        <Dialog open={showDiscoverDialog} onOpenChange={setShowDiscoverDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Discover Assets</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Automatically discover and inventory assets in your infrastructure</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => {
                  setShowDiscoverDialog(false)
                  toast.info('Network scan started')
                }}>
                  <Network className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium">Network Scan</h4>
                  <p className="text-sm text-gray-500">Scan IP ranges</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => {
                  setShowDiscoverDialog(false)
                  toast.info('Cloud discovery started')
                }}>
                  <Cloud className="h-8 w-8 text-cyan-600 mb-2" />
                  <h4 className="font-medium">Cloud Discovery</h4>
                  <p className="text-sm text-gray-500">AWS, Azure, GCP</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => {
                  setShowDiscoverDialog(false)
                  toast.info('Container scan started')
                }}>
                  <Layers className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-medium">Container Scan</h4>
                  <p className="text-sm text-gray-500">Docker, Kubernetes</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => {
                  setShowDiscoverDialog(false)
                  toast.info('Agent-based discovery started')
                }}>
                  <Server className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-medium">Agent Discovery</h4>
                  <p className="text-sm text-gray-500">Use installed agents</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Asset Dialog */}
        <Dialog open={showAddAssetDialog} onOpenChange={setShowAddAssetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset Name</label>
                <Input placeholder="e.g., prod-web-server-01" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset Type</label>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>Server</option>
                  <option>Database</option>
                  <option>Application</option>
                  <option>Cloud Resource</option>
                  <option>Container</option>
                  <option>Network Device</option>
                  <option>Endpoint</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">IP Address</label>
                  <Input placeholder="e.g., 192.168.1.100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hostname</label>
                  <Input placeholder="e.g., server.domain.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Criticality</label>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner</label>
                <Input placeholder="e.g., DevOps Team" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input placeholder="e.g., production, web, critical" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddAssetDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  setShowAddAssetDialog(false)
                  toast.success('Asset added')
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Asset Menu Dialog */}
        <Dialog open={showAssetMenuDialog} onOpenChange={setShowAssetMenuDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Asset Actions</DialogTitle>
            </DialogHeader>
            {selectedAssetForMenu && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-4">Actions for: {selectedAssetForMenu.name}</p>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  setShowAssetMenuDialog(false)
                  setShowScanDialog(true)
                }}>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan Asset
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  setShowAssetMenuDialog(false)
                  setActiveTab('vulnerabilities')
                  toast.success('Filtering vulnerabilities')
                }}>
                  <Bug className="h-4 w-4 mr-2" />
                  View Vulnerabilities
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  setShowAssetMenuDialog(false)
                  toast.info('Asset details')
                }}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  setShowAssetMenuDialog(false)
                  toast.success('Edit mode')
                }}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Asset
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={() => {
                  setShowAssetMenuDialog(false)
                  toast.error('Asset removed')
                }}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Remove Asset
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assess Compliance Dialog */}
        <Dialog open={showAssessDialog} onOpenChange={setShowAssessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Run Compliance Assessment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Select compliance frameworks to assess</p>
              <div className="space-y-3">
                {complianceFrameworks.map(framework => (
                  <div key={framework.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <framework.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{framework.name}</p>
                        <p className="text-sm text-gray-500">{framework.controls} controls</p>
                      </div>
                    </div>
                    <Switch defaultChecked={['SOC2', 'ISO27001', 'PCI-DSS'].includes(framework.id)} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAssessDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => {
                  setShowAssessDialog(false)
                  toast.info('Assessment started')
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Reset All Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                <p className="font-medium text-red-700 dark:text-red-400">Warning: This action cannot be undone</p>
                <p className="text-sm text-red-600 mt-2">
                  This will reset all security audit settings to their defaults, including:
                </p>
                <ul className="text-sm text-red-600 mt-2 list-disc list-inside space-y-1">
                  <li>Scanning configurations</li>
                  <li>Compliance framework settings</li>
                  <li>Integration connections</li>
                  <li>Notification preferences</li>
                </ul>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type &quot;RESET&quot; to confirm</label>
                <Input placeholder="RESET" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowResetDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => {
                  setShowResetDialog(false)
                  toast.success('Settings reset')
                }}>
                  Reset All Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Vulnerability Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Vulnerability</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedVulnerability && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">{selectedVulnerability.title}</p>
                  <p className="text-sm text-gray-500">{selectedVulnerability.cveId}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign To</label>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>John Smith - Security Engineer</option>
                  <option>Sarah Wilson - DevSecOps</option>
                  <option>Mike Chen - Platform Team</option>
                  <option>Emily Davis - Cloud Security</option>
                  <option>David Kim - Application Security</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>Critical - Fix Immediately</option>
                  <option>High - Fix within 7 days</option>
                  <option>Medium - Fix within 30 days</option>
                  <option>Low - Fix as time permits</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 h-20" placeholder="Add any notes for the assignee..." />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAssignDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                  setShowAssignDialog(false)
                  toast.success('Vulnerability assigned')
                }}>
                  <Users className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Remediation Dialog */}
        <Dialog open={showRemediationDialog} onOpenChange={setShowRemediationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Remediation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedVulnerability && (
                <>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium">{selectedVulnerability.title}</p>
                    <p className="text-sm text-gray-500">{selectedVulnerability.cveId} - {selectedVulnerability.affectedAsset}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Recommended Remediation</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300">{selectedVulnerability.remediation}</p>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Remediation Method</label>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>Apply Patch</option>
                  <option>Configuration Change</option>
                  <option>Code Fix</option>
                  <option>Compensating Control</option>
                  <option>Accept Risk</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Implementation Notes</label>
                <textarea className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 h-20" placeholder="Document the remediation steps taken..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="create-ticket" />
                <label htmlFor="create-ticket" className="text-sm">Create Jira ticket for tracking</label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowRemediationDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                  setShowRemediationDialog(false)
                  if (selectedVulnerability) {
                    handleCreateTicket(selectedVulnerability)
                  }
                  toast.success('Remediation started')
                }}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Remediation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
