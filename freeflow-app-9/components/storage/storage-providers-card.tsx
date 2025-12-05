'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cloud, Loader2, CheckCircle2, XCircle, RefreshCw, Trash2 } from 'lucide-react'
import { StorageConnection, StorageProvider } from '@/lib/storage/providers'
import { getStorageConnections, deleteStorageConnection } from '@/lib/storage/storage-queries'
import { createClient } from '@/lib/supabase/client'
import { StorageConnectionDialog } from './storage-connection-dialog'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const PROVIDER_INFO: Record<StorageProvider, { name: string; icon: string; color: string }> = {
  'google-drive': { name: 'Google Drive', icon: '📁', color: 'bg-blue-500' },
  'dropbox': { name: 'Dropbox', icon: '📦', color: 'bg-blue-600' },
  'onedrive': { name: 'OneDrive', icon: '☁️', color: 'bg-blue-700' },
  'box': { name: 'Box', icon: '📂', color: 'bg-blue-800' },
  'icloud': { name: 'iCloud', icon: '☁️', color: 'bg-gray-600' },
  'local': { name: 'Local', icon: '💾', color: 'bg-gray-500' }
}

export function StorageProvidersCard() {
  const [connections, setConnections] = useState<StorageConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  const loadConnections = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const userConnections = await getStorageConnections(user.id)
        setConnections(userConnections)
      }
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Failed to load storage connections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnections()

    // Listen for successful connections
    const urlParams = new URLSearchParams(window.location.search)
    const connectedProvider = urlParams.get('connected')

    if (connectedProvider) {
      toast.success(`Successfully connected to ${PROVIDER_INFO[connectedProvider as StorageProvider]?.name || connectedProvider}`)

      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)

      // Reload connections
      loadConnections()
    }
  }, [])

  const handleDisconnect = async (connectionId: string, providerName: string) => {
    if (!confirm(`Are you sure you want to disconnect from ${providerName}? This will not delete your files.`)) {
      return
    }

    try {
      setDisconnecting(connectionId)
      await deleteStorageConnection(connectionId)
      toast.success(`Disconnected from ${providerName}`)
      loadConnections()
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast.error('Failed to disconnect provider')
    } finally {
      setDisconnecting(null)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            Connected Storage Providers
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your cloud storage connections
          </p>
        </div>
        <StorageConnectionDialog onConnectionComplete={loadConnections} />
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-12">
          <Cloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Storage Connected</h3>
          <p className="text-sm text-gray-500 mb-6">
            Connect your cloud storage providers to access all your files in one place
          </p>
          <StorageConnectionDialog onConnectionComplete={loadConnections} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((connection) => {
            const providerInfo = PROVIDER_INFO[connection.provider]
            const usagePercentage = connection.total_space
              ? (connection.used_space / connection.total_space) * 100
              : 0

            return (
              <div
                key={connection.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${providerInfo.color} flex items-center justify-center text-xl`}>
                      {providerInfo.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{providerInfo.name}</h3>
                      <p className="text-xs text-muted-foreground">{connection.account_email}</p>
                    </div>
                  </div>
                  <Badge
                    variant={connection.connected ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    {connection.connected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Disconnected
                      </>
                    )}
                  </Badge>
                </div>

                {connection.total_space > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Storage Used</span>
                      <span>{Math.round(usagePercentage)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatBytes(connection.used_space)} used</span>
                      <span>{formatBytes(connection.total_space)} total</span>
                    </div>
                  </div>
                )}

                {connection.last_sync && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Last synced {formatDistanceToNow(new Date(connection.last_sync), { addSuffix: true })}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadConnections()}
                    className="flex-1"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDisconnect(connection.id, providerInfo.name)}
                    disabled={disconnecting === connection.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {disconnecting === connection.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
