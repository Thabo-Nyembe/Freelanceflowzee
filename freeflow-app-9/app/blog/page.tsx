'use client'

import { useState } from 'react'
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
  Zap
} from 'lucide-react'

const categories = [
  { name: 'All Posts', slug: 'all', count: 12 },
  { name: 'Workflow Tips', slug: 'workflow', count: 4 },
  { name: 'Business Growth', slug: 'business', count: 3 },
  { name: 'Client Management', slug: 'clients', count: 2 },
  { name: 'Technology', slug: 'tech', count: 3 },
]

const featuredPost = {
  title: "10 Essential Tips for Streamlining Your Creative Workflow in 2024",
  excerpt: "Discover proven strategies to optimize your creative process, reduce time spent on administrative tasks, and focus more on what you love doing.",
  slug: "streamlining-creative-workflow-2024",
  author: "Sarah Johnson",
  authorImage: "/api/placeholder/40/40",
  publishDate: "2024-12-15",
  readTime: "8 min read",
  category: "Workflow Tips",
  image: "/api/placeholder/800/400",
  featured: true
}

const blogPosts = [
  {
    title: "How to Price Your Creative Services: A Complete Guide",
    excerpt: "Learn the fundamentals of pricing creative work, from hourly rates to project-based pricing strategies that maximize your value.",
    slug: "pricing-creative-services-guide",
    author: "Michael Chen",
    authorImage: "/api/placeholder/40/40",
    publishDate: "2024-12-12",
    readTime: "12 min read",
    category: "Business Growth",
    image: "/api/placeholder/600/300",
    tags: ["Pricing", "Business", "Strategy"]
  },
  {
    title: "Building Long-term Client Relationships That Last",
    excerpt: "Discover the secrets to turning one-time clients into long-term partners who provide consistent work and referrals.",
    slug: "building-client-relationships",
    author: "Emily Rodriguez",
    authorImage: "/api/placeholder/40/40",
    publishDate: "2024-12-10",
    readTime: "6 min read",
    category: "Client Management",
    image: "/api/placeholder/600/300",
    tags: ["Clients", "Relationships", "Growth"]
  },
  {
    title: "The Future of Creative Collaboration: AI Tools and Human Creativity",
    excerpt: "Explore how AI is transforming the creative industry and learn how to leverage these tools while maintaining your unique creative voice.",
    slug: "future-creative-collaboration-ai",
    author: "David Park",
    authorImage: "/api/placeholder/40/40",
    publishDate: "2024-12-08",
    readTime: "10 min read",
    category: "Technology",
    image: "/api/placeholder/600/300",
    tags: ["AI", "Technology", "Future"]
  },
  {
    title: "From Freelancer to Agency: Scaling Your Creative Business",
    excerpt: "A step-by-step guide to growing your solo practice into a thriving creative agency, including team building and process optimization.",
    slug: "freelancer-to-agency-scaling",
    author: "Lisa Thompson",
    authorImage: "/api/placeholder/40/40",
    publishDate: "2024-12-05",
    readTime: "15 min read",
    category: "Business Growth",
    image: "/api/placeholder/600/300",
    tags: ["Scaling", "Agency", "Growth"]
  },
  {
    title: "Mastering Time Management for Creative Professionals",
    excerpt: "Proven time management techniques specifically designed for creative work, including dealing with inspiration strikes and creative blocks.",
    slug: "time-management-creative-professionals",
    author: "James Wilson",
    authorImage: "/api/placeholder/40/40",
    publishDate: "2024-12-03",
    readTime: "7 min read",
    category: "Workflow Tips",
    image: "/api/placeholder/600/300",
    tags: ["Time Management", "Productivity", "Workflow"]
  },
  {
    title: "Client Communication Best Practices for Smoother Projects",
    excerpt: "Essential communication strategies that prevent misunderstandings, reduce revisions, and keep projects on track from start to finish.",
    slug: "client-communication-best-practices",
    author: "Anna Martinez",
    authorImage: "/api/placeholder/40/40",
    publishDate: "2024-12-01",
    readTime: "9 min read",
    category: "Client Management",
    image: "/api/placeholder/600/300",
    tags: ["Communication", "Clients", "Projects"]
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
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search articles, tips, and guides..."
                className="pl-12 pr-4 py-3 text-lg bg-white border-gray-300 focus:border-indigo-500 rounded-lg shadow-sm"
                suppressHydrationWarning
              />
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

        {/* Categories and Articles */}
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
                    <div className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        suppressHydrationWarning
                      />
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Subscribe
                      </Button>
                    </div>
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

                <div className="grid md:grid-cols-2 gap-8">
                  {blogPosts.map((post) => (
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
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg">
                    Load More Articles
                  </Button>
                </div>
              </div>
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