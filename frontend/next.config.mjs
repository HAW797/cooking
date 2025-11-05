/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // API rewrites for production (optional but recommended)
  async rewrites() {
    // Only use rewrites if you want to proxy API requests through Next.js
    // This is useful for avoiding CORS issues in production
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    
    return [
      {
        source: '/api-backend/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ]
  },
  // Environment variables validation (optional)
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  },
}

export default nextConfig
