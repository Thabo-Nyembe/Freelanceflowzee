'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileVideo,
  Clock,
  HardDrive
} from 'lucide-react'
import { toast } from 'sonner'

interface RenderJob {
  id: string
  projectName: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  currentStep: string
  format: string
  quality: string
  outputUrl?: string
  outputSize?: string
  error?: string
  createdAt: string
}

export function RenderingQueue() {
  const [jobs, setJobs] = React.useState<RenderJob[]>([])
  const [isPolling, setIsPolling] = React.useState(false)

  // Poll for job updates
  React.useEffect(() => {
    if (jobs.length === 0) return

    const activeJobs = jobs.filter(j => j.status === 'queued' || j.status === 'processing')
    if (activeJobs.length === 0) {
      setIsPolling(false)
      return
    }

    setIsPolling(true)

    const interval = setInterval(async () => {
      for (const job of activeJobs) {
        try {
          const response = await fetch(`/api/video/export?exportId=${job.id}`)
          if (response.ok) {
            const data = await response.json()

            setJobs(prev => prev.map(j =>
              j.id === job.id
                ? {
                    ...j,
                    status: data.status,
                    progress: data.progress,
                    currentStep: data.currentStep,
                    outputUrl: data.outputUrl,
                    outputSize: data.outputSize,
                    error: data.error
                  }
                : j
            ))

            // Show completion toast
            if (data.status === 'completed' && job.status !== 'completed') {
              toast.success('Export completed!', {
                description: `${job.projectName} is ready to download`
              })
            }

            // Show error toast
            if (data.status === 'failed' && job.status !== 'failed') {
              toast.error('Export failed', {
                description: data.error || 'An error occurred during export'
              })
            }
          }
        } catch (error) {
          console.error('Failed to fetch job status:', error)
        }
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [jobs])

  const removeJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId))
    toast.success('Job removed from queue')
  }

  const downloadVideo = (job: RenderJob) => {
    if (!job.outputUrl) return

    // In production, this would trigger actual file download
    const link = document.createElement('a')
    link.href = job.outputUrl
    link.download = `${job.projectName}.${job.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Download started', {
      description: `Downloading ${job.projectName}.${job.format}`
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'queued':
        return <Clock className="w-5 h-5 text-gray-500" />
      default:
        return <FileVideo className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'queued': 'secondary',
      'processing': 'default',
      'completed': 'default',
      'failed': 'destructive'
    }

    const colors: Record<string, string> = {
      'queued': 'bg-gray-100 text-gray-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  // This function would be called from the parent component when starting a new export
  const addJob = (job: RenderJob) => {
    setJobs(prev => [job, ...prev])
  }

  // Expose addJob function to parent components
  React.useEffect(() => {
    // Store in window for access from other components
    (window as any).addRenderJob = addJob
    return () => {
      delete (window as any).addRenderJob
    }
  }, [])

  if (jobs.length === 0) {
    return null
  }

  return (
    <Card className="border-2 border-purple-200/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileVideo className="w-5 h-5 text-purple-600" />
            Rendering Queue
            {isPolling && (
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
            )}
          </CardTitle>
          <Badge variant="secondary">{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-colors bg-white"
          >
            {/* Job Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(job.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{job.projectName}</h4>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileVideo className="w-3 h-3" />
                      {job.format.toUpperCase()}
                    </span>
                    <span className="capitalize">{job.quality}</span>
                    {job.outputSize && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {job.outputSize}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {job.status === 'completed' && job.outputUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => downloadVideo(job)}
                  >
                    <Download className="w-4 h-4 text-green-600" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => removeJob(job.id)}
                >
                  <X className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {(job.status === 'processing' || job.status === 'queued') && (
              <div className="space-y-2">
                <Progress value={job.progress} className="h-2" />
                <p className="text-xs text-gray-600">{job.currentStep}</p>
              </div>
            )}

            {/* Error Message */}
            {job.status === 'failed' && job.error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                {job.error}
              </div>
            )}

            {/* Completion Info */}
            {job.status === 'completed' && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                Export completed successfully! Click download to save the file.
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
