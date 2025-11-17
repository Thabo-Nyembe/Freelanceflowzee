import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { EventEmitter } from 'events'

// Core Communication Types
export interface CommunicationUser {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  currentActivity?: string
  location?: string
  timezone?: string
  role: 'admin' | 'moderator' | 'member' | 'guest'
  permissions: string[]
}

export interface CommunicationChannel {
  id: string
  name: string
  description?: string
  type: 'direct' | 'group' | 'public' | 'private' | 'announcement' | 'project'
  participants: string[]
  admins: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  settings: {
    allowMessages: boolean
    allowFiles: boolean
    allowCalls: boolean
    allowScreenShare: boolean
    retentionDays?: number
    encryption: boolean
    maxParticipants?: number
  }
  metadata?: Record<string, any>
}

export interface CommunicationMessage {
  id: string
  channelId: string
  authorId: string
  content: string
  type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system' | 'reaction' | 'thread_reply'
  replyTo?: string
  threadId?: string
  mentions: string[]
  attachments: MessageAttachment[]
  reactions: MessageReaction[]
  edited: boolean
  editedAt?: Date
  createdAt: Date
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  metadata?: Record<string, any>
}

export interface MessageAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  thumbnailUrl?: string
  metadata?: Record<string, any>
}

export interface MessageReaction {
  id: string
  emoji: string
  userId: string
  userName: string
  createdAt: Date
}

export interface CommunicationCall {
  id: string
  channelId: string
  type: 'audio' | 'video' | 'screen_share'
  initiatorId: string
  participants: CallParticipant[]
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined'
  startedAt?: Date
  endedAt?: Date
  duration?: number
  recording?: {
    url: string
    duration: number
    size: number
  }
  metadata?: Record<string, any>
}

export interface CallParticipant {
  userId: string
  joinedAt: Date
  leftAt?: Date
  status: 'connected' | 'connecting' | 'disconnected'
  audioEnabled: boolean
  videoEnabled: boolean
  screenSharing: boolean
}

export interface CommunicationNotification {
  id: string
  type: 'message' | 'call' | 'mention' | 'reaction' | 'channel_invite' | 'system'
  title: string
  message: string
  data: any
  userId: string
  channelId?: string
  messageId?: string
  read: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface TypingIndicator {
  userId: string
  userName: string
  channelId: string
  startedAt: Date
}

export interface UserPresence {
  userId: string
  status: CommunicationUser['status']
  activity?: string
  lastSeen: Date
  device?: string
  location?: string
}

// Communication State Interface
export interface CommunicationState {
  // Core State
  currentUser: CommunicationUser | null
  users: Record<string, CommunicationUser>
  channels: Record<string, CommunicationChannel>
  messages: Record<string, CommunicationMessage[]>
  calls: Record<string, CommunicationCall>
  notifications: CommunicationNotification[]

  // Real-time State
  userPresence: Record<string, UserPresence>
  typingIndicators: TypingIndicator[]
  activeCall: CommunicationCall | null

  // UI State
  activeChannelId: string | null
  selectedMessageId: string | null
  sidebarOpen: boolean
  callPanelOpen: boolean
  notificationPanelOpen: boolean
  searchQuery: string
  searchResults: CommunicationMessage[]

  // Settings
  settings: {
    theme: 'light' | 'dark' | 'auto'
    soundEnabled: boolean
    desktopNotifications: boolean
    emailNotifications: boolean
    status: CommunicationUser['status']
    activity: string
    autoAway: boolean
    awayTimeout: number
    messagePreview: boolean
    readReceipts: boolean
    typingIndicators: boolean
    onlineStatus: boolean
  }

  // Connection
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  isLoading: boolean
  error: string | null
}

// Communication Actions Interface
export interface CommunicationActions {
  // User Management
  setCurrentUser: (user: CommunicationUser) => void
  updateUser: (userId: string, updates: Partial<CommunicationUser>) => void
  updateUserStatus: (status: CommunicationUser['status'], activity?: string) => void
  updateUserPresence: (userId: string, presence: Partial<UserPresence>) => void

