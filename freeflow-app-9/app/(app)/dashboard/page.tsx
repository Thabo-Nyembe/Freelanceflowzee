'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data for dashboard - matching FreelanceFlow design specifications
const mockProjects = [
  {
    id: 1,
    title: "Premium Brand Identity Package",
    client: "TechCorp Inc.",
    status: "active",
    progress: 75,
    budget: "$25,000",
    deadline: "Dec 30, 2024",
    collaborators: ["alice", "john", "bob"]
  },
  {
    id: 2,
    title: "E-commerce Website Design",
    client: "Innovate LLC",
    status: "pending",
    progress: 30,
    budget: "$18,500",
    deadline: "Jan 15, 2025",
    collaborators: ["jane", "mike"]
  },
  {
    id: 3,
    title: "Mobile App Wireframes",
    client: "StartupFlow",
    status: "review",
    progress: 85,
    budget: "$12,000",
    deadline: "Dec 20, 2024",
    collaborators: ["alice", "bob"]
  }
]

const mockTeamMembers = [
  { name: "Alice Smith", avatar: "alice", role: "Lead Designer", status: "online", projects: 3 },
  { name: "John Doe", avatar: "john", role: "Frontend Developer", status: "away", projects: 2 },
  { name: "Bob Johnson", avatar: "bob", role: "Project Manager", status: "online", projects: 4 },
  { name: "Jane Williams", avatar: "jane", role: "UX Researcher", status: "offline", projects: 1 },
  { name: "Mike Brown", avatar: "mike", role: "Backend Developer", status: "online", projects: 2 }
]

