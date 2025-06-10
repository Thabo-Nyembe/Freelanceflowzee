'use client'

import React, { useState, useRef, useReducer, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  Video, 
  Send, 
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff,
  Users,
  X,
  Pin,
  MapPin,
  Volume2,
  VolumeX
} from 'lucide-react'

interface User {
  id: string
  name: string
  avatar?: string
  role: 'freelancer' | 'client'
  isOnline: boolean
}

interface Comment {
  id: string
  userId: string
  content: string
  createdAt: string
  position?: { x: number; y: number }
}

// Context7 Pattern: State Management with useReducer
interface CallState {
  isActive: boolean
  type: 'audio' | 'video' | null
  duration: number
  participants: User[]
  isMuted: boolean
  isCameraOn: boolean
  isScreenSharing: boolean
  volume: number
  status: 'idle' | 'connecting' | 'connected' | 'disconnected'
}

type CallAction =
  | { type: 'START_CALL'; callType: 'audio' | 'video'; participants: User[] }
  | { type: 'END_CALL' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_CAMERA' }
  | { type: 'TOGGLE_SCREEN_SHARE' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'SET_STATUS'; status: CallState['status'] }
  | { type: 'UPDATE_DURATION'; duration: number }
  | { type: 'ADD_PARTICIPANT'; participant: User }
  | { type: 'REMOVE_PARTICIPANT'; participantId: string }

function callReducer(state: CallState, action: CallAction): CallState {
  switch (action.type) {
    case 'START_CALL':
      return {
        ...state,
        isActive: true,
        type: action.callType,
        participants: action.participants,
        status: 'connecting',
        duration: 0,
        isCameraOn: action.callType === 'video'
      }
    case 'END_CALL':
      return {
        ...state,
        isActive: false,
        type: null,
        duration: 0,
        participants: [],
        status: 'idle',
        isMuted: false,
        isCameraOn: true,
        isScreenSharing: false
      }
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted }
    case 'TOGGLE_CAMERA':
      return { ...state, isCameraOn: !state.isCameraOn }
    case 'TOGGLE_SCREEN_SHARE':
      return { ...state, isScreenSharing: !state.isScreenSharing }
    case 'SET_VOLUME':
      return { ...state, volume: action.volume }
    case 'SET_STATUS':
      return { ...state, status: action.status }
    case 'UPDATE_DURATION':
      return { ...state, duration: action.duration }
    case 'ADD_PARTICIPANT':
      return {
        ...state,
        participants: [...state.participants, action.participant]
      }
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(p => p.id !== action.participantId)
      }
    default:
      return state
  }
}

interface EnhancedCollaborationChatProps {
  currentUser: User
  connectedUsers: User[]
  selectedImage?: string
  onCommentAdd?: (content: string, position?: { x: number; y: number }) => void
}

