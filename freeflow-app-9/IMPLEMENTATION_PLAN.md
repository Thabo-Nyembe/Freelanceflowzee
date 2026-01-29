# KAZI/FreeFlow Implementation Plan
## Comprehensive Launch Preparation Guide - January 2026

---

# Table of Contents
1. [Implementation Overview](#implementation-overview)
2. [Phase 1: Critical Pre-Launch Fixes](#phase-1-critical-pre-launch-fixes)
3. [Phase 2: Performance Optimization](#phase-2-performance-optimization)
4. [Phase 3: PWA Enhancement](#phase-3-pwa-enhancement)
5. [Phase 4: Security & Enterprise Features](#phase-4-security--enterprise-features)
6. [Phase 5: Payment & Billing](#phase-5-payment--billing)
7. [Phase 6: Mobile Strategy](#phase-6-mobile-strategy)
8. [Phase 7: Integrations & API](#phase-7-integrations--api)
9. [Phase 8: Launch Checklist](#phase-8-launch-checklist)
10. [Code Implementation Examples](#code-implementation-examples)

---

# Implementation Overview

## Technology Stack Reference

Based on Context7 research, here's your optimized stack configuration:

```
┌────────────────────────────────────────────────────────────────┐
│                    KAZI Technical Stack                         │
├────────────────────────────────────────────────────────────────┤
│ Frontend: Next.js 16.1.1 + React 19.2.3 + TypeScript           │
│ Styling: Tailwind CSS 4.1.18 + shadcn/ui + Framer Motion       │
│ Database: Supabase (PostgreSQL + RLS + Realtime)               │
│ Payments: Stripe (Subscriptions + Connect + Webhooks)          │
│ AI: OpenAI + Anthropic + Google AI + Fal.ai (12+ models)       │
│ Video: Mux + Remotion                                           │
│ Storage: Supabase Storage + Wasabi S3 (hybrid)                 │
│ Auth: NextAuth + Supabase Auth + SAML SSO (Enterprise)         │
└────────────────────────────────────────────────────────────────┘
```

## Priority Matrix

| Priority | Category | Timeline | Impact |
|----------|----------|----------|--------|
| P0 | Critical bugs & security | Week 1 | Launch blocker |
| P1 | Performance optimization | Week 1-2 | User experience |
| P2 | PWA enhancement | Week 2 | Mobile users |
| P3 | Enterprise features | Week 3-4 | Revenue |
| P4 | Mobile app planning | Month 2 | Market expansion |

---

# Phase 1: Critical Pre-Launch Fixes

## 1.1 Next.js Production Optimization

### Configure Standalone Output
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Enable Turbopack filesystem caching
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,

    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@phosphor-icons/react',
      'framer-motion',
      'recharts',
      '@radix-ui/react-icons',
    ],

    // Reduce memory usage for large builds
    webpackMemoryOptimizations: true,
  },

  // Image optimization
  images: {
    qualities: [75, 90],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 days
  },

  // Enable detailed fetch logging in dev
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

module.exports = nextConfig
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "analyze": "npx next experimental-analyze --output",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

### Deploy Standalone Build
```bash
# Build the application
npm run build

# Copy static assets to standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# Start with custom port
PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

## 1.2 Database Security (Row Level Security)

### Enable RLS on All Tables
```sql
-- Enable RLS on core tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
```

### Implement User-Specific Policies
```sql
-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Projects: User owns or is assigned
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid()) OR
  id IN (
    SELECT project_id FROM project_members
    WHERE user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can create their own projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Invoices: Owner access only
CREATE POLICY "Users can manage their own invoices"
ON invoices FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Escrow: Secure milestone-based access
CREATE POLICY "Escrow visible to buyer and seller"
ON escrow_transactions FOR SELECT
TO authenticated
USING (
  buyer_id = (SELECT auth.uid()) OR
  seller_id = (SELECT auth.uid())
);

CREATE POLICY "Only buyer can create escrow"
ON escrow_transactions FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = buyer_id);
```

### Optimize RLS Performance with Indexes
```sql
-- Add indexes for RLS policy columns
CREATE INDEX idx_profiles_id ON profiles(id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_escrow_buyer_seller ON escrow_transactions(buyer_id, seller_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

### MFA Enforcement Policy (Enterprise)
```sql
-- Require MFA for sensitive operations
CREATE POLICY "Require MFA for escrow release"
ON escrow_transactions FOR UPDATE
AS RESTRICTIVE
TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2');
```

## 1.3 Error Boundaries & Loading States

### Create Global Error Boundary
```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">
          We apologize for the inconvenience. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
```

### Create Loading Component
```typescript
// app/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}
```

---

# Phase 2: Performance Optimization

## 2.1 Bundle Size Optimization

### Optimize Icon Imports
```typescript
// ❌ Bad - imports entire library
import { TriangleIcon } from '@phosphor-icons/react'

// ✅ Good - imports only needed icon
import { TriangleIcon } from '@phosphor-icons/react/dist/csr/Triangle'
```

### Configure Package Import Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@phosphor-icons/react',
      '@radix-ui/react-icons',
      'framer-motion',
      'recharts',
      '@tanstack/react-table',
      'date-fns',
    ],
  },
}
```

### Server Component Optimization
```typescript
// Move heavy processing to Server Components
// app/dashboard/analytics/page.tsx
import { codeToHtml } from 'shiki'

export default async function AnalyticsPage() {
  // Heavy computation runs on server
  const analyticsData = await fetchAnalytics()

  // Pre-render charts on server
  const chartHtml = await renderChartsSS(analyticsData)

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      {/* Client receives pre-rendered HTML */}
      <div dangerouslySetInnerHTML={{ __html: chartHtml }} />
    </div>
  )
}
```

## 2.2 Image Optimization

### Configure Image Optimization
```javascript
// next.config.js
module.exports = {
  images: {
    // Supported formats
    formats: ['image/avif', 'image/webp'],

    // Quality levels
    qualities: [75, 90],

    // Cache TTL (31 days)
    minimumCacheTTL: 2678400,

    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### Optimized Image Component Usage
```typescript
import Image from 'next/image'

// Local image with auto dimensions
import ProfileImage from './profile.png'

export function Avatar() {
  return (
    <Image
      src={ProfileImage}
      alt="Profile"
      placeholder="blur" // Auto blur-up
      priority // For above-the-fold images
    />
  )
}

// Remote image with explicit dimensions
export function ProjectThumbnail({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="Project thumbnail"
      width={400}
      height={300}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, 400px"
    />
  )
}
```

## 2.3 Animation Performance (Framer Motion)

### Hardware-Accelerated Animations
```typescript
// ❌ Bad - not hardware accelerated
animate(element, { borderRadius: "50px" })

// ✅ Good - uses GPU acceleration
animate(element, { clipPath: "inset(0 round 50px)" })

// ❌ Bad - expensive shadow animation
animate(element, { boxShadow: "10px 10px black" })

// ✅ Good - GPU-accelerated filter
animate(element, { filter: "drop-shadow(10px 10px black)" })

// ❌ Bad - individual transforms (CSS variables)
animate(".box", { x: 100, scale: 2 })

// ✅ Good - single transform string
animate(".box", { transform: "translateX(100px) scale(2)" })
```

### Gesture Performance
```tsx
import { motion } from 'framer-motion'

// Optimized hover and tap gestures
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  )
}

// Layout animations with scroll optimization
export function ScrollContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      layoutScroll
      style={{ overflow: 'scroll' }}
    >
      <motion.div layout>
        {children}
      </motion.div>
    </motion.div>
  )
}
```

### Reduced Motion Support
```tsx
import { useReducedMotion } from 'framer-motion'

function Parallax() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()

  const y = useTransform(scrollY, [0, 1], [0, -0.2], {
    clamp: false,
  })

  return (
    <motion.div
      style={{ y: shouldReduceMotion ? 0 : y }}
    />
  )
}
```

## 2.4 Database Query Optimization

### Optimized Supabase Queries
```typescript
// Always add explicit filters even with RLS
// ❌ Bad
const { data } = await supabase.from('projects').select()

// ✅ Good - explicit filter helps query planner
const { data } = await supabase
  .from('projects')
  .select()
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20)
```

### Batch Operations
```typescript
// Batch insert for efficiency
const { data, error } = await supabase
  .from('time_entries')
  .insert([
    { project_id: 1, hours: 2, date: '2026-01-29' },
    { project_id: 1, hours: 3, date: '2026-01-28' },
    { project_id: 2, hours: 1, date: '2026-01-29' },
  ])
  .select()
```

---

# Phase 3: PWA Enhancement

## 3.1 PWA Configuration

### Web Manifest
```json
// public/manifest.json
{
  "name": "KAZI - All-in-One Creative Platform",
  "short_name": "KAZI",
  "description": "AI-powered platform for creative professionals",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#7c3aed",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "KAZI Dashboard"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "KAZI Mobile"
    }
  ],
  "shortcuts": [
    {
      "name": "My Day",
      "url": "/dashboard/my-day",
      "icons": [{ "src": "/icons/myday.png", "sizes": "96x96" }]
    },
    {
      "name": "Projects",
      "url": "/dashboard/projects",
      "icons": [{ "src": "/icons/projects.png", "sizes": "96x96" }]
    },
    {
      "name": "Messages",
      "url": "/dashboard/messages",
      "icons": [{ "src": "/icons/messages.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["business", "productivity", "utilities"],
  "related_applications": [],
  "prefer_related_applications": false
}
```

### Service Worker (No Dependencies)
```typescript
// public/sw.ts
const CACHE_NAME = 'kazi-v1'
const OFFLINE_URL = '/offline'

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // Activate immediately
  self.skipWaiting()
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API requests (let them fail naturally)
  if (request.url.includes('/api/')) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(async () => {
        // Try cache
        const cachedResponse = await caches.match(request)
        if (cachedResponse) return cachedResponse

        // Fallback to offline page for navigation
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL)
        }

        return new Response('Offline', { status: 503 })
      })
  )
})
```

### Register Service Worker
```typescript
// app/layout.tsx
import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope)
        })
        .catch((error) => {
          console.error('SW registration failed:', error)
        })
    }
  }, [])

  return null
}
```

### Offline Page
```typescript
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold">You're offline</h1>
        <p className="text-muted-foreground max-w-md">
          It looks like you've lost your internet connection.
          Some features may be limited until you're back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
```

## 3.2 Offline Data with IndexedDB

### IndexedDB Store
```typescript
// lib/offline-store.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface KaziDB extends DBSchema {
  drafts: {
    key: string
    value: {
      id: string
      type: 'project' | 'invoice' | 'message'
      data: any
      createdAt: number
      synced: boolean
    }
  }
  cache: {
    key: string
    value: {
      url: string
      data: any
      timestamp: number
    }
  }
}

let db: IDBPDatabase<KaziDB> | null = null

export async function getDB() {
  if (!db) {
    db = await openDB<KaziDB>('kazi-offline', 1, {
      upgrade(db) {
        db.createObjectStore('drafts', { keyPath: 'id' })
        db.createObjectStore('cache', { keyPath: 'url' })
      },
    })
  }
  return db
}

// Save draft for offline editing
export async function saveDraft(type: string, id: string, data: any) {
  const database = await getDB()
  await database.put('drafts', {
    id: `${type}-${id}`,
    type: type as any,
    data,
    createdAt: Date.now(),
    synced: false,
  })
}

// Get all unsynced drafts
export async function getUnsyncedDrafts() {
  const database = await getDB()
  const drafts = await database.getAll('drafts')
  return drafts.filter((d) => !d.synced)
}

// Sync drafts when online
export async function syncDrafts() {
  if (!navigator.onLine) return

  const drafts = await getUnsyncedDrafts()

  for (const draft of drafts) {
    try {
      await fetch(`/api/${draft.type}s`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft.data),
      })

      // Mark as synced
      const database = await getDB()
      await database.put('drafts', { ...draft, synced: true })
    } catch (error) {
      console.error('Sync failed for', draft.id)
    }
  }
}
```

### Online/Offline Hook
```typescript
// hooks/use-online-status.ts
import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

---

# Phase 4: Security & Enterprise Features

## 4.1 Content Security Policy

### CSP with Subresource Integrity
```javascript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.supabase.co https://avatars.githubusercontent.com;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://api.openai.com https://api.anthropic.com;
  frame-src 'self' https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`

module.exports = {
  experimental: {
    sri: {
      algorithm: 'sha256',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}
```

## 4.2 Enterprise SAML SSO

### Supabase SAML Configuration
```bash
# Install/update Supabase CLI
npm install -g supabase@latest

# Check version (need v1.46.4+)
supabase -v

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

### Add SAML Provider via CLI
```bash
# Add SAML identity provider
supabase sso add \
  --type saml \
  --metadata-url "https://idp.example.com/metadata.xml" \
  --domains "example.com" \
  --attribute-mapping '{"keys":{"email":"email","name":"name"}}'
```

### Multi-Tenant SSO with RLS
```sql
-- Create organization settings table
CREATE TABLE organization_settings (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  sso_provider_id UUID UNIQUE,
  name TEXT NOT NULL,
  billing_plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- Policy for SSO-based access
CREATE POLICY "View organization settings via SSO"
ON organization_settings
AS RESTRICTIVE
USING (
  sso_provider_id = (SELECT auth.jwt()#>>'{amr,0,provider}')::UUID
);

-- Example: Tenant-specific data access
CREATE POLICY "Only view tenant data"
ON user_data
AS RESTRICTIVE
TO authenticated
USING (
  tenant_id = (SELECT auth.jwt()->'app_metadata'->>'provider')
);
```

### SSO Sign-In Implementation
```typescript
// lib/auth/sso.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function signInWithSSO(domain: string) {
  const { data, error } = await supabase.auth.signInWithSSO({
    domain,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error

  // Redirect to IdP
  if (data.url) {
    window.location.href = data.url
  }
}

// Check if user signed in via SSO
export async function checkSSOSession() {
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    const amr = session.user?.app_metadata?.amr
    return amr?.[0]?.method === 'sso/saml'
  }

  return false
}
```

## 4.3 Multi-Factor Authentication

### MFA Setup Flow
```typescript
// lib/auth/mfa.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Enroll in MFA
export async function enrollMFA() {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Authenticator App',
  })

  if (error) throw error

  return {
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    factorId: data.id,
  }
}

// Verify MFA code
export async function verifyMFA(factorId: string, code: string) {
  const { data: challenge } = await supabase.auth.mfa.challenge({
    factorId,
  })

  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge!.id,
    code,
  })

  if (error) throw error

  return data
}

// Check MFA status
export async function getMFAStatus() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  if (error) throw error

  return {
    currentLevel: data.currentLevel, // 'aal1' or 'aal2'
    nextLevel: data.nextLevel,
    factors: data.currentAuthenticationMethods,
  }
}
```

### MFA-Protected RLS Policy
```sql
-- Require MFA for sensitive operations
CREATE POLICY "Require MFA for escrow operations"
ON escrow_transactions FOR UPDATE
AS RESTRICTIVE
TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2');

CREATE POLICY "Require MFA for payout requests"
ON payout_requests FOR INSERT
AS RESTRICTIVE
TO authenticated
WITH CHECK ((SELECT auth.jwt()->>'aal') = 'aal2');
```

---

# Phase 5: Payment & Billing

## 5.1 Stripe Subscription Setup

### Initialize Stripe Client
```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  maxNetworkRetries: 2,
  timeout: 80000,
  telemetry: true,
  appInfo: {
    name: 'KAZI',
    version: '1.0.0',
    url: 'https://kazi.app',
  },
})
```

### Create Subscription Checkout
```typescript
// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, successUrl, cancelUrl } = await request.json()

    // Get or create Stripe customer
    let customerId = user.user_metadata?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      // Save to Supabase
      await supabase.auth.updateUser({
        data: { stripe_customer_id: customerId },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { user_id: user.id },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

### Webhook Handler
```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutComplete(session)
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionChange(subscription)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionCanceled(subscription)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentSuccess(invoice)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(invoice)
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id

  // Update user subscription status in Supabase
  await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date(),
    })
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date(),
    })
    .eq('stripe_subscription_id', subscription.id)
}
```

## 5.2 Escrow Payment System

### Escrow Database Schema
```sql
-- Escrow transactions table
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'released', 'disputed', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  funded_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escrow milestones
CREATE TABLE escrow_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID REFERENCES escrow_transactions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'released')),
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Escrow visible to participants"
ON escrow_transactions FOR SELECT
TO authenticated
USING (buyer_id = (SELECT auth.uid()) OR seller_id = (SELECT auth.uid()));

CREATE POLICY "Only buyer can fund escrow"
ON escrow_transactions FOR UPDATE
TO authenticated
USING (buyer_id = (SELECT auth.uid()) AND status = 'pending');
```

### Escrow API Implementation
```typescript
// app/api/escrow/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, sellerId, amount, milestones } = await request.json()

    // Create escrow transaction
    const { data: escrow, error } = await supabase
      .from('escrow_transactions')
      .insert({
        project_id: projectId,
        buyer_id: user.id,
        seller_id: sellerId,
        amount,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Create milestones
    if (milestones?.length) {
      await supabase.from('escrow_milestones').insert(
        milestones.map((m: any) => ({
          escrow_id: escrow.id,
          title: m.title,
          description: m.description,
          amount: m.amount,
          due_date: m.dueDate,
        }))
      )
    }

    // Create Stripe Payment Intent (held, not captured)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      capture_method: 'manual', // Don't capture immediately
      metadata: {
        escrow_id: escrow.id,
        buyer_id: user.id,
        seller_id: sellerId,
      },
    })

    // Update escrow with payment intent
    await supabase
      .from('escrow_transactions')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', escrow.id)

    return NextResponse.json({
      escrow,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Escrow creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create escrow' },
      { status: 500 }
    )
  }
}
```

### Release Escrow Milestone
```typescript
// app/api/escrow/release/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { milestoneId } = await request.json()

    // Get milestone and escrow
    const { data: milestone } = await supabase
      .from('escrow_milestones')
      .select('*, escrow:escrow_transactions(*)')
      .eq('id', milestoneId)
      .single()

    if (!milestone || milestone.escrow.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (milestone.status !== 'approved') {
      return NextResponse.json(
        { error: 'Milestone must be approved first' },
        { status: 400 }
      )
    }

    // Get seller's Stripe Connect account
    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id')
      .eq('id', milestone.escrow.seller_id)
      .single()

    if (!sellerProfile?.stripe_connect_account_id) {
      return NextResponse.json(
        { error: 'Seller has not connected Stripe' },
        { status: 400 }
      )
    }

    // Calculate platform fee (5%)
    const platformFee = Math.round(milestone.amount * 5) // 5 cents per dollar

    // Transfer to seller via Stripe Connect
    const transfer = await stripe.transfers.create({
      amount: Math.round(milestone.amount * 100) - platformFee,
      currency: 'usd',
      destination: sellerProfile.stripe_connect_account_id,
      transfer_group: milestone.escrow.id,
      metadata: {
        escrow_id: milestone.escrow.id,
        milestone_id: milestoneId,
      },
    })

    // Update milestone status
    await supabase
      .from('escrow_milestones')
      .update({
        status: 'released',
        released_at: new Date(),
      })
      .eq('id', milestoneId)

    // Check if all milestones released
    const { data: allMilestones } = await supabase
      .from('escrow_milestones')
      .select('status')
      .eq('escrow_id', milestone.escrow.id)

    const allReleased = allMilestones?.every((m) => m.status === 'released')

    if (allReleased) {
      await supabase
        .from('escrow_transactions')
        .update({
          status: 'released',
          released_at: new Date(),
        })
        .eq('id', milestone.escrow.id)
    }

    return NextResponse.json({
      success: true,
      transfer_id: transfer.id,
    })
  } catch (error) {
    console.error('Escrow release error:', error)
    return NextResponse.json(
      { error: 'Failed to release escrow' },
      { status: 500 }
    )
  }
}
```

---

# Phase 6: Mobile Strategy

## 6.1 Decision Matrix: PWA vs Native

| Factor | PWA | React Native (Expo) | Flutter |
|--------|-----|---------------------|---------|
| **Development Speed** | Fastest | Fast | Medium |
| **Code Reuse** | 100% | 85% | 70% |
| **Performance** | Good | Very Good | Best |
| **Native Features** | Limited | Full | Full |
| **App Store Presence** | No | Yes | Yes |
| **Offline Support** | Good | Excellent | Excellent |
| **Team Learning Curve** | None | Low (React) | Medium (Dart) |
| **Maintenance Cost** | Lowest | Medium | Medium |

### Recommended Approach: Phased Strategy

**Phase 1 (Launch): Enhanced PWA**
- Focus on PWA excellence
- Invest in offline capabilities
- Implement push notifications
- Add to home screen prompts

**Phase 2 (Month 3-4): Expo Mobile App**
- Leverage existing React/TypeScript code
- ~85% code sharing with web
- Use Expo managed workflow
- Deploy to App Store and Play Store

**Phase 3 (If Needed): Native Features**
- Eject from Expo managed workflow
- Add native modules as needed
- Consider Flutter only for performance-critical features

## 6.2 PWA Install Prompt

```typescript
// components/pwa-install-prompt.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after 30 seconds on the page
      setTimeout(() => setShowPrompt(true), 30000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installed')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt && !isIOS) return null

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install KAZI App</DialogTitle>
          <DialogDescription>
            Get the full app experience with offline support,
            faster loading, and easy access from your home screen.
          </DialogDescription>
        </DialogHeader>

        {isIOS ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To install on iOS:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Tap the Share button in Safari</li>
              <li>Scroll and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPrompt(false)}>
              Maybe Later
            </Button>
            <Button onClick={handleInstall}>
              Install App
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

## 6.3 Push Notifications

### Request Permission
```typescript
// lib/push-notifications.ts
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  })

  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })

  return subscription
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
```

---

# Phase 7: Integrations & API

## 7.1 API Documentation Structure

```typescript
// app/api/v1/docs/route.ts
import { NextResponse } from 'next/server'

