'use client'

import * as React from 'react'
import { useFormContext, FieldPath, FieldValues, FieldError } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import {
  FormControl,
  FormDescription,
  FormField as RHFFormField,
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
  HelpCircle,
  Info,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// ============================================================================
// TYPES
// ============================================================================

export interface FormFieldWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name for react-hook-form */
  name: TName
  /** Label text */
  label?: string
  /** Description text shown below the field */
  description?: string
  /** Tooltip text for additional information */
  tooltip?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is loading */
  loading?: boolean
  /** Whether to show validation status icons */
  showValidationStatus?: boolean
  /** Optional badge text (e.g., "Beta", "New") */
  badge?: string
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  /** Custom className for the field container */
  className?: string
  /** Custom className for the label */
  labelClassName?: string
  /** Orientation of the field (vertical = label above, horizontal = label beside) */
  orientation?: 'vertical' | 'horizontal'
  /** Width of the label in horizontal orientation */
  labelWidth?: string
  /** Hide the label visually but keep it accessible */
  hideLabel?: boolean
  /** Custom render function for the field */
  children: (field: {
    value: any
    onChange: (...event: any[]) => void
    onBlur: () => void
    name: string
    ref: React.Ref<any>
    disabled?: boolean
  }, fieldState: {
    invalid: boolean
    isTouched: boolean
    isDirty: boolean
    error?: FieldError
  }) => React.ReactNode
}

export interface FieldWrapperProps {
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Error message */
  error?: string
  /** Tooltip text */
  tooltip?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether to show success state */
  showSuccess?: boolean
  /** Whether to show error state */
  showError?: boolean
  /** Whether the field is loading */
  loading?: boolean
  /** Badge text */
  badge?: string
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  /** Container className */
  className?: string
  /** Label className */
  labelClassName?: string
  /** Orientation */
  orientation?: 'vertical' | 'horizontal'
  /** Label width for horizontal */
  labelWidth?: string
  /** Hide label visually */
  hideLabel?: boolean
  /** HTML ID for the field */
  htmlFor?: string
  /** Children elements */
  children: React.ReactNode
}

// ============================================================================
// STANDALONE FIELD WRAPPER (without react-hook-form)
// ============================================================================

/**
 * A standalone field wrapper component for non-RHF forms.
 * Provides consistent styling for label, description, error, and tooltip.
 */
export function FieldWrapper({
  label,
  description,
  error,
  tooltip,
  required = false,
  showSuccess = false,
  showError = false,
  loading = false,
  badge,
  badgeVariant = 'secondary',
  className,
  labelClassName,
  orientation = 'vertical',
  labelWidth = '120px',
  hideLabel = false,
  htmlFor,
  children,
}: FieldWrapperProps) {
  const id = React.useId()
  const fieldId = htmlFor || id

  const labelContent = label && (
    <div className="flex items-center gap-2">
      <Label
        htmlFor={fieldId}
        className={cn(
          required && "after:content-['*'] after:ml-0.5 after:text-destructive",
          hideLabel && 'sr-only',
          labelClassName
        )}
      >
        {label}
      </Label>
      {badge && (
        <Badge variant={badgeVariant} className="text-xs">
          {badge}
        </Badge>
      )}
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
  )

  const validationIcon = (
    <>
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {!loading && showSuccess && (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      )}
      {!loading && showError && (
        <AlertCircle className="h-4 w-4 text-destructive" />
      )}
    </>
  )

  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-start gap-4', className)}>
        <div style={{ width: labelWidth }} className="flex-shrink-0 pt-2">
          {labelContent}
        </div>
        <div className="flex-1 space-y-2">
          <div className="relative">
            {children}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationIcon}
            </div>
          </div>
          {description && !error && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {labelContent}
      <div className="relative">
        {children}
      </div>
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}

// ============================================================================
// FORM FIELD WRAPPER (with react-hook-form integration)
// ============================================================================

/**
 * A reusable FormField wrapper component that integrates with react-hook-form.
 * Provides consistent styling for label, description, error, and tooltip.
 * Use this to create custom form fields with RHF integration.
 *
 * @example
 * ```tsx
 * <FormFieldWrapper
 *   name="customField"
 *   label="Custom Field"
 *   description="Enter your custom value"
 *   required
 * >
 *   {(field, fieldState) => (
 *     <MyCustomInput {...field} error={fieldState.error} />
 *   )}
 * </FormFieldWrapper>
 * ```
 */
