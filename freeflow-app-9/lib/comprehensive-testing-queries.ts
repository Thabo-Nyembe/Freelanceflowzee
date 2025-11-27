/**
 * Comprehensive Testing Queries
 *
 * Extended testing system focusing on button-level functionality testing.
 * Leverages the Feature Testing schema (feature_tests, test_runs, test_results, test_issues).
 *
 * Key Features:
 * - Button-level test tracking (stored as test_results steps)
 * - Feature categorization and icon mapping
 * - Comprehensive test execution with button validation
 * - Test statistics and coverage by category
 * - Integration with existing Feature Testing infrastructure
 */

import { createClient } from '@/lib/supabase/client'
import {
  getFeatureTests,
  getFeatureTest,
  createFeatureTest,
  updateFeatureTest,
  createTestRun,
  createTestStepResult,
  getTestRuns,
  getTestStepResults,
  createTestIssue,
  getTestIssues,
  type FeatureTest,
  type TestRun,
  type TestStepResult,
  type TestCategory,
  type TestStatus,
  type TestResult
} from './feature-testing-queries'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ComprehensiveFeatureTest extends FeatureTest {
  buttons?: string[]
  icon_name?: string
  last_tested?: string
}

export interface ButtonTestResult {
  button_name: string
  result: TestResult
  duration_ms: number
  error_message?: string
}

export interface ComprehensiveTestRun extends TestRun {
  button_results?: ButtonTestResult[]
}

export interface CategoryStatistics {
  category: TestCategory
  total_tests: number
  passed_tests: number
  failed_tests: number
  pending_tests: number
  total_buttons: number
  tested_buttons: number
  success_rate: number
}

export interface ComprehensiveTestSummary {
  total_tests: number
  passed_tests: number
  failed_tests: number
  warning_tests: number
  pending_tests: number
  total_buttons: number
  tested_buttons: number
  passed_buttons: number
  failed_buttons: number
  overall_success_rate: number
  category_stats: CategoryStatistics[]
}

// ============================================================================
// COMPREHENSIVE FEATURE TESTS MODULE
// ============================================================================

/**
 * Get comprehensive feature tests with button tracking
 */
export async function getComprehensiveFeatureTests(
  filters?: {
    category?: TestCategory
    status?: TestStatus
    has_buttons?: boolean
  },
  sortBy: 'name' | 'status' | 'recent' | 'buttons' = 'name'
): Promise<ComprehensiveFeatureTest[]> {
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

  // Sorting
  switch (sortBy) {
    case 'status':
      query = query.order('status', { ascending: true })
      break
    case 'recent':
      query = query.order('last_tested_at', { ascending: false, nullsFirst: false })
      break
    case 'buttons':
      // Sort by number of steps/buttons
      query = query.order('total_runs', { ascending: false })
      break
    default:
      query = query.order('name', { ascending: true })
  }

  const { data, error } = await query

  if (error) throw error

  // Map to comprehensive format
  return (data || []).map(test => ({
    ...test,
    buttons: test.metadata?.buttons || [],
    icon_name: test.metadata?.icon_name,
    last_tested: test.last_tested_at
  }))
}

/**
 * Create comprehensive feature test with buttons
 */
export async function createComprehensiveFeatureTest(testData: {
  name: string
  path: string
  category: TestCategory
  description: string
  buttons: string[]
  icon_name?: string
  is_critical?: boolean
  tags?: string[]
}): Promise<ComprehensiveFeatureTest> {
  const { buttons, icon_name, ...baseTestData } = testData

  const test = await createFeatureTest({
    ...baseTestData,
    metadata: {
      buttons,
      icon_name
    }
  })

  return {
    ...test,
    buttons,
    icon_name,
    last_tested: test.last_tested_at
  }
}

/**
 * Update comprehensive feature test including buttons
 */
export async function updateComprehensiveFeatureTest(
  testId: string,
  updates: {
    buttons?: string[]
    icon_name?: string
    status?: TestStatus
    [key: string]: any
  }
): Promise<ComprehensiveFeatureTest> {
  const { buttons, icon_name, ...otherUpdates } = updates

  const test = await updateFeatureTest(testId, {
    ...otherUpdates,
    metadata: {
      ...(buttons && { buttons }),
      ...(icon_name && { icon_name })
    }
  })

  return {
    ...test,
    buttons: test.metadata?.buttons || [],
    icon_name: test.metadata?.icon_name,
    last_tested: test.last_tested_at
  }
}

// ============================================================================
// BUTTON-LEVEL TESTING MODULE
// ============================================================================

/**
 * Execute comprehensive test with button validation
 */
