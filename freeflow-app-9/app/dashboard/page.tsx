'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { VerificationReminder } from '@/components/verification-reminder'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FolderOpen, 
  BarChart3,
  Activity,
  FileText,
  MessageSquare,
  Settings,
  Download,
  Upload,
  CreditCard,
  Target,
  Zap,
  ArrowRight,
  Plus,
  Filter,
  Search
} from 'lucide-react'

// Rich mock data matching the comprehensive testing checklist
const mockProjects = [
  {
    id: 1,
    title: "TechCorp Inc. Brand Identity",
    client: "TechCorp Inc.",
    status: "active",
    progress: 65,
    budget: 15000,
    spent: 9750,
    dueDate: "2024-07-15",
    collaborators: ["alice", "john", "bob"],
    priority: "high",
    tasks: { total: 24, completed: 16 }
  },
  {
    id: 2,
    title: "E-commerce Platform Design",
    client: "Digital Solutions Ltd.",
    status: "in-progress",
    progress: 40,
    budget: 25000,
    spent: 10000,
    dueDate: "2024-08-30",
    collaborators: ["jane", "mike", "sarah"],
    priority: "medium",
    tasks: { total: 32, completed: 13 }
  },
  {
    id: 3,
    title: "Mobile App Redesign",
    client: "StartupXYZ",
    status: "completed",
    progress: 100,
    budget: 18000,
    spent: 17500,
    dueDate: "2024-06-01",
    collaborators: ["alex", "maria"],
    priority: "completed",
    tasks: { total: 18, completed: 18 }
  }
]

const mockActivity = [
  {
    id: 1,
    type: "project_update",
    message: "TechCorp Inc. project milestone completed",
    timestamp: "2 hours ago",
    user: "Alice Johnson",
    avatar: "alice"
  },
  {
    id: 2,
    type: "payment_received",
    message: "Payment of $5,000 received from Digital Solutions Ltd.",
    timestamp: "4 hours ago",
    user: "System",
    avatar: "system"
  },
  {
    id: 3,
    type: "file_upload",
    message: "New design assets uploaded to StartupXYZ project",
    timestamp: "6 hours ago",
    user: "Mike Chen",
    avatar: "mike"
  },
  {
    id: 4,
    type: "feedback",
    message: "Client feedback received on mobile app designs",
    timestamp: "1 day ago",
    user: "Jane Smith",
    avatar: "jane"
  }
]

const mockTeamMembers = [
  { 
    name: "Alice Johnson", 
    avatar: "alice", 
    role: "Lead Designer", 
    status: "online",
    projects: 3,
    lastActive: "Now",
    efficiency: 94
  },
  { 
    name: "John Smith", 
    avatar: "john", 
    role: "Full Stack Developer", 
    status: "away",
    projects: 2,
    lastActive: "30 min ago",
    efficiency: 87
  },
  { 
    name: "Bob Wilson", 
    avatar: "bob", 
    role: "Project Manager", 
    status: "online",
    projects: 5,
    lastActive: "Now",
    efficiency: 91
  },
  { 
    name: "Jane Miller", 
    avatar: "jane", 
    role: "UI/UX Designer", 
    status: "offline",
    projects: 2,
    lastActive: "2 hours ago",
    efficiency: 89
  },
  { 
    name: "Mike Chen", 
    avatar: "mike", 
    role: "Frontend Developer", 
    status: "online",
    projects: 3,
    lastActive: "Now",
    efficiency: 92
  }
]

