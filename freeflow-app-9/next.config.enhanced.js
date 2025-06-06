/** @type {import('next').NextConfig} */

// Enhanced Next.js Configuration for Phase 9 - Production Launch
const nextConfig = {
  // Core Configuration
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Performance Optimizations
  experimental: {
    // Modern features
    ppr: true, // Partial Pre-rendering
    dynamicIO: true,
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    
    // Performance
    optimizePackageImports: [
      '@/components',
      '@/lib',
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion'
    ],
    
    // Build optimization
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    
    // React features
    reactCompiler: true,
    serverComponentsExternalPackages: ['sharp', 'canvas'],
  },

  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.stripe.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      }
    ],
    loader: 'default',
    quality: 85,
  },

  // Compiler Optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    
    // React optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    
    // Styled-components (if used)
    styledComponents: {
      displayName: process.env.NODE_ENV === 'development',
      ssr: true,
      fileName: process.env.NODE_ENV === 'development',
    },
  },

  // Headers for Security and Performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          
          // Performance Headers
          {
            key: 'X-Robots-Tag',
            value: 'index, follow'
          }
        ],
      },
      
      // Static assets caching
      {
        source: '/public/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      
      // API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      },

      // Service Worker
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      }
    ]
  },

  // Redirects for SEO and UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard/overview',
        destination: '/dashboard',
        permanent: true,
      }
    ]
  },

  // Webpack Configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Optimize bundle size
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
      
      // Tree shaking
      config.optimization.providedExports = true
      
      // Module concatenation
      config.optimization.concatenateModules = true
      
      // Bundle analyzer in production (optional)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: `${isServer ? 'server' : 'client'}.html`
          })
        )
      }
    }

    // Fallbacks for browser compatibility
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }

    // Optimize imports
    config.module.rules.push({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: /node_modules/,
      type: 'javascript/auto',
    })

    // Custom loaders
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // Environment Variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BUILD_TIME: new Date().toISOString(),
    BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },

  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // ESLint Configuration
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib', 'app'],
  },

  // Output Configuration
  output: 'standalone',
  distDir: '.next',
  
  // Compression
  compress: true,
  
  // Analytics and Monitoring
  analyticsId: process.env.ANALYTICS_ID,
  
  // PWA Configuration (if using next-pwa)
  ...(process.env.NODE_ENV === 'production' && {
    pwa: {
      dest: 'public',
      disable: false,
      register: true,
      skipWaiting: true,
      sw: '/sw.js',
      publicExcludes: ['!robots.txt', '!sitemap.xml'],
      buildExcludes: [/middleware-manifest\.json$/],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-stylesheets',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
            }
          }
        },
        {
          urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-font-assets',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
            }
          }
        },
        {
          urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-image-assets',
            expiration: {
              maxEntries: 64,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\/_next\/image\?url=.+$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'next-image',
            expiration: {
              maxEntries: 64,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\.(?:mp3|wav|ogg)$/i,
          handler: 'CacheFirst',
          options: {
            rangeRequests: true,
            cacheName: 'static-audio-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\.(?:mp4)$/i,
          handler: 'CacheFirst',
          options: {
            rangeRequests: true,
            cacheName: 'static-video-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\.(?:js)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-js-assets',
            expiration: {
              maxEntries: 48,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\.(?:css|less)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-style-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'next-data',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\.(?:json|xml|csv)$/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'static-data-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: ({ url }) => {
            const isSameOrigin = self.origin === url.origin
            if (!isSameOrigin) return false
            const pathname = url.pathname
            return !pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/payments/')
          },
          handler: 'NetworkFirst',
          method: 'GET',
          options: {
            cacheName: 'apis',
            expiration: {
              maxEntries: 16,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            },
            networkTimeoutSeconds: 10
          }
        },
        {
          urlPattern: ({ url }) => {
            const isSameOrigin = self.origin === url.origin
            if (!isSameOrigin) return false
            const pathname = url.pathname
            return pathname.startsWith('/')
          },
          handler: 'NetworkFirst',
          method: 'GET',
          options: {
            cacheName: 'pages',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            },
            networkTimeoutSeconds: 10
          }
        }
      ]
    }
  }),

  // Logging Configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development'
    }
  },

  // Development Configuration
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-right',
    },
    
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    }
  }),

  // Production-only Configuration
  ...(process.env.NODE_ENV === 'production' && {
    // Additional production optimizations
    productionBrowserSourceMaps: false,
    optimizeFonts: true,
    
    // Advanced caching
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
    }
  })
}

// Export configuration with potential plugins
module.exports = nextConfig

// Alternative export for ES modules compatibility
// export default nextConfig 