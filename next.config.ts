// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // เปิด serverActions ใช้กับฟอร์มด้านบน
    serverActions: { bodySizeLimit: '3gb' },
  },
  eslint: {
    // กัน build พังเพราะ ESLint rushstack/patch
    ignoreDuringBuilds: true,
  },
}

export default nextConfig