"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ReactNode, useState } from "react"
import {
  Sparkles,
  Brain,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Code,
  Play,
  Copy,
  Check,
} from "lucide-react"

/**
 * AI Components Library - Groundbreaking 2025
 * AI Sandboxes, Thinking States, Results Display
 */

// ============================================================================
// AI THINKING/LOADING STATES
// ============================================================================

interface AIThinkingProps {
  variant?: "pulse" | "wave" | "brain" | "sparkles"
  message?: string
  className?: string
}

/**
 * AIThinking - Animated AI processing indicator
 */
export function AIThinking({
  variant = "pulse",
  message = "AI is thinking...",
  className,
}: AIThinkingProps) {
  if (variant === "pulse") {
    return (
      <motion.div
        className={cn("flex items-center gap-3", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="relative w-8 h-8"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 bg-violet-600 rounded-full opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-5 h-5 text-violet-600" />
          </div>
        </motion.div>
        <motion.p
          className="text-sm text-muted-foreground"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {message}
        </motion.p>
      </motion.div>
    )
  }

  if (variant === "wave") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-6 bg-violet-600 rounded-full"
              animate={{
                scaleY: [1, 2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    )
  }

  if (variant === "brain") {
    return (
      <div className={cn("flex flex-col items-center gap-3 p-6", className)}>
        <motion.div
          className="relative"
          animate={{ rotateY: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-12 h-12 text-violet-600" />
          <motion.div
            className="absolute inset-0 bg-violet-600/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <p className="text-sm font-medium">{message}</p>
      </div>
    )
  }

  // sparkles variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-5 h-5 text-violet-600" />
      </motion.div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

/**
 * AIStreamingText - Typewriter effect for AI responses
 */
export function AIStreamingText({
  text,
  speed = 50,
  className,
  onComplete,
}: {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useState(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  })

  return (
    <motion.div
      className={cn("font-mono", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayedText}
      <motion.span
        className="inline-block w-0.5 h-4 bg-violet-600 ml-0.5"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </motion.div>
  )
}

// ============================================================================
// AI SANDBOX/PLAYGROUND
// ============================================================================

interface AISandboxProps {
  title?: string
  description?: string
  code: string
  language?: string
  onRun?: (code: string) => Promise<string>
  className?: string
}

/**
 * AISandbox - Interactive code playground with AI
 */
export function AISandbox({
  title = "AI Playground",
  description,
  code: initialCode,
  language = "javascript",
  onRun,
  className,
}: AISandboxProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleRun = async () => {
    if (!onRun) return

    setIsRunning(true)
    setOutput("")

    try {
      const result = await onRun(code)
      setOutput(result)
    } catch (error) {
      setOutput(`Error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {onRun && (
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium",
                  "bg-violet-600 text-white",
                  "hover:bg-violet-700 transition-colors",
                  "flex items-center gap-2",
                  isRunning && "opacity-50 cursor-not-allowed"
                )}
              >
                {isRunning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-muted text-xs font-mono">
          {language}
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={cn(
            "w-full p-6 font-mono text-sm",
            "bg-transparent border-0 resize-none",
            "focus:outline-none focus:ring-0",
            "min-h-[300px]"
          )}
          spellCheck={false}
        />
      </div>

      {/* Output */}
      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="px-6 py-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold">Output</span>
              </div>
              <pre className="text-sm font-mono overflow-x-auto">{output}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// AI RESULTS DISPLAY
// ============================================================================

interface AIResultProps {
  status: "success" | "error" | "warning" | "processing"
  title: string
  message: string
  details?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * AIResult - Beautiful results display for AI operations
 */
export function AIResult({
  status,
  title,
  message,
  details,
  action,
  className,
}: AIResultProps) {
  const statusConfig = {
    success: {
      icon: <CheckCircle2 className="w-12 h-12" />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    error: {
      icon: <XCircle className="w-12 h-12" />,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    warning: {
      icon: <AlertCircle className="w-12 h-12" />,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    processing: {
      icon: <Brain className="w-12 h-12" />,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
  }

  const config = statusConfig[status]

  return (
    <motion.div
      className={cn(
        "rounded-2xl border p-8",
        config.bgColor,
        config.borderColor,
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <motion.div
          className={config.color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
        >
          {status === "processing" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              {config.icon}
            </motion.div>
          ) : (
            config.icon
          )}
        </motion.div>

        {/* Content */}
        <div className="space-y-2">
          <motion.h3
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h3>

          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>

          {details && (
            <motion.p
              className="text-sm text-muted-foreground max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {details}
            </motion.p>
          )}
        </div>

        {/* Action */}
        {action && (
          <motion.button
            onClick={action.onClick}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action.label}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

/**
 * AIResultCard - Compact result card for lists
 */
export function AIResultCard({
  title,
  description,
  score,
  confidence,
  metadata,
  className,
}: {
  title: string
  description: string
  score?: number
  confidence?: number
  metadata?: Array<{ label: string; value: string }>
  className?: string
}) {
  return (
    <motion.div
      className={cn(
        "rounded-xl border border-border bg-card p-6",
        "hover:shadow-lg transition-shadow",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>

          {score !== undefined && (
            <div className="flex flex-col items-end gap-1">
              <div className="text-2xl font-bold text-violet-600">{score}%</div>
              {confidence !== undefined && (
                <div className="text-xs text-muted-foreground">
                  {confidence}% confidence
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {metadata.map((item, index) => (
              <div
                key={index}
                className="px-3 py-1 rounded-full bg-muted text-xs"
              >
                <span className="font-medium">{item.label}:</span>{" "}
                <span className="text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage:
 *
 * ```tsx
 * // AI Thinking
 * <AIThinking variant="brain" message="Analyzing your data..." />
 *
 * // AI Sandbox
 * <AISandbox
 *   title="JavaScript Playground"
 *   code="console.log('Hello World')"
 *   onRun={async (code) => {
 *     // Execute code
 *     return "Output here"
 *   }}
 * />
 *
 * // AI Result
 * <AIResult
 *   status="success"
 *   title="Analysis Complete"
 *   message="Your content has been analyzed"
 *   action={{
 *     label: "View Results",
 *     onClick: () => {}
 *   }}
 * />
 *
 * // AI Result Card
 * <AIResultCard
 *   title="High Quality"
 *   description="Content meets all quality standards"
 *   score={95}
 *   confidence={98}
 *   metadata={[
 *     { label: "Type", value: "Blog Post" },
 *     { label: "Words", value: "1,234" }
 *   ]}
 * />
 * ```
 */
