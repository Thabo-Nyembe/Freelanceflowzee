'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  HelpCircle, Search, BookOpen, FileText, MessageCircle, ThumbsUp, ThumbsDown,
  ChevronRight, ChevronDown, Plus, Eye, Clock, Star, TrendingUp, Users,
  FolderOpen, Tag, Filter, MoreHorizontal, ExternalLink, Share2, Bookmark,
  Edit, Trash2, AlertCircle, CheckCircle, ArrowRight, Home, Layers, Settings,
  MessageSquare, Globe, Lock, Zap, Phone, Mail, Video, Headphones
} from 'lucide-react'

// Zendesk Help Center level interfaces
interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  section: string
  status: 'published' | 'draft' | 'archived' | 'review'
  author: {
    name: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
  views: number
  helpfulVotes: number
  notHelpfulVotes: number
  comments: number
  tags: string[]
  isFeatured: boolean
  isPromoted: boolean
  relatedArticles: string[]
  language: string
  readTime: number
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  articleCount: number
  sections: Section[]
  order: number
  isVisible: boolean
}

interface Section {
  id: string
  categoryId: string
  name: string
  description: string
  articleCount: number
  order: number
}

interface SearchResult {
  id: string
  title: string
  excerpt: string
  category: string
  relevanceScore: number
}

interface TicketForm {
  subject: string
  description: string
  category: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  email: string
}

interface CommunityPost {
  id: string
  title: string
  content: string
  author: { name: string; avatar: string }
  createdAt: string
  replies: number
  votes: number
  isAnswered: boolean
  isSolved: boolean
}

// Mock categories
const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Getting Started',
    description: 'Learn the basics and set up your account',
    icon: '🚀',
    articleCount: 24,
    sections: [
      { id: 's1', categoryId: 'cat1', name: 'Quick Start Guide', description: 'Get up and running in minutes', articleCount: 8, order: 1 },
      { id: 's2', categoryId: 'cat1', name: 'Account Setup', description: 'Configure your account settings', articleCount: 6, order: 2 },
      { id: 's3', categoryId: 'cat1', name: 'First Steps', description: 'Your first actions in the platform', articleCount: 10, order: 3 }
    ],
    order: 1,
    isVisible: true
  },
  {
    id: 'cat2',
    name: 'Billing & Payments',
    description: 'Manage subscriptions, invoices, and payments',
    icon: '💳',
    articleCount: 18,
    sections: [
      { id: 's4', categoryId: 'cat2', name: 'Subscription Plans', description: 'Compare and choose plans', articleCount: 5, order: 1 },
      { id: 's5', categoryId: 'cat2', name: 'Payment Methods', description: 'Add and manage payment methods', articleCount: 7, order: 2 },
      { id: 's6', categoryId: 'cat2', name: 'Invoices', description: 'View and download invoices', articleCount: 6, order: 3 }
    ],
    order: 2,
    isVisible: true
  },
  {
    id: 'cat3',
    name: 'Troubleshooting',
    description: 'Solve common problems and errors',
    icon: '🔧',
    articleCount: 32,
    sections: [
      { id: 's7', categoryId: 'cat3', name: 'Common Issues', description: 'Solutions to frequent problems', articleCount: 15, order: 1 },
      { id: 's8', categoryId: 'cat3', name: 'Error Messages', description: 'Understanding error codes', articleCount: 12, order: 2 },
      { id: 's9', categoryId: 'cat3', name: 'Performance', description: 'Speed and optimization tips', articleCount: 5, order: 3 }
    ],
    order: 3,
    isVisible: true
  },
  {
    id: 'cat4',
    name: 'API & Developers',
    description: 'Technical documentation and API reference',
    icon: '👨‍💻',
    articleCount: 45,
    sections: [
      { id: 's10', categoryId: 'cat4', name: 'API Reference', description: 'Complete API documentation', articleCount: 20, order: 1 },
      { id: 's11', categoryId: 'cat4', name: 'SDKs & Libraries', description: 'Official client libraries', articleCount: 15, order: 2 },
      { id: 's12', categoryId: 'cat4', name: 'Webhooks', description: 'Event notifications setup', articleCount: 10, order: 3 }
    ],
    order: 4,
    isVisible: true
  },
  {
    id: 'cat5',
    name: 'Best Practices',
    description: 'Tips and recommendations for success',
    icon: '⭐',
    articleCount: 22,
    sections: [
      { id: 's13', categoryId: 'cat5', name: 'Security', description: 'Keep your account secure', articleCount: 8, order: 1 },
      { id: 's14', categoryId: 'cat5', name: 'Workflows', description: 'Optimize your processes', articleCount: 14, order: 2 }
    ],
    order: 5,
    isVisible: true
  }
]

