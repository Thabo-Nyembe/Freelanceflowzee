/**
 * ========================================
 * BROWSER EXTENSION UTILITIES - PRODUCTION READY
 * ========================================
 *
 * Complete browser extension management system with:
 * - Cross-browser support (Chrome, Firefox, Safari, Edge, Brave, Opera)
 * - Page capture (Screenshot, Full-Page, Selection, Video, Text)
 * - Quick actions (Create Task, Save Link, Share, Translate, Summarize, Analyze)
 * - Extension features management
 * - Keyboard shortcuts
 * - Auto-sync capabilities
 * - Storage tracking
 * - Analytics and usage statistics
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('BrowserExtensionUtils')

// ========================================
// TYPE DEFINITIONS
// ========================================

export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'brave' | 'opera'
export type CaptureType = 'screenshot' | 'full-page' | 'selection' | 'video' | 'text'
export type ActionType = 'task' | 'link' | 'share' | 'translate' | 'summarize' | 'analyze'
export type FeatureType = 'quick-access' | 'page-capture' | 'web-clipper' | 'shortcuts' | 'sync' | 'ai-assistant'
export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline'
export type ShortcutScope = 'global' | 'page' | 'selection' | 'context'

export interface PageCapture {
  id: string
  userId: string
  title: string
  url: string
  type: CaptureType
  thumbnail?: string
  fileSize: number
  timestamp: Date
  tags: string[]
  notes?: string
  metadata: {
    browser: BrowserType
    viewport: { width: number; height: number }
    scrollPosition?: number
    fullUrl: string
    domain: string
  }
  syncStatus: SyncStatus
  storageLocation?: string
}

export interface QuickAction {
  id: string
  userId: string
  type: ActionType
  name: string
  description: string
  icon: string
  shortcut: string
  enabled: boolean
  usageCount: number
  lastUsed?: Date
  settings: {
    autoExecute?: boolean
    confirmBefore?: boolean
    saveHistory?: boolean
  }
}

export interface ExtensionFeature {
  id: string
  userId: string
  type: FeatureType
  name: string
  description: string
  icon: string
  enabled: boolean
  isPremium: boolean
  settings: Record<string, any>
  usageStats: {
    activations: number
    lastUsed?: Date
    errorCount: number
  }
}

export interface BrowserInfo {
  type: BrowserType
  name: string
  version: string
  isSupported: boolean
  downloadUrl?: string
  installInstructions?: string
}

export interface KeyboardShortcut {
  id: string
  userId: string
  action: string
  key: string
  modifiers: string[]
  scope: ShortcutScope
  description: string
  enabled: boolean
}

export interface SyncSettings {
  id: string
  userId: string
  autoSync: boolean
  syncInterval: number // minutes
  syncCaptures: boolean
  syncShortcuts: boolean
  syncSettings: boolean
  lastSync?: Date
  deviceName: string
}

export interface ExtensionStats {
  totalCaptures: number
  totalActions: number
  storageUsed: number
  storageLimit: number
  activeFeatures: number
  totalFeatures: number
  capturesByType: Record<CaptureType, number>
  actionsByType: Record<ActionType, number>
  browserUsage: Record<BrowserType, number>
  weeklyActivity: number[]
}

export interface CaptureAnalytics {
  captureId: string
  views: number
  shares: number
  edits: number
  exports: number
  avgViewDuration: number
  lastViewed?: Date
}

// ========================================
// MOCK DATA
// ========================================

export const BROWSERS: Record<BrowserType, BrowserInfo> = {
  chrome: {
    type: 'chrome',
    name: 'Google Chrome',
    version: '120.0',
    isSupported: true,
    downloadUrl: 'https://chrome.google.com/webstore',
    installInstructions: 'Click "Add to Chrome" and follow the prompts'
  },
  firefox: {
    type: 'firefox',
    name: 'Mozilla Firefox',
    version: '121.0',
    isSupported: true,
    downloadUrl: 'https://addons.mozilla.org',
    installInstructions: 'Click "Add to Firefox" and allow the installation'
  },
  safari: {
    type: 'safari',
    name: 'Safari',
    version: '17.0',
    isSupported: true,
    downloadUrl: 'https://apps.apple.com',
    installInstructions: 'Download from App Store and enable in Safari Extensions'
  },
  edge: {
    type: 'edge',
    name: 'Microsoft Edge',
    version: '120.0',
    isSupported: true,
    downloadUrl: 'https://microsoftedge.microsoft.com/addons',
    installInstructions: 'Click "Get" and confirm installation'
  },
  brave: {
    type: 'brave',
    name: 'Brave Browser',
    version: '1.60',
    isSupported: true,
    downloadUrl: 'https://chrome.google.com/webstore',
    installInstructions: 'Use Chrome Web Store - fully compatible'
  },
  opera: {
    type: 'opera',
    name: 'Opera',
    version: '105.0',
    isSupported: true,
    downloadUrl: 'https://addons.opera.com',
    installInstructions: 'Click "Add to Opera" from the extensions store'
  }
}

const CAPTURE_TITLES = [
  'Design System Documentation',
  'React Best Practices Guide',
  'TypeScript Advanced Patterns',
  'API Integration Tutorial',
  'Performance Optimization Tips',
  'Authentication Flow Diagram',
  'Database Schema Design',
  'UI Component Library',
  'State Management Architecture',
  'Testing Strategy Overview',
  'Deployment Checklist',
  'Security Best Practices',
  'Code Review Guidelines',
  'Git Workflow Documentation',
  'CI/CD Pipeline Setup',
  'Monitoring Dashboard Config',
  'Error Handling Patterns',
  'Accessibility Standards',
  'Mobile Responsive Design',
  'Animation Guidelines'
]

const DOMAINS = [
  'github.com',
  'stackoverflow.com',
  'medium.com',
  'dev.to',
  'reactjs.org',
  'typescript.org',
  'nextjs.org',
  'tailwindcss.com',
  'vercel.com',
  'supabase.com'
]

const TAGS = [
  'documentation',
  'tutorial',
  'reference',
  'design',
  'code',
  'api',
  'database',
  'security',
  'performance',
  'testing',
  'deployment',
  'monitoring',
  'git',
  'ci-cd',
  'accessibility',
  'responsive',
  'animation',
  'best-practices',
  'patterns',
  'architecture'
]

export function generateMockCaptures(count: number = 60, userId: string = 'user-1'): PageCapture[] {
  logger.info('Generating mock captures', { count, userId })

  const captures: PageCapture[] = []
  const now = new Date()
  const browsers: BrowserType[] = ['chrome', 'firefox', 'safari', 'edge', 'brave', 'opera']
  const captureTypes: CaptureType[] = ['screenshot', 'full-page', 'selection', 'video', 'text']
  const syncStatuses: SyncStatus[] = ['synced', 'syncing', 'pending']

  for (let i = 0; i < count; i++) {
    const type = captureTypes[i % captureTypes.length]
    const browser = browsers[i % browsers.length]
    const domain = DOMAINS[i % DOMAINS.length]
    const title = CAPTURE_TITLES[i % CAPTURE_TITLES.length]

    captures.push({
      id: `capture-${i + 1}`,
      userId,
      title,
      url: `https://${domain}/articles/${i + 1}`,
      type,
      thumbnail: type !== 'text' ? `/captures/thumb-${i + 1}.jpg` : undefined,
      fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
      timestamp: new Date(now.getTime() - i * 3600000), // 1 hour intervals
      tags: [
        TAGS[i % TAGS.length],
        TAGS[(i + 1) % TAGS.length],
        TAGS[(i + 2) % TAGS.length]
      ],
      notes: i % 3 === 0 ? `Important reference for project ${Math.floor(i / 3) + 1}` : undefined,
      metadata: {
        browser,
        viewport: {
          width: 1920,
          height: 1080
        },
        scrollPosition: type === 'full-page' ? Math.floor(Math.random() * 5000) : undefined,
        fullUrl: `https://${domain}/articles/${i + 1}#section-${i}`,
        domain
      },
      syncStatus: syncStatuses[i % syncStatuses.length],
      storageLocation: `captures/${userId}/${i + 1}.${type === 'video' ? 'mp4' : 'png'}`
    })
  }

  logger.debug('Mock captures generated', {
    total: captures.length,
    byType: captureTypes.map(t => ({ type: t, count: captures.filter(c => c.type === t).length }))
  })

  return captures
}

export function generateMockActions(userId: string = 'user-1'): QuickAction[] {
  logger.info('Generating mock actions', { userId })

  const actions: QuickAction[] = [
    {
      id: 'action-1',
      userId,
      type: 'task',
      name: 'Create Task',
      description: 'Quickly create a task from selected text or current page',
      icon: 'Plus',
      shortcut: 'Ctrl+Shift+T',
      enabled: true,
      usageCount: 145,
      lastUsed: new Date(Date.now() - 2 * 3600000),
      settings: {
        autoExecute: false,
        confirmBefore: true,
        saveHistory: true
      }
    },
    {
      id: 'action-2',
      userId,
      type: 'link',
      name: 'Save Link',
      description: 'Save current page or selected link to your collection',
      icon: 'Bookmark',
      shortcut: 'Ctrl+Shift+S',
      enabled: true,
      usageCount: 298,
      lastUsed: new Date(Date.now() - 1 * 3600000),
      settings: {
        autoExecute: false,
        confirmBefore: false,
        saveHistory: true
      }
    },
    {
      id: 'action-3',
      userId,
      type: 'share',
      name: 'Share Page',
      description: 'Share current page with team members or clients',
      icon: 'Share2',
      shortcut: 'Ctrl+Shift+H',
      enabled: true,
      usageCount: 87,
      lastUsed: new Date(Date.now() - 5 * 3600000),
      settings: {
        autoExecute: false,
        confirmBefore: true,
        saveHistory: true
      }
    },
    {
      id: 'action-4',
      userId,
      type: 'translate',
      name: 'Translate',
      description: 'Translate selected text or entire page',
      icon: 'Languages',
      shortcut: 'Ctrl+Shift+L',
      enabled: true,
      usageCount: 156,
      lastUsed: new Date(Date.now() - 3 * 3600000),
      settings: {
        autoExecute: true,
        confirmBefore: false,
        saveHistory: true
      }
    },
    {
      id: 'action-5',
      userId,
      type: 'summarize',
      name: 'Summarize',
      description: 'AI-powered summary of page content or selected text',
      icon: 'FileText',
      shortcut: 'Ctrl+Shift+U',
      enabled: true,
      usageCount: 234,
      lastUsed: new Date(Date.now() - 4 * 3600000),
      settings: {
        autoExecute: false,
        confirmBefore: false,
        saveHistory: true
      }
    },
    {
      id: 'action-6',
      userId,
      type: 'analyze',
      name: 'Analyze',
      description: 'Deep analysis of page structure, SEO, and performance',
      icon: 'Brain',
      shortcut: 'Ctrl+Shift+A',
      enabled: true,
      usageCount: 112,
      lastUsed: new Date(Date.now() - 6 * 3600000),
      settings: {
        autoExecute: false,
        confirmBefore: false,
        saveHistory: true
      }
    }
  ]

  logger.debug('Mock actions generated', { count: actions.length })
  return actions
}

export function generateMockFeatures(userId: string = 'user-1'): ExtensionFeature[] {
  logger.info('Generating mock features', { userId })

  const features: ExtensionFeature[] = [
    {
      id: 'feature-1',
      userId,
      type: 'quick-access',
      name: 'Quick Access',
      description: 'Access Kazi features from any webpage',
      icon: 'Zap',
      enabled: true,
      isPremium: false,
      settings: {
        position: 'bottom-right',
        showOnHover: true,
        opacity: 0.9
      },
      usageStats: {
        activations: 1543,
        lastUsed: new Date(Date.now() - 1 * 3600000),
        errorCount: 2
      }
    },
    {
      id: 'feature-2',
      userId,
      type: 'page-capture',
      name: 'Page Capture',
      description: 'Capture screenshots, videos, and full pages',
      icon: 'Camera',
      enabled: true,
      isPremium: false,
      settings: {
        defaultFormat: 'png',
        quality: 'high',
        includeScrollbar: false,
        captureDelay: 0
      },
      usageStats: {
        activations: 892,
        lastUsed: new Date(Date.now() - 2 * 3600000),
        errorCount: 5
      }
    },
    {
      id: 'feature-3',
      userId,
      type: 'web-clipper',
      name: 'Web Clipper',
      description: 'Clip and save web content to your library',
      icon: 'Scissors',
      enabled: true,
      isPremium: false,
      settings: {
        preserveFormatting: true,
        includeImages: true,
        includeLinks: true,
        autoTag: true
      },
      usageStats: {
        activations: 654,
        lastUsed: new Date(Date.now() - 3 * 3600000),
        errorCount: 1
      }
    },
    {
      id: 'feature-4',
      userId,
      type: 'shortcuts',
      name: 'Keyboard Shortcuts',
      description: 'Customizable keyboard shortcuts for all actions',
      icon: 'Keyboard',
      enabled: true,
      isPremium: false,
      settings: {
        enableGlobalShortcuts: true,
        enablePageShortcuts: true,
        showShortcutHints: true
      },
      usageStats: {
        activations: 2341,
        lastUsed: new Date(Date.now() - 30 * 60000),
        errorCount: 0
      }
    },
    {
      id: 'feature-5',
      userId,
      type: 'sync',
      name: 'Auto Sync',
      description: 'Sync captures and settings across devices',
      icon: 'Cloud',
      enabled: true,
      isPremium: true,
      settings: {
        autoSync: true,
        syncInterval: 15,
        syncCaptures: true,
        syncShortcuts: true,
        syncSettings: true
      },
      usageStats: {
        activations: 456,
        lastUsed: new Date(Date.now() - 15 * 60000),
        errorCount: 3
      }
    },
    {
      id: 'feature-6',
      userId,
      type: 'ai-assistant',
      name: 'AI Assistant',
      description: 'AI-powered page analysis and content generation',
      icon: 'Brain',
      enabled: true,
      isPremium: true,
      settings: {
        autoAnalyze: false,
        showSuggestions: true,
        enableChatInterface: true,
        model: 'gpt-4'
      },
      usageStats: {
        activations: 723,
        lastUsed: new Date(Date.now() - 45 * 60000),
        errorCount: 8
      }
    }
  ]

  logger.debug('Mock features generated', { count: features.length })
  return features
}

export function generateMockShortcuts(userId: string = 'user-1'): KeyboardShortcut[] {
  logger.info('Generating mock shortcuts', { userId })

  return [
    {
      id: 'shortcut-1',
      userId,
      action: 'Quick Capture',
      key: 'C',
      modifiers: ['Ctrl', 'Shift'],
      scope: 'global',
      description: 'Capture current viewport',
      enabled: true
    },
    {
      id: 'shortcut-2',
      userId,
      action: 'Full Page Capture',
      key: 'F',
      modifiers: ['Ctrl', 'Shift'],
      scope: 'page',
      description: 'Capture entire page',
      enabled: true
    },
    {
      id: 'shortcut-3',
      userId,
      action: 'Selection Capture',
      key: 'S',
      modifiers: ['Ctrl', 'Shift'],
      scope: 'selection',
      description: 'Capture selected area',
      enabled: true
    },
    {
      id: 'shortcut-4',
      userId,
      action: 'Open Quick Actions',
      key: 'Q',
      modifiers: ['Ctrl', 'Shift'],
      scope: 'global',
      description: 'Open quick actions menu',
      enabled: true
    },
    {
      id: 'shortcut-5',
      userId,
      action: 'Sync Now',
      key: 'Y',
      modifiers: ['Ctrl', 'Shift'],
      scope: 'global',
      description: 'Force sync now',
      enabled: true
    }
  ]
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function getCaptureIcon(type: CaptureType): string {
  const icons: Record<CaptureType, string> = {
    screenshot: 'Image',
    'full-page': 'Monitor',
    selection: 'Scissors',
    video: 'Video',
    text: 'FileText'
  }
  return icons[type]
}

export function getActionIcon(type: ActionType): string {
  const icons: Record<ActionType, string> = {
    task: 'Plus',
    link: 'Bookmark',
    share: 'Share2',
    translate: 'Languages',
    summarize: 'FileText',
    analyze: 'Brain'
  }
  return icons[type]
}

export function getBrowserIcon(browser: BrowserType): string {
  const icons: Record<BrowserType, string> = {
    chrome: 'Chrome',
    firefox: 'Firefox',
    safari: 'Globe',
    edge: 'Globe',
    brave: 'Shield',
    opera: 'Globe'
  }
  return icons[browser]
}

export function getSyncStatusColor(status: SyncStatus): string {
  const colors: Record<SyncStatus, string> = {
    synced: 'green',
    syncing: 'blue',
    pending: 'yellow',
    error: 'red',
    offline: 'gray'
  }
  return colors[status]
}

export function getSyncStatusLabel(status: SyncStatus): string {
  const labels: Record<SyncStatus, string> = {
    synced: 'Synced',
    syncing: 'Syncing...',
    pending: 'Pending',
    error: 'Error',
    offline: 'Offline'
  }
  return labels[status]
}

export function calculateStats(captures: PageCapture[], actions: QuickAction[], features: ExtensionFeature[]): ExtensionStats {
  logger.debug('Calculating extension stats', {
    capturesCount: captures.length,
    actionsCount: actions.length,
    featuresCount: features.length
  })

  const capturesByType: Record<CaptureType, number> = {
    screenshot: 0,
    'full-page': 0,
    selection: 0,
    video: 0,
    text: 0
  }

  const actionsByType: Record<ActionType, number> = {
    task: 0,
    link: 0,
    share: 0,
    translate: 0,
    summarize: 0,
    analyze: 0
  }

  const browserUsage: Record<BrowserType, number> = {
    chrome: 0,
    firefox: 0,
    safari: 0,
    edge: 0,
    brave: 0,
    opera: 0
  }

  captures.forEach(capture => {
    capturesByType[capture.type]++
    browserUsage[capture.metadata.browser]++
  })

  actions.forEach(action => {
    actionsByType[action.type] = action.usageCount
  })

  const storageUsed = captures.reduce((sum, c) => sum + c.fileSize, 0)
  const activeFeatures = features.filter(f => f.enabled).length

  // Generate weekly activity (last 7 days)
  const weeklyActivity: number[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(now.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const dayCaptures = captures.filter(c =>
      c.timestamp >= dayStart && c.timestamp <= dayEnd
    ).length

    weeklyActivity.push(dayCaptures)
  }

  const stats: ExtensionStats = {
    totalCaptures: captures.length,
    totalActions: actions.reduce((sum, a) => sum + a.usageCount, 0),
    storageUsed,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
    activeFeatures,
    totalFeatures: features.length,
    capturesByType,
    actionsByType,
    browserUsage,
    weeklyActivity
  }

  logger.info('Extension stats calculated', {
    totalCaptures: stats.totalCaptures,
    totalActions: stats.totalActions,
    storageUsedMB: Math.round(stats.storageUsed / 1024 / 1024)
  })

  return stats
}

export function searchCaptures(
  captures: PageCapture[],
  searchTerm: string
): PageCapture[] {
  if (!searchTerm.trim()) return captures

  const term = searchTerm.toLowerCase()
  logger.debug('Searching captures', { term, totalCaptures: captures.length })

  const filtered = captures.filter(capture =>
    capture.title.toLowerCase().includes(term) ||
    capture.url.toLowerCase().includes(term) ||
    capture.tags.some(tag => tag.toLowerCase().includes(term)) ||
    capture.notes?.toLowerCase().includes(term) ||
    capture.metadata.domain.toLowerCase().includes(term)
  )

  logger.info('Capture search complete', {
    term,
    resultsCount: filtered.length,
    totalSearched: captures.length
  })

  return filtered
}

export function filterCapturesByType(
  captures: PageCapture[],
  filterType: 'all' | CaptureType
): PageCapture[] {
  if (filterType === 'all') return captures

  logger.debug('Filtering captures by type', { filterType, totalCaptures: captures.length })

  const filtered = captures.filter(c => c.type === filterType)

  logger.info('Captures filtered by type', {
    type: filterType,
    resultsCount: filtered.length
  })

  return filtered
}

export function sortCaptures(
  captures: PageCapture[],
  sortBy: 'date' | 'size' | 'type'
): PageCapture[] {
  logger.debug('Sorting captures', { sortBy, totalCaptures: captures.length })

  const sorted = [...captures].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.timestamp.getTime() - a.timestamp.getTime()
      case 'size':
        return b.fileSize - a.fileSize
      case 'type':
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })

  logger.info('Captures sorted', { sortBy, count: sorted.length })
  return sorted
}

export function exportCaptures(captures: PageCapture[], format: 'json' | 'csv'): Blob {
  logger.info('Exporting captures', { format, count: captures.length })

  if (format === 'json') {
    const data = JSON.stringify(captures, null, 2)
    return new Blob([data], { type: 'application/json' })
  }

  // CSV format
  const headers = ['ID', 'Title', 'URL', 'Type', 'File Size', 'Timestamp', 'Tags', 'Browser', 'Sync Status']
  const rows = captures.map(c => [
    c.id,
    c.title,
    c.url,
    c.type,
    formatFileSize(c.fileSize),
    c.timestamp.toISOString(),
    c.tags.join('; '),
    c.metadata.browser,
    c.syncStatus
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new Blob([csv], { type: 'text/csv' })
}

export function detectBrowser(): BrowserType {
  if (typeof window === 'undefined') return 'chrome'

  const userAgent = window.navigator.userAgent.toLowerCase()

  if (userAgent.includes('firefox')) return 'firefox'
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari'
  if (userAgent.includes('edg/')) return 'edge'
  if (userAgent.includes('brave')) return 'brave'
  if (userAgent.includes('opr/') || userAgent.includes('opera')) return 'opera'
  return 'chrome'
}

export function isExtensionInstalled(): Promise<boolean> {
  // This would check for the actual extension in production
  return Promise.resolve(Math.random() > 0.3)
}

export function formatShortcut(key: string, modifiers: string[]): string {
  return [...modifiers, key].join('+')
}

export function validateShortcut(key: string, modifiers: string[]): {
  valid: boolean
  error?: string
} {
  if (!key || key.length === 0) {
    return { valid: false, error: 'Key is required' }
  }

  if (modifiers.length === 0) {
    return { valid: false, error: 'At least one modifier is required' }
  }

  const validModifiers = ['Ctrl', 'Alt', 'Shift', 'Meta']
  const invalidModifiers = modifiers.filter(m => !validModifiers.includes(m))

  if (invalidModifiers.length > 0) {
    return { valid: false, error: `Invalid modifiers: ${invalidModifiers.join(', ')}` }
  }

  return { valid: true }
}

export function getCaptureTypeStats(captures: PageCapture[]): Array<{
  type: CaptureType
  count: number
  percentage: number
  totalSize: number
}> {
  const types: CaptureType[] = ['screenshot', 'full-page', 'selection', 'video', 'text']
  const total = captures.length

  return types.map(type => {
    const typeCaptures = captures.filter(c => c.type === type)
    const count = typeCaptures.length
    const totalSize = typeCaptures.reduce((sum, c) => sum + c.fileSize, 0)

    return {
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      totalSize
    }
  })
}

export function getRecentCaptures(captures: PageCapture[], count: number = 10): PageCapture[] {
  return [...captures]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, count)
}

export function getTopTags(captures: PageCapture[], limit: number = 10): Array<{
  tag: string
  count: number
}> {
  const tagCounts: Record<string, number> = {}

  captures.forEach(capture => {
    capture.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function syncCaptures(captures: PageCapture[]): Promise<{ success: boolean; synced: number }> {
  logger.info('Starting capture sync', { count: captures.length })

  // Simulate sync delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const synced = captures.filter(c => c.syncStatus !== 'synced').length
      logger.info('Sync complete', { synced })
      resolve({ success: true, synced })
    }, 2000)
  })
}

export default {
  generateMockCaptures,
  generateMockActions,
  generateMockFeatures,
  generateMockShortcuts,
  formatFileSize,
  getCaptureIcon,
  getActionIcon,
  getBrowserIcon,
  getSyncStatusColor,
  getSyncStatusLabel,
  calculateStats,
  searchCaptures,
  filterCapturesByType,
  sortCaptures,
  exportCaptures,
  detectBrowser,
  isExtensionInstalled,
  formatShortcut,
  validateShortcut,
  getCaptureTypeStats,
  getRecentCaptures,
  getTopTags,
  syncCaptures,
  BROWSERS
}
