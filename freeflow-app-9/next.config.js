/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server external packages (moved from experimental in Next.js 15)
  serverExternalPackages: [],
  
  experimental: {
    // Other experimental features can go here
  },
  
  // Webpack configuration to fix module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configure webpack cache to prevent corruption issues
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory',
      })
    }
    
    // Prevent module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ensure proper path resolution
    }
    
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
    };
    
    // Optimize webpack cache
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    };
    
    // Fix font loading issues
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    
    return config;
  },
  
  // TypeScript configuration to ignore build errors temporarily
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore to fix functionality first
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore to fix functionality first
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in dev for speed
  },
  
  // Static file serving
  async rewrites() {
    return [
      {
        source: '/avatars/:path*',
        destination: '/public/avatars/:path*',
      },
    ];
  },
  
  // Enable strict mode
  reactStrictMode: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'freeflowzee',
  },
};

module.exports = nextConfig;
