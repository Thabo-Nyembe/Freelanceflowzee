'use client'

import { useState, useCallback, useMemo } from 'react'
import { useCommunity, type Community, type CommunityType, type CommunityStatus } from '@/lib/hooks/use-community'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users, Plus, MessageSquare, ThumbsUp, Share2, TrendingUp, Award, Star, Heart, Eye,
  Hash, Volume2, Video, Settings, Bell, Pin, Smile, Send, Paperclip, AtSign,
  Search, Filter, MoreHorizontal, ChevronDown, ChevronRight, Lock, Globe, Shield,
  UserPlus, UserMinus, Crown, Mic, MicOff, Headphones, Phone, Camera, ScreenShare,
  Reply, Edit3, Trash2, Flag, Bookmark, Link2, Image as ImageIcon, Gift, Sparkles,
  Circle, CheckCircle, Clock, Zap, MessageCircle, Radio, Megaphone, Calendar
} from 'lucide-react'

// Discord/Slack-style interfaces
interface Channel {
  id: string
  name: string
  type: 'text' | 'voice' | 'announcement' | 'stage' | 'forum'
  description?: string
  isPrivate: boolean
  memberCount: number
  unreadCount: number
  lastActivity: string
  category?: string
}

interface Thread {
  id: string
  channelId: string
  title: string
  author: string
  authorAvatar: string
  messageCount: number
  participantCount: number
  lastReply: string
  isPinned: boolean
  isLocked: boolean
}

interface Message {
  id: string
  author: string
  authorAvatar: string
  content: string
  timestamp: string
  reactions: { emoji: string; count: number; reacted: boolean }[]
  isEdited: boolean
  isPinned: boolean
  replyTo?: { author: string; content: string }
  attachments?: string[]
}

interface Member {
  id: string
  name: string
  avatar: string
  status: 'online' | 'idle' | 'dnd' | 'offline'
  role: 'owner' | 'admin' | 'moderator' | 'member'
  joinedAt: string
  lastSeen: string
  nickname?: string
}

interface Role {
  id: string
  name: string
  color: string
  memberCount: number
  permissions: string[]
}

// Mock channels
const mockChannels: Channel[] = [
  { id: '1', name: 'general', type: 'text', description: 'General discussion', isPrivate: false, memberCount: 1250, unreadCount: 12, lastActivity: '2 min ago', category: 'Text Channels' },
  { id: '2', name: 'announcements', type: 'announcement', description: 'Important updates', isPrivate: false, memberCount: 1250, unreadCount: 1, lastActivity: '1 hour ago', category: 'Text Channels' },
  { id: '3', name: 'help', type: 'text', description: 'Get help from the community', isPrivate: false, memberCount: 980, unreadCount: 5, lastActivity: '5 min ago', category: 'Text Channels' },
  { id: '4', name: 'showcase', type: 'forum', description: 'Share your projects', isPrivate: false, memberCount: 750, unreadCount: 0, lastActivity: '30 min ago', category: 'Text Channels' },
  { id: '5', name: 'lounge', type: 'voice', description: 'Voice chat', isPrivate: false, memberCount: 45, unreadCount: 0, lastActivity: 'Live', category: 'Voice Channels' },
  { id: '6', name: 'team-chat', type: 'text', description: 'Team members only', isPrivate: true, memberCount: 25, unreadCount: 3, lastActivity: '10 min ago', category: 'Private' },
]

// Mock threads
const mockThreads: Thread[] = [
  { id: '1', channelId: '4', title: 'My new SaaS project', author: 'John Developer', authorAvatar: 'john', messageCount: 45, participantCount: 12, lastReply: '5 min ago', isPinned: true, isLocked: false },
  { id: '2', channelId: '4', title: 'Looking for feedback on UI', author: 'Sarah Designer', authorAvatar: 'sarah', messageCount: 23, participantCount: 8, lastReply: '1 hour ago', isPinned: false, isLocked: false },
  { id: '3', channelId: '3', title: 'How to integrate API?', author: 'Mike Engineer', authorAvatar: 'mike', messageCount: 15, participantCount: 5, lastReply: '30 min ago', isPinned: false, isLocked: false },
]

