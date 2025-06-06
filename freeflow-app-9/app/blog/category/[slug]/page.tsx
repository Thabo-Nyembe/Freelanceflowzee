'use client'

import { useState, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { DemoModal } from '@/components/demo-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  ArrowRight, 
  Search,
  Filter,
  Grid,
  List,
  Target
} from 'lucide-react'

// Mock data for categories and blog posts
const categories = {
  "all": {
    name: "All Posts",
    description: "Browse all our articles, tips, and insights for creative professionals",
    count: 12
  },
  "workflow": {
    name: "Workflow Tips",
    description: "Proven strategies to optimize your creative process and boost productivity",
    count: 4
  },
  "business": {
    name: "Business Growth",
    description: "Scale your creative business with actionable advice and proven strategies",
    count: 3
  },
  "clients": {
    name: "Client Management",
    description: "Build stronger relationships and deliver better results for your clients",
    count: 2
  },
  "tech": {
    name: "Technology",
    description: "Stay ahead with the latest tools and trends in creative technology",
    count: 3
  }
}

const allBlogPosts = [
  {
    title: "10 Essential Tips for Streamlining Your Creative Workflow in 2024",
    excerpt: "Discover proven strategies to optimize your creative process, reduce time spent on administrative tasks, and focus more on what you love doing.",
    slug: "streamlining-creative-workflow-2024",
    author: "Sarah Johnson",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b692?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-15",
    readTime: "8 min read",
    category: "Workflow Tips",
    categorySlug: "workflow",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=300&fit=crop",
    tags: ["Productivity", "Workflow", "Tips", "2024"]
  },
  {
    title: "How to Price Your Creative Services: A Complete Guide",
    excerpt: "Learn the fundamentals of pricing creative work, from hourly rates to project-based pricing strategies that maximize your value.",
    slug: "pricing-creative-services-guide",
    author: "Michael Chen",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-12",
    readTime: "12 min read",
    category: "Business Growth",
    categorySlug: "business",
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
    categorySlug: "clients",
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
    categorySlug: "tech",
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
    categorySlug: "business",
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
    categorySlug: "workflow",
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
    categorySlug: "clients",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop",
    tags: ["Communication", "Clients", "Projects"]
  },
  // Additional posts for other categories
  {
    title: "Building a Responsive Design System from Scratch",
    excerpt: "Create a scalable design system that works across all devices and platforms.",
    slug: "building-responsive-design-system",
    author: "Alex Chen",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-28",
    readTime: "11 min read",
    category: "Technology",
    categorySlug: "tech",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&h=300&fit=crop",
    tags: ["Design System", "Responsive", "Development"]
  },
  {
    title: "The Psychology of Color in Brand Design",
    excerpt: "Understanding how color choices impact brand perception and customer behavior.",
    slug: "psychology-color-brand-design",
    author: "Maya Patel",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b692?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-25",
    readTime: "8 min read",
    category: "Workflow Tips",
    categorySlug: "workflow",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=300&fit=crop",
    tags: ["Color Theory", "Branding", "Psychology"]
  },
  {
    title: "Setting Up Your Creative Business for Tax Season",
    excerpt: "Essential financial organization tips for creative professionals and freelancers.",
    slug: "creative-business-tax-season",
    author: "Robert Kim",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-22",
    readTime: "10 min read",
    category: "Business Growth",
    categorySlug: "business",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop",
    tags: ["Taxes", "Finance", "Business"]
  },
  {
    title: "Advanced Prototyping Techniques for Better User Testing",
    excerpt: "Level up your prototyping skills to create more effective user testing scenarios.",
    slug: "advanced-prototyping-techniques",
    author: "Jessica Wong",
    authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-20",
    readTime: "13 min read",
    category: "Technology",
    categorySlug: "tech",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&h=300&fit=crop",
    tags: ["Prototyping", "UX", "Testing"]
  },
  {
    title: "Creative Project Estimation: Getting Your Quotes Right",
    excerpt: "Master the art of project estimation to improve profitability and client satisfaction.",
    slug: "creative-project-estimation-guide",
    author: "Thomas Anderson",
    authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-11-18",
    readTime: "9 min read",
    category: "Workflow Tips",
    categorySlug: "workflow",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=300&fit=crop",
    tags: ["Estimation", "Pricing", "Planning"]
  }
]

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Unwrap the Promise using React.use()
  const { slug } = use(params)
  const category = categories[slug as keyof typeof categories]
  
  if (!category) {
    notFound()
  }

  // Filter posts based on category and search term
  const filteredPosts = allBlogPosts.filter(post => {
    const matchesCategory = slug === 'all' || post.categorySlug === slug
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Breadcrumb */}
        <section className="bg-white py-4 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-indigo-600">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-indigo-600">Blog</Link>
              <span>/</span>
              <span className="text-gray-900">{category.name}</span>
            </nav>
          </div>
        </section>

        {/* Category Header */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Target className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {category.description}
            </p>
            <div className="text-sm text-gray-500">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </section>

        {/* Search and Filter Bar */}
        <section className="bg-white py-6 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  suppressHydrationWarning
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse all categories.
                </p>
                <Link href="/blog">
                  <Button className="mt-4" variant="outline">
                    Browse All Articles
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'}>
                {filteredPosts.map((post) => (
                  <Card key={post.slug} className={`overflow-hidden hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'md:flex' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'md:w-1/3 h-48' : 'h-48'}`}>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className={viewMode === 'list' ? 'md:w-2/3' : ''}>
                      <CardHeader>
                        <div className="flex items-center space-x-4 mb-2">
                          <Badge variant="outline">{post.category}</Badge>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(post.publishDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <CardTitle className={`hover:text-indigo-600 transition-colors ${viewMode === 'list' ? 'text-xl' : 'text-lg'}`}>
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
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Category Navigation */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Explore Other Categories
            </h3>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(categories)
                .filter(([catSlug]) => catSlug !== slug)
                .map(([catSlug, cat]) => (
                  <Link key={catSlug} href={`/blog/category/${catSlug}`}>
                    <Card className="hover:shadow-md transition-shadow text-center p-6">
                      <h4 className="font-medium text-gray-900 mb-2">{cat.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{cat.count} articles</p>
                      <Button variant="outline" size="sm">
                        Browse
                      </Button>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        </section>

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