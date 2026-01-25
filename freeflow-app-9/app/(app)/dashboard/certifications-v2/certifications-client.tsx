'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { shareContent, downloadAsJson, copyToClipboard, apiPost, apiDelete } from '@/lib/button-handlers'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useCertifications, type Certification, type CertificationType, type CertificationStatus } from '@/lib/hooks/use-certifications'
import { useCertificationCourses, useCertificationBadges } from '@/lib/hooks/use-certifications-extended'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Import mock data from centralized adapters



// ============================================================================
// CREDLY-LEVEL CERTIFICATIONS - Digital Credentialing Platform
// Features: Digital badges, Skill endorsements, Learning pathways, Blockchain verification
// ============================================================================

interface Credential {
  id: string
  name: string
  description: string
  type: 'certification' | 'license' | 'degree' | 'course' | 'achievement'
  issuer: {
    id: string
    name: string
    logo: string
    verified: boolean
    website: string
  }
  recipient: {
    id: string
    name: string
    email: string
    avatar: string
  }
  issueDate: string
  expiryDate: string | null
  status: 'active' | 'expired' | 'revoked' | 'pending'
  credentialId: string
  credentialUrl: string
  badgeImage: string
  skills: string[]
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
  earningCriteria: string[]
  verificationHash: string
  blockchainTxId: string | null
  shareCount: number
  viewCount: number
  endorsements: number
  metadata: Record<string, string>
}

interface Badge {
  id: string
  name: string
  description: string
  image: string
  category: string
  issuer: { name: string; logo: string }
  earnedDate: string
  level: number
  xpValue: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  skills: string[]
  holders: number
  requirements: { description: string; completed: boolean }[]
  isPublic: boolean
  isPinned: boolean
}

interface Skill {
  id: string
  name: string
  category: string
  level: number
  maxLevel: number
  xp: number
  xpToNextLevel: number
  endorsements: {
    count: number
    topEndorsers: { name: string; avatar: string; title: string }[]
  }
  relatedBadges: { id: string; name: string; image: string }[]
  assessmentScore: number | null
  lastAssessed: string | null
  trending: boolean
  demandScore: number
}

interface LearningPathway {
  id: string
  name: string
  description: string
  category: string
  provider: string
  thumbnail: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  enrolledCount: number
  completedCount: number
  rating: number
  reviewCount: number
  steps: {
    id: string
    title: string
    type: 'course' | 'assessment' | 'project' | 'badge'
    duration: string
    status: 'locked' | 'available' | 'in_progress' | 'completed'
    progress: number
  }[]
  targetCredential: { name: string; image: string } | null
  progress: number
  estimatedCompletion: string | null
}

interface VerificationRecord {
  id: string
  credentialId: string
  credentialName: string
  verifiedAt: string
  verifier: { name: string; email: string; organization: string }
  method: 'blockchain' | 'api' | 'qr_code' | 'direct'
  status: 'valid' | 'invalid' | 'expired' | 'revoked'
  ipAddress: string
  location: string
  deviceType: string
}

// Competitive upgrade component empty arrays (populated from database when available)
const certsAIInsights: { id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const certsCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'offline' | 'away'; role: string }[] = []

const certsPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'low' | 'medium' | 'high' }[] = []

const certsActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'update' | 'error' }[] = []

// Quick actions are defined inside the component to access state setters

