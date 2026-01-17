'use client'

import * as React from 'react'
import { useFormContext, Controller, FieldPath, FieldValues } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ============================================================================
// TYPES
// ============================================================================

export interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name for react-hook-form */
  name: TName
  /** Label text */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Description text shown below the input */
  description?: string
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is read-only */
  readOnly?: boolean
  /** Whether to show a clear button */
  clearable?: boolean
  /** Whether to show validation status icons */
  showValidationStatus?: boolean
  /** Whether to show password toggle for password inputs */
  showPasswordToggle?: boolean
  /** Custom icon to show at the start of the input */
  startIcon?: React.ReactNode
  /** Custom icon to show at the end of the input */
  endIcon?: React.ReactNode
  /** Tooltip text for additional information */
  tooltip?: string
  /** Whether the input is in a loading state */
  loading?: boolean
  /** Callback when value changes */
  onValueChange?: (value: string) => void
  /** Custom validation function */
  validate?: (value: string) => string | true | Promise<string | true>
  /** Transform value before setting */
  transform?: {
    input?: (value: string) => string
    output?: (value: string) => string
  }
  /** Auto-complete attribute */
  autoComplete?: string
  /** Minimum length */
  minLength?: number
  /** Maximum length */
  maxLength?: number
  /** Pattern for validation */
  pattern?: string
  /** Custom className */
  className?: string
  /** Input className */
  inputClassName?: string
  /** Whether to show character count */
  showCharacterCount?: boolean
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const inputValidationSchemas = {
  email: z.string().email('Please enter a valid email address'),
  url: z.string().url('Please enter a valid URL'),
  phone: z.string().regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    'Please enter a valid phone number'
  ),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  strongPassword: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
}

// ============================================================================
// PASSWORD STRENGTH INDICATOR
// ============================================================================

interface PasswordStrengthProps {
  password: string
}

function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0

    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = getStrength(password)
  const percentage = (strength.score / 6) * 100

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength</span>
        <span className={cn(
          'font-medium',
          strength.label === 'Weak' && 'text-red-500',
          strength.label === 'Medium' && 'text-yellow-500',
          strength.label === 'Strong' && 'text-green-500'
        )}>
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', strength.color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  placeholder,
  description,
  type = 'text',
  required = false,
  disabled = false,
  readOnly = false,
  clearable = false,
  showValidationStatus = true,
  showPasswordToggle = true,
  startIcon,
  endIcon,
  tooltip,
  loading = false,
  onValueChange,
  validate,
  transform,
  autoComplete,
  minLength,
  maxLength,
  pattern,
  className,
  inputClassName,
  showCharacterCount = false,
}: FormInputProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = React.useState(false)
  const form = useFormContext<TFieldValues>()

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const { error, isDirty, isTouched } = fieldState
        const hasValue = field.value && field.value.length > 0
        const showSuccess = showValidationStatus && isDirty && !error && hasValue
        const showError = showValidationStatus && (isTouched || isDirty) && error

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let value = e.target.value

          if (transform?.output) {
            value = transform.output(value)
          }

          field.onChange(value)
          onValueChange?.(value)
        }

        const handleClear = () => {
          field.onChange('')
          onValueChange?.('')
        }

        const displayValue = transform?.input
          ? transform.input(field.value || '')
          : field.value || ''

        return (
          <FormItem className={cn('space-y-2', className)}>
            {label && (
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
            )}

            <FormControl>
              <div className="relative">
                {/* Start Icon */}
                {startIcon && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {startIcon}
                  </div>
                )}

                <Input
                  {...field}
                  type={inputType}
                  placeholder={placeholder}
                  disabled={disabled || loading}
                  readOnly={readOnly}
                  autoComplete={autoComplete}
                  minLength={minLength}
                  maxLength={maxLength}
                  pattern={pattern}
                  value={displayValue}
                  onChange={handleChange}
                  className={cn(
                    'transition-colors',
                    startIcon && 'pl-10',
                    (endIcon || clearable || (isPassword && showPasswordToggle) || showValidationStatus) && 'pr-10',
                    showError && 'border-destructive focus-visible:ring-destructive',
                    showSuccess && 'border-green-500 focus-visible:ring-green-500',
                    inputClassName
                  )}
                />

                {/* End Icons Container */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {/* Loading Indicator */}
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}

                  {/* Clear Button */}
                  {clearable && hasValue && !loading && !disabled && !readOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-transparent"
                      onClick={handleClear}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  )}

                  {/* Password Toggle */}
                  {isPassword && showPasswordToggle && !loading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}

                  {/* Validation Status Icon */}
                  {showValidationStatus && !loading && !isPassword && (
                    <>
                      {showSuccess && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {showError && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </>
                  )}

                  {/* Custom End Icon */}
                  {endIcon && !showValidationStatus && !loading && (
                    <div className="text-muted-foreground">{endIcon}</div>
                  )}
                </div>
              </div>
            </FormControl>

            {/* Password Strength Indicator */}
            {isPassword && field.value && (
              <PasswordStrengthIndicator password={field.value} />
            )}

            {/* Character Count */}
            {showCharacterCount && maxLength && (
              <div className="flex justify-end">
                <span className={cn(
                  'text-xs',
                  field.value?.length > maxLength * 0.9
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}>
                  {field.value?.length || 0} / {maxLength}
                </span>
              </div>
            )}

            {/* Description */}
            {description && (
              <FormDescription>{description}</FormDescription>
            )}

            {/* Error Message */}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// STANDALONE INPUT (without react-hook-form)
// ============================================================================

export interface StandaloneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  description?: string
  error?: string
  clearable?: boolean
  showPasswordToggle?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  tooltip?: string
  loading?: boolean
  onValueChange?: (value: string) => void
  showValidationStatus?: boolean
  containerClassName?: string
}

export function StandaloneInput({
  label,
  description,
  error,
  clearable = false,
  showPasswordToggle = true,
  startIcon,
  endIcon,
  tooltip,
  loading = false,
  onValueChange,
  showValidationStatus = false,
  containerClassName,
  className,
  type = 'text',
  required,
  disabled,
  readOnly,
  value,
  ...props
}: StandaloneInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value || '')

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  const currentValue = value !== undefined ? value : internalValue
  const hasValue = Boolean(currentValue && String(currentValue).length > 0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  const handleClear = () => {
    setInternalValue('')
    onValueChange?.('')
  }

  const id = React.useId()

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
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
      )}

      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {startIcon}
          </div>
        )}

        <Input
          id={id}
          type={inputType}
          disabled={disabled || loading}
          readOnly={readOnly}
          value={currentValue}
          onChange={handleChange}
          className={cn(
            'transition-colors',
            startIcon && 'pl-10',
            (endIcon || clearable || (isPassword && showPasswordToggle)) && 'pr-10',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {clearable && hasValue && !loading && !disabled && !readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
          )}

          {isPassword && showPasswordToggle && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}

          {endIcon && !loading && (
            <div className="text-muted-foreground">{endIcon}</div>
          )}
        </div>
      </div>

      {isPassword && currentValue && (
        <PasswordStrengthIndicator password={String(currentValue)} />
      )}

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
// EXPORTS
// ============================================================================

export default FormInput
