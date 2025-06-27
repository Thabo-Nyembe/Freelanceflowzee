'use client'

import React, { useState, useReducer, useRef, useEffect } from 'react'
 y: number }
  startTime: number
  endTime: number
  style: unknown
  createdBy: string
}

interface VideoChapter {
  id: string
  title: string
  startTime: number
  thumbnail: string
  description?: string
}

interface ViewerAnalytics {
  totalViews: number
  averageWatchTime: number
  engagementRate: number
  dropOffPoints: { time: number; percentage: number }[]
  audienceRetention: number[]
  peakViewers: number
  comments: number
  shares: number
  likes: number
}

// Enhanced Context7 Reducer
const videoStudioReducer = (state: VideoStudioState, action: unknown): VideoStudioState => {
  switch (action.type) {
    case 'START_RECORDING':
      return { ...state, isRecording: true, isPaused: false }
    case 'STOP_RECORDING':
      return { ...state, isRecording: false, isPaused: false }
    case 'PAUSE_RECORDING':
      return { ...state, isPaused: !state.isPaused }
    case 'SET_RECORDING_MODE':
      return { ...state, recordingMode: action.mode }
    case 'TOGGLE_AUDIO':
      return { ...state, audioEnabled: !state.audioEnabled }
    case 'TOGGLE_VIDEO':
      return { ...state, videoEnabled: !state.videoEnabled }
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.time }
    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom }
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying }
    case 'ADD_RECORDING':
      return { ...state, recordings: [...state.recordings, action.recording] }
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.comment] }
    case 'UPDATE_TRANSCRIPTION':
      return { ...state, transcription: action.transcription }
    case 'UPDATE_AI_ANALYSIS':
      return { ...state, aiAnalysis: action.analysis }
    case 'UPDATE_LIVE_VIEWERS':
      return { ...state, liveViewers: action.viewers }
    case 'SET_EDITING_TOOL':
      return { ...state, editingTool: action.tool, isEditing: action.tool !== null }
    case 'UPDATE_EXPORT_PROGRESS':
      return { ...state, exportProgress: action.progress }
    case 'ADD_ANNOTATION':
      return { ...state, annotations: [...state.annotations, action.annotation] }
    case 'ADD_CHAPTER':
      return { ...state, chapters: [...state.chapters, action.chapter] }
    default:
      return state
  }
}

const initialState: VideoStudioState = {
  isRecording: false,
  isPaused: false,
  recordingMode: 'screen',
  audioEnabled: true,
  videoEnabled: true,
  currentTime: 0,
  duration: 0,
  zoom: 100,
  isPlaying: false,
  selectedClip: null,
  recordings: [],
  liveViewers: [],
  comments: [],
  transcription: [],
  aiAnalysis: {
    summary: '','
    keyTopics: [],
    sentiment: 'neutral',
    engagementScore: 0,
    suggestedTags: [],
    optimizationTips: [],
    accessibilityScore: 0,
    qualityScore: 0,
    contentType: '','
    difficulty: 'beginner',
    estimatedWatchTime: 0
  },
  collaborators: [],
  isLiveSession: false,
  qualitySettings: {
    resolution: '1080p',
    frameRate: 60,
    bitrate: 5000,
    audioQuality: 'high',
    compression: 'balanced'
  },
  annotations: [],
  chapters: [],
  isEditing: false,
  editingTool: null,
  exportProgress: 0,
  viewerAnalytics: {
    totalViews: 0,
    averageWatchTime: 0,
    engagementRate: 0,
    dropOffPoints: [],
    audienceRetention: [],
    peakViewers: 0,
    comments: 0,
    shares: 0,
    likes: 0
  }
}

interface EnterpriseVideoStudioProps {
  projectId: string
  currentUser: unknown
  onRecordingComplete?: (recording: VideoRecording) => void
  onShare?: (recording: VideoRecording) => void
  className?: string
}

