'use client

import React, { useReducer, useEffect, useCallback } from 'react
// Context7 MCP Integration for Enhanced Interactive Patterns
 payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_NAVIGATION' }
  | { type: 'OPEN_MODAL'; payload: string }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: &apos;ADD_TOAST&apos;; payload: Omit<InteractiveState['toasts'][0], 'id' | &apos;timestamp&apos;> }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: &apos;SET_BUTTON_STATE&apos;; payload: { id: string; state: Partial<InteractiveState['buttonStates'][0]> } }
  | { type: &apos;TRACK_INTERACTION&apos;; payload: Omit<InteractiveState['userInteractions'][0], 'timestamp'> }
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
    testId: 'nav-dashboard
  },
  { 
    href: '/dashboard/projects-hub', 
    title: 'Projects Hub', 
    icon: FolderOpen, 
    description: 'Manage all your projects in one place',
    category: 'Core',
    testId: 'nav-projects-hub
  },
  { 
    href: '/dashboard/my-day', 
    title: 'My Day Today', 
    icon: Calendar, 
    description: 'AI-powered daily planning and tasks',
    category: 'Productivity',
    testId: 'nav-my-day
  },
  { 
    href: '/dashboard/collaboration', 
    title: 'Collaboration', 
    icon: MessageSquare, 
    description: 'Real-time client collaboration tools',
    category: 'Client',
    testId: 'nav-collaboration
  },
  { 
    href: '/dashboard/escrow', 
    title: 'Escrow System', 
    icon: Shield, 
    description: 'Secure payment protection',
    category: 'Financial',
    testId: 'nav-escrow
  },
  { 
    href: '/dashboard/files-hub', 
    title: 'Files Hub', 
    icon: FolderOpen, 
    description: 'Organize and share project files',
    category: 'Storage',
    testId: 'nav-files-hub
  },
  { 
    href: '/dashboard/storage', 
    title: 'Multi-Cloud Storage', 
    icon: Cloud, 
    description: 'Enterprise storage management',
    category: 'Storage',
    testId: 'nav-storage
  },
  { 
    href: '/dashboard/community', 
    title: 'Community Hub', 
    icon: Users, 
    description: 'Connect with other creators',
    category: 'Social',
    testId: 'nav-community
  },
  { 
    href: '/dashboard/ai-design', 
    title: 'AI Design Assistant', 
    icon: Cpu, 
    description: 'AI-powered design analysis',
    category: 'AI',
    testId: 'nav-ai-design
  },
  { 
    href: '/dashboard/ai-create', 
    title: 'AI Create', 
    icon: Sparkles, 
    description: 'Generate assets with AI',
    category: 'AI',
    testId: 'nav-ai-create
  },
  { 
    href: '/dashboard/client-zone', 
    title: 'Client Portal', 
    icon: UserCheck, 
    description: 'Client access and project sharing',
    category: 'Client',
    testId: 'nav-client-zone
  },
  { 
    href: '/dashboard/analytics', 
    title: 'Analytics', 
    icon: BarChart3, 
    description: 'Business insights and metrics',
    category: 'Analytics',
    testId: 'nav-analytics
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
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link
  size?: 'default' | 'sm' | 'lg' | 'icon
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
  id, 
  children, 
  variant = 'default', 
  size = 'default',
  href,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  testId,
  trackingData,
  external = false,
  download
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
        action: 'button_click',
        target: id,
        metadata: { href, trackingData }
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
          message: `Action completed successfully
        }
      })

    } catch (error) {
      // Error feedback
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          type: 'error',
          message: `Action failed: ${error instanceof Error ? error.message : 'Unknown error'}
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
        <div className= "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
      {external && !isLoading && (
        <ExternalLink className= "ml-2 h-4 w-4" />
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
        className= "inline-block
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
  icon: React.ComponentType<any>
  testId: string
  description?: string
  category?: string
}

interface EnhancedNavigationProps {
  routes: RouteType[]
  variant?: 'sidebar' | 'header' | 'mobile' | 'breadcrumb
  activeRoute?: string
  onRouteChange?: (route: string) => void
  className?: string
}

export function EnhancedNavigation({ 
  routes, 
  variant = 'header', 
  activeRoute,
  onRouteChange,
  className = 
}: EnhancedNavigationProps) {
  const pathname = usePathname()
  const [state, dispatch] = useReducer(interactiveReducer, initialState)
  
  const currentRoute = activeRoute || pathname

  const renderRoute = (route: RouteType) => {
    const Icon = route.icon
    const isActive = currentRoute === route.href
    
    const buttonContent = (
      <>
        <Icon className= "h-4 w-4" />
        <span className={variant === 'sidebar' ? '&apos; : &apos;sr-only md:not-sr-only&apos;}>{route.title}</span>
        {isActive && variant === 'sidebar' && (
          <ChevronRight className= "ml-auto h-4 w-4" />
        )}
      </>
    )

    if (variant === 'sidebar') {
      return (
        <EnhancedButton
          key={route.href}
          id={`nav-${route.testId}`}
          variant={isActive ? 'secondary' : 'ghost'}
          className={`w-full justify-start gap-3 ${isActive ? 'bg-accent border-r-2 border-primary' : }`}
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
          variant= "ghost
          size= "sm
          className={`gap-2 ${isActive ? 'bg-accent text-accent-foreground' : }`}
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
          variant= "ghost
          className={`flex-col gap-1 h-auto py-2 ${isActive ? 'text-primary bg-primary/10' : }`}
          href={route.href}
          testId={`mobile-${route.testId}`}
          trackingData={{ category: 'navigation', variant }}
        >
          <Icon className= "h-5 w-5" />
          <span className= "text-xs">{route.title}</span>
        </EnhancedButton>
      )
    }

    return null
  }

  if (variant === 'sidebar') {
    return (
      <nav className={`space-y-1 ${className}`} data-testid= "sidebar-navigation">
        {routes.map(renderRoute)}
      </nav>
    )
  }

  if (variant === 'header') {
    return (
      <nav className={`flex items-center space-x-2 ${className}`} data-testid= "header-navigation">
        {routes.map(renderRoute)}
      </nav>
    )
  }

  if (variant === 'mobile') {
    return (
      <nav className={`flex justify-around items-center ${className}`} data-testid= "mobile-navigation">
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
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive
  }>
  className?: string
  testId?: string
  interactive?: boolean
  badge?: string
  status?: 'active' | 'inactive' | 'pending' | 'complete
}

export function EnhancedCard({
  id,
  title,
  description,
  children,
  href,
  onClick,
  actions = [],
  className = '',
  testId,
  interactive = true,
  badge,
  status
}: EnhancedCardProps) {
  const [state, dispatch] = useReducer(interactiveReducer, initialState)
  
  const handleCardClick = useCallback(() => {
    if (!interactive) return
    
    dispatch({
      type: 'TRACK_INTERACTION',
      payload: {
        action: 'card_click',
        target: id,
        metadata: { href, title }
      }
    })

    if (onClick) {
      onClick()
    }
  }, [id, href, title, onClick, interactive])

  const cardContent = (
    <Card 
      className={
        ${interactive ? 'hover:shadow-lg cursor-pointer transition-all duration-200' : }
        ${className}
      `}
      data-testid={testId}
      onClick={handleCardClick}
    >
      <CardHeader className= "pb-3">
        <div className= "flex items-start justify-between">
          <div className= "space-y-1">
            <CardTitle className= "text-lg">{title}</CardTitle>
            {description && (
              <p className= "text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className= "flex items-center space-x-2">
            {badge && (
              <Badge variant= "secondary">{badge}</Badge>
            )}
            {status && (
              <Badge 
                variant={
                  status === 'complete' ? 'default' :
                  status === 'active' ? 'secondary' :
                  status === 'pending' ? 'outline' : 'destructive
                }
              >
                {status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className= "pt-0">
          {children}
        </CardContent>
      )}
      {actions.length > 0 && (
        <CardContent className= "pt-0">
          <Separator className= "mb-4" />
          <div className= "flex items-center justify-end space-x-2">
            {actions.map((action, index) => (
              <EnhancedButton
                key={index}
                id={`${id}-action-${index}`}
                variant={action.variant || 'outline'}
                size= "sm
                onClick={action.onClick}
                testId={`${testId}-action-${index}`}
              >
                {action.icon && <action.icon className= "h-4 w-4 mr-2" />}
                {action.label}
              </EnhancedButton>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )

  if (href && !onClick) {
    return (
      <Link href={href} className= "block">
        {cardContent}
      </Link>
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
  children, 
  enableTracking = true, 
  enableToasts = true,
  className = 
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

  return (
    <div className={`enhanced-interactive-system ${className}`}>
      {children}
      
      {/* Toast Notifications */}
      {enableToasts && state.toasts.length > 0 && (
        <div className= "fixed top-4 right-4 z-50 space-y-2">
          {state.toasts.map(toast => (
            <div
              key={toast.id}
              className={
                p-4 rounded-lg shadow-lg max-w-sm
                ${toast.type === 'success' ? 'bg-green-500 text-white' :
                  toast.type === 'error' ? 'bg-red-500 text-white' :
                  toast.type === 'warning' ? 'bg-yellow-500 text-white' :
                  'bg-blue-500 text-white'}
              `}
            >
              <div className= "flex items-center justify-between">
                <span>{toast.message}</span>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
                  className= "ml-2 text-white hover:text-gray-200
                >
                  <X className= "h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Interaction Tracker */}
      {enableTracking && (
        <div className= "fixed bottom-4 left-4 z-40 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
          <div className= "text-green-400">
            ✅ Interactive System Active ({state.userInteractions.length} interactions)
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedInteractiveSystem 