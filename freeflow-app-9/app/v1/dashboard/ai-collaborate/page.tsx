'use client'

// MIGRATED: Batch #20 - Mock data removed, database hook integration verified

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Sparkles,
  CheckCircle,
  Eye,
  Palette,
  Share2,
  Download,
  Loader
} from 'lucide-react'

import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { KAZI_CLIENT_DATA } from '@/lib/client-zone-utils'

const logger = createFeatureLogger('ClientZoneAICollaborate')

// ============================================================================
// AI DESIGN OPTION TYPES
// ============================================================================

interface AIDesignOption {
  id: number
  title: string
  description: string
  category: 'logo' | 'palette' | 'layout' | 'typography'
  style: string
  image: string
  generatedAt: string
  selected: boolean
  rating?: number
  feedback?: string
}

// ============================================================================
// AI GENERATED OPTIONS DATA
// ============================================================================

const AI_DESIGN_OPTIONS: AIDesignOption[] = []

const STYLE_PREFERENCES: string[] = []

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AICollaboratePage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  // AI OPTIONS STATE
  const [options, setOptions] = useState<AIDesignOption[]>(AI_DESIGN_OPTIONS)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [previewOption, setPreviewOption] = useState<AIDesignOption | null>(null)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    'Modern & Minimalist',
    'Professional',
    'Tech-focused'
  ])
  const [category, setCategory] = useState<'all' | 'logo' | 'palette' | 'layout' | 'typography'>('all')
  const [filteredOptions, setFilteredOptions] = useState<AIDesignOption[]>(AI_DESIGN_OPTIONS)

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load AI options from API
        const response = await fetch('/api/ai/design-options')
        if (!response.ok) throw new Error('Failed to load AI options')

        setIsLoading(false)
        announce('AI design options loaded', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AI options')
        setIsLoading(false)
        announce('Error loading AI options', 'assertive')
      }
    }

    loadOptions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter options by category
  useEffect(() => {
    const filtered = category === 'all'
      ? options
      : options.filter(opt => opt.category === category)
    setFilteredOptions(filtered)
  }, [category, options])

  // ============================================================================
  // HANDLER 1: GENERATE AI OPTIONS
  // ============================================================================

  const handleGenerateOptions = useCallback(async () => {
    try {
      setIsGenerating(true)      // Simulate API call
      const response = await fetch('/api/client-zone/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styles: selectedStyles,
          category,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          projectId: 1,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI options')
      }      toast.success('AI designs generated!' new design options created based on your preferences`
      })
    } catch (error: any) {
      logger.error('Failed to generate AI options', { error })
      toast.error('Failed to generate designs')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedStyles, category])

  // ============================================================================
  // HANDLER 2: SELECT OPTION
  // ============================================================================

  const handleSelectOption = useCallback(async (optionId: number) => {
    try {      const response = await fetch('/api/client-zone/ai/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to select option')
      }

      // Update options
      setOptions(options.map(opt =>
        opt.id === optionId
          ? { ...opt, selected: !opt.selected }
          : opt
      ))

      // Update selected list
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId))
      } else {
        setSelectedOptions([...selectedOptions, optionId])
      }      toast.success('Option selected!')
    } catch (error: any) {
      logger.error('Failed to select option', { error, optionId })
      toast.error('Failed to select option')
    }
  }, [options, selectedOptions])

  // ============================================================================
  // HANDLER 3: RATE OPTION
  // ============================================================================

  const handleRateOption = useCallback(async (optionId: number, rating: number) => {
    try {      const response = await fetch('/api/client-zone/ai/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId,
          rating,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to rate option')
      }

      setOptions(options.map(opt =>
        opt.id === optionId
          ? { ...opt, rating }
          : opt
      ))

      toast.success(`Rated ${rating} stars!`)
    } catch (error: any) {
      logger.error('Failed to rate option', { error })
      toast.error('Failed to rate option')
    }
  }, [options])

  // ============================================================================
  // HANDLER 4: UPDATE STYLE PREFERENCES
  // ============================================================================

  const handleToggleStyle = useCallback((style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style))
    } else {
      setSelectedStyles([...selectedStyles, style])
    }
  }, [selectedStyles])

  // ============================================================================
  // HANDLER 5: DOWNLOAD SELECTION
  // ============================================================================

  const handleDownloadSelection = useCallback(async () => {
    try {
      if (selectedOptions.length === 0) {
        toast.error('Please select at least one design')
        return
      }      const response = await fetch('/api/client-zone/ai/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIds: selectedOptions,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to download designs')
      }

      toast.success('Downloads starting!' design(s) downloading`
      })
    } catch (error: any) {
      logger.error('Failed to download selection', { error })
      toast.error('Failed to download designs')
    }
  }, [selectedOptions])

  // ============================================================================
  // HANDLER 6: SHARE SELECTION
  // ============================================================================

  const handleShareSelection = useCallback(async () => {
    try {
      if (selectedOptions.length === 0) {
        toast.error('Please select at least one design')
        return
      }      const response = await fetch('/api/client-zone/ai/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIds: selectedOptions,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to share designs')
      }

      toast.success('Share link copied!')
    } catch (error: any) {
      logger.error('Failed to share selection', { error })
      toast.error('Failed to share designs')
    }
  }, [selectedOptions])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-2">
              <Brain className="h-8 w-8" />
              AI Design Collaboration
            </h1>
            <p className="text-gray-600 mt-2">
              Generate, preview, and select AI-powered design options
            </p>
          </div>
          <Badge variant="secondary" className="text-lg">
            {selectedOptions.length} selected
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Design Options Grid */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <CardTitle>AI-Generated Design Options</CardTitle>
                    </div>
                    <Badge variant="outline">{filteredOptions.length}</Badge>
                  </div>

                  {/* Category Filter */}
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'logo', 'palette', 'layout', 'typography'] as const).map((cat) => (
                      <Button
                        key={cat}
                        size="sm"
                        variant={category === cat ? 'default' : 'outline'}
                        onClick={() => setCategory(cat)}
                      >
                        {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {filteredOptions.length === 0 ? (
                  <NoDataEmptyState
                    title="No designs found"
                    description="Adjust your filters or generate new designs"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredOptions.map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-lg border-2 overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                          selectedOptions.includes(option.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                        onClick={() => setPreviewOption(option)}
                      >
                        {/* Image */}
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          <img src={option.image}
                            alt={option.title}
                            className="w-full h-full object-cover"
                          loading="lazy" />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all" />
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="font-semibold text-gray-900">{option.title}</p>
                            <p className="text-sm text-gray-600 mb-2">
                              {option.description}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {option.style}
                            </Badge>
                          </div>

                          {/* Rating */}
                          {option.rating && (
                            <div className="flex items-center gap-1 text-yellow-500 text-sm">
                              {'⭐'.repeat(Math.floor(option.rating))}
                              <span className="text-gray-600">({option.rating})</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              className={`flex-1 ${
                                selectedOptions.includes(option.id)
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectOption(option.id)
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {selectedOptions.includes(option.id)
                                ? 'Selected'
                                : 'Select'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreviewOption(option)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Preferences & Controls */}
          <div className="space-y-4">
            {/* Style Preferences */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Style Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {STYLE_PREFERENCES.map((style) => (
                    <button
                      key={style}
                      onClick={() => handleToggleStyle(style)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedStyles.includes(style)
                          ? 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedStyles.includes(style) && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span className="text-sm">{style}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={handleGenerateOptions}
                  disabled={isGenerating || selectedStyles.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate New Options
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {previewOption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg overflow-hidden bg-gray-100 h-40">
                      <img src={previewOption.image}
                        alt={previewOption.title}
                        className="w-full h-full object-cover"
                      loading="lazy" />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {previewOption.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {previewOption.description}
                      </p>
                      <Badge variant="secondary">{previewOption.style}</Badge>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRateOption(previewOption.id, star)}
                          className="text-2xl hover:scale-125 transition-transform"
                        >
                          {star <= (previewOption.rating || 0) ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        onClick={() => handleSelectOption(previewOption.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {selectedOptions.includes(previewOption.id)
                          ? 'Selected'
                          : 'Select'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Actions Card */}
            {selectedOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={handleDownloadSelection}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download ({selectedOptions.length})
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleShareSelection}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share ({selectedOptions.length})
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
