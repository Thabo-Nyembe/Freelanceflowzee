'use client'

import { useCallback, useEffect, useState, useMemo, useTransition } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  X,
  FolderKanban,
  Users,
  FileText,
  CheckSquare,
  Plus,
  Settings,
  LayoutDashboard,
  Clock,
  Star,
  ArrowRight,
  Loader2,
  History,
  Zap,
  Calendar,
  DollarSign,
  Briefcase,
  User,
  Mail,
  Hash,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface SearchResult {
  id: string
  type: 'project' | 'client' | 'invoice' | 'task'
  title: string
  subtitle?: string
  metadata?: Record<string, any>
  url: string
  icon: React.ElementType
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

interface RecentSearch {
  query: string
  timestamp: number
  resultCount: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  shortcut?: string
  action: () => void
  category: 'create' | 'navigate' | 'action'
}

interface GlobalSearchProps {
  className?: string
  placeholder?: string
  showTrigger?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RECENT_SEARCHES_KEY = 'kazi-recent-searches'
const MAX_RECENT_SEARCHES = 5
const SEARCH_DEBOUNCE_MS = 300
const MAX_RESULTS_PER_TYPE = 5

// ============================================================================
// HOOKS
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentSearches(parsed)
      } catch {
        // Invalid data, reset
        localStorage.removeItem(RECENT_SEARCHES_KEY)
      }
    }
  }, [])

  const addRecentSearch = useCallback((query: string, resultCount: number) => {
    if (!query.trim()) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.query.toLowerCase() !== query.toLowerCase())
      const newSearches = [
        { query, timestamp: Date.now(), resultCount },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES)

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches))
      return newSearches
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  }, [])

  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.query !== query)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered))
      return filtered
    })
  }, [])

  return { recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch }
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

async function searchProjects(query: string, userId: string): Promise<SearchResult[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('dashboard_projects')
    .select('id, name, description, client, status, priority, progress')
    .eq('user_id', userId)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,client.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(MAX_RESULTS_PER_TYPE)

  if (error || !data) return []

  return data.map((project) => ({
    id: project.id,
    type: 'project' as const,
    title: project.name,
    subtitle: project.client || project.description,
    metadata: { status: project.status, priority: project.priority, progress: project.progress },
    url: `/dashboard/projects-hub-v2/${project.id}`,
    icon: FolderKanban,
    badge: project.status,
    badgeVariant: project.status === 'Completed' ? 'default' : project.status === 'In Progress' ? 'secondary' : 'outline',
  }))
}

async function searchClients(query: string, userId: string): Promise<SearchResult[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, email, company, status, total_revenue')
    .eq('user_id', userId)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(MAX_RESULTS_PER_TYPE)

  if (error || !data) return []

  return data.map((client) => ({
    id: client.id,
    type: 'client' as const,
    title: client.name,
    subtitle: client.company || client.email,
    metadata: { status: client.status, revenue: client.total_revenue },
    url: `/dashboard/crm-v2/clients/${client.id}`,
    icon: Users,
    badge: client.status,
    badgeVariant: client.status === 'vip' ? 'default' : client.status === 'active' ? 'secondary' : 'outline',
  }))
}

