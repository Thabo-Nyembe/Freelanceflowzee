import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

// Icons
import {
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  Home,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Zap,
  Settings,
  Plus,
  Download,
  Share2,
  Edit,
  Clock,
  Star
} from 'lucide-react';

// Components
import {
  Button,
  buttonVariants
} from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Types
export interface Breadcrumb {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  shortcut?: string;
  tooltip?: string;
}

export interface RelatedFeature {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

export interface WorkflowStep {
  id: string;
  label: string;
  href: string;
  completed: boolean;
  current: boolean;
}

export interface EnhancedNavigationProps {
  /**
   * Current path used for breadcrumb generation and context
   */
  currentPath: string;
  
  /**
   * Breadcrumbs to display in the navigation
   * If not provided, will be generated from currentPath
   */
  breadcrumbs?: Breadcrumb[];
  
  /**
   * Whether to show the search button
   * @default true
   */
  showSearch?: boolean;
  
  /**
   * Whether to show quick actions
   * @default true
   */
  showQuickActions?: boolean;
  
  /**
   * Quick actions to display
   * If not provided, will be generated based on context
   */
  quickActions?: QuickAction[];
  
  /**
   * Whether to show workflow navigation
   * @default false
   */
  showWorkflowNavigation?: boolean;
  
  /**
   * Workflow steps for navigation
   * Required if showWorkflowNavigation is true
   */
  workflowSteps?: WorkflowStep[];
  
  /**
   * Current workflow step index
   * Required if showWorkflowNavigation is true
   */
  currentWorkflowStep?: number;
  
  /**
   * Whether to show related features
   * @default true
   */
  showRelatedFeatures?: boolean;
  
  /**
   * Related features to display
   * If not provided, will be generated based on context
   */
  relatedFeatures?: RelatedFeature[];
  
  /**
   * Callback when search is opened
   */
  onSearchOpen?: () => void;
  
  /**
   * Callback when workflow navigation occurs
   */
  onWorkflowNavigate?: (direction: 'next' | 'prev', stepIndex: number) => void;
  
  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Search result interface for quick search
 */
interface SearchResult {
  id: string;
  title: string;
  category: string;
  href: string;
  icon?: React.ReactNode;
  keywords?: string[];
}

/**
 * Default search results based on common pages
 */
const DEFAULT_SEARCH_RESULTS: SearchResult[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    category: 'Pages',
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />,
    keywords: ['home', 'overview', 'main']
  },
  {
    id: 'projects',
    title: 'Projects Hub',
    category: 'Pages',
    href: '/dashboard/projects-hub',
    icon: <Search className="h-4 w-4" />,
    keywords: ['projects', 'tasks', 'management']
  },
  {
    id: 'analytics',
    title: 'Analytics',
    category: 'Pages',
    href: '/dashboard/analytics',
    icon: <Search className="h-4 w-4" />,
    keywords: ['stats', 'metrics', 'reports']
  },
  {
    id: 'financial',
    title: 'Financial Hub',
    category: 'Pages',
    href: '/dashboard/financial-hub',
    icon: <Search className="h-4 w-4" />,
    keywords: ['money', 'finance', 'invoices']
  },
  {
    id: 'create-project',
    title: 'Create New Project',
    category: 'Actions',
    href: '/dashboard/projects-hub/new',
    icon: <Plus className="h-4 w-4" />,
    keywords: ['new', 'add', 'project']
  },
  {
    id: 'create-invoice',
    title: 'Create New Invoice',
    category: 'Actions',
    href: '/dashboard/financial-hub/invoices/new',
    icon: <Plus className="h-4 w-4" />,
    keywords: ['new', 'add', 'invoice', 'billing']
  },
  {
    id: 'settings',
    title: 'Settings',
    category: 'Pages',
    href: '/dashboard/settings',
    icon: <Settings className="h-4 w-4" />,
    keywords: ['preferences', 'account', 'profile']
  }
];

/**
 * Default quick actions for various contexts
 */
const DEFAULT_QUICK_ACTIONS: Record<string, QuickAction[]> = {
  '/dashboard': [
    {
      id: 'create-project',
      label: 'New Project',
      icon: <Plus />,
      onClick: () => window.location.href = '/dashboard/projects-hub/new',
      tooltip: 'Create a new project'
    },
    {
      id: 'recent-activity',
      label: 'Activity',
      icon: <Clock />,
      onClick: () => window.location.href = '/dashboard/activity',
      tooltip: 'View recent activity'
    }
  ],
  '/dashboard/projects-hub': [
    {
      id: 'create-project',
      label: 'New Project',
      icon: <Plus />,
      onClick: () => window.location.href = '/dashboard/projects-hub/new',
      shortcut: '⌘N',
      tooltip: 'Create a new project'
    },
    {
      id: 'export-projects',
      label: 'Export',
      icon: <Download />,
      onClick: () => console.log('Export projects'),
      tooltip: 'Export projects data'
    }
  ],
  '/dashboard/financial-hub': [
    {
      id: 'create-invoice',
      label: 'New Invoice',
      icon: <Plus />,
      onClick: () => window.location.href = '/dashboard/financial-hub/invoices/new',
      shortcut: '⌘N',
      tooltip: 'Create a new invoice'
    },
    {
      id: 'export-financial',
      label: 'Export',
      icon: <Download />,
      onClick: () => console.log('Export financial data'),
      tooltip: 'Export financial data'
    }
  ],
  'default': [
    {
      id: 'share',
      label: 'Share',
      icon: <Share2 />,
      onClick: () => console.log('Share'),
      tooltip: 'Share this page'
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit />,
      onClick: () => console.log('Edit'),
      tooltip: 'Edit this item'
    }
  ]
};

/**
 * Default related features for various contexts
 */
const DEFAULT_RELATED_FEATURES: Record<string, RelatedFeature[]> = {
  '/dashboard/projects-hub': [
    {
      id: 'time-tracking',
      label: 'Time Tracking',
      href: '/dashboard/time-tracking',
      icon: <Clock />,
      description: 'Track time spent on projects'
    },
    {
      id: 'financial-hub',
      label: 'Financial Hub',
      href: '/dashboard/financial-hub',
      icon: <Search />,
      description: 'Manage invoices and payments'
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      href: '/dashboard/collaboration',
      icon: <Search />,
      description: 'Work with your team'
    }
  ],
  '/dashboard/financial-hub': [
    {
      id: 'invoices',
      label: 'Invoices',
      href: '/dashboard/financial-hub/invoices',
      icon: <Search />,
      description: 'Manage your invoices'
    },
    {
      id: 'projects-hub',
      label: 'Projects Hub',
      href: '/dashboard/projects-hub',
      icon: <Search />,
      description: 'View related projects'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: <Search />,
      description: 'Financial performance metrics'
    }
  ],
  'default': [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home />,
      description: 'Return to main dashboard'
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings />,
      description: 'Configure your preferences'
    }
  ]
};

