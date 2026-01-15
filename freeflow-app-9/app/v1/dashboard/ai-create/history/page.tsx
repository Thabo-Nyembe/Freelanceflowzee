"use client"

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Clock, Download, Copy, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { getGenerations, deleteGeneration } from '@/lib/ai-create-queries'

const logger = createFeatureLogger('AI-Create-History')

interface HistoryItem {
  id: string | number
  type: string
  title: string
  model: string
  timestamp: string
  tokens: number
  cost: number
  content?: string
}

const INITIAL_HISTORY: HistoryItem[] = [
  { id: 1, type: 'Creative Asset', title: 'Cinematic LUT for Sunset Scene', model: 'Cinematika 7B (Free)', timestamp: '2 hours ago', tokens: 1245, cost: 0, content: 'Generated cinematic color grading preset with warm tones and enhanced shadows for sunset scenes.' },
  { id: 2, type: 'Code Generation', title: 'React Authentication Component', model: 'Phi-3 Mini (Free)', timestamp: '5 hours ago', tokens: 3420, cost: 0, content: 'TypeScript React component with JWT authentication, login form, and protected routes.' },
  { id: 3, type: 'Content Writing', title: 'Blog Post: AI in Modern Development', model: 'Mistral 7B (Free)', timestamp: '1 day ago', tokens: 2890, cost: 0, content: 'Comprehensive blog post exploring how AI is transforming software development practices.' },
  { id: 4, type: 'Image Generation', title: 'Product Mockup - Mobile App', model: 'DALL-E 3', timestamp: '2 days ago', tokens: 0, cost: 0.08, content: 'High-quality product mockup showing mobile app interface on iPhone 15 Pro.' },
  { id: 5, type: 'Code Analysis', title: 'TypeScript Refactoring Suggestions', model: 'Claude 3.5 Sonnet', timestamp: '3 days ago', tokens: 4520, cost: 0.09, content: 'Detailed analysis with 12 refactoring suggestions for improved type safety and performance.' }
]

export default function HistoryPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteItem, setDeleteItem] = useState<HistoryItem | null>(null)
  const itemsPerPage = 5
  const totalItems = 127

  // Load history from database
  const loadHistory = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const { data, error } = await getGenerations(userId, { limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage })
      if (data && data.length > 0) {
        setHistory(data.map(g => ({
          id: g.id,
          type: g.asset_type || 'Generation',
          title: g.custom_prompt?.substring(0, 50) || 'AI Generation',
          model: g.model_used,
          timestamp: new Date(g.created_at).toLocaleDateString(),
          tokens: 0,
          cost: 0,
          content: g.custom_prompt
        })))
      }
      logger.info('History loaded', { count: data?.length || 0 })
    } catch (error) {
      logger.error('Failed to load history', { error })
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentPage])

  // Refresh history from database
  const handleRefresh = useCallback(async () => {
    if (!userId) {
      toast.error('Please log in to refresh history')
      return
    }

    setIsLoading(true)
    try {
      // Load from database
      const { data, error } = await getGenerations(userId, { limit: itemsPerPage, offset: 0 })

      if (error) throw error

      if (data && data.length > 0) {
        setHistory(data.map(g => ({
          id: g.id,
          type: g.asset_type || 'Generation',
          title: g.custom_prompt?.substring(0, 50) || 'AI Generation',
          model: g.model_used,
          timestamp: new Date(g.created_at).toLocaleDateString(),
          tokens: 0,
          cost: 0,
          content: g.custom_prompt
        })))
      }

      toast.success('History Refreshed')
      logger.info('History refreshed from database', { count: data?.length || 0 })
      announce('History refreshed', 'polite')
    } catch (error) {
      logger.error('Failed to refresh history', { error })
      toast.error('Failed to refresh history')
    } finally {
      setIsLoading(false)
    }
  }, [userId, announce])

  // Export all history
  const handleExportAll = useCallback(() => {
    const exportData = {
      history: history,
      exportedAt: new Date().toISOString(),
      totalItems: history.length
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-create-history-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('History Exported', { description: `Exported ${history.length} items` })
    logger.info('History exported', { count: history.length })
  }, [history])

  // Copy item content
  const handleCopy = useCallback((item: HistoryItem) => {
    const content = item.content || `${item.title}\n\nModel: ${item.model}\nType: ${item.type}\nTokens: ${item.tokens}`
    navigator.clipboard.writeText(content)
    toast.success('Copied to Clipboard', { description: item.title })
    logger.info('History item copied', { id: item.id })
  }, [])

  // Download single item
  const handleDownload = useCallback((item: HistoryItem) => {
    const content = {
      ...item,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generation-${item.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded', { description: item.title })
    logger.info('History item downloaded', { id: item.id })
  }, [])

  // Delete item
  const handleDelete = useCallback(async () => {
    if (!deleteItem) return
    try {
      // Try to delete from database
      if (userId && typeof deleteItem.id === 'string') {
        await deleteGeneration(deleteItem.id)
      }
      setHistory(prev => prev.filter(h => h.id !== deleteItem.id))
      toast.success('Deleted', { description: deleteItem.title })
      logger.info('History item deleted', { id: deleteItem.id })
      announce('Item deleted', 'polite')
    } catch (error) {
      logger.error('Delete failed', { error })
      toast.error('Failed to delete')
    } finally {
      setDeleteItem(null)
    }
  }, [deleteItem, userId, announce])

  // Pagination
  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
      logger.info('Page changed', { page: currentPage - 1 })
    }
  }, [currentPage])

  const handleNext = useCallback(() => {
    const maxPages = Math.ceil(totalItems / itemsPerPage)
    if (currentPage < maxPages) {
      setCurrentPage(prev => prev + 1)
      logger.info('Page changed', { page: currentPage + 1 })
    }
  }, [currentPage, totalItems])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generation History</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your past AI generations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading} aria-label="Refresh">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportAll}>Export All</Button>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge className={item.cost === 0 ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'}>
                      {item.cost === 0 ? 'FREE' : `$${item.cost.toFixed(2)}`}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </span>
                    <span>{item.model}</span>
                    {item.tokens > 0 && <span>{item.tokens.toLocaleString()} tokens</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" title="Copy" onClick={() => handleCopy(item)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" title="Download" onClick={() => handleDownload(item)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" title="Delete" onClick={() => setDeleteItem(item)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} generations
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage * itemsPerPage >= totalItems}>
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Generation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteItem?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
