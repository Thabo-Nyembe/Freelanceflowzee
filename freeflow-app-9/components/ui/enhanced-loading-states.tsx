'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Loader2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Wifi,
  Upload,
  Sparkles,
  Brain,
  Image,
  FileText,
  Video
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LoadingStep {
  id: string
  label: string
  status: 'pending' | 'loading' | 'completed' | 'error'
  duration?: number
  icon?: React.ReactNode
}

interface EnhancedLoadingProps {
  variant?: 'spinner' | 'skeleton' | 'progress' | 'steps' | 'pulse' | 'dots'
  size?: 'sm' | 'md' | 'lg'
  message?: string
  submessage?: string
  progress?: number
  steps?: LoadingStep[]
  showProgress?: boolean
  showTime?: boolean
  animated?: boolean
  className?: string
}

// Skeleton components
export function SkeletonLine({ className, width = "100%" }: { className?: string; width?: string }) {
  return (
    <div 
      className={cn("h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse", className)}
      style={{ width }}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="space-y-3 p-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <SkeletonLine width="60%" />
            <SkeletonLine width="40%" className="h-3" />
          </div>
        </div>
        <div className="space-y-2">
          <SkeletonLine />
          <SkeletonLine width="80%" />
          <SkeletonLine width="90%" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLine key={i} className="h-5" width={`${60 + Math.random() * 40}%`} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLine key={colIndex} className="h-4" width={`${50 + Math.random() * 50}%`} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Animated dots loader
function DotsLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dotSize = size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3"
  
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("bg-blue-500 rounded-full", dotSize)}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

// Pulse loader
function PulseLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const pulseSize = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12"
  
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className={cn("bg-blue-500 rounded-full", pulseSize)}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0.3, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
      />
      <motion.div
        className={cn("absolute bg-blue-400 rounded-full", pulseSize)}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.3
        }}
      />
    </div>
  )
}

// Step loader
function StepLoader({ steps, className }: { steps: LoadingStep[]; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-3"
        >
          <div className="flex-shrink-0">
            {step.status === 'completed' && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {step.status === 'loading' && (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            )}
            {step.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            {step.status === 'pending' && (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
            )}
          </div>
          
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              step.status === 'completed' && "text-green-700",
              step.status === 'loading' && "text-blue-700",
              step.status === 'error' && "text-red-700",
              step.status === 'pending' && "text-gray-500"
            )}>
              {step.label}
            </p>
            {step.duration && step.status === 'loading' && (
              <p className="text-xs text-gray-500">
                Estimated: {step.duration}s
              </p>
            )}
          </div>
          
          {step.icon && (
            <div className="flex-shrink-0 text-gray-400">
              {step.icon}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Main enhanced loading component
export function EnhancedLoading({
  variant = 'spinner',
  size = 'md',
  message = 'Loading...',
  submessage,
  progress,
  steps,
  showProgress = false,
  showTime = false,
  animated = true,
  className
}: EnhancedLoadingProps) {
  const [elapsedTime, setElapsedTime] = React.useState(0)

  // Timer for elapsed time
  React.useEffect(() => {
    if (!showTime) return

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [showTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4'
      case 'lg': return 'h-8 w-8'
      default: return 'h-6 w-6'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm'
      case 'lg': return 'text-lg'
      default: return 'text-base'
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* Loading indicator */}
      <div className="flex items-center justify-center">
        {variant === 'spinner' && (
          <Loader2 className={cn("animate-spin text-blue-500", getSpinnerSize())} />
        )}
        
        {variant === 'dots' && <DotsLoader size={size} />}
        
        {variant === 'pulse' && <PulseLoader size={size} />}
        
        {variant === 'progress' && progress !== undefined && (
          <div className="w-64 space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(progress)}%</span>
              {showTime && <span>{formatTime(elapsedTime)}</span>}
            </div>
          </div>
        )}
        
        {variant === 'steps' && steps && <StepLoader steps={steps} />}
        
        {variant === 'skeleton' && (
          <div className="space-y-4 w-full max-w-md">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
      </div>

      {/* Message */}
      {(variant !== 'skeleton' && variant !== 'steps') && (
        <div className="text-center space-y-2">
          <p className={cn("font-medium text-gray-700 dark:text-gray-300", getTextSize())}>
            {message}
          </p>
          {submessage && (
            <p className="text-sm text-gray-500">
              {submessage}
            </p>
          )}
          {showTime && (
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
      )}

      {/* Progress bar for non-progress variants */}
      {showProgress && variant !== 'progress' && progress !== undefined && (
        <div className="w-64 space-y-1">
          <Progress value={progress} className="h-1" />
          <div className="text-center text-xs text-gray-500">
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized loading components for different contexts
export function DataLoading({ message = "Loading data...", showProgress = false, progress }: { 
  message?: string; 
  showProgress?: boolean; 
  progress?: number 
}) {
  return (
    <EnhancedLoading
      variant="spinner"
      message={message}
      submessage="Fetching from database"
      progress={progress}
      showProgress={showProgress}
      className="py-12"
    />
  )
}

export function AIProcessing({ 
  message = "AI is processing...", 
  steps 
}: { 
  message?: string; 
  steps?: LoadingStep[] 
}) {
  const defaultSteps: LoadingStep[] = [
    { id: '1', label: 'Analyzing input', status: 'completed', icon: <Brain className="h-4 w-4" /> },
    { id: '2', label: 'Processing with AI', status: 'loading', duration: 5, icon: <Sparkles className="h-4 w-4" /> },
    { id: '3', label: 'Generating results', status: 'pending', icon: <Zap className="h-4 w-4" /> },
    { id: '4', label: 'Finalizing output', status: 'pending', icon: <CheckCircle className="h-4 w-4" /> }
  ]

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{message}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          This may take a few moments
        </p>
      </div>
      <StepLoader steps={steps || defaultSteps} />
    </div>
  )
}

export function FileProcessing({ 
  fileName, 
  fileType, 
  progress 
}: { 
  fileName: string; 
  fileType: 'image' | 'video' | 'document' | 'other';
  progress: number;
}) {
  const getIcon = () => {
    switch (fileType) {
      case 'image': return <Image className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      case 'document': return <FileText className="h-5 w-5" />
      default: return <Upload className="h-5 w-5" />
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-blue-500">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {fileName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processing {fileType}...
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(progress)}% complete</span>
            <span>{progress < 100 ? 'Processing...' : 'Complete!'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NetworkLoading({ 
  isOnline = true, 
  message = "Connecting to server..." 
}: { 
  isOnline?: boolean; 
  message?: string 
}) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center space-x-2">
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5 text-green-500" />
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </>
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      <p className={cn(
        "text-sm font-medium",
        isOnline ? "text-gray-700 dark:text-gray-300" : "text-red-600"
      )}>
        {isOnline ? message : "Connection lost"}
      </p>
      {!isOnline && (
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      )}
    </div>
  )
}

// Loading overlay component
export function LoadingOverlay({ 
  isLoading, 
  children, 
  variant = 'spinner',
  message = 'Loading...',
  className 
}: {
  isLoading: boolean;
  children: React.ReactNode;
  variant?: EnhancedLoadingProps['variant'];
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <EnhancedLoading variant={variant} message={message} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedLoading
