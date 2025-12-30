'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle, 
  Info, 
  AlertCircle, 
  CheckCircle,
  Lightbulb,
  Keyboard,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TooltipAction {
  label: string
  icon?: React.ReactNode
  action: () => void
  variant?: 'default' | 'outline' | 'ghost'
}

interface TooltipMetadata {
  lastUsed?: string
  usageCount?: number
  popularity?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  version?: string
  status?: 'stable' | 'beta' | 'deprecated' | 'new'
}

interface ContextualTooltipProps {
  children: React.ReactNode
  title: string
  description?: string
  type?: 'info' | 'help' | 'warning' | 'success' | 'tip' | 'shortcut' | 'feature'
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  showArrow?: boolean
  showDelay?: number
  hideDelay?: number
  actions?: TooltipAction[]
  metadata?: TooltipMetadata
  shortcut?: string[]
  relatedLinks?: { label: string; href: string }[]
  examples?: string[]
  tips?: string[]
  interactive?: boolean
  persistent?: boolean
  maxWidth?: number
  className?: string
}

// Tooltip type configurations
const tooltipTypeConfig = {
  info: {
    icon: <Info className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  help: {
    icon: <HelpCircle className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  warning: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  success: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  tip: {
    icon: <Lightbulb className="h-4 w-4" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  shortcut: {
    icon: <Keyboard className="h-4 w-4" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800'
  },
  feature: {
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-200 dark:border-pink-800'
  }
}

// Smart tooltip positioning hook
function useSmartPositioning(targetRef: React.RefObject<HTMLElement>) {
  const [position, setPosition] = React.useState<{ side: string; align: string }>({
    side: 'top',
    align: 'center'
  })

  React.useEffect(() => {
    if (!targetRef.current) return

    const updatePosition = () => {
      const rect = targetRef.current!.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      let side = 'top'
      let align = 'center'

      // Determine best side
      if (rect.top < 100) side = 'bottom'
      else if (rect.bottom > viewport.height - 100) side = 'top'
      else if (rect.left < 200) side = 'right'
      else if (rect.right > viewport.width - 200) side = 'left'

      // Determine best alignment
      if (rect.left < 50) align = 'start'
      else if (rect.right > viewport.width - 50) align = 'end'

      setPosition({ side, align })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [targetRef])

  return position
}

// Format keyboard shortcut
function formatShortcut(keys: string[]) {
  const keyMap: Record<string, string> = {
    cmd: '⌘',
    ctrl: 'Ctrl',
    alt: '⌥',
    shift: '⇧',
    enter: '↵',
    escape: 'Esc',
    space: '␣'
  }

  return keys.map(key => keyMap[key.toLowerCase()] || key.toUpperCase()).join(' + ')
}

// Get difficulty badge color
function getDifficultyColor(difficulty?: string) {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
    case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Get status badge color
function getStatusColor(status?: string) {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'beta': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'deprecated': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-green-100 text-green-800 border-green-200'
  }
}

export function ContextualTooltip({
  children,
  title,
  description,
  type = 'info',
  side = 'top',
  align = 'center',
  showArrow = true,
  showDelay = 500,
  hideDelay = 0,
  actions = [],
  metadata,
  shortcut,
  relatedLinks = [],
  examples = [],
  tips = [],
  interactive = false,
  persistent = false,
  maxWidth = 320,
  className
}: ContextualTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hasBeenSeen, setHasBeenSeen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const smartPosition = useSmartPositioning(triggerRef)
  const showTimeoutRef = React.useRef<NodeJS.Timeout>()
  const hideTimeoutRef = React.useRef<NodeJS.Timeout>()

  const config = tooltipTypeConfig[type]
  const actualSide = side === 'top' ? smartPosition.side : side
  const actualAlign = align === 'center' ? smartPosition.align : align

  const handleMouseEnter = React.useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    
    showTimeoutRef.current = setTimeout(() => {
      setIsOpen(true)
      if (!hasBeenSeen) {
        setHasBeenSeen(true)
      }
    }, showDelay)
  }, [showDelay, hasBeenSeen])

  const handleMouseLeave = React.useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
    }
    
    if (!persistent && !interactive) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsOpen(false)
      }, hideDelay)
    }
  }, [hideDelay, persistent, interactive])

  const handleTooltipMouseEnter = React.useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  const handleTooltipMouseLeave = React.useCallback(() => {
    if (!persistent) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsOpen(false)
      }, hideDelay)
    }
  }, [hideDelay, persistent])

  React.useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  return (
    <TooltipProvider>
      <Tooltip 
        open={isOpen} 
        onOpenChange={setIsOpen}
        delayDuration={0}
      >
        <TooltipTrigger asChild>
          <div
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="inline-block"
          >
            {children}
          </div>
        </TooltipTrigger>
        
        <TooltipContent
          side={actualSide as any}
          align={actualAlign as any}
          className={cn(
            "p-0 border-0 bg-transparent shadow-none",
            className
          )}
          onMouseEnter={interactive ? handleTooltipMouseEnter : undefined}
          onMouseLeave={interactive ? handleTooltipMouseLeave : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: actualSide === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: actualSide === 'top' ? 10 : -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              "relative rounded-lg border shadow-lg",
              config.bgColor,
              config.borderColor,
              "max-w-sm"
            )}
            style={{ maxWidth: `${maxWidth}px` }}
          >
            {/* Header */}
            <div className="p-3 pb-2">
              <div className="flex items-start space-x-2">
                <div className={cn("flex-shrink-0 mt-0.5", config.color)}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {title}
                  </h4>
                  {description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {/* Metadata badges */}
              {(metadata?.difficulty || metadata?.status || metadata?.version) && (
                <div className="flex items-center space-x-1 mt-2">
                  {metadata.difficulty && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs h-5", getDifficultyColor(metadata.difficulty))}
                    >
                      {metadata.difficulty}
                    </Badge>
                  )}
                  {metadata.status && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs h-5", getStatusColor(metadata.status))}
                    >
                      {metadata.status}
                    </Badge>
                  )}
                  {metadata.version && (
                    <Badge variant="outline" className="text-xs h-5">
                      v{metadata.version}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Keyboard shortcut */}
            {shortcut && shortcut.length > 0 && (
              <>
                <Separator />
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Keyboard shortcut
                    </span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                </div>
              </>
            )}

            {/* Usage statistics */}
            {(metadata?.usageCount || metadata?.popularity) && (
              <>
                <Separator />
                <div className="px-3 py-2 space-y-2">
                  {metadata.usageCount && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Times used</span>
                      <span className="font-medium">{metadata.usageCount}</span>
                    </div>
                  )}
                  {metadata.popularity && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Popularity</span>
                        <span className="font-medium">{metadata.popularity}%</span>
                      </div>
                      <Progress value={metadata.popularity} className="h-1" />
                    </div>
                  )}
                  {metadata.lastUsed && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Last used</span>
                      <span className="font-medium">{metadata.lastUsed}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Examples */}
            {examples.length > 0 && (
              <>
                <Separator />
                <div className="px-3 py-2">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Examples
                  </h5>
                  <div className="space-y-1">
                    {examples.slice(0, 3).map((example, index) => (
                      <div key={index} className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <>
                <Separator />
                <div className="px-3 py-2">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
                    <Lightbulb className="h-3 w-3" />
                    <span>Tips</span>
                  </h5>
                  <div className="space-y-1">
                    {tips.slice(0, 2).map((tip, index) => (
                      <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-1">
                        <div className="w-1 h-1 bg-current rounded-full mt-1.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Related links */}
            {relatedLinks.length > 0 && (
              <>
                <Separator />
                <div className="px-3 py-2">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Learn more
                  </h5>
                  <div className="space-y-1">
                    {relatedLinks.slice(0, 3).map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <>
                <Separator />
                <div className="p-2 space-y-1">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'ghost'}
                      size="sm"
                      onClick={() => {
                        action.action()
                        setIsOpen(false)
                      }}
                      className="w-full justify-start h-7 text-xs"
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {/* Close button for persistent tooltips */}
            {persistent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="absolute top-1 right-1 h-6 w-6 p-0"
              >
                <span className="sr-only">Close</span>
                ×
              </Button>
            )}
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Specialized tooltip components
export function HelpTooltip({ children, content, ...props }: { 
  children: React.ReactNode; 
  content: string;
} & Partial<ContextualTooltipProps>) {
  return (
    <ContextualTooltip
      type="help"
      title="Help"
      description={content}
      {...props}
    >
      {children}
    </ContextualTooltip>
  )
}

export function ShortcutTooltip({ 
  children, 
  action, 
  keys,
  ...props 
}: { 
  children: React.ReactNode; 
  action: string;
  keys: string[];
} & Partial<ContextualTooltipProps>) {
  return (
    <ContextualTooltip
      type="shortcut"
      title={action}
      shortcut={keys}
      {...props}
    >
      {children}
    </ContextualTooltip>
  )
}

export function FeatureTooltip({ 
  children, 
  feature, 
  description,
  isNew = false,
  ...props 
}: { 
  children: React.ReactNode; 
  feature: string;
  description: string;
  isNew?: boolean;
} & Partial<ContextualTooltipProps>) {
  return (
    <ContextualTooltip
      type="feature"
      title={feature}
      description={description}
      metadata={{ status: isNew ? 'new' : 'stable' }}
      {...props}
    >
      {children}
    </ContextualTooltip>
  )
}

export function StatusTooltip({ 
  children, 
  status, 
  description,
  ...props 
}: { 
  children: React.ReactNode; 
  status: 'success' | 'warning' | 'info';
  description: string;
} & Partial<ContextualTooltipProps>) {
  return (
    <ContextualTooltip
      type={status === 'success' ? 'success' : status === 'warning' ? 'warning' : 'info'}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
      description={description}
      {...props}
    >
      {children}
    </ContextualTooltip>
  )
}

export default ContextualTooltip
