"use client";

import { useEffect, useState, type ReactNode } from "react";
import { highlight } from "../components/highlight";
import {
  ApiMedia,
  ConnectionMedia,
  HistoryMedia,
  MultiplayerMedia,
  OnboardingMedia,
  OpenInMedia,
  PermissionMedia,
  ShowWorkMedia,
  ToolsMedia,
} from "../components/section-media";

/*
 * Shoot mode — one full-viewport frame per beat of the submission video.
 * Scroll (or arrow-key) between scenes; press H to hide the slate labels
 * for a clean recording. The media components loop on their own, so each
 * frame keeps moving for as long as the take needs.
 */

const CODE_SNIPPET = `useWebMCPTool({
  name: "add_to_cart",
  description: "Add a product to the active cart",
  example: "Add the field jacket to my cart",
  log: "Added %%productId%% to the cart",
  inputSchema: { /* … */ },

  async execute({ productId }) {
    rig.startWork("Adding the product…", "#cart");
    await addToCart(productId);
    rig.endWork("Added to the cart");
  },
});`;

/* ---- Scene 3: the problem — tools run, the page shows nothing ------- */

const INVISIBLE_CALLS = [
  ["add_contact(“Maya Chen”)", "✓ 82ms"],
  ["create_deal(“Northwind renewal”)", "✓ 140ms"],
  ["update_stage(“Qualified”)", "✓ 96ms"],
] as const;

function ProblemMedia() {
  return (
    <div className="relative w-full max-w-md self-center py-10">
      {/* A quiet app — nothing moves */}
      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white opacity-60 shadow-[0_18px_44px_rgba(19,19,40,0.12)]">
        <div className="flex h-8 items-center gap-2 border-b border-[var(--line-soft)] bg-zinc-50/80 px-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="size-2 rounded-full bg-zinc-200" />
            <i className="size-2 rounded-full bg-zinc-200" />
          </span>
          <span className="mx-auto rounded-md border border-zinc-200 bg-white px-4 py-0.5 text-[9px] text-zinc-400">
            dollycrm.app
          </span>
          <span className="w-6" aria-hidden="true" />
        </div>
        <div className="space-y-2 p-4">
          <i className="block h-2 w-24 rounded-full bg-zinc-200 not-italic" />
          {[36, 28, 32, 30].map((width) => (
            <div
              key={width}
              className="flex items-center gap-2.5 rounded-lg border border-zinc-100 px-3 py-2.5"
            >
              <i className="size-5 rounded-full bg-zinc-100 not-italic" />
              <i
                className="block h-1.5 rounded-full bg-zinc-200 not-italic"
                style={{ width: `${width * 3}px` }}
              />
              <i className="ml-auto block h-1.5 w-8 rounded-full bg-zinc-100 not-italic" />
            </div>
          ))}
        </div>
      </div>

      {/* …while the tool calls land invisibly */}
      <div className="mono absolute -right-4 top-1/2 w-64 -translate-y-1/2 rounded-xl border border-white/10 bg-[var(--screen-deep)] p-3.5 text-[10px] leading-relaxed shadow-[0_18px_44px_rgba(19,19,40,0.3)] sm:-right-16">
        <p className="m-0 flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.18em] text-[var(--on-dark-muted)]">
          <i className="media-rec size-1.5 rounded-full bg-[var(--cyan)] not-italic" />
          Tool calls
        </p>
        <div className="mt-2 space-y-1.5">
          {INVISIBLE_CALLS.map(([call, time]) => (
            <p key={call} className="m-0 flex justify-between gap-3 text-[var(--on-dark)]">
              <span className="truncate">{call}</span>
              <span className="shrink-0 text-emerald-400">{time}</span>
            </p>
          ))}
        </div>
        <p className="m-0 mt-2.5 border-t border-white/10 pt-2 text-[8.5px] uppercase tracking-[0.18em] text-[var(--on-dark-muted)]">
          On the page: nothing
        </p>
      </div>
    </div>
  );
}

/* ---- Scene 12: end card --------------------------------------------- */

function EndCard() {
  return (
    <div className="flex flex-col items-center text-center">
      <ApiMedia />
      <h2 className="m-0 mt-2 text-6xl leading-[1.05] tracking-wide sm:text-7xl">
        Dolly.dev
      </h2>
      <p className="m-0 mt-5 text-xl text-[var(--muted)]">
        Keep the agent action in frame
      </p>
      <p className="mono m-0 mt-8 text-[0.72rem] tracking-[0.14em] text-[var(--faint)]">
        @dolly/rig · github.com/impactvelocity/dolly-dev · dollycrm.app
      </p>
    </div>
  );
}

/* ---- The scene list -------------------------------------------------- */

