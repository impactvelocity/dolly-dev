"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { CodeScroll } from "./code-scroll";
import { CornerMarks } from "./corner-marks";
import { highlight } from "./highlight";

/* Shared in-view reveal settings — animate once, just before fully on-screen. */
const VIEWPORT = { once: true, margin: "-80px" } as const;

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.6, delay, ease: [0.22, 0.8, 0.2, 1] as const },
});

/*
 * Layout draft — Flighty-inspired section.
 *
 * 1. Large headline + subheadline for the main idea.
 * 2. Showcase card: title + description beside an image, to "show" the thing.
 * 3. Two columns underneath: documentation on the left, code on the right.
 */
export function FeatureSection({
  id,
  headline,
  subheadline,
  showTitle,
  showDescription,
  media,
  aside,
  docs,
  code,
  hideShowcase = false,
}: {
  id: string;
  headline: ReactNode;
  subheadline: ReactNode;
  showTitle: ReactNode;
  showDescription: ReactNode;
  media?: ReactNode;
  aside?: ReactNode;
  docs?: ReactNode;
  /** Omit to leave out the code example column. */
  code?: string;
  /** Skip the showcase card — headline straight into docs/code. */
  hideShowcase?: boolean;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-28 px-6 py-24">
      {/* ---- 1. Headline + subheadline ---- */}
      <motion.div className="max-w-3xl" {...rise()}>
        <h2 className="m-0 text-5xl leading-[1.05] tracking-wide text-pretty sm:text-6xl">
          {headline}
        </h2>
        <p className="m-0 mt-6 max-w-2xl text-xl leading-relaxed text-[var(--muted)]">
          {subheadline}
        </p>
      </motion.div>

      {/* ---- 2. Showcase card ---- */}
      {hideShowcase ? null : (
      <motion.div
        className="mt-14 overflow-hidden rounded-3xl bg-[rgba(19,19,40,0.045)]"
        {...rise(0.08)}
      >
        <div className="grid items-center gap-10 lg:grid-cols-[5fr_7fr]">
          <div className="min-w-0 px-8 pb-8 pt-10 sm:px-12 sm:pt-14 lg:pb-14">
            <h3 className="m-0 text-3xl leading-tight tracking-wide text-pretty text-[var(--silver)] sm:text-4xl">
              {showTitle}
            </h3>
            <p className="m-0 mt-6 text-base leading-relaxed text-[var(--muted)]">
              {showDescription}
            </p>
            {aside ? <div className="mt-8">{aside}</div> : null}
          </div>
          <div className="flex min-w-0 items-center justify-center px-8">
            {media ? (
              /* The media itself gets a springier pop, a beat after the card. */
              <motion.div
                className="flex w-full justify-center"
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={VIEWPORT}
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 19,
                  delay: 0.18,
                }}
              >
                {media}
              </motion.div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="https://placehold.co/800x520"
                alt=""
                className="w-full max-w-xl rounded-t-xl border border-b-0 border-[var(--line-soft)]"
              />
            )}
          </div>
        </div>
      </motion.div>
      )}

      {/* ---- 3. Documentation + code — equal-height columns ---- */}
      {docs || code ? (
        <motion.div
          className="mt-8 grid items-stretch gap-10 lg:grid-cols-2"
          {...rise(0.05)}
        >
          {docs ? (
            <div
              className={`rounded-3xl bg-[rgba(19,19,40,0.045)] px-8 py-10 sm:px-12 sm:py-12${
                code ? "" : " lg:col-span-2"
              }`}
            >
              <div className="grid gap-4 text-base leading-relaxed text-[var(--muted)]">
                {docs}
              </div>
            </div>
          ) : null}
          {code ? (
            <CornerMarks className="corner-marks-soft h-full">
              <div className="code-window h-full">
                <CodeScroll>
                  <pre>
                    <code>{highlight(code)}</code>
                  </pre>
                </CodeScroll>
              </div>
            </CornerMarks>
          ) : null}
        </motion.div>
      ) : null}
    </section>
  );
}
