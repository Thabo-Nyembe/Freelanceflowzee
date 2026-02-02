"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Link2,
  Smile,
  Send,
  ThumbsUp,
  Star,
  Eye,
  Award,
  Crown,
  CheckCircle2,
  Briefcase,
  ExternalLink,
  Play,
  Film,
  FileText,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Flag,
  Copy,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  AtSign,
  Hash
} from 'lucide-react'

const logger = createFeatureLogger('SocialWall')

interface Author {
  id: string
  name: string
  username: string
  avatar: string
  verified: boolean
  role?: string
}

interface PortfolioPreview {
  id: string
  title: string
  description: string
  thumbnail: string
  projectCount: number
  views: number
  rating: number
}

interface MediaItem {
  type: 'image' | 'video' | 'portfolio' | 'link'
  url: string
  thumbnail?: string
  title?: string
  description?: string
  metadata?: Record<string, any>
}

interface Comment {
  id: string
  author: Author
  content: string
  likes: number
  liked: boolean
  createdAt: string
  replies?: Comment[]
}

interface Post {
  id: string
  author: Author
  content: string
  media: MediaItem[]
  portfolio?: PortfolioPreview
  tags: string[]
  likes: number
  comments: Comment[]
  shares: number
  views: number
  liked: boolean
  bookmarked: boolean
  type: 'text' | 'portfolio' | 'project' | 'milestone' | 'announcement'
  createdAt: string
  pinned?: boolean
}

interface SocialWallProps {
  currentUserId: string
  onPostCreate?: (content: string, media: MediaItem[]) => void
  onSharePortfolio?: (portfolioId: string) => void
}

// Demo data
const DEMO_POSTS: Post[] = [
  {
    id: 'post_001',
    author: {
      id: 'user_001',
      name: 'Sarah Chen',
      username: '@sarahchen',
      avatar: '/avatars/sarah.jpg',
      verified: true,
      role: 'Product Designer'
    },
    content: 'Just launched my updated portfolio! Featuring 15 new case studies including my work with fintech startups. Check it out and let me know what you think!',
    media: [],
    portfolio: {
      id: 'port_001',
      title: 'Digital Product Design Portfolio',
      description: 'Award-winning product designer specializing in SaaS and fintech applications.',
      thumbnail: '/portfolio/cover-1.jpg',
      projectCount: 89,
      views: 12450,
      rating: 4.9
    },
    tags: ['portfolio', 'design', 'fintech'],
    likes: 142,
    comments: [
      {
        id: 'comment_001',
        author: {
          id: 'user_002',
          name: 'Alex Rivera',
          username: '@alexrivera',
          avatar: '/avatars/alex.jpg',
          verified: true
        },
        content: 'Your work is incredible! The fintech case studies are especially impressive.',
        likes: 23,
        liked: false,
        createdAt: '2024-01-15T10:30:00Z'
      }
    ],
    shares: 45,
    views: 3420,
    liked: false,
    bookmarked: false,
    type: 'portfolio',
    createdAt: '2024-01-15T09:00:00Z',
    pinned: true
  },
  {
    id: 'post_002',
    author: {
      id: 'user_002',
      name: 'Alex Rivera',
      username: '@alexrivera',
      avatar: '/avatars/alex.jpg',
      verified: true,
      role: 'Full-Stack Developer'
    },
    content: 'Excited to share my latest project showcase - a real-time collaboration platform built with Next.js 14 and Supabase. Features include live cursors, presence indicators, and instant updates!',
    media: [
      {
        type: 'image',
        url: '/projects/collab-platform.jpg',
        title: 'Collaboration Platform Screenshot'
      }
    ],
    tags: ['react', 'nextjs', 'supabase', 'realtime'],
    likes: 89,
    comments: [],
    shares: 28,
    views: 1856,
    liked: true,
    bookmarked: true,
    type: 'project',
    createdAt: '2024-01-14T16:00:00Z'
  },
  {
    id: 'post_003',
    author: {
      id: 'user_003',
      name: 'Maya Patel',
      username: '@mayapatel',
      avatar: '/avatars/maya.jpg',
      verified: true,
      role: 'Brand Strategist'
    },
    content: 'Milestone achieved: 100 completed brand projects! Thank you to all my amazing clients who trusted me with their brand journeys. Here\'s to the next 100! ',
    media: [],
    tags: ['milestone', 'branding', 'grateful'],
    likes: 234,
    comments: [
      {
        id: 'comment_002',
        author: {
          id: 'user_001',
          name: 'Sarah Chen',
          username: '@sarahchen',
          avatar: '/avatars/sarah.jpg',
          verified: true
        },
        content: 'Congratulations Maya! Your branding work is always top-notch!',
        likes: 15,
        liked: true,
        createdAt: '2024-01-13T12:15:00Z'
      },
      {
        id: 'comment_003',
        author: {
          id: 'user_004',
          name: 'James Kim',
          username: '@jameskim',
          avatar: '/avatars/james.jpg',
          verified: false
        },
        content: 'Well deserved! Your portfolio is an inspiration.',
        likes: 8,
        liked: false,
        createdAt: '2024-01-13T14:30:00Z'
      }
    ],
    shares: 67,
    views: 4523,
    liked: false,
    bookmarked: false,
    type: 'milestone',
    createdAt: '2024-01-13T11:00:00Z'
  },
  {
    id: 'post_004',
    author: {
      id: 'user_004',
      name: 'James Kim',
      username: '@jameskim',
      avatar: '/avatars/james.jpg',
      verified: true,
      role: 'Motion Designer'
    },
    content: 'New showreel dropped! 2 minutes of my best motion graphics and animation work from the past year. Would love your feedback!',
    media: [
      {
        type: 'video',
        url: '/videos/showreel-2024.mp4',
        thumbnail: '/videos/showreel-thumb.jpg',
        title: '2024 Motion Graphics Showreel'
      }
    ],
    portfolio: {
      id: 'port_004',
      title: 'Motion Graphics Portfolio',
      description: 'Creating engaging animations for ads, explainers, and product demos.',
      thumbnail: '/portfolio/cover-4.jpg',
      projectCount: 54,
      views: 6340,
      rating: 4.7
    },
    tags: ['motiondesign', 'animation', 'showreel'],
    likes: 167,
    comments: [],
    shares: 52,
    views: 2890,
    liked: false,
    bookmarked: true,
    type: 'portfolio',
    createdAt: '2024-01-12T14:00:00Z'
  }
]

