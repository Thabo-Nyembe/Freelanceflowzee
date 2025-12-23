// Chat V2 - Intercom Level Real-time Messaging
// Upgraded with: Inbox, Conversations, AI Suggestions, Team Collaboration

'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  User,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Sparkles,
  Bot,
  Paperclip,
  Image as ImageIcon,
  Smile,
  MoreHorizontal,
  Archive,
  Tag,
  UserPlus,
  Filter,
  AlertCircle,
  Inbox,
  Mail,
  Phone,
  Globe,
  Calendar,
  History,
  Bell,
  Settings,
  Zap,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronRight,
  Circle,
  Pin,
  AtSign,
  Hash,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Reply,
  Forward,
  Copy,
  Trash2,
  Edit,
  BarChart3,
  TrendingUp
} from 'lucide-react'
import { useChat, type ChatMessage, type RoomType, type ChatStatus } from '@/lib/hooks/use-chat'

// ============================================================================
// TYPES - INTERCOM LEVEL CHAT SYSTEM
// ============================================================================

interface Conversation {
  id: string
  customer: Customer
  status: 'open' | 'snoozed' | 'closed'
  priority: 'urgent' | 'high' | 'normal' | 'low'
  assignee?: TeamMember
  tags: string[]
  subject?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  isStarred: boolean
  channel: 'chat' | 'email' | 'social' | 'phone'
  rating?: number
  responseTime?: number
  messagesCount: number
  createdAt: string
}

interface Customer {
  id: string
  name: string
  email: string
  avatar?: string
  company?: string
  location?: string
  timezone?: string
  phone?: string
  website?: string
  customAttributes: Record<string, string>
  tags: string[]
  firstSeen: string
  lastSeen: string
  totalConversations: number
  lifetimeValue: number
  isOnline: boolean
  notes: string[]
  segments: string[]
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'agent' | 'manager'
  status: 'online' | 'away' | 'offline'
  assignedConversations: number
  resolvedToday: number
  avgResponseTime: number
}

interface SavedReply {
  id: string
  name: string
  content: string
  category: string
  shortcut: string
  usageCount: number
  lastUsed?: string
}

interface ChatNote {
  id: string
  content: string
  author: TeamMember
  createdAt: string
  isInternal: boolean
}

interface AIsuggestion {
  id: string
  content: string
  confidence: number
  category: 'response' | 'action' | 'tag'
}

// ============================================================================
// MOCK DATA - INTERCOM LEVEL
// ============================================================================

const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm1', name: 'Sarah Johnson', email: 'sarah@kazi.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', role: 'admin', status: 'online', assignedConversations: 12, resolvedToday: 8, avgResponseTime: 45 },
  { id: 'tm2', name: 'Michael Chen', email: 'michael@kazi.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', role: 'agent', status: 'online', assignedConversations: 8, resolvedToday: 15, avgResponseTime: 32 },
  { id: 'tm3', name: 'Emily Wilson', email: 'emily@kazi.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', role: 'agent', status: 'away', assignedConversations: 5, resolvedToday: 6, avgResponseTime: 55 },
  { id: 'tm4', name: 'Alex Thompson', email: 'alex@kazi.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', role: 'manager', status: 'online', assignedConversations: 3, resolvedToday: 4, avgResponseTime: 28 },
]

const SAVED_REPLIES: SavedReply[] = [
  { id: 'sr1', name: 'Welcome Message', content: 'Hi there! Thanks for reaching out. How can I help you today?', category: 'General', shortcut: '/welcome', usageCount: 234 },
  { id: 'sr2', name: 'Pricing Info', content: 'Our pricing starts at $29/month for the Starter plan. Would you like me to share more details about our plans?', category: 'Sales', shortcut: '/pricing', usageCount: 189 },
  { id: 'sr3', name: 'Feature Request', content: "Thanks for the suggestion! I've passed this along to our product team. We'll update you when we have news to share.", category: 'Product', shortcut: '/feature', usageCount: 145 },
  { id: 'sr4', name: 'Technical Support', content: "I'm sorry you're experiencing this issue. Let me help troubleshoot. Can you please share your browser version and any error messages you're seeing?", category: 'Support', shortcut: '/tech', usageCount: 312 },
  { id: 'sr5', name: 'Closing Message', content: "Is there anything else I can help you with? If not, have a great day! Feel free to reach out anytime.", category: 'General', shortcut: '/close', usageCount: 567 },
]

