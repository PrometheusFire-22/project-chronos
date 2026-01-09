import { Buffer } from 'node:buffer';
import { AsyncLocalStorage } from 'node:async_hooks';

globalThis.Buffer = Buffer;
globalThis.AsyncLocalStorage = AsyncLocalStorage;
globalThis.process = globalThis.process || { env: {} };

// Minimal polyfill for __dirname/__filename (often needed by bundled libs)
globalThis.__filename = '/index.js';
globalThis.__dirname = '/';

// Polyfill setImmediate
if (!globalThis.setImmediate) {
    globalThis.setImmediate = (cb, ...args) => setTimeout(cb, 0, ...args);
    globalThis.clearImmediate = (id) => clearTimeout(id);
}

// Super Polyfill for require() to handle dynamic imports of built-ins
import * as _crypto from 'node:crypto';
import * as _buffer from 'node:buffer';
import * as _events from 'node:events';
import * as _util from 'node:util';
import * as _path from 'node:path';
import * as _fs from 'node:fs';
import * as _net from 'node:net';
import * as _tls from 'node:tls';
import * as _stream from 'node:stream';
import * as _url from 'node:url';
import * as _zlib from 'node:zlib';
import * as _http from 'node:http';
import * as _https from 'node:https';
import * as _os from 'node:os';
import * as _process from 'node:process';
import * as _vm from 'node:vm';
import { createRequire } from 'node:module';

const builtinMap = {
    'node:crypto': _crypto, 'crypto': _crypto,
    'node:buffer': _buffer, 'buffer': _buffer,
    'node:events': _events, 'events': _events,
    'node:util': _util, 'util': _util,
    'node:path': _path, 'path': _path,
    'node:fs': _fs, 'fs': _fs,
    'node:net': _net, 'net': _net,
    'node:tls': _tls, 'tls': _tls,
    'node:stream': _stream, 'stream': _stream,
    'node:url': _url, 'url': _url,
    'node:zlib': _zlib, 'zlib': _zlib,
    'node:http': _http, 'http': _http,
    'node:https': _https, 'https': _https,
    'node:os': _os, 'os': _os,
    'node:process': _process, 'process': _process,
    'node:vm': _vm, 'vm': _vm,
};

let realRequire;
try {
    realRequire = createRequire(import.meta.url);
} catch (e) { }

globalThis.require = function (id) {
    if (builtinMap[id]) return builtinMap[id];
    if (realRequire) return realRequire(id);
    throw new Error(`Cannot find module '${id}'`);
};

// Ensure other globals
globalThis.process = globalThis.process || _process;
Object.assign(globalThis.process, { env: {} }); // reset env safe
