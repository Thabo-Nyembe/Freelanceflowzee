"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
  Loader2
} from "lucide-react"

/**
 * Toast Notifications System - A+++ UI/UX
 * Premium toast notifications with smooth animations and queuing
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ToastVariant = "success" | "error" | "warning" | "info" | "loading"
export type ToastPosition = "top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-left" | "bottom-center"

export interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  loading: (title: string, description?: string) => string
  updateToast: (id: string, updates: Partial<Toast>) => void
}

// ============================================================================
// CONTEXT & PROVIDER
// ============================================================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
}

export function ToastProvider({
  children,
  position = "top-right",
  maxToasts = 5
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }

    setToasts(prev => {
      const updated = [...prev, newToast]
      // Limit number of toasts
      if (updated.length > maxToasts) {
        return updated.slice(updated.length - maxToasts)
      }
      return updated
    })

    // Auto remove after duration (unless it's a loading toast)
    if (toast.variant !== "loading") {
      const duration = toast.duration || 5000
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (title: string, description?: string) => {
    addToast({ title, description, variant: "success" })
  }

  const error = (title: string, description?: string) => {
    addToast({ title, description, variant: "error" })
  }

  const warning = (title: string, description?: string) => {
    addToast({ title, description, variant: "warning" })
  }

  const info = (title: string, description?: string) => {
    addToast({ title, description, variant: "info" })
  }

  const loading = (title: string, description?: string) => {
    return addToast({ title, description, variant: "loading" })
  }

  const updateToast = (id: string, updates: Partial<Toast>) => {
    setToasts(prev =>
      prev.map(toast => (toast.id === id ? { ...toast, ...updates } : toast))
    )

    // If updating to non-loading variant, set auto-remove timer
    if (updates.variant && updates.variant !== "loading") {
      const duration = updates.duration || 5000
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    loading,
    updateToast,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

interface ToastContainerProps {
  toasts: Toast[]
  position: ToastPosition
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, position, onRemove }: ToastContainerProps) {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  }

  return (
    <div className={cn("fixed z-50 flex flex-col gap-3 max-w-md w-full", positionClasses[position])}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// TOAST ITEM
// ============================================================================

interface ToastItemProps {
  toast: Toast
  onRemove: () => void
  index: number
}

function ToastItem({ toast, onRemove, index }: ToastItemProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (toast.variant === "loading") return

    const duration = toast.duration || 5000
    const interval = 50
    const decrement = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev - decrement
        return next <= 0 ? 0 : next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [toast.duration, toast.variant])

  const variantStyles = {
    success: {
      container: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      icon: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
      progress: "bg-green-600 dark:bg-green-400",
      text: "text-green-900 dark:text-green-100",
      description: "text-green-700 dark:text-green-300",
    },
    error: {
      container: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
      icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
      progress: "bg-red-600 dark:bg-red-400",
      text: "text-red-900 dark:text-red-100",
      description: "text-red-700 dark:text-red-300",
    },
    warning: {
      container: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
      icon: <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
      progress: "bg-yellow-600 dark:bg-yellow-400",
      text: "text-yellow-900 dark:text-yellow-100",
      description: "text-yellow-700 dark:text-yellow-300",
    },
    info: {
      container: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
      icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      progress: "bg-blue-600 dark:bg-blue-400",
      text: "text-blue-900 dark:text-blue-100",
      description: "text-blue-700 dark:text-blue-300",
    },
    loading: {
      container: "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800",
      icon: <Loader2 className="h-5 w-5 text-gray-600 dark:text-gray-400 animate-spin" />,
      progress: "bg-gray-600 dark:bg-gray-400",
      text: "text-gray-900 dark:text-gray-100",
      description: "text-gray-700 dark:text-gray-300",
    },
  }

  const styles = variantStyles[toast.variant]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className={cn(
        "relative rounded-lg border shadow-lg overflow-hidden",
        "backdrop-blur-sm",
        styles.container
      )}
      style={{
        zIndex: 1000 - index,
      }}
    >
      {/* Progress bar */}
      {toast.variant !== "loading" && (
        <motion.div
          className={cn("absolute top-0 left-0 h-1", styles.progress)}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
      )}

      <div className="p-4 pt-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-semibold", styles.text)}>{toast.title}</p>
            {toast.description && (
              <p className={cn("mt-1 text-sm", styles.description)}>{toast.description}</p>
            )}

            {/* Action button */}
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick()
                  onRemove()
                }}
                className={cn(
                  "mt-3 text-sm font-medium underline",
                  styles.text,
                  "hover:no-underline transition-all"
                )}
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onRemove}
            className={cn(
              "flex-shrink-0 p-1 rounded-md transition-colors",
              "hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// PRESET TOAST COMPONENTS
// ============================================================================

/**
 * SuccessToast - Pre-configured success toast
 */
export function SuccessToast({ title, description }: { title: string; description?: string }) {
  const { success } = useToast()

  useEffect(() => {
    success(title, description)
  }, [title, description, success])

  return null
}

/**
 * ErrorToast - Pre-configured error toast
 */
export function ErrorToast({ title, description }: { title: string; description?: string }) {
  const { error } = useToast()

  useEffect(() => {
    error(title, description)
  }, [title, description, error])

  return null
}

/**
 * WarningToast - Pre-configured warning toast
 */
export function WarningToast({ title, description }: { title: string; description?: string }) {
  const { warning } = useToast()

  useEffect(() => {
    warning(title, description)
  }, [title, description, warning])

  return null
}

/**
 * InfoToast - Pre-configured info toast
 */
export function InfoToast({ title, description }: { title: string; description?: string }) {
  const { info } = useToast()

  useEffect(() => {
    info(title, description)
  }, [title, description, info])

  return null
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage of the toast system:
 *
 * 1. Wrap your app with ToastProvider:
 * ```tsx
 * <ToastProvider position="top-right">
 *   <App />
 * </ToastProvider>
 * ```
 *
 * 2. Use the useToast hook:
 * ```tsx
 * function MyComponent() {
 *   const { success, error, loading, updateToast } = useToast()
 *
 *   const handleSubmit = async () => {
 *     const loadingId = loading("Saving...", "Please wait")
 *
 *     try {
 *       await saveData()
 *       updateToast(loadingId, {
 *         variant: "success",
 *         title: "Saved!",
 *         description: "Your changes have been saved"
 *       })
 *     } catch (err) {
 *       updateToast(loadingId, {
 *         variant: "error",
 *         title: "Error",
 *         description: err.message
 *       })
 *     }
 *   }
 *
 *   return <button onClick={handleSubmit}>Save</button>
 * }
 * ```
 *
 * 3. Simple notifications:
 * ```tsx
 * success("Success!", "Your profile has been updated")
 * error("Error", "Failed to save changes")
 * warning("Warning", "Your session will expire soon")
 * info("Info", "New features are available")
 * ```
 *
 * 4. With action button:
 * ```tsx
 * addToast({
 *   variant: "info",
 *   title: "New message",
 *   description: "You have 3 unread messages",
 *   action: {
 *     label: "View",
 *     onClick: () => router.push("/messages")
 *   }
 * })
 * ```
 */
