import { NextRequest, NextResponse } from 'next/server'

interface UPFComment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type: 'image' | 'video' | 'code' | 'audio' | 'doc
  position: {
    x?: number
    y?: number
    timestamp?: number
    line?: number
    character?: number
    textSelection?: {
      start: number
      end: number
      text: string
    }
    elementId?: string
  }
  status: 'open' | 'resolved' | 'needs_revision' | 'approved
  priority: 'low' | 'medium' | 'high' | 'urgent
  createdAt: string
  updatedAt?: string
  resolvedAt?: string
  resolvedBy?: string
  replies: UPFComment[]
  mentions: string[]
  reactions: {
    userId: string
    type: 'like' | 'love' | 'approve' | 'reject
    createdAt: string
  }[]
  metadata?: {
    voiceNote?: {
      url: string
      duration: number
      waveform: number[]
    }
    drawing?: {
      paths: string[]
      color: string
    }
    attachments?: {
      id: string
      name: string
      url: string
      type: string
    }[]
  }
}

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'code' | 'audio' | 'doc
  url: string
  thumbnail?: string
  metadata: {
    dimensions?: { width: number; height: number }
    duration?: number
    pageCount?: number
    language?: string
    lines?: number
  }
  comments: UPFComment[]
  status: 'draft' | 'review' | 'approved' | 'changes_required
}

