import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@siws/ui"],
  async rewrites() {
    return [
      {
        source: '/docs/:path*.md',
        destination: '/api/raw/:path*',
      },
    ]
  },
}

export default nextConfig