const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'KAZI API',
    version: '1.0.0',
    description: 'API for the KAZI creative platform',
  },
  servers: [
    { url: 'https://api.kazi.app/v1', description: 'Production' },
    { url: 'http://localhost:3000/api/v1', description: 'Development' },
  ],
  paths: {
    '/projects': {
      get: {
        summary: 'List projects',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of projects' },
        },
      },
      post: {
        summary: 'Create project',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProject' },
            },
          },
        },
        responses: {
          201: { description: 'Project created' },
        },
      },
    },
    // ... more endpoints
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
    schemas: {
      CreateProject: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          client_id: { type: 'string', format: 'uuid' },
          budget: { type: 'number' },
        },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(apiDocs)
}
```

## 7.2 Webhook System

### Webhook Configuration Table
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status INTEGER,
  response TEXT,
  delivered_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Webhook Dispatcher
```typescript
// lib/webhooks/dispatcher.ts
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function dispatchWebhook(
  userId: string,
  eventType: string,
  payload: any
) {
  const supabase = await createClient()

  // Get active webhooks for this event
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .contains('events', [eventType])

  if (!webhooks?.length) return

  for (const webhook of webhooks) {
    const timestamp = Date.now()
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(`${timestamp}.${JSON.stringify(payload)}`)
      .digest('hex')

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KAZI-Signature': `t=${timestamp},v1=${signature}`,
          'X-KAZI-Event': eventType,
        },
        body: JSON.stringify(payload),
      })

      // Log delivery
      await supabase.from('webhook_deliveries').insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        status: response.status,
        response: await response.text(),
      })
    } catch (error) {
      await supabase.from('webhook_deliveries').insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        status: 0,
        response: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
```

## 7.3 Third-Party Integrations

### Integration Framework
```typescript
// lib/integrations/base.ts
export interface Integration {
  id: string
  name: string
  description: string
  icon: string
  category: 'storage' | 'calendar' | 'communication' | 'accounting' | 'crm'
  connect: (userId: string) => Promise<string> // Returns OAuth URL
  disconnect: (userId: string) => Promise<void>
  sync: (userId: string, data: any) => Promise<void>
}

// Example: Google Calendar Integration
export const googleCalendarIntegration: Integration = {
  id: 'google-calendar',
  name: 'Google Calendar',
  description: 'Sync bookings with Google Calendar',
  icon: '/integrations/google-calendar.svg',
  category: 'calendar',

  async connect(userId) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar',
      access_type: 'offline',
      state: userId,
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  },

  async disconnect(userId) {
    // Revoke token and remove from DB
  },

  async sync(userId, booking) {
    // Create calendar event
  },
}
```

---

# Phase 8: Launch Checklist

## 8.1 Technical Checklist

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] No console errors on any page
- [ ] All ESLint warnings resolved
- [ ] All pages have error boundaries
- [ ] All pages have loading states
- [ ] All forms have validation
- [ ] All buttons have click handlers

### Performance
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] Lighthouse Best Practices > 95
- [ ] Lighthouse SEO > 95
- [ ] Core Web Vitals passing
- [ ] Bundle size < 500kb initial load
- [ ] Images optimized with next/image

### Security
- [ ] RLS enabled on all tables
- [ ] RLS policies tested
- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] API rate limiting
- [ ] Input sanitization
- [ ] SQL injection prevention (Supabase handles)
- [ ] XSS prevention

### Infrastructure
- [ ] Production environment configured
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Error monitoring (Sentry) setup
- [ ] Analytics configured
- [ ] CDN configured
- [ ] SSL certificates valid
- [ ] DNS configured

## 8.2 Business Checklist

### Legal
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Cookie Policy + consent
- [ ] GDPR compliance
- [ ] Escrow terms of service
- [ ] Refund policy

### Payments
- [ ] Stripe account verified
- [ ] Test transactions successful
- [ ] Webhook endpoints working
- [ ] Subscription flows tested
- [ ] Escrow flows tested
- [ ] Refund process documented

### Support
- [ ] Help center articles written
- [ ] FAQ page created
- [ ] Contact form working
- [ ] Support email configured
- [ ] Intercom/chat widget (optional)

## 8.3 Marketing Checklist

### Launch Assets
- [ ] Landing page optimized
- [ ] Pricing page ready
- [ ] Comparison pages created
- [ ] Product screenshots
- [ ] Demo video created
- [ ] Press kit prepared

### Launch Channels
- [ ] Product Hunt prepared
- [ ] Social media scheduled
- [ ] Email launch sequence ready
- [ ] Influencer outreach done
- [ ] Press release written
- [ ] Beta tester testimonials collected

### SEO
- [ ] Meta tags on all pages
- [ ] Open Graph tags
- [ ] Twitter cards
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Structured data (JSON-LD)

---

# Code Implementation Examples

## Complete Page Template

```typescript
// app/(app)/dashboard/projects/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectsList } from '@/components/projects/projects-list'
import { ProjectsHeader } from '@/components/projects/projects-header'
import { ProjectsSkeleton } from '@/components/projects/projects-skeleton'

