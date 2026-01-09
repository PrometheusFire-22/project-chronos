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
    // Optimize bundle splitting
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },

  // External packages to prevent bundling issues on Edge
  serverExternalPackages: ['resend', 'postgres'],

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        os: false,
        crypto: false,
        stream: false,
        perf_hooks: false,
      };
    }
    return config;
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
