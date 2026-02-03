'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Laptop, Users, FolderKanban, MessageSquare, Video, Calendar,
  Plus, Search, Settings, Share2, Star, Clock, FileText,
  CheckCircle, MoreHorizontal, Pin, Archive, Bell, Link2
} from 'lucide-react'

const workspaces = [
  {
    id: 1,
    name: 'Product Development',
    description: 'Main product team workspace',
    members: 12,
    projects: 8,
    messages: 234,
    status: 'active',
    lastActivity: '2 mins ago',
    starred: true,
    color: 'blue'
  },
  {
    id: 2,
    name: 'Marketing Campaign Q1',
    description: 'Q1 2024 marketing initiatives',
    members: 8,
    projects: 5,
    messages: 156,
    status: 'active',
    lastActivity: '15 mins ago',
    starred: true,
    color: 'purple'
  },
  {
    id: 3,
    name: 'Client Projects',
    description: 'External client work and deliverables',
    members: 6,
    projects: 12,
    messages: 89,
    status: 'active',
    lastActivity: '1 hour ago',
    starred: false,
    color: 'green'
  },
  {
    id: 4,
    name: 'Design System',
    description: 'UI/UX component library development',
    members: 4,
    projects: 3,
    messages: 67,
    status: 'active',
    lastActivity: '3 hours ago',
    starred: false,
    color: 'orange'
  },
  {
    id: 5,
    name: 'Research & Innovation',
    description: 'Exploratory projects and prototypes',
    members: 5,
    projects: 4,
    messages: 45,
    status: 'archived',
    lastActivity: '2 days ago',
    starred: false,
    color: 'gray'
  },
]

const recentActivity = [
  { id: 1, user: 'Sarah Chen', action: 'commented on', target: 'Design Review', workspace: 'Product Development', time: '2 mins ago' },
  { id: 2, user: 'Mike Johnson', action: 'uploaded', target: 'Campaign Assets', workspace: 'Marketing Campaign Q1', time: '15 mins ago' },
  { id: 3, user: 'Emily Davis', action: 'completed task', target: 'Homepage Redesign', workspace: 'Client Projects', time: '1 hour ago' },
  { id: 4, user: 'Tom Wilson', action: 'created project', target: 'Mobile App v2', workspace: 'Product Development', time: '2 hours ago' },
]

const teamMembers = [
  { id: 1, name: 'Sarah Chen', role: 'Product Manager', status: 'online', avatar: '' },
  { id: 2, name: 'Mike Johnson', role: 'Designer', status: 'online', avatar: '' },
  { id: 3, name: 'Emily Davis', role: 'Developer', status: 'away', avatar: '' },
  { id: 4, name: 'Tom Wilson', role: 'Developer', status: 'offline', avatar: '' },
  { id: 5, name: 'Lisa Park', role: 'Marketing', status: 'online', avatar: '' },
]

export default function WorkspaceClient() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalWorkspaces: workspaces.length,
    activeWorkspaces: workspaces.filter(w => w.status === 'active').length,
    totalMembers: new Set(teamMembers.map(m => m.id)).size,
    totalProjects: workspaces.reduce((sum, w) => sum + w.projects, 0),
  }), [])

  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter(workspace => {
      const matchesSearch = workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workspace.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === 'all' ||
                        (activeTab === 'starred' && workspace.starred) ||
                        (activeTab === 'archived' && workspace.status === 'archived') ||
                        (activeTab === 'active' && workspace.status === 'active')
      return matchesSearch && matchesTab
    })
  }, [searchQuery, activeTab])

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      gray: 'bg-gray-500',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getStatusDot = (status: string) => {
    const colors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-400',
    }
    return colors[status as keyof typeof colors] || colors.offline
  }

  const insights = [
    { icon: Laptop, title: `${stats.activeWorkspaces}`, description: 'Active workspaces' },
    { icon: Users, title: `${stats.totalMembers}`, description: 'Team members' },
    { icon: FolderKanban, title: `${stats.totalProjects}`, description: 'Total projects' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Laptop className="h-8 w-8 text-primary" />
            Workspaces
          </h1>
          <p className="text-muted-foreground mt-1">Collaborate with your team in dedicated spaces</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Workspace
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Workspace Overview"
        insights={insights}
        defaultExpanded={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  className="pl-9 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWorkspaces.map((workspace) => (
                  <Card key={workspace.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg ${getColorClass(workspace.color)} flex items-center justify-center text-white font-bold`}>
                            {workspace.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{workspace.name}</h3>
                              {workspace.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{workspace.description}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {workspace.members}
                          </span>
                          <span className="flex items-center">
                            <FolderKanban className="h-3 w-3 mr-1" />
                            {workspace.projects}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {workspace.messages}
                          </span>
                        </div>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {workspace.lastActivity}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.workspace} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Team Online
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {teamMembers.filter(m => m.status === 'online').length} online
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${getStatusDot(member.status)}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Start Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Document
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
