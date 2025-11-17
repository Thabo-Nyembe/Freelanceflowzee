import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';
import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import Negotiator from 'negotiator';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import axios from 'axios';

// ==========================================================
// TYPES AND INTERFACES
// ==========================================================

/**
 * Supported locales configuration
 */
export interface LocaleConfig {
  /** Locale code (e.g., 'en', 'fr', 'es') */
  code: string;
  /** Full locale code with region (e.g., 'en-US', 'fr-FR', 'es-ES') */
  fullCode: string;
  /** Display name in the language itself */
  nativeName: string;
  /** Display name in English */
  englishName: string;
  /** Flag emoji representation */
  flag: string;
  /** Direction (ltr or rtl) */
  dir: 'ltr' | 'rtl';
  /** Is this locale fully supported/translated */
  isComplete: boolean;
  /** Percentage of translations complete */
  completionPercentage: number;
  /** Date format pattern */
  dateFormat: string;
  /** Currency code */
  currencyCode: string;
  /** Currency symbol */
  currencySymbol: string;
  /** Currency display format */
  currencyFormat: string;
  /** Number format options */
  numberFormat: Intl.NumberFormatOptions;
}

/**
 * Translation namespace structure
 */
export interface TranslationNamespaces {
  common: {
    appName: string;
    welcome: string;
    loading: string;
    error: string;
    retry: string;
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    filter: string;
    sort: string;
    more: string;
    less: string;
    all: string;
    none: string;
    back: string;
    next: string;
    previous: string;
    [key: string]: string | TranslationNamespaces;
  };
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    forgotPassword: string;
    resetPassword: string;
    verifyEmail: string;
    emailVerified: string;
    passwordReset: string;
    [key: string]: string | TranslationNamespaces;
  };
  dashboard: {
    title: string;
    overview: string;
    projects: string;
    clients: string;
    tasks: string;
    analytics: string;
    settings: string;
    [key: string]: string | TranslationNamespaces;
  };
  projects: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    status: {
      pending: string;
      inProgress: string;
      completed: string;
      cancelled: string;
      [key: string]: string;
    };
    [key: string]: string | TranslationNamespaces;
  };
  ai: {
    title: string;
    generate: string;
    analyze: string;
    suggest: string;
    [key: string]: string | TranslationNamespaces;
  };
  legal: {
    termsOfService: string;
    privacyPolicy: string;
    cookiePolicy: string;
    copyright: string;
    disclaimer: string;
    gdprCompliance: string;
    ccpaCompliance: string;
    [key: string]: string | TranslationNamespaces;
  };
  errors: {
    notFound: string;
    serverError: string;
    unauthorized: string;
    forbidden: string;
    badRequest: string;
    [key: string]: string | TranslationNamespaces;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    [key: string]: string | Record<string, string>;
  };
  [key: string]: TranslationNamespaces | string;
}

/**
 * Translation entry with metadata
 */
export interface TranslationEntry {
  /** The translated text */
  text: string;
  /** When this translation was last updated */
  lastUpdated: string;
  /** Who last updated this translation */
  updatedBy: string;
  /** Whether this translation has been professionally verified */
  verified: boolean;
  /** Any notes about this translation */
  notes?: string;
  /** Machine translation confidence score (if applicable) */
  confidenceScore?: number;
}

/**
 * Translation validation status
 */
export type TranslationValidationStatus = 
  | 'verified'
  | 'needs-review'
  | 'machine-translated'
  | 'missing';

/**
 * SEO metadata for different locales
 */
export interface LocalizedSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  alternateUrls?: Record<string, string>;
}

/**
 * User language preferences
 */
export interface UserLanguagePreferences {
  /** Primary locale code */
  primaryLocale: string;
  /** Secondary locale codes in order of preference */
  secondaryLocales: string[];
  /** Format preferences */
  formatPreferences: {
    dateFormat: string;
    timeFormat: '12h' | '24h';
    firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    measurementUnit: 'metric' | 'imperial';
  };
  /** Whether to use browser locale or override */
  useBrowserLocale: boolean;
}