async function searchInvoices(query: string, userId: string): Promise<SearchResult[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, client_name, total, status, currency')
    .eq('user_id', userId)
    .or(`invoice_number.ilike.%${query}%,client_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(MAX_RESULTS_PER_TYPE)

  if (error || !data) return []

  return data.map((invoice) => ({
    id: invoice.id,
    type: 'invoice' as const,
    title: `${invoice.invoice_number}`,
    subtitle: `${invoice.client_name} - ${invoice.currency} ${invoice.total.toLocaleString()}`,
    metadata: { status: invoice.status, total: invoice.total },
    url: `/dashboard/invoicing-v2/${invoice.id}`,
    icon: FileText,
    badge: invoice.status,
    badgeVariant: invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'outline',
  }))
}

async function searchTasks(query: string, userId: string): Promise<SearchResult[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_tasks')
    .select('id, title, description, priority, category, completed, date')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(MAX_RESULTS_PER_TYPE)

  if (error || !data) return []

  return data.map((task) => ({
    id: task.id,
    type: 'task' as const,
    title: task.title,
    subtitle: task.description || task.category,
    metadata: { priority: task.priority, completed: task.completed, date: task.date },
    url: `/dashboard/my-day-v2?task=${task.id}`,
    icon: CheckSquare,
    badge: task.completed ? 'Done' : task.priority,
    badgeVariant: task.completed ? 'default' : task.priority === 'urgent' ? 'destructive' : 'outline',
  }))
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GlobalSearch({
  className,
  placeholder = 'Search projects, clients, invoices...',
  showTrigger = true
}: GlobalSearchProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, startSearch] = useTransition()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS)
  const { recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch } = useRecentSearches()

  // Get user ID on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
      }
    })
  }, [])

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      // Escape to close
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open])

  // Perform search when query changes
  useEffect(() => {
    if (!debouncedQuery.trim() || !userId) {
      setResults([])
      return
    }

    startSearch(async () => {
      const [projects, clients, invoices, tasks] = await Promise.all([
        searchProjects(debouncedQuery, userId),
        searchClients(debouncedQuery, userId),
        searchInvoices(debouncedQuery, userId),
        searchTasks(debouncedQuery, userId),
      ])

      const allResults = [...projects, ...clients, ...invoices, ...tasks]
      setResults(allResults)
    })
  }, [debouncedQuery, userId])

  // Filter results by type if selected
  const filteredResults = useMemo(() => {
    if (!selectedType) return results
    return results.filter((r) => r.type === selectedType)
  }, [results, selectedType])

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    filteredResults.forEach((result) => {
      if (!groups[result.type]) {
        groups[result.type] = []
      }
      groups[result.type].push(result)
    })
    return groups
  }, [filteredResults])

  // Quick actions
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'new-project',
      title: 'Create New Project',
      description: 'Start a new project from scratch',
      icon: FolderKanban,
      shortcut: 'P',
      action: () => router.push('/dashboard/projects-hub-v2?action=new'),
      category: 'create',
    },
    {
      id: 'new-client',
      title: 'Add New Client',
      description: 'Add a new client to your CRM',
      icon: Users,
      shortcut: 'C',
      action: () => router.push('/dashboard/crm-v2?action=new'),
      category: 'create',
    },
    {
      id: 'new-invoice',
      title: 'Create Invoice',
      description: 'Generate a new invoice',
      icon: FileText,
      shortcut: 'I',
      action: () => router.push('/dashboard/invoicing-v2?action=new'),
      category: 'create',
    },
    {
      id: 'new-task',
      title: 'Add Task',
      description: 'Create a new task for today',
      icon: CheckSquare,
      shortcut: 'T',
      action: () => router.push('/dashboard/my-day-v2?action=new'),
      category: 'create',
    },
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'View your main dashboard',
      icon: LayoutDashboard,
      shortcut: 'D',
      action: () => router.push('/dashboard'),
      category: 'navigate',
    },
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Configure your preferences',
      icon: Settings,
      shortcut: ',',
      action: () => router.push('/dashboard/settings-v2'),
      category: 'navigate',
    },
    {
      id: 'calendar',
      title: 'Open Calendar',
      description: 'View your schedule',
      icon: Calendar,
      action: () => router.push('/dashboard/calendar-v2'),
      category: 'navigate',
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'See your performance metrics',
      icon: DollarSign,
      action: () => router.push('/dashboard/analytics-v2'),
      category: 'navigate',
    },
  ], [router])

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false)
    addRecentSearch(query, results.length)
    router.push(result.url)
  }, [router, query, results.length, addRecentSearch])

  const handleQuickAction = useCallback((action: QuickAction) => {
    setOpen(false)
    action.action()
  }, [])

  const handleRecentSearchClick = useCallback((recentQuery: string) => {
    setQuery(recentQuery)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return FolderKanban
      case 'client': return Users
      case 'invoice': return FileText
      case 'task': return CheckSquare
      default: return Search
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project': return 'Projects'
      case 'client': return 'Clients'
      case 'invoice': return 'Invoices'
      case 'task': return 'Tasks'
      default: return type
    }
  }

  return (
    <>
      {/* Trigger Button */}
      {showTrigger && (
        <Button
          variant="outline"
          className={cn(
            'relative h-9 w-full justify-start gap-2 text-sm text-muted-foreground',
            'sm:pr-12 md:w-40 lg:w-64',
            'hover:bg-accent hover:text-accent-foreground',
            'transition-colors duration-200',
            className
          )}
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="hidden lg:inline-flex">{placeholder}</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button>
      )}

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, clients, invoices, tasks..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isSearching && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
          {query && !isSearching && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Type Filter Pills */}
        {results.length > 0 && (
          <div className="flex gap-1 px-3 py-2 border-b">
            <Button
              variant={selectedType === null ? 'secondary' : 'ghost'}
              size="sm"
              className="h-6 text-xs"
              onClick={() => setSelectedType(null)}
            >
              All ({results.length})
            </Button>
            {Object.entries(groupedResults).map(([type, items]) => {
              const Icon = getTypeIcon(type)
              return (
                <Button
                  key={type}
                  variant={selectedType === type ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-6 text-xs gap-1"
                  onClick={() => setSelectedType(type === selectedType ? null : type)}
                >
                  <Icon className="h-3 w-3" />
                  {getTypeLabel(type)} ({items.length})
                </Button>
              )
            })}
          </div>
        )}

        <CommandList className="max-h-[400px] overflow-y-auto">
          <CommandEmpty>
            {query ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                <p className="text-xs text-muted-foreground mt-1">Try searching with different keywords</p>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">Start typing to search...</p>
              </div>
            )}
          </CommandEmpty>

          {/* Search Results */}
          {Object.entries(groupedResults).map(([type, items]) => (
            <CommandGroup key={type} heading={getTypeLabel(type)}>
              {items.map((result) => {
                const Icon = result.icon
                return (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    value={`${result.title} ${result.subtitle || ''}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                      )}
                    </div>
                    {result.badge && (
                      <Badge variant={result.badgeVariant || 'outline'} className="text-xs">
                        {result.badge}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}

          {/* Recent Searches (shown when no query) */}
          {!query && recentSearches.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent Searches">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-xs text-muted-foreground">Your recent searches</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={clearRecentSearches}
                  >
                    Clear all
                  </Button>
                </div>
                {recentSearches.map((recent) => (
                  <CommandItem
                    key={recent.timestamp}
                    value={recent.query}
                    onSelect={() => handleRecentSearchClick(recent.query)}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <History className="h-4 w-4 opacity-50" />
                    <div className="flex-1">
                      <span className="text-sm">{recent.query}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {recent.resultCount} results
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRecentSearch(recent.query)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Quick Actions (shown when no query) */}
          {!query && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Quick Actions">
                {quickActions
                  .filter((a) => a.category === 'create')
                  .map((action) => {
                    const Icon = action.icon
                    return (
                      <CommandItem
                        key={action.id}
                        value={action.title}
                        onSelect={() => handleQuickAction(action)}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                        {action.shortcut && (
                          <CommandShortcut>{action.shortcut}</CommandShortcut>
                        )}
                      </CommandItem>
                    )
                  })}
              </CommandGroup>

              <CommandSeparator />
              <CommandGroup heading="Navigation">
                {quickActions
                  .filter((a) => a.category === 'navigate')
                  .map((action) => {
                    const Icon = action.icon
                    return (
                      <CommandItem
                        key={action.id}
                        value={action.title}
                        onSelect={() => handleQuickAction(action)}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <Icon className="h-4 w-4 opacity-70" />
                        <div className="flex-1">
                          <span className="text-sm">{action.title}</span>
                        </div>
                        {action.shortcut && (
                          <CommandShortcut>&#8984;{action.shortcut}</CommandShortcut>
                        )}
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            </>
          )}

          {/* Tips */}
          {!query && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Tips">
                <CommandItem disabled className="opacity-70">
                  <Zap className="mr-2 h-4 w-4" />
                  <span className="text-xs">Press <kbd className="bg-muted px-1 rounded">&#8984;K</kbd> anytime to open search</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

// ============================================================================
// HOOK EXPORT
// ============================================================================

export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
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

export default GlobalSearch
