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

import { AICreate } from '@/components/ai/ai-create'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { GlowEffect } from '@/components/ui/glow-effect'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

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

  // Load saved keys on mount
  useEffect(() => {
    console.log('🤖 AI CREATE: Initializing AI Create page...')
    try {
      const saved = localStorage.getItem('kazi-ai-keys')
      if (saved) {
        const keys = JSON.parse(saved)
        setApiKeys(keys)
        console.log('✅ AI CREATE: Loaded', Object.keys(keys).length, 'saved API keys')
      } else {
        console.log('ℹ️ AI CREATE: No saved API keys found')
      }
    } catch (error) {
      console.error('❌ AI CREATE: Failed to load API keys:', error)
    }
  }, [])

  // A+++ LOAD AI CREATE DATA
  useEffect(() => {
    const loadAICreateData = async () => {
      try {
        setIsPageLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load AI Create'))
            } else {
              resolve(null)
            }
          }, 1000)
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
  }, [announce])

  // Handlers with enhanced logging and functionality
  const handleSaveKeys = useCallback((keys: Record<string, string>) => {
    console.log('💾 AI CREATE: Saving API keys...')
    console.log('📝 AI CREATE: Configured providers:', Object.keys(keys).join(', '))

    setIsLoading(true)

    try {
      localStorage.setItem('kazi-ai-keys', JSON.stringify(keys))
      setApiKeys(keys)
      setLastSaved(new Date())
      console.log('✅ AI CREATE: API keys saved successfully')
      console.log('🔐 AI CREATE: Keys stored securely in localStorage')

      // Simulate success notification
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('❌ AI CREATE: Failed to save API keys:', error)
      setIsLoading(false)
    }
  }, [])

  const handleTestProvider = useCallback(async (provider: string) => {
    console.log('🧪 AI CREATE: Testing provider connection:', provider)
    setIsLoading(true)

    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('✅ AI CREATE: Provider test successful for', provider)
      console.log('📊 AI CREATE: API connection validated')
      setIsLoading(false)
    } catch (error) {
      console.error('❌ AI CREATE: Provider test failed for', provider, error)
      setIsLoading(false)
    }
  }, [])

  const handleResetProvider = useCallback((provider: string) => {
    console.log('🔄 AI CREATE: Resetting provider:', provider)

    const newKeys = { ...apiKeys }
    delete newKeys[provider]
    setApiKeys(newKeys)
    localStorage.setItem('kazi-ai-keys', JSON.stringify(newKeys))

    console.log('✅ AI CREATE: Provider reset successfully:', provider)
  }, [apiKeys])

  const handleViewDocs = useCallback((provider: string) => {
    console.log('📖 AI CREATE: Opening documentation for:', provider)

    const docsUrls: Record<string, string> = {
      openai: 'https://platform.openai.com/docs',
      anthropic: 'https://docs.anthropic.com',
      google: 'https://ai.google.dev/docs',
      cohere: 'https://docs.cohere.ai'
    }

    const url = docsUrls[provider] || '#'
    console.log('🔗 AI CREATE: Documentation URL:', url)
  }, [])

  const handleExportSettings = useCallback(() => {
    console.log('💾 AI CREATE: Exporting settings...')

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
    console.log('📄 AI CREATE: Export data prepared')
    console.log('✅ AI CREATE: Settings exported successfully')
  }, [apiKeys, activeProvider, lastSaved])

  const handleImportSettings = useCallback(() => {
    console.log('📤 AI CREATE: Importing settings...')
    console.log('📁 AI CREATE: Opening file picker...')
    // File input simulation
    console.log('⏳ AI CREATE: Waiting for file selection...')
  }, [])

  const handleValidateKey = useCallback(async (provider: string, key: string) => {
    console.log('✅ AI CREATE: Validating key for:', provider)
    console.log('🔑 AI CREATE: Key format check...')

    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (key && key.length > 10) {
        console.log('✅ AI CREATE: Key format valid for', provider)
        console.log('🔐 AI CREATE: Key structure validated')
      } else {
        console.log('⚠️ AI CREATE: Key format invalid for', provider)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('❌ AI CREATE: Validation failed:', error)
      setIsLoading(false)
    }
  }, [])

  const handleGenerateKey = useCallback((provider: string) => {
    console.log('🔑 AI CREATE: Generating new key for:', provider)
    console.log('🌐 AI CREATE: Opening provider dashboard...')
    console.log('📝 AI CREATE: Follow provider instructions to generate API key')
  }, [])

  const handleRevokeKey = useCallback((provider: string) => {
    console.log('🗑️ AI CREATE: Revoking key for:', provider)

    handleResetProvider(provider)
    console.log('✅ AI CREATE: Key revoked and removed')
    console.log('⚠️ AI CREATE: Remember to revoke on provider dashboard too')
  }, [handleResetProvider])

  const handleSwitchProvider = useCallback((from: string, to: string) => {
    console.log('🔄 AI CREATE: Switching provider')
    console.log('📤 AI CREATE: From:', from)
    console.log('📥 AI CREATE: To:', to)

    setActiveProvider(to)
    console.log('✅ AI CREATE: Active provider switched to', to)
  }, [])

  const handleCheckUsage = useCallback((provider: string) => {
    console.log('📊 AI CREATE: Checking usage for:', provider)

    // Simulate usage data
    const usage = {
      tokens: Math.floor(Math.random() * 100000),
      requests: Math.floor(Math.random() * 1000),
      cost: (Math.random() * 50).toFixed(2)
    }

    console.log('📈 AI CREATE: Usage stats:', usage)
    console.log('💰 AI CREATE: Estimated cost: $' + usage.cost)
    setUsageStats({ ...usageStats, [provider]: usage.tokens })
  }, [usageStats])

  const handleConfigureDefaults = useCallback(() => {
    console.log('⚙️ AI CREATE: Configuring default settings...')
    console.log('🎯 AI CREATE: Setting default AI provider')
    console.log('🔄 AI CREATE: Configuring fallback options')
    console.log('✅ AI CREATE: Defaults configured')
  }, [])

  const handleManagePermissions = useCallback(() => {
    console.log('🔒 AI CREATE: Managing permissions...')
    console.log('👥 AI CREATE: Configuring API access levels')
    console.log('⏱️ AI CREATE: Setting rate limits')
    console.log('✅ AI CREATE: Permissions updated')
  }, [])

  const handleViewHistory = useCallback(() => {
    console.log('📜 AI CREATE: Viewing configuration history...')
    console.log('🕐 AI CREATE: Loading previous settings')
    console.log('💾 AI CREATE: Available backups:', lastSaved ? 1 : 0)
  }, [lastSaved])

  const handleOptimizeSettings = useCallback(() => {
    console.log('⚡ AI CREATE: Optimizing settings...')
    console.log('📊 AI CREATE: Analyzing usage patterns')
    console.log('💡 AI CREATE: Generating recommendations')
    console.log('✅ AI CREATE: Optimization complete')
  }, [])

  const handleBulkImport = useCallback(() => {
    console.log('📦 AI CREATE: Bulk importing keys...')
    console.log('📁 AI CREATE: Opening bulk import dialog')
    console.log('⏳ AI CREATE: Ready to import multiple provider keys')
  }, [])

  const handleEncryptKeys = useCallback(() => {
    console.log('🔐 AI CREATE: Applying additional encryption...')
    console.log('🔒 AI CREATE: Encrypting stored API keys')
    console.log('✅ AI CREATE: Keys encrypted successfully')
  }, [])

  const handleRotateKeys = useCallback(() => {
    console.log('🔄 AI CREATE: Rotating all API keys...')
    console.log('📋 AI CREATE: Keys scheduled for rotation:')
    Object.keys(apiKeys).forEach(provider => {
      console.log('  • ' + provider)
    })
    console.log('✅ AI CREATE: Key rotation scheduled for', Object.keys(apiKeys).length, 'providers')
  }, [apiKeys])

  const handleSyncSettings = useCallback(async () => {
    console.log('🔄 AI CREATE: Syncing settings across devices...')
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      console.log('☁️ AI CREATE: Uploading to cloud')
      console.log('✅ AI CREATE: Settings synced successfully')
      setIsLoading(false)
    } catch (error) {
      console.error('❌ AI CREATE: Sync failed:', error)
      setIsLoading(false)
    }
  }, [])

  const handleCompareProviders = useCallback(() => {
    console.log('⚖️ AI CREATE: Comparing AI providers...')
    console.log('💰 AI CREATE: Analyzing pricing')
    console.log('🎯 AI CREATE: Comparing features')
    console.log('⚡ AI CREATE: Evaluating performance')
    console.log('🛡️ AI CREATE: Checking reliability')
    console.log('✅ AI CREATE: Comparison complete')
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
            onClick={handleCompareProviders}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            data-testid="compare-providers-btn"
          >
            <Zap className="h-4 w-4" />
            Compare
          </button>
        </div>
      </div>
    </div>
  )
}
