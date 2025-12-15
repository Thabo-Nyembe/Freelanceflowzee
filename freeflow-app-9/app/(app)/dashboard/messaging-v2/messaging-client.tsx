'use client'

import { useState } from 'react'
import { useConversations, useDirectMessages, useUnreadConversations, type Conversation, type DirectMessage } from '@/lib/hooks/use-messaging'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed, RankingList, ProgressCard } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import {
  MessageSquare,
  Send,
  Inbox,
  Archive,
  Star,
  Search,
  Paperclip,
  MoreVertical,
  CheckCheck,
  Clock,
  Users,
  TrendingUp,
  Mail,
  Reply
} from 'lucide-react'

interface MessagingClientProps {
  initialConversations: Conversation[]
  initialMessages: DirectMessage[]
}

export default function MessagingClient({ initialConversations, initialMessages }: MessagingClientProps) {
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'archived' | 'starred'>('inbox')
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversations[0]?.id || null)
  const [messageInput, setMessageInput] = useState('')

  const { conversations, loading: conversationsLoading } = useConversations({
    status: selectedFolder === 'archived' ? 'archived' : 'active',
    starred: selectedFolder === 'starred' ? true : undefined
  })
  const { messages, loading: messagesLoading } = useDirectMessages({
    conversationId: selectedConversation || undefined
  })
  const { totalUnread } = useUnreadConversations()

  const displayConversations = conversations.length > 0 ? conversations : initialConversations
  const displayMessages = messages.length > 0 ? messages : initialMessages

  const totalMessages = displayMessages.length
  const activeThreads = displayConversations.filter(c => c.status === 'active').length

  const stats = [
    { label: 'Total Messages', value: totalMessages.toLocaleString(), change: 23.4, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Unread', value: totalUnread.toString(), change: -12.3, icon: <Mail className="w-5 h-5" /> },
    { label: 'Avg Response', value: '12m', change: -18.7, icon: <Clock className="w-5 h-5" /> },
    { label: 'Active Threads', value: activeThreads.toString(), change: 15.2, icon: <Users className="w-5 h-5" /> }
  ]

  const topContacts = displayConversations
    .slice(0, 5)
    .map((conv, index) => ({
      rank: index + 1,
      name: conv.conversation_name || conv.participant_emails?.[0] || 'Unknown',
      avatar: conv.avatar_url || (conv.conversation_name?.substring(0, 2).toUpperCase() || 'UN'),
      value: conv.unread_count?.toString() || '0',
      change: 10 + Math.random() * 20
    }))

  const recentActivity = [
    { icon: <Send className="w-4 h-4" />, title: 'Sent message', description: 'To conversation', time: '2m ago', status: 'info' as const },
    { icon: <Mail className="w-4 h-4" />, title: 'New message', description: 'From contact', time: '15m ago', status: 'success' as const },
    { icon: <Star className="w-4 h-4" />, title: 'Starred conversation', description: 'Important thread', time: '1h ago', status: 'warning' as const },
    { icon: <Archive className="w-4 h-4" />, title: 'Archived threads', description: 'Cleanup complete', time: '3h ago', status: 'info' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'archived': return 'bg-yellow-500'
      case 'muted': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const selectedConv = displayConversations.find(c => c.id === selectedConversation)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/30 to-teal-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <MessageSquare className="w-10 h-10 text-blue-600" />
              Messaging
            </h1>
            <p className="text-muted-foreground">Manage conversations and team communication</p>
          </div>
          <GradientButton from="blue" to="cyan" onClick={() => console.log('New message')}>
            <Send className="w-5 h-5 mr-2" />
            New Message
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Inbox />} title="Inbox" description="View messages" onClick={() => setSelectedFolder('inbox')} />
          <BentoQuickAction icon={<Send />} title="Sent" description="Sent items" onClick={() => setSelectedFolder('sent')} />
          <BentoQuickAction icon={<Star />} title="Starred" description="Important" onClick={() => setSelectedFolder('starred')} />
          <BentoQuickAction icon={<Archive />} title="Archive" description="Archived" onClick={() => setSelectedFolder('archived')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedFolder === 'inbox' ? 'primary' : 'ghost'} onClick={() => setSelectedFolder('inbox')}>
            <Inbox className="w-4 h-4 mr-2" />
            Inbox
          </PillButton>
          <PillButton variant={selectedFolder === 'sent' ? 'primary' : 'ghost'} onClick={() => setSelectedFolder('sent')}>
            <Send className="w-4 h-4 mr-2" />
            Sent
          </PillButton>
          <PillButton variant={selectedFolder === 'starred' ? 'primary' : 'ghost'} onClick={() => setSelectedFolder('starred')}>
            <Star className="w-4 h-4 mr-2" />
            Starred
          </PillButton>
          <PillButton variant={selectedFolder === 'archived' ? 'primary' : 'ghost'} onClick={() => setSelectedFolder('archived')}>
            <Archive className="w-4 h-4 mr-2" />
            Archived
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <BentoCard className="p-4">
                <h3 className="text-lg font-semibold mb-4">Conversations</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {displayConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-3 rounded-lg border transition-colors text-left ${
                        selectedConversation === conv.id
                          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200'
                          : 'bg-background border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${conv.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center text-white font-semibold text-sm`}>
                            {conv.conversation_name?.substring(0, 2).toUpperCase() || 'UN'}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(conv.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold truncate">{conv.conversation_name || 'Conversation'}</h4>
                              {conv.is_starred && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                            </div>
                            {conv.unread_count > 0 && (
                              <div className="flex-shrink-0 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                                {conv.unread_count}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">{conv.last_message_preview || 'No messages yet'}</p>
                          <p className="text-xs text-muted-foreground">{conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'Never'}</p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {displayConversations.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-muted-foreground">No conversations</p>
                    </div>
                  )}
                </div>
              </BentoCard>

              <div className="md:col-span-2">
                <BentoCard className="p-6">
                  {selectedConv ? (
                    <>
                      <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${selectedConv.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center text-white font-semibold`}>
                            {selectedConv.conversation_name?.substring(0, 2).toUpperCase() || 'UN'}
                          </div>
                          <div>
                            <h3 className="font-semibold">{selectedConv.conversation_name || 'Conversation'}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedConv.status)}`} />
                              {selectedConv.status}
                            </p>
                          </div>
                        </div>
                        <ModernButton variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </ModernButton>
                      </div>

                      <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                        {displayMessages.filter(m => m.conversation_id === selectedConversation).map((message) => {
                          const isOwn = message.sender_id === message.user_id

                          return (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${isOwn ? 'from-violet-500 to-purple-500' : 'from-blue-500 to-cyan-500'} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                                {message.sender_name?.substring(0, 2).toUpperCase() || 'UN'}
                              </div>
                              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                <div className={`p-3 rounded-lg ${
                                  isOwn
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                    : 'bg-muted'
                                }`}>
                                  <p className="text-sm">{message.content}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1 px-1">
                                  <p className="text-xs text-muted-foreground">{new Date(message.sent_at).toLocaleTimeString()}</p>
                                  {isOwn && message.status === 'read' && (
                                    <CheckCheck className="w-3 h-3 text-blue-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {displayMessages.filter(m => m.conversation_id === selectedConversation).length === 0 && (
                          <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-muted-foreground">No messages yet</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <ModernButton variant="ghost" size="sm">
                            <Paperclip className="w-4 h-4" />
                          </ModernButton>
                          <input
                            type="text"
                            placeholder="Type your message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <ModernButton variant="primary" onClick={() => console.log('Send', messageInput)}>
                            <Send className="w-4 h-4" />
                          </ModernButton>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Conversation Selected</h3>
                      <p className="text-muted-foreground">Select a conversation to view messages</p>
                    </div>
                  )}
                </BentoCard>
              </div>
            </div>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Message Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Sent Today</p>
                  </div>
                  <p className="text-2xl font-bold">{displayMessages.filter(m => new Date(m.sent_at).toDateString() === new Date().toDateString()).length}</p>
                  <p className="text-xs text-green-600 mt-1">Messages sent</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Inbox className="w-4 h-4 text-cyan-600" />
                    <p className="text-sm font-medium">Received</p>
                  </div>
                  <p className="text-2xl font-bold">{totalMessages}</p>
                  <p className="text-xs text-green-600 mt-1">Total messages</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Reply Rate</p>
                  </div>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-xs text-green-600 mt-1">Response rate</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Avg Response</p>
                  </div>
                  <p className="text-2xl font-bold">12m</p>
                  <p className="text-xs text-green-600 mt-1">Average time</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="💬 Most Active" items={topContacts} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Messaging Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Messages" value={totalMessages.toLocaleString()} change={23.4} />
                <MiniKPI label="Unread" value={totalUnread.toString()} change={-12.3} />
                <MiniKPI label="Avg Response Time" value="12m" change={-18.7} />
                <MiniKPI label="Active Conversations" value={activeThreads.toString()} change={15.2} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Response Goal"
              value={94}
              target={95}
              label="Response rate"
              color="from-blue-500 to-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
