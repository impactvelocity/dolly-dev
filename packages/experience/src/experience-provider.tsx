"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  DEFAULT_CONNECTION_PARAM,
  DEFAULT_STORAGE_KEY,
} from "./deeplink";
import { detectAgent } from "./agent-detection";
import { ConfirmDialog, type PendingConfirm } from "./confirm-dialog";
import { getModelContext } from "./model-context";
import { formatTaskMessage } from "./task-log";
import type {
  ConfirmOptions,
  ConnectionState,
  ExperienceCapability,
  ExperienceSnapshot,
  GlowOptions,
  HighlightOptions,
  LogTaskOptions,
  OnboardingOptions,
  StartWorkOptions,
  TaskLogEntry,
  ToolInfo,
  WebMCPExperienceApi,
  WebMCPExperienceTheme,
} from "./types";

const INITIAL_SNAPSHOT: ExperienceSnapshot = {
  phase: "idle",
  message: null,
  selector: null,
  connection: "unknown",
  modelContextAvailable: false,
  agent: "unknown",
  agentLabel: null,
  overlay: false,
};

const WebMCPExperienceContext = createContext<WebMCPExperienceApi | null>(null);

/**
 * When the work toast appears:
 * - "settled" — only after work finishes, to announce what just happened
 *   (progress is expected to show in an AgentStatusHeader / AgentStatusBadge).
 * - "always" — during work as well as on completion.
 * - "none" — never; the app renders its own progress UI.
 */
export type WorkToastMode = "settled" | "always" | "none";

export interface WebMCPExperienceProviderProps {
  appName: string;
  capabilities: ExperienceCapability[];
  children: ReactNode;
  /**
   * Light/dark mode, brand color, and subtle tint for every experience
   * surface. Applied as CSS custom properties on the document root.
   */
  theme?: WebMCPExperienceTheme;
  /** @deprecated Use `theme.brandColor` instead. */
  accentColor?: string;
  connectionParam?: string;
  storageKey?: string;
  settleDuration?: number;
  /** Work toast behavior. Defaults to "settled". */
  toast?: WorkToastMode;
  /** Extra classes for the work toast, e.g. Tailwind utilities. */
  toastClassName?: string;
  /** Appearance of the full-screen work glow overlay. */
  glow?: GlowOptions;
  /** Onboarding dialog content and styling. */
  onboarding?: OnboardingOptions;
  /** Appearance of the element-focus highlight. */
  highlight?: HighlightOptions;
  /** Maximum task-log entries kept in history. Defaults to 50. */
  historyLimit?: number;
}

interface StoredConnection {
  connected: true;
  connectedAt: number;
  version: 1;
}

function readStoredConnection(storageKey: string): boolean {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return false;
    const parsed = JSON.parse(rawValue) as Partial<StoredConnection>;
    return parsed.connected === true && parsed.version === 1;
  } catch {
    return false;
  }
}

function saveConnection(storageKey: string): void {
  const value: StoredConnection = {
    connected: true,
    connectedAt: Date.now(),
    version: 1,
  };
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in hardened or private browsing contexts.
  }
}

/**
 * Readable text color for content on top of a brand-colored surface.
 * Hex colors get a luminance check; anything else defaults to white,
 * which suits the saturated colors brands typically use.
 */
function contrastColorFor(color: string): string {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())?.[1];
  if (!hex) return "#ffffff";
  const full = hex.length === 3 ? hex.replace(/./g, (char) => char + char) : hex;
  const [red, green, blue] = [0, 2, 4].map(
    (offset) => Number.parseInt(full.slice(offset, offset + 2), 16) / 255,
  );
  const luminance = 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;
  return luminance > 0.6 ? "#18181b" : "#ffffff";
}

