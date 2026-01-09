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
   * 'serverExternalPackages' prevents Next.js from bundling Node-specific code.
   * This is critical for getting standard drivers to play nice with Cloudflare.
   */
  serverExternalPackages: ['pg', 'pg-cloudflare', 'resend'],

  // Webpack configuration for minimal Edge shimming
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Standard pg and its dependencies sometimes try to load these.
        // We shim them to false because they are NOT available on the Edge.
        fs: false,
        dns: false,
        os: false,
        child_process: false,
        tls: false,
        net: false,
      };
    }
    return config;
  },

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
