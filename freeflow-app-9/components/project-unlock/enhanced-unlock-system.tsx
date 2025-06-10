'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Shield, 
  Lock, 
  Unlock, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Key,
  FileText,
  Package,
  Eye,
  Zap,
  Users,
  Bell,
  Star,
  ArrowRight
} from 'lucide-react'

interface UnlockableProject {
  id: string
  title: string
  description: string
  clientName: string
  clientEmail: string
  totalAmount: number
  escrowStatus: 'pending' | 'funded' | 'released' | 'disputed'
  completionPercentage: number
  milestones: Milestone[]
  deliverables: Deliverable[]
  unlockMethods: UnlockMethod[]
  notifications: ProjectNotification[]
  securityLevel: 'standard' | 'enhanced' | 'premium'
  expiryDate?: string
}

interface Milestone {
  id: string
  title: string
  description: string
  amount: number
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
  completedAt?: string
  approvedAt?: string
}

interface Deliverable {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'zip' | 'code'
  size: string
  status: 'locked' | 'preview' | 'unlocked'
  previewUrl?: string
  downloadUrl?: string
  secureToken?: string
  downloadCount: number
  lastDownloaded?: string
}

interface UnlockMethod {
  id: string
  type: 'password' | 'escrow_release' | 'milestone_completion' | 'time_based' | 'client_approval'
  isEnabled: boolean
  conditions: Record<string, any>
  autoTrigger: boolean
}

interface ProjectNotification {
  id: string
  type: 'milestone_completed' | 'payment_received' | 'unlock_triggered' | 'download_ready'
  message: string
  timestamp: string
  isRead: boolean
  actionRequired: boolean
}

