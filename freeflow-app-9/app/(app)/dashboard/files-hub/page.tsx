'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen } from 'lucide-react'

export default function FilesHubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Files Hub</h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Files Hub - Temporarily Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              The Files Hub is currently being fixed. Please check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}