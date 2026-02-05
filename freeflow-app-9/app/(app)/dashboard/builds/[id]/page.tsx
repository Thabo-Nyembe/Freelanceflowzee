'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft, Play, Square, Download, ExternalLink,
  Clock, CheckCircle2, XCircle, AlertCircle, Loader2,
  Terminal, FileText, Settings, GitBranch
} from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface Build {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  branch?: string
  commit?: string
  started_at?: string
  completed_at?: string
  duration?: number
  logs?: string
  environment?: string
}

export default function BuildDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [build, setBuild] = useState<Build | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch build details
    async function fetchBuild() {
      try {
        // Mock data for now - replace with actual API call
        const mockBuild: Build = {
          id: params.id,
          name: `Build #${params.id.slice(0, 8)}`,
          status: 'success',
          branch: 'main',
          commit: 'abc123def456',
          started_at: new Date(Date.now() - 300000).toISOString(),
          completed_at: new Date().toISOString(),
          duration: 300,
          logs: 'Build started...\nInstalling dependencies...\nRunning tests...\nBuild complete!',
          environment: 'production'
        }

        setBuild(mockBuild)
      } catch (error) {
        console.error('Error fetching build:', error)
        toast.error('Failed to load build details')
      } finally {
        setLoading(false)
      }
    }

    fetchBuild()
  }, [params.id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'cancelled':
        return <Square className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      case 'running':
        return 'bg-blue-500'
      case 'cancelled':
        return 'bg-gray-500'
      default:
        return 'bg-yellow-500'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl p-6 space-y-6">
        <Skeleton className="h-12 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!build) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Build Not Found</h2>
            <p className="text-gray-500 mb-6">The build you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/dashboard/builds-v2')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Builds
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/builds-v2')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Builds
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Logs
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Deployment
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Build Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(build.status)}
              <div>
                <CardTitle className="text-2xl">{build.name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {build.environment && `Environment: ${build.environment}`}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(build.status)}>
              {build.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Build Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Branch</p>
              <div className="flex items-center gap-2 mt-1">
                <GitBranch className="h-4 w-4" />
                <p className="font-medium">{build.branch || 'main'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Commit</p>
              <p className="font-medium font-mono text-sm mt-1">
                {build.commit?.slice(0, 8) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium mt-1">
                {build.duration ? `${Math.floor(build.duration / 60)}m ${build.duration % 60}s` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="font-medium mt-1">
                {build.completed_at
                  ? new Date(build.completed_at).toLocaleString()
                  : 'In Progress'
                }
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="logs" className="w-full">
            <TabsList>
              <TabsTrigger value="logs">
                <Terminal className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="details">
                <FileText className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                    {build.logs || 'No logs available'}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Build Information</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Build ID:</dt>
                        <dd className="font-mono text-sm">{build.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Started At:</dt>
                        <dd>{build.started_at ? new Date(build.started_at).toLocaleString() : 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Status:</dt>
                        <dd className="font-medium capitalize">{build.status}</dd>
                      </div>
                    </dl>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500">Build configuration settings will appear here.</p>
                  <Button className="mt-4" onClick={() => router.push('/dashboard/builds-v2')}>
                    Configure Build Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