const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    customer: { id: 'c1', name: 'John Smith', email: 'john@acme.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', company: 'Acme Corp', location: 'New York, USA', timezone: 'EST', customAttributes: { plan: 'Enterprise', industry: 'Technology' }, tags: ['VIP', 'Enterprise'], firstSeen: '2023-06-15', lastSeen: '2024-01-28T10:30:00Z', totalConversations: 15, lifetimeValue: 12500, isOnline: true, notes: [], segments: ['Power Users'] },
    status: 'open',
    priority: 'high',
    assignee: TEAM_MEMBERS[0],
    tags: ['billing', 'urgent'],
    subject: 'Invoice question for January',
    lastMessage: 'Can you help me understand this charge?',
    lastMessageAt: '2024-01-28T10:30:00Z',
    unreadCount: 2,
    isStarred: true,
    channel: 'chat',
    messagesCount: 8,
    createdAt: '2024-01-28T09:00:00Z'
  },
  {
    id: 'conv2',
    customer: { id: 'c2', name: 'Emma Davis', email: 'emma@startup.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', company: 'Startup.io', location: 'London, UK', timezone: 'GMT', customAttributes: { plan: 'Pro', industry: 'SaaS' }, tags: ['New'], firstSeen: '2024-01-20', lastSeen: '2024-01-28T10:15:00Z', totalConversations: 3, lifetimeValue: 890, isOnline: true, notes: [], segments: ['Trial Users'] },
    status: 'open',
    priority: 'normal',
    tags: ['feature-request'],
    subject: 'Integration with Slack',
    lastMessage: 'Do you have a Slack integration available?',
    lastMessageAt: '2024-01-28T10:15:00Z',
    unreadCount: 1,
    isStarred: false,
    channel: 'chat',
    messagesCount: 3,
    createdAt: '2024-01-28T10:00:00Z'
  },
  {
    id: 'conv3',
    customer: { id: 'c3', name: 'Robert Brown', email: 'robert@enterprise.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert', company: 'Enterprise LLC', location: 'San Francisco, USA', timezone: 'PST', customAttributes: { plan: 'Enterprise', industry: 'Finance' }, tags: ['VIP'], firstSeen: '2022-03-10', lastSeen: '2024-01-28T09:45:00Z', totalConversations: 42, lifetimeValue: 45000, isOnline: false, notes: ['Key account - escalate if needed'], segments: ['VIP'] },
    status: 'snoozed',
    priority: 'normal',
    assignee: TEAM_MEMBERS[1],
    tags: ['waiting-for-customer'],
    subject: 'API documentation question',
    lastMessage: 'Let me check with my team and get back to you',
    lastMessageAt: '2024-01-27T16:00:00Z',
    unreadCount: 0,
    isStarred: false,
    channel: 'email',
    messagesCount: 12,
    createdAt: '2024-01-25T14:00:00Z'
  },
  {
    id: 'conv4',
    customer: { id: 'c4', name: 'Lisa Wang', email: 'lisa@design.co', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', company: 'Design Co', location: 'Berlin, Germany', timezone: 'CET', customAttributes: { plan: 'Starter', industry: 'Design' }, tags: [], firstSeen: '2024-01-15', lastSeen: '2024-01-28T08:30:00Z', totalConversations: 2, lifetimeValue: 290, isOnline: false, notes: [], segments: ['New Users'] },
    status: 'closed',
    priority: 'low',
    assignee: TEAM_MEMBERS[2],
    tags: ['resolved'],
    subject: 'Password reset help',
    lastMessage: 'Thank you for your help!',
    lastMessageAt: '2024-01-26T12:00:00Z',
    unreadCount: 0,
    isStarred: false,
    channel: 'chat',
    rating: 5,
    responseTime: 25,
    messagesCount: 6,
    createdAt: '2024-01-26T11:00:00Z'
  },
]