// Mock articles
const mockArticles: Article[] = [
  {
    id: 'art1',
    title: 'How to create your first project',
    excerpt: 'Learn how to set up and configure your first project in just a few simple steps.',
    content: 'Full article content here...',
    category: 'Getting Started',
    section: 'Quick Start Guide',
    status: 'published',
    author: { name: 'Sarah Chen', avatar: '' },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    views: 12500,
    helpfulVotes: 450,
    notHelpfulVotes: 12,
    comments: 28,
    tags: ['getting-started', 'projects', 'setup'],
    isFeatured: true,
    isPromoted: true,
    relatedArticles: ['art2', 'art3'],
    language: 'en',
    readTime: 5
  },
  {
    id: 'art2',
    title: 'Understanding your billing dashboard',
    excerpt: 'A comprehensive guide to managing your subscription, viewing invoices, and updating payment methods.',
    content: 'Full article content here...',
    category: 'Billing & Payments',
    section: 'Subscription Plans',
    status: 'published',
    author: { name: 'Mike Johnson', avatar: '' },
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-14T11:00:00Z',
    views: 8900,
    helpfulVotes: 320,
    notHelpfulVotes: 8,
    comments: 15,
    tags: ['billing', 'payments', 'subscription'],
    isFeatured: false,
    isPromoted: false,
    relatedArticles: ['art1'],
    language: 'en',
    readTime: 8
  },
  {
    id: 'art3',
    title: 'Fixing "Connection Timeout" errors',
    excerpt: 'Step-by-step guide to diagnose and resolve connection timeout issues.',
    content: 'Full article content here...',
    category: 'Troubleshooting',
    section: 'Error Messages',
    status: 'published',
    author: { name: 'Emma Davis', avatar: '' },
    createdAt: '2024-01-12T15:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    views: 15600,
    helpfulVotes: 580,
    notHelpfulVotes: 25,
    comments: 42,
    tags: ['errors', 'connection', 'troubleshooting'],
    isFeatured: true,
    isPromoted: false,
    relatedArticles: ['art4'],
    language: 'en',
    readTime: 6
  },
  {
    id: 'art4',
    title: 'REST API Authentication Guide',
    excerpt: 'Learn how to authenticate your API requests using OAuth 2.0 and API keys.',
    content: 'Full article content here...',
    category: 'API & Developers',
    section: 'API Reference',
    status: 'published',
    author: { name: 'Alex Kim', avatar: '' },
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-13T16:00:00Z',
    views: 22000,
    helpfulVotes: 890,
    notHelpfulVotes: 15,
    comments: 65,
    tags: ['api', 'authentication', 'oauth', 'security'],
    isFeatured: true,
    isPromoted: true,
    relatedArticles: ['art5'],
    language: 'en',
    readTime: 12
  },
  {
    id: 'art5',
    title: 'Security best practices for your account',
    excerpt: 'Essential security measures to protect your account and data.',
    content: 'Full article content here...',
    category: 'Best Practices',
    section: 'Security',
    status: 'published',
    author: { name: 'Sarah Chen', avatar: '' },
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
    views: 9800,
    helpfulVotes: 410,
    notHelpfulVotes: 5,
    comments: 18,
    tags: ['security', 'best-practices', '2fa', 'passwords'],
    isFeatured: false,
    isPromoted: false,
    relatedArticles: ['art4'],
    language: 'en',
    readTime: 7
  }
]

