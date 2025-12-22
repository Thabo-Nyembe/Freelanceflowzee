'use client'

import { ReactNode } from 'react'

interface PillButtonProps {
  label?: string
  children?: ReactNode
  isActive?: boolean
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'default'
}

export default function PillButton({ label, children, isActive = false, onClick, variant = 'primary' }: PillButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border'

  const variantClasses = isActive
    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent shadow-lg shadow-blue-500/30'
    : variant === 'outline'
    ? 'bg-transparent border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-blue-500/50'

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children || label}
    </button>
  )
}
