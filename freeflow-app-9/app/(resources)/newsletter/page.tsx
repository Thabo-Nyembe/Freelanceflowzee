'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DemoModal } from '@/components/demo-modal'
import { 
  Mail, 
  Send, 
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  Clock,
  Download,
  Eye,
  Heart,
  Share2,
  Bell
} from 'lucide-react'

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
    preview: "Remote work doesn't have to mean isolated work. Learn strategies for effective team collaboration...",
    readTime: "6 min read",
    subscribers: 2450,
    openRate: "72%",
    featured: false
  },
  {
    id: 3,
    title: "2024 Design Trends & Predictions",
    date: "January 1, 2024",
    preview: "As we enter 2024, let's explore the design trends that will shape the creative landscape this year...",
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
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail('')
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
                <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white text-gray-900 border-0"
                    required
                  />"
                  <Button type="submit" size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Subscribe
                  </Button>
                </form>
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
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Read
                          </Button>
                          <Button size="sm" variant="outline">
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
                    Don't miss out on the latest creative insights and industry updates.
                  </p>
                  {!isSubscribed ? (
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Button type="submit" className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Subscribe Now
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-600 font-medium">You're subscribed!</p>
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowDemoModal(true)}
                  >"
                    <Eye className="w-4 h-4 mr-2" />
                    Browse Archive
                  </Button>
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
            {!isSubscribed ? (
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => setShowDemoModal(true)}
              >"
                <Mail className="w-5 h-5 mr-2" />
                Subscribe for Free
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => setShowDemoModal(true)}
              >"
                <Eye className="w-5 h-5 mr-2" />
                Read Latest Issue
              </Button>
            )}
          </div>
        </div>
      </main>

      <DemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
        title="Newsletter Archive
        description="Browse our complete collection of creative insights and industry updates
      />
    </div>
  )
}
