export interface MediaFile {
  id: string
  name: string
  type: "image" | "video" | "audio" | "document" | "code" | "screenshot"
  url: string
  size: number
  uploadedAt: number
  duration?: number
  thumbnail?: string
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  author: string
  timestamp: number
  position?: { x: number; y: number }
  timeRange?: { start: number; end: number }
  textSelection?: { start: number; end: number; selectedText: string }
  codeLocation?: { line: number; file: string }
  status?: "pending" | "resolved" | "approved"
  priority?: "low" | "medium" | "high"
  replies?: Comment[]
}

export interface Creator {
  id: string
  name: string
  username: string
  avatar: string
  category: "photographer" | "designer" | "developer" | "influencer" | "videographer" | "writer"
  verified: boolean
  rating: number
  reviewCount: number
  portfolio: string[]
  bio: string
  location: string
  hourlyRate: number
  followers: number
  following: number
}

export interface Post {
  id: string
  creatorId: string
  creator: Creator
  type: "image" | "video" | "audio" | "carousel"
  media: string[]
  caption: string
  tags: string[]
  likes: number
  comments: number
  shares: number
  createdAt: number
  isLiked: boolean
  duration?: number
}
