import { Buffer } from 'node:buffer';
import { AsyncLocalStorage } from 'node:async_hooks';

globalThis.Buffer = Buffer;
globalThis.AsyncLocalStorage = AsyncLocalStorage;
globalThis.process = globalThis.process || { env: {} };

// Minimal polyfill for __dirname/__filename (often needed by bundled libs)
globalThis.__filename = '/index.js';
globalThis.__dirname = '/';

// Polyfill setImmediate (standard in Node, missing in some runtimes)
if (!globalThis.setImmediate) {
    globalThis.setImmediate = (cb, ...args) => setTimeout(cb, 0, ...args);
    globalThis.clearImmediate = (id) => clearTimeout(id);
}

// Polyfill require() for ESM environment (crucial for Next.js dynamic requires)
import { createRequire } from 'node:module';
try {
    globalThis.require = createRequire(import.meta.url);
} catch (e) {
    console.warn('Failed to polyfill require():', e);
}
