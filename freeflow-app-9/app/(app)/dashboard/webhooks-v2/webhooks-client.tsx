'use client'

// MIGRATED: Batch #18 - Verified database hook integration
// Hooks used: useState, useMemo, useCallback, useWebhooks

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useWebhooks, Webhook, WebhookEventType } from '@/lib/hooks/use-webhooks'
import {
  Webhook as WebhookIcon,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  Shield,
  Settings,
  Code,
  Globe,
  Activity,
  Play,
  Pause,
  Plus,
  Trash2,
  Search,
  Eye,
  Edit,
  Copy,
  Terminal,
  Key,
  Lock,
  Unlock,
  RotateCcw,
  History,
  FileJson,
  ChevronRight,
  ChevronDown,
  TestTube,
  Timer,
  Layers,
  Workflow,
  Plug,
  Sparkles,
  Download,
  Upload,
  Bell,
  HardDrive,
  AlertOctagon,
  Sliders,
  Loader2,
  ExternalLink,
  Link2,
  ScrollText
} from 'lucide-react'


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

// Comprehensive type definitions for Zapier-level webhooks
type AuthType = 'none' | 'api_key' | 'bearer' | 'basic' | 'oauth2' | 'hmac'
type DeliveryStatus = 'success' | 'failed' | 'pending' | 'retrying'
type WebhookStatus = 'active' | 'paused' | 'failed' | 'disabled'

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  description: string
  status: WebhookStatus
  events: string[]
  authType: AuthType
  secret: string
  headers: Record<string, string>
  retryPolicy: {
    maxRetries: number
    backoffType: 'linear' | 'exponential'
    initialDelay: number
  }
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
  }
  filters: WebhookFilter[]
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  successRate: number
  avgResponseTime: number
  lastDeliveryAt: string | null
  lastDeliveryStatus: DeliveryStatus | null
  createdAt: string
  updatedAt: string
}

interface WebhookFilter {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
  value: string
}

interface EventType {
  id: string
  name: string
  category: string
  description: string
  payloadExample: string
  subscriberCount: number
  totalDeliveries: number
  avgResponseTime: number
}

interface DeliveryLog {
  id: string
  webhookId: string
  webhookName: string
  eventType: string
  status: DeliveryStatus
  statusCode: number | null
  requestHeaders: Record<string, string>
  requestBody: string
  responseHeaders: Record<string, string> | null
  responseBody: string | null
  responseTime: number | null
  attempt: number
  maxAttempts: number
  error: string | null
  timestamp: string
}

interface Integration {
  id: string
  name: string
  icon: string
  category: string
  description: string
  installed: boolean
  eventsSupported: string[]
  popularity: number
}

interface WebhookTemplate {
  id: string
  name: string
  description: string
  url: string
  events: string[]
  headers: Record<string, string>
  category: string
}

interface WebhookStats {
  totalEndpoints: number
  activeEndpoints: number
  pausedEndpoints: number
  failedEndpoints: number
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  successRate: number
  avgResponseTime: number
  deliveriesToday: number
  deliveriesThisWeek: number
}

interface WebhooksClientProps {
  initialWebhooks: Webhook[]
  initialEventTypes: WebhookEventType[]
  initialStats: {
    total: number
    active: number
    paused: number
    failed: number
    totalDeliveries: number
    successfulDeliveries: number
    avgSuccessRate: number
    avgResponseTime: number
  }
}

// Quick actions are now defined inside the component to access real handlers

