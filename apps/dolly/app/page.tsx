import { CornerMarks } from "./components/corner-marks";
import { FeatureSection } from "./components/feature-section";
import { HeroDemo } from "./components/hero-demo";
import { OnboardingPreview } from "./components/onboarding-preview";
import {
  ApiPreview,
  HistoryPreview,
  PermissionPreview,
  ShowWorkPreview,
  ToolsPreview,
} from "./components/primitive-previews";
import { ScreenTests } from "./components/screen-tests";
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
} from "./components/section-media";
import { SiteHeader } from "./components/site-header";

const OPEN_IN_SNIPPET = `import { OpenInButton } from "@dolly/rig";

// Deeplinks the current page into ChatGPT. Hides itself
// when the site is already running inside an agent.
<OpenInButton agent="openai" />

// Options
<OpenInButton
  agent="openai"
  url="https://example.com/trip/paris"  // defaults to the current URL
  connectionParam="webmcpconnected"     // handshake param on the link
  hideWhenInsideAgent={false}
>
  Plan this trip in ChatGPT
</OpenInButton>`;

const ONBOARDING_SNIPPET = `<RigProvider
  appName="Trip Planner"
  capabilities={[
    {
      title: "Plan a trip",
      description: "Build an itinerary from a sentence.",
    },
    {
      title: "Invite people",
      description: "Add travellers by name.",
    },
  ]}
  onboarding={{
    // Optional multi-step walkthrough instead of the
    // default capability list.
    steps: [
      {
        image: "/onboarding/plan.png",
        title: "Plan trips by talking",
        description: "Ask for a weekend in Lisbon and watch it fill in.",
      },
      {
        title: "Invite anyone",
        description: '"Add Mom to the trip" just works.',
      },
    ],
    doneLabel: "Try it",
  }}
>`;

const CONNECTED_SNIPPET = `import {
  AgentStatusHeader,
  detectAgent,
} from "@dolly/rig";

// Full-width bar — status, with room for tools,
// history, and live progress while work runs.
<AgentStatusHeader showIndicator showProgress />

// The signals underneath
document.modelContext   // the browser speaks WebMCP
detectAgent()           // which agent injected the bridge`;

const WORK_SNIPPET = `const rig = useRig();

async function execute({ nights }) {
  // Full-screen glow while the agent works.
  rig.startWork("Booking the hotel…", undefined, {
    overlay: true,
  });

  // Spotlight the element being changed.
  rig.focus("#itinerary", "Adding two nights…");

  // Updates from inside the tool call.
  rig.progress("Confirming dates…");

  rig.endWork("Hotel added to the itinerary");
  // rig.failWork("The dates were unavailable");
}`;

const TOOLS_SNIPPET = `useWebMCPTool({
  name: "add_traveller",
  description: "Add a person to the current trip",
  // Shown in the drawer under "Try asking".
  example: "Add Mom to the trip",
  inputSchema: { /* … */ },
  async execute(input) { /* … */ },
});

// "What agents can do here"
<AgentToolsDrawer open={open} onClose={close} />`;

const HISTORY_SNIPPET = `useWebMCPTool({
  name: "remove_item",
  // Auto-logged on success, tokens filled from the input.
  log: "Removed %%name%% from the cart",
  logIcon: "🛒",
  async execute({ name }) { /* … */ },
});

// Or record anything by hand.
rig.logTask(
  "Added %%name%% to the trip",
  { name: "Mom" },
  { icon: <UserIcon /> },
);

// "What agents did here"
<AgentHistoryDrawer open={open} onClose={close} />`;

const PERMISSION_SNIPPET = `async function execute({ tripId }) {
  // The tool pauses here until a human decides.
  const ok = await rig.confirm({
    title: "Delete the Paris trip?",
    description: "The agent wants to delete this trip.",
    tone: "destructive",   // red Continue button
    confirmLabel: "Delete",

    // Optional: approve automatically after a
    // countdown (shown on the button, paused on
    // hover). Omit to wait for a click, forever.
    // autoContinueMs: 5000,
  });

  if (!ok) {
    return {
      content: [{ type: "text", text: "Cancelled by the user" }],
    };
  }
  await deleteTrip(tripId);
}`;

