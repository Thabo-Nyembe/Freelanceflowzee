'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Command, 
  Keyboard, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Plus,
  Search,
  Settings,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface KeyboardShortcut {
  id: string
  keys: string[]
  description: string
  category: 'navigation' | 'actions' | 'editing' | 'global' | 'custom'
  action: () => void
  enabled?: boolean
  context?: string
}

interface KeyboardNavigationProps {
  shortcuts?: KeyboardShortcut[]
  showIndicator?: boolean
  enableGlobalShortcuts?: boolean
  className?: string
}

// Default keyboard shortcuts
const defaultShortcuts: KeyboardShortcut[] = [
  // Global shortcuts
  {
    id: 'search',
    keys: ['cmd', 'k'],
    description: 'Open search',
    category: 'global',
    action: () => {
      const searchInput = document.querySelector('[data-testid="enhanced-search-input"]') as HTMLInputElement
      searchInput?.focus()
    }
  },
  {
    id: 'help',
    keys: ['shift', '?'],
    description: 'Show keyboard shortcuts',
    category: 'global',
    action: () => {
      // Will be handled by the component
    }
  },
  {
    id: 'dashboard',
    keys: ['g', 'd'],
    description: 'Go to dashboard',
    category: 'navigation',
    action: () => window.location.href = '/dashboard'
  },
  {
    id: 'projects',
    keys: ['g', 'p'],
    description: 'Go to projects',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/projects-hub-v2'
  },
  {
    id: 'files',
    keys: ['g', 'f'],
    description: 'Go to files',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/files-hub-v2'
  },
  {
    id: 'analytics',
    keys: ['g', 'a'],
    description: 'Go to analytics',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/analytics-v2'
  },
  {
    id: 'settings',
    keys: ['g', 's'],
    description: 'Go to settings',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/settings-v2'
  },
  // Actions
  {
    id: 'refresh',
    keys: ['cmd', 'r'],
    description: 'Refresh page',
    category: 'actions',
    action: () => window.location.reload()
  },
  {
    id: 'new-project',
    keys: ['cmd', 'n'],
    description: 'Create new project',
    category: 'actions',
    action: () => {
      const createBtn = document.querySelector('[data-testid="create-project-btn"]') as HTMLButtonElement
      createBtn?.click()
    }
  },
  {
    id: 'save',
    keys: ['cmd', 's'],
    description: 'Save current work',
    category: 'actions',
    action: () => {
      const saveBtn = document.querySelector('[data-testid*="save"]') as HTMLButtonElement
      saveBtn?.click()
    }
  },
  // Editing
  {
    id: 'undo',
    keys: ['cmd', 'z'],
    description: 'Undo last action',
    category: 'editing',
    action: () => document.execCommand('undo')
  },
  {
    id: 'redo',
    keys: ['cmd', 'shift', 'z'],
    description: 'Redo last action',
    category: 'editing',
    action: () => document.execCommand('redo')
  },
  {
    id: 'copy',
    keys: ['cmd', 'c'],
    description: 'Copy selection',
    category: 'editing',
    action: () => document.execCommand('copy')
  },
  {
    id: 'paste',
    keys: ['cmd', 'v'],
    description: 'Paste from clipboard',
    category: 'editing',
    action: () => document.execCommand('paste')
  }
]

// Key combination parser
const parseKeyCombo = (keys: string[]): { key: string; modifiers: string[] } => {
  const modifiers: string[] = []
  let key = ''

  keys.forEach(k => {
    const lower = k.toLowerCase()
    if (['cmd', 'ctrl', 'alt', 'shift', 'meta'].includes(lower)) {
      modifiers.push(lower)
    } else {
      key = lower
    }
  })

  return { key, modifiers }
}

// Check if key combination matches
const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
  const { key, modifiers } = parseKeyCombo(shortcut.keys)
  
  const eventKey = event.key.toLowerCase()
  const hasCmd = event.metaKey || event.ctrlKey
  const hasAlt = event.altKey
  const hasShift = event.shiftKey

  // Special case for '?' which is shift+/
  if (shortcut.keys.includes('?') && eventKey === '?' && hasShift) {
    return true
  }

  // Check key match
  if (eventKey !== key && key !== eventKey) return false

  // Check modifiers
  const requiredCmd = modifiers.includes('cmd') || modifiers.includes('ctrl') || modifiers.includes('meta')
  const requiredAlt = modifiers.includes('alt')
  const requiredShift = modifiers.includes('shift')

  return (
    hasCmd === requiredCmd &&
    hasAlt === requiredAlt &&
    hasShift === requiredShift
  )
}

