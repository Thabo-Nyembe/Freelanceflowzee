'use client'

import * as React from 'react'
import { useFormContext, FieldPath, FieldValues } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Info, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// ============================================================================
// TYPES
// ============================================================================

export interface FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name for react-hook-form */
  name: TName
  /** Label text */
  label?: string
  /** Description text shown below the checkbox */
  description?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the checkbox is in a loading state */
  loading?: boolean
  /** Tooltip text for additional information */
  tooltip?: string
  /** Callback when value changes */
  onValueChange?: (checked: boolean) => void
  /** Size of the checkbox */
  size?: 'sm' | 'md' | 'lg'
  /** Indeterminate state for parent checkboxes */
  indeterminate?: boolean
  /** Custom className */
  className?: string
  /** Custom className for the checkbox */
  checkboxClassName?: string
  /** Position of the checkbox relative to label */
  position?: 'left' | 'right'
  /** Badge text */
  badge?: string
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export interface CheckboxGroupOption {
  /** Unique value for the option */
  value: string
  /** Display label */
  label: string
  /** Description text */
  description?: string
  /** Whether the option is disabled */
  disabled?: boolean
}

export interface FormCheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name for react-hook-form */
  name: TName
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Options to display */
  options: CheckboxGroupOption[]
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the group is in a loading state */
  loading?: boolean
  /** Tooltip text */
  tooltip?: string
  /** Callback when value changes */
  onValueChange?: (values: string[]) => void
  /** Orientation of the checkbox group */
  orientation?: 'horizontal' | 'vertical'
  /** Maximum number of selections */
  maxSelections?: number
  /** Minimum number of selections */
  minSelections?: number
  /** Custom className */
  className?: string
  /** Enable "Select All" option */
  showSelectAll?: boolean
  /** Custom "Select All" label */
  selectAllLabel?: string
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const checkboxValidationSchemas = {
  required: z.boolean().refine(val => val === true, {
    message: 'This field is required',
  }),
  optional: z.boolean().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  checkboxGroup: (min?: number, max?: number) =>
    z.array(z.string()).refine(
      arr => {
        if (min !== undefined && arr.length < min) return false
        if (max !== undefined && arr.length > max) return false
        return true
      },
      {
        message: min && max
          ? `Select between ${min} and ${max} options`
          : min
          ? `Select at least ${min} option(s)`
          : max
          ? `Select at most ${max} option(s)`
          : 'Invalid selection',
      }
    ),
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const sizeClasses = {
  sm: {
    checkbox: 'h-3.5 w-3.5',
    label: 'text-sm',
    description: 'text-xs',
    gap: 'gap-2',
  },
  md: {
    checkbox: 'h-4 w-4',
    label: 'text-sm',
    description: 'text-sm',
    gap: 'gap-3',
  },
  lg: {
    checkbox: 'h-5 w-5',
    label: 'text-base',
    description: 'text-sm',
    gap: 'gap-3',
  },
}

// ============================================================================
// SINGLE CHECKBOX COMPONENT
// ============================================================================

export function FormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  required = false,
  disabled = false,
  loading = false,
  tooltip,
  onValueChange,
  size = 'md',
  indeterminate = false,
  className,
  checkboxClassName,
  position = 'left',
  badge,
  badgeVariant = 'secondary',
}: FormCheckboxProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>()
  const checkboxRef = React.useRef<HTMLButtonElement>(null)
  const sizes = sizeClasses[size]

  // Handle indeterminate state
  React.useEffect(() => {
    if (checkboxRef.current) {
      const input = checkboxRef.current.querySelector('input')
      if (input) {
        input.indeterminate = indeterminate
      }
    }
  }, [indeterminate])

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const handleChange = (checked: boolean) => {
          field.onChange(checked)
          onValueChange?.(checked)
        }

        const checkboxElement = (
          <Checkbox
            ref={checkboxRef}
            checked={field.value}
            onCheckedChange={handleChange}
            disabled={disabled || loading}
            className={cn(sizes.checkbox, checkboxClassName)}
          />
        )

        const labelElement = (label || description) && (
          <div className="space-y-1 leading-none">
            {label && (
              <div className="flex items-center gap-2">
                <FormLabel
                  className={cn(
                    sizes.label,
                    'font-normal cursor-pointer',
                    required && "after:content-['*'] after:ml-0.5 after:text-destructive"
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
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            )}
            {description && (
              <FormDescription className={sizes.description}>
                {description}
              </FormDescription>
            )}
          </div>
        )

        return (
          <FormItem
            className={cn(
              'flex flex-row items-start space-y-0',
              sizes.gap,
              position === 'right' && 'flex-row-reverse justify-end',
              className
            )}
          >
            <FormControl>
              {checkboxElement}
            </FormControl>
            {labelElement}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// CHECKBOX GROUP COMPONENT
// ============================================================================

export function FormCheckboxGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  options,
  required = false,
  disabled = false,
  loading = false,
  tooltip,
  onValueChange,
  orientation = 'vertical',
  maxSelections,
  minSelections,
  className,
  showSelectAll = false,
  selectAllLabel = 'Select all',
}: FormCheckboxGroupProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selectedValues: string[] = Array.isArray(field.value) ? field.value : []
        const enabledOptions = options.filter(opt => !opt.disabled)
        const allSelected = enabledOptions.length > 0 &&
          enabledOptions.every(opt => selectedValues.includes(opt.value))
        const someSelected = selectedValues.length > 0 && !allSelected
        const isMaxReached = maxSelections !== undefined && selectedValues.length >= maxSelections

        const handleToggle = (value: string, checked: boolean) => {
          let newValues: string[]

          if (checked) {
            if (isMaxReached) return
            newValues = [...selectedValues, value]
          } else {
            newValues = selectedValues.filter(v => v !== value)
          }

          field.onChange(newValues)
          onValueChange?.(newValues)
        }

        const handleSelectAll = (checked: boolean) => {
          let newValues: string[]

          if (checked) {
            const allValues = enabledOptions.map(opt => opt.value)
            if (maxSelections && allValues.length > maxSelections) {
              newValues = allValues.slice(0, maxSelections)
            } else {
              newValues = allValues
            }
          } else {
            newValues = []
          }

          field.onChange(newValues)
          onValueChange?.(newValues)
        }

        return (
          <FormItem className={cn('space-y-3', className)}>
            {label && (
              <div className="flex items-center gap-2">
                <FormLabel
                  className={cn(
                    required && "after:content-['*'] after:ml-0.5 after:text-destructive"
                  )}
                >
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
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {maxSelections && (
                  <span className="text-sm text-muted-foreground">
                    ({selectedValues.length}/{maxSelections})
                  </span>
                )}
              </div>
            )}

            {description && (
              <FormDescription>{description}</FormDescription>
            )}

            <div
              className={cn(
                orientation === 'horizontal'
                  ? 'flex flex-wrap gap-4'
                  : 'flex flex-col space-y-3'
              )}
            >
              {/* Select All Option */}
              {showSelectAll && (
                <div className="flex items-center space-x-2 pb-2 border-b mb-2">
                  <Checkbox
                    id={`${name}-select-all`}
                    checked={allSelected}
                    // @ts-ignore - indeterminate is a valid prop but not typed in shadcn
                    data-state={someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
                    onCheckedChange={handleSelectAll}
                    disabled={disabled || loading}
                  />
                  <Label
                    htmlFor={`${name}-select-all`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {selectAllLabel}
                  </Label>
                </div>
              )}

              {/* Options */}
              {options.map((option) => {
                const isChecked = selectedValues.includes(option.value)
                const isOptionDisabled = disabled || loading || option.disabled ||
                  (!isChecked && isMaxReached)

                return (
                  <FormItem
                    key={option.value}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleToggle(option.value, checked as boolean)
                        }
                        disabled={isOptionDisabled}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label className="text-sm font-normal cursor-pointer">
                        {option.label}
                      </Label>
                      {option.description && (
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </FormItem>
                )
              })}
            </div>

            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// STANDALONE CHECKBOX (without react-hook-form)
// ============================================================================

export interface StandaloneCheckboxProps {
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Error message */
  error?: string
  /** Whether the checkbox is checked */
  checked?: boolean
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the checkbox is in a loading state */
  loading?: boolean
  /** Tooltip text */
  tooltip?: string
  /** Size of the checkbox */
  size?: 'sm' | 'md' | 'lg'
  /** Indeterminate state */
  indeterminate?: boolean
  /** Custom className */
  className?: string
  /** Position of the checkbox relative to label */
  position?: 'left' | 'right'
}

export function StandaloneCheckbox({
  label,
  description,
  error,
  checked = false,
  onCheckedChange,
  required = false,
  disabled = false,
  loading = false,
  tooltip,
  size = 'md',
  indeterminate = false,
  className,
  position = 'left',
}: StandaloneCheckboxProps) {
  const id = React.useId()
  const checkboxRef = React.useRef<HTMLButtonElement>(null)
  const sizes = sizeClasses[size]

  React.useEffect(() => {
    if (checkboxRef.current) {
      const input = checkboxRef.current.querySelector('input')
      if (input) {
        input.indeterminate = indeterminate
      }
    }
  }, [indeterminate])

  const checkboxElement = (
    <Checkbox
      ref={checkboxRef}
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled || loading}
      className={sizes.checkbox}
    />
  )

  const labelElement = (label || description) && (
    <div className="space-y-1 leading-none">
      {label && (
        <div className="flex items-center gap-2">
          <Label
            htmlFor={id}
            className={cn(
              sizes.label,
              'font-normal cursor-pointer',
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
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
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
      {description && !error && (
        <p className={cn('text-muted-foreground', sizes.description)}>
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  )

  return (
    <div
      className={cn(
        'flex items-start',
        sizes.gap,
        position === 'right' && 'flex-row-reverse justify-end',
        className
      )}
    >
      {checkboxElement}
      {labelElement}
    </div>
  )
}

// ============================================================================
// TERMS CHECKBOX (common pattern)
// ============================================================================

export interface TermsCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<FormCheckboxProps<TFieldValues, TName>, 'label' | 'description'> {
  /** Terms link URL */
  termsUrl?: string
  /** Privacy link URL */
  privacyUrl?: string
  /** Custom terms text */
  termsText?: string
  /** Custom privacy text */
  privacyText?: string
  /** Link className */
  linkClassName?: string
}

export function TermsCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  termsUrl = '/terms',
  privacyUrl = '/privacy',
  termsText = 'Terms of Service',
  privacyText = 'Privacy Policy',
  linkClassName = 'underline underline-offset-4 hover:text-primary',
  required = true,
  ...props
}: TermsCheckboxProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={props.disabled || props.loading}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-normal">
              I agree to the{' '}
              <a href={termsUrl} className={linkClassName} target="_blank" rel="noopener noreferrer">
                {termsText}
              </a>{' '}
              and{' '}
              <a href={privacyUrl} className={linkClassName} target="_blank" rel="noopener noreferrer">
                {privacyText}
              </a>
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FormCheckbox
