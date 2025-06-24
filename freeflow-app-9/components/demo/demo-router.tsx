'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientPresentationDemo } from './client-presentation-demo';
import { InvestorDemo } from './investor-demo';
import { FreelancerOnboardingDemo } from './freelancer-onboarding-demo';
import { FeatureWalkthroughDemo } from './feature-walkthrough-demo';
import { Users, TrendingUp, Briefcase, Map } from 'lucide-react';

export function DemoRouter() {
  const [activeDemo, setActiveDemo] = useState<any>(null);

  const demoScenarios = [
    {
      id: 'client',
      title: 'Client Presentation',
      description: 'Professional demo for potential clients',
      icon: Users,
      color: 'bg-blue-500',
      audience: 'Business clients, decision makers',
      duration: '10-15 minutes',
      component: ClientPresentationDemo
    },
    {
      id: 'investor', 
      title: 'Investor Pitch',
      description: 'Growth metrics and market opportunity',
      icon: TrendingUp,
      color: 'bg-green-500',
      audience: 'Investors, stakeholders',
      duration: '15-20 minutes',
      component: InvestorDemo
    },
    {
      id: 'freelancer',
      title: 'Freelancer Onboarding',
      description: 'Platform walkthrough for new freelancers',
      icon: Briefcase,
      color: 'bg-purple-500',
      audience: 'Freelancers, service providers',
      duration: '8-12 minutes',
      component: FreelancerOnboardingDemo
    },
    {
      id: 'walkthrough',
      title: 'Feature Walkthrough',
      description: 'Interactive tour of key features',
      icon: Map,
      color: 'bg-orange-500',
      audience: 'Product evaluators, new users',
      duration: '12-18 minutes',
      component: FeatureWalkthroughDemo
    }
  ];

  if (activeDemo) {
    const DemoComponent = activeDemo.component;
    return (
      <div className="min-h-screen">
        <div className="p-4 bg-gray-100 border-b">
          <Button variant="outline" onClick={() => setActiveDemo(null)}>
            ← Back to Demo Selection
          </Button>
        </div>
        <DemoComponent />
      </div>
    );
  }

  return (
    <div className="demo-router p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">FreeflowZee Demo Center</h1>
          <p className="text-gray-600 text-lg">Choose your demo scenario based on your audience</p>
          <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            🎭 Interactive Demos Available
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demoScenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-xl transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${scenario.color}`}>
                    <scenario.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{scenario.title}</CardTitle>
                    <p className="text-gray-600">{scenario.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Target Audience:</div>
                    <div className="text-sm text-gray-600">{scenario.audience}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Duration:</div>
                    <div className="text-sm text-gray-600">{scenario.duration}</div>
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                    variant="outline"
                    onClick={() => setActiveDemo(scenario)}
                  >
                    Start Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-blue-900 mb-2">Demo Tips</h3>
              <div className="text-blue-700 text-sm space-y-1">
                <p>• Each demo uses real data from our content population system</p>
                <p>• Demos are optimized for different audience types and use cases</p>
                <p>• All metrics and showcased features are based on actual platform capabilities</p>
                <p>• Use the navigation controls to pace your presentation effectively</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}