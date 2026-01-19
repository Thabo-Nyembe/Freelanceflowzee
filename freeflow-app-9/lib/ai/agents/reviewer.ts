/**
 * Reviewer Agent
 *
 * Quality assurance and validation:
 * - Code review and quality assessment
 * - Output validation against requirements
 * - Error detection and correction suggestions
 * - Performance analysis
 * - Security vulnerability detection
 * - Best practices enforcement
 */

import {
  Agent,
  AgentTask,
  AgentResult,
  AgentCapability,
  AgentContext,
  Artifact
} from '../agent-orchestrator'

// Types specific to Reviewer
export interface ReviewResult {
  id: string
  type: ReviewType
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  summary: string
  issues: ReviewIssue[]
  suggestions: Suggestion[]
  metrics: ReviewMetrics
  passesRequirements: boolean
}

export type ReviewType =
  | 'code'
  | 'document'
  | 'output'
  | 'security'
  | 'performance'
  | 'accessibility'
  | 'completeness'

export interface ReviewIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: string
  title: string
  description: string
  location?: {
    file?: string
    line?: number
    column?: number
    snippet?: string
  }
  autoFixable: boolean
  fix?: string
}

export interface Suggestion {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  example?: string
  rationale?: string
}

export interface ReviewMetrics {
  complexity?: number
  maintainability?: number
  testCoverage?: number
  documentation?: number
  security?: number
  performance?: number
  accessibility?: number
  codeQuality?: number
}

export interface ReviewConfig {
  model?: string
  strictMode?: boolean
  categories?: ReviewCategory[]
  thresholds?: Record<string, number>
  rules?: ReviewRule[]
  onIssueFound?: (issue: ReviewIssue) => void
}

export interface ReviewCategory {
  name: string
  weight: number
  enabled: boolean
  rules: ReviewRule[]
}

export interface ReviewRule {
  id: string
  name: string
  description: string
  severity: ReviewIssue['severity']
  category: string
  pattern?: string | RegExp
  check: (content: string, context?: any) => ReviewIssue[]
}

