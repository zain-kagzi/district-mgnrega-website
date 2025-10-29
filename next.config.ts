
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  // Enable compression
  compress: true,
  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig;