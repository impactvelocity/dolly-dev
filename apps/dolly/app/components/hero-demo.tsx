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
  { id: "idle", ms: 1200 }, // connected, nothing running yet
  { id: "typing", ms: 2600 }, // prompt types into the input
  { id: "send", ms: 700 }, // send button spins
  { id: "user", ms: 1200 }, // user message lands in the thread
  { id: "think", ms: 1300 }, // assistant thinking
  { id: "tool1", ms: 1800 }, // add_contact running
  { id: "contact", ms: 1700 }, // contact row lands
  { id: "tool2", ms: 1800 }, // create_deal running
  { id: "deal", ms: 1700 }, // deal row lands
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

function ToolChip({ name, state }: { name: string; state: "running" | "done" }) {
  return (
    <span className="demo-pop mono inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-[10px] text-zinc-600">
      {state === "running" ? <Spinner /> : <span className="text-emerald-600">✓</span>}
      {name}
    </span>
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
    const perChar = 2300 / USER_PROMPT.length;
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
          <span className="size-1.5 rounded-full bg-emerald-500" /> Northwind CRM
        </span>*/}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 py-4">
        {onboarding ? (
          <div className="demo-pop mx-auto mt-6 flex flex-col items-center gap-2 text-center">
            <span className="flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-[11px] font-medium text-zinc-600">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Connected to northwind.app
            </span>
            <p className="mono m-0 mt-1 text-[10px] text-zinc-400">
              3 tools discovered · add_contact · create_deal · log_activity
            </p>
          </div>
        ) : null}

        {showUser ? (
          <div className="demo-pop self-end rounded-2xl rounded-br-md bg-zinc-100 px-3.5 py-2 text-[12.5px] leading-5">
            {USER_PROMPT}
          </div>
        ) : null}

        {!onboarding && step >= 4 ? (
          <div className="demo-pop flex items-start gap-2.5 self-start">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-zinc-900 text-[9px] font-bold text-white">AI</span>
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
      </div>

      <div className="border-t border-zinc-300 px-4 py-3">
        {onboarding ? (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {["Add a contact", "Open a $12k deal", "Log a call"].map((s) => (
              <span className="rounded-full border border-zinc-300 px-2.5 py-1 text-[10px] text-zinc-500" key={s}>{s}</span>
            ))}
          </div>
        ) : null}
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
      <div className="demo-pop relative w-full max-w-[300px] rounded-xl border border-zinc-300 bg-white shadow-xl">
        <span className="absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full border border-zinc-300 text-[11px] text-zinc-400">×</span>
        <div className="px-4 pb-3 pt-4">
          <p className="m-0 text-[13px] font-semibold">Northwind CRM works with agents</p>
          <p className="m-0 mt-1 text-[11px] leading-4 text-zinc-500">
            You arrived through ChatGPT. Here&rsquo;s what you can ask for on this site.
          </p>
        </div>
        <div className="border-y border-zinc-300 px-4 py-1">
          {[
            { title: "Add contacts", example: "“Add Maya from Northwind”" },
            { title: "Open deals", example: "“Start a $12k deal with Maya”" },
            { title: "Log activity", example: "“Log my call with Priya”" },
          ].map((cap) => (
            <div className="flex items-start gap-2.5 border-b border-zinc-300 py-2.5 last:border-b-0" key={cap.title}>
              <span className="mt-px text-[10px] text-[#fd3f25]">✦</span>
              <span>
                <span className="block text-[11.5px] font-semibold leading-4">{cap.title}</span>
                <span className="block text-[10.5px] leading-4 text-zinc-500">{cap.example}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[9px] text-zinc-400">Powered by WebMCP</span>
          <span className="rounded-md bg-[#fd3f25] px-2.5 py-1 text-[10px] font-semibold text-white">Got it</span>
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
          <span className="grid size-5 place-items-center rounded bg-indigo-600 text-[9px] font-bold text-white">N</span>
          Northwind CRM
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
          <span className="text-emerald-600">✓</span> Deal created and linked to Maya Chen
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
    body: (
      <>
        Two tools ran against your product — <code className="mono text-[var(--silver)]">add_contact</code>,{" "}
        <code className="mono text-[var(--silver)]">create_deal</code> — and the page never said a word. Rows
        just appeared. The only trace lives in someone else&rsquo;s chat thread.
      </>
    ),
  },
  new: {
    accent: "border-[var(--cyan)]",
    label: "In frame",
    body: (
      <>
        The connected header tracks every call, the glow and spotlight follow the work, new records get
        flagged, and a toast confirms the landing. The person watching always knows who did what.
      </>
    ),
  },
  onboarding: {
    accent: "border-[var(--cyan)]",
    label: "The first frame",
    body: (
      <>
        Arrival is an onboarding moment. The deeplink carries{" "}
        <code className="mono text-[var(--silver)]">?webmcpconnected=true</code>; the provider sees it and opens
        a dialog that shows what&rsquo;s possible and plants a first ask — held open here so you can read it.
      </>
    ),
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

  const callout = CALLOUTS[mode];

  return (
    <div className="flex flex-col items-center gap-10 max-w-4xl mx-auto">
      {/* Switcher */}
      <div
        className="monoX rounded-full bg-white/30 inline-flex border border-white/60 shadow-lg shadow-sky-800/10 p-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
        role="tablist"
        aria-label="UX mode"
      >
        {([
          ["current", "Current UX"],
          ["new", "New UX"],
          ["onboarding", "Onboarding"],
        ] as const).map(([value, label]) => (
          <button
            className={`cursor-pointer text-sm rounded-full border-0 px-4 py-2.5 transition-colors sm:px-5 ${
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
                northwind.app
              </span>
              {mode !== "current" ? (
                <span className="mono bg-[var(--cyan)] px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[var(--screen-deep)]">+ Dolly</span>
              ) : null}
            </div>
            <div className="min-h-0 flex-1"><CrmMock step={step} mode={mode} /></div>
          </div>
        </div>
        </div>
    </div>

      {/* Callout: what the user could actually see */}
      <div key={mode} className="-mt-14X relative z-10 demo-pop mx-auto w-full max-w-3xl text-center">
        <p className="m-0 inline-flex items-center rounded-full bg-teal-100 font-medium px-3.5 py-1 text-sm tracking-[0.06em]">
          {callout.label}
        </p>
        <p className="m-0 mt-3 text-lg leading-relaxed text-[var(--silver)]">{callout.body}</p>
      </div>
    </div>
  );
}
