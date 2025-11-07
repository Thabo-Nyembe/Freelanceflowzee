'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface KaziIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'default' | 'outline' | 'minimal'
}

export function KaziIcon({ size = 'md', className, variant = 'default' }: KaziIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const variantClasses = {
    default: 'kazi-gradient-primary text-soft-ivory',
    outline: 'border-2 border-violet-bolt kazi-text-primary bg-transparent',
    minimal: 'bg-violet-bolt/10 dark:bg-violet-bolt/20 kazi-text-primary'
  }

  return (
    <div className={cn(
      'rounded-lg flex items-center justify-center font-bold kazi-headline transition-all duration-300',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      K
    </div>
  )
}

export function KaziLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <KaziIcon size="md" />
      <span className="kazi-headline text-xl kazi-text-dark dark:kazi-text-light">
        KAZI
      </span>
    </div>
  )
}

export function KaziWordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <span className="kazi-headline text-2xl kazi-text-primary">K</span>
      <span className="kazi-headline text-2xl kazi-text-accent">A</span>
      <span className="kazi-headline text-2xl kazi-text-primary">Z</span>
      <span className="kazi-headline text-2xl kazi-text-accent">I</span>
    </div>
  )
}