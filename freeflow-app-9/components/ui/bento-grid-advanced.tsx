"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ReactNode } from "react"
import Image from "next/image"

// Default blur placeholder for background images
const DEFAULT_BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDBBEhABIxBQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8AyRU9NL06aKjqzBUxNulkZQWBJYEA+xYfPmtaKpqa6ljqqaZopozlHXkHTWk0w5JOp//Z"

/**
 * Advanced Bento Grid System - Groundbreaking 2025
 * Modular, asymmetric layouts for world-class dashboards
 * Based on Apple's design language and modern SaaS trends
 */

// ============================================================================
// BENTO GRID CONTAINER
// ============================================================================

interface BentoGridProps {
  children: ReactNode
  className?: string
  gap?: "sm" | "md" | "lg"
  columns?: 1 | 2 | 3 | 4
}

/**
 * BentoGrid - Main container with responsive grid
 */
export function BentoGrid({
  children,
  className,
  gap = "md",
  columns = 3,
}: BentoGridProps) {
  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  }

  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(150px,auto)]",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================================================
// BENTO CARD SIZES
// ============================================================================

export type BentoSize = "small" | "medium" | "large" | "wide" | "tall" | "hero"

interface BentoCardProps {
  children: ReactNode
  size?: BentoSize
  className?: string
  gradient?: "violet" | "blue" | "green" | "orange" | "pink" | "glass"
  hover?: boolean
  animate?: boolean
}

/**
 * BentoCard - Individual bento box with size variants
 */
export function BentoCard({
  children,
  size = "small",
  className,
  gradient,
  hover = true,
  animate = true,
}: BentoCardProps) {
  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 md:col-span-2 row-span-1",
    large: "col-span-1 md:col-span-2 row-span-2",
    wide: "col-span-1 md:col-span-2 lg:col-span-3 row-span-1",
    tall: "col-span-1 row-span-2",
    hero: "col-span-1 md:col-span-2 lg:col-span-3 row-span-2",
  }

  const gradientClasses = {
    violet: "bg-gradient-to-br from-violet-500/10 to-purple-500/10",
    blue: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
    green: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
    orange: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
    pink: "bg-gradient-to-br from-pink-500/10 to-rose-500/10",
    glass: "bg-white/5 backdrop-blur-xl",
  }

  const CardWrapper = animate ? motion.div : "div"

  return (
    <CardWrapper
      className={cn(
        "relative rounded-2xl border border-border bg-card",
        "overflow-hidden shadow-lg",
        sizeClasses[size],
        gradient && gradientClasses[gradient],
        hover && "transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
        className
      )}
      {...(animate && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      })}
    >
      {children}
    </CardWrapper>
  )
}

// ============================================================================
// BENTO CARD VARIANTS
// ============================================================================

/**
 * BentoStat - Stats card with icon and value
 */
export function BentoStat({
  icon,
  label,
  value,
  trend,
  trendValue,
  className,
}: {
  icon: ReactNode
  label: string
  value: string | number
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
}) {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  }

  return (
    <BentoCard size="small" className={className}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          </div>
          {trend && trendValue && (
            <div className={cn("text-sm font-semibold", trendColors[trend])}>
              {trend === "up" && "↑"} {trend === "down" && "↓"} {trendValue}
            </div>
          )}
        </div>

        <div>
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground mt-1">{label}</div>
        </div>
      </div>
    </BentoCard>
  )
}

/**
 * BentoHero - Large hero card with CTA
 */
export function BentoHero({
  title,
  description,
  image,
  action,
  className,
}: {
  title: string
  description: string
  image?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <BentoCard size="large" gradient="violet" className={className}>
      <div className="relative h-full">
        {image && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR_PLACEHOLDER}
              loading="lazy"
            />
          </div>
        )}

        <div className="relative h-full flex flex-col justify-between p-8">
          <div className="space-y-4">
            <motion.h2
              className="text-4xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>
          </div>

          {action && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {action}
            </motion.div>
          )}
        </div>
      </div>
    </BentoCard>
  )
}

/**
 * BentoChart - Chart display card
 */
