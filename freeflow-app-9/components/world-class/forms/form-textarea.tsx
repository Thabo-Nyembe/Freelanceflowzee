'use client'

import * as React from 'react'
import { useFormContext, FieldPath, FieldValues } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// ============================================================================
// TYPES
// ============================================================================

export interface FormTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name for react-hook-form */
  name: TName
  /** Label text */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Description text shown below the textarea */
  description?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is read-only */
  readOnly?: boolean
  /** Tooltip text for additional information */
  tooltip?: string
  /** Whether the textarea is in a loading state */
  loading?: boolean
  /** Callback when value changes */
  onValueChange?: (value: string) => void
  /** Minimum length */
  minLength?: number
  /** Maximum length */
  maxLength?: number
  /** Whether to show character count */
  showCharacterCount?: boolean
  /** Whether to show word count */
  showWordCount?: boolean
  /** Whether to auto-resize based on content */
  autoResize?: boolean
  /** Minimum number of rows */
  minRows?: number
  /** Maximum number of rows */
  maxRows?: number
  /** Whether to show validation status icons */
  showValidationStatus?: boolean
  /** Whether to allow expanding to fullscreen */
  expandable?: boolean
  /** Custom className */
  className?: string
  /** Textarea className */
  textareaClassName?: string
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const textareaValidationSchemas = {
  shortText: z.string()
    .min(1, 'This field is required')
    .max(100, 'Text must be at most 100 characters'),
  mediumText: z.string()
    .min(1, 'This field is required')
    .max(500, 'Text must be at most 500 characters'),
  longText: z.string()
    .min(1, 'This field is required')
    .max(2000, 'Text must be at most 2000 characters'),
  bio: z.string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be at most 500 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters'),
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length
}

function getCharacterCountColor(current: number, max: number): string {
  const percentage = current / max
  if (percentage >= 1) return 'text-destructive'
  if (percentage >= 0.9) return 'text-orange-500'
  if (percentage >= 0.75) return 'text-yellow-500'
  return 'text-muted-foreground'
}

// ============================================================================
// AUTO-RESIZE HOOK
// ============================================================================

function useAutoResize(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  value: string,
  minRows: number,
  maxRows: number,
  enabled: boolean
) {
  React.useEffect(() => {
    if (!enabled || !textareaRef.current) return

    const textarea = textareaRef.current
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
    const minHeight = lineHeight * minRows + 16 // 16 for padding
    const maxHeight = lineHeight * maxRows + 16

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'

    // Calculate new height
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
    textarea.style.height = `${newHeight}px`

    // Show scrollbar if content exceeds max height
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [textareaRef, value, minRows, maxRows, enabled])
}

// ============================================================================
// EXPANDABLE TEXTAREA DIALOG
// ============================================================================

interface ExpandableDialogProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  maxLength?: number
  label?: string
}

