/**
 * Browser Extension Utilities
 * Helper functions and mock data for extension management
 */

import {
  BrowserInfo,
  BrowserType,
  ExtensionFeatureInfo,
  QuickAction,
  PageCapture,
  ExtensionStats,
  BrowserExtension,
  ContextMenuAction
} from './browser-extension-types'

export const SUPPORTED_BROWSERS: BrowserInfo[] = [
  {
    type: 'chrome',
    name: 'Google Chrome',
    version: '120.0',
    icon: '🌐',
    marketUrl: 'https://chrome.google.com/webstore',
    supported: true,
    minVersion: '100.0'
  },
  {
    type: 'firefox',
    name: 'Mozilla Firefox',
    version: '121.0',
    icon: '🦊',
    marketUrl: 'https://addons.mozilla.org',
    supported: true,
    minVersion: '100.0'
  },
  {
    type: 'safari',
    name: 'Safari',
    version: '17.0',
    icon: '🧭',
    marketUrl: 'https://apps.apple.com/safari-extensions',
    supported: true,
    minVersion: '15.0'
  },
  {
    type: 'edge',
    name: 'Microsoft Edge',
    version: '120.0',
    icon: '🌊',
    marketUrl: 'https://microsoftedge.microsoft.com/addons',
    supported: true,
    minVersion: '100.0'
  },
  {
    type: 'brave',
    name: 'Brave Browser',
    version: '1.60',
    icon: '🦁',
    marketUrl: 'https://chrome.google.com/webstore',
    supported: true,
    minVersion: '1.50'
  },
  {
    type: 'opera',
    name: 'Opera',
    version: '105.0',
    icon: '🎭',
    marketUrl: 'https://addons.opera.com',
    supported: true,
    minVersion: '100.0'
  }
]

export const EXTENSION_FEATURES: ExtensionFeatureInfo[] = [
  {
    id: 'quick-access',
    name: 'Quick Access',
    description: 'Access KAZI from any webpage with one click',
    enabled: true,
    icon: '⚡',
    shortcut: 'Alt+K'
  },
  {
    id: 'page-capture',
    name: 'Page Capture',
    description: 'Screenshot and record any webpage',
    enabled: true,
    icon: '📸',
    shortcut: 'Alt+Shift+S'
  },
  {
    id: 'web-clipper',
    name: 'Web Clipper',
    description: 'Save web content directly to your workspace',
    enabled: true,
    icon: '✂️',
    shortcut: 'Alt+Shift+C'
  },
  {
    id: 'shortcuts',
    name: 'Keyboard Shortcuts',
    description: 'Perform actions with custom shortcuts',
    enabled: true,
    icon: '⌨️'
  },
  {
    id: 'sync',
    name: 'Auto Sync',
    description: 'Automatically sync captured content',
    enabled: true,
    icon: '🔄'
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'AI-powered page analysis and summaries',
    enabled: false,
    icon: '🤖',
    shortcut: 'Alt+Shift+A'
  }
]

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'action-1',
    type: 'create-task',
    name: 'Create Task',
    description: 'Create a task from current page',
    icon: '✓',
    shortcut: 'Alt+T',
    enabled: true
  },
  {
    id: 'action-2',
    type: 'save-link',
    name: 'Save Link',
    description: 'Save current page to your library',
    icon: '🔖',
    shortcut: 'Alt+S',
    enabled: true
  },
  {
    id: 'action-3',
    type: 'share',
    name: 'Share',
    description: 'Share page with your team',
    icon: '🔗',
    shortcut: 'Alt+Shift+S',
    enabled: true
  },
  {
    id: 'action-4',
    type: 'translate',
    name: 'Translate',
    description: 'Translate selected text',
    icon: '🌍',
    shortcut: 'Alt+Shift+T',
    enabled: true
  },
  {
    id: 'action-5',
    type: 'summarize',
    name: 'Summarize',
    description: 'AI summary of page content',
    icon: '📝',
    shortcut: 'Alt+Shift+M',
    enabled: false
  },
  {
    id: 'action-6',
    type: 'analyze',
    name: 'Analyze',
    description: 'Analyze page with AI',
    icon: '🔍',
    shortcut: 'Alt+Shift+A',
    enabled: false
  }
]

export const CONTEXT_MENU_ACTIONS: ContextMenuAction[] = [
  {
    id: 'context-1',
    label: 'Save to KAZI',
    icon: '💾',
    contexts: ['page', 'selection', 'link', 'image'],
    action: 'save-link',
    enabled: true
  },
  {
    id: 'context-2',
    label: 'Create Task',
    icon: '✓',
    contexts: ['selection'],
    action: 'create-task',
    enabled: true
  },
  {
    id: 'context-3',
    label: 'Translate',
    icon: '🌍',
    contexts: ['selection'],
    action: 'translate',
    enabled: true
  },
  {
    id: 'context-4',
    label: 'Summarize',
    icon: '📝',
    contexts: ['page', 'selection'],
    action: 'summarize',
    enabled: false
  }
]

