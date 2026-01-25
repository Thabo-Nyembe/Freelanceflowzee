/**
 * HTML Sanitization Utility
 *
 * Uses DOMPurify to sanitize HTML content and prevent XSS attacks.
 * This utility should be used for all user-generated HTML content
 * before rendering with dangerouslySetInnerHTML.
 */

import DOMPurify from 'dompurify'

// Default configuration for sanitization
const DEFAULT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'u', 's', 'em', 'strong', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
    'span', 'div', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'sub', 'sup', 'mark'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id',
    'width', 'height', 'style', 'data-*'
  ],
  ALLOW_DATA_ATTR: true,
  ADD_ATTR: ['target'],
  // Force links to open in new tab with security attributes
  ADD_TAGS: [],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
}

// Strict configuration for plain text with minimal formatting
const STRICT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'a', 'span'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  ADD_ATTR: ['target'],
}

// Configuration for code blocks
const CODE_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['pre', 'code', 'span', 'br'],
  ALLOWED_ATTR: ['class', 'data-language'],
}

/**
 * Sanitize HTML content with default configuration
 * Suitable for rich text content like messages, comments, and posts
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return escaped HTML
    return escapeHtml(html)
  }
  return DOMPurify.sanitize(html, DEFAULT_CONFIG)
}

/**
 * Sanitize HTML with strict configuration
 * Suitable for simple formatted text
 */
export function sanitizeHtmlStrict(html: string): string {
  if (typeof window === 'undefined') {
    return escapeHtml(html)
  }
  return DOMPurify.sanitize(html, STRICT_CONFIG)
}

/**
 * Sanitize HTML for code display
 * Suitable for syntax-highlighted code blocks
 */
export function sanitizeCode(html: string): string {
  if (typeof window === 'undefined') {
    return escapeHtml(html)
  }
  return DOMPurify.sanitize(html, CODE_CONFIG)
}

/**
 * Escape HTML special characters (for server-side use)
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Check if HTML contains potentially dangerous content
 */
export function hasDangerousContent(html: string): boolean {
  const dangerous = /<script|<iframe|javascript:|data:/i
  return dangerous.test(html)
}

export default {
  sanitizeHtml,
  sanitizeHtmlStrict,
  sanitizeCode,
  escapeHtml,
  hasDangerousContent,
}