/**
 * AI translation request
 */
export interface AITranslationRequest {
  sourceText: string;
  sourceLocale: string;
  targetLocale: string;
  context?: string;
  namespace?: string;
  key?: string;
}

/**
 * AI translation response
 */
export interface AITranslationResponse {
  translatedText: string;
  confidenceScore: number;
  alternatives?: string[];
  detectedLocale?: string;
  processingTimeMs: number;
}

// ==========================================================
// CONFIGURATION
// ==========================================================

/**
 * Supported locales
 */
export const LOCALES: Record<string, LocaleConfig> = {
  en: {
    code: 'en',
    fullCode: 'en-US',
    nativeName: 'English',
    englishName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    isComplete: true,
    completionPercentage: 100,
    dateFormat: 'MM/dd/yyyy',
    currencyCode: 'USD',
    currencySymbol: '$',
    currencyFormat: '$#,##0.00',
    numberFormat: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  fr: {
    code: 'fr',
    fullCode: 'fr-FR',
    nativeName: 'Français',
    englishName: 'French',
    flag: '🇫🇷',
    dir: 'ltr',
    isComplete: true,
    completionPercentage: 95,
    dateFormat: 'dd/MM/yyyy',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormat: '#,##0.00 €',
    numberFormat: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  es: {
    code: 'es',
    fullCode: 'es-ES',
    nativeName: 'Español',
    englishName: 'Spanish',
    flag: '🇪🇸',
    dir: 'ltr',
    isComplete: true,
    completionPercentage: 90,
    dateFormat: 'dd/MM/yyyy',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormat: '#,##0.00 €',
    numberFormat: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  ar: {
    code: 'ar',
    fullCode: 'ar-SA',
    nativeName: 'العربية',
    englishName: 'Arabic',
    flag: '🇸🇦',
    dir: 'rtl',
    isComplete: false,
    completionPercentage: 60,
    dateFormat: 'dd/MM/yyyy',
    currencyCode: 'SAR',
    currencySymbol: 'ر.س',
    currencyFormat: 'ر.س #,##0.00',
    numberFormat: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
};

/**
 * List of locale codes
 */
export const LOCALE_CODES = Object.keys(LOCALES);

/**
 * Default locale
 */
export const DEFAULT_LOCALE = 'en';

/**
 * Fallback locale (used when translations are missing)
 */
export const FALLBACK_LOCALE = 'en';

/**
 * Locale cookie name
 */
export const LOCALE_COOKIE = 'kazi_locale';

/**
 * User preferences cookie name
 */
export const USER_LOCALE_PREFS_COOKIE = 'kazi_locale_prefs';

/**
 * JWT secret for signed cookies
 */
export const LOCALE_JWT_SECRET = new TextEncoder().encode(
  process.env.LOCALE_JWT_SECRET || 'kazi-i18n-secret-key-change-in-production'
);

/**
 * Path name configurations for internationalized routing
 */
export const PATHNAMES = {
  '/': '/',
  '/dashboard': '/dashboard',
  '/projects': '/projects',
  '/clients': '/clients',
  '/settings': '/settings',
  '/profile': '/profile',
  '/auth/login': '/auth/login',
  '/auth/register': '/auth/register',
} as const;

/**
 * Path name mapping for localized routes
 */
export const LOCALE_PATHNAMES: Record<string, Record<string, string>> = {
  en: PATHNAMES,
  fr: {
    '/': '/',
    '/dashboard': '/tableau-de-bord',
    '/projects': '/projets',
    '/clients': '/clients',
    '/settings': '/parametres',
    '/profile': '/profil',
    '/auth/login': '/auth/connexion',
    '/auth/register': '/auth/inscription',
  },
  es: {
    '/': '/',
    '/dashboard': '/panel',
    '/projects': '/proyectos',
    '/clients': '/clientes',
    '/settings': '/ajustes',
    '/profile': '/perfil',
    '/auth/login': '/auth/iniciar-sesion',
    '/auth/register': '/auth/registro',
  },
  ar: {
    '/': '/',
    '/dashboard': '/لوحة-التحكم',
    '/projects': '/المشاريع',
    '/clients': '/العملاء',
    '/settings': '/الإعدادات',
    '/profile': '/الملف-الشخصي',
    '/auth/login': '/auth/تسجيل-الدخول',
    '/auth/register': '/auth/التسجيل',
  },
};

// ==========================================================
// NEXT-INTL CONFIGURATION
// ==========================================================

/**
 * Create localized navigation utilities
 */
export const { Link, redirect, usePathname, useRouter } = createLocalizedPathnamesNavigation({
  locales: LOCALE_CODES,
  pathnames: LOCALE_PATHNAMES,
});

/**
 * Configure request handler for next-intl
 */
export async function getMessages(locale: string) {
  try {
    // In production, load from compiled messages
    if (process.env.NODE_ENV === 'production') {
      return (await import(`../../messages/${locale}.json`)).default;
    }
    
    // In development, load from API to enable hot reloading of translations
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/i18n/messages/${locale}`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${locale}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error);
    
    // Fallback to English in case of error
    if (locale !== FALLBACK_LOCALE) {
      return getMessages(FALLBACK_LOCALE);
    }
    
    // If even English fails, return an empty object
    return {};
  }
}

/**
 * Server-side request configuration for next-intl
 */
export async function getI18nConfig(locale: string = DEFAULT_LOCALE) {
  return getRequestConfig({
    locale,
    messages: await getMessages(locale),
    timeZone: 'UTC',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
        medium: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        },
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'USD',
        },
        percent: {
          style: 'percent',
        },
      },
      relative: {
        days: {
          style: 'narrow',
        },
      },
    },
    defaultTranslationValues: {
      appName: 'KAZI',
      year: new Date().getFullYear().toString(),
    },
    onError: (error) => {
      // Log translation errors but don't throw
      console.error('[i18n]', error);
    },
  });
}

// ==========================================================
// LOCALE DETECTION AND MANAGEMENT
// ==========================================================

/**
 * Get locale from different sources in priority order
 */
export function getLocale(request?: NextRequest): string {
  // 1. From URL path parameter (highest priority)
  if (request?.nextUrl?.pathname) {
    const pathname = request.nextUrl.pathname;
    const pathnameLocale = LOCALE_CODES.find(
      locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    );
    
    if (pathnameLocale) {
      return pathnameLocale;
    }
  }
  
  // 2. From cookie (if exists)
  if (request?.cookies) {
    const localeCookie = request.cookies.get(LOCALE_COOKIE)?.value;
    if (localeCookie && LOCALE_CODES.includes(localeCookie)) {
      return localeCookie;
    }
  } else if (typeof document !== 'undefined') {
    // Client-side cookie check
    const localeCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${LOCALE_COOKIE}=`))
      ?.split('=')[1];
    
    if (localeCookie && LOCALE_CODES.includes(localeCookie)) {
      return localeCookie;
    }
  }
  
  // 3. From Accept-Language header
  if (request?.headers) {
    const negotiator = new Negotiator({
      headers: {
        'accept-language': request.headers.get('accept-language') || '',
      },
    });
    
    const availableLocales = LOCALE_CODES;
    const preferredLocale = negotiator.language(availableLocales);
    
    if (preferredLocale && LOCALE_CODES.includes(preferredLocale)) {
      return preferredLocale;
    }
  }
  
  // 4. Default locale (lowest priority)
  return DEFAULT_LOCALE;
}

/**
 * Validate if a locale is supported
 */
export function isValidLocale(locale: string): boolean {
  return LOCALE_CODES.includes(locale);
}

/**
 * Set locale in cookie
 */
export function setLocale(locale: string, options?: { maxAge?: number }): void {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }
  
  // Set cookie (works in both client and server components)
  if (typeof document !== 'undefined') {
    // Client-side
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${
      options?.maxAge || 31536000 // 1 year default
    }; SameSite=Lax`;
  } else {
    // Server-side
    cookies().set({
      name: LOCALE_COOKIE,
      value: locale,
      path: '/',
      maxAge: options?.maxAge || 31536000, // 1 year default
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
}

/**
 * Get user language preferences
 */
export async function getUserLanguagePreferences(): Promise<UserLanguagePreferences | null> {
  try {
    // Try to get from cookie
    const prefsString = cookies().get(USER_LOCALE_PREFS_COOKIE)?.value;
    
    if (!prefsString) {
      return null;
    }
    
    // Verify and decode JWT
    const { payload } = await jwtVerify(prefsString, LOCALE_JWT_SECRET);
    return payload.prefs as UserLanguagePreferences;
  } catch (error) {
    console.error('Error getting user language preferences:', error);
    return null;
  }
}

/**
 * Save user language preferences
 */
export async function saveUserLanguagePreferences(
  prefs: UserLanguagePreferences
): Promise<void> {
  try {
    // Validate primary locale
    if (!isValidLocale(prefs.primaryLocale)) {
      throw new Error(`Invalid primary locale: ${prefs.primaryLocale}`);
    }
    
    // Validate secondary locales
    prefs.secondaryLocales = prefs.secondaryLocales.filter(isValidLocale);
    
    // Create signed JWT
    const token = await new jose.SignJWT({ prefs })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1y')
      .sign(LOCALE_JWT_SECRET);
    
    // Save to cookie
    cookies().set({
      name: USER_LOCALE_PREFS_COOKIE,
      value: token,
      path: '/',
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (error) {
    console.error('Error saving user language preferences:', error);
    throw error;
  }
}

// ==========================================================
// FORMATTING UTILITIES
// ==========================================================

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string | number,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  const localeConfig = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];
  
  return new Intl.DateTimeFormat(localeConfig.fullCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  amount: number,
  locale: string = DEFAULT_LOCALE,
  currencyCode?: string,
  options?: Intl.NumberFormatOptions
): string {
  const localeConfig = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];
  
  return new Intl.NumberFormat(localeConfig.fullCode, {
    style: 'currency',
    currency: currencyCode || localeConfig.currencyCode,
    ...options,
  }).format(amount);
}

/**
 * Format number according to locale
 */
export function formatNumber(
  value: number,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions
): string {
  const localeConfig = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];
  
  return new Intl.NumberFormat(
    localeConfig.fullCode,
    { ...localeConfig.numberFormat, ...options }
  ).format(value);
}

/**
 * Format relative time according to locale
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.RelativeTimeFormatOptions
): string {
  const localeConfig = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];
  
  return new Intl.RelativeTimeFormat(localeConfig.fullCode, {
    numeric: 'auto',
    ...options,
  }).format(value, unit);
}

// ==========================================================
// SEO OPTIMIZATION
// ==========================================================

/**
 * Generate SEO metadata for a page in the current locale
 */
export function getLocalizedSEOMetadata(
  key: string,
  locale: string = DEFAULT_LOCALE,
  params?: Record<string, string>
): LocalizedSEOMetadata {
  // Get base metadata
  const baseMetadata: LocalizedSEOMetadata = {
    title: `KAZI - ${key}`,
    description: `KAZI platform - ${key}`,
    keywords: ['KAZI', 'freelance', 'platform', key],
  };
  
  try {
    // Try to load localized SEO metadata
    const messages = require(`../../messages/${locale}.json`);
    const seoData = messages.seo?.[key];
    
    if (seoData) {
      // Replace any parameters in the text
      const replaceParams = (text: string) => {
        if (!params) return text;
        
        return Object.entries(params).reduce(
          (result, [key, value]) => result.replace(new RegExp(`{${key}}`, 'g'), value),
          text
        );
      };
      
      return {
        title: replaceParams(seoData.title || baseMetadata.title),
        description: replaceParams(seoData.description || baseMetadata.description),
        keywords: seoData.keywords || baseMetadata.keywords,
        ogTitle: replaceParams(seoData.ogTitle || seoData.title || baseMetadata.title),
        ogDescription: replaceParams(seoData.ogDescription || seoData.description || baseMetadata.description),
        ogImage: seoData.ogImage,
        twitterTitle: replaceParams(seoData.twitterTitle || seoData.title || baseMetadata.title),
        twitterDescription: replaceParams(seoData.twitterDescription || seoData.description || baseMetadata.description),
        twitterImage: seoData.twitterImage || seoData.ogImage,
        canonicalUrl: seoData.canonicalUrl,
        alternateUrls: seoData.alternateUrls,
      };
    }
  } catch (error) {
    console.error(`Error loading SEO metadata for ${locale}/${key}:`, error);
  }
  
  return baseMetadata;
}

/**
 * Generate alternate language links for SEO
 */
export function getAlternateLanguageLinks(path: string): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kazi.app';
  const alternates: Record<string, string> = {};
  
  // Generate alternate links for all supported locales
  for (const locale of LOCALE_CODES) {
    // Map the path to localized version
    let localizedPath = path;
    
    // Check if we have a direct mapping for this path
    const defaultPathEntries = Object.entries(PATHNAMES);
    for (const [defaultPath, canonicalPath] of defaultPathEntries) {
      if (path === canonicalPath || path.startsWith(`${canonicalPath}/`)) {
        const localePathnames = LOCALE_PATHNAMES[locale];
        const localePath = localePathnames[defaultPath];
        
        if (localePath) {
          localizedPath = path.replace(canonicalPath, localePath);
          break;
        }
      }
    }
    
    // Add locale prefix
    alternates[locale] = `${baseUrl}/${locale}${localizedPath}`;
  }
  
  return alternates;
}

// ==========================================================
// LEGAL COMPLIANCE TEXT MANAGEMENT
// ==========================================================

/**
 * Legal document types
 */
export type LegalDocumentType = 
  | 'terms'
  | 'privacy'
  | 'cookies'
  | 'disclaimer'
  | 'gdpr'
  | 'ccpa';

/**
 * Get legal document content
 */
export async function getLegalDocument(
  type: LegalDocumentType,
  locale: string = DEFAULT_LOCALE
): Promise<string> {
  try {
    // Try to load from API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/legal/${type}?locale=${locale}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error(`Failed to load ${type} document for ${locale}`);
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error(`Error loading ${type} document for ${locale}:`, error);
    
    // Fallback to English
    if (locale !== FALLBACK_LOCALE) {
      return getLegalDocument(type, FALLBACK_LOCALE);
    }
    
    // If even English fails, return placeholder
    return `# ${type.toUpperCase()} document\n\nContent not available.`;
  }
}

/**
 * Get legal document version
 */
export async function getLegalDocumentVersion(
  type: LegalDocumentType,
  locale: string = DEFAULT_LOCALE
): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/legal/${type}/version?locale=${locale}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error(`Failed to load ${type} document version for ${locale}`);
    }
    
    const data = await response.json();
    return data.version;
  } catch (error) {
    console.error(`Error loading ${type} document version for ${locale}:`, error);
    return 'unknown';
  }
}