// Mock data store (in production, this would be a database)
let mockProjects: { [key: string]: MediaFile[] } = {
  'current-project': [
    {
      id: 'img_1,'
      name: 'Homepage_Mockup_v3.jpg,'
      type: 'image,'
      url: '/images/homepage-mockup.jpg,'
      thumbnail: '/images/homepage-thumb.jpg,'
      metadata: {
        dimensions: { width: 1920, height: 1080 }
      },
      status: 'review,'
      comments: [
        {
          id: 'comment_1,'
          userId: 'client_1,'
          userName: 'Sarah Johnson,'
          userAvatar: '/avatars/sarah.jpg,'
          content: 'The hero section needs more contrast. Hard to read the text.,'
          type: 'image,'
          position: { x: 45, y: 25, elementId: 'hero_section' },
          status: 'open,'
          priority: 'high,'
          createdAt: '2024-01-15T10:30:00Z,'
          replies: [],
          mentions: ['designer_1'],
          reactions: []
        }
      ]
    }
  ]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action
  const projectId = searchParams.get('projectId') || 'current-project
  const fileId = searchParams.get('fileId
  const commentId = searchParams.get('commentId

  console.log('🎯 UPF API called: ', { action, projectId, fileId, commentId })'

  try {
    switch (action) {
      case 'get_files':
        return NextResponse.json({
          success: true,
          files: mockProjects[projectId] || []
        })

      case 'get_comments':
        if (!fileId) {
          return NextResponse.json({ success: false, error: 'File ID required' }, { status: 400 })
        }
        
        const files = mockProjects[projectId] || []
        const file = files.find(f => f.id === fileId)
        
        if (!file) {
          return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          comments: file.comments
        })

      case 'get_comment':
        if (!commentId) {
          return NextResponse.json({ success: false, error: 'Comment ID required' }, { status: 400 })
        }
        
        // Find comment across all files
        let foundComment: UPFComment | null = null
        const allFiles = mockProjects[projectId] || []
        
        for (const file of allFiles) {
          const comment = file.comments.find(c => c.id === commentId)
          if (comment) {
            foundComment = comment
            break
          }
        }

        if (!foundComment) {
          return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          comment: foundComment
        })

      case 'get_analytics':
        const projectFiles = mockProjects[projectId] || []
        const allComments = projectFiles.flatMap(f => f.comments)
        
        const analytics = {
          totalComments: allComments.length,
          openComments: allComments.filter(c => c.status === 'open').length,
          resolvedComments: allComments.filter(c => c.status === 'resolved').length,
          approvedComments: allComments.filter(c => c.status === 'approved').length,
          needsRevisionComments: allComments.filter(c => c.status === 'needs_revision').length,
          byType: {
            image: allComments.filter(c => c.type === 'image').length,
            video: allComments.filter(c => c.type === 'video').length,
            code: allComments.filter(c => c.type === 'code').length,
            doc: allComments.filter(c => c.type === 'doc').length,
            audio: allComments.filter(c => c.type === 'audio').length
          },
          byPriority: {
            urgent: allComments.filter(c => c.priority === 'urgent').length,
            high: allComments.filter(c => c.priority === 'high').length,
            medium: allComments.filter(c => c.priority === 'medium').length,
            low: allComments.filter(c => c.priority === 'low').length
          },
          averageResolutionTime: '2.3 hours,'
          mostActiveUser: 'Sarah Johnson,'
          busyFiles: projectFiles.map(f => ({
            id: f.id,
            name: f.name,
            commentCount: f.comments.length,
            status: f.status
          })).sort((a, b) => b.commentCount - a.commentCount).slice(0, 5)
        }

        return NextResponse.json({
          success: true,
          analytics
        })

      default:
        return NextResponse.json({
          success: true,
          message: 'Universal Pinpoint Feedback API,'
          supportedActions: ['get_files', 'get_comments', 'get_comment', 'get_analytics
          ],
          endpoints: {
            'GET': 'Retrieve files, comments, or analytics', 'POST': 'Create comments or reactions', 'PUT': 'Update comments or file status', 'DELETE': 'Delete comments'
          }
        })
    }
  } catch (error) {
    console.error('UPF API error: ', error)'
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action
  const projectId = searchParams.get('projectId') || 'current-project

  try {
    const body = await request.json()

    switch (action) {
      case 'add_comment':
        const { fileId, comment } = body
        
        if (!fileId || !comment) {
          return NextResponse.json({ 
            success: false, 
            error: 'File ID and comment required' 
          }, { status: 400 })
        }

        const files = mockProjects[projectId] || []
        const fileIndex = files.findIndex(f => f.id === fileId)
        
        if (fileIndex === -1) {
          return NextResponse.json({ 
            success: false, 
            error: 'File not found' 
          }, { status: 404 })
        }

        const newComment: UPFComment = {
          id: `comment_${Date.now()}`,
          userId: comment.userId,
          userName: comment.userName,
          userAvatar: comment.userAvatar,
          content: comment.content,
          type: comment.type,
          position: comment.position,
          status: 'open,'
          priority: comment.priority || 'medium,
          createdAt: new Date().toISOString(),
          replies: [],
          mentions: comment.mentions || [],
          reactions: [],
          metadata: comment.metadata
        }

        mockProjects[projectId][fileIndex].comments.push(newComment)

        return NextResponse.json({
          success: true,
          comment: newComment,
          message: 'Comment added successfully'
        })

      case 'add_reaction':
        const { commentId, reaction } = body
        
        if (!commentId || !reaction) {
          return NextResponse.json({ 
            success: false, 
            error: 'Comment ID and reaction required' 
          }, { status: 400 })
        }

        // Find and update comment with reaction
        let updated = false
        const allFiles = mockProjects[projectId] || []
        
        for (const file of allFiles) {
          const comment = file.comments.find(c => c.id === commentId)
          if (comment) {
            // Remove existing reaction from this user
            comment.reactions = comment.reactions.filter(r => r.userId !== reaction.userId)
            
            // Add new reaction
            comment.reactions.push({
              userId: reaction.userId,
              type: reaction.type,
              createdAt: new Date().toISOString()
            })
            
            updated = true
            break
          }
        }

        if (!updated) {
          return NextResponse.json({ 
            success: false, 
            error: 'Comment not found' 
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Reaction added successfully'
        })

      case 'add_reply':
        const { parentCommentId, reply } = body
        
        if (!parentCommentId || !reply) {
          return NextResponse.json({ 
            success: false, 
            error: 'Parent comment ID and reply required' 
          }, { status: 400 })
        }

        // Find parent comment and add reply
        let replyAdded = false
        const projectFiles = mockProjects[projectId] || []
        
        for (const file of projectFiles) {
          const parentComment = file.comments.find(c => c.id === parentCommentId)
          if (parentComment) {
            const newReply: UPFComment = {
              id: `reply_${Date.now()}`,
              userId: reply.userId,
              userName: reply.userName,
              userAvatar: reply.userAvatar,
              content: reply.content,
              type: parentComment.type,
              position: parentComment.position,
              status: 'open,'
              priority: 'low,'
              createdAt: new Date().toISOString(),
              replies: [],
              mentions: reply.mentions || [],
              reactions: []
            }
            
            parentComment.replies.push(newReply)
            replyAdded = true
            break
          }
        }

        if (!replyAdded) {
          return NextResponse.json({ 
            success: false, 
            error: 'Parent comment not found' 
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Reply added successfully'
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Unknown action' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('UPF POST error: ', error)'
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action
  const projectId = searchParams.get('projectId') || 'current-project

  try {
    const body = await request.json()

    switch (action) {
      case 'update_comment_status':
        const { commentId, status, resolvedBy } = body
        
        if (!commentId || !status) {
          return NextResponse.json({ 
            success: false, 
            error: 'Comment ID and status required' 
          }, { status: 400 })
        }

        // Find and update comment status
        let updated = false
        const allFiles = mockProjects[projectId] || []
        
        for (const file of allFiles) {
          const comment = file.comments.find(c => c.id === commentId)
          if (comment) {
            comment.status = status
            comment.updatedAt = new Date().toISOString()
            
            if (status === 'resolved') {
              comment.resolvedAt = new Date().toISOString()
              comment.resolvedBy = resolvedBy
            }
            
            updated = true
            break
          }
        }

        if (!updated) {
          return NextResponse.json({ 
            success: false, 
            error: 'Comment not found' 
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Comment status updated successfully'
        })

      case 'update_file_status':
        const { fileId, fileStatus } = body
        
        if (!fileId || !fileStatus) {
          return NextResponse.json({ 
            success: false, 
            error: 'File ID and status required' 
          }, { status: 400 })
        }

        const files = mockProjects[projectId] || []
        const fileIndex = files.findIndex(f => f.id === fileId)
        
        if (fileIndex === -1) {
          return NextResponse.json({ 
            success: false, 
            error: 'File not found' 
          }, { status: 404 })
        }

        mockProjects[projectId][fileIndex].status = fileStatus

        return NextResponse.json({
          success: true,
          message: 'File status updated successfully'
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Unknown action' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('UPF PUT error: ', error)'
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action
  const projectId = searchParams.get('projectId') || 'current-project
  const commentId = searchParams.get('commentId

  try {
    switch (action) {
      case 'delete_comment':
        if (!commentId) {
          return NextResponse.json({ 
            success: false, 
            error: 'Comment ID required' 
          }, { status: 400 })
        }

        // Find and remove comment
        let deleted = false
        const allFiles = mockProjects[projectId] || []
        
        for (const file of allFiles) {
          const commentIndex = file.comments.findIndex(c => c.id === commentId)
          if (commentIndex !== -1) {
            file.comments.splice(commentIndex, 1)
            deleted = true
            break
          }
        }

        if (!deleted) {
          return NextResponse.json({ 
            success: false, 
            error: 'Comment not found' 
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Comment deleted successfully'
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Unknown action' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('UPF DELETE error: ', error)'
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 