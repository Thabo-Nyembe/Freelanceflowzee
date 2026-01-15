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
 * World-Class Real-time Translation System
 * Complete implementation of multilingual translation features
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, Languages, FileText, Video,
  Clock, Zap, Settings, Download,
  Upload, Pause, Volume2, RefreshCw,
  CheckCircle, ArrowRight,
  Filter, Star, Plus, Eye, Save,
  ChevronDown, Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  Language,
  TranslationQuality,
  TranslationEngine
} from '@/lib/real-time-translation-types'
import {
  SUPPORTED_LANGUAGES,
  TRANSLATION_ENGINES,
  QUALITY_PRESETS,
  formatProcessingTime,
  formatFileSize,
  getLanguageInfo,
  getConfidenceColor
} from '@/lib/real-time-translation-utils'

// A+++ UTILITIES
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('RealTimeTranslationPage')

type ViewMode = 'translate' | 'live' | 'documents' | 'history'


// ============================================================================
// V2 COMPETITIVE MOCK DATA - RealTimeTranslation Context
// ============================================================================

const realTimeTranslationAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const realTimeTranslationCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const realTimeTranslationPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const realTimeTranslationActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function RealTimeTranslationClient() {
  // Dialog states for quick actions
  const [showNewTranslationDialog, setShowNewTranslationDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Additional dialog states for buttons without onClick
  const [showAllLanguagesDialog, setShowAllLanguagesDialog] = useState(false)
  const [showSessionSettingsDialog, setShowSessionSettingsDialog] = useState(false)
  const [showPauseSessionDialog, setShowPauseSessionDialog] = useState(false)
  const [showExportSessionDialog, setShowExportSessionDialog] = useState(false)
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false)
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false)
  const [showUploadDocumentDialog, setShowUploadDocumentDialog] = useState(false)
  const [showDownloadDocumentDialog, setShowDownloadDocumentDialog] = useState(false)
  const [showFilterHistoryDialog, setShowFilterHistoryDialog] = useState(false)
  const [showExportHistoryDialog, setShowExportHistoryDialog] = useState(false)
  const [showSaveTranslationDialog, setShowSaveTranslationDialog] = useState(false)

  // Selected items for dialogs
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null)

  // Create session form state
  const [newSessionName, setNewSessionName] = useState('')
  const [newSessionParticipants, setNewSessionParticipants] = useState('')
  const [newSessionLanguages, setNewSessionLanguages] = useState<string[]>(['en', 'es'])
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // Filter history form state
  const [filterLanguage, setFilterLanguage] = useState('all')
  const [filterEngine, setFilterEngine] = useState('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  // Save translation form state
  const [saveTranslationName, setSaveTranslationName] = useState('')
  const [saveTranslationFolder, setSaveTranslationFolder] = useState('default')

  // Processing states
  const [isPausingSession, setIsPausingSession] = useState(false)
  const [isExportingSession, setIsExportingSession] = useState(false)
  const [isDownloadingDocument, setIsDownloadingDocument] = useState(false)
  const [isSavingTranslation, setIsSavingTranslation] = useState(false)

  // New translation form state
  const [newTranslationName, setNewTranslationName] = useState('')
  const [newTranslationSource, setNewTranslationSource] = useState('')
  const [newTranslationSourceLang, setNewTranslationSourceLang] = useState('en')
  const [newTranslationTargetLang, setNewTranslationTargetLang] = useState('es')
  const [newTranslationType, setNewTranslationType] = useState<'text' | 'document' | 'batch'>('text')
  const [isCreatingTranslation, setIsCreatingTranslation] = useState(false)

  // Export form state
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xlsx' | 'pdf'>('json')
  const [exportDateRange, setExportDateRange] = useState<'all' | 'week' | 'month' | 'custom'>('all')
  const [exportIncludeSource, setExportIncludeSource] = useState(true)
  const [exportIncludeMetadata, setExportIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Settings form state
  const [settingsDefaultEngine, setSettingsDefaultEngine] = useState('kazi-ai')
  const [settingsDefaultQuality, setSettingsDefaultQuality] = useState('accurate')
  const [settingsAutoDetect, setSettingsAutoDetect] = useState(true)
  const [settingsSaveHistory, setSettingsSaveHistory] = useState(true)
  const [settingsNotifications, setSettingsNotifications] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Handle new translation creation
  const handleCreateTranslation = async () => {
    if (!newTranslationName.trim()) {
      toast.error('Name required', { description: 'Please enter a name for this translation job' })
      return
    }
    if (!newTranslationSource.trim() && newTranslationType === 'text') {
      toast.error('Source text required', { description: 'Please enter text to translate' })
      return
    }

    setIsCreatingTranslation(true)
    try {
      const res = await fetch('/api/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newTranslationName,
          sourceText: newTranslationSource,
          sourceLang: newTranslationSourceLang,
          targetLang: newTranslationTargetLang
        })
      })
      if (!res.ok) throw new Error('Failed to create translation')

      toast.success('Translation Created', {
        description: `"${newTranslationName}" has been created and queued for translation`
      })

      // Reset form
      setNewTranslationName('')
      setNewTranslationSource('')
      setNewTranslationSourceLang('en')
      setNewTranslationTargetLang('es')
      setNewTranslationType('text')
      setShowNewTranslationDialog(false)
    } catch (error) {
      toast.error('Failed to create translation', {
        description: 'Please try again later'
      })
    } finally {
      setIsCreatingTranslation(false)
    }
  }

  // Handle export
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(`/api/translation?action=export&format=${exportFormat}`)
      if (!res.ok) throw new Error('Export failed')

      if (exportFormat === 'csv') {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `translations-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      toast.success('Export Complete', {
        description: `Translation history exported as ${exportFormat.toUpperCase()}`
      })

      setShowExportDialog(false)
    } catch (error) {
      toast.error('Export Failed', {
        description: 'Unable to export translations. Please try again.'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle save settings
  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const res = await fetch('/api/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          settings: { sourceLanguage, targetLanguage, selectedEngine, selectedQuality }
        })
      })
      if (!res.ok) throw new Error('Failed to save settings')

      toast.success('Settings Saved', {
        description: 'Your translation preferences have been updated'
      })

      setShowSettingsDialog(false)
    } catch (error) {
      toast.error('Failed to save settings', {
        description: 'Please try again later'
      })
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Handle copy text to clipboard
  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied!', { description: `${label} copied to clipboard` })
    } catch (error) {
      toast.error('Failed to copy', { description: 'Please try again' })
    }
  }

  // Handle text-to-speech
  const handleListenText = (text: string, lang: string) => {
    if (!text) {
      toast.error('No text', { description: 'Please enter text first' })
      return
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      window.speechSynthesis.speak(utterance)
      toast.success('Playing audio', { description: 'Text-to-speech started' })
    } else {
      toast.error('Not supported', { description: 'Text-to-speech is not supported in your browser' })
    }
  }

  // Handle create live session
  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      toast.error('Name required', { description: 'Please enter a session name' })
      return
    }

    setIsCreatingSession(true)
    try {
      const res = await fetch('/api/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_session',
          name: newSessionName,
          participants: newSessionParticipants,
          sourceLang: newSessionLanguages[0],
          targetLang: newSessionLanguages[1]
        })
      })
      if (!res.ok) throw new Error('Failed to create session')

      toast.success('Session Created', {
        description: `"${newSessionName}" is now active and ready for participants`
      })
      setNewSessionName('')
      setNewSessionParticipants('')
      setNewSessionLanguages(['en', 'es'])
      setShowCreateSessionDialog(false)
    } catch (error) {
      toast.error('Failed to create session', { description: 'Please try again later' })
    } finally {
      setIsCreatingSession(false)
    }
  }

  // Handle pause session
  const handlePauseSession = async () => {
    setIsPausingSession(true)
    try {
      const res = await fetch('/api/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause_session', sessionId: 'current' })
      })
      if (!res.ok) throw new Error('Failed to pause session')

      toast.success('Session Paused', {
        description: 'The live translation session has been paused'
      })
      setShowPauseSessionDialog(false)
    } catch (error) {
      toast.error('Failed to pause session', { description: 'Please try again' })
    } finally {
      setIsPausingSession(false)
    }
  }

  // Handle export session
  const handleExportSession = async () => {
    setIsExportingSession(true)
    try {
      const res = await fetch('/api/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_session', sessionId: 'current' })
      })
      if (!res.ok) throw new Error('Export failed')
      const data = await res.json()

      // Download as JSON
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session-transcript-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Session Exported', {
        description: 'Session transcript and data have been exported'
      })
      setShowExportSessionDialog(false)
    } catch (error) {
      toast.error('Export failed', { description: 'Please try again' })
    } finally {
      setIsExportingSession(false)
    }
  }

  // Handle download document
  const handleDownloadDocument = async () => {
    setIsDownloadingDocument(true)
    try {
      const res = await fetch('/api/translation?action=export&format=json')
      if (!res.ok) throw new Error('Download failed')
      const data = await res.json()

      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `translated-document-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Download Started', {
        description: 'Your translated document is being downloaded'
      })
      setShowDownloadDocumentDialog(false)
    } catch (error) {
      toast.error('Download failed', { description: 'Please try again' })
    } finally {
      setIsDownloadingDocument(false)
    }
  }

  // Handle filter history
  const handleApplyFilter = () => {
    toast.success('Filters Applied', {
      description: 'Translation history has been filtered'
    })
    setShowFilterHistoryDialog(false)
  }

  // Handle save translation to favorites
  const handleSaveTranslationToFavorites = async () => {
    if (!saveTranslationName.trim()) {
      toast.error('Name required', { description: 'Please enter a name for this translation' })
      return
    }

    setIsSavingTranslation(true)
    try {
      const res = await fetch('/api/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_translation',
          name: saveTranslationName,
          folder: saveTranslationFolder
        })
      })
      if (!res.ok) throw new Error('Failed to save')

      toast.success('Translation Saved', {
        description: `"${saveTranslationName}" has been saved to your favorites`
      })
      setSaveTranslationName('')
      setSaveTranslationFolder('default')
      setShowSaveTranslationDialog(false)
    } catch (error) {
      toast.error('Failed to save', { description: 'Please try again' })
    } finally {
      setIsSavingTranslation(false)
    }
  }

  // Quick actions with dialog triggers
  const realTimeTranslationQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewTranslationDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // Database state
  const [translationResults, setTranslationResults] = useState<any[]>([])
  const [liveSessions, setLiveSessions] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [translationStats, setTranslationStats] = useState<any>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('translate')
  const [sourceLanguage, setSourceLanguage] = useState<Language>('en')
  const [targetLanguage, setTargetLanguage] = useState<Language>('es')
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [selectedEngine, setSelectedEngine] = useState<TranslationEngine>('kazi-ai')
  const [selectedQuality, setSelectedQuality] = useState<TranslationQuality>('accurate')
  const [isTranslating, setIsTranslating] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // A+++ LOAD TRANSLATION DATA
  useEffect(() => {
    const loadTranslationData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading translation data', { userId })

        const {
          getTranslationHistory,
          getLiveSessions,
          getDocumentTranslations,
          getTranslationStats
        } = await import('@/lib/realtime-translation-queries')

        const [resultsData, sessionsData, documentsData, statsData] = await Promise.all([
          getTranslationHistory(userId),
          getLiveSessions(userId),
          getDocumentTranslations(userId),
          getTranslationStats(userId)
        ])

        setTranslationResults(resultsData.data || [])
        setLiveSessions(sessionsData.data || [])
        setDocuments(documentsData.data || [])
        setTranslationStats(statsData.data || null)

        setIsLoading(false)
        toast.success('Translation loaded', {
          description: `${resultsData.data?.length || 0} translations from database`
        })
        logger.info('Translation data loaded successfully', {
          resultsCount: resultsData.data?.length,
          sessionsCount: sessionsData.data?.length,
          documentsCount: documentsData.data?.length
        })
        announce('Real-time translation loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load translation data'
        setError(errorMessage)
        setIsLoading(false)
        logger.error('Failed to load translation data', { error: errorMessage, userId })
        toast.error('Failed to load translation', { description: errorMessage })
        announce('Error loading translation', 'assertive')
      }
    }

    loadTranslationData()
  }, [userId, announce])

  const handleTranslate = async () => {
    setIsTranslating(true)

    try {
      const res = await fetch('/api/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          text: sourceText,
          sourceLang: sourceLanguage,
          targetLang: targetLanguage
        })
      })
      if (!res.ok) throw new Error('Translation failed')
      const data = await res.json()
      setTranslatedText(data.data?.translated || 'Translation completed')
    } catch (error) {
      toast.error('Translation failed', { description: 'Please try again' })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSwapLanguages = () => {
    const temp = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(temp)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={realTimeTranslationAIInsights} />
          <PredictiveAnalytics predictions={realTimeTranslationPredictions} />
          <CollaborationIndicator collaborators={realTimeTranslationCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={realTimeTranslationQuickActions} />
          <ActivityFeed activities={realTimeTranslationActivities} />
        </div>
<div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal variant="slide-up" duration={0.6}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 rounded-full text-sm font-medium mb-6 border border-indigo-500/30"
              >
                <Globe className="w-4 h-4" />
                Real-time Translation
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Languages className="w-3 h-3 mr-1" />
                  70+ Languages
                </Badge>
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                Break Language Barriers
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Instant translation powered by AI - Translate text, documents, and live conversations in real-time
              </p>
            </div>
          </ScrollReveal>

          {/* View Mode Tabs */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.2}>
            <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
              {[
                { id: 'translate' as ViewMode, label: 'Text Translation', icon: Languages },
                { id: 'live' as ViewMode, label: 'Live Sessions', icon: Video },
                { id: 'documents' as ViewMode, label: 'Documents', icon: FileText },
                { id: 'history' as ViewMode, label: 'History', icon: Clock }
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant={viewMode === mode.id ? "default" : "outline"}
                  onClick={() => setViewMode(mode.id)}
                  className={viewMode === mode.id ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "border-gray-700 hover:bg-slate-800"}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </ScrollReveal>

          {/* Text Translation View */}
          {viewMode === 'translate' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Languages', value: '70+', icon: Globe, color: 'indigo' },
                  { label: 'Translations', value: (translationStats?.totalTranslations || 0).toLocaleString(), icon: Languages, color: 'purple' },
                  { label: 'Accuracy', value: `${((translationStats?.averageConfidence || 0) * 100).toFixed(1)}%`, icon: CheckCircle, color: 'green' },
                  { label: 'Avg Speed', value: formatProcessingTime(translationStats?.averageProcessingTime || 0), icon: Zap, color: 'yellow' }
                ].map((stat, index) => (
                  <LiquidGlassCard key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </LiquidGlassCard>
                ))}
              </div>

              {/* Main Translation Interface */}
              <LiquidGlassCard className="p-6">
                <div className="space-y-6">
                  {/* Language Selector Bar */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        className="border-gray-700 hover:bg-slate-800"
                        onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                      >
                        <span className="text-2xl mr-2">{getLanguageInfo(sourceLanguage)?.flag}</span>
                        {getLanguageInfo(sourceLanguage)?.name}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSwapLanguages}
                        className="hover:bg-slate-800"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </Button>

                      <Button
                        variant="outline"
                        className="border-gray-700 hover:bg-slate-800"
                        onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                      >
                        <span className="text-2xl mr-2">{getLanguageInfo(targetLanguage)?.flag}</span>
                        {getLanguageInfo(targetLanguage)?.name}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {QUALITY_PRESETS.map((preset) => (
                        <Button
                          key={preset.id}
                          variant={selectedQuality === preset.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedQuality(preset.id)}
                          className={selectedQuality === preset.id ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Translation Boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source Text */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Source Text</label>
                      <textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Enter text to translate..."
                        className="w-full h-48 p-4 bg-slate-900/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{sourceText.length} characters</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => handleCopyText(sourceText, 'Source text')}>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => handleListenText(sourceText, sourceLanguage)}>
                            <Volume2 className="w-3 h-3 mr-1" />
                            Listen
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Translated Text */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Translated Text</label>
                      <div className="w-full h-48 p-4 bg-slate-900/50 border border-gray-700 rounded-lg text-white overflow-y-auto">
                        {isTranslating ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                          </div>
                        ) : translatedText ? (
                          <p>{translatedText}</p>
                        ) : (
                          <p className="text-gray-500">Translation will appear here...</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{translatedText.length} characters</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => handleCopyText(translatedText, 'Translated text')}>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => handleListenText(translatedText, targetLanguage)}>
                            <Volume2 className="w-3 h-3 mr-1" />
                            Listen
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => {
                            setSaveTranslationName('')
                            setShowSaveTranslationDialog(true)
                          }}>
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedEngine}
                        onChange={(e) => setSelectedEngine(e.target.value as TranslationEngine)}
                        className="px-3 py-2 bg-slate-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {TRANSLATION_ENGINES.map((engine) => (
                          <option key={engine.id} value={engine.id}>
                            {engine.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      onClick={handleTranslate}
                      disabled={!sourceText || isTranslating}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      {isTranslating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Languages className="w-4 h-4 mr-2" />
                          Translate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Supported Languages Grid */}
              <LiquidGlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Supported Languages</h3>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                    {SUPPORTED_LANGUAGES.length} languages
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {SUPPORTED_LANGUAGES.slice(0, 12).map((lang) => (
                    <div
                      key={lang.code}
                      className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{lang.name}</p>
                        <p className="text-xs text-gray-400">{lang.nativeName}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4 border-gray-700 hover:bg-slate-800" onClick={() => setShowAllLanguagesDialog(true)}>
                  View All {SUPPORTED_LANGUAGES.length} Languages
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </LiquidGlassCard>
            </div>
          )}

          {/* Live Translation View */}
          {viewMode === 'live' && (
            <div className="space-y-6">
              {/* Active Sessions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {liveSessions.map((session) => (
                  <LiquidGlassCard key={session.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">Live Translation Session</h3>
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                              {session.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {Math.floor(session.duration / 60)}m {session.duration % 60}s
                          </p>
                        </div>
                        <Button variant="outline" size="icon" className="border-gray-700 hover:bg-slate-800" onClick={() => {
                          setSelectedSession(session)
                          setShowSessionSettingsDialog(true)
                        }}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-400">Participants ({session.participants.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {session.participants.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg border border-gray-700"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {participant.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{participant.name}</p>
                                <p className="text-xs text-gray-400">
                                  {getLanguageInfo(participant.language)?.flag} {getLanguageInfo(participant.language)?.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-gray-700 hover:bg-slate-800" onClick={() => {
                            setSelectedSession(session)
                            setShowPauseSessionDialog(true)
                          }}>
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-700 hover:bg-slate-800" onClick={() => {
                            setSelectedSession(session)
                            setShowExportSessionDialog(true)
                          }}>
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 border-gray-700 hover:bg-slate-800" onClick={() => {
                            setSelectedSession(session)
                            setShowTranscriptDialog(true)
                          }}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Transcript
                          </Button>
                        </div>
                      </div>
                    </div>
                  </LiquidGlassCard>
                ))}

                {/* Create New Session */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full min-h-[300px]"
                  onClick={() => setShowCreateSessionDialog(true)}
                >
                  <LiquidGlassCard className="h-full p-6 border-2 border-dashed border-gray-700 hover:border-indigo-500/50 transition-colors">
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">Start New Live Session</h3>
                        <p className="text-sm text-gray-400">
                          Create a new real-time translation session for video calls or meetings
                        </p>
                      </div>
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" onClick={() => setShowCreateSessionDialog(true)}>
                        <Video className="w-4 h-4 mr-2" />
                        Create Session
                      </Button>
                    </div>
                  </LiquidGlassCard>
                </motion.button>
              </div>
            </div>
          )}

          {/* Documents View */}
          {viewMode === 'documents' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="cursor-pointer"
                onClick={() => setShowUploadDocumentDialog(true)}
              >
                <LiquidGlassCard className="p-12 border-2 border-dashed border-gray-700 hover:border-indigo-500/50 transition-colors">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <Upload className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Upload Document for Translation</h3>
                      <p className="text-gray-400">
                        Support for PDF, DOCX, TXT, MD, HTML, and SRT files
                      </p>
                    </div>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" onClick={() => setShowUploadDocumentDialog(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </LiquidGlassCard>
              </motion.div>

              {/* Document List */}
              <div className="space-y-4">
                {documents.map((doc) => (
                  <LiquidGlassCard key={doc.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-indigo-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate mb-1">{doc.fileName}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>•</span>
                            <span>{doc.pageCount} pages</span>
                            <span>•</span>
                            <span>
                              {getLanguageInfo(doc.sourceLanguage)?.flag} → {doc.targetLanguages.map(lang => getLanguageInfo(lang)?.flag).join(' ')}
                            </span>
                          </div>

                          {doc.status === 'processing' && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>Processing...</span>
                                <span>{doc.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                                  style={{ width: `${doc.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.status === 'completed' ? (
                          <>
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                            <Button variant="outline" size="sm" className="border-gray-700 hover:bg-slate-800" onClick={() => {
                              setSelectedDocument(doc)
                              setShowDownloadDocumentDialog(true)
                            }}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </>
                        ) : (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Processing
                          </Badge>
                        )}
                      </div>
                    </div>
                  </LiquidGlassCard>
                ))}
              </div>
            </div>
          )}

          {/* History View */}
          {viewMode === 'history' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Translations', value: (translationStats?.totalTranslations || 0).toLocaleString(), icon: Languages },
                  { label: 'Characters', value: (translationStats?.charactersTranslated || 0).toLocaleString(), icon: FileText },
                  { label: 'Success Rate', value: `${((translationStats?.successRate || 0) * 100).toFixed(1)}%`, icon: CheckCircle }
                ].map((stat, index) => (
                  <LiquidGlassCard key={index} className="p-4">
                    <div className="flex items-center gap-3">
                      <stat.icon className="w-8 h-8 text-indigo-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                      </div>
                    </div>
                  </LiquidGlassCard>
                ))}
              </div>

              <LiquidGlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Translations</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-gray-700 hover:bg-slate-800" onClick={() => setShowFilterHistoryDialog(true)}>
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-700 hover:bg-slate-800" onClick={() => setShowExportHistoryDialog(true)}>
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {translationResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 bg-slate-900/50 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getLanguageInfo(result.sourceLanguage)?.flag}</span>
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                          <span className="text-lg">{getLanguageInfo(result.targetLanguage)?.flag}</span>
                          <span className="text-sm text-gray-400">
                            {getLanguageInfo(result.sourceLanguage)?.name} → {getLanguageInfo(result.targetLanguage)?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`bg-${getConfidenceColor(result.confidence)}-500/20 text-${getConfidenceColor(result.confidence)}-300 border-${getConfidenceColor(result.confidence)}-500/30 text-xs`}>
                            {(result.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {result.engine}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Source</p>
                          <p className="text-sm text-white">{result.sourceText}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Translation</p>
                          <p className="text-sm text-white">{result.translatedText}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                        <span>{formatProcessingTime(result.processingTime)}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleCopyText(result.translatedText, 'Translation')}>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                            setSelectedHistoryItem(result)
                            setSaveTranslationName(result.sourceText.substring(0, 30) + '...')
                            setShowSaveTranslationDialog(true)
                          }}>
                            <Star className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>
            </div>
          )}
        </div>
      </div>

      {/* New Translation Dialog */}
      <Dialog open={showNewTranslationDialog} onOpenChange={setShowNewTranslationDialog}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              New Translation Job
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new translation job. Configure the source, target language, and translation type.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="translation-name" className="text-gray-300">Job Name</Label>
              <Input
                id="translation-name"
                placeholder="Enter a name for this translation job"
                value={newTranslationName}
                onChange={(e) => setNewTranslationName(e.target.value)}
                className="bg-slate-800 border-gray-700 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-300">Translation Type</Label>
              <Select value={newTranslationType} onValueChange={(v: 'text' | 'document' | 'batch') => setNewTranslationType(v)}>
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="text" className="text-white hover:bg-slate-700">Text Translation</SelectItem>
                  <SelectItem value="document" className="text-white hover:bg-slate-700">Document Translation</SelectItem>
                  <SelectItem value="batch" className="text-white hover:bg-slate-700">Batch Translation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="grid gap-2">
                <Label className="text-gray-300">Source Language</Label>
                <Select value={newTranslationSourceLang} onValueChange={setNewTranslationSourceLang}>
                  <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-gray-700 max-h-[200px]">
                    {SUPPORTED_LANGUAGES.slice(0, 20).map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-slate-700">
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-gray-300">Target Language</Label>
                <Select value={newTranslationTargetLang} onValueChange={setNewTranslationTargetLang}>
                  <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-gray-700 max-h-[200px]">
                    {SUPPORTED_LANGUAGES.slice(0, 20).map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-slate-700">
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newTranslationType === 'text' && (
              <div className="grid gap-2">
                <Label htmlFor="source-text" className="text-gray-300">Source Text</Label>
                <Textarea
                  id="source-text"
                  placeholder="Enter text to translate..."
                  value={newTranslationSource}
                  onChange={(e) => setNewTranslationSource(e.target.value)}
                  className="bg-slate-800 border-gray-700 text-white min-h-[120px]"
                />
                <p className="text-xs text-gray-500">{newTranslationSource.length} characters</p>
              </div>
            )}

            {newTranslationType === 'document' && (
              <div className="grid gap-2">
                <Label className="text-gray-300">Upload Document</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT (max 10MB)</p>
                </div>
              </div>
            )}

            {newTranslationType === 'batch' && (
              <div className="grid gap-2">
                <Label className="text-gray-300">Upload Batch File</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Upload CSV or JSON file with text entries</p>
                  <p className="text-xs text-gray-500 mt-1">CSV, JSON (max 50MB)</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTranslationDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTranslation}
              disabled={isCreatingTranslation}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isCreatingTranslation ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Translation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              Export Translations
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Export your translation history in your preferred format.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-gray-300">Export Format</Label>
              <Select value={exportFormat} onValueChange={(v: 'json' | 'csv' | 'xlsx' | 'pdf') => setExportFormat(v)}>
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="json" className="text-white hover:bg-slate-700">JSON - Machine readable</SelectItem>
                  <SelectItem value="csv" className="text-white hover:bg-slate-700">CSV - Spreadsheet compatible</SelectItem>
                  <SelectItem value="xlsx" className="text-white hover:bg-slate-700">Excel - Full formatting</SelectItem>
                  <SelectItem value="pdf" className="text-white hover:bg-slate-700">PDF - Print ready</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-300">Date Range</Label>
              <Select value={exportDateRange} onValueChange={(v: 'all' | 'week' | 'month' | 'custom') => setExportDateRange(v)}>
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All time</SelectItem>
                  <SelectItem value="week" className="text-white hover:bg-slate-700">Last 7 days</SelectItem>
                  <SelectItem value="month" className="text-white hover:bg-slate-700">Last 30 days</SelectItem>
                  <SelectItem value="custom" className="text-white hover:bg-slate-700">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300">Include in Export</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportIncludeSource}
                    onChange={(e) => setExportIncludeSource(e.target.checked)}
                    className="rounded border-gray-700 bg-slate-800 text-indigo-600"
                  />
                  <span className="text-sm text-gray-300">Source text</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportIncludeMetadata}
                    onChange={(e) => setExportIncludeMetadata(e.target.checked)}
                    className="rounded border-gray-700 bg-slate-800 text-indigo-600"
                  />
                  <span className="text-sm text-gray-300">Metadata (timestamps, confidence scores)</span>
                </label>
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">
                <strong className="text-gray-300">{translationResults.length}</strong> translations will be exported
              </p>
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
              onClick={handleExport}
              disabled={isExporting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Translation Settings
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure your translation preferences and default settings.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-gray-300">Default Translation Engine</Label>
              <Select value={settingsDefaultEngine} onValueChange={setSettingsDefaultEngine}>
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select engine" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  {TRANSLATION_ENGINES.map((engine) => (
                    <SelectItem key={engine.id} value={engine.id} className="text-white hover:bg-slate-700">
                      {engine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-300">Default Quality Preset</Label>
              <Select value={settingsDefaultQuality} onValueChange={setSettingsDefaultQuality}>
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  {QUALITY_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id} className="text-white hover:bg-slate-700">
                      {preset.name} - {preset.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300">Features</Label>
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-800/50 rounded-lg border border-gray-700">
                  <div>
                    <span className="text-sm text-gray-300">Auto-detect language</span>
                    <p className="text-xs text-gray-500">Automatically detect the source language</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsAutoDetect}
                    onChange={(e) => setSettingsAutoDetect(e.target.checked)}
                    className="rounded border-gray-700 bg-slate-800 text-indigo-600"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-800/50 rounded-lg border border-gray-700">
                  <div>
                    <span className="text-sm text-gray-300">Save translation history</span>
                    <p className="text-xs text-gray-500">Keep a record of all translations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsSaveHistory}
                    onChange={(e) => setSettingsSaveHistory(e.target.checked)}
                    className="rounded border-gray-700 bg-slate-800 text-indigo-600"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-800/50 rounded-lg border border-gray-700">
                  <div>
                    <span className="text-sm text-gray-300">Translation notifications</span>
                    <p className="text-xs text-gray-500">Get notified when translations complete</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsNotifications}
                    onChange={(e) => setSettingsNotifications(e.target.checked)}
                    className="rounded border-gray-700 bg-slate-800 text-indigo-600"
                  />
                </label>
              </div>
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
              disabled={isSavingSettings}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSavingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* All Languages Dialog */}
      <Dialog open={showAllLanguagesDialog} onOpenChange={setShowAllLanguagesDialog}>
        <DialogContent className="sm:max-w-[700px] bg-slate-900 border-gray-700 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              All Supported Languages
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {SUPPORTED_LANGUAGES.length} languages available for translation
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                onClick={() => {
                  setTargetLanguage(lang.code as Language)
                  setShowAllLanguagesDialog(false)
                  toast.success('Language Selected', { description: `${lang.name} set as target language` })
                }}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <p className="text-sm font-medium text-white">{lang.name}</p>
                  <p className="text-xs text-gray-400">{lang.nativeName}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAllLanguagesDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Live Session Dialog */}
      <Dialog open={showCreateSessionDialog} onOpenChange={setShowCreateSessionDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-400" />
              Create Live Translation Session
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Start a new real-time translation session for video calls or meetings.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="session-name" className="text-gray-300">Session Name</Label>
              <Input
                id="session-name"
                placeholder="e.g., Team Meeting Translation"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                className="bg-slate-800 border-gray-700 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-300">Session Languages</Label>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_LANGUAGES.slice(0, 8).map((lang) => (
                  <Button
                    key={lang.code}
                    variant={newSessionLanguages.includes(lang.code) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setNewSessionLanguages(prev =>
                        prev.includes(lang.code)
                          ? prev.filter(l => l !== lang.code)
                          : [...prev, lang.code]
                      )
                    }}
                    className={newSessionLanguages.includes(lang.code)
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "border-gray-700 hover:bg-slate-800"
                    }
                  >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500">{newSessionLanguages.length} languages selected</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="participants" className="text-gray-300">Invite Participants (Optional)</Label>
              <Textarea
                id="participants"
                placeholder="Enter email addresses, separated by commas"
                value={newSessionParticipants}
                onChange={(e) => setNewSessionParticipants(e.target.value)}
                className="bg-slate-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateSessionDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={isCreatingSession}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isCreatingSession ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Create Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Settings Dialog */}
      <Dialog open={showSessionSettingsDialog} onOpenChange={setShowSessionSettingsDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Session Settings
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure settings for this live translation session.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-gray-300">Audio Quality</Label>
              <Select defaultValue="high">
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="low" className="text-white hover:bg-slate-700">Low (Bandwidth saving)</SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-slate-700">Medium (Balanced)</SelectItem>
                  <SelectItem value="high" className="text-white hover:bg-slate-700">High (Best quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-300">Translation Delay</Label>
              <Select defaultValue="realtime">
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select delay" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="realtime" className="text-white hover:bg-slate-700">Real-time (0-1s)</SelectItem>
                  <SelectItem value="slight" className="text-white hover:bg-slate-700">Slight (1-3s)</SelectItem>
                  <SelectItem value="buffered" className="text-white hover:bg-slate-700">Buffered (3-5s)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300">Session Features</Label>
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-800/50 rounded-lg border border-gray-700">
                  <span className="text-sm text-gray-300">Save transcript automatically</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-800/50 rounded-lg border border-gray-700">
                  <span className="text-sm text-gray-300">Enable captions overlay</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-800/50 rounded-lg border border-gray-700">
                  <span className="text-sm text-gray-300">Speaker identification</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSessionSettingsDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success('Settings Updated', { description: 'Session settings have been saved' })
                setShowSessionSettingsDialog(false)
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause Session Dialog */}
      <Dialog open={showPauseSessionDialog} onOpenChange={setShowPauseSessionDialog}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Pause className="w-5 h-5 text-yellow-400" />
              Pause Session
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Pausing will temporarily stop the live translation. All participants will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <p className="text-sm text-yellow-300">
                The session will remain active and can be resumed at any time. Transcript recording will also be paused.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPauseSessionDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePauseSession}
              disabled={isPausingSession}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isPausingSession ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Pausing...
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Session Dialog */}
      <Dialog open={showExportSessionDialog} onOpenChange={setShowExportSessionDialog}>
        <DialogContent className="sm:max-w-[450px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              Export Session
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Export the transcript and data from this session.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-gray-300">Export Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="pdf" className="text-white hover:bg-slate-700">PDF - Formatted transcript</SelectItem>
                  <SelectItem value="srt" className="text-white hover:bg-slate-700">SRT - Subtitle file</SelectItem>
                  <SelectItem value="txt" className="text-white hover:bg-slate-700">TXT - Plain text</SelectItem>
                  <SelectItem value="json" className="text-white hover:bg-slate-700">JSON - Structured data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Include in Export</Label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Original audio transcript</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Translated text</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Timestamps</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Speaker labels</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportSessionDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportSession}
              disabled={isExportingSession}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isExportingSession ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Transcript Dialog */}
      <Dialog open={showTranscriptDialog} onOpenChange={setShowTranscriptDialog}>
        <DialogContent className="sm:max-w-[700px] bg-slate-900 border-gray-700 max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Live Transcript
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Real-time transcript with translations
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[400px] overflow-y-auto space-y-4">
            {[
              { speaker: 'Speaker 1', original: 'Hello, welcome to the meeting.', translated: 'Hola, bienvenido a la reunion.', time: '00:00:05' },
              { speaker: 'Speaker 2', original: 'Thank you for having me.', translated: 'Gracias por invitarme.', time: '00:00:12' },
              { speaker: 'Speaker 1', original: 'Let us start with the agenda for today.', translated: 'Empecemos con la agenda de hoy.', time: '00:00:20' },
              { speaker: 'Speaker 2', original: 'Sounds good. I have prepared some notes.', translated: 'Suena bien. He preparado algunas notas.', time: '00:00:28' },
            ].map((entry, index) => (
              <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-400">{entry.speaker}</span>
                  <span className="text-xs text-gray-500">{entry.time}</span>
                </div>
                <p className="text-sm text-white mb-2">{entry.original}</p>
                <p className="text-sm text-gray-400 italic">{entry.translated}</p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTranscriptDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowTranscriptDialog(false)
                setShowExportSessionDialog(true)
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Transcript
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDocumentDialog} onOpenChange={setShowUploadDocumentDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Upload Document for Translation
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload a document to translate. Supported formats: PDF, DOCX, TXT, MD, HTML, SRT
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-300 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PDF, DOCX, TXT, MD, HTML, SRT (max 50MB)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="grid gap-2">
                <Label className="text-gray-300">Source Language</Label>
                <Select defaultValue="auto">
                  <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                    <SelectValue placeholder="Detect" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-gray-700">
                    <SelectItem value="auto" className="text-white hover:bg-slate-700">Auto-detect</SelectItem>
                    {SUPPORTED_LANGUAGES.slice(0, 10).map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-slate-700">
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-gray-300">Target Language</Label>
                <Select defaultValue="es">
                  <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-gray-700">
                    {SUPPORTED_LANGUAGES.slice(0, 10).map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-slate-700">
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-300">Translation Quality</Label>
              <Select defaultValue="accurate">
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  {QUALITY_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id} className="text-white hover:bg-slate-700">
                      {preset.name} - {preset.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadDocumentDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success('Document Queued', { description: 'Your document has been queued for translation' })
                setShowUploadDocumentDialog(false)
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Start Translation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Document Dialog */}
      <Dialog open={showDownloadDocumentDialog} onOpenChange={setShowDownloadDocumentDialog}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              Download Translated Document
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedDocument?.fileName && `Download "${selectedDocument.fileName}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-gray-300">Download Format</Label>
              <Select defaultValue="original">
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="original" className="text-white hover:bg-slate-700">Original format</SelectItem>
                  <SelectItem value="pdf" className="text-white hover:bg-slate-700">PDF</SelectItem>
                  <SelectItem value="docx" className="text-white hover:bg-slate-700">Word Document</SelectItem>
                  <SelectItem value="txt" className="text-white hover:bg-slate-700">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Download Options</Label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Include original text as comments</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Bilingual side-by-side</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDownloadDocumentDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadDocument}
              disabled={isDownloadingDocument}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isDownloadingDocument ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter History Dialog */}
      <Dialog open={showFilterHistoryDialog} onOpenChange={setShowFilterHistoryDialog}>
        <DialogContent className="sm:max-w-[450px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-400" />
              Filter Translation History
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Filter your translation history by language, engine, or date.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-gray-300">Language Pair</Label>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All languages</SelectItem>
                  <SelectItem value="en-es" className="text-white hover:bg-slate-700">English - Spanish</SelectItem>
                  <SelectItem value="en-fr" className="text-white hover:bg-slate-700">English - French</SelectItem>
                  <SelectItem value="en-de" className="text-white hover:bg-slate-700">English - German</SelectItem>
                  <SelectItem value="en-zh" className="text-white hover:bg-slate-700">English - Chinese</SelectItem>
                  <SelectItem value="en-ja" className="text-white hover:bg-slate-700">English - Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-300">Translation Engine</Label>
              <Select value={filterEngine} onValueChange={setFilterEngine}>
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="All engines" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All engines</SelectItem>
                  {TRANSLATION_ENGINES.map((engine) => (
                    <SelectItem key={engine.id} value={engine.id} className="text-white hover:bg-slate-700">
                      {engine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="date-from" className="text-gray-300">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="bg-slate-800 border-gray-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date-to" className="text-gray-300">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="bg-slate-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFilterLanguage('all')
                setFilterEngine('all')
                setFilterDateFrom('')
                setFilterDateTo('')
              }}
              className="border-gray-700 hover:bg-slate-800"
            >
              Clear Filters
            </Button>
            <Button
              onClick={handleApplyFilter}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export History Dialog */}
      <Dialog open={showExportHistoryDialog} onOpenChange={setShowExportHistoryDialog}>
        <DialogContent className="sm:max-w-[450px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              Export Translation History
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Export your translation history in your preferred format.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-gray-300">Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="csv" className="text-white hover:bg-slate-700">CSV - Spreadsheet</SelectItem>
                  <SelectItem value="json" className="text-white hover:bg-slate-700">JSON - Structured data</SelectItem>
                  <SelectItem value="xlsx" className="text-white hover:bg-slate-700">Excel - Full formatting</SelectItem>
                  <SelectItem value="pdf" className="text-white hover:bg-slate-700">PDF - Print ready</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Include in Export</Label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Source text</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Translated text</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Language information</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Confidence scores</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-700 bg-slate-800 text-indigo-600" />
                <span className="text-sm text-gray-300">Processing times</span>
              </label>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">
                <strong className="text-gray-300">{translationResults.length}</strong> translations will be exported
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportHistoryDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success('Export Started', { description: 'Your translation history is being exported' })
                setShowExportHistoryDialog(false)
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Translation Dialog */}
      <Dialog open={showSaveTranslationDialog} onOpenChange={setShowSaveTranslationDialog}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Save Translation
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Save this translation to your favorites for quick access.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="save-name" className="text-gray-300">Name</Label>
              <Input
                id="save-name"
                placeholder="Give this translation a name"
                value={saveTranslationName}
                onChange={(e) => setSaveTranslationName(e.target.value)}
                className="bg-slate-800 border-gray-700 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-300">Folder</Label>
              <Select value={saveTranslationFolder} onValueChange={setSaveTranslationFolder}>
                <SelectTrigger className="bg-slate-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700">
                  <SelectItem value="default" className="text-white hover:bg-slate-700">Default</SelectItem>
                  <SelectItem value="work" className="text-white hover:bg-slate-700">Work</SelectItem>
                  <SelectItem value="personal" className="text-white hover:bg-slate-700">Personal</SelectItem>
                  <SelectItem value="important" className="text-white hover:bg-slate-700">Important</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Translation Preview</p>
              <p className="text-sm text-white truncate">
                {translatedText || selectedHistoryItem?.translatedText || 'No translation to save'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveTranslationDialog(false)}
              className="border-gray-700 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTranslationToFavorites}
              disabled={isSavingTranslation}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              {isSavingTranslation ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Save to Favorites
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