const weeklyActivity = [
  { day: 'Mon', hours: 8, tasks: 5, meetings: 2 },
  { day: 'Tue', hours: 7, tasks: 8, meetings: 1 },
  { day: 'Wed', hours: 9, tasks: 6, meetings: 3 },
  { day: 'Thu', hours: 8, tasks: 7, meetings: 2 },
  { day: 'Fri', hours: 6, tasks: 9, meetings: 1 },
  { day: 'Sat', hours: 4, tasks: 3, meetings: 0 },
  { day: 'Sun', hours: 2, tasks: 1, meetings: 0 }
]

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const realTimeMetrics = {
    totalEarnings: 47500,
    monthlyEarnings: 12500,
    growth: 15.2,
    pendingInvoices: 8750,
    activeProjects: 12,
    teamMembers: 15,
    completedTasks: 134
  }

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    console.log("✅ Dashboard: Authenticated user verified")
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto p-6 space-y-6" data-testid="dashboard-container">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-testid="dashboard-title">
              Welcome to FreeflowZee
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Your creative workspace dashboard - Manage projects, track earnings, and collaborate seamlessly.
            </p>
          </div>
          <div className="flex gap-3">
            <Button data-testid="new-project-button" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              + New Project
            </Button>
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
              Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow" data-testid="earnings-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">${realTimeMetrics.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-blue-600 mt-1">+{realTimeMetrics.growth}% this month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow" data-testid="monthly-earnings-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">${realTimeMetrics.monthlyEarnings.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">On track for target</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow" data-testid="active-projects-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{realTimeMetrics.activeProjects}</div>
              <p className="text-xs text-purple-600 mt-1">{realTimeMetrics.teamMembers} team members</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow" data-testid="pending-invoices-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700">Pending Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">${realTimeMetrics.pendingInvoices.toLocaleString()}</div>
              <p className="text-xs text-orange-600 mt-1">3 awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm" data-testid="dashboard-tabs">
            <TabsTrigger value="overview" data-testid="overview-tab" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Overview</TabsTrigger>
            <TabsTrigger value="projects" data-testid="projects-tab" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Projects</TabsTrigger>
            <TabsTrigger value="team" data-testid="team-tab" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Team</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="analytics-tab" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Hub */}
          <TabsContent value="overview" className="space-y-6" data-testid="overview-hub">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Activity Chart */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Weekly Activity
                  </CardTitle>
                  <CardDescription>Hours worked and tasks completed this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
                      <Bar dataKey="tasks" fill="#10b981" name="Tasks" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ⚡ Quick Actions
                  </CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => window.location.href = '/projects'}>
                      <span className="text-2xl">📁</span>
                      <span>View Projects</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => window.location.href = '/analytics'}>
                      <span className="text-2xl">📈</span>
                      <span>Analytics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => window.location.href = '/payment'}>
                      <span className="text-2xl">💳</span>
                      <span>Payments</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => window.location.href = '/settings'}>
                      <span className="text-2xl">⚙️</span>
                      <span>Settings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Feed */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔔 Recent Activity
                </CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 text-xl">🎉</span>
                    <div>
                      <p className="font-medium">Project completed!</p>
                      <p className="text-sm text-gray-600">Mobile App Wireframes project was approved by StartupFlow</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">2h ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 text-xl">💰</span>
                    <div>
                      <p className="font-medium">Payment received</p>
                      <p className="text-sm text-gray-600">$12,000 from StartupFlow project</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">5h ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-600 text-xl">👥</span>
                    <div>
                      <p className="font-medium">Team member joined</p>
                      <p className="text-sm text-gray-600">Mike Brown joined the TechCorp Inc. project team</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">1d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Hub */}
          <TabsContent value="projects" className="space-y-6" data-testid="projects-hub">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚀 Projects Hub
                </CardTitle>
                <CardDescription>Manage your active projects and collaborations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-6 border rounded-xl hover:bg-gray-50 transition-colors"
                      data-testid={`project-${project.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{project.title}</h3>
                          <Badge 
                            variant={project.status === 'active' ? 'default' : project.status === 'review' ? 'secondary' : 'outline'}
                            data-testid={`project-status-${project.id}`}
                            className={
                              project.status === 'active' ? 'bg-green-100 text-green-800' :
                              project.status === 'review' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{project.client}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Budget: {project.budget}</span>
                          <span>Due: {project.deadline}</span>
                          <span>{project.progress}% complete</span>
                        </div>
                        <div className="mt-3">
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-6">
                        <div className="flex -space-x-2">
                          {project.collaborators.map((collaborator, index) => (
                            <Avatar key={index} className="w-8 h-8 border-2 border-white">
                              <AvatarImage 
                                src={`/avatars/${collaborator}.jpg`} 
                                alt={collaborator}
                              />
                              <AvatarFallback className="text-xs">{collaborator.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <Button size="sm" variant="outline" data-testid={`view-project-${project.id}`} className="px-6">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Hub */}
          <TabsContent value="team" className="space-y-6" data-testid="team-hub">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👥 Team Members
                </CardTitle>
                <CardDescription>Manage your team and collaboration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTeamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-6 border rounded-xl hover:bg-gray-50 transition-colors"
                      data-testid={`team-member-${member.avatar}`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarImage 
                            src={`/avatars/${member.avatar}.jpg`} 
                            alt={member.name}
                          />
                          <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                          <p className="text-gray-600">{member.role}</p>
                          <p className="text-sm text-gray-500">{member.projects} active projects</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${
                              member.status === 'online' ? 'bg-green-500' :
                              member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            data-testid={`member-status-${member.avatar}`}
                          />
                          <span className="text-sm text-gray-600 capitalize">{member.status}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Message
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Hub */}
          <TabsContent value="analytics" className="space-y-6" data-testid="analytics-hub">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📈 Analytics Dashboard
                </CardTitle>
                <CardDescription>Track your performance and growth metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">95%</div>
                    <div className="text-sm text-blue-600">Client Satisfaction</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">24</div>
                    <div className="text-sm text-green-600">Projects Delivered</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">$180K</div>
                    <div className="text-sm text-purple-600">Annual Revenue</div>
                  </div>
                </div>
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-500 text-lg">Detailed analytics dashboard coming soon...</p>
                  <p className="text-gray-400 text-sm mt-2">Charts, trends, and insights to help you grow</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
  
