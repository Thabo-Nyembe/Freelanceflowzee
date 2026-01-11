'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
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
  GitBranch, FileCode, Cpu, CheckCircle, Send
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

// Mock frameworks
const mockFrameworks: ComplianceFramework[] = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    shortName: 'SOC 2',
    description: 'Service Organization Control 2',
    version: '2023',
    totalControls: 116,
    passedControls: 108,
    failedControls: 3,
    pendingControls: 5,
    complianceScore: 93.1,
    status: 'compliant',
    lastAssessment: '2024-01-10',
    nextAssessment: '2024-07-10',
    icon: '🛡️'
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    shortName: 'GDPR',
    description: 'General Data Protection Regulation',
    version: '2018',
    totalControls: 72,
    passedControls: 68,
    failedControls: 2,
    pendingControls: 2,
    complianceScore: 94.4,
    status: 'compliant',
    lastAssessment: '2024-01-05',
    nextAssessment: '2024-04-05',
    icon: '🇪🇺'
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    shortName: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    version: '2023',
    totalControls: 54,
    passedControls: 48,
    failedControls: 4,
    pendingControls: 2,
    complianceScore: 88.9,
    status: 'partial',
    lastAssessment: '2024-01-08',
    nextAssessment: '2024-04-08',
    icon: '🏥'
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    shortName: 'ISO 27001',
    description: 'Information Security Management',
    version: '2022',
    totalControls: 93,
    passedControls: 85,
    failedControls: 5,
    pendingControls: 3,
    complianceScore: 91.4,
    status: 'compliant',
    lastAssessment: '2024-01-12',
    nextAssessment: '2024-07-12',
    icon: '🔐'
  },
  {
    id: 'pci',
    name: 'PCI DSS',
    shortName: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    version: '4.0',
    totalControls: 64,
    passedControls: 55,
    failedControls: 6,
    pendingControls: 3,
    complianceScore: 85.9,
    status: 'non_compliant',
    lastAssessment: '2024-01-02',
    nextAssessment: '2024-04-02',
    icon: '💳'
  }
]

// Mock controls
const mockControls: Control[] = [
  {
    id: 'ctrl1',
    controlId: 'CC6.1',
    name: 'Logical Access Controls',
    description: 'The entity implements logical access security measures to protect information assets',
    framework: 'SOC 2',
    category: 'Access Control',
    status: 'passed',
    riskLevel: 'high',
    owner: 'Sarah Chen',
    ownerAvatar: '',
    lastTested: '2024-01-10',
    evidence: [
      { id: 'e1', name: 'Access Control Policy.pdf', type: 'document', uploadedAt: '2024-01-05', uploadedBy: 'Sarah Chen', status: 'approved', fileSize: '2.4 MB' },
      { id: 'e2', name: 'Access Logs Q4.csv', type: 'log', uploadedAt: '2024-01-08', uploadedBy: 'System', status: 'approved', fileSize: '15.2 MB' }
    ],
    findings: 0
  },
  {
    id: 'ctrl2',
    controlId: 'CC7.2',
    name: 'System Monitoring',
    description: 'Security events are identified and monitored in real-time',
    framework: 'SOC 2',
    category: 'Security Operations',
    status: 'passed',
    riskLevel: 'critical',
    owner: 'Mike Johnson',
    ownerAvatar: '',
    lastTested: '2024-01-12',
    evidence: [
      { id: 'e3', name: 'SIEM Dashboard Screenshot.png', type: 'screenshot', uploadedAt: '2024-01-12', uploadedBy: 'Mike Johnson', status: 'approved', fileSize: '1.8 MB' }
    ],
    findings: 0
  },
  {
    id: 'ctrl3',
    controlId: 'A.12.4',
    name: 'Data Encryption',
    description: 'Encryption of data at rest and in transit',
    framework: 'ISO 27001',
    category: 'Cryptography',
    status: 'failed',
    riskLevel: 'critical',
    owner: 'Alex Kim',
    ownerAvatar: '',
    lastTested: '2024-01-08',
    evidence: [],
    findings: 2,
    remediation: 'Implement TLS 1.3 for all internal services by 2024-02-01'
  },
  {
    id: 'ctrl4',
    controlId: 'Art.32',
    name: 'Security of Processing',
    description: 'Appropriate technical and organizational security measures',
    framework: 'GDPR',
    category: 'Data Protection',
    status: 'pending',
    riskLevel: 'high',
    owner: 'Emma Davis',
    ownerAvatar: '',
    lastTested: '2024-01-02',
    evidence: [
      { id: 'e4', name: 'DPA Agreement.pdf', type: 'document', uploadedAt: '2024-01-02', uploadedBy: 'Legal Team', status: 'pending', fileSize: '856 KB' }
    ],
    findings: 1
  }
]

