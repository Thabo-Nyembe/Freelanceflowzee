"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  RankingList,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
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

/**
 * Messaging V2 - Professional Messaging Center
 * Manages conversations, messages, and team communication
 */
export default function MessagingV2() {
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'archived' | 'starred'>('inbox')
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1')

  const stats = [
    { label: 'Total Messages', value: '8,473', change: 23.4, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Unread', value: '24', change: -12.3, icon: <Mail className="w-5 h-5" /> },
    { label: 'Avg Response', value: '12m', change: -18.7, icon: <Clock className="w-5 h-5" /> },
    { label: 'Active Threads', value: '89', change: 15.2, icon: <Users className="w-5 h-5" /> }
  ]

  const conversations = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'Thanks for the update on the project timeline...',
      timestamp: '2m ago',
      unread: 3,
      starred: true,
      status: 'online',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'MC',
      lastMessage: 'Can we schedule a meeting to discuss the new features?',
      timestamp: '15m ago',
      unread: 1,
      starred: false,
      status: 'online',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      avatar: 'ER',
      lastMessage: 'I\'ve reviewed the design mockups and they look great!',
      timestamp: '1h ago',
      unread: 0,
      starred: true,
      status: 'away',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      name: 'David Park',
      avatar: 'DP',
      lastMessage: 'The API integration is complete and ready for testing',
      timestamp: '3h ago',
      unread: 0,
      starred: false,
      status: 'offline',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      avatar: 'LA',
      lastMessage: 'Could you send me the latest report?',
      timestamp: '5h ago',
      unread: 2,
      starred: false,
      status: 'online',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: '6',
      name: 'James Wilson',
      avatar: 'JW',
      lastMessage: 'Meeting confirmed for tomorrow at 2 PM',
      timestamp: '1d ago',
      unread: 0,
      starred: false,
      status: 'away',
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const messages = [
    {
      id: '1',
      sender: 'Sarah Johnson',
      avatar: 'SJ',
      content: 'Hey! I wanted to follow up on the project timeline we discussed last week.',
      timestamp: '10:23 AM',
      isOwn: false,
      read: true,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      sender: 'You',
      avatar: 'ME',
      content: 'Hi Sarah! Yes, we\'re still on track. The first milestone will be completed by end of week.',
      timestamp: '10:25 AM',
      isOwn: true,
      read: true,
      color: 'from-violet-500 to-purple-500'
    },
    {
      id: '3',
      sender: 'Sarah Johnson',
      avatar: 'SJ',
      content: 'That\'s great to hear! Can you send over the progress report when you get a chance?',
      timestamp: '10:27 AM',
      isOwn: false,
      read: true,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '4',
      sender: 'You',
      avatar: 'ME',
      content: 'Sure thing! I\'ll send it over within the hour.',
      timestamp: '10:28 AM',
      isOwn: true,
      read: true,
      color: 'from-violet-500 to-purple-500'
    },
    {
      id: '5',
      sender: 'Sarah Johnson',
      avatar: 'SJ',
      content: 'Thanks for the update on the project timeline. Looking forward to the report!',
      timestamp: '2m ago',
      isOwn: false,
      read: false,
      color: 'from-blue-500 to-cyan-500'
    }
  ]

  const topContacts = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'SJ', value: '247', change: 23.4 },
    { rank: 2, name: 'Michael Chen', avatar: 'MC', value: '189', change: 18.7 },
    { rank: 3, name: 'Emily Rodriguez', avatar: 'ER', value: '156', change: 12.3 },
    { rank: 4, name: 'David Park', avatar: 'DP', value: '124', change: 8.9 },
    { rank: 5, name: 'Lisa Anderson', avatar: 'LA', value: '98', change: 5.2 }
  ]

  const recentActivity = [
    { icon: <Send className="w-4 h-4" />, title: 'Sent message to Sarah', time: '2m ago', type: 'info' as const },
    { icon: <Mail className="w-4 h-4" />, title: 'New message from Michael', time: '15m ago', type: 'success' as const },
    { icon: <Star className="w-4 h-4" />, title: 'Starred conversation', time: '1h ago', type: 'warning' as const },
    { icon: <Archive className="w-4 h-4" />, title: 'Archived old threads', time: '3h ago', type: 'info' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

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
                  {conversations.map((conv) => (
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
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${conv.color} flex items-center justify-center text-white font-semibold text-sm`}>
                            {conv.avatar}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(conv.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold truncate">{conv.name}</h4>
                              {conv.starred && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                            </div>
                            {conv.unread > 0 && (
                              <div className="flex-shrink-0 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                                {conv.unread}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">{conv.lastMessage}</p>
                          <p className="text-xs text-muted-foreground">{conv.timestamp}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </BentoCard>

              <div className="md:col-span-2">
                <BentoCard className="p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        SJ
                      </div>
                      <div>
                        <h3 className="font-semibold">Sarah Johnson</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Online
                        </p>
                      </div>
                    </div>
                    <ModernButton variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </ModernButton>
                  </div>

                  <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${message.color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                          {message.avatar}
                        </div>
                        <div className={`max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'}`}>
                          <div className={`p-3 rounded-lg ${
                            message.isOwn
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 px-1">
                            <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                            {message.isOwn && message.read && (
                              <CheckCheck className="w-3 h-3 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <ModernButton variant="ghost" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </ModernButton>
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ModernButton variant="primary">
                        <Send className="w-4 h-4" />
                      </ModernButton>
                    </div>
                  </div>
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
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-xs text-green-600 mt-1">+12.3% from yesterday</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Inbox className="w-4 h-4 text-cyan-600" />
                    <p className="text-sm font-medium">Received</p>
                  </div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-green-600 mt-1">+8.7% from yesterday</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Reply Rate</p>
                  </div>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-xs text-green-600 mt-1">+5.2% this week</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Avg Response</p>
                  </div>
                  <p className="text-2xl font-bold">12m</p>
                  <p className="text-xs text-green-600 mt-1">-18.7% faster</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="💬 Most Active" items={topContacts} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Messaging Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Messages" value="8,473" change={23.4} />
                <MiniKPI label="Unread" value="24" change={-12.3} />
                <MiniKPI label="Avg Response Time" value="12m" change={-18.7} />
                <MiniKPI label="Active Conversations" value="89" change={15.2} />
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

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Messages Today</span>
                  </div>
                  <span className="text-sm font-semibold">136</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm">Active Contacts</span>
                  </div>
                  <span className="text-sm font-semibold">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Response Rate</span>
                  </div>
                  <span className="text-sm font-semibold">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Avg Response</span>
                  </div>
                  <span className="text-sm font-semibold">12min</span>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
