import type { ReactNode } from "react";

export type RigPhase = "idle" | "working" | "success" | "error";

export type RigMode = "light" | "dark" | "system";

export interface RigTheme {
  /**
   * Color scheme for every rig surface (status header, badges,
   * dialogs, drawers, toasts). "system" follows prefers-color-scheme.
   * Defaults to "light".
   */
  mode?: RigMode;
  /**
   * Brand color — used for highlights, onboarding buttons, progress
   * segments, spinners, and focus rings. Defaults to near-black in light
   * mode and near-white in dark mode.
   */
  brandColor?: string;
  /**
   * Soft tint for hover states and image placeholders. Defaults to the
   * brand color at 20% opacity.
   */
  subtleColor?: string;
}

export type ConnectionState = "unknown" | "unavailable" | "ready" | "connected";

export interface RigCapability {
  title: string;
  description: string;
}

export interface RigSnapshot {
  phase: RigPhase;
  message: string | null;
  selector: string | null;
  connection: ConnectionState;
  modelContextAvailable: boolean;
  /** Which agent browser injected the WebMCP bridge, when identifiable. */
  agent: "chatgpt" | "unknown";
  /** Human-readable name for the detected agent, e.g. "ChatGPT". */
  agentLabel: string | null;
  /** Whether the current work requested the full-screen glow overlay. */
  overlay: boolean;
}

export interface OnboardingStep {
  title: string;
  description: string;
  /** Image shown above the title, e.g. an illustration or screenshot URL. */
  image?: string;
  imageAlt?: string;
}

export interface OnboardingOptions {
  /**
   * Multi-step walkthrough shown instead of the default capability list —
   * a mobile-style onboarding: image first, then title and description,
   * with segmented progress and a Next button.
   */
  steps?: OnboardingStep[];
  /** Extra classes for the dialog panel. */
  className?: string;
  /** Extra classes for the backdrop overlay. */
  overlayClassName?: string;
  /** Backdrop color. Defaults to black. */
  overlayColor?: string;
  /** Backdrop opacity, 0–1. Defaults to 0.38. */
  overlayOpacity?: number;
  /** Label for the button on the final step. Defaults to "Got it". */
  doneLabel?: string;
  /** Label for the advance button on earlier steps. Defaults to "Next". */
  nextLabel?: string;
}

export interface HighlightOptions {
  /** Outline color of the focused element. Defaults to the accent color. */
  color?: string;
  /**
   * Dim the rest of the page while an element is focused: four solid panes
   * are laid around the target (top, left, right, bottom) so the area reads
   * as spotlit. Defaults to false.
   */
  showOverlay?: boolean;
  /** Color of the dimming panes. Defaults to black. */
  overlayColor?: string;
  /** Opacity of the dimming panes, 0–1. Defaults to 0.3. */
  overlayOpacity?: number;
}

export interface GlowOptions {
  /**
   * Gradient stop colors for the glow, blended left to right. Defaults to
   * an indigo → purple → pink → amber sweep.
   */
  colors?: string[];
  /** Color of the solid ring around the viewport edge. Defaults to pink. */
  ringColor?: string;
  /** Peak opacity of the glow layer, 0–1. The pulse breathes down from it. */
  opacity?: number;
  /**
   * Show the glow for every work run, regardless of the per-call
   * `overlay` option on startWork. Defaults to false.
   */
  always?: boolean;
}

/**
 * Visual intent of a confirmation: "positive" renders the continue button in
 * the brand color (updates, additions); "destructive" renders it red
 * (deletions, irreversible actions).
 */
export type ConfirmTone = "positive" | "destructive";

export interface ConfirmOptions {
  /** Short question naming the action, e.g. "Remove Grace Whitfield?" */
  title: string;
  /** What will happen if the person continues. */
  description?: string;
  /** Defaults to "positive". */
  tone?: ConfirmTone;
  /** Label for the continue button. Defaults to "Continue". */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to "Cancel". */
  cancelLabel?: string;
  /**
   * Continue automatically after this many milliseconds, with the remaining
   * seconds counted down on the continue button and a progress bar along the
   * dialog edge. The countdown pauses while the pointer is over the dialog.
   * Omit to wait indefinitely for a click.
   */
  autoContinueMs?: number;
}