export default function SocialWall({
  currentUserId,
  onPostCreate,
  onSharePortfolio
}: SocialWallProps) {
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS)
  const [newPostContent, setNewPostContent] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showComments, setShowComments] = useState<Set<string>>(new Set())
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }, [])

  const handleLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ))
    logger.info('Post liked', { postId })
  }, [])

  const handleBookmark = useCallback((postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post
    ))
    const post = posts.find(p => p.id === postId)
    toast.success(post?.bookmarked ? 'Removed from saved' : 'Post saved')
    logger.info('Post bookmarked', { postId })
  }, [posts])

  const handleShare = useCallback((post: Post) => {
    navigator.clipboard.writeText(`https://app.example.com/posts/${post.id}`)
    toast.success('Link copied to clipboard')
    logger.info('Post shared', { postId: post.id })
  }, [])

  const handleCommentLike = useCallback((postId: string, commentId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, liked: !comment.liked, likes: comment.liked ? comment.likes - 1 : comment.likes + 1 }
                : comment
            )
          }
        : post
    ))
  }, [])

  const handleAddComment = useCallback((postId: string) => {
    const content = newComment[postId]?.trim()
    if (!content) return

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      author: {
        id: currentUserId,
        name: 'You',
        username: '@you',
        avatar: '/avatars/default.jpg',
        verified: false
      },
      content,
      likes: 0,
      liked: false,
      createdAt: new Date().toISOString()
    }

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ))

    setNewComment(prev => ({ ...prev, [postId]: '' }))
    toast.success('Comment added')
    logger.info('Comment added', { postId })
  }, [newComment, currentUserId])

  const toggleComments = useCallback((postId: string) => {
    setShowComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }, [])

  const toggleExpand = useCallback((postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }, [])

  const handleCreatePost = useCallback(() => {
    if (!newPostContent.trim()) return

    const newPost: Post = {
      id: `post_${Date.now()}`,
      author: {
        id: currentUserId,
        name: 'You',
        username: '@you',
        avatar: '/avatars/default.jpg',
        verified: false
      },
      content: newPostContent,
      media: [],
      tags: newPostContent.match(/#\w+/g)?.map(t => t.slice(1)) || [],
      likes: 0,
      comments: [],
      shares: 0,
      views: 0,
      liked: false,
      bookmarked: false,
      type: 'text',
      createdAt: new Date().toISOString()
    }

    setPosts(prev => [newPost, ...prev])
    setNewPostContent('')
    setShowCreatePost(false)
    onPostCreate?.(newPostContent, [])
    toast.success('Post published!')
    logger.info('Post created')
  }, [newPostContent, currentUserId, onPostCreate])

  const handleViewPortfolio = useCallback((portfolioId: string) => {
    onSharePortfolio?.(portfolioId)
    toast.success('Opening portfolio')
  }, [onSharePortfolio])

  const PortfolioCard = ({ portfolio }: { portfolio: PortfolioPreview }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer" onClick={() => handleViewPortfolio(portfolio.id)}>
      <div className="relative h-32 bg-gradient-to-br from-violet-500 to-purple-600">
        {portfolio.thumbnail && (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${portfolio.thumbnail})` }} />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <Badge className="absolute top-2 right-2 bg-white/90 text-foreground">
          <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
          {portfolio.rating}
        </Badge>
      </div>
      <CardContent className="p-3">
        <h4 className="font-semibold line-clamp-1">{portfolio.title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{portfolio.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {portfolio.projectCount} projects
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {(portfolio.views / 1000).toFixed(1)}k views
          </div>
        </div>
        <Button size="sm" className="w-full mt-3" variant="outline">
          <ExternalLink className="w-3 h-3 mr-1" />
          View Portfolio
        </Button>
      </CardContent>
    </Card>
  )

  const PostTypeIcon = ({ type }: { type: Post['type'] }) => {
    switch (type) {
      case 'portfolio':
        return <Briefcase className="w-4 h-4" />
      case 'project':
        return <FileText className="w-4 h-4" />
      case 'milestone':
        return <Award className="w-4 h-4" />
      case 'announcement':
        return <Sparkles className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {showCreatePost ? (
                <div className="space-y-3">
                  <Textarea
                    ref={textareaRef}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your work, achievements, or thoughts..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Image
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Film className="w-4 h-4 mr-1" />
                        Video
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Link2 className="w-4 h-4 mr-1" />
                        Portfolio
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowCreatePost(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                        <Send className="w-4 h-4 mr-1" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Input
                  placeholder="Share your work or achievements..."
                  className="cursor-pointer"
                  onClick={() => setShowCreatePost(true)}
                  readOnly
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.id} className={`overflow-hidden ${post.pinned ? 'border-primary/50' : ''}`}>
            {post.pinned && (
              <div className="bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Pinned Post
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.author.name}</span>
                      {post.author.verified && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      )}
                      {post.type !== 'text' && (
                        <Badge variant="secondary" className="text-xs">
                          <PostTypeIcon type={post.type} />
                          <span className="ml-1 capitalize">{post.type}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{post.author.username}</span>
                      {post.author.role && (
                        <>
                          <span>·</span>
                          <span>{post.author.role}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBookmark(post.id)}>
                      <Bookmark className="w-4 h-4 mr-2" />
                      {post.bookmarked ? 'Unsave' : 'Save'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(post)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pb-3">
              {/* Post content */}
              <div className="space-y-3">
                <p className={`text-foreground whitespace-pre-wrap ${!expandedPosts.has(post.id) && post.content.length > 280 ? 'line-clamp-4' : ''}`}>
                  {post.content}
                </p>
                {post.content.length > 280 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => toggleExpand(post.id)}
                  >
                    {expandedPosts.has(post.id) ? (
                      <>Show less <ChevronUp className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>Show more <ChevronDown className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Media */}
                {post.media.length > 0 && (
                  <div className={`grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : ''}`}>
                    {post.media.map((media, i) => (
                      <div key={i} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        {media.type === 'video' ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 bg-black/70 rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-white ml-1" />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${media.url})` }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Portfolio Preview */}
                {post.portfolio && (
                  <PortfolioCard portfolio={post.portfolio} />
                )}
              </div>
            </CardContent>

            {/* Engagement stats */}
            <div className="px-4 py-2 border-t flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                {post.likes > 0 && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    {post.likes}
                  </span>
                )}
                {post.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.views.toLocaleString()} views
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {post.comments.length > 0 && (
                  <span>{post.comments.length} comments</span>
                )}
                {post.shares > 0 && (
                  <span>{post.shares} shares</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <CardFooter className="px-4 py-2 border-t flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className={post.liked ? 'text-red-500' : ''}
                onClick={() => handleLike(post.id)}
              >
                <Heart className={`w-4 h-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
                Like
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleComments(post.id)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleShare(post)}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={post.bookmarked ? 'text-blue-500' : ''}
                onClick={() => handleBookmark(post.id)}
              >
                <Bookmark className={`w-4 h-4 ${post.bookmarked ? 'fill-current' : ''}`} />
              </Button>
            </CardFooter>

            {/* Comments Section */}
            {showComments.has(post.id) && (
              <div className="px-4 pb-4 border-t bg-muted/30">
                <div className="space-y-3 pt-3">
                  {/* Existing comments */}
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-background rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            {comment.author.verified && (
                              <CheckCircle2 className="w-3 h-3 text-blue-500" />
                            )}
                            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 px-2 ${comment.liked ? 'text-red-500' : ''}`}
                            onClick={() => handleCommentLike(post.id, comment.id)}
                          >
                            <Heart className={`w-3 h-3 mr-1 ${comment.liked ? 'fill-current' : ''}`} />
                            {comment.likes > 0 && comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add comment */}
                  <div className="flex gap-2 pt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>Y</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        className="h-9"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline" disabled={loading}>
          {loading ? 'Loading...' : 'Load more posts'}
        </Button>
      </div>
    </div>
  )
}
