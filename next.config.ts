// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Vercel-specific optimizations
  experimental: {
    optimizeCss: true,
  },
  
  // Environment variables available to browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  
  // Enable compression
  compress: true,
  
  // Output standalone for optimized deployment
  output: 'standalone',
}

module.exports = nextConfig;