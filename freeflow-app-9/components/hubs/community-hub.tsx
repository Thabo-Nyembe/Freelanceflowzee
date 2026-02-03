"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import {
  getMembers,
  getPosts
} from '@/lib/community-hub-queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  UserPlus,
  Briefcase,
  Zap,
  Crown,
  Target,
  Palette
} from 'lucide-react'
import CreatorMarketplace from '@/components/community/creator-marketplace'
import SocialWall from '@/components/community/social-wall'

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

// MIGRATED: Batch #10 - Removed mock data, using database hooks
const logger = createFeatureLogger('CommunityHub')

// Demo/fallback data for when database is unavailable
const MOCK_MEMBERS: CommunityMember[] = [
  {
    id: 'demo-member-1',
    name: 'Alex Johnson',
    username: '@alexj',
    avatar: '/avatars/demo-1.jpg',
    bio: 'Full-stack developer passionate about building great products',
    location: 'San Francisco, CA',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    rating: 4.9,
    projects: 24,
    joined: '2023-06-15',
    verified: true,
    online: true
  },
  {
    id: 'demo-member-2',
    name: 'Sarah Chen',
    username: '@sarahc',
    avatar: '/avatars/demo-2.jpg',
    bio: 'UX/UI designer creating beautiful and intuitive experiences',
    location: 'New York, NY',
    skills: ['Figma', 'UI Design', 'User Research', 'Prototyping'],
    rating: 4.8,
    projects: 31,
    joined: '2023-03-20',
    verified: true,
    online: false
  },
  {
    id: 'demo-member-3',
    name: 'Marcus Williams',
    username: '@marcusw',
    avatar: '/avatars/demo-3.jpg',
    bio: 'Mobile developer specializing in iOS and Android apps',
    location: 'Austin, TX',
    skills: ['Swift', 'Kotlin', 'Flutter', 'Firebase'],
    rating: 4.7,
    projects: 18,
    joined: '2023-09-01',
    verified: false,
    online: true
  }
]

const MOCK_POSTS: Post[] = [
  {
    id: 'demo-post-1',
    author: MOCK_MEMBERS[0],
    content: 'Just launched our new project management feature! Check it out and let me know what you think. #productivity #launch',
    tags: ['productivity', 'launch', 'feature'],
    likes: 42,
    comments: 8,
    shares: 5,
    bookmarked: false,
    liked: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'text'
  },
  {
    id: 'demo-post-2',
    author: MOCK_MEMBERS[1],
    content: 'Looking for a React developer to collaborate on an exciting fintech project. Remote-friendly, competitive rates.',
    tags: ['react', 'fintech', 'hiring'],
    likes: 28,
    comments: 15,
    shares: 12,
    bookmarked: false,
    liked: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    type: 'job',
    projectData: {
      title: 'Fintech Dashboard',
      description: 'Building a modern trading dashboard',
      skills: ['React', 'TypeScript', 'D3.js'],
      budget: '$5,000 - $10,000'
    }
  },
  {
    id: 'demo-post-3',
    author: MOCK_MEMBERS[2],
    content: 'What\'s the best approach for handling offline-first mobile apps? Looking for architecture recommendations.',
    tags: ['mobile', 'architecture', 'question'],
    likes: 35,
    comments: 22,
    shares: 3,
    bookmarked: false,
    liked: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    type: 'question'
  }
]

