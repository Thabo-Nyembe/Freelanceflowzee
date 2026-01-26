/**
 * Feature Testing & Quality Assurance Queries
 *
 * Comprehensive test management system with:
 * - Feature test definitions and configuration
 * - Test run execution and tracking
 * - Step-by-step test results
 * - Issue tracking and resolution
 * - Test coverage analytics
 * - Test suites and dependencies
 * - QA health scoring
 */

import { createClient } from '@/lib/supabase/client'
import type { JsonValue, Metadata } from '@/lib/types/database'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TestStatus = 'pending' | 'testing' | 'passed' | 'failed' | 'warning' | 'skipped'
export type TestCategory = 'core-business' | 'ai-tools' | 'creative-tools' | 'collaboration' | 'client-management' | 'admin' | 'integration' | 'performance' | 'security'
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type TestResult = 'pass' | 'fail' | 'warning' | 'skip' | 'error'
export type Environment = 'local' | 'development' | 'staging' | 'production'

export interface FeatureTest {
  id: string
  name: string
  path: string
  category: TestCategory
  description: string
  status: TestStatus
  last_tested_at?: string
  last_result?: TestResult
  timeout_ms: number
  retry_count: number
  is_critical: boolean
  is_enabled: boolean
  total_runs: number
  passed_runs: number
  failed_runs: number
  success_rate: number
  avg_duration_ms: number
  tags: string[]
  metadata?: Metadata
  created_at: string
  updated_at: string
}

export interface TestSuite {
  id: string
  name: string
  description?: string
  category: TestCategory
  is_enabled: boolean
  run_parallel: boolean
  max_parallel: number
  total_tests: number
  total_runs: number
  last_run_at?: string
  last_result?: TestResult
  success_rate: number
  created_at: string
  updated_at: string
}

export interface TestDependency {
  id: string
  test_id: string
  depends_on_test_id?: string
  dependency_name: string
  dependency_type: 'test' | 'service' | 'api' | 'database' | 'external'
  is_required: boolean
  created_at: string
}

export interface TestRun {
  id: string
  test_id: string
  suite_id?: string
  user_id?: string
  result: TestResult
  duration_ms: number
  started_at: string
  completed_at: string
  environment: Environment
  browser?: string
  os?: string
  error_message?: string
  stack_trace?: string
  screenshots?: JsonValue[]
  logs?: JsonValue[]
  metadata?: Metadata
  created_at: string
}

export interface TestStepResult {
  id: string
  run_id: string
  test_id: string
  step_name: string
  step_order: number
  result: TestResult
  duration_ms: number
  expected_value?: string
  actual_value?: string
  error_message?: string
  screenshot_url?: string
  metadata?: Metadata
  created_at: string
}

export interface TestIssue {
  id: string
  test_id: string
  run_id?: string
  title: string
  description: string
  severity: IssueSeverity
  is_resolved: boolean
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
  first_seen_at: string
  last_seen_at: string
  occurrence_count: number
  error_type?: string
  error_code?: string
  affected_browsers: string[]
  affected_os: string[]
  stack_trace?: string
  metadata?: Metadata
  created_at: string
  updated_at: string
}

export interface TestCoverage {
  id: string
  test_id?: string
  date: string
  category: TestCategory
  total_features: number
  tested_features: number
  passed_features: number
  failed_features: number
  coverage_percentage: number
  avg_test_duration_ms: number
  total_issues: number
  critical_issues: number
  metadata?: Metadata
  created_at: string
}

export interface TestStatistics {
  total_tests: number
  passed_tests: number
  failed_tests: number
  pending_tests: number
  success_rate: number
  total_runs: number
  avg_duration_ms: number
  critical_issues: number
}

export interface FailingTest {
  test_id: string
  test_name: string
  fail_count: number
  last_error: string
  last_failed_at: string
}

// ============================================================================
// FEATURE TESTS MODULE
// ============================================================================

