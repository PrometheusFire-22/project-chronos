import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "https://06df85f7ae02776b47547a4bb60ba846@o4510559645925376.ingest.us.sentry.io/4510559662309376",

  // Performance monitoring - sample 10% in production (reduce costs)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay - sample 10% of sessions for debugging UX issues
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // Always capture replays on errors

  // Environment tracking
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Release tracking (links errors to specific deployments)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.CF_PAGES_COMMIT_SHA,

  // Integrations
  integrations: [
    // Session Replay for visual bug reproduction
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),

    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration({
      // Track page loads and route changes
      enableInp: true,
    }),

    // HTTP client tracing
    Sentry.httpClientIntegration(),
  ],

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events from localhost
    if (window.location.hostname === 'localhost') {
      return null;
    }

    // Remove sensitive data from event
    if (event.request) {
      delete event.request.cookies;

      // Sanitize URLs (remove email addresses, tokens, etc.)
      if (event.request.url) {
        event.request.url = event.request.url
          .replace(/([?&])(email|token|key|password)=[^&]*/gi, '$1$2=REDACTED');
      }
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop',

    // Network errors (user's connection issues, not our bugs)
    'NetworkError',
    'Network request failed',

    // Ad blockers
    'adsbygoogle',
  ],

  // User context (if you have auth)
  // Will be set via Sentry.setUser() after login
});
