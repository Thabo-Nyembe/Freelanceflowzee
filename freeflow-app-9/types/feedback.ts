export interface MediaFile {
  id: string
  name: string
  type: &quot;image&quot; | &quot;video&quot; | &quot;audio&quot; | &quot;document&quot; | &quot;code&quot; | &quot;screenshot&quot;
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
  status?: &quot;pending&quot; | &quot;resolved&quot; | &quot;approved&quot;
  priority?: &quot;low&quot; | &quot;medium&quot; | &quot;high&quot;
  replies?: Comment[]
}

export interface Creator {
  id: string
  name: string
  username: string
  avatar: string
  category: &quot;photographer&quot; | &quot;designer&quot; | &quot;developer&quot; | &quot;influencer&quot; | &quot;videographer&quot; | &quot;writer&quot;
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
  type: &quot;image&quot; | &quot;video&quot; | &quot;audio&quot; | &quot;carousel&quot;
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
