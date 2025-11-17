'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  Eye, 
  EyeOff,
  Save,
  Clock,
  Zap,
  Shield,
  HelpCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ValidationRule {
  id: string
  message: string
  type: 'error' | 'warning' | 'info'
  validator: (value: string) => boolean
}

interface FieldState {
  value: string
  isDirty: boolean
  isTouched: boolean
  isValidating: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  strength?: number
}

interface EnhancedFieldProps {
  id: string
  label: string
  type?: 'text' | 'email' | 'password' | 'textarea' | 'url' | 'tel'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  validationRules?: ValidationRule[]
  showStrength?: boolean
  showSuggestions?: boolean
  enableAutoSave?: boolean
  autoSaveDelay?: number
  required?: boolean
  disabled?: boolean
  className?: string
  helpText?: string
  maxLength?: number
  minLength?: number
}

// Common validation rules
const commonRules = {
  email: {
    id: 'email',
    message: 'Please enter a valid email address',
    type: 'error' as const,
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  minLength: (min: number) => ({
    id: 'minLength',
    message: `Must be at least ${min} characters long`,
    type: 'error' as const,
    validator: (value: string) => value.length >= min
  }),
  maxLength: (max: number) => ({
    id: 'maxLength',
    message: `Must be no more than ${max} characters`,
    type: 'error' as const,
    validator: (value: string) => value.length <= max
  }),
  required: {
    id: 'required',
    message: 'This field is required',
    type: 'error' as const,
    validator: (value: string) => value.trim().length > 0
  },
  url: {
    id: 'url',
    message: 'Please enter a valid URL',
    type: 'error' as const,
    validator: (value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }
  },
  phone: {
    id: 'phone',
    message: 'Please enter a valid phone number',
    type: 'error' as const,
    validator: (value: string) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))
  }
}

// Password strength calculation
const calculatePasswordStrength = (password: string): { score: number; feedback: string[] } => {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) score += 20
  else feedback.push('Use at least 8 characters')

  if (/[a-z]/.test(password)) score += 20
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score += 20
  else feedback.push('Add uppercase letters')

  if (/[0-9]/.test(password)) score += 20
  else feedback.push('Add numbers')

  if (/[^A-Za-z0-9]/.test(password)) score += 20
  else feedback.push('Add special characters')

  return { score, feedback }
}

