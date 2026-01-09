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
  serverExternalPackages: ['pg', 'resend'],

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

export default composePlugins(...plugins)(nextConfig);
