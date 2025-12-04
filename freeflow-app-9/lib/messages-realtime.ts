/**
 * Messages Real-Time Integration
 *
 * Real-time features for the Messages Hub using Supabase real-time subscriptions.
 * Provides instant message updates, typing indicators, presence, and notifications.
 *
 * FEATURES:
 * - Real-time message updates (INSERT/UPDATE/DELETE)
 * - Typing indicators (who's typing in each chat)
 * - Online presence (who's currently online)
 * - Unread message notifications
 * - Message reactions in real-time
 * - Read receipts in real-time
 *
 * USAGE:
 * ```tsx
 * import { useMessagesRealtime, useTypingIndicators, useOnlinePresence } from '@/lib/messages-realtime'
 *
 * // Real-time messages for a specific chat
 * const { messages, isSubscribed } = useMessagesRealtime(chatId)
 *
 * // Typing indicators
 * const { startTyping, stopTyping, typingUsers } = useTypingIndicators(chatId, userId)
 *
 * // Online presence
 * const { onlineUsers, updateStatus } = useOnlinePresence(userId)
 * ```
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTable, usePresence, useBroadcast, useTypingIndicator } from '@/hooks/use-realtime'
import type { Message, MessageReaction, MessageReadReceipt } from './messages-queries'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('MessagesRealtime')

// ==================== HOOK: REAL-TIME MESSAGES ====================

/**
 * Subscribe to real-time messages for a specific chat
 *
 * Automatically updates when:
 * - New messages are sent
 * - Messages are edited
 * - Messages are deleted
 * - Message status changes (sent → delivered → read)
 *
 * @param chatId - The chat ID to subscribe to
 * @returns { messages, isSubscribed, error }
 */
export function useMessagesRealtime(chatId: string) {
  const { data: newMessages, isSubscribed } = useRealtimeTable<Message>('messages', {
    event: '*', // All events: INSERT, UPDATE, DELETE
    filter: `chat_id=eq.${chatId}`
  })

  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)

  // Handle new messages
  useEffect(() => {
    if (newMessages.length > 0) {
      setMessages(newMessages)
      logger.info('Real-time messages updated', {
        chatId,
        messageCount: newMessages.length
      })
    }
  }, [newMessages, chatId])

  return { messages, isSubscribed, error }
}

// ==================== HOOK: REAL-TIME REACTIONS ====================

/**
 * Subscribe to real-time reactions for messages
 *
 * @param messageIds - Array of message IDs to watch for reactions
 * @returns { reactions, isSubscribed }
 */
export function useMessageReactions(messageIds: string[]) {
  const [reactions, setReactions] = useState<MessageReaction[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (messageIds.length === 0) return

    const supabase = createClient()

    // Create filter for multiple message IDs
    const filter = messageIds.map(id => `message_id=eq.${id}`).join(',')

    const channel = supabase
      .channel(`reactions:${messageIds.join(',')}`)
      .on<MessageReaction>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter
        } as any,
        (payload) => {
          logger.debug('Reaction event received', {
            event: payload.eventType,
            messageId: (payload.new as MessageReaction)?.message_id
          })

          if (payload.eventType === 'INSERT') {
            setReactions((prev) => [...prev, payload.new as MessageReaction])
          } else if (payload.eventType === 'DELETE') {
            setReactions((prev) =>
              prev.filter((r) => r.id !== (payload.old as MessageReaction).id)
            )
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true)
          logger.info('Reactions subscription active', {
            messageCount: messageIds.length
          })
        }
      })

    return () => {
      channel.unsubscribe()
      setIsSubscribed(false)
    }
  }, [messageIds])

  return { reactions, isSubscribed }
}

// ==================== HOOK: TYPING INDICATORS ====================

/**
 * Real-time typing indicators for a chat
 *
 * Shows when other users are typing in the current chat.
 * Automatically stops after 3 seconds of inactivity.
 *
 * @param chatId - The chat ID
 * @param userId - Current user ID
 * @returns { startTyping, stopTyping, typingUsers, isTyping }
 */
