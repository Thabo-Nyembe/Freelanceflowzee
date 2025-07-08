'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  MessageSquare,
  FileText,
  Video,
  Calendar,
  Share2,
  Settings,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Participant {
  id: string
  name: string
  role: string
  avatar?: string
  status: 'online' | 'offline' | 'away' | 'busy'
  lastActive?: string
}

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  type: 'text' | 'file' | 'system'
  fileUrl?: string
  fileName?: string
}

interface CollaborationSession {
  id: string
  title: string
  type: 'document' | 'design' | 'video' | 'meeting'
  participants: Participant[]
  messages: Message[]
  createdAt: string
  updatedAt: string
  status: 'active' | 'archived' | 'scheduled'
}

interface EnhancedCollaborationSystemProps {
  sessionId?: string
  onCreateSession?: (session: Partial<CollaborationSession>) => void
  onJoinSession?: (sessionId: string) => void
  onLeaveSession?: (sessionId: string) => void
  onSendMessage?: (sessionId: string, message: Partial<Message>) => void
  onUpdateSession?: (sessionId: string, updates: Partial<CollaborationSession>) => void
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
}

export default function EnhancedCollaborationSystem({
  sessionId,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onSendMessage,
  onUpdateSession,
}: EnhancedCollaborationSystemProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('participants')
  const [message, setMessage] = useState('')
  const [session, setSession] = useState<CollaborationSession | null>(null)

  // Simulated data - replace with real data fetching
  const mockSession: CollaborationSession = {
    id: '123',
    title: 'Project Brainstorming',
    type: 'document',
    participants: [
      {
        id: '1',
        name: 'John Doe',
        role: 'Project Lead',
        status: 'online',
        lastActive: 'Just now',
      },
      {
        id: '2',
        name: 'Jane Smith',
        role: 'Designer',
        status: 'busy',
        lastActive: '5 minutes ago',
      },
    ],
    messages: [
      {
        id: '1',
        senderId: '1',
        content: 'Let\'s start with the project overview',
        timestamp: '2024-03-20T10:00:00Z',
        type: 'text',
      },
    ],
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
    status: 'active',
  }

  useEffect(() => {
    // Simulate session loading
    if (sessionId) {
      setSession(mockSession)
    }
  }, [sessionId])

  const handleSendMessage = () => {
    if (!message.trim() || !sessionId) return

    const newMessage: Partial<Message> = {
      content: message,
      type: 'text',
      timestamp: new Date().toISOString(),
    }

    onSendMessage?.(sessionId, newMessage)
    setMessage('')
  }

  const renderParticipants = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Participants ({session?.participants.length})</h3>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </div>
      <div className="space-y-2">
        {session?.participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>{participant.name[0]}</AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                    statusColors[participant.status]
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{participant.name}</p>
                <p className="text-xs text-muted-foreground">{participant.role}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{participant.lastActive}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChat = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {session?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.senderId === '1' ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {session.participants.find((p) => p.id === msg.senderId)?.name[0]}
              </AvatarFallback>
            </Avatar>
            <div
              className={`rounded-lg p-3 max-w-[70%] ${
                msg.senderId === '1'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  )

  if (!session) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">No Active Session</h2>
          <p className="text-muted-foreground mt-2">
            Create or join a collaboration session to get started
          </p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => onCreateSession?.({})}>Create Session</Button>
            <Button variant="outline" onClick={() => router.push('/sessions')}>
              Browse Sessions
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">{session.title}</h2>
          <p className="text-sm text-muted-foreground">
            {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="participants"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Users className="h-4 w-4 mr-2" />
            Participants
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <FileText className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
        </TabsList>
        <TabsContent value="participants" className="flex-1 p-4">
          {renderParticipants()}
        </TabsContent>
        <TabsContent value="chat" className="flex-1 p-0">
          {renderChat()}
        </TabsContent>
        <TabsContent value="files" className="flex-1 p-4">
          <div className="text-center text-muted-foreground">
            No files shared yet
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
} 