// Mock messages
const mockMessages: Message[] = [
  {
    id: '1',
    author: 'John Developer',
    authorAvatar: 'john',
    content: 'Hey everyone! Just shipped a new feature. Check it out and let me know what you think! 🚀',
    timestamp: '10:30 AM',
    reactions: [{ emoji: '🚀', count: 5, reacted: true }, { emoji: '👍', count: 3, reacted: false }],
    isEdited: false,
    isPinned: false
  },
  {
    id: '2',
    author: 'Sarah Designer',
    authorAvatar: 'sarah',
    content: 'That looks amazing! Love the new dashboard design.',
    timestamp: '10:32 AM',
    reactions: [{ emoji: '❤️', count: 2, reacted: false }],
    isEdited: false,
    isPinned: false,
    replyTo: { author: 'John Developer', content: 'Hey everyone! Just shipped a new feature...' }
  },
  {
    id: '3',
    author: 'Mike Engineer',
    authorAvatar: 'mike',
    content: 'Nice work! I noticed there might be a performance issue on mobile. Want me to take a look?',
    timestamp: '10:35 AM',
    reactions: [],
    isEdited: true,
    isPinned: false
  },
  {
    id: '4',
    author: 'Emily PM',
    authorAvatar: 'emily',
    content: 'Great collaboration everyone! Let\'s schedule a quick sync to discuss next steps.',
    timestamp: '10:40 AM',
    reactions: [{ emoji: '✅', count: 4, reacted: true }],
    isEdited: false,
    isPinned: true
  },
]

// Mock members
const mockMembers: Member[] = [
  { id: '1', name: 'John Developer', avatar: 'john', status: 'online', role: 'owner', joinedAt: '2023-01-15', lastSeen: 'now' },
  { id: '2', name: 'Sarah Designer', avatar: 'sarah', status: 'online', role: 'admin', joinedAt: '2023-02-20', lastSeen: 'now' },
  { id: '3', name: 'Mike Engineer', avatar: 'mike', status: 'idle', role: 'moderator', joinedAt: '2023-03-10', lastSeen: '5 min ago' },
  { id: '4', name: 'Emily PM', avatar: 'emily', status: 'dnd', role: 'member', joinedAt: '2023-04-01', lastSeen: '2 min ago' },
  { id: '5', name: 'Alex Frontend', avatar: 'alex', status: 'offline', role: 'member', joinedAt: '2023-05-15', lastSeen: '2 hours ago' },
  { id: '6', name: 'Lisa Backend', avatar: 'lisa', status: 'online', role: 'member', joinedAt: '2023-06-01', lastSeen: 'now' },
]

// Mock roles
const mockRoles: Role[] = [
  { id: '1', name: 'Owner', color: 'text-yellow-500', memberCount: 1, permissions: ['all'] },
  { id: '2', name: 'Admin', color: 'text-red-500', memberCount: 2, permissions: ['manage_members', 'manage_channels', 'moderate'] },
  { id: '3', name: 'Moderator', color: 'text-green-500', memberCount: 5, permissions: ['moderate', 'kick', 'mute'] },
  { id: '4', name: 'Member', color: 'text-blue-500', memberCount: 1242, permissions: ['read', 'write', 'react'] },
]

