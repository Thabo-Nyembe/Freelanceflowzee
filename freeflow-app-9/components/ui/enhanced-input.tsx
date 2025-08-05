'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'underlined'
  inputSize?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: boolean
  helperText?: string
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    type = 'text',
    variant = 'default',
    inputSize = 'md',
    leftIcon,
    rightIcon,
    error = false,
    helperText,
    ...props 
  }, ref) => {
    const variants = {
      default: 'input-enhanced',
      filled: 'bg-gray-100 dark:bg-gray-800 border-0 focus:bg-white dark:focus:bg-gray-700',
      underlined: 'bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 rounded-none focus:border-blue-500 dark:focus:border-blue-400'
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg'
    }

    const inputClasses = cn(
      variants[variant],
      sizes[inputSize],
      error && 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    )

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {rightIcon}
          </div>
        )}
        {helperText && (
          <p className={cn(
            'mt-1 text-xs',
            error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
EnhancedInput.displayName = 'EnhancedInput'

export { EnhancedInput }