  // Channel Management
  createChannel: (channel: Omit<CommunicationChannel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CommunicationChannel>
  updateChannel: (channelId: string, updates: Partial<CommunicationChannel>) => Promise<void>
  deleteChannel: (channelId: string) => Promise<void>
  joinChannel: (channelId: string) => Promise<void>
  leaveChannel: (channelId: string) => Promise<void>
  inviteToChannel: (channelId: string, userIds: string[]) => Promise<void>
  removeFromChannel: (channelId: string, userId: string) => Promise<void>

  // Message Management
  sendMessage: (channelId: string, content: string, type?: CommunicationMessage['type'], attachments?: File[]) => Promise<CommunicationMessage>
  editMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  reactToMessage: (messageId: string, emoji: string) => Promise<void>
  replyToMessage: (messageId: string, content: string) => Promise<CommunicationMessage>
  markMessageAsRead: (messageId: string) => void
  markChannelAsRead: (channelId: string) => void

  // Call Management
  initiateCall: (channelId: string, type: CommunicationCall['type']) => Promise<CommunicationCall>
  answerCall: (callId: string) => Promise<void>
  declineCall: (callId: string) => Promise<void>
  endCall: (callId: string) => Promise<void>
  toggleAudio: (callId: string) => void
  toggleVideo: (callId: string) => void
  toggleScreenShare: (callId: string) => void

  // Typing Indicators
  startTyping: (channelId: string) => void
  stopTyping: (channelId: string) => void

  // Search
  searchMessages: (query: string, channelId?: string) => Promise<CommunicationMessage[]>
  clearSearch: () => void

  // Notifications
  addNotification: (notification: Omit<CommunicationNotification, 'id' | 'createdAt'>) => void
  markNotificationAsRead: (notificationId: string) => void
  clearNotifications: () => void

  // UI Actions
  setActiveChannel: (channelId: string | null) => void
  selectMessage: (messageId: string | null) => void
  toggleSidebar: () => void
  toggleCallPanel: () => void
  toggleNotificationPanel: () => void

  // Settings
  updateSettings: (settings: Partial<CommunicationState['settings']>) => void

  // Connection
  connect: () => Promise<void>
  disconnect: () => void
  reconnect: () => Promise<void>
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

// Communication Events
export interface CommunicationEvent {
  type: 'user.status_changed' | 'user.presence_updated' | 'user.typing_start' | 'user.typing_stop' |
        'channel.created' | 'channel.updated' | 'channel.deleted' | 'channel.user_joined' | 'channel.user_left' |
        'message.sent' | 'message.edited' | 'message.deleted' | 'message.reaction_added' | 'message.reaction_removed' |
        'call.initiated' | 'call.answered' | 'call.declined' | 'call.ended' | 'call.participant_joined' | 'call.participant_left' |
        'notification.created' | 'notification.read' |
        'system.connected' | 'system.disconnected' | 'system.error'
  payload: any
  userId?: string
  channelId?: string
  timestamp: Date
}

// Main Communication Store
export const useCommunicationStore = create<CommunicationState & CommunicationActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    currentUser: null,
    users: {},
    channels: {},
    messages: {},
    calls: {},
    notifications: [],
    userPresence: {},
    typingIndicators: [],
    activeCall: null,
    activeChannelId: null,
    selectedMessageId: null,
    sidebarOpen: true,
    callPanelOpen: false,
    notificationPanelOpen: false,
    searchQuery: '',
    searchResults: [],
    settings: {
      theme: 'auto',
      soundEnabled: true,
      desktopNotifications: true,
      emailNotifications: true,
      status: 'online',
      activity: '',
      autoAway: true,
      awayTimeout: 300000, // 5 minutes
      messagePreview: true,
      readReceipts: true,
      typingIndicators: true,
      onlineStatus: true
    },
    connectionStatus: 'disconnected',
    isLoading: false,
    error: null,

    // User Management Actions
    setCurrentUser: (user) => {
      set({ currentUser: user })
      set(state => ({
        users: { ...state.users, [user.id]: user }
      }))
    },

    updateUser: (userId, updates) => {
      set(state => ({
        users: {
          ...state.users,
          [userId]: { ...state.users[userId], ...updates }
        },
        currentUser: state.currentUser?.id === userId
          ? { ...state.currentUser, ...updates }
          : state.currentUser
      }))
    },

    updateUserStatus: (status, activity) => {
      const { currentUser } = get()
      if (currentUser) {
        get().updateUser(currentUser.id, { status, currentActivity: activity })
        get().updateUserPresence(currentUser.id, { status, activity, lastSeen: new Date() })
      }
    },

    updateUserPresence: (userId, presence) => {
      set(state => ({
        userPresence: {
          ...state.userPresence,
          [userId]: { ...state.userPresence[userId], ...presence, userId }
        }
      }))
    },

    // Channel Management Actions
    createChannel: async (channelData) => {
      const channel: CommunicationChannel = {
        ...channelData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      set(state => ({
        channels: { ...state.channels, [channel.id]: channel },
        messages: { ...state.messages, [channel.id]: [] }
      }))

      get().addNotification({
        type: 'system',
        title: 'Channel Created',
        message: `Channel "${channel.name}" has been created`,
        data: { channelId: channel.id },
        userId: get().currentUser?.id || '',
        channelId: channel.id,
        read: false,
        priority: 'low'
      })

      return channel
    },

    updateChannel: async (channelId, updates) => {
      set(state => ({
        channels: {
          ...state.channels,
          [channelId]: {
            ...state.channels[channelId],
            ...updates,
            updatedAt: new Date()
          }
        }
      }))
    },

    deleteChannel: async (channelId) => {
      set(state => {
        const { [channelId]: removedChannel, ...remainingChannels } = state.channels
        const { [channelId]: removedMessages, ...remainingMessages } = state.messages

        return {
          channels: remainingChannels,
          messages: remainingMessages,
          activeChannelId: state.activeChannelId === channelId ? null : state.activeChannelId
        }
      })
    },

    joinChannel: async (channelId) => {
      const { currentUser } = get()
      if (!currentUser) return

      set(state => ({
        channels: {
          ...state.channels,
          [channelId]: {
            ...state.channels[channelId],
            participants: [...state.channels[channelId].participants, currentUser.id]
          }
        }
      }))

      get().addNotification({
        type: 'channel_invite',
        title: 'Joined Channel',
        message: `You joined ${get().channels[channelId]?.name}`,
        data: { channelId },
        userId: currentUser.id,
        channelId,
        read: false,
        priority: 'medium'
      })
    },

    leaveChannel: async (channelId) => {
      const { currentUser } = get()
      if (!currentUser) return

      set(state => ({
        channels: {
          ...state.channels,
          [channelId]: {
            ...state.channels[channelId],
            participants: state.channels[channelId].participants.filter(id => id !== currentUser.id)
          }
        },
        activeChannelId: state.activeChannelId === channelId ? null : state.activeChannelId
      }))
    },

    inviteToChannel: async (channelId, userIds) => {
      set(state => ({
        channels: {
          ...state.channels,
          [channelId]: {
            ...state.channels[channelId],
            participants: [...new Set([...state.channels[channelId].participants, ...userIds])]
          }
        }
      }))

      userIds.forEach(userId => {
        get().addNotification({
          type: 'channel_invite',
          title: 'Channel Invitation',
          message: `You were invited to ${get().channels[channelId]?.name}`,
          data: { channelId, invitedBy: get().currentUser?.id },
          userId,
          channelId,
          read: false,
          priority: 'medium'
        })
      })
    },

    removeFromChannel: async (channelId, userId) => {
      set(state => ({
        channels: {
          ...state.channels,
          [channelId]: {
            ...state.channels[channelId],
            participants: state.channels[channelId].participants.filter(id => id !== userId)
          }
        }
      }))
    },

    // Message Management Actions
    sendMessage: async (channelId, content, type = 'text', attachments = []) => {
      const { currentUser } = get()
      if (!currentUser) throw new Error('No current user')

      const message: CommunicationMessage = {
        id: crypto.randomUUID(),
        channelId,
        authorId: currentUser.id,
        content,
        type,
        mentions: content.match(/@(\w+)/g)?.map(m => m.slice(1)) || [],
        attachments: attachments.map(file => ({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file) // Temporary URL - would be replaced with actual upload
        })),
        reactions: [],
        edited: false,
        createdAt: new Date(),
        status: 'sending'
      }

      // Add message optimistically
      set(state => ({
        messages: {
          ...state.messages,
          [channelId]: [...(state.messages[channelId] || []), message]
        }
      }))

      // Simulate network delay
      setTimeout(() => {
        set(state => ({
          messages: {
            ...state.messages,
            [channelId]: state.messages[channelId].map(m =>
              m.id === message.id ? { ...m, status: 'sent' } : m
            )
          }
        }))

        // Handle mentions
        message.mentions.forEach(mentionedUser => {
          get().addNotification({
            type: 'mention',
            title: 'You were mentioned',
            message: `${currentUser.name} mentioned you in ${get().channels[channelId]?.name}`,
            data: { messageId: message.id, channelId },
            userId: mentionedUser,
            channelId,
            messageId: message.id,
            read: false,
            priority: 'high'
          })
        })
      }, 1000)

      return message
    },

    editMessage: async (messageId, content) => {
      const allMessages = Object.values(get().messages).flat()
      const message = allMessages.find(m => m.id === messageId)
      if (!message) return

      set(state => ({
        messages: {
          ...state.messages,
          [message.channelId]: state.messages[message.channelId].map(m =>
            m.id === messageId
              ? { ...m, content, edited: true, editedAt: new Date() }
              : m
          )
        }
      }))
    },

    deleteMessage: async (messageId) => {
      const allMessages = Object.values(get().messages).flat()
      const message = allMessages.find(m => m.id === messageId)
      if (!message) return

      set(state => ({
        messages: {
          ...state.messages,
          [message.channelId]: state.messages[message.channelId].filter(m => m.id !== messageId)
        }
      }))
    },

    reactToMessage: async (messageId, emoji) => {
      const { currentUser } = get()
      if (!currentUser) return

      const allMessages = Object.values(get().messages).flat()
      const message = allMessages.find(m => m.id === messageId)
      if (!message) return

      const existingReaction = message.reactions.find(r => r.userId === currentUser.id && r.emoji === emoji)

      set(state => ({
        messages: {
          ...state.messages,
          [message.channelId]: state.messages[message.channelId].map(m =>
            m.id === messageId
              ? {
                  ...m,
                  reactions: existingReaction
                    ? m.reactions.filter(r => !(r.userId === currentUser.id && r.emoji === emoji))
                    : [
                        ...m.reactions,
                        {
                          id: crypto.randomUUID(),
                          emoji,
                          userId: currentUser.id,
                          userName: currentUser.name,
                          createdAt: new Date()
                        }
                      ]
                }
              : m
          )
        }
      }))

      if (!existingReaction) {
        get().addNotification({
          type: 'reaction',
          title: 'Message Reaction',
          message: `${currentUser.name} reacted ${emoji} to your message`,
          data: { messageId, emoji },
          userId: message.authorId,
          channelId: message.channelId,
          messageId,
          read: false,
          priority: 'low'
        })
      }
    },

    replyToMessage: async (messageId, content) => {
      const allMessages = Object.values(get().messages).flat()
      const parentMessage = allMessages.find(m => m.id === messageId)
      if (!parentMessage) throw new Error('Parent message not found')

      return get().sendMessage(parentMessage.channelId, content, 'thread_reply')
    },

    markMessageAsRead: (messageId) => {
      const allMessages = Object.values(get().messages).flat()
      const message = allMessages.find(m => m.id === messageId)
      if (!message) return

      set(state => ({
        messages: {
          ...state.messages,
          [message.channelId]: state.messages[message.channelId].map(m =>
            m.id === messageId ? { ...m, status: 'read' } : m
          )
        }
      }))
    },

    markChannelAsRead: (channelId) => {
      set(state => ({
        messages: {
          ...state.messages,
          [channelId]: state.messages[channelId]?.map(m => ({ ...m, status: 'read' })) || []
        }
      }))
    },

    // Call Management Actions
    initiateCall: async (channelId, type) => {
      const { currentUser } = get()
      if (!currentUser) throw new Error('No current user')

      const call: CommunicationCall = {
        id: crypto.randomUUID(),
        channelId,
        type,
        initiatorId: currentUser.id,
        participants: [{
          userId: currentUser.id,
          joinedAt: new Date(),
          status: 'connected',
          audioEnabled: type === 'audio' || type === 'video',
          videoEnabled: type === 'video',
          screenSharing: type === 'screen_share'
        }],
        status: 'ringing',
        startedAt: new Date()
      }

      set(state => ({
        calls: { ...state.calls, [call.id]: call },
        activeCall: call
      }))

      // Notify channel participants
      const channel = get().channels[channelId]
      if (channel) {
        channel.participants.forEach(userId => {
          if (userId !== currentUser.id) {
            get().addNotification({
              type: 'call',
              title: `Incoming ${type} call`,
              message: `${currentUser.name} is calling in ${channel.name}`,
              data: { callId: call.id, channelId, type },
              userId,
              channelId,
              read: false,
              priority: 'urgent'
            })
          }
        })
      }

      return call
    },

    answerCall: async (callId) => {
      const { currentUser } = get()
      if (!currentUser) return

      set(state => ({
        calls: {
          ...state.calls,
          [callId]: {
            ...state.calls[callId],
            status: 'active',
            participants: [
              ...state.calls[callId].participants,
              {
                userId: currentUser.id,
                joinedAt: new Date(),
                status: 'connected',
                audioEnabled: true,
                videoEnabled: state.calls[callId].type === 'video',
                screenSharing: false
              }
            ]
          }
        },
        activeCall: state.calls[callId]
      }))
    },

    declineCall: async (callId) => {
      set(state => ({
        calls: {
          ...state.calls,
          [callId]: {
            ...state.calls[callId],
            status: 'declined',
            endedAt: new Date()
          }
        },
        activeCall: state.activeCall?.id === callId ? null : state.activeCall
      }))
    },

    endCall: async (callId) => {
      set(state => ({
        calls: {
          ...state.calls,
          [callId]: {
            ...state.calls[callId],
            status: 'ended',
            endedAt: new Date(),
            duration: state.calls[callId].startedAt
              ? Date.now() - state.calls[callId].startedAt!.getTime()
              : 0
          }
        },
        activeCall: state.activeCall?.id === callId ? null : state.activeCall
      }))
    },

    toggleAudio: (callId) => {
      const { currentUser } = get()
      if (!currentUser) return

      set(state => ({
        calls: {
          ...state.calls,
          [callId]: {
            ...state.calls[callId],
            participants: state.calls[callId].participants.map(p =>
              p.userId === currentUser.id
                ? { ...p, audioEnabled: !p.audioEnabled }
                : p
            )
          }
        }
      }))
    },

    toggleVideo: (callId) => {
      const { currentUser } = get()
      if (!currentUser) return

      set(state => ({
        calls: {
          ...state.calls,
          [callId]: {
            ...state.calls[callId],
            participants: state.calls[callId].participants.map(p =>
              p.userId === currentUser.id
                ? { ...p, videoEnabled: !p.videoEnabled }
                : p
            )
          }
        }
      }))
    },

    toggleScreenShare: (callId) => {
      const { currentUser } = get()
      if (!currentUser) return

      set(state => ({
        calls: {
          ...state.calls,
          [callId]: {
            ...state.calls[callId],
            participants: state.calls[callId].participants.map(p =>
              p.userId === currentUser.id
                ? { ...p, screenSharing: !p.screenSharing }
                : p
            )
          }
        }
      }))
    },

    // Typing Indicators
    startTyping: (channelId) => {
      const { currentUser } = get()
      if (!currentUser) return

      const existing = get().typingIndicators.find(
        t => t.userId === currentUser.id && t.channelId === channelId
      )

      if (!existing) {
        set(state => ({
          typingIndicators: [
            ...state.typingIndicators,
            {
              userId: currentUser.id,
              userName: currentUser.name,
              channelId,
              startedAt: new Date()
            }
          ]
        }))
      }
    },

    stopTyping: (channelId) => {
      const { currentUser } = get()
      if (!currentUser) return

      set(state => ({
        typingIndicators: state.typingIndicators.filter(
          t => !(t.userId === currentUser.id && t.channelId === channelId)
        )
      }))
    },

    // Search
    searchMessages: async (query, channelId) => {
      const allMessages = channelId
        ? get().messages[channelId] || []
        : Object.values(get().messages).flat()

      const results = allMessages.filter(message =>
        message.content.toLowerCase().includes(query.toLowerCase())
      )

      set({ searchQuery: query, searchResults: results })
      return results
    },

    clearSearch: () => {
      set({ searchQuery: '', searchResults: [] })
    },

    // Notifications
    addNotification: (notificationData) => {
      const notification: CommunicationNotification = {
        ...notificationData,
        id: crypto.randomUUID(),
        createdAt: new Date()
      }

      set(state => ({
        notifications: [notification, ...state.notifications]
      }))

      // Desktop notification
      if (get().settings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    },

    markNotificationAsRead: (notificationId) => {
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      }))
    },

