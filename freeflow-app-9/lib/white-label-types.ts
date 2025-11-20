/**
 * White Label Types
 * Complete type system for white label branding and customization
 */

export type BrandingTheme = 'light' | 'dark' | 'auto'

export type ColorScheme = {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  foreground: string
  muted: string
  border: string
}

export type FontFamily = 'inter' | 'roboto' | 'open-sans' | 'lato' | 'montserrat' | 'poppins' | 'custom'

export type BrandingAssets = {
  logo: {
    light: string
    dark: string
    favicon: string
    iconOnly: string
  }
  images: {
    loginBackground?: string
    dashboardBackground?: string
    emailHeader?: string
    invoiceHeader?: string
  }
  socialMedia: {
    ogImage?: string
    twitterCard?: string
  }
}

export type WhiteLabelConfig = {
  id: string
  organizationId: string
  isActive: boolean
  brandName: string
  displayName: string
  tagline?: string
  description?: string
  assets: BrandingAssets
  colors: {
    light: ColorScheme
    dark: ColorScheme
  }
  typography: {
    fontFamily: FontFamily
    customFontUrl?: string
    headingFontFamily?: FontFamily
    customHeadingFontUrl?: string
    baseFontSize: number
  }
  customDomain?: {
    domain: string
    isVerified: boolean
    sslEnabled: boolean
  }
  emailBranding: {
    fromName: string
    fromEmail: string
    replyToEmail: string
    footerText?: string
    socialLinks?: Record<string, string>
  }
  seo: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    analyticsId?: string
    gtmId?: string
  }
  features: {
    customCss?: string
    customJs?: string
    hideKaziBranding: boolean
    showPoweredBy: boolean
    customFooter?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface BrandingPreset {
  id: string
  name: string
  description: string
  category: 'modern' | 'professional' | 'creative' | 'minimal' | 'bold'
  colors: {
    light: Partial<ColorScheme>
    dark: Partial<ColorScheme>
  }
  typography: {
    fontFamily: FontFamily
    headingFontFamily?: FontFamily
  }
  preview: string
  popularity: number
}

export interface WhiteLabelTemplate {
  id: string
  name: string
  description: string
  industry: string
  preset: BrandingPreset
  sampleAssets: BrandingAssets
  features: string[]
  isPopular: boolean
}

export interface DomainVerification {
  domain: string
  status: 'pending' | 'verifying' | 'verified' | 'failed'
  records: Array<{
    type: 'A' | 'CNAME' | 'TXT'
    name: string
    value: string
    status: 'pending' | 'verified' | 'failed'
  }>
  verifiedAt?: Date
  lastChecked?: Date
  error?: string
}

export interface WhiteLabelPreview {
  id: string
  configId: string
  url: string
  expiresAt: Date
  screenshots?: {
    desktop: string
    mobile: string
    tablet: string
  }
}

export interface WhiteLabelAnalytics {
  configId: string
  period: {
    start: Date
    end: Date
  }
  metrics: {
    totalVisits: number
    uniqueVisitors: number
    pageViews: number
    averageSessionDuration: number
    bounceRate: number
  }
  topPages: Array<{
    path: string
    views: number
    uniqueVisitors: number
  }>
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
  locationBreakdown: Array<{
    country: string
    visits: number
  }>
}

export interface BrandingExport {
  format: 'json' | 'css' | 'scss' | 'theme-json'
  content: string
  fileName: string
  size: number
  createdAt: Date
}

export type CustomizationSection =
  | 'general'
  | 'colors'
  | 'typography'
  | 'assets'
  | 'domain'
  | 'email'
  | 'seo'
  | 'advanced'

export interface CustomizationHistory {
  id: string
  configId: string
  section: CustomizationSection
  changes: Record<string, any>
  changedBy: string
  changedAt: Date
  description?: string
}
