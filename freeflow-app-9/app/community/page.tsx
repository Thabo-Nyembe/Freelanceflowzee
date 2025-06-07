'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  MessageSquare,
  Search,
  TrendingUp,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Award,
  Eye,
  Reply,
  Pin
} from 'lucide-react'

const forumCategories = [
  {
    id: 'general',
    name: 'General Discussion',
    description: 'General questions and discussions about FreeflowZee',
    icon: MessageSquare,
    topics: 156,
    posts: 1247,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Help for new users getting started with the platform',
    icon: BookOpen,
    topics: 89,
    posts: 634,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'feature-requests',
    name: 'Feature Requests',
    description: 'Suggest new features and improvements',
    icon: Lightbulb,
    topics: 67,
    posts: 423,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Get help with technical issues and bugs',
    icon: HelpCircle,
    topics: 134,
    posts: 892,
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'showcase',
    name: 'Project Showcase',
    description: 'Share your amazing projects with the community',
    icon: Award,
    topics: 78,
    posts: 456,
    color: 'bg-purple-100 text-purple-800'
  }
]

const recentTopics = [
  {
    id: 1,
    title: "How to set up custom domains for white-label clients?",
    category: "getting-started",
    author: "Sarah Johnson",
    avatar: "SJ",
    replies: 12,
    views: 234,
    lastActivity: "2 hours ago",
    isPinned: false,
    isHot: true
  },
  {
    id: 2,
    title: "Feature Request: Bulk project export functionality",
    category: "feature-requests",
    author: "Mike Chen",
    avatar: "MC",
    replies: 8,
    views: 156,
    lastActivity: "4 hours ago",
    isPinned: false,
    isHot: false
  },
  {
    id: 3,
    title: "Payment integration not working with European banks",
    category: "troubleshooting",
    author: "Emily Rodriguez",
    avatar: "ER",
    replies: 15,
    views: 298,
    lastActivity: "6 hours ago",
    isPinned: false,
    isHot: true
  },
  {
    id: 4,
    title: "Welcome to the FreeflowZee Community!",
    category: "general",
    author: "FreeflowZee Team",
    avatar: "FT",
    replies: 45,
    views: 1234,
    lastActivity: "1 day ago",
    isPinned: true,
    isHot: false
  }
]

const topContributors = [
  { name: "Alex Thompson", posts: 234, reputation: 1567, avatar: "AT", badge: "Expert" },
  { name: "Lisa Wang", posts: 189, reputation: 1234, avatar: "LW", badge: "Helper" },
  { name: "John Smith", posts: 156, reputation: 987, avatar: "JS", badge: "Contributor" },
  { name: "Maria Garcia", posts: 134, reputation: 876, avatar: "MG", badge: "Helper" }
]

