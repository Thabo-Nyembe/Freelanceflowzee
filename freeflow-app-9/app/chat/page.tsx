"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { EnhancedInteractiveSystem, EnhancedButton as InteractiveButton } from '@/components/ui/enhanced-interactive-system'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Plus,
  Users,
  Settings,
  Paperclip,
  Smile,
  MessageSquare,
  Circle,
  ArrowLeft,
  Star,
  Archive,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// Mock chat data
const mockChats = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'Acme Corp',
    lastMessage: 'Thanks for the brand guidelines! They look perfect.',
    timestamp: '2 min ago',
    unread: 2,
    online: true,
    avatar: '/placeholder-user.jpg',
    type: 'client'
  },
  {
    id: '2',
    name: 'Design Team',
    lastMessage: 'Mike: The new mockups are ready for review',
    timestamp: '15 min ago',
    unread: 0,
    online: false,
    avatar: '/placeholder-user.jpg',
    type: 'team',
    members: 4
  },
  {
    id: '3',
    name: 'Alex Chen',
    company: 'Tech Startup',
    lastMessage: 'When can we schedule the next meeting?',
    timestamp: '1 hour ago',
    unread: 1,
    online: true,
    avatar: '/placeholder-user.jpg',
    type: 'client'
  },
  {
    id: '4',
    name: 'Project Alpha',
    lastMessage: 'Emma: Updated the timeline in the project doc',
    timestamp: '2 hours ago',
    unread: 0,
    online: false,
    avatar: '/placeholder-user.jpg',
    type: 'project',
    members: 6
  }
]

const mockMessages = [
  {
    id: '1',
    sender: 'Sarah Johnson',
    content: 'Hi! I wanted to follow up on the brand identity project. The initial concepts look amazing!',
    timestamp: '10:30 AM',
    type: 'received',
    avatar: '/placeholder-user.jpg'
  },
  {
    id: '2',
    sender: 'You',
    content: 'Thank you! I\'m glad you like them. I\'ve incorporated the feedback from our last meeting.',
    timestamp: '10:32 AM',
    type: 'sent'
  },
  {
    id: '3',
    sender: 'You',
    content: 'I\'ve attached the revised logo concepts and color palette. Please take a look and let me know your thoughts.',
    timestamp: '10:33 AM',
    type: 'sent',
    attachments: [
      { name: 'Logo_Concepts_v2.pdf', size: '2.1 MB' },
      { name: 'Color_Palette.png', size: '850 KB' }
    ]
  },
  {
    id: '4',
    sender: 'Sarah Johnson',
    content: 'Perfect! I love the direction we\'re heading. The blue variant is exactly what we were looking for.',
    timestamp: '11:45 AM',
    type: 'received',
    avatar: '/placeholder-user.jpg'
  },
  {
    id: '5',
    sender: 'Sarah Johnson',
    content: 'Thanks for the brand guidelines! They look perfect.',
    timestamp: '2:15 PM',
    type: 'received',
    avatar: '/placeholder-user.jpg'
  }
]

export default function ChatPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [selectedChat, setSelectedChat] = useState(mockChats[0])
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showChatList, setShowChatList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // A+++ LOAD CHAT DATA
  useEffect(() => {
    const loadChatData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load chat'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Chat loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat')
        setIsLoading(false)
        announce('Error loading chat', 'assertive')
      }
    }

    loadChatData()
  }, [announce])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'You',
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'sent' as const
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ChatListItem = ({ chat }: { chat: typeof mockChats[0] }) => (
    <div
      onClick={() => {
        setSelectedChat(chat)
        setShowChatList(false)
      }}
      className={cn(
        "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
        selectedChat.id === chat.id && "bg-blue-50 border-blue-200"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            {chat.type === 'team' || chat.type === 'project' ? (
              <Users className="h-6 w-6 text-gray-600" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                {chat.name.charAt(0)}
              </div>
            )}
          </div>
          {chat.online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
            <span className="text-xs text-gray-500">{chat.timestamp}</span>
          </div>
          {chat.company && (
            <p className="text-xs text-gray-500 mb-1">{chat.company}</p>
          )}
          <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
          {(chat.type === 'team' || chat.type === 'project') && chat.members && (
            <p className="text-xs text-gray-400 mt-1">{chat.members} members</p>
          )}
        </div>
        
        {chat.unread > 0 && (
          <Badge className="bg-blue-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
            {chat.unread}
          </Badge>
        )}
      </div>
    </div>
  )

  const MessageBubble = ({ message }: { message: typeof mockMessages[0] }) => (
    <div className={cn("flex gap-3 mb-4", message.type === 'sent' && "flex-row-reverse")}>
      {message.type === 'received' && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {message.sender.charAt(0)}
        </div>
      )}
      
      <div className={cn("max-w-xs lg:max-w-md", message.type === 'sent' && "ml-auto")}>
        {message.type === 'received' && (
          <p className="text-xs text-gray-500 mb-1">{message.sender}</p>
        )}
        
        <div className={cn(
          "p-3 rounded-2xl",
          message.type === 'sent' 
            ? "bg-blue-500 text-white" 
            : "bg-gray-100 text-gray-900"
        )}>
          <p className="text-sm">{message.content}</p>
          
          {message.attachments && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white/20 rounded-lg">
                  <Paperclip className="h-3 w-3" />
                  <span className="text-xs">{attachment.name}</span>
                  <span className="text-xs opacity-70">({attachment.size})</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-400 mt-1 text-right">
          {message.timestamp}
        </p>
      </div>
    </div>
  )

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="h-full flex">
        {/* Chat List - Desktop always visible, Mobile toggleable */}
        <div className={cn(
          "w-80 bg-white/80 backdrop-blur-sm border-r border-white/40 flex flex-col",
          "lg:block",
          showChatList ? "block" : "hidden"
        )}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Chat List */}
          <ScrollArea className="flex-1">
            {filteredChats.map(chat => (
              <ChatListItem key={chat.id} chat={chat} />
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowChatList(true)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedChat.name.charAt(0)}
                  </div>
                  {selectedChat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                  {selectedChat.company && (
                    <p className="text-sm text-gray-500">{selectedChat.company}</p>
                  )}
                  {selectedChat.online ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Circle className="h-2 w-2 fill-current" />
                      Online
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Last seen 2 hours ago</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Video className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Star className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-end gap-3">
              <Button size="sm" variant="ghost">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[40px]"
                />
              </div>
              
              <Button size="sm" variant="ghost">
                <Smile className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift + Enter for new line</span>
              <span>{newMessage.length}/1000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}