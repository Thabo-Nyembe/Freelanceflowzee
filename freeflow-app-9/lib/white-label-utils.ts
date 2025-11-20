/**
 * White Label Utilities
 * Helper functions and mock data for white label system
 */

import {
  WhiteLabelConfig,
  BrandingPreset,
  WhiteLabelTemplate,
  DomainVerification,
  ColorScheme,
  FontFamily
} from './white-label-types'

export const DEFAULT_LIGHT_COLORS: ColorScheme = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#ffffff',
  foreground: '#0f172a',
  muted: '#f1f5f9',
  border: '#e2e8f0'
}

export const DEFAULT_DARK_COLORS: ColorScheme = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#0f172a',
  foreground: '#f8fafc',
  muted: '#1e293b',
  border: '#334155'
}

export const BRANDING_PRESETS: BrandingPreset[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean and professional with blue accents',
    category: 'modern',
    colors: {
      light: {
        primary: '#3b82f6',
        secondary: '#1d4ed8',
        accent: '#06b6d4'
      },
      dark: {
        primary: '#60a5fa',
        secondary: '#3b82f6',
        accent: '#22d3ee'
      }
    },
    typography: {
      fontFamily: 'inter',
      headingFontFamily: 'inter'
    },
    preview: '/presets/modern-blue.png',
    popularity: 95
  },
  {
    id: 'professional-navy',
    name: 'Professional Navy',
    description: 'Corporate and trustworthy design',
    category: 'professional',
    colors: {
      light: {
        primary: '#1e40af',
        secondary: '#475569',
        accent: '#0891b2'
      },
      dark: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#06b6d4'
      }
    },
    typography: {
      fontFamily: 'roboto',
      headingFontFamily: 'roboto'
    },
    preview: '/presets/professional-navy.png',
    popularity: 88
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    description: 'Bold and innovative with purple gradient',
    category: 'creative',
    colors: {
      light: {
        primary: '#8b5cf6',
        secondary: '#a855f7',
        accent: '#ec4899'
      },
      dark: {
        primary: '#a78bfa',
        secondary: '#c084fc',
        accent: '#f472b6'
      }
    },
    typography: {
      fontFamily: 'poppins',
      headingFontFamily: 'poppins'
    },
    preview: '/presets/creative-purple.png',
    popularity: 82
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    description: 'Simple and elegant monochrome',
    category: 'minimal',
    colors: {
      light: {
        primary: '#475569',
        secondary: '#64748b',
        accent: '#94a3b8'
      },
      dark: {
        primary: '#94a3b8',
        secondary: '#cbd5e1',
        accent: '#e2e8f0'
      }
    },
    typography: {
      fontFamily: 'inter',
      headingFontFamily: 'inter'
    },
    preview: '/presets/minimal-gray.png',
    popularity: 75
  },
  {
    id: 'bold-red',
    name: 'Bold Red',
    description: 'Energetic and attention-grabbing',
    category: 'bold',
    colors: {
      light: {
        primary: '#dc2626',
        secondary: '#b91c1c',
        accent: '#f59e0b'
      },
      dark: {
        primary: '#ef4444',
        secondary: '#dc2626',
        accent: '#fbbf24'
      }
    },
    typography: {
      fontFamily: 'montserrat',
      headingFontFamily: 'montserrat'
    },
    preview: '/presets/bold-red.png',
    popularity: 70
  },
  {
    id: 'fresh-green',
    name: 'Fresh Green',
    description: 'Natural and growth-oriented',
    category: 'modern',
    colors: {
      light: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#14b8a6'
      },
      dark: {
        primary: '#34d399',
        secondary: '#10b981',
        accent: '#2dd4bf'
      }
    },
    typography: {
      fontFamily: 'lato',
      headingFontFamily: 'lato'
    },
    preview: '/presets/fresh-green.png',
    popularity: 78
  }
]

