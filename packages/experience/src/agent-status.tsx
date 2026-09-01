"use client";

import { useEffect, useRef, useState } from "react";

import { AgentHistoryDrawer, type AgentHistoryDrawerProps } from "./agent-history-drawer";
import { useWebMCPExperience } from "./experience-provider";
import { OpenAILogo } from "./openai-logo";
import type { ExperienceSnapshot } from "./types";

export type AgentStatusCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/**
 * Which connections the status surfaces respond to:
 * - "chatgpt" — the ChatGPT browser, identified by its injected globals.
 * - "webmcp" — any other WebMCP bridge that can't be identified.
 */
export type AgentStatusShow = "webmcp" | "chatgpt";

const DEFAULT_SHOW: AgentStatusShow[] = ["webmcp", "chatgpt"];

interface AgentStatusCommonProps {
  /**
   * Which connection kinds this surface shows. Pass ["chatgpt"] to only
   * light up for ChatGPT and ignore unidentified WebMCP bridges (they are
   * then treated as not connected). Defaults to ["webmcp", "chatgpt"].
   */
  show?: AgentStatusShow[];
  /**
   * Reflect live tool activity (working / success / error messages) instead of
   * the static connection label while a tool runs. Defaults to true.
   */
  showActivity?: boolean;
  /**
   * Render nothing when no agent bridge is present. Defaults to true so
   * regular visitors never see agent chrome.
   */
  hideWhenUnavailable?: boolean;
  className?: string;
  /**
   * Extra classes applied only while an agent bridge is present — e.g. a
   * Tailwind gradient like "bg-gradient-to-l from-gray-800 to-gray-900
   * text-white" to make the connected state stand out.
   */
  connectedClassName?: string;
  /**
   * Override the connected label ("ChatGPT Connected" / "Agent Connected").
   * On the badge this is the tooltip and accessible label.
   */
  connectedLabel?: string;
}

export interface AgentStatusHeaderProps extends AgentStatusCommonProps {
  /** Label for the info affordance on the right. Defaults to "What is this?". */
  infoLabel?: string;
  /** Hide the info affordance entirely. */
  showInfo?: boolean;
  /**
   * Called when the info affordance is clicked. Defaults to opening the
   * onboarding dialog — override to open your own surface, e.g. an
   * AgentToolsDrawer.
   */
  onInfoClick?: () => void;
  /**
   * Show a thin loading bar along the top edge of the header while work
   * runs: it trickles toward ~90%, then completes to 100% and fades out
   * when the work settles. Defaults to false.
   */
  showProgress?: boolean;
  /** Color of the progress bar. Defaults to the header's text color. */
  progressColor?: string;
  /**
   * Show a green pulsing indicator dot next to the label when the branded
   * logo replaces the default status dot. It only renders alongside the
   * logo — the unbranded states already use a dot. Defaults to false.
   */
  showIndicator?: boolean;
  /**
   * Show a history affordance next to the info affordance that opens a
   * side drawer listing what the agent has done on this page — every
   * entry recorded via logTask (or a tool's `log` template), with a count
   * of entries so far. Defaults to false.
   */
  showHistory?: boolean;
  /** Label for the history affordance. Defaults to "Activity". */
  historyLabel?: string;
  /**
   * Called when the history affordance is clicked. Defaults to opening
   * the built-in history drawer — override to open your own surface.
   */
  onHistoryClick?: () => void;
  /** Props forwarded to the built-in history drawer. */
  historyDrawer?: Omit<AgentHistoryDrawerProps, "open" | "onClose">;
}

export interface AgentStatusBadgeProps extends AgentStatusCommonProps {
  /** Which viewport corner the badge floats in. Defaults to "bottom-right". */
  corner?: AgentStatusCorner;
}

type StatusTone = "live" | "muted" | "working" | "success" | "error";

interface StatusView {
  tone: StatusTone;
  label: string;
}

