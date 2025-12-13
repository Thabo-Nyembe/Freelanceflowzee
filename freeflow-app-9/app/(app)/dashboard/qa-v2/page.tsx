"use client"

import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Download,
  Plus,
  Search,
  Filter,
  PlayCircle,
  FileText,
  Zap,
  Award,
  Activity
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type TestStatus = 'all' | 'passed' | 'failed' | 'pending' | 'blocked'
type TestType = 'all' | 'functional' | 'regression' | 'integration' | 'performance' | 'security'

export default function QAV2Page() {
  const [status, setStatus] = useState<TestStatus>('all')
  const [testType, setTestType] = useState<TestType>('all')

  const stats = [
    {
      label: 'Total Test Cases',
      value: '2,847',
      change: '+18.2%',
      trend: 'up' as const,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Pass Rate',
      value: '94.7%',
      change: '+8.4%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      label: 'Failed Tests',
      value: '47',
      change: '-24.7%',
      trend: 'down' as const,
      icon: XCircle,
      color: 'text-red-600'
    },
    {
      label: 'Code Coverage',
      value: '87.4%',
      change: '+12.5%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Test Case',
      description: 'Create test scenario',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Run Test Suite',
      description: 'Execute all tests',
      icon: PlayCircle,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Test Report',
      description: 'Generate QA report',
      icon: FileText,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Export Results',
      description: 'Download test data',
      icon: Download,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Coverage Analysis',
      description: 'View code coverage',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Quick Test',
      description: 'Smoke test suite',
      icon: Zap,
      color: 'from-pink-500 to-rose-500'
    },
    {
      label: 'Test Automation',
      description: 'Manage automated tests',
      icon: Activity,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Quality Metrics',
      description: 'View quality dashboard',
      icon: Award,
      color: 'from-red-500 to-orange-500'
    }
  ]

  const testCases = [
    {
      id: 'TC-2847',
      name: 'User Login Flow - Valid Credentials',
      description: 'Verify successful login with correct username and password',
      type: 'functional',
      status: 'passed',
      priority: 'high',
      assignee: 'Sarah Johnson',
      lastRun: '2024-02-15 14:30',
      duration: 2.4,
      executions: 847,
      passRate: 98.5,
      automated: true,
      environment: 'Staging',
      build: 'v3.2.1'
    },
    {
      id: 'TC-2846',
      name: 'Payment Gateway Integration',
      description: 'Test end-to-end payment processing with Stripe',
      type: 'integration',
      status: 'failed',
      priority: 'critical',
      assignee: 'Michael Chen',
      lastRun: '2024-02-15 13:45',
      duration: 8.7,
      executions: 284,
      passRate: 87.3,
      automated: true,
      environment: 'Production',
      build: 'v3.2.1'
    },
    {
      id: 'TC-2845',
      name: 'Homepage Load Performance',
      description: 'Verify page load time under 2 seconds',
      type: 'performance',
      status: 'passed',
      priority: 'medium',
      assignee: 'David Park',
      lastRun: '2024-02-15 12:20',
      duration: 45.2,
      executions: 524,
      passRate: 92.1,
      automated: true,
      environment: 'Staging',
      build: 'v3.2.1'
    },
    {
      id: 'TC-2844',
      name: 'SQL Injection Prevention',
      description: 'Test application security against SQL injection attacks',
      type: 'security',
      status: 'passed',
      priority: 'critical',
      assignee: 'Emma Wilson',
      lastRun: '2024-02-15 11:10',
      duration: 12.8,
      executions: 156,
      passRate: 100,
      automated: true,
      environment: 'Staging',
      build: 'v3.2.0'
    },
    {
      id: 'TC-2843',
      name: 'Shopping Cart Functionality',
      description: 'Verify add to cart, update quantity, and remove items',
      type: 'functional',
      status: 'passed',
      priority: 'high',
      assignee: 'Lisa Anderson',
      lastRun: '2024-02-15 10:30',
      duration: 5.6,
      executions: 1247,
      passRate: 96.8,
      automated: true,
      environment: 'Production',
      build: 'v3.2.1'
    },
    {
      id: 'TC-2842',
      name: 'Regression Suite - Core Features',
      description: 'Full regression test of critical application features',
      type: 'regression',
      status: 'pending',
      priority: 'high',
      assignee: 'Robert Taylor',
      lastRun: '2024-02-14 16:00',
      duration: 124.5,
      executions: 92,
      passRate: 94.2,
      automated: true,
      environment: 'Staging',
      build: 'v3.2.1'
    },
    {
      id: 'TC-2841',
      name: 'API Rate Limiting',
      description: 'Test API throttling under high request volume',
      type: 'performance',
      status: 'failed',
      priority: 'medium',
      assignee: 'James Martinez',
      lastRun: '2024-02-14 15:20',
      duration: 32.4,
      executions: 247,
      passRate: 78.5,
      automated: true,
      environment: 'Staging',
      build: 'v3.2.1'
    },
    {
      id: 'TC-2840',
      name: 'User Registration Validation',
      description: 'Test form validation and error handling',
      type: 'functional',
      status: 'passed',
      priority: 'high',
      assignee: 'Sarah Johnson',
      lastRun: '2024-02-14 14:10',
      duration: 3.2,
      executions: 624,
      passRate: 99.2,
      automated: false,
      environment: 'Staging',
      build: 'v3.2.0'
    },
    {
      id: 'TC-2839',
      name: 'Cross-Browser Compatibility',
      description: 'Verify functionality across Chrome, Firefox, Safari, Edge',
      type: 'functional',
      status: 'blocked',
      priority: 'medium',
      assignee: 'Michael Chen',
      lastRun: '2024-02-13 10:00',
      duration: 28.7,
      executions: 184,
      passRate: 91.8,
      automated: false,
      environment: 'Staging',
      build: 'v3.1.9'
    },
    {
      id: 'TC-2838',
      name: 'Database Migration Script',
      description: 'Test data migration from v3.1 to v3.2 schema',
      type: 'integration',
      status: 'passed',
      priority: 'critical',
      assignee: 'David Park',
      lastRun: '2024-02-12 09:30',
      duration: 156.8,
      executions: 28,
      passRate: 100,
      automated: true,
      environment: 'Staging',
      build: 'v3.2.0'
    }
  ]

  const filteredTests = testCases.filter(test => {
    const statusMatch = status === 'all' || test.status === status
    const typeMatch = testType === 'all' || test.type === testType
    return statusMatch && typeMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Passed'
        }
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Failed'
        }
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending'
        }
      case 'blocked':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: AlertTriangle,
          label: 'Blocked'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Target,
          label: status
        }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const recentActivity = [
    { label: 'Test suite completed', time: '30 minutes ago', color: 'text-green-600' },
    { label: 'Test failure detected', time: '1 hour ago', color: 'text-red-600' },
    { label: 'Coverage improved', time: '2 hours ago', color: 'text-blue-600' },
    { label: 'Automated test added', time: '3 hours ago', color: 'text-purple-600' },
    { label: 'Bug reported from test', time: '5 hours ago', color: 'text-orange-600' }
  ]

  const testsByType = [
    { label: 'Functional', value: '1,284 tests', color: 'bg-blue-500' },
    { label: 'Regression', value: '847 tests', color: 'bg-green-500' },
    { label: 'Integration', value: '524 tests', color: 'bg-purple-500' },
    { label: 'Performance', value: '284 tests', color: 'bg-orange-500' },
    { label: 'Security', value: '156 tests', color: 'bg-red-500' }
  ]

  const passRateData = {
    label: 'Overall Pass Rate',
    current: 94.7,
    target: 95,
    subtitle: 'Last 30 days'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Quality Assurance
            </h1>
            <p className="text-gray-600 mt-2">Manage test cases and quality metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Run Tests
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Test Case
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStatus('all')}
                  isActive={status === 'all'}
                  variant="default"
                >
                  All Tests
                </PillButton>
                <PillButton
                  onClick={() => setStatus('passed')}
                  isActive={status === 'passed'}
                  variant="default"
                >
                  Passed
                </PillButton>
                <PillButton
                  onClick={() => setStatus('failed')}
                  isActive={status === 'failed'}
                  variant="default"
                >
                  Failed
                </PillButton>
                <PillButton
                  onClick={() => setStatus('pending')}
                  isActive={status === 'pending'}
                  variant="default"
                >
                  Pending
                </PillButton>
                <PillButton
                  onClick={() => setStatus('blocked')}
                  isActive={status === 'blocked'}
                  variant="default"
                >
                  Blocked
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Test Type</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setTestType('all')}
                  isActive={testType === 'all'}
                  variant="default"
                >
                  All Types
                </PillButton>
                <PillButton
                  onClick={() => setTestType('functional')}
                  isActive={testType === 'functional'}
                  variant="default"
                >
                  Functional
                </PillButton>
                <PillButton
                  onClick={() => setTestType('regression')}
                  isActive={testType === 'regression'}
                  variant="default"
                >
                  Regression
                </PillButton>
                <PillButton
                  onClick={() => setTestType('integration')}
                  isActive={testType === 'integration'}
                  variant="default"
                >
                  Integration
                </PillButton>
                <PillButton
                  onClick={() => setTestType('performance')}
                  isActive={testType === 'performance'}
                  variant="default"
                >
                  Performance
                </PillButton>
                <PillButton
                  onClick={() => setTestType('security')}
                  isActive={testType === 'security'}
                  variant="default"
                >
                  Security
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Cases List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Test Cases</h2>
              <div className="text-sm text-gray-600">
                {filteredTests.length} tests
              </div>
            </div>

            <div className="space-y-3">
              {filteredTests.map((test) => {
                const statusBadge = getStatusBadge(test.status)
                const StatusIcon = statusBadge.icon

                return (
                  <div
                    key={test.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-green-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white">
                          <Target className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{test.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{test.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500 capitalize">{test.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getPriorityBadge(test.priority)}`}>
                          {test.priority}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{test.description}</p>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Assignee</div>
                        <div className="font-medium text-gray-900 text-sm">{test.assignee}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Duration</div>
                        <div className="font-medium text-gray-900 text-sm">{test.duration}s</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Pass Rate</div>
                        <div className="font-medium text-green-600 text-sm">{test.passRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Executions</div>
                        <div className="font-medium text-gray-900 text-sm">{test.executions}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          Environment: <span className="font-medium text-gray-900">{test.environment}</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          Build: <span className="font-medium text-gray-900">{test.build}</span>
                        </span>
                        {test.automated && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-md">
                              Automated
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-gray-500">{test.lastRun}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={passRateData.label}
              current={passRateData.current}
              target={passRateData.target}
              subtitle={passRateData.subtitle}
            />

            <MiniKPI
              title="Code Coverage"
              value="87.4%"
              change="+12.5%"
              trend="up"
              subtitle="Branch coverage"
            />

            <RankingList
              title="Tests by Type"
              items={testsByType}
            />

            <ActivityFeed
              title="Recent Activity"
              items={recentActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
