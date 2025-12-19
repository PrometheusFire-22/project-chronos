import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: "https://06df85f7ae02776b47547a4bb60ba846@o4510559645925376.ingest.us.sentry.io/4510559662309376",
      tracesSampleRate: 1,
      debug: false,
      integrations: [
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
      ],
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: "https://06df85f7ae02776b47547a4bb60ba846@o4510559645925376.ingest.us.sentry.io/4510559662309376",
      tracesSampleRate: 1,
      debug: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
