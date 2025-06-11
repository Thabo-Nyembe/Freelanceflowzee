import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Types for UPF API
interface UPFCommentRequest {
  fileId: string
  content: string
  type: 'image' | 'video' | 'code' | 'audio' | 'doc' | 'text'
  position?: {
    x?: number
    y?: number
    timestamp?: number
    line?: number
    startChar?: number
    endChar?: number
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  mentions?: string[]
  voiceNoteUrl?: string
  voiceNoteDuration?: number
  attachments?: Array<{
    name: string
    url: string
    type: string
    size: number
  }>
}

interface UPFReactionRequest {
  commentId: string
  reactionType: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'thumbs_up' | 'thumbs_down'
}

interface AIAnalysisRequest {
  content: string
  fileType: string
  context?: {
    projectType?: string
    industry?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const action = body.action

    switch (action) {
      case 'add_comment':
        return handleAddComment(body as UPFCommentRequest, supabase, user)
      
      case 'update_comment':
        return handleUpdateComment(body, supabase, user)
      
      case 'delete_comment':
        return handleDeleteComment(body, supabase, user)
      
      case 'add_reaction':
        return handleAddReaction(body as UPFReactionRequest, supabase, user)
      
      case 'remove_reaction':
        return handleRemoveReaction(body, supabase, user)
      
      case 'analyze_with_ai':
        return handleAIAnalysis(body as AIAnalysisRequest, supabase, user)
      
      case 'upload_voice_note':
        return handleVoiceNoteUpload(body, supabase, user)
      
      case 'mark_resolved':
        return handleMarkResolved(body, supabase, user)
      
      case 'add_reply':
        return handleAddReply(body, supabase, user)
      
      case 'generate_summary':
        return handleGenerateSummary(body, supabase, user)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('UPF API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const fileId = searchParams.get('fileId')
    const projectId = searchParams.get('projectId')
    const commentId = searchParams.get('commentId')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'get_comments':
        return getComments(supabase, fileId, user)
      
      case 'get_project_comments':
        return getProjectComments(supabase, projectId, user)
      
      case 'get_comment_thread':
        return getCommentThread(supabase, commentId, user)
      
      case 'get_ai_insights':
        return getAIInsights(supabase, projectId, user)
      
      case 'get_comment_analytics':
        return getCommentAnalytics(supabase, projectId, user)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('UPF GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Comment Management Functions
async function handleAddComment(
  commentData: UPFCommentRequest,
  supabase: any,
  user: any
) {
  try {
    // Validate file exists
    const { data: file, error: fileError } = await supabase
      .from('project_files')
      .select('id, name, project_id, file_type')
      .eq('id', commentData.fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Generate AI analysis if content provided
    let aiAnalysis = null
    if (commentData.content.trim()) {
      aiAnalysis = await generateAIAnalysis(commentData.content, file.file_type)
    }

    // Create main comment
    const { data: comment, error: commentError } = await supabase
      .from('upf_comments')
      .insert({
        file_id: commentData.fileId,
        project_id: file.project_id,
        user_id: user.id,
        content: commentData.content,
        comment_type: commentData.type,
        position_data: commentData.position || {},
        priority: commentData.priority,
        status: 'open',
        mentions: commentData.mentions || [],
        voice_note_url: commentData.voiceNoteUrl,
        voice_note_duration: commentData.voiceNoteDuration,
        ai_analysis: aiAnalysis,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        user:users(id, email, full_name, avatar_url),
        file:project_files(id, name, file_type)
      `)
      .single()

    if (commentError) {
      console.error('Comment creation error:', commentError)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // Handle attachments
    if (commentData.attachments && commentData.attachments.length > 0) {
      const attachmentPromises = commentData.attachments.map(attachment =>
        supabase.from('upf_attachments').insert({
          comment_id: comment.id,
          file_name: attachment.name,
          file_url: attachment.url,
          file_type: attachment.type,
          file_size: attachment.size,
          uploaded_by: user.id
        })
      )
      
      await Promise.all(attachmentPromises)
    }

    // Send notifications to mentioned users
    if (commentData.mentions && commentData.mentions.length > 0) {
      await sendMentionNotifications(
        supabase,
        commentData.mentions,
        comment,
        user,
        file
      )
    }

    // Create activity log
    await createActivityLog(supabase, {
      projectId: file.project_id,
      userId: user.id,
      action: 'comment_added',
      entityType: 'comment',
      entityId: comment.id,
      details: {
        fileId: commentData.fileId,
        fileName: file.name,
        commentType: commentData.type,
        priority: commentData.priority,
        hasVoiceNote: !!commentData.voiceNoteUrl,
        hasAI: !!aiAnalysis
      }
    })

    return NextResponse.json({
      success: true,
      comment,
      aiAnalysis,
      message: 'Comment added successfully'
    })
  } catch (error) {
    console.error('Add comment error:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

async function handleUpdateComment(body: any, supabase: any, user: any) {
  try {
    const { commentId, updates } = body

    // Verify comment ownership or admin access
    const { data: comment, error: fetchError } = await supabase
      .from('upf_comments')
      .select('user_id, project_id')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (comment.user_id !== user.id) {
      // Check if user has project admin access
      const { data: projectAccess } = await supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', comment.project_id)
        .eq('user_id', user.id)
        .single()

      if (!projectAccess || !['admin', 'owner'].includes(projectAccess.role)) {
        return NextResponse.json(
          { error: 'Unauthorized to update this comment' },
          { status: 403 }
        )
      }
    }

    // Update comment
    const { data: updatedComment, error: updateError } = await supabase
      .from('upf_comments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select(`
        *,
        user:users(id, email, full_name, avatar_url),
        replies:upf_comments!parent_id(*),
        reactions:upf_reactions(*),
        attachments:upf_attachments(*)
      `)
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    // Log activity
    await createActivityLog(supabase, {
      projectId: comment.project_id,
      userId: user.id,
      action: 'comment_updated',
      entityType: 'comment',
      entityId: commentId,
      details: { updates }
    })

    return NextResponse.json({
      success: true,
      comment: updatedComment,
      message: 'Comment updated successfully'
    })
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

async function handleAddReaction(
  reactionData: UPFReactionRequest,
  supabase: any,
  user: any
) {
  try {
    // Remove existing reaction from same user
    await supabase
      .from('upf_reactions')
      .delete()
      .eq('comment_id', reactionData.commentId)
      .eq('user_id', user.id)

    // Add new reaction
    const { data: reaction, error } = await supabase
      .from('upf_reactions')
      .insert({
        comment_id: reactionData.commentId,
        user_id: user.id,
        reaction_type: reactionData.reactionType,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to add reaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reaction,
      message: 'Reaction added successfully'
    })
  } catch (error) {
    console.error('Add reaction error:', error)
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    )
  }
}

async function handleAIAnalysis(
  analysisData: AIAnalysisRequest,
  supabase: any,
  user: any
) {
  try {
    const analysis = await generateAIAnalysis(
      analysisData.content,
      analysisData.fileType,
      analysisData.context
    )

    return NextResponse.json({
      success: true,
      analysis,
      message: 'AI analysis completed'
    })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI analysis' },
      { status: 500 }
    )
  }
}

async function handleVoiceNoteUpload(body: any, supabase: any, user: any) {
  try {
    const { fileName, fileData, duration, waveform } = body

    // In production, upload to storage service (S3, Supabase Storage, etc.)
    const voiceNoteUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/voice-notes/${fileName}`

    // Store voice note metadata
    const { data: voiceNote, error } = await supabase
      .from('upf_voice_notes')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_url: voiceNoteUrl,
        duration,
        waveform_data: waveform,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save voice note' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      voiceNote,
      url: voiceNoteUrl,
      message: 'Voice note uploaded successfully'
    })
  } catch (error) {
    console.error('Voice note upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload voice note' },
      { status: 500 }
    )
  }
}

// Data Retrieval Functions
async function getComments(supabase: any, fileId: string | null, user: any) {
  if (!fileId) {
    return NextResponse.json(
      { error: 'File ID required' },
      { status: 400 }
    )
  }

  const { data: comments, error } = await supabase
    .from('upf_comments')
    .select(`
      *,
      user:users(id, email, full_name, avatar_url),
      replies:upf_comments!parent_id(
        *,
        user:users(id, email, full_name, avatar_url)
      ),
      reactions:upf_reactions(
        *,
        user:users(id, email, full_name)
      ),
      attachments:upf_attachments(*)
    `)
    .eq('file_id', fileId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }

  // Get AI insights summary
  const aiInsights = await generateCommentsSummary(comments || [])

  return NextResponse.json({
    comments: comments || [],
    total: comments?.length || 0,
    aiInsights,
    stats: {
      open: comments?.filter(c => c.status === 'open').length || 0,
      resolved: comments?.filter(c => c.status === 'resolved').length || 0,
      highPriority: comments?.filter(c => c.priority === 'high' || c.priority === 'urgent').length || 0
    }
  })
}

async function getProjectComments(supabase: any, projectId: string | null, user: any) {
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    )
  }

  const { data: comments, error } = await supabase
    .from('upf_comments')
    .select(`
      *,
      user:users(id, email, full_name, avatar_url),
      file:project_files(id, name, file_type),
      reactions:upf_reactions(count)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch project comments' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    comments: comments || [],
    total: comments?.length || 0
  })
}

async function getCommentAnalytics(supabase: any, projectId: string | null, user: any) {
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    )
  }

  const { data: analytics, error } = await supabase
    .from('upf_comments')
    .select('status, priority, comment_type, created_at')
    .eq('project_id', projectId)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }

  const stats = {
    totalComments: analytics?.length || 0,
    byStatus: {
      open: analytics?.filter(c => c.status === 'open').length || 0,
      resolved: analytics?.filter(c => c.status === 'resolved').length || 0,
      in_progress: analytics?.filter(c => c.status === 'in_progress').length || 0
    },
    byPriority: {
      urgent: analytics?.filter(c => c.priority === 'urgent').length || 0,
      high: analytics?.filter(c => c.priority === 'high').length || 0,
      medium: analytics?.filter(c => c.priority === 'medium').length || 0,
      low: analytics?.filter(c => c.priority === 'low').length || 0
    },
    byType: {
      image: analytics?.filter(c => c.comment_type === 'image').length || 0,
      video: analytics?.filter(c => c.comment_type === 'video').length || 0,
      code: analytics?.filter(c => c.comment_type === 'code').length || 0,
      doc: analytics?.filter(c => c.comment_type === 'doc').length || 0,
      text: analytics?.filter(c => c.comment_type === 'text').length || 0
    }
  }

  return NextResponse.json({
    analytics: stats,
    trends: calculateTrends(analytics || [])
  })
}

// AI Analysis Functions
async function generateAIAnalysis(
  content: string,
  fileType: string,
  context?: any
): Promise<any> {
  // Simulate AI analysis - in production, integrate with OpenAI, Claude, etc.
  const categories = [
    'UX Enhancement',
    'Accessibility',
    'Performance',
    'Visual Design',
    'Content Strategy',
    'Technical Implementation',
    'User Flow',
    'Responsive Design'
  ]

  const severities = ['info', 'warning', 'error'] as const
  const category = categories[Math.floor(Math.random() * categories.length)]
  const severity = severities[Math.floor(Math.random() * severities.length)]

  const summaries = {
    'UX Enhancement': 'Suggestion focuses on improving user experience and interaction flow',
    'Accessibility': 'Important accessibility consideration for inclusive design',
    'Performance': 'Performance optimization opportunity identified',
    'Visual Design': 'Visual design improvement with aesthetic and functional benefits',
    'Content Strategy': 'Content-related suggestion for better communication',
    'Technical Implementation': 'Technical implementation detail requiring attention',
    'User Flow': 'User journey and flow optimization suggestion',
    'Responsive Design': 'Responsive design issue affecting cross-device experience'
  }

  return {
    summary: summaries[category as keyof typeof summaries],
    category,
    severity,
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    suggestions: [
      'Consider implementing this change in the next iteration',
      'Test with user feedback before finalizing',
      'Align with design system guidelines'
    ],
    estimatedEffort: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    tags: generateRelevantTags(content, fileType)
  }
}

async function generateCommentsSummary(comments: any[]): Promise<any> {
  if (comments.length === 0) return null

  const themes = extractCommentThemes(comments)
  const priorityDistribution = comments.reduce((acc, comment) => {
    acc[comment.priority] = (acc[comment.priority] || 0) + 1
    return acc
  }, {})

  return {
    totalComments: comments.length,
    mainThemes: themes,
    priorityDistribution,
    recommendations: [
      'Focus on high-priority items first',
      'Consider grouping similar feedback',
      'Schedule review session for complex items'
    ],
    estimatedResolutionTime: calculateEstimatedTime(comments)
  }
}

// Helper Functions
function extractCommentThemes(comments: any[]): string[] {
  const themes = comments.map(c => c.ai_analysis?.category).filter(Boolean)
  const themeCount = themes.reduce((acc, theme) => {
    acc[theme] = (acc[theme] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(themeCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([theme]) => theme)
}

function generateRelevantTags(content: string, fileType: string): string[] {
  const tags = []
  
  if (content.toLowerCase().includes('mobile')) tags.push('mobile')
  if (content.toLowerCase().includes('desktop')) tags.push('desktop')
  if (content.toLowerCase().includes('color')) tags.push('color')
  if (content.toLowerCase().includes('font')) tags.push('typography')
  if (content.toLowerCase().includes('button')) tags.push('interaction')
  if (content.toLowerCase().includes('slow')) tags.push('performance')
  if (content.toLowerCase().includes('accessibility')) tags.push('a11y')
  
  tags.push(fileType)
  
  return tags.slice(0, 5)
}

function calculateEstimatedTime(comments: any[]): string {
  const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 }
  const totalWeight = comments.reduce((sum, comment) => {
    return sum + (priorityWeights[comment.priority as keyof typeof priorityWeights] || 1)
  }, 0)

  if (totalWeight <= 10) return '2-4 hours'
  if (totalWeight <= 20) return '1-2 days'
  if (totalWeight <= 40) return '3-5 days'
  return '1+ weeks'
}

function calculateTrends(analytics: any[]): any {
  // Simple trend calculation - in production, use more sophisticated analysis
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const weeklyComments = analytics.filter(a => new Date(a.created_at) > lastWeek).length
  const monthlyComments = analytics.filter(a => new Date(a.created_at) > lastMonth).length

  return {
    weeklyActivity: weeklyComments,
    monthlyActivity: monthlyComments,
    averagePerDay: monthlyComments / 30,
    trend: weeklyComments > monthlyComments / 4 ? 'increasing' : 'stable'
  }
}

async function sendMentionNotifications(
  supabase: any,
  mentions: string[],
  comment: any,
  user: any,
  file: any
) {
  for (const mentionedUserId of mentions) {
    await supabase.from('notifications').insert({
      user_id: mentionedUserId,
      type: 'mention',
      title: 'You were mentioned in a comment',
      message: `${user.email} mentioned you in feedback on ${file.name}`,
      data: {
        comment_id: comment.id,
        file_id: file.id,
        project_id: file.project_id,
        comment_type: comment.comment_type
      },
      priority: comment.priority === 'urgent' ? 'high' : 'medium'
    })
  }
}

async function createActivityLog(supabase: any, activity: any) {
  await supabase.from('project_activity').insert({
    project_id: activity.projectId,
    user_id: activity.userId,
    action: activity.action,
    entity_type: activity.entityType,
    entity_id: activity.entityId,
    details: activity.details,
    created_at: new Date().toISOString()
  })
} 