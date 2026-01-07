'use client'

import { useState, useMemo } from 'react'
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

// Mock data
const mockVulnerabilities: Vulnerability[] = [
  {
    id: '1',
    title: 'Remote Code Execution in Apache Log4j',
    description: 'A critical vulnerability in Apache Log4j library allows remote code execution via crafted log messages.',
    cveId: 'CVE-2021-44228',
    cvssScore: 10.0,
    severity: 'critical',
    status: 'in-progress',
    affectedAsset: 'prod-api-server-01',
    assetType: 'server',
    discoveredAt: '2024-01-15',
    dueDate: '2024-01-20',
    assignee: 'John Smith',
    remediation: 'Upgrade Log4j to version 2.17.0 or later. Apply JVM mitigation flag as temporary fix.',
    exploitAvailable: true,
    patchAvailable: true,
    category: 'Remote Code Execution'
  },
  {
    id: '2',
    title: 'SQL Injection in User Authentication',
    description: 'The login form is vulnerable to SQL injection attacks, potentially allowing unauthorized access.',
    cveId: 'CVE-2024-1234',
    cvssScore: 9.1,
    severity: 'critical',
    status: 'open',
    affectedAsset: 'web-app-portal',
    assetType: 'application',
    discoveredAt: '2024-01-14',
    dueDate: '2024-01-18',
    remediation: 'Use parameterized queries and input validation. Implement WAF rules.',
    exploitAvailable: true,
    patchAvailable: false,
    category: 'Injection'
  },
  {
    id: '3',
    title: 'Outdated SSL/TLS Configuration',
    description: 'Server supports deprecated TLS 1.0 and 1.1 protocols with weak cipher suites.',
    cveId: 'N/A',
    cvssScore: 7.5,
    severity: 'high',
    status: 'open',
    affectedAsset: 'load-balancer-01',
    assetType: 'network',
    discoveredAt: '2024-01-12',
    dueDate: '2024-01-25',
    assignee: 'Sarah Wilson',
    remediation: 'Disable TLS 1.0/1.1, enable only TLS 1.2+ with strong cipher suites.',
    exploitAvailable: false,
    patchAvailable: true,
    category: 'Cryptographic Issues'
  },
  {
    id: '4',
    title: 'Cross-Site Scripting (XSS) in Dashboard',
    description: 'Reflected XSS vulnerability in search functionality allows script injection.',
    cveId: 'CVE-2024-2345',
    cvssScore: 6.1,
    severity: 'medium',
    status: 'resolved',
    affectedAsset: 'admin-dashboard',
    assetType: 'application',
    discoveredAt: '2024-01-10',
    dueDate: '2024-01-20',
    assignee: 'Mike Chen',
    remediation: 'Implement proper output encoding and Content Security Policy headers.',
    exploitAvailable: true,
    patchAvailable: true,
    category: 'Cross-Site Scripting'
  },
  {
    id: '5',
    title: 'Sensitive Data Exposure in API Response',
    description: 'API endpoints expose sensitive user data including email addresses in responses.',
    cveId: 'N/A',
    cvssScore: 5.3,
    severity: 'medium',
    status: 'open',
    affectedAsset: 'api-gateway',
    assetType: 'application',
    discoveredAt: '2024-01-08',
    dueDate: '2024-01-30',
    remediation: 'Filter sensitive fields from API responses. Implement proper data masking.',
    exploitAvailable: false,
    patchAvailable: false,
    category: 'Sensitive Data Exposure'
  },
  {
    id: '6',
    title: 'Missing Security Headers',
    description: 'Application lacks security headers like X-Frame-Options, X-Content-Type-Options.',
    cveId: 'N/A',
    cvssScore: 4.3,
    severity: 'low',
    status: 'open',
    affectedAsset: 'web-app-portal',
    assetType: 'application',
    discoveredAt: '2024-01-05',
    dueDate: '2024-02-01',
    remediation: 'Configure web server to include required security headers.',
    exploitAvailable: false,
    patchAvailable: true,
    category: 'Security Misconfiguration'
  }
]

