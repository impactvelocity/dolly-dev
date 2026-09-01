"use client";

import { useRef, useState } from "react";
import {
  AgentHistoryDrawer,
  AgentStatusBadge,
  AgentToolsDrawer,
  useWebMCPExperience,
} from "@webmcp-sdk/experience";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ConnectedPreview() {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBadge = () => {
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 6000);
  };

  return (
    <>
      <button type="button" className="btn-ghost" onClick={showBadge}>
        Preview the status badge
      </button>
      {visible ? (
        <AgentStatusBadge corner="bottom-left" hideWhenUnavailable={false} />
      ) : null}
    </>
  );
}

export function ShowWorkPreview() {
  const experience = useWebMCPExperience();
  const running = useRef(false);

  const run = async () => {
    if (running.current) return;
    running.current = true;
    try {
      experience.startWork("The agent is working…", undefined, {
        overlay: true,
      });
      await wait(1400);
      experience.progress("Narrating progress from inside the call…");
      await wait(1400);
      experience.endWork("Done — settled with a toast");
    } finally {
      running.current = false;
    }
  };

  return (
    <button type="button" className="btn-ghost" onClick={() => void run()}>
      Preview the work lifecycle
    </button>
  );
}

export function ToolsPreview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn-ghost" onClick={() => setOpen(true)}>
        Preview the tools drawer
      </button>
      <AgentToolsDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function HistoryPreview() {
  const experience = useWebMCPExperience();
  const [open, setOpen] = useState(false);

  const show = () => {
    experience.logTask(
      "Previewed the history drawer from the %%section%% section",
      { section: "history" },
      { icon: "🧾" },
    );
    setOpen(true);
  };

  return (
    <>
      <button type="button" className="btn-ghost" onClick={show}>
        Preview the history drawer
      </button>
      <AgentHistoryDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function PermissionPreview() {
  const experience = useWebMCPExperience();
  const running = useRef(false);

  const run = async () => {
    if (running.current) return;
    running.current = true;
    try {
      await experience.confirm({
        title: "Delete the Paris trip?",
        description:
          "The agent wants to delete this trip. This is what a tool sees mid-execute.",
        tone: "destructive",
        confirmLabel: "Delete",
      });
    } finally {
      running.current = false;
    }
  };

  return (
    <button type="button" className="btn-ghost" onClick={() => void run()}>
      Preview the confirm dialog
    </button>
  );
}

export function ApiPreview() {
  const experience = useWebMCPExperience();
  const running = useRef(false);

  const run = async () => {
    if (running.current) return;
    running.current = true;
    try {
      experience.startWork("Adding the product…", undefined, {
        overlay: true,
      });
      await wait(1600);
      experience.endWork("Added to the cart");
      experience.logTask(
        "Added %%productId%% to the cart",
        { productId: "the field jacket" },
        { icon: "🛒" },
      );
    } finally {
      running.current = false;
    }
  };

  return (
    <button type="button" className="btn-ghost" onClick={() => void run()}>
      Run this example
    </button>
  );
}