export function useTypingIndicators(chatId: string, userId: string) {
  const { typingUsers, startTyping, stopTyping, isTyping } = useTypingIndicator(
    `chat-${chatId}`,
    userId
  )

  // Log typing activity
  useEffect(() => {
    if (typingUsers.length > 0) {
      logger.debug('Users typing', {
        chatId,
        typingCount: typingUsers.length,
        users: typingUsers
      })
    }
  }, [typingUsers, chatId])

  return {
    startTyping,
    stopTyping,
    typingUsers,
    isTyping,
    typingCount: typingUsers.length
  }
}

// ==================== HOOK: ONLINE PRESENCE ====================

/**
 * Track online users across the platform
 *
 * Shows who's currently active and their status.
 *
 * @param userId - Current user ID
 * @param initialStatus - Initial status (online, away, busy, offline)
 * @returns { onlineUsers, updateStatus, count }
 */
export function useOnlinePresence(
  userId: string,
  initialStatus: 'online' | 'away' | 'busy' | 'offline' = 'online'
) {
  const { onlineUsers, track, untrack, count } = usePresence('global-presence', {
    user_id: userId,
    status: initialStatus,
    last_seen: new Date().toISOString()
  })

  const updateStatus = useCallback(
    async (newStatus: 'online' | 'away' | 'busy' | 'offline') => {
      await track({
        user_id: userId,
        status: newStatus,
        last_seen: new Date().toISOString()
      })

      logger.info('User status updated', {
        userId,
        newStatus
      })
    },
    [userId, track]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      untrack()
    }
  }, [untrack])

  return {
    onlineUsers,
    updateStatus,
    count,
    isUserOnline: (checkUserId: string) =>
      onlineUsers.some((u: any) => u.user_id === checkUserId)
  }
}

// ==================== HOOK: READ RECEIPTS ====================

/**
 * Real-time read receipts for messages
 *
 * Shows who has read which messages in real-time.
 *
 * @param messageIds - Array of message IDs to track
 * @returns { readReceipts, isSubscribed }
 */
export function useReadReceipts(messageIds: string[]) {
  const [readReceipts, setReadReceipts] = useState<MessageReadReceipt[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (messageIds.length === 0) return

    const supabase = createClient()

    const channel = supabase
      .channel(`read-receipts:${messageIds.join(',')}`)
      .on<MessageReadReceipt>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_receipts'
        } as any,
        (payload) => {
          const receipt = payload.new as MessageReadReceipt

          // Only add if it's for one of our tracked messages
          if (messageIds.includes(receipt.message_id)) {
            setReadReceipts((prev) => [...prev, receipt])

            logger.debug('Read receipt received', {
              messageId: receipt.message_id,
              userId: receipt.user_id
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true)
          logger.info('Read receipts subscription active', {
            messageCount: messageIds.length
          })
        }
      })

    return () => {
      channel.unsubscribe()
      setIsSubscribed(false)
    }
  }, [messageIds])

  return { readReceipts, isSubscribed }
}

// ==================== HOOK: CHAT NOTIFICATIONS ====================

/**
 * Real-time notifications for new messages in all chats
 *
 * Notifies when new messages arrive in any chat the user is a member of.
 *
 * @param userId - Current user ID
 * @param onNotification - Callback when new message arrives
 * @returns { unreadCount, notifications }
 */
export function useChatNotifications(
  userId: string,
  onNotification?: (message: Message) => void
) {
  const [notifications, setNotifications] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const { send } = useBroadcast<{ message: Message; chatId: string }>(
    `user-${userId}-notifications`,
    (payload) => {
      const { message } = payload.payload

      // Don't notify for own messages
      if (message.sender_id !== userId) {
        setNotifications((prev) => [message, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Call notification callback
        onNotification?.(message)

        logger.info('New message notification', {
          messageId: message.id,
          chatId: message.chat_id,
          senderId: message.sender_id
        })
      }
    }
  )

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
    logger.debug('Notifications cleared', { userId })
  }, [userId])

  const markAsRead = useCallback((messageId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== messageId))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    logger.debug('Notification marked as read', { messageId })
  }, [])

  return {
    notifications,
    unreadCount,
    clearNotifications,
    markAsRead,
    sendNotification: send
  }
}

// ==================== HOOK: COMPREHENSIVE CHAT REALTIME ====================

