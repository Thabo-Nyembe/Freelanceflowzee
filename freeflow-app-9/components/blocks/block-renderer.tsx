'use client'

import React from 'react'
import { ContentBlock } from '@/lib/types/editor'
import { TextBlock } from './text-block'
import { HeadingBlock } from './heading-block'
import { ChecklistBlock } from './checklist-block'
import { ImageBlock } from './image-block'
import { TableBlock } from './table-block'
import { ListBlock } from './list-block'
import { QuoteBlock } from './quote-block'
import { CodeBlock } from './code-block'
import { DatabaseBlock } from './database-block'
import { FileBlock } from './file-block'
import { VideoBlock } from './video-block'

interface BlockRendererProps {
  block: ContentBlock
  onUpdate?: (id: string, updates: Partial<ContentBlock>) => void
  isSelected?: boolean
}

export function BlockRenderer({
  block,
  onUpdate,
  isSelected
}: BlockRendererProps) {
  const commonProps = {
    id: block.id,
    content: block.content,
    properties: block.properties,
    onUpdate,
    isSelected
  }

  switch (block.type) {
    case 'text':
      return <TextBlock {...commonProps} />
    
    case 'heading':
      return <HeadingBlock {...commonProps} />
    
    case 'checklist':
      return <ChecklistBlock {...commonProps} />
    
    case 'image':
      return <ImageBlock {...commonProps} />
    
    case 'table':
      return <TableBlock {...commonProps} />
    
    case 'list':
      return <ListBlock {...commonProps} />
    
    case 'quote':
      return <QuoteBlock {...commonProps} />
    
    case 'code':
      return <CodeBlock {...commonProps} />
    
    case 'database':
      return <DatabaseBlock {...commonProps} />
    
    case 'file':
      return <FileBlock {...commonProps} />
    
    case 'video':
      return <VideoBlock {...commonProps} />
    
    default:
      return <div>Unsupported block type: {block.type}</div>
  }
} 