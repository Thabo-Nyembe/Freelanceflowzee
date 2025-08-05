'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered'
  hover?: boolean
  children: React.ReactNode
}

interface EnhancedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface EnhancedCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface EnhancedCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    const variants = {
      default: 'card-enhanced',
      glass: 'glass-card',
      elevated: 'card-enhanced shadow-2xl',
      bordered: 'card-enhanced border-2'
    }

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          hover && 'hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EnhancedCard.displayName = 'EnhancedCard'

const EnhancedCardHeader = forwardRef<HTMLDivElement, EnhancedCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 p-6 pb-4',
        'text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
EnhancedCardHeader.displayName = 'EnhancedCardHeader'

const EnhancedCardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        'text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
)
EnhancedCardTitle.displayName = 'EnhancedCardTitle'

const EnhancedCardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-muted-foreground',
        'text-gray-600 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
)
EnhancedCardDescription.displayName = 'EnhancedCardDescription'

const EnhancedCardContent = forwardRef<HTMLDivElement, EnhancedCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'p-6 pt-0',
        'text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
EnhancedCardContent.displayName = 'EnhancedCardContent'

const EnhancedCardFooter = forwardRef<HTMLDivElement, EnhancedCardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center p-6 pt-0',
        'text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
EnhancedCardFooter.displayName = 'EnhancedCardFooter'

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter
}