// Format key combination for display
const formatKeyCombo = (keys: string[]): React.ReactNode[] => {
  const keyMap: Record<string, React.ReactNode> = {
    cmd: <Command className="h-3 w-3" />,
    ctrl: <span className="text-xs font-bold">⌃</span>,
    alt: <span className="text-xs font-bold">⌥</span>,
    shift: <span className="text-xs font-bold">⇧</span>,
    enter: <span className="text-xs font-bold">↩</span>,
    escape: 'Esc',
    arrowup: <ArrowUp className="h-3 w-3" />,
    arrowdown: <ArrowDown className="h-3 w-3" />,
    arrowleft: <ArrowLeft className="h-3 w-3" />,
    arrowright: <ArrowRight className="h-3 w-3" />,
    space: <span className="text-xs font-bold">␣</span>,
    tab: <span className="text-xs font-bold">⇥</span>,
    backspace: <span className="text-xs font-bold">⌫</span>,
    delete: <span className="text-xs font-bold">⌦</span>,
    home: <span className="text-xs font-bold">↖</span>,
    end: <span className="text-xs font-bold">↘</span>,
    pageup: <span className="text-xs font-bold">⇞</span>,
    pagedown: <span className="text-xs font-bold">⇟</span>
  }

  return keys.map((key, index) => (
    <React.Fragment key={key}>
      <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
        {keyMap[key.toLowerCase()] || key.toUpperCase()}
      </kbd>
      {index < keys.length - 1 && <span className="mx-1">+</span>}
    </React.Fragment>
  ))
}

// Keyboard navigation hook
export function useKeyboardNavigation(shortcuts: KeyboardShortcut[] = []) {
  const [isEnabled, setIsEnabled] = React.useState(true)
  const [activeShortcuts, setActiveShortcuts] = React.useState<KeyboardShortcut[]>([])
  const [pressedKeys, setPressedKeys] = React.useState<Set<string>>(new Set())

  const allShortcuts = React.useMemo(() => {
    return [...defaultShortcuts, ...shortcuts].filter(s => s.enabled !== false)
  }, [shortcuts])

  React.useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return
      }

      // Update pressed keys
      setPressedKeys(prev => new Set([...prev, event.key.toLowerCase()]))

      // Check for matching shortcuts
      const matchingShortcut = allShortcuts.find(shortcut => matchesShortcut(event, shortcut))
      
      if (matchingShortcut) {
        event.preventDefault()
        event.stopPropagation()
        
        if (matchingShortcut.id === 'help') {
          // Special handling for help shortcut
          setActiveShortcuts(allShortcuts)
        } else {
          matchingShortcut.action()
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(event.key.toLowerCase())
        return newSet
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isEnabled, allShortcuts])

  return {
    isEnabled,
    setIsEnabled,
    activeShortcuts,
    setActiveShortcuts,
    pressedKeys,
    shortcuts: allShortcuts
  }
}