const SCENES: {
  slate: string;
  headline?: ReactNode;
  subline?: ReactNode;
  media?: ReactNode;
  /** Scale the media up for the camera. */
  zoom?: number;
}[] = [
  {
    slate: "SC 01 · OPENER — WebMCP unlocks multiplayer",
    headline: (
      <>
        WebMCP unlocks
        <br />
        multiplayer
      </>
    ),
    media: <MultiplayerMedia />,
    zoom: 1.15,
  },
  {
    slate: "SC 02 · PROBLEM — calls tools, doesn't follow the action",
    headline: (
      <>
        WebMCP calls the tools —
        <br />
        but doesn&rsquo;t follow the action
      </>
    ),
    subline: (
      <>Fine for headless automation. In multiplayer, the action has to be felt.</>
    ),
  },
  {
    slate: "SC 03 · TITLE",
    headline: (
      <>
        Keep the Agent
        <br />
        Action In Frame
      </>
    ),
    subline: (
      <>
        Dolly — a React SDK for WebMCP
        <span className="mx-3 text-[var(--line)]">·</span>
        WebMCP Challenge entry
      </>
    ),
  },
  {
    slate: "SC 04 · THESIS — multiplayer, not a chatbox",
    headline: (
      <>
        Not everything
        <br />
        should be a chatbox
      </>
    ),
    subline: (
      <>You and an agent, working the same interface at the same time</>
    ),
  },
  {
    slate: "SC 05 · PROBLEM — WebMCP calls tools invisibly",
    headline: (
      <>
        The agent works.
        <br />
        The page shows nothing.
      </>
    ),
    media: <ProblemMedia />,
    zoom: 1.1,
  },
  {
    slate: "SC 06 · OPEN IN — multiplayer starts with one button",
    headline: <>One button in</>,
    subline: <>Deeplink the site straight into the agent</>,
    media: <OpenInMedia />,
    zoom: 1.2,
  },
  {
    slate: "SC 07 · ONBOARDING — treat arrival like a first launch",
    headline: <>Onboarding, once inside</>,
    subline: <>Here&rsquo;s what&rsquo;s possible, here&rsquo;s what to ask</>,
    media: <OnboardingMedia />,
    zoom: 1.25,
  },
  {
    slate: "SC 08 · CONNECTION — is the agent actually connected?",
    headline: <>Show the connection</>,
    media: <ConnectionMedia />,
    zoom: 1.25,
  },
  {
    slate: "SC 09 · WORK — glow, spotlight, progress",
    headline: <>Show the work</>,
    media: <ShowWorkMedia />,
    zoom: 1.3,
  },
  {
    slate: "SC 10 · PERMISSION — a human stays in the loop",
    headline: <>Ask for permission</>,
    media: <PermissionMedia />,
    zoom: 1.25,
  },
  {
    slate: "SC 11 · HISTORY — magic, with a receipt",
    headline: <>Show what happened</>,
    media: <HistoryMedia />,
    zoom: 1.2,
  },
  {
    slate: "SC 12 · TOOLS — keyboard shortcuts, but for the agent",
    headline: <>Show what&rsquo;s possible</>,
    media: <ToolsMedia />,
    zoom: 1.2,
  },
  {
    slate: "SC 13 · BUILD — one provider, one hook per tool",
    headline: <>One hook does it all</>,
    subline: <>Registers the tool, narrates the work, logs the receipt</>,
    media: (
      <div className="code-window w-full max-w-xl text-left">
        <pre className="overflow-x-auto">
          <code>{highlight(CODE_SNIPPET)}</code>
        </pre>
      </div>
    ),
  },
  {
    slate: "SC 14 · END CARD",
    media: <EndCard />,
  },
];

export function VideoScenes() {
  const [showSlates, setShowSlates] = useState(true);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "h") {
        setShowSlates((current) => !current);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="h-screen snap-y snap-mandatory overflow-y-auto">
      {SCENES.map((scene, index) => (
        <section
          key={scene.slate}
          className="relative flex h-screen snap-start flex-col items-center justify-center overflow-hidden px-6"
        >
          {scene.headline ? (
            <h2 className="m-0 max-w-4xl text-center text-5xl leading-[1.05] tracking-wide text-pretty sm:text-6xl">
              {scene.headline}
            </h2>
          ) : null}
          {scene.subline ? (
            <p className="m-0 mt-6 max-w-2xl text-center text-xl leading-relaxed text-[var(--muted)]">
              {scene.subline}
            </p>
          ) : null}
          {scene.media ? (
            <div
              className="mt-4 flex w-full justify-center"
              style={scene.zoom ? { transform: `scale(${scene.zoom})` } : undefined}
            >
              {scene.media}
            </div>
          ) : null}

          {/* Slate chrome — press H to hide before recording */}
          {showSlates ? (
            <>
              <p className="mono absolute bottom-6 left-8 m-0 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--faint)]">
                {scene.slate}
              </p>
              <p className="mono absolute bottom-6 right-8 m-0 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--faint)]">
                {index + 1} / {SCENES.length}
                <span className="mx-2 text-[var(--line)]">·</span>H hides labels
              </p>
            </>
          ) : null}
        </section>
      ))}
    </main>
  );
}
