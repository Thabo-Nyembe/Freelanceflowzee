"use client""

import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Home, 
  Star,
  StarOff,
  Clock,
  Settings,
  X,
  Plus,
  Grip,
  LayoutGrid,
  LayoutList,
  FolderOpen,
  TrendingUp,
  Calendar,
  Brain,
  Palette,
  Zap,
  Video,
  Monitor,
  Users,
  Image,
  User,
  DollarSign,
  Wallet,
  Receipt,
  Shield,
  MessageSquare,
  Building,
  UserCheck,
  FileText,
  Archive,
  Cloud,
  Globe,
  Briefcase,
  Layers,
  Command,
  Menu,
  PanelLeft,
  PanelRight,
  Sparkles,
  History,
  Bookmark,
  LayoutDashboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Type definitions
type FeatureItem = {
  id: string
  name: string
  path: string
  icon: any
  description: string
  category: string
  subItems?: FeatureItem[]
}

type CategoryType = {
  id: string
  name: string
  icon: any
  features: FeatureItem[]
}

type WorkspaceType = {
  id: string
  name: string
  icon: any
  description: string
}

type SidebarContextType = {
  expanded: boolean
  toggleExpand: () => void
  favorites: string[]
  addToFavorites: (id: string) => void
  removeFromFavorite: (id: string) => void
  recentlyUsed: string[]
  addToRecentlyUsed: (id: string) => void
  activeWorkspace: string
  setActiveWorkspace: (id: string) => void
  sidebarView: 'categories' | 'favorites' | 'recent'
  setSidebarView: (view: 'categories' | 'favorites' | 'recent') => void
}

// Create context for sidebar state
const SidebarContext = createContext<SidebarContextType>({
  expanded: true,
  toggleExpand: () => {},
  favorites: [],
  addToFavorites: () => {},
  removeFromFavorite: () => {},
  recentlyUsed: [],
  addToRecentlyUsed: () => {},
  activeWorkspace: 'default',
  setActiveWorkspace: () => {},
  sidebarView: 'categories',
  setSidebarView: () => {}
})

