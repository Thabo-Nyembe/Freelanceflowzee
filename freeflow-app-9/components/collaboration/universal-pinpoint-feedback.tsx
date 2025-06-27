'use client'

import React, { useState, useRef, useReducer, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
 comment: UPFComment }
  | { type: &apos;UPDATE_COMMENT&apos;; id: string; updates: Partial<UPFComment> }
  | { type: 'DELETE_COMMENT'; id: string }
  | { type: 'SET_SELECTED_POSITION'; position: UPFComment['position'] | null }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; blob: Blob; duration: number }
  | { type: 'SET_COMMENT_CONTENT'; content: string }
  | { type: 'SET_COMMENT_TYPE'; commentType: UPFComment['type'] }
  | { type: 'SET_COMMENT_PRIORITY'; priority: UPFComment['priority'] }
  | { type: 'TOGGLE_ADDING_COMMENT' }
  | { type: 'SET_VIEW_MODE'; mode: UPFState['viewMode'] }
  | { type: 'SET_FILTER'; filter: UPFState['filterBy'] }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_AI_SUGGESTIONS' }
  | { type: 'SET_AI_PROCESSING'; processing: boolean }
  | { type: 'TOGGLE_AUDIO_PLAYBACK'; commentId: string }
  | { type: 'ADD_REACTION'; commentId: string; reaction: UPFReaction }
  | { type: 'FILTER_COMMENTS' }

function upfReducer(state: UPFState, action: UPFAction): UPFState {
  switch (action.type) {
    case 'SET_ACTIVE_FILE':
      return { ...state, activeFile: action.file, selectedPosition: null }
    
    case 'ADD_COMMENT':
      const newComments = [...state.comments, action.comment]
      return { 
        ...state, 
        comments: newComments,
        filteredComments: filterComments(newComments, state.filterBy, state.searchQuery),
        commentContent: '','
        selectedPosition: null,
        isAddingComment: false,
        voiceBlob: null
      }
    
    case 'UPDATE_COMMENT':
      const updatedComments = state.comments.map(c => 
        c.id === action.id ? { ...c, ...action.updates } : c
      )
      return { 
        ...state, 
        comments: updatedComments,
        filteredComments: filterComments(updatedComments, state.filterBy, state.searchQuery)
      }
    
    case 'SET_SELECTED_POSITION':
      return { ...state, selectedPosition: action.position }
    
    case 'START_RECORDING':
      return { ...state, isRecording: true, recordingDuration: 0 }
    
    case 'STOP_RECORDING':
      return { 
        ...state, 
        isRecording: false, 
        voiceBlob: action.blob,
        recordingDuration: action.duration
      }
    
    case 'SET_COMMENT_CONTENT':
      return { ...state, commentContent: action.content }
    
    case 'SET_COMMENT_TYPE':
      return { ...state, commentType: action.commentType }
    
    case 'SET_COMMENT_PRIORITY':
      return { ...state, commentPriority: action.priority }
    
    case 'TOGGLE_ADDING_COMMENT':
      return { ...state, isAddingComment: !state.isAddingComment }
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode }
    
    case 'SET_FILTER':
      const filtered = filterComments(state.comments, action.filter, state.searchQuery)
      return { ...state, filterBy: action.filter, filteredComments: filtered }
    
    case 'SET_SEARCH_QUERY':
      const searchFiltered = filterComments(state.comments, state.filterBy, action.query)
      return { ...state, searchQuery: action.query, filteredComments: searchFiltered }
    
    case 'TOGGLE_AI_SUGGESTIONS':
      return { ...state, showAISuggestions: !state.showAISuggestions }
    
    case 'SET_AI_PROCESSING':
      return { ...state, isProcessingAI: action.processing }
    
    case 'TOGGLE_AUDIO_PLAYBACK':
      return { 
        ...state, 
        isPlayingAudio: { 
          ...state.isPlayingAudio, 
          [action.commentId]: !state.isPlayingAudio[action.commentId] 
        }
      }
    
    case 'ADD_REACTION':
      const reactedComments = state.comments.map(c => 
        c.id === action.commentId 
          ? { 
              ...c, 
              reactions: c.reactions.filter(r => r.userId !== action.reaction.userId).concat(action.reaction)
            }
          : c
      )
      return { 
        ...state, 
        comments: reactedComments,
        filteredComments: filterComments(reactedComments, state.filterBy, state.searchQuery)
      }
    
    case 'FILTER_COMMENTS':
      return { 
        ...state, 
        filteredComments: filterComments(state.comments, state.filterBy, state.searchQuery)
      }
    
    default:
      return state
  }
}

