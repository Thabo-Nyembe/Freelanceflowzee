'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { DemoModal } from '@/components/demo-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  PenTool, 
  Calendar, 
  User, 
  ArrowRight, 
  Search, 
  BookOpen,
  TrendingUp,
  Users,
  Lightbulb,
  Target,
  Zap,
  X,
  Code,
  Copy,
  RefreshCw,
  Book
} from 'lucide-react'
import { context7Client, type LibraryDoc, type CodeSnippet } from '@/lib/context7/client'
import { Metadata } from 'next'
import { generatePageSEO, generateStructuredData, SEO_CONFIG } from '@/lib/seo-optimizer'
import { Clock } from 'lucide-react'
import { Eye, Heart } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

// Context7 Pattern: Enhanced SEO for blog (handled via layout or head)

const categories = [
  { name: 'All Posts', slug: 'all', count: 12, color: 'bg-gray-100 text-gray-800' },
  { name: 'Workflow Tips', slug: 'workflow', count: 4, color: 'bg-blue-100 text-blue-800' },
  { name: 'Business Growth', slug: 'business', count: 6, color: 'bg-green-100 text-green-800' },
  { name: 'Client Management', slug: 'clients', count: 3, color: 'bg-purple-100 text-purple-800' },
  { name: 'Technology', slug: 'tech', count: 2, color: 'bg-orange-100 text-orange-800' },
]

const featuredPost = {
  title: "10 Essential Tips for Streamlining Your Creative Workflow in 2024",
  excerpt: "Discover proven strategies to optimize your creative process, reduce time spent on administrative tasks, and focus more on what you love doing.",
  slug: "streamlining-creative-workflow-2024",
  author: "Sarah Johnson",
  authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b692?w=40&h=40&fit=crop&crop=face",
  publishDate: "2024-12-15",
  readTime: "8 min read",
  category: "Workflow Tips",
  image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop",
  featured: true
}

