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
  Phone,
  User,
  Users,
  Send,
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
// MOCK DATA - CHATS (50+ diverse conversations)
// ============================================================================

export const MOCK_CHATS: Chat[] = [
  // Pinned Direct Messages
  {
    id: 'chat-1',
    name: 'John Doe',
    description: undefined,
    avatar: 'JD',
    type: 'direct',
    members: [
      {
        id: 'member-1',
        userId: 'user-2',
        name: 'John Doe',
        avatar: 'JD',
        email: 'john.doe@example.com',
        role: 'member',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-01-01T00:00:00Z'
      }
    ],
    memberCount: 2,
    lastMessage: {
      id: 'msg-1',
      text: 'Thanks for the project update!',
      sender: 'John Doe',
      senderId: 'user-2',
      timestamp: '2024-11-26T10:35:00Z',
      type: 'text',
      status: 'read'
    },
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-26T10:35:00Z',
    settings: {
      notifications: true,
      pinned: true,
      archived: false,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditInfo: false,
        canPinMessages: true,
        canDeleteMessages: true,
        canManageSettings: true
      }
    },
    category: 'all'
  },
  {
    id: 'chat-2',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    type: 'direct',
    members: [
      {
        id: 'member-2',
        userId: 'user-3',
        name: 'Sarah Johnson',
        avatar: 'SJ',
        email: 'sarah.j@example.com',
        role: 'member',
        isOnline: false,
        lastSeen: '2024-11-26T08:30:00Z',
        joinedAt: '2024-01-15T00:00:00Z'
      }
    ],
    memberCount: 2,
    lastMessage: {
      id: 'msg-2',
      text: 'Can we schedule a call?',
      sender: 'Sarah Johnson',
      senderId: 'user-3',
      timestamp: '2024-11-26T09:15:00Z',
      type: 'text',
      status: 'read'
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-11-26T09:15:00Z',
    settings: {
      notifications: true,
      pinned: false,
      archived: false,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditInfo: false,
        canPinMessages: true,
        canDeleteMessages: true,
        canManageSettings: true
      }
    },
    category: 'all'
  },
  {
    id: 'chat-3',
    name: 'Mike Wilson',
    avatar: 'MW',
    type: 'direct',
    members: [
      {
        id: 'member-3',
        userId: 'user-4',
        name: 'Mike Wilson',
        avatar: 'MW',
        email: 'mike.w@example.com',
        role: 'member',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-02-01T00:00:00Z',
        customStatus: 'Working on video edits'
      }
    ],
    memberCount: 2,
    lastMessage: {
      id: 'msg-3',
      text: 'The design looks great!',
      sender: 'Mike Wilson',
      senderId: 'user-4',
      timestamp: '2024-11-26T10:00:00Z',
      type: 'text',
      status: 'read',
      reactions: [
        { id: 'reaction-1', emoji: '🎉', userId: 'user-1', userName: 'You', createdAt: '2024-11-26T10:01:00Z' }
      ]
    },
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-11-26T10:00:00Z',
    settings: {
      notifications: true,
      pinned: false,
      archived: false,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditInfo: false,
        canPinMessages: true,
        canDeleteMessages: true,
        canManageSettings: true
      }
    },
    category: 'all'
  },

  // Pinned Group Chats
  {
    id: 'chat-4',
    name: 'Project Team Alpha',
    description: 'Main project coordination channel',
    avatar: 'PT',
    type: 'group',
    members: [
      {
        id: 'member-4',
        userId: 'user-1',
        name: 'You',
        avatar: 'YO',
        email: 'you@example.com',
        role: 'owner',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'member-5',
        userId: 'user-5',
        name: 'Emily Chen',
        avatar: 'EC',
        email: 'emily.c@example.com',
        role: 'admin',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-01-02T00:00:00Z'
      },
      {
        id: 'member-6',
        userId: 'user-6',
        name: 'David Lee',
        avatar: 'DL',
        email: 'david.l@example.com',
        role: 'member',
        isOnline: false,
        lastSeen: '2024-11-26T09:00:00Z',
        joinedAt: '2024-01-03T00:00:00Z'
      },
      {
        id: 'member-7',
        userId: 'user-7',
        name: 'Lisa Martinez',
        avatar: 'LM',
        email: 'lisa.m@example.com',
        role: 'member',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-01-04T00:00:00Z'
      },
      {
        id: 'member-8',
        userId: 'user-8',
        name: 'Robert Brown',
        avatar: 'RB',
        email: 'robert.b@example.com',
        role: 'member',
        isOnline: false,
        lastSeen: '2024-11-26T08:45:00Z',
        joinedAt: '2024-01-05T00:00:00Z'
      }
    ],
    memberCount: 8,
    lastMessage: {
      id: 'msg-4',
      text: 'Meeting at 3pm today',
      sender: 'Emily Chen',
      senderId: 'user-5',
      timestamp: '2024-11-26T09:30:00Z',
      type: 'text',
      status: 'delivered',
      mentions: ['@everyone']
    },
    unreadCount: 5,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-26T09:30:00Z',
    settings: {
      notifications: true,
      pinned: true,
      archived: false,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: true,
        canRemoveMembers: true,
        canEditInfo: true,
        canPinMessages: true,
        canDeleteMessages: true,
        canManageSettings: true
      }
    },
    category: 'groups'
  },
  {
    id: 'chat-5',
    name: 'Design Review',
    description: 'Weekly design critique and feedback',
    avatar: 'DR',
    type: 'group',
    members: [
      {
        id: 'member-9',
        userId: 'user-1',
        name: 'You',
        avatar: 'YO',
        role: 'admin',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-02-01T00:00:00Z'
      },
      {
        id: 'member-10',
        userId: 'user-9',
        name: 'Alex Thompson',
        avatar: 'AT',
        role: 'member',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-02-01T00:00:00Z'
      }
    ],
    memberCount: 5,
    lastMessage: {
      id: 'msg-5',
      text: 'New mockups uploaded',
      sender: 'Alex Thompson',
      senderId: 'user-9',
      timestamp: '2024-11-26T08:45:00Z',
      type: 'image',
      status: 'read',
      attachments: [
        {
          id: 'att-1',
          name: 'homepage-redesign.png',
          url: '/uploads/homepage-redesign.png',
          type: 'image',
          size: 2458000,
          mimeType: 'image/png',
          width: 1920,
          height: 1080
        }
      ]
    },
    unreadCount: 3,
    isPinned: false,
    isMuted: true,
    isArchived: false,
    isBlocked: false,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-11-26T08:45:00Z',
    settings: {
      notifications: false,
      muteUntil: '2024-11-27T00:00:00Z',
      pinned: false,
      archived: false,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: true,
        canRemoveMembers: false,
        canEditInfo: true,
        canPinMessages: true,
        canDeleteMessages: true,
        canManageSettings: true
      }
    },
    category: 'groups'
  },

  // More Direct Messages
  {
    id: 'chat-6',
    name: 'Emma Davis',
    avatar: 'ED',
    type: 'direct',
    members: [
      {
        id: 'member-11',
        userId: 'user-10',
        name: 'Emma Davis',
        avatar: 'ED',
        role: 'member',
        isOnline: false,
        lastSeen: '2024-11-25T10:00:00Z',
        joinedAt: '2024-03-01T00:00:00Z'
      }
    ],
    memberCount: 2,
    lastMessage: {
      id: 'msg-6',
      text: 'See you tomorrow!',
      sender: 'Emma Davis',
      senderId: 'user-10',
      timestamp: '2024-11-25T17:00:00Z',
      type: 'text',
      status: 'read'
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: true,
    isBlocked: false,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-11-25T17:00:00Z',
    settings: {
      notifications: true,
      pinned: false,
      archived: true,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditInfo: false,
        canPinMessages: true,
        canDeleteMessages: true,
        canManageSettings: true
      }
    },
    category: 'archived'
  },
  {
    id: 'chat-7',
    name: 'James Wilson',
    avatar: 'JW',
    type: 'direct',
    members: [
      {
        id: 'member-12',
        userId: 'user-11',
        name: 'James Wilson',
        avatar: 'JW',
        role: 'member',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-03-15T00:00:00Z'
      }
    ],
    memberCount: 2,
    lastMessage: {
      id: 'msg-7',
      text: 'Let me know when you are free',
      sender: 'James Wilson',
      senderId: 'user-11',
      timestamp: '2024-11-26T07:30:00Z',
      type: 'text',
      status: 'delivered'
    },
    unreadCount: 4,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-11-26T07:30:00Z',
    settings: {
      notifications: true,
      pinned: false,
      archived: false,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditInfo: false,
        canPinMessages: true,
        canDeleteMessages: true,
        canManageSettings: true
      }
    },
    category: 'all'
  },
  {
    id: 'chat-8',
    name: 'Olivia Taylor',
    avatar: 'OT',
    type: 'direct',
    members: [
      {
        id: 'member-13',
        userId: 'user-12',
        name: 'Olivia Taylor',
        avatar: 'OT',
        role: 'member',
        isOnline: false,
        lastSeen: '2024-11-26T06:00:00Z',
        joinedAt: '2024-04-01T00:00:00Z'
      }
    ],
    memberCount: 2,
    lastMessage: {
      id: 'msg-8',
      text: 'Thanks for your help!',
      sender: 'You',
      senderId: 'user-1',
      timestamp: '2024-11-26T06:45:00Z',
      type: 'text',
      status: 'read'
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-11-26T06:45:00Z',
    settings: {
      notifications: true,
      pinned: false,
      archived: false,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditInfo: false,
        canPinMessages: true,
        canDeleteMessages: true,
        canManageSettings: true
      }
    },
    category: 'all'
  },

  // More Group Chats
  {
    id: 'chat-9',
    name: 'Marketing Team',
    description: 'Campaign planning and execution',
    avatar: 'MT',
    type: 'group',
    members: [
      {
        id: 'member-14',
        userId: 'user-1',
        name: 'You',
        avatar: 'YO',
        role: 'member',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-04-10T00:00:00Z'
      }
    ],
    memberCount: 6,
    lastMessage: {
      id: 'msg-9',
      text: 'Campaign metrics look promising!',
      sender: 'Marketing Lead',
      senderId: 'user-13',
      timestamp: '2024-11-26T05:20:00Z',
      type: 'text',
      status: 'read'
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: '2024-04-10T00:00:00Z',
    updatedAt: '2024-11-26T05:20:00Z',
    settings: {
      notifications: true,
      pinned: false,
      archived: false,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditInfo: false,
        canPinMessages: false,
        canDeleteMessages: false,
        canManageSettings: false
      }
    },
    category: 'groups'
  },
  {
    id: 'chat-10',
    name: 'Development Squad',
    description: 'Engineering and technical discussions',
    avatar: 'DS',
    type: 'group',
    members: [
      {
        id: 'member-15',
        userId: 'user-1',
        name: 'You',
        avatar: 'YO',
        role: 'admin',
        isOnline: true,
        lastSeen: 'Active now',
        joinedAt: '2024-05-01T00:00:00Z'
      }
    ],
    memberCount: 12,
    lastMessage: {
      id: 'msg-10',
      text: 'Deployment scheduled for Friday',
      sender: 'Tech Lead',
      senderId: 'user-14',
      timestamp: '2024-11-26T04:15:00Z',
      type: 'text',
      status: 'read',
      isPinned: true
    },
    unreadCount: 7,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-11-26T04:15:00Z',
    settings: {
      notifications: true,
      pinned: false,
      archived: false,
      blocked: false,
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: true,
        canRemoveMembers: true,
        canEditInfo: true,
        canPinMessages: true,
        canDeleteMessages: true,
        canManageSettings: true
      }
    },
    category: 'groups'
  },

  // Additional 40+ Chats (shortened for brevity, but maintaining structure)
  ...Array.from({ length: 40 }, (_, i) => {
    const chatNum = i + 11
    const isGroup = i % 3 === 0
    const hasUnread = i % 4 === 0
    const isPinned = i % 10 === 0
    const isMuted = i % 7 === 0
    const isArchived = i % 15 === 0

    return {
      id: `chat-${chatNum}`,
      name: isGroup ? `Team ${chatNum}` : `User ${chatNum}`,
      description: isGroup ? `Group chat for team ${chatNum}` : undefined,
      avatar: isGroup ? `T${chatNum}` : `U${chatNum}`,
      type: (isGroup ? 'group' : 'direct') as Chat['type'],
      members: [
        {
          id: `member-${chatNum}`,
          userId: `user-${chatNum}`,
          name: isGroup ? `Team ${chatNum}` : `User ${chatNum}`,
          avatar: isGroup ? `T${chatNum}` : `U${chatNum}`,
          role: 'member' as ChatMember['role'],
          isOnline: i % 2 === 0,
          lastSeen: i % 2 === 0 ? 'Active now' : `${i + 1} hours ago`,
          joinedAt: `2024-0${(i % 8) + 1}-01T00:00:00Z`
        }
      ],
      memberCount: isGroup ? (i % 10) + 3 : 2,
      lastMessage: {
        id: `msg-${chatNum}`,
        text: `Message ${chatNum} - ${isGroup ? 'Group discussion' : 'Direct conversation'}`,
        sender: isGroup ? `Member ${i + 1}` : `User ${chatNum}`,
        senderId: `user-${chatNum}`,
        timestamp: `2024-11-${26 - (i % 26)}T${String(i % 24).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')}:00Z`,
        type: 'text' as Message['type'],
        status: 'read' as Message['status']
      } as Message,
      unreadCount: hasUnread ? (i % 10) + 1 : 0,
      isPinned,
      isMuted,
      isArchived,
      isBlocked: false,
      createdAt: `2024-0${(i % 8) + 1}-01T00:00:00Z`,
      updatedAt: `2024-11-${26 - (i % 26)}T${String(i % 24).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')}:00Z`,
      settings: {
        notifications: !isMuted,
        muteUntil: isMuted ? '2024-12-01T00:00:00Z' : undefined,
        pinned: isPinned,
        archived: isArchived,
        blocked: false,
        permissions: {
          canSendMessages: true,
          canSendMedia: true,
          canAddMembers: isGroup,
          canRemoveMembers: false,
          canEditInfo: false,
          canPinMessages: true,
          canDeleteMessages: true,
          canManageSettings: false
        }
      },
      category: (isArchived ? 'archived' : (hasUnread ? 'unread' : (isGroup ? 'groups' : 'all'))) as Chat['category']
    } as Chat
  })
]

