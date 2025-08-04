"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  BookmarkPlus,
  Search,
  Filter,
  Star,
  MessageCircle,
  Send,
  Plus,
  Calendar,
  MapPin,
  ExternalLink,
  UserPlus,
  Settings,
  Briefcase,
  Zap,
  Crown,
  Target
} from 'lucide-react'

// Types
interface CommunityMember {
  id: string
  name: string
  username: string
  avatar?: string
  bio: string
  location?: string
  skills: string[]
  rating: number
  projects: number
  joined: string
  verified: boolean
  online: boolean
}

interface Post {
  id: string
  author: CommunityMember
  content: string
  tags: string[]
  likes: number
  comments: number
  shares: number
  bookmarked: boolean
  liked: boolean
  createdAt: string
  type: 'text' | 'project' | 'question' | 'event' | 'job'
  projectData?: {
    title: string
    description: string
    skills: string[]
    budget?: string
  }
  eventData?: {
    title: string
    date: string
    location: string
    attendees: number
  }
}

interface CommunityHubProps {
  currentUserId: string
  onPostCreate?: (post: Omit<Post, 'id' | 'createdAt'>) => void
  onMemberConnect?: (memberId: string) => void
}

const MOCK_MEMBERS: CommunityMember[] = [
  {
    id: 'member_001',
    name: 'Sarah Johnson',
    username: '@sarahdesigns',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'UI/UX Designer specializing in SaaS products. 5+ years experience creating user-centered designs.',
    location: 'San Francisco, CA',
    skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research'],
    rating: 4.9,
    projects: 47,
    joined: '2023-03-15',
    verified: true,
    online: true
  },
  {
    id: 'member_002',
    name: 'Marcus Chen',
    username: '@marcusdev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    bio: 'Full-stack developer with expertise in React, Node.js, and cloud architecture.',
    location: 'Toronto, Canada',
    skills: ['React', 'Node.js', 'AWS', 'TypeScript'],
    rating: 4.8,
    projects: 62,
    joined: '2022-11-20',
    verified: true,
    online: false
  },
  {
    id: 'member_003',
    name: 'Elena Rodriguez',
    username: '@elenacontent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    bio: 'Content strategist and copywriter helping brands tell their stories effectively.',
    location: 'Madrid, Spain',
    skills: ['Content Strategy', 'Copywriting', 'SEO', 'Social Media'],
    rating: 4.7,
    projects: 34,
    joined: '2023-07-08',
    verified: false,
    online: true
  }
]

const MOCK_POSTS: Post[] = [
  {
    id: 'post_001',
    author: MOCK_MEMBERS[0],
    content: "Just completed a mobile app redesign project! The client saw a 40% increase in user engagement after implementing the new design system. Key takeaways: always start with user research and never underestimate the power of good micro-interactions. 🎨✨",
    tags: ['design', 'mobile', 'ux', 'success-story'],
    likes: 24,
    comments: 8,
    shares: 3,
    bookmarked: false,
    liked: false,
    createdAt: '2024-02-08T14:30:00Z',
    type: 'project',
    projectData: {
      title: 'FinTech Mobile App Redesign',
      description: 'Complete UI/UX overhaul focusing on user engagement and conversion optimization',
      skills: ['UI/UX Design', 'Mobile Design', 'Prototyping'],
      budget: '$5,000 - $8,000'
    }
  },
  {
    id: 'post_002',
    author: MOCK_MEMBERS[1],
    content: "Question for the community: What's your preferred approach for handling state management in large React applications? Redux Toolkit, Zustand, or Context API? Looking for real-world experiences and trade-offs.",
    tags: ['react', 'state-management', 'question', 'javascript'],
    likes: 18,
    comments: 15,
    shares: 2,
    bookmarked: true,
    liked: true,
    createdAt: '2024-02-07T10:15:00Z',
    type: 'question'
  },
  {
    id: 'post_003',
    author: MOCK_MEMBERS[2],
    content: "Hosting a virtual workshop next week: 'Building Brand Voice in the Digital Age'. We'll cover tone development, content pillars, and practical exercises. Free for community members! 🎯",
    tags: ['workshop', 'branding', 'content', 'education'],
    likes: 31,
    comments: 12,
    shares: 8,
    bookmarked: false,
    liked: false,
    createdAt: '2024-02-06T16:45:00Z',
    type: 'event',
    eventData: {
      title: 'Building Brand Voice in the Digital Age',
      date: '2024-02-15T18:00:00Z',
      location: 'Virtual (Zoom)',
      attendees: 47
    }
  }
]

