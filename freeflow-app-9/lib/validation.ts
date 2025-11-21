/**
 * Form Validation Utilities
 * Common validation functions and schemas
 */

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password strength validation
export function validatePassword(password: string): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
} {
  const errors: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }

  const score = 5 - errors.length
  if (score >= 4) strength = 'strong'
  else if (score >= 2) strength = 'medium'

  return {
    isValid: errors.length === 0,
    strength,
    errors
  }
}

// URL validation
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Phone number validation (basic)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

// Credit card validation (Luhn algorithm)
export function validateCreditCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')

  if (digits.length < 13 || digits.length > 19) {
    return false
  }

  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// Required field validation
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

// Min length validation
export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength
}

// Max length validation
export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength
}

// Number range validation
export function validateNumberRange(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

// Date validation
export function validateDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj instanceof Date && !isNaN(dateObj.getTime())
}

// File validation
export function validateFile(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
  }
): { isValid: boolean; error?: string } {
  if (options.maxSize && file.size > options.maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${options.maxSize / 1024 / 1024}MB`
    }
  }

  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${options.allowedTypes.join(', ')}`
    }
  }

  return { isValid: true }
}

// Form data validator
export class FormValidator {
  private errors: Record<string, string> = {}

  validate(
    field: string,
    value: any,
    rules: {
      required?: boolean
      email?: boolean
      minLength?: number
      maxLength?: number
      pattern?: RegExp
      custom?: (value: any) => boolean | string
    }
  ): this {
    // Required validation
    if (rules.required && !validateRequired(value)) {
      this.errors[field] = 'This field is required'
      return this
    }

    // Skip other validations if field is empty and not required
    if (!validateRequired(value) && !rules.required) {
      return this
    }

    // Email validation
    if (rules.email && !validateEmail(value)) {
      this.errors[field] = 'Please enter a valid email address'
      return this
    }

    // Min length validation
    if (rules.minLength && !validateMinLength(value, rules.minLength)) {
      this.errors[field] = `Must be at least ${rules.minLength} characters`
      return this
    }

    // Max length validation
    if (rules.maxLength && !validateMaxLength(value, rules.maxLength)) {
      this.errors[field] = `Must be no more than ${rules.maxLength} characters`
      return this
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      this.errors[field] = 'Invalid format'
      return this
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value)
      if (typeof result === 'string') {
        this.errors[field] = result
      } else if (!result) {
        this.errors[field] = 'Validation failed'
      }
    }

    return this
  }

  getErrors(): Record<string, string> {
    return this.errors
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0
  }

  getError(field: string): string | undefined {
    return this.errors[field]
  }

  clear(): void {
    this.errors = {}
  }
}

// Common validation schemas
export const ValidationSchemas = {
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      const result = validatePassword(value)
      return result.isValid || result.errors[0]
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  phone: {
    required: true,
    custom: (value: string) => validatePhone(value) || 'Please enter a valid phone number'
  },
  url: {
    custom: (value: string) => validateURL(value) || 'Please enter a valid URL'
  }
}

// Sanitization utilities
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeHTML(html: string): string {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// Debounce validation for real-time validation
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
