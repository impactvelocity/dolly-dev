import type { ReactNode } from "react";
import { OpenInButton } from "@webmcp-sdk/experience";
import { CodeScroll } from "./components/code-scroll";
import { CornerMarks } from "./components/corner-marks";
import { HeroDemo } from "./components/hero-demo";
import { highlight } from "./components/highlight";
import { OnboardingPreview } from "./components/onboarding-preview";
import {
  ApiPreview,
  ConnectedPreview,
  HistoryPreview,
  PermissionPreview,
  ShowWorkPreview,
  ToolsPreview,
} from "./components/primitive-previews";
import { ScreenTests } from "./components/screen-tests";
import { SiteHeader } from "./components/site-header";

const REGISTER_SNIPPET = `// WebMCP: the page itself exposes tools to the browser.
document.modelContext.registerTool({
  name: "add_to_cart",
  description: "Add a product to the active cart",
  inputSchema: { /* JSON Schema */ },
  async execute(input) {
    // Your own application code runs the action.
  },
});`;

const OPEN_IN_SNIPPET = `import { OpenInButton } from "@webmcp-sdk/experience";

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

const ONBOARDING_SNIPPET = `<WebMCPExperienceProvider
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
  AgentStatusBadge,
  AgentStatusHeader,
  detectAgent,
} from "@webmcp-sdk/experience";

// Floating dot — connection state at a glance.
<AgentStatusBadge corner="bottom-left" />

// Full-width bar — status, with room for tools and info.
<AgentStatusHeader />

// The signals underneath
document.modelContext   // the browser speaks WebMCP
detectAgent()           // which agent injected the bridge`;

const WORK_SNIPPET = `const experience = useWebMCPExperience();

async function execute({ nights }) {
  // Full-screen glow while the agent works.
  experience.startWork("Booking the hotel…", undefined, {
    overlay: true,
  });

  // Spotlight the element being changed.
  experience.focus("#itinerary", "Adding two nights…");

  // Updates from inside the tool call.
  experience.progress("Confirming dates…");

  experience.endWork("Hotel added to the itinerary");
  // experience.failWork("The dates were unavailable");
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
experience.logTask(
  "Added %%name%% to the trip",
  { name: "Mom" },
  { icon: "👩" },
);

// "What agents did here"
<AgentHistoryDrawer open={open} onClose={close} />`;

const PERMISSION_SNIPPET = `async function execute({ tripId }) {
  // The tool pauses here until a human decides.
  const ok = await experience.confirm({
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

const STYLING_SNIPPET = `<WebMCPExperienceProvider
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
  useWebMCPExperience,
  useWebMCPTool,
} from "@webmcp-sdk/experience";

