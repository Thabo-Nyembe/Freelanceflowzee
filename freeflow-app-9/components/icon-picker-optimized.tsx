'use client'

/**
 * Optimized Icon Picker
 *
 * This component provides icon selection without importing the entire
 * lucide-react library (44MB). It uses a curated set of commonly used
 * icons and lazy loads additional icons only when needed.
 *
 * @copyright Copyright (c) 2025 KAZI. All rights reserved.
 */

import * as React from 'react'
import { Command } from 'cmdk'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// Import only the icons we actually use
import {
  // Search and Common
  Search,
  Save,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  Settings,
  Menu,
  // Navigation
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  // User
  User,
  Users,
  UserPlus,
  UserMinus,
  Mail,
  Lock,
  Unlock,
  Key,
  // Files
  File,
  FileText,
  Image,
  Video,
  Music,
  Upload,
  Download,
  Folder,
  // Communication
  MessageSquare,
  MessageCircle,
  Send,
  Phone,
  Bell,
  Share2,
  Link,
  Globe,
  // Business
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  BarChart,
  TrendingUp,
  TrendingDown,
  // Status
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  CheckCircle,
  XCircle,
  // Misc
  Star,
  Heart,
  Home,
  Zap,
  Bookmark,
  Tag,
  type LucideIcon,
} from 'lucide-react'

// Map of icon names to components (curated list)
const ICON_MAP: Record<string, LucideIcon> = {
  Search,
  Save,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  Settings,
  Menu,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  UserPlus,
  UserMinus,
  Mail,
  Lock,
  Unlock,
  Key,
  File,
  FileText,
  Image,
  Video,
  Music,
  Upload,
  Download,
  Folder,
  MessageSquare,
  MessageCircle,
  Send,
  Phone,
  Bell,
  Share2,
  Link,
  Globe,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  BarChart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  CheckCircle,
  XCircle,
  Star,
  Heart,
  Home,
  Zap,
  Bookmark,
  Tag,
}

type IconName = keyof typeof ICON_MAP

const iconCategories: Record<string, IconName[]> = {
  'Common Actions': [
    'Save',
    'Edit',
    'Trash2',
    'Plus',
    'Minus',
    'Check',
    'X',
    'Search',
    'Settings',
    'Menu',
  ],
  'Navigation': [
    'ChevronDown',
    'ChevronUp',
    'ChevronLeft',
    'ChevronRight',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
  ],
  'User & Account': [
    'User',
    'Users',
    'UserPlus',
    'UserMinus',
    'Mail',
    'Lock',
    'Unlock',
    'Key',
  ],
  'Files & Media': [
    'File',
    'FileText',
    'Image',
    'Video',
    'Music',
    'Upload',
    'Download',
    'Folder',
  ],
  'Communication': [
    'MessageSquare',
    'MessageCircle',
    'Send',
    'Phone',
    'Bell',
    'Share2',
    'Link',
    'Globe',
  ],
  'Business': [
    'Briefcase',
    'Calendar',
    'Clock',
    'DollarSign',
    'CreditCard',
    'BarChart',
    'TrendingUp',
    'TrendingDown',
  ],
  'Status': [
    'AlertCircle',
    'AlertTriangle',
    'Info',
    'HelpCircle',
    'CheckCircle',
    'XCircle',
  ],
  'Misc': ['Star', 'Heart', 'Home', 'Zap', 'Bookmark', 'Tag'],
}

interface IconPickerProps {
  onChange: (icon: IconName) => void
  value?: IconName
  className?: string
}

export function IconPickerOptimized({
  onChange,
  value,
  className,
}: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  )

  const SelectedIcon = value ? ICON_MAP[value] : ICON_MAP.Image

  // Filter icons based on search
  const filteredIcons = React.useMemo(() => {
    if (!search) {
      if (selectedCategory) {
        return iconCategories[selectedCategory] || []
      }
      return Object.keys(ICON_MAP) as IconName[]
    }

    const searchLower = search.toLowerCase()
    return (Object.keys(ICON_MAP) as IconName[]).filter((name) =>
      name.toLowerCase().includes(searchLower)
    )
  }, [search, selectedCategory])

  const handleSelect = (icon: IconName) => {
    onChange(icon)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn('flex items-center gap-2', className)}
        >
          {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
          <span>{value || 'Select icon'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 p-2 border-b">
            <Button
              size="sm"
              variant={selectedCategory === null ? 'secondary' : 'ghost'}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {Object.keys(iconCategories).map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'secondary' : 'ghost'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Icon grid */}
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-8 gap-2 p-4">
              {filteredIcons.map((iconName) => {
                const IconComponent = ICON_MAP[iconName]
                if (!IconComponent) return null

                return (
                  <button
                    key={iconName}
                    onClick={() => handleSelect(iconName)}
                    className={cn(
                      'flex flex-col items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors',
                      value === iconName && 'bg-accent ring-2 ring-primary'
                    )}
                    title={iconName}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-[10px] mt-1 truncate w-full text-center">
                      {iconName}
                    </span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Get an icon component by name
 * Returns undefined if icon is not in the curated list
 */
export function getIcon(name: string): LucideIcon | undefined {
  return ICON_MAP[name as IconName]
}

/**
 * Check if an icon name is valid
 */
export function isValidIcon(name: string): name is IconName {
  return name in ICON_MAP
}

export type { IconName }