export async function getFeatureTests(
  filters?: {
    category?: TestCategory
    status?: TestStatus
    is_critical?: boolean
    is_enabled?: boolean
    tags?: string[]
  },
  sortBy: 'name' | 'status' | 'recent' | 'success-rate' = 'name'
): Promise<FeatureTest[]> {
  const supabase = createClient()

  let query = supabase
    .from('feature_tests')
    .select('*')

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.is_critical !== undefined) {
    query = query.eq('is_critical', filters.is_critical)
  }

  if (filters?.is_enabled !== undefined) {
    query = query.eq('is_enabled', filters.is_enabled)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  // Sorting
  switch (sortBy) {
    case 'status':
      query = query.order('status', { ascending: true })
      break
    case 'recent':
      query = query.order('last_tested_at', { ascending: false, nullsFirst: false })
      break
    case 'success-rate':
      query = query.order('success_rate', { ascending: false })
      break
    default:
      query = query.order('name', { ascending: true })
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getFeatureTest(testId: string): Promise<FeatureTest | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_tests')
    .select('*')
    .eq('id', testId)
    .single()

  if (error) throw error
  return data
}

export async function getFeatureTestByPath(path: string): Promise<FeatureTest | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_tests')
    .select('*')
    .eq('path', path)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createFeatureTest(testData: {
  name: string
  path: string
  category: TestCategory
  description: string
  timeout_ms?: number
  retry_count?: number
  is_critical?: boolean
  tags?: string[]
  metadata?: Metadata
}): Promise<FeatureTest> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_tests')
    .insert(testData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFeatureTest(
  testId: string,
  updates: Partial<FeatureTest>
): Promise<FeatureTest> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_tests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', testId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFeatureTest(testId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('feature_tests')
    .delete()
    .eq('id', testId)

  if (error) throw error
}

export async function getCriticalTests(): Promise<FeatureTest[]> {
  return getFeatureTests({ is_critical: true, is_enabled: true }, 'status')
}

export async function getFailedTests(): Promise<FeatureTest[]> {
  return getFeatureTests({ status: 'failed', is_enabled: true }, 'recent')
}

// ============================================================================
// TEST RUNS MODULE
// ============================================================================

export async function createTestRun(runData: {
  test_id: string
  suite_id?: string
  result: TestResult
  duration_ms: number
  started_at: string
  completed_at: string
  environment?: Environment
  browser?: string
  os?: string
  error_message?: string
  stack_trace?: string
  screenshots?: JsonValue[]
  logs?: JsonValue[]
  metadata?: Metadata
}): Promise<TestRun> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('test_runs')
    .insert({ ...runData, user_id: user?.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTestRuns(
  testId?: string,
  filters?: {
    suite_id?: string
    result?: TestResult
    environment?: Environment
    limit?: number
  }
): Promise<TestRun[]> {
  const supabase = createClient()

  let query = supabase
    .from('test_runs')
    .select('*')
    .order('started_at', { ascending: false })

  if (testId) {
    query = query.eq('test_id', testId)
  }

  if (filters?.suite_id) {
    query = query.eq('suite_id', filters.suite_id)
  }

  if (filters?.result) {
    query = query.eq('result', filters.result)
  }

  if (filters?.environment) {
    query = query.eq('environment', filters.environment)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getTestRun(runId: string): Promise<TestRun | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (error) throw error
  return data
}

export async function getRecentTestRuns(limit: number = 50): Promise<TestRun[]> {
  return getTestRuns(undefined, { limit })
}

// ============================================================================
// TEST RESULTS MODULE
// ============================================================================

export async function createTestStepResult(resultData: {
  run_id: string
  test_id: string
  step_name: string
  step_order: number
  result: TestResult
  duration_ms: number
  expected_value?: string
  actual_value?: string
  error_message?: string
  screenshot_url?: string
  metadata?: Metadata
}): Promise<TestStepResult> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_results')
    .insert(resultData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTestStepResults(runId: string): Promise<TestStepResult[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('run_id', runId)
    .order('step_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getFailedSteps(runId: string): Promise<TestStepResult[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('run_id', runId)
    .eq('result', 'fail')
    .order('step_order', { ascending: true })

  if (error) throw error
  return data || []
}

// ============================================================================
// TEST ISSUES MODULE
// ============================================================================

export async function createTestIssue(issueData: {
  test_id: string
  run_id?: string
  title: string
  description: string
  severity?: IssueSeverity
  error_type?: string
  error_code?: string
  affected_browsers?: string[]
  affected_os?: string[]
  stack_trace?: string
  metadata?: Metadata
}): Promise<TestIssue> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_issues')
    .insert(issueData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTestIssues(
  testId?: string,
  filters?: {
    severity?: IssueSeverity
    is_resolved?: boolean
    limit?: number
  }
): Promise<TestIssue[]> {
  const supabase = createClient()

  let query = supabase
    .from('test_issues')
    .select('*')
    .order('severity', { ascending: true })
    .order('last_seen_at', { ascending: false })

  if (testId) {
    query = query.eq('test_id', testId)
  }

  if (filters?.severity) {
    query = query.eq('severity', filters.severity)
  }

  if (filters?.is_resolved !== undefined) {
    query = query.eq('is_resolved', filters.is_resolved)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function resolveTestIssue(
  issueId: string,
  resolution_notes?: string
): Promise<TestIssue> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('test_issues')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id,
      resolution_notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', issueId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCriticalIssues(): Promise<TestIssue[]> {
  return getTestIssues(undefined, {
    severity: 'critical',
    is_resolved: false
  })
}

export async function getUnresolvedIssues(): Promise<TestIssue[]> {
  return getTestIssues(undefined, { is_resolved: false })
}

// ============================================================================
// TEST DEPENDENCIES MODULE
// ============================================================================

export async function createTestDependency(dependencyData: {
  test_id: string
  depends_on_test_id?: string
  dependency_name: string
  dependency_type: 'test' | 'service' | 'api' | 'database' | 'external'
  is_required?: boolean
}): Promise<TestDependency> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_dependencies')
    .insert(dependencyData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTestDependencies(testId: string): Promise<TestDependency[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_dependencies')
    .select('*')
    .eq('test_id', testId)

  if (error) throw error
  return data || []
}

export async function deleteTestDependency(dependencyId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('test_dependencies')
    .delete()
    .eq('id', dependencyId)

  if (error) throw error
}

// ============================================================================
// TEST SUITES MODULE
// ============================================================================

export async function createTestSuite(suiteData: {
  name: string
  description?: string
  category: TestCategory
  run_parallel?: boolean
  max_parallel?: number
}): Promise<TestSuite> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_suites')
    .insert(suiteData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTestSuites(
  category?: TestCategory
): Promise<TestSuite[]> {
  const supabase = createClient()

  let query = supabase
    .from('test_suites')
    .select('*')
    .order('name', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function updateTestSuite(
  suiteId: string,
  updates: Partial<TestSuite>
): Promise<TestSuite> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_suites')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', suiteId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// STATISTICS & ANALYTICS MODULE
// ============================================================================

export async function getTestStatistics(
  category?: TestCategory,
  days: number = 7
): Promise<TestStatistics | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_test_statistics', {
      p_category: category,
      p_days: days
    })

  if (error) throw error
  return data?.[0] || null
}

export async function getFailingTests(
  limit: number = 10
): Promise<FailingTest[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_failing_tests', { p_limit: limit })

  if (error) throw error
  return data || []
}

export async function getTestHealthScore(): Promise<number> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_test_health_score')

  if (error) throw error
  return data || 0
}

export async function getTestCoverage(
  category?: TestCategory,
  date?: string
): Promise<TestCoverage[]> {
  const supabase = createClient()

  let query = supabase
    .from('test_coverage')
    .select('*')
    .order('date', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  if (date) {
    query = query.eq('date', date)
  } else {
    query = query.limit(30) // Last 30 days by default
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getTestTrends(
  testId: string,
  days: number = 30
): Promise<TestRun[]> {
  const supabase = createClient()

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - days)

  const { data, error } = await supabase
    .from('test_runs')
    .select('*')
    .eq('test_id', testId)
    .gte('started_at', sinceDate.toISOString())
    .order('started_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ============================================================================
// EXPORT MODULE
// ============================================================================

export async function exportTestResults(
  filters?: {
    test_id?: string
    result?: TestResult
    environment?: Environment
    start_date?: string
    end_date?: string
  }
): Promise<string> {
  const supabase = createClient()

  let query = supabase
    .from('test_runs')
    .select('*')
    .order('started_at', { ascending: false })

  if (filters?.test_id) {
    query = query.eq('test_id', filters.test_id)
  }

  if (filters?.result) {
    query = query.eq('result', filters.result)
  }

  if (filters?.environment) {
    query = query.eq('environment', filters.environment)
  }

  if (filters?.start_date) {
    query = query.gte('started_at', filters.start_date)
  }

  if (filters?.end_date) {
    query = query.lte('started_at', filters.end_date)
  }

  const { data, error } = await query

  if (error) throw error

  if (!data || data.length === 0) {
    return 'No test results found'
  }

  // Convert to CSV
  const headers = ['Test ID', 'Result', 'Duration (ms)', 'Environment', 'Started At', 'Error']
  const rows = data.map(run => [
    run.test_id,
    run.result,
    run.duration_ms,
    run.environment,
    run.started_at,
    run.error_message || ''
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}

export async function exportTestIssues(): Promise<string> {
  const issues = await getUnresolvedIssues()

  if (issues.length === 0) {
    return 'No unresolved issues found'
  }

  // Convert to CSV
  const headers = ['Test ID', 'Title', 'Severity', 'Occurrence Count', 'First Seen', 'Last Seen']
  const rows = issues.map(issue => [
    issue.test_id,
    issue.title,
    issue.severity,
    issue.occurrence_count,
    issue.first_seen_at,
    issue.last_seen_at
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}
