'use client'

import React, { forwardRef, useState } from 'react'
import Image from 'next/image'

// Blur placeholder for accessible images
const ACCESSIBLE_IMAGE_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDBBEhABIxBQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8AyRU9NL06aKjqzBUxNulkZQWBJYEA+xYfPmtaKpqa6ljqqaZopozlHXkHTWk0w5JOp//Z"

// Accessible button with proper ARIA attributes
export const AccessibleButton = forwardRef(({ 
  children, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  ariaLabel,
  onClick,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
        ${variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' : ''}
        ${size === 'small' ? 'px-2 py-1 text-sm' : ''}
        ${size === 'medium' ? 'px-4 py-2' : ''}
        ${size === 'large' ? 'px-6 py-3 text-lg' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transition-colors duration-200
      `.trim()}
      {...props}
    >
      {children}
    </button>
  )
})

AccessibleButton.displayName = 'AccessibleButton'

// Accessible image with proper alt text and optimized loading
export function AccessibleImage({
  src,
  alt,
  decorative = false,
  width,
  height,
  fill = false,
  sizes,
  className,
  priority = false,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true)

  // Use Next.js Image for optimization
  if (width && height || fill) {
    return (
      <Image
        src={src}
        alt={decorative ? '' : alt || 'Image'}
        {...(fill ? { fill: true, sizes: sizes || "100vw" } : { width, height })}
        className={className}
        placeholder="blur"
        blurDataURL={ACCESSIBLE_IMAGE_BLUR}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        role={decorative ? 'presentation' : undefined}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    )
  }

  // Fallback to native img for cases without dimensions
  return (
    <img
      src={src}
      alt={decorative ? '' : alt || 'Image'}
      role={decorative ? 'presentation' : undefined}
      loading="lazy"
      className={className}
      {...props}
    />
  )
}

// Accessible form input with proper labeling
export function AccessibleInput({ 
  label, id, error, required = false, description, ...props 
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      <input
        id={inputId}
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-required={required}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          focus:outline-none focus:ring-1
        `.trim()}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Skip to main content link for keyboard navigation
export function SkipToMain() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white px-4 py-2 z-50"
    >
      Skip to main content
    </a>
  )
}