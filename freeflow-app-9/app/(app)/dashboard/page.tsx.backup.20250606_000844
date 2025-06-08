"use client";

import React, { useState } from 'react';
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
  Plus
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
      component: DashboardOverview
    },
    {
      value: 'projects',
      label: 'Projects',
      icon: FolderOpen,
      component: ProjectsHub
    },
    {
      value: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      component: UniversalFeedbackHub
    },
    {
      value: 'financial',
      label: 'Financial',
      icon: DollarSign,
      component: FinancialHub
    },
    {
      value: 'team',
      label: 'Team',
      icon: Users,
      component: TeamHub
    },
    {
      value: 'files',
      label: 'Files',
      icon: FileText,
      component: FilesHub
    },
    {
      value: 'community',
      label: 'Community',
      icon: Globe,
      component: CommunityTab
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Main Navigation */}
      <MainNavigation 
        user={mockUser} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to FreeflowZee
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Your complete freelance management platform
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <Card className="bg-white/50 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="font-bold text-green-600">${(mockData.earnings * 0.3).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/50 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="font-bold text-blue-600">{mockData.activeProjects} Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Tab Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 border border-white/20 shadow-lg">
            <TabsList className="grid w-full grid-cols-7 bg-transparent">
              {tabConfig.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.value === 'feedback' && notifications > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {notifications}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <div className="p-6">
              {tabConfig.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  {renderTabContent(tab.value)}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>

        {/* Quick Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
            onClick={() => setActiveTab('projects')}
          >
            <Plus className="h-6 w-6" />
          </Button>
          
          {/* Notification Badge */}
          {notifications > 0 && (
            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-14 w-14 shadow-lg bg-white/90 backdrop-blur-sm border-white/20 relative"
            >
              <Bell className="h-6 w-6" />
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 p-0 text-xs flex items-center justify-center"
              >
                {notifications}
              </Badge>
            </Button>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p>&copy; 2024 FreeflowZee. All rights reserved.</p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">Privacy</Button>
              <Button variant="ghost" size="sm">Terms</Button>
              <Button variant="ghost" size="sm">Support</Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 