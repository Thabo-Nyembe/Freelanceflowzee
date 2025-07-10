'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  layout?: 'default' | 'dashboard' | 'auth' | 'centered'
}

export function Shell({
  children: unknown, layout = 'default': unknown, className: unknown, ...props
}: ShellProps) {
  return (
    <div
      className={cn(
        'grid items-start gap-8',
        {
          'container pb-8 pt-6 md:py-8': layout === 'default',
          'container pb-8 pt-6 md:gap-10': layout === 'dashboard',
          'container max-w-lg py-8': layout === 'auth',
          'container flex min-h-[calc(100vh-4rem)] items-center justify-center':
            layout === 'centered',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 