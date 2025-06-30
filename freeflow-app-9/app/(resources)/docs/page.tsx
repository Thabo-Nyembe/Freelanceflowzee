'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DemoModal } from '@/components/demo-modal'
import { 
  BookOpen, 
  Search, 
  Star, 
  Clock,
  User,
  ArrowRight,
  FileText,
  Video,
  Code,
  Lightbulb,
  HelpCircle,
  Zap,
  Target,
  Users
} from 'lucide-react'

const docCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Quick start guides and basic concepts',
    icon: Zap,
    color: 'bg-green-500',
    docs: [
      { title: 'Quick Start Guide', time: '5 min read', type: 'guide' },
      { title: 'Installation & Setup', time: '10 min read', type: 'guide' },
      { title: 'Your First Project', time: '15 min read', type: 'tutorial' }
    ]
  },
  {
    id: 'features',
    title: 'Features',
    description: 'Detailed feature documentation',
    icon: Target,
    color: 'bg-blue-500',
    docs: [
      { title: 'AI Content Generation', time: '8 min read', type: 'guide' },
      { title: 'Collaboration Tools', time: '12 min read', type: 'guide' },
      { title: 'File Management', time: '6 min read', type: 'guide' }
    ]
  },
  {
    id: 'tutorials',
    title: 'Tutorials',
    description: 'Step-by-step tutorials and workflows',
    icon: BookOpen,
    color: 'bg-purple-500',
    docs: [
      { title: 'Building Your First Workflow', time: '20 min read', type: 'tutorial' },
      { title: 'Advanced AI Techniques', time: '25 min read', type: 'tutorial' },
      { title: 'Team Collaboration Setup', time: '18 min read', type: 'tutorial' }
    ]
  },
  {
    id: 'api',
    title: 'API Reference',
    description: 'Complete API documentation',
    icon: Code,
    color: 'bg-orange-500',
    docs: [
      { title: 'Authentication', time: '3 min read', type: 'reference' },
      { title: 'Projects API', time: '5 min read', type: 'reference' },
      { title: 'Files API', time: '4 min read', type: 'reference' }
    ]
  }
]

const quickLinks = [
  { title: 'API Documentation', href: '/api-docs', icon: Code },
  { title: 'Video Tutorials', href: '#', icon: Video },
  { title: 'Community Forum', href: '/community', icon: Users },
  { title: 'Support Center', href: '#', icon: HelpCircle }
]

const popularDocs = [
  { title: 'Getting Started with AI Tools', views: '2.5k', rating: 4.8 },
  { title: 'Team Collaboration Best Practices', views: '1.8k', rating: 4.9 },
  { title: 'API Integration Guide', views: '1.2k', rating: 4.7 },
  { title: 'Workflow Automation', views: '950', rating: 4.6 }
]

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDemoModal, setShowDemoModal] = useState(false)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide': return 'bg-blue-100 text-blue-800'
      case 'tutorial': return 'bg-green-100 text-green-800'
      case 'reference': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Documentation</h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Everything you need to know about using FreeflowZee effectively
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-lg bg-white text-gray-900 border-0 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}"
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="flex items-center gap-3 p-4 rounded-lg border hover:shadow-md transition-shadow"
                >"
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <link.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">{link.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Documentation Categories */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
              
              <div className="space-y-8">
                {docCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 ${category.color} rounded-lg`}>
                          <category.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                          <p className="text-gray-600 text-sm">{category.description}</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.docs.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{doc.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={getTypeColor(doc.type)}>
                                {doc.type}
                              </Badge>
                              <span className="text-sm text-gray-500">{doc.time}</span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Popular Docs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Popular Docs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularDocs.map((doc, index) => (
                      <div key={index} className="cursor-pointer hover:bg-gray-50 rounded-lg p-3 transition-colors">
                        <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{doc.views} views</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span>{doc.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Get Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => setShowDemoModal(true)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowDemoModal(true)}
                    >"
                      <Video className="w-4 h-4 mr-2" />
                      Watch Tutorials
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Latest Updates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-500" />
                    Latest Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { title: 'New AI Features Released', date: 'Jan 15' },
                      { title: 'API v2.0 Documentation', date: 'Jan 10' },
                      { title: 'Collaboration Tools Update', date: 'Jan 5' }
                    ].map((update, index) => (
                      <div key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                        <span className="font-medium text-gray-900 text-sm">{update.title}</span>
                        <span className="text-xs text-gray-500">{update.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6">
              Follow our step-by-step guides to make the most of FreeflowZee
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => setShowDemoModal(true)}
            >"
              <BookOpen className="w-5 h-5 mr-2" />
              Start Learning
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
      <DemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
        title="Get Started with FreeflowZee
        description="Access tutorials, documentation, and support resources
      />
    </div>
  )
}
