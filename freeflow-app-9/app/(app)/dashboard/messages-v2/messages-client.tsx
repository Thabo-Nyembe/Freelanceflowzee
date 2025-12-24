'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageSquare,
  Plus,
  Search,
  Hash,
  Lock,
  Users,
  Settings,
  Bell,
  BellOff,
  Star,
  StarOff,
  Pin,
  Bookmark,
  MoreHorizontal,
  Send,
  Smile,
  Paperclip,
  AtSign,
  Image,
  FileText,
  Video,
  Phone,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Check,
  CheckCheck,
  Reply,
  Forward,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Filter,
  Archive,
  Inbox,
  Download,
  Upload,
  Mic,
  MicOff,
  Headphones,
  Volume2,
  MoreVertical,
  X,
  Maximize2,
  Minimize2,
  MessageCircle,
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  Eye,
  EyeOff,
  UserPlus,
  LogOut,
  Zap,
  Bot,
  Workflow,
  Code,
  Link2,
  Calendar,
  AlertCircle
} from 'lucide-react'

// Types
type ChannelType = 'public' | 'private' | 'direct' | 'group'
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
type UserStatus = 'online' | 'away' | 'dnd' | 'offline'
type ReactionType = 'thumbsup' | 'heart' | 'laugh' | 'celebrate' | 'eyes' | 'fire' | 'check' | 'plus1'

interface User {
  id: string
  name: string
  displayName: string
  email: string
  avatar?: string
  status: UserStatus
  statusText?: string
  title?: string
  timezone?: string
  isBot?: boolean
}

interface Channel {
  id: string
  name: string
  type: ChannelType
  description?: string
  topic?: string
  members: User[]
  memberCount: number
  unreadCount: number
  isMuted: boolean
  isStarred: boolean
  isPinned: boolean
  lastMessage?: Message
  lastActivity: string
  createdAt: string
  createdBy: User
}

interface Message {
  id: string
  channelId: string
  content: string
  author: User
  createdAt: string
  editedAt?: string
  status: MessageStatus
  reactions: Reaction[]
  threadCount: number
  threadParticipants: User[]
  attachments: Attachment[]
  mentions: User[]
  isPinned: boolean
  isBookmarked: boolean
  parentId?: string
  replyTo?: Message
}

interface Reaction {
  type: ReactionType
  count: number
  users: User[]
  hasReacted: boolean
}

interface Attachment {
  id: string
  type: 'file' | 'image' | 'video' | 'audio' | 'code' | 'link'
  name: string
  url: string
  size?: number
  mimeType?: string
  preview?: string
}

interface Thread {
  id: string
  parentMessage: Message
  replies: Message[]
  participantCount: number
  lastReply: string
  isFollowing: boolean
}

// Mock Data
const currentUser: User = {
  id: 'u0',
  name: 'you',
  displayName: 'You',
  email: 'you@example.com',
  status: 'online',
  title: 'Software Engineer'
}

const mockUsers: User[] = [
  { id: 'u1', name: 'sarah.chen', displayName: 'Sarah Chen', email: 'sarah@example.com', status: 'online', title: 'Product Manager', statusText: 'In a meeting' },
  { id: 'u2', name: 'mike.johnson', displayName: 'Mike Johnson', email: 'mike@example.com', status: 'away', title: 'Senior Developer' },
  { id: 'u3', name: 'emily.davis', displayName: 'Emily Davis', email: 'emily@example.com', status: 'online', title: 'Designer' },
  { id: 'u4', name: 'alex.kim', displayName: 'Alex Kim', email: 'alex@example.com', status: 'dnd', title: 'DevOps Engineer', statusText: 'Focusing' },
  { id: 'u5', name: 'slackbot', displayName: 'Slackbot', email: 'bot@slack.com', status: 'online', isBot: true },
  { id: 'u6', name: 'github', displayName: 'GitHub', email: 'github@slack.com', status: 'online', isBot: true }
]