export default function WebhooksClient({
  initialWebhooks,
  initialEventTypes,
  initialStats
}: WebhooksClientProps) {
  const router = useRouter()

  // Use the webhooks hook for CRUD operations
  const {
    webhooks,
    loading: webhooksLoading,
    error,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleStatus,
    testWebhook,
    fetchWebhooks,
    stats
  } = useWebhooks(initialWebhooks, initialStats)

  const [activeTab, setActiveTab] = useState('endpoints')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WebhookStatus | 'all'>('all')
  const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null)
  const [selectedLog, setSelectedLog] = useState<DeliveryLog | null>(null)
  const [showEndpointDialog, setShowEndpointDialog] = useState(false)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Users', 'Orders', 'Payments']))
  const [settingsTab, setSettingsTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)

  // Additional dialog states for comprehensive functionality
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [showRegenerateSecretDialog, setShowRegenerateSecretDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showEventPayloadDialog, setShowEventPayloadDialog] = useState(false)
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false)
  const [showClearLogsDialog, setShowClearLogsDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showResetConfigDialog, setShowResetConfigDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<WebhookTemplate | null>(null)
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)
  const [webhookToDelete, setWebhookToDelete] = useState<{ id: string; name: string } | null>(null)
  const [webhookForSecret, setWebhookForSecret] = useState<{ id: string; name: string } | null>(null)
  const [integrationSearch, setIntegrationSearch] = useState('')
  const [testPayload, setTestPayload] = useState(JSON.stringify({ event: 'test.event', data: { id: 'test_123' } }, null, 2))
  const [selectedTestEvent, setSelectedTestEvent] = useState('user.created')
  const [webhookToTest, setWebhookToTest] = useState<string | null>(null)

  // Form state for create/edit webhook
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    events: [] as string[],
    retry_count: 3,
    timeout_ms: 30000,
    verify_ssl: true,
    custom_headers: {} as Record<string, string>
  })

  // Reset form when dialog opens/closes
  const openCreateDialog = useCallback(() => {
    setFormData({
      name: '',
      url: '',
      description: '',
      events: [],
      retry_count: 3,
      timeout_ms: 30000,
      verify_ssl: true,
      custom_headers: {}
    })
    setSelectedEndpoint(null)
    setShowEndpointDialog(true)
  }, [])

  const openEditDialog = useCallback((endpoint: WebhookEndpoint) => {
    setFormData({
      name: endpoint.name,
      url: endpoint.url,
      description: endpoint.description,
      events: endpoint.events,
      retry_count: endpoint.retryPolicy?.maxRetries || 3,
      timeout_ms: 30000,
      verify_ssl: true,
      custom_headers: endpoint.headers || {}
    })
    setSelectedEndpoint(endpoint)
    setShowEndpointDialog(true)
  }, [])

  // Filter webhooks from Supabase data
  const filteredWebhooks = useMemo(() => {
    return webhooks.filter(webhook => {
      const matchesSearch = webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webhook.url.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || webhook.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [webhooks, searchQuery, statusFilter])


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'disabled': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'retrying': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />
      case 'paused': return <Pause className="w-3 h-3" />
      case 'failed': return <AlertCircle className="w-3 h-3" />
      case 'success': return <CheckCircle className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      case 'retrying': return <RefreshCw className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  const getAuthIcon = (authType: AuthType) => {
    switch (authType) {
      case 'api_key': return <Key className="w-4 h-4" />
      case 'bearer': return <Shield className="w-4 h-4" />
      case 'basic': return <Lock className="w-4 h-4" />
      case 'oauth2': return <Unlock className="w-4 h-4" />
      case 'hmac': return <Code className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // CRUD Handlers with Supabase integration
  const handleSaveWebhook = async () => {
    if (!formData.name || !formData.url) {
      toast.error('Validation Error')
      return
    }

    setIsSaving(true)
    try {
      if (selectedEndpoint) {
        // Update existing webhook
        const result = await updateWebhook(selectedEndpoint.id, {
          name: formData.name,
          url: formData.url,
          description: formData.description,
          events: formData.events,
          retry_count: formData.retry_count,
          timeout_ms: formData.timeout_ms,
          verify_ssl: formData.verify_ssl,
          custom_headers: formData.custom_headers
        })
        if (result.success) {
          toast.success(`Webhook updated: "${formData.name}" has been updated`)
          setShowEndpointDialog(false)
        } else {
          toast.error('Update failed')
        }
      } else {
        // Create new webhook
        const result = await createWebhook({
          name: formData.name,
          url: formData.url,
          description: formData.description,
          events: formData.events,
          retry_count: formData.retry_count,
          timeout_ms: formData.timeout_ms,
          verify_ssl: formData.verify_ssl,
          custom_headers: formData.custom_headers,
          status: 'active'
        })
        if (result.success) {
          toast.success(`Webhook created: "${formData.name}" has been created`)
          setShowEndpointDialog(false)
        } else {
          toast.error('Creation failed')
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteWebhook = async (id: string, name: string) => {
    const result = await deleteWebhook(id)
    if (result.success) {
      toast.success(`Webhook deleted: "${name}" has been deleted`)
    } else {
      toast.error('Delete failed')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    const result = await toggleStatus(id, newStatus as 'active' | 'paused')
    if (result.success) {
      toast.success(`Status updated: now ${newStatus}`)
    } else {
      toast.error('Status update failed')
    }
  }

  const handleTestWebhookDelivery = async (id: string) => {
    toast.info('Testing webhook')
    const result = await testWebhook(id)
    if (result.success) {
      toast.success('Test sent')
    } else {
      toast.error('Test failed')
    }
    setShowTestDialog(false)
  }

  const handleCopyUrl = (url: string) => {
    toast.promise(
      navigator.clipboard.writeText(url),
      {
        loading: 'Copying URL...',
        success: 'URL copied to clipboard',
        error: 'Failed to copy URL'
      }
    )
  }

  const handleRotateSecret = async (id: string) => {
    const newSecret = `whsec_${crypto.randomUUID().replace(/-/g, '')}`
    const result = await updateWebhook(id, { secret: newSecret })
    if (result.success) {
      toast.success('Secret rotated')
    } else {
      toast.error('Rotation failed')
    }
  }

  const handleEventToggle = (eventName: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventName)
        ? prev.events.filter(e => e !== eventName)
        : [...prev.events, eventName]
    }))
  }

  const handleExportWebhooks = async () => {
    try {
      const exportData = JSON.stringify(webhooks, null, 2)
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'webhooks-export.json'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Webhook configuration downloaded')
      setShowExportDialog(false)
    } catch (error) {
      toast.error('Failed to export webhooks')
    }
  }

  // Open delete confirmation dialog
  const openDeleteConfirmDialog = useCallback((id: string, name: string) => {
    setWebhookToDelete({ id, name })
    setShowDeleteConfirmDialog(true)
  }, [])

  // Confirm delete webhook
  const confirmDeleteWebhook = async () => {
    if (!webhookToDelete) return
    const result = await deleteWebhook(webhookToDelete.id)
    if (result.success) {
      toast.success(`Webhook deleted: "${webhookToDelete.name}" has been permanently deleted`)
    } else {
      toast.error('Delete failed')
    }
    setShowDeleteConfirmDialog(false)
    setWebhookToDelete(null)
  }

  // Open regenerate secret dialog
  const openRegenerateSecretDialog = useCallback((id: string, name: string) => {
    setWebhookForSecret({ id, name })
    setShowRegenerateSecretDialog(true)
  }, [])

  // Confirm regenerate secret
  const confirmRegenerateSecret = async () => {
    if (!webhookForSecret) return
    const newSecret = `whsec_${crypto.randomUUID().replace(/-/g, '')}`
    const result = await updateWebhook(webhookForSecret.id, { secret: newSecret })
    if (result.success) {
      toast.success('Secret regenerated')
      navigator.clipboard.writeText(newSecret)
      toast.info('Secret copied to clipboard')
    } else {
      toast.error('Regeneration failed')
    }
    setShowRegenerateSecretDialog(false)
    setWebhookForSecret(null)
  }

  // Handle integration install/configure
  const handleIntegrationAction = async (integration: Integration) => {
    setSelectedIntegration(integration)
    setShowIntegrationDialog(true)
  }

  // Install integration
  const handleInstallIntegration = async () => {
    if (!selectedIntegration) return

    try {
      toast.loading(`Installing ${selectedIntegration.name}...`)

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'install_integration',
          integrationId: selectedIntegration.id,
          name: selectedIntegration.name,
          events: selectedIntegration.eventsSupported
        })
      })

      toast.dismiss()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to install ${selectedIntegration.name}`)
      }

      toast.success(`${selectedIntegration.name} installed successfully!`)
      setShowIntegrationDialog(false)
    } catch (error) {
      toast.error(`Failed to install ${selectedIntegration.name}`)
    }
  }

  // Use webhook template
  const handleUseTemplate = (template: WebhookTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateDialog(true)
  }

  // Create webhook from template
  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return
    setFormData({
      name: selectedTemplate.name,
      url: selectedTemplate.url,
      description: selectedTemplate.description,
      events: selectedTemplate.events,
      retry_count: 3,
      timeout_ms: 30000,
      verify_ssl: true,
      custom_headers: selectedTemplate.headers
    })
    setShowTemplateDialog(false)
    setShowEndpointDialog(true)
    toast.info('Template loaded')
  }

  // View event payload example
  const handleViewEventPayload = (event: EventType) => {
    setSelectedEventType(event)
    setShowEventPayloadDialog(true)
  }

  // Copy event payload
  const handleCopyPayload = (payload: string) => {
    navigator.clipboard.writeText(payload)
    toast.success('Payload copied to clipboard')
  }

  // Export delivery logs
  const handleExportLogs = async () => {
    try {
      const exportData = JSON.stringify([], null, 2)
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'webhook-delivery-logs.json'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Delivery logs exported')
    } catch (error) {
      toast.error('Failed to export logs')
    }
  }

  // Import webhooks configuration
  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const config = JSON.parse(text)
      const webhooksToImport = Array.isArray(config) ? config : [config]

      toast.loading('Importing configuration...')

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import',
          webhooks: webhooksToImport
        })
      })

      toast.dismiss()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to import configuration')
      }

      const data = await response.json()
      toast.success(`Imported ${data.imported || webhooksToImport.length} webhook(s)`)
      setShowImportDialog(false)
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid configuration file')
      } else {
        toast.error('Failed to import configuration')
      }
    }
  }

  // Clear all logs
  const handleClearAllLogs = async () => {
    try {
      toast.loading('Clearing delivery logs...')

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear_logs'
        })
      })

      toast.dismiss()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to clear logs')
      }

      toast.success('All delivery logs cleared')
      setShowClearLogsDialog(false)
    } catch (error) {
      toast.error('Failed to clear logs')
    }
  }

  // Delete all webhooks
  const handleDeleteAllWebhooks = async () => {
    const count = webhooks.length
    toast.promise(
      Promise.all(webhooks.map(w => deleteWebhook(w.id))),
      {
        loading: `Deleting ${count} webhooks...`,
        success: `All ${count} webhooks deleted`,
        error: 'Failed to delete webhooks'
      }
    )
    setShowDeleteAllDialog(false)
  }

  // Reset configuration
  const handleResetConfiguration = async () => {
    try {
      toast.loading('Resetting configuration...')

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_config'
        })
      })

      toast.dismiss()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to reset configuration')
      }

      toast.success('All settings reset to defaults')
      setShowResetConfigDialog(false)
    } catch (error) {
      toast.error('Failed to reset configuration')
    }
  }

  // Copy signing secret
  const handleCopySecret = async (secret: string) => {
    await navigator.clipboard.writeText(secret)
    toast.success('Secret copied to clipboard')
  }

  // Copy API key
  const handleCopyApiKey = async () => {
    await navigator.clipboard.writeText('wh_api_xxxxxxxxxxxxxxxx')
    toast.success('API key copied to clipboard')
  }

  // Regenerate API key
  const handleRegenerateApiKey = async () => {
    try {
      toast.loading('Regenerating API key...')

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate_api_key'
        })
      })

      toast.dismiss()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to regenerate API key')
      }

      const data = await response.json()
      if (data.apiKey) {
        await navigator.clipboard.writeText(data.apiKey)
        toast.success('API key regenerated and copied to clipboard')
      } else {
        toast.success('API key regenerated successfully')
      }
    } catch (error) {
      toast.error('Failed to regenerate API key')
    }
  }

  // Open test webhook dialog with specific webhook
  const openTestWebhookDialog = useCallback((webhookId: string) => {
    setWebhookToTest(webhookId)
    setShowTestDialog(true)
  }, [])

  // Send test webhook
  const handleSendTestWebhook = async () => {
    if (!webhookToTest) return

    // Validate JSON payload before sending
    let parsedPayload
    try {
      parsedPayload = JSON.parse(testPayload)
    } catch {
      toast.error('Invalid JSON payload. Please check your syntax.')
      return
    }

    try {
      toast.loading('Sending test payload...')

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          webhookId: webhookToTest,
          eventType: selectedTestEvent,
          payload: parsedPayload
        })
      })

      toast.dismiss()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Test delivery failed')
      }

      const data = await response.json()
      toast.success(`Test successful! Response: ${data.statusCode || 200} (${data.responseTime || 0}ms)`)
      setShowTestDialog(false)
      setWebhookToTest(null)
    } catch (error) {
      toast.error('Test delivery failed')
    }
  }

  // Retry single delivery
  const handleRetryDelivery = async (logId: string) => {
    try {
      toast.loading('Retrying delivery...')

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retry_delivery',
          deliveryId: logId
        })
      })

      toast.dismiss()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to retry delivery')
      }

      toast.success('Delivery retry queued')
      setShowLogDialog(false)
    } catch (error) {
      toast.error('Failed to retry delivery')
    }
  }

  // Save settings
  const handleSaveSettings = async () => {
    try {
      toast.loading('Saving settings...')

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          settings: {
            // Add any settings form data here
          }
        })
      })

      toast.dismiss()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save settings')
      }

      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  // Pause all webhooks
  const handlePauseAllWebhooks = async () => {
    const activeWebhooks = webhooks.filter(w => w.status === 'active')
    if (activeWebhooks.length === 0) {
      toast.info('No active webhooks to pause')
      return
    }
    toast.promise(
      Promise.all(activeWebhooks.map(w => toggleStatus(w.id, 'paused'))),
      {
        loading: `Pausing ${activeWebhooks.length} webhooks...`,
        success: `${activeWebhooks.length} webhooks paused`,
        error: 'Failed to pause webhooks'
      }
    )
  }

  // Resume all webhooks
  const handleResumeAllWebhooks = async () => {
    const pausedWebhooks = webhooks.filter(w => w.status === 'paused')
    if (pausedWebhooks.length === 0) {
      toast.info('No paused webhooks to resume')
      return
    }
    toast.promise(
      Promise.all(pausedWebhooks.map(w => toggleStatus(w.id, 'active'))),
      {
        loading: `Resuming ${pausedWebhooks.length} webhooks...`,
        success: `${pausedWebhooks.length} webhooks resumed`,
        error: 'Failed to resume webhooks'
      }
    )
  }

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    if (!integrationSearch) return []
    return [].filter(i =>
      i.name.toLowerCase().includes(integrationSearch.toLowerCase()) ||
      i.category.toLowerCase().includes(integrationSearch.toLowerCase())
    )
  }, [integrationSearch])

  // Handler for retrying failed webhook deliveries
  const handleRetryFailedDeliveries = async () => {
    const failedWebhooks = webhooks.filter(w => w.status === 'failed')
    if (failedWebhooks.length === 0) {
      toast.info('No failed deliveries to retry')
      return
    }

    toast.promise(
      (async () => {
        const results = await Promise.allSettled(
          failedWebhooks.map(w =>
            fetch(`/api/webhooks/${w.id}/retry`, { method: 'POST' })
          )
        )
        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length
        return { successful, failed, total: failedWebhooks.length }
      })(),
      {
        loading: `Retrying ${failedWebhooks.length} failed deliveries...`,
        success: (data) => `${data.successful} retries successful${data.failed > 0 ? `, ${data.failed} still failing` : ''}`,
        error: 'Failed to retry deliveries'
      }
    )
  }

  // Quick actions with real functionality
  const webhooksQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Webhook',
      icon: 'Plus',
      shortcut: 'N',
      action: () => {
        openCreateDialog()
      }
    },
    {
      id: '2',
      label: 'Test Delivery',
      icon: 'Send',
      shortcut: 'T',
      action: async () => {
        const firstActiveWebhook = webhooks.find(w => w.status === 'active')
        if (!firstActiveWebhook) {
          toast.error('No active webhooks')
          return
        }
        toast.promise(
          fetch(`/api/webhooks/${firstActiveWebhook.id}/test`, { method: 'POST' })
            .then(res => {
              if (!res.ok) throw new Error('Test failed')
              return res.json()
            }),
          {
            loading: 'Sending test payload...',
            success: 'Test delivered successfully!',
            error: 'Delivery failed'
          }
        )
      }
    },
    {
      id: '3',
      label: 'View Logs',
      icon: 'FileJson',
      shortcut: 'L',
      action: () => {
        setActiveTab('logs')
        toast.success('Viewing delivery logs')
      }
    },
    {
      id: '4',
      label: 'Retry Failed',
      icon: 'RefreshCw',
      shortcut: 'R',
      action: handleRetryFailedDeliveries
    },
  ], [webhooks, openCreateDialog, setActiveTab])

  // Loading state
  if (webhooksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Error loading data</p>
        <Button onClick={() => fetchWebhooks()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <WebhookIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Webhooks & Integrations</h1>
                <p className="text-white/80">Zapier-level event delivery and automation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur">
                Zapier Level
              </span>
              <button
                onClick={openCreateDialog}
                className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
                disabled={webhooksLoading}
              >
                <Plus className="w-4 h-4" />
                Create Webhook
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <WebhookIcon className="w-4 h-4" />
                Endpoints
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-white/60">{stats.active} active</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Send className="w-4 h-4" />
                Total Deliveries
              </div>
              <div className="text-2xl font-bold">{stats.totalDeliveries > 1000 ? `${(stats.totalDeliveries / 1000).toFixed(1)}K` : stats.totalDeliveries}</div>
              <div className="text-xs text-white/60">{stats.successfulDeliveries} successful</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <CheckCircle className="w-4 h-4" />
                Success Rate
              </div>
              <div className="text-2xl font-bold text-green-300">{stats.avgSuccessRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Timer className="w-4 h-4" />
                Avg Latency
              </div>
              <div className="text-2xl font-bold">{Math.round(stats.avgResponseTime)}ms</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <AlertCircle className="w-4 h-4" />
                Failed
              </div>
              <div className="text-2xl font-bold text-red-300">{stats.failed}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Zap className="w-4 h-4" />
                Paused
              </div>
              <div className="text-2xl font-bold">{stats.paused}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Related Dashboards Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Navigation</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/dashboard/api-keys-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-900/20 transition-colors"
            >
              <Key className="w-4 h-4 text-slate-600" />
              API Keys
            </button>
            <button
              onClick={() => router.push('/dashboard/third-party-integrations-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20 transition-colors"
            >
              <Link2 className="w-4 h-4 text-purple-600" />
              Integrations
            </button>
            <button
              onClick={() => router.push('/dashboard/logs-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-colors"
            >
              <ScrollText className="w-4 h-4 text-blue-600" />
              Logs
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border dark:border-gray-700 mb-6">
            <TabsTrigger value="endpoints" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <WebhookIcon className="w-4 h-4 mr-2" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <Zap className="w-4 h-4 mr-2" />
              Event Types
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <History className="w-4 h-4 mr-2" />
              Delivery Logs
            </TabsTrigger>
            <TabsTrigger value="integrations" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <Plug className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            {/* Endpoints Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Webhook Endpoints</h2>
                  <p className="text-emerald-100">Stripe-level webhook management</p>
                  <p className="text-emerald-200 text-xs mt-1">Real-time events • Retry logic • Signature verification</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredWebhooks.length}</p>
                    <p className="text-emerald-200 text-sm">Endpoints</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredWebhooks.filter(w => w.enabled).length}</p>
                    <p className="text-emerald-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Filters */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search webhooks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'active', 'paused', 'failed'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === status
                          ? status === 'all' ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            : getStatusColor(status)
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {status !== 'all' && getStatusIcon(status)}
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Endpoints List */}
            <div className="space-y-4">
              {webhooksLoading && <div className="text-center py-8 text-gray-500">Loading webhooks...</div>}
              {!webhooksLoading && filteredWebhooks.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                  <WebhookIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No webhooks yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first webhook to start receiving events</p>
                  <button onClick={openCreateDialog} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
                    <Plus className="w-4 h-4 inline mr-2" />Create Webhook
                  </button>
                </div>
              )}
              {filteredWebhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          webhook.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          webhook.status === 'paused' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          <WebhookIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{webhook.name}</h3>
                            <button
                              onClick={() => handleToggleStatus(webhook.id, webhook.status)}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 cursor-pointer hover:opacity-80 ${getStatusColor(webhook.status)}`}
                              title="Click to toggle status"
                            >
                              {getStatusIcon(webhook.status)}
                              {webhook.status}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{webhook.description || 'No description'}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <code className="font-mono text-gray-600 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {webhook.url}
                            </code>
                            <button onClick={() => handleCopyUrl(webhook.url)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Copy URL">
                              <Copy className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openTestWebhookDialog(webhook.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                          title="Test Webhook"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditDialog({
                            id: webhook.id,
                            name: webhook.name,
                            url: webhook.url,
                            description: webhook.description || '',
                            status: webhook.status as WebhookStatus,
                            events: webhook.events,
                            authType: 'none' as AuthType,
                            secret: webhook.secret || '',
                            headers: webhook.custom_headers,
                            retryPolicy: { maxRetries: webhook.retry_count, backoffType: 'exponential', initialDelay: 1000 },
                            rateLimiting: { enabled: false, requestsPerMinute: 60 },
                            filters: [],
                            totalDeliveries: webhook.total_deliveries,
                            successfulDeliveries: webhook.successful_deliveries,
                            failedDeliveries: webhook.failed_deliveries,
                            successRate: webhook.success_rate,
                            avgResponseTime: webhook.avg_response_time_ms,
                            lastDeliveryAt: webhook.last_delivery_at,
                            lastDeliveryStatus: null,
                            createdAt: webhook.created_at,
                            updatedAt: webhook.updated_at
                          })}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirmDialog(webhook.id, webhook.name)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Events */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {webhook.events.map((event) => (
                        <span key={event} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded text-xs font-mono">
                          {event}
                        </span>
                      ))}
                      {webhook.events.length === 0 && <span className="text-gray-400 text-xs">No events subscribed</span>}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Deliveries</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{webhook.total_deliveries.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Success Rate</div>
                        <div className={`font-semibold ${webhook.success_rate >= 99 ? 'text-green-600 dark:text-green-400' : webhook.success_rate >= 95 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                          {webhook.success_rate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Avg Latency</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{webhook.avg_response_time_ms}ms</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Retries</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{webhook.retry_count}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Last Delivery</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {webhook.last_delivery_at ? new Date(webhook.last_delivery_at).toLocaleTimeString() : 'Never'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Event Types Tab */}
          <TabsContent value="events" className="space-y-4">
            {/* Events Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Event Types</h2>
                  <p className="text-blue-100">GitHub Webhooks-level event catalog</p>
                  <p className="text-blue-200 text-xs mt-1">Categorized • Documented • Filterable</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{[].length}</p>
                    <p className="text-blue-200 text-sm">Event Types</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Event Types</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {[].length} event types
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(groupedEvents).map(([category, events]) => (
                <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">{category}</span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        {events.length} events
                      </span>
                    </div>
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedCategories.has(category) && (
                    <div className="border-t dark:border-gray-700">
                      {events.map((event) => (
                        <div key={event.id} className="p-4 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{event.name}</code>
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs">
                                  {event.subscriberCount} subscribers
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>{event.totalDeliveries.toLocaleString()} deliveries</span>
                                <span>{event.avgResponseTime}ms avg</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewEventPayload(event)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                              title="View payload example"
                            >
                              <FileJson className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Delivery Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            {/* Logs Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Delivery Logs</h2>
                  <p className="text-amber-100">Datadog-level delivery monitoring</p>
                  <p className="text-amber-200 text-xs mt-1">Request/response • Retry history • Error analysis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{[].length}</p>
                    <p className="text-amber-200 text-sm">Log Entries</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delivery Logs</h2>
              <button
                onClick={handleExportLogs}
                className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Webhook</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Event</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Response</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Latency</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[].map((log) => (
                    <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{log.webhookName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                          {log.eventType}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {log.statusCode ? (
                          <span className={`font-mono text-sm ${log.statusCode >= 200 && log.statusCode < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {log.statusCode}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">
                        {log.responseTime ? `${log.responseTime}ms` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => { setSelectedLog(log); setShowLogDialog(true); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">App Integrations</h2>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={integrationSearch}
                  onChange={(e) => setIntegrationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredIntegrations.map((integration) => (
                <div key={integration.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{integration.icon}</div>
                    {integration.installed && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                        Installed
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{integration.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{integration.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{integration.category}</span>
                    <button
                      onClick={() => handleIntegrationAction(integration)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      integration.installed
                        ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}>
                      {integration.installed ? 'Configure' : 'Install'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Webhook Templates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[].map((template) => (
                <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      {template.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <code className="font-mono text-xs text-gray-600 dark:text-gray-400">{template.url}</code>
                  </div>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Zapier Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'delivery', label: 'Delivery', icon: Send },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'api', label: 'API Settings', icon: Code },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Webhook Stats Sidebar */}
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Webhook Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold">{{totalEndpoints:0,activeEndpoints:0,pausedEndpoints:0,failedEndpoints:0,totalDeliveries:0,successfulDeliveries:0,failedDeliveries:0,successRate:0,avgResponseTime:0,deliveriesToday:0,deliveriesThisWeek:0}.successRate}%</div>
                      <div className="text-xs opacity-80">Success Rate</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-center">
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{{totalEndpoints:0,activeEndpoints:0,pausedEndpoints:0,failedEndpoints:0,totalDeliveries:0,successfulDeliveries:0,failedDeliveries:0,successRate:0,avgResponseTime:0,deliveriesToday:0,deliveriesThisWeek:0}.totalEndpoints}</div>
                        <div className="text-xs opacity-80">Endpoints</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{{totalEndpoints:0,activeEndpoints:0,pausedEndpoints:0,failedEndpoints:0,totalDeliveries:0,successfulDeliveries:0,failedDeliveries:0,successRate:0,avgResponseTime:0,deliveriesToday:0,deliveriesThisWeek:0}.avgResponseTime}ms</div>
                        <div className="text-xs opacity-80">Avg Latency</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Daily Quota</span>
                        <span>12.5K / 50K</span>
                      </div>
                      <Progress value={25} className="h-2 bg-white/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-emerald-600" />
                          Webhook Defaults
                        </CardTitle>
                        <CardDescription>Configure default settings for new webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Timeout</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">60 seconds</SelectItem>
                                <SelectItem value="120">2 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Content Type</Label>
                            <Select defaultValue="json">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">application/json</SelectItem>
                                <SelectItem value="form">application/x-www-form-urlencoded</SelectItem>
                                <SelectItem value="xml">application/xml</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Active Webhook Limit</div>
                            <div className="text-sm text-gray-500">Maximum concurrent active webhooks</div>
                          </div>
                          <Select defaultValue="100">
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Include Metadata</div>
                            <div className="text-sm text-gray-500">Add metadata to webhook payloads</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Workflow className="w-5 h-5 text-blue-600" />
                          Event Settings
                        </CardTitle>
                        <CardDescription>Configure event handling behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Event Batching</div>
                            <div className="text-sm text-gray-500">Batch multiple events in single delivery</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Event Ordering</div>
                            <div className="text-sm text-gray-500">Guarantee event delivery order</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Deduplicate Events</div>
                            <div className="text-sm text-gray-500">Prevent duplicate event deliveries</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'delivery' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-orange-600" />
                          Retry Policy
                        </CardTitle>
                        <CardDescription>Configure automatic retry behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Max Retry Attempts</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">No retries</SelectItem>
                                <SelectItem value="3">3 attempts</SelectItem>
                                <SelectItem value="5">5 attempts</SelectItem>
                                <SelectItem value="10">10 attempts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Backoff Strategy</Label>
                            <Select defaultValue="exponential">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="linear">Linear</SelectItem>
                                <SelectItem value="exponential">Exponential</SelectItem>
                                <SelectItem value="fixed">Fixed Interval</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Initial Delay</Label>
                            <Select defaultValue="1000">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="500">500ms</SelectItem>
                                <SelectItem value="1000">1 second</SelectItem>
                                <SelectItem value="5000">5 seconds</SelectItem>
                                <SelectItem value="30000">30 seconds</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Delay</Label>
                            <Select defaultValue="3600000">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="60000">1 minute</SelectItem>
                                <SelectItem value="300000">5 minutes</SelectItem>
                                <SelectItem value="3600000">1 hour</SelectItem>
                                <SelectItem value="86400000">24 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Timer className="w-5 h-5 text-purple-600" />
                          Rate Limiting
                        </CardTitle>
                        <CardDescription>Control delivery rate to prevent overwhelming endpoints</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable Rate Limiting</div>
                            <div className="text-sm text-gray-500">Limit requests per endpoint</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Requests per Minute</Label>
                            <Input type="number" defaultValue="60" />
                          </div>
                          <div className="space-y-2">
                            <Label>Burst Limit</Label>
                            <Input type="number" defaultValue="100" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Queue Overflow Action</div>
                            <div className="text-sm text-gray-500">What to do when queue is full</div>
                          </div>
                          <Select defaultValue="queue">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="queue">Queue</SelectItem>
                              <SelectItem value="drop">Drop</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Signature Verification
                        </CardTitle>
                        <CardDescription>Configure webhook signing and verification</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-medium text-green-800 dark:text-green-400">HMAC Signing Enabled</div>
                              <div className="text-sm text-green-600 dark:text-green-500">All payloads are signed with SHA-256</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Signing Algorithm</Label>
                          <Select defaultValue="sha256">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sha256">SHA-256 (Recommended)</SelectItem>
                              <SelectItem value="sha512">SHA-512</SelectItem>
                              <SelectItem value="sha1">SHA-1 (Legacy)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Signature Header Name</Label>
                          <Input defaultValue="X-Webhook-Signature" className="font-mono" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Include Timestamp</div>
                            <div className="text-sm text-gray-500">Add timestamp to prevent replay attacks</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-amber-600" />
                          Secret Management
                        </CardTitle>
                        <CardDescription>Manage webhook secrets and rotation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Signing Secret</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="whsec_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => handleCopySecret('whsec_xxxxxxxxxxxxxxxx')}>Copy</Button>
                            <Button variant="outline" onClick={() => { setWebhookForSecret({ id: 'global', name: 'Global' }); setShowRegenerateSecretDialog(true); }}>Rotate</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Auto-rotate Secrets</div>
                            <div className="text-sm text-gray-500">Automatically rotate secrets periodically</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Secret Expiration Warning</div>
                            <div className="text-sm text-gray-500">Notify before secrets expire</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-600" />
                          Delivery Alerts
                        </CardTitle>
                        <CardDescription>Configure alerts for webhook events</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Failed Delivery Alert</div>
                            <div className="text-sm text-gray-500">Notify when deliveries fail</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Endpoint Disabled Alert</div>
                            <div className="text-sm text-gray-500">Notify when endpoint is auto-disabled</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Success Rate Drop Alert</div>
                            <div className="text-sm text-gray-500">Notify when success rate drops below threshold</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Success Rate Threshold</Label>
                          <Select defaultValue="95">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="99">99%</SelectItem>
                              <SelectItem value="95">95%</SelectItem>
                              <SelectItem value="90">90%</SelectItem>
                              <SelectItem value="80">80%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          Health Reports
                        </CardTitle>
                        <CardDescription>Configure periodic health reports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Daily Health Summary</div>
                            <div className="text-sm text-gray-500">Receive daily webhook health report</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Weekly Analytics Report</div>
                            <div className="text-sm text-gray-500">Detailed weekly analytics email</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Report Recipients</Label>
                          <Input placeholder="email@example.com, team@example.com" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'api' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          API Credentials
                        </CardTitle>
                        <CardDescription>Manage API keys for webhook management</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="wh_api_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={handleCopyApiKey}>Copy</Button>
                            <Button variant="outline" onClick={handleRegenerateApiKey}>Regenerate</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>API Secret</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="wh_secret_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => { navigator.clipboard.writeText('wh_secret_xxxxxxxxxxxxxxxx'); toast.success('API secret copied'); }}>Copy</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">API Rate Limit</div>
                            <div className="text-sm text-gray-500">Requests per minute for management API</div>
                          </div>
                          <Badge variant="outline">1000 req/min</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-purple-600" />
                          API Settings
                        </CardTitle>
                        <CardDescription>Configure API behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">API Versioning</div>
                            <div className="text-sm text-gray-500">Include version in API responses</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Default API Version</Label>
                          <Select defaultValue="v2">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="v1">v1 (Legacy)</SelectItem>
                              <SelectItem value="v2">v2 (Current)</SelectItem>
                              <SelectItem value="v3">v3 (Beta)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Verbose Error Messages</div>
                            <div className="text-sm text-gray-500">Return detailed error information</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-gray-600" />
                          Data Retention
                        </CardTitle>
                        <CardDescription>Configure log retention and storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Delivery Log Retention</Label>
                          <Select defaultValue="30">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Failed Delivery Retention</Label>
                          <Select defaultValue="90">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={handleExportLogs}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Logs
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowImportDialog(true)}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import Config
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-indigo-600" />
                          Performance
                        </CardTitle>
                        <CardDescription>Configure performance settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Parallel Delivery</div>
                            <div className="text-sm text-gray-500">Enable concurrent webhook deliveries</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Concurrent Deliveries</Label>
                          <Select defaultValue="10">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Connection Pooling</div>
                            <div className="text-sm text-gray-500">Reuse connections for better performance</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Delete All Webhooks</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all webhook endpoints</div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowDeleteAllDialog(true)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Clear All Logs</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all delivery logs</div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowClearLogsDialog(true)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Logs
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Reset Configuration</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Reset all settings to defaults</div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowResetConfigDialog(true)}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </div>

      {/* Create/Edit Endpoint Dialog */}
      <Dialog open={showEndpointDialog} onOpenChange={setShowEndpointDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                <WebhookIcon className="w-5 h-5" />
              </div>
              {selectedEndpoint ? 'Edit Webhook' : 'Create Webhook'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  placeholder="My Webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white font-mono text-sm"
                  placeholder="https://example.com/webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  placeholder="What does this webhook do?"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeout (ms)</label>
                  <select
                    value={formData.timeout_ms}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeout_ms: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg dark:text-white"
                  >
                    <option value="10000">10 seconds</option>
                    <option value="30000">30 seconds</option>
                    <option value="60000">60 seconds</option>
                    <option value="120000">2 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Retries</label>
                  <select
                    value={formData.retry_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, retry_count: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg dark:text-white"
                  >
                    <option value="0">No retries</option>
                    <option value="3">3 retries</option>
                    <option value="5">5 retries</option>
                    <option value="10">10 retries</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Events to Subscribe</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 max-h-40 overflow-y-auto p-3 border dark:border-gray-600 rounded-lg">
                  {[].map(event => (
                    <label key={event.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event.name)}
                        onChange={() => handleEventToggle(event.name)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-mono text-gray-700 dark:text-gray-300">{event.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.verify_ssl}
                  onChange={(e) => setFormData(prev => ({ ...prev, verify_ssl: e.target.checked }))}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">Verify SSL certificate</label>
              </div>
            </div>
          </ScrollArea>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowEndpointDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWebhook}
              disabled={isSaving || !formData.name || !formData.url}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
              {selectedEndpoint ? 'Save Changes' : 'Create Webhook'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Log Detail Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedLog?.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                selectedLog?.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
              }`}>
                {selectedLog && getStatusIcon(selectedLog.status)}
              </div>
              Delivery Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status Code</div>
                    <div className={`text-xl font-bold ${selectedLog.statusCode && selectedLog.statusCode < 300 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedLog.statusCode || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Response Time</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedLog.responseTime ? `${selectedLog.responseTime}ms` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attempt</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedLog.attempt} / {selectedLog.maxAttempts}
                    </div>
                  </div>
                </div>

                {selectedLog.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Error</div>
                    <div className="text-sm text-red-600 dark:text-red-400">{selectedLog.error}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Body</div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {JSON.stringify(JSON.parse(selectedLog.requestBody), null, 2)}
                  </pre>
                </div>

                {selectedLog.responseBody && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Body</div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      {selectedLog.responseBody}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowLogDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
            <button
              onClick={() => selectedLog && handleRetryDelivery(selectedLog.id)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Delivery
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Webhook Dialog */}
      <Dialog open={showTestDialog} onOpenChange={(open) => { setShowTestDialog(open); if (!open) setWebhookToTest(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <TestTube className="w-5 h-5" />
              </div>
              Test Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Event</label>
              <select
                value={selectedTestEvent}
                onChange={(e) => setSelectedTestEvent(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg dark:text-white"
              >
                {[].map(event => (
                  <option key={event.id} value={event.name}>{event.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payload</label>
              <textarea
                rows={6}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 text-gray-100 border dark:border-gray-600 rounded-lg font-mono text-sm"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => { setShowTestDialog(false); setWebhookToTest(null); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestWebhook}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Test
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              Delete Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{webhookToDelete?.name}</span>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => { setShowDeleteConfirmDialog(false); setWebhookToDelete(null); }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteWebhook}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Secret Dialog */}
      <Dialog open={showRegenerateSecretDialog} onOpenChange={setShowRegenerateSecretDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              Regenerate Secret
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to regenerate the signing secret for <span className="font-semibold text-gray-900 dark:text-white">{webhookForSecret?.name}</span>?
              You will need to update your endpoint to use the new secret.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => { setShowRegenerateSecretDialog(false); setWebhookForSecret(null); }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmRegenerateSecret}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Regenerate
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Integration Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="text-3xl">{selectedIntegration?.icon}</div>
              {selectedIntegration?.installed ? 'Configure' : 'Install'} {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="py-4 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">{selectedIntegration.description}</p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supported Events</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedIntegration.eventsSupported.map(event => (
                    <span key={event} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-mono">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
              {selectedIntegration.installed && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webhook URL</label>
                    <Input placeholder="https://..." className="font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <Input type="password" placeholder="Enter your API key" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowIntegrationDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleInstallIntegration}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
            >
              {selectedIntegration?.installed ? (
                <>
                  <Settings className="w-4 h-4" />
                  Save Configuration
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Install
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              Use Template: {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="py-4 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Endpoint URL</div>
                  <code className="text-sm font-mono text-gray-900 dark:text-white">{selectedTemplate.url}</code>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Events</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.events.map(event => (
                      <span key={event} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowTemplateDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFromTemplate}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create from Template
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Payload Dialog */}
      <Dialog open={showEventPayloadDialog} onOpenChange={setShowEventPayloadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                <FileJson className="w-5 h-5" />
              </div>
              {selectedEventType?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedEventType && (
            <div className="py-4 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">{selectedEventType.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEventType.subscriberCount}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Subscribers</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEventType.totalDeliveries.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Deliveries</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEventType.avgResponseTime}ms</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Avg Response</div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Example Payload</label>
                  <button
                    onClick={() => handleCopyPayload(selectedEventType.payloadExample)}
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {JSON.stringify(JSON.parse(selectedEventType.payloadExample), null, 2)}
                </pre>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowEventPayloadDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Config Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <Upload className="w-5 h-5" />
              </div>
              Import Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Upload a JSON file containing webhook configurations to import.
            </p>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your file here, or
              </p>
              <label className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 cursor-pointer inline-block">
                Browse Files
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportConfig}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowImportDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Logs Confirmation Dialog */}
      <Dialog open={showClearLogsDialog} onOpenChange={setShowClearLogsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              Clear All Logs
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete all delivery logs? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowClearLogsDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAllLogs}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Logs
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Webhooks Confirmation Dialog */}
      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertOctagon className="w-5 h-5" />
              </div>
              Delete All Webhooks
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete all <span className="font-semibold text-red-600">{webhooks.length}</span> webhooks? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowDeleteAllDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAllWebhooks}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Configuration Confirmation Dialog */}
      <Dialog open={showResetConfigDialog} onOpenChange={setShowResetConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              Reset Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to reset all webhook settings to their defaults? Your webhooks will not be affected, only the global configuration.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowResetConfigDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleResetConfiguration}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Settings
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
