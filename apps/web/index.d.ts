/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

// Cloudflare Bindings type definitions
// Augment the existing CloudflareEnv interface from @opennextjs/cloudflare
declare module '@opennextjs/cloudflare' {
  interface CloudflareEnv {
    DB?: {
      connectionString: string;
    };
    MEDIA?: any;
  }
}
