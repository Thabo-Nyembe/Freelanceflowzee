'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ChevronRight, 
  Home, 
  Copy, 
  ExternalLink,
  MoreHorizontal,
  Keyboard,
  ArrowLeft,
  ArrowRight,
  Clock,
  Star,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  title: string
  href: string
  icon?: React.ReactNode
  isActive?: boolean
  metadata?: {
    lastVisited?: string
    visitCount?: number
    isBookmarked?: boolean
    hasNotifications?: boolean
  }
}

interface EnhancedBreadcrumbProps {
  items: BreadcrumbItem[]
  maxItems?: number
  showMetadata?: boolean
  enableKeyboardNav?: boolean
  enableContextMenu?: boolean
  className?: string
}

// Path mapping for dynamic breadcrumb generation
const pathMapping: Record<string, { title: string; icon?: React.ReactNode }> = {
  '/dashboard': { title: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  '/dashboard/projects-hub': { title: 'Projects Hub', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/time-tracking': { title: 'Time Tracking', icon: <Clock className="h-4 w-4" /> },
  '/dashboard/analytics': { title: 'Analytics', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/files-hub': { title: 'Files Hub', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/my-day': { title: 'My Day', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/video-studio': { title: 'Video Studio', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/community-hub': { title: 'Community Hub', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/financial-hub': { title: 'Financial Hub', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/gallery': { title: 'Gallery Studio', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/ai-create': { title: 'AI Create Studio', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/canvas': { title: 'Canvas Studio', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/booking': { title: 'Booking System', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/ai-assistant': { title: 'AI Assistant', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/notifications': { title: 'Notifications', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/invoices': { title: 'Invoices', icon: <Settings className="h-4 w-4" /> },
  '/dashboard/workflow-builder': { title: 'Workflow Builder', icon: <Settings className="h-4 w-4" /> },
}

export function EnhancedBreadcrumb({ 
  items, 
  maxItems = 5,
  showMetadata = true,
  enableKeyboardNav = true,
  enableContextMenu = true,
  className 
}: EnhancedBreadcrumbProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [recentPaths, setRecentPaths] = React.useState<string[]>([])
  const [bookmarks, setBookmarks] = React.useState<string[]>([])
  const [isKeyboardMode, setIsKeyboardMode] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)

  // Generate breadcrumb items from current path if not provided
  const breadcrumbItems = React.useMemo(() => {
    if (items.length > 0) return items

    const pathSegments = pathname.split('/').filter(Boolean)
    const generatedItems: BreadcrumbItem[] = []

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const pathInfo = pathMapping[currentPath] || { 
        title: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ') 
      }
      
      generatedItems.push({
        title: pathInfo.title,
        href: currentPath,
        icon: pathInfo.icon,
        isActive: index === pathSegments.length - 1,
        metadata: {
          lastVisited: new Date().toISOString(),
          visitCount: Math.floor(Math.random() * 50) + 1,
          isBookmarked: bookmarks.includes(currentPath),
          hasNotifications: Math.random() > 0.7
        }
      })
    })

    return generatedItems
  }, [pathname, items, bookmarks])

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!enableKeyboardNav) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'b') {
        e.preventDefault()
        setIsKeyboardMode(true)
        setActiveIndex(0)
      }

      if (isKeyboardMode) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault()
            setActiveIndex(prev => Math.max(0, prev - 1))
            break
          case 'ArrowRight':
            e.preventDefault()
            setActiveIndex(prev => Math.min(breadcrumbItems.length - 1, prev + 1))
            break
          case 'Enter':
            e.preventDefault()
            if (activeIndex >= 0 && activeIndex < breadcrumbItems.length) {
              router.push(breadcrumbItems[activeIndex].href)
            }
            setIsKeyboardMode(false)
            break
          case 'Escape':
            e.preventDefault()
            setIsKeyboardMode(false)
            setActiveIndex(-1)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardNav, isKeyboardMode, activeIndex, breadcrumbItems, router])

  // Handle bookmark toggle
  const toggleBookmark = React.useCallback((href: string) => {
    setBookmarks(prev => 
      prev.includes(href) 
        ? prev.filter(path => path !== href)
        : [...prev, href]
    )
  }, [])

  // Copy current path to clipboard
  const copyPath = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy path:', error)
    }
  }, [])

  // Truncate items if exceeding maxItems
  const visibleItems = breadcrumbItems.length > maxItems 
    ? [
        breadcrumbItems[0],
        { title: '...', href: '', icon: <MoreHorizontal className="h-4 w-4" /> },
        ...breadcrumbItems.slice(-maxItems + 2)
      ]
    : breadcrumbItems

  return (
    <TooltipProvider>
      <nav 
        className={cn(
          "flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400",
          isKeyboardMode && "ring-2 ring-blue-500 rounded-lg p-2",
          className
        )}
        aria-label="Breadcrumb navigation"
        data-testid="enhanced-breadcrumb"
      >
        {visibleItems.map((item, index) => (
          <div key={`${item.href}-${index}`} className="flex items-center">
            {/* Breadcrumb Item */}
            <motion.div
              className={cn(
                "flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200",
                item.isActive 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800",
                isKeyboardMode && activeIndex === index && "ring-2 ring-blue-400 bg-blue-50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.href === '' ? (
                // Ellipsis item (collapsed)
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-1">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    {breadcrumbItems.slice(1, -maxItems + 2).map((hiddenItem) => (
                      <DropdownMenuItem 
                        key={hiddenItem.href}
                        onClick={() => router.push(hiddenItem.href)}
                        className="flex items-center space-x-2"
                      >
                        {hiddenItem.icon}
                        <span>{hiddenItem.title}</span>
                        {showMetadata && hiddenItem.metadata?.hasNotifications && (
                          <Badge variant="destructive" className="ml-auto h-2 w-2 p-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {/* Main breadcrumb link */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        data-testid={`breadcrumb-item-${item.title ? item.title.toLowerCase().replace(/\s+/g, '-') : ''}`}
                      >
                        {item.icon && (
                          <span className="flex-shrink-0">
                            {item.icon}
                          </span>
                        )}
                        <span className="truncate max-w-32">{item.title}</span>
                        {showMetadata && item.metadata?.hasNotifications && (
                          <Badge variant="destructive" className="h-2 w-2 p-0 ml-1" />
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.href}</p>
                        {showMetadata && item.metadata && (
                          <div className="text-xs space-y-1">
                            {item.metadata.visitCount && (
                              <p>Visits: {item.metadata.visitCount}</p>
                            )}
                            {item.metadata.lastVisited && (
                              <p>Last visited: {new Date(item.metadata.lastVisited).toLocaleDateString()}</p>
                            )}
                          </div>
                        )}
                        {enableKeyboardNav && (
                          <p className="text-xs text-gray-400">
                            Press Alt+B to navigate with keyboard
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Context menu */}
                  {enableContextMenu && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto w-auto p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={() => router.push(item.href)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in new tab
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={copyPath}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleBookmark(item.href)}>
                          {item.metadata?.isBookmarked ? (
                            <>
                              <Star className="h-4 w-4 mr-2 fill-current" />
                              Remove bookmark
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Add bookmark
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </motion.div>

            {/* Separator */}
            {index < visibleItems.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" />
            )}
          </div>
        ))}

        {/* Keyboard navigation indicator */}
        {enableKeyboardNav && isKeyboardMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-4 flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
          >
            <Keyboard className="h-3 w-3" />
            <span>Use ← → Enter Esc</span>
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="ml-auto flex items-center space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="h-auto p-1"
                data-testid="breadcrumb-back-btn"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go back (Alt+←)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.forward()}
                className="h-auto p-1"
                data-testid="breadcrumb-forward-btn"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go forward (Alt+→)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyPath}
                className="h-auto p-1"
                data-testid="breadcrumb-copy-btn"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy current URL</TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  )
}

// Auto-generating breadcrumb hook
export function useBreadcrumb() {
  const pathname = usePathname()
  
  return React.useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const pathInfo = pathMapping[currentPath] || { 
        title: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ') 
      }
      
      items.push({
        title: pathInfo.title,
        href: currentPath,
        icon: pathInfo.icon,
        isActive: index === pathSegments.length - 1
      })
    })

    return items
  }, [pathname])
}

export default EnhancedBreadcrumb