export function EnhancedCollaborationChat({ 
  currentUser, 
  connectedUsers, 
  selectedImage,
  onCommentAdd 
}: EnhancedCollaborationChatProps) {
  // Chat state
  const [messages, setMessages] = useState<Comment[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isAddingImageComment, setIsAddingImageComment] = useState(false)
  const [imageComments, setImageComments] = useState<Comment[]>([])
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null)

  // Call state using Context7 reducer pattern
  const [callState, dispatchCall] = useReducer(callReducer, {
    isActive: false,
    type: null,
    duration: 0,
    participants: [],
    isMuted: false,
    isCameraOn: true,
    isScreenSharing: false,
    volume: 50,
    status: 'idle'
  })

  // Timer for call duration
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Call duration effect
  useEffect(() => {
    if (callState.isActive && callState.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        dispatchCall({ type: 'UPDATE_DURATION', duration: callState.duration + 1 })
      }, 1000)
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
        callTimerRef.current = null
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [callState.isActive, callState.status, callState.duration])

  // Call management functions
  const startCall = async (type: 'audio' | 'video') => {
    dispatchCall({ 
      type: 'START_CALL', 
      callType: type, 
      participants: connectedUsers.filter(u => u.isOnline) 
    })
    
    // Simulate connection process
    setTimeout(() => {
      dispatchCall({ type: 'SET_STATUS', status: 'connected' })
    }, 2000)
  }

  const endCall = () => {
    dispatchCall({ type: 'END_CALL' })
  }

  const toggleMute = () => {
    dispatchCall({ type: 'TOGGLE_MUTE' })
  }

  const toggleCamera = () => {
    dispatchCall({ type: 'TOGGLE_CAMERA' })
  }

  const toggleScreenShare = () => {
    dispatchCall({ type: 'TOGGLE_SCREEN_SHARE' })
  }

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Comment = {
      id: `msg_${Date.now()}`,
      userId: currentUser.id,
      content: newMessage,
      createdAt: new Date().toISOString(),
      position: selectedPosition || undefined
    }

    if (selectedPosition) {
      setImageComments(prev => [...prev, message])
      if (onCommentAdd) {
        onCommentAdd(newMessage, selectedPosition)
      }
      setSelectedPosition(null)
      setIsAddingImageComment(false)
    } else {
      setMessages(prev => [...prev, message])
    }

    setNewMessage('')
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isAddingImageComment) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setSelectedPosition({ x, y })
  }

  return (
    <div className="space-y-6">
      {/* Call In Progress Panel */}
      {callState.isActive && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {callState.type === 'video' ? (
                  <Video className="h-5 w-5 text-green-600" />
                ) : (
                  <Phone className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <h3 className="font-semibold text-green-800">
                    {callState.type === 'video' ? 'Video Call' : 'Audio Call'} 
                    {callState.status === 'connecting' ? ' Connecting...' : ' in Progress'}
                  </h3>
                  <p className="text-sm text-green-600">
                    {callState.status === 'connected' 
                      ? formatCallDuration(callState.duration)
                      : 'Establishing connection...'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {callState.participants.length + 1} participants
                </Badge>
                <div className="flex -space-x-2">
                  {callState.participants.slice(0, 3).map(user => (
                    <Avatar key={user.id} className="border-2 border-white h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs bg-green-100">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={toggleMute}
                size="sm"
                variant={callState.isMuted ? "destructive" : "outline"}
                className="rounded-full w-10 h-10 p-0"
                title={callState.isMuted ? "Unmute" : "Mute"}
              >
                {callState.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              {callState.type === 'video' && (
                <Button
                  onClick={toggleCamera}
                  size="sm"
                  variant={!callState.isCameraOn ? "destructive" : "outline"}
                  className="rounded-full w-10 h-10 p-0"
                  title={callState.isCameraOn ? "Turn off camera" : "Turn on camera"}
                >
                  {!callState.isCameraOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                </Button>
              )}
              
              <Button
                onClick={toggleScreenShare}
                size="sm"
                variant={callState.isScreenSharing ? "default" : "outline"}
                className="rounded-full w-10 h-10 p-0"
                title={callState.isScreenSharing ? "Stop sharing" : "Share screen"}
              >
                {callState.isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center gap-2 px-3">
                <VolumeX className="h-4 w-4 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={callState.volume}
                  onChange={(e) => dispatchCall({ type: 'SET_VOLUME', volume: parseInt(e.target.value) })}
                  className="w-16"
                />
                <Volume2 className="h-4 w-4 text-gray-500" />
              </div>
              
              <Button
                onClick={endCall}
                size="sm"
                variant="destructive"
                className="rounded-full w-10 h-10 p-0"
                title="End call"
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview with Comments */}
      {selectedImage && (
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">Design Preview</CardTitle>
              <Button
                onClick={() => setIsAddingImageComment(!isAddingImageComment)}
                variant={isAddingImageComment ? "default" : "outline"}
                size="sm"
                className={isAddingImageComment ? "bg-purple-600" : "border-purple-200 text-purple-600"}
              >
                <Pin className="h-4 w-4 mr-2" />
                {isAddingImageComment ? 'Click to Pin' : 'Add Pin Comment'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="relative">
              <img
                src={selectedImage}
                alt="Design preview"
                className="w-full rounded-lg cursor-pointer"
                onClick={handleImageClick}
              />
              
              {/* Image Comments Overlay */}
              {imageComments.map((comment) => (
                <div
                  key={comment.id}
                  className="absolute bg-purple-500 text-white p-2 rounded-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:bg-purple-600 transition-colors"
                  style={{
                    left: `${comment.position?.x}%`,
                    top: `${comment.position?.y}%`
                  }}
                  title={comment.content}
                >
                  <MapPin className="h-4 w-4" />
                </div>
              ))}
              
              {/* Selected Position Indicator */}
              {selectedPosition && (
                <div
                  className="absolute bg-yellow-400 text-black p-2 rounded-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{
                    left: `${selectedPosition.x}%`,
                    top: `${selectedPosition.y}%`
                  }}
                >
                  <MapPin className="h-4 w-4" />
                </div>
              )}
            </div>
            
            {isAddingImageComment && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 mb-2">
                  {selectedPosition 
                    ? `Comment position selected at ${selectedPosition.x.toFixed(1)}%, ${selectedPosition.y.toFixed(1)}%` 
                    : 'Click on the image to select a position for your comment'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Team Communication
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {!callState.isActive && (
                <>
                  <Button
                    onClick={() => startCall('audio')}
                    size="sm"
                    variant="outline"
                    className="border-green-200 text-green-600 hover:bg-green-50"
                    disabled={callState.status === 'connecting'}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Audio Call
                  </Button>
                  <Button
                    onClick={() => startCall('video')}
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    disabled={callState.status === 'connecting'}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Call
                  </Button>
                </>
              )}
              
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">{connectedUsers.filter(u => u.isOnline).length}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...messages, ...imageComments].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            ).map((message) => {
              const user = message.userId === currentUser.id ? currentUser : 
                connectedUsers.find(u => u.id === message.userId) || currentUser
              
              return (
                <div key={message.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-800">{user.name}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                      {message.position && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">
                          <Pin className="h-3 w-3 mr-1" />
                          Image Comment
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{message.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={selectedPosition 
                ? "Add your comment for the selected position..." 
                : "Type your message..."
              }
              className="flex-1 bg-white border-slate-200"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedPosition && (
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Position selected: {selectedPosition.x.toFixed(1)}%, {selectedPosition.y.toFixed(1)}%</span>
              <Button 
                onClick={() => {
                  setSelectedPosition(null)
                  setIsAddingImageComment(false)
                }}
                size="sm"
                variant="ghost"
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
