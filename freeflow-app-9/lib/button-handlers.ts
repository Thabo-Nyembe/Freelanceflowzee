/**
 * Real Button Handlers
 * Utilities for common button actions with real functionality
 */

import { toast } from 'sonner'

// ============================================================================
// CLIPBOARD OPERATIONS
// ============================================================================

/**
 * Copy text to clipboard with toast feedback
 */
export async function copyToClipboard(text: string, successMessage = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(successMessage)
    return true
  } catch (error) {
    toast.error('Failed to copy to clipboard')
    console.error('Clipboard error:', error)
    return false
  }
}

/**
 * Copy with custom messages
 */
export function createCopyHandler(getText: () => string, successMessage?: string) {
  return async () => {
    const text = getText()
    await copyToClipboard(text, successMessage)
  }
}

// ============================================================================
// DOWNLOAD OPERATIONS
// ============================================================================

/**
 * Download a file from URL
 */
export async function downloadFile(url: string, filename: string) {
  try {
    toast.loading('Preparing download...')
    const response = await fetch(url)
    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(downloadUrl)

    toast.dismiss()
    toast.success('Download complete')
    return true
  } catch (error) {
    toast.dismiss()
    toast.error('Download failed')
    console.error('Download error:', error)
    return false
  }
}

/**
 * Download data as JSON file
 */
export function downloadAsJson(data: unknown, filename: string) {
  try {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.json') ? filename : `${filename}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Download complete')
    return true
  } catch (error) {
    toast.error('Download failed')
    console.error('Download error:', error)
    return false
  }
}

/**
 * Download data as CSV file
 */
export function downloadAsCsv(data: Record<string, unknown>[], filename: string) {
  try {
    if (!data.length) {
      toast.error('No data to export')
      return false
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Export complete')
    return true
  } catch (error) {
    toast.error('Export failed')
    console.error('Export error:', error)
    return false
  }
}

// ============================================================================
// SHARE OPERATIONS
// ============================================================================

/**
 * Share content using Web Share API or copy link
 */
export async function shareContent(options: { title: string; text?: string; url: string }) {
  try {
    if (navigator.share) {
      await navigator.share(options)
      toast.success('Shared successfully')
    } else {
      await copyToClipboard(options.url, 'Link copied to clipboard')
    }
    return true
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      toast.error('Failed to share')
      console.error('Share error:', error)
    }
    return false
  }
}

// ============================================================================
// VIEW MODE OPERATIONS
// ============================================================================

/**
 * Toggle between grid and list view
 */
export function createViewToggle(
  currentView: 'grid' | 'list',
  setView: (view: 'grid' | 'list') => void
) {
  return {
    setGrid: () => {
      setView('grid')
      toast.success('Grid view enabled')
    },
    setList: () => {
      setView('list')
      toast.success('List view enabled')
    },
    toggle: () => {
      const newView = currentView === 'grid' ? 'list' : 'grid'
      setView(newView)
      toast.success(`${newView === 'grid' ? 'Grid' : 'List'} view enabled`)
    }
  }
}

// ============================================================================
// FULLSCREEN OPERATIONS
// ============================================================================

/**
 * Toggle fullscreen mode
 */
export async function toggleFullscreen(element?: HTMLElement) {
  try {
    const target = element || document.documentElement
    if (!document.fullscreenElement) {
      await target.requestFullscreen()
      toast.success('Fullscreen mode enabled')
    } else {
      await document.exitFullscreen()
      toast.success('Fullscreen mode disabled')
    }
    return true
  } catch (error) {
    toast.error('Fullscreen not supported')
    console.error('Fullscreen error:', error)
    return false
  }
}

// ============================================================================
// PRINT OPERATIONS
// ============================================================================

/**
 * Print current page or element
 */
export function printContent() {
  window.print()
  toast.success('Print dialog opened')
}

// ============================================================================
// REFRESH OPERATIONS
// ============================================================================

/**
 * Refresh data with toast feedback
 */
export async function refreshData(fetchFn: () => Promise<void>, message = 'Data refreshed') {
  try {
    toast.loading('Refreshing...')
    await fetchFn()
    toast.dismiss()
    toast.success(message)
    return true
  } catch (error) {
    toast.dismiss()
    toast.error('Refresh failed')
    console.error('Refresh error:', error)
    return false
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete with confirmation
 */
export async function deleteWithConfirmation(
  deleteFn: () => Promise<void>,
  options: { itemName?: string; onSuccess?: () => void } = {}
) {
  const { itemName = 'item', onSuccess } = options

  if (!confirm(`Are you sure you want to delete this ${itemName}? This action cannot be undone.`)) {
    return false
  }

  try {
    toast.loading(`Deleting ${itemName}...`)
    await deleteFn()
    toast.dismiss()
    toast.success(`${itemName} deleted successfully`)
    onSuccess?.()
    return true
  } catch (error) {
    toast.dismiss()
    toast.error(`Failed to delete ${itemName}`)
    console.error('Delete error:', error)
    return false
  }
}

// ============================================================================
// API OPERATIONS
// ============================================================================

/**
 * Generic API call with toast feedback
 */
export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  messages: { loading?: string; success?: string; error?: string } = {}
) {
  const { loading = 'Processing...', success = 'Done!', error = 'Operation failed' } = messages

  try {
    toast.loading(loading)
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json() as T
    toast.dismiss()
    toast.success(success)
    return { success: true, data }
  } catch (err) {
    toast.dismiss()
    toast.error(error)
    console.error('API error:', err)
    return { success: false, error: err }
  }
}

/**
 * POST request helper
 */
export function apiPost<T>(url: string, body: unknown, messages?: { loading?: string; success?: string; error?: string }) {
  return apiCall<T>(url, { method: 'POST', body: JSON.stringify(body) }, messages)
}

/**
 * PUT request helper
 */
export function apiPut<T>(url: string, body: unknown, messages?: { loading?: string; success?: string; error?: string }) {
  return apiCall<T>(url, { method: 'PUT', body: JSON.stringify(body) }, messages)
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(url: string, messages?: { loading?: string; success?: string; error?: string }) {
  return apiCall<T>(url, { method: 'DELETE' }, messages)
}
