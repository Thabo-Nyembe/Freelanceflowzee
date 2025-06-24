"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  TrendingUp,
  Users,
  Rss,
  Plus,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { communityService, Post } from '@/lib/services/community-service'
import { useAuth } from '@/lib/hooks/use-auth'
import { CreatePostForm } from '@/app/components/community/create-post-form'

export function CommunityHub() {
  const [activeTab, setActiveTab] = useState('feed')
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadPosts()
  }, [activeTab])

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      const category = activeTab === 'trending' ? 'trending' : undefined
      const fetchedPosts = await communityService.getPosts(category)
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async (data: {
    title: string
    content: string
    category: string
    mediaUrls: string[]
  }) => {
    if (!user) return

    try {
      setIsCreatingPost(true)
      const newPost = await communityService.createPost({
        userId: user.id,
        title: data.title,
        content: data.content,
        category: data.category,
        mediaUrls: data.mediaUrls
      })
      setPosts(prev => [newPost, ...prev])
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsCreatingPost(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) return

    try {
      await communityService.likePost(postId, user.id)
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, likesCount: post.likesCount + 1 }
            : post
        )
      )
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <Rss className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks
          </TabsTrigger>
        </TabsList>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Post</DialogTitle>
              <DialogDescription>
                Share your thoughts, ideas, or work with the community.
              </DialogDescription>
            </DialogHeader>
            <CreatePostForm onSubmit={handleCreatePost} isLoading={isCreatingPost} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          posts.map(post => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={post.user?.avatarUrl} />
                  <AvatarFallback>
                    {post.user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{post.user?.username}</span>
                    <span className="text-gray-500">•</span>
                    <time className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  {post.mediaUrls?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.mediaUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Post media ${index + 1}`}
                          className="rounded-lg object-cover aspect-video"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      {post.likesCount}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {post.commentsCount}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Tabs>
  )
} 