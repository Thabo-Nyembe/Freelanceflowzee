'use client'
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


export const dynamic = 'force-dynamic';

/**
 * World-Class White Label System
 * Complete implementation of branding and customization features
 */

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Palette, Type, Image, Globe, Code, Eye, Download,
  Settings, Sparkles, CheckCircle, AlertCircle, Copy, Upload, RefreshCw, Save, Star, Crown, Shield, Zap, Info, Award,
  Plus, X, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  WhiteLabelConfig,
  BrandingPreset,
  ColorScheme
} from '@/lib/white-label-types'
import {
  BRANDING_PRESETS,
  WHITE_LABEL_TEMPLATES,
  MOCK_WHITE_LABEL_CONFIG,
  MOCK_DOMAIN_VERIFICATION,
  FONT_OPTIONS,
  DEFAULT_LIGHT_COLORS,
  DEFAULT_DARK_COLORS,
  calculateBrandingScore,
  formatDomainStatus,
  generateBrandingExportCss
} from '@/lib/white-label-utils'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

type ViewMode = 'overview' | 'branding' | 'domain' | 'templates' | 'export'

// New item type for white label configurations
interface WhiteLabelItem {
  id: string
  name: string
  type: 'color-scheme' | 'font-set' | 'logo-pack' | 'template'
  description: string
  createdAt: string
}


// ============================================================================
// V2 COMPETITIVE MOCK DATA - WhiteLabel Context
// ============================================================================

const whiteLabelAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const whiteLabelCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const whiteLabelPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const whiteLabelActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function WhiteLabelClient() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [config, setConfig] = useState<WhiteLabelConfig>(MOCK_WHITE_LABEL_CONFIG)
  const [selectedPreset, setSelectedPreset] = useState<BrandingPreset | null>(null)
  const [customDomain, setCustomDomain] = useState(config.customDomain?.domain || '')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Dialog states for quick actions
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showUploadLogoDialog, setShowUploadLogoDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showCustomizeBrandingDialog, setShowCustomizeBrandingDialog] = useState(false)
  const [showApplyTemplateDialog, setShowApplyTemplateDialog] = useState(false)
  const [selectedTemplateForApply, setSelectedTemplateForApply] = useState<typeof WHITE_LABEL_TEMPLATES[0] | null>(null)
  const [currentLogoType, setCurrentLogoType] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false)

  // Form states for dialogs
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    type: 'color-scheme' as WhiteLabelItem['type'],
    description: ''
  })
  const [exportFormat, setExportFormat] = useState<'css' | 'json' | 'scss' | 'all'>('css')
  const [settingsForm, setSettingsForm] = useState({
    autoSave: true,
    showPreview: true,
    enableAnimations: true,
    defaultTheme: 'dark' as 'light' | 'dark'
  })

  // Items list
  const [whiteLabelItems, setWhiteLabelItems] = useState<WhiteLabelItem[]>([
    { id: '1', name: 'Corporate Blue', type: 'color-scheme', description: 'Professional blue color palette', createdAt: '2024-01-15' },
    { id: '2', name: 'Modern Sans', type: 'font-set', description: 'Clean sans-serif font collection', createdAt: '2024-01-10' },
    { id: '3', name: 'Brand Assets v2', type: 'logo-pack', description: 'Updated logo and icon set', createdAt: '2024-01-08' }
  ])

  // Handlers for dialogs
  const handleCreateNewItem = () => {
    if (!newItemForm.name.trim()) {
      toast.error('Validation Error', { description: 'Please enter an item name' })
      return
    }

    const newItem: WhiteLabelItem = {
      id: Date.now().toString(),
      name: newItemForm.name,
      type: newItemForm.type,
      description: newItemForm.description,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setWhiteLabelItems(prev => [newItem, ...prev])
    setNewItemForm({ name: '', type: 'color-scheme', description: '' })
    setShowNewItemDialog(false)
    toast.success('Item Created', { description: `${newItem.name} has been created successfully` })
    announce(`Created new ${newItem.type}: ${newItem.name}`, 'polite')
  }

  const handleExportBranding = async () => {
    setShowExportDialog(false)

    const exportPromise = new Promise((resolve) => {
      setTimeout(() => {
        const exportData = {
          format: exportFormat,
          config: config,
          timestamp: new Date().toISOString()
        }

        // Simulate file download
        const blob = new Blob([
          exportFormat === 'json'
            ? JSON.stringify(exportData, null, 2)
            : generateBrandingExportCss(config)
        ], { type: 'text/plain' })

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `branding-export.${exportFormat === 'all' ? 'zip' : exportFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        resolve(exportData)
      }, 1500)
    })

    toast.promise(exportPromise, {
      loading: `Exporting branding as ${exportFormat.toUpperCase()}...`,
      success: `Branding exported successfully as ${exportFormat.toUpperCase()}`,
      error: 'Failed to export branding'
    })

    announce(`Branding exported as ${exportFormat}`, 'polite')
  }

  const handleSaveSettings = () => {
    setShowSettingsDialog(false)
    toast.success('Settings Saved', { description: 'White-label settings have been updated' })
    announce('White-label settings saved', 'polite')
  }

  // Handle Reset Colors to defaults
  const handleResetColors = () => {
    setConfig(prev => ({
      ...prev,
      colors: {
        light: DEFAULT_LIGHT_COLORS,
        dark: DEFAULT_DARK_COLORS
      }
    }))
    setSelectedPreset(null)
    toast.success('Colors Reset', { description: 'Color scheme has been reset to defaults' })
    announce('Color scheme reset to defaults', 'polite')
  }

  // Handle Logo Upload
  const handleUploadLogo = (logoType: string) => {
    setCurrentLogoType(logoType)
    setShowUploadLogoDialog(true)
  }

  const handleLogoUploadSubmit = () => {
    setShowUploadLogoDialog(false)

    const uploadPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, logoType: currentLogoType })
      }, 1500)
    })

    toast.promise(uploadPromise, {
      loading: `Uploading ${currentLogoType} logo...`,
      success: `${currentLogoType} logo uploaded successfully`,
      error: 'Failed to upload logo'
    })

    announce(`${currentLogoType} logo uploaded`, 'polite')
  }

  // Handle Verify Domain
  const handleVerifyDomain = async () => {
    if (!customDomain.trim()) {
      toast.error('Validation Error', { description: 'Please enter a domain name' })
      return
    }

    setIsVerifyingDomain(true)

    const verifyPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate domain verification
        if (customDomain.includes('.')) {
          setConfig(prev => ({
            ...prev,
            customDomain: {
              domain: customDomain,
              isVerified: false,
              sslEnabled: false,
              verificationToken: 'kazi-verify-' + Date.now()
            }
          }))
          resolve({ domain: customDomain })
        } else {
          reject(new Error('Invalid domain format'))
        }
      }, 2000)
    })

    toast.promise(verifyPromise, {
      loading: 'Verifying domain...',
      success: `Domain ${customDomain} verification initiated. Please add the DNS records.`,
      error: 'Failed to verify domain. Please check the format.'
    })

    try {
      await verifyPromise
    } finally {
      setIsVerifyingDomain(false)
    }

    announce(`Domain verification initiated for ${customDomain}`, 'polite')
  }

  // Handle Copy DNS Record
  const handleCopyDnsRecord = (value: string) => {
    navigator.clipboard.writeText(value)
    toast.success('Copied!', { description: 'DNS record value copied to clipboard' })
    announce('DNS record copied to clipboard', 'polite')
  }

  // Handle Apply Template
  const handleOpenApplyTemplate = (template: typeof WHITE_LABEL_TEMPLATES[0]) => {
    setSelectedTemplateForApply(template)
    setShowApplyTemplateDialog(true)
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplateForApply) return

    setShowApplyTemplateDialog(false)

    const applyPromise = new Promise((resolve) => {
      setTimeout(() => {
        // Apply template settings
        setConfig(prev => ({
          ...prev,
          brandName: selectedTemplateForApply.name,
          displayName: selectedTemplateForApply.name,
          description: selectedTemplateForApply.description
        }))
        resolve({ template: selectedTemplateForApply.name })
      }, 1500)
    })

    toast.promise(applyPromise, {
      loading: `Applying ${selectedTemplateForApply.name} template...`,
      success: `${selectedTemplateForApply.name} template applied successfully`,
      error: 'Failed to apply template'
    })

    announce(`Applied ${selectedTemplateForApply.name} template`, 'polite')
  }

  // Handle Export (for individual format buttons in export view)
  const handleExportFormat = (format: 'css' | 'json' | 'scss' | 'assets') => {
    const exportPromise = new Promise((resolve) => {
      setTimeout(() => {
        let content = ''
        let filename = ''
        let mimeType = 'text/plain'

        switch (format) {
          case 'css':
            content = generateBrandingExportCss(config)
            filename = 'branding-variables.css'
            break
          case 'json':
            content = JSON.stringify(config, null, 2)
            filename = 'branding-config.json'
            mimeType = 'application/json'
            break
          case 'scss':
            content = generateBrandingExportCss(config).replace(/--/g, '$').replace(/:/g, ':').replace(/;/g, ';')
            filename = 'branding-variables.scss'
            break
          case 'assets':
            content = JSON.stringify({
              assets: ['logo-light.png', 'logo-dark.png', 'favicon.ico', 'icon.png'],
              exportDate: new Date().toISOString()
            }, null, 2)
            filename = 'assets-manifest.json'
            break
        }

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        resolve({ format, filename })
      }, 1000)
    })

    toast.promise(exportPromise, {
      loading: `Exporting ${format.toUpperCase()}...`,
      success: `${format.toUpperCase()} exported successfully`,
      error: `Failed to export ${format.toUpperCase()}`
    })

    announce(`Exported branding as ${format}`, 'polite')
  }

  // Handle Copy CSS
  const handleCopyCss = () => {
    const css = generateBrandingExportCss(config)
    navigator.clipboard.writeText(css)
    toast.success('Copied!', { description: 'CSS variables copied to clipboard' })
    announce('CSS variables copied to clipboard', 'polite')
  }

  // Handle Preview
  const handlePreview = () => {
    setShowPreviewDialog(true)
  }

  // Handle Save Changes
  const handleSaveChanges = async () => {
    setIsSaving(true)

    const savePromise = new Promise((resolve) => {
      setTimeout(() => {
        // Simulate saving to backend
        resolve({ success: true, timestamp: new Date().toISOString() })
      }, 2000)
    })

    toast.promise(savePromise, {
      loading: 'Saving white-label configuration...',
      success: 'All changes saved successfully!',
      error: 'Failed to save changes. Please try again.'
    })

    try {
      await savePromise
      setConfig(prev => ({ ...prev, updatedAt: new Date().toISOString() }))
    } finally {
      setIsSaving(false)
    }

    announce('White-label configuration saved', 'polite')
  }

  // Quick actions with real dialog functionality
  const whiteLabelQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewItemDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  // A+++ LOAD WHITE LABEL DATA
  useEffect(() => {
    const loadWhiteLabelData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load white label configuration'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('White label configuration loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load white label configuration')
        setIsLoading(false)
        announce('Error loading white label configuration', 'assertive')
      }
    }

    loadWhiteLabelData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const brandingScore = calculateBrandingScore(config)
  const domainStatus = config.customDomain ? formatDomainStatus(MOCK_DOMAIN_VERIFICATION.status) : null

  const handleColorChange = (key: keyof ColorScheme, value: string, theme: 'light' | 'dark') => {
    setConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [theme]: {
          ...prev.colors[theme],
          [key]: value
        }
      }
    }))
  }

  const applyPreset = (preset: BrandingPreset) => {
    setConfig(prev => ({
      ...prev,
      colors: {
        light: { ...DEFAULT_LIGHT_COLORS, ...preset.colors.light },
        dark: { ...DEFAULT_DARK_COLORS, ...preset.colors.dark }
      },
      typography: {
        ...prev.typography,
        fontFamily: preset.typography.fontFamily,
        headingFontFamily: preset.typography.headingFontFamily || preset.typography.fontFamily
      }
    }))
    setSelectedPreset(preset)
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={whiteLabelAIInsights} />
          <PredictiveAnalytics predictions={whiteLabelPredictions} />
          <CollaborationIndicator collaborators={whiteLabelCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={whiteLabelQuickActions} />
          <ActivityFeed activities={whiteLabelActivities} />
        </div>
<div className="max-w-7xl mx-auto space-y-6">
            <CardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <ListSkeleton items={5} />
          </div>
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-pink-500/30 to-rose-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal variant="slide-up" duration={0.6}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm font-medium mb-6 border border-purple-500/30"
              >
                <Crown className="w-4 h-4" />
                White Label
                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enterprise
                </Badge>
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                Your Brand, Your Platform
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Complete white-label customization - Rebrand the entire platform with your logo, colors, and domain
              </p>
            </div>
          </ScrollReveal>

          {/* Branding Score Card */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.1}>
            <LiquidGlassCard className="p-6 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Award className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{brandingScore.score}/100</h3>
                    <p className="text-sm text-gray-400">Branding Completeness Score</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {config.isActive ? (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                      Inactive
                    </Badge>
                  )}
                  {config.customDomain?.isVerified && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Domain Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
                {Object.entries(brandingScore.breakdown).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-white">{value}</div>
                    <div className="text-xs text-gray-400 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          {/* View Mode Tabs */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.2}>
            <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
              {[
                { id: 'overview' as ViewMode, label: 'Overview', icon: Eye },
                { id: 'branding' as ViewMode, label: 'Branding', icon: Palette },
                { id: 'domain' as ViewMode, label: 'Domain', icon: Globe },
                { id: 'templates' as ViewMode, label: 'Templates', icon: Star },
                { id: 'export' as ViewMode, label: 'Export', icon: Download }
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant={viewMode === mode.id ? "default" : "outline"}
                  onClick={() => setViewMode(mode.id)}
                  className={viewMode === mode.id ? "bg-gradient-to-r from-purple-600 to-pink-600" : "border-gray-700 hover:bg-slate-800"}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </ScrollReveal>

          {/* Overview View */}
          {viewMode === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Brand Info */}
                <LiquidGlassCard className="p-6 md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">Brand Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Brand Name</label>
                      <Input
                        value={config.brandName}
                        onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                        className="bg-slate-900/50 border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Display Name</label>
                      <Input
                        value={config.displayName}
                        onChange={(e) => setConfig({ ...config, displayName: e.target.value })}
                        className="bg-slate-900/50 border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Tagline</label>
                      <Input
                        value={config.tagline || ''}
                        onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                        placeholder="Your brand tagline..."
                        className="bg-slate-900/50 border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
                      <Textarea
                        value={config.description || ''}
                        onChange={(e) => setConfig({ ...config, description: e.target.value })}
                        placeholder="Describe your brand..."
                        className="bg-slate-900/50 border-gray-700"
                        rows={3}
                      />
                    </div>
                  </div>
                </LiquidGlassCard>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <LiquidGlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">Custom Domain</h3>
                    </div>
                    <p className="text-2xl font-bold text-white mb-2">
                      {config.customDomain?.domain || 'Not set'}
                    </p>
                    {domainStatus && (
                      <Badge className={`bg-${domainStatus.color}-500/20 text-${domainStatus.color}-300 border-${domainStatus.color}-500/30`}>
                        {domainStatus.label}
                      </Badge>
                    )}
                  </LiquidGlassCard>

                  <LiquidGlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-white">Primary Color</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-700"
                        style={{ backgroundColor: config.colors.light.primary }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Light Theme</p>
                        <p className="font-mono text-xs text-white">{config.colors.light.primary}</p>
                      </div>
                    </div>
                  </LiquidGlassCard>
                </div>
              </div>

              {/* Features Toggle */}
              <LiquidGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Platform Features</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Hide KAZI Branding</p>
                      <p className="text-sm text-gray-400">Remove all KAZI branding from the platform</p>
                    </div>
                    <Switch
                      checked={config.features.hideKaziBranding}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, features: { ...config.features, hideKaziBranding: checked } })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Show "Powered By"</p>
                      <p className="text-sm text-gray-400">Display powered by attribution</p>
                    </div>
                    <Switch
                      checked={config.features.showPoweredBy}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, features: { ...config.features, showPoweredBy: checked } })
                      }
                    />
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          )}

          {/* Branding View */}
          {viewMode === 'branding' && (
            <div className="space-y-6">
              {/* Color Presets */}
              <LiquidGlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">Color Presets</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 hover:bg-slate-800"
                    onClick={handleResetColors}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {BRANDING_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedPreset?.id === preset.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-slate-900/50'
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: preset.colors.light.primary }} />
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: preset.colors.light.secondary }} />
                      </div>
                      <p className="text-sm font-medium text-white">{preset.name}</p>
                      <p className="text-xs text-gray-400">{preset.category}</p>
                    </motion.button>
                  ))}
                </div>
              </LiquidGlassCard>

              {/* Custom Colors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Light Theme */}
                <LiquidGlassCard className="p-6">
                  <h3 className="font-semibold text-white mb-4">Light Theme Colors</h3>
                  <div className="space-y-4">
                    {Object.entries(config.colors.light).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value, 'light')}
                          className="w-12 h-12 rounded border-2 border-gray-700 cursor-pointer"
                        />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-white capitalize block">{key}</label>
                          <Input
                            value={value}
                            onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value, 'light')}
                            className="bg-slate-900/50 border-gray-700 font-mono text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </LiquidGlassCard>

                {/* Dark Theme */}
                <LiquidGlassCard className="p-6">
                  <h3 className="font-semibold text-white mb-4">Dark Theme Colors</h3>
                  <div className="space-y-4">
                    {Object.entries(config.colors.dark).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value, 'dark')}
                          className="w-12 h-12 rounded border-2 border-gray-700 cursor-pointer"
                        />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-white capitalize block">{key}</label>
                          <Input
                            value={value}
                            onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value, 'dark')}
                            className="bg-slate-900/50 border-gray-700 font-mono text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </LiquidGlassCard>
              </div>

              {/* Typography */}
              <LiquidGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Type className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Typography</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Body Font</label>
                    <select
                      value={config.typography.fontFamily}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          typography: { ...config.typography, fontFamily: e.target.value as any }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.name} - {font.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Heading Font</label>
                    <select
                      value={config.typography.headingFontFamily}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          typography: { ...config.typography, headingFontFamily: e.target.value as any }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.name} - {font.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Logo Upload */}
              <LiquidGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Image className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Logo & Assets</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'light', label: 'Logo (Light Theme)', desc: 'For dark backgrounds' },
                    { key: 'dark', label: 'Logo (Dark Theme)', desc: 'For light backgrounds' },
                    { key: 'favicon', label: 'Favicon', desc: '32x32 or 64x64 PNG' },
                    { key: 'iconOnly', label: 'Icon Only', desc: 'Square logo without text' }
                  ].map((asset) => (
                    <div key={asset.key} className="p-4 bg-slate-900/50 rounded-lg border border-gray-700">
                      <p className="font-medium text-white mb-1">{asset.label}</p>
                      <p className="text-xs text-gray-400 mb-3">{asset.desc}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-700 hover:bg-slate-800"
                        onClick={() => handleUploadLogo(asset.label)}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>
            </div>
          )}

          {/* Domain View */}
          {viewMode === 'domain' && (
            <div className="space-y-6">
              <LiquidGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Custom Domain Setup</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Your Custom Domain</label>
                    <div className="flex gap-2">
                      <Input
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="studio.yourdomain.com"
                        className="flex-1 bg-slate-900/50 border-gray-700"
                      />
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                        onClick={handleVerifyDomain}
                        disabled={isVerifyingDomain}
                      >
                        {isVerifyingDomain ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify Domain'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Enter the custom domain you want to use for your white-labeled platform
                    </p>
                  </div>

                  {/* DNS Records */}
                  {MOCK_DOMAIN_VERIFICATION.status !== 'pending' && (
                    <div>
                      <h4 className="font-medium text-white mb-4">DNS Configuration</h4>
                      <div className="space-y-3">
                        {MOCK_DOMAIN_VERIFICATION.records.map((record, index) => (
                          <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-gray-700">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Badge variant="secondary" className="mb-2">{record.type}</Badge>
                                <p className="text-sm font-mono text-white">{record.name}</p>
                              </div>
                              <Badge
                                className={
                                  record.status === 'verified'
                                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                }
                              >
                                {record.status === 'verified' ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Pending
                                  </>
                                )}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 px-3 py-2 bg-slate-950 rounded text-xs text-gray-300 font-mono overflow-x-auto">
                                {record.value}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyDnsRecord(record.value)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </LiquidGlassCard>

              {/* SSL Certificate */}
              <LiquidGlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold text-white">SSL Certificate</h3>
                  </div>
                  {config.customDomain?.sslEnabled && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {config.customDomain?.sslEnabled
                    ? 'Your custom domain is secured with a free SSL certificate'
                    : 'SSL certificate will be automatically provisioned after domain verification'}
                </p>
              </LiquidGlassCard>
            </div>
          )}

          {/* Templates View */}
          {viewMode === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHITE_LABEL_TEMPLATES.map((template) => (
                <motion.div key={template.id} whileHover={{ scale: 1.02 }}>
                  <LiquidGlassCard className="p-6 h-full">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                          <Badge variant="secondary" className="text-xs">{template.industry}</Badge>
                        </div>
                        {template.isPopular && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-400">{template.description}</p>

                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                          onClick={() => handleOpenApplyTemplate(template)}
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Apply Template
                        </Button>
                      </div>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Export View */}
          {viewMode === 'export' && (
            <div className="space-y-6">
              <LiquidGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Download className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Export Branding</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { format: 'css', label: 'CSS', desc: 'CSS Variables', icon: Code },
                    { format: 'json', label: 'JSON', desc: 'Theme Configuration', icon: Code },
                    { format: 'scss', label: 'SCSS', desc: 'Sass Variables', icon: Code },
                    { format: 'assets', label: 'Assets', desc: 'Logo & Images', icon: Image }
                  ].map((exportType) => (
                    <div
                      key={exportType.format}
                      className="p-4 bg-slate-900/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                    >
                      <exportType.icon className="w-8 h-8 text-purple-400 mb-2" />
                      <p className="font-medium text-white mb-1">{exportType.label}</p>
                      <p className="text-xs text-gray-400 mb-3">{exportType.desc}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-700 hover:bg-slate-800"
                        onClick={() => handleExportFormat(exportType.format as 'css' | 'json' | 'scss' | 'assets')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>

              {/* Code Preview */}
              <LiquidGlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">CSS Export Preview</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 hover:bg-slate-800"
                    onClick={handleCopyCss}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>

                <pre className="p-4 bg-slate-950 rounded-lg border border-gray-700 overflow-x-auto text-xs text-gray-300 font-mono">
                  {generateBrandingExportCss(config)}
                </pre>
              </LiquidGlassCard>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              className="border-gray-700 hover:bg-slate-800"
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* New Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Plus className="w-5 h-5 text-purple-400" />
              Create New White Label Item
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new color scheme, font set, logo pack, or template to your white label configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-gray-300">Item Name</Label>
              <Input
                id="item-name"
                value={newItemForm.name}
                onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                placeholder="Enter item name..."
                className="bg-slate-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-type" className="text-gray-300">Item Type</Label>
              <Select
                value={newItemForm.type}
                onValueChange={(value: WhiteLabelItem['type']) =>
                  setNewItemForm({ ...newItemForm, type: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="color-scheme">Color Scheme</SelectItem>
                  <SelectItem value="font-set">Font Set</SelectItem>
                  <SelectItem value="logo-pack">Logo Pack</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-description" className="text-gray-300">Description</Label>
              <Textarea
                id="item-description"
                value={newItemForm.description}
                onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                placeholder="Describe this item..."
                className="bg-slate-800 border-gray-700 text-white"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewItemDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewItem}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Download className="w-5 h-5 text-purple-400" />
              Export Branding Configuration
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose an export format for your white label branding settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Export Format</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'css', label: 'CSS Variables', icon: Code, desc: 'CSS custom properties' },
                  { value: 'json', label: 'JSON', icon: FileText, desc: 'Theme configuration' },
                  { value: 'scss', label: 'SCSS', icon: Code, desc: 'Sass variables' },
                  { value: 'all', label: 'All Formats', icon: Download, desc: 'Complete package' }
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value as typeof exportFormat)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      exportFormat === format.value
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-slate-800'
                    }`}
                  >
                    <format.icon className="w-5 h-5 text-purple-400 mb-1" />
                    <p className="text-sm font-medium text-white">{format.label}</p>
                    <p className="text-xs text-gray-400">{format.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-300 mb-2">Export will include:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Color schemes (light & dark)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Typography settings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Brand configuration
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportBranding}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Settings className="w-5 h-5 text-purple-400" />
              White Label Settings
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure your white label preferences and behavior settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Auto-save Changes</p>
                <p className="text-xs text-gray-400">Automatically save branding changes</p>
              </div>
              <Switch
                checked={settingsForm.autoSave}
                onCheckedChange={(checked) =>
                  setSettingsForm({ ...settingsForm, autoSave: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Live Preview</p>
                <p className="text-xs text-gray-400">Show real-time preview of changes</p>
              </div>
              <Switch
                checked={settingsForm.showPreview}
                onCheckedChange={(checked) =>
                  setSettingsForm({ ...settingsForm, showPreview: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Enable Animations</p>
                <p className="text-xs text-gray-400">Use smooth transitions and effects</p>
              </div>
              <Switch
                checked={settingsForm.enableAnimations}
                onCheckedChange={(checked) =>
                  setSettingsForm({ ...settingsForm, enableAnimations: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Default Theme</Label>
              <Select
                value={settingsForm.defaultTheme}
                onValueChange={(value: 'light' | 'dark') =>
                  setSettingsForm({ ...settingsForm, defaultTheme: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select default theme" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="light">Light Theme</SelectItem>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Logo Dialog */}
      <Dialog open={showUploadLogoDialog} onOpenChange={setShowUploadLogoDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Upload className="w-5 h-5 text-purple-400" />
              Upload {currentLogoType}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload your logo file. Supported formats: PNG, SVG, JPG (max 5MB).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-sm text-gray-300 mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">PNG, SVG, or JPG up to 5MB</p>
              <input
                type="file"
                accept=".png,.svg,.jpg,.jpeg"
                className="hidden"
                id="logo-upload"
                onChange={() => {
                  toast.info('File selected', { description: 'Ready to upload' })
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-gray-700 hover:bg-slate-800"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                Browse Files
              </Button>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-300 mb-2">Recommended specifications:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Minimum resolution: 200x200 pixels
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Transparent background (PNG/SVG)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Square aspect ratio for icons
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadLogoDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogoUploadSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[800px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Eye className="w-5 h-5 text-purple-400" />
              Brand Preview
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Preview how your white-label branding will appear to users.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Preview Container */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Mock Header */}
              <div
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: config.colors.dark.primary }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {config.brandName.charAt(0)}
                    </span>
                  </div>
                  <span className="font-semibold text-white">{config.displayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full" />
                </div>
              </div>

              {/* Mock Content */}
              <div className="p-6 bg-slate-950">
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: config.colors.dark.primary }}
                >
                  Welcome to {config.brandName}
                </h2>
                <p className="text-gray-400 mb-4">{config.tagline || 'Your platform tagline'}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: config.colors.dark.primary + '20' }}
                  >
                    <p className="text-sm font-medium text-white mb-1">Primary Color</p>
                    <p className="text-xs text-gray-400">{config.colors.dark.primary}</p>
                  </div>
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: config.colors.dark.secondary + '20' }}
                  >
                    <p className="text-sm font-medium text-white mb-1">Secondary Color</p>
                    <p className="text-xs text-gray-400">{config.colors.dark.secondary}</p>
                  </div>
                </div>

                <Button
                  className="mt-4"
                  style={{ backgroundColor: config.colors.dark.primary }}
                >
                  Sample Button
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-sm text-gray-300">Preview Mode</span>
              <div className="flex gap-2">
                <Badge variant="secondary">Desktop</Badge>
                <Badge variant="secondary">Dark Theme</Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Close Preview
            </Button>
            <Button
              onClick={() => {
                setShowPreviewDialog(false)
                handleSaveChanges()
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={showApplyTemplateDialog} onOpenChange={setShowApplyTemplateDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-purple-400" />
              Apply Template
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This will apply the selected template to your white-label configuration.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplateForApply && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-800 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{selectedTemplateForApply.name}</h4>
                    <Badge variant="secondary" className="mt-1">
                      {selectedTemplateForApply.industry}
                    </Badge>
                  </div>
                  {selectedTemplateForApply.isPopular && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3">{selectedTemplateForApply.description}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplateForApply.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-gray-600">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">Warning</p>
                    <p className="text-xs text-amber-200/70">
                      Applying this template will override your current brand name and description settings.
                      Your color scheme and other customizations will be preserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApplyTemplateDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyTemplate}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
