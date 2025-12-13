'use client'

import { useState } from 'react'
import {
  Headphones,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  User,
  Mail,
  MessageSquare,
  Phone,
  Video,
  Star,
  BarChart3,
  Calendar,
  Filter,
  Users,
  Zap,
  Award,
  ThumbsUp,
  Timer,
  Target,
  Send,
  AlertCircle
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type AgentStatus = 'online' | 'busy' | 'away' | 'offline'
type ConversationType = 'chat' | 'email' | 'phone' | 'video'
type ConversationStatus = 'active' | 'waiting' | 'closed'

interface SupportAgent {
  id: string
  name: string
  email: string
  status: AgentStatus
  activeConversations: number
  totalConversations: number
  avgResponseTime: number
  satisfactionScore: number
  resolvedToday: number
  availability: string
}

interface Conversation {
  id: string
  customer: string
  email: string
  type: ConversationType
  status: ConversationStatus
  subject: string
  agent: string
  startedAt: string
  lastMessage: string
  waitTime: number
  messages: number
  priority: 'low' | 'medium' | 'high'
}

export default function CustomerSupportPage() {
  const [viewMode, setViewMode] = useState<'all' | AgentStatus>('all')
  const [conversationFilter, setConversationFilter] = useState<'all' | ConversationType>('all')

  const agents: SupportAgent[] = [
    {
      id: 'AGT-2847',
      name: 'Sarah Johnson',
      email: 'sarah.j@support.com',
      status: 'online',
      activeConversations: 5,
      totalConversations: 847,
      avgResponseTime: 45,
      satisfactionScore: 4.8,
      resolvedToday: 23,
      availability: '9:00 AM - 5:00 PM EST'
    },
    {
      id: 'AGT-2848',
      name: 'Mike Chen',
      email: 'mike.c@support.com',
      status: 'busy',
      activeConversations: 8,
      totalConversations: 1234,
      avgResponseTime: 52,
      satisfactionScore: 4.7,
      resolvedToday: 18,
      availability: '10:00 AM - 6:00 PM EST'
    },
    {
      id: 'AGT-2849',
      name: 'Emily Davis',
      email: 'emily.d@support.com',
      status: 'online',
      activeConversations: 3,
      totalConversations: 567,
      avgResponseTime: 38,
      satisfactionScore: 4.9,
      resolvedToday: 15,
      availability: '8:00 AM - 4:00 PM EST'
    },
    {
      id: 'AGT-2850',
      name: 'David Wilson',
      email: 'david.w@support.com',
      status: 'away',
      activeConversations: 0,
      totalConversations: 923,
      avgResponseTime: 48,
      satisfactionScore: 4.6,
      resolvedToday: 12,
      availability: '11:00 AM - 7:00 PM EST'
    }
  ]

  const conversations: Conversation[] = [
    {
      id: 'CONV-2847',
      customer: 'John Doe',
      email: 'john.doe@example.com',
      type: 'chat',
      status: 'active',
      subject: 'Help with account setup',
      agent: 'Sarah Johnson',
      startedAt: '2024-01-15 14:30',
      lastMessage: '2 minutes ago',
      waitTime: 0,
      messages: 8,
      priority: 'medium'
    },
    {
      id: 'CONV-2848',
      customer: 'Jane Smith',
      email: 'jane.smith@example.com',
      type: 'email',
      status: 'waiting',
      subject: 'Billing inquiry',
      agent: 'Mike Chen',
      startedAt: '2024-01-15 13:45',
      lastMessage: '15 minutes ago',
      waitTime: 15,
      messages: 4,
      priority: 'high'
    },
    {
      id: 'CONV-2849',
      customer: 'Robert Lee',
      email: 'robert.lee@example.com',
      type: 'phone',
      status: 'active',
      subject: 'Technical support needed',
      agent: 'Emily Davis',
      startedAt: '2024-01-15 14:00',
      lastMessage: 'Ongoing',
      waitTime: 0,
      messages: 1,
      priority: 'high'
    }
  ]

  const filteredAgents = agents.filter(agent => {
    if (viewMode !== 'all' && agent.status !== viewMode) return false
    return true
  })

  const totalAgents = agents.length
  const onlineAgents = agents.filter(a => a.status === 'online').length
  const totalActive = agents.reduce((sum, a) => sum + a.activeConversations, 0)
  const avgSatisfaction = agents.reduce((sum, a) => sum + a.satisfactionScore, 0) / agents.length

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50'
      case 'busy': return 'text-orange-600 bg-orange-50'
      case 'away': return 'text-yellow-600 bg-yellow-50'
      case 'offline': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getConversationTypeIcon = (type: ConversationType) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-900 via-green-800 to-lime-900 bg-clip-text text-transparent mb-2">
            Customer Support
          </h1>
          <p className="text-slate-600">Monitor support team performance and customer interactions</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Agents',
              value: totalAgents.toString(),
              icon: Users,
              trend: { value: 8, isPositive: true },
              color: 'emerald'
            },
            {
              label: 'Online Now',
              value: onlineAgents.toString(),
              icon: Activity,
              trend: { value: 2, isPositive: true },
              color: 'green'
            },
            {
              label: 'Active Chats',
              value: totalActive.toString(),
              icon: MessageSquare,
              trend: { value: 15, isPositive: true },
              color: 'lime'
            },
            {
              label: 'Avg Satisfaction',
              value: avgSatisfaction.toFixed(1),
              icon: Star,
              trend: { value: 3.2, isPositive: true },
              color: 'yellow'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'Live Chat',
              description: 'Start chat',
              icon: MessageSquare,
              gradient: 'from-emerald-500 to-green-600',
              onClick: () => console.log('Live chat')
            },
            {
              title: 'Team Status',
              description: 'View availability',
              icon: Users,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Team')
            },
            {
              title: 'Analytics',
              description: 'View metrics',
              icon: BarChart3,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Performance',
              description: 'Agent stats',
              icon: Award,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Performance')
            },
            {
              title: 'Queue',
              description: 'Waiting customers',
              icon: Timer,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Queue')
            },
            {
              title: 'Satisfaction',
              description: 'CSAT scores',
              icon: ThumbsUp,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('CSAT')
            },
            {
              title: 'Settings',
              description: 'Configure',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Reports',
              description: 'Export data',
              icon: BarChart3,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Reports')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Agents"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Online"
              isActive={viewMode === 'online'}
              onClick={() => setViewMode('online')}
            />
            <PillButton
              label="Busy"
              isActive={viewMode === 'busy'}
              onClick={() => setViewMode('busy')}
            />
            <PillButton
              label="Away"
              isActive={viewMode === 'away'}
              onClick={() => setViewMode('away')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Agents & Conversations */}
          <div className="lg:col-span-2 space-y-6">

            {/* Support Agents */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Support Agents</h2>
              <div className="space-y-4">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <User className="w-5 h-5 text-emerald-600" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{agent.name}</h3>
                          <p className="text-sm text-slate-600">{agent.email}</p>
                          <p className="text-xs text-slate-500 mt-1">Agent ID: {agent.id}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Active</p>
                        <p className="text-lg font-semibold text-slate-900">{agent.activeConversations}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Total</p>
                        <p className="text-lg font-semibold text-slate-900">{agent.totalConversations}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Resolved Today</p>
                        <p className="text-lg font-semibold text-green-600">{agent.resolvedToday}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Response Time</p>
                        <p className="text-lg font-semibold text-slate-900">{agent.avgResponseTime}s</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">Customer Satisfaction</span>
                        <span className="text-xs font-medium text-slate-900">{agent.satisfactionScore}/5.0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(agent.satisfactionScore) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-700 transition-all">
                        View Performance
                      </button>
                      <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Conversations */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Conversations</h2>
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getConversationTypeIcon(conversation.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{conversation.subject}</h4>
                          <p className="text-sm text-slate-600">{conversation.customer}</p>
                          <p className="text-xs text-slate-500 mt-1">{conversation.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        conversation.status === 'active' ? 'text-green-600 bg-green-50' :
                        conversation.status === 'waiting' ? 'text-yellow-600 bg-yellow-50' :
                        'text-gray-600 bg-gray-50'
                      }`}>
                        {conversation.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Agent</p>
                        <p className="text-sm font-medium text-slate-900">{conversation.agent}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Messages</p>
                        <p className="text-sm font-medium text-slate-900">{conversation.messages}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Last Message</p>
                        <p className="text-sm text-slate-700">{conversation.lastMessage}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-700 transition-all">
                        Join Conversation
                      </button>
                      <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                        Transfer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Online Agents */}
            <MiniKPI
              label="Agents Online"
              value={onlineAgents.toString()}
              icon={Activity}
              trend={{ value: 2, isPositive: true }}
              className="bg-gradient-to-br from-emerald-500 to-green-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Events"
              activities={[
                {
                  id: '1',
                  title: 'Chat started',
                  description: 'Account setup help',
                  timestamp: '2 minutes ago',
                  type: 'info'
                },
                {
                  id: '2',
                  title: 'Ticket resolved',
                  description: '5-star rating received',
                  timestamp: '15 minutes ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Agent status changed',
                  description: 'Mike Chen now busy',
                  timestamp: '30 minutes ago',
                  type: 'info'
                },
                {
                  id: '4',
                  title: 'Phone call completed',
                  description: 'Technical support',
                  timestamp: '1 hour ago',
                  type: 'success'
                }
              ]}
            />

            {/* Top Performers */}
            <RankingList
              title="Top Performers"
              items={[
                { label: 'Emily Davis', value: '4.9', rank: 1 },
                { label: 'Sarah Johnson', value: '4.8', rank: 2 },
                { label: 'Mike Chen', value: '4.7', rank: 3 },
                { label: 'David Wilson', value: '4.6', rank: 4 }
              ]}
            />

            {/* Team Performance */}
            <ProgressCard
              title="Team Performance"
              progress={92}
              subtitle="Overall CSAT score"
              color="emerald"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