const blogPosts = [
  {
    title: "How to Price Your Creative Services: A Complete Guide",
    excerpt: "Learn the fundamentals of pricing creative work, from hourly rates to project-based pricing strategies that maximize your value.",
    slug: "pricing-creative-services-guide",
    author: "Michael Chen",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-12",
    readTime: "12 min read",
    category: "Business Growth",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop",
    tags: ["Pricing", "Business", "Strategy"]
  },
  {
    title: "Building Long-term Client Relationships That Last",
    excerpt: "Discover the secrets to turning one-time clients into long-term partners who provide consistent work and referrals.",
    slug: "building-client-relationships",
    author: "Emily Rodriguez",
    authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-10",
    readTime: "6 min read",
    category: "Client Management",
    image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=600&h=300&fit=crop",
    tags: ["Clients", "Relationships", "Growth"]
  },
  {
    title: "The Future of Creative Collaboration: AI Tools and Human Creativity",
    excerpt: "Explore how AI is transforming the creative industry and learn how to leverage these tools while maintaining your unique creative voice.",
    slug: "future-creative-collaboration-ai",
    author: "David Park",
    authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-08",
    readTime: "10 min read",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop",
    tags: ["AI", "Technology", "Future"]
  },
  {
    title: "From Freelancer to Agency: Scaling Your Creative Business",
    excerpt: "A step-by-step guide to growing your solo practice into a thriving creative agency, including team building and process optimization.",
    slug: "freelancer-to-agency-scaling",
    author: "Lisa Thompson",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b692?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-05",
    readTime: "15 min read",
    category: "Business Growth",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop",
    tags: ["Scaling", "Agency", "Growth"]
  },
  {
    title: "Mastering Time Management for Creative Professionals",
    excerpt: "Proven time management techniques specifically designed for creative work, including dealing with inspiration strikes and creative blocks.",
    slug: "time-management-creative-professionals",
    author: "James Wilson",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-03",
    readTime: "7 min read",
    category: "Workflow Tips",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=300&fit=crop",
    tags: ["Time Management", "Productivity", "Workflow"]
  },
  {
    title: "Client Communication Best Practices for Smoother Projects",
    excerpt: "Essential communication strategies that prevent misunderstandings, reduce revisions, and keep projects on track from start to finish.",
    slug: "client-communication-best-practices",
    author: "Anna Martinez",
    authorImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-01",
    readTime: "9 min read",
    category: "Client Management",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop",
    tags: ["Communication", "Clients", "Projects"]
  },
  {
    title: "Essential Tools Every Creative Freelancer Needs in 2024",
    excerpt: "A comprehensive review of the must-have software, apps, and tools that can boost your productivity and streamline your creative workflow.",
    slug: "essential-tools-creative-freelancer-2024",
    author: "Sophie Chen",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b692?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-28",
    readTime: "11 min read",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop",
    tags: ["Tools", "Software", "Productivity"]
  },
  {
    title: "Building a Strong Personal Brand as a Creative Professional",
    excerpt: "Learn how to develop a compelling personal brand that attracts ideal clients and sets you apart from the competition.",
    slug: "building-personal-brand-creative",
    author: "Marcus Williams",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-25",
    readTime: "8 min read",
    category: "Business Growth",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=300&fit=crop",
    tags: ["Branding", "Marketing", "Identity"]
  },
  {
    title: "The Complete Guide to Freelance Contracts and Legal Protection",
    excerpt: "Protect yourself and your business with essential contract templates, legal considerations, and best practices for freelance agreements.",
    slug: "freelance-contracts-legal-guide",
    author: "Rachel Park",
    authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-22",
    readTime: "14 min read",
    category: "Business Growth",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=300&fit=crop",
    tags: ["Legal", "Contracts", "Protection"]
  },
  {
    title: "Maximizing Productivity with Creative Workflows and Automation",
    excerpt: "Discover how to automate repetitive tasks, create efficient workflows, and focus more time on the creative work you love.",
    slug: "productivity-creative-workflows-automation",
    author: "Alex Thompson",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-20",
    readTime: "10 min read",
    category: "Workflow Tips",
    image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=600&h=300&fit=crop",
    tags: ["Automation", "Workflow", "Efficiency"]
  },
  {
    title: "Creating Multiple Revenue Streams as a Creative Freelancer",
    excerpt: "Explore diverse income opportunities including passive income, digital products, courses, and recurring revenue models.",
    slug: "multiple-revenue-streams-freelancer",
    author: "Isabella Rodriguez",
    authorImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-18",
    readTime: "13 min read",
    category: "Business Growth",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=300&fit=crop",
    tags: ["Revenue", "Passive Income", "Diversification"]
  },
  {
    title: "Advanced Client Onboarding: Setting the Foundation for Success",
    excerpt: "Master the art of client onboarding with proven frameworks that reduce project friction and exceed client expectations.",
    slug: "advanced-client-onboarding-framework",
    author: "Daniel Kim",
    authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-15",
    readTime: "9 min read",
    category: "Client Management",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=300&fit=crop",
    tags: ["Onboarding", "Process", "Client Success"]
  }
]

const stats = [
  { icon: BookOpen, label: "Articles Published", value: "150+" },
  { icon: Users, label: "Monthly Readers", value: "25K+" },
  { icon: TrendingUp, label: "Success Stories", value: "500+" },
  { icon: Lightbulb, label: "Tips Shared", value: "1000+" },
]