export interface StartWorkOptions {
  /**
   * Show a full-screen ambient glow while this work runs — a pulsing
   * gradient around the viewport edges that fades out when the work
   * settles. Defaults to false.
   */
  overlay?: boolean;
}

export interface WebMCPTool<TInput = Record<string, unknown>, TResult = unknown> {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  /**
   * Example prompt a person could ask to trigger this tool, e.g.
   * "Add Bob as a contact". Shown in UX surfaces like the tools drawer;
   * never sent to the agent.
   */
  example?: string;
  /**
   * Template for a history entry logged automatically when the tool runs,
   * with `%%key%%` tokens interpolated from the tool input — e.g.
   * "Added %%name%% as a contact". Entries appear in surfaces like the
   * history drawer; never sent to the agent.
   */
  log?: string;
  /** Icon (e.g. a small inline SVG) shown beside this tool's history entries. */
  logIcon?: ReactNode;
  execute(input: TInput): TResult | Promise<TResult>;
}

export interface ToolInfo {
  name: string;
  description: string;
  example?: string | undefined;
}

export type TaskLogStatus = "success" | "error";

/** One recorded agent action, shown in surfaces like the history drawer. */
export interface TaskLogEntry {
  id: string;
  /** Human-readable summary of what happened, tokens already interpolated. */
  message: string;
  /** Icon (e.g. a small inline SVG) shown beside the entry. */
  icon?: ReactNode | undefined;
  status: TaskLogStatus;
  /** Name of the WebMCP tool that produced the entry, when known. */
  toolName?: string | undefined;
  /** Epoch milliseconds when the entry was logged. */
  timestamp: number;
}

export interface LogTaskOptions {
  /** Icon (e.g. a small inline SVG) shown beside the entry. */
  icon?: ReactNode | undefined;
  /** Defaults to "success". */
  status?: TaskLogStatus | undefined;
  /** Name of the tool the entry came from. */
  toolName?: string | undefined;
}

export interface WebMCPRegistrationOptions {
  exposedTo?: string[];
}

export interface ModelContextLike {
  registerTool<TInput, TResult>(
    tool: WebMCPTool<TInput, TResult>,
    options?: WebMCPRegistrationOptions & { signal?: AbortSignal },
  ): void | Promise<void>;
}

export interface RigApi {
  snapshot: RigSnapshot;
  startWork(message?: string, selector?: string, options?: StartWorkOptions): void;
  /** Update the visible progress message while work is running. */
  progress(message: string): void;
  focus(selector: string, message?: string): boolean;
  clearFocus(): void;
  endWork(message?: string): void;
  failWork(message?: string): void;
  /**
   * Ask the person to approve an action before the tool continues — a
   * human-in-the-loop gate. Shows a modal with cancel/continue buttons and
   * resolves true (approved) or false (cancelled). Concurrent calls queue
   * and are shown one at a time.
   */
  confirm(options: ConfirmOptions): Promise<boolean>;
  openOnboarding(): void;
  closeOnboarding(): void;
  /** UX metadata for every tool currently registered via useWebMCPTool. */
  tools: ToolInfo[];
  /** Add a tool's UX metadata; returns an unregister function. */
  registerToolInfo(info: ToolInfo): () => void;
  /**
   * Record a completed agent action in the history feed. `%%key%%` tokens
   * in the message are interpolated from `values`, e.g.
   * logTask("Added %%name%% as a contact", { name: "Bob" }, { icon: <UserIcon /> }).
   */
  logTask(
    message: string,
    values?: Record<string, unknown>,
    options?: LogTaskOptions,
  ): TaskLogEntry;
  /** Everything the agent has done on this page, newest first. */
  history: TaskLogEntry[];
  clearHistory(): void;
}

declare global {
  interface Document {
    modelContext?: ModelContextLike;
  }

  interface Navigator {
    modelContext?: ModelContextLike;
  }
}