// ============================================================================
// MOCK DATA - MESSAGES (200+ messages across different chats)
// ============================================================================

export const MOCK_MESSAGES: { [chatId: string]: Message[] } = {
  'chat-1': [
    {
      id: 'msg-1-1',
      text: 'Hi there! How are you doing?',
      sender: 'John Doe',
      senderId: 'user-2',
      timestamp: '2024-11-26T10:30:00Z',
      type: 'text',
      status: 'read',
      metadata: {
        readAt: '2024-11-26T10:31:00Z',
        readBy: ['user-1']
      }
    },
    {
      id: 'msg-1-2',
      text: "I'm doing well, thanks for asking! Working on the new project.",
      sender: 'You',
      senderId: 'user-1',
      timestamp: '2024-11-26T10:32:00Z',
      type: 'text',
      status: 'read',
      metadata: {
        readAt: '2024-11-26T10:32:30Z',
        readBy: ['user-2']
      }
    },
    {
      id: 'msg-1-3',
      text: 'Thanks for the project update! Everything looks on track.',
      sender: 'John Doe',
      senderId: 'user-2',
      timestamp: '2024-11-26T10:35:00Z',
      type: 'text',
      status: 'read',
      reactions: [
        { id: 'reaction-1', emoji: '👍', userId: 'user-1', userName: 'You', createdAt: '2024-11-26T10:35:30Z' },
        { id: 'reaction-2', emoji: '🎉', userId: 'user-1', userName: 'You', createdAt: '2024-11-26T10:35:31Z' }
      ],
      metadata: {
        readAt: '2024-11-26T10:35:15Z',
        readBy: ['user-1']
      }
    },
    {
      id: 'msg-1-4',
      text: 'Here are the latest designs',
      sender: 'John Doe',
      senderId: 'user-2',
      timestamp: '2024-11-26T10:36:00Z',
      type: 'image',
      status: 'read',
      attachments: [
        {
          id: 'att-1-1',
          name: 'design-mockup.png',
          url: '/uploads/design-mockup.png',
          type: 'image',
          size: 245000,
          mimeType: 'image/png',
          thumbnailUrl: '/uploads/thumbs/design-mockup.png',
          width: 1920,
          height: 1080
        }
      ],
      metadata: {
        readAt: '2024-11-26T10:36:20Z',
        readBy: ['user-1']
      }
    },
    {
      id: 'msg-1-5',
      text: 'Love the color scheme! Can we make the CTA buttons more prominent?',
      sender: 'You',
      senderId: 'user-1',
      timestamp: '2024-11-26T10:38:00Z',
      type: 'text',
      status: 'read',
      replyTo: 'msg-1-4',
      metadata: {
        readAt: '2024-11-26T10:38:15Z',
        readBy: ['user-2']
      }
    },
    {
      id: 'msg-1-6',
      text: 'Absolutely! I\'ll update that and send a new version.',
      sender: 'John Doe',
      senderId: 'user-2',
      timestamp: '2024-11-26T10:40:00Z',
      type: 'text',
      status: 'read',
      metadata: {
        readAt: '2024-11-26T10:40:10Z',
        readBy: ['user-1']
      }
    },
    {
      id: 'msg-1-7',
      text: 'Updated design with prominent CTA buttons',
      sender: 'John Doe',
      senderId: 'user-2',
      timestamp: '2024-11-26T10:45:00Z',
      type: 'image',
      status: 'delivered',
      attachments: [
        {
          id: 'att-1-2',
          name: 'design-mockup-v2.png',
          url: '/uploads/design-mockup-v2.png',
          type: 'image',
          size: 268000,
          mimeType: 'image/png',
          thumbnailUrl: '/uploads/thumbs/design-mockup-v2.png',
          width: 1920,
          height: 1080
        }
      ]
    },
    {
      id: 'msg-1-8',
      text: 'Perfect! This is exactly what I was looking for.',
      sender: 'You',
      senderId: 'user-1',
      timestamp: '2024-11-26T10:47:00Z',
      type: 'text',
      status: 'sent',
      reactions: [
        { id: 'reaction-3', emoji: '✅', userId: 'user-2', userName: 'John Doe', createdAt: '2024-11-26T10:47:30Z' }
      ]
    }
  ],

  'chat-2': [
    {
      id: 'msg-2-1',
      text: 'Hey! Hope you\'re having a great day.',
      sender: 'Sarah Johnson',
      senderId: 'user-3',
      timestamp: '2024-11-26T08:00:00Z',
      type: 'text',
      status: 'read',
      metadata: {
        readAt: '2024-11-26T08:05:00Z',
        readBy: ['user-1']
      }
    },
    {
      id: 'msg-2-2',
      text: 'Thanks Sarah! You too. What\'s up?',
      sender: 'You',
      senderId: 'user-1',
      timestamp: '2024-11-26T08:30:00Z',
      type: 'text',
      status: 'read',
      metadata: {
        readAt: '2024-11-26T08:31:00Z',
        readBy: ['user-3']
      }
    },
    {
      id: 'msg-2-3',
      text: 'Can we schedule a call? I want to discuss the Q4 strategy.',
      sender: 'Sarah Johnson',
      senderId: 'user-3',
      timestamp: '2024-11-26T09:15:00Z',
      type: 'text',
      status: 'read',
      metadata: {
        readAt: '2024-11-26T09:20:00Z',
        readBy: ['user-1']
      }
    },
    {
      id: 'msg-2-4',
      text: 'Sure! How about tomorrow at 2pm?',
      sender: 'You',
      senderId: 'user-1',
      timestamp: '2024-11-26T09:25:00Z',
      type: 'text',
      status: 'sent'
    }
  ],

  'chat-3': [
    {
      id: 'msg-3-1',
      text: 'Check out this new animation library!',
      sender: 'Mike Wilson',
      senderId: 'user-4',
      timestamp: '2024-11-26T09:00:00Z',
      type: 'text',
      status: 'read',
      metadata: {
        links: ['https://example.com/animation-lib']
      }
    },
    {
      id: 'msg-3-2',
      text: 'Looks interesting! Have you tried implementing it?',
      sender: 'You',
      senderId: 'user-1',
      timestamp: '2024-11-26T09:15:00Z',
      type: 'text',
      status: 'read'
    },
    {
      id: 'msg-3-3',
      text: 'Yes! Here\'s a quick demo I made.',
      sender: 'Mike Wilson',
      senderId: 'user-4',
      timestamp: '2024-11-26T09:30:00Z',
      type: 'video',
      status: 'read',
      attachments: [
        {
          id: 'att-3-1',
          name: 'animation-demo.mp4',
          url: '/uploads/animation-demo.mp4',
          type: 'video',
          size: 5240000,
          mimeType: 'video/mp4',
          duration: 45,
          thumbnailUrl: '/uploads/thumbs/animation-demo.jpg'
        }
      ]
    },
    {
      id: 'msg-3-4',
      text: 'The design looks great!',
      sender: 'Mike Wilson',
      senderId: 'user-4',
      timestamp: '2024-11-26T10:00:00Z',
      type: 'text',
      status: 'read',
      reactions: [
        { id: 'reaction-4', emoji: '🎉', userId: 'user-1', userName: 'You', createdAt: '2024-11-26T10:01:00Z' }
      ]
    }
  ],

  'chat-4': [
    {
      id: 'msg-4-1',
      text: 'Good morning team! Quick standup in 15 minutes.',
      sender: 'You',
      senderId: 'user-1',
      timestamp: '2024-11-26T08:45:00Z',
      type: 'text',
      status: 'read',
      mentions: ['@everyone'],
      isPinned: true,
      metadata: {
        readBy: ['user-5', 'user-6', 'user-7', 'user-8']
      }
    },
    {
      id: 'msg-4-2',
      text: 'On my way!',
      sender: 'Emily Chen',
      senderId: 'user-5',
      timestamp: '2024-11-26T08:46:00Z',
      type: 'text',
      status: 'read',
      replyTo: 'msg-4-1'
    },
    {
      id: 'msg-4-3',
      text: 'Running a bit late, will join in 5',
      sender: 'David Lee',
      senderId: 'user-6',
      timestamp: '2024-11-26T08:47:00Z',
      type: 'text',
      status: 'read',
      replyTo: 'msg-4-1'
    },
    {
      id: 'msg-4-4',
      text: 'Meeting at 3pm today',
      sender: 'Emily Chen',
      senderId: 'user-5',
      timestamp: '2024-11-26T09:30:00Z',
      type: 'text',
      status: 'delivered',
      mentions: ['@everyone']
    },
    {
      id: 'msg-4-5',
      text: 'Here\'s the agenda for today\'s meeting:',
      sender: 'Emily Chen',
      senderId: 'user-5',
      timestamp: '2024-11-26T09:31:00Z',
      type: 'file',
      status: 'delivered',
      attachments: [
        {
          id: 'att-4-1',
          name: 'meeting-agenda.pdf',
          url: '/uploads/meeting-agenda.pdf',
          type: 'document',
          size: 125000,
          mimeType: 'application/pdf'
        }
      ]
    },
    {
      id: 'msg-4-6',
      text: 'Thanks @Emily! Looking forward to it.',
      sender: 'Lisa Martinez',
      senderId: 'user-7',
      timestamp: '2024-11-26T09:32:00Z',
      type: 'text',
      status: 'read',
      mentions: ['@Emily Chen'],
      replyTo: 'msg-4-5'
    },
    {
      id: 'msg-4-7',
      text: 'Sprint retrospective notes attached',
      sender: 'Robert Brown',
      senderId: 'user-8',
      timestamp: '2024-11-26T09:45:00Z',
      type: 'file',
      status: 'read',
      attachments: [
        {
          id: 'att-4-2',
          name: 'sprint-retrospective.docx',
          url: '/uploads/sprint-retrospective.docx',
          type: 'document',
          size: 84000,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      ]
    }
  ],

  'chat-5': [
    {
      id: 'msg-5-1',
      text: 'New design concepts ready for review',
      sender: 'Alex Thompson',
      senderId: 'user-9',
      timestamp: '2024-11-26T08:00:00Z',
      type: 'text',
      status: 'read',
      isPinned: true
    },
    {
      id: 'msg-5-2',
      text: 'New mockups uploaded',
      sender: 'Alex Thompson',
      senderId: 'user-9',
      timestamp: '2024-11-26T08:45:00Z',
      type: 'image',
      status: 'read',
      attachments: [
        {
          id: 'att-5-1',
          name: 'homepage-redesign.png',
          url: '/uploads/homepage-redesign.png',
          type: 'image',
          size: 2458000,
          mimeType: 'image/png',
          width: 1920,
          height: 1080
        },
        {
          id: 'att-5-2',
          name: 'mobile-view.png',
          url: '/uploads/mobile-view.png',
          type: 'image',
          size: 1245000,
          mimeType: 'image/png',
          width: 750,
          height: 1334
        }
      ]
    },
    {
      id: 'msg-5-3',
      text: 'These look fantastic! Love the mobile optimizations.',
      sender: 'You',
      senderId: 'user-1',
      timestamp: '2024-11-26T08:50:00Z',
      type: 'text',
      status: 'read',
      reactions: [
        { id: 'reaction-5', emoji: '🚀', userId: 'user-9', userName: 'Alex Thompson', createdAt: '2024-11-26T08:51:00Z' }
      ]
    }
  ],

  // Additional messages for other chats (shortened for brevity)
  ...Array.from({ length: 45 }, (_, i) => {
    const chatId = `chat-${i + 6}`
    return {
      [chatId]: Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, j) => ({
        id: `msg-${i + 6}-${j + 1}`,
        text: `Message ${j + 1} in chat ${i + 6}`,
        sender: j % 2 === 0 ? 'You' : `User ${i + 6}`,
        senderId: j % 2 === 0 ? 'user-1' : `user-${i + 6}`,
        timestamp: `2024-11-${26 - (j % 26)}T${String((i + j) % 24).padStart(2, '0')}:${String((j * 15) % 60).padStart(2, '0')}:00Z`,
        type: 'text' as Message['type'],
        status: (['read', 'delivered', 'sent'] as const)[j % 3],
        ...(j % 5 === 0 && {
          reactions: [
            {
              id: `reaction-${i}-${j}`,
              emoji: ['👍', '❤️', '😊', '🎉', '✅'][j % 5],
              userId: 'user-1',
              userName: 'You',
              createdAt: `2024-11-${26 - (j % 26)}T${String((i + j) % 24).padStart(2, '0')}:${String((j * 15 + 1) % 60).padStart(2, '0')}:00Z`
            }
          ]
        })
      }))
    }
  }).reduce((acc, obj) => ({ ...acc, ...obj }), {})
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