export function WebMCPExperienceProvider({
  appName,
  capabilities,
  children,
  theme,
  accentColor,
  connectionParam = DEFAULT_CONNECTION_PARAM,
  storageKey = DEFAULT_STORAGE_KEY,
  settleDuration = 1800,
  toast = "settled",
  toastClassName,
  glow,
  onboarding,
  highlight,
  historyLimit = 50,
}: WebMCPExperienceProviderProps) {
  const [snapshot, setSnapshot] = useState<ExperienceSnapshot>(INITIAL_SNAPSHOT);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusedElementRef = useRef<HTMLElement | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const clearFocus = useCallback(() => {
    const element = focusedElementRef.current;
    if (element) {
      delete element.dataset.webmcpExperienceFocus;
      focusedElementRef.current = null;
    }
    setSnapshot((current) => ({ ...current, selector: null }));
  }, []);

  const focus = useCallback((selector: string, message?: string): boolean => {
    let element: Element | null = null;
    try {
      element = document.querySelector(selector);
    } catch {
      return false;
    }

    if (!(element instanceof HTMLElement)) return false;

    const previousElement = focusedElementRef.current;
    if (previousElement && previousElement !== element) {
      delete previousElement.dataset.webmcpExperienceFocus;
    }

    focusedElementRef.current = element;
    element.dataset.webmcpExperienceFocus = "true";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });
    setSnapshot((current) => ({
      ...current,
      message: message ?? current.message,
      selector,
    }));
    return true;
  }, []);

  const glowAlways = glow?.always ?? false;

  const startWork = useCallback((
    message = "An agent is working…",
    selector?: string,
    options?: StartWorkOptions,
  ) => {
    clearResetTimer();
    setSnapshot((current) => ({
      ...current,
      phase: "working",
      message,
      selector: selector ?? current.selector,
      overlay: glowAlways || (options?.overlay ?? false),
    }));
    if (selector) focus(selector, message);
  }, [clearResetTimer, focus, glowAlways]);

  const settle = useCallback((phase: "success" | "error", message: string) => {
    clearResetTimer();
    setSnapshot((current) => ({ ...current, phase, message }));
    resetTimerRef.current = setTimeout(() => {
      const element = focusedElementRef.current;
      if (element) delete element.dataset.webmcpExperienceFocus;
      focusedElementRef.current = null;
      setSnapshot((current) => ({
        ...current,
        phase: "idle",
        message: null,
        selector: null,
        overlay: false,
      }));
    }, settleDuration);
  }, [clearResetTimer, settleDuration]);

  const progress = useCallback((message: string) => {
    setSnapshot((current) =>
      current.phase === "working" ? { ...current, message } : current,
    );
  }, []);

  const [tools, setTools] = useState<ToolInfo[]>([]);

  const registerToolInfo = useCallback((info: ToolInfo) => {
    setTools((current) => [...current.filter((tool) => tool.name !== info.name), info]);
    return () => {
      setTools((current) => current.filter((tool) => tool.name !== info.name));
    };
  }, []);

  const [history, setHistory] = useState<TaskLogEntry[]>([]);
  const historyIdRef = useRef(0);

  const logTask = useCallback((
    message: string,
    values?: Record<string, unknown>,
    options?: LogTaskOptions,
  ): TaskLogEntry => {
    historyIdRef.current += 1;
    const entry: TaskLogEntry = {
      id: `webmcp-task-${historyIdRef.current}`,
      message: formatTaskMessage(message, values),
      icon: options?.icon,
      status: options?.status ?? "success",
      toolName: options?.toolName,
      timestamp: Date.now(),
    };
    setHistory((current) => [entry, ...current].slice(0, historyLimit));
    return entry;
  }, [historyLimit]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const endWork = useCallback((message = "Done") => settle("success", message), [settle]);
  const failWork = useCallback((message = "The action could not be completed") => settle("error", message), [settle]);

  // Human-in-the-loop confirmations. Requests queue and show one at a time;
  // each resolves its caller's promise with the person's decision.
  const [confirmQueue, setConfirmQueue] = useState<PendingConfirm[]>([]);
  const confirmIdRef = useRef(0);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      confirmIdRef.current += 1;
      setConfirmQueue((current) => [
        ...current,
        { id: confirmIdRef.current, options, resolve },
      ]);
    });
  }, []);

  const resolveConfirm = useCallback((request: PendingConfirm, approved: boolean) => {
    setConfirmQueue((current) => current.filter((entry) => entry.id !== request.id));
    request.resolve(approved);
  }, []);

  const openOnboarding = useCallback(() => setOnboardingOpen(true), []);
  const closeOnboarding = useCallback(() => setOnboardingOpen(false), []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const arrivedFromDeeplink = url.searchParams.get(connectionParam) === "true";

    if (arrivedFromDeeplink) {
      saveConnection(storageKey);
      url.searchParams.delete(connectionParam);
      window.history.replaceState(window.history.state, "", url);
      setOnboardingOpen(true);
    }

    const connected = arrivedFromDeeplink || readStoredConnection(storageKey);

    const applyDetection = (): boolean => {
      const modelContextAvailable = getModelContext() !== null;
      const agent = detectAgent();
      const connection: ConnectionState = connected
        ? "connected"
        : modelContextAvailable
          ? "ready"
          : "unavailable";

      setSnapshot((current) => ({
        ...current,
        connection,
        modelContextAvailable,
        agent: agent.brand,
        agentLabel: agent.label,
      }));
      return modelContextAvailable;
    };

    if (applyDetection()) return;

    // The agent browser injects its bridge around page load; re-check briefly
    // in case hydration won the race.
    const timers = [250, 1000, 3000].map((delay) =>
      setTimeout(() => {
        applyDetection();
      }, delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [connectionParam, storageKey]);

  const brandColor = theme?.brandColor ?? accentColor;
  const subtleColor = theme?.subtleColor;
  const mode = theme?.mode;

  useEffect(() => {
    const root = document.documentElement;
    const assignments: Array<[name: string, value: string]> = [];
    if (brandColor !== undefined) {
      // The stylesheet derives --webmcp-exp-brand (and the default subtle
      // tint) from the accent variable, so one property themes everything.
      assignments.push(["--webmcp-exp-accent", brandColor]);
      assignments.push(["--webmcp-exp-brand-contrast", contrastColorFor(brandColor)]);
    }
    if (subtleColor !== undefined) {
      assignments.push(["--webmcp-exp-subtle", subtleColor]);
    }

    const previousValues = assignments.map(([name]) => root.style.getPropertyValue(name));
    for (const [name, value] of assignments) root.style.setProperty(name, value);

    const previousMode = root.getAttribute("data-webmcp-exp-mode");
    if (mode) root.setAttribute("data-webmcp-exp-mode", mode);

    return () => {
      assignments.forEach(([name], index) => {
        const previous = previousValues[index];
        if (previous) root.style.setProperty(name, previous);
        else root.style.removeProperty(name);
      });
      if (mode) {
        if (previousMode) root.setAttribute("data-webmcp-exp-mode", previousMode);
        else root.removeAttribute("data-webmcp-exp-mode");
      }
    };
  }, [brandColor, subtleColor, mode]);

  useEffect(() => {
    const root = document.documentElement;
    if (highlight?.color) {
      root.style.setProperty("--webmcp-exp-highlight", highlight.color);
      return () => {
        root.style.removeProperty("--webmcp-exp-highlight");
      };
    }
    return undefined;
  }, [highlight?.color]);

  useEffect(() => () => {
    clearResetTimer();
    const element = focusedElementRef.current;
    if (element) delete element.dataset.webmcpExperienceFocus;
  }, [clearResetTimer]);

  const api = useMemo<WebMCPExperienceApi>(() => ({
    snapshot,
    startWork,
    progress,
    focus,
    clearFocus,
    endWork,
    failWork,
    confirm,
    openOnboarding,
    closeOnboarding,
    tools,
    registerToolInfo,
    logTask,
    history,
    clearHistory,
  }), [clearFocus, clearHistory, closeOnboarding, confirm, endWork, failWork, focus, history, logTask, openOnboarding, progress, registerToolInfo, snapshot, startWork, tools]);

  const style = (
    brandColor !== undefined ? { "--webmcp-exp-accent": brandColor } : {}
  ) as CSSProperties;

  return (
    <WebMCPExperienceContext value={api}>
      {children}
      <div className="webmcp-exp-root" style={style}>
        {highlight?.showOverlay ? (
          <FocusSpotlight selector={snapshot.selector} options={highlight} />
        ) : null}
        <GlowOverlay snapshot={snapshot} options={glow} />
        <WorkIndicator snapshot={snapshot} mode={toast} className={toastClassName} />
        {confirmQueue[0] ? (
          <ConfirmDialog
            key={confirmQueue[0].id}
            request={confirmQueue[0]}
            onResolve={resolveConfirm}
          />
        ) : null}
        {onboardingOpen ? (
          <OnboardingDialog
            appName={appName}
            capabilities={capabilities}
            connected={snapshot.connection === "connected"}
            onClose={closeOnboarding}
            options={onboarding}
          />
        ) : null}
      </div>
    </WebMCPExperienceContext>
  );
}

interface SpotlightRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

const SPOTLIGHT_PADDING = 0;

function sameRect(a: SpotlightRect | null, b: SpotlightRect | null): boolean {
  if (a === null || b === null) return a === b;
  return a.top === b.top && a.left === b.left && a.right === b.right && a.bottom === b.bottom;
}

/**
 * Four solid panes laid around the focused element (top, left, right,
 * bottom) so everything except the target is dimmed. The target is
 * re-measured every frame while active, so the panes follow smooth
 * scrolling and layout changes.
 */
function FocusSpotlight({
  selector,
  options,
}: {
  selector: string | null;
  options: HighlightOptions;
}) {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  useEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }

    let frame = 0;
    const measure = () => {
      let element: Element | null = null;
      try {
        element = document.querySelector(selector);
      } catch {
        // Invalid selector — treat as no target.
      }
      if (element instanceof HTMLElement) {
        const bounds = element.getBoundingClientRect();
        const next: SpotlightRect = {
          top: Math.max(0, bounds.top - SPOTLIGHT_PADDING),
          left: Math.max(0, bounds.left - SPOTLIGHT_PADDING),
          right: Math.min(window.innerWidth, bounds.right + SPOTLIGHT_PADDING),
          bottom: Math.min(window.innerHeight, bounds.bottom + SPOTLIGHT_PADDING),
        };
        setRect((current) => (sameRect(current, next) ? current : next));
      } else {
        setRect(null);
      }
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [selector]);

  if (!rect) return null;

  const paneStyle: CSSProperties = {
    backgroundColor: options.overlayColor ?? "#000000",
    opacity: options.overlayOpacity ?? 0.3,
  };

  return (
    <div className="webmcp-exp-spotlight" aria-hidden="true">
      <i style={{ ...paneStyle, top: 0, left: 0, right: 0, height: rect.top }} />
      <i style={{ ...paneStyle, top: rect.bottom, left: 0, right: 0, bottom: 0 }} />
      <i style={{ ...paneStyle, top: rect.top, left: 0, width: rect.left, height: rect.bottom - rect.top }} />
      <i
        style={{
          ...paneStyle,
          top: rect.top,
          left: rect.right,
          right: 0,
          height: rect.bottom - rect.top,
        }}
      />
      <i
        className="webmcp-exp-spotlight__ring"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.right - rect.left,
          height: rect.bottom - rect.top,
        }}
      />
    </div>
  );
}

