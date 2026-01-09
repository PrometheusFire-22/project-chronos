import * as esbuild from 'esbuild';

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
                const shimPath = '/workspace/apps/web/shims/crypto.js';
                build.onResolve({ filter: /^node:crypto$/ }, args => {
                    if (args.importer.endsWith('shims/crypto.js')) return { path: args.path, external: true };
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
