"use client";

import { createChatGPTDeeplink } from "@dolly/rig";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Illustrative media for each FeatureSection — small, real-looking UI
 * vignettes in place of placeholder screenshots. Everything is CSS/SVG,
 * floating on the showcase card with soft shadows.
 */

/* ---- shared bits --------------------------------------------------- */

const FRAME_SHADOW = "shadow-[0_18px_44px_rgba(19,19,40,0.12)]";

function Cursor({
  name,
  color,
  delay = 0.5,
}: {
  name: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="pointer-events-none w-max origin-top-left"
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 320, damping: 18, delay }}
    >
      <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4.5 2.8 19.6 11.9l-7.1 1.5-3.6 6.4L4.5 2.8Z"
          fill={color}
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="ml-1.5 -mt-1.5 block w-max rounded-full px-2.5 py-1 text-[11.5px] font-medium text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </motion.div>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block size-3 shrink-0 animate-spin rounded-full border-[1.5px] border-zinc-300 border-t-[#06b6d4] ${className}`}
      aria-hidden="true"
    />
  );
}

/* ---- 1. Agent multiplayer ------------------------------------------ */

const MULTIPLAYER_DEALS = [
  ["Northwind renewal", "$12,000", "Qualified"],
  ["Acme platform rollout", "$8,400", "Proposal"],
  ["Juniper starter plan", "$5,200", "Won"],
] as const;

