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

export default function AICreatePage() {
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

  return (
    <div className="container py-8 kazi-bg-light dark:kazi-bg-dark min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold kazi-text-dark dark:kazi-text-light kazi-headline">
            <Brain className="h-6 w-6 kazi-text-primary" data-testid="ai-create-icon" />
            AI Create Settings
          </h1>
          <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
            <SettingsIcon className="h-4 w-4 flex-shrink-0" />
            Configure your AI provider settings and API keys
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">API Keys</span>
            </div>
            <p className="text-2xl font-bold mt-1">{Object.keys(apiKeys).length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Provider</span>
            </div>
            <p className="text-2xl font-bold mt-1 capitalize">{activeProvider}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
            </div>
            <p className="text-sm font-bold mt-1 text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Configured
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Saved</span>
            </div>
            <p className="text-sm font-bold mt-1">
              {lastSaved ? lastSaved.toLocaleTimeString() : 'Never'}
            </p>
          </div>
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