// Mock risks
const mockRisks: Risk[] = [
  {
    id: 'risk1',
    name: 'Data Breach',
    description: 'Unauthorized access to customer PII data',
    category: 'security',
    inherentRisk: 85,
    residualRisk: 25,
    likelihood: 'unlikely',
    impact: 'severe',
    status: 'mitigated',
    owner: 'Sarah Chen',
    controls: ['CC6.1', 'CC7.2', 'A.12.4'],
    lastReview: '2024-01-10'
  },
  {
    id: 'risk2',
    name: 'Regulatory Non-Compliance',
    description: 'Failure to meet GDPR or HIPAA requirements',
    category: 'compliance',
    inherentRisk: 70,
    residualRisk: 35,
    likelihood: 'possible',
    impact: 'major',
    status: 'open',
    owner: 'Emma Davis',
    controls: ['Art.32'],
    lastReview: '2024-01-08'
  },
  {
    id: 'risk3',
    name: 'Third-Party Vendor Risk',
    description: 'Security vulnerabilities from vendor integrations',
    category: 'operational',
    inherentRisk: 60,
    residualRisk: 40,
    likelihood: 'likely',
    impact: 'moderate',
    status: 'open',
    owner: 'Mike Johnson',
    controls: [],
    lastReview: '2024-01-05'
  }
]

// Mock audits
const mockAudits: Audit[] = [
  {
    id: 'audit1',
    name: 'SOC 2 Type II Annual Audit',
    type: 'external',
    framework: 'SOC 2',
    status: 'in_progress',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    auditor: 'Deloitte',
    findings: 3,
    criticalFindings: 0,
    progress: 65
  },
  {
    id: 'audit2',
    name: 'Q1 Internal Security Review',
    type: 'internal',
    framework: 'ISO 27001',
    status: 'completed',
    startDate: '2024-01-08',
    endDate: '2024-01-12',
    auditor: 'Internal Audit Team',
    findings: 5,
    criticalFindings: 1,
    progress: 100
  },
  {
    id: 'audit3',
    name: 'GDPR Compliance Check',
    type: 'regulatory',
    framework: 'GDPR',
    status: 'planned',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    auditor: 'EU Data Authority',
    findings: 0,
    criticalFindings: 0,
    progress: 0
  }
]

// Mock policies
const mockPolicies: Policy[] = [
  {
    id: 'pol1',
    name: 'Information Security Policy',
    version: '3.2',
    status: 'published',
    category: 'Security',
    owner: 'Sarah Chen',
    lastUpdated: '2024-01-05',
    nextReview: '2024-07-05',
    acknowledgements: 245,
    totalEmployees: 250
  },
  {
    id: 'pol2',
    name: 'Data Privacy Policy',
    version: '2.1',
    status: 'published',
    category: 'Privacy',
    owner: 'Emma Davis',
    lastUpdated: '2024-01-02',
    nextReview: '2024-04-02',
    acknowledgements: 250,
    totalEmployees: 250
  },
  {
    id: 'pol3',
    name: 'Acceptable Use Policy',
    version: '4.0',
    status: 'review',
    category: 'IT',
    owner: 'Mike Johnson',
    lastUpdated: '2024-01-10',
    nextReview: '2024-01-20',
    acknowledgements: 0,
    totalEmployees: 250
  }
]

