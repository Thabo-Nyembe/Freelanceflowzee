"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreatorMarketplace } from "@/components/community-tab/creator-marketplace"
import { SocialWall } from "@/components/community-tab/social-wall"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users } from "lucide-react"

export function CommunityTab() {
  const [activeTab, setActiveTab] = useState("marketplace")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600 mt-2">Connect with top creators and discover amazing work</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>50K+ Creators</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>Trending</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="marketplace" className="flex items-center space-x-2">
            <span>🏪</span>
            <span>Marketplace</span>
          </TabsTrigger>
          <TabsTrigger value="wall" className="flex items-center space-x-2">
            <span>📱</span>
            <span>Social Wall</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="mt-6">
          <CreatorMarketplace />
        </TabsContent>
        <TabsContent value="wall" className="mt-6">
          <SocialWall />
        </TabsContent>
      </Tabs>
    </div>
  )
}
