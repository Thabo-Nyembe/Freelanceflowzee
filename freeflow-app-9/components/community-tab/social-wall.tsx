"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Mic,
  ImageIcon,
  Video,
  Verified,
} from "lucide-react"

const samplePosts = [
  {
    id: "1",
    creator: {
      name: "Sarah Chen",
      username: "@sarahdesigns",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "designer",
      verified: true,
    },
    type: "image",
    media: ["/placeholder.svg?height=400&width=600"],
    caption:
      "Just finished this luxury brand identity for a high-end jewelry client ✨ What do you think about the color palette? #BrandDesign #Luxury #UI",
    tags: ["BrandDesign", "Luxury", "UI"],
    likes: 1247,
    comments: 89,
    shares: 34,
    createdAt: Date.now() - 3600000,
    isLiked: false,
  },
  {
    id: "2",
    creator: {
      name: "Marcus Rodriguez",
      username: "@marcusshots",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "photographer",
      verified: true,
    },
    type: "video",
    media: ["/placeholder.svg?height=400&width=600"],
    caption:
      "Behind the scenes of today's fashion shoot 📸 The lighting setup took 2 hours but totally worth it! #Photography #Fashion #BTS",
    tags: ["Photography", "Fashion", "BTS"],
    likes: 892,
    comments: 56,
    shares: 23,
    createdAt: Date.now() - 7200000,
    isLiked: true,
    duration: 45,
  },
  {
    id: "3",
    creator: {
      name: "Alex Thompson",
      username: "@alexcodes",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "developer",
      verified: true,
    },
    type: "audio",
    media: ["/placeholder.svg?height=200&width=400"],
    caption:
      "Quick tip: How to optimize React components for better performance 🚀 Listen to my thoughts on this! #React #WebDev #Performance",
    tags: ["React", "WebDev", "Performance"],
    likes: 634,
    comments: 42,
    shares: 18,
    createdAt: Date.now() - 10800000,
    isLiked: false,
    duration: 180,
  },
]

export function SocialWall() {
  const [posts, setPosts] = useState(samplePosts)
  const [newPostContent, setNewPostContent] = useState("")
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set())

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const toggleAudio = (postId: string) => {
    setPlayingAudio(playingAudio === postId ? null : postId)
  }

  const toggleVideoMute = (postId: string) => {
    setMutedVideos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "photographer":
        return "📸"
      case "designer":
        return "🎨"
      case "developer":
        return "💻"
      case "influencer":
        return "⭐"
      case "videographer":
        return "🎬"
      case "writer":
        return "✍️"
      default:
        return "👤"
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const renderMedia = (post: any) => {
    switch (post.type) {
      case "image":
        return (
          <div className="relative">
            <img
              src={post.media[0] || "/placeholder.svg"}
              alt="Post content"
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )

      case "video":
        return (
          <div className="relative">
            <video
              className="w-full h-96 object-cover rounded-lg"
              poster={post.media[0]}
              controls
              muted={mutedVideos.has(post.id)}
            >
              <source src={post.media[0]} type="video/mp4" />
            </video>
            <div className="absolute top-3 right-3 flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={() => toggleVideoMute(post.id)}
              >
                {mutedVideos.has(post.id) ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            {post.duration && (
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {formatTime(post.duration)}
              </div>
            )}
          </div>
        )

      case "audio":
        return (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-12 h-12 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
                  onClick={() => toggleAudio(post.id)}
                >
                  {playingAudio === post.id ? <VolumeX className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                <div>
                  <p className="font-medium">Audio Post</p>
                  {post.duration && <p className="text-sm opacity-80">{formatTime(post.duration)}</p>}
                </div>
              </div>
              <Mic className="w-8 h-8 opacity-50" />
            </div>

            {/* Audio Waveform Visualization */}
            <div className="flex items-end space-x-1 h-16">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-white rounded-t transition-all duration-300 ${
                    playingAudio === post.id ? "animate-pulse" : ""
                  }`}
                  style={{
                    height: `${Math.random() * 100 + 20}%`,
                    opacity: playingAudio === post.id && i < 20 ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-500 bg-gray-100 hover:bg-gray-200"
                onClick={() => setShowCreatePost(true)}
              >
                Share your latest work...
              </Button>
            </div>
          </div>

          {showCreatePost && (
            <div className="space-y-4">
              <Textarea
                placeholder="What are you working on?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mic className="w-4 h-4 mr-2" />
                    Audio
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" onClick={() => setShowCreatePost(false)}>
                    Cancel
                  </Button>
                  <Button disabled={!newPostContent.trim()}>Share</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.creator.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{post.creator.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">{post.creator.name}</span>
                    {post.creator.verified && <Verified className="w-4 h-4 text-blue-500" />}
                    <span className="text-2xl">{getCategoryIcon(post.creator.category)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{post.creator.username}</span>
                    <span>•</span>
                    <span>{Math.floor((Date.now() - post.createdAt) / 3600000)}h</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-800 mb-3">{post.caption}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Media */}
            <div className="px-4 pb-3">{renderMedia(post)}</div>

            {/* Post Actions */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center space-x-2 ${post.isLiked ? "text-red-500" : ""}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                    <span>{post.likes.toLocaleString()}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Share2 className="w-5 h-5" />
                    <span>{post.shares}</span>
                  </Button>
                </div>
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-5 h-5" />
                </Button>
              </div>

              {/* Comments Preview */}
              <div className="text-sm text-gray-500">
                <span className="font-medium">{post.likes.toLocaleString()} likes</span>
                <span className="mx-2">•</span>
                <span>View all {post.comments} comments</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      <div className="text-center py-8">
        <Button variant="outline" className="px-8">
          Load More Posts
        </Button>
      </div>
    </div>
  )
}
