'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getWorkflowHistory } from '@/lib/workflow-builder-queries'
import { toast } from 'sonner'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Calendar,
  Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface WorkflowDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow: any
}

export function WorkflowDetailsDialog({ open, onOpenChange, workflow }: WorkflowDetailsDialogProps) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (open && workflow?.id) {
      loadHistory()
    }
  }, [open, workflow?.id])

  const loadHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const historyData = await getWorkflowHistory(workflow.id, 10)
      setHistory(historyData)
    } catch (error) {
      console.error('Failed to load history:', error)
      toast.error('Failed to load execution history')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  if (!workflow) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Activity className="h-5 w-5" />
            {workflow.name}
          </DialogTitle>
          <DialogDescription>{workflow.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-600">Total Runs</p>
                  </div>
                  <p className="text-2xl font-bold">{workflow.totalRuns || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{workflow.successRate || 0}%</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(workflow.isActive ? 'active' : 'paused')}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trigger Type:</span>
                  <span className="font-medium">{workflow.trigger_type || 'Manual'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{workflow.category || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Run:</span>
                  <span className="font-medium">
                    {workflow.lastRun
                      ? formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true })
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-2">
                {history.map((execution) => (
                  <Card key={execution.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(execution.status)}
                          <div>
                            <p className="font-medium">
                              {execution.steps_completed}/{execution.steps_total} steps
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDistanceToNow(new Date(execution.started_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(execution.status)}
                          {execution.duration_ms && (
                            <p className="text-xs text-gray-600 mt-1">
                              {(execution.duration_ms / 1000).toFixed(2)}s
                            </p>
                          )}
                        </div>
                      </div>
                      {execution.error_message && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                          {execution.error_message}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No execution history yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {history.length > 0
                      ? (
                          history
                            .filter((h) => h.duration_ms)
                            .reduce((sum, h) => sum + (h.duration_ms || 0), 0) /
                          history.filter((h) => h.duration_ms).length /
                          1000
                        ).toFixed(2)
                      : 0}
                    s
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-gray-600">Successful Runs</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {history.filter((h) => h.status === 'completed').length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium text-gray-600">Failed Runs</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {history.filter((h) => h.status === 'failed').length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <p className="text-sm font-medium text-gray-600">Running</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {history.filter((h) => h.status === 'running').length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
