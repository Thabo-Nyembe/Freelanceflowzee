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
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Projects</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{mockData.activeProjects}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        ${mockData.earnings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Tabs Interface */}
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </Button>
          <Button className="h-16 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white">
            <Bell className="h-5 w-5 mr-2" />
            Send Update
          </Button>
          <Button className="h-16 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
            <DollarSign className="h-5 w-5 mr-2" />
            Create Invoice
          </Button>
          <Button className="h-16 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
            <Users className="h-5 w-5 mr-2" />
            Invite Team
          </Button>
        </div>
      </div>
    </div>
  );
}
  
