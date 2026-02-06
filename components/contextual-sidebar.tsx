import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

// Icons
import {
  ChevronRight,
  ChevronDown,
  Star,
  StarOff,
  Clock,
  Settings,
  Users,
  Home,
  FolderOpen,
  FileText,
  BarChart2,
  MessageSquare,
  Calendar,
  DollarSign,
  Zap,
  Monitor,
  Video,
  Image,
  User,
  PanelLeft,
  PanelRight,
  Layers,
  Grid,
  Layout,
  LayoutGrid,
  X,
  Menu,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// Components
import {
  Button,
  buttonVariants
} from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types
export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isNew?: boolean;
  isExternal?: boolean;
}

export interface SidebarCategory {
  id: string;
  label: string;
  items: SidebarItem[];
  defaultExpanded?: boolean;
}

export interface FavoriteItem extends SidebarItem {
  addedAt: string;
}

export interface RecentItem extends SidebarItem {
  accessedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ContextualSidebarProps {
  /**
   * Categories to display in the sidebar
   */
  categories?: SidebarCategory[];
  
  /**
   * Initial favorite items
   * Will be merged with items from localStorage
   */
  initialFavorites?: FavoriteItem[];
  
  /**
   * Initial recently used items
   * Will be merged with items from localStorage
   */
  initialRecentItems?: RecentItem[];
  
  /**
   * Available workspaces
   */
  workspaces?: Workspace[];
  
  /**
   * Current workspace ID
   */
  currentWorkspace?: string;
  
  /**
   * Whether the sidebar is collapsed
   */
  collapsed?: boolean;
  
  /**
   * Maximum number of recent items to show
   * @default 5
   */
  maxRecentItems?: number;
  
  /**
   * Maximum number of favorite items
   * @default 20
   */
  maxFavorites?: number;
  
  /**
   * Callback when workspace changes
   */
  onWorkspaceChange?: (workspaceId: string) => void;
  
  /**
   * Callback when favorites change
   */
  onFavoritesChange?: (favorites: FavoriteItem[]) => void;
  
  /**
   * Callback when sidebar collapsed state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;
  
  /**
   * Callback when a category is expanded/collapsed
   */
  onCategoryToggle?: (categoryId: string, expanded: boolean) => void;
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Current view mode (1: default, 2: compact, 3: expanded)
   */
  viewMode?: 1 | 2 | 3;
  
  /**
   * Callback when view mode changes
   */
  onViewModeChange?: (viewMode: 1 | 2 | 3) => void;
}

// Default categories
const DEFAULT_CATEGORIES: SidebarCategory[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    defaultExpanded: true,
    items: [
      {
        id: 'overview',
        label: 'Overview',
        href: '/dashboard',
        icon: <Home className="h-4 w-4" />,
      },
      {
        id: 'projects-hub',
        label: 'Projects Hub',
        href: '/dashboard/projects-hub',
        icon: <FolderOpen className="h-4 w-4" />,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: <BarChart2 className="h-4 w-4" />,
      },
    ]
  },
  {
    id: 'workspace',
    label: 'Workspace',
    defaultExpanded: true,
    items: [
      {
        id: 'files-hub',
        label: 'Files Hub',
        href: '/dashboard/files-hub',
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: 'messages',
        label: 'Messages',
        href: '/dashboard/messages',
        icon: <MessageSquare className="h-4 w-4" />,
        badge: '3',
      },
      {
        id: 'calendar',
        label: 'Calendar',
        href: '/dashboard/calendar',
        icon: <Calendar className="h-4 w-4" />,
      },
    ]
  },
  {
    id: 'creative',
    label: 'Creative Tools',
    defaultExpanded: false,
    items: [
      {
        id: 'ai-assistant',
        label: 'AI Assistant',
        href: '/dashboard/ai-assistant',
        icon: <Zap className="h-4 w-4" />,
        isNew: true,
      },
      {
        id: 'canvas',
        label: 'Canvas',
        href: '/dashboard/canvas',
        icon: <Monitor className="h-4 w-4" />,
      },
      {
        id: 'video-studio',
        label: 'Video Studio',
        href: '/dashboard/video-studio',
        icon: <Video className="h-4 w-4" />,
      },
      {
        id: 'gallery',
        label: 'Gallery',
        href: '/dashboard/gallery',
        icon: <Image className="h-4 w-4" />,
      },
    ]
  },
  {
    id: 'financial',
    label: 'Financial',
    defaultExpanded: false,
    items: [
      {
        id: 'financial-hub',
        label: 'Financial Hub',
        href: '/dashboard/financial-hub',
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        id: 'invoices',
        label: 'Invoices',
        href: '/dashboard/invoices',
        icon: <FileText className="h-4 w-4" />,
      },
    ]
  },
  {
    id: 'personal',
    label: 'Personal',
    defaultExpanded: false,
    items: [
      {
        id: 'cv-portfolio',
        label: 'CV & Portfolio',
        href: '/dashboard/cv-portfolio',
        icon: <User className="h-4 w-4" />,
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/dashboard/settings',
        icon: <Settings className="h-4 w-4" />,
      },
    ]
  },
];

