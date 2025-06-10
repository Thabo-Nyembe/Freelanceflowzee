/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server external packages for Next.js 15
  serverExternalPackages: [],
  
  experimental: {
    // Package import optimizations for better tree-shaking
    optimizePackageImports: [
      '@supabase/supabase-js',
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'date-fns'
    ],
    
    // Turbopack-specific configuration
    turbo: {
      // Configure asset loaders for Turbopack
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
        '*.png': ['file-loader'],
        '*.jpg': ['file-loader'],
        '*.jpeg': ['file-loader'],
        '*.gif': ['file-loader'],
        '*.webp': ['file-loader'],
      },
      
      // Path aliases for Turbopack
      resolveAlias: {
        '@': './',
        '@/components': './components',
        '@/lib': './lib',
        '@/utils': './utils',
        '@/hooks': './hooks',
        '@/types': './types',
        '@/app': './app',
        '@/styles': './styles',
        '@/public': './public',
      },
      
      // Turbopack module resolution extensions
      resolveExtensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.json',
        '.css',
        '.scss',
        '.sass',
      ],
    },
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Image optimization
  images: {
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    
    localPatterns: [
      {
        pathname: '/avatars/**',
        search: '',
      },
      {
        pathname: '/images/**',
        search: '',
      },
      {
        pathname: '/api/**',
        search: '',
      },
    ],
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // React strict mode
  reactStrictMode: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'freeflowzee',
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output configuration
  generateEtags: true,
  compress: true,
  
  // Disable webpack configuration when using Turbopack
  // This prevents the "Webpack is configured while Turbopack is not" warning
};

module.exports = nextConfig; 