'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  TrendingUp,
  Clock,
  Award,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ShowcaseItem {
  id: string
  title: string
  description: string
  type: 'project' | 'article' | 'achievement'
  author: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  thumbnail?: string
  likes: number
  comments: number
  shares: number
  bookmarks: number
  createdAt: string
  tags: string[]
  isLiked?: boolean
  isBookmarked?: boolean
}

interface CommunityShowcaseProps {
  items?: ShowcaseItem[]
  onLike?: (itemId: string) => void
  onComment?: (itemId: string, comment: string) => void
  onShare?: (itemId: string) => void
  onBookmark?: (itemId: string) => void
}

const tabs = [
  { id: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'recent', label: 'Recent', icon: <Clock className="h-4 w-4" /> },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: <Award className="h-4 w-4" />,
  },
  {
    id: 'following',
    label: 'Following',
    icon: <Users className="h-4 w-4" />,
  },
]

export default function CommunityShowcase({
  items = [],
  onLike,
  onComment,
  onShare,
  onBookmark,
}: CommunityShowcaseProps) {
  const [activeTab, setActiveTab] = useState('trending')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const ShowcaseCard = ({ item }: { item: ShowcaseItem }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {item.thumbnail && (
        <div className="relative h-48 w-full">
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.author.avatar} />
            <AvatarFallback>{item.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{item.author.name}</p>
            <p className="text-xs text-muted-foreground">{item.author.role}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={item.isLiked ? 'text-red-500' : ''}
              onClick={() => onLike?.(item.id)}
            >
              <Heart className="h-4 w-4 mr-1" />
              {item.likes}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              {item.comments}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(item.id)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              {item.shares}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={item.isBookmarked ? 'text-primary' : ''}
              onClick={() => onBookmark?.(item.id)}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <span className="text-xs">{formatDate(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community Showcase</h2>
        <Input
          type="search"
          placeholder="Search showcase..."
          className="max-w-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ShowcaseCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 