'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DemoModal } from '@/components/demo-modal'
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Calendar,
  Clock,
  TrendingUp,
  Star,
  Bookmark,
  Filter,
  Search,
  Plus
} from 'lucide-react'

export default function CommunityPage() {
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [activeTab, setActiveTab] = useState('discussions')

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">KAZI Community</h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Connect with 2,800+ verified creative professionals worldwide. Share your work, 
                get feedback, find collaborators, and grow your business in our thriving community.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => setShowDemoModal(true)}
                >"
                  <Plus className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >"
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Discussion
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">2.5K+</div>
                <div className="text-gray-600">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">850+</div>
                <div className="text-gray-600">Discussions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">1.2K+</div>
                <div className="text-gray-600">Projects Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">95%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Sidebar */}
              <div className="lg:w-1/4">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TabsList className="grid w-full grid-cols-1 gap-2">
                      <TabsTrigger value="discussions" className="w-full justify-start">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Discussions
                      </TabsTrigger>
                      <TabsTrigger value="showcase" className="w-full justify-start">
                        <Star className="w-4 h-4 mr-2" />
                        Showcase
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="w-full justify-start">
                        <Bookmark className="w-4 h-4 mr-2" />
                        Resources
                      </TabsTrigger>
                      <TabsTrigger value="events" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Events
                      </TabsTrigger>
                    </TabsList>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="lg:w-3/4">
                
                <TabsContent value="discussions" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Community Discussions</h2>
                    <Button onClick={() => setShowDemoModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Discussion
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              JD
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-2">
                                How to optimize AI-generated content for better engagement?
                              </h3>
                              <p className="text-gray-600 text-sm mb-3">
                                I&apos;ve been experimenting with AI content generation and looking for best practices...
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  24 likes
                                </div>
                                <div className="flex items-center">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  12 replies
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  2 hours ago
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="showcase" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Project Showcase</h2>
                    <Button onClick={() => setShowDemoModal(true)}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Project
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg"></div>
                          <div className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">Amazing AI Art Project</h3>
                            <p className="text-gray-600 text-sm mb-3">
                              Created this stunning piece using KAZI's multi-model AI tools! The GPT-4o integration made the creative process so much smoother. ✨
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                                  M
                                </div>
                                <span className="text-sm text-gray-600">Mike Chen</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Heart className="w-4 h-4" />
                                45
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Community Resources</h2>
                  
                  <div className="space-y-4">
                    {[
                      { title: "AI Content Creation Guide", type: "Guide", author: "Sarah J." },
                      { title: "Workflow Templates", type: "Template", author: "Alex K." },
                      { title: "Design System Components", type: "Resource", author: "Emma L." },
                    ].map((resource, i) => (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                              <p className="text-gray-600 text-sm">Shared by {resource.author}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{resource.type}</Badge>
                              <Button size="sm" variant="outline">
                                <Bookmark className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="events" className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                  
                  <div className="space-y-4">
                    {[
                      { title: "AI Tools Workshop", date: "Jan 25, 2024", time: "2:00 PM EST" },
                      { title: "Community Showcase", date: "Feb 1, 2024", time: "3:00 PM EST" },
                    ].map((event, i) => (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{event.title}</h3>
                              <p className="text-gray-600 text-sm">{event.date} at {event.time}</p>
                            </div>
                            <Button size="sm" onClick={() => setShowDemoModal(true)}>
                              Join Event
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

              </div>
            </div>
          </Tabs>
        </div>
      </main>

      <DemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
        title="Join the Community"
        description="Connect with fellow creators and start collaborating!"
      />
    </div>
  )
}
