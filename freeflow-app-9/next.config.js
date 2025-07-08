/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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