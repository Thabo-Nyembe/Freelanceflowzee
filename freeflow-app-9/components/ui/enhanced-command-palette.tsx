'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  FileText,
  BarChart3,
  Users,
  Video,
  Camera,
  DollarSign,
  Clock,
  Palette,
  Zap,
  Brain,
  Globe,
  Briefcase,
  Home,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Share2,
  Copy,
  Star,
  Heart,
  BookOpen,
  Target,
  Lightbulb,
  Sparkles
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  action: () => void
  shortcut?: string
  category: string
  keywords?: string[]
}

interface EnhancedCommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function EnhancedCommandPalette({ 
  open = false, 
  onOpenChange,
  className 
}: EnhancedCommandPaletteProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(open)

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  const runCommand = React.useCallback((command: () => unknown) => {
    setIsOpen(false)
    command()
  }, [])

  // Define all available commands
  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      description: 'Go to main dashboard',
      icon: Home,
      action: () => router.push('/dashboard'),
      shortcut: '⌘D',
      category: 'Navigation',
      keywords: ['home', 'main', 'overview']
    },
    {
      id: 'nav-ai-create',
      title: 'AI Create Studio',
      description: 'Generate content with AI',
      icon: Brain,
      action: () => router.push('/dashboard/ai-create'),
      shortcut: '⌘A',
      category: 'Navigation',
      keywords: ['ai', 'generate', 'create', 'content']
    },
    {
      id: 'nav-analytics',
      title: 'Analytics Dashboard',
      description: 'View analytics and insights',
      icon: BarChart3,
      action: () => router.push('/dashboard/analytics'),
      shortcut: '⌘R',
      category: 'Navigation',
      keywords: ['analytics', 'reports', 'insights', 'data']
    },
    {
      id: 'nav-canvas',
      title: 'Canvas Studio',
      description: 'Design and collaborate',
      icon: Palette,
      action: () => router.push('/dashboard/canvas'),
      category: 'Navigation',
      keywords: ['design', 'canvas', 'collaborate', 'create']
    },
    {
      id: 'nav-video',
      title: 'Video Studio',
      description: 'Edit and produce videos',
      icon: Video,
      action: () => router.push('/dashboard/video-studio'),
      category: 'Navigation',
      keywords: ['video', 'edit', 'studio', 'production']
    },
    {
      id: 'nav-financial',
      title: 'Financial Hub',
      description: 'Manage payments and finances',
      icon: DollarSign,
      action: () => router.push('/dashboard/financial-hub'),
      category: 'Navigation',
      keywords: ['finance', 'payment', 'money', 'billing']
    },
    {
      id: 'nav-community',
      title: 'Community Hub',
      description: 'Connect with community',
      icon: Users,
      action: () => router.push('/dashboard/community-hub'),
      category: 'Navigation',
      keywords: ['community', 'social', 'network', 'connect']
    },
    {
      id: 'nav-gallery',
      title: 'Gallery Studio',
      description: 'Manage media and portfolio',
      icon: Camera,
      action: () => router.push('/dashboard/gallery'),
      category: 'Navigation',
      keywords: ['gallery', 'media', 'portfolio', 'images']
    },
    {
      id: 'nav-booking',
      title: 'Booking System',
      description: 'Manage appointments',
      icon: Calendar,
      action: () => router.push('/dashboard/booking'),
      category: 'Navigation',
      keywords: ['booking', 'appointment', 'calendar', 'schedule']
    },
    {
      id: 'nav-time-tracking',
      title: 'Time Tracking',
      description: 'Track time and productivity',
      icon: Clock,
      action: () => router.push('/dashboard/time-tracking'),
      category: 'Navigation',
      keywords: ['time', 'tracking', 'productivity', 'timer']
    },

    // Quick Actions
    {
      id: 'action-new-project',
      title: 'Create New Project',
      description: 'Start a new project',
      icon: Plus,
      action: () => console.log('Create new project'),
      shortcut: '⌘N',
      category: 'Actions',
      keywords: ['new', 'create', 'project', 'start']
    },
    {
      id: 'action-search',
      title: 'Global Search',
      description: 'Search across all content',
      icon: Search,
      action: () => console.log('Global search'),
      shortcut: '⌘F',
      category: 'Actions',
      keywords: ['search', 'find', 'lookup']
    },
    {
      id: 'action-settings',
      title: 'Settings',
      description: 'Open application settings',
      icon: Settings,
      action: () => console.log('Open settings'),
      shortcut: '⌘,',
      category: 'Actions',
      keywords: ['settings', 'preferences', 'config']
    },

    // Tools
    {
      id: 'tool-calculator',
      title: 'Calculator',
      description: 'Quick calculations',
      icon: Calculator,
      action: () => console.log('Open calculator'),
      category: 'Tools',
      keywords: ['calculator', 'math', 'calculate']
    },
    {
      id: 'tool-color-picker',
      title: 'Color Picker',
      description: 'Pick and manage colors',
      icon: Palette,
      action: () => console.log('Color picker'),
      category: 'Tools',
      keywords: ['color', 'picker', 'palette', 'design']
    },

    // Recent Items
    {
      id: 'recent-project-1',
      title: 'E-commerce Platform',
      description: 'Recently worked on project',
      icon: Briefcase,
      action: () => console.log('Open recent project'),
      category: 'Recent',
      keywords: ['recent', 'project', 'ecommerce']
    },
    {
      id: 'recent-design-1',
      title: 'Brand Identity Design',
      description: 'Recently edited design',
      icon: Sparkles,
      action: () => console.log('Open recent design'),
      category: 'Recent',
      keywords: ['recent', 'design', 'brand']
    },
  ]

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, CommandItem[]>)

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        className={`relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search commands...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Command Dialog */}
      <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {Object.entries(groupedCommands).map(([category, items], index) => (
            <React.Fragment key={category}>
              <CommandGroup heading={category}>
                {items.map((command) => {
                  const Icon = command.icon
                  return (
                    <CommandItem
                      key={command.id}
                      value={`${command.title} ${command.description} ${command.keywords?.join(' ')}`}
                      onSelect={() => runCommand(command.action)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium">{command.title}</div>
                        {command.description && (
                          <div className="text-xs text-muted-foreground">
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.shortcut && (
                        <CommandShortcut>{command.shortcut}</CommandShortcut>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {index < Object.entries(groupedCommands).length - 1 && (
                <CommandSeparator />
              )}
            </React.Fragment>
          ))}
          
          {/* Quick Tips */}
          <CommandSeparator />
          <CommandGroup heading="Tips">
            <CommandItem disabled>
              <Lightbulb className="mr-2 h-4 w-4" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">
                  Use ⌘K to open this command palette anytime
                </div>
              </div>
            </CommandItem>
            <CommandItem disabled>
              <Target className="mr-2 h-4 w-4" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">
                  Type keywords to quickly find what you need
                </div>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

// Hook for using the command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const open = React.useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    toggle,
    open,
    close,
    setIsOpen,
  }
}



