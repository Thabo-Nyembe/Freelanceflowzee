"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useHotkeys } from "react-hotkeys-hook"

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Icons
import {
  Keyboard,
  Accessibility,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Type,
  Contrast,
  Palette,
  Mouse,
  Zap,
  HelpCircle,
  Settings,
  Command,
  Option,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Enter,
  Space,
  Tab,
  Shift,
  Control,
  Alt,
  Escape,
  Plus,
  Minus,
  Save,
  Copy,
  Cut,
  Undo,
  Redo,
  Search,
  Filter,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Mic,
  Square,
  CirclePlay,
  FileText,
  MessageCircle,
  Star,
  Check,
  X
} from "lucide-react"

// Types
export interface KeyboardShortcut {
  id: string
  name: string
  description: string
  keys: string[]
  category: "navigation" | "editing" | "media" | "comments" | "general" | "accessibility"
  action: () => void
  isEnabled: boolean
  customizable: boolean
  platform?: "mac" | "windows" | "all"
}

export interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: number
  fontFamily: "default" | "serif" | "monospace" | "dyslexic"
  focusVisible: boolean
  screenReaderSupport: boolean
  keyboardNavigation: boolean
  voiceAnnouncements: boolean
  colorBlindSupport: "none" | "protanopia" | "deuteranopia" | "tritanopia"
  customTheme: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    accentColor: string
  }
  soundEffects: boolean
  hapticFeedback: boolean
  autoplayMedia: boolean
  captionsEnabled: boolean
  audioDescriptions: boolean
}

interface KeyboardShortcutsAccessibilityProps {
  onShortcutTriggered?: (shortcutId: string) => void
  onAccessibilityChange?: (settings: AccessibilitySettings) => void
  className?: string
}

const defaultAccessibilitySettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 14,
  fontFamily: "default",
  focusVisible: true,
  screenReaderSupport: false,
  keyboardNavigation: true,
  voiceAnnouncements: false,
  colorBlindSupport: "none",
  customTheme: {
    primaryColor: "#6366f1",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    accentColor: "#8b5cf6"
  },
  soundEffects: true,
  hapticFeedback: true,
  autoplayMedia: false,
  captionsEnabled: false,
  audioDescriptions: false
}

