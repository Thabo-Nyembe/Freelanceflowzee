# Kazi Brand Guidelines & Implementation Guide

## 🎨 Color Palette

### Primary Brand Colors
- **Jet Black** (`#0E0E11`) - Primary background for dark mode
- **Violet Bolt** (`#6E4BFF`) - Primary accent color for buttons and highlights
- **Electric Turquoise** (`#23E6B5`) - Secondary accent for interactive elements
- **Soft Ivory** (`#F8F7F4`) - Primary background for light mode

### Tailwind CSS Classes
```css
.kazi-bg-dark { background-color: #0E0E11; }
.kazi-bg-light { background-color: #F8F7F4; }
.kazi-text-primary { color: #6E4BFF; }
.kazi-text-accent { color: #23E6B5; }
.kazi-text-dark { color: #0E0E11; }
.kazi-text-light { color: #F8F7F4; }
```

## 🔤 Typography

### Font Families
- **Headlines**: Neue Haas Grotesk (fallback: Inter)
- **Body Text**: Inter
- **Special Elements**: Kazi Serif (custom)

### CSS Classes
```css
.kazi-headline { font-family: 'Neue Haas Grotesk', 'Inter', sans-serif; font-weight: 700; }
.kazi-body { font-family: 'Inter', sans-serif; font-weight: 400; }
.kazi-body-medium { font-family: 'Inter', sans-serif; font-weight: 500; }
```

## 🎯 Component Usage

### Buttons
```tsx
// Primary Kazi Button
<Button variant="kazi" size="kaziDefault">Primary Action</Button>

// Secondary Kazi Button
<Button variant="kaziOutline" size="kaziDefault">Secondary Action</Button>

// Ghost Button
<Button variant="kaziGhost">Ghost Action</Button>

// Link Button
<Button variant="kaziLink">Link Action</Button>
```

### Loading States
```tsx
// Standard Loading Spinner
<KaziLoading size="md" text="Loading..." />

// Loading Dots
<KaziLoadingDots />

// Progress Bar
<KaziLoadingBar progress={75} />

// Skeleton Loading
<KaziLoadingSkeleton />
```

## 🌗 Dark/Light Mode

### Light Mode
- Background: Soft Ivory (#F8F7F4)
- Primary Text: Jet Black (#0E0E11)
- Buttons: Violet Bolt (#6E4BFF)
- Accents: Electric Turquoise (#23E6B5)

### Dark Mode
- Background: Jet Black (#0E0E11)
- Primary Text: Soft Ivory (#F8F7F4)
- Buttons: Violet Bolt (#6E4BFF)
- Accents: Electric Turquoise (#23E6B5)

## ✨ Animation Guidelines

### Transitions
- **Duration**: 300ms for most interactions
- **Easing**: ease-in-out for smooth animations
- **Hover Effects**: Scale 1.05 for interactive elements

### Micro-interactions
- **Ripple Effect**: Available via `kazi-ripple` class
- **Hover Scale**: Available via `kazi-hover-scale` class
- **Fade In**: Available via `kazi-fade-in` class

## 🎪 Interactive Elements

### Focus States
- Outline: 2px solid Electric Turquoise
- Outline offset: 2px
- Use `kazi-focus` class for consistent focus styling

### Hover Effects
- Buttons: Gradient sweep from Violet Bolt to Electric Turquoise
- Cards: Subtle shadow increase and scale
- Links: Color transition to Electric Turquoise

## 🚀 Best Practices

### Do's
- Use consistent spacing (multiples of 4px)
- Maintain proper contrast ratios for accessibility
- Apply brand colors consistently across components
- Use Inter font for body text and Neue Haas Grotesk for headlines

### Don'ts
- Don't use colors outside the brand palette
- Don't mix font families within the same component
- Don't create animations longer than 400ms
- Don't use hard transitions (always use easing)

## 📱 Responsive Design

### Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Guidelines
- Use `kazi-hover-scale` only on desktop (hover states)
- Increase touch target sizes on mobile
- Maintain consistent spacing across breakpoints

## 🔍 SEO & Accessibility

### Required Elements
- Alt text for all images using brand keywords
- Proper heading hierarchy (H1, H2, H3)
- Focus indicators on all interactive elements
- Color contrast ratios meeting WCAG AA standards

### Brand Keywords
- Kazi workspace
- AI project management
- Secure payments platform
- All-in-one workspace
- Best SaaS for freelancers
- Creative project management
- Elegant productivity tools
- African tech innovation

## 🛠️ Implementation Examples

### Card Component
```tsx
<div className="kazi-card kazi-hover-scale">
  <div className="p-6">
    <h3 className="kazi-headline kazi-text-dark dark:kazi-text-light">Card Title</h3>
    <p className="kazi-body text-gray-600 dark:text-gray-300">Card content</p>
  </div>
</div>
```

### Navigation Item
```tsx
<Link 
  href="/dashboard" 
  className="kazi-body-medium kazi-text-primary hover:kazi-text-accent transition-colors duration-300"
>
  Dashboard
</Link>
```

### Input Field
```tsx
<Input 
  className="kazi-body border-violet-bolt/20 focus:border-violet-bolt focus:ring-electric-turquoise"
  placeholder="Enter your email"
/>
```

## 📊 Usage Analytics

Track the following metrics to ensure brand consistency:
- Button click rates by variant
- User engagement with branded elements
- Accessibility compliance scores
- Performance impact of animations

## 🔄 Updates & Maintenance

### Version Control
- Document all brand changes in this file
- Test all components after color updates
- Ensure backward compatibility when possible

### Testing Checklist
- [ ] All colors render correctly in both light and dark modes
- [ ] Animations are smooth and perform well
- [ ] Accessibility standards are met
- [ ] Brand consistency across all components
- [ ] Typography renders correctly across browsers