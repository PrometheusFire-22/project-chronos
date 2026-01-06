import { Toucan } from '@sentry/cloudflare';

export interface Env {
  // Add environment variables here
  SENTRY_DSN?: string;
  ENVIRONMENT?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Initialize Sentry
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN || "https://06df85f7ae02776b47547a4bb60ba846@o4510559645925376.ingest.us.sentry.io/4510559662309376",
      context: ctx,
      request,
      environment: env.ENVIRONMENT || 'development',
      tracesSampleRate: env.ENVIRONMENT === 'production' ? 0.1 : 1.0,
    });

    try {
      // Your worker logic here
      return new Response('Hello World from Cloudflare Worker!', {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } catch (error) {
      // Capture errors to Sentry
      sentry.captureException(error);

      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};
