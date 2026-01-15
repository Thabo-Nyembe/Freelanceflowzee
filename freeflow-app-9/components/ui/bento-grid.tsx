"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ReactNode } from "react"

/**
 * Bento Grid Component - 2025 UI/UX Trend
 * Modular, asymmetric grid layout inspired by Japanese bento boxes
 * Perfect for dashboards, feature showcases, and content displays
 */

interface BentoGridProps {
  children: ReactNode
  className?: string
}

interface BentoCardProps {
  title?: string
  description?: string
  icon?: ReactNode
  children?: ReactNode
  className?: string
  gradient?: "purple" | "blue" | "green" | "orange" | "pink"
  size?: "sm" | "md" | "lg" | "xl"
  interactive?: boolean
  href?: string
}

/**
 * BentoGrid - Container for Bento cards
 *
 * Usage:
 * ```tsx
 * <BentoGrid>
 *   <BentoCard size="lg" gradient="purple" />
 *   <BentoCard size="md" gradient="blue" />
 *   <BentoCard size="sm" gradient="green" />
 * </BentoGrid>
 * ```
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[192px] grid-cols-1 gap-4",
        "md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * BentoCard - Individual card in the Bento grid
 *
 * Features:
 * - Multiple size variants (sm, md, lg, xl)
 * - Gradient backgrounds
 * - Interactive hover effects
 * - Glassmorphism styling
 * - Smooth animations
 */
export function BentoCard({
  title,
  description,
  icon,
  children,
  className,
  gradient = "purple",
  size = "md",
  interactive = true,
  href,
}: BentoCardProps) {
  const sizeClasses = {
    sm: "md:col-span-1 md:row-span-1",
    md: "md:col-span-1 md:row-span-2",
    lg: "md:col-span-2 md:row-span-1",
    xl: "md:col-span-2 md:row-span-2",
  }

  const gradients = {
    purple: "from-violet-500/10 via-purple-500/5 to-transparent",
    blue: "from-blue-500/10 via-cyan-500/5 to-transparent",
    green: "from-green-500/10 via-emerald-500/5 to-transparent",
    orange: "from-orange-500/10 via-amber-500/5 to-transparent",
    pink: "from-pink-500/10 via-rose-500/5 to-transparent",
  }

  const CardComponent = motion.div

  return (
    <CardComponent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={interactive ? { scale: 1.02, y: -4 } : undefined}
      className={cn(
        // Base styles
        "group relative overflow-hidden rounded-3xl",
        "border border-border/40",
        "bg-card/50 backdrop-blur-xl",
        "p-6 transition-all duration-300",

        // Gradient overlay
        "before:absolute before:inset-0 before:-z-10",
        "before:bg-gradient-to-br",
        `before:${gradients[gradient]}`,

        // Interactive states
        interactive && [
          "cursor-pointer",
          "hover:border-border/60",
          "hover:shadow-2xl hover:shadow-primary/5",
        ],

        // Size variant
        sizeClasses[size],

        className
      )}
      onClick={href ? () => window.location.href = href : undefined}
    >
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-xl" />

      {/* Animated border gradient */}
      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br",
          gradients[gradient],
          "blur-xl"
        )} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        {(icon || title) && (
          <div className="flex items-start gap-3 mb-4">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            {title && (
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Custom content */}
        {children && (
          <div className="flex-1 flex flex-col justify-center">
            {children}
          </div>
        )}
      </div>

      {/* Shine effect on hover */}
      {interactive && (
        <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}
    </CardComponent>
  )
}

/**
 * BentoMetric - Specialized Bento card for displaying metrics
 */
interface BentoMetricProps {
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: ReactNode
  className?: string
  gradient?: "purple" | "blue" | "green" | "orange" | "pink"
}

export function BentoMetric({
  label,
  value,
  change,
  trend = "neutral",
  icon,
  className,
  gradient = "blue",
}: BentoMetricProps) {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  }

  const trendIcons = {
    up: "↗",
    down: "↘",
    neutral: "→",
  }

  return (
    <BentoCard size="sm" gradient={gradient} className={className}>
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>

        <div className="mt-2">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={cn("text-sm font-medium mt-1", trendColors[trend])}>
              <span className="mr-1">{trendIcons[trend]}</span>
              {change}
            </p>
          )}
        </div>
      </div>
    </BentoCard>
  )
}

/**
 * BentoFeature - Specialized Bento card for feature highlights
 */
interface BentoFeatureProps {
  title: string
  description: string
  icon: ReactNode
  image?: string
  className?: string
  gradient?: "purple" | "blue" | "green" | "orange" | "pink"
  size?: "md" | "lg" | "xl"
}

export function BentoFeature({
  title,
  description,
  icon,
  image,
  className,
  gradient = "purple",
  size = "lg",
}: BentoFeatureProps) {
  return (
    <BentoCard
      title={title}
      description={description}
      icon={icon}
      gradient={gradient}
      size={size}
      className={className}
    >
      {image && (
        <div className="mt-4 rounded-xl overflow-hidden border border-border/20">
          <img src={image}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy" />
        </div>
      )}
    </BentoCard>
  )
}
