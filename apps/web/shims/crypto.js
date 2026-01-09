// Shim for node:crypto to force static resolution by esbuild
import * as crypto from 'node:crypto';
export * from 'node:crypto';
export default crypto;
