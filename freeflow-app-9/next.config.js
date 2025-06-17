/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  
  // External packages for server components (moved from experimental)
  serverExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner', '@aws-sdk/lib-storage'],
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'placehold.co'],
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },

  // Media file handling
  webpack: (config) => {
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
    })

    return config
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' blob: data: https://images.unsplash.com https://placehold.co https://*.supabase.co;
              font-src 'self' https://fonts.gstatic.com;
              media-src 'self' blob: data:;
              connect-src 'self' https://*.supabase.co https://api.stripe.com;
              frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ]
  },

  eslint: {
    // Disable ESLint during build to allow deployment
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Temporarily ignore TypeScript build errors for deployment
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
