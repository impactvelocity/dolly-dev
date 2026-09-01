"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { ConfirmOptions } from "./types";

export interface PendingConfirm {
  id: number;
  options: ConfirmOptions;
  resolve(approved: boolean): void;
}

/**
 * Human-in-the-loop confirmation modal. Rendered by the provider for the
 * head of the confirm queue; keyed by request id so countdown state resets
 * per request. With `autoContinueMs` set, the dialog approves itself when
 * the countdown elapses — paused while the pointer hovers the dialog, so a
 * person reaching for Cancel is never raced by the timer.
 */
export function ConfirmDialog({
  request,
  onResolve,
}: {
  request: PendingConfirm;
  onResolve(request: PendingConfirm, approved: boolean): void;
}) {
  const { options } = request;
  const tone = options.tone ?? "positive";
  const autoContinueMs =
    options.autoContinueMs !== undefined && options.autoContinueMs > 0
      ? options.autoContinueMs
      : null;

  const [paused, setPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    autoContinueMs === null ? null : Math.ceil(autoContinueMs / 1000),
  );
  const remainingMsRef = useRef(autoContinueMs ?? 0);
  const focusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onResolve(request, false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onResolve, request]);

  useEffect(() => {
    if (autoContinueMs === null || paused) return;
    const startedAt = Date.now();
    const baseRemaining = remainingMsRef.current;
    const timer = setInterval(() => {
      const remaining = baseRemaining - (Date.now() - startedAt);
      remainingMsRef.current = remaining;
      if (remaining <= 0) onResolve(request, true);
      else setSecondsLeft(Math.ceil(remaining / 1000));
    }, 100);
    return () => {
      clearInterval(timer);
      remainingMsRef.current = baseRemaining - (Date.now() - startedAt);
    };
  }, [autoContinueMs, onResolve, paused, request]);

  const timerStyle: CSSProperties | undefined =
    autoContinueMs === null ? undefined : { animationDuration: `${autoContinueMs}ms` };

  return (
    <div
      className="webmcp-exp-backdrop"
      role="presentation"
      onMouseDown={() => onResolve(request, false)}
    >
      <section
        className={`webmcp-exp-dialog webmcp-exp-confirm webmcp-exp-confirm--${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="webmcp-exp-confirm-title"
        aria-describedby={options.description ? "webmcp-exp-confirm-description" : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="webmcp-exp-confirm__body">
          <span className="webmcp-exp-confirm__icon" aria-hidden="true">
            {tone === "destructive" ? "!" : "✓"}
          </span>
          <div>
            <h2 id="webmcp-exp-confirm-title">{options.title}</h2>
            {options.description ? (
              <p id="webmcp-exp-confirm-description">{options.description}</p>
            ) : null}
          </div>
        </div>
        <div className="webmcp-exp-confirm__footer">
          <button
            ref={focusRef}
            type="button"
            className="webmcp-exp-confirm__cancel"
            onClick={() => onResolve(request, false)}
          >
            {options.cancelLabel ?? "Cancel"}
          </button>
          <button
            type="button"
            className="webmcp-exp-confirm__continue"
            onClick={() => onResolve(request, true)}
          >
            {options.confirmLabel ?? "Continue"}
            {secondsLeft !== null ? ` (${secondsLeft})` : ""}
          </button>
        </div>
        {autoContinueMs !== null ? (
          <i
            className={`webmcp-exp-confirm__timer${paused ? " webmcp-exp-confirm__timer--paused" : ""}`}
            style={timerStyle}
            aria-hidden="true"
          />
        ) : null}
      </section>
    </div>
  );
}
