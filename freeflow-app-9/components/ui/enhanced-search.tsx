'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  Command,
  History,
  Bookmark,
  User,
  FileText,
  Image,
  Video,
  Settings,
  Zap,
  Star
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TooltipProvider
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface SearchSuggestion {
  id: string
  title: string
  subtitle?: string
  type: 'recent' | 'trending' | 'suggestion' | 'quick-action' | 'content'
  icon?: React.ReactNode
  href?: string
  action?: () => void
  metadata?: {
    category?: string
    tags?: string[]
    lastUsed?: string
    popularity?: number
  }
}

interface SearchFilter {
  id: string
  label: string
  value: string
  count?: number
  icon?: React.ReactNode
}

interface EnhancedSearchProps {
  placeholder?: string
  className?: string
  showFilters?: boolean
  showSuggestions?: boolean
  enableKeyboardShortcuts?: boolean
  onSearch?: (query: string, filters: string[]) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  customSuggestions?: SearchSuggestion[]
  customFilters?: SearchFilter[]
}

// Mock data for suggestions
const defaultSuggestions: SearchSuggestion[] = [
  {
    id: '1',
    title: 'Create new project',
    subtitle: 'Start a new project in Projects Hub',
    type: 'quick-action',
    icon: <Zap className="h-4 w-4" />,
    action: () => console.log('Create project')
  },
  {
    id: '2',
    title: 'Time tracking dashboard',
    subtitle: 'View your time analytics',
    type: 'recent',
    icon: <Clock className="h-4 w-4" />,
    href: '/dashboard/time-tracking-v2'
  },
  {
    id: '3',
    title: 'Video editing tutorials',
    subtitle: 'Learn advanced video editing',
    type: 'trending',
    icon: <Video className="h-4 w-4" />,
    metadata: { popularity: 95 }
  },
  {
    id: '4',
    title: 'Client presentation deck',
    subtitle: 'Last opened 2 hours ago',
    type: 'content',
    icon: <FileText className="h-4 w-4" />,
    metadata: { lastUsed: '2 hours ago', category: 'Documents' }
  },
  {
    id: '5',
    title: 'Brand assets collection',
    subtitle: 'Design resources and templates',
    type: 'content',
    icon: <Image className="h-4 w-4" />,
    metadata: { category: 'Design' }
  }
]

const defaultFilters: SearchFilter[] = [
  { id: 'all', label: 'All', value: 'all', count: 1247 },
  { id: 'projects', label: 'Projects', value: 'projects', count: 156, icon: <Settings className="h-3 w-3" /> },
  { id: 'files', label: 'Files', value: 'files', count: 892, icon: <FileText className="h-3 w-3" /> },
  { id: 'people', label: 'People', value: 'people', count: 43, icon: <User className="h-3 w-3" /> },
  { id: 'media', label: 'Media', value: 'media', count: 234, icon: <Image className="h-3 w-3" /> },
  { id: 'bookmarks', label: 'Bookmarks', value: 'bookmarks', count: 67, icon: <Bookmark className="h-3 w-3" /> }
]