const mockChannels: Channel[] = [
  {
    id: 'c1',
    name: 'general',
    type: 'public',
    description: 'Company-wide announcements and work-based matters',
    topic: 'Welcome to the team! Read the pinned post for guidelines.',
    members: mockUsers,
    memberCount: 156,
    unreadCount: 3,
    isMuted: false,
    isStarred: true,
    isPinned: true,
    lastActivity: '2024-01-15T14:30:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    createdBy: mockUsers[0]
  },
  {
    id: 'c2',
    name: 'engineering',
    type: 'public',
    description: 'Engineering team discussions',
    topic: 'Sprint 24 planning in progress',
    members: [mockUsers[1], mockUsers[3]],
    memberCount: 42,
    unreadCount: 12,
    isMuted: false,
    isStarred: true,
    isPinned: false,
    lastActivity: '2024-01-15T14:28:00Z',
    createdAt: '2023-01-15T00:00:00Z',
    createdBy: mockUsers[1]
  },
  {
    id: 'c3',
    name: 'design-team',
    type: 'private',
    description: 'Private channel for the design team',
    members: [mockUsers[2]],
    memberCount: 8,
    unreadCount: 0,
    isMuted: true,
    isStarred: false,
    isPinned: false,
    lastActivity: '2024-01-15T12:00:00Z',
    createdAt: '2023-02-01T00:00:00Z',
    createdBy: mockUsers[2]
  },
  {
    id: 'c4',
    name: 'random',
    type: 'public',
    description: 'Non-work banter and water cooler conversation',
    topic: 'Share memes, gifs, and good vibes only!',
    members: mockUsers,
    memberCount: 134,
    unreadCount: 0,
    isMuted: false,
    isStarred: false,
    isPinned: false,
    lastActivity: '2024-01-15T10:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    createdBy: mockUsers[0]
  },
  {
    id: 'dm1',
    name: 'Sarah Chen',
    type: 'direct',
    members: [mockUsers[0]],
    memberCount: 2,
    unreadCount: 1,
    isMuted: false,
    isStarred: false,
    isPinned: false,
    lastActivity: '2024-01-15T14:25:00Z',
    createdAt: '2023-06-15T00:00:00Z',
    createdBy: currentUser
  },
  {
    id: 'dm2',
    name: 'Mike Johnson',
    type: 'direct',
    members: [mockUsers[1]],
    memberCount: 2,
    unreadCount: 0,
    isMuted: false,
    isStarred: false,
    isPinned: false,
    lastActivity: '2024-01-14T16:00:00Z',
    createdAt: '2023-07-01T00:00:00Z',
    createdBy: currentUser
  }
]

