/**
 * AI-Enhanced Input Component
 *
 * Production-ready input component with integrated AI suggestions.
 * Can be used in Messages, AI Create, Forms, and anywhere users write content.
 *
 * FEATURES:
 * - Real-time AI suggestions as you type
 * - Content type awareness (email, message, etc.)
 * - Tone selection
 * - One-click content generation
 * - Smart auto-completion
 *
 * USAGE:
 * ```tsx
 * <AIEnhancedInput
 *   value={text}
 *   onChange={setText}
 *   contentType="message"
 *   placeholder="Type your message..."
 *   onSend={(content) => handleSend(content)}
 * />
 * ```
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Sparkles, Send, Loader2, Wand2, ChevronDown, ChevronUp,
  Check, X, Copy
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useAISuggestions,
  useContentGeneration,
  type ContentType,
  type ToneType,
  enhanceText
} from '@/lib/ai-suggestions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('AIEnhancedInput')

// ==================== TYPES ====================

export interface AIEnhancedInputProps {
  value: string
  onChange: (value: string) => void
  onSend?: (content: string) => void
  contentType?: ContentType
  placeholder?: string
  minRows?: number
  maxRows?: number
  showSuggestions?: boolean
  showGenerate?: boolean
  showEnhance?: boolean
  className?: string
  disabled?: boolean
  autoFocus?: boolean
}

// ==================== COMPONENT ====================

export function AIEnhancedInput({
  value,
  onChange,
  onSend,
  contentType = 'message',
  placeholder = 'Type something...',
  minRows = 3,
  maxRows = 10,
  showSuggestions = true,
  showGenerate = true,
  showEnhance = true,
  className = '',
  disabled = false,
  autoFocus = false
}: AIEnhancedInputProps) {
  const [tone, setTone] = useState<ToneType>('professional')
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(true)
  const [showAITools, setShowAITools] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // AI Suggestions
  const { suggestions, getSuggestions, clearSuggestions, isLoading: suggestionsLoading } =
    useAISuggestions(contentType, 800)

  // Content Generation
  const { generate, isGenerating, generatedContent, reset } = useContentGeneration()

  // Handle input change
  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue)

      if (showSuggestions && newValue.length > 10) {
        getSuggestions(newValue, '', contentType)
      } else {
        clearSuggestions()
      }
    },
    [onChange, getSuggestions, clearSuggestions, showSuggestions, contentType]
  )

  // Apply suggestion
  const applySuggestion = useCallback(
    (suggestionText: string) => {
      const newValue = value + ' ' + suggestionText
      onChange(newValue)
      clearSuggestions()
      toast.success('Suggestion applied!')
      logger.info('Suggestion applied', { suggestionText })
    },
    [value, onChange, clearSuggestions]
  )

  // Generate content
  const handleGenerate = useCallback(async () => {
    if (!value.trim()) {
      toast.error('Please enter a prompt first')
      return
    }

    try {
      const result = await generate(value, contentType, {
        tone,
        fixGrammar: true,
        clarity: 'high'
      })

      onChange(result.content)
      toast.success('Content generated!')
      logger.info('Content generated', { contentType, tone })
    } catch (error) {
      toast.error('Failed to generate content')
      logger.error('Content generation failed', { error })
    }
  }, [value, contentType, tone, generate, onChange])

  // Enhance existing text
  const handleEnhance = useCallback(() => {
    if (!value.trim()) {
      toast.error('Please enter some text first')
      return
    }

    try {
      const enhanced = enhanceText(value, {
        tone,
        fixGrammar: true,
        clarity: 'high'
      })

      onChange(enhanced)
      toast.success('Text enhanced!')
      logger.info('Text enhanced', { tone, originalLength: value.length })
    } catch (error) {
      toast.error('Failed to enhance text')
      logger.error('Text enhancement failed', { error })
    }
  }, [value, tone, onChange])

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard!')
  }, [value])

  // Send
  const handleSend = useCallback(() => {
    if (!value.trim()) {
      toast.error('Please enter some content')
      return
    }

    if (onSend) {
      onSend(value)
      onChange('')
      clearSuggestions()
      reset()
    }
  }, [value, onSend, onChange, clearSuggestions, reset])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to send
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSend) {
        e.preventDefault()
        handleSend()
      }

      // Cmd/Ctrl + K to toggle AI tools
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowAITools(prev => !prev)
      }
    }

    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown)
      return () => textarea.removeEventListener('keydown', handleKeyDown)
    }
  }, [onSend, handleSend])

  return (
    <div className={`space-y-2 ${className}`}>
      {/* AI Tools Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAITools(!showAITools)}
          className="text-xs"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          AI Tools
          {showAITools ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>

        {value.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {value.length} characters
          </span>
        )}
      </div>

      {/* AI Tools Panel */}
      {showAITools && (
        <Card className="p-3 space-y-3 bg-muted/50">
          <div className="grid grid-cols-2 gap-3">
            {/* Tone Selection */}
            <div className="space-y-1">
              <Label className="text-xs">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as ToneType)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Type (read-only display) */}
            <div className="space-y-1">
              <Label className="text-xs">Content Type</Label>
              <div className="h-8 px-3 py-1 bg-background border rounded-md flex items-center">
                <span className="text-xs capitalize">{contentType}</span>
              </div>
            </div>
          </div>

          {/* AI Actions */}
          <div className="flex gap-2">
            {showGenerate && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating || disabled || !value.trim()}
                className="flex-1 h-8 text-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 mr-1" />
                    Generate
                  </>
                )}
              </Button>
            )}

            {showEnhance && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnhance}
                disabled={disabled || !value.trim()}
                className="flex-1 h-8 text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Enhance
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              disabled={disabled || !value.trim()}
              className="h-8 text-xs"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </Card>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="min-h-[100px] resize-none"
          rows={minRows}
        />

        {/* Loading indicator */}
        {suggestionsLoading && (
          <div className="absolute bottom-2 right-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && showSuggestionsPanel && (
        <Card className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">AI Suggestions</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestionsPanel(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-1.5">
            {suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => applySuggestion(suggestion.text)}
                disabled={disabled}
                className="w-full p-2 text-left bg-muted hover:bg-muted/80 rounded-md transition-colors text-sm group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex-1 text-sm">{suggestion.text}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                    <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {suggestion.type}
                </p>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearSuggestions}
            className="w-full text-xs"
          >
            Clear suggestions
          </Button>
        </Card>
      )}

      {/* Action Buttons */}
      {onSend && (
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd+Enter</kbd> to send
            {' • '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd+K</kbd> for AI tools
          </p>

          <Button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      )}
    </div>
  )
}

// ==================== EXPORT ====================

export default AIEnhancedInput