export async function executeComprehensiveTest(
  testId: string,
  buttonResults: ButtonTestResult[],
  environment: 'local' | 'development' | 'staging' | 'production' = 'development'
): Promise<ComprehensiveTestRun> {
  const totalDuration = buttonResults.reduce((sum, btn) => sum + btn.duration_ms, 0)
  const failedButtons = buttonResults.filter(btn => btn.result === 'fail')
  const overallResult: TestResult = failedButtons.length > 0 ? 'fail' : 'pass'

  // Create test run
  const testRun = await createTestRun({
    test_id: testId,
    result: overallResult,
    duration_ms: totalDuration,
    started_at: new Date(Date.now() - totalDuration).toISOString(),
    completed_at: new Date().toISOString(),
    environment,
    metadata: {
      total_buttons: buttonResults.length,
      passed_buttons: buttonResults.filter(btn => btn.result === 'pass').length,
      failed_buttons: failedButtons.length
    }
  })

  // Create step results for each button
  for (let i = 0; i < buttonResults.length; i++) {
    const button = buttonResults[i]
    await createTestStepResult({
      run_id: testRun.id,
      test_id: testId,
      step_name: button.button_name,
      step_order: i + 1,
      result: button.result,
      duration_ms: button.duration_ms,
      error_message: button.error_message
    })
  }

  // Create issues for failed buttons
  for (const failedButton of failedButtons) {
    await createTestIssue({
      test_id: testId,
      run_id: testRun.id,
      title: `Button "${failedButton.button_name}" failed`,
      description: failedButton.error_message || 'Button test failed',
      severity: 'high',
      error_type: 'button_failure',
      metadata: {
        button_name: failedButton.button_name,
        duration_ms: failedButton.duration_ms
      }
    })
  }

  return {
    ...testRun,
    button_results: buttonResults
  }
}

/**
 * Get button test results for a test run
 */
export async function getButtonTestResults(runId: string): Promise<ButtonTestResult[]> {
  const stepResults = await getTestStepResults(runId)

  return stepResults.map(step => ({
    button_name: step.step_name,
    result: step.result,
    duration_ms: step.duration_ms,
    error_message: step.error_message
  }))
}

/**
 * Get button failure rate for a test
 */
export async function getButtonFailureRate(testId: string): Promise<{
  button_name: string
  total_runs: number
  failures: number
  failure_rate: number
}[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_results')
    .select('step_name, result')
    .eq('test_id', testId)

  if (error) throw error

  // Group by button name and count failures
  const buttonStats = new Map<string, { total: number; failures: number }>()

  for (const result of data || []) {
    const stats = buttonStats.get(result.step_name) || { total: 0, failures: 0 }
    stats.total++
    if (result.result === 'fail') {
      stats.failures++
    }
    buttonStats.set(result.step_name, stats)
  }

  return Array.from(buttonStats.entries()).map(([button_name, stats]) => ({
    button_name,
    total_runs: stats.total,
    failures: stats.failures,
    failure_rate: (stats.failures / stats.total) * 100
  }))
}

/**
 * Get most problematic buttons across all tests
 */
export async function getMostProblematicButtons(limit: number = 10): Promise<{
  button_name: string
  test_count: number
  total_failures: number
  failure_rate: number
}[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('test_results')
    .select('step_name, result, test_id')

  if (error) throw error

  // Group by button name across all tests
  const buttonStats = new Map<string, { tests: Set<string>; total: number; failures: number }>()

  for (const result of data || []) {
    const stats = buttonStats.get(result.step_name) || {
      tests: new Set(),
      total: 0,
      failures: 0
    }
    stats.tests.add(result.test_id)
    stats.total++
    if (result.result === 'fail') {
      stats.failures++
    }
    buttonStats.set(result.step_name, stats)
  }

  return Array.from(buttonStats.entries())
    .map(([button_name, stats]) => ({
      button_name,
      test_count: stats.tests.size,
      total_failures: stats.failures,
      failure_rate: (stats.failures / stats.total) * 100
    }))
    .sort((a, b) => b.total_failures - a.total_failures)
    .slice(0, limit)
}

// ============================================================================
// STATISTICS & ANALYTICS MODULE
// ============================================================================

/**
 * Get comprehensive test summary with button statistics
 */