const mockAudits: SecurityAudit[] = [
  {
    id: '1',
    name: 'Q1 2024 Vulnerability Assessment',
    auditCode: 'SEC-2024-001',
    description: 'Comprehensive vulnerability scan of all production systems',
    type: 'vulnerability-scan',
    status: 'passed',
    severity: 'high',
    scheduledAt: '2024-01-15',
    startedAt: '2024-01-15T09:00:00',
    completedAt: '2024-01-15T18:00:00',
    duration: 32400,
    scope: ['Production Servers', 'Databases', 'API Gateway'],
    findings: { critical: 2, high: 5, medium: 12, low: 28, info: 45 },
    compliance: ['SOC2', 'ISO27001'],
    securityScore: 82,
    passRate: 94,
    auditor: 'Security Team',
    assets: 156,
    progress: 100
  },
  {
    id: '2',
    name: 'SOC2 Type II Audit',
    auditCode: 'SEC-2024-002',
    description: 'Annual SOC2 compliance audit for enterprise customers',
    type: 'compliance',
    status: 'in-progress',
    severity: 'medium',
    scheduledAt: '2024-01-10',
    startedAt: '2024-01-10T10:00:00',
    scope: ['All Systems', 'Policies', 'Access Controls'],
    findings: { critical: 0, high: 2, medium: 8, low: 15, info: 22 },
    compliance: ['SOC2'],
    securityScore: 88,
    passRate: 91,
    auditor: 'External Auditor - Deloitte',
    assets: 234,
    progress: 65
  },
  {
    id: '3',
    name: 'Web Application Penetration Test',
    auditCode: 'SEC-2024-003',
    description: 'External penetration test of customer-facing web applications',
    type: 'penetration-test',
    status: 'scheduled',
    severity: 'high',
    scheduledAt: '2024-02-01',
    scope: ['Web Portal', 'API Endpoints', 'Mobile API'],
    findings: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    compliance: ['PCI-DSS'],
    securityScore: 0,
    passRate: 0,
    auditor: 'CrowdStrike Red Team',
    assets: 45,
    progress: 0
  },
  {
    id: '4',
    name: 'Cloud Infrastructure Security Review',
    auditCode: 'SEC-2024-004',
    description: 'Security assessment of AWS and Azure cloud environments',
    type: 'cloud-security',
    status: 'warning',
    severity: 'medium',
    scheduledAt: '2024-01-08',
    startedAt: '2024-01-08T14:00:00',
    completedAt: '2024-01-10T16:00:00',
    duration: 180000,
    scope: ['AWS Production', 'Azure DR', 'IAM Policies'],
    findings: { critical: 1, high: 8, medium: 15, low: 23, info: 34 },
    compliance: ['CIS', 'NIST'],
    securityScore: 75,
    passRate: 82,
    auditor: 'Cloud Security Team',
    assets: 89,
    progress: 100
  }
]

const mockAssets: Asset[] = [
  { id: '1', name: 'prod-api-server-01', type: 'server', ip: '10.0.1.15', hostname: 'api01.prod.internal', os: 'Ubuntu 22.04', status: 'online', riskScore: 85, vulnerabilities: 12, lastScanned: '2024-01-15', owner: 'DevOps', criticality: 'critical', tags: ['production', 'api'] },
  { id: '2', name: 'prod-db-primary', type: 'database', ip: '10.0.2.10', hostname: 'db01.prod.internal', os: 'PostgreSQL 15', status: 'online', riskScore: 72, vulnerabilities: 5, lastScanned: '2024-01-14', owner: 'DBA Team', criticality: 'critical', tags: ['production', 'database'] },
  { id: '3', name: 'web-app-portal', type: 'application', ip: 'N/A', hostname: 'portal.company.com', status: 'online', riskScore: 68, vulnerabilities: 8, lastScanned: '2024-01-15', owner: 'Engineering', criticality: 'high', tags: ['production', 'web'] },
  { id: '4', name: 'aws-eks-cluster', type: 'container', ip: 'N/A', hostname: 'eks.us-east-1', status: 'online', riskScore: 45, vulnerabilities: 3, lastScanned: '2024-01-13', owner: 'Platform', criticality: 'high', tags: ['production', 'kubernetes'] },
  { id: '5', name: 'corp-vpn-gateway', type: 'network', ip: '203.0.113.50', hostname: 'vpn.company.com', status: 'online', riskScore: 35, vulnerabilities: 2, lastScanned: '2024-01-12', owner: 'IT Security', criticality: 'medium', tags: ['infrastructure', 'vpn'] }
]