export const metadata = {
  title: 'Projects | KAZI',
  description: 'Manage your projects',
}

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container py-8">
      <ProjectsHeader />

      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsListWrapper userId={user.id} />
      </Suspense>
    </div>
  )
}

async function ProjectsListWrapper({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, name, email),
      milestones:project_milestones(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to load projects')
  }

  return <ProjectsList projects={projects} />
}
```

## API Route Template

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { dispatchWebhook } from '@/lib/webhooks/dispatcher'

const createProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  client_id: z.string().uuid().optional(),
  budget: z.number().positive().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('projects')
      .select('*, client:clients(id, name)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createProjectSchema.parse(body)

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...validated,
        user_id: user.id,
        status: 'planning',
        progress: 0,
      })
      .select()
      .single()

    if (error) throw error

    // Dispatch webhook
    await dispatchWebhook(user.id, 'project.created', project)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('POST /api/projects error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
```

---

# Implementation Timeline

## Week 1: Critical Fixes
- Day 1-2: RLS policies and security audit
- Day 3-4: Performance optimization
- Day 5: Error boundaries and loading states

## Week 2: PWA & Mobile
- Day 1-2: PWA manifest and service worker
- Day 3-4: Offline support with IndexedDB
- Day 5: Push notifications

## Week 3: Enterprise Features
- Day 1-2: SAML SSO implementation
- Day 3: MFA setup
- Day 4-5: API documentation

## Week 4: Payments & Launch Prep
- Day 1-2: Stripe subscription testing
- Day 3: Escrow system testing
- Day 4-5: Launch checklist completion

## Post-Launch: Month 2
- Native mobile app development (Expo)
- Advanced integrations
- Enterprise features expansion

---

# Resources & References

## Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Framer Motion Docs](https://motion.dev/docs)

## Context7 Research Sources
- Next.js: `/vercel/next.js` - Production optimization, deployment
- Supabase: `/supabase/supabase` - RLS, authentication, enterprise SSO
- Stripe: `/stripe/stripe-node` - Subscriptions, webhooks, Connect
- Motion: `/websites/motion-dev-docs` - Animation performance, gestures

## PWA Resources
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Workbox](https://developer.chrome.com/docs/workbox)
- [PWA Builder](https://www.pwabuilder.com/)

## Mobile Development
- [Expo](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/docs/getting-started)

---

*Document Version: 1.0*
*Generated: January 29, 2026*
*Based on: Context7 MCP Research + Web Search Analysis*
