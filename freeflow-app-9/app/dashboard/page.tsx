'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { OptimizedAvatar } from '@/components/ui/optimized-image' // Temporarily disabled
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data for dashboard
const mockProjects = [
  {
    id: 1,
    title: "Premium Brand Identity Package",
    status: "active",
    progress: 75,
    collaborators: ["alice", "john", "bob"]
  },
  {
    id: 2,
    title: "E-commerce Website Design",
    status: "pending",
    progress: 30,
    collaborators: ["jane", "mike"]
  }
]

const mockTeamMembers = [
  { name: "Alice", avatar: "alice", role: "Designer", status: "online" },
  { name: "John", avatar: "john", role: "Developer", status: "away" },
  { name: "Bob", avatar: "bob", role: "Manager", status: "online" },
  { name: "Jane", avatar: "jane", role: "Designer", status: "offline" },
  { name: "Mike", avatar: "mike", role: "Developer", status: "online" }
]

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState("projects")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="dashboard-container">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="dashboard-title">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <Button data-testid="new-project-button" className="bg-blue-600 hover:bg-blue-700">
          New Project
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="stat-active-projects">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-600">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-total-revenue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-team-members">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-blue-600">2 online now</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-completed-tasks">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">134</div>
            <p className="text-xs text-green-600">+8 today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4" data-testid="dashboard-tabs">
          <TabsTrigger value="projects" data-testid="projects-tab">Projects</TabsTrigger>
          <TabsTrigger value="team" data-testid="team-tab">Team</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="analytics-tab">Analytics</TabsTrigger>
          <TabsTrigger value="settings" data-testid="settings-tab">Settings</TabsTrigger>
        </TabsList>

        {/* Projects Hub */}
        <TabsContent value="projects" className="space-y-4" data-testid="projects-hub">
          <Card>
            <CardHeader>
              <CardTitle>Projects Hub</CardTitle>
              <CardDescription>Manage your active projects and collaborations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    data-testid={`project-${project.id}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{project.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={project.status === 'active' ? 'default' : 'secondary'}
                          data-testid={`project-status-${project.id}`}
                        >
                          {project.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{project.progress}% complete</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.collaborators.map((collaborator, index) => (
                          <Avatar key={index} className="w-8 h-8 border-2 border-white">
                            <AvatarImage 
                              src={`/avatars/${collaborator}.jpg`} 
                              alt={collaborator}
                            />
                            <AvatarFallback>{collaborator.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" data-testid={`view-project-${project.id}`}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Hub */}
        <TabsContent value="team" className="space-y-4" data-testid="team-hub">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team and collaboration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`team-member-${member.avatar}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage 
                          src={`/avatars/${member.avatar}.jpg`} 
                          alt={member.name}
                        />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          member.status === 'online' ? 'bg-green-500' :
                          member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        data-testid={`member-status-${member.avatar}`}
                      />
                      <span className="text-sm text-gray-500 capitalize">{member.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Hub */}
        <TabsContent value="analytics" className="space-y-4" data-testid="analytics-hub">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Track your project performance and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">Analytics dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Hub */}
        <TabsContent value="settings" className="space-y-4" data-testid="settings-hub">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">Settings panel coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
