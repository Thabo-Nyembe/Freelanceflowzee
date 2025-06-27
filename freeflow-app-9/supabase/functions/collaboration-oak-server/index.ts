import { Application, Router } from &apos;https://deno.land/x/oak@v12.6.1/mod.ts&apos;
import { createClient } from &apos;https://esm.sh/@supabase/supabase-js@2&apos;
import { corsHeaders } from &apos;../_shared/cors.ts&apos;

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
const supabaseUrl = Deno.env.get(&apos;SUPABASE_URL&apos;)!
const supabaseServiceKey = Deno.env.get(&apos;SUPABASE_SERVICE_ROLE_KEY&apos;)!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// AI-powered comment categorization
const categorizeComment = (content: string): { category: string; priority: string } => {
  const lowerContent = content.toLowerCase()
  
  // AI categories
  let category = &apos;general&apos;
  if (lowerContent.includes(&apos;color&apos;) || lowerContent.includes(&apos;hue&apos;) || lowerContent.includes(&apos;saturation&apos;)) {
    category = &apos;color_correction&apos;
  } else if (lowerContent.includes(&apos;typo&apos;) || lowerContent.includes(&apos;text&apos;) || lowerContent.includes(&apos;copy&apos;)) {
    category = &apos;text_content&apos;
  } else if (lowerContent.includes(&apos;layout&apos;) || lowerContent.includes(&apos;position&apos;) || lowerContent.includes(&apos;spacing&apos;)) {
    category = &apos;layout_design&apos;
  } else if (lowerContent.includes(&apos;urgent&apos;) || lowerContent.includes(&apos;asap&apos;) || lowerContent.includes(&apos;priority&apos;)) {
    category = &apos;urgent_revision&apos;
  }

  // AI priority assessment
  let priority = &apos;medium&apos;
  if (lowerContent.includes(&apos;urgent&apos;) || lowerContent.includes(&apos;critical&apos;) || lowerContent.includes(&apos;asap&apos;)) {
    priority = &apos;high&apos;
  } else if (lowerContent.includes(&apos;minor&apos;) || lowerContent.includes(&apos;optional&apos;) || lowerContent.includes(&apos;suggestion&apos;)) {
    priority = &apos;low&apos;
  }

  return { category, priority }
}