// Mock community posts
const mockCommunityPosts: CommunityPost[] = [
  { id: 'cp1', title: 'How do I integrate with Slack?', content: 'Looking for guidance on Slack integration...', author: { name: 'John Doe', avatar: '' }, createdAt: '2024-01-15T10:00:00Z', replies: 5, votes: 12, isAnswered: true, isSolved: true },
  { id: 'cp2', title: 'Best practices for team collaboration', content: 'What are your recommendations for team workflows?', author: { name: 'Jane Smith', avatar: '' }, createdAt: '2024-01-14T15:00:00Z', replies: 8, votes: 24, isAnswered: true, isSolved: false },
  { id: 'cp3', title: 'Feature request: Dark mode', content: 'Would love to see dark mode support...', author: { name: 'Bob Wilson', avatar: '' }, createdAt: '2024-01-13T09:00:00Z', replies: 15, votes: 89, isAnswered: false, isSolved: false }
]

export default function HelpDocsClient() {
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showArticleDialog, setShowArticleDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['cat1'])

  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'archived': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'review': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  const calculateHelpfulness = (helpful: number, notHelpful: number) => {
    const total = helpful + notHelpful
    if (total === 0) return 0
    return Math.round((helpful / total) * 100)
  }

  const stats = useMemo(() => ({
    totalArticles: mockArticles.length,
    totalCategories: mockCategories.length,
    totalViews: mockArticles.reduce((sum, a) => sum + a.views, 0),
    avgHelpfulness: mockArticles.reduce((sum, a) => sum + calculateHelpfulness(a.helpfulVotes, a.notHelpfulVotes), 0) / mockArticles.length
  }), [])

  const featuredArticles = mockArticles.filter(a => a.isFeatured)
  const promotedArticles = mockArticles.filter(a => a.isPromoted)
  const popularArticles = [...mockArticles].sort((a, b) => b.views - a.views).slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-sky-100 text-lg">Search our knowledge base or browse categories below</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                placeholder="Search articles, guides, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-14 text-lg bg-white border-0 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <Zap className="w-4 h-4 mr-2" />
              Quick Start
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <FileText className="w-4 h-4 mr-2" />
              API Docs
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <MessageCircle className="w-4 h-4 mr-2" />
              Community
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowContactDialog(true)}>
              <Headphones className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              All Articles
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-8">
            {/* Categories Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
              <div className="grid grid-cols-5 gap-4">
                {mockCategories.map(category => (
                  <Card
                    key={category.id}
                    className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => { setSelectedCategory(category); setActiveTab('categories'); }}
                  >
                    <span className="text-4xl mb-3 block">{category.icon}</span>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.articleCount} articles</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Articles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Featured Articles</h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {featuredArticles.map(article => (
                  <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedArticle(article); setShowArticleDialog(true); }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>
                      {article.isPromoted && <Badge className="bg-purple-100 text-purple-700">Promoted</Badge>}
                    </div>
                    <h3 className="font-semibold mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {calculateHelpfulness(article.helpfulVotes, article.notHelpfulVotes)}% helpful
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} min
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <h2 className="text-xl font-semibold mb-4">Popular Articles</h2>
                <Card>
                  {popularArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${index < popularArticles.length - 1 ? 'border-b' : ''}`}
                      onClick={() => { setSelectedArticle(article); setShowArticleDialog(true); }}
                    >
                      <span className="text-2xl font-bold text-gray-300 w-8">{index + 1}</span>
                      <div className="flex-1">
                        <h3 className="font-medium">{article.title}</h3>
                        <p className="text-sm text-gray-500">{article.category}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p className="font-medium">{article.views.toLocaleString()} views</p>
                        <p>{calculateHelpfulness(article.helpfulVotes, article.notHelpfulVotes)}% helpful</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </Card>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
                <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Live Chat</h3>
                        <p className="text-sm text-gray-500">Chat with our team</p>
                      </div>
                    </div>
                    <Button className="w-full" size="sm">Start Chat</Button>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Email Support</h3>
                        <p className="text-sm text-gray-500">Get help via email</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">Send Email</Button>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Video Tutorials</h3>
                        <p className="text-sm text-gray-500">Watch and learn</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">Browse Videos</Button>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-1">
                      {mockCategories.map(category => (
                        <div key={category.id}>
                          <div
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedCategory?.id === category.id ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => {
                              setSelectedCategory(category)
                              toggleCategoryExpand(category.id)
                            }}
                          >
                            <span>{category.icon}</span>
                            <span className="flex-1 font-medium">{category.name}</span>
                            <Badge variant="outline" className="text-xs">{category.articleCount}</Badge>
                            {expandedCategories.includes(category.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                          {expandedCategories.includes(category.id) && (
                            <div className="ml-8 space-y-1 mt-1">
                              {category.sections.map(section => (
                                <div key={section.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm">
                                  <span>{section.name}</span>
                                  <span className="text-gray-500">{section.articleCount}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              <div className="col-span-3">
                {selectedCategory ? (
                  <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl">{selectedCategory.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
                        <p className="text-gray-500">{selectedCategory.description}</p>
                      </div>
                    </div>

                    {selectedCategory.sections.map(section => (
                      <div key={section.id} className="mb-6">
                        <h3 className="font-semibold mb-3">{section.name}</h3>
                        <div className="space-y-2">
                          {mockArticles
                            .filter(a => a.section === section.name)
                            .map(article => (
                              <div
                                key={article.id}
                                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                onClick={() => { setSelectedArticle(article); setShowArticleDialog(true); }}
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{article.title}</h4>
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{article.excerpt}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </Card>
                ) : (
                  <Card className="p-12 text-center">
                    <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Category</h3>
                    <p className="text-gray-500">Choose a category from the left to view articles</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* All Articles Tab */}
          <TabsContent value="articles" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">All Articles ({mockArticles.length})</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              </div>
            </div>

            <Card>
              <ScrollArea className="h-[600px]">
                {mockArticles.map(article => (
                  <div
                    key={article.id}
                    className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => { setSelectedArticle(article); setShowArticleDialog(true); }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{article.title}</h3>
                          <Badge className={getStatusColor(article.status)}>{article.status}</Badge>
                          {article.isFeatured && <Star className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{article.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{article.category} / {article.section}</span>
                          <span className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px]">{article.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            {article.author.name}
                          </span>
                          <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{article.views.toLocaleString()} views</p>
                        <p className="text-gray-500">{calculateHelpfulness(article.helpfulVotes, article.notHelpfulVotes)}% helpful</p>
                      </div>
                    </div>
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Community Discussions</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                {mockCommunityPosts.map(post => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{post.title}</h3>
                          {post.isSolved && <Badge className="bg-green-100 text-green-700">Solved</Badge>}
                          {post.isAnswered && !post.isSolved && <Badge className="bg-blue-100 text-blue-700">Answered</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{post.author.name}</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span>{post.replies} replies</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {post.votes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Community Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Posts</span>
                      <span className="font-semibold">1,245</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Solved</span>
                      <span className="font-semibold text-green-600">892</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Active Users</span>
                      <span className="font-semibold">3,450</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Top Contributors</h3>
                  <div className="space-y-3">
                    {['Sarah Chen', 'Mike Johnson', 'Emma Davis'].map((name, i) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-300">{i + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Dialog */}
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <div>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(selectedArticle.status)}>{selectedArticle.status}</Badge>
                  {selectedArticle.isFeatured && <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>}
                </div>
                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
              </DialogHeader>

              <div className="flex items-center gap-4 text-sm text-gray-500 mt-4 mb-6">
                <span className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{selectedArticle.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {selectedArticle.author.name}
                </span>
                <span>Updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
                <span>{selectedArticle.readTime} min read</span>
              </div>

              <div className="prose dark:prose-invert mb-6">
                <p>{selectedArticle.excerpt}</p>
                <p className="text-gray-500">Full article content would be displayed here...</p>
              </div>

              <div className="flex flex-wrap gap-1 mb-6">
                {selectedArticle.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Was this article helpful?</h4>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    Yes ({selectedArticle.helpfulVotes})
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4" />
                    No ({selectedArticle.notHelpfulVotes})
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedArticle.views.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {selectedArticle.comments} comments
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold">Live Chat</h4>
                <p className="text-xs text-gray-500">Avg wait: 2 min</p>
              </Card>
              <Card className="p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">Email</h4>
                <p className="text-xs text-gray-500">Response: 24h</p>
              </Card>
              <Card className="p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <Phone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">Phone</h4>
                <p className="text-xs text-gray-500">24/7 available</p>
              </Card>
              <Card className="p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold">Submit Ticket</h4>
                <p className="text-xs text-gray-500">Track progress</p>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
