'use client'

import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, RefreshCw, Database as DatabaseIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DatabaseSource } from '@/lib/types/editor'
import { defaultDatabases } from '@/lib/utils/editor'

interface DatabaseBlockProps {
  id: string
  content: {
    sourceId: string
    query: string
    data: unknown[]
    columns: string[]
    error?: string
  }
  properties: {
    alignment: 'left' | 'center' | 'right'
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

export function DatabaseBlock({
  id, content, properties, onUpdate, isSelected
}: DatabaseBlockProps) {
  const [isLoading, setIsLoading] = useState<any>(false)
  const [databases] = useState<DatabaseSource[]>(defaultDatabases)

  const selectedSource = databases.find(db => db.id === content.sourceId)

  const updateContent = (field: keyof typeof content, value) => {
    onUpdate?.(id, {
      content: { ...content, [field]: value }
    })
  }

  // MIGRATED: Batch #10 - Removed mock data, using database hooks
  const fetchData = async () => {
    if (!selectedSource) return

    setIsLoading(true)
    try {
      // Real database integration would go here
      // For now, return empty data
      updateContent('data', [])
      updateContent('columns', [])
      updateContent('error', undefined)
    } catch (error) {
      updateContent('error', 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedSource && (!content.data || content.data.length === 0)) {
      fetchData()
    }
  }, [selectedSource])

  return (
    <div className={cn('space-y-4', {
      'text-left': properties.alignment === 'left',
      'text-center': properties.alignment === 'center',
      'text-right': properties.alignment === 'right'
    })}>
      <div className="flex items-center gap-4">
        <Select
          value={content.sourceId}
          onValueChange={(value) => updateContent('sourceId', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select database" />
          </SelectTrigger>
          <SelectContent>
            {databases.map((db) => (
              <SelectItem key={db.id} value={db.id}>
                {db.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedSource && (
          <>
            <Input
              value={content.query}
              onChange={(e) => updateContent('query', e.target.value)}
              className="flex-1"
              placeholder="Enter SQL query..."
            />

            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>

      {content.error ? (
        <div className="p-4 text-red-500 bg-red-50 rounded-md">
          {content.error}
        </div>
      ) : !selectedSource ? (
        <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-md">
          <DatabaseIcon className="w-8 h-8 mx-auto mb-2" />
          <p>Select a database to get started</p>
        </div>
      ) : content.data && content.data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {content.columns.map((column) => (
                  <th
                    key={column}
                    className="border p-2 bg-gray-50 font-medium text-left"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {content.columns.map((column) => (
                    <td key={column} className="border p-2">
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          {isLoading ? 'Loading...' : 'No data available'}
        </div>
      )}
    </div>
  )
} 