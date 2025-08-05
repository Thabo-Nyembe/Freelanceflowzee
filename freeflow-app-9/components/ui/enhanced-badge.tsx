'use client'

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const enhancedBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'badge-enhanced',
        secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700',
        destructive: 'badge-danger border-transparent',
        success: 'badge-success border-transparent',
        warning: 'badge-warning border-transparent',
        info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-transparent',
        outline: 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100',
        kazi: 'kazi-gradient-primary text-white border-transparent'
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export interface EnhancedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedBadgeVariants> {
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

const EnhancedBadge = forwardRef<HTMLDivElement, EnhancedBadgeProps>(
  ({ className, variant, size, icon, removable, onRemove, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(enhancedBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
EnhancedBadge.displayName = 'EnhancedBadge'

export { EnhancedBadge, enhancedBadgeVariants }