export function MultiplayerMedia() {
  return (
    <div className="relative w-full max-w-lg self-center py-8">
      <div
        className={`grid min-h-[290px] grid-cols-[0.85fr_1.25fr] overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white ${FRAME_SHADOW}`}
      >
        {/* Chat on one side… */}
        <div className="flex min-w-0 flex-col border-r border-[var(--line-soft)] bg-zinc-50/60">
          <div className="flex h-8 items-center gap-1.5 border-b border-[var(--line-soft)] px-3 text-[10px] font-semibold text-[var(--silver)]">
            <i className="size-1.5 rounded-full bg-emerald-400 not-italic" />
            ChatGPT
          </div>
          <div className="flex flex-1 flex-col gap-2 p-2.5">
            <p className="m-0 ml-auto max-w-[90%] rounded-xl rounded-br-sm bg-[var(--screen-deep)] px-2.5 py-1.5 text-[9px] leading-relaxed text-white">
              Move the Acme deal to Proposal
            </p>
            <p className="m-0 mr-auto max-w-[90%] rounded-xl rounded-bl-sm border border-zinc-200 bg-white px-2.5 py-1.5 text-[9px] leading-relaxed text-[var(--muted)]">
              Done — Acme platform rollout is in Proposal now.
            </p>
          </div>
          <div className="m-2.5 mt-0 flex items-center justify-between rounded-full border border-zinc-200 bg-white px-2.5 py-1.5 text-[8.5px] text-zinc-400">
            Message ChatGPT
            <i className="grid size-3.5 place-items-center rounded-full bg-[var(--screen-deep)] text-[7px] not-italic text-white">
              ↑
            </i>
          </div>
        </div>

        {/* …the live app on the other */}
        <div className="flex min-w-0 flex-col">
          <div className="flex h-8 items-center gap-2 border-b border-[var(--line-soft)] bg-zinc-50/80 px-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <i className="size-2 rounded-full bg-zinc-200" />
              <i className="size-2 rounded-full bg-zinc-200" />
            </span>
            <span className="mx-auto rounded-md border border-zinc-200 bg-white px-4 py-0.5 text-[9px] text-zinc-500">
              dollycrm.app
            </span>
            <span className="w-6" aria-hidden="true" />
          </div>
          <div className="flex-1 p-3">
            <div className="flex items-baseline justify-between">
              <p className="m-0 text-[11px] font-semibold text-[var(--silver)]">DollyCRM</p>
              <p className="m-0 text-[8.5px] text-zinc-400">Deals · $25,600 open</p>
            </div>
            <div className="mt-2.5 divide-y divide-zinc-100 rounded-lg border border-zinc-100">
              {MULTIPLAYER_DEALS.map(([name, value, stage]) => (
                <div key={name} className="flex items-center gap-2 px-2 py-1.5">
                  <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-[var(--silver)]">
                    {name}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-px text-[7.5px] ${
                      name === "Acme platform rollout"
                        ? "bg-[#ecfeff] font-semibold text-[#0e7490]"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {stage}
                  </span>
                  <span className="text-[9px] font-semibold tabular-nums text-[var(--silver)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two people, one interface */}
      <div className="media-drift-a absolute left-[44%] top-[30%]">
        <Cursor name="You" color="#1b1b34" delay={0.55} />
      </div>
      <div className="media-drift-b absolute left-[68%] top-[56%]">
        <Cursor name="ChatGPT" color="#06b6d4" delay={0.8} />
      </div>
    </div>
  );
}

/* ---- 2. Open in <agent> -------------------------------------------- */

function OpenAIMark() {
  return (
    <svg viewBox="0 0 64 64" width="16" height="16" aria-hidden="true">
      <path
        d="M59.4 26.2a16 16 0 0 0-1.4-13.1A16.1 16.1 0 0 0 40.7 5.4 16.2 16.2 0 0 0 13.3 11.2a16 16 0 0 0-10.7 7.7 16.1 16.1 0 0 0 2 18.9 15.9 15.9 0 0 0 1.4 13.1 16.1 16.1 0 0 0 17.3 7.7A16 16 0 0 0 35.4 64a16.1 16.1 0 0 0 15.4-11.2 16 16 0 0 0 10.7-7.7 16.1 16.1 0 0 0-2-18.9ZM35.4 59.8a11.9 11.9 0 0 1-7.7-2.8l.4-.2 12.7-7.4a2.1 2.1 0 0 0 1-1.8V29.7l5.4 3.1a.2.2 0 0 1 .1.2v14.9a12 12 0 0 1-12 12ZM9.6 48.8a11.9 11.9 0 0 1-1.4-8l.4.2 12.7 7.4a2.1 2.1 0 0 0 2.1 0l15.6-9v6.2a.2.2 0 0 1-.1.2L26 53.2a12 12 0 0 1-16.4-4.4ZM6.2 21.1a12 12 0 0 1 6.3-5.3v15.2a2 2 0 0 0 1 1.8l15.5 8.9-5.4 3.1a.2.2 0 0 1-.2 0l-12.9-7.4a12 12 0 0 1-4.4-16.4Zm44.3 10.3-15.6-9 5.4-3.1a.2.2 0 0 1 .2 0l12.9 7.4a12 12 0 0 1-1.8 21.6V33.2a2.1 2.1 0 0 0-1.1-1.8Zm5.4-8.1-.4-.2-12.7-7.4a2.1 2.1 0 0 0-2.1 0l-15.6 9v-6.2a.2.2 0 0 1 .1-.2l12.9-7.4a12 12 0 0 1 17.8 12.4ZM22.2 34.3l-5.4-3.1a.2.2 0 0 1-.1-.2V16.2a12 12 0 0 1 19.7-9.2l-.4.2-12.7 7.4a2.1 2.1 0 0 0-1 1.8Zm2.9-6.3 6.9-4 7 4v8l-7 4-7-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClaudeMark() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M12 2.4v19.2M2.4 12h19.2M5.2 5.2l13.6 13.6M18.8 5.2 5.2 18.8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GeminiMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M12 1.5c.65 5.6 4.9 9.85 10.5 10.5-5.6.65-9.85 4.9-10.5 10.5C11.35 16.9 7.1 12.65 1.5 12 7.1 11.35 11.35 7.1 12 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

const OPEN_IN_BRANDS: {
  key: string;
  label: string;
  background: string;
  glow: string;
  mark: ReactNode;
}[] = [
  {
    key: "chatgpt",
    label: "Open in ChatGPT",
    background: "#0d0d12",
    glow: "rgba(19, 19, 40, 0.4)",
    mark: <OpenAIMark />,
  },
  {
    key: "claude",
    label: "Open in Claude",
    background: "#d97757",
    glow: "rgba(217, 119, 87, 0.5)",
    mark: <ClaudeMark />,
  },
  {
    key: "gemini",
    label: "Open in Gemini",
    background: "linear-gradient(100deg, #3e8dff, #9b72cb)",
    glow: "rgba(122, 129, 230, 0.55)",
    mark: <GeminiMark />,
  },
];

const DEMO_CRM_DEEPLINK = createChatGPTDeeplink("https://dollycrm.app/");

export function OpenInMedia() {
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(
      () => setIndex((current) => (current + 1) % OPEN_IN_BRANDS.length),
      2400,
    );
    return () => clearTimeout(timer);
  }, [inView, index]);

  const brand = OPEN_IN_BRANDS[index]!;

  return (
    <div ref={rootRef} className="flex w-full flex-col items-center gap-8 self-center py-20">
      <div className="relative">
        {/* Brand-colored halo */}
        <div
          aria-hidden="true"
          className="absolute inset-x-2 top-4 -z-10 h-full rounded-full blur-2xl transition-colors duration-700"
          style={{ backgroundColor: brand.glow }}
        />
        {/* A real deeplink: opens the demo CRM inside ChatGPT. */}
        <a
          key={brand.key}
          href={DEMO_CRM_DEEPLINK}
          target="_blank"
          rel="noreferrer"
          className="demo-pop inline-flex items-center gap-2.5 rounded-2xl border border-black/15 px-7 py-4 text-[15px] font-semibold text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_24px_rgba(19,19,40,0.18)] transition-transform hover:-translate-y-0.5"
          style={{ background: brand.background }}
        >
          {brand.mark}
          {brand.label}
          {/* Lucide external-link */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ---- 3. Onboarding ------------------------------------------------- */

const ONBOARDING_STEPS = [
  {
    badge: "MC",
    title: "Manage contacts & deals",
    body: "Add contacts, create deals, and move them through the pipeline — just by asking.",
    line: ["w-16", "w-10"],
    amount: "$12,000",
  },
  {
    badge: "+",
    title: "Add a contact",
    body: "“Add Maya Chen from Northwind” — she shows up in the list, instantly.",
    line: ["w-14", "w-9"],
    amount: "Contact",
  },
  {
    badge: "$",
    title: "Create a deal",
    body: "“Start a $12k renewal for Acme” — filed in the right stage, linked to the right person.",
    line: ["w-12", "w-16"],
    amount: "$12,000",
  },
] as const;

export function OnboardingMedia() {
  const [step, setStep] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(
      () => setStep((current) => (current + 1) % ONBOARDING_STEPS.length),
      2800,
    );
    return () => clearTimeout(timer);
  }, [inView, step]);

  const active = ONBOARDING_STEPS[step]!;
  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <div ref={rootRef} className="self-center py-10">
      <div
        className={`w-[248px] overflow-hidden rounded-[22px] border border-[var(--line-soft)] bg-white ${FRAME_SHADOW}`}
      >
        {/* Illustration area */}
        <div className="flex h-28 items-center justify-center bg-[linear-gradient(150deg,#cffafe,#e0f2fe_55%,#ecfeff)]">
          <div
            key={step}
            className="demo-pop w-36 rounded-xl border border-white/80 bg-white/85 p-2 shadow-[0_8px_20px_rgba(19,19,40,0.1)]"
          >
            <div className="flex items-center gap-1.5">
              <span className="grid size-5 place-items-center rounded-full bg-[#06b6d4] text-[8px] font-bold text-white">
                {active.badge}
              </span>
              <span>
                <i className={`block h-1.5 ${active.line[0]} rounded-full bg-zinc-300 not-italic`} />
                <i className={`mt-1 block h-1.5 ${active.line[1]} rounded-full bg-zinc-200 not-italic`} />
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-md bg-[#ecfeff] px-1.5 py-1">
              <i className="block h-1.5 w-12 rounded-full bg-[#a5f3fc] not-italic" />
              <span className="text-[7.5px] font-semibold text-[#0e7490]">{active.amount}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div key={step} className="demo-pop">
            <p className="m-0 text-[15px] font-medium text-[var(--silver)]">
              {active.title}
            </p>
            <p className="m-0 mt-1.5 min-h-11 text-[11px] leading-relaxed text-[var(--muted)]">
              {active.body}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="flex flex-1 gap-1" aria-hidden="true">
              {ONBOARDING_STEPS.map((entry, segment) => (
                <i
                  key={entry.title}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    segment <= step ? "bg-[#06b6d4]" : "bg-zinc-200"
                  }`}
                />
              ))}
            </span>
            <span className="rounded-lg bg-[#06b6d4] px-3.5 py-1.5 text-[11px] font-medium text-white">
              {isLast ? "Try it" : "Next"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- 4. Show the connection ---------------------------------------- */

const CONNECTION_PHASES = [
  { key: "connected", ms: 2600 },
  { key: "working", ms: 3000 },
  { key: "done", ms: 1900 },
] as const;

export function ConnectionMedia() {
  const [phase, setPhase] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(
      () => setPhase((current) => (current + 1) % CONNECTION_PHASES.length),
      CONNECTION_PHASES[phase]!.ms,
    );
    return () => clearTimeout(timer);
  }, [inView, phase]);

  const state = CONNECTION_PHASES[phase]!.key;

  return (
    <div ref={rootRef} className="w-full max-w-md self-center py-10">
      <div
        className={`overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white ${FRAME_SHADOW}`}
      >
        {/* Status banner */}
        <div className="relative flex items-center justify-between gap-3 bg-[linear-gradient(to_left,#1f2937,#111827)] px-3.5 py-2.5 text-[11px] font-medium text-white">
          {state === "working" ? (
            <span aria-hidden="true" className="demo-progress absolute bottom-0 left-0 h-[2px] rounded-r-full bg-[var(--cyan)]" />
          ) : null}
          <span key={state} className="demo-label flex items-center gap-2">
            {state === "connected" ? (
              <>
                <i className="size-1.5 animate-pulse rounded-full bg-emerald-400 not-italic" />
                ChatGPT connected
              </>
            ) : state === "working" ? (
              <>
                <Spinner className="border-white/30 border-t-white" />
                Adding Maya Chen…
              </>
            ) : (
              <>
                <span className="text-emerald-400">✓</span>
                Contact added
              </>
            )}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-white/60">
            <i className="grid size-3.5 place-items-center rounded-full border border-current text-[8px] not-italic">
              i
            </i>
            What is this
          </span>
        </div>
        {/* Quiet app content underneath */}
        <div className="space-y-2 p-4">
          <i className="block h-2 w-24 rounded-full bg-zinc-200 not-italic" />
          {[36, 28, 32].map((width) => (
            <div key={width} className="flex items-center gap-2.5 rounded-lg border border-zinc-100 px-3 py-2.5">
              <i className="size-5 rounded-full bg-zinc-100 not-italic" />
              <i className="block h-1.5 rounded-full bg-zinc-200 not-italic" style={{ width: `${width * 3}px` }} />
              <i className="ml-auto block h-1.5 w-8 rounded-full bg-zinc-100 not-italic" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- 5. Show the work ---------------------------------------------- */

export function ShowWorkMedia() {
  return (
    <div className="relative w-full max-w-sm self-center py-12">
      {/* Work pill */}
      <motion.div
        className="absolute left-1/2 top-4 z-10 flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-3.5 py-1.5 text-[11px] font-medium text-[var(--silver)] shadow-[0_10px_24px_rgba(19,19,40,0.14)]"
        initial={{ opacity: 0, y: -12, x: "-50%" }}
        whileInView={{ opacity: 1, y: 0, x: "-50%" }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <Spinner />
        Adding two nights…
      </motion.div>

      <div
        className={`rounded-2xl border border-[var(--line-soft)] bg-white p-3.5 ${FRAME_SHADOW}`}
      >
        <p className="m-0 px-1 pb-2 text-[11px] font-medium text-[var(--silver)]">
          Trip itinerary
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2.5 text-[10px] text-zinc-500">
            Lisbon — 3 nights
            <span className="text-zinc-300">✓</span>
          </div>
          {/* The element being changed */}
          <div className="media-pulse-ring relative flex items-center justify-between rounded-lg bg-[#ecfeff] px-3 py-2.5 text-[10px] font-medium text-[#0e7490]">
            Hotel Avenida — 2 nights
            <span className="rounded-full bg-[#06b6d4] px-1.5 py-0.5 text-[7.5px] font-bold uppercase text-white">
              New
            </span>
            <div className="absolute -right-9 top-6">
              <Cursor name="ChatGPT" color="#06b6d4" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2.5 text-[10px] text-zinc-500">
            Flight home
            <span className="text-zinc-300">—</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- 6. Show what happened ----------------------------------------- */

function EventIcon({ path }: { path: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const HISTORY_ICONS = {
  // user-plus
  contact:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M22 11h-6",
  // briefcase
  deal: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M4.5 6h15A2.5 2.5 0 0 1 22 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-9A2.5 2.5 0 0 1 4.5 6Z",
  // trending-up
  stage: "M22 7 13.5 15.5 8.5 10.5 2 17 M16 7h6v6",
  // trash
  removed:
    "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6",
} as const;

const HISTORY_EVENTS = [
  { icon: HISTORY_ICONS.contact, text: "Added Maya Chen to contacts", time: "Just now" },
  { icon: HISTORY_ICONS.deal, text: "Created deal — Northwind renewal", time: "12:04" },
  { icon: HISTORY_ICONS.stage, text: "Moved Northwind to Qualified", time: "12:04" },
  { icon: HISTORY_ICONS.removed, text: "Removed pasta sauce from the cart", time: "11:58" },
];

export function HistoryMedia() {
  const [count, setCount] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const done = count >= HISTORY_EVENTS.length;
    const timer = setTimeout(
      () => setCount((current) => (current >= HISTORY_EVENTS.length ? 1 : current + 1)),
      done ? 3000 : 1500,
    );
    return () => clearTimeout(timer);
  }, [inView, count]);

  const visible = HISTORY_EVENTS.slice(0, count).reverse();

  // Torn receipt edge: top strip plus zigzag teeth across the bottom.
  const teeth = Array.from(
    { length: 20 },
    (_, i) => `L${100 - i * 5 - 2.5} 4 L${100 - i * 5 - 5} 0`,
  ).join(" ");

  return (
    <div ref={rootRef} className="w-full max-w-[290px] self-center py-10">
      <div className="[filter:drop-shadow(0_18px_30px_rgba(19,19,40,0.18))]">
        <div className="mono rounded-t-md bg-white px-5 pb-3 pt-5">
          <p className="m-0 text-center text-[11px] font-semibold tracking-[0.24em] text-[var(--silver)]">
            AGENT RECEIPT
          </p>
          <p className="m-0 mt-1 text-center text-[8.5px] tracking-[0.12em] text-zinc-400">
            WHAT AGENTS DID HERE
          </p>
          <div className="mt-3.5 border-t border-dashed border-zinc-300" />
          <div>
            {visible.map((event) => (
              <div
                key={event.text}
                className="demo-row flex items-start gap-2.5 border-b border-dashed border-zinc-200 py-2.5 last:border-b-0"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-500">
                  <EventIcon path={event.icon} />
                </span>
                <p className="m-0 flex-1 pt-0.5 text-[10.5px] leading-snug text-[var(--silver)]">
                  {event.text}
                </p>
                <span className="pt-1 text-[9px] text-zinc-400">{event.time}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-dashed border-zinc-300 pt-2.5 text-[8.5px] tracking-[0.12em] text-zinc-400">
            <span>
              {count} ACTION{count === 1 ? "" : "S"} LOGGED
            </span>
            <span>DOLLY.DEV</span>
          </div>
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
          className="block h-2.5 w-full"
        >
          <path d={`M0 0 H100 ${teeth} Z`} fill="#fff" />
        </svg>
      </div>
    </div>
  );
}

/* ---- 7. Ask for permission ----------------------------------------- */

export function PermissionMedia() {
  return (
    <div className="relative self-center py-14">
      {/* The tool call, paused mid-flight */}
      <motion.div
        className="mono absolute -top-0 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--line-soft)] bg-white px-3 py-1.5 text-[9.5px] tracking-[0.04em] text-[var(--muted)] shadow-[0_10px_24px_rgba(19,19,40,0.14)]"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.45 }}
      >
        <Spinner className="border-t-red-500" />
        delete_trip()
        <span className="hidden sm:contents">
          <span className="text-zinc-300">·</span> waiting on you
        </span>
      </motion.div>

      <div
        className={`relative w-[300px] max-w-full overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white ${FRAME_SHADOW}`}
      >
        <div className="flex flex-col items-center gap-3 p-4 pb-1 pt-5 text-center">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-600">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6" />
            </svg>
          </span>
          <span>
            <p className="m-0 text-[14px] font-medium text-[var(--silver)]">
              Delete the Paris trip?
            </p>
            <p className="m-0 mt-1 text-[11.5px] leading-relaxed text-[var(--muted)]">
              ChatGPT wants to delete this trip and its{" "}
              <span className="font-medium text-[var(--silver)]">12 bookings</span>. This
              can&rsquo;t be undone.
            </p>
          </span>
        </div>
        <div className="flex gap-2 p-4">
          <span className="flex-1 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-center text-[11px] font-medium text-[var(--silver)]">
            Cancel
          </span>
          <span className="flex-1 rounded-lg bg-red-600 px-3.5 py-1.5 text-center text-[11px] font-medium text-white shadow-[0_6px_16px_rgba(220,38,38,0.35)]">
            Delete
          </span>
        </div>
      </div>

      {/* A human hand hovers over the answer */}
      <div className="absolute bottom-8 right-2">
        <Cursor name="You" color="#1b1b34" delay={0.7} />
      </div>
    </div>
  );
}

/* ---- 8. Show what's possible --------------------------------------- */

const TOOL_ROWS = [
  {
    name: "Add a contact",
    ask: "Add Maya from Northwind",
    icon: HISTORY_ICONS.contact,
  },
  {
    name: "Create a deal",
    ask: "Start a $12k deal for Acme",
    icon: HISTORY_ICONS.deal,
  },
  {
    name: "Move a deal",
    ask: "Move Northwind to Negotiation",
    icon: HISTORY_ICONS.stage,
  },
];

export function ToolsMedia() {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(
      () => setActive((current) => (current + 1) % TOOL_ROWS.length),
      2200,
    );
    return () => clearTimeout(timer);
  }, [inView, active]);

  return (
    <div ref={rootRef} className="w-full max-w-sm self-center py-10">
      <div
        className={`rounded-2xl border border-[var(--line-soft)] bg-white p-3 ${FRAME_SHADOW}`}
      >
        <div className="flex items-baseline justify-between px-1.5 pb-1 pt-1">
          <p className="m-0 text-[13px] font-medium text-[var(--silver)]">
            What agents can do here
          </p>
          <p className="mono m-0 text-[8px] uppercase tracking-[0.14em] text-zinc-400">
            3 tools
          </p>
        </div>
        <div className="mt-1 space-y-1">
          {TOOL_ROWS.map((tool, index) => (
            <div
              key={tool.name}
              className={`rounded-xl px-2.5 py-2.5 transition-colors duration-300 ${
                index === active ? "bg-[#ecfeff]" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-lg transition-colors duration-300 ${
                    index === active
                      ? "bg-[#06b6d4] text-white"
                      : "border border-zinc-200 text-zinc-400"
                  }`}
                >
                  <EventIcon path={tool.icon} />
                </span>
                <p className="m-0 flex-1 text-[12.5px] font-medium text-[var(--silver)]">
                  {tool.name}
                </p>
              </div>
              {/* The example prompt, typed as if into the chat */}
              <p
                className={`mono m-0 ml-9.5 mt-1.5 inline-flex items-center gap-1.5 rounded-full rounded-tl-sm px-2.5 py-1 text-[9.5px] transition-colors duration-300 ${
                  index === active
                    ? "bg-white text-[#0e7490] shadow-sm"
                    : "bg-zinc-50 text-zinc-500"
                }`}
              >
                <span className={index === active ? "text-[#67e8f9]" : "text-zinc-300"}>❝</span>
                {tool.ask}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- 9. A simple API — the dolly rig ------------------------------- */

function CameraDolly() {
  return (
    <svg width="118" height="76" viewBox="0 0 118 76" aria-hidden="true">
      {/* film reels */}
      <circle cx="48" cy="10" r="8" fill="none" stroke="#10101c" strokeWidth="3" />
      <circle cx="66" cy="10" r="8" fill="none" stroke="#10101c" strokeWidth="3" />
      {/* camera body */}
      <rect x="38" y="16" width="42" height="24" rx="6" fill="#10101c" />
      {/* lens cone */}
      <path d="M80 22 96 15v26l-16-7Z" fill="#10101c" />
      <circle cx="49" cy="28" r="4" fill="#8cfffd" />
      {/* REC light */}
      <circle className="media-rec" cx="72" cy="24" r="2.6" fill="#fd3f25" />
      {/* column */}
      <rect x="55" y="40" width="8" height="12" fill="#3a3a55" />
      {/* platform */}
      <rect x="32" y="52" width="54" height="7" rx="3" fill="#10101c" />
      {/* wheels — spokes make the roll visible */}
      <g className="media-wheel">
        <circle cx="44" cy="66" r="7" fill="#fff" stroke="#10101c" strokeWidth="3.5" />
        <path d="M44 61.5v9M39.5 66h9" stroke="#10101c" strokeWidth="1.6" />
      </g>
      <g className="media-wheel">
        <circle cx="74" cy="66" r="7" fill="#fff" stroke="#10101c" strokeWidth="3.5" />
        <path d="M74 61.5v9M69.5 66h9" stroke="#10101c" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

export function ApiMedia() {
  // Each full pass of the dolly is one take.
  const [take, setTake] = useState(1);

  return (
    <div className="w-full max-w-md self-center overflow-hidden px-6 py-10">
      {/* The action being filmed — leads the camera slightly */}
      <div className="media-slide-lead mx-auto w-max">
        <div className="relative rounded-xl border border-[var(--line-soft)] bg-white px-3.5 py-2.5 shadow-[0_12px_28px_rgba(19,19,40,0.12)]">
          <span className="flex items-center gap-2 text-[11px] font-medium text-[var(--silver)]">
            <span className="rounded-lg bg-[var(--screen-deep)] px-2.5 py-1 text-[10px] text-white">
              Add to cart
            </span>
            Added <span className="text-emerald-500">✓</span>
          </span>
          <div className="absolute -right-7 -bottom-6">
            <Cursor name="Agent" color="#06b6d4" />
          </div>
        </div>
      </div>

      {/* The rig follows */}
      <div
        className="media-slide mx-auto mt-9 w-max"
        onAnimationIteration={() => setTake((current) => current + 1)}
      >
        <div className="relative">
          <span className="mono absolute -left-10 top-1 flex items-center gap-1 text-[8px] font-semibold tracking-[0.14em] text-[#fd3f25]">
            <i className="media-rec size-1.5 rounded-full bg-current not-italic" />
            REC
          </span>
          <div className="media-lean">
            <CameraDolly />
          </div>
        </div>
      </div>

      {/* Rails */}
      <div aria-hidden="true" className="-mt-[9px]">
        <div className="h-[3px] rounded-full bg-[var(--line)]" />
        <div className="mt-1.5 h-[2px] rounded-full bg-[var(--line-soft)]" />
      </div>

      {/* Slate — the take rolls over every pass of the dolly */}
      <div className="mono mt-3.5 flex items-center justify-between text-[8.5px] font-semibold tracking-[0.18em] text-[var(--faint)]">
        <span className="flex items-center gap-1.5">
          {/* Lucide clapperboard */}
          <svg
            viewBox="0 0 24 24"
            width="11"
            height="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
            <path d="m6.2 5.3 3.1 3.9" />
            <path d="m12.4 3.4 3.1 4" />
            <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          </svg>
          SCENE 12 · TAKE {String(take).padStart(2, "0")}
        </span>
        <span>DOLLY CAM · 24 FPS</span>
      </div>
    </div>
  );
}
