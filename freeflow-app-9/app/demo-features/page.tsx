'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FolderOpen, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  BarChart3,
  Play,
  Eye,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function FeatureDemoPage() {
  const [stats, setStats] = useState({
    users: 15,
    projects: 15,
    posts: 25,
    files: 81,
    transactions: 10
  });

  const features = [
    {
      title: 'Dashboard Overview',
      description: 'Comprehensive metrics and project insights with real data',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      href: '/dashboard',
      stats: 'Live Analytics'
    },
    {
      title: 'Projects Hub',
      description: 'Real client projects with authentic details and workflows',
      icon: FolderOpen,
      color: 'from-green-500 to-green-600',
      href: '/dashboard?tab=projects',
      stats: stats.projects + ' Projects'
    },
    {
      title: 'Community Hub',
      description: 'Social posts and creator marketplace with engagement',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      href: '/dashboard?tab=community',
      stats: stats.posts + ' Posts'
    },
    {
      title: 'Files Hub',
      description: 'Multi-format file management with realistic content',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      href: '/dashboard?tab=files',
      stats: stats.files + ' Files'
    },
    {
      title: 'Escrow System',
      description: 'Secure payment protection with active transactions',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      href: '/dashboard?tab=escrow',
      stats: stats.transactions + ' Transactions'
    },
    {
      title: 'AI Create',
      description: 'AI-powered content generation and automation tools',
      icon: Sparkles,
      color: 'from-violet-500 to-violet-600',
      href: '/dashboard?tab=ai-create',
      stats: 'AI Powered'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            FreeflowZee Feature Demonstrations
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-6">
            Experience all platform features with realistic, populated content showcasing comprehensive capabilities
          </p>
          
          {/* Content Statistics */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-4 py-2">
              <Eye className="h-4 w-4 mr-2" />
              {stats.users} Demo Users
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-2">
              <FolderOpen className="h-4 w-4 mr-2" />
              {stats.projects} Projects
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-4 py-2">
              <MessageSquare className="h-4 w-4 mr-2" />
              {stats.posts} Posts
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              {stats.files} Files
            </Badge>
          </div>

          <Button 
            onClick={() => window.open('/dashboard', '_blank')}
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3"
          >
            <Play className="h-5 w-5 mr-2" />
            Launch Full Dashboard Demo
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-xl border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.stats}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-violet-600 transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-violet-50 group-hover:border-violet-200 transition-colors"
                  onClick={() => window.open(feature.href, '_blank')}
                >
                  Explore Feature
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Information */}
        <div className="bg-white/60 backdrop-blur-xl border-white/20 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Demo Content Features</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-violet-600">Realistic Data</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Authentic user profiles from real APIs</li>
                <li>• Professional project portfolios</li>
                <li>• Engaging community content</li>
                <li>• Diverse file types and formats</li>
                <li>• Active financial transactions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-violet-600">Enterprise Features</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Advanced analytics and reporting</li>
                <li>• Secure escrow transaction system</li>
                <li>• AI-powered content generation</li>
                <li>• Collaborative project management</li>
                <li>• Professional creator marketplace</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-slate-600 mb-4">
              All features are populated with realistic content for comprehensive testing and demonstration
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => window.open('/api/demo/content', '_blank')}>
                View API Documentation
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Demo Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}