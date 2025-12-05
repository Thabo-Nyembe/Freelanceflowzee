'use client'

import { Card } from '@/components/ui/card'
import { Activity, Cloud, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useStorageData } from '@/lib/hooks/use-storage-data'
import { formatDistanceToNow } from 'date-fns'

export function StorageActivityLog() {
  const { connections, files, loading } = useStorageData()

  const activities = connections.map(conn => ({
    id: conn.id,
    type: 'sync',
    provider: conn.provider,
    message: `Synced with ${conn.account_name || conn.account_email}`,
    timestamp: conn.last_sync || conn.created_at,
    status: conn.connected ? 'success' : 'error'
  })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Storage Activity</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
          <p className="text-sm text-gray-500">
            Connect a storage provider to see activity logs
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.status === 'success'
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                {activity.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <p className="text-sm font-medium">{activity.message}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>

              <RefreshCw className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      )}

      {!loading && activities.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-center text-muted-foreground">
            Showing {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      )}
    </Card>
  )
}
