'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Book,
  Search,
  FileText,
  Video,
  Code,
  Settings,
  CreditCard,
  Users,
  Shield,
  BarChart3,
  Zap,
  Globe,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Clock,
  Star,
  Download,
  Play
} from 'lucide-react'

const docCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    description: 'Quick start guides and basic setup',
    articles: [
      { title: 'Account Setup', time: '5 min', difficulty: 'Beginner' },
      { title: 'First Project Creation', time: '10 min', difficulty: 'Beginner' },
      { title: 'Inviting Your First Client', time: '5 min', difficulty: 'Beginner' },
      { title: 'Basic Customization', time: '15 min', difficulty: 'Beginner' }
    ]
  },
  {
    id: 'project-management',
    title: 'Project Management',
    icon: FileText,
    description: 'Managing projects, files, and workflows',
    articles: [
      { title: 'Creating Project Templates', time: '20 min', difficulty: 'Intermediate' },
      { title: 'File Organization Best Practices', time: '15 min', difficulty: 'Beginner' },
      { title: 'Version Control System', time: '25 min', difficulty: 'Advanced' },
      { title: 'Collaboration Features', time: '30 min', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Billing',
    icon: CreditCard,
    description: 'Payment processing and financial management',
    articles: [
      { title: 'Setting Up Stripe Integration', time: '15 min', difficulty: 'Intermediate' },
      { title: 'Creating Payment Links', time: '10 min', difficulty: 'Beginner' },
      { title: 'Managing Invoices', time: '20 min', difficulty: 'Intermediate' },
      { title: 'Tax Configuration', time: '25 min', difficulty: 'Advanced' }
    ]
  },
  {
    id: 'customization',
    title: 'Customization',
    icon: Settings,
    description: 'Branding and appearance customization',
    articles: [
      { title: 'Brand Settings', time: '15 min', difficulty: 'Beginner' },
      { title: 'Custom Domains', time: '30 min', difficulty: 'Advanced' },
      { title: 'White Label Setup', time: '45 min', difficulty: 'Advanced' },
      { title: 'Theme Customization', time: '20 min', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'client-management',
    title: 'Client Management',
    icon: Users,
    description: 'Managing clients and communications',
    articles: [
      { title: 'Client Portal Setup', time: '20 min', difficulty: 'Intermediate' },
      { title: 'Access Controls', time: '15 min', difficulty: 'Intermediate' },
      { title: 'Communication Tools', time: '25 min', difficulty: 'Beginner' },
      { title: 'Feedback Management', time: '20 min', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: BarChart3,
    description: 'Tracking performance and generating reports',
    articles: [
      { title: 'Dashboard Overview', time: '10 min', difficulty: 'Beginner' },
      { title: 'Custom Reports', time: '30 min', difficulty: 'Advanced' },
      { title: 'Revenue Tracking', time: '20 min', difficulty: 'Intermediate' },
      { title: 'Client Insights', time: '25 min', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: Shield,
    description: 'Security features and privacy settings',
    articles: [
      { title: 'Two-Factor Authentication', time: '10 min', difficulty: 'Beginner' },
      { title: 'Password Protection', time: '15 min', difficulty: 'Beginner' },
      { title: 'GDPR Compliance', time: '30 min', difficulty: 'Advanced' },
      { title: 'Data Backup & Recovery', time: '25 min', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'api',
    title: 'API & Integrations',
    icon: Code,
    description: 'API documentation and third-party integrations',
    articles: [
      { title: 'API Getting Started', time: '20 min', difficulty: 'Advanced' },
      { title: 'Webhook Configuration', time: '30 min', difficulty: 'Advanced' },
      { title: 'Third-party Integrations', time: '25 min', difficulty: 'Intermediate' },
      { title: 'Custom Integrations', time: '45 min', difficulty: 'Advanced' }
    ]
  }
]

const popularArticles = [
  { title: 'How to Set Up Your First Project', views: '12.5k', category: 'Getting Started' },
  { title: 'Payment Integration Guide', views: '8.2k', category: 'Payments' },
  { title: 'Custom Branding Setup', views: '6.8k', category: 'Customization' },
  { title: 'Client Feedback Management', views: '5.4k', category: 'Client Management' },
  { title: 'Analytics Dashboard Overview', views: '4.9k', category: 'Analytics' }
]

const quickLinks = [
  { title: 'Video Tutorials', icon: Video, href: '/tutorials', description: 'Step-by-step video guides' },
  { title: 'API Reference', icon: Code, href: '/api-docs', description: 'Complete API documentation' },
  { title: 'Community Forum', icon: Users, href: '/community', description: 'Get help from the community' },
  { title: 'Get Support', icon: Download, href: '/support', description: 'Contact our support team' }
]

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('getting-started')

  const filteredCategories = docCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const selectedCategoryData = docCategories.find(cat => cat.id === selectedCategory)

  const handleArticleClick = (article: string) => {
    alert(`Opening article: ${article}. Full documentation coming soon!`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Book className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Documentation
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Everything you need to know about using FreeflowZee. From quick start guides 
                to advanced customization, we've got you covered.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search documentation..."
                  className="pl-12 pr-4 py-3 text-lg bg-white border-gray-300 focus:border-blue-500 rounded-lg shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">20+</div>
                <div className="text-gray-600">Video Guides</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Quick Access
              </h2>
              <p className="text-lg text-gray-600">
                Jump to the most commonly used resources
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="text-center">
                      <link.icon className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <CardTitle className="text-lg group-hover:text-blue-600">
                        {link.title}
                      </CardTitle>
                      <CardDescription>{link.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700">
                        <span className="mr-2">Access</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Popular Articles
              </h2>
              <p className="text-lg text-gray-600">
                Most viewed documentation articles
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {popularArticles.map((article, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleArticleClick(article.title)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{article.title}</h3>
                          <p className="text-sm text-gray-600">{article.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Star className="w-4 h-4" />
                          <span>{article.views} views</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Documentation Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-gray-600">
                Find documentation organized by topic
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Category Navigation */}
              <div className="lg:col-span-1">
                <div className="space-y-2">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <category.icon className="w-5 h-5" />
                        <span className="font-medium">{category.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Content */}
              <div className="lg:col-span-3">
                {selectedCategoryData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center space-x-3">
                        <selectedCategoryData.icon className="w-8 h-8 text-blue-600" />
                        <span>{selectedCategoryData.title}</span>
                      </CardTitle>
                      <CardDescription className="text-lg">
                        {selectedCategoryData.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedCategoryData.articles.map((article, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => handleArticleClick(article.title)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">{article.title}</h4>
                              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{article.time}</span>
                              </div>
                              <Badge className={getDifficultyColor(article.difficulty)}>
                                {article.difficulty}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Need More Help?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/community">
                <Button size="lg" variant="outline">
                  <Users className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 