export default function CommunityHub({ currentUserId, onPostCreate, onMemberConnect }: CommunityHubProps) {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [members, setMembers] = useState<CommunityMember[]>(MOCK_MEMBERS)
  const [searchQuery, setSearchQuery] = useState<any>('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'projects' | 'questions' | 'events' | 'jobs'>('all')
  const [newPostContent, setNewPostContent] = useState<any>('')
  const [newPostType, setNewPostType] = useState<Post['type']>('text')
  const [newPostTags, setNewPostTags] = useState<any>('')
  const [showCreatePost, setShowCreatePost] = useState<any>(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || post.type === selectedFilter
    return matchesSearch && matchesFilter
  })

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked, 
            likes: post.liked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ))
  }

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post
    ))
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return

    const newPost: Post = {
      id: `post_${Date.now()}`,
      author: MOCK_MEMBERS[0], // Current user
      content: newPostContent,
      tags: newPostTags.split(',').map(tag => tag.trim()).filter(Boolean),
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarked: false,
      liked: false,
      createdAt: new Date().toISOString(),
      type: newPostType
    }

    setPosts(prev => [newPost, ...prev])
    onPostCreate?.(newPost)
    
    // Reset form
    setNewPostContent('')
    setNewPostTags('')
    setNewPostType('text')
    setShowCreatePost(false)
  }

  const handleConnect = (memberId: string) => {
    onMemberConnect?.(memberId)
    console.log('Connecting with member:', memberId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Hub</h1>
          <p className="text-gray-600 mt-1">
            Connect, collaborate, and grow with fellow freelancers and creators
          </p>
        </div>
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Post Type</label>
                <select
                  value={newPostType}
                  onChange={(e) => setNewPostType(e.target.value as Post['type'])}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="text">General Post</option>
                  <option value="project">Project Showcase</option>
                  <option value="question">Question</option>
                  <option value="event">Event</option>
                  <option value="job">Job Posting</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your thoughts, ask a question, or showcase your work..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  placeholder="design, development, freelance"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePost} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">25,847</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Posts Today</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connections Made</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="mt-6">
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Posts</option>
                <option value="projects">Projects</option>
                <option value="questions">Questions</option>
                <option value="events">Events</option>
                <option value="jobs">Jobs</option>
              </select>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <Card key={post.id} className="mb-6 hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                          </Avatar>
                          {post.author.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{post.author.name}</h3>
                            {post.author.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{post.author.username} • {formatDate(post.createdAt)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {post.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">{post.content}</p>
                      
                      {post.projectData && (
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-blue-900">{post.projectData.title}</h4>
                                <p className="text-sm text-blue-700 mt-1">{post.projectData.description}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {post.projectData.skills.map(skill => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                                {post.projectData.budget && (
                                  <p className="text-sm font-medium text-green-600 mt-2">
                                    Budget: {post.projectData.budget}
                                  </p>
                                )}
                              </div>
                              <Briefcase className="w-8 h-8 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {post.eventData && (
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-green-900">{post.eventData.title}</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-green-700">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(post.eventData.date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {post.eventData.location}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {post.eventData.attendees} attending
                                  </div>
                                </div>
                              </div>
                              <Calendar className="w-8 h-8 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={post.liked ? 'text-red-500' : 'text-gray-500'}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500">
                            <Share2 className="w-4 h-4 mr-1" />
                            {post.shares}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(post.id)}
                          className={post.bookmarked ? 'text-blue-500' : 'text-gray-500'}
                        >
                          <BookmarkPlus className={`w-4 h-4 ${post.bookmarked ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search members..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(member => (
                <Card key={member.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        {member.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{member.name}</h3>
                          {member.verified && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{member.username}</p>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">{member.bio}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {member.rating}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {member.projects} projects
                          </div>
                          {member.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {member.location}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {member.skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleConnect(member.id)}
                            className="flex-1"
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Connect
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Community Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Event Title</label>
                      <Input placeholder="Enter event title..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Describe your event..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Date & Time</label>
                        <Input type="datetime-local" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Input placeholder="Virtual or physical location" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Event Type</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option value="workshop">Workshop</option>
                        <option value="networking">Networking</option>
                        <option value="webinar">Webinar</option>
                        <option value="meetup">Meetup</option>
                        <option value="conference">Conference</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                      <Button variant="outline">Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Upcoming Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'event_001',
                  title: 'Building Brand Voice in the Digital Age',
                  description: 'Learn how to develop a consistent brand voice across all digital platforms and touchpoints.',
                  date: '2024-02-15T18:00:00Z',
                  location: 'Virtual (Zoom)',
                  type: 'workshop',
                  attendees: 47,
                  organizer: MOCK_MEMBERS[2],
                  price: 'Free'
                },
                {
                  id: 'event_002',
                  title: 'Freelancer Networking Mixer',
                  description: 'Connect with fellow freelancers, share experiences, and build your professional network.',
                  date: '2024-02-20T19:00:00Z',
                  location: 'San Francisco, CA',
                  type: 'networking',
                  attendees: 23,
                  organizer: MOCK_MEMBERS[0],
                  price: '$15'
                },
                {
                  id: 'event_003',
                  title: 'Advanced React Patterns Webinar',
                  description: 'Deep dive into advanced React patterns including hooks, context, and performance optimization.',
                  date: '2024-02-25T14:00:00Z',
                  location: 'Virtual (YouTube Live)',
                  type: 'webinar',
                  attendees: 156,
                  organizer: MOCK_MEMBERS[1],
                  price: 'Free'
                }
              ].map(event => (
                <Card key={event.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="capitalize">
                          {event.type}
                        </Badge>
                        <Badge variant={event.price === 'Free' ? 'default' : 'outline'}>
                          {event.price}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.attendees} attending
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                          <AvatarFallback>{event.organizer.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">by {event.organizer.name}</span>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          Join Event
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}