const mockControls: ComplianceControl[] = [
  { id: '1', controlId: 'CC1.1', framework: 'SOC2', title: 'Control Environment', description: 'COSO Principle 1: Demonstrates commitment to integrity and ethical values', status: 'compliant', evidence: 'Code of conduct reviewed annually', lastAssessed: '2024-01-10', owner: 'HR' },
  { id: '2', controlId: 'CC2.1', framework: 'SOC2', title: 'Communication and Information', description: 'Internal communication of objectives', status: 'compliant', evidence: 'Monthly security newsletters', lastAssessed: '2024-01-10', owner: 'Security' },
  { id: '3', controlId: 'A.5.1', framework: 'ISO27001', title: 'Information Security Policies', description: 'Policies for information security', status: 'partial', evidence: 'Policy review in progress', lastAssessed: '2024-01-08', owner: 'CISO' },
  { id: '4', controlId: 'Art. 5', framework: 'GDPR', title: 'Principles of Processing', description: 'Lawfulness, fairness and transparency', status: 'compliant', evidence: 'Privacy policy updated', lastAssessed: '2024-01-05', owner: 'Legal' },
  { id: '5', controlId: '164.308(a)', framework: 'HIPAA', title: 'Administrative Safeguards', description: 'Security management process', status: 'non-compliant', evidence: 'Risk assessment overdue', lastAssessed: '2024-01-02', owner: 'Compliance' }
]

const complianceFrameworks = [
  { id: 'SOC2', name: 'SOC 2 Type II', score: 94, controls: 89, passed: 84, icon: ShieldCheck },
  { id: 'ISO27001', name: 'ISO 27001', score: 88, controls: 114, passed: 100, icon: Shield },
  { id: 'GDPR', name: 'GDPR', score: 92, controls: 42, passed: 39, icon: Lock },
  { id: 'HIPAA', name: 'HIPAA', score: 78, controls: 54, passed: 42, icon: FileCheck },
  { id: 'PCI-DSS', name: 'PCI-DSS', score: 85, controls: 78, passed: 66, icon: CreditCard },
  { id: 'NIST', name: 'NIST CSF', score: 81, controls: 98, passed: 79, icon: Building2 }
]

