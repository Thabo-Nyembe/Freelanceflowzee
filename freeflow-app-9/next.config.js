const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
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
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
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
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
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
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 5 * 60 // 5 minutes
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TODO: Set to false once TypeScript errors in test files and dashboard components are fixed
    ignoreBuildErrors: true,
  },
  experimental: {
    externalDir: true,
  },

  // Exclude native modules from server bundling
  serverExternalPackages: [
    '@ffmpeg-installer/ffmpeg',
    '@ffmpeg-installer/darwin-arm64',
    'fluent-ffmpeg',
    'sharp',
  ],

  // Turbopack configuration
  turbopack: {
    root: '/Users/thabonyembe/Documents/freeflow-app-9',
  },
  
  // A+++ Build optimization
  staticPageGenerationTimeout: 90,
  compress: true,

  // Note: modularizeImports for lucide-react removed - new version uses different import paths
  
  // Advanced Webpack configuration for A+++ grade
  webpack: (config, { isServer, dev, webpack }) => {
    if (!dev) {
      // A+++ Bundle optimization - only for client bundles
      if (!isServer) {
        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            default: false,
            vendors: false,
            // Framework chunk
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // UI library chunk
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              chunks: 'all',
              maxSize: 200000,
            },
          },
        };
      }
    }
    
    // Fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // A+++ Performance plugins
    config.plugins.push(
      new webpack.optimize.MinChunkSizePlugin({
        minChunkSize: 20000,
      })
    );
    
    return config;
  },
  
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: false,
  
  // A+++ Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Advanced bundle analyzer and tree shaking
  // (removing self-reference to fix circular dependency)
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/webp'],
  },
  
  // Route rewrites - disabled AI mock redirect to use real endpoints
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/ai/:path*',
  //       destination: '/api/mock/ai-:path*',
  //     },
  //   ];
  // },
}

module.exports = withPWA(nextConfig)