const communityStats = [
  { label: "Total Members", value: "12.5k", icon: Users },
  { label: "Topics Created", value: "524", icon: MessageSquare },
  { label: "Posts This Week", value: "1.2k", icon: TrendingUp },
  { label: "Active Today", value: "234", icon: Clock }
]

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showOnlineUsers, setShowOnlineUsers] = useState(false)
  const [liveActivity, setLiveActivity] = useState([
    { user: 'Alex T.', action: 'replied to', topic: 'Payment integration help', time: '2 min ago' },
    { user: 'Sarah J.', action: 'created', topic: 'New feature suggestion', time: '5 min ago' },
    { user: 'Mike C.', action: 'liked', topic: 'Welcome to the community', time: '8 min ago' }
  ])
  const [onlineUsers] = useState([
    { name: 'Alex Thompson', avatar: 'AT', status: 'online' },
    { name: 'Sarah Johnson', avatar: 'SJ', status: 'online' },
    { name: 'Mike Chen', avatar: 'MC', status: 'away' },
    { name: 'Lisa Wang', avatar: 'LW', status: 'online' }
  ])

  const filteredTopics = recentTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleTopicClick = (topic: typeof recentTopics[0]) => {
    alert(`Opening topic: ${topic.title}. Full forum functionality coming soon!`)
  }

  const handleJoinCommunity = () => {
    alert('Redirecting to community signup. Full community features coming soon!')
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Expert': return 'bg-purple-100 text-purple-800'
      case 'Helper': return 'bg-blue-100 text-blue-800'
      case 'Contributor': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Users className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Community Forum
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Connect with fellow creators, get help, share your work, and help shape the future of FreeflowZee.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleJoinCommunity}>
                  <Plus className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
                <Link href="/signup">
                  <Button size="lg" variant="outline">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Create Account
                  </Button>
                </Link>
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search discussions..."
                  className="pl-12 pr-4 py-3 text-lg bg-white border-gray-300 focus:border-indigo-500 rounded-lg shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
              {communityStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Live Activity & Online Users */}
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Live Activity Feed */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Live Activity
                  </CardTitle>
                  <CardDescription>Real-time community activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {liveActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {activity.user.split(' ')[0][0]}{activity.user.split(' ')[1]?.[0] || ''}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
                            <span className="text-indigo-600 hover:underline cursor-pointer">
                              {activity.topic}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setLiveActivity([
                      { user: 'New User', action: 'joined', topic: 'the community', time: 'just now' },
                      ...liveActivity.slice(0, 2)
                    ])}
                  >
                    Refresh Activity
                  </Button>
                </CardContent>
              </Card>

              {/* Online Users */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      Online Users ({onlineUsers.filter(u => u.status === 'online').length})
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                    >
                      {showOnlineUsers ? 'Hide' : 'Show'}
                    </Button>
                  </CardTitle>
                  <CardDescription>Community members currently online</CardDescription>
                </CardHeader>
                <CardContent>
                  {showOnlineUsers && (
                    <div className="space-y-3">
                      {onlineUsers.map((user, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.avatar}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.status}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {!showOnlineUsers && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Click "Show" to see online users</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Forum Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Forum Categories
              </h2>
              <p className="text-lg text-gray-600">
                Browse discussions by category
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forumCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                        <category.icon className="w-8 h-8 text-gray-700" />
                      </div>
                      <Badge className={category.color}>
                        {category.name}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{category.topics} topics</span>
                      <span>{category.posts} posts</span>
                    </div>
                    <Button 
                      className="w-full group-hover:bg-indigo-700 transition-colors"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      Browse Category
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Discussions */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Recent Discussions
                </h2>
                <p className="text-lg text-gray-600">
                  Latest topics from the community
                </p>
              </div>
              
              <Button onClick={handleJoinCommunity}>
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            </div>

            <div className="space-y-4">
              {filteredTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTopicClick(topic)}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {topic.avatar}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {topic.isPinned && <Pin className="w-4 h-4 text-indigo-600" />}
                          {topic.isHot && <Badge className="bg-red-100 text-red-800">Hot</Badge>}
                          <Badge variant="outline" className="text-xs">
                            {forumCategories.find(cat => cat.id === topic.category)?.name}
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                          {topic.title}
                        </h3>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>By {topic.author}</span>
                          <div className="flex items-center space-x-1">
                            <Reply className="w-4 h-4" />
                            <span>{topic.replies} replies</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{topic.views} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{topic.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                      
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Top Contributors */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Top Contributors
              </h2>
              <p className="text-lg text-gray-600">
                Community members who help make FreeflowZee better
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topContributors.map((contributor, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {contributor.avatar}
                    </div>
                    <CardTitle className="text-xl">{contributor.name}</CardTitle>
                    <Badge className={getBadgeColor(contributor.badge)}>
                      {contributor.badge}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Posts:</span>
                        <span className="font-semibold">{contributor.posts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reputation:</span>
                        <span className="font-semibold">{contributor.reputation}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to join our community?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Connect with thousands of creators, get help, and share your expertise.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100" onClick={handleJoinCommunity}>
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
              <Link href="/support">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Get Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 