import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://06df85f7ae02776b47547a4bb60ba846@o4510559645925376.ingest.us.sentry.io/4510559662309376",
  tracesSampleRate: 1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