// Competitive Upgrade Mock Data - ServiceNow GRC-level Compliance Intelligence
const mockComplianceAIInsights = [
  { id: '1', type: 'success' as const, title: 'SOC2 Ready', description: 'All 94 controls passing - ready for audit!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Audit' },
  { id: '2', type: 'warning' as const, title: 'Policy Gap', description: '3 GDPR requirements need updated documentation.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Policy' },
  { id: '3', type: 'info' as const, title: 'AI Recommendation', description: 'Automating evidence collection can reduce audit prep by 50%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockComplianceCollaborators = [
  { id: '1', name: 'Compliance Officer', avatar: '/avatars/compliance.jpg', status: 'online' as const, role: 'Officer' },
  { id: '2', name: 'Legal Counsel', avatar: '/avatars/legal.jpg', status: 'online' as const, role: 'Counsel' },
  { id: '3', name: 'Risk Manager', avatar: '/avatars/risk.jpg', status: 'away' as const, role: 'Manager' },
]

const mockCompliancePredictions = [
  { id: '1', title: 'Audit Readiness', prediction: 'ISO 27001 certification achievable in 6 weeks', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Risk Score', prediction: 'Implementing controls will reduce risk score by 30%', confidence: 84, trend: 'down' as const, impact: 'medium' as const },
]

const mockComplianceActivities = [
  { id: '1', user: 'Compliance Officer', action: 'Completed', target: 'annual policy review', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Legal Counsel', action: 'Approved', target: 'data processing agreement', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Risk Manager', action: 'Updated', target: 'risk register entries', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside the component to access state and handlers
const mockComplianceQuickActionsBase = [
  { id: '1', label: 'New Control', icon: 'plus', variant: 'default' as const },
  { id: '2', label: 'Assess', icon: 'check-circle', variant: 'default' as const },
  { id: '3', label: 'Report', icon: 'file-text', variant: 'outline' as const },
]

// Aggregate all evidence from controls
const mockEvidence = mockControls.flatMap(c => c.evidence || [])

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

// Helper function to generate compliance report
const generateComplianceReport = () => {
  const report = {
    generatedAt: new Date().toISOString(),
    overallCompliance: mockFrameworks.reduce((sum, f) => sum + f.complianceScore, 0) / mockFrameworks.length,
    frameworks: mockFrameworks.map(f => ({
      name: f.name,
      score: f.complianceScore,
      status: f.status,
      passedControls: f.passedControls,
      failedControls: f.failedControls,
      pendingControls: f.pendingControls
    })),
    controls: mockControls.map(c => ({
      id: c.controlId,
      name: c.name,
      framework: c.framework,
      status: c.status,
      riskLevel: c.riskLevel,
      findings: c.findings
    })),
    risks: mockRisks.map(r => ({
      name: r.name,
      category: r.category,
      status: r.status,
      inherentRisk: r.inherentRisk,
      residualRisk: r.residualRisk
    })),
    audits: mockAudits.map(a => ({
      name: a.name,
      type: a.type,
      status: a.status,
      progress: a.progress,
      findings: a.findings
    }))
  }
  return report
}

export default function ComplianceClient() {
  const [activeTab, setActiveTab] = useState('frameworks')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null)
  const [selectedControl, setSelectedControl] = useState<Control | null>(null)
  const [showControlDialog, setShowControlDialog] = useState(false)
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false)
  const [showFrameworkDialog, setShowFrameworkDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for TODO handlers
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)

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

  // State for controls and risks to enable real updates
  const [controls, setControls] = useState(mockControls)
  const [risks, setRisks] = useState(mockRisks)
  const [audits, setAudits] = useState(mockAudits)
  const [policies, setPolicies] = useState(mockPolicies)
  const [frameworks, setFrameworks] = useState(mockFrameworks)

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

  const stats = useMemo(() => ({
    overallCompliance: mockFrameworks.reduce((sum, f) => sum + f.complianceScore, 0) / mockFrameworks.length,
    totalControls: mockFrameworks.reduce((sum, f) => sum + f.totalControls, 0),
    passedControls: mockFrameworks.reduce((sum, f) => sum + f.passedControls, 0),
    failedControls: mockFrameworks.reduce((sum, f) => sum + f.failedControls, 0),
    openRisks: mockRisks.filter(r => r.status === 'open').length,
    activeAudits: mockAudits.filter(a => a.status === 'in_progress').length
  }), [])

  // Handlers with real functionality
  const handleRunAudit = () => {
    toast.promise(
      (async () => {
        // Simulate running audit by updating control statuses
        await new Promise(r => setTimeout(r, 1000))
        // In a real app, this would call an API
        setControls(prev => prev.map(c => ({
          ...c,
          lastTested: new Date().toISOString().split('T')[0]
        })))
        return { message: 'Audit completed' }
      })(),
      { loading: 'Running compliance audit...', success: 'Audit completed successfully! Controls updated.', error: 'Audit failed' }
    )
  }

  const handleGenerateReport = () => {
    toast.promise(
      (async () => {
        await new Promise(r => setTimeout(r, 500))
        const report = generateComplianceReport()
        downloadAsJson(report, `compliance-report-${new Date().toISOString().split('T')[0]}.json`)
        return report
      })(),
      { loading: 'Generating report...', success: 'Report generated and downloaded!', error: 'Failed to generate report' }
    )
  }

  const handleResolveIssue = (id: string) => {
    toast.promise(
      (async () => {
        await new Promise(r => setTimeout(r, 300))
        // Update risk status to mitigated
        setRisks(prev => prev.map(r => r.id === id ? { ...r, status: 'mitigated' as const } : r))
        return { id }
      })(),
      { loading: 'Resolving issue...', success: `Issue #${id} resolved and status updated`, error: 'Failed to resolve' }
    )
  }

  const handleExport = () => {
    toast.promise(
      (async () => {
        await new Promise(r => setTimeout(r, 300))
        const exportData = {
          exportedAt: new Date().toISOString(),
          frameworks: frameworks,
          controls: controls,
          risks: risks,
          audits: audits,
          policies: policies
        }
        downloadAsJson(exportData, `compliance-export-${new Date().toISOString().split('T')[0]}.json`)
        return exportData
      })(),
      { loading: 'Exporting data...', success: 'Export downloaded!', error: 'Export failed' }
    )
  }

  const handleCopyApiToken = () => {
    const apiToken = 'grc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    toast.promise(
      copyToClipboard(apiToken),
      { loading: 'Copying to clipboard...', success: 'API token copied to clipboard', error: 'Failed to copy token' }
    )
  }

  const handleRegenerateToken = () => {
    toast.promise(
      (async () => {
        await new Promise(r => setTimeout(r, 500))
        // In real app, this would call API to regenerate token
        const newToken = 'grc_' + Math.random().toString(36).substring(2, 34)
        await copyToClipboard(newToken)
        return { token: newToken }
      })(),
      { loading: 'Regenerating API token...', success: 'New token generated and copied!', error: 'Failed to regenerate' }
    )
  }

  const handleTestWebhook = (url?: string) => {
    toast.promise(
      (async () => {
        await new Promise(r => setTimeout(r, 800))
        // In real app, this would send a test request to the webhook URL
        if (!url) throw new Error('No webhook URL provided')
        return { url, status: 'success' }
      })(),
      { loading: 'Testing webhook connection...', success: 'Webhook test successful!', error: 'Webhook test failed' }
    )
  }

  const handleResetControls = () => {
    toast.promise(
      (async () => {
        await new Promise(r => setTimeout(r, 500))
        setControls(mockControls.map(c => ({ ...c, status: 'pending' as const })))
        return { reset: true }
      })(),
      { loading: 'Resetting all controls...', success: 'Controls reset successfully', error: 'Reset failed' }
    )
  }

  const handleDeleteEvidence = () => {
    if (!confirm('Are you sure you want to delete all evidence? This action cannot be undone.')) {
      return
    }
    toast.promise(
      (async () => {
        await new Promise(r => setTimeout(r, 500))
        // Clear evidence from all controls
        setControls(prev => prev.map(c => ({ ...c, evidence: [] })))
        return { deleted: true }
      })(),
      { loading: 'Deleting all evidence...', success: 'Evidence deleted', error: 'Delete failed' }
    )
  }

  const handleConnectService = (serviceName: string, connected: boolean) => {
    toast.promise(
      (async () => {
        await new Promise(r => setTimeout(r, 800))
        // In real app, would open OAuth flow or configuration
        return { service: serviceName, action: connected ? 'configured' : 'connected' }
      })(),
      {
        loading: `${connected ? 'Configuring' : 'Connecting'} ${serviceName}...`,
        success: `${serviceName} ${connected ? 'configured' : 'connected'}!`,
        error: `Failed to ${connected ? 'configure' : 'connect'}`
      }
    )
  }

  // Quick actions with real handlers for the QuickActionsToolbar
  const complianceQuickActions = mockComplianceQuickActionsBase.map(action => ({
    ...action,
    action: action.label === 'New Control'
      ? () => {
          toast.promise(
            (async () => {
              await new Promise(r => setTimeout(r, 300))
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
              return { created: true }
            })(),
            { loading: 'Creating compliance control...', success: 'New control created! Configure requirements and evidence', error: 'Failed to create control' }
          )
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
        toast.promise(
          (async () => {
            await new Promise(r => setTimeout(r, 300))
            return { action: actionLabel }
          })(),
          { loading: `Creating ${actionLabel.replace('Add ', '').replace('New ', '')}...`, success: `${actionLabel.replace('Add ', '').replace('New ', '')} created successfully`, error: 'Action failed' }
        )
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
        toast.promise(
          (async () => {
            await new Promise(r => setTimeout(r, 500))
            setControls([...mockControls])
            setRisks([...mockRisks])
            return { synced: true }
          })(),
          { loading: 'Syncing data...', success: 'Data synced successfully', error: 'Sync failed' }
        )
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
        toast.promise(
          (async () => {
            await new Promise(r => setTimeout(r, 300))
            const failedControls = controls.filter(c => c.status === 'failed')
            if (failedControls.length > 0) {
              downloadAsJson(failedControls, `${actionLabel.toLowerCase()}-report.json`)
            }
            return { count: failedControls.length }
          })(),
          { loading: `Finding ${actionLabel.toLowerCase()}...`, success: (data) => `Found ${data.count} items - report downloaded`, error: 'Action failed' }
        )
        break
      case 'Import':
        setShowImportDialog(true)
        break
      case 'Matrix':
        toast.promise(
          (async () => {
            await new Promise(r => setTimeout(r, 300))
            const matrix = risks.map(r => ({
              name: r.name,
              likelihood: r.likelihood,
              impact: r.impact,
              inherentRisk: r.inherentRisk,
              residualRisk: r.residualRisk
            }))
            downloadAsJson(matrix, 'risk-matrix.json')
            return matrix
          })(),
          { loading: 'Generating risk matrix...', success: 'Risk matrix downloaded', error: 'Failed to generate matrix' }
        )
        break
      case 'Mitigate':
        toast.promise(
          (async () => {
            await new Promise(r => setTimeout(r, 300))
            setRisks(prev => prev.map(r => r.status === 'open' ? { ...r, status: 'mitigated' as const } : r))
            return { mitigated: true }
          })(),
          { loading: 'Mitigating open risks...', success: 'All open risks marked as mitigated', error: 'Failed to mitigate' }
        )
        break
      case 'Schedule':
        setShowScheduleDialog(true)
        break
      case 'Findings':
        toast.promise(
          (async () => {
            await new Promise(r => setTimeout(r, 300))
            const findings = audits.flatMap(a => ({ audit: a.name, findings: a.findings, critical: a.criticalFindings }))
            downloadAsJson(findings, 'audit-findings.json')
            return findings
          })(),
          { loading: 'Compiling findings...', success: 'Findings report downloaded', error: 'Failed to compile findings' }
        )
        break
      case 'Assign':
        setShowAssignDialog(true)
        break
      case 'Templates':
        toast.info('Opening policy templates library browser')
        break
      case 'Approve':
        toast.promise(
          (async () => {
            await new Promise(r => setTimeout(r, 300))
            setPolicies(prev => prev.map(p => p.status === 'review' ? { ...p, status: 'approved' as const } : p))
            return { approved: true }
          })(),
          { loading: 'Approving policies...', success: 'All policies in review approved', error: 'Failed to approve' }
        )
        break
      case 'Versions':
        toast.info('Opening version history viewer')
        break
      case 'Attestation':
        toast.info('Opening attestation tracking dashboard')
        break
      case 'Distribute':
        toast.promise(
          (async () => {
            await new Promise(r => setTimeout(r, 300))
            return { distributed: policies.filter(p => p.status === 'published').length }
          })(),
          { loading: 'Distributing policies...', success: (data) => `${data.distributed} policies distributed to employees`, error: 'Distribution failed' }
        )
        break
      default:
        toast.info(`${actionLabel} action initiated`)
        break
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
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={handleExport}>
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
          <div className="grid grid-cols-6 gap-4">
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
                  <p className="text-2xl font-bold">{mockFrameworks.length}</p>
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
                    <p className="text-3xl font-bold">{mockFrameworks.length}</p>
                    <p className="text-blue-200 text-sm">Frameworks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockFrameworks.filter(f => f.status === 'compliant').length}</p>
                    <p className="text-blue-200 text-sm">Compliant</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(mockFrameworks.reduce((sum, f) => sum + f.complianceScore, 0) / mockFrameworks.length).toFixed(0)}%</p>
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

            <div className="grid grid-cols-3 gap-6">
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
                  <div className="grid grid-cols-3 gap-4 mb-4">
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
                    <p className="text-3xl font-bold">{mockControls.length}</p>
                    <p className="text-emerald-200 text-sm">Controls</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockControls.filter(c => c.status === 'passing').length}</p>
                    <p className="text-emerald-200 text-sm">Passing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockControls.filter(c => c.status === 'failing').length}</p>
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
                    <p className="text-3xl font-bold">{mockRisks.length}</p>
                    <p className="text-rose-200 text-sm">Total Risks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockRisks.filter(r => r.severity === 'critical').length}</p>
                    <p className="text-rose-200 text-sm">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockRisks.filter(r => r.status === 'mitigated').length}</p>
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
              <Button onClick={() => toast.promise(
                (async () => {
                  await new Promise(r => setTimeout(r, 300))
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
                  return { created: true }
                })(),
                { loading: 'Creating risk...', success: 'Risk created - configure details', error: 'Failed to create' }
              )}>
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

                  <div className="grid grid-cols-5 gap-4 mb-4">
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
                    <p className="text-3xl font-bold">{mockAudits.length}</p>
                    <p className="text-amber-200 text-sm">Audits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAudits.filter(a => a.status === 'in_progress').length}</p>
                    <p className="text-amber-200 text-sm">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAudits.filter(a => a.status === 'completed').length}</p>
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
              <Button onClick={() => toast.promise(
                (async () => {
                  await new Promise(r => setTimeout(r, 300))
                  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  setAudits(prev => [...prev, {
                    id: `audit${prev.length + 1}`,
                    name: 'New Scheduled Audit',
                    type: 'internal' as const,
                    framework: 'Custom',
                    status: 'planned' as const,
                    startDate: nextMonth.toISOString().split('T')[0],
                    endDate: new Date(nextMonth.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    auditor: 'Internal Audit Team',
                    findings: 0,
                    criticalFindings: 0,
                    progress: 0
                  }])
                  return { scheduled: true }
                })(),
                { loading: 'Scheduling audit...', success: 'Audit scheduled for next month', error: 'Failed to schedule' }
              )}>
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

                  <div className="grid grid-cols-4 gap-4 mb-4">
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
                      toast.promise(
                        (async () => {
                          await new Promise(r => setTimeout(r, 200))
                          downloadAsJson(audit, `audit-${audit.id}-details.json`)
                          return audit
                        })(),
                        { loading: 'Loading audit details...', success: `Viewing ${audit.name} - details downloaded`, error: 'Failed to load' }
                      )
                    }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      toast.promise(
                        (async () => {
                          await new Promise(r => setTimeout(r, 200))
                          const findingsReport = {
                            audit: audit.name,
                            findings: audit.findings,
                            criticalFindings: audit.criticalFindings,
                            status: audit.status,
                            generatedAt: new Date().toISOString()
                          }
                          downloadAsJson(findingsReport, `audit-${audit.id}-findings.json`)
                          return findingsReport
                        })(),
                        { loading: 'Generating findings report...', success: 'Findings report downloaded', error: 'Failed to generate' }
                      )
                    }}>
                      <FileText className="w-4 h-4 mr-2" />
                      Findings
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
                    <p className="text-3xl font-bold">{mockPolicies.length}</p>
                    <p className="text-violet-200 text-sm">Policies</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockPolicies.filter(p => p.status === 'active').length}</p>
                    <p className="text-violet-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockPolicies.filter(p => p.status === 'pending_review').length}</p>
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
              <Button onClick={() => toast.promise(
                (async () => {
                  await new Promise(r => setTimeout(r, 300))
                  setPolicies(prev => [...prev, {
                    id: `pol${prev.length + 1}`,
                    name: 'New Policy',
                    version: '1.0',
                    status: 'draft' as const,
                    category: 'General',
                    owner: 'Current User',
                    lastUpdated: new Date().toISOString().split('T')[0],
                    nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    acknowledgements: 0,
                    totalEmployees: 250
                  }])
                  return { created: true }
                })(),
                { loading: 'Creating policy...', success: 'Policy created as draft', error: 'Failed to create' }
              )}>
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
                          downloadAsJson(policy, `policy-${policy.id}.json`)
                          toast.success(`Viewing ${policy.name}`)
                        }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          toast.info(`Policy settings: ${policy.name}`)
                        }}>
                          <Settings className="w-4 h-4" />
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
                    <p className="text-3xl font-bold">{mockEvidence.length}</p>
                    <p className="text-cyan-200 text-sm">Evidence</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockEvidence.filter(e => e.status === 'approved').length}</p>
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

            <div className="grid grid-cols-3 gap-4 mb-6">
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

            <div className="grid grid-cols-4 gap-4 mt-6">
              {mockControls.flatMap(c => c.evidence).slice(0, 4).map(evidence => (
                <Card key={evidence.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{evidence.name}</p>
                      <p className="text-xs text-gray-500">{evidence.fileSize}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={evidence.status === 'approved' ? 'bg-green-100 text-green-700' : evidence.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                      {evidence.status}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={handleExport}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
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
                            toast.loading('Opening editor...', { id: 'org-edit' })
                            setTimeout(() => {
                              toast.success('Organization name editor opened', { id: 'org-edit' })
                            }, 500)
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
                      <div className="grid grid-cols-2 gap-4">
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
                          <Button variant="outline" className="flex-1" onClick={handleExport}>
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
            <AIInsightsPanel
              insights={mockComplianceAIInsights}
              title="Compliance Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockComplianceCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCompliancePredictions}
              title="Compliance Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockComplianceActivities}
            title="Compliance Activity"
            maxItems={5}
          />
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
                    toast.promise(
                      (async () => {
                        await new Promise(r => setTimeout(r, 1500))
                        // Simulate parsing and importing
                        const reader = new FileReader()
                        reader.onload = () => {
                          try {
                            // Attempt to parse JSON files
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
                            // If parsing fails, just show success anyway for demo
                          }
                        }
                        reader.readAsText(importFile)
                        return { filename: importFile.name }
                      })(),
                      {
                        loading: `Importing ${importFile.name}...`,
                        success: (data) => {
                          setShowImportDialog(false)
                          setImportFile(null)
                          return `Successfully imported data from ${data.filename}`
                        },
                        error: 'Failed to import file'
                      }
                    )
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                disabled={!scheduleForm.name || !scheduleForm.startDate || !scheduleForm.endDate}
                onClick={() => {
                  toast.promise(
                    (async () => {
                      await new Promise(r => setTimeout(r, 800))
                      const newAudit: Audit = {
                        id: `audit${audits.length + 1}`,
                        name: scheduleForm.name,
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
                      return newAudit
                    })(),
                    {
                      loading: 'Scheduling audit...',
                      success: (audit) => {
                        setShowScheduleDialog(false)
                        setScheduleForm({
                          name: '',
                          framework: 'SOC 2',
                          type: 'internal',
                          startDate: '',
                          endDate: '',
                          auditor: ''
                        })
                        return `Audit "${audit.name}" scheduled for ${new Date(audit.startDate).toLocaleDateString()}`
                      },
                      error: 'Failed to schedule audit'
                    }
                  )
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
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
                  {mockComplianceCollaborators.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                        <Badge variant="outline" className="text-xs">{member.role}</Badge>
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

                  toast.promise(
                    (async () => {
                      await new Promise(r => setTimeout(r, 600))
                      return { audit: selectedAuditData?.name, member: memberName, role: assignForm.role }
                    })(),
                    {
                      loading: 'Assigning team member...',
                      success: (data) => {
                        setShowAssignDialog(false)
                        setAssignForm({
                          selectedAudit: '',
                          selectedMember: '',
                          role: 'auditor'
                        })
                        return `${data.member} assigned as ${data.role} to "${data.audit}"`
                      },
                      error: 'Failed to assign team member'
                    }
                  )
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                Assign Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
