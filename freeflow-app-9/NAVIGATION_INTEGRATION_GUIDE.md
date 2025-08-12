# KAZI Platform – Navigation Integration Guide  
_File: `NAVIGATION_INTEGRATION_GUIDE.md`_  

> This document explains how to embed the new **EnhancedNavigation** header and **ContextualSidebar** into any dashboard page. Keep it handy when creating new routes or refactoring existing ones.

---

## 1. Installing & Importing Components

Both components already live under `components/ui/`.

```tsx
// top of your page/layout
import { EnhancedNavigation } from '@/components/ui/enhanced-navigation'
import { ContextualSidebar } from '@/components/ui/contextual-sidebar'
```

No additional dependencies are required – all peer packages (`lucide-react`, `@dnd-kit`, `framer-motion`) are already part of the repo.

---

## 2. Basic Integration Pattern

Most dashboard pages follow the **sidebar–content** layout:

```tsx
// app/(app)/dashboard/your-page/layout.tsx
'use client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* LEFT – contextual navigation */}
      <ContextualSidebar />

      {/* RIGHT – page wrapper */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Sticky header */}
        <EnhancedNavigation />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

1. `ContextualSidebar` must render _once_ at the root of a dashboard layout.  
2. `EnhancedNavigation` can be placed per-page **or** inside the layout; it self-configures via `usePathname`.

---

## 3. Component Props & Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **EnhancedNavigation** |
| `variant` | `'default' \| 'minimal' \| 'expanded'` | `'default'` | Pre-sets padding & which rows are visible. |
| `showBreadcrumbs` | `boolean` | `true` | Toggles breadcrumbs row. |
| `showRelated` | `boolean` | `true` | Show related features chips. |
| `showQuickActions` | `boolean` | `true` | Show context Quick Actions. |
| `showWorkflowNav` | `boolean` | `true` | Back / Next workflow buttons. |
| `showSearch` | `boolean` | `true` | ⌘K quick search. |
| `onNavigate` | `(path:string)=>void` | `router.push` | Override navigation handler for analytics or custom routing. |
| **ContextualSidebar** |
| `defaultExpanded` | `boolean` | `true` | Initial open / rail mode. |
| `defaultWorkspace` | `'default' \| 'creative' \| 'business' \| 'developer'` | `'default'` | Selected workspace on first load. |
| `className` | `string` | — | Tailwind classes for extra sizing / theming. |
| `onNavigate` | `(path:string)=>void` | `router.push` | Handle navigation externally if needed. |

All other behaviour (Favorites, Recently Used, drag-and-drop) is automatic and persisted to `localStorage`.

---

## 4. Example Usage Scenarios

### 4.1 Content-Heavy Page (default)

```tsx
<ContextualSidebar />
<div className="flex-1 flex flex-col">
  <EnhancedNavigation variant="default" />
  <main className="p-6">{/* … */}</main>
</div>
```

### 4.2 Wizard / Multi-step Flow  
Use the *minimal* header plus workflow navigation.

```tsx
<EnhancedNavigation
  variant="minimal"
  showQuickActions={false}
  showRelated={false}
/>
```

### 4.3 Marketing-Style Dashboard Page  
Hide breadcrumbs & sidebar altogether, but keep search.

```tsx
<EnhancedNavigation
  showBreadcrumbs={false}
  showWorkflowNav={false}
/>
```

---

## 5. Best Practices

1. **Single Source** – Import components from `@/components/ui/*`; avoid local copies.  
2. **Layout Driven** – Compose inside `layout.tsx` so all nested pages inherit nav automatically.  
3. **Granular Overrides** – Prefer prop overrides (`showQuickActions` etc.) instead of forking the component.  
4. **Semantic Routes** – Ensure dashboard sub-paths map 1-to-1 with `featureCategories` keys; breadcrumbs & related logic rely on this.  
5. **Keep Path Shallow** – Deeply nested paths are supported, but UX is clearest when depth ≤ 2.  

---

## 6. Customisation Options

### 6.1 Tailwind / Theme
Both components use utility classes – override via `className` or apply [Tailwind’s `@layer`](https://tailwindcss.com/docs/functions-and-directives#layer).

```css
/* e.g. make sidebar dark-blue */
@layer components {
  .sidebar-dark {
    @apply bg-[#0d1b2a] text-white;
  }
}
```

```tsx
<ContextualSidebar className="sidebar-dark" />
```

### 6.2 Extending Feature Maps  
To add a new tool:

```ts
// enhanced-navigation.tsx
featureCategories.core.push({
  name: 'New Tool',
  path: 'new-tool',
  icon: Sparkles,
  description: 'Describe me'
})
relatedFeaturesMap['new-tool'] = [{ category: 'core', path: 'analytics' }]
quickActionsMap['new-tool'] = [
  { name: 'Do XYZ', path: 'new-tool/action', icon: Zap }
]
```

### 6.3 Dynamic Import

For rarely used routes, you can lazy-load the sidebar:

```tsx
const ContextualSidebar = dynamic(
  () => import('@/components/ui/contextual-sidebar').then(m => m.ContextualSidebar),
  { ssr: false, loading: () => <div className="w-16" /> }
)
```

---

## 7. Performance Considerations

| Concern | Mitigation |
|---------|------------|
| **Bundle size** | Icons are tree-shaken; maps are simple objects (<2 KB). |
| **Initial Paint** | Components render instantly on client; consider suspense/dynamic import for low-prior pages. |
| **Drag-and-Drop** | `@dnd-kit` loads in sidebar only. No impact when collapsed on mobile. |
| **Re-renders** | Memoisation (`useMemo`, `useEffect`) prevents unnecessary renders when typing/searching. |
| **LocalStorage** | Reads occur once on mount; writes are debounced by React state batching. |

---

## 8. Troubleshooting & FAQ

| Question | Answer |
|----------|--------|
| Breadcrumb names look wrong | Confirm your path segment is registered in `featureCategories`; otherwise it auto-capitalises the slug. |
| Sidebar doesn’t open with ⌘. | Ensure the component is mounted at page root; shortcut listener attaches on mount. |
| Favorites not saved | Check browser _Storage > Local Storage_ for `kazi-sidebar-favorites`. Clearing will reset state. |

---

### Happy Shipping! 🚀  
For further questions, open an issue in the **#kazi-navigation** Slack channel.
