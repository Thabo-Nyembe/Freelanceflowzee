'use client'

import React, { useState, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { DemoModal } from '@/components/demo-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  Share2, 
  BookOpen,
  Heart,
  MessageCircle,
  ExternalLink
} from 'lucide-react'

// Mock blog data - replace with actual data fetching
const blogPosts = [
  {
    slug: 'getting-started-with-ai-content-creation',
    title: 'Getting Started with AI Content Creation',
    excerpt: 'Learn how to leverage AI tools for creating compelling content that engages your audience.',
    content: `
      <p>Artificial Intelligence has revolutionized the way we create content. From generating ideas to polishing final drafts, AI tools can significantly enhance your creative workflow.</p>
      
      <h2>Why AI Content Creation Matters</h2>
      <p>In today's fast-paced digital landscape, content creators need to produce high-quality material consistently. AI content creation tools help by:</p>
      
      <ul>
        <li>Accelerating the ideation process</li>
        <li>Providing writing assistance and suggestions</li>
        <li>Offering different perspectives and styles</li>
        <li>Helping overcome writer's block</li>
      </ul>
      
      <h2>Best Practices for AI-Assisted Content</h2>
      <p>While AI is powerful, the best results come from thoughtful collaboration between human creativity and machine intelligence.</p>
    `,
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
    content: `
      <p>Effective collaboration is the backbone of successful creative projects. In this guide, we'll explore proven strategies for building workflows that enhance team productivity.</p>
      
      <h2>Setting Up Your Collaborative Environment</h2>
      <p>The foundation of good collaboration starts with the right tools and processes.</p>
    `,
    author: 'Mike Chen',
    authorAvatar: 'MC',
    publishedAt: '2024-01-10',
    readTime: '6 min read',
    category: 'Collaboration',
    tags: ['Workflow', 'Team Management', 'Design'],
    image: '/images/blog/collaborative-design.jpg'
  }
]

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params)
  const [isLiked, setIsLiked] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  
  const post = blogPosts.find(p => p.slug === slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <article className="bg-white">
          <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Back Navigation */}
            <Link 
              href="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            {/* Article Header */}
            <header className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <Badge className="bg-blue-100 text-blue-800">{post.category}</Badge>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime}
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {post.authorAvatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{post.author}</p>
                    <p className="text-sm text-gray-600">Content Creator</p>
                  </div>
                </div>

                {/* Share & Like */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.image && (
              <div className="mb-8">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Article Content */}
            <div
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="border-t pt-6 mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center mb-12">
              <h3 className="text-2xl font-bold mb-4">Ready to Try FreeflowZee?</h3>
              <p className="text-blue-100 mb-6">
                Experience the tools and workflows discussed in this article
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => setShowDemoModal(true)}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Try Free Demo
              </Button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.slug} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Badge className="mb-3 bg-blue-100 text-blue-800">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link 
                          href={`/blog/${relatedPost.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{relatedPost.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {relatedPost.author}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {relatedPost.readTime}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <DemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
      />
    </div>
  )
}