// Feature categories data
const categories: CategoryType[] = [
  {
    id: 'core',
    name: 'Core',
    icon: LayoutDashboard,
    features: [
      { id: 'my-day', name: 'My Day', path: 'my-day', icon: Calendar, description: 'AI-powered daily planning and productivity optimization', category: 'core' },
      { id: 'projects-hub', name: 'Projects Hub', path: 'projects-hub', icon: FolderOpen, description: 'Complete project lifecycle management system', category: 'core' },
      { id: 'analytics', name: 'Analytics', path: 'analytics', icon: TrendingUp, description: 'Advanced business intelligence and reporting', category: 'core' },
      { id: 'time-tracking', name: 'Time Tracking', path: 'time-tracking', icon: Clock, description: 'Advanced time tracking and productivity metrics', category: 'core' }
    ]
  },
  {
    id: 'ai',
    name: 'AI Tools',
    icon: Sparkles,
    features: [
      { id: 'ai-create', name: 'AI Create', path: 'ai-create', icon: Brain, description: 'Multi-model AI studio (GPT-4o, Claude, DALL-E)', category: 'ai' },
      { id: 'ai-design', name: 'AI Design', path: 'ai-design', icon: Palette, description: 'AI-powered design generation and optimization', category: 'ai' },
      { id: 'ai-assistant', name: 'AI Assistant', path: 'ai-assistant', icon: Zap, description: 'Personal AI assistant for workflow automation', category: 'ai' },
      { id: 'ai-enhanced', name: 'AI Enhanced', path: 'ai-enhanced', icon: Star, description: 'Enhanced AI features and capabilities', category: 'ai' }
    ]
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: Palette,
    features: [
      { id: 'video-studio', name: 'Video Studio', path: 'video-studio', icon: Video, description: 'Professional video editing with AI transcription', category: 'creative' },
      { id: 'canvas', name: 'Canvas', path: 'canvas', icon: Monitor, description: 'Interactive design and collaboration canvas', category: 'creative' },
      { id: 'canvas-collaboration', name: 'Canvas Collaboration', path: 'canvas-collaboration', icon: Users, description: 'Real-time canvas collaboration', category: 'creative' },
      { id: 'gallery', name: 'Gallery', path: 'gallery', icon: Image, description: 'Portfolio showcase and asset management', category: 'creative' },
      { id: 'cv-portfolio', name: 'CV & Portfolio', path: 'cv-portfolio', icon: User, description: 'Professional portfolio and resume builder', category: 'creative' }
    ]
  },
  {
    id: 'business',
    name: 'Business',
    icon: Briefcase,
    features: [
      { id: 'financial-hub', name: 'Financial Hub', path: 'financial-hub', icon: DollarSign, description: 'Complete financial management and reporting', category: 'business' },
      { id: 'financial', name: 'Financial', path: 'financial', icon: Wallet, description: 'Financial tracking and budgeting', category: 'business' },
      { id: 'invoices', name: 'Invoices', path: 'invoices', icon: Receipt, description: 'Invoice generation and payment tracking', category: 'business' },
      { id: 'escrow', name: 'Escrow', path: 'escrow', icon: Shield, description: 'Secure milestone-based payment protection', category: 'business' },
      { id: 'bookings', name: 'Bookings', path: 'bookings', icon: Calendar, description: 'Appointment and meeting scheduling system', category: 'business' }
    ]
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: MessageSquare,
    features: [
      { id: 'messages', name: 'Messages', path: 'messages', icon: MessageSquare, description: 'Integrated communication hub', category: 'communication' },
      { id: 'collaboration', name: 'Collaboration', path: 'collaboration', icon: Users, description: 'Real-time project collaboration tools', category: 'communication' },
      { id: 'team-hub', name: 'Team Hub', path: 'team-hub', icon: Building, description: 'Team management and coordination', category: 'communication' },
      { id: 'client-zone', name: 'Client Zone', path: 'client-zone', icon: UserCheck, description: 'Client portal and project sharing', category: 'communication' },
      { id: 'clients', name: 'Clients', path: 'clients', icon: Users, description: 'Client relationship management', category: 'communication' }
    ]
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: Cloud,
    features: [
      { id: 'files-hub', name: 'Files Hub', path: 'files-hub', icon: FileText, description: 'Multi-cloud storage with optimization', category: 'storage' },
      { id: 'files', name: 'Files', path: 'files', icon: Archive, description: 'File management and organization', category: 'storage' },
      { id: 'cloud-storage', name: 'Cloud Storage', path: 'cloud-storage', icon: Cloud, description: 'Advanced cloud storage management', category: 'storage' },
      { id: 'storage', name: 'Storage', path: 'storage', icon: Archive, description: 'Storage management and analytics', category: 'storage' }
    ]
  },
  {
    id: 'community',
    name: 'Community',
    icon: Globe,
    features: [
      { id: 'community-hub', name: 'Community Hub', path: 'community-hub', icon: Globe, description: 'Connect with 2,800+ creative professionals', category: 'community' },
      { id: 'community', name: 'Community', path: 'community', icon: Globe, description: 'Community features and networking', category: 'community' }
    ]
  }
]

// Workspace definitions
const workspaces: WorkspaceType[] = [
  { id: 'default', name: 'Default', icon: LayoutDashboard, description: 'Standard workspace with all features' },
  { id: 'creative', name: 'Creative', icon: Palette, description: 'Focus on design and creative tools' },
  { id: 'business', name: 'Business', icon: Briefcase, description: 'Financial and client management' },
  { id: 'developer', name: 'Developer', icon: Code, description: 'Development and technical tools' }
]

// Related features mapping - suggests related tools based on current page
const relatedFeaturesMap: Record<string, string[]> = {
  'projects-hub': ['time-tracking', 'invoices', 'team-hub'],
  'analytics': ['financial-hub', 'projects-hub', 'video-studio'],
  'ai-assistant': ['ai-create', 'ai-design', 'my-day'],
  'financial-hub': ['invoices', 'escrow', 'analytics'],
  'invoices': ['financial-hub', 'escrow', 'projects-hub'],
  'team-hub': ['client-zone', 'messages', 'projects-hub'],
  'client-zone': ['team-hub', 'invoices', 'files-hub'],
  'files-hub': ['cloud-storage', 'gallery', 'client-zone'],
  'video-studio': ['canvas', 'ai-create', 'files-hub'],
  'messages': ['collaboration', 'team-hub', 'client-zone']
}

// Helper functions to get all features flattened
const getAllFeatures = (): FeatureItem[] => {
  return categories.flatMap(category => category.features)
}

