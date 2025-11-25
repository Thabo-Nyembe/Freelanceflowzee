# OAuth Login Page - Visual Preview

## Login Page Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              Welcome to Kazi                        │
│         Sign in to access your dashboard            │
│                                                     │
│     ┌─────────────────────────────────────┐        │
│     │    Or continue with                 │        │
│     └─────────────────────────────────────┘        │
│                                                     │
│     ┌────┐  ┌────┐  ┌────┐                        │
│     │ 🔍 │  │ 🐙 │  │ 💼 │                        │
│     └────┘  └────┘  └────┘                        │
│     Google  GitHub  LinkedIn                       │
│                                                     │
│     ┌────┐  ┌────┐  ┌────┐                        │
│     │ 🍎 │  │ 🎨 │  │ 🦊 │                        │
│     └────┘  └────┘  └────┘                        │
│     Apple   Figma   GitLab                         │
│                                                     │
│     ┌────┐  ┌────┐  ┌────┐                        │
│     │ 📓 │  │ 📹 │  │ 💬 │                        │
│     └────┘  └────┘  └────┘                        │
│     Notion  Zoom    Slack                          │
│                                                     │
│     ┌─────────────────────────────────────┐        │
│     │        Or with email                │        │
│     └─────────────────────────────────────┘        │
│                                                     │
│     Email                                          │
│     ┌─────────────────────────────────────┐        │
│     │ you@example.com                     │        │
│     └─────────────────────────────────────┘        │
│                                                     │
│     Password              Forgot password?         │
│     ┌─────────────────────────────────────┐        │
│     │ ••••••••                            │        │
│     └─────────────────────────────────────┘        │
│                                                     │
│     ┌─────────────────────────────────────┐        │
│     │          Sign in                    │        │
│     └─────────────────────────────────────┘        │
│                                                     │
│     Don't have an account? Sign up                 │
│                                                     │
│     ┌─────────────────────────────────────┐        │
│     │ Test Account:                       │        │
│     │ test@kazi.dev / Trapster103         │        │
│     └─────────────────────────────────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## OAuth Provider Buttons

### Visual Design

```
Row 1 (Primary - Most Popular):
┌────────────┐  ┌────────────┐  ┌────────────┐
│   Google   │  │   GitHub   │  │  LinkedIn  │
│     🔍     │  │     🐙     │  │     💼     │
│   White    │  │   Black    │  │    Blue    │
└────────────┘  └────────────┘  └────────────┘

Row 2 (Secondary):
┌────────────┐  ┌────────────┐  ┌────────────┐
│   Apple    │  │   Figma    │  │   GitLab   │
│     🍎     │  │     🎨     │  │     🦊     │
│   Black    │  │   White    │  │   Orange   │
└────────────┘  └────────────┘  └────────────┘

Row 3 (Tertiary):
┌────────────┐  ┌────────────┐  ┌────────────┐
│   Notion   │  │    Zoom    │  │   Slack    │
│     📓     │  │     📹     │  │     💬     │
│   White    │  │    Blue    │  │   Purple   │
└────────────┘  └────────────┘  └────────────┘
```

## Brand Colors

| Provider | Background | Text | Hover |
|----------|-----------|------|-------|
| Google   | White (#FFF) | Gray (#1F2937) | Gray-50 |
| GitHub   | Black (#24292e) | White | Darker |
| LinkedIn | Blue (#0077b5) | White | Darker |
| Apple    | Black (#000) | White | Gray-900 |
| Figma    | White (#FFF) | Red (#F24E1E) | Border |
| GitLab   | Orange (#FC6D26) | White | Darker |
| Notion   | White (#FFF) | Black | Border |
| Zoom     | Blue (#2D8CFF) | White | Darker |
| Slack    | Purple (#4A154B) | White | Darker |

## Interaction States

### Normal State
```
┌──────────────┐
│   Provider   │  ← Button with icon
└──────────────┘
```

### Hover State
```
┌──────────────┐
│   Provider   │  ← Darker background
└──────────────┘
    ↑ cursor: pointer
```

### Loading State
```
┌──────────────┐
│      ⟳      │  ← Spinning loader
└──────────────┘
```

### Disabled State
```
┌──────────────┐
│   Provider   │  ← Grayed out
└──────────────┘
    ↑ cursor: not-allowed
```

## Responsive Design

### Desktop (>768px)
```
3x3 grid of OAuth buttons
Full-width email form
Spacious padding
```

### Tablet (768px)
```
3x3 grid (slightly smaller)
Full-width email form
```

### Mobile (<640px)
```
Stacked OAuth buttons (1 column)
Or 2x2 grid if space allows
Full-width email form
```

## Color Scheme

- **Background**: Gradient from blue-50 to indigo-100
- **Card**: White with shadow-xl
- **Borders**: Gray-300
- **Text**: Gray-900 (headings), Gray-600 (body)
- **Links**: Blue-600 (hover: Blue-700)
- **Buttons**: Primary blue or branded colors

## Page URL

```
Development:  http://localhost:9323/login
Production:   https://kazi.dev/login
```

## Alternative Layouts

### Layout 1: Compact (Current)
- 3x3 grid of icon-only buttons
- Labels below each row
- Minimal space

### Layout 2: Full Labels (Alternative)
- Stacked buttons with text
- "Continue with Google"
- Takes more vertical space
- Better for accessibility

To use Layout 2, import `OAuthProvidersWithLabels` instead:
```tsx
import { OAuthProvidersWithLabels } from '@/components/auth/OAuthProviders'

// In page:
<OAuthProvidersWithLabels />
```

## Accessibility

✅ **Keyboard Navigation**: Tab through buttons
✅ **Screen Readers**: ARIA labels on all buttons
✅ **High Contrast**: Meets WCAG AA standards
✅ **Focus Indicators**: Visible focus rings
✅ **Error Messages**: Toast notifications with descriptions

## User Experience

1. **Fast**: One-click sign in
2. **Familiar**: Standard OAuth flow
3. **Safe**: HTTPS and PKCE flow
4. **Clear**: Loading states and error messages
5. **Flexible**: Email/password fallback

---

**Visit the login page**: `http://localhost:9323/login` (after `npm run dev`)
