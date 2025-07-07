/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: false,
  
  images: {
    domains: ['localhost', 'vercel.app'],
    formats: ['image/webp'],
  },
}
