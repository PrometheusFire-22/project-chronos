import { composePlugins, withNx } from '@nx/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  nx: {},
  transpilePackages: ['@chronos/ui'],

  // Disable React Strict Mode to prevent WebGL context loss in MapLibre
  reactStrictMode: false,

  // Fix Better Auth 404 errors (https://github.com/better-auth/better-auth/issues/6671)
  trailingSlash: false,

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
      exclude: ['error', 'warn', 'log'], // Keep console.log for debugging
    } : false,
  },

  generateBuildId: async () => {
    return process.env.CF_PAGES_COMMIT_SHA || 'development'
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://api.automatonicai.com https://static.cloudflareinsights.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://admin.automatonicai.com https://api.automatonicai.com https://o4510559645925376.ingest.us.sentry.io https://tiles.automatonicai.com https://demotiles.maplibre.org https://challenges.cloudflare.com; worker-src 'self' blob:; frame-src 'self' https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
        ],
      },
    ]
  },

  async rewrites() {
    // Use environment variable for API URL (supports local + production)
    // FALLBACK: Hardcoding production URL to ensure Cloudflare Pages works if ENV is missing
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.automatonicai.com';

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
// DISABLED: Temporarily commented out to allow local auth development without Cloudflare setup
// import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
// if (process.env.NODE_ENV === 'development') {
//   initOpenNextCloudflareForDev();
// }

export default composePlugins(...plugins)(nextConfig);