const mockMessages: Message[] = [
  {
    id: 'm1',
    channelId: 'c1',
    content: 'Hey team! Quick update on the Q1 roadmap - we\'re making great progress on the new features. Check out the attached doc for details.',
    author: mockUsers[0],
    createdAt: '2024-01-15T14:30:00Z',
    status: 'read',
    reactions: [
      { type: 'thumbsup', count: 5, users: mockUsers.slice(0, 5), hasReacted: true },
      { type: 'heart', count: 2, users: mockUsers.slice(0, 2), hasReacted: false }
    ],
    threadCount: 3,
    threadParticipants: [mockUsers[1], mockUsers[2]],
    attachments: [
      { id: 'a1', type: 'file', name: 'Q1_Roadmap.pdf', url: '#', size: 2500000 }
    ],
    mentions: [],
    isPinned: true,
    isBookmarked: false
  },
  {
    id: 'm2',
    channelId: 'c1',
    content: '@sarah.chen Looks great! I have a few questions about the timeline for the API changes.',
    author: mockUsers[1],
    createdAt: '2024-01-15T14:28:00Z',
    status: 'read',
    reactions: [],
    threadCount: 0,
    threadParticipants: [],
    attachments: [],
    mentions: [mockUsers[0]],
    isPinned: false,
    isBookmarked: false,
    parentId: 'm1'
  },
  {
    id: 'm3',
    channelId: 'c1',
    content: 'Sure! Let\'s discuss in the thread. The API changes are scheduled for week 3.',
    author: mockUsers[0],
    createdAt: '2024-01-15T14:26:00Z',
    status: 'read',
    reactions: [
      { type: 'check', count: 1, users: [mockUsers[1]], hasReacted: false }
    ],
    threadCount: 0,
    threadParticipants: [],
    attachments: [],
    mentions: [],
    isPinned: false,
    isBookmarked: false,
    parentId: 'm1'
  },
  {
    id: 'm4',
    channelId: 'c2',
    content: '```javascript\nconst newFeature = {\n  name: "Dark Mode",\n  status: "in-progress",\n  eta: "2024-01-20"\n};\n```\nJust pushed the initial implementation! PR link: https://github.com/example/pr/123',
    author: mockUsers[3],
    createdAt: '2024-01-15T14:20:00Z',
    status: 'read',
    reactions: [
      { type: 'fire', count: 8, users: mockUsers, hasReacted: true },
      { type: 'eyes', count: 3, users: mockUsers.slice(0, 3), hasReacted: false }
    ],
    threadCount: 5,
    threadParticipants: [mockUsers[0], mockUsers[1], mockUsers[2]],
    attachments: [],
    mentions: [],
    isPinned: false,
    isBookmarked: true
  },
  {
    id: 'm5',
    channelId: 'c2',
    content: 'New deployment completed successfully!',
    author: mockUsers[5],
    createdAt: '2024-01-15T14:15:00Z',
    status: 'read',
    reactions: [
      { type: 'celebrate', count: 12, users: mockUsers, hasReacted: true }
    ],
    threadCount: 0,
    threadParticipants: [],
    attachments: [],
    mentions: [],
    isPinned: false,
    isBookmarked: false
  },
  {
    id: 'm6',
    channelId: 'dm1',
    content: 'Hey! Are you free for a quick sync at 3pm?',
    author: mockUsers[0],
    createdAt: '2024-01-15T14:25:00Z',
    status: 'delivered',
    reactions: [],
    threadCount: 0,
    threadParticipants: [],
    attachments: [],
    mentions: [],
    isPinned: false,
    isBookmarked: false
  }
]

