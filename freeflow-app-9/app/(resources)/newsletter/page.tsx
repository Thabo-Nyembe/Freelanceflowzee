'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Mail,
  Send,
  Calendar,
  Users,
  CheckCircle,
  Star,
  Clock,
  Download,
  Eye,
  Share2,
  Bell
} from 'lucide-react'
import { toast } from 'sonner'

const newsletterArchive = [
  {
    id: 1,
    title: "AI Revolution in Creative Workflows",
    date: "January 15, 2024",
    preview: "Discover how AI is transforming the creative industry and learn about the latest tools that are changing the game...",
    readTime: "8 min read",
    subscribers: 2500,
    openRate: "68%",
    featured: true
  },
  {
    id: 2,
    title: "Collaboration Best Practices for Remote Teams",
    date: "January 8, 2024",
    preview: "Remote work doesn&apos;t have to mean isolated work. Learn strategies for effective team collaboration...",
    readTime: "6 min read",
    subscribers: 2450,
    openRate: "72%",
    featured: false
  },
  {
    id: 3,
    title: "2024 Design Trends & Predictions",
    date: "January 1, 2024",
    preview: "As we enter 2024, let&apos;s explore the design trends that will shape the creative landscape this year...",
    readTime: "10 min read",
    subscribers: 2600,
    openRate: "75%",
    featured: false
  }
]

const stats = [
  { label: "Subscribers", value: "2.5K+", icon: Users, color: "text-blue-600" },
  { label: "Open Rate", value: "72%", icon: Eye, color: "text-green-600" },
  { label: "Issues Sent", value: "24", icon: Mail, color: "text-purple-600" },
  { label: "Avg. Read Time", value: "8 min", icon: Clock, color: "text-orange-600" }
]

const benefits = [
  "Weekly insights on creative tools and workflows",
  "Exclusive access to new features and updates",
  "Industry trends and expert interviews",
  "Community spotlights and success stories",
  "Free resources and downloadable templates",
  "Early access to webinars and events"
]

export default function NewsletterPage() {
  const [email, setEmail] = useState<any>('')
  const [isSubscribed, setIsSubscribed] = useState<any>(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showDemoModal, setShowDemoModal] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'newsletter_page',
          metadata: {
            page: 'newsletter',
            timestamp: new Date().toISOString()
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSubscribed(true)
        setEmail('')

        // Show success toast with next steps
        setTimeout(() => {
          const title = result.alreadySubscribed
            ? 'Already subscribed'
            : result.reactivated
            ? 'Welcome back!'
            : 'Successfully subscribed!'

          toast.success(title, {
            description: result.message
          })
        }, 500)
      } else {
        setErrorMessage(result.error || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setErrorMessage('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Weekly Newsletter</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Stay in the Creative Loop
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Get weekly insights, tips, and updates about the latest creative tools, 
                workflows, and industry trends delivered straight to your inbox.
              </p>

              {/* Subscription Form */}
              {!isSubscribed ? (
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleSubscribe} className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-white text-gray-900 border-0"
                      required
                      disabled={isSubmitting}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={isSubmitting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                  </form>
                  {errorMessage && (
                    <div className="mt-3 text-red-300 text-sm text-center">
                      {errorMessage}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 bg-green-500/20 rounded-lg p-4 max-w-md mx-auto">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-green-100">Thanks for subscribing! Check your email for confirmation.</span>
                </div>
              )}

              <p className="text-blue-200 text-sm mt-4">
                Join 2,500+ creators • No spam, unsubscribe anytime
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-3`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Newsletter Archive */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Recent Issues</h2>
                <Button variant="outline" onClick={() => setShowDemoModal(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>

              <div className="space-y-6">
                {newsletterArchive.map((issue) => (
                  <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{issue.title}</h3>
                            {issue.featured && (
                              <Badge className="bg-orange-100 text-orange-800">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4">{issue.preview}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {issue.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {issue.readTime}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {issue.subscribers} readers
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link href="/blog">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Read Articles
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: 'KAZI Newsletter',
                                  text: 'Check out the latest KAZI newsletter!',
                                  url: window.location.href
                                }).catch(() => {
                                  navigator.clipboard.writeText(window.location.href)
                                })
                              } else {
                                navigator.clipboard.writeText(window.location.href)
                              }
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Why Subscribe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    Why Subscribe?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4">
                    "The FreeflowZee newsletter has become an essential part of my weekly reading. 
                    The insights and tips have significantly improved my creative workflow.
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      SJ
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Sarah Johnson</div>
                      <div className="text-sm text-gray-600">Creative Director</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Subscribe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-500" />
                    Quick Subscribe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Don&apos;t miss out on the latest creative insights and industry updates.
                  </p>
                  {!isSubscribed ? (
                    <div>
                      <form onSubmit={handleSubscribe} className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
                        </Button>
                      </form>
                      {errorMessage && (
                        <div className="mt-2 text-red-600 text-xs text-center">
                          {errorMessage}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-600 font-medium">You&apos;re subscribed!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Archive Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-orange-500" />
                    Full Archive
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Access our complete newsletter archive with 24+ issues of creative insights.
                  </p>
                  <Link href="/blog">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Browse Articles
                    </Button>
                  </Link>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Level Up Your Creative Game?</h3>
            <p className="text-purple-100 mb-6">
              Join thousands of creators who rely on our weekly insights to stay ahead of the curve.
            </p>
            <Link href="/blog">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Eye className="w-5 h-5 mr-2" />
                {isSubscribed ? 'Read Latest Articles' : 'Browse Articles'}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
