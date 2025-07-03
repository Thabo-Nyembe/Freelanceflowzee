/** @type {import('next').NextConfig} */
const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Core Configuration
  reactStrictMode: false,
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  
  // Experimental features
  experimental: {
    // Package import optimizations
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'framer-motion',
      'date-fns'
    ],
    
    // Build optimizations
    swcPlugins: [],
    forceSwcTransforms: true,
    
    // Server actions
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    },
    
    // External packages
    externalDir: true,
    
    // Performance optimizations
    optimizeCss: true,
    serverMinification: true,
    optimizeServerReact: true
  },
  
  // Compiler optimizations
  compiler: {
    emotion: false,
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ],
    domains: ['localhost', 'vercel.app', 'freeflow-app-9.vercel.app'],
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Handle media files
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]'
      }
    });

    // Fix module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false,
      stream: false,
      util: false,
      punycode: false,
    };

    // Optimize webpack cache
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        version: `${process.env.NODE_ENV}-${config.mode}-${process.version}`,
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
        store: 'pack',
        buildDependencies: {
          config: [__filename],
          tsconfig: [path.resolve(__dirname, 'tsconfig.json')],
        }
      };
    }

    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize chunks
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Ignore specific problematic files during build
    config.module.rules.push({
      test: /problematic-files/,
      use: 'null-loader',
    });

    return config;
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://freeflow-app-9.vercel.app' 
      : 'http://localhost:3001'
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Output configuration
  output: 'standalone',

  // Custom route handling
  async rewrites() {
    return [
      {
        source: '/api/analytics/dashboard',
        destination: '/api/mock/analytics-dashboard',
      },
      {
        source: '/api/analytics/demo',
        destination: '/api/mock/analytics-demo',
      },
      {
        source: '/api/analytics/events',
        destination: '/api/mock/analytics-events',
      },
      {
        source: '/api/analytics/insights',
        destination: '/api/mock/analytics-insights',
      },
      {
        source: '/api/analytics/track-event',
        destination: '/api/mock/analytics-track-event',
      },
    ];
  },

  // Custom headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);