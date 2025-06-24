"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CreatePostDialog } from '@/components/community/create-post-dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus, 
  Search, 
  TrendingUp, 
  Star, 
  Image as ImageIcon, 
  Video,
  MoreHorizontal,
  Bookmark,
  Filter,
  Globe,
  Calendar,
  Award
} from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
  }
  created_at: string
  likes: number
  comments: number
  isLiked?: boolean
  isBookmarked?: boolean
}

export function CommunityHub() {
  const [activeTab, setActiveTab] = useState('feed')
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: 'Getting Started with Freelancing',
      content: 'Here are some tips for starting your freelance journey...',
      author: {
        name: 'John Doe',
        avatar: '/avatars/john.jpg'
      },
      created_at: new Date().toISOString(),
      likes: 42,
      comments: 12,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: '2',
      title: 'Building Your Portfolio',
      content: 'A strong portfolio is essential for attracting clients...',
      author: {
        name: 'Jane Smith',
        avatar: '/avatars/jane.jpg'
      },
      created_at: new Date(Date.now() - 86400000).toISOString(),
      likes: 38,
      comments: 8,
      isLiked: true,
      isBookmarked: true
    }
  ])

  const handleCreatePost = async (formData: FormData) => {
    // Simulate post creation
    const newPost = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      author: {
        name: 'Current User',
        avatar: '/avatars/current-user.jpg'
      },
      created_at: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false
    }
    setPosts(prev => [newPost, ...prev])
    setIsCreatePostOpen(false)
  }

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        }
      }
      return post
    }))
  }

  const toggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked
        }
      }
      return post
    }))
  }

  const PostCard = ({ post }: { post: Post }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          <h3 className="font-semibold text-lg">{post.title}</h3>
          <p className="text-muted-foreground">{post.content}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleLike(post.id)}
            className={post.isLiked ? 'text-red-500' : ''}
          >
            <Heart className="w-4 h-4 mr-1" fill={post.isLiked ? 'currentColor' : 'none'} />
            {post.likes}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="w-4 h-4 mr-1" />
            {post.comments}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleBookmark(post.id)}
            className={post.isBookmarked ? 'text-primary' : ''}
          >
            <Bookmark
              className="w-4 h-4"
              fill={post.isBookmarked ? 'currentColor' : 'none'}
            />
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6 text-primary" />
              Community Hub
            </CardTitle>
            <CardDescription>
              Connect with freelancers and share knowledge
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('Opening photo upload')
                alert('Photo upload coming soon!')
              }}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('Opening video upload')
                alert('Video upload coming soon!')
              }}
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            <Button
              className="gap-2"
              onClick={() => setIsCreatePostOpen(true)}
              data-testid="create-post-btn"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <TabsContent value="feed" className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Design', 'Development', 'Marketing', 'Writing'].map((category) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          {category}
                        </span>
                        <Badge variant="secondary">
                          {Math.floor(Math.random() * 1000)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Freelancer Meetup', 'Design Workshop', 'Tech Conference'].map((event) => (
                      <div key={event} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {event}
                        </span>
                        <Badge>Soon</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={`/avatars/user${i}.jpg`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">User {i}</p>
                        <p className="text-sm text-muted-foreground">
                          {['Designer', 'Developer', 'Writer'][i - 1]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Star className="w-4 h-4" />
                      <span>4.{9 - i} Rating</span>
                      <span>•</span>
                      <Award className="w-4 h-4" />
                      <span>{10 * i}+ Projects</span>
                    </div>
                    <Button className="w-full" variant="outline">View Profile</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            {posts.filter(post => post.isBookmarked).map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CreatePostDialog
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        onSubmit={handleCreatePost}
      />
    </Card>
  )
} 