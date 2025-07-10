'use client'

import React, { useReducer, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, FolderOpen, Calendar, MessageSquare, Shield, Cloud, Users, Cpu, Sparkles, UserCheck, BarChart3, Star, Play, CreditCard, Eye, ExternalLink, ChevronRight, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
// Context7 MCP Integration for Enhanced Interactive Patterns
type InteractiveState = {
  currentRoute: string;
  isLoading: boolean;
  navigationOpen: boolean;
  modals: Record<string, boolean>;
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  buttonStates: Record<string, {
    loading?: boolean;
    disabled?: boolean;
    clicked?: boolean;
  }>;
  userInteractions: Array<{
    type: string;
    payload: Record<string, unknown>;
    timestamp: number;
  }>;
};

type InteractiveAction =
  | { type: 'SET_ROUTE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_NAVIGATION' }
  | { type: 'OPEN_MODAL'; payload: string }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: 'ADD_TOAST'; payload: Omit<InteractiveState['toasts'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_BUTTON_STATE'; payload: { id: string; state: Partial<InteractiveState['buttonStates'][0]> } }
  | { type: 'TRACK_INTERACTION'; payload: Omit<InteractiveState['userInteractions'][0], 'timestamp'> }
  | { type: 'RESET_BUTTON_STATES' }

const initialState: InteractiveState = {
  currentRoute: '',
  isLoading: false,
  navigationOpen: false,
  modals: {},
  toasts: [],
  buttonStates: {},
  userInteractions: []
}

function interactiveReducer(state: InteractiveState, action: InteractiveAction): InteractiveState {
  switch (action.type) {
    case 'SET_ROUTE':
      return { ...state, currentRoute: action.payload }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'TOGGLE_NAVIGATION':
      return { ...state, navigationOpen: !state.navigationOpen }
    
    case 'OPEN_MODAL':
      return { 
        ...state, 
        modals: { ...state.modals, [action.payload]: true }
      }
    
    case 'CLOSE_MODAL':
      return { 
        ...state, 
        modals: { ...state.modals, [action.payload]: false }
      }
    
    case 'ADD_TOAST':
      const newToast = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      }
      return { 
        ...state, 
        toasts: [...state.toasts, newToast]
      }
    
    case 'REMOVE_TOAST':
      return { 
        ...state, 
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      }
    
    case 'SET_BUTTON_STATE':
      return { 
        ...state, 
        buttonStates: { 
          ...state.buttonStates, 
          [action.payload.id]: { 
            ...state.buttonStates[action.payload.id], 
            ...action.payload.state 
          }
        }
      }
    
    case 'TRACK_INTERACTION':
      return { 
        ...state, 
        userInteractions: [
          ...state.userInteractions,
          { ...action.payload, timestamp: Date.now() }
        ].slice(-100) // Keep last 100 interactions
      }
    
    case 'RESET_BUTTON_STATES':
      return { ...state, buttonStates: {} }
    
    default:
      return state
  }
}

// ========================================
// ENHANCED NAVIGATION STRUCTURE
// ========================================

export const DASHBOARD_ROUTES = [
  { 
    href: '/dashboard', 
    title: 'Overview', 
    icon: Home, 
    description: 'Dashboard overview and key metrics',
    category: 'Core',
    testId: 'nav-dashboard'
  },
  { 
    href: '/dashboard/projects-hub', 
    title: 'Projects Hub', 
    icon: FolderOpen, 
    description: 'Manage all your projects in one place',
    category: 'Core',
    testId: 'nav-projects-hub'
  },
  { 
    href: '/dashboard/my-day', 
    title: 'My Day Today', 
    icon: Calendar, 
    description: 'AI-powered daily planning and tasks',
    category: 'Productivity',
    testId: 'nav-my-day'
  },
  { 
    href: '/dashboard/collaboration', 
    title: 'Collaboration', 
    icon: MessageSquare, 
    description: 'Real-time client collaboration tools',
    category: 'Client',
    testId: 'nav-collaboration'
  },
  { 
    href: '/dashboard/escrow', 
    title: 'Escrow System', 
    icon: Shield, 
    description: 'Secure payment protection',
    category: 'Financial',
    testId: 'nav-escrow'
  },
  { 
    href: '/dashboard/files-hub', 
    title: 'Files Hub', 
    icon: FolderOpen, 
    description: 'Organize and share project files',
    category: 'Storage',
    testId: 'nav-files-hub'
  },
  { 
    href: '/dashboard/storage', 
    title: 'Multi-Cloud Storage', 
    icon: Cloud, 
    description: 'Enterprise storage management',
    category: 'Storage',
    testId: 'nav-storage'
  },
  { 
    href: '/dashboard/community', 
    title: 'Community Hub', 
    icon: Users, 
    description: 'Connect with other creators',
    category: 'Social',
    testId: 'nav-community'
  },
  { 
    href: '/dashboard/ai-design', 
    title: 'AI Design Assistant', 
    icon: Cpu, 
    description: 'AI-powered design analysis',
    category: 'AI',
    testId: 'nav-ai-design'
  },
  { 
    href: '/dashboard/ai-create', 
    title: 'AI Create', 
    icon: Sparkles, 
    description: 'Generate assets with AI',
    category: 'AI',
    testId: 'nav-ai-create'
  },
  { 
    href: '/dashboard/client-zone', 
    title: 'Client Portal', 
    icon: UserCheck, 
    description: 'Client access and project sharing',
    category: 'Client',
    testId: 'nav-client-zone'
  },
  { 
    href: '/dashboard/analytics', 
    title: 'Analytics', 
    icon: BarChart3, 
    description: 'Business insights and metrics',
    category: 'Analytics',
    testId: 'nav-analytics'
  }
] as const

export const MARKETING_ROUTES = [
  { href: '/', title: 'Home', icon: Home, testId: 'nav-home' },
  { href: '/features', title: 'Features', icon: Star, testId: 'nav-features' },
  { href: '/how-it-works', title: 'How it Works', icon: Play, testId: 'nav-how-it-works' },
  { href: '/payment', title: 'Pricing', icon: CreditCard, testId: 'nav-pricing' },
  { href: '/demo', title: 'Demo', icon: Eye, testId: 'nav-demo' },
  { href: '/contact', title: 'Contact', icon: MessageSquare, testId: 'nav-contact' }
] as const

// ========================================
// ENHANCED INTERACTIVE BUTTON COMPONENT
// ========================================

interface EnhancedButtonProps {
  id: string
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  href?: string
  onClick?: () => void | Promise<void>
  disabled?: boolean
  loading?: boolean
  className?: string
  testId?: string
  trackingData?: Record<string, unknown>
  external?: boolean
  download?: boolean | string
}

export function EnhancedButton({ 
  id: unknown, children: unknown, variant = 'default': unknown, size = 'default': unknown, href: unknown, onClick: unknown, disabled = false: unknown, loading = false: unknown, className = '': unknown, testId: unknown, trackingData: unknown, external = false: unknown, download
}: EnhancedButtonProps) {
  const [state, dispatch] = useReducer(interactiveReducer, initialState)
  const router = useRouter()
  
  const buttonState = state.buttonStates[id] || { loading: false, disabled: false, clicked: false }
  const isLoading = loading || buttonState.loading
  const isDisabled = disabled || buttonState.disabled

  const handleClick = useCallback(async () => {
    if (isDisabled || isLoading) return

    // Track interaction
    dispatch({
      type: 'TRACK_INTERACTION',
      payload: {
        type: 'button_click',
        payload: {
          target: id,
          metadata: { href, trackingData }
        }
      }
    })

    // Set loading state
    dispatch({
      type: 'SET_BUTTON_STATE',
      payload: { id, state: { loading: true, clicked: true } }
    })

    try {
      if (onClick) {
        await onClick()
      }
      
      if (href) {
        if (external) {
          window.open(href, '_blank', 'noopener,noreferrer')
        } else {
          router.push(href)
        }
      }

      // Success feedback
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          type: 'success',
          message: `Action completed successfully`
        }
      })

    } catch (error) {
      // Error feedback
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          type: 'error',
          message: `Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      })
    } finally {
      // Reset loading state
      setTimeout(() => {
        dispatch({
          type: 'SET_BUTTON_STATE',
          payload: { id, state: { loading: false } }
        })
      }, 500)
    }
  }, [id, href, onClick, trackingData, external, isDisabled, isLoading, router])

  const buttonProps = {
    variant,
    size,
    disabled: isDisabled,
    className: `transition-all duration-200 ${className}`, 'data-testid': testId,
    onClick: handleClick
  }

  const content = (
    <>
      {isLoading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
      {external && !isLoading && (
        <ExternalLink className="ml-2 h-4 w-4" />
      )}
    </>
  )

  if (href && !onClick) {
    return (
      <Link 
        href={href} 
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        download={download}
        className="inline-block"
      >
        <Button {...buttonProps}>
          {content}
        </Button>
      </Link>
    )
  }

  return (
    <Button {...buttonProps}>
      {content}
    </Button>
  )
}

// ========================================
// ENHANCED NAVIGATION COMPONENT
// ========================================

type RouteType = {
  href: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  testId: string
  description?: string
  category?: string
}

interface EnhancedNavigationProps {
  routes: RouteType[]
  variant?: 'sidebar' | 'header' | 'mobile' | 'breadcrumb'
  activeRoute?: string
  // onRouteChange?: (route: string) => void
  className?: string
}

export function EnhancedNavigation({
  routes: unknown, variant = 'header': unknown, activeRoute: unknown, // onRouteChange: unknown, className = ''
}: EnhancedNavigationProps) {
  const pathname = usePathname()
  // const [state, dispatch] = useReducer(interactiveReducer, initialState)
  
  const currentRoute = activeRoute || pathname

  const renderRoute = (route: RouteType) => {
    const Icon = route.icon
    const isActive = currentRoute === route.href
    
    const buttonContent = (
      <>
        <Icon className="h-4 w-4" />
        <span className={variant === 'sidebar' ? '' : 'sr-only md:not-sr-only'}>{route.title}</span>
        {isActive && variant === 'sidebar' && (
          <ChevronRight className="ml-auto h-4 w-4" />
        )}
      </>
    )

    if (variant === 'sidebar') {
      return (
        <EnhancedButton
          key={route.href}
          id={`nav-${route.testId}`}
          variant={isActive ? 'secondary' : 'ghost'}
          className={`w-full justify-start gap-3 ${isActive ? 'bg-accent border-r-2 border-primary' : ''}`}
          href={route.href}
          testId={route.testId}
          trackingData={{ category: 'navigation', variant }}
        >
          {buttonContent}
        </EnhancedButton>
      )
    }

    if (variant === 'header') {
      return (
        <EnhancedButton
          key={route.href}
          id={`nav-${route.testId}`}
          variant="ghost"
          size="sm"
          className={`gap-2 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
          href={route.href}
          testId={route.testId}
          trackingData={{ category: 'navigation', variant }}
        >
          {buttonContent}
        </EnhancedButton>
      )
    }

    if (variant === 'mobile') {
      return (
        <EnhancedButton
          key={route.href}
          id={`nav-mobile-${route.testId}`}
          variant="ghost"
          className={`flex-col gap-1 h-auto py-2 ${isActive ? 'text-primary bg-primary/10' : ''}`}
          href={route.href}
          testId={`mobile-${route.testId}`}
          trackingData={{ category: 'navigation', variant }}
        >
          <Icon className="h-5 w-5" />
          <span className="text-xs">{route.title}</span>
        </EnhancedButton>
      )
    }

    return null
  }

  if (variant === 'sidebar') {
    return (
      <nav className={`space-y-1 ${className}`} data-testid="sidebar-navigation">
        {routes.map(renderRoute)}
      </nav>
    )
  }

  if (variant === 'header') {
    return (
      <nav className={`flex items-center space-x-2 ${className}`} data-testid="header-navigation">
        {routes.map(renderRoute)}
      </nav>
    )
  }

  if (variant === 'mobile') {
    return (
      <nav className={`flex justify-around items-center ${className}`} data-testid="mobile-navigation">
        {routes.slice(0, 5).map(renderRoute)}
      </nav>
    )
  }

  return null
}

