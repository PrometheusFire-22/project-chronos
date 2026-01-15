'use client';

if (typeof globalThis !== 'undefined') {
    // Polyfill for esbuild's keep-names helper that sometimes goes missing in Cloudflare/Next.js builds
    if (!(globalThis as any).__name) {
        (globalThis as any).__name = (target: any, value: any) => {
            Object.defineProperty(target, 'name', { value, configurable: true });
            return target;
        };
    }
}

export default function ClientPolyfills() {
    return null;
}