export function FormFieldWrapper<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  tooltip,
  required = false,
  disabled = false,
  loading = false,
  showValidationStatus = true,
  badge,
  badgeVariant = 'secondary',
  className,
  labelClassName,
  orientation = 'vertical',
  labelWidth = '120px',
  hideLabel = false,
  children,
}: FormFieldWrapperProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>()

  return (
    <RHFFormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const { error, isDirty, isTouched } = fieldState
        const hasValue = field.value !== undefined && field.value !== '' && field.value !== null
        const showSuccess = showValidationStatus && isDirty && !error && hasValue
        const showError = showValidationStatus && (isTouched || isDirty) && !!error

        const labelContent = label && (
          <div className="flex items-center gap-2">
            <FormLabel
              className={cn(
                required && "after:content-['*'] after:ml-0.5 after:text-destructive",
                hideLabel && 'sr-only',
                labelClassName
              )}
            >
              {label}
            </FormLabel>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs">
                {badge}
              </Badge>
            )}
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
        )

        const validationIcon = showValidationStatus && (
          <div className="flex items-center">
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {!loading && showSuccess && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {!loading && showError && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )

        if (orientation === 'horizontal') {
          return (
            <FormItem className={cn('flex items-start gap-4', className)}>
              <div style={{ width: labelWidth }} className="flex-shrink-0 pt-2">
                {labelContent}
              </div>
              <div className="flex-1 space-y-2">
                <FormControl>
                  <div className="relative">
                    {children(
                      { ...field, disabled: disabled || loading },
                      fieldState
                    )}
                  </div>
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </div>
            </FormItem>
          )
        }

        return (
          <FormItem className={cn('space-y-2', className)}>
            {labelContent}
            <FormControl>
              {children(
                { ...field, disabled: disabled || loading },
                fieldState
              )}
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * A simple required indicator component
 */
export function RequiredIndicator({ className }: { className?: string }) {
  return (
    <span className={cn('text-destructive ml-0.5', className)} aria-label="required">
      *
    </span>
  )
}

/**
 * A help text component with optional tooltip
 */
export function HelpText({
  children,
  tooltip,
  className,
}: {
  children?: React.ReactNode
  tooltip?: string
  className?: string
}) {
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn('inline-flex items-center gap-1 text-sm text-muted-foreground cursor-help', className)}>
              {children}
              <HelpCircle className="h-3.5 w-3.5" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <span className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </span>
  )
}

/**
 * A field error component
 */
export function FieldError({
  error,
  className,
}: {
  error?: string | FieldError
  className?: string
}) {
  if (!error) return null

  const message = typeof error === 'string' ? error : error.message

  return (
    <p className={cn('text-sm font-medium text-destructive flex items-center gap-1.5', className)}>
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  )
}

/**
 * A field success component
 */
export function FieldSuccess({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  if (!message) return null

  return (
    <p className={cn('text-sm font-medium text-green-600 flex items-center gap-1.5', className)}>
      <CheckCircle2 className="h-3.5 w-3.5" />
      {message}
    </p>
  )
}

// ============================================================================
// FORM SECTION COMPONENTS
// ============================================================================

/**
 * A form section component for grouping related fields
 */
export interface FormSectionProps {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Children fields */
  children: React.ReactNode
  /** Custom className */
  className?: string
  /** Whether this section is collapsible */
  collapsible?: boolean
  /** Default collapsed state */
  defaultCollapsed?: boolean
}

export function FormSection({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false,
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div
          className={cn(
            'space-y-1',
            collapsible && 'cursor-pointer select-none'
          )}
          onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
        >
          {title && (
            <h3 className="text-lg font-medium flex items-center gap-2">
              {title}
              {collapsible && (
                <span className="text-muted-foreground">
                  {isCollapsed ? '+' : '-'}
                </span>
              )}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {(!collapsible || !isCollapsed) && (
        <div className="space-y-4">{children}</div>
      )}
    </div>
  )
}

/**
 * A form row component for horizontal field layouts
 */
export interface FormRowProps {
  /** Children fields */
  children: React.ReactNode
  /** Gap between fields */
  gap?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
}

export function FormRow({
  children,
  gap = 'md',
  className,
}: FormRowProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={cn('flex flex-wrap items-start', gapClasses[gap], className)}>
      {children}
    </div>
  )
}

/**
 * A form column component for grid layouts
 */
export interface FormGridProps {
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4
  /** Gap between fields */
  gap?: 'sm' | 'md' | 'lg'
  /** Children fields */
  children: React.ReactNode
  /** Custom className */
  className?: string
}

export function FormGrid({
  columns = 2,
  gap = 'md',
  children,
  className,
}: FormGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FormFieldWrapper
