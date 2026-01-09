/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

// Cloudflare Bindings type definitions
declare module '@opennextjs/cloudflare' {
  export interface CloudflareEnv {
    DB?: {
      connectionString: string;
    };
    MEDIA?: R2Bucket;
    [key: string]: any;
  }
}