// ==========================================================
// AI TRANSLATION INTEGRATION
// ==========================================================

/**
 * Get AI translation for a text
 */
export async function getAITranslation(
  request: AITranslationRequest
): Promise<AITranslationResponse> {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/i18n/ai-translate`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_TRANSLATION_API_KEY || ''}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('AI translation error:', error);
    throw new Error('Failed to get AI translation');
  }
}

/**
 * Batch translate multiple strings
 */
export async function batchAITranslate(
  texts: string[],
  sourceLocale: string,
  targetLocale: string,
  context?: string
): Promise<string[]> {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/i18n/ai-translate-batch`,
      {
        texts,
        sourceLocale,
        targetLocale,
        context,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_TRANSLATION_API_KEY || ''}`,
        },
      }
    );
    
    return response.data.translations.map((t: any) => t.translatedText);
  } catch (error) {
    console.error('Batch AI translation error:', error);
    throw new Error('Failed to batch translate texts');
  }
}

// ==========================================================
// TRANSLATION VALIDATION SYSTEM
// ==========================================================

/**
 * Check translation validation status
 */
export async function getTranslationValidationStatus(
  namespace: string,
  key: string,
  locale: string
): Promise<TranslationValidationStatus> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/i18n/validation-status?namespace=${namespace}&key=${key}&locale=${locale}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get validation status for ${namespace}.${key} in ${locale}`);
    }
    
    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error('Translation validation status error:', error);
    return 'needs-review';
  }
}

