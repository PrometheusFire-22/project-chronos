import './polyfills.js';
import worker from './.open-next/worker.js';

export default {
    async fetch(request, env, ctx) {
        try {
            // 1. Diagnostics: Log environment availability
            console.log('[WRAPPER] Request received. Env keys:', Object.keys(env));

            // 2. Polyfill Safety net (redundant but safe)
            globalThis.process = globalThis.process || { env: {} };
            // Merge Cloudflare Env into process.env (critical for Node runtime)
            Object.assign(globalThis.process.env, env);

            // 3. Delegate to original worker
            const response = await worker.fetch(request, env, ctx);
            return response;

        } catch (e) {
            // 4. Trap and display the error
            console.error('[WRAPPER] CRASHED:', e);
            const stack = e.stack || 'No stack trace';
            const msg = e.message || 'Unknown error';
            return new Response(
                `CRITICAL WORKER CRASH\n\nError: ${msg}\n\nStack:\n${stack}\n\nEnv Keys: ${Object.keys(env).join(', ')}`,
                {
                    status: 500,
                    headers: { 'content-type': 'text/plain' }
                }
            );
        }
    }
};
