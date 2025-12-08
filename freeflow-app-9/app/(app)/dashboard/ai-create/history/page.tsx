"use client"

import { Card } from '@/components/ui/card'
import { Clock, Download, Copy, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AI-Create-History')

const HISTORY_ITEMS = [
  {
    id: 1,
    type: 'Creative Asset',
    title: 'Cinematic LUT for Sunset Scene',
    model: 'Cinematika 7B (Free)',
    timestamp: '2 hours ago',
    tokens: 1245,
    cost: 0
  },
  {
    id: 2,
    type: 'Code Generation',
    title: 'React Authentication Component',
    model: 'Phi-3 Mini (Free)',
    timestamp: '5 hours ago',
    tokens: 3420,
    cost: 0
  },
  {
    id: 3,
    type: 'Content Writing',
    title: 'Blog Post: AI in Modern Development',
    model: 'Mistral 7B (Free)',
    timestamp: '1 day ago',
    tokens: 2890,
    cost: 0
  },
  {
    id: 4,
    type: 'Image Generation',
    title: 'Product Mockup - Mobile App',
    model: 'DALL-E 3',
    timestamp: '2 days ago',
    tokens: 0,
    cost: 0.08
  },
  {
    id: 5,
    type: 'Code Analysis',
    title: 'TypeScript Refactoring Suggestions',
    model: 'Claude 3.5 Sonnet',
    timestamp: '3 days ago',
    tokens: 4520,
    cost: 0.09
  }
]

export default function HistoryPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

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
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">Export All</Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {HISTORY_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge
                    className={
                      item.cost === 0
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-500 text-white'
                    }
                  >
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
                <Button size="sm" variant="ghost" title="Copy">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" title="Download">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" title="Delete">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing 5 of 127 generations
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
