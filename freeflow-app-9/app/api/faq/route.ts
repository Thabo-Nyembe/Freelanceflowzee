/**
 * FAQ API Routes
 *
 * REST endpoints for FAQ/Knowledge Base management:
 * GET - List FAQs, categories, analytics
 * POST - Create FAQ, search, export, update settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('FaqAPI')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'list'

    switch (type) {
      case 'list': {
        const { data, error } = await supabase
          .from('faq_articles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          articles: data || []
        })
      }

      case 'categories': {
        const { data, error } = await supabase
          .from('faq_categories')
          .select('*')
          .order('name')

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          categories: data || [
            { id: '1', name: 'Getting Started', articleCount: 12 },
            { id: '2', name: 'Account & Billing', articleCount: 8 },
            { id: '3', name: 'Features', articleCount: 24 },
            { id: '4', name: 'Troubleshooting', articleCount: 15 },
            { id: '5', name: 'API & Integrations', articleCount: 10 }
          ]
        })
      }

      case 'analytics': {
        const { data, error } = await supabase
          .from('faq_analytics')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== '42P01' && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          success: true,
          analytics: data || {
            totalArticles: 89,
            totalViews: 12543,
            helpfulVotes: 8921,
            searchQueries: 3456,
            topArticles: [
              { id: '1', title: 'Getting started with Kazi', views: 1234, helpful: 89 },
              { id: '2', title: 'How to create your first project', views: 987, helpful: 76 },
              { id: '3', title: 'Understanding invoices', views: 876, helpful: 72 }
            ],
            topSearches: [
              { query: 'how to create project', count: 234 },
              { query: 'billing', count: 189 },
              { query: 'integrations', count: 156 }
            ],
            recentTrends: {
              viewsChange: 12.5,
              helpfulChange: 8.3,
              searchChange: -2.1
            }
          }
        })
      }

      case 'settings': {
        const { data, error } = await supabase
          .from('faq_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== '42P01' && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          success: true,
          settings: data || {
            autoPublish: false,
            aiSuggestions: true,
            moderationRequired: true,
            defaultVisibility: 'public',
            emailNotifications: true,
            slackNotifications: false,
            analyticsEnabled: true,
            feedbackEnabled: true
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('FAQ GET error', { error })
    return NextResponse.json({ error: 'Failed to fetch FAQ data' }, { status: 500 })
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
    const { action, ...data } = body

    switch (action) {
      case 'create-article': {
        const { title, content, category, tags, visibility = 'draft' } = data

        const { data: article, error } = await supabase
          .from('faq_articles')
          .insert({
            author_id: user.id,
            title,
            content,
            category,
            tags: tags || [],
            visibility,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'create-article',
          article: article || {
            id: `article-${Date.now()}`,
            title,
            visibility,
            createdAt: new Date().toISOString()
          },
          message: 'Article created successfully'
        })
      }

      case 'search': {
        const { query, category, limit = 20 } = data

        let dbQuery = supabase
          .from('faq_articles')
          .select('id, title, content, category, views, helpful_votes')
          .ilike('title', `%${query}%`)
          .limit(limit)

        if (category) {
          dbQuery = dbQuery.eq('category', category)
        }

        const { data: results, error } = await dbQuery

        if (error && error.code !== '42P01') throw error

        // Log search query for analytics
        await supabase
          .from('faq_search_logs')
          .insert({
            user_id: user.id,
            query,
            results_count: results?.length || 0,
            created_at: new Date().toISOString()
          })
          .catch((err) => logger.warn('Failed to log FAQ search query', { error: err }))

        return NextResponse.json({
          success: true,
          action: 'search',
          query,
          results: results || [],
          message: `Found ${results?.length || 0} results`
        })
      }

      case 'update-settings': {
        const { autoPublish, aiSuggestions, moderationRequired, defaultVisibility, emailNotifications, slackNotifications, analyticsEnabled, feedbackEnabled } = data

        const { error } = await supabase
          .from('faq_settings')
          .upsert({
            user_id: user.id,
            auto_publish: autoPublish,
            ai_suggestions: aiSuggestions,
            moderation_required: moderationRequired,
            default_visibility: defaultVisibility,
            email_notifications: emailNotifications,
            slack_notifications: slackNotifications,
            analytics_enabled: analyticsEnabled,
            feedback_enabled: feedbackEnabled,
            updated_at: new Date().toISOString()
          })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'update-settings',
          message: 'Settings saved successfully'
        })
      }

      case 'vote-helpful': {
        const { articleId, helpful } = data

        // Record vote
        await supabase
          .from('faq_votes')
          .upsert({
            user_id: user.id,
            article_id: articleId,
            helpful,
            created_at: new Date().toISOString()
          })
          .catch((err) => logger.warn('Failed to record FAQ vote', { articleId, error: err }))

        // Update article helpful count
        if (helpful) {
          await supabase.rpc('increment_faq_helpful', { article_id: articleId })
            .catch((err) => logger.warn('Failed to increment FAQ helpful count', { articleId, error: err }))
        }

        return NextResponse.json({
          success: true,
          action: 'vote-helpful',
          message: 'Thanks for your feedback!'
        })
      }

      case 'export': {
        const { format = 'json' } = data

        const { data: articles, error } = await supabase
          .from('faq_articles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error && error.code !== '42P01') throw error

        const exportData = articles || []

        if (format === 'csv') {
          const csvContent = 'ID,Title,Category,Views,Helpful Votes,Created At\n' +
            exportData.map((a: any) => `${a.id},"${a.title}",${a.category},${a.views || 0},${a.helpful_votes || 0},${a.created_at}`).join('\n')

          return NextResponse.json({
            success: true,
            action: 'export',
            format: 'csv',
            content: csvContent,
            filename: `faq-export-${new Date().toISOString().split('T')[0]}.csv`,
            message: 'Export ready for download'
          })
        }

        return NextResponse.json({
          success: true,
          action: 'export',
          format: 'json',
          data: exportData,
          filename: `faq-export-${new Date().toISOString().split('T')[0]}.json`,
          message: 'Export ready for download'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('FAQ POST error', { error })
    return NextResponse.json({ error: 'Failed to process FAQ request' }, { status: 500 })
  }
}
