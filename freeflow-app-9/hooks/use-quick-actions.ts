/**
 * @file useQuickActions Hook
 * @description React hook for performing quick actions throughout the app
 */

import { useState } from 'react'
import { toast } from 'sonner'

export type QuickActionType =
  | 'create-project'
  | 'create-folder'
  | 'send-message'
  | 'create-task'
  | 'bookmark-item'
  | 'share-file'
  | 'export-data'
  | 'generate-invoice'
  | 'schedule-meeting'
  | 'quick-note'

interface QuickActionOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  showToast?: boolean
}

export function useQuickActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const performAction = async (
    action: QuickActionType,
    data: Record<string, any>,
    options: QuickActionOptions = {}
  ) => {
    const { onSuccess, onError, showToast = true } = options

    setIsLoading(true)
    setLastResult(null)

    try {
      const response = await fetch('/api/quick-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Action failed')
      }

      const result = await response.json()
      setLastResult(result)

      if (showToast && result.success) {
        toast.success(result.message)
      }

      if (onSuccess) {
        onSuccess(result.result)
      }

      return result
    } catch (error: any) {
      console.error('Quick action error:', error)

      if (showToast) {
        toast.error(error.message || 'Action failed')
      }

      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Convenience methods for specific actions
  const createProject = (data: {
    title: string
    description?: string
    client?: string
    budget?: number
    endDate?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
  }, options?: QuickActionOptions) => {
    return performAction('create-project', data, options)
  }

  const createFolder = (data: {
    name: string
    parent?: string
    color?: string
  }, options?: QuickActionOptions) => {
    return performAction('create-folder', data, options)
  }

  const sendMessage = (data: {
    to: string
    body: string
    subject?: string
    priority?: 'low' | 'normal' | 'high'
  }, options?: QuickActionOptions) => {
    return performAction('send-message', data, options)
  }

  const createTask = (data: {
    title: string
    description?: string
    project?: string
    assignee?: string
    priority?: 'low' | 'medium' | 'high'
    dueDate?: string
  }, options?: QuickActionOptions) => {
    return performAction('create-task', data, options)
  }

  const bookmarkItem = (data: {
    itemId: string
    itemType: string
    title: string
    url?: string
    tags?: string[]
  }, options?: QuickActionOptions) => {
    return performAction('bookmark-item', data, options)
  }

  const shareFile = (data: {
    fileId: string
    fileName: string
    sharedWith?: string[]
    permissions?: 'view' | 'edit' | 'admin'
    expiresAt?: string
    password?: string
  }, options?: QuickActionOptions) => {
    return performAction('share-file', data, options)
  }

  const exportData = (data: {
    type: string
    format?: 'csv' | 'pdf' | 'excel'
    dateRange?: string
    filters?: Record<string, any>
  }, options?: QuickActionOptions) => {
    return performAction('export-data', data, options)
  }

  const generateInvoice = (data: {
    client: string
    items: any[]
    total: number
    project?: string
    dueDate?: string
    tax?: number
  }, options?: QuickActionOptions) => {
    return performAction('generate-invoice', data, options)
  }

  const scheduleMeeting = (data: {
    title: string
    startTime: string
    description?: string
    duration?: number
    participants?: string[]
    location?: string
  }, options?: QuickActionOptions) => {
    return performAction('schedule-meeting', data, options)
  }

  const createQuickNote = (data: {
    content: string
    title?: string
    tags?: string[]
    project?: string
    isPinned?: boolean
    color?: string
  }, options?: QuickActionOptions) => {
    return performAction('quick-note', data, options)
  }

  return {
    isLoading,
    lastResult,
    performAction,
    // Convenience methods
    createProject,
    createFolder,
    sendMessage,
    createTask,
    bookmarkItem,
    shareFile,
    exportData,
    generateInvoice,
    scheduleMeeting,
    createQuickNote
  }
}
