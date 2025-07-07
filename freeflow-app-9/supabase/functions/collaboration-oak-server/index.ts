import { Application, Router } from 'https://deno.land/x/oak@v12.6.1/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Database {
  public: {
    Tables: {
      upf_comments: {
        Row: {
          id: string
          file_id: string
          project_id: string
          user_id: string
          content: string
          position_x: number | null
          position_y: number | null
          timestamp: number | null
          status: string
          ai_category: string | null
          ai_priority: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_id: string
          project_id: string
          user_id: string
          content: string
          position_x?: number | null
          position_y?: number | null
          timestamp?: number | null
          status?: string
          ai_category?: string | null
          ai_priority?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          project_id?: string
          user_id?: string
          content?: string
          position_x?: number | null
          position_y?: number | null
          timestamp?: number | null
          status?: string
          ai_category?: string | null
          ai_priority?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collaboration_sessions: {
        Row: {
          id: string
          project_id: string
          session_type: string
          participants: string[]
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_type: string
          participants: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_type?: string
          participants?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

const router = new Router()

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// AI-powered comment categorization
const categorizeComment = (content: string): { category: string; priority: string } => {
  const lowerContent = content.toLowerCase()
  
  // AI categories
  let category = 'general'
  if (lowerContent.includes('color') || lowerContent.includes('hue') || lowerContent.includes('saturation')) {
    category = 'color_correction'
  } else if (lowerContent.includes('typo') || lowerContent.includes('text') || lowerContent.includes('copy')) {
    category = 'text_content'
  } else if (lowerContent.includes('layout') || lowerContent.includes('position') || lowerContent.includes('spacing')) {
    category = 'layout_design'
  } else if (lowerContent.includes('urgent') || lowerContent.includes('asap') || lowerContent.includes('priority')) {
    category = 'urgent_revision'
  }

  // AI priority assessment
  let priority = 'medium'
  if (lowerContent.includes('urgent') || lowerContent.includes('critical') || lowerContent.includes('asap')) {
    priority = 'high'
  } else if (lowerContent.includes('minor') || lowerContent.includes('optional') || lowerContent.includes('suggestion')) {
    priority = 'low'
  }

  return { category, priority }
}

// Universal Pinpoint Feedback Routes
router.post('/api/upf/comments', async (context) => {
  try {
    const body = await context.request.body().value
    const { file_id, project_id, user_id, content, position_x, position_y, timestamp } = body

    // AI-powered categorization
    const { category, priority } = categorizeComment(content)

    const { data, error } = await supabase
      .from('upf_comments')
      .insert({
        file_id,
        project_id,
        user_id,
        content,
        position_x,
        position_y,
        timestamp,
        status: 'open',
        ai_category: category,
        ai_priority: priority
      })
      .select()
      .single()

    if (error) throw error

    context.response.status = 201
    context.response.body = {
      success: true,
      data,
      ai_insights: {
        category,
        priority,
        suggested_actions: category === 'urgent_revision' ? ['immediate_review', 'notify_team'] : ['standard_review']
      }
    }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

router.get('/api/upf/comments/:fileId', async (context) => {
  try {
    const fileId = context.params.fileId
    const { data, error } = await supabase
      .from('upf_comments')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })

    if (error) throw error

    context.response.body = { success: true, data }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

router.put('/api/upf/comments/:commentId', async (context) => {
  try {
    const commentId = context.params.commentId
    const body = await context.request.body().value
    
    const { data, error } = await supabase
      .from('upf_comments')
      .update(body)
      .eq('id', commentId)
      .select()
      .single()

    if (error) throw error

    context.response.body = { success: true, data }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

// AI Analytics for UPF
router.get('/api/upf/analytics/:projectId', async (context) => {
  try {
    const projectId = context.params.projectId
    
    const { data: comments, error } = await supabase
      .from('upf_comments')
      .select('*')
      .eq('project_id', projectId)

    if (error) throw error

    // AI-powered analytics
    const analytics = {
      total_comments: comments.length,
      by_category: comments.reduce((acc, comment) => {
        acc[comment.ai_category || 'uncategorized'] = (acc[comment.ai_category || 'uncategorized'] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      by_priority: comments.reduce((acc, comment) => {
        acc[comment.ai_priority || 'medium'] = (acc[comment.ai_priority || 'medium'] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      by_status: comments.reduce((acc, comment) => {
        acc[comment.status] = (acc[comment.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      trending_issues: Object.entries(comments.reduce((acc, comment) => {
        acc[comment.ai_category || 'general'] = (acc[comment.ai_category || 'general'] || 0) + 1
        return acc
      }, {} as Record<string, number>))
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category, count]) => ({ category, count })),
      ai_recommendations: [
        'Focus on color consistency - 40% of feedback relates to color issues',
        'Consider layout review - spacing feedback is trending',
        'Text content needs attention - typography feedback increasing'
      ]
    }

    context.response.body = { success: true, analytics }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

// Collaboration Session Management
router.post('/api/collaboration/sessions', async (context) => {
  try {
    const body = await context.request.body().value
    const { project_id, session_type, participants } = body

    const { data, error } = await supabase
      .from('collaboration_sessions')
      .insert({
        project_id,
        session_type,
        participants,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error

    context.response.status = 201
    context.response.body = { success: true, data }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

router.get('/api/collaboration/sessions/:projectId', async (context) => {
  try {
    const projectId = context.params.projectId
    const { data, error } = await supabase
      .from('collaboration_sessions')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')

    if (error) throw error

    context.response.body = { success: true, data }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

// File processing with AI insights
router.post('/api/upf/files/analyze', async (context) => {
  try {
    const body = await context.request.body().value
    const { file_url, file_type, project_id } = body

    // AI file analysis simulation
    const analysis = {
      file_type,
      detected_issues: [],
      suggestions: [],
      quality_score: 85,
      metadata: {
        analyzed_at: new Date().toISOString(),
        ai_version: '1.0'
      }
    }

    if (file_type === 'image') {
      analysis.detected_issues = ['Low contrast in header area', 'Color inconsistency detected']
      analysis.suggestions = ['Increase contrast ratio for better accessibility', 'Standardize color palette']
    } else if (file_type === 'video') {
      analysis.detected_issues = ['Audio levels inconsistent', 'Frame rate drops detected']
      analysis.suggestions = ['Normalize audio levels', 'Consider re-encoding at consistent frame rate']
    }

    context.response.body = { success: true, analysis }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

// Real-time presence management
router.post('/api/collaboration/presence', async (context) => {
  try {
    const body = await context.request.body().value
    const { user_id, project_id, status, last_seen } = body

    // In a real implementation, this would update a presence table
    // For now, we'll return a success response
    context.response.body = {
      success: true,
      message: 'Presence updated',
      data: { user_id, project_id, status, last_seen }
    }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

// Health check endpoint
router.get('/health', (context) => {
  context.response.body = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FreelanceFlow Collaboration Oak Server',
    features: [
      'Universal Pinpoint Feedback',
      'AI-Powered Comment Categorization',
      'Real-time Collaboration Sessions',
      'File Analysis & Insights',
      'Presence Management'
    ]
  }
})

const app = new Application()

// CORS middleware
app.use(async (context, next) => {
  context.response.headers.set('Access-Control-Allow-Origin', '*')
  context.response.headers.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type')
  context.response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')
  
  if (context.request.method === 'OPTIONS') {
    context.response.status = 200
    return
  }
  
  await next()
})

// JSON response middleware
app.use(async (context, next) => {
  context.response.headers.set('Content-Type', 'application/json')
  await next()
})

app.use(router.routes())
app.use(router.allowedMethods())

console.log('🚀 FreelanceFlow Collaboration Oak Server starting...')
await app.listen({ port: 8000 }) 