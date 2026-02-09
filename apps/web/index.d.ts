/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

// Cloudflare Bindings type definitions
// Augment the existing CloudflareEnv interface from @opennextjs/cloudflare
declare global {
  interface CloudflareEnv {
    DB?: {
      connectionString: string;
    };
    MEDIA?: {
      [key: string]: any;
    };
    AVATARS?: {
      [key: string]: any;
    };
  }
}

// This export makes this file a module, allowing declare global to work
export {};
