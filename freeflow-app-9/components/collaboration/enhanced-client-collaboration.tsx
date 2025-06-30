'use client'

import React, { useState, useRef, useReducer, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
 new: FileVersion | null }
  notificationSettings: {
    mentions: boolean
    approvals: boolean
    replies: boolean
    dailySummary: boolean
  }
}

type ClientCollabAction =
  | { type: 'SET_ACTIVE_FILE'; file: ProjectFile | null }
  | { type: 'ADD_COMMENT'; comment: ClientComment }
  | { type: &apos;UPDATE_COMMENT&apos;; id: string; updates: Partial<ClientComment> }
  | { type: 'RESOLVE_COMMENT'; id: string; resolvedBy: string }
  | { type: 'START_RECORDING'; recordingType: 'voice' | 'screen' }
  | { type: 'STOP_RECORDING'; blob: Blob; duration: number }
  | { type: 'SET_COMMENT_CONTENT'; content: string }
  | { type: 'TOGGLE_AI_SUMMARY' }
  | { type: 'TOGGLE_COMPARISON_MODE' }
  | { type: 'ADD_REACTION'; commentId: string; reaction: ClientReaction }

function clientCollabReducer(state: ClientCollabState, action: ClientCollabAction): ClientCollabState {
  switch (action.type) {
    case 'SET_ACTIVE_FILE':
      return { 
        ...state, 
        activeFile: action.file,
        comments: action.file?.comments || [],
        selectedPosition: null 
      }
    
    case 'ADD_COMMENT':
      const newComments = [...state.comments, action.comment]
      return { 
        ...state, 
        comments: newComments,
        commentContent: '',
        selectedPosition: null,
        voiceBlob: null,
        screenBlob: null
      }
    
    case 'RESOLVE_COMMENT':
      const resolvedComments = state.comments.map(c => 
        c.id === action.id 
          ? { 
              ...c, 
              isResolved: true, 
              resolvedBy: action.resolvedBy,
              resolvedAt: new Date().toISOString(),
              status: 'resolved' as const
            } 
          : c
      )
      return { ...state, comments: resolvedComments }
    
    case 'START_RECORDING':
      return { 
        ...state, 
        isRecording: true, 
        recordingType: action.recordingType,
        recordingDuration: 0 
      }
    
    case 'STOP_RECORDING':
      const blobField = state.recordingType === 'voice' ? 'voiceBlob' : 'screenBlob
      return { 
        ...state, 
        isRecording: false,
        recordingType: null,
        [blobField]: action.blob,
        recordingDuration: action.duration
      }
    
    case 'SET_COMMENT_CONTENT':
      return { ...state, commentContent: action.content }
    
    case 'TOGGLE_AI_SUMMARY':
      return { ...state, showAISummary: !state.showAISummary }
    
    case 'TOGGLE_COMPARISON_MODE':
      return { ...state, comparisonMode: !state.comparisonMode }

    default:
      return state
  }
}

// Sample data
const sampleFiles: ProjectFile[] = [
  {
    id: 'file_1',
    name: 'Homepage Design v3.figma',
    type: 'figma',
    currentVersion: {
      id: 'v3',
      version: '3.0',
      name: 'Homepage Design v3.figma',
      url: '/files/homepage-v3.figma',
      uploadedAt: '2024-01-15T10:30:00Z',
      uploadedBy: 'Alex Designer',
      changelog: 'Updated hero section, improved mobile responsiveness',
      status: 'review
    },
    versions: [
      {
        id: 'v2',
        version: '2.0',
        name: 'Homepage Design v2.figma',
        url: '/files/homepage-v2.figma',
        uploadedAt: '2024-01-12T14:20:00Z',
        uploadedBy: 'Alex Designer',
        changelog: 'Added pricing section, updated color scheme',
        status: 'approved
      }
    ],
    url: '/files/homepage-v3.figma',
    thumbnail: '/images/figma-preview.jpg',
    status: 'needs_review',
    approvalStatus: {
      overall: 'pending',
      elements: {
        'hero_section': 'approved', 'pricing_section': 'pending', 'footer': 'rejected
      }
    },
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
    ],
    aiSummary: {
      totalComments: 2,
      themes: {
        'design': 2, 'mobile_responsiveness': 1, 'typography': 1
      },
      urgentIssues: 1,
      overallSentiment: 'positive',
      estimatedWorkRequired: '2-3 hours',
      keyActionItems: ['Increase footer font size for mobile', 'Test mobile responsiveness', 'Consider hero section approved
      ]
    }
  }
]

interface EnhancedClientCollaborationProps {
  projectId: string
  currentUser: {
    id: string
    name: string
    avatar?: string
    role: 'client' | 'freelancer
  }
  onCommentAdd?: (comment: ClientComment) => void
  onCommentUpdate?: (commentId: string, updates: Partial<ClientComment>) => void
  onFileApproval?: (fileId: string, status: 'approved' | 'changes_required') => void
  className?: string
}

