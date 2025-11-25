'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen } from 'lucide-react'
import { KAZI_ANALYTICS_DATA } from '@/lib/analytics-utils'

export default function ProjectAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle>Project Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Project Analytics</h3>
            <p className="text-gray-500">Project performance and timeline analysis</p>
            <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
              <div>
                <p className="text-3xl font-bold text-gray-900">{KAZI_ANALYTICS_DATA.overview.totalProjects}</p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{KAZI_ANALYTICS_DATA.performance.projectCompletionRate}%</p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