export function EnhancedSearch({
  placeholder = "Search everything...",
  className,
  showFilters = true,
  showSuggestions = true,
  enableKeyboardShortcuts = true,
  onSearch,
  onSuggestionSelect,
  customSuggestions,
  customFilters
}: EnhancedSearchProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>(['all'])
  const [recentSearches, setRecentSearches] = React.useState<string[]>([
    'project templates',
    'client feedback',
    'video assets',
    'time reports'
  ])
  const [focusedIndex, setFocusedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const suggestions = customSuggestions || defaultSuggestions
  const filters = customFilters || defaultFilters

  // Filter suggestions based on query
  const filteredSuggestions = React.useMemo(() => {
    if (!query.trim()) {
      return suggestions.slice(0, 6)
    }
    
    return suggestions
      .filter(suggestion => 
        suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8)
  }, [query, suggestions])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!enableKeyboardShortcuts) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }

      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
        setFocusedIndex(-1)
      }

      // Arrow navigation when search is open
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setFocusedIndex(prev => 
            prev < filteredSuggestions.length - 1 ? prev + 1 : prev
          )
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setFocusedIndex(prev => prev > -1 ? prev - 1 : -1)
        } else if (e.key === 'Enter' && focusedIndex >= 0) {
          e.preventDefault()
          handleSuggestionSelect(filteredSuggestions[focusedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardShortcuts, isOpen, focusedIndex, filteredSuggestions])

  const handleSuggestionSelect = React.useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.href) {
      router.push(suggestion.href)
    } else if (suggestion.action) {
      suggestion.action()
    }
    
    setQuery('')
    setIsOpen(false)
    setFocusedIndex(-1)
    
    // Add to recent searches if it's a search query
    if (suggestion.type === 'suggestion' && suggestion.title) {
      setRecentSearches(prev => {
        const newRecent = [suggestion.title, ...prev.filter(item => item !== suggestion.title)]
        return newRecent.slice(0, 5)
      })
    }

    onSuggestionSelect?.(suggestion)
  }, [router, onSuggestionSelect])

  const handleSearch = React.useCallback(() => {
    if (query.trim()) {
      setRecentSearches(prev => {
        const newRecent = [query, ...prev.filter(item => item !== query)]
        return newRecent.slice(0, 5)
      })
      
      onSearch?.(query, selectedFilters)
      setIsOpen(false)
    }
  }, [query, selectedFilters, onSearch])

  const handleFilterToggle = React.useCallback((filterId: string) => {
    if (filterId === 'all') {
      setSelectedFilters(['all'])
    } else {
      setSelectedFilters(prev => {
        const newFilters = prev.includes(filterId)
          ? prev.filter(id => id !== filterId)
          : [...prev.filter(id => id !== 'all'), filterId]
        
        return newFilters.length === 0 ? ['all'] : newFilters
      })
    }
  }, [])

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon
    
    switch (suggestion.type) {
      case 'recent': return <Clock className="h-4 w-4" />
      case 'trending': return <TrendingUp className="h-4 w-4" />
      case 'quick-action': return <Zap className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("relative", className)}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={inputRef}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && focusedIndex === -1) {
                    handleSearch()
                  }
                }}
                className={cn(
                  "pl-10 pr-20 transition-all duration-200",
                  isOpen && "ring-2 ring-blue-500 border-blue-500"
                )}
                data-testid="enhanced-search-input"
              />
              
              {/* Keyboard shortcut hint */}
              {enableKeyboardShortcuts && !query && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-400">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              )}
              
              {/* Clear button */}
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  data-testid="search-clear-btn"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-[600px] p-0 mt-2" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="max-h-[500px] overflow-hidden">
              {/* Filters */}
              {showFilters && (
                <div className="p-4 border-b">
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                      <Button
                        key={filter.id}
                        variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterToggle(filter.id)}
                        className="h-7 text-xs"
                        data-testid={`search-filter-${filter.id}`}
                      >
                        {filter.icon}
                        <span className="ml-1">{filter.label}</span>
                        {filter.count && (
                          <Badge variant="secondary" className="ml-1 h-4 text-xs">
                            {filter.count}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <ScrollArea className="max-h-[400px]">
                <div className="p-2">
                  {/* Recent searches */}
                  {!query && recentSearches.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-gray-500">
                        <History className="h-3 w-3" />
                        <span>Recent searches</span>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <motion.button
                            key={search}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                              setQuery(search)
                              handleSearch()
                            }}
                            className="w-full flex items-center space-x-3 px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors"
                            data-testid={`recent-search-${index}`}
                          >
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{search}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-gray-500 mb-2">
                        <Sparkles className="h-3 w-3" />
                        <span>{query ? 'Search results' : 'Quick actions'}</span>
                      </div>
                      <div className="space-y-1">
                        {filteredSuggestions.map((suggestion, index) => (
                          <motion.button
                            key={suggestion.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className={cn(
                              "w-full flex items-center space-x-3 px-2 py-3 rounded-md text-left transition-colors",
                              focusedIndex === index 
                                ? "bg-blue-50 dark:bg-blue-900/20" 
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            data-testid={`search-suggestion-${suggestion.id}`}
                          >
                            <div className="flex-shrink-0 text-gray-500">
                              {getSuggestionIcon(suggestion)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {suggestion.title}
                              </p>
                              {suggestion.subtitle && (
                                <p className="text-xs text-gray-500 truncate">
                                  {suggestion.subtitle}
                                </p>
                              )}
                              {suggestion.metadata?.tags && (
                                <div className="flex space-x-1 mt-1">
                                  {suggestion.metadata.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs h-4">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0 flex items-center space-x-2">
                              {suggestion.type === 'trending' && (
                                <Badge variant="secondary" className="text-xs">
                                  Trending
                                </Badge>
                              )}
                              {suggestion.metadata?.popularity && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Star className="h-3 w-3" />
                                  <span>{suggestion.metadata.popularity}%</span>
                                </div>
                              )}
                              <ArrowRight className="h-3 w-3 text-gray-400" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {query && filteredSuggestions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No results found for "{query}"</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t px-4 py-2 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Press ↵ to search</span>
                    <span>↑↓ to navigate</span>
                    <span>Esc to close</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Powered by</span>
                    <Sparkles className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  )
}

export default EnhancedSearch