export default function CertificationsClient() {
  const [activeView, setActiveView] = useState<'credentials' | 'badges' | 'skills' | 'pathways' | 'verification'>('credentials')
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [skillCategory, setSkillCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [certToDelete, setCertToDelete] = useState<Certification | null>(null)
  const [certToEdit, setCertToEdit] = useState<Certification | null>(null)

  // Supabase hooks for real data
  const {
    certifications: dbCertifications,
    loading: certificationsLoading,
    error: certificationsError,
    createCertification,
    updateCertification,
    deleteCertification,
    refetch
  } = useCertifications({
    certificationType: typeFilter !== 'all' ? typeFilter as CertificationType : undefined,
    status: statusFilter !== 'all' ? statusFilter as CertificationStatus : undefined
  })

  const { courses: dbCourses, isLoading: coursesLoading } = useCertificationCourses()
  const { badges: dbBadges, isLoading: badgesLoading } = useCertificationBadges()

  // Form state
  const [certForm, setCertForm] = useState({
    certification_name: '',
    certification_code: '',
    certification_type: 'professional' as CertificationType,
    issuing_organization: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
    status: 'active' as CertificationStatus,
    level: '',
    scope: '',
    holder_name: '',
    holder_email: '',
    certificate_url: '',
    certificate_number: '',
    notes: ''
  })

  const resetForm = () => {
    setCertForm({
      certification_name: '',
      certification_code: '',
      certification_type: 'professional',
      issuing_organization: '',
      issuing_authority: '',
      issue_date: '',
      expiry_date: '',
      status: 'active',
      level: '',
      scope: '',
      holder_name: '',
      holder_email: '',
      certificate_url: '',
      certificate_number: '',
      notes: ''
    })
  }

  const populateFormForEdit = (cert: Certification) => {
    setCertForm({
      certification_name: cert.certification_name || '',
      certification_code: cert.certification_code || '',
      certification_type: cert.certification_type || 'professional',
      issuing_organization: cert.issuing_organization || '',
      issuing_authority: cert.issuing_authority || '',
      issue_date: cert.issue_date || '',
      expiry_date: cert.expiry_date || '',
      status: cert.status || 'active',
      level: cert.level || '',
      scope: cert.scope || '',
      holder_name: cert.holder_name || '',
      holder_email: cert.holder_email || '',
      certificate_url: cert.certificate_url || '',
      certificate_number: cert.certificate_number || '',
      notes: cert.notes || ''
    })
  }

  // Calculate stats from real database data
  const certifications = dbCertifications || []
  const badges = dbBadges || []
  const courses = dbCourses || []

  const stats = useMemo(() => {
    const totalCredentials = certifications.length
    const activeCredentials = certifications.filter((c: any) => c.status === 'active').length
    const expiredCredentials = certifications.filter((c: any) => c.status === 'expired').length
    const pendingCredentials = certifications.filter((c: any) => c.status === 'pending').length
    const totalBadges = badges.length
    const totalCourses = courses.length
    const totalSkills = 0
    const totalXP = 0
    const totalEndorsements = 0
    const pathwaysCompleted = 0
    const pathwaysInProgress = 0
    const verificationCount = 0
    const blockchainVerified = 0

    return {
      totalCredentials,
      activeCredentials,
      expiredCredentials,
      pendingCredentials,
      totalBadges,
      totalCourses,
      totalSkills,
      totalXP,
      totalEndorsements,
      pathwaysCompleted,
      pathwaysInProgress,
      verificationCount,
      blockchainVerified
    }
  }, [certifications, badges, courses])

  // Filtered certifications from real Supabase data
  const filteredCertifications = useMemo(() => {
    return certifications.filter((c: any) => {
      const matchesType = typeFilter === 'all' || c.certification_type === typeFilter
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesSearch = !searchQuery ||
        (c.certification_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.issuing_organization || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesStatus && matchesSearch
    })
  }, [certifications, typeFilter, statusFilter, searchQuery])

  // Helper functions
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'expert': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      case 'master': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
      case 'uncommon': return 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
      case 'rare': return 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
      case 'epic': return 'border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20'
      case 'legendary': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:border-yellow-500 dark:from-yellow-900/20 dark:to-orange-900/20'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'valid': case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'pending': case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'expired': case 'revoked': case 'invalid': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // CRUD Handlers
  const handleCreateCertification = async () => {
    if (!certForm.certification_name.trim()) {
      toast.error('Certification name is required')
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }
      await createCertification({
        user_id: user.id,
        certification_name: certForm.certification_name,
        certification_code: certForm.certification_code || undefined,
        certification_type: certForm.certification_type,
        issuing_organization: certForm.issuing_organization || undefined,
        issuing_authority: certForm.issuing_authority || undefined,
        issue_date: certForm.issue_date || undefined,
        expiry_date: certForm.expiry_date || undefined,
        status: certForm.status,
        level: certForm.level || undefined,
        scope: certForm.scope || undefined,
        holder_name: certForm.holder_name || undefined,
        holder_email: certForm.holder_email || undefined,
        certificate_url: certForm.certificate_url || undefined,
        certificate_number: certForm.certificate_number || undefined,
        notes: certForm.notes || undefined
      })
      toast.success(`"${certForm.certification_name}" has been added`)
      setShowCreateDialog(false)
      resetForm()
    } catch (error: any) {
      toast.error('Failed to create certification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCertification = async () => {
    if (!certToEdit || !certForm.certification_name.trim()) {
      toast.error('Certification name is required')
      return
    }
    setIsSubmitting(true)
    try {
      await updateCertification({
        id: certToEdit.id,
        certification_name: certForm.certification_name,
        certification_code: certForm.certification_code || undefined,
        certification_type: certForm.certification_type,
        issuing_organization: certForm.issuing_organization || undefined,
        issuing_authority: certForm.issuing_authority || undefined,
        issue_date: certForm.issue_date || undefined,
        expiry_date: certForm.expiry_date || undefined,
        status: certForm.status,
        level: certForm.level || undefined,
        scope: certForm.scope || undefined,
        holder_name: certForm.holder_name || undefined,
        holder_email: certForm.holder_email || undefined,
        certificate_url: certForm.certificate_url || undefined,
        certificate_number: certForm.certificate_number || undefined,
        notes: certForm.notes || undefined
      })
      toast.success(`Certification updated: "${certForm.certification_name}" has been updated`)
      setShowEditDialog(false)
      setCertToEdit(null)
      resetForm()
    } catch (error: any) {
      toast.error('Failed to update certification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCertification = async () => {
    if (!certToDelete) return
    setIsSubmitting(true)
    try {
      await deleteCertification(certToDelete.id)
      toast.success(`Certification deleted: "${certToDelete.certification_name}" has been removed`)
      setShowDeleteDialog(false)
      setCertToDelete(null)
    } catch (error: any) {
      toast.error('Failed to delete certification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (cert: Certification) => {
    setCertToEdit(cert)
    populateFormForEdit(cert)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (cert: Certification) => {
    setCertToDelete(cert)
    setShowDeleteDialog(true)
  }

  // Real handlers (for mock data UI elements)
  const handleStartCertification = useCallback((certName: string) => {
    window.open(`/dashboard/certifications-v2/exam?name=${encodeURIComponent(certName)}`, '_blank')
    toast.success(`Opening "${certName}" exam`)
  }, [])

  const handleDownloadCertificate = useCallback(async (credential: Credential) => {
    // Generate a PDF-style certificate download
    const certData = {
      name: credential.name,
      credentialId: credential.credentialId,
      issuer: credential.issuer.name,
      issueDate: credential.issueDate,
      expiryDate: credential.expiryDate,
      skills: credential.skills,
      level: credential.level,
      verificationHash: credential.verificationHash
    }

    // Create a printable HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${credential.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .certificate { border: 3px double #333; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #1e40af; }
          .details { margin: 20px 0; }
          .label { font-weight: bold; color: #666; }
          .value { margin-left: 10px; }
          .skills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
          .skill { background: #e0e7ff; padding: 5px 10px; border-radius: 5px; }
          .verification { margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="title">${credential.name}</div>
            <div style="font-size: 18px; color: #666; margin-top: 10px;">Certificate of Achievement</div>
          </div>
          <div class="details">
            <p><span class="label">Credential ID:</span><span class="value">${credential.credentialId}</span></p>
            <p><span class="label">Issued By:</span><span class="value">${credential.issuer.name}</span></p>
            <p><span class="label">Issue Date:</span><span class="value">${credential.issueDate}</span></p>
            ${credential.expiryDate ? `<p><span class="label">Expiry Date:</span><span class="value">${credential.expiryDate}</span></p>` : ''}
            <p><span class="label">Level:</span><span class="value">${credential.level}</span></p>
            <p><span class="label">Skills:</span></p>
            <div class="skills">
              ${credential.skills.map(s => `<span class="skill">${s}</span>`).join('')}
            </div>
          </div>
          <div class="verification">
            <p><span class="label">Verification Hash:</span></p>
            <p style="font-family: monospace; font-size: 12px; word-break: break-all;">${credential.verificationHash}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${credential.name.replace(/\s+/g, '_')}_Certificate.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Certificate downloaded: ${credential.name}`)
  }, [])

  const handleShareCertification = useCallback(async (credential: Credential) => {
    await shareContent({
      title: credential.name,
      text: `Check out my ${credential.name} certification from ${credential.issuer.name}`,
      url: credential.credentialUrl || window.location.href
    })
  }, [])

  const handleVerifyCredential = useCallback(async (credential: Credential) => {
    const result = await apiPost('/api/certifications/verify', {
      credentialId: credential.credentialId,
      verificationHash: credential.verificationHash
    }, {
      loading: `Verifying "${credential.name}"...`,
      success: `"${credential.name}" verified successfully!`,
      error: 'Verification failed'
    })
    return result.success
  }, [])

  const handleRenewCertification = useCallback(async (certName: string, certId: string) => {
    const result = await apiPost(`/api/certifications/${certId}/renew`, {}, {
      loading: `Starting renewal for "${certName}"...`,
      success: `"${certName}" renewal process started`,
      error: 'Failed to start renewal'
    })
    if (result.success) {
      refetch()
    }
  }, [refetch])

  const handleDeleteCredential = useCallback(async (credential: Credential) => {
    if (!confirm(`Are you sure you want to delete "${credential.name}"? This action cannot be undone.`)) {
      return
    }
    const result = await apiDelete(`/api/certifications/${credential.id}`, {
      loading: `Deleting "${credential.name}"...`,
      success: `"${credential.name}" deleted successfully`,
      error: 'Failed to delete credential'
    })
    if (result.success) {
      refetch()
    }
  }, [refetch])

  // Quick actions with real functionality
  const certsQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'Add Credential',
      icon: 'plus',
      action: () => { resetForm(); setShowCreateDialog(true) },
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Verify Badge',
      icon: 'shield',
      action: async () => {
        const result = await apiPost('/api/certifications/verify-all', {}, {
          loading: 'Verifying all badges...',
          success: 'All badges verified successfully!',
          error: 'Verification failed'
        })
      },
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Export Report',
      icon: 'download',
      action: () => {
        const exportData = certifications.map((c: any) => ({
          name: c.certification_name,
          type: c.certification_type,
          issuer: c.issuing_organization || 'N/A',
          status: c.status,
          issueDate: c.issue_date || 'N/A',
          expiryDate: c.expiry_date || 'N/A',
          level: c.level || 'N/A',
          certificateNumber: c.certificate_number || 'N/A'
        }))
        downloadAsJson(exportData, 'certifications-report.json')
      },
      variant: 'outline' as const
    },
  ], [resetForm])

  // Loading state
  if (certificationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading certifications...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (certificationsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load certifications data</p>
        <button onClick={() => refetch()} className="text-sm underline hover:text-blue-600">Retry</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Certifications & Credentials
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
                Credly Level
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Digital badges, skills endorsements & verified credentials</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white w-64"
            />
            <Button
              onClick={() => { resetForm(); setShowCreateDialog(true) }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
            >
              + Add Credential
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Credentials</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalCredentials}</div>
            <div className="text-xs text-green-600">{stats.activeCredentials} active</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Badges</div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalBadges}</div>
            <div className="text-xs text-purple-600">{formatNumber(stats.totalXP)} XP</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skills</div>
            <div className="text-2xl font-bold text-green-600">{stats.totalSkills}</div>
            <div className="text-xs text-green-600">{stats.totalEndorsements} endorsements</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Learning Paths</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pathwaysCompleted}</div>
            <div className="text-xs text-orange-600">{stats.pathwaysInProgress} in progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verifications</div>
            <div className="text-2xl font-bold text-cyan-600">{stats.verificationCount}</div>
            <div className="text-xs text-cyan-600">{stats.blockchainVerified} on-chain</div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border dark:border-gray-700">
            <TabsTrigger value="credentials" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
              🏆 Credentials
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              🎖️ Badges
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              ⚡ Skills
            </TabsTrigger>
            <TabsTrigger value="pathways" className="data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900/30">
              🛤️ Pathways
            </TabsTrigger>
            <TabsTrigger value="verification" className="data-[state=active]:bg-cyan-100 dark:data-[state=active]:bg-cyan-900/30">
              🔐 Verification
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
              ⚙️ Settings
            </TabsTrigger>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            {/* Credentials Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-xl font-bold">Digital Credentials</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Manage and showcase your verified digital credentials. Share your achievements with blockchain-verified authenticity.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalCredentials}</div>
                    <div className="text-xs text-white/70">Total Credentials</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-200">{stats.activeCredentials}</div>
                    <div className="text-xs text-white/70">Active</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.blockchainVerified}</div>
                    <div className="text-xs text-white/70">Blockchain Verified</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockCredentials.reduce((sum, c) => sum + c.shareCount, 0)}</div>
                    <div className="text-xs text-white/70">Total Shares</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="certification">Certifications</option>
                <option value="license">Licenses</option>
                <option value="degree">Degrees</option>
                <option value="course">Courses</option>
                <option value="achievement">Achievements</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredCertifications.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border dark:border-gray-700 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No certifications found. Add your first credential to get started.</p>
                  <Button onClick={() => { resetForm(); setShowCreateDialog(true) }} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    + Add Credential
                  </Button>
                </div>
              ) : (
                filteredCertifications.map((cert: any) => (
                  <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🏆</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(cert.status)}`}>
                            {cert.status}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {cert.certification_type}
                          </span>
                          {cert.level && (
                            <span className={`px-2 py-1 rounded text-xs ${getLevelColor(cert.level)}`}>
                              {cert.level}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold dark:text-white">{cert.certification_name}</h3>
                        {cert.scope && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{cert.scope}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                          {cert.issuing_organization && <span>🏢 {cert.issuing_organization}</span>}
                          {cert.issue_date && <span>📅 {new Date(cert.issue_date).toLocaleDateString()}</span>}
                          {cert.expiry_date && <span>⏰ Expires {new Date(cert.expiry_date).toLocaleDateString()}</span>}
                        </div>
                        {cert.associated_skills && cert.associated_skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {cert.associated_skills.slice(0, 4).map((skill: string) => (
                              <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs dark:text-gray-300">
                                {skill}
                              </span>
                            ))}
                            {cert.associated_skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs dark:text-gray-300">
                                +{cert.associated_skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(cert)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(cert)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            {/* Badges Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎖️</span>
                  <h3 className="text-xl font-bold">Achievement Badges</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Earn badges by completing learning pathways, achievements, and skill assessments. Show off your accomplishments!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalBadges}</div>
                    <div className="text-xs text-white/70">Badges Earned</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalXP}</div>
                    <div className="text-xs text-white/70">Total XP</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-white/70">Rare Badges</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-white/70">Pinned</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badgesLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : badges.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border dark:border-gray-700 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No badges earned yet. Complete learning pathways to earn badges.</p>
                </div>
              ) : (
                badges.map((badge: any) => (
                  <div key={badge.id} className="rounded-xl p-6 shadow-sm border-2 hover:shadow-md transition-all cursor-pointer border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">🎖️</div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">{badge.badge_type || 'badge'}</div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 dark:text-white">{badge.name || badge.badge_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{badge.description || ''}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>{badge.awarded_at ? new Date(badge.awarded_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="DevOps">DevOps</option>
                <option value="Data Science">Data Science</option>
                <option value="Programming">Programming</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredSkills.map(skill => (
                <Dialog key={skill.id}>
                  <DialogTrigger asChild>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold dark:text-white">{skill.name}</h3>
                            {skill.trending && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded text-xs">
                                🔥 Trending
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-xs">
                              {skill.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Level {skill.level}/{skill.maxLevel}</span>
                                <span className="text-gray-500 dark:text-gray-400">{skill.xp}/{skill.xp + skill.xpToNextLevel} XP</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                  style={{ width: `${(skill.xp / (skill.xp + skill.xpToNextLevel)) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <span>👍 {skill.endorsements.count} endorsements</span>
                            {skill.assessmentScore && <span>📊 {skill.assessmentScore}% assessed</span>}
                            <span>📈 {skill.demandScore}% demand</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {skill.endorsements.topEndorsers.slice(0, 3).map((endorser, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm -ml-2 first:ml-0 border-2 border-white dark:border-gray-800">
                              {endorser.avatar}
                            </div>
                          ))}
                          {skill.endorsements.count > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs -ml-2 border-2 border-white dark:border-gray-800 dark:text-white">
                              +{skill.endorsements.count - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{skill.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded dark:text-gray-300">{skill.category}</span>
                        {skill.trending && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded">
                            🔥 Trending Skill
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2 dark:text-white">Skill Progress</div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm mt-1 text-gray-500 dark:text-gray-400">
                          <span>Level {skill.level}</span>
                          <span>Max Level {skill.maxLevel}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2 dark:text-white">Top Endorsers</div>
                        <div className="space-y-2">
                          {skill.endorsements.topEndorsers.map((endorser, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-2xl">{endorser.avatar}</span>
                              <div>
                                <div className="font-medium dark:text-white">{endorser.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{endorser.title}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {skill.relatedBadges.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2 dark:text-white">Related Badges</div>
                          <div className="flex gap-3">
                            {skill.relatedBadges.map(badge => (
                              <div key={badge.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-xl">{badge.image}</span>
                                <span className="text-sm dark:text-gray-300">{badge.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          onClick={() => {
                            window.open(`/dashboard/skills/assessment?skill=${encodeURIComponent(skill.name)}`, '_blank')
                            toast.success(`Opening ${skill.name} assessment`)
                          }}
                        >
                          Take Assessment
                        </button>
                        <button
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white"
                          onClick={async () => {
                            const result = await apiPost('/api/skills/endorsement-request', {
                              skillId: skill.id,
                              skillName: skill.name
                            }, {
                              loading: 'Sending endorsement request...',
                              success: 'Endorsement request sent!',
                              error: 'Failed to send request'
                            })
                          }}
                        >
                          Request Endorsement
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Pathways Tab */}
          <TabsContent value="pathways" className="space-y-4">
            <div className="grid gap-4">
              {mockPathways.map(pathway => (
                <div key={pathway.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{pathway.thumbnail}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${getLevelColor(pathway.difficulty)}`}>
                          {pathway.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-xs">
                          {pathway.category}
                        </span>
                        {pathway.progress === 100 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold dark:text-white">{pathway.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pathway.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>⏱️ {pathway.duration}</span>
                        <span>⭐ {pathway.rating} ({formatNumber(pathway.reviewCount)} reviews)</span>
                        <span>👥 {formatNumber(pathway.enrolledCount)} enrolled</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium dark:text-white">Progress</span>
                          <span className="text-gray-500 dark:text-gray-400">{pathway.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pathway.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${pathway.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {pathway.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-3 text-sm">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              step.status === 'completed' ? 'bg-green-500 text-white' :
                              step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                              step.status === 'available' ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-400'
                            }`}>
                              {step.status === 'completed' ? '✓' : index + 1}
                            </div>
                            <span className={`flex-1 ${step.status === 'locked' ? 'text-gray-400 dark:text-gray-500' : 'dark:text-gray-300'}`}>
                              {step.title}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 text-xs">{step.duration}</span>
                            {step.status === 'in_progress' && (
                              <span className="text-blue-600 dark:text-blue-400 text-xs">{step.progress}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {pathway.targetCredential && (
                      <div className="text-center">
                        <div className="text-3xl mb-1">{pathway.targetCredential.image}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Target</div>
                      </div>
                    )}
                  </div>
                  {pathway.progress < 100 && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Est. completion: {pathway.estimatedCompletion}
                      </span>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        onClick={() => {
                          const currentStep = pathway.steps.find(s => s.status === 'in_progress' || s.status === 'available')
                          window.open(`/dashboard/learning/${pathway.id}?step=${currentStep?.id || pathway.steps[0].id}`, '_blank')
                          toast.success(`Opening ${pathway.name}`)
                        }}
                      >
                        Continue Learning
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Verification QR Code */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <h3 className="font-semibold mb-4 dark:text-white">🔐 Verify Your Credentials</h3>
                <div className="text-center py-8">
                  <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
                    <div className="w-32 h-32 bg-white dark:bg-gray-600 rounded grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-6 p-2">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`${Math.random() > 0.5 ? 'bg-gray-900 dark:bg-white' : 'bg-transparent'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Scan this QR code to verify all your credentials
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
                      onClick={async () => {
                        // Generate a simple QR code SVG
                        const verifyUrl = `${window.location.origin}/verify/credentials`
                        const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                          <rect width="200" height="200" fill="white"/>
                          <text x="100" y="100" text-anchor="middle" font-size="12">QR: ${verifyUrl}</text>
                          <text x="100" y="120" text-anchor="middle" font-size="10">Scan to verify</text>
                        </svg>`
                        const blob = new Blob([qrSvg], { type: 'image/svg+xml' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'verification-qr-code.svg'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        toast.success('QR code downloaded!')
                      }}
                    >
                      Download QR
                    </button>
                    <button
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm dark:text-white"
                      onClick={() => copyToClipboard(`${window.location.origin}/verify/credentials`, 'Verification link copied!')}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Blockchain Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <h3 className="font-semibold mb-4 dark:text-white">⛓️ Blockchain Anchoring</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm dark:text-green-300">On-chain Credentials</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{stats.blockchainVerified}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm dark:text-gray-300">Pending Anchoring</span>
                    <span className="font-semibold dark:text-white">{stats.totalCredentials - stats.blockchainVerified}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Credentials anchored to blockchain are tamper-proof and can be independently verified without contacting the issuer.
                  </p>
                  <button
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    onClick={async () => {
                      const result = await apiPost('/api/certifications/anchor-blockchain', {
                        credentialIds: mockCredentials.filter(c => !c.blockchainTxId).map(c => c.id)
                      }, {
                        loading: 'Anchoring credentials to blockchain...',
                        success: 'All credentials anchored successfully!',
                        error: 'Failed to anchor credentials'
                      })
                    }}
                  >
                    Anchor All Credentials
                  </button>
                </div>
              </div>
            </div>

            {/* Verification History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <h3 className="font-semibold mb-4 dark:text-white">📋 Verification History</h3>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {mockVerifications.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        <div>
                          <div className="font-medium text-sm dark:text-white">{record.credentialName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Verified by {record.verifier.organization} via {record.method}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{record.location}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(record.verifiedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Settings Tab - Comprehensive 6 Sub-tabs */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⚙️</span>
                  <h3 className="text-xl font-bold">Certification Settings</h3>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Configure your credential platform settings, verification preferences, notifications, privacy options, and account security.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalCredentials}</div>
                    <div className="text-xs text-white/70">Credentials</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalBadges}</div>
                    <div className="text-xs text-white/70">Badges</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalXP}</div>
                    <div className="text-xs text-white/70">Total XP</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalEndorsements}</div>
                    <div className="text-xs text-white/70">Endorsements</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid with Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: '⚙️', description: 'Account settings' },
                      { id: 'privacy', label: 'Privacy', icon: '🔒', description: 'Visibility options' },
                      { id: 'verification', label: 'Verification', icon: '✓', description: 'Verify settings' },
                      { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Alert preferences' },
                      { id: 'integrations', label: 'Integrations', icon: '🔗', description: 'Connected apps' },
                      { id: 'advanced', label: 'Advanced', icon: '🚀', description: 'Power features' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                          settingsTab === item.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>👤</span> Profile Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                          <input type="text" defaultValue="John Doe" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Professional Title</label>
                          <input type="text" defaultValue="Senior Developer" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                          <input type="email" defaultValue="john@example.com" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn URL</label>
                          <input type="url" defaultValue="linkedin.com/in/johndoe" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                        <textarea rows={3} defaultValue="Experienced developer with expertise in cloud technologies..." className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🌐</span> Public Profile
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Public Profile</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to view your credentials</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Featured Credentials</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Show top credentials on your profile</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Skills Endorsements</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to endorse your skills</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {settingsTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🔒</span> Privacy Controls
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Hide Email Address</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Don't display email on public profile</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Hide Verification History</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Keep verification records private</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Anonymous Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hide your name on leaderboards</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Indexable Profile</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow search engines to index your profile</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>📊</span> Data Sharing
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Share with Employers</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow verified employers to view credentials</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Analytics Sharing</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Share anonymous usage data</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Settings */}
                {settingsTab === 'verification' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>✅</span> Verification Preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Blockchain Verification</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Store credentials on blockchain</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Auto-Renew Credentials</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically renew expiring credentials</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Verification QR Code</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Generate QR codes for quick verification</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🔔</span> Email Notifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Credential Expiry</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify before credentials expire</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">New Badges</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when you earn new badges</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Endorsements</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when skills are endorsed</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Verification Requests</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when credentials are verified</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🔗</span> Connected Platforms
                      </h3>
                      <div className="space-y-4">
                        {[
                          { name: 'LinkedIn', status: 'connected', icon: '💼' },
                          { name: 'Coursera', status: 'connected', icon: '📚' },
                          { name: 'Credly', status: 'connected', icon: '🎖️' },
                          { name: 'Udemy', status: 'disconnected', icon: '🎓' },
                          { name: 'AWS Training', status: 'connected', icon: '☁️' },
                          { name: 'Google Cloud', status: 'disconnected', icon: '🌐' },
                        ].map((platform) => (
                          <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{platform.icon}</span>
                              <div>
                                <p className="font-medium dark:text-white">{platform.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {platform.status === 'connected' ? 'Connected' : 'Not connected'}
                                </p>
                              </div>
                            </div>
                            <button
                              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                platform.status === 'connected'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                              onClick={async () => {
                                if (platform.status === 'connected') {
                                  if (!confirm(`Are you sure you want to disconnect from ${platform.name}?`)) return
                                  await apiPost(`/api/integrations/${platform.name.toLowerCase().replace(/\s+/g, '-')}/disconnect`, {}, {
                                    loading: `Disconnecting from ${platform.name}...`,
                                    success: `Disconnected from ${platform.name}!`,
                                    error: `Failed to disconnect from ${platform.name}`
                                  })
                                } else {
                                  // Open OAuth flow for the platform
                                  window.open(`/api/integrations/${platform.name.toLowerCase().replace(/\s+/g, '-')}/connect`, '_blank')
                                  toast.success(`Opening ${platform.name} connection...`)
                                }
                              }}
                            >
                              {platform.status === 'connected' ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🚀</span> Advanced Options
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Developer Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Access API keys and webhooks</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Beta Features</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Early access to new features</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>📥</span> Data Export
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <button
                          className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 text-center dark:border-gray-600"
                          onClick={() => {
                            // Generate HTML report for PDF printing
                            const htmlContent = `
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <title>Certifications Report</title>
                                <style>
                                  body { font-family: Arial, sans-serif; padding: 40px; }
                                  h1 { color: #1e40af; }
                                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                                  th { background: #f3f4f6; }
                                  .status-active { color: green; }
                                  .status-expired { color: red; }
                                </style>
                              </head>
                              <body>
                                <h1>Certifications Report</h1>
                                <p>Generated: ${new Date().toLocaleDateString()}</p>
                                <table>
                                  <tr><th>Name</th><th>Issuer</th><th>Status</th><th>Issue Date</th><th>Expiry</th></tr>
                                  ${mockCredentials.map(c => `<tr><td>${c.name}</td><td>${c.issuer.name}</td><td class="status-${c.status}">${c.status}</td><td>${c.issueDate}</td><td>${c.expiryDate || 'N/A'}</td></tr>`).join('')}
                                </table>
                              </body>
                              </html>
                            `
                            const blob = new Blob([htmlContent], { type: 'text/html' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'certifications-report.html'
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                            toast.success('PDF report exported! Open and print as PDF.')
                          }}
                        >
                          <span className="text-2xl">📄</span>
                          <p className="font-medium mt-2 dark:text-white">Export as PDF</p>
                          <p className="text-xs text-gray-500">All credentials</p>
                        </button>
                        <button
                          className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 text-center dark:border-gray-600"
                          onClick={() => {
                            const exportData = {
                              exportDate: new Date().toISOString(),
                              credentials: mockCredentials,
                              badges: mockBadges,
                              skills: mockSkills,
                              pathways: mockPathways
                            }
                            downloadAsJson(exportData, 'certifications-data.json')
                          }}
                        >
                          <span className="text-2xl">📊</span>
                          <p className="font-medium mt-2 dark:text-white">Export as JSON</p>
                          <p className="text-xs text-gray-500">Machine readable</p>
                        </button>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <h3 className="text-lg font-semibold mb-4 text-red-700 dark:text-red-400 flex items-center gap-2">
                        <span>⚠️</span> Danger Zone
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Data</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remove all credentials and data</p>
                          </div>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete ALL certification data? This action cannot be undone.')) return
                              if (!confirm('This will permanently delete all credentials, badges, and progress. Type "DELETE" to confirm.')) return
                              const result = await apiDelete('/api/certifications/delete-all', {
                                loading: 'Deleting all data...',
                                success: 'All data deleted successfully!',
                                error: 'Failed to delete data'
                              })
                              if (result.success) {
                                refetch()
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockCertsAIInsights}
              title="Certification Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockCertsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCertsPredictions}
              title="Certification Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockCertsActivities}
            title="Certification Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={certsQuickActions}
            variant="grid"
          />
        </div>

        {/* Database Certifications Section */}
        {dbCertifications && dbCertifications.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Your Certifications (Database)</h3>
            {certificationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-3">
                {dbCertifications.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">{cert.certification_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cert.issuing_organization || 'Unknown issuer'} - {cert.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(cert)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(cert)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Certification Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Certification</DialogTitle>
            <DialogDescription>Enter the details for your new certification</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Certification Name *</Label>
                <Input
                  value={certForm.certification_name}
                  onChange={(e) => setCertForm({ ...certForm, certification_name: e.target.value })}
                  placeholder="AWS Solutions Architect"
                />
              </div>
              <div className="space-y-2">
                <Label>Certification Code</Label>
                <Input
                  value={certForm.certification_code}
                  onChange={(e) => setCertForm({ ...certForm, certification_code: e.target.value })}
                  placeholder="SAA-C03"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={certForm.certification_type} onValueChange={(v) => setCertForm({ ...certForm, certification_type: v as CertificationType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={certForm.status} onValueChange={(v) => setCertForm({ ...certForm, status: v as CertificationStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="in_renewal">In Renewal</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Issuing Organization</Label>
                <Input
                  value={certForm.issuing_organization}
                  onChange={(e) => setCertForm({ ...certForm, issuing_organization: e.target.value })}
                  placeholder="Amazon Web Services"
                />
              </div>
              <div className="space-y-2">
                <Label>Issuing Authority</Label>
                <Input
                  value={certForm.issuing_authority}
                  onChange={(e) => setCertForm({ ...certForm, issuing_authority: e.target.value })}
                  placeholder="AWS Training"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input type="date" value={certForm.issue_date} onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="date" value={certForm.expiry_date} onChange={(e) => setCertForm({ ...certForm, expiry_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Level</Label>
                <Input value={certForm.level} onChange={(e) => setCertForm({ ...certForm, level: e.target.value })} placeholder="Associate, Professional, etc." />
              </div>
              <div className="space-y-2">
                <Label>Certificate Number</Label>
                <Input value={certForm.certificate_number} onChange={(e) => setCertForm({ ...certForm, certificate_number: e.target.value })} placeholder="CERT-12345" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={certForm.notes} onChange={(e) => setCertForm({ ...certForm, notes: e.target.value })} placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCertification} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Certification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Certification Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Certification</DialogTitle>
            <DialogDescription>Update certification details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Certification Name *</Label>
                <Input value={certForm.certification_name} onChange={(e) => setCertForm({ ...certForm, certification_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Certification Code</Label>
                <Input value={certForm.certification_code} onChange={(e) => setCertForm({ ...certForm, certification_code: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={certForm.certification_type} onValueChange={(v) => setCertForm({ ...certForm, certification_type: v as CertificationType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={certForm.status} onValueChange={(v) => setCertForm({ ...certForm, status: v as CertificationStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="in_renewal">In Renewal</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Issuing Organization</Label>
                <Input value={certForm.issuing_organization} onChange={(e) => setCertForm({ ...certForm, issuing_organization: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Issuing Authority</Label>
                <Input value={certForm.issuing_authority} onChange={(e) => setCertForm({ ...certForm, issuing_authority: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input type="date" value={certForm.issue_date} onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="date" value={certForm.expiry_date} onChange={(e) => setCertForm({ ...certForm, expiry_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Level</Label>
                <Input value={certForm.level} onChange={(e) => setCertForm({ ...certForm, level: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Certificate Number</Label>
                <Input value={certForm.certificate_number} onChange={(e) => setCertForm({ ...certForm, certificate_number: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={certForm.notes} onChange={(e) => setCertForm({ ...certForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setCertToEdit(null); resetForm() }}>Cancel</Button>
            <Button onClick={handleUpdateCertification} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Certification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{certToDelete?.certification_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setCertToDelete(null) }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCertification} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
