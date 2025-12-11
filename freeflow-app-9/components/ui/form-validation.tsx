"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ReactNode, useState, useEffect } from "react"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react"

/**
 * Form Validation with Animations - A+++ UI/UX
 * Premium form validation with smooth animations and real-time feedback
 */

// ============================================================================
// TYPES & VALIDATION RULES
// ============================================================================

export type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean | string
  email?: boolean
  url?: boolean
  number?: boolean
  min?: number
  max?: number
}

export type ValidationState = "idle" | "validating" | "valid" | "invalid"

interface ValidationResult {
  isValid: boolean
  error?: string
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const validateField = (value: string, rules: ValidationRule): ValidationResult => {
  // Required check
  if (rules.required && !value.trim()) {
    return { isValid: false, error: "This field is required" }
  }

  // Skip other validations if empty and not required
  if (!value.trim() && !rules.required) {
    return { isValid: true }
  }

  // Min length
  if (rules.minLength && value.length < rules.minLength) {
    return {
      isValid: false,
      error: `Must be at least ${rules.minLength} characters`,
    }
  }

  // Max length
  if (rules.maxLength && value.length > rules.maxLength) {
    return {
      isValid: false,
      error: `Must be no more than ${rules.maxLength} characters`,
    }
  }

  // Email validation
  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return { isValid: false, error: "Please enter a valid email address" }
    }
  }

  // URL validation
  if (rules.url) {
    try {
      new URL(value)
    } catch {
      return { isValid: false, error: "Please enter a valid URL" }
    }
  }

  // Number validation
  if (rules.number) {
    if (isNaN(Number(value))) {
      return { isValid: false, error: "Please enter a valid number" }
    }

    const num = Number(value)
    if (rules.min !== undefined && num < rules.min) {
      return { isValid: false, error: `Must be at least ${rules.min}` }
    }
    if (rules.max !== undefined && num > rules.max) {
      return { isValid: false, error: `Must be no more than ${rules.max}` }
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return { isValid: false, error: "Invalid format" }
  }

  // Custom validation
  if (rules.custom) {
    const result = rules.custom(value)
    if (result === false) {
      return { isValid: false, error: "Validation failed" }
    }
    if (typeof result === "string") {
      return { isValid: false, error: result }
    }
  }

  return { isValid: true }
}

// ============================================================================
// VALIDATED INPUT
// ============================================================================

interface ValidatedInputProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  rules?: ValidationRule
  value?: string
  onChange?: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
  className?: string
  hint?: string
  showPasswordToggle?: boolean
}

/**
 * ValidatedInput - Input with real-time validation and animations
 */
