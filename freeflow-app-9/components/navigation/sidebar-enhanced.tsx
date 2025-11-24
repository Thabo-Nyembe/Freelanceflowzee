'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  BarChart3,
  FolderOpen,
  Video,
  Users,
  Sparkles,
  Calendar,
  Shield,
  FileText,
  TrendingUp,
  Settings,
  Palette,
  MessageSquare,
  Bell,
  DollarSign,
  Zap,
  Monitor,
  Receipt,
  Clock,
  Image,
  Brain,
  Rocket,
  Package,
  Mic,
  Wand2,
  GitBranch,
  Cloud,
  BookOpen,
  User,
  Code,
  Gauge,
  FileBarChart,
  Smartphone,
  Layers,
  Music,
  ChevronDown,
  ChevronRight,
  LucideIcon,
  Briefcase,
  Film,
  Box,
  GripVertical,
  RotateCcw,
  Eye,
  EyeOff,
  Crown,
  Target,
  Mail,
  UserPlus,
  BarChart2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AdminFavorites } from '@/components/admin/admin-favorites'

interface SidebarItem {
  id: string
  name: string
  href: string
  icon: LucideIcon
  badge?: string
  description?: string
}

interface SidebarSubcategory {
  id: string
  name: string
  items: SidebarItem[]
  visible: boolean
}

interface SidebarCategory {
  id: string
  name: string
  icon: LucideIcon
  subcategories: SidebarSubcategory[]
  visible: boolean
}

