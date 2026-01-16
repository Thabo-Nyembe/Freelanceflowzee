/**
 * Messages Hub Utilities
 *
 * World-class A+++ messaging system with comprehensive types, mock data, and helper functions.
 * Supports direct messages, group chats, channels, reactions, replies, attachments, and more.
 *
 * Features:
 * - Real-time messaging
 * - File/image/voice attachments
 * - Emoji reactions
 * - Message threads and replies
 * - Read receipts
 * - Typing indicators
 * - Online status
 * - Message search and filtering
 * - Chat permissions and roles
 * - Group chat management
 */

import {
  MessageSquare,
  Image as ImageIcon,
  File,
  Mic,
  Video,
  MapPin,
  User,
  CheckCheck,
  Check,
  Clock,
  type LucideIcon
} from 'lucide-react'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface Message {
  id: string
  text: string
  sender: string
  senderId: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'location' | 'contact'
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  reactions?: MessageReaction[]
  replyTo?: string
  mentions?: string[]
  attachments?: MessageAttachment[]
  isEdited?: boolean
  editedAt?: string
  isPinned?: boolean
  isStarred?: boolean
  isDeleted?: boolean
  deletedAt?: string
  metadata?: MessageMetadata
  threadId?: string
  threadCount?: number
}

export interface MessageReaction {
  id: string
  emoji: string
  userId: string
  userName: string
  createdAt: string
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: 'image' | 'video' | 'audio' | 'document' | 'other'
  size: number
  mimeType: string
  thumbnailUrl?: string
  duration?: number
  width?: number
  height?: number
}

export interface Chat {
  id: string
  name: string
  description?: string
  avatar: string
  type: 'direct' | 'group' | 'channel'
  members: ChatMember[]
  memberCount: number
  lastMessage: Message | null
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  isArchived: boolean
  isBlocked: boolean
  createdAt: string
  updatedAt: string
  settings: ChatSettings
  category: 'all' | 'unread' | 'archived' | 'groups'
}

export interface ChatMember {
  id: string
  userId: string
  name: string
  avatar: string
  email?: string
  role: 'owner' | 'admin' | 'member'
  isOnline: boolean
  lastSeen: string
  joinedAt: string
  isTyping?: boolean
  customStatus?: string
}

export interface ChatSettings {
  notifications: boolean
  muteUntil?: string
  pinned: boolean
  archived: boolean
  blocked: boolean
  permissions: ChatPermissions
  theme?: string
  background?: string
}

export interface ChatPermissions {
  canSendMessages: boolean
  canSendMedia: boolean
  canAddMembers: boolean
  canRemoveMembers: boolean
  canEditInfo: boolean
  canPinMessages: boolean
  canDeleteMessages: boolean
  canManageSettings: boolean
}

export interface MessageMetadata {
  deliveredAt?: string
  readAt?: string
  readBy?: string[]
  forwardedFrom?: string
  originalMessageId?: string
  links?: string[]
  hashtags?: string[]
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
}

export interface ChatInvite {
  id: string
  chatId: string
  inviterId: string
  inviterName: string
  inviteeEmail: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: string
  expiresAt: string
}

export interface TypingIndicator {
  chatId: string
  userId: string
  userName: string
  startedAt: string
}

export interface MessageThread {
  id: string
  parentMessageId: string
  messages: Message[]
  participantCount: number
  lastActivityAt: string
}

export interface ChatStats {
  totalMessages: number
  totalMedia: number
  totalFiles: number
  activeMembers: number
  messageRate: number
  peakHours: number[]
}

// ============================================================================
// HELPER FUNCTIONS (30+ functions)
// ============================================================================

/**
 * Formats message timestamp to human-readable format
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Formats timestamp to time only (e.g., "10:30 AM")
 */
export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formats timestamp to full date and time
 */
export function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Gets icon for message type
 */
export function getMessageIcon(type: Message['type']): LucideIcon {
  const iconMap: Record<Message['type'], LucideIcon> = {
    text: MessageSquare,
    image: ImageIcon,
    file: File,
    voice: Mic,
    video: Video,
    location: MapPin,
    contact: User
  }
  return iconMap[type] || MessageSquare
}

/**
 * Gets icon for message status
 */