export function EnhancedProjectUnlockSystem() {
  const [projects, setProjects] = useState<UnlockableProject[]>([
    {
      id: 'proj_001',
      title: 'Premium Brand Identity Package',
      description: 'Complete brand identity with logo, guidelines, and digital assets',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah@company.com',
      totalAmount: 4999,
      escrowStatus: 'funded',
      completionPercentage: 85,
      securityLevel: 'enhanced',
      expiryDate: '2024-12-31',
      milestones: [
        {
          id: 'ms_001',
          title: 'Logo Design',
          description: 'Primary logo and variations',
          amount: 1500,
          status: 'completed',
          completedAt: '2024-02-01T10:00:00Z',
          approvedAt: '2024-02-01T14:00:00Z'
        },
        {
          id: 'ms_002',
          title: 'Brand Guidelines',
          description: 'Complete brand style guide',
          amount: 2000,
          status: 'completed',
          completedAt: '2024-02-05T16:00:00Z'
        },
        {
          id: 'ms_003',
          title: 'Digital Assets',
          description: 'Website elements and social media templates',
          amount: 1499,
          status: 'in_progress'
        }
      ],
      deliverables: [
        {
          id: 'del_001',
          name: 'Logo Package (High-Res)',
          type: 'zip',
          size: '45.2 MB',
          status: 'unlocked',
          downloadUrl: '/api/secure-download/logo-package.zip',
          secureToken: 'tok_logo_secure_001',
          downloadCount: 3,
          lastDownloaded: '2024-02-01T15:30:00Z'
        },
        {
          id: 'del_002',
          name: 'Brand Guidelines PDF',
          type: 'document',
          size: '12.8 MB',
          status: 'preview',
          previewUrl: '/documents/brand-guidelines-preview.pdf',
          downloadUrl: '/api/secure-download/brand-guidelines.pdf',
          secureToken: 'tok_guidelines_secure_002',
          downloadCount: 0
        },
        {
          id: 'del_003',
          name: 'Digital Asset Library',
          type: 'zip',
          size: '156.7 MB',
          status: 'locked',
          downloadCount: 0
        }
      ],
      unlockMethods: [
        {
          id: 'unlock_001',
          type: 'milestone_completion',
          isEnabled: true,
          conditions: { requiredMilestones: ['ms_001', 'ms_002'] },
          autoTrigger: true
        },
        {
          id: 'unlock_002',
          type: 'password',
          isEnabled: true,
          conditions: { password: 'BRAND2024!' },
          autoTrigger: false
        },
        {
          id: 'unlock_003',
          type: 'escrow_release',
          isEnabled: true,
          conditions: { requireFullPayment: true },
          autoTrigger: true
        }
      ],
      notifications: [
        {
          id: 'notif_001',
          type: 'milestone_completed',
          message: 'Logo design milestone completed and approved!',
          timestamp: '2024-02-01T14:00:00Z',
          isRead: true,
          actionRequired: false
        },
        {
          id: 'notif_002',
          type: 'download_ready',
          message: 'Brand guidelines preview is now available for download',
          timestamp: '2024-02-05T16:30:00Z',
          isRead: false,
          actionRequired: true
        }
      ]
    }
  ])

  const [selectedProject, setSelectedProject] = useState<UnlockableProject | null>(projects[0])
  const [unlockPassword, setUnlockPassword] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockResult, setUnlockResult] = useState<{
    success: boolean
    message: string
    unlockedItems?: string[]
  } | null>(null)

  // Real-time unlock status checking
  useEffect(() => {
    const checkUnlockStatus = () => {
      if (!selectedProject) return

      // Check milestone-based unlocks
      const completedMilestones = selectedProject.milestones.filter(m => m.status === 'completed')
      const milestoneUnlock = selectedProject.unlockMethods.find(m => m.type === 'milestone_completion')
      
      if (milestoneUnlock?.isEnabled && milestoneUnlock.autoTrigger) {
        const requiredMilestones = milestoneUnlock.conditions.requiredMilestones || []
        const hasRequiredMilestones = requiredMilestones.every(id => 
          completedMilestones.some(m => m.id === id)
        )
        
        if (hasRequiredMilestones) {
          // Auto-unlock deliverables
          setProjects(prev => prev.map(project => 
            project.id === selectedProject.id
              ? {
                  ...project,
                  deliverables: project.deliverables.map(deliverable => 
                    deliverable.status === 'locked' && requiredMilestones.length >= 2
                      ? { ...deliverable, status: 'preview' }
                      : deliverable
                  )
                }
              : project
          ))
        }
      }
    }

    const interval = setInterval(checkUnlockStatus, 2000)
    return () => clearInterval(interval)
  }, [selectedProject])

  const handlePasswordUnlock = async () => {
    if (!selectedProject || !unlockPassword.trim()) return

    setIsUnlocking(true)
    setUnlockResult(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const passwordMethod = selectedProject.unlockMethods.find(m => m.type === 'password')
      
      if (passwordMethod?.conditions.password === unlockPassword) {
        // Unlock all deliverables
        setProjects(prev => prev.map(project => 
          project.id === selectedProject.id
            ? {
                ...project,
                deliverables: project.deliverables.map(deliverable => ({
                  ...deliverable,
                  status: 'unlocked' as const
                })),
                notifications: [
                  ...project.notifications,
                  {
                    id: `notif_${Date.now()}`,
                    type: 'unlock_triggered',
                    message: 'All project deliverables unlocked via password authentication!',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    actionRequired: false
                  }
                ]
              }
            : project
        ))

        setUnlockResult({
          success: true,
          message: 'Project successfully unlocked! All files are now available for download.',
          unlockedItems: selectedProject.deliverables.map(d => d.name)
        })
        setUnlockPassword('')
      } else {
        setUnlockResult({
          success: false,
          message: 'Invalid unlock password. Please check and try again.'
        })
      }
    } catch (error) {
      setUnlockResult({
        success: false,
        message: 'Unlock failed. Please try again later.'
      })
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleSecureDownload = async (deliverable: Deliverable) => {
    if (deliverable.status === 'locked') {
      alert('This file is locked. Complete required milestones or use unlock password.')
      return
    }

    try {
      // Generate secure download token
      const response = await fetch('/api/generate-download-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject?.id,
          deliverableId: deliverable.id,
          clientEmail: selectedProject?.clientEmail
        })
      })

      if (response.ok) {
        const { downloadUrl, expiresAt } = await response.json()
        
        // Update download count
        setProjects(prev => prev.map(project => 
          project.id === selectedProject?.id
            ? {
                ...project,
                deliverables: project.deliverables.map(d => 
                  d.id === deliverable.id
                    ? {
                        ...d,
                        downloadCount: d.downloadCount + 1,
                        lastDownloaded: new Date().toISOString()
                      }
                    : d
                )
              }
            : project
        ))

        // Open secure download in new tab
        window.open(downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'locked': return 'bg-red-100 text-red-800 border-red-200'
      case 'preview': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'unlocked': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSecurityBadge = (level: string) => {
    switch (level) {
      case 'premium': return { color: 'bg-purple-100 text-purple-800', icon: <Star className="h-3 w-3" /> }
      case 'enhanced': return { color: 'bg-blue-100 text-blue-800', icon: <Shield className="h-3 w-3" /> }
      default: return { color: 'bg-gray-100 text-gray-800', icon: <Lock className="h-3 w-3" /> }
    }
  }

  if (!selectedProject) return null

  const security = getSecurityBadge(selectedProject.securityLevel)
  const unreadNotifications = selectedProject.notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            🔐 Enhanced Project Unlock System
          </h1>
          <p className="text-muted-foreground mt-2">
            Secure, milestone-driven project delivery with multi-layer protection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={security.color}>
            {security.icon}
            <span className="ml-1 capitalize">{selectedProject.securityLevel} Security</span>
          </Badge>
          {unreadNotifications > 0 && (
            <Badge className="bg-red-100 text-red-800">
              <Bell className="h-3 w-3 mr-1" />
              {unreadNotifications} New
            </Badge>
          )}
        </div>
      </div>

      {/* Project Overview */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-emerald-800">
                {selectedProject.title}
              </CardTitle>
              <p className="text-emerald-600 mt-2">{selectedProject.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-emerald-700">
                <span>Client: {selectedProject.clientName}</span>
                <span>•</span>
                <span>Value: ${(selectedProject.totalAmount / 100).toFixed(2)}</span>
                <span>•</span>
                <Badge className={getStatusColor(selectedProject.escrowStatus)}>
                  {selectedProject.escrowStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-800">
                {selectedProject.completionPercentage}%
              </div>
              <p className="text-sm text-emerald-600">Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={selectedProject.completionPercentage} 
            className="h-3 bg-emerald-100"
          />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Milestones & Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Project Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProject.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className={`mt-1 h-4 w-4 rounded-full flex items-center justify-center ${
                  milestone.status === 'completed' 
                    ? 'bg-green-500' 
                    : milestone.status === 'in_progress'
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}>
                  {milestone.status === 'completed' && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                  {milestone.status === 'in_progress' && (
                    <Clock className="h-3 w-3 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                    <span className="text-sm font-medium text-gray-600">
                      ${(milestone.amount / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(milestone.status)}>
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                    {milestone.completedAt && (
                      <span className="text-xs text-gray-500">
                        Completed {new Date(milestone.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Unlock Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-600" />
              Unlock Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password Unlock */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password Unlock
              </h4>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter unlock password"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handlePasswordUnlock}
                  disabled={!unlockPassword.trim() || isUnlocking}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isUnlocking ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500">
                  Test password: BRAND2024!
                </p>
              )}
            </div>

            {/* Unlock Result */}
            {unlockResult && (
              <div className={`p-4 rounded-lg border ${
                unlockResult.success 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-start gap-2">
                  {unlockResult.success ? (
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{unlockResult.message}</p>
                    {unlockResult.unlockedItems && (
                      <ul className="mt-2 text-sm">
                        {unlockResult.unlockedItems.map((item, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Auto-unlock Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Auto-unlock Status
              </h5>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center justify-between">
                  <span>Milestone completion</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Escrow release</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Project Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedProject.deliverables.map((deliverable) => (
              <Card key={deliverable.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {deliverable.name}
                          </h4>
                          <p className="text-xs text-gray-500">{deliverable.size}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(deliverable.status)}>
                        {deliverable.status}
                      </Badge>
                    </div>

                    {/* Download Stats */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Downloads: {deliverable.downloadCount}</div>
                      {deliverable.lastDownloaded && (
                        <div>
                          Last: {new Date(deliverable.lastDownloaded).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {deliverable.status === 'preview' && deliverable.previewUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(deliverable.previewUrl, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      )}
                      
                      {deliverable.status === 'unlocked' && (
                        <Button
                          size="sm"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => handleSecureDownload(deliverable)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                      
                      {deliverable.status === 'locked' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {selectedProject.notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedProject.notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm ${
                        notification.isRead ? 'text-gray-700' : 'text-blue-700 font-medium'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {notification.actionRequired && (
                      <Badge className="bg-orange-100 text-orange-800">
                        Action Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 