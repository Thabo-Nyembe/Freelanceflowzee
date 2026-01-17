/**
 * Messages/Chat React Hooks
 *
 * TanStack Query hooks for real-time messaging functionality
 *
 * Caching Strategy:
 * - Conversations: 0 staleTime (real-time data)
 * - Messages: 0 staleTime (real-time data)
 * - Messaging stats: 30 sec staleTime
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  messagesClient,
  Conversation,
  Message,
  CreateMessageData,
  CreateConversationData,
  ConversationFilters,
  MessagingStats
} from './messages-client'
import { STALE_TIMES, realtimeQueryOptions, invalidationPatterns } from '@/lib/query-client'

/**
 * Get all conversations with pagination and filters
 */
export function useConversations(
  page: number = 1,
  pageSize: number = 20,
  filters?: ConversationFilters,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['conversations', page, pageSize, filters],
    queryFn: async () => {
      const response = await messagesClient.getConversations(page, pageSize, filters)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch conversations')
      }
      return response.data
    },
    staleTime: STALE_TIMES.REALTIME,
    ...realtimeQueryOptions,
    ...options
  })
}

/**
 * Get messages for a specific conversation
 */
export function useMessages(
  conversationId: string,
  page: number = 1,
  pageSize: number = 50,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['messages', conversationId, page, pageSize],
    queryFn: async () => {
      const response = await messagesClient.getMessages(conversationId, page, pageSize)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch messages')
      }
      return response.data
    },
    enabled: !!conversationId,
    staleTime: STALE_TIMES.REALTIME,
    ...realtimeQueryOptions,
    ...options
  })
}

/**
 * Send a new message
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageData: CreateMessageData) => {
      const response = await messagesClient.sendMessage(messageData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to send message')
      }
      return response.data
    },
    onMutate: async (newMessage) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', newMessage.conversation_id] })

      const previousMessages = queryClient.getQueryData(['messages', newMessage.conversation_id])

      queryClient.setQueryData(['messages', newMessage.conversation_id], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: [
            {
              id: `temp-${Date.now()}`,
              ...newMessage,
              sender_name: 'You',
              sender_avatar: null,
              is_read: true,
              is_edited: false,
              is_deleted: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            ...old.data
          ]
        }
      })

      return { previousMessages }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['messages', _variables.conversation_id],
          context.previousMessages
        )
      }
      toast.error(error.message)
    },
    onSuccess: (message) => {
      // Use centralized invalidation pattern
      invalidationPatterns.messages(queryClient)
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversation_id] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })
}

/**
 * Mark message as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await messagesClient.markAsRead(messageId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark message as read')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messaging-stats'] })
    }
  })
}

/**
 * Mark all messages in conversation as read
 */
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await messagesClient.markConversationAsRead(conversationId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark conversation as read')
      }
      return response.data
    },
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messaging-stats'] })
      toast.success('All messages marked as read')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Delete a message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await messagesClient.deleteMessage(messageId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete message')
      }
      return messageId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Message deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Create a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationData: CreateConversationData) => {
      const response = await messagesClient.createConversation(conversationData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create conversation')
      }
      return response.data
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.setQueryData(['conversation', conversation.id], conversation)
      toast.success('Conversation created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Get messaging statistics
 */
export function useMessagingStats(
  options?: Omit<UseQueryOptions<MessagingStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['messaging-stats'],
    queryFn: async () => {
      const response = await messagesClient.getMessagingStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch messaging stats')
      }
      return response.data
    },
    staleTime: STALE_TIMES.SEMI_FRESH, // 1 minute for stats
    ...options
  })
}

/**
 * Add reaction to message
 */
export function useAddReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const response = await messagesClient.addReaction(messageId, emoji)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to add reaction')
      }
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      toast.success(`Reacted with ${variables.emoji}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}
