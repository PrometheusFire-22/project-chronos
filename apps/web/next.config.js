import { composePlugins, withNx } from '@nx/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  nx: {},
  transpilePackages: ['@chronos/ui'],
  experimental: {
    turbopack: {
      root: '../../',
    },
  },
};

// Check if we're running in Cloudflare context
if (process.env.NODE_ENV === 'development') {
  // Use IIFE to avoid top-level await which breaks Nx graph processing
  (async () => {
    const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
    await setupDevPlatform();
  })();
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

export default composePlugins(...plugins)(nextConfig);
