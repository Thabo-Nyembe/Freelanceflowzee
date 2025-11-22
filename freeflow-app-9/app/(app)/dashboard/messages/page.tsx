'use client'

import { useState, useRef, useEffect, useReducer } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Send, Search, Filter, MessageSquare, Paperclip, Image as ImageIcon, Mic, Plus, Pin,
  Bell, BellOff, Archive, Trash2, CheckCheck, Reply, Forward, Smile, X, Users,
  Settings, Info, Download, Upload, Edit2, Check, MoreVertical, Phone, Video,
  Camera, File, MapPin, Hash, AtSign, Clock, Star, Bookmark, Eye, EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { GlowEffect } from '@/components/ui/glow-effect'

// A+++ Utilities
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// ============================================================================
// FRAMER MOTION ANIMATION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'blue' }: { delay?: number; color?: string }) => {
  console.log('🎨 MESSAGES: FloatingParticle rendered with color:', color, 'delay:', delay)
  return (
    <motion.div
      className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}

const TypingIndicator = () => {
  console.log('💬 MESSAGES: TypingIndicator rendered')
  return (
    <motion.div
      className="flex gap-1 p-3 bg-slate-800/50 rounded-lg max-w-[60px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            y: [0, -5, 0],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </motion.div>
  )
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Message {
  id: string
  text: string
  sender: string
  senderId: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'voice' | 'video'
  status: 'sending' | 'sent' | 'delivered' | 'read'
  reactions?: Array<{ emoji: string; userId: string; userName: string }>
  replyTo?: string
  attachments?: Array<{ name: string; url: string; type: string; size: number }>
  isEdited?: boolean
  isPinned?: boolean
  isStarred?: boolean
}

interface Chat {
  id: string
  name: string
  lastMessage: string
  unread: number
  avatar: string
  type: 'direct' | 'group'
  members?: number
  isOnline?: boolean
  lastSeen?: string
  isPinned?: boolean
  isMuted?: boolean
  isArchived?: boolean
  category: 'all' | 'unread' | 'archived' | 'groups'
}

interface MessagesState {
  chats: Chat[]
  messages: Message[]
  selectedChat: Chat | null
  searchTerm: string
  filterCategory: 'all' | 'unread' | 'archived' | 'groups'
  isTyping: boolean
  selectedMessages: string[]
}

type MessagesAction =
  | { type: 'SET_CHATS'; chats: Chat[] }
  | { type: 'SET_MESSAGES'; messages: Message[] }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'DELETE_MESSAGE'; messageId: string }
  | { type: 'EDIT_MESSAGE'; messageId: string; newText: string }
  | { type: 'SELECT_CHAT'; chat: Chat | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER'; filterCategory: 'all' | 'unread' | 'archived' | 'groups' }
  | { type: 'SET_TYPING'; isTyping: boolean }
  | { type: 'TOGGLE_PIN_CHAT'; chatId: string }
  | { type: 'TOGGLE_MUTE_CHAT'; chatId: string }
  | { type: 'ARCHIVE_CHAT'; chatId: string }
  | { type: 'DELETE_CHAT'; chatId: string }
  | { type: 'TOGGLE_SELECT_MESSAGE'; messageId: string }
  | { type: 'CLEAR_SELECTED_MESSAGES' }

// ============================================================================
// MOCK DATA
// ============================================================================

const mockChats: Chat[] = [
  { id: 'chat-1', name: 'John Doe', lastMessage: 'Thanks for the project update!', unread: 2, avatar: 'JD', type: 'direct', isOnline: true, isPinned: true, isMuted: false, isArchived: false, category: 'all' },
  { id: 'chat-2', name: 'Sarah Johnson', lastMessage: 'Can we schedule a call?', unread: 0, avatar: 'SJ', type: 'direct', isOnline: false, lastSeen: '2 hours ago', isPinned: false, isMuted: false, isArchived: false, category: 'all' },
  { id: 'chat-3', name: 'Mike Wilson', lastMessage: 'The design looks great!', unread: 1, avatar: 'MW', type: 'direct', isOnline: true, isPinned: false, isMuted: false, isArchived: false, category: 'all' },
  { id: 'chat-4', name: 'Project Team Alpha', lastMessage: 'Meeting at 3pm today', unread: 5, avatar: 'PT', type: 'group', members: 8, isOnline: true, isPinned: true, isMuted: false, isArchived: false, category: 'groups' },
  { id: 'chat-5', name: 'Design Review', lastMessage: 'New mockups uploaded', unread: 3, avatar: 'DR', type: 'group', members: 5, isOnline: true, isPinned: false, isMuted: true, isArchived: false, category: 'groups' },
  { id: 'chat-6', name: 'Emma Davis', lastMessage: 'See you tomorrow!', unread: 0, avatar: 'ED', type: 'direct', isOnline: false, lastSeen: '1 day ago', isPinned: false, isMuted: false, isArchived: true, category: 'archived' },
]

const mockMessagesForChat: Message[] = [
  { id: 'msg-1', text: 'Hi there! How are you doing?', sender: 'John Doe', senderId: 'user-2', timestamp: '10:30 AM', type: 'text', status: 'read' },
  { id: 'msg-2', text: 'I\'m doing well, thanks for asking! Working on the new project.', sender: 'You', senderId: 'user-1', timestamp: '10:32 AM', type: 'text', status: 'read' },
  { id: 'msg-3', text: 'Thanks for the project update! Everything looks on track.', sender: 'John Doe', senderId: 'user-2', timestamp: '10:35 AM', type: 'text', status: 'read', reactions: [{ emoji: '👍', userId: 'user-1', userName: 'You' }] },
  { id: 'msg-4', text: 'Here are the latest designs', sender: 'John Doe', senderId: 'user-2', timestamp: '10:36 AM', type: 'image', status: 'read', attachments: [{ name: 'design-mockup.png', url: '/placeholder-image.png', type: 'image/png', size: 245000 }] },
]

// ============================================================================
// REDUCER
// ============================================================================

function messagesReducer(state: MessagesState, action: MessagesAction): MessagesState {
  console.log('🔄 MESSAGES REDUCER: Action:', action.type)

  switch (action.type) {
    case 'SET_CHATS':
      console.log('✅ MESSAGES: Set chats -', action.chats.length, 'chats loaded')
      return { ...state, chats: action.chats }

    case 'SET_MESSAGES':
      console.log('✅ MESSAGES: Set messages -', action.messages.length, 'messages loaded')
      return { ...state, messages: action.messages }

    case 'ADD_MESSAGE':
      console.log('✅ MESSAGES: Add message - ID:', action.message.id)
      return { ...state, messages: [...state.messages, action.message] }

    case 'DELETE_MESSAGE':
      console.log('🗑️ MESSAGES: Delete message - ID:', action.messageId)
      return { ...state, messages: state.messages.filter(m => m.id !== action.messageId) }

    case 'EDIT_MESSAGE':
      console.log('✏️ MESSAGES: Edit message - ID:', action.messageId)
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.messageId ? { ...m, text: action.newText, isEdited: true } : m
        )
      }

    case 'SELECT_CHAT':
      console.log('💬 MESSAGES: Select chat -', action.chat ? `ID: ${action.chat.id}, Name: ${action.chat.name}` : 'None')
      return { ...state, selectedChat: action.chat, selectedMessages: [] }

    case 'SET_SEARCH':
      console.log('🔍 MESSAGES: Search term:', action.searchTerm)
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER':
      console.log('🔽 MESSAGES: Filter category:', action.filterCategory)
      return { ...state, filterCategory: action.filterCategory }

    case 'SET_TYPING':
      console.log('⌨️ MESSAGES: Typing status:', action.isTyping)
      return { ...state, isTyping: action.isTyping }

    case 'TOGGLE_PIN_CHAT':
      console.log('📌 MESSAGES: Toggle pin chat - ID:', action.chatId)
      return {
        ...state,
        chats: state.chats.map(c =>
          c.id === action.chatId ? { ...c, isPinned: !c.isPinned } : c
        )
      }

    case 'TOGGLE_MUTE_CHAT':
      console.log('🔕 MESSAGES: Toggle mute chat - ID:', action.chatId)
      return {
        ...state,
        chats: state.chats.map(c =>
          c.id === action.chatId ? { ...c, isMuted: !c.isMuted } : c
        )
      }

    case 'ARCHIVE_CHAT':
      console.log('📁 MESSAGES: Archive chat - ID:', action.chatId)
      return {
        ...state,
        chats: state.chats.map(c =>
          c.id === action.chatId ? { ...c, isArchived: !c.isArchived } : c
        )
      }

    case 'DELETE_CHAT':
      console.log('🗑️ MESSAGES: Delete chat - ID:', action.chatId)
      return {
        ...state,
        chats: state.chats.filter(c => c.id !== action.chatId),
        selectedChat: state.selectedChat?.id === action.chatId ? null : state.selectedChat
      }

    case 'TOGGLE_SELECT_MESSAGE':
      console.log('✅ MESSAGES: Toggle select message - ID:', action.messageId)
      return {
        ...state,
        selectedMessages: state.selectedMessages.includes(action.messageId)
          ? state.selectedMessages.filter(id => id !== action.messageId)
          : [...state.selectedMessages, action.messageId]
      }

    case 'CLEAR_SELECTED_MESSAGES':
      console.log('🔄 MESSAGES: Clear selected messages')
      return { ...state, selectedMessages: [] }

    default:
      return state
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MessagesPage() {
  console.log('🚀 MESSAGES: Component mounted')

  // A+++ Loading & Error State
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // A+++ Accessibility
  const { announce } = useAnnouncer()

  // State Management with Reducer
  const [state, dispatch] = useReducer(messagesReducer, {
    chats: [],
    messages: [],
    selectedChat: null,
    searchTerm: '',
    filterCategory: 'all',
    isTyping: false,
    selectedMessages: []
  })

  // UI State
  const [newMessage, setNewMessage] = useState('')
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)

  // Modal States
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [isChatSettingsModalOpen, setIsChatSettingsModalOpen] = useState(false)
  const [isChatInfoModalOpen, setIsChatInfoModalOpen] = useState(false)
  const [isMediaGalleryModalOpen, setIsMediaGalleryModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Form States for New Chat
  const [newChatName, setNewChatName] = useState('')
  const [newChatType, setNewChatType] = useState<'direct' | 'group'>('direct')
  const [newChatMembers, setNewChatMembers] = useState('')

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  // Derived State
  const filteredChats = state.chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    const matchesFilter = state.filterCategory === 'all' ||
      (state.filterCategory === 'unread' && chat.unread > 0) ||
      (state.filterCategory === 'archived' && chat.isArchived) ||
      (state.filterCategory === 'groups' && chat.type === 'group')
    return matchesSearch && matchesFilter
  })

  const stats = {
    totalChats: state.chats.length,
    unreadChats: state.chats.filter(c => c.unread > 0).length,
    totalUnread: state.chats.reduce((sum, c) => sum + c.unread, 0),
    groupChats: state.chats.filter(c => c.type === 'group').length,
    pinnedChats: state.chats.filter(c => c.isPinned).length,
    archivedChats: state.chats.filter(c => c.isArchived).length
  }

  console.log('📊 MESSAGES: Stats calculated -', JSON.stringify(stats))

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load chats on mount
  useEffect(() => {
    console.log('🔄 MESSAGES: Loading chats...')
    const loadChats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('📡 MESSAGES: Simulating API call...')

        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.98) {
              console.log('❌ MESSAGES: API call failed (simulated error)')
              reject(new Error('Failed to load messages'))
            } else {
              console.log('✅ MESSAGES: API call successful')
              resolve(null)
            }
          }, 1000)
        })

        dispatch({ type: 'SET_CHATS', chats: mockChats })
        setIsLoading(false)
        console.log('✅ MESSAGES: Chats loaded successfully')
        announce(`${mockChats.length} conversations loaded`, 'polite')
      } catch (err) {
        console.error('❌ MESSAGES: Load chats error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load messages')
        setIsLoading(false)
        announce('Error loading messages', 'assertive')
      }
    }

    loadChats()
  }, [announce])

  // Load messages when chat selected
  useEffect(() => {
    if (state.selectedChat) {
      console.log('📥 MESSAGES: Loading messages for chat:', state.selectedChat.id)
      dispatch({ type: 'SET_MESSAGES', messages: mockMessagesForChat })
      console.log('✅ MESSAGES: Messages loaded for chat')
    }
  }, [state.selectedChat])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      console.log('📜 MESSAGES: Auto-scrolling to bottom')
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.messages])

  // Simulate typing indicator
  useEffect(() => {
    if (state.selectedChat && Math.random() > 0.7) {
      console.log('⌨️ MESSAGES: Contact is typing...')
      dispatch({ type: 'SET_TYPING', isTyping: true })
      setTimeout(() => {
        console.log('⌨️ MESSAGES: Contact stopped typing')
        dispatch({ type: 'SET_TYPING', isTyping: false })
      }, 3000)
    }
  }, [state.selectedChat])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !state.selectedChat || isSending) {
      console.log('⚠️ MESSAGES: Cannot send - empty message or no chat selected')
      return
    }

    console.log('📤 MESSAGES: Sending message...')
    console.log('💬 MESSAGES: Message content:', newMessage)
    console.log('👤 MESSAGES: To chat:', state.selectedChat.name)

    try {
      setIsSending(true)
      console.log('🔄 MESSAGES: Setting sending state to true')

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          data: {
            chatId: state.selectedChat.id,
            content: newMessage,
            type: 'text',
            senderId: 'user-1',
            replyTo: replyToMessage?.id
          }
        })
      })

      console.log('📡 MESSAGES: API response status:', response.status)

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      console.log('✅ MESSAGES: API response:', result)

      if (result.success) {
        const localMessage: Message = {
          id: `msg-${Date.now()}`,
          text: newMessage,
          sender: 'You',
          senderId: 'user-1',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          status: result.delivered ? 'delivered' : 'sent',
          replyTo: replyToMessage?.id
        }

        console.log('📨 MESSAGES: Adding message to local state')
        dispatch({ type: 'ADD_MESSAGE', message: localMessage })
        setNewMessage('')
        setReplyToMessage(null)
        console.log('✅ MESSAGES: Message sent successfully')

        toast.success('Message sent', {
          description: result.delivered ? `Delivered at ${localMessage.timestamp}` : 'Sent'
        })

        // Focus back on input
        messageInputRef.current?.focus()
        console.log('🎯 MESSAGES: Input focused for next message')
      }
    } catch (error: any) {
      console.error('❌ MESSAGES: Send message error:', error)
      toast.error('Failed to send message', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSending(false)
      console.log('🔄 MESSAGES: Sending state reset')
    }
  }

  const handleAttachFile = () => {
    console.log('📎 MESSAGES: Attach file clicked')
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '*/*'
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        console.log('📁 MESSAGES: Files selected:', files.length)
        Array.from(files).forEach((file, index) => {
          console.log(`📄 MESSAGES: File ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
        })
        toast.success(`📎 ${files.length} file(s) selected`, {
          description: 'Files ready to attach to message'
        })
      }
    }
    input.click()
  }

  const handleAttachImage = () => {
    console.log('🖼️ MESSAGES: Attach image clicked')
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        console.log('🖼️ MESSAGES: Images selected:', files.length)
        Array.from(files).forEach((file, index) => {
          console.log(`🖼️ MESSAGES: Image ${index + 1}: ${file.name}`)
        })
        toast.success(`🖼️ ${files.length} image(s) selected`, {
          description: 'Images ready to send in message'
        })
      }
    }
    input.click()
  }

  const handleRecordVoice = () => {
    const newState = !isRecordingVoice
    console.log('🎤 MESSAGES: Voice recording:', newState ? 'STARTED' : 'STOPPED')
    setIsRecordingVoice(newState)

    if (newState) {
      console.log('🎤 MESSAGES: Microphone activated')
      console.log('🎙️ MESSAGES: Speak your message now...')
      toast.success('🎤 Recording Started', {
        description: 'Speak your message. Click again to stop.'
      })
    } else {
      console.log('✅ MESSAGES: Recording complete')
      console.log('💬 MESSAGES: Voice message ready to send')
      toast.success('✅ Recording Complete', {
        description: 'Voice message added to chat'
      })
    }
  }

  const handlePinChat = (chatId: string) => {
    console.log('📌 MESSAGES: Toggle pin chat - ID:', chatId)
    dispatch({ type: 'TOGGLE_PIN_CHAT', chatId })
    const chat = state.chats.find(c => c.id === chatId)
    const isPinned = chat?.isPinned
    console.log('✅ MESSAGES: Chat', isPinned ? 'unpinned' : 'pinned')
    toast.success(isPinned ? '📌 Chat unpinned' : '📌 Chat pinned', {
      description: isPinned ? 'Removed from pinned list' : 'Moved to top of list'
    })
  }

  const handleMuteChat = (chatId: string) => {
    console.log('🔕 MESSAGES: Toggle mute chat - ID:', chatId)
    dispatch({ type: 'TOGGLE_MUTE_CHAT', chatId })
    const chat = state.chats.find(c => c.id === chatId)
    const isMuted = chat?.isMuted
    console.log('✅ MESSAGES: Chat notifications', isMuted ? 'enabled' : 'muted')
    toast.success(isMuted ? '🔔 Notifications enabled' : '🔕 Chat muted', {
      description: isMuted ? 'You will receive notifications' : 'Notifications turned off'
    })
  }

  const handleArchiveChat = (chatId: string) => {
    console.log('📁 MESSAGES: Toggle archive chat - ID:', chatId)
    dispatch({ type: 'ARCHIVE_CHAT', chatId })
    const chat = state.chats.find(c => c.id === chatId)
    const isArchived = chat?.isArchived
    console.log('✅ MESSAGES: Chat', isArchived ? 'unarchived' : 'archived')
    toast.success(isArchived ? '📤 Chat unarchived' : '📁 Chat archived', {
      description: isArchived ? 'Returned to active chats' : 'Moved to archive'
    })
  }

  const handleDeleteChat = (chatId: string) => {
    console.log('🗑️ MESSAGES: Delete chat request - ID:', chatId)
    const chat = state.chats.find(c => c.id === chatId)

    if (confirm(`⚠️ Delete conversation with ${chat?.name}? This action cannot be undone.`)) {
      console.log('✅ MESSAGES: User confirmed deletion')
      dispatch({ type: 'DELETE_CHAT', chatId })
      console.log('✅ MESSAGES: Chat deleted successfully')
      toast.success('🗑️ Chat deleted', {
        description: 'Conversation permanently removed'
      })
    } else {
      console.log('❌ MESSAGES: User canceled deletion')
    }
  }

  const handleMarkAsRead = (chatId: string) => {
    console.log('✅ MESSAGES: Mark as read - ID:', chatId)
    toast.success('✅ Marked as read', {
      description: 'All messages in this chat'
    })
  }

  const handleNewChat = async () => {
    if (!newChatName.trim()) {
      console.log('⚠️ MESSAGES: Cannot create chat - empty name')
      toast.error('Chat name required')
      return
    }

    console.log('➕ MESSAGES: Creating new chat...')
    console.log('📝 MESSAGES: Chat name:', newChatName)
    console.log('👥 MESSAGES: Chat type:', newChatType)
    console.log('👤 MESSAGES: Members:', newChatMembers)

    try {
      console.log('🔄 MESSAGES: Simulating API call...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        name: newChatName,
        lastMessage: 'Chat created',
        unread: 0,
        avatar: newChatName.substring(0, 2).toUpperCase(),
        type: newChatType,
        members: newChatType === 'group' ? (newChatMembers.split(',').length + 1) : undefined,
        isOnline: true,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        category: newChatType === 'group' ? 'groups' : 'all'
      }

      dispatch({ type: 'SET_CHATS', chats: [newChat, ...state.chats] })
      console.log('✅ MESSAGES: New chat created successfully')

      setIsNewChatModalOpen(false)
      setNewChatName('')
      setNewChatType('direct')
      setNewChatMembers('')

      toast.success('✅ Chat created', {
        description: `New ${newChatType} conversation started`
      })

      // Auto-select new chat
      dispatch({ type: 'SELECT_CHAT', chat: newChat })
      console.log('💬 MESSAGES: New chat auto-selected')
    } catch (error) {
      console.error('❌ MESSAGES: Create chat error:', error)
      toast.error('Failed to create chat')
    }
  }

  const handleReactToMessage = (messageId: string, emoji: string) => {
    console.log('❤️ MESSAGES: React to message - ID:', messageId, 'Emoji:', emoji)
    toast.success(`${emoji} Reaction added`)
  }

  const handleReplyToMessage = (message: Message) => {
    console.log('↩️ MESSAGES: Reply to message - ID:', message.id)
    setReplyToMessage(message)
    messageInputRef.current?.focus()
    console.log('📝 MESSAGES: Reply mode activated')
    toast.info('↩️ Reply mode', {
      description: `Replying to: "${message.text.substring(0, 30)}..."`
    })
  }

  const handleForwardMessage = (messageId: string) => {
    console.log('➡️ MESSAGES: Forward message - ID:', messageId)
    toast.info('➡️ Forward message', {
      description: 'Select conversation to forward'
    })
  }

  const handleEditMessage = (messageId: string, currentText: string) => {
    console.log('✏️ MESSAGES: Edit message - ID:', messageId)
    setEditingMessageId(messageId)
    setNewMessage(currentText)
    messageInputRef.current?.focus()
    console.log('📝 MESSAGES: Edit mode activated')
  }

  const handleDeleteMessage = (messageId: string) => {
    console.log('🗑️ MESSAGES: Delete message request - ID:', messageId)

    if (confirm('⚠️ Delete this message? This action cannot be undone.')) {
      console.log('✅ MESSAGES: User confirmed message deletion')
      dispatch({ type: 'DELETE_MESSAGE', messageId })
      console.log('✅ MESSAGES: Message deleted successfully')
      toast.success('🗑️ Message deleted')
    } else {
      console.log('❌ MESSAGES: User canceled message deletion')
    }
  }

  const handleExportChat = async () => {
    console.log('📥 MESSAGES: Export chat request')

    if (!state.selectedChat) {
      console.log('⚠️ MESSAGES: No chat selected for export')
      toast.error('No chat selected')
      return
    }

    console.log('📦 MESSAGES: Preparing export for chat:', state.selectedChat.name)
    console.log('💾 MESSAGES: Including', state.messages.length, 'messages')

    try {
      console.log('🔄 MESSAGES: Generating export file...')
      await new Promise(resolve => setTimeout(resolve, 1500))

      const exportData = {
        chatName: state.selectedChat.name,
        exportDate: new Date().toISOString(),
        messages: state.messages
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-${state.selectedChat.name}-${Date.now()}.json`
      a.click()

      console.log('✅ MESSAGES: Chat exported successfully')
      toast.success('✅ Chat exported', {
        description: `${state.messages.length} messages saved`
      })

      setIsExportModalOpen(false)
    } catch (error) {
      console.error('❌ MESSAGES: Export error:', error)
      toast.error('Export failed')
    }
  }

  const handleBulkDelete = () => {
    if (state.selectedMessages.length === 0) {
      console.log('⚠️ MESSAGES: No messages selected for bulk delete')
      return
    }

    console.log('🗑️ MESSAGES: Bulk delete request -', state.selectedMessages.length, 'messages')

    if (confirm(`⚠️ Delete ${state.selectedMessages.length} messages? This action cannot be undone.`)) {
      console.log('✅ MESSAGES: User confirmed bulk deletion')
      state.selectedMessages.forEach(id => {
        dispatch({ type: 'DELETE_MESSAGE', messageId: id })
      })
      dispatch({ type: 'CLEAR_SELECTED_MESSAGES' })
      console.log('✅ MESSAGES: Bulk deletion complete')
      toast.success(`🗑️ ${state.selectedMessages.length} messages deleted`)
    } else {
      console.log('❌ MESSAGES: User canceled bulk deletion')
    }
  }

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (isLoading) {
    console.log('⏳ MESSAGES: Rendering loading state')
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-3 gap-6">
            <ListSkeleton items={5} />
            <div className="col-span-2">
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: ERROR STATE
  // ============================================================================

  if (error) {
    console.log('❌ MESSAGES: Rendering error state -', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorEmptyState
            error={error}
            action={{
              label: 'Retry',
              onClick: () => {
                console.log('🔄 MESSAGES: User clicked retry')
                window.location.reload()
              }
            }}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: EMPTY STATE
  // ============================================================================

  if (state.chats.length === 0 && !isLoading) {
    console.log('📭 MESSAGES: Rendering empty state')
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
        <div className="max-w-7xl mx-auto">
          <NoDataEmptyState
            entityName="messages"
            description="Start a conversation to get connected with your team and clients."
            action={{
              label: 'Start a Conversation',
              onClick: () => {
                console.log('➕ MESSAGES: Empty state - start conversation clicked')
                setIsNewChatModalOpen(true)
              }
            }}
          />
        </div>
      </div>
    )
  }

  console.log('✅ MESSAGES: Rendering main content')

  // ============================================================================
  // RENDER: MAIN CONTENT
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats Overview */}
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Chats', value: stats.totalChats, icon: MessageSquare, color: 'blue' },
              { label: 'Unread', value: stats.unreadChats, icon: Bell, color: 'red' },
              { label: 'Messages', value: stats.totalUnread, icon: Hash, color: 'purple' },
              { label: 'Groups', value: stats.groupChats, icon: Users, color: 'green' },
              { label: 'Pinned', value: stats.pinnedChats, icon: Pin, color: 'yellow' },
              { label: 'Archived', value: stats.archivedChats, icon: Archive, color: 'gray' }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <LiquidGlassCard key={index} className="relative overflow-hidden">
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-4 w-4 text-${stat.color}-500`} />
                      <GlowEffect color={stat.color} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        <NumberFlow value={stat.value} />
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </LiquidGlassCard>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Main Messages Interface */}
        <ScrollReveal delay={0.1}>
          <LiquidGlassCard>
            <div className="flex h-[calc(100vh-250px)]">

              {/* Chat List Sidebar */}
              <div className="w-1/3 border-r border-slate-700/50 flex flex-col" data-testid="chat-list">

                {/* Sidebar Header */}
                <CardHeader className="pb-3 border-b border-slate-700/50">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <TextShimmer className="text-xl font-bold">
                        Messages
                      </TextShimmer>
                    </span>
                    <div className="flex items-center gap-2">
                      <Dialog open={isNewChatModalOpen} onOpenChange={setIsNewChatModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log('➕ MESSAGES: New chat button clicked')
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>New Conversation</DialogTitle>
                            <DialogDescription>Start a new chat or create a group</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="chat-name">Chat Name</Label>
                              <Input
                                id="chat-name"
                                placeholder="Enter name or group title"
                                value={newChatName}
                                onChange={(e) => setNewChatName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="chat-type">Type</Label>
                              <Select value={newChatType} onValueChange={(value: 'direct' | 'group') => setNewChatType(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="direct">Direct Message</SelectItem>
                                  <SelectItem value="group">Group Chat</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {newChatType === 'group' && (
                              <div className="space-y-2">
                                <Label htmlFor="members">Members (comma-separated emails)</Label>
                                <Textarea
                                  id="members"
                                  placeholder="email1@example.com, email2@example.com"
                                  value={newChatMembers}
                                  onChange={(e) => setNewChatMembers(e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => {
                              console.log('❌ MESSAGES: New chat canceled')
                              setIsNewChatModalOpen(false)
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={handleNewChat}>
                              Create Chat
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardTitle>

                  {/* Search */}
                  <div className="relative mt-3">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={state.searchTerm}
                      onChange={(e) => {
                        console.log('🔍 MESSAGES: Search query:', e.target.value)
                        dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })
                      }}
                      className="pl-8"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <Tabs value={state.filterCategory} onValueChange={(value) => {
                    console.log('🔽 MESSAGES: Filter changed to:', value)
                    dispatch({ type: 'SET_FILTER', filterCategory: value as any })
                  }} className="mt-3">
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                      <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                      <TabsTrigger value="groups" className="text-xs">Groups</TabsTrigger>
                      <TabsTrigger value="archived" className="text-xs">Archive</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>

                {/* Chat List */}
                <CardContent className="p-0 flex-1 overflow-y-auto">
                  <AnimatePresence>
                    {filteredChats.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 text-center text-muted-foreground"
                        data-testid="empty-chat-list"
                      >
                        No conversations found
                      </motion.div>
                    ) : (
                      filteredChats.map((chat, index) => (
                        <motion.div
                          key={chat.id}
                          data-testid={`chat-item-${chat.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 cursor-pointer hover:bg-accent transition-colors border-b border-slate-700/30 ${
                            state.selectedChat?.id === chat.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => {
                            console.log('💬 MESSAGES: Chat selected -', chat.name)
                            dispatch({ type: 'SELECT_CHAT', chat })
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-medium shadow-lg">
                                {chat.type === 'group' ? <Users className="h-5 w-5" /> : chat.avatar}
                              </div>
                              {chat.isOnline && chat.type === 'direct' && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <p className="font-medium truncate">{chat.name}</p>
                                  {chat.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                                  {chat.isMuted && <BellOff className="h-3 w-3 text-gray-500" />}
                                </div>
                                {chat.unread > 0 && (
                                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center shadow-lg">
                                    <NumberFlow value={chat.unread} className="inline-block" />
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                              {chat.type === 'group' && chat.members && (
                                <p className="text-xs text-muted-foreground mt-0.5">{chat.members} members</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </CardContent>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 flex flex-col">
                {state.selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="border-b border-slate-700/50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-medium shadow-lg">
                              {state.selectedChat.type === 'group' ? <Users className="h-5 w-5" /> : state.selectedChat.avatar}
                            </div>
                            {state.selectedChat.isOnline && state.selectedChat.type === 'direct' && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{state.selectedChat.name}</h3>
                            {state.selectedChat.type === 'direct' ? (
                              <p className={`text-sm flex items-center gap-1 ${state.selectedChat.isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
                                {state.selectedChat.isOnline ? (
                                  <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Active now
                                  </>
                                ) : (
                                  `Last seen ${state.selectedChat.lastSeen}`
                                )}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">{state.selectedChat.members} members</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            console.log('📹 MESSAGES: Starting video call with', state.selectedChat?.name)
                            toast.info('📹 Starting video call...', {
                              description: `Connecting to ${state.selectedChat?.name}`
                            })
                          }}>
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            console.log('📞 MESSAGES: Starting voice call with', state.selectedChat?.name)
                            toast.info('📞 Starting voice call...', {
                              description: `Calling ${state.selectedChat?.name}`
                            })
                          }}>
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Dialog open={isChatInfoModalOpen} onOpenChange={setIsChatInfoModalOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => {
                                console.log('ℹ️ MESSAGES: Opening chat info')
                              }}>
                                <Info className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Chat Information</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-2xl font-medium shadow-lg">
                                    {state.selectedChat.type === 'group' ? <Users className="h-8 w-8" /> : state.selectedChat.avatar}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg">{state.selectedChat.name}</h3>
                                    {state.selectedChat.type === 'group' && (
                                      <p className="text-sm text-muted-foreground">{state.selectedChat.members} members</p>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Button variant="outline" className="w-full justify-start" onClick={() => handleMuteChat(state.selectedChat!.id)}>
                                    {state.selectedChat.isMuted ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                                    {state.selectedChat.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                                  </Button>
                                  <Button variant="outline" className="w-full justify-start" onClick={() => handlePinChat(state.selectedChat!.id)}>
                                    <Pin className="h-4 w-4 mr-2" />
                                    {state.selectedChat.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                                  </Button>
                                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsMediaGalleryModalOpen(true)}>
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Media Gallery
                                  </Button>
                                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsExportModalOpen(true)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Chat
                                  </Button>
                                  <Button variant="outline" className="w-full justify-start" onClick={() => handleArchiveChat(state.selectedChat!.id)}>
                                    <Archive className="h-4 w-4 mr-2" />
                                    {state.selectedChat.isArchived ? 'Unarchive Chat' : 'Archive Chat'}
                                  </Button>
                                  <Button variant="destructive" className="w-full justify-start" onClick={() => handleDeleteChat(state.selectedChat!.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Chat
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {state.selectedMessages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-500/10 border-b border-blue-500/20 p-2 flex items-center justify-between"
                      >
                        <p className="text-sm">
                          <NumberFlow value={state.selectedMessages.length} /> message(s) selected
                        </p>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={handleBulkDelete}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            console.log('🔄 MESSAGES: Clear selection')
                            dispatch({ type: 'CLEAR_SELECTED_MESSAGES' })
                          }}>
                            <X className="h-4 w-4 mr-1" />
                            Clear
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto" data-testid="chat-messages">
                      <div className="space-y-4">
                        <AnimatePresence>
                          {state.messages.map((message, index) => {
                            const isOwnMessage = message.sender === 'You'
                            const isSelected = state.selectedMessages.includes(message.id)

                            return (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                              >
                                <div className={`flex items-start gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      console.log('☑️ MESSAGES: Toggle select message:', message.id)
                                      dispatch({ type: 'TOGGLE_SELECT_MESSAGE', messageId: message.id })
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-2"
                                  />
                                  <div className="space-y-1">
                                    <div
                                      className={`px-4 py-2 rounded-lg ${
                                        isOwnMessage
                                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                                          : 'bg-slate-800/50'
                                      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                      {message.replyTo && (
                                        <div className="text-xs opacity-70 mb-1 pb-1 border-b border-white/20">
                                          Replying to previous message
                                        </div>
                                      )}
                                      {message.type === 'image' && message.attachments && (
                                        <div className="mb-2">
                                          {message.attachments.map((att, i) => (
                                            <div key={i} className="bg-slate-700/50 p-2 rounded">
                                              <ImageIcon className="h-4 w-4 inline mr-1" />
                                              {att.name}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <p className="text-sm">{message.text}</p>
                                      {message.isEdited && (
                                        <p className="text-xs opacity-60 mt-1">(edited)</p>
                                      )}
                                      {message.reactions && message.reactions.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                          {message.reactions.map((reaction, i) => (
                                            <span key={i} className="text-xs bg-white/10 px-1 rounded">
                                              {reaction.emoji}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                                      <span>{message.timestamp}</span>
                                      {isOwnMessage && (
                                        <>
                                          {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                                          {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                                          {message.status === 'sent' && <Check className="h-3 w-3" />}
                                        </>
                                      )}
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button onClick={() => handleReactToMessage(message.id, '👍')} className="hover:bg-slate-700 p-1 rounded">
                                          <Smile className="h-3 w-3" />
                                        </button>
                                        <button onClick={() => handleReplyToMessage(message)} className="hover:bg-slate-700 p-1 rounded">
                                          <Reply className="h-3 w-3" />
                                        </button>
                                        {isOwnMessage && (
                                          <>
                                            <button onClick={() => handleEditMessage(message.id, message.text)} className="hover:bg-slate-700 p-1 rounded">
                                              <Edit2 className="h-3 w-3" />
                                            </button>
                                            <button onClick={() => handleDeleteMessage(message.id)} className="hover:bg-slate-700 p-1 rounded">
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </>
                                        )}
                                        <button onClick={() => handleForwardMessage(message.id)} className="hover:bg-slate-700 p-1 rounded">
                                          <Forward className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        <AnimatePresence>
                          {state.isTyping && (
                            <div className="flex justify-start">
                              <TypingIndicator />
                            </div>
                          )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Reply Preview */}
                    {replyToMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-2 bg-blue-500/10 border-t border-blue-500/20 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs text-blue-500">Replying to {replyToMessage.sender}</p>
                          <p className="text-sm truncate max-w-md">{replyToMessage.text}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          console.log('❌ MESSAGES: Cancel reply')
                          setReplyToMessage(null)
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Message Input */}
                    <div className="border-t border-slate-700/50 p-4">
                      <div className="flex gap-2 mb-2">
                        <Button variant="ghost" size="sm" onClick={handleAttachFile}>
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleAttachImage}>
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={isRecordingVoice ? "destructive" : "ghost"}
                          size="sm"
                          onClick={handleRecordVoice}
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          console.log('😀 MESSAGES: Emoji picker clicked')
                          setShowEmojiPicker(!showEmojiPicker)
                        }}>
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          ref={messageInputRef}
                          data-testid="message-input"
                          placeholder={editingMessageId ? "Edit message..." : "Type a message..."}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          className="flex-1"
                          disabled={isSending}
                        />
                        <Button
                          data-testid="send-button"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isSending}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isSending ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Send className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mx-auto flex items-center justify-center">
                        <MessageSquare className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                        <p className="text-muted-foreground">Choose a chat from the sidebar to start messaging</p>
                      </div>
                      <Button onClick={() => {
                        console.log('➕ MESSAGES: Start new chat from empty state')
                        setIsNewChatModalOpen(true)
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Chat
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>
      </div>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Chat</DialogTitle>
            <DialogDescription>
              Download your chat history for {state.selectedChat?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              This will export {state.messages.length} messages as a JSON file.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-medium">JSON</span>
              </div>
              <div className="flex justify-between">
                <span>Messages:</span>
                <span className="font-medium"><NumberFlow value={state.messages.length} /></span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium">~{(state.messages.length * 0.5).toFixed(1)} KB</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              console.log('❌ MESSAGES: Export canceled')
              setIsExportModalOpen(false)
            }}>
              Cancel
            </Button>
            <Button onClick={handleExportChat}>
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Gallery Modal */}
      <Dialog open={isMediaGalleryModalOpen} onOpenChange={setIsMediaGalleryModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Media Gallery</DialogTitle>
            <DialogDescription>
              All media shared in this conversation
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="images">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>
              <TabsContent value="images" className="mt-4">
                <div className="grid grid-cols-3 gap-4">
                  {state.messages
                    .filter(m => m.type === 'image' && m.attachments)
                    .flatMap(m => m.attachments!)
                    .map((att, i) => (
                      <div key={i} className="aspect-square bg-slate-800 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    ))}
                  {state.messages.filter(m => m.type === 'image').length === 0 && (
                    <p className="col-span-3 text-center text-muted-foreground py-8">
                      No images shared yet
                    </p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="files" className="mt-4">
                <p className="text-center text-muted-foreground py-8">No files shared yet</p>
              </TabsContent>
              <TabsContent value="links" className="mt-4">
                <p className="text-center text-muted-foreground py-8">No links shared yet</p>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
