'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface KaziLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function KaziLoading({ size = 'md', className, text }: KaziLoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-violet-bolt/20"></div>
        
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-bolt border-r-electric-turquoise animate-spin"></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-2 rounded-full bg-violet-bolt animate-pulse"></div>
      </div>
      
      {text && (
        <p className={cn('kazi-body-medium kazi-text-dark dark:kazi-text-light animate-pulse', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )
}

export function KaziLoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="w-2 h-2 bg-violet-bolt rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-violet-bolt rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-electric-turquoise rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  )
}

export function KaziLoadingBar({ progress, className }: { progress: number; className?: string }) {
  return (
    <div className={cn('w-full bg-violet-bolt/10 dark:bg-violet-bolt/20 rounded-full h-2', className)}>
      <div 
        className="h-2 kazi-gradient-primary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  )
}

export function KaziLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="kazi-bg-light dark:kazi-bg-dark rounded-lg h-4 w-full mb-2"></div>
      <div className="kazi-bg-light dark:kazi-bg-dark rounded-lg h-4 w-3/4 mb-2"></div>
      <div className="kazi-bg-light dark:kazi-bg-dark rounded-lg h-4 w-1/2"></div>
    </div>
  )
}