const experience = useWebMCPExperience();

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
    experience.startWork("Adding the product…", "#cart", {
      overlay: true,
    });
    await addToCart(productId);
    experience.endWork("Added to the cart");
    return { content: [{ type: "text", text: "Added to cart" }] };
  },
});`;

function CodeBlock({ code }: { code: string }) {
  return (
    <CornerMarks>
      <div className="code-window">
        <CodeScroll>
          <pre>
            <code>{highlight(code)}</code>
          </pre>
        </CodeScroll>
      </div>
    </CornerMarks>
  );
}

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

function Primitive({
  id,
  title,
  code,
  aside,
  children,
}: {
  id: string;
  title: string;
  code: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20"
    >
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div>
          <h2 className="m-0 text-4xl tracking-wide text-pretty">
            {title}
          </h2>
          <div className="mt-5 grid gap-4 text-base leading-relaxed text-[var(--muted)]">
            {children}
          </div>
          {aside ? <div className="mt-7">{aside}</div> : null}
        </div>
        <CodeBlock code={code} />
      </div>
    </section>
  );
}

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
              An agent can operate a WebMCP site without the page showing a
              thing. Dolly is a React SDK that makes the action visible —
              what the agent is doing, what it did, and what it can do.
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
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              className="btn-key"
              href="https://github.com/monetizedesign/webmcp-sdk"
              target="_blank"
              rel="noreferrer"
            >
              GitHub repo
            </a>
            <a className="btn-ghost" href="https://northwind.app" target="_blank" rel="noreferrer">
              Demo CRM app
            </a>
          </div>

          {/* Author */}
          <div className="mt-12 flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dylan.png"
              alt="Dylan Jones"
              className="size-14 rounded-full border border-[var(--line-soft)] object-cover"
            />
            <p className="m-0 text-base font-medium text-[var(--silver)]">Dylan Jones</p>
            <p className="m-0 -mt-2 text-sm text-[var(--muted)]">Creator of Dolly.dev</p>
            <p className="mono m-0 flex items-center gap-4 text-[0.72rem] tracking-[0.06em]">
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
        </section>

        {/* ---- The problem ----------------------------------------- */}
        <section
          id="problem"
          className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20"
        >
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <h2 className="m-0 text-4xl tracking-wide text-pretty">
                Agents operate the site with you
              </h2>
              <div className="mt-5 grid gap-4 text-base leading-relaxed text-[var(--muted)]">
                <p className="m-0">
                  Letting ChatGPT operate a real site is genuinely great. You
                  ask for something in plain language and it happens, while you
                  keep everything an interface is good at: you can still click
                  around, see your data, and stay oriented.
                </p>
                <p className="m-0">
                  UI is not dead, and not everything should become a chatbox.
                  The more interesting shape is multiplayer: a person and an
                  agent working the same interface at the same time.
                </p>
                <p className="m-0">
                  WebMCP handles the wiring. A page registers typed tools on{" "}
                  <code className="mono">document.modelContext</code> and an
                  agent calls them. What it doesn&rsquo;t handle is feedback.
                  Today the agent can call tools and navigate, and the page
                  shows nothing about what is happening, what could happen, or
                  whether an agent is connected at all. For headless automation
                  that&rsquo;s fine. In multiplayer, feedback is most of the
                  experience.
                </p>
                <p className="m-0">
                  Dolly is the rig that follows the action: a set of
                  primitives that show what the agent can do, what it&rsquo;s
                  doing right now, and what it did.
                </p>
              </div>
            </div>
            <div>
              <CodeBlock code={REGISTER_SNIPPET} />
              <p className="m-0 mt-4 text-sm leading-relaxed text-[var(--muted)]">
                There is no standard feedback for what WebMCP is doing, has
                done, or can do — Dolly is an attempt at solving that.
              </p>
            </div>
          </div>
        </section>

        {/* ---- Primitives ------------------------------------------ */}
        <Primitive
          id="open-in"
          title="The Open in ChatGPT button"
          code={OPEN_IN_SNIPPET}
          aside={<OpenInButton agent="openai" className="btn-ghost" />}
        >
          <p className="m-0">
            This component explores what a deep link into agent apps like
            ChatGPT, Claude, and Gemini could look like. One click and the
            site opens inside the agent, ready to be used in natural language.
          </p>
          <p className="m-0">
            I believe buttons like this will be common. They shrink a
            site&rsquo;s learning curve: nobody has to hunt through menus when
            they can open the site in their agent and describe the outcome.
            And the agent brings its own context — say &ldquo;add Mom to the
            trip&rdquo; and it knows who Mom is.
          </p>
          <p className="m-0">
            <code className="mono">OpenInButton</code> owns the deeplink —{" "}
            <code className="mono">
              chatgpt.com/codex/deeplink?url=&lt;your page&gt;
            </code>{" "}
            — and hides itself when the site is already inside an agent.
          </p>
        </Primitive>

        <Primitive
          id="onboarding"
          title="Onboarding, once inside"
          code={ONBOARDING_SNIPPET}
          aside={<OnboardingPreview />}
        >
          <p className="m-0">
            Opening the site inside an agent isn&rsquo;t enough on its own. As
            a user I still have no idea what this site can do. Not just what
            the agent can do — what&rsquo;s even possible. A new kind of
            onboarding is needed.
          </p>
          <p className="m-0">
            Dolly treats arrival as an onboarding moment, the way a mobile app
            treats first launch: show what&rsquo;s possible, plant a few
            ideas, point at a first action. The deeplink carries{" "}
            <code className="mono">?webmcpconnected=true</code>; when the
            provider sees it, it stores the connection, cleans the URL, and
            opens the onboarding dialog.
          </p>
          <p className="m-0">
            The default dialog lists your capabilities. Pass{" "}
            <code className="mono">steps</code> for a full image, title, and
            description walkthrough, or call{" "}
            <code className="mono">experience.openOnboarding()</code> to run
            it any time.
          </p>
        </Primitive>

        <Primitive
          id="connected"
          title="Show the connection"
          code={CONNECTED_SNIPPET}
          aside={<ConnectedPreview />}
        >
          <p className="m-0">
            New technology has to show it&rsquo;s working. ChatGPT defaults to
            driving sites with its own browser tools; WebMCP makes it a
            controlled, better experience — and the page should say so.
            Before anyone types a prompt, it should answer a basic question:
            we are connected and ready to work.
          </p>
          <p className="m-0">
            The header is the full treatment: it shows the connection and has
            room to reveal tools and info. The badge is a floating dot for a
            lighter touch. Both track the live phase, so &ldquo;connected&rdquo;
            becomes &ldquo;working&rdquo; the moment a tool runs.
          </p>
          <p className="m-0">
            Detection is two separate signals.{" "}
            <code className="mono">document.modelContext</code> means the
            browser itself speaks WebMCP.{" "}
            <code className="mono">detectAgent()</code> identifies which agent
            injected the bridge, and the{" "}
            <code className="mono">?webmcpconnected</code> handshake covers
            agents that can&rsquo;t be detected directly.
          </p>
        </Primitive>

        <Primitive
          id="show-work"
          title="Show the work"
          code={WORK_SNIPPET}
          aside={<ShowWorkPreview />}
        >
          <p className="m-0">
            This is the most important part: follow the action. When a WebMCP
            tool is called, the UI needs to show it — today the only feedback
            is the chat&rsquo;s own spinner. On the page, nothing moves.
          </p>
          <p className="m-0">
            Dolly gives the tool&rsquo;s <code className="mono">execute()</code>{" "}
            a visible lifecycle. <code className="mono">startWork</code> with{" "}
            <code className="mono">overlay: true</code> pulses a full-screen
            glow around the viewport edges. <code className="mono">focus()</code>{" "}
            outlines the element being changed and dims the rest of the page
            into a spotlight. <code className="mono">progress()</code> streams
            updates from inside the call, so long tools narrate themselves.{" "}
            <code className="mono">endWork</code> and{" "}
            <code className="mono">failWork</code> settle it with a toast.
          </p>
          <p className="m-0">
            That is the difference between an app that feels alive in
            multiplayer and dumb HTML being invisibly poked and prodded.
          </p>
        </Primitive>

        <Primitive
          id="history"
          title="Show what happened"
          code={HISTORY_SNIPPET}
          aside={<HistoryPreview />}
        >
          <p className="m-0">
            One agent turn can call several tools: add something, search,
            navigate somewhere. For the agent to feel like a partner in the
            work, you need a simple log of what happened — the receipt. What
            exactly did it do?
          </p>
          <p className="m-0">
            Tools declare a <code className="mono">log</code> template and
            Dolly records a readable, timestamped event each time they run.{" "}
            <code className="mono">logTask()</code> records anything else by
            hand. The history drawer shows it all, newest first.
          </p>
          <p className="m-0">
            It has to feel like magic when the agent just does things, and you
            need a way to audit the trick when it goes wrong — like
            discovering it deleted your favourite pasta sauce from the
            shopping cart.
          </p>
          <p className="m-0">
            The log is also the natural home for undo, retries, and error
            recovery. Those controls aren&rsquo;t in the SDK demo, but this is
            the place they&rsquo;d live.
          </p>
        </Primitive>

        <Primitive
          id="permission"
          title="Ask for permission"
          code={PERMISSION_SNIPPET}
          aside={<PermissionPreview />}
        >
          <p className="m-0">
            Anything destructive, or anything that updates something
            important, should keep a human in the loop. A tool pauses
            mid-execute and waits: the agent asks to delete something, the
            page pops an are-you-sure, and the tool resumes or aborts with
            the answer. <code className="mono">confirm()</code> returns a
            promise that only settles when a person decides — the
            agent&rsquo;s tool call simply waits on the other end.
          </p>
          <p className="m-0">
            By default the dialog waits indefinitely: nothing happens until
            Continue or Cancel is clicked. For routine confirmations,{" "}
            <code className="mono">autoContinueMs</code> approves after a
            countdown — ticking down on the button with a progress bar along
            the dialog edge, and pausing while the pointer hovers, so a hand
            reaching for Cancel is never raced by the timer.
          </p>
          <p className="m-0">
            Keep destructive confirmations click-only, and let the countdown
            default through the safe ones.
          </p>
        </Primitive>

        <Primitive
          id="tools"
          title="Show what's possible"
          code={TOOLS_SNIPPET}
          aside={<ToolsPreview />}
        >
          <p className="m-0">
            The tools drawer is the range of what you and the agent can do
            together. Every tool registered with{" "}
            <code className="mono">useWebMCPTool</code> can carry an example
            prompt, and the drawer lists them all. Keyboard shortcuts, but
            for the agent.
          </p>
          <p className="m-0">
            It sets expectations. To a user the agent is a black box, and
            asking for something the site can&rsquo;t do fails quietly and
            reads as broken. Showing the range up front avoids that
            frustration, and the example prompts double as suggestions for
            how to use it.
          </p>
        </Primitive>

        <Primitive
          id="styling"
          title="Branding and styling"
          code={STYLING_SNIPPET}
        >
          <p className="m-0">
            Agent chrome should feel native — part of the site, not bolted
            on. Every surface reads from one theme: a mode, a brand color,
            and a subtle tint. That covers the onboarding dialog, both
            drawers, the status surfaces, and the work toast.
          </p>
          <p className="m-0">
            The glow and the highlight take their own options when you want
            more control, and every component accepts{" "}
            <code className="mono">className</code> overrides.
          </p>
        </Primitive>

        <Primitive
          id="api"
          title="A simple API"
          code={API_SNIPPET}
          aside={<ApiPreview />}
        >
          <p className="m-0">
            Adding all of this is one provider, one hook, and a handful of
            imperative calls. Register a tool, narrate its work, log what
            happened.
          </p>
          <p className="m-0">
            <code className="mono">useWebMCPTool</code> registers against{" "}
            <code className="mono">document.modelContext</code>, unregisters
            on unmount, and does nothing when no bridge exists — the site
            works exactly the same without an agent.
          </p>
        </Primitive>

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
            <h2 className="m-0 text-3xl tracking-tight text-[var(--silver)]">
              Try it on this very page.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
              This site runs the SDK it describes. Every trigger below calls
              the real provider, and the same actions are registered as live
              WebMCP tools an agent can call.
            </p>
          </div>
          <div className="mt-14">
            <ScreenTests />
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
