'use client'

import { useState } from 'react'
import { Users, Plus, Mail, Phone, MoreHorizontal, Shield, Crown, User, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SharedTeamCalendar } from '@/components/shared-team-calendar'

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [teamMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@freeflowzee.com',
      role: 'Owner',
      avatar: null,
      status: 'online',
      projects: 8,
      lastActive: 'Active now'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@freeflowzee.com',
      role: 'Designer',
      avatar: null,
      status: 'online',
      projects: 5,
      lastActive: 'Active now'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily@freeflowzee.com',
      role: 'Developer',
      avatar: null,
      status: 'away',
      projects: 3,
      lastActive: '2 hours ago'
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david@freeflowzee.com',
      role: 'Manager',
      avatar: null,
      status: 'offline',
      projects: 7,
      lastActive: '1 day ago'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      email: 'lisa@freeflowzee.com',
      role: 'Designer',
      avatar: null,
      status: 'online',
      projects: 4,
      lastActive: 'Active now'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner': return <Crown className="w-4 h-4" />
      case 'Manager': return <Shield className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case 'Owner': return 'default'
      case 'Manager': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Team</h1>
          <p className="text-gray-600">Manage your team members and collaboration</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl border-0 shadow-lg p-1">
          <TabsTrigger 
            value="overview" 
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Team Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Shared Calendar</span>
          </TabsTrigger>
          <TabsTrigger 
            value="permissions" 
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Shield className="w-4 h-4" />
            <span>Permissions</span>
          </TabsTrigger>
        </TabsList>

        {/* Team Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Online Now</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.filter(m => m.status === 'online').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Managers</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.filter(m => m.role === 'Manager' || m.role === 'Owner').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">P</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.reduce((sum, m) => sum + m.projects, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members List */}
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all bg-white/40">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center space-x-1">
                            {getRoleIcon(member.role)}
                            <span>{member.role}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">{member.projects} active projects</span>
                          <span className="text-xs text-gray-500">{member.lastActive}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shared Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <SharedTeamCalendar />
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6 mt-6">
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Manage what each role can do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <span>Owner</span>
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full access to all features</li>
                    <li>• Manage team members</li>
                    <li>• Billing and payments</li>
                    <li>• Delete projects</li>
                    <li>• Calendar administration</li>
                    <li>• Schedule team events</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Manager</span>
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Create and edit projects</li>
                    <li>• Manage team permissions</li>
                    <li>• View all analytics</li>
                    <li>• Export data</li>
                    <li>• Schedule meetings</li>
                    <li>• View team calendar</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span>Member</span>
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Edit assigned projects</li>
                    <li>• Upload files</li>
                    <li>• View own analytics</li>
                    <li>• Comment and collaborate</li>
                    <li>• View team availability</li>
                    <li>• Join scheduled meetings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 