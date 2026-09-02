"use client";

import { useRef, useState } from "react";
import {
  AgentHistoryDrawer,
  AgentStatusHeader,
  AgentToolsDrawer,
  useRig,
} from "@dolly/rig";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ConnectedPreview() {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHeader = () => {
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 6000);
  };

  return (
    <>
      <button type="button" className="btn-ghost" onClick={showHeader}>
        Preview the status header
      </button>
      {visible ? (
        <div className="mt-4">
          <AgentStatusHeader hideWhenUnavailable={false} />
        </div>
      ) : null}
    </>
  );
}

export function ShowWorkPreview() {
  const rig = useRig();
  const running = useRef(false);

  const run = async () => {
    if (running.current) return;
    running.current = true;
    try {
      rig.startWork("The agent is working…", "#show-work .rounded-3xl", {
        overlay: true,
      });
      await wait(1400);
      rig.progress("Narrating progress from inside the call…");
      await wait(1400);
      rig.endWork("Done — settled with a toast");
    } finally {
      running.current = false;
    }
  };

  return (
    <button type="button" className="btn-pill btn-pill--ghost" onClick={() => void run()}>
      {/* Lucide play */}
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
        <polygon points="6 3 20 12 6 21 6 3" />
      </svg>
      Preview the work lifecycle
    </button>
  );
}

export function ToolsPreview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn-pill btn-pill--ghost" onClick={() => setOpen(true)}>
        {/* Lucide wrench */}
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
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        Preview the tools drawer
      </button>
      <AgentToolsDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function historyIconProps() {
  return {
    viewBox: "0 0 24 24",
    width: 13,
    height: 13,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  } as const;
}

/* Lucide receipt-text */
function ReceiptIcon() {
  return (
    <svg {...historyIconProps()}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8H8" />
      <path d="M16 12H8" />
      <path d="M13 16H8" />
    </svg>
  );
}

/* Lucide shopping-cart */
function CartIcon() {
  return (
    <svg {...historyIconProps()}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

export function HistoryPreview() {
  const rig = useRig();
  const [open, setOpen] = useState(false);

  const show = () => {
    rig.logTask(
      "Previewed the history drawer from the %%section%% section",
      { section: "history" },
      { icon: <ReceiptIcon /> },
    );
    setOpen(true);
  };

  return (
    <>
      <button type="button" className="btn-pill btn-pill--ghost" onClick={show}>
        {/* Lucide receipt-text */}
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
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
          <path d="M14 8H8" />
          <path d="M16 12H8" />
          <path d="M13 16H8" />
        </svg>
        Preview the history drawer
      </button>
      <AgentHistoryDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function PermissionPreview() {
  const rig = useRig();
  const running = useRef(false);

  const run = async () => {
    if (running.current) return;
    running.current = true;
    try {
      await rig.confirm({
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
    <button type="button" className="btn-pill btn-pill--ghost" onClick={() => void run()}>
      {/* Lucide shield-check */}
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
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      Preview the confirm dialog
    </button>
  );
}

export function ApiPreview() {
  const rig = useRig();
  const running = useRef(false);

  const run = async () => {
    if (running.current) return;
    running.current = true;
    try {
      // A page tour: up to Open in, then down the page back to this spot.
      rig.startWork("Running add_to_cart…", "#api .rounded-3xl", {
        overlay: true,
      });
      await wait(2200);
      rig.focus("#open-in .rounded-3xl", "It starts with one click…");
      await wait(2800);
      rig.focus("#connected .rounded-3xl", "The header flips to working…");
      await wait(2800);
      rig.focus("#show-work .rounded-3xl", "startWork narrates on the page…");
      await wait(2800);
      rig.focus("#history .rounded-3xl", "log writes the receipt…");
      rig.logTask(
        "Added %%productId%% to the cart",
        { productId: "the field jacket" },
        { icon: <CartIcon /> },
      );
      await wait(2800);
      rig.focus("#tools .rounded-3xl", "example lands under “Try asking”…");
      await wait(2800);
      rig.focus("#api .rounded-3xl", "…and one hook did all of it");
      await wait(2000);
      rig.endWork("Added to the cart");
    } finally {
      running.current = false;
    }
  };

  return (
    <button type="button" className="btn-pill btn-pill--ghost" onClick={() => void run()}>
      {/* Lucide terminal */}
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
        <path d="m4 17 6-6-6-6" />
        <path d="M12 19h8" />
      </svg>
      Run this example
    </button>
  );
}