export const WHITE_LABEL_TEMPLATES: WhiteLabelTemplate[] = [
  {
    id: 'agency-pro',
    name: 'Agency Pro',
    description: 'Perfect for creative agencies and design studios',
    industry: 'Creative Agency',
    preset: BRANDING_PRESETS[2], // creative-purple
    sampleAssets: {
      logo: {
        light: '/templates/agency-logo-light.svg',
        dark: '/templates/agency-logo-dark.svg',
        favicon: '/templates/agency-favicon.ico',
        iconOnly: '/templates/agency-icon.svg'
      },
      images: {},
      socialMedia: {}
    },
    features: ['Custom domain', 'Email branding', 'Client portal', 'Project showcase'],
    isPopular: true
  },
  {
    id: 'corporate-suite',
    name: 'Corporate Suite',
    description: 'Professional branding for enterprise businesses',
    industry: 'Enterprise',
    preset: BRANDING_PRESETS[1], // professional-navy
    sampleAssets: {
      logo: {
        light: '/templates/corporate-logo-light.svg',
        dark: '/templates/corporate-logo-dark.svg',
        favicon: '/templates/corporate-favicon.ico',
        iconOnly: '/templates/corporate-icon.svg'
      },
      images: {},
      socialMedia: {}
    },
    features: ['Custom domain', 'SSO integration', 'Advanced analytics', 'White-glove support'],
    isPopular: true
  },
  {
    id: 'startup-launch',
    name: 'Startup Launch',
    description: 'Modern and minimal for startups and SaaS',
    industry: 'Startup',
    preset: BRANDING_PRESETS[0], // modern-blue
    sampleAssets: {
      logo: {
        light: '/templates/startup-logo-light.svg',
        dark: '/templates/startup-logo-dark.svg',
        favicon: '/templates/startup-favicon.ico',
        iconOnly: '/templates/startup-icon.svg'
      },
      images: {},
      socialMedia: {}
    },
    features: ['Quick setup', 'Custom domain', 'Email templates', 'Growth analytics'],
    isPopular: false
  }
]

export const MOCK_WHITE_LABEL_CONFIG: WhiteLabelConfig = {
  id: 'wl-1',
  organizationId: 'org-1',
  isActive: true,
  brandName: 'Acme Corporation',
  displayName: 'Acme Studio',
  tagline: 'Create. Collaborate. Deliver.',
  description: 'Professional creative collaboration platform',
  assets: {
    logo: {
      light: '/branding/acme-light.svg',
      dark: '/branding/acme-dark.svg',
      favicon: '/branding/acme-favicon.ico',
      iconOnly: '/branding/acme-icon.svg'
    },
    images: {
      loginBackground: '/branding/acme-login-bg.jpg',
      dashboardBackground: '/branding/acme-dashboard-bg.jpg'
    },
    socialMedia: {
      ogImage: '/branding/acme-og.jpg'
    }
  },
  colors: {
    light: DEFAULT_LIGHT_COLORS,
    dark: DEFAULT_DARK_COLORS
  },
  typography: {
    fontFamily: 'inter',
    baseFontSize: 16,
    headingFontFamily: 'inter'
  },
  customDomain: {
    domain: 'studio.acme.com',
    isVerified: true,
    sslEnabled: true
  },
  emailBranding: {
    fromName: 'Acme Studio',
    fromEmail: 'hello@acme.com',
    replyToEmail: 'support@acme.com',
    footerText: '© 2025 Acme Corporation. All rights reserved.',
    socialLinks: {
      twitter: 'https://twitter.com/acmecorp',
      linkedin: 'https://linkedin.com/company/acmecorp'
    }
  },
  seo: {
    metaTitle: 'Acme Studio - Creative Collaboration Platform',
    metaDescription: 'Professional tools for creative teams to collaborate and deliver exceptional work.',
    keywords: ['creative', 'collaboration', 'design', 'studio'],
    analyticsId: 'G-XXXXXXXXXX'
  },
  features: {
    hideKaziBranding: true,
    showPoweredBy: false,
    customFooter: 'Made with ❤️ by Acme Corporation'
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2025-01-18')
}

export const MOCK_DOMAIN_VERIFICATION: DomainVerification = {
  domain: 'studio.acme.com',
  status: 'verified',
  records: [
    {
      type: 'CNAME',
      name: 'studio',
      value: 'kazi.custom-domain.com',
      status: 'verified'
    },
    {
      type: 'TXT',
      name: '_kazi-verify',
      value: 'kazi-site-verification=abc123xyz789',
      status: 'verified'
    }
  ],
  verifiedAt: new Date('2025-01-10'),
  lastChecked: new Date()
}

export const FONT_OPTIONS: Array<{ id: FontFamily; name: string; preview: string; category: string }> = [
  { id: 'inter', name: 'Inter', preview: 'The quick brown fox jumps over the lazy dog', category: 'Sans-serif' },
  { id: 'roboto', name: 'Roboto', preview: 'The quick brown fox jumps over the lazy dog', category: 'Sans-serif' },
  { id: 'open-sans', name: 'Open Sans', preview: 'The quick brown fox jumps over the lazy dog', category: 'Sans-serif' },
  { id: 'lato', name: 'Lato', preview: 'The quick brown fox jumps over the lazy dog', category: 'Sans-serif' },
  { id: 'montserrat', name: 'Montserrat', preview: 'The quick brown fox jumps over the lazy dog', category: 'Sans-serif' },
  { id: 'poppins', name: 'Poppins', preview: 'The quick brown fox jumps over the lazy dog', category: 'Sans-serif' }
]

// Helper Functions
export function generateCssVariables(colors: ColorScheme): string {
  return Object.entries(colors)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')
}

export function generateThemeJson(config: WhiteLabelConfig): string {
  return JSON.stringify(
    {
      name: config.brandName,
      colors: config.colors,
      typography: config.typography,
      assets: config.assets
    },
    null,
    2
  )
}

export function validateCustomDomain(domain: string): {
  isValid: boolean
  error?: string
} {
  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, '')

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*\.[a-zA-Z]{2,}$/

  if (!domainRegex.test(domain)) {
    return {
      isValid: false,
      error: 'Invalid domain format. Please enter a valid domain (e.g., studio.yourdomain.com)'
    }
  }

  if (domain.includes('kazi.com')) {
    return {
      isValid: false,
      error: 'Cannot use kazi.com domain for custom branding'
    }
  }

  return { isValid: true }
}

