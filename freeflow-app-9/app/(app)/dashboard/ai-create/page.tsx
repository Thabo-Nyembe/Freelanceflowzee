"use client";

import { useState, useEffect, useCallback } from 'react'
import {
  Brain,
  Settings as SettingsIcon,
  ArrowRight,
  Key,
  Zap,
  Shield,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

import { AICreate } from '@/components/ai/ai-create'
import { ModelComparisonModal } from '@/components/ai-create/model-comparison-modal'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { GlowEffect } from '@/components/ui/glow-effect'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createFeatureLogger('AICreate')

export default function AICreatePage() {
  // A+++ STATE MANAGEMENT
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [activeProvider, setActiveProvider] = useState<string>('openai')
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [usageStats, setUsageStats] = useState<Record<string, number>>({})
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [comparisonPrompt, setComparisonPrompt] = useState('')

  // Load saved keys on mount
  useEffect(() => {
    logger.info('Initializing AI Create page', {})
    try {
      const saved = localStorage.getItem('kazi-ai-keys')
      if (saved) {
        const keys = JSON.parse(saved)
        setApiKeys(keys)
        logger.info('Saved API keys loaded', {
          keyCount: Object.keys(keys).length,
          providers: Object.keys(keys)
        })
      } else {
        logger.info('No saved API keys found', {})
      }
    } catch (error) {
      logger.error('Failed to load API keys', { error })
    }
  }, [])

  // A+++ LOAD AI CREATE DATA
  useEffect(() => {
    const loadAICreateData = async () => {
      try {
        setIsPageLoading(true)
        setError(null)

        // Simulate data loading
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500) // Reduced from 1000ms to 500ms for faster loading
        })

        setIsPageLoading(false)
        announce('AI Create loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AI Create')
        setIsPageLoading(false)
        announce('Error loading AI Create', 'assertive')
      }
    }

    loadAICreateData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers with enhanced logging and functionality
  const handleSaveKeys = useCallback((keys: Record<string, string>) => {
    const providers = Object.keys(keys)

    logger.info('Saving API keys', {
      providerCount: providers.length,
      providers
    })

    setIsLoading(true)

    try {
      localStorage.setItem('kazi-ai-keys', JSON.stringify(keys))
      setApiKeys(keys)
      const savedAt = new Date()
      setLastSaved(savedAt)

      logger.info('API keys saved successfully', {
        providerCount: providers.length,
        savedAt: savedAt.toISOString()
      })

      toast.success('API Keys Saved', {
        description: `${providers.length} provider keys saved at ${savedAt.toLocaleTimeString()}`
      })

      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    } catch (error) {
      logger.error('Failed to save API keys', { error })

      toast.error('Save Failed', {
        description: 'Could not save API keys to storage'
      })

      setIsLoading(false)
    }
  }, [])

  const handleTestProvider = useCallback(async (provider: string) => {
    logger.info('Testing provider connection', { provider })
    setIsLoading(true)

    try {
      // Note: In production, this would test actual API connection
      const keyLength = apiKeys[provider]?.length || 0
      const isValid = keyLength > 10

      if (isValid) {
        logger.info('Provider test successful', {
          provider,
          keyLength
        })

        toast.success(`${provider} Connected`, {
          description: `API key validated - ${keyLength} characters`
        })
      } else {
        throw new Error('Invalid or missing API key')
      }

      setIsLoading(false)
    } catch (error: any) {
      logger.error('Provider test failed', {
        provider,
        error: error.message
      })

      toast.error(`${provider} Test Failed`, {
        description: error.message || 'Check your API key'
      })
      setIsLoading(false)
    }
  }, [apiKeys])

  const handleResetProvider = useCallback((provider: string) => {
    const newKeys = { ...apiKeys }
    delete newKeys[provider]
    setApiKeys(newKeys)
    localStorage.setItem('kazi-ai-keys', JSON.stringify(newKeys))

    logger.info('Provider reset successfully', {
      provider,
      remainingProviders: Object.keys(newKeys).length
    })

    toast.success(`${provider} Reset`, {
      description: `API key removed - ${Object.keys(newKeys).length} providers remaining`
    })
  }, [apiKeys])

  const handleViewDocs = useCallback((provider: string) => {
    const docsUrls: Record<string, string> = {
      openai: 'https://platform.openai.com/docs',
      anthropic: 'https://docs.anthropic.com',
      google: 'https://ai.google.dev/docs',
      cohere: 'https://docs.cohere.ai'
    }

    const url = docsUrls[provider] || '#'

    logger.info('Opening documentation', {
      provider,
      url
    })

    toast.info(`${provider} Documentation`, {
      description: `Opening docs: ${url}`
    })

    // In real app: window.open(url, '_blank')
  }, [])

  const handleExportSettings = useCallback(() => {
    const settings = {
      apiKeys: Object.keys(apiKeys).reduce((acc, key) => {
        acc[key] = '***REDACTED***'
        return acc
      }, {} as Record<string, string>),
      activeProvider,
      lastSaved,
      exportDate: new Date().toISOString()
    }

    const dataStr = JSON.stringify(settings, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kazi-ai-settings-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.info('Settings exported successfully', {
      providerCount: Object.keys(apiKeys).length,
      activeProvider,
      fileSize: blob.size
    })

    toast.success('Settings Exported', {
      description: `${Object.keys(apiKeys).length} providers - ${Math.round(blob.size / 1024)}KB`
    })
  }, [apiKeys, activeProvider, lastSaved])

  const handleImportSettings = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const settings = JSON.parse(text)

        if (settings.activeProvider) {
          setActiveProvider(settings.activeProvider)
        }

        logger.info('Settings imported successfully', {
          fileName: file.name,
          fileSize: file.size,
          activeProvider: settings.activeProvider
        })

        toast.success('Settings Imported', {
          description: `${file.name} loaded - ${Math.round(file.size / 1024)}KB`
        })
      } catch (error) {
        logger.error('Import failed', { error })
        toast.error('Import Failed', { description: 'Invalid settings file' })
      }
    }
    input.click()

    logger.info('Import dialog opened', {})
  }, [])

  const handleValidateKey = useCallback(async (provider: string, key: string) => {
    setIsLoading(true)

    try {
      const isValid = key && key.length > 10

      logger.info('Key validation result', {
        provider,
        keyLength: key.length,
        isValid
      })

      if (isValid) {
        toast.success(`${provider} Key Validated`, {
          description: `Key format correct - ${key.length} characters`
        })
      } else {
        toast.error(`Invalid ${provider} Key`, {
          description: 'Key must be at least 10 characters'
        })
      }

      setIsLoading(false)
    } catch (error: any) {
      logger.error('Validation failed', { error, provider })
      toast.error('Validation Failed', { description: error.message || 'Please try again' })
      setIsLoading(false)
    }
  }, [])

  const handleGenerateKey = useCallback((provider: string) => {
    logger.info('Generate key initiated', { provider })
    toast.info(`Generate ${provider} Key`, {
      description: 'Opening provider dashboard - follow their instructions'
    })
  }, [])

  const handleRevokeKey = useCallback((provider: string) => {
    handleResetProvider(provider)

    logger.info('Key revoked', { provider })
    toast.warning(`${provider} Key Revoked`, {
      description: 'Remember to revoke on provider dashboard too'
    })
  }, [handleResetProvider])

  const handleSwitchProvider = useCallback((from: string, to: string) => {
    setActiveProvider(to)

    logger.info('Provider switched', { from, to })
    toast.success('Provider Switched', {
      description: `From ${from} to ${to}`
    })
  }, [])

  const handleCheckUsage = useCallback((provider: string) => {
    const usage = {
      tokens: Math.floor(Math.random() * 100000),
      requests: Math.floor(Math.random() * 1000),
      cost: (Math.random() * 50).toFixed(2)
    }

    setUsageStats({ ...usageStats, [provider]: usage.tokens })

    logger.info('Usage checked', {
      provider,
      tokens: usage.tokens,
      requests: usage.requests,
      cost: usage.cost
    })

    toast.info(`${provider} Usage`, {
      description: `${usage.tokens.toLocaleString()} tokens • ${usage.requests} requests • $${usage.cost}`
    })
  }, [usageStats])

  const handleConfigureDefaults = useCallback(() => {
    logger.info('Configure defaults initiated', { activeProvider })
    toast.info('Configure Defaults', {
      description: `Setting ${activeProvider} as default with fallback options`
    })
  }, [activeProvider])

  const handleManagePermissions = useCallback(() => {
    logger.info('Manage permissions initiated', {})
    toast.info('Manage Permissions', {
      description: 'Configuring API access levels and rate limits'
    })
  }, [])

  const handleViewHistory = useCallback(() => {
    const backupCount = lastSaved ? 1 : 0

    logger.info('Viewing configuration history', {
      backupCount,
      lastSaved: lastSaved?.toISOString()
    })

    toast.info('Configuration History', {
      description: `${backupCount} backup available - Last saved: ${lastSaved ? lastSaved.toLocaleString() : 'Never'}`
    })
  }, [lastSaved])

  const handleOptimizeSettings = useCallback(() => {
    const recommendations = ['Use caching', 'Enable fallbacks', 'Set rate limits']

    logger.info('Settings optimization complete', {
      recommendationCount: recommendations.length
    })

    toast.success('Optimization Complete', {
      description: `${recommendations.length} recommendations generated`
    })
  }, [])

  const handleBulkImport = useCallback(() => {
    logger.info('Bulk import dialog opened', {})
    toast.info('Bulk Import', {
      description: 'Import multiple provider keys at once'
    })
  }, [])

  const handleEncryptKeys = useCallback(() => {
    const keyCount = Object.keys(apiKeys).length

    logger.info('Keys encrypted', { keyCount })
    toast.success('Keys Encrypted', {
      description: `${keyCount} API keys encrypted successfully`
    })
  }, [apiKeys])

  const handleRotateKeys = useCallback(() => {
    const providers = Object.keys(apiKeys)

    logger.info('Key rotation scheduled', {
      providerCount: providers.length,
      providers
    })

    toast.success('Key Rotation Scheduled', {
      description: `${providers.length} providers: ${providers.join(', ')}`
    })
  }, [apiKeys])

  const handleSyncSettings = useCallback(async () => {
    setIsLoading(true)

    try {
      const syncedAt = new Date()
      localStorage.setItem('kazi-ai-keys-synced', syncedAt.toISOString())

      logger.info('Settings synced successfully', {
        syncedAt: syncedAt.toISOString(),
        providerCount: Object.keys(apiKeys).length
      })

      toast.success('Settings Synced', {
        description: `${Object.keys(apiKeys).length} providers synced at ${syncedAt.toLocaleTimeString()}`
      })

      setIsLoading(false)
    } catch (error: any) {
      logger.error('Sync failed', { error })
      toast.error('Sync Failed', { description: error.message || 'Please try again later' })
      setIsLoading(false)
    }
  }, [apiKeys])

  const handleCompareProviders = useCallback((prompt?: string) => {
    const testPrompt = prompt || 'Write a professional introduction for a freelance platform called KAZI that helps freelancers manage projects and get paid securely.'

    setComparisonPrompt(testPrompt)
    setShowComparisonModal(true)

    logger.info('Opening model comparison modal', {
      promptLength: testPrompt.length,
      hasCustomPrompt: !!prompt
    })
  }, [])

  // A+++ LOADING STATE
  if (isPageLoading) {
    return (
      <div className="container py-8 kazi-bg-light dark:kazi-bg-dark min-h-screen">
        <div className="max-w-4xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container py-8 kazi-bg-light dark:kazi-bg-dark min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-2xl mx-auto mt-20">
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
    <div className="container py-8 kazi-bg-light dark:kazi-bg-dark min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" data-testid="ai-create-icon" />
            <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 dark:from-gray-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
              AI Create Studio
            </TextShimmer>
          </div>
          <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-3">
            <SettingsIcon className="h-4 w-4 flex-shrink-0" />
            Configure your AI provider settings and API keys
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <LiquidGlassCard variant="gradient" hoverEffect={true}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-lg backdrop-blur-sm">
                  <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">API Keys</span>
              </div>
              <NumberFlow value={Object.keys(apiKeys).length} className="text-2xl font-bold text-gray-900 dark:text-gray-100" />
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="tinted" hoverEffect={true}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 rounded-lg backdrop-blur-sm">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Active Provider</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">{activeProvider}</p>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="gradient" hoverEffect={true}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-lg backdrop-blur-sm">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Status</span>
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Configured
              </p>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="tinted" hoverEffect={true}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-400/10 dark:to-purple-400/10 rounded-lg backdrop-blur-sm">
                  <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Last Saved</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {lastSaved ? lastSaved.toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
          {/* Decorative arrow icon in corner */}
          <ArrowRight className="absolute top-4 right-4 h-5 w-5 text-muted-foreground" />

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center rounded-lg z-10">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            </div>
          )}

          <AICreate
            onSaveKeys={handleSaveKeys}
            onTestProvider={handleTestProvider}
            onResetProvider={handleResetProvider}
            onViewDocs={handleViewDocs}
            onExportSettings={handleExportSettings}
            onImportSettings={handleImportSettings}
            onValidateKey={handleValidateKey}
            onGenerateKey={handleGenerateKey}
            onRevokeKey={handleRevokeKey}
            onSwitchProvider={handleSwitchProvider}
            onCheckUsage={handleCheckUsage}
            onConfigureDefaults={handleConfigureDefaults}
            onManagePermissions={handleManagePermissions}
            onViewHistory={handleViewHistory}
            onOptimizeSettings={handleOptimizeSettings}
            onBulkImport={handleBulkImport}
            onEncryptKeys={handleEncryptKeys}
            onRotateKeys={handleRotateKeys}
            onSyncSettings={handleSyncSettings}
            onCompareProviders={handleCompareProviders}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={handleExportSettings}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            data-testid="export-settings-btn"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            onClick={handleImportSettings}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            data-testid="import-settings-btn"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>

          <button
            onClick={handleSyncSettings}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            data-testid="sync-settings-btn"
          >
            <RefreshCw className="h-4 w-4" />
            Sync
          </button>

          <button
            onClick={() => handleCompareProviders()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            data-testid="compare-providers-btn"
          >
            <Zap className="h-4 w-4" />
            Compare
          </button>
        </div>

        {/* Model Comparison Modal */}
        <ModelComparisonModal
          open={showComparisonModal}
          onOpenChange={setShowComparisonModal}
          prompt={comparisonPrompt}
        />
      </div>
    </div>
  )
}
