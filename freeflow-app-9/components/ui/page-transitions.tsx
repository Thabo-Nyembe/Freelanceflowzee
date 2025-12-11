"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

/**
 * Page Transitions System - A+++ UI/UX
 * Smooth, professional page transitions for Next.js App Router
 */

// ============================================================================
// TRANSITION VARIANTS
// ============================================================================

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const slideUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const slideRightVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

const rotateVariants = {
  initial: { opacity: 0, rotateX: -15 },
  animate: { opacity: 1, rotateX: 0 },
  exit: { opacity: 0, rotateX: 15 },
}

const blurVariants = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(10px)" },
}

const flipVariants = {
  initial: { opacity: 0, rotateY: -90 },
  animate: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: 90 },
}

const bounceVariants = {
  initial: { opacity: 0, y: -100 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
  exit: { opacity: 0, y: 100 },
}

// ============================================================================
// MAIN PAGE TRANSITION COMPONENT
// ============================================================================

export type TransitionType =
  | "fade"
  | "slide-up"
  | "slide-right"
  | "scale"
  | "rotate"
  | "blur"
  | "flip"
  | "bounce"

interface PageTransitionProps {
  children: ReactNode
  type?: TransitionType
  duration?: number
  className?: string
}

/**
 * PageTransition - Wraps page content with smooth transitions
 *
 * Usage in app/layout.tsx or page.tsx:
 * ```tsx
 * <PageTransition type="fade">
 *   {children}
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  type = "fade",
  duration = 0.3,
  className,
}: PageTransitionProps) {
  const pathname = usePathname()

  const variantMap = {
    fade: fadeVariants,
    "slide-up": slideUpVariants,
    "slide-right": slideRightVariants,
    scale: scaleVariants,
    rotate: rotateVariants,
    blur: blurVariants,
    flip: flipVariants,
    bounce: bounceVariants,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variantMap[type]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          ease: "easeInOut",
        }}
        className={cn("w-full", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// SPECIALIZED TRANSITIONS
// ============================================================================

/**
 * FadeTransition - Simple fade in/out
 */
export function FadeTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <PageTransition type="fade" className={className}>
      {children}
    </PageTransition>
  )
}

/**
 * SlideTransition - Slide up effect
 */
export function SlideTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <PageTransition type="slide-up" duration={0.4} className={className}>
      {children}
    </PageTransition>
  )
}

/**
 * ScaleTransition - Scale effect
 */
export function ScaleTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <PageTransition type="scale" duration={0.3} className={className}>
      {children}
    </PageTransition>
  )
}

// ============================================================================
// ROUTE-BASED TRANSITIONS
// ============================================================================

/**
 * RouteTransition - Automatically determines transition based on route
 *
 * Usage:
 * ```tsx
 * <RouteTransition>
 *   {children}
 * </RouteTransition>
 * ```
 */
