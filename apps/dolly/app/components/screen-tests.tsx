"use client";

import { useCallback, useRef, useState } from "react";
import {
  AgentHistoryDrawer,
  AgentToolsDrawer,
  useRig,
  useWebMCPTool,
} from "@dolly/rig";

const SCENE_SELECTORS: Record<string, string> = {
  problem: "#problem",
  "open-in": "#open-in",
  onboarding: "#onboarding",
  connected: "#connected",
  "show-work": "#show-work",
  tools: "#tools",
  history: "#history",
  styling: "#styling",
  "screen-tests": "#screen-tests",
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function LogIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* Lucide video */
const CAMERA_ICON = (
  <LogIcon>
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </LogIcon>
);

/* Lucide clapperboard */
const SLATE_ICON = (
  <LogIcon>
    <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
    <path d="m6.2 5.3 3.1 3.9" />
    <path d="m12.4 3.4 3.1 4" />
    <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </LogIcon>
);

/* Lucide flashlight */
const SPOTLIGHT_ICON = (
  <LogIcon>
    <path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z" />
    <line x1="6" x2="18" y1="6" y2="6" />
    <line x1="12" x2="12" y1="12" y2="12" />
  </LogIcon>
);

export function ScreenTests() {
  const rig = useRig();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const takeCounter = useRef(1);
  const rolling = useRef(false);

  const rollCamera = useCallback(async () => {
    if (rolling.current) return "Already rolling.";
    rolling.current = true;
    try {
      // The dolly's lap: up the page, then back down to the board. Scroll
      // ahead of each spotlight so the section's reveal has run before the
      // ring is drawn around it.
      const stop = async (selector: string, message: string, dwell = 2400) => {
        document
          .querySelector(selector)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        await wait(900);
        rig.focus(selector, message);
        await wait(dwell);
      };

      rig.startWork("Rolling — the dolly heads up the page…", undefined, {
        overlay: true,
      });
      await stop("#connected .rounded-3xl", "The header flips to working…");
      await stop("#show-work .rounded-3xl", "startWork narrates on the page…");
      await stop("#history .rounded-3xl", "log writes the receipt…");
      await stop("#tools .rounded-3xl", "example lands under “Try asking”…");
      await stop("#st-triggers", "…and cut, back where we started", 1600);
      rig.endWork("Cut. The take is in the history feed.");
      rig.logTask("Rolled take %%take%% — a spotlight lap of the page", {
        take: takeCounter.current++,
      }, { icon: CAMERA_ICON, toolName: "roll_camera" });
      return "Rolled a full take: a spotlight lap of the page's sections.";
    } finally {
      rolling.current = false;
    }
  }, [rig]);

  const spotlightScene = useCallback(
    async (scene: string) => {
      const selector = SCENE_SELECTORS[scene] ?? "#screen-tests";
      document.querySelector(selector)?.scrollIntoView({ block: "center" });
      await wait(450);
      rig.startWork(`Spotlighting the ${scene} scene…`, selector);
      await wait(2600);
      rig.endWork("Spotlight released");
      return `Focused ${selector} with the dimmed-spotlight highlight.`;
    },
    [rig],
  );

  const logTake = useCallback(
    (note?: string) => {
      const entry = rig.logTask(
        note ?? "Slate marked — take %%take%% logged by hand",
        { take: takeCounter.current++ },
        { icon: SLATE_ICON, toolName: "log_take" },
      );
      setHistoryOpen(true);
      return `Logged: ${entry.message}`;
    },
    [rig],
  );

  useWebMCPTool({
    name: "roll_camera",
    description:
      "Run a visible take of Dolly's work lifecycle: ambient glow, a spotlight lap of the page's sections, and a settled toast.",
    example: "Roll the camera on Dolly.dev",
    async execute() {
      const text = await rollCamera();
      return { content: [{ type: "text", text }] };
    },
  });

  useWebMCPTool({
    name: "spotlight_scene",
    description:
      "Dim the page and spotlight one section of Dolly.dev: problem, open-in, onboarding, connected, show-work, tools, history, styling, or screen-tests.",
    inputSchema: {
      type: "object",
      properties: {
        scene: {
          type: "string",
          enum: Object.keys(SCENE_SELECTORS),
          description: "Which section of the site to spotlight.",
        },
      },
      required: ["scene"],
    },
    example: "Spotlight the features section",
    log: "Spotlit the %%scene%% scene",
    logIcon: SPOTLIGHT_ICON,
    async execute({ scene }: { scene: string }) {
      const text = await spotlightScene(scene);
      return { content: [{ type: "text", text }] };
    },
  });

  useWebMCPTool({
    name: "log_take",
    description:
      "Write a note into the visible agent history feed and open the history drawer.",
    inputSchema: {
      type: "object",
      properties: {
        note: { type: "string", description: "What to record on the slate." },
      },
    },
    example: "Log a take that says hello from ChatGPT",
    async execute({ note }: { note?: string }) {
      return { content: [{ type: "text", text: logTake(note) }] };
    },
  });

  return (
    <>
      <div id="st-triggers" className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2">
        <button type="button" className="btn-pill btn-pill--teal" onClick={() => void rollCamera()}>
          <PillIcon>
            <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
            <rect x="2" y="6" width="14" height="12" rx="2" />
          </PillIcon>
          Roll camera
        </button>
        <button
          type="button"
          className="btn-pill btn-pill--ghost"
          onClick={() => void spotlightScene("show-work")}
        >
          {/* Lucide flashlight */}
          <PillIcon>
            <path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z" />
            <line x1="6" x2="18" y1="6" y2="6" />
            <line x1="12" x2="12" y1="12" y2="12" />
          </PillIcon>
          Spotlight a section
        </button>
        <button type="button" className="btn-pill btn-pill--ghost" onClick={() => logTake()}>
          {/* Lucide clapperboard */}
          <PillIcon>
            <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
            <path d="m6.2 5.3 3.1 3.9" />
            <path d="m12.4 3.4 3.1 4" />
            <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          </PillIcon>
          Log a take
        </button>
        <button
          type="button"
          className="btn-pill btn-pill--ghost"
          onClick={() => rig.openOnboarding()}
        >
          {/* Lucide sparkles */}
          <PillIcon>
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
          </PillIcon>
          Run onboarding
        </button>
        <button
          type="button"
          className="btn-pill btn-pill--ghost"
          onClick={() => setToolsOpen(true)}
        >
          {/* Lucide wrench */}
          <PillIcon>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </PillIcon>
          What agents can do
        </button>
        <button
          type="button"
          className="btn-pill btn-pill--ghost"
          onClick={() => setHistoryOpen(true)}
        >
          {/* Lucide receipt-text */}
          <PillIcon>
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
            <path d="M14 8H8" />
            <path d="M16 12H8" />
            <path d="M13 16H8" />
          </PillIcon>
          What agents did
        </button>
      </div>

      {/* Why "Dolly" — for anyone who hasn't spent time on a film set */}
      <p className="mx-auto mt-8 max-w-md text-center text-sm leading-relaxed text-pretty text-[var(--muted)]">
        <span className="font-medium text-[var(--silver)]">Dolly:</span> the
        wheeled rig a camera rides to follow the action without losing the
        frame. Same job here.
      </p>

      <AgentToolsDrawer open={toolsOpen} onClose={() => setToolsOpen(false)} />
      <AgentHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
}

function PillIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
