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
  MessageCircle,
  Hash,
  Users,
  Send,
  Smile,
  Paperclip,
  Image,
  MoreVertical,
  Bell,
  Pin,
  Search,
  Plus,
  Lock,
  Globe,
  Video,
  Phone,
  Settings
} from 'lucide-react'

/**
 * Chat V2 - Real-time Team Chat
 * Live chat channels, direct messages, and team collaboration
 */
export default function ChatV2() {
  const [selectedChannel, setSelectedChannel] = useState<'general' | 'design' | 'dev' | 'marketing'>('general')
  const [selectedView, setSelectedView] = useState<'channels' | 'direct' | 'threads'>('channels')

  const stats = [
    { label: 'Active Users', value: '247', change: 12.3, icon: <Users className="w-5 h-5" /> },
    { label: 'Messages Today', value: '3,847', change: 28.7, icon: <MessageCircle className="w-5 h-5" /> },
    { label: 'Active Channels', value: '24', change: 8.3, icon: <Hash className="w-5 h-5" /> },
    { label: 'Avg Response', value: '45s', change: -15.2, icon: <Send className="w-5 h-5" /> }
  ]

  const channels = [
    {
      id: 'general',
      name: 'general',
      type: 'public',
      members: 247,
      unread: 12,
      lastActive: '2m ago',
      description: 'Company-wide announcements and general discussion',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'design',
      name: 'design',
      type: 'public',
      members: 47,
      unread: 3,
      lastActive: '5m ago',
      description: 'Design team collaboration and reviews',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'dev',
      name: 'development',
      type: 'private',
      members: 89,
      unread: 0,
      lastActive: '15m ago',
      description: 'Development team technical discussions',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'marketing',
      name: 'marketing',
      type: 'public',
      members: 34,
      unread: 5,
      lastActive: '30m ago',
      description: 'Marketing campaigns and strategy',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const chatMessages = [
    {
      id: '1',
      user: 'Sarah Johnson',
      avatar: 'SJ',
      message: 'Good morning team! Ready for today\'s sprint planning?',
      timestamp: '9:23 AM',
      reactions: [{ emoji: '👍', count: 5 }, { emoji: '🎉', count: 2 }],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      user: 'Michael Chen',
      avatar: 'MC',
      message: 'Absolutely! I\'ve prepared the backlog items for review.',
      timestamp: '9:25 AM',
      reactions: [{ emoji: '👍', count: 3 }],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      user: 'Emily Rodriguez',
      avatar: 'ER',
      message: 'I\'ll share the design mockups in a few minutes',
      timestamp: '9:27 AM',
      reactions: [{ emoji: '🎨', count: 4 }, { emoji: '👀', count: 2 }],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      user: 'David Park',
      avatar: 'DP',
      message: 'The API endpoints are ready for testing now',
      timestamp: '9:30 AM',
      reactions: [{ emoji: '🚀', count: 6 }],
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      user: 'Lisa Anderson',
      avatar: 'LA',
      message: 'Great work everyone! Let\'s keep the momentum going.',
      timestamp: '9:32 AM',
      reactions: [{ emoji: '💪', count: 8 }, { emoji: '🔥', count: 3 }],
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const teamMembers = [
    { id: '1', name: 'Sarah Johnson', avatar: 'SJ', status: 'online', role: 'Product Manager', color: 'from-blue-500 to-cyan-500' },
    { id: '2', name: 'Michael Chen', avatar: 'MC', status: 'online', role: 'Developer', color: 'from-purple-500 to-pink-500' },
    { id: '3', name: 'Emily Rodriguez', avatar: 'ER', status: 'away', role: 'Designer', color: 'from-green-500 to-emerald-500' },
    { id: '4', name: 'David Park', avatar: 'DP', status: 'online', role: 'Developer', color: 'from-orange-500 to-red-500' },
    { id: '5', name: 'Lisa Anderson', avatar: 'LA', status: 'offline', role: 'Marketing', color: 'from-pink-500 to-rose-500' },
    { id: '6', name: 'James Wilson', avatar: 'JW', status: 'away', role: 'Designer', color: 'from-indigo-500 to-purple-500' }
  ]

  const topPosters = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'SJ', value: '847', change: 23.4 },
    { rank: 2, name: 'Michael Chen', avatar: 'MC', value: '692', change: 18.7 },
    { rank: 3, name: 'Emily Rodriguez', avatar: 'ER', value: '534', change: 12.3 },
    { rank: 4, name: 'David Park', avatar: 'DP', value: '421', change: 8.9 },
    { rank: 5, name: 'Lisa Anderson', avatar: 'LA', value: '347', change: 5.2 }
  ]

  const recentActivity = [
    { icon: <MessageCircle className="w-4 h-4" />, title: 'New message in #general', time: '1m ago', type: 'info' as const },
    { icon: <Users className="w-4 h-4" />, title: 'Sarah joined #design', time: '5m ago', type: 'success' as const },
    { icon: <Pin className="w-4 h-4" />, title: 'Message pinned', time: '15m ago', type: 'warning' as const },
    { icon: <Hash className="w-4 h-4" />, title: '#marketing created', time: '1h ago', type: 'info' as const }
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <MessageCircle className="w-10 h-10 text-cyan-600" />
              Team Chat
            </h1>
            <p className="text-muted-foreground">Real-time collaboration and communication</p>
          </div>
          <div className="flex items-center gap-2">
            <ModernButton variant="outline" onClick={() => console.log('Settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </ModernButton>
            <GradientButton from="cyan" to="teal" onClick={() => console.log('New channel')}>
              <Plus className="w-5 h-5 mr-2" />
              New Channel
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Hash />} title="Channels" description="Browse all" onClick={() => setSelectedView('channels')} />
          <BentoQuickAction icon={<MessageCircle />} title="Direct" description="Messages" onClick={() => setSelectedView('direct')} />
          <BentoQuickAction icon={<Users />} title="Team" description="Members" onClick={() => console.log('Team')} />
          <BentoQuickAction icon={<Search />} title="Search" description="Find messages" onClick={() => console.log('Search')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedView === 'channels' ? 'primary' : 'ghost'} onClick={() => setSelectedView('channels')}>
            <Hash className="w-4 h-4 mr-2" />
            Channels
          </PillButton>
          <PillButton variant={selectedView === 'direct' ? 'primary' : 'ghost'} onClick={() => setSelectedView('direct')}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Direct Messages
          </PillButton>
          <PillButton variant={selectedView === 'threads' ? 'primary' : 'ghost'} onClick={() => setSelectedView('threads')}>
            Threads
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <BentoCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Channels</h3>
                  <ModernButton variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </ModernButton>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id as any)}
                      className={`w-full p-3 rounded-lg border transition-colors text-left ${
                        selectedChannel === channel.id
                          ? 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200'
                          : 'bg-background border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {channel.type === 'private' ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Hash className="w-4 h-4 text-muted-foreground" />
                        )}
                        <h4 className="font-semibold">{channel.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{channel.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{channel.members}</span>
                        </div>
                        {channel.unread > 0 && (
                          <div className="px-2 py-0.5 rounded-full bg-cyan-600 text-white text-xs font-semibold">
                            {channel.unread}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </BentoCard>

              <div className="md:col-span-3">
                <BentoCard className="p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <Hash className="w-6 h-6 text-cyan-600" />
                      <div>
                        <h3 className="font-semibold">general</h3>
                        <p className="text-xs text-muted-foreground">247 members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ModernButton variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </ModernButton>
                      <ModernButton variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </ModernButton>
                      <ModernButton variant="ghost" size="sm">
                        <Bell className="w-4 h-4" />
                      </ModernButton>
                      <ModernButton variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </ModernButton>
                    </div>
                  </div>

                  <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-3 group">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${msg.color} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                          {msg.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold">{msg.user}</span>
                            <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                          </div>
                          <p className="text-sm mb-2">{msg.message}</p>
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex items-center gap-2">
                              {msg.reactions.map((reaction, i) => (
                                <button
                                  key={i}
                                  className="px-2 py-1 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-xs flex items-center gap-1"
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="font-semibold">{reaction.count}</span>
                                </button>
                              ))}
                              <button className="px-2 py-1 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-xs opacity-0 group-hover:opacity-100">
                                <Smile className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2">
                      <ModernButton variant="ghost" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </ModernButton>
                      <ModernButton variant="ghost" size="sm">
                        <Image className="w-4 h-4" />
                      </ModernButton>
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <ModernButton variant="ghost" size="sm">
                        <Smile className="w-4 h-4" />
                      </ModernButton>
                      <ModernButton variant="primary">
                        <Send className="w-4 h-4" />
                      </ModernButton>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-semibold">Michael Chen</span> is typing...
                    </p>
                  </div>
                </BentoCard>
              </div>
            </div>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Team Members</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${member.color} flex items-center justify-center text-white font-semibold`}>
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{member.name}</h4>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ModernButton variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="💬 Most Active" items={topPosters} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Chat Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Active Users" value="247" change={12.3} />
                <MiniKPI label="Messages Today" value="3,847" change={28.7} />
                <MiniKPI label="Active Channels" value="24" change={8.3} />
                <MiniKPI label="Avg Response Time" value="45s" change={-15.2} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Engagement Goal"
              value={89}
              target={90}
              label="Daily active users"
              color="from-cyan-500 to-teal-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Channel Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">general</span>
                    </div>
                    <span className="text-xs font-semibold">247 members</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-600" />
                      <span className="text-sm">development</span>
                    </div>
                    <span className="text-xs font-semibold">89 members</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '36%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">design</span>
                    </div>
                    <span className="text-xs font-semibold">47 members</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '19%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">marketing</span>
                    </div>
                    <span className="text-xs font-semibold">34 members</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: '14%' }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