export function RouteTransition({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname()

  // Determine transition based on route patterns
  const getTransitionType = (): TransitionType => {
    // Dashboard pages: fade
    if (pathname?.startsWith("/dashboard")) return "fade"

    // Marketing pages: slide-up
    if (pathname === "/" || pathname?.startsWith("/features")) return "slide-up"

    // Settings/forms: scale
    if (pathname?.includes("/settings") || pathname?.includes("/edit")) return "scale"

    // Auth pages: blur
    if (pathname?.includes("/login") || pathname?.includes("/signup")) return "blur"

    // Default: fade
    return "fade"
  }

  return (
    <PageTransition type={getTransitionType()} className={className}>
      {children}
    </PageTransition>
  )
}

// ============================================================================
// MODAL/DIALOG TRANSITIONS
// ============================================================================

interface ModalTransitionProps {
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
  className?: string
  overlayClassName?: string
}

/**
 * ModalTransition - Smooth modal/dialog transitions
 */
export function ModalTransition({
  children,
  isOpen,
  onClose,
  className,
  overlayClassName,
}: ModalTransitionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className={cn(
              "fixed inset-0 bg-black/50 backdrop-blur-sm z-40",
              overlayClassName
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
              "max-w-2xl w-full max-h-[90vh] overflow-auto",
              "bg-card rounded-2xl border border-border shadow-2xl",
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-50%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// SIDEBAR TRANSITIONS
// ============================================================================

interface SidebarTransitionProps {
  children: ReactNode
  isOpen: boolean
  side?: "left" | "right"
  className?: string
}

/**
 * SidebarTransition - Smooth sidebar slide-in/out
 */
export function SidebarTransition({
  children,
  isOpen,
  side = "right",
  className,
}: SidebarTransitionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-y-0 w-80 bg-card border-border shadow-2xl z-50",
            side === "left" ? "left-0 border-r" : "right-0 border-l",
            className
          )}
          initial={{ x: side === "left" ? "-100%" : "100%" }}
          animate={{ x: 0 }}
          exit={{ x: side === "left" ? "-100%" : "100%" }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// DROPDOWN TRANSITIONS
// ============================================================================

interface DropdownTransitionProps {
  children: ReactNode
  isOpen: boolean
  className?: string
}

/**
 * DropdownTransition - Smooth dropdown animations
 */
export function DropdownTransition({
  children,
  isOpen,
  className,
}: DropdownTransitionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "absolute mt-2 rounded-lg border border-border bg-card shadow-xl",
            "overflow-hidden",
            className
          )}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// LIST ITEM TRANSITIONS
// ============================================================================

interface ListItemTransitionProps {
  children: ReactNode
  index: number
  className?: string
}

/**
 * ListItemTransition - Stagger animation for list items
 */
export function ListItemTransition({
  children,
  index,
  className,
}: ListItemTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05, // Stagger effect
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// TAB TRANSITIONS
// ============================================================================

interface TabTransitionProps {
  children: ReactNode
  activeTab: string | number
  className?: string
}

/**
 * TabTransition - Smooth tab content switching
 */
export function TabTransition({
  children,
  activeTab,
  className,
}: TabTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        className={className}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// NOTIFICATION/ALERT TRANSITIONS
// ============================================================================

interface AlertTransitionProps {
  children: ReactNode
  isVisible: boolean
  className?: string
}

/**
 * AlertTransition - Slide-in alert/notification
 */
export function AlertTransition({
  children,
  isVisible,
  className,
}: AlertTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 400,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// LOADING OVERLAY TRANSITION
// ============================================================================

/**
 * LoadingOverlay - Full-page loading transition
 */
export function LoadingOverlay({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
          >
            <div className="h-16 w-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// SCROLL REVEAL TRANSITION
// ============================================================================

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * ScrollReveal - Reveals content on scroll into view
 */
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// HOVER CARD TRANSITION
// ============================================================================

/**
 * HoverCardTransition - Smooth hover card appearance
 */
export function HoverCardTransition({
  children,
  isOpen,
  className,
}: {
  children: ReactNode
  isOpen: boolean
  className?: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "absolute z-50 rounded-lg border border-border bg-card shadow-xl p-4",
            className
          )}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            duration: 0.15,
            ease: "easeOut",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage in app/layout.tsx:
 *
 * ```tsx
 * import { PageTransition } from "@/components/ui/page-transitions"
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PageTransition type="fade">
 *           {children}
 *         </PageTransition>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * Example modal usage:
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 *
 * <ModalTransition isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <div className="p-6">
 *     <h2>Modal Content</h2>
 *     <p>This is a modal with smooth transitions</p>
 *   </div>
 * </ModalTransition>
 * ```
 *
 * Example list with stagger:
 * ```tsx
 * {items.map((item, index) => (
 *   <ListItemTransition key={item.id} index={index}>
 *     <div>{item.name}</div>
 *   </ListItemTransition>
 * ))}
 * ```
 */
