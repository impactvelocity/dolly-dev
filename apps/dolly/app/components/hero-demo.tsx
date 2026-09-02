"use client";

import { useEffect, useState } from "react";

type Mode = "current" | "new" | "onboarding";

/**
 * Scripted demo timeline. Current and New UX play the same script — an agent
 * adds a contact, then opens a deal for them — the only difference is what
 * the CRM surfaces while it happens. The Onboarding tab is a frozen scene:
 * the moment of arrival, held so it can be read.
 */
const STEPS = [
  { id: "idle", ms: 150 }, // connected, nothing running yet
  { id: "typing", ms: 1400 }, // prompt types into the input
  { id: "send", ms: 450 }, // send button spins
  { id: "user", ms: 700 }, // user message lands in the thread
  { id: "think", ms: 800 }, // assistant thinking
  { id: "tool1", ms: 1000 }, // add_contact running
  { id: "contact", ms: 1000 }, // contact row lands
  { id: "tool2", ms: 1000 }, // create_deal running
  { id: "deal", ms: 1000 }, // deal row lands
  { id: "reply", ms: 3000 }, // assistant reply + success toast
  { id: "hold", ms: 3200 }, // hold on the finished state, then loop
] as const;

const USER_PROMPT =
  "Add Maya Chen from Northwind as a contact, then open a $12k deal with her.";

const CONTACTS = [
  { name: "Alex Rivera", company: "Fern Labs", initials: "AR" },
  { name: "Priya Patel", company: "Halcyon", initials: "PP" },
  { name: "Tom Okafor", company: "Brightline", initials: "TO" },
];

const DEALS = [
  { title: "Halcyon expansion", amount: "$28,000", stage: "Proposal", contact: "Priya Patel" },
  { title: "Brightline pilot", amount: "$9,500", stage: "Discovery", contact: "Tom Okafor" },
];

