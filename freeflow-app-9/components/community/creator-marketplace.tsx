"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MapPin, Search, Filter, Heart, MessageCircle, Verified } from "lucide-react"

const creators = [
  {
    id: "1",
    name: "Sarah Chen",
    username: "@sarahdesigns",
    avatar: "/placeholder.svg?height=80&width=80",
    category: "designer",
    verified: true,
    rating: 4.9,
    reviewCount: 127,
    portfolio: "/placeholder.svg?height=200&width=300",
    bio: "Award-winning UI/UX designer specializing in luxury brand experiences",
    location: "San Francisco, CA",
    hourlyRate: 150,
    followers: 12500,
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    username: "@marcusshots",
    avatar: "/placeholder.svg?height=80&width=80",
    category: "photographer",
    verified: true,
    rating: 4.8,
    reviewCount: 89,
    portfolio: "/placeholder.svg?height=200&width=300",
    bio: "Fashion and lifestyle photographer with 10+ years experience",
    location: "New York, NY",
    hourlyRate: 200,
    followers: 8900,
  },
  {
    id: "3",
    name: "Alex Thompson",
    username: "@alexcodes",
    avatar: "/placeholder.svg?height=80&width=80",
    category: "developer",
    verified: true,
    rating: 4.9,
    reviewCount: 156,
    portfolio: "/placeholder.svg?height=200&width=300",
    bio: "Full-stack developer specializing in React and Node.js",
    location: "Austin, TX",
    hourlyRate: 120,
    followers: 15600,
  },
  {
    id: "4",
    name: "Emma Wilson",
    username: "@emmawrites",
    avatar: "/placeholder.svg?height=80&width=80",
    category: "writer",
    verified: false,
    rating: 4.7,
    reviewCount: 73,
    portfolio: "/placeholder.svg?height=200&width=300",
    bio: "Content strategist and copywriter for tech startups",
    location: "Seattle, WA",
    hourlyRate: 80,
    followers: 5400,
  },
]

export function CreatorMarketplace() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "photographer":
        return "📸"
      case "designer":
        return "🎨"
      case "developer":
        return "💻"
      case "writer":
        return "✍️"
      default:
        return "👤"
    }
  }

  return (
    <div className="space-y-6">
      {/* Top 20 Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">🏆 Top 20 Creators</h3>
            <p className="text-purple-100">Discover the most talented and highly-rated creators</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">20</div>
            <div className="text-sm text-purple-200">Featured Creators</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="photographer">Photographers</SelectItem>
            <SelectItem value="designer">Designers</SelectItem>
            <SelectItem value="developer">Developers</SelectItem>
            <SelectItem value="writer">Writers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator, index) => (
          <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Portfolio Preview */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={creator.portfolio || "/placeholder.svg"}
                  alt={`${creator.name}'s work`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-black bg-opacity-70 text-white">#{index + 1}</Badge>
                </div>
                <div className="absolute top-3 right-3 flex space-x-2">
                  <Button variant="ghost" size="sm" className="bg-white bg-opacity-80 hover:bg-opacity-100">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Creator Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={creator.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-1">
                        <h3 className="font-semibold text-lg">{creator.name}</h3>
                        {creator.verified && <Verified className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-sm text-gray-500">{creator.username}</p>
                    </div>
                  </div>
                  <div className="text-2xl">{getCategoryIcon(creator.category)}</div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{creator.bio}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{creator.rating}</span>
                    <span className="text-sm text-gray-500">({creator.reviewCount})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{creator.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">{creator.followers.toLocaleString()} followers</div>
                  <div className="flex items-center space-x-1 text-lg font-bold text-green-600">
                    <span>${creator.hourlyRate}</span>
                    <span className="text-sm text-gray-500 font-normal">/hr</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