/**
 * Generate breadcrumbs from a path
 */
function generateBreadcrumbsFromPath(path: string): Breadcrumb[] {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home className="h-4 w-4" /> }
  ];

  let currentPath = '';
  parts.forEach((part, index) => {
    if (index === 0 && part === 'dashboard') return;
    
    currentPath += `/${part}`;
    const label = part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      href: index === 0 ? `/${part}` : `/dashboard${currentPath}`
    });
  });

  return breadcrumbs;
}

/**
 * Track navigation events for analytics
 */
function trackNavigationEvent(eventName: string, data: Record<string, any> = {}) {
  // Check if analytics is available
  if (typeof window !== 'undefined' && window.va) {
    window.va.track(eventName, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
  
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Navigation Analytics] ${eventName}`, data);
  }
}

/**
 * EnhancedNavigation component
 * 
 * A comprehensive navigation component that provides breadcrumbs,
 * quick search, quick actions, workflow navigation, and related features.
 */
const EnhancedNavigation = React.memo(({
  currentPath,
  breadcrumbs: propsBreadcrumbs,
  showSearch = true,
  showQuickActions = true,
  quickActions,
  showWorkflowNavigation = false,
  workflowSteps = [],
  currentWorkflowStep = 0,
  showRelatedFeatures = true,
  relatedFeatures,
  onSearchOpen,
  onWorkflowNavigate,
  className
}: EnhancedNavigationProps) => {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      trackNavigationEvent('nav_load_time', {
        component: 'EnhancedNavigation',
        loadTime,
        path: currentPath
      });
    };
  }, [currentPath]);
  
  // Generate breadcrumbs if not provided
  const breadcrumbs = useMemo(() => {
    return propsBreadcrumbs || generateBreadcrumbsFromPath(currentPath);
  }, [propsBreadcrumbs, currentPath]);
  
  // Get context-specific quick actions
  const contextQuickActions = useMemo(() => {
    if (quickActions) return quickActions;
    
    // Find the most specific path match
    const paths = Object.keys(DEFAULT_QUICK_ACTIONS);
    const matchingPath = paths.find(path => currentPath.startsWith(path)) || 'default';
    
    return DEFAULT_QUICK_ACTIONS[matchingPath] || DEFAULT_QUICK_ACTIONS.default;
  }, [quickActions, currentPath]);
  
  // Get context-specific related features
  const contextRelatedFeatures = useMemo(() => {
    if (relatedFeatures) return relatedFeatures;
    
    // Find the most specific path match
    const paths = Object.keys(DEFAULT_RELATED_FEATURES);
    const matchingPath = paths.find(path => currentPath.startsWith(path)) || 'default';
    
    return DEFAULT_RELATED_FEATURES[matchingPath] || DEFAULT_RELATED_FEATURES.default;
  }, [relatedFeatures, currentPath]);
  
  // Toggle search dialog
  const toggleSearch = useCallback(() => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    
    if (newState) {
      onSearchOpen?.();
      trackNavigationEvent('search_opened', { path: currentPath });
      
      // Focus search input after a short delay
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isSearchOpen, onSearchOpen, currentPath]);
  
  // Handle search input
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    
    // Filter search results
    if (value.trim()) {
      const query = value.toLowerCase();
      const filtered = DEFAULT_SEARCH_RESULTS.filter(result => {
        return (
          result.title.toLowerCase().includes(query) ||
          result.category.toLowerCase().includes(query) ||
          result.keywords?.some(keyword => keyword.toLowerCase().includes(query))
        );
      });
      
      setSearchResults(filtered);
      trackNavigationEvent('search_query', { query, resultCount: filtered.length });
    } else {
      setSearchResults([]);
    }
  }, []);
  
  // Handle search result selection
  const handleSearchSelect = useCallback((href: string) => {
    setIsSearchOpen(false);
    router.push(href);
    trackNavigationEvent('search_result_selected', { path: href });
  }, [router]);
  
  // Handle workflow navigation
  const handleWorkflowNavigate = useCallback((direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' ? currentWorkflowStep + 1 : currentWorkflowStep - 1;
    
    if (newIndex >= 0 && newIndex < workflowSteps.length) {
      const step = workflowSteps[newIndex];
      onWorkflowNavigate?.(direction, newIndex);
      router.push(step.href);
      trackNavigationEvent('workflow_navigation', { 
        direction,
        fromStep: currentWorkflowStep,
        toStep: newIndex,
        path: step.href
      });
    }
  }, [currentWorkflowStep, workflowSteps, onWorkflowNavigate, router]);
  
  // Handle breadcrumb click
  const handleBreadcrumbClick = useCallback((href: string, index: number) => {
    trackNavigationEvent('breadcrumb_click', { 
      path: href,
      position: index,
      fromPath: currentPath
    });
  }, [currentPath]);
  
  // Handle quick action click
  const handleQuickActionClick = useCallback((action: QuickAction) => {
    action.onClick();
    trackNavigationEvent('quick_action_click', { 
      actionId: action.id,
      actionLabel: action.label,
      path: currentPath
    });
  }, [currentPath]);
  
  // Handle related feature click
  const handleRelatedFeatureClick = useCallback((feature: RelatedFeature) => {
    trackNavigationEvent('related_feature_click', { 
      featureId: feature.id,
      featureLabel: feature.label,
      path: currentPath,
      targetPath: feature.href
    });
  }, [currentPath]);
  
  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    trackNavigationEvent('mobile_menu_toggle', { 
      state: !isMobileMenuOpen ? 'open' : 'closed',
      path: currentPath
    });
  }, [isMobileMenuOpen, currentPath]);
  
  // Keyboard shortcuts
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    toggleSearch();
  }, { enableOnFormTags: true }, [toggleSearch]);
  
  useHotkeys('mod+[', (e) => {
    if (showWorkflowNavigation) {
      e.preventDefault();
      handleWorkflowNavigate('prev');
    }
  }, [showWorkflowNavigation, handleWorkflowNavigate]);
  
  useHotkeys('mod+]', (e) => {
    if (showWorkflowNavigation) {
      e.preventDefault();
      handleWorkflowNavigate('next');
    }
  }, [showWorkflowNavigation, handleWorkflowNavigate]);
  
  // Close search on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSearchOpen]);
  
  return (
    <>
      <nav
        className={cn(
          "enhanced-navigation w-full bg-background border-b border-border px-4 py-2 md:px-6",
          className
        )}
        aria-label="Enhanced Navigation"
        data-testid="enhanced-navigation"
      >
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          )}
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden md:flex">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                
                return (
                  <li key={crumb.href} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" aria-hidden="true" />
                    )}
                    
                    <Link
                      href={crumb.href}
                      onClick={() => handleBreadcrumbClick(crumb.href, index)}
                      aria-current={isLast ? 'page' : undefined}
                      className={cn(
                        "flex items-center text-sm",
                        isLast 
                          ? "font-medium text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {crumb.icon && (
                        <span className="mr-1">{crumb.icon}</span>
                      )}
                      {crumb.label}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
          
          {/* Mobile breadcrumb (simplified) */}
          {isMobile && (
            <div className="flex items-center">
              {breadcrumbs.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="mr-2"
                  onClick={() => handleBreadcrumbClick(breadcrumbs[breadcrumbs.length - 2].href, breadcrumbs.length - 2)}
                >
                  <Link href={breadcrumbs[breadcrumbs.length - 2].href}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
              )}
              <span className="text-sm font-medium truncate max-w-[150px]">
                {breadcrumbs[breadcrumbs.length - 1].label}
              </span>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Quick actions */}
            {showQuickActions && (
              <div className="hidden md:flex items-center space-x-1">
                {contextQuickActions.map((action) => (
                  <TooltipProvider key={action.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickActionClick(action)}
                          className="flex items-center space-x-1"
                        >
                          {action.icon}
                          <span className="ml-1">{action.label}</span>
                          {action.shortcut && (
                            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-1">
                              {action.shortcut}
                            </kbd>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.tooltip || action.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
            
            {/* Search button */}
            {showSearch && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSearch}
                      className="flex items-center space-x-1"
                      data-testid="search-button"
                    >
                      <Search className="h-4 w-4" />
                      <span className="hidden md:inline-block ml-1">Search</span>
                      <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-1">
                        ⌘K
                      </kbd>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search (⌘K)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        
        {/* Workflow navigation */}
        {showWorkflowNavigation && workflowSteps.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {workflowSteps.map((step, index) => (
                <Link
                  key={step.id}
                  href={step.href}
                  className={cn(
                    "flex items-center text-sm px-2 py-1 rounded-md",
                    step.current ? "bg-primary text-primary-foreground" : 
                    step.completed ? "text-muted-foreground" : "text-muted-foreground opacity-70"
                  )}
                >
                  <span className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full mr-1 text-xs",
                    step.current ? "bg-primary-foreground text-primary" : 
                    step.completed ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground opacity-70"
                  )}>
                    {index + 1}
                  </span>
                  <span>{step.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleWorkflowNavigate('prev')}
                disabled={currentWorkflowStep <= 0}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Previous</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleWorkflowNavigate('next')}
                disabled={currentWorkflowStep >= workflowSteps.length - 1}
                className="flex items-center"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Related features */}
        {showRelatedFeatures && contextRelatedFeatures.length > 0 && (
          <div className="mt-4 hidden md:block">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
              <Zap className="h-3 w-3" />
              <span>Related Tools</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {contextRelatedFeatures.map((feature) => (
                <Link
                  key={feature.id}
                  href={feature.href}
                  onClick={() => handleRelatedFeatureClick(feature)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "flex items-center space-x-1 group"
                  )}
                >
                  <span className="text-muted-foreground group-hover:text-foreground">
                    {feature.icon}
                  </span>
                  <span>{feature.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border px-4 py-2"
          >
            {/* Mobile breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex flex-col space-y-1">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.href}>
                    <Link
                      href={crumb.href}
                      onClick={() => {
                        handleBreadcrumbClick(crumb.href, index);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center text-sm py-1",
                        index === breadcrumbs.length - 1 
                          ? "font-medium text-foreground" 
                          : "text-muted-foreground"
                      )}
                    >
                      {crumb.icon && (
                        <span className="mr-1">{crumb.icon}</span>
                      )}
                      {crumb.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            
            {/* Mobile quick actions */}
            {showQuickActions && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
                <div className="flex flex-col space-y-1">
                  {contextQuickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleQuickActionClick(action);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-start"
                    >
                      <span className="mr-2">{action.icon}</span>
                      <span>{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mobile related features */}
            {showRelatedFeatures && contextRelatedFeatures.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Related Tools</h3>
                <div className="flex flex-col space-y-1">
                  {contextRelatedFeatures.map((feature) => (
                    <Link
                      key={feature.id}
                      href={feature.href}
                      onClick={() => {
                        handleRelatedFeatureClick(feature);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center text-sm py-2 text-muted-foreground hover:text-foreground"
                    >
                      <span className="mr-2">{feature.icon}</span>
                      <span>{feature.label}</span>
                      {feature.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {feature.description}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search dialog */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput
          ref={searchInputRef}
          placeholder="Search across KAZI..."
          value={searchQuery}
          onValueChange={handleSearchInput}
          data-testid="search-input"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults.length > 0 && (
            <>
              <CommandGroup heading="Pages">
                {searchResults
                  .filter(result => result.category === 'Pages')
                  .map(result => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSearchSelect(result.href)}
                    >
                      {result.icon || <Search className="h-4 w-4 mr-2" />}
                      <span>{result.title}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Actions">
                {searchResults
                  .filter(result => result.category === 'Actions')
                  .map(result => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSearchSelect(result.href)}
                    >
                      {result.icon || <Search className="h-4 w-4 mr-2" />}
                      <span>{result.title}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
});

EnhancedNavigation.displayName = 'EnhancedNavigation';

export { EnhancedNavigation };