export default function CommunityClient({ initialCommunities }: { initialCommunities: Community[] }) {
  const [communityTypeFilter, setCommunityTypeFilter] = useState<CommunityType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CommunityStatus | 'all'>('all')
  const [activeTab, setActiveTab] = useState('chat')
  const [selectedChannel, setSelectedChannel] = useState<Channel>(mockChannels[0])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showMemberProfile, setShowMemberProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Text Channels', 'Voice Channels', 'Private'])

  const { communities, loading } = useCommunity({ communityType: communityTypeFilter, status: statusFilter })
  const displayCommunities = communities.length > 0 ? communities : initialCommunities

  const stats = useMemo(() => [
    {
      label: 'Members',
      value: displayCommunities.reduce((sum, c) => sum + c.member_count, 0).toLocaleString(),
      change: 12.5,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Online Now',
      value: mockMembers.filter(m => m.status === 'online').length.toString(),
      change: 25.3,
      icon: <Circle className="w-5 h-5 fill-green-500 text-green-500" />
    },
    {
      label: 'Messages Today',
      value: '2,847',
      change: 15.2,
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      label: 'Active Threads',
      value: mockThreads.length.toString(),
      change: 8.7,
      icon: <MessageCircle className="w-5 h-5" />
    }
  ], [displayCommunities])

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500'
      case 'dnd': return 'bg-red-500'
      case 'offline': return 'bg-gray-400'
    }
  }

  const getRoleIcon = (role: Member['role']) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />
      case 'moderator': return <Shield className="w-4 h-4 text-green-500" />
      default: return null
    }
  }

  const getChannelIcon = (type: Channel['type']) => {
    switch (type) {
      case 'text': return <Hash className="w-4 h-4" />
      case 'voice': return <Volume2 className="w-4 h-4" />
      case 'announcement': return <Megaphone className="w-4 h-4" />
      case 'stage': return <Radio className="w-4 h-4" />
      case 'forum': return <MessageCircle className="w-4 h-4" />
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim()) return
    console.log('Sending message:', messageInput)
    setMessageInput('')
  }, [messageInput])

  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setShowMemberProfile(true)
  }

  const groupedChannels = useMemo(() => {
    const groups: Record<string, Channel[]> = {}
    mockChannels.forEach(channel => {
      const cat = channel.category || 'Other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(channel)
    })
    return groups
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50/40 dark:bg-none dark:bg-gray-900 flex">
      {/* Sidebar - Channel List */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r flex flex-col">
        {/* Community Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold">FreeFlow Community</h2>
                <p className="text-xs text-muted-foreground">{mockMembers.length} members</p>
              </div>
            </div>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channel List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {Object.entries(groupedChannels).map(([category, channels]) => (
              <div key={category} className="mb-2">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase hover:text-foreground"
                >
                  {expandedCategories.includes(category) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  {category}
                </button>
                {expandedCategories.includes(category) && (
                  <div className="space-y-0.5 mt-1">
                    {channels.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                          selectedChannel.id === channel.id
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-foreground'
                        }`}
                      >
                        {channel.isPrivate ? <Lock className="w-4 h-4" /> : getChannelIcon(channel.type)}
                        <span className="flex-1 truncate">{channel.name}</span>
                        {channel.unreadCount > 0 && (
                          <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5">
                            {channel.unreadCount}
                          </Badge>
                        )}
                        {channel.type === 'voice' && channel.memberCount > 0 && (
                          <span className="text-xs text-green-500">{channel.memberCount}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={() => setShowCreateChannel(true)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground mt-2"
            >
              <Plus className="w-4 h-4" />
              Add Channel
            </button>
          </div>
        </ScrollArea>

        {/* User Panel */}
        <div className="p-3 border-t bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://avatar.vercel.sh/you" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">You</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Mic className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Headphones className="w-4 h-4" />
              </button>
              <button onClick={() => setShowSettings(true)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="p-4 border-b bg-white dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getChannelIcon(selectedChannel.type)}
            <div>
              <h2 className="font-semibold">{selectedChannel.name}</h2>
              <p className="text-xs text-muted-foreground">{selectedChannel.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Pin className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Users className="w-4 h-4" />
            </button>
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search" className="pl-9 h-8" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pt-2 border-b bg-white dark:bg-gray-800">
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger value="chat" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none pb-2">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="threads" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none pb-2">
                <MessageCircle className="w-4 h-4 mr-2" />
                Threads
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none pb-2">
                <Users className="w-4 h-4 mr-2" />
                Members
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none pb-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col m-0">
            <div className="flex flex-1">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {mockMessages.map(message => (
                      <div key={message.id} className="group flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg -mx-2">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`https://avatar.vercel.sh/${message.authorAvatar}`} />
                          <AvatarFallback>{message.author.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{message.author}</span>
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                            {message.isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
                            {message.isPinned && <Pin className="w-3 h-3 text-orange-500" />}
                          </div>
                          {message.replyTo && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 p-1.5 bg-gray-100 dark:bg-gray-800 rounded border-l-2 border-orange-500">
                              <Reply className="w-3 h-3" />
                              <span className="font-medium">{message.replyTo.author}</span>
                              <span className="truncate">{message.replyTo.content}</span>
                            </div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          {message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {message.reactions.map((reaction, i) => (
                                <button
                                  key={i}
                                  className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                                    reaction.reacted
                                      ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-300'
                                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                                  }`}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span>{reaction.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-start gap-1">
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Smile className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Reply className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <Plus className="w-5 h-5" />
                    </button>
                    <Input
                      placeholder={`Message #${selectedChannel.name}`}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                    />
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <Gift className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Member List Sidebar */}
              <div className="w-60 border-l bg-gray-50 dark:bg-gray-800/50 hidden lg:block">
                <ScrollArea className="h-full p-3">
                  {/* Online Members */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Online — {mockMembers.filter(m => m.status === 'online').length}
                    </h4>
                    <div className="space-y-1">
                      {mockMembers.filter(m => m.status === 'online').map(member => (
                        <button
                          key={member.id}
                          onClick={() => handleViewMember(member)}
                          className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`https://avatar.vercel.sh/${member.avatar}`} />
                              <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-800`} />
                          </div>
                          <span className="text-sm truncate flex-1">{member.name}</span>
                          {getRoleIcon(member.role)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Offline Members */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Offline — {mockMembers.filter(m => m.status === 'offline').length}
                    </h4>
                    <div className="space-y-1">
                      {mockMembers.filter(m => m.status === 'offline').map(member => (
                        <button
                          key={member.id}
                          onClick={() => handleViewMember(member)}
                          className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-60"
                        >
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`https://avatar.vercel.sh/${member.avatar}`} />
                              <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-800`} />
                          </div>
                          <span className="text-sm truncate flex-1">{member.name}</span>
                          {getRoleIcon(member.role)}
                        </button>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* Threads Tab */}
          <TabsContent value="threads" className="flex-1 p-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockThreads.map(thread => (
                <Card key={thread.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${thread.authorAvatar}`} />
                        <AvatarFallback>{thread.author.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {thread.isPinned && <Pin className="w-4 h-4 text-orange-500" />}
                          {thread.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                          <h4 className="font-semibold truncate">{thread.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">by {thread.author}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {thread.messageCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {thread.participantCount}
                          </span>
                          <span>{thread.lastReply}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="flex-1 p-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMembers.map(member => (
                <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewMember(member)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`https://avatar.vercel.sh/${member.avatar}`} />
                          <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-800`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{member.name}</h4>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                        <p className="text-xs text-muted-foreground">Last seen: {member.lastSeen}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="flex-1 p-4 m-0">
            <StatGrid columns={4} stats={stats} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Member Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-orange-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockMembers.slice(0, 5).map((member, i) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${member.avatar}`} />
                          <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 font-medium">{member.name}</span>
                        <Badge variant="secondary">{Math.floor(Math.random() * 500) + 100} msgs</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Channel Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockChannels.filter(c => c.type === 'text').slice(0, 5).map(channel => (
                      <div key={channel.id} className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1">{channel.name}</span>
                        <span className="text-sm text-muted-foreground">{channel.memberCount} members</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Roles Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockRoles.map(role => (
                      <div key={role.id} className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${role.color.replace('text-', 'bg-')}`} />
                        <span className="flex-1">{role.name}</span>
                        <Badge variant="secondary">{role.memberCount}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription>Add a new channel to the community</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Channel Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { type: 'text', icon: <Hash />, label: 'Text' },
                  { type: 'voice', icon: <Volume2 />, label: 'Voice' },
                  { type: 'forum', icon: <MessageCircle />, label: 'Forum' },
                  { type: 'announcement', icon: <Megaphone />, label: 'Announcement' },
                ].map(item => (
                  <button
                    key={item.type}
                    className="p-3 border rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Channel Name</Label>
              <Input placeholder="new-channel" className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="private" className="rounded" />
              <Label htmlFor="private">Private Channel</Label>
            </div>
          </div>
          <DialogFooter>
            <ModernButton variant="outline" onClick={() => setShowCreateChannel(false)}>Cancel</ModernButton>
            <GradientButton from="orange" to="amber">Create Channel</GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Profile Dialog */}
      <Dialog open={showMemberProfile} onOpenChange={setShowMemberProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member Profile</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={`https://avatar.vercel.sh/${selectedMember.avatar}`} />
                    <AvatarFallback>{selectedMember.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className={`absolute bottom-0 right-0 w-5 h-5 ${getStatusColor(selectedMember.status)} rounded-full border-3 border-white dark:border-gray-800`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {selectedMember.name}
                    {getRoleIcon(selectedMember.role)}
                  </h2>
                  <p className="text-muted-foreground capitalize">{selectedMember.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedMember.status}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(selectedMember.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <ModernButton variant="primary" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </ModernButton>
                <ModernButton variant="outline">
                  <UserPlus className="w-4 h-4" />
                </ModernButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
