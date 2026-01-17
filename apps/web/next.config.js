import { composePlugins, withNx } from '@nx/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  nx: {},
  transpilePackages: ['@chronos/ui'],


  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },

  /**
   * External packages for Node.js runtime.
   * These won't be bundled, allowing Cloudflare's Node.js runtime to handle them natively.
   */
  serverExternalPackages: [],

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  generateBuildId: async () => {
    return process.env.CF_PAGES_COMMIT_SHA || 'development'
  },

  async rewrites() {
    // Use environment variable for API URL (supports local + production)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
    
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
};

const plugins = [
  withNx,
];

// Initialize OpenNext for Cloudflare development (only in dev mode, not during builds)
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}

export default composePlugins(...plugins)(nextConfig);