function deriveStatus(
  snapshot: ExperienceSnapshot,
  showActivity: boolean,
  matched: AgentStatusShow | null,
  connectedLabel?: string,
): StatusView {
  // Only the working phase overrides the connection label — completion is
  // announced by the work toast, so on settle these surfaces slide straight
  // back to the connected state. Work shows even without a matched
  // connection so the states can be driven manually (e.g. a dev page).
  if (showActivity && snapshot.phase === "working") {
    return { tone: "working", label: snapshot.message ?? "An agent is working…" };
  }

  if (matched === "chatgpt" && snapshot.agentLabel) {
    return { tone: "live", label: connectedLabel ?? `${snapshot.agentLabel} Connected` };
  }
  if (matched === "webmcp") {
    return { tone: "live", label: connectedLabel ?? "Agent Connected" };
  }
  return MUTED_VIEW;
}

const MUTED_VIEW: StatusView = { tone: "muted", label: "No agent connected" };

function matchedConnection(
  snapshot: ExperienceSnapshot,
  show: AgentStatusShow[],
): AgentStatusShow | null {
  const kind: AgentStatusShow | null =
    snapshot.agent === "chatgpt" ? "chatgpt" : snapshot.modelContextAvailable ? "webmcp" : null;
  return kind !== null && show.includes(kind) ? kind : null;
}

function StatusIcon({
  tone,
  branded,
  variant,
}: {
  tone: StatusTone;
  branded: boolean;
  variant: "header" | "badge";
}) {
  // The header swaps to a spinner while working; the badge keeps the brand
  // logo and signals activity by pulsing it instead.
  const showLogo = branded && (variant === "badge" || tone !== "working");
  if (showLogo) {
    return <OpenAILogo className="webmcp-exp-status__logo" />;
  }
  return (
    <span className="webmcp-exp-status__dot" aria-hidden="true">
      {tone === "working" ? <i /> : null}
    </span>
  );
}

/**
 * nprogress-style loading bar for the header: jumps in when work starts,
 * trickles toward ~90%, then completes to 100% and fades out on settle.
 */
function HeaderProgressBar({
  active,
  color,
}: {
  active: boolean;
  color?: string | undefined;
}) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  visibleRef.current = visible;

  useEffect(() => {
    if (active) {
      setVisible(true);
      setProgress(12);
      const trickle = setInterval(() => {
        setProgress((current) => Math.min(90, current + (90 - current) * 0.08));
      }, 350);
      return () => clearInterval(trickle);
    }

    if (!visibleRef.current) return;
    setProgress(100);
    const hide = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 800);
    return () => clearTimeout(hide);
  }, [active]);

  if (!visible) return null;

  return (
    <span
      className={`webmcp-exp-status__progress${active ? "" : " webmcp-exp-status__progress--done"}`}
      style={{ width: `${progress}%`, ...(color ? { backgroundColor: color } : {}) }}
      aria-hidden="true"
    />
  );
}

/**
 * Crossfades label changes with a vertical slide: the old text slides up
 * and out while the new text slides up into place.
 */
function AnimatedLabel({ text }: { text: string }) {
  const [current, setCurrent] = useState(text);
  const [previous, setPrevious] = useState<string | null>(null);

  if (text !== current) {
    setPrevious(current);
    setCurrent(text);
  }

  useEffect(() => {
    if (previous === null) return;
    const timer = setTimeout(() => setPrevious(null), 350);
    return () => clearTimeout(timer);
  }, [previous, current]);

  return (
    <span className="webmcp-exp-status__labelwrap">
      {previous !== null ? (
        <span className="webmcp-exp-status__label webmcp-exp-status__label--out" aria-hidden="true">
          {previous}
        </span>
      ) : null}
      <span
        key={current}
        className={`webmcp-exp-status__label${previous !== null ? " webmcp-exp-status__label--in" : ""}`}
      >
        {current}
      </span>
    </span>
  );
}

/**
 * A full-width, 40px-tall status bar meant to sit at the top of the page.
 * Connection state on the left, an info affordance on the right that opens
 * the capability onboarding dialog.
 */
