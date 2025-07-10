import { ContentBlock, BlockTemplate, DatabaseSource } from '@/lib/types/editor'

export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function createBlock(type: ContentBlock['type'], content: unknown = null): ContentBlock {
  return {
    id: generateBlockId(),
    type,
    content,
    position: 0,
    properties: {
      alignment: 'left',
      fontSize: 'normal'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '' // Will be set when adding to editor
  }
}

export function calculateWordCount(blocks: ContentBlock[]): number {
  return blocks.reduce((count, block) => {
    if (typeof block.content === 'string') {
      return count + block.content.trim().split(/\s+/).length
    }
    return count
  }, 0)
}

export function validateBlock(block: ContentBlock): boolean {
  if (!block.id || !block.type) return false
  
  switch (block.type) {
    case 'heading':
      return typeof block.content === 'string' && 
             typeof block.properties.level === 'number' &&
             [1, 2, 3].includes(block.properties.level)
    
    case 'text':
      return typeof block.content === 'string'
    
    case 'checklist':
      return Array.isArray(block.content) &&
             Array.isArray(block.properties.checked) &&
             block.content.length === block.properties.checked.length
    
    case 'image':
    case 'video':
    case 'file':
      return typeof block.properties.url === 'string'
    
    case 'table':
      return Array.isArray(block.content) &&
             Array.isArray(block.properties.columns)
    
    case 'database':
      return typeof block.content === 'object' &&
             block.content !== null
    
    default:
      return true
  }
}

export function serializeBlocks(blocks: ContentBlock[]): string {
  return JSON.stringify(blocks.map(block => ({
    ...block,
    content: block.type === 'image' || block.type === 'video' || block.type === 'file'
      ? null // Don't serialize binary data
      : block.content
  })))
}

export function deserializeBlocks(data: string): ContentBlock[] {
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function findBlockById(blocks: ContentBlock[], id: string): ContentBlock | undefined {
  return blocks.find(block => block.id === id)
}

export function updateBlockContent(blocks: ContentBlock[], blockId: string, content: unknown): ContentBlock[] {
  return blocks.map(block =>
    block.id === blockId
      ? { ...block, content, updatedAt: new Date().toISOString() }
      : block
  )
}

export function moveBlock(blocks: ContentBlock[], fromIndex: number, toIndex: number): ContentBlock[] {
  const newBlocks = [...blocks]
  const [movedBlock] = newBlocks.splice(fromIndex, 1)
  newBlocks.splice(toIndex, 0, movedBlock)
  return newBlocks.map((block, index) => ({
    ...block,
    position: index
  }))
}

export function validateDatabaseConnection(source: DatabaseSource): Promise<boolean> {
  // In a real implementation, this would test the database connection
  return new Promise(resolve => {
    setTimeout(() => resolve(true), 1000)
  })
}

export const defaultTemplates: BlockTemplate[] = [
  {
    id: 'template-1',
    name: 'Basic Article',
    description: 'A simple article template with heading and text blocks',
    blocks: [
      {
        id: 'heading-1',
        type: 'heading',
        content: 'Article Title',
        position: 0,
        properties: {
          alignment: 'left',
          fontSize: 'xl',
          level: 1
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'system'
      },
      {
        id: 'text-1',
        type: 'text',
        content: 'Start writing your article here...',
        position: 1,
        properties: {
          alignment: 'left',
          fontSize: 'normal'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'system'
      }
    ],
    category: 'Content',
    tags: ['article', 'blog', 'writing'],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const defaultDatabases: DatabaseSource[] = [
  {
    id: 'database-1',
    name: 'Project Database',
    description: 'Main project information database',
    type: 'supabase',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'freeflowzee',
      schema: 'public',
      table: 'projects'
    },
    fields: [
      { name: 'id', type: 'uuid', isRequired: true },
      { name: 'name', type: 'text', isRequired: true },
      { name: 'description', type: 'text', isRequired: false },
      { name: 'status', type: 'text', isRequired: true },
      { name: 'created_at', type: 'timestamp', isRequired: true }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
] 