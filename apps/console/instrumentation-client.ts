import posthog from "posthog-js";

// Stamped onto every event so all Dolly traffic can be filtered by
// `project`, and split by `surface` (site, app, docs, ...).
const tags = { project: "dolly-dev", surface: "app" };

// Runs once on the client before hydration. `defaults` turns on automatic
// pageview capture, including client-side route changes.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    defaults: "2026-05-30",
    before_send: (event) => {
      if (event) event.properties = { ...event.properties, ...tags };
      return event;
    },
  });
}
