'use client'

/**
 * Enhanced Toast Notifications
 * Rich, data-driven toast notifications with structured logging integration
 */

import { toast as sonnerToast, ExternalToast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  Copy,
  Download,
  Upload,
  Trash2,
  Save,
  Send,
  Eye,
  Settings,
  Zap,
  TrendingUp,
  FileText,
  User,
  Clock,
  Database
} from 'lucide-react'

const logger = createFeatureLogger('EnhancedToast')

// Toast types with icons
const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2,
  copy: Copy,
  download: Download,
  upload: Upload,
  delete: Trash2,
  save: Save,
  send: Send,
  view: Eye,
  settings: Settings,
  action: Zap,
  metric: TrendingUp,
  file: FileText,
  user: User,
  time: Clock,
  data: Database
}

export type ToastType = keyof typeof TOAST_ICONS

export interface EnhancedToastData {
  title: string
  description?: string
  type?: ToastType
  data?: Record<string, any>
  metadata?: {
    count?: number
    size?: string
    duration?: string
    timestamp?: string
    errorId?: string
    userId?: string
    actionType?: string
    [key: string]: any
  }
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  duration?: number
}

/**
 * Enhanced toast notification with rich data display
 */
export function enhancedToast(options: EnhancedToastData) {
  const {
    title,
    description,
    type = 'info',
    data,
    metadata,
    action,
    dismissible = true,
    duration = 4000
  } = options

  // Log the toast event
  logger.info('Toast notification displayed', {
    title,
    type,
    hasData: !!data,
    hasMetadata: !!metadata,
    metadata
  })

  const Icon = TOAST_ICONS[type] || Info
  const isLoading = type === 'loading'

  // Build description with metadata
  let enhancedDescription = description || ''

  if (metadata) {
    const metaParts: string[] = []

    if (metadata.count !== undefined) {
      metaParts.push(`${metadata.count} item${metadata.count !== 1 ? 's' : ''}`)
    }
    if (metadata.size) {
      metaParts.push(metadata.size)
    }
    if (metadata.duration) {
      metaParts.push(metadata.duration)
    }
    if (metadata.errorId) {
      metaParts.push(`Error ID: ${metadata.errorId}`)
    }

    if (metaParts.length > 0) {
      enhancedDescription = metaParts.join(' • ')
      if (description) {
        enhancedDescription = `${description} • ${enhancedDescription}`
      }
    }
  }

  // Show data in description if provided
  if (data && Object.keys(data).length > 0) {
    const dataStr = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    if (enhancedDescription) {
      enhancedDescription += ` | ${dataStr}`
    } else {
      enhancedDescription = dataStr
    }
  }

  const toastOptions: ExternalToast = {
    description: enhancedDescription,
    duration: isLoading ? Infinity : duration,
    dismissible,
    icon: <Icon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />,
    action: action ? {
      label: action.label,
      onClick: action.onClick
    } : undefined
  }

  // Choose the right toast type
  switch (type) {
    case 'success':
      return sonnerToast.success(title, toastOptions)
    case 'error':
      return sonnerToast.error(title, toastOptions)
    case 'warning':
      return sonnerToast.warning(title, toastOptions)
    case 'loading':
      return sonnerToast.loading(title, toastOptions)
    default:
      return sonnerToast(title, toastOptions)
  }
}

/**
 * Success toast with data
 */
export function successToast(
  title: string,
  description?: string,
  metadata?: EnhancedToastData['metadata']
) {
  return enhancedToast({
    title,
    description,
    type: 'success',
    metadata
  })
}

/**
 * Error toast with error ID and details
 */
export function errorToast(
  title: string,
  error?: Error | string,
  errorId?: string
) {
  const description = typeof error === 'string'
    ? error
    : error?.message || 'An unexpected error occurred'

  logger.error('Error toast displayed', {
    title,
    error: typeof error === 'string' ? error : error?.message,
    stack: error instanceof Error ? error.stack : undefined,
    errorId
  })

  return enhancedToast({
    title,
    description,
    type: 'error',
    metadata: errorId ? { errorId } : undefined
  })
}

/**
 * Copy operation toast
 */
export function copyToast(
  itemName: string,
  content: string,
  metadata?: { size?: string; format?: string }
) {
  return enhancedToast({
    title: `${itemName} Copied`,
    description: content.length > 50 ? `${content.substring(0, 50)}...` : content,
    type: 'copy',
    metadata: {
      count: content.length,
      size: metadata?.size || `${content.length} characters`,
      ...metadata
    }
  })
}

/**
 * File operation toast
 */
export function fileToast(
  action: 'upload' | 'download' | 'save' | 'delete',
  fileName: string,
  metadata?: { size?: string; count?: number }
) {
  const actions = {
    upload: 'Uploaded',
    download: 'Downloaded',
    save: 'Saved',
    delete: 'Deleted'
  }

  return enhancedToast({
    title: `File ${actions[action]}`,
    description: fileName,
    type: action,
    metadata
  })
}

/**
 * Data operation toast
 */
export function dataToast(
  operation: string,
  entityName: string,
  metadata?: { count?: number; [key: string]: any }
) {
  return enhancedToast({
    title: `${operation} ${entityName}`,
    type: 'data',
    metadata
  })
}

/**
 * Metric/Analytics toast
 */
export function metricToast(
  metricName: string,
  value: string | number,
  trend?: 'up' | 'down' | 'neutral'
) {
  const trendEmoji = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '📊'

  return enhancedToast({
    title: metricName,
    description: `${trendEmoji} ${value}`,
    type: 'metric'
  })
}

/**
 * Loading toast with promise
 */
export function loadingToast(
  promise: Promise<any>,
  messages: {
    loading: string
    success: string
    error: string
  },
  metadata?: EnhancedToastData['metadata']
) {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    duration: 4000
  })
}

/**
 * Action toast with undo capability
 */
export function actionToast(
  actionName: string,
  description: string,
  onUndo?: () => void,
  metadata?: EnhancedToastData['metadata']
) {
  return enhancedToast({
    title: actionName,
    description,
    type: 'action',
    metadata,
    action: onUndo ? {
      label: 'Undo',
      onClick: onUndo
    } : undefined
  })
}

// Export all toast utilities
export const toast = {
  enhanced: enhancedToast,
  success: successToast,
  error: errorToast,
  copy: copyToast,
  file: fileToast,
  data: dataToast,
  metric: metricToast,
  loading: loadingToast,
  action: actionToast,

  // Direct access to sonner toast
  ...sonnerToast
}

export default toast