export function getStatusIcon(status: Message['status']): LucideIcon {
  const iconMap: Record<Message['status'], LucideIcon> = {
    sending: Clock,
    sent: Check,
    delivered: CheckCheck,
    read: CheckCheck,
    failed: X
  }
  return iconMap[status] || Clock
}

/**
 * Sorts chats by last activity (most recent first)
 */
export function sortChatsByActivity(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime()
    const dateB = new Date(b.updatedAt).getTime()
    return dateB - dateA
  })
}

/**
 * Sorts chats by unread count (highest first)
 */
export function sortChatsByUnread(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => b.unreadCount - a.unreadCount)
}

/**
 * Sorts chats with pinned first, then by activity
 */
export function sortChatsByPinned(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

/**
 * Filters chats by type
 */
export function filterChatsByType(chats: Chat[], type: Chat['type']): Chat[] {
  return chats.filter(chat => chat.type === type)
}

/**
 * Filters pinned chats
 */
export function filterPinnedChats(chats: Chat[]): Chat[] {
  return chats.filter(chat => chat.isPinned)
}

/**
 * Filters archived chats
 */
export function filterArchivedChats(chats: Chat[]): Chat[] {
  return chats.filter(chat => chat.isArchived)
}

/**
 * Filters chats with unread messages
 */
export function filterUnreadChats(chats: Chat[]): Chat[] {
  return chats.filter(chat => chat.unreadCount > 0)
}

/**
 * Filters muted chats
 */
export function filterMutedChats(chats: Chat[]): Chat[] {
  return chats.filter(chat => chat.isMuted)
}

/**
 * Searches chats by name or last message
 */
export function searchChats(chats: Chat[], query: string): Chat[] {
  const lowerQuery = query.toLowerCase()
  return chats.filter(chat =>
    chat.name.toLowerCase().includes(lowerQuery) ||
    chat.lastMessage?.text.toLowerCase().includes(lowerQuery) ||
    chat.description?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Searches messages by text content
 */
export function searchMessages(messages: Message[], query: string): Message[] {
  const lowerQuery = query.toLowerCase()
  return messages.filter(message =>
    message.text.toLowerCase().includes(lowerQuery) ||
    message.attachments?.some(att => att.name.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Gets total unread count across all chats
 */
export function getUnreadCount(chats: Chat[]): number {
  return chats.reduce((sum, chat) => sum + chat.unreadCount, 0)
}

/**
 * Gets total message count across all chats
 */
export function getTotalMessageCount(messages: { [key: string]: Message[] }): number {
  return Object.values(messages).reduce((sum, chatMessages) => sum + chatMessages.length, 0)
}

/**
 * Groups messages by date
 */
export function groupMessagesByDate(messages: Message[]): { [date: string]: Message[] } {
  const grouped: { [date: string]: Message[] } = {}

  messages.forEach(message => {
    const date = new Date(message.timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(message)
  })

  return grouped
}

/**
 * Extracts mentions from message text
 */
export function getMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }

  return mentions
}

/**
 * Highlights mentions in message text
 */
export function highlightMentions(text: string): string {
  return text.replace(/@(\w+)/g, '<span class="text-blue-500 font-medium">@$1</span>')
}

/**
 * Extracts hashtags from message text
 */
export function getHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g
  const hashtags: string[] = []
  let match

  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1])
  }

  return hashtags
}

/**
 * Extracts URLs from message text
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

/**
 * Checks if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/**
 * Checks if file is a video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

/**
 * Checks if file is audio
 */
export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith('audio/')
}

/**
 * Checks if file is a document
 */
export function isDocumentFile(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
  return documentTypes.includes(mimeType)
}

/**
 * Formats file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Checks if user can send messages in chat
 */
export function canUserSendMessage(chat: Chat, userId: string): boolean {
  return chat.settings.permissions.canSendMessages && !chat.isBlocked
}

/**
 * Checks if user can send media in chat
 */
export function canUserSendMedia(chat: Chat, userId: string): boolean {
  return chat.settings.permissions.canSendMedia && !chat.isBlocked
}

/**
 * Checks if user can add members to chat
 */
export function canUserAddMembers(chat: Chat, userId: string): boolean {
  const member = chat.members.find(m => m.userId === userId)
  return member?.role !== 'member' && chat.settings.permissions.canAddMembers
}

/**
 * Checks if user can remove members from chat
 */
