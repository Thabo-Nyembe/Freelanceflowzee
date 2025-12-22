'use client'

import { useState } from 'react'
import { useCollaboration, type CollaborationSession, type SessionType, type SessionStatus } from '@/lib/hooks/use-collaboration'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI,
  RankingList
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Users,
  Plus,
  MessageSquare,
  FileText,
  Video,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Share2,
  Edit
} from 'lucide-react'

export default function CollaborationClient({ initialSessions }: { initialSessions: CollaborationSession[] }) {
  const [sessionTypeFilter, setSessionTypeFilter] = useState<SessionType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  const { sessions, loading, error } = useCollaboration({ sessionType: sessionTypeFilter, status: statusFilter })

  const displaySessions = sessions.length > 0 ? sessions : initialSessions

  const stats = [
    {
      label: 'Active Sessions',
      value: displaySessions.filter(s => s.is_active).length.toString(),
      change: 15.2,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Total Participants',
      value: displaySessions.reduce((sum, s) => sum + s.participant_count, 0).toString(),
      change: 8.3,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Messages',
      value: displaySessions.reduce((sum, s) => sum + s.message_count, 0).toString(),
      change: 25.3,
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      label: 'Sessions Today',
      value: displaySessions.filter(s => {
        const today = new Date().toDateString()
        return new Date(s.created_at).toDateString() === today
      }).length.toString(),
      change: 12.5,
      icon: <Calendar className="w-5 h-5" />
    }
  ]

  const formatDate = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const hours = Math.floor(diff / 1000 / 60 / 60)
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return then.toLocaleDateString()
  }

  const recentActivity = displaySessions.slice(0, 4).map((session, idx) => ({
    icon: <MessageSquare className="w-5 h-5" />,
    title: session.is_active ? 'Session active' : 'Session ended',
    description: session.session_name,
    time: formatDate(session.last_activity_at || session.created_at),
    status: session.is_active ? 'info' : 'success' as const
  }))

  const getSessionColor = (type: string) => {
    switch (type) {
      case 'document': return 'from-blue-500 to-cyan-500'
      case 'whiteboard': return 'from-purple-500 to-pink-500'
      case 'code': return 'from-green-500 to-emerald-500'
      case 'design': return 'from-orange-500 to-red-500'
      case 'video': return 'from-indigo-500 to-purple-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-blue-600" />
              Collaboration Hub
            </h1>
            <p className="text-muted-foreground">Work together seamlessly with your team</p>
          </div>
          <GradientButton from="blue" to="cyan" onClick={() => console.log('New session')}>
            <Plus className="w-5 h-5 mr-2" />
            New Session
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<MessageSquare />} title="Messages" description="Chat" onClick={() => console.log('Messages')} />
          <BentoQuickAction icon={<FileText />} title="Documents" description="Collaborate" onClick={() => console.log('Files')} />
          <BentoQuickAction icon={<Video />} title="Video Call" description="Meet now" onClick={() => console.log('Meetings')} />
          <BentoQuickAction icon={<Calendar />} title="Schedule" description="Plan ahead" onClick={() => console.log('Calendar')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={sessionTypeFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSessionTypeFilter('all')}>
            All Types
          </PillButton>
          <PillButton variant={sessionTypeFilter === 'document' ? 'primary' : 'ghost'} onClick={() => setSessionTypeFilter('document')}>
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </PillButton>
          <PillButton variant={sessionTypeFilter === 'video' ? 'primary' : 'ghost'} onClick={() => setSessionTypeFilter('video')}>
            <Video className="w-4 h-4 mr-2" />
            Video
          </PillButton>
          <PillButton variant={sessionTypeFilter === 'meeting' ? 'primary' : 'ghost'} onClick={() => setSessionTypeFilter('meeting')}>
            <Users className="w-4 h-4 mr-2" />
            Meetings
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Active Sessions</h3>
              <div className="space-y-4">
                {displaySessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getSessionColor(session.session_type)} flex items-center justify-center`}>
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{session.session_name}</h4>
                          {session.is_active && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white">
                              Active
                            </span>
                          )}
                          {session.message_count > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                              {session.message_count} messages
                            </span>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mb-3">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.participant_count} participants
                          </span>
                          <span className="capitalize">{session.session_type}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(session.last_activity_at || session.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Join', session.id)}>
                            Join
                          </ModernButton>
                          {session.chat_enabled && (
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Messages', session.id)}>
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Chat
                            </ModernButton>
                          )}
                          {session.video_enabled && (
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Video', session.id)}>
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </ModernButton>
                          )}
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Share', session.id)}>
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {displaySessions.length === 0 && (
                  <div className="py-12 text-center">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Sessions Yet</h3>
                    <p className="text-slate-600 mb-4">Create your first collaboration session</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all">
                      <Plus className="w-4 h-4 inline mr-2" />
                      New Session
                    </button>
                  </div>
                )}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Session Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Chat</span>
                  </div>
                  <p className="text-2xl font-bold">{displaySessions.filter(s => s.chat_enabled).length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Video</span>
                  </div>
                  <p className="text-2xl font-bold">{displaySessions.filter(s => s.video_enabled).length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <p className="text-2xl font-bold">{displaySessions.filter(s => s.is_active).length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <p className="text-2xl font-bold">{displaySessions.length}</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList
              title="🏆 Most Active"
              items={displaySessions
                .sort((a, b) => b.participant_count - a.participant_count)
                .slice(0, 5)
                .map((session, idx) => ({
                  rank: idx + 1,
                  name: session.session_name,
                  value: session.participant_count.toString(),
                  change: session.is_active ? 100 : 0
                }))
              }
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Collaboration Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Active Users" value={displaySessions.reduce((sum, s) => sum + s.active_participants, 0).toString()} change={8.3} />
                <MiniKPI label="Messages Today" value={displaySessions.reduce((sum, s) => sum + s.message_count, 0).toString()} change={25.3} />
                <MiniKPI label="Total Edits" value={displaySessions.reduce((sum, s) => sum + s.total_edits, 0).toString()} change={15.2} />
                <MiniKPI label="Comments" value={displaySessions.reduce((sum, s) => sum + s.total_comments, 0).toString()} change={18.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
