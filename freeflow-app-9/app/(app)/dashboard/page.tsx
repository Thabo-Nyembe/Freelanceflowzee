"use client";

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  EnhancedInteractiveSystem, 
  EnhancedButton, 
  EnhancedNavigation, 
  EnhancedCard,
  DASHBOARD_ROUTES 
} from '@/components/ui/enhanced-interactive-system'
import { 
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  DollarSign,
  Users,
  FileText,
  Globe,
  Settings,
  Bell,
  Search,
  Plus,
  Eye,
  Zap,
  Target,
  Brain,
  TrendingUp,
  Briefcase,
  Clock,
  Shield,
  Download,
  Calendar,
  Award,
  Activity,
  ArrowRight,
  ChevronRight,
  Wallet
} from 'lucide-react'

// Mock data - in a real app, this would come from your database/API
const mockData = {
  earnings: 47500,
  activeProjects: 5,
  completedProjects: 12,
  pendingPayments: 3,
  recentActivities: [
    {
      id: 'activity-1',
      type: 'project',
      description: 'New project milestone completed: E-commerce Website Phase 2',
      timestamp: '2 hours ago'
    },
    {
      id: 'activity-2',
      type: 'feedback',
      description: 'Sarah left feedback on homepage design mockup',
      timestamp: '4 hours ago'
    },
    {
      id: 'activity-3',
      type: 'payment',
      description: 'Invoice #INV-001 payment received from TechCorp Inc.',
      timestamp: '1 day ago'
    },
    {
      id: 'activity-4',
      type: 'project',
      description: 'Mobile app development project started',
      timestamp: '2 days ago'
    },
    {
      id: 'activity-5',
      type: 'feedback',
      description: 'Client approved brand identity package deliverables',
      timestamp: '3 days ago'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'E-commerce Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      client_name: 'TechCorp Inc.',
      client_email: 'sarah@techcorp.com',
      status: 'active' as const,
      priority: 'high' as const,
      progress: 65,
      budget: 15000,
      spent: 9750,
      start_date: '2024-01-15',
      end_date: '2024-03-15',
      team_members: [
        { id: 'tm-1', name: 'John Doe', avatar: '/avatars/john.jpg' },
        { id: 'tm-2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
      ],
      attachments: [
        { id: 'att-1', name: 'wireframes.pdf', size: '2.4MB' }
      ],
      comments_count: 8,
      created_at: '2024-01-15',
      updated_at: '2024-02-20'
    },
    {
      id: 'proj-2',
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application for iOS and Android',
      client_name: 'StartupXYZ',
      client_email: 'ceo@startupxyz.com',
      status: 'active' as const,
      priority: 'medium' as const,
      progress: 40,
      budget: 25000,
      spent: 10000,
      start_date: '2024-02-01',
      end_date: '2024-04-20',
      team_members: [
        { id: 'tm-3', name: 'Mike Johnson', avatar: '/avatars/mike.jpg' }
      ],
      attachments: [],
      comments_count: 3,
      created_at: '2024-02-01',
      updated_at: '2024-02-18'
    },
    {
      id: 'proj-3',
      title: 'Brand Identity Package',
      description: 'Complete brand identity design including logo, colors, and guidelines',
      client_name: 'Design Agency Co.',
      client_email: 'info@designagency.co',
      status: 'completed' as const,
      priority: 'low' as const,
      progress: 100,
      budget: 8000,
      spent: 7500,
      start_date: '2024-01-10',
      end_date: '2024-02-28',
      team_members: [
        { id: 'tm-4', name: 'Alice Brown', avatar: '/avatars/alice.jpg' },
        { id: 'tm-5', name: 'Bob Wilson', avatar: '/avatars/bob.jpg' }
      ],
      attachments: [
        { id: 'att-2', name: 'logo-final.ai', size: '15.2MB' },
        { id: 'att-3', name: 'brand-guidelines.pdf', size: '8.1MB' }
      ],
      comments_count: 12,
      created_at: '2024-01-10',
      updated_at: '2024-02-28'
    }
  ]
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(clockTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Sample data
  const stats = [
    {
      title: 'Total Earnings',
      value: '$47,850',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'This month'
    },
    {
      title: 'Active Projects',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Currently working'
    },
    {
      title: 'Happy Clients',
      value: '32',
      change: '+5',
      trend: 'up',
      icon: Users,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      description: 'All time'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+2%',
      trend: 'up',
      icon: Target,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Success rate'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Brand Identity Design',
      client: 'TechStart Inc.',
      progress: 85,
      status: 'In Progress',
      dueDate: '2025-01-15',
      priority: 'High',
      earnings: '$3,200'
    },
    {
      id: 2,
      name: 'Mobile App UI',
      client: 'Digital Solutions',
      progress: 60,
      status: 'Review',
      dueDate: '2025-01-20',
      priority: 'Medium',
      earnings: '$4,500'
    },
    {
      id: 3,
      name: 'Website Redesign',
      client: 'Creative Agency',
      progress: 95,
      status: 'Final Review',
      dueDate: '2025-01-12',
      priority: 'High',
      earnings: '$2,800'
    }
  ];

  const notificationsData = [
    {
      id: 1,
      title: 'Payment Received',
      message: 'TechStart Inc. sent $1,600 for milestone completion',
      time: '2 hours ago',
      type: 'payment',
      icon: DollarSign,
      color: 'text-emerald-600'
    },
    {
      id: 2,
      title: 'Project Feedback',
      message: 'Digital Solutions left feedback on Mobile App UI',
      time: '4 hours ago',
      type: 'feedback',
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      id: 3,
      title: 'Deadline Reminder',
      message: 'Website Redesign due in 2 days',
      time: '6 hours ago',
      type: 'deadline',
      icon: Clock,
      color: 'text-amber-600'
    }
  ];

  const quickActions = [
    {
      title: 'Start New Project',
      description: 'Create a new project workspace',
      icon: Plus,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      action: () => console.log('Start new project')
    },
    {
      title: 'Invoice Client',
      description: 'Generate and send invoices',
      icon: Wallet,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      action: () => console.log('Create invoice')
    },
    {
      title: 'Upload Files',
      description: 'Share files with clients',
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => console.log('Upload files')
    },
    {
      title: 'Schedule Meeting',
      description: 'Book client consultations',
      icon: Calendar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      action: () => console.log('Schedule meeting')
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-responsive">Welcome back!</h1>
          <p className="text-responsive text-gray-600 mt-2">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-mobile sm:text-desktop text-gray-500">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <Button className="button-touch w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid-responsive">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="card-responsive hover:scale-[1.02] transition-transform duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-mobile sm:text-desktop font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs sm:text-sm text-emerald-600 font-medium">
                    {stat.change}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid - Mobile-First */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Recent Projects - Takes 2 columns on desktop */}
        <div className="lg:col-span-2">
          <Card className="card-responsive">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Recent Projects
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-responsive">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1 space-y-2 sm:space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h4 className="font-medium text-responsive">{project.name}</h4>
                      <Badge variant="outline" className="text-xs w-fit">
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-mobile text-gray-600">{project.client}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center space-x-2 text-mobile">
                        <span>Progress:</span>
                        <Progress value={project.progress} className="w-16 sm:w-20" />
                        <span className="text-xs">{project.progress}%</span>
                      </div>
                      <span className="text-mobile text-gray-500">Due: {project.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end mt-3 sm:mt-0 sm:ml-4">
                    <span className="font-semibold text-responsive text-emerald-600">
                      {project.earnings}
                    </span>
                    <Button variant="ghost" size="sm" className="ml-2 touch-target">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card className="card-responsive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={action.action}
                    className="h-auto p-4 justify-start text-left touch-target"
                  >
                    <div className={`p-2 rounded-xl ${action.bgColor} mr-3`}>
                      <Icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <div className="hidden lg:block">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                    <div className="lg:hidden font-medium text-sm">{action.title}</div>
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="card-responsive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notificationsData.map((notification) => {
                const Icon = notification.icon
                return (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <Icon className={`w-4 h-4 ${notification.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                      <span className="text-xs text-gray-500 mt-1">{notification.time}</span>
                    </div>
                  </div>
                )
              })}
              <Button variant="ghost" size="sm" className="w-full mt-3 text-responsive">
                View All Notifications
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
  
