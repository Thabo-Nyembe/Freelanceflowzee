'use client'

import { useState, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import { DemoModal } from '@/components/demo-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  BookOpen,
  Search,
  Grid,
  List
} from 'lucide-react'

// Mock categories data - replace with actual data fetching
const categories = [
  {
    slug: 'ai-tools',
    name: 'AI Tools',
    description: 'Latest AI tools and techniques',
    count: 15,
    color: 'bg-blue-500'
  },
  {
    slug: 'collaboration',
    name: 'Collaboration',
    description: 'Team work and project management',
    count: 8,
    color: 'bg-green-500'
  },
  {
    slug: 'design',
    name: 'Design',
    description: 'Creative design processes',
    count: 12,
    color: 'bg-purple-500'
  }
]

// Mock blog posts data - replace with actual data fetching
const blogPosts = [
  {
    slug: 'getting-started-with-ai-content-creation',
    title: 'Getting Started with AI Content Creation',
    excerpt: 'Learn how to leverage AI tools for creating compelling content that engages your audience.',
    author: 'Sarah Johnson',
    authorAvatar: 'SJ',
    publishedAt: '2024-01-15',
    readTime: '8 min read',
    category: 'AI Tools',
    tags: ['AI', 'Content Creation', 'Productivity'],
    image: '/images/blog/ai-content-creation.jpg'
  },
  {
    slug: 'collaborative-design-workflows',
    title: 'Building Effective Collaborative Design Workflows',
    excerpt: 'Discover strategies for seamless collaboration in creative projects.',
    author: 'Mike Chen',
    authorAvatar: 'MC',
    publishedAt: '2024-01-10',
    readTime: '6 min read',
    category: 'Collaboration',
    tags: ['Workflow', 'Team Management', 'Design'],
    image: '/images/blog/collaborative-design.jpg'
  }
]

interface BlogCategoryPageProps {
  params: Promise<{ slug: string }>
}

export default function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const { slug } = use(params)
  const [searchTerm, setSearchTerm] = useState<any>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showDemoModal, setShowDemoModal] = useState<any>(false)
  
  const category = categories.find(c => c.slug === slug)
  
  if (!category) {
    notFound()
  }

  const filteredPosts = blogPosts.filter(post => 
    post.category.toLowerCase().replace(' ', '-') === slug &&
    (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16">
        {/* Category Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >"
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>

            <Badge variant="outline" className="text-sm">
              {category.count} articles
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
"
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Articles Grid/List */}
          {filteredPosts.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {filteredPosts.map((post) => (
                <Card key={post.slug} className="hover:shadow-lg transition-shadow">
                  <CardContent className={viewMode === 'grid' ? 'p-6' : 'p-6 flex gap-6'}>
                    {post.image && (
                      <div className={viewMode === 'grid' ? 'mb-4' : 'flex-shrink-0'}>
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={viewMode === 'grid' ? 400 : 200}
                          height={viewMode === 'grid' ? 200 : 150}
                          className={`object-cover rounded-lg ${viewMode === 'grid' ? 'w-full h-48' : 'w-48 h-32'}`}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <Badge className="mb-3 bg-blue-100 text-blue-800">
                        {post.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h3>"
                      <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mr-2">
                            {post.authorAvatar}
                          </div>
                          {post.author}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {post.readTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? `No articles match "${searchTerm}"` : 'No articles in this category yet.'}
              </p>
              <Button onClick={() => setShowDemoModal(true)}>
                Explore Other Categories
              </Button>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Want to Create Content Like This?</h3>
            <p className="text-blue-100 mb-6">
              Use FreeflowZee to streamline your content creation workflow
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => setShowDemoModal(true)}
            >"
              <BookOpen className="w-5 h-5 mr-2" />
              Try Free Demo
            </Button>
          </div>
        </div>
      </main>

      <DemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
      />
    </div>
  )
}