export function ValidatedInput({
  label,
  name,
  type = "text",
  placeholder,
  rules,
  value: controlledValue,
  onChange,
  onValidationChange,
  className,
  hint,
  showPasswordToggle = false,
}: ValidatedInputProps) {
  const [value, setValue] = useState(controlledValue || "")
  const [state, setState] = useState<ValidationState>("idle")
  const [error, setError] = useState<string>()
  const [isFocused, setIsFocused] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue)
    }
  }, [controlledValue])

  const handleChange = (newValue: string) => {
    setValue(newValue)
    setIsDirty(true)
    onChange?.(newValue)

    if (rules) {
      setState("validating")

      // Simulate async validation delay for smooth animation
      setTimeout(() => {
        const result = validateField(newValue, rules)
        setState(result.isValid ? "valid" : "invalid")
        setError(result.error)
        onValidationChange?.(result.isValid)
      }, 300)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (rules && !isDirty) {
      const result = validateField(value, rules)
      setState(result.isValid ? "valid" : "invalid")
      setError(result.error)
      onValidationChange?.(result.isValid)
    }
  }

  const getInputStyles = () => {
    const base = "w-full rounded-lg border-2 px-4 py-3 transition-all duration-200 focus:outline-none"

    if (state === "valid" && isDirty) {
      return cn(base, "border-green-500 focus:border-green-600 focus:ring-4 focus:ring-green-100")
    }

    if (state === "invalid" && isDirty) {
      return cn(base, "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100")
    }

    return cn(base, "border-gray-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-100")
  }

  const displayType = showPasswordToggle && showPassword ? "text" : type

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <motion.label
        htmlFor={name}
        className="block text-sm font-medium text-foreground"
        animate={{
          color: state === "invalid" && isDirty ? "#ef4444" : state === "valid" && isDirty ? "#22c55e" : "#000000",
        }}
      >
        {label}
        {rules?.required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      {/* Input container */}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={displayType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          className={getInputStyles()}
        />

        {/* Password toggle */}
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}

        {/* Validation icon */}
        <AnimatePresence>
          {isDirty && state !== "validating" && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {state === "valid" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {state === "invalid" && <XCircle className="h-5 w-5 text-red-500" />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        <AnimatePresence>
          {state === "validating" && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="h-5 w-5 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint or error message */}
      <AnimatePresence mode="wait">
        {error && state === "invalid" && isDirty ? (
          <motion.div
            key="error"
            className="flex items-start gap-2 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        ) : hint ? (
          <motion.p
            key="hint"
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {/* Strength indicator for password */}
      {type === "password" && isDirty && (
        <PasswordStrengthIndicator password={value} />
      )}
    </div>
  )
}

// ============================================================================
// PASSWORD STRENGTH INDICATOR
// ============================================================================

function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0

    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z\d]/.test(pwd)) score++

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-red-500" }
    if (score === 2) return { score: 50, label: "Fair", color: "bg-yellow-500" }
    if (score === 3) return { score: 75, label: "Good", color: "bg-blue-500" }
    return { score: 100, label: "Strong", color: "bg-green-500" }
  }

  const strength = getStrength(password)

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength:</span>
        <span className="font-medium">{strength.label}</span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full", strength.color)}
          initial={{ width: 0 }}
          animate={{ width: `${strength.score}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

// ============================================================================
// VALIDATED TEXTAREA
// ============================================================================

interface ValidatedTextareaProps extends Omit<ValidatedInputProps, "type" | "showPasswordToggle"> {
  rows?: number
}

/**
 * ValidatedTextarea - Textarea with validation
 */
export function ValidatedTextarea({
  label,
  name,
  placeholder,
  rules,
  value: controlledValue,
  onChange,
  onValidationChange,
  className,
  hint,
  rows = 4,
}: ValidatedTextareaProps) {
  const [value, setValue] = useState(controlledValue || "")
  const [state, setState] = useState<ValidationState>("idle")
  const [error, setError] = useState<string>()
  const [isDirty, setIsDirty] = useState(false)

  const handleChange = (newValue: string) => {
    setValue(newValue)
    setIsDirty(true)
    onChange?.(newValue)

    if (rules) {
      setState("validating")
      setTimeout(() => {
        const result = validateField(newValue, rules)
        setState(result.isValid ? "valid" : "invalid")
        setError(result.error)
        onValidationChange?.(result.isValid)
      }, 300)
    }
  }

  const getTextareaStyles = () => {
    const base = "w-full rounded-lg border-2 px-4 py-3 transition-all duration-200 focus:outline-none resize-none"

    if (state === "valid" && isDirty) {
      return cn(base, "border-green-500 focus:border-green-600 focus:ring-4 focus:ring-green-100")
    }

    if (state === "invalid" && isDirty) {
      return cn(base, "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100")
    }

    return cn(base, "border-gray-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-100")
  }

  return (
    <div className={cn("space-y-2", className)}>
      <motion.label
        htmlFor={name}
        className="block text-sm font-medium"
        animate={{
          color: state === "invalid" && isDirty ? "#ef4444" : state === "valid" && isDirty ? "#22c55e" : "#000000",
        }}
      >
        {label}
        {rules?.required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      <div className="relative">
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          rows={rows}
          className={getTextareaStyles()}
        />

        {/* Character count */}
        {rules?.maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {value.length} / {rules.maxLength}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {error && state === "invalid" && isDirty ? (
          <motion.div
            key="error"
            className="flex items-start gap-2 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        ) : hint ? (
          <motion.p key="hint" className="text-sm text-muted-foreground">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// FORM WRAPPER WITH VALIDATION
// ============================================================================

interface ValidatedFormProps {
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
  className?: string
}

/**
 * ValidatedForm - Form wrapper with submit handling
 */
export function ValidatedForm({ children, onSubmit, className }: ValidatedFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.form>
  )
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage:
 *
 * ```tsx
 * <ValidatedForm onSubmit={handleSubmit}>
 *   <ValidatedInput
 *     label="Email"
 *     name="email"
 *     type="email"
 *     rules={{ required: true, email: true }}
 *     hint="We'll never share your email"
 *   />
 *
 *   <ValidatedInput
 *     label="Password"
 *     name="password"
 *     type="password"
 *     showPasswordToggle
 *     rules={{
 *       required: true,
 *       minLength: 8,
 *       custom: (value) => {
 *         if (!/[A-Z]/.test(value)) {
 *           return "Must contain uppercase letter"
 *         }
 *         return true
 *       }
 *     }}
 *   />
 *
 *   <ValidatedTextarea
 *     label="Bio"
 *     name="bio"
 *     rules={{ maxLength: 500 }}
 *     hint="Tell us about yourself"
 *   />
 *
 *   <button type="submit">Submit</button>
 * </ValidatedForm>
 * ```
 */
