/**
 * AI Code API Routes
 *
 * REST endpoints for AI Code Completion System:
 * GET - Completions, snippets, analyses, bug reports, suggestions, security issues, stats
 * POST - Create completions, snippets, analyses, bugs, suggestions, security issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-code')
import {
  getCodeCompletions,
  createCodeCompletion,
  getRecentCompletions,
  getCompletionsByLanguage,
  getCodeSnippets,
  createCodeSnippet,
  getPublicSnippets,
  searchSnippetsByTags,
  getCodeAnalyses,
  createCodeAnalysis,
  getBugReports,
  createBugReport,
  getCriticalBugs,
  getCodeSuggestions,
  createCodeSuggestion,
  getSuggestionsByType,
  getSecurityIssues,
  createSecurityIssue,
  getCriticalSecurityIssues,
  getAICodeStats,
  getCompletionStats,
  getCodeQualityTrend
} from '@/lib/ai-code-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'completions'
    const language = searchParams.get('language') as any
    const status = searchParams.get('status') as any
    const model = searchParams.get('model') as any
    const category = searchParams.get('category') as any
    const isPublic = searchParams.get('is_public')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')
    const analysisId = searchParams.get('analysis_id')
    const analysisType = searchParams.get('analysis_type') as any
    const suggestionType = searchParams.get('suggestion_type') as any
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'completions': {
        const filters: any = {}
        if (language) filters.language = language
        if (status) filters.status = status
        if (model) filters.model = model
        const result = await getCodeCompletions(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'recent-completions': {
        const result = await getRecentCompletions(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'completions-by-language': {
        if (!language) {
          return NextResponse.json({ error: 'language required' }, { status: 400 })
        }
        const result = await getCompletionsByLanguage(user.id, language)
        return NextResponse.json({ data: result.data })
      }

      case 'snippets': {
        const filters: any = {}
        if (language) filters.language = language
        if (category) filters.category = category
        if (isPublic !== null) filters.is_public = isPublic === 'true'
        if (search) filters.search = search
        const result = await getCodeSnippets(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'public-snippets': {
        const result = await getPublicSnippets(language || undefined, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'snippets-by-tags': {
        if (!tags) {
          return NextResponse.json({ error: 'tags required' }, { status: 400 })
        }
        const tagArray = tags.split(',')
        const result = await searchSnippetsByTags(user.id, tagArray)
        return NextResponse.json({ data: result.data })
      }

      case 'analyses': {
        const filters: any = {}
        if (language) filters.language = language
        if (analysisType) filters.type = analysisType
        const result = await getCodeAnalyses(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'bug-reports': {
        if (!analysisId) {
          return NextResponse.json({ error: 'analysis_id required' }, { status: 400 })
        }
        const result = await getBugReports(analysisId)
        return NextResponse.json({ data: result.data })
      }

      case 'critical-bugs': {
        const result = await getCriticalBugs(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'suggestions': {
        if (!analysisId) {
          return NextResponse.json({ error: 'analysis_id required' }, { status: 400 })
        }
        const result = await getCodeSuggestions(analysisId)
        return NextResponse.json({ data: result.data })
      }

      case 'suggestions-by-type': {
        if (!suggestionType) {
          return NextResponse.json({ error: 'suggestion_type required' }, { status: 400 })
        }
        const result = await getSuggestionsByType(user.id, suggestionType)
        return NextResponse.json({ data: result.data })
      }

      case 'security-issues': {
        if (!analysisId) {
          return NextResponse.json({ error: 'analysis_id required' }, { status: 400 })
        }
        const result = await getSecurityIssues(analysisId)
        return NextResponse.json({ data: result.data })
      }

      case 'critical-security-issues': {
        const result = await getCriticalSecurityIssues(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getAICodeStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'completion-stats': {
        const result = await getCompletionStats(user.id, days)
        return NextResponse.json({ data: result.data })
      }

      case 'quality-trend': {
        const result = await getCodeQualityTrend(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Code API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch AI Code data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-completion': {
        const result = await createCodeCompletion(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-snippet': {
        const result = await createCodeSnippet(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-analysis': {
        const result = await createCodeAnalysis(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-bug-report': {
        const result = await createBugReport(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-suggestion': {
        const result = await createCodeSuggestion(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-security-issue': {
        const result = await createSecurityIssue(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Code API error', { error })
    return NextResponse.json(
      { error: 'Failed to process AI Code request' },
      { status: 500 }
    )
  }
}