export function EnterpriseVideoStudio({
  projectId,
  currentUser,
  onRecordingComplete,
  onShare,
  className = '
}: EnterpriseVideoStudioProps) {
  const [state, dispatch] = useReducer(videoStudioReducer, initialState)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Simulated real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live viewers
      dispatch({
        type: 'UPDATE_LIVE_VIEWERS',
        viewers: [
          { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah-chen.jpg', timestamp: Date.now(), isActive: true, cursor: { x: 120, y: 80 }, isWatching: true },'
          { id: '2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', timestamp: Date.now(), isActive: true, cursor: { x: 200, y: 150 }, isWatching: true },'
          { id: '3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', timestamp: Date.now(), isActive: false, cursor: { x: 0, y: 0 }, isWatching: true }'
        ]
      })

      // Simulate real-time transcription
      if (state.isRecording && !state.isPaused) {
        const newSegment: TranscriptionSegment = {
          id: `seg-${Date.now()}`,
          text: "This is an AI-generated transcription segment...",
          startTime: state.currentTime,
          endTime: state.currentTime + 5,
          confidence: 0.95,
          aiGenerated: true,
          isEdited: false
        }
        dispatch({ type: 'UPDATE_TRANSCRIPTION', transcription: [...state.transcription, newSegment] })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [state.isRecording, state.isPaused, state.currentTime, state.transcription])

  const startRecording = async () => {
    try {
      let stream: MediaStream

      if (state.recordingMode === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: state.qualitySettings.frameRate }
          }, 
          audio: state.audioEnabled 
        })
      } else if (state.recordingMode === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: state.videoEnabled, 
          audio: state.audioEnabled 
        })
      } else {
        // Both - screen + camera overlay
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        
        // Combine streams (simplified - would need more complex implementation)
        stream = screenStream
      }

      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: state.qualitySettings.bitrate * 1000
      })
      
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.start()
      dispatch({ type: 'START_RECORDING' })

      // Simulate AI analysis
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_AI_ANALYSIS',
          analysis: {
            summary: "Product demo video showcasing key features with excellent visual clarity",
            keyTopics: ["Product Features", "User Interface", "Demo Flow"],
            sentiment: 'positive',
            engagementScore: 87,
            suggestedTags: ["product-demo", "tutorial", "interface"],
            optimizationTips: ["Add captions for accessibility", "Include call-to-action at end"],
            accessibilityScore: 78,
            qualityScore: 94,
            contentType: "Product Demo",
            difficulty: 'intermediate',
            estimatedWatchTime: 45
          }
        })
      }, 5000)

    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop()
      streamRef.current.getTracks().forEach(track => track.stop())
      
      dispatch({ type: 'STOP_RECORDING' })
      
      // Simulate adding recording to list
      const newRecording: VideoRecording = {
        id: `rec-${Date.now()}`,
        title: `Screen Recording ${new Date().toLocaleTimeString()}`,
        duration: 45,
        size: 15.6,
        format: 'MP4',
        quality: state.qualitySettings.resolution,
        thumbnail: '/placeholder.jpg',
        createdAt: new Date().toISOString(),
        views: 0,
        comments: 3,
        likes: 7,
        shares: 2,
        url: '/placeholder.mp4',
        transcriptUrl: '/transcript.txt',
        aiSummary: "Professional product demonstration with clear navigation flow",
        tags: ["demo", "tutorial", "product"],
        isPublic: false,
        downloadEnabled: true,
        passwordProtected: false
      }
      
      dispatch({ type: 'ADD_RECORDING', recording: newRecording })
      onRecordingComplete?.(newRecording)
    }
  }

  const addComment = (content: string, timestamp: number) => {
    const newComment: VideoComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      timestamp: Date.now(),
      videoTimestamp: timestamp,
      replies: [],
      reactions: [],
      createdAt: new Date().toISOString(),
      isResolved: false,
      aiSentiment: 'positive'
    }
    
    dispatch({ type: 'ADD_COMMENT', comment: newComment })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`'
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className= "flex items-center justify-between">
        <div>
          <h2 className= "text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className= "p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
              <Video className= "h-8 w-8 text-white" />
            </div>
            Enterprise Video Studio
          </h2>
          <p className= "text-gray-600 mt-1">
            Loom-level video recording with AI transcription, real-time collaboration & advanced editing
          </p>
        </div>
        
        <div className= "flex items-center gap-3">
          <Badge variant= "outline" className= "bg-green-50 text-green-700 border-green-200">
            <Eye className= "h-3 w-3 mr-1" />
            {state.liveViewers.filter(v => v.isWatching).length} watching
          </Badge>
          <Badge variant= "outline" className= "bg-blue-50 text-blue-700 border-blue-200">
            <Brain className= "h-3 w-3 mr-1" />
            AI Enhanced
          </Badge>
          <Badge variant= "outline" className= "bg-purple-50 text-purple-700 border-purple-200">
            <Sparkles className= "h-3 w-3 mr-1" />
            Enterprise
          </Badge>
        </div>
      </div>

      <Tabs defaultValue= "record" className= "w-full">
        <TabsList className= "grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value= "record" className= "flex items-center gap-2">
            <Video className= "h-4 w-4" />
            Record
          </TabsTrigger>
          <TabsTrigger value= "edit" className= "flex items-center gap-2">
            <Edit3 className= "h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value= "library" className= "flex items-center gap-2">
            <Square className= "h-4 w-4" />
            Library
          </TabsTrigger>
          <TabsTrigger value= "analytics" className= "flex items-center gap-2">
            <TrendingUp className= "h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value= "collaborate" className= "flex items-center gap-2">
            <Users className= "h-4 w-4" />
            Live Session
          </TabsTrigger>
        </TabsList>

        {/* Record Tab */}
        <TabsContent value= "record" className= "space-y-6">
          <div className= "grid grid-cols-12 gap-6">
            {/* Recording Interface */}
            <div className= "col-span-8">
              <Card className= "bg-gradient-to-br from-slate-50 to-white border-slate-200/50">
                <CardHeader>
                  <div className= "flex items-center justify-between">
                    <CardTitle className= "flex items-center gap-2">
                      <Camera className= "h-5 w-5 text-blue-600" />
                      Recording Studio
                    </CardTitle>
                    <div className= "flex items-center gap-2">
                      {state.isRecording && (
                        <Badge variant= "destructive" className= "animate-pulse">
                          <div className= "w-2 h-2 bg-white rounded-full mr-2"></div>
                          REC {formatTime(state.currentTime)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className= "space-y-4">
                  {/* Recording Preview */}
                  <div className= "relative bg-black rounded-lg aspect-video overflow-hidden">
                    <video
                      ref={videoRef}
                      className= "w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                    
                    {/* Live Cursors for Collaboration */}
                    {state.liveViewers.map((viewer) => (
                      <div
                        key={viewer.id}
                        className= "absolute pointer-events-none transition-all duration-200"
                        style={{
                          left: `${viewer.cursor.x}px`,
                          top: `${viewer.cursor.y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className= "flex items-center gap-1">
                          <div className= "w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className= "text-xs bg-blue-500 text-white px-2 py-1 rounded">
                            {viewer.name}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Recording Controls Overlay */}
                    {state.isRecording && (
                      <div className= "absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className= "flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
                          <Button
                            size= "sm"
                            variant={state.isPaused ? "default" : "outline"}
                            onClick={() => dispatch({ type: 'PAUSE_RECORDING' })}
                            className= "rounded-full"
                          >
                            {state.isPaused ? <Play className= "h-4 w-4" /> : <Pause className= "h-4 w-4" />}
                          </Button>
                          <Button
                            size= "sm"
                            variant= "destructive"
                            onClick={stopRecording}
                            className= "rounded-full"
                          >
                            <StopCircle className= "h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recording Controls */}
                  <div className= "flex items-center justify-between">
                    <div className= "flex items-center gap-4">
                      <Select
                        value={state.recordingMode}
                        onValueChange={(mode: unknown) => dispatch({ type: 'SET_RECORDING_MODE', mode })}
                      >
                        <SelectTrigger className= "w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value= "screen">
                            <div className= "flex items-center gap-2">
                              <Monitor className= "h-4 w-4" />
                              Screen Only
                            </div>
                          </SelectItem>
                          <SelectItem value= "camera">
                            <div className= "flex items-center gap-2">
                              <Camera className= "h-4 w-4" />
                              Camera Only
                            </div>
                          </SelectItem>
                          <SelectItem value= "both">
                            <div className= "flex items-center gap-2">
                              <Video className= "h-4 w-4" />
                              Screen + Camera
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant={state.audioEnabled ? "default" : "outline"}
                        size= "sm"
                        onClick={() => dispatch({ type: 'TOGGLE_AUDIO' })}
                      >
                        <Mic className= "h-4 w-4" />
                      </Button>

                      <Button
                        variant={state.videoEnabled ? "default" : "outline"}
                        size= "sm"
                        onClick={() => dispatch({ type: 'TOGGLE_VIDEO' })}
                      >
                        <Camera className= "h-4 w-4" />
                      </Button>
                    </div>

                    <div className= "flex items-center gap-2">
                      {!state.isRecording ? (
                        <Button
                          onClick={startRecording}
                          className= "bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Video className= "h-4 w-4 mr-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          variant= "destructive"
                        >
                          <StopCircle className= "h-4 w-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Collaboration Panel */}
            <div className= "col-span-4">
              <Card className= "bg-gradient-to-br from-purple-50 to-white border-purple-200/50">
                <CardHeader>
                  <CardTitle className= "flex items-center gap-2">
                    <Users className= "h-5 w-5 text-purple-600" />
                    Live Collaboration
                  </CardTitle>
                  <CardDescription>
                    Real-time viewers and AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className= "space-y-4">
                  {/* Live Viewers */}
                  <div className= "space-y-3">
                    <h4 className= "font-medium text-sm text-gray-700">Live Viewers ({state.liveViewers.length})</h4>
                    {state.liveViewers.map((viewer) => (
                      <div key={viewer.id} className= "flex items-center gap-3">
                        <Avatar className= "h-8 w-8">
                          <AvatarImage src={viewer.avatar} />
                          <AvatarFallback>{viewer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className= "flex-1">
                          <p className= "text-sm font-medium">{viewer.name}</p>
                          <p className= "text-xs text-gray-500">
                            {viewer.isWatching ? 'Watching' : 'Idle'}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${viewer.isActive ? &apos;bg-green-500&apos; : &apos;bg-gray-300&apos;}`}></div>
                      </div>
                    ))}
                  </div>

                  {/* AI Insights */}
                  {state.aiAnalysis.summary && (
                    <div className= "bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <h4 className= "font-medium text-sm text-blue-900 mb-2 flex items-center gap-2">
                        <Brain className= "h-4 w-4" />
                        AI Insights
                      </h4>
                      <p className= "text-sm text-blue-800 mb-2">{state.aiAnalysis.summary}</p>
                      <div className= "flex flex-wrap gap-1">
                        {state.aiAnalysis.keyTopics.map((topic, index) => (
                          <Badge key={index} variant= "outline" className= "text-xs bg-blue-100 text-blue-700 border-blue-300">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className= "space-y-2">
                    <h4 className= "font-medium text-sm text-gray-700">Quick Actions</h4>
                    <div className= "grid grid-cols-2 gap-2">
                      <Button size= "sm" variant= "outline" className= "text-xs">
                        <Share2 className= "h-3 w-3 mr-1" />
                        Share
                      </Button>
                      <Button size= "sm" variant= "outline" className= "text-xs">
                        <Download className= "h-3 w-3 mr-1" />
                        Export
                      </Button>
                      <Button size= "sm" variant= "outline" className= "text-xs">
                        <Subtitles className= "h-3 w-3 mr-1" />
                        Captions
                      </Button>
                      <Button size= "sm" variant= "outline" className= "text-xs">
                        <Settings className= "h-3 w-3 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value= "library" className= "space-y-6">
          <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.recordings.map((recording) => (
              <Card key={recording.id} className= "group hover:shadow-lg transition-all duration-200">
                <CardContent className= "p-0">
                  <div className= "relative">
                    <img src={recording.thumbnail} alt={recording.title}>
                    <div >
                      <Button >
                        <Play >
                      </Button>
                    </div>
                    <Badge >
                      {formatTime(recording.duration)}
                    </Badge>
                  </div>
                  
                  <div >
                    <h3 >{recording.title}</h3>
                    
                    <div >
                      <span >{recording.quality}</span>
                      <span >{formatFileSize(recording.size * 1024 * 1024)}</span>
                    </div>
                    
                    <div >
                      <span >
                        <Eye >
                        {recording.views}
                      </span>
                      <span >
                        <MessageSquare >
                        {recording.comments}
                      </span>
                      <span >
                        <Share2 >
                        {recording.shares}
                      </span>
                    </div>
                    
                    {recording.aiSummary && (
                      <p >
                        {recording.aiSummary}
                      </p>
                    )}
                    
                    <div >
                      <Button >
                        <Edit3 >
                        Edit
                      </Button>
                      <Button >
                        <Share2 >
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent >
          <div >
            <Card >
              <CardContent >
                <div >
                  <div >
                    <p >Total Views</p>
                    <p >{state.viewerAnalytics.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye >
                </div>
              </CardContent>
            </Card>
            
            <Card >
              <CardContent >
                <div >
                  <div >
                    <p >Avg. Watch Time</p>
                    <p >{formatTime(state.viewerAnalytics.averageWatchTime)}</p>
                  </div>
                  <Clock >
                </div>
              </CardContent>
            </Card>
            
            <Card >
              <CardContent >
                <div >
                  <div >
                    <p >Engagement Rate</p>
                    <p >{state.viewerAnalytics.engagementRate}%</p>
                  </div>
                  <TrendingUp >
                </div>
              </CardContent>
            </Card>
            
            <Card >
              <CardContent >
                <div >
                  <div >
                    <p >Peak Viewers</p>
                    <p >{state.viewerAnalytics.peakViewers}</p>
                  </div>
                  <Users >
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Session Tab */}
        <TabsContent >
          <Card >
            <CardHeader >
              <CardTitle >
                <Sparkles >
                Enterprise Live Collaboration
              </CardTitle>
              <CardDescription >
                Real-time co-viewing, commenting, and AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent >
              <div >
                <Zap >
                <h3 >Start Live Session</h3>
                <p >
                  Invite team members for real-time collaboration with AI transcription and smart annotations
                </p>
                <Button >
                  <Users >
                  Create Live Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 