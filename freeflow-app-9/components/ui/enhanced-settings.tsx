'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  Palette,
  Bell,
  Shield,
  Globe,
  Keyboard,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  ExternalLink,
  Check,
  X,
  AlertTriangle,
  Info,
  Zap,
  Clock,
  User,
  Mail,
  Lock,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced Settings Category
interface SettingsCategory {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  badge?: string | number
}

interface EnhancedSettingsCategoriesProps {
  categories: SettingsCategory[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
  className?: string
}

export function EnhancedSettingsCategories({
  categories,
  activeCategory,
  onCategoryChange,
  className
}: EnhancedSettingsCategoriesProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors hover:bg-muted/50',
                isActive && 'bg-primary/10 text-primary border border-primary/20'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <div>
                  <div className="text-sm font-medium">{category.label}</div>
                  {category.description && (
                    <div className="text-xs text-muted-foreground">
                      {category.description}
                    </div>
                  )}
                </div>
              </div>
              
              {category.badge && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {category.badge}
                </Badge>
              )}
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Enhanced Theme Selector
interface Theme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    background: string
    foreground: string
  }
  preview?: string
}

interface EnhancedThemeSelectorProps {
  themes: Theme[]
  currentTheme: string
  onThemeChange: (themeId: string) => void
  className?: string
}