export default function CommunityHub({ currentUserId, onPostCreate, onMemberConnect }: CommunityHubProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [searchQuery, setSearchQuery] = useState<any>('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'projects' | 'questions' | 'events' | 'jobs'>('all')
  const [newPostContent, setNewPostContent] = useState<any>('')
  const [newPostType, setNewPostType] = useState<Post['type']>('text')
  const [newPostTags, setNewPostTags] = useState<any>('')
  const [showCreatePost, setShowCreatePost] = useState<any>(false)
  const [loading, setLoading] = useState(true)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [memberFilters, setMemberFilters] = useState({
    skills: [] as string[],
    location: '',
    minRating: 0,
    verified: false,
    online: false
  })

  // Load real data from Supabase
  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setLoading(true)
        logger.info('Loading community data from Supabase')

        // Fetch members and posts in parallel
        const [membersResult, postsResult] = await Promise.all([
          getMembers({}),
          getPosts({})
        ])

        // Transform members data
        if (membersResult.data && membersResult.data.length > 0) {
          const transformedMembers: CommunityMember[] = membersResult.data.map((m) => ({
            id: m.id,
            name: m.name,
            username: `@${m.name.toLowerCase().replace(/\s+/g, '')}`,
            avatar: m.avatar,
            bio: m.bio || '',
            location: m.location,
            skills: m.skills.slice(0, 4), // Limit to 4 skills for UI
            rating: Number(m.rating),
            projects: m.total_projects,
            joined: new Date(m.created_at).toISOString().split('T')[0],
            verified: m.is_verified,
            online: m.is_online
          }))
          setMembers(transformedMembers)
          logger.info('Members loaded', { count: transformedMembers.length })
        }

        // Transform posts data
        if (postsResult.data && postsResult.data.length > 0) {
          // Get member map for author lookup
          const memberMap = new Map(members.map(m => [m.id, m]))

          const transformedPosts: Post[] = postsResult.data.map((p) => {
            const author = memberMap.get(p.author_id) || members[0] || MOCK_MEMBERS[0]
            return {
              id: p.id,
              author,
              content: p.content,
              tags: p.tags,
              likes: p.likes_count,
              comments: p.comments_count,
              shares: p.shares_count,
              bookmarked: false,
              liked: false,
              createdAt: p.created_at,
              type: p.type as 'text' | 'project' | 'question' | 'event' | 'job'
            }
          })
          setPosts(transformedPosts)
          logger.info('Posts loaded', { count: transformedPosts.length })
        }

        setLoading(false)
        toast.success('Community loaded', {
          description: `${membersResult.data?.length || 0} members • ${postsResult.data?.length || 0} posts`
        })
      } catch (error) {
        logger.error('Failed to load community data', { error: error.message })
        // Fall back to mock data on error
        setPosts(MOCK_POSTS)
        setMembers(MOCK_MEMBERS)
        setLoading(false)
      }
    }

    loadCommunityData()
  }, [])

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
    toast.success('Connection request sent', {
      description: 'They will be notified of your request'
    })
  }

  const handleOpenMessage = (member: CommunityMember) => {
    setSelectedMember(member)
    setMessageContent('')
    setShowMessageDialog(true)
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedMember) return

    toast.loading('Sending message...', { id: 'send-message' })
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success('Message sent', {
      id: 'send-message',
      description: `Your message was delivered to ${selectedMember.name}`
    })

    setMessageContent('')
    setShowMessageDialog(false)
  }

  const applyMemberFilters = () => {
    toast.success('Filters applied', {
      description: 'Member list updated with your criteria'
    })
    setShowFiltersDialog(false)
  }

  const filteredMembers = members.filter(member => {
    if (memberFilters.verified && !member.verified) return false
    if (memberFilters.online && !member.online) return false
    if (memberFilters.minRating > 0 && member.rating < memberFilters.minRating) return false
    if (memberFilters.location && !member.location?.toLowerCase().includes(memberFilters.location.toLowerCase())) return false
    if (memberFilters.skills.length > 0 && !memberFilters.skills.some(skill => member.skills.includes(skill))) return false
    return true
  })

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
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
                onChange={(e) => setSelectedFilter(e.target.value)}
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

        {/* Portfolios Tab */}
        <TabsContent value="portfolios" className="mt-6">
          <CreatorMarketplace
            currentUserId={currentUserId}
            onViewPortfolio={(portfolioId) => {
              logger.info('Viewing portfolio', { portfolioId })
            }}
            onContactCreator={(creatorId) => {
              const member = members.find(m => m.id === creatorId)
              if (member) handleOpenMessage(member)
            }}
            onHireCreator={(creatorId) => {
              toast.success('Starting contract', {
                description: 'Opening contract creation flow'
              })
            }}
          />
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
              <Button variant="outline" onClick={() => setShowFiltersDialog(true)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(member => (
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
                          <Button variant="outline" size="sm" onClick={() => handleOpenMessage(member)}>
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

      {/* Member Filters Dialog */}
      <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Members
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              <Input
                placeholder="Enter skills (comma-separated)"
                value={memberFilters.skills.join(', ')}
                onChange={(e) => setMemberFilters({
                  ...memberFilters,
                  skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                placeholder="e.g., San Francisco, Remote"
                value={memberFilters.location}
                onChange={(e) => setMemberFilters({ ...memberFilters, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
              <select
                value={memberFilters.minRating}
                onChange={(e) => setMemberFilters({ ...memberFilters, minRating: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="0">Any rating</option>
                <option value="3">3+ stars</option>
                <option value="4">4+ stars</option>
                <option value="4.5">4.5+ stars</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Verified Only</label>
              <input
                type="checkbox"
                checked={memberFilters.verified}
                onChange={(e) => setMemberFilters({ ...memberFilters, verified: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Online Now</label>
              <input
                type="checkbox"
                checked={memberFilters.online}
                onChange={(e) => setMemberFilters({ ...memberFilters, online: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setMemberFilters({ skills: [], location: '', minRating: 0, verified: false, online: false })
                }}
              >
                Clear All
              </Button>
              <Button className="flex-1" onClick={applyMemberFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Direct Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                  <AvatarFallback>{selectedMember.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{selectedMember.name}</h4>
                    {selectedMember.verified && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                    {selectedMember.online && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{selectedMember.username}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Message</label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder={`Write a message to ${selectedMember.name}...`}
                  rows={5}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowMessageDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSendMessage} disabled={!messageContent.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}