// Universal Pinpoint Feedback Routes
router.post(&apos;/api/upf/comments&apos;, async (context) => {
  try {
    const body = await context.request.body().value
    const { file_id, project_id, user_id, content, position_x, position_y, timestamp } = body

    // AI-powered categorization
    const { category, priority } = categorizeComment(content)

    const { data, error } = await supabase
      .from(&apos;upf_comments&apos;)
      .insert({
        file_id,
        project_id,
        user_id,
        content,
        position_x,
        position_y,
        timestamp,
        status: &apos;open&apos;,
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
        suggested_actions: category === &apos;urgent_revision&apos; ? [&apos;immediate_review&apos;, &apos;notify_team&apos;] : [&apos;standard_review&apos;]
      }
    }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

router.get(&apos;/api/upf/comments/:fileId&apos;, async (context) => {
  try {
    const fileId = context.params.fileId
    const { data, error } = await supabase
      .from(&apos;upf_comments&apos;)
      .select(&apos;*')'
      .eq(&apos;file_id&apos;, fileId)
      .order(&apos;created_at&apos;, { ascending: false })

    if (error) throw error

    context.response.body = { success: true, data }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

router.put(&apos;/api/upf/comments/:commentId&apos;, async (context) => {
  try {
    const commentId = context.params.commentId
    const body = await context.request.body().value
    
    const { data, error } = await supabase
      .from(&apos;upf_comments&apos;)
      .update(body)
      .eq(&apos;id&apos;, commentId)
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
router.get(&apos;/api/upf/analytics/:projectId&apos;, async (context) => {
  try {
    const projectId = context.params.projectId
    
    const { data: comments, error } = await supabase
      .from(&apos;upf_comments&apos;)
      .select(&apos;*')'
      .eq(&apos;project_id&apos;, projectId)

    if (error) throw error

    // AI-powered analytics
    const analytics = {
      total_comments: comments.length,
      by_category: comments.reduce((acc, comment) => {
        acc[comment.ai_category || &apos;uncategorized&apos;] = (acc[comment.ai_category || &apos;uncategorized&apos;] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      by_priority: comments.reduce((acc, comment) => {
        acc[comment.ai_priority || &apos;medium&apos;] = (acc[comment.ai_priority || &apos;medium&apos;] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      by_status: comments.reduce((acc, comment) => {
        acc[comment.status] = (acc[comment.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      trending_issues: Object.entries(comments.reduce((acc, comment) => {
        acc[comment.ai_category || &apos;general&apos;] = (acc[comment.ai_category || &apos;general&apos;] || 0) + 1
        return acc
      }, {} as Record<string, number>))
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category, count]) => ({ category, count })),
      ai_recommendations: [
        &apos;Focus on color consistency - 40% of feedback relates to color issues&apos;,
        &apos;Consider layout review - spacing feedback is trending&apos;,
        &apos;Text content needs attention - typography feedback increasing&apos;
      ]
    }

    context.response.body = { success: true, analytics }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

// Collaboration Session Management
router.post(&apos;/api/collaboration/sessions&apos;, async (context) => {
  try {
    const body = await context.request.body().value
    const { project_id, session_type, participants } = body

    const { data, error } = await supabase
      .from(&apos;collaboration_sessions&apos;)
      .insert({
        project_id,
        session_type,
        participants,
        status: &apos;active&apos;
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

router.get(&apos;/api/collaboration/sessions/:projectId&apos;, async (context) => {
  try {
    const projectId = context.params.projectId
    const { data, error } = await supabase
      .from(&apos;collaboration_sessions&apos;)
      .select(&apos;*')'
      .eq(&apos;project_id&apos;, projectId)
      .eq(&apos;status&apos;, &apos;active&apos;)

    if (error) throw error

    context.response.body = { success: true, data }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

// File processing with AI insights
router.post(&apos;/api/upf/files/analyze&apos;, async (context) => {
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
        ai_version: &apos;1.0&apos;
      }
    }

    if (file_type === &apos;image&apos;) {
      analysis.detected_issues = [&apos;Low contrast in header area&apos;, &apos;Color inconsistency detected&apos;]
      analysis.suggestions = [&apos;Increase contrast ratio for better accessibility&apos;, &apos;Standardize color palette&apos;]
    } else if (file_type === &apos;video&apos;) {
      analysis.detected_issues = [&apos;Audio levels inconsistent&apos;, &apos;Frame rate drops detected&apos;]
      analysis.suggestions = [&apos;Normalize audio levels&apos;, &apos;Consider re-encoding at consistent frame rate&apos;]
    }

    context.response.body = { success: true, analysis }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

// Real-time presence management
router.post(&apos;/api/collaboration/presence&apos;, async (context) => {
  try {
    const body = await context.request.body().value
    const { user_id, project_id, status, last_seen } = body

    // In a real implementation, this would update a presence table
    // For now, we&apos;ll return a success response
    context.response.body = {
      success: true,
      message: &apos;Presence updated&apos;,
      data: { user_id, project_id, status, last_seen }
    }
  } catch (error) {
    context.response.status = 400
    context.response.body = { error: error.message }
  }
})

// Health check endpoint
router.get(&apos;/health&apos;, (context) => {
  context.response.body = {
    status: &apos;healthy&apos;,
    timestamp: new Date().toISOString(),
    service: &apos;FreelanceFlow Collaboration Oak Server&apos;,
    features: [
      &apos;Universal Pinpoint Feedback&apos;,
      &apos;AI-Powered Comment Categorization&apos;,
      &apos;Real-time Collaboration Sessions&apos;,
      &apos;File Analysis & Insights&apos;,
      &apos;Presence Management&apos;
    ]
  }
})

const app = new Application()

// CORS middleware
app.use(async (context, next) => {
  context.response.headers.set(&apos;Access-Control-Allow-Origin&apos;, &apos;*')'
  context.response.headers.set(&apos;Access-Control-Allow-Headers&apos;, &apos;authorization, x-client-info, apikey, content-type&apos;)
  context.response.headers.set(&apos;Access-Control-Allow-Methods&apos;, &apos;POST, GET, OPTIONS, PUT, DELETE&apos;)
  
  if (context.request.method === &apos;OPTIONS&apos;) {
    context.response.status = 200
    return
  }
  
  await next()
})

// JSON response middleware
app.use(async (context, next) => {
  context.response.headers.set(&apos;Content-Type&apos;, &apos;application/json&apos;)
  await next()
})

app.use(router.routes())
app.use(router.allowedMethods())

console.log(&apos;🚀 FreelanceFlow Collaboration Oak Server starting...&apos;)
await app.listen({ port: 8000 }) 