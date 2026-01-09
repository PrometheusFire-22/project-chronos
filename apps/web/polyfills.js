import { Buffer } from 'node:buffer';
import { AsyncLocalStorage } from 'node:async_hooks';

globalThis.Buffer = Buffer;
globalThis.AsyncLocalStorage = AsyncLocalStorage;
globalThis.process = globalThis.process || { env: {} };
