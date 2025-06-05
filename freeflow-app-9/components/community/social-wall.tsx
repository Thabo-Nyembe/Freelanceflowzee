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
  MoreHorizontal,
  ImageIcon,
  Video,
  Mic,
  Verified,
} from "lucide-react"

const posts = [
  {
    id: "1",
    creator: {
      name: "Sarah Chen",
      username: "@sarahdesigns",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
      category: "designer",
    },
    type: "image",
    media: "/placeholder.svg?height=400&width=600",
    caption:
      "Just finished this luxury brand identity for a high-end jewelry client ✨ What do you think about the color palette? #BrandDesign #Luxury #UI",
    tags: ["BrandDesign", "Luxury", "UI"],
    likes: 1247,
    comments: 89,
    shares: 34,
    timestamp: "2h",
    isLiked: false,
  },
  {
    id: "2",
    creator: {
      name: "Marcus Rodriguez",
      username: "@marcusshots",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
      category: "photographer",
    },
    type: "video",
    media: "/placeholder.svg?height=400&width=600",
    caption:
      "Behind the scenes of today's fashion shoot 📸 The lighting setup took 2 hours but totally worth it! #Photography #Fashion #BTS",
    tags: ["Photography", "Fashion", "BTS"],
    likes: 892,
    comments: 56,
    shares: 23,
    timestamp: "4h",
    isLiked: true,
    duration: "0:45",
  },
  {
    id: "3",
    creator: {
      name: "Alex Thompson",
      username: "@alexcodes",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
      category: "developer",
    },
    type: "audio",
    media: "/placeholder.svg?height=200&width=400",
    caption:
      "Quick tip: How to optimize React components for better performance 🚀 Listen to my thoughts on this! #React #WebDev #Performance",
    tags: ["React", "WebDev", "Performance"],
    likes: 634,
    comments: 42,
    shares: 18,
    timestamp: "6h",
    isLiked: false,
    duration: "3:00",
  },
]

export function SocialWall() {
  const [newPostContent, setNewPostContent] = useState("")
  const [showCreatePost, setShowCreatePost] = useState(false)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "photographer":
        return "📸"
      case "designer":
        return "🎨"
      case "developer":
        return "💻"
      default:
        return "👤"
    }
  }

  const renderMedia = (post: any) => {
    switch (post.type) {
      case "image":
        return (
          <img
            src={post.media || "/placeholder.svg"}
            alt="Post content"
            className="w-full h-96 object-cover rounded-lg"
          />
        )
      case "video":
        return (
          <div className="relative">
            <img
              src={post.media || "/placeholder.svg"}
              alt="Video thumbnail"
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                className="w-16 h-16 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>
            {post.duration && (
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {post.duration}
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
                >
                  <Play className="w-6 h-6" />
                </Button>
                <div>
                  <p className="font-medium">Audio Post</p>
                  <p className="text-sm opacity-80">{post.duration}</p>
                </div>
              </div>
              <Volume2 className="w-8 h-8 opacity-50" />
            </div>
            <div className="flex items-end space-x-1 h-16">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-t"
                  style={{ height: `${Math.random() * 100 + 20}%`, opacity: 0.7 }}
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
      <Card>
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
        <Card key={post.id}>
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
                    <span>{post.timestamp}</span>
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
