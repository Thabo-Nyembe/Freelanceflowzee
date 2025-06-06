'use client'

import { useState, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { DemoModal } from '@/components/demo-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react'

// Mock data for blog posts
const blogPosts = {
  "streamlining-creative-workflow-2024": {
    title: "10 Essential Tips for Streamlining Your Creative Workflow in 2024",
    content: `
      <p>In today's fast-paced creative industry, efficiency isn't just a nice-to-have—it's essential for success. Whether you're a freelance designer, photographer, writer, or any other creative professional, streamlining your workflow can make the difference between thriving and just surviving.</p>
      
      <h2>1. Embrace Project Management Tools</h2>
      <p>The foundation of any streamlined workflow starts with organization. Modern project management tools like Asana, Trello, or Monday.com can transform how you track tasks, deadlines, and client communications.</p>
      
      <h2>2. Create Template Systems</h2>
      <p>Stop reinventing the wheel for every project. Develop templates for contracts, proposals, creative briefs, and even project folder structures. This single change can save hours per project.</p>
      
      <h2>3. Automate Repetitive Tasks</h2>
      <p>Look for opportunities to automate routine tasks. This could include automated invoice generation, social media posting, or file backup systems.</p>
      
      <h2>4. Establish Clear Communication Protocols</h2>
      <p>Set expectations with clients about communication methods, response times, and feedback processes. This prevents miscommunication and reduces back-and-forth.</p>
      
      <h2>5. Time Block Your Schedule</h2>
      <p>Dedicate specific time blocks for different types of work: creative time, administrative tasks, client calls, and marketing activities.</p>
      
      <h2>6. Use Cloud-Based Storage</h2>
      <p>Ensure all your files are accessible from anywhere with cloud storage solutions. This enables remote work and protects against data loss.</p>
      
      <h2>7. Implement Version Control</h2>
      <p>Develop a systematic approach to file naming and version control to avoid confusion and lost work.</p>
      
      <h2>8. Create Standard Operating Procedures</h2>
      <p>Document your processes so they can be repeated consistently and potentially delegated to others as you grow.</p>
      
      <h2>9. Regular Workflow Reviews</h2>
      <p>Schedule monthly reviews of your workflow to identify bottlenecks and opportunities for improvement.</p>
      
      <h2>10. Invest in the Right Tools</h2>
      <p>Don't be afraid to invest in quality software and hardware that can significantly improve your efficiency and output quality.</p>
      
      <h2>Conclusion</h2>
      <p>Streamlining your creative workflow isn't about becoming a robot—it's about creating more space for creativity by reducing the time spent on administrative tasks. Start with one or two of these tips and gradually implement more as they become habits.</p>
    `,
    excerpt: "Discover proven strategies to optimize your creative process, reduce time spent on administrative tasks, and focus more on what you love doing.",
    author: "Sarah Johnson",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b692?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-15",
    readTime: "8 min read",
    category: "Workflow Tips",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop",
    tags: ["Productivity", "Workflow", "Tips", "2024"]
  },
  "pricing-creative-services-guide": {
    title: "How to Price Your Creative Services: A Complete Guide",
    content: `
      <p>Pricing creative work is one of the biggest challenges freelancers and agencies face. Price too low, and you undervalue your expertise. Price too high, and you might lose potential clients. This comprehensive guide will help you find the sweet spot.</p>
      
      <h2>Understanding Different Pricing Models</h2>
      <p>There are several approaches to pricing creative services, each with its own advantages and disadvantages.</p>
      
      <h3>Hourly Pricing</h3>
      <p>Best for: New freelancers, projects with unclear scope, ongoing retainer work.</p>
      <p>Pros: Predictable income, easy to calculate, protects against scope creep.</p>
      <p>Cons: Can feel transactional, doesn't reflect value, caps your earning potential.</p>
      
      <h3>Project-Based Pricing</h3>
      <p>Best for: Defined projects with clear deliverables, experienced freelancers.</p>
      <p>Pros: Rewards efficiency, easier client budgeting, higher profit potential.</p>
      <p>Cons: Risk of underestimating time, scope creep challenges.</p>
      
      <h3>Value-Based Pricing</h3>
      <p>Best for: Experienced professionals, high-impact projects, strategic work.</p>
      <p>Pros: Highest earning potential, reflects true value, client-focused.</p>
      <p>Cons: Harder to calculate, requires deep client understanding.</p>
      
      <h2>Calculating Your Base Rate</h2>
      <p>Start by determining your minimum viable rate based on your expenses and desired profit margin.</p>
      
      <h2>Research Market Rates</h2>
      <p>Understand what others in your field and location are charging for similar services.</p>
      
      <h2>Factor in Your Experience</h2>
      <p>Adjust your rates based on your experience level, portfolio quality, and specialized skills.</p>
      
      <h2>Consider Project Complexity</h2>
      <p>More complex projects should command higher rates due to increased skill requirements and potential risks.</p>
      
      <h2>Building Pricing Confidence</h2>
      <p>The key to successful pricing is confidence. Know your worth, communicate value clearly, and don't be afraid to walk away from low-paying projects.</p>
    `,
    excerpt: "Learn the fundamentals of pricing creative work, from hourly rates to project-based pricing strategies that maximize your value.",
    author: "Michael Chen",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-12",
    readTime: "12 min read",
    category: "Business Growth",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    tags: ["Pricing", "Business", "Strategy"]
  },
  "building-client-relationships": {
    title: "Building Long-term Client Relationships That Last",
    content: `
      <p>The difference between a struggling freelancer and a successful one often comes down to client relationships. Long-term clients provide stability, reduce marketing costs, and often become your best source of referrals.</p>
      
      <h2>The Foundation: Trust and Communication</h2>
      <p>Every lasting client relationship is built on trust and clear communication. This starts from your very first interaction.</p>
      
      <h2>Exceed Expectations Consistently</h2>
      <p>Delivering what you promise is table stakes. To build lasting relationships, you need to consistently exceed expectations in small but meaningful ways.</p>
      
      <h2>Be Proactive in Communication</h2>
      <p>Don't wait for clients to ask for updates. Regular check-ins and progress reports show professionalism and care.</p>
      
      <h2>Understand Their Business Goals</h2>
      <p>The more you understand your client's business objectives, the better you can align your work with their success.</p>
      
      <h2>Handle Problems Gracefully</h2>
      <p>Issues will arise in every project. How you handle them determines whether the relationship strengthens or weakens.</p>
      
      <h2>Add Value Beyond Your Core Service</h2>
      <p>Share industry insights, make introductions, offer strategic advice. Position yourself as a valuable business partner, not just a service provider.</p>
      
      <h2>Stay in Touch Between Projects</h2>
      <p>Don't disappear once a project ends. Regular check-ins, holiday greetings, and sharing relevant opportunities keeps you top of mind.</p>
      
      <h2>Create a Client Retention Strategy</h2>
      <p>Develop systems to nurture existing relationships, track client satisfaction, and identify opportunities for additional work.</p>
    `,
    excerpt: "Discover the secrets to turning one-time clients into long-term partners who provide consistent work and referrals.",
    author: "Emily Rodriguez",
    authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-10",
    readTime: "6 min read",
    category: "Client Management",
    image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&h=400&fit=crop",
    tags: ["Clients", "Relationships", "Growth"]
  },
  "future-creative-collaboration-ai": {
    title: "The Future of Creative Collaboration: AI Tools and Human Creativity",
    content: `
      <p>Artificial Intelligence is revolutionizing the creative industry, but it's not here to replace human creativity—it's here to amplify it. Understanding how to leverage AI while maintaining your unique creative voice is becoming essential for modern creatives.</p>
      
      <h2>Current AI Tools Transforming Creative Work</h2>
      <p>From text generation to image creation, AI tools are already changing how we work.</p>
      
      <h3>Text and Content Creation</h3>
      <p>Tools like GPT-4, Claude, and specialized writing assistants can help with brainstorming, research, and initial drafts.</p>
      
      <h3>Visual Design and Art</h3>
      <p>Midjourney, DALL-E, and Stable Diffusion are revolutionizing visual concept generation and illustration.</p>
      
      <h3>Video and Animation</h3>
      <p>AI-powered tools are making video editing, animation, and even virtual production more accessible.</p>
      
      <h2>The Human-AI Creative Partnership</h2>
      <p>The most effective approach isn't human vs. AI—it's human with AI. Here's how to create synergy:</p>
      
      <h3>AI for Ideation and Iteration</h3>
      <p>Use AI to generate multiple concepts quickly, then apply human judgment to select and refine the best ideas.</p>
      
      <h3>Automating Repetitive Tasks</h3>
      <p>Let AI handle time-consuming technical tasks so you can focus on creative strategy and execution.</p>
      
      <h3>Enhanced Research and Inspiration</h3>
      <p>AI can process vast amounts of information to provide insights and inspiration for your creative projects.</p>
      
      <h2>Maintaining Your Creative Identity</h2>
      <p>While embracing AI tools, it's crucial to maintain what makes your work uniquely yours.</p>
      
      <h2>Ethical Considerations</h2>
      <p>Discuss transparency, attribution, and the importance of human oversight in AI-assisted creative work.</p>
      
      <h2>Future Trends to Watch</h2>
      <p>Explore emerging AI technologies and their potential impact on creative industries.</p>
      
      <h2>Getting Started with AI Tools</h2>
      <p>Practical advice for creatives looking to integrate AI into their workflow.</p>
    `,
    excerpt: "Explore how AI is transforming the creative industry and learn how to leverage these tools while maintaining your unique creative voice.",
    author: "David Park",
    authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-08",
    readTime: "10 min read",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    tags: ["AI", "Technology", "Future"]
  },
  "freelancer-to-agency-scaling": {
    title: "From Freelancer to Agency: Scaling Your Creative Business",
    content: `
      <p>Making the transition from solo freelancer to agency owner is exciting but challenging. This comprehensive guide will walk you through the key steps to scale your creative business successfully.</p>
      
      <h2>When to Make the Transition</h2>
      <p>Signs that you're ready to scale from freelancer to agency.</p>
      
      <h2>Building Your First Team</h2>
      <p>Strategies for hiring your first employees or contractors.</p>
      
      <h2>Systemizing Your Operations</h2>
      <p>Creating processes that work without your direct involvement.</p>
      
      <h2>Managing Cash Flow During Growth</h2>
      <p>Financial planning for the challenges of scaling a creative business.</p>
      
      <h2>Developing Your Brand and Market Position</h2>
      <p>How to position your agency in a competitive market.</p>
      
      <h2>Leadership and Management Skills</h2>
      <p>Transitioning from doer to leader and manager.</p>
      
      <h2>Common Pitfalls and How to Avoid Them</h2>
      <p>Learn from others' mistakes to avoid common scaling challenges.</p>
    `,
    excerpt: "A step-by-step guide to growing your solo practice into a thriving creative agency, including team building and process optimization.",
    author: "Lisa Thompson",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b692?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-05",
    readTime: "15 min read",
    category: "Business Growth",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    tags: ["Scaling", "Agency", "Growth"]
  },
  "time-management-creative-professionals": {
    title: "Mastering Time Management for Creative Professionals",
    content: `
      <p>Time management for creatives is unique. Unlike traditional office work, creative projects involve inspiration, iteration, and unpredictable breakthroughs. This guide helps you balance structure with creative freedom.</p>
      
      <h2>Understanding Creative Time</h2>
      <p>Creative work doesn't follow traditional time patterns. Learn to work with your natural rhythms.</p>
      
      <h2>The Creative Time Blocking Method</h2>
      <p>Adapt time blocking for creative work with flexible buffers and inspiration time.</p>
      
      <h2>Managing Creative Blocks</h2>
      <p>Strategies for maintaining productivity even when inspiration isn't flowing.</p>
      
      <h2>Balancing Client Work and Personal Projects</h2>
      <p>How to maintain your creative passion while meeting client demands.</p>
      
      <h2>Tools and Techniques for Creative Time Management</h2>
      <p>Software and methods specifically designed for creative professionals.</p>
      
      <h2>Energy Management vs. Time Management</h2>
      <p>Why managing your energy might be more important than managing your time.</p>
      
      <h2>Setting Boundaries with Clients and Projects</h2>
      <p>Protecting your creative time while maintaining professional relationships.</p>
    `,
    excerpt: "Proven time management techniques specifically designed for creative work, including dealing with inspiration strikes and creative blocks.",
    author: "James Wilson",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-03",
    readTime: "7 min read",
    category: "Workflow Tips",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=400&fit=crop",
    tags: ["Time Management", "Productivity", "Workflow"]
  },
  "client-communication-best-practices": {
    title: "Client Communication Best Practices for Smoother Projects",
    content: `
      <p>Poor communication is the root cause of most project problems. Mastering client communication can transform your business, reduce stress, and increase client satisfaction.</p>
      
      <h2>Setting Communication Expectations Early</h2>
      <p>Establish clear communication protocols from the project kickoff.</p>
      
      <h2>The Art of Active Listening</h2>
      <p>Understanding what clients really need, not just what they say they want.</p>
      
      <h2>Regular Check-ins and Updates</h2>
      <p>Creating a rhythm of communication that keeps projects on track.</p>
      
      <h2>Managing Difficult Conversations</h2>
      <p>Techniques for handling scope changes, feedback, and conflicts professionally.</p>
      
      <h2>Visual Communication Techniques</h2>
      <p>Using visuals to bridge communication gaps in creative projects.</p>
      
      <h2>Digital Communication Best Practices</h2>
      <p>Making the most of email, Slack, video calls, and project management tools.</p>
      
      <h2>Building Long-term Communication Habits</h2>
      <p>Systems for maintaining strong communication throughout the client relationship.</p>
    `,
    excerpt: "Essential communication strategies that prevent misunderstandings, reduce revisions, and keep projects on track from start to finish.",
    author: "Anna Martinez",
    authorImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face",
    publishDate: "2024-12-01",
    readTime: "9 min read",
    category: "Client Management",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    tags: ["Communication", "Clients", "Projects"]
  }
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [email, setEmail] = useState('')
  
  // Unwrap the Promise using React.use()
  const { slug } = use(params)
  const post = blogPosts[slug as keyof typeof blogPosts]
  
  if (!post) {
    notFound()
  }

  const handleSubscribe = () => {
    if (email.trim()) {
      setIsSubscribed(true)
      setEmail('')
    }
  }

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/blog/${slug}`
    const text = `Check out this article: ${post.title}`
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Breadcrumb */}
        <section className="bg-white py-4 border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-indigo-600">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-indigo-600">Blog</Link>
              <span>/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>
          </div>
        </section>

        {/* Article Header */}
        <section className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">{post.category}</Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Image
                    src={post.authorImage}
                    alt={post.author}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span>By {post.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                </div>
                <span>{post.readTime}</span>
              </div>
            </div>
            
            <div className="relative h-96 rounded-lg overflow-hidden mb-8">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className="text-sm text-gray-500">Share this article:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="text-blue-500 hover:bg-blue-50"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="text-blue-600 hover:bg-blue-50"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="text-blue-700 hover:bg-blue-50"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
              <span className="text-sm text-gray-500 mr-2">Tags:</span>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-indigo-50 py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Want more insights like this?
            </h3>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter and get the latest articles, tips, and resources delivered to your inbox.
            </p>
            
            {isSubscribed ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">🎉 Thanks for subscribing!</p>
                <p className="text-sm">You'll receive our latest content in your inbox.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  suppressHydrationWarning
                />
                <Button 
                  onClick={handleSubscribe}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Subscribe
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Related Articles */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Related Articles
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {Object.entries(blogPosts)
                .filter(([postSlug]) => postSlug !== slug)
                .slice(0, 3)
                .map(([slug, relatedPost]) => (
                  <Card key={slug} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <CardHeader>
                      <Badge variant="outline" className="w-fit mb-2">{relatedPost.category}</Badge>
                      <CardTitle className="text-lg hover:text-indigo-600 transition-colors">
                        <Link href={`/blog/${slug}`}>
                          {relatedPost.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{relatedPost.author}</span>
                        <span>•</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/blog">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
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