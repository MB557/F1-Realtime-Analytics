/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Netlify deployment
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002',
  },
  
  // Asset prefix for CDN support
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Webpack configuration for better builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 