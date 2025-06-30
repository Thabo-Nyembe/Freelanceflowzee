'use client'

import React from 'react';
import { useDashboardMetrics, useCommunityMetrics } from './demo-content-provider';

export function DemoEnhancedOverview() {
  const dashboardMetrics = useDashboardMetrics();
  const communityMetrics = useCommunityMetrics();

  if (!dashboardMetrics) {
    return <div className= "animate-pulse">Loading overview...</div>;
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: dashboardMetrics?.totalRevenue || '$45,630',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600
    },
    {
      title: 'Active Projects',
      value: dashboardMetrics?.activeProjects || '12',
      change: '+3',
      icon: FileText,
      color: 'text-blue-600
    },
    {
      title: 'Community Engagement',
      value: communityMetrics?.totalEngagement || '1,247',
      change: '+8.2%',
      icon: Users,
      color: 'text-purple-600
    },
    {
      title: 'Completion Rate',
      value: dashboardMetrics?.completionRate || '94.2%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'text-emerald-600
    }
  ];

  return (
    <div className= "demo-overview-section mb-8">
      <div className= "flex items-center justify-between mb-6">
        <h2 className= "text-2xl font-bold">Dashboard Overview</h2>
        <div className= "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          🎭 Demo Mode
        </div>
      </div>
      
      <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index} className= "hover:shadow-lg transition-shadow">
            <CardHeader className= "flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className= "text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className= "text-2xl font-bold">{metric.value}</div>
              <p className= "text-xs text-muted-foreground">
                <span className= "text-green-600">{metric.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className= "grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className= "flex items-center gap-2">
              <Clock className= "h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className= "space-y-4">
              {[
                { title: 'New project "Brand Identity" started', time: '2 hours ago' },
                { title: 'Payment received from Client A', time: '4 hours ago' },
                { title: 'File uploaded to "Creative Assets", time: '6 hours ago' },
                { title: 'Project "Website Redesign" completed', time: '1 day ago' },
                { title: 'New team member joined', time: '2 days ago' }
              ].map((activity, index) => (
                <div key={index} className= "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className= "w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className= "flex-1">
                    <p className= "text-sm font-medium">{activity.title}</p>
                    <p className= "text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className= "flex items-center gap-2">
              <Star className= "h-5 w-5" />
              Top Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className= "space-y-4">
              {[
                { title: 'Brand Identity Package', client: 'TechStart Inc.', value: '$2,500', status: 'In Progress' },
                { title: 'Website Redesign', client: 'Local Business', value: '$1,800', status: 'Review' },
                { title: 'Logo Design', client: 'Startup Co.', value: '$750', status: 'Completed' },
                { title: 'Marketing Materials', client: 'Enterprise Corp', value: '$3,200', status: 'Planning' }
              ].map((project, index) => (
                <div key={index} className= "flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className= "text-sm font-medium">{project.title}</p>
                    <p className= "text-xs text-gray-500">{project.client}</p>
                  </div>
                  <div className= "text-right">
                    <p className= "text-sm font-bold text-green-600">{project.value}</p>
                    <p className= "text-xs text-gray-500">{project.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}