export async function getComprehensiveTestSummary(): Promise<ComprehensiveTestSummary> {
  const supabase = createClient()

  // Get all tests
  const { data: tests, error: testsError } = await supabase
    .from('feature_tests')
    .select('*')

  if (testsError) throw testsError

  // Get all test results (buttons)
  const { data: results, error: resultsError } = await supabase
    .from('test_results')
    .select('result, test_id')

  if (resultsError) throw resultsError

  // Calculate overall statistics
  const totalTests = tests?.length || 0
  const passedTests = tests?.filter(t => t.status === 'passed').length || 0
  const failedTests = tests?.filter(t => t.status === 'failed').length || 0
  const warningTests = tests?.filter(t => t.status === 'warning').length || 0
  const pendingTests = tests?.filter(t => t.status === 'pending').length || 0

  const totalButtons = results?.length || 0
  const passedButtons = results?.filter(r => r.result === 'pass').length || 0
  const failedButtons = results?.filter(r => r.result === 'fail').length || 0
  const testedButtons = new Set(results?.map(r => r.test_id)).size

  // Calculate category statistics
  const categoryMap = new Map<TestCategory, {
    total: number
    passed: number
    failed: number
    pending: number
    buttons: number
  }>()

  for (const test of tests || []) {
    const stats = categoryMap.get(test.category as TestCategory) || {
      total: 0,
      passed: 0,
      failed: 0,
      pending: 0,
      buttons: 0
    }
    stats.total++
    if (test.status === 'passed') stats.passed++
    if (test.status === 'failed') stats.failed++
    if (test.status === 'pending') stats.pending++

    // Count buttons for this test
    const testButtons = results?.filter(r => r.test_id === test.id).length || 0
    stats.buttons += testButtons

    categoryMap.set(test.category as TestCategory, stats)
  }

  const category_stats: CategoryStatistics[] = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    total_tests: stats.total,
    passed_tests: stats.passed,
    failed_tests: stats.failed,
    pending_tests: stats.pending,
    total_buttons: stats.buttons,
    tested_buttons: stats.buttons, // All buttons that have results are tested
    success_rate: stats.total > 0 ? (stats.passed / stats.total) * 100 : 0
  }))

  return {
    total_tests: totalTests,
    passed_tests: passedTests,
    failed_tests: failedTests,
    warning_tests: warningTests,
    pending_tests: pendingTests,
    total_buttons: totalButtons,
    tested_buttons: testedButtons,
    passed_buttons: passedButtons,
    failed_buttons: failedButtons,
    overall_success_rate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
    category_stats
  }
}

/**
 * Get category-specific statistics
 */
export async function getCategoryStatistics(category: TestCategory): Promise<CategoryStatistics> {
  const summary = await getComprehensiveTestSummary()
  const categoryStat = summary.category_stats.find(s => s.category === category)

  if (!categoryStat) {
    return {
      category,
      total_tests: 0,
      passed_tests: 0,
      failed_tests: 0,
      pending_tests: 0,
      total_buttons: 0,
      tested_buttons: 0,
      success_rate: 0
    }
  }

  return categoryStat
}

/**
 * Get test coverage by category
 */
export async function getTestCoverageByCategory(): Promise<{
  category: TestCategory
  coverage_percentage: number
  tested_features: number
  total_features: number
}[]> {
  const summary = await getComprehensiveTestSummary()

  return summary.category_stats.map(stat => ({
    category: stat.category,
    coverage_percentage: stat.total_tests > 0
      ? ((stat.passed_tests + stat.failed_tests) / stat.total_tests) * 100
      : 0,
    tested_features: stat.passed_tests + stat.failed_tests,
    total_features: stat.total_tests
  }))
}

// ============================================================================
// EXPORT MODULE
// ============================================================================

/**
 * Export comprehensive test report as CSV
 */
export async function exportComprehensiveTestReport(): Promise<string> {
  const tests = await getComprehensiveFeatureTests()
  const summary = await getComprehensiveTestSummary()

  if (!tests || tests.length === 0) {
    return 'No tests found'
  }

  // CSV headers
  const headers = [
    'Name',
    'Category',
    'Status',
    'Success Rate',
    'Total Runs',
    'Passed Runs',
    'Failed Runs',
    'Total Buttons',
    'Path',
    'Last Tested'
  ]

  // CSV rows
  const rows = tests.map(test => [
    test.name,
    test.category,
    test.status,
    `${test.success_rate}%`,
    test.total_runs,
    test.passed_runs,
    test.failed_runs,
    test.buttons?.length || 0,
    test.path,
    test.last_tested || 'Never'
  ])

  // Add summary row
  rows.push([])
  rows.push(['=== SUMMARY ==='])
  rows.push(['Total Tests', summary.total_tests.toString()])
  rows.push(['Passed Tests', summary.passed_tests.toString()])
  rows.push(['Failed Tests', summary.failed_tests.toString()])
  rows.push(['Overall Success Rate', `${summary.overall_success_rate.toFixed(2)}%`])
  rows.push(['Total Buttons', summary.total_buttons.toString()])
  rows.push(['Passed Buttons', summary.passed_buttons.toString()])
  rows.push(['Failed Buttons', summary.failed_buttons.toString()])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}

/**
 * Export button failure report as CSV
 */
export async function exportButtonFailureReport(): Promise<string> {
  const problematicButtons = await getMostProblematicButtons(50)

  if (problematicButtons.length === 0) {
    return 'No button failures found'
  }

  const headers = ['Button Name', 'Test Count', 'Total Failures', 'Failure Rate (%)']
  const rows = problematicButtons.map(btn => [
    btn.button_name,
    btn.test_count,
    btn.total_failures,
    btn.failure_rate.toFixed(2)
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}
