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
