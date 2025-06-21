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
      action: () => window.location.href = '/dashboard/projects-hub',
      testId: 'create-project-btn'
    },
    {
      title: 'Invoice Client',
      description: 'Generate and send invoices',
      icon: Wallet,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      action: () => window.location.href = '/dashboard/invoices',
      testId: 'create-invoice-btn'
    },
    {
      title: 'Upload Files',
      description: 'Share files with clients',
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => window.location.href = '/dashboard/files-hub',
      testId: 'upload-files-btn'
    },
    {
      title: 'Schedule Meeting',
      description: 'Book client consultations',
      icon: Calendar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      action: () => window.location.href = '/dashboard/calendar',
      testId: 'schedule-meeting-btn'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Projects</CardTitle>
            <Button variant="outline" size="sm">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-500">{project.client}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Progress value={project.progress} className="w-20" />
                      <span className="text-xs text-gray-500">{project.progress}%</span>
                    </div>
                    <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'} className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">{project.earnings}</p>
                  <p className="text-xs text-gray-500">Due {project.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  data-testid={action.testId}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                >
                  <div className={`p-2 rounded-lg ${action.bgColor} w-fit`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <h4 className="font-medium text-gray-900 mt-3 group-hover:text-violet-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}