    clearNotifications: () => {
      set({ notifications: [] })
    },

    // UI Actions
    setActiveChannel: (channelId) => {
      set({ activeChannelId: channelId })
      if (channelId) {
        get().markChannelAsRead(channelId)
      }
    },

    selectMessage: (messageId) => {
      set({ selectedMessageId: messageId })
    },

    toggleSidebar: () => {
      set(state => ({ sidebarOpen: !state.sidebarOpen }))
    },

    toggleCallPanel: () => {
      set(state => ({ callPanelOpen: !state.callPanelOpen }))
    },

    toggleNotificationPanel: () => {
      set(state => ({ notificationPanelOpen: !state.notificationPanelOpen }))
    },

    // Settings
    updateSettings: (newSettings) => {
      set(state => ({
        settings: { ...state.settings, ...newSettings }
      }))

      // Update user status if changed
      if (newSettings.status) {
        get().updateUserStatus(newSettings.status, get().settings.activity)
      }
    },

    // Connection
    connect: async () => {
      set({ connectionStatus: 'connecting', isLoading: true })

      try {
        // Simulate connection
        await new Promise(resolve => setTimeout(resolve, 1000))

        set({ connectionStatus: 'connected', isLoading: false, error: null })

        // Start auto-away timer
        if (get().settings.autoAway) {
          setTimeout(() => {
            if (get().currentUser?.status === 'online') {
              get().updateUserStatus('away')
            }
          }, get().settings.awayTimeout)
        }

      } catch (error) {
        set({
          connectionStatus: 'error',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        })
      }
    },

