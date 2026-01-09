import { composePlugins, withNx } from '@nx/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  nx: {},
  transpilePackages: ['@chronos/ui'],

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Build caching and performance optimizations
  experimental: {
    // Client trace metadata for better debugging
    clientTraceMetadata: ['action', 'request'],

    // Optimize bundle splitting
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },

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
