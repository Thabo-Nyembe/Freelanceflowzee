
'use client';

import React from 'react';

interface DashboardTestWrapperProps {
  children: React.ReactNode;
}

export function DashboardTestWrapper({ children }: DashboardTestWrapperProps) {
  return (
    <div data-testid="dashboard-container">
      <h1 data-testid="dashboard-title">Dashboard</h1>
      
      <div role="tablist" data-testid="dashboard-tabs">
        <button 
          role="tab" 
          data-testid="projects-tab"
          data-tab="projects"
          aria-selected="true"
        >
          Projects
        </button>
        <button 
          role="tab" 
          data-testid="team-tab"
          data-tab="team"
          aria-selected="false"
        >
          Team
        </button>
      </div>
      
      <div data-testid="projects-hub">
        <button data-testid="new-project-button">
          New Project
        </button>
        {/* Projects content */}
      </div>
      
      <div data-testid="team-hub" style={{ display: 'none' }}>
        <div data-testid="team-member" data-member-id="1">
          <img src="/avatars/alice.jpg" alt="Alice Johnson" />
          <span>Alice Johnson</span>
        </div>
        <div data-testid="team-member" data-member-id="2">
          <img src="/avatars/bob.jpg" alt="Bob Smith" />
          <span>Bob Smith</span>
        </div>
      </div>
      
      {children}
    </div>
  );
}