    disconnect: () => {
      set({ connectionStatus: 'disconnected' })

      // End active call if any
      const { activeCall } = get()
      if (activeCall) {
        get().endCall(activeCall.id)
      }
    },

    reconnect: async () => {
      get().disconnect()
      await get().connect()
    },

    setError: (error) => {
      set({ error })
    },

    setLoading: (loading) => {
      set({ isLoading: loading })
    }
  }))
)

// Selector hooks for optimized re-renders
export const useCurrentUser = () => useCommunicationStore(state => state.currentUser)
export const useChannels = () => useCommunicationStore(state => state.channels)
export const useActiveChannel = () => useCommunicationStore(state =>
  state.activeChannelId ? state.channels[state.activeChannelId] : null
)
export const useChannelMessages = (channelId: string) => useCommunicationStore(state =>
  state.messages[channelId] || []
)
export const useUnreadCount = () => useCommunicationStore(state => {
  const unreadMessages = Object.values(state.messages)
    .flat()
    .filter(m => m.status !== 'read' && m.authorId !== state.currentUser?.id)
  return unreadMessages.length
})
export const useTypingUsers = (channelId: string) => useCommunicationStore(state =>
  state.typingIndicators
    .filter(t => t.channelId === channelId && t.userId !== state.currentUser?.id)
    .map(t => t.userName)
)
export const useActiveCall = () => useCommunicationStore(state => state.activeCall)
export const useNotifications = () => useCommunicationStore(state => state.notifications)
export const useConnectionStatus = () => useCommunicationStore(state => state.connectionStatus)

export default useCommunicationStore