export function EnhancedThemeSelector({
  themes,
  currentTheme,
  onThemeChange,
  className
}: EnhancedThemeSelectorProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme & Appearance
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Theme Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Color Mode</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor }
            ].map((mode) => {
              const Icon = mode.icon
              const isActive = currentTheme.includes(mode.id)
              
              return (
                <button
                  key={mode.id}
                  onClick={() => onThemeChange(mode.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors hover:bg-muted/50',
                    isActive ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        <Separator />
        
        {/* Color Themes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Color Theme</Label>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => {
              const isActive = currentTheme === theme.id
              
              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors hover:bg-muted/50',
                    isActive ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  {/* Color Preview */}
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">{theme.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {theme.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        <Separator />
        
        {/* Display Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Display</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Compact Mode</div>
                <div className="text-xs text-muted-foreground">
                  Reduce spacing and padding
                </div>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">High Contrast</div>
                <div className="text-xs text-muted-foreground">
                  Increase contrast for better visibility
                </div>
              </div>
              <Switch />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Font Size</div>
                <div className="text-xs text-muted-foreground">16px</div>
              </div>
              <Slider defaultValue={[16]} min={12} max={24} step={1} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Keyboard Shortcuts Settings
interface KeyboardShortcut {
  id: string
  label: string
  description: string
  keys: string[]
  category: string
  customizable?: boolean
}

interface EnhancedKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
  onShortcutChange?: (shortcutId: string, keys: string[]) => void
  onReset?: () => void
  className?: string
}

export function EnhancedKeyboardShortcuts({
  shortcuts,
  onShortcutChange,
  onReset,
  className
}: EnhancedKeyboardShortcutsProps) {
  const [editingShortcut, setEditingShortcut] = React.useState<string | null>(null)
  const [recordingKeys, setRecordingKeys] = React.useState<string[]>([])

  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {}
    shortcuts.forEach(shortcut => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = []
      }
      groups[shortcut.category].push(shortcut)
    })
    return groups
  }, [shortcuts])

  const formatKeys = (keys: string[]) => {
    return keys.filter(key => key).map(key => {
      // Convert common key names to symbols
      const keyMap: Record<string, string> = {
        'cmd': '⌘',
        'ctrl': '⌃',
        'alt': '⌥',
        'shift': '⇧',
        'enter': '↩',
        'space': '␣',
        'tab': '⇥',
        'backspace': '⌫',
        'delete': '⌦',
        'escape': '⎋',
        'up': '↑',
        'down': '↓',
        'left': '←',
        'right': '→'
      }
      return keyMap[key.toLowerCase()] || key.toUpperCase()
    }).join('')
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <div key={category} className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {category}
            </div>
            
            <div className="space-y-2">
              {categoryShortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{shortcut.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {shortcut.description}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">
                      {formatKeys(shortcut.keys)}
                    </kbd>
                    
                    {shortcut.customizable && onShortcutChange && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingShortcut(shortcut.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Shortcut Recording Modal */}
        {editingShortcut && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-lg">Record New Shortcut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Press the keys you want to use for this shortcut
                </div>
                
                <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg text-center">
                  <kbd className="text-lg font-mono">
                    {recordingKeys.length > 0 ? formatKeys(recordingKeys) : 'Press keys...'}
                  </kbd>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingShortcut(null)
                      setRecordingKeys([])
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (recordingKeys.length > 0) {
                        onShortcutChange?.(editingShortcut, recordingKeys)
                      }
                      setEditingShortcut(null)
                      setRecordingKeys([])
                    }}
                    disabled={recordingKeys.length === 0}
                  >
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Notification Settings
interface NotificationSetting {
  id: string
  label: string
  description: string
  type: 'toggle' | 'select' | 'time'
  value: any
  options?: Array<{ label: string; value: any }>
  category: string
}

interface EnhancedNotificationSettingsProps {
  settings: NotificationSetting[]
  onSettingChange: (settingId: string, value: any) => void
  className?: string
}

export function EnhancedNotificationSettings({
  settings,
  onSettingChange,
  className
}: EnhancedNotificationSettingsProps) {
  // Group settings by category
  const groupedSettings = React.useMemo(() => {
    const groups: Record<string, NotificationSetting[]> = {}
    settings.forEach(setting => {
      if (!groups[setting.category]) {
        groups[setting.category] = []
      }
      groups[setting.category].push(setting)
    })
    return groups
  }, [settings])

  const renderSettingControl = (setting: NotificationSetting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <Switch
            checked={setting.value}
            onCheckedChange={(checked) => onSettingChange(setting.id, checked)}
          />
        )
      
      case 'select':
        return (
          <Select
            value={setting.value}
            onValueChange={(value) => onSettingChange(setting.id, value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'time':
        return (
          <Input
            type="time"
            value={setting.value}
            onChange={(e) => onSettingChange(setting.id, e.target.value)}
            className="w-32"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <div key={category} className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {category}
            </div>
            
            <div className="space-y-3">
              {categorySettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{setting.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {setting.description}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {renderSettingControl(setting)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <Separator />
        
        {/* Notification Test */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Test Notifications</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Send Test Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Settings Export/Import
interface EnhancedSettingsDataProps {
  onExport: () => void
  onImport: (data: any) => void
  onReset: () => void
  className?: string
}

export function EnhancedSettingsData({
  onExport,
  onImport,
  onReset,
  className
}: EnhancedSettingsDataProps) {
  const [importData, setImportData] = React.useState('')
  const [showImport, setShowImport] = React.useState(false)

  const handleImport = () => {
    try {
      const data = JSON.parse(importData)
      onImport(data)
      setImportData('')
      setShowImport(false)
    } catch (error) {
      console.error('Invalid JSON data')
    }
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Settings Data
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Button variant="outline" onClick={onExport} className="justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
            <span className="text-xs text-muted-foreground ml-auto">
              Save as JSON
            </span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowImport(true)}
            className="justify-start"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Settings
            <span className="text-xs text-muted-foreground ml-auto">
              Load from JSON
            </span>
          </Button>
          
          <Button
            variant="destructive"
            onClick={onReset}
            className="justify-start"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Reset All Settings
            <span className="text-xs text-muted-foreground ml-auto">
              Restore defaults
            </span>
          </Button>
        </div>
        
        {/* Import Modal */}
        {showImport && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
            <Label className="text-sm font-medium">Import Settings JSON</Label>
            <textarea
              className="w-full h-32 p-3 text-sm border rounded-lg bg-background"
              placeholder="Paste your settings JSON here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowImport(false)
                  setImportData('')
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={!importData.trim()}
              >
                Import
              </Button>
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Info className="h-3 w-3" />
            <span>Settings are automatically saved to your browser</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3" />
            <span>Resetting will permanently delete all custom settings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



