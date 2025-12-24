'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ShieldCheck, FileCheck, AlertTriangle, CheckCircle2, XCircle, Clock, Plus,
  Search, Filter, MoreHorizontal, Eye, Upload, Download, Calendar, Users,
  FileText, AlertCircle, TrendingUp, TrendingDown, Target, Clipboard,
  Settings, History, ExternalLink, Lock, Unlock, BarChart3, PieChart,
  ClipboardCheck, ClipboardList, FileWarning, Scale, Building, Globe,
  Shield, Zap, RefreshCw, ChevronRight, X, Check, ArrowRight
} from 'lucide-react'

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

export default function ComplianceClient() {
  const [activeTab, setActiveTab] = useState('frameworks')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null)
  const [selectedControl, setSelectedControl] = useState<Control | null>(null)
  const [showControlDialog, setShowControlDialog] = useState(false)
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false)

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
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-white text-green-600 hover:bg-green-50">
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
          </TabsList>

          {/* Frameworks Tab */}
          <TabsContent value="frameworks" className="space-y-4">
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

                  <Button variant="outline" className="w-full mt-4">
                    <Eye className="w-4 h-4 mr-2" />
                    View Controls
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search controls..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
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
                        <Button variant="ghost" size="icon">
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Risk Register</h2>
              <Button>
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
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Audits Tab */}
          <TabsContent value="audits" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Audit Management</h2>
              <Button>
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
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Policy Management</h2>
              <Button>
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
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Evidence Repository</h2>
              <Button>
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
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
    </div>
  )
}