export function EnhancedClientCollaboration({
  projectId,
  currentUser,
  onCommentAdd,
  onCommentUpdate,
  onFileApproval,
  className = 
}: EnhancedClientCollaborationProps) {
  const [state, dispatch] = useReducer(clientCollabReducer, {
    activeFile: sampleFiles[0],
    files: sampleFiles,
    comments: sampleFiles[0]?.comments || [],
    isRecording: false,
    recordingType: null,
    recordingDuration: 0,
    selectedPosition: null,
    commentContent: '',
    voiceBlob: null,
    screenBlob: null,
    viewMode: 'inline',
    filterBy: 'all',
    showAISummary: true,
    comparisonMode: false,
    compareVersions: { old: null, new: null },
    notificationSettings: {
      mentions: true,
      approvals: true,
      replies: true,
      dailySummary: false
    }
  })

  // Voice recording functions
  const startVoiceRecording = async () => {
    dispatch({ type: 'START_RECORDING', recordingType: 'voice' })
    // Simulate recording
    setTimeout(() => {
      const mockBlob = new Blob(['mock audio'], { type: 'audio/mp3' })
      dispatch({ type: 'STOP_RECORDING', blob: mockBlob, duration: 5 })
    }, 3000)
  }

  // Screen recording functions
  const startScreenRecording = async () => {
    dispatch({ type: 'START_RECORDING', recordingType: 'screen' })
    // Simulate screen recording
    setTimeout(() => {
      const mockBlob = new Blob(['mock video'], { type: 'video/mp4' })
      dispatch({ type: 'STOP_RECORDING', blob: mockBlob, duration: 10 })
    }, 5000)
  }

  // Comment submission
  const submitComment = async () => {
    const newComment: ClientComment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: state.commentContent,
      type: state.voiceBlob ? 'voice' : state.screenBlob ? 'screen' : 'text',
      fileType: state.activeFile?.type || 'image',
      position: state.selectedPosition || undefined,
      status: 'pending',
      priority: 'medium',
      category: 'design',
      createdAt: new Date().toISOString(),
      replies: [],
      reactions: [],
      mentions: [],
      voiceNote: state.voiceBlob ? {
        url: URL.createObjectURL(state.voiceBlob),
        duration: state.recordingDuration,
        waveform: Array.from({ length: 15 }, () => Math.floor(Math.random() * 40) + 10)
      } : undefined,
      screenRecording: state.screenBlob ? {
        url: URL.createObjectURL(state.screenBlob),
        duration: state.recordingDuration,
        thumbnail: '/images/screen-thumb.jpg
      } : undefined,
      isResolved: false
    }

    dispatch({ type: 'ADD_COMMENT', comment: newComment })
    onCommentAdd?.(newComment)
  }

  const getStatusColor = (status: ClientComment['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200
      case 'changes_required': return 'bg-red-100 text-red-700 border-red-200
      case 'in_review': return 'bg-yellow-100 text-yellow-700 border-yellow-200
      case 'resolved': return 'bg-blue-100 text-blue-700 border-blue-200
      default: return 'bg-gray-100 text-gray-700 border-gray-200
    }
  }

  const getFileStatusIcon = (status: ProjectFile['status']) => {
    switch (status) {
      case &apos;approved&apos;: return <CheckCircle className= "w-5 h-5 text-green-600" />
      case &apos;changes_required&apos;: return <AlertCircle className= "w-5 h-5 text-red-600" />
      case &apos;needs_review&apos;: return <Clock className= "w-5 h-5 text-yellow-600" />
      default: return <Clock className= "w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Header with AI Summary */}
      <div className= "flex justify-between items-start">
        <div className= "space-y-2">
          <h2 className= "text-2xl font-bold text-slate-800">Client Collaboration</h2>
          <p className= "text-slate-600">Advanced feedback system with AI-powered insights</p>
          
          {state.activeFile?.aiSummary && state.showAISummary && (
            <Card className= "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200/50">
              <CardContent className= "p-4">
                <div className= "flex items-center gap-2 mb-2">
                  <Sparkles className= "w-4 h-4 text-purple-600" />
                  <span className= "text-sm font-medium text-purple-800">AI Summary</span>
                </div>
                <div className= "grid grid-cols-4 gap-3 text-sm">
                  <div className= "text-center">
                    <div className= "font-semibold text-slate-800">{state.activeFile.aiSummary.totalComments}</div>
                    <div className= "text-slate-600">Comments</div>
                  </div>
                  <div className= "text-center">
                    <div className= "font-semibold text-red-600">{state.activeFile.aiSummary.urgentIssues}</div>
                    <div className= "text-slate-600">Urgent</div>
                  </div>
                  <div className= "text-center">
                    <div className= "font-semibold text-blue-600">{state.activeFile.aiSummary.estimatedWorkRequired}</div>
                    <div className= "text-slate-600">Est. Work</div>
                  </div>
                  <div className= "text-center">
                    <div className= "font-semibold text-green-600 capitalize">{state.activeFile.aiSummary.overallSentiment}</div>
                    <div className= "text-slate-600">Sentiment</div>
                  </div>
                </div>
                
                <div className= "mt-3 p-2 bg-white/60 rounded">
                  <p className= "text-sm font-medium text-slate-700 mb-1">Key Action Items:</p>
                  <ul className= "text-xs text-slate-600 space-y-1">
                    {state.activeFile.aiSummary.keyActionItems.map((item, index) => (
                      <li key={index} className= "flex items-start gap-2">
                        <div className= "w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className= "flex items-center gap-2">
          <Button
            variant= "outline
            size= "sm
            onClick={() => dispatch({ type: 'TOGGLE_COMPARISON_MODE' })}
            className={state.comparisonMode ? 'bg-blue-100 text-blue-700' : }
          >
            <GitCompare className= "w-4 h-4 mr-2" />
            Compare Versions
          </Button>
          <Button
            variant= "outline
            size= "sm
            onClick={() => dispatch({ type: 'TOGGLE_AI_SUMMARY' })}
            className={state.showAISummary ? 'bg-purple-100 text-purple-700' : }
          >
            <Sparkles className= "w-4 h-4 mr-2" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* File Selection and Status */}
      <Card className= "bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <div className= "flex justify-between items-center">
            <CardTitle className= "flex items-center gap-3">
              {getFileStatusIcon(state.activeFile?.status || 'needs_review')}
              <span>{state.activeFile?.name}</span>
              <Badge className={getStatusColor(state.activeFile?.status === 'approved' ? &apos;approved&apos; : &apos;pending&apos;)}>
                {state.activeFile?.status?.replace('_', ' ') || 'Unknown Status'}
              </Badge>
            </CardTitle>
            
            <div className= "flex items-center gap-2">
              {currentUser.role === 'client' && (
                <>
                  <Button
                    size= "sm
                    className= "bg-green-600 hover:bg-green-700 text-white
                    onClick={() => {
                      if (state.activeFile) {
                        onFileApproval?.(state.activeFile.id, 'approved')
                      }
                    }}
                  >
                    <CheckCircle className= "w-4 h-4 mr-2" />
                    Approve File
                  </Button>
                  <Button
                    size= "sm
                    variant= "outline
                    className= "border-red-300 text-red-600 hover:bg-red-50
                    onClick={() => {
                      if (state.activeFile) {
                        onFileApproval?.(state.activeFile.id, 'changes_required')
                      }
                    }}
                  >
                    <AlertCircle className= "w-4 h-4 mr-2" />
                    Request Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Area */}
      <div className= "grid grid-cols-12 gap-6">
        {/* File Preview */}
        <div className= "col-span-8">
          <Card className= "bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardContent className= "p-6">
              {/* Mock Figma File Preview */}
              <div className= "relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-video rounded-lg overflow-hidden group">
                <div className= "absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"></div>
                
                {/* Mock Design Elements */}
                <div className= "absolute inset-4 bg-white/90 rounded-lg p-6">
                  {/* Header */}
                  <div className= "flex items-center justify-between mb-6" id= "hero_section">
                    <div className= "h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded w-32"></div>
                    <div className= "flex gap-2">
                      <div className= "w-8 h-8 bg-slate-200 rounded"></div>
                      <div className= "w-8 h-8 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Hero Content */}
                  <div className= "text-center mb-8">
                    <div className= "h-6 bg-slate-300 rounded w-3/4 mx-auto mb-3"></div>
                    <div className= "h-4 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
                    <div className= "w-32 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded mx-auto"></div>
                  </div>
                  
                  {/* Cards */}
                  <div className= "grid grid-cols-3 gap-4 mb-6">
                    <div className= "h-20 bg-gradient-to-br from-rose-100 to-orange-100 rounded"></div>
                    <div className= "h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded"></div>
                    <div className= "h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded"></div>
                  </div>
                  
                  {/* Footer */}
                  <div className= "text-center" id= "footer">
                    <div className= "h-3 bg-slate-300 rounded w-1/4 mx-auto mb-2"></div>
                    <div className= "h-3 bg-slate-200 rounded w-1/6 mx-auto"></div>
                  </div>
                </div>

                {/* Comment Pins */}
                {state.comments.map((comment) => (
                  comment.position && (
                    <div 
                      key={comment.id}
                      className= "absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2
                      style={{ left: `${comment.position.x}%`, top: `${comment.position.y}%` }}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg hover:scale-110 transition-transform ${
                        comment.status === 'approved' ? 'bg-green-500' :
                        comment.status === 'changes_required' ? 'bg-red-500' :
                        comment.status === 'resolved' ? 'bg-blue-500' :
                        'bg-yellow-500
                      }`}>
                        <Pin className= "w-3 h-3" />
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Recording Controls */}
              <div className= "mt-4 flex items-center gap-2">
                <Button
                  size= "sm
                  variant= "outline
                  onClick={startVoiceRecording}
                  disabled={state.isRecording}
                  className= "flex items-center gap-2
                >
                  {state.isRecording && state.recordingType === 'voice' ? (
                    <>
                      <MicOff className= "w-4 h-4 text-red-500" />
                      Recording... {state.recordingDuration}s
                    </>
                  ) : (
                    <>
                      <Mic className= "w-4 h-4" />
                      Voice Comment
                    </>
                  )}
                </Button>
                
                <Button
                  size= "sm
                  variant= "outline
                  onClick={startScreenRecording}
                  disabled={state.isRecording}
                  className= "flex items-center gap-2
                >
                  {state.isRecording && state.recordingType === 'screen' ? (
                    <>
                      <Camera className= "w-4 h-4 text-red-500" />
                      Recording... {state.recordingDuration}s
                    </>
                  ) : (
                    <>
                      <Camera className= "w-4 h-4" />
                      Screen Record
                    </>
                  )}
                </Button>

                <Input
                  placeholder= "Add a text comment...
                  value={state.commentContent}
                  onChange={(e) => dispatch({ type: 'SET_COMMENT_CONTENT', content: e.target.value })}
                  className= "flex-1
                />

                {(state.voiceBlob || state.screenBlob || state.commentContent) && (
                  <Button size= "sm" onClick={submitComment} className= "bg-green-600 hover:bg-green-700 text-white">
                    <Send className= "w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments Sidebar */}
        <div className= "col-span-4">
          <Card className= "bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className= "text-lg font-semibold flex items-center gap-2">
                <MessageSquare className= "w-5 h-5" />
                Feedback ({state.comments.length})
              </CardTitle>
            </CardHeader>
            
            <CardContent className= "space-y-4 max-h-96 overflow-y-auto">
              {state.comments.map((comment) => (
                <div key={comment.id} className= "border border-slate-200 rounded-lg p-3 space-y-3">
                  <div className= "flex items-start gap-3">
                    <Avatar className= "w-8 h-8">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className= "flex-1 space-y-2">
                      <div className= "flex items-center justify-between">
                        <span className= "text-sm font-medium">{comment.userName}</span>
                        <Badge className={getStatusColor(comment.status)} variant= "outline">
                          {comment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className= "text-sm text-slate-700">{comment.content}</p>
                      
                      {comment.voiceNote && (
                        <div className= "flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <Button size= "sm" variant= "ghost">
                            <Play className= "w-3 h-3" />
                          </Button>
                          <div className= "flex-1 h-6 bg-blue-100 rounded flex items-center px-2">
                            <div className= "flex gap-1">
                              {comment.voiceNote.waveform.slice(0, 10).map((height, i) => (
                                <div
                                  key={i}
                                  className= "w-1 bg-blue-500 rounded
                                  style={{ height: `${height/3}px` }}
                                />
                              ))}
                            </div>
                          </div>
                          <span className= "text-xs text-blue-600">{comment.voiceNote.duration}s</span>
                        </div>
                      )}
                      
                      <div className= "flex items-center justify-between text-xs text-slate-500">
                        <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                        <div className= "flex items-center gap-2">
                          <Button
                            size= "sm
                            variant= "ghost
                            className= "h-6 px-2
                          >
                            <ThumbsUp className= "w-3 h-3" />
                          </Button>
                          
                          {currentUser.role === 'freelancer' && !comment.isResolved && (
                            <Button
                              size= "sm
                              variant= "ghost
                              className= "h-6 px-2
                              onClick={() => dispatch({
                                type: 'RESOLVE_COMMENT',
                                id: comment.id,
                                resolvedBy: currentUser.id
                              })}
                            >
                              <CheckCircle className= "w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Threaded replies */}
                      {comment.replies.length > 0 && (
                        <div className= "ml-4 border-l-2 border-slate-200 pl-3 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className= "text-sm">
                              <span className= "font-medium">{reply.userName}:</span>
                              <span className= "ml-2 text-slate-600">{reply.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {state.comments.length === 0 && (
                <div className= "text-center py-8 text-slate-500">
                  <MessageCircle className= "w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No feedback yet</p>
                  <p className= "text-sm">Click on the design to add comments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 