/**
 * Submit translation for professional validation
 */
export async function submitTranslationForValidation(
  namespace: string,
  key: string,
  locale: string,
  translation: string,
  notes?: string
): Promise<void> {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/i18n/submit-for-validation`,
      {
        namespace,
        key,
        locale,
        translation,
        notes,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TRANSLATION_API_KEY || ''}`,
        },
      }
    );
  } catch (error) {
    console.error('Submit translation for validation error:', error);
    throw new Error('Failed to submit translation for validation');
  }
}

/**
 * Validate a translation (for professional translators)
 */
export async function validateTranslation(
  namespace: string,
  key: string,
  locale: string,
  isValid: boolean,
  correctedTranslation?: string,
  notes?: string
): Promise<void> {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/i18n/validate-translation`,
      {
        namespace,
        key,
        locale,
        isValid,
        correctedTranslation,
        notes,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TRANSLATION_API_KEY || ''}`,
        },
      }
    );
  } catch (error) {
    console.error('Validate translation error:', error);
    throw new Error('Failed to validate translation');
  }
}

/**
 * Get translation completion statistics
 */
export async function getTranslationStats(): Promise<Record<string, { total: number; translated: number; verified: number; }>> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/i18n/stats`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error('Failed to get translation stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Translation stats error:', error);
    return {};
  }
}

// ==========================================================
// CLIENT PROVIDER COMPONENT
// ==========================================================

/**
 * Client provider component props
 */
interface I18nProviderProps {
  locale: string;
  messages: any;
  children: React.ReactNode;
  timeZone?: string;
  now?: Date;
}

/**
 * Client provider component
 */
export function I18nProvider({
  locale,
  messages,
  children,
  timeZone = 'UTC',
  now = new Date(),
}: I18nProviderProps) {
  // Validate locale
  if (!isValidLocale(locale)) {
    console.warn(`Invalid locale: ${locale}, falling back to ${DEFAULT_LOCALE}`);
    locale = DEFAULT_LOCALE;
  }
  
  // Get locale config
  const localeConfig = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];
  
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      now={now}
      formats={{
        dateTime: {
          short: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          },
          medium: {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          },
          long: {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          },
        },
        number: {
          currency: {
            style: 'currency',
            currency: localeConfig.currencyCode,
          },
          percent: {
            style: 'percent',
          },
        },
      }}
      defaultTranslationValues={{
        appName: 'KAZI',
        year: new Date().getFullYear().toString(),
      }}
      onError={(error) => {
        // Log translation errors but don't throw
        console.error('[i18n]', error);
      }}
    >
      {/* Set RTL direction if needed */}
      <div dir={localeConfig.dir} lang={locale} className="h-full">"
        {children}
      </div>
    </NextIntlClientProvider>
  );
}

// ==========================================================
// DEFAULT EXPORT
// ==========================================================

export default {
  LOCALES,
  LOCALE_CODES,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  getLocale,
  isValidLocale,
  setLocale,
  formatDate,
  formatCurrency,
  formatNumber,
  formatRelativeTime,
  getLocalizedSEOMetadata,
  getAlternateLanguageLinks,
  getMessages,
  getI18nConfig,
  getUserLanguagePreferences,
  saveUserLanguagePreferences,
  getLegalDocument,
  getLegalDocumentVersion,
  getAITranslation,
  batchAITranslate,
  getTranslationValidationStatus,
  submitTranslationForValidation,
  validateTranslation,
  getTranslationStats,
  I18nProvider,
};