// ========================================
// ENHANCED INTERACTIVE CARD COMPONENT
// ========================================

interface EnhancedCardProps {
  id: string
  title: string
  description?: string
  children?: React.ReactNode
  href?: string
  onClick?: () => void
  actions?: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  }>
  className?: string
  testId?: string
  interactive?: boolean
  badge?: string
  status?: 'active' | 'inactive' | 'pending' | 'complete'
}

export function EnhancedCard({
  id: unknown, title: unknown, description: unknown, children: unknown, href: unknown, onClick: unknown, actions = []: unknown, className = '': unknown, testId: unknown, interactive = true: unknown, badge: unknown, status: unknown, }: EnhancedCardProps) {
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  const statusIndicator = status ? (
    <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${
      status === 'active' ? 'bg-green-500' :
      status === 'inactive' ? 'bg-gray-400' :
      status === 'pending' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`} />
  ) : null

  const cardContent = (
    <div
      className={`relative p-6 bg-white rounded-lg shadow-sm border border-gray-200 ${
        interactive ? 'hover:shadow-md cursor-pointer transition-shadow' : ''
      } ${className}`}
      data-testid={testId}
      onClick={interactive ? handleCardClick : undefined}
    >
      {statusIndicator}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        {badge && (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {badge}
          </span>
        )}
      </div>
      
      {children}

      {actions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-end space-x-2">
          {actions.map((action, index) => (
            <EnhancedButton
              key={index}
              id={`${id}-action-${index}`}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              testId={`${testId}-action-${index}`}
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </EnhancedButton>
          ))}
        </div>
      )}
    </div>
  )

  if (href && !onClick) {
    return (
      <a href={href} className="block">
        {cardContent}
      </a>
    )
  }

  return cardContent
}

// ========================================
// MAIN ENHANCED INTERACTIVE SYSTEM
// ========================================

interface EnhancedInteractiveSystemProps {
  children: React.ReactNode
  enableTracking?: boolean
  enableToasts?: boolean
  className?: string
}

export function EnhancedInteractiveSystem({ 
  children: unknown, enableTracking = true: unknown, enableToasts = true: unknown, className = ''
}: EnhancedInteractiveSystemProps) {
  const [state, dispatch] = useReducer(interactiveReducer, initialState)
  
  // Auto-remove toasts after 5 seconds
  useEffect(() => {
    state.toasts.forEach(toast => {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: toast.id })
      }, 5000)
    })
  }, [state.toasts])

  // Context7 Pattern: Centralized Interaction Tracking
  // const trackInteraction = useCallback((type: string, payload: Record<string, unknown>) => {
  //   if (enableTracking) {
  //     dispatch({ type: 'TRACK_INTERACTION', payload: { type, payload } })
  //   }
  // }, [enableTracking])

  return (
    <div className={`enhanced-interactive-system ${className}`}>
      {children}
      
      {/* Toast Notifications */}
      {enableToasts && state.toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {state.toasts.map(toast => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                toast.type === 'success' ? 'bg-green-500 text-white' :
                toast.type === 'error' ? 'bg-red-500 text-white' :
                toast.type === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{toast.message}</span>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Interaction Tracker */}
      {enableTracking && (
        <div className="fixed bottom-4 left-4 z-40 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
          <div className="text-green-400">
            ✅ Interactive System Active ({state.userInteractions.length} interactions)
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedInteractiveSystem 