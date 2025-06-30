'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function DemoFeatureShowcase() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const features = [
    {
      id: 'projects',
      title: 'Project Management',
      description: 'Manage client projects with real-time collaboration',
      icon: FileText,
      color: 'bg-blue-500',
      metrics: { active: 12, completed: 47, revenue: '$45.6K' },
      demoUrl: '/dashboard/projects-hub'
    },
    {
      id: 'community',
      title: 'Community Hub',
      description: 'Connect with freelancers and share knowledge',
      icon: Users,
      color: 'bg-purple-500',
      metrics: { members: 1247, posts: 89, engagement: '94%' },
      demoUrl: '/dashboard/community'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Track performance with detailed insights',
      icon: BarChart3,
      color: 'bg-green-500',
      metrics: { views: '12.4K', conversion: '8.2%', growth: '+15%' },
      demoUrl: '/dashboard/analytics'
    },
    {
      id: 'escrow',
      title: 'Secure Escrow',
      description: 'Safe payment processing for all transactions',
      icon: DollarSign,
      color: 'bg-emerald-500',
      metrics: { secured: '$127K', transactions: 156, success: '99.8%' },
      demoUrl: '/dashboard/escrow'
    },
    {
      id: 'calendar',
      title: 'Smart Calendar',
      description: 'Schedule and manage your time effectively',
      icon: Calendar,
      color: 'bg-orange-500',
      metrics: { meetings: 24, upcoming: 8, efficiency: '92%' },
      demoUrl: '/dashboard/calendar'
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      description: 'Get intelligent help with your work',
      icon: Zap,
      color: 'bg-yellow-500',
      metrics: { queries: 342, accuracy: '96%', time_saved: '4.2h' },
      demoUrl: '/dashboard/ai-assistant'
    }
  ];

  return (
    <div className= "demo-feature-showcase mb-8">
      <div className= "flex items-center justify-between mb-6">
        <div>
          <h2 className= "text-2xl font-bold">Feature Showcase</h2>
          <p className= "text-gray-600">Experience FreeflowZee&apos;s powerful features with live demo data</p>
        </div>
        <Badge variant= "secondary" className= "bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          🎭 Interactive Demos Available
        </Badge>
      </div>

      <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card 
            key={feature.id} 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer group
            onClick={() => setActiveDemo(feature.id)}
          >
            <CardHeader>"
              <div className= "flex items-center justify-between">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  <feature.icon className= "h-6 w-6 text-white" />
                </div>
                <div className= "flex gap-2">
                  <Button size= "sm" variant= "ghost" className= "opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className= "h-4 w-4" />
                  </Button>
                  <Button size= "sm" variant= "ghost" className= "opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className= "h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className= "text-lg">{feature.title}</CardTitle>
              <p className= "text-sm text-gray-600">{feature.description}</p>
            </CardHeader>
            <CardContent>
              <div className= "space-y-3">
                <div className= "grid grid-cols-3 gap-2 text-center">
                  {Object.entries(feature.metrics).map(([key, value]) => (
                    <div key={key} className= "p-2 bg-gray-50 rounded-lg">
                      <div className= "text-sm font-bold">{value}</div>
                      <div className= "text-xs text-gray-500 capitalize">{key.replace(&apos;_', &apos; ')}</div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                  variant="outline
                  onClick={(e) => {
                    e.stopPropagation();"
                    window.open(feature.demoUrl, '_blank');
                  }}
                >
                  Try Demo
                  <ArrowRight className= "ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeDemo && (
        <div className= "mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className= "flex items-center justify-between">
            <div>
              <h3 className= "font-semibold text-blue-900">
                Demo Mode: {features.find(f => f.id === activeDemo)?.title}
              </h3>
              <p className= "text-blue-700 text-sm">
                Click "Try Demo" to experience this feature with realistic data
              </p>
            </div>
            <Button 
              variant= "outline" 
              size= "sm
              onClick={() => setActiveDemo(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}