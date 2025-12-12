"use client"

import { useState } from 'react'
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

/**
 * Collaboration V2 - Groundbreaking Team Collaboration
 * Showcases team collaboration features with modern components
 */
export default function CollaborationV2() {
  const [selectedView, setSelectedView] = useState<'workspace' | 'projects' | 'meetings'>('workspace')

  const stats = [
    { label: 'Active Workspaces', value: '12', change: 15.2, icon: <Users className="w-5 h-5" /> },
    { label: 'Team Members', value: '47', change: 8.3, icon: <Users className="w-5 h-5" /> },
    { label: 'Shared Files', value: '342', change: 25.3, icon: <FileText className="w-5 h-5" /> },
    { label: 'Meetings Today', value: '8', change: 12.5, icon: <Video className="w-5 h-5" /> }
  ]

  const workspaces = [
    {
      id: '1',
      name: 'Product Development',
      members: 12,
      projects: 8,
      lastActivity: '5 minutes ago',
      unreadMessages: 24,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      members: 8,
      projects: 5,
      lastActivity: '1 hour ago',
      unreadMessages: 12,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'Client Projects',
      members: 15,
      projects: 12,
      lastActivity: '3 hours ago',
      unreadMessages: 6,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const upcomingMeetings = [
    {
      id: '1',
      title: 'Sprint Planning',
      time: '10:00 AM',
      duration: '1 hour',
      attendees: 8,
      type: 'Video Call'
    },
    {
      id: '2',
      title: 'Client Review',
      time: '2:00 PM',
      duration: '30 min',
      attendees: 5,
      type: 'Video Call'
    },
    {
      id: '3',
      title: 'Team Standup',
      time: '4:30 PM',
      duration: '15 min',
      attendees: 12,
      type: 'Quick Call'
    }
  ]

  const recentActivity = [
    { icon: <FileText className="w-5 h-5" />, title: 'Document shared', description: 'Product Requirements.pdf in Product Development', time: '5 minutes ago', status: 'success' as const },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'New comment', description: 'Sarah replied to your message', time: '1 hour ago', status: 'info' as const },
    { icon: <Video className="w-5 h-5" />, title: 'Meeting scheduled', description: 'Sprint Planning at 10:00 AM', time: '3 hours ago', status: 'info' as const },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Task completed', description: 'Design mockups approved', time: '5 hours ago', status: 'success' as const }
  ]

  const topContributors = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ', value: '847', change: 25.3 },
    { rank: 2, name: 'Michael Chen', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MC', value: '724', change: 18.7 },
    { rank: 3, name: 'Emily Rodriguez', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ER', value: '612', change: 12.5 },
    { rank: 4, name: 'David Kim', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DK', value: '534', change: 8.3 },
    { rank: 5, name: 'Lisa Wang', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LW', value: '487', change: 15.2 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/30 to-teal-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-blue-600" />
              Collaboration Hub
            </h1>
            <p className="text-muted-foreground">Work together seamlessly with your team</p>
          </div>
          <GradientButton from="blue" to="cyan" onClick={() => console.log('New workspace')}>
            <Plus className="w-5 h-5 mr-2" />
            New Workspace
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<MessageSquare />} title="Messages" description="Chat" onClick={() => console.log('Messages')} />
          <BentoQuickAction icon={<FileText />} title="Shared Files" description="Documents" onClick={() => console.log('Files')} />
          <BentoQuickAction icon={<Video />} title="Meetings" description="Video calls" onClick={() => console.log('Meetings')} />
          <BentoQuickAction icon={<Calendar />} title="Calendar" description="Schedule" onClick={() => console.log('Calendar')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedView === 'workspace' ? 'primary' : 'ghost'} onClick={() => setSelectedView('workspace')}>
            <Users className="w-4 h-4 mr-2" />
            Workspaces
          </PillButton>
          <PillButton variant={selectedView === 'projects' ? 'primary' : 'ghost'} onClick={() => setSelectedView('projects')}>
            <FileText className="w-4 h-4 mr-2" />
            Projects
          </PillButton>
          <PillButton variant={selectedView === 'meetings' ? 'primary' : 'ghost'} onClick={() => setSelectedView('meetings')}>
            <Video className="w-4 h-4 mr-2" />
            Meetings
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Active Workspaces</h3>
              <div className="space-y-4">
                {workspaces.map((workspace) => (
                  <div key={workspace.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${workspace.color} flex items-center justify-center`}>
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{workspace.name}</h4>
                          {workspace.unreadMessages > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                              {workspace.unreadMessages} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {workspace.members} members
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {workspace.projects} projects
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {workspace.lastActivity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Open', workspace.id)}>
                            Open
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Messages', workspace.id)}>
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Messages
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Files', workspace.id)}>
                            <FileText className="w-3 h-3 mr-1" />
                            Files
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Upcoming Meetings</h3>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">{meeting.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meeting.time}
                          </span>
                          <span>{meeting.duration}</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {meeting.attendees}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Join', meeting.id)}>
                          <Video className="w-3 h-3 mr-1" />
                          Join
                        </ModernButton>
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', meeting.id)}>
                          <Edit className="w-3 h-3" />
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Contributors" items={topContributors} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Collaboration Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Active Users" value="47" change={8.3} />
                <MiniKPI label="Messages Today" value="247" change={25.3} />
                <MiniKPI label="Files Shared" value="89" change={15.2} />
                <MiniKPI label="Avg Response Time" value="12min" change={-18.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
