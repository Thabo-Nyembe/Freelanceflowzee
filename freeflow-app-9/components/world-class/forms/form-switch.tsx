'use client'

import * as React from 'react'
import { useFormContext, FieldPath, FieldValues } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Info, Loader2, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// ============================================================================
// TYPES
// ============================================================================

export interface FormSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name for react-hook-form */
  name: TName
  /** Label text */
  label?: string
  /** Description text shown below the switch */
  description?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the switch is in a loading state */
  loading?: boolean
  /** Tooltip text for additional information */
  tooltip?: string
  /** Callback when value changes */
  onValueChange?: (checked: boolean) => void
  /** Size of the switch */
  size?: 'sm' | 'md' | 'lg'
  /** Show on/off labels */
  showLabels?: boolean
  /** Custom on label */
  onLabel?: string
  /** Custom off label */
  offLabel?: string
  /** Show icons in switch */
  showIcons?: boolean
  /** Variant for different styles */
  variant?: 'default' | 'success' | 'danger'
  /** Custom className */
  className?: string
  /** Custom className for the switch */
  switchClassName?: string
  /** Position of the switch relative to label */
  position?: 'left' | 'right'
  /** Badge text */
  badge?: string
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  /** Reverse the boolean value (for inverted switches like "Disable notifications") */
  inverted?: boolean
}

export interface SwitchGroupOption {
  /** Unique name for the option */
  name: string
  /** Display label */
  label: string
  /** Description text */
  description?: string
  /** Whether the option is disabled */
  disabled?: boolean
  /** Default value */
  defaultValue?: boolean
}

export interface FormSwitchGroupProps<
  TFieldValues extends FieldValues = FieldValues
