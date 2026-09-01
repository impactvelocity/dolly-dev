"use client";

import { useCallback, useRef, useState } from "react";
import { CornerMarks } from "./corner-marks";
import {
  AgentHistoryDrawer,
  AgentToolsDrawer,
  useWebMCPExperience,
  useWebMCPTool,
} from "@webmcp-sdk/experience";

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

export function ScreenTests() {
  const experience = useWebMCPExperience();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const takeCounter = useRef(1);
  const rolling = useRef(false);

  const rollCamera = useCallback(async () => {
    if (rolling.current) return "Already rolling.";
    rolling.current = true;
    try {
      experience.startWork("Rolling — take in progress…", undefined, {
        overlay: true,
      });
      await wait(1400);
      experience.progress("Holding focus on the subject…");
      await wait(1400);
      experience.endWork("Cut. The take is in the history feed.");
      experience.logTask("Rolled take %%take%% with the ambient glow", {
        take: takeCounter.current++,
      }, { icon: "🎥", toolName: "roll_camera" });
      return "Rolled a full take: startWork → progress → endWork.";
    } finally {
      rolling.current = false;
    }
  }, [experience]);

  const spotlightScene = useCallback(
    async (scene: string) => {
      const selector = SCENE_SELECTORS[scene] ?? "#screen-tests";
      document.querySelector(selector)?.scrollIntoView({ block: "center" });
      await wait(450);
      experience.startWork(`Spotlighting the ${scene} scene…`, selector);
      await wait(2600);
      experience.endWork("Spotlight released");
      return `Focused ${selector} with the dimmed-spotlight highlight.`;
    },
    [experience],
  );

  const logTake = useCallback(
    (note?: string) => {
      const entry = experience.logTask(
        note ?? "Slate marked — take %%take%% logged by hand",
        { take: takeCounter.current++ },
        { icon: "🎬", toolName: "log_take" },
      );
      setHistoryOpen(true);
      return `Logged: ${entry.message}`;
    },
    [experience],
  );

  useWebMCPTool({
    name: "roll_camera",
    description:
      "Run a visible take of Dolly's work lifecycle: ambient glow, progress narration, and a settled toast.",
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
    logIcon: "🔦",
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

  const { snapshot, tools, history } = experience;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      {/* Trigger board */}
      <div
        className="rounded-2xl border border-[var(--line-soft)] bg-white p-6 shadow-[0_16px_40px_rgba(19,19,40,0.08)] sm:p-8"
        id="st-stage"
      >
        <p className="slate-label mb-6">Trigger board — every button drives the real SDK</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn-key" onClick={() => void rollCamera()}>
            ● Roll camera
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => void spotlightScene("show-work")}
          >
            🔦 Spotlight a section
          </button>
          <button type="button" className="btn-ghost" onClick={() => logTake()}>
            🎬 Log a take
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => experience.openOnboarding()}
          >
            ✦ Run onboarding
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setToolsOpen(true)}
          >
            What agents can do
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setHistoryOpen(true)}
          >
            What agents did
          </button>
        </div>
        <p className="mt-6 text-base leading-relaxed text-[var(--muted)]">
          The same three actions are registered as live WebMCP tools on this
          page — open Dolly.dev inside an agent browser and ask it to{" "}
          <span className="text-[var(--silver)]">
            &ldquo;roll the camera&rdquo;
          </span>{" "}
          or{" "}
          <span className="text-[var(--silver)]">
            &ldquo;spotlight the features section&rdquo;
          </span>
          .
        </p>
      </div>

      {/* Camera OSD monitor */}
      <CornerMarks>
        <div className="code-window flex h-full flex-col">
        <div className="flex items-center border-b border-[rgba(255,255,255,0.1)] px-5 py-3">
          <span className="slate-label">Monitor — live provider snapshot</span>
        </div>
        <dl className="mono grid flex-1 content-start gap-y-3 px-5 py-5 text-[0.74rem]">
          {[
            ["PHASE", snapshot.phase.toUpperCase()],
            ["CONNECTION", snapshot.connection.toUpperCase()],
            ["AGENT", snapshot.agentLabel ?? "NONE DETECTED"],
            ["MODEL CONTEXT", snapshot.modelContextAvailable ? "AVAILABLE" : "ABSENT"],
            ["TOOLS REGISTERED", String(tools.length)],
            ["HISTORY ENTRIES", String(history.length)],
            ["MESSAGE", snapshot.message ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-[rgba(255,255,255,0.1)] pb-2">
              <dt className="text-[var(--faint)] tracking-[0.14em]">{label}</dt>
              <dd className="m-0 text-right text-[var(--cyan)]">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-[rgba(255,255,255,0.1)] px-5 py-3 text-xs text-[var(--on-dark-muted)]">
          Reading <code className="mono">useWebMCPExperience().snapshot</code> in
          real time.
        </p>
        </div>
      </CornerMarks>

      <AgentToolsDrawer open={toolsOpen} onClose={() => setToolsOpen(false)} />
      <AgentHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}
