"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { ProjectsHub } from '@/components/hubs/projects-hub';
import { UniversalFeedbackHub } from '@/components/hubs/universal-feedback-hub';
import { FinancialHub } from '@/components/hubs/financial-hub';
import { TeamHub } from '@/components/hubs/team-hub';
import { FilesHub } from '@/components/hubs/files-hub';
import { CommunityTab } from '@/components/community-tab';
import { MainNavigation } from '@/components/navigation/main-navigation';
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
  Calendar
} from 'lucide-react';

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);

  // Mock user for demo mode
  const mockUser = {
    id: 'demo-user',
    email: 'demo@freeflowzee.com',
    user_metadata: {
      full_name: 'Demo User',
      avatar_url: undefined
    }
  };

  const tabConfig = [
    {
      value: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      component: DashboardOverview,
      route: '/dashboard'
    },
    {
      value: 'my-day',
      label: 'My Day',
      icon: Calendar,
      component: null,
      route: '/dashboard/my-day',
      badge: 'AI'
    },
    {
      value: 'projects',
      label: 'Projects',
      icon: FolderOpen,
      component: ProjectsHub,
      route: '/dashboard/projects-hub'
    },
    {
      value: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      component: UniversalFeedbackHub,
      route: '/dashboard/collaboration'
    },
    {
      value: 'financial',
      label: 'Financial',
      icon: DollarSign,
      component: FinancialHub,
      route: '/dashboard/financial-hub'
    },
    {
      value: 'team',
      label: 'Team',
      icon: Users,
      component: TeamHub,
      route: '/dashboard/team-hub'
    },
    {
      value: 'files',
      label: 'Files',
      icon: FileText,
      component: FilesHub,
      route: '/dashboard/files-hub'
    },
    {
      value: 'community',
      label: 'Community',
      icon: Globe,
      component: CommunityTab,
      route: '/dashboard/community'
    }
  ];

  const handleTabChange = (tabValue: string) => {
    const tab = tabConfig.find(t => t.value === tabValue);
    if (tab?.route && tab.route !== '/dashboard') {
      router.push(tab.route);
    } else {
      setActiveTab(tabValue);
    }
  };

  const renderTabContent = (tabValue: string) => {
    const tab = tabConfig.find(t => t.value === tabValue);
    if (!tab) return null;

    const TabComponent = tab.component as any;
    
    switch (tabValue) {
      case 'dashboard':
        return (
          <TabComponent
            earnings={mockData.earnings}
            activeProjects={mockData.activeProjects}
            completedProjects={mockData.completedProjects}
            pendingPayments={mockData.pendingPayments}
            recentActivities={mockData.recentActivities}
          />
        );
      case 'financial':
        return (
          <TabComponent
            earnings={mockData.earnings}
            projects={mockData.projects}
            userId="user-1"
          />
        );
      case 'files':
        return (
          <TabComponent
            projects={mockData.projects}
            userId="user-1"
          />
        );
      case 'community':
        return <TabComponent />;
      default:
        return (
          <TabComponent 
            projects={mockData.projects}
            userId="user-1"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      {/* Luxury floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/10 to-pink-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-200/8 to-indigo-200/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Glass overlay for premium texture */}
      <div className="fixed inset-0 bg-white/20 backdrop-blur-[100px] pointer-events-none"></div>

      {/* Main Navigation */}
      <div className="relative z-10">
        <MainNavigation 
          user={mockUser} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-8 py-12 max-w-7xl">
        {/* Luxury Welcome Header */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h1 className="text-6xl font-thin text-slate-800 mb-6 tracking-tight leading-tight">
                Welcome back,
                <span className="block bg-gradient-to-r from-rose-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent font-extralight mt-2">
                  {mockUser.user_metadata?.full_name?.split(' ')[0] || 'Creator'}
                </span>
              </h1>
              <p className="text-xl text-slate-600 font-light max-w-2xl leading-relaxed">
                Your creative workspace awaits. Track progress, collaborate with clients, and build extraordinary experiences.
              </p>
            </div>
            
            {/* Premium action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-300 border border-white/20"
                onClick={() => router.push('/projects/new')}
              >
                <Plus className="mr-2 w-5 h-5" />
                New Project
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-slate-200 hover:border-slate-300 bg-white/70 backdrop-blur-xl px-8 py-4 rounded-2xl text-slate-700 hover:bg-white/80 transition-all duration-300 relative"
                onClick={() => router.push('/dashboard/notifications')}
              >
                <Bell className="mr-2 w-5 h-5" />
                Notifications
                {notifications > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 p-0 text-xs flex items-center justify-center">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Navigation Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-12 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl shadow-black/5">
            {tabConfig.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center justify-center gap-2 text-sm font-light rounded-2xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-800 data-[state=active]:to-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/50 text-slate-600 py-3 px-4"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content with luxury styling */}
          <div className="min-h-[600px]">
            {tabConfig.map((tab) => {
              const ComponentToRender = tab.component;
              return (
                <TabsContent 
                  key={tab.value} 
                  value={tab.value} 
                  className="focus:outline-none"
                >
                  <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl shadow-black/5 p-8">
                    <ComponentToRender 
                      data={mockData}
                      activeProjects={mockData.projects.filter(p => p.status === 'active')}
                      completedProjects={mockData.projects.filter(p => p.status === 'completed')}
                      recentActivities={mockData.recentActivities}
                      earnings={mockData.earnings}
                      pendingPayments={mockData.pendingPayments}
                      notifications={notifications}
                    />
                  </div>
                </TabsContent>
              );
            })}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
  
