// MIGRATED: Batch #27 - Verified database hook integration
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Download,
  Edit,
  CheckCircle,
  MessageSquare,
  FolderOpen,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

// CLIENT ZONE UTILITIES
import {
  Project,
  getStatusColor,
  getStatusIcon,
  formatCurrency
} from '@/lib/client-zone-utils'

const logger = createFeatureLogger('ClientZoneProjects')

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClientZoneProjectsPage() {
  const router = useRouter()

  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // STATE MANAGEMENT
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean
  }>({})

  // Revision request modal state
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [revisionProjectId, setRevisionProjectId] = useState<number | null>(null)
  const [revisionNotes, setRevisionNotes] = useState('')

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)

      logger.info('Fetching client projects')

      const response = await fetch('/api/client-zone/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setProjects(data.projects || [])
        logger.info('Projects loaded successfully', {
          count: data.projects?.length || 0
        })
      } else {
        throw new Error(data.error || 'Failed to load projects')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load projects'
      setError(errorMessage)
      logger.error('Failed to fetch projects', { error: err })
      toast.error('Failed to load projects', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================================================
  // BUTTON HANDLERS - FULLY WIRED
  // ============================================================================

  /**
   * Handler 1: Request Revision
   * Opens modal for user to provide detailed revision feedback
   */
  const handleRequestRevision = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)

    logger.info('Revision request modal opened', {
      projectId,
      projectName: project?.name
    })

    setRevisionProjectId(projectId)
    setRevisionModalOpen(true)
    setRevisionNotes('')
  }

  /**
   * Submit revision request with detailed feedback
   */
  const submitRevisionRequest = async () => {
    if (!revisionProjectId || !revisionNotes.trim()) {
      toast.error('Please provide revision details', {
        description: 'Describe what changes you need'
      })
      logger.warn('Revision request validation failed', {
        reason: 'Empty notes'
      })
      return
    }

    const project = projects.find((p) => p.id === revisionProjectId)
    const actionKey = `revision-${revisionProjectId}`

    try {
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

      logger.info('Submitting revision request', {
        projectId: revisionProjectId,
        projectName: project?.name,
        notesLength: revisionNotes.length
      })

      const response = await fetch('/api/client-zone/projects/revision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: revisionProjectId,
          projectName: project?.name,
          revisionNotes: revisionNotes,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit revision request')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Revision request submitted successfully', {
          projectId: revisionProjectId,
          projectName: project?.name
        })

        toast.success(`Revision request submitted for "${project?.name}"`, {
          description: 'Your team will review and respond within 24 hours'
        })

        // Close modal and reset state
        setRevisionModalOpen(false)
        setRevisionProjectId(null)
        setRevisionNotes('')

        // Refresh projects to get updated status
        await fetchProjects()
      } else {
        throw new Error(result.error || 'Failed to submit revision')
      }
    } catch (err: any) {
      logger.error('Failed to submit revision request', {
        error: err,
        projectId: revisionProjectId
      })

      toast.error('Failed to submit revision request', {
        description: err.message || 'Please try again later'
      })
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Handler 2: Approve Deliverable
   * Approves project deliverable and triggers milestone payment release
   */
  const handleApproveDeliverable = async (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)
    const actionKey = `approve-${projectId}`

    if (!project) {
      logger.error('Project not found', { projectId })
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

      logger.info('Deliverable approval initiated', {
        projectId,
        projectName: project.name,
        currentStatus: project.status,
        progress: project.progress
      })

      const response = await fetch('/api/client-zone/projects/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          projectName: project.name,
          currentStatus: project.status,
          deliverables: project.deliverables,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve deliverable')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Deliverable approved successfully', {
          projectId,
          projectName: project.name,
          newStatus: result.newStatus
        })

        toast.success(`"${project.name}" approved!`, {
          description: 'Milestone payment will be released from escrow automatically'
        })

        // Update local state with new status
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p.id === projectId
              ? { ...p, status: result.newStatus || 'completed' }
              : p
          )
        )

        // Refresh to get server state
        await fetchProjects()
      } else {
        throw new Error(result.error || 'Failed to approve')
      }
    } catch (err: any) {
      logger.error('Failed to approve deliverable', {
        error: err,
        projectId,
        projectName: project.name
      })

      toast.error('Failed to approve deliverable', {
        description: err.message || 'Please try again later'
      })
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Handler 3: Download Files
   * Downloads project files as ZIP archive with real Blob handling
   */
  const handleDownloadFiles = async (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)
    const actionKey = `download-${projectId}`

    if (!project) {
      logger.error('Project not found for download', { projectId })
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

      logger.info('File download initiated', {
        projectId,
        projectName: project.name,
        deliverablesCount: project.deliverables.length
      })

      toast.info('Preparing download...', {
        description: `Packaging files for "${project.name}"`
      })

      const response = await fetch('/api/client-zone/projects/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          projectName: project.name
        })
      })

      if (!response.ok) {
        throw new Error('Failed to download files')
      }

      // Get the blob data
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename =
        filenameMatch?.[1] || `${project.name.replace(/\s+/g, '_')}_files.zip`

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      logger.info('Files downloaded successfully', {
        projectId,
        projectName: project.name,
        filename,
        size: blob.size
      })

      toast.success(`Files downloaded for "${project.name}"`, {
        description: `${filename} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`
      })
    } catch (err: any) {
      logger.error('Failed to download files', {
        error: err,
        projectId,
        projectName: project.name
      })

      toast.error('Failed to download files', {
        description: err.message || 'Please try again later'
      })
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Handler 4: View Details / Navigate
   * Navigate to detailed project view page
   */
  const handleViewDetails = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)

    logger.info('Viewing project details', {
      projectId,
      projectName: project?.name
    })

    router.push(`/dashboard/client-zone/projects/${projectId}`)

    toast.info(`Opening "${project?.name}" details...`)
  }

  /**
   * Handler 5: Discuss Project / Contact Team
   * Navigate to messages tab with project context
   */
  const handleDiscussProject = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)

    logger.info('Project discussion initiated', {
      projectId,
      projectName: project?.name
    })

    router.push(`/dashboard/client-zone?tab=messages&project=${projectId}`)

    toast.info('Opening team chat...', {
      description: `Discuss "${project?.name}" with your team`
    })
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState error={error} onRetry={fetchProjects} />
        </div>
      </div>
    )
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <NoDataEmptyState
            title="No projects found"
            description="You don't have any active projects yet. Contact your team to get started."
            action={{
              label: 'Contact Team',
              onClick: () => router.push('/dashboard/client-zone?tab=messages')
            }}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/client-zone')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Client Zone
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                My Projects
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Track progress, approve deliverables, and manage project files
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <FolderOpen className="h-4 w-4 mr-2" />
              {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
            </Badge>
          </div>
        </div>

        {/* Projects List */}
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{project.name}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">
                            {project.status.replace('-', ' ')}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current Phase</p>
                          <p className="font-semibold">{project.phase}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Due Date</p>
                          <p className="font-semibold">
                            {new Date(project.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Team</p>
                          <p className="font-semibold">{project.team.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Budget</p>
                          <p className="font-semibold">
                            {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Overall Progress</span>
                      <span className="font-bold text-blue-600">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>

                  {/* Deliverables */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      Deliverables
                      <Badge variant="outline" className="text-xs">
                        {project.deliverables.length} items
                      </Badge>
                    </h4>
                    <div className="space-y-2">
                      {project.deliverables.map((deliverable, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(deliverable.status)}
                            <div>
                              <p className="font-medium">{deliverable.name}</p>
                              <p className="text-sm text-gray-600">
                                Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={getStatusColor(deliverable.status)}
                            variant="outline"
                          >
                            {deliverable.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadFiles(project.id)}
                        disabled={actionLoading[`download-${project.id}`]}
                      >
                        {actionLoading[`download-${project.id}`] ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3 mr-1" />
                        )}
                        Download Files
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestRevision(project.id)}
                        disabled={actionLoading[`revision-${project.id}`]}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Request Revision
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(project.id)}
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        onClick={() => handleApproveDeliverable(project.id)}
                        disabled={actionLoading[`approve-${project.id}`]}
                      >
                        {actionLoading[`approve-${project.id}`] ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        onClick={() => handleDiscussProject(project.id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Discuss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Revision Request Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Request Revision</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRevisionModalOpen(false)
                  setRevisionProjectId(null)
                  setRevisionNotes('')
                }}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">
                  Project:{' '}
                  <span className="font-semibold">
                    {projects.find((p) => p.id === revisionProjectId)?.name}
                  </span>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Revision Request Guidelines</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Be specific about what needs to change</li>
                        <li>Include reference materials if possible</li>
                        <li>Team will respond within 24 hours</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Revision Details *
                </label>
                <Textarea
                  placeholder="Describe the changes you need in detail..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="min-h-[150px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {revisionNotes.length} characters
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRevisionModalOpen(false)
                    setRevisionProjectId(null)
                    setRevisionNotes('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={submitRevisionRequest}
                  disabled={
                    !revisionNotes.trim() ||
                    actionLoading[`revision-${revisionProjectId}`]
                  }
                >
                  {actionLoading[`revision-${revisionProjectId}`] ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Submit Revision Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
