'use client'

import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  id: string
  content: string
  properties: {
    alignment: 'left' | 'center' | 'right'
    language?: string
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'shell', label: 'Shell' },
  { value: 'dockerfile', label: 'Dockerfile' }
]

export function CodeBlock({
  id, content, properties, onUpdate, isSelected
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState<any>(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className={cn('space-y-2', {
      'text-left': properties.alignment === 'left',
      'text-center': properties.alignment === 'center',
      'text-right': properties.alignment === 'right'
    })}>
      <div className="flex items-center justify-between">
        <Select
          value={properties.language || 'javascript'}
          onValueChange={(value) =>
            onUpdate?.(id, {
              properties: { ...properties, language: value }
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-8 w-8"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="relative">
        {isSelected ? (
          <Textarea
            value={content}
            onChange={(e) => onUpdate?.(id, { content: e.target.value })}
            className="w-full min-h-[200px] font-mono text-sm"
            placeholder="Enter code..."
          />
        ) : (
          <div className="relative rounded-md overflow-hidden">
            <SyntaxHighlighter
              language={properties.language || 'javascript'}
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}
            >
              {content || '// Enter code...'}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  )
} 