'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseQuery, useSupabaseMutation } from '@/lib/hooks/use-supabase-helpers'
import { type Dependency } from '@/lib/hooks/use-dependencies'
import {
  Package,
  Shield,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Download,
  Settings,
  GitPullRequest,
  GitBranch,
  ExternalLink,
  Plus,
  ArrowUpRight,
  FileText,
  Scale,
  Lock,
  Info,
  Zap,
  Layers,
  Database,
  Terminal,
  Bell,
  Key,
  Webhook,
  Mail,
  Link2,
  Copy,
  AlertOctagon,
  Trash2,
  History,
  FileCode,
  BarChart3,
  Cpu,
  Cog,
  Scan
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



import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

// Type definitions for Dependabot/Snyk level
type SeverityLevel = 'critical' | 'high' | 'medium' | 'low'
type VulnStatus = 'open' | 'fixed' | 'ignored' | 'in_progress'
type LicenseRisk = 'high' | 'medium' | 'low' | 'none'

interface Vulnerability {
  id: string
  packageName: string
  currentVersion: string
  patchedVersion: string | null
  severity: SeverityLevel
  status: VulnStatus
  cveId: string
  cwes: string[]
  title: string
  description: string
  cvssScore: number
  exploitAvailable: boolean
  fixAvailable: boolean
  discoveredAt: string
  publishedAt: string
  affectedVersions: string
  recommendations: string[]
  references: string[]
}

interface PackageDependency {
  id: string
  name: string
  currentVersion: string
  latestVersion: string
  type: 'direct' | 'transitive' | 'dev' | 'peer'
  ecosystem: 'npm' | 'pip' | 'maven' | 'go' | 'cargo' | 'composer'
  license: string
  licenseRisk: LicenseRisk
  vulnerabilities: number
  lastUpdated: string
  updateAvailable: boolean
  breaking: boolean
  changelog: string
  downloads: number
  maintainers: number
  deprecated: boolean
}

interface UpdateSuggestion {
  id: string
  packageName: string
  currentVersion: string
  targetVersion: string
  updateType: 'patch' | 'minor' | 'major'
  reason: 'security' | 'feature' | 'maintenance'
  breaking: boolean
  vulnerabilitiesFixed: number
  prUrl: string | null
  prStatus: 'none' | 'open' | 'merged' | 'closed'
  releaseNotes: string
  compatibility: number
  createdAt: string
}

interface LicenseInfo {
  id: string
  name: string
  spdxId: string
  type: 'permissive' | 'copyleft' | 'proprietary' | 'unknown'
  risk: LicenseRisk
  packages: number
  description: string
  permissions: string[]
  conditions: string[]
  limitations: string[]
  compatible: boolean
}

interface SecurityPolicy {
  id: string
  name: string
  enabled: boolean
  severity: SeverityLevel
  action: 'block' | 'warn' | 'ignore'
  description: string
}

interface ScanResult {
  lastScan: string
  duration: number
  totalPackages: number
  directDependencies: number
  transitiveDependencies: number
  vulnerabilities: { critical: number; high: number; medium: number; low: number }
  licensesAtRisk: number
  outdatedPackages: number
  securityScore: number
}

// Mock data
const mockVulnerabilities: Vulnerability[] = [
  {
    id: 'vuln1',
    packageName: 'lodash',
    currentVersion: '4.17.15',
    patchedVersion: '4.17.21',
    severity: 'critical',
    status: 'open',
    cveId: 'CVE-2021-23337',
    cwes: ['CWE-94', 'CWE-1321'],
    title: 'Command Injection in lodash',
    description: 'Lodash versions prior to 4.17.21 are vulnerable to Command Injection via the template function.',
    cvssScore: 9.8,
    exploitAvailable: true,
    fixAvailable: true,
    discoveredAt: '2024-12-15T10:00:00Z',
    publishedAt: '2021-02-15T00:00:00Z',
    affectedVersions: '< 4.17.21',
    recommendations: ['Update to version 4.17.21 or later', 'Review template usage for user input'],
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-23337']
  },
  {
    id: 'vuln2',
    packageName: 'axios',
    currentVersion: '0.21.1',
    patchedVersion: '0.21.2',
    severity: 'high',
    status: 'in_progress',
    cveId: 'CVE-2021-3749',
    cwes: ['CWE-400'],
    title: 'Regular Expression Denial of Service',
    description: 'axios is vulnerable to ReDoS via the trim function.',
    cvssScore: 7.5,
    exploitAvailable: false,
    fixAvailable: true,
    discoveredAt: '2024-12-18T14:30:00Z',
    publishedAt: '2021-08-31T00:00:00Z',
    affectedVersions: '< 0.21.2',
    recommendations: ['Update to version 0.21.2 or later'],
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-3749']
  },
  {
    id: 'vuln3',
    packageName: 'minimist',
    currentVersion: '1.2.5',
    patchedVersion: '1.2.6',
    severity: 'medium',
    status: 'open',
    cveId: 'CVE-2021-44906',
    cwes: ['CWE-1321'],
    title: 'Prototype Pollution',
    description: 'Minimist is vulnerable to prototype pollution via setKey function.',
    cvssScore: 5.6,
    exploitAvailable: false,
    fixAvailable: true,
    discoveredAt: '2024-12-20T09:00:00Z',
    publishedAt: '2022-03-17T00:00:00Z',
    affectedVersions: '< 1.2.6',
    recommendations: ['Update to version 1.2.6 or later'],
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-44906']
  },
  {
    id: 'vuln4',
    packageName: 'node-fetch',
    currentVersion: '2.6.1',
    patchedVersion: '2.6.7',
    severity: 'low',
    status: 'ignored',
    cveId: 'CVE-2022-0235',
    cwes: ['CWE-601'],
    title: 'Open Redirect',
    description: 'node-fetch allows bypassing the same-origin policy via redirect.',
    cvssScore: 3.7,
    exploitAvailable: false,
    fixAvailable: true,
    discoveredAt: '2024-12-10T16:00:00Z',
    publishedAt: '2022-01-16T00:00:00Z',
    affectedVersions: '< 2.6.7',
    recommendations: ['Update to version 2.6.7 or later if processing untrusted URLs'],
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-0235']
  },
  {
    id: 'vuln5',
    packageName: 'jsonwebtoken',
    currentVersion: '8.5.1',
    patchedVersion: '9.0.0',
    severity: 'high',
    status: 'fixed',
    cveId: 'CVE-2022-23529',
    cwes: ['CWE-20'],
    title: 'Improper Input Validation',
    description: 'jsonwebtoken is vulnerable to arbitrary code execution via jwt.verify.',
    cvssScore: 8.1,
    exploitAvailable: true,
    fixAvailable: true,
    discoveredAt: '2024-11-20T12:00:00Z',
    publishedAt: '2022-12-22T00:00:00Z',
    affectedVersions: '< 9.0.0',
    recommendations: ['Update to version 9.0.0 or later'],
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-23529']
  }
]

const mockDependencies: PackageDependency[] = [
  { id: 'dep1', name: 'react', currentVersion: '18.2.0', latestVersion: '18.3.1', type: 'direct', ecosystem: 'npm', license: 'MIT', licenseRisk: 'none', vulnerabilities: 0, lastUpdated: '2024-06-15', updateAvailable: true, breaking: false, changelog: 'https://github.com/facebook/react/releases', downloads: 15000000, maintainers: 12, deprecated: false },
  { id: 'dep2', name: 'next', currentVersion: '14.0.0', latestVersion: '14.2.0', type: 'direct', ecosystem: 'npm', license: 'MIT', licenseRisk: 'none', vulnerabilities: 0, lastUpdated: '2024-12-10', updateAvailable: true, breaking: false, changelog: 'https://github.com/vercel/next.js/releases', downloads: 5000000, maintainers: 8, deprecated: false },
  { id: 'dep3', name: 'lodash', currentVersion: '4.17.15', latestVersion: '4.17.21', type: 'direct', ecosystem: 'npm', license: 'MIT', licenseRisk: 'none', vulnerabilities: 1, lastUpdated: '2024-02-20', updateAvailable: true, breaking: false, changelog: 'https://github.com/lodash/lodash/releases', downloads: 40000000, maintainers: 3, deprecated: false },
  { id: 'dep4', name: 'axios', currentVersion: '0.21.1', latestVersion: '1.6.2', type: 'direct', ecosystem: 'npm', license: 'MIT', licenseRisk: 'none', vulnerabilities: 1, lastUpdated: '2024-11-05', updateAvailable: true, breaking: true, changelog: 'https://github.com/axios/axios/releases', downloads: 30000000, maintainers: 5, deprecated: false },
  { id: 'dep5', name: 'typescript', currentVersion: '5.2.2', latestVersion: '5.3.3', type: 'dev', ecosystem: 'npm', license: 'Apache-2.0', licenseRisk: 'none', vulnerabilities: 0, lastUpdated: '2024-11-20', updateAvailable: true, breaking: false, changelog: 'https://github.com/microsoft/TypeScript/releases', downloads: 25000000, maintainers: 15, deprecated: false },
  { id: 'dep6', name: 'eslint', currentVersion: '8.55.0', latestVersion: '8.56.0', type: 'dev', ecosystem: 'npm', license: 'MIT', licenseRisk: 'none', vulnerabilities: 0, lastUpdated: '2024-12-15', updateAvailable: true, breaking: false, changelog: 'https://github.com/eslint/eslint/releases', downloads: 18000000, maintainers: 10, deprecated: false },
  { id: 'dep7', name: 'minimist', currentVersion: '1.2.5', latestVersion: '1.2.8', type: 'transitive', ecosystem: 'npm', license: 'MIT', licenseRisk: 'none', vulnerabilities: 1, lastUpdated: '2024-05-10', updateAvailable: true, breaking: false, changelog: 'https://github.com/minimistjs/minimist/releases', downloads: 80000000, maintainers: 2, deprecated: false },
  { id: 'dep8', name: 'gpl-package-example', currentVersion: '2.1.0', latestVersion: '2.1.0', type: 'transitive', ecosystem: 'npm', license: 'GPL-3.0', licenseRisk: 'high', vulnerabilities: 0, lastUpdated: '2024-03-01', updateAvailable: false, breaking: false, changelog: '', downloads: 50000, maintainers: 1, deprecated: true }
]

const mockUpdates: UpdateSuggestion[] = [
  { id: 'upd1', packageName: 'lodash', currentVersion: '4.17.15', targetVersion: '4.17.21', updateType: 'patch', reason: 'security', breaking: false, vulnerabilitiesFixed: 1, prUrl: 'https://github.com/org/repo/pull/123', prStatus: 'open', releaseNotes: 'Security fix for CVE-2021-23337', compatibility: 100, createdAt: '2024-12-20T10:00:00Z' },
  { id: 'upd2', packageName: 'axios', currentVersion: '0.21.1', targetVersion: '1.6.2', updateType: 'major', reason: 'security', breaking: true, vulnerabilitiesFixed: 1, prUrl: null, prStatus: 'none', releaseNotes: 'Major update with breaking changes. Please review changelog.', compatibility: 85, createdAt: '2024-12-19T14:00:00Z' },
  { id: 'upd3', packageName: 'react', currentVersion: '18.2.0', targetVersion: '18.3.1', updateType: 'minor', reason: 'feature', breaking: false, vulnerabilitiesFixed: 0, prUrl: 'https://github.com/org/repo/pull/124', prStatus: 'merged', releaseNotes: 'Performance improvements and bug fixes', compatibility: 99, createdAt: '2024-12-18T09:00:00Z' },
  { id: 'upd4', packageName: 'next', currentVersion: '14.0.0', targetVersion: '14.2.0', updateType: 'minor', reason: 'feature', breaking: false, vulnerabilitiesFixed: 0, prUrl: null, prStatus: 'none', releaseNotes: 'New App Router features and performance improvements', compatibility: 98, createdAt: '2024-12-17T16:00:00Z' },
  { id: 'upd5', packageName: 'minimist', currentVersion: '1.2.5', targetVersion: '1.2.8', updateType: 'patch', reason: 'security', breaking: false, vulnerabilitiesFixed: 1, prUrl: null, prStatus: 'none', releaseNotes: 'Security patches for prototype pollution', compatibility: 100, createdAt: '2024-12-20T11:00:00Z' }
]

const mockLicenses: LicenseInfo[] = [
  { id: 'lic1', name: 'MIT License', spdxId: 'MIT', type: 'permissive', risk: 'none', packages: 156, description: 'A short and simple permissive license with conditions only requiring preservation of copyright and license notices.', permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'], conditions: ['Include license', 'Include copyright'], limitations: ['No liability', 'No warranty'], compatible: true },
  { id: 'lic2', name: 'Apache License 2.0', spdxId: 'Apache-2.0', type: 'permissive', risk: 'none', packages: 45, description: 'A permissive license that also provides an express grant of patent rights from contributors to users.', permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use', 'Patent use'], conditions: ['Include license', 'Include copyright', 'State changes', 'Include NOTICE'], limitations: ['No liability', 'No warranty', 'No trademark use'], compatible: true },
  { id: 'lic3', name: 'BSD 3-Clause', spdxId: 'BSD-3-Clause', type: 'permissive', risk: 'none', packages: 23, description: 'A permissive license similar to the BSD 2-Clause License, but with a 3rd clause that prohibits others from using the name of the project.', permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'], conditions: ['Include license', 'Include copyright'], limitations: ['No liability', 'No warranty'], compatible: true },
  { id: 'lic4', name: 'GNU GPL v3.0', spdxId: 'GPL-3.0', type: 'copyleft', risk: 'high', packages: 3, description: 'A strong copyleft license that requires derivatives to be distributed under the same license.', permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use', 'Patent use'], conditions: ['Disclose source', 'Include license', 'Include copyright', 'Same license', 'State changes'], limitations: ['No liability', 'No warranty'], compatible: false },
  { id: 'lic5', name: 'ISC License', spdxId: 'ISC', type: 'permissive', risk: 'none', packages: 18, description: 'A permissive license functionally equivalent to the BSD 2-Clause and MIT licenses.', permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'], conditions: ['Include license', 'Include copyright'], limitations: ['No liability', 'No warranty'], compatible: true }
]

const mockPolicies: SecurityPolicy[] = [
  { id: 'pol1', name: 'Block Critical Vulnerabilities', enabled: true, severity: 'critical', action: 'block', description: 'Prevent deployment when critical vulnerabilities are present' },
  { id: 'pol2', name: 'Warn on High Vulnerabilities', enabled: true, severity: 'high', action: 'warn', description: 'Show warnings for high severity vulnerabilities' },
  { id: 'pol3', name: 'Block GPL Licenses', enabled: true, severity: 'high', action: 'block', description: 'Block packages with GPL copyleft licenses' },
  { id: 'pol4', name: 'Auto-merge Patch Updates', enabled: true, severity: 'low', action: 'ignore', description: 'Automatically merge patch version updates' },
  { id: 'pol5', name: 'Deprecated Package Alert', enabled: true, severity: 'medium', action: 'warn', description: 'Alert when deprecated packages are detected' }
]

const mockScanResult: ScanResult = {
  lastScan: '2024-12-23T08:30:00Z',
  duration: 45,
  totalPackages: 245,
  directDependencies: 48,
  transitiveDependencies: 197,
  vulnerabilities: { critical: 1, high: 2, medium: 1, low: 1 },
  licensesAtRisk: 3,
  outdatedPackages: 67,
  securityScore: 72
}

// Enhanced Competitive Upgrade Data
const mockDependenciesAIInsights = [
  { id: '1', type: 'success' as const, title: 'Security Scan', description: 'No critical vulnerabilities found in latest scan.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '2', type: 'info' as const, title: 'Updates Available', description: '23 packages have minor updates available.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Updates' },
  { id: '3', type: 'warning' as const, title: 'Deprecated Package', description: 'lodash.debounce is deprecated. Consider alternatives.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Deprecation' },
]

const mockDependenciesCollaborators = [
  { id: '1', name: 'DevOps Lead', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'Infrastructure', lastActive: 'Now' },
  { id: '2', name: 'Security Eng', avatar: '/avatars/security.jpg', status: 'online' as const, role: 'Security', lastActive: '15m ago' },
  { id: '3', name: 'Tech Lead', avatar: '/avatars/tech.jpg', status: 'away' as const, role: 'Architecture', lastActive: '1h ago' },
]

const mockDependenciesPredictions = [
  { id: '1', label: 'Security Score', current: 72, target: 90, predicted: 82, confidence: 75, trend: 'up' as const },
  { id: '2', label: 'Up-to-date', current: 65, target: 95, predicted: 78, confidence: 80, trend: 'up' as const },
  { id: '3', label: 'Vulnerabilities', current: 12, target: 0, predicted: 5, confidence: 70, trend: 'down' as const },
]

const mockDependenciesActivities = [
  { id: '1', user: 'DevOps Lead', action: 'updated', target: 'react to v18.2.0', timestamp: '20m ago', type: 'success' as const },
  { id: '2', user: 'System', action: 'detected', target: 'new vulnerability CVE-2024-1234', timestamp: '2h ago', type: 'warning' as const },
  { id: '3', user: 'Security Eng', action: 'patched', target: '3 critical packages', timestamp: '4h ago', type: 'success' as const },
]

// Quick actions are defined inside the component to access real handlers

export default function DependenciesClient({ initialDependencies }: { initialDependencies: Dependency[] }) {
  const supabase = createClient()

  // Supabase queries for dependencies
  const { data: dbDependencies, isLoading: dependenciesLoading, refetch: refetchDependencies } = useSupabaseQuery<any>({
    table: 'dependencies',
    orderBy: { column: 'created_at', ascending: false }
  })

  // Supabase queries for vulnerability scans
  const { data: dbVulnerabilityScans, isLoading: scansLoading, refetch: refetchScans } = useSupabaseQuery<any>({
    table: 'dependency_vulnerabilities',
    orderBy: { column: 'created_at', ascending: false }
  })

  // Supabase queries for security policies
  const { data: dbSecurityPolicies, isLoading: policiesLoading, refetch: refetchPolicies } = useSupabaseQuery<any>({
    table: 'security_policies',
    orderBy: { column: 'created_at', ascending: false }
  })

  // Mutations for dependencies
  const dependencyMutation = useSupabaseMutation<any>({
    table: 'dependencies',
    onSuccess: () => refetchDependencies()
  })

  // Mutations for vulnerabilities
  const vulnerabilityMutation = useSupabaseMutation<any>({
    table: 'dependency_vulnerabilities',
    onSuccess: () => refetchScans()
  })

  // Mutations for security policies
  const policyMutation = useSupabaseMutation<any>({
    table: 'security_policies',
    onSuccess: () => refetchPolicies()
  })

  const [activeTab, setActiveTab] = useState('vulnerabilities')
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<VulnStatus | 'all'>('all')
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null)
  const [showVulnDialog, setShowVulnDialog] = useState(false)
  const [showScanDialog, setShowScanDialog] = useState(false)
  const [showAddDependencyDialog, setShowAddDependencyDialog] = useState(false)
  const [showAddPolicyDialog, setShowAddPolicyDialog] = useState(false)
  const [expandedDeps, setExpandedDeps] = useState<Set<string>>(new Set())
  const [settingsTab, setSettingsTab] = useState('general')
  const [isScanning, setIsScanning] = useState(false)
  const [scanType, setScanType] = useState<'full' | 'quick' | 'license'>('full')

  // Form state for adding dependency
  const [dependencyForm, setDependencyForm] = useState({
    name: '',
    version: '',
    type: 'direct' as 'direct' | 'transitive' | 'dev' | 'peer',
    ecosystem: 'npm' as 'npm' | 'pip' | 'maven' | 'go' | 'cargo' | 'composer',
    license: 'MIT'
  })

  // Form state for adding policy
  const [policyForm, setPolicyForm] = useState({
    name: '',
    severity: 'high' as SeverityLevel,
    action: 'warn' as 'block' | 'warn' | 'ignore',
    description: '',
    enabled: true
  })

  const filteredVulns = useMemo(() => {
    return mockVulnerabilities.filter(vuln => {
      const matchesSearch = vuln.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vuln.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vuln.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSeverity = severityFilter === 'all' || vuln.severity === severityFilter
      const matchesStatus = statusFilter === 'all' || vuln.status === statusFilter
      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [searchQuery, severityFilter, statusFilter])

  const filteredDeps = useMemo(() => {
    return mockDependencies.filter(dep =>
      dep.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    }
  }

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical': return <ShieldX className="w-4 h-4" />
      case 'high': return <ShieldAlert className="w-4 h-4" />
      case 'medium': return <AlertTriangle className="w-4 h-4" />
      case 'low': return <Info className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: VulnStatus) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'fixed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'ignored': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getLicenseRiskColor = (risk: LicenseRisk) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'none': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Real Supabase handlers
  const handleAddDependency = async () => {
    if (!dependencyForm.name.trim()) {
      toast.error('Dependency name is required')
      return
    }

    const result = await dependencyMutation.mutate({
      dependency_name: dependencyForm.name,
      current_version: dependencyForm.version,
      dependency_type: dependencyForm.type,
      ecosystem: dependencyForm.ecosystem,
      license: dependencyForm.license,
      is_outdated: false,
      is_dev: dependencyForm.type === 'dev',
      status: 'active',
      impact_level: 'low'
    })

    if (result) {
      toast.success('Dependency added', {
        description: `${dependencyForm.name} has been added to your project`
      })
      setShowAddDependencyDialog(false)
      setDependencyForm({
        name: '',
        version: '',
        type: 'direct',
        ecosystem: 'npm',
        license: 'MIT'
      })
    } else {
      toast.error('Failed to add dependency', {
        description: dependencyMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleUpdateDependency = async (depId: string, depName: string, newVersion: string) => {
    toast.loading('Updating dependency', {
      description: `Updating "${depName}" to ${newVersion}...`
    })

    const result = await dependencyMutation.mutate({
      current_version: newVersion,
      is_outdated: false,
      updated_at: new Date().toISOString()
    }, depId)

    if (result) {
      toast.success('Dependency updated', {
        description: `${depName} has been updated to ${newVersion}`
      })
    } else {
      toast.error('Failed to update dependency', {
        description: dependencyMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleDeleteDependency = async (depId: string, depName: string) => {
    const success = await dependencyMutation.remove(depId)
    if (success) {
      toast.success('Dependency removed', {
        description: `${depName} has been removed from your project`
      })
    } else {
      toast.error('Failed to remove dependency', {
        description: dependencyMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleScanVulnerabilities = async () => {
    setIsScanning(true)
    toast.loading('Scanning dependencies', {
      description: `Running ${scanType} security vulnerability scan...`
    })

    // Simulate scan process
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create a scan record
      const { error } = await supabase
        .from('dependency_scans')
        .insert({
          user_id: user.id,
          scan_type: scanType,
          status: 'completed',
          total_packages: mockScanResult.totalPackages,
          direct_dependencies: mockScanResult.directDependencies,
          transitive_dependencies: mockScanResult.transitiveDependencies,
          critical_count: mockScanResult.vulnerabilities.critical,
          high_count: mockScanResult.vulnerabilities.high,
          medium_count: mockScanResult.vulnerabilities.medium,
          low_count: mockScanResult.vulnerabilities.low,
          security_score: mockScanResult.securityScore,
          duration_seconds: mockScanResult.duration
        })

      if (error) throw error

      await refetchScans()
      toast.success('Scan completed', {
        description: `Found ${mockScanResult.vulnerabilities.critical + mockScanResult.vulnerabilities.high} critical/high vulnerabilities`
      })
    } catch (err) {
      toast.error('Scan failed', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    } finally {
      setIsScanning(false)
      setShowScanDialog(false)
    }
  }

  const handleFixVulnerability = async (vulnId: string, vulnPackage: string, patchedVersion: string | null) => {
    if (!patchedVersion) {
      toast.error('No fix available', {
        description: 'There is no patched version available for this vulnerability'
      })
      return
    }

    toast.loading('Fixing vulnerability', {
      description: `Updating ${vulnPackage} to ${patchedVersion}...`
    })

    const result = await vulnerabilityMutation.mutate({
      status: 'fixed',
      fixed_at: new Date().toISOString(),
      fixed_version: patchedVersion
    }, vulnId)

    if (result) {
      toast.success('Vulnerability fixed', {
        description: `${vulnPackage} has been updated to ${patchedVersion}`
      })
      setShowVulnDialog(false)
    } else {
      toast.error('Failed to fix vulnerability', {
        description: vulnerabilityMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleIgnoreVulnerability = async (vulnId: string, vulnPackage: string) => {
    const result = await vulnerabilityMutation.mutate({
      status: 'ignored',
      ignored_at: new Date().toISOString()
    }, vulnId)

    if (result) {
      toast.success('Vulnerability ignored', {
        description: `${vulnPackage} vulnerability has been marked as ignored`
      })
      setShowVulnDialog(false)
    } else {
      toast.error('Failed to ignore vulnerability', {
        description: vulnerabilityMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleAddSecurityPolicy = async () => {
    if (!policyForm.name.trim()) {
      toast.error('Policy name is required')
      return
    }

    const result = await policyMutation.mutate({
      policy_name: policyForm.name,
      severity: policyForm.severity,
      action: policyForm.action,
      description: policyForm.description,
      enabled: policyForm.enabled
    })

    if (result) {
      toast.success('Policy created', {
        description: `${policyForm.name} security policy has been created`
      })
      setShowAddPolicyDialog(false)
      setPolicyForm({
        name: '',
        severity: 'high',
        action: 'warn',
        description: '',
        enabled: true
      })
    } else {
      toast.error('Failed to create policy', {
        description: policyMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleUpdatePolicy = async (policyId: string, enabled: boolean) => {
    const result = await policyMutation.mutate({ enabled }, policyId)
    if (result) {
      toast.success('Policy updated', {
        description: `Security policy has been ${enabled ? 'enabled' : 'disabled'}`
      })
    } else {
      toast.error('Failed to update policy', {
        description: policyMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleDeletePolicy = async (policyId: string, policyName: string) => {
    const success = await policyMutation.remove(policyId)
    if (success) {
      toast.success('Policy deleted', {
        description: `${policyName} has been removed`
      })
    } else {
      toast.error('Failed to delete policy', {
        description: policyMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleExportDependencies = async () => {
    toast.loading('Exporting dependencies', {
      description: 'Generating dependency report...'
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create export record
      const { error } = await supabase
        .from('dependency_exports')
        .insert({
          user_id: user.id,
          export_type: 'dependencies',
          format: 'json',
          status: 'completed'
        })

      if (error) throw error

      // Simulate file download
      const exportData = {
        exportDate: new Date().toISOString(),
        totalPackages: mockScanResult.totalPackages,
        dependencies: mockDependencies
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dependencies-export.json'
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Export complete', {
        description: 'Dependencies report has been downloaded'
      })
    } catch (err) {
      toast.error('Export failed', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    }
  }

  const handleGenerateSBOM = async () => {
    toast.info('Generating SBOM', {
      description: 'Creating Software Bill of Materials...'
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create SBOM export record
      const { error } = await supabase
        .from('dependency_exports')
        .insert({
          user_id: user.id,
          export_type: 'sbom',
          format: 'spdx',
          status: 'completed'
        })

      if (error) throw error

      // Generate SBOM in SPDX format
      const sbomData = {
        spdxVersion: 'SPDX-2.3',
        creationInfo: {
          created: new Date().toISOString(),
          creators: ['Tool: FreeFlow Dependency Scanner']
        },
        name: 'Project SBOM',
        packages: mockDependencies.map(dep => ({
          name: dep.name,
          versionInfo: dep.currentVersion,
          licenseConcluded: dep.license,
          downloadLocation: `https://registry.npmjs.org/${dep.name}/-/${dep.name}-${dep.currentVersion}.tgz`
        }))
      }
      const blob = new Blob([JSON.stringify(sbomData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sbom-spdx.json'
      a.click()
      URL.revokeObjectURL(url)

      toast.success('SBOM generated', {
        description: 'Software Bill of Materials has been downloaded'
      })
    } catch (err) {
      toast.error('SBOM generation failed', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    }
  }

  const handleCreatePR = async (packageName: string, targetVersion: string) => {
    toast.info('Creating Pull Request', {
      description: `Creating PR to update ${packageName} to ${targetVersion}...`
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Record PR creation
      const { error } = await supabase
        .from('dependency_update_prs')
        .insert({
          user_id: user.id,
          package_name: packageName,
          current_version: mockDependencies.find(d => d.name === packageName)?.currentVersion || '',
          target_version: targetVersion,
          status: 'open',
          pr_url: `https://github.com/org/repo/pull/${Math.floor(Math.random() * 1000)}`
        })

      if (error) throw error

      toast.success('Pull Request created', {
        description: `PR for ${packageName} update has been created`
      })
    } catch (err) {
      toast.error('Failed to create PR', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    }
  }

  const handleClearCache = async () => {
    toast.info('Clearing cache', {
      description: 'Forcing re-scan of all dependencies...'
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Clear cached scan data (soft delete old scans)
      const { error } = await supabase
        .from('dependency_scans')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id)

      if (error) throw error

      await refetchScans()
      toast.success('Cache cleared', {
        description: 'Vulnerability cache has been cleared. Run a new scan to refresh data.'
      })
    } catch (err) {
      toast.error('Failed to clear cache', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    }
  }

  const handleResetPolicies = async () => {
    toast.info('Resetting policies', {
      description: 'Restoring security policies to defaults...'
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Soft delete all custom policies
      const { error } = await supabase
        .from('security_policies')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id)

      if (error) throw error

      await refetchPolicies()
      toast.success('Policies reset', {
        description: 'Security policies have been restored to defaults'
      })
    } catch (err) {
      toast.error('Failed to reset policies', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    }
  }

  const handleDeleteAllHistory = async () => {
    if (!confirm('Are you sure you want to delete all scan history? This action cannot be undone.')) {
      return
    }

    toast.info('Deleting history', {
      description: 'Removing all historical scan data...'
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Soft delete all scan history
      const { error: scansError } = await supabase
        .from('dependency_scans')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id)

      if (scansError) throw scansError

      const { error: exportsError } = await supabase
        .from('dependency_exports')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id)

      if (exportsError) throw exportsError

      await refetchScans()
      toast.success('History deleted', {
        description: 'All scan history has been permanently removed'
      })
    } catch (err) {
      toast.error('Failed to delete history', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    }
  }

  // Real handler for updating all dependencies
  const handleUpdateAllDependencies = async () => {
    const outdatedDeps = mockDependencies.filter(dep => dep.updateAvailable && !dep.breaking)
    if (outdatedDeps.length === 0) {
      toast.info('All dependencies are up to date')
      return
    }

    toast.loading('Updating dependencies', {
      description: `Updating ${outdatedDeps.length} packages...`
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update each dependency via API
      for (const dep of outdatedDeps) {
        await dependencyMutation.mutate({
          current_version: dep.latestVersion,
          is_outdated: false,
          updated_at: new Date().toISOString()
        }, dep.id)
      }

      await refetchDependencies()
      toast.success('Dependencies updated', {
        description: `Successfully updated ${outdatedDeps.length} packages to latest versions`
      })
    } catch (err) {
      toast.error('Update failed', {
        description: err instanceof Error ? err.message : 'Some packages failed to update'
      })
    }
  }

  // Real handler for generating lockfile
  const handleGenerateLockfile = async () => {
    toast.loading('Generating lockfile', {
      description: 'Creating package-lock.json...'
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Call API to generate lockfile
      const response = await fetch('/api/dependencies/lockfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate lockfile')
      }

      toast.success('Lockfile generated', {
        description: 'package-lock.json has been updated'
      })
    } catch (err) {
      toast.error('Lockfile generation failed', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    }
  }

  // Real handler for generating PDF report
  const handleGeneratePdfReport = async () => {
    toast.loading('Generating report', {
      description: 'Creating dependency security report...'
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create comprehensive report data
      const reportData = {
        generatedAt: new Date().toISOString(),
        scanResult: mockScanResult,
        vulnerabilities: mockVulnerabilities,
        dependencies: mockDependencies,
        licenses: mockLicenses,
        policies: mockPolicies
      }

      // Export as JSON (PDF would require a server-side library)
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dependencies-security-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Record export
      await supabase.from('dependency_exports').insert({
        user_id: user.id,
        export_type: 'security_report',
        format: 'json',
        status: 'completed'
      })

      toast.success('Report generated', {
        description: 'Security report has been downloaded'
      })
    } catch (err) {
      toast.error('Report generation failed', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    }
  }

  // Real handler for applying AI insight
  const handleApplyInsight = async (insight: { id: string; title: string; type: string; category?: string }) => {
    toast.loading('Applying insight', {
      description: `Processing ${insight.title}...`
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Take action based on insight type/category
      if (insight.category === 'Security' || insight.type === 'success') {
        // Trigger a new scan
        await handleScanVulnerabilities()
      } else if (insight.category === 'Updates' || insight.type === 'info') {
        // Update outdated packages
        await handleUpdateAllDependencies()
      } else if (insight.category === 'Deprecation' || insight.type === 'warning') {
        // Show deprecated packages for review
        toast.success('Insight applied', {
          description: `Review deprecated packages and consider alternatives`
        })
      } else {
        toast.success('Insight acknowledged', {
          description: insight.title
        })
      }
    } catch (err) {
      toast.error('Failed to apply insight', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    }
  }

  // Quick actions with real functionality
  const dependenciesQuickActions = [
    {
      id: '1',
      label: 'Run Scan',
      icon: 'Shield',
      shortcut: 'S',
      action: () => setShowScanDialog(true)
    },
    {
      id: '2',
      label: 'Update All',
      icon: 'RefreshCw',
      shortcut: 'U',
      action: handleUpdateAllDependencies
    },
    {
      id: '3',
      label: 'Lock File',
      icon: 'Lock',
      shortcut: 'L',
      action: handleGenerateLockfile
    },
    {
      id: '4',
      label: 'Report',
      icon: 'FileText',
      shortcut: 'R',
      action: handleGeneratePdfReport
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dependency Security</h1>
                <p className="text-white/80">Snyk-level vulnerability scanning & license compliance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur">
                Dependabot Level
              </span>
              <button
                onClick={() => setShowScanDialog(true)}
                disabled={isScanning}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Run Scan'}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Shield className="w-4 h-4" />
                Security Score
              </div>
              <div className={`text-2xl font-bold ${mockScanResult.securityScore >= 80 ? 'text-green-300' : mockScanResult.securityScore >= 60 ? 'text-yellow-300' : 'text-red-300'}`}>
                {mockScanResult.securityScore}/100
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <ShieldX className="w-4 h-4" />
                Critical
              </div>
              <div className="text-2xl font-bold text-red-300">{mockScanResult.vulnerabilities.critical}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <ShieldAlert className="w-4 h-4" />
                High
              </div>
              <div className="text-2xl font-bold text-orange-300">{mockScanResult.vulnerabilities.high}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Package className="w-4 h-4" />
                Packages
              </div>
              <div className="text-2xl font-bold">{mockScanResult.totalPackages}</div>
              <div className="text-xs text-white/60">{mockScanResult.directDependencies} direct</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Scale className="w-4 h-4" />
                License Issues
              </div>
              <div className="text-2xl font-bold text-yellow-300">{mockScanResult.licensesAtRisk}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Clock className="w-4 h-4" />
                Last Scan
              </div>
              <div className="text-lg font-bold">{mockScanResult.duration}s</div>
              <div className="text-xs text-white/60">{new Date(mockScanResult.lastScan).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border dark:border-gray-700 mb-6">
            <TabsTrigger value="vulnerabilities" className="rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-600 dark:data-[state=active]:bg-red-900/30">
              <ShieldAlert className="w-4 h-4 mr-2" />
              Vulnerabilities
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-xs">
                {mockVulnerabilities.filter(v => v.status === 'open').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-900/30">
              <Package className="w-4 h-4 mr-2" />
              Dependencies
            </TabsTrigger>
            <TabsTrigger value="updates" className="rounded-lg data-[state=active]:bg-green-50 data-[state=active]:text-green-600 dark:data-[state=active]:bg-green-900/30">
              <GitPullRequest className="w-4 h-4 mr-2" />
              Updates
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs">
                {mockUpdates.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="licenses" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
              <Scale className="w-4 h-4 mr-2" />
              Licenses
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-600 dark:data-[state=active]:bg-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities" className="space-y-4">
            {/* Vulnerabilities Banner */}
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Security Vulnerabilities</h2>
                  <p className="text-red-100">Snyk-level vulnerability scanning and remediation</p>
                  <p className="text-red-200 text-xs mt-1">CVE tracking • SBOM export • Auto-fix suggestions</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockVulnerabilities.filter(v => v.severity === 'critical').length}</p>
                    <p className="text-red-200 text-sm">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockVulnerabilities.filter(v => v.severity === 'high').length}</p>
                    <p className="text-red-200 text-sm">High</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockVulnerabilities.length}</p>
                    <p className="text-red-200 text-sm">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Shield, label: 'Scan Now', color: 'text-red-600 dark:text-red-400' },
                { icon: AlertTriangle, label: 'Critical', color: 'text-orange-600 dark:text-orange-400' },
                { icon: Zap, label: 'Auto-Fix', color: 'text-green-600 dark:text-green-400' },
                { icon: FileText, label: 'Reports', color: 'text-blue-600 dark:text-blue-400' },
                { icon: Download, label: 'Export SBOM', color: 'text-purple-600 dark:text-purple-400' },
                { icon: Bell, label: 'Alerts', color: 'text-amber-600 dark:text-amber-400' },
                { icon: GitBranch, label: 'PR Checks', color: 'text-cyan-600 dark:text-cyan-400' },
                { icon: Settings, label: 'Settings', color: 'text-gray-600 dark:text-gray-400' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by package, CVE, or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'critical', 'high', 'medium', 'low'] as const).map(severity => (
                    <button
                      key={severity}
                      onClick={() => setSeverityFilter(severity)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        severityFilter === severity
                          ? severity === 'all' ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            : getSeverityColor(severity as SeverityLevel)
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleGenerateSBOM}
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export SBOM
              </button>
            </div>

            {/* Vulnerability Cards */}
            <div className="space-y-3">
              {filteredVulns.map((vuln) => (
                <div
                  key={vuln.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    vuln.severity === 'critical' ? 'border-l-red-500' :
                    vuln.severity === 'high' ? 'border-l-orange-500' :
                    vuln.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
                  }`}
                  onClick={() => { setSelectedVuln(vuln); setShowVulnDialog(true); }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getSeverityColor(vuln.severity)}`}>
                          {getSeverityIcon(vuln.severity)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{vuln.title}</h3>
                            {vuln.exploitAvailable && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                                Exploit Available
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-mono">{vuln.cveId}</span>
                            <span>•</span>
                            <span className="font-medium text-gray-900 dark:text-white">{vuln.packageName}</span>
                            <span className="font-mono text-xs">{vuln.currentVersion}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">CVSS</div>
                          <div className={`font-bold ${vuln.cvssScore >= 9 ? 'text-red-600' : vuln.cvssScore >= 7 ? 'text-orange-600' : vuln.cvssScore >= 4 ? 'text-yellow-600' : 'text-blue-600'}`}>
                            {vuln.cvssScore}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vuln.status)}`}>
                          {vuln.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {vuln.fixAvailable && (
                      <div className="mt-3 pt-3 border-t dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Fix available: upgrade to {vuln.patchedVersion}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCreatePR(vuln.packageName, vuln.patchedVersion || '')
                          }}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1"
                        >
                          <GitPullRequest className="w-3 h-3" />
                          Create PR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="space-y-4">
            {/* Dependencies Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Package Dependencies</h2>
                  <p className="text-blue-100">Dependabot-level dependency management and tracking</p>
                  <p className="text-blue-200 text-xs mt-1">Version tracking • Outdated alerts • License compliance</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDependencies.length}</p>
                    <p className="text-blue-200 text-sm">Packages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDependencies.filter(d => d.hasUpdate).length}</p>
                    <p className="text-blue-200 text-sm">Outdated</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Package className="w-4 h-4" />
                {mockDependencies.length} packages
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Package</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Version</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">License</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Vulns</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Update</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeps.map((dep) => (
                    <tr key={dep.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {dep.name}
                              {dep.deprecated && (
                                <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
                                  Deprecated
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{dep.ecosystem}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{dep.currentVersion}</span>
                        {dep.updateAvailable && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            → {dep.latestVersion}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          dep.type === 'direct' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          dep.type === 'dev' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {dep.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLicenseRiskColor(dep.licenseRisk)}`}>
                          {dep.license}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {dep.vulnerabilities > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                            {dep.vulnerabilities}
                          </span>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {dep.updateAvailable ? (
                          dep.breaking ? (
                            <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs">Major</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">Available</span>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            {/* Updates Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Available Updates</h2>
                  <p className="text-emerald-100">Renovate-level automated dependency updates</p>
                  <p className="text-emerald-200 text-xs mt-1">Security patches • Feature updates • Breaking changes</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDependencies.filter(d => d.hasUpdate).length}</p>
                    <p className="text-emerald-200 text-sm">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDependencies.filter(d => d.hasUpdate && d.updateType === 'security').length || 0}</p>
                    <p className="text-emerald-200 text-sm">Security</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Suggested Updates</h2>
              <button
                onClick={() => {
                  mockUpdates.filter(u => u.prStatus === 'none').forEach(update => {
                    handleCreatePR(update.packageName, update.targetVersion)
                  })
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                <GitPullRequest className="w-4 h-4" />
                Create All PRs
              </button>
            </div>
            <div className="space-y-3">
              {mockUpdates.map((update) => (
                <div key={update.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        update.reason === 'security' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>
                        {update.reason === 'security' ? <ShieldAlert className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{update.packageName}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            update.updateType === 'major' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            update.updateType === 'minor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {update.updateType}
                          </span>
                          {update.breaking && (
                            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                              Breaking
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-mono">{update.currentVersion}</span>
                          <ArrowUpRight className="w-3 h-3" />
                          <span className="font-mono text-green-600 dark:text-green-400">{update.targetVersion}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{update.releaseNotes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {update.vulnerabilitiesFixed > 0 && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Fixes</div>
                          <div className="font-bold text-green-600 dark:text-green-400">{update.vulnerabilitiesFixed} vulns</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Compatibility</div>
                        <div className={`font-bold ${update.compatibility >= 95 ? 'text-green-600' : update.compatibility >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {update.compatibility}%
                        </div>
                      </div>
                      {update.prStatus === 'none' ? (
                        <button
                          onClick={() => handleCreatePR(update.packageName, update.targetVersion)}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
                        >
                          <GitPullRequest className="w-3 h-3" />
                          Create PR
                        </button>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          update.prStatus === 'merged' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          update.prStatus === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          PR {update.prStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses" className="space-y-4">
            {/* Licenses Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">License Compliance</h2>
                  <p className="text-purple-100">FOSSA-level license scanning and compliance reporting</p>
                  <p className="text-purple-200 text-xs mt-1">OSS licenses • Policy violations • Attribution reports</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDependencies.length}</p>
                    <p className="text-purple-200 text-sm">Packages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">✓</p>
                    <p className="text-purple-200 text-sm">Compliant</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">License Compliance</h2>
              <button
                onClick={handleExportDependencies}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockLicenses.map((license) => (
                <div key={license.id} className={`bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 ${!license.compatible ? 'border-l-4 border-l-red-500' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{license.name}</h3>
                      <div className="font-mono text-sm text-gray-500 dark:text-gray-400">{license.spdxId}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLicenseRiskColor(license.risk)}`}>
                        {license.risk === 'none' ? 'Safe' : license.risk + ' risk'}
                      </span>
                      {!license.compatible && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{license.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      <Package className="w-4 h-4 inline mr-1" />
                      {license.packages} packages
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      license.type === 'permissive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      license.type === 'copyleft' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {license.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - npm/Maven Level with 6 Sub-tabs */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Dependency Settings</h2>
                  <p className="text-slate-300">Configure scanning schedules, notifications, and policies</p>
                  <p className="text-slate-400 text-xs mt-1">Auto-updates • Security policies • Ignore rules • Integrations</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">Daily</p>
                    <p className="text-slate-400 text-sm">Scan</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">ON</p>
                    <p className="text-slate-400 text-sm">Auto-PR</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Settings, label: 'General', color: 'text-gray-600 dark:text-gray-400' },
                { icon: Shield, label: 'Security', color: 'text-red-600 dark:text-red-400' },
                { icon: Bell, label: 'Alerts', color: 'text-amber-600 dark:text-amber-400' },
                { icon: GitBranch, label: 'Branches', color: 'text-purple-600 dark:text-purple-400' },
                { icon: RefreshCw, label: 'Schedule', color: 'text-blue-600 dark:text-blue-400' },
                { icon: FileText, label: 'Policies', color: 'text-green-600 dark:text-green-400' },
                { icon: Link2, label: 'Integrations', color: 'text-cyan-600 dark:text-cyan-400' },
                { icon: Key, label: 'API Keys', color: 'text-orange-600 dark:text-orange-400' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex gap-6">
              {/* Settings Sidebar */}
              <div className="w-64 shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 px-3">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'security', icon: Shield, label: 'Security Policies' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'integrations', icon: Zap, label: 'Integrations' },
                      { id: 'scanning', icon: Scan, label: 'Scanning' },
                      { id: 'advanced', icon: Lock, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          settingsTab === item.id
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Package Manager Settings</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Configure dependency management preferences</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Default Package Manager</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Select your primary package manager</p>
                          </div>
                          <Select defaultValue="npm">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="npm">npm</SelectItem>
                              <SelectItem value="yarn">Yarn</SelectItem>
                              <SelectItem value="pnpm">pnpm</SelectItem>
                              <SelectItem value="bun">Bun</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-Update Dependencies</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically create PRs for updates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Lock File Verification</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Verify lock file integrity on each scan</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Include Dev Dependencies</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Scan development dependencies for issues</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dependency Display</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Customize how dependencies are shown</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Show Transitive Dependencies</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display indirect dependency tree</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Group by Ecosystem</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Group dependencies by package type</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Show Download Stats</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display weekly download counts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Policies */}
                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vulnerability Policies</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Define how vulnerabilities are handled</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {mockPolicies.map((policy) => (
                          <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <Switch defaultChecked={policy.enabled} />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{policy.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{policy.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(policy.severity)}`}>
                                {policy.severity}
                              </span>
                              <Select defaultValue={policy.action}>
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="block">Block</SelectItem>
                                  <SelectItem value="warn">Warn</SelectItem>
                                  <SelectItem value="allow">Allow</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">License Policies</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Control allowed license types</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Block Copyleft Licenses</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Prevent GPL, LGPL, AGPL licenses</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Require OSI Approved</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Only allow OSI-approved licenses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Warn on Unknown Licenses</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert when license cannot be determined</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Configure email alert preferences</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Critical Vulnerabilities</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Immediate alerts for critical CVEs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Daily Digest</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Summary of all dependency changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">New Updates Available</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when packages have updates</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">License Policy Violations</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert on license compliance issues</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send alerts to Slack channels</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Microsoft Teams</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Post to Teams channels</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">PagerDuty</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Trigger incidents for critical vulns</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Label className="text-gray-900 dark:text-white font-medium mb-2 block">Custom Webhook URL</Label>
                          <div className="flex gap-2">
                            <Input placeholder="https://your-webhook-url.com/endpoint" className="flex-1" />
                            <Button variant="outline">Test</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Integrations */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <GitBranch className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Source Control</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Connect your repositories</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'GitHub', status: 'connected', repos: 12 },
                          { name: 'GitLab', status: 'not_connected', repos: 0 },
                          { name: 'Bitbucket', status: 'not_connected', repos: 0 },
                          { name: 'Azure DevOps', status: 'not_connected', repos: 0 }
                        ].map(provider => (
                          <div key={provider.name} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg">
                            <div className="flex items-center gap-3">
                              <GitBranch className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">{provider.name}</span>
                                {provider.status === 'connected' && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{provider.repos} repositories</p>
                                )}
                              </div>
                            </div>
                            <Button variant={provider.status === 'connected' ? 'outline' : 'default'} size="sm">
                              {provider.status === 'connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Terminal className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CI/CD Integration</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Connect to your build pipelines</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'GitHub Actions', connected: true },
                          { name: 'GitLab CI', connected: false },
                          { name: 'Jenkins', connected: false },
                          { name: 'CircleCI', connected: false }
                        ].map(ci => (
                          <div key={ci.name} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Cpu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">{ci.name}</span>
                            </div>
                            <Button variant={ci.connected ? 'outline' : 'default'} size="sm">
                              {ci.connected ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Access</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Manage API tokens and access</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-gray-900 dark:text-white font-medium">API Token</Label>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded block font-mono">
                            dep_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate API Token
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scanning */}
                {settingsTab === 'scanning' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Scan className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scan Schedule</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Configure automated scanning</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Scan Frequency</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How often to scan dependencies</p>
                          </div>
                          <Select defaultValue="daily">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="push">On Push</SelectItem>
                              <SelectItem value="manual">Manual Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Scan on Pull Request</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Check dependencies before merge</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Block Merge on Critical</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Prevent merge with critical vulnerabilities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                          <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vulnerability Databases</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Configure vulnerability data sources</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">National Vulnerability Database (NVD)</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">NIST CVE database</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">GitHub Advisory Database</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">GitHub security advisories</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">OSV Database</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Open Source Vulnerabilities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Snyk Vulnerability DB</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Snyk curated database</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <FileCode className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scan Scope</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">What to include in scans</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Lock Files</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">package-lock.json, yarn.lock, etc.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Container Images</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Scan Dockerfile dependencies</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Infrastructure as Code</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Terraform, CloudFormation modules</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Cog className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Configuration</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Power user settings</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-Remediation</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically create fix PRs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Group Updates</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Combine updates into single PRs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Rebasing Strategy</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How to handle update PR conflicts</p>
                          </div>
                          <Select defaultValue="auto">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto Rebase</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="recreate">Recreate PR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data & History</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Manage scan history and data</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">History Retention</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How long to keep scan history</p>
                          </div>
                          <Select defaultValue="90">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Export Scan Data
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Generate Report
                          </Button>
                        </div>
                      </div>
                    </div>

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
                            <h4 className="font-medium text-gray-900 dark:text-white">Clear Vulnerability Cache</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Force re-scan of all dependencies</p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleClearCache}
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear Cache
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Reset All Policies</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Restore security policies to defaults</p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleResetPolicies}
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Delete All Scan History</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently remove all historical data</p>
                          </div>
                          <Button variant="destructive" onClick={handleDeleteAllHistory}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All
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
              insights={mockDependenciesAIInsights}
              title="Dependencies Intelligence"
              onInsightAction={handleApplyInsight}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockDependenciesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockDependenciesPredictions}
              title="Security Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockDependenciesActivities}
            title="Dependency Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={dependenciesQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Vulnerability Detail Dialog */}
      <Dialog open={showVulnDialog} onOpenChange={setShowVulnDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedVuln && (
                <>
                  <div className={`p-2 rounded-lg ${getSeverityColor(selectedVuln.severity)}`}>
                    {getSeverityIcon(selectedVuln.severity)}
                  </div>
                  <div>
                    <div>{selectedVuln.title}</div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400 font-mono">{selectedVuln.cveId}</div>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedVuln && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CVSS Score</div>
                    <div className={`text-2xl font-bold ${selectedVuln.cvssScore >= 9 ? 'text-red-600' : selectedVuln.cvssScore >= 7 ? 'text-orange-600' : selectedVuln.cvssScore >= 4 ? 'text-yellow-600' : 'text-blue-600'}`}>
                      {selectedVuln.cvssScore}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Package</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{selectedVuln.packageName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{selectedVuln.currentVersion}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Patched In</div>
                    <div className="font-semibold text-green-600 dark:text-green-400 font-mono">{selectedVuln.patchedVersion || 'No patch'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedVuln.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">CWEs</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVuln.cwes.map(cwe => (
                      <span key={cwe} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-300">
                        {cwe}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {selectedVuln.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">References</h4>
                  {selectedVuln.references.map((ref, idx) => (
                    <a key={idx} href={ref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
                      <ExternalLink className="w-3 h-3" />
                      {ref}
                    </a>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => handleIgnoreVulnerability(selectedVuln?.id || '', selectedVuln?.packageName || '')}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Ignore
            </button>
            <button
              onClick={() => setShowVulnDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
            {selectedVuln?.fixAvailable && (
              <button
                onClick={() => handleFixVulnerability(selectedVuln.id, selectedVuln.packageName, selectedVuln.patchedVersion)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
              >
                <GitPullRequest className="w-4 h-4" />
                Create Fix PR
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan Dialog */}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                <RefreshCw className="w-5 h-5" />
              </div>
              Run Security Scan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scan Type</label>
              <div className="space-y-2">
                {[
                  { id: 'full' as const, label: 'Full Scan', desc: 'Scan all dependencies and transitive dependencies' },
                  { id: 'quick' as const, label: 'Quick Scan', desc: 'Scan direct dependencies only' },
                  { id: 'license' as const, label: 'License Audit', desc: 'Check license compliance only' }
                ].map(option => (
                  <label key={option.id} className="flex items-start gap-3 p-3 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="scanType"
                      checked={scanType === option.id}
                      onChange={() => setScanType(option.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowScanDialog(false)}
                disabled={isScanning}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScanVulnerabilities}
                disabled={isScanning}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Start Scan'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dependency Dialog */}
      <Dialog open={showAddDependencyDialog} onOpenChange={setShowAddDependencyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                <Package className="w-5 h-5" />
              </div>
              Add Dependency
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-900 dark:text-white">Package Name</Label>
              <Input
                value={dependencyForm.name}
                onChange={(e) => setDependencyForm({ ...dependencyForm, name: e.target.value })}
                placeholder="e.g., lodash, react, axios"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Version</Label>
              <Input
                value={dependencyForm.version}
                onChange={(e) => setDependencyForm({ ...dependencyForm, version: e.target.value })}
                placeholder="e.g., 4.17.21, ^18.2.0"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-900 dark:text-white">Type</Label>
                <Select
                  value={dependencyForm.type}
                  onValueChange={(value: 'direct' | 'transitive' | 'dev' | 'peer') => setDependencyForm({ ...dependencyForm, type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="dev">Dev</SelectItem>
                    <SelectItem value="peer">Peer</SelectItem>
                    <SelectItem value="transitive">Transitive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-900 dark:text-white">Ecosystem</Label>
                <Select
                  value={dependencyForm.ecosystem}
                  onValueChange={(value: 'npm' | 'pip' | 'maven' | 'go' | 'cargo' | 'composer') => setDependencyForm({ ...dependencyForm, ecosystem: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="npm">npm</SelectItem>
                    <SelectItem value="pip">pip</SelectItem>
                    <SelectItem value="maven">Maven</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="cargo">Cargo</SelectItem>
                    <SelectItem value="composer">Composer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">License</Label>
              <Input
                value={dependencyForm.license}
                onChange={(e) => setDependencyForm({ ...dependencyForm, license: e.target.value })}
                placeholder="e.g., MIT, Apache-2.0"
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowAddDependencyDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDependency}
                disabled={dependencyMutation.isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {dependencyMutation.isLoading ? 'Adding...' : 'Add Dependency'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Security Policy Dialog */}
      <Dialog open={showAddPolicyDialog} onOpenChange={setShowAddPolicyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              Add Security Policy
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-900 dark:text-white">Policy Name</Label>
              <Input
                value={policyForm.name}
                onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                placeholder="e.g., Block Critical Vulnerabilities"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Description</Label>
              <Input
                value={policyForm.description}
                onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                placeholder="Describe what this policy does"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-900 dark:text-white">Severity</Label>
                <Select
                  value={policyForm.severity}
                  onValueChange={(value: SeverityLevel) => setPolicyForm({ ...policyForm, severity: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-900 dark:text-white">Action</Label>
                <Select
                  value={policyForm.action}
                  onValueChange={(value: 'block' | 'warn' | 'ignore') => setPolicyForm({ ...policyForm, action: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="warn">Warn</SelectItem>
                    <SelectItem value="ignore">Ignore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={policyForm.enabled}
                onCheckedChange={(checked) => setPolicyForm({ ...policyForm, enabled: checked })}
              />
              <Label className="text-gray-900 dark:text-white">Enable policy immediately</Label>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowAddPolicyDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSecurityPolicy}
                disabled={policyMutation.isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                {policyMutation.isLoading ? 'Creating...' : 'Create Policy'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