export function validateColorHex(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}

export function generatePreviewUrl(configId: string): string {
  return `https://preview.kazi.com/${configId}`
}

export function calculateBrandingScore(config: WhiteLabelConfig): {
  score: number
  breakdown: Record<string, number>
} {
  const breakdown = {
    assets: 0,
    colors: 0,
    typography: 0,
    domain: 0,
    email: 0,
    seo: 0
  }

  // Assets (30 points)
  if (config.assets.logo.light && config.assets.logo.dark) breakdown.assets += 15
  if (config.assets.logo.favicon) breakdown.assets += 5
  if (config.assets.images.loginBackground) breakdown.assets += 5
  if (config.assets.images.dashboardBackground) breakdown.assets += 5

  // Colors (20 points)
  if (config.colors.light.primary !== DEFAULT_LIGHT_COLORS.primary) breakdown.colors += 10
  if (config.colors.dark.primary !== DEFAULT_DARK_COLORS.primary) breakdown.colors += 10

  // Typography (15 points)
  if (config.typography.fontFamily !== 'inter') breakdown.typography += 8
  if (config.typography.headingFontFamily) breakdown.typography += 7

  // Domain (15 points)
  if (config.customDomain?.domain) breakdown.domain += 8
  if (config.customDomain?.isVerified) breakdown.domain += 7

  // Email (10 points)
  if (config.emailBranding.fromEmail) breakdown.email += 5
  if (config.emailBranding.footerText) breakdown.email += 5

  // SEO (10 points)
  if (config.seo.metaTitle) breakdown.seo += 3
  if (config.seo.metaDescription) breakdown.seo += 3
  if (config.seo.analyticsId) breakdown.seo += 4

  const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0)

  return { score, breakdown }
}

export function formatDomainStatus(status: DomainVerification['status']): {
  label: string
  color: string
} {
  const statusMap = {
    pending: { label: 'Pending Setup', color: 'gray' },
    verifying: { label: 'Verifying...', color: 'blue' },
    verified: { label: 'Verified', color: 'green' },
    failed: { label: 'Verification Failed', color: 'red' }
  }

  return statusMap[status]
}

export function estimateSetupTime(template: WhiteLabelTemplate): string {
  // Simple estimation based on features
  const baseTime = 10 // minutes
  const featureTime = template.features.length * 5

  const total = baseTime + featureTime
  return total < 60 ? `${total} minutes` : `${Math.ceil(total / 60)} hours`
}

export function generateBrandingExportCss(config: WhiteLabelConfig): string {
  const lightVars = generateCssVariables(config.colors.light)
  const darkVars = generateCssVariables(config.colors.dark)

  return `/* ${config.brandName} - Custom Branding */

:root {
${lightVars}
  --font-family: ${config.typography.fontFamily};
  --font-size: ${config.typography.baseFontSize}px;
}

@media (prefers-color-scheme: dark) {
  :root {
${darkVars}
  }
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size);
  background-color: var(--background);
  color: var(--foreground);
}
`
}
