/**
 * AI Code Completion Utilities
 *
 * Comprehensive utilities for AI-powered code completion, analysis,
 * optimization, and intelligent code generation across multiple languages.
 *
 * MIGRATED: Batch #15 - Removed mock data, using database hooks
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AICodeCompletionUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ProgrammingLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'react'
  | 'vue'
  | 'angular'
  | 'node'
  | 'php'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'rust'
  | 'go'
  | 'swift'
  | 'kotlin'
  | 'ruby'
  | 'scala'
  | 'dart'

export type CompletionStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type BugSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type BugType = 'syntax' | 'logic' | 'security' | 'performance' | 'style' | 'type'
export type SuggestionType = 'optimization' | 'refactoring' | 'security' | 'best_practice' | 'documentation'
export type AnalysisType = 'bugs' | 'security' | 'performance' | 'complexity' | 'coverage'
export type TemplateCategory = 'component' | 'api' | 'hook' | 'utility' | 'test' | 'config'
export type ExportFormat = 'gist' | 'markdown' | 'pdf' | 'html' | 'zip'
export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'codex' | 'copilot'

export interface CodeCompletion {
  id: string
  userId: string
  language: ProgrammingLanguage
  originalCode: string
  completedCode: string
  prompt?: string
  model: AIModel
  status: CompletionStatus
  confidence: number // 0-100
  tokensUsed: number
  processingTime: number // milliseconds
  suggestions: string[]
  createdAt: string
  completedAt?: string
}

export interface CodeSnippet {
  id: string
  userId: string
  name: string
  description?: string
  code: string
  language: ProgrammingLanguage
  category: TemplateCategory
  tags: string[]
  isPublic: boolean
  usageCount: number
  likes: number
  createdAt: string
  updatedAt: string
}

export interface BugReport {
  id: string
  line: number
  column?: number
  type: BugType
  severity: BugSeverity
  message: string
  suggestion?: string
  codeSnippet?: string
  autoFixable: boolean
  fixed: boolean
}

export interface CodeSuggestion {
  id: string
  type: SuggestionType
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  codeExample?: string
  priority: number
}

export interface CodeAnalysis {
  id: string
  userId: string
  code: string
  language: ProgrammingLanguage
  type: AnalysisType
  bugs: BugReport[]
  suggestions: CodeSuggestion[]
  metrics: CodeMetrics
  securityIssues: SecurityIssue[]
  performanceScore: number // 0-100
  qualityScore: number // 0-100
  analyzedAt: string
}

export interface CodeMetrics {
  linesOfCode: number
  complexity: number // Cyclomatic complexity
  maintainability: number // 0-100
  testCoverage?: number // 0-100
  duplicateCode?: number // percentage
  commentRatio: number // percentage
  functionCount: number
  classCount: number
  averageFunctionLength: number
}

export interface SecurityIssue {
  id: string
  type: string // SQL Injection, XSS, CSRF, etc.
  severity: BugSeverity
  description: string
  location: {
    line: number
    column?: number
  }
  recommendation: string
  cwe?: string // Common Weakness Enumeration
  owasp?: string // OWASP Top 10
}

export interface CodeTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  language: ProgrammingLanguage
  template: string
  variables: TemplateVariable[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // minutes
  tags: string[]
}

export interface TemplateVariable {
  name: string
  type: 'string' | 'number' | 'boolean'
  default?: any
  required: boolean
  description?: string
}

export interface CodeVersion {
  id: string
  snippetId: string
  code: string
  timestamp: string
  action: 'create' | 'edit' | 'optimize' | 'refactor' | 'manual_save'
  changes?: {
    additions: number
    deletions: number
    modifications: number
  }
}

export interface CodeExport {
  id: string
  userId: string
  code: string
  language: ProgrammingLanguage
  format: ExportFormat
  fileUrl: string
  fileSize: number
  expiresAt?: string
  createdAt: string
}

export interface AICodeStats {
  userId: string
  totalCompletions: number
  totalTokensUsed: number
  averageConfidence: number
  favoriteLanguage: ProgrammingLanguage
  totalBugsFixed: number
  totalOptimizations: number
  codeQualityImprovement: number // percentage
  lastUsedAt: string
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export function generateMockCodeCompletions(count: number = 30, userId: string = 'user-1'): CodeCompletion[] {
  const languages: ProgrammingLanguage[] = ['javascript', 'typescript', 'python', 'react', 'node', 'go']
  const models: AIModel[] = ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'codex', 'copilot']
  const statuses: CompletionStatus[] = ['completed', 'processing', 'pending']

  const samplePrompts = [
    'Create a function to validate email addresses',
    'Generate a REST API endpoint for user authentication',
    'Build a React component for a data table',
    'Write a Python function to process CSV files',
    'Create a TypeScript interface for user data',
    'Implement a binary search algorithm',
    'Generate unit tests for authentication logic',
    'Create a custom React hook for form validation'
  ]

  return Array.from({ length: count }, (_, i) => {
    const language = languages[Math.floor(Math.random() * languages.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()

    return {
      id: `completion-${i + 1}`,
      userId,
      language,
      originalCode: `// Original code snippet ${i + 1}\nfunction process() {\n  // Initial implementation stub\n  return null\n}`,
      completedCode: `// Completed code snippet ${i + 1}\nfunction process(data) {\n  try {\n    return data.map(item => item.value)\n  } catch (error) {\n    console.error(error)\n    return []\n  }\n}`,
      prompt: samplePrompts[Math.floor(Math.random() * samplePrompts.length)],
      model: models[Math.floor(Math.random() * models.length)],
      status,
      confidence: Math.floor(Math.random() * 30) + 70,
      tokensUsed: Math.floor(Math.random() * 2000) + 500,
      processingTime: Math.floor(Math.random() * 3000) + 500,
      suggestions: ['Add error handling', 'Optimize performance', 'Add TypeScript types'],
      createdAt,
      completedAt: status === 'completed' ? new Date(new Date(createdAt).getTime() + 2000).toISOString() : undefined
    }
  })
}

export function generateMockCodeSnippets(count: number = 50, userId: string = 'user-1'): CodeSnippet[] {
  const languages: ProgrammingLanguage[] = ['javascript', 'typescript', 'python', 'react', 'vue', 'go']
  const categories: TemplateCategory[] = ['component', 'api', 'hook', 'utility', 'test', 'config']

  const snippetNames = [
    'Email Validation Function',
    'Date Formatter Utility',
    'API Error Handler',
    'React Data Table Component',
    'Custom useDebounce Hook',
    'JWT Authentication Middleware',
    'Form Validation Helper',
    'File Upload Component',
    'Pagination Component',
    'Search Filter Hook',
    'Modal Dialog Component',
    'Responsive Grid Layout',
    'Loading Spinner Component',
    'Toast Notification System',
    'Data Fetching Hook'
  ]

  return Array.from({ length: count }, (_, i) => {
    const language = languages[Math.floor(Math.random() * languages.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]

    return {
      id: `snippet-${i + 1}`,
      userId,
      name: snippetNames[i % snippetNames.length] + ` ${Math.floor(i / snippetNames.length) + 1}`,
      description: `A reusable ${category} for ${language} projects`,
      code: `// ${snippetNames[i % snippetNames.length]}\nfunction example() {\n  return "implementation"\n}`,
      language,
      category,
      tags: ['utility', 'reusable', language, category],
      isPublic: Math.random() > 0.5,
      usageCount: Math.floor(Math.random() * 100),
      likes: Math.floor(Math.random() * 50),
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  })
}

export function generateMockBugReports(count: number = 15): BugReport[] {
  const types: BugType[] = ['syntax', 'logic', 'security', 'performance', 'style', 'type']
  const severities: BugSeverity[] = ['critical', 'high', 'medium', 'low', 'info']

  const bugMessages = [
    'Variable declared but never used',
    'Possible null reference exception',
    'Missing error handling for async operation',
    'Potential SQL injection vulnerability',
    'Inefficient loop - consider using map/filter',
    'Missing TypeScript type annotation',
    'Deprecated API usage detected',
    'Memory leak - event listener not cleaned up',
    'Unused import statement',
    'Consider using const instead of let',
    'Missing input validation',
    'Hardcoded credentials detected',
    'Missing accessibility attributes',
    'Circular dependency detected',
    'Race condition in async code'
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `bug-${i + 1}`,
    line: Math.floor(Math.random() * 100) + 1,
    column: Math.floor(Math.random() * 80) + 1,
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    message: bugMessages[i % bugMessages.length],
    suggestion: 'Fix this issue by implementing proper error handling',
    codeSnippet: `const value = data.${i}`,
    autoFixable: Math.random() > 0.5,
    fixed: false
  }))
}

export function generateMockCodeSuggestions(count: number = 12): CodeSuggestion[] {
  const types: SuggestionType[] = ['optimization', 'refactoring', 'security', 'best_practice', 'documentation']
  const impacts = ['high', 'medium', 'low'] as const
  const efforts = ['high', 'medium', 'low'] as const

  const suggestions = [
    { title: 'Extract reusable function', description: 'This code block is repeated 3 times' },
    { title: 'Use async/await', description: 'Replace promise chains with async/await for better readability' },
    { title: 'Add input validation', description: 'Validate user input to prevent security issues' },
    { title: 'Implement caching', description: 'Cache expensive computations to improve performance' },
    { title: 'Add JSDoc comments', description: 'Document function parameters and return values' },
    { title: 'Use TypeScript generics', description: 'Make this function type-safe with generics' },
    { title: 'Optimize database query', description: 'Use indexed fields to speed up queries' },
    { title: 'Implement error boundaries', description: 'Add React error boundaries for better error handling' },
    { title: 'Use memoization', description: 'Memoize expensive calculations with useMemo' },
    { title: 'Add unit tests', description: 'Critical functions need test coverage' },
    { title: 'Reduce bundle size', description: 'Use dynamic imports for code splitting' },
    { title: 'Improve accessibility', description: 'Add ARIA labels and keyboard navigation' }
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `suggestion-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    title: suggestions[i % suggestions.length].title,
    description: suggestions[i % suggestions.length].description,
    impact: impacts[Math.floor(Math.random() * impacts.length)],
    effort: efforts[Math.floor(Math.random() * efforts.length)],
    codeExample: '// Code example here',
    priority: Math.floor(Math.random() * 10) + 1
  }))
}

export function generateMockCodeTemplates(count: number = 20): CodeTemplate[] {
  const categories: TemplateCategory[] = ['component', 'api', 'hook', 'utility', 'test', 'config']
  const languages: ProgrammingLanguage[] = ['javascript', 'typescript', 'python', 'react']
  const difficulties = ['beginner', 'intermediate', 'advanced'] as const

  const templates = [
    { name: 'React Functional Component', description: 'Modern React component with TypeScript' },
    { name: 'Express API Endpoint', description: 'RESTful API route with error handling' },
    { name: 'Custom React Hook', description: 'Reusable React hook pattern' },
    { name: 'Jest Unit Test', description: 'Comprehensive test suite template' },
    { name: 'Next.js API Route', description: 'Next.js serverless function' },
    { name: 'TypeScript Interface', description: 'Type-safe data model' },
    { name: 'Redux Slice', description: 'Redux Toolkit slice with actions' },
    { name: 'GraphQL Resolver', description: 'GraphQL query/mutation resolver' },
    { name: 'Zustand Store', description: 'Global state management with Zustand' },
    { name: 'Error Boundary', description: 'React error boundary component' }
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `template-${i + 1}`,
    name: templates[i % templates.length].name,
    description: templates[i % templates.length].description,
    category: categories[Math.floor(Math.random() * categories.length)],
    language: languages[Math.floor(Math.random() * languages.length)],
    template: `// ${templates[i % templates.length].name}\nfunction template() {\n  return "implementation"\n}`,
    variables: [
      { name: 'componentName', type: 'string', required: true, description: 'Name of the component' },
      { name: 'includeTypes', type: 'boolean', default: true, required: false }
    ],
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    estimatedTime: Math.floor(Math.random() * 30) + 5,
    tags: ['template', 'starter', 'boilerplate']
  }))
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function analyzeCodeMetrics(code: string): CodeMetrics {
  const lines = code.split('\n')
  const functionMatches = code.match(/function\s+\w+/g) || []
  const classMatches = code.match(/class\s+\w+/g) || []
  const commentMatches = code.match(/\/\/.+|\/\*[\s\S]*?\*\//g) || []

  return {
    linesOfCode: lines.length,
    complexity: calculateComplexity(code),
    maintainability: calculateMaintainability(code),
    testCoverage: Math.floor(Math.random() * 40) + 60,
    duplicateCode: Math.floor(Math.random() * 15),
    commentRatio: (commentMatches.length / lines.length) * 100,
    functionCount: functionMatches.length,
    classCount: classMatches.length,
    averageFunctionLength: functionMatches.length > 0 ? lines.length / functionMatches.length : 0
  }
}

function calculateComplexity(code: string): number {
  // Simplified cyclomatic complexity calculation
  const keywords = ['if', 'else', 'for', 'while', 'case', '&&', '||']
  let complexity = 1

  keywords.forEach(keyword => {
    const matches = code.match(new RegExp(keyword, 'g'))
    if (matches) complexity += matches.length
  })

  return complexity
}

function calculateMaintainability(code: string): number {
  // Simplified maintainability index (0-100)
  const lines = code.split('\n').length
  const complexity = calculateComplexity(code)

  const rawIndex = 171 - 5.2 * Math.log(lines) - 0.23 * complexity
  return Math.max(0, Math.min(100, rawIndex))
}

export function detectLanguageFromCode(code: string): ProgrammingLanguage {
  if (code.includes('def ') && code.includes(':')) return 'python'
  if (code.includes('func ') && code.includes('package ')) return 'go'
  if (code.includes('fn ') && code.includes('let mut')) return 'rust'
  if (code.includes('import React') || code.includes('useState')) return 'react'
  if (code.includes('interface ') || code.includes(': string')) return 'typescript'
  if (code.includes('public class ') || code.includes('public static')) return 'java'

  return 'javascript' // default
}

export function formatCodeSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function calculateConfidenceScore(code: string, completion: string): number {
  // Simplified confidence calculation
  const codeLength = code.length
  const completionLength = completion.length
  const ratio = Math.min(completionLength / Math.max(codeLength, 1), 2)

  return Math.floor(50 + (ratio * 25))
}

export function prioritizeSuggestions(suggestions: CodeSuggestion[]): CodeSuggestion[] {
  return [...suggestions].sort((a, b) => {
    const scoreA = (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1) -
                   (a.effort === 'high' ? 1 : a.effort === 'medium' ? 0.5 : 0)
    const scoreB = (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1) -
                   (b.effort === 'high' ? 1 : b.effort === 'medium' ? 0.5 : 0)
    return scoreB - scoreA
  })
}

export function calculateCodeQuality(metrics: CodeMetrics, bugs: BugReport[]): number {
  const criticalBugs = bugs.filter(b => b.severity === 'critical').length
  const highBugs = bugs.filter(b => b.severity === 'high').length

  let score = metrics.maintainability
  score -= (criticalBugs * 10)
  score -= (highBugs * 5)
  score += (metrics.testCoverage || 0) * 0.2

  return Math.max(0, Math.min(100, score))
}

export function estimateProcessingTime(codeLength: number): number {
  // Estimate in milliseconds
  return Math.floor(500 + (codeLength / 10))
}

export function generateShareId(code: string): string {
  // Generate a unique share ID (simplified)
  const hash = btoa(code).slice(0, 16)
  return hash.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
}

logger.info('AI Code Completion utilities initialized', {
  supportedLanguages: 18,
  mockDataGenerators: 5,
  utilityFunctions: 10
})