// Keyboard shortcuts help dialog
export function KeyboardShortcutsDialog({ 
  shortcuts, 
  open, 
  onOpenChange 
}: { 
  shortcuts: KeyboardShortcut[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [searchTerm, setSearchTerm] = React.useState('')

  const filteredShortcuts = React.useMemo(() => {
    if (!searchTerm) return shortcuts

    return shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [shortcuts, searchTerm])

  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {}
    
    filteredShortcuts.forEach(shortcut => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = []
      }
      groups[shortcut.category].push(shortcut)
    })

    return groups
  }, [filteredShortcuts])

  const categoryIcons: Record<string, React.ReactNode> = {
    global: <Zap className="h-4 w-4" />,
    navigation: <ArrowRight className="h-4 w-4" />,
    actions: <Plus className="h-4 w-4" />,
    editing: <Settings className="h-4 w-4" />,
    custom: <Command className="h-4 w-4" />
  }

  const categoryLabels: Record<string, string> = {
    global: 'Global',
    navigation: 'Navigation',
    actions: 'Actions',
    editing: 'Editing',
    custom: 'Custom'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5" />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Shortcuts list */}
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <div className="flex items-center space-x-2 mb-3">
                    {categoryIcons[category]}
                    <h3 className="font-semibold text-lg">
                      {categoryLabels[category] || category}
                    </h3>
                    <Badge variant="outline">
                      {categoryShortcuts.length}
                    </Badge>
                  </div>

                  <div className="grid gap-2">
                    {categoryShortcuts.map((shortcut) => (
                      <motion.div
                        key={shortcut.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {shortcut.description}
                          </p>
                          {shortcut.context && (
                            <p className="text-xs text-gray-500 mt-1">
                              Context: {shortcut.context}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {formatKeyCombo(shortcut.keys)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredShortcuts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Keyboard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No shortcuts found matching "{searchTerm}"</p>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t pt-4 text-center text-sm text-gray-500">
            <p>Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Shift + ?</kbd> anytime to open this dialog</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Keyboard indicator component
export function KeyboardIndicator({ 
  shortcuts, 
  pressedKeys, 
  className 
}: { 
  shortcuts: KeyboardShortcut[];
  pressedKeys: Set<string>;
  className?: string;
}) {
  const [showIndicator, setShowIndicator] = React.useState(false)

  React.useEffect(() => {
    const hasModifier = Array.from(pressedKeys).some(key => 
      ['meta', 'ctrl', 'alt', 'shift'].includes(key.toLowerCase())
    )
    setShowIndicator(hasModifier && pressedKeys.size > 0)
  }, [pressedKeys])

  const potentialShortcuts = React.useMemo(() => {
    if (pressedKeys.size === 0) return []

    return shortcuts.filter(shortcut => {
      const { modifiers } = parseKeyCombo(shortcut.keys)
      return modifiers.some(mod => 
        pressedKeys.has(mod) || 
        (mod === 'cmd' && (pressedKeys.has('meta') || pressedKeys.has('ctrl')))
      )
    }).slice(0, 5)
  }, [shortcuts, pressedKeys])

  return (
    <AnimatePresence>
      {showIndicator && potentialShortcuts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={cn(
            "fixed bottom-4 right-4 z-50 max-w-sm",
            className
          )}
        >
          <Card className="bg-black/90 text-white border-gray-700">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-medium">
                  <Keyboard className="h-3 w-3" />
                  <span>Available shortcuts</span>
                </div>
                {potentialShortcuts.map((shortcut) => (
                  <div key={shortcut.id} className="flex items-center justify-between text-xs">
                    <span className="truncate">{shortcut.description}</span>
                    <div className="flex items-center space-x-1 ml-2">
                      {formatKeyCombo(shortcut.keys)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Main keyboard navigation component
export function EnhancedKeyboardNavigation({
  shortcuts = [],
  showIndicator = true,
  enableGlobalShortcuts = true,
  className
}: KeyboardNavigationProps) {
  const [showHelp, setShowHelp] = React.useState(false)
  
  const {
    isEnabled,
    setIsEnabled,
    pressedKeys,
    shortcuts: allShortcuts
  } = useKeyboardNavigation(shortcuts)

  // Override help shortcut to show dialog
  const enhancedShortcuts = React.useMemo(() => {
    return allShortcuts.map(shortcut => {
      if (shortcut.id === 'help') {
        return {
          ...shortcut,
          action: () => setShowHelp(true)
        }
      }
      return shortcut
    })
  }, [allShortcuts])

  React.useEffect(() => {
    setIsEnabled(enableGlobalShortcuts)
  }, [enableGlobalShortcuts, setIsEnabled])

  return (
    <TooltipProvider>
      <div className={className}>
        {/* Keyboard shortcuts help */}
        <KeyboardShortcutsDialog
          shortcuts={enhancedShortcuts}
          open={showHelp}
          onOpenChange={setShowHelp}
        />

        {/* Keyboard indicator */}
        {showIndicator && (
          <KeyboardIndicator
            shortcuts={enhancedShortcuts}
            pressedKeys={pressedKeys}
          />
        )}

        {/* Toggle button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="fixed bottom-4 left-4 z-40 opacity-50 hover:opacity-100 transition-opacity"
              data-testid="keyboard-shortcuts-btn"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Keyboard shortcuts (Shift + ?)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export default EnhancedKeyboardNavigation
