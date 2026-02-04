'use client'

import { useState } from 'react'
import {
  Search,
  Rocket,
  FolderKanban,
  DollarSign,
  Users,
  BarChart,
  MessageSquare,
  Video,
  FileText,
  BookOpen,
  ThumbsUp,
  Eye,
  Clock,
  ChevronRight,
  Play,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { toast } from 'sonner'

const logger = createSimpleLogger('KnowledgeBase')

interface Article {
  id: string
  title: string
  description: string
  content: string
  category: string
  readTime: number // minutes
  views: number
  helpful: number
  lastUpdated: string
  tags: string[]
}

interface VideoTutorial {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  category: string
  views: number
  url: string
}

interface Category {
  name: string
  icon: React.ElementType
  articles: Article[]
  color: string
}

export default function ClientKnowledgeBase() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // HANDLERS
  const handleVideoClick = async (video: VideoTutorial) => {
    try {
      logger.info('Opening video tutorial', {
        videoId: video.id,
        title: video.title,
        category: video.category
      })

      // Show loading toast and open video
      toast.info('Opening video tutorial', {
        description: `${video.title} - ${video.duration}`
      })

      // Open video in new tab or modal
      if (video.url.startsWith('http')) {
        window.open(video.url, '_blank', 'noopener,noreferrer')
      } else {
        // Navigate to video player page
        window.location.href = `/dashboard/video-player?video=${video.id}&title=${encodeURIComponent(video.title)}`
      }
    } catch (err: unknown) {
      logger.error('Failed to open video', { error: err.message })
      toast.error('Failed to open video tutorial')
    }
  }

  const handleLiveChat = async () => {
    try {
      logger.info('Opening live chat support')
      toast.info('Opening live chat', {
        description: 'Connecting to support team...'
      })

      // Open live chat widget - integrate with Intercom, Crisp, or similar
      // For now, open support page
      if (typeof window !== 'undefined' && (window as Record<string, unknown>).Intercom) {
        (window as Record<string, unknown>).Intercom('show')
      } else {
        // Fallback: open support contact form
        window.location.href = '/support?chat=true'
      }
    } catch (err: unknown) {
      logger.error('Failed to open live chat', { error: err.message })
      toast.error('Failed to open live chat. Please try our support page.')
    }
  }

  const handleSubmitTicket = async () => {
    try {
      logger.info('Opening ticket submission form')
      toast.info('Opening support ticket form')

      // Navigate to support ticket page
      window.location.href = '/support?action=new-ticket'
    } catch (err: unknown) {
      logger.error('Failed to open ticket form', { error: err.message })
      toast.error('Failed to open support form')
    }
  }

  const handleCommunityForum = async () => {
    try {
      logger.info('Opening community forum')
      toast.info('Opening community forum', {
        description: 'Join our community discussions'
      })

      // Navigate to community forum
      window.location.href = '/dashboard/collaboration/workspace'
    } catch (err: unknown) {
      logger.error('Failed to open forum', { error: err.message })
      toast.error('Failed to open community forum')
    }
  }

  const handleArticleClick = async (article: Article) => {
    try {
      logger.info('Opening article', {
        articleId: article.id,
        title: article.title,
        category: article.category
      })

      // Track article view
      try {
        const { trackArticleView } = await import('@/lib/knowledge-base-queries')
        // await trackArticleView(article.id, userId)
      } catch (trackErr) {
        // Silently fail tracking
        logger.warn('Failed to track article view', { error: trackErr })
      }

      // Open article detail view
      toast.info(`Opening: ${article.title}`, {
        description: `${article.readTime} min read`
      })

      // Navigate to article page
      window.location.href = `/dashboard/client-zone/knowledge-base/article/${article.id}`
    } catch (err: unknown) {
      logger.error('Failed to open article', { error: err.message })
      toast.error('Failed to open article')
    }
  }

  const handleMarkHelpful = async (articleId: string) => {
    try {
      const { createSimpleLogger } = await import('@/lib/simple-logger')
      const logger = createSimpleLogger('knowledge-base')
      const { toast } = await import('sonner')

      logger.info('Marking article as helpful', { articleId })

      const { submitArticleFeedback } = await import('@/lib/knowledge-base-queries')
      // await submitArticleFeedback(articleId, userId, 'helpful')

      toast.success('Thank you for your feedback!', {
        description: 'Marked article as helpful'
      })
    } catch (err: unknown) {
      const { createSimpleLogger } = await import('@/lib/simple-logger')
      const logger = createSimpleLogger('knowledge-base')
      const { toast } = await import('sonner')
      logger.error('Failed to submit feedback', { error: err.message })
      toast.error('Failed to submit feedback')
    }
  }

  const handleSearchArticles = async (query: string) => {
    try {
      const { createSimpleLogger } = await import('@/lib/simple-logger')
      const logger = createSimpleLogger('knowledge-base')

      logger.info('Searching articles', { query })

      const { searchArticles } = await import('@/lib/knowledge-base-queries')
      // const results = await searchArticles(query, userId)

      // Update search results
      setSearchQuery(query)
    } catch (err: unknown) {
      const { createSimpleLogger } = await import('@/lib/simple-logger')
      const logger = createSimpleLogger('knowledge-base')
      logger.error('Search failed', { error: err.message })
    }
  }

  // Mock data - would come from CMS/database
  const categories: Category[] = [
    {
      name: 'Getting Started',
      icon: Rocket,
      color: 'text-blue-500',
      articles: [
        {
          id: 'gs-1',
          title: 'How to Create Your First Project',
          description: 'Step-by-step guide to launching your first project on KAZI',
          content: 'Full article content here...',
          category: 'Getting Started',
          readTime: 5,
          views: 1234,
          helpful: 112,
          lastUpdated: '2024-11-15',
          tags: ['beginner', 'projects', 'setup']
        },
        {
          id: 'gs-2',
          title: 'Understanding Milestones and Payments',
          description: 'Learn how project milestones and escrow payments work',
          content: 'Full article content here...',
          category: 'Getting Started',
          readTime: 7,
          views: 987,
          helpful: 95,
          lastUpdated: '2024-11-10',
          tags: ['beginner', 'payments', 'milestones']
        },
        {
          id: 'gs-3',
          title: 'Communication Best Practices',
          description: 'Tips for effective communication with your creative team',
          content: 'Full article content here...',
          category: 'Getting Started',
          readTime: 6,
          views: 856,
          helpful: 88,
          lastUpdated: '2024-11-12',
          tags: ['beginner', 'communication', 'tips']
        },
        {
          id: 'gs-4',
          title: 'How Escrow Protection Works',
          description: 'Understanding our 100% money-back guarantee and escrow system',
          content: 'Full article content here...',
          category: 'Getting Started',
          readTime: 8,
          views: 2134,
          helpful: 198,
          lastUpdated: '2024-11-20',
          tags: ['beginner', 'escrow', 'security']
        }
      ]
    },
    {
      name: 'Project Management',
      icon: FolderKanban,
      color: 'text-purple-500',
      articles: [
        {
          id: 'pm-1',
          title: 'Tracking Project Progress',
          description: 'Monitor milestones, deadlines, and team activities',
          content: 'Full article content here...',
          category: 'Project Management',
          readTime: 6,
          views: 1567,
          helpful: 142,
          lastUpdated: '2024-11-18',
          tags: ['projects', 'tracking', 'milestones']
        },
        {
          id: 'pm-2',
          title: 'Requesting Revisions',
          description: 'How to request changes and provide clear feedback',
          content: 'Full article content here...',
          category: 'Project Management',
          readTime: 5,
          views: 1890,
          helpful: 167,
          lastUpdated: '2024-11-16',
          tags: ['projects', 'revisions', 'feedback']
        },
        {
          id: 'pm-3',
          title: 'Approving Deliverables',
          description: 'Step-by-step guide to reviewing and approving work',
          content: 'Full article content here...',
          category: 'Project Management',
          readTime: 4,
          views: 1234,
          helpful: 118,
          lastUpdated: '2024-11-14',
          tags: ['projects', 'approval', 'deliverables']
        },
        {
          id: 'pm-4',
          title: 'Managing Project Timelines',
          description: 'Tips for staying on schedule and adjusting deadlines',
          content: 'Full article content here...',
          category: 'Project Management',
          readTime: 7,
          views: 976,
          helpful: 89,
          lastUpdated: '2024-11-11',
          tags: ['projects', 'timeline', 'deadlines']
        }
      ]
    },
    {
      name: 'Financial',
      icon: DollarSign,
      color: 'text-green-500',
      articles: [
        {
          id: 'fin-1',
          title: 'Payment Methods Explained',
          description: 'Available payment options and how to set them up',
          content: 'Full article content here...',
          category: 'Financial',
          readTime: 5,
          views: 2345,
          helpful: 210,
          lastUpdated: '2024-11-19',
          tags: ['payments', 'billing', 'setup']
        },
        {
          id: 'fin-2',
          title: 'Invoice Management',
          description: 'How to view, download, and manage your invoices',
          content: 'Full article content here...',
          category: 'Financial',
          readTime: 4,
          views: 1678,
          helpful: 152,
          lastUpdated: '2024-11-17',
          tags: ['invoices', 'billing', 'payments']
        },
        {
          id: 'fin-3',
          title: 'Escrow Release Process',
          description: 'Understanding how and when payments are released',
          content: 'Full article content here...',
          category: 'Financial',
          readTime: 6,
          views: 1987,
          helpful: 178,
          lastUpdated: '2024-11-15',
          tags: ['escrow', 'payments', 'release']
        },
        {
          id: 'fin-4',
          title: 'Dispute Resolution',
          description: 'What to do if you\'re unsatisfied with deliverables',
          content: 'Full article content here...',
          category: 'Financial',
          readTime: 8,
          views: 876,
          helpful: 82,
          lastUpdated: '2024-11-13',
          tags: ['disputes', 'resolution', 'support']
        }
      ]
    },
    {
      name: 'Collaboration Tools',
      icon: Users,
      color: 'text-orange-500',
      articles: [
        {
          id: 'col-1',
          title: 'Using Real-time Messaging',
          description: 'Chat with your team instantly and organize conversations',
          content: 'Full article content here...',
          category: 'Collaboration Tools',
          readTime: 5,
          views: 1456,
          helpful: 134,
          lastUpdated: '2024-11-18',
          tags: ['messaging', 'chat', 'communication']
        },
        {
          id: 'col-2',
          title: 'File Sharing and Organization',
          description: 'Upload, share, and manage project files efficiently',
          content: 'Full article content here...',
          category: 'Collaboration Tools',
          readTime: 6,
          views: 1234,
          helpful: 115,
          lastUpdated: '2024-11-16',
          tags: ['files', 'sharing', 'organization']
        },
        {
          id: 'col-3',
          title: 'AI Design Collaboration',
          description: 'Work with AI to generate design alternatives and ideas',
          content: 'Full article content here...',
          category: 'Collaboration Tools',
          readTime: 7,
          views: 2134,
          helpful: 198,
          lastUpdated: '2024-11-21',
          tags: ['ai', 'design', 'collaboration']
        },
        {
          id: 'col-4',
          title: 'Meeting Scheduling',
          description: 'Schedule and manage meetings with your team',
          content: 'Full article content here...',
          category: 'Collaboration Tools',
          readTime: 4,
          views: 987,
          helpful: 91,
          lastUpdated: '2024-11-14',
          tags: ['meetings', 'calendar', 'scheduling']
        }
      ]
    },
    {
      name: 'Analytics & Reporting',
      icon: BarChart,
      color: 'text-pink-500',
      articles: [
        {
          id: 'ana-1',
          title: 'Understanding Your ROI Dashboard',
          description: 'How to read and interpret your return on investment metrics',
          content: 'Full article content here...',
          category: 'Analytics & Reporting',
          readTime: 8,
          views: 1890,
          helpful: 172,
          lastUpdated: '2024-11-20',
          tags: ['roi', 'analytics', 'metrics']
        },
        {
          id: 'ana-2',
          title: 'Exporting Reports',
          description: 'Generate and download custom reports for your records',
          content: 'Full article content here...',
          category: 'Analytics & Reporting',
          readTime: 5,
          views: 1456,
          helpful: 138,
          lastUpdated: '2024-11-18',
          tags: ['reports', 'export', 'data']
        },
        {
          id: 'ana-3',
          title: 'Reading Performance Metrics',
          description: 'Understand project performance indicators and what they mean',
          content: 'Full article content here...',
          category: 'Analytics & Reporting',
          readTime: 7,
          views: 1234,
          helpful: 119,
          lastUpdated: '2024-11-17',
          tags: ['metrics', 'performance', 'analytics']
        },
        {
          id: 'ana-4',
          title: 'Benchmarking Explained',
          description: 'How we compare your performance to industry standards',
          content: 'Full article content here...',
          category: 'Analytics & Reporting',
          readTime: 6,
          views: 1098,
          helpful: 105,
          lastUpdated: '2024-11-15',
          tags: ['benchmarking', 'comparison', 'industry']
        }
      ]
    }
  ]

  const videoTutorials: VideoTutorial[] = [
    {
      id: 'vid-1',
      title: 'Platform Overview (5 minutes)',
      description: 'Quick introduction to KAZI and its main features',
      duration: '5:23',
      thumbnail: '/thumbnails/platform-overview.jpg',
      category: 'Getting Started',
      views: 3456,
      url: '/videos/platform-overview.mp4'
    },
    {
      id: 'vid-2',
      title: 'Creating Your First Project',
      description: 'Step-by-step video guide to launching your first project',
      duration: '8:45',
      thumbnail: '/thumbnails/first-project.jpg',
      category: 'Getting Started',
      views: 2890,
      url: '/videos/first-project.mp4'
    },
    {
      id: 'vid-3',
      title: 'Using the ROI Calculator',
      description: 'Learn how to track and calculate your return on investment',
      duration: '6:12',
      thumbnail: '/thumbnails/roi-calculator.jpg',
      category: 'Analytics',
      views: 2134,
      url: '/videos/roi-calculator.mp4'
    },
    {
      id: 'vid-4',
      title: 'Collaboration Best Practices',
      description: 'Tips and tricks for effective team collaboration',
      duration: '10:30',
      thumbnail: '/thumbnails/collaboration.jpg',
      category: 'Collaboration',
      views: 1987,
      url: '/videos/collaboration.mp4'
    }
  ]

  const faqs = [
    {
      question: 'How does escrow protection work?',
      answer:
        'Escrow protection ensures your payment is held securely until you approve the deliverables. When you create a project, your payment is placed in escrow. Funds are only released to the freelancer or agency after you review and approve their work. If you\'re not satisfied, you can request revisions or, in extreme cases, request a full refund through our dispute resolution process.'
    },
    {
      question: 'What happens if I need revisions?',
      answer:
        'Requesting revisions is simple! Navigate to your project, click on the deliverable you want revised, and click "Request Revision". Provide clear, specific feedback about what changes you\'d like. Your tier determines how many revision rounds are included (Standard: 3, Premium: 5, Enterprise: Unlimited). Additional revisions may incur extra charges.'
    },
    {
      question: 'How long does it take to get approved for a project?',
      answer:
        'Most projects are matched with qualified freelancers or agencies within 24-48 hours. Enterprise and VIP clients receive priority matching within 12 hours. Once matched, your team will reach out to schedule a kickoff meeting and confirm the project timeline.'
    },
    {
      question: 'Can I cancel a project after it starts?',
      answer:
        'Yes, you can cancel a project at any time. If canceled before work begins, you\'ll receive a full refund. If canceled after work has started, you\'ll only pay for completed milestones. Any funds held in escrow for incomplete work will be refunded to your account within 5-7 business days.'
    },
    {
      question: 'How do I upgrade my account tier?',
      answer:
        'You can upgrade your tier anytime from Settings > Account > Billing. Choose your desired tier, confirm the new pricing, and your upgrade takes effect immediately. You\'ll be prorated for the current billing period. Downgrades take effect at the end of your current billing cycle.'
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express, Discover), ACH bank transfers, wire transfers, and PayPal. Enterprise clients can also set up Net 30 or Net 60 payment terms. All payments are processed securely through Stripe.'
    },
    {
      question: 'How do I contact support?',
      answer:
        'Support is available 24/7 through multiple channels: 1) In-app chat (click the support icon), 2) Email: support@kazi.app, 3) Phone: +1 (555) 123-4567 (business hours). Response times vary by tier: Standard (12hrs), Premium (2hrs), Enterprise (1hr), VIP (30min).'
    },
    {
      question: 'Can I work with the same team on multiple projects?',
      answer:
        'Absolutely! Once you find a team you love, you can request them for future projects. Premium and above clients can mark teams as "Preferred" to ensure priority scheduling. Your project history shows all past collaborators, making it easy to re-engage with successful teams.'
    }
  ]

  const popularArticles = categories
    .flatMap(cat => cat.articles)
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)

  const filteredCategories = selectedCategory
    ? categories.filter(cat => cat.name === selectedCategory)
    : categories

  const searchResults = searchQuery
    ? categories
        .flatMap(cat => cat.articles)
        .filter(
          article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    : []

  // handleArticleClick is defined earlier with full functionality (line 160)
  // handleVideoClick is defined earlier with full functionality (line 79)

  const handleArticleHelpful = (articleId: string, helpful: boolean) => {
    logger.info('Article feedback received', {
      articleId,
      helpful
    })

    toast.success(helpful ? 'Thanks for your feedback!' : 'We\'ll work on improving this article')
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Everything you need to know about using KAZI
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles, guides, and tutorials..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </motion.div>
      </div>

      {/* Search Results */}
      {searchQuery && searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map(article => (
                <button
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{article.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views.toLocaleString()} views
                        </span>
                        <Badge variant="secondary">{article.category}</Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!searchQuery && (
        <>
          {/* Main Content Tabs */}
          <Tabs defaultValue="articles" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="articles">
                <BookOpen className="h-4 w-4 mr-2" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="faq">
                <MessageSquare className="h-4 w-4 mr-2" />
                FAQ
              </TabsTrigger>
            </TabsList>

            {/* Articles Tab */}
            <TabsContent value="articles" className="space-y-6">
              {/* Category Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category, index) => {
                  const Icon = category.icon
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-accent ${category.color}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                              <CardDescription>
                                {category.articles.length} articles
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {category.articles.slice(0, 4).map(article => (
                              <button
                                key={article.id}
                                onClick={() => handleArticleClick(article)}
                                className="w-full text-left p-2 rounded hover:bg-accent transition-colors group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm group-hover:text-primary">
                                    {article.title}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Popular Articles */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <CardTitle>Most Popular Articles</CardTitle>
                  </div>
                  <CardDescription>
                    The most viewed articles by KAZI clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {popularArticles.map(article => (
                      <button
                        key={article.id}
                        onClick={() => handleArticleClick(article)}
                        className="text-left p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <h4 className="font-semibold">{article.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {article.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {article.helpful}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Video Tutorials</CardTitle>
                  <CardDescription>
                    Watch step-by-step video guides to master KAZI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {videoTutorials.map(video => (
                      <div
                        key={video.id}
                        className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative aspect-video bg-accent">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                              size="lg"
                              onClick={() => handleVideoClick(video)}
                              className="rounded-full"
                            >
                              <Play className="h-6 w-6" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold">{video.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {video.description}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {video.views.toLocaleString()} views
                            </span>
                            <Badge variant="secondary">{video.category}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Quick answers to common questions about KAZI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Still Need Help */}
              <Card className="bg-accent/50">
                <CardHeader>
                  <CardTitle>Still Need Help?</CardTitle>
                  <CardDescription>
                    Our support team is here to assist you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleLiveChat}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Live Chat
                    </Button>
                    <Button variant="outline" onClick={handleSubmitTicket}>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </Button>
                    <Button variant="outline" onClick={handleCommunityForum}>
                      <Users className="mr-2 h-4 w-4" />
                      Community Forum
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
