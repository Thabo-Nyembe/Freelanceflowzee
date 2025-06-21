'use client';

import React from 'react';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { ProjectsHub } from '@/components/hubs/projects-hub';
import { CommunityHub } from '@/components/community/enhanced-community-hub';
import { FilesHub } from '@/components/hubs/files-hub';
import { EscrowSystem } from '@/components/collaboration/escrow-system';
import AICreate from '@/components/collaboration/ai-create';
import { MyDayToday } from '@/components/collaboration/my-day-today';
import { VideoStudio } from '@/components/collaboration/video-studio';

// Mock user ID for demo
const DEMO_USER_ID = 'demo_user_1';

export default function DemoFeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          FreeflowZee Enterprise Features
        </h1>
        
        {/* Dashboard Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
          <DashboardOverview userId={DEMO_USER_ID} />
        </section>

        {/* Projects Hub */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Projects Hub</h2>
          <ProjectsHub userId={DEMO_USER_ID} projects={[]} />
        </section>

        {/* Video Studio */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Video Studio</h2>
          <VideoStudio userId={DEMO_USER_ID} />
        </section>

        {/* Community Hub */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Community Hub</h2>
          <CommunityHub userId={DEMO_USER_ID} />
        </section>

        {/* Files Hub */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Files Hub</h2>
          <FilesHub userId={DEMO_USER_ID} files={[]} />
        </section>

        {/* Escrow System */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Escrow System</h2>
          <EscrowSystem userId={DEMO_USER_ID} />
        </section>

        {/* AI Create */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">AI Create</h2>
          <AICreate userId={DEMO_USER_ID} />
        </section>

        {/* My Day Today */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">My Day Today</h2>
          <MyDayToday userId={DEMO_USER_ID} />
        </section>
      </div>
    </div>
  );
}