// Default navigation structure
const DEFAULT_CATEGORIES: SidebarCategory[] = [
  {
    id: 'admin-overview',
    name: 'Admin & Business',
    icon: Briefcase,
    visible: true,
    subcategories: [
      {
        id: 'admin-dashboard',
        name: 'Admin Dashboard',
        visible: true,
        items: [
          { id: 'admin-overview', name: 'Admin Overview', href: '/dashboard/admin-overview', icon: BarChart2, description: 'Unified admin dashboard', badge: 'New' }
        ]
      },
      {
        id: 'admin-business',
        name: 'Business Management',
        visible: true,
        items: [
          { id: 'analytics-advanced', name: 'Analytics', href: '/dashboard/analytics-advanced', icon: TrendingUp, description: 'Business intelligence', badge: 'New' },
          { id: 'crm', name: 'CRM & Sales', href: '/dashboard/crm', icon: Briefcase, description: 'Sales pipeline', badge: 'New' },
          { id: 'invoicing', name: 'Invoicing', href: '/dashboard/invoicing', icon: Receipt, description: 'Billing management', badge: 'New' },
          { id: 'client-portal-admin', name: 'Client Portal', href: '/dashboard/client-portal', icon: Users, description: 'Client management', badge: 'New' }
        ]
      },
      {
        id: 'admin-marketing',
        name: 'Marketing & Sales',
        visible: true,
        items: [
          { id: 'lead-generation', name: 'Lead Generation', href: '/dashboard/lead-generation', icon: Target, description: 'Lead capture', badge: 'New' },
          { id: 'email-marketing', name: 'Email Marketing', href: '/dashboard/email-marketing', icon: Mail, description: 'Email campaigns', badge: 'New' }
        ]
      },
      {
        id: 'admin-operations',
        name: 'Operations',
        visible: true,
        items: [
          { id: 'user-management', name: 'User Management', href: '/dashboard/user-management', icon: UserPlus, description: 'Team & permissions', badge: 'New' }
        ]
      },
      {
        id: 'admin-automation',
        name: 'Business Automation',
        visible: true,
        items: [
          { id: 'email-agent', name: 'Business Agent', href: '/dashboard/email-agent', icon: Zap, description: 'AI automation hub', badge: 'New' },
          { id: 'email-agent-setup', name: 'Setup Integrations', href: '/dashboard/email-agent/setup', icon: Settings, description: '5-min setup' }
        ]
      }
    ]
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence',
    icon: TrendingUp,
    visible: true,
    subcategories: [
      {
        id: 'overview',
        name: 'Overview',
        visible: true,
        items: [
          { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: BarChart3, description: 'Business overview' },
          { id: 'my-day', name: 'My Day', href: '/dashboard/my-day', icon: Calendar, description: 'Daily planner' }
        ]
      },
      {
        id: 'project-management',
        name: 'Project Management',
        visible: true,
        items: [
          { id: 'projects-hub', name: 'Projects Hub', href: '/dashboard/projects-hub', icon: FolderOpen, description: 'Project management' },
          { id: 'project-templates', name: 'Project Templates', href: '/dashboard/project-templates', icon: FileText, description: 'Templates', badge: 'New' },
          { id: 'workflow-builder', name: 'Workflow Builder', href: '/dashboard/workflow-builder', icon: GitBranch, description: 'Custom workflows', badge: 'New' },
          { id: 'time-tracking', name: 'Time Tracking', href: '/dashboard/time-tracking', icon: Clock, description: 'Track time' }
        ]
      },
      {
        id: 'analytics-reports',
        name: 'Analytics & Reports',
        visible: true,
        items: [
          { id: 'analytics', name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp, description: 'Performance insights' },
          { id: 'custom-reports', name: 'Custom Reports', href: '/dashboard/custom-reports', icon: FileBarChart, description: 'Custom reporting', badge: 'New' },
          { id: 'performance', name: 'Performance', href: '/dashboard/performance-analytics', icon: Gauge, description: 'Performance metrics', badge: 'New' },
          { id: 'reports', name: 'Reports', href: '/dashboard/reports', icon: FileBarChart, description: 'All reports', badge: 'New' }
        ]
      },
      {
        id: 'financial',
        name: 'Financial',
        visible: true,
        items: [
          { id: 'financial-hub', name: 'Financial Hub', href: '/dashboard/financial', icon: DollarSign, description: 'Finance management' },
          { id: 'invoices', name: 'Invoices', href: '/dashboard/invoices', icon: Receipt, description: 'Invoice system', badge: 'New' },
          { id: 'escrow', name: 'Escrow', href: '/dashboard/escrow', icon: Shield, description: 'Secure payments' },
          { id: 'crypto-payments', name: 'Crypto Payments', href: '/dashboard/crypto-payments', icon: DollarSign, description: 'Crypto support', badge: 'New' }
        ]
      },
      {
        id: 'team-clients',
        name: 'Team & Clients',
        visible: true,
        items: [
          { id: 'team-hub', name: 'Team Hub', href: '/dashboard/team-hub', icon: Users, description: 'Team collaboration', badge: 'New' },
          { id: 'team-management', name: 'Team Management', href: '/dashboard/team-management', icon: Users, description: 'Manage team', badge: 'New' },
          { id: 'clients', name: 'Clients', href: '/dashboard/clients', icon: Users, description: 'Client directory', badge: 'New' },
          { id: 'client-portal', name: 'Client Portal', href: '/dashboard/client-portal', icon: Users, description: 'Client management', badge: 'New' },
          { id: 'client-zone', name: 'Client Zone', href: '/dashboard/client-zone', icon: Users, description: 'Client portal' }
        ]
      },
      {
        id: 'communication',
        name: 'Communication',
        visible: true,
        items: [
          { id: 'messages', name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, description: 'Communication' },
          { id: 'community-hub', name: 'Community Hub', href: '/dashboard/community-hub', icon: Users, description: 'Creator network' }
        ]
      },
      {
        id: 'scheduling',
        name: 'Scheduling',
        visible: true,
        items: [
          { id: 'calendar', name: 'Calendar', href: '/dashboard/calendar', icon: Calendar, description: 'Scheduling' },
          { id: 'bookings', name: 'Bookings', href: '/dashboard/bookings', icon: Calendar, description: 'Booking system' }
        ]
      },
      {
        id: 'white-label-platform',
        name: 'White Label & Platform',
        visible: true,
        items: [
          { id: 'white-label', name: 'White Label', href: '/dashboard/white-label', icon: Crown, description: 'Rebrand platform', badge: 'Pro' },
          { id: 'plugins', name: 'Plugins', href: '/dashboard/plugin-marketplace', icon: Package, description: 'App integrations', badge: 'New' },
          { id: 'desktop-app', name: 'Desktop App', href: '/dashboard/desktop-app', icon: Monitor, description: 'Desktop version', badge: 'New' },
          { id: 'mobile-app', name: 'Mobile App', href: '/dashboard/mobile-app', icon: Smartphone, description: 'Mobile version', badge: 'New' }
        ]
      },
      {
        id: 'account',
        name: 'Account',
        visible: true,
        items: [
          { id: 'profile', name: 'Profile', href: '/dashboard/profile', icon: User, description: 'Your profile', badge: 'New' },
          { id: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'Settings' },
          { id: 'notifications', name: 'Notifications', href: '/dashboard/notifications', icon: Bell, description: 'Alerts' }
        ]
      }
    ]
  },
  {
    id: 'ai-creative-suite',
    name: 'AI Creative Suite',
    icon: Brain,
    visible: true,
    subcategories: [
      {
        id: 'ai-tools',
        name: 'AI Tools',
        visible: true,
        items: [
          { id: 'ai-assistant', name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Brain, description: 'AI-powered assistant' },
          { id: 'ai-design', name: 'AI Design', href: '/dashboard/ai-design', icon: Zap, description: 'AI design generation' },
          { id: 'ai-create', name: 'AI Create', href: '/dashboard/ai-create', icon: Sparkles, description: 'AI content creation' }
        ]
      },
      {
        id: 'advanced-ai',
        name: 'Advanced AI',
        visible: true,
        items: [
          { id: 'ai-video-generation', name: 'AI Video Generation', href: '/dashboard/ai-video-generation', icon: Video, description: 'AI video creation', badge: 'New' },
          { id: 'ai-voice-synthesis', name: 'AI Voice Synthesis', href: '/dashboard/ai-voice-synthesis', icon: Mic, description: 'AI voice generation', badge: 'New' },
          { id: 'ai-code-completion', name: 'AI Code Completion', href: '/dashboard/ai-code-completion', icon: Code, description: 'AI coding assistant', badge: 'New' },
          { id: 'ml-insights', name: 'ML Insights', href: '/dashboard/ml-insights', icon: Brain, description: 'Machine learning', badge: 'New' },
          { id: 'ai-settings', name: 'AI Settings', href: '/dashboard/ai-settings', icon: Settings, description: 'AI configuration', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    icon: Palette,
    visible: true,
    subcategories: [
      {
        id: 'video-media',
        name: 'Video & Media',
        visible: true,
        items: [
          { id: 'video-studio', name: 'Video Studio', href: '/dashboard/video-studio', icon: Video, description: 'Video editing' },
          { id: 'canvas', name: 'Canvas', href: '/dashboard/canvas', icon: Palette, description: 'Design canvas' },
          { id: 'gallery', name: 'Gallery', href: '/dashboard/gallery', icon: Image, description: 'Media gallery' }
        ]
      },
      {
        id: 'audio-music',
        name: 'Audio & Music',
        visible: true,
        items: [
          { id: 'audio-studio', name: 'Audio Studio', href: '/dashboard/audio-studio', icon: Music, description: 'Audio production', badge: 'New' },
          { id: 'voice-collaboration', name: 'Voice Collaboration', href: '/dashboard/voice-collaboration', icon: Mic, description: 'Voice calls', badge: 'New' }
        ]
      },
      {
        id: '3d-animation',
        name: '3D & Animation',
        visible: true,
        items: [
          { id: '3d-modeling', name: '3D Modeling', href: '/dashboard/3d-modeling', icon: Box, description: '3D design', badge: 'New' },
          { id: 'motion-graphics', name: 'Motion Graphics', href: '/dashboard/motion-graphics', icon: Film, description: 'Motion design', badge: 'New' }
        ]
      },
      {
        id: 'portfolio',
        name: 'Portfolio',
        visible: true,
        items: [
          { id: 'cv-portfolio', name: 'CV Portfolio', href: '/dashboard/cv-portfolio', icon: Briefcase, description: 'CV builder' },
          { id: 'files-hub', name: 'Files Hub', href: '/dashboard/files-hub', icon: FolderOpen, description: 'File management' }
        ]
      },
      {
        id: 'resources',
        name: 'Resources',
        visible: true,
        items: [
          { id: 'cloud-storage', name: 'Cloud Storage', href: '/dashboard/cloud-storage', icon: Cloud, description: 'Cloud files', badge: 'New' },
          { id: 'resource-library', name: 'Resource Library', href: '/dashboard/resource-library', icon: BookOpen, description: 'Asset library', badge: 'New' }
        ]
      }
    ]
  }
]

// Sortable subcategory component
function SortableSubcategory({
  subcategory,
  categoryId,
  isExpanded,
  onToggle,
  isActive,
  pathname,
  isCustomizing
}: {
  subcategory: SidebarSubcategory
  categoryId: string
  isExpanded: boolean
  onToggle: () => void
  isActive: (href: string) => boolean
  pathname: string
  isCustomizing: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: subcategory.id, disabled: !isCustomizing })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const hasActiveItem = subcategory.items.some(item => isActive(item.href))

  if (!subcategory.visible && !isCustomizing) return null

  return (
    <div ref={setNodeRef} style={style} className="ml-2 space-y-1">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md transition-all group',
          'hover:bg-gray-50 dark:hover:bg-gray-900',
          hasActiveItem
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
            : 'text-gray-600 dark:text-gray-400',
          !subcategory.visible && 'opacity-50'
        )}
      >
        <div className="flex items-center gap-2">
          {isCustomizing && (
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-3 w-3 text-gray-400" />
            </div>
          )}
          <span className="uppercase tracking-wide">{subcategory.name}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-3 w-3" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="ml-2 space-y-0.5 overflow-hidden"
          >
            {subcategory.items.map((item) => {
              const ItemIcon = item.icon
              const itemIsActive = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={`nav-${item.id}`}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-200 group',
                    itemIsActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <ItemIcon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      itemIsActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                    )}
                  />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 text-xs font-medium rounded',
                        itemIsActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'Pro'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SidebarEnhanced() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<SidebarCategory[]>(DEFAULT_CATEGORIES)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'admin-overview',
    'business-intelligence',
    'ai-creative-suite',
    'creative-studio'
  ])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Load saved configuration from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kazi-navigation-config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCategories(parsed)
      } catch (e) {
        console.error('Failed to load navigation config:', e)
      }
    }
  }, [])

  // Auto-expand the subcategory containing the current page
  useEffect(() => {
    const allSubcategories: string[] = []
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        const hasActiveItem = subcategory.items.some(item => pathname === item.href)
        if (hasActiveItem && !expandedSubcategories.includes(subcategory.id)) {
          allSubcategories.push(subcategory.id)
        }
      })
    })
    if (allSubcategories.length > 0) {
      setExpandedSubcategories(prev => [...new Set([...prev, ...allSubcategories])])
    }
  }, [pathname, categories])

  const saveConfiguration = (newCategories: SidebarCategory[]) => {
    console.log('💾 Saving navigation configuration:', newCategories)
    setCategories(newCategories)
    localStorage.setItem('kazi-navigation-config', JSON.stringify(newCategories))
    toast.success('Navigation saved', { duration: 2000 })
  }

  const resetToDefault = () => {
    console.log('🔄 Resetting navigation to defaults')
    setCategories(DEFAULT_CATEGORIES)
    localStorage.removeItem('kazi-navigation-config')
    setIsSettingsOpen(false)
    toast.success('Navigation reset to defaults', { duration: 2000 })
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    )
  }

  const toggleCategoryVisibility = (categoryId: string) => {
    console.log('👁️ Toggling category visibility:', categoryId)
    const newCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, visible: !cat.visible } : cat
    )
    saveConfiguration(newCategories)
  }

  const toggleSubcategoryVisibility = (categoryId: string, subcategoryId: string) => {
    console.log('👁️ Toggling subcategory visibility:', categoryId, subcategoryId)
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub =>
            sub.id === subcategoryId ? { ...sub, visible: !sub.visible } : sub
          )
        }
      }
      return cat
    })
    saveConfiguration(newCategories)
  }

  const handleDragEnd = (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      console.log('🔄 Reordering subcategories:', active.id, '→', over.id)
      const newCategories = categories.map(cat => {
        if (cat.id === categoryId) {
          const oldIndex = cat.subcategories.findIndex(sub => sub.id === active.id)
          const newIndex = cat.subcategories.findIndex(sub => sub.id === over.id)
          return {
            ...cat,
            subcategories: arrayMove(cat.subcategories, oldIndex, newIndex)
          }
        }
        return cat
      })
      saveConfiguration(newCategories)
    }
  }

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  return (
    <aside data-tour="sidebar-nav" className="fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-1">
        {/* Admin Quick Access */}
        <AdminFavorites />

        {/* Customize Navigation Button */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full mb-4 justify-start gap-2"
            >
              <Settings className="h-4 w-4" />
              Customize Navigation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customize Your Navigation</DialogTitle>
              <DialogDescription>
                Drag to reorder, toggle visibility, or reset to defaults. Changes save automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[65vh] overflow-y-auto space-y-6 py-4 pr-2">
              {/* Customization Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="customize-mode" className="text-sm font-medium">
                    Reorder Mode
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable to drag and reorder subcategories
                  </p>
                </div>
                <Switch
                  id="customize-mode"
                  checked={isCustomizing}
                  onCheckedChange={(checked) => {
                    setIsCustomizing(checked)
                    toast.info(checked ? 'Reorder mode enabled - drag to reorder' : 'Reorder mode disabled', { duration: 2000 })
                  }}
                />
              </div>

              {/* Categories Visibility */}
              {categories.map((category) => (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      <span className="font-semibold">{category.name}</span>
                    </div>
                    <Switch
                      checked={category.visible}
                      onCheckedChange={() => toggleCategoryVisibility(category.id)}
                    />
                  </div>

                  {/* Subcategories */}
                  <div className="ml-6 space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center justify-between text-sm">
                        <span className={cn(!subcategory.visible && 'text-gray-400')}>
                          {subcategory.name}
                        </span>
                        <Switch
                          checked={subcategory.visible}
                          onCheckedChange={() =>
                            toggleSubcategoryVisibility(category.id, subcategory.id)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Reset Button */}
              <Button
                variant="outline"
                onClick={resetToDefault}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Navigation Categories */}
        {categories.map((category) => {
          if (!category.visible) return null

          const isCategoryExpanded = expandedCategories.includes(category.id)
          const CategoryIcon = category.icon

          return (
            <div key={category.id} className="space-y-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'text-gray-900 dark:text-gray-100'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <CategoryIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{category.name}</span>
                </div>
                <motion.div
                  animate={{ rotate: isCategoryExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isCategoryExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, category.id)}
                    >
                      <SortableContext
                        items={category.subcategories.map(sub => sub.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {category.subcategories.map((subcategory) => (
                          <SortableSubcategory
                            key={subcategory.id}
                            subcategory={subcategory}
                            categoryId={category.id}
                            isExpanded={expandedSubcategories.includes(subcategory.id)}
                            onToggle={() => toggleSubcategory(subcategory.id)}
                            isActive={isActive}
                            pathname={pathname}
                            isCustomizing={isCustomizing}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {/* Coming Soon */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/dashboard/coming-soon"
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-200',
              isActive('/dashboard/coming-soon')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <Rocket className="h-4 w-4" />
            <span>Coming Soon</span>
            <span className="ml-auto px-1.5 py-0.5 text-xs font-medium rounded bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              New
            </span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