// Helper function to filter comments
function filterComments(comments: UPFComment[], filter: string, search: string): UPFComment[] {
  let filtered = comments

  // Apply status filter
  if (filter !== 'all') {
    if (filter === 'priority') {
      filtered = filtered.filter(c => c.priority === 'high' || c.priority === 'urgent')
    } else {
      filtered = filtered.filter(c => c.status === filter)
    }
  }

  // Apply search filter
  if (search.trim()) {
    filtered = filtered.filter(c => 
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.userName.toLowerCase().includes(search.toLowerCase())
    )
  }

  return filtered
}

interface UniversalPinpointFeedbackProps {
  projectId: string
  files: MediaFile[]
  currentUser: {
    id: string
    name: string
    avatar?: string
    role: 'client' | 'freelancer'
  }
  onCommentAdd?: (comment: UPFComment) => void
  onCommentUpdate?: (commentId: string, updates: Partial<UPFComment>) => void
  className?: string
}

export function UniversalPinpointFeedback({
  projectId,
  files,
  currentUser,
  onCommentAdd,
  onCommentUpdate,
  className = '
}: UniversalPinpointFeedbackProps) {
  // Initialize state with Context7 reducer pattern
  const [state, dispatch] = useReducer(upfReducer, {
    activeFile: files[0] || null,
    comments: [],
    filteredComments: [],
    isRecording: false,
    recordingDuration: 0,
    selectedPosition: null,
    isAddingComment: false,
    commentContent: '','
    commentType: 'text',
    commentPriority: 'medium',
    voiceBlob: null,
    isPlayingAudio: {},
    viewMode: 'overlay',
    filterBy: 'all',
    searchQuery: '','
    showAISuggestions: true,
    isProcessingAI: false,
    clientMode: currentUser.role === 'client'
  })

  // Refs for media elements
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordingTimer = useRef<NodeJS.Timeout | null>(null)

  // Initialize with sample data for demo
  useEffect(() => {
    const sampleComments: UPFComment[] = [
      {
        id: 'comment_1',
        userId: 'user_2',
        userName: 'Sarah Johnson',
        userAvatar: '/avatars/sarah.jpg',
        content: 'Love this transition! Can we make it 0.2s slower for better impact?',
        type: 'video',
        position: { timestamp: 23.5 },
        status: 'open',
        priority: 'medium',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: [],
        reactions: [
          { userId: 'user_1', type: 'thumbs_up', createdAt: new Date().toISOString() }
        ],
        mentions: ['user_1'],
        aiSuggestion: {
          summary: 'Timing adjustment suggestion for smoother user experience',
          category: 'UX Enhancement',
          severity: 'info'
        }
      },
      {
        id: 'comment_2',
        userId: 'user_3',
        userName: 'Mike Developer',
        content: 'The header positioning needs adjustment on mobile devices',
        type: 'image',
        position: { x: 15, y: 25 },
        status: 'open',
        priority: 'high',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        replies: [],
        reactions: [],
        mentions: [],
        aiSuggestion: {
          summary: 'Responsive design issue requiring mobile optimization',
          category: 'Responsive Design',
          severity: 'warning'
        }
      }
    ]
    
    sampleComments.forEach(comment => {
      dispatch({ type: 'ADD_COMMENT', comment })
    })
  }, [])

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        dispatch({ type: 'STOP_RECORDING', blob, duration: state.recordingDuration })
      }

      mediaRecorder.current.start()
      dispatch({ type: 'START_RECORDING' })

      // Start timer
      let seconds = 0
      recordingTimer.current = setInterval(() => {
        seconds += 1
        dispatch({ type: 'STOP_RECORDING', blob: new Blob(), duration: seconds })
      }, 1000)

    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorder.current && state.isRecording) {
      mediaRecorder.current.stop()
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
    }
  }

  // AI-powered comment analysis
  const analyzeCommentWithAI = async (content: string): Promise<UPFComment['aiSuggestion']> => {
    dispatch({ type: 'SET_AI_PROCESSING', processing: true })
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const suggestions = [
      {
        summary: 'Design improvement suggestion with high impact potential',
        category: 'Design Enhancement',
        severity: 'info' as const
      },
      {
        summary: 'Critical accessibility issue requiring immediate attention',
        category: 'Accessibility',
        severity: 'error' as const
      },
      {
        summary: 'Performance optimization opportunity identified',
        category: 'Performance',
        severity: 'warning' as const
      }
    ]
    
    dispatch({ type: 'SET_AI_PROCESSING', processing: false })
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  // Media interaction handlers
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!state.isAddingComment) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    dispatch({ 
      type: 'SET_SELECTED_POSITION', 
      position: { x, y }
    })
    dispatch({ type: 'SET_COMMENT_TYPE', commentType: 'image' })
  }

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!state.isAddingComment || !videoRef.current) return
    
    const timestamp = videoRef.current.currentTime
    dispatch({ 
      type: 'SET_SELECTED_POSITION', 
      position: { timestamp }
    })
    dispatch({ type: 'SET_COMMENT_TYPE', commentType: 'video' })
  }

  // Comment submission
  const submitComment = async () => {
    if (!state.commentContent.trim() && !state.voiceBlob) return

    const newComment: UPFComment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: state.commentContent,
      type: state.commentType,
      position: state.selectedPosition || undefined,
      status: 'open',
      priority: state.commentPriority,
      createdAt: new Date().toISOString(),
      replies: [],
      reactions: [],
      mentions: extractMentions(state.commentContent),
      voiceNote: state.voiceBlob ? {
        url: URL.createObjectURL(state.voiceBlob),
        duration: state.recordingDuration,
        waveform: generateWaveform()
      } : undefined
    }

    // Add AI analysis if enabled
    if (state.showAISuggestions && state.commentContent.trim()) {
      newComment.aiSuggestion = await analyzeCommentWithAI(state.commentContent)
    }

    dispatch({ type: 'ADD_COMMENT', comment: newComment })
    onCommentAdd?.(newComment)
  }

  // Helper functions
  const extractMentions = (content: string): string[] => {
    const mentions = content.match(/@(\w+)/g)
    return mentions ? mentions.map(m => m.substring(1)) : []
  }

  const generateWaveform = (): number[] => {
    return Array.from({ length: 50 }, () => Math.random() * 100)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`'
  }

  const getPriorityColor = (priority: UPFComment['priority']) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority]
  }

  const getStatusColor = (status: UPFComment['status']) => {
    const colors = {
      open: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    }
    return colors[status]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className= "flex items-center justify-between">
        <div>
          <h2 className= "text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className= "h-6 w-6 text-purple-600" />
            Universal Pinpoint Feedback
          </h2>
          <p className= "text-gray-600">AI-powered collaboration across all media types</p>
        </div>
        
        <div className= "flex items-center gap-2">
          <Button
            onClick={() => dispatch({ type: 'TOGGLE_AI_SUGGESTIONS' })}
            variant={state.showAISuggestions ? "default" : "outline"}
            size= "sm"
            className= "bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Sparkles className= "h-4 w-4 mr-2" />
            AI Insights
          </Button>
          
          <div className= "flex border border-gray-200 rounded-lg">
            <Button
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'overlay' })}
              variant={state.viewMode === 'overlay' ? "default" : "ghost"}
              size= "sm"
              className= "rounded-r-none"
            >
              <Grid className= "h-4 w-4" />
            </Button>
            <Button
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'timeline' })}
              variant={state.viewMode === 'timeline' ? "default" : "ghost"}
              size= "sm"
              className= "rounded-none"
            >
              <Clock className= "h-4 w-4" />
            </Button>
            <Button
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' })}
              variant={state.viewMode === 'grid' ? "default" : "ghost"}
              size= "sm"
              className= "rounded-l-none"
            >
              <List className= "h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className= "grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Viewer */}
        <div className= "lg:col-span-2 space-y-4">
          {/* File Selector */}
          <Card className= "bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader className= "pb-3">
              <CardTitle className= "text-lg font-semibold flex items-center gap-2">
                <FileText className= "h-5 w-5" />
                Project Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className= "grid grid-cols-2 md:grid-cols-4 gap-3">
                {files.map((file) => (
                  <Button
                    key={file.id}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_FILE', file })}
                    variant={state.activeFile?.id === file.id ? "default" : "outline"}
                    className= "h-auto p-3 flex flex-col items-center gap-2"
                  >
                    {file.type === 'video' && <Video className= "h-6 w-6" />}
                    {file.type === 'image' && <ImageIcon className= "h-6 w-6" />}
                    {file.type === 'pdf' && <FileText className= "h-6 w-6" />}
                    {file.type === 'code' && <Code className= "h-6 w-6" />}
                    <span className= "text-xs text-center">{file.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Media Display */}
          {state.activeFile && (
            <Card className= "bg-white/70 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <div className= "flex items-center justify-between">
                  <CardTitle className= "text-lg font-semibold">{state.activeFile.name}</CardTitle>
                  <div className= "flex items-center gap-2">
                    <Button
                      onClick={() => dispatch({ type: 'TOGGLE_ADDING_COMMENT' })}
                      variant={state.isAddingComment ? "default" : "outline"}
                      size= "sm"
                      className={state.isAddingComment ? "bg-purple-600" : "border-purple-200 text-purple-600"}
                    >
                      <Pin className= "h-4 w-4 mr-2" />
                      {state.isAddingComment ? 'Click to Pin' : 'Add Comment'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className= "relative">
                  {/* Video Player */}
                  {state.activeFile.type === 'video' && (
                    <div className= "relative">
                      <video
                        ref={videoRef}
                        src={state.activeFile.url}
                        className= "w-full rounded-lg cursor-pointer"
                        controls
                        onClick={handleVideoClick}
                      />
                      
                      {/* Video Timestamp Comments */}
                      {state.viewMode === 'overlay' && state.filteredComments
                        .filter(c => c.type === 'video' && c.position?.timestamp !== undefined)
                        .map((comment) => (
                          <div
                            key={comment.id}
                            className= "absolute bottom-16 bg-purple-500 text-white p-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors transform -translate-x-1/2"
                            style={{
                              left: `${((comment.position?.timestamp || 0) / (state.activeFile?.metadata?.duration || 1)) * 100}%`
                            }}
                            title={comment.content}
                          >
                            <Clock className= "h-4 w-4" />
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Image Viewer */}
                  {state.activeFile.type === 'image' && (
                    <div className= "relative">
                      <img src={state.activeFile.url} alt={state.activeFile.name} onClick={handleImageClick}>
                      
                      {/* Image Position Comments */}
                      {state.viewMode === 'overlay' && state.filteredComments
                        .filter(c => c.type === 'image' && c.position?.x !== undefined)
                        .map((comment) => (
                          <div key={comment.id} style={{
                              left: `${comment.position?.x} title={comment.content}>
                            <MapPin >
                          </div>
                        ))}

                      {/* Selected Position Indicator */}
                      {state.selectedPosition?.x !== undefined && (
                        <div style={{
                            left: `${state.selectedPosition.x}>
                          <MapPin >
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document Viewer */}
                  {state.activeFile.type === 'pdf' && (
                    <div >
                      <DocViewer documents={[{ uri: state.activeFile.url, fileName: state.activeFile.name } pluginRenderers={DocViewerRenderers} style={{ height: '100%&apos; }>
                    </div>
                  )}
                </div>

                {/* Comment Input */}
                {state.isAddingComment && (
                  <div >
                    <div >
                      <h4 >Add Your Feedback</h4>
                      {state.selectedPosition && (
                        <Badge >
                          Position: {state.selectedPosition.x?.toFixed(1)}%, {state.selectedPosition.y?.toFixed(1)}%
                          {state.selectedPosition.timestamp && ` | Time: ${formatTime(state.selectedPosition.timestamp)}`}
                        </Badge>
                      )}
                    </div>

                    <Textarea value={state.commentContent}> dispatch({ type: 'SET_COMMENT_CONTENT&apos;, content: e.target.value })}
                      placeholder= "Share your feedback..."
                      className= "bg-white"
                    />

                    <div >
                      <select value={state.commentPriority}> dispatch({ type: &apos;SET_COMMENT_PRIORITY&apos;, priority: e.target.value as UPFComment['priority'] })}
                        className= "px-3 py-1 border border-purple-200 rounded-md text-sm"
                      >
                        <option >Low Priority</option>
                        <option >Medium Priority</option>
                        <option >High Priority</option>
                        <option >Urgent</option>
                      </select>

                      <Button onClick={state.isRecording ? stopVoiceRecording : startVoiceRecording} variant={state.isRecording ? "destructive&quot; : &quot;outline&quot;}>
                        {state.isRecording ? (
                          <>
                            <MicOff >
                            Stop ({state.recordingDuration}s)
                          </>
                        ) : (
                          <>
                            <Mic >
                            Voice Note
                          </>
                        )}
                      </Button>

                      {state.voiceBlob && (
                        <Badge >
                          <Volume2 >
                          {state.recordingDuration}s recorded
                        </Badge>
                      )}
                    </div>

                    <div >
                      <div >
                        {state.showAISuggestions && (
                          <Badge >
                            <Sparkles >
                            AI Analysis Enabled
                          </Badge>
                        )}
                      </div>
                      
                      <div >
                        <Button > {
                            dispatch({ type: 'TOGGLE_ADDING_COMMENT' })
                            dispatch({ type: 'SET_SELECTED_POSITION', position: null })
                          }}
                          variant= "ghost"
                          size= "sm"
                        >
                          Cancel
                        </Button>
                        <Button onClick={submitComment} disabled={!state.commentContent.trim() && !state.voiceBlob}>
                          <Send >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Comments Panel */}
        <div >
          {/* Search and Filter */}
          <Card >
            <CardContent >
              <div >
                <Search >
                <Input value={state.searchQuery}> dispatch({ type: &apos;SET_SEARCH_QUERY&apos;, query: e.target.value })}
                  placeholder= "Search comments..."
                  className= "pl-10"
                />
              </div>
              
              <div >
                {['all', 'open', 'resolved', 'priority'].map((filter) => (
                  <Button key={filter}> dispatch({ type: &apos;SET_FILTER&apos;, filter: filter as UPFState['filterBy'] })}
                    variant={state.filterBy === filter ? "default" : "outline"}
                    size= "sm"
                    className= "capitalize"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <Card >
            <CardHeader >
              <CardTitle >
                <span >
                  <MessageCircle >
                  Feedback ({state.filteredComments.length})
                </span>
                <Badge >
                  {state.filteredComments.filter(c => c.status === 'open').length} Open
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent >
              {state.filteredComments.map((comment) => (
                <div key={comment.id}>
                  <div >
                    <div >
                      <Avatar >
                        <AvatarImage src={comment.userAvatar}>
                        <AvatarFallback >{comment.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div >
                        <div >
                          <span >{comment.userName}</span>
                          <Badge className={getPriorityColor(comment.priority)}>
                            {comment.priority}
                          </Badge>
                          <Badge className={getStatusColor(comment.status)}>
                            {comment.status}
                          </Badge>
                        </div>
                        
                        <p >{comment.content}</p>
                        
                        {comment.position && (
                          <div >
                            {comment.type === 'video' && comment.position.timestamp !== undefined && (
                              <span >
                                <Clock >
                                Time: {formatTime(comment.position.timestamp)}
                              </span>
                            )}
                            {comment.type === 'image' && comment.position.x !== undefined && (
                              <span >
                                <MapPin >
                                Position: {comment.position.x.toFixed(1)}%, {comment.position.y?.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}

                        {comment.voiceNote && (
                          <div >
                            <Button > dispatch({ type: &apos;TOGGLE_AUDIO_PLAYBACK&apos;, commentId: comment.id })}
                              size= "sm"
                              variant= "ghost"
                            >
                              {state.isPlayingAudio[comment.id] ? (
                                <Pause >
                              ) : (
                                <Play >
                              )}
                            </Button>
                            <div >
                              <div >
                                {comment.voiceNote.waveform.slice(0, 20).map((height, i) => (
                                  <div key={i} style={{ height: `${height/5}>
                                ))}
                              </div>
                            </div>
                            <span >{comment.voiceNote.duration}s</span>
                          </div>
                        )}

                        {comment.aiSuggestion && state.showAISuggestions && (
                          <div >
                            <div >
                              <Sparkles >
                              <span >AI Insight</span>
                              <Badge className={
                                  comment.aiSuggestion.severity === 'error' ? 'bg-red-100 text-red-700' :
                                  comment.aiSuggestion.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }>
                                {comment.aiSuggestion.category}
                              </Badge>
                            </div>
                            <p >{comment.aiSuggestion.summary}</p>
                          </div>
                        )}

                        <div >
                          <div >
                            <div >
                              {['thumbs_up', 'heart', 'laugh'].map((reactionType) => {
                                const count = comment.reactions.filter(r => r.type === reactionType).length
                                return count > 0 ? (
                                  <Button key={reactionType}> dispatch({
                                      type: 'ADD_REACTION',
                                      commentId: comment.id,
                                      reaction: {
                                        userId: currentUser.id,
                                        type: reactionType as UPFReaction['type'],
                                        createdAt: new Date().toISOString()
                                      }
                                    })}
                                    variant= "ghost"
                                    size= "sm"
                                    className= "h-6 px-2 text-xs"
                                  >
                                    {reactionType === 'thumbs_up' && <ThumbsUp >}
                                    {reactionType === 'heart' && <Heart >}
                                    {reactionType === 'laugh' && '😂'}
                                    <span >{count}</span>
                                  </Button>
                                ) : null
                              })}
                            </div>
                            
                            <Button > dispatch({
                                type: 'ADD_REACTION',
                                commentId: comment.id,
                                reaction: {
                                  userId: currentUser.id,
                                  type: 'thumbs_up',
                                  createdAt: new Date().toISOString()
                                }
                              })}
                              variant= "ghost"
                              size= "sm"
                              className= "h-6 px-2 text-xs"
                            >
                              <ThumbsUp >
                            </Button>
                            
                            <Button >
                              <MessageSquare >
                              Reply
                            </Button>
                          </div>
                          
                          <div >
                            {currentUser.role === 'freelancer' && (
                              <Button > dispatch({
                                  type: 'UPDATE_COMMENT',
                                  id: comment.id,
                                  updates: { 
                                    status: comment.status === 'resolved' ? 'open' : 'resolved',
                                    updatedAt: new Date().toISOString()
                                  }
                                })}
                                size= "sm"
                                variant={comment.status === 'resolved' ? "default" : "outline"}
                                className= "h-6 px-2 text-xs"
                              >
                                <CheckCircle >
                                {comment.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                              </Button>
                            )}
                            <span >
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {state.filteredComments.length === 0 && (
                <div >
                  <MessageCircle >
                  <p >No comments found</p>
                  <p >Start by adding feedback to your media files</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Summary Panel */}
          {state.showAISuggestions && state.filteredComments.length > 0 && (
            <Card >
              <CardHeader >
                <CardTitle >
                  <Sparkles >
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent >
                <div >
                  <div >
                    <div >
                      {state.filteredComments.filter(c => c.priority === 'high' || c.priority === 'urgent').length}
                    </div>
                    <div >High Priority</div>
                  </div>
                  <div >
                    <div >
                      {state.filteredComments.filter(c => c.aiSuggestion?.category === 'UX Enhancement').length}
                    </div>
                    <div >UX Issues</div>
                  </div>
                </div>
                
                <div >
                  <p >
                    <strong >Key Themes:</strong> Design improvements, responsive issues, and timing adjustments are the main focus areas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 