export default function MessagesClient() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(mockChannels[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [showChannelList, setShowChannelList] = useState(true)
  const [showThreadPanel, setShowThreadPanel] = useState(false)
  const [selectedThread, setSelectedThread] = useState<Message | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [channelFilter, setChannelFilter] = useState<'all' | 'unread' | 'starred'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredChannels = useMemo(() => {
    let channels = mockChannels
    if (channelFilter === 'unread') {
      channels = channels.filter(c => c.unreadCount > 0)
    } else if (channelFilter === 'starred') {
      channels = channels.filter(c => c.isStarred)
    }
    if (searchQuery) {
      channels = channels.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return channels
  }, [channelFilter, searchQuery])

  const channelMessages = useMemo(() => {
    if (!selectedChannel) return []
    return mockMessages.filter(m => m.channelId === selectedChannel.id && !m.parentId)
  }, [selectedChannel])

  const publicChannels = filteredChannels.filter(c => c.type === 'public')
  const privateChannels = filteredChannels.filter(c => c.type === 'private')
  const directMessages = filteredChannels.filter(c => c.type === 'direct' || c.type === 'group')

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'dnd': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getReactionIcon = (type: ReactionType) => {
    switch (type) {
      case 'thumbsup': return '👍'
      case 'heart': return '❤️'
      case 'laugh': return '😂'
      case 'celebrate': return '🎉'
      case 'eyes': return '👀'
      case 'fire': return '🔥'
      case 'check': return '✅'
      case 'plus1': return '➕'
      default: return '👍'
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffHours < 24) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffHours < 48) {
      return 'Yesterday'
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`
    return `${bytes} B`
  }

  const totalUnread = mockChannels.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900 flex">
      {/* Workspace Sidebar */}
      <div className="w-16 bg-[#3F0E40] flex flex-col items-center py-4 gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
          FF
        </div>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Channel List */}
      {showChannelList && (
        <div className="w-64 bg-[#3F0E40] text-white flex flex-col">
          {/* Workspace Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-lg">FreeFlow</h1>
              <ChevronDown className="w-4 h-4 opacity-60" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(currentUser.status)}`} />
              <span className="text-sm opacity-80">{currentUser.displayName}</span>
            </div>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/10 border-0 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="px-3 py-2 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs ${channelFilter === 'unread' ? 'bg-white/20' : ''} text-white/80 hover:text-white hover:bg-white/10`}
              onClick={() => setChannelFilter(channelFilter === 'unread' ? 'all' : 'unread')}
            >
              <Inbox className="w-3 h-3 mr-1" />
              {totalUnread}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs ${channelFilter === 'starred' ? 'bg-white/20' : ''} text-white/80 hover:text-white hover:bg-white/10`}
              onClick={() => setChannelFilter(channelFilter === 'starred' ? 'all' : 'starred')}
            >
              <Star className="w-3 h-3" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {/* Channels */}
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1 text-sm opacity-70">
                <span className="font-medium">Channels</span>
                <Plus className="w-4 h-4 cursor-pointer hover:opacity-100" />
              </div>
              {publicChannels.map(channel => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedChannel?.id === channel.id}
                  onClick={() => setSelectedChannel(channel)}
                />
              ))}
            </div>

            {/* Private Channels */}
            {privateChannels.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1 text-sm opacity-70">
                  <span className="font-medium">Private</span>
                  <Plus className="w-4 h-4 cursor-pointer hover:opacity-100" />
                </div>
                {privateChannels.map(channel => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isSelected={selectedChannel?.id === channel.id}
                    onClick={() => setSelectedChannel(channel)}
                  />
                ))}
              </div>
            )}

            {/* Direct Messages */}
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1 text-sm opacity-70">
                <span className="font-medium">Direct Messages</span>
                <Plus className="w-4 h-4 cursor-pointer hover:opacity-100" />
              </div>
              {directMessages.map(channel => (
                <DMItem
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedChannel?.id === channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b dark:border-gray-800">
              <div className="flex items-center gap-3">
                {selectedChannel.type === 'direct' ? (
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{selectedChannel.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedChannel.members[0]?.status || 'offline')}`} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {selectedChannel.type === 'private' ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{selectedChannel.name}</h2>
                    {selectedChannel.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  {selectedChannel.topic && (
                    <p className="text-xs text-muted-foreground truncate max-w-md">{selectedChannel.topic}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <Button variant="ghost" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  {selectedChannel.memberCount}
                </Button>
                <Button variant="ghost" size="icon">
                  <Pin className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {channelMessages.map(message => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    formatTime={formatTime}
                    formatFileSize={formatFileSize}
                    getReactionIcon={getReactionIcon}
                    onThreadClick={() => {
                      setSelectedThread(message)
                      setShowThreadPanel(true)
                    }}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t dark:border-gray-800">
              <div className="relative border dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 p-2 border-b dark:border-gray-700">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="w-4 h-4" />
                  </Button>
                  <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Code className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <AtSign className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder={`Message #${selectedChannel.name}`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="border-0 resize-none min-h-[80px] focus-visible:ring-0"
                />
                <div className="flex items-center justify-between p-2 border-t dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button size="sm" disabled={!messageInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p>Choose a channel or direct message to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Thread Panel */}
      {showThreadPanel && selectedThread && (
        <div className="w-96 border-l dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
          <div className="h-14 px-4 flex items-center justify-between border-b dark:border-gray-800">
            <h3 className="font-semibold">Thread</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowThreadPanel(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <MessageItem
              message={selectedThread}
              formatTime={formatTime}
              formatFileSize={formatFileSize}
              getReactionIcon={getReactionIcon}
              isThreadParent
            />
            <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-4 pl-4 mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">{selectedThread.threadCount} replies</p>
              {mockMessages
                .filter(m => m.parentId === selectedThread.id)
                .map(reply => (
                  <MessageItem
                    key={reply.id}
                    message={reply}
                    formatTime={formatTime}
                    formatFileSize={formatFileSize}
                    getReactionIcon={getReactionIcon}
                    isCompact
                  />
                ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t dark:border-gray-800">
            <div className="relative border dark:border-gray-700 rounded-lg">
              <Textarea
                placeholder="Reply..."
                className="border-0 resize-none min-h-[60px] focus-visible:ring-0"
              />
              <div className="flex items-center justify-end p-2">
                <Button size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Channel Item Component
function ChannelItem({
  channel,
  isSelected,
  onClick
}: {
  channel: Channel
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
        isSelected ? 'bg-[#1164A3] text-white' : 'hover:bg-white/10'
      }`}
      onClick={onClick}
    >
      {channel.type === 'private' ? (
        <Lock className="w-4 h-4 opacity-70" />
      ) : (
        <Hash className="w-4 h-4 opacity-70" />
      )}
      <span className="flex-1 truncate text-sm">{channel.name}</span>
      {channel.unreadCount > 0 && (
        <Badge className="bg-red-500 text-white text-xs h-5 min-w-[20px] flex items-center justify-center">
          {channel.unreadCount}
        </Badge>
      )}
      {channel.isMuted && <BellOff className="w-3 h-3 opacity-50" />}
    </div>
  )
}

// DM Item Component
function DMItem({
  channel,
  isSelected,
  onClick,
  getStatusColor
}: {
  channel: Channel
  isSelected: boolean
  onClick: () => void
  getStatusColor: (status: UserStatus) => string
}) {
  const user = channel.members[0]
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
        isSelected ? 'bg-[#1164A3] text-white' : 'hover:bg-white/10'
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="w-5 h-5">
          <AvatarFallback className="text-xs">{channel.name.charAt(0)}</AvatarFallback>
        </Avatar>
        {user && (
          <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#3F0E40] ${getStatusColor(user.status)}`} />
        )}
      </div>
      <span className="flex-1 truncate text-sm">{channel.name}</span>
      {channel.unreadCount > 0 && (
        <Badge className="bg-red-500 text-white text-xs h-5 min-w-[20px] flex items-center justify-center">
          {channel.unreadCount}
        </Badge>
      )}
    </div>
  )
}

// Message Item Component
function MessageItem({
  message,
  formatTime,
  formatFileSize,
  getReactionIcon,
  onThreadClick,
  isThreadParent,
  isCompact
}: {
  message: Message
  formatTime: (date: string) => string
  formatFileSize: (bytes: number) => string
  getReactionIcon: (type: ReactionType) => string
  onThreadClick?: () => void
  isThreadParent?: boolean
  isCompact?: boolean
}) {
  return (
    <div className={`group ${isCompact ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'} px-2 py-2 rounded-lg transition-colors`}>
      <div className="flex gap-3">
        <Avatar className={isCompact ? 'w-6 h-6' : 'w-9 h-9'}>
          <AvatarFallback className={isCompact ? 'text-xs' : ''}>
            {message.author.displayName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{message.author.displayName}</span>
            {message.author.isBot && (
              <Badge variant="outline" className="text-xs py-0 h-4">
                <Bot className="w-3 h-3 mr-1" />
                App
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
            {message.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
            {message.isBookmarked && <Bookmark className="w-3 h-3 text-blue-500" />}
          </div>
          <div className="mt-1 text-sm whitespace-pre-wrap">
            {message.content.includes('```') ? (
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md my-2 font-mono text-xs overflow-x-auto">
                {message.content.replace(/```\w*\n?/g, '')}
              </div>
            ) : (
              message.content
            )}
          </div>

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-xs">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">{attachment.size ? formatFileSize(attachment.size) : ''}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className={`h-6 px-2 text-xs ${reaction.hasReacted ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  {getReactionIcon(reaction.type)} {reaction.count}
                </Button>
              ))}
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                <Smile className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Thread */}
          {message.threadCount > 0 && !isThreadParent && (
            <button
              className="flex items-center gap-2 mt-2 text-xs text-blue-600 hover:underline"
              onClick={onThreadClick}
            >
              <div className="flex -space-x-1">
                {message.threadParticipants.slice(0, 3).map(user => (
                  <Avatar key={user.id} className="w-4 h-4 border border-white">
                    <AvatarFallback className="text-[8px]">{user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Message Actions */}
        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Smile className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