> {
  /** Options to display */
  options: SwitchGroupOption[]
  /** Label for the group */
  label?: string
  /** Description for the group */
  description?: string
  /** Whether the group is disabled */
  disabled?: boolean
  /** Whether the group is in a loading state */
  loading?: boolean
  /** Tooltip text */
  tooltip?: string
  /** Callback when any value changes */
  onValueChange?: (name: string, checked: boolean) => void
  /** Size of the switches */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
  /** Divider between options */
  showDivider?: boolean
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const switchValidationSchemas = {
  required: z.boolean().refine(val => val === true, {
    message: 'This must be enabled',
  }),
  optional: z.boolean().optional(),
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const sizeClasses = {
  sm: {
    switch: 'h-5 w-9',
    thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
    label: 'text-sm',
    description: 'text-xs',
    gap: 'gap-2',
    icon: 'h-2.5 w-2.5',
  },
  md: {
    switch: 'h-6 w-11',
    thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
    label: 'text-sm',
    description: 'text-sm',
    gap: 'gap-3',
    icon: 'h-3 w-3',
  },
  lg: {
    switch: 'h-7 w-14',
    thumb: 'h-6 w-6 data-[state=checked]:translate-x-7',
    label: 'text-base',
    description: 'text-sm',
    gap: 'gap-4',
    icon: 'h-3.5 w-3.5',
  },
}

// ============================================================================
// VARIANT CONFIGURATIONS
// ============================================================================

const variantClasses = {
  default: {
    checked: 'data-[state=checked]:bg-primary',
    unchecked: 'data-[state=unchecked]:bg-input',
  },
  success: {
    checked: 'data-[state=checked]:bg-green-500',
    unchecked: 'data-[state=unchecked]:bg-input',
  },
  danger: {
    checked: 'data-[state=checked]:bg-destructive',
    unchecked: 'data-[state=unchecked]:bg-input',
  },
}

// ============================================================================
// SWITCH WITH ICONS
// ============================================================================

interface SwitchWithIconsProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  size: 'sm' | 'md' | 'lg'
  variant: 'default' | 'success' | 'danger'
  className?: string
}

function SwitchWithIcons({
  checked,
  onCheckedChange,
  disabled,
  size,
  variant,
  className,
}: SwitchWithIconsProps) {
  const sizes = sizeClasses[size]
  const variants = variantClasses[variant]

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sizes.switch,
        checked ? variants.checked : variants.unchecked,
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none flex items-center justify-center rounded-full bg-background shadow-lg ring-0 transition-transform',
          sizes.thumb.split(' ')[0],
          sizes.thumb.split(' ')[1],
          checked
            ? sizes.thumb.split(' ').slice(2).join(' ')
            : 'translate-x-0'
        )}
      >
        {checked ? (
          <Check className={cn(sizes.icon, 'text-green-500')} />
        ) : (
          <X className={cn(sizes.icon, 'text-muted-foreground')} />
        )}
      </span>
    </button>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FormSwitch<
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
  showLabels = false,
  onLabel = 'On',
  offLabel = 'Off',
  showIcons = false,
  variant = 'default',
  className,
  switchClassName,
  position = 'right',
  badge,
  badgeVariant = 'secondary',
  inverted = false,
}: FormSwitchProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>()
  const sizes = sizeClasses[size]

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const isChecked = inverted ? !field.value : field.value

        const handleChange = (checked: boolean) => {
          const newValue = inverted ? !checked : checked
          field.onChange(newValue)
          onValueChange?.(newValue)
        }

        const switchElement = showIcons ? (
          <SwitchWithIcons
            checked={isChecked}
            onCheckedChange={handleChange}
            disabled={disabled || loading}
            size={size}
            variant={variant}
            className={switchClassName}
          />
        ) : (
          <Switch
            checked={isChecked}
            onCheckedChange={handleChange}
            disabled={disabled || loading}
            className={cn(
              sizes.switch,
              variantClasses[variant].checked,
              variantClasses[variant].unchecked,
              switchClassName
            )}
          />
        )

        const labelElement = (label || description || showLabels) && (
          <div className="space-y-1 leading-none flex-1">
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
            {showLabels && (
              <span className={cn(
                'text-sm font-medium transition-colors',
                isChecked ? 'text-green-600' : 'text-muted-foreground'
              )}>
                {isChecked ? onLabel : offLabel}
              </span>
            )}
          </div>
        )

        return (
          <FormItem
            className={cn(
              'flex flex-row items-center justify-between space-y-0',
              sizes.gap,
              position === 'left' && 'flex-row-reverse',
              className
            )}
          >
            {labelElement}
            <FormControl>
              {switchElement}
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// SWITCH GROUP COMPONENT
// ============================================================================

export function FormSwitchGroup<
  TFieldValues extends FieldValues = FieldValues
>({
  options,
  label,
  description,
  disabled = false,
  loading = false,
  tooltip,
  onValueChange,
  size = 'md',
  className,
  showDivider = true,
}: FormSwitchGroupProps<TFieldValues>) {
  const form = useFormContext<TFieldValues>()
  const sizes = sizeClasses[size]

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium">{label}</Label>
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
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className={cn(showDivider && 'divide-y divide-border rounded-lg border')}>
        {options.map((option, index) => (
          <FormField
            key={option.name}
            control={form.control}
            name={option.name as FieldPath<TFieldValues>}
            render={({ field }) => (
              <FormItem
                className={cn(
                  'flex flex-row items-center justify-between space-y-0',
                  showDivider ? 'p-4' : index > 0 && 'mt-4'
                )}
              >
                <div className="space-y-0.5">
                  <FormLabel className={cn(sizes.label, 'font-normal')}>
                    {option.label}
                  </FormLabel>
                  {option.description && (
                    <FormDescription className={sizes.description}>
                      {option.description}
                    </FormDescription>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      onValueChange?.(option.name, checked)
                    }}
                    disabled={disabled || loading || option.disabled}
                    className={sizes.switch}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// STANDALONE SWITCH (without react-hook-form)
// ============================================================================

export interface StandaloneSwitchProps {
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Error message */
  error?: string
  /** Whether the switch is checked */
  checked?: boolean
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the switch is in a loading state */
  loading?: boolean
  /** Tooltip text */
  tooltip?: string
  /** Size of the switch */
  size?: 'sm' | 'md' | 'lg'
  /** Show on/off labels */
  showLabels?: boolean
  /** Custom on label */
  onLabel?: string
  /** Custom off label */
  offLabel?: string
  /** Show icons */
  showIcons?: boolean
  /** Variant */
  variant?: 'default' | 'success' | 'danger'
  /** Custom className */
  className?: string
  /** Position of the switch */
  position?: 'left' | 'right'
  /** Reverse the boolean value */
  inverted?: boolean
}

export function StandaloneSwitch({
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
  showLabels = false,
  onLabel = 'On',
  offLabel = 'Off',
  showIcons = false,
  variant = 'default',
  className,
  position = 'right',
  inverted = false,
}: StandaloneSwitchProps) {
  const id = React.useId()
  const sizes = sizeClasses[size]
  const isChecked = inverted ? !checked : checked

  const handleChange = (newChecked: boolean) => {
    const value = inverted ? !newChecked : newChecked
    onCheckedChange?.(value)
  }

  const switchElement = showIcons ? (
    <SwitchWithIcons
      checked={isChecked}
      onCheckedChange={handleChange}
      disabled={disabled || loading}
      size={size}
      variant={variant}
    />
  ) : (
    <Switch
      id={id}
      checked={isChecked}
      onCheckedChange={handleChange}
      disabled={disabled || loading}
      className={cn(
        sizes.switch,
        variantClasses[variant].checked,
        variantClasses[variant].unchecked
      )}
    />
  )

  const labelElement = (label || description || showLabels) && (
    <div className="space-y-1 leading-none flex-1">
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
      {showLabels && (
        <span className={cn(
          'text-sm font-medium transition-colors',
          isChecked ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {isChecked ? onLabel : offLabel}
        </span>
      )}
    </div>
  )

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        sizes.gap,
        position === 'left' && 'flex-row-reverse',
        className
      )}
    >
      {labelElement}
      {switchElement}
    </div>
  )
}

// ============================================================================
// SETTING SWITCH (common pattern for settings pages)
// ============================================================================

export interface SettingSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<FormSwitchProps<TFieldValues, TName>, 'position' | 'size'> {
  /** Icon to display */
  icon?: React.ReactNode
}

export function SettingSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  icon,
  ...props
}: SettingSwitchProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="mt-0.5 text-muted-foreground">
                {icon}
              </div>
            )}
            <div className="space-y-0.5">
              <FormLabel className="text-base">{label}</FormLabel>
              {description && (
                <FormDescription>{description}</FormDescription>
              )}
            </div>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={props.disabled || props.loading}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FormSwitch
