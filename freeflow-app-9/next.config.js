/** @type {import('next').NextConfig} */
const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Core Configuration
  reactStrictMode: true,
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
    domains: ['ouzcjoxaupimazrivyta.supabase.co', 'localhost'],
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
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Output configuration
  output: 'standalone',
};

module.exports = withBundleAnalyzer(nextConfig);