// Branding section hidden for now — snippet kept for when it returns.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STYLING_SNIPPET = `<RigProvider
  appName="Trip Planner"
  capabilities={capabilities}
  // One theme for every surface: dialogs, drawers,
  // badges, toasts, highlights.
  theme={{
    mode: "light",            // "light" | "dark" | "system"
    brandColor: "#fd3f25",
    subtleColor: "#8cfffd",
  }}
  glow={{
    colors: ["#8cfffd", "#fd3f25"],
    ringColor: "#fd3f25",
  }}
  highlight={{
    color: "#fd3f25",
    showOverlay: true,
    overlayOpacity: 0.3,
  }}
>`;

const API_SNIPPET = `import {
  useRig,
  useWebMCPTool,
} from "@dolly/rig";

const rig = useRig();

useWebMCPTool({
  name: "add_to_cart",
  description: "Add a product to the active cart",
  example: "Add the field jacket to my cart",
  log: "Added %%productId%% to the cart",
  inputSchema: {
    type: "object",
    properties: { productId: { type: "string" } },
    required: ["productId"],
  },
  async execute({ productId }) {
    rig.startWork("Adding the product…", "#cart", {
      overlay: true,
    });
    await addToCart(productId);
    rig.endWork("Added to the cart");
    return { content: [{ type: "text", text: "Added to cart" }] };
  },
});`;

// Hidden for now — swap back in under the text when real images are ready.
// function PlaceholderImage() {
//   return (
//     // eslint-disable-next-line @next/next/no-img-element
//     <img
//       src="https://placehold.co/800x500"
//       alt=""
//       className="w-full rounded-xl border border-[var(--line-soft)]"
//     />
//   );
// }

export default function Home() {
  return (
    <div id="top">
      <SiteHeader />

      <main>
        {/* ---- Hero ------------------------------------------------ */}
        <section className="relative -mt-24 overflow-hidden pb-24 pt-48 text-center sm:pt-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            // src="/hero.webp"
            src="/hero1.webp"
            alt=""
            aria-hidden
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_30%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_40%,var(--screen)_92%)]"
          />
          <div className="mx-auto max-w-6xl px-6">
            <a
              href="https://webmcp.devpost.com/"
              target="_blank"
              rel="noreferrer"
              className="reveal inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/10 px-4 py-1.5 text-sm font-medium  tracking-wider text-white no-underline backdrop-blur-sm transition-colors hover:bg-black/15"
            >
              WebMCP Challenge entry ↗
            </a>
            <h1 className="reveal text-pretty reveal-delay-1 m-0 mx-auto mt-8 max-w-3xl text-5xl leading-[1.05] text-white sm:text-7xl text-shadow-md text-shadow-sky-500/50">
              Keep the Agent <br />Action In Frame
              {/*<span className="text-3xl font-normal opacity-50">WebMCP</span>*/}

            </h1>
            <p className="reveal reveal-delay-2 mx-auto mt-7 max-w-2xl text-2xl font-medium leading-relaxedX text-white/90 text-shadow-sm text-shadow-sky-700/20">
              WebMCP puts an agent on your page, working alongside you.
              Dolly follows the action — showing what it&rsquo;s doing,
              what it did, and what it can do.
            </p>

            <div className="reveal reveal-delay-3 mt-16">
              <HeroDemo />
            </div>
          </div>
        </section>

        {/* ---- Demo video + links ---------------------------------- */}
        <section id="video" className="mx-auto max-w-6xl scroll-mt-28 px-6 pb-20 pt-6">
          <CornerMarks className="mx-auto max-w-4xl">
            <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-[var(--screen-deep)]">
              <span className="grid size-16 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M6.5 4.5v11l9-5.5-9-5.5Z" fill="#fff" />
                </svg>
              </span>
              <p className="mono m-0 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--on-dark-muted)]">
                Demo video coming soon
              </p>
            </div>
          </CornerMarks>
          <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            {/* Author */}
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/dylan.png"
                alt="Dylan Jones"
                className="size-14 rounded-full border border-[var(--line-soft)] object-cover"
              />
              <div>
                <p className="m-0 text-base font-medium text-[var(--silver)]">Dylan Jones</p>
                <p className="m-0 text-sm text-[var(--muted)]">Creator of Dolly.dev</p>
                <p className="mono m-0 mt-1.5 flex items-center gap-4 text-[0.72rem] tracking-[0.06em]">
                  {[
                    ["Site", "https://hidylanjones.com"],
                    ["LinkedIn", "https://www.linkedin.com/in/hidylanjones"],
                    ["Twitter", "https://twitter.com/hidylanjones"],
                  ].map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--muted)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--silver)]"
                    >
                      {label}
                    </a>
                  ))}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
            <a
              className="btn-pill btn-pill--teal"
              href="https://github.com/impactvelocity/dolly-dev"
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
              GitHub repo
            </a>
            <a
              className="btn-pill btn-pill--ghost"
              href="https://dollycrm.app/"
              target="_blank"
              rel="noreferrer"
            >
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
                <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
                <rect x="2" y="6" width="14" height="12" rx="2" />
              </svg>
              View demo
            </a>
            </div>
          </div>
        </section>

        {/* ---- The problem ----------------------------------------- */}
        <FeatureSection
          id="problem"
          headline={
            <>
              WebMCP unlocks
              <br />
              multiplayer
            </>
          }
          subheadline={
            <>
              WebMCP gives agents real controls for your site — ask in plain
              language and it happens, while you keep everything an interface
              is good at: click around, see your data, stay oriented
            </>
          }
          showTitle={
            <>
              Not everything
              <br />
              should be a chatbox
            </>
          }
          showDescription={
            <>
              The interesting shape is multiplayer: you and an agent working
              the same interface at the same time.
            </>
          }
          media={<MultiplayerMedia />}
          docs={
            <>
              <p className="m-0">
                WebMCP handles the wiring: a page registers typed tools on{" "}
                <code className="mono">document.modelContext</code> and an
                agent calls them. Every action a menu once hid becomes a
                sentence — the learning curve shrinks to saying what you want.
                What WebMCP doesn&rsquo;t handle is feedback. The agent can
                call tools and navigate while the page shows nothing: not
                what&rsquo;s happening, not what&rsquo;s possible, not even
                that an agent is connected.
              </p>
              <p className="m-0">
                For headless automation, invisible is fine. In multiplayer,
                the action has to be felt. Dolly is the rig that follows it —
                showing what the agent can do, what it&rsquo;s doing, and what
                it did — so the work lands on the page instead of happening
                behind it.
              </p>
            </>
          }
        />

        {/* ---- Primitives ------------------------------------------ */}
        <FeatureSection
          id="open-in"
          headline={
            <>
              The Open in
              <br />
              ChatGPT button
            </>
          }
          subheadline={
            <>
              One click opens the site inside your agent — ChatGPT, Claude,
              or Gemini — and multiplayer starts: chat on one side, the live
              app on the other
            </>
          }
          showTitle={
            <>
              The learning curve,
              <br />
              one sentence long
            </>
          }
          showDescription={
            <>
              I believe buttons like this will be common. Land in an app
              you&rsquo;ve never used, describe the outcome, and start
              working — no tutorial, no hunting through menus. And the agent
              shows up with context of its own: it already knows your
              calendar, your contacts, and what you&rsquo;re trying to get
              done.
            </>
          }
          // Aside button hidden — the media button IS the live deeplink now.
          media={<OpenInMedia />}
          code={OPEN_IN_SNIPPET}
          docs={
            <>
              <p className="m-0">
                <code className="mono">OpenInButton</code> builds the deeplink
                for you —{" "}
                <code className="mono">
                  chatgpt.com/codex/deeplink?url=&lt;your page&gt;
                </code>{" "}
                — and hides itself when the site is already inside an agent.
              </p>
              <p className="m-0">
                By default it links the current URL. Pass{" "}
                <code className="mono">url</code> to deeplink a specific page,{" "}
                <code className="mono">connectionParam</code> to change the
                handshake param, and children to replace the button label.
              </p>
              <p className="m-0 text-[0.78rem] text-[var(--faint)]">
                Note: ChatGPT is the only agent with a deeplink like this —
                I couldn&rsquo;t find a standard way to open a page in Claude
                or Gemini yet.
              </p>
            </>
          }
        />

        <FeatureSection
          id="onboarding"
          headline={<>Onboarding, once inside</>}
          subheadline={
            <>
              The deeplink gets you in the door, but I&rsquo;ve landed in an
              app I&rsquo;ve never seen. What can it do? What do I ask?
              Someone has to say
            </>
          }
          showTitle={<>Treat arrival like a first launch</>}
          showDescription={
            <>
              The way a mobile app greets its first open: show what&rsquo;s
              possible, plant a few ideas, point at a first action.
            </>
          }
          aside={<OnboardingPreview />}
          media={<OnboardingMedia />}
          code={ONBOARDING_SNIPPET}
          docs={
            <>
              <p className="m-0">
                The deeplink carries{" "}
                <code className="mono">?webmcpconnected=true</code>; when the
                provider sees it, it stores the connection, cleans the URL,
                and opens the onboarding dialog.
              </p>
              <p className="m-0">
                The dialog&rsquo;s content comes from the provider. Each{" "}
                <code className="mono">capabilities</code> entry — a title and
                a one-line description — becomes a row in the default dialog,
                so the Trip Planner above greets you with &ldquo;Plan a
                trip&rdquo; and &ldquo;Invite people&rdquo;.
              </p>
              <p className="m-0">
                For a fuller welcome, <code className="mono">steps</code>{" "}
                replaces the list with a paged walkthrough — each step an
                optional image, a title, and a description —
                and <code className="mono">doneLabel</code> names the closing
                button. <code className="mono">rig.openOnboarding()</code>{" "}
                reopens the dialog any time, so a help menu can point back to
                it.
              </p>
            </>
          }
        />

        <FeatureSection
          id="connected"
          headline={<>Show the connection</>}
          subheadline={
            <>
              New technology has to show it&rsquo;s working. Before anyone
              types a prompt, the page should answer the first question: is
              the agent actually connected?
            </>
          }
          showTitle={<>Connected and ready to work</>}
          showDescription={
            <>
              The header shows the connection and has room to reveal tools,
              history, and live progress. It tracks the live phase, so
              &ldquo;connected&rdquo; becomes &ldquo;working&rdquo; the
              moment a tool runs.
            </>
          }
          // Preview button hidden — the animated media tells the story.
          media={<ConnectionMedia />}
          code={CONNECTED_SNIPPET}
          docs={
            <>
              <p className="m-0">
                Detection is two separate signals.{" "}
                <code className="mono">document.modelContext</code> means the
                browser itself speaks WebMCP.{" "}
                <code className="mono">detectAgent()</code> identifies which
                agent injected the bridge, and the{" "}
                <code className="mono">?webmcpconnected</code> handshake
                covers agents that can&rsquo;t be detected directly.
              </p>
              <p className="m-0 text-[0.78rem] text-[var(--faint)]">
                How it knows it&rsquo;s ChatGPT: the bridge leaves
                fingerprints — a{" "}
                <code className="mono">__codexWebMcpModelContext</code> global
                and <code className="mono">codex</code>-prefixed methods on
                the model context. <code className="mono">detectAgent()</code>{" "}
                checks for them; other agents will need their own
                fingerprints as they ship WebMCP support.
              </p>
            </>
          }
        />

        <FeatureSection
          id="show-work"
          headline={<>Show the work</>}
          subheadline={
            <>
              This is the heart of it: follow the action. When a tool runs,
              the page has to show it — today the only feedback is the
              chat&rsquo;s own spinner. On the page, nothing moves
            </>
          }
          showTitle={<>An app that feels alive</>}
          showDescription={
            <>
              That&rsquo;s the difference: a live partner in the work, not
              dumb HTML being invisibly poked and prodded.
            </>
          }
          aside={<ShowWorkPreview />}
          media={<ShowWorkMedia />}
          code={WORK_SNIPPET}
          docs={
            <>
              <p className="m-0">
                Dolly gives the tool&rsquo;s{" "}
                <code className="mono">execute()</code> a visible lifecycle.{" "}
                <code className="mono">startWork</code> with{" "}
                <code className="mono">overlay: true</code> pulses a
                full-screen glow around the viewport edges.{" "}
                <code className="mono">focus()</code> outlines the element
                being changed and dims the rest of the page into a spotlight.{" "}
                <code className="mono">progress()</code> streams updates from
                inside the call, so long tools narrate themselves.{" "}
                <code className="mono">endWork</code> and{" "}
                <code className="mono">failWork</code> settle it with a toast.
              </p>
            </>
          }
        />

        <FeatureSection
          id="history"
          headline={<>Show what happened</>}
          subheadline={
            <>
              One agent turn can call several tools: add something, search,
              navigate somewhere. For the agent to feel like a partner in the
              work, you need a simple log of what happened. What exactly did
              it do?
            </>
          }
          showTitle={<>Magic, with a receipt</>}
          showDescription={
            <>
              It has to feel like magic when the agent just does things, and
              you need a way to audit the trick when it goes wrong — like
              discovering it deleted your favourite pasta sauce from the
              shopping cart.
            </>
          }
          aside={<HistoryPreview />}
          media={<HistoryMedia />}
          code={HISTORY_SNIPPET}
          docs={
            <>
              <p className="m-0">
                Tools declare a <code className="mono">log</code> template and
                Dolly records a readable, timestamped event each time they
                run. <code className="mono">logTask()</code> records anything
                else by hand. The history drawer shows it all, newest first.
              </p>
              <p className="m-0">
                The log is also the natural home for undo, retries, and error
                recovery. Those controls aren&rsquo;t in the SDK demo, but
                this is the place they&rsquo;d live.
              </p>
            </>
          }
        />

        <FeatureSection
          id="permission"
          headline={<>Ask for permission</>}
          subheadline={
            <>
              Some things an agent shouldn&rsquo;t do on its own. For those,
              the tool pauses mid-execute and waits: the page pops an
              are-you-sure, and it resumes or aborts with the answer
            </>
          }
          showTitle={<>A human stays in the loop</>}
          showDescription={
            <>
              Keep destructive confirmations click-only, and let the
              countdown default through the safe ones.
            </>
          }
          aside={<PermissionPreview />}
          media={<PermissionMedia />}
          code={PERMISSION_SNIPPET}
          docs={
            <>
              <p className="m-0">
                <code className="mono">confirm()</code> returns a promise that
                only settles when a person decides — the agent&rsquo;s tool
                call simply waits on the other end.
              </p>
              <p className="m-0">
                By default the dialog waits indefinitely: nothing happens
                until Continue or Cancel is clicked. For routine
                confirmations, <code className="mono">autoContinueMs</code>{" "}
                approves after a countdown — ticking down on the button with a
                progress bar along the dialog edge, and pausing while the
                pointer hovers, so a hand reaching for Cancel is never raced
                by the timer.
              </p>
            </>
          }
        />

        <FeatureSection
          id="tools"
          headline={<>Show what&rsquo;s possible</>}
          subheadline={
            <>
              The tools drawer shows the full range of what you and the agent
              can do together. Keyboard shortcuts, but for the agent
            </>
          }
          showTitle={<>Set expectations up front</>}
          showDescription={
            <>
              To a user the agent is a black box — ask for something the site
              can&rsquo;t do and it fails quietly, reading as broken. Listing
              the tools heads that off, and the example prompts double as
              suggestions for what to try.
            </>
          }
          aside={<ToolsPreview />}
          media={<ToolsMedia />}
          code={TOOLS_SNIPPET}
          docs={
            <>
              <p className="m-0">
                Every tool registered with{" "}
                <code className="mono">useWebMCPTool</code> can carry an{" "}
                <code className="mono">example</code> prompt, and the drawer
                lists them all under &ldquo;Try asking&rdquo;.
              </p>
              <p className="m-0">
                <code className="mono">AgentToolsDrawer</code> renders the
                list — open it from anywhere, or let the status header reveal
                it.
              </p>
            </>
          }
        />

        {/* ---- Branding — hidden for now --------------------------- */}
        {/*
        <FeatureSection
          id="styling"
          headline={<>Branding and styling</>}
          subheadline={
            <>
              Agent chrome should feel native — part of the site, not bolted
              on.
            </>
          }
          showTitle={<>One theme for every surface.</>}
          showDescription={
            <>
              Every surface reads from one theme: a mode, a brand color, and
              a subtle tint. That covers the onboarding dialog, both drawers,
              the status surfaces, and the work toast.
            </>
          }
          code={STYLING_SNIPPET}
          docs={
            <>
              <p className="m-0">
                The glow and the highlight take their own options when you
                want more control, and every component accepts{" "}
                <code className="mono">className</code> overrides.
              </p>
            </>
          }
        />
        */}

        <FeatureSection
          id="api"
          headline={<>A simple API</>}
          subheadline={
            <>
              Adding all of this is one{" "}
              <code className="mono text-[0.85em]">&lt;RigProvider&gt;</code>{" "}
              around the app, one{" "}
              <code className="mono text-[0.85em]">useWebMCPTool</code> per
              tool, and a handful of imperative calls —{" "}
              <code className="mono text-[0.85em]">startWork</code>,{" "}
              <code className="mono text-[0.85em]">confirm</code>,{" "}
              <code className="mono text-[0.85em]">logTask</code> — dropped
              into code you already have
            </>
          }
          hideShowcase
          showTitle={
            <>
              One hook registers,
              <br />
              narrates, and logs
            </>
          }
          showDescription={
            <>
              Register a tool, narrate its work, log what happened —
              that&rsquo;s the whole rig.
            </>
          }
          aside={<ApiPreview />}
          media={<ApiMedia />}
          code={API_SNIPPET}
          docs={
            <>
              <p className="m-0">
                The core is what the agent sees:{" "}
                <code className="mono">name</code> and{" "}
                <code className="mono">description</code> tell it what the
                tool does, <code className="mono">inputSchema</code> types
                the arguments it must send, and{" "}
                <code className="mono">execute()</code> is plain async code —
                call your own functions, return a result.
              </p>
              <p className="m-0">
                The rest wires up the primitives above:{" "}
                <code className="mono">example</code> feeds the tools
                drawer&rsquo;s &ldquo;Try asking&rdquo; list,{" "}
                <code className="mono">log</code> writes the receipt when the
                tool succeeds, and <code className="mono">startWork</code>/
                <code className="mono">endWork</code> inside{" "}
                <code className="mono">execute()</code> narrate the run on
                the page. One registration touches every surface.
              </p>
              <p className="m-0">
                <code className="mono">useWebMCPTool</code> registers against{" "}
                <code className="mono">document.modelContext</code>,
                unregisters on unmount, and does nothing when no bridge
                exists — the site works exactly the same without an agent.
              </p>
            </>
          }
        />

      </main>

      {/* ---- Screen tests + footer share the set backdrop ---------- */}
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/footer.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover object-bottom"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--screen)_0%,rgba(255,255,255,0.88)_40%,rgba(255,255,255,0)_78%)]"
        />
        <section
          className="mx-auto max-w-6xl scroll-mt-28 px-6 py-24"
          id="screen-tests"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="m-0 text-5xl leading-[1.05] tracking-wide text-[var(--silver)] sm:text-6xl">
              This page is rigged
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-pretty text-[var(--muted)]">
              This site runs the SDK it describes. Every button below drives
              the real provider, and the same actions are registered as
              WebMCP tools an agent can call
            </p>
          </div>
          <div className="mt-14">
            <ScreenTests />
          </div>
        </section>

        {/* ---- Other ideas ----------------------------------------- */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <p className="m-0 text-center text-base font-medium text-[var(--silver)]">
            Other ideas for how WebMCP can evolve
          </p>
          <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/40 bg-white/75 p-5 shadow-[0_8px_30px_rgba(19,19,40,0.08)] backdrop-blur-md">
              <span className="grid size-9 place-items-center rounded-full bg-[#8cfffd]/60 text-[var(--screen-deep)]">
                {/* Lucide panel-right */}
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M15 3v18" />
                </svg>
              </span>
              <p className="m-0 mt-3 text-lg font-medium text-[var(--silver)]">
                Agent responsive design
              </p>
              <p className="m-0 mt-1 text-sm leading-relaxed text-pretty text-[var(--muted)]">
                Like mobile design — a CSS media query for when an agent is
                present, so designers can make the site feel native beside a
                chat box
              </p>
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/75 p-5 shadow-[0_8px_30px_rgba(19,19,40,0.08)] backdrop-blur-md">
              <span className="grid size-9 place-items-center rounded-full bg-[#8cfffd]/60 text-[var(--screen-deep)]">
                {/* Lucide message-square-plus */}
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M12 7v6" />
                  <path d="M9 10h6" />
                </svg>
              </span>
              <p className="m-0 mt-3 text-lg font-medium text-[var(--silver)]">
                Suggested prompt triggers
              </p>
              <p className="m-0 mt-1 text-sm leading-relaxed text-pretty text-[var(--muted)]">
                An API to drop a suggested prompt straight into the
                agent&rsquo;s chat box, ready to send
              </p>
            </div>
          </div>
        </section>

        <footer>
          <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
          <div className="inline-flex items-center rounded-2xl border border-white/40 bg-white/75 px-6 py-3.5 shadow-[0_8px_30px_rgba(19,19,40,0.08)] backdrop-blur-md">
            <p className="mono m-0 text-[0.7rem] tracking-[0.18em] text-[var(--muted)]">
              Dolly.dev · Created by{" "}
              <a
                href="https://hidylanjones.com"
                target="_blank"
                rel="noreferrer"
                className="text-inherit underline decoration-[var(--line)] underline-offset-2 transition-colors hover:text-[var(--silver)]"
              >
                Dylan Jones
              </a>{" "}
              ·{" "}
              <a
                href="https://cal.com/font"
                target="_blank"
                rel="noreferrer"
                className="text-inherit underline decoration-[var(--line)] underline-offset-2 transition-colors hover:text-[var(--silver)]"
              >
                Cal Sans
              </a>{" "}
              (font)
            </p>
          </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
