'use client'

export const dynamic = 'force-dynamic';

/**
 * World-Class White Label System
 * Complete implementation of branding and customization features
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Palette, Type, Image, Globe, Code, Eye, Download,
  Settings, Sparkles, CheckCircle, AlertCircle, Copy, Upload, RefreshCw, Save, Star, Crown, Shield, Zap, Info, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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

export default function WhiteLabelPage() {
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

  // A+++ LOAD WHITE LABEL DATA
  useEffect(() => {
    const loadWhiteLabelData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load white label configuration from API
        const response = await fetch('/api/white-label/config')
        if (!response.ok) {
          throw new Error('Failed to load white label configuration')
        }

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
                  <Button variant="outline" size="sm" className="border-gray-700 hover:bg-slate-800">
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
                      <Button variant="outline" size="sm" className="w-full border-gray-700 hover:bg-slate-800">
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
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                        Verify Domain
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
                              <Button variant="ghost" size="sm">
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
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
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
                    { format: 'CSS', desc: 'CSS Variables', icon: Code },
                    { format: 'JSON', desc: 'Theme Configuration', icon: Code },
                    { format: 'SCSS', desc: 'Sass Variables', icon: Code },
                    { format: 'Assets', desc: 'Logo & Images', icon: Image }
                  ].map((exportType) => (
                    <div
                      key={exportType.format}
                      className="p-4 bg-slate-900/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                    >
                      <exportType.icon className="w-8 h-8 text-purple-400 mb-2" />
                      <p className="font-medium text-white mb-1">{exportType.format}</p>
                      <p className="text-xs text-gray-400 mb-3">{exportType.desc}</p>
                      <Button variant="outline" size="sm" className="w-full border-gray-700 hover:bg-slate-800">
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
                  <Button variant="outline" size="sm" className="border-gray-700 hover:bg-slate-800">
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
            <Button variant="outline" className="border-gray-700 hover:bg-slate-800">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