function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-block size-3 shrink-0 animate-spin rounded-full border-2 ${
        dark ? "border-white/30 border-t-white" : "border-zinc-300 border-t-zinc-700"
      }`}
      aria-hidden="true"
    />
  );
}

// Lucide "check", inlined like the other marks in this file.
function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ToolChip({ name, state }: { name: string; state: "running" | "done" }) {
  return (
    <span className="demo-pop mono inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-[10px] text-zinc-600">
      {state === "running" ? <Spinner /> : <span className="text-emerald-600"><CheckIcon size={11} /></span>}
      {name}
    </span>
  );
}

const ALERT_TONES = {
  orange: "bg-orange-50 text-orange-800",
  emerald: "bg-emerald-50 text-emerald-800",
  teal: "bg-teal-50 text-teal-800",
} as const;

function DemoAlert({
  tone,
  className = "",
  children,
}: {
  tone: keyof typeof ALERT_TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`demo-pop self-start rounded-2xl rounded-bl-md px-3.5 py-2 text-[12.5px] font-medium leading-5 tracking-wide ${ALERT_TONES[tone]} ${className}`}>
      {children}
    </div>
  );
}

function ChatMock({ step, mode }: { step: number; mode: Mode }) {
  const onboarding = mode === "onboarding";
  const typing = !onboarding && step === 1;
  const sending = !onboarding && step === 2;
  const showUser = !onboarding && step >= 3;
  const thinking = !onboarding && step === 4;
  const tool1 = !onboarding && step >= 5 ? (step >= 6 ? "done" : "running") : null;
  const tool2 = !onboarding && step >= 7 ? (step >= 8 ? "done" : "running") : null;
  const showReply = !onboarding && step >= 9;

  // Type the prompt into the input character by character.
  const [typedCount, setTypedCount] = useState(0);
  useEffect(() => {
    if (!typing) {
      setTypedCount(0);
      return;
    }
    const perChar = 1250 / USER_PROMPT.length;
    const interval = setInterval(() => {
      setTypedCount((current) => {
        if (current >= USER_PROMPT.length) {
          clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, perChar);
    return () => clearInterval(interval);
  }, [typing]);

  const inputText = typing
    ? USER_PROMPT.slice(0, typedCount)
    : sending
      ? USER_PROMPT
      : "";

  return (
    <div className="flex h-full flex-col bg-white text-left text-zinc-800">
      <div className="flex h-11 items-center justify-between border-b border-zinc-300 px-4">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-700">
          ChatGPT <span className="text-zinc-400">5.5</span>
          {/*<svg className="mt-px" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>*/}
        </span>
        {/*<span className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
          <span className="size-1.5 rounded-full bg-emerald-500" /> Dolly CRM
        </span>*/}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 py-4">
        {onboarding ? (
          <div className="demo-pop mx-auto mt-6 flex flex-col items-center gap-2 text-center">
            <span className="flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-[11px] font-medium text-zinc-600">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Connected to DollyCrm.app
            </span>
            <p className="mono m-0 mt-1 text-[10px] text-zinc-400">
              3 tools discovered
            </p>
            <div className="mt-3">
              <DemoAlert tone="teal">First time here — what do you even ask? Onboarding answers before you have to guess.</DemoAlert>
            </div>
          </div>
        ) : null}

        {showUser ? (
          <div className="demo-pop self-end rounded-2xl rounded-br-md bg-zinc-100 px-3.5 py-2 text-[12.5px] leading-5">
            {USER_PROMPT}
          </div>
        ) : null}

        {!onboarding && step >= 4 ? (
          <div className="demo-pop flex items-start gap-2.5 self-start">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-zinc-900 text-white">
              <svg viewBox="0 0 64 64" width="13" height="13" aria-hidden="true">
                <path
                  d="M59.4 26.2a16 16 0 0 0-1.4-13.1A16.1 16.1 0 0 0 40.7 5.4 16.2 16.2 0 0 0 13.3 11.2a16 16 0 0 0-10.7 7.7 16.1 16.1 0 0 0 2 18.9 15.9 15.9 0 0 0 1.4 13.1 16.1 16.1 0 0 0 17.3 7.7A16 16 0 0 0 35.4 64a16.1 16.1 0 0 0 15.4-11.2 16 16 0 0 0 10.7-7.7 16.1 16.1 0 0 0-2-18.9ZM35.4 59.8a11.9 11.9 0 0 1-7.7-2.8l.4-.2 12.7-7.4a2.1 2.1 0 0 0 1-1.8V29.7l5.4 3.1a.2.2 0 0 1 .1.2v14.9a12 12 0 0 1-12 12ZM9.6 48.8a11.9 11.9 0 0 1-1.4-8l.4.2 12.7 7.4a2.1 2.1 0 0 0 2.1 0l15.6-9v6.2a.2.2 0 0 1-.1.2L26 53.2a12 12 0 0 1-16.4-4.4ZM6.2 21.1a12 12 0 0 1 6.3-5.3v15.2a2 2 0 0 0 1 1.8l15.5 8.9-5.4 3.1a.2.2 0 0 1-.2 0l-12.9-7.4a12 12 0 0 1-4.4-16.4Zm44.3 10.3-15.6-9 5.4-3.1a.2.2 0 0 1 .2 0l12.9 7.4a12 12 0 0 1-1.8 21.6V33.2a2.1 2.1 0 0 0-1.1-1.8Zm5.4-8.1-.4-.2-12.7-7.4a2.1 2.1 0 0 0-2.1 0l-15.6 9v-6.2a.2.2 0 0 1 .1-.2l12.9-7.4a12 12 0 0 1 17.8 12.4ZM22.2 34.3l-5.4-3.1a.2.2 0 0 1-.1-.2V16.2a12 12 0 0 1 19.7-9.2l-.4.2-12.7 7.4a2.1 2.1 0 0 0-1 1.8Zm2.9-6.3 6.9-4 7 4v8l-7 4-7-4Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <div className="flex flex-col items-start gap-2">
              {thinking ? (
                <span className="flex gap-1 py-2" aria-label="Assistant is thinking">
                  <i className="demo-dot" /><i className="demo-dot" /><i className="demo-dot" />
                </span>
              ) : null}
              {tool1 ? <ToolChip name="add_contact" state={tool1} /> : null}
              {tool2 ? <ToolChip name="create_deal" state={tool2} /> : null}
              {showReply ? (
                <p className="demo-pop m-0 text-[12.5px] leading-5">
                  Done — Maya Chen is in your contacts and a $12,000 deal, &ldquo;Northwind renewal,&rdquo; is open and linked to her.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {showReply ? (
          <DemoAlert tone={mode === "current" ? "orange" : "emerald"} className="ml-[34px]">
            {mode === "current"
              ? "Two tools ran and the page showed nothing. Did it even work? 🤔"
              : "Same run — the page followed along, so there's nothing to double-check."}
          </DemoAlert>
        ) : null}
      </div>

      <div className="border-t border-zinc-300 px-4 py-3">
        <div className="flex items-end justify-between gap-2 rounded-2xl border border-zinc-300 px-3.5 py-2 text-[12px]">
          {inputText ? (
            <span className="min-w-0 flex-1 whitespace-pre-wrap break-words leading-4 text-zinc-800">
              {inputText}
              {typing ? (
                <span className="ml-px inline-block h-3 w-[1.5px] animate-pulse bg-zinc-800 align-middle" />
              ) : null}
            </span>
          ) : (
            <span className="flex-1 leading-4 text-zinc-400">Message ChatGPT</span>
          )}
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-zinc-900 text-white">
            {sending ? (
              <span
                className="inline-block size-2.5 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white"
                aria-hidden="true"
              />
            ) : (
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M5 8.5v-7M2 4.5 5 1.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function OnboardingDialog() {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-zinc-900/30 p-4">
      <div className="demo-pop relative w-full max-w-[300px] overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-xl">
        <span className="absolute right-2.5 top-2.5 z-10 grid size-6 place-items-center rounded-full border border-zinc-300 bg-white text-[13px] leading-none text-zinc-400 shadow-sm">×</span>
        {/* Step image */}
        <div className="grid aspect-[2/1] w-full place-items-center border-b border-zinc-200 bg-gradient-to-br from-sky-100 via-sky-50 to-amber-50">
          <div className="flex w-[180px] items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#06b6d4] text-[10px] font-semibold text-white">MC</span>
            <span className="min-w-0">
              <span className="block text-[12px] font-semibold leading-4">Maya Chen</span>
              <span className="block text-[10px] text-zinc-400">Northwind · added by agent</span>
            </span>
          </div>
        </div>
        {/* Step copy */}
        <div className="px-4 pt-3.5">
          <p className="m-0 text-[16px] font-semibold tracking-tight">Add contacts by talking</p>
          <p className="m-0 mt-1 text-[11px] leading-4 text-zinc-500">
            Ask for &ldquo;Maya from Northwind&rdquo; and watch her land in the list.
          </p>
        </div>
        {/* Segmented progress + next */}
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
          <span className="flex w-[90px] gap-1.5">
            <i className="h-1 flex-1 rounded-full bg-[#06b6d4]" />
            <i className="h-1 flex-1 rounded-full bg-zinc-200" />
            <i className="h-1 flex-1 rounded-full bg-zinc-200" />
          </span>
          <span className="rounded-md bg-[#06b6d4] px-3.5 py-1.5 text-[11px] font-semibold text-white">Next</span>
        </div>
      </div>
    </div>
  );
}

function CrmMock({ step, mode }: { step: number; mode: Mode }) {
  const onboarding = mode === "onboarding";
  const isNew = mode === "new" || onboarding;
  const working = !onboarding && step >= 5 && step <= 8;
  const contactAdded = !onboarding && step >= 6;
  const dealAdded = !onboarding && step >= 8;
  const focusContacts = mode === "new" && (step === 5 || step === 6);
  const focusDeals = mode === "new" && (step === 7 || step === 8);
  const showToast = mode === "new" && step === 9;
  const activityCount = (contactAdded ? 1 : 0) + (dealAdded ? 1 : 0);

  const headerLabel = !working
    ? "ChatGPT Connected"
    : step <= 6
      ? "Adding contact Maya Chen…"
      : "Creating deal “Northwind renewal”…";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white text-left text-zinc-800">
      {/* Connected header — only part of the new UX */}
      {isNew ? (
        <div className="relative flex h-9 shrink-0 items-center justify-between bg-gradient-to-l from-[#1f2937] to-[#111827] px-3 text-white">
          {working ? <span className="demo-progress absolute left-0 top-0 h-0.5 rounded-r-full bg-white" /> : null}
          {step === 9 && !onboarding ? <span className="demo-progress-done absolute left-0 top-0 h-0.5 w-full bg-white" /> : null}
          <span className="flex min-w-0 items-center gap-2 text-[11px] font-medium">
            {working ? <Spinner dark /> : <span className="size-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />}
            <span key={headerLabel} className="demo-label truncate">{headerLabel}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3 text-[10px] text-white/70">
            <span className="flex items-center gap-1">
              Activity
              {activityCount > 0 ? (
                <span className="grid min-w-[15px] place-items-center rounded-full bg-white px-1 py-px text-[8px] font-bold text-zinc-900">{activityCount}</span>
              ) : null}
            </span>
            <span className="flex items-center gap-1"><span className="grid size-3.5 place-items-center rounded-full border border-white/60 text-[8px]">i</span> What is this?</span>
          </span>
        </div>
      ) : null}

      {/* App chrome */}
      <div className="flex items-center justify-between border-b border-zinc-300 px-4 py-2.5">
        <span className="flex items-center gap-2 text-[13px] font-semibold">
          <span className="grid size-5 place-items-center rounded bg-indigo-600 text-[9px] font-bold text-white">D</span>
          Dolly CRM
        </span>
        <span className="hidden items-center gap-4 text-[11px] font-medium text-zinc-400 sm:flex">
          <span className="text-zinc-800">Dashboard</span><span>Contacts</span><span>Deals</span>
          <span className="grid size-5 place-items-center rounded-full bg-zinc-200 text-[9px] font-semibold text-zinc-600">DJ</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Contacts", value: contactAdded ? "25" : "24" },
            { label: "Open deals", value: dealAdded ? "8" : "7" },
            { label: "Pipeline", value: dealAdded ? "$98.4k" : "$86.4k" },
          ].map((stat) => (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 px-3 py-2" key={stat.label}>
              <p className="m-0 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">{stat.label}</p>
              <p className="m-0 mt-0.5 text-[15px] font-semibold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          {/* Contacts */}
          <div className={`rounded-lg border p-3 transition-all duration-300 ${focusContacts ? "demo-focus border-[#06b6d4]" : "border-zinc-100"}`}>
            <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Contacts</p>
            <div className="flex flex-col gap-2">
              {CONTACTS.map((c) => (
                <div className="flex items-center gap-2.5" key={c.name}>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-zinc-100 text-[9px] font-semibold text-zinc-500">{c.initials}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium leading-4">{c.name}</span>
                    <span className="block text-[10px] text-zinc-400">{c.company}</span>
                  </span>
                </div>
              ))}
              {contactAdded ? (
                <div className={`demo-row flex items-center gap-2.5 rounded-md px-1 py-0.5 ${focusContacts ? "bg-[#ecfeff]" : ""}`}>
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${isNew ? "bg-[#06b6d4] text-white" : "bg-zinc-100 text-zinc-500"}`}>MC</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium leading-4">Maya Chen</span>
                    <span className="block text-[10px] text-zinc-400">Northwind</span>
                  </span>
                  {isNew ? <span className="ml-auto rounded-full bg-[#06b6d4] px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">New</span> : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* Deals */}
          <div className={`rounded-lg border p-3 transition-all duration-300 ${focusDeals ? "demo-focus border-[#06b6d4]" : "border-zinc-100"}`}>
            <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Deals</p>
            <div className="flex flex-col gap-2">
              {DEALS.map((d) => (
                <div className="rounded-md border border-zinc-100 px-2.5 py-1.5" key={d.title}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-medium">{d.title}</span>
                    <span className="text-[11px] font-semibold tabular-nums">{d.amount}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[9.5px] text-zinc-400">
                    <span className="rounded-full bg-zinc-100 px-1.5 py-px font-medium text-zinc-500">{d.stage}</span>
                    {d.contact}
                  </div>
                </div>
              ))}
              {dealAdded ? (
                <div className={`demo-row rounded-md border px-2.5 py-1.5 ${focusDeals ? "border-[#06b6d4] bg-[#ecfeff]" : "border-zinc-100"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-medium">Northwind renewal</span>
                    <span className="text-[11px] font-semibold tabular-nums">$12,000</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[9.5px] text-zinc-400">
                    <span className={`rounded-full px-1.5 py-px font-medium ${isNew ? "bg-[#ecfeff] text-[#0e7490]" : "bg-zinc-100 text-zinc-500"}`}>Qualified</span>
                    Maya Chen
                    {isNew ? <span className="ml-auto rounded-full bg-[#06b6d4] px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">New</span> : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Glow overlay while the agent works — new UX only */}
      {working && mode === "new" ? (
        <div className="demo-glow" aria-hidden="true"><span className="demo-glow__layer" /></div>
      ) : null}

      {/* Work toast on completion — new UX only */}
      {showToast ? (
        <div className="demo-pop absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-[11px] font-medium shadow-lg">
          <span className="text-emerald-600"><CheckIcon /></span> Deal created and linked to Maya Chen
        </div>
      ) : null}

      {/* Onboarding dialog — held open on the onboarding tab */}
      {onboarding ? <OnboardingDialog /> : null}
    </div>
  );
}

const CALLOUTS: Record<Mode, { accent: string; label: string; body: React.ReactNode }> = {
  current: {
    accent: "border-[var(--red)]",
    label: "Off camera",
    body: <>Two tools just ran — and the page never showed a thing.</>,
  },
  new: {
    accent: "border-[var(--cyan)]",
    label: "In frame",
    body: <>The same run, with every action visible on the page.</>,
  },
  onboarding: {
    accent: "border-[var(--cyan)]",
    label: "The first frame",
    body: <>The site opens with a tour of what you can ask for — no guessing.</>,
  },
};

export function HeroDemo() {
  const [mode, setMode] = useState<Mode>("current");
  const [step, setStep] = useState(0);

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep(0);
  };

  useEffect(() => {
    if (mode === "onboarding") return;
    const timer = setTimeout(
      () => setStep((current) => (current + 1) % STEPS.length),
      STEPS[step]!.ms,
    );
    return () => clearTimeout(timer);
  }, [step, mode]);

  // const callout = CALLOUTS[mode]; // callout copy kept in CALLOUTS above

  return (
    <div className="flex flex-col items-center gap-10 max-w-4xl mx-auto">
      {/* Switcher */}
      <div
        className="monoX rounded-full bg-white/30 inline-flex border border-white/60 shadow-lg shadow-sky-800/10 p-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
        role="tablist"
        aria-label="UX mode"
      >
        {([
          ["current", "Without Dolly"],
          ["new", "With Dolly"],
          ["onboarding", "Onboarding"],
        ] as const).map(([value, label]) => (
          <button
            className={`cursor-pointer text-xs sm:text-sm rounded-full border-0 px-3 py-2 sm:px-5 sm:py-2.5 transition-colors ${
              mode === value
                ? "bg-sky-800/90 text-[var(--cyan)]X text-white"
                : "bg-transparent  hover:opacity-90"
            }`}
            key={value}
            onClick={() => switchMode(value)}
            role="tab"
            aria-selected={mode === value}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* One window: chat on the left, the site in a browser pane on the right */}
    <div className='p-1 bg-black/10 backdrop-blur-lg rounded-[1.2rem] w-full'>
      <div className="panel w-full overflow-hidden bg-white shadow-[0_24px_50px_rgba(19,19,40,0.1)] rounded-2xl">
        {/* Window title bar */}
        {/*<div className="relative flex items-center justify-center border-b border-[var(--line-soft)] bg-zinc-50/80 px-4 py-2.5">
          <span className="absolute left-4 flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="slate-label">ChatGPT — agent mode</span>
        </div>*/}

        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          {/* Chat */}
          <div className="flex min-h-[300px] flex-col border-b border-zinc-300 lg:min-h-[460px] lg:border-b-0 lg:border-r">
            <ChatMock step={step} mode={mode} />
          </div>

          {/* Browser pane */}
          <div className="flex min-h-[420px] flex-col lg:min-h-[460px]">
            <div className="flex h-11 items-center gap-2.5 border-b border-zinc-300 bg-zinc-50 px-3">
              <span className="flex gap-2 text-zinc-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7.5 2.5 4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="flex flex-1 items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-[11px] text-zinc-500">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true"><rect x="2" y="4.5" width="6" height="4" rx="1" stroke="#a1a1aa" strokeWidth="1.2" /><path d="M3.5 4.5V3a1.5 1.5 0 0 1 3 0v1.5" stroke="#a1a1aa" strokeWidth="1.2" /></svg>
                dollycrm.app
              </span>
              {mode !== "current" ? (
                <span className="mono rounded-lg bg-[var(--cyan)] px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[var(--screen-deep)]">Dolly</span>
              ) : null}
            </div>
            <div className="min-h-0 flex-1"><CrmMock step={step} mode={mode} /></div>
          </div>
        </div>
        </div>
    </div>

      {/* Callout hidden — the in-chat alerts do the same job.
      <div key={mode} className="-mt-14X relative z-10 demo-pop mx-auto w-full max-w-3xl text-center">
        <p className="m-0 text-lg leading-relaxed text-[var(--silver)]">{callout.body}</p>
      </div>
      */}
    </div>
  );
}
