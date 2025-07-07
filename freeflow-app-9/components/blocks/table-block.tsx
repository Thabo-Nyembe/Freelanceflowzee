'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TableBlockProps {
  id: string
  content: string[][]
  properties: {
    alignment: 'left' | 'center' | 'right'
    columns: string[]
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

export function TableBlock({
  id,
  content,
  properties,
  onUpdate,
  isSelected
}: TableBlockProps) {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null)

  const addColumn = () => {
    const newColumns = [...properties.columns, `Column ${properties.columns.length + 1}`]
    const newContent = content.map(row => [...row, ''])
    onUpdate?.(id, {
      content: newContent,
      properties: { ...properties, columns: newColumns }
    })
  }

  const addRow = () => {
    const newRow = Array(properties.columns.length).fill('')
    onUpdate?.(id, {
      content: [...content, newRow]
    })
  }

  const removeColumn = (colIndex: number) => {
    const newColumns = properties.columns.filter((_, i) => i !== colIndex)
    const newContent = content.map(row => row.filter((_, i) => i !== colIndex))
    onUpdate?.(id, {
      content: newContent,
      properties: { ...properties, columns: newColumns }
    })
  }

  const removeRow = (rowIndex: number) => {
    const newContent = content.filter((_, i) => i !== rowIndex)
    onUpdate?.(id, {
      content: newContent
    })
  }

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newContent = [...content]
    newContent[rowIndex] = [...newContent[rowIndex]]
    newContent[rowIndex][colIndex] = value
    onUpdate?.(id, { content: newContent })
  }

  const updateColumnHeader = (colIndex: number, value: string) => {
    const newColumns = [...properties.columns]
    newColumns[colIndex] = value
    onUpdate?.(id, {
      properties: { ...properties, columns: newColumns }
    })
  }

  return (
    <div className={cn('space-y-4', {
      'text-left': properties.alignment === 'left',
      'text-center': properties.alignment === 'center',
      'text-right': properties.alignment === 'right'
    })}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {properties.columns.map((column, colIndex) => (
                <th
                  key={colIndex}
                  className="border p-2 relative"
                  onMouseEnter={() => setHoveredCell([-1, colIndex])}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  <Input
                    value={column}
                    onChange={(e) => updateColumnHeader(colIndex, e.target.value)}
                    className="w-full border-none focus:ring-0 font-bold"
                    placeholder={`Column ${colIndex + 1}`}
                  />
                  {hoveredCell?.[1] === colIndex && hoveredCell[0] === -1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={() => removeColumn(colIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="border p-2 relative"
                    onMouseEnter={() => setHoveredCell([rowIndex, colIndex])}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="w-full border-none focus:ring-0"
                      placeholder="Enter value..."
                    />
                    {hoveredCell?.[0] === rowIndex && hoveredCell[1] === colIndex && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={addColumn}
        >
          <Plus className="w-4 h-4" />
          Add Column
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={addRow}
        >
          <Plus className="w-4 h-4" />
          Add Row
        </Button>
      </div>
    </div>
  )
} 