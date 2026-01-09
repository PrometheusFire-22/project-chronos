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
            name: 'node-prefix-alias',
            setup(build) {
                const builtins = ['assert', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'tty', 'url', 'util', 'vm', 'zlib'];
                const filter = new RegExp(`^(${builtins.join('|')})$`);
                build.onResolve({ filter }, args => ({ path: `node:${args.path}`, external: true }));
            }
        }
    ]
});
