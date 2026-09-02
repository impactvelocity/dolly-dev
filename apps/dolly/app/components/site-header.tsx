"use client";

const NAV = [
  { href: "#problem", label: "Multiplayer" },
  { href: "#open-in", label: "How it works" },
  { href: "#screen-tests", label: "Try it" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-6 z-50 px-4">
      <div className="mx-auto flex max-w-5xl items-center gap-6 rounded-2xl border border-sky-400 bg-sky-50 py-3 pl-5 pr-3 shadow-[0_8px_30px_rgba(19,19,40,0.08)] backdrop-blur-md">
        <a
          href="#top"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tightX no-underline"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-[22px] w-[22px]" />
          Dolly
          <span className="-ml-2.5 font-normal opacity-50">.dev</span>
        </a>
        <nav className="ml-auto hidden items-center gap-6 md:flex pr-3">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="font-medium nav-link">
              {item.label}
            </a>
          ))}
        </nav>
        {/*<a
          href="#screen-tests"
          className="ml-auto rounded-xl bg-[var(--screen-deep)] px-4 py-2 text-base font-medium text-[var(--on-dark)] no-underline transition-opacity hover:opacity-85 md:ml-0"
        >
          Try it →
        </a>*/}
      </div>
    </header>
  );
}