// Default review rules
const DEFAULT_RULES: ReviewRule[] = [
  // Code quality rules
  {
    id: 'console-log',
    name: 'Console Log Detection',
    description: 'Detects console.log statements that should be removed in production',
    severity: 'low',
    category: 'code-quality',
    pattern: /console\.(log|debug|info)\s*\(/g,
    check: (content) => {
      const issues: ReviewIssue[] = []
      const regex = /console\.(log|debug|info)\s*\(/g
      let match

      while ((match = regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        issues.push({
          id: `console-log-${lineNumber}`,
          severity: 'low',
          category: 'code-quality',
          title: 'Console statement detected',
          description: 'Remove console statements before production deployment',
          location: { line: lineNumber, snippet: match[0] },
          autoFixable: true,
          fix: '// Removed: ' + match[0]
        })
      }

      return issues
    }
  },
  {
    id: 'todo-comment',
    name: 'TODO Comment Detection',
    description: 'Detects TODO comments that need to be addressed',
    severity: 'info',
    category: 'completeness',
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX):/gi,
    check: (content) => {
      const issues: ReviewIssue[] = []
      const regex = /\/\/\s*(TODO|FIXME|HACK|XXX):\s*(.+)/gi
      let match

      while ((match = regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        issues.push({
          id: `todo-${lineNumber}`,
          severity: match[1].toUpperCase() === 'FIXME' ? 'medium' : 'info',
          category: 'completeness',
          title: `${match[1].toUpperCase()} comment found`,
          description: match[2].trim(),
          location: { line: lineNumber, snippet: match[0] },
          autoFixable: false
        })
      }

      return issues
    }
  },
  // Security rules
  {
    id: 'hardcoded-secret',
    name: 'Hardcoded Secret Detection',
    description: 'Detects potential hardcoded secrets and credentials',
    severity: 'critical',
    category: 'security',
    check: (content) => {
      const issues: ReviewIssue[] = []
      const patterns = [
        { regex: /(['"])(api[_-]?key|apikey|api[_-]?secret)(['"])\s*[:=]\s*(['"])([^'"]+)\4/gi, type: 'API Key' },
        { regex: /(['"])(password|passwd|pwd|secret)(['"])\s*[:=]\s*(['"])([^'"]+)\4/gi, type: 'Password' },
        { regex: /(['"])(token|access[_-]?token|auth[_-]?token)(['"])\s*[:=]\s*(['"])([^'"]+)\4/gi, type: 'Token' },
        { regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g, type: 'Private Key' }
      ]

      patterns.forEach(({ regex, type }) => {
        let match
        while ((match = regex.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length
          issues.push({
            id: `secret-${type.toLowerCase().replace(' ', '-')}-${lineNumber}`,
            severity: 'critical',
            category: 'security',
            title: `Potential hardcoded ${type}`,
            description: `Found what appears to be a hardcoded ${type}. Use environment variables instead.`,
            location: { line: lineNumber, snippet: '[REDACTED]' },
            autoFixable: false
          })
        }
      })

      return issues
    }
  },
  {
    id: 'sql-injection',
    name: 'SQL Injection Detection',
    description: 'Detects potential SQL injection vulnerabilities',
    severity: 'critical',
    category: 'security',
    check: (content) => {
      const issues: ReviewIssue[] = []
      const patterns = [
        /query\s*\(\s*[`'"].*\$\{/g,
        /execute\s*\(\s*[`'"].*\+/g,
        /raw\s*\(\s*[`'"].*\$\{/g
      ]

      patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length
          issues.push({
            id: `sql-injection-${lineNumber}`,
            severity: 'critical',
            category: 'security',
            title: 'Potential SQL injection vulnerability',
            description: 'Use parameterized queries instead of string concatenation/interpolation',
            location: { line: lineNumber, snippet: match[0].substring(0, 50) },
            autoFixable: false
          })
        }
      })

      return issues
    }
  },
  {
    id: 'xss-vulnerability',
    name: 'XSS Vulnerability Detection',
    description: 'Detects potential XSS vulnerabilities',
    severity: 'high',
    category: 'security',
    check: (content) => {
      const issues: ReviewIssue[] = []
      const patterns = [
        { regex: /innerHTML\s*=\s*[^'"]/g, type: 'innerHTML assignment' },
        { regex: /dangerouslySetInnerHTML/g, type: 'dangerouslySetInnerHTML' },
        { regex: /document\.write\s*\(/g, type: 'document.write' }
      ]

      patterns.forEach(({ regex, type }) => {
        let match
        while ((match = regex.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length
          issues.push({
            id: `xss-${lineNumber}`,
            severity: 'high',
            category: 'security',
            title: `Potential XSS vulnerability: ${type}`,
            description: 'Avoid direct HTML manipulation. Sanitize user input before rendering.',
            location: { line: lineNumber, snippet: match[0] },
            autoFixable: false
          })
        }
      })

      return issues
    }
  },
  // Performance rules
  {
    id: 'large-loop',
    name: 'Large Loop Detection',
    description: 'Detects potentially inefficient loops',
    severity: 'medium',
    category: 'performance',
    check: (content) => {
      const issues: ReviewIssue[] = []
      const patterns = [
        /for\s*\([^)]*\.length[^)]*\)\s*\{[^}]*\.length/g,
        /\.forEach\([^)]+\)\s*\{[^}]*\.forEach/g
      ]

      patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length
          issues.push({
            id: `nested-loop-${lineNumber}`,
            severity: 'medium',
            category: 'performance',
            title: 'Nested loop detected',
            description: 'Consider optimizing nested loops for better performance',
            location: { line: lineNumber },
            autoFixable: false
          })
        }
      })

      return issues
    }
  },
  // Accessibility rules
  {
    id: 'missing-alt',
    name: 'Missing Alt Text',
    description: 'Detects images missing alt attributes',
    severity: 'medium',
    category: 'accessibility',
    check: (content) => {
      const issues: ReviewIssue[] = []
      const regex = /<img(?![^>]*\balt\s*=)[^>]*>/gi

      let match
      while ((match = regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        issues.push({
          id: `missing-alt-${lineNumber}`,
          severity: 'medium',
          category: 'accessibility',
          title: 'Image missing alt attribute',
          description: 'Add descriptive alt text for screen readers',
          location: { line: lineNumber, snippet: match[0].substring(0, 50) },
          autoFixable: true,
          fix: match[0].replace('<img', '<img alt=""')
        })
      }

      return issues
    }
  }
]

// Reviewer capabilities
const REVIEWER_CAPABILITIES: AgentCapability[] = [
  {
    name: 'review_code',
    description: 'Review code for quality, security, and best practices',
    inputSchema: {
      code: 'string',
      language: 'string (optional)',
      context: 'object (optional)'
    },
    outputSchema: {
      reviewResult: 'ReviewResult'
    }
  },
  {
    name: 'review_output',
    description: 'Review task output against requirements',
    inputSchema: {
      output: 'any',
      requirements: 'string[]',
      context: 'object (optional)'
    },
    outputSchema: {
      reviewResult: 'ReviewResult'
    }
  },
  {
    name: 'security_audit',
    description: 'Perform security audit on code or configuration',
    inputSchema: {
      content: 'string',
      type: 'string'
    },
    outputSchema: {
      issues: 'ReviewIssue[]',
      riskLevel: 'string'
    }
  },
  {
    name: 'suggest_improvements',
    description: 'Generate improvement suggestions',
    inputSchema: {
      content: 'string',
      focus: 'string[]'
    },
    outputSchema: {
      suggestions: 'Suggestion[]'
    }
  },
  {
    name: 'validate_requirements',
    description: 'Validate output against requirements',
    inputSchema: {
      output: 'any',
      requirements: 'Requirement[]'
    },
    outputSchema: {
      passes: 'boolean',
      results: 'ValidationResult[]'
    }
  }
]

/**
 * Create Reviewer Agent
 */
export function createReviewerAgent(config: ReviewConfig = {}): Agent {
  const rules = [...DEFAULT_RULES, ...(config.rules || [])]

  const context: AgentContext = {
    memory: new Map(),
    conversationHistory: [],
    tools: [],
    constraints: {
      maxIterations: 10,
      timeout: 60000
    }
  }

  const execute = async (task: AgentTask): Promise<AgentResult> => {
    const startTime = Date.now()
    let tokensUsed = 0
    const artifacts: Artifact[] = []

    try {
      let output: any

      switch (task.type) {
        case 'review':
          output = await performReview(task.input, rules, config)
          break
        case 'code_review':
          output = await reviewCode(task.input, rules, config)
          break
        case 'security_audit':
          output = await securityAudit(task.input, rules, config)
          break
        case 'validate':
          output = await validateOutput(task.input, config)
          break
        case 'suggest':
          output = await generateSuggestions(task.input, config)
          break
        case 'feedback':
          output = await processFeedback(task.input)
          break
        default:
          output = await performReview(task.input, rules, config)
      }

      tokensUsed = estimateTokens(JSON.stringify(output))

      // Create review report artifact
      if (output.issues || output.suggestions || output.reviewResult) {
        artifacts.push({
          id: `review-${Date.now()}`,
          type: 'document',
          name: 'review_report.json',
          content: output,
          metadata: { format: 'json', type: 'review' }
        })
      }

      return {
        taskId: task.id,
        success: true,
        output,
        metrics: {
          duration: Date.now() - startTime,
          tokensUsed,
          iterations: 1,
          toolCalls: 0
        },
        artifacts
      }
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Review failed',
        metrics: {
          duration: Date.now() - startTime,
          tokensUsed,
          iterations: 1,
          toolCalls: 0
        }
      }
    }
  }

  return {
    id: 'reviewer-agent',
    name: 'Quality Reviewer',
    role: 'reviewer',
    description: 'Specialized agent for code review, quality assurance, and security auditing',
    capabilities: REVIEWER_CAPABILITIES,
    status: 'idle',
    context,
    execute
  }
}

// Review functions

async function performReview(
  input: {
    content: string
    type?: ReviewType
    requirements?: string[]
    context?: Record<string, any>
  },
  rules: ReviewRule[],
  config: ReviewConfig
): Promise<ReviewResult> {
  const { content, type = 'code', requirements = [] } = input

  // Collect all issues from rules
  const allIssues: ReviewIssue[] = []

  for (const rule of rules) {
    const issues = rule.check(content, input.context)
    issues.forEach(issue => {
      config.onIssueFound?.(issue)
      allIssues.push(issue)
    })
  }

  // Generate suggestions
  const suggestions = generateImprovementSuggestions(content, allIssues)

  // Calculate metrics
  const metrics = calculateMetrics(content, allIssues)

  // Calculate score
  const score = calculateScore(allIssues, metrics, config.thresholds)

  // Check requirements
  const passesRequirements = requirements.length === 0 ||
    checkRequirements(content, requirements, allIssues)

  return {
    id: `review-${Date.now()}`,
    type,
    score,
    grade: scoreToGrade(score),
    summary: generateSummary(allIssues, score, type),
    issues: allIssues,
    suggestions,
    metrics,
    passesRequirements
  }
}

async function reviewCode(
  input: {
    code: string
    language?: string
    requirements?: string[]
    context?: Record<string, any>
  },
  rules: ReviewRule[],
  config: ReviewConfig
): Promise<ReviewResult> {
  return performReview({
    content: input.code,
    type: 'code',
    requirements: input.requirements,
    context: { ...input.context, language: input.language }
  }, rules, config)
}

async function securityAudit(
  input: { content: string; type?: string },
  rules: ReviewRule[],
  config: ReviewConfig
): Promise<{ issues: ReviewIssue[]; riskLevel: string; recommendations: string[] }> {
  // Filter to security rules only
  const securityRules = rules.filter(r => r.category === 'security')

  const issues: ReviewIssue[] = []
  for (const rule of securityRules) {
    issues.push(...rule.check(input.content))
  }

  // Calculate risk level
  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const highCount = issues.filter(i => i.severity === 'high').length

  let riskLevel: string
  if (criticalCount > 0) {
    riskLevel = 'critical'
  } else if (highCount > 2) {
    riskLevel = 'high'
  } else if (highCount > 0 || issues.length > 5) {
    riskLevel = 'medium'
  } else if (issues.length > 0) {
    riskLevel = 'low'
  } else {
    riskLevel = 'none'
  }

  // Generate recommendations
  const recommendations = generateSecurityRecommendations(issues)

  return { issues, riskLevel, recommendations }
}

async function validateOutput(
  input: {
    output: any
    requirements: Array<{ id: string; description: string; validator?: (output: any) => boolean }>
  },
  config: ReviewConfig
): Promise<{
  passes: boolean
  results: Array<{ requirementId: string; passed: boolean; message: string }>
}> {
  const { output, requirements } = input
  const results: Array<{ requirementId: string; passed: boolean; message: string }> = []

  for (const req of requirements) {
    let passed: boolean
    let message: string

    if (req.validator) {
      try {
        passed = req.validator(output)
        message = passed ? 'Requirement met' : 'Requirement not met'
      } catch (error) {
        passed = false
        message = `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    } else {
      // Simple string matching check
      const outputStr = JSON.stringify(output).toLowerCase()
      const reqKeywords = req.description.toLowerCase().split(' ')
        .filter(w => w.length > 3)
      passed = reqKeywords.some(k => outputStr.includes(k))
      message = passed ? 'Output appears to address requirement' : 'Could not verify requirement'
    }

    results.push({ requirementId: req.id, passed, message })
  }

  const passes = results.every(r => r.passed)

  return { passes, results }
}

async function generateSuggestions(
  input: { content: string; focus?: string[] },
  config: ReviewConfig
): Promise<{ suggestions: Suggestion[] }> {
  const { content, focus = [] } = input
  const suggestions: Suggestion[] = []

  // Documentation suggestions
  if (focus.length === 0 || focus.includes('documentation')) {
    const docComments = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
    const functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(/g) || []).length

    if (functions > 0 && docComments < functions / 2) {
      suggestions.push({
        id: 'add-docs',
        priority: 'medium',
        category: 'documentation',
        title: 'Add documentation comments',
        description: 'Many functions are missing JSDoc comments. Adding documentation improves maintainability.',
        example: '/**\n * Description of function\n * @param {type} param - Description\n * @returns {type} Description\n */'
      })
    }
  }

  // Type safety suggestions
  if (focus.length === 0 || focus.includes('type-safety')) {
    const anyCount = (content.match(/:\s*any\b/g) || []).length
    if (anyCount > 3) {
      suggestions.push({
        id: 'reduce-any',
        priority: 'high',
        category: 'type-safety',
        title: 'Reduce use of "any" type',
        description: `Found ${anyCount} uses of "any" type. Consider using more specific types for better type safety.`,
        rationale: 'Specific types catch errors at compile time and improve IDE support.'
      })
    }
  }

  // Error handling suggestions
  if (focus.length === 0 || focus.includes('error-handling')) {
    const asyncFunctions = (content.match(/async\s+function|async\s*\(/g) || []).length
    const tryCatch = (content.match(/try\s*\{/g) || []).length

    if (asyncFunctions > tryCatch) {
      suggestions.push({
        id: 'add-error-handling',
        priority: 'high',
        category: 'error-handling',
        title: 'Add error handling for async operations',
        description: 'Some async functions may be missing try-catch blocks.',
        example: 'try {\n  await asyncOperation();\n} catch (error) {\n  // Handle error\n}'
      })
    }
  }

  // Testing suggestions
  if (focus.length === 0 || focus.includes('testing')) {
    const exportedFunctions = (content.match(/export\s+(?:async\s+)?function/g) || []).length
    if (exportedFunctions > 0) {
      suggestions.push({
        id: 'add-tests',
        priority: 'medium',
        category: 'testing',
        title: 'Consider adding unit tests',
        description: `Found ${exportedFunctions} exported functions. Ensure each has corresponding test coverage.`,
        rationale: 'Unit tests catch regressions and document expected behavior.'
      })
    }
  }

  return { suggestions }
}

async function processFeedback(input: {
  originalTask: AgentTask
  error?: string
  output?: any
}): Promise<{ correctedTask?: AgentTask; suggestions: string[] }> {
  const { originalTask, error, output } = input
  const suggestions: string[] = []

  if (error) {
    suggestions.push(`Error occurred: ${error}`)

    // Analyze error and suggest corrections
    if (error.includes('timeout')) {
      suggestions.push('Consider increasing timeout or breaking task into smaller chunks')
      return {
        correctedTask: {
          ...originalTask,
          id: `retry-${originalTask.id}`,
          metadata: { ...originalTask.metadata, timeout: 120000 }
        },
        suggestions
      }
    }

    if (error.includes('not found')) {
      suggestions.push('Verify that required resources exist before proceeding')
    }

    if (error.includes('permission')) {
      suggestions.push('Check permissions and access rights')
    }
  }

  if (output && typeof output === 'object') {
    // Analyze output for issues
    const outputStr = JSON.stringify(output)

    if (outputStr.includes('error') || outputStr.includes('failed')) {
      suggestions.push('Output contains error indicators - review and retry with corrections')
    }

    if (outputStr.length < 50) {
      suggestions.push('Output seems minimal - verify completeness')
    }
  }

  return { suggestions }
}

// Helper functions

function generateImprovementSuggestions(content: string, issues: ReviewIssue[]): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Group issues by category
  const issuesByCategory = new Map<string, ReviewIssue[]>()
  issues.forEach(issue => {
    if (!issuesByCategory.has(issue.category)) {
      issuesByCategory.set(issue.category, [])
    }
    issuesByCategory.get(issue.category)!.push(issue)
  })

  // Generate category-specific suggestions
  issuesByCategory.forEach((categoryIssues, category) => {
    if (categoryIssues.length >= 3) {
      suggestions.push({
        id: `refactor-${category}`,
        priority: 'medium',
        category,
        title: `Address multiple ${category} issues`,
        description: `Found ${categoryIssues.length} issues in this category. Consider a focused refactoring session.`,
        rationale: 'Batch fixing related issues is more efficient than addressing them individually.'
      })
    }
  })

  return suggestions
}

function calculateMetrics(content: string, issues: ReviewIssue[]): ReviewMetrics {
  const lines = content.split('\n').length

  // Security score
  const securityIssues = issues.filter(i => i.category === 'security')
  const security = Math.max(0, 100 - securityIssues.length * 20)

  // Code quality score
  const qualityIssues = issues.filter(i => i.category === 'code-quality')
  const codeQuality = Math.max(0, 100 - qualityIssues.length * 10)

  // Maintainability (based on complexity indicators)
  const complexityIndicators = (content.match(/if|else|for|while|switch|case|\?/g) || []).length
  const maintainability = Math.max(0, 100 - Math.min(50, complexityIndicators / lines * 100))

  // Documentation score
  const comments = (content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length
  const documentation = Math.min(100, comments / lines * 200)

  // Accessibility score
  const a11yIssues = issues.filter(i => i.category === 'accessibility')
  const accessibility = Math.max(0, 100 - a11yIssues.length * 15)

  // Performance score
  const perfIssues = issues.filter(i => i.category === 'performance')
  const performance = Math.max(0, 100 - perfIssues.length * 15)

  return {
    security,
    codeQuality,
    maintainability,
    documentation,
    accessibility,
    performance,
    complexity: complexityIndicators
  }
}

function calculateScore(
  issues: ReviewIssue[],
  metrics: ReviewMetrics,
  thresholds?: Record<string, number>
): number {
  // Weighted scoring
  const weights = {
    security: 0.25,
    codeQuality: 0.2,
    maintainability: 0.15,
    documentation: 0.1,
    accessibility: 0.15,
    performance: 0.15
  }

  let weightedScore = 0
  let totalWeight = 0

  Object.entries(weights).forEach(([metric, weight]) => {
    const value = metrics[metric as keyof ReviewMetrics]
    if (typeof value === 'number') {
      weightedScore += value * weight
      totalWeight += weight
    }
  })

  // Penalty for critical/high severity issues
  const criticalPenalty = issues.filter(i => i.severity === 'critical').length * 10
  const highPenalty = issues.filter(i => i.severity === 'high').length * 5

  const finalScore = Math.max(0, Math.round(weightedScore / totalWeight - criticalPenalty - highPenalty))

  return finalScore
}

function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

function generateSummary(issues: ReviewIssue[], score: number, type: ReviewType): string {
  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const highCount = issues.filter(i => i.severity === 'high').length
  const totalCount = issues.length

  let summary = `${type.charAt(0).toUpperCase() + type.slice(1)} review completed with score ${score}/100. `

  if (criticalCount > 0) {
    summary += `Found ${criticalCount} critical issue(s) requiring immediate attention. `
  }

  if (highCount > 0) {
    summary += `Found ${highCount} high-priority issue(s). `
  }

  if (totalCount === 0) {
    summary += 'No issues detected.'
  } else if (totalCount > 10) {
    summary += `Total of ${totalCount} issues found - consider a comprehensive review.`
  } else {
    summary += `${totalCount} issue(s) total.`
  }

  return summary
}

function checkRequirements(
  content: string,
  requirements: string[],
  issues: ReviewIssue[]
): boolean {
  // Check if critical issues exist
  if (issues.some(i => i.severity === 'critical')) {
    return false
  }

  // Simple requirement checking
  const contentLower = content.toLowerCase()

  return requirements.every(req => {
    const keywords = req.toLowerCase().split(' ').filter(w => w.length > 3)
    return keywords.some(k => contentLower.includes(k))
  })
}

function generateSecurityRecommendations(issues: ReviewIssue[]): string[] {
  const recommendations: string[] = []

  const categories = new Set(issues.map(i => i.title))

  if (categories.has('Potential hardcoded API Key') || categories.has('Potential hardcoded Password')) {
    recommendations.push('Use environment variables for all secrets and credentials')
    recommendations.push('Consider using a secrets management service')
  }

  if (categories.has('Potential SQL injection vulnerability')) {
    recommendations.push('Always use parameterized queries')
    recommendations.push('Implement input validation and sanitization')
  }

  if (categories.has('Potential XSS vulnerability: dangerouslySetInnerHTML')) {
    recommendations.push('Sanitize all user-generated content before rendering')
    recommendations.push('Use a library like DOMPurify for HTML sanitization')
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue following security best practices')
    recommendations.push('Regular security audits are recommended')
  }

  return recommendations
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export {
  ReviewResult,
  ReviewType,
  ReviewIssue,
  Suggestion,
  ReviewMetrics,
  ReviewConfig,
  ReviewRule
}