const mockFinancials = {
  totalEarnings: 47500,
  monthlyGrowth: 12.5,
  pendingInvoices: 8750,
  thisMonthEarnings: 15200,
  averageProjectValue: 19500,
  clientRetention: 85
}

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Quick navigation functions for app routing
  const navigateToProjects = () => {
    router.push('/projects')
  }

  const navigateToAnalytics = () => {
    router.push('/analytics')
  }

  const navigateToSettings = () => {
    router.push('/settings')
  }

  const navigateToPayment = () => {
    router.push('/payment')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="dashboard-container">
      {/* Verification Reminder */}
      <Suspense fallback={null}>
        <VerificationReminder />
      </Suspense>
      
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="dashboard-title">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening with your projects.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={navigateToProjects} className="flex items-center bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="earnings-card" className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Earnings</p>
                <p className="text-3xl font-bold text-green-700">${mockFinancials.totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{mockFinancials.monthlyGrowth}% this month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="projects-card" className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Projects</p>
                <p className="text-3xl font-bold text-blue-700">{mockProjects.filter(p => p.status !== 'completed').length}</p>
                <p className="text-sm text-blue-600">2 due this week</p>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="team-card" className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Team Members</p>
                <p className="text-3xl font-bold text-purple-700">{mockTeamMembers.length}</p>
                <p className="text-sm text-purple-600">{mockTeamMembers.filter(m => m.status === 'online').length} online now</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

                 <Card data-testid="pending-card" className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-orange-600">Pending Invoices</p>
                 <p className="text-3xl font-bold text-orange-700">${mockFinancials.pendingInvoices.toLocaleString()}</p>
                 <p className="text-sm text-orange-600">3 awaiting payment</p>
               </div>
               <CreditCard className="w-8 h-8 text-orange-600" />
             </div>
           </CardContent>
         </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-6">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="projects" className="text-xs">Projects</TabsTrigger>
            <TabsTrigger value="financials" className="text-xs">Financial</TabsTrigger>
            <TabsTrigger value="team" className="text-xs">Team</TabsTrigger>
            <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs">Feedback</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {activity.user[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={navigateToProjects}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50"
                  >
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                    <span className="text-sm">View Projects</span>
                  </Button>
                  
                  <Button 
                    onClick={navigateToAnalytics}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50"
                  >
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                  
                  <Button 
                    onClick={navigateToPayment}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50"
                  >
                    <CreditCard className="w-6 h-6 text-purple-600" />
                    <span className="text-sm">Payments</span>
                  </Button>
                  
                  <Button 
                    onClick={navigateToSettings}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50"
                  >
                    <Settings className="w-6 h-6 text-gray-600" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Project Progress Overview
                </span>
                <Button onClick={navigateToProjects} variant="ghost" size="sm" className="flex items-center">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProjects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600">{project.client}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={project.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {project.status}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                      </div>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <span>Budget: ${project.budget.toLocaleString()}</span>
                      <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Hub */}
        <TabsContent value="projects" className="space-y-6">
          <Card data-testid="projects-hub">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Projects Hub
                </CardTitle>
                <Button onClick={navigateToProjects} className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
              <CardDescription>
                Manage and track all your creative projects in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProjects.map((project) => (
                  <div key={project.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                        <p className="text-gray-600">{project.client}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={project.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            project.status === 'completed' ? 'bg-green-100 text-green-800 mb-2' :
                            project.status === 'active' ? 'bg-blue-100 text-blue-800 mb-2' :
                            'bg-yellow-100 text-yellow-800 mb-2'
                          }
                        >
                          {project.status}
                        </Badge>
                        <p className="text-sm text-gray-600">Progress: {project.progress}%</p>
                      </div>
                    </div>
                    
                    <Progress value={project.progress} className="h-3 mb-4" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Budget</p>
                        <p className="font-medium">${project.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Spent</p>
                        <p className="font-medium">${project.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Due Date</p>
                        <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tasks</p>
                        <p className="font-medium">{project.tasks.completed}/{project.tasks.total}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Hub */}
        <TabsContent value="financials" className="space-y-6">
          <Card data-testid="financial-hub">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Financial Hub
              </CardTitle>
              <CardDescription>
                Track earnings, expenses, and financial performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-700">${mockFinancials.totalEarnings.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{mockFinancials.monthlyGrowth}% growth</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">This Month</p>
                  <p className="text-2xl font-bold text-blue-700">${mockFinancials.thisMonthEarnings.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">On track</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Avg Project Value</p>
                  <p className="text-2xl font-bold text-purple-700">${mockFinancials.averageProjectValue.toLocaleString()}</p>
                  <p className="text-sm text-purple-600">Increasing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Hub */}
        <TabsContent value="team" className="space-y-6">
          <Card data-testid="team-hub">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Team Hub
              </CardTitle>
              <CardDescription>
                Manage team members and track collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockTeamMembers.map((member, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar>
                        <AvatarFallback className={
                          member.status === 'online' ? 'bg-green-100 text-green-600' :
                          member.status === 'away' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={
                          member.status === 'online' ? 'default' : 'secondary'
                        } className={
                          member.status === 'online' ? 'bg-green-100 text-green-800' :
                          member.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {member.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Projects:</span>
                        <span className="font-medium">{member.projects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficiency:</span>
                        <span className="font-medium">{member.efficiency}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Hub */}
        <TabsContent value="files" className="space-y-6">
          <Card data-testid="files-hub">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Files Hub
              </CardTitle>
              <CardDescription>
                Manage project files and collaborative documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">File Management System</h3>
                <p className="text-gray-600 mb-4">Upload, organize, and share files with your team and clients</p>
                <Button className="flex items-center mx-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Hub */}
        <TabsContent value="feedback" className="space-y-6">
          <Card data-testid="feedback-hub">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                Feedback Hub
              </CardTitle>
              <CardDescription>
                Collect and manage client feedback across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Universal Feedback System</h3>
                <p className="text-gray-600 mb-4">Centralized feedback collection and management platform</p>
                <Button variant="outline" className="flex items-center mx-auto">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

