import * as esbuild from 'esbuild';
import path from 'node:path';

await esbuild.build({
    entryPoints: ['worker-wrapper.js'],
    bundle: true,
    minify: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    outfile: '.open-next/_worker.js',
    external: ['node:*', 'cloudflare:*'],
    inject: ['./polyfills.js'],
    plugins: [
        {
            name: 'crypto-shim-alias',
            setup(build) {
                // Use relative path resolved from CWD to ensure it works in CI/Cloudflare
                const shimPath = path.resolve('shims/crypto.js');

                build.onResolve({ filter: /^node:crypto$/ }, args => {
                    // Prevent circular dependency: if the shim itself is importing node:crypto, let it pass as external
                    if (args.importer === shimPath) return { path: args.path, external: true };
                    return { path: shimPath };
                });
                build.onResolve({ filter: /^crypto$/ }, args => {
                    return { path: shimPath };
                });
            }
        },
        {
            name: 'node-prefix-alias',
            setup(build) {
                const builtins = ['assert', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'tty', 'url', 'util', 'vm', 'zlib'];
                const filter = new RegExp(`^(${builtins.join('|')})$`);
                build.onResolve({ filter }, args => ({ path: `node:${args.path}`, external: true }));
            }
        }
    ]
});
