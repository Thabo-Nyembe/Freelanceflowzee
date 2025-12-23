'use client'

import { useState, useMemo } from 'react'
import { useDependencies, type Dependency, type DependencyStatus, type DependencyType } from '@/lib/hooks/use-dependencies'
import {
  Package,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Settings,
  GitPullRequest,
  GitBranch,
  GitMerge,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Scale,
  Lock,
  Unlock,
  Info,
  XCircle,
  Zap,
  Layers,
  Box,
  Database,
  Globe,
  Terminal,
  ChevronRight,
  ChevronDown,
  Bell,
  BellOff,
  X,
  Check
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

export default function DependenciesClient({ initialDependencies }: { initialDependencies: Dependency[] }) {
  const [activeTab, setActiveTab] = useState('vulnerabilities')
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<VulnStatus | 'all'>('all')
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null)
  const [showVulnDialog, setShowVulnDialog] = useState(false)
  const [showScanDialog, setShowScanDialog] = useState(false)
  const [expandedDeps, setExpandedDeps] = useState<Set<string>>(new Set())

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
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Run Scan
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
              <button className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm">
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
                        <button className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1">
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Suggested Updates</h2>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
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
                        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1">
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">License Compliance</h2>
              <button className="px-4 py-2 border dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300">
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security Policies</h2>
              <div className="space-y-4">
                {mockPolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <button
                        className={`w-12 h-6 rounded-full transition-colors ${policy.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${policy.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{policy.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{policy.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(policy.severity)}`}>
                        {policy.severity}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        policy.action === 'block' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        policy.action === 'warn' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {policy.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Integrations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['GitHub', 'GitLab', 'Bitbucket'].map((provider) => (
                  <div key={provider} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{provider}</span>
                    </div>
                    <button className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Scan Schedule</h2>
              <div className="flex items-center gap-4">
                <select className="px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>On push</option>
                  <option>Manual only</option>
                </select>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                  Save Schedule
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
              onClick={() => setShowVulnDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
            {selectedVuln?.fixAvailable && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
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
                  { id: 'full', label: 'Full Scan', desc: 'Scan all dependencies and transitive dependencies' },
                  { id: 'quick', label: 'Quick Scan', desc: 'Scan direct dependencies only' },
                  { id: 'license', label: 'License Audit', desc: 'Check license compliance only' }
                ].map(option => (
                  <label key={option.id} className="flex items-start gap-3 p-3 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="radio" name="scanType" defaultChecked={option.id === 'full'} className="mt-1" />
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
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Start Scan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