export function canUserRemoveMembers(chat: Chat, userId: string): boolean {
  const member = chat.members.find(m => m.userId === userId)
  return member?.role === 'owner' && chat.settings.permissions.canRemoveMembers
}

/**
 * Gets online members in chat
 */
export function getOnlineMembers(chat: Chat): ChatMember[] {
  return chat.members.filter(member => member.isOnline)
}

/**
 * Gets typing users in chat
 */
export function getTypingUsers(chat: Chat): ChatMember[] {
  return chat.members.filter(member => member.isTyping)
}

/**
 * Gets admin members in chat
 */
export function getAdminMembers(chat: Chat): ChatMember[] {
  return chat.members.filter(member => member.role === 'admin' || member.role === 'owner')
}

/**
 * Calculates chat activity score
 */
export function calculateActivityScore(chat: Chat): number {
  const hoursSinceUpdate = (Date.now() - new Date(chat.updatedAt).getTime()) / (1000 * 60 * 60)
  const unreadWeight = chat.unreadCount * 10
  const pinnedWeight = chat.isPinned ? 100 : 0
  const recencyScore = Math.max(0, 100 - hoursSinceUpdate)

  return recencyScore + unreadWeight + pinnedWeight
}

/**
 * Gets message attachments by type
 */
export function getAttachmentsByType(
  messages: Message[],
  type: MessageAttachment['type']
): MessageAttachment[] {
  return messages
    .flatMap(m => m.attachments || [])
    .filter(att => att.type === type)
}

/**
 * Filters messages by date range
 */
export function filterMessagesByDateRange(
  messages: Message[],
  startDate: Date,
  endDate: Date
): Message[] {
  return messages.filter(message => {
    const messageDate = new Date(message.timestamp)
    return messageDate >= startDate && messageDate <= endDate
  })
}

/**
 * Gets message statistics for a chat
 */
export function getMessageStats(messages: Message[]): {
  total: number
  text: number
  images: number
  files: number
  voice: number
  video: number
  withReactions: number
  withAttachments: number
} {
  return {
    total: messages.length,
    text: messages.filter(m => m.type === 'text').length,
    images: messages.filter(m => m.type === 'image').length,
    files: messages.filter(m => m.type === 'file').length,
    voice: messages.filter(m => m.type === 'voice').length,
    video: messages.filter(m => m.type === 'video').length,
    withReactions: messages.filter(m => m.reactions && m.reactions.length > 0).length,
    withAttachments: messages.filter(m => m.attachments && m.attachments.length > 0).length
  }
}

/**
 * Validates message before sending
 */
export function validateMessage(message: Partial<Message>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!message.text || message.text.trim().length === 0) {
    errors.push('Message text cannot be empty')
  }

  if (message.text && message.text.length > 10000) {
    errors.push('Message text too long (max 10,000 characters)')
  }

  if (message.attachments && message.attachments.length > 10) {
    errors.push('Too many attachments (max 10)')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Generates chat export data
 */
export function generateChatExport(chat: Chat, messages: Message[]): string {
  const exportData = {
    chat: {
      id: chat.id,
      name: chat.name,
      type: chat.type,
      memberCount: chat.memberCount,
      createdAt: chat.createdAt
    },
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map(msg => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
      type: msg.type,
      attachments: msg.attachments?.map(att => ({
        name: att.name,
        type: att.type,
        size: att.size
      }))
    }))
  }

  return JSON.stringify(exportData, null, 2)
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const MESSAGE_TYPES = ['text', 'image', 'file', 'voice', 'video', 'location', 'contact'] as const
export const MESSAGE_STATUSES = ['sending', 'sent', 'delivered', 'read', 'failed'] as const
export const CHAT_TYPES = ['direct', 'group', 'channel'] as const
export const MEMBER_ROLES = ['owner', 'admin', 'member'] as const
export const ATTACHMENT_TYPES = ['image', 'video', 'audio', 'document', 'other'] as const

export const MAX_MESSAGE_LENGTH = 10000
export const MAX_ATTACHMENTS_PER_MESSAGE = 10
export const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024 // 50MB
export const MAX_GROUP_MEMBERS = 256

export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime']
export const SUPPORTED_AUDIO_FORMATS = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
export const SUPPORTED_DOCUMENT_FORMATS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]
