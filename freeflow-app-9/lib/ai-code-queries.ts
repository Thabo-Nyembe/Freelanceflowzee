/**
 * AI Code Completion Query Library
 *
 * CRUD operations for AI Code Completion System:
 * - Code Completions (8 functions)
 * - Code Snippets (9 functions)
 * - Code Analysis (5 functions)
 * - Bug Reports (4 functions)
 * - Code Suggestions (3 functions)
 * - Security Issues (3 functions)
 * - Statistics (3 functions)
 *
 * Total: 35 functions
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ProgrammingLanguage =
  | 'javascript' | 'typescript' | 'python' | 'react' | 'vue' | 'angular'
  | 'node' | 'php' | 'java' | 'csharp' | 'cpp' | 'rust' | 'go' | 'swift'
  | 'kotlin' | 'ruby' | 'scala' | 'dart'

export type CompletionStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type BugSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type BugType = 'syntax' | 'logic' | 'security' | 'performance' | 'style' | 'type'
export type SuggestionType = 'optimization' | 'refactoring' | 'security' | 'best_practice' | 'documentation'
export type AnalysisType = 'bugs' | 'security' | 'performance' | 'complexity' | 'coverage'
export type TemplateCategory = 'component' | 'api' | 'hook' | 'utility' | 'test' | 'config'
export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'codex' | 'copilot'
export type ImpactLevel = 'high' | 'medium' | 'low'

export interface CodeCompletion {
  id: string
  user_id: string
  language: ProgrammingLanguage
  original_code: string
  completed_code: string
  prompt: string | null
  model: AIModel
  status: CompletionStatus
  confidence: number
  tokens_used: number
  processing_time: number
  suggestions: string[]
  created_at: string
  completed_at: string | null
  updated_at: string
}

export interface CodeSnippet {
  id: string
  user_id: string
  name: string
  description: string | null
  code: string
  language: ProgrammingLanguage
  category: TemplateCategory
  tags: string[]
  is_public: boolean
  usage_count: number
  likes: number
  created_at: string
  updated_at: string
}

export interface CodeAnalysis {
  id: string
  user_id: string
  code: string
  language: ProgrammingLanguage
  type: AnalysisType
  performance_score: number | null
  quality_score: number | null
  lines_of_code: number
  complexity: number
  maintainability: number | null
  test_coverage: number | null
  duplicate_code: number | null
  comment_ratio: number
  function_count: number
  class_count: number
  analyzed_at: string
  created_at: string
  updated_at: string
}

export interface BugReport {
  id: string
  analysis_id: string
  line_number: number
  column_number: number | null
  type: BugType
  severity: BugSeverity
  message: string
  suggestion: string | null
  code_snippet: string | null
  auto_fixable: boolean
  fixed: boolean
  created_at: string
  updated_at: string
}

export interface CodeSuggestion {
  id: string
  analysis_id: string
  type: SuggestionType
  title: string
  description: string
  impact: ImpactLevel
  effort: ImpactLevel
  code_example: string | null
  priority: number
  created_at: string
  updated_at: string
}

export interface SecurityIssue {
  id: string
  analysis_id: string
  type: string
  severity: BugSeverity
  description: string
  line_number: number
  column_number: number | null
  recommendation: string
  cwe: string | null
  owasp: string | null
  created_at: string
  updated_at: string
}

export interface AICodeStats {
  id: string
  user_id: string
  total_completions: number
  total_tokens_used: number
  average_confidence: number
  favorite_language: ProgrammingLanguage | null
  total_bugs_fixed: number
  total_optimizations: number
  code_quality_improvement: number
  last_used_at: string
  created_at: string
  updated_at: string
}

// ============================================================================
// CODE COMPLETIONS (8 functions)
// ============================================================================

export async function getCodeCompletions(
  userId: string,
  filters?: {
    language?: ProgrammingLanguage
    status?: CompletionStatus
    model?: AIModel
  }
): Promise<{ data: CodeCompletion[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('code_completions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.language) {
    query = query.eq('language', filters.language)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.model) {
    query = query.eq('model', filters.model)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getCodeCompletion(
  completionId: string
): Promise<{ data: CodeCompletion | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_completions')
    .select('*')
    .eq('id', completionId)
    .single()

  return { data, error }
}

export async function createCodeCompletion(
  userId: string,
  completion: {
    language: ProgrammingLanguage
    original_code: string
    completed_code: string
    prompt?: string
    model?: AIModel
    confidence?: number
    tokens_used?: number
    processing_time?: number
    suggestions?: string[]
  }
): Promise<{ data: CodeCompletion | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_completions')
    .insert({
      user_id: userId,
      ...completion
    })
    .select()
    .single()

  return { data, error }
}

export async function updateCodeCompletion(
  completionId: string,
  updates: Partial<Omit<CodeCompletion, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: CodeCompletion | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_completions')
    .update(updates)
    .eq('id', completionId)
    .select()
    .single()

  return { data, error }
}

export async function deleteCodeCompletion(
  completionId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('code_completions')
    .delete()
    .eq('id', completionId)

  return { error }
}

export async function getRecentCompletions(
  userId: string,
  limit: number = 10
): Promise<{ data: CodeCompletion[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function getCompletionsByLanguage(
  userId: string,
  language: ProgrammingLanguage
): Promise<{ data: CodeCompletion[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('language', language)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function bulkDeleteCompletions(
  completionIds: string[]
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('code_completions')
    .delete()
    .in('id', completionIds)

  return { error }
}

// ============================================================================
// CODE SNIPPETS (9 functions)
// ============================================================================

export async function getCodeSnippets(
  userId: string,
  filters?: {
    language?: ProgrammingLanguage
    category?: TemplateCategory
    is_public?: boolean
    search?: string
  }
): Promise<{ data: CodeSnippet[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('code_snippets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.language) {
    query = query.eq('language', filters.language)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.is_public !== undefined) {
    query = query.eq('is_public', filters.is_public)
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getCodeSnippet(
  snippetId: string
): Promise<{ data: CodeSnippet | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_snippets')
    .select('*')
    .eq('id', snippetId)
    .single()

  return { data, error }
}

export async function createCodeSnippet(
  userId: string,
  snippet: {
    name: string
    description?: string
    code: string
    language: ProgrammingLanguage
    category: TemplateCategory
    tags?: string[]
    is_public?: boolean
  }
): Promise<{ data: CodeSnippet | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_snippets')
    .insert({
      user_id: userId,
      ...snippet
    })
    .select()
    .single()

  return { data, error }
}

export async function updateCodeSnippet(
  snippetId: string,
  updates: Partial<Omit<CodeSnippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: CodeSnippet | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_snippets')
    .update(updates)
    .eq('id', snippetId)
    .select()
    .single()

  return { data, error }
}

export async function deleteCodeSnippet(
  snippetId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('code_snippets')
    .delete()
    .eq('id', snippetId)

  return { error }
}

export async function incrementSnippetUsage(
  snippetId: string
): Promise<{ data: CodeSnippet | null; error: any }> {
  const supabase = createClient()

  const { data: currentSnippet } = await supabase
    .from('code_snippets')
    .select('usage_count')
    .eq('id', snippetId)
    .single()

  if (!currentSnippet) {
    return { data: null, error: new Error('Snippet not found') }
  }

  const { data, error } = await supabase
    .from('code_snippets')
    .update({
      usage_count: currentSnippet.usage_count + 1
    })
    .eq('id', snippetId)
    .select()
    .single()

  return { data, error }
}

export async function likeSnippet(
  snippetId: string
): Promise<{ data: CodeSnippet | null; error: any }> {
  const supabase = createClient()

  const { data: currentSnippet } = await supabase
    .from('code_snippets')
    .select('likes')
    .eq('id', snippetId)
    .single()

  if (!currentSnippet) {
    return { data: null, error: new Error('Snippet not found') }
  }

  const { data, error } = await supabase
    .from('code_snippets')
    .update({
      likes: currentSnippet.likes + 1
    })
    .eq('id', snippetId)
    .select()
    .single()

  return { data, error }
}

export async function searchSnippetsByTags(
  userId: string,
  tags: string[]
): Promise<{ data: CodeSnippet[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_snippets')
    .select('*')
    .eq('user_id', userId)
    .contains('tags', tags)
    .order('usage_count', { ascending: false })

  return { data, error }
}

export async function getPublicSnippets(
  language?: ProgrammingLanguage,
  limit: number = 20
): Promise<{ data: CodeSnippet[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('code_snippets')
    .select('*')
    .eq('is_public', true)
    .order('likes', { ascending: false })
    .limit(limit)

  if (language) {
    query = query.eq('language', language)
  }

  const { data, error } = await query
  return { data, error }
}

// ============================================================================
// CODE ANALYSIS (5 functions)
// ============================================================================

export async function getCodeAnalyses(
  userId: string,
  filters?: {
    language?: ProgrammingLanguage
    type?: AnalysisType
  }
): Promise<{ data: CodeAnalysis[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('code_analysis')
    .select('*')
    .eq('user_id', userId)
    .order('analyzed_at', { ascending: false })

  if (filters?.language) {
    query = query.eq('language', filters.language)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getCodeAnalysis(
  analysisId: string
): Promise<{ data: CodeAnalysis | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_analysis')
    .select('*')
    .eq('id', analysisId)
    .single()

  return { data, error }
}

export async function createCodeAnalysis(
  userId: string,
  analysis: {
    code: string
    language: ProgrammingLanguage
    type: AnalysisType
    performance_score?: number
    quality_score?: number
    lines_of_code?: number
    complexity?: number
    maintainability?: number
    test_coverage?: number
    duplicate_code?: number
    comment_ratio?: number
    function_count?: number
    class_count?: number
  }
): Promise<{ data: CodeAnalysis | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_analysis')
    .insert({
      user_id: userId,
      ...analysis
    })
    .select()
    .single()

  return { data, error }
}

export async function deleteCodeAnalysis(
  analysisId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('code_analysis')
    .delete()
    .eq('id', analysisId)

  return { error }
}

export async function getAnalysisWithIssues(
  analysisId: string
): Promise<{
  data: {
    analysis: CodeAnalysis | null
    bugs: BugReport[] | null
    suggestions: CodeSuggestion[] | null
    security: SecurityIssue[] | null
  } | null
  error: any
}> {
  const supabase = createClient()

  const [analysisResult, bugsResult, suggestionsResult, securityResult] = await Promise.all([
    supabase.from('code_analysis').select('*').eq('id', analysisId).single(),
    supabase.from('bug_reports').select('*').eq('analysis_id', analysisId),
    supabase.from('code_suggestions').select('*').eq('analysis_id', analysisId),
    supabase.from('security_issues').select('*').eq('analysis_id', analysisId)
  ])

  if (analysisResult.error) {
    return { data: null, error: analysisResult.error }
  }

  return {
    data: {
      analysis: analysisResult.data,
      bugs: bugsResult.data,
      suggestions: suggestionsResult.data,
      security: securityResult.data
    },
    error: null
  }
}

// ============================================================================
// BUG REPORTS (4 functions)
// ============================================================================

export async function getBugReports(
  analysisId: string
): Promise<{ data: BugReport[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bug_reports')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('severity', { ascending: true })
    .order('line_number', { ascending: true })

  return { data, error }
}

export async function createBugReport(
  bug: {
    analysis_id: string
    line_number: number
    column_number?: number
    type: BugType
    severity: BugSeverity
    message: string
    suggestion?: string
    code_snippet?: string
    auto_fixable?: boolean
  }
): Promise<{ data: BugReport | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bug_reports')
    .insert(bug)
    .select()
    .single()

  return { data, error }
}

export async function markBugAsFixed(
  bugId: string
): Promise<{ data: BugReport | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bug_reports')
    .update({ fixed: true })
    .eq('id', bugId)
    .select()
    .single()

  return { data, error }
}

export async function getCriticalBugs(
  userId: string
): Promise<{ data: BugReport[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bug_reports')
    .select('*, code_analysis!inner(user_id)')
    .eq('code_analysis.user_id', userId)
    .eq('severity', 'critical')
    .eq('fixed', false)
    .order('created_at', { ascending: false })

  return { data, error }
}

// ============================================================================
// CODE SUGGESTIONS (3 functions)
// ============================================================================

export async function getCodeSuggestions(
  analysisId: string
): Promise<{ data: CodeSuggestion[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_suggestions')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('priority', { ascending: false })

  return { data, error }
}

export async function createCodeSuggestion(
  suggestion: {
    analysis_id: string
    type: SuggestionType
    title: string
    description: string
    impact: ImpactLevel
    effort: ImpactLevel
    code_example?: string
    priority?: number
  }
): Promise<{ data: CodeSuggestion | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_suggestions')
    .insert(suggestion)
    .select()
    .single()

  return { data, error }
}

export async function getSuggestionsByType(
  userId: string,
  type: SuggestionType
): Promise<{ data: CodeSuggestion[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_suggestions')
    .select('*, code_analysis!inner(user_id)')
    .eq('code_analysis.user_id', userId)
    .eq('type', type)
    .order('priority', { ascending: false })

  return { data, error }
}

// ============================================================================
// SECURITY ISSUES (3 functions)
// ============================================================================

export async function getSecurityIssues(
  analysisId: string
): Promise<{ data: SecurityIssue[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('security_issues')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('severity', { ascending: true })

  return { data, error }
}

export async function createSecurityIssue(
  issue: {
    analysis_id: string
    type: string
    severity: BugSeverity
    description: string
    line_number: number
    column_number?: number
    recommendation: string
    cwe?: string
    owasp?: string
  }
): Promise<{ data: SecurityIssue | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('security_issues')
    .insert(issue)
    .select()
    .single()

  return { data, error }
}

export async function getCriticalSecurityIssues(
  userId: string
): Promise<{ data: SecurityIssue[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('security_issues')
    .select('*, code_analysis!inner(user_id)')
    .eq('code_analysis.user_id', userId)
    .in('severity', ['critical', 'high'])
    .order('severity', { ascending: true })

  return { data, error }
}

// ============================================================================
// STATISTICS (3 functions)
// ============================================================================

export async function getAICodeStats(
  userId: string
): Promise<{ data: AICodeStats | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_code_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export async function getCompletionStats(
  userId: string,
  days: number = 30
): Promise<{ data: any; error: any }> {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('code_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error) {
    return { data: null, error }
  }

  const stats = {
    total_completions: data.length,
    completed_count: data.filter(c => c.status === 'completed').length,
    average_confidence: data.length > 0 ? data.reduce((sum, c) => sum + c.confidence, 0) / data.length : 0,
    total_tokens: data.reduce((sum, c) => sum + c.tokens_used, 0),
    average_processing_time: data.length > 0 ? data.reduce((sum, c) => sum + c.processing_time, 0) / data.length : 0,
    by_language: data.reduce((acc, c) => {
      acc[c.language] = (acc[c.language] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    by_model: data.reduce((acc, c) => {
      acc[c.model] = (acc[c.model] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return { data: stats, error: null }
}

export async function getCodeQualityTrend(
  userId: string,
  limit: number = 10
): Promise<{ data: any; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('code_analysis')
    .select('analyzed_at, quality_score, maintainability, complexity')
    .eq('user_id', userId)
    .order('analyzed_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { data: null, error }
  }

  const trend = data.reverse().map(analysis => ({
    date: analysis.analyzed_at,
    quality: analysis.quality_score || 0,
    maintainability: analysis.maintainability || 0,
    complexity: analysis.complexity || 0
  }))

  return { data: trend, error: null }
}