const AI_SUGGESTIONS: AIsuggestion[] = [
  { id: 'ai1', content: "Based on the customer's question, I suggest explaining our billing cycle and providing a link to the invoice details page.", confidence: 92, category: 'response' },
  { id: 'ai2', content: "This conversation seems to be about billing. Would you like me to add the 'billing' tag?", confidence: 88, category: 'tag' },
  { id: 'ai3', content: 'Customer satisfaction score is low. Consider offering a discount or escalating to a senior agent.', confidence: 75, category: 'action' },
]

// ============================================================================
// MAIN COMPONENT - INTERCOM LEVEL CHAT
// ============================================================================

interface ChatClientProps {
  initialChatMessages: ChatMessage[]
}

export default function ChatClient({ initialChatMessages }: ChatClientProps) {
  // State
  const [activeTab, setActiveTab] = useState('inbox')
  const [inboxFilter, setInboxFilter] = useState<'all' | 'open' | 'mine' | 'unassigned'>('all')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [showCustomerPanel, setShowCustomerPanel] = useState(true)
  const [showSavedReplies, setShowSavedReplies] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(true)
  const [roomTypeFilter, setRoomTypeFilter] = useState<RoomType | 'all'>('all')
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [newNote, setNewNote] = useState('')

  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  // Hook for chat data
  const { chatMessages, loading, error } = useChat({
    roomType: roomTypeFilter,
    limit: 50
  })

  const displayMessages = chatMessages.length > 0 ? chatMessages : initialChatMessages

  // Stats calculation
  const stats = useMemo(() => ({
    totalConversations: CONVERSATIONS.length,
    openConversations: CONVERSATIONS.filter(c => c.status === 'open').length,
    unassigned: CONVERSATIONS.filter(c => !c.assignee && c.status === 'open').length,
    avgResponseTime: Math.round(TEAM_MEMBERS.reduce((sum, tm) => sum + tm.avgResponseTime, 0) / TEAM_MEMBERS.length),
    resolvedToday: TEAM_MEMBERS.reduce((sum, tm) => sum + tm.resolvedToday, 0),
    onlineAgents: TEAM_MEMBERS.filter(tm => tm.status === 'online').length,
    totalMessages: displayMessages.length,
    unreadMessages: displayMessages.filter(m => !m.is_read).length
  }), [displayMessages])

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return CONVERSATIONS.filter(conv => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!conv.customer.name.toLowerCase().includes(query) &&
            !conv.customer.email.toLowerCase().includes(query) &&
            !conv.lastMessage.toLowerCase().includes(query) &&
            !conv.subject?.toLowerCase().includes(query)) {
          return false
        }
      }

      if (inboxFilter === 'open') return conv.status === 'open'
      if (inboxFilter === 'mine') return conv.assignee?.id === 'tm1' // Current user
      if (inboxFilter === 'unassigned') return !conv.assignee && conv.status === 'open'

      return true
    })
  }, [searchQuery, inboxFilter])

  // Handlers
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedConversation) return

    toast.success('Message Sent', {
      description: `Message delivered to ${selectedConversation.customer.name}`
    })
    setNewMessage('')
  }, [newMessage, selectedConversation])

  const handleUseSavedReply = useCallback((reply: SavedReply) => {
    setNewMessage(reply.content)
    setShowSavedReplies(false)
    messageInputRef.current?.focus()
    toast.success('Reply Inserted', { description: reply.name })
  }, [])

  const handleUseAISuggestion = useCallback((suggestion: AIsuggestion) => {
    if (suggestion.category === 'response') {
      setNewMessage(suggestion.content)
      messageInputRef.current?.focus()
    } else if (suggestion.category === 'tag') {
      toast.success('Tag Added', { description: 'Conversation tagged as billing' })
    }
  }, [])

  const handleAssignConversation = useCallback((member: TeamMember) => {
    if (!selectedConversation) return
    toast.success('Conversation Assigned', {
      description: `Assigned to ${member.name}`
    })
    setShowAssignDialog(false)
  }, [selectedConversation])

  const handleCloseConversation = useCallback(() => {
    if (!selectedConversation) return
    toast.success('Conversation Closed', {
      description: 'The conversation has been marked as resolved'
    })
  }, [selectedConversation])

  const handleSnoozeConversation = useCallback(() => {
    if (!selectedConversation) return
    toast.success('Conversation Snoozed', {
      description: 'Will reopen in 24 hours'
    })
  }, [selectedConversation])

  const handleAddTag = useCallback(() => {
    if (!newTag.trim() || !selectedConversation) return
    toast.success('Tag Added', { description: newTag })
    setNewTag('')
    setShowTagDialog(false)
  }, [newTag, selectedConversation])

  const handleAddNote = useCallback(() => {
    if (!newNote.trim() || !selectedConversation) return
    toast.success('Note Added', { description: 'Internal note saved' })
    setNewNote('')
    setShowNoteDialog(false)
  }, [newNote, selectedConversation])

  const handleStarConversation = useCallback(() => {
    if (!selectedConversation) return
    toast.success(selectedConversation.isStarred ? 'Unstarred' : 'Starred', {
      description: 'Conversation updated'
    })
  }, [selectedConversation])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Chat</h3>
            <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Inbox</h1>
                  <Badge variant="outline" className="text-xs bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                    Intercom Level
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 p-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {(['all', 'open', 'mine', 'unassigned'] as const).map(filter => (
              <Button
                key={filter}
                size="sm"
                variant={inboxFilter === filter ? 'default' : 'outline'}
                onClick={() => setInboxFilter(filter)}
                className={inboxFilter === filter ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
              >
                {filter === 'all' ? 'All' : filter === 'open' ? 'Open' : filter === 'mine' ? 'Mine' : 'Unassigned'}
                {filter === 'open' && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs">{stats.openConversations}</Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-cyan-50 dark:bg-cyan-900/20' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.customer.avatar} />
                        <AvatarFallback>{conv.customer.name[0]}</AvatarFallback>
                      </Avatar>
                      {conv.customer.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{conv.customer.name}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(conv.lastMessageAt)}</span>
                      </div>
                      {conv.subject && (
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mb-1">
                          {conv.subject}
                        </div>
                      )}
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {conv.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                        {conv.priority === 'high' && <Badge className="bg-red-100 text-red-700 text-xs">High</Badge>}
                        {conv.priority === 'urgent' && <Badge className="bg-red-500 text-white text-xs">Urgent</Badge>}
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-cyan-500 text-white text-xs">{conv.unreadCount}</Badge>
                        )}
                        {conv.assignee && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={conv.assignee.avatar} />
                            <AvatarFallback className="text-xs">{conv.assignee.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Stats Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-bold text-cyan-600">{stats.openConversations}</div>
                <div className="text-gray-500">Open</div>
              </div>
              <div>
                <div className="font-bold text-green-600">{stats.resolvedToday}</div>
                <div className="text-gray-500">Resolved</div>
              </div>
              <div>
                <div className="font-bold text-blue-600">{stats.avgResponseTime}s</div>
                <div className="text-gray-500">Avg Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Conversation View */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.customer.avatar} />
                    <AvatarFallback>{selectedConversation.customer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{selectedConversation.customer.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedConversation.customer.company}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">{selectedConversation.customer.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={handleStarConversation}>
                    <Star className={`h-4 w-4 ${selectedConversation.isStarred ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAssignDialog(true)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowTagDialog(true)}>
                    <Tag className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleSnoozeConversation}>
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCloseConversation}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowCustomerPanel(!showCustomerPanel)}>
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags Bar */}
              {selectedConversation.tags.length > 0 && (
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  {selectedConversation.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowTagDialog(true)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl">
                  {/* Sample messages */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedConversation.customer.avatar} />
                      <AvatarFallback>{selectedConversation.customer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{selectedConversation.customer.name}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(selectedConversation.lastMessageAt)}</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 inline-block">
                        <p className="text-sm">{selectedConversation.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* AI Suggestions */}
              {showAISuggestions && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-400">AI Suggestions</span>
                    <Button size="sm" variant="ghost" className="ml-auto h-6" onClick={() => setShowAISuggestions(false)}>
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {AI_SUGGESTIONS.map(suggestion => (
                      <Button
                        key={suggestion.id}
                        size="sm"
                        variant="outline"
                        className="text-xs bg-white dark:bg-gray-800"
                        onClick={() => handleUseAISuggestion(suggestion)}
                      >
                        {suggestion.category === 'response' && <MessageSquare className="h-3 w-3 mr-1" />}
                        {suggestion.category === 'tag' && <Tag className="h-3 w-3 mr-1" />}
                        {suggestion.category === 'action' && <Zap className="h-3 w-3 mr-1" />}
                        {suggestion.content.substring(0, 50)}...
                        <Badge className="ml-1 bg-purple-100 text-purple-700 text-xs">{suggestion.confidence}%</Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={messageInputRef}
                      placeholder="Type your message... Use / for saved replies"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                        if (e.key === '/' && newMessage === '') {
                          setShowSavedReplies(true)
                        }
                      }}
                      rows={3}
                      className="resize-none pr-24"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Smile className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowSavedReplies(true)}>
                      <Bookmark className="h-4 w-4 mr-1" />
                      Replies
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a conversation</h3>
                <p className="text-gray-400">Choose a conversation from the sidebar to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Customer Panel */}
        {showCustomerPanel && selectedConversation && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
            <div className="p-4">
              {/* Customer Info */}
              <div className="text-center mb-6">
                <Avatar className="h-20 w-20 mx-auto mb-3">
                  <AvatarImage src={selectedConversation.customer.avatar} />
                  <AvatarFallback className="text-2xl">{selectedConversation.customer.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{selectedConversation.customer.name}</h3>
                <p className="text-sm text-gray-500">{selectedConversation.customer.company}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {selectedConversation.customer.isOnline ? (
                    <Badge className="bg-green-100 text-green-700">Online</Badge>
                  ) : (
                    <Badge variant="outline">Offline</Badge>
                  )}
                  {selectedConversation.customer.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <Card className="mb-4">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{selectedConversation.customer.email}</span>
                  </div>
                  {selectedConversation.customer.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedConversation.customer.phone}</span>
                    </div>
                  )}
                  {selectedConversation.customer.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span>{selectedConversation.customer.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{selectedConversation.customer.timezone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Stats */}
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Customer Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-cyan-600">
                        {selectedConversation.customer.totalConversations}
                      </div>
                      <div className="text-xs text-gray-500">Conversations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${(selectedConversation.customer.lifetimeValue / 1000).toFixed(1)}k
                      </div>
                      <div className="text-xs text-gray-500">Lifetime Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Attributes */}
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Attributes</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {Object.entries(selectedConversation.customer.customAttributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500 capitalize">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Notes</CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setShowNoteDialog(true)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {selectedConversation.customer.notes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedConversation.customer.notes.map((note, i) => (
                        <div key={i} className="text-sm text-gray-600 p-2 bg-yellow-50 rounded">{note}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Saved Replies Dialog */}
      <Dialog open={showSavedReplies} onOpenChange={setShowSavedReplies}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-cyan-600" />
              Saved Replies
            </DialogTitle>
            <DialogDescription>Quick responses to common questions</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {SAVED_REPLIES.map(reply => (
                <div
                  key={reply.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleUseSavedReply(reply)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{reply.name}</span>
                    <Badge variant="outline" className="text-xs">{reply.shortcut}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{reply.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{reply.category}</span>
                    <span>-</span>
                    <span>Used {reply.usageCount} times</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Conversation</DialogTitle>
            <DialogDescription>Choose a team member to handle this conversation</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {TEAM_MEMBERS.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAssignConversation(member)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${
                      member.status === 'online' ? 'bg-green-500' : member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{member.role}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>{member.assignedConversations} active</div>
                  <div>{member.avgResponseTime}s avg</div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
            <DialogDescription>Organize conversations with tags</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter tag name"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              {['billing', 'feature-request', 'bug', 'sales', 'support', 'urgent', 'VIP'].map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setNewTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTag}>Add Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Internal Note</DialogTitle>
            <DialogDescription>Notes are only visible to your team</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Write your note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button onClick={handleAddNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