export default function BlogPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [visiblePosts, setVisiblePosts] = useState(4)
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMode, setSearchMode] = useState<'articles' | 'docs' | 'all' | string>('articles')
  const [docSearchResults, setDocSearchResults] = useState<LibraryDoc[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLibrary, setSelectedLibrary] = useState('next.js')

  const libraries = [
    'next.js',
    'react',
    'typescript',
    'tailwindcss',
    'supabase',
    '@radix-ui/react-dialog',
    'react-hook-form',
    'zod'
  ]

  // Handle Context7 documentation search
  const handleDocSearch = async (query: string, library?: string) => {
    if (!query.trim()) {
      setDocSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      if (library) {
        // Search specific library
        const doc = await context7Client.getLibraryDocs(library, query)
        setDocSearchResults([doc])
      } else {
        // Search all libraries
        const results = await context7Client.searchLibraries(query)
        setDocSearchResults(results)
      }
    } catch (error) {
      console.error('Failed to search documentation:', error)
      setDocSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search term changes
  useEffect(() => {
    if (searchMode === 'docs' && searchTerm) {
      const debounceTimer = setTimeout(() => {
        handleDocSearch(searchTerm, selectedLibrary)
      }, 500)
      return () => clearTimeout(debounceTimer)
    }
  }, [searchTerm, searchMode, selectedLibrary])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const handleLoadMore = () => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setVisiblePosts(prev => Math.min(prev + 4, blogPosts.length))
      setIsLoading(false)
    }, 500)
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setIsSubscribed(true)
      console.log('Newsletter signup:', email)
      setEmail('')
    }
  }

  // Filter posts based on search term
  const filteredPosts = blogPosts.filter(post => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      post.title.toLowerCase().includes(term) ||
      post.excerpt.toLowerCase().includes(term) ||
      post.category.toLowerCase().includes(term) ||
      post.tags.some(tag => tag.toLowerCase().includes(term))
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      {/* Structured Data for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData('Blog'))
        }}
      />
      
      <SiteHeader />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FreeflowZee Blog
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Stay ahead with the latest freelance industry insights, business tips, and expert advice 
              to grow your freelance business and work smarter.
            </p>
            
            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search articles, tips, and insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg border-gray-200 focus:border-indigo-500 rounded-xl"
                />
              </div>
              
              {/* Categories */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant={searchMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('all')}
                  className="rounded-full"
                >
                  All Posts
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.slug}
                    variant={searchMode === category.slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSearchMode(category.slug)}
                    className="rounded-full"
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Featured Posts */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending Now
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Featured Post */}
            <Card className="lg:col-span-1 group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-t-lg">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-indigo-600 text-white">
                  Featured
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <Badge variant="outline" className={categories.find(c => c.name === featuredPost.category)?.color}>
                    {featuredPost.category}
                  </Badge>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(featuredPost.publishDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {featuredPost.readTime}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  <Link href={`/blog/${featuredPost.slug}`}>
                    {featuredPost.title}
                  </Link>
                </h3>
                
                <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      src={featuredPost.authorImage}
                      alt={featuredPost.author}
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{featuredPost.author}</div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                  asChild
                >
                  <Link href={`/blog/${featuredPost.slug}`}>
                    Read Full Article
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Secondary Featured Posts */}
            <div className="space-y-6">
              {blogPosts.slice(1, 3).map((post) => (
                <Card key={post.slug} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={240}
                        height={160}
                        className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={categories.find(c => c.name === post.category)?.color}>
                            {post.category}
                          </Badge>
                          <div className="text-xs text-gray-500">{post.readTime}</div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Image
                              src={post.authorImage}
                              alt={post.author}
                              width={32}
                              height={32}
                              className="rounded-full mr-2"
                            />
                            <span className="text-xs text-gray-500">{post.author}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
            <Button variant="outline" asChild>
              <Link href="/blog/category/all">
                View All Posts
                <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(3).map((post) => (
              <Card key={post.slug} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className={categories.find(c => c.name === post.category)?.color}>
                      {post.category}
                    </Badge>
                    <div className="text-sm text-gray-500">{post.readTime}</div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Image
                        src={post.authorImage}
                        alt={post.author}
                        width={32}
                        height={32}
                        className="rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{post.author}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(post.publishDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-indigo-50 group-hover:border-indigo-200"
                    asChild
                  >
                    <Link href={`/blog/${post.slug}`}>
                      Read More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <BookOpen className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Never Miss an Update
            </h3>
            <p className="text-gray-600 mb-6">
              Get the latest freelance tips, industry insights, and expert advice delivered to your inbox every week.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Subscribe
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Join 5,000+ freelancers getting weekly insights. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
      
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  )
} 