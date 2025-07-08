"use client"

import { useState } from "react"
import CommunityHub from "@/components/hubs/community-hub"

export default function CommunityHubPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [connections, setConnections] = useState<string[]>([])
  
  const handlePostCreate = (post: any) => {
    setPosts(prev => [post, ...prev])
    console.log('Post created:', post)
  }
  
  const handleMemberConnect = (memberId: string) => {
    setConnections(prev => [...prev, memberId])
    console.log('Connected to member:', memberId)
  }
  
  return (
    <div className="p-6">
      <CommunityHub
        currentUserId="current-user"
        onPostCreate={handlePostCreate}
        onMemberConnect={handleMemberConnect}
      />
    </div>
  )
}