// Enhanced Competitive Upgrade Mock Data - Security Audit Context
const mockSecurityAIInsights = [
  { id: '1', type: 'warning' as const, title: 'Critical Vulnerabilities', description: '3 critical CVEs detected in production. Immediate patching recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Vulnerabilities' },
  { id: '2', type: 'success' as const, title: 'Compliance Improved', description: 'SOC 2 compliance score increased to 94%. Great progress!', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Compliance' },
  { id: '3', type: 'info' as const, title: 'Scan Scheduled', description: 'Weekly vulnerability scan scheduled for Sunday 2 AM UTC.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Scans' },
]

const mockSecurityCollaborators = [
  { id: '1', name: 'Alex Security', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Security Lead', lastActive: 'Now' },
  { id: '2', name: 'Jordan Dev', avatar: '/avatars/jordan.jpg', status: 'online' as const, role: 'DevSecOps', lastActive: '5m ago' },
  { id: '3', name: 'Sam Analyst', avatar: '/avatars/sam.jpg', status: 'away' as const, role: 'SOC Analyst', lastActive: '20m ago' },
]

const mockSecurityPredictions = [
  { id: '1', label: 'Security Score', current: 87, target: 95, predicted: 91, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'Vulnerabilities', current: 12, target: 5, predicted: 8, confidence: 75, trend: 'down' as const },
  { id: '3', label: 'Compliance Rate', current: 89, target: 98, predicted: 94, confidence: 80, trend: 'up' as const },
]

const mockSecurityActivities = [
  { id: '1', user: 'Alex Security', action: 'completed', target: 'penetration test', timestamp: '15m ago', type: 'success' as const },
  { id: '2', user: 'Jordan Dev', action: 'patched', target: 'CVE-2024-1234', timestamp: '30m ago', type: 'success' as const },
  { id: '3', user: 'Sam Analyst', action: 'flagged', target: 'suspicious login attempt', timestamp: '1h ago', type: 'warning' as const },
]

// Quick actions config - handlers set in component
const mockSecurityQuickActionsConfig = [
  { id: '1', label: 'Run Scan', icon: 'Scan', shortcut: 'S' },
  { id: '2', label: 'View Alerts', icon: 'AlertTriangle', shortcut: 'A' },
  { id: '3', label: 'Compliance Report', icon: 'FileText', shortcut: 'R' },
  { id: '4', label: 'Settings', icon: 'Settings', shortcut: 'T' },
]

export default function SecurityAuditClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all')
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null)
  const [selectedAudit, setSelectedAudit] = useState<SecurityAudit | null>(null)
  const [showScanDialog, setShowScanDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Compute stats
  const vulnerabilityStats = useMemo(() => {
    const total = mockVulnerabilities.length
    const critical = mockVulnerabilities.filter(v => v.severity === 'critical').length
    const high = mockVulnerabilities.filter(v => v.severity === 'high').length
    const medium = mockVulnerabilities.filter(v => v.severity === 'medium').length
    const low = mockVulnerabilities.filter(v => v.severity === 'low').length
    const open = mockVulnerabilities.filter(v => v.status === 'open').length
    const resolved = mockVulnerabilities.filter(v => v.status === 'resolved').length
    return { total, critical, high, medium, low, open, resolved }
  }, [])

  // Filter vulnerabilities
  const filteredVulnerabilities = useMemo(() => {
    return mockVulnerabilities.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           v.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           v.affectedAsset.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSeverity = selectedSeverity === 'all' || v.severity === selectedSeverity
      return matchesSearch && matchesSeverity
    })
  }, [searchQuery, selectedSeverity])

  // Stats cards
  const stats = [
    { label: 'Security Score', value: '82%', change: '+5%', icon: Shield, color: 'from-blue-500 to-blue-600' },
    { label: 'Open Vulnerabilities', value: vulnerabilityStats.open.toString(), change: '-12', icon: Bug, color: 'from-red-500 to-red-600' },
    { label: 'Critical/High', value: (vulnerabilityStats.critical + vulnerabilityStats.high).toString(), change: '-3', icon: AlertTriangle, color: 'from-amber-500 to-amber-600' },
    { label: 'Assets Scanned', value: '156', change: '+23', icon: Server, color: 'from-green-500 to-green-600' },
    { label: 'Compliance Rate', value: '89%', change: '+2%', icon: FileCheck, color: 'from-purple-500 to-purple-600' },
    { label: 'MTTR', value: '4.2d', change: '-0.8d', icon: Clock, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Active Scans', value: '3', change: '', icon: Radar, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Resolved (30d)', value: '47', change: '+15', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' }
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
  const handleStartScan = () => {
    toast.info('Scan started', {
      description: 'Security scan is running...'
    })
  }

  const handleResolveVulnerability = (vuln: Vulnerability) => {
    toast.success('Marked as resolved', {
      description: `"${vuln.title}" has been marked as resolved`
    })
  }

  const handleExportAudit = () => {
    toast.success('Export started', {
      description: 'Audit report is being exported'
    })
  }

  const handleCreateTicket = (vuln: Vulnerability) => {
    toast.success('Ticket created', {
      description: `Ticket created for "${vuln.title}"`
    })
  }

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
            <Button variant="outline">
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
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                    <Download className="w-4 h-4 mr-2" />Export Report
                  </Button>
                  <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => setShowScanDialog(true)}>
                    <Scan className="w-4 h-4 mr-2" />New Scan
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
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
            <div className="grid grid-cols-6 gap-4">
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
                  <div className="grid grid-cols-4 gap-4 mb-6">
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
                    {mockVulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').slice(0, 3).map(vuln => (
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
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAudits.slice(0, 3).map(audit => (
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
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAssets.filter(a => a.riskScore > 60).map(asset => {
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
                  <div className="grid grid-cols-3 gap-3">
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
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button>
                  <Button className="bg-white text-red-600 hover:bg-red-50" onClick={() => setShowScanDialog(true)}>
                    <Scan className="w-4 h-4 mr-2" />Scan Now
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
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
                    <Button variant="outline" size="sm">
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
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                    <Calendar className="w-4 h-4 mr-2" />Schedule
                  </Button>
                  <Button className="bg-white text-purple-600 hover:bg-purple-50">
                    <Plus className="w-4 h-4 mr-2" />New Audit
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockAudits.length}</div>
                  <div className="text-sm text-purple-100">Total Audits</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockAudits.filter(a => a.status === 'passed').length}</div>
                  <div className="text-sm text-purple-100">Passed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockAudits.filter(a => a.status === 'in-progress').length}</div>
                  <div className="text-sm text-purple-100">In Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockAudits.filter(a => a.status === 'scheduled').length}</div>
                  <div className="text-sm text-purple-100">Scheduled</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-sm text-purple-100">Avg Score</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {mockAudits.map(audit => (
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

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
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
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                    <Scan className="w-4 h-4 mr-2" />Discover
                  </Button>
                  <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
                    <Plus className="w-4 h-4 mr-2" />Add Asset
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockAssets.length}</div>
                  <div className="text-sm text-emerald-100">Total Assets</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockAssets.filter(a => a.status === 'online').length}</div>
                  <div className="text-sm text-emerald-100">Online</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockAssets.filter(a => a.criticality === 'critical').length}</div>
                  <div className="text-sm text-emerald-100">Critical</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockAssets.reduce((sum, a) => sum + a.vulnerabilities, 0)}</div>
                  <div className="text-sm text-emerald-100">Vulnerabilities</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockAssets.filter(a => a.riskScore > 60).length}</div>
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
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockAssets.map(asset => {
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

                        <Button variant="ghost" size="icon">
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
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                    <Download className="w-4 h-4 mr-2" />Reports
                  </Button>
                  <Button className="bg-white text-amber-600 hover:bg-amber-50">
                    <RefreshCw className="w-4 h-4 mr-2" />Assess
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
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

            <div className="grid grid-cols-3 gap-6 mb-6">
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
                  {mockControls.map(control => (
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
                      <div className="grid grid-cols-2 gap-6">
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
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
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
            <AIInsightsPanel
              insights={mockSecurityAIInsights}
              title="Security Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockSecurityCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockSecurityPredictions}
              title="Security Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockSecurityActivities}
            title="Security Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockSecurityQuickActionsConfig.map(action => ({
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

                  <div className="grid grid-cols-2 gap-4">
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
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Play className="h-4 w-4 mr-2" />
                      Start Remediation
                    </Button>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                    <Button variant="outline">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                    <Button variant="ghost" className="ml-auto">
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
              <div className="grid grid-cols-2 gap-4">
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
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Play className="h-4 w-4 mr-2" />
                  Start Scan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