// Find feature by ID
const findFeatureById = (id: string): FeatureItem | undefined => {
  return getAllFeatures().find(feature => feature.id === id)
}

// Sortable Item Component for Favorites
function SortableItem({ id }: { id: string }) {
  const feature = findFeatureById(id)
  const { removeFromFavorite } = useContext(SidebarContext)
  const router = useRouter()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  }
  
  if (!feature) return null
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-2 rounded-md mb-1","
        "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors","
        isDragging ? "bg-gray-100 dark:bg-gray-800" : """
      )}
    >
      <div className="flex items-center flex-1" onClick={() => router.push(`/dashboard/${feature.path}`)}>"
        <div {...listeners} {...attributes} className="cursor-grab mr-2 text-gray-400 hover:text-gray-600">"
          <Grip className="h-4 w-4" />"
        </div>
        <feature.icon className="h-4 w-4 mr-2 text-gray-600" />"
        <span className="text-sm">{feature.name}</span>"
      </div>
      <Button
        variant="ghost""
        size="sm""
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100""
        onClick={() => removeFromFavorite(id)}
      >
        <X className="h-3 w-3" />"
      </Button>
    </div>
  )
}

// Main Contextual Sidebar Component
export function ContextualSidebar({
  className,
  defaultExpanded = true,
  defaultWorkspace = 'default',
  onNavigate
}: {
  className?: string
  defaultExpanded?: boolean
  defaultWorkspace?: string
  onNavigate?: (path: string) => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FeatureItem[]>([])
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState(defaultWorkspace)
  const [sidebarView, setSidebarView] = useState<'categories' | 'favorites' | 'recent'>('categories')
  
  // Extract current page from pathname
  const currentPage = pathname.replace(/^\/dashboard\/?/, '').split('/')[0]
  
  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Load user preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load favorites
      const savedFavorites = localStorage.getItem('kazi-sidebar-favorites')
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites))
        } catch (e) {
          console.error('Failed to parse saved favorites', e)
        }
      }
      
      // Load recently used
      const savedRecent = localStorage.getItem('kazi-sidebar-recent')
      if (savedRecent) {
        try {
          setRecentlyUsed(JSON.parse(savedRecent))
        } catch (e) {
          console.error('Failed to parse saved recent items', e)
        }
      }
      
      // Load expanded categories
      const savedExpandedCategories = localStorage.getItem('kazi-sidebar-expanded-categories')
      if (savedExpandedCategories) {
        try {
          setExpandedCategories(JSON.parse(savedExpandedCategories))
        } catch (e) {
          console.error('Failed to parse saved expanded categories', e)
        }
      } else {
        // Default to having core expanded
        setExpandedCategories({ core: true })
      }
      
      // Load active workspace
      const savedWorkspace = localStorage.getItem('kazi-sidebar-workspace')
      if (savedWorkspace) {
        setActiveWorkspace(savedWorkspace)
      }
      
      // Load sidebar view
      const savedView = localStorage.getItem('kazi-sidebar-view')
      if (savedView && ['categories', 'favorites', 'recent'].includes(savedView)) {
        setSidebarView(savedView as 'categories' | 'favorites' | 'recent')
      }
    }
  }, [])
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kazi-sidebar-favorites', JSON.stringify(favorites))
      localStorage.setItem('kazi-sidebar-recent', JSON.stringify(recentlyUsed))
      localStorage.setItem('kazi-sidebar-expanded-categories', JSON.stringify(expandedCategories))
      localStorage.setItem('kazi-sidebar-workspace', activeWorkspace)
      localStorage.setItem('kazi-sidebar-view', sidebarView)
    }
  }, [favorites, recentlyUsed, expandedCategories, activeWorkspace, sidebarView])
  
  // Add current page to recently used when it changes
  useEffect(() => {
    if (currentPage) {
      addToRecentlyUsed(currentPage)
    }
  }, [currentPage])
  
  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const allFeatures = getAllFeatures()
      const results = allFeatures.filter(feature => 
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])
  
  // Toggle sidebar expansion
  const toggleExpand = () => {
    setExpanded(!expanded)
  }
  
  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }
  
  // Add to favorites
  const addToFavorites = (id: string) => {
    if (!favorites.includes(id)) {
      setFavorites(prev => [...prev, id])
    }
  }
  
  // Remove from favorites
  const removeFromFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item !== id))
  }
  
  // Add to recently used
  const addToRecentlyUsed = (id: string) => {
    setRecentlyUsed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item !== id)
      // Add to beginning and limit to 10 items
      return [id, ...filtered].slice(0, 10)
    })
  }
  
  // Handle drag end for favorites reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      setFavorites((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      router.push(`/dashboard/${path}`)
    }
  }
  
  // Get related features for current page
  const relatedFeatures = useMemo(() => {
    if (!currentPage) return []
    
    const relatedIds = relatedFeaturesMap[currentPage] || []
    return relatedIds
      .map(id => findFeatureById(id))
      .filter(Boolean) as FeatureItem[]
  }, [currentPage])
  
  // Context value
  const contextValue = {
    expanded,
    toggleExpand,
    favorites,
    addToFavorites,
    removeFromFavorite,
    recentlyUsed,
    addToRecentlyUsed,
    activeWorkspace,
    setActiveWorkspace,
    sidebarView,
    setSidebarView
  }
  
  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + . to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        toggleExpand()
      }
      
      // Cmd/Ctrl + 1-3 to switch views
      if ((e.metaKey || e.ctrlKey)) {
        if (e.key === '1') setSidebarView('categories')
        if (e.key === '2') setSidebarView('favorites')
        if (e.key === '3') setSidebarView('recent')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <SidebarContext.Provider value={contextValue}>
      <div 
        className={cn(
          "h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300","
          expanded ? "w-64" : "w-16","
          className
        )}
      >
        <div className="flex flex-col h-full">"
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">"
            {expanded ? (
              <>
                <div className="flex items-center gap-2">"
                  <LayoutDashboard className="h-5 w-5 text-blue-600" />"
                  <span className="font-medium">KAZI Workspace</span>"
                </div>
                <Button
                  variant="ghost""
                  size="sm""
                  className="h-8 w-8 p-0""
                  onClick={toggleExpand}
                >
                  <PanelLeft className="h-4 w-4" />"
                </Button>
              </>
            ) : (
              <Button
                variant="ghost""
                size="sm""
                className="h-8 w-8 p-0 mx-auto""
                onClick={toggleExpand}
              >
                <PanelRight className="h-4 w-4" />"
              </Button>
            )}
          </div>
          
          {/* Workspace Switcher */}
          {expanded && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-800">"
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">"
                    <div className="flex items-center gap-2">"
                      {workspaces.find(w => w.id === activeWorkspace)?.icon && (
                        <workspaces.find(w => w.id === activeWorkspace)!.icon className="h-4 w-4" />"
                      )}
                      <span>{workspaces.find(w => w.id === activeWorkspace)?.name || 'Default'}</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />"
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">"
                  {workspaces.map(workspace => (
                    <DropdownMenuItem 
                      key={workspace.id}
                      className="flex items-center gap-2""
                      onClick={() => setActiveWorkspace(workspace.id)}
                    >
                      <workspace.icon className="h-4 w-4" />"
                      <div>
                        <div>{workspace.name}</div>
                        <div className="text-xs text-gray-500">{workspace.description}</div>"
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* Search */}
          {expanded && (
            <div className="p-3">"
              <div className="relative">"
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />"
                <Input
                  placeholder="Search...""
                  className="pl-8""
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Search Results */}
              {searchQuery.trim().length > 1 && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">"
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer""
                        onClick={() => {
                          handleNavigate(result.path)
                          setSearchQuery('')
                        }}
                      >
                        <result.icon className="h-4 w-4 mr-2 text-gray-600" />"
                        <div>
                          <div className="text-sm font-medium">{result.name}</div>"
                          <div className="text-xs text-gray-500 truncate">{result.description}</div>"
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">"
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* View Switcher */}
          <div className={cn(
            "flex border-b border-gray-200 dark:border-gray-800","
            expanded ? "justify-between px-3 py-2" : "flex-col items-center py-2 gap-2""
          )}>
            {expanded ? (
              <>
                <Button
                  variant={sidebarView === 'categories' ? 'default' : 'ghost'}
                  size="sm""
                  className="flex-1""
                  onClick={() => setSidebarView('categories')}
                >
                  <Layers className="h-4 w-4 mr-1" />"
                  Categories
                </Button>
                <Button
                  variant={sidebarView === 'favorites' ? 'default' : 'ghost'}
                  size="sm""
                  className="flex-1""
                  onClick={() => setSidebarView('favorites')}
                >
                  <Star className="h-4 w-4 mr-1" />"
                  Favorites
                </Button>
                <Button
                  variant={sidebarView === 'recent' ? 'default' : 'ghost'}
                  size="sm""
                  className="flex-1""
                  onClick={() => setSidebarView('recent')}
                >
                  <Clock className="h-4 w-4 mr-1" />"
                  Recent
                </Button>
              </>
            ) : (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={sidebarView === 'categories' ? 'default' : 'ghost'}
                        size="sm""
                        className="h-8 w-8 p-0""
                        onClick={() => setSidebarView('categories')}
                      >
                        <Layers className="h-4 w-4" />"
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Categories</TooltipContent>"
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={sidebarView === 'favorites' ? 'default' : 'ghost'}
                        size="sm""
                        className="h-8 w-8 p-0""
                        onClick={() => setSidebarView('favorites')}
                      >
                        <Star className="h-4 w-4" />"
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Favorites</TooltipContent>"
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={sidebarView === 'recent' ? 'default' : 'ghost'}
                        size="sm""
                        className="h-8 w-8 p-0""
                        onClick={() => setSidebarView('recent')}
                      >
                        <Clock className="h-4 w-4" />"
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Recent</TooltipContent>"
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
          
          {/* Main Content Area */}
          <ScrollArea className="flex-1">"
            {/* Categories View */}
            {sidebarView === 'categories' && (
              <div className="p-2">"
                {expanded && (
                  <div className="text-xs font-medium text-gray-500 uppercase mb-2 px-2">"
                    Categories
                  </div>
                )}
                
                {categories.map((category) => (
                  <Collapsible
                    key={category.id}
                    open={expanded ? expandedCategories[category.id] : false}
                    onOpenChange={() => expanded && toggleCategory(category.id)}
                    className="mb-1""
                  >
                    <CollapsibleTrigger asChild>
                      <div className={cn(
                        "flex items-center p-2 rounded-md cursor-pointer","
                        "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors","
                        currentPage && category.features.some(f => f.path === currentPage)
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400""
                          : """
                      )}>
                        <category.icon className={cn(
                          "h-4 w-4","
                          expanded ? "mr-2" : "mx-auto""
                        )} />
                        {expanded && (
                          <>
                            <span className="text-sm font-medium flex-1">{category.name}</span>"
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-transform","
                              expandedCategories[category.id] ? "transform rotate-90" : """
                            )} />
                          </>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    {expanded && (
                      <CollapsibleContent className="pl-4">"
                        <AnimatePresence>
                          {category.features.map((feature) => (
                            <motion.div
                              key={feature.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div
                                className={cn(
                                  "flex items-center justify-between p-2 rounded-md mb-1 group","
                                  "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors","
                                  currentPage === feature.path
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400""
                                    : """
                                )}
                                onClick={() => handleNavigate(feature.path)}
                              >
                                <div className="flex items-center">"
                                  <feature.icon className="h-4 w-4 mr-2" />"
                                  <span className="text-sm">{feature.name}</span>"
                                </div>
                                
                                {!favorites.includes(feature.id) ? (
                                  <Button
                                    variant="ghost""
                                    size="sm""
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100""
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      addToFavorites(feature.id)
                                    }}
                                  >
                                    <Star className="h-3 w-3" />"
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost""
                                    size="sm""
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100""
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeFromFavorite(feature.id)
                                    }}
                                  >
                                    <StarOff className="h-3 w-3" />"
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ))}
              </div>
            )}
            
            {/* Favorites View */}
            {sidebarView === 'favorites' && (
              <div className="p-2">"
                {expanded && (
                  <div className="flex items-center justify-between mb-2 px-2">"
                    <div className="text-xs font-medium text-gray-500 uppercase">"
                      Favorites
                    </div>
                    <Badge variant="outline" className="text-xs">"
                      {favorites.length}
                    </Badge>
                  </div>
                )}
                
                {expanded ? (
                  favorites.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext
                        items={favorites}
                        strategy={verticalListSortingStrategy}
                      >
                        {favorites.map((id) => (
                          <SortableItem key={id} id={id} />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center p-4 text-sm text-gray-500">"
                      <Star className="h-8 w-8 mx-auto mb-2 text-gray-400" />"
                      <p>No favorites yet</p>
                      <p className="text-xs mt-1">Add items by clicking the star icon</p>"
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2">"
                    {favorites.slice(0, 5).map((id) => {
                      const feature = findFeatureById(id)
                      if (!feature) return null
                      
                      return (
                        <TooltipProvider key={id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={currentPage === feature.path ? 'default' : 'ghost'}
                                size="sm""
                                className="h-8 w-8 p-0""
                                onClick={() => handleNavigate(feature.path)}
                              >
                                <feature.icon className="h-4 w-4" />"
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">{feature.name}</TooltipContent>"
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                    
                    {favorites.length > 5 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="h-8 w-8 rounded-md flex items-center justify-center">"
                              +{favorites.length - 5}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="right">"
                            {favorites.length - 5} more favorites
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Recently Used View */}
            {sidebarView === 'recent' && (
              <div className="p-2">"
                {expanded && (
                  <div className="flex items-center justify-between mb-2 px-2">"
                    <div className="text-xs font-medium text-gray-500 uppercase">"
                      Recently Used
                    </div>
                    <Badge variant="outline" className="text-xs">"
                      {recentlyUsed.length}
                    </Badge>
                  </div>
                )}
                
                {expanded ? (
                  recentlyUsed.length > 0 ? (
                    <div>
                      {recentlyUsed.map((id) => {
                        const feature = findFeatureById(id)
                        if (!feature) return null
                        
                        return (
                          <div
                            key={id}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md mb-1 group","
                              "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors","
                              currentPage === feature.path
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400""
                                : """
                            )}
                            onClick={() => handleNavigate(feature.path)}
                          >
                            <div className="flex items-center">"
                              <feature.icon className="h-4 w-4 mr-2" />"
                              <span className="text-sm">{feature.name}</span>"
                            </div>
                            
                            {!favorites.includes(feature.id) ? (
                              <Button
                                variant="ghost""
                                size="sm""
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100""
                                onClick={(e) => {
                                  e.stopPropagation()
                                  addToFavorites(feature.id)
                                }}
                              >
                                <Star className="h-3 w-3" />"
                              </Button>
                            ) : (
                              <Button
                                variant="ghost""
                                size="sm""
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100""
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFromFavorite(feature.id)
                                }}
                              >
                                <StarOff className="h-3 w-3" />"
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-sm text-gray-500">"
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />"
                      <p>No recent activity</p>
                      <p className="text-xs mt-1">Navigate to pages to see them here</p>"
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2">"
                    {recentlyUsed.slice(0, 5).map((id) => {
                      const feature = findFeatureById(id)
                      if (!feature) return null
                      
                      return (
                        <TooltipProvider key={id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={currentPage === feature.path ? 'default' : 'ghost'}
                                size="sm""
                                className="h-8 w-8 p-0""
                                onClick={() => handleNavigate(feature.path)}
                              >
                                <feature.icon className="h-4 w-4" />"
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">{feature.name}</TooltipContent>"
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* Related Features Section */}
            {expanded && relatedFeatures.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-800 mt-2">"
                <div className="text-xs font-medium text-gray-500 uppercase mb-2 px-2">"
                  Related Tools
                </div>
                
                {relatedFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center p-2 rounded-md mb-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors""
                    onClick={() => handleNavigate(feature.path)}
                  >
                    <feature.icon className="h-4 w-4 mr-2 text-gray-600" />"
                    <span className="text-sm">{feature.name}</span>"
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Footer with keyboard shortcuts */}
          {expanded && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-800">"
              <div className="flex items-center justify-between text-xs text-gray-500">"
                <div className="flex items-center gap-1">"
                  <Command className="h-3 w-3" />"
                  <span>.</span>
                </div>
                <span>Toggle sidebar</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">"
                <div className="flex items-center gap-1">"
                  <Command className="h-3 w-3" />"
                  <span>1-3</span>
                </div>
                <span>Switch views</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

// Missing icon definition
function Code(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg""
      width="24""
      height="24""
      viewBox="0 0 24 24""
      fill="none""
      stroke="currentColor""
      strokeWidth="2""
      strokeLinecap="round""
      strokeLinejoin="round""
    >
      <polyline points="16 18 22 12 16 6"></polyline>"
      <polyline points="8 6 2 12 8 18"></polyline>"
    </svg>
  )
}
