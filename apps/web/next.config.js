//@ts-check
import { composePlugins, withNx } from '@nx/next';
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  transpilePackages: ['@chronos/ui'],
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

/**
 * @param {string} phase
 * @param {any} context
 */
export default async (phase, context) => {
  const config = composePlugins(...plugins)(nextConfig);
  // composePlugins might return a function or an object depending on version
  const resolvedConfig = typeof config === 'function' ? await config(phase, context) : config;
  return withPayload(resolvedConfig);
};
