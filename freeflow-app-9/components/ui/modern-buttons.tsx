"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ReactNode, useState } from "react"
import { Loader2 } from "lucide-react"

/**
 * Modern Button Library - 2025 Best Practices
 * Premium CTAs with micro-interactions and accessibility
 */

// ============================================================================
// BASE BUTTON TYPES
// ============================================================================

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "success"
  | "gradient"

export type ButtonSize = "sm" | "md" | "lg" | "xl"

interface BaseButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  icon?: ReactNode
  iconPosition?: "left" | "right"
}

// ============================================================================
// PREMIUM BUTTON VARIANTS
// ============================================================================

/**
 * ModernButton - Base button with all 2025 features
 */
export function ModernButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  className,
  icon,
  iconPosition = "left",
}: BaseButtonProps) {
  const variantStyles = {
    primary: "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/30",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
    outline: "border-2 border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30",
    gradient: "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30",
  }

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative rounded-lg font-semibold",
        "transition-all duration-200",
        "focus:outline-none focus:ring-4 focus:ring-violet-500/30",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "flex items-center justify-center gap-2",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}

      {!loading && icon && iconPosition === "left" && icon}

      {children}

      {!loading && icon && iconPosition === "right" && icon}

      {/* Shine effect */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg"
          initial={{ x: "-100%", opacity: 0 }}
          whileHover={{
            x: "100%",
            opacity: 1,
            transition: { duration: 0.6 },
          }}
        />
      )}
    </motion.button>
  )
}

/**
 * GradientButton - Premium gradient CTA
 */
export function GradientButton({
  children,
  from = "violet",
  to = "purple",
  onClick,
  className,
  ...props
}: Omit<BaseButtonProps, "variant"> & {
  from?: string
  to?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative px-8 py-4 rounded-xl font-bold text-white",
        `bg-gradient-to-r from-${from}-600 to-${to}-600`,
        "shadow-2xl",
        "focus:outline-none focus:ring-4 focus:ring-violet-500/30",
        "overflow-hidden",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>

      {/* Animated gradient background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r from-${to}-600 to-${from}-600`}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.8 }}
      />
    </motion.button>
  )
}

/**
 * PillButton - Rounded pill-shaped button (2025 trend)
 */
export function PillButton({
  children,
  variant = "primary",
  onClick,
  className,
  ...props
}: BaseButtonProps) {
  const variantStyles = {
    primary: "bg-violet-600 text-white hover:bg-violet-700",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
    outline: "border-2 border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    gradient: "bg-gradient-to-r from-violet-600 to-purple-600 text-white",
  }

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "px-6 py-3 rounded-full font-semibold",
        "transition-all duration-200",
        "focus:outline-none focus:ring-4 focus:ring-violet-500/30",
        "shadow-lg",
        variantStyles[variant],
        className
      )}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/**
 * GlowButton - Button with animated glow effect
 */
export function GlowButton({
  children,
  color = "violet",
  onClick,
  className,
}: {
  children: ReactNode
  color?: "violet" | "blue" | "green" | "pink"
  onClick?: () => void
  className?: string
}) {
  const colorStyles = {
    violet: "bg-violet-600 shadow-violet-500/50",
    blue: "bg-blue-600 shadow-blue-500/50",
    green: "bg-green-600 shadow-green-500/50",
    pink: "bg-pink-600 shadow-pink-500/50",
  }

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative px-8 py-4 rounded-xl font-bold text-white",
        colorStyles[color],
        "focus:outline-none",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        boxShadow: [
          `0 0 20px ${colorStyles[color].split(" ")[1]}`,
          `0 0 40px ${colorStyles[color].split(" ")[1]}`,
          `0 0 20px ${colorStyles[color].split(" ")[1]}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.button>
  )
}

/**
 * ExpandButton - Button that expands on hover
 */
export function ExpandButton({
  children,
  expandedText,
  onClick,
  className,
}: {
  children: ReactNode
  expandedText: string
  onClick?: () => void
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "relative px-6 py-3 rounded-xl font-semibold",
        "bg-gradient-to-r from-violet-600 to-purple-600 text-white",
        "overflow-hidden",
        "focus:outline-none focus:ring-4 focus:ring-violet-500/30",
        className
      )}
      animate={{
        width: isExpanded ? "auto" : "auto",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div className="flex items-center gap-2">
        {children}
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="whitespace-nowrap overflow-hidden"
        >
          {expandedText}
        </motion.span>
      </motion.div>
    </motion.button>
  )
}

/**
 * IconButton - Button with just an icon (48x48px minimum)
 */
export function IconButton({
  icon,
  onClick,
  variant = "ghost",
  size = "md",
  className,
  ariaLabel,
}: {
  icon: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  ariaLabel: string
}) {
  const variantStyles = {
    primary: "bg-violet-600 text-white hover:bg-violet-700",
    secondary: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    outline: "border-2 border-gray-300 hover:border-violet-600 hover:text-violet-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    gradient: "bg-gradient-to-r from-violet-600 to-purple-600 text-white",
  }

  const sizeStyles = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
    xl: "p-5",
  }

  return (
    <motion.button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "rounded-lg",
        "transition-all duration-200",
        "focus:outline-none focus:ring-4 focus:ring-violet-500/30",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {icon}
    </motion.button>
  )
}

/**
 * ButtonGroup - Group of related buttons
 */
export function ButtonGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex gap-3", className)}>
      {children}
    </div>
  )
}

/**
 * SplitButton - Button with dropdown action
 */
export function SplitButton({
  mainLabel,
  mainAction,
  dropdownItems,
  className,
}: {
  mainLabel: string
  mainAction: () => void
  dropdownItems: Array<{ label: string; onClick: () => void }>
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn("relative inline-flex", className)}>
      <motion.button
        onClick={mainAction}
        className="px-6 py-3 rounded-l-xl font-semibold bg-violet-600 text-white hover:bg-violet-700"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {mainLabel}
      </motion.button>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-3 rounded-r-xl border-l border-violet-700 bg-violet-600 text-white hover:bg-violet-700"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        ▼
      </motion.button>

      {isOpen && (
        <motion.div
          className="absolute top-full right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-xl z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {dropdownItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick()
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage:
 *
 * ```tsx
 * // Modern button
 * <ModernButton variant="primary" size="lg">
 *   Get Started
 * </ModernButton>
 *
 * // Gradient button
 * <GradientButton from="violet" to="pink">
 *   Premium CTA
 * </GradientButton>
 *
 * // Pill button
 * <PillButton variant="primary">
 *   Explore Features
 * </PillButton>
 *
 * // Glow button
 * <GlowButton color="violet">
 *   Buy Now
 * </GlowButton>
 *
 * // Expand button
 * <ExpandButton expandedText="Click me!">
 *   <Sparkles />
 * </ExpandButton>
 *
 * // Icon button
 * <IconButton
 *   icon={<Heart />}
 *   ariaLabel="Like"
 *   variant="ghost"
 * />
 *
 * // Button group
 * <ButtonGroup>
 *   <ModernButton variant="primary">Save</ModernButton>
 *   <ModernButton variant="secondary">Cancel</ModernButton>
 * </ButtonGroup>
 *
 * // Split button
 * <SplitButton
 *   mainLabel="Save"
 *   mainAction={() => console.log("Save")}
 *   dropdownItems={[
 *     { label: "Save & Exit", onClick: () => {} },
 *     { label: "Save as Draft", onClick: () => {} },
 *   ]}
 * />
 * ```
 */