export function BentoChart({
  title,
  subtitle,
  children,
  action,
  className,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <BentoCard size="wide" className={className}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {action}
        </div>

        <div className="h-64">{children}</div>
      </div>
    </BentoCard>
  )
}

/**
 * BentoList - List items card
 */
export function BentoList({
  title,
  items,
  className,
}: {
  title: string
  items: Array<{
    icon?: ReactNode
    title: string
    subtitle?: string
    value?: string
  }>
  className?: string
}) {
  return (
    <BentoCard size="medium" className={className}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-6">{title}</h3>

        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.icon && (
                <div className="flex-shrink-0 text-primary">{item.icon}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.title}</div>
                {item.subtitle && (
                  <div className="text-sm text-muted-foreground truncate">
                    {item.subtitle}
                  </div>
                )}
              </div>
              {item.value && (
                <div className="flex-shrink-0 font-semibold">{item.value}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </BentoCard>
  )
}

/**
 * BentoGallery - Image gallery card
 */
export function BentoGallery({
  images,
  className,
}: {
  images: Array<{ src: string; alt: string }>
  className?: string
}) {
  return (
    <BentoCard size="medium" className={cn("p-0", className)}>
      <div className="grid grid-cols-2 gap-0.5">
        {images.slice(0, 4).map((image, index) => (
          <motion.div
            key={index}
            className="relative aspect-square overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR_PLACEHOLDER}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </BentoCard>
  )
}

/**
 * BentoQuickAction - Quick action button card
 */
export function BentoQuickAction({
  icon,
  title,
  description,
  onClick,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  onClick?: () => void
  className?: string
}) {
  return (
    <BentoCard size="small" hover={false} className={className}>
      <motion.button
        onClick={onClick}
        className="w-full h-full p-6 text-left space-y-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
          {icon}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {description}
          </div>
        </div>
      </motion.button>
    </BentoCard>
  )
}

/**
 * BentoProgress - Progress tracking card
 */
export function BentoProgress({
  title,
  items,
  className,
}: {
  title: string
  items: Array<{
    label: string
    value: number
    total: number
    color?: string
  }>
  className?: string
}) {
  return (
    <BentoCard size="medium" className={className}>
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-semibold">{title}</h3>

        <div className="space-y-4">
          {items.map((item, index) => {
            const percentage = (item.value / item.total) * 100
            return (
              <motion.div
                key={index}
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {item.value}/{item.total}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      item.color || "bg-primary"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </BentoCard>
  )
}

// ============================================================================
// PRESET BENTO LAYOUTS
// ============================================================================

/**
 * BentoDashboardLayout - Complete dashboard layout
 */
export function BentoDashboardLayout({
  stats,
  hero,
  chart,
  list,
  quickActions,
}: {
  stats: ReactNode[]
  hero: ReactNode
  chart: ReactNode
  list: ReactNode
  quickActions: ReactNode[]
}) {
  return (
    <BentoGrid>
      {/* Hero section */}
      {hero}

      {/* Stats */}
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {stat}
        </motion.div>
      ))}

      {/* Chart */}
      {chart}

      {/* List */}
      {list}

      {/* Quick actions */}
      {quickActions.map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          {action}
        </motion.div>
      ))}
    </BentoGrid>
  )
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage:
 *
 * ```tsx
 * <BentoGrid columns={3} gap="md">
 *   <BentoHero
 *     size="large"
 *     title="Welcome to KAZI"
 *     description="Your all-in-one platform"
 *     action={<Button>Get Started</Button>}
 *   />
 *
 *   <BentoStat
 *     icon={<Users />}
 *     label="Total Users"
 *     value="12,543"
 *     trend="up"
 *     trendValue="+12%"
 *   />
 *
 *   <BentoChart
 *     title="Revenue Overview"
 *     subtitle="Last 30 days"
 *   >
 *     <ChartComponent />
 *   </BentoChart>
 *
 *   <BentoList
 *     title="Recent Activity"
 *     items={[
 *       { title: "New user signup", subtitle: "2 min ago" },
 *       { title: "Payment received", subtitle: "1 hour ago" },
 *     ]}
 *   />
 * </BentoGrid>
 * ```
 */
