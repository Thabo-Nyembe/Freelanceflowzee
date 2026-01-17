'use client'

import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AVATAR_BLUR_PLACEHOLDER } from '@/components/ui/avatar'
import {
  Users,
  Calendar,
  FileText,
  MessageSquare,
  BarChart2,
  Settings,
} from 'lucide-react'
import Team from './team'
import { SharedTeamCalendar } from './shared-team-calendar'

interface TeamActivity {
  id: string
  type: 'document' | 'chat' | 'task' | 'calendar'
  title: string
  description: string
  timestamp: string
  users: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

interface TeamStats {
  totalMembers: number
  activeProjects: number
  completedTasks: number
  upcomingMeetings: number
  documentsShared: number
  averageResponse: string
}

interface TeamHubProps {
  activities: TeamActivity[]
  stats: TeamStats
  teamMembers: unknown[] // Using the TeamMember type from Team component
  onActivityClick?: (activityId: string) => void
  onMemberAction?: (memberId: string, action: string) => void
}

export default function TeamHub({
  activities, stats, teamMembers, onActivityClick, onMemberAction, }: TeamHubProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Total Members</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalMembers}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">Active Projects</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.activeProjects}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium">Upcoming Meetings</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.upcomingMeetings}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium">Avg. Response Time</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.averageResponse}</p>
        </Card>
      </div>

      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="activity">
            <BarChart2 className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <Team
            members={teamMembers}
            onInviteMember={() => onMemberAction?.('new', 'invite')}
            onContactMember={(id, method) => onMemberAction?.(id, method)}
            onToggleFavorite={(id) => onMemberAction?.(id, 'favorite')}
            onToggleAdmin={(id) => onMemberAction?.(id, 'admin')}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="p-6">
            <SharedTeamCalendar />
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => onActivityClick?.(activity.id)}
                >
                  {activity.type === 'document' && (
                    <FileText className="h-5 w-5 text-blue-500" />
                  )}
                  {activity.type === 'chat' && (
                    <MessageSquare className="h-5 w-5 text-green-500" />
                  )}
                  {activity.type === 'calendar' && (
                    <Calendar className="h-5 w-5 text-purple-500" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-2">
                        {activity.users.map((user) => (
                          <div
                            key={user.id}
                            className="h-6 w-6 rounded-full border-2 border-background overflow-hidden"
                          >
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                width={24}
                                height={24}
                                className="h-full w-full object-cover"
                                placeholder="blur"
                                blurDataURL={AVATAR_BLUR_PLACEHOLDER}
                              />
                            ) : (
                              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                {user.name[0]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Team Settings</h3>
            <p className="text-muted-foreground">
              Team settings and preferences will be displayed here.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
