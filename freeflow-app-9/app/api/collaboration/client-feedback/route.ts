import { NextRequest, NextResponse } from 'next/server

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const fileId = searchParams.get('fileId')
    const projectId = searchParams.get('projectId')

    console.log('🎯 Client Feedback API called:', { action, fileId, projectId })

    switch (action) {
      case 'get_comments':
        return NextResponse.json({
          success: true,
          comments: [
            {
              id: 'comment_1',
              userId: 'client_1',
              userName: 'Sarah Johnson',
              userAvatar: '/avatars/sarah.jpg',
              content: 'Love the new hero section! The colors are much better.',
              type: 'inline',
              fileType: 'figma',
              position: { x: 45, y: 20, elementId: 'hero_section' },
              status: 'approved',
              priority: 'medium',
              category: 'design',
              createdAt: '2024-01-15T11:00:00Z',
              replies: [],
              reactions: [
                { userId: 'freelancer_1', type: 'thumbs_up', createdAt: '2024-01-15T11:05:00Z' }
              ],
              mentions: [],
              isResolved: false
            },
            {
              id: 'comment_2',
              userId: 'client_1',
              userName: 'Sarah Johnson',
              userAvatar: '/avatars/sarah.jpg',
              content: 'The footer text is too small and hard to read on mobile.',
              type: 'voice',
              fileType: 'figma',
              position: { x: 50, y: 85, elementId: 'footer' },
              status: 'changes_required',
              priority: 'high',
              category: 'design',
              createdAt: '2024-01-15T11:30:00Z',
              replies: [
                {
                  id: 'reply_1',
                  userId: 'freelancer_1',
                  userName: 'Alex Designer',
                  userAvatar: '/avatars/alex.jpg',
                  content: 'Thanks for the feedback! I\'ll increase the font size and test on mobile.',
                  type: 'text',
                  fileType: 'figma',
                  status: 'in_review',
                  priority: 'medium',
                  createdAt: '2024-01-15T12:00:00Z',
                  replies: [],
                  reactions: [],
                  mentions: ['client_1'],
                  isResolved: false
                }
              ],
              reactions: [],
              mentions: ['freelancer_1'],
              voiceNote: {
                url: '/audio/comment_voice_1.mp3',
                duration: 15,
                waveform: [12, 25, 18, 30, 22, 35, 28, 15, 40, 25, 18, 32, 20, 28, 15],
                transcript: 'The footer text is too small and hard to read on mobile.
              },
              isResolved: false
            }
          ]
        })

      case 'get_ai_summary':
        return NextResponse.json({
          success: true,
          summary: {
            totalComments: 2,
            themes: {
              'design': 2, 'mobile_responsiveness': 1, 'typography': 1, 'color_corrections': 1
            },
            urgentIssues: 1,
            overallSentiment: 'positive',
            estimatedWorkRequired: '2-3 hours',
            keyActionItems: ['Increase footer font size for mobile', 'Test mobile responsiveness across devices', 'Consider hero section approved for production', 'Implement accessibility improvements for text contrast
            ],
            categoryBreakdown: {
              'color_corrections': { count: 1, avgPriority: 'medium' }, 'typo_fixes': { count: 0, avgPriority: 'low' }, 'layout_changes': { count: 1, avgPriority: 'high' }, 'functionality': { count: 0, avgPriority: 'low' }, 'content': { count: 0, avgPriority: 'low' }, 'design': { count: 2, avgPriority: 'medium' }
            },
            timelineInsights: {
              peakFeedbackHours: ['11:00', '11:30'],
              feedbackVelocity: 'high',
              resolutionRate: 0.5
            }
          }
        })

      case 'get_file_versions':
        return NextResponse.json({
          success: true,
          versions: [
            {
              id: 'v3',
              version: '3.0',
              name: 'Homepage Design v3.figma',
              url: '/files/homepage-v3.figma',
              uploadedAt: '2024-01-15T10:30:00Z',
              uploadedBy: 'Alex Designer',
              changelog: 'Updated hero section, improved mobile responsiveness',
              status: 'review',
              thumbnail: '/images/figma-v3-thumb.jpg
            },
            {
              id: 'v2',
              version: '2.0',
              name: 'Homepage Design v2.figma',
              url: '/files/homepage-v2.figma',
              uploadedAt: '2024-01-12T14:20:00Z',
              uploadedBy: 'Alex Designer',
              changelog: 'Added pricing section, updated color scheme',
              status: 'approved',
              thumbnail: '/images/figma-v2-thumb.jpg
            },
            {
              id: 'v1',
              version: '1.0',
              name: 'Homepage Design v1.figma',
              url: '/files/homepage-v1.figma',
              uploadedAt: '2024-01-10T09:00:00Z',
              uploadedBy: 'Alex Designer',
              changelog: 'Initial design concept',
              status: 'archived',
              thumbnail: '/images/figma-v1-thumb.jpg
            }
          ]
        })

      case 'get_approval_status':
        return NextResponse.json({
          success: true,
          approvalStatus: {
            overall: 'pending',
            elements: {
              'hero_section': 'approved', 'pricing_section': 'pending', 'footer': 'rejected', 'navigation': 'approved', 'cta_buttons': 'pending
            },
            approvedBy: [],
            rejectedBy: ['client_1'],
            pendingReviewers: ['client_2', 'client_3']
          }
        })

      case 'get_notification_summary':
        return NextResponse.json({
          success: true,
          notifications: {
            unreadMentions: 2,
            pendingApprovals: 3,
            unresolvedComments: 4,
            newReplies: 1,
            urgentFeedback: 1,
            dailySummaryReady: true
          }
        })

      default:
        return NextResponse.json({
          success: true,
          message: 'Client feedback API endpoint working',
          supportedActions: ['get_comments', 'get_ai_summary', 'get_file_versions', 'get_approval_status', 'get_notification_summary
          ]
        })
    }
  } catch (error) {
    console.error('❌ Client Feedback API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process client feedback request',
        details: error instanceof Error ? error.message : 'Unknown error
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    console.log('🎯 Client Feedback POST API called:', { action, data })

    switch (action) {
      case 'add_comment':
        // Simulate adding a comment
        const newComment = {
          id: `comment_${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          replies: [],
          reactions: [],
          isResolved: false
        }

        return NextResponse.json({
          success: true,
          comment: newComment,
          message: 'Comment added successfully
        })

      case 'add_voice_comment':
        // Handle voice comment upload
        return NextResponse.json({
          success: true,
          comment: {
            id: `voice_comment_${Date.now()}`,
            ...data,
            type: 'voice',
            voiceNote: {
              url: '/audio/voice_comment_' + Date.now() + '.mp3',
              duration: data.duration || 10,
              waveform: Array.from({ length: 20 }, () => Math.floor(Math.random() * 40) + 10),
              transcript: data.transcript || 'Voice comment transcription pending...
            },
            createdAt: new Date().toISOString(),
            isResolved: false
          },
          message: 'Voice comment uploaded successfully
        })

      case 'add_screen_recording':
        // Handle screen recording upload
        return NextResponse.json({
          success: true,
          comment: {
            id: `screen_comment_${Date.now()}`,
            ...data,
            type: 'screen',
            screenRecording: {
              url: '/videos/screen_recording_' + Date.now() + '.mp4',
              duration: data.duration || 30,
              thumbnail: '/images/screen_thumb_' + Date.now() + '.jpg
            },
            createdAt: new Date().toISOString(),
            isResolved: false
          },
          message: 'Screen recording uploaded successfully
        })

      case 'update_comment_status':
        return NextResponse.json({
          success: true,
          comment: {
            id: data.commentId,
            status: data.status,
            updatedAt: new Date().toISOString(),
            resolvedBy: data.resolvedBy,
            resolvedAt: data.status === 'resolved' ? new Date().toISOString() : undefined
          },
          message: `Comment ${data.status} successfully
        })

      case 'approve_file':
        return NextResponse.json({
          success: true,
          approval: {
            fileId: data.fileId,
            status: 'approved',
            approvedBy: data.approvedBy,
            approvedAt: new Date().toISOString(),
            elements: data.elements || {}
          },
          message: 'File approved successfully
        })

      case 'request_changes':
        return NextResponse.json({
          success: true,
          changeRequest: {
            fileId: data.fileId,
            status: 'changes_required',
            requestedBy: data.requestedBy,
            requestedAt: new Date().toISOString(),
            reason: data.reason,
            priority: data.priority || 'medium
          },
          message: 'Change request submitted successfully
        })

      case 'generate_ai_summary':
        // Simulate AI processing
        return NextResponse.json({
          success: true,
          summary: {
            themes: ['design improvements', 'mobile responsiveness', 'user experience'],
            sentiment: 'positive',
            urgentItems: data.comments?.filter((c: unknown) => c.priority === 'urgent').length || 0,
            estimatedWork: '3-5 hours',
            keyInsights: ['Most feedback focuses on visual design elements', 'Mobile responsiveness is a recurring concern', 'Overall client satisfaction is high', 'Quick fixes can resolve 60% of issues
            ],
            actionItems: ['Address footer typography issues', 'Test mobile responsiveness', 'Implement color scheme feedback', 'Schedule client review call
            ]
          },
          message: 'AI summary generated successfully
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action',
          supportedActions: ['add_comment', 'add_voice_comment', 'add_screen_recording', 'update_comment_status', 'approve_file', 'request_changes', 'generate_ai_summary
          ]
        }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Client Feedback POST API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process client feedback request',
        details: error instanceof Error ? error.message : 'Unknown error
      },
      { status: 500 }
    )
  }
} 