export function AgentStatusHeader({
  show = DEFAULT_SHOW,
  showActivity = true,
  hideWhenUnavailable = true,
  showInfo = true,
  showIndicator = false,
  infoLabel = "What is this?",
  onInfoClick,
  showHistory = false,
  historyLabel = "Activity",
  onHistoryClick,
  historyDrawer,
  showProgress = false,
  progressColor,
  className,
  connectedClassName,
  connectedLabel,
}: AgentStatusHeaderProps) {
  const { snapshot, openOnboarding, history } = useWebMCPExperience();
  const [historyOpen, setHistoryOpen] = useState(false);

  const matched = matchedConnection(snapshot, show);

  // Rendered as a sibling of the header, never inside it: the sticky header
  // creates its own stacking context, which would trap the drawer's overlay
  // beneath the fixed badge and toast.
  const drawer = showHistory ? (
    <AgentHistoryDrawer
      open={historyOpen}
      onClose={() => setHistoryOpen(false)}
      {...historyDrawer}
    />
  ) : null;

  // Hidden without a matching connection — except while work is running,
  // so manually driven states (e.g. a dev page) still surface. The drawer
  // stays mounted through the null branch so an open history survives the
  // header hiding mid-work.
  if (hideWhenUnavailable && matched === null && snapshot.phase === "idle") {
    return drawer;
  }

  const branded = matched === "chatgpt";
  const view = deriveStatus(snapshot, showActivity, matched, connectedLabel);
  const classes = [
    "webmcp-exp-status",
    "webmcp-exp-status--header",
    `webmcp-exp-status--${view.tone}`,
    branded ? "webmcp-exp-status--branded" : null,
    matched !== null ? "webmcp-exp-status--connected" : null,
    className,
    matched !== null ? connectedClassName : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
    <div className={classes}>
      {showProgress ? (
        <HeaderProgressBar active={view.tone === "working"} color={progressColor} />
      ) : null}
      <span className="webmcp-exp-status__side" role="status" aria-live="polite">
        <StatusIcon tone={view.tone} branded={branded} variant="header" />
        <AnimatedLabel text={view.label} />
        {showIndicator && branded && view.tone !== "working" ? (
          <span className="webmcp-exp-status__indicator" aria-hidden="true" />
        ) : null}
      </span>
      <span className="webmcp-exp-status__actions">
        {showHistory ? (
          <button
            type="button"
            className="webmcp-exp-status__info"
            onClick={onHistoryClick ?? (() => setHistoryOpen(true))}
          >
            <HistoryIcon />
            {historyLabel}
            {history.length > 0 ? (
              <span className="webmcp-exp-status__count">{history.length}</span>
            ) : null}
          </button>
        ) : null}
        {showInfo ? (
          <button type="button" className="webmcp-exp-status__info" onClick={onInfoClick ?? openOnboarding}>
            <span className="webmcp-exp-status__info-icon" aria-hidden="true">i</span>
            {infoLabel}
          </button>
        ) : null}
      </span>
    </div>
    {drawer}
    </>
  );
}

function HistoryIcon() {
  return (
    <svg
      className="webmcp-exp-status__history-icon"
      viewBox="0 0 14 14"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.6" />
      <path d="M7 4.2V7l1.9 1.4" />
    </svg>
  );
}

/**
 * A minimal, icon-only badge fixed to a viewport corner. Clicking it opens
 * the capability onboarding dialog; the status text lives in the tooltip
 * and accessible label.
 */
export function AgentStatusBadge({
  show = DEFAULT_SHOW,
  corner = "bottom-right",
  showActivity = true,
  hideWhenUnavailable = true,
  className,
  connectedClassName,
  connectedLabel,
}: AgentStatusBadgeProps) {
  const { snapshot, openOnboarding } = useWebMCPExperience();

  const matched = matchedConnection(snapshot, show);
  // Hidden without a matching connection — except while work is running,
  // so manually driven states (e.g. a dev page) still surface.
  if (hideWhenUnavailable && matched === null && snapshot.phase === "idle") return null;

  const branded = matched === "chatgpt";
  const view = deriveStatus(snapshot, showActivity, matched, connectedLabel);
  const classes = [
    "webmcp-exp-status",
    "webmcp-exp-status--badge",
    `webmcp-exp-status--corner-${corner}`,
    `webmcp-exp-status--${view.tone}`,
    branded ? "webmcp-exp-status--branded" : null,
    className,
    matched !== null ? connectedClassName : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={openOnboarding}
      title={view.label}
      aria-label={view.label}
    >
      <StatusIcon tone={view.tone} branded={branded} variant="badge" />
      {view.tone === "working" ? <AnimatedLabel text={view.label} /> : null}
    </button>
  );
}