function ExpandableDialog({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  maxLength,
  label,
}: ExpandableDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [localValue, setLocalValue] = React.useState(value)

  React.useEffect(() => {
    if (open) {
      setLocalValue(value)
    }
  }, [open, value])

  const handleSave = () => {
    onChange(localValue)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          title="Expand"
        >
          <Maximize2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{label || 'Edit Text'}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-1 gap-4">
          <Textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            className="flex-1 min-h-[400px] resize-none"
          />
          <div className="flex items-center justify-between">
            {maxLength && (
              <span className={cn(
                'text-sm',
                getCharacterCountColor(localValue?.length || 0, maxLength)
              )}>
                {localValue?.length || 0} / {maxLength}
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={disabled || readOnly}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FormTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  placeholder,
  description,
  required = false,
  disabled = false,
  readOnly = false,
  tooltip,
  loading = false,
  onValueChange,
  minLength,
  maxLength,
  showCharacterCount = false,
  showWordCount = false,
  autoResize = false,
  minRows = 3,
  maxRows = 10,
  showValidationStatus = true,
  expandable = false,
  className,
  textareaClassName,
}: FormTextareaProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const { error, isDirty, isTouched } = fieldState
        const hasValue = field.value && field.value.length > 0
        const showSuccess = showValidationStatus && isDirty && !error && hasValue
        const showError = showValidationStatus && (isTouched || isDirty) && error

        const characterCount = field.value?.length || 0
        const wordCount = countWords(field.value || '')

        // Use auto-resize hook
        useAutoResize(textareaRef, field.value || '', minRows, maxRows, autoResize)

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          field.onChange(e.target.value)
          onValueChange?.(e.target.value)
        }

        const handleExpandedChange = (value: string) => {
          field.onChange(value)
          onValueChange?.(value)
        }

        return (
          <FormItem className={cn('space-y-2', className)}>
            {label && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FormLabel className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
                    {label}
                  </FormLabel>
                  {tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {expandable && (
                  <ExpandableDialog
                    value={field.value || ''}
                    onChange={handleExpandedChange}
                    placeholder={placeholder}
                    disabled={disabled || loading}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    label={label}
                  />
                )}
              </div>
            )}

            <FormControl>
              <div className="relative">
                <Textarea
                  {...field}
                  ref={textareaRef}
                  placeholder={placeholder}
                  disabled={disabled || loading}
                  readOnly={readOnly}
                  minLength={minLength}
                  maxLength={maxLength}
                  value={field.value || ''}
                  onChange={handleChange}
                  rows={autoResize ? minRows : undefined}
                  className={cn(
                    'transition-colors',
                    autoResize && 'resize-none overflow-hidden',
                    !autoResize && 'min-h-[100px]',
                    showError && 'border-destructive focus-visible:ring-destructive',
                    showSuccess && 'border-green-500 focus-visible:ring-green-500',
                    textareaClassName
                  )}
                />

                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Validation Status Icon */}
                {showValidationStatus && !loading && (
                  <div className="absolute top-3 right-3">
                    {showSuccess && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {showError && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
            </FormControl>

            {/* Character/Word Count and Description */}
            <div className="flex items-center justify-between text-sm">
              {description && (
                <FormDescription className="flex-1">{description}</FormDescription>
              )}

              <div className="flex items-center gap-3 ml-auto">
                {showWordCount && (
                  <span className="text-muted-foreground">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </span>
                )}
                {showCharacterCount && maxLength && (
                  <span className={cn(getCharacterCountColor(characterCount, maxLength))}>
                    {characterCount} / {maxLength}
                  </span>
                )}
                {showCharacterCount && !maxLength && (
                  <span className="text-muted-foreground">
                    {characterCount} characters
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// STANDALONE TEXTAREA (without react-hook-form)
// ============================================================================

export interface StandaloneTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Error message */
  error?: string
  /** Tooltip text */
  tooltip?: string
  /** Loading state */
  loading?: boolean
  /** Callback when value changes */
  onValueChange?: (value: string) => void
  /** Whether to show character count */
  showCharacterCount?: boolean
  /** Whether to show word count */
  showWordCount?: boolean
  /** Whether to auto-resize */
  autoResize?: boolean
  /** Minimum rows for auto-resize */
  minRows?: number
  /** Maximum rows for auto-resize */
  maxRows?: number
  /** Whether to show validation status */
  showValidationStatus?: boolean
  /** Whether to allow expanding */
  expandable?: boolean
  /** Container className */
  containerClassName?: string
  /** Whether validation passed */
  isValid?: boolean
}

export function StandaloneTextarea({
  label,
  description,
  error,
  tooltip,
  loading = false,
  onValueChange,
  showCharacterCount = false,
  showWordCount = false,
  autoResize = false,
  minRows = 3,
  maxRows = 10,
  showValidationStatus = false,
  expandable = false,
  containerClassName,
  className,
  required,
  disabled,
  readOnly,
  value,
  maxLength,
  isValid,
  ...props
}: StandaloneTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [internalValue, setInternalValue] = React.useState(value || '')

  const currentValue = value !== undefined ? value : internalValue
  const characterCount = String(currentValue || '').length
  const wordCount = countWords(String(currentValue || ''))

  // Use auto-resize hook
  useAutoResize(
    textareaRef,
    String(currentValue || ''),
    minRows,
    maxRows,
    autoResize
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  const handleExpandedChange = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  const id = React.useId()

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label
              htmlFor={id}
              className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}
            >
              {label}
            </Label>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {expandable && (
            <ExpandableDialog
              value={String(currentValue || '')}
              onChange={handleExpandedChange}
              placeholder={props.placeholder}
              disabled={disabled || loading}
              readOnly={readOnly}
              maxLength={maxLength}
              label={label}
            />
          )}
        </div>
      )}

      <div className="relative">
        <Textarea
          id={id}
          ref={textareaRef}
          disabled={disabled || loading}
          readOnly={readOnly}
          maxLength={maxLength}
          value={currentValue}
          onChange={handleChange}
          rows={autoResize ? minRows : undefined}
          className={cn(
            'transition-colors',
            autoResize && 'resize-none overflow-hidden',
            !autoResize && 'min-h-[100px]',
            error && 'border-destructive focus-visible:ring-destructive',
            isValid && showValidationStatus && 'border-green-500 focus-visible:ring-green-500',
            className
          )}
          {...props}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {showValidationStatus && !loading && (
          <div className="absolute top-3 right-3">
            {isValid && !error && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {error && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        {description && !error && (
          <p className="text-muted-foreground flex-1">{description}</p>
        )}
        {error && (
          <p className="text-destructive font-medium flex-1">{error}</p>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {showWordCount && (
            <span className="text-muted-foreground">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          )}
          {showCharacterCount && maxLength && (
            <span className={cn(getCharacterCountColor(characterCount, maxLength))}>
              {characterCount} / {maxLength}
            </span>
          )}
          {showCharacterCount && !maxLength && (
            <span className="text-muted-foreground">
              {characterCount} characters
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// RICH TEXT DISPLAY COMPONENT
// ============================================================================

export interface TextDisplayProps {
  /** Text content to display */
  content: string
  /** Label text */
  label?: string
  /** Whether to show character count */
  showCharacterCount?: boolean
  /** Whether to show word count */
  showWordCount?: boolean
  /** Maximum height before scrolling */
  maxHeight?: number
  /** Whether to preserve whitespace */
  preserveWhitespace?: boolean
  /** Custom className */
  className?: string
}

export function TextDisplay({
  content,
  label,
  showCharacterCount = false,
  showWordCount = false,
  maxHeight = 200,
  preserveWhitespace = true,
  className,
}: TextDisplayProps) {
  const characterCount = content?.length || 0
  const wordCount = countWords(content || '')

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}

      <div
        className={cn(
          'p-3 rounded-md border bg-muted/50 text-sm overflow-auto',
          preserveWhitespace && 'whitespace-pre-wrap'
        )}
        style={{ maxHeight }}
      >
        {content || <span className="text-muted-foreground italic">No content</span>}
      </div>

      {(showCharacterCount || showWordCount) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {showWordCount && (
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          )}
          {showCharacterCount && (
            <span>{characterCount} characters</span>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FormTextarea
