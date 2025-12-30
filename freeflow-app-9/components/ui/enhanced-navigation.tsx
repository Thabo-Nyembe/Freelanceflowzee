"use client"

import { useState, useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Home, 
  ArrowRight,
  Star,
  X,
  FolderOpen,
  TrendingUp,
  Clock,
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
  Calendar,
  MessageSquare,
  Building,
  UserCheck,
  FileText,
  Archive,
  Cloud,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Feature category mappings
const featureCategories = {
  core: [
    { name: 'My Day', path: 'my-day', icon: Calendar, description: 'AI-powered daily planning and productivity optimization' },
    { name: 'Projects Hub', path: 'projects-hub', icon: FolderOpen, description: 'Complete project lifecycle management system' },
    { name: 'Analytics', path: 'analytics', icon: TrendingUp, description: 'Advanced business intelligence and reporting' },
    { name: 'Time Tracking', path: 'time-tracking', icon: Clock, description: 'Advanced time tracking and productivity metrics' }
  ],
  ai: [
    { name: 'AI Create', path: 'ai-create', icon: Brain, description: 'Multi-model AI studio (GPT-4o, Claude, DALL-E)' },
    { name: 'AI Design', path: 'ai-design', icon: Palette, description: 'AI-powered design generation and optimization' },
    { name: 'AI Assistant', path: 'ai-assistant', icon: Zap, description: 'Personal AI assistant for workflow automation' },
    { name: 'AI Enhanced', path: 'ai-enhanced', icon: Star, description: 'Enhanced AI features and capabilities' }
  ],
  creative: [
    { name: 'Video Studio', path: 'video-studio', icon: Video, description: 'Professional video editing with AI transcription' },
    { name: 'Canvas', path: 'canvas', icon: Monitor, description: 'Interactive design and collaboration canvas' },
    { name: 'Canvas Collaboration', path: 'canvas-collaboration', icon: Users, description: 'Real-time canvas collaboration' },
    { name: 'Gallery', path: 'gallery', icon: Image, description: 'Portfolio showcase and asset management' },
    { name: 'CV & Portfolio', path: 'cv-portfolio', icon: User, description: 'Professional portfolio and resume builder' }
  ],
  business: [
    { name: 'Financial Hub', path: 'financial-hub', icon: DollarSign, description: 'Complete financial management and reporting' },
    { name: 'Financial', path: 'financial', icon: Wallet, description: 'Financial tracking and budgeting' },
    { name: 'Invoices', path: 'invoices', icon: Receipt, description: 'Invoice generation and payment tracking' },
    { name: 'Escrow', path: 'escrow', icon: Shield, description: 'Secure milestone-based payment protection' },
    { name: 'Bookings', path: 'bookings', icon: Calendar, description: 'Appointment and meeting scheduling system' }
  ],
  communication: [
    { name: 'Messages', path: 'messages', icon: MessageSquare, description: 'Integrated communication hub' },
    { name: 'Collaboration', path: 'collaboration', icon: Users, description: 'Real-time project collaboration tools' },
    { name: 'Team Hub', path: 'team-hub', icon: Building, description: 'Team management and coordination' },
    { name: 'Client Zone', path: 'client-zone', icon: UserCheck, description: 'Client portal and project sharing' },
    { name: 'Clients', path: 'clients', icon: Users, description: 'Client relationship management' }
  ],
  storage: [
    { name: 'Files Hub', path: 'files-hub', icon: FileText, description: 'Multi-cloud storage with optimization' },
    { name: 'Files', path: 'files', icon: Archive, description: 'File management and organization' },
    { name: 'Cloud Storage', path: 'cloud-storage', icon: Cloud, description: 'Advanced cloud storage management' },
    { name: 'Storage', path: 'storage', icon: Archive, description: 'Storage management and analytics' }
  ],
  community: [
    { name: 'Community Hub', path: 'community-hub', icon: Globe, description: 'Connect with 2,800+ creative professionals' },
    { name: 'Community', path: 'community', icon: Globe, description: 'Community features and networking' }
  ]
}

// Related features mapping - suggests related tools based on current page
const relatedFeaturesMap: Record<string, Array<{category: string, path: string}>> = {
  'projects-hub': [
    { category: 'core', path: 'time-tracking' },
    { category: 'business', path: 'invoices' },
    { category: 'communication', path: 'team-hub' }
  ],
  'analytics': [
    { category: 'business', path: 'financial-hub' },
    { category: 'core', path: 'projects-hub' },
    { category: 'creative', path: 'video-studio' }
  ],
  'ai-assistant': [
    { category: 'ai', path: 'ai-create' },
    { category: 'ai', path: 'ai-design' },
    { category: 'core', path: 'my-day' }
  ],
  'financial-hub': [
    { category: 'business', path: 'invoices' },
    { category: 'business', path: 'escrow' },
    { category: 'core', path: 'analytics' }
  ],
  'invoices': [
    { category: 'business', path: 'financial-hub' },
    { category: 'business', path: 'escrow' },
    { category: 'core', path: 'projects-hub' }
  ],
  'team-hub': [
    { category: 'communication', path: 'client-zone' },
    { category: 'communication', path: 'messages' },
    { category: 'core', path: 'projects-hub' }
  ],
  'client-zone': [
    { category: 'communication', path: 'team-hub' },
    { category: 'business', path: 'invoices' },
    { category: 'storage', path: 'files-hub' }
  ],
  'files-hub': [
    { category: 'storage', path: 'cloud-storage' },
    { category: 'creative', path: 'gallery' },
    { category: 'communication', path: 'client-zone' }
  ],
  'video-studio': [
    { category: 'creative', path: 'canvas' },
    { category: 'ai', path: 'ai-create' },
    { category: 'storage', path: 'files-hub' }
  ],
  'messages': [
    { category: 'communication', path: 'collaboration' },
    { category: 'communication', path: 'team-hub' },
    { category: 'communication', path: 'client-zone' }
  ],
  // Default related features for pages not explicitly mapped
  'default': [
    { category: 'core', path: 'projects-hub' },
    { category: 'core', path: 'my-day' },
    { category: 'communication', path: 'messages' }
  ]
}

// Multi-step workflows - defines pages that are part of a sequence
const workflowSequences: Record<string, {prev?: string, next?: string}> = {
  'projects-hub': { next: 'projects-hub/create' },
  'projects-hub/create': { prev: 'projects-hub', next: 'projects-hub/templates' },
  'projects-hub/templates': { prev: 'projects-hub/create', next: 'team-hub' },
  'team-hub': { prev: 'projects-hub/templates', next: 'client-zone' },
  'client-zone': { prev: 'team-hub', next: 'invoices' },
  'invoices': { prev: 'client-zone', next: 'escrow' },
  'escrow': { prev: 'invoices' },
  
  'ai-create': { next: 'ai-design' },
  'ai-design': { prev: 'ai-create', next: 'ai-assistant' },
  'ai-assistant': { prev: 'ai-design' },
  
  'video-studio': { next: 'video-studio/editor/new' },
  'video-studio/editor/new': { prev: 'video-studio' }
}

// Quick actions based on current page
const quickActionsMap: Record<string, Array<{name: string, path: string, icon: any}>> = {
  'projects-hub': [
    { name: 'New Project', path: 'projects-hub/create', icon: FolderOpen },
    { name: 'Track Time', path: 'time-tracking', icon: Clock },
    { name: 'Invoice Client', path: 'invoices', icon: Receipt }
  ],
  'invoices': [
    { name: 'New Invoice', path: 'invoices/create', icon: Receipt },
    { name: 'Financial Overview', path: 'financial-hub', icon: DollarSign },
    { name: 'Escrow Payment', path: 'escrow', icon: Shield }
  ],
  'team-hub': [
    { name: 'Add Member', path: 'team-hub/add', icon: Users },
    { name: 'Message Team', path: 'messages', icon: MessageSquare },
    { name: 'Assign Tasks', path: 'projects-hub', icon: FolderOpen }
  ],
  'files-hub': [
    { name: 'Upload File', path: 'files-hub/upload', icon: FileText },
    { name: 'Share Files', path: 'client-zone', icon: UserCheck },
    { name: 'Storage Analytics', path: 'analytics', icon: TrendingUp }
  ],
  'default': [
    { name: 'Dashboard', path: '', icon: Home },
    { name: 'Projects', path: 'projects-hub', icon: FolderOpen },
    { name: 'Messages', path: 'messages', icon: MessageSquare }
  ]
}

// Helper function to find feature details by path
const findFeatureByPath = (path: string) => {
  for (const category in featureCategories) {
    const feature = featureCategories[category as keyof typeof featureCategories]
      .find(f => f.path === path)
    
    if (feature) {
      return { ...feature, category }
    }
  }
  return null
}

// Helper function to get all features flattened
const getAllFeatures = () => {
  const allFeatures: Array<any> = []
  
  Object.keys(featureCategories).forEach(category => {
    featureCategories[category as keyof typeof featureCategories].forEach(feature => {
      allFeatures.push({
        ...feature,
        category
      })
    })
  })
  
  return allFeatures
}

interface EnhancedNavigationProps {
  className?: string
  showBreadcrumbs?: boolean
  showRelated?: boolean
  showQuickActions?: boolean
  showWorkflowNav?: boolean
  showSearch?: boolean
  variant?: 'default' | 'minimal' | 'expanded'
  onNavigate?: (path: string) => void
}

export function EnhancedNavigation({
  className,
  showBreadcrumbs = true,
  showRelated = true,
  showQuickActions = true,
  showWorkflowNav = true,
  showSearch = true,
  variant = 'default',
  onNavigate
}: EnhancedNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  // Extract the current page from the pathname
  const dashboardPath = pathname.replace(/^\/dashboard\/?/, '')
  const pathSegments = dashboardPath ? dashboardPath.split('/') : []
  const currentPage = pathSegments[0] || ''
  
  // Get workflow sequence for current page
  const workflowSequence = useMemo(() => {
    const fullPath = dashboardPath || ''
    return workflowSequences[fullPath] || null
  }, [dashboardPath])
  
  // Get related features for current page
  const relatedFeatures = useMemo(() => {
    const relatedPaths = relatedFeaturesMap[currentPage] || relatedFeaturesMap.default
    
    return relatedPaths.map(related => {
      const features = featureCategories[related.category as keyof typeof featureCategories]
      return features.find(f => f.path === related.path)
    }).filter(Boolean)
  }, [currentPage])
  
  // Get quick actions for current page
  const quickActions = useMemo(() => {
    return quickActionsMap[currentPage] || quickActionsMap.default
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
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      router.push(`/dashboard/${path}`)
    }
  }
  
  // Generate breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs = [{ name: 'Dashboard', path: '' }]
    
    if (pathSegments.length > 0 && pathSegments[0]) {
      // Add each path segment as a breadcrumb
      let cumulativePath = ''
      
      for (let i = 0; i < pathSegments.length; i++) {
        cumulativePath += (i === 0 ? '' : '/') + pathSegments[i]
        
        // Try to find a feature name for this path
        let segmentName = pathSegments[i]
        
        if (i === 0) {
          // For the first level, check if it's a known feature
          const feature = findFeatureByPath(segmentName)
          if (feature) {
            segmentName = feature.name
          }
        } else {
          // For deeper levels, capitalize and replace hyphens with spaces
          segmentName = segmentName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }
        
        crumbs.push({
          name: segmentName,
          path: cumulativePath
        })
      }
    }
    
    return crumbs
  }, [pathSegments])
  
  return (
    <div className={cn(
      "w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-2 px-4",
      variant === 'minimal' ? 'py-1' : 'py-2',
      variant === 'expanded' ? 'py-3' : '',
      className
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          {/* Top row with breadcrumbs and search */}
          <div className="flex items-center justify-between">
            {showBreadcrumbs && (
              <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 mx-1 flex-shrink-0" />
                    )}
                    <Link 
                      href={`/dashboard/${crumb.path}`}
                      className={cn(
                        "hover:text-blue-600 transition-colors",
                        index === breadcrumbs.length - 1 
                          ? "font-medium text-gray-900 dark:text-gray-100" 
                          : "text-gray-500 dark:text-gray-400"
                      )}
                      aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                    >
                      {crumb.name}
                    </Link>
                  </div>
                ))}
              </nav>
            )}
            
            {showSearch && (
              <div className="relative">
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      aria-label="Search features"
                    >
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">Quick Search</span>
                      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="end">
                    <div className="flex items-center border-b p-2">
                      <Search className="h-4 w-4 text-gray-400 mr-2" />
                      <Input 
                        placeholder="Search features..." 
                        className="border-0 focus-visible:ring-0 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {searchQuery && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0" 
                          onClick={() => setSearchQuery('')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[300px]">
                      {searchResults.length > 0 ? (
                        <div className="p-2">
                          {searchResults.map((result, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              className="w-full justify-start text-left mb-1"
                              onClick={() => {
                                handleNavigate(result.path)
                                setIsSearchOpen(false)
                                setSearchQuery('')
                              }}
                            >
                              <result.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                              <div>
                                <div className="font-medium">{result.name}</div>
                                <div className="text-xs text-gray-500 truncate">{result.description}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : searchQuery.length > 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No results found for "{searchQuery}"
                        </div>
                      ) : (
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-500 mb-2 px-2">SUGGESTED</div>
                          {[
                            { name: 'Projects Hub', path: 'projects-hub', icon: FolderOpen },
                            { name: 'AI Assistant', path: 'ai-assistant', icon: Zap },
                            { name: 'Time Tracking', path: 'time-tracking', icon: Clock },
                            { name: 'Financial Hub', path: 'financial-hub', icon: DollarSign }
                          ].map((item, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              className="w-full justify-start text-left mb-1"
                              onClick={() => {
                                handleNavigate(item.path)
                                setIsSearchOpen(false)
                              }}
                            >
                              <item.icon className="h-4 w-4 mr-2" />
                              {item.name}
                            </Button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          
          {/* Bottom row with workflow navigation, quick actions, and related features */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Workflow navigation (Back/Next) */}
            {showWorkflowNav && workflowSequence && (
              <div className="flex items-center space-x-2">
                {workflowSequence.prev && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleNavigate(workflowSequence.prev!)}
                    aria-label={`Go back to previous step`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                )}
                
                {workflowSequence.next && (
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => handleNavigate(workflowSequence.next!)}
                    aria-label={`Continue to next step`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            
            {/* Quick Actions */}
            {showQuickActions && variant !== 'minimal' && (
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2 hidden sm:inline">Quick Actions:</span>
                <div className="flex items-center space-x-1">
                  {quickActions.map((action, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleNavigate(action.path)}
                          >
                            <action.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{action.name}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{action.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}
            
            {/* Related Features */}
            {showRelated && variant === 'expanded' && (
              <div className="flex items-center ml-auto">
                <span className="text-xs text-gray-500 mr-2">Related:</span>
                <div className="flex items-center space-x-1">
                  {relatedFeatures.map((feature, index) => (
                    feature && (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="gap-1 h-7 text-xs"
                        onClick={() => handleNavigate(feature.path)}
                      >
                        <feature.icon className="h-3 w-3" />
                        {feature.name}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Related Features Row (for default and expanded variants) */}
          {showRelated && variant !== 'minimal' && relatedFeatures.length > 0 && (
            <div className="flex items-center pt-1 overflow-x-auto pb-1 scrollbar-hide">
              <Badge variant="outline" className="mr-2 shrink-0">Related Tools</Badge>
              <div className="flex items-center space-x-2">
                {relatedFeatures.map((feature, index) => (
                  feature && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 border border-gray-200 dark:border-gray-800 gap-2 shrink-0"
                        onClick={() => handleNavigate(feature.path)}
                      >
                        <feature.icon className="h-4 w-4" />
                        {feature.name}
                        <ArrowRight className="h-3 w-3 ml-1 text-gray-400" />
                      </Button>
                    </motion.div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
