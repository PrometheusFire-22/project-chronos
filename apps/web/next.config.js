import { composePlugins, withNx } from '@nx/next';
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  nx: {},
  transpilePackages: ['@chronos/ui'],

  // Static export for Cloudflare Pages (no adapter needed)
  output: 'export',

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

export default withSentryConfig(
  composePlugins(...plugins)(nextConfig),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during bundling
    silent: true,
    org: "project-chronos",
    project: "web-app",
  },
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-nextjs/guides/configure-next-config/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK messages to ISA and adds line numbers to reduces bundle size
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