export const MOCK_PAGE_CAPTURES: PageCapture[] = [
  {
    id: 'capture-1',
    type: 'screenshot',
    url: 'https://example.com/design',
    title: 'Design Inspiration Gallery',
    timestamp: new Date(Date.now() - 3600000),
    fileUrl: '/captures/design-gallery.png',
    fileSize: 2048576,
    tags: ['design', 'inspiration']
  },
  {
    id: 'capture-2',
    type: 'full-page',
    url: 'https://example.com/docs',
    title: 'API Documentation',
    timestamp: new Date(Date.now() - 7200000),
    fileUrl: '/captures/api-docs.png',
    fileSize: 4096000,
    tags: ['documentation', 'api'],
    notes: 'Important API reference'
  },
  {
    id: 'capture-3',
    type: 'selection',
    url: 'https://example.com/article',
    title: 'Tech News Article',
    timestamp: new Date(Date.now() - 10800000),
    fileUrl: '/captures/article-section.png',
    fileSize: 512000,
    tags: ['article', 'tech']
  }
]

export const MOCK_EXTENSION_STATS: ExtensionStats = {
  totalCaptures: 145,
  totalClips: 78,
  totalQuickActions: 312,
  storageUsed: 524288000,
  storageLimit: 1073741824,
  lastSync: new Date(Date.now() - 300000),
  capturesByType: {
    screenshot: 89,
    'full-page': 32,
    selection: 18,
    video: 4,
    text: 2
  },
  actionsByType: {
    'create-task': 125,
    'save-link': 98,
    share: 45,
    translate: 32,
    summarize: 8,
    analyze: 4
  }
}

export const MOCK_BROWSER_EXTENSION: BrowserExtension = {
  id: 'ext-1',
  name: 'KAZI Browser Extension',
  version: '2.5.0',
  description: 'Quick access to KAZI features from any webpage',
  icon: '/extension-icon.png',
  status: 'not-installed',
  browser: 'chrome',
  features: EXTENSION_FEATURES,
  permissions: [
    {
      id: 'perm-1',
      name: 'Active Tab',
      description: 'Access current tab information',
      required: true,
      granted: false,
      type: 'tabs'
    },
    {
      id: 'perm-2',
      name: 'Storage',
      description: 'Store extension settings',
      required: true,
      granted: false,
      type: 'storage'
    },
    {
      id: 'perm-3',
      name: 'Notifications',
      description: 'Show desktop notifications',
      required: false,
      granted: false,
      type: 'notifications'
    },
    {
      id: 'perm-4',
      name: 'Clipboard',
      description: 'Copy content to clipboard',
      required: false,
      granted: false,
      type: 'clipboard'
    }
  ],
  fileSize: 2457600,
  rating: 4.8,
  downloads: 125430
}

// Helper Functions
export function getBrowserIcon(browserType: BrowserType): string {
  const browser = SUPPORTED_BROWSERS.find(b => b.type === browserType)
  return browser?.icon || '🌐'
}

export function getBrowserName(browserType: BrowserType): string {
  const browser = SUPPORTED_BROWSERS.find(b => b.type === browserType)
  return browser?.name || 'Unknown Browser'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatStoragePercentage(used: number, limit: number): number {
  return Math.round((used / limit) * 100)
}

export function getStatusColor(status: BrowserExtension['status']): string {
  const colors = {
    'not-installed': 'text-gray-500',
    installed: 'text-blue-500',
    active: 'text-green-500',
    disabled: 'text-red-500',
    updating: 'text-yellow-500'
  }
  return colors[status]
}

export function getStatusLabel(status: BrowserExtension['status']): string {
  const labels = {
    'not-installed': 'Not Installed',
    installed: 'Installed',
    active: 'Active',
    disabled: 'Disabled',
    updating: 'Updating...'
  }
  return labels[status]
}

export function detectBrowser(): BrowserType {
  if (typeof window === 'undefined') return 'chrome'

  const ua = window.navigator.userAgent.toLowerCase()

  if (ua.includes('firefox')) return 'firefox'
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari'
  if (ua.includes('edg')) return 'edge'
  if (ua.includes('brave')) return 'brave'
  if (ua.includes('opera') || ua.includes('opr')) return 'opera'

  return 'chrome'
}

export function isBrowserSupported(browserType: BrowserType): boolean {
  const browser = SUPPORTED_BROWSERS.find(b => b.type === browserType)
  return browser?.supported || false
}

export function getInstallUrl(browserType: BrowserType): string {
  const browser = SUPPORTED_BROWSERS.find(b => b.type === browserType)
  return browser?.marketUrl || '#'
}

export function validateShortcut(key: string, modifiers: string[]): boolean {
  if (!key) return false
  if (modifiers.length === 0) return false
  return true
}

export function formatShortcut(key: string, modifiers: string[]): string {
  return [...modifiers, key].join('+')
}

export function getCaptureTypeIcon(type: PageCapture['type']): string {
  const icons = {
    screenshot: '📸',
    'full-page': '📄',
    selection: '✂️',
    video: '🎥',
    text: '📝'
  }
  return icons[type] || '📁'
}

export function getActionTypeIcon(type: QuickAction['type']): string {
  const icons = {
    'create-task': '✓',
    'save-link': '🔖',
    share: '🔗',
    translate: '🌍',
    summarize: '📝',
    analyze: '🔍'
  }
  return icons[type] || '⚡'
}

export function sortCapturesByDate(captures: PageCapture[]): PageCapture[] {
  return [...captures].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function filterCapturesByType(captures: PageCapture[], type: PageCapture['type']): PageCapture[] {
  return captures.filter(c => c.type === type)
}

export function searchCaptures(captures: PageCapture[], query: string): PageCapture[] {
  const lowercaseQuery = query.toLowerCase()
  return captures.filter(c =>
    c.title.toLowerCase().includes(lowercaseQuery) ||
    c.url.toLowerCase().includes(lowercaseQuery) ||
    c.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function estimateInstallTime(): string {
  return '~30 seconds'
}
