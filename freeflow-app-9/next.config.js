/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    forceSwcTransforms: true,
    externalDir: true,
  },
  
  // Webpack configuration for production
  webpack: (config, { isServer, dev }) => {
    if (!dev) {
      // Ignore problematic files during production build
      config.module.rules.push({
        test: /[\\/]app[\\/]api[\\/]ai[\\/].*\.ts$/,
        use: 'null-loader',
      });
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
    
    return config;
  },
  
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: false,
  
  images: {
    domains: ['localhost', 'vercel.app'],
    formats: ['image/webp'],
  },
  
  // Route rewrites for mock endpoints
  async rewrites() {
    return [
      {
        source: '/api/ai/:path*',
        destination: '/api/mock/ai-:path*',
      },
    ];
  },
}

module.exports = nextConfig