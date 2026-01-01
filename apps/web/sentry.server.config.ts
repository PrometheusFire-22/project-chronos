import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "https://06df85f7ae02776b47547a4bb60ba846@o4510559645925376.ingest.us.sentry.io/4510559662309376",

  // Performance monitoring - 10% sample rate in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment tracking
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.CF_PAGES_COMMIT_SHA,

  // Integrations for server-side
  integrations: [
    // HTTP instrumentation
    Sentry.httpIntegration(),

    // Node.js performance monitoring
    Sentry.nodeProfilingIntegration(),
  ],

  // Filter sensitive server data
  beforeSend(event) {
    // Remove environment variables from context
    if (event.contexts && event.contexts.runtime) {
      delete event.contexts.runtime.env;
    }

    // Sanitize request data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;

      // Sanitize query params
      if (event.request.query_string) {
        event.request.query_string = event.request.query_string
          .replace(/([?&])(email|token|key|password|api_key)=[^&]*/gi, '$1$2=REDACTED');
      }
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Expected Next.js errors
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
});
