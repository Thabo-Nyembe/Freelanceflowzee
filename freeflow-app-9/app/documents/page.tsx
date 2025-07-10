'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import { BlockWrapper } from '@/components/blocks/block-wrapper'
import { ChecklistBlock } from '@/components/blocks/checklist-block'
import { CodeBlock } from '@/components/blocks/code-block'
import { DatabaseBlock } from '@/components/blocks/database-block'
import { FileBlock } from '@/components/blocks/file-block'
import { HeadingBlock } from '@/components/blocks/heading-block'
import { ImageBlock } from '@/components/blocks/image-block'
import { ListBlock } from '@/components/blocks/list-block'
import { QuoteBlock } from '@/components/blocks/quote-block'
import { TableBlock } from '@/components/blocks/table-block'
import { TextBlock } from '@/components/blocks/text-block'
import { VideoBlock } from '@/components/blocks/video-block'

const INITIAL_BLOCKS = [
  {
    id: 'heading-1',
    type: 'heading',
    content: 'Welcome to the Document Editor',
    level: 1
  },
  {
    id: 'text-1',
    type: 'text',
    content: 'This is a collaborative document editor with real-time editing and AI assistance.'
  },
  {
    id: 'checklist-1',
    type: 'checklist',
    items: [
      { id: 'check-1', text: 'Create a new document', checked: true },
      { id: 'check-2', text: 'Add different block types', checked: false },
      { id: 'check-3', text: 'Collaborate with team members', checked: false }
    ]
  }
]

export default function DocumentsPage() {
  const [blocks, setBlocks] = useState<any>(INITIAL_BLOCKS)

  const handleBlockUpdate = (blockId: string, newContent: unknown) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, ...newContent } : block
    ))
  }

  const handleBlockAdd = (type: string, index: number) => {
    const newBlock = {
      id: `${type}-${Date.now()}`,
      type,
      content: ''
    }
    
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
  }

  const handleBlockDelete = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId))
  }

  const handleBlockMove = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks]
    const [movedBlock] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, movedBlock)
    setBlocks(newBlocks)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Document Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <BlockWrapper
                key={block.id}
                block={block}
                index={index}
                onMove={handleBlockMove}
                onDelete={() => handleBlockDelete(block.id)}
                onAdd={handleBlockAdd}
              >
                <BlockRenderer
                  block={block}
                  onChange={(newContent) => handleBlockUpdate(block.id, newContent)}
                  components={{
                    checklist: ChecklistBlock,
                    code: CodeBlock,
                    database: DatabaseBlock,
                    file: FileBlock,
                    heading: HeadingBlock,
                    image: ImageBlock,
                    list: ListBlock,
                    quote: QuoteBlock,
                    table: TableBlock,
                    text: TextBlock,
                    video: VideoBlock
                  }}
                />
              </BlockWrapper>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 