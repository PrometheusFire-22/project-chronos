import { composePlugins, withNx } from '@nx/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  nx: {},
  transpilePackages: ['@chronos/ui'],

  // Disable image optimization for static export (or for Cloudflare compatibility)
  images: {
    unoptimized: true,
  },

  // Build caching and performance optimizations
  experimental: {
    // Optimize bundle splitting
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },

  /**
   * IMPORTANT: 'serverExternalPackages' is the standard Next.js 15 way to handle 
   * Node-dependent libraries on the Edge. Telling Next.js NOT to bundle these
   * allows Cloudflare's runtime (with nodejs_compat) to provide the actual 
   * functional modules instead of broken Webpack shims.
   */
  serverExternalPackages: ['@neondatabase/serverless', 'resend'],

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Enable build output caching
  generateBuildId: async () => {
    // Use git commit hash for build ID to enable proper caching
    return process.env.CF_PAGES_COMMIT_SHA || 'development'
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

export default composePlugins(...plugins)(nextConfig);
