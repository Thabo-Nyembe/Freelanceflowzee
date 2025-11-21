# A+++ Utilities Developer Guide

Comprehensive guide for using the professional-grade utilities built into KAZI Platform.

---

## Table of Contents

1. [Loading States](#loading-states)
2. [Empty States](#empty-states)
3. [Error Handling](#error-handling)
4. [Form Validation](#form-validation)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Accessibility](#accessibility)
7. [SEO Optimization](#seo-optimization)
8. [Performance Monitoring](#performance-monitoring)

---

## Loading States

### Import

```tsx
import {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  ChartSkeleton,
  FormSkeleton,
  PageSkeleton,
  WidgetSkeleton
} from '@/components/ui/loading-skeleton'
```

### Usage

**Basic Skeleton:**
```tsx
<Skeleton className="h-4 w-32" />
```

**Pre-built Skeletons:**
```tsx
// While loading dashboard data
{isLoading ? <DashboardSkeleton /> : <YourDashboard />}

// While loading a list
{isLoading ? <ListSkeleton items={5} /> : <YourList />}

// While loading a table
{isLoading ? <TableSkeleton rows={10} columns={4} /> : <YourTable />}

// While loading a form
{isLoading ? <FormSkeleton fields={5} /> : <YourForm />}
```

**Best Practices:**
- Always show skeleton for loading states > 300ms
- Match skeleton structure to actual content
- Use `className` to customize dimensions

---

## Empty States

### Import

```tsx
import {
  EmptyState,
  NoDataEmptyState,
  NoResultsEmptyState,
  NoAccessEmptyState,
  OfflineEmptyState,
  ErrorEmptyState,
  MaintenanceEmptyState,
  ComingSoonEmptyState,
  SuccessEmptyState,
  InlineEmptyState
} from '@/components/ui/empty-state'
```

### Usage

**Custom Empty State:**
```tsx
<EmptyState
  icon="=í"
  title="No Projects Yet"
  description="Create your first project to get started"
  action={{
    label: "Create Project",
    onClick: () => createProject()
  }}
/>
```

**Pre-built Empty States:**
```tsx
// No data scenario
{items.length === 0 && <NoDataEmptyState entityName="projects" />}

// Search with no results
{searchResults.length === 0 && <NoResultsEmptyState searchQuery={query} />}

// Error occurred
{error && <ErrorEmptyState error={error.message} />}

// Coming soon feature
<ComingSoonEmptyState featureName="AI Video Editing" />

// Success message
<SuccessEmptyState
  title="Project Created!"
  description="Your project has been created successfully"
/>

// Inline empty (no card wrapper)
<InlineEmptyState message="No items to display" />
```

**Best Practices:**
- Always provide helpful CTAs in empty states
- Use appropriate icons for context
- Keep descriptions concise and actionable

---

## Error Handling

### Import

```tsx
import { ErrorBoundary, withErrorBoundary } from '@/components/ui/error-boundary'
```

### Usage

**Wrap Components:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**With Custom Fallback:**
```tsx
<ErrorBoundary
  fallback={
    <div>Custom error UI</div>
  }
  onError={(error, errorInfo) => {
    // Log to error reporting service
    console.error(error, errorInfo)
  }}
>
  <YourComponent />
</ErrorBoundary>
```

**HOC Pattern:**
```tsx
const SafeComponent = withErrorBoundary(MyComponent)

// Use it
<SafeComponent {...props} />
```

**Best Practices:**
- Wrap entire page components in ErrorBoundary
- Wrap critical sections separately
- Log errors to monitoring service
- Provide retry functionality

---

## Form Validation

### Import

```tsx
import {
  FormValidator,
  ValidationSchemas,
  validateEmail,
  validatePassword,
  validateURL,
  validatePhone,
  validateCreditCard,
  sanitizeInput,
  sanitizeHTML,
  debounce
} from '@/lib/validation'
```

### Usage

**FormValidator Class:**
```tsx
const validator = new FormValidator()

validator
  .validate('email', formData.email, ValidationSchemas.email)
  .validate('password', formData.password, ValidationSchemas.password)
  .validate('name', formData.name, {
    required: true,
    minLength: 2,
    maxLength: 50
  })

if (validator.hasErrors()) {
  setErrors(validator.getErrors())
  return
}

// Form is valid, proceed
submitForm(formData)
```

**Individual Validators:**
```tsx
// Email
if (!validateEmail(email)) {
  setError('Invalid email address')
}

// Password with strength
const result = validatePassword(password)
if (!result.isValid) {
  setErrors(result.errors) // Array of specific issues
}
console.log(result.strength) // 'weak' | 'medium' | 'strong'

// URL
if (!validateURL(url)) {
  setError('Invalid URL')
}

// Phone
if (!validatePhone(phone)) {
  setError('Invalid phone number')
}

// Credit Card (Luhn algorithm)
if (!validateCreditCard(cardNumber)) {
  setError('Invalid card number')
}
```

**Custom Validation:**
```tsx
validator.validate('username', username, {
  required: true,
  minLength: 3,
  pattern: /^[a-zA-Z0-9_]+$/,
  custom: (value) => {
    if (existingUsernames.includes(value)) {
      return 'Username already taken'
    }
    return true
  }
})
```

**Sanitization:**
```tsx
// Prevent XSS
const safeInput = sanitizeInput(userInput)

// Safe HTML rendering
const safeHTML = sanitizeHTML(htmlContent)
```

**Debounced Validation:**
```tsx
const debouncedValidate = debounce((value) => {
  validateField(value)
}, 500)

<input onChange={(e) => debouncedValidate(e.target.value)} />
```

**Pre-configured Schemas:**
```tsx
ValidationSchemas.email     // { required: true, email: true }
ValidationSchemas.password  // { required: true, minLength: 8, custom: passwordStrength }
ValidationSchemas.name      // { required: true, minLength: 2, maxLength: 50 }
ValidationSchemas.phone     // { required: true, custom: phoneValidation }
ValidationSchemas.url       // { custom: urlValidation }
```

---

## Keyboard Shortcuts

### Import

```tsx
import {
  useKeyboardShortcuts,
  useGlobalShortcuts,
  useShortcutHelp,
  useEscapeKey,
  useEnterKey,
  formatShortcut,
  DEFAULT_SHORTCUTS
} from '@/lib/keyboard-shortcuts'
```

### Usage

**Global Shortcuts (Auto-loaded):**
```tsx
function App() {
  useGlobalShortcuts() // Enables Alt+H, Alt+P, Alt+M, Alt+S, Ctrl+/

  return <YourApp />
}
```

**Custom Shortcuts:**
```tsx
useKeyboardShortcuts([
  {
    key: 'k',
    ctrlKey: true,
    description: 'Open Command Palette',
    action: () => setCommandPaletteOpen(true)
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Save',
    action: () => handleSave()
  },
  {
    key: 'n',
    ctrlKey: true,
    description: 'New Item',
    action: () => createNew()
  }
])
```

**Escape Key Handler:**
```tsx
useEscapeKey(() => {
  closeModal()
})
```

**Enter Key Handler:**
```tsx
useEnterKey(() => {
  submitForm()
}, [formData]) // Dependencies
```

**Shortcuts Help Modal:**
```tsx
const { isOpen, setIsOpen, toggle } = useShortcutHelp()

return (
  <>
    <button onClick={toggle}>Show Shortcuts</button>
    {isOpen && <ShortcutsModal onClose={() => setIsOpen(false)} />}
  </>
)
```

**Format for Display:**
```tsx
const shortcut = { key: 'k', ctrlKey: true }
const display = formatShortcut(shortcut) // " + K" on Mac, "Ctrl + K" on Windows
```

**Best Practices:**
- Don't override browser shortcuts
- Show shortcuts in tooltips
- Add Shift+? to show help
- Test on Mac and Windows

---

## Accessibility

### Import

```tsx
import {
  useAnnouncer,
  useFocusTrap,
  useFocusReturn,
  AriaHelpers,
  SkipToMainContent,
  visuallyHidden,
  getContrastRatio,
  meetsContrastRequirement,
  announceNavigation,
  announceLoading,
  announceFormError,
  KeyCodes
} from '@/lib/accessibility'
```

### Usage

**Screen Reader Announcements:**
```tsx
const { announce } = useAnnouncer()

// Announce status changes
announce('Loading complete', 'polite')

// Announce errors
announce('Form submission failed', 'assertive')

// Announce navigation
announceNavigation('Dashboard')

// Announce loading
announceLoading(isLoading, 'Loading projects')

// Announce form errors
announceFormError(['Email is required', 'Password is too short'])
```

**Focus Management:**
```tsx
// Focus trap for modals
function Modal({ isOpen }) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen)

  return (
    <div ref={modalRef} {...AriaHelpers.modal('modal-title', 'modal-desc')}>
      {/* Modal content */}
    </div>
  )
}

// Focus return after modal closes
function ModalWithFocusReturn() {
  const { saveFocus, restoreFocus } = useFocusReturn()

  const openModal = () => {
    saveFocus()
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    restoreFocus()
  }
}
```

**ARIA Helpers:**
```tsx
// Expandable sections
<button {...AriaHelpers.expandable(isExpanded, 'content-id')}>
  Toggle
</button>
<div id="content-id" hidden={!isExpanded}>Content</div>

// Tabs
<button {...AriaHelpers.tab(isSelected, 'panel-id')}>
  Tab Label
</button>
<div {...AriaHelpers.tabPanel('tab-id', !isSelected)}>
  Panel Content
</div>

// Modals
<div {...AriaHelpers.modal('title-id', 'desc-id')}>
  <h2 id="title-id">Modal Title</h2>
  <p id="desc-id">Modal description</p>
</div>

// Progress bars
<div {...AriaHelpers.progress(value, max)}>
  {value}%
</div>

// Status messages
<div {...AriaHelpers.status('Operation complete', 'polite')} />

// Loading states
<div {...AriaHelpers.loading(isLoading)}>
  {isLoading ? 'Loading...' : 'Content'}
</div>
```

**Skip to Main Content:**
```tsx
function Layout() {
  return (
    <>
      <SkipToMainContent />
      <nav>...</nav>
      <main id="main-content">...</main>
    </>
  )
}
```

**Visually Hidden Elements:**
```tsx
<span {...visuallyHidden('Accessible description')}>
  Visible to screen readers only
</span>
```

**Color Contrast Checking:**
```tsx
const ratio = getContrastRatio('#000000', '#FFFFFF') // 21

const meetsAA = meetsContrastRequirement('#000', '#FFF', 'AA', false) // true
const meetsAAA = meetsContrastRequirement('#000', '#FFF', 'AAA', false) // true
```

**Keyboard Navigation:**
```tsx
// Check if element is focusable
if (isFocusable(element)) {
  // Element can receive focus
}

// Get all focusable elements
const focusable = getFocusableElements(container)

// Use KeyCodes constants
if (event.key === KeyCodes.ESCAPE) {
  closeModal()
}
```

---

## SEO Optimization

### Import

```tsx
import {
  generateMetadata,
  PageMetadata,
  generateJSONLD,
  generateBreadcrumbSchema,
  generateSlug,
  truncateDescription,
  generateOGImageURL,
  getCanonicalURL,
  SocialShare,
  DEFAULT_SEO
} from '@/lib/seo'
```

### Usage

**Page Metadata (Next.js 14):**
```tsx
// In any page.tsx
export const metadata = generateMetadata({
  title: 'Dashboard - KAZI Platform',
  description: 'Your creative workspace',
  keywords: ['dashboard', 'projects', 'collaboration'],
  ogImage: '/og-dashboard.png'
})

export default function DashboardPage() {
  return <div>...</div>
}
```

**Pre-configured Page Metadata:**
```tsx
// Use pre-configured metadata
export const metadata = PageMetadata.dashboard
// or
export const metadata = PageMetadata.projects
// or
export const metadata = PageMetadata.videoStudio
```

**Structured Data (JSON-LD):**
```tsx
// Organization schema
const orgSchema = generateJSONLD('Organization', {
  name: 'KAZI Platform',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-234-567-8900',
    contactType: 'Customer Service'
  }
})

// Add to page
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: orgSchema }}
/>
```

**Breadcrumbs:**
```tsx
const breadcrumbs = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://kazi.platform' },
  { name: 'Projects', url: 'https://kazi.platform/projects' },
  { name: 'Video Studio', url: 'https://kazi.platform/video-studio' }
])

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: breadcrumbs }}
/>
```

**SEO-Friendly Slugs:**
```tsx
const slug = generateSlug('My Awesome Project!')
// Result: "my-awesome-project"

const url = `/projects/${slug}`
```

**Meta Descriptions:**
```tsx
const description = truncateDescription(longText, 160)
// Truncates to 160 chars and adds "..."
```

**OG Images:**
```tsx
const ogImage = generateOGImageURL({
  title: 'Check out my project',
  description: 'Amazing work',
  theme: 'dark'
})

export const metadata = generateMetadata({
  ogImage
})
```

**Canonical URLs:**
```tsx
const canonical = getCanonicalURL('/dashboard/projects')

export const metadata = generateMetadata({
  canonical
})
```

**Social Sharing:**
```tsx
const shareOnTwitter = () => {
  window.open(
    SocialShare.twitter(
      'https://kazi.platform/project/123',
      'Check out my amazing project!'
    ),
    '_blank'
  )
}

const shareOnFacebook = () => {
  window.open(
    SocialShare.facebook('https://kazi.platform/project/123'),
    '_blank'
  )
}

const shareOnLinkedIn = () => {
  window.open(
    SocialShare.linkedin(
      'https://kazi.platform/project/123',
      'My Project',
      'Description here'
    ),
    '_blank'
  )
}

const shareViaEmail = () => {
  window.location.href = SocialShare.email(
    'Check this out',
    'Here is my project: https://kazi.platform/project/123'
  )
}

const shareOnWhatsApp = () => {
  window.open(
    SocialShare.whatsapp(
      'https://kazi.platform/project/123',
      'Check out my project'
    ),
    '_blank'
  )
}
```

---

## Performance Monitoring

### Import

```tsx
import {
  trackWebVitals,
  initPerformanceMonitoring,
  preloadImage,
  preloadCriticalImages,
  logBundleInfo,
  monitorMemoryUsage
} from '@/lib/performance'
```

### Usage

**Initialize Monitoring:**
```tsx
// In app/layout.tsx or _app.tsx
useEffect(() => {
  initPerformanceMonitoring()
}, [])
```

**Track Web Vitals:**
```tsx
useEffect(() => {
  trackWebVitals()
}, [])
```

**Preload Critical Images:**
```tsx
useEffect(() => {
  preloadCriticalImages([
    '/hero-image.jpg',
    '/logo.png',
    '/banner.webp'
  ])
}, [])
```

**Preload Single Image:**
```tsx
const loadImage = async () => {
  try {
    await preloadImage('/large-image.jpg')
    setImageReady(true)
  } catch (error) {
    console.error('Failed to load image')
  }
}
```

---

## Complete Example

Here's a complete example combining multiple utilities:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { generateMetadata } from '@/lib/seo'
import { FormValidator, ValidationSchemas } from '@/lib/validation'
import { useAnnouncer, AriaHelpers } from '@/lib/accessibility'
import { useKeyboardShortcuts } from '@/lib/keyboard-shortcuts'
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { Tooltip, InfoTooltip } from '@/components/ui/tooltip'

// SEO Metadata
export const metadata = generateMetadata({
  title: 'My Page - KAZI Platform',
  description: 'Example page using A+++ utilities'
})

export default function MyPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({ email: '' })
  const [formErrors, setFormErrors] = useState({})

  const { announce } = useAnnouncer()

  // Load data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    announce('Loading data', 'polite')

    try {
      const response = await fetch('/api/data')
      const result = await response.json()
      setData(result)
      announce('Data loaded successfully', 'polite')
    } catch (err) {
      setError(err.message)
      announce('Failed to load data', 'assertive')
    } finally {
      setIsLoading(false)
    }
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'r',
      ctrlKey: true,
      description: 'Refresh Data',
      action: () => {
        fetchData()
        announce('Refreshing data')
      }
    }
  ])

  // Form validation
  const handleSubmit = () => {
    const validator = new FormValidator()
    validator.validate('email', formData.email, ValidationSchemas.email)

    if (validator.hasErrors()) {
      const errors = validator.getErrors()
      setFormErrors(errors)
      announce(`Form has ${Object.keys(errors).length} errors`, 'assertive')
      return
    }

    // Submit form
    announce('Form submitted successfully', 'polite')
  }

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Error state
  if (error) {
    return <ErrorEmptyState error={error} />
  }

  // Empty state
  if (data.length === 0) {
    return <NoDataEmptyState entityName="items" />
  }

  // Success state
  return (
    <div>
      <h1>My Page</h1>

      <Tooltip content="Ctrl + R to refresh" position="right">
        <button onClick={fetchData}>Refresh</button>
      </Tooltip>

      <form>
        <label>
          Email <InfoTooltip content="We'll never share your email" />
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ email: e.target.value })}
          aria-invalid={!!formErrors.email}
          {...AriaHelpers.loading(isLoading)}
        />
        {formErrors.email && (
          <span role="alert">{formErrors.email}</span>
        )}
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </form>

      <ul {...AriaHelpers.list(data.length)}>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Best Practices Summary

### Loading States
-  Show skeletons for delays > 300ms
-  Match skeleton to actual content structure
-  Announce loading states to screen readers

### Empty States
-  Always provide helpful CTAs
-  Use contextual icons
-  Keep descriptions actionable

### Validation
-  Validate on submit, not on every keystroke
-  Show specific error messages
-  Use debouncing for real-time validation
-  Sanitize all user inputs

### Accessibility
-  Use semantic HTML
-  Provide ARIA attributes
-  Ensure keyboard navigation works
-  Test with screen readers
-  Maintain 4.5:1 contrast ratio

### SEO
-  Set unique titles and descriptions
-  Use structured data
-  Add canonical URLs
-  Optimize OG images

### Performance
-  Preload critical resources
-  Monitor Web Vitals
-  Track bundle size
-  Lazy load components

---

## Troubleshooting

### Keyboard Shortcuts Not Working
- Check if input/textarea is focused
- Verify browser doesn't override shortcut
- Test on different browsers

### Screen Reader Not Announcing
- Check if LiveAnnouncer is initialized
- Verify ARIA attributes are correct
- Test with multiple screen readers

### Validation Not Working
- Check FormValidator is instantiated
- Verify field names match form data
- Ensure validation rules are correct

### Loading Skeletons Flashing
- Add minimum loading time (300ms)
- Use CSS transitions for smooth appearance
- Debounce loading state changes

---

## Live Demo

Visit `/dashboard/a-plus-showcase` to see all utilities in action!

---

## Support

For questions or issues with A+++ utilities:
1. Check this guide
2. Review the source code
3. Check `/dashboard/a-plus-showcase` for examples
4. Contact the development team

---

**Built with d for A+++ quality**
