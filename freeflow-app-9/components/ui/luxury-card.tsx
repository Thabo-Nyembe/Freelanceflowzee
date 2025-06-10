'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface LuxuryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "premium" | "minimal"
  size?: "sm" | "md" | "lg" | "xl"
  gradient?: "rose" | "violet" | "blue" | "emerald" | "amber" | "slate"
  blur?: boolean
  hover?: boolean
}

const LuxuryCard = React.forwardRef<HTMLDivElement, LuxuryCardProps>(
  ({ className, variant = "default", size = "md", gradient, blur = true, hover = true, ...props }, ref) => {
    const baseClasses = "rounded-3xl border transition-all duration-500"
    
    const variantClasses = {
      default: "bg-white/60 backdrop-blur-xl border-white/30 shadow-xl shadow-black/5",
      glass: "bg-white/40 backdrop-blur-2xl border-white/20 shadow-2xl shadow-black/10",
      premium: "bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl shadow-black/8",
      minimal: "bg-white/80 backdrop-blur-md border-slate-200/50 shadow-lg shadow-black/3"
    }

    const sizeClasses = {
      sm: "p-4",
      md: "p-6", 
      lg: "p-8",
      xl: "p-12"
    }

    const gradientClasses = gradient ? {
      rose: "bg-gradient-to-br from-rose-50/80 to-pink-50/60",
      violet: "bg-gradient-to-br from-violet-50/80 to-purple-50/60", 
      blue: "bg-gradient-to-br from-blue-50/80 to-indigo-50/60",
      emerald: "bg-gradient-to-br from-emerald-50/80 to-teal-50/60",
      amber: "bg-gradient-to-br from-amber-50/80 to-orange-50/60",
      slate: "bg-gradient-to-br from-slate-50/80 to-gray-50/60"
    }[gradient] : ""

    const hoverClasses = hover ? "hover:shadow-3xl hover:scale-[1.02] hover:border-white/50" : ""
    const blurClasses = blur ? "backdrop-blur-xl" : ""

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          gradientClasses,
          hoverClasses,
          blurClasses,
          className
        )}
        {...props}
      />
    )
  }
)
LuxuryCard.displayName = "LuxuryCard"

interface LuxuryCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  centered?: boolean
}

const LuxuryCardHeader = React.forwardRef<HTMLDivElement, LuxuryCardHeaderProps>(
  ({ className, centered = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "space-y-2 pb-6",
        centered && "text-center",
        className
      )}
      {...props}
    />
  )
)
LuxuryCardHeader.displayName = "LuxuryCardHeader"

const LuxuryCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-light text-slate-800 tracking-tight leading-none",
        className
      )}
      {...props}
    />
  )
)
LuxuryCardTitle.displayName = "LuxuryCardTitle"

const LuxuryCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-slate-600 font-light leading-relaxed", className)}
      {...props}
    />
  )
)
LuxuryCardDescription.displayName = "LuxuryCardDescription"

const LuxuryCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props} />
  )
)
LuxuryCardContent.displayName = "LuxuryCardContent"

const LuxuryCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between pt-6", className)}
      {...props}
    />
  )
)
LuxuryCardFooter.displayName = "LuxuryCardFooter"

export { 
  LuxuryCard, 
  LuxuryCardHeader, 
  LuxuryCardFooter, 
  LuxuryCardTitle, 
  LuxuryCardDescription, 
  LuxuryCardContent 
} 