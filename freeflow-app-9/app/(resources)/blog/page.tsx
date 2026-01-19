import { Metadata } from 'next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, User, ArrowRight, Sparkles, Video, Briefcase, Shield, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog - FreeflowZee',
  description: 'Explore insights on AI creative tools, file sharing best practices, and tips for growing your creative business.',
  keywords: 'creative business blog, AI tools, file sharing tips, freelance advice, digital collaboration',
  openGraph: {
    title: 'Blog - FreeflowZee',
    description: 'Explore insights on AI creative tools, file sharing best practices, and tips for growing your creative business.',
    type: 'website',
    url: 'https://freeflowzee.com/blog'
  }
}

// Blog posts data
const BLOG_POSTS = [
  {
    id: '1',
    slug: 'ai-powered-freelancing-2024',
    title: 'How AI is Transforming Freelancing in 2024',
    excerpt: 'Discover how AI tools are revolutionizing the way freelancers work, from automated proposals to intelligent project management.',
    category: 'AI Tools',
    author: 'Sarah Chen',
    authorRole: 'AI Product Lead',
    date: '2024-01-15',
    readTime: '8 min read',
    image: '/blog/ai-freelancing.jpg',
    featured: true,
    icon: Sparkles,
    tags: ['AI', 'Freelancing', 'Productivity']
  },
  {
    id: '2',
    slug: 'video-collaboration-tips',
    title: 'Master Video Collaboration with Frame-by-Frame Comments',
    excerpt: 'Learn how to give precise feedback on video projects using our industry-leading frame-by-frame commenting system.',
    category: 'Video',
    author: 'Marcus Johnson',
    authorRole: 'Creative Director',
    date: '2024-01-12',
    readTime: '6 min read',
    image: '/blog/video-collab.jpg',
    featured: true,
    icon: Video,
    tags: ['Video', 'Collaboration', 'Feedback']
  },
  {
    id: '3',
    slug: 'managing-client-expectations',
    title: 'The Ultimate Guide to Managing Client Expectations',
    excerpt: 'Build stronger client relationships with clear communication, milestone tracking, and professional boundaries.',
    category: 'Business',
    author: 'Emily Rodriguez',
    authorRole: 'Client Success Manager',
    date: '2024-01-10',
    readTime: '10 min read',
    image: '/blog/client-management.jpg',
    featured: false,
    icon: Briefcase,
    tags: ['Clients', 'Communication', 'Business']
  },
  {
    id: '4',
    slug: 'secure-file-sharing-best-practices',
    title: 'Secure File Sharing: Best Practices for Freelancers',
    excerpt: 'Protect your work and client data with these essential security tips for sharing files in the digital age.',
    category: 'Security',
    author: 'David Kim',
    authorRole: 'Security Engineer',
    date: '2024-01-08',
    readTime: '7 min read',
    image: '/blog/secure-sharing.jpg',
    featured: false,
    icon: Shield,
    tags: ['Security', 'Files', 'Privacy']
  },
  {
    id: '5',
    slug: 'automating-invoicing-workflow',
    title: 'Automate Your Invoicing: Save 10+ Hours Monthly',
    excerpt: 'Set up automated invoicing, payment reminders, and expense tracking to focus on what you do best - creating.',
    category: 'Productivity',
    author: 'Alex Thompson',
    authorRole: 'Finance Automation Lead',
    date: '2024-01-05',
    readTime: '5 min read',
    image: '/blog/invoicing.jpg',
    featured: false,
    icon: Zap,
    tags: ['Invoicing', 'Automation', 'Finance']
  },
  {
    id: '6',
    slug: 'growing-freelance-business-2024',
    title: 'Scale Your Freelance Business: From Solo to Agency',
    excerpt: 'Ready to grow? Learn proven strategies for scaling your freelance work into a thriving creative agency.',
    category: 'Growth',
    author: 'Jennifer Walsh',
    authorRole: 'Business Growth Advisor',
    date: '2024-01-02',
    readTime: '12 min read',
    image: '/blog/scaling-business.jpg',
    featured: true,
    icon: TrendingUp,
    tags: ['Growth', 'Agency', 'Strategy']
  }
]

const CATEGORIES = ['All', 'AI Tools', 'Video', 'Business', 'Security', 'Productivity', 'Growth']

export default function BlogPage() {
  const featuredPosts = BLOG_POSTS.filter(post => post.featured)
  const recentPosts = BLOG_POSTS.filter(post => !post.featured)

  return (
    <div className="min-h-screen relative bg-slate-950">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" aria-hidden="true" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" aria-hidden="true"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" aria-hidden="true" />

      <main className="container mx-auto px-4 py-8 relative" role="main">
        {/* Header */}
        <header className="mb-12 text-center" aria-labelledby="blog-heading">
          <Badge className="mb-4 bg-blue-600/20 text-blue-400 border-blue-500/30">FreeFlow Blog</Badge>
          <h1 id="blog-heading" className="text-5xl font-bold mb-4 text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Insights & Resources
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Expert tips on AI tools, creative workflows, and building a successful freelance business.
          </p>
        </header>

        {/* Search & Categories */}
        <section aria-label="Search and filter" className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form role="search" className="flex gap-4 w-full md:w-auto">
              <Input
                type="search"
                placeholder="Search articles..."
                className="w-full md:w-80 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                aria-label="Search articles"
              />
              <Button
                type="submit"
                aria-label="Submit search"
                className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </Button>
            </form>
            <div className="flex gap-2 flex-wrap justify-center">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={category === 'All' ? 'default' : 'outline'}
                  size="sm"
                  className={category === 'All' ? 'bg-blue-600' : 'border-slate-700 text-gray-300 hover:bg-slate-800'}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section aria-labelledby="featured-heading" className="mb-16">
          <h2 id="featured-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post, index) => (
              <article
                key={post.id}
                className={`group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />

                  {/* Icon background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <post.icon className="w-48 h-48 text-blue-500" />
                  </div>

                  <div className={`relative z-20 p-6 ${index === 0 ? 'lg:p-10' : ''} h-full flex flex-col justify-end min-h-[280px] ${index === 0 ? 'lg:min-h-[400px]' : ''}`}>
                    <Badge className="mb-3 w-fit bg-blue-600/20 text-blue-400 border-blue-500/30">
                      {post.category}
                    </Badge>
                    <h3 className={`font-bold text-white mb-3 group-hover:text-blue-400 transition-colors ${
                      index === 0 ? 'text-3xl lg:text-4xl' : 'text-xl'
                    }`}>
                      {post.title}
                    </h3>
                    <p className={`text-gray-400 mb-4 ${index === 0 ? 'text-lg' : 'text-sm line-clamp-2'}`}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Recent Posts */}
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-2xl font-bold text-white mb-6">
            Recent Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <article
                key={post.id}
                className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:shadow-lg"
              >
                <Link href={`/blog/${post.slug}`} className="block p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
                      <post.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-gray-400">
                      {post.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                    <span className="flex items-center gap-1 text-blue-400 group-hover:translate-x-1 transition-transform">
                      Read more
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Stay Updated</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Get the latest tips on AI tools, freelancing, and creative business delivered to your inbox.
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              Subscribe
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}