function GlowOverlay({
  snapshot,
  options,
}: {
  snapshot: ExperienceSnapshot;
  options?: GlowOptions | undefined;
}) {
  if (!snapshot.overlay || snapshot.phase === "idle") return null;

  const style: CSSProperties = {
    ...(options?.colors?.length
      ? { "--webmcp-exp-glow-gradient": `linear-gradient(115deg, ${options.colors.join(", ")})` }
      : {}),
    ...(options?.ringColor ? { "--webmcp-exp-glow-border": options.ringColor } : {}),
    ...(options?.opacity !== undefined
      ? { "--webmcp-exp-glow-opacity": String(options.opacity) }
      : {}),
  } as CSSProperties;

  const active = snapshot.phase === "working";
  return (
    <div
      className={`webmcp-exp-glow${active ? " webmcp-exp-glow--active" : ""}`}
      style={style}
      aria-hidden="true"
    >
      <div className="webmcp-exp-glow__layer" />
    </div>
  );
}

function WorkIndicator({
  snapshot,
  mode,
  className,
}: {
  snapshot: ExperienceSnapshot;
  mode: WorkToastMode;
  className?: string | undefined;
}) {
  if (mode === "none") return null;
  if (snapshot.phase === "idle") return null;
  if (mode === "settled" && snapshot.phase === "working") return null;

  const classes = [
    "webmcp-exp-work",
    `webmcp-exp-work--${snapshot.phase}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="status" aria-live="polite">
      <span className="webmcp-exp-work__icon" aria-hidden="true">
        {snapshot.phase === "working" ? <i /> : snapshot.phase === "success" ? "✓" : "!"}
      </span>
      <span>{snapshot.message}</span>
    </div>
  );
}

function OnboardingDialog({
  appName,
  capabilities,
  connected,
  onClose,
  options,
}: {
  appName: string;
  capabilities: ExperienceCapability[];
  connected: boolean;
  onClose(): void;
  options?: OnboardingOptions | undefined;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const steps = options?.steps;
  const hasSteps = steps !== undefined && steps.length > 0;
  const step = hasSteps ? steps[Math.min(stepIndex, steps.length - 1)]! : null;
  const isLastStep = hasSteps && stepIndex >= steps.length - 1;

  const backdropStyle: CSSProperties = {};
  if (options?.overlayColor !== undefined || options?.overlayOpacity !== undefined) {
    const color = options.overlayColor ?? "#000000";
    const opacity = options.overlayOpacity ?? 0.38;
    backdropStyle.backgroundColor = `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
  }

  const backdropClasses = ["webmcp-exp-backdrop", options?.overlayClassName]
    .filter(Boolean)
    .join(" ");
  const dialogClasses = [
    "webmcp-exp-dialog",
    hasSteps ? "webmcp-exp-dialog--steps" : null,
    options?.className,
  ]
    .filter(Boolean)
    .join(" ");

  const advance = () => {
    if (isLastStep || !hasSteps) onClose();
    else setStepIndex((index) => index + 1);
  };

  return (
    <div className={backdropClasses} style={backdropStyle} role="presentation" onMouseDown={onClose}>
      <section
        className={dialogClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="webmcp-exp-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {hasSteps && step ? (
          <>
            <button
              ref={closeButtonRef}
              type="button"
              className="webmcp-exp-dialog__close"
              onClick={onClose}
              aria-label="Close onboarding"
            >
              ×
            </button>
            {step.image ? (
              <img
                className="webmcp-exp-dialog__image"
                src={step.image}
                alt={step.imageAlt ?? ""}
              />
            ) : null}
            <div className="webmcp-exp-step">
              <h2 id="webmcp-exp-title">{step.title}</h2>
              <p>{step.description}</p>
            </div>
            <div className="webmcp-exp-dialog__stepfooter">
              <div className="webmcp-exp-segments" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
                {steps.map((entry, index) => (
                  <i key={entry.title} className={index <= stepIndex ? "active" : undefined} />
                ))}
              </div>
              <button type="button" className="webmcp-exp-dialog__next" onClick={advance}>
                {isLastStep ? options?.doneLabel ?? "Got it" : options?.nextLabel ?? "Next"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="webmcp-exp-dialog__header">
              <div>
                <h2 id="webmcp-exp-title">Use ChatGPT with {appName}</h2>
                <p>{connected ? "ChatGPT can use the tools below on this page." : "WebMCP tools are available on this page."}</p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close onboarding">×</button>
            </div>
            <div className="webmcp-exp-capabilities">
              {capabilities.map((capability) => (
                <article key={capability.title}>
                  <span aria-hidden="true">✓</span>
                  <div><h3>{capability.title}</h3><p>{capability.description}</p></div>
                </article>
              ))}
            </div>
            <div className="webmcp-exp-dialog__footer">
              <p>Actions will be shown while they run.</p>
              <button type="button" onClick={onClose}>Got it</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export function useWebMCPExperience(): WebMCPExperienceApi {
  const context = useContext(WebMCPExperienceContext);
  if (!context) {
    throw new Error("useWebMCPExperience must be used inside WebMCPExperienceProvider");
  }
  return context;
}

/** Like useWebMCPExperience, but returns null outside the provider. */
export function useOptionalWebMCPExperience(): WebMCPExperienceApi | null {
  return useContext(WebMCPExperienceContext);
}
