'use client';

import React from 'react';
import { EnterpriseVideoStudio } from '@/components/collaboration/enterprise-video-studio';
import { EnhancedInteractiveDashboard } from '@/components/dashboard/enhanced-interactive-dashboard';
import { FinancialHub } from '@/components/hubs/financial-hub';
import { ProjectsHub } from '@/components/hubs/projects-hub';
import { CommunityHub } from '@/components/hubs/community-hub';
import AICreate from '@/components/collaboration/ai-create';
import { FilesHub } from '@/components/hubs/files-hub';

// Mock user ID for demo
const DEMO_USER_ID = 'demo_user_1';

// Mock user data
const DEMO_USER = {
  id: DEMO_USER_ID,
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: '/images/avatar.jpg'
};

// Mock projects data
const DEMO_PROJECTS = [
  {
    id: 'demo1',
    title: 'Website Redesign',
    description: 'Complete website redesign for a major client',
    status: 'active' as const,
    priority: 'high' as const,
    budget: 15000,
    spent: 5000,
    client_name: 'Acme Corp',
    client_email: 'contact@acme.com',
    start_date: '2024-03-01',
    end_date: '2024-05-01',
    progress: 35,
    team_members: [],
    attachments: [],
    comments_count: 12,
    created_at: '2024-03-01',
    updated_at: '2024-03-15'
  },
  {
    id: 'demo2',
    title: 'Mobile App Development',
    description: 'iOS and Android app development project',
    status: 'draft' as const,
    priority: 'medium' as const,
    budget: 25000,
    spent: 0,
    client_name: 'TechStart Inc',
    client_email: 'info@techstart.com',
    start_date: '2024-04-01',
    end_date: '2024-08-01',
    progress: 0,
    team_members: [],
    attachments: [],
    comments_count: 3,
    created_at: '2024-03-15',
    updated_at: '2024-03-15'
  }
];

// Mock posts data
const DEMO_POSTS = [
  {
    id: 'post1',
    title: 'Getting Started with FreeflowZee',
    content: 'A guide to using our platform effectively...',
    author: DEMO_USER,
    created_at: '2024-03-01',
    likes: 15,
    comments: 5
  },
  {
    id: 'post2',
    title: 'Best Practices for Freelancers',
    content: 'Tips and tricks for successful freelancing...',
    author: DEMO_USER,
    created_at: '2024-03-15',
    likes: 23,
    comments: 8
  }
];

// Mock files data
const DEMO_FILES = [
  {
    id: 'file1',
    name: 'Project Proposal.pdf',
    size: 1024 * 1024,
    type: 'application/pdf',
    created_at: '2024-03-01',
    owner: DEMO_USER
  },
  {
    id: 'file2',
    name: 'Design Assets.zip',
    size: 5 * 1024 * 1024,
    type: 'application/zip',
    created_at: '2024-03-15',
    owner: DEMO_USER
  }
];

// Mock earnings data
const DEMO_EARNINGS = 25000;

export default function DemoFeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          FreeflowZee Enterprise Features
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProjectsHub projects={DEMO_PROJECTS} userId={DEMO_USER_ID} />
          <EnterpriseVideoStudio projectId="demo-project" currentUser={DEMO_USER} />
          <CommunityHub />
          <AICreate />
          <EnhancedInteractiveDashboard />
          <FilesHub userId={DEMO_USER_ID} projects={DEMO_FILES} />
          <FinancialHub earnings={DEMO_EARNINGS} projects={DEMO_PROJECTS} userId={DEMO_USER_ID} />
        </div>
      </div>
    </div>
  );
}