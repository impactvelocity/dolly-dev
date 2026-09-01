"use client";

import { useEffect, useRef, useState } from "react";

import { useOptionalWebMCPExperience } from "./experience-provider";
import type { TaskLogEntry } from "./types";

export interface AgentHistoryDrawerProps {
  open: boolean;
  onClose(): void;
  /** Heading of the drawer. Defaults to "What agents did here". */
  title?: string;
  /** Intro paragraph under the title. */
  description?: string;
  /**
   * Entries to list, newest first. Defaults to the history recorded via
   * logTask inside the provider.
   */
  entries?: TaskLogEntry[];
  /** Which side the drawer slides in from. Defaults to "right". */
  side?: "left" | "right";
  /** Message shown when there is no history yet. */
  emptyMessage?: string;
  /**
   * Show a "Clear" affordance that empties the provider history. Only
   * rendered when the entries come from the provider. Defaults to true.
   */
  showClear?: boolean;
  /** Label for the clear affordance. Defaults to "Clear". */
  clearLabel?: string;
  /** Extra classes for the drawer panel. */
  className?: string;
  /** Extra classes for the backdrop overlay. */
  overlayClassName?: string;
}

function relativeTime(timestamp: number, now: number): string {
  const seconds = Math.round((now - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

const DEFAULT_DESCRIPTION =
  "Actions an AI agent has taken on this page on your behalf.";

/**
 * A full-height, margin-inset side drawer listing what the agent has done
 * on the page — every entry recorded through logTask, newest first.
 */
export function AgentHistoryDrawer({
  open,
  onClose,
  title,
  description = DEFAULT_DESCRIPTION,
  entries,
  side = "right",
  emptyMessage = "Nothing yet — actions will appear here as an agent works.",
  showClear = true,
  clearLabel = "Clear",
  className,
  overlayClassName,
}: AgentHistoryDrawerProps) {
  const experience = useOptionalWebMCPExperience();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    // Keep the relative timestamps fresh while the drawer stays open.
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(tick);
    };
  }, [open, onClose]);

  if (!open) return null;

  const usingProviderHistory = entries === undefined;
  const resolvedEntries = entries ?? experience?.history ?? [];
  const agentLabel = experience?.snapshot.agentLabel;
  const resolvedTitle = title ?? `What ${agentLabel ?? "agents"} did here`;
  const canClear =
    showClear && usingProviderHistory && experience !== null && resolvedEntries.length > 0;

  const backdropClasses = ["webmcp-exp-drawer-backdrop", overlayClassName]
    .filter(Boolean)
    .join(" ");
  const drawerClasses = [
    "webmcp-exp-drawer",
    `webmcp-exp-drawer--${side}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={backdropClasses} role="presentation" onMouseDown={onClose}>
      <aside
        className={drawerClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="webmcp-exp-history-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="webmcp-exp-drawer__header">
          <h2 id="webmcp-exp-history-title">{resolvedTitle}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close history"
          >
            ×
          </button>
        </div>
        <p className="webmcp-exp-drawer__description">{description}</p>
        <div className="webmcp-exp-drawer__list">
          {resolvedEntries.length === 0 ? (
            <p className="webmcp-exp-drawer__empty">{emptyMessage}</p>
          ) : (
            resolvedEntries.map((entry) => (
              <article
                className={`webmcp-exp-drawer__entry${entry.status === "error" ? " webmcp-exp-drawer__entry--error" : ""}`}
                key={entry.id}
              >
                <span className="webmcp-exp-drawer__entry-icon" aria-hidden="true">
                  {entry.icon ?? (entry.status === "error" ? "!" : "✓")}
                </span>
                <p>
                  {entry.message}
                  {entry.status === "error" ? <em> — failed</em> : null}
                </p>
                <time dateTime={new Date(entry.timestamp).toISOString()}>
                  {relativeTime(entry.timestamp, now)}
                </time>
              </article>
            ))
          )}
        </div>
        {canClear ? (
          <div className="webmcp-exp-drawer__footer">
            <button type="button" onClick={() => experience.clearHistory()}>
              {clearLabel}
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