/**
 * All-in-one hook for complete real-time chat functionality
 *
 * Combines messages, typing indicators, presence, and reactions.
 *
 * @param chatId - The chat ID
 * @param userId - Current user ID
 * @returns Complete real-time chat state and controls
 */
export function useChatRealtime(chatId: string, userId: string) {
  // Messages
  const { messages, isSubscribed: messagesSubscribed, error } = useMessagesRealtime(chatId)

  // Typing
  const {
    startTyping,
    stopTyping,
    typingUsers,
    isTyping,
    typingCount
  } = useTypingIndicators(chatId, userId)

  // Presence
  const { onlineUsers, updateStatus, count: onlineCount, isUserOnline } = useOnlinePresence(userId)

  // Reactions (for all current messages)
  const messageIds = messages.map((m) => m.id)
  const { reactions, isSubscribed: reactionsSubscribed } = useMessageReactions(messageIds)

  // Read receipts
  const { readReceipts, isSubscribed: receiptsSubscribed } = useReadReceipts(messageIds)

  const isFullySubscribed = messagesSubscribed && reactionsSubscribed && receiptsSubscribed

  logger.debug('Chat realtime status', {
    chatId,
    messagesSubscribed,
    reactionsSubscribed,
    receiptsSubscribed,
    messageCount: messages.length,
    typingCount,
    onlineCount
  })

  return {
    // Messages
    messages,
    error,

    // Typing
    startTyping,
    stopTyping,
    typingUsers,
    isTyping,
    typingCount,

    // Presence
    onlineUsers,
    updateStatus,
    onlineCount,
    isUserOnline,

    // Reactions
    reactions,

    // Read receipts
    readReceipts,

    // Overall status
    isFullySubscribed
  }
}

// ==================== UTILITY: AUTO-TYPING DETECTION ====================

/**
 * Hook to automatically detect typing and manage typing indicators
 *
 * Automatically calls startTyping when user types and stopTyping after inactivity.
 *
 * @param chatId - The chat ID
 * @param userId - Current user ID
 * @param debounceMs - How long to wait before stopping typing indicator (default: 3000ms)
 * @returns { handleTyping } - Function to call on input change
 */
export function useAutoTyping(
  chatId: string,
  userId: string,
  debounceMs: number = 3000
) {
  const { startTyping, stopTyping } = useTypingIndicators(chatId, userId)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTyping = useCallback(() => {
    // Start typing indicator
    startTyping()

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout to stop typing
    timeoutRef.current = setTimeout(() => {
      stopTyping()
    }, debounceMs)
  }, [startTyping, stopTyping, debounceMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      stopTyping()
    }
  }, [stopTyping])

  return { handleTyping }
}

// ==================== EXAMPLE USAGE ====================

/**
 * Example: Complete real-time chat
 *
 * ```tsx
 * function ChatComponent({ chatId, userId }) {
 *   const {
 *     messages,
 *     typingUsers,
 *     onlineUsers,
 *     reactions,
 *     readReceipts,
 *     startTyping,
 *     stopTyping,
 *     isFullySubscribed
 *   } = useChatRealtime(chatId, userId)
 *
 *   return (
 *     <div>
 *       {messages.map(msg => (
 *         <Message
 *           key={msg.id}
 *           message={msg}
 *           reactions={reactions.filter(r => r.message_id === msg.id)}
 *           readBy={readReceipts.filter(r => r.message_id === msg.id)}
 *         />
 *       ))}
 *
 *       {typingUsers.length > 0 && (
 *         <TypingIndicator users={typingUsers} />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * Example: Auto-typing indicator
 *
 * ```tsx
 * function MessageInput({ chatId, userId }) {
 *   const { handleTyping } = useAutoTyping(chatId, userId)
 *
 *   return (
 *     <input
 *       onChange={(e) => {
 *         handleTyping() // Automatically manages typing indicator
 *         // ... handle input change
 *       }}
 *     />
 *   )
 * }
 * ```
 */

export default {
  useMessagesRealtime,
  useMessageReactions,
  useTypingIndicators,
  useOnlinePresence,
  useReadReceipts,
  useChatNotifications,
  useChatRealtime,
  useAutoTyping
}
