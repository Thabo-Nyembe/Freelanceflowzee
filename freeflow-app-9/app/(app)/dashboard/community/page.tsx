"use client"

import CommunityHub from "@/components/hubs/community-hub"

export default function CommunityPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CommunityHub currentUserId="demo-user" />
    </div>
  )
}