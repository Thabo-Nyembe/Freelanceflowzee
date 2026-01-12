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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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

// Dialog form state interfaces
interface NewControlForm {
  controlId: string
  name: string
  description: string
  framework: string
  category: string
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  owner: string
}

interface NewFrameworkForm {
  name: string
  shortName: string
  description: string
  version: string
}

interface NewRiskForm {
  name: string
  description: string
  category: 'operational' | 'security' | 'financial' | 'compliance' | 'strategic'
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain'
  impact: 'minimal' | 'minor' | 'moderate' | 'major' | 'severe'
  owner: string
}

interface NewAuditForm {
  name: string
  type: 'internal' | 'external' | 'regulatory'
  framework: string
  startDate: string
  endDate: string
  auditor: string
}

interface NewPolicyForm {
  name: string
  version: string
  category: string
  owner: string
  content: string
}

interface EvidenceUploadForm {
  controlId: string
  files: File[]
  notes: string
}

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

// Quick actions will be defined inside the component to use state setters

// Aggregate all evidence from controls
const mockEvidence = mockControls.flatMap(c => c.evidence || [])

export default function ComplianceClient() {
  const [activeTab, setActiveTab] = useState('frameworks')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null)
  const [selectedControl, setSelectedControl] = useState<Control | null>(null)
  const [showControlDialog, setShowControlDialog] = useState(false)
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for real functionality
  const [showNewControlDialog, setShowNewControlDialog] = useState(false)
  const [showNewFrameworkDialog, setShowNewFrameworkDialog] = useState(false)
  const [showNewRiskDialog, setShowNewRiskDialog] = useState(false)
  const [showNewAuditDialog, setShowNewAuditDialog] = useState(false)
  const [showNewPolicyDialog, setShowNewPolicyDialog] = useState(false)
  const [showUploadEvidenceDialog, setShowUploadEvidenceDialog] = useState(false)
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showGapAnalysisDialog, setShowGapAnalysisDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showMitigationDialog, setShowMitigationDialog] = useState(false)
  const [showRiskMatrixDialog, setShowRiskMatrixDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showAttestationDialog, setShowAttestationDialog] = useState(false)
  const [showDistributeDialog, setShowDistributeDialog] = useState(false)
  const [showVersionsDialog, setShowVersionsDialog] = useState(false)

  // New dialog states for toast-only replacements
  const [showItemDetailsDialog, setShowItemDetailsDialog] = useState(false)
  const [showEditOrganizationDialog, setShowEditOrganizationDialog] = useState(false)
  const [showServiceConfigDialog, setShowServiceConfigDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showPolicySettingsDialog, setShowPolicySettingsDialog] = useState(false)
  const [showVersionViewDialog, setShowVersionViewDialog] = useState(false)

  // State for detail dialogs
  const [detailItem, setDetailItem] = useState<{ type: string; name: string; data?: unknown } | null>(null)
  const [selectedService, setSelectedService] = useState<{ name: string; connected: boolean } | null>(null)
  const [selectedPolicyForSettings, setSelectedPolicyForSettings] = useState<Policy | null>(null)
  const [selectedVersionForView, setSelectedVersionForView] = useState<{ version: string; date: string; author: string; changes: string } | null>(null)

  // Data states for toast-only fixes
  const [remediationPlans, setRemediationPlans] = useState<Array<{ id: string; framework: string; control: string; gap: string; severity: string; createdAt: string }>>([])
  const [controlFilters, setControlFilters] = useState({ status: 'all', riskLevel: 'all', framework: 'all' })
  const [mitigationPlans, setMitigationPlans] = useState<Array<{ id: string; riskId: string; strategy: string; actions: string; targetDate: string; assignedTo: string }>>([])
  const [auditAssignments, setAuditAssignments] = useState<Record<string, string[]>>({})
  const [attestationsSent, setAttestationsSent] = useState<Array<{ policyId: string; recipients: string; dueDate: string; sentAt: string }>>([])
  const [policiesDistributed, setPoliciesDistributed] = useState<Array<{ policyId: string; channels: string[]; audience: string; distributedAt: string }>>([])
  const [organizationDetails, setOrganizationDetails] = useState({
    name: 'FreeFlow Inc.',
    legalName: 'FreeFlow Technologies Inc.',
    address: '123 Tech Park Drive, Suite 500',
    city: 'San Francisco',
    country: 'us',
    email: 'compliance@freeflow.com'
  })
  const [serviceConfigs, setServiceConfigs] = useState<Record<string, { syncFrequency: string; syncControls: boolean; syncEvidence: boolean; syncLogs: boolean }>>({})
  const [policySettings, setPolicySettings] = useState<Record<string, { autoDistribute: boolean; requireAck: boolean; sendReminders: boolean; approvalWorkflow: string; reviewFrequency: string }>>({})

  // Filter form state
  const [filterFormStatus, setFilterFormStatus] = useState('all')
  const [filterFormRiskLevel, setFilterFormRiskLevel] = useState('all')
  const [filterFormFramework, setFilterFormFramework] = useState('all')

  // Mitigation form state
  const [mitigationFormRisk, setMitigationFormRisk] = useState('risk1')
  const [mitigationFormStrategy, setMitigationFormStrategy] = useState('reduce')
  const [mitigationFormActions, setMitigationFormActions] = useState('')
  const [mitigationFormTargetDate, setMitigationFormTargetDate] = useState('')
  const [mitigationFormAssignedTo, setMitigationFormAssignedTo] = useState('')

  // Assign form state
  const [assignFormAudit, setAssignFormAudit] = useState('audit1')
  const [assignFormMembers, setAssignFormMembers] = useState<string[]>([])
  const [assignFormRole, setAssignFormRole] = useState('reviewer')

  // Attestation form state
  const [attestationFormPolicy, setAttestationFormPolicy] = useState('pol1')
  const [attestationFormRecipients, setAttestationFormRecipients] = useState('all')
  const [attestationFormDueDate, setAttestationFormDueDate] = useState('')
  const [attestationFormFrequency, setAttestationFormFrequency] = useState('weekly')

  // Distribute form state
  const [distributeFormPolicy, setDistributeFormPolicy] = useState('pol1')
  const [distributeFormChannels, setDistributeFormChannels] = useState({ email: true, slack: true, portal: true })
  const [distributeFormAudience, setDistributeFormAudience] = useState('all')

  // Organization form state
  const [orgFormName, setOrgFormName] = useState('FreeFlow Inc.')
  const [orgFormLegalName, setOrgFormLegalName] = useState('FreeFlow Technologies Inc.')
  const [orgFormAddress, setOrgFormAddress] = useState('123 Tech Park Drive, Suite 500')
  const [orgFormCity, setOrgFormCity] = useState('San Francisco')
  const [orgFormCountry, setOrgFormCountry] = useState('us')
  const [orgFormEmail, setOrgFormEmail] = useState('compliance@freeflow.com')

  // Service config form state
  const [serviceFormSyncFrequency, setServiceFormSyncFrequency] = useState('hourly')
  const [serviceFormSyncControls, setServiceFormSyncControls] = useState(true)
  const [serviceFormSyncEvidence, setServiceFormSyncEvidence] = useState(true)
  const [serviceFormSyncLogs, setServiceFormSyncLogs] = useState(false)

  // Policy settings form state
  const [policySettingsAutoDistribute, setPolicySettingsAutoDistribute] = useState(true)
  const [policySettingsRequireAck, setPolicySettingsRequireAck] = useState(true)
  const [policySettingsSendReminders, setPolicySettingsSendReminders] = useState(true)
  const [policySettingsApprovalWorkflow, setPolicySettingsApprovalWorkflow] = useState('single')
  const [policySettingsReviewFrequency, setPolicySettingsReviewFrequency] = useState('6months')

  // Approve policy form state
  const [approveFormPolicy, setApproveFormPolicy] = useState('pol3')
  const [approveFormComments, setApproveFormComments] = useState('')
  const [approveFormNotifyOwner, setApproveFormNotifyOwner] = useState(true)

  // Policy approval state (track approved/rejected policies)
  const [policyApprovals, setPolicyApprovals] = useState<Record<string, { status: 'approved' | 'rejected'; comments: string; date: string }>>({})

  // Form states
  const [newControlForm, setNewControlForm] = useState<NewControlForm>({
    controlId: '',
    name: '',
    description: '',
    framework: 'SOC 2',
    category: 'Access Control',
    riskLevel: 'medium',
    owner: ''
  })
  const [newFrameworkForm, setNewFrameworkForm] = useState<NewFrameworkForm>({
    name: '',
    shortName: '',
    description: '',
    version: ''
  })
  const [newRiskForm, setNewRiskForm] = useState<NewRiskForm>({
    name: '',
    description: '',
    category: 'operational',
    likelihood: 'possible',
    impact: 'moderate',
    owner: ''
  })
  const [newAuditForm, setNewAuditForm] = useState<NewAuditForm>({
    name: '',
    type: 'internal',
    framework: 'SOC 2',
    startDate: '',
    endDate: '',
    auditor: ''
  })
  const [newPolicyForm, setNewPolicyForm] = useState<NewPolicyForm>({
    name: '',
    version: '1.0',
    category: 'Security',
    owner: '',
    content: ''
  })
  const [evidenceUploadForm, setEvidenceUploadForm] = useState<EvidenceUploadForm>({
    controlId: '',
    files: [],
    notes: ''
  })
  const [exportFormat, setExportFormat] = useState('pdf')
  const [reportType, setReportType] = useState('compliance-summary')

  // Quick actions with dialog-opening functionality
  const complianceQuickActions = [
    { id: '1', label: 'New Control', icon: 'plus', action: () => setShowNewControlDialog(true), variant: 'default' as const },
    { id: '2', label: 'Assess', icon: 'check-circle', action: () => setShowAssessmentDialog(true), variant: 'default' as const },
    { id: '3', label: 'Report', icon: 'file-text', action: () => setShowReportDialog(true), variant: 'outline' as const },
  ]

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

  // Handlers - Now opening dialogs for real functionality
  const handleRunAudit = () => {
    setShowNewAuditDialog(true)
  }

  const handleGenerateReport = () => {
    setShowReportDialog(true)
  }

  const handleResolveIssue = (id: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1200)),
      {
        loading: `Resolving issue #${id}...`,
        success: `Issue #${id} has been resolved and logged.`,
        error: `Failed to resolve issue #${id}. Please try again.`
      }
    )
  }

  const handleExport = () => {
    setShowExportDialog(true)
  }

  const handleAddFramework = () => {
    setShowNewFrameworkDialog(true)
  }

  const handleViewControls = (frameworkName: string) => {
    setActiveTab('controls')
    setSearchQuery(frameworkName)
    toast.success(`Showing ${frameworkName} controls`)
  }

  const handleAddControl = () => {
    setShowNewControlDialog(true)
  }

  const handleTestAllControls = () => {
    setShowAssessmentDialog(true)
  }

  const handleUploadEvidence = (controlId?: string) => {
    if (controlId) {
      setEvidenceUploadForm(prev => ({ ...prev, controlId }))
    }
    setShowUploadEvidenceDialog(true)
  }

  const handleViewDetails = (itemType: string, itemName: string) => {
    setDetailItem({ type: itemType, name: itemName })
    setShowItemDetailsDialog(true)
  }

  const handleAddRisk = () => {
    setShowNewRiskDialog(true)
  }

  const handleScheduleAudit = () => {
    setShowNewAuditDialog(true)
  }

  const handleCreatePolicy = () => {
    setShowNewPolicyDialog(true)
  }

  const handleFilter = () => {
    setShowFilterDialog(true)
  }

  // Form submission handlers
  const handleSubmitNewControl = () => {
    if (!newControlForm.controlId || !newControlForm.name) {
      toast.error('Please fill in required fields')
      return
    }
    toast.success('Control created successfully', { description: `${newControlForm.name} has been added` })
    setShowNewControlDialog(false)
    setNewControlForm({ controlId: '', name: '', description: '', framework: 'SOC 2', category: 'Access Control', riskLevel: 'medium', owner: '' })
  }

  const handleSubmitNewFramework = () => {
    if (!newFrameworkForm.name || !newFrameworkForm.shortName) {
      toast.error('Please fill in required fields')
      return
    }
    toast.success('Framework added successfully', { description: `${newFrameworkForm.name} is now active` })
    setShowNewFrameworkDialog(false)
    setNewFrameworkForm({ name: '', shortName: '', description: '', version: '' })
  }

  const handleSubmitNewRisk = () => {
    if (!newRiskForm.name || !newRiskForm.description) {
      toast.error('Please fill in required fields')
      return
    }
    toast.success('Risk registered', { description: `${newRiskForm.name} added to risk register` })
    setShowNewRiskDialog(false)
    setNewRiskForm({ name: '', description: '', category: 'operational', likelihood: 'possible', impact: 'moderate', owner: '' })
  }

  const handleSubmitNewAudit = () => {
    if (!newAuditForm.name || !newAuditForm.startDate) {
      toast.error('Please fill in required fields')
      return
    }
    toast.success('Audit scheduled', { description: `${newAuditForm.name} has been scheduled` })
    setShowNewAuditDialog(false)
    setNewAuditForm({ name: '', type: 'internal', framework: 'SOC 2', startDate: '', endDate: '', auditor: '' })
  }

  const handleSubmitNewPolicy = () => {
    if (!newPolicyForm.name || !newPolicyForm.category) {
      toast.error('Please fill in required fields')
      return
    }
    toast.success('Policy created', { description: `${newPolicyForm.name} is now in draft status` })
    setShowNewPolicyDialog(false)
    setNewPolicyForm({ name: '', version: '1.0', category: 'Security', owner: '', content: '' })
  }

  const handleSubmitEvidence = () => {
    toast.success('Evidence uploaded', { description: 'Files are pending review' })
    setShowUploadEvidenceDialog(false)
    setEvidenceUploadForm({ controlId: '', files: [], notes: '' })
  }

  const handleRunAssessment = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: 'Running automated control tests...',
        success: 'Assessment complete. 94% passed, 6% require attention.',
        error: 'Assessment failed. Please try again.'
      }
    )
    setShowAssessmentDialog(false)
  }

  const handleGenerateReportSubmit = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `Generating ${reportType} report...`,
        success: 'Report generated! Download will begin shortly.',
        error: 'Failed to generate report.'
      }
    )
    setShowReportDialog(false)
  }

  const handleExportSubmit = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `Exporting as ${exportFormat.toUpperCase()}...`,
        success: 'Export complete! File downloaded.',
        error: 'Export failed.'
      }
    )
    setShowExportDialog(false)
  }

  const handleQuickAction = (actionLabel: string) => {
    const actionMap: Record<string, () => void> = {
      'Add Framework': handleAddFramework,
      'Audit': handleRunAudit,
      'Controls': () => setActiveTab('controls'),
      'Reports': handleGenerateReport,
      'Gaps': () => setShowGapAnalysisDialog(true),
      'Export': handleExport,
      'Sync': () => toast.promise(
        new Promise(resolve => setTimeout(resolve, 2000)),
        { loading: 'Syncing with connected services...', success: 'All integrations synced successfully.', error: 'Sync failed.' }
      ),
      'Settings': () => setActiveTab('settings'),
      'Add Control': handleAddControl,
      'Test All': handleTestAllControls,
      'Evidence': () => setActiveTab('evidence'),
      'Failures': () => {
        setSearchQuery('failed')
        setActiveTab('controls')
        toast.success('Showing failed controls', { description: '3 controls require remediation' })
      },
      'Import': () => setShowImportDialog(true),
      'Add Risk': handleAddRisk,
      'Assess': () => setShowAssessmentDialog(true),
      'Mitigate': () => setShowMitigationDialog(true),
      'Matrix': () => setShowRiskMatrixDialog(true),
      'Critical': () => {
        setSearchQuery('critical')
        toast.success('Filtering critical risks', { description: '2 critical risks require immediate attention' })
      },
      'New Audit': handleRunAudit,
      'Schedule': handleScheduleAudit,
      'Findings': handleGenerateReport,
      'Assign': () => setShowAssignDialog(true),
      'New Policy': handleCreatePolicy,
      'Templates': () => setShowTemplatesDialog(true),
      'Approve': () => setShowApproveDialog(true),
      'Versions': () => setShowVersionsDialog(true),
      'Attestation': () => setShowAttestationDialog(true),
      'Distribute': () => setShowDistributeDialog(true),
    }

    if (actionMap[actionLabel]) {
      actionMap[actionLabel]()
    } else {
      toast.info(actionLabel, { description: `${actionLabel} feature accessed.` })
    }
  }

  const handleEditOrganization = () => {
    setShowEditOrganizationDialog(true)
  }

  const handleTestWebhook = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Testing webhook connection...',
        success: 'Webhook test successful! Connection verified.',
        error: 'Webhook test failed. Check URL and try again.'
      }
    )
  }

  const handleConnectService = (serviceName: string, isConnected: boolean) => {
    if (isConnected) {
      setSelectedService({ name: serviceName, connected: isConnected })
      setShowServiceConfigDialog(true)
    } else {
      toast.promise(
        new Promise(resolve => setTimeout(resolve, 2000)),
        {
          loading: `Connecting to ${serviceName}...`,
          success: `${serviceName} connected successfully!`,
          error: `Failed to connect to ${serviceName}.`
        }
      )
    }
  }

  const handleCopyToken = async () => {
    const apiToken = 'sk-xxxx-xxxx-xxxx-xxxx'
    try {
      await navigator.clipboard.writeText(apiToken)
      toast.success('API token copied', { description: 'Token copied to clipboard securely.' })
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = apiToken
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        toast.success('API token copied', { description: 'Token copied to clipboard securely.' })
      } catch {
        toast.error('Failed to copy token', { description: 'Please copy manually.' })
      }
      document.body.removeChild(textArea)
    }
  }

  const handleRegenerateToken = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Regenerating API token...',
        success: 'New API token generated. Previous token invalidated.',
        error: 'Failed to regenerate token.'
      }
    )
  }

  const handleResetControls = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2500)),
      {
        loading: 'Resetting all control statuses...',
        success: 'All controls reset to pending state.',
        error: 'Failed to reset controls.'
      }
    )
  }

  const handleDeleteEvidence = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: 'Deleting all evidence permanently...',
        success: 'All evidence has been permanently deleted.',
        error: 'Failed to delete evidence.'
      }
    )
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
              {mockFrameworks.map(framework => (
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

                  <Button variant="outline" className="w-full mt-4" onClick={() => handleViewControls(framework.name)}>
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
                <Button variant="outline" size="sm" onClick={handleFilter}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" onClick={handleAddControl}>
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
                {mockControls.map(control => (
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
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleUploadEvidence(control.controlId); }}>
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewDetails('control', control.name); }}>
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
              <Button onClick={handleAddRisk}>
                <Plus className="w-4 h-4 mr-2" />
                Add Risk
              </Button>
            </div>

            <div className="grid gap-4">
              {mockRisks.map(risk => (
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
              <Button onClick={handleRunAudit}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Audit
              </Button>
            </div>

            <div className="grid gap-4">
              {mockAudits.map(audit => (
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
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails('audit', audit.name)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleQuickAction('Findings')}>
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
              <Button onClick={handleCreatePolicy}>
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
                {mockPolicies.map(policy => (
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
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails('policy', policy.name)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedPolicyForSettings(policy); setShowPolicySettingsDialog(true); }}>
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
              <Button onClick={() => handleUploadEvidence()}>
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
                          <Button variant="outline" size="sm" onClick={handleEditOrganization}>Edit</Button>
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
                        <Button variant="outline" className="w-full" onClick={handleAddFramework}>
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
                            <Button variant="outline" onClick={handleTestWebhook}>Test</Button>
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
                            <Button variant="outline" size="sm" onClick={handleCopyToken}>
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
              onInsightAction={(_insight) => toast.promise(
                new Promise(resolve => setTimeout(resolve, 800)),
                { loading: `Processing ${insight.title}...`, success: `${insight.title} action completed`, error: 'Action failed' }
              )}
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

      {/* New Control Dialog */}
      <Dialog open={showNewControlDialog} onOpenChange={setShowNewControlDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Control</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Control ID *</Label>
                <Input
                  placeholder="e.g., CC6.1"
                  value={newControlForm.controlId}
                  onChange={(e) => setNewControlForm(prev => ({ ...prev, controlId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Framework</Label>
                <Select value={newControlForm.framework} onValueChange={(v) => setNewControlForm(prev => ({ ...prev, framework: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOC 2">SOC 2</SelectItem>
                    <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                    <SelectItem value="GDPR">GDPR</SelectItem>
                    <SelectItem value="HIPAA">HIPAA</SelectItem>
                    <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Control Name *</Label>
              <Input
                placeholder="e.g., Logical Access Controls"
                value={newControlForm.name}
                onChange={(e) => setNewControlForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Describe the control requirements..."
                value={newControlForm.description}
                onChange={(e) => setNewControlForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newControlForm.category} onValueChange={(v) => setNewControlForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Access Control">Access Control</SelectItem>
                    <SelectItem value="Security Operations">Security Operations</SelectItem>
                    <SelectItem value="Data Protection">Data Protection</SelectItem>
                    <SelectItem value="Cryptography">Cryptography</SelectItem>
                    <SelectItem value="Network Security">Network Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select value={newControlForm.riskLevel} onValueChange={(v: 'critical' | 'high' | 'medium' | 'low') => setNewControlForm(prev => ({ ...prev, riskLevel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Input
                placeholder="Assign control owner..."
                value={newControlForm.owner}
                onChange={(e) => setNewControlForm(prev => ({ ...prev, owner: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewControlDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitNewControl}>Create Control</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Framework Dialog */}
      <Dialog open={showNewFrameworkDialog} onOpenChange={setShowNewFrameworkDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Compliance Framework</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Framework Name *</Label>
                <Input
                  placeholder="e.g., SOC 2 Type II"
                  value={newFrameworkForm.name}
                  onChange={(e) => setNewFrameworkForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Short Name *</Label>
                <Input
                  placeholder="e.g., SOC 2"
                  value={newFrameworkForm.shortName}
                  onChange={(e) => setNewFrameworkForm(prev => ({ ...prev, shortName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of the framework..."
                value={newFrameworkForm.description}
                onChange={(e) => setNewFrameworkForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Version</Label>
              <Input
                placeholder="e.g., 2023"
                value={newFrameworkForm.version}
                onChange={(e) => setNewFrameworkForm(prev => ({ ...prev, version: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewFrameworkDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitNewFramework}>Add Framework</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Risk Dialog */}
      <Dialog open={showNewRiskDialog} onOpenChange={setShowNewRiskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Risk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Risk Name *</Label>
              <Input
                placeholder="e.g., Data Breach"
                value={newRiskForm.name}
                onChange={(e) => setNewRiskForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                placeholder="Describe the risk scenario..."
                value={newRiskForm.description}
                onChange={(e) => setNewRiskForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newRiskForm.category} onValueChange={(v: NewRiskForm['category']) => setNewRiskForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Likelihood</Label>
                <Select value={newRiskForm.likelihood} onValueChange={(v: NewRiskForm['likelihood']) => setNewRiskForm(prev => ({ ...prev, likelihood: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="unlikely">Unlikely</SelectItem>
                    <SelectItem value="possible">Possible</SelectItem>
                    <SelectItem value="likely">Likely</SelectItem>
                    <SelectItem value="almost_certain">Almost Certain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Impact</Label>
                <Select value={newRiskForm.impact} onValueChange={(v: NewRiskForm['impact']) => setNewRiskForm(prev => ({ ...prev, impact: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Risk Owner</Label>
              <Input
                placeholder="Assign risk owner..."
                value={newRiskForm.owner}
                onChange={(e) => setNewRiskForm(prev => ({ ...prev, owner: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewRiskDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitNewRisk}>Register Risk</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Audit Dialog */}
      <Dialog open={showNewAuditDialog} onOpenChange={setShowNewAuditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Audit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Audit Name *</Label>
              <Input
                placeholder="e.g., Q1 Internal Security Review"
                value={newAuditForm.name}
                onChange={(e) => setNewAuditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Audit Type</Label>
                <Select value={newAuditForm.type} onValueChange={(v: NewAuditForm['type']) => setNewAuditForm(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Framework</Label>
                <Select value={newAuditForm.framework} onValueChange={(v) => setNewAuditForm(prev => ({ ...prev, framework: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOC 2">SOC 2</SelectItem>
                    <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                    <SelectItem value="GDPR">GDPR</SelectItem>
                    <SelectItem value="HIPAA">HIPAA</SelectItem>
                    <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={newAuditForm.startDate}
                  onChange={(e) => setNewAuditForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newAuditForm.endDate}
                  onChange={(e) => setNewAuditForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Auditor / Team</Label>
              <Input
                placeholder="e.g., Deloitte, Internal Audit Team"
                value={newAuditForm.auditor}
                onChange={(e) => setNewAuditForm(prev => ({ ...prev, auditor: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewAuditDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitNewAudit}>Schedule Audit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Policy Dialog */}
      <Dialog open={showNewPolicyDialog} onOpenChange={setShowNewPolicyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Policy Name *</Label>
                <Input
                  placeholder="e.g., Information Security Policy"
                  value={newPolicyForm.name}
                  onChange={(e) => setNewPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input
                  placeholder="e.g., 1.0"
                  value={newPolicyForm.version}
                  onChange={(e) => setNewPolicyForm(prev => ({ ...prev, version: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={newPolicyForm.category} onValueChange={(v) => setNewPolicyForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Privacy">Privacy</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input
                  placeholder="Policy owner..."
                  value={newPolicyForm.owner}
                  onChange={(e) => setNewPolicyForm(prev => ({ ...prev, owner: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Policy Content</Label>
              <textarea
                className="w-full min-h-[150px] p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="Draft your policy content here..."
                value={newPolicyForm.content}
                onChange={(e) => setNewPolicyForm(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewPolicyDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitNewPolicy}>Create Policy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Evidence Dialog */}
      <Dialog open={showUploadEvidenceDialog} onOpenChange={setShowUploadEvidenceDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Control ID</Label>
              <Input
                placeholder="e.g., CC6.1"
                value={evidenceUploadForm.controlId}
                onChange={(e) => setEvidenceUploadForm(prev => ({ ...prev, controlId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Files</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, PNG, JPG up to 50MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Add notes about this evidence..."
                value={evidenceUploadForm.notes}
                onChange={(e) => setEvidenceUploadForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowUploadEvidenceDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitEvidence}>Upload Evidence</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assessment Dialog */}
      <Dialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Run Compliance Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              This will run automated tests on all controls to verify compliance status.
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">Automated Testing</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">Tests will run against 116 controls across 5 frameworks</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assessment Scope</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  <SelectItem value="soc2">SOC 2 Only</SelectItem>
                  <SelectItem value="iso27001">ISO 27001 Only</SelectItem>
                  <SelectItem value="gdpr">GDPR Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAssessmentDialog(false)}>Cancel</Button>
              <Button onClick={handleRunAssessment}>
                <Zap className="w-4 h-4 mr-2" />
                Run Assessment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance-summary">Compliance Summary</SelectItem>
                  <SelectItem value="control-status">Control Status Report</SelectItem>
                  <SelectItem value="risk-assessment">Risk Assessment Report</SelectItem>
                  <SelectItem value="audit-findings">Audit Findings</SelectItem>
                  <SelectItem value="evidence-inventory">Evidence Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Framework Filter</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  <SelectItem value="soc2">SOC 2</SelectItem>
                  <SelectItem value="iso27001">ISO 27001</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" />
                <Input type="date" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
              <Button onClick={handleGenerateReportSubmit}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Compliance Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data to Export</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="exp-frameworks" defaultChecked className="rounded" />
                  <label htmlFor="exp-frameworks" className="text-sm">Frameworks</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="exp-controls" defaultChecked className="rounded" />
                  <label htmlFor="exp-controls" className="text-sm">Controls</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="exp-risks" defaultChecked className="rounded" />
                  <label htmlFor="exp-risks" className="text-sm">Risks</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="exp-evidence" className="rounded" />
                  <label htmlFor="exp-evidence" className="text-sm">Evidence</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button onClick={handleExportSubmit}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gap Analysis Dialog */}
      <Dialog open={showGapAnalysisDialog} onOpenChange={setShowGapAnalysisDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compliance Gap Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Review identified compliance gaps and recommended remediation actions.
            </p>
            <div className="space-y-3">
              {[
                { framework: 'HIPAA', control: 'Art.32', gap: 'Missing encryption for backup data', severity: 'high' },
                { framework: 'PCI DSS', control: '3.4', gap: 'PAN storage not fully encrypted', severity: 'critical' },
                { framework: 'ISO 27001', control: 'A.12.4', gap: 'TLS 1.3 not implemented on internal services', severity: 'high' },
              ].map((gap, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{gap.framework}</Badge>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{gap.control}</code>
                    </div>
                    <Badge className={gap.severity === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}>
                      {gap.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{gap.gap}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowGapAnalysisDialog(false)}>Close</Button>
              <Button onClick={() => {
                const gaps = [
                  { framework: 'HIPAA', control: 'Art.32', gap: 'Missing encryption for backup data', severity: 'high' },
                  { framework: 'PCI DSS', control: '3.4', gap: 'PAN storage not fully encrypted', severity: 'critical' },
                  { framework: 'ISO 27001', control: 'A.12.4', gap: 'TLS 1.3 not implemented on internal services', severity: 'high' },
                ]
                const newPlans = gaps.map(g => ({
                  id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  framework: g.framework,
                  control: g.control,
                  gap: g.gap,
                  severity: g.severity,
                  createdAt: new Date().toISOString()
                }))
                setRemediationPlans(prev => [...prev, ...newPlans])
                setShowGapAnalysisDialog(false)
                toast.success('Gap remediation plan created', { description: `${newPlans.length} remediation items added` })
              }}>
                Create Remediation Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Filter Controls</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterFormStatus} onValueChange={setFilterFormStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={filterFormRiskLevel} onValueChange={setFilterFormRiskLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Framework</Label>
              <Select value={filterFormFramework} onValueChange={setFilterFormFramework}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  <SelectItem value="soc2">SOC 2</SelectItem>
                  <SelectItem value="iso27001">ISO 27001</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setFilterFormStatus('all')
                setFilterFormRiskLevel('all')
                setFilterFormFramework('all')
                setControlFilters({ status: 'all', riskLevel: 'all', framework: 'all' })
                setShowFilterDialog(false)
                toast.success('Filters cleared')
              }}>Clear Filters</Button>
              <Button onClick={() => {
                setControlFilters({
                  status: filterFormStatus,
                  riskLevel: filterFormRiskLevel,
                  framework: filterFormFramework
                })
                setShowFilterDialog(false)
                const filterCount = [filterFormStatus, filterFormRiskLevel, filterFormFramework].filter(f => f !== 'all').length
                toast.success('Filters applied', { description: filterCount > 0 ? `${filterCount} filter(s) active` : 'Showing all controls' })
              }}>Apply Filters</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Controls</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Import Source</Label>
              <Select defaultValue="file">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">File Upload (CSV/Excel)</SelectItem>
                  <SelectItem value="vanta">Vanta Integration</SelectItem>
                  <SelectItem value="drata">Drata Integration</SelectItem>
                  <SelectItem value="secureframe">Secureframe Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.csv,.xlsx,.xls'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    toast.success('File selected', { description: file.name })
                  }
                }
                input.click()
              }}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Drop your file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Supports CSV, XLSX formats</p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.csv,.xlsx,.xls'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    toast.promise(
                      new Promise(resolve => setTimeout(resolve, 2000)),
                      {
                        loading: `Importing ${file.name}...`,
                        success: `Successfully imported controls from ${file.name}`,
                        error: 'Import failed. Please check the file format.'
                      }
                    )
                    setShowImportDialog(false)
                  }
                }
                input.click()
              }}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mitigation Dialog */}
      <Dialog open={showMitigationDialog} onOpenChange={setShowMitigationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Risk Mitigation Planner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Risk to Mitigate</Label>
              <Select value={mitigationFormRisk} onValueChange={setMitigationFormRisk}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk1">Data Breach - Security</SelectItem>
                  <SelectItem value="risk2">Regulatory Non-Compliance</SelectItem>
                  <SelectItem value="risk3">Third-Party Vendor Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mitigation Strategy</Label>
              <Select value={mitigationFormStrategy} onValueChange={setMitigationFormStrategy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reduce">Reduce Risk</SelectItem>
                  <SelectItem value="transfer">Transfer Risk</SelectItem>
                  <SelectItem value="accept">Accept Risk</SelectItem>
                  <SelectItem value="avoid">Avoid Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mitigation Actions</Label>
              <textarea
                className="w-full min-h-[100px] p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="Describe the mitigation actions to be taken..."
                value={mitigationFormActions}
                onChange={(e) => setMitigationFormActions(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input type="date" value={mitigationFormTargetDate} onChange={(e) => setMitigationFormTargetDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Input placeholder="Team member..." value={mitigationFormAssignedTo} onChange={(e) => setMitigationFormAssignedTo(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowMitigationDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!mitigationFormActions) {
                  toast.error('Please describe the mitigation actions')
                  return
                }
                const newPlan = {
                  id: `mit-${Date.now()}`,
                  riskId: mitigationFormRisk,
                  strategy: mitigationFormStrategy,
                  actions: mitigationFormActions,
                  targetDate: mitigationFormTargetDate,
                  assignedTo: mitigationFormAssignedTo
                }
                setMitigationPlans(prev => [...prev, newPlan])
                setShowMitigationDialog(false)
                // Reset form
                setMitigationFormRisk('risk1')
                setMitigationFormStrategy('reduce')
                setMitigationFormActions('')
                setMitigationFormTargetDate('')
                setMitigationFormAssignedTo('')
                toast.success('Mitigation plan saved', { description: `Strategy: ${mitigationFormStrategy}` })
              }}>Save Plan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Risk Matrix Dialog */}
      <Dialog open={showRiskMatrixDialog} onOpenChange={setShowRiskMatrixDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Risk Heat Matrix</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-1 text-center text-xs">
              <div></div>
              <div className="font-medium p-2">Minimal</div>
              <div className="font-medium p-2">Minor</div>
              <div className="font-medium p-2">Moderate</div>
              <div className="font-medium p-2">Major</div>
              <div className="font-medium p-2">Severe</div>

              <div className="font-medium p-2 text-right">Almost Certain</div>
              <div className="bg-yellow-400 p-4 rounded"></div>
              <div className="bg-orange-400 p-4 rounded"></div>
              <div className="bg-red-500 p-4 rounded"></div>
              <div className="bg-red-600 p-4 rounded"></div>
              <div className="bg-red-700 p-4 rounded"></div>

              <div className="font-medium p-2 text-right">Likely</div>
              <div className="bg-green-400 p-4 rounded"></div>
              <div className="bg-yellow-400 p-4 rounded"></div>
              <div className="bg-orange-400 p-4 rounded"></div>
              <div className="bg-red-500 p-4 rounded"></div>
              <div className="bg-red-600 p-4 rounded"></div>

              <div className="font-medium p-2 text-right">Possible</div>
              <div className="bg-green-400 p-4 rounded"></div>
              <div className="bg-yellow-300 p-4 rounded"></div>
              <div className="bg-yellow-400 p-4 rounded relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" title="Risk 2"></div>
                </div>
              </div>
              <div className="bg-orange-400 p-4 rounded"></div>
              <div className="bg-red-500 p-4 rounded"></div>

              <div className="font-medium p-2 text-right">Unlikely</div>
              <div className="bg-green-300 p-4 rounded"></div>
              <div className="bg-green-400 p-4 rounded"></div>
              <div className="bg-yellow-300 p-4 rounded"></div>
              <div className="bg-yellow-400 p-4 rounded"></div>
              <div className="bg-orange-400 p-4 rounded relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" title="Risk 1"></div>
                </div>
              </div>

              <div className="font-medium p-2 text-right">Rare</div>
              <div className="bg-green-200 p-4 rounded"></div>
              <div className="bg-green-300 p-4 rounded"></div>
              <div className="bg-green-400 p-4 rounded"></div>
              <div className="bg-yellow-300 p-4 rounded"></div>
              <div className="bg-yellow-400 p-4 rounded"></div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Current Risks</span>
              </div>
              <div className="text-gray-400">|</div>
              <span>3 risks plotted on matrix</span>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowRiskMatrixDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Team Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Item to Assign</Label>
              <Select value={assignFormAudit} onValueChange={setAssignFormAudit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="audit1">SOC 2 Type II Annual Audit</SelectItem>
                  <SelectItem value="audit2">Q1 Internal Security Review</SelectItem>
                  <SelectItem value="audit3">GDPR Compliance Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {['Sarah Chen', 'Mike Johnson', 'Emma Davis', 'Alex Kim'].map(name => (
                  <div key={name} className="flex items-center gap-3 p-2 border rounded-lg">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={assignFormMembers.includes(name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignFormMembers(prev => [...prev, name])
                        } else {
                          setAssignFormMembers(prev => prev.filter(n => n !== name))
                        }
                      }}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={assignFormRole} onValueChange={setAssignFormRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead Auditor</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (assignFormMembers.length === 0) {
                  toast.error('Please select at least one team member')
                  return
                }
                setAuditAssignments(prev => ({
                  ...prev,
                  [assignFormAudit]: assignFormMembers
                }))
                setShowAssignDialog(false)
                toast.success('Team members assigned', { description: `${assignFormMembers.length} member(s) assigned as ${assignFormRole}` })
                // Reset form
                setAssignFormMembers([])
                setAssignFormRole('reviewer')
              }}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Policy Templates</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">Select a template to start your policy document.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Information Security Policy', category: 'Security', icon: Shield },
                { name: 'Data Privacy Policy', category: 'Privacy', icon: Lock },
                { name: 'Acceptable Use Policy', category: 'IT', icon: FileText },
                { name: 'Incident Response Plan', category: 'Security', icon: AlertTriangle },
                { name: 'Business Continuity Plan', category: 'Operations', icon: RefreshCw },
                { name: 'Access Control Policy', category: 'Security', icon: Key },
              ].map((template, idx) => (
                <div
                  key={idx}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setNewPolicyForm(prev => ({ ...prev, name: template.name, category: template.category }))
                    setShowTemplatesDialog(false)
                    setShowNewPolicyDialog(true)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <template.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-gray-500">{template.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attestation Dialog */}
      <Dialog open={showAttestationDialog} onOpenChange={setShowAttestationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Policy Attestation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Send policy for employee acknowledgement and attestation.
            </p>
            <div className="space-y-2">
              <Label>Select Policy</Label>
              <Select value={attestationFormPolicy} onValueChange={setAttestationFormPolicy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pol1">Information Security Policy v3.2</SelectItem>
                  <SelectItem value="pol2">Data Privacy Policy v2.1</SelectItem>
                  <SelectItem value="pol3">Acceptable Use Policy v4.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Select value={attestationFormRecipients} onValueChange={setAttestationFormRecipients}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees (250)</SelectItem>
                  <SelectItem value="engineering">Engineering Team (45)</SelectItem>
                  <SelectItem value="sales">Sales Team (30)</SelectItem>
                  <SelectItem value="new">New Hires (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={attestationFormDueDate} onChange={(e) => setAttestationFormDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reminder Frequency</Label>
              <Select value={attestationFormFrequency} onValueChange={setAttestationFormFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAttestationDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const recipientCounts: Record<string, number> = { all: 250, engineering: 45, sales: 30, new: 5 }
                const count = recipientCounts[attestationFormRecipients] || 250
                const newAttestation = {
                  policyId: attestationFormPolicy,
                  recipients: attestationFormRecipients,
                  dueDate: attestationFormDueDate,
                  sentAt: new Date().toISOString()
                }
                setAttestationsSent(prev => [...prev, newAttestation])
                setShowAttestationDialog(false)
                toast.success('Attestation request sent', { description: `Sent to ${count} employees` })
                // Reset form
                setAttestationFormPolicy('pol1')
                setAttestationFormRecipients('all')
                setAttestationFormDueDate('')
                setAttestationFormFrequency('weekly')
              }}>
                <Send className="w-4 h-4 mr-2" />
                Send Attestation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Distribute Dialog */}
      <Dialog open={showDistributeDialog} onOpenChange={setShowDistributeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Distribute Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Policy</Label>
              <Select value={distributeFormPolicy} onValueChange={setDistributeFormPolicy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pol1">Information Security Policy v3.2</SelectItem>
                  <SelectItem value="pol2">Data Privacy Policy v2.1</SelectItem>
                  <SelectItem value="pol3">Acceptable Use Policy v4.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Distribution Channels</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dist-email"
                    checked={distributeFormChannels.email}
                    onChange={(e) => setDistributeFormChannels(prev => ({ ...prev, email: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="dist-email" className="text-sm">Email Notification</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dist-slack"
                    checked={distributeFormChannels.slack}
                    onChange={(e) => setDistributeFormChannels(prev => ({ ...prev, slack: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="dist-slack" className="text-sm">Slack Announcement</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dist-portal"
                    checked={distributeFormChannels.portal}
                    onChange={(e) => setDistributeFormChannels(prev => ({ ...prev, portal: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="dist-portal" className="text-sm">Employee Portal</label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={distributeFormAudience} onValueChange={setDistributeFormAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="managers">Managers Only</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDistributeDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const channels = Object.entries(distributeFormChannels).filter(([, v]) => v).map(([k]) => k)
                if (channels.length === 0) {
                  toast.error('Please select at least one distribution channel')
                  return
                }
                const newDistribution = {
                  policyId: distributeFormPolicy,
                  channels,
                  audience: distributeFormAudience,
                  distributedAt: new Date().toISOString()
                }
                setPoliciesDistributed(prev => [...prev, newDistribution])
                setShowDistributeDialog(false)
                const audienceCounts: Record<string, number> = { all: 250, managers: 35, engineering: 45 }
                const count = audienceCounts[distributeFormAudience] || 250
                toast.success('Policy distributed', { description: `Sent to ${count} employees via ${channels.join(', ')}` })
                // Reset form
                setDistributeFormPolicy('pol1')
                setDistributeFormChannels({ email: true, slack: true, portal: true })
                setDistributeFormAudience('all')
              }}>
                <Send className="w-4 h-4 mr-2" />
                Distribute
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Versions Dialog */}
      <Dialog open={showVersionsDialog} onOpenChange={setShowVersionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Policy</Label>
              <Select defaultValue="pol1">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pol1">Information Security Policy</SelectItem>
                  <SelectItem value="pol2">Data Privacy Policy</SelectItem>
                  <SelectItem value="pol3">Acceptable Use Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {[
                { version: '3.2', date: '2024-01-05', author: 'Sarah Chen', status: 'published', changes: 'Updated encryption requirements' },
                { version: '3.1', date: '2023-10-15', author: 'Mike Johnson', status: 'archived', changes: 'Added remote work guidelines' },
                { version: '3.0', date: '2023-07-01', author: 'Sarah Chen', status: 'archived', changes: 'Major revision for SOC 2 compliance' },
                { version: '2.5', date: '2023-01-20', author: 'Emma Davis', status: 'archived', changes: 'GDPR alignment updates' },
              ].map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">v{v.version}</Badge>
                    <div>
                      <p className="text-sm font-medium">{v.changes}</p>
                      <p className="text-xs text-gray-500">{v.author} - {new Date(v.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={v.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {v.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedVersionForView(v); setShowVersionViewDialog(true); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowVersionsDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Details Dialog */}
      <Dialog open={showItemDetailsDialog} onOpenChange={setShowItemDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailItem?.name} Details</DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                    <p className="font-medium capitalize">{detailItem.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium">{detailItem.name}</p>
                  </div>
                </div>
              </div>

              {detailItem.type === 'control' && (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Control Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Status</p>
                        <Badge className="mt-1 bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Tested</p>
                        <p>{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Related Evidence</h4>
                    <p className="text-sm text-gray-500">3 evidence files attached</p>
                  </div>
                </div>
              )}

              {detailItem.type === 'policy' && (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Policy Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Status</p>
                        <Badge className="mt-1 bg-green-100 text-green-700">Published</Badge>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Updated</p>
                        <p>{new Date().toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p>Security</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Acknowledgements</p>
                        <p>245/250 employees</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailItem.type === 'audit' && (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Audit Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Status</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-700">In Progress</Badge>
                      </div>
                      <div>
                        <p className="text-gray-500">Auditor</p>
                        <p>Internal Audit Team</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Findings</p>
                        <p>3 findings (0 critical)</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Progress</p>
                        <Progress value={65} className="h-2 mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDetailsDialog(false)}>Close</Button>
            <Button onClick={() => {
              if (!detailItem) return
              // Perform action based on item type
              if (detailItem.type === 'control') {
                toast.promise(
                  new Promise(resolve => setTimeout(resolve, 1500)),
                  {
                    loading: `Running test on ${detailItem.name}...`,
                    success: `${detailItem.name} test completed - Passed`,
                    error: `Failed to test ${detailItem.name}`
                  }
                )
              } else if (detailItem.type === 'policy') {
                toast.promise(
                  new Promise(resolve => setTimeout(resolve, 1500)),
                  {
                    loading: `Sending ${detailItem.name} for review...`,
                    success: `${detailItem.name} sent for review`,
                    error: `Failed to send ${detailItem.name}`
                  }
                )
              } else if (detailItem.type === 'audit') {
                toast.promise(
                  new Promise(resolve => setTimeout(resolve, 1500)),
                  {
                    loading: `Updating ${detailItem.name} status...`,
                    success: `${detailItem.name} status updated`,
                    error: `Failed to update ${detailItem.name}`
                  }
                )
              } else {
                toast.success(`${detailItem.name} action completed`)
              }
              setShowItemDetailsDialog(false)
            }}>
              Take Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={showEditOrganizationDialog} onOpenChange={setShowEditOrganizationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Organization Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input value={orgFormName} onChange={(e) => setOrgFormName(e.target.value)} placeholder="Enter organization name" />
            </div>
            <div className="space-y-2">
              <Label>Legal Entity Name</Label>
              <Input value={orgFormLegalName} onChange={(e) => setOrgFormLegalName(e.target.value)} placeholder="Enter legal entity name" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={orgFormAddress} onChange={(e) => setOrgFormAddress(e.target.value)} placeholder="Enter address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={orgFormCity} onChange={(e) => setOrgFormCity(e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={orgFormCountry} onValueChange={setOrgFormCountry}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Compliance Contact Email</Label>
              <Input type="email" value={orgFormEmail} onChange={(e) => setOrgFormEmail(e.target.value)} placeholder="Enter email" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditOrganizationDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setOrganizationDetails({
                name: orgFormName,
                legalName: orgFormLegalName,
                address: orgFormAddress,
                city: orgFormCity,
                country: orgFormCountry,
                email: orgFormEmail
              })
              setShowEditOrganizationDialog(false)
              toast.success('Organization details updated', { description: `${orgFormName} saved successfully` })
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Configuration Dialog */}
      <Dialog open={showServiceConfigDialog} onOpenChange={setShowServiceConfigDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedService?.name} Configuration</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">Connected</p>
                  <p className="text-sm text-green-600 dark:text-green-300">Integration is active and syncing</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input type="password" defaultValue="sk-xxxx-xxxx-xxxx-xxxx" readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => {
                    navigator.clipboard.writeText('sk-xxxx-xxxx-xxxx-xxxx')
                    toast.success('API key copied to clipboard')
                  }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sync Frequency</Label>
                <Select value={serviceFormSyncFrequency} onValueChange={setServiceFormSyncFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data to Sync</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Controls</span>
                    <Switch checked={serviceFormSyncControls} onCheckedChange={setServiceFormSyncControls} />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Evidence</span>
                    <Switch checked={serviceFormSyncEvidence} onCheckedChange={setServiceFormSyncEvidence} />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Audit Logs</span>
                    <Switch checked={serviceFormSyncLogs} onCheckedChange={setServiceFormSyncLogs} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                <p className="text-gray-500">Last synced: {new Date().toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => {
              if (selectedService) {
                // Remove service config
                setServiceConfigs(prev => {
                  const updated = { ...prev }
                  delete updated[selectedService.name]
                  return updated
                })
                toast.promise(
                  new Promise(resolve => setTimeout(resolve, 1500)),
                  {
                    loading: `Disconnecting ${selectedService.name}...`,
                    success: `${selectedService.name} disconnected successfully`,
                    error: `Failed to disconnect ${selectedService.name}`
                  }
                )
              }
              setShowServiceConfigDialog(false)
            }}>
              Disconnect
            </Button>
            <Button onClick={() => {
              if (selectedService) {
                setServiceConfigs(prev => ({
                  ...prev,
                  [selectedService.name]: {
                    syncFrequency: serviceFormSyncFrequency,
                    syncControls: serviceFormSyncControls,
                    syncEvidence: serviceFormSyncEvidence,
                    syncLogs: serviceFormSyncLogs
                  }
                }))
                toast.success(`${selectedService.name} settings saved`, { description: `Sync frequency: ${serviceFormSyncFrequency}` })
              }
              setShowServiceConfigDialog(false)
            }}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Policy Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve a policy for publication.
            </p>

            <div className="space-y-2">
              <Label>Select Policy to Approve</Label>
              <Select value={approveFormPolicy} onValueChange={setApproveFormPolicy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pol3">Acceptable Use Policy v4.0 (In Review)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium">Policy Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Current Status</p>
                  <Badge className="mt-1 bg-yellow-100 text-yellow-700">In Review</Badge>
                </div>
                <div>
                  <p className="text-gray-500">Owner</p>
                  <p>Mike Johnson</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p>Jan 10, 2024</p>
                </div>
                <div>
                  <p className="text-gray-500">Version</p>
                  <p>4.0</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Approval Comments (Optional)</Label>
              <textarea
                className="w-full min-h-[80px] p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="Add any comments for the approval..."
                value={approveFormComments}
                onChange={(e) => setApproveFormComments(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notify-owner"
                className="rounded"
                checked={approveFormNotifyOwner}
                onChange={(e) => setApproveFormNotifyOwner(e.target.checked)}
              />
              <label htmlFor="notify-owner" className="text-sm">Notify policy owner of approval</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => {
              setPolicyApprovals(prev => ({
                ...prev,
                [approveFormPolicy]: {
                  status: 'rejected',
                  comments: approveFormComments,
                  date: new Date().toISOString()
                }
              }))
              setShowApproveDialog(false)
              toast.success('Policy returned for revision', { description: approveFormNotifyOwner ? 'Owner notified' : undefined })
              // Reset form
              setApproveFormComments('')
            }}>
              Request Changes
            </Button>
            <Button onClick={() => {
              setPolicyApprovals(prev => ({
                ...prev,
                [approveFormPolicy]: {
                  status: 'approved',
                  comments: approveFormComments,
                  date: new Date().toISOString()
                }
              }))
              setShowApproveDialog(false)
              toast.success('Policy approved and published', { description: approveFormNotifyOwner ? 'Owner notified' : undefined })
              // Reset form
              setApproveFormComments('')
            }}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Policy Settings Dialog */}
      <Dialog open={showPolicySettingsDialog} onOpenChange={setShowPolicySettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPolicyForSettings?.name} Settings</DialogTitle>
          </DialogHeader>
          {selectedPolicyForSettings && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Version</p>
                    <p className="font-medium">v{selectedPolicyForSettings.version}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <Badge className={selectedPolicyForSettings.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {selectedPolicyForSettings.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Distribution Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Auto-distribute on publish</span>
                    <Switch checked={policySettingsAutoDistribute} onCheckedChange={setPolicySettingsAutoDistribute} />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Require acknowledgement</span>
                    <Switch checked={policySettingsRequireAck} onCheckedChange={setPolicySettingsRequireAck} />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Send reminders</span>
                    <Switch checked={policySettingsSendReminders} onCheckedChange={setPolicySettingsSendReminders} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Approval Workflow</Label>
                <Select value={policySettingsApprovalWorkflow} onValueChange={setPolicySettingsApprovalWorkflow}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Approval Required</SelectItem>
                    <SelectItem value="single">Single Approver</SelectItem>
                    <SelectItem value="multi">Multiple Approvers</SelectItem>
                    <SelectItem value="sequential">Sequential Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Review Frequency</Label>
                <Select value={policySettingsReviewFrequency} onValueChange={setPolicySettingsReviewFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">Every 3 Months</SelectItem>
                    <SelectItem value="6months">Every 6 Months</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPolicySettingsDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              if (selectedPolicyForSettings) {
                setPolicySettings(prev => ({
                  ...prev,
                  [selectedPolicyForSettings.id]: {
                    autoDistribute: policySettingsAutoDistribute,
                    requireAck: policySettingsRequireAck,
                    sendReminders: policySettingsSendReminders,
                    approvalWorkflow: policySettingsApprovalWorkflow,
                    reviewFrequency: policySettingsReviewFrequency
                  }
                }))
                toast.success('Policy settings saved', { description: `${selectedPolicyForSettings.name} updated` })
              }
              setShowPolicySettingsDialog(false)
            }}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version View Dialog */}
      <Dialog open={showVersionViewDialog} onOpenChange={setShowVersionViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version {selectedVersionForView?.version} Details</DialogTitle>
          </DialogHeader>
          {selectedVersionForView && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Version</p>
                    <p className="font-medium text-lg">v{selectedVersionForView.version}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Author</p>
                    <p className="font-medium">{selectedVersionForView.author}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium">{new Date(selectedVersionForView.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Change Summary</Label>
                <div className="p-4 border rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">{selectedVersionForView.changes}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Version Content Preview</Label>
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-900 max-h-[200px] overflow-y-auto">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This version includes the following key sections:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Purpose and Scope</li>
                    <li>Policy Statement</li>
                    <li>Roles and Responsibilities</li>
                    <li>Compliance Requirements</li>
                    <li>Enforcement and Violations</li>
                    <li>Review and Revision History</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  <span>Changed {Math.floor((Date.now() - new Date(selectedVersionForView.date).getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionViewDialog(false)}>Close</Button>
            <Button variant="outline" onClick={async () => {
              toast.loading('Preparing download...', { id: 'download-version' })
              try {
                await new Promise(r => setTimeout(r, 1000))
                const blob = new Blob([`Version ${selectedVersionForView?.version} content`], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `policy-v${selectedVersionForView?.version}.txt`
                a.click()
                URL.revokeObjectURL(url)
                toast.success(`Downloaded version ${selectedVersionForView?.version}`, { id: 'download-version' })
              } catch { toast.error('Download failed', { id: 'download-version' }) }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={async () => {
              toast.loading('Restoring version...', { id: 'restore-version' })
              try {
                await new Promise(r => setTimeout(r, 1500))
                toast.success(`Restored to version ${selectedVersionForView?.version}`, { id: 'restore-version' })
                setShowVersionViewDialog(false)
              } catch { toast.error('Restore failed', { id: 'restore-version' }) }
            }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Restore This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
