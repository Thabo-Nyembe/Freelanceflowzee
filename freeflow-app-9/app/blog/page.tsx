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

const categories = [
  { name: 'All Posts', slug: 'all', count: 12 },
  { name: 'Workflow Tips', slug: 'workflow', count: 4 },
  { name: 'Business Growth', slug: 'business', count: 6 },
  { name: 'Client Management', slug: 'clients', count: 3 },
  { name: 'Technology', slug: 'tech', count: 2 },
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
  const [searchMode, setSearchMode] = useState<'articles' | 'docs'>('articles')
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
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <PenTool className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Creative Workflow Blog
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Insights, tips, and strategies to help creative professionals optimize their workflow, 
              grow their business, and succeed in the digital age.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Search Mode Tabs */}
              <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'articles' | 'docs')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                  <TabsTrigger value="articles" className="flex items-center gap-2">
                    <PenTool className="w-4 h-4" />
                    Articles
                  </TabsTrigger>
                  <TabsTrigger value="docs" className="flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    Documentation
                  </TabsTrigger>
                </TabsList>

                {/* Search Input */}
                <div className="relative max-w-2xl mx-auto mt-4">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder={searchMode === 'articles' ? "Search articles, tips, and guides..." : "Search documentation and code examples..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 text-lg bg-white border-gray-300 focus:border-indigo-500 rounded-lg shadow-sm"
                    suppressHydrationWarning
                  />
                  {(isSearching || isLoading) && (
                    <RefreshCw className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                  )}
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('')
                        setDocSearchResults([])
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Library Selector for Documentation Search */}
                {searchMode === 'docs' && (
                  <div className="max-w-md mx-auto">
                    <select
                      value={selectedLibrary}
                      onChange={(e) => setSelectedLibrary(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:border-indigo-500 focus:outline-none"
                    >
                      {libraries.map((lib) => (
                        <option key={lib} value={lib}>
                          {lib}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </Tabs>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Article</h2>
              <p className="text-lg text-gray-600">Our latest and most popular content</p>
            </div>

            <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="relative h-64 md:h-full">
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-indigo-600 text-white">
                        Featured
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge variant="outline">{featuredPost.category}</Badge>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(featuredPost.publishDate).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500 text-sm">{featuredPost.readTime}</div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={featuredPost.authorImage}
                        alt={featuredPost.author}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{featuredPost.author}</p>
                        <p className="text-sm text-gray-500">Content Creator</p>
                      </div>
                    </div>
                    
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Read Article <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Documentation Search Results */}
        {searchMode === 'docs' && searchTerm && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentation Search Results</h2>
                <p className="text-gray-600">
                  {isSearching ? 'Searching...' : `Found ${docSearchResults.length} result${docSearchResults.length !== 1 ? 's' : ''} for "${searchTerm}" in ${selectedLibrary}`}
                </p>
              </div>

              {docSearchResults.length > 0 && (
                <div className="space-y-6">
                  {docSearchResults.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Code className="w-5 h-5 text-indigo-600" />
                            {doc.name} {doc.version && `v${doc.version}`}
                          </CardTitle>
                          <Badge variant="outline">{doc.id}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64 w-full rounded-md border p-4">
                          <pre className="text-sm whitespace-pre-wrap">{doc.documentation}</pre>
                        </ScrollArea>
                        
                        {doc.codeSnippets.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-medium mb-4 flex items-center gap-2">
                              <Code className="w-4 h-4" />
                              Code Examples
                            </h4>
                            <div className="space-y-4">
                              {doc.codeSnippets.map((snippet, index) => (
                                <Card key={index} className="bg-gray-50">
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-sm">{snippet.title}</CardTitle>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(snippet.code)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <CardDescription className="text-xs">
                                      {snippet.description}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                                      <code>{snippet.code}</code>
                                    </pre>
                                    <div className="flex gap-1 mt-2">
                                      {snippet.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isSearching && docSearchResults.length === 0 && searchTerm && (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No documentation found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or selecting a different library.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setDocSearchResults([])
                    }}
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Categories and Articles */}
        {searchMode === 'articles' && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar */}
              <div className="lg:w-1/4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {categories.map((category) => (
                        <li key={category.slug}>
                          <Link
                            href={`/blog/category/${category.slug}`}
                            className="flex items-center justify-between text-gray-600 hover:text-indigo-600 transition-colors"
                          >
                            <span>{category.name}</span>
                            <Badge variant="secondary">{category.count}</Badge>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Newsletter Signup */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Stay Updated
                    </CardTitle>
                    <CardDescription>
                      Get the latest articles and tips delivered to your inbox.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSubscribed ? (
                      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <p className="text-sm">🎉 Thanks for subscribing! You'll receive our latest content in your inbox.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          suppressHydrationWarning
                        />
                        <Button 
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          disabled={!email.trim()}
                        >
                          Subscribe
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Articles Grid */}
              <div className="lg:w-3/4">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
                  <Button variant="outline">
                    View All Posts <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {searchTerm && (
                  <div className="mb-4 text-sm text-gray-600">
                    Found {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} for "{searchTerm}"
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  {filteredPosts.slice(0, visiblePosts).map((post) => (
                    <Card key={post.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <CardHeader>
                        <div className="flex items-center space-x-4 mb-2">
                          <Badge variant="outline">{post.category}</Badge>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(post.publishDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <CardTitle className="text-lg hover:text-indigo-600 transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                        
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Image
                              src={post.authorImage}
                              alt={post.author}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{post.author}</p>
                              <p className="text-xs text-gray-500">{post.readTime}</p>
                            </div>
                          </div>
                          
                          <Link href={`/blog/${post.slug}`}>
                            <Button variant="ghost" size="sm">
                              Read More <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More Button */}
                {visiblePosts < filteredPosts.length && (
                  <div className="text-center mt-12">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : `Load More Articles (${filteredPosts.length - visiblePosts} remaining)`}
                    </Button>
                  </div>
                )}

                {filteredPosts.length === 0 && searchTerm && (
                  <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms or browse all categories.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Creative Workflow?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of creative professionals who have streamlined their process with FreeflowZee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-indigo-600"
                onClick={() => setIsDemoOpen(true)}
              >
                View Demo Project
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  )
} 