export function EnhancedField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  validationRules = [],
  showStrength = false,
  showSuggestions = true,
  enableAutoSave = false,
  autoSaveDelay = 2000,
  required = false,
  disabled = false,
  className,
  helpText,
  maxLength,
  minLength
}: EnhancedFieldProps) {
  const [fieldState, setFieldState] = React.useState<FieldState>({
    value,
    isDirty: false,
    isTouched: false,
    isValidating: false,
    errors: [],
    warnings: [],
    suggestions: []
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const autoSaveTimeout = React.useRef<NodeJS.Timeout>()

  // Build validation rules
  const rules = React.useMemo(() => {
    const allRules = [...validationRules]
    
    if (required) allRules.push(commonRules.required)
    if (type === 'email') allRules.push(commonRules.email)
    if (type === 'url') allRules.push(commonRules.url)
    if (type === 'tel') allRules.push(commonRules.phone)
    if (minLength) allRules.push(commonRules.minLength(minLength))
    if (maxLength) allRules.push(commonRules.maxLength(maxLength))
    
    return allRules
  }, [validationRules, required, type, minLength, maxLength])

  // Validate field
  const validateField = React.useCallback(async (val: string) => {
    setFieldState(prev => ({ ...prev, isValidating: true }))

    // Simulate async validation delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    rules.forEach(rule => {
      if (!rule.validator(val)) {
        if (rule.type === 'error') {
          errors.push(rule.message)
        } else if (rule.type === 'warning') {
          warnings.push(rule.message)
        }
      }
    })

    // Add suggestions for common improvements
    if (showSuggestions && val.trim()) {
      if (type === 'email' && val.includes(' ')) {
        suggestions.push('Remove spaces from email address')
      }
      if (type === 'password' && val.length > 0 && val.length < 8) {
        suggestions.push('Consider using a longer password for better security')
      }
      if (type === 'text' && val.toLowerCase() === val && val.length > 10) {
        suggestions.push('Consider using proper capitalization')
      }
    }

    let strength = 0
    if (showStrength && type === 'password') {
      strength = calculatePasswordStrength(val).score
    }

    setFieldState(prev => ({
      ...prev,
      isValidating: false,
      errors,
      warnings,
      suggestions,
      strength
    }))
  }, [rules, showSuggestions, showStrength, type])

  // Handle value change
  const handleChange = React.useCallback((newValue: string) => {
    onChange(newValue)
    setFieldState(prev => ({
      ...prev,
      value: newValue,
      isDirty: true
    }))

    // Auto-save logic
    if (enableAutoSave) {
      setAutoSaveStatus('idle')
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }
      
      autoSaveTimeout.current = setTimeout(async () => {
        setAutoSaveStatus('saving')
        try {
          // Simulate auto-save
          await new Promise(resolve => setTimeout(resolve, 500))
          setAutoSaveStatus('saved')
          setTimeout(() => setAutoSaveStatus('idle'), 2000)
        } catch {
          setAutoSaveStatus('error')
          setTimeout(() => setAutoSaveStatus('idle'), 3000)
        }
      }, autoSaveDelay)
    }

    // Validate on change if field is touched
    if (fieldState.isTouched) {
      validateField(newValue)
    }
  }, [onChange, enableAutoSave, autoSaveDelay, fieldState.isTouched, validateField])

  // Handle blur
  const handleBlur = React.useCallback(() => {
    setFieldState(prev => ({ ...prev, isTouched: true }))
    validateField(value)
    onBlur?.()
  }, [value, validateField, onBlur])

  const hasErrors = fieldState.errors.length > 0
  const hasWarnings = fieldState.warnings.length > 0
  const isValid = !hasErrors && fieldState.isTouched

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500'
    if (strength < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength < 40) return 'Weak'
    if (strength < 70) return 'Medium'
    return 'Strong'
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        {/* Label */}
        <div className="flex items-center justify-between">
          <label 
            htmlFor={id}
            className={cn(
              "text-sm font-medium",
              hasErrors ? "text-red-600" : "text-gray-700 dark:text-gray-300"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          <div className="flex items-center space-x-2">
            {/* Auto-save status */}
            {enableAutoSave && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-1"
              >
                {autoSaveStatus === 'saving' && (
                  <>
                    <Clock className="h-3 w-3 text-blue-500 animate-spin" />
                    <span className="text-xs text-blue-600">Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Saved</span>
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <X className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">Save failed</span>
                  </>
                )}
              </motion.div>
            )}

            {/* Help tooltip */}
            {helpText && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-0">
                    <HelpCircle className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{helpText}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Character count */}
            {maxLength && (
              <span className={cn(
                "text-xs",
                value.length > maxLength * 0.9 ? "text-orange-600" : "text-gray-500"
              )}>
                {value.length}/{maxLength}
              </span>
            )}
          </div>
        </div>

        {/* Input field */}
        <div className="relative">
          {type === 'textarea' ? (
            <Textarea
              id={id}
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              disabled={disabled}
              className={cn(
                "transition-all duration-200",
                hasErrors && "border-red-500 focus:border-red-500 focus:ring-red-500",
                isValid && "border-green-500 focus:border-green-500 focus:ring-green-500",
                fieldState.isValidating && "opacity-75"
              )}
              data-testid={`enhanced-field-${id}`}
            />
          ) : (
            <Input
              id={id}
              type={type === 'password' && showPassword ? 'text' : type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              disabled={disabled}
              className={cn(
                "transition-all duration-200",
                hasErrors && "border-red-500 focus:border-red-500 focus:ring-red-500",
                isValid && "border-green-500 focus:border-green-500 focus:ring-green-500",
                fieldState.isValidating && "opacity-75",
                type === 'password' && "pr-10"
              )}
              data-testid={`enhanced-field-${id}`}
            />
          )}

          {/* Field status icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {fieldState.isValidating && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            
            {!fieldState.isValidating && isValid && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            
            {!fieldState.isValidating && hasErrors && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}

            {type === 'password' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="h-auto p-0"
                data-testid={`password-toggle-${id}`}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Password strength meter */}
        {showStrength && type === 'password' && value && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Password strength</span>
              <span className={cn(
                "text-xs font-medium",
                fieldState.strength! < 40 ? "text-red-600" :
                fieldState.strength! < 70 ? "text-yellow-600" : "text-green-600"
              )}>
                {getStrengthText(fieldState.strength!)}
              </span>
            </div>
            <Progress 
              value={fieldState.strength} 
              className={cn(
                "h-2",
                getStrengthColor(fieldState.strength!)
              )}
            />
            {fieldState.strength! < 100 && (
              <div className="text-xs text-gray-600">
                {calculatePasswordStrength(value).feedback.slice(0, 2).join(', ')}
              </div>
            )}
          </motion.div>
        )}

        {/* Validation messages */}
        <AnimatePresence>
          {(hasErrors || hasWarnings || fieldState.suggestions.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1"
            >
              {/* Errors */}
              {fieldState.errors.map((error, index) => (
                <motion.div
                  key={`error-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-sm text-red-600"
                >
                  <X className="h-3 w-3 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              ))}

              {/* Warnings */}
              {fieldState.warnings.map((warning, index) => (
                <motion.div
                  key={`warning-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-sm text-yellow-600"
                >
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span>{warning}</span>
                </motion.div>
              ))}

              {/* Suggestions */}
              {!hasErrors && fieldState.suggestions.map((suggestion, index) => (
                <motion.div
                  key={`suggestion-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-sm text-blue-600"
                >
                  <Info className="h-3 w-3 flex-shrink-0" />
                  <span>{suggestion}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}

// Form progress component
interface FormProgressProps {
  fields: { id: string; required: boolean; isValid: boolean }[]
  className?: string
}

export function FormProgress({ fields, className }: FormProgressProps) {
  const totalRequired = fields.filter(f => f.required).length
  const completedRequired = fields.filter(f => f.required && f.isValid).length
  const progress = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Form Progress</span>
        <span className="text-sm text-gray-600">
          {completedRequired}/{totalRequired} required fields
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {progress < 100 ? `${Math.round(progress)}% complete` : 'All required fields completed'}
        </span>
        {progress === 100 && (
          <Badge variant="default" className="text-xs">
            <Check className="h-3 w-3 mr-1" />
            Ready to submit
          </Badge>
        )}
      </div>
    </div>
  )
}

export { commonRules, calculatePasswordStrength }