// Default workspaces
const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'personal',
    name: 'Personal',
    icon: '👤',
    color: 'bg-blue-500',
  },
  {
    id: 'team',
    name: 'Team',
    icon: '👥',
    color: 'bg-green-500',
  },
  {
    id: 'client',
    name: 'Client',
    icon: '🤝',
    color: 'bg-purple-500',
  },
];

// Storage keys
const STORAGE_KEYS = {
  FAVORITES: 'kazi-sidebar-favorites',
  RECENT_ITEMS: 'kazi-sidebar-recent-items',
  EXPANDED_CATEGORIES: 'kazi-sidebar-expanded-categories',
  COLLAPSED: 'kazi-sidebar-collapsed',
  WORKSPACE: 'kazi-sidebar-workspace',
  VIEW_MODE: 'kazi-sidebar-view-mode',
};

// View modes
const VIEW_MODES = {
  DEFAULT: 1,
  COMPACT: 2,
  EXPANDED: 3,
};

/**
 * Track sidebar events for analytics
 */
function trackSidebarEvent(eventName: string, data: Record<string, any> = {}) {
  // Check if analytics is available
  if (typeof window !== 'undefined' && window.va) {
    window.va.track(eventName, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
  
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Sidebar Analytics] ${eventName}`, data);
  }
}

/**
 * Get item from localStorage with type safety
 */
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Save item to localStorage with type safety
 */
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

/**
 * SortableItem component for drag-and-drop
 */
function SortableItem({ item }: { item: FavoriteItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };
  
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center py-1 px-2 rounded-md cursor-grab active:cursor-grabbing",
        isDragging ? "bg-accent" : "hover:bg-accent"
      )}
      {...attributes}
      {...listeners}
    >
      <Link
        href={item.href}
        className="flex items-center w-full text-sm text-muted-foreground hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mr-2 text-muted-foreground">{item.icon}</span>
        <span className="truncate">{item.label}</span>
        {item.badge && (
          <Badge variant="outline" className="ml-auto">
            {item.badge}
          </Badge>
        )}
      </Link>
    </li>
  );
}

/**
 * ContextualSidebar component
 * 
 * A comprehensive sidebar component that provides categories, favorites,
 * recently used items, and workspace switching.
 */
const ContextualSidebar = React.memo(({
  categories = DEFAULT_CATEGORIES,
  initialFavorites = [],
  initialRecentItems = [],
  workspaces = DEFAULT_WORKSPACES,
  currentWorkspace: propCurrentWorkspace,
  collapsed: propCollapsed = false,
  maxRecentItems = 5,
  maxFavorites = 20,
  onWorkspaceChange,
  onFavoritesChange,
  onCollapsedChange,
  onCategoryToggle,
  className,
  viewMode: propViewMode = VIEW_MODES.DEFAULT,
  onViewModeChange,
}: ContextualSidebarProps) => {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // State from localStorage or props
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const storedFavorites = getFromStorage<FavoriteItem[]>(STORAGE_KEYS.FAVORITES, []);
    return [...storedFavorites, ...initialFavorites].slice(0, maxFavorites);
  });
  
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => {
    const storedRecentItems = getFromStorage<RecentItem[]>(STORAGE_KEYS.RECENT_ITEMS, []);
    return [...storedRecentItems, ...initialRecentItems].slice(0, maxRecentItems);
  });
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const storedExpanded = getFromStorage<Record<string, boolean>>(STORAGE_KEYS.EXPANDED_CATEGORIES, {});
    
    // Initialize with default expanded state from categories
    const defaultExpanded: Record<string, boolean> = {};
    categories.forEach(category => {
      defaultExpanded[category.id] = category.defaultExpanded ?? false;
    });
    
    return { ...defaultExpanded, ...storedExpanded };
  });
  
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return isMobile ? true : getFromStorage<boolean>(STORAGE_KEYS.COLLAPSED, propCollapsed);
  });
  
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(() => {
    return getFromStorage<string>(STORAGE_KEYS.WORKSPACE, propCurrentWorkspace || workspaces[0]?.id || 'personal');
  });
  
  const [viewMode, setViewMode] = useState<1 | 2 | 3>(() => {
    return getFromStorage<1 | 2 | 3>(STORAGE_KEYS.VIEW_MODE, propViewMode);
  });
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      trackSidebarEvent('sidebar_load_time', {
        component: 'ContextualSidebar',
        loadTime,
        path: pathname
      });
    };
  }, [pathname]);
  
  // Sync with props
  useEffect(() => {
    if (propCollapsed !== undefined && propCollapsed !== collapsed) {
      setCollapsed(propCollapsed);
    }
  }, [propCollapsed]);
  
  useEffect(() => {
    if (propCurrentWorkspace && propCurrentWorkspace !== currentWorkspace) {
      setCurrentWorkspace(propCurrentWorkspace);
    }
  }, [propCurrentWorkspace]);
  
  useEffect(() => {
    if (propViewMode !== undefined && propViewMode !== viewMode) {
      setViewMode(propViewMode);
    }
  }, [propViewMode]);
  
  // Persist state to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
    onFavoritesChange?.(favorites);
  }, [favorites, onFavoritesChange]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECENT_ITEMS, recentItems);
  }, [recentItems]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EXPANDED_CATEGORIES, expandedCategories);
  }, [expandedCategories]);
  
  useEffect(() => {
    if (!isMobile) {
      saveToStorage(STORAGE_KEYS.COLLAPSED, collapsed);
      onCollapsedChange?.(collapsed);
    }
  }, [collapsed, isMobile, onCollapsedChange]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.WORKSPACE, currentWorkspace);
    onWorkspaceChange?.(currentWorkspace);
  }, [currentWorkspace, onWorkspaceChange]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.VIEW_MODE, viewMode);
    onViewModeChange?.(viewMode);
  }, [viewMode, onViewModeChange]);
  
  // Update recently used items when pathname changes
  useEffect(() => {
    if (!pathname) return;
    
    // Find the item that matches the current path
    let matchingItem: SidebarItem | undefined;
    
    // Check in all categories
    for (const category of categories) {
      const item = category.items.find(item => item.href === pathname);
      if (item) {
        matchingItem = item;
        break;
      }
    }
    
    if (!matchingItem) return;
    
    // Create a recent item
    const recentItem: RecentItem = {
      ...matchingItem,
      accessedAt: new Date().toISOString(),
    };
    
    // Update recent items with LRU eviction
    setRecentItems(prev => {
      // Remove the item if it already exists
      const filtered = prev.filter(item => item.id !== recentItem.id);
      
      // Add the new item at the beginning
      const updated = [recentItem, ...filtered];
      
      // Limit to maxRecentItems
      return updated.slice(0, maxRecentItems);
    });
    
    trackSidebarEvent('recent_item_added', {
      itemId: recentItem.id,
      itemLabel: recentItem.label,
      path: pathname
    });
  }, [pathname, categories, maxRecentItems]);
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Toggle sidebar collapsed state
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
    trackSidebarEvent('sidebar_toggle', {
      state: collapsed ? 'expanded' : 'collapsed',
      path: pathname
    });
  }, [collapsed, pathname]);
  
  // Toggle category expanded state
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newState = { ...prev, [categoryId]: !prev[categoryId] };
      onCategoryToggle?.(categoryId, newState[categoryId]);
      trackSidebarEvent('category_toggle', {
        categoryId,
        state: newState[categoryId] ? 'expanded' : 'collapsed',
        path: pathname
      });
      return newState;
    });
  }, [onCategoryToggle, pathname]);
  
  // Toggle favorite
  const toggleFavorite = useCallback((item: SidebarItem) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === item.id);
      
      if (isFavorite) {
        // Remove from favorites
        trackSidebarEvent('favorite_removed', {
          itemId: item.id,
          itemLabel: item.label,
          path: pathname
        });
        return prev.filter(fav => fav.id !== item.id);
      } else {
        // Add to favorites
        if (prev.length >= maxFavorites) {
          // Remove oldest favorite if at max capacity
          const updated = [...prev];
          updated.pop();
          updated.unshift({
            ...item,
            addedAt: new Date().toISOString(),
          });
          trackSidebarEvent('favorite_added', {
            itemId: item.id,
            itemLabel: item.label,
            path: pathname,
            replacedOldest: true
          });
          return updated;
        } else {
          // Add new favorite
          trackSidebarEvent('favorite_added', {
            itemId: item.id,
            itemLabel: item.label,
            path: pathname
          });
          return [
            {
              ...item,
              addedAt: new Date().toISOString(),
            },
            ...prev,
          ];
        }
      }
    });
  }, [maxFavorites, pathname]);
  
  // Check if an item is a favorite
  const isFavorite = useCallback((itemId: string) => {
    return favorites.some(fav => fav.id === itemId);
  }, [favorites]);
  
  // Handle drag end for favorites reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFavorites(prev => {
        const oldIndex = prev.findIndex(item => item.id === active.id);
        const newIndex = prev.findIndex(item => item.id === over.id);
        
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        
        trackSidebarEvent('favorite_reordered', {
          itemId: active.id,
          fromIndex: oldIndex,
          toIndex: newIndex,
          path: pathname
        });
        
        return newOrder;
      });
    }
  }, [pathname]);
  
  // Change workspace
  const changeWorkspace = useCallback((workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
    trackSidebarEvent('workspace_changed', {
      workspaceId,
      previousWorkspace: currentWorkspace,
      path: pathname
    });
  }, [currentWorkspace, pathname]);
  
  // Change view mode
  const changeViewMode = useCallback((mode: 1 | 2 | 3) => {
    setViewMode(mode);
    trackSidebarEvent('view_mode_changed', {
      mode,
      previousMode: viewMode,
      path: pathname
    });
  }, [viewMode, pathname]);
  
  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    trackSidebarEvent('mobile_menu_toggle', {
      state: !isMobileMenuOpen ? 'open' : 'closed',
      path: pathname
    });
  }, [isMobileMenuOpen, pathname]);
  
  // Current workspace object
  const activeWorkspace = useMemo(() => {
    return workspaces.find(w => w.id === currentWorkspace) || workspaces[0];
  }, [workspaces, currentWorkspace]);
  
  // Keyboard shortcuts
  useHotkeys('mod+.', (e) => {
    e.preventDefault();
    toggleCollapsed();
  }, { enableOnFormTags: true }, [toggleCollapsed]);
  
  useHotkeys('mod+1', (e) => {
    e.preventDefault();
    changeViewMode(VIEW_MODES.DEFAULT);
  }, [changeViewMode]);
  
  useHotkeys('mod+2', (e) => {
    e.preventDefault();
    changeViewMode(VIEW_MODES.COMPACT);
  }, [changeViewMode]);
  
  useHotkeys('mod+3', (e) => {
    e.preventDefault();
    changeViewMode(VIEW_MODES.EXPANDED);
  }, [changeViewMode]);
  
  // Handle click outside to close mobile menu
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isMobileMenuOpen]);
  
  // Calculate sidebar width based on view mode
  const sidebarWidth = useMemo(() => {
    if (collapsed) return 'w-16';
    
    switch (viewMode) {
      case VIEW_MODES.COMPACT:
        return 'w-48';
      case VIEW_MODES.EXPANDED:
        return 'w-72';
      case VIEW_MODES.DEFAULT:
      default:
        return 'w-60';
    }
  }, [collapsed, viewMode]);
  
  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile toggle button */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="fixed bottom-4 left-4 z-40 rounded-full shadow-lg"
          aria-label={isMobileMenuOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
        
        {/* Mobile sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={sidebarRef}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 z-30 h-full w-[280px] bg-background border-r border-border shadow-lg"
              data-testid="contextual-sidebar"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-white",
                          activeWorkspace?.color || "bg-primary"
                        )}>
                          {activeWorkspace?.icon || '👤'}
                        </div>
                        <span>{activeWorkspace?.name || 'Workspace'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {workspaces.map(workspace => (
                        <DropdownMenuItem
                          key={workspace.id}
                          onClick={() => changeWorkspace(workspace.id)}
                          className={cn(
                            "flex items-center space-x-2",
                            workspace.id === currentWorkspace && "bg-accent"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-white",
                            workspace.color || "bg-primary"
                          )}>
                            {workspace.icon || '👤'}
                          </div>
                          <span>{workspace.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMobileMenu}
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Content */}
                <ScrollArea className="flex-1 px-2 py-4">
                  {/* Favorites */}
                  {favorites.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center px-2 mb-2">
                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                        <h3 className="text-sm font-medium">Favorites</h3>
                      </div>
                      
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                      >
                        <SortableContext
                          items={favorites.map(item => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <ul className="space-y-1">
                            {favorites.map(item => (
                              <SortableItem key={item.id} item={item} />
                            ))}
                          </ul>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                  
                  {/* Recently Used */}
                  {recentItems.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center px-2 mb-2">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Recently Used</h3>
                      </div>
                      
                      <ul className="space-y-1">
                        {recentItems.map(item => (
                          <li key={item.id} className="flex items-center py-1 px-2 rounded-md hover:bg-accent">
                            <Link
                              href={item.href}
                              className="flex items-center w-full text-sm text-muted-foreground hover:text-foreground"
                            >
                              <span className="mr-2 text-muted-foreground">{item.icon}</span>
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <Badge variant="outline" className="ml-auto">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Categories */}
                  <div className="space-y-4">
                    {categories.map(category => (
                      <div key={category.id} className="space-y-1">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="flex items-center w-full px-2 py-1 text-sm font-medium hover:bg-accent rounded-md"
                          aria-expanded={expandedCategories[category.id]}
                          aria-controls={`category-${category.id}`}
                        >
                          {expandedCategories[category.id] ? (
                            <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          )}
                          <span>{category.label}</span>
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {expandedCategories[category.id] && (
                            <motion.div
                              id={`category-${category.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <ul className="pl-6 space-y-1">
                                {category.items.map(item => (
                                  <li key={item.id} className="flex items-center py-1 px-2 rounded-md hover:bg-accent group">
                                    <Link
                                      href={item.href}
                                      target={item.isExternal ? '_blank' : undefined}
                                      rel={item.isExternal ? 'noopener noreferrer' : undefined}
                                      className="flex items-center flex-1 text-sm text-muted-foreground hover:text-foreground"
                                    >
                                      <span className="mr-2 text-muted-foreground group-hover:text-foreground">
                                        {item.icon}
                                      </span>
                                      <span className="truncate">{item.label}</span>
                                      {item.isExternal && (
                                        <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
                                      )}
                                      {item.isNew && (
                                        <Badge variant="default" className="ml-2 text-[10px] px-1 py-0 h-4">
                                          NEW
                                        </Badge>
                                      )}
                                      {item.badge && (
                                        <Badge variant="outline" className="ml-auto">
                                          {item.badge}
                                        </Badge>
                                      )}
                                    </Link>
                                    
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              toggleFavorite(item);
                                            }}
                                            aria-label={isFavorite(item.id) ? "Remove from favorites" : "Add to favorites"}
                                          >
                                            {isFavorite(item.id) ? (
                                              <Star className="h-3 w-3 text-yellow-500" />
                                            ) : (
                                              <StarOff className="h-3 w-3 text-muted-foreground" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{isFavorite(item.id) ? "Remove from favorites" : "Add to favorites"}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Footer */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeViewMode(VIEW_MODES.DEFAULT)}
                      className={cn(
                        "flex-1",
                        viewMode === VIEW_MODES.DEFAULT && "bg-accent"
                      )}
                      aria-label="Default view"
                    >
                      <Layout className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeViewMode(VIEW_MODES.COMPACT)}
                      className={cn(
                        "flex-1 mx-1",
                        viewMode === VIEW_MODES.COMPACT && "bg-accent"
                      )}
                      aria-label="Compact view"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeViewMode(VIEW_MODES.EXPANDED)}
                      className={cn(
                        "flex-1",
                        viewMode === VIEW_MODES.EXPANDED && "bg-accent"
                      )}
                      aria-label="Expanded view"
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Backdrop */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 bg-black"
              onClick={toggleMobileMenu}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </>
    );
  }
  
  // Desktop sidebar
  return (
    <div
      className={cn(
        "contextual-sidebar h-full bg-background border-r border-border transition-all duration-300",
        sidebarWidth,
        className
      )}
      data-testid="contextual-sidebar"
      ref={sidebarRef}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          "flex items-center p-4 border-b border-border",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white",
                      activeWorkspace?.color || "bg-primary"
                    )}>
                      {activeWorkspace?.icon || '👤'}
                    </div>
                    <span>{activeWorkspace?.name || 'Workspace'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {workspaces.map(workspace => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => changeWorkspace(workspace.id)}
                      className={cn(
                        "flex items-center space-x-2",
                        workspace.id === currentWorkspace && "bg-accent"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-white",
                        workspace.color || "bg-primary"
                      )}>
                        {workspace.icon || '👤'}
                      </div>
                      <span>{workspace.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleCollapsed}
                      aria-label="Collapse sidebar"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Collapse sidebar (⌘.)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapsed}
                    aria-label="Expand sidebar"
                  >
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Expand sidebar (⌘.)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* Content */}
        <ScrollArea className="flex-1 px-2 py-4">
          {/* Favorites */}
          {favorites.length > 0 && !collapsed && (
            <div className="mb-4">
              <div className="flex items-center px-2 mb-2">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                <h3 className="text-sm font-medium">Favorites</h3>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={favorites.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-1">
                    {favorites.map(item => (
                      <SortableItem key={item.id} item={item} />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </div>
          )}
          
          {/* Collapsed Favorites */}
          {favorites.length > 0 && collapsed && (
            <div className="mb-4">
              <div className="flex justify-center mb-2">
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              
              <ul className="space-y-2">
                {favorites.slice(0, 5).map(item => (
                  <li key={item.id} className="flex justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                          >
                            {item.icon}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recently Used */}
          {recentItems.length > 0 && !collapsed && (
            <div className="mb-4">
              <div className="flex items-center px-2 mb-2">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="text-sm font-medium">Recently Used</h3>
              </div>
              
              <ul className="space-y-1">
                {recentItems.map(item => (
                  <li key={item.id} className="flex items-center py-1 px-2 rounded-md hover:bg-accent">
                    <Link
                      href={item.href}
                      className="flex items-center w-full text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="mr-2 text-muted-foreground">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="outline" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Collapsed Recently Used */}
          {recentItems.length > 0 && collapsed && (
            <div className="mb-4">
              <div className="flex justify-center mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <ul className="space-y-2">
                {recentItems.slice(0, 3).map(item => (
                  <li key={item.id} className="flex justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                          >
                            {item.icon}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Categories */}
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category.id} className="space-y-1">
                {!collapsed ? (
                  <>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex items-center w-full px-2 py-1 text-sm font-medium hover:bg-accent rounded-md"
                      aria-expanded={expandedCategories[category.id]}
                      aria-controls={`category-${category.id}`}
                    >
                      {expandedCategories[category.id] ? (
                        <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                      )}
                      <span>{category.label}</span>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {expandedCategories[category.id] && (
                        <motion.div
                          id={`category-${category.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <ul className="pl-6 space-y-1">
                            {category.items.map(item => (
                              <li key={item.id} className="flex items-center py-1 px-2 rounded-md hover:bg-accent group">
                                <Link
                                  href={item.href}
                                  target={item.isExternal ? '_blank' : undefined}
                                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                                  className={cn(
                                    "flex items-center flex-1 text-sm",
                                    pathname === item.href
                                      ? "text-foreground font-medium"
                                      : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  <span className={cn(
                                    "mr-2",
                                    pathname === item.href
                                      ? "text-foreground"
                                      : "text-muted-foreground group-hover:text-foreground"
                                  )}>
                                    {item.icon}
                                  </span>
                                  <span className="truncate">{item.label}</span>
                                  {item.isExternal && (
                                    <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
                                  )}
                                  {item.isNew && (
                                    <Badge variant="default" className="ml-2 text-[10px] px-1 py-0 h-4">
                                      NEW
                                    </Badge>
                                  )}
                                  {item.badge && (
                                    <Badge variant="outline" className="ml-auto">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </Link>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleFavorite(item);
                                        }}
                                        aria-label={isFavorite(item.id) ? "Remove from favorites" : "Add to favorites"}
                                      >
                                        {isFavorite(item.id) ? (
                                          <Star className="h-3 w-3 text-yellow-500" />
                                        ) : (
                                          <StarOff className="h-3 w-3 text-muted-foreground" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{isFavorite(item.id) ? "Remove from favorites" : "Add to favorites"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex flex-col items-center space-y-2 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCategory(category.id)}
                            aria-label={`${category.label} category`}
                          >
                            {category.items[0]?.icon || <Layers className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{category.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        {!collapsed ? (
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeViewMode(VIEW_MODES.DEFAULT)}
                className={cn(
                  "flex-1",
                  viewMode === VIEW_MODES.DEFAULT && "bg-accent"
                )}
                aria-label="Default view"
              >
                <Layout className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeViewMode(VIEW_MODES.COMPACT)}
                className={cn(
                  "flex-1 mx-1",
                  viewMode === VIEW_MODES.COMPACT && "bg-accent"
                )}
                aria-label="Compact view"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeViewMode(VIEW_MODES.EXPANDED)}
                className={cn(
                  "flex-1",
                  viewMode === VIEW_MODES.EXPANDED && "bg-accent"
                )}
                aria-label="Expanded view"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center mt-4 text-xs text-muted-foreground">
              <div className="flex-1">
                <kbd className="px-1 py-0.5 border rounded bg-muted">⌘.</kbd>
                <span className="ml-1">Toggle sidebar</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-1 py-0.5 border rounded bg-muted">⌘1-3</kbd>
                <span className="ml-1">Views</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-border flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => changeViewMode((viewMode % 3) + 1 as 1 | 2 | 3)}
                    aria-label="Change view mode"
                  >
                    {viewMode === VIEW_MODES.DEFAULT && <Layout className="h-4 w-4" />}
                    {viewMode === VIEW_MODES.COMPACT && <PanelLeft className="h-4 w-4" />}
                    {viewMode === VIEW_MODES.EXPANDED && <Layers className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Change view mode (⌘1-3)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
});

ContextualSidebar.displayName = 'ContextualSidebar';

export { ContextualSidebar };
