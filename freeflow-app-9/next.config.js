/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core Configuration
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  
  // Server external packages
  serverExternalPackages: ['@supabase/supabase-js', '@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner', '@aws-sdk/lib-storage'],
  
  // Experimental features
  experimental: {
    // Package import optimizations
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'framer-motion',
      'date-fns'
    ],
    
    // Server actions
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    
    // Build optimizations
    swcPlugins: [],
    forceSwcTransforms: true,
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
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media/',
          outputPath: 'static/media/',
          name: '[name].[hash].[ext]',
        },
      },
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
        buildDependencies: {
          config: [__filename]
        }
      };
    }

    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://freeflowzee.com' 
      : 'http://localhost:3000',
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

module.exports = nextConfig;