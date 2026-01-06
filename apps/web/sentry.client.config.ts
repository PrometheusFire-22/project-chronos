import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "https://06df85f7ae02776b47547a4bb60ba846@o4510559645925376.ingest.us.sentry.io/4510559662309376",

  // Performance monitoring - 10% sample rate in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay - 10% of sessions in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  // Capture 100% of sessions with errors
  replaysOnErrorSampleRate: 1.0,

  // Environment tracking
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Release tracking
  // Note: CF_PAGES_COMMIT_SHA is not available in browser, use NEXT_PUBLIC_SENTRY_RELEASE
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Integrations for client-side
  integrations: [
    // Session replay for debugging user sessions
    Sentry.replayIntegration({
      // Mask all text content for privacy
      maskAllText: true,
      // Block all media for privacy and performance
      blockAllMedia: true,
    }),
    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration(),
  ],

  // Filter sensitive client data
  beforeSend(event) {
    // Remove cookies and local storage from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
          delete breadcrumb.data?.['Set-Cookie'];
        }
        return breadcrumb;
      });
    }

    // Sanitize query params from URLs
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        // Remove sensitive query parameters
        ['email', 'token', 'key', 'password', 'api_key'].forEach(param => {
          if (url.searchParams.has(param)) {
            url.searchParams.set(param, 'REDACTED');
          }
        });
        event.request.url = url.toString();
      } catch (e) {
        // Invalid URL, leave as is
      }
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Network errors (user went offline)
    'Network request failed',
    'NetworkError',
    // Expected Next.js errors
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
    // Random plugins/extensions
    'Can\'t find variable: _AutofillCallbackHandler',
  ],
});