export function KeyboardShortcutsAccessibility({
  onShortcutTriggered,
  onAccessibilityChange,
  className
}: KeyboardShortcutsAccessibilityProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings)
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([])
  const [isCustomizingShortcut, setIsCustomizingShortcut] = useState<string | null>(null)
  const [newShortcutKeys, setNewShortcutKeys] = useState<string[]>([])
  const [isRecordingKeys, setIsRecordingKeys] = useState(false)
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [focusedElement, setFocusedElement] = useState<string | null>(null)

  const shortcutHelpRef = useRef<HTMLDivElement>(null)
  const announceRef = useRef<HTMLDivElement>(null)

  // Initialize shortcuts
  useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      // Navigation
      {
        id: "focus-search",
        name: "Focus Search",
        description: "Focus on the search input field",
        keys: ["ctrl+f", "cmd+f"],
        category: "navigation",
        action: () => {
          const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement
          searchInput?.focus()
          announce("Search field focused")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "next-comment",
        name: "Next Comment",
        description: "Navigate to the next comment",
        keys: ["j", "down"],
        category: "navigation",
        action: () => {
          announce("Next comment")
          onShortcutTriggered?.("next-comment")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "prev-comment",
        name: "Previous Comment",
        description: "Navigate to the previous comment",
        keys: ["k", "up"],
        category: "navigation",
        action: () => {
          announce("Previous comment")
          onShortcutTriggered?.("prev-comment")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "close-modal",
        name: "Close Modal",
        description: "Close the currently open modal or dialog",
        keys: ["escape"],
        category: "navigation",
        action: () => {
          setIsHelpOpen(false)
          setIsCustomizingShortcut(null)
          announce("Modal closed")
        },
        isEnabled: true,
        customizable: false
      },
      {
        id: "help",
        name: "Show Help",
        description: "Open the keyboard shortcuts help dialog",
        keys: ["?", "ctrl+?", "cmd+?"],
        category: "general",
        action: () => {
          setIsHelpOpen(true)
          announce("Help dialog opened")
        },
        isEnabled: true,
        customizable: true
      },

      // Editing
      {
        id: "new-comment",
        name: "New Comment",
        description: "Start creating a new comment",
        keys: ["c", "ctrl+enter", "cmd+enter"],
        category: "comments",
        action: () => {
          announce("New comment mode")
          onShortcutTriggered?.("new-comment")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "save-comment",
        name: "Save Comment",
        description: "Save the current comment",
        keys: ["ctrl+s", "cmd+s"],
        category: "editing",
        action: () => {
          announce("Comment saved")
          onShortcutTriggered?.("save-comment")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "cancel-edit",
        name: "Cancel Edit",
        description: "Cancel the current edit operation",
        keys: ["escape"],
        category: "editing",
        action: () => {
          announce("Edit cancelled")
          onShortcutTriggered?.("cancel-edit")
        },
        isEnabled: true,
        customizable: false
      },

      // Media
      {
        id: "play-pause",
        name: "Play/Pause",
        description: "Toggle playback of media content",
        keys: ["space"],
        category: "media",
        action: () => {
          announce("Media playback toggled")
          onShortcutTriggered?.("play-pause")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "record-voice",
        name: "Record Voice",
        description: "Start or stop voice recording",
        keys: ["r", "ctrl+r", "cmd+r"],
        category: "media",
        action: () => {
          announce("Voice recording toggled")
          onShortcutTriggered?.("record-voice")
        },
        isEnabled: true,
        customizable: true
      },

      // Comments
      {
        id: "reply-comment",
        name: "Reply to Comment",
        description: "Reply to the selected comment",
        keys: ["r"],
        category: "comments",
        action: () => {
          announce("Reply mode")
          onShortcutTriggered?.("reply-comment")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "resolve-comment",
        name: "Resolve Comment",
        description: "Mark the selected comment as resolved",
        keys: ["ctrl+d", "cmd+d"],
        category: "comments",
        action: () => {
          announce("Comment resolved")
          onShortcutTriggered?.("resolve-comment")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "star-comment",
        name: "Star Comment",
        description: "Add or remove star from comment",
        keys: ["s"],
        category: "comments",
        action: () => {
          announce("Comment starred")
          onShortcutTriggered?.("star-comment")
        },
        isEnabled: true,
        customizable: true
      },

      // General
      {
        id: "zoom-in",
        name: "Zoom In",
        description: "Increase zoom level",
        keys: ["ctrl+=", "cmd+="],
        category: "general",
        action: () => {
          announce("Zoom increased")
          onShortcutTriggered?.("zoom-in")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "zoom-out",
        name: "Zoom Out",
        description: "Decrease zoom level",
        keys: ["ctrl+-", "cmd+-"],
        category: "general",
        action: () => {
          announce("Zoom decreased")
          onShortcutTriggered?.("zoom-out")
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "reset-zoom",
        name: "Reset Zoom",
        description: "Reset zoom to 100%",
        keys: ["ctrl+0", "cmd+0"],
        category: "general",
        action: () => {
          announce("Zoom reset")
          onShortcutTriggered?.("reset-zoom")
        },
        isEnabled: true,
        customizable: true
      },

      // Accessibility
      {
        id: "toggle-high-contrast",
        name: "Toggle High Contrast",
        description: "Toggle high contrast mode",
        keys: ["ctrl+alt+h"],
        category: "accessibility",
        action: () => {
          setAccessibilitySettings(prev => {
            const newSettings = { ...prev, highContrast: !prev.highContrast }
            announce(newSettings.highContrast ? "High contrast enabled" : "High contrast disabled")
            return newSettings
          })
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "increase-font-size",
        name: "Increase Font Size",
        description: "Increase the font size",
        keys: ["ctrl+shift+=", "cmd+shift+="],
        category: "accessibility",
        action: () => {
          setAccessibilitySettings(prev => {
            const newSize = Math.min(prev.fontSize + 2, 24)
            announce(`Font size increased to ${newSize}`)
            return { ...prev, fontSize: newSize }
          })
        },
        isEnabled: true,
        customizable: true
      },
      {
        id: "decrease-font-size",
        name: "Decrease Font Size",
        description: "Decrease the font size",
        keys: ["ctrl+shift+-", "cmd+shift+-"],
        category: "accessibility",
        action: () => {
          setAccessibilitySettings(prev => {
            const newSize = Math.max(prev.fontSize - 2, 10)
            announce(`Font size decreased to ${newSize}`)
            return { ...prev, fontSize: newSize }
          })
        },
        isEnabled: true,
        customizable: true
      }
    ]

    setShortcuts(defaultShortcuts)
  }, [onShortcutTriggered])

  // Register all shortcuts
  shortcuts.forEach(shortcut => {
    if (shortcut.isEnabled) {
      shortcut.keys.forEach(key => {
        useHotkeys(key, shortcut.action, {
          enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"],
          preventDefault: true
        })
      })
    }
  })

  // Announce function for screen readers
  const announce = useCallback((message: string) => {
    if (accessibilitySettings.voiceAnnouncements) {
      setAnnouncements(prev => [...prev.slice(-4), message])

      // Also use ARIA live region
      if (announceRef.current) {
        announceRef.current.textContent = message
      }
    }
  }, [accessibilitySettings.voiceAnnouncements])

  // Update accessibility settings
  const updateAccessibilitySettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setAccessibilitySettings(prev => {
      const newSettings = { ...prev, ...updates }
      onAccessibilityChange?.(newSettings)
      return newSettings
    })
  }, [onAccessibilityChange])

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement

    // High contrast
    if (accessibilitySettings.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Reduced motion
    if (accessibilitySettings.reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }

    // Font size
    root.style.setProperty("--ups-font-size", `${accessibilitySettings.fontSize}px`)

    // Font family
    const fontFamilies = {
      default: "system-ui, -apple-system, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      monospace: "'Monaco', 'Menlo', monospace",
      dyslexic: "'OpenDyslexic', sans-serif"
    }
    root.style.setProperty("--ups-font-family", fontFamilies[accessibilitySettings.fontFamily])

    // Custom theme
    root.style.setProperty("--ups-primary", accessibilitySettings.customTheme.primaryColor)
    root.style.setProperty("--ups-background", accessibilitySettings.customTheme.backgroundColor)
    root.style.setProperty("--ups-text", accessibilitySettings.customTheme.textColor)
    root.style.setProperty("--ups-accent", accessibilitySettings.customTheme.accentColor)

    // Color blind support
    if (accessibilitySettings.colorBlindSupport !== "none") {
      root.classList.add(`colorblind-${accessibilitySettings.colorBlindSupport}`)
    } else {
      root.classList.remove("colorblind-protanopia", "colorblind-deuteranopia", "colorblind-tritanopia")
    }

  }, [accessibilitySettings])

  // Handle key recording for shortcut customization
  useEffect(() => {
    if (!isRecordingKeys) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const keys = []
      if (e.ctrlKey || e.metaKey) keys.push(e.metaKey ? "cmd" : "ctrl")
      if (e.altKey) keys.push("alt")
      if (e.shiftKey) keys.push("shift")

      if (e.key !== "Control" && e.key !== "Alt" && e.key !== "Shift" && e.key !== "Meta") {
        keys.push(e.key.toLowerCase())
      }

      if (keys.length > 0) {
        setNewShortcutKeys(keys)
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)
    return () => document.removeEventListener("keydown", handleKeyDown, true)
  }, [isRecordingKeys])

  // Focus management
  const handleFocusChange = useCallback((elementId: string) => {
    setFocusedElement(elementId)
    if (accessibilitySettings.voiceAnnouncements) {
      announce(`Focused on ${elementId}`)
    }
  }, [accessibilitySettings.voiceAnnouncements, announce])

  // Get icon for keyboard key
  const getKeyIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case "ctrl": return Control
      case "cmd": return Command
      case "alt": return Alt
      case "shift": return Shift
      case "enter": return Enter
      case "space": return Space
      case "tab": return Tab
      case "escape": return Escape
      case "up": return ArrowUp
      case "down": return ArrowDown
      case "left": return ArrowLeft
      case "right": return ArrowRight
      case "+": case "=": return Plus
      case "-": return Minus
      default: return null
    }
  }

  // Render keyboard shortcut
  const renderShortcut = (keys: string[]) => (
    <div className="flex items-center space-x-1">
      {keys.map((key, index) => {
        const Icon = getKeyIcon(key)
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-muted-foreground">+</span>}
            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">
              {Icon ? <Icon className="w-3 h-3" /> : key}
            </kbd>
          </React.Fragment>
        )
      })}
    </div>
  )

  // Group shortcuts by category
  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = []
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  return (
    <div className={className}>
      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Visual announcements for testing */}
      {announcements.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 space-y-1">
          {announcements.slice(-3).map((announcement, index) => (
            <motion.div
              key={`${announcement}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-md shadow-lg"
            >
              {announcement}
            </motion.div>
          ))}
        </div>
      )}

      {/* Help trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-4 right-4 z-40"
        aria-label="Open keyboard shortcuts help"
      >
        <Keyboard className="w-4 h-4 mr-2" />
        Shortcuts
      </Button>

      {/* Shortcuts and Accessibility Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Accessibility className="w-5 h-5 mr-2" />
              Keyboard Shortcuts & Accessibility
            </DialogTitle>
            <DialogDescription>
              Customize keyboard shortcuts and accessibility settings for better usability
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="shortcuts" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shortcuts">Keyboard Shortcuts</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="customization">Customization</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="shortcuts" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg capitalize">{category} Shortcuts</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {categoryShortcuts.map(shortcut => (
                              <div key={shortcut.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm">{shortcut.name}</span>
                                    {!shortcut.isEnabled && (
                                      <Badge variant="secondary" className="text-xs">Disabled</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {shortcut.description}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  {renderShortcut(shortcut.keys)}
                                  {shortcut.customizable && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setIsCustomizingShortcut(shortcut.id)}
                                    >
                                      <Settings className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="accessibility" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {/* Visual Accessibility */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Eye className="w-5 h-5 mr-2" />
                          Visual Accessibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="high-contrast">High Contrast Mode</Label>
                          <Switch
                            id="high-contrast"
                            checked={accessibilitySettings.highContrast}
                            onCheckedChange={(checked) => updateAccessibilitySettings({ highContrast: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="reduced-motion">Reduce Motion</Label>
                          <Switch
                            id="reduced-motion"
                            checked={accessibilitySettings.reducedMotion}
                            onCheckedChange={(checked) => updateAccessibilitySettings({ reducedMotion: checked })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Font Size: {accessibilitySettings.fontSize}px</Label>
                          <Slider
                            value={[accessibilitySettings.fontSize]}
                            onValueChange={([size]) => updateAccessibilitySettings({ fontSize: size })}
                            max={24}
                            min={10}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select
                            value={accessibilitySettings.fontFamily}
                            onValueChange={(value) => updateAccessibilitySettings({ fontFamily: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default (Sans-serif)</SelectItem>
                              <SelectItem value="serif">Serif</SelectItem>
                              <SelectItem value="monospace">Monospace</SelectItem>
                              <SelectItem value="dyslexic">Dyslexic-friendly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Color Blind Support</Label>
                          <Select
                            value={accessibilitySettings.colorBlindSupport}
                            onValueChange={(value) => updateAccessibilitySettings({ colorBlindSupport: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                              <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                              <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Motor Accessibility */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Mouse className="w-5 h-5 mr-2" />
                          Motor Accessibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
                          <Switch
                            id="keyboard-nav"
                            checked={accessibilitySettings.keyboardNavigation}
                            onCheckedChange={(checked) => updateAccessibilitySettings({ keyboardNavigation: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="focus-visible">Visible Focus Indicators</Label>
                          <Switch
                            id="focus-visible"
                            checked={accessibilitySettings.focusVisible}
                            onCheckedChange={(checked) => updateAccessibilitySettings({ focusVisible: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="haptic">Haptic Feedback</Label>
                          <Switch
                            id="haptic"
                            checked={accessibilitySettings.hapticFeedback}
                            onCheckedChange={(checked) => updateAccessibilitySettings({ hapticFeedback: checked })}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Audio Accessibility */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Volume2 className="w-5 h-5 mr-2" />
                          Audio Accessibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="voice-announcements">Voice Announcements</Label>
                          <Switch
                            id="voice-announcements"
                            checked={accessibilitySettings.voiceAnnouncements}
                            onCheckedChange={(checked) => updateAccessibilitySettings({ voiceAnnouncements: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="sound-effects">Sound Effects</Label>
                          <Switch
                            id="sound-effects"
                            checked={accessibilitySettings.soundEffects}
                            onCheckedChange={(checked) => updateAccessibilitySettings({ soundEffects: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="captions">Enable Captions</Label>
                          <Switch
                            id="captions"
                            checked={accessibilitySettings.captionsEnabled}
                            onCheckedChange={(checked) => updateAccessibilitySettings({ captionsEnabled: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="audio-descriptions">Audio Descriptions</Label>
                          <Switch
                            id="audio-descriptions"
                            checked={accessibilitySettings.audioDescriptions}
                            onCheckedChange={(checked) => updateAccessibilitySettings({ audioDescriptions: checked })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="customization" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Palette className="w-5 h-5 mr-2" />
                          Custom Theme
                        </CardTitle>
                        <CardDescription>
                          Customize colors to improve visibility and comfort
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Primary Color</Label>
                            <Input
                              type="color"
                              value={accessibilitySettings.customTheme.primaryColor}
                              onChange={(e) => updateAccessibilitySettings({
                                customTheme: {
                                  ...accessibilitySettings.customTheme,
                                  primaryColor: e.target.value
                                }
                              })}
                            />
                          </div>
                          <div>
                            <Label>Background Color</Label>
                            <Input
                              type="color"
                              value={accessibilitySettings.customTheme.backgroundColor}
                              onChange={(e) => updateAccessibilitySettings({
                                customTheme: {
                                  ...accessibilitySettings.customTheme,
                                  backgroundColor: e.target.value
                                }
                              })}
                            />
                          </div>
                          <div>
                            <Label>Text Color</Label>
                            <Input
                              type="color"
                              value={accessibilitySettings.customTheme.textColor}
                              onChange={(e) => updateAccessibilitySettings({
                                customTheme: {
                                  ...accessibilitySettings.customTheme,
                                  textColor: e.target.value
                                }
                              })}
                            />
                          </div>
                          <div>
                            <Label>Accent Color</Label>
                            <Input
                              type="color"
                              value={accessibilitySettings.customTheme.accentColor}
                              onChange={(e) => updateAccessibilitySettings({
                                customTheme: {
                                  ...accessibilitySettings.customTheme,
                                  accentColor: e.target.value
                                }
                              })}
                            />
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => updateAccessibilitySettings({
                            customTheme: defaultAccessibilitySettings.customTheme
                          })}
                        >
                          Reset to Default
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Export/Import Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Settings Management</CardTitle>
                        <CardDescription>
                          Export or import your accessibility settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const blob = new Blob([JSON.stringify(accessibilitySettings, null, 2)], { type: 'application/json' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = 'ups-accessibility-settings.json'
                              a.click()
                              URL.revokeObjectURL(url)
                            }}
                          >
                            Export Settings
                          </Button>
                          <input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = (e) => {
                                  try {
                                    const settings = JSON.parse(e.target?.result as string)
                                    updateAccessibilitySettings(settings)
                                    announce("Settings imported successfully")
                                  } catch (error) {
                                    announce("Failed to import settings")
                                  }
                                }
                                reader.readAsText(file)
                              }
                            }}
                            className="hidden"
                            id="import-settings"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('import-settings')?.click()}
                          >
                            Import Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Shortcut Customization Dialog */}
      <Dialog open={!!isCustomizingShortcut} onOpenChange={() => setIsCustomizingShortcut(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Keyboard Shortcut</DialogTitle>
            <DialogDescription>
              Press the key combination you want to use for this shortcut
            </DialogDescription>
          </DialogHeader>

          {isCustomizingShortcut && (() => {
            const shortcut = shortcuts.find(s => s.id === isCustomizingShortcut)
            if (!shortcut) return null

            return (
              <div className="space-y-4">
                <div>
                  <Label>Shortcut: {shortcut.name}</Label>
                  <p className="text-sm text-muted-foreground">{shortcut.description}</p>
                </div>

                <div>
                  <Label>Current Keys</Label>
                  <div className="mt-1">
                    {renderShortcut(shortcut.keys)}
                  </div>
                </div>

                <div>
                  <Label>New Keys</Label>
                  <div className="mt-1 p-3 border rounded-md min-h-[60px] flex items-center justify-center">
                    {isRecordingKeys ? (
                      <div className="text-center">
                        <div className="animate-pulse text-primary">Press keys...</div>
                        {newShortcutKeys.length > 0 && (
                          <div className="mt-2">
                            {renderShortcut(newShortcutKeys)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button onClick={() => setIsRecordingKeys(true)}>
                        Record New Shortcut
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCustomizingShortcut(null)
                      setIsRecordingKeys(false)
                      setNewShortcutKeys([])
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (newShortcutKeys.length > 0) {
                        setShortcuts(prev => prev.map(s =>
                          s.id === isCustomizingShortcut
                            ? { ...s, keys: newShortcutKeys }
                            : s
                        ))
                        announce("Shortcut updated")
                      }
                      setIsCustomizingShortcut(null)
                      setIsRecordingKeys(false)
                      setNewShortcutKeys([])
                    }}
                    disabled={newShortcutKeys.length === 0}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}